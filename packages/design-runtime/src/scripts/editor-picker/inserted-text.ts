interface InsertedTextOptions {
  enabled(): boolean;
  readOnly(): boolean;
  editedElement(): HTMLElement | null;
  findTemplateInstances(id: string, component: string | null): Element[];
  canEditText(id: number, element: Element): boolean;
  beginTextEdit(element: Element): void;
}

interface InsertedTextWatch {
  id: number;
  name: string | null;
  typed: string;
  deadline: number;
  stampCount: number;
  seen: WeakSet<Element> | null;
  mapped: boolean;
  observer: MutationObserver;
  timer: ReturnType<typeof setTimeout>;
}

function textNodeAtOffset(element: HTMLElement, offset: number): [Node, number] {
  const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);
  let last: Text | null = null;
  for (let current = walker.nextNode(); current; current = walker.nextNode()) {
    const text = current as Text;
    last = text;
    if (offset <= text.data.length) return [text, offset];
    offset -= text.data.length;
  }
  return last ? [last, last.data.length] : [element, 0];
}

export function createInsertedTextEditor(options: InsertedTextOptions) {
  let watch: InsertedTextWatch | null = null;
  let snapshot: { at: number; stampCount: number; seen: WeakSet<Element> } | null = null;
  let heldTextElement: HTMLElement | null = null;
  let typedOffset = 0;
  const stampedElements = () => document.querySelectorAll("[data-dc-tpl]");

  function noteInsert() {
    const elements = stampedElements();
    snapshot = { stampCount: elements.length, at: Date.now(), seen: new WeakSet(elements) };
  }

  function cancelWatch() {
    if (watch) {
      watch.observer.disconnect();
      clearTimeout(watch.timer);
    }
    watch = null;
  }

  function insertHeldText(element: HTMLElement, text: string) {
    const selection = document.getSelection();
    const range = selection && selection.rangeCount ? selection.getRangeAt(0) : null;
    let previousRange: Range | null = null;
    if (selection && range?.collapsed && element.contains(range.startContainer)) {
      const [node, offset] = textNodeAtOffset(element, typedOffset);
      if (range.startContainer !== node || range.startOffset !== offset) previousRange = range.cloneRange();
      selection.collapse(node, offset);
    }
    const advance = text !== "" ? text.length : typedOffset > 0 ? -1 : 0;
    if (text !== "") document.execCommand("insertText", false, text);
    else if (advance) document.execCommand("delete", false);
    if (selection && previousRange) {
      selection.removeAllRanges();
      selection.addRange(previousRange);
    }
    typedOffset += advance;
  }

  function reconcile() {
    const current = watch;
    if (!current) return;
    if (options.readOnly() || !options.enabled() || options.editedElement() || Date.now() > current.deadline) {
      cancelWatch();
      return;
    }
    const count = stampedElements().length;
    if (count < current.stampCount) current.stampCount = count;
    if (!current.mapped || count <= current.stampCount) return;
    const [element] = options.findTemplateInstances(String(current.id), current.name);
    if (!element || current.seen?.has(element) || !options.canEditText(current.id, element)) return;

    cancelWatch();
    options.beginTextEdit(element);
    heldTextElement = options.editedElement();
    typedOffset = 0;
    if (heldTextElement && current.typed) insertHeldText(heldTextElement, current.typed);
  }

  function start(id: number, name?: string | null, typed?: unknown, requestedDeadline?: unknown) {
    cancelWatch();
    const base = snapshot && Date.now() - snapshot.at < 5e3
      ? snapshot : { stampCount: stampedElements().length, seen: null };
    const deadline = typeof requestedDeadline === "number" ? requestedDeadline : Date.now() + 2e3;
    const observer = new MutationObserver(reconcile);
    watch = {
      id, name: name || null, typed: typeof typed === "string" ? typed : "",
      deadline, stampCount: base.stampCount, seen: base.seen, mapped: false,
      observer, timer: setTimeout(reconcile, Math.max(0, deadline - Date.now()) + 1),
    };
    snapshot = null;
    heldTextElement = null;
    observer.observe(document.body, { childList: true, subtree: true });
  }

  function markMapped() {
    if (!watch) return;
    watch.mapped = true;
    reconcile();
  }

  function heldTextKey(key: unknown) {
    if (typeof key !== "string" || key.length > 1) return;
    if (watch) {
      watch.typed = key ? watch.typed + key : watch.typed.slice(0, -1);
      return;
    }
    const editor = options.editedElement();
    if (editor && editor === heldTextElement) insertHeldText(editor, key);
    else heldTextElement = null;
  }

  function drop(keepPending?: string) {
    snapshot = null;
    if (keepPending && watch && Date.now() <= watch.deadline) watch.typed = "";
    else cancelWatch();
  }

  return { noteInsert, start, markMapped, heldTextKey, drop, cancelWatch };
}
