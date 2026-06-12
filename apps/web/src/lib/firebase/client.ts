import { getApps, initializeApp } from "firebase/app";
import {
  buildFirebaseWebPublicConfigFromEnv,
  isFirebaseWebClientConfigured,
  type FirebaseWebPublicConfig
} from "@realmos/platform-infra";

export type FirebaseWebClientState = {
  status: "not_configured" | "configured" | "init_error";
  config: FirebaseWebPublicConfig;
  error?: string;
};

let cachedState: FirebaseWebClientState | null = null;

export function resetFirebaseWebClientCache(): void {
  cachedState = null;
}

export function getFirebaseWebClientState(
  config: FirebaseWebPublicConfig = buildFirebaseWebPublicConfigFromEnv(
    typeof process !== "undefined" ? process.env : {}
  )
): FirebaseWebClientState {
  if (cachedState) {
    return cachedState;
  }

  if (!isFirebaseWebClientConfigured(config)) {
    cachedState = { status: "not_configured", config };
    return cachedState;
  }

  try {
    const existing = getApps();
    if (existing.length === 0) {
      initializeApp({
        apiKey: config.apiKey!,
        authDomain: config.authDomain ?? undefined,
        projectId: config.projectId!,
        storageBucket: config.storageBucket ?? undefined,
        messagingSenderId: config.messagingSenderId ?? undefined,
        appId: config.appId!
      });
    }

    cachedState = { status: "configured", config };
  } catch (error) {
    cachedState = {
      status: "init_error",
      config,
      error: error instanceof Error ? error.message : "Firebase web client initialization failed."
    };
  }

  return cachedState;
}
