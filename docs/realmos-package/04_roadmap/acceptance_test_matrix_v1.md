# RealmOS — Acceptance Test Matrix v1

| Area | Test | Expected |
|---|---|---|
| Business | Create business from idea | Business exists with mission/type/status |
| Agents | Create default team | All default agents created |
| Agents | Agent has permissions | No implicit dangerous permissions |
| Tasks | Create initial tasks | Tasks assigned or unassigned correctly |
| SpecKit | Generate spec files | spec/plan/tasks/acceptance/contracts exist |
| Memory | Write global memory | Stored with scope=global |
| Memory | Write business memory | Stored with business scope only |
| Governance | Request terminal command | Approval request created |
| Governance | Create subscription | Always approval required |
| Governance | Hide logs | Blocked |
| Governance | Change permissions | Approval required |
| Cost | Record model cost | Cost entry stored |
| Dashboard | Render business | Visible in UI |
| Dashboard | Render approvals | Pending approvals visible |
| Audit | Create business | Audit event exists |
| World | Rebuild world map | Nodes reference businesses/agents |
