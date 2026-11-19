/** Restored application module; prepare first, initialize in original order. */
import {
  type Dynamic,
} from "../../runtime-types";
import { HtmlTagNormalizationSubscribers } from "../html/tag-normalization";
import { inspectSvgArrow } from "../svg/arrows";

var InsertElementKindsSubscribers: Dynamic;
var InsertElementKindsSvgRectCircleSet: Dynamic;
var InsertElementKindsSubscribers_2: Dynamic;
var InsertElementKindsPathLinePolylineSet: Dynamic;
var InsertElementKindsEvery: Dynamic;
function classifyElementStyleKind(tagName?: Dynamic): Dynamic {
  let lowerTagName: Dynamic = tagName.toLowerCase();
  return InsertElementKindsSubscribers.has(lowerTagName)
    ? "text"
    : lowerTagName === "img"
      ? "image"
      : InsertElementKindsPathLinePolylineSet.has(lowerTagName)
        ? "line"
        : InsertElementKindsSvgRectCircleSet.has(lowerTagName)
          ? "shape"
          : InsertElementKindsSubscribers_2.has(lowerTagName)
            ? "box"
            : "other";
}
function isTextCapableElement(element?: Dynamic, allowContainerText?: Dynamic): Dynamic {
  let lowerTagName: Dynamic = element.tagName.toLowerCase();
  return InsertElementKindsSubscribers.has(lowerTagName) ||
    (InsertElementKindsSubscribers_2.has(lowerTagName) && allowContainerText) ||
    (lowerTagName === "div" &&
      element.children.length === 1 &&
      /^(ul|ol)$/i.test(element.children[0].tagName) &&
      [...element.children[0].children].every(
        (listItem?: Dynamic): Dynamic =>
          /^li$/i.test(listItem.tagName) && InsertElementKindsEvery(listItem),
      ))
    ? "text"
    : lowerTagName === "img"
      ? "image"
      : InsertElementKindsPathLinePolylineSet.has(lowerTagName) ||
          (lowerTagName === "svg" &&
            ((/(^|;)\s*fill:\s*none/.test(
              element.getAttribute("style") ?? "",
            ) &&
              element.querySelector("rect,circle,ellipse,polygon") ===
                null) ||
              inspectSvgArrow(element) !== null))
        ? "line"
        : InsertElementKindsSvgRectCircleSet.has(lowerTagName)
          ? "shape"
          : InsertElementKindsSubscribers_2.has(lowerTagName)
            ? "box"
            : "other";
}
export {
  classifyElementStyleKind,
  InsertElementKindsEvery,
  InsertElementKindsPathLinePolylineSet,
  InsertElementKindsSubscribers,
  InsertElementKindsSubscribers_2,
  InsertElementKindsSvgRectCircleSet,
  isTextCapableElement,
};
export function installEditorInsertElementKinds(): () => void {
  return () => {
    InsertElementKindsSubscribers = new Set([
      "h1",
      "h2",
      "h3",
      "h4",
      "h5",
      "h6",
      "p",
      "button",
      "label",
      "li",
      "blockquote",
      "td",
      "th",
      "dt",
      "dd",
      "caption",
      "figcaption",
      "pre",
      "time",
      ...HtmlTagNormalizationSubscribers,
    ]);
    InsertElementKindsSvgRectCircleSet = new Set([
      "svg",
      "rect",
      "circle",
      "ellipse",
      "polygon",
    ]);
    InsertElementKindsSubscribers_2 = new Set([
      "div",
      "section",
      "article",
      "header",
      "footer",
      "nav",
      "main",
      "aside",
      "ul",
      "ol",
      "table",
      "tr",
      "thead",
      "tbody",
      "form",
      "figure",
      "details",
      "summary",
      "fieldset",
      "dl",
    ]);
    InsertElementKindsPathLinePolylineSet = new Set([
      "path",
      "line",
      "polyline",
      "hr",
    ]);
    InsertElementKindsEvery = (element?: Dynamic): Dynamic =>
      [...element.querySelectorAll("*")].every(
        (descendant?: Dynamic): Dynamic =>
          HtmlTagNormalizationSubscribers.has(
            descendant.tagName.toLowerCase(),
          ),
      );
  };
}
