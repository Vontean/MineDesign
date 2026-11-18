import { OutlineDcOutlineHandler } from "../../editor/outline/dc-outline";
import { canvasContextMenuTargetFromElement } from "../hit-testing";
import { constrainLineAngle } from "../../editor/svg/drawing";
import { focusCanvasDocument } from "../focus";
import { freehandDrawingAnnotation } from "../interaction-geometry";
import { freehandSimplifyTolerance } from "../interaction-geometry";
import { isPrimaryModifierEvent } from "../interaction-geometry";
import { maximumArtboardSize } from "../interaction-geometry";
import { minimumArtboardSize } from "../interaction-geometry";
import { supportsClickPlacement } from "../../editor/tools";
import { type Dynamic } from "../../runtime-types";

/** 在画布上右键或长按时运行：识别点击目标（画板、对象或空白处），阻止系统菜单并在指针或键盘位置打开画布右键菜单。 */
export function openCanvasContextMenu(deps: { readonly callback12: Dynamic; readonly callback20: Dynamic; readonly onCanvasMenu: Dynamic; readonly value107: Dynamic; readonly value108: Dynamic; readonly value109: Dynamic; readonly value128: Dynamic; readonly value130: Dynamic; readonly value55: Dynamic }, event?: Dynamic): Dynamic {
          if (
            deps.onCanvasMenu == null ||
            deps.value55.current != null ||
            deps.value128.current ||
            OutlineDcOutlineHandler(event.target)
          )
            return;
          if (deps.value108.contextmenu()) return void event.preventDefault();
          let value250: Dynamic =
              deps.callback20(event) && deps.value130.current.size === 0
                ? canvasContextMenuTargetFromElement(
                    event.target,
                  )
                : null,
            current: Dynamic = deps.value109.current;
          deps.value109.current = null;
          if (value250 === null) return;
          let value251: Dynamic =
            current !== null &&
            Math.hypot(
              event.clientX - current.x,
              event.clientY - current.y,
            ) <= 3;
          if (current !== null && !value251)
            return void event.preventDefault();
          if (
            (event.button >= 0 &&
              !value251 &&
              deps.callback12({
                pointerType: "mouse",
                button: 2,
                target: event.target,
              })) ||
            (event.button < 0 && event.defaultPrevented)
          )
            return;
          event.preventDefault();
          let value252: Dynamic =
              "pointerType" in event.nativeEvent &&
              ["touch", "pen"].includes(
                String(event.nativeEvent.pointerType),
              ),
            value253: Dynamic =
              event.button < 0 && !value252 && event.target instanceof Element
                ? event.target.getBoundingClientRect()
                : null;
          deps.value107(
            value250,
            value253
              ? {
                  x: value253.left,
                  y: value253.bottom,
                  keyboard: true,
                }
              : {
                  x: event.clientX,
                  y: event.clientY,
                },
          );
        }

/** 在画布空白处按下指针时运行：按当前工具添加批注、拖出新画板、放置形状、绘制线条或箭头、自由绘制，或在选择工具下开始框选或清空选中。 */
export function pressCanvasBackground(deps: { readonly callback10: Dynamic; readonly callback13: Dynamic; readonly callback14: Dynamic; readonly callback16: Dynamic; readonly callback19: Dynamic; readonly callback20: Dynamic; readonly callback30: Dynamic; readonly camera: Dynamic; readonly manifest: Dynamic; readonly onAddAnnotation: Dynamic; readonly onAddPen: Dynamic; readonly onAddShape: Dynamic; readonly onClearSelection: Dynamic; readonly onDrawArtboard: Dynamic; readonly onPlaceBlocked: Dynamic; readonly onPlaceTool: Dynamic; readonly value108: Dynamic; readonly value128: Dynamic; readonly value130: Dynamic; readonly value134: Dynamic; readonly value183: Dynamic; readonly value19: Dynamic; readonly value213: Dynamic; readonly value55: Dynamic; readonly value78: Dynamic; readonly value79: Dynamic; readonly value81: Dynamic; readonly value83: Dynamic; readonly value85: Dynamic; readonly value96: Dynamic }, event?: Dynamic): Dynamic {
          deps.value108.clear();
          if (!!deps.callback20(event) && !deps.value130.current.has("marquee")) {
            if (
              !deps.value96.current &&
              deps.value85.current === "note" &&
              event.button === 0 &&
              deps.value55.current == null &&
              (!(event.target instanceof Element) ||
                event.target.closest("[data-mega-chrome]") == null)
            ) {
              event.preventDefault();
              event.stopPropagation();
              focusCanvasDocument();
              let bounds: Dynamic =
                event.currentTarget.getBoundingClientRect();
              deps.onAddAnnotation?.(
                deps.camera.get().x +
                  (event.clientX - bounds.left) / deps.camera.get().scale,
                deps.camera.get().y +
                  (event.clientY - bounds.top) / deps.camera.get().scale,
              );
              return;
            }
            if (
              !deps.value96.current &&
              deps.value85.current === "frame" &&
              event.button === 0 &&
              deps.value55.current == null &&
              (!(event.target instanceof Element) ||
                event.target.closest("[data-mega-chrome]") == null)
            ) {
              event.preventDefault();
              event.stopPropagation();
              focusCanvasDocument();
              let bounds: Dynamic =
                  event.currentTarget.getBoundingClientRect(),
                value250: Dynamic = deps.callback16(
                  event.clientX,
                  event.clientY,
                  bounds,
                );
              deps.value134("frame-tool", true);
              deps.callback30("frame-tool");
              let callback61: Dynamic = (input?: Dynamic): Dynamic => {
                  let value251: Dynamic = deps.callback16(
                    input.clientX,
                    input.clientY,
                    bounds,
                  );
                  return {
                    x: Math.min(value250.x, value251.x),
                    y: Math.min(value250.y, value251.y),
                    w: Math.abs(value251.x - value250.x),
                    h: Math.abs(value251.y - value250.y),
                  };
                },
                callback62: Dynamic = (input?: Dynamic): Dynamic =>
                  deps.value78(callback61(input)),
                callback63: Dynamic = (input?: Dynamic): Dynamic => {
                  (window as Dynamic).removeEventListener(
                    "pointermove",
                    callback62,
                  );
                  (window as Dynamic).removeEventListener(
                    "pointerup",
                    callback63,
                  );
                  (window as Dynamic).removeEventListener(
                    "pointercancel",
                    callback64,
                  );
                  deps.value78(null);
                  deps.value134("frame-tool", false);
                  let value251: Dynamic = callback61(input);
                  value251.w < 8 && value251.h < 8
                    ? deps.onDrawArtboard?.({
                        x: value251.x,
                        y: value251.y,
                        w: 0,
                        h: 0,
                      })
                    : deps.onDrawArtboard?.({
                        x: Math.round(value251.x),
                        y: Math.round(value251.y),
                        w: Math.round(
                          Math.min(
                            maximumArtboardSize.w,
                            Math.max(
                              value251.w,
                              minimumArtboardSize.w,
                            ),
                          ),
                        ),
                        h: Math.round(
                          Math.min(
                            maximumArtboardSize.h,
                            Math.max(
                              value251.h,
                              minimumArtboardSize.h,
                            ),
                          ),
                        ),
                      });
                },
                callback64: Dynamic = (): Dynamic => {
                  (window as Dynamic).removeEventListener(
                    "pointermove",
                    callback62,
                  );
                  (window as Dynamic).removeEventListener(
                    "pointerup",
                    callback63,
                  );
                  (window as Dynamic).removeEventListener(
                    "pointercancel",
                    callback64,
                  );
                  deps.value78(null);
                  deps.value134("frame-tool", false);
                };
              (window as Dynamic).addEventListener("pointermove", callback62);
              (window as Dynamic).addEventListener("pointerup", callback63);
              (window as Dynamic).addEventListener(
                "pointercancel",
                callback64,
              );
              return;
            }
            if (
              !deps.value96.current &&
              deps.value19.current &&
              supportsClickPlacement(deps.value85.current) &&
              event.button === 0 &&
              event.isPrimary &&
              !deps.value79.current &&
              deps.value55.current == null &&
              (!(event.target instanceof Element) ||
                event.target.closest("[data-mega-chrome]") == null)
            ) {
              event.preventDefault();
              event.stopPropagation();
              focusCanvasDocument();
              let current: Dynamic = deps.value85.current,
                value250: Dynamic =
                  (event.target instanceof Element
                    ? event.target.closest("[data-mega-artboard]")
                    : null
                  )?.getAttribute("data-mega-artboard") ?? null,
                value251: Dynamic =
                  value250 != null
                    ? deps.manifest.artboards.find(
                        (input?: Dynamic): Dynamic => input.file === value250,
                      )
                    : null,
                value252: Dynamic =
                  value251?.frameless === true &&
                  deps.value183.current !== value250,
                value253: Dynamic = value252 ? null : value250,
                value254: Dynamic = value252 ? null : value251;
              if (
                value254
                  ? deps.value213.has(value254.file)
                  : value253 != null || !deps.onAddShape
              ) {
                deps.onPlaceBlocked?.(current, value254 ? "blocked" : "outside");
                return;
              }
              let bounds: Dynamic =
                  event.currentTarget.getBoundingClientRect(),
                value255: Dynamic = deps.callback16(
                  event.clientX,
                  event.clientY,
                  bounds,
                ),
                pointerId: Dynamic = event.pointerId,
                callback61: Dynamic = (): Dynamic => deps.camera.get().scale,
                value256: Dynamic = current === "arrow" || current === "line",
                callback62: Dynamic = (input?: Dynamic): Dynamic => {
                  let value258: Dynamic = deps.callback16(
                      input.clientX,
                      input.clientY,
                      bounds,
                    ),
                    value259: Dynamic =
                      input.shiftKey && value256
                        ? constrainLineAngle(value255, value258)
                        : value258,
                    value260: Dynamic = Math.abs(value259.x - value255.x),
                    value261: Dynamic = Math.abs(value259.y - value255.y);
                  input.shiftKey &&
                    !value256 &&
                    (value260 = value261 = Math.max(value260, value261));
                  return {
                    x:
                      value259.x < value255.x
                        ? value255.x - value260
                        : value255.x,
                    y:
                      value259.y < value255.y
                        ? value255.y - value261
                        : value255.y,
                    w: value260,
                    h: value261,
                    dirX: value259.x >= value255.x ? 1 : -1,
                    dirY: value259.y >= value255.y ? 1 : -1,
                  };
                };
              deps.value79.current = true;
              deps.value134("place-tool", true);
              let callback63: Dynamic = (input?: Dynamic): Dynamic => {
                  let [items, items2]: Dynamic = [
                    input.w * callback61(),
                    input.h * callback61(),
                  ];
                  return (
                    value256
                      ? items > 4 || items2 > 4
                      : items > 4 && items2 > 4
                  )
                    ? input
                    : {
                        ...input,
                        x: value255.x,
                        y: value255.y,
                        w: 0,
                        h: 0,
                      };
                },
                value257: Dynamic = null,
                callback64: Dynamic = (input?: Dynamic): Dynamic => {
                  if (input.pointerId !== pointerId) return;
                  let value258: Dynamic = callback62(input),
                    value259: Dynamic =
                      (value258.w * value258.w + value258.h * value258.h) *
                      callback61() *
                      callback61();
                  (!value257 && value259 <= 16) ||
                    ((value257 = value258),
                    deps.value81({
                      tool: current,
                      ...value258,
                      onCanvas: !value254,
                    }));
                },
                callback65: Dynamic = (): Dynamic => {
                  (window as Dynamic).removeEventListener(
                    "pointermove",
                    callback64,
                  );
                  (window as Dynamic).removeEventListener(
                    "pointerup",
                    callback66,
                  );
                  (window as Dynamic).removeEventListener(
                    "pointercancel",
                    callback67,
                  );
                  (window as Dynamic).removeEventListener(
                    "keydown",
                    callback68,
                    true,
                  );
                  deps.value79.current = false;
                  deps.value81(null);
                  deps.value134("place-tool", false);
                },
                callback66: Dynamic = (input?: Dynamic): Dynamic => {
                  if (
                    input.pointerId !== pointerId ||
                    (callback65(), !deps.value19.current)
                  )
                    return;
                  let value258: Dynamic = value257 ?? callback62(input),
                    value259: Dynamic = value257
                      ? callback63(value258)
                      : {
                          ...value258,
                          x: value255.x,
                          y: value255.y,
                          w: 0,
                          h: 0,
                        },
                    state: Dynamic = {
                      x: value258.dirX,
                      y: value258.dirY,
                    },
                    state2: Dynamic = {
                      x: Math.round(value259.x - (value254?.x ?? 0)),
                      y: Math.round(value259.y - (value254?.y ?? 0)),
                      w: Math.round(value259.w),
                      h: Math.round(value259.h),
                    };
                  value254
                    ? deps.onPlaceTool?.(current, value254.file, state2, state)
                    : deps.onAddShape?.(current, state2, state);
                },
                callback67: Dynamic = (input?: Dynamic): Dynamic => {
                  input.pointerId === pointerId && callback65();
                },
                callback68: Dynamic = (event2?: Dynamic): Dynamic => {
                  event2.key === "Escape" &&
                    (event2.preventDefault(),
                    event2.stopPropagation(),
                    callback65());
                };
              (window as Dynamic).addEventListener("pointermove", callback64);
              (window as Dynamic).addEventListener("pointerup", callback66);
              (window as Dynamic).addEventListener(
                "pointercancel",
                callback67,
              );
              (window as Dynamic).addEventListener(
                "keydown",
                callback68,
                true,
              );
              return;
            }
            if (
              !deps.value96.current &&
              deps.value19.current &&
              deps.value85.current === "draw" &&
              deps.onAddPen &&
              event.button === 0 &&
              event.isPrimary &&
              !deps.value79.current &&
              deps.value55.current == null &&
              event.target instanceof Element &&
              event.target.closest("[data-mega-chrome]") == null &&
              event.target.closest("[data-mega-artboard]") == null
            ) {
              event.preventDefault();
              event.stopPropagation();
              focusCanvasDocument();
              let bounds: Dynamic =
                  event.currentTarget.getBoundingClientRect(),
                pointerId: Dynamic = event.pointerId,
                items: Dynamic = [[event.clientX, event.clientY]],
                count: Dynamic = 4,
                callback61: Dynamic = (): Dynamic =>
                  freehandSimplifyTolerance / deps.camera.get().scale;
              deps.value79.current = true;
              deps.value134("place-tool", true);
              let callback62: Dynamic = (): Dynamic => {
                  let value250: Dynamic = items.map(
                    ([input, input2]: Dynamic): Dynamic =>
                      deps.callback16(input, input2, bounds),
                  );
                  deps.value83(
                    freehandDrawingAnnotation(
                      value250,
                      callback61(),
                      false,
                    ),
                  );
                },
                callback63: Dynamic = (input?: Dynamic): Dynamic => {
                  if (input.pointerId !== pointerId) return;
                  let [value250, value251]: Dynamic = items[items.length - 1];
                  (input.clientX - value250) ** 2 +
                    (input.clientY - value251) ** 2 <
                    count ||
                    (items.push([input.clientX, input.clientY]),
                    items.length > 3e3 &&
                      ((items = items.filter(
                        (input2?: Dynamic, options2?: Dynamic): Dynamic =>
                          options2 % 2 === 0,
                      )),
                      (count *= 4)),
                    callback62());
                },
                callback64: Dynamic = (): Dynamic => {
                  (window as Dynamic).removeEventListener(
                    "pointermove",
                    callback63,
                  );
                  (window as Dynamic).removeEventListener(
                    "pointerup",
                    callback65,
                  );
                  (window as Dynamic).removeEventListener(
                    "pointercancel",
                    callback66,
                  );
                  (window as Dynamic).removeEventListener(
                    "keydown",
                    callback67,
                    true,
                  );
                  deps.value79.current = false;
                  deps.value83(null);
                  deps.value134("place-tool", false);
                },
                callback65: Dynamic = (input?: Dynamic): Dynamic => {
                  input.pointerId === pointerId &&
                    (callback64(),
                    !(!deps.value19.current || items.length < 2) &&
                      deps.onAddPen(
                        freehandDrawingAnnotation(
                          items.map(
                            ([input2, input3]: Dynamic): Dynamic =>
                              deps.callback16(input2, input3, bounds),
                          ),
                          callback61(),
                        ),
                      ));
                },
                callback66: Dynamic = (input?: Dynamic): Dynamic => {
                  input.pointerId === pointerId && callback64();
                },
                callback67: Dynamic = (event2?: Dynamic): Dynamic => {
                  event2.key === "Escape" &&
                    (event2.preventDefault(),
                    event2.stopPropagation(),
                    callback64());
                };
              (window as Dynamic).addEventListener("pointermove", callback63);
              (window as Dynamic).addEventListener("pointerup", callback65);
              (window as Dynamic).addEventListener(
                "pointercancel",
                callback66,
              );
              (window as Dynamic).addEventListener(
                "keydown",
                callback67,
                true,
              );
              return;
            }
            if (
              !deps.value96.current &&
              deps.value55.current == null &&
              deps.callback14(event.nativeEvent)
            ) {
              deps.callback19(event, {
                origin: {
                  kind: "canvas",
                },
                mode: isPrimaryModifierEvent(event)
                  ? "deep"
                  : "plain",
                toggle: event.shiftKey,
                capture: event.currentTarget,
                onStillRelease: event.shiftKey ? undefined : deps.onClearSelection,
              });
              return;
            }
            (event.target === event.currentTarget ||
              (event.target instanceof Element &&
                event.target.getAttribute("data-mega-chrome") ===
                  "set-box-pad")) &&
              event.button === 0 &&
              !event.shiftKey &&
              deps.onClearSelection();
            if (
              deps.value55.current == null &&
              (deps.callback13(event.nativeEvent) ||
                (event.button === 0 && deps.callback10(event.nativeEvent)))
            ) {
              deps.value134("pan", true);
              event.pointerType === "mouse" &&
                event.currentTarget.setAttribute("data-mega-grabbing", "");
              let value250: Dynamic =
                event.button === 2 && !deps.value128.current
                  ? canvasContextMenuTargetFromElement(
                      event.target,
                    )
                  : null;
              value250 !== null && deps.value108.down(event, value250);
              deps.callback30(
                "pan",
                event.button === 1 ? 4 : event.button === 2 ? 2 : 1,
              );
            }
          }
        }
