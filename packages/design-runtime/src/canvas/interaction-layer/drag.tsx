import { canvasSnapReferenceObjects } from "../../geometry/canvas-snapping";
import { focusCanvasDocument } from "../focus";
import { hasBoardSelection } from "../../editor/selection/canvas-selection";
import { rectangleSnapGuides } from "../../editor/geometry/snapping";
import { rotatedAnnotationBounds } from "../../platform/file-content";
import { type Dynamic } from "../../runtime-types";
import { unionRects } from "../../editor/geometry/resize";

/** 宿主正在拖入文件时（streamDragFile 存在）运行的 effect：监听全局指针事件，把鼠标在画布上的坐标以 move、up、cancel、stale 回报给宿主拖放。 */
export function subscribeHostDragPointer(deps: { readonly callback16: Dynamic; readonly streamDragFile: Dynamic; readonly value9: Dynamic; readonly value94: Dynamic }): Dynamic {
    if (deps.streamDragFile == null) return;
    let callback61: Dynamic = (input?: Dynamic): Dynamic => {
        let value250: Dynamic = deps.value9.current?.getBoundingClientRect();
        return value250
          ? deps.callback16(input.clientX, input.clientY, value250)
          : null;
      },
      callback62: Dynamic = (): Dynamic =>
        deps.value94.current?.("cancel", 0, 0, false),
      callback63: Dynamic = (input?: Dynamic): Dynamic => {
        input.pointerType === "mouse" &&
          deps.value94.current?.("stale", 0, 0, false);
      },
      callback64: Dynamic = (input?: Dynamic): Dynamic => {
        if (input.pointerType !== "mouse") return;
        if (!(input.buttons & 1)) {
          callback62();
          return;
        }
        let value250: Dynamic = callback61(input);
        value250 &&
          deps.value94.current?.(
            "move",
            value250.x,
            value250.y,
            input.altKey,
            input.ctrlKey,
          );
      },
      callback65: Dynamic = (event?: Dynamic): Dynamic => {
        if (event.pointerType !== "mouse" || event.button !== 0) return;
        let value250: Dynamic = callback61(event),
          value251: Dynamic =
            !!deps.value9.current &&
            event.target instanceof Node &&
            deps.value9.current.contains(event.target);
        value250 && value251
          ? deps.value94.current?.(
              "up",
              value250.x,
              value250.y,
              event.altKey,
              event.ctrlKey,
            )
          : callback62();
      };
    (window as Dynamic).addEventListener("pointerdown", callback63, true);
    (window as Dynamic).addEventListener("pointermove", callback64, true);
    (window as Dynamic).addEventListener("pointerup", callback65, true);
    (window as Dynamic).addEventListener("pointercancel", callback62, true);
    (window as Dynamic).addEventListener("blur", callback62);
    return (): Dynamic => {
      (window as Dynamic).removeEventListener(
        "pointerdown",
        callback63,
        true,
      );
      (window as Dynamic).removeEventListener(
        "pointermove",
        callback64,
        true,
      );
      (window as Dynamic).removeEventListener("pointerup", callback65, true);
      (window as Dynamic).removeEventListener(
        "pointercancel",
        callback62,
        true,
      );
      (window as Dynamic).removeEventListener("blur", callback62);
    };
  }

/** 按住画板标题栏或便签开始拖动时运行：捕获指针，收集要一起移动的画板与便签（按 Alt 时准备复制），计算吸附参照，并在 Ctrl/Esc 等按键下切换或取消拖动。 */
export function beginBoardDrag(deps: { readonly callback30: Dynamic; readonly callback47: Dynamic; readonly manifest: Dynamic; readonly onDuplicateObjects: Dynamic; readonly value134: Dynamic; readonly value216: Dynamic; readonly value218: Dynamic; readonly value219: Dynamic; readonly value67: Dynamic }, input?: Dynamic,
      options2?: Dynamic,
      context?: Dynamic,
      value250?: Dynamic,
      extra?: Dynamic,
      detail: Dynamic = false): Dynamic {
      if (input.button !== 0) return;
      let current: Dynamic = deps.value67.current;
      current && deps.callback47(current.pointerId);
      let value251: Dynamic = current && current.live && !current.alt,
        entries2: Dynamic = new Map(
          value251
            ? current.set.map(
                (input2?: Dynamic): Dynamic => [input2.file, input2],
              )
            : [],
        ),
        entries3: Dynamic = new Map(
          value251
            ? current.notes.map(
                (input2?: Dynamic): Dynamic => [input2.id, input2],
              )
            : [],
        );
      input.currentTarget.setPointerCapture(input.pointerId);
      deps.value134("frame-drag", true);
      deps.callback30("frame-drag");
      let value252: Dynamic = deps.manifest.artboards
          .filter(
            (input2?: Dynamic): Dynamic =>
              hasBoardSelection(value250, {
                file: input2.file,
              }) ||
              ("file" in options2 && options2.file === input2.file),
          )
          .map(
            (input2?: Dynamic): Dynamic =>
              entries2.get(input2.file) ?? {
                file: input2.file,
                x: input2.x,
                y: input2.y,
                w: input2.w,
                h: input2.h,
              },
          ),
        value253: Dynamic = (deps.manifest.annotations ?? [])
          .filter(
            (input2?: Dynamic): Dynamic =>
              hasBoardSelection(value250, {
                note: input2.id,
              }) ||
              ("note" in options2 && options2.note === input2.id),
          )
          .map(
            (input2?: Dynamic): Dynamic => entries3.get(input2.id) ?? input2,
          ),
        value254: Dynamic =
          ("file" in options2
            ? entries2.get(options2.file)
            : entries3.get(options2.note)) ?? context,
        value255: Dynamic = input.altKey && deps.onDuplicateObjects != null,
        value256: Dynamic = unionRects([
          ...value252,
          ...value253.map(
            (input2?: Dynamic): Dynamic =>
              rotatedAnnotationBounds(
                input2,
                deps.value216.current(input2),
              ),
          ),
        ]),
        value257: Dynamic = deps.manifest.artboards.map(
          (input2?: Dynamic): Dynamic => entries2.get(input2.file) ?? input2,
        ),
        value258: Dynamic = (deps.manifest.annotations ?? []).map(
          (input2?: Dynamic): Dynamic => {
            let value261: Dynamic = entries3.get(input2.id) ?? input2;
            return {
              id: value261.id,
              ...rotatedAnnotationBounds(
                value261,
                deps.value216.current(value261),
              ),
            };
          },
        ),
        state: Dynamic = {
          files: new Set(
            value252.map((input2?: Dynamic): Dynamic => input2.file),
          ),
          notes: new Set(
            value253.map((input2?: Dynamic): Dynamic => input2.id),
          ),
        },
        value259: Dynamic = canvasSnapReferenceObjects(
          value257,
          value258,
          state,
          false,
        ),
        value260: Dynamic = canvasSnapReferenceObjects(
          value257,
          value258,
          state,
          true,
        ),
        pointerId: Dynamic = input.pointerId;
      focusCanvasDocument();
      let flag2: Dynamic = false,
        callback61: Dynamic = (event?: Dynamic): Dynamic => {
          let current2: Dynamic = deps.value67.current;
          event.key === "Escape" && event.type === "keyup" && (flag2 = false);
          if (event.key === "Escape" && event.type === "keydown" && flag2) {
            event.preventDefault();
            event.stopImmediatePropagation();
            return;
          }
          if (
            !(!current2 || current2.pointerId !== pointerId || !current2.live)
          ) {
            if (event.key === "Escape" && event.type === "keydown") {
              event.preventDefault();
              event.stopImmediatePropagation();
              flag2 = true;
              deps.value218.current(pointerId);
              return;
            }
            event.key === "Alt" &&
              !event.repeat &&
              current2.last &&
              deps.value219.current(
                {
                  ...current2.last,
                  pointerId: pointerId,
                  altKey: event.type === "keydown",
                },
                false,
              );
            event.key === "Control" &&
              !event.repeat &&
              current2.last &&
              current2.hoverKey &&
              deps.value219.current(
                {
                  ...current2.last,
                  pointerId: pointerId,
                  altKey: current2.alt,
                  ctrlKey: event.type === "keydown",
                },
                false,
              );
          }
        },
        callback62: Dynamic = (): Dynamic => deps.value218.current(pointerId);
      (window as Dynamic).addEventListener("keydown", callback61, true);
      (window as Dynamic).addEventListener("keyup", callback61, true);
      (window as Dynamic).addEventListener("blur", callback62);
      deps.value67.current = {
        ref: options2,
        set: value252,
        notes: value253,
        pointerId: pointerId,
        startX: input.clientX,
        startY: input.clientY,
        origX: value254.x,
        origY: value254.y,
        alt: value255,
        last: null,
        unlisten: (): Dynamic => {
          (window as Dynamic).removeEventListener("blur", callback62);
          if (!flag2) {
            (window as Dynamic).removeEventListener(
              "keydown",
              callback61,
              true,
            );
            (window as Dynamic).removeEventListener(
              "keyup",
              callback61,
              true,
            );
            return;
          }
          let callback63: Dynamic = (input2?: Dynamic): Dynamic => {
            input2.key !== "Escape" ||
              input2.type !== "keyup" ||
              ((window as Dynamic).removeEventListener(
                "keydown",
                callback61,
                true,
              ),
              (window as Dynamic).removeEventListener(
                "keyup",
                callback61,
                true,
              ),
              (window as Dynamic).removeEventListener(
                "keyup",
                callback63,
                true,
              ));
          };
          (window as Dynamic).addEventListener("keyup", callback63, true);
        },
        click: extra,
        focus: detail && !input.altKey,
        live: false,
        snap: value256
          ? {
              box: value256,
              moveLines: rectangleSnapGuides(value259),
              copyLines: rectangleSnapGuides(value260),
              moveStill: value259,
              copyStill: value260,
            }
          : null,
      };
    }

/** 其他手势通过 canvas.start 接管为画板拖动时运行：结束旧的拖动，按当前选择收集画板与便签，记录起点与原位置，建立拖动状态。 */
export function beginHandedOffBoardDrag(deps: { readonly value146: Dynamic; readonly value218: Dynamic; readonly value67: Dynamic }, input?: Dynamic,
      options2?: Dynamic,
      context?: Dynamic,
      value250?: Dynamic,
      extra?: Dynamic,
      detail?: Dynamic): Dynamic {
      let current: Dynamic = deps.value67.current;
      current && deps.value218.current(current.pointerId);
      let current2: Dynamic = deps.value146.current,
        value251: Dynamic = current2.artboards
          .filter(
            (input2?: Dynamic): Dynamic =>
              hasBoardSelection(value250, {
                file: input2.file,
              }),
          )
          .map(
            (input2?: Dynamic): Dynamic => ({
              file: input2.file,
              x: input2.x,
              y: input2.y,
              w: input2.w,
              h: input2.h,
            }),
          ),
        value252: Dynamic = (current2.annotations ?? []).filter(
          (input2?: Dynamic): Dynamic =>
            hasBoardSelection(value250, {
              note: input2.id,
            }),
        ),
        value253: Dynamic = ("file" in context
          ? value251.find(
              (input2?: Dynamic): Dynamic => input2.file === context.file,
            )
          : value252.find(
              (input2?: Dynamic): Dynamic => input2.id === context.note,
            )) ??
          value251[0] ??
          value252[0] ?? {
            x: 0,
            y: 0,
          };
      deps.value67.current = {
        ref: context,
        set: value251,
        notes: value252,
        pointerId: options2,
        startX: extra,
        startY: detail,
        origX: value253.x,
        origY: value253.y,
        alt: false,
        last: null,
        unlisten: (): Dynamic => {},
        click: null,
        focus: false,
        live: true,
        setMove: input,
        snap: null,
      };
    }
