# RealmOS — Dedicated Machine Plan v1

## Goal

Eventually run Jarvis HQ as an always-on hybrid local system.

## Desired Behavior

- always running
- can perform approved background tasks
- starts listening/conversation only on explicit activation such as “Jarvis”
- supports web/mobile access
- stores local memory and logs
- uses local LLM for cheap/simple tasks
- uses online models for complex tasks when allowed
- can later control computer/apps/tools safely

## MVP Runtime

Start simple:

- run web app locally
- run API locally
- run database locally
- run worker locally
- use browser dashboard
- no wake word yet
- no camera/mic yet

## Dedicated Machine Services

```text
Postgres
Redis
API server
Worker process
Web dashboard
Ollama
File/artifact storage
Audit logs
n8n optional
```

## Hardware Info Needed Later

User will provide specs later.

We need:

- OS
- CPU
- RAM
- GPU
- storage
- always-on availability
- network access
- whether it is Mac/Windows/Linux

## Security Rules

- keep secrets encrypted
- local network access disabled by default
- camera/mic disabled until approved
- no public internet exposure without security review
- remote access protected
- logs retained
- backups configured

## Future Physical Setup

- dedicated screen
- microphone
- speaker
- small control hub
- status lights
- wake word
- local network/device control
- mobile access
