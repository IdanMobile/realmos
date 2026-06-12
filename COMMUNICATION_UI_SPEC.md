# Communication UI Spec v1

## Purpose

The Communication page is the nervous system of RealmOS.

It shows agent messages, task threads, consultations, blockers, errors, council sessions, approval-linked messages, and final reports.

## Layout

```text
┌─────────────────────────────────────────────────────────────────────┐
│ Agent Communications                         Filters / Search       │
├───────────────┬─────────────────────────────┬───────────────────────┤
│ Channels      │ Threads / Messages          │ Thread Detail          │
│               │                             │                       │
│ Inbox         │ [BLOCKED] Alex → Archi      │ Task: API Contracts    │
│ Blockers      │ Need approval field          │ Status: Waiting        │
│ Approvals     │                             │                       │
│ Consultations │ [REVIEW] Pavel → Stan       │ Messages               │
│ Council       │ Risk review needed          │ Decisions              │
│ Errors        │                             │ Actions                │
│ Handoffs      │ [PROGRESS] Freya → Paul     │ Audit                  │
│ Reports       │ Dashboard 60% done          │ Archive                │
└───────────────┴─────────────────────────────┴───────────────────────┘
```

## Channels

- Inbox
- Blockers
- Errors
- Consultations
- Review Requests
- Handoffs
- Council Debates
- Approval Requests
- Progress Reports
- Final Reports
- Archived

## Top Cards

- Open Blockers
- Pending Reviews
- Approval Requests
- Critical Errors
- Council Sessions
- Missing Heartbeats
- Unresolved Threads

## Thread Detail Tabs

### Conversation

Shows full message history.

### Context

Shows business, task, run, artifacts, memory refs, and approval refs.

### Decisions

Shows extracted decisions only.

### Errors

Shows error reports only.

### Actions

Reply, assign, escalate, create task, request review, create approval, mark resolved, archive.

### Audit

Shows immutable linked audit events.

### Archive

Shows markdown export path and archive summary.

## MVP Behavior

MVP should support:

- list threads
- open thread
- read all messages
- filter by message type
- view decisions
- view blockers/errors
- archive thread
- link to business/task/approval

## Later Behavior

Later add:

- real-time updates
- graph view
- communication analytics
- weekly communication digest
- agent performance analysis
- Obsidian export
