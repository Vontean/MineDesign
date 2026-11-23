import {
  clampPointToActiveDeckSlides,
  deckRailHitAt,
  enclosingDeckSlide,
  isCollapsedDeckWrapper,
  isDeckStage,
  isDeckStageWrapper,
  remapDeckRailHit,
} from "./deck-target";
import { fillsReferenceBounds, resolveLayoutInsertion } from "./layout-insertion";

interface DropPoint {
  x: number;
  y: number;
  needsPositioning: boolean;
}

export type MediaDropTarget = {
  el: Element;
  position: "before" | "after" | "into";
  point?: DropPoint | null;
  refuse?: false;
} | { refuse: true };

interface MediaTargetOptions {
  normalizeHit(element: Element): Element | null;
  canContainElements(element: Element): boolean;
  elementViewportScale(element: Element): number;
}

type ResolveTarget = (x: number, y: number) => MediaDropTarget | null;

export function createMediaDropTargeting({
  normalizeHit,
  canContainElements,
  elementViewportScale,
}: MediaTargetOptions) {
  function stampedElementAt(x: number, y: number) {
    return document.elementFromPoint(x, y)?.closest("[data-dc-tpl]") ?? null;
  }

  const isDeckWrapper = (element: Element) =>
    isDeckStage(element) || isDeckStageWrapper(element) || isCollapsedDeckWrapper(element);

  function hitMediaTarget(x: number, y: number): MediaDropTarget | null {
    const raw = stampedElementAt(x, y);
    let element = raw ? normalizeHit(raw) : null;
    if (!element) return null;

    let crossedDeckWrapper = isDeckWrapper(element);
    const rect = element.getBoundingClientRect();
    const ratio = rect.height > 0 ? (y - rect.top) / rect.height : 0.5;
    let position: "before" | "after" | "into" = ratio < 0.3 ? "before" : ratio > 0.7 ? "after" : "into";
    if (position !== "into" && element.parentElement && isDeckStage(element.parentElement)) {
      position = "into";
    }

    while (element && (isDeckWrapper(element) || (position === "into" && !canContainElements(element)))) {
      crossedDeckWrapper ||= isDeckWrapper(element);
      position = "into";
      element = element.parentElement?.closest("[data-dc-tpl]") ?? null;
    }
    if (element) return { el: element, position };
    return crossedDeckWrapper ? { refuse: true } : null;
  }

  function positionOnSlide(slide: Element, x: number, y: number): MediaDropTarget {
    const bounds = slide.getBoundingClientRect();
    const scale = elementViewportScale(slide) || 1;
    return {
      el: slide,
      position: "into",
      point: {
        x: (x - bounds.left) / scale,
        y: (y - bounds.top) / scale,
        needsPositioning: getComputedStyle(slide).position === "static",
      },
    };
  }

  function resolveLayoutTarget(x: number, y: number): MediaDropTarget | null {
    const raw = stampedElementAt(x, y);
    const target = hitMediaTarget(x, y);
    if (!target || target.refuse) return target;
    const insertion = resolveLayoutInsertion(target.el, target.position, x, y);
    const slide = enclosingDeckSlide(raw);
    if (slide?.hasAttribute("data-dc-tpl") &&
        (insertion.slotless === true || fillsReferenceBounds(raw, slide))) {
      return positionOnSlide(slide, x, y);
    }
    return { el: insertion.el, position: insertion.position, point: null };
  }

  function resolveOnHiddenSlide(slide: HTMLElement, resolve: ResolveTarget, x: number, y: number) {
    const previousStyle = slide.getAttribute("style");
    slide.style.visibility = "visible";
    slide.style.pointerEvents = "auto";
    slide.style.zIndex = "2147483647";
    let result: MediaDropTarget | null;
    try {
      result = resolve(x, y);
    } finally {
      if (previousStyle == null) slide.removeAttribute("style");
      else slide.setAttribute("style", previousStyle);
    }
    return result && !result.refuse && enclosingDeckSlide(result.el) === slide
      ? result : positionOnSlide(slide, x, y);
  }

  function resolveDeckAware(resolve: ResolveTarget, x: number, y: number) {
    const target = resolve(x, y);
    if (target && !target.refuse && enclosingDeckSlide(target.el)) return target;

    const thumbnail = deckRailHitAt(x, y);
    if (thumbnail) {
      const point = remapDeckRailHit(x, y, thumbnail);
      const onSlide = point ? resolveOnHiddenSlide(thumbnail.slide, resolve, point.x, point.y) : null;
      return onSlide && !onSlide.refuse && enclosingDeckSlide(onSlide.el) ? onSlide : target;
    }
    const clamped = clampPointToActiveDeckSlides(x, y);
    if (clamped) {
      const onSlide = resolve(clamped.x, clamped.y);
      if (onSlide && !onSlide.refuse && enclosingDeckSlide(onSlide.el)) return onSlide;
    }
    return target;
  }

  return {
    highlightAt: (x: number, y: number) => resolveDeckAware(hitMediaTarget, x, y),
    targetAt: (x: number, y: number) => resolveDeckAware(resolveLayoutTarget, x, y),
  };
}
