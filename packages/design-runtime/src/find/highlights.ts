/** Restored application module; prepare first, initialize in original order. */
import {
  type Dynamic,
} from "../runtime-types";

var findHighlightName: Dynamic;
var activeFindHighlightName: Dynamic;
var findHighlightStyles: Dynamic;
var findHighlightStylesheetCache: Dynamic;
function getFindHighlightApi(document?: Dynamic): Dynamic {
  let defaultView: Dynamic = document.defaultView,
    value: Dynamic = defaultView?.CSS?.highlights;
  return !defaultView ||
    !value ||
    typeof defaultView.Highlight != "function" ||
    typeof defaultView.CSSStyleSheet != "function"
    ? null
    : {
        highlights: value,
        Highlight: defaultView.Highlight,
        CSSStyleSheet: defaultView.CSSStyleSheet,
      };
}
function adoptFindStylesheet(
  document?: Dynamic,
  stylesheet?: Dynamic,
): Dynamic {
  if (!document.adoptedStyleSheets.includes(stylesheet))
    try {
      document.adoptedStyleSheets.push(stylesheet);
    } catch {
      document.adoptedStyleSheets = [
        ...document.adoptedStyleSheets,
        stylesheet,
      ];
    }
}
function unadoptFindStylesheet(
  document?: Dynamic,
  stylesheet?: Dynamic,
): Dynamic {
  let value: Dynamic = document.adoptedStyleSheets.indexOf(stylesheet);
  if (value !== -1)
    try {
      document.adoptedStyleSheets.splice(value, 1);
    } catch {
      document.adoptedStyleSheets = document.adoptedStyleSheets.filter(
        (stylesheetCandidate?: Dynamic): Dynamic => stylesheetCandidate !== stylesheet,
      );
    }
}
function applyFindHighlights(
  document?: Dynamic,
  ranges?: Dynamic,
  activeRange?: Dynamic,
): Dynamic {
  let value: Dynamic = getFindHighlightApi(document);
  if (value === null) return false;
  let entry: Dynamic = findHighlightStylesheetCache.get(document);
  entry === undefined &&
    ((entry = new value.CSSStyleSheet()),
    entry.replaceSync(findHighlightStyles),
    findHighlightStylesheetCache.set(document, entry));
  adoptFindStylesheet(document, entry);
  value.highlights.set(
    findHighlightName,
    new value.Highlight(
      ...ranges.filter((range?: Dynamic): Dynamic => range !== activeRange),
    ),
  );
  activeRange === null
    ? value.highlights.delete(activeFindHighlightName)
    : value.highlights.set(
        activeFindHighlightName,
        new value.Highlight(activeRange),
      );
  return true;
}
function clearFindHighlights(document?: Dynamic): Dynamic {
  let value: Dynamic = getFindHighlightApi(document);
  value?.highlights.delete(findHighlightName);
  value?.highlights.delete(activeFindHighlightName);
  let entry: Dynamic = findHighlightStylesheetCache.get(document);
  entry !== undefined &&
    (unadoptFindStylesheet(document, entry),
    findHighlightStylesheetCache.delete(document));
}
export {
  activeFindHighlightName,
  adoptFindStylesheet,
  applyFindHighlights,
  clearFindHighlights,
  findHighlightName,
  findHighlightStyles,
  findHighlightStylesheetCache,
  getFindHighlightApi,
  unadoptFindStylesheet,
};
export function installFindHighlights(): () => void {
  return () => {
    findHighlightName = "mc-find";
    activeFindHighlightName = "mc-find-active";
    findHighlightStyles = `::highlight(${findHighlightName}) { background-color: rgb(255 213 0); color: #000; } ::highlight(${activeFindHighlightName}) { background-color: rgb(255 150 50); color: #000; }`;
    findHighlightStylesheetCache = new WeakMap();
  };
}
