import type * as Host from "../contracts/platform-host";
import type * as React from "react";
/** Restored application module; prepare first, initialize in original order. */
import { emulatorBuildMetaName } from "./compiled-page";

var emulatorPageDetected: boolean | undefined;
function emulatorHostMetaName(): string {
  return ["appifact", "emulator", "host"].join("-");
}
function isEmulatorPage(): boolean {
  emulatorPageDetected ??=
    typeof document !== "undefined" &&
    (document.querySelector(
      'meta[name="' + emulatorBuildMetaName() + '"]',
    ) !== null ||
      document.querySelector(
        'meta[name="' + emulatorHostMetaName() + '"]',
      ) !== null);
  return emulatorPageDetected;
}
export {
  emulatorHostMetaName,
  emulatorPageDetected,
  isEmulatorPage,
};
export function installPlatformEmulator(): () => void {
  return () => {};
}
