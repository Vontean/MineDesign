import { uiMessage } from '@minedesign/contracts/ui-messages';
/** Restored application module; prepare first, initialize in original order. */
import {
  type Dynamic,
} from "../../runtime-types";

var NotesFormattingStyledNestsConfig: Dynamic;
var noteFormattingExecuting: Dynamic;
var NotesFormattingHandler: Dynamic;
var NotesFormattingExecCommand: Dynamic;
var findEditableRoot: Dynamic;
var NotesFormattingGetSelection: Dynamic;
function getNoteFormattingState(
  ownerDocument: Dynamic = document,
  knownState?: Dynamic,
): Dynamic {
  let state: Dynamic = {
      bold: false,
      italic: false,
      inBold: false,
      inItalic: false,
      allBold: false,
      allItalic: false,
      ul: false,
      ol: false,
    },
    selection: Dynamic = ownerDocument.getSelection(),
    selectedRange: Dynamic =
      selection && selection.rangeCount > 0 && !selection.isCollapsed
        ? selection.getRangeAt(0)
        : null;
  !selectedRange &&
    knownState &&
    selection?.rangeCount &&
    typeof ownerDocument.queryCommandState == "function" &&
    (!knownState.bold &&
      ownerDocument.queryCommandState("bold") &&
      (state.bold = state.inBold = true),
    !knownState.italic &&
      ownerDocument.queryCommandState("italic") &&
      (state.italic = state.inItalic = true));
  let editableRoot: Dynamic = null,
    currentNode: Dynamic = selectedRange
      ? selectedRange.commonAncestorContainer
      : (selection?.anchorNode ?? null);
  for (; currentNode && currentNode.nodeType !== 9; currentNode = currentNode.parentNode) {
    if (currentNode.nodeType !== 1) continue;
    let element: Dynamic = currentNode;
    if (element.contentEditable === "true") {
      editableRoot = element;
      break;
    }
    /^(B|STRONG)$/.test(element.tagName)
      ? (state.bold = state.inBold = true)
      : /^(I|EM)$/.test(element.tagName)
        ? (state.italic = state.inItalic = true)
        : !state.ul && !state.ol && element.tagName === "UL"
          ? (state.ul = true)
          : !state.ul &&
            !state.ol &&
            element.tagName === "OL" &&
            (state.ol = true);
  }
  if (editableRoot && selectedRange) {
    let matchesSelector: Dynamic = (selector?: Dynamic): Dynamic =>
      [...editableRoot.querySelectorAll(selector)].some(
        (node?: Dynamic): Dynamic => selectedRange.intersectsNode(node),
      );
    state.bold ||= matchesSelector("b,strong");
    state.italic ||= matchesSelector("i,em");
    let allBold: Dynamic = true,
      allItalic: Dynamic = true,
      allUnorderedList: Dynamic = true,
      allOrderedList: Dynamic = true,
      hasTextNodes: Dynamic = false,
      textWalker: Dynamic = ownerDocument.createTreeWalker(editableRoot, 4);
    for (
      let textNode: Dynamic = textWalker.nextNode();
      textNode;
      textNode = textWalker.nextNode()
    ) {
      if (!selectedRange.intersectsNode(textNode)) continue;
      hasTextNodes = true;
      let parentElement: Dynamic = textNode.parentElement;
      allBold &&= !!parentElement?.closest("b,strong");
      allItalic &&= !!parentElement?.closest("i,em");
      allUnorderedList &&= !!parentElement?.closest("ul");
      allOrderedList &&= !!parentElement?.closest("ol");
    }
    state.allBold = state.inBold || (hasTextNodes && allBold);
    state.allItalic = state.inItalic || (hasTextNodes && allItalic);
    !state.ul &&
      !state.ol &&
      ((state.ul = hasTextNodes && allUnorderedList), (state.ol = hasTextNodes && !allUnorderedList && allOrderedList));
  } else {
    state.allBold = state.inBold;
    state.allItalic = state.inItalic;
  }
  return state;
}
function noteFormattingRefusal(
  format?: Dynamic,
  knownState?: Dynamic,
  ownerDocument: Dynamic = document,
  messages: Dynamic = NotesFormattingStyledNestsConfig,
): Dynamic {
  if (knownState[format]) return messages.styled(format);
  let formatState: Dynamic = getNoteFormattingState(ownerDocument, knownState);
  return (format === "bold" ? formatState.inBold : formatState.inItalic)
    ? ""
    : (format === "bold" ? formatState.italic : formatState.bold)
      ? messages.nests
      : "";
}
function toggleNoteFormatting(
  format?: Dynamic,
  knownState?: Dynamic,
  ownerDocument: Dynamic = document,
): Dynamic {
  noteFormattingRefusal(format, knownState, ownerDocument) === "" &&
    (NotesFormattingGetSelection(ownerDocument),
    NotesFormattingExecCommand(ownerDocument, format));
}
function toggleNoteList(
  listType?: Dynamic,
  ownerDocument: Dynamic = document,
): Dynamic {
  NotesFormattingGetSelection(ownerDocument);
  let selection: Dynamic = ownerDocument.getSelection(),
    findBlock: Dynamic = (node?: Dynamic): Dynamic => {
      let element: Dynamic =
        node?.nodeType === 1 ? node : (node?.parentElement ?? null);
      return (
        element?.closest("li") ??
        element?.closest('[contenteditable="true"] > *') ??
        null
      );
    },
    caretOffset: Dynamic = -1;
  if (selection && selection.isCollapsed && selection.anchorNode) {
    let currentBlock: Dynamic = findBlock(selection.anchorNode);
    if (currentBlock) {
      let offsetRange: Dynamic = ownerDocument.createRange();
      offsetRange.selectNodeContents(currentBlock);
      offsetRange.setEnd(selection.anchorNode, selection.anchorOffset);
      caretOffset = offsetRange.toString().length;
    }
  }
  NotesFormattingExecCommand(
    ownerDocument,
    listType === "ul" ? "insertUnorderedList" : "insertOrderedList",
  );
  let newBlock: Dynamic =
    caretOffset >= 0 && selection?.anchorNode ? findBlock(selection.anchorNode) : null;
  if (newBlock && selection) {
    let textWalker: Dynamic = ownerDocument.createTreeWalker(newBlock, 4);
    for (
      let textNode: Dynamic = textWalker.nextNode(), remainingOffset: Dynamic = caretOffset;
      textNode;
      textNode = textWalker.nextNode()
    ) {
      let length: Dynamic = (textNode.nodeValue ?? "").length,
        nonEditableAncestor: Dynamic = textNode.parentElement?.closest(
          '[contenteditable="false"]',
        );
      if (remainingOffset <= length && !nonEditableAncestor) {
        selection.collapse(textNode, remainingOffset);
        break;
      }
      if (remainingOffset <= length && nonEditableAncestor?.parentNode) {
        selection.collapse(
          nonEditableAncestor.parentNode,
          [...nonEditableAncestor.parentNode.childNodes].indexOf(nonEditableAncestor) + 1,
        );
        break;
      }
      remainingOffset -= length;
    }
  }
}
export {
  getNoteFormattingState,
  noteFormattingExecuting,
  noteFormattingRefusal,
  NotesFormattingExecCommand,
  NotesFormattingGetSelection,
  NotesFormattingHandler,
  findEditableRoot,
  NotesFormattingStyledNestsConfig,
  toggleNoteFormatting,
  toggleNoteList,
};
export function installEditorNotesFormatting(): () => void {
  return () => {
    NotesFormattingStyledNestsConfig = {
      styled: (formatLabel?: Dynamic): Dynamic =>
        uiMessage("inspector.formatting.theWholeNoteIsAlready") + formatLabel + " (its style)",
      nests: "Bold and italic do not combine in a note",
    };
    noteFormattingExecuting = false;
    NotesFormattingHandler = (): Dynamic => noteFormattingExecuting;
    NotesFormattingExecCommand = (
      ownerDocument?: Dynamic,
      command?: Dynamic,
    ): Dynamic => {
      noteFormattingExecuting = true;
      try {
        ownerDocument.execCommand("styleWithCSS", false, "false");
        ownerDocument.execCommand(command);
      } finally {
        noteFormattingExecuting = false;
      }
    };
    findEditableRoot = (node?: Dynamic): Dynamic =>
      (node?.nodeType === 1 ? node : (node?.parentElement ?? null))?.closest(
        '[contenteditable="true"]',
      ) ?? null;
    NotesFormattingGetSelection = (ownerDocument: Dynamic = document): Dynamic => {
      let editableRoot: Dynamic = findEditableRoot(
        ownerDocument.getSelection()?.anchorNode,
      );
      editableRoot && ownerDocument.activeElement !== editableRoot && editableRoot.focus();
    };
  };
}
