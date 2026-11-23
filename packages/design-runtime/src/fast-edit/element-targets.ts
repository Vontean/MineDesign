/** Restored application module; prepare first, initialize in original order. */
import {
  type Dynamic,
} from "../runtime-types";
import { extractVisibleElementText } from "../canvas/content-snapshots";
import { toParserHtml } from "../editor/html/tag-normalization";
import { isDecorativeElement } from "./journal";
import { truncateLargeDataUris } from "./prompt-context";
import { FAST_EDIT_TIMEOUT_SENTINEL, resolveRenderedElementPath, resolveTemplateHandleId, withFastEditTimeout } from "./session";

var STRUCTURAL_LEAF_ELEMENT_TAGS: Dynamic;
var pickTargetAppearanceContext: Dynamic;
var pickTargetSiblingContext: Dynamic;
var readTemplateLoopHtml: Dynamic;
var LEAF_TARGET_ELEMENT_TAGS: Dynamic;
var isInsideSvgDefinitions: Dynamic;
var countEmptySvgDrawings: Dynamic;
var isEmptyStructuralTemplate: Dynamic;
var targetUtf8Encoder: Dynamic;
var nearestRawTemplateParent: Dynamic;
var isSuitableTextTarget: Dynamic;
var containsOnlyTemplateInterpolation: Dynamic;
var directTargetText: Dynamic;
function parseTargetTemplate(html?: Dynamic): Dynamic {
  let template: Dynamic = (document as Dynamic).createElement("template");
  template.innerHTML = toParserHtml(html);
  return template.content;
}
function findEmptyDrawingTarget(
  element?: Dynamic,
  prefix?: Dynamic,
): Dynamic {
  if (
    element.localName !== "svg" &&
    (element.textContent ?? "").trim() !== ""
  )
    return null;
  let drawing: Dynamic = element.closest("svg") ?? element;
  if (element.localName !== "svg")
    for (
      let parentElement: Dynamic = drawing.parentElement;
      parentElement !== null &&
      isDecorativeElement(parentElement);
      parentElement = parentElement.parentElement
    )
      drawing = parentElement;
  let value: Dynamic = drawing.getAttribute("id") ?? "";
  return isDecorativeElement(drawing) && prefix.test(value)
    ? {
        id: value,
        parts: drawing.querySelectorAll("*").length,
      }
    : null;
}
function describeTemplateElementTarget(
  element?: Dynamic,
  prefix?: Dynamic,
  loopIndex?: Dynamic,
): Dynamic {
  let id: Dynamic = element.getAttribute("id") ?? "",
    directText: Dynamic = directTargetText(element);
  if (/^sc-(?!raw-)/.test(element.localName)) return null;
  let value: Dynamic = new RegExp("^" + prefix + "\\d{1,6}$"),
    drawingTarget: Dynamic = findEmptyDrawingTarget(element, value);
  return value.test(id)
    ? {
        id: id,
        tag: element.localName.replace(/^sc-raw-/, ""),
        text: element.textContent ?? "",
        own: directText,
        parent: element.parentElement?.getAttribute("id") ?? "",
        hollow:
          directText === "" &&
          drawingTarget === null &&
          !LEAF_TARGET_ELEMENT_TAGS.has(
            element.localName.replace(/^sc-raw-/, ""),
          ) &&
          (element.children.length > 0 ||
            !value.test(element.parentElement?.getAttribute("id") ?? "")) &&
          !isSuitableTextTarget(element),
        inList: loopIndex >= 0,
        list: loopIndex,
        drawing: drawingTarget,
      }
    : null;
}
function resolveClickedElementTarget(
  selectorPath?: Dynamic,
  hit?: Dynamic,
  handles?: Dynamic,
  html?: Dynamic,
  prefix?: Dynamic,
): Dynamic {
  let pathTarget: Dynamic =
      hit !== null && !hit.atPath
        ? null
        : resolveRenderedElementPath(selectorPath, html, prefix),
    handleTarget: Dynamic =
      hit === null || hit.tid === null
        ? null
        : resolveTemplateHandleId(
            hit.tid,
            handles,
            html,
            prefix,
          ),
    target: Dynamic = pathTarget ?? handleTarget;
  return target === null ||
    (pathTarget !== null &&
      handleTarget !== null &&
      pathTarget.id !== handleTarget.id) ||
    (hit !== null &&
      (hit.tag !== target.tag ||
        (!target.own.includes("{{") && hit.own !== target.own)))
    ? null
    : target;
}
async function resolveFastEditClickTarget(
  webview?: Dynamic,
  html?: Dynamic,
  click?: Dynamic,
  options?: Dynamic,
  prefix?: Dynamic,
): Promise<Dynamic> {
  if (
    click.x === undefined ||
    click.y === undefined ||
    !/^[a-z]{1,8}$/.test(prefix)
  )
    return {};
  let template: Dynamic = (document as Dynamic).createElement("template");
  template.innerHTML = options;
  let value: Dynamic = new RegExp("^" + prefix + "\\d{1,6}$"),
    items: Dynamic = [],
    callback: Dynamic = (
      input?: Dynamic,
      parentPath?: Dynamic,
      context?: Dynamic,
    ): Dynamic => {
      let children: Dynamic = Array.from(input.children);
      if (
        children.some(
          (child?: Dynamic): Dynamic =>
            /^sc-|^(?:dc|x)-import$/.test(child.localName),
        )
      )
        return;
      let entries: Dynamic = new Map();
      for (let child of children as Dynamic) {
        let siblingIndex: Dynamic = (entries.get(child.localName) ?? 0) + 1;
        entries.set(child.localName, siblingIndex);
        let elementId: Dynamic = child.getAttribute("id") ?? "";
        if (
          !/^[a-z][a-z0-9-]{0,23}$/.test(child.localName) ||
          !value.test(elementId) ||
          items.length >= 256
        )
          continue;
        let elementPath: Dynamic =
          parentPath +
          " > " +
          child.localName +
          ":nth-of-type(" +
          String(siblingIndex) +
          ")";
        items.push({
          id: elementId,
          path: elementPath,
          parent: context,
        });
        callback(child, elementPath, items.length - 1);
      }
    },
    firstElementChild: Dynamic = template.content.firstElementChild;
  if (firstElementChild === null) return {};
  callback(firstElementChild, "#dc-root > div:nth-of-type(1)", -1);
  let firstTarget: Dynamic = items.find(
      (input?: Dynamic): Dynamic =>
        input.parent === -1 &&
        !/ > (?:sc-)?helmet:nth-of-type\(\d+\)$/.test(input.path),
    ),
    topLevelElements: Dynamic = Array.from(firstElementChild.children).filter(
      (input?: Dynamic): Dynamic => !/^(?:sc-)?helmet$/.test(input.localName),
    ),
    lastTopId: Dynamic = topLevelElements[topLevelElements.length - 1]?.getAttribute("id") ?? "",
    fallbackTarget: Dynamic =
      firstTarget === undefined
        ? {}
        : {
            first: firstTarget.id,
            ...(topLevelElements.length > 1 && value.test(lastTopId)
              ? {
                  lastTop: lastTopId,
                }
              : {}),
          };
  if (webview.rectsOf === undefined) return fallbackTarget;
  let rectangles: Dynamic = await withFastEditTimeout(
    webview
      .rectsOf(
        html,
        items.map(
          (input?: Dynamic): Dynamic => ({
            path: input.path,
            tid: null,
          }),
        ),
      )
      .catch((): Dynamic => null),
    2500,
  );
  if (rectangles === FAST_EDIT_TIMEOUT_SENTINEL || rectangles === null)
    return fallbackTarget;
  let x: Dynamic = click.x,
    y3: Dynamic = click.y,
    isValidRectangle: Dynamic = (input?: Dynamic): Dynamic =>
      input != null &&
      [input.x, input.y, input.w, input.h].every(
        (coordinate?: Dynamic): Dynamic => Number.isFinite(coordinate),
      ),
    matchedIndex: Dynamic = -1;
  // MineDesign: restorer fix — the pointer's x is the outer `x` (click.x), as in the original; the restored code compared the
  // element entry (`input`) with the rect, so no artboard child ever matched the click horizontally.
  items.forEach((input?: Dynamic, itemIndex?: Dynamic): Dynamic => {
    let rectangle: Dynamic = rectangles[itemIndex];
    input.parent === matchedIndex &&
      isValidRectangle(rectangle) &&
      x >= rectangle.x &&
      x <= rectangle.x + rectangle.w &&
      y3 >= rectangle.y &&
      y3 <= rectangle.y + rectangle.h &&
      (matchedIndex = itemIndex);
  });
  if (matchedIndex < 0) return fallbackTarget;
  let belowId: Dynamic, afterId: Dynamic;
  items.forEach((input?: Dynamic, itemIndex?: Dynamic): Dynamic => {
    let rectangle: Dynamic = rectangles[itemIndex];
    input.parent !== matchedIndex ||
      !isValidRectangle(rectangle) ||
      (rectangle.y + rectangle.h <= y3
        ? (belowId = input.id)
        : rectangle.x + rectangle.w <= x && // MineDesign: restorer fix — outer `x` (click.x), as above
          y3 >= rectangle.y &&
          y3 <= rectangle.y + rectangle.h &&
          (afterId = input.id));
  });
  return {
    ...fallbackTarget,
    inside: items[matchedIndex].id,
    ...(afterId !== undefined
      ? {
          after: afterId,
        }
      : belowId !== undefined
        ? {
            below: belowId,
          }
        : {}),
  };
}
export {
  containsOnlyTemplateInterpolation,
  countEmptySvgDrawings,
  describeTemplateElementTarget,
  directTargetText,
  findEmptyDrawingTarget,
  isEmptyStructuralTemplate,
  isInsideSvgDefinitions,
  isSuitableTextTarget,
  LEAF_TARGET_ELEMENT_TAGS,
  nearestRawTemplateParent,
  parseTargetTemplate,
  pickTargetAppearanceContext,
  pickTargetSiblingContext,
  readTemplateLoopHtml,
  resolveClickedElementTarget,
  resolveFastEditClickTarget,
  STRUCTURAL_LEAF_ELEMENT_TAGS,
  targetUtf8Encoder,
};
export function installFastEditElementTargets(): () => void {
  return () => {
    STRUCTURAL_LEAF_ELEMENT_TAGS = new Set([
      "img",
      "svg",
      "g",
      "path",
      "circle",
      "ellipse",
      "rect",
      "line",
      "polyline",
      "polygon",
      "text",
      "tspan",
      "button",
      "input",
      "textarea",
      "select",
      "video",
      "canvas",
    ]);
    pickTargetAppearanceContext = (input?: Dynamic): Dynamic => ({
      ...(input.ground !== undefined
        ? {
            ground: input.ground,
          }
        : {}),
      ...(input.behind !== undefined
        ? {
            behind: input.behind,
          }
        : {}),
      ...(input.w !== undefined && input.h !== undefined
        ? {
            w: input.w,
            h: input.h,
          }
        : {}),
    });
    pickTargetSiblingContext = (input?: Dynamic): Dynamic =>
      input.first === undefined
        ? {}
        : {
            first: input.first,
            ...(input.lastTop !== undefined
              ? {
                  lastTop: input.lastTop,
                }
              : {}),
          };
    readTemplateLoopHtml = (input?: Dynamic, options?: Dynamic): Dynamic =>
      parseTargetTemplate(input).querySelectorAll("sc-for")[options]
        ?.outerHTML ?? "";
    LEAF_TARGET_ELEMENT_TAGS = new Set([
      ...STRUCTURAL_LEAF_ELEMENT_TAGS,
      "picture",
      "br",
      "hr",
      "dc-import",
      "x-import",
    ]);
    isInsideSvgDefinitions = (input?: Dynamic, options?: Dynamic): Dynamic => {
      for (
        let parentElement: Dynamic = input.parentElement;
        parentElement !== null && parentElement !== options;
        parentElement = parentElement.parentElement
      )
        if (
          /^(?:defs|symbol|clippath|mask|pattern)$/i.test(
            parentElement.localName,
          )
        )
          return true;
      return false;
    };
    countEmptySvgDrawings = (input?: Dynamic): Dynamic =>
      /<svg\b/i.test(input)
        ? Array.from(parseTargetTemplate(input).querySelectorAll("svg")).filter(
            (svg?: Dynamic): Dynamic =>
              !Array.from(
                svg.querySelectorAll(
                  "path, circle, ellipse, rect, line, polyline, polygon, use, text",
                ),
              ).some(
                (shape?: Dynamic): Dynamic =>
                  (shape.localName !== "text" ||
                    (shape.textContent ?? "").trim() !== "") &&
                  !isInsideSvgDefinitions(shape, svg),
              ),
          ).length
        : 0;
    isEmptyStructuralTemplate = (input?: Dynamic): Dynamic => {
      let firstElementChild: Dynamic =
        parseTargetTemplate(input).firstElementChild;
      return (
        firstElementChild !== null &&
        (firstElementChild.textContent ?? "").trim() === "" &&
        Array.from(firstElementChild.children).every(
          (element?: Dynamic): Dynamic =>
            element.children.length === 0 &&
            !STRUCTURAL_LEAF_ELEMENT_TAGS.has(element.localName) &&
            !element.localName.includes("-"),
        )
      );
    };
    targetUtf8Encoder = new TextEncoder();
    nearestRawTemplateParent = (input?: Dynamic): Dynamic => {
      let parentElement: Dynamic = input.parentElement;
      for (
        ;
        parentElement !== null && /^sc-(?!raw-)/.test(parentElement.localName);

      )
        parentElement = parentElement.parentElement;
      return parentElement;
    };
    isSuitableTextTarget = (input?: Dynamic): Dynamic =>
      (nearestRawTemplateParent(input)?.parentElement ?? null) !== null &&
      extractVisibleElementText(input, {
        enough: 1 / 0,
      }).trim() !== "" &&
      targetUtf8Encoder.encode(
        truncateLargeDataUris(input.outerHTML),
      ).length <= 12e3;
    containsOnlyTemplateInterpolation = (input?: Dynamic): Dynamic =>
      input.includes("{{") &&
      input.replace(/\{\{[\s\S]*?\}\}/g, "").trim() === "";
    directTargetText = (input?: Dynamic): Dynamic =>
      Array.from(input.childNodes)
        .filter((node?: Dynamic): Dynamic => node.nodeType === 3)
        .map((node?: Dynamic): Dynamic => node.textContent ?? "")
        .join("")
        .replace(/\s+/g, " ")
        .trim();
  };
}
