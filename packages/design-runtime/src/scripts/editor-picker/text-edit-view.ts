import { restoreDescendantAccessibility, restoreEditorAccessibility, selectTextRange, setEditorAccessibility } from "./text-edit-dom";
import type { createSvgTextEditorController } from "./svg-text-editor";
import type { Dynamic } from "../../runtime-types";

interface TextEditViewOptions {
  readSession(): Dynamic;
  svg: ReturnType<typeof createSvgTextEditorController>;
  finishDetachedSvgEdit(): boolean;
  updateTouchPolicy(): void;
  emit(message: Dynamic): void;
}

const importedInputEvents = [
  "keydown", "keyup", "keypress", "mousedown", "mouseup", "pointerdown", "pointerup", "dblclick",
] as const;

export function editedTemplateId(session: Dynamic) {
  const element = session && (session.mount || session.svg || session.el);
  const id = element ? parseInt(element.getAttribute("data-dc-tpl"), 10) : NaN;
  return Number.isNaN(id) ? session?.tid : id;
}

function linkAtCaret(editor: Element) {
  const node = document.getSelection()?.anchorNode;
  const element = node?.nodeType === Node.ELEMENT_NODE ? node as Element : node?.parentElement;
  const link = element?.closest("a");
  return link && editor.contains(link) ? link : null;
}

export function createTextEditView(options: TextEditViewOptions) {
  let timer: ReturnType<typeof setTimeout> | null = null;

  function emitState(active: boolean) {
    options.updateTouchPolicy();
    if (timer) clearTimeout(timer);
    timer = null;
    const session = options.readSession();
    if (!active || !session) {
      options.emit({ type: "textEditState", active: false });
      return;
    }
    if (session.scriptTarget || session.propTarget || session.importTarget || session.svg) {
      options.emit({ type: "textEditState", active: true, plain: true, tid: editedTemplateId(session) });
      return;
    }

    const formats = { bold: false, italic: false, underline: false, ul: false, ol: false, link: false };
    try { formats.bold = !!document.queryCommandState("bold"); } catch {}
    try { formats.italic = !!document.queryCommandState("italic"); } catch {}
    try {
      const link = linkAtCaret(session.el);
      formats.underline = link
        ? (getComputedStyle(link).textDecorationLine || "").includes("underline")
        : !!document.queryCommandState("underline");
    } catch {}
    try { formats.ul = !!document.queryCommandState("insertUnorderedList"); } catch {}
    try { formats.ol = !!document.queryCommandState("insertOrderedList"); } catch {}
    try { formats.link = !!linkAtCaret(session.el); } catch {}
    options.emit({ type: "textEditState", active: true, formats, tid: editedTemplateId(session) });
  }

  function scheduleState() {
    const session = options.readSession();
    if (session?.svg) options.svg.repaintSvgTextSelection();
    if (!session || timer) return;
    timer = setTimeout(() => {
      timer = null;
      if (options.readSession()) emitState(true);
    }, 120);
  }

  function onInput() {
    if (options.finishDetachedSvgEdit()) return;
    const session = options.readSession();
    if (session?.svg) {
      if (session.svgText.parentNode !== session.svg) {
        session.svg.textContent = "";
        session.svg.appendChild(session.svgText);
      }
      session.svgText.nodeValue = session.el.textContent;
    } else if (session) {
      restoreDescendantAccessibility(session.el);
    }
    scheduleState();
  }

  function onPaste(event: ClipboardEvent) {
    try {
      const session = options.readSession();
      if (!session) return;
      const text = event.clipboardData?.getData("text/plain") || "";
      const href = text.trim();
      if (session.svg || session.importTarget) {
        event.preventDefault();
        event.stopPropagation();
        document.execCommand("insertText", false, text.replace(/[ \t]*[\r\n]+[ \t]*/g, " "));
        return;
      }
      if (session.scriptTarget || session.propTarget || !/^https?:\/\/\S+$/i.test(href)) return;
      const selection = document.getSelection();
      if (!selection?.rangeCount || selection.isCollapsed) return;
      const range = selection.getRangeAt(0);
      if (!session.el.contains(range.commonAncestorContainer)) return;
      event.preventDefault();
      event.stopPropagation();
      const link = document.createElement("a");
      link.setAttribute("href", href);
      try {
        range.surroundContents(link);
      } catch {
        link.appendChild(range.extractContents());
        range.insertNode(link);
      }
      selection.removeAllRanges();
      const caret = document.createRange();
      caret.setStartAfter(link);
      caret.collapse(true);
      selection.addRange(caret);
      onInput();
    } catch {}
  }

  function onImportedInput(event: Event) {
    const session = options.readSession();
    if (session?.importTarget && session.el.contains(event.target)) event.stopPropagation();
  }

  function attach(element: HTMLElement, imported = false) {
    if (imported) {
      for (const event of importedInputEvents) document.addEventListener(event, onImportedInput, true);
    }
    element.setAttribute("contenteditable", "true");
    element.setAttribute("data-dc-editor-editing", imported ? "import" : "");
    setEditorAccessibility(element, imported);
    element.addEventListener("input", onInput);
    element.addEventListener("paste", onPaste);
    document.addEventListener("selectionchange", scheduleState);
    element.focus();
  }

  function release(session: Dynamic) {
    const { el } = session;
    el.removeEventListener("input", onInput);
    el.removeEventListener("paste", onPaste);
    document.removeEventListener("selectionchange", scheduleState);
    if (session.origCE != null) el.setAttribute("contenteditable", session.origCE);
    else el.removeAttribute("contenteditable");
    el.removeAttribute("data-dc-editor-editing");
    restoreEditorAccessibility(el);
  }

  function releaseImported() {
    for (const event of importedInputEvents) document.removeEventListener(event, onImportedInput, true);
  }

  function focus(caret?: "end" | "all") {
    const session = options.readSession();
    const { el } = session;
    let selectionInside = false;
    try {
      const selection = document.getSelection();
      selectionInside = !!selection?.rangeCount && el.contains(selection.getRangeAt(0).startContainer);
    } catch {}
    try { el.focus(); } catch {}
    if (!selectionInside) selectTextRange(el, caret);
    emitState(true);
    if (session.svg) options.svg.positionSvgTextEditor();
  }

  return { attach, release, releaseImported, focus, emitState };
}
