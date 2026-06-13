# Browser E2E Smoke — Initiative 0.35

Version: 0.35.0  
Prepared: 2026-06-12

## Purpose

Add minimal Playwright browser smoke coverage for Command Center core operator flows without requiring Ollama, Postgres, or production deployment.

## Framework

- **Playwright** (`@playwright/test` in `@realmos/web`)
- Config: `apps/web/playwright.config.ts` (live API via E2E mock server)
- Mock-seed config: `apps/web/playwright.mock.config.ts` (unreachable API → seed JSON)

## Startup strategy

| Mode | Web | API | Ollama | Postgres |
|------|-----|-----|--------|----------|
| **Live mock API** (primary) | `next start :3000` (built with `NEXT_PUBLIC_API_BASE_URL=http://127.0.0.1:4199`) | `apps/web/e2e/mock-api-server.mjs` on `:4199` | Not required (stub Jarvis) | Not required |
| **Mock seed** (secondary) | `next dev :3002` with unreachable API URL | None | Not required | Not required |

Playwright `webServer` starts mock API + web app automatically.

## Commands

```bash
# Install Chromium (once per machine / CI)
pnpm test:e2e:install

# Full browser smoke (rebuilds web for mock API URL, runs both configs)
pnpm test:e2e
```

## Specs

| File | Coverage |
|------|----------|
| `e2e/command-center.smoke.spec.ts` | A–E flows + safety (live mock API) |
| `e2e/mock-mode.smoke.spec.ts` | Mock badge + Jarvis degraded state |
| `e2e/safety-assertions.ts` | Shared forbidden-control checks |

## CI

E2E runs in GitHub Actions after `pnpm build`:

1. `pnpm test:e2e:install`
2. `pnpm test:e2e`

## Live API smoke (manual)

For full-stack smoke against real `@realmos/api`:

```bash
pnpm dev   # API :4100 + web :3000
# Manual browser check — not automated in 0.35 CI
```

Document gaps in audit; do not require Ollama for CI E2E.

## Safety assertions (automated)

- No shell execution button
- No Cursor CLI button
- No delete button (Necromancer / operator destructive)
- No autonomous cleanup control
- GUING/side projects shown as blocked
- Jarvis cannot execute actions (safety notice + no execute button)

## Recommended next

**0.36 — Cursor IDE Exit Readiness Audit / Remaining Base-System Gaps** — await operator approval.
