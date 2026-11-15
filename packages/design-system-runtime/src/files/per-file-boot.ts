import { uiMessage } from '@minedesign/contracts/ui-messages';
import type * as FilesCore from "../contracts/files-core";
import type * as Docs from "../contracts/design-system-document";
import type * as Boot from "../contracts/boot";
import type * as Model from "../contracts";
import type * as Storage from "../contracts/model-storage";
import type * as Dom from "../contracts/dom";
import type * as Host from "../contracts/platform-host";
import type * as React from "react";
/** Restored application module; prepare first, initialize in original order. */
import { determineSlidesWriteAccess } from "../documents/write-access";
import { showEditorPromiseNotification } from "../editor/editable-name";
import { createEmptyFilesIndex, FILES_INDEX_PATH, FILES_INDEX_PROJECT_PATH, filesLeftOutOfMigration, isDerivedProjectPath, isRepairableDamagedText, isUnsupportedBinaryFile, projectFilePath, readTreeIndex, TREE_INDEX_FIELD } from "../editor/files-index";
import { MIGRATION_ANALYTICS_EVENTS, reportMigrationAnalytics } from "../editor/migration-banners";
import { enablePreviewRunner } from "../editor/preview-runner";
import { bootLegacyDesignSystemMode, configureLegacyDesignSystemBoot, designSystemFileHomes, designSystemFilesDebugger, designSystemFirstPaint, failedLegacyStateOutcome, get_UNREAD_LEGACY_STORE_CHANGES_MESSAGE, initializeDesignSystemFilesDebugger, isDesignSystemTypeHost, readDesignSystemInitialState, resolveDesignSystemFirstPaint } from "./application-boot";
import { chooseTreeBootOutcome, editingOffTransition, get_MIGRATED_READONLY_MESSAGE, resolveMigratedReadonlyReason } from "./boot-decisions";
import { createBrowserFilesPort } from "./browser-port";
import { designSystemCarryKey, purgeOtherViewerCarryEntries } from "./carry";
import { captureDesignSystemAndHoldBoot } from "./cover-capture";
import { createCurrentArtifactCrashStash } from "./crash-stash";
import { instrumentFilesPort } from "./debug-panel";
import { createDesignSystemFilesDocument } from "./design-system-document";
import { BOOT_FILE_READ_RETRY_DELAYS_MS, getHotCapability } from "./hot-updates";
import { createLegacyDatabasePort, migrationTabHolder } from "./legacy-store-port";
import { createDesignSystemMigrationAdapter, takeStoreFoldSummary } from "./migration-fold";
import { filesPortExtensions } from "./paths";
import { installDesignSystemTypingListener, reopenForEditingTransition, waitForBootLiveAnnouncer } from "./reopen";
import { installFilesSaveLifecycle } from "./save-queue";
import { designSystemMigrationTimers, FILES_DOCUMENT_FETCH_TIMEOUT_MS, readMigrationArtifactBlob } from "./single-file-migration-boot";
import { createStoreToFilesFoldController, reportMigrationFailure } from "./store-fold-controller";
import { isFrameCaptureMode, observeDocumentThumbnailReadiness, prepareDesignSystemThumbnailCapture, stateEnvelopeTitle } from "./thumbnail-readiness";
import { activeHotReloadSession } from "../host/hot-reload";
import { currentUserId } from "../host/user-api";
import { EMPTY_SYSTEM_READONLY_REASON, isMigrationExemptHost } from "../model/boot";
import { isHeldFilePointer } from "../model/file-policy";
import { createdOnFilesMarker, readFileMigrationMarker } from "../model/migration-markers";
import { bootHealthOutcome, monitorSyncLoadHealth, monitorSyncSaveHealth } from "../model/publish";
import { parseStoredSystemMetadata } from "../model/store-compose";
import { SYSTEM_META_DOCUMENT_PATH } from "../model/stored-file-codec";
import { setFileSystemDocumentFactory } from "../model/system-store";
import { isSystemEditingDisabled, updateStoredSystemMigrationFlags } from "../model/system-sync";
import { artifactHealth } from "../telemetry/health";

import { set_perFileDesignSystemBooted } from "./application-boot";
import { set_activeDesignSystemDocument } from "./reopen";
var EXTERNAL_CHANGES_FOLDED_MESSAGE: string;
var designSystemTypeReadonlyReason: () => string;
var MARKED_INDEX_STORAGE_PREFIX: string;
async function bootPerFileDesignSystem(
  outcome: Boot.LegacyInitialState,
  readOnlyReason?: string,
  storeHandle: Boot.NativeLegacyDatabase | null = null,
  emptyIndex?: Model.FilesIndex,
): Promise<void> {
  if ((0, isFrameCaptureMode)()) {
    return (0, captureDesignSystemAndHoldBoot)();
  }
  set_perFileDesignSystemBooted(true);
  (0, enablePreviewRunner)(
    window,
    (0, getHotCapability)()?.signal,
    BOOT_FILE_READ_RETRY_DELAYS_MS,
  );
  let indexPath = FILES_INDEX_PROJECT_PATH;
  (0, installDesignSystemTypingListener)();
  (0, waitForBootLiveAnnouncer)(readOnlyReason);
  let title = (0, stateEnvelopeTitle)(outcome.state);
  if (title !== undefined) {
    document.title = title;
  }
  if (!isDesignSystemTypeHost) {
    (0, initializeDesignSystemFilesDebugger)();
  }
  let access =
      readOnlyReason === undefined && !isDesignSystemTypeHost
        ? await (0, determineSlidesWriteAccess)()
        : {
            canWrite: false,
            reason: readOnlyReason ?? designSystemTypeReadonlyReason(),
          },
    stash = access.canWrite
      ? await (0, createCurrentArtifactCrashStash)("design-system")
      : null,
    viewerId = await (0, currentUserId)();
  try {
    (0, purgeOtherViewerCarryEntries)(sessionStorage, viewerId);
  } catch {}
  let files = (0, createBrowserFilesPort)({
      canWrite: access.canWrite,
      fetch: (input) =>
        fetch(input, {
          credentials: "same-origin",
          signal: AbortSignal.timeout(
            FILES_DOCUMENT_FETCH_TIMEOUT_MS,
          ),
        }),
      fetchFresh: (input) =>
        fetch(input, {
          credentials: "same-origin",
          cache: "no-store",
          signal: AbortSignal.timeout(
            FILES_DOCUMENT_FETCH_TIMEOUT_MS,
          ),
        }),
      onRead: (input, options, context, value) =>
        designSystemFilesDebugger?.read(
          input,
          options,
          context,
          value,
        ),
      onPublishError: (input) =>
        designSystemFilesDebugger?.event("publish-raw-error", input),
    }),
    instrumentedFiles =
      designSystemFilesDebugger !== undefined
        ? (0, instrumentFilesPort)(
            files,
            designSystemFilesDebugger,
          )
        : files;
  designSystemFilesDebugger?.field(
    uiMessage("design-system.perFileBoot.canWrite"),
    String(access.canWrite),
  );
  (0, setFileSystemDocumentFactory)(
    (options: Host.ArtifactParser<Model.DesignSystemContent>) => {
      let value: Docs.DesignSystemFilesDocument = (0,
      createDesignSystemFilesDocument)({
        port: instrumentedFiles,
        indexPath: indexPath,
        ...(emptyIndex !== undefined
          ? {
              startWhenNoIndex: () => emptyIndex,
            }
          : {}),
        parseContent: options.parseContent,
        initialContent: options.initialContent,
        defaultTitle: document.title || options.defaultTitle,
        ...(readOnlyReason !== undefined
          ? {
              readOnlyReason: readOnlyReason,
            }
          : access.reason !== undefined
            ? {
                readOnlyReason: access.reason,
              }
            : {}),
        lazy: !access.canWrite,
        onNotice: (input: string): void => {
          designSystemFilesDebugger?.event("notice", {
            text: input,
          });
          (0, showEditorPromiseNotification)(input, null);
        },
        generated: true,
        onEvent: (input: string, options2: unknown) =>
          designSystemFilesDebugger?.event("ds-" + input, options2),
        reveal: designSystemFirstPaint,
        ...(stash !== null
          ? {
              saveStash: stash,
            }
          : {}),
        stashKey: (0, designSystemCarryKey)(viewerId),
        paced: true,
        onHotEvent: (input: FilesCore.FilesHotEvent): void => {
          designSystemFilesDebugger?.hotEvent(input);
          if (input.type === "applied") {
            afterTwoAnimationFrames(() =>
              designSystemFilesDebugger?.visible(
                input.to!,
                "adopted",
              ),
            );
          }
        },
        onBeforeRestart: (input: string) =>
          designSystemFilesDebugger?.beforeRestart(input),
      });
      (0, installFilesSaveLifecycle)(value.queue());
      (0, monitorSyncLoadHealth)(value, (input: Boot.HealthReport) =>
        artifactHealth.report(...input),
      );
      (0, monitorSyncSaveHealth)(value, (input: Boot.HealthReport) =>
        artifactHealth.report(...input),
      );
      (0, observeDocumentThumbnailReadiness)(value);
      provideDesignSystemFilesDebugState(value, files, indexPath);
      let values = new Set<string>();
      value.subscribe((): void => {
        if (value.loadState() !== "live" || value.readOnly()) {
          return;
        }
        let files2 = value.content().files,
          value2 = (0, filesLeftOutOfMigration)(files2).filter(
            (input: { path: string }) =>
              !values.has(input.path) &&
              !(0, isRepairableDamagedText)(
                input.path,
                files2[input.path] ?? "",
              ) &&
              !(0, isUnsupportedBinaryFile)(
                input.path,
                files2[input.path] ?? "",
              ) &&
              !(0, isHeldFilePointer)(
                input.path,
                files2[input.path] ?? "",
              ),
          );
        for (let value3 of value2) {
          values.add(value3.path);
        }
        if (value2.length > 0) {
          (0, showEditorPromiseNotification)(
            (value2.length === 1
              ? '"' + value2[0].path + '"'
              : String(value2.length) + " files") +
              " can’t be saved here. Give " +
              (value2.length === 1 ? uiMessage("design-system.perFileBoot.itAnotherName") : uiMessage("design-system.perFileBoot.themOtherNames")) +
              " without % ; : ? or #, or add " +
              (value2.length === 1 ? "it" : "them") +
              " again.",
            null,
          );
        }
      });
      let callback = (): void => {
        if (value.loadState() !== "live") {
          return;
        }
        let entry = value.index().get();
        (0, updateStoredSystemMigrationFlags)(entry);
        let value2 = (0, editingOffTransition)({
          offAtBoot: readOnlyReason === get_MIGRATED_READONLY_MESSAGE(),
          canWrite: access.canWrite,
          offNow: (0, isSystemEditingDisabled)(entry),
        });
        if (value2 === "on") {
          (0, reportMigrationAnalytics)(
            MIGRATION_ANALYTICS_EVENTS.editingCameOn,
          );
        }
        if (value2 !== null) {
          (0, reopenForEditingTransition)(value2);
        }
      };
      value.subscribe(callback);
      value.whenLoaded().then((): void => {
        designSystemFilesDebugger?.phase(uiMessage("design-system.perFileBoot.filesRead"));
        designSystemFilesDebugger?.field(
          uiMessage("design-system.perFileBoot.onVersion"),
          files.version().version,
        );
        afterTwoAnimationFrames((): void => {
          designSystemFilesDebugger?.phase(uiMessage("design-system.perFileBoot.firstPaint"));
          (0, resolveDesignSystemFirstPaint)();
          if (
            designSystemFilesDebugger !== undefined &&
            designSystemFilesDebugger.reloadReason.startsWith(
              "hot restart",
            )
          ) {
            designSystemFilesDebugger.visible(
              files.version().version,
              "restarted",
            );
          }
        });
      });
      value
        .whenLive()
        .then((): void => {
          callback();
          let value2 = value.subscribe((): void => {
            if (value.personChanged()) {
              value2();
              value.materializeOwed().catch((): void => {
                return;
              });
            }
          });
        })
        .then((): void => {
          let value2: boolean =
              (0, readTreeIndex)(outcome.state)?.convertedFrom
                ?.home === "file",
            value3 = access.canWrite && !value.readOnly();
          if (storeHandle !== null && value3 && !value2) {
            watchLegacyStoreChanges(
              storeHandle,
              files,
              value,
              (0, readTreeIndex)(outcome.state),
              indexPath,
            );
          }
          if (storeHandle !== null && access.canWrite && value2) {
            (0, createLegacyDatabasePort)(storeHandle)
              .get(SYSTEM_META_DOCUMENT_PATH)
              .then(
                (input: Model.FilesMigrationStoreDocument | null): void => {
                  if (
                    legacyStoreChangedAfterMigration(
                      input?.data,
                      (0, readTreeIndex)(outcome.state),
                    )
                  ) {
                    (0, showEditorPromiseNotification)(
                      get_UNREAD_LEGACY_STORE_CHANGES_MESSAGE(),
                      null,
                    );
                  }
                },
              )
              .catch((): void => {
                return;
              });
          }
        })
        .catch((): void => {
          return;
        });
      set_activeDesignSystemDocument(value);
      return value;
    },
  );
}
function legacyStoreChangedAfterMigration(
  meta: unknown,
  index: Model.FilesIndex | undefined,
): boolean {
  let marker = (0, readFileMigrationMarker)(index)?.marker,
    storeChangedAt = (0, parseStoredSystemMetadata)(meta)?.lastChange
      ?.at,
    storeTime = Date.parse(
      typeof storeChangedAt === "string" ? storeChangedAt : "",
    ),
    migrationTime = (Date.parse as (value: unknown) => number)(
      marker?.at ?? "",
    );
  return (
    Number.isFinite(storeTime) &&
    Number.isFinite(migrationTime) &&
    storeTime > migrationTime
  );
}
function watchLegacyStoreChanges(
  storeHandle: Boot.NativeLegacyDatabase,
  files: Model.BrowserFilesPort,
  document2: Docs.DesignSystemFilesDocument,
  bootIndex: Model.FilesIndex | undefined,
  indexPath: string = FILES_INDEX_PROJECT_PATH,
): void {
  let warned: boolean = false,
    store = (0, createLegacyDatabasePort)(storeHandle),
    adapter = (0, createDesignSystemMigrationAdapter)(
      readMigrationArtifactBlob,
      indexPath,
    );
  (0, createStoreToFilesFoldController)({
    adapter: adapter,
    files: files,
    store: store,
    holder: (0, migrationTabHolder)(),
    timers: designSystemMigrationTimers,
    artifactId: location.host,
    onFolded: (input: Model.FileRemoteChange) =>
      void document2.applyRemote(input).catch((): void => {
        return;
      }),
    onOutcome: (input: Boot.MigrationOutcome): void => {
      (0, reportMigrationFailure)(input);
      if (input.result === "folded") {
        let value = (0, takeStoreFoldSummary)(),
          items = [
            ...(value.came ? [uiMessage("design-system.perFileBoot.changesMadeToThisDesign")] : []),
            ...(value.kept.length > 0
              ? [storeFoldKeptFilesMessage(value.kept)]
              : []),
          ];
        if (items.length > 0) {
          (0, showEditorPromiseNotification)(items.join(" "), null);
        }
        if (value.came) {
          setTimeout((): void => {
            document2.regenerate();
            document2.flushNow();
          }, 2000);
        }
      }
      if (
        input.result === "skipped" &&
        input.reason === "no_record" &&
        !warned
      ) {
        store
          .get(SYSTEM_META_DOCUMENT_PATH)
          .then((input2: Model.FilesMigrationStoreDocument | null): void => {
            if (
              legacyStoreChangedAfterMigration(input2?.data, bootIndex) &&
              !warned
            ) {
              warned = true;
              (0, showEditorPromiseNotification)(
                get_UNREAD_LEGACY_STORE_CHANGES_MESSAGE(),
                null,
              );
            }
          })
          .catch((): void => {
            return;
          });
      }
    },
  }).watch();
}
function storeFoldKeptFilesMessage(
  kept: readonly Boot.FoldKeptFile[],
): string {
  let describeFiles = (items: readonly Boot.FoldKeptFile[]) =>
      items.length === 1 ? items[0].path : String(items.length) + " files",
    changed = kept.filter((input): boolean => input.why === "changed"),
    gone = kept.filter((input): boolean => input.why === "gone"),
    cannot = kept.filter((input): boolean => input.why === "cannot");
  return [
    ...(changed.length > 0
      ? [
          uiMessage("design-system.perFileBoot.aChangeMadeOutsideThis") +
            describeFiles(changed) +
            " was not put over what is here, because " +
            (changed.length === 1 ? uiMessage("design-system.perFileBoot.itWas") : uiMessage("design-system.perFileBoot.theyWere")) +
            ' changed here too or could not be compared. Where it is text or tokens, the other version was saved beside it with "(other version)" in its name.',
        ]
      : []),
    ...(gone.length > 0
      ? [
          uiMessage("design-system.perFileBoot.aChangeMadeOutsideThis") +
            describeFiles(gone) +
            " was left out, because " +
            (gone.length === 1 ? uiMessage("design-system.perFileBoot.thatFileWas") : uiMessage("design-system.perFileBoot.thoseFilesWere")) +
            " removed here.",
        ]
      : []),
    ...(cannot.length > 0
      ? [
          uiMessage("design-system.perFileBoot.somethingSavedOutsideThisPage") +
            describeFiles(cannot) +
            " was left out: " +
            (cannot.length === 1 ? uiMessage("design-system.perFileBoot.itIs") : uiMessage("design-system.perFileBoot.theyAre")) +
            " of a kind, or named in a way, that cannot be saved here.",
        ]
      : []),
  ].join(" ");
}
function afterTwoAnimationFrames(callback: () => void): void {
  if (typeof requestAnimationFrame !== "function") {
    setTimeout(callback, 32);
    return;
  }
  requestAnimationFrame(() => requestAnimationFrame(callback));
}
function provideDesignSystemFilesDebugState(
  document2: Docs.DesignSystemFilesDocument,
  files: Model.BrowserFilesPort,
  indexPath: string = FILES_INDEX_PROJECT_PATH,
): void {
  if (designSystemFilesDebugger === undefined) {
    return;
  }
  let extensions = (0, filesPortExtensions)(files);
  designSystemFilesDebugger.provide({
    files: () => {
      let items = [],
        files2 = document2.content().files,
        value: Map<string, string> =
          extensions.knownListing?.() ?? new Map<string, string>(),
        value2 = document2.flagged(),
        value3 = document2.held();
      items.push({
        path: indexPath,
        sha: document2.index().baseSha(),
        liveSha: extensions.liveSha?.(indexPath) ?? null,
        state: document2.index().dirty() ? "changed here" : "",
      });
      for (let value4 of Object.keys(files2).sort()) {
        let value5 = (0, projectFilePath)(value4);
        if (!value.has(value5) && !value2.has(value4)) {
          continue;
        }
        items.push({
          path: value5,
          sha: extensions.heldSha?.(value5) ?? null,
          liveSha: extensions.liveSha?.(value5) ?? null,
          size: files2[value4].length,
          state: [
            value2.has(value4)
              ? "FLAGGED (" + (document2.flags().get(value4)?.why ?? "") + ")"
              : "",
            value3.has(value5) ? "theirs held" : "",
          ]
            .filter(Boolean)
            .join(" "),
        });
      }
      for (let [value4, value5] of value) {
        if ((0, isDerivedProjectPath)(value4)) {
          items.push({
            path: value4,
            sha: value5,
            liveSha: extensions.liveSha?.(value4) ?? null,
            state: "generated",
          });
        }
      }
      return items;
    },
    queue: () => {
      let value = document2.queue(),
        value2 = value.state();
      return {
        dirty: value2.dirty > 0 ? [String(value2.dirty) + " path(s)"] : [],
        inFlight: value2.inFlight,
        ...(value2.lastError !== undefined
          ? {
              lastError: value2.lastError,
            }
          : {}),
        conflicted: [...document2.flagged()].map(projectFilePath),
        note:
          "a flagged file is kept out of the queue until the person chooses; withdrawn: " +
          ([...value.withdrawn()].join(", ") || "none"),
      };
    },
  });
}
function releaseEarlyHotUpdatesForLegacyMode(): void {
  if (
    activeHotReloadSession === undefined ||
    !activeHotReloadSession.active
  ) {
    return;
  }
  let value: boolean = activeHotReloadSession.queued.length > 0;
  activeHotReloadSession.detach();
  if (!value) {
    return;
  }
  activeHotReloadSession.queued.splice(0);
  try {
    (0, getHotCapability)()?.restart?.({
      note: "adopted during boot; not the per-file mode",
    });
  } catch {}
}
async function bootDesignSystemFilesMode(): Promise<void> {
  let initialState = (0, readDesignSystemInitialState)();
  if (isDesignSystemTypeHost) {
    return (0, bootLegacyDesignSystemMode)(
      undefined,
      null,
      initialState,
    );
  }
  let outcome = await initialState,
    tree = (0, readTreeIndex)(outcome.state),
    decision = (0, chooseTreeBootOutcome)({
      origin: outcome.origin,
      tree: tree !== undefined,
      project: designSystemFileHomes.project,
      pipeline: (0, isMigrationExemptHost)(location.hostname),
      editingOff:
        tree !== undefined && (0, isSystemEditingDisabled)(tree),
    });
  artifactHealth.report(
    ...((decision.boot === "empty"
      ? (["render", "success"] as const)
      : (0, bootHealthOutcome)(
          outcome,
          isDesignSystemTypeHost,
        )) as Boot.HealthReport),
  );
  if (decision.boot === "tree") {
    return bootPerFileDesignSystem(
      outcome,
      (0, resolveMigratedReadonlyReason)(
        decision.readOnly,
        decision.readOnly === get_MIGRATED_READONLY_MESSAGE()
          ? await (0, determineSlidesWriteAccess)()
          : undefined,
      ),
    );
  }
  if (decision.boot === "empty") {
    if (!(await (0, determineSlidesWriteAccess)()).canWrite) {
      (0, configureLegacyDesignSystemBoot)(
        {
          state: {},
          origin: "demo",
          stateFileFound: false,
        },
        null,
        decision.readOnly ?? EMPTY_SYSTEM_READONLY_REASON,
      );
      (0, prepareDesignSystemThumbnailCapture)();
      return;
    }
    activeHotReloadSession?.armReady();
    let state = {
      ...(0, createEmptyFilesIndex)(),
      createdOnFiles: {
        ...(0, createdOnFilesMarker)({
          at: new Date().toISOString(),
        }),
      },
    };
    return bootPerFileDesignSystem(
      {
        state: {
          title: "",
          content: {
            v: 2,
            files: {},
          },
          [TREE_INDEX_FIELD]: state,
        },
        origin: "instance",
        stateFileAt: FILES_INDEX_PATH,
      },
      decision.readOnly,
      null,
      state,
    );
  }
  if (decision.boot === "readonly") {
    (0, configureLegacyDesignSystemBoot)(
      {
        state: {},
        origin: "demo",
        stateFileFound: false,
      },
      null,
      decision.reason,
    );
    (0, prepareDesignSystemThumbnailCapture)();
    return;
  }
  (0, configureLegacyDesignSystemBoot)(
    outcome.origin === "failed"
      ? outcome
      : (0, failedLegacyStateOutcome)(
          Error(uiMessage("design-system.perFileBoot.thisDesignSystemSList")),
        ),
  );
  (0, prepareDesignSystemThumbnailCapture)();
}
function markedIndexSeenBefore(): boolean | undefined {
  try {
    if (
      sessionStorage.getItem(MARKED_INDEX_STORAGE_PREFIX + location.host) !==
      null
    ) {
      return true;
    }
  } catch {}
  try {
    return history.state?.dsMarkedIndex === true;
  } catch {
    return false;
  }
}
function recordMarkedIndexSeen(): boolean | undefined {
  try {
    sessionStorage.setItem(MARKED_INDEX_STORAGE_PREFIX + location.host, "1");
    return true;
  } catch {}
  try {
    history.replaceState(
      {
        ...history.state,
        dsMarkedIndex: true,
      },
      "",
    );
    return true;
  } catch {
    return false;
  }
}
function get_EXTERNAL_CHANGES_FOLDED_MESSAGE() {
  return uiMessage("design-system.perFileBoot.changesMadeToThisDesign");
}
export {
  afterTwoAnimationFrames,
  bootDesignSystemFilesMode,
  bootPerFileDesignSystem,
  designSystemTypeReadonlyReason,
  get_EXTERNAL_CHANGES_FOLDED_MESSAGE,
  legacyStoreChangedAfterMigration,
  MARKED_INDEX_STORAGE_PREFIX,
  markedIndexSeenBefore,
  provideDesignSystemFilesDebugState,
  recordMarkedIndexSeen,
  releaseEarlyHotUpdatesForLegacyMode,
  storeFoldKeptFilesMessage,
  watchLegacyStoreChanges,
};
export function installFilesPerFileBoot(): () => void {
  return () => {
    EXTERNAL_CHANGES_FOLDED_MESSAGE =
      "Changes made to this design system outside this page were brought in.";
    designSystemTypeReadonlyReason = (): string =>
      uiMessage("design-system.perFileBoot.thisIsTheDesignSystem");
    MARKED_INDEX_STORAGE_PREFIX = "ds-marked-index/";
  };
}
