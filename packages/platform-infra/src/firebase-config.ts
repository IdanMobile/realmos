import type { FirebaseRealmOSUsage } from "@realmos/contracts";

export type FirebaseRuntimeStatus = "not_configured" | "configured" | "disabled";
export type FirebaseRuntimeMode = "none" | "emulator" | "production";

export type FirebaseEmulatorHosts = {
  auth?: string;
  firestore?: string;
  storage?: string;
};

export type FirebaseRuntimeConfig = {
  status: FirebaseRuntimeStatus;
  mode: FirebaseRuntimeMode;
  projectId: string | null;
  enabled: boolean;
  emulatorHosts: FirebaseEmulatorHosts;
  webPublicConfig: FirebaseWebPublicConfig;
  enabledUsages: FirebaseRealmOSUsage[];
  notes: string;
};

export type FirebaseWebPublicConfig = {
  apiKey: string | null;
  authDomain: string | null;
  projectId: string | null;
  storageBucket: string | null;
  messagingSenderId: string | null;
  appId: string | null;
};

export type FirebaseServiceAvailability = "not_configured" | "emulator" | "production";

export type FirebaseHealthSnapshot = {
  status: FirebaseRuntimeStatus;
  mode: FirebaseRuntimeMode;
  projectId: string | null;
  adminStatus: "ready" | "not_configured" | "disabled" | "init_error" | "not_initialized";
  services: {
    auth: FirebaseServiceAvailability;
    firestore: FirebaseServiceAvailability;
    storage: FirebaseServiceAvailability;
  };
  emulatorHosts: FirebaseEmulatorHosts;
};

type EnvSource = Record<string, string | undefined>;

function readEnv(env: EnvSource, key: string): string | null {
  const value = env[key]?.trim();
  return value ? value : null;
}

export function isFirebaseExplicitlyDisabled(env: EnvSource = process.env): boolean {
  return env.REALMOS_FIREBASE_ENABLED === "false";
}

export function isFirebaseEmulatorMode(env: EnvSource = process.env): boolean {
  return Boolean(
    readEnv(env, "FIREBASE_AUTH_EMULATOR_HOST") ||
      readEnv(env, "FIRESTORE_EMULATOR_HOST") ||
      readEnv(env, "FIREBASE_STORAGE_EMULATOR_HOST")
  );
}

export function buildFirebaseWebPublicConfigFromEnv(env: EnvSource = process.env): FirebaseWebPublicConfig {
  const projectId = readEnv(env, "NEXT_PUBLIC_FIREBASE_PROJECT_ID") ?? readEnv(env, "FIREBASE_PROJECT_ID");

  return {
    apiKey: readEnv(env, "NEXT_PUBLIC_FIREBASE_API_KEY"),
    authDomain: readEnv(env, "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN"),
    projectId,
    storageBucket: readEnv(env, "NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET"),
    messagingSenderId: readEnv(env, "NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID"),
    appId: readEnv(env, "NEXT_PUBLIC_FIREBASE_APP_ID")
  };
}

export function isFirebaseWebClientConfigured(config: FirebaseWebPublicConfig = buildFirebaseWebPublicConfigFromEnv()): boolean {
  return Boolean(config.apiKey && config.projectId && config.appId);
}

export function buildFirebaseRuntimeConfigFromEnv(env: EnvSource = process.env): FirebaseRuntimeConfig {
  const projectId = readEnv(env, "FIREBASE_PROJECT_ID");
  const enabled = !isFirebaseExplicitlyDisabled(env) && Boolean(projectId);
  const emulatorHosts: FirebaseEmulatorHosts = {
    auth: readEnv(env, "FIREBASE_AUTH_EMULATOR_HOST") ?? undefined,
    firestore: readEnv(env, "FIRESTORE_EMULATOR_HOST") ?? undefined,
    storage: readEnv(env, "FIREBASE_STORAGE_EMULATOR_HOST") ?? undefined
  };

  let status: FirebaseRuntimeStatus = "not_configured";
  if (isFirebaseExplicitlyDisabled(env)) {
    status = "disabled";
  } else if (projectId) {
    status = "configured";
  }

  let mode: FirebaseRuntimeMode = "none";
  if (status === "configured") {
    mode = isFirebaseEmulatorMode(env) ? "emulator" : "production";
  }

  return {
    status,
    mode,
    projectId,
    enabled,
    emulatorHosts,
    webPublicConfig: buildFirebaseWebPublicConfigFromEnv(env),
    enabledUsages: [
      "auth",
      "hosting",
      "firestore",
      "storage",
      "functions",
      "realtime_dashboard_state",
      "realm_metadata",
      "coordination_state",
      "approvals",
      "communication",
      "work_packets",
      "execution_reports"
    ],
    notes: "Firebase stores RealmOS coordination only — not project product runtime."
  };
}

function resolveServiceAvailability(
  runtime: FirebaseRuntimeConfig,
  service: keyof FirebaseEmulatorHosts
): FirebaseServiceAvailability {
  if (runtime.status !== "configured") {
    return "not_configured";
  }

  if (runtime.mode === "emulator") {
    return runtime.emulatorHosts[service] ? "emulator" : "not_configured";
  }

  return "production";
}

export function buildFirebaseHealthSnapshot(
  runtime: FirebaseRuntimeConfig = buildFirebaseRuntimeConfigFromEnv(),
  adminStatus: FirebaseHealthSnapshot["adminStatus"] = "not_initialized"
): FirebaseHealthSnapshot {
  return {
    status: runtime.status,
    mode: runtime.mode,
    projectId: runtime.projectId,
    adminStatus,
    services: {
      auth: resolveServiceAvailability(runtime, "auth"),
      firestore: resolveServiceAvailability(runtime, "firestore"),
      storage: resolveServiceAvailability(runtime, "storage")
    },
    emulatorHosts: runtime.emulatorHosts
  };
}
