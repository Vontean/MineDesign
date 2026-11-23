import { panViewport } from "../pan-zoom";
import { viewportScaleLimits } from "../viewport-memory";
import { zoomViewportAtPoint } from "../pan-zoom";
import { reactChromeTheme as React } from "../../editor/chrome/theme";
import { NotesLinkEditingKind, NotesLinkEditingLh } from "../../editor/notes/link-editing";
import { useToolbarOverlaySize } from "../../editor/toolbar/layout";
import { annotationBounds, isShapeAnnotation, rotatedAnnotationBounds } from "../../platform/file-content";
import { creationFocusedCamera, fitArtboardHeaderHeight, fitBoundsCamera } from "../creation-progress";
import type { FramePanZoom } from "../frame-gesture-events";
import type { Box, CanvasAnnotation, CanvasManifest } from "../manifest-history";
import { recallCanvasView } from "../viewport-memory";
import { createViewportStore } from "../viewport-store";
import { artboardFullscreenCamera, artboardIsNotExpandedFill, defaultCanvasCamera } from "./playback";

type Camera = typeof defaultCanvasCamera;
type CanvasScreen = { w: number; h: number; top: number };
type Ref<T> = { current: T };

/** 画布镜头的初始位置、输入中断和工具栏可用区域。 */
export function useCanvasViewport(manifest: CanvasManifest, pageId: string, focusedFile: string | null) {
  const { useState, useRef, useEffect, useCallback, startTransition } = React;
  const viewRestoredRef: Ref<boolean> = useRef(false);
  const [camera, setCamera]: [Camera, (next: Camera) => void] = useState(() => {
    const focused = focusedFile == null ? undefined : manifest.artboards.find(({ file }) => file === focusedFile);
    if (focused) return artboardFullscreenCamera(focused, artboardIsNotExpandedFill(focused), 1200, 800);
    const remembered = recallCanvasView(pageId);
    if (!remembered) return defaultCanvasCamera;
    viewRestoredRef.current = true;
    return remembered;
  });
  const [controller] = useState(() => createViewportStore(camera, (next: Camera, commitNow: boolean) => {
    if (commitNow) setCamera(next);
    else startTransition(() => setCamera(next));
  }));
  const container: Ref<HTMLElement | null> = useRef(null);
  useEffect(() => {
    function interruptPointer(event: PointerEvent) {
      if (container.current?.contains(event.target as Node | null)) controller.halt();
      else controller.settle();
    }
    const settleCamera = () => controller.settle();
    window.addEventListener("pointerdown", interruptPointer, true);
    window.addEventListener("keydown", settleCamera, true);
    return () => {
      window.removeEventListener("pointerdown", interruptPointer, true);
      window.removeEventListener("keydown", settleCamera, true);
    };
  }, [controller]);

  const [toolbarInset, observeToolbarInset]: [number, (root: HTMLElement | null) => void] = useToolbarOverlaySize();
  const toolbarInsetRef: Ref<number> = useRef(toolbarInset);
  const toolbarInsetReadyRef: Ref<boolean> = useRef(false);
  const lastPositiveInset: Ref<number> = useRef(0);
  toolbarInsetRef.current = toolbarInset;
  if (toolbarInset > 0) lastPositiveInset.current = toolbarInset;

  const setContainer = useCallback((root: HTMLElement | null) => {
    container.current = root;
    observeToolbarInset(root);
  }, [observeToolbarInset]);
  const measure = useCallback((): CanvasScreen => ({
    w: container.current?.clientWidth ?? 1200,
    h: container.current?.clientHeight ?? 800,
    top: toolbarInsetReadyRef.current ? 0 : toolbarInsetRef.current || lastPositiveInset.current,
  }), []);

  return { camera, controller, container, setContainer, measure, viewRestoredRef, toolbarInset, toolbarInsetReadyRef };
}

interface ViewportControlsOptions {
  manifest: CanvasManifest;
  page: { artboards: Box[]; annotations?: CanvasAnnotation[] };
  creationBoxes: Box[];
  creating: boolean;
  animateWhenContentArrives: boolean;
  measure(): CanvasScreen;
  controller: {
    set(camera: Camera | ((previous: Camera) => Camera), exact?: boolean): void;
    glide(camera: Camera): void;
  };
  viewRestored: Ref<boolean>;
  placeActive: Ref<boolean>;
  fullscreenActive: Ref<boolean>;
  exportInset: Ref<number>;
  fitPage: Ref<() => boolean>;
  settleView(): void;
}

/** 计算适应页面和居中缩放，协调首屏内容到达时的镜头。 */
export function useCanvasViewportControls({
  manifest, page, creationBoxes, creating, animateWhenContentArrives, measure, controller,
  viewRestored, placeActive, fullscreenActive, exportInset, fitPage, settleView,
}: ViewportControlsOptions) {
  const { useCallback, useEffect, useLayoutEffect, useRef, useState } = React;
  const zoomTo = useCallback((scale: number) => {
    controller.set((previous) => {
      const screen = measure();
      return zoomViewportAtPoint(previous, screen.w / 2, screen.top + (screen.h - screen.top) / 2,
        scale / previous.scale, viewportScaleLimits);
    }, true);
  }, [controller, measure]);

  const fittedCamera = useCallback((): Camera | undefined => {
    const boards = creationBoxes.length === 0 ? page.artboards : [...page.artboards, ...creationBoxes];
    const annotations = page.annotations ?? [];
    if (!boards.length && !annotations.length) return;
    const notes: Box[] = annotations.map((annotation) => rotatedAnnotationBounds(
      annotation,
      isShapeAnnotation(annotation) ? annotationBounds(annotation) : {
        x: annotation.x, y: annotation.y, w: NotesLinkEditingKind(annotation), h: NotesLinkEditingLh(annotation),
      },
    ));
    const screen = measure();
    return fitBoundsCamera({
      minX: Math.min(...boards.map(({ x }) => x), ...notes.map(({ x }) => x)),
      minY: Math.min(...boards.map(({ y }) => y - fitArtboardHeaderHeight), ...notes.map(({ y }) => y)),
      maxX: Math.max(...boards.map(({ x, w }) => x + w), ...notes.map(({ x, w }) => x + w)),
      maxY: Math.max(...boards.map(({ y, h }) => y + h), ...notes.map(({ y, h }) => y + h)),
    }, { ...screen, top: Math.max(screen.top, exportInset.current) });
  }, [page, creationBoxes, measure]);
  const fit = useCallback(() => {
    const camera = fittedCamera();
    if (camera !== undefined) controller.set(camera, true);
    return camera !== undefined;
  }, [controller, fittedCamera]);
  fitPage.current = fit;

  const hasCreationContent = creationBoxes.length > 0 || (creating && page.artboards.length > 0);
  const [beganWithCreationContent] = useState(hasCreationContent);
  const animateOnArrival: Ref<boolean> = useRef(false);
  useLayoutEffect(() => {
    if (beganWithCreationContent || placeActive.current || !hasCreationContent ||
      fullscreenActive.current || viewRestored.current) return;
    placeActive.current = true;
    const destination = fittedCamera();
    const start = animateOnArrival.current && destination !== undefined && document.visibilityState === "visible"
      ? creationFocusedCamera([...page.artboards, ...creationBoxes], destination, measure())
      : undefined;
    if (destination !== undefined && start !== undefined) {
      controller.set(start);
      controller.glide(destination);
    } else {
      fitPage.current();
    }
    settleView();
  }, [hasCreationContent]);

  useEffect(() => {
    if (placeActive.current) settleView();
    if (placeActive.current || (page.artboards.length === 0 && creationBoxes.length === 0)) return;
    if (fullscreenActive.current || viewRestored.current) {
      placeActive.current = true;
      settleView();
      return;
    }
    const timer = window.setTimeout(() => {
      if (!placeActive.current) {
        placeActive.current = true;
        if (!fullscreenActive.current) fit();
      }
      settleView();
    }, 50);
    return () => window.clearTimeout(timer);
  }, [manifest, fit]);

  useEffect(() => {
    animateOnArrival.current = animateWhenContentArrives;
  });

  return { zoomTo, fit };
}

const panDistanceBudget = 60_000;
const zoomLogBudget = 12;
const minimumZoomCharge = 0.02;

interface FrameViewportGestureOptions {
  manifest: { artboards: (Box & { file: string })[] };
  controller: ViewportControlsOptions["controller"] & { get(): Camera };
  container: Ref<HTMLElement | null>;
  editing: Ref<boolean>;
  focusedFile: Ref<string | null>;
  readonly playingFile: Ref<string | null>;
  readonly fullscreen: Ref<boolean>;
}

/** 将画板发来的平移、捏合消息合并到下一帧，并限制连续输入的幅度。 */
export function useFrameViewportGestures(options: FrameViewportGestureOptions) {
  const { useRef, useCallback, useEffect } = React;
  const pending = useRef({
    dx: 0, dy: 0, dz: 0, anchorX: 0, anchorY: 0, pinch: false, zoomMessages: 0,
    frameId: 0, windowStart: 0, panSpent: 0, zoomSpent: 0,
  }) as Ref<{
    dx: number; dy: number; dz: number;
    anchorX: number; anchorY: number; pinch: boolean; zoomMessages: number;
    frameId: number; windowStart: number; panSpent: number; zoomSpent: number;
  }>;
  useEffect(() => () => {
    if (pending.current.frameId) cancelAnimationFrame(pending.current.frameId);
  }, []);

  const { manifest, controller, container, editing, focusedFile } = options;
  return useCallback((file: string, gesture: FramePanZoom) => {
    if (options.fullscreen.current) return false;
    const allowed = !editing.current || file === focusedFile.current || file === options.playingFile.current;
    const artboard = manifest.artboards.find((candidate) => candidate.file === file);
    if (!allowed || !artboard) return false;

    const input = pending.current;
    input.dx += gesture.dx;
    input.dy += gesture.dy;
    if (gesture.pinch) {
      input.pinch = true;
      input.dz += gesture.dz;
      if (gesture.dz !== 0) input.zoomMessages++;
      input.anchorX = artboard.x + Math.max(0, Math.min(artboard.w, gesture.x));
      input.anchorY = artboard.y + Math.max(0, Math.min(artboard.h, gesture.y));
    }
    if (input.frameId) return true;

    input.frameId = requestAnimationFrame(() => {
      input.frameId = 0;
      const now = performance.now();
      if (now - input.windowStart > 1000) {
        input.windowStart = now;
        input.panSpent = 0;
        input.zoomSpent = 0;
      }
      const panDistance = Math.abs(input.dx) + Math.abs(input.dy);
      const remainingPan = Math.max(0, panDistanceBudget - input.panSpent);
      const panFactor = panDistance > 0 ? Math.min(1, remainingPan / panDistance) : 0;
      const dx = input.dx * panFactor;
      const dy = input.dy * panFactor;
      input.panSpent += Math.abs(dx) + Math.abs(dy);

      const scale = controller.get().scale;
      const { minScale, maxScale } = viewportScaleLimits;
      const targetScale = Math.max(minScale, Math.min(maxScale, scale * Math.exp(input.dz)));
      const desiredZoom = input.pinch ? Math.log(targetScale / scale) : 0;
      const remainingZoom = Math.max(0, zoomLogBudget - input.zoomSpent);
      const appliedZoom = Math.max(-remainingZoom, Math.min(remainingZoom, desiredZoom));
      input.zoomSpent += Math.max(Math.abs(appliedZoom), input.zoomMessages * minimumZoomCharge);

      const { pinch, anchorX, anchorY } = input;
      const width = container.current?.clientWidth ?? 0;
      const height = container.current?.clientHeight ?? 0;
      input.dx = input.dy = input.dz = input.zoomMessages = 0;
      input.pinch = false;
      controller.set((previous) => {
        let next = previous;
        if (pinch && appliedZoom !== 0) {
          const x = Math.max(0, Math.min(width, (anchorX - next.x) * next.scale));
          const y = Math.max(0, Math.min(height, (anchorY - next.y) * next.scale));
          next = zoomViewportAtPoint(next, x, y, Math.exp(appliedZoom), viewportScaleLimits);
        }
        return dx !== 0 || dy !== 0 ? panViewport(next, -dx, -dy) : next;
      });
    });
    return true;
  }, [manifest, controller]);
}
