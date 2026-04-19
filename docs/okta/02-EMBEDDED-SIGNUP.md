# Embedded Signup Integration (CRITICAL)

> ⚡ **This is the single most important piece of FE work.** Meta reviewer test this flow. Kalau broken, reject.

## What is Embedded Signup?

Embedded Signup adalah official flow dari Meta untuk Tech Provider onboard client WhatsApp Business accounts. Owner UMKM click 1 button → Meta popup buka → mereka login FB + pilih WABA + scan QR → kamu capture `waba_id`, `phone_number_id`, `business_id`.

**Coexistence mode** (yang kita pakai): owner keep pakai WA Business app di HP mereka. getstarvio just numpang kirim pesan otomatis via Cloud API.

## Reference: Meta Docs

Canonical:
- [Embedded Signup Overview](https://developers.facebook.com/documentation/business-messaging/whatsapp/embedded-signup/overview/)
- [Implementation Guide](https://developers.facebook.com/documentation/business-messaging/whatsapp/embedded-signup/implementation/)
- [Coexistence Onboarding](https://developers.facebook.com/documentation/business-messaging/whatsapp/embedded-signup/onboarding-business-app-users/)

## Full Flow

```
1. Owner logged into getstarvio dashboard
2. Click "Hubungkan WhatsApp Business" button
3. getstarvio call FB.login() with scopes + extras
4. Facebook popup opens
5. Owner authenticates FB → selects Business Portfolio → selects WABA number
6. Scan QR in popup with WA Business app phone
7. Owner confirms Coexistence
8. Popup closes, send message event to getstarvio FE
9. FE receives: { waba_id, phone_number_id, business_id, authResponse.code }
10. FE POST these to Kevin's backend
11. Backend exchanges code → permanent access token
12. Backend fetches full WABA/phone/business details from Meta
13. Backend stores encrypted → returns success to FE
14. FE show success state with verified data
```

## Step-by-Step Implementation

### Step 1: Load Facebook SDK

Di root layout / `_app.tsx` / `nuxt.config.ts`:

```html
<!-- Put in <head> -->
<script async defer crossorigin="anonymous"
  src="https://connect.facebook.net/en_US/sdk.js">
</script>
```

Or via npm:
```bash
npm install react-facebook
# atau custom loader (lihat bawah)
```

### Step 2: Init SDK

Buat helper `src/lib/meta-sdk.ts`:

```typescript
declare global {
  interface Window {
    FB: any
    fbAsyncInit: () => void
  }
}

let initPromise: Promise<void> | null = null

export function initFacebookSDK(): Promise<void> {
  if (initPromise) return initPromise
  
  initPromise = new Promise((resolve) => {
    const script = document.createElement('script')
    script.src = 'https://connect.facebook.net/en_US/sdk.js'
    script.async = true
    script.defer = true
    script.crossOrigin = 'anonymous'
    document.head.appendChild(script)
    
    window.fbAsyncInit = () => {
      window.FB.init({
        appId: process.env.NEXT_PUBLIC_META_APP_ID, // atau VITE_ / NUXT_PUBLIC_
        cookie: true,
        xfbml: false,
        version: process.env.NEXT_PUBLIC_META_API_VERSION, // 'v21.0'
      })
      resolve()
    }
  })
  
  return initPromise
}
```

Call di root component mount:
```typescript
useEffect(() => {
  initFacebookSDK()
}, [])
```

### Step 3: Setup Message Event Listener

Window message event is how Meta communicate dengan parent page. Attach listener SEBELUM `FB.login()` dipanggil:

```typescript
// src/lib/embedded-signup.ts

export interface MetaSignupData {
  phone_number_id: string
  waba_id: string
  business_id: string
  ad_account_ids?: string[]
  page_ids?: string[]
  dataset_ids?: string[]
  catalog_ids?: string[]
  instagram_account_ids?: string[]
  waba_ids?: string[]
}

export interface MetaSignupResult {
  code: string                // untuk exchange di backend
  data: MetaSignupData
}

type SignupCallback = (result: MetaSignupResult) => void
type CancelCallback = (reason: string) => void

let currentCallback: SignupCallback | null = null
let currentCancelCallback: CancelCallback | null = null

function handleMessage(event: MessageEvent) {
  // Security: verify origin
  if (event.origin !== 'https://www.facebook.com' && 
      event.origin !== 'https://web.facebook.com') {
    return
  }
  
  try {
    const payload = typeof event.data === 'string' 
      ? JSON.parse(event.data) 
      : event.data
    
    if (payload.type !== 'WA_EMBEDDED_SIGNUP') return
    
    if (payload.event === 'FINISH') {
      // Success — data akan ditangani di callback FB.login
      // Tapi kita simpan data di sini untuk handoff
      window.__metaSignupData = payload.data
    } else if (payload.event === 'CANCEL') {
      const reason = payload.data?.error_message || 'User cancelled'
      currentCancelCallback?.(reason)
    }
  } catch (e) {
    console.error('[Meta] Failed to parse signup event', e)
  }
}

export function startEmbeddedSignup(
  onSuccess: SignupCallback,
  onCancel: CancelCallback
) {
  currentCallback = onSuccess
  currentCancelCallback = onCancel
  
  // Attach listener (only once)
  if (!window.__metaListenerAttached) {
    window.addEventListener('message', handleMessage)
    window.__metaListenerAttached = true
  }
  
  // Call FB.login
  window.FB.login(
    (response: any) => {
      if (response.authResponse && response.authResponse.code) {
        const data = window.__metaSignupData
        if (data) {
          onSuccess({
            code: response.authResponse.code,
            data,
          })
        } else {
          onCancel('No data received from Meta')
        }
        // Clear state
        window.__metaSignupData = null
      } else {
        onCancel('User cancelled or login failed')
      }
    },
    {
      config_id: process.env.NEXT_PUBLIC_META_CONFIG_ID, // from Meta app dashboard
      response_type: 'code',
      override_default_response_type: true,
      extras: {
        featureType: 'whatsapp_business_app_onboarding',
        sessionInfoVersion: '3',
      },
    }
  )
}

// TypeScript window extension
declare global {
  interface Window {
    __metaListenerAttached?: boolean
    __metaSignupData?: MetaSignupData | null
  }
}
```

### Step 4: Get `config_id` from Meta App Dashboard

In Meta App Dashboard:
1. Go to WhatsApp → Configuration
2. Under "Embedded Signup" section, click "Create Configuration"
3. Select features:
   - ✅ WhatsApp Business App Onboarding (Coexistence)
   - ✅ Phone Number Registration
   - ✅ Multiple Phone Numbers
4. Set pre-filled values (optional):
   - Default country: Indonesia
5. Save → copy the **Configuration ID**
6. Put in `.env`: `NEXT_PUBLIC_META_CONFIG_ID=<id>`

### Step 5: UI Integration

In onboarding Step 1 page:

```tsx
import { useState } from 'react'
import { initFacebookSDK, startEmbeddedSignup, type MetaSignupResult } from '@/lib/meta-sdk'
import { api } from '@/lib/api'

export default function OnboardingStep1() {
  const [state, setState] = useState<'pre' | 'progress' | 'success' | 'error'>('pre')
  const [metaData, setMetaData] = useState<any>(null)
  const [errorMsg, setErrorMsg] = useState('')
  
  async function handleConnect() {
    try {
      await initFacebookSDK()
      setState('progress')
      
      startEmbeddedSignup(
        async (result: MetaSignupResult) => {
          // Send to backend for code exchange + detail fetch
          try {
            const response = await api.post('/meta/embedded-signup/exchange', {
              code: result.code,
              waba_id: result.data.waba_id,
              phone_number_id: result.data.phone_number_id,
              business_id: result.data.business_id,
            })
            setMetaData(response.data)
            setState('success')
          } catch (e: any) {
            setErrorMsg(e.response?.data?.message || 'Failed to save connection')
            setState('error')
          }
        },
        (reason) => {
          setErrorMsg(reason)
          setState('pre')  // allow retry
        }
      )
    } catch (e) {
      setErrorMsg('Failed to load Facebook SDK')
      setState('error')
    }
  }
  
  if (state === 'pre') {
    return (
      <div>
        {/* ... pre-connection UI with checklist + 7-day active check + country warning ... */}
        <button onClick={handleConnect} className="btn-fb">
          Hubungkan dengan Facebook
        </button>
      </div>
    )
  }
  
  if (state === 'progress') {
    return <div>Popup Meta sedang terbuka...</div>
  }
  
  if (state === 'success') {
    return (
      <SuccessCard
        displayNumber={metaData.phoneNumber.displayNumber}
        verifiedName={metaData.phoneNumber.verifiedName}
        businessName={metaData.business.portfolioName}
        qualityRating={metaData.phoneNumber.qualityRating}
        messagingTier={metaData.phoneNumber.messagingLimitTier}
        wabaId={metaData.waba.id}
        phoneId={metaData.phoneNumber.id}
        businessId={metaData.business.id}
        templateNamespace={metaData.waba.templateNamespace}
      />
    )
  }
  
  if (state === 'error') {
    return (
      <div>
        <p>Error: {errorMsg}</p>
        <button onClick={() => setState('pre')}>Coba Lagi</button>
      </div>
    )
  }
}
```

### Step 6: Success State UI

Reference dari `mockup/getstarvio-onboarding.html` — Tier 1 + Tier 2 + Tier 3 + Tier 4 layout. Baca detail di spec `prompts/02-onboarding.md`.

Key components to build:
- `SuccessCard` dengan lime background
- Status badges (Quality HIGH, Tier 1K, Coexist aktif)
- Sync status rows (kontak synced, history synced)
- Collapsible "Info Teknis" dengan masked IDs + copy buttons

## Prerequisites Pre-Connection UI

Sebelum klik "Hubungkan dengan Facebook", user harus see + acknowledge:

1. **Checklist WA Business app version:**
   - "WhatsApp Business app versi 2.24.17+ di HP"
   - Link ke App Store / Play Store
   
2. **7-day active radio** (Meta requirement):
   ```
   [ ] <7 hari    → Block submit + amber warning
   [ ] 7-30 hari  → OK
   [ ] >30 hari   → Recommended ✓ (default)
   ```
   
3. **Country availability note:**
   - ✅ Indonesia, Malaysia, Singapore, Philippines, Thailand, Vietnam, dll
   - ❌ Nigeria (+234), South Africa (+27) — Meta restriction
   - Block submit kalau user pick country yang excluded

Implementasi block submit:
```tsx
const canSubmit = waActiveDuration !== 'lt7' && countrySupported(countryCode)

<button onClick={handleConnect} disabled={!canSubmit}>
  Hubungkan
</button>
```

## Testing Locally

Local dev server (localhost:3000) **tidak bisa test Embedded Signup real** karena Meta butuh HTTPS domain yang registered di App Dashboard. Options:

### Option A: Use staging URL
- Deploy to `staging.getstarvio.com`
- Add staging URL di Meta App Dashboard → Settings → App Domains
- Test di staging

### Option B: Use ngrok for local dev
```bash
npm install -g ngrok
# OR
brew install ngrok

# Run local server
npm run dev

# In another terminal
ngrok http 3000
# Copy the https://xxx.ngrok-free.app URL

# Add URL di Meta App Dashboard → Settings → App Domains
# Change NEXT_PUBLIC_API_URL pointing ke ngrok URL (sementara)
```

### Option C: Mock for component dev, real for integration testing
- Build UI tanpa Meta (hardcoded success data)
- Test Meta integration only on staging

## Error Handling

Map common Meta error messages:

| Error | Meaning | UI Message |
|---|---|---|
| `User cancelled` | Closed popup | "Kamu batalkan. Coba lagi?" |
| `Business not selected` | Didn't pick portfolio | "Pilih Business Portfolio dulu" |
| `Phone number already registered` | Nomor udah di WABA lain | "Nomor ini sudah terhubung ke sistem lain" |
| `Country not supported` | Nigeria/South Africa | "Coexistence belum support di negaramu" |
| `Insufficient permissions` | Scope missing | "Terjadi error — hubungi support" |
| Network error | Internet down | "Cek koneksi internet kamu" |

## Security Checklist

- [ ] Verify `event.origin === 'https://www.facebook.com'` in message listener
- [ ] NEVER log `authResponse.code` to console in production
- [ ] Send code immediately to backend, don't store in localStorage
- [ ] Clear `window.__metaSignupData` after successful exchange
- [ ] Handle `message` event spoofing attempts (verify origin + type)

## E2E Test Scenario

Playwright test `tests/e2e/embedded-signup.spec.ts`:

```typescript
import { test, expect } from '@playwright/test'

test.describe('Embedded Signup (mocked)', () => {
  test.beforeEach(async ({ page }) => {
    // Mock Facebook SDK
    await page.addInitScript(() => {
      window.FB = {
        init: () => {},
        login: (callback: any) => {
          // Simulate FB.login success
          setTimeout(() => {
            window.postMessage({
              type: 'WA_EMBEDDED_SIGNUP',
              event: 'FINISH',
              data: {
                waba_id: '105783024692731',
                phone_number_id: '698201013402857',
                business_id: '492187365201744',
              }
            }, '*')
            callback({
              authResponse: { code: 'test-auth-code-xxx' },
              status: 'connected'
            })
          }, 100)
        }
      }
      window.fbAsyncInit = () => {}
    })
  })
  
  test('complete onboarding flow', async ({ page }) => {
    await page.goto('/onboarding')
    
    // Pre-connection state
    await expect(page.getByText('Hubungkan WhatsApp Business')).toBeVisible()
    
    // Select WA active duration
    await page.getByLabel('Lebih dari 30 hari').check()
    
    // Click connect button
    await page.getByRole('button', { name: /Hubungkan dengan Facebook/i }).click()
    
    // Wait for success state
    await expect(page.getByText('WhatsApp Business terhubung')).toBeVisible({ timeout: 10000 })
    
    // Verify captured data shown
    await expect(page.getByText('+62 812 3456 7890')).toBeVisible()
  })
})
```

## What Kevin Needs from You

When you POST to `/meta/embedded-signup/exchange`, Kevin expects:

```json
{
  "code": "AQDxyz123...",                    // Authorization code for exchange
  "waba_id": "105783024692731",              // WABA ID captured
  "phone_number_id": "698201013402857",      // Phone number ID
  "business_id": "492187365201744"           // Business portfolio ID
}
```

He returns:
```json
{
  "success": true,
  "meta": {
    "waba": { "id": "...", "name": "...", "templateNamespace": "..." },
    "phoneNumber": { "id": "...", "displayNumber": "+62 812...", "verifiedName": "...", ... },
    "business": { "id": "...", "portfolioName": "...", "verificationStatus": "VERIFIED" },
    "coexistence": { "enabled": true, "contactsSynced": false }
  }
}
```

See `kevin/03-API-CONTRACT.md` untuk full contract.

## Definition of Done

- [ ] FB SDK loads on every page (not reload per component mount)
- [ ] `initFacebookSDK()` idempotent (can call multiple times safely)
- [ ] Message event listener attached once, cleaned up on unmount
- [ ] Origin verification on messages (only accept from facebook.com)
- [ ] Success state shows all captured data tiers
- [ ] Error state recoverable (user can retry)
- [ ] E2E test passes on staging URL
- [ ] Mobile responsive (iPhone 12 size)
- [ ] Keyboard accessible (Enter to submit, Tab nav)

Critical for Meta review: Reviewer MUST be able to complete this flow dengan test user credentials. Kalau flow stuck / error / UI broken → reject.
