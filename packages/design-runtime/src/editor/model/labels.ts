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
function readableTagName(tagName?: Dynamic): Dynamic {
  return Object.hasOwn(HtmlTagNormalizationFromEntriesValue, tagName)
    ? HtmlTagNormalizationFromEntriesValue[tagName]
    : tagName;
}
function tagIcon(tagName?: Dynamic): Dynamic {
  return Object.hasOwn(ModelDomTextRegistry, tagName)
    ? ModelDomTextRegistry[tagName]
    : undefined;
}
function detectContainerLayout(element?: Dynamic, computedStyle?: Dynamic): Dynamic {
  if (element.children.length === 0) return null;
  let display: Dynamic = (
    getStyleProperty(computedStyle, "display") ?? ""
  ).trim();
  return display === "flex" || display === "inline-flex"
    ? (getStyleProperty(computedStyle, "flex-direction") ?? "")
        .trim()
        .startsWith("column")
      ? "column"
      : "row"
    : display === "grid" || display === "inline-grid"
      ? "grid"
      : null;
}
function labelToElementKind(label?: Dynamic, fallbackKind?: Dynamic): Dynamic {
  if (ModelLabelsTextHeadingParagraphSet.has(label)) return "text";
  if (label === "Link") return "link";
  if (label === "Image") return "image";
  if (label === "Table") return "table";
  if (label === "Component") return "component";
  if (label === "Rectangle") return "rect";
  if (label === "Oval") return "oval";
  if (label === "Line") return "line";
  if (ModelLabelsSubscribers.has(label)) return fallbackKind ?? "frame";
}
function isImportedIcon(element?: Dynamic): Dynamic {
  let tagName: Dynamic = element.tagName.toLowerCase();
  return tagName !== "x-import" && tagName !== "dc-import"
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
  let slideAttribute: Dynamic = (element.getAttribute("data-deck-slide") ?? "").trim();
  if (/^\d+$/.test(slideAttribute)) return uiMessage("inspector.labels.slideNumber", { number: String(parseInt(slideAttribute, 10) + 1) });
  let parentElement: Dynamic = element.parentElement;
  if (!parentElement || parentElement.tagName.toLowerCase() !== "deck-stage")
    return null;
  let ignoredTagPattern: Dynamic =
      /^(template|script|style|sc-raw-script|sc-raw-style|sc-helmet)$/,
    index: Dynamic = 0;
  for (let child of parentElement.children as Dynamic)
    if (!ignoredTagPattern.test(child.tagName.toLowerCase())) {
      if (child === element) return uiMessage("inspector.labels.slideNumber", { number: String(index + 1) });
      index++;
    }
  return null;
}
function isDeckStageElement(element?: Dynamic): Dynamic {
  let tagName: Dynamic = element.tagName.toLowerCase();
  return (
    tagName === "deck-stage" ||
    (tagName === "x-import" &&
      element.getAttribute("component-from-global-scope") === "deck-stage")
  );
}
function getDropContainer(targetElement?: Dynamic, dropPosition?: Dynamic): Dynamic {
  if (!targetElement || dropPosition === "root-end") return null;
  let container: Dynamic =
    dropPosition === "into" ? targetElement : (targetElement.parentElement ?? null);
  if (!container) return null;
  let parentElement: Dynamic = container.parentElement,
    grandparentElement: Dynamic = parentElement?.parentElement ?? null,
    deckElement: Dynamic = null,
    slideElement: Dynamic = null;
  parentElement && isDeckStageElement(parentElement)
    ? ((deckElement = parentElement), (slideElement = container))
    : parentElement &&
      grandparentElement &&
      isDeckStageElement(grandparentElement) &&
      ((deckElement = grandparentElement), (slideElement = parentElement));
  return !deckElement || !slideElement
    ? null
    : {
        w: parseInt(deckElement.getAttribute("width") ?? "", 10) || 1920,
        h: parseInt(deckElement.getAttribute("height") ?? "", 10) || 1080,
        slide: slideElement,
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
