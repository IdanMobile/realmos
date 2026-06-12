import { afterEach, describe, expect, it, vi } from "vitest";
import {
  buildFirebaseBaselineHealthSnapshot,
  buildFirebaseHealthSnapshot,
  buildFirebaseRuntimeConfigFromEnv,
  buildFirebaseWebPublicConfigFromEnv,
  getFirebaseAdminHandle,
  isFirebaseEmulatorMode,
  isFirebaseExplicitlyDisabled,
  isFirebaseWebClientConfigured,
  resetFirebaseAdminCache
} from "../src/index";

describe("Firebase baseline config", () => {
  afterEach(() => {
    resetFirebaseAdminCache();
    vi.unstubAllEnvs();
  });

  it("reports not_configured when FIREBASE_PROJECT_ID is missing", () => {
    vi.stubEnv("FIREBASE_PROJECT_ID", "");
    delete process.env.FIREBASE_PROJECT_ID;

    const runtime = buildFirebaseRuntimeConfigFromEnv();
    expect(runtime.status).toBe("not_configured");
    expect(runtime.mode).toBe("none");
    expect(runtime.projectId).toBeNull();

    const health = buildFirebaseHealthSnapshot(runtime, "not_configured");
    expect(health.status).toBe("not_configured");
    expect(health.services.auth).toBe("not_configured");
    expect(health.services.firestore).toBe("not_configured");
    expect(health.services.storage).toBe("not_configured");
  });

  it("reports disabled when REALMOS_FIREBASE_ENABLED=false", () => {
    vi.stubEnv("FIREBASE_PROJECT_ID", "realmos-dev");
    vi.stubEnv("REALMOS_FIREBASE_ENABLED", "false");

    const runtime = buildFirebaseRuntimeConfigFromEnv();
    expect(runtime.status).toBe("disabled");
    expect(runtime.enabled).toBe(false);
  });

  it("detects emulator mode from emulator host env values", () => {
    vi.stubEnv("FIREBASE_PROJECT_ID", "realmos-dev");
    vi.stubEnv("FIRESTORE_EMULATOR_HOST", "127.0.0.1:8080");
    vi.stubEnv("FIREBASE_AUTH_EMULATOR_HOST", "127.0.0.1:9099");

    expect(isFirebaseEmulatorMode()).toBe(true);

    const runtime = buildFirebaseRuntimeConfigFromEnv();
    expect(runtime.status).toBe("configured");
    expect(runtime.mode).toBe("emulator");
    expect(runtime.emulatorHosts.firestore).toBe("127.0.0.1:8080");
    expect(runtime.emulatorHosts.auth).toBe("127.0.0.1:9099");

    const health = buildFirebaseHealthSnapshot(runtime, "not_initialized");
    expect(health.services.firestore).toBe("emulator");
    expect(health.services.auth).toBe("emulator");
    expect(health.services.storage).toBe("not_configured");
  });

  it("reports production mode when project id is set without emulator hosts", () => {
    vi.stubEnv("FIREBASE_PROJECT_ID", "realmos-prod");
    delete process.env.FIRESTORE_EMULATOR_HOST;
    delete process.env.FIREBASE_AUTH_EMULATOR_HOST;
    delete process.env.FIREBASE_STORAGE_EMULATOR_HOST;

    const runtime = buildFirebaseRuntimeConfigFromEnv();
    expect(runtime.mode).toBe("production");

    const health = buildFirebaseHealthSnapshot(runtime, "not_initialized");
    expect(health.services.firestore).toBe("production");
    expect(health.services.auth).toBe("production");
    expect(health.services.storage).toBe("production");
  });

  it("does not require secrets for web public config detection", () => {
    vi.stubEnv("NEXT_PUBLIC_FIREBASE_PROJECT_ID", "");
    vi.stubEnv("NEXT_PUBLIC_FIREBASE_API_KEY", "");
    delete process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
    delete process.env.NEXT_PUBLIC_FIREBASE_API_KEY;

    const webConfig = buildFirebaseWebPublicConfigFromEnv();
    expect(isFirebaseWebClientConfigured(webConfig)).toBe(false);
  });

  it("detects configured web public config from NEXT_PUBLIC values", () => {
    vi.stubEnv("NEXT_PUBLIC_FIREBASE_API_KEY", "demo-key");
    vi.stubEnv("NEXT_PUBLIC_FIREBASE_PROJECT_ID", "realmos-dev");
    vi.stubEnv("NEXT_PUBLIC_FIREBASE_APP_ID", "1:123:web:abc");

    const webConfig = buildFirebaseWebPublicConfigFromEnv();
    expect(isFirebaseWebClientConfigured(webConfig)).toBe(true);
  });

  it("returns not_configured admin handle without crashing when Firebase is unavailable", () => {
    delete process.env.FIREBASE_PROJECT_ID;

    const handle = getFirebaseAdminHandle();
    expect(handle.status).toBe("not_configured");
    expect(handle.projectId).toBeNull();
  });

  it("builds baseline health snapshot without throwing when unconfigured", () => {
    delete process.env.FIREBASE_PROJECT_ID;
    expect(() => buildFirebaseBaselineHealthSnapshot()).not.toThrow();

    const health = buildFirebaseBaselineHealthSnapshot();
    expect(health.status).toBe("not_configured");
    expect(health.adminStatus).toBe("not_configured");
  });

  it("respects explicit disable flag in health snapshot", () => {
    vi.stubEnv("FIREBASE_PROJECT_ID", "realmos-dev");
    vi.stubEnv("REALMOS_FIREBASE_ENABLED", "false");

    expect(isFirebaseExplicitlyDisabled()).toBe(true);
    const health = buildFirebaseBaselineHealthSnapshot();
    expect(health.status).toBe("disabled");
    expect(health.adminStatus).toBe("disabled");
  });
});
