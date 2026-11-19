/** Restored application module; prepare first, initialize in original order. */
import {
  type Dynamic,
} from "../runtime-types";

var editCountStoragePrefix: Dynamic;
var PlatformEditCountPattern: Dynamic;
var PlatformEditCountAlias: Dynamic;
var lastEditTime: Dynamic;
var PlatformEditCountNow: Dynamic;
var PlatformEditCountSubscribers: Dynamic;
function normalizeArtifactPath(artifactPath?: Dynamic): Dynamic {
  return artifactPath.replace(/\/_f\/[^/]+(\/|$)/, "/_f/_$1");
}
function getEditCountStorageKey(): Dynamic {
  return typeof location === "undefined"
    ? null
    : editCountStoragePrefix + normalizeArtifactPath(location.pathname);
}
function readEditCount(): Dynamic {
  try {
    let storageKey: Dynamic = getEditCountStorageKey(),
      storedCountMatch: Dynamic = PlatformEditCountPattern.exec(
        storageKey === null ? "" : (sessionStorage.getItem(storageKey) ?? ""),
      );
    return storedCountMatch === null ? 0 : Number(storedCountMatch[1]);
  } catch {
    return 0;
  }
}
function writeEditCount(editCount?: Dynamic): Dynamic {
  try {
    let storageKey: Dynamic = getEditCountStorageKey();
    storageKey !== null && sessionStorage.setItem(storageKey, String(editCount));
  } catch {}
}
function getEditCount(): Dynamic {
  PlatformEditCountAlias ??= readEditCount();
  return PlatformEditCountAlias;
}
function recordEdit(): Dynamic {
  let now: Dynamic = PlatformEditCountNow(),
    isSameEditBurst: Dynamic = now - lastEditTime < 500;
  lastEditTime = now;
  if (isSameEditBurst) return;
  let nextEditCount: Dynamic = Math.min(getEditCount() + 1, 999999999);
  if (nextEditCount !== PlatformEditCountAlias) {
    PlatformEditCountAlias = nextEditCount;
    writeEditCount(nextEditCount);
    for (let listener of [...PlatformEditCountSubscribers] as Dynamic)
      listener(nextEditCount);
  }
}
function subscribeEditCount(listener?: Dynamic): Dynamic {
  PlatformEditCountSubscribers.add(listener);
  return (): Dynamic => {
    PlatformEditCountSubscribers.delete(listener);
  };
}
export {
  editCountStoragePrefix,
  getEditCount,
  getEditCountStorageKey,
  normalizeArtifactPath,
  PlatformEditCountAlias,
  lastEditTime as PlatformEditCountAlias_2,
  PlatformEditCountNow,
  PlatformEditCountPattern,
  PlatformEditCountSubscribers,
  readEditCount,
  recordEdit,
  subscribeEditCount,
  writeEditCount,
};
export function installPlatformEditCount(): () => void {
  return () => {
    editCountStoragePrefix = "appifact:edits:";
    PlatformEditCountPattern = /^([0-9]{1,9})(?:\/[0-9]{1,9})?$/;
    lastEditTime = -1 / 0;
    PlatformEditCountNow = (): Dynamic => Date.now();
    PlatformEditCountSubscribers = new Set();
  };
}
