# Cursor Prompt — Phase 1: Contracts + Mock Dashboard

Implement Phase 1 of RealmOS / Jarvis HQ.

Goal:
Create the first visible MVP shell using mock data only.

Use TypeScript and React/Next.js.

Do not implement real LLM calls yet.
Do not implement real terminal commands yet.
Do not implement voice/camera/mic.

Build:

1. Monorepo structure.
2. Shared TypeScript contracts:
   - Business
   - Agent
   - Task
   - Memory
   - ApprovalRequest
   - AuditEvent
   - Budget
   - CostEntry
   - WorldMap
   - WorldNode
   - WorldEdge
3. Mock dataset:
   - Jarvis global system
   - 3 businesses
   - 12 agents
   - tasks in different states
   - approval requests
   - memory summaries
   - cost summary
   - world nodes
4. Dashboard UI:
   - left navigation
   - Jarvis briefing panel
   - business cards
   - active agents
   - task board
   - approval queue
   - memory summaries
   - cost/budget overview
   - recent activity
   - simple world section

Rules:
- Keep UI clean and practical.
- Dark command-center style.
- No over-engineering.
- Use the contracts as source of truth.
- Make it easy to replace mock data with API later.
