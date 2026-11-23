import { useUiLocale } from '../../ui-locale.ts';
/** Restored application module; prepare first, initialize in original order. */
import {
  type Dynamic,
} from "../../runtime-types";
import { load_react, load_react_jsx_runtime } from "../../dependencies";
import { joinClassNames } from "./overlay-state";
import { toModuleNamespace } from "../../module-helpers";

var reactChromeScrollbar: Dynamic;
var jsxChromeScrollbar: Dynamic;
var ChromeScrollbarLabel: Dynamic;
var ChromeScrollbarConstant: Dynamic;
var scrollbarRightInset: Dynamic;
var scrollbarMinThumbHeight: Dynamic;
var ChromeScrollbarDelayMs: Dynamic;
var ChromeScrollbarClassNames: Dynamic;
function getScrollbarMetrics(scroller?: Dynamic, isExplicitTarget?: Dynamic): Dynamic {
  let {
      scrollHeight: scrollHeight,
      clientHeight: clientHeight,
      scrollTop: scrollTop,
    }: Dynamic = scroller,
    overflows: Dynamic = scrollHeight > clientHeight + 1,
    trackHeight: Dynamic = clientHeight,
    thumbHeight: Dynamic = overflows
      ? Math.max(
          scrollbarMinThumbHeight,
          Math.round((clientHeight / scrollHeight) * trackHeight),
        )
      : 0,
    maxThumbTop: Dynamic = trackHeight - thumbHeight,
    thumbTop: Dynamic = overflows
      ? Math.round((scrollTop / (scrollHeight - clientHeight)) * maxThumbTop)
      : 0,
    thumbRight: Dynamic = scrollbarRightInset,
    trackTop: Dynamic = 0;
  if (isExplicitTarget) {
    let offsetParent: Dynamic = scroller.offsetParent;
    thumbRight =
      (offsetParent ? offsetParent.clientWidth : scroller.offsetWidth) -
      (scroller.offsetLeft + scroller.offsetWidth) +
      scrollbarRightInset;
    trackTop = scroller.offsetTop;
  } else {
    let computedStyle: Dynamic = getComputedStyle(scroller);
    thumbRight =
      scrollbarRightInset - (parseFloat(computedStyle.paddingRight) || 0);
    thumbTop -= clientHeight - (parseFloat(computedStyle.paddingBottom) || 0);
  }
  return {
    top: thumbTop,
    height: thumbHeight,
    right: thumbRight,
    overflows: overflows,
    trackTop: trackTop,
  };
}
function FloatingScrollbar({
  target: target,
  className: className,
}: Dynamic): Dynamic {
  useUiLocale();
  let rootRef: Dynamic = (0, reactChromeScrollbar.useRef)(null),
    thumbRef: Dynamic = (0, reactChromeScrollbar.useRef)(null),
    [metrics, setMetrics]: Dynamic = (0, reactChromeScrollbar.useState)(null),
    [isVisible, setIsVisible]: Dynamic = (0, reactChromeScrollbar.useState)(false),
    [isDragging, setIsDragging]: Dynamic = (0, reactChromeScrollbar.useState)(false),
    isHoveringRef: Dynamic = (0, reactChromeScrollbar.useRef)(false),
    dragStateRef: Dynamic = (0, reactChromeScrollbar.useRef)(null),
    hideTimerRef: Dynamic = (0, reactChromeScrollbar.useRef)(null),
    scheduleHide: Dynamic = (0, reactChromeScrollbar.useCallback)((): Dynamic => {
      hideTimerRef.current && clearTimeout(hideTimerRef.current);
      hideTimerRef.current = setTimeout((): Dynamic => {
        hideTimerRef.current = null;
        !isHoveringRef.current && !dragStateRef.current && setIsVisible(false);
      }, ChromeScrollbarDelayMs);
    }, []);
  (0, reactChromeScrollbar.useEffect)((): Dynamic => {
    let isExplicitTarget: Dynamic = target !== undefined,
      scrollerElement: Dynamic = isExplicitTarget
        ? target.current
        : (rootRef.current?.parentElement ?? null);
    if (!scrollerElement) return;
    let frameId: Dynamic = 0,
      scheduleMeasure: Dynamic = (): Dynamic => {
        frameId ||
          (frameId = requestAnimationFrame((): Dynamic => {
            frameId = 0;
            let nextMetrics: Dynamic = getScrollbarMetrics(scrollerElement, isExplicitTarget);
            setMetrics(
              (previousMetrics?: Dynamic): Dynamic =>
                previousMetrics &&
                previousMetrics.top === nextMetrics.top &&
                previousMetrics.height === nextMetrics.height &&
                previousMetrics.right === nextMetrics.right &&
                previousMetrics.overflows === nextMetrics.overflows &&
                previousMetrics.trackTop === nextMetrics.trackTop
                  ? previousMetrics
                  : nextMetrics,
            );
          }));
      },
      handleScroll: Dynamic = (): Dynamic => {
        scheduleMeasure();
        setIsVisible(true);
        scheduleHide();
      },
      handlePointerOver: Dynamic = (event?: Dynamic): Dynamic => {
        let eventTarget: Dynamic = event.target,
          nearestScrollbar: Dynamic =
            eventTarget?.closest?.("[data-kit=overlay-scrollbar]") ?? null,
          isOwnScroller: Dynamic =
            (nearestScrollbar && nearestScrollbar !== rootRef.current
              ? null
              : (eventTarget?.closest?.("[data-overlay-scroller]") ?? null)) ===
            scrollerElement;
        isHoveringRef.current = isOwnScroller;
        isOwnScroller
          ? (scheduleMeasure(), setIsVisible(true))
          : dragStateRef.current || setIsVisible(false);
      },
      handlePointerLeave: Dynamic = (): Dynamic => {
        isHoveringRef.current = false;
        dragStateRef.current || scheduleHide();
      };
    scrollerElement.setAttribute("data-overlay-scroller", "");
    scrollerElement.addEventListener("scroll", handleScroll, {
      passive: true,
    });
    scrollerElement.addEventListener("pointerover", handlePointerOver);
    scrollerElement.addEventListener("pointerleave", handlePointerLeave);
    let resizeObserver: Dynamic =
      typeof ResizeObserver == "function"
        ? new ResizeObserver(scheduleMeasure)
        : null;
    resizeObserver?.observe(scrollerElement);
    let mutationObserver: Dynamic =
      typeof MutationObserver == "function"
        ? new MutationObserver(scheduleMeasure)
        : null;
    mutationObserver?.observe(scrollerElement, {
      childList: true,
      subtree: true,
      characterData: true,
    });
    scrollerElement.addEventListener("input", scheduleMeasure);
    scheduleMeasure();
    return (): Dynamic => {
      scrollerElement.removeAttribute("data-overlay-scroller");
      scrollerElement.removeEventListener("scroll", handleScroll);
      scrollerElement.removeEventListener("pointerover", handlePointerOver);
      scrollerElement.removeEventListener("pointerleave", handlePointerLeave);
      scrollerElement.removeEventListener("input", scheduleMeasure);
      resizeObserver?.disconnect();
      mutationObserver?.disconnect();
      frameId && cancelAnimationFrame(frameId);
      hideTimerRef.current && clearTimeout(hideTimerRef.current);
    };
  }, [target, scheduleHide]);
  let getScrollTarget: Dynamic = (): Dynamic =>
      target !== undefined
        ? target.current
        : (rootRef.current?.parentElement ?? null),
    handleThumbPointerDown: Dynamic = (event?: Dynamic): Dynamic => {
      if (event.button !== 0) return;
      let scrollTarget: Dynamic = getScrollTarget();
      if (scrollTarget) {
        event.preventDefault();
        event.stopPropagation();
        try {
          event.currentTarget.setPointerCapture(event.pointerId);
        } catch {}
        dragStateRef.current = {
          startY: event.clientY,
          startTop: scrollTarget.scrollTop,
          pointerId: event.pointerId,
        };
        setIsDragging(true);
        setIsVisible(true);
      }
    },
    handleThumbPointerMove: Dynamic = (event?: Dynamic): Dynamic => {
      let current: Dynamic = dragStateRef.current,
        activeScrollTarget: Dynamic = getScrollTarget();
      if (!current || !activeScrollTarget || event.pointerId !== current.pointerId)
        return;
      let { scrollHeight: targetScrollHeight, clientHeight: targetClientHeight }: Dynamic = activeScrollTarget,
        currentThumbHeight: Dynamic = metrics?.height ?? scrollbarMinThumbHeight,
        maxThumbTravel: Dynamic = targetClientHeight - currentThumbHeight;
      maxThumbTravel <= 0 ||
        (activeScrollTarget.scrollTop =
          current.startTop +
          ((event.clientY - current.startY) * (targetScrollHeight - targetClientHeight)) / maxThumbTravel);
    },
    handleThumbPointerUp: Dynamic = (event?: Dynamic): Dynamic => {
      let current: Dynamic = dragStateRef.current;
      !current ||
        event.pointerId !== current.pointerId ||
        ((dragStateRef.current = null),
        setIsDragging(false),
        event.currentTarget.hasPointerCapture(event.pointerId) &&
          event.currentTarget.releasePointerCapture(event.pointerId),
        isHoveringRef.current || scheduleHide());
    },
    handleThumbPointerEnter: Dynamic = (): Dynamic => {
      isHoveringRef.current = true;
      setIsVisible(true);
    },
    handleThumbPointerLeave: Dynamic = (): Dynamic => {
      isHoveringRef.current = false;
      dragStateRef.current || scheduleHide();
    },
    isThumbVisible: Dynamic = isVisible && metrics?.overflows === true,
    hasExplicitTarget: Dynamic = target !== undefined,
    thumbElement: Dynamic = metrics ? (
      <div
        ref={thumbRef}
        data-kit={"overlay-scrollbar-thumb"}
        data-dragging={isDragging ? "" : undefined}
        className={joinClassNames(
          "absolute cursor-default select-none",
          ChromeScrollbarClassNames,
          !isThumbVisible && "pointer-events-none",
        )}
        style={{
          width: ChromeScrollbarConstant,
          right: metrics.right,
          top: (hasExplicitTarget ? metrics.trackTop : 0) + metrics.top,
          height: metrics.height,
          opacity: isThumbVisible ? 1 : 0,
        }}
        onPointerEnter={handleThumbPointerEnter}
        onPointerLeave={handleThumbPointerLeave}
        onPointerDown={handleThumbPointerDown}
        onPointerMove={handleThumbPointerMove}
        onPointerUp={handleThumbPointerUp}
        onPointerCancel={handleThumbPointerUp}
      />
    ) : null;
  return (
    <div
      ref={rootRef}
      aria-hidden={"true"}
      data-kit={"overlay-scrollbar"}
      className={joinClassNames(
        hasExplicitTarget
          ? "contents"
          : "sticky bottom-0 z-10 h-0 w-full shrink-0 overflow-visible",
        className,
      )}
    >
      {thumbElement}
    </div>
  );
}
export {
  ChromeScrollbarClassNames,
  ChromeScrollbarConstant,
  scrollbarRightInset,
  scrollbarMinThumbHeight,
  ChromeScrollbarDelayMs,
  ChromeScrollbarLabel,
  FloatingScrollbar,
  getScrollbarMetrics,
  jsxChromeScrollbar,
  reactChromeScrollbar,
};
export function installEditorChromeScrollbar(): () => void {
  return () => {
    reactChromeScrollbar = toModuleNamespace(
      load_react(),
      1,
    );
    jsxChromeScrollbar = toModuleNamespace(
      load_react_jsx_runtime(),
      1,
    );
    ChromeScrollbarLabel =
      "[scrollbar-width:none] [&::-webkit-scrollbar]:hidden";
    ChromeScrollbarConstant = 6;
    scrollbarRightInset = 2;
    scrollbarMinThumbHeight = 24;
    ChromeScrollbarDelayMs = 800;
    ChromeScrollbarClassNames =
      "rounded-full bg-alpha-3 hover:bg-alpha-4 data-[dragging]:bg-alpha-4 transition-opacity duration-150 motion-reduce:transition-none touch-none";
  };
}
