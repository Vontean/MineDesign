/** Restored application module; prepare first, initialize in original order. */
import {
  type Dynamic,
} from "../runtime-types";
import { buildCaptureTemplate } from "../dependencies";
import { captureAnimationStates, captureAnimationStyles } from "./animation-snapshot";
import { collectCssImageUrls, prepareWebGlCanvasCapture, replaceCssImageUrls, sanitizeXmlCharacters } from "./capture-assets";
import { calculateFlowTail } from "./capture-flow";
import { collectUsedFontFaces, resolveCaptureFonts } from "./capture-fonts";
import { inspectCaptureLayout } from "./capture-layout";
import { computePaginationCuts } from "./capture-pagination";
import { captureSelectionSvg } from "./capture-selection";
import { captureElementStyle } from "./capture-style";
import { captureReadableText } from "./capture-text";
import { captureDomSnapshot } from "./dom-snapshot";

var maxCaptureEdge: Dynamic;
var maxCapturePixels: Dynamic;
var imageCaptureRuntimeScript: Dynamic;
export {
  imageCaptureRuntimeScript,
  maxCaptureEdge,
  maxCapturePixels,
};
export function installExportCaptureRuntime(): () => void {
  return () => {
    maxCaptureEdge = 12e3;
    maxCapturePixels = 12e7;
    imageCaptureRuntimeScript = buildCaptureTemplate({
      resolveSelectionRoot: captureSelectionSvg.toString(),
      maxCaptureSide: maxCaptureEdge,
      maxCapturePixels: maxCapturePixels,
      collectFontFaceRules: resolveCaptureFonts.toString(),
      warnUnembeddedFonts: collectUsedFontFaces.toString(),
      collectBackgroundUrls: collectCssImageUrls.toString(),
      replaceBackgroundUrls: replaceCssImageUrls.toString(),
      makeCloneStyled: captureElementStyle.toString(),
      prepareWebGlCapture: prepareWebGlCanvasCapture.toString(),
      settleFrozenAnimations: captureAnimationStates.toString(),
      freezeAnimations: captureAnimationStyles.toString(),
      measureTextOriginOffset: calculateFlowTail.toString(),
      collectLinks: captureDomSnapshot.toString(),
      collectTextLayer: captureReadableText.toString(),
      countHiddenContent: inspectCaptureLayout.toString(),
      sanitizeXmlCharacters: sanitizeXmlCharacters.toString(),
      computePaginationCuts: computePaginationCuts.toString(),
    });
  };
}
