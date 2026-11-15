import type * as FilesCore from "../contracts/files-core";
import type * as Docs from "../contracts/design-system-document";
import type * as Boot from "../contracts/boot";
import type * as Model from "../contracts";
import type * as Storage from "../contracts/model-storage";
import type * as Dom from "../contracts/dom";
import type * as Host from "../contracts/platform-host";
import type * as React from "react";
/** Restored application module; prepare first, initialize in original order. */
import { showEditorPromiseNotification } from "../editor/editable-name";
import { FILES_INDEX_PROJECT_PATH, hasFilesMigrationMarker, parseFilesIndex } from "../editor/files-index";
import { singleFileMigrationExit } from "./boot-decisions";
import { createBrowserFilesPort } from "./browser-port";
import { createLegacyDatabasePort, migrationTabHolder } from "./legacy-store-port";
import { designSystemMigrationNextAction, MIGRATION_TOO_LARGE_MESSAGE, takeUnpublishableMigrationPaths, trackMigrationDownloadFailures } from "./migration-codec";
import { migrateDesignSystemStoreToFiles, preflightLegacyStoreMigration } from "./migration-fold";
import { readJsonFileState } from "./paths";
import { markedIndexSeenBefore, recordMarkedIndexSeen } from "./per-file-boot";
import { reopenAfterFilesMigration } from "./reopen";
import { designSystemMigrationTimers, get_MIGRATION_UNREADABLE_FILE_MESSAGE, migrationStoppedForChange, readMigrationArtifactBlob, recordMigrationStoppedForChange, singleFileMigrationBootExit, singleFileMigrationBootHeld, singleFileMigrationHolder, skipMigrationForTab, temporarilyUnsavableMigrationFilesMessage, TERMINAL_MIGRATION_ERROR_CODES, unpublishableMigrationFilesMessage } from "./single-file-migration-boot";
import { get_OLDER_SINGLE_FILE_COPY_MESSAGE, migrateSingleFileDesignSystem, preflightSingleFileMigration } from "./single-file-migration";
import { reportMigrationFailure } from "./store-fold-controller";
import { currentUserId } from "../host/user-api";
import { DESIGN_SYSTEM_ENVELOPE_PATH } from "../model/file-policy";

import { set_singleFileMigrationBootExit } from "./single-file-migration-boot";
async function runDesignSystemFilesMigration(
  storeHandle: Boot.NativeLegacyDatabase,
  changeKey: string,
  home: "store" | "file" = "store",
): Promise<void> {
  if (
    typeof document !== "undefined" &&
    document.visibilityState === "hidden"
  ) {
    await new Promise<void>((input) =>
      document.addEventListener("visibilitychange", function value(): void {
        if (document.visibilityState !== "hidden") {
          document.removeEventListener("visibilitychange", value);
          input();
        }
      }),
    );
  }
  let files = (0, createBrowserFilesPort)({
      canWrite: true,
    }),
    store = (0, createLegacyDatabasePort)(storeHandle),
    blobReadable: boolean = true,
    stop = (input: string | undefined, options: boolean = true): void => {
      (0, skipMigrationForTab)();
      if (options) {
        (0, recordMigrationStoppedForChange)(
          home === "file" &&
            singleFileMigrationBootHeld &&
            !blobReadable
            ? "file:any"
            : changeKey,
        );
      }
      if (home === "file" && singleFileMigrationBootHeld) {
        set_singleFileMigrationBootExit({
          end: singleFileMigrationBootExit.end,
          ...(input !== undefined
            ? {
                notice: input,
              }
            : {}),
        });
        return;
      }
      if (input !== undefined) {
        (0, showEditorPromiseNotification)(input, null);
      }
    },
    singleFile: Model.FileTextRead | undefined;
  if (home === "file") {
    try {
      singleFile = await files.readText(DESIGN_SYSTEM_ENVELOPE_PATH);
    } catch {
      return;
    }
    changeKey = "file:" + singleFile.sha256;
    if ((0, migrationStoppedForChange)(changeKey)) {
      return;
    }
  }
  let preflight =
    singleFile !== undefined
      ? await (0, preflightSingleFileMigration)({
          files: files,
          text: singleFile.text,
        })
      : await (0, preflightLegacyStoreMigration)({
          files: files,
          store: store,
        });
  if (preflight === "not_single_file" || preflight === "not_now") {
    return;
  }
  if (preflight === "moved_before") {
    return stop(get_OLDER_SINGLE_FILE_COPY_MESSAGE(), true);
  }
  if (preflight !== null) {
    if (preflight !== "too_large") {
      (0, reportMigrationFailure)({
        result: "aborted",
        stage: "preflight",
        code: "unpublishable_file",
        ms: 0,
      });
    }
    return stop(
      preflight === "too_large"
        ? MIGRATION_TOO_LARGE_MESSAGE
        : (0, unpublishableMigrationFilesMessage)(
            preflight.unpublishable.map(
              (input: { path: string }) => input.path,
            ),
          ),
      true,
    );
  }
  (0, takeUnpublishableMigrationPaths)();
  let trackedFiles = (0, trackMigrationDownloadFailures)(files),
    outcome = await (
      home === "file"
        ? migrateSingleFileDesignSystem
        : migrateDesignSystemStoreToFiles
    )({
      files: trackedFiles.files,
      store: store,
      holder:
        home === "file"
          ? (0, singleFileMigrationHolder)()
          : (0, migrationTabHolder)(),
      by: (await (0, currentUserId)()) ?? "someone",
      timers: designSystemMigrationTimers,
      fetchBlob: readMigrationArtifactBlob,
      artifactId: location.host,
      onStage: (input: string) =>
        console.info("[design-system] move to files: " + input),
    });
  (0, reportMigrationFailure)(outcome);
  let nextAction = (0, designSystemMigrationNextAction)(outcome);
  console.info("[design-system] move to files ended: " + nextAction.why);
  if (home === "file" && outcome.result === "busy") {
    set_singleFileMigrationBootExit({
      end: "busy",
    });
  }
  if (nextAction.next === "wait") {
    return;
  }
  let indexRead = await (0, readJsonFileState)(
      files,
      FILES_INDEX_PROJECT_PATH,
    ),
    marked =
      indexRead.state === "read" &&
      (0, hasFilesMigrationMarker)(
        (0, parseFilesIndex)(indexRead.text),
      );
  if (home === "file") {
    set_singleFileMigrationBootExit({
      end: (0, singleFileMigrationExit)(
        outcome,
        marked
          ? "marked"
          : indexRead.state === "unreadable"
            ? "unreadable"
            : "unmarked",
      ),
    });
    if (marked) {
      (0, recordMarkedIndexSeen)();
      return (0, reopenAfterFilesMigration)("moved_to_files");
    }
  }
  if (marked) {
    if ((0, markedIndexSeenBefore)()) {
      return stop(undefined, false);
    }
    if ((0, recordMarkedIndexSeen)()) {
      return (0, reopenAfterFilesMigration)("moved_to_files");
    }
  }
  if (nextAction.again === true) {
    return;
  }
  let code =
      outcome.result === "aborted"
        ? outcome.code
        : outcome.result === "skipped"
          ? outcome.reason
          : "",
    failedBeforePublish =
      home === "file" &&
      outcome.result === "aborted" &&
      outcome.stage === "lease";
  blobReadable = code !== "blob_unreadable";
  if (
    code === "invalid_content" &&
    trackedFiles.downloadsRefused().length > 0
  ) {
    return stop(
      (0, temporarilyUnsavableMigrationFilesMessage)(
        trackedFiles.downloadsRefused(),
      ),
      false,
    );
  }
  stop(
    nextAction.notice ??
      (code === "blob_unreadable"
        ? get_MIGRATION_UNREADABLE_FILE_MESSAGE()
        : code === "unpublishable_file"
          ? (0, unpublishableMigrationFilesMessage)(
              (0, takeUnpublishableMigrationPaths)(),
            )
          : undefined),
    TERMINAL_MIGRATION_ERROR_CODES.has(code) && !failedBeforePublish,
  );
}
export {
  runDesignSystemFilesMigration,
};
export function installFilesApplicationMigration(): () => void {
  return () => {};
}
