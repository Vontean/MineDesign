import type { Dynamic } from "../../runtime-types";

export const readSvgLineGeometry: Dynamic = function (
  this: Dynamic,
  svg?: Dynamic,
  ..._unusedArgs: Dynamic[]
): Dynamic {
  const ignoredTags: Dynamic = {
    defs: 1,
    title: 1,
    desc: 1,
    metadata: 1,
    style: 1,
    script: 1,
  };
  let lineElement: Dynamic = null;
  for (let index: Dynamic = 0; index < svg.children.length; index++) {
    const child: Dynamic = svg.children[index];
    if (ignoredTags[(child.tagName || "").toLowerCase()] !== 1) {
      if (lineElement) return null;
      lineElement = child;
    }
  }
  if (
    !lineElement ||
    lineElement.hasAttribute("transform") ||
    /transform\s*:/.test(lineElement.getAttribute("style") || "")
  )
    return null;
  const tagName: Dynamic = (lineElement.tagName || "").toLowerCase();
  const parseCoordinate: Dynamic = (
    attribute?: Dynamic,
    ..._unusedParseArgs: Dynamic[]
  ): Dynamic => {
    if (attribute == null) return 0;
    const coordinateText: Dynamic = attribute.trim();
    return /^[-+]?(?:\d+\.?\d*|\.\d+)(?:[eE][-+]?\d+)?(?:px)?$/.test(coordinateText)
      ? parseFloat(coordinateText)
      : null;
  };
  const createGeometry: Dynamic = (
    startX?: Dynamic,
    startY?: Dynamic,
    endX?: Dynamic,
    endY?: Dynamic,
    isLegacyArrow?: Dynamic,
    ..._unusedGeometryArgs: Dynamic[]
  ): Dynamic => ({
    shaft: lineElement,
    tag: tagName,
    sx: startX,
    sy: startY,
    ex: endX,
    ey: endY,
    legacy: isLegacyArrow,
  });
  if (tagName === "line") {
    const lineStartX: Dynamic = parseCoordinate(lineElement.getAttribute("x1"));
    const lineStartY: Dynamic = parseCoordinate(lineElement.getAttribute("y1"));
    const lineEndX: Dynamic = parseCoordinate(lineElement.getAttribute("x2"));
    const lineEndY: Dynamic = parseCoordinate(lineElement.getAttribute("y2"));
    return lineStartX == null || lineStartY == null || lineEndX == null || lineEndY == null
      ? null
      : createGeometry(lineStartX, lineStartY, lineEndX, lineEndY, false);
  }
  if (tagName === "polyline") {
    const coordinates: Dynamic = (lineElement.getAttribute("points") || "")
      .trim()
      .split(/[\s,]+/)
      .filter(
        (token?: Dynamic, ..._unusedFilterArgs: Dynamic[]): Dynamic =>
          token !== "",
      )
      .map(parseCoordinate);
    return coordinates.length !== 4 ||
      coordinates.some(
        (coordinate?: Dynamic, ..._unusedPredicateArgs: Dynamic[]): Dynamic =>
          coordinate == null,
      )
      ? null
      : createGeometry(coordinates[0], coordinates[1], coordinates[2], coordinates[3], false);
  }
  if (tagName !== "path") return null;
  const pathData: Dynamic = lineElement.getAttribute("d") || "";
  const pathTokens: Dynamic =
    pathData.match(/[a-zA-Z]|[-+]?(?:\d+\.?\d*|\.\d+)(?:[eE][-+]?\d+)?/g) || [];
  if (pathTokens.join("").length !== pathData.replace(/[\s,]/g, "").length) return null;
  const isCoordinateToken: Dynamic = (
    token?: Dynamic,
    ..._unusedPredicateArgs: Dynamic[]
  ): Dynamic => token != null && /^[-+.\d]/.test(token);
  if (
    pathTokens.length === 15 &&
    pathTokens[0] === "M" &&
    pathTokens[3] === "L" &&
    pathTokens[6] === "M" &&
    pathTokens[9] === "L" &&
    pathTokens[12] === "L" &&
    [1, 2, 4, 5, 7, 8, 10, 11, 13, 14].every(
      (tokenIndex?: Dynamic, ..._unusedPredicateArgs: Dynamic[]): Dynamic =>
        isCoordinateToken(pathTokens[tokenIndex]),
    )
  )
    return (svg.getAttribute("preserveAspectRatio") ||
      svg.getAttribute("sc-camel-preserve-aspect-ratio")) === "none" &&
      /(^|;)\s*fill:\s*none/.test(svg.getAttribute("style") || "")
      ? createGeometry(+pathTokens[1], +pathTokens[2], +pathTokens[4], +pathTokens[5], true)
      : null;
  if (
    pathTokens.length < 5 ||
    (pathTokens[0] !== "M" && pathTokens[0] !== "m") ||
    !isCoordinateToken(pathTokens[1]) ||
    !isCoordinateToken(pathTokens[2])
  )
    return null;
  const pathStartX: Dynamic = +pathTokens[1];
  const pathStartY: Dynamic = +pathTokens[2];
  const pathCommand: Dynamic = pathTokens[3];
  const isRelative: Dynamic = pathCommand === pathCommand.toLowerCase();
  let pathEndX: Dynamic;
  let pathEndY: Dynamic;
  let expectedTokens: Dynamic;
  if (isCoordinateToken(pathCommand)) {
    if (!isCoordinateToken(pathTokens[4])) return null;
    pathEndX = +pathCommand;
    pathEndY = +pathTokens[4];
    expectedTokens = 5;
    if (pathTokens[0] === "m") {
      pathEndX += pathStartX;
      pathEndY += pathStartY;
    }
  } else if (pathCommand === "L" || pathCommand === "l") {
    if (!isCoordinateToken(pathTokens[4]) || !isCoordinateToken(pathTokens[5])) return null;
    pathEndX = +pathTokens[4];
    pathEndY = +pathTokens[5];
    expectedTokens = 6;
    if (isRelative) {
      pathEndX += pathStartX;
      pathEndY += pathStartY;
    }
  } else if (pathCommand === "H" || pathCommand === "h") {
    if (!isCoordinateToken(pathTokens[4])) return null;
    pathEndX = +pathTokens[4] + (isRelative ? pathStartX : 0);
    pathEndY = pathStartY;
    expectedTokens = 5;
  } else if (pathCommand === "V" || pathCommand === "v") {
    if (!isCoordinateToken(pathTokens[4])) return null;
    pathEndX = pathStartX;
    pathEndY = +pathTokens[4] + (isRelative ? pathStartY : 0);
    expectedTokens = 5;
  } else return null;
  return pathTokens.length === expectedTokens ? createGeometry(pathStartX, pathStartY, pathEndX, pathEndY, false) : null;
};
export const measureSvgMarkerOverhang: Dynamic = function (
  this: Dynamic,
  svg?: Dynamic,
  lineElement?: Dynamic,
  endpoint: Dynamic = "end",
  ..._unusedArgs: Dynamic[]
): Dynamic {
  const markerReference: Dynamic = /^\s*url\(\s*["']?#([^"')\s]+)["']?\s*\)\s*$/.exec(
    lineElement.getAttribute("marker-" + endpoint) || "",
  );
  if (!markerReference) return 0;
  const markers: Dynamic = svg.getElementsByTagName("marker");
  let marker: Dynamic = null;
  for (let index: Dynamic = 0; index < markers.length; index++)
    if (markers[index].getAttribute("id") === markerReference[1]) {
      marker = markers[index];
      break;
    }
  if (!marker) return 0;
  const readMarkerAttribute: Dynamic = (
    attribute?: Dynamic,
    ..._unusedAttributeArgs: Dynamic[]
  ): Dynamic =>
    marker.getAttribute(attribute) ??
    marker.getAttribute(
      "sc-camel-" +
        attribute.replace(
          /[A-Z]/g,
          (capital?: Dynamic, ..._unusedReplaceArgs: Dynamic[]): Dynamic =>
            "-" + capital.toLowerCase(),
        ),
    );
  const orientation: Dynamic = marker.getAttribute("orient") || "";
  if (
    readMarkerAttribute("viewBox") != null ||
    (readMarkerAttribute("markerUnits") ?? "strokeWidth") !== "strokeWidth" ||
    !(endpoint === "start"
      ? orientation === "auto-start-reverse"
      : /^auto/.test(orientation))
  )
    return 0;
  const markerPath: Dynamic = marker.getElementsByTagName("path")[0];
  const pathData: Dynamic = (markerPath && markerPath.getAttribute("d")) || "";
  if (
    !markerPath ||
    markerPath.hasAttribute("transform") ||
    !/^[MLZz\d\s,.+-]+$/.test(pathData)
  )
    return 0;
  const coordinates: Dynamic = pathData.match(/[-+]?(?:\d+\.?\d*|\.\d+)/g) || [];
  let rightmost: Dynamic = -1 / 0;
  for (let index: Dynamic = 0; index + 1 < coordinates.length; index += 2)
    rightmost = Math.max(rightmost, parseFloat(coordinates[index]));
  if (
    marker.getAttribute("overflow") !== "visible" &&
    !/(^|;)\s*overflow\s*:\s*visible/.test(marker.getAttribute("style") || "")
  ) {
    rightmost = Math.min(rightmost, parseFloat(readMarkerAttribute("markerWidth") || "3") || 0);
  }
  const overhang: Dynamic = rightmost - parseFloat(readMarkerAttribute("refX") || "0");
  return overhang > 0 && overhang < 64 ? overhang : 0;
};
export const shortenLineEndpoint: Dynamic = function (
  this: Dynamic,
  startX?: Dynamic,
  startY?: Dynamic,
  endX?: Dynamic,
  endY?: Dynamic,
  inset?: Dynamic,
  ..._unusedArgs: Dynamic[]
): Dynamic {
  const length: Dynamic = Math.hypot(endX - startX, endY - startY);
  if (!(length > 0) || !(inset > 0))
    return {
      x: endX,
      y: endY,
    };
  const remainingFraction: Dynamic = Math.max(length - inset, Math.min(length, 0.5)) / length;
  const roundCoordinate: Dynamic = (
    coordinate?: Dynamic,
    ..._unusedRoundArgs: Dynamic[]
  ): Dynamic => Math.round(coordinate * 100) / 100;
  return {
    x: roundCoordinate(startX + (endX - startX) * remainingFraction),
    y: roundCoordinate(startY + (endY - startY) * remainingFraction),
  };
};
export const extendLineEndpoint: Dynamic = function (
  this: Dynamic,
  geometry?: Dynamic,
  extension?: Dynamic,
  ..._unusedArgs: Dynamic[]
): Dynamic {
  const length: Dynamic = Math.hypot(
    geometry.ex - geometry.sx,
    geometry.ey - geometry.sy,
  );
  return length > 0 && extension > 0
    ? {
        x: geometry.ex + ((geometry.ex - geometry.sx) * extension) / length,
        y: geometry.ey + ((geometry.ey - geometry.sy) * extension) / length,
      }
    : {
        x: geometry.ex,
        y: geometry.ey,
      };
};
export const resolveSelectedSvgElement: Dynamic = function (
  this: Dynamic,
  element?: Dynamic,
  groupMembers?: Dynamic,
  getOuterSvgElement?: Dynamic,
  getEditableGeometry?: Dynamic,
  ..._unusedArgs: Dynamic[]
): Dynamic {
  const svg: Dynamic = getOuterSvgElement(element);
  if (svg === element) return element;
  for (let index: Dynamic = 0; groupMembers && index < groupMembers.length; index++)
    if (groupMembers[index].el === svg) return groupMembers[index].sep ? svg : element;
  return getEditableGeometry(svg) ? svg : element;
};
export const expandBoundsForLineMarkers: Dynamic = function (
  this: Dynamic,
  geometry?: Dynamic,
  svgBounds?: Dynamic,
  elementBounds?: Dynamic,
  ..._unusedArgs: Dynamic[]
): Dynamic {
  if (!geometry || !(geometry.back > 0 || geometry.startBack > 0))
    return null;
  const markerX: Dynamic =
    svgBounds.left + (geometry.px / geometry.vbW) * svgBounds.width;
  const markerY: Dynamic =
    svgBounds.top + (geometry.py / geometry.vbH) * svgBounds.height;
  const endpointX: Dynamic =
    svgBounds.left + (geometry.tx / geometry.vbW) * svgBounds.width;
  const endpointY: Dynamic =
    svgBounds.top + (geometry.ty / geometry.vbH) * svgBounds.height;
  const hasSameX: Dynamic = geometry.px === geometry.tx;
  const hasSameY: Dynamic = geometry.py === geometry.ty;
  const left: Dynamic = hasSameX ? elementBounds.left : Math.min(markerX, endpointX, elementBounds.left);
  const right: Dynamic = hasSameX
    ? elementBounds.right
    : Math.max(markerX, endpointX, elementBounds.right);
  const top: Dynamic = hasSameY ? elementBounds.top : Math.min(markerY, endpointY, elementBounds.top);
  const bottom: Dynamic = hasSameY
    ? elementBounds.bottom
    : Math.max(markerY, endpointY, elementBounds.bottom);
  return {
    left: left,
    top: top,
    right: right,
    bottom: bottom,
    width: right - left,
    height: bottom - top,
  };
};
export const resizeLineFromEndpoints: Dynamic = function (
  this: Dynamic,
  resizeState?: Dynamic,
  startPoint?: Dynamic,
  endPoint?: Dynamic,
  ..._unusedArgs: Dynamic[]
): Dynamic {
  const viewportLeft: Dynamic = Math.min(startPoint.x, endPoint.x);
  const viewportTop: Dynamic = Math.min(startPoint.y, endPoint.y);
  const unpaddedWidth: Dynamic = Math.abs(endPoint.x - startPoint.x) / resizeState.scl;
  const unpaddedHeight: Dynamic = Math.abs(endPoint.y - startPoint.y) / resizeState.scl;
  const width: Dynamic = Math.max(Math.round(unpaddedWidth), 8);
  const height: Dynamic = Math.max(Math.round(unpaddedHeight), 8);
  const paddingX: Dynamic = (width - unpaddedWidth) / 2;
  const paddingY: Dynamic = (height - unpaddedHeight) / 2;
  const roundCoordinate: Dynamic = (
    coordinate?: Dynamic,
    ..._unusedRoundArgs: Dynamic[]
  ): Dynamic => Math.round(coordinate * 100) / 100;
  let startX: Dynamic = roundCoordinate(paddingX + (startPoint.x - viewportLeft) / resizeState.scl);
  let startY: Dynamic = roundCoordinate(paddingY + (startPoint.y - viewportTop) / resizeState.scl);
  let endX: Dynamic = roundCoordinate(paddingX + (endPoint.x - viewportLeft) / resizeState.scl);
  let endY: Dynamic = roundCoordinate(paddingY + (endPoint.y - viewportTop) / resizeState.scl);
  const endMarkerInset: Dynamic =
    resizeState.back && resizeState.back > 0 ? resizeState.back : 0;
  const startMarkerInset: Dynamic =
    resizeState.startBack && resizeState.startBack > 0 ? resizeState.startBack : 0;
  const lineLength: Dynamic = Math.hypot(endX - startX, endY - startY);
  if (endMarkerInset + startMarkerInset > 0 && lineLength > 0) {
    const minimumLength: Dynamic = Math.min(lineLength, 0.5);
    const allowsFullInsets: Dynamic = lineLength - startMarkerInset - endMarkerInset >= minimumLength;
    const coordinatePrecision: Dynamic = startMarkerInset > 0 && endMarkerInset > 0 ? 1e4 : 100;
    const roundEndpoint: Dynamic = (
      coordinate?: Dynamic,
      ..._unusedRoundArgs: Dynamic[]
    ): Dynamic => Math.round(coordinate * coordinatePrecision) / coordinatePrecision;
    const startDistance: Dynamic = allowsFullInsets
      ? startMarkerInset
      : ((lineLength - minimumLength) * startMarkerInset) / (startMarkerInset + endMarkerInset);
    const endDistance: Dynamic = allowsFullInsets ? lineLength - endMarkerInset : startDistance + minimumLength;
    const originalStartX: Dynamic = startX;
    const originalStartY: Dynamic = startY;
    const directionX: Dynamic = (endX - startX) / lineLength;
    const directionY: Dynamic = (endY - startY) / lineLength;
    if (startMarkerInset > 0) {
      startX = roundEndpoint(originalStartX + directionX * startDistance);
      startY = roundEndpoint(originalStartY + directionY * startDistance);
    }
    endX = roundEndpoint(originalStartX + directionX * endDistance);
    endY = roundEndpoint(originalStartY + directionY * endDistance);
  }
  return {
    left: Math.round(
      resizeState.startLeft +
        (viewportLeft - resizeState.startRect.left) / resizeState.scl -
        paddingX,
    ),
    top: Math.round(
      resizeState.startTop +
        (viewportTop - resizeState.startRect.top) / resizeState.scl -
        paddingY,
    ),
    w: width,
    h: height,
    sx: startX,
    sy: startY,
    ex: endX,
    ey: endY,
    d: "M " + startX + " " + startY + " L " + endX + " " + endY,
  };
};
export const readSvgLineAttributes: Dynamic = function (
  this: Dynamic,
  element?: Dynamic,
  ..._unusedArgs: Dynamic[]
): Dynamic {
  const attributes: Dynamic = {};
  for (const attribute of ((element.tagName || "").toLowerCase() === "line"
    ? ["x1", "y1", "x2", "y2"]
    : ["d", "points"]) as Dynamic)
    attributes[attribute] = element.getAttribute(attribute);
  return attributes;
};
export const writeSvgLineEndpoints: Dynamic = function (
  this: Dynamic,
  element?: Dynamic,
  startX?: Dynamic,
  startY?: Dynamic,
  endX?: Dynamic,
  endY?: Dynamic,
  ..._unusedArgs: Dynamic[]
): Dynamic {
  const tagName: Dynamic = (element.tagName || "").toLowerCase();
  if (tagName === "line") {
    element.setAttribute("x1", String(startX));
    element.setAttribute("y1", String(startY));
    element.setAttribute("x2", String(endX));
    element.setAttribute("y2", String(endY));
  } else {
    if (tagName === "polyline") {
      element.setAttribute(
        "points",
        startX + "," + startY + " " + endX + "," + endY,
      );
    } else {
      element.setAttribute(
        "d",
        "M " + startX + " " + startY + " L " + endX + " " + endY,
      );
    }
  }
};
export const hasOnlyMatchingSvgContent: Dynamic = function (
  this: Dynamic,
  svg?: Dynamic,
  matchesElement?: Dynamic,
  ..._unusedArgs: Dynamic[]
): Dynamic {
  const ignoredTags: Dynamic = {
    defs: 1,
    marker: 1,
    metadata: 1,
    title: 1,
    desc: 1,
    style: 1,
  };
  const matchesChildren: Dynamic = (
    parent?: Dynamic,
    ..._unusedRecursiveArgs: Dynamic[]
  ): Dynamic => {
    for (let index: Dynamic = 0; index < parent.children.length; index++) {
      const child: Dynamic = parent.children[index];
      const tagName: Dynamic = (child.tagName || "").toLowerCase();
      if (
        !(ignoredTags[tagName] === 1 || matchesElement(child)) &&
        !(tagName === "g" && matchesChildren(child))
      )
        return false;
    }
    return true;
  };
  return matchesChildren(svg);
};
export const resolveSingleContentSvg: Dynamic = function (
  this: Dynamic,
  element?: Dynamic,
  svg?: Dynamic,
  hasOnlyMatchingContent?: Dynamic,
  ..._unusedArgs: Dynamic[]
): Dynamic {
  return svg &&
    svg !== element &&
    svg.contains(element) &&
    hasOnlyMatchingContent(
      svg,
      (child?: Dynamic, ..._unusedPredicateArgs: Dynamic[]): Dynamic =>
        child === element,
    )
    ? svg
    : element;
};
