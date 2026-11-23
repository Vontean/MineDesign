import type { Dynamic } from "../../runtime-types";
import { boundsWithoutTransform, computedTransformMatrix, elementLayoutDimensions } from "./element-transform-geometry";

/** Measurement routines share the preview's current zoom as a fallback for boxes without a measurable size. */
export function createViewportScaleReader(readViewportScale: () => number) {
  function inferredElementScale(
    this: Dynamic,
    element?: Dynamic,
    previewBounds?: Dynamic,
    ..._unusedArgs: Dynamic[]
  ): Dynamic {
    var layoutBounds: Dynamic = boundsWithoutTransform(element) || previewBounds;
    var layoutSize: Dynamic = elementLayoutDimensions(element);
    var computed: Dynamic = getComputedStyle(element);
    var cssWidth: Dynamic = parseFloat(computed.width);
    if (cssWidth > 0 && computed.boxSizing !== "border-box") {
      cssWidth +=
        (parseFloat(computed.paddingLeft) || 0) +
        (parseFloat(computed.paddingRight) || 0) +
        (parseFloat(computed.borderLeftWidth) || 0) +
        (parseFloat(computed.borderRightWidth) || 0);
    }
    var layoutWidth: Dynamic = cssWidth > 0 && Math.abs(cssWidth - layoutSize.w) < 1 ? cssWidth : layoutSize.w;
    var scale: Dynamic =
      layoutWidth > 0 && layoutBounds.width > 0
        ? layoutBounds.width / layoutWidth
        : elementViewportScale(element);
    if (!(scale > 0) || !isFinite(scale)) {
      scale = 1;
    }
    return {
      s: scale,
      w: Math.ceil(previewBounds.width / scale),
      h: Math.ceil(previewBounds.height / scale),
      ew: Math.ceil(layoutWidth) || Math.ceil(layoutBounds.width / scale),
      eh: Math.ceil(layoutSize.h) || Math.ceil(layoutBounds.height / scale),
      ox: Math.round((layoutBounds.left - previewBounds.left) / scale),
      oy: Math.round((layoutBounds.top - previewBounds.top) / scale),
    };
  }
  function parentLayoutScale(
    this: Dynamic,
    element?: Dynamic,
    ..._unusedArgs: Dynamic[]
  ): Dynamic {
    var matrix: Dynamic = element && computedTransformMatrix(element);
    if (!matrix || matrix.none) return elementViewportScale(element);
    for (
      var parent: Dynamic = element.parentElement;
      parent &&
      parent.parentElement &&
      !(parent.offsetWidth > 0 || parent.offsetHeight > 0);

    )
      parent = parent.parentElement;
    return elementViewportScale(parent || element);
  }
  function elementViewportScale(
    this: Dynamic,
    element?: Dynamic,
    ..._unusedArgs: Dynamic[]
  ): Dynamic {
    try {
      if (element && element.getBoundingClientRect) {
        var bounds: Dynamic = element.getBoundingClientRect();
        if (element.offsetWidth > 0 && bounds.width > 0)
          return bounds.width / element.offsetWidth;
        if (element.offsetHeight > 0 && bounds.height > 0)
          return bounds.height / element.offsetHeight;
      }
    } catch {}
    return readViewportScale() || 1;
  }
  return { inferredElementScale, parentLayoutScale, elementViewportScale };
}
