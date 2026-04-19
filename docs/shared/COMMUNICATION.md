# Communication & Workflow

## Team

- **Sebastian** — Owner (non-technical, business decisions)
- **Okta** — Frontend developer
- **Kevin** — Backend developer

## Communication Channels

### WhatsApp Group (primary)

Group name: `getstarvio dev`

**Rules:**
- Technical discussion between Okta ↔ Kevin happens here
- Non-technical/business questions to Sebastian here
- Daily update end-of-day (EOD) — 1 line minimum: "done X, blocked on Y"
- No silent work — kalau stuck >30min, post di group
- Screenshots welcome, video demos better
- Use thread/reply feature untuk nggak ganggu chat flow

**NOT for:**
- Code review detail (pakai GitHub PR comments)
- Spec clarification (update `prompts/` atau ask Sebastian)

### GitHub (issues, PRs, code)

Repo: `github.com/sebastian-getstarvio/getstarvio` (atau similar)

**Issues:**
- Tag dengan: `bug`, `feature`, `blocker`, `meta-review`, `post-launch`
- Assign ke person responsible
- Link ke WA discussion kalau ada

**Pull Requests:**
- Title: `type(scope): short description`
  - `feat(fe): embedded signup integration`
  - `fix(be): webhook signature verification`
  - `chore(shared): update env template`
- Description template:
  ```
  ## What
  Brief description
  
  ## Why
  Context / problem solved
  
  ## How to test
  - Step 1
  - Step 2
  
  ## Checklist
  - [ ] E2E test pass
  - [ ] Manual test passed
  - [ ] No console errors
  - [ ] Responsive checked
  ```

## Meeting Cadence

### Weekly: Senin & Kamis 20:00 WIB

Platform: Google Meet / Zoom / WA video (pick in meeting #1, use sama terus)

**Duration:** Target 45 menit, hard cap 1 jam.

**Agenda template:**
```
1. What we shipped since last meeting (5 min each = 10 min)
2. Blockers / questions (10 min)
3. This session's plan (10 min)
4. Demo if applicable (10 min)
5. AOB (5 min)
```

**Scheduled meetings:**

| # | Date | Day | Focus |
|---|---|---|---|
| 1 | Apr 20 | Sen | Kickoff + Sprint 1 assignment |
| 2 | Apr 23 | Kam | Auth + Embedded Signup progress |
| 3 | Apr 27 | Sen | Full E2E check + Sprint 2 plan |
| 4 | Apr 29 | Tue | Submission confirmation |
| 5 | May 4 | Sen | Approval check + Sprint 3 plan |
| 6 | May 7 | Kam | Launch readiness review |
| 7 | May 11 | Sen | Post-launch retro |

**Post-meeting action:** 1 person jadi notetaker (rotate), post summary di WA group.

### Ad-hoc pair session (kalau perlu)

Kalau blocking issue butuh pair debug:
- Propose di WA group: "Kevin, pair 30 min untuk X?"
- Use screen share tool (Google Meet, Tuple, etc.)
- Max 1 jam, post summary setelahnya

## Code Workflow

### Git Branching Strategy

```
main              (production — deployed to getstarvio.com + api.getstarvio.com)
  └─ staging      (staging — deployed to staging-*.vercel.app)
       └─ feature/xxxx   (per-feature branches)
       └─ fix/xxxx       (bug fixes)
       └─ chore/xxxx     (non-feature work)
```

### Workflow per Feature

```
1. Pull latest staging:
   git checkout staging && git pull

2. Create feature branch:
   git checkout -b feature/embedded-signup-fe

3. Code + commit:
   git commit -m "feat(fe): integrate Facebook SDK"

4. Push:
   git push origin feature/embedded-signup-fe

5. Open PR → base: staging ← compare: feature/embedded-signup-fe

6. Request review from counterpart (Okta review Kevin's, vice versa)

7. After approval + CI pass → merge to staging

8. Test on staging → if OK, open new PR staging → main
   (or batch multiple features before main merge)

9. Merge main → auto-deploy via Vercel + DO webhook (Kevin set this up)
```

### Pull Request Rules

**Required:**
- ✅ 1 reviewer approval (the other dev)
- ✅ CI pass (linter + tests)
- ✅ No merge conflicts
- ✅ Description filled per template

**Forbidden:**
- ❌ Direct commit to `main` or `staging`
- ❌ Force push to shared branches
- ❌ Merge without review (kecuali hotfix — dokumen alasan di PR)
- ❌ Commit secrets / `.env` files

### Commit Message Convention

```
type(scope): description

types:
  feat     new feature
  fix      bug fix
  refactor code restructure (no behavior change)
  docs     documentation only
  chore    maintenance (deps, config)
  test     add/update tests
  perf     performance improvement
  style    formatting (no logic change)

scopes (examples):
  fe       frontend general
  be       backend general
  onboard  onboarding flow
  admin    admin panel
  templates templates management
  auth     authentication
  webhook  webhook handler
  schema   database schema
  deploy   deployment config
```

Examples:
```
feat(onboard): add 7-day active check radio
fix(webhook): verify signature with correct payload
refactor(schema): normalize meta.waba fields
docs(shared): update deployment runbook
```

## Code Review Guidelines

### Reviewer checklist
- [ ] Code readable (naming, structure)
- [ ] Logic correct
- [ ] Error handling adequate
- [ ] No hardcoded secrets
- [ ] E2E test covers new flow
- [ ] Edge cases thought of
- [ ] Mobile responsive (FE)
- [ ] API contract matches (cross-stack)

### What NOT to nit-pick
- Code style (handled by linter/formatter)
- Personal preference on naming (unless truly unclear)
- Premature optimization suggestions

### Reviewing speed SLA
- Response **within 4 hours** during working hours
- **Within 24 hours** worst case
- Kalau butuh lebih lama, kasih tau di PR + WA

## Conflict Resolution

Disagreement on implementation approach?

1. Discuss 15 min in PR comments or WA
2. Still stuck → pair call 30 min
3. Still stuck → take smaller decision (most reversible) + open issue to revisit
4. Don't escalate to Sebastian unless affecting timeline/cost

Business/priority disagreement → escalate to Sebastian.

## Availability & Async Work

### Working hours
- Default: 09:00–18:00 WIB weekdays
- Saturday: fleksibel, no mandatory meeting
- Sunday: off (kecuali emergency dekat deadline)

### Response time expectations
- WA messages: within 2 hours during working hours
- PR reviews: within 4 hours during working hours
- Blockers: immediate (flag dengan 🚨 emoji)

### Time off
- Planned: notify 2 days ahead in WA
- Sick day: notify morning-of
- During Meta review window (Apr 29–May 3), both devs should be available for any rejection-fix iteration

## When Stuck

Escalation ladder:
1. **Try 30 min** — own research (Google, docs, Stack Overflow)
2. **Post di WA group** — 1 line: "stuck on X, tried Y, expected Z got W"
3. **Pair 30 min** — call counterpart dev
4. **Read Meta dev docs** (most Meta-API issues answered there)
5. **Post in Meta dev forum** (slow response, only for API bugs)
6. **Escalate to Sebastian** — only for business decisions, not tech

## Definition of Done

Per task:
- [ ] Code merged to `staging`
- [ ] E2E test pass (kalau applicable)
- [ ] Manual smoke test pass
- [ ] Documented in PR description + code comments
- [ ] No regressions on existing features
- [ ] Responsive on mobile (FE only)
- [ ] API endpoint documented in OpenAPI / inline doc (BE only)

Per Sprint:
- [ ] All tasks for Sprint merged to `staging`
- [ ] Integration test: full user flow works
- [ ] Staging deployed + QA by Sebastian (manual)
- [ ] Merge to `main` + production deploy
- [ ] Post-sprint retro in next meeting

## Non-Negotiables

1. **Deadline discipline** — Meta submit 29 Apr malam, beta launch 10 Mei. Everything else negotiable.
2. **Daily WA EOD update** — even if progress slow
3. **PR review within 4 hours** during work hours
4. **No commit to main directly**
5. **Test before push** — kalau build/test broken di local, jangan push
6. **Secrets never committed** — double-check `.env` in `.gitignore`
7. **Meetings attended by all** — kalau skip, kirim written update beforehand
