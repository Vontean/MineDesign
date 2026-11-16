/** 画布文档的焦点管理：窗口失焦时用临时节点抢回焦点，并清掉遗留的活动元素。 */

/** 窗口重新获得焦点后，临时节点的保留时间。 */
export const focusSinkRefocusDelayMs = 100;
/** 临时节点在窗口一直没获得焦点时的最长保留时间。 */
export const focusSinkMaxLifetimeMs = 1e3;

export function focusCanvasDocument(): void {
  if (!document.hasFocus()) {
    blurCanvasActiveElement(true);
    temporaryFocusSink();
    window.focus();
    return;
  }
  blurCanvasActiveElement(false);
}

/** 放一个不可见的可聚焦节点接住焦点，窗口拿到焦点或超时后移除。 */
export function temporaryFocusSink(): void {
  const sink = document.createElement("div");
  sink.tabIndex = -1;
  sink.style.cssText =
    "position:fixed;left:0;top:0;width:1px;height:1px;opacity:0;pointer-events:none;outline:none";
  let timer: ReturnType<typeof setTimeout> | undefined;
  const removeSink = (): void => {
    clearTimeout(timer);
    window.removeEventListener("focus", onWindowFocus);
    sink.remove();
  };
  const onWindowFocus = (): void => {
    clearTimeout(timer);
    timer = setTimeout(removeSink, focusSinkRefocusDelayMs);
  };
  window.addEventListener("focus", onWindowFocus);
  timer = setTimeout(removeSink, focusSinkMaxLifetimeMs);
  document.body.appendChild(sink);
  sink.focus({
    preventScroll: true,
  });
}

/** 让当前活动元素失焦；includeIframe 为假时保留 iframe 的焦点。 */
export function blurCanvasActiveElement(includeIframe?: boolean): void {
  const activeElement = document.activeElement;
  activeElement instanceof HTMLElement &&
    activeElement !== document.body &&
    (includeIframe || activeElement.tagName !== "IFRAME") &&
    activeElement.blur();
}
