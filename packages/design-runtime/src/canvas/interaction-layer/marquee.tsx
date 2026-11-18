import { SelectionActionsReplace } from "../../editor/selection/actions";
import { applyElementRectStyle } from "../hit-testing";
import { canvasDragThresholdPixels } from "../interaction-geometry";
import { emptyBoardSelection } from "../../editor/selection/canvas-selection";
import { inclusiveRectIntersects } from "../hit-testing";
import { objectsWithinCanvasMarquee } from "../hit-testing";
import { type Dynamic } from "../../runtime-types";

/** 在画布或画板内开始框选时运行：捕获指针，拖动中计算与框相交的画板、便签和画板内元素并实时更新选中，松手或按 Esc 时结束；移动不足阈值视为单击。 */
export function beginCanvasMarquee(deps: { readonly callback16: Dynamic; readonly value134: Dynamic; readonly value146: Dynamic; readonly value19: Dynamic; readonly value2: Dynamic; readonly value216: Dynamic; readonly value34: Dynamic; readonly value57: Dynamic; readonly value61: Dynamic; readonly value87: Dynamic; readonly value88: Dynamic; readonly value89: Dynamic; readonly value9: Dynamic; readonly value91: Dynamic; readonly value92: Dynamic }, input?: Dynamic,
      options2?: Dynamic): Dynamic {
      let current: Dynamic = deps.value9.current;
      if (!current) return;
      let {
          pointerId: value250,
          clientX: value251,
          clientY: value252,
        }: Dynamic = input,
        value253: Dynamic = deps.callback16(
          value251,
          value252,
          current.getBoundingClientRect(),
        ),
        value254: Dynamic =
          options2.tree !== undefined
            ? options2.tree
            : (deps.value92.current?.(options2.toggle) ?? null),
        current2: Dynamic = deps.value57.current,
        value255: Dynamic = options2.toggle
          ? current2
          : emptyBoardSelection;
      try {
        options2.capture.hasPointerCapture(value250) ||
          options2.capture.setPointerCapture(value250);
      } catch {}
      deps.value134("marquee", true);
      let value256: Dynamic = null,
        value257: Dynamic = value251,
        value258: Dynamic = value252,
        value259: Dynamic = null,
        index: Dynamic = 0,
        flag2: Dynamic = false,
        entries2: Dynamic = new Map(),
        values: Dynamic = new Set(),
        entries3: Dynamic = new Map(),
        entries4: Dynamic = new Map(),
        values2: Dynamic = new Set(),
        callback61: Dynamic = (
          input2?: Dynamic,
          options3?: Dynamic,
        ): Dynamic => {
          let value260: Dynamic = [
            options3.x0,
            options3.y0,
            options3.x1,
            options3.y1,
          ]
            .map((input3?: Dynamic): Dynamic => Math.round(input3))
            .join(",");
          if (entries4.get(input2) === value260) return true;
          if (values.has(input2)) {
            entries3.set(input2, options3);
            return true;
          }
          let entry2: Dynamic = deps.value2.current.get(input2);
          return !entry2 || !entry2.isReady()
            ? false
            : (values.add(input2),
              entries4.set(input2, value260),
              entry2.pickIn(options3, options2.mode).then(
                (input3?: Dynamic): Dynamic => {
                  values.delete(input2);
                  if (flag2 || (index && Date.now() - index > 1500)) return;
                  input3 == null
                    ? values2.add(input2)
                    : entries2.set(input2, input3);
                  callback63();
                  let entry3: Dynamic = entries3.get(input2);
                  entries3.delete(input2);
                  entry3 && callback61(input2, entry3);
                },
                (): Dynamic => {
                  values.delete(input2);
                  values2.add(input2);
                  !flag2 &&
                    !(index && Date.now() - index > 1500) &&
                    callback63();
                },
              ),
              true);
        },
        callback62: Dynamic = (input2?: Dynamic): Dynamic => {
          let current3: Dynamic = deps.value146.current,
            values3: Dynamic = new Set(),
            entries5: Dynamic = new Map(),
            value260: Dynamic =
              options2.origin.kind === "canvas"
                ? current3.artboards
                : current3.artboards.filter(
                    (input3?: Dynamic): Dynamic =>
                      input3.file === options2.origin.file,
                  );
          for (let value262 of value260 as Dynamic) {
            if (!inclusiveRectIntersects(input2, value262)) {
              entries2.delete(value262.file);
              entries3.delete(value262.file);
              entries4.delete(value262.file);
              continue;
            }
            let value263: Dynamic =
              input2.x <= value262.x &&
              value262.x + value262.w <= input2.x + input2.w &&
              input2.y <= value262.y &&
              value262.y + value262.h <= input2.y + input2.h;
            if (
              options2.origin.kind === "canvas" &&
              (value262.frameless || (value263 && options2.mode === "plain"))
            ) {
              values3.add(value262.file);
              entries2.delete(value262.file);
              continue;
            }
            if (
              !(
                !values2.has(value262.file) &&
                callback61(value262.file, {
                  x0: Math.max(0, input2.x - value262.x),
                  y0: Math.max(0, input2.y - value262.y),
                  x1: Math.min(value262.w, input2.x + input2.w - value262.x),
                  y1: Math.min(value262.h, input2.y + input2.h - value262.y),
                })
              )
            ) {
              options2.origin.kind === "canvas" && values3.add(value262.file);
              continue;
            }
            let entry2: Dynamic = entries2.get(value262.file);
            entry2 &&
              entry2.length > 0 &&
              entries5.set(value262.file, {
                name: SelectionActionsReplace(value262.file),
                tids: entry2,
              });
          }
          let value261: Dynamic =
              deps.value19.current && options2.origin.kind === "canvas"
                ? (current3.annotations ?? [])
                : [],
            notes: Dynamic = objectsWithinCanvasMarquee(
              {
                artboards: [],
                annotations: value261,
                annBox: deps.value216.current,
              },
              input2,
              emptyBoardSelection,
            ).notes;
          return {
            files: values3,
            notes: notes,
            elements: entries5,
          };
        },
        callback63: Dynamic = (): Dynamic => {
          if (!value259) return;
          let value260: Dynamic = callback62(value259),
            value261: Dynamic =
              [...value260.files].sort().join(`
`) +
              `

` +
              [...value260.notes].sort().join(`
`) +
              `

` +
              [...value260.elements]
                .map(
                  ([input2, input3]: Dynamic): Dynamic =>
                    input2 +
                    "#" +
                    [...input3.tids]
                      .sort(
                        (input4?: Dynamic, options3?: Dynamic): Dynamic =>
                          input4 - options3,
                      )
                      .join("."),
                )
                .sort().join(`
`);
          value261 !== value256 &&
            ((value256 = value261),
            value254
              ? value254.sweep(value260)
              : deps.value61.current(
                  {
                    files: new Set([...value255.files, ...value260.files]),
                    notes: new Set([...value255.notes, ...value260.notes]),
                  },
                  "replace",
                ));
        },
        callback64: Dynamic = (): Dynamic => {
          let value260: Dynamic = deps.callback16(
            value257,
            value258,
            current.getBoundingClientRect(),
          );
          value259 = {
            x: Math.min(value253.x, value260.x),
            y: Math.min(value253.y, value260.y),
            w: Math.abs(value260.x - value253.x),
            h: Math.abs(value260.y - value253.y),
          };
          let entry2: Dynamic = deps.value34.current.get();
          deps.value88.current = {
            x: (value259.x - entry2.x) * entry2.scale,
            y: (value259.y - entry2.y) * entry2.scale,
            w: value259.w * entry2.scale,
            h: value259.h * entry2.scale,
          };
          applyElementRectStyle(
            deps.value89.current,
            deps.value88.current,
          );
          callback63();
        };
      deps.value91.current = (): Dynamic => {
        value256 != null && callback64();
      };
      let callback65: Dynamic = (input2?: Dynamic): Dynamic => {
          if (input2.pointerId === value250) {
            if (!(input2.buttons & 1)) return callback66();
            if (value256 == null) {
              if (
                Math.hypot(
                  input2.clientX - value251,
                  input2.clientY - value252,
                ) < canvasDragThresholdPixels
              )
                return;
              deps.value87(true);
            }
            value257 = input2.clientX;
            value258 = input2.clientY;
            callback64();
          }
        },
        callback66: Dynamic = (): Dynamic => {
          index = Date.now();
          (window as Dynamic).removeEventListener("pointermove", callback65);
          (window as Dynamic).removeEventListener("pointerup", callback68);
          (window as Dynamic).removeEventListener(
            "pointercancel",
            callback69,
          );
          (window as Dynamic).removeEventListener(
            "keydown",
            callback70,
            true,
          );
          (window as Dynamic).removeEventListener("blur", callback67);
          (window as Dynamic).removeEventListener("contextmenu", callback66);
          deps.value91.current = null;
          deps.value88.current = null;
          deps.value87(false);
          deps.value134("marquee", false);
        },
        callback67: Dynamic = (): Dynamic => {
          (document as Dynamic).hasFocus() || ((flag2 = true), callback66());
        },
        callback68: Dynamic = (input2?: Dynamic): Dynamic => {
          if (input2.pointerId !== value250) return;
          let value260: Dynamic = value256 == null;
          callback66();
          value260 && options2.onStillRelease?.();
        },
        callback69: Dynamic = (input2?: Dynamic): Dynamic => {
          input2.pointerId === value250 && ((flag2 = true), callback66());
        },
        callback70: Dynamic = (event?: Dynamic): Dynamic => {
          event.key !== "Escape" ||
            value256 == null ||
            (event.preventDefault(),
            event.stopPropagation(),
            (flag2 = true),
            callback66(),
            value254
              ? value254.cancel()
              : deps.value61.current(current2, "replace"));
        };
      (window as Dynamic).addEventListener("pointermove", callback65);
      (window as Dynamic).addEventListener("pointerup", callback68);
      (window as Dynamic).addEventListener("pointercancel", callback69);
      (window as Dynamic).addEventListener("keydown", callback70, true);
      (window as Dynamic).addEventListener("blur", callback67);
      (window as Dynamic).addEventListener("contextmenu", callback66);
      options2.from &&
        (deps.value87(true),
        (value257 = options2.from.x),
        (value258 = options2.from.y),
        callback64());
    }
