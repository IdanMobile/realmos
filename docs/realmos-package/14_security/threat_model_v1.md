# RealmOS — Threat Model v1

## Purpose

RealmOS will eventually access memory, files, tools, browser, terminal, and possibly camera/microphone.

This threat model prevents the system from becoming unsafe.

## Assets to Protect

### User Assets

- personal files
- private conversations
- photos/videos
- credentials/secrets
- financial information
- crypto wallets/accounts
- emails/messages
- calendar
- browser sessions
- code repositories
- personal memory

### System Assets

- audit logs
- approval queue
- agent permissions
- memory database
- tool credentials
- model API keys
- budgets
- generated artifacts
- business data

## Threats

### T1 — Agent overreach

An agent tries to do more than its role allows.

Mitigation:

- scoped permissions
- Government check before tool use
- audit logging
- no self-permission changes

### T2 — Hidden action

An agent performs action without logging.

Mitigation:

- all tools must go through Tool Registry
- direct tool access forbidden
- audit event required for tool request/result

### T3 — Unauthorized spending

Agent spends money or creates subscription.

Mitigation:

- hard subscription approval gate
- budget policy
- cost dashboard
- explicit approval required

### T4 — Data deletion

Agent deletes files/data.

Mitigation:

- delete action high risk
- approval required
- backup/rollback plan required

### T5 — Secret exposure

Agent leaks API keys, tokens, private info.

Mitigation:

- secret scanner later
- sensitive memory classification
- redact logs
- restrict outbound messaging

### T6 — Prompt injection from web/docs

External content tells an agent to ignore rules.

Mitigation:

- treat external content as untrusted
- Government rules are system-owned
- tool outputs cannot change permissions
- quote/source separation

### T7 — Browser/session abuse

Agent uses browser while logged into private accounts.

Mitigation:

- browser automation disabled by default
- approval required
- sandbox profile later
- allowed domains list later

### T8 — Terminal danger

Agent runs destructive command.

Mitigation:

- terminal disabled by default
- approval required in MVP
- command preview
- allowlist later
- no sudo by default

### T9 — Camera/mic privacy

Agent listens/sees without activation.

Mitigation:

- camera/mic disabled by default
- activation required
- visible indicator
- approval required
- audit events

### T10 — Memory contamination

Wrong information stored permanently.

Mitigation:

- memory review
- source tracking
- confidence field later
- delete/edit memory

### T11 — Financial trading risk

Crypto agent performs trades.

Mitigation:

- trading action high risk
- approval required
- separate paper trading first
- strict wallet/API restrictions

## MVP Security Baseline

- no real email sending
- no camera/mic
- no crypto trading
- no real spending
- no subscription creation
- no hidden actions
- no direct terminal execution without approval
- local-only default runtime
