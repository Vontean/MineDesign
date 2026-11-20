/** Restored application module; prepare first, initialize in original order. */
import {
  type Dynamic,
} from "../runtime-types";
import { CanvasPanZoomScrollTop } from "../canvas/pan-zoom";
import { safeRangeClientRect } from "./text-ranges";

var isNontrivialCssTransformValue: Dynamic;
var scrollRevealPixelTolerance: Dynamic;
var rangeVisibleTolerance: Dynamic;
var intervalsDoNotOverlap: Dynamic;
var intervalOverlapLength: Dynamic;
function scrollDeltaToRevealInterval(
  start?: Dynamic,
  end?: Dynamic,
  visibleStart?: Dynamic,
  visibleEnd?: Dynamic,
  padding: Dynamic = 0,
  edges: Dynamic = {
    lo: true,
    hi: true,
  },
): Dynamic {
  if (
    (start >= visibleStart + (edges.lo ? padding : 0) &&
      end <= visibleEnd - (edges.hi ? padding : 0)) ||
    (start < visibleStart && end > visibleEnd)
  )
    return 0;
  if (
    end <= visibleStart ||
    start >= visibleEnd ||
    (padding > 0 && end - start > visibleEnd - visibleStart - 2 * padding)
  )
    return (start + end) / 2 - (visibleStart + visibleEnd) / 2;
  let [items, endOffset]: Dynamic = [
      visibleStart + padding,
      visibleEnd - padding,
    ],
    value: Dynamic = end - start <= endOffset - items;
  return start < items
    ? value
      ? start - items
      : end - endOffset
    : value
      ? end - endOffset
      : start - items;
}
function rangeCanvasRect(range?: Dynamic): Dynamic {
  let value: Dynamic = safeRangeClientRect(range);
  if (value === null) return null;
  let state: Dynamic = {
    x: value.left,
    y: value.top,
    w: value.width,
    h: value.height,
  };
  return [state.x, state.y, state.w, state.h].every(Number.isFinite) &&
    state.w >= 0 &&
    state.h >= 0
    ? state
    : null;
}
function createsFixedContainingBlock(style?: Dynamic): Dynamic {
  return (
    isNontrivialCssTransformValue(style.transform) ||
    isNontrivialCssTransformValue(style.translate) ||
    isNontrivialCssTransformValue(style.rotate) ||
    isNontrivialCssTransformValue(style.scale) ||
    isNontrivialCssTransformValue(style.perspective) ||
    isNontrivialCssTransformValue(style.filter) ||
    /layout|paint|strict|content/.test(style.contain)
  );
}
function composedParentNode(node?: Dynamic): Dynamic {
  let assignedSlot: Dynamic = node.assignedSlot;
  if (assignedSlot) return assignedSlot;
  let parentNode: Dynamic = node.parentNode;
  return parentNode !== null && parentNode.nodeType === 11
    ? (parentNode.host ?? null)
    : parentNode;
}
function elementClientContentRect(element?: Dynamic): Dynamic {
  let bounds: Dynamic = element.getBoundingClientRect(),
    callback: Dynamic = (distance?: Dynamic, size?: Dynamic): Dynamic =>
      size > 0 && distance > 0 ? distance / size : 1,
    value: Dynamic = callback(bounds.width, element.offsetWidth),
    scale: Dynamic = callback(bounds.height, element.offsetHeight);
  return {
    left: bounds.left + element.clientLeft * value,
    top: bounds.top + element.clientTop * scale,
    w: element.clientWidth * value,
    h: element.clientHeight * scale,
    sx: value,
    sy: scale,
  };
}
function describeScrollTransform(transform?: Dynamic): Dynamic {
  let value: Dynamic =
      /^matrix\(([^)]*)\)/.exec(transform)?.[1]?.split(",").map(Number) ?? [],
    [scaleX = 1, skewX = 0, skewY = 0, scaleY = 1]: Dynamic = value;
  return {
    spun: value.length >= 4 && (Math.abs(skewX) > 1e-4 || scaleX < 0),
    even:
      Math.abs(scaleX - scaleY) < 1e-4 && Math.abs(skewX + skewY) < 1e-4,
  };
}
function probeScrollableRangePosition(
  element?: Dynamic,
  range?: Dynamic,
  viewport?: Dynamic,
  tolerance?: Dynamic,
  onScroll?: Dynamic,
  environment?: Dynamic,
): Dynamic {
  let callback: Dynamic = (rect?: Dynamic): Dynamic => ({
      x: rect.x + rect.w / 2,
      y: rect.y + rect.h / 2,
    }),
    value: Dynamic = element.scrollHeight - element.clientHeight,
    scrollTop: Dynamic = element.scrollTop,
    rangeRect: Dynamic = rangeCanvasRect(range);
  if (rangeRect === null || value <= 0) return;
  environment?.(element);
  element.scrollTo({
    top:
      value - scrollTop >= scrollTop
        ? Math.min(value, scrollTop + 40)
        : Math.max(0, scrollTop - 40),
    behavior: "instant",
  });
  let bounds: Dynamic = element.getBoundingClientRect(),
    nextRangeRect: Dynamic = rangeCanvasRect(range),
    scrollDistance: Dynamic = element.scrollTop - scrollTop,
    direction: Dynamic =
      nextRangeRect === null || scrollDistance === 0
        ? null
        : {
            x: (callback(nextRangeRect).x - callback(rangeRect).x) / scrollDistance,
            y: (callback(nextRangeRect).y - callback(rangeRect).y) / scrollDistance,
          },
    directionLength: Dynamic =
      direction === null ? 0 : direction.x * direction.x + direction.y * direction.y;
  if (direction === null || directionLength === 0)
    return void element.scrollTo({
      top: scrollTop,
      behavior: "instant",
    });
  let projectRect: Dynamic = (rect?: Dynamic, scrollDelta?: Dynamic): Dynamic => {
      let center: Dynamic =
          element.clientHeight / 2 +
          scrollDelta +
          ((bounds.left + bounds.width / 2 - callback(rect).x) * direction.x +
            (bounds.top + bounds.height / 2 - callback(rect).y) * direction.y) /
            directionLength,
        halfExtent: Dynamic =
          (rect.w * Math.abs(direction.x) + rect.h * Math.abs(direction.y)) /
          directionLength /
          2;
      return [center - halfExtent, center + halfExtent];
    },
    [startPosition, endPosition]: Dynamic = projectRect(rangeRect, 0),
    startContainer: Dynamic = range.startContainer,
    textRangeRect: Dynamic =
      viewport &&
      startContainer === range.endContainer &&
      startContainer.nodeType === 3 &&
      range.endOffset - range.startOffset > 1
        ? [range.startOffset, range.endOffset - 1].map(
            (offset?: Dynamic): Dynamic => {
              let textRange: Dynamic =
                startContainer.ownerDocument.createRange();
              textRange.setStart(startContainer, offset);
              textRange.setEnd(startContainer, offset + 1);
              return rangeCanvasRect(textRange);
            },
          )
        : [],
    [startRect, endRect]: Dynamic = textRangeRect;
  if (startRect != null && endRect != null && startRect.h > 0 && endRect.h > 0) {
    let [items, viewportRange]: Dynamic = [
      projectRect(startRect, scrollDistance),
      projectRect(endRect, scrollDistance),
    ];
    [startPosition, endPosition] = [
      Math.max(startPosition, Math.min(items[0], viewportRange[0])),
      Math.min(endPosition, Math.max(items[1], viewportRange[1])),
    ];
  }
  let desiredScroll: Dynamic =
    endPosition - startPosition > element.clientHeight
      ? (startPosition + endPosition) / 2 - element.clientHeight / 2
      : scrollDeltaToRevealInterval(
          startPosition,
          endPosition,
          0,
          element.clientHeight,
          tolerance,
          onScroll,
        );
  element.scrollTo({
    top:
      Math.abs(desiredScroll) < scrollRevealPixelTolerance(element)
        ? scrollTop
        : Math.max(0, Math.min(value, scrollTop + desiredScroll)),
    behavior: "instant",
  });
}
function revealTextRange(range?: Dynamic, revealOptions?: Dynamic): Dynamic {
  let startContainer: Dynamic = range.startContainer,
    value: Dynamic =
      startContainer.nodeType === 1
        ? startContainer
        : startContainer.parentElement,
    document: Dynamic = value?.ownerDocument,
    window: Dynamic = document?.defaultView;
  if (!value || !document || !window) return;
  let scrollContainer: Dynamic = document.scrollingElement ?? document.documentElement,
    transform: Dynamic =
      revealOptions.within !== undefined
        ? describeScrollTransform(
            window.getComputedStyle(revealOptions.within).transform,
          )
        : {
            spun: false,
            even: false,
          },
    flag: Dynamic = false,
    crossedViewport: Dynamic = false;
  for (
    let ancestor: Dynamic = value;
    ancestor !== null && ancestor !== scrollContainer && ancestor.nodeType === 1;
    ancestor = ancestor === revealOptions.within ? null : composedParentNode(ancestor)
  ) {
    let element: Dynamic = ancestor,
      style: Dynamic = window.getComputedStyle(element);
    if (
      ((crossedViewport || (flag && style.position === "static")) &&
        !createsFixedContainingBlock(style)) ||
      ((flag = style.position === "absolute"),
      (crossedViewport = style.position === "fixed"),
      style.display === "inline" || style.display === "contents")
    )
      continue;
    let elementRect: Dynamic =
      (element === revealOptions.card ||
        /auto|scroll/.test(
          style.overflow + " " + style.overflowX + " " + style.overflowY,
        )) &&
      (element.scrollHeight > element.clientHeight ||
        element.scrollWidth > element.clientWidth)
        ? rangeCanvasRect(range)
        : null;
    if (elementRect === null) continue;
    let scrollAmount: Dynamic =
        revealOptions.fade !== undefined && revealOptions.fade > 0 ? revealOptions.fade : 0,
      panZoomScroll: Dynamic = CanvasPanZoomScrollTop(element);
    if (transform.spun) {
      probeScrollableRangePosition(
        element,
        range,
        transform.even,
        scrollAmount,
        {
          lo: panZoomScroll.above,
          hi: panZoomScroll.below,
        },
        revealOptions.onScroll,
      );
      continue;
    }
    let contentRect: Dynamic = elementClientContentRect(element),
      scrollTopDelta: Dynamic =
        scrollDeltaToRevealInterval(
          elementRect.y,
          elementRect.y + elementRect.h,
          contentRect.top,
          contentRect.top + contentRect.h,
          scrollAmount * contentRect.sy,
          {
            lo: panZoomScroll.above,
            hi: panZoomScroll.below,
          },
        ) / contentRect.sy,
      scrollLeftDelta: Dynamic =
        scrollDeltaToRevealInterval(
          elementRect.x,
          elementRect.x + elementRect.w,
          contentRect.left,
          contentRect.left + contentRect.w,
        ) / contentRect.sx;
    (scrollAmount > 0
      ? Math.max(Math.abs(scrollLeftDelta), Math.abs(scrollTopDelta)) >=
        scrollRevealPixelTolerance(element)
      : scrollLeftDelta !== 0 || scrollTopDelta !== 0) &&
      (revealOptions.onScroll?.(element),
      element.scrollTo({
        left: element.scrollLeft + scrollLeftDelta,
        top: element.scrollTop + scrollTopDelta,
        behavior: "instant",
      }));
  }
  if (!revealOptions.viewport || crossedViewport) return;
  let rangeRect: Dynamic = rangeCanvasRect(range);
  if (rangeRect === null) return;
  let verticalDelta: Dynamic = scrollDeltaToRevealInterval(
      rangeRect.y,
      rangeRect.y + rangeRect.h,
      0,
      scrollContainer.clientHeight || window.innerHeight,
    ),
    horizontalDelta: Dynamic = scrollDeltaToRevealInterval(
      rangeRect.x,
      rangeRect.x + rangeRect.w,
      0,
      scrollContainer.clientWidth || window.innerWidth,
    );
  (horizontalDelta === 0 && verticalDelta === 0) ||
    (revealOptions.onScroll?.(window),
    window.scrollBy({
      left: horizontalDelta,
      top: verticalDelta,
      behavior: "instant",
    }));
}
function classifyTextRangeVisibility(
  range?: Dynamic,
  visibilityOptions: Dynamic = {},
): Dynamic {
  let value: Dynamic = rangeCanvasRect(range),
    startContainer: Dynamic = range.startContainer,
    document: Dynamic =
      startContainer.nodeType === 1
        ? startContainer
        : startContainer.parentElement,
    window: Dynamic = document?.ownerDocument.defaultView;
  if (value === null || !document || !window || value.w <= 0 || value.h <= 0)
    return "never";
  let scrollingElement: Dynamic =
      document.ownerDocument.scrollingElement ??
      document.ownerDocument.documentElement,
    state: Dynamic = {
      x: window.scrollX,
      y: window.scrollY,
    };
  for (
    let ancestor: Dynamic = document;
    ancestor !== null && ancestor !== scrollingElement && ancestor.nodeType === 1;
    ancestor = composedParentNode(ancestor)
  ) {
    state.x += ancestor.scrollLeft;
    state.y += ancestor.scrollTop;
  }
  if (
    visibilityOptions.within === undefined &&
    (value.x + value.w + state.x <= 0 || value.y + value.h + state.y <= 0)
  )
    return "never";
  let text: Dynamic = "shown",
    flag: Dynamic = false,
    crossedViewport: Dynamic = false;
  for (
    let ancestor: Dynamic = document;
    ancestor !== null && ancestor !== scrollingElement && ancestor.nodeType === 1;
    ancestor = ancestor === visibilityOptions.within ? null : composedParentNode(ancestor)
  ) {
    let element: Dynamic = ancestor,
      style: Dynamic = window.getComputedStyle(element);
    if (
      ((crossedViewport || (flag && style.position === "static")) &&
        !createsFixedContainingBlock(style)) ||
      ((flag = style.position === "absolute"),
      (crossedViewport = style.position === "fixed"),
      style.display === "inline" || style.display === "contents")
    )
      continue;
    let contentRect: Dynamic = elementClientContentRect(element);
    for (let [overflowMode, visibleBefore, visibleAfter, clippedBefore, clippedAfter] of [
      [
        style.overflowX || style.overflow,
        intervalOverlapLength(
          value.x,
          value.x + value.w,
          contentRect.left,
          contentRect.left + contentRect.w,
        ),
        value.w,
        element.clientWidth,
        element.scrollWidth > element.clientWidth,
      ],
      [
        style.overflowY || style.overflow,
        intervalOverlapLength(
          value.y,
          value.y + value.h,
          contentRect.top,
          contentRect.top + contentRect.h,
        ),
        value.h,
        element.clientHeight,
        element.scrollHeight > element.clientHeight,
      ],
    ] as Dynamic)
      if (
        !(
          visibleBefore >= Math.min(rangeVisibleTolerance, visibleAfter) ||
          overflowMode === "visible" ||
          overflowMode === ""
        )
      )
        return !/auto|scroll/.test(overflowMode) ||
          !clippedAfter ||
          clippedBefore < rangeVisibleTolerance
          ? "never"
          : "scroll";
  }
  visibilityOptions.within !== undefined ||
    crossedViewport ||
    ((intervalsDoNotOverlap(
      value.x,
      value.x + value.w,
      0,
      scrollingElement.clientWidth || window.innerWidth,
    ) ||
      intervalsDoNotOverlap(
        value.y,
        value.y + value.h,
        0,
        scrollingElement.clientHeight || window.innerHeight,
      )) &&
      (text = "scroll"));
  return text;
}
export {
  classifyTextRangeVisibility,
  composedParentNode,
  createsFixedContainingBlock,
  describeScrollTransform,
  elementClientContentRect,
  intervalOverlapLength,
  intervalsDoNotOverlap,
  isNontrivialCssTransformValue,
  probeScrollableRangePosition,
  rangeCanvasRect,
  rangeVisibleTolerance,
  revealTextRange,
  scrollDeltaToRevealInterval,
  scrollRevealPixelTolerance,
};
export function installFindScrollReveal(): () => void {
  return () => {
    isNontrivialCssTransformValue = (transformValue?: Dynamic): Dynamic =>
      transformValue !== undefined &&
      transformValue !== "" &&
      transformValue !== "none" &&
      transformValue !== "auto";
    scrollRevealPixelTolerance = (element?: Dynamic): Dynamic =>
      0.625 *
      Math.max(
        1,
        1 / (element.ownerDocument.defaultView?.devicePixelRatio || 1),
      );
    rangeVisibleTolerance = 2;
    intervalsDoNotOverlap = (
      start?: Dynamic,
      end?: Dynamic,
      rangeStart?: Dynamic,
      rangeEnd?: Dynamic,
    ): Dynamic => end <= rangeStart || start >= rangeEnd;
    intervalOverlapLength = (
      start?: Dynamic,
      end?: Dynamic,
      rangeStart?: Dynamic,
      rangeEnd?: Dynamic,
    ): Dynamic => Math.min(end, rangeEnd) - Math.max(start, rangeStart);
  };
}
