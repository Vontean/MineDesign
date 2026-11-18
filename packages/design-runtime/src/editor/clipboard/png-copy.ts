/** Restored application module; prepare first, initialize in original order. */
import {
  type Dynamic,
} from "../../runtime-types";
import { dataUrlToBytes } from "../../export/capture-warnings";
import { downloadsCapabilityDeclared } from "../../export/downloads";
import { capabilityTimeoutMs, hasCapabilityLoader, requestHostCapability } from "../../platform/host-capabilities";

var HttpWwwW3Org2000SvgValue_2: Dynamic;
var HttpWwwW3Org1999XlinkValue: Dynamic;
var HttpWwwW3OrgXML1998NamespaceValue: Dynamic;
var HttpWwwW3Org2000XmlnsValue: Dynamic;
var ClipboardPngCopySubscribers: Dynamic;
var ClipboardPngCopyASwitchSet: Dynamic;
var ClipboardPngCopyPattern: Dynamic;
var ClipboardPngCopyDataImagePattern: Dynamic;
var ClipboardPngCopySubscribers_2: Dynamic;
function supportsClipboardImages(input: Dynamic = window): Dynamic {
  return (
    typeof input.ClipboardItem == "function" &&
    typeof input.navigator.clipboard?.write == "function"
  );
}
async function allowsClipboardImages(
  input: Dynamic = capabilityTimeoutMs,
): Promise<Dynamic> {
  if (
    !hasCapabilityLoader() ||
    !downloadsCapabilityDeclared()
  )
    return true;
  let value: Dynamic;
  try {
    let promise: Dynamic = new Promise(
        (input2?: Dynamic): Dynamic =>
          (value = setTimeout(input2, input, "late")),
      ),
      value2: Dynamic = await Promise.race([
        requestHostCapability("downloads"),
        promise,
      ]);
    return value2 != null && value2 !== "late";
  } catch {
    return false;
  } finally {
    clearTimeout(value);
  }
}
function pngDataUrlToBlob(input?: Dynamic): Dynamic {
  return new Blob([dataUrlToBytes(input)], {
    type: "image/png",
  });
}
async function writeClipboardPng(
  input?: Dynamic,
  options: Dynamic = window,
): Promise<Dynamic> {
  let ClipboardItem: Dynamic = options.ClipboardItem,
    clipboard: Dynamic = options.navigator.clipboard;
  if (
    typeof ClipboardItem != "function" ||
    typeof clipboard?.write != "function"
  )
    return "refused";
  let value: Dynamic = input.catch((): Dynamic => null),
    value2: Dynamic = value.then(
      (input2?: Dynamic): Dynamic =>
        input2 ?? Promise.reject(new Error("no picture")),
    );
  value2.catch((): Dynamic => {});
  try {
    await clipboard.write([
      new ClipboardItem({
        "image/png": value2,
      }),
    ]);
    return (await value) !== null ? "copied" : "no-picture";
  } catch {
    let value3: Dynamic = await value;
    if (!value3) return "no-picture";
    try {
      await clipboard.write([
        new ClipboardItem({
          "image/png": value3,
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
  ClipboardPngCopySubscribers_2,
  HttpWwwW3Org1999XlinkValue,
  HttpWwwW3Org2000SvgValue_2,
  HttpWwwW3Org2000XmlnsValue,
  HttpWwwW3OrgXML1998NamespaceValue,
  pngDataUrlToBlob,
  supportsClipboardImages,
  writeClipboardPng,
};
export function installEditorClipboardPngCopy(): () => void {
  return () => {
    HttpWwwW3Org2000SvgValue_2 = "http://www.w3.org/2000/svg";
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
    ClipboardPngCopySubscribers_2 = new Set([
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
