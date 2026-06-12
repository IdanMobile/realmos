# Memory Contract

```ts
type Memory = {
  id: string;
  scope: "global" | "business" | "agent" | "task" | "run";
  scopeId: string;
  kind: "decision" | "preference" | "knowledge" | "summary" | "artifact" | "event";
  title: string;
  content: string;
  source: "conversation" | "file" | "agent" | "tool" | "manual";
  sensitivity: "normal" | "private" | "sensitive";
  retention: "keep" | "review" | "expire";
  createdAt: string;
  updatedAt: string;
};
```
