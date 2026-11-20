import type * as Host from "../contracts/platform-host";
import type * as React from "react";
/** Restored application module; prepare first, initialize in original order. */

var artifactHealth: Host.HealthReporter;
function getArtifactHealthReporter(): Host.HealthReporter | undefined {
  let host = (
    globalThis as typeof globalThis &
      Pick<Host.ProtocolGlobal, "__appifact_health">
  ).__appifact_health;
  if (typeof host !== "object" || host === null) {
    return;
  }
  let health = host;
  if (
    typeof health.report === "function" &&
    typeof health.track === "function"
  ) {
    return host;
  } else {
    return undefined;
  }
}
export {
  artifactHealth,
  getArtifactHealthReporter,
};
export function installTelemetryHealth(): () => void {
  return () => {
    artifactHealth = {
      report(eventName, outcome, eventDetails): void {
        try {
          getArtifactHealthReporter()?.report(eventName, outcome, eventDetails);
        } catch {}
      },
      async track<Value>(
        eventName: string,
        run: () => Value | PromiseLike<Value>,
        eventDetails?: unknown,
      ): Promise<Value> {
        let value = getArtifactHealthReporter();
        if (value === undefined) {
          return await run();
        }
        let trackedResult: Promise<Value>;
        try {
          trackedResult = value.track(eventName, run, eventDetails);
        } catch {
          return await run();
        }
        return await trackedResult;
      },
    };
  };
}
