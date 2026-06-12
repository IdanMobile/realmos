# RealmOS — Local Ollama Node Setup (Initiative 0.22)

Version: 0.22.0  
Updated: 2026-06-12

## Architecture rule

Ollama and its models are **machine-level dependencies**, not project dependencies.

- Do **not** install models inside the repo
- Do **not** commit model files or binaries
- RealmOS only connects to a local Ollama server via HTTP

Local Ollama is for Jarvis-style work: conversation, summaries, routing, memory cleanup, status reports, local Q&A, and offline/private fallback.

**Not for:** coding agents (use online models and/or Cursor CLI).

## Preferred local model

```text
llama3.2:3b
```

## 1. Install Ollama Desktop (operator machine)

Download from [https://ollama.com](https://ollama.com) and install Ollama Desktop for macOS (Apple Silicon).

Ensure the Ollama app is running (menu bar icon).

## 2. Verify server

```bash
ollama --version
curl http://localhost:11434
ollama list
```

Expected: CLI prints a version; curl returns `Ollama is running`; `ollama list` shows installed models (may be empty on first install).

## 3. Pull the default model

```bash
ollama pull llama3.2:3b
ollama list
```

Optional smoke:

```bash
ollama run llama3.2:3b "Say hello in one sentence."
```

If Ollama Desktop does not show the model immediately after pull, restart Ollama Desktop.

## 4. Configure RealmOS

Copy and edit env (`.env` is gitignored):

```bash
cp .env.example .env
```

Required values:

```bash
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_DEFAULT_MODEL=llama3.2:3b
```

Legacy alias (optional): `REALMOS_LOCAL_MODEL=llama3.2:3b`

Optional toggles:

```bash
# REALMOS_OLLAMA_ENABLED=false     # disable live probes; always stub
# REALMOS_OLLAMA_OFFLINE_FALLBACK=false  # do not advertise fallback mode
```

## 5. Run RealmOS

```bash
pnpm bootstrap   # first time
pnpm dev         # API + web
```

Check health:

```bash
curl http://localhost:4100/api/health | jq '.checks.ollama'
```

Dashboard → **System Status** → **Local LLM (Ollama)** shows reachability, base URL, default model, fallback mode, and installed models.

## Degraded / fallback mode

When Ollama is unreachable or the default model is missing, RealmOS keeps working:

- Health may show `ollama.status: unreachable` or `fallbackActive: true`
- Local invoke returns `[local-stub] …` responses (`source: "stub"`)
- API overall status stays `ok` unless the database fails

Recovery:

1. Start Ollama Desktop
2. Run `ollama pull llama3.2:3b`
3. Restart RealmOS API (`pnpm dev` or restart API terminal)
4. Confirm `/api/health` shows `fallbackActive: false`

## Verification commands

```bash
pnpm test
pnpm typecheck
pnpm build
pnpm check:clean-start
pnpm demo:mvp   # API must be running on :4100
```

With Ollama live, demo should show `invoke.source: ollama` for local routes when the model is installed.

## CI note

GitHub Actions does **not** require Ollama. Tests mock reachable/unreachable paths; CI uses stub fallback automatically.
