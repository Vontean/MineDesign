/** Restored application module; prepare first, initialize in original order. */
import {
  type Dynamic,
} from "../runtime-types";
import { DesignCover } from "./design-cover";
import { DesignDocumentRoot } from "./document-root";
import { isFrameCaptureDocument } from "../canvas/frame-environment";
import { waitForDesignProjectFrames } from "../canvas/frame-readiness";
import { load_react_jsx_runtime } from "../dependencies";
import { getDesignSystems } from "../design-system/store";
import { clearPendingFileOverlay, setHtmlReferenceStore, setPublishedFileReferences } from "../design-system/type-declarations";
import { showEditorActionToast, showEditorToast } from "../editor/chrome/pending-toasts";
import { currentEditingArtboard, currentEditingArtboardPath } from "../editor/session/artboard-state";
import { renderFailureReport } from "../export/outcomes";
import { toModuleNamespace } from "../module-helpers";
import { getRealtimeDatabaseAdapter } from "../platform/database-adapter";
import { initializeDatabaseRuntime } from "../platform/database-runtime";
import { designDocumentStorageAdapter, isLoadingArtboardHtml } from "../platform/design-document-adapter";
import { reportDesignOpened, whenDocumentLive } from "../platform/design-metrics";
import { applyDocumentCdsTheme } from "../platform/document-theme";
import { getAllFileReferencePaths, setFileReferenceStore } from "../platform/external-files";
import { createDesignDocumentStore, createDocumentKvAdapter, dispatchDesignReady, getEmbedContext, hasInvalidEmbedContext, installEmbeddedLifecycle, parseDesignContent, prefixDocumentStore, primaryDesignFile, ProjectValue, setKvClient } from "../platform/file-content";
import { fetchPublishedFileIndex } from "../platform/file-references";
import { CANVAS_LOAD_ERROR_TITLE, createErrorDocumentState, logFilesBootstrapError } from "../platform/files-fallback";
import { frameAnalyticsReporter, healthReporter } from "../platform/health-and-analytics";
import { createLiveDocument } from "../platform/live-document";
import { CouldnTLoadThisCanvasReloadToMessage, CouldnTOpenTheCurrentVersionOfMessage, isMovedToFiles, setCanvasLoadFailure } from "../platform/migration-input";
import { installMigrationRestartHandler, markMigrationLoaded, PlatformMigrationStateNow, PlatformMigrationStateNow_2, subscribeMigrationRestart, subscribeMovedToFiles, ThisCanvasNowSavesInAMessage } from "../platform/migration-state";
import { reactDomClientPlatformReactRuntime, runtimeEmbeddedReact } from "../platform/react-runtime";
import { monitorDocumentLoadHealth, monitorDocumentSaveHealth } from "../platform/sync-health";
import { completeThumbnailAfterPromise, initializeDatabaseThumbnail, waitForThumbnailPaint, watchThumbnailDocumentReady } from "../platform/thumbnail";
import { getTombstoneAction } from "../platform/tombstone-actions";
import { createEmbeddedReadonlyState, resolveDesignWriteAccess, SIGN_IN_REQUIRED_REASON } from "../platform/write-access";
import { preparePreviewRuntime, probeBlobScriptSupport } from "../preview/runtime-loading";

var bootstrapJsxRuntime: Dynamic;
var EMPTY_BOOT_CONTENT: Dynamic;
var fetchArtifactFile: Dynamic;
function bootstrapArtifactApplication(bootOptions: Dynamic = {}): Dynamic {
  applyDocumentCdsTheme(document);
  let startedAt: Dynamic = performance.now(),
    framePokeAt: Dynamic,
    onFramePoke: Dynamic;
  (window as Dynamic).addEventListener(
    "message",
    function onFramePokeMessage(messageEvent?: Dynamic): Dynamic {
      let data: Dynamic = messageEvent.data;
      data !== null &&
        typeof data == "object" &&
        "__frame_size_poke" in data &&
        ((window as Dynamic).removeEventListener("message", onFramePokeMessage),
        (framePokeAt = performance.now()),
        onFramePoke?.());
    },
  );
  let embedContext: Dynamic =
      bootOptions.document !== undefined ? null : getEmbedContext(),
    isNarrowed: Dynamic = false,
    getIsNarrowed: Dynamic = (): Dynamic => isNarrowed,
    fetchFileIndex: Dynamic = (): Dynamic =>
      fetchPublishedFileIndex(fetchArtifactFile).catch(
        (): Dynamic => ({
          files: undefined,
          narrowed: false,
        }),
      ),
    fileListing: Dynamic = fetchFileIndex().then(
      (index?: Dynamic): Dynamic => ((isNarrowed = index.narrowed), index.files),
    ),
    treeBuilderPromise: Dynamic =
      bootOptions.tree === undefined || bootOptions.document !== undefined
        ? null
        : bootOptions
            .tree({
              get: fetchArtifactFile,
              listing: fileListing,
              narrowed: getIsNarrowed,
              embedded: embedContext !== null,
            })
            .catch((): Dynamic => null),
    documentBuilderPromise: Dynamic =
      bootOptions.document === undefined
        ? null
        : bootOptions.document({
            get: fetchArtifactFile,
            listing: fileListing,
            narrowed: getIsNarrowed,
          });
  documentBuilderPromise?.catch((): Dynamic => {});
  function retryFileIndex(canWrite?: Dynamic, attempt: Dynamic = 0): Dynamic {
    let retryDelayMs: Dynamic = [3e3, 15e3, 6e4][attempt];
    retryDelayMs !== undefined &&
      setTimeout((): Dynamic => {
        fetchFileIndex().then((index?: Dynamic): Dynamic => {
          index.files !== undefined &&
            setPublishedFileReferences(index.files);
          (index.files === undefined || (index.narrowed && canWrite)) &&
            (clearPendingFileOverlay(),
            retryFileIndex(canWrite, attempt + 1));
        });
      }, retryDelayMs);
  }
  async function buildBootState(): Promise<Dynamic> {
    let backendPromise: Dynamic =
      documentBuilderPromise !== null
        ? null
        : Promise.all([
            getRealtimeDatabaseAdapter(),
            resolveDesignWriteAccess(),
          ]);
    backendPromise?.catch((): Dynamic => {});
    let buildFromTree: Dynamic = treeBuilderPromise === null ? null : await treeBuilderPromise;
    if (buildFromTree !== null)
      try {
        return buildFromTree(
          backendPromise !== null
            ? (await backendPromise)[1]
            : await resolveDesignWriteAccess(),
        );
      } catch (error: Dynamic) {
        console.error(
          "design: this canvas\u2019s files document could not be built",
          error,
        );
        let errorMessage: Dynamic =
          error instanceof Error ? error.message : String(error);
        completeThumbnailAfterPromise();
        healthReporter.report("render", "failure", "internal");
        return {
          doc: createDesignDocumentStore({
            ...logFilesBootstrapError({
              state: {},
              origin: "failed",
              error: errorMessage,
            }),
            embeddedState: createErrorDocumentState(
              CANVAS_LOAD_ERROR_TITLE,
              "Reload to try again.",
            ),
          }),
          census: null,
        };
      }
    if (documentBuilderPromise !== null)
      try {
        return {
          ...(await documentBuilderPromise)(),
          census: null,
        };
      } catch (error: Dynamic) {
        console.error(
          "design: this canvas\u2019s document could not be built",
          error,
        );
        let errorMessage: Dynamic =
          error instanceof Error ? error.message : String(error);
        completeThumbnailAfterPromise();
        healthReporter.report("render", "failure", "internal");
        return {
          doc: createDesignDocumentStore({
            ...logFilesBootstrapError({
              state: {},
              origin: "failed",
              error: errorMessage,
            }),
            embeddedState: createErrorDocumentState(
              CANVAS_LOAD_ERROR_TITLE,
              "Reload to try again.",
            ),
          }),
          census: null,
        };
      }
    let createReadOnlyBootState: Dynamic = (readOnlyReason?: Dynamic): Dynamic => (
      setFileReferenceStore(undefined),
      initializeDatabaseThumbnail(),
      setCanvasLoadFailure(
        readOnlyReason ?? SIGN_IN_REQUIRED_REASON,
      ),
      {
        doc: createDesignDocumentStore(
          createEmbeddedReadonlyState(EMPTY_BOOT_CONTENT, readOnlyReason),
        ),
        census: null,
      }
    );
    try {
      let [database, writeAccess]: Dynamic = await backendPromise;
      if (database === null) return createReadOnlyBootState();
      if (hasInvalidEmbedContext())
        return createReadOnlyBootState(
          "This canvas was embedded without valid options; it cannot reach its store here.",
        );
      let documentDatabase: Dynamic =
        embedContext !== null
          ? prefixDocumentStore(database, embedContext.storePrefix)
          : database;
      setFileReferenceStore(
        writeAccess.canWrite ? documentDatabase : undefined,
      );
      let publishedFiles: Dynamic = await fileListing;
      setPublishedFileReferences(publishedFiles ?? null);
      (publishedFiles === undefined || (isNarrowed && writeAccess.canWrite)) &&
        (clearPendingFileOverlay(), retryFileIndex(writeAccess.canWrite));
      let openLiveDocument: Dynamic = (readOnlyReason?: Dynamic): Dynamic => {
        let canWriteLive: Dynamic = writeAccess.canWrite && readOnlyReason === undefined;
        canWriteLive || setFileReferenceStore(undefined);
        let liveDoc: Dynamic = createLiveDocument({
          codec: designDocumentStorageAdapter,
          parseContent: parseDesignContent,
          initialContent: EMPTY_BOOT_CONTENT,
          defaultTitle: (document as Dynamic).title || "Design",
          db: documentDatabase,
          canWrite: canWriteLive,
          readOnlyReason: readOnlyReason ?? writeAccess.reason,
          holdRemote: (file?: Dynamic): Dynamic =>
            file === currentEditingArtboardPath(),
          onStoreUnavailable: (reason?: Dynamic): Dynamic => {
            console.warn(
              "design: live sync unavailable in this view \u2014 " + reason,
            );
            replaceBootState
              ? replaceBootState(createReadOnlyBootState())
              : (pendingBootState = (): Dynamic => createReadOnlyBootState());
          },
          onNotice: (message?: Dynamic): Dynamic =>
            showEditorToast(message),
        });
        if (embedContext === null && !isFrameCaptureDocument()) {
          liveDoc.subscribe((): Dynamic => {
            liveDoc.dirty() && PlatformMigrationStateNow();
          });
          whenDocumentLive(liveDoc, (): Dynamic => {
            markMigrationLoaded();
            let tombstoneAction: Dynamic = getTombstoneAction({
              tombstone: isMovedToFiles(),
              deadStore: readOnlyReason !== undefined,
              canWrite: writeAccess.canWrite,
            });
            tombstoneAction !== "nothing" &&
              setCanvasLoadFailure(
                CouldnTLoadThisCanvasReloadToMessage,
              );
            tombstoneAction !== "nothing" &&
              showEditorActionToast(
                CouldnTOpenTheCurrentVersionOfMessage,
                null,
              );
            if (tombstoneAction === "reopen-read-only-and-tell") {
              let reopenedState: Dynamic = openLiveDocument(
                CouldnTOpenTheCurrentVersionOfMessage,
              );
              liveDoc.dispose?.();
              replaceBootState ? replaceBootState(reopenedState) : (pendingBootState = (): Dynamic => reopenedState);
            }
            isMovedToFiles() ||
              (canWriteLive &&
                bootOptions.afterStoreLive !== undefined &&
                bootOptions
                  .afterStoreLive({
                    get: fetchArtifactFile,
                    listing: fileListing,
                    narrowed: getIsNarrowed,
                    doc: liveDoc,
                  })
                  .catch((): Dynamic => {}));
          });
          let restartWhenIdle: Dynamic = (): Dynamic => {
            if (!writeAccess.canWrite || readOnlyReason !== undefined) return;
            if (liveDoc.dirty())
              return void (window as Dynamic).setTimeout(restartWhenIdle, 500);
            let restartedState: Dynamic = openLiveDocument(
              ThisCanvasNowSavesInAMessage,
            );
            liveDoc.dispose?.();
            replaceBootState ? replaceBootState(restartedState) : (pendingBootState = (): Dynamic => restartedState);
          };
          readOnlyReason === undefined &&
            subscribeMigrationRestart(restartWhenIdle);
          subscribeMovedToFiles((): Dynamic => {
            readOnlyReason === undefined &&
              (liveDoc.flushNow(),
              installMigrationRestartHandler({
                isTyping: (): Dynamic =>
                  PlatformMigrationStateNow_2(),
                flush: (): Dynamic => liveDoc.flushNow(),
                drained: (): Dynamic => !liveDoc.dirty(),
                ...(currentEditingArtboard() !== null
                  ? {
                      focus: currentEditingArtboard(),
                    }
                  : {}),
              }));
          });
        }
        monitorDocumentLoadHealth(
          liveDoc,
          (reportArgs?: Dynamic): Dynamic =>
            healthReporter.report(...reportArgs),
        );
        monitorDocumentSaveHealth(
          liveDoc,
          (reportArgs?: Dynamic): Dynamic =>
            healthReporter.report(...reportArgs),
        );
        watchThumbnailDocumentReady(liveDoc, {
          whenPainted: (): Dynamic =>
            waitForDesignProjectFrames(liveDoc.content()).then(
              (): Dynamic => waitForThumbnailPaint(),
            ),
        });
        return {
          doc: liveDoc,
          census: {
            canWrite: canWriteLive,
            capture: isFrameCaptureDocument(),
            embedded: embedContext !== null,
          },
        };
      };
      return openLiveDocument();
    } catch (error: Dynamic) {
      console.error("design: live store boot failed", error);
      healthReporter.report(
        ...renderFailureReport,
      );
      return createReadOnlyBootState("Live sync is unavailable here. Reload to retry.");
    }
  }
  let replaceBootState: Dynamic, pendingBootState: Dynamic;
  function installHtmlReferenceStore(doc?: Dynamic): Dynamic {
    setHtmlReferenceStore({
      hydrate: (file?: Dynamic, html?: Dynamic): Dynamic =>
        doc.updateContent(
          (content?: Dynamic): Dynamic =>
            content.files[file] !== undefined &&
            isLoadingArtboardHtml(content.files[file])
              ? {
                  files: {
                    ...content.files,
                    [file]: html,
                  },
                }
              : content,
          {
            auto: true,
          },
        ),
      resync: (): Dynamic =>
        doc.updateContent(
          (content?: Dynamic): Dynamic => ({
            files: {
              ...content.files,
            },
          }),
          {
            auto: true,
          },
        ),
    });
  }
  function reportDesignOpenedOnce(bootState?: Dynamic): Dynamic {
    bootState.census !== null &&
      reportDesignOpened(
        bootState.doc,
        bootState.census,
        (): Dynamic => ({
          published: getAllFileReferencePaths(),
          designSystems: getDesignSystems().length,
        }),
        frameAnalyticsReporter,
      );
  }
  function renderApplication(initialBootState?: Dynamic): Dynamic {
    let bootState: Dynamic = pendingBootState ? pendingBootState() : initialBootState;
    pendingBootState = undefined;
    let doc: Dynamic = bootState.doc,
      entryFile: Dynamic =
        bootState.entryFile ?? primaryDesignFile(doc.content());
    entryFile === null && (entryFile = "Main.dc.html");
    setKvClient(
      bootState.kvCap !== undefined
        ? createDocumentKvAdapter(
            doc,
            bootState.kvCap.maxFileBytes,
            bootState.kvCap.why,
          )
        : createDocumentKvAdapter(doc),
    );
    installHtmlReferenceStore(doc);
    reportDesignOpenedOnce(bootState);
    (document as Dynamic).querySelector(
      'meta[name="' + ["appifact", "emulator", "build"].join("-") + '"]',
    ) !== null && ((window as Dynamic).__appifactDoc = doc);
    let rootElement: Dynamic = (document as Dynamic).getElementById("root");
    if (!rootElement) throw new Error("no #root");
    let previewAssets: Dynamic = isFrameCaptureDocument()
        ? runtimeEmbeddedReact
        : preparePreviewRuntime(runtimeEmbeddedReact),
      hasRendered: Dynamic = false,
      reactRoot: Dynamic = (0,
      reactDomClientPlatformReactRuntime.createRoot)(rootElement),
      createView: Dynamic = (
        viewDoc?: Dynamic,
        viewFilePath?: Dynamic,
        viewKey?: Dynamic,
      ): Dynamic =>
        isFrameCaptureDocument() ? (
          <DesignCover
            key={viewKey}
            assets={previewAssets}
            doc={viewDoc}
            maySnapshot={embedContext === null && true}
          />
        ) : (
          <DesignDocumentRoot
            key={viewKey}
            filePath={viewFilePath}
            assets={previewAssets}
            doc={viewDoc}
          />
        ),
      renderOnce: Dynamic = (): Dynamic => {
        hasRendered ||
          ((hasRendered = true),
          reactRoot.render(createView(doc, entryFile)),
          embedContext !== null && dispatchDesignReady());
      };
    replaceBootState = (replacementState?: Dynamic): Dynamic => {
      setKvClient(
        createDocumentKvAdapter(replacementState.doc),
      );
      installHtmlReferenceStore(replacementState.doc);
      reportDesignOpenedOnce(replacementState);
      hasRendered = true;
      reactRoot.render(
        createView(
          replacementState.doc,
          primaryDesignFile(replacementState.doc.content()) ?? entryFile,
          "no-store",
        ),
      );
      embedContext !== null && dispatchDesignReady();
    };
    let now: Dynamic = performance.now();
    embedContext !== null &&
      (installEmbeddedLifecycle(doc), renderOnce());
    onFramePoke = (): Dynamic => (window as Dynamic).setTimeout(renderOnce, 300);
    framePokeAt !== undefined &&
      (window as Dynamic).setTimeout(
        renderOnce,
        Math.max(0, framePokeAt + 300 - now),
      );
    (window as Dynamic).setTimeout(
      renderOnce,
      Math.max(0, startedAt + 3e3 - now),
    );
  }
  Promise.all([
    initializeDatabaseRuntime(),
    probeBlobScriptSupport(),
  ])
    .then((): Dynamic => buildBootState())
    .then(renderApplication)
    .catch((error?: Dynamic): Dynamic => {
      console.error("design: boot failed", error);
    });
}
export {
  bootstrapArtifactApplication,
  bootstrapJsxRuntime,
  EMPTY_BOOT_CONTENT,
  fetchArtifactFile,
};
export function installApplicationBootstrap(): () => void {
  return () => {
    bootstrapJsxRuntime = toModuleNamespace(
      load_react_jsx_runtime(),
      1,
    );
    EMPTY_BOOT_CONTENT = {
      files: {},
    };
    fetchArtifactFile = (url?: Dynamic): Dynamic =>
      fetch(url, {
        credentials: "same-origin",
        signal: AbortSignal.timeout(
          url.startsWith(ProjectValue) ? 12e4 : 1e4,
        ),
      });
  };
}
