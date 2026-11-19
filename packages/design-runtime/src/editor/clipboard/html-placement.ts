/** Restored application module; prepare first, initialize in original order. */
import {
  type Dynamic,
} from "../../runtime-types";
import { fromParserHtml } from "../html/authoring";
import { parseDcHtmlDocument } from "../html/dc-document";
import { getDcPropsJson, setDcPropsJson } from "../html/dc-props";
import { toParserHtml } from "../html/tag-normalization";

var ClipboardHtmlPlacementHtml: Dynamic;
function positionPastedHtml(
  html?: Dynamic,
  placement?: Dynamic,
  doc: Dynamic = document,
): Dynamic {
  let placementBox: Dynamic =
      typeof placement == "number"
        ? {
            ew: placement,
            ox: 0,
            oy: 0,
          }
        : placement,
    left: Dynamic = Math.round(placementBox.ox),
    top: Dynamic = Math.round(placementBox.oy),
    template: Dynamic = doc.createElement("template");
  template.innerHTML = toParserHtml(html);
  let widthStyle: Dynamic =
      placementBox.ew == null
        ? ""
        : " box-sizing: border-box; width: " +
          String(Math.ceil(placementBox.ew)) +
          "px;",
    rootElements: Dynamic = Array.from(template.content.children).filter(
      (element?: Dynamic): Dynamic =>
        !/^(style|script|link|meta|title|template|noscript|sc-helmet)$/i.test(
          element.tagName,
        ),
    );
  for (let rootElement of rootElements as Dynamic) {
    let existingStyle: Dynamic = (rootElement.getAttribute("style") ?? "")
        .replace(/(^|;)\s*margin-(?:top|right|bottom|left)\s*:[^;]*/gi, "$1")
        .replace(/^[;\s]+/, "")
        .trim(),
      positionStyle: Dynamic =
        "position: absolute; left: " +
        String(left) +
        "px; top: " +
        String(top) +
        "px; right: auto; bottom: auto; margin: 0px;" +
        widthStyle;
    rootElement.setAttribute(
      "style",
      (existingStyle === "" ? "" : existingStyle.replace(/;?$/, "; ")) + positionStyle,
    );
  }
  return fromParserHtml(template.innerHTML);
}
function unpositionPastedHtml(
  html?: Dynamic,
  doc: Dynamic = document,
): Dynamic {
  let template: Dynamic = doc.createElement("template");
  template.innerHTML = toParserHtml(html);
  let rootElements: Dynamic = Array.from(template.content.children).filter(
      (element?: Dynamic): Dynamic =>
        !/^(style|script|link|meta|title|template|noscript|sc-helmet)$/i.test(
          element.tagName,
        ),
    ),
    unwrapImport: Dynamic = (element?: Dynamic): Dynamic =>
      /^x-import$/i.test(element.tagName) && element.children.length === 1
        ? unwrapImport(element.children[0])
        : element;
  for (let rootElement of rootElements.map(unwrapImport) as Dynamic) {
    let declarations: Dynamic = (rootElement.getAttribute("style") ?? "")
      .split(";")
      .map((declaration?: Dynamic): Dynamic => declaration.trim())
      .filter((declaration?: Dynamic): Dynamic => declaration !== "");
    if (
      !declarations.some(
        (declaration?: Dynamic): Dynamic =>
          /^position\s*:\s*absolute$/i.test(declaration),
      )
    )
      continue;
    let normalizedProperty: Dynamic = (declaration?: Dynamic): Dynamic =>
        /^(position\s*:\s*absolute|left\s*:\s*-?\d+(?:\.\d+)?px|top\s*:\s*-?\d+(?:\.\d+)?px|right\s*:\s*auto|bottom\s*:\s*auto|margin\s*:\s*0(?:px)?)$/i.exec(
          declaration,
        )
          ? declaration.split(":")[0].trim().toLowerCase()
          : null,
      seenProperties: Dynamic = new Set(),
      removableIndexes: Dynamic = new Set();
    for (let index: Dynamic = declarations.length - 1; index >= 0; index--) {
      let property: Dynamic = normalizedProperty(declarations[index]);
      property &&
        !seenProperties.has(property) &&
        (seenProperties.add(property), removableIndexes.add(index));
    }
    let keptIndexes: Dynamic = declarations
        .map((declaration?: Dynamic, declarationIndex?: Dynamic): Dynamic => declarationIndex)
        .filter((declarationIndex?: Dynamic): Dynamic => !removableIndexes.has(declarationIndex)),
      absoluteIndex: Dynamic = declarations.findIndex(
        (declaration?: Dynamic): Dynamic =>
          /^position\s*:\s*absolute$/i.test(declaration),
      ),
      sizingPairStart: Dynamic = -1;
    for (let position: Dynamic = keptIndexes.length - 2; position >= 0; position--) {
      let boxSizingIndex: Dynamic = keptIndexes[position],
        widthIndex: Dynamic = keptIndexes[position + 1];
      if (
        boxSizingIndex > absoluteIndex &&
        /^box-sizing\s*:\s*border-box$/i.test(declarations[boxSizingIndex]) &&
        /^width\s*:\s*\d+(\.\d+)?px$/i.test(declarations[widthIndex])
      ) {
        sizingPairStart = position;
        break;
      }
    }
    let cleanedStyle: Dynamic = keptIndexes
      .filter(
        (declarationIndex?: Dynamic, position?: Dynamic): Dynamic =>
          sizingPairStart < 0 || (position !== sizingPairStart && position !== sizingPairStart + 1),
      )
      .map((declarationIndex?: Dynamic): Dynamic => declarations[declarationIndex])
      .join("; ");
    cleanedStyle === ""
      ? rootElement.removeAttribute("style")
      : rootElement.setAttribute("style", cleanedStyle);
  }
  return fromParserHtml(template.innerHTML);
}
function buildDcDocument(
  artboardHtml?: Dynamic,
  sourceHtml: Dynamic = "",
  buildOptions: Dynamic = {},
): Dynamic {
  let parsedDocument: Dynamic = parseDcHtmlDocument(sourceHtml),
    headerHtml: Dynamic = parsedDocument ? sourceHtml.slice(0, parsedDocument.templateStart) : "",
    documentHead: Dynamic = /<script\b[^>]*support\.js/i.test(headerHtml)
      ? headerHtml
      : ClipboardHtmlPlacementHtml,
    items: Dynamic = [
      ...(parsedDocument ? parsedDocument.template : sourceHtml).matchAll(
        /<helmet\b([^>]*)>([\s\S]*?)<\/helmet>/gi,
      ),
    ];
  return [
    documentHead.trimEnd(),
    "  <helmet" + (items[0]?.[1] ?? "") + ">",
    "    <style>",
    "      html, body { margin: 0; height: 100%; }",
    "    </style>",
    items
      .map((helmet?: Dynamic): Dynamic => (helmet[2] ?? "").trim())
      .filter((css?: Dynamic): Dynamic => css !== "").join(`
`),
    "  </helmet>",
    artboardHtml,
    "</x-dc>",
    ...(buildOptions.logic === false
      ? []
      : [stripPrivateDcProps(sourceHtml)].filter(
          (block?: Dynamic): Dynamic => block != null,
        )),
    "</body>",
    "</html>",
    "",
  ].join(`
`);
}
function stripPrivateDcProps(html?: Dynamic): Dynamic {
  let strippedHtml: Dynamic = html,
    propsJson: Dynamic = getDcPropsJson(html);
  if (propsJson != null) {
    let text: Dynamic = "";
    try {
      let props: Dynamic = JSON.parse(propsJson),
        publicProps: Dynamic = Object.fromEntries(
          Object.entries(props).filter(
            ([key]: Dynamic): Dynamic => !key.startsWith("$"),
          ),
        );
      text = Object.keys(publicProps).length > 0 ? JSON.stringify(publicProps) : "";
    } catch {
      text = "";
    }
    strippedHtml = setDcPropsJson(html, text) ?? html;
  }
  let parsedHtml: Dynamic = parseDcHtmlDocument(strippedHtml);
  return parsedHtml?.jsMatch && parsedHtml.jsMatch.index >= parsedHtml.templateEnd
    ? parsedHtml.jsMatch[0]
    : null;
}
export {
  buildDcDocument,
  ClipboardHtmlPlacementHtml,
  positionPastedHtml,
  stripPrivateDcProps,
  unpositionPastedHtml,
};
export function installEditorClipboardHtmlPlacement(): () => void {
  return () => {
    ClipboardHtmlPlacementHtml = `<!doctype html>
<html>
<head><meta charset="utf-8"><script src="./support.js"><\/script></head>
<body>
<x-dc>`;
  };
}
