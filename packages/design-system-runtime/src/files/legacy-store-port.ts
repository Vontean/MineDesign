import { uiMessage } from '@minedesign/contracts/ui-messages';
import type * as Boot from "../contracts/boot";
import type * as Model from "../contracts";
import type * as Storage from "../contracts/model-storage";
import type * as Dom from "../contracts/dom";
import type * as Host from "../contracts/platform-host";
import type * as React from "react";
/** Restored application module; prepare first, initialize in original order. */
import { LEGACY_DATABASE_LIST_LIMIT } from "./migration-engine";

var LEGACY_DATABASE_FRESH_READ_ATTEMPTS: number;
var LEGACY_DATABASE_FRESH_READ_DELAY_MS: number;
var migrationTabHolderId: string | undefined;
async function readFreshDatabaseSnapshot<
  Snapshot extends Boot.NativeAuthoritySnapshot,
>(read: () => Promise<Snapshot>): Promise<Snapshot> {
  for (let index: number = 0; ; index++) {
    let value = await read();
    if (
      value.metadata?.fromCache !== true &&
      value.metadata?.hasPendingWrites !== true
    ) {
      return value;
    }
    if (index + 1 >= LEGACY_DATABASE_FRESH_READ_ATTEMPTS) {
      throw Object.assign(Error(uiMessage("design-system.legacyStorePort.theStoreAnsweredFromIts")), {
        code: "not_authoritative",
      });
    }
    await new Promise(
      (resolve) => void setTimeout(resolve, LEGACY_DATABASE_FRESH_READ_DELAY_MS),
    );
  }
}
function createLegacyDatabasePort(
  handle: Boot.NativeLegacyDatabase,
): Model.FilesMigrationStore {
  return {
    async list(collectionPath) {
      let value = await readFreshDatabaseSnapshot(() =>
          handle
            .collection(collectionPath)
            .limit(LEGACY_DATABASE_LIST_LIMIT)
            .get(),
        ),
        items = [];
      for (let document of value.docs) {
        if (document.exists) {
          items.push({
            path: collectionPath + "/" + document.id,
            data: {
              ...(document.data() ?? {}),
            },
          });
        }
      }
      return items;
    },
    async get(documentId) {
      let value = await readFreshDatabaseSnapshot(() =>
        handle.doc(documentId).get(),
      );
      if (value.exists) {
        return {
          path: documentId,
          data: {
            ...(value.data() ?? {}),
          },
        };
      } else {
        return null;
      }
    },
    async update(documentId, fields): Promise<void> {
      await handle.doc(documentId).update({
        ...fields,
      });
    },
    async set(documentId, fields): Promise<void> {
      await handle.doc(documentId).set({
        ...fields,
      });
    },
    async acquire(documentId, leaseOptions) {
      let value = handle.doc(documentId);
      if (typeof value.acquire !== "function") {
        return "unsupported";
      }
      let leaseResult = await value.acquire(leaseOptions);
      return {
        acquired: leaseResult.acquired === true,
        ...(typeof leaseResult.expiresAt === "string"
          ? {
              expiresAt: leaseResult.expiresAt,
            }
          : {}),
      };
    },
    watch(collectionPath, watchOptions) {
      let flag: boolean = true,
        value: (() => void) | undefined,
        callback = (snapshot: Boot.NativeLegacyQuerySnapshot) => {
          try {
            return snapshot
              .docChanges?.()
              .map((document): string => collectionPath + "/" + document.doc.id);
          } catch {
            return;
          }
        };
      try {
        value = handle
          .collection(collectionPath)
          .limit(LEGACY_DATABASE_LIST_LIMIT)
          .onSnapshot(
            (snapshot): void => {
              if (flag) {
                flag = false;
              } else {
                watchOptions(callback(snapshot));
              }
            },
            (): void => {
              return;
            },
          );
      } catch {
        value = undefined;
      }
      return (): void => {
        try {
          value?.();
        } catch {}
      };
    },
  };
}
function migrationTabHolder(): string {
  migrationTabHolderId ??= "tab-" + crypto.randomUUID();
  return migrationTabHolderId;
}
export {
  createLegacyDatabasePort,
  LEGACY_DATABASE_FRESH_READ_ATTEMPTS,
  LEGACY_DATABASE_FRESH_READ_DELAY_MS,
  migrationTabHolder,
  migrationTabHolderId,
  readFreshDatabaseSnapshot,
};
export function installFilesLegacyStorePort(): () => void {
  return () => {
    LEGACY_DATABASE_FRESH_READ_ATTEMPTS = 5;
    LEGACY_DATABASE_FRESH_READ_DELAY_MS = 400;
  };
}
