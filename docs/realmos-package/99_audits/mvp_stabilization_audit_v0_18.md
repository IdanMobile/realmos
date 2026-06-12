# RealmOS MVP Stabilization Audit — v0.18.0

**Date:** 2026-06-12  
**Initiative:** Stabilization 0.18 — Make MVP verification truthful  
**Prior audit:** [mvp_completion_audit_v0_17.md](./mvp_completion_audit_v0_17.md) (strict FAIL)

---

## Verdict

| Check | v0.17 | v0.18 |
|-------|-------|-------|
| `pnpm test` | PASS | **PASS** |
| `pnpm typecheck` | FAIL | **PASS** |
| `pnpm build` | FAIL | **PASS** |
| `pnpm lint` | PASS (stubs) | **PASS** (stubs) |
| `pnpm demo:mvp` | not re-run | **PASS** |
| **Stabilization overall** | — | **PASS** |
| **Strict verification green** | NO | **YES** |

---

## Fixes applied

### 1. Contracts typecheck (root cause)

- **File:** `packages/contracts/src/work-loop.ts`
- **Fix:** Import `CursorRepositoryContext` from `./repository`; keep `ScopeLevel` from `./realm`.
- **Hygiene:** Removed stale committed `packages/contracts/src/**/*.d.ts` duplicates (source of truth is `.ts`; emit goes to `dist/`).

### 2. Package tsconfig (rootDir cascade)

- **Files:** `packages/work-loop`, `fleet-control`, `realm-scope`, `platform-infra` `tsconfig.json`
- **Fix:** Align with `@realmos/core` pattern — `baseUrl` + `@realmos/contracts` path alias, no `rootDir: src` that pulled contract sources outside root.

### 3. Other typecheck fixes

| File | Fix |
|------|-----|
| `packages/memory/src/access.ts` | Remove invalid 3rd arg to `permissionAllowsScope` |
| `packages/core/tests/world.test.ts` | Complete `Task` fixture fields |
| `apps/api/src/app.ts` | Type `unknown` error in Fastify handler |
| `apps/api/src/fleet-routes.ts` | Fleet plan item mapping without null predicate issue |
| `apps/api/src/intelligence-routes.ts` | Use `error_report` message type |
| `apps/api/src/platform-infra-routes.ts` | Audit type `approval_approved` |
| `apps/api/tests/api.integration.test.ts` | Add `toolRunRequests`/`toolRunResults` to seed bundles |

### 4. Documentation reconciliation

| File | Update |
|------|--------|
| `specs/realmos-mvp/tasks.md` | Honest `[x]` / `[~]` / `[ ]` reconciliation + SSOT pointer |
| `docs/.../new_chat_prompt.md` | Current state + verification commands |
| `docs/.../latest_cursor_handoff.md` | Stabilization 0.18 PASS |
| `PROJECT_STATE.md` | v0.18.0, strict green |
| `CURSOR_SSOT.md` | Active mode → MVP stabilized (not Phase 0) |
| `README.md` | Current verify commands |
| `VERIFICATION_COMMANDS.md` | Full strict bar + demo |

---

## Commands run (exact)

```bash
export PATH="$HOME/.local/node-v22.16.0-darwin-arm64/bin:$PATH"
cd /Users/idan/Documents/realmos_cursor_ready_v1_14/realmos

pnpm test        # Tasks: 17 successful, 17 total
pnpm typecheck   # Tasks: 17 successful, 17 total
pnpm build       # Tasks: 17 successful, 17 total (~16s)
pnpm lint        # Tasks: 17 successful, 17 total
pnpm demo:mvp    # MVP Demo PASSED (Ollama unreachable, stub model)
```

API was already listening on `:4100` (`EADDRINUSE` when starting second instance).

---

## Demo result

```
Health: degraded | Ollama: unreachable
Created business: Real Time Dating App (...)
Model invoke source: stub
=== MVP Demo PASSED ===
```

---

## Remaining risks (product, not verification)

1. **Lint is non-verifying** — echo scripts only; no ESLint gate.
2. **In-memory sub-stores** — work-loop, fleet, realm, platform-infra ephemeral.
3. **Ollama optional** — demo/health show `degraded` without local LLM.
4. **No Firebase/cloud** — orchestration placeholders only.
5. **UI vs locked references** — single Command Center page vs 11-tab mockup index.

These are **scope limits**, not verification failures.

---

## Strict-green statement

**Yes** — for the defined strict bar (`pnpm test`, `pnpm typecheck`, `pnpm build` all pass).  
**No** — for production/cloud MVP (Firebase, durable fleet/work-loop persistence, real lint CI).

---

## Recommended next initiative

> **Governance superseded (2026-06-12):** Historical 0.18 options below — **not active**.

**Historical (0.18 context):** lint/CI gate, durable persistence, Firebase wiring, Ollama/local node.

**Current recommended next (RealmOS-only):** **0.28 — Dogfood RealmOS Managing One Real RealmOS Task**. See `CURSOR_SSOT.md` Section 5.

Do not start GUING, side projects, or product bootstrap.

---

*End of stabilization audit.*
