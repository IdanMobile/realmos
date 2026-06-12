export type Artifact = {
  id: string;
  businessId?: string;
  taskId?: string;
  kind: "spec" | "plan" | "tasks" | "acceptance" | "contract" | "research" | "risk" | "report" | "other";
  title: string;
  path?: string;
  content?: string;
  metadata: Record<string, unknown>;
  createdAt: string;
};
