const BLANK_TEXT = /^[ \t\n\r\f]*$/;
const TRAILING_WHITESPACE = /[ \t\n\r\f]+$/;
const EDITOR_NAMED = "data-dc-editor-named";
const EDITOR_LABEL = [
  ["role", "textbox"],
  ["aria-label", "Edit text"],
  ["aria-multiline", "true"],
] as const;
const EDITOR_CHROME = "[data-dc-editor-overlay],[data-dc-editor-overlay-root],[data-omelette-chrome],[data-omelette-injected]";

export function selectTextRange(editor: Element, placement?: "end" | "all") {
  try {
    const selection = editor.ownerDocument.getSelection();
    if (!selection) return;
    selection.removeAllRanges();
    const range = editor.ownerDocument.createRange();
    if (placement !== "end") {
      range.selectNodeContents(editor);
      selection.addRange(range);
      return;
    }

    let end: Node = editor;
    let preserveWhitespace = false;
    while (end.lastChild) {
      let child = end.lastChild;
      preserveWhitespace = false;
      try {
        preserveWhitespace = /^pre|^break-spaces/.test(getComputedStyle(end as Element).whiteSpace || "");
      } catch {}
      while (
        !preserveWhitespace &&
        child.previousSibling &&
        child.nodeType === Node.TEXT_NODE &&
        BLANK_TEXT.test((child as Text).data)
      ) {
        child = child.previousSibling;
      }
      end = child;
      if (end.nodeType !== Node.ELEMENT_NODE || end.nodeName.toUpperCase() === "A") break;
    }

    if (end.nodeType === Node.TEXT_NODE) {
      const { data } = end as Text;
      range.setStart(end, preserveWhitespace ? data.length : data.replace(TRAILING_WHITESPACE, "").length);
    } else if (end !== editor) {
      range.setStartAfter(end);
    } else {
      range.setStart(editor, 0);
    }
    range.collapse(true);
    selection.addRange(range);
  } catch {}
}

export function caretNodeAtPointer(document: Document, pointer: Pick<MouseEvent, "clientX" | "clientY">) {
  const { clientX, clientY } = pointer;
  const node = document.caretRangeFromPoint
    ? document.caretRangeFromPoint(clientX, clientY)?.startContainer
    : document.caretPositionFromPoint?.(clientX, clientY)?.offsetNode;
  if (node?.nodeType !== Node.TEXT_NODE || !(node.nodeValue || "").trim()) return null;

  const range = document.createRange();
  range.selectNodeContents(node);
  for (const rect of range.getClientRects()) {
    if (
      clientX >= rect.left - 1 && clientX <= rect.right + 1 &&
      clientY >= rect.top - 1 && clientY <= rect.bottom + 1
    ) return node as Text;
  }
  return null;
}

export function isVisibleTextNode(
  node: Text,
  editor: Element,
  trustCaretHit: boolean,
  viewportScale: (element: Element) => number,
) {
  const document = node.ownerDocument;
  const parent = node.parentElement;
  if (!parent) return false;
  const range = document.createRange();
  range.selectNodeContents(node);
  const [rect] = range.getClientRects();
  if (!rect || rect.height / viewportScale(parent) < 2 || getComputedStyle(parent).visibility !== "visible") {
    return false;
  }

  for (let ancestor: Element | null = parent; ancestor; ancestor = ancestor.parentElement) {
    const style = getComputedStyle(ancestor);
    const clips = style.overflowX !== "visible" || style.overflowY !== "visible";
    const { offsetWidth, offsetHeight } = ancestor as HTMLElement;
    if (
      parseFloat(style.opacity) === 0 ||
      (ancestor !== editor && editor.contains(ancestor) && clips &&
        (offsetWidth < 2 || offsetHeight < 2))
    ) return false;
  }
  if (trustCaretHit) return true;

  const stack = document.elementsFromPoint(rect.left + rect.width / 2, rect.top + rect.height / 2);
  const visible = stack.find((element) => !element.closest(EDITOR_CHROME));
  return Boolean(visible && editor.contains(visible));
}

function accessibleValue(name: string, value: string, singleLine: boolean) {
  return singleLine && name === "aria-multiline" ? "false" : value;
}

export function setEditorAccessibility(editor: Element, singleLine = false) {
  if (EDITOR_LABEL.some(([name]) => editor.hasAttribute(name)) || editor.hasAttribute("aria-labelledby")) return;
  for (const [name, value] of EDITOR_LABEL) {
    editor.setAttribute(name, accessibleValue(name, value, singleLine));
  }
  editor.setAttribute(EDITOR_NAMED, singleLine ? "one-line" : "");
}

export function restoreEditorAccessibility(editor: Element) {
  if (!editor.hasAttribute(EDITOR_NAMED)) return;
  const singleLine = editor.getAttribute(EDITOR_NAMED) === "one-line";
  for (const [name, value] of EDITOR_LABEL) {
    if (editor.getAttribute(name) === accessibleValue(name, value, singleLine)) {
      editor.removeAttribute(name);
    }
  }
  editor.removeAttribute(EDITOR_NAMED);
}

export function restoreDescendantAccessibility(editor: Element) {
  for (const descendant of editor.querySelectorAll(`[${EDITOR_NAMED}]`)) {
    restoreEditorAccessibility(descendant);
  }
}

export function authoredAccessibilityAttribute(element: Element, attribute: string) {
  const value = element.getAttribute(attribute);
  const editorName = element.getAttribute(EDITOR_NAMED);
  if (editorName === null) return value;
  const editMultiline = editorName === "one-line" ? "false" : "true";
  if ((attribute === "role" && value === "textbox") ||
      (attribute === "aria-label" && value === "Edit text") ||
      (attribute === "aria-multiline" && value === editMultiline)) return null;
  return value;
}
