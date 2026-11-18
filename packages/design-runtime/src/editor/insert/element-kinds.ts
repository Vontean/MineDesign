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
function classifyElementStyleKind(input?: Dynamic): Dynamic {
  let value: Dynamic = input.toLowerCase();
  return InsertElementKindsSubscribers.has(value)
    ? "text"
    : value === "img"
      ? "image"
      : InsertElementKindsPathLinePolylineSet.has(value)
        ? "line"
        : InsertElementKindsSvgRectCircleSet.has(value)
          ? "shape"
          : InsertElementKindsSubscribers_2.has(value)
            ? "box"
            : "other";
}
function isTextCapableElement(element?: Dynamic, options?: Dynamic): Dynamic {
  let value: Dynamic = element.tagName.toLowerCase();
  return InsertElementKindsSubscribers.has(value) ||
    (InsertElementKindsSubscribers_2.has(value) && options) ||
    (value === "div" &&
      element.children.length === 1 &&
      /^(ul|ol)$/i.test(element.children[0].tagName) &&
      [...element.children[0].children].every(
        (input?: Dynamic): Dynamic =>
          /^li$/i.test(input.tagName) && InsertElementKindsEvery(input),
      ))
    ? "text"
    : value === "img"
      ? "image"
      : InsertElementKindsPathLinePolylineSet.has(value) ||
          (value === "svg" &&
            ((/(^|;)\s*fill:\s*none/.test(
              element.getAttribute("style") ?? "",
            ) &&
              element.querySelector("rect,circle,ellipse,polygon") ===
                null) ||
              inspectSvgArrow(element) !== null))
        ? "line"
        : InsertElementKindsSvgRectCircleSet.has(value)
          ? "shape"
          : InsertElementKindsSubscribers_2.has(value)
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
    InsertElementKindsEvery = (input?: Dynamic): Dynamic =>
      [...input.querySelectorAll("*")].every(
        (input2?: Dynamic): Dynamic =>
          HtmlTagNormalizationSubscribers.has(
            input2.tagName.toLowerCase(),
          ),
      );
  };
}
