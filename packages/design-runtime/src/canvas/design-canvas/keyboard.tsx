import { AccessibilityAnnouncementsUndoRedoConfig } from "../../editor/accessibility/announcements";
import { ClipboardFileTransferRegistry } from "../../editor/clipboard/file-transfer";
import { CutValue } from "../../editor/accessibility/announcements";
import { DeletedValue } from "../../editor/accessibility/announcements";
import { activeCropElement } from "../../editor/session/element-state";
import { announce } from "../../editor/accessibility/announcer";
import { artboardNotSelectedAnnouncement } from "../../editor/accessibility/announcements";
import { blockingOverlaySelector } from "../../editor/chrome/overlay-state";
import { boardSelectionCount } from "../../editor/selection/canvas-selection";
import { canvasBoardSelection } from "../../editor/selection/canvas-selection";
import { emptyBoardSelection } from "../../editor/selection/canvas-selection";
import { emptyCanvasSelection } from "../../editor/selection/canvas-selection";
import { flipAnnotations } from "../../editor/geometry/flip-annotations";
import { flipDirectionAnnouncement } from "../../editor/accessibility/announcements";
import { focusedOutlineRow } from "../../editor/keyboard/find";
import { getActiveClipboardSource } from "../../editor/clipboard/state";
import { getAnnotationClipboard } from "../../editor/clipboard/state";
import { getArtboardClipboard } from "../../editor/clipboard/state";
import { hasBlockingEditorOverlay } from "../../editor/text/typing-target";
import { hasHeldUndoOverlay } from "../../editor/text/typing-target";
import { isApplePlatform } from "../../editor/keyboard/shortcuts";
import { isCanvasEnterAction } from "../../editor/keyboard/paste";
import { isContextMenuShortcut } from "../../editor/keyboard/edit-actions";
import { isEditingInputTarget } from "../../editor/keyboard/find";
import { isEmptyCanvasSelection } from "../../editor/selection/canvas-selection";
import { isInteractivePreviewTarget } from "../preview-navigation";
import { isPropertyEditorTarget } from "../../editor/keyboard/find";
import { keyboardNudgeDelta } from "../working-state";
import { keyboardShortcutLabel } from "../../editor/keyboard/shortcuts";
import { pointerCoordinates } from "../paste-placement";
import { selectionActionRefusalAnnouncement } from "../../editor/accessibility/announcements";
import { selectionFromBoards } from "../../editor/selection/canvas-selection";
import { selectionNavigationScope } from "../working-state";
import { sessionAllowsMutation } from "../working-state";
import { startClipboardMark } from "../../editor/clipboard/state";
import { suppressNativeContextMenu } from "../../editor/outline/native-menu";
import { type Dynamic } from "../../runtime-types";
import { uiMessage } from "@minedesign/contracts/ui-messages";
import { zoomAnnouncement } from "../../editor/accessibility/announcements";
import { canvasSelectionsEqual, hasActiveUserGesture } from "../design-canvas";

/** 画布命令分发器：按命令名处理 Escape、取消选择、选择导航、撤销/重做、剪切/删除、翻转、播放等，供键盘路由与预览消息调用，返回是否已处理。 */
export function dispatchCanvasCommand(deps: { readonly abandonSelectionGesture: Dynamic; readonly applyCanvasSelection: Dynamic; readonly count: Dynamic; readonly focusedFileRef: Dynamic; readonly selectionRef: Dynamic; readonly value106: Dynamic; readonly value109: Dynamic; readonly value137: Dynamic; readonly value139: Dynamic; readonly value145: Dynamic; readonly value146: Dynamic; readonly value148: Dynamic; readonly value151: Dynamic; readonly value155: Dynamic; readonly value161: Dynamic; readonly value188: Dynamic; readonly value192: Dynamic; readonly value218: Dynamic; readonly value224: Dynamic; readonly value29: Dynamic; readonly value31: Dynamic; readonly value430: Dynamic; readonly value432: Dynamic; readonly value448: Dynamic; readonly value464: Dynamic; readonly value470: Dynamic; readonly value48: Dynamic; readonly value51: Dynamic; readonly value56: Dynamic; readonly value61: Dynamic; readonly value73: Dynamic }, input?: Dynamic,
        options?: Dynamic,
        context: Dynamic = false,
        value653?: Dynamic): Dynamic {
        let callback15: Dynamic = (): Dynamic => (
          context && (0, startClipboardMark)().drop(),
          true
        );
        if (input === "artboard") {
          let current4: Dynamic = deps.focusedFileRef.current;
          return current4 == null
            ? false
            : (deps.value29.current(current4, false), true);
        }
        if (input === "escape") return !context && deps.value61.current();
        if (input === "deselect") {
          let current4: Dynamic = deps.focusedFileRef.current,
            value654: Dynamic =
              deps.value48.current > 0 ||
              (deps.value31.current != null &&
                Date.now() - deps.value31.current.at < deps.count);
          return context ||
            current4 == null ||
            !value654 ||
            !deps.selectionRef.current.elements.has(current4)
            ? false
            : (deps.value51((): Dynamic => {
                deps.abandonSelectionGesture();
                deps.applyCanvasSelection(emptyCanvasSelection);
              }),
              true);
        }
        if (
          input === "enter" ||
          input === "parent" ||
          input === "next" ||
          input === "prev" ||
          input === "a" ||
          input === "nudge"
        ) {
          if (context || !deps.value137) return false;
          if (input === "nudge") {
            if (!value653) return false;
            deps.value56.current({
              kind: "nudge",
              dx: value653.dx,
              dy: value653.dy,
              repeat: value653.repeat,
            });
          } else if (input === "a") {
            if (
              (0, selectionNavigationScope)(
                deps.selectionRef.current,
                false,
              ) === "panel"
            )
              return false;
            deps.value56.current({
              kind: "all",
            });
          } else
            deps.value56.current({
              kind: input,
            });
          return true;
        }
        if (input === "z" || input === "Z") {
          let value654: Dynamic = input === "Z" ? "redo" : "undo";
          if (
            (0, hasHeldUndoOverlay)() ||
            deps.value432.current?.busy() ||
            deps.value155.current > 0
          )
            return true;
          deps.value192.current(value654);
          if (deps.value430.current.reachable(value654)) {
            deps.value430.current.apply(value654);
            return true;
          }
          let current4: Dynamic = deps.value432.current;
          if (!current4) return true;
          let value655: Dynamic =
            value654 === "undo" ? current4.undo() : current4.redo();
          value655 === "skipped-all"
            ? deps.value448.current?.(
                uiMessage("canvas.designCanvas.nothingLeftTo") +
                  value654 +
                  " \u2014 that artboard's history changed.",
              )
            : value655 === "empty" &&
              (0, announce)(
                AccessibilityAnnouncementsUndoRedoConfig[value654],
              );
          return true;
        }
        if (input === "v") {
          if (
            options?.seen.artboards != null &&
            (0, getActiveClipboardSource)(options.seen) ===
              "foreign-artboards"
          ) {
            if (!deps.value224.current) return false;
            if (
              hasActiveUserGesture() &&
              !(0, hasBlockingEditorOverlay)()
            ) {
              let current4: Dynamic = deps.focusedFileRef.current,
                value658: Dynamic =
                  current4 == null
                    ? null
                    : deps.value106.current?.querySelector(
                        `[data-mega-artboard="${CSS.escape(current4)}"] :is([data-mega-chrome="expand"], [data-mega-chrome="play"])`,
                      );
              value658
                ? value658.focus({
                    preventScroll: true,
                  })
                : (document as Dynamic).activeElement?.blur();
              (window as Dynamic).focus();
              deps.value188(
                ClipboardFileTransferRegistry.pressAgain(
                  (0, keyboardShortcutLabel)("V"),
                ),
              );
            }
            return true;
          }
          let value654: Dynamic =
            hasActiveUserGesture() && !(0, hasBlockingEditorOverlay)()
              ? deps.value109()
              : null;
          if (value654 == null) return false;
          let value655: Dynamic = (0, getAnnotationClipboard)();
          if (value654.overAnnotation && value655.length === 0) return false;
          let value656: Dynamic = (0, getActiveClipboardSource)(
            options?.seen ?? {
              text: "",
              stamp: null,
              hasImage: false,
            },
          );
          if (value656 === "text") return false;
          let value657: Dynamic = (0, getArtboardClipboard)();
          if (value656 === "artboards" && value657)
            deps.value464.current(
              value657,
              value655,
              (0, pointerCoordinates)(value654),
            );
          else {
            if (value654.overAnnotation) return false;
            deps.value470.current(value654, "");
          }
          return true;
        }
        if (
          input === "d" &&
          (deps.value155.current > 0 || (deps.value137 && deps.value48.current > 0))
        )
          return true;
        if (input === "x" && deps.value137 && deps.value48.current > 0)
          return callback15();
        if (!deps.value137) return false;
        if (input === "c") {
          if (deps.value48.current === 0) return deps.value139();
          let value654: Dynamic = (0, startClipboardMark)();
          deps.value51((): Dynamic => {
            deps.value139(value654);
          }, value654.drop);
          return true;
        }
        if (input === "x")
          return (0, sessionAllowsMutation)({
            gesturing: deps.value218.current,
            setMoveCommits: deps.value155.current,
          })
            ? deps.value139()
              ? (deps.value145(CutValue, {
                  elementsOnly: true,
                }),
                true)
              : false
            : callback15();
        if (input === "delete" || input === "delete-while-writing")
          return input === "delete-while-writing" &&
            deps.value48.current === 0 &&
            !(
              deps.value31.current != null &&
              Date.now() - deps.value31.current.at < deps.count
            )
            ? false
            : (deps.value51((): Dynamic => {
                if (context) {
                  let value654: Dynamic = (0, canvasBoardSelection)(
                    deps.selectionRef.current,
                  );
                  deps.value145(DeletedValue, {
                    elementsOnly: true,
                  }) &&
                    (0, boardSelectionCount)(value654) > 0 &&
                    deps.value161(
                      uiMessage("canvas.designCanvas.theArtboardsAndNotesStay"),
                    );
                } else deps.value146();
              }),
              true);
        if (input === "flip-horizontal" || input === "flip-vertical") {
          let value654: Dynamic = context
              ? (0, canvasBoardSelection)(deps.selectionRef.current)
              : emptyBoardSelection,
            value655: Dynamic =
              ((0, isApplePlatform)() ? "\u21E7" : "Shift+") +
              (input === "flip-horizontal" ? "H" : "V"),
            value656: Dynamic =
              input === "flip-horizontal" ? "horizontal" : "vertical",
            current4: Dynamic = deps.selectionRef.current,
            callback16: Dynamic = (
              input2?: Dynamic,
              options2?: Dynamic,
            ): Dynamic =>
              input2.artboards.size === options2.artboards.size &&
              input2.notes.size === options2.notes.size &&
              input2.elements.size === options2.elements.size &&
              [...input2.artboards].every(
                (input3?: Dynamic): Dynamic => options2.artboards.has(input3),
              ) &&
              [...input2.notes].every(
                (input3?: Dynamic): Dynamic => options2.notes.has(input3),
              ) &&
              [...input2.elements].every(
                ([input3, input4]: Dynamic): Dynamic =>
                  options2.elements.get(input3)?.tids.join() ===
                  input4.tids.join(),
              );
          deps.value151(
            value656,
            context
              ? {
                  elementsOnly: true,
                  then: (input2?: Dynamic, options2?: Dynamic): Dynamic =>
                    !deps.value224.current ||
                    !callback16(current4, deps.selectionRef.current) ||
                    (0, flipAnnotations)(
                      (deps.value73.current.annotations ?? []).filter(
                        (input3?: Dynamic): Dynamic =>
                          value654.notes.has(input3.id),
                      ),
                      value656,
                    ).flips.length === 0
                      ? false
                      : (deps.abandonSelectionGesture(),
                        deps.applyCanvasSelection(
                          (0, selectionFromBoards)(value654),
                        ),
                        deps.value161(
                          (input2 !== undefined
                            ? input2 + " "
                            : options2
                              ? (0, flipDirectionAnnouncement)(
                                  value656,
                                ) + ". "
                              : "") +
                            uiMessage("canvas.designCanvas.press") +
                            value655 +
                            " again to flip what is outside the artboards, which stays selected.",
                        ),
                        true),
                }
              : {},
          );
          return true;
        }
        if (input === "d") {
          let value654: Dynamic = context
            ? (0, canvasBoardSelection)(deps.selectionRef.current)
            : emptyBoardSelection;
          deps.value148(
            context
              ? {
                  elementsOnly: true,
                }
              : {},
          ) &&
            (0, boardSelectionCount)(value654) > 0 &&
            (deps.applyCanvasSelection((0, selectionFromBoards)(value654)),
            deps.value161(
              uiMessage("canvas.designCanvas.theArtboardsAndNotesStay2") +
                (0, keyboardShortcutLabel)("D") +
                " again to copy them",
            ));
          return true;
        }
        return false;
      }

/** 挂载时注册的全局 keydown 处理：处理 Escape、Delete/Backspace、Enter、方向键微移、层级前后移动与右键菜单快捷键，避开输入框、弹层和交互预览。 */
export function subscribeCanvasKeyDown(deps: { readonly abandonSelectionGesture: Dynamic; readonly focusedFileRef: Dynamic; readonly pendingFrameSelectionRef: Dynamic; readonly selectionEpochRef: Dynamic; readonly selectionRef: Dynamic; readonly value106: Dynamic; readonly value125: Dynamic; readonly value147: Dynamic; readonly value152: Dynamic; readonly value155: Dynamic; readonly value159: Dynamic; readonly value21: Dynamic; readonly value218: Dynamic; readonly value224: Dynamic; readonly value279: Dynamic; readonly value295: Dynamic; readonly value32: Dynamic; readonly value33: Dynamic; readonly value339: Dynamic; readonly value345: Dynamic; readonly value404: Dynamic; readonly value42: Dynamic; readonly value459: Dynamic; readonly value48: Dynamic; readonly value52: Dynamic; readonly value552: Dynamic; readonly value56: Dynamic; readonly value61: Dynamic; readonly value73: Dynamic }): Dynamic {
    let callback15: Dynamic = (): Dynamic => {
        let current4: Dynamic = deps.selectionRef.current;
        !deps.value224.current ||
          deps.value218.current ||
          (0, hasBlockingEditorOverlay)() ||
          (0, isEmptyCanvasSelection)(current4) ||
          (current4.elements.size > 0
            ? deps.value147.current(DeletedValue)
            : deps.value459.current((0, canvasBoardSelection)(current4)));
      },
      callback16: Dynamic = (event?: Dynamic): Dynamic => {
        if (event.defaultPrevented || !deps.value224.current || deps.value345.current)
          return;
        let current4: Dynamic = deps.selectionRef.current,
          value653: Dynamic =
            event.key === "Escape" &&
            (0, isEmptyCanvasSelection)(current4) &&
            deps.value125.current != null,
          value654: Dynamic =
            deps.focusedFileRef.current != null &&
            current4.elements.has(deps.focusedFileRef.current),
          value655: Dynamic = event.metaKey || event.ctrlKey,
          value656: Dynamic =
            (event.key === "Delete" || event.key === "Backspace") &&
            !value655,
          value657: Dynamic =
            value656 && deps.value32.current?.gen === deps.selectionEpochRef.current
              ? deps.value32.current
              : null,
          value658: Dynamic =
            value657 != null ||
            (value656 &&
              value654 &&
              deps.pendingFrameSelectionRef.current != null &&
              deps.pendingFrameSelectionRef.current.file ===
                deps.focusedFileRef.current),
          value659: Dynamic =
            event.target instanceof Element
              ? event.target.closest("[data-mega-title-text]")
              : null,
          value660: Dynamic =
            value659
              ?.closest("[data-mega-artboard]")
              ?.getAttribute("data-mega-artboard") ?? null,
          value661: Dynamic =
            value659 != null &&
            value659.closest("[data-mega-inside]") == null &&
            value660 != null &&
            (current4.artboards.has(value660) ||
              current4.elements.has(value660)),
          value662: Dynamic =
            current4.artboards.size +
              current4.notes.size +
              current4.elements.size >
            1,
          value663: Dynamic =
            value661 &&
            event.key === "Enter" &&
            !value655 &&
            !event.altKey &&
            !(0, hasBlockingEditorOverlay)() &&
            !deps.value218.current &&
            (event.shiftKey ? current4.elements.size > 0 : value662),
          value664: Dynamic =
            value655 || event.altKey
              ? null
              : (0, keyboardNudgeDelta)(event.key, event.shiftKey),
          value665: Dynamic = value664 != null && deps.value159.current,
          callback17: Dynamic = (input?: Dynamic): Dynamic =>
            input instanceof Element &&
            ((0, isEditingInputTarget)(input) ||
              input.closest(
                "[data-mega-chrome],[data-mega-title-text],[data-mega-piece],button,[role=button],a[href],input,textarea,select",
              ) != null),
          callback18: Dynamic = (input?: Dynamic): Dynamic =>
            input instanceof Element
              ? (0, isEditingInputTarget)(input) ||
                (0, isInteractivePreviewTarget)(input) ||
                input.closest(
                  '[data-mega-inside],[data-mega-selection-strip],[aria-haspopup="menu"],[aria-haspopup="listbox"],input,textarea,select',
                ) != null
                ? true
                : value659 != null
                  ? !value661
                  : input.closest("[data-mega-chrome]") != null
              : false;
        if (
          value655 &&
          !event.shiftKey &&
          !event.altKey &&
          event.key.toLowerCase() === "a"
        ) {
          if (
            value654 ||
            callback18(event.target) ||
            (0, hasBlockingEditorOverlay)() ||
            deps.value218.current
          )
            return;
          event.preventDefault();
          event.stopPropagation();
          deps.value56.current({
            kind: "all",
          });
          return;
        }
        let value666: Dynamic =
          value655 || event.altKey || !event.shiftKey
            ? null
            : event.key.toLowerCase() === "h"
              ? "horizontal"
              : event.key.toLowerCase() === "v"
                ? "vertical"
                : null;
        if (
          value666 !== null &&
          !value654 &&
          !(0, isEmptyCanvasSelection)(current4)
        ) {
          if (
            event.repeat ||
            (0, isEditingInputTarget)(event.target) ||
            (0, hasBlockingEditorOverlay)() ||
            (event.target instanceof Element &&
              event.target.closest('[data-mega-chrome="selection-menu"]'))
          )
            return;
          if (
            event.target instanceof Element &&
            (event.target.hasAttribute("data-mega-title-text") ||
              event.target.hasAttribute("data-mega-piece"))
          ) {
            let value673: Dynamic = event.target
              .closest("[data-mega-artboard]")
              ?.getAttribute("data-mega-artboard");
            if (
              value673 != null &&
              !current4.artboards.has(value673) &&
              !current4.elements.has(value673)
            ) {
              event.preventDefault();
              (0, announce)(
                (0, artboardNotSelectedAnnouncement)(
                  deps.value73.current.artboards.find(
                    (input?: Dynamic): Dynamic => input.file === value673,
                  )?.title ?? value673.replace(/\.dc\.html$/, ""),
                ),
              );
              return;
            }
          }
          if (!deps.value152.current(value666)) return;
          event.preventDefault();
          event.stopPropagation();
          return;
        }
        let value667: Dynamic =
            event.target instanceof Element ? event.target : null,
          value668: Dynamic =
            value667?.closest("[data-mega-inside]") != null
              ? null
              : (value667
                  ?.closest("[data-mega-title-text],[data-mega-piece]")
                  ?.closest("[data-mega-artboard]")
                  ?.getAttribute("data-mega-artboard") ?? null);
        if (
          (0, isContextMenuShortcut)(event) &&
          !value655 &&
          !event.altKey &&
          (value668 != null ||
            (current4.elements.size === 0 &&
              current4.artboards.size + current4.notes.size > 0))
        ) {
          if (
            (value668 == null &&
              ((0, isEditingInputTarget)(value667) ||
                value667?.closest(
                  "button,[role=button],[role=treeitem],[role=textbox],[data-mega-selection-strip],.tb-root",
                ) != null)) ||
            (0, hasBlockingEditorOverlay)() ||
            deps.value218.current
          )
            return;
          let value673: Dynamic = value668 ?? [...current4.artboards][0],
            value674: Dynamic = [...current4.notes][0] ?? "",
            current5: Dynamic = deps.value106.current,
            value675: Dynamic = current5?.querySelector(
              value673 !== undefined
                ? `[data-mega-artboard="${CSS.escape(value673)}"] :is([data-mega-chrome="title"], [data-mega-piece])`
                : `[data-mega-annotation="${CSS.escape(value674)}"]`,
            );
          if (
            current5 == null ||
            value675 == null ||
            (event.preventDefault(),
            event.stopPropagation(),
            (0, suppressNativeContextMenu)(false),
            event.repeat)
          )
            return;
          let [items, items2]: Dynamic = [
              value675.getBoundingClientRect(),
              current5.getBoundingClientRect(),
            ],
            callback19: Dynamic = (
              input?: Dynamic,
              options?: Dynamic,
              context?: Dynamic,
            ): Dynamic => Math.min(Math.max(input, options + 8), context - 8),
            value676: Dynamic =
              value673 !== undefined
                ? {
                    x: items.left,
                    y: items.bottom,
                  }
                : {
                    x: items.left + Math.min(40, items.width / 2),
                    y: items.top + Math.min(24, items.height / 2),
                  };
          deps.value295.current(
            value673 !== undefined
              ? {
                  kind: "artboard",
                  file: value673,
                }
              : {
                  kind: "object",
                  id: value674,
                },
            {
              x: callback19(value676.x, items2.left, items2.right),
              y: callback19(value676.y, items2.top, items2.bottom),
              keyboard: true,
            },
          );
          return;
        }
        if (
          ((0, isEmptyCanvasSelection)(current4) || value654) &&
          !value658 &&
          !value653 &&
          !value663 &&
          !value665
        )
          return;
        if (event.key === "Enter" && !value655 && !event.altKey) {
          if (
            !(
              event.target == null ||
              event.target === (document as Dynamic).body ||
              event.target === (document as Dynamic).documentElement ||
              (0, isCanvasEnterAction)(event) ||
              value663
            ) ||
            (0, hasBlockingEditorOverlay)() ||
            deps.value218.current
          )
            return;
          if (event.shiftKey) {
            if (current4.elements.size === 0) return;
            event.preventDefault();
            event.stopPropagation();
            deps.value56.current({
              kind: "parent",
            });
            return;
          }
          if (
            current4.notes.size === 0 &&
            current4.elements.size === 0 &&
            current4.artboards.size === 1
          ) {
            let [artboards]: Dynamic = current4.artboards;
            if (
              artboards == null ||
              deps.value73.current.artboards.find(
                (input?: Dynamic): Dynamic => input.file === artboards,
              )?.frameless
            )
              return;
            event.preventDefault();
            artboards !== deps.focusedFileRef.current &&
              (0, isCanvasEnterAction)(event) &&
              (deps.value552.refocusAt = Date.now());
            deps.value42.current(artboards);
            return;
          }
          event.preventDefault();
          event.stopPropagation();
          deps.value56.current({
            kind: "enter",
          });
          return;
        }
        if (event.key === "Tab" && !value655 && !event.altKey) {
          if (
            current4.elements.size === 0 ||
            callback17(event.target) ||
            (0, hasBlockingEditorOverlay)() ||
            deps.value218.current ||
            (0, activeCropElement)() !== null ||
            (event.target != null &&
              event.target !== (document as Dynamic).body &&
              event.target !== (document as Dynamic).documentElement)
          )
            return;
          event.preventDefault();
          event.stopPropagation();
          deps.value56.current({
            kind: event.shiftKey ? "prev" : "next",
          });
          return;
        }
        if (value664) {
          if (
            callback18(event.target) ||
            (0, hasBlockingEditorOverlay)() ||
            deps.value218.current
          )
            return;
          event.preventDefault();
          event.stopPropagation();
          deps.value56.current({
            kind: "nudge",
            ...value664,
            repeat: event.repeat,
          });
          return;
        }
        let value669: Dynamic =
          event.metaKey || (event.ctrlKey && !event.altKey)
            ? null
            : event.key === "]"
              ? "front"
              : event.key === "["
                ? "back"
                : null;
        if (
          value669 !== null &&
          current4.artboards.size > 0 &&
          current4.elements.size === 0
        ) {
          let value673: Dynamic =
            event.target instanceof Element ? event.target : null;
          if (
            (0, isEditingInputTarget)(value673) ||
            value673?.closest(
              '[role=textbox],[role=searchbox],[role=combobox],[data-mega-selection-strip],[data-mega-chrome="selection-menu"]',
            ) != null
          )
            return;
          let value674: Dynamic = value673
            ?.closest("[data-mega-title-text],[data-mega-piece]")
            ?.closest("[data-mega-artboard]")
            ?.getAttribute("data-mega-artboard");
          if (
            (value674 != null && !current4.artboards.has(value674)) ||
            (0, hasBlockingEditorOverlay)() ||
            !(0, sessionAllowsMutation)({
              gesturing: deps.value218.current,
              setMoveCommits: deps.value155.current,
            }) ||
            (event.preventDefault(), event.stopPropagation(), event.repeat)
          )
            return;
          deps.value52.current((): Dynamic => {
            let current5: Dynamic = deps.selectionRef.current;
            !deps.value224.current ||
              (0, hasBlockingEditorOverlay)() ||
              current5.artboards.size === 0 ||
              current5.elements.size > 0 ||
              !(0, sessionAllowsMutation)({
                gesturing: deps.value218.current,
                setMoveCommits: deps.value155.current,
              }) ||
              deps.value404.current(current5.artboards, value669);
          });
          return;
        }
        if (
          event.key !== "Delete" &&
          event.key !== "Backspace" &&
          event.key !== "Escape"
        )
          return;
        let target: Dynamic = event.target,
          value670: Dynamic =
            target instanceof HTMLElement &&
            (/^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName) ||
              target.isContentEditable),
          value671: Dynamic =
            target instanceof Element &&
            target.closest(
              "[data-tweak-popup],[data-popover-primitive]," +
                blockingOverlaySelector,
            ) != null;
        if (
          (0, isEditingInputTarget)(target) &&
          !(
            event.key === "Escape" &&
            (0, isPropertyEditorTarget)(target) &&
            !value670 &&
            !value671
          )
        )
          return;
        if (event.key === "Escape") {
          if (
            deps.value339.current !== "select" ||
            (value653 && (0, hasBlockingEditorOverlay)())
          )
            return;
          if (deps.value61.current()) {
            event.preventDefault();
            return;
          }
          event.preventDefault();
          let callback19: Dynamic = (): Dynamic => {
            deps.abandonSelectionGesture();
            value653
              ? deps.value279.current()
              : deps.value33.current(emptyCanvasSelection);
          };
          !value653 && deps.value48.current > 0
            ? deps.value52.current(callback19)
            : callback19();
          return;
        }
        if (
          (0, hasBlockingEditorOverlay)() ||
          (event.target instanceof Element &&
            event.target.closest('[data-mega-chrome="selection-menu"]'))
        )
          return;
        if (
          event.target instanceof Element &&
          (event.target.hasAttribute("data-mega-title-text") ||
            event.target.hasAttribute("data-mega-piece"))
        ) {
          let value673: Dynamic = event.target
            .closest("[data-mega-artboard]")
            ?.getAttribute("data-mega-artboard");
          if (value673 != null && !current4.artboards.has(value673)) {
            event.preventDefault();
            let value674: Dynamic = deps.value73.current.artboards.find(
              (input?: Dynamic): Dynamic => input.file === value673,
            );
            (0, announce)(
              (0, artboardNotSelectedAnnouncement)(
                value674?.title ?? value673.replace(/\.dc\.html$/, ""),
              ),
            );
            return;
          }
        }
        let value672: Dynamic = (0, focusedOutlineRow)(event.target);
        if (value672 != null) {
          event.preventDefault();
          (0, announce)(
            (0, selectionActionRefusalAnnouncement)(
              value672.name,
              "deleted",
              value672.onRow,
              deps.value21.current(),
            ),
          );
          return;
        }
        event.preventDefault();
        event.stopPropagation();
        if (value657 != null) {
          value657.over.then(
            (): Dynamic => {
              if (
                value657.expired ||
                value657.travelled ||
                deps.value218.current ||
                !deps.value224.current
              )
                return;
              let value673: Dynamic = value657.answered
                  ? value657.after
                  : value657.kind !== "focus"
                    ? current4
                    : null,
                current5: Dynamic = deps.selectionRef.current;
              value673 == null ||
                (0, isEmptyCanvasSelection)(current5) ||
                !canvasSelectionsEqual(value673, current5) ||
                deps.value52.current(callback15);
            },
            (): Dynamic => {},
          );
          return;
        }
        deps.value52.current(callback15);
      };
    (document as Dynamic).addEventListener("keydown", callback16, true);
    return (): Dynamic =>
      (document as Dynamic).removeEventListener("keydown", callback16, true);
  }

/** 注册缩放与参考线快捷键：处理放大、缩小、适应等缩放组合键与参考线开关，并播报缩放比例。 */
export function subscribeZoomShortcuts(deps: { readonly value105: Dynamic; readonly value13: Dynamic; readonly value285: Dynamic; readonly value345: Dynamic; readonly value617: Dynamic; readonly value619: Dynamic }): Dynamic {
    let callback15: Dynamic = (input?: Dynamic): Dynamic => {
        deps.value345.current ||
          (input === "0"
            ? deps.value619()
            : deps.value617(deps.value105.get().scale * (input === "-" ? 0.8 : 1.25)),
          (0, announce)(
            (): Dynamic =>
              (0, zoomAnnouncement)(deps.value105.get().scale),
          ));
      },
      callback16: Dynamic = (event?: Dynamic): Dynamic => {
        if (
          event.defaultPrevented ||
          deps.value285.current ||
          !(event.metaKey || event.ctrlKey) ||
          event.altKey ||
          (event.key !== "0" &&
            event.key !== "=" &&
            event.key !== "+" &&
            event.key !== "-")
        )
          return;
        let target: Dynamic = event.target;
        target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.tagName === "SELECT" ||
          target.isContentEditable ||
          (event.preventDefault(),
          callback15(
            event.key === "0" ? "0" : event.key === "-" ? "-" : "+",
          ));
      },
      callback17: Dynamic = (input?: Dynamic): Dynamic =>
        callback15(input.detail.key),
      callback18: Dynamic = (): Dynamic => {
        deps.value345.current || deps.value13((input?: Dynamic): Dynamic => !input);
      },
      callback19: Dynamic = (event?: Dynamic): Dynamic => {
        event.key.toLowerCase() !== "g" ||
          !event.shiftKey ||
          event.metaKey ||
          event.ctrlKey ||
          event.altKey ||
          event.defaultPrevented ||
          event.repeat ||
          (0, isEditingInputTarget)(event.target) ||
          (0, hasBlockingEditorOverlay)() ||
          (event.preventDefault(), callback18());
      };
    (window as Dynamic).addEventListener("keydown", callback16);
    (window as Dynamic).addEventListener("keydown", callback19);
    (window as Dynamic).addEventListener("canvas-zoom-chord", callback17);
    (window as Dynamic).addEventListener("canvas-guides-toggle", callback18);
    return (): Dynamic => {
      (window as Dynamic).removeEventListener("keydown", callback16);
      (window as Dynamic).removeEventListener("keydown", callback19);
      (window as Dynamic).removeEventListener(
        "canvas-zoom-chord",
        callback17,
      );
      (window as Dynamic).removeEventListener(
        "canvas-guides-toggle",
        callback18,
      );
    };
  }
