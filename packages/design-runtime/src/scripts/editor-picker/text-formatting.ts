import { nearestComponentName, unwrapDisplayContentsHost } from "./element-query";
import { unwrapLinkPreservingEdges } from "./text-markup";

interface EditableText {
  el: HTMLElement;
  tid?: number;
  name?: string | null;
  foreign?: boolean;
  scriptTarget?: unknown;
  propTarget?: unknown;
  importTarget?: unknown;
  svg?: unknown;
}

interface FormattingOptions {
  current(): EditableText | null;
  templateId(): number | null;
  emitState(): void;
  emit(event: object): void;
  finish(): void;
}

function focus(element: HTMLElement) {
  try { element.focus(); } catch {}
}

function anchorOf(node: Node | null | undefined) {
  const element = node?.nodeType === Node.ELEMENT_NODE ? node as Element : node?.parentElement;
  return element?.closest("a") ?? null;
}

function box(rect: DOMRectReadOnly | null) {
  return rect ? { x: rect.left, y: rect.top, w: rect.width, h: rect.height } : { x: 0, y: 0, w: 0, h: 0 };
}

function markRange(range: Range) {
  const end = document.createTextNode("");
  const endRange = range.cloneRange();
  endRange.collapse(false);
  endRange.insertNode(end);
  const start = document.createTextNode("");
  const startRange = range.cloneRange();
  startRange.collapse(true);
  startRange.insertNode(start);
  return { start, end };
}

function toggleUnderline(editor: HTMLElement) {
  try {
    const selection = getSelection();
    const range = selection?.rangeCount ? selection.getRangeAt(0) : null;
    const links: HTMLElement[] = [];
    if (range) {
      if (editor.tagName.toLowerCase() === "a") links.push(editor);
      for (const link of editor.querySelectorAll("a")) {
        if (range.intersectsNode(link)) links.push(link);
      }
    }
    const anchor = anchorOf(range?.commonAncestorContainer);
    const activeLink = anchor && editor.contains(anchor) ? anchor : null;
    const shouldUnderline = activeLink
      ? !(getComputedStyle(activeLink).textDecorationLine || "").includes("underline")
      : !document.queryCommandState("underline");
    document.execCommand("underline");
    if (document.queryCommandState("underline") !== shouldUnderline) document.execCommand("underline");
    for (const link of links) {
      const decorations = (getComputedStyle(link).textDecorationLine || "").split(/\s+/)
        .filter((item) => item && item !== "none");
      const underline = decorations.indexOf("underline");
      if (shouldUnderline && underline < 0) decorations.push("underline");
      if (!shouldUnderline && underline >= 0) decorations.splice(underline, 1);
      link.style.textDecorationLine = decorations.length ? decorations.join(" ") : "none";
    }
  } catch {}
}

export function createTextFormatting(options: FormattingOptions) {
  let pendingLinkRange: Range | null = null;

  function elementLink(link: HTMLAnchorElement, id: number | undefined, name: string | null | undefined) {
    pendingLinkRange = null;
    options.emit({ type: "linkEdit", href: link.getAttribute("href") || "", collapsed: false,
      rect: box(link.getBoundingClientRect()), hostTid: id, hostName: name, isElementLink: true });
  }

  function openLinkEdit() {
    let href = "";
    let collapsed = true;
    let bounds: DOMRectReadOnly | null = null;
    try {
      const selection = getSelection()!;
      const link = anchorOf(selection.anchorNode);
      const current = options.current();
      if (link && current && !current.foreign) {
        if (link === current.el) {
          elementLink(link, current.tid, current.name);
          return;
        }
        if (!current.el.contains(link) && link.contains(current.el)) {
          const id = parseInt(link.getAttribute("data-dc-tpl")!, 10);
          if (!Number.isNaN(id)) {
            elementLink(link, id, nearestComponentName(link));
            return;
          }
        }
      }
      href = link?.getAttribute("href") || "";
      if (selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        pendingLinkRange = range.cloneRange();
        collapsed = range.collapsed;
        bounds = range.getBoundingClientRect();
      }
      if ((!bounds || (!bounds.width && !bounds.height)) && link) bounds = link.getBoundingClientRect();
      if ((!bounds || (!bounds.width && !bounds.height)) && current) {
        bounds = unwrapDisplayContentsHost(current.el).getBoundingClientRect();
      }
    } catch {}
    options.emit({ type: "linkEdit", href, collapsed, rect: box(bounds) });
  }

  function format(command?: unknown, id?: unknown) {
    const current = options.current();
    if (!current || current.scriptTarget || current.propTarget || current.importTarget || current.svg ||
        (id != null && options.templateId() !== id)) return;

    switch (command) {
      case "bold":
      case "italic":
      case "ul":
      case "ol":
        focus(current.el);
        document.execCommand(command === "ul" ? "insertUnorderedList" : command === "ol" ? "insertOrderedList" : command);
        break;
      case "underline":
        focus(current.el);
        toggleUnderline(current.el);
        break;
      case "link":
        focus(current.el);
        openLinkEdit();
        break;
      default:
        return;
    }
    options.emitState();
  }

  function cancelLinkEdit() {
    pendingLinkRange = null;
    const current = options.current();
    if (!current) return;
    focus(current.el);
    options.emitState();
  }

  function applyLink(href?: string | null) {
    const current = options.current();
    if (!current) return;
    if (!pendingLinkRange) {
      cancelLinkEdit();
      return;
    }

    let applied: HTMLAnchorElement | null = null;
    try {
      const editor = current.el;
      editor.focus();
      const selection = getSelection();
      const range = pendingLinkRange;
      const nearestLink = anchorOf(range.commonAncestorContainer);
      const innerLink = nearestLink && nearestLink !== editor && editor.contains(nearestLink) ? nearestLink : null;
      const outerLink = nearestLink && !innerLink ? nearestLink : null;
      if (href == null || href === "") {
        const edges = range.collapsed ? null : markRange(range);
        const links = innerLink ? [innerLink] : [];
        for (const link of editor.querySelectorAll("a")) {
          if (!links.includes(link) && range.intersectsNode(link)) links.push(link);
        }
        for (const link of links) {
          if (link !== editor && editor.contains(link)) {
            unwrapLinkPreservingEdges(link, edges?.start ?? null, edges?.end ?? null);
          }
        }
        edges?.start.remove();
        edges?.end.remove();
      } else if (innerLink) {
        innerLink.setAttribute("href", href);
        if (!current.foreign) applied = innerLink;
      } else if (!range.collapsed && !outerLink) {
        const { start, end } = markRange(range);
        for (const link of editor.querySelectorAll("a")) {
          if (link !== editor && editor.contains(link) && range.intersectsNode(link)) unwrapLinkPreservingEdges(link, start, end);
        }
        range.setStartAfter(start);
        range.setEndBefore(end);
        const link = document.createElement("a");
        link.setAttribute("href", href);
        try {
          range.surroundContents(link);
        } catch {
          link.appendChild(range.extractContents());
          range.insertNode(link);
        }
        try {
          selection?.removeAllRanges();
          const caret = document.createRange();
          caret.setStartAfter(link);
          caret.collapse(true);
          selection?.addRange(caret);
        } catch {}
        start.remove();
        end.remove();
        if (!current.foreign) applied = link;
      }
    } catch {}
    pendingLinkRange = null;
    if (applied) {
      try { applied.setAttribute("data-dc-link-new", ""); } catch {}
      options.finish();
    } else {
      options.emitState();
    }
  }

  return { format, applyLink, cancelLinkEdit, reset: () => { pendingLinkRange = null; } };
}
