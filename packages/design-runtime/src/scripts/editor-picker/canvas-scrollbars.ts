interface CanvasScrollbarOptions {
  contentRoot(): Element;
  unwrapDisplayContents(element: Element): Element;
  readOffset(): { x: number; y: number };
  panTo(axis: Axis, value: number): void;
}

type Axis = "x" | "y";
interface ScrollbarDrag {
  axis: Axis;
  startPan: number;
  startPointer: number;
  ratio: number;
}

const inset = 2;
const thickness = 6;
const minimumThumb = 20;

export function createCanvasScrollbars(options: CanvasScrollbarOptions) {
  let overlay: { root: HTMLElement; x: HTMLElement; y: HTMLElement } | null = null;
  let drag: ScrollbarDrag | null = null;

  function measure() {
    const viewportWidth = innerWidth;
    const viewportHeight = innerHeight;
    let left = Infinity, top = Infinity, right = -Infinity, bottom = -Infinity;
    for (const child of options.contentRoot().children) {
      if (child.hasAttribute("data-dc-editor-overlay")) continue;
      const bounds = options.unwrapDisplayContents(child).getBoundingClientRect();
      if (bounds.width <= 0 && bounds.height <= 0) continue;
      if (bounds.left < left) left = bounds.left;
      if (bounds.top < top) top = bounds.top;
      if (bounds.right > right) right = bounds.right;
      if (bounds.bottom > bottom) bottom = bounds.bottom;
    }
    if (left === Infinity) left = top = right = bottom = 0;
    left = Math.min(left, 0);
    top = Math.min(top, 0);
    const contentWidth = Math.max(right, viewportWidth) - left;
    const contentHeight = Math.max(bottom, viewportHeight) - top;
    const overflowX = contentWidth - viewportWidth;
    const overflowY = contentHeight - viewportHeight;
    const trackWidth = viewportWidth - 2 * inset - (contentHeight > viewportHeight + 1 ? thickness + inset : 0);
    const trackHeight = viewportHeight - 2 * inset - (contentWidth > viewportWidth + 1 ? thickness + inset : 0);
    return {
      x: { offset: left, range: overflowX, track: trackWidth, thumb: Math.max(minimumThumb, trackWidth * Math.min(1, viewportWidth / contentWidth)) },
      y: { offset: top, range: overflowY, track: trackHeight, thumb: Math.max(minimumThumb, trackHeight * Math.min(1, viewportHeight / contentHeight)) },
    };
  }

  function refresh() {
    if (!overlay) return;
    const metrics = measure();
    for (const axis of ["x", "y"] as const) {
      const { offset, range, track, thumb } = metrics[axis];
      const style = overlay[axis].style;
      if (range > 1) {
        const progress = Math.max(0, Math.min(1, -offset / range));
        style.display = "block";
        style[axis === "x" ? "left" : "top"] = inset + progress * (track - thumb) + "px";
        style[axis === "x" ? "width" : "height"] = thumb + "px";
      } else if (drag?.axis !== axis) {
        style.display = "none";
      }
    }
  }

  function createThumb(root: HTMLElement, axis: Axis) {
    const thumb = document.createElement("div");
    const pointer = (event: PointerEvent) => axis === "y" ? event.clientY : event.clientX;
    thumb.setAttribute("data-dc-pan-thumb", axis);
    thumb.style.cssText =
      "position:fixed;border-radius:3px;cursor:default;pointer-events:auto;touch-action:none;background:rgba(120,120,120,0.45);display:none;" +
      (axis === "y" ? "right:2px;width:6px;" : "bottom:2px;height:6px;");
    thumb.addEventListener("mouseenter", () => { thumb.style.background = "rgba(120,120,120,0.65)"; });
    thumb.addEventListener("mouseleave", () => { thumb.style.background = "rgba(120,120,120,0.45)"; });
    thumb.addEventListener("pointerdown", (event) => {
      if (event.button !== 0) return;
      event.preventDefault();
      event.stopPropagation();
      try {
        thumb.setPointerCapture(event.pointerId);
      } catch {}
      const metrics = measure()[axis];
      const travel = metrics.track - metrics.thumb;
      drag = {
        axis,
        startPan: options.readOffset()[axis],
        startPointer: pointer(event),
        ratio: travel > 0 ? metrics.range / travel : 0,
      };
    });
    thumb.addEventListener("pointermove", (event) => {
      if (drag?.axis !== axis) return;
      options.panTo(axis, drag.startPan - (pointer(event) - drag.startPointer) * drag.ratio);
    });
    const finish = () => {
      if (drag?.axis !== axis) return;
      drag = null;
      refresh();
    };
    thumb.addEventListener("pointerup", finish);
    thumb.addEventListener("pointercancel", finish);
    root.appendChild(thumb);
    return thumb;
  }

  function mount() {
    if (overlay?.root.isConnected) return;
    if (!document.documentElement.hasAttribute("data-dc-canvas")) return;
    const root = document.createElement("div");
    root.setAttribute("data-dc-editor-overlay", "");
    root.setAttribute("data-dc-edit-transparent", "");
    root.setAttribute("data-omelette-chrome", "");
    root.setAttribute("data-omelette-injected", "");
    root.style.cssText = "position:fixed;inset:0;z-index:2147483644;pointer-events:none;";
    overlay = { root, y: createThumb(root, "y"), x: createThumb(root, "x") };
    if (document.body.hasAttribute("data-dc-editor-overlay-hidden")) root.style.display = "none";
    document.documentElement.appendChild(root);
    window.addEventListener("resize", refresh);
  }

  function unmount() {
    window.removeEventListener("resize", refresh);
    if (overlay) {
      try {
        overlay.root.parentNode?.removeChild(overlay.root);
      } catch {}
      overlay = null;
    }
    drag = null;
  }

  return {
    mount,
    refresh,
    unmount,
    setHidden(hidden: boolean) {
      if (overlay) overlay.root.style.display = hidden ? "none" : "";
    },
  };
}
