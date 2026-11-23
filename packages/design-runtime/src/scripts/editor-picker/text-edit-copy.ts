import { extractTemplateTextMarkup } from "./text-markup";
import type { Dynamic } from "../../runtime-types";

interface PreviewCopy {
  element: Element;
  nodes: Node[];
  name: string | null;
  id: number;
  source: string;
}

export function restoreTextNodes(element: Element, nodes: Node[]) {
  element.innerHTML = "";
  for (const node of nodes) element.appendChild(node);
}

export function originalTextMarkup(element: Element, original: Node[], visible: Node[]) {
  if (original === visible) return element.innerHTML;
  const wrapper = document.createElement("div");
  for (const node of original) wrapper.appendChild(node.cloneNode(true));
  for (const stamp of wrapper.querySelectorAll("[data-dc-tpl]")) stamp.removeAttribute("data-dc-tpl");
  return wrapper.innerHTML;
}

export function cloneEditableNodes(element: Element, original: Node[]) {
  const editable = original.map((node) => node.cloneNode(true));
  element.innerHTML = "";
  for (const node of editable) {
    if (node.nodeType === Node.ELEMENT_NODE) {
      const child = node as Element;
      child.removeAttribute("data-dc-tpl");
      for (const stamped of child.querySelectorAll("[data-dc-tpl]")) stamped.removeAttribute("data-dc-tpl");
    }
    element.appendChild(node);
  }
}

export function createTextEditCopy({
  readSession, findTemplateInstances,
}: {
  readSession(): Dynamic;
  findTemplateInstances(id: string, name: string | null): Element[];
}) {
  let copy: PreviewCopy | null = null;
  let scroll: { name: string | null; panes: Record<string, { top: number; left: number }> } | null = null;
  let timer: ReturnType<typeof setTimeout> | undefined;

  function isBeingEdited(element: Element) {
    const session = readSession();
    return session && (session.el === element || session.svg === element);
  }

  function sourceMarkup(name: string | null, id: number) {
    try {
      return extractTemplateTextMarkup((window as Dynamic).__dcAnnotatedTemplate(name), id);
    } catch {
      return null;
    }
  }

  function drop() {
    const current = copy;
    copy = null;
    if (current?.element.isConnected && !isBeingEdited(current.element)) {
      try { restoreTextNodes(current.element, current.nodes); } catch {}
    }
  }

  function afterPush() {
    if (!copy) return;
    if (!copy.element.isConnected || isBeingEdited(copy.element)) {
      copy = null;
    } else if (sourceMarkup(copy.name, copy.id) === copy.source) {
      drop();
    }
  }

  function takeOriginalNodes(element: Element, currentNodes: Node[]) {
    if (copy?.element !== element) return currentNodes;
    const { nodes } = copy;
    copy = null;
    return nodes;
  }

  function hold(element: Element, original: Node[], name: string | null, id: number) {
    const panes: Record<string, { top: number; left: number }> = {};
    for (let pane: Element | null = element; pane?.hasAttribute("data-dc-tpl"); pane = pane.parentElement) {
      if (pane.scrollTop || pane.scrollLeft) {
        panes[pane.getAttribute("data-dc-tpl")!] = { top: pane.scrollTop, left: pane.scrollLeft };
      }
    }
    scroll = { name, panes };
    clearTimeout(timer);
    timer = setTimeout(() => { scroll = null; }, 400);

    if (!(window as Dynamic).__dcAnnotatedTemplate) return;
    const source = sourceMarkup(name, id);
    if (source !== null) copy = { element, nodes: original, name, id, source };
  }

  function restoreScroll() {
    if (!scroll) return;
    clearTimeout(timer);
    for (const [id, offset] of Object.entries(scroll.panes)) {
      const [pane] = findTemplateInstances(id, scroll.name);
      if (pane) {
        pane.scrollTop = offset.top;
        pane.scrollLeft = offset.left;
      }
    }
    scroll = null;
  }

  return {
    drop, afterPush, takeOriginalNodes, hold, restoreScroll,
    get current() { return copy; },
  };
}
