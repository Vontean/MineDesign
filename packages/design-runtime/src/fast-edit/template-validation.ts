import { uiMessage } from '@minedesign/contracts/ui-messages';
/** Restored application module; prepare first, initialize in original order. */
import {
  type Dynamic,
} from "../runtime-types";
import { fromParserHtml } from "../editor/html/authoring";
import { parseDcHtmlDocument, replaceDcTemplate } from "../editor/html/dc-document";
import { findForbiddenTemplateTag, getDcPropsJson } from "../editor/html/dc-props";
import { camelToKebabCss, kebabToCamelCase, ScCamelValue, toParserHtml } from "../editor/html/tag-normalization";

var MAX_FAST_EDIT_TEMPLATE_CHARS: Dynamic;
var MAX_FAST_EDIT_TEMPLATE_ELEMENTS: Dynamic;
var MAX_FAST_EDIT_TEMPLATE_DEPTH: Dynamic;
var serializeFastEditTemplate: Dynamic;
var fastEditTemplateFailure: Dynamic;
var TEMPLATE_ELEMENT_ID_PATTERN: Dynamic;
var validateTemplateElementId: Dynamic;
var TEMPLATE_XML_NAME_PATTERN: Dynamic;
var FORBIDDEN_TEMPLATE_ATTRIBUTE_NAMES: Dynamic;
var VOID_TEMPLATE_ELEMENTS: Dynamic;
var FORBIDDEN_TEMPLATE_TAGS: Dynamic;
var SAFE_TEMPLATE_STATE_ATTRIBUTES: Dynamic;
var MULTICOLUMN_PROPERTY_PATTERN: Dynamic;
var hasColumnLayout: Dynamic;
var checkTemplateClosingTags: Dynamic;
function splitCssDeclarations_2(style?: Dynamic): Dynamic {
  let declarations: Dynamic = [],
    declaration: Dynamic = "",
    parenthesisDepth: Dynamic = 0,
    quote: Dynamic = "";
  for (let value of String(style ?? "") as Dynamic) {
    if (quote !== "") {
      value === quote && (quote = "");
      declaration += value;
      continue;
    }
    if (value === '"' || value === "'") {
      quote = value;
      declaration += value;
      continue;
    }
    value === "("
      ? (parenthesisDepth += 1)
      : value === ")" &&
        (parenthesisDepth = Math.max(0, parenthesisDepth - 1));
    if (value === ";" && parenthesisDepth === 0) {
      declaration.trim() !== "" && declarations.push(declaration.trim());
      declaration = "";
      continue;
    }
    declaration += value;
  }
  declaration.trim() !== "" && declarations.push(declaration.trim());
  return declarations;
}
function parseFastEditTemplate(html?: Dynamic): Dynamic {
  let template: Dynamic = (document as Dynamic).createElement("template");
  template.innerHTML = toParserHtml(html);
  return template;
}
function findForbiddenTemplateMarkup(html?: Dynamic): Dynamic {
  let forbiddenMarkup: Dynamic =
    findForbiddenTemplateTag(html) ??
    (/<\/?x-dc/i.test(html)
      ? "<x-dc>"
      : /<noscript/i.test(html)
        ? "<noscript>"
        : null);
  return forbiddenMarkup === null
    ? null
    : fastEditTemplateFailure(
        forbiddenMarkup === "<x-dc>" || forbiddenMarkup === "data-dc-script"
          ? "outside"
          : "not_template",
        forbiddenMarkup,
        forbiddenMarkup.replace(/[<>!]/g, "").toLowerCase(),
      );
}
function* inspectTemplateElementNames(
  element?: Dynamic,
): Generator<Dynamic, Dynamic, Dynamic> {
  TEMPLATE_XML_NAME_PATTERN.test(element.localName) ||
    (yield ["an element named " + element.localName, element.localName]);
  for (let value of element.attributes as Dynamic) {
    let normalizedAttributeName: Dynamic = value.name.startsWith(ScCamelValue)
      ? kebabToCamelCase(
          value.name.slice(ScCamelValue.length),
        )
      : value.name;
    ((FORBIDDEN_TEMPLATE_ATTRIBUTE_NAMES.has(normalizedAttributeName) &&
      (normalizedAttributeName !== "children" ||
        VOID_TEMPLATE_ELEMENTS.has(element.localName))) ||
      (normalizedAttributeName.startsWith("style-") &&
        (/[{}]/.test(value.value) ||
          !SAFE_TEMPLATE_STATE_ATTRIBUTES.pseudo(normalizedAttributeName.slice(6))))) &&
      (yield ["an attribute named " + normalizedAttributeName, normalizedAttributeName]);
  }
}
function inspectTemplateComplexity(template?: Dynamic): Dynamic {
  let complexity: Dynamic = {
      elements: 0,
      depth: 0,
      columns: 0,
      throws: new Map(),
    },
    walk: Dynamic = (
      node?: Dynamic,
      depth?: Dynamic,
      columnDepth?: Dynamic,
    ): Dynamic => {
      for (let value of [
        ...node.childNodes,
        ...(node.content?.childNodes ?? []),
      ] as Dynamic) {
        if (value.nodeType !== 1) continue;
        let childNode: Dynamic = value,
          nextColumnDepth: Dynamic = columnDepth + (hasColumnLayout(childNode) ? 1 : 0);
        complexity.elements += 1;
        complexity.depth = Math.max(complexity.depth, depth + 1);
        complexity.columns = Math.max(complexity.columns, nextColumnDepth);
        for (let [elementName, elementError] of inspectTemplateElementNames(
          childNode,
        ) as Dynamic)
          complexity.throws.set(elementName, elementError);
        depth < MAX_FAST_EDIT_TEMPLATE_DEPTH &&
          walk(childNode, depth + 1, nextColumnDepth);
      }
    };
  walk(template, 0, 0);
  return complexity;
}
function hasClosedTemplateMarkup(html?: Dynamic): Dynamic {
  let Parser: Dynamic = (document as Dynamic).defaultView.DOMParser,
    value: Dynamic = new Parser().parseFromString(
      "<!doctype html><html><head></head><body><x-dc>" +
        html +
        "</x-dc><x-dc-end></x-dc-end></body></html>",
      "text/html",
    ).body?.lastElementChild,
    previousElement: Dynamic = value?.previousElementSibling;
  return (
    value?.localName === "x-dc-end" &&
    value.childNodes.length === 0 &&
    previousElement?.localName === "x-dc" &&
    previousElement.previousElementSibling === null
  );
}
function validateFastEditTemplate(
  before?: Dynamic,
  after?: Dynamic,
): Dynamic {
  try {
    return validateFastEditTemplateUnsafe(before, after);
  } catch {
    return {
      ok: false,
      code: "not_template",
      detail: "threw",
      get what() { return uiMessage("canvas.templateValidation.threw"); },
    };
  }
}
function validateFastEditTemplateUnsafe(
  before?: Dynamic,
  after?: Dynamic,
): Dynamic {
  let failure: Dynamic = (
    reason?: Dynamic,
    insideBox: Dynamic = false,
  ): Dynamic => ({
    ok: false,
    ...reason,
    code: insideBox ? "box_cannot_hold" : reason.code,
    detail: reason.detail.slice(0, 160),
  });
  if (typeof after != "string" || typeof before != "string")
    return failure(
      fastEditTemplateFailure("not_template", "not text", "not_text"),
    );
  if (after.length > MAX_FAST_EDIT_TEMPLATE_CHARS)
    return failure(
      fastEditTemplateFailure("too_big", String(after.length), "characters"),
    );
  let value: Dynamic = findForbiddenTemplateMarkup(after);
  if (value !== null)
    return failure(value, findForbiddenTemplateMarkup(before) !== null);
  let parsedTemplate: Dynamic = parseFastEditTemplate(after),
    complexity: Dynamic = inspectTemplateComplexity(parsedTemplate.content),
    serializedTemplate: Dynamic = serializeFastEditTemplate(parsedTemplate),
    failureReason: Dynamic,
    callback: Dynamic = (): Dynamic =>
      (failureReason ??= inspectTemplateComplexity(
        parseFastEditTemplate(before).content,
      ));
  if (complexity.elements > MAX_FAST_EDIT_TEMPLATE_ELEMENTS)
    return failure(
      fastEditTemplateFailure("too_big", "elements", "elements"),
    );
  if (complexity.depth > MAX_FAST_EDIT_TEMPLATE_DEPTH)
    return failure(
      fastEditTemplateFailure("too_big", "depth", "depth"),
      callback().depth > MAX_FAST_EDIT_TEMPLATE_DEPTH,
    );
  if (complexity.columns >= 2 && complexity.columns > callback().columns)
    return failure(
      fastEditTemplateFailure("too_big", "columns inside columns", "columns"),
    );
  let forbiddenEntry: Dynamic =
    complexity.throws.size === 0
      ? undefined
      : [...complexity.throws].find(
          ([elementName]: Dynamic): Dynamic => !callback().throws.has(elementName),
        );
  if (forbiddenEntry !== undefined)
    return failure(
      fastEditTemplateFailure(
        "not_template",
        forbiddenEntry[0],
        validateTemplateElementId(forbiddenEntry[1]),
      ),
    );
  if (serializedTemplate.length > MAX_FAST_EDIT_TEMPLATE_CHARS)
    return failure(
      fastEditTemplateFailure("too_big", String(serializedTemplate.length), "characters"),
    );
  if (serializeFastEditTemplate(parseFastEditTemplate(serializedTemplate)) !== serializedTemplate)
    return failure(
      fastEditTemplateFailure("reparse", "unstable", "unstable"),
    );
  let forbiddenMarkup: Dynamic = findForbiddenTemplateMarkup(serializedTemplate);
  if (forbiddenMarkup !== null)
    return failure(forbiddenMarkup, findForbiddenTemplateMarkup(before) !== null);
  let closingTagError: Dynamic = checkTemplateClosingTags(before, serializedTemplate);
  return closingTagError !== null
    ? failure(closingTagError)
    : {
        ok: true,
        template: serializedTemplate,
      };
}
function validateArtboardTemplateReplacement(
  documentHtml?: Dynamic,
  templateHtml?: Dynamic,
): Dynamic {
  let failure: Dynamic = (
      code?: Dynamic,
      detailText?: Dynamic,
      what?: Dynamic,
    ): Dynamic => ({
      ok: false,
      code: code,
      detail: detailText,
      ...(what !== undefined
        ? {
            what: what,
          }
        : {}),
    }),
    region: Dynamic = parseDcHtmlDocument(documentHtml);
  if (region === null) return failure("not_template", "no x-dc", "no_region");
  if (/<\/?x-dc/i.test(templateHtml) || /data-dc-script/i.test(templateHtml))
    return failure("outside", "scaffold", "scaffold");
  let value: Dynamic = replaceDcTemplate(
      documentHtml,
      region,
      templateHtml,
    ),
    documentRegion: Dynamic = parseDcHtmlDocument(value);
  if (documentRegion === null) return failure("outside", "unparsable", "unparsable");
  let beforeRegionHtml: Dynamic = documentHtml.slice(0, region.templateStart),
    afterRegionHtml: Dynamic = documentHtml.slice(region.templateEnd);
  if (
    !/<body(?:\s[^>]*)?>\s*$/i.test(
      beforeRegionHtml.slice(0, Math.max(0, beforeRegionHtml.search(/<x-dc[\s>][^<]*$/i))),
    )
  )
    return failure(
      "box_cannot_hold",
      "the region does not open straight after the body tag",
      "region_not_after_body",
    );
  if (
    documentRegion.templateStart !== region.templateStart ||
    value.slice(0, documentRegion.templateStart) !== beforeRegionHtml
  )
    return failure("outside", "before", "before");
  if (
    documentRegion.template !== templateHtml ||
    value.slice(documentRegion.templateEnd) !== afterRegionHtml
  )
    return failure("outside", "after", "after");
  if (value.search(/<\/x-dc/i) !== documentRegion.templateEnd)
    return failure("outside", "early close", "early_close");
  if (
    documentRegion.js !== region.js ||
    (documentRegion.jsMatch?.[0] ?? null) !== (region.jsMatch?.[0] ?? null)
  )
    return failure("outside", "script", "script");
  if (
    getDcPropsJson(value) !==
    getDcPropsJson(documentHtml)
  )
    return failure("outside", "props", "props");
  try {
    if (
      serializeFastEditTemplate(parseFastEditTemplate(templateHtml)) !==
      templateHtml
    )
      return failure("reparse", "unstable", "unstable");
    let closingTagError: Dynamic = checkTemplateClosingTags(
      region.template,
      templateHtml,
    );
    if (closingTagError !== null)
      return failure(closingTagError.code, closingTagError.detail, closingTagError.what);
  } catch {
    return failure("not_template", "threw", "threw");
  }
  return {
    ok: true,
    next: value,
  };
}
export {
  checkTemplateClosingTags,
  fastEditTemplateFailure,
  findForbiddenTemplateMarkup,
  FORBIDDEN_TEMPLATE_ATTRIBUTE_NAMES,
  FORBIDDEN_TEMPLATE_TAGS,
  hasClosedTemplateMarkup,
  hasColumnLayout,
  inspectTemplateComplexity,
  inspectTemplateElementNames,
  MAX_FAST_EDIT_TEMPLATE_CHARS,
  MAX_FAST_EDIT_TEMPLATE_DEPTH,
  MAX_FAST_EDIT_TEMPLATE_ELEMENTS,
  MULTICOLUMN_PROPERTY_PATTERN,
  parseFastEditTemplate,
  SAFE_TEMPLATE_STATE_ATTRIBUTES,
  serializeFastEditTemplate,
  splitCssDeclarations_2,
  TEMPLATE_ELEMENT_ID_PATTERN,
  TEMPLATE_XML_NAME_PATTERN,
  validateArtboardTemplateReplacement,
  validateFastEditTemplate,
  validateFastEditTemplateUnsafe,
  validateTemplateElementId,
  VOID_TEMPLATE_ELEMENTS,
};
export function installFastEditTemplateValidation(): () => void {
  return () => {
    MAX_FAST_EDIT_TEMPLATE_CHARS = 2e5;
    MAX_FAST_EDIT_TEMPLATE_ELEMENTS = 5e3;
    MAX_FAST_EDIT_TEMPLATE_DEPTH = 100;
    serializeFastEditTemplate = (templateDocument?: Dynamic): Dynamic =>
      fromParserHtml(templateDocument.innerHTML);
    fastEditTemplateFailure = (
      code?: Dynamic,
      detailText?: Dynamic,
      what?: Dynamic,
    ): Dynamic => ({
      code: code,
      detail: detailText,
      ...(what !== undefined
        ? {
            what: what,
          }
        : {}),
    });
    TEMPLATE_ELEMENT_ID_PATTERN = /^[A-Za-z][A-Za-z0-9._:-]{0,39}$/;
    validateTemplateElementId = (elementId?: Dynamic): Dynamic =>
      TEMPLATE_ELEMENT_ID_PATTERN.test(elementId) ? elementId : undefined;
    TEMPLATE_XML_NAME_PATTERN =
      /^(?!xml(?:ns)?:|xmlns$)[A-Za-z][A-Za-z0-9._-]*(?::[A-Za-z][A-Za-z0-9._-]*)?$/i;
    FORBIDDEN_TEMPLATE_ATTRIBUTE_NAMES = new Set([
      "on",
      "dangerouslySetInnerHTML",
      "children",
    ]);
    VOID_TEMPLATE_ELEMENTS = new Set([
      "area",
      "base",
      "br",
      "col",
      "embed",
      "hr",
      "img",
      "input",
      "keygen",
      "link",
      "meta",
      "param",
      "source",
      "track",
      "wbr",
      "menuitem",
    ]);
    FORBIDDEN_TEMPLATE_TAGS = /^[A-Za-z-]+(?:\([^()]*\))?$/;
    SAFE_TEMPLATE_STATE_ATTRIBUTES = {
      pseudo(tagName: Dynamic): Dynamic {
        if (!FORBIDDEN_TEMPLATE_TAGS.test(tagName)) return false;
        let value: Dynamic = (document as Dynamic).defaultView?.CSS;
        if (typeof value?.supports != "function") return true;
        try {
          return (
            value.supports("selector(:no-such-pseudo-class)") ||
            value.supports(
              "selector(" +
                (tagName === "before" || tagName === "after" ? "::" : ":") +
                tagName +
                ")",
            )
          );
        } catch {
          return true;
        }
      },
    };
    MULTICOLUMN_PROPERTY_PATTERN =
      /^(?:-webkit-|-moz-)?column(?:s|-count|-width)$/;
    hasColumnLayout = (element?: Dynamic): Dynamic => {
      let value: Dynamic = element.getAttribute("style") ?? "";
      return (
        /column/i.test(value) &&
        value
          .split(";")
          .some(
            (pseudoSelector?: Dynamic): Dynamic =>
              MULTICOLUMN_PROPERTY_PATTERN.test(
                camelToKebabCss(
                  pseudoSelector.slice(0, Math.max(0, pseudoSelector.indexOf(":"))).trim(),
                ).toLowerCase(),
              ),
          )
      );
    };
    checkTemplateClosingTags = (
      beforeHtml?: Dynamic,
      afterHtml?: Dynamic,
    ): Dynamic => {
      let value: Dynamic = hasClosedTemplateMarkup(beforeHtml);
      return value && hasClosedTemplateMarkup(afterHtml)
        ? null
        : fastEditTemplateFailure(
            value ? "not_template" : "box_cannot_hold",
            "something is left open at the end",
            "left_open",
          );
    };
  };
}
