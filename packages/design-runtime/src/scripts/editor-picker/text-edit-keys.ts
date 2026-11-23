import { consumeKey } from "./keyboard-shortcuts";

interface KeyTextSession {
  el: HTMLElement;
  svg?: Element | null;
  importTarget?: unknown;
}

export function handleTextEditKey(
  event: KeyboardEvent,
  session: KeyTextSession,
  finishTextEdit: () => void,
) {
  const { key, isComposing, ctrlKey, metaKey, altKey, shiftKey } = event;
  const { el } = session;
  if (key === " " && !isComposing && !ctrlKey && !metaKey && !altKey &&
      el.contains(event.target as Node | null) && el.closest("button, summary")) {
    consumeKey(event);
    document.execCommand("insertText", false, " ");
    return;
  }

  if (document.activeElement !== el && !el.contains(document.activeElement)) el.focus();

  if ((session.svg || session.importTarget) && key === "Enter") {
    if (isComposing || event.keyCode === 229) return;
    consumeKey(event);
    finishTextEdit();
    return;
  }
  if (key === "Enter" && !shiftKey && !isComposing && !ctrlKey && !metaKey) {
    const selectionNode = document.getSelection()?.anchorNode;
    const element = selectionNode?.nodeType === Node.ELEMENT_NODE
      ? selectionNode as Element : selectionNode?.parentElement;
    const listItem = element?.closest("li");
    if (!listItem || listItem === el || !el.contains(listItem)) {
      consumeKey(event);
      if (!document.execCommand("insertLineBreak")) document.execCommand("insertHTML", false, "<br>");
      return;
    }
  }
  if (key === "Escape" ||
      (key === "Tab" && !ctrlKey && !metaKey && !isComposing && event.keyCode !== 229)) {
    consumeKey(event);
    finishTextEdit();
  }
}
