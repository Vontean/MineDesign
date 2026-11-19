/** Restored application module; prepare first, initialize in original order. */
import {
  type Dynamic,
} from "../../runtime-types";
import { evaluateTemplateExpression } from "../template-expressions";

var ScCamelValue: Dynamic;
var HtmlTagNormalizationSubscribers: Dynamic;
var HtmlTagNormalizationSelectTableTbodyConfig: Dynamic;
var HtmlTagNormalizationFromEntriesValue: Dynamic;
var HtmlTagNormalizationSubscribers_2: Dynamic;
var HtmlTagNormalizationCss: Dynamic;
var selfClosingImportPattern: Dynamic;
var HtmlTagNormalizationCss_2: Dynamic;
var htmlAttributeTagPattern: Dynamic;
var HtmlTagNormalizationAZaZPattern: Dynamic;
function encodeCamelCaseAttributes(html?: Dynamic): Dynamic {
  let encodeTag: Dynamic = (tagText?: Dynamic): Dynamic =>
    tagText.replace(
      HtmlTagNormalizationAZaZPattern,
      (matchedText?: Dynamic, leadingSpace?: Dynamic, attributeName?: Dynamic): Dynamic =>
        attributeName === undefined
          ? matchedText
          : leadingSpace +
            ScCamelValue +
            attributeName.replace(
              /[A-Z]/g,
              (letter?: Dynamic): Dynamic => "-" + letter.toLowerCase(),
            ),
    );
  return html.replace(
    htmlAttributeTagPattern,
    (
      matchedText?: Dynamic,
      commentText?: Dynamic,
      rawTextOpenTag?: Dynamic,
      rawTextTagName?: Dynamic,
      rawTextRest?: Dynamic,
    ): Dynamic =>
      commentText !== undefined
        ? matchedText
        : rawTextOpenTag
          ? encodeTag(rawTextOpenTag) + rawTextRest
          : encodeTag(matchedText),
  );
}
function toParserHtml(html?: Dynamic): Dynamic {
  html = html.replace(
    selfClosingImportPattern,
    (matchedText?: Dynamic, tagName?: Dynamic, attributes?: Dynamic): Dynamic =>
      "<" + tagName + attributes + "></" + tagName + ">",
  );
  html = html.replace(/<helmet(\s|>)/gi, "<sc-helmet$1");
  html = html.replace(/<\/helmet\s*>/gi, "</sc-helmet>");
  html = encodeCamelCaseAttributes(html);
  for (let [authoredTag, parserTag] of Object.entries(
    HtmlTagNormalizationSelectTableTbodyConfig,
  ) as Dynamic)
    html = html.replace(
      new RegExp("(</?)" + authoredTag + "(?=[\\s>])", "gi"),
      "$1" + parserTag,
    );
  return html;
}
function kebabToCamelCase(kebabText?: Dynamic): Dynamic {
  return kebabText.replace(
    /-([a-z])/g,
    (matchedText?: Dynamic, letter?: Dynamic): Dynamic => letter.toUpperCase(),
  );
}
function camelToKebabCss(propertyName?: Dynamic): Dynamic {
  if (propertyName.startsWith("--") || !/[a-z][A-Z]/.test(propertyName)) return propertyName;
  if (propertyName === "cssFloat") return "float";
  let kebabName: Dynamic = propertyName.replace(
    /[A-Z]/g,
    (letter?: Dynamic): Dynamic => "-" + letter.toLowerCase(),
  );
  return /^(webkit|moz|ms|o)-/.test(kebabName) ? "-" + kebabName : kebabName;
}
function compileTemplateExpression(attributeValue?: Dynamic): Dynamic {
  let singleExpressionMatch: Dynamic = attributeValue.match(/^\s*\{\{([\s\S]+?)\}\}\s*$/);
  if (singleExpressionMatch) {
    let expression: Dynamic = singleExpressionMatch[1];
    return (scope?: Dynamic): Dynamic =>
      evaluateTemplateExpression(scope, expression);
  }
  if (attributeValue.includes("{{")) {
    let textParts: Dynamic = attributeValue.split(/\{\{([\s\S]+?)\}\}/g);
    return (scope?: Dynamic): Dynamic =>
      textParts
        .map(
          (part?: Dynamic, partIndex?: Dynamic): Dynamic =>
            partIndex & 1
              ? (evaluateTemplateExpression(scope, part) ??
                "")
              : part,
        )
        .join("");
  }
  return (): Dynamic => attributeValue;
}
function safeJsonStringify(value?: Dynamic, stringifyOptions: Dynamic = {}): Dynamic {
  let json: Dynamic = JSON.stringify(value, null, stringifyOptions.space).replace(
    /</g,
    "\\u003c",
  );
  return stringifyOptions.escapeSlashes ? json.replace(/\//g, "\\/") : json;
}
export {
  camelToKebabCss,
  compileTemplateExpression,
  encodeCamelCaseAttributes,
  htmlAttributeTagPattern,
  HtmlTagNormalizationAZaZPattern,
  HtmlTagNormalizationCss,
  HtmlTagNormalizationCss_2,
  HtmlTagNormalizationFromEntriesValue,
  HtmlTagNormalizationSelectTableTbodyConfig,
  HtmlTagNormalizationSubscribers,
  HtmlTagNormalizationSubscribers_2,
  kebabToCamelCase,
  safeJsonStringify,
  ScCamelValue,
  selfClosingImportPattern,
  toParserHtml,
};
export function installEditorHtmlTagNormalization(): () => void {
  return () => {
    ScCamelValue = "sc-camel-";
    HtmlTagNormalizationSubscribers = new Set(
      "a abbr b bdi bdo br cite code del dfn em i ins kbd mark q s samp small span strike strong sub sup u var wbr".split(
        " ",
      ),
    );
    HtmlTagNormalizationSelectTableTbodyConfig = {
      select: "sc-raw-select",
      table: "sc-raw-table",
      tbody: "sc-raw-tbody",
      thead: "sc-raw-thead",
      tfoot: "sc-raw-tfoot",
      tr: "sc-raw-tr",
      td: "sc-raw-td",
      th: "sc-raw-th",
      caption: "sc-raw-caption",
    };
    HtmlTagNormalizationFromEntriesValue = Object.fromEntries(
      Object.entries(HtmlTagNormalizationSelectTableTbodyConfig).map(
        ([authoredTag, parserTag]: Dynamic): Dynamic => [parserTag, authoredTag],
      ),
    );
    HtmlTagNormalizationSubscribers_2 = new Set(
      "allowFullScreen async autoFocus autoPlay checked controls default defer disabled disablePictureInPicture disableRemotePlayback formNoValidate hidden itemScope loop multiple muted noModule noValidate open playsInline readOnly required reversed scoped seamless selected".split(
        " ",
      ),
    );
    HtmlTagNormalizationCss = `(?:[^>"']|"[^"]*"|'[^']*')*`;
    selfClosingImportPattern = new RegExp(
      "<(x-import|dc-import)(" + HtmlTagNormalizationCss + ")/>",
      "gi",
    );
    HtmlTagNormalizationCss_2 = `(?:=\\s*"[^"]*"|=\\s*'[^']*'|=(?!\\s*["'])|[^>=])*`;
    htmlAttributeTagPattern = new RegExp(
      "(<\!---?>|<\!--[\\s\\S]*?--!?>)|(<(script|style|textarea|title)(?=[\\s/>])" +
        HtmlTagNormalizationCss_2 +
        ">)([\\s\\S]*?<\\/\\3(?=[\\s/>])[^>]*>)|<[a-zA-Z][^\\s/>]*(?=[\\s/>])" +
        HtmlTagNormalizationCss_2 +
        ">",
      "gi",
    );
    HtmlTagNormalizationAZaZPattern =
      /=\s*"[^"]*"|=\s*'[^']*'|(\s)([a-z]+[A-Z][A-Za-z0-9]*)(?=\s*=)/g;
  };
}
