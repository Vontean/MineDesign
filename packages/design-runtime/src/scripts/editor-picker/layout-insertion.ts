import type { Dynamic } from "../../runtime-types";

export const resolveLayoutInsertion: Dynamic = function (
  this: Dynamic,
  targetElement?: Dynamic,
  requestedPlacement?: Dynamic,
  clientX?: Dynamic,
  clientY?: Dynamic,
  ..._unusedArgs: Dynamic[]
): Dynamic {
  const container: Dynamic =
    requestedPlacement === "into" ? targetElement : targetElement.parentElement;
  if (!container || container.getAttribute("data-dc-tpl") == null)
    return {
      el: targetElement,
      position: requestedPlacement,
    };
  const inFlowChildren: Dynamic = [];
  for (let index: Dynamic = 0; index < container.children.length; index++) {
    const child: Dynamic = container.children[index];
    if (!child.getAttribute || child.getAttribute("data-dc-tpl") == null)
      continue;
    const childPosition: Dynamic = getComputedStyle(child).position;
    if (!(childPosition === "absolute" || childPosition === "fixed")) {
      inFlowChildren.push(child);
    }
  }
  if (inFlowChildren.length === 0)
    return {
      el: targetElement,
      position: requestedPlacement,
      slotless: true,
    };
  const containerStyle: Dynamic = getComputedStyle(container);
  const display: Dynamic = containerStyle.display || "";
  const isFlex: Dynamic = display.indexOf("flex") !== -1;
  const isReversed: Dynamic =
    isFlex && containerStyle.flexDirection.indexOf("-reverse") !== -1;
  if (isReversed) {
    inFlowChildren.reverse();
  }
  const getSourcePlacement: Dynamic = (
    visualPlacement?: Dynamic,
    ..._unusedPlacementArgs: Dynamic[]
  ): Dynamic => (isReversed ? (visualPlacement === "before" ? "after" : "before") : visualPlacement);
  if (display.indexOf("grid") !== -1) {
    let closestChild: Dynamic = inFlowChildren[0];
    let nearestDistanceSquared: Dynamic = 1 / 0;
    for (let index: Dynamic = 0; index < inFlowChildren.length; index++) {
      const childBounds: Dynamic = inFlowChildren[index].getBoundingClientRect();
      const deltaX: Dynamic = clientX - (childBounds.left + childBounds.right) / 2;
      const deltaY: Dynamic = clientY - (childBounds.top + childBounds.bottom) / 2;
      const distanceSquared: Dynamic = deltaX * deltaX + deltaY * deltaY;
      if (distanceSquared < nearestDistanceSquared) {
        nearestDistanceSquared = distanceSquared;
        closestChild = inFlowChildren[index];
      }
    }
    const closestBounds: Dynamic = closestChild.getBoundingClientRect();
    const insertBefore: Dynamic =
      clientY < closestBounds.top || (clientY <= closestBounds.bottom && clientX < (closestBounds.left + closestBounds.right) / 2);
    return {
      el: closestChild,
      position: insertBefore ? "before" : "after",
    };
  }
  const isHorizontal: Dynamic =
    (isFlex && containerStyle.flexDirection.indexOf("row") === 0) ||
    display === "table-row" ||
    container.tagName.toLowerCase() === "tr";
  for (let index: Dynamic = 0; index < inFlowChildren.length; index++) {
    const childBounds: Dynamic = inFlowChildren[index].getBoundingClientRect();
    const midpoint: Dynamic = isHorizontal
      ? (childBounds.left + childBounds.right) / 2
      : (childBounds.top + childBounds.bottom) / 2;
    if ((isHorizontal ? clientX : clientY) < midpoint)
      return {
        el: inFlowChildren[index],
        position: getSourcePlacement("before"),
      };
  }
  return {
    el: inFlowChildren[inFlowChildren.length - 1],
    position: getSourcePlacement("after"),
  };
};
export const fillsReferenceBounds: Dynamic = function (
  this: Dynamic,
  candidate?: Dynamic,
  referenceElement?: Dynamic,
  ..._unusedArgs: Dynamic[]
): Dynamic {
  if (!candidate) return false;
  if (candidate === referenceElement) return true;
  const candidateBounds: Dynamic = candidate.getBoundingClientRect();
  const referenceBounds: Dynamic = referenceElement.getBoundingClientRect();
  return candidateBounds.width >= referenceBounds.width * 0.9 && candidateBounds.height >= referenceBounds.height * 0.9;
};
export const clampPointToNearestBounds: Dynamic = function (
  this: Dynamic,
  x?: Dynamic,
  y?: Dynamic,
  candidates?: Dynamic,
  ..._unusedArgs: Dynamic[]
): Dynamic {
  let closestBounds: Dynamic = null;
  let nearestDistanceSquared: Dynamic = 1 / 0;
  for (let index: Dynamic = 0; index < candidates.length; index++) {
    const bounds: Dynamic = candidates[index];
    if (bounds.right - bounds.left < 8 || bounds.bottom - bounds.top < 8) continue;
    const deltaX: Dynamic = Math.max(
      bounds.left - x,
      0,
      x - bounds.right,
    );
    const deltaY: Dynamic = Math.max(
      bounds.top - y,
      0,
      y - bounds.bottom,
    );
    const distanceSquared: Dynamic = deltaX * deltaX + deltaY * deltaY;
    if (distanceSquared < nearestDistanceSquared) {
      nearestDistanceSquared = distanceSquared;
      closestBounds = bounds;
    }
  }
  return closestBounds
    ? {
        x: Math.min(Math.max(x, closestBounds.left + 2), closestBounds.right - 2),
        y: Math.min(Math.max(y, closestBounds.top + 2), closestBounds.bottom - 2),
      }
    : null;
};
export const remapPointBetweenBounds: Dynamic = function (
  this: Dynamic,
  x?: Dynamic,
  y?: Dynamic,
  sourceBounds?: Dynamic,
  targetBounds?: Dynamic,
  ..._unusedArgs: Dynamic[]
): Dynamic {
  const sourceWidth: Dynamic = sourceBounds.right - sourceBounds.left;
  const sourceHeight: Dynamic = sourceBounds.bottom - sourceBounds.top;
  const targetWidth: Dynamic = targetBounds.right - targetBounds.left;
  const targetHeight: Dynamic = targetBounds.bottom - targetBounds.top;
  if (sourceWidth < 4 || sourceHeight < 4 || targetWidth < 8 || targetHeight < 8) return null;
  const xFraction: Dynamic = Math.min(
    Math.max((x - sourceBounds.left) / sourceWidth, 0),
    1,
  );
  const yFraction: Dynamic = Math.min(
    Math.max((y - sourceBounds.top) / sourceHeight, 0),
    1,
  );
  return {
    x: Math.min(
      Math.max(targetBounds.left + xFraction * targetWidth, targetBounds.left + 2),
      targetBounds.right - 2,
    ),
    y: Math.min(
      Math.max(targetBounds.top + yFraction * targetHeight, targetBounds.top + 2),
      targetBounds.bottom - 2,
    ),
  };
};

export const isEmptyLayoutWrapper: Dynamic = function (
  this: Dynamic,
  element?: Dynamic,
  isTextTag?: Dynamic,
  ..._unusedArgs: Dynamic[]
): Dynamic {
  const normalizeTagName: Dynamic = (
    candidate?: Dynamic,
    ..._unusedNormalizeArgs: Dynamic[]
  ): Dynamic => {
    const tagName: Dynamic = (candidate.localName || candidate.tagName || "").toLowerCase();
    return tagName.indexOf("sc-raw-") === 0 ? tagName.slice(7) : tagName;
  };
  const isAtomicElement: Dynamic = (
    candidate?: Dynamic,
    ..._unusedPredicateArgs: Dynamic[]
  ): Dynamic => {
    const tagName: Dynamic = normalizeTagName(candidate);
    return (
      /^(svg|img|video|audio|canvas|picture|iframe|object|embed|input|textarea|select|button|hr|dc-import|x-import)$/.test(
        tagName,
      ) ||
      tagName.indexOf("-") > 0 ||
      candidate.hasAttribute("data-sc-name") ||
      !!(candidate.classList && candidate.classList.contains("sc-host-x"))
    );
  };
  if (
    isAtomicElement(element) ||
    isTextTag(normalizeTagName(element)) ||
    element.querySelector("[data-dc-tpl]")
  )
    return false;
  const descendants: Dynamic = element.querySelectorAll("*");
  for (let index: Dynamic = 0; index < descendants.length; index++)
    if (isAtomicElement(descendants[index])) return false;
  return !(element.textContent || "").trim();
};
export const startsAtViewportEdges: Dynamic = function (
  this: Dynamic,
  bounds?: Dynamic,
  viewportWidth?: Dynamic,
  ..._unusedArgs: Dynamic[]
): Dynamic {
  return (
    bounds.left <= 1 &&
    bounds.top <= 1 &&
    bounds.right >= viewportWidth - 1
  );
};
export const canBreakFromFlow: Dynamic = function (
  this: Dynamic,
  element?: Dynamic,
  style?: Dynamic,
  ..._unusedArgs: Dynamic[]
): Dynamic {
  return style.position === "absolute" ||
    style.position === "fixed" ||
    /^(LI|TR|TD|TH|THEAD|TBODY|TFOOT)$/i.test(element.tagName)
    ? false
    : !/^table-/.test(style.display) && style.display !== "list-item";
};
export const readInitialWidth: Dynamic = function (
  this: Dynamic,
  style?: Dynamic,
  ..._unusedArgs: Dynamic[]
): Dynamic {
  const width: Dynamic = parseFloat(style.width);
  return width > 0 ? Math.ceil(width * 100) / 100 : 0;
};
export const readEmptyElementHeight: Dynamic = function (
  this: Dynamic,
  element?: Dynamic,
  style?: Dynamic,
  ..._unusedArgs: Dynamic[]
): Dynamic {
  if (
    (element.textContent || "").trim() !== "" ||
    element.matches("img,svg,video,canvas,iframe,picture") ||
    element.querySelector("img,svg,video,canvas,iframe,picture")
  )
    return 0;
  const height: Dynamic = parseFloat(style.height);
  return height > 0 ? Math.ceil(height * 100) / 100 : 0;
};
export const getDropStyleReset: Dynamic = function (
  this: Dynamic,
  style?: Dynamic,
  containerDisplay?: Dynamic,
  ..._unusedArgs: Dynamic[]
): Dynamic {
  const resetProperties: Dynamic = {
    margin: "0px",
  };
  const gridLines: Dynamic = [
    style.gridRowStart,
    style.gridRowEnd,
    style.gridColumnStart,
    style.gridColumnEnd,
  ];
  if (
    /grid/.test(containerDisplay) ||
    gridLines.some(
      (gridLine?: Dynamic, ..._unusedPredicateArgs: Dynamic[]): Dynamic =>
        !!gridLine && gridLine !== "auto",
    )
  ) {
    resetProperties["grid-area"] = "auto";
  }
  return resetProperties;
};
