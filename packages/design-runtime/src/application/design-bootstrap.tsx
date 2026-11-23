import { uiMessage } from '@minedesign/contracts/ui-messages';
/** Restored application module; prepare first, initialize in original order. */
import {
  type Dynamic,
} from "../runtime-types";
import { selectDesignCover } from "./design-cover";
import { isFrameCaptureDocument } from "../canvas/frame-environment";
import { waitForActiveDesignFramesReady, waitForDesignFramesReady } from "../canvas/frame-readiness";
import { Button } from "../cds/button/button";
import { initializeCdsIndex } from "../cds/index";
import { load_react_jsx_runtime } from "../dependencies";
import { recordPublishedVersion, removePublishedFiles, resetPublishedFileIndex, updatePublishedFileIndex } from "../design-system/published-files";
import { clearPendingFileOverlay, setPublishedFileReferences } from "../design-system/type-declarations";
import { closeEditorToast, showEditorActionToast, showEditorToast } from "../editor/chrome/pending-toasts";
import { setEditorOwnsUndoProbe, setUndoGestureObserver } from "../editor/history-ownership";
import { ModelHistoryRebaseHandler, getCapturedHistoryRebaseNow } from "../editor/model/history-rebase";
import { artboardStorePath, currentEditingArtboardPath } from "../editor/session/artboard-state";
import { toModuleNamespace } from "../module-helpers";
import { listWritableFiles, retryAccessFailure } from "../platform/access-retry";
import { restoreBrowserCrashStash } from "../platform/crash-stash";
import { convertDatabaseDesignToFiles } from "../platform/database-conversion";
import { createDesignFilesPort } from "../platform/design-files-port";
import { buildDesignDocumentFromIndex, normalizeDesignIndex, orderedDesignMapKeys } from "../platform/design-index";
import { canvasMetadataFile, isArtboardFile, isDesignSystemFile } from "../platform/file-content";
import { createFilesDesignDocument, hasUnstashedUnsendableEdits, validateListedDesignFile } from "../platform/files-design-document";
import { canHotRestart, createFilesHotReloadController, getHotCapability, PlatformFilesHotReloadItems, PlatformFilesHotReloadLimit } from "../platform/files-hot-reload";
import { healthReporter } from "../platform/health-and-analytics";
import { classifyHotEditMetric, createHotDebugger, createNoopHotDebugger } from "../platform/hot-debugger";
import { applicationBootTime, hotReloadController, isEmbeddedApplication } from "../platform/hot-reload";
import { announceMigrationReopen } from "../platform/migration-state";
import { isReservedProjectPath, projectMetadataPaths, projectPathPrefix } from "../platform/project-paths";
import { createSaveEventReporter } from "../platform/save-events";
import { getSnapshotDatabaseAdapter, readPortVersion } from "../platform/snapshot-database";
import { getStorageMigrationMarker, getStorageModeFromJson } from "../platform/storage-migration";
import { monitorDocumentLoadHealth, monitorDocumentSaveHealth } from "../platform/sync-health";
import { completeThumbnailAfterPromise, waitForThumbnailPaint } from "../platform/thumbnail";
import { resolveDesignWriteAccess } from "../platform/write-access";

var restoredDesignViewState: Dynamic;
var lastFocusedDesignFile: Dynamic;
var DESIGN_VIEW_STORAGE_KEY_PATTERN: Dynamic;
var getRestoredDesignViewState: Dynamic;
var recoveryJsxRuntime: Dynamic;
var afterTwoAnimationFrames: Dynamic;
var hasDesignFilesListing: Dynamic;
var selectWritableBootListing: Dynamic;
var pointerInteractionActive: Dynamic;
var lastDesignInteractionAt: Dynamic;
var initialDesignTitle: Dynamic;
var DESIGN_FOCUS_WAIT_MS: Dynamic;
var RELATIVE_ASSET_REFERENCE_PATTERN: Dynamic;
var LAST_FOCUSED_ARTBOARD_KEY: Dynamic;
var DESIGN_FILES_READ_FAILURE_MESSAGE: Dynamic;
var loadDesignDocumentTree: Dynamic;
function captureDesignViewState(): Dynamic {
  let state: Dynamic = {};
  try {
    for (let index: Dynamic = 0; index < sessionStorage.length; index++) {
      let storageKey: Dynamic = sessionStorage.key(index);
      storageKey !== null &&
        DESIGN_VIEW_STORAGE_KEY_PATTERN.test(storageKey) &&
        (state[storageKey] = sessionStorage.getItem(storageKey) ?? "");
    }
  } catch {}
  let focusedFile: Dynamic = lastFocusedDesignFile ?? decodeFocusedDesignRoute();
  return {
    view: state,
    ...(focusedFile !== null
      ? {
          focused: focusedFile,
        }
      : {}),
  };
}
function decodeFocusedDesignRoute(): Dynamic {
  let route: Dynamic = currentEditingArtboardPath();
  if (route === null) return null;
  let encodedFile: Dynamic = route.slice(route.indexOf("/") + 1);
  try {
    let focusedFile: Dynamic = decodeURIComponent(
      encodedFile.replace(/~([0-9a-f]{2})/g, "%$1"),
    );
    return artboardStorePath(focusedFile) === route ? focusedFile : null;
  } catch {
    return null;
  }
}
function restoreDesignViewState(snapshot?: Dynamic): Dynamic {
  if (typeof snapshot != "object" || snapshot === null) return;
  let state: Dynamic = snapshot;
  restoredDesignViewState = {
    ...(typeof state.focused == "string"
      ? {
          focused: state.focused,
        }
      : {}),
  };
  if (!(typeof state.view != "object" || state.view === null))
    try {
      for (let [storageKey, storedValue] of Object.entries(state.view) as Dynamic)
        DESIGN_VIEW_STORAGE_KEY_PATTERN.test(storageKey) &&
          typeof storedValue == "string" &&
          sessionStorage.getItem(storageKey) === null &&
          sessionStorage.setItem(storageKey, storedValue);
    } catch {}
}
function showCrashRecoveryNotice(recovery?: Dynamic): Dynamic {
  let noticeId: Dynamic = 0,
    singleFile: Dynamic = recovery.files === 1,
    description: Dynamic = `${singleFile ? "An edit" : String(recovery.files) + " edits"} you made here earlier`;
  noticeId = showEditorActionToast(
    recovery.changedSince === 0
      ? `${description} ${singleFile ? "was" : "were"} never saved. Put ${singleFile ? "it" : "them"} back?`
      : `${description} may not have been saved. The canvas has changed since then, so putting ${singleFile ? "it" : "them"} back can replace newer changes. Put ${singleFile ? "it" : "them"} back anyway?`,
    <span className={"flex shrink-0 items-center gap-1"}>
      <Button
        type={"button"}
        variant={"ghost"}
        onClick={(): Dynamic => {
          closeEditorToast(noticeId);
          recovery.discard();
        }}
      >
        {uiMessage("canvas.designBootstrap.discard")}
      </Button>
      <Button
        type={"button"}
        variant={"primary"}
        onClick={(): Dynamic => {
          closeEditorToast(noticeId);
          recovery.restore();
        }}
      >
        {uiMessage("canvas.designBootstrap.putBack")}
      </Button>
    </span>,
  );
  recovery.whenAnswered(
    (): Dynamic => closeEditorToast(noticeId),
  );
}
function showOverwrittenEditNotice(edit?: Dynamic): Dynamic {
  let title: Dynamic = edit.file.replace(/\.dc\.html$/, ""),
    noticeId: Dynamic = 0;
  noticeId = showEditorActionToast(
    uiMessage("canvas.designBootstrap.savedChangeOverwritten", { title: String(title) }),
    <Button
      type={"button"}
      variant={"primary"}
      onClick={(): Dynamic => {
        closeEditorToast(noticeId);
        edit.putBack();
      }}
    >
      {uiMessage("canvas.designBootstrap.putMyChangeBack")}
    </Button>,
  );
}
function hasDesignIndexListing(
  listing?: Dynamic,
  bootOptions: Dynamic = {
    embedded: false,
  },
): Dynamic {
  return bootOptions.embedded || listing === null || listing === undefined
    ? false
    : Object.hasOwn(listing, projectMetadataPaths.design);
}
function getSkippedDesignFiles(listing?: Dynamic): Dynamic {
  return Object.fromEntries(
    Object.entries(listing ?? {}).filter(
      ([path, listingEntry]: Dynamic): Dynamic =>
        path.startsWith(projectPathPrefix) &&
        !isReservedProjectPath("design", path) &&
        validateListedDesignFile({
          path: path,
          size: Number(listingEntry?.size ?? 0),
        }) === null,
    ),
  );
}
async function chooseDesignBootstrapMode(
  listing?: Dynamic,
  readIndex?: Dynamic,
  bootOptions: Dynamic = {
    embedded: false,
  },
): Promise<Dynamic> {
  let mayAskNarrowed: Dynamic =
      bootOptions.narrowed === true &&
      bootOptions.ask !== undefined &&
      !bootOptions.embedded &&
      listing !== null &&
      listing !== undefined,
    hasIndex: Dynamic = hasDesignIndexListing(listing, bootOptions);
  if (!hasIndex && !mayAskNarrowed)
    return {
      boot: "store",
    };
  let text: Dynamic = hasIndex
    ? await readIndex()
    : await bootOptions.ask(projectMetadataPaths.design);
  if (text === undefined)
    return {
      boot: "unreadable",
    };
  if (text === null || getStorageModeFromJson(text) !== "files")
    return {
      boot: "store",
    };
  if (
    readDesignIndexKind(text) === "converted" &&
    !Object.hasOwn(listing, readPortVersion)
  ) {
    let portVersionText: Dynamic = mayAskNarrowed
      ? await bootOptions.ask(readPortVersion)
      : null;
    if (portVersionText === undefined)
      return {
        boot: "unreadable",
      };
    if (portVersionText === null)
      return {
        boot: "store",
      };
  }
  return {
    boot: "files",
  };
}
function createBootstrapFileReader(
  fetchFile?: Dynamic,
  mayWrite?: Dynamic,
  timers: Dynamic = {
    setTimeout: (timerTask?: Dynamic, delayMs?: Dynamic): Dynamic =>
      setTimeout(timerTask, delayMs),
  },
): Dynamic {
  return async (path?: Dynamic): Promise<Dynamic> => {
    if (!(await mayWrite().catch((): Dynamic => false)))
      return fetchFile(path)
        .then(
          (response?: Dynamic): Dynamic => (response.ok ? response.text() : null),
        )
        .catch((): Dynamic => null);
    for (let index: Dynamic = 0; ; index++) {
      let response: Dynamic = await fetchFile(path).catch((): Dynamic => {}),
        text: Dynamic =
          response?.ok === true
            ? await response.text().catch((): Dynamic => {})
            : undefined;
      if (text !== undefined) return text;
      if (response?.status === 404) return null;
      if (index >= PlatformFilesHotReloadItems.length) return;
      await new Promise((resolve?: Dynamic): Dynamic => {
        timers.setTimeout(resolve, PlatformFilesHotReloadItems[index]);
      });
    }
  };
}
function readDesignIndexKind(indexText?: Dynamic): Dynamic {
  try {
    return getStorageMigrationMarker(JSON.parse(indexText))
      ?.kind;
  } catch {
    return;
  }
}
function trackPointerInteractions(): Dynamic {
  if (!(typeof window === "undefined")) {
    (window as Dynamic).addEventListener(
      "pointerdown",
      (): Dynamic => (pointerInteractionActive = true),
      true,
    );
    for (let eventName of ["pointerup", "pointercancel", "blur"] as Dynamic)
      (window as Dynamic).addEventListener(
        eventName,
        (): Dynamic => (pointerInteractionActive = false),
        true,
      );
  }
}
function hasActiveEditorInteraction(): Dynamic {
  if (pointerInteractionActive || typeof document === "undefined")
    return pointerInteractionActive;
  let activeElement: Dynamic = (document as Dynamic).activeElement;
  return (
    activeElement instanceof HTMLElement &&
    (activeElement.isContentEditable ||
      activeElement.tagName === "INPUT" ||
      activeElement.tagName === "TEXTAREA")
  );
}
function shouldDeferDesignRestart(): Dynamic {
  if (hasActiveEditorInteraction()) return true;
  if (typeof document === "undefined") return false;
  if (
    (document as Dynamic).querySelector(
      "[data-mega-frames-inert], [data-mega-grabbing]",
    ) !== null
  )
    return true;
  for (let frame of (document as Dynamic).querySelectorAll(
    "iframe",
  ) as Dynamic)
    try {
      if (
        frame.contentDocument?.querySelector(
          "[data-dc-editor-editing], [data-dc-editor-dragging], [data-dc-dragging]",
        ) != null
      )
        return true;
    } catch {}
  return (
    performance.now() -
      Math.max(
        lastDesignInteractionAt,
        getCapturedHistoryRebaseNow(),
      ) <
    1500
  );
}
function createDesignBootstrapDebugger(
  bootMode?: Dynamic,
  isEmbedded?: Dynamic,
): Dynamic {
  if (isEmbedded || bootMode !== "files")
    return createNoopHotDebugger();
  let hotDebugger: Dynamic = createHotDebugger({
    product: "design",
    hot: getHotCapability(),
    bootStartedAt: applicationBootTime,
  });
  hotDebugger.mount(bootMode);
  return hotDebugger;
}
function deferCrashStashAccess(stashPromise?: Dynamic): Dynamic {
  let resolvedStash: Dynamic = stashPromise.catch((): Dynamic => null);
  return {
    put: async (payload?: Dynamic, putOptions?: Dynamic): Promise<Dynamic> =>
      (await resolvedStash)?.put(payload, putOptions) ?? false,
    read: async (): Promise<Dynamic> => (await resolvedStash)?.read(),
    clear: async (): Promise<Dynamic> => (await resolvedStash)?.clear(),
    clearOffered: async (): Promise<Dynamic> =>
      (await resolvedStash)?.clearOffered(),
    clearArtifact: async (): Promise<Dynamic> =>
      (await resolvedStash)?.clearArtifact(),
    purgeOtherViewers: async (): Promise<Dynamic> =>
      (await resolvedStash)?.purgeOtherViewers(),
  };
}
async function readDesignIndexWithRetry(
  fetchFile?: Dynamic,
): Promise<Dynamic> {
  let retryWaits: Dynamic = [
    0,
    ...(hotReloadController.queued.length > 0
      ? PlatformFilesHotReloadItems
      : PlatformFilesHotReloadItems.slice(
          0,
          PlatformFilesHotReloadLimit,
        )),
  ];
  for (let waitMs of retryWaits as Dynamic) {
    waitMs > 0 &&
      (await new Promise(
        (resolve?: Dynamic): Dynamic => setTimeout(resolve, waitMs),
      ));
    try {
      let response: Dynamic = await fetchFile(
        projectMetadataPaths.design,
      );
      if (response.ok) return await response.text();
      if (
        response.status === 404 &&
        hotReloadController.queued.length === 0
      )
        return null;
    } catch {}
  }
}
function createBootDesignFilesPort(
  fetchFile?: Dynamic,
  listing?: Dynamic,
  canWrite?: Dynamic,
  debugContext?: Dynamic,
  narrowed: Dynamic = false,
): Dynamic {
  return createDesignFilesPort({
    fetch: fetchFile,
    fetchFresh: (url?: Dynamic): Dynamic =>
      fetch(url, {
        credentials: "same-origin",
        cache: "no-store",
        signal: AbortSignal.timeout(3e4),
      }),
    ...wrapBootFilesListing(listing),
    ...(narrowed && listing !== undefined
      ? {
          bootNarrowed: true,
        }
      : {}),
    canWrite: canWrite,
    onRead: (
      readFile?: Dynamic,
      readKind?: Dynamic,
      readDetail?: Dynamic,
      readResult?: Dynamic,
    ): Dynamic => debugContext.dbg.read(readFile, readKind, readDetail, readResult),
    onPublishError: (publishError?: Dynamic): Dynamic =>
      debugContext.dbg.event(
        "publish-raw-error",
        publishError instanceof Error
          ? {
              message: publishError.message,
            }
          : publishError,
      ),
  });
}
function wrapBootFilesListing(listing?: Dynamic): Dynamic {
  return listing === undefined
    ? {}
    : {
        bootFiles: listing ?? {},
      };
}
function focusDesignArtboard(
  file?: Dynamic,
  targetDocument: Dynamic = typeof document === "undefined" ? undefined : document,
): Dynamic {
  let canvas: Dynamic =
      targetDocument?.querySelector('main[aria-label="Canvas"]') ?? null,
    handle: Dynamic =
      // @ts-expect-error -- TS 7 reads `x ?? null` as always nullish (TS2871); the original expression is kept as is.
      (file !== undefined && file !== ""
        ? ([
            ...(canvas?.querySelectorAll(
              '[data-testid^="mega-artboard-handle-"]',
            ) ?? []),
          ].find(
            (element?: Dynamic): Dynamic =>
              element.getAttribute("data-testid") ===
              "mega-artboard-handle-" + file,
          ) ?? null)
        : null) ?? canvas;
  handle !== null &&
    (handle.hasAttribute("tabindex") || handle.setAttribute("tabindex", "-1"),
    handle.focus({
      preventScroll: true,
    }));
}
function focusDesignArtboardWhenWindowActive(
  file?: Dynamic,
  focusOptions: Dynamic = {},
): Dynamic {
  let targetDocument: Dynamic =
    focusOptions.doc ?? (typeof document === "undefined" ? undefined : document);
  if (targetDocument === undefined || targetDocument.hasFocus())
    return focusDesignArtboard(file, targetDocument);
  let targetWindow: Dynamic =
    focusOptions.win ?? (typeof window === "undefined" ? undefined : window);
  if (targetWindow === undefined) return;
  let timers: Dynamic = focusOptions.timers ?? {
      setTimeout: (handler?: Dynamic, delayMs?: Dynamic): Dynamic =>
        setTimeout(handler, delayMs),
      clearTimeout: (timerId?: Dynamic): Dynamic => clearTimeout(timerId),
    },
    isWaiting: Dynamic = true,
    pendingTimerId: Dynamic,
    stopWaiting: Dynamic = (): Dynamic => {
      if (isWaiting) {
        isWaiting = false;
        timers.clearTimeout(pendingTimerId);
        targetDocument.removeEventListener?.("visibilitychange", onVisibilityChange);
        targetWindow.removeEventListener("focus", onWindowFocus);
        for (let eventName of ["keydown", "pointerdown"] as Dynamic)
          targetWindow.removeEventListener(eventName, stopWaiting, true);
      }
    },
    onWindowFocus: Dynamic = (): Dynamic => {
      isWaiting && (stopWaiting(), focusDesignArtboard(file, targetDocument));
    },
    onVisibilityChange: Dynamic = (): Dynamic => {
      timers.clearTimeout(pendingTimerId);
      pendingTimerId =
        (targetDocument.visibilityState ?? "visible") === "visible"
          ? timers.setTimeout(stopWaiting, DESIGN_FOCUS_WAIT_MS)
          : undefined;
    };
  targetWindow.addEventListener("focus", onWindowFocus);
  for (let eventName of ["keydown", "pointerdown"] as Dynamic)
    targetWindow.addEventListener(eventName, stopWaiting, true);
  targetDocument.addEventListener?.("visibilitychange", onVisibilityChange);
  onVisibilityChange();
}
async function buildFallbackDesignFileListing(
  fetchFile?: Dynamic,
): Promise<Dynamic> {
  try {
    let indexResponse: Dynamic = await fetchFile(projectMetadataPaths.design);
    if (!indexResponse.ok) return null;
    let indexText: Dynamic = await indexResponse.text(),
      designIndex: Dynamic = normalizeDesignIndex(JSON.parse(indexText)),
      fallbackListing: Dynamic = {
        [projectMetadataPaths.design]: {
          sha256: "",
          size: indexText.length,
          contentType: "application/json",
        },
      };
    if (readDesignIndexKind(indexText) === "converted") {
      if (!(await fetchFile(readPortVersion)).ok) return null;
      fallbackListing[readPortVersion] = {
        sha256: "",
      };
    }
    let boardFiles: Dynamic = orderedDesignMapKeys(
        designIndex.order,
        designIndex.boards,
      ).filter(
        (file?: Dynamic): Dynamic =>
          validateListedDesignFile({
            path: projectPathPrefix + file,
            size: 0,
          }) === file,
      ),
      selectSnapshotFiles: Dynamic = (excludedFiles?: Dynamic): Dynamic => {
        let placeholderFiles: Dynamic = Object.fromEntries(
            boardFiles
              .filter((file?: Dynamic): Dynamic => !excludedFiles.has(file))
              .map((file?: Dynamic): Dynamic => [file, ""]),
          ),
          cover: Dynamic = selectDesignCover({
            files: {
              ...placeholderFiles,
              [canvasMetadataFile]: buildDesignDocumentFromIndex(designIndex, placeholderFiles),
            },
          });
        return {
          files:
            cover?.boards.map((board?: Dynamic): Dynamic => board.file) ??
            [],
          snapshot: cover?.snapshot === true,
        };
      },
      entries: Dynamic = new Map(),
      missingFiles: Dynamic = new Set(),
      initialSelection: Dynamic = selectSnapshotFiles(missingFiles),
      files: Dynamic = initialSelection.files;
    for (let index: Dynamic = 0; initialSelection.snapshot; index += 1) {
      await Promise.all(
        files
          .filter((file?: Dynamic): Dynamic => !entries.has(file))
          .map(
            async (file?: Dynamic): Promise<Dynamic> =>
              entries.set(
                file,
                await fetchFile(projectPathPrefix + file).catch(
                  (): Dynamic => {},
                ),
              ),
          ),
      );
      let newlyMissing: Dynamic = files.filter(
        (file?: Dynamic): Dynamic => entries.get(file)?.status === 404,
      );
      if (newlyMissing.length === 0) break;
      for (let file of newlyMissing as Dynamic) missingFiles.add(file);
      let nextSelection: Dynamic =
        index < 3
          ? selectSnapshotFiles(missingFiles)
          : {
              files: files.filter(
                (file?: Dynamic): Dynamic => !missingFiles.has(file),
              ),
              snapshot: true,
            };
      if (!nextSelection.snapshot || nextSelection.files.length === 0) {
        let remainingFiles: Dynamic = initialSelection.files.filter(
          (file?: Dynamic): Dynamic => !missingFiles.has(file),
        );
        files = remainingFiles.length > 0 ? remainingFiles : initialSelection.files;
        break;
      }
      files = nextSelection.files;
      if (index === 3) break;
    }
    for (let file of files as Dynamic)
      fallbackListing[projectPathPrefix + file] = {
        sha256: "",
        contentType: "text/html",
      };
    let firstFile: Dynamic = files[0];
    if (firstFile === undefined) return fallbackListing;
    await Promise.all(
      boardFiles
        .filter(isDesignSystemFile)
        .map(async (file?: Dynamic): Promise<Dynamic> => {
          (
            await fetchFile(projectPathPrefix + file).catch(
              (): Dynamic => {},
            )
          )?.ok === true &&
            (fallbackListing[projectPathPrefix + file] = {
              sha256: "",
              contentType: "text/html",
            });
        }),
    );
    let firstFileResponse: Dynamic = initialSelection.snapshot
      ? entries.get(firstFile)
      : await fetchFile(projectPathPrefix + firstFile);
    if (firstFileResponse?.ok !== true) return fallbackListing;
    let fileDirectory: Dynamic = firstFile.includes("/")
      ? firstFile.slice(0, firstFile.lastIndexOf("/") + 1)
      : "";
    for (let match of (await firstFileResponse.text()).matchAll(
      RELATIVE_ASSET_REFERENCE_PATTERN,
    ) as Dynamic) {
      let items: Dynamic = [];
      for (let segment of (fileDirectory + match[1]).split("/") as Dynamic)
        segment === ".."
          ? items.pop()
          : segment !== "." && segment !== "" && items.push(segment);
      let resolvedPath: Dynamic = items.join("/");
      (initialSelection.snapshot &&
        isArtboardFile(resolvedPath) &&
        !files.includes(resolvedPath)) ||
        (items[items.length - 1] !== "support.js" &&
          validateListedDesignFile({
            path: projectPathPrefix + resolvedPath,
            size: 0,
          }) !== null &&
          (fallbackListing[projectPathPrefix + resolvedPath] = {
            sha256: "",
          }));
    }
    return fallbackListing;
  } catch {
    return null;
  }
}
async function bootDesignDocument({
  get: fetchFile,
  listing: listingPromise,
  narrowed: isNarrowed,
  embedded: embedded,
}: Dynamic): Promise<Dynamic> {
  let isEmbedded: Dynamic = embedded || isEmbeddedApplication,
    debugContext: Dynamic = {
      dbg: createNoopHotDebugger(),
    },
    listing: Dynamic = await listingPromise;
  !isEmbedded &&
    isFrameCaptureDocument() &&
    !hasDesignIndexListing(listing) &&
    (listing = (await buildFallbackDesignFileListing(fetchFile)) ?? listing);
  let narrowed: Dynamic =
      isNarrowed?.() === true && listing === (await listingPromise),
    bootDecision: Dynamic = await chooseDesignBootstrapMode(
      listing,
      (): Dynamic => readDesignIndexWithRetry(fetchFile),
      {
        embedded: isEmbedded,
        narrowed: narrowed,
        ask: createBootstrapFileReader(
          fetchFile,
          (): Dynamic =>
            resolveDesignWriteAccess().then(
              (writeAccess?: Dynamic): Dynamic => writeAccess.canWrite,
            ),
        ),
      },
    ),
    mode: Dynamic = isEmbedded
      ? bootDecision
      : bootDecision.boot === "store"
        ? {
            boot: "files",
          }
        : bootDecision;
  if (mode.boot === "unreadable") {
    hotReloadController.detach();
    return (): Dynamic => {
      throw new Error(DESIGN_FILES_READ_FAILURE_MESSAGE);
    };
  }
  if (mode.boot === "store") {
    let hasQueuedUpdate: Dynamic = hotReloadController.queued.length > 0,
      hasOwedRestart: Dynamic = hotReloadController.owed() !== undefined;
    hotReloadController.detach();
    if (hasQueuedUpdate && !hasOwedRestart)
      try {
        getHotCapability()?.restart?.({
          note: "store canvas: content adopted during boot",
        });
      } catch {}
    return null;
  }
  let port: Dynamic,
    conversionAttempted: Dynamic = false,
    converted: Dynamic = false;
  if (
    !isEmbedded &&
    !hasDesignFilesListing(listing) &&
    !isFrameCaptureDocument()
  ) {
    let holdOffReason: Dynamic =
        hotReloadController.queued.length > 0
          ? "an update was adopted during this open"
          : undefined,
      conversionResult: Dynamic = await convertDatabaseDesignToFiles({
        listing: narrowed ? undefined : listing,
        canWrite: (): Dynamic =>
          resolveDesignWriteAccess().then(
            (writeAccess?: Dynamic): Dynamic => writeAccess.canWrite,
          ),
        port: (): Dynamic =>
          (port ??= createBootDesignFilesPort(
            fetchFile,
            listing,
            true,
            debugContext,
            narrowed,
          )),
        store: (): Dynamic => getSnapshotDatabaseAdapter(),
        readBlob: async (url?: Dynamic): Promise<Dynamic> => {
          for (let index: Dynamic = 0; ; index += 1)
            try {
              let response: Dynamic = await fetch(url, {
                credentials: "same-origin",
                signal: AbortSignal.timeout(12e4),
              });
              if (!response.ok)
                throw new Error(
                  "upload not readable: " + String(response.status),
                );
              return await response.text();
            } catch (error: Dynamic) {
              if (index >= 1) throw error;
            }
        },
        defaultTitle: initialDesignTitle,
        ...(holdOffReason !== undefined
          ? {
              holdOff: holdOffReason,
            }
          : {}),
      });
    conversionResult.did === "nothing" &&
      conversionResult.reason !== undefined &&
      console.warn(
        "design: this canvas\u2019s old store was not copied into its files (" +
          conversionResult.reason +
          ")",
      );
    conversionAttempted =
      conversionResult.did === "nothing" && conversionResult.pastMeta === true;
    converted = conversionResult.did === "restored";
  }
  hotReloadController.armReady();
  let hotDebugger: Dynamic = (debugContext.dbg = createDesignBootstrapDebugger(
    "files",
    isEmbedded,
  ));
  hotDebugger.phase("boot decided: files");
  hotDebugger.field(
    "mode",
    "files \xB7 " + String(Object.keys(listing ?? {}).length) + " listed",
  );
  let inplaceOption: Dynamic = hotDebugger.option(
    "inplace",
    "apply a remote board change in place (__dcUpdate) instead of rebuilding its iframe",
  );
  setEditorOwnsUndoProbe(inplaceOption);
  setUndoGestureObserver(
    (eventName?: Dynamic, eventPayload?: Dynamic): Dynamic =>
      hotDebugger.event(eventName, eventPayload),
  );
  ModelHistoryRebaseHandler(
    true,
    (board?: Dynamic, rebasePayload?: Dynamic): Dynamic =>
      hotDebugger.event("undo-rebased", {
        board: board,
        ...rebasePayload,
      }),
  );
  return (writeAccess?: Dynamic): Dynamic => {
    if (
      converted &&
      hotReloadController.queued.length > 0 &&
      ((conversionAttempted = true), canHotRestart())
    )
      try {
        getHotCapability()?.restart?.({
          note: "design: an update arrived while the old store was being copied",
        });
      } catch {}
    let revealReady: Dynamic = (): Dynamic => {},
      revealPromise: Dynamic = new Promise((resolve?: Dynamic): Dynamic => {
        revealReady = resolve;
      });
    try {
      let filesPort: Dynamic =
        port ??
        createBootDesignFilesPort(
          fetchFile,
          listing,
          writeAccess.canWrite,
          debugContext,
          narrowed,
        );
      hotDebugger.field("on version", filesPort.version().version || "(unknown)");
      hotDebugger.field(
        "can write",
        writeAccess.canWrite
          ? "yes"
          : "no" +
              (writeAccess.reason !== undefined ? " \xB7 " + writeAccess.reason : ""),
      );
      let designDoc: Dynamic = createFilesDesignDocument({
        port: filesPort,
        defaultTitle: (document as Dynamic).title || "Design",
        canWrite: writeAccess.canWrite && !conversionAttempted,
        ...(conversionAttempted
          ? {
              readOnlyReason: DESIGN_FILES_READ_FAILURE_MESSAGE,
            }
          : writeAccess.reason !== undefined
            ? {
                readOnlyReason: writeAccess.reason,
              }
            : {}),
        holdRemote: (file?: Dynamic): Dynamic =>
          artboardStorePath(file) ===
            currentEditingArtboardPath() &&
          shouldDeferDesignRestart(),
        sameBoardRule: LAST_FOCUSED_ARTBOARD_KEY,
        onSaveDropped: showOverwrittenEditNotice,
        saveStash: deferCrashStashAccess(
          restoreBrowserCrashStash("design"),
        ),
        ...(isEmbedded
          ? {}
          : {
              paced: true,
            }),
        onStashOffer: showCrashRecoveryNotice,
        onNotice: (message?: Dynamic): Dynamic => {
          hotDebugger.event("notice", {
            message: message,
          });
          showEditorToast(message);
        },
        debug: createSaveEventReporter({
          saveStart: (file?: Dynamic, saveInfo?: Dynamic): Dynamic => (
            removePublishedFiles(file),
            hotDebugger.saveStart(file, saveInfo)
          ),
          saveEnd: (file?: Dynamic, version?: Dynamic): Dynamic => (
            recordPublishedVersion(version),
            hotDebugger.saveEnd(file, version)
          ),
          event: (eventName?: Dynamic, eventPayload?: Dynamic): Dynamic =>
            hotDebugger.event(eventName, eventPayload),
        }),
      });
      hotDebugger.provide({
        files: (): Dynamic => designDoc.debugState().files,
        queue: (): Dynamic => designDoc.debugState().queue,
      });
      let healthSource: Dynamic = designDoc.healthSource(),
        stopLoadMonitor: Dynamic = monitorDocumentLoadHealth(
          healthSource,
          (reportArgs?: Dynamic): Dynamic =>
            healthReporter.report(...reportArgs),
        ),
        stopSaveMonitor: Dynamic = monitorDocumentSaveHealth(
          healthSource,
          (reportArgs?: Dynamic): Dynamic =>
            healthReporter.report(...reportArgs),
        ),
        originalDispose: Dynamic = designDoc.dispose.bind(designDoc);
      designDoc.dispose = (): Dynamic => {
        stopLoadMonitor();
        stopSaveMonitor();
        originalDispose();
      };
      designDoc.subscribe((change?: Dynamic): Dynamic => {
        change?.remote !== true &&
          (lastDesignInteractionAt = performance.now());
      });
      let skippedFiles: Dynamic = getSkippedDesignFiles(listing);
      setPublishedFileReferences(skippedFiles);
      resetPublishedFileIndex(
        selectWritableBootListing(listing, {
          hosted: isEmbedded,
          capture: isFrameCaptureDocument(),
          narrowed: narrowed,
        }),
      );
      if ((narrowed && writeAccess.canWrite) || listing === undefined) {
        clearPendingFileOverlay();
        let listFiles: Dynamic =
            listing === undefined
              ? (): Dynamic => filesPort.list()
              : (): Dynamic =>
                  retryAccessFailure(
                    (): Dynamic => listWritableFiles(filesPort),
                  ),
          liveReady: Dynamic = new Promise((resolve?: Dynamic): Dynamic => {
            if (designDoc.loadState() === "live") return resolve();
            let unsubscribe: Dynamic = designDoc.subscribeLoad((): Dynamic => {
              designDoc.loadState() === "live" && (unsubscribe(), resolve());
            });
          });
        (listing === undefined ? liveReady : designDoc.ready)
          .then(listFiles)
          .then(
            (files?: Dynamic): Dynamic =>
              setPublishedFileReferences(
                getSkippedDesignFiles(
                  Object.fromEntries(
                    files.map(
                      (file?: Dynamic): Dynamic => [
                        file.path,
                        {
                          sha256: file.sha256,
                          size: file.size,
                          contentType: file.contentType,
                        },
                      ],
                    ),
                  ),
                ),
              ),
          )
          .catch((): Dynamic => {});
      }
      trackPointerInteractions();
      createFilesHotReloadController({
        port: filesPort,
        applyRemote: async (change?: Dynamic): Promise<Dynamic> => {
          updatePublishedFileIndex(change.changed);
          await designDoc.applyRemote(change);
          afterTwoAnimationFrames(
            (): Dynamic => hotDebugger.visible(change.to.version, "adopted"),
          );
        },
        isBusy: (): Dynamic =>
          hasActiveEditorInteraction() ||
          hasUnstashedUnsendableEdits(designDoc.queue.state()),
        snapshot: (): Dynamic => captureDesignViewState(),
        restore: (snapshot?: Dynamic): Dynamic =>
          restoreDesignViewState(snapshot),
        reveal: revealPromise,
        onEvent: (hotEvent?: Dynamic): Dynamic => {
          let metric: Dynamic = classifyHotEditMetric(hotEvent);
          metric !== null && healthReporter.report(...metric);
          hotDebugger.hotEvent(hotEvent);
        },
        onBeforeRestart: (restartInfo?: Dynamic): Dynamic => {
          hotDebugger.beforeRestart(restartInfo);
          designDoc.flushNow();
        },
      });
      completeThumbnailAfterPromise(
        (): Dynamic =>
          waitForActiveDesignFramesReady().then(
            (): Dynamic => waitForThumbnailPaint(),
          ),
      );
      designDoc.ready.then((): Dynamic => {
        hotDebugger.phase(
          "document ready (" +
            String(Object.keys(designDoc.content().files).length) +
            " files)",
        );
        let isLive: Dynamic = designDoc.loadState() === "live";
        (!isLive ||
          !Object.keys(designDoc.content().files).some(
            (file?: Dynamic): Dynamic =>
              isArtboardFile(file) &&
              !isDesignSystemFile(file),
          )) &&
          revealReady();
        !isLive || isEmbedded || isFrameCaptureDocument();
      });
      waitForDesignFramesReady().then((): Dynamic => {
        hotDebugger.phase("first artboard painted");
        afterTwoAnimationFrames((): Dynamic => {
          revealReady();
          announceMigrationReopen({
            canWrite: writeAccess.canWrite,
            focus: (file?: Dynamic): Dynamic =>
              focusDesignArtboardWhenWindowActive(
                file ?? getRestoredDesignViewState()?.focused,
              ),
          });
          hotReloadController.restarted &&
            hotDebugger.visible(filesPort.version().version, "restarted");
        });
        waitForThumbnailPaint().then(
          (): Dynamic => hotDebugger.phase("all painted"),
        );
      });
      let restoredViewState: Dynamic = getRestoredDesignViewState();
      return {
        doc: designDoc,
        census: {
          canWrite: writeAccess.canWrite && !conversionAttempted,
          capture: isFrameCaptureDocument(),
          embedded: isEmbedded,
        },
        ...(restoredViewState?.focused !== undefined
          ? {
              entryFile: restoredViewState.focused,
            }
          : {}),
      };
    } catch (error: Dynamic) {
      throw (hotReloadController.detach(), error);
    }
  };
}
export {
  afterTwoAnimationFrames,
  bootDesignDocument,
  buildFallbackDesignFileListing,
  captureDesignViewState,
  chooseDesignBootstrapMode,
  createBootDesignFilesPort,
  createBootstrapFileReader,
  createDesignBootstrapDebugger,
  decodeFocusedDesignRoute,
  deferCrashStashAccess,
  DESIGN_FILES_READ_FAILURE_MESSAGE,
  DESIGN_FOCUS_WAIT_MS,
  DESIGN_VIEW_STORAGE_KEY_PATTERN,
  focusDesignArtboard,
  focusDesignArtboardWhenWindowActive,
  getRestoredDesignViewState,
  getSkippedDesignFiles,
  hasActiveEditorInteraction,
  hasDesignFilesListing,
  hasDesignIndexListing,
  initialDesignTitle,
  LAST_FOCUSED_ARTBOARD_KEY,
  lastDesignInteractionAt,
  lastFocusedDesignFile,
  loadDesignDocumentTree,
  pointerInteractionActive,
  readDesignIndexKind,
  readDesignIndexWithRetry,
  recoveryJsxRuntime,
  RELATIVE_ASSET_REFERENCE_PATTERN,
  restoredDesignViewState,
  restoreDesignViewState,
  selectWritableBootListing,
  shouldDeferDesignRestart,
  showCrashRecoveryNotice,
  showOverwrittenEditNotice,
  trackPointerInteractions,
  wrapBootFilesListing,
};
export function installApplicationDesignBootstrap(): () => void {
  return () => {
    lastFocusedDesignFile = null;
    DESIGN_VIEW_STORAGE_KEY_PATTERN = /^design-view\//;
    getRestoredDesignViewState = (): Dynamic => restoredDesignViewState;
    initializeCdsIndex();
    recoveryJsxRuntime = toModuleNamespace(
      load_react_jsx_runtime(),
      1,
    );
    afterTwoAnimationFrames = (frameTask?: Dynamic): Dynamic => {
      if (typeof requestAnimationFrame != "function")
        return void setTimeout(frameTask, 0);
      requestAnimationFrame((): Dynamic => requestAnimationFrame(frameTask));
    };
    hasDesignFilesListing = (listing?: Dynamic): Dynamic =>
      hasDesignIndexListing(listing) ||
      (listing != null && Object.hasOwn(listing, "canvas.json"));
    selectWritableBootListing = (
      listing?: Dynamic,
      bootFlags?: Dynamic,
    ): Dynamic =>
      bootFlags.hosted || bootFlags.capture || bootFlags.narrowed || listing == null
        ? undefined
        : listing;
    pointerInteractionActive = false;
    lastDesignInteractionAt = -1 / 0;
    initialDesignTitle =
      (typeof document === "undefined" ? "" : (document as Dynamic).title) ||
      "Design";
    DESIGN_FOCUS_WAIT_MS = 5e3;
    RELATIVE_ASSET_REFERENCE_PATTERN =
      /(?:\b(?:href|src)\s*=\s*["']|url\(\s*["']?)(?!(?:[a-z][a-z0-9+.-]*:|\/|#))([^"'()?#\s]+)/gi;
    LAST_FOCUSED_ARTBOARD_KEY = "last";
    DESIGN_FILES_READ_FAILURE_MESSAGE =
      "Couldn\u2019t read this canvas\u2019s files. Reload to try again.";
    loadDesignDocumentTree = async (bootArgs?: Dynamic): Promise<Dynamic> => {
      try {
        return await bootDesignDocument(bootArgs);
      } catch (error: Dynamic) {
        console.warn("design: the files boot failed", error);
        hotReloadController.detach();
        return bootArgs.embedded || isEmbeddedApplication
          ? null
          : (): Dynamic => {
              throw new Error(DESIGN_FILES_READ_FAILURE_MESSAGE);
            };
      }
    };
  };
}
