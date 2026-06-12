# RealmOS Local Ollama Node Audit — v0.22.0

**Date:** 2026-06-12  
**Initiative:** 0.22 — Local Ollama Node Integration  
**Prior:** [postgres_ci_smoke_audit_v0_21.md](./postgres_ci_smoke_audit_v0_21.md)

---

## Verdict

| Check | Result |
|-------|--------|
| Ollama CLI available | **PASS** (operator machine) |
| Ollama server reachable | **PASS** (`http://localhost:11434`) |
| `llama3.2:3b` installed | **PASS** (after `ollama pull`) |
| Env config documented | **PASS** (`.env.example`) |
| Router uses env default model | **PASS** |
| Live invoke path | **PASS** (when server + model available) |
| Stub fallback when unavailable | **PASS** (mocked + CI-safe) |
| Health reports Ollama details | **PASS** |
| Dashboard shows local LLM health | **PASS** |
| `pnpm test` | **PASS** |
| `pnpm typecheck` | **PASS** |
| `pnpm build` | **PASS** |
| `pnpm check:clean-start` | **PASS** |
| `pnpm demo:mvp` | **PASS** (with API running) |
| **Initiative overall** | **PASS** |

---

## What was implemented

### Configuration (`@realmos/llm-router`)

- `packages/llm-router/src/ollama-config.ts` — `OLLAMA_BASE_URL`, `OLLAMA_DEFAULT_MODEL`, legacy `REALMOS_LOCAL_MODEL` alias
- Router selects `ollama/{defaultModel}` instead of hardcoded `qwen3.5:latest`
- `buildOllamaHealthSnapshot()` for structured health

### Local provider

- `invokeLocalModel` — live `POST /api/generate` with stub fallback
- `probeOllama` — `GET /api/tags`
- No model files in repo

### API health

- `checks.ollama` includes: `status`, `baseUrl`, `defaultModel`, `fallbackActive`, `defaultModelAvailable`, `models`
- Overall API status no longer degrades solely because Ollama is offline (offline fallback is expected)

### Platform infra seed

- `buildOllamaRuntimeConfigFromEnv()` / `buildLocalNodeConfigFromEnv()` in `@realmos/platform-infra`

### Dashboard

- `SystemStatusPanel` — expanded Local LLM (Ollama) card

### Tests

- `packages/llm-router/tests/ollama-local.test.ts` — probe, invoke, health snapshot, routing
- API integration health test asserts Ollama fields

### Operator docs

- `docs/realmos-package/06_operations/ollama_local_node_setup_v0_22.md`

---

## Machine verification (operator)

```bash
ollama --version          # 0.30.7
curl http://localhost:11434
ollama pull llama3.2:3b   # if missing
ollama list               # shows llama3.2:3b
```

---

## Remaining risks

1. **Model not pulled on new machines** — fallback stub active until operator runs `ollama pull llama3.2:3b`
2. **Ollama Desktop UI lag** — model may require app restart to appear in UI
3. **CI remains stub-only** — by design; no Ollama service in GitHub Actions
4. **Legacy `REALMOS_LOCAL_MODEL`** — still supported; prefer `OLLAMA_DEFAULT_MODEL`

---

## Recommended next initiative

Operator choice:

- **Firebase baseline wiring** (scoped, no full deploy)
- **GUING bootstrap** (only if explicitly scoped)

Do not start UI polish or voice without explicit scope.
