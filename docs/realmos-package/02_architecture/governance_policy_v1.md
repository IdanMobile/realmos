# RealmOS — Governance and Approval Policy v1

## Purpose

The Governance Kernel keeps RealmOS useful without becoming unsafe.

It controls:

- permissions
- approvals
- budgets
- risk classification
- forbidden actions
- audit logs
- escalation to user

## Risk Classes

### Low Risk

Allowed by default if agent has permission.

Examples:

- create draft task
- create draft spec
- summarize memory
- classify an idea
- create internal note
- update dashboard status
- run local reasoning without external effects

### Medium Risk

Requires approval in MVP, or policy-based approval later.

Examples:

- terminal command
- edit local files
- use premium model above threshold
- create Git branch
- read sensitive folder
- open browser automation
- connect a new API key

### High Risk

Always approval-gated.

Examples:

- spend money
- subscribe to service
- send email/message
- delete files
- push to protected branch
- deploy production
- access camera/mic
- trade crypto
- change permissions

### Critical Risk

Blocked unless manually performed by user outside system or explicit emergency protocol exists.

Examples:

- disabling audit logs
- hiding actions
- granting self-permissions
- bypassing approval queue
- exfiltrating secrets
- financial actions without confirmation

## Hard Rules

1. No subscription without explicit user approval.
2. No spending outside approved budget.
3. No hidden actions.
4. No self-permission escalation.
5. No camera/mic access without approval.
6. No messaging humans without approval.
7. No deleting data without approval.
8. No financial trades without approval.
9. No disabling logs.
10. No production deployment without approval.

## Approval Request Must Include

- action type
- requesting agent
- business context
- reason
- risk level
- expected result
- cost estimate
- rollback plan if relevant
- payload preview

## Approval UX

Approval queue should show:

- title
- description
- risk
- requested by
- business
- cost
- buttons: approve / reject
- details expandable
- audit link

## Escalation

When unsure:

- low risk: proceed and log assumption
- medium risk: ask Council or create approval
- high risk: ask user
- critical risk: block and explain
