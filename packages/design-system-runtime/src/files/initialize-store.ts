import type * as Boot from "../contracts/boot";
import type * as Model from "../contracts";
import type * as Storage from "../contracts/model-storage";
import type * as Dom from "../contracts/dom";
import type * as Host from "../contracts/platform-host";
import type * as React from "react";
/** Restored application module; prepare first, initialize in original order. */
import { serializeIndexDocument } from "../editor/index-file-store";
import { hashStoreDocument, hashStoreFields, MIGRATION_SENTINEL_PATH } from "./migration-engine";
import { readJsonFileState } from "./paths";
import { CREATED_ON_FILES_MARKER_KEY, createdOnFilesMarker, MOVED_TO_MARKER_KEY, movedToMarker, readFileMigrationMarker } from "../model/migration-markers";

var ARTIFACT_REOPENED_STORAGE_KEY: string;
async function initializeEmptyFilesStore(
  initOptions: Boot.InitializeStoreOptions,
): Promise<Boot.InitializeStoreResult> {
  try {
    if (!initOptions.files.canWrite) {
      return {
        result: "skipped",
        reason: "not_writer",
      };
    }
    let value = await readJsonFileState(
      initOptions.files,
      initOptions.indexPath,
      initOptions.timers,
    );
    if (value.state === "unreadable") {
      return {
        result: "skipped",
        reason: "index_unreadable",
      };
    }
    if (
      value.state === "read" &&
      readFileMigrationMarker(value.value) !== null
    ) {
      return {
        result: "skipped",
        reason: "already_files",
      };
    }
    let callback = async (): Promise<
        Extract<Boot.InitializeStoreResult, { result: "skipped" }> | undefined
      > => {
        let fileState =
          initOptions.otherHome === undefined
            ? "absent"
            : await initOptions.otherHome();
        if (fileState === "content") {
          return {
            result: "skipped",
            reason: "store_has_content",
          };
        } else {
          if (fileState === "unreadable") {
            return {
              result: "skipped",
              reason: "index_unreadable",
            };
          } else {
            return undefined;
          }
        }
      },
      loadedState = await callback();
    if (loadedState !== undefined) {
      return loadedState;
    }
    if (!(await initOptions.storeUntouched())) {
      return {
        result: "skipped",
        reason: "store_has_content",
      };
    }
    let state = {
        ...initOptions.emptyIndex(),
        [CREATED_ON_FILES_MARKER_KEY]: createdOnFilesMarker({
          at: initOptions.at,
        }),
      },
      indexDocument = {
        [initOptions.indexPath]: initOptions.serializeIndex(state),
      };
    if (initOptions.mark !== undefined) {
      let migrationState = {
        v: 1,
        type: initOptions.mark.type,
        at: initOptions.at,
        ...(initOptions.mark.artifactId !== undefined
          ? {
              artifact: initOptions.mark.artifactId,
            }
          : {}),
        documents: {
          [initOptions.mark.metaPath]: await hashStoreDocument({}),
        },
        fields: {
          [initOptions.mark.metaPath]: await hashStoreFields({}),
        },
        files: {},
      };
      indexDocument[MIGRATION_SENTINEL_PATH] = serializeIndexDocument(migrationState);
    }
    let indexState = await readJsonFileState(
      initOptions.files,
      initOptions.indexPath,
      initOptions.timers,
    );
    if (indexState.state === "unreadable") {
      return {
        result: "skipped",
        reason: "index_unreadable",
      };
    }
    if (
      indexState.state === "read" &&
      readFileMigrationMarker(indexState.value) !== null
    ) {
      return {
        result: "skipped",
        reason: "already_files",
      };
    }
    if (
      indexState.state === "read" &&
      initOptions.rootHoldsContent?.(indexState.value) === true
    ) {
      return {
        result: "skipped",
        reason: "store_has_content",
      };
    }
    let existingState = await callback();
    if (existingState !== undefined) {
      return existingState;
    }
    let publishResult = await initOptions.files.publish(indexDocument, {
      ifMatch: Object.fromEntries(
        Object.keys(indexDocument).map((path) => [
          path,
          path === initOptions.indexPath && indexState.state === "read"
            ? indexState.sha256
            : null,
        ]),
      ),
    });
    if (!publishResult.ok) {
      return {
        result: "failed",
        code: publishResult.code,
      };
    }
    if (initOptions.mark !== undefined) {
      let { store: mark, metaPath: metaPath } = initOptions.mark,
        updatedState = {
          [MOVED_TO_MARKER_KEY]: movedToMarker({
            path: initOptions.indexPath,
            ver: publishResult.version,
            at: initOptions.at,
          }),
        };
      if (
        !(await mark.update(metaPath, updatedState).then(
          (): boolean => true,
          (): boolean => false,
        )) &&
        mark.set !== undefined
      ) {
        if (
          !(await mark.get(metaPath).then(
            (nonNullValue): boolean => nonNullValue !== null,
            (): boolean => true,
          ))
        ) {
          await mark.set(metaPath, updatedState).catch((): void => {
            return;
          });
        }
      }
    }
    return {
      result: "created",
      version: publishResult.version,
    };
  } catch {
    return {
      result: "failed",
      code: "upstream_error",
    };
  }
}
function announceAndWaitToReopen(
  reopenOptions: Boot.AnnounceReopenOptions,
): Promise<void> {
  let timers = reopenOptions.timers,
    leadMs = reopenOptions.leadMs ?? 2500,
    maxTypingHoldMs = leadMs + (reopenOptions.maxHoldMs ?? 15000),
    startedAt = timers.now();
  try {
    reopenOptions.say(reopenOptions.message);
  } catch {}
  let isTyping = (): boolean | undefined => {
      try {
        return reopenOptions.isTyping?.() === true;
      } catch {
        return false;
      }
    },
    hasUnsentEdits = (): boolean | undefined => {
      try {
        return reopenOptions.hasUnsentEdits?.() === true;
      } catch {
        return false;
      }
    };
  return new Promise((resolve): void => {
    let callback = (): void => {
        if (reopenOptions.note !== undefined) {
          try {
            reopenOptions.note.store?.setItem(
              "appifact-reopened",
              JSON.stringify({
                why: reopenOptions.note.why,
                at: timers.now(),
                ...(reopenOptions.note.focus !== undefined
                  ? {
                      focus: reopenOptions.note.focus,
                    }
                  : {}),
              }),
            );
          } catch {}
        }
        try {
          reopenOptions.reopen();
        } finally {
          resolve();
        }
      },
      waitForReopen = (): void => {
        let value = timers.now() - startedAt;
        if (
          value >= leadMs &&
          !hasUnsentEdits() &&
          (!isTyping() || value >= maxTypingHoldMs)
        ) {
          callback();
          return;
        }
        timers.setTimeout(
          waitForReopen,
          value < leadMs ? Math.min(leadMs - value, 250) : 250,
        );
      };
    waitForReopen();
  });
}
function consumeReopenMessage(
  storage:
    | Pick<globalThis.Storage, "getItem" | "removeItem">
    | null
    | undefined,
  now: number,
): Boot.ReopenNote | undefined {
  let raw: string | null = null;
  try {
    raw = storage?.getItem("appifact-reopened") ?? null;
  } catch {
    return;
  }
  if (raw === null) {
    return;
  }
  try {
    storage?.removeItem("appifact-reopened");
  } catch {}
  try {
    let value = JSON.parse(raw) as {
      why?: unknown;
      at?: unknown;
      focus?: unknown;
    } | null;
    if (
      value === null ||
      typeof value.why !== "string" ||
      typeof value.at !== "number" ||
      now - value.at > 60000 ||
      now < value.at - 1000
    ) {
      return;
    }
    return {
      why: value.why,
      at: value.at,
      ...(typeof value.focus === "string"
        ? {
            focus: value.focus,
          }
        : {}),
    };
  } catch {
    return;
  }
}
function announceReopenedArtifact(
  reopenOptions: Boot.AnnounceReopenedOptions,
): boolean {
  let note = consumeReopenMessage(reopenOptions.store, reopenOptions.now);
  if (note === undefined) {
    return false;
  }
  try {
    reopenOptions.focus(note.focus);
  } catch {}
  try {
    reopenOptions.say(reopenOptions.message(note));
  } catch {}
  return true;
}
export {
  announceAndWaitToReopen,
  announceReopenedArtifact,
  ARTIFACT_REOPENED_STORAGE_KEY,
  consumeReopenMessage,
  initializeEmptyFilesStore,
};
export function installFilesInitializeStore(): () => void {
  return () => {
    ARTIFACT_REOPENED_STORAGE_KEY = "appifact-reopened";
  };
}
