# RealmOS — Environment Configuration v1

## `.env.example`

```bash
# Runtime
NODE_ENV=development
REALMOS_ENV=local
REALMOS_INSTANCE_NAME="Idan Jarvis HQ"

# API
API_PORT=4100
WEB_PORT=3000

# Database
DATABASE_URL=postgres://realmos:realmos@localhost:5432/realmos

# Redis
REDIS_URL=redis://localhost:6379

# Local LLM
OLLAMA_BASE_URL=http://localhost:11434
REALMOS_LOCAL_MODEL=qwen3.5:latest

# Online LLM Providers
OPENAI_API_KEY=
ANTHROPIC_API_KEY=
REALMOS_DEFAULT_ONLINE_REASONING_MODEL=
REALMOS_DEFAULT_ONLINE_CODING_MODEL=

# Cost controls
REALMOS_MONTHLY_BUDGET_USD=50
REALMOS_REQUIRE_APPROVAL_ABOVE_USD=1
REALMOS_ALLOW_ONLINE_MODELS=false

# Security / Governance
REALMOS_ALLOW_TERMINAL=false
REALMOS_ALLOW_FILESYSTEM_WRITE=true
REALMOS_ALLOW_BROWSER_AUTOMATION=false
REALMOS_ALLOW_GITHUB=false
REALMOS_ALLOW_EMAIL=false
REALMOS_ALLOW_CAMERA=false
REALMOS_ALLOW_MICROPHONE=false

# Storage
REALMOS_ARTIFACTS_DIR=./generated/artifacts
REALMOS_BUSINESSES_DIR=./generated/businesses
REALMOS_RUNS_DIR=./generated/runs

# Feature flags
REALMOS_ENABLE_MOCK_DATA=true
REALMOS_ENABLE_WORLD_VIEW=true
REALMOS_ENABLE_SPECKIT_GENERATION=true
```

## MVP Defaults

For MVP:

```bash
REALMOS_ALLOW_ONLINE_MODELS=false
REALMOS_ALLOW_TERMINAL=false
REALMOS_ALLOW_EMAIL=false
REALMOS_ALLOW_CAMERA=false
REALMOS_ALLOW_MICROPHONE=false
```

The system can still create approval requests for these actions, but it must not execute them until explicitly enabled and approved.

## Important

Even when a capability flag is enabled, Governance still controls per-action approval.
