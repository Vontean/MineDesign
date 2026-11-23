/** Restored application module; prepare first, initialize in original order. */
import {
  type Dynamic,
} from "../../runtime-types";
import { parseUtilityClasses } from "../css/rules";
import { HtmlTagNormalizationFromEntriesValue, HtmlTagNormalizationSubscribers, kebabToCamelCase, ScCamelValue, toParserHtml } from "./tag-normalization";
import { builtInUtilityCss } from "../typography/font-catalog";

var parseUtilityClassesValue: Dynamic;
var HtmlAuthoringSubscribers: Dynamic;
var DcTplAttribute: Dynamic;
var HtmlAuthoringCss: Dynamic;
var nonContainerTags: Dynamic;
var HtmlAuthoringTextTspanTextpathSet: Dynamic;
var HtmlAuthoringFFFFDFFFDPattern: Dynamic;
var blockTags: Dynamic;
var HtmlAuthoringH1H2H3Set: Dynamic;
var HtmlAuthoringTrTdThConfig: Dynamic;
var HtmlAuthoringTableTheadTbodyConfig: Dynamic;
var phrasingParentTags: Dynamic;
var HtmlAuthoringLiDtDdSet: Dynamic;
function stripLeadingCssAtRules(css?: Dynamic): Dynamic {
  let strippedCss: Dynamic = css.replace(/\/\*[\s\S]*?\*\//g, "").trim(),
    atRulePattern: Dynamic =
      /^@(import|charset)\b(?:[^;{}"'(]|"[^"]*"|'[^']*'|\([^)]*\))*;\s*/i;
  for (
    let atRuleMatch: Dynamic = atRulePattern.exec(strippedCss);
    atRuleMatch;
    atRuleMatch = atRulePattern.exec(strippedCss)
  )
    strippedCss = strippedCss.slice(atRuleMatch[0].length);
  return !/@(import|charset|namespace)\b/i.test(strippedCss);
}
function fromParserHtml(html?: Dynamic): Dynamic {
  html = html.replace(
    new RegExp("(\\s)" + ScCamelValue + "([a-z0-9-]+)(\\s*=)", "g"),
    (
      matchedText?: Dynamic,
      leadingSpace?: Dynamic,
      attributeName?: Dynamic,
      equalsPart?: Dynamic,
    ): Dynamic => leadingSpace + kebabToCamelCase(attributeName) + equalsPart,
  );
  html = html.replace(/<sc-helmet(\s|>)/gi, "<helmet$1");
  html = html.replace(/<\/sc-helmet\s*>/gi, "</helmet>");
  for (let [parserTag, authoredTag] of Object.entries(
    HtmlTagNormalizationFromEntriesValue,
  ) as Dynamic)
    html = html.replace(
      new RegExp("(</?)" + parserTag + "(?=[\\s>])", "gi"),
      "$1" + authoredTag,
    );
  return html;
}
function normalizeAuthoredHtml(html?: Dynamic): Dynamic {
  let template: Dynamic = (document as Dynamic).createElement("template");
  template.innerHTML = toParserHtml(html);
  return fromParserHtml(template.innerHTML);
}
function isInlineTextContainer(element?: Dynamic): Dynamic {
  if ((element.textContent ?? "").trim() === "") return false;
  for (let descendant of element.querySelectorAll("*") as Dynamic)
    if (
      !HtmlTagNormalizationSubscribers.has(
        descendant.tagName.toLowerCase(),
      )
    )
      return false;
  return true;
}
function isIconOnlyElement(element?: Dynamic): Dynamic {
  if (
    element.closest("pre, code") ||
    [...element.childNodes].some(
      (childNode?: Dynamic): Dynamic =>
        childNode.nodeType === 3 && (childNode.nodeValue ?? "").trim() !== "",
    )
  )
    return false;
  let visibleChildren: Dynamic = [...element.children].filter(
      (child?: Dynamic): Dynamic => !/^w?br$/i.test(child.tagName),
    ),
    hasVisibleText: Dynamic = (child?: Dynamic): Dynamic =>
      (child.textContent ?? "")
        .replace(HtmlAuthoringFFFFDFFFDPattern, "")
        .trim() !== "";
  return (
    (visibleChildren.length > 1 && visibleChildren.filter(hasVisibleText).length <= 1) ||
    visibleChildren.some(isIconOnlyElement)
  );
}
function canContainHtmlChildren(tagName?: Dynamic): Dynamic {
  return !nonContainerTags.has(tagName.toLowerCase());
}
function canContainHtmlTag(parentTag?: Dynamic, childTag?: Dynamic): Dynamic {
  let lowerParentTag: Dynamic = parentTag.toLowerCase(),
    lowerChildTag: Dynamic = childTag.toLowerCase();
  return !(
    !canContainHtmlChildren(lowerParentTag) ||
    (lowerParentTag === "p" && blockTags.has(lowerChildTag)) ||
    (phrasingParentTags.has(lowerParentTag) &&
      HtmlAuthoringLiDtDdSet.has(lowerChildTag)) ||
    (HtmlAuthoringH1H2H3Set.has(lowerParentTag) &&
      HtmlAuthoringH1H2H3Set.has(lowerChildTag)) ||
    (lowerParentTag === lowerChildTag &&
      (lowerParentTag === "a" ||
        lowerParentTag === "form" ||
        lowerParentTag === "button" ||
        lowerParentTag === "label")) ||
    (HtmlAuthoringTrTdThConfig[lowerChildTag] &&
      !HtmlAuthoringTrTdThConfig[lowerChildTag].has(lowerParentTag)) ||
    (HtmlAuthoringTableTheadTbodyConfig[lowerParentTag] &&
      !HtmlAuthoringTableTheadTbodyConfig[lowerParentTag].has(lowerChildTag))
  );
}
export {
  canContainHtmlChildren,
  canContainHtmlTag,
  DcTplAttribute,
  fromParserHtml,
  HtmlAuthoringCss,
  HtmlAuthoringFFFFDFFFDPattern,
  HtmlAuthoringH1H2H3Set,
  HtmlAuthoringLiDtDdSet,
  HtmlAuthoringSubscribers,
  nonContainerTags,
  blockTags,
  phrasingParentTags,
  HtmlAuthoringTableTheadTbodyConfig,
  HtmlAuthoringTextTspanTextpathSet,
  HtmlAuthoringTrTdThConfig,
  isIconOnlyElement,
  isInlineTextContainer,
  normalizeAuthoredHtml,
  parseUtilityClassesValue,
  stripLeadingCssAtRules,
};
export function installEditorHtmlAuthoring(): () => void {
  return () => {
    parseUtilityClassesValue = parseUtilityClasses(
      builtInUtilityCss,
    );
    HtmlAuthoringSubscribers = new Set(
      parseUtilityClassesValue.map(
        (utilityRule?: Dynamic): Dynamic => utilityRule.className,
      ),
    );
    DcTplAttribute = "data-dc-tpl";
    HtmlAuthoringCss = `
/*sheet*/
`;
    nonContainerTags = new Set([
      "area",
      "base",
      "br",
      "col",
      "embed",
      "hr",
      "img",
      "input",
      "link",
      "meta",
      "param",
      "source",
      "track",
      "wbr",
      "canvas",
      "iframe",
      "option",
      "script",
      "select",
      "style",
      "textarea",
      "title",
      "video",
      "audio",
      "path",
      "circle",
      "rect",
      "line",
      "ellipse",
      "polygon",
      "polyline",
      "use",
    ]);
    HtmlAuthoringTextTspanTextpathSet = new Set(["text", "tspan", "textpath"]);
    HtmlAuthoringFFFFDFFFDPattern =
      /[\uE000-\uF8FF\u{F0000}-\u{FFFFD}\u{100000}-\u{10FFFD}]/gu;
    blockTags = new Set(
      "address article aside blockquote details div dl fieldset figcaption figure footer form h1 h2 h3 h4 h5 h6 header hgroup hr main menu nav ol p pre section table ul".split(
        " ",
      ),
    );
    HtmlAuthoringH1H2H3Set = new Set(["h1", "h2", "h3", "h4", "h5", "h6"]);
    HtmlAuthoringTrTdThConfig = {
      tr: new Set(["thead", "tbody", "tfoot", "table"]),
      td: new Set(["tr"]),
      th: new Set(["tr"]),
      thead: new Set(["table"]),
      tbody: new Set(["table"]),
      tfoot: new Set(["table"]),
      caption: new Set(["table"]),
      colgroup: new Set(["table"]),
      col: new Set(["colgroup"]),
    };
    HtmlAuthoringTableTheadTbodyConfig = {
      table: new Set(["caption", "colgroup", "thead", "tbody", "tfoot", "tr"]),
      thead: new Set(["tr"]),
      tbody: new Set(["tr"]),
      tfoot: new Set(["tr"]),
      tr: new Set(["td", "th"]),
      colgroup: new Set(["col"]),
    };
    phrasingParentTags = new Set(
      "span a b i em strong u s small sub sup code label button abbr cite q mark time kbd samp var h1 h2 h3 h4 h5 h6".split(
        " ",
      ),
    );
    HtmlAuthoringLiDtDdSet = new Set([
      ...blockTags,
      "li",
      "dt",
      "dd",
    ]);
  };
}
