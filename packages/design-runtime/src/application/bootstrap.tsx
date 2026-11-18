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
function bootstrapArtifactApplication(options: Dynamic = {}): Dynamic {
  applyDocumentCdsTheme(document);
  let startedAt: Dynamic = performance.now(),
    value: Dynamic,
    value2: Dynamic;
  (window as Dynamic).addEventListener(
    "message",
    function value14(input?: Dynamic): Dynamic {
      let data: Dynamic = input.data;
      data !== null &&
        typeof data == "object" &&
        "__frame_size_poke" in data &&
        ((window as Dynamic).removeEventListener("message", value14),
        (value = performance.now()),
        value2?.());
    },
  );
  let value3: Dynamic =
      options.document !== undefined ? null : getEmbedContext(),
    flag: Dynamic = false,
    callback: Dynamic = (): Dynamic => flag,
    callback2: Dynamic = (): Dynamic =>
      fetchPublishedFileIndex(fetchArtifactFile).catch(
        (): Dynamic => ({
          files: undefined,
          narrowed: false,
        }),
      ),
    value4: Dynamic = callback2().then(
      (input?: Dynamic): Dynamic => ((flag = input.narrowed), input.files),
    ),
    value5: Dynamic =
      options.tree === undefined || options.document !== undefined
        ? null
        : options
            .tree({
              get: fetchArtifactFile,
              listing: value4,
              narrowed: callback,
              embedded: value3 !== null,
            })
            .catch((): Dynamic => null),
    value6: Dynamic =
      options.document === undefined
        ? null
        : options.document({
            get: fetchArtifactFile,
            listing: value4,
            narrowed: callback,
          });
  value6?.catch((): Dynamic => {});
  function value7(input?: Dynamic, options2: Dynamic = 0): Dynamic {
    let value14: Dynamic = [3e3, 15e3, 6e4][options2];
    value14 !== undefined &&
      setTimeout((): Dynamic => {
        callback2().then((input2?: Dynamic): Dynamic => {
          input2.files !== undefined &&
            setPublishedFileReferences(input2.files);
          (input2.files === undefined || (input2.narrowed && input)) &&
            (clearPendingFileOverlay(),
            value7(input, options2 + 1));
        });
      }, value14);
  }
  async function value8(): Promise<Dynamic> {
    let value14: Dynamic =
      value6 !== null
        ? null
        : Promise.all([
            getRealtimeDatabaseAdapter(),
            resolveDesignWriteAccess(),
          ]);
    value14?.catch((): Dynamic => {});
    let value15: Dynamic = value5 === null ? null : await value5;
    if (value15 !== null)
      try {
        return value15(
          value14 !== null
            ? (await value14)[1]
            : await resolveDesignWriteAccess(),
        );
      } catch (value16: Dynamic) {
        console.error(
          "design: this canvas\u2019s files document could not be built",
          value16,
        );
        let value17: Dynamic =
          value16 instanceof Error ? value16.message : String(value16);
        completeThumbnailAfterPromise();
        healthReporter.report("render", "failure", "internal");
        return {
          doc: createDesignDocumentStore({
            ...logFilesBootstrapError({
              state: {},
              origin: "failed",
              error: value17,
            }),
            embeddedState: createErrorDocumentState(
              CANVAS_LOAD_ERROR_TITLE,
              "Reload to try again.",
            ),
          }),
          census: null,
        };
      }
    if (value6 !== null)
      try {
        return {
          ...(await value6)(),
          census: null,
        };
      } catch (value16: Dynamic) {
        console.error(
          "design: this canvas\u2019s document could not be built",
          value16,
        );
        let value17: Dynamic =
          value16 instanceof Error ? value16.message : String(value16);
        completeThumbnailAfterPromise();
        healthReporter.report("render", "failure", "internal");
        return {
          doc: createDesignDocumentStore({
            ...logFilesBootstrapError({
              state: {},
              origin: "failed",
              error: value17,
            }),
            embeddedState: createErrorDocumentState(
              CANVAS_LOAD_ERROR_TITLE,
              "Reload to try again.",
            ),
          }),
          census: null,
        };
      }
    let callback3: Dynamic = (input?: Dynamic): Dynamic => (
      setFileReferenceStore(undefined),
      initializeDatabaseThumbnail(),
      setCanvasLoadFailure(
        input ?? SIGN_IN_REQUIRED_REASON,
      ),
      {
        doc: createDesignDocumentStore(
          createEmbeddedReadonlyState(EMPTY_BOOT_CONTENT, input),
        ),
        census: null,
      }
    );
    try {
      let [value16, value17]: Dynamic = await value14;
      if (value16 === null) return callback3();
      if (hasInvalidEmbedContext())
        return callback3(
          "This canvas was embedded without valid options; it cannot reach its store here.",
        );
      let value18: Dynamic =
        value3 !== null
          ? prefixDocumentStore(value16, value3.storePrefix)
          : value16;
      setFileReferenceStore(
        value17.canWrite ? value18 : undefined,
      );
      let value19: Dynamic = await value4;
      setPublishedFileReferences(value19 ?? null);
      (value19 === undefined || (flag && value17.canWrite)) &&
        (clearPendingFileOverlay(), value7(value17.canWrite));
      let callback4: Dynamic = (input?: Dynamic): Dynamic => {
        let value20: Dynamic = value17.canWrite && input === undefined;
        value20 || setFileReferenceStore(undefined);
        let value21: Dynamic = createLiveDocument({
          codec: designDocumentStorageAdapter,
          parseContent: parseDesignContent,
          initialContent: EMPTY_BOOT_CONTENT,
          defaultTitle: (document as Dynamic).title || "Design",
          db: value18,
          canWrite: value20,
          readOnlyReason: input ?? value17.reason,
          holdRemote: (input2?: Dynamic): Dynamic =>
            input2 === currentEditingArtboardPath(),
          onStoreUnavailable: (input2?: Dynamic): Dynamic => {
            console.warn(
              "design: live sync unavailable in this view \u2014 " + input2,
            );
            value9
              ? value9(callback3())
              : (value10 = (): Dynamic => callback3());
          },
          onNotice: (input2?: Dynamic): Dynamic =>
            showEditorToast(input2),
        });
        if (value3 === null && !isFrameCaptureDocument()) {
          value21.subscribe((): Dynamic => {
            value21.dirty() && PlatformMigrationStateNow();
          });
          whenDocumentLive(value21, (): Dynamic => {
            markMigrationLoaded();
            let value22: Dynamic = getTombstoneAction({
              tombstone: isMovedToFiles(),
              deadStore: input !== undefined,
              canWrite: value17.canWrite,
            });
            value22 !== "nothing" &&
              setCanvasLoadFailure(
                CouldnTLoadThisCanvasReloadToMessage,
              );
            value22 !== "nothing" &&
              showEditorActionToast(
                CouldnTOpenTheCurrentVersionOfMessage,
                null,
              );
            if (value22 === "reopen-read-only-and-tell") {
              let value23: Dynamic = callback4(
                CouldnTOpenTheCurrentVersionOfMessage,
              );
              value21.dispose?.();
              value9 ? value9(value23) : (value10 = (): Dynamic => value23);
            }
            isMovedToFiles() ||
              (value20 &&
                options.afterStoreLive !== undefined &&
                options
                  .afterStoreLive({
                    get: fetchArtifactFile,
                    listing: value4,
                    narrowed: callback,
                    doc: value21,
                  })
                  .catch((): Dynamic => {}));
          });
          let callback5: Dynamic = (): Dynamic => {
            if (!value17.canWrite || input !== undefined) return;
            if (value21.dirty())
              return void (window as Dynamic).setTimeout(callback5, 500);
            let value22: Dynamic = callback4(
              ThisCanvasNowSavesInAMessage,
            );
            value21.dispose?.();
            value9 ? value9(value22) : (value10 = (): Dynamic => value22);
          };
          input === undefined &&
            subscribeMigrationRestart(callback5);
          subscribeMovedToFiles((): Dynamic => {
            input === undefined &&
              (value21.flushNow(),
              installMigrationRestartHandler({
                isTyping: (): Dynamic =>
                  PlatformMigrationStateNow_2(),
                flush: (): Dynamic => value21.flushNow(),
                drained: (): Dynamic => !value21.dirty(),
                ...(currentEditingArtboard() !== null
                  ? {
                      focus: currentEditingArtboard(),
                    }
                  : {}),
              }));
          });
        }
        monitorDocumentLoadHealth(
          value21,
          (input2?: Dynamic): Dynamic =>
            healthReporter.report(...input2),
        );
        monitorDocumentSaveHealth(
          value21,
          (input2?: Dynamic): Dynamic =>
            healthReporter.report(...input2),
        );
        watchThumbnailDocumentReady(value21, {
          whenPainted: (): Dynamic =>
            waitForDesignProjectFrames(value21.content()).then(
              (): Dynamic => waitForThumbnailPaint(),
            ),
        });
        return {
          doc: value21,
          census: {
            canWrite: value20,
            capture: isFrameCaptureDocument(),
            embedded: value3 !== null,
          },
        };
      };
      return callback4();
    } catch (value16: Dynamic) {
      console.error("design: live store boot failed", value16);
      healthReporter.report(
        ...renderFailureReport,
      );
      return callback3("Live sync is unavailable here. Reload to retry.");
    }
  }
  let value9: Dynamic, value10: Dynamic;
  function value11(input?: Dynamic): Dynamic {
    setHtmlReferenceStore({
      hydrate: (input2?: Dynamic, options2?: Dynamic): Dynamic =>
        input.updateContent(
          (input3?: Dynamic): Dynamic =>
            input3.files[input2] !== undefined &&
            isLoadingArtboardHtml(input3.files[input2])
              ? {
                  files: {
                    ...input3.files,
                    [input2]: options2,
                  },
                }
              : input3,
          {
            auto: true,
          },
        ),
      resync: (): Dynamic =>
        input.updateContent(
          (input2?: Dynamic): Dynamic => ({
            files: {
              ...input2.files,
            },
          }),
          {
            auto: true,
          },
        ),
    });
  }
  function value12(input?: Dynamic): Dynamic {
    input.census !== null &&
      reportDesignOpened(
        input.doc,
        input.census,
        (): Dynamic => ({
          published: getAllFileReferencePaths(),
          designSystems: getDesignSystems().length,
        }),
        frameAnalyticsReporter,
      );
  }
  function value13(input?: Dynamic): Dynamic {
    let value14: Dynamic = value10 ? value10() : input;
    value10 = undefined;
    let doc: Dynamic = value14.doc,
      value15: Dynamic =
        value14.entryFile ?? primaryDesignFile(doc.content());
    value15 === null && (value15 = "Main.dc.html");
    setKvClient(
      value14.kvCap !== undefined
        ? createDocumentKvAdapter(
            doc,
            value14.kvCap.maxFileBytes,
            value14.kvCap.why,
          )
        : createDocumentKvAdapter(doc),
    );
    value11(doc);
    value12(value14);
    (document as Dynamic).querySelector(
      'meta[name="' + ["appifact", "emulator", "build"].join("-") + '"]',
    ) !== null && ((window as Dynamic).__appifactDoc = doc);
    let value16: Dynamic = (document as Dynamic).getElementById("root");
    if (!value16) throw new Error("no #root");
    let value17: Dynamic = isFrameCaptureDocument()
        ? runtimeEmbeddedReact
        : preparePreviewRuntime(runtimeEmbeddedReact),
      flag2: Dynamic = false,
      value18: Dynamic = (0,
      reactDomClientPlatformReactRuntime.createRoot)(value16),
      callback3: Dynamic = (
        input2?: Dynamic,
        options2?: Dynamic,
        context?: Dynamic,
      ): Dynamic =>
        isFrameCaptureDocument() ? (
          <DesignCover
            key={context}
            assets={value17}
            doc={input2}
            maySnapshot={value3 === null && true}
          />
        ) : (
          <DesignDocumentRoot
            key={context}
            filePath={options2}
            assets={value17}
            doc={input2}
          />
        ),
      callback4: Dynamic = (): Dynamic => {
        flag2 ||
          ((flag2 = true),
          value18.render(callback3(doc, value15)),
          value3 !== null && dispatchDesignReady());
      };
    value9 = (input2?: Dynamic): Dynamic => {
      setKvClient(
        createDocumentKvAdapter(input2.doc),
      );
      value11(input2.doc);
      value12(input2);
      flag2 = true;
      value18.render(
        callback3(
          input2.doc,
          primaryDesignFile(input2.doc.content()) ?? value15,
          "no-store",
        ),
      );
      value3 !== null && dispatchDesignReady();
    };
    let value19: Dynamic = performance.now();
    value3 !== null &&
      (installEmbeddedLifecycle(doc), callback4());
    value2 = (): Dynamic => (window as Dynamic).setTimeout(callback4, 300);
    value !== undefined &&
      (window as Dynamic).setTimeout(
        callback4,
        Math.max(0, value + 300 - value19),
      );
    (window as Dynamic).setTimeout(
      callback4,
      Math.max(0, startedAt + 3e3 - value19),
    );
  }
  Promise.all([
    initializeDatabaseRuntime(),
    probeBlobScriptSupport(),
  ])
    .then((): Dynamic => value8())
    .then(value13)
    .catch((input?: Dynamic): Dynamic => {
      console.error("design: boot failed", input);
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
    fetchArtifactFile = (input?: Dynamic): Dynamic =>
      fetch(input, {
        credentials: "same-origin",
        signal: AbortSignal.timeout(
          input.startsWith(ProjectValue) ? 12e4 : 1e4,
        ),
      });
  };
}
