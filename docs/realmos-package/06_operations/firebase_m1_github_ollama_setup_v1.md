# Firebase + M1 Pro + GitHub + Ollama Setup v1

## Baseline

```text
Firebase = cloud platform
M1 Pro = local node
GitHub = source control
Ollama = local LLM
```

## Firebase Responsibilities

- auth
- Firestore
- hosting/app hosting
- storage
- functions when needed
- RealmOS orchestration state

## M1 Local Node Responsibilities

- Ollama
- local workers
- repo/worktree execution
- local private memory vault
- scheduler
- sync agent to Firebase

## GitHub Responsibilities

- source control
- branch history
- PRs later
- CI later

## Security Rule

Do not expose the M1 local node directly to the public internet at MVP stage.

Use local network or private tunnel/VPN only.
