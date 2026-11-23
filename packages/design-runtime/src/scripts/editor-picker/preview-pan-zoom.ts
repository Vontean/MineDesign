import { createCanvasScrollbars } from "./canvas-scrollbars";
import { unwrapDisplayContentsHost } from "./element-query";

interface PreviewPanZoomOptions {
  isLocal(): boolean;
  refreshChrome(): void;
}

export function panZoomRoot(): HTMLElement {
  return document.querySelector<HTMLElement>(".sc-host:not(.sc-host .sc-host)") || document.body;
}

function postToHost(message: object) {
  try { parent.postMessage(message, "*"); } catch {}
}

function viewportCorrection(start: number, size: number, viewport: number) {
  const end = start + size;
  if (size >= viewport) {
    if (start > 0) return -start;
    if (end < viewport) return viewport - end;
  } else {
    if (start < 0) return -start;
    if (end > viewport) return viewport - end;
  }
  return 0;
}

function previewCorrection(start: number, end: number, viewport: number) {
  if (end < -viewport) return -viewport - end;
  if (start > 2 * viewport) return 2 * viewport - start;
  return 0;
}

function overflowBounds(root: HTMLElement) {
  let left = Infinity, top = Infinity, right = -Infinity, bottom = -Infinity;
  for (const child of root.children) {
    if (child.hasAttribute("data-dc-editor-overlay")) continue;
    const rect = unwrapDisplayContentsHost(child).getBoundingClientRect();
    if (rect.width <= 0 && rect.height <= 0) continue;
    if (rect.left < left) left = rect.left;
    if (rect.top < top) top = rect.top;
    if (rect.right > right) right = rect.right;
    if (rect.bottom > bottom) bottom = rect.bottom;
  }
  return left === Infinity ? null : { left, top, right, bottom };
}

function horizontalLayoutBounds(root: HTMLElement) {
  let left = Infinity, right = -Infinity;
  for (const child of root.children) {
    if (child.hasAttribute("data-dc-editor-overlay")) continue;
    const visible = unwrapDisplayContentsHost(child) as HTMLElement | null;
    if (!visible?.offsetWidth) continue;
    if (visible.offsetLeft < left) left = visible.offsetLeft;
    const edge = visible.offsetLeft + visible.offsetWidth;
    if (edge > right) right = edge;
  }
  if (left === Infinity) return { left: 0, width: 0 };
  const start = Math.min(left, 0);
  return { left: start, width: right - start };
}

export function createPreviewPanZoom(options: PreviewPanZoomOptions) {
  let offset = { x: 0, y: 0 };
  let scale = 1;
  let lastReportedScale: number | undefined;
  let reportQueued = false;
  let initialFitScheduled = false;

  const isIdentity = () => offset.x === 0 && offset.y === 0 && scale === 1;
  const transform = () => `translate(${offset.x}px,${offset.y}px) scale(${scale})`;
  const clampScale = (value: number) => options.isLocal()
    ? Math.min(10, Math.max(0.05, value))
    : Math.min(4, Math.max(0.2, value));

  const scrollbars = createCanvasScrollbars({
    contentRoot: panZoomRoot,
    unwrapDisplayContents: unwrapDisplayContentsHost,
    readOffset: () => offset,
    panTo(axis, value) {
      offset[axis] = value;
      apply();
    },
  });

  function report() {
    if (lastReportedScale !== scale) {
      lastReportedScale = scale;
      postToHost({ type: "__dc_zoom", scale });
    }
    if (reportQueued) return;
    reportQueued = true;
    requestAnimationFrame(() => {
      reportQueued = false;
      postToHost({ type: "__dc_pan_zoom", x: offset.x, y: offset.y, scale });
    });
  }

  function adjustBounds(root: HTMLElement) {
    let correctionX = 0, correctionY = 0;
    if (options.isLocal()) {
      const rect = overflowBounds(root);
      if (!rect) return;
      correctionX = previewCorrection(rect.left, rect.right, innerWidth);
      correctionY = previewCorrection(rect.top, rect.bottom, innerHeight);
    } else {
      const rect = root.getBoundingClientRect();
      const width = Math.max(root.scrollWidth, root.offsetWidth) * scale;
      const height = Math.max(root.scrollHeight, root.offsetHeight) * scale;
      if (width > 0 && height > 0) {
        correctionX = viewportCorrection(rect.left, width, innerWidth);
        correctionY = viewportCorrection(rect.top, height, innerHeight);
      }
    }
    if (correctionX || correctionY) {
      offset.x += correctionX;
      offset.y += correctionY;
      root.style.transform = transform();
    }
  }

  function apply() {
    const root = panZoomRoot();
    if (!root) return;
    const identity = !offset.x && !offset.y && scale === 1;
    root.style.transformOrigin = "0 0";
    root.style.transform = identity ? "" : transform();
    if (options.isLocal()) report();
    if (!identity) adjustBounds(root);
    scrollbars.refresh();
    options.refreshChrome();
  }

  function fitWidth() {
    const root = panZoomRoot();
    if (!root) return;
    const bounds = horizontalLayoutBounds(root);
    if (!bounds.width) return;
    const nextScale = clampScale(innerWidth / bounds.width);
    const x = -bounds.left * nextScale;
    if (scale === nextScale && offset.x === x && !offset.y) return;
    scale = nextScale;
    offset.x = x;
    offset.y = 0;
    apply();
  }

  function zoomAt(nextScale: number, x: number, y: number) {
    const zoom = clampScale(nextScale);
    const root = panZoomRoot();
    if (!root || zoom === scale) return;
    const rect = root.getBoundingClientRect();
    const left = rect.left - offset.x;
    const top = rect.top - offset.y;
    offset.x = x - left - (x - left - offset.x) * (zoom / scale);
    offset.y = y - top - (y - top - offset.y) * (zoom / scale);
    scale = zoom;
    apply();
  }

  function panBy(x: number, y: number) {
    offset.x += x;
    offset.y += y;
    apply();
  }

  function get() {
    return { x: offset.x, y: offset.y, z: scale };
  }

  function set(x: number, y: number, nextScale: number) {
    offset = { x, y };
    scale = nextScale;
    apply();
  }

  function reset() {
    offset = { x: 0, y: 0 };
    scale = 1;
    lastReportedScale = undefined;
    const root = panZoomRoot();
    if (root) root.style.transform = "";
  }

  function setPresence(present: boolean) {
    postToHost({ type: present ? "__dc_present" : "__dc_absent" });
  }

  function probe() {
    setPresence(true);
    lastReportedScale = undefined;
    apply();
  }

  function fitInitialCanvas() {
    if (initialFitScheduled || !document.querySelector('meta[name="design_doc_mode"][content="canvas"]')) return;
    initialFitScheduled = true;
    let fittedScale = 0;
    let fittedOffsetX = 0;
    function tryFit() {
      if ((scale !== 1 && scale !== fittedScale) ||
          (offset.x !== 0 && offset.x !== fittedOffsetX) || offset.y !== 0) return;
      const root = panZoomRoot();
      if (root && horizontalLayoutBounds(root).width > innerWidth * 1.05) {
        fitWidth();
        fittedScale = scale;
        fittedOffsetX = offset.x;
      }
    }
    tryFit();
    requestAnimationFrame(tryFit);
    setTimeout(tryFit, 250);
  }

  return { get, set, reset, scrollbars, zoomAt, panBy, fitWidth, fitInitialCanvas, probe, setPresence, isIdentity,
    get scale() { return scale; },
  };
}
