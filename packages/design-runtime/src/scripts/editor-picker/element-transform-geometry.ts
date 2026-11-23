import type { Dynamic } from "../../runtime-types";

export function composedParent(
  this: Dynamic,
  element?: Dynamic,
  ..._unusedArgs: Dynamic[]
): Dynamic {
  return (
    element.assignedSlot ||
    element.parentElement ||
    (element.parentNode && element.parentNode.host) ||
    null
  );
}
const angleUnitToDegrees: Dynamic = {
  "": 1,
  deg: 1,
  rad: 180 / Math.PI,
  turn: 360,
  grad: 0.9,
};
const transformFunctionOrder: Dynamic = {
  translate: 0,
  translatex: 0,
  translatey: 0,
  rotate: 1,
  scale: 2,
  scalex: 2,
  scaley: 2,
};
const transformFunctionFields: Dynamic = {
  translate: ["x", "y"],
  translatex: ["x"],
  translatey: ["y"],
  rotate: ["r"],
  scale: ["sx", "sy"],
  scalex: ["sx"],
  scaley: ["sy"],
};
export function parseTransformFunctions(
  this: Dynamic,
  transform?: Dynamic,
  ..._unusedArgs: Dynamic[]
): Dynamic {
  transform = String(transform || "").trim();
  var parsedTransform: Dynamic = {
    x: "0px",
    y: "0px",
    deg: 0,
    sx: 1,
    sy: 1,
  };
  if (!transform || transform === "none") return parsedTransform;
  if (/\{\{|var\(/.test(transform)) return null;
  var functionPattern: Dynamic = /([a-zA-Z]+)\(([^)]*)\)/g;
  var argumentPattern: Dynamic = /^(-?\d*\.?\d+)([a-z%]*)$/i;
  if (transform.replace(functionPattern, "").trim() !== "") return null;
  for (
    var functionMatch: Dynamic, seenFields: Dynamic = {}, previousOrder: Dynamic = 0;
    (functionMatch = functionPattern.exec(transform));

  ) {
    var functionName: Dynamic = functionMatch[1].toLowerCase();
    var argumentsList: Dynamic = functionMatch[2].split(",");
    if (
      !(Object as Dynamic).prototype.hasOwnProperty.call(transformFunctionOrder, functionName) ||
      transformFunctionOrder[functionName] < previousOrder
    )
      return null;
    for (
      var fields: Dynamic = transformFunctionFields[functionName], fieldIndex: Dynamic = 0;
      fieldIndex < fields.length;
      fieldIndex++
    ) {
      if (seenFields[fields[fieldIndex]]) return null;
      seenFields[fields[fieldIndex]] = 1;
    }
    if (argumentsList.length > fields.length) return null;
    previousOrder = transformFunctionOrder[functionName];
    var firstArgument: Dynamic = argumentPattern.exec(argumentsList[0].trim());
    var secondArgument: Dynamic = argumentsList.length > 1 ? argumentPattern.exec(argumentsList[1].trim()) : null;
    if (!firstArgument) return null;
    var hasMissingUnit: Dynamic = function (
      this: Dynamic,
      argument?: Dynamic,
      ..._unusedNestedArgs: Dynamic[]
    ): Dynamic {
      return !!argument && !argument[2] && parseFloat(argument[1]) !== 0;
    };
    if (transformFunctionOrder[functionName] < 2 && (hasMissingUnit(firstArgument) || hasMissingUnit(secondArgument))) return null;
    var firstLength: Dynamic = firstArgument[1] + (firstArgument[2] || "px");
    var secondLength: Dynamic = secondArgument ? secondArgument[1] + (secondArgument[2] || "px") : null;
    if (functionName === "translate") {
      if (argumentsList.length > 1 && !secondArgument) return null;
      parsedTransform.x = firstLength;
      if (secondLength) {
        parsedTransform.y = secondLength;
      }
    } else if (functionName === "translatex") parsedTransform.x = firstLength;
    else if (functionName === "translatey") parsedTransform.y = firstLength;
    else if (functionName === "rotate") {
      var angleUnit: Dynamic = (firstArgument[2] || "").toLowerCase();
      if (!(Object as Dynamic).prototype.hasOwnProperty.call(angleUnitToDegrees, angleUnit))
        return null;
      var degreesPerUnit: Dynamic = angleUnitToDegrees[angleUnit];
      parsedTransform.deg = parseFloat(firstArgument[1]) * degreesPerUnit;
    } else if (functionName === "scale") {
      if ((argumentsList.length > 1 && !secondArgument) || firstArgument[2] || (secondArgument && secondArgument[2]))
        return null;
      parsedTransform.sx = parseFloat(firstArgument[1]);
      parsedTransform.sy = secondArgument ? parseFloat(secondArgument[1]) : parsedTransform.sx;
    } else if (functionName === "scalex" || functionName === "scaley") {
      if (firstArgument[2]) return null;
      if (functionName === "scalex") {
        parsedTransform.sx = parseFloat(firstArgument[1]);
      } else {
        parsedTransform.sy = parseFloat(firstArgument[1]);
      }
    } else return null;
  }
  return parsedTransform;
}
export function serializeRotatedTransform(
  this: Dynamic,
  transform?: Dynamic,
  degrees?: Dynamic,
  ..._unusedArgs: Dynamic[]
): Dynamic {
  var functions: Dynamic = [];
  if (parseFloat(transform.x) !== 0 || parseFloat(transform.y) !== 0) {
    functions.push("translate(" + transform.x + ", " + transform.y + ")");
  }
  functions.push("rotate(" + degrees + "deg)");
  if (transform.sx !== 1 || transform.sy !== 1) {
    functions.push(
      transform.sx === transform.sy
        ? "scale(" + transform.sx + ")"
        : "scale(" + transform.sx + ", " + transform.sy + ")",
    );
  }
  return functions.join(" ");
}
export const decomposeAxisTransform: Dynamic = function (
  this: Dynamic,
  matrix?: Dynamic,
  ..._unusedArgs: Dynamic[]
): Dynamic {
  if (!matrix) return null;
  var scaleX: Dynamic = Math.sqrt(
    matrix.a * matrix.a + matrix.b * matrix.b,
  );
  var scaleY: Dynamic = Math.sqrt(
    matrix.c * matrix.c + matrix.d * matrix.d,
  );
  var determinant: Dynamic = matrix.a * matrix.d - matrix.b * matrix.c;
  if (
    !(scaleX > 0) ||
    !(scaleY > 0) ||
    !(
      Math.abs(matrix.a * matrix.c + matrix.b * matrix.d) <=
      0.001 * scaleX * scaleY
    )
  )
    return null;
  var rotation: Dynamic = Math.atan2(matrix.b, matrix.a);
  var mirrored: Dynamic = determinant < 0;
  if (mirrored) {
    var alternateRotation: Dynamic = Math.atan2(-matrix.b, -matrix.a);
    if (Math.abs(alternateRotation) <= Math.abs(rotation)) {
      rotation = alternateRotation;
      scaleX = -scaleX;
    } else {
      scaleY = -scaleY;
    }
  }
  return {
    m: matrix,
    rot: rotation,
    sx: scaleX,
    sy: scaleY,
    mirror: mirrored,
    plain:
      !mirrored &&
      Math.abs(rotation) < 1e-6 &&
      Math.abs(scaleX - 1) < 1e-6 &&
      Math.abs(scaleY - 1) < 1e-6,
  };
};
export function transformedResizeDirections(
  this: Dynamic,
  direction?: Dynamic,
  pose?: Dynamic,
  ancestorSigns?: Dynamic,
  ..._unusedArgs: Dynamic[]
): Dynamic {
  var plain: Dynamic = !pose || pose.plain;
  var scaleX: Dynamic = (plain ? 1 : pose.sx) * ancestorSigns.x;
  var scaleY: Dynamic = (plain ? 1 : pose.sy) * ancestorSigns.y;
  var west: Dynamic = direction.indexOf(scaleX < 0 ? "e" : "w") >= 0;
  var east: Dynamic = direction.indexOf(scaleX < 0 ? "w" : "e") >= 0;
  var north: Dynamic = direction.indexOf(scaleY < 0 ? "s" : "n") >= 0;
  var south: Dynamic = direction.indexOf(scaleY < 0 ? "n" : "s") >= 0;
  return {
    dir: (north ? "n" : south ? "s" : "") + (west ? "w" : east ? "e" : ""),
    west: west,
    east: east,
    north: north,
    south: south,
    rot: (plain ? 0 : pose.rot) * ancestorSigns.x * ancestorSigns.y,
    sx: scaleX,
    sy: scaleY,
  };
}
const intrinsicallySizedTags: Dynamic = {
  img: 1,
  svg: 1,
  video: 1,
  canvas: 1,
  iframe: 1,
  embed: 1,
  object: 1,
  audio: 1,
  input: 1,
  textarea: 1,
  select: 1,
  button: 1,
};
export function computedBoxDimensions(
  this: Dynamic,
  tagName?: Dynamic,
  offsetWidth?: Dynamic,
  offsetHeight?: Dynamic,
  computed?: Dynamic,
  ..._unusedArgs: Dynamic[]
): Dynamic {
  var readPixels: Dynamic = function (
    this: Dynamic,
    propertyName?: Dynamic,
    ..._unusedNestedArgs: Dynamic[]
  ): Dynamic {
    return parseFloat(computed[propertyName]) || 0;
  };
  var paddingMultiplier: Dynamic = computed.boxSizing === "border-box" ? 0 : 1;
  var resolveDimension: Dynamic = function (
    this: Dynamic,
    cssDimension?: Dynamic,
    offsetDimension?: Dynamic,
    paddingAndBorder?: Dynamic,
    ..._unusedNestedArgs: Dynamic[]
  ): Dynamic {
    var computedDimension: Dynamic = parseFloat(cssDimension) + paddingMultiplier * paddingAndBorder;
    return typeof offsetDimension != "number"
      ? isFinite(computedDimension)
        ? computedDimension
        : 0
      : isFinite(computedDimension) && Math.abs(computedDimension - offsetDimension) <= 0.501
        ? computedDimension
        : offsetDimension;
  };
  var width: Dynamic = resolveDimension(
    computed.width,
    offsetWidth,
    readPixels("paddingLeft") +
      readPixels("paddingRight") +
      readPixels("borderLeftWidth") +
      readPixels("borderRightWidth"),
  );
  var height: Dynamic = resolveDimension(
    computed.height,
    offsetHeight,
    readPixels("paddingTop") +
      readPixels("paddingBottom") +
      readPixels("borderTopWidth") +
      readPixels("borderBottomWidth"),
  );
  var origin: Dynamic = String(computed.transformOrigin || "").split(" ");
  var originX: Dynamic = parseFloat(origin[0]);
  var originY: Dynamic = parseFloat(origin[1]);
  var allowsInlineGeometry: Dynamic = !intrinsicallySizedTags[tagName];
  return {
    centre: {
      x: width / 2 - (isFinite(originX) ? originX : width / 2),
      y: height / 2 - (isFinite(originY) ? originY : height / 2),
    },
    inline: computed.display === "inline" && allowsInlineGeometry,
    flat: {
      x: allowsInlineGeometry && !(width > 0),
      y: allowsInlineGeometry && !(height > 0),
    },
  };
}
function axisTransformSigns(
  this: Dynamic,
  pose?: Dynamic,
  ..._unusedArgs: Dynamic[]
): Dynamic {
  if (!pose || Math.abs(Math.sin(pose.rot)) > 1e-4) return null;
  var rotationSign: Dynamic = Math.cos(pose.rot) < 0 ? -1 : 1;
  return {
    x: rotationSign * (pose.sx < 0 ? -1 : 1),
    y: rotationSign * (pose.sy < 0 ? -1 : 1),
  };
}
export function resizeBoxDimensions(
  this: Dynamic,
  box?: Dynamic,
  direction?: Dynamic,
  dx?: Dynamic,
  dy?: Dynamic,
  preserveRatio?: Dynamic,
  sizeLimits?: Dynamic,
  ..._unusedArgs: Dynamic[]
): Dynamic {
  var resizeWest: Dynamic = direction.indexOf("w") >= 0;
  var resizeEast: Dynamic = direction.indexOf("e") >= 0;
  var resizeNorth: Dynamic = direction.indexOf("n") >= 0;
  var resizeSouth: Dynamic = direction.indexOf("s") >= 0;
  var width: Dynamic = resizeWest ? box.w - dx : resizeEast ? box.w + dx : box.w;
  var height: Dynamic = resizeNorth ? box.h - dy : resizeSouth ? box.h + dy : box.h;
  if (
    preserveRatio &&
    (resizeWest || resizeEast) &&
    (resizeNorth || resizeSouth) &&
    box.w > 0 &&
    box.h > 0
  ) {
    var widthRatio: Dynamic = width / box.w;
    var heightRatio: Dynamic = height / box.h;
    var scale: Dynamic =
      Math.abs(widthRatio - 1) >= Math.abs(heightRatio - 1) ? widthRatio : heightRatio;
    scale = Math.min(scale, sizeLimits.max.w / box.w, sizeLimits.max.h / box.h);
    scale = Math.max(scale, sizeLimits.min.w / box.w, sizeLimits.min.h / box.h);
    width = box.w * scale;
    height = box.h * scale;
  } else {
    if (resizeWest || resizeEast) {
      width = Math.min(sizeLimits.max.w, Math.max(sizeLimits.min.w, width));
    }
    if (resizeNorth || resizeSouth) {
      height = Math.min(sizeLimits.max.h, Math.max(sizeLimits.min.h, height));
    }
  }
  return {
    x: resizeWest ? box.x + box.w - width : box.x,
    y: resizeNorth ? box.y + box.h - height : box.y,
    w: width,
    h: height,
  };
}
export function transformOriginCompensation(
  this: Dynamic,
  originalMatrix?: Dynamic,
  nextMatrix?: Dynamic,
  originX?: Dynamic,
  originY?: Dynamic,
  originalWidth?: Dynamic,
  originalHeight?: Dynamic,
  nextWidth?: Dynamic,
  nextHeight?: Dynamic,
  ..._unusedArgs: Dynamic[]
): Dynamic {
  var originalOffsetX: Dynamic = (0.5 - originX) * originalWidth;
  var originalOffsetY: Dynamic = (0.5 - originY) * originalHeight;
  var nextOffsetX: Dynamic = (0.5 - originX) * nextWidth;
  var nextOffsetY: Dynamic = (0.5 - originY) * nextHeight;
  return {
    x:
      originX * (nextWidth - originalWidth) +
      (nextMatrix.a * nextOffsetX + nextMatrix.c * nextOffsetY) -
      (originalMatrix.a * originalOffsetX + originalMatrix.c * originalOffsetY),
    y:
      originY * (nextHeight - originalHeight) +
      (nextMatrix.b * nextOffsetX + nextMatrix.d * nextOffsetY) -
      (originalMatrix.b * originalOffsetX + originalMatrix.d * originalOffsetY),
  };
}
export function rotateMatrix(
  this: Dynamic,
  matrix?: Dynamic,
  radians?: Dynamic,
  ..._unusedArgs: Dynamic[]
): Dynamic {
  var cosine: Dynamic = Math.cos(radians);
  var sine: Dynamic = Math.sin(radians);
  return {
    a: cosine * matrix.a - sine * matrix.b,
    b: sine * matrix.a + cosine * matrix.b,
    c: cosine * matrix.c - sine * matrix.d,
    d: sine * matrix.c + cosine * matrix.d,
  };
}
export function normalizeDegrees(
  this: Dynamic,
  degrees?: Dynamic,
  ..._unusedArgs: Dynamic[]
): Dynamic {
  degrees = ((degrees % 360) + 360) % 360;
  return degrees > 180 ? degrees - 360 : degrees;
}
export function positioningAnchors(
  this: Dynamic,
  style?: Dynamic,
  ..._unusedArgs: Dynamic[]
): Dynamic {
  var hasAnchor: Dynamic = function (
    this: Dynamic,
    anchor?: Dynamic,
    ..._unusedNestedArgs: Dynamic[]
  ): Dynamic {
    return !!anchor && anchor !== "auto";
  };
  return {
    x:
      hasAnchor(style.left) || !hasAnchor(style.right)
        ? "left"
        : "right",
    y:
      hasAnchor(style.top) || !hasAnchor(style.bottom)
        ? "top"
        : "bottom",
  };
}
export function hasIndependentTransforms(
  this: Dynamic,
  style?: Dynamic,
  ..._unusedArgs: Dynamic[]
): Dynamic {
  var hasTransform: Dynamic = function (
    this: Dynamic,
    value?: Dynamic,
    ..._unusedNestedArgs: Dynamic[]
  ): Dynamic {
    return !!value && value !== "none";
  };
  return (
    hasTransform(style.rotate) ||
    hasTransform(style.scale) ||
    hasTransform(style.translate)
  );
}
export function pixelLengthOrFallback(
  this: Dynamic,
  length?: Dynamic,
  fallback?: Dynamic,
  ..._unusedArgs: Dynamic[]
): Dynamic {
  return /^-?[\d.]+px$/i.test(String(length || "").trim())
    ? parseFloat(length)
    : parseFloat(fallback) || 0;
}
export const identityTransformMatrix: Dynamic = {
  a: 1,
  b: 0,
  c: 0,
  d: 1,
  none: true,
};
export function computedTransformMatrix(
  this: Dynamic,
  element?: Dynamic,
  ..._unusedArgs: Dynamic[]
): Dynamic {
  var computed: Dynamic;
  try {
    computed = getComputedStyle(element);
  } catch {
    return null;
  }
  if (hasIndependentTransforms(computed)) return null;
  var transform: Dynamic = computed.transform;
  if (!transform || transform === "none") return identityTransformMatrix;
  var match: Dynamic = /^matrix\(([^)]+)\)$/.exec(transform);
  if (!match) return null;
  var components: Dynamic = match[1].split(",");
  var matrix: Dynamic = {
    a: +components[0],
    b: +components[1],
    c: +components[2],
    d: +components[3],
  };
  return isFinite(matrix.a) &&
    isFinite(matrix.b) &&
    isFinite(matrix.c) &&
    isFinite(matrix.d)
    ? matrix
    : null;
}
export function decomposedElementTransform(
  this: Dynamic,
  element?: Dynamic,
  ..._unusedArgs: Dynamic[]
): Dynamic {
  return decomposeAxisTransform(computedTransformMatrix(element));
}
export function effectiveTransformSigns(
  this: Dynamic,
  element?: Dynamic,
  ..._unusedArgs: Dynamic[]
): Dynamic {
  var ancestors: Dynamic = ancestorTransformSigns(element);
  var matrix: Dynamic = computedTransformMatrix(element);
  var localSigns: Dynamic =
    matrix && !matrix.none
      ? axisTransformSigns(decomposeAxisTransform(matrix))
      : {
          x: 1,
          y: 1,
        };
  return localSigns && matrix
    ? {
        x: ancestors.x * localSigns.x,
        y: ancestors.y * localSigns.y,
      }
    : {
        x: 1,
        y: 1,
      };
}
export function ancestorTransformSigns(
  this: Dynamic,
  element?: Dynamic,
  ..._unusedArgs: Dynamic[]
): Dynamic {
  for (
    var signX: Dynamic = 1,
      signY: Dynamic = 1,
      ancestor: Dynamic = element ? composedParent(element) : null;
    ancestor;
    ancestor = composedParent(ancestor)
  )
    if (ancestor.nodeType === 1) {
      var matrix: Dynamic = computedTransformMatrix(ancestor);
      if (!matrix)
        return {
          x: 1,
          y: 1,
        };
      if (!matrix.none) {
        var signs: Dynamic = axisTransformSigns(decomposeAxisTransform(matrix));
        if (!signs)
          return {
            x: 1,
            y: 1,
          };
        signX *= signs.x;
        signY *= signs.y;
      }
    }
  return {
    x: signX,
    y: signY,
  };
}
export function elementLayoutDimensions(
  this: Dynamic,
  element?: Dynamic,
  computed?: Dynamic,
  ..._unusedArgs: Dynamic[]
): Dynamic {
  return element.offsetWidth > 0 || element.offsetHeight > 0
    ? {
        w: element.offsetWidth,
        h: element.offsetHeight,
      }
    : ((computed = computed || getComputedStyle(element)),
      {
        w: parseFloat(computed.width) || 0,
        h: parseFloat(computed.height) || 0,
      });
}
export function fractionalTransformOrigin(
  this: Dynamic,
  computed?: Dynamic,
  size?: Dynamic,
  ..._unusedArgs: Dynamic[]
): Dynamic {
  var origin: Dynamic = String(computed.transformOrigin || "").split(" ");
  var x: Dynamic = parseFloat(origin[0]);
  var y: Dynamic = parseFloat(origin[1]);
  return {
    fx: size.w > 0 && isFinite(x) ? x / size.w : 0.5,
    fy: size.h > 0 && isFinite(y) ? y / size.h : 0.5,
  };
}
export function boundsWithoutTransform(
  this: Dynamic,
  element?: Dynamic,
  ..._unusedArgs: Dynamic[]
): Dynamic {
  var style: Dynamic = element.style;
  var originalStyle: Dynamic = element.getAttribute("style");
  if (!style || !element.getBoundingClientRect) return null;
  function disableTransitions(this: Dynamic, ..._unusedNestedArgs: Dynamic[]): Dynamic {
    style.setProperty("transition", "none", "important");
  }
  try {
    disableTransitions();
    style.setProperty("transform", "none", "important");
    style.setProperty("rotate", "none", "important");
    style.setProperty("scale", "none", "important");
    style.setProperty("translate", "none", "important");
    var bounds: Dynamic = element.getBoundingClientRect();
    if (originalStyle == null) {
      element.removeAttribute("style");
    } else {
      element.setAttribute("style", originalStyle);
    }
    disableTransitions();
    element.getBoundingClientRect();
    return bounds;
  } catch {
    return null;
  } finally {
    if (originalStyle == null) {
      element.removeAttribute("style");
    } else {
      element.setAttribute("style", originalStyle);
    }
  }
}

export function hasComplexAncestorTransform(element: Element) {
  for (let ancestor = element.parentElement; ancestor && ancestor !== document.documentElement; ancestor = ancestor.parentElement) {
    const matrix = computedTransformMatrix(ancestor);
    if (!matrix) return true;
    if (matrix.none) continue;
    const axis = decomposeAxisTransform(matrix);
    if (!axis || axis.mirror || Math.abs(axis.rot) > 1e-4 ||
        Math.abs(axis.sx - axis.sy) > 1e-4 * axis.sx) return true;
  }
  return false;
}

export function ancestorTransformInfo(element: Element | null) {
  let scale = 1;
  let reference: HTMLElement | null = null;
  let rotated = false;
  for (let ancestor = element ? composedParent(element) : null; ancestor; ancestor = composedParent(ancestor)) {
    if (ancestor.nodeType !== Node.ELEMENT_NODE) continue;
    const style = getComputedStyle(ancestor);
    if (style.transform && style.transform !== "none") {
      try {
        const matrix = new DOMMatrixReadOnly(style.transform);
        scale *= Math.sqrt(matrix.a * matrix.a + matrix.b * matrix.b) || 1;
        if (Math.abs(matrix.b) > 1e-6 || Math.abs(matrix.c) > 1e-6 || matrix.a < 0 || matrix.d < 0) rotated = true;
      } catch {}
    }
    if (style.rotate && style.rotate !== "none" && parseFloat(style.rotate) !== 0) rotated = true;
    const independentScale = style.scale && style.scale !== "none" ? Math.abs(parseFloat(style.scale)) : NaN;
    if (independentScale > 0) scale *= independentScale;
    if (style.scale && /(^| )-/.test(style.scale)) rotated = true;
    const zoom = parseFloat(style.zoom);
    if (zoom > 0 && zoom !== 1) scale *= zoom;
    if (!reference && ancestor.offsetWidth >= 16) reference = ancestor;
  }
  if (reference && !rotated) {
    const measuredScale = reference.getBoundingClientRect().width / reference.offsetWidth;
    if (measuredScale > 0 && Math.abs(scale - measuredScale) > measuredScale * (1.25 / reference.offsetWidth + 0.005)) {
      scale = measuredScale;
    }
  }
  return { scale: scale > 0 && Number.isFinite(scale) ? scale : 1, rotated };
}
