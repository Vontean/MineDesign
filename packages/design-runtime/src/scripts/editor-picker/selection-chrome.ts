import { buildDistanceGuides } from "./alignment-guides";
import { firstRenderedInstance, isRenderedElement, textContentBounds, type ElementBounds } from "./element-bounds";
import { expandedSvgBounds, outerSvgElement } from "./element-query";
import { ancestorTransformInfo } from "./element-transform-geometry";
import { hasOnlyMatchingSvgContent, resolveSelectedSvgElement, resolveSingleContentSvg } from "./svg-line-geometry";
import type { Dynamic } from "../../runtime-types";

const selectionStamp = "data-dc-editor-selected";
const hoverStamp = "data-dc-editor-hover";
const chromeOverlays = "[data-dc-editor-overlay-root],[data-dc-editor-overlay]";

interface SelectionChromeOptions {
  isVisible(): boolean;
  isArtboardHovered(): boolean;
  isGroupDragging(): boolean;
  readTransform(): Dynamic;
  transformActive(): boolean;
  endpointActive(): boolean;
  isTextPartSelected(): boolean;
  canMeasure(): boolean;
  busyDrops(): Record<string, number> | null;
  readGuides(): Dynamic;
  findOuterComponentHost(): Element | null;
  isNestedComponentImport(element: Element): boolean;
  editableLine(element: Element): Dynamic;
  svgBounds(element: Element): ElementBounds;
  rotatedPose(element: Element, rect: Pick<DOMRect, "left" | "top" | "width" | "height">): Dynamic;
  onResize: ResizeObserverCallback;
  emit(event: Dynamic): void;
}

interface ClipAxes { x: boolean; y: boolean }

function validRect(rect: Pick<DOMRect, "width" | "height">) {
  return rect.width > 0 && rect.height > 0;
}

function lineFits(line: Dynamic, clip: ClipAxes) {
  return !(clip.x && (Math.min(line.x1, line.x2) < 0 || Math.max(line.x1, line.x2) > innerWidth)) &&
    !(clip.y && (Math.min(line.y1, line.y2) < 0 || Math.max(line.y1, line.y2) > innerHeight));
}

function clipRings(rect: Pick<DOMRect, "left" | "top" | "width" | "height">, axes: ClipAxes) {
  const { left, top, width, height } = rect;
  const right = left + width, bottom = top + height;
  const x = axes.x ? Math.max(0, left) : left;
  const y = axes.y ? Math.max(0, top) : top;
  const endX = axes.x ? Math.min(innerWidth, right) : right;
  const endY = axes.y ? Math.min(innerHeight, bottom) : bottom;
  return {
    x, y, w: endX - x, h: endY - y,
    clipped: left !== x || top !== y || right !== endX || bottom !== endY,
  };
}

export function createSelectionChrome(options: SelectionChromeOptions) {
  let lastPayload: string | null = null;
  let resizeObserver: ResizeObserver | null = null;
  let observed: Element[] = [];

  function connect() {
    resizeObserver = typeof ResizeObserver === "function" ? new ResizeObserver(options.onResize) : null;
  }

  function disconnect(resetObserved: boolean) {
    if (!resizeObserver) return;
    resizeObserver.disconnect();
    resizeObserver = null;
    if (resetObserved) observed = [];
  }

  function observe(elements: Element[]) {
    if (!resizeObserver || (elements.length === observed.length && elements.every((element, index) => element === observed[index]))) return;
    resizeObserver.disconnect();
    for (const element of elements) resizeObserver.observe(element);
    observed = elements;
  }

  function emit(rings: Dynamic[], stroke: Dynamic, measure?: Dynamic, artboard?: boolean, pen?: Dynamic) {
    const payload = {
      type: "chrome",
      rings,
      stroke,
      measure: measure || null,
      guides: options.readGuides() || null,
      artboard: !!artboard,
      pen: pen || null,
    };
    const serial = JSON.stringify(payload);
    if (serial === lastPayload) return;
    lastPayload = serial;
    options.emit(payload);
  }

  function markedElements(stamp: string) {
    if (stamp === selectionStamp && options.isGroupDragging() &&
        !document.body.hasAttribute("data-dc-editor-brk")) return [];
    return Array.from(document.querySelectorAll("[" + stamp + "]")).filter((element) =>
      !element.hasAttribute("data-dc-editor-stroke") &&
      !element.hasAttribute("data-dc-editor-dragging") &&
      !element.closest(chromeOverlays),
    );
  }

  function selectedSvg(element: Element, members: Dynamic) {
    return resolveSelectedSvgElement(element, members, outerSvgElement, options.editableLine);
  }

  function buildMeasurement(clip: ClipAxes, members: Dynamic) {
    if (!options.canMeasure()) return null;
    let firstSelected: Element | null = null;
    let selection: { l: number; t: number; r: number; b: number } | null = null;
    for (const element of markedElements(selectionStamp)) {
      const rect = selectedSvg(element, members).getBoundingClientRect();
      if (!validRect(rect) || !isRenderedElement(element)) continue;
      firstSelected ??= element;
      selection = selection ? {
        l: Math.min(selection.l, rect.left), t: Math.min(selection.t, rect.top),
        r: Math.max(selection.r, rect.right), b: Math.max(selection.b, rect.bottom),
      } : { l: rect.left, t: rect.top, r: rect.right, b: rect.bottom };
    }
    if (!firstSelected || !selection) return null;

    const hover = firstRenderedInstance(markedElements(hoverStamp));
    let reference = hover && !hover.hasAttribute(selectionStamp) ? options.svgBounds(hover) : null;
    if (reference && !validRect(reference)) reference = null;
    const root = options.findOuterComponentHost();
    for (let parent = firstSelected.parentElement; parent && !reference; parent = parent.parentElement) {
      if (!parent.hasAttribute("data-dc-tpl") && parent !== root) continue;
      const rect = parent.getBoundingClientRect();
      if (validRect(rect)) reference = rect;
    }
    const bounds = reference
      ? { l: reference.left, t: reference.top, r: reference.right, b: reference.bottom }
      : { l: 0, t: 0, r: innerWidth, b: innerHeight };
    const guides = buildDistanceGuides(selection, bounds, ancestorTransformInfo(firstSelected).scale);
    const lines = [];
    for (const line of guides.lines) {
      if (clip.x) {
        line.x1 = Math.max(0, Math.min(innerWidth, line.x1));
        line.x2 = Math.max(0, Math.min(innerWidth, line.x2));
      }
      if (clip.y) {
        line.y1 = Math.max(0, Math.min(innerHeight, line.y1));
        line.y2 = Math.max(0, Math.min(innerHeight, line.y2));
      }
      if (line.x1 !== line.x2 || line.y1 !== line.y2) lines.push(line);
    }
    const labels = guides.labels.filter(({ x, y }: Dynamic) =>
      !(clip.x && (x < 0 || x > innerWidth)) && !(clip.y && (y < 0 || y > innerHeight)),
    );
    return lines.length ? { lines, labels } : null;
  }

  function paint() {
    const transform = options.readTransform();
    const visible = options.isVisible();
    const marked: { element: Element; selected: boolean }[] = [];
    if (visible) {
      for (const element of markedElements(selectionStamp)) marked.push({ element, selected: true });
      for (const element of markedElements(hoverStamp)) {
        if (!element.hasAttribute(selectionStamp) && !element.hasAttribute("data-dc-editor-hover-stroke")) {
          marked.push({ element, selected: false });
        }
      }
    }
    const scrolling = document.scrollingElement || document.documentElement;
    const clip = { x: scrolling.scrollLeft > 0, y: scrolling.scrollTop > 0 };
    const rings: Dynamic[] = [];
    const nextObserved: Element[] = [];
    const members = transform?.group ? transform.members : null;
    let transformRingAdded = false;

    function appendRing(rect: Pick<DOMRect, "left" | "top" | "width" | "height">, kind: string, pose: Dynamic, component: boolean) {
      const { x, y, w, h, clipped } = clipRings(rect, clip);
      if (w <= 0 || h <= 0) return;
      const transforming = options.transformActive();
      const k = kind === "grip" && clipped && !transforming && !options.endpointActive() ? "sel" : kind;
      const ring: Dynamic = { x, y, w, h, k };
      if (pose?.rot && (!clipped || transforming)) {
        Object.assign(ring, { x: pose.x, y: pose.y, w: pose.w, h: pose.h, rot: pose.rot });
      }
      if (k === "grip") {
        if (transform.rotatable) {
          ring.rotatable = true;
          if (transform.deg != null) ring.deg = transform.deg;
        }
        if (transform.media) ring.media = transform.media;
        if (transform.group) {
          ring.group = true;
          if (transform.noResize) ring.noResize = true;
          if (transform.noRotate) ring.noRotate = transform.noRotate;
          if (transform.aspectLock) ring.aspectLock = true;
        }
      }
      if (component) ring.component = true;
      rings.push(ring);
    }

    for (const { element, selected } of marked) {
      if (rings.length >= 255) break;
      const target = selected ? selectedSvg(element, members) : element;
      let rect: Pick<DOMRect, "left" | "top" | "width" | "height"> = expandedSvgBounds(target);
      const textPart = selected && options.isTextPartSelected();
      if (textPart) {
        const text = textContentBounds(target);
        if (text) rect = { left: text.l - 2, top: text.t - 1, width: text.r - text.l + 4, height: text.b - text.t + 2 };
      }
      if (!validRect(rect) || !isRenderedElement(element)) continue;
      nextObserved.push(target);
      let kind = selected ? "sel" : "hov";
      if (transform && !transform.stroke) {
        if (target === transform.el) {
          kind = transform.pen ? "sel" : "grip";
          transformRingAdded = true;
        } else if (selected && resolveSingleContentSvg(target, transform.el, hasOnlyMatchingSvgContent) !== target) {
          continue;
        }
      }
      const pose = kind === "grip" ? transform.box : textPart ? null : options.rotatedPose(target, rect);
      appendRing(rect, kind, pose, options.isNestedComponentImport(target));
    }

    const busy = visible ? options.busyDrops() : null;
    if (busy) {
      for (const pending of document.querySelectorAll("[data-dc-drop]")) {
        if (rings.length >= 255) break;
        if (busy[pending.getAttribute("data-dc-drop")!] !== 1 || pending.closest(chromeOverlays)) continue;
        const rect = pending.getBoundingClientRect();
        if (!validRect(rect) || !isRenderedElement(pending)) continue;
        nextObserved.push(pending);
        appendRing(rect, "busy", options.rotatedPose(pending, rect), false);
      }
    }
    if (transform && !transform.stroke && !transformRingAdded) {
      appendRing({ left: transform.x, top: transform.y, width: transform.w, height: transform.h },
        transform.pen ? "sel" : "grip", transform.box, options.isNestedComponentImport(transform.el));
    }
    observe(nextObserved);
    const stroke = transform?.stroke && (options.endpointActive() || lineFits(transform.stroke, clip))
      ? transform.stroke : null;
    emit(rings, stroke, marked.length ? buildMeasurement(clip, members) : null,
      options.isArtboardHovered() && visible, transform?.pen || null);
  }

  return { paint, connect, disconnect, clear: () => emit([], null), forgetPayload: () => { lastPayload = null; } };
}
