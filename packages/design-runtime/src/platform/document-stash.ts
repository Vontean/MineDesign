/** Restored application module; prepare first, initialize in original order. */
import {
  type Dynamic,
} from "../runtime-types";
import { normalizeArtifactPath } from "./edit-count";

var readOnlyDocumentMessage: Dynamic;
var documentStashStoragePrefix: Dynamic;
var readOnlyStashStoragePrefix: Dynamic;
function getDocumentStashKey(artifactPath?: Dynamic): Dynamic {
  return (
    documentStashStoragePrefix + normalizeArtifactPath(artifactPath)
  );
}
function createSessionStorageAdapter(storageKey?: Dynamic): Dynamic {
  return {
    read(): Dynamic {
      try {
        return sessionStorage.getItem(storageKey);
      } catch {
        return null;
      }
    },
    write(serializedStash: Dynamic): Dynamic {
      try {
        sessionStorage.setItem(storageKey, serializedStash);
        return true;
      } catch {
        return false;
      }
    },
    clear(): Dynamic {
      try {
        sessionStorage.removeItem(storageKey);
      } catch {}
    },
  };
}
function createDocumentStash(): Dynamic {
  return createSessionStorageAdapter(getDocumentStashKey(location.pathname));
}
function readReadOnlyStash(): Dynamic {
  let serializedStash: Dynamic = createReadOnlyStash().read();
  return serializedStash !== null && serializedStash.length > 0 ? serializedStash : null;
}
function createReadOnlyStash(): Dynamic {
  return typeof location === "undefined"
    ? {
        read: (): Dynamic => null,
        write: (): Dynamic => false,
        clear: (): Dynamic => {},
      }
    : createSessionStorageAdapter(
        readOnlyStashStoragePrefix +
          getDocumentStashKey(location.pathname).slice(
            documentStashStoragePrefix.length,
          ),
      );
}
function hashDocumentState(serializedState?: Dynamic): Dynamic {
  let lowHash: Dynamic = 3735928559,
    highHash: Dynamic = 1103547991;
  for (let index: Dynamic = 0; index < serializedState.length; index++) {
    let characterCode: Dynamic = serializedState.charCodeAt(index);
    lowHash = Math.imul(lowHash ^ characterCode, 2654435761);
    highHash = Math.imul(highHash ^ characterCode, 1597334677);
  }
  lowHash =
    Math.imul(lowHash ^ (lowHash >>> 16), 2246822507) ^
    Math.imul(highHash ^ (highHash >>> 13), 3266489909);
  highHash =
    Math.imul(highHash ^ (highHash >>> 16), 2246822507) ^
    Math.imul(lowHash ^ (lowHash >>> 13), 3266489909);
  return (
    (highHash >>> 0).toString(16).padStart(8, "0") +
    (lowHash >>> 0).toString(16).padStart(8, "0")
  );
}
function parseDocumentStash(serializedStash?: Dynamic): Dynamic {
  if (serializedStash !== null)
    try {
      let parsedEntry: Dynamic = JSON.parse(serializedStash);
      if (
        typeof parsedEntry == "object" &&
        parsedEntry !== null &&
        (parsedEntry.v === 2 || parsedEntry.v === 1) &&
        typeof parsedEntry.at == "number" &&
        "state" in parsedEntry
      ) {
        let stashEntry: Dynamic = parsedEntry;
        return {
          at: stashEntry.at,
          state: stashEntry.state,
          ops: stashEntry.ops,
          expectEmbed:
            typeof stashEntry.expectEmbed == "string"
              ? stashEntry.expectEmbed
              : undefined,
        };
      }
    } catch {}
}
export {
  createDocumentStash,
  createReadOnlyStash,
  createSessionStorageAdapter,
  documentStashStoragePrefix,
  getDocumentStashKey,
  hashDocumentState,
  parseDocumentStash,
  readOnlyDocumentMessage,
  readOnlyStashStoragePrefix,
  readReadOnlyStash,
};
export function installPlatformDocumentStash(): () => void {
  return () => {
    readOnlyDocumentMessage =
      "You can view this artifact but not edit it. Saving needs write access from an owner.";
    documentStashStoragePrefix = "appifact-stash/";
    readOnlyStashStoragePrefix = "appifact-ro/";
  };
}
