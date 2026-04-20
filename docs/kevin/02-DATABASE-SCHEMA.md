# Database Schema (PostgreSQL)

> Based on `prompts/00-global.md` canonical schema. Translate ke relational tables.

## Design Principles

1. **Multi-tenant by `user_id`** — every query filters by authenticated user
2. **JSONB for flexible fields** — `meta`, `planConfig`, `notifSettings`
3. **UUID primary keys** — not serial (security + portable)
4. **Timestamps everywhere** — `created_at`, `updated_at`, `deleted_at` (soft delete)
5. **Encryption at app layer** — `access_token` stored encrypted (bytea), not relying on TDE

## Tables Overview

```
users                — owner UMKM account
├── customers       — their end-customers (salon patrons)
│   └── customer_services  — customer x category pivot with last visit date
├── categories      — service categories (Hair Smoothing, Facial, etc.)
├── templates       — WA message templates (Meta-synced)
├── reminders       — scheduled + sent reminders
├── billing_history — all billing events (subscription, topup, usage)
├── audit_logs      — admin actions audit
└── data_deletion_requests — GDPR/UU PDP deletion requests

# Admin tables
admin_users        — internal getstarvio team (separate from users)
admin_audit_log    — admin actions on user data
```

## Full Schema SQL

```sql
-- ══════════════════════════════════════════
-- USERS (UMKM owners)
-- ══════════════════════════════════════════

CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Auth
  email TEXT UNIQUE NOT NULL,
  google_sub TEXT UNIQUE,         -- Google OAuth subject ID
  
  -- Profile (matches prompts/00-global.md schema)
  biz_name TEXT,
  biz_type TEXT,                  -- 'salon' | 'spa' | 'klinik' | ...
  biz_slug TEXT UNIQUE,           -- for QR check-in URL
  biz_logo TEXT,                  -- base64 data URL (max ~200KB, store in DB for now)
  admin_name TEXT,
  admin_email TEXT,
  owner_wa TEXT,                  -- +62xxx format (E.164 w/o +)
  owner_wa_verified_at TIMESTAMPTZ,  -- null = unverified
  owner_wa_otp_pending JSONB,     -- { code, expires_at } | null
  wa_num TEXT,                    -- number used for reminder sending
  timezone TEXT DEFAULT 'Asia/Jakarta',
  country TEXT DEFAULT 'ID',
  
  -- Plan & Billing
  plan TEXT NOT NULL DEFAULT 'trial',  -- 'trial' | 'subscriber'
  sub_credits_left INT NOT NULL DEFAULT 0,
  sub_credits_max INT NOT NULL DEFAULT 0,
  topup_credits_left INT NOT NULL DEFAULT 100,  -- welcome bonus
  sub_renews_at TIMESTAMPTZ,
  trial_started_at TIMESTAMPTZ,
  trial_ends_at TIMESTAMPTZ,
  trial_used BOOLEAN NOT NULL DEFAULT false,
  rem_max INT,                    -- legacy alias
  
  -- Settings
  default_interval INT DEFAULT 30,
  automation_enabled BOOLEAN DEFAULT false,
  setup_complete BOOLEAN DEFAULT false,
  templates_reviewed_at TIMESTAMPTZ,
  qr_posted BOOLEAN DEFAULT false,
  avg_service_value INT DEFAULT 150000,  -- IDR
  billing_notifs JSONB DEFAULT '{"lowCredit":true,"criticalCredit":true,"subLow":true,"renewalReminder":true}'::jsonb,
  plan_config JSONB,              -- editable pricing if admin customizes
  
  -- Meta Connection (JSONB for flexibility)
  -- Shape: { waba: {...}, phoneNumber: {...}, business: {...}, coexistence: {...}, assets: {...} }
  meta JSONB,
  meta_access_token BYTEA,        -- AES-256-GCM encrypted (IV + ciphertext + tag)
  meta_token_expires_at TIMESTAMPTZ,  -- for refresh tracking
  
  -- Auto-top-up
  auto_topup_enabled BOOLEAN DEFAULT false,
  auto_topup_threshold INT DEFAULT 10,
  auto_topup_package TEXT DEFAULT 'p1',
  
  -- Status
  status TEXT DEFAULT 'active',   -- 'active' | 'suspended' | 'churned'
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_login_at TIMESTAMPTZ,
  deleted_at TIMESTAMPTZ          -- soft delete for GDPR
);

CREATE INDEX idx_users_email ON users(email) WHERE deleted_at IS NULL;
CREATE INDEX idx_users_google_sub ON users(google_sub);
CREATE INDEX idx_users_biz_slug ON users(biz_slug) WHERE deleted_at IS NULL;
CREATE INDEX idx_users_status ON users(status);
CREATE INDEX idx_users_meta_waba ON users USING GIN ((meta->'waba'->>'id'));


-- ══════════════════════════════════════════
-- CATEGORIES (service categories)
-- ══════════════════════════════════════════

CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  name TEXT NOT NULL,             -- 'Hair Smoothing'
  icon TEXT,                      -- emoji
  interval_days INT NOT NULL DEFAULT 30,
  template_id UUID REFERENCES templates(id),  -- FK after templates table created
  -- OR: template_name TEXT (denormalize for simpler FK mgmt)
  template_name TEXT DEFAULT 'aftercare_followup_1',  -- which template to use
  
  position INT DEFAULT 0,         -- display order
  active BOOLEAN DEFAULT true,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_categories_user ON categories(user_id);


-- ══════════════════════════════════════════
-- CUSTOMERS (end-users of UMKM owner)
-- ══════════════════════════════════════════

CREATE TABLE customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  name TEXT NOT NULL,
  wa TEXT NOT NULL,               -- '628xxxxxxxxxx' format, normalized
  via TEXT NOT NULL DEFAULT 'manual',  -- 'manual' | 'qr'
  notes TEXT,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ,
  
  UNIQUE(user_id, wa)             -- each owner can't have duplicate WA
);

CREATE INDEX idx_customers_user ON customers(user_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_customers_wa ON customers(wa) WHERE deleted_at IS NULL;


-- ══════════════════════════════════════════
-- CUSTOMER_SERVICES (customer's visit history per category)
-- ══════════════════════════════════════════

CREATE TABLE customer_services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  
  last_visit_date DATE NOT NULL,  -- tanggal kunjungan terakhir
  interval_days INT NOT NULL,     -- snapshot dari category.interval_days
  
  -- Next reminder calculation (computed, updated when last_visit_date changes)
  next_reminder_at TIMESTAMPTZ GENERATED ALWAYS AS 
    (last_visit_date + (interval_days || ' days')::interval) STORED,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  UNIQUE(customer_id, category_id)
);

CREATE INDEX idx_customer_services_customer ON customer_services(customer_id);
CREATE INDEX idx_customer_services_category ON customer_services(category_id);
CREATE INDEX idx_customer_services_next_reminder ON customer_services(next_reminder_at)
  WHERE next_reminder_at IS NOT NULL;


-- ══════════════════════════════════════════
-- TEMPLATES (WhatsApp message templates)
-- ══════════════════════════════════════════

CREATE TABLE templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  name TEXT NOT NULL,             -- 'aftercare_followup_1' (immutable after Meta submit)
  category TEXT NOT NULL,         -- 'UTILITY' | 'MARKETING' | 'AUTHENTICATION'
  language TEXT NOT NULL DEFAULT 'id',
  body TEXT NOT NULL,
  example JSONB,                  -- { body_text: [["Sarah", "Hair Smoothing", ...]] }
  
  -- Meta sync fields
  meta_template_id TEXT,          -- Meta's own template ID (after submit)
  status TEXT NOT NULL DEFAULT 'DRAFT',  -- 'DRAFT' | 'PENDING' | 'APPROVED' | 'REJECTED' | 'PAUSED' | 'FLAGGED'
  status_reason TEXT,             -- kalau REJECTED, kenapa
  meta_submitted_at TIMESTAMPTZ,
  meta_approved_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  UNIQUE(user_id, name)
);

CREATE INDEX idx_templates_user ON templates(user_id);
CREATE INDEX idx_templates_meta_id ON templates(meta_template_id);
CREATE INDEX idx_templates_status ON templates(status);


-- ══════════════════════════════════════════
-- REMINDERS (scheduled + sent reminders)
-- ══════════════════════════════════════════

CREATE TABLE reminders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  template_id UUID REFERENCES templates(id),
  
  -- Message details
  customer_name_snapshot TEXT NOT NULL,   -- in case customer renamed
  service_name_snapshot TEXT NOT NULL,
  body_rendered TEXT,                     -- final body with variables substituted
  
  -- Scheduling
  scheduled_at TIMESTAMPTZ NOT NULL,
  sent_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  read_at TIMESTAMPTZ,
  
  -- Status
  status TEXT NOT NULL DEFAULT 'pending',  -- 'pending' | 'terkirim' | 'gagal' | 'dibatalkan'
  error_code TEXT,
  error_message TEXT,
  
  -- Meta message ID (untuk track via webhook)
  meta_message_id TEXT,
  
  -- Cost
  credit_used INT NOT NULL DEFAULT 1,
  
  -- Retry tracking
  retry_count INT DEFAULT 0,
  last_retry_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_reminders_user ON reminders(user_id);
CREATE INDEX idx_reminders_customer ON reminders(customer_id);
CREATE INDEX idx_reminders_status ON reminders(status);
CREATE INDEX idx_reminders_scheduled ON reminders(scheduled_at) WHERE status = 'pending';
CREATE INDEX idx_reminders_meta_msg_id ON reminders(meta_message_id);


-- ══════════════════════════════════════════
-- BILLING_HISTORY (all billing events)
-- ══════════════════════════════════════════

CREATE TABLE billing_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  type TEXT NOT NULL,             -- 'welcome' | 'subscription' | 'topup' | 'usage' | 'refund'
  label TEXT NOT NULL,
  delta INT NOT NULL,             -- + credit added, - credit used
  bal_after INT NOT NULL,
  note TEXT,
  
  -- If linked to Stripe
  stripe_payment_intent_id TEXT,
  amount_idr INT,                 -- Rp paid, if any
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_billing_history_user ON billing_history(user_id);
CREATE INDEX idx_billing_history_date ON billing_history(date);


-- ══════════════════════════════════════════
-- AUDIT_LOGS (user-level audit)
-- ══════════════════════════════════════════

CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  actor_id UUID,                  -- admin who performed, null if user themselves
  action TEXT NOT NULL,           -- 'template_submit', 'customer_delete', etc.
  resource_type TEXT,             -- 'template' | 'customer' | ...
  resource_id UUID,
  details JSONB,
  ip_address INET,
  user_agent TEXT,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);
CREATE INDEX idx_audit_logs_created ON audit_logs(created_at);


-- ══════════════════════════════════════════
-- DATA_DELETION_REQUESTS (GDPR/UU PDP)
-- ══════════════════════════════════════════

CREATE TABLE data_deletion_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  email TEXT NOT NULL,
  
  requested_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  verified_at TIMESTAMPTZ,
  scheduled_deletion_at TIMESTAMPTZ,  -- 30 days from verified
  deleted_at TIMESTAMPTZ,
  
  status TEXT DEFAULT 'requested',    -- 'requested' | 'verified' | 'in_progress' | 'completed' | 'cancelled'
  reason TEXT,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_data_deletion_user ON data_deletion_requests(user_id);
CREATE INDEX idx_data_deletion_email ON data_deletion_requests(email);


-- ══════════════════════════════════════════
-- ADMIN_USERS (getstarvio internal team)
-- ══════════════════════════════════════════

CREATE TABLE admin_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,     -- must end with @getstarvio.com
  name TEXT NOT NULL,
  password_hash TEXT,             -- bcrypt (backup auth, not primary)
  role TEXT NOT NULL DEFAULT 'viewer',  -- 'viewer' | 'admin' | 'superadmin'
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_login_at TIMESTAMPTZ,
  suspended_at TIMESTAMPTZ
);

CREATE INDEX idx_admin_users_email ON admin_users(email);


-- ══════════════════════════════════════════
-- ADMIN_AUDIT_LOG
-- ══════════════════════════════════════════

CREATE TABLE admin_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID REFERENCES admin_users(id),
  admin_email TEXT NOT NULL,
  
  action TEXT NOT NULL,           -- 'impersonate_user', 'add_credit', 'suspend_user', ...
  target_user_id UUID REFERENCES users(id),
  details JSONB,
  ip_address INET,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_admin_audit_admin ON admin_audit_log(admin_id);
CREATE INDEX idx_admin_audit_target ON admin_audit_log(target_user_id);
CREATE INDEX idx_admin_audit_action ON admin_audit_log(action);


-- ══════════════════════════════════════════
-- WEBHOOK_EVENTS (idempotency + debugging)
-- ══════════════════════════════════════════

CREATE TABLE webhook_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  external_id TEXT UNIQUE,        -- Meta's own event ID kalau ada
  source TEXT NOT NULL,           -- 'meta_whatsapp' | 'stripe' | ...
  event_type TEXT NOT NULL,       -- 'message.delivered', 'template.approved', etc.
  payload JSONB NOT NULL,
  
  received_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  processed_at TIMESTAMPTZ,
  processing_error TEXT,
  retry_count INT DEFAULT 0
);

CREATE INDEX idx_webhook_events_source_type ON webhook_events(source, event_type);
CREATE INDEX idx_webhook_events_unprocessed ON webhook_events(received_at)
  WHERE processed_at IS NULL;


-- ══════════════════════════════════════════
-- TRIGGERS
-- ══════════════════════════════════════════

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_customers_updated_at BEFORE UPDATE ON customers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_categories_updated_at BEFORE UPDATE ON categories
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
-- ... etc
```

## Prisma Schema (if using Node.js)

Save as `prisma/schema.prisma`:

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id                   String       @id @default(uuid()) @db.Uuid
  email                String       @unique
  googleSub            String?      @unique @map("google_sub")
  
  bizName              String?      @map("biz_name")
  bizType              String?      @map("biz_type")
  bizSlug              String?      @unique @map("biz_slug")
  bizLogo              String?      @map("biz_logo")
  adminName            String?      @map("admin_name")
  ownerWa              String?      @map("owner_wa")
  ownerWaVerifiedAt    DateTime?    @map("owner_wa_verified_at")
  ownerWaOtpPending    Json?        @map("owner_wa_otp_pending")

  // PIN Admin — 4-digit secondary auth for critical actions
  // IMPORTANT: Hash with bcrypt/argon2 BEFORE storing. NEVER store plain PIN.
  // Field stores the hash (e.g., bcrypt with cost 10). Plain-PIN comparison happens at API layer.
  adminPinHash         String?      @map("admin_pin_hash")
  adminPinSetAt        DateTime?    @map("admin_pin_set_at")
  notifLastSeenAt      DateTime?    @map("notif_last_seen_at")

  waNum                String?      @map("wa_num")
  timezone             String       @default("Asia/Jakarta")
  country              String       @default("ID")
  
  plan                 String       @default("trial")
  subCreditsLeft       Int          @default(0) @map("sub_credits_left")
  subCreditsMax        Int          @default(0) @map("sub_credits_max")
  topupCreditsLeft     Int          @default(100) @map("topup_credits_left")
  subRenewsAt          DateTime?    @map("sub_renews_at")
  trialStartedAt       DateTime?    @map("trial_started_at")
  trialEndsAt          DateTime?    @map("trial_ends_at")
  trialUsed            Boolean      @default(false) @map("trial_used")
  
  defaultInterval      Int?         @default(30) @map("default_interval")
  automationEnabled    Boolean      @default(false) @map("automation_enabled")
  setupComplete        Boolean      @default(false) @map("setup_complete")
  templatesReviewedAt  DateTime?    @map("templates_reviewed_at")
  qrPosted             Boolean      @default(false) @map("qr_posted")
  avgServiceValue      Int          @default(150000) @map("avg_service_value")
  
  meta                 Json?
  metaAccessToken      Bytes?       @map("meta_access_token")
  metaTokenExpiresAt   DateTime?    @map("meta_token_expires_at")
  
  billingNotifs        Json?        @map("billing_notifs")
  planConfig           Json?        @map("plan_config")
  
  autoTopupEnabled     Boolean      @default(false) @map("auto_topup_enabled")
  autoTopupThreshold   Int          @default(10) @map("auto_topup_threshold")
  autoTopupPackage     String       @default("p1") @map("auto_topup_package")
  
  status               String       @default("active")

  // === ADMIN-GRANTED FREE SUBSCRIPTION ===
  // Set via admin panel for: beta testers, partnerships, churn recovery, bug apology, etc.
  // When grantedSubEndsAt > now(): treat user as subscriber for billing/access gates
  // (ignore plan='trial'). Additive to paid subscription (not replacement).
  grantedSubEndsAt     DateTime?    @map("granted_sub_ends_at")
  grantedBy            String?      @map("granted_by")           // admin email
  grantReason          String?      @map("grant_reason")         // enum: beta_tester|partnership|churn_recovery|bug_apology|internal_demo|early_adopter|other
  grantNote            String?      @map("grant_note")           // required if reason='other'
  grantDays            Int?         @map("grant_days")           // snapshot at grant time (for MRR lost calc)
  grantedAt            DateTime?    @map("granted_at")           // when grant was issued

  createdAt            DateTime     @default(now()) @map("created_at")
  updatedAt            DateTime     @updatedAt @map("updated_at")
  lastLoginAt          DateTime?    @map("last_login_at")
  deletedAt            DateTime?    @map("deleted_at")
  
  customers            Customer[]
  categories           Category[]
  templates            Template[]
  reminders            Reminder[]
  billingHistory       BillingHistory[]
  auditLogs            AuditLog[]
  
  @@index([email])
  @@index([googleSub])
  @@index([bizSlug])
  @@map("users")
}

// ... lainnya similar pattern
```

Full Prisma schema generated dari SQL di atas — Kevin bisa translate manual atau use a tool.

## Migration Strategy

### Initial migration (Sprint 1 Day 1)
```bash
# Prisma
npx prisma migrate dev --name init

# SQLAlchemy / Alembic
alembic revision --autogenerate -m "init"
alembic upgrade head

# Go migrate
migrate create -ext sql -dir migrations init
migrate -path migrations -database "${DATABASE_URL}" up
```

### Follow-up migrations
- 1 migration per feature (atomic)
- Always test di staging first
- Never drop column in prod without backup

## Query Patterns

### Get user with meta connection
```sql
SELECT id, biz_name, plan,
       meta->>'waba' as waba_data,
       meta->'phoneNumber'->>'displayNumber' as phone_display
FROM users
WHERE id = $1 AND deleted_at IS NULL;
```

### Find due reminders
```sql
SELECT r.*, c.name as customer_name, c.wa as customer_wa
FROM customer_services cs
JOIN customers c ON c.id = cs.customer_id
JOIN categories cat ON cat.id = cs.category_id
LEFT JOIN reminders r ON r.customer_id = cs.customer_id 
  AND r.category_id = cs.category_id
  AND r.scheduled_at::date = CURRENT_DATE
WHERE cs.next_reminder_at <= NOW() + INTERVAL '1 hour'
  AND c.deleted_at IS NULL
  AND r.id IS NULL  -- belum ada reminder untuk hari ini
LIMIT 100;
```

### Multi-tenant safety check (REQUIRED)
Semua query pasti include user_id:
```typescript
// ❌ BAD
const customers = await prisma.customer.findMany({ where: { deletedAt: null } })

// ✅ GOOD
const customers = await prisma.customer.findMany({ 
  where: { userId: currentUser.id, deletedAt: null } 
})
```

## Backup Strategy

### Daily pg_dump (cron on droplet)
```bash
# /etc/cron.daily/pg-backup
#!/bin/bash
BACKUP_DIR=/home/deploy/backups
mkdir -p $BACKUP_DIR
pg_dump -U deploy getstarvio_prod | gzip > $BACKUP_DIR/prod-$(date +%Y%m%d).sql.gz
# Keep last 30 days
find $BACKUP_DIR -name "prod-*.sql.gz" -mtime +30 -delete
```

Optional: upload to DO Spaces ($5/mo, off-site backup).

### Restore procedure (documented!)
```bash
gunzip -c /home/deploy/backups/prod-20260428.sql.gz | psql -U deploy getstarvio_restored
```

## Seed Data for Development

Create `prisma/seed.ts` (or equivalent):
```typescript
import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  // Create test user matching mockup DUMMY
  await prisma.user.upsert({
    where: { email: 'meta_reviewer@getstarvio.com' },
    update: {},
    create: {
      email: 'meta_reviewer@getstarvio.com',
      googleSub: 'test-google-sub-001',
      bizName: 'Demo Business',
      bizType: 'spa',
      bizSlug: 'demo-business',
      plan: 'subscriber',
      subCreditsLeft: 225,
      subCreditsMax: 300,
      topupCreditsLeft: 50,
      // ... full populate per DUMMY
    }
  })
}

main().catch(console.error).finally(() => prisma.$disconnect())
```

Run:
```bash
npm run db:seed
```

## Performance Tuning for 1GB Droplet

`postgresql.conf`:
```
shared_buffers = 128MB
work_mem = 4MB
maintenance_work_mem = 32MB
effective_cache_size = 512MB
max_connections = 25
```

App connection pool:
```typescript
// Prisma
const prisma = new PrismaClient({
  datasources: { db: { url: process.env.DATABASE_URL } },
  log: ['query', 'error', 'warn'],
})
// Default pool size untuk Prisma = numCPUs * 2 + 1 — ok for 1 CPU droplet (=3)
```

## Data Retention

- `reminders` older than 90 days → archive to `reminders_archive` (cold storage)
- `audit_logs` older than 365 days → archive
- `webhook_events` older than 30 days → delete (already processed)
- `billing_history` — keep forever (tax compliance)
