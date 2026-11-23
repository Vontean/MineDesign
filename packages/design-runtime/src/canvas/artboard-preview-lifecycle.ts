import { uiMessage } from "@minedesign/contracts/ui-messages";
import type { Dynamic } from "../runtime-types";
import { PreviewGenerationGate, setPreviewGenerationGate } from "../preview/generation-gate";
import { emptyArtboardErrors } from "./artboard-errors";
import { artboardBootScheduler } from "./boot-scheduler";
import { scheduleDesktopRenderingRefresh } from "./desktop-refresh";
import { forceRefreshEventName, remoteFilesEventName } from "./frame-environment";
import { unblockDesignFramesReady } from "./frame-readiness";
import { compileArtboardPreview, readArtboardProjectFiles } from "./preview-compilation";
import { usePreviewBootMessages } from "./preview-boot-messages";
import { usePreviewConnection } from "./preview-connection";
import { usePreviewRecovery } from "./preview-recovery";
import { reactCanvasShape } from "./shape";
import { npm_useEventListener_bc } from "../dependencies";
import { mergeDesignSystemFileOverlay, subscribeDesignSystemFiles } from "../design-system/file-overlay";
import { subscribeHtmlReferences } from "../design-system/type-declarations";
import { emitEditorEvent } from "../editor/events/runtime";
import { compareDesignSourceScripts, editorOwnsUndo, notifyUndoGesture } from "../editor/history-ownership";
import { artboardComponentName } from "../editor/html/dc-document";
import { isLoadingArtboardHtml } from "../platform/design-document-adapter";
import { subscribeArtboardsAtAddressFlag } from "../platform/feature-flags";
import { filterAddressedFiles, isRequiredProjectFile } from "../preview/addressed-artboards";
import { collectProjectDependencyFiles } from "../preview/dependency-graph";
import { createPreviewHandle } from "../preview/evaluation";
import { set_lastDesignEditAt } from "./compilation-cache";

interface ArtboardPreviewOptions {
  previewFile: string;
  doc: { content(): { files: Record<string, Dynamic> } };
  assets: Dynamic;
  live: boolean;
  editable: boolean;
  frameArmed: boolean;
  frameless: boolean;
  shouldHoldRebuild(): boolean;
  clearPendingAdoptions(): void;
  syncBeforeCompile(file: string): Promise<unknown> | undefined;
  readEditingSession(): Dynamic;
  updateBootProperties(metadata: { rootName: string; propsMeta: unknown }): void;
  pushDirtyModel(): void;
  onModelReparsed?(file: string, model: null, diagnostics: null): void;
}

/** Own the iframe generation, project recompilation and external-file refresh. */
export function useArtboardPreviewLifecycle({
  previewFile, doc, assets, live, editable, frameArmed, frameless, shouldHoldRebuild,
  clearPendingAdoptions, syncBeforeCompile, readEditingSession, updateBootProperties,
  pushDirtyModel, onModelReparsed,
}: ArtboardPreviewOptions) {
  type PreviewDocument = ReturnType<typeof compileArtboardPreview>["previewDocument"];
  const iframeRef: { current: HTMLIFrameElement | null } = (0, reactCanvasShape.useRef)(null);
  const previewGenerationGate: PreviewGenerationGate = (0, reactCanvasShape.useMemo)(
    () => new PreviewGenerationGate(), [],
  );
  const [previewDocument, setPreviewDocument]: [PreviewDocument | null, (value: PreviewDocument | null) => void] =
    (0, reactCanvasShape.useState)(null);
  const srcdoc = previewDocument?.srcdoc ?? null;
  const lastRenderedGenerationRef = (0, reactCanvasShape.useRef)(-1);
  const pendingGenerationRef = (0, reactCanvasShape.useRef)(-1);
  const [readyGeneration, setReadyGeneration] = (0, reactCanvasShape.useState)(0);
  const [displayedGeneration, setDisplayedGeneration] = (0, reactCanvasShape.useState)(0);
  const [previewLoadError, setPreviewLoadError] = (0, reactCanvasShape.useState)(null);
  const [previewBlockedReason, setPreviewBlockedReason] = (0, reactCanvasShape.useState)(null);
  const [artboardErrors, setArtboardErrors] = (0, reactCanvasShape.useState)(emptyArtboardErrors);
  const [frameReady, setFrameReady] = (0, reactCanvasShape.useState)(false);

  const frameReadyRef = (0, reactCanvasShape.useRef)(false);
  frameReadyRef.current = frameReady;
  const srcdocRef = (0, reactCanvasShape.useRef)(null);
  srcdocRef.current = srcdoc;
  const previewDocumentRef = (0, reactCanvasShape.useRef)(previewDocument);
  previewDocumentRef.current = previewDocument;
  const displayedGenerationRef = (0, reactCanvasShape.useRef)(displayedGeneration);
  displayedGenerationRef.current = displayedGeneration;
  const liveRef = (0, reactCanvasShape.useRef)(live);
  liveRef.current = live;
  const loadedComponentIdsRef = (0, reactCanvasShape.useRef)(new Set<string>());
  const dependencyFilesRef = (0, reactCanvasShape.useRef)(new Set<string>());
  const expandedComponentsRef = (0, reactCanvasShape.useRef)(new Set<string>());
  const coveredStylesheetsRef = (0, reactCanvasShape.useRef)(new Set<string>());
  const compilationAddressesRef = (0, reactCanvasShape.useRef)(new Set());
  const retiredGenerationRef = (0, reactCanvasShape.useRef)(0);
  const loadErrorRef = (0, reactCanvasShape.useRef)(null);
  loadErrorRef.current = previewLoadError;
  const blockedReasonRef = (0, reactCanvasShape.useRef)(null);
  blockedReasonRef.current = previewBlockedReason;

  const [scheduledToBoot, setScheduledToBoot] = (0, reactCanvasShape.useState)(false);
  const hasSrcdoc = srcdoc != null;
  const isPreviewBlocked = previewLoadError != null || previewBlockedReason != null;
  (0, reactCanvasShape.useEffect)(() => {
    if (!live || !frameArmed || !hasSrcdoc || scheduledToBoot || isPreviewBlocked) return;
    return artboardBootScheduler.request(previewFile, () => {
      if (liveRef.current) setScheduledToBoot(true);
      else artboardBootScheduler.done(previewFile);
    });
  }, [live, frameArmed, hasSrcdoc, scheduledToBoot, isPreviewBlocked, previewFile]);
  (0, reactCanvasShape.useEffect)(() => {
    if (frameReady) artboardBootScheduler.done(previewFile);
  }, [frameReady, previewFile]);
  (0, reactCanvasShape.useEffect)(() => {
    if (previewLoadError == null && previewBlockedReason == null) return;
    artboardBootScheduler.done(previewFile);
    setScheduledToBoot(false);
  }, [previewLoadError, previewBlockedReason, previewFile]);
  (0, reactCanvasShape.useEffect)(() => () => artboardBootScheduler.done(previewFile), [previewFile]);

  const attachIframe = (0, reactCanvasShape.useCallback)((iframe: HTMLIFrameElement | null) => {
    iframeRef.current = iframe;
    if (iframe != null) {
      setPreviewGenerationGate(iframe, previewGenerationGate);
      previewGenerationGate.generationMounted(displayedGeneration);
    }
  }, [previewGenerationGate, displayedGeneration]);
  const retireFrame = (0, reactCanvasShape.useCallback)(() => {
    retiredGenerationRef.current = previewGenerationGate.mountedGeneration;
    previewGenerationGate.frameRetired();
    setPreviewDocument(null);
    setFrameReady(false);
  }, [previewGenerationGate]);
  (0, reactCanvasShape.useEffect)(() => retireFrame, [retireFrame]);

  const [isLoadingArtboard, setIsLoadingArtboard] = (0, reactCanvasShape.useState)(false);
  const canEditPreview = editable && !isLoadingArtboard;
  const buildRequestRef = (0, reactCanvasShape.useRef)(0);
  const compiledSourceRef = (0, reactCanvasShape.useRef)(undefined);
  const rebuildPreview = (0, reactCanvasShape.useCallback)(async () => {
    clearPendingAdoptions();
    const deferRebuild = () =>
      previewGenerationGate.blocked == null &&
      loadErrorRef.current == null &&
      blockedReasonRef.current == null &&
      shouldHoldRebuild();
    if (deferRebuild()) return;

    const requestId = ++buildRequestRef.current;
    try {
      const files = await readArtboardProjectFiles();
      setIsLoadingArtboard(isLoadingArtboardHtml(files[previewFile] ?? ""));
      try {
        await syncBeforeCompile(previewFile);
      } catch {
      } finally {
        clearPendingAdoptions();
      }
      if (requestId !== buildRequestRef.current) return;
      if (!liveRef.current) {
        retireFrame();
        setPreviewLoadError(null);
        setPreviewBlockedReason(null);
        setArtboardErrors(emptyArtboardErrors);
        return;
      }
      if (deferRebuild()) return;

      const compiled = compileArtboardPreview(previewFile, files, assets, frameless);
      setPreviewDocument(compiled.previewDocument);
      compiledSourceRef.current = files[previewFile];
      loadedComponentIdsRef.current = compiled.loadedComponentIds;
      dependencyFilesRef.current = compiled.dependencyFiles;
      coveredStylesheetsRef.current = compiled.coveredStylesheets;
      compilationAddressesRef.current = compiled.compilationAddresses;
      setDisplayedGeneration(previewGenerationGate.hostWillLoad());
      setPreviewLoadError(null);
      setPreviewBlockedReason(null);
    } catch (error) {
      setPreviewBlockedReason(String(error));
      unblockDesignFramesReady();
    }
  }, [previewFile, previewGenerationGate, retireFrame, frameless]);

  (0, reactCanvasShape.useEffect)(() =>
    subscribeArtboardsAtAddressFlag(() => { rebuildPreview(); }),
  [rebuildPreview]);
  (0, reactCanvasShape.useEffect)(() => {
    rebuildPreview();
    const unsubscribeDesignSystemFiles = subscribeDesignSystemFiles(() => { rebuildPreview(); });
    const unsubscribeHtmlReferences = subscribeHtmlReferences((paths: string[]) => {
      if (paths.some((path) => isRequiredProjectFile(
        path, previewFile, dependencyFilesRef.current, loadedComponentIdsRef.current,
      ))) rebuildPreview();
    });
    return () => {
      unsubscribeDesignSystemFiles();
      unsubscribeHtmlReferences();
    };
  }, [rebuildPreview]);

  const previousLiveRef = (0, reactCanvasShape.useRef)(live);
  (0, reactCanvasShape.useLayoutEffect)(() => {
    if (live === previousLiveRef.current) return;
    previousLiveRef.current = live;
    if (!live) {
      if (srcdocRef.current != null && loadErrorRef.current == null && blockedReasonRef.current == null) {
        set_lastDesignEditAt(performance.now());
      }
      retireFrame();
      setScheduledToBoot(false);
      artboardBootScheduler.done(previewFile);
      return;
    }
    if (loadErrorRef.current == null && blockedReasonRef.current == null) rebuildPreview();
  }, [live, rebuildPreview, retireFrame]);

  const refreshCompiledSource = (0, reactCanvasShape.useCallback)(async (): Promise<string | null> => {
    const updated = doc.content().files[previewFile];
    const previous = compiledSourceRef.current;
    if (updated !== undefined && updated === previous) return null;
    if (!createPreviewHandle(iframeRef.current) || loadErrorRef.current != null || blockedReasonRef.current != null) {
      return uiMessage("canvas.artboardFrame.theFrameIsNotLive");
    }
    const source = compareDesignSourceScripts(previous, updated);
    if (!source.ok) return source.why;

    const name = artboardComponentName(previewFile);
    try {
      await syncBeforeCompile(previewFile);
    } catch {}
    const component = readEditingSession().state(name);
    const session = component?.path === previewFile ? component : null;
    if (session && (session.dirty || session.pendingScript !== undefined || session.pendingProps !== undefined)) {
      return uiMessage("canvas.artboardFrame.thisBoardHasUnsavedLocal");
    }
    if (session) {
      if (session.src !== updated) return uiMessage("canvas.artboardFrame.theModelDidNotAdopt");
      session.stampGen = (session.stampGen ?? -1) + 1;
      session.liveStampsStale = false;
      readEditingSession().pushLive(name);
    } else {
      emitEditorEvent("dc-update", {
        name, path: previewFile, kind: "html", content: source.template, streaming: false, viewportKey: "dc-model",
      });
      onModelReparsed?.(previewFile, null, null);
    }
    compiledSourceRef.current = updated;
    return null;
  }, [previewFile]);

  const releaseFrame = (0, reactCanvasShape.useCallback)((reason: string) => {
    notifyUndoGesture("board-remote", {
      file: previewFile,
      how: uiMessage("canvas.artboardFrame.theTextBoxOrDrag") + (
        reason === "rebuild" ? uiMessage("canvas.artboardFrame.reloadingNow") : uiMessage("canvas.artboardFrame.redrawingNow")
      ),
    });
    if (reason === "rebuild") rebuildPreview();
    else readEditingSession().pushLive(artboardComponentName(previewFile));
  }, [rebuildPreview, previewFile]);

  npm_useEventListener_bc(forceRefreshEventName, () => { rebuildPreview(); });
  npm_useEventListener_bc(remoteFilesEventName, (event: CustomEvent<{ paths?: string[] }>) => {
    const affected: string[] = filterAddressedFiles(
      event.detail?.paths ?? [],
      previewFile,
      dependencyFilesRef.current,
      loadedComponentIdsRef.current,
      () => collectProjectDependencyFiles(mergeDesignSystemFileOverlay(doc.content().files), previewFile),
    );
    if (affected.length === 0) return;

    const artboardOnly = affected.length === 1 && affected[0] === previewFile;
    if (artboardOnly && editorOwnsUndo()) {
      const started = performance.now();
      refreshCompiledSource().then((failure: string | null) => {
        if (failure === null) {
          notifyUndoGesture("board-remote", {
            file: previewFile,
            how: "in place (__dcUpdate)",
            ms: Math.round(performance.now() - started),
          });
        } else {
          notifyUndoGesture("board-remote", { file: previewFile, how: "rebuilt iframe", why: failure });
          rebuildPreview();
        }
      }, (error: unknown) => {
        notifyUndoGesture("board-remote", {
          file: previewFile,
          how: "rebuilt iframe",
          get why() { return "in-place threw: " + String(error); },
        });
        rebuildPreview();
      });
      return;
    }

    notifyUndoGesture("board-remote", {
      file: previewFile,
      how: "rebuilt iframe",
      get why() {
        return artboardOnly ? "in-place is off" :
          uiMessage("canvas.artboardFrame.aFileThisBoardImports") + affected.join(", ");
      },
    });
    rebuildPreview();
  });
  (0, reactCanvasShape.useEffect)(() =>
    scheduleDesktopRenderingRefresh(() => iframeRef.current),
  [readyGeneration]);

  const previewBoot = usePreviewBootMessages({
    file: previewFile,
    displayedGenerationRef,
    clearErrors: () => setArtboardErrors(emptyArtboardErrors),
    updateProperties: updateBootProperties,
    pushDirtyModel,
  });
  const onFrameLoad = usePreviewConnection({
    iframeRef,
    gate: previewGenerationGate,
    previewDocument,
    displayedGeneration,
    retiredGenerationRef,
    lastRenderedGenerationRef,
    isRetired: () => false,
    isLoading: isLoadingArtboard,
    onBlocked: setPreviewLoadError,
    onAcceptGeneration(generation) {
      pendingGenerationRef.current = generation;
      if (generation === displayedGenerationRef.current && !previewBoot.isLoaded(generation)) {
        setArtboardErrors(emptyArtboardErrors);
      }
    },
    onReady() {
      setFrameReady(true);
      setReadyGeneration((generation: number) => generation + 1);
    },
  });
  const handlePreviewFailure = usePreviewRecovery({
    file: previewFile,
    readPreview: () => previewDocumentRef.current,
    readCompilationAddresses: () => compilationAddressesRef.current,
    ignoreBootFailure: () =>
      pendingGenerationRef.current === displayedGenerationRef.current ||
      (previewDocumentRef.current?.boot != null &&
        lastRenderedGenerationRef.current !== displayedGenerationRef.current),
    rebuild: rebuildPreview,
    reportBlocked: setPreviewBlockedReason,
  });

  const isCanvasReady = (0, reactCanvasShape.useCallback)(
    () => liveRef.current && frameReadyRef.current && iframeRef.current != null,
    [],
  );
  const isCanvasBlocked = (0, reactCanvasShape.useCallback)(
    () => loadErrorRef.current != null || blockedReasonRef.current != null,
    [],
  );
  return {
    iframeRef, srcdoc, readyGeneration, displayedGeneration, frameReady, scheduledToBoot,
    canEditPreview, previewLoadError, previewBlockedReason, artboardErrors, setArtboardErrors,
    attachIframe, onFrameLoad, rebuildPreview, releaseFrame, previewBoot, handlePreviewFailure,
    isCanvasReady, isCanvasBlocked,
    hotUpdateState: {
      projectRoot: () => previewDocumentRef.current?.projectRoot,
      loadedComponents: loadedComponentIdsRef,
      loadingComponents: expandedComponentsRef,
      coveredStylesheets: coveredStylesheetsRef,
    },
  };
}
