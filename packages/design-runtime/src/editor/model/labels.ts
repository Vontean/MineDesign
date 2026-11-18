import { uiMessage } from '@minedesign/contracts/ui-messages';
/** Restored application module; prepare first, initialize in original order. */
import {
  type Dynamic,
} from "../../runtime-types";
import { getStyleProperty } from "../css/declarations";
import { HtmlTagNormalizationFromEntriesValue } from "../html/tag-normalization";
import { ModelDomTextRegistry } from "./dom-text";

var ModelLabelsTextHeadingParagraphSet: Dynamic;
var ModelLabelsSubscribers: Dynamic;
function readableTagName(input?: Dynamic): Dynamic {
  return Object.hasOwn(HtmlTagNormalizationFromEntriesValue, input)
    ? HtmlTagNormalizationFromEntriesValue[input]
    : input;
}
function tagIcon(input?: Dynamic): Dynamic {
  return Object.hasOwn(ModelDomTextRegistry, input)
    ? ModelDomTextRegistry[input]
    : undefined;
}
function detectContainerLayout(input?: Dynamic, options?: Dynamic): Dynamic {
  if (input.children.length === 0) return null;
  let value: Dynamic = (
    getStyleProperty(options, "display") ?? ""
  ).trim();
  return value === "flex" || value === "inline-flex"
    ? (getStyleProperty(options, "flex-direction") ?? "")
        .trim()
        .startsWith("column")
      ? "column"
      : "row"
    : value === "grid" || value === "inline-grid"
      ? "grid"
      : null;
}
function labelToElementKind(input?: Dynamic, options?: Dynamic): Dynamic {
  if (ModelLabelsTextHeadingParagraphSet.has(input)) return "text";
  if (input === "Link") return "link";
  if (input === "Image") return "image";
  if (input === "Table") return "table";
  if (input === "Component") return "component";
  if (input === "Rectangle") return "rect";
  if (input === "Oval") return "oval";
  if (input === "Line") return "line";
  if (ModelLabelsSubscribers.has(input)) return options ?? "frame";
}
function isImportedIcon(element?: Dynamic): Dynamic {
  let value: Dynamic = element.tagName.toLowerCase();
  return value !== "x-import" && value !== "dc-import"
    ? false
    : (
        (element.getAttribute("from") ?? "") +
        " " +
        (element.getAttribute("component-from-global-scope") ?? "") +
        " " +
        (element.getAttribute("component") ?? "")
      )
        .toLowerCase()
        .includes("deck-stage");
}
function slideElementLabel(element?: Dynamic): Dynamic {
  let value: Dynamic = (element.getAttribute("data-deck-slide") ?? "").trim();
  if (/^\d+$/.test(value)) return uiMessage("inspector.labels.slideValue1", { value1: String(parseInt(value, 10) + 1) });
  let parentElement: Dynamic = element.parentElement;
  if (!parentElement || parentElement.tagName.toLowerCase() !== "deck-stage")
    return null;
  let value2: Dynamic =
      /^(template|script|style|sc-raw-script|sc-raw-style|sc-helmet)$/,
    index: Dynamic = 0;
  for (let value3 of parentElement.children as Dynamic)
    if (!value2.test(value3.tagName.toLowerCase())) {
      if (value3 === element) return uiMessage("inspector.labels.slideValue1", { value1: String(index + 1) });
      index++;
    }
  return null;
}
function isDeckStageElement(element?: Dynamic): Dynamic {
  let value: Dynamic = element.tagName.toLowerCase();
  return (
    value === "deck-stage" ||
    (value === "x-import" &&
      element.getAttribute("component-from-global-scope") === "deck-stage")
  );
}
function getDropContainer(input?: Dynamic, options?: Dynamic): Dynamic {
  if (!input || options === "root-end") return null;
  let value: Dynamic =
    options === "into" ? input : (input.parentElement ?? null);
  if (!value) return null;
  let parentElement: Dynamic = value.parentElement,
    value2: Dynamic = parentElement?.parentElement ?? null,
    value3: Dynamic = null,
    value4: Dynamic = null;
  parentElement && isDeckStageElement(parentElement)
    ? ((value3 = parentElement), (value4 = value))
    : parentElement &&
      value2 &&
      isDeckStageElement(value2) &&
      ((value3 = value2), (value4 = parentElement));
  return !value3 || !value4
    ? null
    : {
        w: parseInt(value3.getAttribute("width") ?? "", 10) || 1920,
        h: parseInt(value3.getAttribute("height") ?? "", 10) || 1080,
        slide: value4,
      };
}
export {
  detectContainerLayout,
  getDropContainer,
  isDeckStageElement,
  isImportedIcon,
  labelToElementKind,
  ModelLabelsSubscribers,
  ModelLabelsTextHeadingParagraphSet,
  readableTagName,
  slideElementLabel,
  tagIcon,
};
export function installEditorModelLabels(): () => void {
  return () => {
    ModelLabelsTextHeadingParagraphSet = new Set([
      "Text",
      "Heading",
      "Paragraph",
    ]);
    ModelLabelsSubscribers = new Set([
      "Section",
      "Article",
      "Header",
      "Footer",
      "Nav",
      "Aside",
      "Main",
      "Form",
      "List",
      "List item",
      "Figure",
      "Quote",
      "group",
      "Row",
      "Column",
      "Grid",
      "Conditional group",
      "Repeating group",
    ]);
  };
}
