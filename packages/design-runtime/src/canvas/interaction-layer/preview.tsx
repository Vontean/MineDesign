import { chooseMountedPreviews } from "../preview-mounting";
import { distanceBetweenRects } from "../preview-mounting";
import { limitMountedPreviewPixels } from "../preview-mounting";
import { previewMountPriority } from "../preview-mounting";
import { previewScaleChanged } from "../preview-mounting";
import { recordVisiblePreviewTimes } from "../preview-mounting";
import { type Dynamic } from "../../runtime-types";

/** 视口或缩放变化时运行：按画板与视口的距离、可见时长、像素预算和手机端限制，挑选需要保持挂载实时预览的画板集合。 */
export function pickMountedArtboardPreviews(deps: { readonly getViewRect: Dynamic; readonly options: Dynamic; readonly phone: Dynamic; readonly activeGesturesRef: Dynamic; readonly manifestRef: Dynamic; readonly focusedFileRef: Dynamic; readonly livePinsRef: Dynamic; readonly inUseFilesRef: Dynamic; readonly recentPreviewsRef: Dynamic; readonly maxInteractivePreviewCount: Dynamic; readonly maxMountedPreviewCount: Dynamic; readonly canEditCanvasRef: Dynamic; readonly mountedFilesRef: Dynamic; readonly previewVisibleTimesRef: Dynamic; readonly cachedViewRectRef: Dynamic; readonly previewScaleRef: Dynamic; readonly previewPickStateRef: Dynamic; readonly hasFullscreenedRef: Dynamic; readonly cameraRef: Dynamic; readonly usesCameraPortal: Dynamic; readonly fullscreenFileRef: Dynamic; readonly playingFileRef: Dynamic; readonly selectionRef: Dynamic; readonly mountedPreviewsRef: Dynamic; readonly isWheelingRef: Dynamic; readonly canvasRootRef: Dynamic }, nowMs: Dynamic = performance.now()): Dynamic {
      let viewport: Dynamic = deps.getViewRect(),
        artboards: Dynamic = deps.manifestRef.current.artboards,
        isRelaxedMount: Dynamic = deps.fullscreenFileRef.current != null && deps.maxMountedPreviewCount > deps.maxInteractivePreviewCount;
      isRelaxedMount
        ? (deps.previewPickStateRef.current ??= Math.min(
            deps.maxMountedPreviewCount,
            Math.max(deps.maxInteractivePreviewCount, deps.mountedFilesRef.current.size + 1),
          ))
        : (deps.previewPickStateRef.current = null);
      if (deps.fullscreenFileRef.current == null && deps.hasFullscreenedRef.current) {
        deps.hasFullscreenedRef.current = false;
        for (let mountedFile of deps.mountedFilesRef.current as Dynamic)
          deps.previewVisibleTimesRef.current.set(mountedFile, nowMs);
      }
      let mountedFilesByPriority: Dynamic = isRelaxedMount
          ? artboards
              .filter(
                (board?: Dynamic): Dynamic =>
                  deps.mountedFilesRef.current.has(board.file),
              )
              .sort(
                (boardA?: Dynamic, boardB?: Dynamic): Dynamic =>
                  previewMountPriority(boardA, viewport) -
                  previewMountPriority(boardB, viewport),
              )
              .map((board?: Dynamic): Dynamic => board.file)
          : [],
        scale: Dynamic = deps.cameraRef.current.get().scale,
        isCameraIdle: Dynamic = !deps.isWheelingRef.current && deps.activeGesturesRef.current.size === 0,
        hasZoomChanged: Dynamic =
          !isRelaxedMount &&
          isCameraIdle &&
          previewScaleChanged(deps.previewScaleRef.current, scale);
      deps.canvasRootRef.current?.clientWidth &&
        !isRelaxedMount &&
        (recordVisiblePreviewTimes(
          deps.previewVisibleTimesRef.current,
          artboards,
          viewport,
          deps.cachedViewRectRef.current,
          nowMs,
        ),
        (deps.cachedViewRectRef.current = viewport),
        isCameraIdle && (deps.previewScaleRef.current = scale));
      let primaryFile: Dynamic = deps.recentPreviewsRef.current[0],
        primaryBoard: Dynamic =
          primaryFile != null
            ? artboards.find(
                (board?: Dynamic): Dynamic => board.file === primaryFile,
              )
            : undefined,
        isPrimaryInViewport: Dynamic =
          primaryBoard != null &&
          distanceBetweenRects(primaryBoard, viewport) === 0;
      return chooseMountedPreviews({
        artboards: artboards,
        viewport: viewport,
        cap: deps.maxInteractivePreviewCount,
        ceiling: isRelaxedMount ? deps.previewPickStateRef.current : deps.maxMountedPreviewCount,
        lastOnScreen: isRelaxedMount ? undefined : deps.previewVisibleTimesRef.current,
        now: nowMs,
        zoomed: hasZoomChanged,
        areaBudget: deps.usesCameraPortal
          ? deps.options.phoneCanvasRunsNothing === true
            ? 0
            : 15e5
          : undefined,
        required:
          deps.usesCameraPortal && deps.fullscreenFileRef.current == null
            ? limitMountedPreviewPixels(
                [...(deps.livePinsRef.current ?? [])],
                [
                  deps.canEditCanvasRef.current ? deps.focusedFileRef.current : null,
                  deps.playingFileRef.current,
                  ...(deps.inUseFilesRef.current ?? []),
                ],
                artboards,
                deps.options.phoneCanvasRunsNothing === true ? 0 : 15e5,
              )
            : [
                ...(deps.livePinsRef.current ?? []),
                deps.focusedFileRef.current,
                deps.fullscreenFileRef.current,
                deps.playingFileRef.current,
                isPrimaryInViewport && !(deps.phone && deps.fullscreenFileRef.current == null)
                  ? primaryFile
                  : null,
                ...(deps.inUseFilesRef.current ?? []),
                ...mountedFilesByPriority,
              ],
        recent:
          deps.usesCameraPortal && deps.fullscreenFileRef.current == null
            ? deps.recentPreviewsRef.current.slice(0, 1)
            : [
                ...deps.recentPreviewsRef.current,
                ...[
                  ...(deps.activeGesturesRef.current.has("marquee")
                    ? deps.mountedPreviewsRef.current
                    : deps.selectionRef.current.files),
                ].reverse(),
              ],
        current: deps.mountedFilesRef.current,
      });
    }
