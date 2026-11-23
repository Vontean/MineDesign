import { isCollapsedDeckWrapper, isDeckStage, isDeckStageWrapper } from "./deck-target";
import { componentScopeName } from "./element-query";
import { permitsElementNesting } from "./drop-nesting";

const stamped = "[data-dc-tpl]";
const svgNamespace = "http://www.w3.org/2000/svg";

interface DropGesture {
  tag?: string | null;
  fromDrawing?: boolean;
  origAncestorEls: Element[];
  brk?: boolean;
  startRect: Pick<DOMRectReadOnly, "width" | "height">;
  peerParent?: Element | null;
  peerTid?: number;
  name?: string | null;
}

function templateId(element: Element) {
  return parseInt(element.getAttribute("data-dc-tpl")!, 10);
}

function stampedParent(element: Element | null) {
  return element?.parentElement?.closest(stamped) ?? null;
}

function deckContainer(element: Element) {
  return isDeckStage(element) || isDeckStageWrapper(element) || isCollapsedDeckWrapper(element);
}

function rejectsDrop(container: Element, source: Element | null, childTag: string | null | undefined,
                     group: readonly Element[] | null | undefined, fromDrawing?: boolean) {
  if ((source && (container === source || source.contains(container))) ||
      !permitsElementNesting(container.tagName, childTag) ||
      (source && !fromDrawing && container.namespaceURI === svgNamespace)) return true;
  return Boolean(group?.some((element) => element.contains(container) ||
    (source && !permitsElementNesting(container.tagName, element.tagName))));
}

function rootDropContainer() {
  return { el: document.querySelector(".sc-host") || document.body, tid: null };
}

export function isImageSlotWrapper(element?: Element | null) {
  const child = element?.classList?.contains("sc-host-x") ? element.firstElementChild : null;
  if (!child?.tagName) return false;
  return child.tagName.toLowerCase() === "image-slot" ||
    (child.classList.contains("sc-placeholder") && child.getAttribute("title") === "image-slot");
}

export function isUneditableElement(element?: Element | null) {
  return !!element?.hasAttribute && (element.hasAttribute("data-uneditable") || deckContainer(element));
}

export function hasSvgAncestor(element: Element) {
  for (let parent = element.parentElement; parent; parent = parent.parentElement) {
    if (parent.namespaceURI === svgNamespace) return true;
  }
  return false;
}

export function createDropContainerFinder(options: {
  findOuterComponentHost(): Element | null;
  findTemplateInstances(id: string, component?: string | null): Element[];
}) {
  function ancestors(element: Element) {
    const containers: Element[] = [];
    for (let parent = stampedParent(element); parent; parent = stampedParent(parent)) containers.push(parent);
    const outerHost = options.findOuterComponentHost();
    if (outerHost) containers.push(outerHost);
    return containers;
  }

  function repeatedDragParent(gesture: DropGesture) {
    if (!gesture.peerParent) return null;
    const stampedParents = document.querySelectorAll("[data-dc-drag-parent]");
    const parent = Array.from(stampedParents).find((element) => componentScopeName(element) === gesture.name) ||
      options.findTemplateInstances(String(gesture.peerTid), gesture.name)[0];
    if (!parent || parent.tagName !== gesture.peerParent.tagName) return null;
    const display = getComputedStyle(parent).display || "";
    return display.includes("flex") || display.includes("grid") ? parent : null;
  }

  function acceptsContainer(container: Element, gesture: DropGesture) {
    if (gesture.origAncestorEls.includes(container)) return true;
    const repeated = gesture.brk ? null : repeatedDragParent(gesture);
    if (repeated === container) return true;
    if (repeated?.contains(container)) return false;
    const { width, height } = container.getBoundingClientRect();
    const source = gesture.startRect;
    if (width <= source.width && height <= source.height) return false;
    return width * height >= 1.1 * source.width * source.height;
  }

  function resolve(x: number, y: number, gesture: DropGesture, source: Element | null, group?: Element[] | null) {
    const initialTag = (source ? source.tagName : gesture.tag) || "div";
    let container = document.elementFromPoint(x, y)?.closest(stamped) ?? null;
    while (container && rejectsDrop(container, source, initialTag, group, gesture.fromDrawing)) {
      container = stampedParent(container);
    }
    let id = container ? templateId(container) : null;
    container ??= rootDropContainer().el;

    while (container) {
      if (deckContainer(container)) return { el: null, tid: null, invalid: true as const };
      if (id !== null && parseFloat(getComputedStyle(container).opacity || "1") === 0) {
        const parent = stampedParent(container);
        if (!parent) break;
        container = parent;
        id = templateId(parent);
        continue;
      }
      if (id === null || acceptsContainer(container, gesture)) return { el: container, tid: id };
      let parent = stampedParent(container);
      while (parent && rejectsDrop(parent, source, gesture.tag, group, gesture.fromDrawing)) parent = stampedParent(parent);
      if (!parent) break;
      container = parent;
      id = templateId(parent);
    }
    return rootDropContainer();
  }

  return { ancestors, resolve };
}
