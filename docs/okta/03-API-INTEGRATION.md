# API Integration with Kevin's Backend

> **Kevin's canonical API contract** adalah `kevin/03-API-CONTRACT.md`. Doc ini guide cara consume dari FE.

## Base Setup

### API Client (axios example)

`src/lib/api.ts`:

```typescript
import axios from 'axios'

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  // dev: http://localhost:3001
  // prod: https://api.getstarvio.com
  timeout: 10000,
  withCredentials: true,  // send cookies
})

// Request interceptor — attach auth token
api.interceptors.request.use((config) => {
  const token = getAuthToken()  // from your auth store
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Response interceptor — handle common errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired / invalid — redirect to login
      window.location.href = '/login?reason=session_expired'
    }
    if (error.response?.status >= 500) {
      // Server error — show global toast
      showErrorToast('Server error, coba lagi sebentar')
    }
    return Promise.reject(error)
  }
)

function getAuthToken(): string | null {
  // Option 1: From localStorage (simpler, less secure)
  return localStorage.getItem('getstarvio_token')
  
  // Option 2: From cookie (more secure with httpOnly)
  // return getCookie('getstarvio_session')
}

function showErrorToast(msg: string) {
  // Your toast implementation
}
```

## Auth Flow

### Login via Google OAuth

```typescript
// Trigger Google OAuth
function loginWithGoogle() {
  // Redirect to backend OAuth entry
  window.location.href = `${API_URL}/auth/google`
}

// Or use Google Identity Services (JS SDK) — more control
// npm install @react-oauth/google
```

Backend handles redirect → Google → callback → sets session cookie → redirects back ke `/dashboard`.

### Check Current User

```typescript
async function getCurrentUser() {
  try {
    const { data } = await api.get('/me')
    return data  // { id, email, adminName, bizName, bizType, meta: {...}, plan, remLeft, ... }
  } catch (e) {
    return null
  }
}

// React hook example
import { useEffect, useState } from 'react'

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    getCurrentUser()
      .then(setUser)
      .finally(() => setLoading(false))
  }, [])
  
  return { user, loading, refetch: () => getCurrentUser().then(setUser) }
}
```

### Logout

```typescript
async function logout() {
  await api.post('/auth/logout')
  localStorage.removeItem('getstarvio_token')
  window.location.href = '/login'
}
```

## Endpoint Map (reference — detail di kevin/03-API-CONTRACT.md)

### Auth
| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/auth/google` | Start OAuth redirect |
| POST | `/auth/logout` | End session |
| GET | `/me` | Current user profile |

### Meta Integration
| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/meta/embedded-signup/exchange` | Exchange code + save captured data |
| GET | `/meta/connection` | Get current Meta connection status |
| POST | `/meta/disconnect` | Offboard WABA from getstarvio |
| POST | `/meta/coexistence/sync-contacts` | Trigger contact sync |
| POST | `/meta/coexistence/sync-history` | Trigger message history sync |

### Customers
| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/customers` | List dengan filters |
| POST | `/customers` | Create new |
| GET | `/customers/:id` | Detail |
| PUT | `/customers/:id` | Update |
| DELETE | `/customers/:id` | Delete |
| POST | `/customers/import` | CSV bulk import |

### Categories
| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/categories` | List all |
| POST | `/categories` | Create |
| PUT | `/categories/:id` | Update |
| DELETE | `/categories/:id` | Delete |

### Templates
| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/templates` | List dengan status |
| POST | `/templates` | Submit new to Meta |
| PUT | `/templates/:id` | Update (triggers resubmit) |
| DELETE | `/templates/:id` | Delete from Meta + DB |
| GET | `/templates/:id/payload` | Preview JSON to be sent to Meta |

### Visits / Reminders
| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/visits` | Record customer visit |
| GET | `/reminders` | List with filters (status, date range) |
| POST | `/reminders/:id/retry` | Retry failed reminder |
| POST | `/reminders/send-test` | Send 1 test message (for Meta review demo) |

### Billing
| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/billing` | Current plan + credits + history |
| POST | `/billing/subscribe` | Start subscription |
| POST | `/billing/topup` | Buy top-up |
| POST | `/billing/cancel` | Cancel subscription |

### Admin (gated)
| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/admin/businesses` | List all businesses |
| GET | `/admin/businesses/:id` | Detail |
| POST | `/admin/businesses/:id/impersonate` | Login as user |
| POST | `/admin/businesses/:id/suspend` | Suspend account |
| GET | `/admin/audit-log` | Audit trail |
| GET | `/admin/meta-status` | Global Meta app health |

### Public (no auth)
| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/public/checkin/:slug` | Get business info for check-in page |
| POST | `/public/checkin/:slug` | Register customer via QR |

### Data Deletion (GDPR / UU PDP)
| Method | Endpoint | Purpose |
|---|---|---|
| DELETE | `/me/data` | Request full account + data deletion |
| GET | `/me/data/export` | Export own data (JSON) |

## Common Patterns

### Loading States

```tsx
function CustomersList() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  useEffect(() => {
    api.get('/customers')
      .then((r) => setCustomers(r.data))
      .catch((e) => setError(e.response?.data?.message || 'Gagal load data'))
      .finally(() => setLoading(false))
  }, [])
  
  if (loading) return <Skeleton />
  if (error) return <ErrorBox message={error} onRetry={() => location.reload()} />
  if (customers.length === 0) return <EmptyState />
  
  return <List items={customers} />
}
```

### Forms + Validation

```tsx
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

const TemplateSchema = z.object({
  name: z.string().regex(/^[a-z0-9_]+$/, 'Nama harus huruf kecil + angka + underscore'),
  category: z.enum(['UTILITY', 'MARKETING', 'AUTHENTICATION']),
  language: z.enum(['id', 'en_US']),
  body: z.string().min(10, 'Body pesan minimal 10 karakter').max(1024),
  example: z.object({
    body_text: z.array(z.array(z.string())).min(1),
  }).optional(),
})

type TemplateForm = z.infer<typeof TemplateSchema>

function NewTemplateForm() {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<TemplateForm>({
    resolver: zodResolver(TemplateSchema),
  })
  
  const onSubmit = async (data: TemplateForm) => {
    try {
      await api.post('/templates', data)
      toast.success('Template submitted to Meta!')
      // redirect or refresh
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Failed to submit')
    }
  }
  
  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register('name')} disabled={isSubmitting} />
      {errors.name && <span className="text-red-600">{errors.name.message}</span>}
      {/* ...other fields */}
      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Submitting...' : 'Submit to Meta'}
      </button>
    </form>
  )
}
```

### Optimistic Updates

```tsx
async function toggleAutomation(enabled: boolean) {
  // Optimistically update UI
  setAutomationEnabled(enabled)
  
  try {
    await api.patch('/settings/automation', { enabled })
  } catch (e) {
    // Revert on failure
    setAutomationEnabled(!enabled)
    toast.error('Failed to update')
  }
}
```

### Polling (for live updates)

Template status setelah submit → poll every 30 sec sampai change dari PENDING:

```tsx
function useTemplateStatus(templateId: string) {
  const [template, setTemplate] = useState<Template | null>(null)
  
  useEffect(() => {
    if (!templateId) return
    
    const fetch = async () => {
      const { data } = await api.get(`/templates/${templateId}`)
      setTemplate(data)
      return data.status
    }
    
    let intervalId: NodeJS.Timeout
    
    const poll = async () => {
      const status = await fetch()
      if (status === 'PENDING') {
        intervalId = setTimeout(poll, 30000)  // 30 sec
      }
    }
    
    poll()
    
    return () => clearTimeout(intervalId)
  }, [templateId])
  
  return template
}
```

Atau better: WebSocket / SSE kalau Kevin implement (Phase 2).

## Error Handling Patterns

### Standard Error Response Shape (from backend)

```typescript
interface ApiError {
  error: true
  code: string             // 'INVALID_INPUT', 'NOT_FOUND', 'META_API_ERROR', etc.
  message: string          // User-facing message in Bahasa Indonesia
  details?: Record<string, any>  // Optional context
}
```

### Handler pattern

```typescript
async function callApi<T>(fn: () => Promise<T>): Promise<T | null> {
  try {
    return await fn()
  } catch (e: any) {
    const err: ApiError = e.response?.data || {
      error: true,
      code: 'UNKNOWN',
      message: 'Terjadi error tidak dikenal',
    }
    
    // Log (but no PII)
    console.error('[API]', err.code, err.message)
    
    // User notification
    toast.error(err.message)
    
    return null
  }
}

// Usage
const data = await callApi(() => api.post('/customers', newCustomer))
if (data) {
  // success
}
```

## Testing API Integration

### Mock API in E2E tests

Option A: Mock fetch / axios globally
```typescript
// tests/e2e/helpers/mock-api.ts
import { Page } from '@playwright/test'

export async function mockApi(page: Page) {
  await page.route('**/api/me', (route) => {
    route.fulfill({
      status: 200,
      body: JSON.stringify({ 
        id: 'test-user-1',
        email: 'test@example.com',
        bizName: 'Test Salon',
      })
    })
  })
}
```

Option B: Use MSW (Mock Service Worker) for comprehensive mocking

### Integration test against real staging

```typescript
test('login flow', async ({ page }) => {
  await page.goto('https://staging.getstarvio.com/login')
  await page.click('button:has-text("Lanjut dengan Google")')
  
  // Google OAuth popup — auto-complete with test user
  // (assumes staging has test bypass)
  
  await expect(page).toHaveURL(/.*\/dashboard/)
  await expect(page.getByText('Selamat datang')).toBeVisible()
})
```

## Rate Limiting

Backend has rate limits. FE should:
- Not spam requests (debounce user input 300ms)
- Retry on 429 with exponential backoff (but max 3 tries)

```typescript
async function apiWithRetry<T>(fn: () => Promise<T>, retries = 3): Promise<T> {
  try {
    return await fn()
  } catch (e: any) {
    if (e.response?.status === 429 && retries > 0) {
      const delay = 1000 * Math.pow(2, 4 - retries)  // 2s, 4s, 8s
      await new Promise(r => setTimeout(r, delay))
      return apiWithRetry(fn, retries - 1)
    }
    throw e
  }
}
```

## Security Considerations

- **Never log tokens** in console or analytics
- **Clear sensitive data** on logout (localStorage, sessionStorage)
- **Validate API responses** — jangan trust shape dari backend blindly
- **Content Security Policy** — set headers in Next.js config atau Vercel
- **HTTPS only** — force via Vercel settings

## Coordination with Kevin

**Early morning each day, check WA group:**
- "Kevin, endpoint X ready buat ditest?"
- "Mau swagger/OpenAPI updated?"

**Before merging FE PR:**
- Verify Kevin's corresponding BE endpoint deployed to staging
- Run E2E against staging

**If API contract changes:**
- Kevin update `kevin/03-API-CONTRACT.md`
- Post di WA group dengan diff
- Both update code accordingly

## Checklist

- [ ] API client setup dengan auth interceptor
- [ ] Error handling pattern established
- [ ] Loading/empty/error states for every async page
- [ ] Forms use react-hook-form + Zod validation
- [ ] Toast notifications wired up
- [ ] 401 handling → redirect login
- [ ] Retry logic for rate limits
- [ ] Types generated from API contract (manual or codegen)
- [ ] E2E tests pass against staging backend
