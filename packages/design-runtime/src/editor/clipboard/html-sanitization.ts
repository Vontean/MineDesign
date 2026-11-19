/** Restored application module; prepare first, initialize in original order. */
import {
  type Dynamic,
} from "../../runtime-types";
import { isUnsafeCssProperty } from "../css/declarations";
import { escapeHtml } from "../html/escaping";

var ClipboardHtmlSanitizationSubscribers: Dynamic;
var ClipboardHtmlSanitizationSrcdocContenteditableFormactionSet: Dynamic;
var urlAttributeNames: Dynamic;
var ClipboardHtmlSanitizationAnimateSetAnimatemotionSet: Dynamic;
var ClipboardHtmlSanitizationDataKeyframesDataDcDataOmValues: Dynamic;
var ClipboardHtmlSanitizationSome: Dynamic;
var ClipboardHtmlSanitizationDataKeyframesAttrPattern: Dynamic;
var ClipboardHtmlSanitizationDynsrcLowsrcUsemapSet: Dynamic;
var ClipboardHtmlSanitizationExpressionMozBindingPattern: Dynamic;
var ClipboardHtmlSanitizationAZPattern: Dynamic;
var unsafeCssPatternWithoutTemplates: Dynamic;
var ClipboardHtmlSanitizationScriptDataDcScriptPattern: Dynamic;
function isSafePastedTag(tagName?: Dynamic): Dynamic {
  let normalizedTag: Dynamic = tagName.trim().toLowerCase();
  if (!/^[a-z][a-z0-9:-]*$/.test(normalizedTag)) return false;
  let localName: Dynamic = normalizedTag.slice(normalizedTag.lastIndexOf(":") + 1);
  if (localName === "") return false;
  for (let name of (localName === normalizedTag
    ? [normalizedTag]
    : [normalizedTag, localName]) as Dynamic)
    if (
      name.startsWith("on") ||
      ClipboardHtmlSanitizationSome(name) ||
      ClipboardHtmlSanitizationSrcdocContenteditableFormactionSet.has(
        name,
      ) ||
      urlAttributeNames.has(name) ||
      name === "srcset" ||
      name === "is" ||
      name === "attributename" ||
      name.startsWith("style") ||
      name.startsWith("sc-") ||
      ClipboardHtmlSanitizationScriptDataDcScriptPattern.test(name)
    )
      return false;
  return true;
}
function isUnsafePastedAttribute(attributeName?: Dynamic): Dynamic {
  return !/^[a-z][a-z0-9-]*$/.test(attributeName) ||
    attributeName.startsWith("on") ||
    attributeName.startsWith("sc-") ||
    ClipboardHtmlSanitizationSome(attributeName) ||
    attributeName.startsWith("style") ||
    attributeName === "is" ||
    ClipboardHtmlSanitizationSrcdocContenteditableFormactionSet.has(attributeName) ||
    ClipboardHtmlSanitizationDynsrcLowsrcUsemapSet.has(attributeName)
    ? false
    : attributeName !== "attributename";
}
function isSafePastedProtocol(url?: Dynamic, allowDataImage?: Dynamic): Dynamic {
  let protocolMatch: Dynamic = /^([a-z][a-z0-9+.-]*):/.exec(url);
  if (!protocolMatch) return true;
  let protocol: Dynamic = protocolMatch[1];
  return protocol === "http" ||
    protocol === "https" ||
    protocol === "mailto" ||
    protocol === "tel"
    ? true
    : protocol === "data"
      ? allowDataImage && url.startsWith("data:image/")
      : false;
}
function isSafePastedUrl(url?: Dynamic, allowDataImage: Dynamic = false): Dynamic {
  let compactUrl: Dynamic = url.replace(/[\u0000-\u0020]/g, "").toLowerCase(),
    delimiterIndex: Dynamic = compactUrl.search(/[:/?#]/);
  return (delimiterIndex === -1 ? compactUrl : compactUrl.slice(0, delimiterIndex)).includes("{{")
    ? false
    : isSafePastedProtocol(compactUrl, allowDataImage);
}
function isSafePastedSrcset(srcset?: Dynamic): Dynamic {
  return srcset
    .split(",")
    .map((candidate?: Dynamic): Dynamic => candidate.trim().split(/\s+/)[0] ?? "")
    .every(
      (candidate?: Dynamic): Dynamic =>
        candidate === "" || isSafePastedUrl(candidate, true),
    );
}
function removeCssStrings(css?: Dynamic): Dynamic {
  return css.replace(
    /\\[\s\S]|"(?:\\[\s\S]|[^"\\\n\r\f])*"|'(?:\\[\s\S]|[^'\\\n\r\f])*'/g,
    (token?: Dynamic): Dynamic => (token[0] === "\\" ? token : ""),
  );
}
function decodeCssEscapes(css?: Dynamic): Dynamic {
  return css.replace(
    /\\([0-9a-fA-F]{1,6})[ \t\n\r\f]?|\\([\s\S])|\\$/g,
    (match?: Dynamic, hexCode?: Dynamic, escapedChar?: Dynamic): Dynamic => {
      if (hexCode !== undefined) {
        let codePoint: Dynamic = parseInt(hexCode, 16);
        return codePoint > 0 &&
          codePoint <= 1114111 &&
          !(codePoint >= 55296 && codePoint <= 57343)
          ? String.fromCodePoint(codePoint)
          : "\uFFFD";
      }
      return escapedChar ?? "\uFFFD";
    },
  );
}
function splitSafeCssDeclarations(css?: Dynamic): Dynamic {
  let declarations: Dynamic = [],
    parenDepth: Dynamic = 0,
    quote: Dynamic = "",
    current: Dynamic = "",
    isEscaped: Dynamic = false;
  for (let char of css as Dynamic) {
    if (quote) {
      isEscaped
        ? (isEscaped = false)
        : char === "\\"
          ? (isEscaped = true)
          : char === quote && (quote = "");
      current += char;
      continue;
    }
    char === '"' || char === "'"
      ? (quote = char)
      : char === "("
        ? (parenDepth += 1)
        : char === ")" && (parenDepth = Math.max(0, parenDepth - 1));
    char === ";" && parenDepth === 0
      ? (declarations.push(current), (current = ""))
      : (current += char);
  }
  declarations.push(current);
  return declarations;
}
function isSafeStyleAttribute(attributeName?: Dynamic): Dynamic {
  return (
    /^style-[a-z][a-z-]*$/.test(attributeName) &&
    !ClipboardHtmlSanitizationScriptDataDcScriptPattern.test(attributeName)
  );
}
function sanitizePastedStyle(style?: Dynamic): Dynamic {
  if (style.length > 8192) return null;
  let trimmedStyle: Dynamic = style.trim();
  if (
    /^\{\{[^{}<>'"]*\}\}$/.test(trimmedStyle) &&
    !ClipboardHtmlSanitizationScriptDataDcScriptPattern.test(trimmedStyle)
  )
    return style;
  let safeDeclarations: Dynamic = [];
  for (let rawDeclaration of splitSafeCssDeclarations(style) as Dynamic) {
    let declaration: Dynamic = rawDeclaration.trim();
    if (!declaration) continue;
    let colonIndex: Dynamic = declaration.indexOf(":");
    if (colonIndex <= 0) continue;
    let property: Dynamic = declaration.slice(0, colonIndex).trim(),
      cssValue: Dynamic = declaration.slice(colonIndex + 1).trim();
    if (
      !/^(?:--[A-Za-z0-9_-]+|-?[A-Za-z][A-Za-z0-9-]*)$/.test(property) ||
      isUnsafeCssProperty(property) ||
      ClipboardHtmlSanitizationScriptDataDcScriptPattern.test(property) ||
      ClipboardHtmlSanitizationScriptDataDcScriptPattern.test(cssValue) ||
      /\\$/.test(cssValue) ||
      /\\[0-9a-fA-F]{0,6}\{\{/.test(cssValue)
    )
      continue;
    let valueWithoutTemplates: Dynamic = cssValue.replace(/\{\{[^{}<>'"]*\}\}/g, "0");
    ClipboardHtmlSanitizationExpressionMozBindingPattern.test(
      decodeCssEscapes(valueWithoutTemplates).replace(/[\u0000\t\n\r\f]/g, ""),
    ) ||
      ClipboardHtmlSanitizationAZPattern.test(
        decodeCssEscapes(removeCssStrings(valueWithoutTemplates)).replace(
          /[\u0000\t\n\r\f]/g,
          "",
        ),
      ) ||
      unsafeCssPatternWithoutTemplates.test(
        decodeCssEscapes(cssValue.replace(/\{\{[^{}<>'"]*\}\}/g, "")).replace(
          /[\u0000\t\n\r\f]/g,
          "",
        ),
      ) ||
      (cssValue.length !== 0 && safeDeclarations.push(property + ": " + cssValue));
  }
  return safeDeclarations.length > 0 ? safeDeclarations.join("; ") : null;
}
function isPastedStylePreserved(style?: Dynamic): Dynamic {
  let declarationCount: Dynamic = splitSafeCssDeclarations(style).filter(
      (declaration?: Dynamic): Dynamic => declaration.trim() !== "",
    ).length,
    sanitizedStyle: Dynamic = sanitizePastedStyle(style);
  return sanitizedStyle == null
    ? declarationCount === 0
    : splitSafeCssDeclarations(sanitizedStyle).length === declarationCount;
}
function getNativeDomAccessor(node?: Dynamic, memberName?: Dynamic): Dynamic {
  let prototype: Dynamic = Object.getPrototypeOf(node);
  for (; prototype; ) {
    let descriptor: Dynamic = Object.getOwnPropertyDescriptor(prototype, memberName);
    if (descriptor?.get) {
      let getter: Dynamic = descriptor.get;
      return (target?: Dynamic): Dynamic => getter.call(target);
    }
    if (descriptor && typeof descriptor.value == "function") {
      let method: Dynamic = descriptor.value;
      return (target?: Dynamic, ...args: Dynamic[]): Dynamic =>
        method.call(target, ...args);
    }
    prototype = Object.getPrototypeOf(prototype);
  }
  return (target?: Dynamic, ...args: Dynamic[]): Dynamic => {
    let member: Dynamic = target[memberName];
    return typeof member == "function"
      ? member.apply(target, args)
      : member;
  };
}
function createNativeDomAccessors(node?: Dynamic): Dynamic {
  let accessorFor: Dynamic = (memberName?: Dynamic): Dynamic =>
    getNativeDomAccessor(node, memberName);
  return {
    tagName: accessorFor("tagName"),
    attributes: accessorFor("attributes"),
    children: accessorFor("children"),
    childNodes: accessorFor("childNodes"),
    nodeType: accessorFor("nodeType"),
    getAttribute: accessorFor("getAttribute"),
    removeChild: accessorFor("removeChild"),
    setAttribute: accessorFor("setAttribute"),
    removeAttribute: accessorFor("removeAttribute"),
    remove: accessorFor("remove"),
  };
}
function sanitizePastedDom(parent?: Dynamic, accessors?: Dynamic): Dynamic {
  for (let child of Array.from(accessors.childNodes(parent)) as Dynamic)
    accessors.nodeType(child) === 8 && accessors.removeChild(parent, child);
  for (let element of Array.from(accessors.children(parent)) as Dynamic) {
    let tagName: Dynamic = accessors.tagName(element).toLowerCase(),
      rawTagName: Dynamic = tagName.startsWith("sc-raw-")
        ? tagName.slice(7)
        : tagName;
    if (
      tagName.includes(":") ||
      ClipboardHtmlSanitizationSubscribers.has(tagName) ||
      ClipboardHtmlSanitizationSubscribers.has(rawTagName)
    ) {
      accessors.remove(element);
      continue;
    }
    if (
      ClipboardHtmlSanitizationScriptDataDcScriptPattern.test("<" + tagName)
    ) {
      accessors.remove(element);
      continue;
    }
    if (
      (ClipboardHtmlSanitizationAnimateSetAnimatemotionSet.has(tagName) ||
        ClipboardHtmlSanitizationAnimateSetAnimatemotionSet.has(rawTagName)) &&
      Array.from(accessors.attributes(element))
        .filter(
          (attribute?: Dynamic): Dynamic =>
            attribute.name.toLowerCase() === "attributename",
        )
        .some((attribute?: Dynamic): Dynamic => !isSafePastedTag(attribute.value))
    ) {
      accessors.remove(element);
      continue;
    }
    for (let attribute of Array.from(accessors.attributes(element)) as Dynamic) {
      let attributeName: Dynamic = attribute.name.toLowerCase();
      if (attributeName === "is") {
        accessors.remove(element);
        break;
      }
      if (
        attributeName.startsWith("on") ||
        ClipboardHtmlSanitizationSrcdocContenteditableFormactionSet.has(
          attributeName,
        )
      ) {
        accessors.removeAttribute(element, attribute.name);
        continue;
      }
      if (attributeName.startsWith("sc-")) {
        accessors.removeAttribute(element, attribute.name);
        continue;
      }
      let keyframesMatch: Dynamic =
        ClipboardHtmlSanitizationDataKeyframesAttrPattern.exec(attributeName);
      if (keyframesMatch != null && !isUnsafePastedAttribute(keyframesMatch[1] ?? "")) {
        accessors.removeAttribute(element, attribute.name);
        continue;
      }
      if (attributeName.startsWith("style-")) {
        if (!isSafeStyleAttribute(attributeName)) {
          accessors.removeAttribute(element, attribute.name);
          continue;
        }
        let sanitizedStyle: Dynamic = sanitizePastedStyle(attribute.value);
        sanitizedStyle == null
          ? accessors.removeAttribute(element, attribute.name)
          : sanitizedStyle !== attribute.value &&
            accessors.setAttribute(element, attribute.name, sanitizedStyle);
        continue;
      }
      if (attributeName === "style") {
        let sanitizedStyle: Dynamic = sanitizePastedStyle(attribute.value);
        sanitizedStyle == null
          ? accessors.removeAttribute(element, attribute.name)
          : sanitizedStyle !== attribute.value &&
            accessors.setAttribute(element, attribute.name, sanitizedStyle);
        continue;
      }
      let allowDataImage: Dynamic =
        attributeName === "src" ||
        attributeName === "poster" ||
        ((attributeName === "href" || attributeName === "xlink:href") &&
          (tagName === "image" || tagName === "feimage"));
      if (
        urlAttributeNames.has(attributeName) &&
        !isSafePastedUrl(attribute.value, allowDataImage)
      ) {
        accessors.removeAttribute(element, attribute.name);
        continue;
      }
      if (attributeName === "srcset" && !isSafePastedSrcset(attribute.value)) {
        accessors.removeAttribute(element, attribute.name);
        continue;
      }
      (ClipboardHtmlSanitizationScriptDataDcScriptPattern.test(
        attribute.value,
      ) ||
        ClipboardHtmlSanitizationScriptDataDcScriptPattern.test(attributeName)) &&
        accessors.removeAttribute(element, attribute.name);
    }
    sanitizePastedDom(element, accessors);
  }
}
function sanitizePastedHtml(html?: Dynamic): Dynamic {
  if (typeof DOMParser === "undefined") return escapeHtml(html);
  let currentHtml: Dynamic = html;
  for (let index: Dynamic = 0; index < 2; index++) {
    let parsedDocument: Dynamic = new DOMParser().parseFromString(currentHtml, "text/html");
    sanitizePastedDom(parsedDocument.body, createNativeDomAccessors(parsedDocument.body));
    currentHtml = parsedDocument.body.innerHTML;
  }
  return currentHtml;
}
export {
  ClipboardHtmlSanitizationAnimateSetAnimatemotionSet,
  ClipboardHtmlSanitizationAZPattern,
  ClipboardHtmlSanitizationDataKeyframesAttrPattern,
  ClipboardHtmlSanitizationDataKeyframesDataDcDataOmValues,
  ClipboardHtmlSanitizationDynsrcLowsrcUsemapSet,
  ClipboardHtmlSanitizationExpressionMozBindingPattern,
  unsafeCssPatternWithoutTemplates as ClipboardHtmlSanitizationExpressionMozBindingPattern_2,
  ClipboardHtmlSanitizationScriptDataDcScriptPattern,
  ClipboardHtmlSanitizationSome,
  ClipboardHtmlSanitizationSrcdocContenteditableFormactionSet,
  ClipboardHtmlSanitizationSubscribers,
  urlAttributeNames as ClipboardHtmlSanitizationSubscribers_2,
  createNativeDomAccessors,
  decodeCssEscapes,
  getNativeDomAccessor,
  isPastedStylePreserved,
  isSafePastedProtocol,
  isSafePastedSrcset,
  isSafePastedTag,
  isSafePastedUrl,
  isSafeStyleAttribute,
  isUnsafePastedAttribute,
  removeCssStrings,
  sanitizePastedDom,
  sanitizePastedHtml,
  sanitizePastedStyle,
  splitSafeCssDeclarations,
};
export function installEditorClipboardHtmlSanitization(): () => void {
  return () => {
    ClipboardHtmlSanitizationSubscribers = new Set([
      "script",
      "style",
      "link",
      "meta",
      "base",
      "iframe",
      "frame",
      "frameset",
      "portal",
      "embed",
      "object",
      "applet",
      "noembed",
      "noscript",
      "noframes",
      "plaintext",
      "xmp",
      "template",
      "foreignobject",
      "math",
      "annotation-xml",
      "head",
      "title",
      "x-import",
      "dc-import",
      "helmet",
      "sc-helmet",
    ]);
    ClipboardHtmlSanitizationSrcdocContenteditableFormactionSet = new Set([
      "srcdoc",
      "contenteditable",
      "formaction",
      "ping",
    ]);
    urlAttributeNames = new Set([
      "href",
      "xlink:href",
      "src",
      "action",
      "poster",
      "data",
      "cite",
      "background",
      "dynsrc",
      "lowsrc",
      "longdesc",
      "usemap",
    ]);
    ClipboardHtmlSanitizationAnimateSetAnimatemotionSet = new Set([
      "animate",
      "set",
      "animatemotion",
      "animatetransform",
      "animatecolor",
    ]);
    ClipboardHtmlSanitizationDataKeyframesDataDcDataOmValues = [
      "data-keyframes-",
      "data-dc-",
      "data-om-",
      "data-dm-",
      "data-react-",
    ];
    ClipboardHtmlSanitizationSome = (attributeName?: Dynamic): Dynamic =>
      ClipboardHtmlSanitizationDataKeyframesDataDcDataOmValues.some(
        (prefix?: Dynamic): Dynamic => attributeName.startsWith(prefix),
      );
    ClipboardHtmlSanitizationDataKeyframesAttrPattern =
      /^data-keyframes-attr-(.*)$/;
    ClipboardHtmlSanitizationDynsrcLowsrcUsemapSet = new Set([
      "dynsrc",
      "lowsrc",
      "usemap",
    ]);
    ClipboardHtmlSanitizationExpressionMozBindingPattern =
      /[<>{}\\]|\/\*|expression\s*\(|-moz-binding|behavior\s*:|javascript\s*:/i;
    ClipboardHtmlSanitizationAZPattern = /@[a-z-]/i;
    unsafeCssPatternWithoutTemplates =
      /[<>{}\\]|\/\*|expression\s*\(|-moz-binding|behavior\s*:|javascript\s*:/i;
    ClipboardHtmlSanitizationScriptDataDcScriptPattern =
      /<\/?script|data-dc-script|<\/?x-dc|<\!--/i;
  };
}
