import { chooseMountedPreviews } from "../preview-mounting";
import { distanceBetweenRects } from "../preview-mounting";
import { limitMountedPreviewPixels } from "../preview-mounting";
import { previewMountPriority } from "../preview-mounting";
import { previewScaleChanged } from "../preview-mounting";
import { recordVisiblePreviewTimes } from "../preview-mounting";
import { type Dynamic } from "../../runtime-types";

/** 视口或缩放变化时运行：按画板与视口的距离、可见时长、像素预算和手机端限制，挑选需要保持挂载实时预览的画板集合。 */
export function pickMountedArtboardPreviews(deps: { readonly callback37: Dynamic; readonly options: Dynamic; readonly phone: Dynamic; readonly value130: Dynamic; readonly value146: Dynamic; readonly value182: Dynamic; readonly value184: Dynamic; readonly value185: Dynamic; readonly value186: Dynamic; readonly value187: Dynamic; readonly value188: Dynamic; readonly value19: Dynamic; readonly value194: Dynamic; readonly value195: Dynamic; readonly value196: Dynamic; readonly value197: Dynamic; readonly value199: Dynamic; readonly value200: Dynamic; readonly value34: Dynamic; readonly value35: Dynamic; readonly value55: Dynamic; readonly value56: Dynamic; readonly value57: Dynamic; readonly value58: Dynamic; readonly value62: Dynamic; readonly value9: Dynamic }, input: Dynamic = performance.now()): Dynamic {
      let value250: Dynamic = deps.callback37(),
        artboards: Dynamic = deps.value146.current.artboards,
        value251: Dynamic = deps.value55.current != null && deps.value188 > deps.value187;
      value251
        ? (deps.value199.current ??= Math.min(
            deps.value188,
            Math.max(deps.value187, deps.value194.current.size + 1),
          ))
        : (deps.value199.current = null);
      if (deps.value55.current == null && deps.value200.current) {
        deps.value200.current = false;
        for (let value258 of deps.value194.current as Dynamic)
          deps.value195.current.set(value258, input);
      }
      let value252: Dynamic = value251
          ? artboards
              .filter(
                (input2?: Dynamic): Dynamic =>
                  deps.value194.current.has(input2.file),
              )
              .sort(
                (input2?: Dynamic, options2?: Dynamic): Dynamic =>
                  (0, previewMountPriority)(input2, value250) -
                  (0, previewMountPriority)(options2, value250),
              )
              .map((input2?: Dynamic): Dynamic => input2.file)
          : [],
        scale: Dynamic = deps.value34.current.get().scale,
        value253: Dynamic = !deps.value62.current && deps.value130.current.size === 0,
        value254: Dynamic =
          !value251 &&
          value253 &&
          (0, previewScaleChanged)(deps.value197.current, scale);
      deps.value9.current?.clientWidth &&
        !value251 &&
        ((0, recordVisiblePreviewTimes)(
          deps.value195.current,
          artboards,
          value250,
          deps.value196.current,
          input,
        ),
        (deps.value196.current = value250),
        value253 && (deps.value197.current = scale));
      let value255: Dynamic = deps.value186.current[0],
        value256: Dynamic =
          value255 != null
            ? artboards.find(
                (input2?: Dynamic): Dynamic => input2.file === value255,
              )
            : undefined,
        value257: Dynamic =
          value256 != null &&
          (0, distanceBetweenRects)(value256, value250) === 0;
      return (0, chooseMountedPreviews)({
        artboards: artboards,
        viewport: value250,
        cap: deps.value187,
        ceiling: value251 ? deps.value199.current : deps.value188,
        lastOnScreen: value251 ? undefined : deps.value195.current,
        now: input,
        zoomed: value254,
        areaBudget: deps.value35
          ? deps.options.phoneCanvasRunsNothing === true
            ? 0
            : 15e5
          : undefined,
        required:
          deps.value35 && deps.value55.current == null
            ? (0, limitMountedPreviewPixels)(
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
                value257 && !(deps.phone && deps.value55.current == null)
                  ? value255
                  : null,
                ...(deps.value185.current ?? []),
                ...value252,
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
