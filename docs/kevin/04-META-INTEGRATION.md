# Meta Graph API Integration (CRITICAL)

> **The core of getstarvio backend.** Every feature touches this.

## Reference Docs

- [Cloud API Reference](https://developers.facebook.com/docs/whatsapp/cloud-api/reference)
- [Graph API Version v21.0](https://developers.facebook.com/docs/graph-api/changelog/version21.0/)
- [Business Management API](https://developers.facebook.com/docs/whatsapp/business-management-api)
- [Webhooks Reference](https://developers.facebook.com/docs/graph-api/webhooks/reference/whatsapp-business-account)
- [Error Codes](https://developers.facebook.com/docs/whatsapp/cloud-api/support/error-codes)

## Authentication Model

Tech Provider uses **System User Access Token** (long-lived, doesn't expire unless revoked).

### One-time Setup (Kevin + Sebastian do this together Day 1)

1. Meta Business Manager → Business Settings → Users → System Users
2. Add System User: name "getstarvio-tech-provider", role "Admin"
3. Generate token: scope `whatsapp_business_management, whatsapp_business_messaging, business_management, manage_app_solution, public_profile, email`
4. Token: **NEVER EXPIRES** (kecuali revoked manually)
5. Save ke `.env`: `META_SYSTEM_USER_TOKEN=<token>`

This token is used untuk:
- Internal API calls (not for customer WABAs)
- Admin-level operations
- Fallback kalau customer token expired

### Per-Customer Token (from Embedded Signup)

When customer onboards via Embedded Signup:
1. FE captures `authResponse.code` dari FB.login
2. BE exchange code → **long-lived access token** (60-day expiry)
3. Before expiry, refresh via Meta's OAuth refresh flow
4. Store encrypted in `users.meta_access_token` (bytea, AES-256-GCM)

## Core API Client

Create `src/services/meta-api.ts` (or equivalent):

```typescript
import axios, { AxiosInstance, AxiosError } from 'axios'

const META_API_VERSION = process.env.META_API_VERSION || 'v21.0'
const META_BASE_URL = `https://graph.facebook.com/${META_API_VERSION}`

interface MetaAPIError {
  error: {
    message: string
    type: string
    code: number
    error_subcode?: number
    error_user_msg?: string
    fbtrace_id: string
  }
}

export class MetaAPIClient {
  private client: AxiosInstance
  
  constructor(accessToken: string) {
    this.client = axios.create({
      baseURL: META_BASE_URL,
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      timeout: 15000,
    })
    
    // Response interceptor — normalize errors
    this.client.interceptors.response.use(
      (response) => response,
      (error: AxiosError<MetaAPIError>) => {
        if (error.response?.data?.error) {
          const metaErr = error.response.data.error
          throw new MetaError(metaErr.code, metaErr.message, metaErr.error_user_msg, metaErr.fbtrace_id)
        }
        throw error
      }
    )
  }
  
  async exchangeCode(code: string): Promise<{ access_token: string }> {
    const { data } = await this.client.get('/oauth/access_token', {
      params: {
        client_id: process.env.META_APP_ID,
        client_secret: process.env.META_APP_SECRET,
        code,
        redirect_uri: process.env.META_OAUTH_REDIRECT,  // kalau Embedded Signup, might be null
      }
    })
    return data
  }
  
  async getPhoneNumber(phoneId: string) {
    const { data } = await this.client.get(`/${phoneId}`, {
      params: { fields: 'id,display_phone_number,verified_name,quality_rating,platform_type,code_verification_status,messaging_limit_tier,throughput' }
    })
    return data
  }
  
  async getWABA(wabaId: string) {
    const { data } = await this.client.get(`/${wabaId}`, {
      params: { fields: 'id,name,currency,timezone_id,message_template_namespace,account_review_status' }
    })
    return data
  }
  
  async getBusiness(businessId: string) {
    const { data } = await this.client.get(`/${businessId}`, {
      params: { fields: 'id,name,verification_status,two_factor_type,primary_page' }
    })
    return data
  }
  
  async subscribeWebhook(wabaId: string) {
    await this.client.post(`/${wabaId}/subscribed_apps`)
  }
  
  async createTemplate(wabaId: string, template: {
    name: string
    category: string
    language: string
    components: any[]
  }) {
    const { data } = await this.client.post(`/${wabaId}/message_templates`, template)
    return data  // { id, status, category }
  }
  
  async sendMessage(phoneId: string, payload: {
    to: string
    type: 'template' | 'text'
    template?: any
    text?: any
  }) {
    const { data } = await this.client.post(`/${phoneId}/messages`, {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      ...payload,
    })
    return data  // { messages: [{ id }], contacts: [{ wa_id }] }
  }
  
  async listTemplates(wabaId: string) {
    const { data } = await this.client.get(`/${wabaId}/message_templates`, {
      params: { limit: 100 }
    })
    return data.data  // array
  }
  
  async deleteTemplate(wabaId: string, templateName: string) {
    await this.client.delete(`/${wabaId}/message_templates`, {
      params: { name: templateName }
    })
  }
}

export class MetaError extends Error {
  constructor(
    public code: number,
    message: string,
    public userMessage?: string,
    public traceId?: string
  ) {
    super(message)
    this.name = 'MetaError'
  }
}
```

## Critical Flows

### Flow 1: Embedded Signup Code Exchange

```typescript
// POST /meta/embedded-signup/exchange
async function handleEmbeddedSignup(req, res) {
  const { code, waba_id, phone_number_id, business_id } = req.body
  const userId = req.user.id
  
  // Step 1: Exchange code → access token
  // Use APP ACCESS TOKEN (not user token) for this exchange
  const appAccessToken = `${META_APP_ID}|${META_APP_SECRET}`
  const exchangeClient = new MetaAPIClient(appAccessToken)
  const { access_token: shortLivedToken } = await exchangeClient.exchangeCode(code)
  
  // Step 2: Exchange short-lived → long-lived token (60 days)
  const { data } = await axios.get(`${META_BASE_URL}/oauth/access_token`, {
    params: {
      grant_type: 'fb_exchange_token',
      client_id: META_APP_ID,
      client_secret: META_APP_SECRET,
      fb_exchange_token: shortLivedToken,
    }
  })
  const longLivedToken = data.access_token
  const tokenExpiresAt = new Date(Date.now() + 60 * 86400 * 1000)  // 60 days
  
  // Step 3: Fetch details
  const userClient = new MetaAPIClient(longLivedToken)
  const [phoneData, wabaData, businessData] = await Promise.all([
    userClient.getPhoneNumber(phone_number_id),
    userClient.getWABA(waba_id),
    userClient.getBusiness(business_id),
  ])
  
  // Step 4: Subscribe webhook
  await userClient.subscribeWebhook(waba_id)
  
  // Step 5: Encrypt token + save
  const encryptedToken = encrypt(longLivedToken)
  
  const metaData = {
    connectedAt: new Date().toISOString(),
    coexistenceEnabled: true,
    waba: {
      id: wabaData.id,
      name: wabaData.name,
      currency: wabaData.currency,
      timezoneId: wabaData.timezone_id,
      templateNamespace: wabaData.message_template_namespace,
      accountReviewStatus: wabaData.account_review_status,
    },
    phoneNumber: {
      id: phoneData.id,
      displayNumber: phoneData.display_phone_number,
      verifiedName: phoneData.verified_name,
      qualityRating: phoneData.quality_rating,
      platformType: phoneData.platform_type,
      codeVerificationStatus: phoneData.code_verification_status,
      messagingLimitTier: phoneData.messaging_limit_tier,
      throughputLevel: phoneData.throughput?.level,
    },
    business: {
      id: businessData.id,
      portfolioName: businessData.name,
      verificationStatus: businessData.verification_status,
      twoFactorType: businessData.two_factor_type,
    },
    coexistence: {
      enabled: true,
      contactsSynced: false,
      historySynced: false,
      syncWindowEndsAt: new Date(Date.now() + 24 * 3600 * 1000).toISOString(),
    },
  }
  
  await db.user.update({
    where: { id: userId },
    data: {
      meta: metaData,
      metaAccessToken: encryptedToken,
      metaTokenExpiresAt: tokenExpiresAt,
    }
  })
  
  res.json({ success: true, meta: metaData })
}
```

### Flow 2: Template Submission

```typescript
// POST /templates
async function submitTemplate(req, res) {
  const { name, category, language, body, example } = req.body
  const userId = req.user.id
  const user = await db.user.findUnique({ where: { id: userId } })
  
  if (!user.meta) throw new HttpError(400, 'Belum connect WhatsApp Business')
  
  // Validate: example.body_text count matches number of {{N}} in body
  const placeholderCount = (body.match(/\{\{\d+\}\}/g) || []).length
  if (placeholderCount > 0) {
    if (!example?.body_text?.[0] || example.body_text[0].length !== placeholderCount) {
      throw new HttpError(422, 'Contoh parameter tidak match dengan variabel')
    }
  }
  
  // Decrypt token
  const accessToken = decrypt(user.metaAccessToken)
  const client = new MetaAPIClient(accessToken)
  
  // Build Meta API payload
  const components = [
    {
      type: 'BODY',
      text: body,
      ...(example && { example }),
    },
  ]
  
  try {
    const result = await client.createTemplate(user.meta.waba.id, {
      name, category, language, components,
    })
    
    // Save to DB
    const template = await db.template.create({
      data: {
        userId,
        name, category, language, body, example,
        metaTemplateId: result.id,
        status: result.status || 'PENDING',
        metaSubmittedAt: new Date(),
      },
    })
    
    // Audit log
    await db.auditLog.create({
      data: {
        userId,
        action: 'template_submit',
        resourceType: 'template',
        resourceId: template.id,
        details: { name, category },
      },
    })
    
    res.status(201).json(template)
  } catch (e) {
    if (e instanceof MetaError) {
      throw new HttpError(502, `Meta API error: ${e.userMessage || e.message}`, {
        code: 'META_API_ERROR',
        details: { metaCode: e.code, traceId: e.traceId },
      })
    }
    throw e
  }
}
```

### Flow 3: Send Reminder Message

```typescript
async function sendReminder(reminderId: string) {
  const reminder = await db.reminder.findUnique({
    where: { id: reminderId },
    include: { 
      user: true, 
      customer: true, 
      category: true, 
      template: true,
    },
  })
  
  if (!reminder) throw new Error('Reminder not found')
  if (reminder.status !== 'pending') return  // already sent or cancelled
  
  const user = reminder.user
  const template = reminder.template
  
  // Check credits
  const remLeft = user.subCreditsLeft + user.topupCreditsLeft
  if (remLeft < 1) {
    await db.reminder.update({
      where: { id: reminderId },
      data: { status: 'gagal', errorMessage: 'Kredit habis' },
    })
    return
  }
  
  // Check trial expired
  if (user.plan === 'trial' && user.trialEndsAt && user.trialEndsAt < new Date()) {
    await db.reminder.update({
      where: { id: reminderId },
      data: { status: 'gagal', errorMessage: 'Trial expired' },
    })
    return
  }
  
  // Decrypt token
  const accessToken = decrypt(user.metaAccessToken)
  const client = new MetaAPIClient(accessToken)
  
  // Build template payload
  const templateParams = [
    { type: 'text', text: reminder.customerNameSnapshot },
    { type: 'text', text: reminder.serviceNameSnapshot },
    { type: 'text', text: formatIndonesianDate(reminder.customer.lastVisitDate) },
    { type: 'text', text: user.bizName },
  ]
  
  const payload = {
    to: reminder.customer.wa,
    type: 'template',
    template: {
      name: template.name,
      language: { code: template.language },
      components: [
        {
          type: 'body',
          parameters: templateParams,
        },
      ],
    },
  }
  
  try {
    const result = await client.sendMessage(user.meta.phoneNumber.id, payload)
    const metaMessageId = result.messages[0].id
    
    await db.$transaction([
      // Update reminder
      db.reminder.update({
        where: { id: reminderId },
        data: {
          status: 'pending',  // wait for webhook to mark 'terkirim'
          sentAt: new Date(),
          metaMessageId,
        },
      }),
      // Deduct credit — sub first, then topup
      deductCredit(user.id, 1),
      // Billing history
      db.billingHistory.create({
        data: {
          userId: user.id,
          type: 'usage',
          label: 'Pengingat terkirim',
          delta: -1,
          balAfter: remLeft - 1,
          note: `${reminder.customerNameSnapshot} - ${reminder.serviceNameSnapshot}`,
        },
      }),
    ])
  } catch (e) {
    if (e instanceof MetaError) {
      await db.reminder.update({
        where: { id: reminderId },
        data: {
          status: 'gagal',
          errorCode: String(e.code),
          errorMessage: e.userMessage || e.message,
        },
      })
    }
    throw e
  }
}

async function deductCredit(userId: string, amount: number) {
  // Logic: sub credits first, then topup
  return db.$transaction(async (tx) => {
    const user = await tx.user.findUnique({ where: { id: userId } })
    let fromSub = Math.min(user.subCreditsLeft, amount)
    let fromTopup = amount - fromSub
    
    return tx.user.update({
      where: { id: userId },
      data: {
        subCreditsLeft: { decrement: fromSub },
        topupCreditsLeft: { decrement: fromTopup },
      },
    })
  })
}
```

### Flow 4: Webhook Handler

See `kevin/06-WEBHOOK-HANDLER.md` (nanti write) atau implement di sini singkat:

```typescript
import crypto from 'crypto'

// GET /webhooks/meta — verification challenge
async function verifyWebhook(req, res) {
  const mode = req.query['hub.mode']
  const token = req.query['hub.verify_token']
  const challenge = req.query['hub.challenge']
  
  if (mode === 'subscribe' && token === process.env.META_WEBHOOK_VERIFY_TOKEN) {
    return res.status(200).send(challenge)
  }
  res.sendStatus(403)
}

// POST /webhooks/meta — receive events
async function handleWebhook(req, res) {
  // Verify signature
  const signature = req.headers['x-hub-signature-256']
  const expectedSig = 'sha256=' + crypto
    .createHmac('sha256', process.env.META_APP_SECRET)
    .update(req.rawBody)  // raw body needed!
    .digest('hex')
  
  if (signature !== expectedSig) {
    return res.status(401).json({ error: 'Invalid signature' })
  }
  
  // Store webhook event (idempotency + replay)
  const event = await db.webhookEvent.create({
    data: {
      source: 'meta_whatsapp',
      eventType: extractEventType(req.body),
      payload: req.body,
    },
  })
  
  // ACK Meta ASAP (within 20s) — process async
  res.sendStatus(200)
  
  // Process in background (queue or async)
  processWebhookEvent(event.id).catch(console.error)
}

async function processWebhookEvent(eventId) {
  const event = await db.webhookEvent.findUnique({ where: { id: eventId } })
  const entries = event.payload.entry || []
  
  for (const entry of entries) {
    const wabaId = entry.id
    for (const change of entry.changes || []) {
      switch (change.field) {
        case 'messages':
          await handleMessagesWebhook(wabaId, change.value)
          break
        case 'message_template_status_update':
          await handleTemplateStatusUpdate(wabaId, change.value)
          break
        case 'account_update':
          await handleAccountUpdate(wabaId, change.value)
          break
        // ... other fields
      }
    }
  }
  
  await db.webhookEvent.update({
    where: { id: eventId },
    data: { processedAt: new Date() },
  })
}

async function handleMessagesWebhook(wabaId, value) {
  // value.statuses[] — delivery status updates
  for (const status of value.statuses || []) {
    const { id: metaMessageId, status: statusType, timestamp } = status
    
    const reminder = await db.reminder.findFirst({
      where: { metaMessageId },
    })
    if (!reminder) continue
    
    const mapping = {
      sent: 'pending',       // Meta forwarded to phone
      delivered: 'terkirim', // Phone received
      read: 'terkirim',      // User read
      failed: 'gagal',
    }
    
    await db.reminder.update({
      where: { id: reminder.id },
      data: {
        status: mapping[statusType] || reminder.status,
        ...(statusType === 'delivered' && { deliveredAt: new Date(Number(timestamp) * 1000) }),
        ...(statusType === 'read' && { readAt: new Date(Number(timestamp) * 1000) }),
        ...(statusType === 'failed' && { errorMessage: status.errors?.[0]?.title || 'Failed' }),
      },
    })
  }
  
  // value.messages[] — incoming messages (customer replied)
  // Phase 2: save to inbox, notify owner
}

async function handleTemplateStatusUpdate(wabaId, value) {
  const { event, message_template_id, message_template_name, message_template_language, reason } = value
  
  const user = await db.user.findFirst({
    where: { meta: { path: ['waba', 'id'], equals: wabaId } },  // JSONB query
  })
  if (!user) return
  
  await db.template.updateMany({
    where: { 
      userId: user.id,
      name: message_template_name,
      language: message_template_language,
    },
    data: {
      status: event,  // APPROVED | REJECTED | PAUSED | FLAGGED
      statusReason: reason !== 'NONE' ? reason : null,
      ...(event === 'APPROVED' && { metaApprovedAt: new Date() }),
    },
  })
  
  // Notify user (optional — push notification, email, etc.)
}
```

## Encryption Helper

```typescript
import crypto from 'crypto'

const ALGO = 'aes-256-gcm'
const KEY = Buffer.from(process.env.ENCRYPTION_KEY, 'base64')  // 32 bytes

export function encrypt(plaintext: string): Buffer {
  const iv = crypto.randomBytes(12)
  const cipher = crypto.createCipheriv(ALGO, KEY, iv)
  const encrypted = Buffer.concat([
    cipher.update(plaintext, 'utf8'),
    cipher.final(),
  ])
  const tag = cipher.getAuthTag()
  
  // Format: [IV (12)][TAG (16)][CIPHERTEXT (n)]
  return Buffer.concat([iv, tag, encrypted])
}

export function decrypt(encrypted: Buffer): string {
  const iv = encrypted.subarray(0, 12)
  const tag = encrypted.subarray(12, 28)
  const ciphertext = encrypted.subarray(28)
  
  const decipher = crypto.createDecipheriv(ALGO, KEY, iv)
  decipher.setAuthTag(tag)
  const decrypted = Buffer.concat([
    decipher.update(ciphertext),
    decipher.final(),
  ])
  return decrypted.toString('utf8')
}

// Generate ENCRYPTION_KEY for .env:
// node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

## 2 Required Test Calls Before App Review

Meta requires 1 API call per permission sebelum app review.

### Test call #1: `business_management`
```bash
# Via Graph API Explorer atau curl
GET https://graph.facebook.com/v21.0/me/businesses
Authorization: Bearer {SYSTEM_USER_TOKEN}
```

Or programmatically during test run:
```typescript
await axios.get(`${META_BASE_URL}/me/businesses`, {
  headers: { Authorization: `Bearer ${SYSTEM_USER_TOKEN}` }
})
```

### Test call #2: `manage_app_solution`
```bash
GET https://graph.facebook.com/v21.0/{APP_ID}/subscriptions
Authorization: Bearer {SYSTEM_USER_TOKEN}
```

After 1 successful call per permission → logged by Meta within 24h → status shows ✓ in Review → Testing dashboard.

## Rate Limiting (Meta's limits)

| Endpoint | Rate |
|---|---|
| Message send per phone_number_id | 80 msg/s (STANDARD tier) |
| Template submit | 100 per WABA per day |
| Webhook deliveries to us | 80 per second burst |
| General Graph API | 200 calls/hour/user |

Implement exponential backoff on rate limit (429 response):
```typescript
async function sendWithRetry(fn, retries = 3) {
  try {
    return await fn()
  } catch (e) {
    if (e instanceof MetaError && e.code === 4 /* rate limit */ && retries > 0) {
      const delay = Math.pow(2, 4 - retries) * 1000
      await new Promise(r => setTimeout(r, delay))
      return sendWithRetry(fn, retries - 1)
    }
    throw e
  }
}
```

## Error Code Mapping

Common Meta error codes to user-friendly messages:

| Meta Code | Meaning | User Message (ID) |
|---|---|---|
| 131051 | Message type unsupported | Tipe pesan tidak didukung |
| 131052 | Media download failed | Download media gagal |
| 131053 | Media upload failed | Upload media gagal |
| 131056 | Pair rate limit | Terlalu banyak pesan ke nomor ini — coba lagi nanti |
| 131060 | Phone number not on WA | Nomor ini tidak terdaftar di WhatsApp |
| 131047 | Re-engagement message | Customer sudah tidak active di WA |
| 131048 | Spam rate limit | Terlalu banyak pesan spam — tier diturunkan |
| 132000 | Template param mismatch | Jumlah variabel tidak match template |
| 132001 | Template not exist | Template belum approve atau tidak ada |
| 132005 | Translation mismatch | Bahasa template tidak cocok |
| 132007 | Template format character policy violated | Format template melanggar kebijakan |
| 133004 | Server temporary error | Server Meta sedang bermasalah, coba lagi |
| 133005 | Server temporary error | Server Meta sedang bermasalah, coba lagi |
| 100 | Invalid parameter | Parameter tidak valid |
| 190 | Access token invalid | Token expired — user perlu re-connect |

## Testing Locally

### Ngrok untuk webhook testing
```bash
ngrok http 3000
# URL: https://xxx.ngrok-free.app
# Set webhook callback URL di Meta App Dashboard ke: https://xxx.ngrok-free.app/webhooks/meta
```

### Postman / curl for API testing
```bash
# Test endpoint
curl -X POST http://localhost:3000/meta/embedded-signup/exchange \
  -H "Authorization: Bearer <user-jwt>" \
  -H "Content-Type: application/json" \
  -d '{
    "code": "AQDxyz...",
    "waba_id": "105...",
    "phone_number_id": "698...",
    "business_id": "492..."
  }'
```

### Mock Meta API in tests
```typescript
// tests/helpers/mock-meta.ts
import { vi } from 'vitest'
import { MetaAPIClient } from '@/services/meta-api'

export function mockMetaAPI() {
  vi.spyOn(MetaAPIClient.prototype, 'sendMessage').mockResolvedValue({
    messages: [{ id: 'wamid.mock123' }],
    contacts: [{ wa_id: '628xxx' }],
  })
  vi.spyOn(MetaAPIClient.prototype, 'createTemplate').mockResolvedValue({
    id: 'mock-tpl-id',
    status: 'PENDING',
    category: 'UTILITY',
  })
}
```

## Checklist

- [ ] System User token generated + saved to `.env`
- [ ] App Secret saved to `.env` (for webhook signature)
- [ ] Webhook verify token generated + set in Meta App Dashboard
- [ ] Subscribe to all webhook fields (messages, template status, account update, coexistence fields)
- [ ] Encryption key generated + saved
- [ ] MetaAPIClient class tested dengan real sandbox
- [ ] Test call #1 done for `business_management`
- [ ] Test call #2 done for `manage_app_solution`
- [ ] Webhook signature verification verified
- [ ] Error codes mapped to user messages
- [ ] Retry logic with exponential backoff
- [ ] Logs don't contain tokens or sensitive data

Good luck — this is the single most important part of the backend. 🔥
