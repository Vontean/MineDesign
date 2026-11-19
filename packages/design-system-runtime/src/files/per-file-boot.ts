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
  if (isFrameCaptureMode()) {
    return captureDesignSystemAndHoldBoot();
  }
  set_perFileDesignSystemBooted(true);
  enablePreviewRunner(
    window,
    getHotCapability()?.signal,
    BOOT_FILE_READ_RETRY_DELAYS_MS,
  );
  let indexPath = FILES_INDEX_PROJECT_PATH;
  installDesignSystemTypingListener();
  waitForBootLiveAnnouncer(readOnlyReason);
  let title = stateEnvelopeTitle(outcome.state);
  if (title !== undefined) {
    document.title = title;
  }
  if (!isDesignSystemTypeHost) {
    initializeDesignSystemFilesDebugger();
  }
  let access =
      readOnlyReason === undefined && !isDesignSystemTypeHost
        ? await determineSlidesWriteAccess()
        : {
            canWrite: false,
            reason: readOnlyReason ?? designSystemTypeReadonlyReason(),
          },
    stash = access.canWrite
      ? await createCurrentArtifactCrashStash("design-system")
      : null,
    viewerId = await currentUserId();
  try {
    purgeOtherViewerCarryEntries(sessionStorage, viewerId);
  } catch {}
  let files = createBrowserFilesPort({
      canWrite: access.canWrite,
      fetch: (url) =>
        fetch(url, {
          credentials: "same-origin",
          signal: AbortSignal.timeout(
            FILES_DOCUMENT_FETCH_TIMEOUT_MS,
          ),
        }),
      fetchFresh: (url) =>
        fetch(url, {
          credentials: "same-origin",
          cache: "no-store",
          signal: AbortSignal.timeout(
            FILES_DOCUMENT_FETCH_TIMEOUT_MS,
          ),
        }),
      onRead: (filePath, fileContent, fileSha, baseSha) =>
        designSystemFilesDebugger?.read(
          filePath,
          fileContent,
          fileSha,
          baseSha,
        ),
      onPublishError: (error) =>
        designSystemFilesDebugger?.event("publish-raw-error", error),
    }),
    instrumentedFiles =
      designSystemFilesDebugger !== undefined
        ? instrumentFilesPort(
            files,
            designSystemFilesDebugger,
          )
        : files;
  designSystemFilesDebugger?.field(
    uiMessage("design-system.perFileBoot.canWrite"),
    String(access.canWrite),
  );
  setFileSystemDocumentFactory(
    (parserOptions: Host.ArtifactParser<Model.DesignSystemContent>) => {
      let value: Docs.DesignSystemFilesDocument = createDesignSystemFilesDocument({
        port: instrumentedFiles,
        indexPath: indexPath,
        ...(emptyIndex !== undefined
          ? {
              startWhenNoIndex: () => emptyIndex,
            }
          : {}),
        parseContent: parserOptions.parseContent,
        initialContent: parserOptions.initialContent,
        defaultTitle: document.title || parserOptions.defaultTitle,
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
        onNotice: (message: string): void => {
          designSystemFilesDebugger?.event("notice", {
            text: message,
          });
          showEditorPromiseNotification(message, null);
        },
        generated: true,
        onEvent: (eventType: string, eventData: unknown) =>
          designSystemFilesDebugger?.event("ds-" + eventType, eventData),
        reveal: designSystemFirstPaint,
        ...(stash !== null
          ? {
              saveStash: stash,
            }
          : {}),
        stashKey: designSystemCarryKey(viewerId),
        paced: true,
        onHotEvent: (hotEvent: FilesCore.FilesHotEvent): void => {
          designSystemFilesDebugger?.hotEvent(hotEvent);
          if (hotEvent.type === "applied") {
            afterTwoAnimationFrames(() =>
              designSystemFilesDebugger?.visible(
                hotEvent.to!,
                "adopted",
              ),
            );
          }
        },
        onBeforeRestart: (reason: string) =>
          designSystemFilesDebugger?.beforeRestart(reason),
      });
      installFilesSaveLifecycle(value.queue());
      monitorSyncLoadHealth(value, (healthReport: Boot.HealthReport) =>
        artifactHealth.report(...healthReport),
      );
      monitorSyncSaveHealth(value, (healthReport: Boot.HealthReport) =>
        artifactHealth.report(...healthReport),
      );
      observeDocumentThumbnailReadiness(value);
      provideDesignSystemFilesDebugState(value, files, indexPath);
      let values = new Set<string>();
      value.subscribe((): void => {
        if (value.loadState() !== "live" || value.readOnly()) {
          return;
        }
        let currentFiles = value.content().files,
          unpublishablePaths = filesLeftOutOfMigration(currentFiles).filter(
            (fileEntry: { path: string }) =>
              !values.has(fileEntry.path) &&
              !isRepairableDamagedText(
                fileEntry.path,
                currentFiles[fileEntry.path] ?? "",
              ) &&
              !isUnsupportedBinaryFile(
                fileEntry.path,
                currentFiles[fileEntry.path] ?? "",
              ) &&
              !isHeldFilePointer(
                fileEntry.path,
                currentFiles[fileEntry.path] ?? "",
              ),
          );
        for (let fileEntry of unpublishablePaths) {
          values.add(fileEntry.path);
        }
        if (unpublishablePaths.length > 0) {
          showEditorPromiseNotification(
            (unpublishablePaths.length === 1
              ? '"' + unpublishablePaths[0].path + '"'
              : String(unpublishablePaths.length) + " files") +
              " can’t be saved here. Give " +
              (unpublishablePaths.length === 1 ? uiMessage("design-system.perFileBoot.itAnotherName") : uiMessage("design-system.perFileBoot.themOtherNames")) +
              " without % ; : ? or #, or add " +
              (unpublishablePaths.length === 1 ? "it" : "them") +
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
        updateStoredSystemMigrationFlags(entry);
        let editingState = editingOffTransition({
          offAtBoot: readOnlyReason === get_MIGRATED_READONLY_MESSAGE(),
          canWrite: access.canWrite,
          offNow: isSystemEditingDisabled(entry),
        });
        if (editingState === "on") {
          reportMigrationAnalytics(
            MIGRATION_ANALYTICS_EVENTS.editingCameOn,
          );
        }
        if (editingState !== null) {
          reopenForEditingTransition(editingState);
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
          resolveDesignSystemFirstPaint();
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
          let unsubscribe = value.subscribe((): void => {
            if (value.personChanged()) {
              unsubscribe();
              value.materializeOwed().catch((): void => {
                return;
              });
            }
          });
        })
        .then((): void => {
          let wasWriteBlocked: boolean =
              readTreeIndex(outcome.state)?.convertedFrom
                ?.home === "file",
            canWrite = access.canWrite && !value.readOnly();
          if (storeHandle !== null && canWrite && !wasWriteBlocked) {
            watchLegacyStoreChanges(
              storeHandle,
              files,
              value,
              readTreeIndex(outcome.state),
              indexPath,
            );
          }
          if (storeHandle !== null && access.canWrite && wasWriteBlocked) {
            createLegacyDatabasePort(storeHandle)
              .get(SYSTEM_META_DOCUMENT_PATH)
              .then(
                (migrationStore: Model.FilesMigrationStoreDocument | null): void => {
                  if (
                    legacyStoreChangedAfterMigration(
                      migrationStore?.data,
                      readTreeIndex(outcome.state),
                    )
                  ) {
                    showEditorPromiseNotification(
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
  let marker = readFileMigrationMarker(index)?.marker,
    storeChangedAt = parseStoredSystemMetadata(meta)?.lastChange
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
  document: Docs.DesignSystemFilesDocument,
  bootIndex: Model.FilesIndex | undefined,
  indexPath: string = FILES_INDEX_PROJECT_PATH,
): void {
  let warned: boolean = false,
    store = createLegacyDatabasePort(storeHandle),
    adapter = createDesignSystemMigrationAdapter(
      readMigrationArtifactBlob,
      indexPath,
    );
  createStoreToFilesFoldController({
    adapter: adapter,
    files: files,
    store: store,
    holder: migrationTabHolder(),
    timers: designSystemMigrationTimers,
    artifactId: location.host,
    onFolded: (remoteChange: Model.FileRemoteChange) =>
      void document.applyRemote(remoteChange).catch((): void => {
        return;
      }),
    onOutcome: (outcome: Boot.MigrationOutcome): void => {
      reportMigrationFailure(outcome);
      if (outcome.result === "folded") {
        let value = takeStoreFoldSummary(),
          items = [
            ...(value.came ? [uiMessage("design-system.perFileBoot.changesMadeToThisDesign")] : []),
            ...(value.kept.length > 0
              ? [storeFoldKeptFilesMessage(value.kept)]
              : []),
          ];
        if (items.length > 0) {
          showEditorPromiseNotification(items.join(" "), null);
        }
        if (value.came) {
          setTimeout((): void => {
            document.regenerate();
            document.flushNow();
          }, 2000);
        }
      }
      if (
        outcome.result === "skipped" &&
        outcome.reason === "no_record" &&
        !warned
      ) {
        store
          .get(SYSTEM_META_DOCUMENT_PATH)
          .then((migrationStore: Model.FilesMigrationStoreDocument | null): void => {
            if (
              legacyStoreChangedAfterMigration(migrationStore?.data, bootIndex) &&
              !warned
            ) {
              warned = true;
              showEditorPromiseNotification(
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
    changed = kept.filter((entry): boolean => entry.why === "changed"),
    gone = kept.filter((entry): boolean => entry.why === "gone"),
    cannot = kept.filter((entry): boolean => entry.why === "cannot");
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
function afterTwoAnimationFrames(animationCallback: () => void): void {
  if (typeof requestAnimationFrame !== "function") {
    setTimeout(animationCallback, 32);
    return;
  }
  requestAnimationFrame(() => requestAnimationFrame(animationCallback));
}
function provideDesignSystemFilesDebugState(
  document: Docs.DesignSystemFilesDocument,
  files: Model.BrowserFilesPort,
  indexPath: string = FILES_INDEX_PROJECT_PATH,
): void {
  if (designSystemFilesDebugger === undefined) {
    return;
  }
  let extensions = filesPortExtensions(files);
  designSystemFilesDebugger.provide({
    files: () => {
      let items = [],
        currentFiles = document.content().files,
        value: Map<string, string> =
          extensions.knownListing?.() ?? new Map<string, string>(),
        flaggedPaths = document.flagged(),
        heldPaths = document.held();
      items.push({
        path: indexPath,
        sha: document.index().baseSha(),
        liveSha: extensions.liveSha?.(indexPath) ?? null,
        state: document.index().dirty() ? "changed here" : "",
      });
      for (let filePath of Object.keys(currentFiles).sort()) {
        let absolutePath = projectFilePath(filePath);
        if (!value.has(absolutePath) && !flaggedPaths.has(filePath)) {
          continue;
        }
        items.push({
          path: absolutePath,
          sha: extensions.heldSha?.(absolutePath) ?? null,
          liveSha: extensions.liveSha?.(absolutePath) ?? null,
          size: currentFiles[filePath].length,
          state: [
            flaggedPaths.has(filePath)
              ? "FLAGGED (" + (document.flags().get(filePath)?.why ?? "") + ")"
              : "",
            heldPaths.has(absolutePath) ? "theirs held" : "",
          ]
            .filter(Boolean)
            .join(" "),
        });
      }
      for (let [filePath, sha] of value) {
        if (isDerivedProjectPath(filePath)) {
          items.push({
            path: filePath,
            sha: sha,
            liveSha: extensions.liveSha?.(filePath) ?? null,
            state: "generated",
          });
        }
      }
      return items;
    },
    queue: () => {
      let value = document.queue(),
        queueState = value.state();
      return {
        dirty: queueState.dirty > 0 ? [String(queueState.dirty) + " path(s)"] : [],
        inFlight: queueState.inFlight,
        ...(queueState.lastError !== undefined
          ? {
              lastError: queueState.lastError,
            }
          : {}),
        conflicted: [...document.flagged()].map(projectFilePath),
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
    getHotCapability()?.restart?.({
      note: "adopted during boot; not the per-file mode",
    });
  } catch {}
}
async function bootDesignSystemFilesMode(): Promise<void> {
  let initialState = readDesignSystemInitialState();
  if (isDesignSystemTypeHost) {
    return bootLegacyDesignSystemMode(
      undefined,
      null,
      initialState,
    );
  }
  let outcome = await initialState,
    tree = readTreeIndex(outcome.state),
    decision = chooseTreeBootOutcome({
      origin: outcome.origin,
      tree: tree !== undefined,
      project: designSystemFileHomes.project,
      pipeline: isMigrationExemptHost(location.hostname),
      editingOff:
        tree !== undefined && isSystemEditingDisabled(tree),
    });
  artifactHealth.report(
    ...((decision.boot === "empty"
      ? (["render", "success"] as const)
      : bootHealthOutcome(
          outcome,
          isDesignSystemTypeHost,
        )) as Boot.HealthReport),
  );
  if (decision.boot === "tree") {
    return bootPerFileDesignSystem(
      outcome,
      resolveMigratedReadonlyReason(
        decision.readOnly,
        decision.readOnly === get_MIGRATED_READONLY_MESSAGE()
          ? await determineSlidesWriteAccess()
          : undefined,
      ),
    );
  }
  if (decision.boot === "empty") {
    if (!(await determineSlidesWriteAccess()).canWrite) {
      configureLegacyDesignSystemBoot(
        {
          state: {},
          origin: "demo",
          stateFileFound: false,
        },
        null,
        decision.readOnly ?? EMPTY_SYSTEM_READONLY_REASON,
      );
      prepareDesignSystemThumbnailCapture();
      return;
    }
    activeHotReloadSession?.armReady();
    let state = {
      ...createEmptyFilesIndex(),
      createdOnFiles: {
        ...createdOnFilesMarker({
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
    configureLegacyDesignSystemBoot(
      {
        state: {},
        origin: "demo",
        stateFileFound: false,
      },
      null,
      decision.reason,
    );
    prepareDesignSystemThumbnailCapture();
    return;
  }
  configureLegacyDesignSystemBoot(
    outcome.origin === "failed"
      ? outcome
      : failedLegacyStateOutcome(
          Error(uiMessage("design-system.perFileBoot.thisDesignSystemSList")),
        ),
  );
  prepareDesignSystemThumbnailCapture();
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
