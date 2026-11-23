import { reactChromeTheme as React } from "../../editor/chrome/theme";
import { DeletedValue } from "../../editor/accessibility/announcements";
import { activeCropElement } from "../../editor/session/element-state";
import { announce } from "../../editor/accessibility/announcer";
import { artboardNotSelectedAnnouncement } from "../../editor/accessibility/announcements";
import { blockingOverlaySelector } from "../../editor/chrome/overlay-state";
import { canvasBoardSelection } from "../../editor/selection/canvas-selection";
import { emptyCanvasSelection } from "../../editor/selection/canvas-selection";
import { focusedOutlineRow } from "../../editor/keyboard/find";
import { hasBlockingEditorOverlay } from "../../editor/text/typing-target";
import { isCanvasEnterAction } from "../../editor/keyboard/paste";
import { isContextMenuShortcut } from "../../editor/keyboard/edit-actions";
import { isEditingInputTarget } from "../../editor/keyboard/find";
import { isEmptyCanvasSelection } from "../../editor/selection/canvas-selection";
import { isInteractivePreviewTarget } from "../preview-navigation";
import { isPropertyEditorTarget } from "../../editor/keyboard/find";
import { keyboardNudgeDelta } from "../working-state";
import { selectionActionRefusalAnnouncement } from "../../editor/accessibility/announcements";
import { sessionAllowsMutation } from "../working-state";
import { suppressNativeContextMenu } from "../../editor/outline/native-menu";
import { type Dynamic } from "../../runtime-types";
import { zoomAnnouncement } from "../../editor/accessibility/announcements";
import { canvasSelectionsEqual } from "./shared";
import type { CanvasManifest } from "../manifest-history";

type Ref<T> = { current: T };

interface KeyboardShortcutOptions {
  abandonSelectionGesture(): void;
  readonly focusedFileRef: Ref<string | null>;
  isReplayingFile(file: string | null): boolean;
  readonly selectionEpochRef: Ref<number>;
  readonly selectionRef: Dynamic;
  readonly canvasRoot: Ref<HTMLElement | null>;
  readonly activeArtboard: Ref<string | null>;
  readonly deleteElements: Dynamic;
  readonly flipSelection: Dynamic;
  readonly pendingMoveCommits: Ref<number>;
  readonly combinedSelection: Ref<boolean>;
  readonly nothingSelectedMessage: Dynamic;
  readonly gesturing: Ref<boolean>;
  readonly editing: Ref<boolean>;
  readonly leaveArtboard: Ref<() => void>;
  readonly openContextMenu: Dynamic;
  readonly pendingFramePick: Dynamic;
  readonly applySelection: Dynamic;
  readonly activeTool: Ref<string>;
  readonly fullscreen: Ref<boolean>;
  readonly stackArtboards: Dynamic;
  readonly selectArtboardElements: Ref<(file: string) => void>;
  readonly deleteBoardsAndNotes: Dynamic;
  readonly pendingSelectionEdits: Ref<number>;
  readonly afterSelectionEdits: Dynamic;
  readonly layerCursor: { refocusAt: number };
  readonly navigateSelection: Dynamic;
  readonly cancelFrameGesture: Ref<() => boolean>;
  readonly manifest: Ref<CanvasManifest>;
}

/** 注册画布快捷键，保留输入框、弹层和交互预览自己的按键行为。 */
export function useCanvasKeyboardShortcuts(options: KeyboardShortcutOptions) {
  React.useEffect(() => subscribeCanvasKeyDown(options), []);
}

function subscribeCanvasKeyDown(deps: KeyboardShortcutOptions): () => void {
    let deleteSelection: Dynamic = (): Dynamic => {
        let selection: Dynamic = deps.selectionRef.current;
        !deps.editing.current ||
          deps.gesturing.current ||
          hasBlockingEditorOverlay() ||
          isEmptyCanvasSelection(selection) ||
          (selection.elements.size > 0
            ? deps.deleteElements.current(DeletedValue)
            : deps.deleteBoardsAndNotes.current(canvasBoardSelection(selection)));
      },
      handleKeyDown: Dynamic = (event?: Dynamic): Dynamic => {
        if (event.defaultPrevented || !deps.editing.current || deps.fullscreen.current)
          return;
        let selection: Dynamic = deps.selectionRef.current,
          isEscapeWithEmptySelection: Dynamic =
            event.key === "Escape" &&
            isEmptyCanvasSelection(selection) &&
            deps.activeArtboard.current != null,
          isFocusedElementSelected: Dynamic =
            deps.focusedFileRef.current != null &&
            selection.elements.has(deps.focusedFileRef.current),
          hasModifier: Dynamic = event.metaKey || event.ctrlKey,
          isDeleteKey: Dynamic =
            (event.key === "Delete" || event.key === "Backspace") &&
            !hasModifier,
          pendingDelete: Dynamic =
            isDeleteKey && deps.pendingFramePick.current?.gen === deps.selectionEpochRef.current
              ? deps.pendingFramePick.current
              : null,
          hasPendingDelete: Dynamic =
            pendingDelete != null ||
            (isDeleteKey &&
              isFocusedElementSelected &&
              deps.isReplayingFile(deps.focusedFileRef.current)),
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
            !deps.gesturing.current &&
            (event.shiftKey ? selection.elements.size > 0 : hasMultipleSelected),
          nudgeDelta: Dynamic =
            hasModifier || event.altKey
              ? null
              : keyboardNudgeDelta(event.key, event.shiftKey),
          shouldNudge: Dynamic = nudgeDelta != null && deps.combinedSelection.current,
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
            deps.gesturing.current
          )
            return;
          event.preventDefault();
          event.stopPropagation();
          deps.navigateSelection.current({
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
                  deps.manifest.current.artboards.find(
                    (artboard?: Dynamic): Dynamic => artboard.file === targetFile,
                  )?.title ?? targetFile.replace(/\.dc\.html$/, ""),
                ),
              );
              return;
            }
          }
          if (!deps.flipSelection.current(flipAxis)) return;
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
            deps.gesturing.current
          )
            return;
          let menuFile: Dynamic = targetArtboardFile ?? [...selection.artboards][0],
            menuNoteId: Dynamic = [...selection.notes][0] ?? "",
            canvasRoot: Dynamic = deps.canvasRoot.current,
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
          deps.openContextMenu.current(
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
            deps.gesturing.current
          )
            return;
          if (event.shiftKey) {
            if (selection.elements.size === 0) return;
            event.preventDefault();
            event.stopPropagation();
            deps.navigateSelection.current({
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
              deps.manifest.current.artboards.find(
                (artboard?: Dynamic): Dynamic => artboard.file === artboards,
              )?.frameless
            )
              return;
            event.preventDefault();
            artboards !== deps.focusedFileRef.current &&
              isCanvasEnterAction(event) &&
              (deps.layerCursor.refocusAt = Date.now());
            deps.selectArtboardElements.current(artboards);
            return;
          }
          event.preventDefault();
          event.stopPropagation();
          deps.navigateSelection.current({
            kind: "enter",
          });
          return;
        }
        if (event.key === "Tab" && !hasModifier && !event.altKey) {
          if (
            selection.elements.size === 0 ||
            isInteractiveTarget(event.target) ||
            hasBlockingEditorOverlay() ||
            deps.gesturing.current ||
            activeCropElement() !== null ||
            (event.target != null &&
              event.target !== (document as Dynamic).body &&
              event.target !== (document as Dynamic).documentElement)
          )
            return;
          event.preventDefault();
          event.stopPropagation();
          deps.navigateSelection.current({
            kind: event.shiftKey ? "prev" : "next",
          });
          return;
        }
        if (nudgeDelta) {
          if (
            shouldIgnoreTarget(event.target) ||
            hasBlockingEditorOverlay() ||
            deps.gesturing.current
          )
            return;
          event.preventDefault();
          event.stopPropagation();
          deps.navigateSelection.current({
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
              gesturing: deps.gesturing.current,
              setMoveCommits: deps.pendingMoveCommits.current,
            }) ||
            (event.preventDefault(), event.stopPropagation(), event.repeat)
          )
            return;
          deps.afterSelectionEdits.current((): Dynamic => {
            let currentSelection: Dynamic = deps.selectionRef.current;
            !deps.editing.current ||
              hasBlockingEditorOverlay() ||
              currentSelection.artboards.size === 0 ||
              currentSelection.elements.size > 0 ||
              !sessionAllowsMutation({
                gesturing: deps.gesturing.current,
                setMoveCommits: deps.pendingMoveCommits.current,
              }) ||
              deps.stackArtboards.current(currentSelection.artboards, stackOrder);
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
            deps.activeTool.current !== "select" ||
            (isEscapeWithEmptySelection && hasBlockingEditorOverlay())
          )
            return;
          if (deps.cancelFrameGesture.current()) {
            event.preventDefault();
            return;
          }
          event.preventDefault();
          let clearSelection: Dynamic = (): Dynamic => {
            deps.abandonSelectionGesture();
            isEscapeWithEmptySelection
              ? deps.leaveArtboard.current()
              : deps.applySelection.current(emptyCanvasSelection);
          };
          !isEscapeWithEmptySelection && deps.pendingSelectionEdits.current > 0
            ? deps.afterSelectionEdits.current(clearSelection)
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
            let titleArtboard: Dynamic = deps.manifest.current.artboards.find(
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
              deps.nothingSelectedMessage.current(),
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
                deps.gesturing.current ||
                !deps.editing.current
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
                deps.afterSelectionEdits.current(deleteSelection);
            },
            (): Dynamic => {},
          );
          return;
        }
        deps.afterSelectionEdits.current(deleteSelection);
      };
    (document as Dynamic).addEventListener("keydown", handleKeyDown, true);
    return (): Dynamic =>
      (document as Dynamic).removeEventListener("keydown", handleKeyDown, true);
  }

/** 注册缩放与参考线快捷键：处理放大、缩小、适应等缩放组合键与参考线开关，并播报缩放比例。 */
export function subscribeZoomShortcuts(deps: {
  camera: { get(): { scale: number } };
  setGuidesVisible(update: (visible: boolean) => boolean): void;
  filesOpen: { current: boolean };
  fullscreen: { current: boolean };
  zoomTo(scale: number): void;
  fitPage(): boolean;
}): () => void {
    let applyZoomKey: Dynamic = (key?: Dynamic): Dynamic => {
        deps.fullscreen.current ||
          (key === "0"
            ? deps.fitPage()
            : deps.zoomTo(deps.camera.get().scale * (key === "-" ? 0.8 : 1.25)),
          announce(
            (): Dynamic =>
              zoomAnnouncement(deps.camera.get().scale),
          ));
      },
      handleKeyDown: Dynamic = (event?: Dynamic): Dynamic => {
        if (
          event.defaultPrevented ||
          deps.filesOpen.current ||
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
        deps.fullscreen.current || deps.setGuidesVisible((isVisible?: Dynamic): Dynamic => !isVisible);
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
