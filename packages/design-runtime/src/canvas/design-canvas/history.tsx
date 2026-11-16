import { CanvasWorkingStateHandler_3 } from "../working-state";
import { CanvasWorkingStateHas } from "../working-state";
import { NothingChangedThatStepNoLongerMessage } from "../../editor/accessibility/announcements";
import { PlatformFileContentHandler_4 } from "../../platform/file-content";
import { PlatformFileContentLimit_3 } from "../../platform/file-content";
import { PlatformFileContentLimit_5 } from "../../platform/file-content";
import { announce } from "../../editor/accessibility/announcer";
import { applyCanvasManifestHistory } from "../manifest-history";
import { assignImplicitFirstCanvasPage } from "../page-operations";
import { canvasHistoryAnnouncementMode } from "../manifest-history";
import { clipboardActionFailureMessage } from "../../editor/accessibility/announcements";
import { compatibleRestoredCanvasLaunch } from "../manifest-history";
import { createPageId } from "../../platform/file-content";
import { createSessionHistory } from "../working-state";
import { designPageId } from "../../platform/file-content";
import { errorMessage } from "../../platform/rate-limiter";
import { getKvClient } from "../../platform/file-content";
import { isShapeAnnotation } from "../../platform/file-content";
import { moveAnnotation } from "../../platform/file-content";
import { neighboringCanvasPageId } from "../page-operations";
import { pageUndoFailureMessage } from "../../editor/accessibility/announcements";
import { pendingUndoAnnouncement } from "../../editor/accessibility/announcements";
import { recordSessionLoadStart } from "../working-state";
import { remainingCanvasPageObjects } from "../page-operations";
import { repairCanvasLaunchAfterDeletion } from "../manifest-history";
import { restoreCanvasPageSpec } from "../page-operations";
import { retargetCanvasPageHistory } from "../page-operations";
import { summarizeChangedArtboards } from "../../editor/accessibility/announcements";
import { type Dynamic } from "../../runtime-types";
import { uiMessage } from "@minedesign/contracts/ui-messages";
import { undoTargetAnnouncement } from "../../editor/accessibility/announcements";
import { updateTextEditHistoryCounts } from "../working-state";
import { emptyCanvasSelectionFiles } from "../design-canvas";

/** 画布操作完成后运行：把操作推入撤销栈（最多 50 条），记录各画板的会话历史深度并清空重做。 */
export function recordCanvasHistoryStep(deps: { readonly value140: Dynamic; readonly value141: Dynamic; readonly value4: Dynamic; readonly value405: Dynamic; readonly value408: Dynamic; readonly value410: Dynamic; readonly value412: Dynamic; readonly value440: Dynamic; readonly value67: Dynamic }, source?: Dynamic,
        options?: Dynamic,
        context?: Dynamic,
        value653?: Dynamic): Dynamic {
        let value654: Dynamic =
          value653 !== undefined &&
          (source.kind === "add" || source.kind === "ann-add")
            ? deps.value141.current.get(value653)
            : undefined;
        if (value654) {
          value654(source);
          deps.value140.current.get(value653)?.();
          deps.value140.current.delete(value653);
          return;
        }
        deps.value412();
        deps.value4.current !== null &&
          (0, updateTextEditHistoryCounts)(
            deps.value4.current,
            "clear-redo",
          );
        let value655: Dynamic = deps.value67.artboards
          .filter((input?: Dynamic): Dynamic => !options.has(input.file))
          .map(
            (input?: Dynamic): Dynamic => [
              input.file,
              deps.value440.current.get(input.file) ?? 0,
            ],
          );
        if (source.kind === "add")
          for (let value656 of new Set([
            ...source.entries.map((input?: Dynamic): Dynamic => input.file),
            ...(context ?? []),
          ]) as Dynamic)
            value655.push([value656, deps.value440.current.get(value656) ?? 0]);
        deps.value405.current.length >= 50 && (deps.value410.current += 1);
        deps.value405.current = [
          ...deps.value405.current,
          {
            op: source,
            at: Date.now(),
            depths: value655,
            ...(value653 !== undefined
              ? {
                  bound: value653,
                }
              : {}),
            ...(deps.value4.current !== null &&
            (0, CanvasWorkingStateHandler_3)(source.kind)
              ? {
                  duringTextEdit: deps.value4.current,
                }
              : {}),
          },
        ].slice(-50);
        deps.value408((input?: Dynamic): Dynamic => input + 1);
        value653 !== undefined &&
          (deps.value140.current.get(value653)?.(),
          deps.value140.current.delete(value653));
      }

/** 撤销或重做某个画布步骤时运行：按步骤类型恢复 Tweaks、清单变化、页面增删或画板文件增删。 */
export async function applyCanvasHistoryStep(deps: { readonly doc: Dynamic; readonly value177: Dynamic; readonly value298: Dynamic; readonly value70: Dynamic; readonly value80: Dynamic; readonly value98: Dynamic }, source?: Dynamic, options?: Dynamic): Promise<Dynamic> {
        let current4: Dynamic = deps.value70.current,
          callback15: Dynamic = (
            input?: Dynamic,
            options2: Dynamic = current4,
          ): Dynamic => deps.value98(input, options2);
        if (source.kind === "tweak") {
          let entry: Dynamic = deps.value177.current.get(source.file);
          if (!entry) return false;
          entry.setTweaks(options === "undo" ? source.from : source.to);
          return;
        }
        if (source.kind !== "add" && source.kind !== "delete") {
          let value658: Dynamic = (0, applyCanvasManifestHistory)(
            current4,
            source,
            options,
          );
          if (value658 === "nothing" || value658 === "full") return value658;
          if (source.kind === "page-add" && options === "undo") {
            let value659: Dynamic = (0,
            repairCanvasLaunchAfterDeletion)(
              current4,
              emptyCanvasSelectionFiles,
              source.page.id,
            );
            value659 !== undefined && (source.launch = value659);
          }
          if (source.kind === "page-add" && options === "redo") {
            let value659: Dynamic = (0,
            compatibleRestoredCanvasLaunch)(
              source.launch,
              current4.launch,
            );
            callback15(
              value659 !== undefined
                ? {
                    ...value658,
                    launch: value659,
                  }
                : value658,
            );
            delete source.launch;
            return;
          }
          callback15(value658);
          return;
        }
        let value653: Dynamic =
            source.kind === "delete"
              ? options === "undo"
              : options === "redo",
          callback16: Dynamic = (input?: Dynamic): Dynamic => {
            if (source.kind !== "add" || !source.moves) return input;
            let entries: Dynamic = new Map(
              source.moves.map(
                (input2?: Dynamic): Dynamic => [
                  input2.file,
                  value653 ? input2.to : input2.from,
                ],
              ),
            );
            return input.map((input2?: Dynamic): Dynamic => {
              let entry: Dynamic = entries.get(input2.file);
              return entry
                ? {
                    ...input2,
                    x: entry.x,
                    y: entry.y,
                  }
                : input2;
            });
          },
          callback17: Dynamic = (input?: Dynamic): Dynamic => {
            if (source.kind !== "add" || !source.annMoves) return input;
            let entries: Dynamic = new Map(
              source.annMoves.map(
                (input2?: Dynamic): Dynamic => [
                  input2.id,
                  value653 ? input2.to : input2.from,
                ],
              ),
            );
            return input.map((input2?: Dynamic): Dynamic => {
              let entry: Dynamic = entries.get(input2.id);
              return entry
                ? (0, moveAnnotation)(input2, entry.x, entry.y)
                : input2;
            });
          },
          value654: Dynamic =
            source.kind === "add" &&
            ((source.moves?.length ?? 0) > 0 ||
              (source.annMoves?.length ?? 0) > 0);
        if (
          !value653 &&
          source.kind === "delete" &&
          source.page !== undefined
        ) {
          let page: Dynamic = source.page;
          if (
            !(current4.pages ?? []).some(
              (input?: Dynamic): Dynamic => input.id !== page.spec.id,
            )
          )
            throw new Error("it is the only page left.");
          let value658: Dynamic = (0, remainingCanvasPageObjects)(
            current4,
            page.spec.id,
            new Set(
              source.entries.map((input?: Dynamic): Dynamic => input.file),
            ),
            new Set(
              (source.anns ?? []).map(
                (input?: Dynamic): Dynamic => input.spec.id,
              ),
            ),
          );
          for (let value659 of value658.artboards as Dynamic) {
            await deps.value177.current.get(value659.file)?.flushPending();
            let value660: Dynamic =
              (await (0, getKvClient)().get(
                (0, PlatformFileContentHandler_4)(value659.file),
              )) ??
              deps.doc.content().files[value659.file] ??
              "";
            source.entries.push({
              file: value659.file,
              src: value660,
              spec: value659,
              index: current4.artboards.findIndex(
                (input?: Dynamic): Dynamic => input.file === value659.file,
              ),
            });
          }
          value658.notes.length > 0 &&
            (source.anns = [
              ...(source.anns ?? []),
              ...(current4.annotations ?? []).flatMap(
                (input?: Dynamic, options2?: Dynamic): Dynamic =>
                  value658.notes.includes(input.id)
                    ? [
                        {
                          spec: input,
                          index: options2,
                        },
                      ]
                    : [],
              ),
            ]);
        }
        if (!value653) {
          let values: Dynamic = new Set(
            source.entries.map((input?: Dynamic): Dynamic => input.file),
          );
          current4.cover !== undefined &&
            values.has(current4.cover) &&
            (source.cover = current4.cover);
          let value658: Dynamic = (0,
          repairCanvasLaunchAfterDeletion)(
            current4,
            values,
            source.kind === "delete" ? source.page?.spec.id : undefined,
          );
          value658 !== undefined && (source.launch = value658);
        }
        let items: Dynamic = [...(current4.annotations ?? [])],
          value655: Dynamic =
            source.kind === "delete"
              ? (source.anns ?? [])
              : (source.anns ?? []).map(
                  (input?: Dynamic, options2?: Dynamic): Dynamic => ({
                    spec: input,
                    index: items.length + options2,
                  }),
                ),
          value656: Dynamic = value653
            ? value655.filter(
                (input?: Dynamic): Dynamic =>
                  !items.some(
                    (input2?: Dynamic): Dynamic =>
                      input2.id === input.spec.id,
                  ),
              ).length
            : 0;
        if (
          value656 > 0 &&
          items.length + value656 > PlatformFileContentLimit_5
        )
          return "full";
        if (
          value653 &&
          source.kind === "delete" &&
          source.page !== undefined
        ) {
          let page: Dynamic = source.page,
            value658: Dynamic = (current4.pages ?? []).some(
              (input?: Dynamic): Dynamic => input.id === page.spec.id,
            );
          if (!(value658 && page.relisted === true)) {
            if (
              (current4.pages ?? []).length >=
              PlatformFileContentLimit_3
            )
              throw new Error(
                "this canvas is at its page limit (" +
                  String(PlatformFileContentLimit_3) +
                  ").",
              );
            value658 &&
              (0, retargetCanvasPageHistory)(
                source,
                (0, createPageId)(current4.pages ?? [], true),
              );
          }
        }
        let value657: Dynamic =
          source.kind === "delete" ? source.page : undefined;
        if (value653) {
          let value658: Dynamic =
            value657 !== undefined && value657.index === 0;
          value658 &&
            items.splice(
              0,
              items.length,
              ...(0, assignImplicitFirstCanvasPage)(
                items,
                current4.pages,
              ),
            );
          let value659: Dynamic = value658
            ? (0, assignImplicitFirstCanvasPage)(
                current4.artboards,
                current4.pages,
              )
            : [...current4.artboards];
          if (source.kind === "delete")
            for (let value661 of [...source.entries].sort(
              (input?: Dynamic, options2?: Dynamic): Dynamic =>
                input.index - options2.index,
            ) as Dynamic)
              value659.some(
                (input?: Dynamic): Dynamic => input.file === value661.file,
              ) ||
                value659.splice(
                  Math.min(value661.index, value659.length),
                  0,
                  value661.spec,
                );
          else
            value659.push(
              ...source.entries.map((input?: Dynamic): Dynamic => input.spec),
            );
          for (let value661 of [...value655].sort(
            (input?: Dynamic, options2?: Dynamic): Dynamic =>
              input.index - options2.index,
          ) as Dynamic)
            items.some(
              (input?: Dynamic): Dynamic => input.id === value661.spec.id,
            ) ||
              items.splice(
                Math.min(value661.index, items.length),
                0,
                value661.spec,
              );
          let value660: Dynamic = (0, compatibleRestoredCanvasLaunch)(
            source.launch,
            current4.launch,
          );
          callback15({
            ...current4,
            artboards: callback16(value659),
            ...(value655.length > 0 || value654 || value658
              ? {
                  annotations: callback17(items),
                }
              : {}),
            ...(source.cover !== undefined &&
            (source.kind === "delete" || current4.cover === undefined)
              ? {
                  cover: source.cover,
                }
              : {}),
            ...(value657 !== undefined
              ? {
                  pages: (0, restoreCanvasPageSpec)(
                    current4.pages,
                    value657,
                  ),
                }
              : {}),
            ...(value660 !== undefined
              ? {
                  launch: value660,
                }
              : {}),
          });
          value657 !== undefined && (value657.relisted = true);
          if (source.kind === "add")
            for (let value661 of (source.files ?? []) as Dynamic)
              (deps.doc.content().files[value661.path] ?? value661.src) ===
                value661.src &&
                (await (0, getKvClient)().set(
                  (0, PlatformFileContentHandler_4)(value661.path),
                  value661.src,
                ));
          for (let value661 of source.entries as Dynamic)
            await (0, getKvClient)().set(
              (0, PlatformFileContentHandler_4)(value661.file),
              value661.src,
            );
          value657 !== undefined && deps.value298(value657.spec.id);
          delete source.cover;
          delete source.launch;
        } else {
          for (let value660 of source.entries as Dynamic) {
            await deps.value177.current.get(value660.file)?.flushPending();
            await (0, getKvClient)().delete(
              (0, PlatformFileContentHandler_4)(value660.file),
            );
          }
          if (source.kind === "add")
            for (let value660 of (source.files ?? []) as Dynamic)
              deps.doc.content().files[value660.path] === value660.src &&
                (await (0, getKvClient)().delete(
                  (0, PlatformFileContentHandler_4)(value660.path),
                ));
          let current5: Dynamic = deps.value70.current,
            value658: Dynamic =
              value657 !== undefined
                ? (current5.pages ?? []).filter(
                    (input?: Dynamic): Dynamic =>
                      input.id !== value657.spec.id,
                  )
                : [],
            value659: Dynamic =
              value657 !== undefined &&
              value658.length > 0 &&
              deps.value80.current === value657.spec.id
                ? ((0, neighboringCanvasPageId)(
                    current5.pages ?? [],
                    value657.spec.id,
                  ) ?? value658[0].id)
                : undefined;
          callback15(
            {
              ...current5,
              artboards: callback16(
                current5.artboards.filter(
                  (input?: Dynamic): Dynamic =>
                    !source.entries.some(
                      (input2?: Dynamic): Dynamic =>
                        input2.file === input.file,
                    ),
                ),
              ),
              ...(value655.length > 0 || value654
                ? {
                    annotations: callback17(
                      (current5.annotations ?? []).filter(
                        (input?: Dynamic): Dynamic =>
                          !value655.some(
                            (input2?: Dynamic): Dynamic =>
                              input2.spec.id === input.id,
                          ),
                      ),
                    ),
                  }
                : {}),
              ...(value658.length > 0
                ? {
                    pages: value658,
                  }
                : {}),
            },
            current5,
          );
          value657 !== undefined &&
            (value657.relisted = value658.length === 0);
          value659 !== undefined && deps.value298(value659);
        }
      }

/** 执行撤销或重做时运行：取出可达的历史步骤并应用，处理页面删除恢复，失败时把步骤放回并提示，成功时播报具体操作。 */
export function applyUndoRedoStep(deps: { readonly showToast: Dynamic; readonly value188: Dynamic; readonly value218: Dynamic; readonly value405: Dynamic; readonly value406: Dynamic; readonly value408: Dynamic; readonly value409: Dynamic; readonly value414: Dynamic; readonly value415: Dynamic; readonly value427: Dynamic; readonly value428: Dynamic; readonly value440: Dynamic; readonly value73: Dynamic }, input?: Dynamic, options: Dynamic = false): Dynamic {
        if (deps.value427.current) return true;
        let value653: Dynamic = deps.value415(input);
        if (!value653) return false;
        if (
          value653.op.kind === "delete" &&
          value653.op.page !== undefined &&
          deps.value218.current
        )
          return true;
        deps.value427.current = value653;
        let current4: Dynamic = deps.value409.current,
          value654: Dynamic = input === "undo" ? deps.value405 : deps.value406,
          value655: Dynamic = value654.current.lastIndexOf(value653);
        value655 >= 0 && value654.current.splice(value655, 1);
        let callback15: Dynamic = (
            input2?: Dynamic,
            options2?: Dynamic,
          ): Dynamic => {
            deps.value427.current = null;
            value654.current.push(value653);
            deps.value408((input3?: Dynamic): Dynamic => input3 + 1);
            deps.showToast(input2, options2);
          },
          callback16: Dynamic = (): Dynamic => {
            let value656: Dynamic =
              value653.op.kind === "delete" ? value653.op.page : undefined;
            return value656 === undefined
              ? undefined
              : (0, pageUndoFailureMessage)(
                  input,
                  value656.relisted === true &&
                    (deps.value73.current.pages ?? []).some(
                      (input2?: Dynamic): Dynamic =>
                        input2.id === value656.spec.id,
                    ),
                );
          };
        deps.value414(value653.op, input)
          .then((input2?: Dynamic): Dynamic => {
            if (input2 === "full") {
              callback15(
                (0, clipboardActionFailureMessage)(
                  input,
                  PlatformFileContentLimit_5,
                  value653.op.kind === "ann-add" ||
                    value653.op.kind === "ann-delete"
                    ? value653.op.spec
                    : undefined,
                  callback16(),
                  options,
                ),
                "warning",
              );
              return;
            }
            if (input2 === "nothing") {
              deps.value427.current = null;
              deps.value408((input3?: Dynamic): Dynamic => input3 + 1);
              let value659: Dynamic = (0,
                canvasHistoryAnnouncementMode)(
                  input,
                  value653.bound !== undefined,
                  options,
                ),
                callback17: Dynamic = (): Dynamic =>
                  (0, announce)(
                    NothingChangedThatStepNoLongerMessage,
                  );
              value659 === "partner"
                ? deps.value428(value653.bound, input, callback17)
                : value659 === "say" && callback17();
              return;
            }
            let value656: Dynamic =
              value653.op.kind === "delete" && input === "undo"
                ? {
                    ...value653,
                    depths: [
                      ...value653.depths.filter(
                        ([input3]: Dynamic): Dynamic =>
                          value653.op.kind !== "delete" ||
                          !value653.op.entries.some(
                            (input4?: Dynamic): Dynamic =>
                              input4.file === input3,
                          ),
                      ),
                      ...value653.op.entries.map(
                        (input3?: Dynamic): Dynamic => [
                          input3.file,
                          deps.value440.current.get(input3.file) ?? 0,
                        ],
                      ),
                    ],
                  }
                : value653;
            (input === "redo" || deps.value409.current === current4) &&
              (input === "undo" ? deps.value406 : deps.value405).current.push({
                ...value656,
                sealed: true,
              });
            deps.value408((input3?: Dynamic): Dynamic => input3 + 1);
            let state: Dynamic = {
                rename: "Artboard rename",
                resize: "Artboard resize",
                print: "Print mode change",
                paper: "Paper change",
                guides: "Layout guide change",
                radius: "Corner radius change",
                cover: "Thumbnail change",
                order: "Artboard order change",
                "ann-add": "New note",
                "ann-delete": "Note delete",
                "ann-move": "Note move",
                "ann-resize": "Note resize",
                "ann-text": "Note edit",
                "ann-style": "Note style",
                "ann-box": "Shape move/resize",
                "ann-path": "Edit path",
                "ann-color": "Shape color",
                "ann-css": "Style",
                "ann-heads": "Arrowhead change",
                "ann-src": "Picture replace",
                "ann-crop": "Crop",
                "page-add": "Page change",
                "page-rename": "Page change",
                tweak: "Tweak",
              },
              state2: Dynamic = {
                move: [uiMessage("canvas.designCanvas.artboardMove"), uiMessage("canvas.designCanvas.artboardMoves")],
                add: [uiMessage("canvas.designCanvas.newArtboard"), uiMessage("canvas.designCanvas.newArtboards")],
                delete: [uiMessage("canvas.designCanvas.artboardDelete"), uiMessage("canvas.designCanvas.artboardDeletes")],
              },
              state3: Dynamic = {
                move: "Move",
                add: "Duplicate",
                delete: "Delete",
              },
              op2: Dynamic = value653.op,
              value657: Dynamic =
                op2.kind === "move"
                  ? op2.moves.length
                  : op2.kind === "add" || op2.kind === "delete"
                    ? op2.entries.length
                    : 0,
              value658: Dynamic =
                op2.kind === "delete" && op2.page !== undefined
                  ? uiMessage("canvas.designCanvas.pageDelete")
                  : op2.kind === "move" ||
                      op2.kind === "add" ||
                      op2.kind === "delete"
                    ? (op2.anns?.length ?? 0) > 0
                      ? (op2.kind === "add" && op2.label) || state3[op2.kind]
                      : value657 === 1
                        ? state2[op2.kind][0]
                        : String(value657) + " " + state2[op2.kind][1]
                    : (op2.kind === "ann-add" || op2.kind === "ann-delete") &&
                        (0, isShapeAnnotation)(op2.spec)
                      ? op2.spec.kind === "image"
                        ? op2.spec.video !== undefined
                          ? op2.kind === "ann-add"
                            ? uiMessage("canvas.designCanvas.newVideo")
                            : uiMessage("canvas.designCanvas.videoDelete")
                          : op2.kind === "ann-add"
                            ? uiMessage("canvas.designCanvas.newPicture")
                            : uiMessage("canvas.designCanvas.pictureDelete")
                        : op2.kind === "ann-add"
                          ? uiMessage("canvas.designCanvas.newShape")
                          : uiMessage("canvas.designCanvas.shapeDelete")
                      : op2.kind === "transform"
                        ? op2.label
                        : op2.kind === "ann-box" &&
                            "w" in op2.from &&
                            "w" in op2.to &&
                            op2.from.x === op2.to.x &&
                            op2.from.y === op2.to.y &&
                            op2.from.w === op2.to.w &&
                            op2.from.h === op2.to.h
                          ? "Rotate"
                          : op2.kind === "ann-src" &&
                              (op2.from.video !== undefined ||
                                op2.to.video !== undefined)
                            ? uiMessage("canvas.designCanvas.videoReplace")
                            : op2.kind === "ann-box" &&
                                (deps.value73.current.annotations ?? []).some(
                                  (source?: Dynamic): Dynamic =>
                                    source.id === op2.id &&
                                    source.kind === "image",
                                )
                              ? (deps.value73.current.annotations ?? []).some(
                                  (source?: Dynamic): Dynamic =>
                                    source.id === op2.id &&
                                    source.kind === "image" &&
                                    source.video !== undefined,
                                )
                                ? uiMessage("canvas.designCanvas.videoMoveResize")
                                : uiMessage("canvas.designCanvas.pictureMoveResize")
                              : state[op2.kind];
            deps.value188(
              input2 === false
                ? uiMessage("canvas.designCanvas.thatArtboardIsnTOpen")
                : value658 + (input === "undo" ? " undone." : " redone."),
            );
            deps.value427.current = null;
            value653.bound !== undefined &&
              input2 !== false &&
              deps.value409.current === current4 &&
              deps.value428(value653.bound, input);
          })
          .catch((input2?: Dynamic): Dynamic => {
            let value656: Dynamic = callback16();
            callback15(
              value656 !== undefined
                ? value656 + (0, errorMessage)(input2)
                : uiMessage("canvas.designCanvas.couldnTUndoTheArtboard") + String(input2),
              "error",
            );
          });
        return true;
      }

/** 首次渲染时惰性创建一次：建立跨画板的会话历史（createSessionHistory）及其宿主，负责保护当前页、丢弃过期条目与播报撤销目标。 */
export function initSessionHistoryKeeper(deps: { readonly callback2: Dynamic; readonly value177: Dynamic; readonly value19: Dynamic; readonly value218: Dynamic; readonly value275: Dynamic; readonly value285: Dynamic; readonly value427: Dynamic; readonly value434: Dynamic; readonly value435: Dynamic; readonly value436: Dynamic; readonly value437: Dynamic; readonly value448: Dynamic; readonly value70: Dynamic; readonly value80: Dynamic }): Dynamic {
    let callback15: Dynamic = (input?: Dynamic): Dynamic =>
        deps.value70.current?.artboards.some(
          (input2?: Dynamic): Dynamic => input2.file === input,
        ) === true && deps.value435.current.content().files[input] !== undefined,
      callback16: Dynamic = (input?: Dynamic): Dynamic => {
        let current4: Dynamic = deps.value70.current,
          value655: Dynamic = current4?.artboards.find(
            (input2?: Dynamic): Dynamic => input2.file === input,
          );
        return current4 && value655
          ? (0, designPageId)(value655, current4.pages)
          : undefined;
      },
      state: Dynamic = {
        changed: [],
        other: [],
      },
      value653: Dynamic,
      callback17: Dynamic = (): Dynamic => {
        clearTimeout(value653);
        value653 = undefined;
        state.changed.length = 0;
        state.other.length = 0;
      },
      value654: Dynamic = (0, createSessionHistory)({
        inDocument: callback15,
        isProtected: (input?: Dynamic): Dynamic =>
          callback16(input) === deps.value80.current ||
          deps.value434.current?.undoFile() === input ||
          deps.value434.current?.redoFile() === input,
        now: (): Dynamic => performance.now(),
        onDrop: (input?: Dynamic, options?: Dynamic): Dynamic => {
          deps.value434.current?.forget(input);
          if (
            !(0, CanvasWorkingStateHas)(options) ||
            ((options === "changed" ? state.changed : state.other).push(
              deps.callback2(input),
            ),
            value653 !== undefined)
          )
            return;
          let current4: Dynamic = deps.value435.current;
          value653 = setTimeout((): Dynamic => {
            value653 = undefined;
            if (deps.value435.current !== current4) return callback17();
            let { message: value655, description: value656 }: Dynamic = (0,
            summarizeChangedArtboards)(
              state.changed.splice(0),
              state.other.splice(0),
            );
            deps.value437.current(
              value655,
              "warning",
              value656 === undefined
                ? undefined
                : {
                    description: value656,
                  },
            );
          }, 50);
        },
      });
    return {
      keeper: value654,
      host: {
        inDocument: callback15,
        openPage: (): Dynamic => deps.value80.current,
        pageOfFile: callback16,
        isFramed: (input?: Dynamic): Dynamic =>
          deps.value70.current?.artboards.some(
            (input2?: Dynamic): Dynamic =>
              input2.file === input && !input2.frameless,
          ) === true,
        startLoad: (input?: Dynamic): Dynamic => {
          let entry: Dynamic = deps.value177.current.get(input);
          (0, recordSessionLoadStart)(
            value654,
            input,
            entry
              ? (): Dynamic => entry.ensureModel(deps.value19(input))
              : undefined,
          );
        },
        mayShowPage: (): Dynamic =>
          !deps.value218.current && deps.value427.current === null && !deps.value285.current,
        currentSrc: (input?: Dynamic): Dynamic =>
          deps.value435.current.content().files[input],
        afterExitGuard: deps.value275,
        switchPage: (input?: Dynamic, options?: Dynamic): Dynamic =>
          deps.value436.current(input, options),
        say: (source?: Dynamic): Dynamic => {
          source.kind === "loading"
            ? (0, announce)(
                (0, pendingUndoAnnouncement)(
                  source.dir,
                  deps.callback2(source.file),
                ),
              )
            : deps.value448.current?.(
                (0, undoTargetAnnouncement)(
                  source.dir,
                  deps.value70.current?.pages?.find(
                    (input?: Dynamic): Dynamic => input.id === source.page,
                  )?.name ?? uiMessage("canvas.designCanvas.page1"),
                ),
              );
        },
      },
      cancelSaid: callback17,
    };
  }
