const nonVisualTags = /^(STYLE|SCRIPT|LINK|META|TITLE|TEMPLATE|NOSCRIPT)$/;
const editorOverlay = "[data-dc-editor-overlay]";

type ContentHullEvent = { type: "contentHull" } & (
  | { empty: true }
  | { w: number; h: number }
);

function contentElements() {
  return Array.from(document.querySelectorAll("[data-dc-tpl]")).filter(
    (element) => !nonVisualTags.test(element.tagName) && !element.closest(editorOverlay),
  );
}

function measureHull() {
  let right = 0;
  let bottom = 0;
  for (const element of contentElements()) {
    const rect = element.getBoundingClientRect();
    if (rect.width <= 0 && rect.height <= 0) continue;
    right = Math.max(right, rect.right + window.scrollX);
    bottom = Math.max(bottom, rect.bottom + window.scrollY);
  }
  return { w: Math.ceil(right), h: Math.ceil(bottom) };
}

export function observeFramelessContentHull(isUnzoomed: () => boolean, emit: (event: ContentHullEvent) => void) {
  if (!document.documentElement.hasAttribute("data-dc-frameless") || typeof ResizeObserver !== "function") return;

  let animationFrame = 0;
  let emptyTimer: ReturnType<typeof setTimeout> | undefined;
  let lastHull = "";
  let loaded = document.readyState === "complete";
  let windowResized = false;
  let contentChanged = false;

  function measureAndReport() {
    animationFrame = 0;
    if (!isUnzoomed()) return;
    const { w, h } = measureHull();
    if (w <= 0 || h <= 0) {
      if (loaded && !emptyTimer) {
        emptyTimer = setTimeout(() => {
          emptyTimer = undefined;
          const current = measureHull();
          if ((current.w <= 0 || current.h <= 0) && lastHull !== "empty") {
            lastHull = "empty";
            emit({ type: "contentHull", empty: true });
          }
        }, 300);
      }
      return;
    }
    if (emptyTimer) {
      clearTimeout(emptyTimer);
      emptyTimer = undefined;
    }
    const hull = w + "x" + h;
    // 仅宿主窗口改变尺寸时更新缓存，避免画板和窗口互相触发缩放。
    const onlyWindowResized = windowResized && !contentChanged;
    windowResized = false;
    contentChanged = false;
    if (!onlyWindowResized && hull !== lastHull) emit({ type: "contentHull", w, h });
    lastHull = hull;
  }

  function scheduleMeasurement() {
    if (!animationFrame) animationFrame = requestAnimationFrame(measureAndReport);
  }

  const resizeObserver = new ResizeObserver(scheduleMeasurement);
  function observeContent() {
    resizeObserver.disconnect();
    for (const element of contentElements()) resizeObserver.observe(element);
    scheduleMeasurement();
  }

  window.addEventListener("resize", () => {
    windowResized = true;
    scheduleMeasurement();
  });
  new MutationObserver((records) => {
    const includesContent = records.some(({ target }) => {
      const element = target.nodeType === Node.ELEMENT_NODE ? target as Element : target.parentElement || document.body;
      return !element.closest(editorOverlay);
    });
    if (!includesContent) return;
    contentChanged = true;
    observeContent();
  }).observe(document.documentElement, {
    childList: true,
    subtree: true,
    characterData: true,
    attributes: true,
    attributeFilter: ["style", "class"],
  });
  window.addEventListener("load", () => {
    loaded = true;
    scheduleMeasurement();
  });
  (document.fonts?.ready ?? Promise.resolve()).then(observeContent, observeContent);
}
