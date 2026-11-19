import { uiMessage } from '@minedesign/contracts/ui-messages';
/** Restored application module; prepare first, initialize in original order. */
import {
  type Dynamic,
} from "../runtime-types";
import { initializeOnce } from "../module-helpers";

var allowedLinkProtocols: Dynamic;
var mediaSourceTags: Dynamic;
var initializeEditorAttributeValidation: Dynamic;
function normalizeExternalUrl(url?: Dynamic, allowedProtocols?: Dynamic): Dynamic {
  try {
    if (allowedProtocols.includes(new URL(url).protocol)) return url;
    if (!/^[^:/?#]+:\d+(?:[/?#]|$)/.test(url)) return null;
  } catch {}
  let httpsUrl: Dynamic = url.startsWith("//")
    ? "https:" + url
    : "https://" + url;
  try {
    if (new URL(httpsUrl).protocol === "https:") return httpsUrl;
  } catch {}
  return null;
}
function normalizeLinkInput(linkText?: Dynamic): Dynamic {
  let cleanedLink: Dynamic = linkText.replace(/[\t\n\r]/g, "").trim();
  return cleanedLink
    ? cleanedLink.startsWith("#")
      ? cleanedLink
      : normalizeExternalUrl(cleanedLink, allowedLinkProtocols)
    : null;
}
function sanitizeEditableLink(linkText?: Dynamic): Dynamic {
  let cleanedLink: Dynamic = linkText.replace(/[\t\n\r]/g, "").trim();
  if (!cleanedLink) return null;
  if (cleanedLink.startsWith("#")) return cleanedLink;
  try {
    let protocol: Dynamic = new URL(cleanedLink, "https://dc-editor-base.invalid/")
      .protocol;
    return allowedLinkProtocols.includes(protocol) ? cleanedLink : null;
  } catch {
    return null;
  }
}
function sanitizeMediaSource(sourceText?: Dynamic): Dynamic {
  let cleanedSource: Dynamic = sourceText.replace(/[\t\n\r]/g, "").trim();
  if (!cleanedSource || cleanedSource.startsWith("#")) return null;
  try {
    let resolvedUrl: Dynamic = new URL(cleanedSource, "https://dc-editor-base.invalid/");
    return resolvedUrl.protocol === "http:" || resolvedUrl.protocol === "https:"
      ? cleanedSource
      : null;
  } catch {
    return null;
  }
}
function classifyProtectedAttribute(
  attributeKey?: Dynamic,
  tagNames?: Dynamic,
): Dynamic {
  let lowerKey: Dynamic = attributeKey.toLowerCase(),
    lowerTags: Dynamic = tagNames.map(
      (tagName?: Dynamic): Dynamic => (tagName ?? "").toLowerCase(),
    ),
    keyframeMatch: Dynamic = /^@data-keyframes-attr-(.+)$/.exec(lowerKey);
  return keyframeMatch
    ? classifyProtectedAttribute("@" + keyframeMatch[1], tagNames) == null
      ? null
      : "keyframe-track"
    : /^@on/.test(lowerKey)
      ? "handler"
      : lowerKey === "@srcdoc" && lowerTags.includes("iframe")
        ? "srcdoc"
        : (lowerKey === "@src" ||
              lowerKey === "@href" ||
              lowerKey.endsWith(":href")) &&
            lowerTags.includes("script")
          ? "script-src"
          : lowerKey === "@href" || lowerKey.endsWith(":href")
            ? "href"
            : (lowerKey === "@action" && lowerTags.includes("form")) ||
                (lowerKey === "@formaction" &&
                  lowerTags.some(
                    (tagName?: Dynamic): Dynamic =>
                      tagName === "button" || tagName === "input",
                  ))
              ? "action"
              : (lowerKey === "@src" &&
                    lowerTags.some(
                      (tagName?: Dynamic): Dynamic =>
                        mediaSourceTags.has(tagName),
                    )) ||
                  (lowerKey === "@data" &&
                    lowerTags.some(
                      (tagName?: Dynamic): Dynamic =>
                        tagName === "object" || tagName === "embed",
                    ))
                ? "embed-src"
                : null;
}
function isProtectedAttribute(attributeKey?: Dynamic, tagNames?: Dynamic): Dynamic {
  return classifyProtectedAttribute(attributeKey, tagNames) != null;
}
function validateAttributeEdit(
  attributeKey?: Dynamic,
  newValue?: Dynamic,
  tagNames?: Dynamic,
): Dynamic {
  let protectionKind: Dynamic = classifyProtectedAttribute(attributeKey, tagNames);
  if (protectionKind === "handler")
    return {
      ok: false,
      get message() { return uiMessage("inspector.attributeValidation.eventHandlerAttributesAreCodeAndCanTBeEditedHereAskInChatToChangeTheBehaviorInst"); },
    };
  if (protectionKind === "srcdoc")
    return {
      ok: false,
      get message() { return uiMessage("inspector.attributeValidation.srcdocIsAFullHTMLDocumentAndCanTBeEditedHereAskInChatToChangeTheEmbeddedContentI"); },
    };
  if (protectionKind === "script-src")
    return {
      ok: false,
      get message() { return uiMessage("inspector.attributeValidation.aScriptSSourceIsCodeAndCanTBeEditedHereAskInChatToChangeTheScriptInstead"); },
    };
  if (protectionKind === "keyframe-track") {
    let keyframeMatch: Dynamic = /^@data-keyframes-attr-(.+)$/.exec(
      attributeKey.toLowerCase(),
    );
    return validateKeyframeAttributeEdit(
      classifyProtectedAttribute("@" + (keyframeMatch?.[1] ?? ""), tagNames),
      newValue,
    );
  }
  if (protectionKind === "href") {
    let sanitizedLink: Dynamic = sanitizeEditableLink(newValue);
    return sanitizedLink == null
      ? {
          ok: false,
          get message() { return uiMessage("inspector.attributeValidation.thatLinkCanTBeUsedEnterAWebAddressHttpsAProjectPagePathMailtoOrTelLink"); },
        }
      : {
          ok: true,
          value: sanitizedLink,
        };
  }
  if (protectionKind === "action") {
    let sanitizedAction: Dynamic = sanitizeEditableLink(newValue);
    return sanitizedAction == null
      ? {
          ok: false,
          get message() { return uiMessage("inspector.attributeValidation.thatActionCanTBeUsedEnterAWebAddressHttpsAPathMailtoOrTel"); },
        }
      : {
          ok: true,
          value: sanitizedAction,
        };
  }
  if (protectionKind === "embed-src") {
    let sanitizedSource: Dynamic = sanitizeMediaSource(newValue);
    return sanitizedSource == null
      ? {
          ok: false,
          get message() { return uiMessage("inspector.attributeValidation.thatSourceCanTBeUsedEnterAWebAddressHttpsOrAProjectFilePath"); },
        }
      : {
          ok: true,
          value: sanitizedSource,
        };
  }
  return {
    ok: true,
    value: newValue,
  };
}
function validateKeyframeAttributeEdit(
  protectionKind?: Dynamic,
  keyframesJson?: Dynamic,
): Dynamic {
  if (
    protectionKind === "handler" ||
    protectionKind === "srcdoc" ||
    protectionKind === "script-src" ||
    protectionKind === "keyframe-track"
  )
    return {
      ok: false,
      get message() { return uiMessage("inspector.attributeValidation.thisKeyframeTrackTargetsAnAttributeThatCanTBeEditedHereAskInChatInstead"); },
    };
  let keyframes: Dynamic;
  try {
    keyframes = JSON.parse(keyframesJson);
  } catch {
    return {
      ok: false,
      get message() { return uiMessage("inspector.attributeValidation.keyframesMustBeAJSONArrayOfObjects"); },
    };
  }
  for (let keyframe of (Array.isArray(keyframes) ? keyframes : []) as Dynamic) {
    let keyframeValue: Dynamic = keyframe?.v;
    if (typeof keyframeValue != "string" || keyframeValue.includes("{{")) continue;
    if (
      (protectionKind === "embed-src"
        ? sanitizeMediaSource(keyframeValue)
        : sanitizeEditableLink(keyframeValue)) == null
    )
      return {
        ok: false,
        get message() { return uiMessage("inspector.attributeValidation.aKeyframeValueIsnTAUsableURLUseAWebAddressHttpsOrAProjectFilePath"); },
      };
  }
  return {
    ok: true,
    value: keyframesJson,
  };
}
export {
  allowedLinkProtocols,
  classifyProtectedAttribute,
  initializeEditorAttributeValidation,
  isProtectedAttribute,
  mediaSourceTags,
  normalizeExternalUrl,
  normalizeLinkInput,
  sanitizeEditableLink,
  sanitizeMediaSource,
  validateAttributeEdit,
  validateKeyframeAttributeEdit,
};
export function installEditorAttributeValidation(): () => void {
  return () => {
    initializeEditorAttributeValidation = initializeOnce(
      (): Dynamic => {
        "use strict";

        allowedLinkProtocols = ["http:", "https:", "mailto:", "tel:"];
        mediaSourceTags = new Set([
          "iframe",
          "frame",
          "embed",
          "video",
          "source",
        ]);
      },
    );
  };
}
