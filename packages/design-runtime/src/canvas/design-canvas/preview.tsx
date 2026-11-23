import { parallelCanvasCaptureSemaphore, singleCanvasCaptureSemaphore } from "./shared";
import { isInteractivePreviewTarget } from "../preview-navigation";
import { recallCanvasView } from "../viewport-memory";
import { isEditingInputTarget } from "../../editor/keyboard/find";
import { hasBlockingEditorOverlay } from "../../editor/text/typing-target";
import { designPageId, isPreviewMessage } from "../../platform/file-content";
import { stripPreviewProjectRoot } from "../../preview/project-root";
import type { Dynamic } from "../../runtime-types";
import { artboardIsNotExpandedFill, defaultCanvasCamera } from "./playback";

export function subscribePlayModeKeys({
  artboardEntriesRef,
  commenting,
  fullscreenView,
  restoreCamera,
  navigateAdjacentArtboard,
  pendingFrameFocus,
  visiblePageRef,
}: Dynamic) {
  if (fullscreenView == null) return;

  function onKeyDown(event: KeyboardEvent) {
    if (event.defaultPrevented) return;
    if (event.key === "Escape") {
      if (hasBlockingEditorOverlay() || commenting) return;
      event.preventDefault();
      restoreCamera();
      return;
    }
    const direction = event.key === "ArrowRight" || event.key === "PageDown"
      ? 1
      : event.key === "ArrowLeft" || event.key === "PageUp" ? -1 : 0;
    if (!direction || event.repeat || event.metaKey || event.ctrlKey || event.altKey ||
        event.shiftKey || hasBlockingEditorOverlay() || isEditingInputTarget(event.target) ||
        isInteractivePreviewTarget(event.target)) return;
    event.preventDefault();
    navigateAdjacentArtboard(direction);
  }

  function onMessage(event: MessageEvent) {
    const data = event.data;
    if (!data || typeof data !== "object") return;
    if (data.__om_escape === 1) {
      const fromArtboard = [...artboardEntriesRef.current.values()].some(
        (entry: Dynamic) => event.source !== null && entry.previewFrameRef.current?.contentWindow === event.source,
      );
      if (fromArtboard) restoreCamera();
      return;
    }

    const direction = data.__om_step;
    if ((direction !== 1 && direction !== -1) ||
        navigator.userActivation?.isActive !== true || hasBlockingEditorOverlay()) return;
    const focusedEntry = [...artboardEntriesRef.current.entries()].find(
      ([, entry]: Dynamic) => entry.previewFrameRef.current === document.activeElement &&
        isPreviewMessage(event, entry.previewFrameRef.current),
    );
    if (!focusedEntry) return;
    const board = visiblePageRef.current.artboards.find((item: Dynamic) => item.file === focusedEntry[0]);
    if (board?.is_interactive === true) return;
    if (parallelCanvasCaptureSemaphore.take() && navigateAdjacentArtboard(direction)) {
      pendingFrameFocus.current = direction;
    }
  }

  window.addEventListener("keydown", onKeyDown);
  window.addEventListener("message", onMessage);
  return () => {
    window.removeEventListener("keydown", onKeyDown);
    window.removeEventListener("message", onMessage);
  };
}

export function subscribePreviewOpenMessages({
  cameraController,
  artboardEntriesRef,
  editingRef,
  readOnlyRef,
  playingFileRef,
  pageNavigationGuardRef,
  restoredPageRef,
  resolvePageArtboard,
  fullscreenActiveRef,
  fullscreenFileRef,
  setFullscreenView,
  openArtboardRef,
  openInlinePlayback,
  pendingFrameFocus,
  documentStateRef,
  activePageIdRef,
}: Dynamic) {
  function onMessage(event: MessageEvent) {
    const data = event.data;
    if (!data || typeof data !== "object" ||
        typeof data.__om_open !== "string" || data.__om_open.length > 1024) return;

    const linkedFile = stripPreviewProjectRoot(data.__om_open, event.source);
    if (navigator.userActivation?.isActive !== true || pageNavigationGuardRef.current) return;
    const sourceEntry = [...artboardEntriesRef.current.entries()].find(
      ([, entry]: Dynamic) => isPreviewMessage(event, entry.previewFrameRef.current),
    );
    if (!sourceEntry || sourceEntry[0] === linkedFile) return;
    const playingInline = !fullscreenActiveRef.current && sourceEntry[0] === playingFileRef.current;
    if ((editingRef.current || readOnlyRef.current) && !fullscreenActiveRef.current && !playingInline) return;

    const { artboards, pages } = documentStateRef.current;
    const target = artboards.find((item: Dynamic) => item.file === linkedFile);
    if (!target || target.file === fullscreenFileRef.current || !singleCanvasCaptureSemaphore.take()) return;
    const targetPageId = designPageId(target, pages);
    const changesPage = targetPageId !== activePageIdRef.current;
    if (playingInline) {
      if (target.frameless) return;
      openInlinePlayback(target.file, changesPage ? targetPageId : undefined);
      if (!changesPage) openArtboardRef.current(target.file);
      return;
    }

    if (changesPage) {
      resolvePageArtboard(targetPageId);
      restoredPageRef.current = false;
    }
    if (sourceEntry[1].previewFrameRef.current === document.activeElement) pendingFrameFocus.current = 1;
    setFullscreenView((previous: Dynamic) => ({
      file: target.file,
      prev: previous?.prev ?? (changesPage
        ? recallCanvasView(targetPageId) ?? defaultCanvasCamera
        : cameraController.get()),
      fit: artboardIsNotExpandedFill(target),
    }));
  }

  window.addEventListener("message", onMessage);
  return () => window.removeEventListener("message", onMessage);
}
