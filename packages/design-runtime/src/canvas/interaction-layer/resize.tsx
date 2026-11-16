import { activeResizeGuides } from "../../editor/geometry/snapping";
import { annotationTransformSnapshot } from "../../geometry/selection-transform";
import { artboardTransformSnapshot } from "../../geometry/selection-transform";
import { bothTransformAxes } from "../interaction-geometry";
import { canvasTouchDragThresholdPixels } from "../interaction-geometry";
import { focusCanvasDocument } from "../focus";
import { resizeRect } from "../../editor/geometry/resize";
import { resizeRectKeepingAspect } from "../../editor/geometry/resize";
import { resizeRotatedRect } from "../../editor/geometry/rotation";
import { selectionScaleLimits } from "../../geometry/selection-transform";
import { selectionTransformMembers } from "../../geometry/selection-transform";
import { selectionUniformScaleTransform } from "../../geometry/selection-transform";
import { snapResize } from "../../editor/geometry/snapping";
import { transformAnnotationBounds } from "../../geometry/selection-transform";
import { transformArtboardBounds } from "../../geometry/selection-transform";
import { transformTouchedProperties } from "../../geometry/selection-transform";
import { type Dynamic } from "../../runtime-types";

/** 按下缩放或编组变换手柄时运行：捕获指针，移动超过 4px 后持续调用 live，松开时 commit，按 Esc、丢失捕获或手柄消失时 revert，最后清理监听。 */
export function trackHandleDragGesture(deps: { readonly callback30: Dynamic; readonly value130: Dynamic; readonly value134: Dynamic; readonly value18: Dynamic; readonly value19: Dynamic }, event?: Dynamic,
      options2?: Dynamic,
      context?: Dynamic): Dynamic {
      if (event.button !== 0 || !deps.value18 || deps.value130.current.has("resize"))
        return;
      event.preventDefault();
      event.stopPropagation();
      (0, focusCanvasDocument)();
      let pointerId: Dynamic = event.pointerId,
        ancestor: Dynamic = event.currentTarget.closest(
          '[data-mega-chrome="' + options2 + '"]',
        ),
        callback61: Dynamic = (input?: Dynamic): Dynamic => {
          try {
            input?.setPointerCapture(pointerId);
          } catch {}
        };
      callback61(event.currentTarget);
      deps.value134("resize", true);
      deps.callback30("resize");
      let [items, items2]: Dynamic = [event.clientX, event.clientY],
        callback62: Dynamic = (): Dynamic =>
          !!ancestor?.isConnected && deps.value19.current,
        flag2: Dynamic = false,
        callback63: Dynamic = (input?: Dynamic): Dynamic => {
          if (input.pointerId === pointerId) {
            if (!callback62()) return callback67();
            (!flag2 &&
              Math.hypot(input.clientX - items, input.clientY - items2) <
                4) ||
              ((flag2 = true), context.live(input));
          }
        },
        callback64: Dynamic = (input?: Dynamic): Dynamic => {
          input.pointerId === pointerId && callback61(ancestor);
        },
        callback65: Dynamic = (): Dynamic => {
          (window as Dynamic).removeEventListener("pointermove", callback63);
          (window as Dynamic).removeEventListener("pointerup", callback66);
          (window as Dynamic).removeEventListener(
            "pointercancel",
            callback67,
          );
          (window as Dynamic).removeEventListener(
            "keydown",
            callback68,
            true,
          );
          (document as Dynamic).removeEventListener(
            "lostpointercapture",
            callback64,
            true,
          );
          deps.value134("resize", false);
          context.end?.();
        },
        callback66: Dynamic = (input?: Dynamic): Dynamic => {
          input.pointerId === pointerId &&
            (callback65(),
            flag2 &&
              (callback62() ? context.commit(input) : context.revert()));
        },
        callback67: Dynamic = (input?: Dynamic): Dynamic => {
          (input && input.pointerId !== pointerId) ||
            (callback65(), flag2 && context.revert());
        },
        callback68: Dynamic = (event2?: Dynamic): Dynamic => {
          event2.key === "Escape" &&
            (event2.preventDefault(),
            event2.stopImmediatePropagation(),
            callback67());
        };
      (window as Dynamic).addEventListener("pointermove", callback63);
      (window as Dynamic).addEventListener("pointerup", callback66);
      (window as Dynamic).addEventListener("pointercancel", callback67);
      (window as Dynamic).addEventListener("keydown", callback68, true);
      (document as Dynamic).addEventListener(
        "lostpointercapture",
        callback64,
        true,
      );
    }

/** 选中多个画板或便签并整体缩放或旋转时运行：记录变换前的快照，手势中把计算出的新几何写入画布清单并显示变换框，结束时提交或还原。 */
export function runSelectionTransformGesture(deps: { readonly callback57: Dynamic; readonly onManifestChange: Dynamic; readonly value146: Dynamic; readonly value230: Dynamic; readonly value231: Dynamic; readonly value234: Dynamic; readonly value236: Dynamic; readonly value241: Dynamic; readonly value242: Dynamic; readonly value70: Dynamic }, input?: Dynamic,
      options2?: Dynamic,
      context?: Dynamic,
      value250?: Dynamic,
      extra: Dynamic = false): Dynamic {
      let entries2: Dynamic = new Map(
          deps.value230.map((input2?: Dynamic): Dynamic => [input2.file, input2]),
        ),
        entries3: Dynamic = new Map(
          deps.value231.map(
            (input2?: Dynamic): Dynamic => [input2.spec.id, input2],
          ),
        ),
        callback61: Dynamic = (input2?: Dynamic): Dynamic =>
          Object.fromEntries(
            Object.entries(input2).filter(
              ([input3]: Dynamic): Dynamic => context.has(input3),
            ),
          ),
        value251: Dynamic = deps.value241,
        callback62: Dynamic = (
          input2?: Dynamic,
          options3?: Dynamic,
        ): Dynamic => {
          deps.value234(
            input2 && !options3
              ? {
                  box: input2.box,
                  deg: input2.deg,
                  turning: options2 === "Rotate",
                }
              : null,
          );
          let current: Dynamic = deps.value146.current,
            state: Dynamic = {
              ...current,
              artboards: current.artboards.map(
                (input3?: Dynamic): Dynamic => {
                  let entry2: Dynamic = entries2.get(input3.file);
                  return entry2
                    ? {
                        ...input3,
                        ...(input2
                          ? input2.board(entry2)
                          : callback61(
                              (0, artboardTransformSnapshot)(entry2),
                            )),
                      }
                    : input3;
                },
              ),
              ...(entries3.size > 0
                ? {
                    annotations: (current.annotations ?? []).map(
                      (input3?: Dynamic): Dynamic => {
                        let entry2: Dynamic = entries3.get(input3.id);
                        return entry2
                          ? {
                              ...input3,
                              ...(input2
                                ? input2.ann(entry2)
                                : callback61(
                                    (0, annotationTransformSnapshot)(
                                      entry2.spec,
                                    ),
                                  )),
                            }
                          : input3;
                      },
                    ),
                  }
                : {}),
            };
          options3 &&
            input2 &&
            (input2.deg !== 0 || extra) &&
            deps.value236(
              (input3?: Dynamic): Dynamic =>
                [
                  {
                    box: input2.box,
                    deg: input2.deg,
                    members: (0, selectionTransformMembers)(
                      state.artboards.filter(
                        (input4?: Dynamic): Dynamic =>
                          entries2.has(input4.file),
                      ),
                      (state.annotations ?? []).filter(
                        (input4?: Dynamic): Dynamic =>
                          entries3.has(input4.id),
                      ),
                    ),
                  },
                  ...input3,
                ].slice(0, 8),
            );
          deps.onManifestChange(
            state,
            options3,
            options3
              ? {
                  transformed: {
                    label: options2,
                    keys: context,
                    boards: entries2,
                    notes: new Map(
                      deps.value231.map(
                        (input3?: Dynamic): Dynamic => [
                          input3.spec.id,
                          input3.spec,
                        ],
                      ),
                    ),
                  },
                }
              : undefined,
          );
        },
        value252: Dynamic = null;
      deps.callback57(input, "group-resize", {
        live: (input2?: Dynamic): Dynamic => {
          value252 = value250(input2);
          callback62(value252, false);
          value252 ||
            deps.value234({
              box: value251,
              deg: deps.value242,
              turning: options2 === "Rotate",
            });
        },
        commit: (): Dynamic => {
          value252 ? callback62(value252, true) : callback62(null, false);
        },
        revert: (): Dynamic => callback62(null, false),
        end: (): Dynamic => {
          deps.value234(null);
          deps.value70(null);
        },
      });
    }

/** 拖动选中范围的缩放手柄时运行：根据指针位移和缩放上下限计算新的选区框（支持吸附、Shift 等比、旋转后的矩形），再交给整体变换手势应用到画板与便签。 */
export function beginSelectionGroupResize(deps: { readonly callback45: Dynamic; readonly callback58: Dynamic; readonly camera: Dynamic; readonly selectedArtboards: Dynamic; readonly selectedNotes: Dynamic; readonly value230: Dynamic; readonly value231: Dynamic; readonly value241: Dynamic; readonly value242: Dynamic; readonly value243: Dynamic; readonly value70: Dynamic }, input?: Dynamic, options2?: Dynamic): Dynamic {
      if (!deps.value241) return;
      let [items, items2]: Dynamic = [deps.value241, deps.value242],
        { min: value250, max: value251 }: Dynamic = (0,
        selectionScaleLimits)(items, deps.value230, deps.value231),
        state: Dynamic = {
          x: input.x !== null,
          y: input.y !== null,
        },
        value252: Dynamic = state.x && state.y && items.w > 0 && items.h > 0,
        [items3, items4]: Dynamic = [options2.clientX, options2.clientY],
        value253: Dynamic = (0, transformTouchedProperties)(
          items2
            ? {
                x: true,
                y: true,
              }
            : state,
        ),
        value254: Dynamic = items2
          ? []
          : deps.callback45({
              files: deps.selectedArtboards,
              notes: deps.selectedNotes,
            });
      deps.callback58(
        options2,
        "Resize",
        value253,
        (input2?: Dynamic): Dynamic => {
          let scale: Dynamic = deps.camera.get().scale,
            state2: Dynamic = {
              dx: (input2.clientX - items3) / scale,
              dy: (input2.clientY - items4) / scale,
            },
            value255: Dynamic =
              items2 || input2.metaKey || input2.ctrlKey
                ? {
                    ...state2,
                    guides: [],
                  }
                : (0, snapResize)(
                    items,
                    input,
                    state2.dx,
                    state2.dy,
                    value254,
                    canvasTouchDragThresholdPixels / scale,
                  ),
            [items5, items6]: Dynamic = [value255.dx, value255.dy];
          if (items2) {
            let value258: Dynamic = (0, resizeRotatedRect)(
              items,
              items2,
              input,
              items5,
              items6,
              value250,
              value251,
              true,
            );
            if (value258.w === items.w && value258.h === items.h) return null;
            let value259: Dynamic = (0,
            selectionUniformScaleTransform)(
              {
                x: items.x + items.w / 2,
                y: items.y + items.h / 2,
              },
              {
                x: value258.x + value258.w / 2,
                y: value258.y + value258.h / 2,
              },
              value258.w / items.w,
            );
            return {
              box: value258,
              deg: items2,
              keys: value253,
              board: (input3?: Dynamic): Dynamic =>
                (0, transformArtboardBounds)(
                  input3,
                  value259.from,
                  value259.to,
                  bothTransformAxes,
                ),
              ann: (input3?: Dynamic): Dynamic =>
                (0, transformAnnotationBounds)(
                  input3.spec,
                  value259.from,
                  value259.to,
                  bothTransformAxes,
                ),
            };
          }
          let value256: Dynamic =
              value252 && (deps.value243 || input2.shiftKey)
                ? (0, resizeRectKeepingAspect)(
                    items,
                    input,
                    items5,
                    items6,
                    value250,
                    value251,
                  )
                : (0, resizeRect)(
                    items,
                    input,
                    items5,
                    items6,
                    value250,
                    value251,
                  ),
            value257: Dynamic = (0, activeResizeGuides)(
              value256,
              input,
              value255.guides,
            );
          deps.value70(value257.length > 0 ? value257 : null);
          return value256.x === items.x &&
            value256.y === items.y &&
            value256.w === items.w &&
            value256.h === items.h
            ? null
            : {
                box: value256,
                deg: 0,
                keys: value253,
                board: (input3?: Dynamic): Dynamic =>
                  (0, transformArtboardBounds)(
                    input3,
                    items,
                    value256,
                    state,
                  ),
                ann: (input3?: Dynamic): Dynamic =>
                  (0, transformAnnotationBounds)(
                    input3.spec,
                    items,
                    value256,
                    state,
                  ),
              };
        },
        items2 !== 0,
      );
    }
