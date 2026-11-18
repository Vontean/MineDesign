/** Restored application module; prepare first, initialize in original order. */
import {
  type Dynamic,
} from "../runtime-types";
import { emulatorBuildMetaName } from "./document-compilation";

var PlatformEmulatorResolvedValue: Dynamic;
function emulatorHostMetaName(): Dynamic {
  return ["appifact", "emulator", "host"].join("-");
}
function isEmulator(): Dynamic {
  PlatformEmulatorResolvedValue ??=
    typeof document !== "undefined" &&
    ((document as Dynamic).querySelector(
      'meta[name="' + emulatorBuildMetaName() + '"]',
    ) !== null ||
      (document as Dynamic).querySelector(
        'meta[name="' + emulatorHostMetaName() + '"]',
      ) !== null);
  return PlatformEmulatorResolvedValue;
}
export {
  emulatorHostMetaName,
  isEmulator,
  PlatformEmulatorResolvedValue,
};
export function installPlatformEmulator(): () => void {
  return () => {};
}
