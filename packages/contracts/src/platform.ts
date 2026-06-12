export type RealmOSCloudPlatform = "firebase";
export type RealmOSLocalNodeRuntime = "m1_pro_macbook" | "m2_macbook_16gb";
export type RealmOSSourceControl = "github";
export type RealmOSLocalLLMRuntime = "ollama";

export type PlatformDecisionStatus = "selected" | "delayed" | "rejected" | "candidate";

export type RealmOSPlatformDecision = {
  id: string;
  cloudPlatform: RealmOSCloudPlatform;
  localNodeRuntime: RealmOSLocalNodeRuntime;
  sourceControl: RealmOSSourceControl;
  localLLMRuntime: RealmOSLocalLLMRuntime;
  status: PlatformDecisionStatus;
  rationale: string;
  delayedPlatforms: Array<{
    name: "supabase" | "neon" | "vercel" | "render" | "fly" | "railway" | "bigquery" | "cloud_run";
    reasonToDelay: string;
    conditionToAdopt: string;
  }>;
  createdAt: string;
  updatedAt: string;
};

export type FirebaseRealmOSUsage =
  | "auth"
  | "hosting"
  | "firestore"
  | "storage"
  | "functions"
  | "realtime_dashboard_state"
  | "realm_metadata"
  | "coordination_state"
  | "approvals"
  | "communication"
  | "work_packets"
  | "execution_reports";

export type LocalNodeUsage =
  | "local_llm"
  | "local_jarvis_conversations"
  | "local_workers"
  | "local_scheduler"
  | "repo_worktree_execution"
  | "private_files"
  | "private_memory_vault"
  | "local_automation"
  | "sync_agent";
