# Jarvis Interaction Path — Initiative 0.31

Prepared: 2026-06-13  
Purpose: Enable text-only Jarvis operator chat in Command Center with local Ollama-backed responses.

## Summary

| Area | Status |
|------|--------|
| `/api/jarvis/chat` operator mode | **PASS** |
| Ollama invoke + fallback metadata | **PASS** |
| Command Center Ask Jarvis UI | **PASS** |
| Action execution from chat | **BLOCKED** |
| Voice / shell / Cursor CLI | **NOT IMPLEMENTED / BLOCKED** |

## API

### Operator mode (Command Center)

```http
POST /api/jarvis/chat
Content-Type: application/json

{
  "message": "What is the next recommended initiative?",
  "mode": "operator",
  "execute": false
}
```

Response includes:

- `mode: "operator"`
- `reply` — assistant text
- `routing` — `{ provider, source, model, fallbackActive, executeAllowed, blocked?, blockReason? }`

### Legacy mode (unchanged)

Omit `mode` or use demo create-business flow with `execute` default true (existing integration tests).

## Safety

Operator mode:

- Blocks shell/Cursor CLI/work packet dispatch/GUING bootstrap/tool invoke patterns
- Never executes business creation (`execute: false` enforced)
- System prompt includes governance context from health report
- No tools, no dispatch, no shell

## UI

- **Ask Jarvis** top bar button opens right-side chat panel
- Requires **Live API** mode (`NEXT_PUBLIC_API_BASE_URL` + running API)
- Shows model badge, fallback/degraded badge, safety notice
- Mock data mode shows clear error without calling API

## Manual smoke

```bash
pnpm --filter @realmos/api dev
pnpm --filter @realmos/web dev
# Open http://localhost:3000 — Live API badge
# Click Ask Jarvis → send "What is the next recommended initiative?"
```

## Recommended next

**0.32 — Necromancer Verification / Operator UI Hardening**
