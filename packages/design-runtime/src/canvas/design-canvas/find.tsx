import { reactChromeTheme as React } from "../../editor/chrome/theme";
import { createFindNavigationOriginTracker } from "../../find/navigation-origin";
import { hasBlockingEditorOverlay } from "../../editor/text/typing-target";
import { useArtboardKeyRouting } from "../key-routing";
import { McFindAttribute, isEditingInputTarget } from "../../editor/keyboard/find";
import { canRevealFindMatch, designFileTextRuns, findRestoreCamera, runFindRevealAfterSettle } from "../../find/canvas-adapter";
import { initializeDesignKeyboardBindings } from "../../application/document-root";
import { isArtboardInViewport } from "../viewport-store";
import { recallCanvasView } from "../viewport-memory";
import { type Dynamic } from "../../runtime-types";
import { defaultCanvasCamera } from "./playback";

/** 页面或画板变化时计算（useMemo）：为查找栏提供画板文本、显示匹配项所需的平移与聚焦，以及关闭后恢复视口。 */
interface FindCanvasDependencies {
  readonly doc: Dynamic;
  readonly camera: Dynamic;
  readonly canvasRoot: Dynamic;
  readonly viewport: Dynamic;
  readonly frames: Dynamic;
  readonly isTextEditing: Dynamic;
  readonly playingFile: Dynamic;
  readonly settle: Dynamic;
  readonly restoringPage: Dynamic;
  readonly openPage: Dynamic;
  readonly fullscreenActive: Dynamic;
  readonly fullscreenFile: Dynamic;
  readonly expandArtboard: Dynamic;
  readonly showArtboard: Dynamic;
  readonly keepRunning: Dynamic;
  readonly cameraMovement: Dynamic;
  readonly navigationOrigin: Dynamic;
  readonly manifest: Dynamic;
  readonly page: Dynamic;
  readonly phoneCanvas: Dynamic;
}

function buildFindCanvasAdapter(deps: FindCanvasDependencies) {
  return {
    manifest: (): Dynamic => deps.manifest.current,
    pageId: (): Dynamic => deps.page.current,
    windowFile: (): Dynamic => deps.fullscreenFile.current,
    showsTextMatchesOnCanvas: (): Dynamic => !deps.phoneCanvas,
    scrollsItself: (file?: Dynamic): Dynamic =>
      file === deps.fullscreenFile.current || file === deps.playingFile.current,
    frame: (file?: Dynamic): Dynamic => {
      let entry: Dynamic = deps.frames.current.get(file);
      return entry != null && entry.isReady() && !entry.isBlocked()
        ? entry.previewFrameRef.current
        : null;
    },
    canvasRoot: (): Dynamic => deps.canvasRoot.current,
    storedText: (file?: Dynamic): Dynamic =>
      designFileTextRuns(file, deps.doc.content().files[file]),
    keepRunning: deps.keepRunning,
    showPage: (
      pageId?: Dynamic,
      target?: Dynamic,
      revealContext?: Dynamic,
    ): Dynamic => (
      initializeDesignKeyboardBindings(),
      runFindRevealAfterSettle(
        deps.isTextEditing.current?.() === true,
        revealContext,
        deps.settle,
        (): Dynamic => {
          deps.openPage(pageId, target);
          deps.restoringPage.current = false;
          deps.navigationOrigin.showedPage(pageId, deps.camera.get());
        },
      )
    ),
    editorOn: (file?: Dynamic): Dynamic => {
      try {
        return (
          deps.frames.current
            .get(file)
            ?.previewFrameRef.current?.contentDocument?.body?.hasAttribute(
              "data-dc-editor-on",
            ) === true
        );
      } catch {
        return false;
      }
    },
    showInWindow: (
      pageId?: Dynamic,
      target?: Dynamic,
      revealContext?: Dynamic,
    ): Dynamic => {
      let canReveal: Dynamic = canRevealFindMatch(
        pageId !== deps.page.current,
        deps.fullscreenActive.current,
        target === deps.fullscreenFile.current,
      );
      canReveal && initializeDesignKeyboardBindings();
      return runFindRevealAfterSettle(
        canReveal && deps.isTextEditing.current?.() === true,
        revealContext,
        deps.settle,
        (): Dynamic => {
          let isOtherPage: Dynamic = pageId !== deps.page.current;
          if (
            !(
              isOtherPage &&
              (deps.openPage(pageId, target),
              (deps.restoringPage.current = false),
              deps.fullscreenActive.current)
            )
          ) {
            if (!deps.fullscreenActive.current) {
              let openPlan: Dynamic = deps.navigationOrigin.opensWindow(
                pageId,
                isOtherPage,
                deps.camera.get(),
                deps.cameraMovement.current,
              );
              deps.expandArtboard.current(
                target,
                openPlan === "page"
                  ? (recallCanvasView(pageId) ??
                      defaultCanvasCamera)
                  : openPlan === "fit"
                    ? defaultCanvasCamera
                    : undefined,
              );
              return;
            }
            deps.showArtboard.current(target);
          }
        },
      );
    },
    panTo: (targetRect?: Dynamic, isRestoring?: Dynamic): Dynamic =>
      deps.camera.glide((currentCamera?: Dynamic): Dynamic => {
        deps.navigationOrigin.pansFrom(currentCamera, deps.cameraMovement.current);
        let nextCamera: Dynamic = isArtboardInViewport(
            isRestoring === true
              ? {
                  ...currentCamera,
                  ...findRestoreCamera(
                    currentCamera,
                    deps.cameraMovement.current,
                  ),
                }
              : currentCamera,
            targetRect,
            deps.viewport(),
          ),
          commitCamera: Dynamic = (camera?: Dynamic): Dynamic => (
            (deps.cameraMovement.current =
              isRestoring === true
                ? null
                : {
                    from: currentCamera,
                    to: camera,
                  }),
            camera
          ),
          findBarRect: Dynamic = (document as Dynamic)
            .querySelector("[" + McFindAttribute + "]")
            ?.getBoundingClientRect(),
          canvasRect: Dynamic = deps.canvasRoot.current?.getBoundingClientRect();
        if (!findBarRect || !canvasRect) return commitCamera(nextCamera);
        let screenLeft: Dynamic =
            canvasRect.left + (targetRect.x - nextCamera.x) * nextCamera.scale,
          screenTop: Dynamic =
            canvasRect.top + (targetRect.y - nextCamera.y) * nextCamera.scale,
          isCoveredByFindBar: Dynamic =
            screenLeft < findBarRect.right &&
            screenLeft + targetRect.w * nextCamera.scale > findBarRect.left &&
            screenTop < findBarRect.bottom + 8 &&
            screenTop + targetRect.h * nextCamera.scale > findBarRect.top;
        return commitCamera(
          isCoveredByFindBar
            ? {
                ...nextCamera,
                y:
                  nextCamera.y -
                  (findBarRect.bottom + 8 - screenTop) / nextCamera.scale,
              }
            : nextCamera,
        );
      }),
    toCanvas: (screenRect?: Dynamic): Dynamic => {
      deps.camera.halt();
      let entry: Dynamic = deps.camera.get(),
        canvasBounds: Dynamic = deps.canvasRoot.current?.getBoundingClientRect();
      return {
        x: entry.x + (screenRect.x - (canvasBounds?.left ?? 0)) / entry.scale,
        y: entry.y + (screenRect.y - (canvasBounds?.top ?? 0)) / entry.scale,
        w: screenRect.w / entry.scale,
        h: screenRect.h / entry.scale,
      };
    },
  };
}

interface CanvasFindOptions {
  doc: Dynamic;
  camera: Dynamic;
  canvasRoot: Dynamic;
  viewport: Dynamic;
  frames: Dynamic;
  manifest: Dynamic;
  activePage: string;
  page: Dynamic;
  restoringPage: Dynamic;
  openPage: Dynamic;
  playingFile: Dynamic;
  inlinePlayback: string | null;
  fullscreenActive: Dynamic;
  fullscreenFile: Dynamic;
  fullscreenViewFile: string | null;
  expandArtboard: Dynamic;
  showArtboard: Dynamic;
  phoneCanvas: boolean;
  isTextEditing: Dynamic;
  settle: Dynamic;
  enabled: boolean;
  focusedFile: Dynamic;
  isSteppingEnabled: Dynamic;
  selection: Dynamic;
  phoneView: Dynamic;
  hostGesture: Dynamic;
  activeDrag: Dynamic;
  selectionGesture: Dynamic;
  stopOf: Dynamic;
  lifecycle: Dynamic;
  mountedExportFiles: Set<string>;
  canvasRevision: Dynamic;
  selectionRevision: Dynamic;
  modelRevision: Dynamic;
  handleFramePick: Dynamic;
}

export function useCanvasFind(options: CanvasFindOptions) {
  const {
    doc, camera, canvasRoot, viewport, frames, manifest, activePage, page, restoringPage,
    openPage, playingFile, inlinePlayback, fullscreenActive, fullscreenFile, fullscreenViewFile,
    expandArtboard, showArtboard, phoneCanvas, isTextEditing, settle, enabled, focusedFile,
    isSteppingEnabled, selection, phoneView, hostGesture, activeDrag, selectionGesture, stopOf,
    lifecycle, mountedExportFiles, canvasRevision, selectionRevision, modelRevision, handleFramePick,
  } = options;

  const [pinnedFile, keepRunning] = React.useState(null);
  const livePins = React.useMemo(() =>
    pinnedFile === null || mountedExportFiles.has(pinnedFile)
      ? mountedExportFiles
      : new Set([...mountedExportFiles, pinnedFile]),
  [mountedExportFiles, pinnedFile]);
  const cameraMovement = React.useRef(null);
  const [navigationOrigin] = React.useState(createFindNavigationOriginTracker);
  React.useEffect(() => navigationOrigin.pageIs(activePage), [navigationOrigin, activePage]);
  const host = React.useMemo(() => buildFindCanvasAdapter({
    doc, camera, canvasRoot, viewport, frames, manifest, page, restoringPage, openPage, playingFile,
    fullscreenActive, fullscreenFile, expandArtboard, showArtboard, phoneCanvas, isTextEditing,
    settle, keepRunning, cameraMovement, navigationOrigin,
  }), [camera, doc, phoneCanvas, viewport, openPage, handleFramePick, navigationOrigin, settle]);

  const ownsStepChord = React.useCallback((event: KeyboardEvent) => {
    const file = focusedFile.current;
    if (!isSteppingEnabled.current || file == null || !selection.current.elements.has(file) ||
        hasBlockingEditorOverlay() || phoneView.current === null || playingFile.current === file ||
        hostGesture.current || activeDrag.current != null) return false;

    const target = event.target as HTMLElement | null;
    if (!target || /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName ?? "") ||
        target.isContentEditable === true || isEditingInputTarget(target)) return false;
    try {
      const frameDocument = frames.current.get(file)?.previewFrameRef.current?.contentDocument;
      if (frameDocument?.querySelector(
        "[data-dc-editor-dragging],[data-dc-editor-drag-proxy],[data-dc-editor-marquee]",
      )) return false;
      if (target.ownerDocument === frameDocument &&
          frameDocument?.querySelector("svg[data-dc-editor-overlay]")) return false;
      return target.ownerDocument === document || target.ownerDocument === frameDocument;
    } catch {
      return false;
    }
  }, []);

  const subscribe = React.useCallback((changed: () => void) => doc.subscribe(changed), [doc]);
  const keyRouting = useArtboardKeyRouting({
    host, enabled,
    onEnter: () => settle(() => {}),
    settle,
    textEditOpen: () => isTextEditing.current?.() === true,
    ownsStepChord,
    pageOwnsKeys: (file: string) => playingFile.current === file || fullscreenFile.current === file,
    subscribe,
    textEditIn: () => isTextEditing.current?.() === true ? focusedFile.current : null,
    editBeganFromStop: () => selectionGesture.current?.editBeganFromStop() ?? null,
    walkInside: () => selectionGesture.current?.insideRef.current ?? null,
    stopOf,
  });
  lifecycle.current = {
    booted: keyRouting.frameBooted,
    seen: keyRouting.frameSeen,
    gone: keyRouting.frameGone,
  };
  const { changed } = keyRouting;
  React.useEffect(() => changed(), [
    changed, activePage, fullscreenViewFile, inlinePlayback, selectionRevision, modelRevision, canvasRevision,
  ]);
  return { findBar: keyRouting.find.bar, livePins };
}
