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
export function dispatchCanvasCommand(deps: { readonly abandonSelectionGesture: Dynamic; readonly applyCanvasSelection: Dynamic; readonly count: Dynamic; readonly focusedFileRef: Dynamic; readonly selectionRef: Dynamic; readonly value106: Dynamic; readonly value109: Dynamic; readonly value137: Dynamic; readonly value139: Dynamic; readonly value145: Dynamic; readonly value146: Dynamic; readonly value148: Dynamic; readonly value151: Dynamic; readonly value155: Dynamic; readonly value161: Dynamic; readonly value188: Dynamic; readonly value192: Dynamic; readonly value218: Dynamic; readonly value224: Dynamic; readonly value29: Dynamic; readonly value31: Dynamic; readonly value430: Dynamic; readonly value432: Dynamic; readonly value448: Dynamic; readonly value464: Dynamic; readonly value470: Dynamic; readonly value48: Dynamic; readonly value51: Dynamic; readonly value56: Dynamic; readonly value61: Dynamic; readonly value73: Dynamic }, command?: Dynamic,
        clipboardInfo?: Dynamic,
        isFromPreview: Dynamic = false,
        nudgeDelta?: Dynamic): Dynamic {
        let dropClipboardMark: Dynamic = (): Dynamic => (
          isFromPreview && startClipboardMark().drop(),
          true
        );
        if (command === "artboard") {
          let focusedFile: Dynamic = deps.focusedFileRef.current;
          return focusedFile == null
            ? false
            : (deps.value29.current(focusedFile, false), true);
        }
        if (command === "escape") return !isFromPreview && deps.value61.current();
        if (command === "deselect") {
          let focusedFile: Dynamic = deps.focusedFileRef.current,
            isRecentlyActive: Dynamic =
              deps.value48.current > 0 ||
              (deps.value31.current != null &&
                Date.now() - deps.value31.current.at < deps.count);
          return isFromPreview ||
            focusedFile == null ||
            !isRecentlyActive ||
            !deps.selectionRef.current.elements.has(focusedFile)
            ? false
            : (deps.value51((): Dynamic => {
                deps.abandonSelectionGesture();
                deps.applyCanvasSelection(emptyCanvasSelection);
              }),
              true);
        }
        if (
          command === "enter" ||
          command === "parent" ||
          command === "next" ||
          command === "prev" ||
          command === "a" ||
          command === "nudge"
        ) {
          if (isFromPreview || !deps.value137) return false;
          if (command === "nudge") {
            if (!nudgeDelta) return false;
            deps.value56.current({
              kind: "nudge",
              dx: nudgeDelta.dx,
              dy: nudgeDelta.dy,
              repeat: nudgeDelta.repeat,
            });
          } else if (command === "a") {
            if (
              selectionNavigationScope(
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
              kind: command,
            });
          return true;
        }
        if (command === "z" || command === "Z") {
          let direction: Dynamic = command === "Z" ? "redo" : "undo";
          if (
            hasHeldUndoOverlay() ||
            deps.value432.current?.busy() ||
            deps.value155.current > 0
          )
            return true;
          deps.value192.current(direction);
          if (deps.value430.current.reachable(direction)) {
            deps.value430.current.apply(direction);
            return true;
          }
          let artboardHistory: Dynamic = deps.value432.current;
          if (!artboardHistory) return true;
          let historyResult: Dynamic =
            direction === "undo" ? artboardHistory.undo() : artboardHistory.redo();
          historyResult === "skipped-all"
            ? deps.value448.current?.(
                uiMessage("canvas.designCanvas.nothingLeftTo") +
                  direction +
                  " \u2014 that artboard's history changed.",
              )
            : historyResult === "empty" &&
              announce(
                AccessibilityAnnouncementsUndoRedoConfig[direction],
              );
          return true;
        }
        if (command === "v") {
          if (
            clipboardInfo?.seen.artboards != null &&
            getActiveClipboardSource(clipboardInfo.seen) ===
              "foreign-artboards"
          ) {
            if (!deps.value224.current) return false;
            if (
              hasActiveUserGesture() &&
              !hasBlockingEditorOverlay()
            ) {
              let focusedFile: Dynamic = deps.focusedFileRef.current,
                expandButton: Dynamic =
                  focusedFile == null
                    ? null
                    : deps.value106.current?.querySelector(
                        `[data-mega-artboard="${CSS.escape(focusedFile)}"] :is([data-mega-chrome="expand"], [data-mega-chrome="play"])`,
                      );
              expandButton
                ? expandButton.focus({
                    preventScroll: true,
                  })
                : (document as Dynamic).activeElement?.blur();
              (window as Dynamic).focus();
              deps.value188(
                ClipboardFileTransferRegistry.pressAgain(
                  keyboardShortcutLabel("V"),
                ),
              );
            }
            return true;
          }
          let pointerPosition: Dynamic =
            hasActiveUserGesture() && !hasBlockingEditorOverlay()
              ? deps.value109()
              : null;
          if (pointerPosition == null) return false;
          let annotationClipboard: Dynamic = getAnnotationClipboard();
          if (pointerPosition.overAnnotation && annotationClipboard.length === 0) return false;
          let clipboardSource: Dynamic = getActiveClipboardSource(
            clipboardInfo?.seen ?? {
              text: "",
              stamp: null,
              hasImage: false,
            },
          );
          if (clipboardSource === "text") return false;
          let artboardClipboard: Dynamic = getArtboardClipboard();
          if (clipboardSource === "artboards" && artboardClipboard)
            deps.value464.current(
              artboardClipboard,
              annotationClipboard,
              pointerCoordinates(pointerPosition),
            );
          else {
            if (pointerPosition.overAnnotation) return false;
            deps.value470.current(pointerPosition, "");
          }
          return true;
        }
        if (
          command === "d" &&
          (deps.value155.current > 0 || (deps.value137 && deps.value48.current > 0))
        )
          return true;
        if (command === "x" && deps.value137 && deps.value48.current > 0)
          return dropClipboardMark();
        if (!deps.value137) return false;
        if (command === "c") {
          if (deps.value48.current === 0) return deps.value139();
          let clipboardMark: Dynamic = startClipboardMark();
          deps.value51((): Dynamic => {
            deps.value139(clipboardMark);
          }, clipboardMark.drop);
          return true;
        }
        if (command === "x")
          return sessionAllowsMutation({
            gesturing: deps.value218.current,
            setMoveCommits: deps.value155.current,
          })
            ? deps.value139()
              ? (deps.value145(CutValue, {
                  elementsOnly: true,
                }),
                true)
              : false
            : dropClipboardMark();
        if (command === "delete" || command === "delete-while-writing")
          return command === "delete-while-writing" &&
            deps.value48.current === 0 &&
            !(
              deps.value31.current != null &&
              Date.now() - deps.value31.current.at < deps.count
            )
            ? false
            : (deps.value51((): Dynamic => {
                if (isFromPreview) {
                  let boardSelection: Dynamic = canvasBoardSelection(
                    deps.selectionRef.current,
                  );
                  deps.value145(DeletedValue, {
                    elementsOnly: true,
                  }) &&
                    boardSelectionCount(boardSelection) > 0 &&
                    deps.value161(
                      uiMessage("canvas.designCanvas.theArtboardsAndNotesStay"),
                    );
                } else deps.value146();
              }),
              true);
        if (command === "flip-horizontal" || command === "flip-vertical") {
          let boardSelection: Dynamic = isFromPreview
              ? canvasBoardSelection(deps.selectionRef.current)
              : emptyBoardSelection,
            shortcutLabel: Dynamic =
              (isApplePlatform() ? "\u21E7" : "Shift+") +
              (command === "flip-horizontal" ? "H" : "V"),
            flipAxis: Dynamic =
              command === "flip-horizontal" ? "horizontal" : "vertical",
            selectionBefore: Dynamic = deps.selectionRef.current,
            areSelectionsEqual: Dynamic = (
              selectionA?: Dynamic,
              selectionB?: Dynamic,
            ): Dynamic =>
              selectionA.artboards.size === selectionB.artboards.size &&
              selectionA.notes.size === selectionB.notes.size &&
              selectionA.elements.size === selectionB.elements.size &&
              [...selectionA.artboards].every(
                (artboard?: Dynamic): Dynamic => selectionB.artboards.has(artboard),
              ) &&
              [...selectionA.notes].every(
                (note?: Dynamic): Dynamic => selectionB.notes.has(note),
              ) &&
              [...selectionA.elements].every(
                ([elementFile, elementEntry]: Dynamic): Dynamic =>
                  selectionB.elements.get(elementFile)?.tids.join() ===
                  elementEntry.tids.join(),
              );
          deps.value151(
            flipAxis,
            isFromPreview
              ? {
                  elementsOnly: true,
                  then: (precedingMessage?: Dynamic, shouldAnnounceDirection?: Dynamic): Dynamic =>
                    !deps.value224.current ||
                    !areSelectionsEqual(selectionBefore, deps.selectionRef.current) ||
                    flipAnnotations(
                      (deps.value73.current.annotations ?? []).filter(
                        (annotation?: Dynamic): Dynamic =>
                          boardSelection.notes.has(annotation.id),
                      ),
                      flipAxis,
                    ).flips.length === 0
                      ? false
                      : (deps.abandonSelectionGesture(),
                        deps.applyCanvasSelection(
                          selectionFromBoards(boardSelection),
                        ),
                        deps.value161(
                          (precedingMessage !== undefined
                            ? precedingMessage + " "
                            : shouldAnnounceDirection
                              ? flipDirectionAnnouncement(
                                  flipAxis,
                                ) + ". "
                              : "") +
                            uiMessage("canvas.designCanvas.press") +
                            shortcutLabel +
                            " again to flip what is outside the artboards, which stays selected.",
                        ),
                        true),
                }
              : {},
          );
          return true;
        }
        if (command === "d") {
          let boardSelection: Dynamic = isFromPreview
            ? canvasBoardSelection(deps.selectionRef.current)
            : emptyBoardSelection;
          deps.value148(
            isFromPreview
              ? {
                  elementsOnly: true,
                }
              : {},
          ) &&
            boardSelectionCount(boardSelection) > 0 &&
            (deps.applyCanvasSelection(selectionFromBoards(boardSelection)),
            deps.value161(
              uiMessage("canvas.designCanvas.theArtboardsAndNotesStay2") +
                keyboardShortcutLabel("D") +
                " again to copy them",
            ));
          return true;
        }
        return false;
      }

/** 挂载时注册的全局 keydown 处理：处理 Escape、Delete/Backspace、Enter、方向键微移、层级前后移动与右键菜单快捷键，避开输入框、弹层和交互预览。 */
export function subscribeCanvasKeyDown(deps: { readonly abandonSelectionGesture: Dynamic; readonly focusedFileRef: Dynamic; readonly pendingFrameSelectionRef: Dynamic; readonly selectionEpochRef: Dynamic; readonly selectionRef: Dynamic; readonly value106: Dynamic; readonly value125: Dynamic; readonly value147: Dynamic; readonly value152: Dynamic; readonly value155: Dynamic; readonly value159: Dynamic; readonly value21: Dynamic; readonly value218: Dynamic; readonly value224: Dynamic; readonly value279: Dynamic; readonly value295: Dynamic; readonly value32: Dynamic; readonly value33: Dynamic; readonly value339: Dynamic; readonly value345: Dynamic; readonly value404: Dynamic; readonly value42: Dynamic; readonly value459: Dynamic; readonly value48: Dynamic; readonly value52: Dynamic; readonly value552: Dynamic; readonly value56: Dynamic; readonly value61: Dynamic; readonly value73: Dynamic }): Dynamic {
    let deleteSelection: Dynamic = (): Dynamic => {
        let selection: Dynamic = deps.selectionRef.current;
        !deps.value224.current ||
          deps.value218.current ||
          hasBlockingEditorOverlay() ||
          isEmptyCanvasSelection(selection) ||
          (selection.elements.size > 0
            ? deps.value147.current(DeletedValue)
            : deps.value459.current(canvasBoardSelection(selection)));
      },
      handleKeyDown: Dynamic = (event?: Dynamic): Dynamic => {
        if (event.defaultPrevented || !deps.value224.current || deps.value345.current)
          return;
        let selection: Dynamic = deps.selectionRef.current,
          isEscapeWithEmptySelection: Dynamic =
            event.key === "Escape" &&
            isEmptyCanvasSelection(selection) &&
            deps.value125.current != null,
          isFocusedElementSelected: Dynamic =
            deps.focusedFileRef.current != null &&
            selection.elements.has(deps.focusedFileRef.current),
          hasModifier: Dynamic = event.metaKey || event.ctrlKey,
          isDeleteKey: Dynamic =
            (event.key === "Delete" || event.key === "Backspace") &&
            !hasModifier,
          pendingDelete: Dynamic =
            isDeleteKey && deps.value32.current?.gen === deps.selectionEpochRef.current
              ? deps.value32.current
              : null,
          hasPendingDelete: Dynamic =
            pendingDelete != null ||
            (isDeleteKey &&
              isFocusedElementSelected &&
              deps.pendingFrameSelectionRef.current != null &&
              deps.pendingFrameSelectionRef.current.file ===
                deps.focusedFileRef.current),
          titleElement: Dynamic =
            event.target instanceof Element
              ? event.target.closest("[data-mega-title-text]")
              : null,
          titleArtboardFile: Dynamic =
            titleElement
              ?.closest("[data-mega-artboard]")
              ?.getAttribute("data-mega-artboard") ?? null,
          isSelectedTitle: Dynamic =
            titleElement != null &&
            titleElement.closest("[data-mega-inside]") == null &&
            titleArtboardFile != null &&
            (selection.artboards.has(titleArtboardFile) ||
              selection.elements.has(titleArtboardFile)),
          hasMultipleSelected: Dynamic =
            selection.artboards.size +
              selection.notes.size +
              selection.elements.size >
            1,
          shouldHandleEnter: Dynamic =
            isSelectedTitle &&
            event.key === "Enter" &&
            !hasModifier &&
            !event.altKey &&
            !hasBlockingEditorOverlay() &&
            !deps.value218.current &&
            (event.shiftKey ? selection.elements.size > 0 : hasMultipleSelected),
          nudgeDelta: Dynamic =
            hasModifier || event.altKey
              ? null
              : keyboardNudgeDelta(event.key, event.shiftKey),
          shouldNudge: Dynamic = nudgeDelta != null && deps.value159.current,
          isInteractiveTarget: Dynamic = (candidate?: Dynamic): Dynamic =>
            candidate instanceof Element &&
            (isEditingInputTarget(candidate) ||
              candidate.closest(
                "[data-mega-chrome],[data-mega-title-text],[data-mega-piece],button,[role=button],a[href],input,textarea,select",
              ) != null),
          shouldIgnoreTarget: Dynamic = (candidate?: Dynamic): Dynamic =>
            candidate instanceof Element
              ? isEditingInputTarget(candidate) ||
                isInteractivePreviewTarget(candidate) ||
                candidate.closest(
                  '[data-mega-inside],[data-mega-selection-strip],[aria-haspopup="menu"],[aria-haspopup="listbox"],input,textarea,select',
                ) != null
                ? true
                : titleElement != null
                  ? !isSelectedTitle
                  : candidate.closest("[data-mega-chrome]") != null
              : false;
        if (
          hasModifier &&
          !event.shiftKey &&
          !event.altKey &&
          event.key.toLowerCase() === "a"
        ) {
          if (
            isFocusedElementSelected ||
            shouldIgnoreTarget(event.target) ||
            hasBlockingEditorOverlay() ||
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
        let flipAxis: Dynamic =
          hasModifier || event.altKey || !event.shiftKey
            ? null
            : event.key.toLowerCase() === "h"
              ? "horizontal"
              : event.key.toLowerCase() === "v"
                ? "vertical"
                : null;
        if (
          flipAxis !== null &&
          !isFocusedElementSelected &&
          !isEmptyCanvasSelection(selection)
        ) {
          if (
            event.repeat ||
            isEditingInputTarget(event.target) ||
            hasBlockingEditorOverlay() ||
            (event.target instanceof Element &&
              event.target.closest('[data-mega-chrome="selection-menu"]'))
          )
            return;
          if (
            event.target instanceof Element &&
            (event.target.hasAttribute("data-mega-title-text") ||
              event.target.hasAttribute("data-mega-piece"))
          ) {
            let targetFile: Dynamic = event.target
              .closest("[data-mega-artboard]")
              ?.getAttribute("data-mega-artboard");
            if (
              targetFile != null &&
              !selection.artboards.has(targetFile) &&
              !selection.elements.has(targetFile)
            ) {
              event.preventDefault();
              announce(
                artboardNotSelectedAnnouncement(
                  deps.value73.current.artboards.find(
                    (artboard?: Dynamic): Dynamic => artboard.file === targetFile,
                  )?.title ?? targetFile.replace(/\.dc\.html$/, ""),
                ),
              );
              return;
            }
          }
          if (!deps.value152.current(flipAxis)) return;
          event.preventDefault();
          event.stopPropagation();
          return;
        }
        let eventElement: Dynamic =
            event.target instanceof Element ? event.target : null,
          targetArtboardFile: Dynamic =
            eventElement?.closest("[data-mega-inside]") != null
              ? null
              : (eventElement
                  ?.closest("[data-mega-title-text],[data-mega-piece]")
                  ?.closest("[data-mega-artboard]")
                  ?.getAttribute("data-mega-artboard") ?? null);
        if (
          isContextMenuShortcut(event) &&
          !hasModifier &&
          !event.altKey &&
          (targetArtboardFile != null ||
            (selection.elements.size === 0 &&
              selection.artboards.size + selection.notes.size > 0))
        ) {
          if (
            (targetArtboardFile == null &&
              (isEditingInputTarget(eventElement) ||
                eventElement?.closest(
                  "button,[role=button],[role=treeitem],[role=textbox],[data-mega-selection-strip],.tb-root",
                ) != null)) ||
            hasBlockingEditorOverlay() ||
            deps.value218.current
          )
            return;
          let menuFile: Dynamic = targetArtboardFile ?? [...selection.artboards][0],
            menuNoteId: Dynamic = [...selection.notes][0] ?? "",
            canvasRoot: Dynamic = deps.value106.current,
            anchorElement: Dynamic = canvasRoot?.querySelector(
              menuFile !== undefined
                ? `[data-mega-artboard="${CSS.escape(menuFile)}"] :is([data-mega-chrome="title"], [data-mega-piece])`
                : `[data-mega-annotation="${CSS.escape(menuNoteId)}"]`,
            );
          if (
            canvasRoot == null ||
            anchorElement == null ||
            (event.preventDefault(),
            event.stopPropagation(),
            suppressNativeContextMenu(false),
            event.repeat)
          )
            return;
          let [anchorRect, canvasRect]: Dynamic = [
              anchorElement.getBoundingClientRect(),
              canvasRoot.getBoundingClientRect(),
            ],
            clampToRect: Dynamic = (
              coordinate?: Dynamic,
              rectStart?: Dynamic,
              rectEnd?: Dynamic,
            ): Dynamic => Math.min(Math.max(coordinate, rectStart + 8), rectEnd - 8),
            menuPosition: Dynamic =
              menuFile !== undefined
                ? {
                    x: anchorRect.left,
                    y: anchorRect.bottom,
                  }
                : {
                    x: anchorRect.left + Math.min(40, anchorRect.width / 2),
                    y: anchorRect.top + Math.min(24, anchorRect.height / 2),
                  };
          deps.value295.current(
            menuFile !== undefined
              ? {
                  kind: "artboard",
                  file: menuFile,
                }
              : {
                  kind: "object",
                  id: menuNoteId,
                },
            {
              x: clampToRect(menuPosition.x, canvasRect.left, canvasRect.right),
              y: clampToRect(menuPosition.y, canvasRect.top, canvasRect.bottom),
              keyboard: true,
            },
          );
          return;
        }
        if (
          (isEmptyCanvasSelection(selection) || isFocusedElementSelected) &&
          !hasPendingDelete &&
          !isEscapeWithEmptySelection &&
          !shouldHandleEnter &&
          !shouldNudge
        )
          return;
        if (event.key === "Enter" && !hasModifier && !event.altKey) {
          if (
            !(
              event.target == null ||
              event.target === (document as Dynamic).body ||
              event.target === (document as Dynamic).documentElement ||
              isCanvasEnterAction(event) ||
              shouldHandleEnter
            ) ||
            hasBlockingEditorOverlay() ||
            deps.value218.current
          )
            return;
          if (event.shiftKey) {
            if (selection.elements.size === 0) return;
            event.preventDefault();
            event.stopPropagation();
            deps.value56.current({
              kind: "parent",
            });
            return;
          }
          if (
            selection.notes.size === 0 &&
            selection.elements.size === 0 &&
            selection.artboards.size === 1
          ) {
            let [artboards]: Dynamic = selection.artboards;
            if (
              artboards == null ||
              deps.value73.current.artboards.find(
                (artboard?: Dynamic): Dynamic => artboard.file === artboards,
              )?.frameless
            )
              return;
            event.preventDefault();
            artboards !== deps.focusedFileRef.current &&
              isCanvasEnterAction(event) &&
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
        if (event.key === "Tab" && !hasModifier && !event.altKey) {
          if (
            selection.elements.size === 0 ||
            isInteractiveTarget(event.target) ||
            hasBlockingEditorOverlay() ||
            deps.value218.current ||
            activeCropElement() !== null ||
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
        if (nudgeDelta) {
          if (
            shouldIgnoreTarget(event.target) ||
            hasBlockingEditorOverlay() ||
            deps.value218.current
          )
            return;
          event.preventDefault();
          event.stopPropagation();
          deps.value56.current({
            kind: "nudge",
            ...nudgeDelta,
            repeat: event.repeat,
          });
          return;
        }
        let stackOrder: Dynamic =
          event.metaKey || (event.ctrlKey && !event.altKey)
            ? null
            : event.key === "]"
              ? "front"
              : event.key === "["
                ? "back"
                : null;
        if (
          stackOrder !== null &&
          selection.artboards.size > 0 &&
          selection.elements.size === 0
        ) {
          let stackTargetElement: Dynamic =
            event.target instanceof Element ? event.target : null;
          if (
            isEditingInputTarget(stackTargetElement) ||
            stackTargetElement?.closest(
              '[role=textbox],[role=searchbox],[role=combobox],[data-mega-selection-strip],[data-mega-chrome="selection-menu"]',
            ) != null
          )
            return;
          let stackTargetFile: Dynamic = stackTargetElement
            ?.closest("[data-mega-title-text],[data-mega-piece]")
            ?.closest("[data-mega-artboard]")
            ?.getAttribute("data-mega-artboard");
          if (
            (stackTargetFile != null && !selection.artboards.has(stackTargetFile)) ||
            hasBlockingEditorOverlay() ||
            !sessionAllowsMutation({
              gesturing: deps.value218.current,
              setMoveCommits: deps.value155.current,
            }) ||
            (event.preventDefault(), event.stopPropagation(), event.repeat)
          )
            return;
          deps.value52.current((): Dynamic => {
            let currentSelection: Dynamic = deps.selectionRef.current;
            !deps.value224.current ||
              hasBlockingEditorOverlay() ||
              currentSelection.artboards.size === 0 ||
              currentSelection.elements.size > 0 ||
              !sessionAllowsMutation({
                gesturing: deps.value218.current,
                setMoveCommits: deps.value155.current,
              }) ||
              deps.value404.current(currentSelection.artboards, stackOrder);
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
          isFormField: Dynamic =
            target instanceof HTMLElement &&
            (/^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName) ||
              target.isContentEditable),
          isInsideOverlay: Dynamic =
            target instanceof Element &&
            target.closest(
              "[data-tweak-popup],[data-popover-primitive]," +
                blockingOverlaySelector,
            ) != null;
        if (
          isEditingInputTarget(target) &&
          !(
            event.key === "Escape" &&
            isPropertyEditorTarget(target) &&
            !isFormField &&
            !isInsideOverlay
          )
        )
          return;
        if (event.key === "Escape") {
          if (
            deps.value339.current !== "select" ||
            (isEscapeWithEmptySelection && hasBlockingEditorOverlay())
          )
            return;
          if (deps.value61.current()) {
            event.preventDefault();
            return;
          }
          event.preventDefault();
          let clearSelection: Dynamic = (): Dynamic => {
            deps.abandonSelectionGesture();
            isEscapeWithEmptySelection
              ? deps.value279.current()
              : deps.value33.current(emptyCanvasSelection);
          };
          !isEscapeWithEmptySelection && deps.value48.current > 0
            ? deps.value52.current(clearSelection)
            : clearSelection();
          return;
        }
        if (
          hasBlockingEditorOverlay() ||
          (event.target instanceof Element &&
            event.target.closest('[data-mega-chrome="selection-menu"]'))
        )
          return;
        if (
          event.target instanceof Element &&
          (event.target.hasAttribute("data-mega-title-text") ||
            event.target.hasAttribute("data-mega-piece"))
        ) {
          let titleFile: Dynamic = event.target
            .closest("[data-mega-artboard]")
            ?.getAttribute("data-mega-artboard");
          if (titleFile != null && !selection.artboards.has(titleFile)) {
            event.preventDefault();
            let titleArtboard: Dynamic = deps.value73.current.artboards.find(
              (artboard?: Dynamic): Dynamic => artboard.file === titleFile,
            );
            announce(
              artboardNotSelectedAnnouncement(
                titleArtboard?.title ?? titleFile.replace(/\.dc\.html$/, ""),
              ),
            );
            return;
          }
        }
        let outlineRow: Dynamic = focusedOutlineRow(event.target);
        if (outlineRow != null) {
          event.preventDefault();
          announce(
            selectionActionRefusalAnnouncement(
              outlineRow.name,
              "deleted",
              outlineRow.onRow,
              deps.value21.current(),
            ),
          );
          return;
        }
        event.preventDefault();
        event.stopPropagation();
        if (pendingDelete != null) {
          pendingDelete.over.then(
            (): Dynamic => {
              if (
                pendingDelete.expired ||
                pendingDelete.travelled ||
                deps.value218.current ||
                !deps.value224.current
              )
                return;
              let expectedSelection: Dynamic = pendingDelete.answered
                  ? pendingDelete.after
                  : pendingDelete.kind !== "focus"
                    ? selection
                    : null,
                currentSelection: Dynamic = deps.selectionRef.current;
              expectedSelection == null ||
                isEmptyCanvasSelection(currentSelection) ||
                !canvasSelectionsEqual(expectedSelection, currentSelection) ||
                deps.value52.current(deleteSelection);
            },
            (): Dynamic => {},
          );
          return;
        }
        deps.value52.current(deleteSelection);
      };
    (document as Dynamic).addEventListener("keydown", handleKeyDown, true);
    return (): Dynamic =>
      (document as Dynamic).removeEventListener("keydown", handleKeyDown, true);
  }

/** 注册缩放与参考线快捷键：处理放大、缩小、适应等缩放组合键与参考线开关，并播报缩放比例。 */
export function subscribeZoomShortcuts(deps: { readonly value105: Dynamic; readonly value13: Dynamic; readonly value285: Dynamic; readonly value345: Dynamic; readonly value617: Dynamic; readonly value619: Dynamic }): Dynamic {
    let applyZoomKey: Dynamic = (key?: Dynamic): Dynamic => {
        deps.value345.current ||
          (key === "0"
            ? deps.value619()
            : deps.value617(deps.value105.get().scale * (key === "-" ? 0.8 : 1.25)),
          announce(
            (): Dynamic =>
              zoomAnnouncement(deps.value105.get().scale),
          ));
      },
      handleKeyDown: Dynamic = (event?: Dynamic): Dynamic => {
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
          applyZoomKey(
            event.key === "0" ? "0" : event.key === "-" ? "-" : "+",
          ));
      },
      handleZoomChord: Dynamic = (chordEvent?: Dynamic): Dynamic =>
        applyZoomKey(chordEvent.detail.key),
      toggleGuides: Dynamic = (): Dynamic => {
        deps.value345.current || deps.value13((isVisible?: Dynamic): Dynamic => !isVisible);
      },
      handleGuidesKey: Dynamic = (event?: Dynamic): Dynamic => {
        event.key.toLowerCase() !== "g" ||
          !event.shiftKey ||
          event.metaKey ||
          event.ctrlKey ||
          event.altKey ||
          event.defaultPrevented ||
          event.repeat ||
          isEditingInputTarget(event.target) ||
          hasBlockingEditorOverlay() ||
          (event.preventDefault(), toggleGuides());
      };
    (window as Dynamic).addEventListener("keydown", handleKeyDown);
    (window as Dynamic).addEventListener("keydown", handleGuidesKey);
    (window as Dynamic).addEventListener("canvas-zoom-chord", handleZoomChord);
    (window as Dynamic).addEventListener("canvas-guides-toggle", toggleGuides);
    return (): Dynamic => {
      (window as Dynamic).removeEventListener("keydown", handleKeyDown);
      (window as Dynamic).removeEventListener("keydown", handleGuidesKey);
      (window as Dynamic).removeEventListener(
        "canvas-zoom-chord",
        handleZoomChord,
      );
      (window as Dynamic).removeEventListener(
        "canvas-guides-toggle",
        toggleGuides,
      );
    };
  }
