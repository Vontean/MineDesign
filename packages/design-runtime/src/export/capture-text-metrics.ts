/** Restored application module; prepare first, initialize in original order. */
import {
  type Dynamic,
} from "../runtime-types";

function adjustCaptureTextMetrics(doc?: Dynamic, scale?: Dynamic): Dynamic {
  let documentElement: Dynamic = doc.documentElement;
  if (
    !documentElement ||
    documentElement.namespaceURI !== "http://www.w3.org/1999/xhtml"
  )
    return 0;
  let callback: Dynamic = (candidateScale?: Dynamic): Dynamic => {
    let isNonIntegralScale: Dynamic = (
        sampleCount?: Dynamic,
        sampleScale?: Dynamic,
      ): Dynamic =>
        Math.abs(Math.floor((sampleCount + 0.25) * sampleScale) / sampleScale - sampleCount) >
          0.2 &&
        Math.abs(Math.round((sampleCount + 0.25) * sampleScale) / sampleScale - sampleCount) >
          0.2,
      items: Dynamic = [];
    for (let count: Dynamic = 64; count < 1024 && items.length < 4; count++)
      (candidateScale === 1 || isNonIntegralScale(count, 1 / candidateScale)) &&
        isNonIntegralScale(count, 60 / (64 * candidateScale)) &&
        items.push(count);
    if (items.length < 4) return false;
    let value: Dynamic = doc.createElement("x-layout-probe");
    documentElement.appendChild(value);
    let measureWidth: Dynamic = (sampleCount?: Dynamic): Dynamic => (
        (value.style.cssText =
          "all:initial;display:block;position:absolute;visibility:hidden;left:0;top:0;height:0;width:" +
          String(sampleCount / (64 * candidateScale)) +
          "px"),
        value.getBoundingClientRect().width * candidateScale * 64
      ),
      flag: Dynamic = true;
    for (let index: Dynamic = 0; index < items.length; index++)
      Math.abs(measureWidth(items[index] + 0.25) - items[index]) >= 0.05 &&
        (flag = false);
    let measuredWidth: Dynamic = measureWidth(items[0] + 0.625);
    Math.abs(measuredWidth - Math.round(measuredWidth)) >= 0.05 && (flag = false);
    value.remove();
    return flag;
  };
  return isFinite(scale) &&
    scale > 0 &&
    scale !== 1 &&
    callback(scale)
    ? scale
    : callback(1)
      ? 1
      : 0;
}
export {
  adjustCaptureTextMetrics,
};
export function installExportCaptureTextMetrics(): () => void {
  return () => {};
}
