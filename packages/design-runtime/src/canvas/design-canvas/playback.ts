import { shouldDelayPreviewMount } from "../preview-mounting";
import { adjacentPrintableArtboard, printableArtboardIndex, printableArtboards } from "../preview-navigation";
import { recallCanvasView, rememberCanvasView } from "../viewport-memory";
import {
  artboardPositionAnnouncement,
  ThisIsTheFirstArtboardMessage,
  ThisIsTheLastArtboardMessage,
  ThisIsTheOnlyArtboardMessage,
} from "../../editor/accessibility/announcements";
import { announce } from "../../editor/accessibility/announcer";
import { reactChromeTheme as React } from "../../editor/chrome/theme";
import { isEditingInputTarget } from "../../editor/keyboard/find";
import { clearSelectedBoards, filterSelectedArtboards, isEmptyCanvasSelection } from "../../editor/selection/canvas-selection";
import { hasBlockingEditorOverlay } from "../../editor/text/typing-target";
import type { Dynamic } from "../../runtime-types";

export const defaultCanvasCamera = { x: -60, y: -80, scale: 0.5 };

export function artboardIsNotExpandedFill(artboard?: Dynamic) {
  return artboard?.expand !== "fill";
}

export function artboardFullscreenCamera(
  artboard: Dynamic,
  fit: boolean,
  viewportWidth: number,
  viewportHeight: number,
  topInset = 0,
  padding = 0,
) {
  if (!fit) return { x: artboard.x, y: artboard.y - topInset, scale: 1 };

  const availableHeight = Math.max(1, viewportHeight - topInset - padding * 2);
  const scale = Math.max(
    0.01,
    Math.min(
      1,
      Math.max(1, viewportWidth - padding * 2) / artboard.w,
      availableHeight / artboard.h,
    ),
  );
  return {
    x: artboard.x - (viewportWidth / scale - artboard.w) / 2,
    y: artboard.y - (topInset + padding) / scale - (availableHeight / scale - artboard.h) / 2,
    scale,
  };
}

export function useInlinePlaybackState() {
  const { useRef, useState } = React;
  const [playingFile, setPlayingFile] = useState(null);
  const playingFileRef = useRef(null);
  playingFileRef.current = playingFile;
  return { playingFile, playingFileRef, setPlayingFile };
}

export function useInlinePlaybackControls({
  playingFile,
  setPlayingFile,
  selectedFile,
  setSelectedFile,
  documentStateRef,
  activePageIdRef,
  visiblePageRef,
  resolvePageArtboard,
  navigateAfterEdits,
  phoneCanvas,
  fullscreenActiveRef,
  setFullscreenView,
  restoredPageRef,
  editingRef,
  editableRef,
  controlsDisabled,
  cameraController,
  selectionEpochRef,
  focusedFileRef,
  clearFramePick,
  setSelection,
}: Dynamic) {
  const { useCallback, useLayoutEffect, useRef } = React;
  const openInlinePlayback = useCallback((file?: string | null, pageId?: string) => {
    if (file == null) {
      setPlayingFile(null);
      return;
    }
    const artboard = documentStateRef.current.artboards.find((item: Dynamic) => item.file === file);
    if (artboard?.frameless) return;
    navigateAfterEdits(() => {
      const phoneWithoutFullscreen = phoneCanvas && !fullscreenActiveRef.current;
      const changesPage = pageId !== undefined && pageId !== activePageIdRef.current;
      if (pageId !== undefined) resolvePageArtboard(pageId);
      if (phoneWithoutFullscreen && artboard && shouldDelayPreviewMount(artboard, {
        editing: editingRef.current,
        runsNothing: controlsDisabled,
      })) {
        if (changesPage) restoredPageRef.current = false;
        setPlayingFile(null);
        setFullscreenView({
          file,
          prev: changesPage && pageId !== undefined
            ? recallCanvasView(pageId) ?? defaultCanvasCamera
            : cameraController.get(),
          fit: artboardIsNotExpandedFill(artboard),
        });
        return;
      }
      selectionEpochRef.current++;
      if (focusedFileRef.current === file || phoneWithoutFullscreen) clearFramePick();
      if (phoneWithoutFullscreen) setSelectedFile(null);
      setSelection((previous: Dynamic) =>
        filterSelectedArtboards(previous, (selected: string) => selected !== file),
      );
      setPlayingFile(file);
    });
  }, [navigateAfterEdits, resolvePageArtboard, clearFramePick, phoneCanvas, controlsDisabled, cameraController]);

  const previousPlayingFile = useRef(null);
  useLayoutEffect(() => {
    const previousFile = previousPlayingFile.current;
    previousPlayingFile.current = playingFile;
    if (playingFile != null) {
      if (selectedFile === playingFile) setSelectedFile(null);
      return;
    }
    if (previousFile == null || focusedFileRef.current != null) return;
    const boards = visiblePageRef.current.artboards;
    if (boards.some((artboard: Dynamic) => artboard.file === previousFile)) {
      setSelectedFile(previousFile);
    } else if (phoneCanvas && editableRef.current && !fullscreenActiveRef.current) {
      setSelectedFile(null);
    } else {
      setSelectedFile(boards.find((artboard: Dynamic) => !artboard.frameless)?.file ?? null);
    }
  }, [playingFile, selectedFile, phoneCanvas]);

  return openInlinePlayback;
}

export function useFullscreenPlaybackState({
  initialFile,
  canvasDocument,
  activePageId,
  canvasScale,
  cameraController,
  toolbarInset,
  toolbarInsetReadyRef,
  resetCanvasViewRef,
  closeInlinePlayback,
  visiblePageRef,
  artboardEntriesRef,
}: Dynamic) {
  const { useCallback, useEffect, useRef, useState } = React;
  const fullscreenActiveRef = useRef(false);
  const fullscreenFileRef = useRef(null);
  const [fullscreenView, setFullscreenView] = useState(() => {
    if (initialFile == null) return null;
    const artboard = canvasDocument.artboards.find((item: Dynamic) => item.file === initialFile);
    return {
      file: initialFile,
      prev: recallCanvasView(activePageId) ?? defaultCanvasCamera,
      fit: artboardIsNotExpandedFill(artboard),
    };
  });

  const savedCanvasCameraRef = useRef(null);
  const fullscreenViewRef = useRef(null);
  const pendingInsetCamera = useRef(null);
  useEffect(() => {
    const pending = pendingInsetCamera.current;
    if (pending === null || (fullscreenView == null && toolbarInset === 0)) return;
    pendingInsetCamera.current = null;
    if (fullscreenView == null && cameraController.get() === pending) resetCanvasViewRef.current();
  }, [fullscreenView, toolbarInset, cameraController]);

  const restoreCamera = useCallback(() => {
    closeInlinePlayback(null);
    fullscreenActiveRef.current = false;
    fullscreenFileRef.current = null;
    fullscreenViewRef.current = null;
    toolbarInsetReadyRef.current = false;
    const saved = savedCanvasCameraRef.current;
    if (saved === defaultCanvasCamera && resetCanvasViewRef.current()) {
      pendingInsetCamera.current = cameraController.get();
    } else if (saved) {
      cameraController.set(saved, true);
    }
    setFullscreenView(null);
  }, [cameraController]);

  fullscreenActiveRef.current = fullscreenView != null;
  fullscreenFileRef.current = fullscreenView?.file ?? null;
  savedCanvasCameraRef.current = fullscreenView?.prev ?? null;
  fullscreenViewRef.current = fullscreenView;
  const isDockedCanvas = fullscreenView != null;
  toolbarInsetReadyRef.current = isDockedCanvas;

  const openArtboardRef = useRef(() => {});
  const navigateAdjacentArtboard = useCallback((direction: number) => {
    const current = fullscreenFileRef.current;
    const boards = visiblePageRef.current.artboards;
    if (current == null || !boards.some((item: Dynamic) => item.file === current)) return false;
    const adjacent = adjacentPrintableArtboard(boards, current, direction);
    if (!adjacent) {
      announce(printableArtboards(boards).length <= 1
        ? ThisIsTheOnlyArtboardMessage
        : direction > 0 ? ThisIsTheLastArtboardMessage : ThisIsTheFirstArtboardMessage);
      return false;
    }
    openArtboardRef.current(adjacent.artboard.file);
    return true;
  }, []);
  const landingFileRef = useRef(fullscreenView?.file ?? null);
  useEffect(() => {
    const file = fullscreenView?.file ?? null;
    if (file === landingFileRef.current) return;
    landingFileRef.current = file;
    if (file === null) return;
    const boards = visiblePageRef.current.artboards;
    const board = boards.find((item: Dynamic) => item.file === file);
    const position = printableArtboardIndex(boards, file);
    if (board && position) announce(artboardPositionAnnouncement(
      position.index, position.count, board.title ?? board.file.replace(/\.dc\.html$/, ""),
    ));
  }, [fullscreenView?.file]);

  const pendingFrameFocus = useRef(0);
  useEffect(() => {
    const shouldFocus = pendingFrameFocus.current !== 0;
    pendingFrameFocus.current = 0;
    if (!shouldFocus || fullscreenView == null) return;
    const frame = artboardEntriesRef.current.get(fullscreenView.file)?.previewFrameRef.current;
    if (frame) frame.focus({ preventScroll: true });
    else if (document.activeElement instanceof HTMLIFrameElement) document.activeElement.blur();
  }, [fullscreenView]);

  useEffect(() => {
    const view = fullscreenView?.prev ?? canvasScale;
    if (view === defaultCanvasCamera) return;
    const timer = window.setTimeout(() => rememberCanvasView(activePageId, view), 150);
    return () => window.clearTimeout(timer);
  }, [activePageId, canvasScale, fullscreenView]);

  return {
    fullscreenActiveRef,
    fullscreenFileRef,
    fullscreenView,
    fullscreenViewRef,
    isDockedCanvas,
    landingFileRef,
    navigateAdjacentArtboard,
    openArtboardRef,
    pendingFrameFocus,
    restoreCamera,
    setFullscreenView,
  };
}

export function useInlinePlaybackEscape({
  playingFile,
  pageArtboards,
  fullscreenView,
  commenting,
  setPlayingFile,
  artboardEntriesRef,
  editingRef,
  selectionRef,
  toolRef,
}: Dynamic) {
  const { useEffect } = React;
  useEffect(() => {
    if (playingFile == null) return;
    if (!pageArtboards.some((item: Dynamic) => item.file === playingFile)) {
      setPlayingFile(null);
      return;
    }
    if (fullscreenView != null) return;

    function onKeyDown(event: KeyboardEvent) {
      if (event.key !== "Escape" || event.repeat || event.defaultPrevented ||
          hasBlockingEditorOverlay() || commenting ||
          (editingRef.current && !isEmptyCanvasSelection(selectionRef.current)) ||
          toolRef.current !== "select" || isEditingInputTarget(event.target)) return;
      event.preventDefault();
      setPlayingFile(null);
    }
    function onFrameMessage(event: MessageEvent) {
      if (event.data && typeof event.data === "object" && event.data.__om_escape === 1 &&
          event.source !== null &&
          artboardEntriesRef.current.get(playingFile)?.previewFrameRef.current?.contentWindow === event.source) {
        setPlayingFile(null);
      }
    }
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("message", onFrameMessage);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("message", onFrameMessage);
    };
  }, [playingFile, pageArtboards, fullscreenView, commenting]);
}

export function useFullscreenViewport({
  fullscreenView,
  canvasDocument,
  restoreCamera,
  phoneCanvas,
  setSelection,
  toolbarInset,
  cameraController,
  canvasViewport,
  canvasContainerRef,
  dockedPadding,
}: Dynamic) {
  const { useCallback, useEffect, useLayoutEffect, useState } = React;
  const [fullscreenBox, setFullscreenBox] = useState(null);
  const updateViewport = useCallback((artboard: Dynamic, fit: boolean, padding: number) => {
    const { w, h, top } = canvasViewport();
    const availableHeight = h - top;
    if (!w || availableHeight <= 0) return;
    cameraController.set(artboardFullscreenCamera(artboard, fit, w, h, top, padding), true);
    setFullscreenBox((previous: Dynamic) =>
      fit ? null : previous?.w === w && previous?.h === availableHeight
        ? previous : { w, h: availableHeight },
    );
  }, [cameraController, canvasViewport]);

  useEffect(() => {
    if (fullscreenView != null) setSelection(clearSelectedBoards);
  }, [fullscreenView]);

  useEffect(() => {
    if (!fullscreenView) return;
    const board = canvasDocument.artboards.find((item: Dynamic) => item.file === fullscreenView.file);
    if (!board) restoreCamera();
  }, [canvasDocument, fullscreenView, restoreCamera]);

  useLayoutEffect(() => {
    if (!fullscreenView) return;
    const board = canvasDocument.artboards.find((item: Dynamic) => item.file === fullscreenView.file);
    if (!board) return;
    const padding = phoneCanvas ? 0 : dockedPadding;
    const update = () => updateViewport(board, fullscreenView.fit, padding);
    update();
    const container = canvasContainerRef.current;
    if (!container || typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(update);
    observer.observe(container);
    return () => observer.disconnect();
  }, [fullscreenView, canvasDocument, toolbarInset, phoneCanvas]);

  return fullscreenBox;
}
