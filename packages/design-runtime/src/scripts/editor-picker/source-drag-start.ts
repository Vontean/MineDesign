import type { Dynamic } from "../../runtime-types";
import { ancestorTransformSigns } from "./element-transform-geometry";
import { canBreakFromFlow, readEmptyElementHeight, readInitialWidth } from "./layout-insertion";
import { dragExitPayload } from "./source-drag-release";

export const DRAG_PROXY_CAPTURE_BUDGET_MS = 24;
const MAX_DRAG_FOLLOWERS = 500;
const TEMPLATE_ATTRIBUTE = "data-dc-tpl";

interface PendingDrag {
  el: HTMLElement | SVGElement;
  tid: number;
  name: string | null;
  x: number;
  y: number;
}

interface DragSelection {
  ids: number[];
  name: string | null;
}

interface DragPointer {
  altKey: boolean;
  clientX: number;
  clientY: number;
}

interface AuthoredPosition {
  bothX: boolean;
  bothY: boolean;
  useRight: boolean;
  useBottom: boolean;
  startLeft: number;
  startTop: number;
  startRight: number;
  startBottom: number;
}

interface BreakoutFollower {
  tid: number;
  el: Element;
  startRect: DOMRect;
  startW: number;
  startH: number;
  startLines: ReturnType<typeof gridLines>;
  freezeStyle: Dynamic;
  absStyles: Dynamic;
}

interface StartOptions {
  createKey(): string;
  activate(gesture: Dynamic): void;
  clearPress(): void;
  finishPress(): void;
  hostKey(): string | null;
  masksScroll(axis: "x" | "y"): boolean;
  capturePointer(): void;
  emit(event: object): void;
  elements: {
    find(id: string, name: string | null): Element[];
    layoutBox(element: Element): Element;
    isRendered(element: Element): boolean;
    isUneditable(element: Element): boolean;
    isDeckManaged(element: Element): boolean;
    isRepeated(element: Element): boolean;
    enclosingDirective(id: number, name: string | null): Dynamic;
    componentName(element: Element): string | null;
    id(element: Element): number;
    isDrawing(element: Element): boolean;
    outerHost(): Element | null;
    clearAttribute(attribute: string): void;
    lift(element: Element, deadline?: number): Dynamic;
  };
  layout: {
    parentScale(element: Element): number;
    elementScale(element: Element, bounds: DOMRect): Dynamic;
    dropAncestors(element: Element): Element[];
  };
  styles: {
    clearForeignSelection(): void;
    authoredPosition(element: Element, style: CSSStyleDeclaration): AuthoredPosition;
    inheritedText(element: Element): Dynamic;
  };
  selection: {
    read(): DragSelection;
    replace(id: number, name: string | null): void;
    emit(element: Element, changed: boolean): void;
  };
}

function isOutOfFlow(style: CSSStyleDeclaration) {
  return style.position === "absolute" || style.position === "fixed";
}

function sharesSelection(press: PendingDrag, selection: DragSelection) {
  return selection.ids.length > 1 &&
    selection.name === press.name &&
    selection.ids.indexOf(press.tid) >= 0;
}

function gridLines(style: CSSStyleDeclaration) {
  return {
    gridRowStart: style.gridRowStart,
    gridRowEnd: style.gridRowEnd,
    gridColumnStart: style.gridColumnStart,
    gridColumnEnd: style.gridColumnEnd,
  };
}

/** Record the sibling layout before a drag that could break out of flow. */
function snapshotFlowSiblings(press: PendingDrag, parent: Element, options: StartOptions) {
  const stampedChildren = Array.from(parent.children).filter(
    (child) => child.hasAttribute(TEMPLATE_ATTRIBUTE),
  );
  const seenTemplates = new Set<string | null>();
  for (const child of stampedChildren) {
    const stamp = child.getAttribute(TEMPLATE_ATTRIBUTE);
    if (seenTemplates.has(stamp)) return null;
    seenTemplates.add(stamp);
  }

  const componentName = options.elements.componentName(press.el);
  const parentBounds = parent.getBoundingClientRect();
  const scale = options.layout.parentScale(press.el) || 1;
  const siblings = [];
  for (const child of stampedChildren) {
    if (child === press.el || options.elements.componentName(child) !== componentName) continue;
    const style = getComputedStyle(child);
    if (isOutOfFlow(style)) continue;
    const bounds = child.getBoundingClientRect();
    siblings.push({
      tid: parseInt(child.getAttribute(TEMPLATE_ATTRIBUTE)!, 10),
      left: Math.round((bounds.left - parentBounds.left) / scale),
      top: Math.round((bounds.top - parentBounds.top) / scale),
      w: Math.round(bounds.width / scale),
      h: Math.round(bounds.height / scale),
      static: style.position === "static",
    });
  }
  const parentId = parseInt(parent.getAttribute(TEMPLATE_ATTRIBUTE)!, 10);
  return {
    parentTid: Number.isNaN(parentId) ? null : parentId,
    parentStatic: getComputedStyle(parent).position === "static",
    w: Math.round(parentBounds.width / scale),
    h: Math.round(parentBounds.height / scale),
    siblings,
  };
}

function findPositionedFollowers(press: PendingDrag, selection: DragSelection, options: StartOptions) {
  const followers = [];
  for (const id of selection.ids) {
    if (id === press.tid) continue;
    const instances = options.elements.find(String(id), press.name);
    const element = instances[0];
    if (!element || !options.elements.isRendered(options.elements.layoutBox(element))) continue;

    const style = getComputedStyle(element);
    const authored = instances.length === 1 ? options.styles.authoredPosition(element, style) : null;
    if (
      !authored ||
      element.parentElement !== press.el.parentElement ||
      options.elements.isUneditable(element) ||
      options.elements.isDeckManaged(element) ||
      !isOutOfFlow(style) ||
      authored.bothX ||
      authored.bothY
    ) return null;

    followers.push({
      el: element,
      tid: id,
      fixed: style.position === "fixed",
      useRight: authored.useRight,
      useBottom: authored.useBottom,
      startLeft: authored.startLeft,
      startTop: authored.startTop,
      startRight: authored.startRight,
      startBottom: authored.startBottom,
      lastPatch: null,
      absStyles: null,
    });
  }
  return followers.length ? followers : null;
}

function findFlowFollowers(press: PendingDrag, selection: DragSelection, options: StartOptions) {
  const followers: Element[] = [];
  const directive = options.elements.enclosingDirective(press.tid, press.name);
  for (const id of selection.ids) {
    if (id === press.tid) continue;
    const instances = options.elements.find(String(id), press.name);
    const element = instances[0];
    if (!element || !options.elements.isRendered(options.elements.layoutBox(element))) continue;
    const style = getComputedStyle(element);
    if (
      instances.length > 1 ||
      element.parentElement !== press.el.parentElement ||
      options.elements.enclosingDirective(id, press.name) !== directive ||
      options.elements.isUneditable(element) ||
      options.elements.isDeckManaged(element) ||
      options.elements.isRepeated(element) ||
      isOutOfFlow(style)
    ) return null;
    if (followers.length < MAX_DRAG_FOLLOWERS) followers.push(element);
  }
  return followers.length ? followers : null;
}

function findBreakoutFollowers(press: PendingDrag, selection: DragSelection, options: StartOptions) {
  if (!sharesSelection(press, selection)) return null;
  const followers: BreakoutFollower[] = [];
  for (const id of selection.ids) {
    if (followers.length >= MAX_DRAG_FOLLOWERS) break;
    if (id === press.tid) continue;
    const instances = options.elements.find(String(id), press.name);
    if (instances.length !== 1) continue;
    const element = instances[0];
    if (
      element === press.el ||
      element.contains(press.el) ||
      press.el.contains(element) ||
      !options.elements.isRendered(options.elements.layoutBox(element)) ||
      options.elements.isUneditable(element) ||
      options.elements.isDeckManaged(element) ||
      options.elements.isRepeated(element)
    ) continue;

    const style = getComputedStyle(element);
    const absolute = style.position === "absolute";
    if (style.position === "fixed" || (!absolute && !canBreakFromFlow(element, style))) continue;
    if (absolute) {
      const authored = options.styles.authoredPosition(element, style);
      if (authored.bothX || authored.bothY || authored.useRight || authored.useBottom) continue;
    }
    followers.push({
      tid: id,
      el: element,
      startRect: options.elements.layoutBox(element).getBoundingClientRect(),
      startW: absolute ? 0 : readInitialWidth(style),
      startH: absolute ? 0 : readEmptyElementHeight(element, style),
      startLines: gridLines(style),
      freezeStyle: undefined,
      absStyles: null,
    });
  }

  const topLevel = followers.filter((follower) => !followers.some(
    (other) => other !== follower && other.el.contains(follower.el),
  ));
  topLevel.sort((a, b) => a.el.compareDocumentPosition(b.el) & Node.DOCUMENT_POSITION_PRECEDING ? 1 : -1);
  return topLevel.length ? topLevel : null;
}

/** Turn a pending press into a drag snapshot shared by motion and release. */
export function createSourceDragStart(options: StartOptions) {
  return function startSourceDrag(pendingDrag: PendingDrag, pointer: DragPointer) {
    const instances = options.elements.find(String(pendingDrag.tid), pendingDrag.name);
    const repeatedCount = instances && instances.length > 1
      ? instances.length
      : Number(options.elements.isRepeated(pendingDrag.el));
    if (repeatedCount) {
      options.emit({ type: "repeatRefused", count: repeatedCount, reason: "self" });
      options.clearPress();
      return false;
    }

    const dragElement = pendingDrag.el;
    const computedStyle = getComputedStyle(dragElement);
    const authoredPosition = options.styles.authoredPosition(dragElement, computedStyle);
    const isAbsolutelyPositioned = isOutOfFlow(computedStyle);
    const parentComponent = dragElement.parentElement?.closest("[data-dc-tpl]") ?? null;
    const parentDisplay = (!isAbsolutelyPositioned && parentComponent && getComputedStyle(parentComponent).display) || "";
    const flattenedLayout = !isAbsolutelyPositioned && parentComponent
      ? snapshotFlowSiblings(pendingDrag, parentComponent, options)
      : null;
    const selection = options.selection.read();
    const dragAsGroup = !pointer.altKey && sharesSelection(pendingDrag, selection);
    const dragFollowers = dragAsGroup && isAbsolutelyPositioned && !authoredPosition.bothX && !authoredPosition.bothY
      ? findPositionedFollowers(pendingDrag, selection, options)
      : null;
    const dragStartRect = options.elements.layoutBox(dragElement).getBoundingClientRect();
    const flowFollowers = dragAsGroup && !isAbsolutelyPositioned && parentComponent
      ? findFlowFollowers(pendingDrag, selection, options)
      : null;
    const gesture: Dynamic = {
      tid: pendingDrag.tid,
      name: pendingDrag.name,
      alt: dragFollowers || flowFollowers ? false : pointer.altKey,
      followers: dragFollowers,
      el: dragElement,
      tag: dragElement.tagName,
      fromDrawing: options.elements.isDrawing(dragElement),
      mode: isAbsolutelyPositioned ? "abs" : "flow",
      flatten: flattenedLayout,
      startRect: dragStartRect,
      gestureKey: options.createKey(),
      scl: options.layout.parentScale(dragElement),
      am: ancestorTransformSigns(dragElement),
      startX: pointer.clientX,
      startY: pointer.clientY,
      grabDx: pendingDrag.x - dragStartRect.left,
      grabDy: pendingDrag.y - dragStartRect.top,
      origParent: dragElement.parentNode,
      origNext: dragElement.nextSibling,
      origParentStamped: parentComponent || options.elements.outerHost(),
      origAncestorEls: options.layout.dropAncestors(dragElement),
      peerParent:
        parentDisplay.indexOf("flex") !== -1 || parentDisplay.indexOf("grid") !== -1 ? parentComponent : null,
      peerTid: parentComponent ? parseInt(parentComponent.getAttribute(TEMPLATE_ATTRIBUTE)!, 10) : null,
      origStyle: dragElement.getAttribute("style") || "",
      canBreak: canBreakFromFlow(dragElement, computedStyle),
      startW: readInitialWidth(computedStyle),
      startH: readEmptyElementHeight(dragElement, computedStyle),
      startLines: gridLines(computedStyle),
      brkFollowers: isAbsolutelyPositioned
        ? null
        : findBreakoutFollowers(pendingDrag, selection, options),
      freezeStyle: options.styles.inheritedText(dragElement),
      useRight: authoredPosition.useRight,
      useBottom: authoredPosition.useBottom,
      bothX: authoredPosition.bothX,
      bothY: authoredPosition.bothY,
      fixed: computedStyle.position === "fixed",
      startLeft: authoredPosition.startLeft,
      startTop: authoredPosition.startTop,
      startRight: authoredPosition.startRight,
      startBottom: authoredPosition.startBottom,
      commit: null,
      absStyles: null,
      previewKey: "",
      previewActive: false,
      epoch: 0,
      slotPt: null,
      previewParentEl: null,
      absParent: null,
      maskX: options.masksScroll("x"),
      maskY: options.masksScroll("y"),
    };
    options.activate(gesture);
    options.elements.clearAttribute("data-dc-dragging");
    options.elements.clearAttribute("data-dc-drag-parent");
    options.elements.clearAttribute("data-dc-drag-follower");
    options.elements.clearAttribute("data-dc-drag-block");
    gesture.group =
      flowFollowers &&
      flowFollowers.map((followerElement) => {
        const followerTid = options.elements.id(followerElement);
        const followerTextStyle = options.styles.inheritedText(followerElement);
        const followerRecord = (gesture.brkFollowers || []).find(
          (candidate: Dynamic) => candidate.tid === followerTid,
        );
        if (followerRecord) {
          followerRecord.freezeStyle = followerTextStyle;
        }
        return {
          tid: followerTid,
          freezeStyle: followerTextStyle || undefined,
        };
      });
    if (!isAbsolutelyPositioned) {
      gesture.proxy = options.elements.lift(dragElement);
    }
    if (gesture.proxy && flowFollowers) {
      gesture.groupProxies = [];
      const proxyExpiry = Date.now() + DRAG_PROXY_CAPTURE_BUDGET_MS;
      for (const follower of flowFollowers) {
        const followerBounds = options.elements.layoutBox(follower).getBoundingClientRect();
        const followerProxy = options.elements.lift(follower, proxyExpiry);
        if (followerProxy) {
          gesture.groupProxies.push({
            p: followerProxy,
            tid: options.elements.id(follower),
            dx: followerBounds.left - dragStartRect.left,
            dy: followerBounds.top - dragStartRect.top,
          });
        }
      }
    }
    gesture.lift = options.layout.elementScale(
      options.elements.layoutBox(dragElement),
      gesture.startRect,
    );

    options.styles.clearForeignSelection();
    const hostKey = options.hostKey();
    if (hostKey !== null) {
      gesture.hostKey = hostKey;
    } else {
      const currentSelection = options.selection.read();
      const changed = currentSelection.name !== gesture.name || currentSelection.ids.indexOf(gesture.tid) < 0;
      if (changed) options.selection.replace(gesture.tid, gesture.name);
      options.selection.emit(dragElement, changed);

      const payload = gesture.followers || gesture.group
        ? { gestureKey: gesture.gestureKey }
        : dragExitPayload(gesture, gesture.alt);
      options.emit(Object.assign(payload, { type: "dragState", live: true }));
      options.capturePointer();
    }
    dragElement.style.setProperty("pointer-events", "none", "important");
    options.clearPress();
    options.finishPress();
    return true;
  };
}
