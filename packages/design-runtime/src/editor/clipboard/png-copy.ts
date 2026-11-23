/** Restored application module; prepare first, initialize in original order. */
import {
  type Dynamic,
} from "../../runtime-types";
import { dataUrlToBytes } from "../../export/capture-warnings";
import { downloadsCapabilityDeclared } from "../../export/downloads";
import { capabilityTimeoutMs, hasCapabilityLoader, requestHostCapability } from "../../platform/host-capabilities";

var svgNamespaceUriForCopy: Dynamic;
var HttpWwwW3Org1999XlinkValue: Dynamic;
var HttpWwwW3OrgXML1998NamespaceValue: Dynamic;
var HttpWwwW3Org2000XmlnsValue: Dynamic;
var ClipboardPngCopySubscribers: Dynamic;
var ClipboardPngCopyASwitchSet: Dynamic;
var ClipboardPngCopyPattern: Dynamic;
var ClipboardPngCopyDataImagePattern: Dynamic;
var ClipboardPngCopyUrlAttributeSet: Dynamic;
function supportsClipboardImages(hostWindow: Dynamic = window): Dynamic {
  return (
    typeof hostWindow.ClipboardItem == "function" &&
    typeof hostWindow.navigator.clipboard?.write == "function"
  );
}
async function allowsClipboardImages(
  timeoutMs: Dynamic = capabilityTimeoutMs,
): Promise<Dynamic> {
  if (
    !hasCapabilityLoader() ||
    !downloadsCapabilityDeclared()
  )
    return true;
  let timeoutHandle: Dynamic;
  try {
    let promise: Dynamic = new Promise(
        (resolve?: Dynamic): Dynamic =>
          (timeoutHandle = setTimeout(resolve, timeoutMs, "late")),
      ),
      outcome: Dynamic = await Promise.race([
        requestHostCapability("downloads"),
        promise,
      ]);
    return outcome != null && outcome !== "late";
  } catch {
    return false;
  } finally {
    clearTimeout(timeoutHandle);
  }
}
function pngDataUrlToBlob(dataUrl?: Dynamic): Dynamic {
  return new Blob([dataUrlToBytes(dataUrl)], {
    type: "image/png",
  });
}
async function writeClipboardPng(
  pngPromise?: Dynamic,
  hostWindow: Dynamic = window,
): Promise<Dynamic> {
  let ClipboardItem: Dynamic = hostWindow.ClipboardItem,
    clipboard: Dynamic = hostWindow.navigator.clipboard;
  if (
    typeof ClipboardItem != "function" ||
    typeof clipboard?.write != "function"
  )
    return "refused";
  let pngOrNull: Dynamic = pngPromise.catch((): Dynamic => null),
    rejectingPromise: Dynamic = pngOrNull.then(
      (blob?: Dynamic): Dynamic =>
        blob ?? Promise.reject(new Error("no picture")),
    );
  rejectingPromise.catch((): Dynamic => {});
  try {
    await clipboard.write([
      new ClipboardItem({
        "image/png": rejectingPromise,
      }),
    ]);
    return (await pngOrNull) !== null ? "copied" : "no-picture";
  } catch {
    let blob: Dynamic = await pngOrNull;
    if (!blob) return "no-picture";
    try {
      await clipboard.write([
        new ClipboardItem({
          "image/png": blob,
        }),
      ]);
      return "copied";
    } catch {
      return "refused";
    }
  }
}
export {
  allowsClipboardImages,
  ClipboardPngCopyASwitchSet,
  ClipboardPngCopyDataImagePattern,
  ClipboardPngCopyPattern,
  ClipboardPngCopySubscribers,
  ClipboardPngCopyUrlAttributeSet,
  HttpWwwW3Org1999XlinkValue,
  svgNamespaceUriForCopy,
  HttpWwwW3Org2000XmlnsValue,
  HttpWwwW3OrgXML1998NamespaceValue,
  pngDataUrlToBlob,
  supportsClipboardImages,
  writeClipboardPng,
};
export function installEditorClipboardPngCopy(): () => void {
  return () => {
    svgNamespaceUriForCopy = "http://www.w3.org/2000/svg";
    HttpWwwW3Org1999XlinkValue = "http://www.w3.org/1999/xlink";
    HttpWwwW3OrgXML1998NamespaceValue = "http://www.w3.org/XML/1998/namespace";
    HttpWwwW3Org2000XmlnsValue = "http://www.w3.org/2000/xmlns/";
    ClipboardPngCopySubscribers = new Set([
      "svg",
      "g",
      "defs",
      "symbol",
      "use",
      "title",
      "desc",
      "rect",
      "circle",
      "ellipse",
      "line",
      "polyline",
      "polygon",
      "path",
      "text",
      "tspan",
      "textPath",
      "image",
      "marker",
      "clipPath",
      "mask",
      "pattern",
      "linearGradient",
      "radialGradient",
      "stop",
      "filter",
      "feBlend",
      "feColorMatrix",
      "feComponentTransfer",
      "feComposite",
      "feConvolveMatrix",
      "feDiffuseLighting",
      "feDisplacementMap",
      "feDistantLight",
      "feDropShadow",
      "feFlood",
      "feFuncA",
      "feFuncB",
      "feFuncG",
      "feFuncR",
      "feGaussianBlur",
      "feMerge",
      "feMergeNode",
      "feMorphology",
      "feOffset",
      "fePointLight",
      "feSpecularLighting",
      "feSpotLight",
      "feTile",
      "feTurbulence",
    ]);
    ClipboardPngCopyASwitchSet = new Set(["a", "switch"]);
    ClipboardPngCopyPattern = /^\s*#/;
    ClipboardPngCopyDataImagePattern =
      /^\s*data:image\/(?:png|jpeg|gif|webp|avif|bmp)[;,]/i;
    ClipboardPngCopyUrlAttributeSet = new Set([
      "src",
      "srcset",
      "srcdoc",
      "imagesrcset",
      "attributionsrc",
      "action",
      "formaction",
      "poster",
      "background",
      "ping",
      "lowsrc",
      "dynsrc",
      "longdesc",
      "codebase",
      "classid",
      "archive",
      "data",
      "manifest",
      "cite",
      "usemap",
      "icon",
      "profile",
      "itemtype",
      "http-equiv",
      "content",
    ]);
  };
}
