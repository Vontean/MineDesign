/** Restored application module; prepare first, initialize in original order. */
import {
  type Dynamic,
} from "../runtime-types";

function captureDomSnapshot(
  getComputedStyle?: Dynamic,
  rootElement?: Dynamic,
  viewportWidth?: Dynamic,
  viewportHeight?: Dynamic,
  captureOptions?: Dynamic,
): Dynamic {
  let state: Dynamic = {
      SCRIPT: 1,
      STYLE: 1,
      NOSCRIPT: 1,
      TEMPLATE: 1,
      IFRAME: 1,
      HEAD: 1,
    },
    count: Dynamic = 4e3,
    maxTextItems: Dynamic = 64,
    maxVisitedElements: Dynamic = 500,
    maxHrefLength: Dynamic = 2048,
    minRectSize: Dynamic = 2,
    text: Dynamic = "http://www.w3.org/1999/xlink",
    skippedAttributes: Dynamic = (captureOptions && captureOptions.skipAttrs) || [],
    bounds: Dynamic = rootElement.getBoundingClientRect(),
    rootWidth: Dynamic = rootElement.offsetWidth || 0,
    rootHeight: Dynamic = rootElement.offsetHeight || 0,
    scaleFactor: Dynamic =
      rootWidth > 0 && bounds.width > 0 ? bounds.width / rootWidth : 1,
    contentWidth: Dynamic = viewportWidth || rootWidth || bounds.width / scaleFactor,
    contentHeight: Dynamic = viewportHeight || rootHeight || bounds.height / scaleFactor,
    topOffset: Dynamic = bounds.top - ((captureOptions && captureOptions.dy) || 0) * scaleFactor,
    items: Dynamic = [],
    flag: Dynamic = false,
    callback: Dynamic = (getParentElement?: Dynamic): Dynamic => {
      if (getParentElement.parentElement) return getParentElement.parentElement;
      let parentNode: Dynamic = getParentElement.parentNode;
      return (
        (parentNode !== null &&
          parentNode.nodeType === 11 &&
          parentNode.host) ||
        null
      );
    },
    isIgnoredElement: Dynamic = (element?: Dynamic): Dynamic => {
      if (state[element.tagName.toUpperCase()] === 1) return true;
      for (let index: Dynamic = 0; index < skippedAttributes.length; index++)
        if (element.hasAttribute(skippedAttributes[index])) return true;
      return false;
    },
    entries: Dynamic = new Map(),
    hasTransparentAncestor: Dynamic = (element?: Dynamic): Dynamic => {
      let entry: Dynamic = entries.get(element);
      if (entry !== undefined) return entry;
      let parentElement: Dynamic = element === rootElement ? null : callback(element),
        isTransparent: Dynamic =
          parseFloat(getComputedStyle(element).opacity) <= 0 ||
          (parentElement !== null && hasTransparentAncestor(parentElement));
      entries.set(element, isTransparent);
      return isTransparent;
    },
    visibilityCache: Dynamic = new Map(),
    hasHiddenAncestor: Dynamic = (element?: Dynamic): Dynamic => {
      let entry: Dynamic = visibilityCache.get(element);
      if (entry !== undefined) return entry;
      let style: Dynamic = element.style,
        visibility: Dynamic = style ? style.visibility : "",
        parentElement: Dynamic = element === rootElement ? null : callback(element),
        isHidden: Dynamic =
          visibility === "hidden" ||
          visibility === "collapse" ||
          (visibility !== "visible" && parentElement !== null && hasHiddenAncestor(parentElement));
      visibilityCache.set(element, isHidden);
      return isHidden;
    },
    isDisplayHidden: Dynamic = (element?: Dynamic): Dynamic => {
      let display: Dynamic = getComputedStyle(element).display;
      return display === "contents" ||
        typeof element.checkVisibility != "function"
        ? display === "none"
        : !element.checkVisibility();
    },
    isInlineHidden: Dynamic = (element?: Dynamic): Dynamic =>
      captureOptions && captureOptions.inlineVisibility
        ? hasHiddenAncestor(element)
        : /^(hidden|collapse)$/.test(getComputedStyle(element).visibility),
    findContainingBlock: Dynamic = (element?: Dynamic): Dynamic => {
      let position: Dynamic = getComputedStyle(element).position,
        parentElement: Dynamic = callback(element);
      if (position !== "absolute" && position !== "fixed") return parentElement;
      let isDefaultTransformValue: Dynamic = (styleValue?: Dynamic): Dynamic =>
        styleValue === undefined ||
        styleValue === "" ||
        styleValue === "none" ||
        styleValue === "normal" ||
        styleValue === "auto";
      for (; parentElement !== null && parentElement !== rootElement; ) {
        let parentStyle: Dynamic = getComputedStyle(parentElement);
        if (
          (position === "absolute" && parentStyle.position !== "static") ||
          !isDefaultTransformValue(parentStyle.transform) ||
          !isDefaultTransformValue(parentStyle.translate) ||
          !isDefaultTransformValue(parentStyle.rotate) ||
          !isDefaultTransformValue(parentStyle.scale) ||
          !isDefaultTransformValue(parentStyle.perspective) ||
          !isDefaultTransformValue(parentStyle.filter) ||
          !isDefaultTransformValue(parentStyle.backdropFilter) ||
          !isDefaultTransformValue(parentStyle.contain) ||
          /transform|perspective|filter|translate|rotate|scale|contain/.test(
            parentStyle.willChange || "",
          )
        )
          return parentElement;
        parentElement = callback(parentElement);
      }
      return position === "fixed" ? null : parentElement;
    },
    clippingCache: Dynamic = new Map(),
    getClippingRect: Dynamic = (element?: Dynamic): Dynamic => {
      if (element === rootElement) return null;
      if (clippingCache.has(element)) return clippingCache.get(element);
      let containingBlock: Dynamic = findContainingBlock(element),
        ancestorClip: Dynamic = containingBlock !== null ? getClippingRect(containingBlock) : null;
      if (containingBlock !== null && containingBlock !== rootElement) {
        let containingStyle: Dynamic = getComputedStyle(containingBlock),
          clipsHorizontally: Dynamic = /^(hidden|clip|scroll|auto)$/.test(
            containingStyle.overflowX,
          ),
          clipsVertically: Dynamic = /^(hidden|clip|scroll|auto)$/.test(
            containingStyle.overflowY,
          );
        if (clipsHorizontally || clipsVertically) {
          let containerBounds: Dynamic = containingBlock.getBoundingClientRect(),
            containerClip: Dynamic = {
              l: clipsHorizontally
                ? containerBounds.left + (parseFloat(containingStyle.borderLeftWidth) || 0)
                : -1 / 0,
              t: clipsVertically
                ? containerBounds.top + (parseFloat(containingStyle.borderTopWidth) || 0)
                : -1 / 0,
              r: clipsHorizontally
                ? containerBounds.right - (parseFloat(containingStyle.borderRightWidth) || 0)
                : 1 / 0,
              b: clipsVertically
                ? containerBounds.bottom -
                  (parseFloat(containingStyle.borderBottomWidth) || 0)
                : 1 / 0,
            };
          ancestorClip =
            ancestorClip === null
              ? containerClip
              : {
                  l: Math.max(ancestorClip.l, containerClip.l),
                  t: Math.max(ancestorClip.t, containerClip.t),
                  r: Math.min(ancestorClip.r, containerClip.r),
                  b: Math.min(ancestorClip.b, containerClip.b),
                };
        }
      }
      clippingCache.set(element, ancestorClip);
      return ancestorClip;
    },
    getChildNodes: Dynamic = (element?: Dynamic): Dynamic => {
      if (element.shadowRoot) return element.shadowRoot.childNodes;
      if (element.tagName.toUpperCase() === "SLOT") {
        let assignedNodes: Dynamic = element.assignedNodes({
          flatten: true,
        });
        if (assignedNodes.length) return assignedNodes;
      }
      return element.childNodes;
    },
    collectRectangles: Dynamic = (rootElementForRects?: Dynamic, anchorId?: Dynamic): Dynamic => {
      let rectangles: Dynamic = [],
        index: Dynamic = 0,
        collectElementRectangles: Dynamic = (element?: Dynamic): Dynamic => {
          if (++index > maxVisitedElements || hasTransparentAncestor(element) || isDisplayHidden(element))
            return;
          let clipRect: Dynamic = getClippingRect(element),
            clientRects: Dynamic = isInlineHidden(element)
              ? []
              : element.getClientRects();
          for (let rectIndex: Dynamic = 0; rectIndex < clientRects.length; rectIndex++) {
            let clientRect: Dynamic = clientRects[rectIndex],
              left: Dynamic = clientRect.left,
              top: Dynamic = clientRect.top,
              right: Dynamic = clientRect.right,
              bottom: Dynamic = clientRect.bottom;
            clipRect !== null &&
              ((left = Math.max(left, clipRect.l)),
              (top = Math.max(top, clipRect.t)),
              (right = Math.min(right, clipRect.r)),
              (bottom = Math.min(bottom, clipRect.b)));
            let normalizedRect: Dynamic = {
              l: Math.max(0, (left - bounds.left) / scaleFactor),
              t: Math.max(0, (top - topOffset) / scaleFactor),
              r: Math.min(contentWidth, (right - bounds.left) / scaleFactor),
              b: Math.min(contentHeight, (bottom - topOffset) / scaleFactor),
            };
            normalizedRect.r - normalizedRect.l >= minRectSize &&
              normalizedRect.b - normalizedRect.t >= minRectSize &&
              rectangles.push(normalizedRect);
          }
          let childNodes: Dynamic = getChildNodes(element);
          for (let childIndex: Dynamic = 0; childIndex < childNodes.length; childIndex++) {
            let childNode: Dynamic = childNodes[childIndex];
            childNode &&
              childNode.nodeType === 1 &&
              !isIgnoredElement(childNode) &&
              collectElementRectangles(childNode);
          }
        };
      collectElementRectangles(rootElementForRects);
      rectangles.sort(
        (rectA?: Dynamic, rectB?: Dynamic): Dynamic =>
          (rectB.r - rectB.l) * (rectB.b - rectB.t) -
          (rectA.r - rectA.l) * (rectA.b - rectA.t),
      );
      let candidateRects: Dynamic = [];
      for (let candidateRect of rectangles as Dynamic) {
        if (candidateRects.length >= maxTextItems) break;
        let isContained: Dynamic = false;
        for (let acceptedRect of candidateRects as Dynamic)
          if (
            candidateRect.l >= acceptedRect.l - 0.5 &&
            candidateRect.t >= acceptedRect.t - 0.5 &&
            candidateRect.r <= acceptedRect.r + 0.5 &&
            candidateRect.b <= acceptedRect.b + 0.5
          ) {
            isContained = true;
            break;
          }
        isContained || candidateRects.push(candidateRect);
      }
      candidateRects.sort(
        (rectA?: Dynamic, rectB?: Dynamic): Dynamic =>
          rectA.t - rectB.t || rectA.l - rectB.l,
      );
      let mergedLines: Dynamic = [];
      for (let lineRect of candidateRects as Dynamic) {
        let previousLine: Dynamic = mergedLines[mergedLines.length - 1];
        previousLine &&
        Math.abs(previousLine.t - lineRect.t) < 1 &&
        Math.abs(previousLine.b - lineRect.b) < 1 &&
        lineRect.l <= previousLine.r + 1 &&
        lineRect.r >= previousLine.l - 1
          ? ((previousLine.l = Math.min(previousLine.l, lineRect.l)),
            (previousLine.t = Math.min(previousLine.t, lineRect.t)),
            (previousLine.r = Math.max(previousLine.r, lineRect.r)),
            (previousLine.b = Math.max(previousLine.b, lineRect.b)))
          : mergedLines.push(lineRect);
      }
      let anchor: Dynamic =
        mergedLines.length > 0 && items.length < count && captureOptions && captureOptions.anchorId
          ? captureOptions.anchorId(rootElementForRects)
          : undefined;
      for (let line of mergedLines as Dynamic) {
        if (items.length >= count) {
          flag = true;
          return;
        }
        items.push(
          anchor === undefined
            ? {
                u: anchorId,
                x: line.l,
                y: line.t,
                w: line.r - line.l,
                h: line.b - line.t,
              }
            : {
                u: anchorId,
                x: line.l,
                y: line.t,
                w: line.r - line.l,
                h: line.b - line.t,
                a: anchor,
              },
        );
      }
    },
    collectLinks: Dynamic = (element?: Dynamic): Dynamic => {
      if (
        flag ||
        isIgnoredElement(element) ||
        (element !== rootElement && isDisplayHidden(element))
      )
        return;
      if (element.localName.toLowerCase() === "a") {
        let href: Dynamic =
            captureOptions && captureOptions.hrefOf
              ? captureOptions.hrefOf(element)
              : element.getAttribute("href") ||
                element.getAttributeNS(text, "href"),
          normalizedHref: Dynamic = typeof href == "string" ? href.trim() : "";
        if (
          normalizedHref !== "" &&
          normalizedHref.length <= maxHrefLength &&
          /^(?:https?:\/\/|mailto:)/i.test(normalizedHref)
        ) {
          collectRectangles(element, normalizedHref);
          return;
        }
      }
      let childNodes: Dynamic = getChildNodes(element);
      for (let index: Dynamic = 0; index < childNodes.length; index++) {
        let childNode: Dynamic = childNodes[index];
        childNode && childNode.nodeType === 1 && collectLinks(childNode);
      }
    };
  collectLinks(rootElement);
  return {
    links: items,
    truncated: flag,
  };
}
export {
  captureDomSnapshot,
};
export function installExportDomSnapshot(): () => void {
  return () => {};
}
