/** Restored application module; prepare first, initialize in original order. */
import {
  type Dynamic,
} from "../runtime-types";
import { projectDirectoryOf, resolveProjectAssetPath, rewriteProjectAssets } from "./asset-rewriting";
import { inlineStylesheetImports, leadingStylesheetAtRuleEnd, moveCssImportsFirst, escapeNoscriptInCss, hasRootRelativeCssReference, stripStylesheetComments } from "./css-rewriting";
import { findHtmlTags, getHtmlAttribute, maskHtmlRawContent, parseHtmlAttributes, cssImportPattern } from "./html-scanner";

var linkedStylesheetHydrationScript: Dynamic;
var addressRefusedMessageKey: Dynamic;
var addressRefusedOnerror: Dynamic;
var addressRefusedListenerScript: Dynamic;
var withAddressRefusedOnerror: Dynamic;
var buildOpenTag: Dynamic;
function findDocumentHeadInsertion(html: string): number {
  let insertionIndex: number = html.length;
  for (let marker of ["<x-dc", "<helmet", "<template", "<body"]) {
    let markerIndex: number = html.indexOf(marker);
    markerIndex >= 0 && markerIndex < insertionIndex && (insertionIndex = markerIndex);
  }
  return insertionIndex;
}
function hydrateLinkedStylesheetScript(partKey: string): string {
  let partKeyJson: string = JSON.stringify(partKey).replace(/</g, "\\u003c");
  return (
    "<script>(function (s, p) { if (s && p && typeof p[" +
    partKeyJson +
    "] === 'string') s.textContent = p[" +
    partKeyJson +
    "]; })(document.currentScript && document.currentScript.previousElementSibling, window.__dcParts);<\/script>"
  );
}
function rewriteHtmlDependencies(
  html?: Dynamic,
  files?: Dynamic,
  baseDirectory?: Dynamic,
  rewriteOptions: Dynamic = {},
): Dynamic {
  if (!/<(?:link|script|style)\b/i.test(html)) return html;
  let rewriteTags: Dynamic = (
      sourceHtml?: Dynamic,
      tagName?: Dynamic,
      rewriteTag?: Dynamic,
    ): Dynamic => {
      let maskedHtml: Dynamic = maskHtmlRawContent(sourceHtml),
        lowerMaskedHtml: Dynamic = maskedHtml.replace(
          /[A-Z]+/g,
          (letters?: Dynamic): Dynamic => letters.toLowerCase(),
        ),
        output: Dynamic = "",
        copiedUntil: Dynamic = 0;
      for (let [tagStart, tagEnd] of findHtmlTags(
        maskedHtml,
        tagName,
      ) as Dynamic) {
        if (tagStart < copiedUntil) continue;
        let replacement: Dynamic = rewriteTag(
          sourceHtml.slice(tagStart, tagEnd),
          tagEnd,
          maskedHtml,
          lowerMaskedHtml,
        );
        replacement !== undefined &&
          ((output += sourceHtml.slice(copiedUntil, tagStart) + replacement[0]),
          (copiedUntil = replacement[1]));
      }
      return output + sourceHtml.slice(copiedUntil);
    },
    rewrittenHtml: Dynamic = rewriteTags(
      html,
      "link",
      (
        tagText?: Dynamic,
        tagEnd?: Dynamic,
        maskedHtml?: Dynamic,
        lowerMaskedHtml?: Dynamic,
      ): Dynamic => {
        let relTokens: Dynamic = (
          getHtmlAttribute(tagText, "rel") ?? ""
        )
          .toLowerCase()
          .split(/\s+/);
        if (!relTokens.includes("stylesheet") || relTokens.includes("alternate"))
          return;
        let sheetPath: Dynamic = resolveProjectAssetPath(
          baseDirectory,
          getHtmlAttribute(tagText, "href") ?? "",
        );
        if (
          sheetPath === null ||
          !/\.css$/i.test(sheetPath) ||
          files[sheetPath] == null
        )
          return;
        let styleAttributes: Dynamic = parseHtmlAttributes(tagText, [
            "href",
            "rel",
            "type",
            "as",
            "crossorigin",
            "integrity",
            "disabled",
            "media",
          ]),
          mediaQuery: Dynamic =
            getHtmlAttribute(tagText, "disabled") !== null
              ? "not all"
              : getHtmlAttribute(tagText, "media");
        mediaQuery !== null && (styleAttributes.media = mediaQuery);
        rewriteOptions.covered?.has(sheetPath) && (styleAttributes["data-dc-sheet"] = sheetPath);
        let styleOpenTag: Dynamic =
          "<style" +
          Object.entries(styleAttributes)
            .map(
              ([attributeName, attributeValue]: Dynamic): Dynamic =>
                " " +
                attributeName +
                '="' +
                attributeValue
                  .replace(/&/g, "&amp;")
                  .replace(/"/g, "&quot;")
                  .replace(/</g, "&lt;") +
                '"',
            )
            .join("") +
          ">";
        if (rewriteOptions.covered?.has(sheetPath))
          return [styleOpenTag + "</style>", tagEnd];
        let isInHead: Dynamic =
            tagEnd - tagText.length < findDocumentHeadInsertion(lowerMaskedHtml),
          sheetUrl: Dynamic = rewriteOptions.parts?.urlFor?.(sheetPath);
        if (
          sheetUrl !== undefined &&
          files[sheetPath].length >= (rewriteOptions.parts?.min ?? 1 / 0) &&
          isInHead
        ) {
          mediaQuery === null && rewriteOptions.inlined?.add(sheetPath);
          rewriteOptions.parts?.urls && (rewriteOptions.parts.urls[sheetPath] = sheetUrl);
          let linkAttributes: Dynamic = {
            ...styleAttributes,
            rel: "stylesheet",
            href: sheetUrl,
            "data-dc-sheet": sheetPath,
            onerror: linkedStylesheetHydrationScript,
          };
          return [
            "<link" +
              Object.entries(linkAttributes)
                .map(
                  ([attributeName, attributeValue]: Dynamic): Dynamic =>
                    " " +
                    attributeName +
                    '="' +
                    String(attributeValue)
                      .replace(/&/g, "&amp;")
                      .replace(/"/g, "&quot;")
                      .replace(/</g, "&lt;") +
                    '"',
                )
                .join("") +
              ">",
            tagEnd,
          ];
        }
        let inlinedSheetPaths: Dynamic = new Set(rewriteOptions.covered ?? []),
          stylesheetCss: Dynamic = moveCssImportsFirst(
            inlineStylesheetImports(sheetPath, files, inlinedSheetPaths),
          );
        if (mediaQuery === null)
          for (let inlinedPath of inlinedSheetPaths as Dynamic) rewriteOptions.inlined?.add(inlinedPath);
        let installedUrl: Dynamic =
          isInHead &&
          [...inlinedSheetPaths].every(
            (inlinedPath?: Dynamic): Dynamic =>
              !hasRootRelativeCssReference(files[inlinedPath] ?? "") &&
              rewriteOptions.installedUrlFor?.(inlinedPath, files[inlinedPath] ?? "") !==
                undefined,
          )
            ? rewriteOptions.installedUrlFor?.(sheetPath, files[sheetPath])
            : undefined;
        if (installedUrl !== undefined) {
          rewriteOptions.byAddress && (rewriteOptions.byAddress[sheetPath] = installedUrl);
          let { onerror: originalOnerror, ...keptAttributes }: Dynamic = parseHtmlAttributes(
            tagText,
            ["href", "type", "integrity", "crossorigin"],
            true,
          );
          return [
            buildOpenTag("link", {
              ...keptAttributes,
              href: installedUrl,
              onerror: withAddressRefusedOnerror(originalOnerror),
            }),
            tagEnd,
          ];
        }
        if (rewriteOptions.parts && stylesheetCss.length >= rewriteOptions.parts.min && isInHead) {
          let partKey: Dynamic = "sheet:" + sheetPath;
          rewriteOptions.parts.out[partKey] = stylesheetCss;
          return [
            styleOpenTag.slice(0, -1) +
              ' data-dc-part="' +
              partKey
                .replace(/&/g, "&amp;")
                .replace(/"/g, "&quot;")
                .replace(/</g, "&lt;") +
              '"></style>' +
              hydrateLinkedStylesheetScript(partKey),
            tagEnd,
          ];
        }
        let escapedCss: Dynamic = escapeNoscriptInCss(
          stylesheetCss.replace(/<\/style/gi, "<\\/style"),
        );
        return [styleOpenTag + escapedCss + "</style>", tagEnd];
      },
    );
  rewrittenHtml = rewriteTags(
    rewrittenHtml,
    "style",
    (
      tagText?: Dynamic,
      tagEnd?: Dynamic,
      maskedHtml?: Dynamic,
      lowerMaskedHtml?: Dynamic,
    ): Dynamic => {
      let closeIndex: Dynamic = lowerMaskedHtml.indexOf("</style", tagEnd),
        styleCss: Dynamic = rewrittenHtml.slice(
          tagEnd,
          closeIndex < 0 ? undefined : closeIndex,
        );
      if (!/@import/i.test(styleCss)) return;
      let inlinedSheetPaths: Dynamic = new Set(rewriteOptions.covered ?? []),
        didRewrite: Dynamic = false,
        strippedCss: Dynamic = stripStylesheetComments(styleCss),
        leadingAtRulesEnd: Dynamic = leadingStylesheetAtRuleEnd(strippedCss),
        rewrittenCss: Dynamic = strippedCss.replace(
          cssImportPattern,
          (importRule?: Dynamic, ...importGroups: Dynamic[]): Dynamic => {
            if (importGroups[6] >= leadingAtRulesEnd) {
              didRewrite = true;
              return "";
            }
            if (importGroups[5]) return importRule;
            let importPath: Dynamic = resolveProjectAssetPath(
              baseDirectory,
              String(
                importGroups[0] ??
                  importGroups[1] ??
                  importGroups[2] ??
                  importGroups[3] ??
                  importGroups[4] ??
                  "",
              ),
            );
            return importPath === null ||
              !/\.css$/i.test(importPath) ||
              files[importPath] == null
              ? importRule
              : ((didRewrite = true),
                inlineStylesheetImports(
                  importPath,
                  files,
                  inlinedSheetPaths,
                ) +
                  `
`);
          },
        );
      if (didRewrite) {
        for (let inlinedPath of inlinedSheetPaths as Dynamic) rewriteOptions.inlined?.add(inlinedPath);
        return [
          tagText +
            escapeNoscriptInCss(
              moveCssImportsFirst(rewrittenCss).replace(
                /<\/style/gi,
                "<\\/style",
              ),
            ),
          closeIndex < 0 ? rewrittenHtml.length : closeIndex,
        ];
      }
    },
  );
  rewrittenHtml = rewriteTags(
    rewrittenHtml,
    "script",
    (
      tagText?: Dynamic,
      tagEnd?: Dynamic,
      maskedHtml?: Dynamic,
      lowerMaskedHtml?: Dynamic,
    ): Dynamic => {
      let closeIndex: Dynamic = lowerMaskedHtml.indexOf("<\/script", tagEnd),
        closeTagEnd: Dynamic = closeIndex < 0 ? -1 : maskedHtml.indexOf(">", closeIndex),
        scriptSrc: Dynamic = getHtmlAttribute(tagText, "src");
      if (
        closeTagEnd < 0 ||
        scriptSrc === null ||
        getHtmlAttribute(tagText, "nomodule") !== null
      )
        return;
      let afterCloseTag: Dynamic = closeTagEnd + 1,
        scriptType: Dynamic = (getHtmlAttribute(tagText, "type") ?? "")
          .trim()
          .toLowerCase(),
        scriptPath: Dynamic = resolveProjectAssetPath(
          baseDirectory,
          scriptSrc,
        );
      if (
        scriptPath === null ||
        !/\.m?js$/i.test(scriptPath) ||
        /(^|\/)support\.js$/.test(scriptPath) ||
        files[scriptPath] == null
      )
        return;
      if (scriptType === "module")
        return [
          '<script type="module">import ' +
            JSON.stringify(
              "/appifact/" +
                scriptPath.split("/").map(encodeURIComponent).join("/"),
            ) +
            ";<\/script>",
          afterCloseTag,
        ];
      if (
        scriptType !== "" &&
        scriptType !== "text/javascript" &&
        scriptType !== "application/javascript"
      )
        return;
      let installedUrl: Dynamic =
        tagEnd - tagText.length < findDocumentHeadInsertion(lowerMaskedHtml)
          ? rewriteOptions.installedUrlFor?.(scriptPath, files[scriptPath])
          : undefined;
      if (installedUrl !== undefined) {
        rewriteOptions.byAddress && (rewriteOptions.byAddress[scriptPath] = installedUrl);
        let {
          async: asyncAttribute,
          onerror: originalOnerror,
          ...keptAttributes
        }: Dynamic = parseHtmlAttributes(
          tagText,
          ["src", "integrity", "crossorigin"],
          true,
        );
        return [
          buildOpenTag("script", {
            ...keptAttributes,
            ...(asyncAttribute !== undefined
              ? {
                  defer: "",
                }
              : {}),
            src: installedUrl,
            onerror: withAddressRefusedOnerror(originalOnerror),
          }) + "<\/script>",
          afterCloseTag,
        ];
      }
      let runAttributes: Dynamic = parseHtmlAttributes(tagText, [
        "src",
        "type",
        "nomodule",
      ]);
      return [
        "<script>" +
          ("__dcRun(" +
            (
              JSON.stringify(scriptPath) +
              (Object.keys(runAttributes).length
                ? ", " + JSON.stringify(runAttributes)
                : "")
            ).replace(/</g, "\\u003c") +
            ")") +
          "<\/script>",
        afterCloseTag,
      ];
    },
  );
  return rewrittenHtml;
}
function rewritePreviewAssets(
  html?: Dynamic,
  files?: Dynamic,
  filePath?: Dynamic,
  rewriteOptions?: Dynamic,
): Dynamic {
  let baseDirectory: Dynamic = projectDirectoryOf(filePath);
  return rewriteHtmlDependencies(
    rewriteProjectAssets(html, files, baseDirectory),
    files,
    baseDirectory,
    rewriteOptions,
  );
}
export {
  addressRefusedMessageKey as DcAddressRefusedValue,
  findDocumentHeadInsertion,
  hydrateLinkedStylesheetScript,
  linkedStylesheetHydrationScript,
  buildOpenTag as PreviewDependencyInjectionJoin,
  addressRefusedOnerror as PreviewDependencyInjectionResolvedValue,
  addressRefusedListenerScript as PreviewDependencyInjectionResolvedValue_2,
  withAddressRefusedOnerror as PreviewDependencyInjectionTrim,
  rewriteHtmlDependencies,
  rewritePreviewAssets,
};
export function installPreviewDependencyInjection(): () => void {
  return () => {
    linkedStylesheetHydrationScript =
      "(function(l){var k=l.getAttribute('data-dc-sheet'),f=window.__dcFiles||{};if(!Object.prototype.hasOwnProperty.call(f,k))return;var s=document.createElement('style');s.setAttribute('data-dc-sheet',k);s.textContent=String(f[k]);l.replaceWith(s);})(this)";
    addressRefusedMessageKey = "__dc_address_refused";
    addressRefusedOnerror =
      "try{parent.postMessage({" +
      addressRefusedMessageKey +
      ":1,u:this.href||this.src},'*')}catch(e){}";
    addressRefusedListenerScript =
      String.raw`
(function () {
  var P = window.parent, root = window.__dcProjectRoot;
  if (!P || P === window || typeof root !== 'string') return;
  /* window.origin, not location.origin: in a srcdoc frame location.origin is 'null', and window.origin is the page's */
  var under = window.origin + root;
  window.addEventListener('error', function (ev) {
    var t = ev.target;
    if (!t || t === window || typeof t.getAttribute !== 'function') return;
    var a = t.getAttribute('src');
    if (a === null) a = t.getAttribute('href');
    /* an empty address is read by a browser as the page's own */
    if (a !== null && (a === '' || a.charAt(0) === '#')) return;
    var u = t.currentSrc || t.src || t.href;
    if (typeof u !== 'string' || u.indexOf(under) !== 0) return;
    try { P.postMessage({ ` +
      addressRefusedMessageKey +
      String.raw`: 1, u: u }, '*'); } catch (e) {}
  }, true);
})();
`;
    withAddressRefusedOnerror = (originalOnerror?: Dynamic): Dynamic =>
      originalOnerror === undefined || originalOnerror.trim() === ""
        ? addressRefusedOnerror
        : addressRefusedOnerror + ";" + originalOnerror;
    buildOpenTag = (
      tagName?: Dynamic,
      attributes?: Dynamic,
    ): Dynamic =>
      "<" +
      tagName +
      Object.entries(attributes)
        .map(
          ([attributeName, attributeValue]: Dynamic): Dynamic =>
            " " +
            attributeName +
            (attributeValue === ""
              ? ""
              : '="' +
                attributeValue
                  .replace(/&/g, "&amp;")
                  .replace(/"/g, "&quot;")
                  .replace(/</g, "&lt;") +
                '"'),
        )
        .join("") +
      ">";
  };
}
