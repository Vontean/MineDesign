/** Restored application module; prepare first, initialize in original order. */
import {
  type Dynamic,
} from "../../runtime-types";
import { HtmlTagNormalizationFromEntriesValue, HtmlTagNormalizationSelectTableTbodyConfig, toParserHtml } from "./tag-normalization";

var SupportJsValue: Dynamic;
var HtmlDcDocumentXImportDcImportPattern: Dynamic;
var TextXDcValue: Dynamic;
var HtmlDcDocumentScriptBdataDcScriptPattern: Dynamic;
var HtmlDcDocumentScriptStyleTextareaValues: Dynamic;
var HtmlDcDocumentJoin: Dynamic;
var HtmlDcDocumentLocalName: Dynamic;
var HtmlDcDocumentNextSibling: Dynamic;
var HtmlDcDocumentClosest: Dynamic;
var HtmlDcDocumentItems: Dynamic;
function isDcHtmlDocument(source?: Dynamic): Dynamic {
  return (
    /<script[^>]*\bsrc\s*=\s*["'](?:\.\/)?support\.js["']/i.test(source) &&
    /<x-dc[\s>]/i.test(source)
  );
}
function expandSelfClosingImports(html?: Dynamic): Dynamic {
  return html.replace(
    HtmlDcDocumentXImportDcImportPattern,
    (matchedText?: Dynamic, tagName?: Dynamic, attributes?: Dynamic): Dynamic =>
      `<${tagName}${attributes}></${tagName}>`,
  );
}
function normalizeDcScriptType(source?: Dynamic): Dynamic {
  let document: Dynamic = parseDcHtmlDocument(source);
  if (!document?.jsMatch) return source;
  let index: Dynamic = document.jsMatch.index,
    insertAt: Dynamic = index + 7,
    tagEnd: Dynamic = findHtmlTagEnd(source, index);
  if (
    index < document.templateEnd ||
    tagEnd === -1 ||
    !/[\s/]/.test(source[insertAt] ?? "")
  )
    return source;
  let tagWithoutQuotedValues: Dynamic = source
    .slice(insertAt, tagEnd)
    .replace(/"[^"]*"|'[^']*'/g, '""');
  return /\stype\s*=/i.test(tagWithoutQuotedValues)
    ? source
    : source.slice(0, insertAt) +
        ` type="${TextXDcValue}"` +
        source.slice(insertAt);
}
function artboardComponentName(path?: Dynamic): Dynamic {
  return (path.split("/").pop() || path).replace(/\.dc\.html$/, "");
}
function findHtmlTagEnd(source?: Dynamic, startIndex?: Dynamic): Dynamic {
  let openQuote: Dynamic = null;
  for (let position: Dynamic = startIndex; position < source.length; position++) {
    let character: Dynamic = source[position];
    if (openQuote) character === openQuote && (openQuote = null);
    else if (character === '"' || character === "'") openQuote = character;
    else if (character === ">") return position;
  }
  return -1;
}
function findDcScriptStart(source?: Dynamic, minIndex?: Dynamic): Dynamic {
  let lastScriptIndex: Dynamic = -1;
  for (let scriptTag of source.matchAll(/<script/gi) as Dynamic)
    lastScriptIndex = scriptTag.index;
  let tagEnd: Dynamic = lastScriptIndex < minIndex ? -1 : findHtmlTagEnd(source, lastScriptIndex),
    markerIndex: Dynamic = source.search(/data-dc-script/i);
  if (
    tagEnd === -1 ||
    source.indexOf(">", lastScriptIndex) !== tagEnd ||
    markerIndex < lastScriptIndex ||
    markerIndex > tagEnd ||
    !/\sdata-dc-script[\s=/>]/i.test(source.slice(lastScriptIndex, tagEnd + 1)) ||
    !/<\/script>/i.test(source.slice(tagEnd)) ||
    source.lastIndexOf("<\!--", lastScriptIndex) > source.lastIndexOf("-->", lastScriptIndex)
  )
    return null;
  let scriptPattern: Dynamic = new RegExp(
    HtmlDcDocumentScriptBdataDcScriptPattern.source,
    "iy",
  );
  scriptPattern.lastIndex = lastScriptIndex;
  let scriptMatch: Dynamic = scriptPattern.exec(source),
    textAfterScript: Dynamic = source.slice(lastScriptIndex + (scriptMatch?.[0].length ?? 0));
  return scriptMatch && /^\s*(<\/body\s*>\s*)?(<\/html\s*>\s*)?$/i.test(textAfterScript)
    ? scriptMatch
    : null;
}
function isSourceOffsetCompatible(html?: Dynamic): Dynamic {
  if (
    /<plaintext[\s/>]/i.test(html) ||
    Object.keys(HtmlTagNormalizationSelectTableTbodyConfig).some(
      (tagName?: Dynamic): Dynamic =>
        new RegExp("<" + tagName + "[\\s/>]", "i").test(html),
    )
  )
    return false;
  let countOccurrences: Dynamic = (name?: Dynamic): Dynamic =>
    html.match(new RegExp(name + "[\\s/>]", "gi"))?.length ?? 0;
  return HtmlDcDocumentScriptStyleTextareaValues.every(
    (tagName?: Dynamic): Dynamic =>
      countOccurrences("<" + tagName) === countOccurrences("</" + tagName),
  );
}
function sameDcScriptContent(xDcElement?: Dynamic, scriptMatch?: Dynamic): Dynamic {
  let normalizeNewlines: Dynamic = (text?: Dynamic): Dynamic =>
      text.replace(
        /\r\n?/g,
        `
`,
      ),
    nextElementSibling: Dynamic = xDcElement.nextElementSibling;
  return (
    HtmlDcDocumentLocalName(nextElementSibling) &&
    normalizeNewlines(nextElementSibling.textContent ?? "") === normalizeNewlines(scriptMatch[1])
  );
}
function verifyTemplateOffset(
  source?: Dynamic,
  doc?: Dynamic,
  marks?: Dynamic,
): Dynamic {
  let lowerSource: Dynamic = source.toLowerCase(),
    markerTag: Dynamic = [
      "x-dc-offset-mark",
      "x-dc-offset-mark-a",
      "x-dc-offset-mark-b",
    ].find((candidate?: Dynamic): Dynamic => !lowerSource.includes(candidate));
  if (markerTag === undefined) return false;
  let markedSource: Dynamic = source,
    insertions: Dynamic = marks
      .map(
        (mark?: Dynamic, markIndex?: Dynamic): Dynamic => ({
          at: mark.at,
          i: markIndex,
        }),
      )
      .sort(
        (left?: Dynamic, right?: Dynamic): Dynamic =>
          right.at - left.at,
      );
  for (let insertion of insertions as Dynamic)
    markedSource =
      markedSource.slice(0, insertion.at) +
      "<" +
      markerTag +
      ' data-n="' +
      insertion.i +
      '"></' +
      markerTag +
      ">" +
      markedSource.slice(insertion.at);
  let markedDocument: Dynamic = new DOMParser().parseFromString(markedSource, "text/html");
  if (
    !marks.every((mark?: Dynamic, markIndex?: Dynamic): Dynamic => {
      let foundMarkers: Dynamic = markedDocument.querySelectorAll(
        markerTag + '[data-n="' + markIndex + '"]',
      );
      return foundMarkers.length === 1 && mark.holds(foundMarkers[0]);
    })
  )
    return false;
  for (let marker of markedDocument.querySelectorAll(markerTag) as Dynamic)
    marker.remove();
  markedDocument.normalize();
  doc.normalize();
  return markedDocument.documentElement.outerHTML === doc.documentElement.outerHTML;
}
function validateSourceOffset(
  source?: Dynamic,
  templateStart?: Dynamic,
  template?: Dynamic,
  scriptMatch?: Dynamic,
  isUnclosed?: Dynamic,
): Dynamic {
  if (typeof DOMParser === "undefined" || typeof document === "undefined")
    return false;
  let cachedIndex: Dynamic = HtmlDcDocumentItems.findIndex(
      (entry?: Dynamic): Dynamic => entry.src === source,
    ),
    cacheEntry: Dynamic =
      cachedIndex === -1
        ? {
            src: source,
            ok: checkOffsets(),
          }
        : HtmlDcDocumentItems.splice(cachedIndex, 1)[0];
  HtmlDcDocumentItems.unshift(cacheEntry);
  HtmlDcDocumentItems.length = Math.min(HtmlDcDocumentItems.length, 8);
  return cacheEntry.ok;
  function checkOffsets(): Dynamic {
    let parseHtml: Dynamic = (html?: Dynamic): Dynamic =>
        new DOMParser().parseFromString(html, "text/html"),
      sourceDocument: Dynamic = parseHtml(source),
      sourceXDcElements: Dynamic = [...sourceDocument.querySelectorAll("x-dc")],
      xDcElements: Dynamic = isUnclosed
        ? [
            ...parseHtml(
              source.slice(0, scriptMatch.index) +
                `</x-dc>
` +
                source.slice(scriptMatch.index),
            ).querySelectorAll("x-dc"),
          ]
        : sourceXDcElements;
    if (
      sourceXDcElements.length !== 1 ||
      xDcElements.length !== 1 ||
      !sameDcScriptContent(xDcElements[0], scriptMatch)
    )
      return false;
    let templateElement: Dynamic = (document as Dynamic).createElement("template");
    templateElement.innerHTML = toParserHtml(template);
    let parsedElements: Dynamic = [...xDcElements[0].querySelectorAll("*")];
    if (
      HtmlDcDocumentJoin(templateElement.content.querySelectorAll("*")) !==
      HtmlDcDocumentJoin(parsedElements)
    )
      return false;
    if (isUnclosed) {
      let sourceElements: Dynamic = [...sourceXDcElements[0].querySelectorAll("*")];
      if (
        !HtmlDcDocumentLocalName(sourceElements.at(-1)) ||
        HtmlDcDocumentJoin(sourceElements.slice(0, -1)) !== HtmlDcDocumentJoin(parsedElements)
      )
        return false;
    }
    let state: Dynamic = {
        at: templateStart,
        holds: (node?: Dynamic): Dynamic =>
          node.parentElement?.localName === "x-dc" &&
          node.previousSibling === null,
      },
      otherMarks: Dynamic = isUnclosed
        ? [
            {
              at: scriptMatch.index,
              holds: (node?: Dynamic): Dynamic =>
                !!node.closest("x-dc") && HtmlDcDocumentNextSibling(node),
            },
          ]
        : [
            {
              at: templateStart + template.length,
              holds: HtmlDcDocumentClosest,
            },
            {
              at: scriptMatch.index,
              holds: (node?: Dynamic): Dynamic =>
                HtmlDcDocumentNextSibling(node) &&
                node.previousElementSibling?.localName === "x-dc",
            },
          ];
    return verifyTemplateOffset(source, sourceDocument, [state, ...otherMarks]);
  }
}
function parseDcHtmlDocument(source?: Dynamic): Dynamic {
  let xDcStart: Dynamic = source.search(/<x-dc[\s>]/i);
  if (xDcStart === -1) return null;
  let xDcTagEnd: Dynamic = findHtmlTagEnd(source, xDcStart);
  if (xDcTagEnd === -1) return null;
  let templateStart: Dynamic = xDcTagEnd + 1,
    xDcCloseIndex: Dynamic = source.lastIndexOf("</x-dc>"),
    parseClosedTemplate: Dynamic = (): Dynamic => {
      if (xDcCloseIndex < xDcTagEnd) return null;
      let closedScriptMatch: Dynamic = new RegExp(
        HtmlDcDocumentScriptBdataDcScriptPattern.source,
        "i",
      ).exec(source);
      return {
        template: source.slice(templateStart, xDcCloseIndex),
        templateStart: templateStart,
        templateEnd: xDcCloseIndex,
        unclosed: false,
        js: closedScriptMatch ? closedScriptMatch[1] : "",
        jsMatch: closedScriptMatch,
      };
    },
    scriptMatch: Dynamic =
      xDcCloseIndex < xDcTagEnd || /<script/i.test(source.slice(xDcTagEnd, xDcCloseIndex))
        ? findDcScriptStart(source, xDcTagEnd)
        : null;
  if (!scriptMatch || (xDcCloseIndex >= xDcTagEnd && xDcCloseIndex < scriptMatch.index))
    return parseClosedTemplate();
  let textAfterTag: Dynamic = source.slice(xDcTagEnd, scriptMatch.index),
    closeIndexInText: Dynamic = textAfterTag.lastIndexOf("</x-dc>");
  if (closeIndexInText !== -1) {
    let closedTemplate: Dynamic = source.slice(templateStart, xDcTagEnd + closeIndexInText);
    return !(textAfterTag.match(/<\/x-dc[\s/>]/gi)?.length === 1) ||
      !validateSourceOffset(source, templateStart, closedTemplate, scriptMatch, false)
      ? parseClosedTemplate()
      : {
          template: closedTemplate,
          templateStart: templateStart,
          templateEnd: xDcTagEnd + closeIndexInText,
          unclosed: false,
          js: scriptMatch[1],
          jsMatch: scriptMatch,
        };
  }
  let xDcOpenCount: Dynamic = source
      .slice(0, scriptMatch.index)
      .match(/<x-dc[\s/>]/gi)?.length,
    isInComment: Dynamic =
      source.lastIndexOf("<\!--", xDcStart) > source.lastIndexOf("-->", xDcStart),
    hasStructuralTag: Dynamic = /<\/head[\s/>]|<body[\s/>]|<\/x-dc[\s/>]/i.test(
      textAfterTag,
    ),
    shouldFallBack: Dynamic =
      xDcOpenCount !== 1 || isInComment || hasStructuralTag || !isSourceOffsetCompatible(textAfterTag),
    unclosedTemplate: Dynamic = source.slice(templateStart, scriptMatch.index);
  return shouldFallBack ||
    !validateSourceOffset(source, templateStart, unclosedTemplate, scriptMatch, true)
    ? parseClosedTemplate()
    : {
        template: unclosedTemplate,
        templateStart: templateStart,
        templateEnd: scriptMatch.index,
        unclosed: true,
        js: scriptMatch[1],
        jsMatch: scriptMatch,
      };
}
function sameDcTemplate(current?: Dynamic, previous?: Dynamic): Dynamic {
  if (current === previous) return true;
  if (previous === undefined) return false;
  let currentDocument: Dynamic = parseDcHtmlDocument(current),
    previousDocument: Dynamic = parseDcHtmlDocument(previous);
  return (
    currentDocument != null &&
    previousDocument != null &&
    currentDocument.template === previousDocument.template &&
    currentDocument.js === previousDocument.js
  );
}
function replaceDcTemplate(
  source?: Dynamic,
  document?: Dynamic,
  template?: Dynamic,
): Dynamic {
  return document.unclosed && template === document.template
    ? source
    : source.slice(0, document.templateStart) +
        template +
        (document.unclosed
          ? `</x-dc>
`
          : "") +
        source.slice(document.templateEnd);
}
export {
  artboardComponentName,
  expandSelfClosingImports,
  findDcScriptStart,
  findHtmlTagEnd,
  HtmlDcDocumentClosest,
  HtmlDcDocumentItems,
  HtmlDcDocumentJoin,
  HtmlDcDocumentLocalName,
  HtmlDcDocumentNextSibling,
  HtmlDcDocumentScriptBdataDcScriptPattern,
  HtmlDcDocumentScriptStyleTextareaValues,
  HtmlDcDocumentXImportDcImportPattern,
  isDcHtmlDocument,
  isSourceOffsetCompatible,
  normalizeDcScriptType,
  parseDcHtmlDocument,
  replaceDcTemplate,
  sameDcScriptContent,
  sameDcTemplate,
  SupportJsValue,
  TextXDcValue,
  validateSourceOffset,
  verifyTemplateOffset,
};
export function installEditorHtmlDcDocument(): () => void {
  return () => {
    SupportJsValue = "support.js";
    HtmlDcDocumentXImportDcImportPattern =
      /<(x-import|dc-import)((?:[^>"']|"[^"]*"|'[^']*')*)\/>/gi;
    TextXDcValue = "text/x-dc";
    HtmlDcDocumentScriptBdataDcScriptPattern =
      /<script[^>]*\bdata-dc-script\b[^>]*>([\s\S]*?)<\/script>/;
    HtmlDcDocumentScriptStyleTextareaValues = [
      "script",
      "style",
      "textarea",
      "title",
      "xmp",
      "iframe",
      "noembed",
      "noframes",
      "noscript",
    ];
    HtmlDcDocumentJoin = (elements?: Dynamic): Dynamic =>
      [...elements]
        .map(
          (element?: Dynamic): Dynamic =>
            HtmlTagNormalizationFromEntriesValue[element.localName] ??
            (element.localName === "sc-helmet" ? "helmet" : element.localName),
        )
        .join(" ");
    HtmlDcDocumentLocalName = (node?: Dynamic): Dynamic =>
      node?.nodeType === 1 &&
      node.localName === "script" &&
      node.hasAttribute("data-dc-script");
    HtmlDcDocumentNextSibling = (node?: Dynamic): Dynamic =>
      HtmlDcDocumentLocalName(node.nextSibling);
    HtmlDcDocumentClosest = (node?: Dynamic): Dynamic => {
      let ancestor: Dynamic = node.closest("x-dc");
      for (
        let currentNode: Dynamic = node;
        currentNode && currentNode !== ancestor;
        currentNode = currentNode.parentNode
      )
        for (
          let nextSibling: Dynamic = currentNode.nextSibling;
          nextSibling;
          nextSibling = nextSibling.nextSibling
        )
          if (
            nextSibling.nodeType !== 3 ||
            (nextSibling.textContent ?? "").trim() !== ""
          )
            return false;
      return !!ancestor;
    };
    HtmlDcDocumentItems = [];
  };
}
