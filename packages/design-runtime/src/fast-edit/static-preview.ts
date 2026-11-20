/** Restored application module; prepare first, initialize in original order. */
import {
  type Dynamic,
} from "../runtime-types";
import { flattenTemplateValues } from "../editor/clipboard/template-flattening";
import { fromParserHtml } from "../editor/html/authoring";
import { encodeCamelCaseAttributes, kebabToCamelCase, ScCamelValue, toParserHtml } from "../editor/html/tag-normalization";

var FAST_EDIT_ARTBOARD_SECTION_OPEN: Dynamic;
var wrapFastEditTemplate: Dynamic;
var CASE_SENSITIVE_SVG_ATTRIBUTES: Dynamic;
var PLACEHOLDER_SIZE_PATTERN: Dynamic;
var FAST_EDIT_STATIC_PREVIEW_CSS: Dynamic;
function unwrapFastEditSection(sectionHtml?: Dynamic): Dynamic {
  let openingTag: Dynamic = /^<section\b[^>]*>/i.exec(sectionHtml);
  return openingTag === null || !/<\/section>\s*$/i.test(sectionHtml)
    ? null
    : sectionHtml.slice(
        openingTag[0].length,
        /<\/section>\s*$/i.exec(sectionHtml)!.index,
      );
}
function removeTemplateInterpolations(text?: Dynamic): Dynamic {
  let result: Dynamic = "",
    offset: Dynamic = 0;
  for (;;) {
    let value: Dynamic = text.indexOf("{{", offset);
    if (value < 0) break;
    let closingDelimiterIndex: Dynamic = text.indexOf("}}", value + 2);
    if (closingDelimiterIndex < 0) break;
    result += text.slice(offset, value);
    offset = closingDelimiterIndex + 2;
  }
  return result + text.slice(offset);
}
function parseStaticPreviewTemplate(html?: Dynamic): Dynamic {
  let template: Dynamic = (document as Dynamic).createElement("template");
  template.innerHTML = toParserHtml(html);
  return template;
}
function buildStaticFastEditPreview(
  html?: Dynamic,
  defaults?: Dynamic,
): Dynamic {
  let resolvedHtml: Dynamic = html;
  try {
    resolvedHtml = flattenTemplateValues(
      resolvedHtml,
      (key?: Dynamic): Dynamic =>
        Object.prototype.hasOwnProperty.call(defaults, key)
          ? defaults[key]
          : undefined,
    );
  } catch {}
  let template: Dynamic = parseStaticPreviewTemplate(resolvedHtml),
    placeholders: Dynamic = [],
    walk: Dynamic = (element?: Dynamic): Dynamic => {
      for (let descendantNode of Array.from(element.childNodes) as Dynamic) {
        if (descendantNode.nodeType === 3) {
          let textContent: Dynamic = descendantNode.nodeValue ?? "";
          textContent.includes("{{") &&
            (descendantNode.nodeValue = removeTemplateInterpolations(textContent));
          continue;
        }
        if (descendantNode.nodeType !== 1) {
          descendantNode.parentNode?.removeChild(descendantNode);
          continue;
        }
        let currentElement: Dynamic = descendantNode,
          localName: Dynamic = currentElement.localName;
        if (localName === "sc-helmet") {
          for (let childElement of Array.from(currentElement.children) as Dynamic)
            childElement.localName === "style" &&
              placeholders.push(childElement.outerHTML);
          currentElement.remove();
          continue;
        }
        if (
          localName === "script" ||
          localName === "noscript" ||
          localName === "template" ||
          localName === "meta" ||
          localName === "base" ||
          localName === "title" ||
          localName === "iframe" ||
          localName === "object" ||
          localName === "embed"
        ) {
          currentElement.remove();
          continue;
        }
        if (localName === "sc-if") {
          let attributeValue: Dynamic = (
            currentElement.getAttribute("hint-placeholder-val") ?? ""
          ).replace(/[{}\s]/g, "");
          if (attributeValue === "false" || attributeValue === "0" || attributeValue === "null") {
            currentElement.remove();
            continue;
          }
          walk(currentElement);
          currentElement.replaceWith(...Array.from(currentElement.childNodes));
          continue;
        }
        if (localName === "sc-for") {
          let repeatCount: Dynamic = Math.max(
            1,
            Math.min(
              6,
              parseInt(
                currentElement.getAttribute("hint-placeholder-count") ?? "1",
                10,
              ) || 1,
            ),
          );
          walk(currentElement);
          let items: Dynamic = [];
          for (let index: Dynamic = 0; index < repeatCount; index++)
            for (let childNode of Array.from(currentElement.childNodes) as Dynamic)
              items.push(childNode.cloneNode(true));
          currentElement.replaceWith(...items);
          continue;
        }
        if (localName === "dc-import" || localName === "x-import") {
          let placeholderElement: Dynamic = (document as Dynamic).createElement("div");
          placeholderElement.className = "ask-ph";
          let [placeholderWidth, placeholderHeight]: Dynamic = (
            currentElement.getAttribute("hint-size") ?? ""
          )
            .split(",")
            .map((token?: Dynamic): Dynamic => token.trim());
          placeholderElement.setAttribute(
            "style",
            removeTemplateInterpolations(currentElement.getAttribute("style") ?? "") +
              ";width:" +
              (placeholderWidth !== undefined && PLACEHOLDER_SIZE_PATTERN.test(placeholderWidth)
                ? placeholderWidth
                : "100%") +
              ";height:" +
              (placeholderHeight !== undefined && PLACEHOLDER_SIZE_PATTERN.test(placeholderHeight)
                ? placeholderHeight
                : "64px"),
          );
          currentElement.replaceWith(placeholderElement);
          continue;
        }
        let isSvgElement: Dynamic =
          currentElement.namespaceURI === "http://www.w3.org/2000/svg";
        for (let attribute of Array.from(currentElement.attributes) as Dynamic) {
          let attributeName: Dynamic = attribute.name.startsWith(ScCamelValue)
              ? kebabToCamelCase(
                  attribute.name.slice(ScCamelValue.length),
                )
              : attribute.name,
            normalizedName: Dynamic = attributeName.toLowerCase();
          if (
            normalizedName.startsWith("on") ||
            normalizedName.startsWith("style-") ||
            normalizedName.startsWith("hint-") ||
            normalizedName.startsWith("sc-") ||
            normalizedName === "srcdoc" ||
            normalizedName === "contenteditable" ||
            normalizedName === "autofocus"
          ) {
            currentElement.removeAttribute(attribute.name);
            continue;
          }
          let attributeText: Dynamic = attribute.value;
          if (attributeText.includes("{{"))
            if (normalizedName === "style")
              attributeText = attributeText
                .split(";")
                .filter((attributeValue?: Dynamic): Dynamic => !attributeValue.includes("{{"))
                .join(";");
            else {
              currentElement.removeAttribute(attribute.name);
              continue;
            }
          let outputAttributeName: Dynamic =
            attribute.name.startsWith(ScCamelValue) &&
            !(isSvgElement && CASE_SENSITIVE_SVG_ATTRIBUTES.has(attributeName))
              ? attributeName === "className"
                ? "class"
                : attributeName === "htmlFor"
                  ? "for"
                  : attribute.name.slice(ScCamelValue.length)
              : attribute.name;
          if (outputAttributeName !== attribute.name) {
            currentElement.removeAttribute(attribute.name);
            try {
              currentElement.setAttribute(outputAttributeName, attributeText);
            } catch {}
          } else
            attributeText !== attribute.value &&
              currentElement.setAttribute(attribute.name, attributeText);
        }
        walk(currentElement);
      }
    };
  walk(template.content);
  let value: Dynamic = fromParserHtml(template.innerHTML);
  return (
    '<!doctype html><html><head><meta charset="utf-8"><style>' +
    FAST_EDIT_STATIC_PREVIEW_CSS +
    "</style>" +
    placeholders.join("") +
    "</head><body>" +
    value +
    "</body></html>"
  );
}
export {
  buildStaticFastEditPreview,
  CASE_SENSITIVE_SVG_ATTRIBUTES,
  FAST_EDIT_ARTBOARD_SECTION_OPEN,
  FAST_EDIT_STATIC_PREVIEW_CSS,
  parseStaticPreviewTemplate,
  PLACEHOLDER_SIZE_PATTERN,
  removeTemplateInterpolations,
  unwrapFastEditSection,
  wrapFastEditTemplate,
};
export function installFastEditStaticPreview(): () => void {
  return () => {
    FAST_EDIT_ARTBOARD_SECTION_OPEN = '<section id="artboard">';
    wrapFastEditTemplate = (templateHtml?: Dynamic): Dynamic =>
      FAST_EDIT_ARTBOARD_SECTION_OPEN +
      encodeCamelCaseAttributes(templateHtml) +
      "</section>";
    CASE_SENSITIVE_SVG_ATTRIBUTES = new Set([
      "viewBox",
      "preserveAspectRatio",
      "gradientUnits",
      "gradientTransform",
      "patternUnits",
      "patternTransform",
      "patternContentUnits",
      "clipPathUnits",
      "maskUnits",
      "maskContentUnits",
      "markerWidth",
      "markerHeight",
      "markerUnits",
      "refX",
      "refY",
      "stdDeviation",
      "spreadMethod",
      "startOffset",
      "textLength",
      "lengthAdjust",
      "pathLength",
      "filterUnits",
      "primitiveUnits",
      "baseFrequency",
      "numOctaves",
      "tableValues",
      "kernelMatrix",
      "attributeName",
    ]);
    PLACEHOLDER_SIZE_PATTERN = /^\d{1,4}(?:\.\d{1,2})?(?:px|%)$/;
    FAST_EDIT_STATIC_PREVIEW_CSS =
      "html,body{margin:0}img,video{background:#e8e6e1}.ask-ph{box-sizing:border-box;display:inline-block;min-width:24px;min-height:24px;border-radius:8px;background:rgba(127,127,127,.14);outline:1px dashed rgba(127,127,127,.45);outline-offset:-1px}";
  };
}
