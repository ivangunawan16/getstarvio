# API Contract (REST, JSON)

> **Canonical** — Okta's FE integrates against this. Kalau ada perubahan, update doc + post ke WA group ASAP.

## Conventions

- **Base URL:** `https://api.getstarvio.com` (prod), `http://localhost:3001` (dev)
- **API versioning:** `/v1/*` prefix (optional but recommended for future)
- **Auth:** Bearer token (`Authorization: Bearer <jwt>`) OR cookie (`getstarvio_session`)
- **Content type:** `application/json`
- **Response envelope:**
  - Success: `{ data: ... }` OR direct object
  - Error: `{ error: true, code: 'X', message: '...', details?: {...} }`
- **HTTP status:**
  - 200 OK, 201 Created, 204 No Content
  - 400 Bad Request, 401 Unauthorized, 403 Forbidden, 404 Not Found, 409 Conflict
  - 422 Validation Error (with `details` field)
  - 429 Rate Limited, 500 Server Error, 503 Service Unavailable

## Error Codes (canonical)

| Code | HTTP | Description |
|---|---|---|
| `AUTH_REQUIRED` | 401 | No token atau invalid |
| `SESSION_EXPIRED` | 401 | Token expired |
| `INSUFFICIENT_PERMISSION` | 403 | Not admin, not owner, etc. |
| `NOT_FOUND` | 404 | Resource doesn't exist |
| `VALIDATION_FAILED` | 422 | Input validation error |
| `DUPLICATE_ENTRY` | 409 | Unique constraint violation |
| `META_API_ERROR` | 502 | Meta API returned error |
| `META_QUOTA_EXCEEDED` | 429 | Messaging limit hit |
| `WEBHOOK_SIGNATURE_INVALID` | 401 | Meta webhook signature fail |
| `INSUFFICIENT_CREDITS` | 402 | Not enough credits to send |
| `TRIAL_EXPIRED` | 402 | Trial ended, subscribe required |
| `RATE_LIMITED` | 429 | Too many requests |
| `INTERNAL_ERROR` | 500 | Generic server error |

## Endpoints

### ═══════════════════════════════════════════
### AUTH
### ═══════════════════════════════════════════

#### `GET /auth/google`
Initiate Google OAuth flow. Redirects user to Google.

**Query:** `redirect_to` (optional) — where to send back after success.

**Response:** HTTP 302 redirect to Google consent screen.

---

#### `GET /auth/google/callback`
Google OAuth callback. Backend handles.

**Query:** `code`, `state` from Google.

**Behavior:**
1. Exchange code → Google tokens
2. Fetch user profile (email, name, sub)
3. Upsert user in DB
4. Generate JWT session
5. Set cookie `getstarvio_session=<jwt>; HttpOnly; Secure; SameSite=Lax; Domain=.getstarvio.com`
6. Redirect to `<frontend>/dashboard` (or `redirect_to` if provided)

---

#### `POST /auth/logout`
End session.

**Auth:** required

**Response:** 204 + clear cookie

---

#### `GET /me`
Get current authenticated user.

**Auth:** required

**Response 200:**
```json
{
  "id": "uuid",
  "email": "cynthia@gmail.com",
  "bizName": "Celestial Spa & Wellness",
  "bizType": "spa",
  "bizSlug": "celestial-spa-wellness",
  "bizLogo": null,
  "adminName": "Cynthia",
  "ownerWa": "628123456789",
  "ownerWaVerifiedAt": "2026-03-16T10:15:00Z",
  "waNum": "628987654321",
  "timezone": "Asia/Jakarta",
  "country": "ID",
  "plan": "subscriber",
  "subCreditsLeft": 225,
  "subCreditsMax": 300,
  "topupCreditsLeft": 50,
  "remLeft": 275,
  "subRenewsAt": "2026-05-15T00:00:00Z",
  "trialEndsAt": null,
  "trialUsed": true,
  "trialExpired": false,
  "automationEnabled": true,
  "setupComplete": true,
  "templatesReviewedAt": "2026-03-15T11:00:00Z",
  "qrPosted": true,
  "avgServiceValue": 175000,
  "meta": { 
    "connectedAt": "2026-03-15T10:30:00Z",
    "coexistenceEnabled": true,
    "waba": { "id": "105783024692731", ... },
    "phoneNumber": { ... },
    "business": { ... },
    "coexistence": { ... }
  },
  "status": "active",
  "createdAt": "2026-01-15T00:00:00Z"
}
```

---

#### `PATCH /me`
Update profile.

**Auth:** required
**Body (any subset):**
```json
{
  "bizName": "...",
  "bizType": "...",
  "bizLogo": "data:image/png;base64,...",
  "adminName": "...",
  "ownerWa": "628...",
  "timezone": "Asia/Jakarta",
  "avgServiceValue": 175000,
  "automationEnabled": true,
  "qrPosted": true,
  "billingNotifs": { ... }
}
```

**Response 200:** updated user object

---

### ═══════════════════════════════════════════
### META INTEGRATION
### ═══════════════════════════════════════════

#### `POST /meta/embedded-signup/exchange`
Exchange Embedded Signup code for access token + store connection.

**Auth:** required
**Body:**
```json
{
  "code": "AQDxyz123...",
  "waba_id": "105783024692731",
  "phone_number_id": "698201013402857",
  "business_id": "492187365201744"
}
```

**Behavior:**
1. Exchange code → long-lived access token via Meta OAuth
2. Fetch `/{phone_number_id}` → displayNumber, verifiedName, qualityRating, tier
3. Fetch `/{waba_id}` → name, currency, timezoneId, templateNamespace
4. Fetch `/{business_id}` → portfolioName, verificationStatus
5. Encrypt access token (AES-256-GCM)
6. Save ke `users.meta` (JSONB) + `users.meta_access_token` (bytea)
7. Subscribe webhook untuk WABA
8. Return connection details

**Response 200:**
```json
{
  "success": true,
  "meta": {
    "waba": {
      "id": "105783024692731",
      "name": "Celestial Spa WABA",
      "currency": "IDR",
      "templateNamespace": "abc-def-123"
    },
    "phoneNumber": {
      "id": "698201013402857",
      "displayNumber": "+62 812 3456 7890",
      "verifiedName": "Celestial Spa & Wellness",
      "qualityRating": "GREEN",
      "messagingLimitTier": "TIER_1K"
    },
    "business": {
      "id": "492187365201744",
      "portfolioName": "Celestial Spa Business Portfolio",
      "verificationStatus": "VERIFIED"
    },
    "coexistence": {
      "enabled": true,
      "syncWindowEndsAt": "2026-04-20T10:30:00Z"
    }
  }
}
```

**Errors:**
- `META_API_ERROR` — kalau exchange/fetch fail
- `DUPLICATE_ENTRY` — WABA sudah connected ke user lain

---

#### `GET /meta/connection`
Get current Meta connection for authenticated user. (Alias untuk `GET /me` focused only on meta.)

**Auth:** required
**Response 200:** `meta` object dari user, or `null` kalau belum onboard.

---

#### `POST /meta/disconnect`
Offboard WABA from getstarvio.

**Auth:** required
**Behavior:** revoke access token, unsubscribe webhook, null `users.meta`

**Response 204**

---

#### `POST /meta/coexistence/sync-contacts`
Trigger one-time contact sync dari WA Business app.

**Auth:** required
**Behavior:** call `POST /{phone_number_id}/smb_app_data` dengan `sync_type: "smb_app_state_sync"`

**Response 202:** `{ status: "sync_initiated" }`

---

#### `POST /meta/coexistence/sync-history`
Trigger one-time message history sync (within 24h window after signup).

**Auth:** required
**Response 202**

**Errors:** `META_API_ERROR` kalau sudah lewat 24h window

---

### ═══════════════════════════════════════════
### CATEGORIES
### ═══════════════════════════════════════════

#### `GET /categories`
List all categories for current user.

**Auth:** required
**Query:** `active=true|false` (optional)
**Response 200:** `Category[]`

Each Category:
```json
{
  "id": "uuid",
  "name": "Hair Smoothing",
  "icon": "💇",
  "intervalDays": 90,
  "templateName": "aftercare_followup_1",
  "position": 0,
  "active": true,
  "customerCount": 12
}
```

---

#### `POST /categories`
**Auth:** required
**Body:**
```json
{
  "name": "Hair Color",
  "icon": "🎨",
  "intervalDays": 60,
  "templateName": "aftercare_followup_2"
}
```
**Response 201:** Category

---

#### `PUT /categories/:id`
Update. **Auth:** required. Same body as create.

---

#### `DELETE /categories/:id`
Soft delete. **Auth:** required. Fails if customers still use this category.

---

### ═══════════════════════════════════════════
### CUSTOMERS
### ═══════════════════════════════════════════

#### `GET /customers`
**Auth:** required
**Query:**
- `status=aktif|mendekati|hilang` (filter by worstStatus)
- `search=<name or wa>`
- `sort=urgent|name_asc|oldest|newest`
- `page=1&limit=50`

**Response 200:**
```json
{
  "data": [Customer, ...],
  "pagination": {
    "page": 1,
    "limit": 50,
    "total": 150,
    "hasMore": true
  }
}
```

Customer:
```json
{
  "id": "uuid",
  "name": "Sarah",
  "wa": "628xxx",
  "via": "manual",
  "services": [
    {
      "categoryId": "uuid",
      "categoryName": "Hair Smoothing",
      "icon": "💇",
      "lastVisitDate": "2026-03-15",
      "intervalDays": 90,
      "nextReminderAt": "2026-06-13T00:00:00Z",
      "status": "aktif"
    }
  ],
  "worstStatus": "aktif",
  "createdAt": "2026-02-01T00:00:00Z"
}
```

---

#### `POST /customers`
**Auth:** required
**Body:**
```json
{
  "name": "Sarah",
  "wa": "628xxx",
  "via": "manual",
  "services": [
    { "categoryId": "uuid", "lastVisitDate": "2026-03-15" }
  ]
}
```

**Response 201:** Customer

**Errors:** 
- `DUPLICATE_ENTRY` — WA sudah terdaftar
- `VALIDATION_FAILED` — WA format salah atau services kosong

---

#### `GET /customers/:id`
**Auth:** required
**Response 200:** Customer (full detail including reminders history)

---

#### `PUT /customers/:id`
Update. **Auth:** required.

---

#### `DELETE /customers/:id`
Soft delete. **Auth:** required.

---

#### `POST /customers/import`
Bulk CSV import.

**Auth:** required
**Body:** `multipart/form-data` dengan file
**Response 200:**
```json
{
  "imported": 45,
  "skipped": 3,
  "errors": [
    { "row": 12, "reason": "Invalid WA format" }
  ]
}
```

---

### ═══════════════════════════════════════════
### TEMPLATES
### ═══════════════════════════════════════════

#### `GET /templates`
List user's templates. **Auth:** required.
**Query:** `status=APPROVED|PENDING|...`, `category=UTILITY|...`
**Response 200:** `Template[]`

Template:
```json
{
  "id": "uuid",
  "name": "aftercare_followup_1",
  "category": "UTILITY",
  "language": "id",
  "body": "Hi {{1}}, {{2}} kamu...",
  "example": { "body_text": [["Sarah", "Hair Smoothing", "15 Maret 2026", "Salon Celestial"]] },
  "metaTemplateId": "9876543210",
  "status": "APPROVED",
  "statusReason": null,
  "metaSubmittedAt": "2026-04-10T08:00:00Z",
  "metaApprovedAt": "2026-04-10T09:24:00Z"
}
```

---

#### `POST /templates`
Submit new template to Meta.

**Auth:** required
**Body:**
```json
{
  "name": "aftercare_followup_1",
  "category": "UTILITY",
  "language": "id",
  "body": "Hi {{1}}, {{2}} kamu...",
  "example": { "body_text": [["Sarah", "Hair Smoothing", "15 Maret 2026", "Salon Celestial"]] }
}
```

**Behavior:**
1. Validate body + example (body has `{{N}}` → example.body_text har values for each)
2. Decrypt user's access token
3. Call `POST /{WABA_ID}/message_templates`
4. Save to DB dengan status='PENDING'
5. Return

**Response 201:** Template object

**Errors:**
- `VALIDATION_FAILED` — body/example mismatch
- `META_API_ERROR` — Meta rejected at submission time
- `DUPLICATE_ENTRY` — template name already exists for this user

---

#### `GET /templates/:id/payload`
Preview exact JSON payload yang akan di-submit ke Meta.

**Auth:** required
**Response 200:**
```json
{
  "endpoint": "POST https://graph.facebook.com/v21.0/105783024692731/message_templates",
  "body": {
    "name": "aftercare_followup_1",
    "category": "UTILITY",
    "language": "id",
    "components": [
      {
        "type": "BODY",
        "text": "Hi {{1}}, {{2}} kamu...",
        "example": { "body_text": [["Sarah", "Hair Smoothing", "15 Maret 2026", "Salon Celestial"]] }
      }
    ]
  }
}
```

---

#### `PUT /templates/:id`
Update template (triggers re-submit to Meta).

**Auth:** required
**Body:** same as POST (kecuali `name` yang immutable)
**Response 200**

---

#### `DELETE /templates/:id`
Delete from Meta + DB.

**Auth:** required
**Response 204**

---

### ═══════════════════════════════════════════
### VISITS + REMINDERS
### ═══════════════════════════════════════════

#### `POST /visits`
Record customer visit (dari Catat Kunjungan page).

**Auth:** required
**Body:**
```json
{
  "customerId": "uuid",
  "categoryIds": ["cat-uuid-1", "cat-uuid-2"],
  "date": "2026-04-19"
}
```

**Behavior:** Update `customer_services.last_visit_date` untuk kategori yang dikerjakan. Recalculate `next_reminder_at`.

**Response 200:** updated customer with services

---

#### `GET /reminders`
List reminders with filters.

**Auth:** required
**Query:**
- `status=pending|terkirim|gagal`
- `from=YYYY-MM-DD&to=YYYY-MM-DD`
- `page=1&limit=50`

**Response 200:**
```json
{
  "data": [Reminder, ...],
  "pagination": { ... }
}
```

Reminder:
```json
{
  "id": "uuid",
  "customerId": "uuid",
  "customerName": "Sarah",
  "customerWa": "628xxx",
  "categoryName": "Hair Smoothing",
  "templateName": "aftercare_followup_1",
  "scheduledAt": "2026-06-13T09:00:00Z",
  "sentAt": "2026-06-13T09:00:12Z",
  "deliveredAt": "2026-06-13T09:00:14Z",
  "status": "terkirim",
  "errorMessage": null,
  "creditUsed": 1,
  "metaMessageId": "wamid.HBgNNjI4..."
}
```

---

#### `POST /reminders/:id/retry`
Retry a failed reminder.

**Auth:** required
**Response 200:** updated reminder

**Errors:** 
- `INSUFFICIENT_CREDITS`
- `TRIAL_EXPIRED`

---

### ═══════════════════════════════════════════
### BILLING
### ═══════════════════════════════════════════

#### `GET /billing`
Get current billing state.

**Auth:** required
**Response 200:**
```json
{
  "plan": "subscriber",
  "subCreditsLeft": 225,
  "subCreditsMax": 300,
  "topupCreditsLeft": 50,
  "remLeft": 275,
  "subRenewsAt": "2026-05-15",
  "autoTopup": {
    "enabled": false,
    "threshold": 10,
    "packageId": "p1"
  },
  "history": [
    {
      "date": "2026-04-15",
      "type": "subscription",
      "label": "Renewal bulanan",
      "delta": 300,
      "balAfter": 300,
      "note": "Early Access 50% off"
    }
  ]
}
```

---

#### `POST /billing/subscribe`
Start subscription (Stripe).

**Auth:** required
**Body:** `{ packageId: 'monthly' | 'bundle' }`
**Response 200:** `{ clientSecret: '...', paymentIntentId: '...' }` for FE to complete Stripe Elements

---

#### `POST /billing/topup`
Buy top-up credits.

**Auth:** required
**Body:** `{ tierIndex: 0 | 1 | 2 }`
**Response 200:** Stripe payment intent

---

### ═══════════════════════════════════════════
### WEBHOOKS (Meta)
### ═══════════════════════════════════════════

#### `GET /webhooks/meta`
Webhook verification challenge.

**Query:** `hub.mode`, `hub.challenge`, `hub.verify_token`

**Behavior:** kalau `hub.verify_token` match `META_WEBHOOK_VERIFY_TOKEN`, return `hub.challenge`.

---

#### `POST /webhooks/meta`
Receive Meta events.

**Headers:** `X-Hub-Signature-256: sha256=<hash>`

**Behavior:**
1. Verify signature (HMAC SHA-256 dengan `META_APP_SECRET`)
2. Route berdasarkan `entry[0].changes[0].field`:
   - `messages` — update reminder status
   - `message_template_status_update` — update template status
   - `account_update` — update user meta data
   - `smb_app_state_sync` — contact sync done
   - `smb_message_echoes` — process manual WA messages
3. Return 200 OK within 20 seconds (Meta timeout)

**Response:** 200 OK always (kalau signature valid)

Detail di `04-META-INTEGRATION.md`.

---

### ═══════════════════════════════════════════
### PUBLIC (no auth)
### ═══════════════════════════════════════════

#### `GET /public/checkin/:slug`
Get business info for check-in page.

**Response 200:**
```json
{
  "bizName": "Celestial Spa & Wellness",
  "bizLogo": "data:image/png;base64,...",
  "categories": [
    { "id": "uuid", "name": "Facial", "icon": "💆" },
    ...
  ]
}
```

**Errors:** `NOT_FOUND` kalau slug invalid

---

#### `POST /public/checkin/:slug`
Register customer via QR check-in.

**Body:**
```json
{
  "name": "New Customer",
  "wa": "628xxx",
  "services": [{ "categoryId": "uuid" }]
}
```

**Response 201**

---

### ═══════════════════════════════════════════
### ADMIN (gated)
### ═══════════════════════════════════════════

Admin endpoints under `/admin/*`. Auth: special admin JWT (separate from user JWT).

#### `POST /admin/login`
Email + password (for Meta reviewer fallback).
**Body:** `{ email, password }`
**Response 200:** `{ token, adminUser }`

---

#### `GET /admin/businesses`
List all business accounts. **Auth:** admin only.
**Query:** `status=active|suspended|churned&q=<search>`
**Response 200:** paginated

---

#### `POST /admin/businesses/:id/impersonate`
Login as user. Returns user-level JWT with `impersonatedBy` claim.
**Auth:** admin only.
**Response 200:** `{ userToken, expiresIn: 3600 }`

**Audit:** logged to `admin_audit_log`.

---

#### `POST /admin/businesses/:id/suspend`
Suspend user account.
**Auth:** admin.
**Body:** `{ reason }`
**Response 204**

---

#### `POST /admin/businesses/:id/add-credit`
Add manual credit. Password-gated.
**Auth:** admin + password confirm.
**Body:** `{ amount, type: 'topup', note, password }`
**Response 200:** new balance

---

#### `GET /admin/audit-log`
**Auth:** admin.
**Query:** `adminId=`, `targetUserId=`, `action=`, `from=`, `to=`
**Response 200:** paginated

---

### ═══════════════════════════════════════════
### DATA DELETION (GDPR / UU PDP)
### ═══════════════════════════════════════════

#### `DELETE /me/data`
Request full account + data deletion.

**Auth:** required
**Behavior:**
1. Create `data_deletion_requests` row with `status='requested'`
2. Send email verification link ke user
3. On verify: status='verified', schedule for 30 days later
4. Cron job: after 30 days, actually delete user + related data + revoke Meta token
5. Send confirmation email

**Response 202:** `{ requestId, status: 'requested', message: 'Check email to confirm' }`

---

#### `GET /me/data/export`
Export own data (JSON).

**Auth:** required
**Response 200:** JSON file download with all user data

---

### ═══════════════════════════════════════════
### HEALTH
### ═══════════════════════════════════════════

#### `GET /health`
**Response 200:**
```json
{
  "status": "ok",
  "version": "1.0.0",
  "uptime": 12345,
  "dbConnected": true,
  "redisConnected": true,
  "metaApiReachable": true
}
```

---

## Rate Limits

| Endpoint | Limit |
|---|---|
| `POST /auth/*` | 5/min per IP |
| `POST /webhooks/meta` | 500/min (Meta can burst) |
| Everything else (authenticated) | 100/min per user |
| `/me/data/export` | 1/day per user |

## TypeScript Types (shared)

Kevin publish types jadi NPM package atau simple `types/` folder di monorepo supaya Okta import. Example `@getstarvio/types`:

```typescript
export interface User {
  id: string
  email: string
  bizName: string | null
  // ... 
  meta: MetaConnection | null
}

export interface MetaConnection {
  connectedAt: string
  coexistenceEnabled: boolean
  waba: {
    id: string
    name: string
    templateNamespace: string
  }
  phoneNumber: {
    id: string
    displayNumber: string
    verifiedName: string
    qualityRating: 'GREEN' | 'YELLOW' | 'RED' | 'UNKNOWN'
    messagingLimitTier: 'TIER_1K' | 'TIER_10K' | 'TIER_100K' | 'UNLIMITED'
  }
  // ...
}

export interface Template {
  id: string
  name: string
  category: 'UTILITY' | 'MARKETING' | 'AUTHENTICATION'
  // ...
}
```

## OpenAPI / Swagger (optional but recommended)

Kalau pakai FastAPI, auto-generated ada di `/docs`.
Kalau Node: Zod schemas can be converted ke OpenAPI via `@asteasolutions/zod-to-openapi`.
Kalau Go: `swaggo/swag`.

Publish di `api.getstarvio.com/docs` buat Okta reference.
