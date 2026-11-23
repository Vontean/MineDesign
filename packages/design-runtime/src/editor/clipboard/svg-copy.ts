/** Restored application module; prepare first, initialize in original order. */
import {
  type Dynamic,
} from "../../runtime-types";
import { injected_svgCapture as injected_svgCapture_r } from "../../dependencies";
import { conversionFailedMessage as genericCopyFailureMessage } from "../accessibility/announcements";
import { ClipboardPngCopyASwitchSet, ClipboardPngCopyDataImagePattern, ClipboardPngCopyPattern, ClipboardPngCopySubscribers, ClipboardPngCopyUrlAttributeSet as svgUrlAttributeNames, HttpWwwW3Org1999XlinkValue, svgNamespaceUriForCopy, HttpWwwW3Org2000XmlnsValue, HttpWwwW3OrgXML1998NamespaceValue } from "./png-copy";
import { describeCaptureFailure } from "../../export/capture-warnings";

function containsSvgExternalResource(cssValue?: Dynamic): Dynamic {
  return (
    cssValue.includes("\\") ||
    /(?:url|image|image-set|src)\s*\(/i.test(
      cssValue.replace(/url\(\s*(['"]?)#[^)]*\1\s*\)/gi, ""),
    )
  );
}
function sanitizeSvgClipboardDom(element?: Dynamic): Dynamic {
  let blankImageCount: Dynamic = 0;
  (element.localName === "title" || element.localName === "desc") &&
    (element.textContent = element.textContent ?? "");
  for (let child of [...element.childNodes] as Dynamic)
    if (child.nodeType === Node.CDATA_SECTION_NODE)
      child.replaceWith(
        element.ownerDocument.createTextNode(child.nodeValue ?? ""),
      );
    else if (child.nodeType === Node.ELEMENT_NODE) {
      let childElement: Dynamic = child;
      if (
        childElement.namespaceURI === svgNamespaceUriForCopy &&
        ClipboardPngCopyASwitchSet.has(childElement.localName)
      ) {
        let groupElement: Dynamic = element.ownerDocument.createElementNS(
          svgNamespaceUriForCopy,
          "g",
        );
        if (childElement.localName === "switch") {
          let switchChildren: Dynamic = [...childElement.children],
            visibleChild: Dynamic =
              switchChildren.find(
                (candidate?: Dynamic): Dynamic =>
                  !candidate.hasAttribute("systemLanguage") &&
                  !candidate.hasAttribute("requiredExtensions") &&
                  !candidate.hasAttribute("requiredFeatures"),
              ) ?? switchChildren[0];
          visibleChild && groupElement.append(visibleChild);
        } else groupElement.append(...childElement.childNodes);
        childElement.replaceWith(groupElement);
        blankImageCount += sanitizeSvgClipboardDom(groupElement);
      } else
        childElement.namespaceURI !== svgNamespaceUriForCopy ||
        !ClipboardPngCopySubscribers.has(childElement.localName)
          ? childElement.remove()
          : (blankImageCount += sanitizeSvgClipboardDom(childElement));
    } else child.nodeType !== Node.TEXT_NODE && child.remove();
  for (let attribute of [...element.attributes] as Dynamic) {
    let localName: Dynamic = attribute.localName,
      lowerName: Dynamic = localName.toLowerCase(),
      isHrefAttribute: Dynamic =
        localName === "href" &&
        (attribute.namespaceURI === null ||
          attribute.namespaceURI === HttpWwwW3Org1999XlinkValue);
    if (
      attribute.namespaceURI === HttpWwwW3Org2000XmlnsValue &&
      (attribute.value === svgNamespaceUriForCopy ||
        attribute.value === HttpWwwW3Org1999XlinkValue)
    )
      continue;
    (((attribute.namespaceURI === null && !attribute.name.includes(":")) ||
      isHrefAttribute ||
      (attribute.namespaceURI === HttpWwwW3OrgXML1998NamespaceValue &&
        localName === "space")) &&
      !/^(on|data-|aria-)/i.test(localName) &&
      lowerName !== "class" &&
      !svgUrlAttributeNames.has(lowerName) &&
      (isHrefAttribute || lowerName !== "href") &&
      !containsSvgExternalResource(attribute.value) &&
      (isHrefAttribute
        ? ClipboardPngCopyPattern.test(attribute.value) ||
          (element.localName === "image" &&
            ClipboardPngCopyDataImagePattern.test(attribute.value))
        : !/^\s*(?:javascript|vbscript|data):/i.test(attribute.value))) ||
      element.removeAttributeNS(attribute.namespaceURI, localName);
  }
  element.localName === "image" &&
    !element.getAttribute("href") &&
    !element.getAttributeNS(HttpWwwW3Org1999XlinkValue, "href") &&
    blankImageCount++;
  return blankImageCount;
}
function sanitizeSvgClipboard(svgText?: Dynamic): Dynamic {
  let svgDocument: Dynamic = new DOMParser().parseFromString(
      svgText,
      "image/svg+xml",
    ),
    documentElement: Dynamic = svgDocument.documentElement;
  if (
    documentElement.namespaceURI !== svgNamespaceUriForCopy ||
    documentElement.localName !== "svg" ||
    svgDocument.getElementsByTagNameNS("*", "parsererror").length > 0
  )
    return null;
  let blankCount: Dynamic = sanitizeSvgClipboardDom(documentElement);
  return {
    svg: new XMLSerializer().serializeToString(documentElement),
    blank: blankCount,
  };
}
function svgClipboardMimeTypes(hostWindow: Dynamic = window): Dynamic {
  let ClipboardItem: Dynamic = hostWindow.ClipboardItem;
  return typeof ClipboardItem?.supports == "function" &&
    ClipboardItem.supports("image/svg+xml")
    ? ["text/plain", "image/svg+xml"]
    : ["text/plain"];
}
function parseSvgCaptureReply(reply?: Dynamic): Dynamic {
  if (typeof reply != "object" || reply === null)
    return {
      ok: false,
      softError: "bad-reply",
    };
  let replyRecord: Dynamic = reply;
  if (replyRecord.e === "no-selection" || replyRecord.e === "zero-size")
    return {
      ok: false,
      softError: replyRecord.e,
    };
  let sanitized: Dynamic =
    typeof replyRecord.s == "string" ? sanitizeSvgClipboard(replyRecord.s) : null;
  return sanitized === null
    ? {
        ok: false,
        softError: "bad-reply",
      }
    : {
        ok: true,
        ...sanitized,
        clipped: replyRecord.clipped === true,
      };
}
async function captureClipboardSvg(
  preview?: Dynamic,
  captureOptions?: Dynamic,
  captureContext: Dynamic = null,
): Promise<Dynamic> {
  let injected_svgCapture: Dynamic = injected_svgCapture_r;
  if (!injected_svgCapture)
    return {
      ok: false,
      softError: "bad-reply",
    };
  let reply: Dynamic = await preview.executeJavaScript(
    "(function(){" +
      injected_svgCapture +
      ";return window.__dcSvgCapture(" +
      JSON.stringify(captureOptions) +
      "," +
      JSON.stringify(captureContext) +
      ");})()",
    15e3,
  );
  return parseSvgCaptureReply(reply);
}
function svgCopyErrorMessage(error?: Dynamic): Dynamic {
  let message: Dynamic = error instanceof Error ? error.message : "";
  return /^(executeJavaScript timed out|preview is blocked)/.test(message)
    ? describeCaptureFailure(error)
    : genericCopyFailureMessage;
}
async function writeClipboardSvg(
  svgPromise?: Dynamic,
  hostWindow: Dynamic = window,
): Promise<Dynamic> {
  let ClipboardItem: Dynamic = hostWindow.ClipboardItem,
    clipboard: Dynamic = hostWindow.navigator.clipboard;
  if (
    typeof ClipboardItem != "function" ||
    typeof clipboard?.write != "function"
  )
    return "refused";
  let svgOrNull: Dynamic = svgPromise.catch((): Dynamic => null),
    blobPromisesByType: Dynamic = Object.fromEntries(
      svgClipboardMimeTypes(hostWindow).map(
        (mimeType?: Dynamic): Dynamic => [
          mimeType,
          svgOrNull.then(
            (svg?: Dynamic): Dynamic =>
              svg === null
                ? Promise.reject(new Error("no picture"))
                : new Blob([svg], {
                    type: mimeType,
                  }),
          ),
        ],
      ),
    );
  for (let blobPromise of Object.values(blobPromisesByType) as Dynamic)
    blobPromise.catch((): Dynamic => {});
  try {
    await clipboard.write([new ClipboardItem(blobPromisesByType)]);
    return (await svgOrNull) !== null ? "copied" : "no-picture";
  } catch {
    let svg: Dynamic = await svgOrNull;
    if (svg === null) return "no-picture";
    try {
      await clipboard.write([
        new ClipboardItem({
          "text/plain": new Blob([svg], {
            type: "text/plain",
          }),
        }),
      ]);
      return "copied";
    } catch {
      return "refused";
    }
  }
}
export {
  captureClipboardSvg,
  containsSvgExternalResource,
  parseSvgCaptureReply,
  sanitizeSvgClipboard,
  sanitizeSvgClipboardDom,
  svgClipboardMimeTypes,
  svgCopyErrorMessage,
  writeClipboardSvg,
};
export function installEditorClipboardSvgCopy(): () => void {
  return () => {};
}
