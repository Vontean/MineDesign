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
function encodeCamelCaseAttributes(input?: Dynamic): Dynamic {
  let callback: Dynamic = (input2?: Dynamic): Dynamic =>
    input2.replace(
      HtmlTagNormalizationAZaZPattern,
      (input3?: Dynamic, options?: Dynamic, context?: Dynamic): Dynamic =>
        context === undefined
          ? input3
          : options +
            ScCamelValue +
            context.replace(
              /[A-Z]/g,
              (input4?: Dynamic): Dynamic => "-" + input4.toLowerCase(),
            ),
    );
  return input.replace(
    htmlAttributeTagPattern,
    (
      input2?: Dynamic,
      options?: Dynamic,
      context?: Dynamic,
      value?: Dynamic,
      extra?: Dynamic,
    ): Dynamic =>
      options !== undefined
        ? input2
        : context
          ? callback(context) + extra
          : callback(input2),
  );
}
function toParserHtml(input?: Dynamic): Dynamic {
  input = input.replace(
    selfClosingImportPattern,
    (input2?: Dynamic, options?: Dynamic, context?: Dynamic): Dynamic =>
      "<" + options + context + "></" + options + ">",
  );
  input = input.replace(/<helmet(\s|>)/gi, "<sc-helmet$1");
  input = input.replace(/<\/helmet\s*>/gi, "</sc-helmet>");
  input = encodeCamelCaseAttributes(input);
  for (let [value, value2] of Object.entries(
    HtmlTagNormalizationSelectTableTbodyConfig,
  ) as Dynamic)
    input = input.replace(
      new RegExp("(</?)" + value + "(?=[\\s>])", "gi"),
      "$1" + value2,
    );
  return input;
}
function kebabToCamelCase(input?: Dynamic): Dynamic {
  return input.replace(
    /-([a-z])/g,
    (input2?: Dynamic, options?: Dynamic): Dynamic => options.toUpperCase(),
  );
}
function camelToKebabCss(input?: Dynamic): Dynamic {
  if (input.startsWith("--") || !/[a-z][A-Z]/.test(input)) return input;
  if (input === "cssFloat") return "float";
  let value: Dynamic = input.replace(
    /[A-Z]/g,
    (input2?: Dynamic): Dynamic => "-" + input2.toLowerCase(),
  );
  return /^(webkit|moz|ms|o)-/.test(value) ? "-" + value : value;
}
function compileTemplateExpression(input?: Dynamic): Dynamic {
  let value: Dynamic = input.match(/^\s*\{\{([\s\S]+?)\}\}\s*$/);
  if (value) {
    let value2: Dynamic = value[1];
    return (input2?: Dynamic): Dynamic =>
      evaluateTemplateExpression(input2, value2);
  }
  if (input.includes("{{")) {
    let value2: Dynamic = input.split(/\{\{([\s\S]+?)\}\}/g);
    return (input2?: Dynamic): Dynamic =>
      value2
        .map(
          (input3?: Dynamic, options?: Dynamic): Dynamic =>
            options & 1
              ? (evaluateTemplateExpression(input2, input3) ??
                "")
              : input3,
        )
        .join("");
  }
  return (): Dynamic => input;
}
function safeJsonStringify(input?: Dynamic, options: Dynamic = {}): Dynamic {
  let value: Dynamic = JSON.stringify(input, null, options.space).replace(
    /</g,
    "\\u003c",
  );
  return options.escapeSlashes ? value.replace(/\//g, "\\/") : value;
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
        ([input, input2]: Dynamic): Dynamic => [input2, input],
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
