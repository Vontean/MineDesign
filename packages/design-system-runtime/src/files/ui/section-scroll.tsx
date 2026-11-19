import { useUiLocale } from '../../ui-locale.ts';
/** Restored application module; prepare first, initialize in original order. */
import type * as React from "react";
import type * as JsxRuntime from "react/jsx-runtime";
import type {
  SectionPosition,
  ScrollEdge,
  ScrollViewport,
  SectionRefs,
  SectionScroller,
  LazySectionProps,
} from "../../contracts/application";
import { loadJsxNamespace, loadReactNamespace } from "../../dependencies";
import { toModuleNamespace } from "../../module-helpers";

var reactSectionScroller: typeof React;
var jsxLazySection: typeof JsxRuntime;
var SECTION_SCROLL_MIN_LEAD_PX: number;
var SECTION_SCROLL_VIEWPORT_LEAD_RATIO: number;
var SECTION_SCROLL_ANCHOR_HOLD_MS: number;
function sectionAtScrollPosition(
  sections: SectionPosition[],
  leadY: number,
  edge: ScrollEdge,
  wanted: string | null,
  viewport: ScrollViewport,
) {
  if (sections.length === 0) {
    return null;
  }
  let wantedSection =
      wanted === null
        ? undefined
        : sections.find((section) => section.id === wanted),
    wantedVisible =
      wantedSection !== undefined &&
      wantedSection.top >= viewport.top - 1 &&
      wantedSection.top < viewport.bottom;
  if (edge === "top") {
    if (wantedVisible) {
      return (wantedSection as SectionPosition).id;
    } else {
      return sections[0].id;
    }
  }
  let current = sections[0].id;
  for (let value of sections) {
    if (value.top <= leadY) {
      current = value.id;
    }
  }
  if (edge === "bottom") {
    if (wantedVisible) {
      return (wantedSection as SectionPosition).id;
    } else {
      return sections[sections.length - 1].id;
    }
  }
  return current;
}
function sectionsThroughTarget(sections: string[], target: string) {
  let index = sections.indexOf(target);
  if (index < 0) {
    return [target];
  } else {
    return sections.slice(0, index + 1);
  }
}
function focusIsEditingElsewhere(section: HTMLElement): boolean {
  let active = document.activeElement;
  if (
    !(active instanceof HTMLElement) ||
    active === document.body ||
    active === section
  ) {
    return false;
  }
  return (
    active.isContentEditable ||
    /^(INPUT|TEXTAREA|SELECT)$/.test(active.tagName) ||
    active.closest('[role="dialog"]') !== null
  );
}
function useSectionScroller(
  sectionIds: string[],
  headerBottom: () => number | undefined,
  sectionRefs: SectionRefs,
  initialSection: string,
): SectionScroller {
  let [port, setPort] = reactSectionScroller.useState<HTMLElement | null>(
      null,
    ),
    attach = reactSectionScroller.useCallback(
      (element: HTMLElement | null) => setPort(element),
      [],
    ),
    [current, setCurrent] = reactSectionScroller.useState(initialSection),
    currentRef = reactSectionScroller.useRef(current);
  currentRef.current = current;
  let [wanted, setWanted] = reactSectionScroller.useState(
      () =>
        new Set(
          initialSection === sectionIds[0]
            ? []
            : sectionsThroughTarget(sectionIds, initialSection),
        ),
    ),
    [moved, setMoved] = reactSectionScroller.useState(
      initialSection !== sectionIds[0],
    ),
    targetRef = reactSectionScroller.useRef<string | null>(
      initialSection === sectionIds[0] ? null : initialSection,
    ),
    holdUntilRef = reactSectionScroller.useRef(0),
    focusPending = reactSectionScroller.useRef(false),
    sectionIdsRef = reactSectionScroller.useRef(sectionIds);
  sectionIdsRef.current = sectionIds;
  let headerBottomRef = reactSectionScroller.useRef(headerBottom);
  headerBottomRef.current = headerBottom;
  let markedRef = reactSectionScroller.useRef<string | null>(null),
    markedUntilRef = reactSectionScroller.useRef(0),
    markedTimerRef = reactSectionScroller.useRef(0);
  reactSectionScroller.useEffect(
    () => () => window.clearTimeout(markedTimerRef.current),
    [],
  );
  let clearTarget = reactSectionScroller.useCallback(() => {
      holdUntilRef.current = 0;
      targetRef.current = null;
      focusPending.current = false;
    }, []),
    measureCurrent = reactSectionScroller.useCallback(() => {
      if (port === null) {
        return;
      }
      let bounds = port.getBoundingClientRect(),
        value =
          (headerBottomRef.current() ?? bounds.top) +
          Math.max(
            SECTION_SCROLL_MIN_LEAD_PX,
            port.clientHeight * SECTION_SCROLL_VIEWPORT_LEAD_RATIO,
          ),
        items: SectionPosition[] = [];
      for (let sectionId of sectionIdsRef.current) {
        let sectionElement = sectionRefs.current[sectionId];
        if (sectionElement !== null && sectionElement !== undefined) {
          items.push({
            id: sectionId,
            top: sectionElement.getBoundingClientRect().top,
          });
        }
      }
      let scrollEdge: ScrollEdge =
          port.scrollTop <= 1
            ? "top"
            : port.scrollTop + port.clientHeight >= port.scrollHeight - 2
              ? "bottom"
              : null,
        visibleSectionId = sectionAtScrollPosition(
          items,
          value,
          scrollEdge,
          targetRef.current,
          bounds,
        ),
        markedSectionId = markedRef.current,
        sectionBounds =
          markedSectionId === null || !sectionIdsRef.current.includes(markedSectionId)
            ? undefined
            : sectionRefs.current[markedSectionId]?.getBoundingClientRect(),
        outsideViewport =
          Date.now() >= markedUntilRef.current &&
          sectionBounds !== undefined &&
          (sectionBounds.bottom <= bounds.top ||
            sectionBounds.top >= bounds.bottom ||
            visibleSectionId === markedSectionId);
      if (markedSectionId !== null && (sectionBounds === undefined || outsideViewport)) {
        markedRef.current = null;
      }
      let nextSectionId =
        Date.now() < holdUntilRef.current && targetRef.current !== null
          ? targetRef.current
          : (markedRef.current ?? visibleSectionId);
      if (nextSectionId !== null && nextSectionId !== currentRef.current) {
        currentRef.current = nextSectionId;
        setMoved(true);
        setCurrent(nextSectionId);
      }
    }, [port, sectionRefs]),
    scrollToTarget = reactSectionScroller.useCallback(() => {
      let targetSectionId = targetRef.current,
        value = targetSectionId === null ? null : sectionRefs.current[targetSectionId];
      if (port === null || value === null || value === undefined) {
        return false;
      }
      let bounds = port.getBoundingClientRect(),
        headerOffset = headerBottomRef.current(),
        scrollTop =
          headerOffset !== undefined ? Math.max(0, headerOffset - bounds.top + 8) : 0,
        maxScrollTop = Math.max(0, port.scrollHeight - port.clientHeight),
        targetScrollTop = Math.min(
          maxScrollTop,
          Math.max(
            0,
            port.scrollTop +
              value.getBoundingClientRect().top -
              bounds.top -
              scrollTop,
          ),
        );
      if (Math.abs(targetScrollTop - port.scrollTop) < 1) {
        return false;
      }
      port.scrollTo({
        top: targetScrollTop,
        behavior: "instant",
      });
      return true;
    }, [port, sectionRefs]),
    focusTarget = reactSectionScroller.useCallback(() => {
      let value =
        targetRef.current === null
          ? null
          : sectionRefs.current[targetRef.current];
      if (!focusPending.current || value === null || value === undefined) {
        return;
      }
      focusPending.current = false;
      if (!focusIsEditingElsewhere(value)) {
        value.focus({
          preventScroll: true,
        });
      }
    }, [sectionRefs]);
  reactSectionScroller.useEffect(() => {
    if (port === null) {
      return;
    }
    let index = 0,
      callback = () => {
        if (index === 0) {
          index = requestAnimationFrame(() => {
            index = 0;
            measureCurrent();
          });
        }
      };
    port.addEventListener("scroll", callback, {
      passive: true,
    });
    let updateScrollState = () => {
      clearTarget();
      if (markedRef.current === null) {
        return;
      }
      markedUntilRef.current = 0;
      callback();
    };
    for (let eventType of ["wheel", "touchstart", "pointerdown"]) {
      port.addEventListener(eventType, updateScrollState, {
        passive: true,
      });
    }
    port.addEventListener("keydown", updateScrollState);
    let value =
      typeof ResizeObserver === "function"
        ? new ResizeObserver(() => {
            if (Date.now() < holdUntilRef.current) {
              scrollToTarget();
            }
            callback();
          })
        : null;
    if (value !== null) {
      for (let child of Array.from(port.children)) {
        value.observe(child);
      }
    }
    let resizeObserver =
      typeof MutationObserver === "function" && value !== null
        ? new MutationObserver((mutations) => {
            for (let mutation of mutations) {
              mutation.addedNodes.forEach((addedNode) => {
                if (addedNode instanceof Element) {
                  value.observe(addedNode);
                }
              });
              mutation.removedNodes.forEach((removedNode) => {
                if (removedNode instanceof Element) {
                  value.unobserve(removedNode);
                }
              });
            }
          })
        : null;
    resizeObserver?.observe(port, {
      childList: true,
    });
    measureCurrent();
    return () => {
      port.removeEventListener("scroll", callback);
      for (let eventType of ["wheel", "touchstart", "pointerdown"]) {
        port.removeEventListener(eventType, updateScrollState);
      }
      port.removeEventListener("keydown", updateScrollState);
      if (index !== 0) {
        cancelAnimationFrame(index);
      }
      value?.disconnect();
      resizeObserver?.disconnect();
    };
  }, [port, measureCurrent, scrollToTarget, clearTarget]);
  reactSectionScroller.useEffect(measureCurrent, [
    measureCurrent,
    sectionIds,
  ]);
  let wantThrough = reactSectionScroller.useCallback(
      (requestedSectionId: string) =>
        setWanted((wantedSections) => {
          let value = sectionsThroughTarget(
            sectionIdsRef.current,
            requestedSectionId,
          ).filter((sectionId) => !wantedSections.has(sectionId));
          if (value.length === 0) {
            return wantedSections;
          } else {
            return new Set([...wantedSections, ...value]);
          }
        }),
      [],
    ),
    want = reactSectionScroller.useCallback(
      (sectionId: string) => {
        markedRef.current = null;
        wantThrough(sectionId);
      },
      [wantThrough],
    ),
    mark = reactSectionScroller.useCallback(
      (sectionId: string) => {
        clearTarget();
        markedRef.current = sectionId;
        markedUntilRef.current = Date.now() + SECTION_SCROLL_ANCHOR_HOLD_MS;
        window.clearTimeout(markedTimerRef.current);
        markedTimerRef.current = window.setTimeout(() => {
          if (markedRef.current !== null) {
            measureCurrent();
          }
        }, SECTION_SCROLL_ANCHOR_HOLD_MS + 20);
        currentRef.current = sectionId;
        setMoved(true);
        setCurrent(sectionId);
        wantThrough(sectionId);
      },
      [clearTarget, wantThrough, measureCurrent],
    ),
    jump = reactSectionScroller.useCallback(
      (sectionId: string) => {
        markedRef.current = null;
        targetRef.current = sectionId;
        holdUntilRef.current = Date.now() + SECTION_SCROLL_ANCHOR_HOLD_MS;
        focusPending.current = true;
        currentRef.current = sectionId;
        setMoved(true);
        setCurrent(sectionId);
        wantThrough(sectionId);
        scrollToTarget();
        focusTarget();
      },
      [wantThrough, scrollToTarget, focusTarget],
    ),
    initialJumpPending = reactSectionScroller.useRef(
      initialSection !== sectionIds[0],
    );
  reactSectionScroller.useLayoutEffect(() => {
    if (port !== null && initialJumpPending.current) {
      initialJumpPending.current = false;
      jump(initialSection);
      return;
    }
    if (Date.now() < holdUntilRef.current) {
      scrollToTarget();
      focusTarget();
    }
  });
  return {
    current: current,
    jump: jump,
    wanted: wanted,
    want: want,
    mark: mark,
    attach: attach,
    moved: moved,
    port: port,
  };
}
function LazySection({
  root: root,
  eager = false,
  standIn: standIn,
  children: children,
}: LazySectionProps) {
  useUiLocale();
  let [value, isLoaded] = reactSectionScroller.useState(false),
    shouldRender = eager || value,
    ref = reactSectionScroller.useRef<HTMLDivElement | null>(null);
  reactSectionScroller.useEffect(() => {
    if (shouldRender) {
      return;
    }
    if (typeof IntersectionObserver !== "function") {
      isLoaded(true);
      return;
    }
    let current = ref.current;
    if (current === null) {
      return;
    }
    let intersectionObserver = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          isLoaded(true);
        }
      },
      {
        root: root,
        rootMargin: "1500px 0px",
      },
    );
    intersectionObserver.observe(current);
    return () => intersectionObserver.disconnect();
  }, [shouldRender, root]);
  reactSectionScroller.useEffect(() => {
    if (shouldRender && !value) {
      isLoaded(true);
    }
  }, [shouldRender, value]);
  if (shouldRender) {
    return <jsxLazySection.Fragment>{children()}</jsxLazySection.Fragment>;
  } else {
    return (
      <div
        ref={ref}
        className={"ds-lazy flex flex-col"}
        data-testid={"ds-lazy"}
      >
        {standIn}
      </div>
    );
  }
}
export {
  focusIsEditingElsewhere,
  jsxLazySection,
  LazySection,
  reactSectionScroller,
  SECTION_SCROLL_ANCHOR_HOLD_MS,
  SECTION_SCROLL_MIN_LEAD_PX,
  SECTION_SCROLL_VIEWPORT_LEAD_RATIO,
  sectionAtScrollPosition,
  sectionsThroughTarget,
  useSectionScroller,
};
export function installFilesUiSectionScroll(): () => void {
  return () => {
    reactSectionScroller = toModuleNamespace(
      loadReactNamespace(),
      1,
    );
    jsxLazySection = toModuleNamespace(
      loadJsxNamespace(),
      1,
    );
    SECTION_SCROLL_MIN_LEAD_PX = 40;
    SECTION_SCROLL_VIEWPORT_LEAD_RATIO = 0.25;
    SECTION_SCROLL_ANCHOR_HOLD_MS = 1200;
  };
}
