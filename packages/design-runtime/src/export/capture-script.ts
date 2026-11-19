/** Restored application module; prepare first, initialize in original order. */
import {
  type Dynamic,
} from "../runtime-types";
import { imageCaptureRuntimeScript } from "./capture-runtime";
import { adjustCaptureTextMetrics } from "./capture-text-metrics";

var ExportCaptureScriptZoomDprUntilConfig: Dynamic;
function getBrowserZoomMetrics(): Dynamic {
  if (typeof document === "undefined" || typeof window === "undefined")
    return {
      zoom: 0,
      dpr: 0,
    };
  let value: Dynamic = (window as Dynamic).devicePixelRatio || 1;
  if (
    ExportCaptureScriptZoomDprUntilConfig &&
    ExportCaptureScriptZoomDprUntilConfig.dpr === value &&
    Date.now() < ExportCaptureScriptZoomDprUntilConfig.until
  )
    return ExportCaptureScriptZoomDprUntilConfig;
  let measuredZoom: Dynamic = adjustCaptureTextMetrics(
    document,
    value,
  );
  ExportCaptureScriptZoomDprUntilConfig = {
    zoom: measuredZoom,
    dpr: value,
    until: measuredZoom === value ? 1 / 0 : Date.now() + 5e3,
  };
  return ExportCaptureScriptZoomDprUntilConfig;
}
function buildCaptureScript(
  capturePayload?: Dynamic,
  quality?: Dynamic,
  maxDimension?: Dynamic,
  scale: Dynamic = 0,
  includeViewport: Dynamic = false,
  cropToSelection: Dynamic = false,
  captureLimit: Dynamic = 0,
  matteColor: Dynamic = "",
  settleAnimations: Dynamic = false,
  includeSelection: Dynamic = false,
  freezeAnimations: Dynamic = false,
  selectionBackground: Dynamic = "",
  selectionRoot: Dynamic = "",
  overlay: Dynamic = "",
  selectionVisible: Dynamic = false,
  includeText: Dynamic = false,
  frameBounds: Dynamic = null,
  pagination: Dynamic = null,
  zoomMetrics: Dynamic = getBrowserZoomMetrics(),
): Dynamic {
  let state: Dynamic = {
    __FMT__: JSON.stringify(capturePayload),
    __Q__: String(quality),
    __MAX__: String(maxDimension),
    __SCALE__: String(scale),
    __VP__: includeViewport ? "1" : "0",
    __CROP__: cropToSelection ? "1" : "0",
    __CAP__: String(captureLimit),
    __MATTE__: JSON.stringify(matteColor),
    __SETTLE__: settleAnimations ? "1" : "0",
    __SEL__: includeSelection ? "1" : "0",
    __FREEZE__: freezeAnimations ? "1" : "0",
    __SELBG__: JSON.stringify(selectionBackground),
    __SELROOT__: JSON.stringify(selectionRoot),
    __OVERLAY__: JSON.stringify(overlay),
    __SELVIS__: selectionVisible ? "1" : "0",
    __TEXT__: includeText ? "1" : "0",
    __FRAME__:
      frameBounds &&
      typeof frameBounds.w == "number" &&
      typeof frameBounds.h == "number" &&
      Number.isFinite(frameBounds.w) &&
      Number.isFinite(frameBounds.h) &&
      frameBounds.w > 0 &&
      frameBounds.h > 0
        ? JSON.stringify({
            w: frameBounds.w,
            h: frameBounds.h,
            ...(frameBounds.full === true
              ? {
                  full: true,
                }
              : {}),
          })
        : "null",
    __PAGES__:
      pagination &&
      Number.isFinite(pagination.h) &&
      pagination.h > 0 &&
      Number.isInteger(pagination.max) &&
      pagination.max > 0
        ? JSON.stringify({
            h: pagination.h,
            max: pagination.max,
            m: Math.max(0, Number(pagination.margin) || 0),
            from: Math.max(0, Math.floor(Number(pagination.from) || 0)),
            n: Math.max(0, Math.floor(Number(pagination.count) || 0)),
            tops: (pagination.tops ?? []).filter(
              (isFiniteValue?: Dynamic): Dynamic => Number.isFinite(isFiniteValue),
            ),
          })
        : "null",
    __LAYOUT__: JSON.stringify(
      [zoomMetrics.zoom, zoomMetrics.dpr].every(
        (isValidDimension?: Dynamic): Dynamic =>
          typeof isValidDimension == "number" &&
          Number.isFinite(isValidDimension) &&
          isValidDimension > 0 &&
          isValidDimension <= 8,
      ) &&
        (zoomMetrics.zoom === 1 || zoomMetrics.zoom === zoomMetrics.dpr)
        ? {
            zoom: zoomMetrics.zoom,
            dpr: zoomMetrics.dpr,
          }
        : {
            zoom: 0,
            dpr: 0,
          },
    ),
  };
  return imageCaptureRuntimeScript.replace(
    /__[A-Z]+__/g,
    (placeholder?: Dynamic): Dynamic => state[placeholder] ?? placeholder,
  );
}
export {
  buildCaptureScript,
  ExportCaptureScriptZoomDprUntilConfig,
  getBrowserZoomMetrics,
};
export function installExportCaptureScript(): () => void {
  return () => {
    ExportCaptureScriptZoomDprUntilConfig = null;
  };
}
