import { type Dynamic } from "../../runtime-types";
import { useLatestCallback } from "../../editor/hooks/latest-callback";
import { toolbarOverlayHeight } from "../../editor/toolbar/layout";
import { vectorToolStateReact as React } from "../../editor/vector/tool-state";
import { artboardBootScheduler } from "../boot-scheduler";
import { canvasDragActivationDelayMs, canvasLongPressDelayMs, canvasTouchDragActivationDelayMs } from "../interaction-geometry";
import { nextPreviewExpiry, previewMountPriority, samePreviewFiles } from "../preview-mounting";
import { pickMountedArtboardPreviews } from "./preview";

type Ref<T> = { current: T };
type PreviewMountOptions = {
  view: { camera: Dynamic; canvasRootRef: Ref<HTMLElement | null>; cameraRef: Ref<Dynamic>; usesCameraPortal: boolean; isPhoneCanvas: boolean; phone: boolean; options: Dynamic };
  selection: { selectedArtboards: Set<string>; selectionRef: Ref<Dynamic>; mountedPreviewsRef: Ref<Dynamic>; isMarqueeActive: boolean; marqueeStateRef: Ref<Dynamic> };
  files: { manifest: Dynamic; manifestRef: Ref<Dynamic>; focusedFile: Dynamic; focusedFileRef: Ref<Dynamic>; fullscreenFile: Dynamic; fullscreenFileRef: Ref<Dynamic>; playingFile: Dynamic; playingFileRef: Ref<Dynamic>; livePins: Dynamic; livePinsRef: Ref<Dynamic>; inUseFiles: Dynamic; inUseFilesRef: Ref<Dynamic>; recentPreviewsRef: Ref<Dynamic> };
  interaction: { canEditCanvas: boolean; canEditCanvasRef: Ref<boolean>; activeGesturesRef: Ref<Set<string>>; isWheelingRef: Ref<boolean>; wheelStartRef: Ref<Dynamic>; gestureStartRef: Ref<Dynamic> };
  limits: { maxInteractivePreviewCount: number; maxMountedPreviewCount: number };
};

/** 维护画板预览的优先级、挂载集合与刷新订阅。 */
export function usePreviewMountLifecycle({ view, selection, files, interaction, limits }: PreviewMountOptions) {
  const { camera, canvasRootRef, cameraRef, usesCameraPortal, isPhoneCanvas, phone, options: props } = view;
  const { selectedArtboards, selectionRef, mountedPreviewsRef, isMarqueeActive, marqueeStateRef } = selection;
  const { manifest, manifestRef, focusedFile, focusedFileRef, fullscreenFile, fullscreenFileRef, playingFile, playingFileRef, livePins, livePinsRef, inUseFiles, inUseFilesRef, recentPreviewsRef } = files;
  const { canEditCanvas, canEditCanvasRef, activeGesturesRef, isWheelingRef, wheelStartRef, gestureStartRef } = interaction;
  const { maxInteractivePreviewCount, maxMountedPreviewCount } = limits;
  let touchRecentPreview: Dynamic = (file?: Dynamic): Dynamic => {
      let others: Dynamic = recentPreviewsRef.current.filter(
        (item?: Dynamic): Dynamic => item !== file,
      );
      others.unshift(file);
      recentPreviewsRef.current = others.slice(0, maxMountedPreviewCount);
    },
    mountedFilesRef: Dynamic = (0, React.useRef)(new Set()),
    previewVisibleTimesRef: Dynamic = (0, React.useRef)(new Map()),
    cachedViewRectRef: Dynamic = (0, React.useRef)(undefined),
    previewScaleRef: Dynamic = (0, React.useRef)(undefined),
    expiryTimerRef: Dynamic = (0, React.useRef)(null),
    getViewRect: Dynamic = (): Dynamic => {
      let cameraState: Dynamic = cameraRef.current.get(),
        current: Dynamic = canvasRootRef.current,
        viewWidth: Dynamic = current?.clientWidth || 1200,
        viewHeight: Dynamic = current?.clientHeight || 800,
        toolbarHeight: Dynamic = current
          ? toolbarOverlayHeight(current)
          : 0;
      return {
        x: cameraState.x,
        y: cameraState.y + toolbarHeight / cameraState.scale,
        w: viewWidth / cameraState.scale,
        h: (viewHeight - toolbarHeight) / cameraState.scale,
      };
    };
  (0, React.useLayoutEffect)(
    (): Dynamic => (
      artboardBootScheduler.configure({
        busySince: (): Dynamic => {
          let current: Dynamic = wheelStartRef.current,
            gestureStart: Dynamic = gestureStartRef.current;
          return current == null
            ? gestureStart
            : gestureStart == null
              ? current
              : Math.min(current, gestureStart);
        },
        rank: (file?: Dynamic): Dynamic => {
          if (
            (phone && fullscreenFileRef.current == null
              ? canEditCanvasRef.current && file === focusedFileRef.current
              : file === focusedFileRef.current ||
                file === recentPreviewsRef.current[0]) ||
            file === fullscreenFileRef.current ||
            file === playingFileRef.current ||
            livePinsRef.current?.has(file)
          )
            return -1;
          let artboard: Dynamic = manifestRef.current.artboards.find(
            (item?: Dynamic): Dynamic => item.file === file,
          );
          return artboard
            ? previewMountPriority(artboard, getViewRect())
            : 1 / 0;
        },
      }),
      (): Dynamic => artboardBootScheduler.configure(null)
    ),
    [],
  );
  let previewPickStateRef: Dynamic = (0, React.useRef)(null),
    hasFullscreenedRef: Dynamic = (0, React.useRef)(false),
    pickMountedPreviews: Dynamic = (...args: Dynamic[]): Dynamic => (pickMountedArtboardPreviews as Dynamic)({ get getViewRect() { return getViewRect; }, get options() { return props; }, get phone() { return phone; }, get activeGesturesRef() { return activeGesturesRef; }, get manifestRef() { return manifestRef; }, get focusedFileRef() { return focusedFileRef; }, get livePinsRef() { return livePinsRef; }, get inUseFilesRef() { return inUseFilesRef; }, get recentPreviewsRef() { return recentPreviewsRef; }, get maxInteractivePreviewCount() { return maxInteractivePreviewCount; }, get maxMountedPreviewCount() { return maxMountedPreviewCount; }, get canEditCanvasRef() { return canEditCanvasRef; }, get mountedFilesRef() { return mountedFilesRef; }, get previewVisibleTimesRef() { return previewVisibleTimesRef; }, get cachedViewRectRef() { return cachedViewRectRef; }, get previewScaleRef() { return previewScaleRef; }, get previewPickStateRef() { return previewPickStateRef; }, get hasFullscreenedRef() { return hasFullscreenedRef; }, get cameraRef() { return cameraRef; }, get usesCameraPortal() { return usesCameraPortal; }, get fullscreenFileRef() { return fullscreenFileRef; }, get playingFileRef() { return playingFileRef; }, get selectionRef() { return selectionRef; }, get mountedPreviewsRef() { return mountedPreviewsRef; }, get isWheelingRef() { return isWheelingRef; }, get canvasRootRef() { return canvasRootRef; } }, ...args),
    isViewUnsettledRef: Dynamic = (0, React.useRef)(
      usesCameraPortal && props.viewSettled === false,
    ),
    [mountedFiles, setMountedFiles]: Dynamic = (0,
    React.useState)(
      (): Dynamic => (isViewUnsettledRef.current ? new Set() : pickMountedPreviews()),
    );
  mountedFilesRef.current = mountedFiles;
  let refreshMountedPreviews: Dynamic = (): Dynamic => {
      if (isViewUnsettledRef.current) return;
      let current: Dynamic = fullscreenFileRef.current;
      current != null && (hasFullscreenedRef.current = true);
      if (
        current != null &&
        mountedFilesRef.current.has(current) &&
        [...(livePinsRef.current ?? [])].every(
          (file?: Dynamic): Dynamic => mountedFilesRef.current.has(file),
        )
      )
        return;
      let now: Dynamic = performance.now(),
        nextMounted: Dynamic = pickMountedPreviews(now);
      samePreviewFiles(nextMounted, mountedFilesRef.current) ||
        setMountedFiles(nextMounted);
      expiryTimerRef.current != null && clearTimeout(expiryTimerRef.current);
      let expiryTime: Dynamic =
        maxMountedPreviewCount > maxInteractivePreviewCount && fullscreenFileRef.current == null
          ? nextPreviewExpiry(
              nextMounted,
              manifestRef.current.artboards,
              cachedViewRectRef.current ?? getViewRect(),
              previewVisibleTimesRef.current,
              now,
            )
          : null;
      expiryTimerRef.current =
        expiryTime == null
          ? null
          : setTimeout(scheduleRefresh, expiryTime - now + 50);
    },
    prevLivePinsRef: Dynamic = (0, React.useRef)(undefined),
    prevFocusedFileRef: Dynamic = (0, React.useRef)(undefined),
    prevPlayingFileRef: Dynamic = (0, React.useRef)(null),
    prevFullscreenFileRef: Dynamic = (0, React.useRef)(undefined);
  (0, React.useLayoutEffect)((): Dynamic => {
    prevFullscreenFileRef.current !== fullscreenFile &&
      (usesCameraPortal && fullscreenFile != null && touchRecentPreview(fullscreenFile),
      (prevFullscreenFileRef.current = fullscreenFile));
    prevFocusedFileRef.current !== focusedFile &&
      ((!usesCameraPortal || canEditCanvas) &&
        prevFocusedFileRef.current != null &&
        touchRecentPreview(prevFocusedFileRef.current),
      (!usesCameraPortal || canEditCanvas) && focusedFile != null && touchRecentPreview(focusedFile),
      (prevFocusedFileRef.current = focusedFile));
    prevPlayingFileRef.current !== playingFile &&
      (prevPlayingFileRef.current != null && touchRecentPreview(prevPlayingFileRef.current),
      playingFile != null && touchRecentPreview(playingFile),
      (prevPlayingFileRef.current = playingFile));
    let isMarqueeGesture: Dynamic = activeGesturesRef.current.has("marquee");
    if (!isMarqueeGesture) {
      for (let file of selectedArtboards as Dynamic)
        (!usesCameraPortal || canEditCanvas) &&
          !mountedPreviewsRef.current.has(file) &&
          touchRecentPreview(file);
      mountedPreviewsRef.current = selectedArtboards;
    }
    for (let file of (livePins ?? []) as Dynamic)
      prevLivePinsRef.current?.has(file) || touchRecentPreview(file);
    prevLivePinsRef.current = livePins;
    props.viewSettled !== false && (isViewUnsettledRef.current = false);
    isMarqueeGesture ? scheduleRefresh() : refreshMountedPreviews();
    for (let file of (isPhoneCanvas
      ? [canEditCanvas ? focusedFile : null, playingFile, ...(livePins ?? [])]
      : [
          focusedFile,
          fullscreenFile,
          playingFile,
          recentPreviewsRef.current[0],
          ...(livePins ?? []),
        ]) as Dynamic)
      artboardBootScheduler.expedite(file);
  }, [
    selectedArtboards,
    manifest.artboards,
    focusedFile,
    fullscreenFile,
    playingFile,
    livePins,
    inUseFiles,
    isMarqueeActive,
    usesCameraPortal ? props.viewSettled : undefined,
    usesCameraPortal ? canEditCanvas : undefined,
  ]);
  let hasArtboards: Dynamic = manifest.artboards.length > 0,
    flushUnsettledMount: Dynamic = useLatestCallback((): Dynamic => {
      isViewUnsettledRef.current && ((isViewUnsettledRef.current = false), refreshMountedPreviews());
    });
  (0, React.useEffect)((): Dynamic => {
    if (!isViewUnsettledRef.current || !hasArtboards) return;
    let flushTimer: Dynamic = setTimeout(flushUnsettledMount, 1e3);
    return (): Dynamic => clearTimeout(flushTimer);
  }, [hasArtboards, flushUnsettledMount]);
  let refreshTimerRef: Dynamic = (0, React.useRef)(null),
    refreshStartRef: Dynamic = (0, React.useRef)(null),
    busyStartRef: Dynamic = (0, React.useRef)(null),
    runScheduledRefresh: Dynamic = (): Dynamic => {
      refreshTimerRef.current = null;
      if (
        (isWheelingRef.current || activeGesturesRef.current.size > 0) &&
        ((busyStartRef.current ??= Date.now()),
        Date.now() - busyStartRef.current < canvasLongPressDelayMs)
      ) {
        refreshStartRef.current = null;
        refreshTimerRef.current = setTimeout(runScheduledRefresh, 120);
        return;
      }
      busyStartRef.current = null;
      refreshStartRef.current = null;
      refreshMountedPreviews();
    },
    scheduleRefresh: Dynamic = (): Dynamic => {
      let now: Dynamic = Date.now();
      refreshTimerRef.current != null && clearTimeout(refreshTimerRef.current);
      refreshStartRef.current ??= now;
      let waited: Dynamic = now - refreshStartRef.current;
      refreshTimerRef.current = setTimeout(
        runScheduledRefresh,
        Math.max(
          0,
          Math.min(
            canvasDragActivationDelayMs,
            canvasTouchDragActivationDelayMs - waited,
          ),
        ),
      );
    };
  (0, React.useEffect)(
    (): Dynamic => (
      scheduleRefresh(),
      camera.subscribe((): Dynamic => {
        scheduleRefresh();
        marqueeStateRef.current?.();
      })
    ),
    [camera],
  );
  (0, React.useEffect)((): Dynamic => {
    let current: Dynamic = canvasRootRef.current,
      resizeObserver: Dynamic =
        current && typeof ResizeObserver !== "undefined"
          ? new ResizeObserver((): Dynamic => scheduleRefresh())
          : null;
    current && resizeObserver?.observe(current);
    return (): Dynamic => {
      resizeObserver?.disconnect();
      refreshTimerRef.current != null && clearTimeout(refreshTimerRef.current);
      expiryTimerRef.current != null && clearTimeout(expiryTimerRef.current);
    };
  }, []);
  return { mountedFiles, refreshMountedPreviews, touchRecentPreview };
}
