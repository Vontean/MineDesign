/** Restored application module; prepare first, initialize in original order. */
import {
  type Dynamic,
} from "../runtime-types";
import { requestHostCapability } from "./host-capabilities";

var MAX_DATABASE_COLLECTION_DOCS: Dynamic;
var KNOWN_DATABASE_ERROR_CODES: Dynamic;
var DATABASE_ACCESS_DENIED_CODES: Dynamic;
function normalizeDatabaseError(error?: Dynamic): Dynamic {
  let record: Dynamic =
      typeof error == "object" && error !== null ? error : {},
    isDatabaseTypeError: Dynamic =
      record.name === "TypeError" &&
      typeof record.message == "string" &&
      record.message.startsWith("db "),
    code: Dynamic =
      typeof record.code == "string" &&
      KNOWN_DATABASE_ERROR_CODES.includes(record.code)
        ? record.code
        : isDatabaseTypeError
          ? "invalid_argument"
          : "unavailable",
    message: Dynamic =
      typeof record.message == "string"
        ? record.message
        : error instanceof Error
          ? error.message
          : String(code);
  return {
    code: code,
    message: message,
  };
}
function isDatabaseCapability(capability?: Dynamic): Dynamic {
  return (
    typeof capability == "object" &&
    capability !== null &&
    typeof capability.doc == "function" &&
    typeof capability.collection == "function"
  );
}
async function resolveDatabaseCapability(): Promise<Dynamic> {
  // MineDesign: the host is globalThis.designHost (packages/design/src/editor/design-host.ts), not globalThis.claude.
  let designHost: Dynamic = (globalThis as Dynamic).designHost;
  try {
    if (typeof designHost?.use == "function") {
      let capability: Dynamic = await requestHostCapability("db");
      return isDatabaseCapability(capability) ? capability : null;
    }
  } catch {
    return null;
  }
  return isDatabaseCapability(designHost?.db) ? designHost.db : null;
}
function createRealtimeDatabaseAdapter(database?: Dynamic): Dynamic {
  return {
    subscribe(collectionPath: Dynamic, onChanges: Dynamic, onError: Dynamic): Dynamic {
      let isFirstSnapshot: Dynamic = true,
        unsubscribe: Dynamic;
      try {
        unsubscribe = database
          .collection(collectionPath)
          .limit(MAX_DATABASE_COLLECTION_DOCS)
          .onSnapshot(
            (snapshot?: Dynamic): Dynamic => {
              let changes: Dynamic = [];
              for (let documentChange of snapshot.docChanges() as Dynamic) {
                let documentPath: Dynamic = collectionPath + "/" + documentChange.doc.id;
                documentChange.type === "removed"
                  ? changes.push({
                      type: "removed",
                      path: documentPath,
                    })
                  : changes.push({
                      type: documentChange.type,
                      path: documentPath,
                      data: documentChange.doc.data() ?? {},
                    });
              }
              let isInitialSnapshot: Dynamic = isFirstSnapshot;
              isFirstSnapshot = false;
              onChanges(changes, {
                initial: isInitialSnapshot,
                fromCache: snapshot.metadata?.fromCache === true,
                hasPendingWrites: snapshot.metadata?.hasPendingWrites === true,
              });
            },
            (snapshotError?: Dynamic): Dynamic =>
              onError(normalizeDatabaseError(snapshotError)),
          );
      } catch (subscriptionError: Dynamic) {
        queueMicrotask(
          (): Dynamic => onError(normalizeDatabaseError(subscriptionError)),
        );
      }
      return (): Dynamic => {
        try {
          unsubscribe?.();
        } catch {}
      };
    },
    async set(documentPath: Dynamic, documentFields: Dynamic): Promise<Dynamic> {
      try {
        await database.doc(documentPath).set({
          ...documentFields,
        });
      } catch (writeError: Dynamic) {
        throw normalizeDatabaseError(writeError);
      }
    },
    async update(documentPath: Dynamic, fieldUpdates: Dynamic): Promise<Dynamic> {
      try {
        await database.doc(documentPath).update({
          ...fieldUpdates,
        });
      } catch (updateError: Dynamic) {
        throw normalizeDatabaseError(updateError);
      }
    },
    async del(documentPath: Dynamic): Promise<Dynamic> {
      try {
        await database.doc(documentPath).delete();
      } catch (deletionError: Dynamic) {
        throw normalizeDatabaseError(deletionError);
      }
    },
  };
}
async function getRealtimeDatabaseAdapter(): Promise<Dynamic> {
  let capability: Dynamic = await resolveDatabaseCapability();
  return capability === null ? null : createRealtimeDatabaseAdapter(capability);
}
export {
  createRealtimeDatabaseAdapter,
  DATABASE_ACCESS_DENIED_CODES,
  getRealtimeDatabaseAdapter,
  isDatabaseCapability,
  KNOWN_DATABASE_ERROR_CODES,
  MAX_DATABASE_COLLECTION_DOCS,
  normalizeDatabaseError,
  resolveDatabaseCapability,
};
export function installPlatformDatabaseAdapter(): () => void {
  return () => {
    MAX_DATABASE_COLLECTION_DOCS = 1e3;
    KNOWN_DATABASE_ERROR_CODES = [
      "invalid_argument",
      "resource_exhausted",
      "quota_exceeded",
      "unavailable",
      "revoked",
      "not_granted",
      "capability_disabled",
      "capability_removed",
      "transform_error",
    ];
    DATABASE_ACCESS_DENIED_CODES = [
      "revoked",
      "not_granted",
      "capability_disabled",
      "capability_removed",
    ];
  };
}
