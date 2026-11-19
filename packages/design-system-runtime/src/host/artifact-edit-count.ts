import type * as Host from "../contracts/platform-host";
import type * as React from "react";
/** Restored application module; prepare first, initialize in original order. */

var EDIT_COUNT_STORAGE_PATTERN: RegExp;
var artifactEditCount: number | undefined;
var lastArtifactEditTime: number;
var artifactEditNow: () => number;
var artifactEditSubscribers: Set<(count: number) => void>;
function normalizeArtifactSessionPath(path: string): string {
  return path.replace(/\/_f\/[^/]+(\/|$)/, "/_f/_$1");
}
function artifactEditStorageKey(): null | string {
  if (typeof location === "undefined") {
    return null;
  } else {
    return (
      "appifact:edits:" + normalizeArtifactSessionPath(location.pathname)
    );
  }
}
function readArtifactEditCount(): number {
  try {
    let value = artifactEditStorageKey(),
      storedCountMatch = EDIT_COUNT_STORAGE_PATTERN.exec(
        value === null ? "" : (sessionStorage.getItem(value) ?? ""),
      );
    if (storedCountMatch === null) {
      return 0;
    } else {
      return Number(storedCountMatch[1]);
    }
  } catch {
    return 0;
  }
}
function writeArtifactEditCount(count: number): void {
  try {
    let value = artifactEditStorageKey();
    if (value !== null) {
      sessionStorage.setItem(value, String(count));
    }
  } catch {}
}
function getArtifactEditCount(): number {
  artifactEditCount ??= readArtifactEditCount();
  return artifactEditCount;
}
function recordArtifactEdit(): void {
  let value = artifactEditNow(),
    isRapidEdit: boolean = value - lastArtifactEditTime < 500;
  lastArtifactEditTime = value;
  if (isRapidEdit) {
    return;
  }
  let nextEditCount: number = Math.min(getArtifactEditCount() + 1, 999999999);
  if (nextEditCount === artifactEditCount) {
    return;
  }
  artifactEditCount = nextEditCount;
  writeArtifactEditCount(nextEditCount);
  for (let subscriber of [...artifactEditSubscribers]) {
    subscriber(nextEditCount);
  }
}
export {
  artifactEditCount,
  artifactEditNow,
  artifactEditStorageKey,
  artifactEditSubscribers,
  EDIT_COUNT_STORAGE_PATTERN,
  getArtifactEditCount,
  lastArtifactEditTime,
  normalizeArtifactSessionPath,
  readArtifactEditCount,
  recordArtifactEdit,
  writeArtifactEditCount,
};
export function installHostArtifactEditCount(): () => void {
  return () => {
    EDIT_COUNT_STORAGE_PATTERN = /^([0-9]{1,9})(?:\/[0-9]{1,9})?$/;
    lastArtifactEditTime = -1 / 0;
    artifactEditNow = (): number => Date.now();
    artifactEditSubscribers = new Set();
  };
}
