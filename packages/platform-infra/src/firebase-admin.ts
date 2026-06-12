import { getApps, initializeApp } from "firebase-admin/app";
import {
  buildFirebaseHealthSnapshot,
  buildFirebaseRuntimeConfigFromEnv,
  type FirebaseHealthSnapshot,
  type FirebaseRuntimeConfig
} from "./firebase-config";

export type FirebaseAdminHandle = {
  status: "ready" | "not_configured" | "disabled" | "init_error";
  mode: FirebaseRuntimeConfig["mode"];
  projectId: string | null;
  error?: string;
};

let cachedHandle: FirebaseAdminHandle | null = null;

export function resetFirebaseAdminCache(): void {
  cachedHandle = null;
}

export function getFirebaseAdminHandle(
  runtime: FirebaseRuntimeConfig = buildFirebaseRuntimeConfigFromEnv()
): FirebaseAdminHandle {
  if (cachedHandle) {
    return cachedHandle;
  }

  if (runtime.status === "disabled") {
    cachedHandle = {
      status: "disabled",
      mode: runtime.mode,
      projectId: runtime.projectId
    };
    return cachedHandle;
  }

  if (runtime.status !== "configured" || !runtime.projectId) {
    cachedHandle = {
      status: "not_configured",
      mode: "none",
      projectId: null
    };
    return cachedHandle;
  }

  try {
    const existing = getApps();
    if (existing.length === 0) {
      initializeApp({ projectId: runtime.projectId });
    }

    cachedHandle = {
      status: "ready",
      mode: runtime.mode,
      projectId: runtime.projectId
    };
  } catch (error) {
    cachedHandle = {
      status: "init_error",
      mode: runtime.mode,
      projectId: runtime.projectId,
      error: error instanceof Error ? error.message : "Firebase Admin initialization failed."
    };
  }

  return cachedHandle;
}

export function buildFirebaseBaselineHealthSnapshot(
  runtime: FirebaseRuntimeConfig = buildFirebaseRuntimeConfigFromEnv()
): FirebaseHealthSnapshot {
  if (runtime.status !== "configured") {
    const adminStatus =
      runtime.status === "disabled" ? "disabled" : ("not_configured" as const);
    return buildFirebaseHealthSnapshot(runtime, adminStatus);
  }

  const admin = getFirebaseAdminHandle(runtime);
  const adminStatus =
    admin.status === "ready"
      ? "ready"
      : admin.status === "init_error"
        ? "init_error"
        : "not_configured";

  return buildFirebaseHealthSnapshot(runtime, adminStatus);
}
