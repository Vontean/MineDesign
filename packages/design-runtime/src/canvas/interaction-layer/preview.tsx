import { chooseMountedPreviews } from "../preview-mounting";
import { distanceBetweenRects } from "../preview-mounting";
import { limitMountedPreviewPixels } from "../preview-mounting";
import { previewMountPriority } from "../preview-mounting";
import { previewScaleChanged } from "../preview-mounting";
import { recordVisiblePreviewTimes } from "../preview-mounting";
import { type Dynamic } from "../../runtime-types";

/** 视口或缩放变化时运行：按画板与视口的距离、可见时长、像素预算和手机端限制，挑选需要保持挂载实时预览的画板集合。 */
export function pickMountedArtboardPreviews(deps: { readonly callback37: Dynamic; readonly options: Dynamic; readonly phone: Dynamic; readonly value130: Dynamic; readonly value146: Dynamic; readonly value182: Dynamic; readonly value184: Dynamic; readonly value185: Dynamic; readonly value186: Dynamic; readonly value187: Dynamic; readonly value188: Dynamic; readonly value19: Dynamic; readonly value194: Dynamic; readonly value195: Dynamic; readonly value196: Dynamic; readonly value197: Dynamic; readonly value199: Dynamic; readonly value200: Dynamic; readonly value34: Dynamic; readonly value35: Dynamic; readonly value55: Dynamic; readonly value56: Dynamic; readonly value57: Dynamic; readonly value58: Dynamic; readonly value62: Dynamic; readonly value9: Dynamic }, nowMs: Dynamic = performance.now()): Dynamic {
      let viewport: Dynamic = deps.callback37(),
        artboards: Dynamic = deps.value146.current.artboards,
        isRelaxedMount: Dynamic = deps.value55.current != null && deps.value188 > deps.value187;
      isRelaxedMount
        ? (deps.value199.current ??= Math.min(
            deps.value188,
            Math.max(deps.value187, deps.value194.current.size + 1),
          ))
        : (deps.value199.current = null);
      if (deps.value55.current == null && deps.value200.current) {
        deps.value200.current = false;
        for (let mountedFile of deps.value194.current as Dynamic)
          deps.value195.current.set(mountedFile, nowMs);
      }
      let mountedFilesByPriority: Dynamic = isRelaxedMount
          ? artboards
              .filter(
                (board?: Dynamic): Dynamic =>
                  deps.value194.current.has(board.file),
              )
              .sort(
                (boardA?: Dynamic, boardB?: Dynamic): Dynamic =>
                  previewMountPriority(boardA, viewport) -
                  previewMountPriority(boardB, viewport),
              )
              .map((board?: Dynamic): Dynamic => board.file)
          : [],
        scale: Dynamic = deps.value34.current.get().scale,
        isCameraIdle: Dynamic = !deps.value62.current && deps.value130.current.size === 0,
        hasZoomChanged: Dynamic =
          !isRelaxedMount &&
          isCameraIdle &&
          previewScaleChanged(deps.value197.current, scale);
      deps.value9.current?.clientWidth &&
        !isRelaxedMount &&
        (recordVisiblePreviewTimes(
          deps.value195.current,
          artboards,
          viewport,
          deps.value196.current,
          nowMs,
        ),
        (deps.value196.current = viewport),
        isCameraIdle && (deps.value197.current = scale));
      let primaryFile: Dynamic = deps.value186.current[0],
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
        cap: deps.value187,
        ceiling: isRelaxedMount ? deps.value199.current : deps.value188,
        lastOnScreen: isRelaxedMount ? undefined : deps.value195.current,
        now: nowMs,
        zoomed: hasZoomChanged,
        areaBudget: deps.value35
          ? deps.options.phoneCanvasRunsNothing === true
            ? 0
            : 15e5
          : undefined,
        required:
          deps.value35 && deps.value55.current == null
            ? limitMountedPreviewPixels(
                [...(deps.value184.current ?? [])],
                [
                  deps.value19.current ? deps.value182.current : null,
                  deps.value56.current,
                  ...(deps.value185.current ?? []),
                ],
                artboards,
                deps.options.phoneCanvasRunsNothing === true ? 0 : 15e5,
              )
            : [
                ...(deps.value184.current ?? []),
                deps.value182.current,
                deps.value55.current,
                deps.value56.current,
                isPrimaryInViewport && !(deps.phone && deps.value55.current == null)
                  ? primaryFile
                  : null,
                ...(deps.value185.current ?? []),
                ...mountedFilesByPriority,
              ],
        recent:
          deps.value35 && deps.value55.current == null
            ? deps.value186.current.slice(0, 1)
            : [
                ...deps.value186.current,
                ...[
                  ...(deps.value130.current.has("marquee")
                    ? deps.value58.current
                    : deps.value57.current.files),
                ].reverse(),
              ],
        current: deps.value194.current,
      });
    }
