import { uiMessage } from '@minedesign/contracts/ui-messages';
import { useUiLocale } from '../../ui-locale.ts';
/** Restored application module; prepare first, initialize in original order. */
import {
  type Dynamic,
} from "../../runtime-types";
import { reactCanvasMeasurements } from "../../canvas/measurements";
import { Button } from "../../cds/button/button";
import { getFocusableElements } from "../chrome/menu-item";
import { joinClassNames } from "../chrome/overlay-state";
import { clearEscapeReleaseSuppression } from "../chrome/popover";
import { jsxToolbarLayout, updateToolbarPinnedWords, useTouchToolbar } from "./layout";

var ToolbarScrollerClassNames: Dynamic;
function toolbarScrollPosition(
  direction?: Dynamic,
  scrollPosition?: Dynamic,
  viewportWidth?: Dynamic,
  contentWidth?: Dynamic,
  edgePadding?: Dynamic,
): Dynamic {
  let maxScroll: Dynamic = Math.max(0, contentWidth - viewportWidth),
    step: Dynamic = Math.max(viewportWidth - 2 * edgePadding, 48),
    nextPosition: Dynamic = scrollPosition + direction * step;
  direction === 1 && maxScroll - nextPosition <= edgePadding && (nextPosition = maxScroll);
  direction === -1 && nextPosition <= edgePadding && (nextPosition = 0);
  return Math.min(maxScroll, Math.max(0, nextPosition));
}
function isKeyboardFocused(element?: Dynamic): Dynamic {
  try {
    return element.matches(":focus-visible");
  } catch {
    return false;
  }
}
function ToolbarScrollPaddle({
  dir: dir,
  onPress: onPress,
  onLetGo: onLetGo,
}: Dynamic): Dynamic {
  useUiLocale();
  let value: Dynamic =
    dir === -1 ? uiMessage("inspector.scroller.scrollToolbarLeft") : uiMessage("inspector.scroller.scrollToolbarRight");
  return (
    <div
      data-tb-paddle={""}
      onClick={(event?: Dynamic): Dynamic => onPress(event.detail === 0)}
      className={joinClassNames(
        ToolbarScrollerClassNames,
        dir === -1 ? "left-0" : "right-0",
      )}
    >
      <Button
        iconOnly={true}
        size={"xs"}
        variant={"ghost"}
        icon={dir === -1 ? "CaretLeft" : "CaretRight"}
        aria-label={value}
        tooltip={false}
        onBlur={onLetGo}
        onPointerDown={onLetGo}
      />
    </div>
  );
}
function ToolbarScroller({
  leading: leading,
  revealLeading: revealLeading,
  children: children,
}: Dynamic): Dynamic {
  useUiLocale();
  let value: Dynamic = (0, reactCanvasMeasurements.useRef)(null),
    scrollerRef: Dynamic = (0, reactCanvasMeasurements.useRef)(null),
    [hasLeadingOverflow, setLeadingOverflow]: Dynamic = (0, reactCanvasMeasurements.useState)(
      false,
    ),
    [hasTrailingOverflow, setTrailingOverflow]: Dynamic = (0, reactCanvasMeasurements.useState)(
      false,
    ),
    isTouchToolbar: Dynamic = useTouchToolbar(),
    revealLeadingRef: Dynamic = (0, reactCanvasMeasurements.useRef)(undefined),
    isKeyboardNavigationRef: Dynamic = (0, reactCanvasMeasurements.useRef)(false),
    isPointerNavigationRef: Dynamic = (0, reactCanvasMeasurements.useRef)(false);
  (0, reactCanvasMeasurements.useEffect)((): Dynamic => {
    revealLeading != null &&
      revealLeading !== revealLeadingRef.current &&
      value.current?.scrollTo({
        left: 0,
        behavior: "smooth",
      });
    revealLeadingRef.current = revealLeading;
  }, [revealLeading]);
  let scheduleUpdate: Dynamic = (0,
  reactCanvasMeasurements.useCallback)((): Dynamic => {
    let current: Dynamic = value.current;
    if (!current) return;
    let hasScrolledLeft: Dynamic =
        (scrollerRef.current?.clientWidth ?? current.clientWidth) >=
        (isTouchToolbar ? 80 : 48),
      hasScrolledRight: Dynamic = hasScrolledLeft && current.scrollLeft > 1,
      isAtEnd: Dynamic =
        hasScrolledLeft &&
        current.scrollLeft + current.clientWidth < current.scrollWidth - 1,
      scrollContainer: Dynamic = scrollerRef.current,
      activeElement: Dynamic = current.ownerDocument.activeElement,
      paddle: Dynamic = activeElement?.closest("[data-tb-paddle]");
    if (
      scrollContainer &&
      activeElement &&
      paddle?.parentElement === scrollContainer &&
      (isKeyboardNavigationRef.current || isKeyboardFocused(activeElement))
    ) {
      let isLastPaddle: Dynamic = paddle === scrollContainer.lastElementChild;
      if (!(isLastPaddle ? isAtEnd : hasScrolledRight)) {
        let focusableElements: Dynamic = getFocusableElements(current);
        isPointerNavigationRef.current = true;
        try {
          for (let element of (isLastPaddle
            ? focusableElements.reverse()
            : focusableElements) as Dynamic)
            if (
              !element.hasAttribute("data-base-ui-focus-guard") &&
              (element.focus({
                preventScroll: true,
              }),
              !paddle.contains(current.ownerDocument.activeElement))
            ) {
              clearEscapeReleaseSuppression();
              break;
            }
        } finally {
          isPointerNavigationRef.current = false;
        }
      }
    }
    setLeadingOverflow(hasScrolledRight);
    setTrailingOverflow(isAtEnd);
  }, [isTouchToolbar]);
  (0, reactCanvasMeasurements.useEffect)((): Dynamic => {
    let current: Dynamic = value.current;
    if (!current) return;
    scheduleUpdate();
    let ancestor: Dynamic = current.closest(".tb-root"),
      index: Dynamic = 0,
      observer: Dynamic = new ResizeObserver((): Dynamic => {
        scheduleUpdate();
        cancelAnimationFrame(index);
        ancestor &&
          (index = requestAnimationFrame(
            (): Dynamic => updateToolbarPinnedWords(ancestor),
          ));
      });
    observer.observe(current);
    for (let child of current.children as Dynamic)
      observer.observe(child);
    let endCard: Dynamic = ancestor?.querySelector(".tb-card-end");
    ancestor && observer.observe(ancestor);
    endCard && observer.observe(endCard);
    let handleWheel: Dynamic = (event?: Dynamic): Dynamic => {
      if (
        (event.ctrlKey && current.closest("[data-tb-overlay]")) ||
        current.scrollWidth <= current.clientWidth
      )
        return;
      let wheelDelta: Dynamic =
        Math.abs(event.deltaX) > Math.abs(event.deltaY)
          ? event.deltaX
          : event.deltaY;
      wheelDelta !== 0 &&
        ((current.scrollLeft += wheelDelta), event.preventDefault());
    };
    current.addEventListener("wheel", handleWheel, {
      passive: false,
    });
    let handleFocusIn: Dynamic = (event?: Dynamic): Dynamic => {
      let target: Dynamic = event.target,
        scrollContainer: Dynamic = scrollerRef.current;
      if (
        !scrollContainer ||
        isPointerNavigationRef.current ||
        !(target instanceof Element) ||
        target.hasAttribute("data-base-ui-focus-guard") ||
        !isKeyboardFocused(target)
      )
        return;
      let bounds: Dynamic = target.getBoundingClientRect();
      if (bounds.width <= 1) return;
      let containerBounds: Dynamic = scrollContainer.getBoundingClientRect(),
        getPaddleBounds: Dynamic = (selector?: Dynamic): Dynamic =>
          scrollContainer.querySelector(":scope > " + selector)?.getBoundingClientRect()
            .width ?? 0,
        paddleWidth: Dynamic = getPaddleBounds("[data-tb-paddle]"),
        edgeOffset: Dynamic =
          containerBounds.width - 2 * (paddleWidth + getPaddleBounds("[data-tb-fade]")) >=
          bounds.width
            ? paddleWidth + getPaddleBounds("[data-tb-fade]")
            : paddleWidth,
        visibleStart: Dynamic = containerBounds.left + edgeOffset,
        visibleEnd: Dynamic = containerBounds.right - edgeOffset,
        scrollDelta: Dynamic =
          bounds.left < visibleStart || bounds.width > visibleEnd - visibleStart
            ? bounds.left - visibleStart
            : bounds.right > visibleEnd
              ? bounds.right - visibleEnd
              : 0;
      if (Math.round(scrollDelta) === 0) return;
      let maxScroll: Dynamic = current.scrollWidth - current.clientWidth,
        targetScroll: Dynamic = current.scrollLeft + scrollDelta;
      targetScroll <= edgeOffset && bounds.right - scrollDelta + targetScroll <= visibleEnd
        ? (targetScroll = 0)
        : maxScroll - targetScroll <= edgeOffset &&
          bounds.left - scrollDelta - (maxScroll - targetScroll) >= visibleStart &&
          (targetScroll = maxScroll);
      current.scrollLeft = Math.round(targetScroll);
    };
    current.addEventListener("focusin", handleFocusIn);
    return (): Dynamic => {
      cancelAnimationFrame(index);
      observer.disconnect();
      current.removeEventListener("wheel", handleWheel);
      current.removeEventListener("focusin", handleFocusIn);
    };
  }, [scheduleUpdate]);
  let callback: Dynamic = (): Dynamic => {
      isKeyboardNavigationRef.current = false;
    },
    scrollBy: Dynamic = (direction?: Dynamic, keyboardNavigation?: Dynamic): Dynamic => {
      let current: Dynamic = value.current;
      if (!current) return;
      let leadingPaddle: Dynamic = scrollerRef.current?.querySelector(
          ":scope > [data-tb-paddle]",
        ),
        trailingPaddle: Dynamic = scrollerRef.current?.querySelector(
          ":scope > span[aria-hidden]",
        ),
        scrollStep: Dynamic =
          (leadingPaddle?.offsetWidth ?? 24) + (trailingPaddle?.offsetWidth ?? 24),
        viewportWidth: Dynamic = scrollerRef.current?.clientWidth ?? current.clientWidth,
        availableWidth: Dynamic = current.clientWidth - viewportWidth;
      isKeyboardNavigationRef.current = keyboardNavigation;
      current.scrollTo({
        left: toolbarScrollPosition(
          direction,
          current.scrollLeft,
          viewportWidth,
          current.scrollWidth - availableWidth,
          scrollStep,
        ),
        behavior: "smooth",
      });
    };
  return (
    <div
      ref={scrollerRef}
      className={"relative flex min-w-0 flex-1 items-center self-stretch"}
    >
      <div
        ref={value}
        onScroll={scheduleUpdate}
        className={
          "tb-scroll flex min-w-0 flex-1 items-center gap-1 self-stretch overflow-x-auto pointer-coarse:gap-1.5"
        }
      >
        {leading != null ? (<span
            data-tb-cluster={""}
            className={
              "tb-slot flex shrink-0 items-center gap-1 pointer-coarse:gap-1.5"
            }
          >
            {leading}
          </span>) : (null)}
        <div
          className={
            "tb-slot flex min-w-max items-center gap-1 pointer-coarse:gap-1.5"
          }
        >
          {children}
        </div>
      </div>
      {hasLeadingOverflow ? (<jsxToolbarLayout.Fragment>
          <ToolbarScrollPaddle
            dir={-1}
            onPress={(event?: Dynamic): Dynamic => scrollBy(-1, event)}
            onLetGo={callback}
          />
          <span
            aria-hidden={"true"}
            data-tb-fade={"start"}
            className={
              "pointer-events-none absolute inset-y-0 left-6 z-10 w-6 pointer-coarse:left-10"
            }
          />
        </jsxToolbarLayout.Fragment>) : (null)}
      {hasTrailingOverflow ? (<jsxToolbarLayout.Fragment>
          <span
            aria-hidden={"true"}
            data-tb-fade={"end"}
            className={
              "pointer-events-none absolute inset-y-0 right-6 z-10 w-6 pointer-coarse:right-10"
            }
          />
          <ToolbarScrollPaddle
            dir={1}
            onPress={(event?: Dynamic): Dynamic => scrollBy(1, event)}
            onLetGo={callback}
          />
        </jsxToolbarLayout.Fragment>) : (null)}
    </div>
  );
}
export {
  isKeyboardFocused,
  ToolbarScroller,
  ToolbarScrollerClassNames,
  ToolbarScrollPaddle,
  toolbarScrollPosition,
};
export function installEditorToolbarScroller(): () => void {
  return () => {
    ToolbarScrollerClassNames =
      "absolute inset-y-0 z-10 flex w-6 items-center justify-center pointer-coarse:w-10";
  };
}
