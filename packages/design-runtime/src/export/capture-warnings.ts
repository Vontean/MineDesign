/** Restored application module; prepare first, initialize in original order. */
import {
  type Dynamic,
} from "../runtime-types";

var ExportCaptureWarningsItems: Dynamic;
var FONT_FALLBACK_WARNING_PHRASES: Dynamic;
function dataUrlToBytes(dataUrl?: Dynamic): Dynamic {
  let separator: Dynamic = dataUrl.indexOf(",");
  if (separator < 0 || !dataUrl.slice(0, separator).endsWith(";base64"))
    return new Uint8Array(0);
  try {
    let value: Dynamic = atob(dataUrl.slice(separator + 1)),
      decodedBytes: Dynamic = new Uint8Array(value.length);
    for (let index: Dynamic = 0; index < value.length; index++)
      decodedBytes[index] = value.charCodeAt(index);
    return decodedBytes;
  } catch {
    return new Uint8Array(0);
  }
}
function countMatchingExportWarnings(
  warnings?: Dynamic,
  phrases?: Dynamic,
): Dynamic {
  return matchingExportWarnings(warnings, phrases).length;
}
function matchingExportWarnings(warnings?: Dynamic, phrases?: Dynamic): Dynamic {
  return Array.isArray(warnings)
    ? warnings.filter(
        (warning?: Dynamic): Dynamic =>
          typeof warning == "string" &&
          phrases.some(
            (phrase?: Dynamic): Dynamic => warning.includes(phrase),
          ),
      )
    : [];
}
function mergeExportWarnings(existingWarnings?: Dynamic, newWarnings?: Dynamic): Dynamic {
  let items: Dynamic = [...existingWarnings];
  for (let value of new Set(newWarnings) as Dynamic) {
    let additionalCount: Dynamic =
      newWarnings.filter((warning?: Dynamic): Dynamic => warning === value).length -
      existingWarnings.filter((warning?: Dynamic): Dynamic => warning === value).length;
    for (let index: Dynamic = 0; index < additionalCount; index++) items.push(value);
  }
  return items;
}
function collectCaptureWarnings(
  warnings?: Dynamic,
  captureResult?: Dynamic,
  warningPhrases?: Dynamic,
): Dynamic {
  return mergeExportWarnings(
    warnings,
    matchingExportWarnings(
      captureResult !== null && "w" in captureResult ? captureResult.w : undefined,
      warningPhrases,
    ),
  );
}
function describeCaptureFailure(error?: Dynamic): Dynamic {
  let value: Dynamic = error instanceof Error ? error.message : "";
  return /^executeJavaScript timed out/.test(value)
    ? "it took too long to draw; try again once it has finished loading"
    : /^preview is blocked/.test(value)
      ? "its preview is stopped; reload it first"
      : /svg load failed|URI/.test(value)
        ? "something in its HTML can\u2019t be drawn as an image"
        : "its page hit an error while it was being drawn";
}
export {
  collectCaptureWarnings,
  countMatchingExportWarnings,
  dataUrlToBytes,
  describeCaptureFailure,
  ExportCaptureWarningsItems,
  FONT_FALLBACK_WARNING_PHRASES as ExportCaptureWarningsItems_2,
  matchingExportWarnings,
  mergeExportWarnings,
};
export function installExportCaptureWarnings(): () => void {
  return () => {
    ExportCaptureWarningsItems = ["image could not be embedded"];
    FONT_FALLBACK_WARNING_PHRASES = [
      "a fallback face is used",
      "fonts may fall back",
    ];
  };
}
