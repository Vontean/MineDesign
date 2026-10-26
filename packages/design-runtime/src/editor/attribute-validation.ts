import { uiMessage } from '@minedesign/contracts/ui-messages';
/** Restored application module; prepare first, initialize in original order. */
import {
  bindRuntimeValue,
  type Dynamic,
  type RuntimeBindings,
} from "../runtime-types";

export function installEditorAttributeValidation(
  runtime: RuntimeBindings,
): () => void {
  var allowedLinkProtocols: Dynamic;
  var mediaSourceTags: Dynamic;
  var initializeEditorAttributeValidation: Dynamic;
  function normalizeExternalUrl(input?: Dynamic, options?: Dynamic): Dynamic {
    try {
      if (options.includes(new URL(input).protocol)) return input;
      if (!/^[^:/?#]+:\d+(?:[/?#]|$)/.test(input)) return null;
    } catch {}
    let value: Dynamic = input.startsWith("//")
      ? "https:" + input
      : "https://" + input;
    try {
      if (new URL(value).protocol === "https:") return value;
    } catch {}
    return null;
  }
  function normalizeLinkInput(input?: Dynamic): Dynamic {
    let value: Dynamic = input.replace(/[\t\n\r]/g, "").trim();
    return value
      ? value.startsWith("#")
        ? value
        : normalizeExternalUrl(value, allowedLinkProtocols)
      : null;
  }
  function sanitizeEditableLink(input?: Dynamic): Dynamic {
    let value: Dynamic = input.replace(/[\t\n\r]/g, "").trim();
    if (!value) return null;
    if (value.startsWith("#")) return value;
    try {
      let protocol: Dynamic = new URL(value, "https://dc-editor-base.invalid/")
        .protocol;
      return allowedLinkProtocols.includes(protocol) ? value : null;
    } catch {
      return null;
    }
  }
  function sanitizeMediaSource(input?: Dynamic): Dynamic {
    let value: Dynamic = input.replace(/[\t\n\r]/g, "").trim();
    if (!value || value.startsWith("#")) return null;
    try {
      let value2: Dynamic = new URL(value, "https://dc-editor-base.invalid/");
      return value2.protocol === "http:" || value2.protocol === "https:"
        ? value
        : null;
    } catch {
      return null;
    }
  }
  function classifyProtectedAttribute(
    input?: Dynamic,
    options?: Dynamic,
  ): Dynamic {
    let value: Dynamic = input.toLowerCase(),
      value2: Dynamic = options.map(
        (input2?: Dynamic): Dynamic => (input2 ?? "").toLowerCase(),
      ),
      value3: Dynamic = /^@data-keyframes-attr-(.+)$/.exec(value);
    return value3
      ? classifyProtectedAttribute("@" + value3[1], options) == null
        ? null
        : "keyframe-track"
      : /^@on/.test(value)
        ? "handler"
        : value === "@srcdoc" && value2.includes("iframe")
          ? "srcdoc"
          : (value === "@src" ||
                value === "@href" ||
                value.endsWith(":href")) &&
              value2.includes("script")
            ? "script-src"
            : value === "@href" || value.endsWith(":href")
              ? "href"
              : (value === "@action" && value2.includes("form")) ||
                  (value === "@formaction" &&
                    value2.some(
                      (input2?: Dynamic): Dynamic =>
                        input2 === "button" || input2 === "input",
                    ))
                ? "action"
                : (value === "@src" &&
                      value2.some(
                        (input2?: Dynamic): Dynamic =>
                          mediaSourceTags.has(input2),
                      )) ||
                    (value === "@data" &&
                      value2.some(
                        (input2?: Dynamic): Dynamic =>
                          input2 === "object" || input2 === "embed",
                      ))
                  ? "embed-src"
                  : null;
  }
  function isProtectedAttribute(input?: Dynamic, options?: Dynamic): Dynamic {
    return classifyProtectedAttribute(input, options) != null;
  }
  function validateAttributeEdit(
    input?: Dynamic,
    options?: Dynamic,
    context?: Dynamic,
  ): Dynamic {
    let value: Dynamic = classifyProtectedAttribute(input, context);
    if (value === "handler")
      return {
        ok: false,
        get message() { return uiMessage("inspector.attributeValidation.eventHandlerAttributesAreCodeAndCanTBeEditedHereAskInChatToChangeTheBehaviorInst"); },
      };
    if (value === "srcdoc")
      return {
        ok: false,
        get message() { return uiMessage("inspector.attributeValidation.srcdocIsAFullHTMLDocumentAndCanTBeEditedHereAskInChatToChangeTheEmbeddedContentI"); },
      };
    if (value === "script-src")
      return {
        ok: false,
        get message() { return uiMessage("inspector.attributeValidation.aScriptSSourceIsCodeAndCanTBeEditedHereAskInChatToChangeTheScriptInstead"); },
      };
    if (value === "keyframe-track") {
      let value2: Dynamic = /^@data-keyframes-attr-(.+)$/.exec(
        input.toLowerCase(),
      );
      return validateKeyframeAttributeEdit(
        classifyProtectedAttribute("@" + (value2?.[1] ?? ""), context),
        options,
      );
    }
    if (value === "href") {
      let value2: Dynamic = sanitizeEditableLink(options);
      return value2 == null
        ? {
            ok: false,
            get message() { return uiMessage("inspector.attributeValidation.thatLinkCanTBeUsedEnterAWebAddressHttpsAProjectPagePathMailtoOrTelLink"); },
          }
        : {
            ok: true,
            value: value2,
          };
    }
    if (value === "action") {
      let value2: Dynamic = sanitizeEditableLink(options);
      return value2 == null
        ? {
            ok: false,
            get message() { return uiMessage("inspector.attributeValidation.thatActionCanTBeUsedEnterAWebAddressHttpsAPathMailtoOrTel"); },
          }
        : {
            ok: true,
            value: value2,
          };
    }
    if (value === "embed-src") {
      let value2: Dynamic = sanitizeMediaSource(options);
      return value2 == null
        ? {
            ok: false,
            get message() { return uiMessage("inspector.attributeValidation.thatSourceCanTBeUsedEnterAWebAddressHttpsOrAProjectFilePath"); },
          }
        : {
            ok: true,
            value: value2,
          };
    }
    return {
      ok: true,
      value: options,
    };
  }
  function validateKeyframeAttributeEdit(
    input?: Dynamic,
    options?: Dynamic,
  ): Dynamic {
    if (
      input === "handler" ||
      input === "srcdoc" ||
      input === "script-src" ||
      input === "keyframe-track"
    )
      return {
        ok: false,
        get message() { return uiMessage("inspector.attributeValidation.thisKeyframeTrackTargetsAnAttributeThatCanTBeEditedHereAskInChatInstead"); },
      };
    let value: Dynamic;
    try {
      value = JSON.parse(options);
    } catch {
      return {
        ok: false,
        get message() { return uiMessage("inspector.attributeValidation.keyframesMustBeAJSONArrayOfObjects"); },
      };
    }
    for (let value2 of (Array.isArray(value) ? value : []) as Dynamic) {
      let value3: Dynamic = value2?.v;
      if (typeof value3 != "string" || value3.includes("{{")) continue;
      if (
        (input === "embed-src"
          ? sanitizeMediaSource(value3)
          : sanitizeEditableLink(value3)) == null
      )
        return {
          ok: false,
          get message() { return uiMessage("inspector.attributeValidation.aKeyframeValueIsnTAUsableURLUseAWebAddressHttpsOrAProjectFilePath"); },
        };
    }
    return {
      ok: true,
      value: options,
    };
  }
  bindRuntimeValue(runtime, "normalizeExternalUrl", () => normalizeExternalUrl);
  bindRuntimeValue(runtime, "normalizeLinkInput", () => normalizeLinkInput);
  bindRuntimeValue(runtime, "sanitizeEditableLink", () => sanitizeEditableLink);
  bindRuntimeValue(runtime, "sanitizeMediaSource", () => sanitizeMediaSource);
  bindRuntimeValue(
    runtime,
    "classifyProtectedAttribute",
    () => classifyProtectedAttribute,
  );
  bindRuntimeValue(runtime, "isProtectedAttribute", () => isProtectedAttribute);
  bindRuntimeValue(
    runtime,
    "validateAttributeEdit",
    () => validateAttributeEdit,
  );
  bindRuntimeValue(
    runtime,
    "validateKeyframeAttributeEdit",
    () => validateKeyframeAttributeEdit,
  );
  bindRuntimeValue(
    runtime,
    "allowedLinkProtocols",
    () => allowedLinkProtocols,
    (value) => {
      allowedLinkProtocols = value;
    },
  );
  bindRuntimeValue(
    runtime,
    "mediaSourceTags",
    () => mediaSourceTags,
    (value) => {
      mediaSourceTags = value;
    },
  );
  bindRuntimeValue(
    runtime,
    "initializeEditorAttributeValidation",
    () => initializeEditorAttributeValidation,
    (value) => {
      initializeEditorAttributeValidation = value;
    },
  );
  return () => {
    initializeEditorAttributeValidation = (0, runtime.initializeOnce)(
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
