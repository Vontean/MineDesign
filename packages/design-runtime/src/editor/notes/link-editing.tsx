/** Restored application module; prepare first, initialize in original order. */
import {
  type Dynamic,
} from "../../runtime-types";
import { load_react_jsx_runtime } from "../../dependencies";
import { ContenteditableFalseValue, NotesAutoformatCaretPositionFromPoint, NotesAutoformatParentNode } from "./autoformat";
import { toModuleNamespace } from "../../module-helpers";
import { annotationTextStyle, maxTextAnnotationWidth as noteMaxWidth, minTextAnnotationWidth as noteMinWidth, PlatformFileContentMatch, PlatformFileContentMaxW, PlatformFileContentMin } from "../../platform/file-content";

var jsxNotesLinkEditing: Dynamic;
var NotesLinkEditingLabel: Dynamic;
var NotesLinkEditingClosest: Dynamic;
var Fef3a2Value: Dynamic;
var noteLinkHighlightColor: Dynamic;
var noteTextColors: Dynamic;
var noteFillColors: Dynamic;
var NotesLinkEditingHandler: Dynamic;
var resolveAnnotationTextColor: Dynamic;
var NotesLinkEditingLh: Dynamic;
var NotesLinkEditingKind: Dynamic;
var NotesLinkEditingSize: Dynamic;
var NotesLinkEditingMin: Dynamic;
function createNoteLinkEditor(editor?: Dynamic): Dynamic {
  let dragState: Dynamic = null,
    findChip: Dynamic = (node?: Dynamic): Dynamic => {
      let chip: Dynamic = node
        ? (node instanceof Element
            ? node
            : node.parentElement
          )?.closest(ContenteditableFalseValue)
        : null;
      return chip && editor.contains(chip) ? chip : null;
    },
    chipAtPoint: Dynamic = (
      clientX?: Dynamic,
      clientY?: Dynamic,
      target?: Dynamic,
    ): Dynamic => {
      let caretPoint: Dynamic = NotesAutoformatCaretPositionFromPoint(clientX, clientY);
      return (
        findChip(caretPoint ? caretPoint[0] : null) ??
        findChip(target instanceof Node ? target : null)
      );
    },
    isSelectionInside: Dynamic = (chip?: Dynamic): Dynamic =>
      !!(window as Dynamic).getSelection()?.anchorNode &&
      chip.contains((window as Dynamic).getSelection().anchorNode),
    extendSelectionAcrossChip: Dynamic = (
      selection?: Dynamic,
      anchorPoint?: Dynamic,
      chip?: Dynamic,
    ): Dynamic => {
      let parentNode: Dynamic = chip.parentNode,
        chipIndex: Dynamic = [...parentNode.childNodes].indexOf(chip),
        anchorRange: Dynamic = (document as Dynamic).createRange();
      anchorRange.setStart(...anchorPoint);
      selection.setBaseAndExtent(
        ...anchorPoint,
        parentNode,
        anchorRange.comparePoint(parentNode, chipIndex) < 0 ? chipIndex : chipIndex + 1,
      );
    },
    updateDragSelection: Dynamic = (
      drag?: Dynamic,
      pointerX?: Dynamic,
      pointerY?: Dynamic,
      hoveredChip?: Dynamic,
    ): Dynamic => {
      let selection: Dynamic = (window as Dynamic).getSelection();
      if (dragState !== drag || !selection || selection.rangeCount === 0) return;
      if (!drag.chip && !drag.anchor) {
        let focusChip: Dynamic = hoveredChip ?? findChip(selection.focusNode);
        focusChip &&
          editor.contains(selection.anchorNode) &&
          !findChip(selection.anchorNode) &&
          extendSelectionAcrossChip(
            selection,
            [selection.anchorNode, selection.anchorOffset],
            focusChip,
          );
        return;
      }
      let bounds: Dynamic = editor.getBoundingClientRect(),
        clampedX: Dynamic = Math.min(
          Math.max(pointerX, bounds.left + 1, 0),
          bounds.right - 1,
          (window as Dynamic).innerWidth - 1,
        ),
        clampedY: Dynamic = Math.min(
          Math.max(pointerY, bounds.top + 1, 0),
          bounds.bottom - 1,
          (window as Dynamic).innerHeight - 1,
        ),
        caretPosition: Dynamic = NotesAutoformatCaretPositionFromPoint(
          clampedX,
          clampedY,
        ),
        caretElement: Dynamic =
          caretPosition &&
          (caretPosition[0] instanceof Element
            ? caretPosition[0]
            : caretPosition[0].parentElement),
        isInEditableText: Dynamic =
          !!caretPosition &&
          !!caretElement &&
          editor.contains(caretElement) &&
          !caretElement.closest(ContenteditableFalseValue),
        targetChip: Dynamic = hoveredChip ?? (caretPosition ? findChip(caretPosition[0]) : null),
        chipParent: Dynamic = drag.chip?.parentNode;
      if (drag.chip && chipParent) {
        let chipIndex: Dynamic = [...chipParent.childNodes].indexOf(drag.chip),
          chipRange: Dynamic = (document as Dynamic).createRange();
        chipRange.setStart(chipParent, chipIndex + 1);
        if (isInEditableText)
          drag.anchor = [
            chipParent,
            chipRange.comparePoint(caretPosition[0], caretPosition[1]) < 0
              ? chipIndex + 1
              : chipIndex,
          ];
        else if (targetChip && targetChip !== drag.chip)
          drag.anchor = [
            chipParent,
            drag.chip.compareDocumentPosition(targetChip) &
            Node.DOCUMENT_POSITION_PRECEDING
              ? chipIndex + 1
              : chipIndex,
          ];
        else if (!drag.anchor) {
          let chipRect: Dynamic = drag.chip.getClientRects()[0];
          drag.anchor = [
            chipParent,
            chipRect &&
            (pointerY < chipRect.top ||
              (pointerY <= chipRect.bottom && pointerX < chipRect.left))
              ? chipIndex + 1
              : chipIndex,
          ];
        }
      }
      drag.anchor &&
        (isInEditableText
          ? selection.setBaseAndExtent(...drag.anchor, caretPosition[0], caretPosition[1])
          : (targetChip ?? drag.chip) &&
            extendSelectionAcrossChip(selection, drag.anchor, targetChip ?? drag.chip));
    },
    handleMouseMove: Dynamic = (event?: Dynamic): Dynamic => {
      let drag: Dynamic = dragState;
      if (
        !drag ||
        event.buttons !== 1 ||
        (cancelAnimationFrame(drag.raf),
        Math.hypot(event.clientX - drag.x, event.clientY - drag.y) < 5)
      )
        return;
      let hoveredChip: Dynamic = chipAtPoint(
        event.clientX,
        event.clientY,
        event.target,
      );
      if (
        drag.chip &&
        !drag.anchor &&
        hoveredChip === drag.chip &&
        isSelectionInside(drag.chip)
      )
        return;
      let { clientX: pointerX, clientY: pointerY }: Dynamic = event;
      drag.raf = requestAnimationFrame(
        (): Dynamic => updateDragSelection(drag, pointerX, pointerY, hoveredChip),
      );
    },
    endDrag: Dynamic = (event?: Dynamic): Dynamic => {
      let drag: Dynamic = dragState;
      drag && cancelAnimationFrame(drag.raf);
      if (drag && event instanceof MouseEvent && event.type === "mouseup") {
        let selection: Dynamic = (window as Dynamic).getSelection(),
          hoveredChip: Dynamic = chipAtPoint(
            event.clientX,
            event.clientY,
            event.target,
          );
        Math.hypot(event.clientX - drag.x, event.clientY - drag.y) < 5
          ? selection &&
            drag.chip &&
            (selection.isCollapsed ||
              !drag.chip.contains(selection.anchorNode) ||
              !drag.chip.contains(selection.focusNode)) &&
            NotesAutoformatParentNode(selection, drag.chip)
          : (drag.chip &&
              !drag.anchor &&
              hoveredChip === drag.chip &&
              isSelectionInside(drag.chip)) ||
            updateDragSelection(drag, event.clientX, event.clientY, hoveredChip);
      }
      dragState = null;
      event?.type === "mouseup" &&
        requestAnimationFrame((): Dynamic => {
          let selection: Dynamic = (window as Dynamic).getSelection();
          if (!selection || selection.rangeCount === 0) return;
          let anchorChip: Dynamic = findChip(selection.anchorNode),
            focusChip: Dynamic = findChip(selection.focusNode);
          selection.isCollapsed
            ? focusChip && NotesAutoformatParentNode(selection, focusChip)
            : focusChip && !anchorChip && editor.contains(selection.anchorNode)
              ? extendSelectionAcrossChip(
                  selection,
                  [selection.anchorNode, selection.anchorOffset],
                  focusChip,
                )
              : anchorChip &&
                !focusChip &&
                editor.contains(selection.focusNode) &&
                extendSelectionAcrossChip(
                  selection,
                  [selection.focusNode, selection.focusOffset],
                  anchorChip,
                );
        });
    };
  (window as Dynamic).addEventListener("mousemove", handleMouseMove, true);
  (window as Dynamic).addEventListener("pointerdown", endDrag, true);
  (window as Dynamic).addEventListener("mouseup", endDrag, true);
  (window as Dynamic).addEventListener("pointercancel", endDrag, true);
  return {
    onMouseDown(event: Dynamic): Dynamic {
      if (event.button !== 0) return;
      let isPlainClick: Dynamic =
          !event.shiftKey &&
          !event.metaKey &&
          !event.ctrlKey &&
          !event.altKey,
        selection: Dynamic = (window as Dynamic).getSelection(),
        caretPoint: Dynamic = NotesAutoformatCaretPositionFromPoint(
          event.clientX,
          event.clientY,
        ),
        chip: Dynamic =
          findChip(caretPoint ? caretPoint[0] : null) ?? findChip(event.target),
        isDraggingSelection: Dynamic =
          isPlainClick &&
          event.detail < 2 &&
          !!selection &&
          !!caretPoint &&
          !selection.isCollapsed &&
          selection.rangeCount > 0 &&
          selection.getRangeAt(0).isPointInRange(...caretPoint);
      dragState = {
        x: event.clientX,
        y: event.clientY,
        chip: isPlainClick ? chip : null,
        anchor: isDraggingSelection && !chip ? caretPoint : null,
        raf: 0,
      };
      if (isDraggingSelection) {
        event.preventDefault();
        chip
          ? NotesAutoformatParentNode(selection, chip)
          : selection.collapse(...caretPoint);
        editor.focus();
        return;
      }
      if (!chip || !isPlainClick || !selection || event.detail < 2) return;
      event.preventDefault();
      dragState = null;
      let parentNode: Dynamic = chip.parentNode,
        chipIndex: Dynamic = [...parentNode.childNodes].indexOf(chip);
      selection.setBaseAndExtent(parentNode, chipIndex, parentNode, chipIndex + 1);
      editor.focus();
    },
    stop(): Dynamic {
      (window as Dynamic).removeEventListener("mousemove", handleMouseMove, true);
      (window as Dynamic).removeEventListener("pointerdown", endDrag, true);
      (window as Dynamic).removeEventListener("mouseup", endDrag, true);
      (window as Dynamic).removeEventListener(
        "pointercancel",
        endDrag,
        true,
      );
      endDrag();
    },
  };
}
export {
  createNoteLinkEditor,
  Fef3a2Value,
  jsxNotesLinkEditing,
  noteLinkHighlightColor,
  NotesLinkEditingClosest,
  noteTextColors as NotesLinkEditingGrayRedOrangeConfig,
  noteFillColors,
  NotesLinkEditingHandler,
  resolveAnnotationTextColor,
  NotesLinkEditingKind,
  NotesLinkEditingLabel,
  NotesLinkEditingLh,
  NotesLinkEditingMin,
  NotesLinkEditingSize,
};
export function installEditorNotesLinkEditing(): () => void {
  return () => {
    jsxNotesLinkEditing = toModuleNamespace(
      load_react_jsx_runtime(),
      1,
    );
    NotesLinkEditingLabel = "[data-note-typing-strip], [data-mc-popover]";
    NotesLinkEditingClosest = (node?: Dynamic): Dynamic =>
      node instanceof Element && node.closest(NotesLinkEditingLabel) !== null;
    // MineDesign：便签与形状底色取 Excalidraw 的背景色板（open-color 第 2 档），文字用它的默认墨色
    Fef3a2Value = "#ffec99";
    noteLinkHighlightColor = "#1e1e1e";
    noteTextColors = {
      gray: "#73726c",
      red: "#c62828",
      orange: "#a05c00",
      green: "#2e7d32",
      teal: "#3f7566",
      blue: "#2a78d6",
      purple: "#6a64a8",
      pink: "#ad4d72",
    };
    noteFillColors = {
      gray: "#e9ecef",
      red: "#ffc9c9",
      orange: "#ffd8a8",
      green: "#b2f2bb",
      teal: "#96f2d7",
      blue: "#a5d8ff",
      purple: "#d0bfff",
      pink: "#fcc2d7",
    };
    NotesLinkEditingHandler = (colorName?: Dynamic): Dynamic =>
      colorName === "default"
        ? Fef3a2Value
        : noteFillColors[colorName];
    resolveAnnotationTextColor = (
      kind?: Dynamic,
      colorName?: Dynamic,
    ): Dynamic => {
      let textColor: Dynamic =
        colorName === "default"
          ? undefined
          : noteTextColors[colorName];
      return kind !== "title1"
        ? (textColor ?? noteLinkHighlightColor)
        : textColor === undefined
          ? "var(--cds-text-primary)"
          : "color-mix(in oklab, " +
            textColor +
            " var(--om-title-ink, 100%), var(--cds-text-primary))";
    };
    NotesLinkEditingLh = (annotation?: Dynamic): Dynamic => {
      let { size: fontSize }: Dynamic = annotationTextStyle(annotation),
        metrics: Dynamic = PlatformFileContentMin(fontSize);
      return Math.round(fontSize * metrics.lh) + 2 * metrics.py;
    };
    NotesLinkEditingKind = (source?: Dynamic): Dynamic => {
      if (source.kind !== "title1") return source.w;
      let { size: fontSize }: Dynamic = annotationTextStyle(source),
        widestLine: Dynamic = source.text
          .split(
            `
`,
          )
          .reduce(
            (widest?: Dynamic, line?: Dynamic): Dynamic =>
              Math.max(
                widest,
                PlatformFileContentMatch(line, fontSize),
              ),
            0,
          );
      return Math.min(
        PlatformFileContentMaxW(source),
        widestLine + 2 * PlatformFileContentMin(fontSize).px,
      );
    };
    NotesLinkEditingSize = (annotation?: Dynamic): Dynamic => {
      let textStyle: Dynamic = annotationTextStyle(annotation),
        metrics: Dynamic = PlatformFileContentMin(textStyle.size);
      return {
        color: resolveAnnotationTextColor(textStyle.kind, textStyle.color),
        fontSize: textStyle.size,
        fontWeight: textStyle.bold ? 700 : undefined,
        fontStyle: textStyle.italic ? "italic" : undefined,
        lineHeight: metrics.lh,
        letterSpacing: metrics.ls,
        padding: String(metrics.py) + "px " + String(metrics.px) + "px",
        minHeight: NotesLinkEditingLh(annotation),
      };
    };
    NotesLinkEditingMin = (width?: Dynamic): Dynamic =>
      Math.min(
        noteMaxWidth,
        Math.max(noteMinWidth, Math.round(width)),
      );
  };
}
