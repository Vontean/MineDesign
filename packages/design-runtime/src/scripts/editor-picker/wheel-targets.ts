import { panZoomRoot } from "./preview-pan-zoom";

const editorOverlays = "[data-dc-edit-transparent],[data-omelette-chrome],[data-noncommentable],.twk-panel";

function elementTarget(target: unknown): Element | null {
  const value = target as Element | null | undefined;
  return value?.nodeType === Node.ELEMENT_NODE ? value : null;
}

export function eventMatchesSelector(input: Event | Element | null | undefined, selector: string) {
  if (!input) return false;
  const event = input as Event;
  if (typeof event.composedPath === "function") {
    for (const node of event.composedPath()) {
      if (elementTarget(node)?.matches(selector)) return true;
    }
    return !!elementTarget(event.target)?.closest(selector);
  }
  return !!elementTarget(input)?.closest(selector);
}

export function eventHitsEditorOverlay(input: Event | Element | null | undefined) {
  return eventMatchesSelector(input, editorOverlays);
}

const allowsNativeScroll = (overflow: string) => overflow !== "hidden" && overflow !== "clip";
const isScrollableOverflow = (overflow: string) => overflow === "auto" || overflow === "scroll";

function rootScrollStyle() {
  const rootStyle = getComputedStyle(document.documentElement);
  const bodyOwnsOverflow = rootStyle.overflowX === "visible" && rootStyle.overflowY === "visible" && !!document.body;
  return { bodyOwnsOverflow, style: bodyOwnsOverflow ? getComputedStyle(document.body) : rootStyle };
}

export function canPageScrollAxis(axis: "x" | "y") {
  const element = document.scrollingElement || document.documentElement;
  const { style } = rootScrollStyle();
  return axis === "x"
    ? allowsNativeScroll(style.overflowX) && element.scrollWidth > element.clientWidth + 1
    : allowsNativeScroll(style.overflowY) && element.scrollHeight > element.clientHeight + 1;
}

export function eventHasScrollableOverlayTarget(event: WheelEvent) {
  const path = event.composedPath?.() ?? [];
  for (const [index, node] of path.entries()) {
    const element = elementTarget(node);
    if (!element) continue;
    let style: CSSStyleDeclaration;
    try { style = getComputedStyle(element); } catch { continue; }
    const vertical = isScrollableOverflow(style.overflowY) && element.scrollHeight > element.clientHeight;
    const horizontal = isScrollableOverflow(style.overflowX) && element.scrollWidth > element.clientWidth;
    if ((vertical && event.deltaY) || (horizontal && event.deltaX)) {
      return path.slice(index).some((item) => elementTarget(item)?.matches(editorOverlays));
    }
  }
  return false;
}

function axisHasRoom(element: Element, vertical: boolean, positive: boolean) {
  if (vertical) {
    return positive
      ? element.scrollTop + element.clientHeight < element.scrollHeight - 1
      : element.scrollTop > 1;
  }
  return positive
    ? element.scrollLeft + element.clientWidth < element.scrollWidth - 1
    : element.scrollLeft > 1;
}

export function eventTargetConsumesWheel(event: WheelEvent) {
  const root = panZoomRoot();
  const vertical = Math.abs(event.deltaY) >= Math.abs(event.deltaX);
  const delta = vertical ? event.deltaY : event.deltaX;
  for (const node of event.composedPath?.() ?? []) {
    if (node === root || node === document.body || node === document.documentElement) break;
    const element = elementTarget(node);
    if (!element) continue;
    let style: CSSStyleDeclaration;
    try { style = getComputedStyle(element); } catch { continue; }
    if (isScrollableOverflow(vertical ? style.overflowY : style.overflowX) &&
        (delta > 0 || delta < 0) && axisHasRoom(element, vertical, delta > 0)) return true;
  }
  return false;
}

export function pageCanConsumeWheel(event: WheelEvent) {
  const { bodyOwnsOverflow, style } = rootScrollStyle();
  const scrollElement = document.scrollingElement || document.documentElement;
  const vertical = Math.abs(event.deltaY) >= Math.abs(event.deltaX);
  const positive = (vertical ? event.deltaY : event.deltaX) > 0;
  if (allowsNativeScroll(vertical ? style.overflowY : style.overflowX) &&
      axisHasRoom(scrollElement, vertical, positive)) return true;
  if (bodyOwnsOverflow || !document.body) return false;
  const bodyStyle = getComputedStyle(document.body);
  return isScrollableOverflow(vertical ? bodyStyle.overflowY : bodyStyle.overflowX) &&
    axisHasRoom(document.body, vertical, positive);
}

export function horizontalOverscroll(event: WheelEvent) {
  if (event.ctrlKey || event.metaKey) return false;
  if (!event.deltaX && !event.deltaY) return true;
  if (Math.abs(event.deltaX) <= Math.abs(event.deltaY)) return false;

  function canMoveHorizontally(element: Element, style: CSSStyleDeclaration) {
    const rtl = element.scrollLeft < 0 || style.direction === "rtl" || /-rl$/.test(style.writingMode || "");
    const overflow = element.scrollWidth - element.clientWidth;
    return event.deltaX > 0 ? element.scrollLeft < (rtl ? 0 : overflow) - 1
      : element.scrollLeft > (rtl ? -overflow : 0) + 1;
  }
  function canMoveVertically(element: Element) {
    return !!event.deltaY && axisHasRoom(element, true, event.deltaY > 0);
  }

  const { bodyOwnsOverflow, style } = rootScrollStyle();
  const scrollingElement = document.scrollingElement || document.documentElement;
  if ((allowsNativeScroll(style.overflowX) && canMoveHorizontally(scrollingElement, style)) ||
      (allowsNativeScroll(style.overflowY) && canMoveVertically(scrollingElement)) ||
      typeof event.composedPath !== "function") return false;
  for (const node of event.composedPath()) {
    const element = elementTarget(node);
    if (!element || element === document.documentElement || (bodyOwnsOverflow && element === document.body)) continue;
    let localStyle: CSSStyleDeclaration;
    try { localStyle = getComputedStyle(element); } catch { continue; }
    const field = element.localName === "input" || element.localName === "textarea";
    if (((isScrollableOverflow(localStyle.overflowX) || field) && canMoveHorizontally(element, localStyle)) ||
        (isScrollableOverflow(localStyle.overflowY) && canMoveVertically(element))) return false;
  }
  return true;
}
