import { findBoxSnapAdjustment } from "./alignment-guides";
import { unwrapDisplayContentsHost } from "./element-query";

interface DragGeometry {
  mode: string;
  startRect: DOMRectReadOnly;
  maskX?: boolean;
  maskY?: boolean;
  sizeEl?: Element;
  sizePos?: string;
  sizeW: number;
  sizeH: number;
}

type SnapGuide = { axis: "x" | "y"; pos: number };
type Modifiers = { metaKey?: boolean; ctrlKey?: boolean };

export function createAbsoluteDragSnapping(options: {
  gesture(): DragGeometry;
  usesNativeScroll(): boolean;
  chromePixels(pixels: number): number;
}) {
  let guides: SnapGuide[] | null = null;

  function clear() {
    const hadGuides = guides !== null;
    guides = null;
    return hadGuides;
  }

  function snap(modifiers: Modifiers, element: Element, x: number, y: number, axes?: { x: boolean; y: boolean }) {
    clear();
    if (modifiers.metaKey || modifiers.ctrlKey) return { x, y };

    const drag = options.gesture();
    const start = drag.startRect;
    const viewport = document.scrollingElement || document.documentElement;
    const display = unwrapDisplayContentsHost(element);
    const bounds = display.getBoundingClientRect();
    const position = getComputedStyle(display).position;
    if (drag.mode !== "abs" && position !== "absolute" && position !== "fixed") return { x, y };

    if (bounds.width > 0 && bounds.height > 0 &&
        (drag.sizeEl !== element || drag.sizePos !== position || bounds.width >= drag.sizeW)) {
      drag.sizeEl = element;
      drag.sizePos = position;
      drag.sizeW = bounds.width;
      drag.sizeH = bounds.height;
    }
    const allowed = { x: (!axes || axes.x) && !drag.maskX, y: (!axes || axes.y) && !drag.maskY };
    const nativeScroll = options.usesNativeScroll();
    const centerX = (nativeScroll ? viewport.clientWidth : innerWidth) / 2;
    const centerY = (nativeScroll ? viewport.clientHeight : innerHeight) / 2;
    const result = findBoxSnapAdjustment(
      { x: start.left + x, y: start.top + y, w: drag.sizeW || start.width, h: drag.sizeH || start.height },
      [{ axis: "x", pos: centerX, kind: "center" }, { axis: "y", pos: centerY, kind: "center" }],
      options.chromePixels(8),
      allowed,
    );
    if (result.guides.length) guides = result.guides;
    return { x: x + result.dx, y: y + result.dy };
  }

  return { get guides() { return guides; }, clear, snap };
}
