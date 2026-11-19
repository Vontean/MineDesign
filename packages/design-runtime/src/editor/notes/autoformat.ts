/** Restored application module; prepare first, initialize in original order. */
import {
  type Dynamic,
} from "../../runtime-types";
import { NotesFormattingHandler, toggleNoteFormatting } from "./formatting";

var NotesAutoformatItems: Dynamic;
var NotesAutoformatElementCache: Dynamic;
var noteAutoformatExecuting: Dynamic;
var ContenteditableFalseValue: Dynamic;
var NotesAutoformatParentNode: Dynamic;
var NotesAutoformatCaretPositionFromPoint: Dynamic;
var NotesAutoformatExecCommand: Dynamic;
var NotesAutoformatOnPasteOnDropOnDragStartConfig: Dynamic;
function noteAutoformatShortcut(
  typedText?: Dynamic,
  allowListMarkers: Dynamic = false,
): Dynamic {
  let normalizedText: Dynamic = typedText.replace(/\u00a0/g, " ");
  if (allowListMarkers) {
    normalizedText = normalizedText.replace(/^ +/, "");
    if (normalizedText === "\u2022 ") return "ul";
    if (/^\d{1,3}\. $/.test(normalizedText)) return "ol";
  }
  for (let [marker, blockType] of NotesAutoformatItems as Dynamic)
    if (normalizedText === marker) return blockType;
  return null;
}
function applyNoteAutoformat(ownerDocument?: Dynamic, blockType?: Dynamic): Dynamic {
  ownerDocument.execCommand("styleWithCSS", false, "false");
  blockType === "ul"
    ? ownerDocument.execCommand("insertUnorderedList")
    : blockType === "ol"
      ? ownerDocument.execCommand("insertOrderedList")
      : blockType === "quote"
        ? ownerDocument.execCommand("formatBlock", false, "BLOCKQUOTE")
        : ownerDocument.execCommand("formatBlock", false, blockType.toUpperCase());
}
function handleNoteAutoformat(
  element?: Dynamic,
  inputEvent?: Dynamic,
  readEditorText?: Dynamic,
  allowedBlockTypes?: Dynamic,
  allowListMarkers: Dynamic = false,
): Dynamic {
  if (noteAutoformatExecuting) return false;
  let ownerDocument: Dynamic = element.ownerDocument,
    entry: Dynamic = NotesAutoformatElementCache.get(element);
  NotesAutoformatElementCache.delete(element);
  if (
    inputEvent.inputType === "historyUndo" ||
    inputEvent.inputType === "historyRedo"
  ) {
    if (entry === undefined) return false;
    let isUndo: Dynamic = inputEvent.inputType === "historyUndo";
    if (
      !(isUndo ? entry.undoArmed : entry.redoArmed) ||
      readEditorText(element) !== entry.intermediate
    )
      return false;
    noteAutoformatExecuting = true;
    try {
      ownerDocument.execCommand(isUndo ? "undo" : "redo");
    } finally {
      noteAutoformatExecuting = false;
    }
    NotesAutoformatElementCache.set(element, {
      ...entry,
      undoArmed: !isUndo,
      redoArmed: isUndo,
    });
    return false;
  }
  if (
    inputEvent.inputType !== "insertText" ||
    (inputEvent.data !== " " && inputEvent.data !== "\xA0")
  )
    return false;
  let selection: Dynamic = ownerDocument.getSelection();
  if (selection === null || selection.rangeCount === 0 || !selection.isCollapsed)
    return false;
  let caretRange: Dynamic = selection.getRangeAt(0);
  if (!element.contains(caretRange.startContainer)) return false;
  let blockRoot: Dynamic = element,
    currentNode: Dynamic =
      caretRange.startContainer.nodeType === 3
        ? caretRange.startContainer.parentElement
        : caretRange.startContainer;
  for (
    ;
    currentNode !== null && currentNode !== element;
    currentNode = currentNode.parentElement
  ) {
    if (
      /^(LI|UL|OL|H[1-6]|BLOCKQUOTE|PRE|TABLE|CODE|A)$/.test(currentNode.tagName)
    )
      return false;
    blockRoot === element &&
      (currentNode.tagName === "DIV" || currentNode.tagName === "P") &&
      (blockRoot = currentNode);
  }
  let markerRange: Dynamic = ownerDocument.createRange();
  markerRange.selectNodeContents(blockRoot);
  markerRange.setEnd(caretRange.startContainer, caretRange.startOffset);
  if (markerRange.cloneContents().querySelector('[contenteditable="false"]'))
    return false;
  let blockType: Dynamic = noteAutoformatShortcut(markerRange.toString(), allowListMarkers);
  if (blockType === null || (allowedBlockTypes !== undefined && !allowedBlockTypes.includes(blockType)))
    return false;
  let listStart: Dynamic =
    allowListMarkers && blockType === "ol"
      ? Number.parseInt(markerRange.toString().trim(), 10)
      : 1;
  selection.removeAllRanges();
  selection.addRange(markerRange);
  ownerDocument.execCommand("delete");
  let textBeforeFormat: Dynamic = readEditorText(element);
  applyNoteAutoformat(ownerDocument, blockType);
  if (listStart > 1) {
    let anchorNode: Dynamic = ownerDocument.getSelection()?.anchorNode ?? null,
      orderedList: Dynamic = (
        anchorNode?.nodeType === 1 ? anchorNode : anchorNode?.parentElement
      )?.closest("li")?.parentElement;
    orderedList?.tagName === "OL" &&
      orderedList.childElementCount === 1 &&
      orderedList.setAttribute("start", String(listStart));
  }
  NotesAutoformatElementCache.set(element, {
    intermediate: textBeforeFormat,
    undoArmed: true,
    redoArmed: false,
  });
  return true;
}
function installNoteInputRules(
  editor?: Dynamic,
  getFormatState?: Dynamic,
  inputOptions?: Dynamic,
): Dynamic {
  let handleBeforeInput: Dynamic = (event?: Dynamic): Dynamic => {
    if (
      NotesFormattingHandler() ||
      typeof event.inputType != "string"
    )
      return;
    if (
      inputOptions?.lists === false &&
      /^insert(Un)?orderedList$/i.test(event.inputType)
    )
      return event.preventDefault();
    if (!event.inputType.startsWith("format")) return;
    event.preventDefault();
    let formatState: Dynamic = getFormatState();
    formatState &&
      (event.inputType === "formatBold" ||
        event.inputType === "formatItalic") &&
      toggleNoteFormatting(
        event.inputType === "formatBold" ? "bold" : "italic",
        formatState,
      );
  };
  editor.addEventListener("beforeinput", handleBeforeInput);
  return (): Dynamic => editor.removeEventListener("beforeinput", handleBeforeInput);
}
function handleNoteFormattingShortcut(
  event?: Dynamic,
  formatState?: Dynamic,
): Dynamic {
  if (
    !(event.metaKey || event.ctrlKey) ||
    event.altKey ||
    event.shiftKey ||
    !/^[biu]$/i.test(event.key)
  )
    return false;
  event.preventDefault();
  let formatKey: Dynamic = event.key.toLowerCase();
  formatState &&
    formatKey !== "u" &&
    toggleNoteFormatting(
      formatKey === "b" ? "bold" : "italic",
      formatState,
    );
  return true;
}
function moveNoteCaretToEnd(editor?: Dynamic): Dynamic {
  let selection: Dynamic = (window as Dynamic).getSelection();
  if (!selection || !editor.lastChild) return false;
  let deepestNode: Dynamic = editor;
  for (
    ;
    deepestNode.lastChild && /^(DIV|UL|OL|LI)$/.test(deepestNode.lastChild.nodeName);

  )
    deepestNode = deepestNode.lastChild;
  let caretRange: Dynamic = (document as Dynamic).createRange();
  caretRange.selectNodeContents(deepestNode);
  caretRange.collapse(false);
  selection.removeAllRanges();
  selection.addRange(caretRange);
  return true;
}
export {
  applyNoteAutoformat,
  ContenteditableFalseValue,
  handleNoteAutoformat,
  handleNoteFormattingShortcut,
  installNoteInputRules,
  moveNoteCaretToEnd,
  noteAutoformatExecuting,
  noteAutoformatShortcut,
  NotesAutoformatCaretPositionFromPoint,
  NotesAutoformatElementCache,
  NotesAutoformatExecCommand,
  NotesAutoformatItems,
  NotesAutoformatOnPasteOnDropOnDragStartConfig,
  NotesAutoformatParentNode,
};
export function installEditorNotesAutoformat(): () => void {
  return () => {
    NotesAutoformatItems = [
      ["# ", "h1"],
      ["## ", "h2"],
      ["### ", "h3"],
      ["- ", "ul"],
      ["* ", "ul"],
      ["1. ", "ol"],
      ["> ", "quote"],
    ];
    NotesAutoformatElementCache = new WeakMap();
    noteAutoformatExecuting = false;
    ContenteditableFalseValue = '[contenteditable="false"]';
    NotesAutoformatParentNode = (
      range?: Dynamic,
      node?: Dynamic,
    ): Dynamic => {
      let parentNode: Dynamic = node.parentNode;
      range.collapse(
        parentNode,
        [...parentNode.childNodes].indexOf(node) + 1,
      );
    };
    NotesAutoformatCaretPositionFromPoint = (
      x?: Dynamic,
      y?: Dynamic,
    ): Dynamic => {
      let caretPosition: Dynamic = (document as Dynamic).caretPositionFromPoint?.(
        x,
        y,
      );
      if (caretPosition) return [caretPosition.offsetNode, caretPosition.offset];
      let caretRange: Dynamic = (document as Dynamic).caretRangeFromPoint?.(
        x,
        y,
      );
      return caretRange ? [caretRange.startContainer, caretRange.startOffset] : null;
    };
    NotesAutoformatExecCommand = (text?: Dynamic): Dynamic => {
      text && (document as Dynamic).execCommand("insertText", false, text);
    };
    NotesAutoformatOnPasteOnDropOnDragStartConfig = {
      onPaste: (event?: Dynamic): Dynamic => {
        event.preventDefault();
        NotesAutoformatExecCommand(event.clipboardData.getData("text/plain"));
      },
      onDrop: (event?: Dynamic): Dynamic => {
        event.preventDefault();
        event.stopPropagation();
        NotesAutoformatExecCommand(event.dataTransfer.getData("text/plain"));
      },
      onDragStart: (event?: Dynamic): Dynamic => event.preventDefault(),
      onDragOver: (event?: Dynamic): Dynamic => {
        event.preventDefault();
        event.stopPropagation();
      },
    };
  };
}
