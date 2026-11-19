/** Restored application module; prepare first, initialize in original order. */
import {
  type Dynamic,
} from "../../runtime-types";
import { canContainHtmlTag, DcTplAttribute, isInlineTextContainer } from "../html/authoring";
import { toParserHtml } from "../html/tag-normalization";
import { classifyElementStyleKind } from "./element-kinds";
import { isUnconstrainedAbsoluteElement } from "../layout/insets";
import { readableTagName } from "../model/labels";
import { pickerElementSignature } from "../picker/runtime-script";
import { SelectionActionsHelmetScHelmetPattern } from "../selection/actions";

function fileDropPosition(
  viewport?: Dynamic,
  cascadeIndex?: Dynamic,
  itemWidth?: Dynamic,
  itemHeight?: Dynamic,
): Dynamic {
  return {
    left:
      Math.max(
        0,
        Math.min(
          Math.round(viewport.x - itemWidth / 2) + cascadeIndex * 24,
          viewport.w - itemWidth,
        ),
      ) + viewport.sx,
    top:
      Math.max(
        0,
        Math.min(
          Math.round(viewport.y - itemHeight / 2) + cascadeIndex * 24,
          viewport.h - itemHeight,
        ),
      ) + viewport.sy,
  };
}
function isAbsolutelyPositionedModelElement(
  model?: Dynamic,
  tid?: Dynamic,
  isStrict: Dynamic = false,
): Dynamic {
  let element: Dynamic = model.element(tid);
  return (
    element != null &&
    isUnconstrainedAbsoluteElement(element, isStrict)
  );
}
function isAbsolutelyPositionedHtml(
  html?: Dynamic,
  doc: Dynamic = document,
): Dynamic {
  let rootElement: Dynamic = singlePastedRootElement(html, doc);
  return (
    rootElement != null && isUnconstrainedAbsoluteElement(rootElement, true)
  );
}
function parseHtmlFragment(html?: Dynamic, doc?: Dynamic): Dynamic {
  let template: Dynamic = doc.createElement("template");
  template.innerHTML = toParserHtml(html);
  return template.content;
}
function fragmentContentElements(
  html?: Dynamic,
  doc?: Dynamic,
): Dynamic {
  return [...parseHtmlFragment(html, doc).children].filter(
    (element?: Dynamic): Dynamic =>
      !SelectionActionsHelmetScHelmetPattern.test(element.tagName),
  );
}
function wrapInlinePastedHtml(
  html?: Dynamic,
  doc: Dynamic = document,
): Dynamic {
  let fragment: Dynamic = parseHtmlFragment(html, doc);
  return fragment.children.length > 0 &&
    isInlineTextContainer(fragment) &&
    ![...fragment.children].some(
      (child?: Dynamic): Dynamic =>
        isUnconstrainedAbsoluteElement(child, false),
    )
    ? `<p style="margin: 0">${html}</p>`
    : html;
}
function pastedRootElementCount(
  html?: Dynamic,
  doc: Dynamic = document,
): Dynamic {
  return fragmentContentElements(html, doc).length;
}
function singlePastedRootElement(
  html?: Dynamic,
  doc?: Dynamic,
): Dynamic {
  let elements: Dynamic = fragmentContentElements(html, doc);
  return elements.length === 1 ? elements[0] : null;
}
function containsFlowPastedElements(
  hasBlocker?: Dynamic,
  html?: Dynamic,
  doc: Dynamic = document,
): Dynamic {
  return (
    !hasBlocker &&
    fragmentContentElements(html, doc).some(
      (element?: Dynamic): Dynamic =>
        !isUnconstrainedAbsoluteElement(element, true),
    )
  );
}
function pastedElementGeometry(
  html?: Dynamic,
  geometry?: Dynamic,
  doc: Dynamic = document,
): Dynamic {
  let rootElement: Dynamic = singlePastedRootElement(html, doc);
  return rootElement
    ? {
        tid: 0,
        tag: readableTagName(rootElement.tagName.toLowerCase()),
        w: geometry.ew,
        h: geometry.eh,
        dx: geometry.ox - geometry.gx,
        dy: geometry.oy - geometry.gy,
      }
    : null;
}
function canFreezeSinglePaste(
  hasBlocker?: Dynamic,
  pastedItems?: Dynamic,
  html?: Dynamic,
  hasOtherBlocker?: Dynamic,
  doc: Dynamic = document,
): Dynamic {
  return (
    !hasBlocker &&
    pastedItems.length === 1 &&
    !hasOtherBlocker &&
    singlePastedRootElement(html, doc) != null &&
    !isAbsolutelyPositionedHtml(html, doc)
  );
}
function pasteParentTarget(
  position?: Dynamic,
  parentTarget?: Dynamic,
  explicitTarget?: Dynamic,
  html?: Dynamic,
  doc: Dynamic = document,
): Dynamic {
  return parentTarget == null
    ? null
    : explicitTarget != null ||
        (position === "root-end" && isAbsolutelyPositionedHtml(html, doc))
      ? parentTarget
      : null;
}
function rootDropContainer(
  model?: Dynamic,
  artboard?: Dynamic,
  startTid?: Dynamic,
): Dynamic {
  let topTid: Dynamic = startTid;
  for (
    let parentTid: Dynamic = model.parentTid(topTid);
    parentTid != null && parentTid !== artboard.page;
    parentTid = model.parentTid(topTid)
  )
    topTid = parentTid;
  let topTagName: Dynamic = model.tagName(topTid) ?? "";
  return {
    top: topTid,
    takesFiles:
      topTagName !== "svg" &&
      canContainHtmlTag(topTagName, "img") &&
      !model.isTextEditable(topTid),
  };
}
function emptyArtboardDropTarget(
  model?: Dynamic,
  droppedTags?: Dynamic,
): Dynamic {
  if (model.rootText().trim() !== "") return null;
  let flowChildren: Dynamic = model
    .childTids(null)
    .filter(
      (childTid?: Dynamic): Dynamic =>
        !SelectionActionsHelmetScHelmetPattern.test(
          model.tagName(childTid) ?? "",
        ) && !isAbsolutelyPositionedModelElement(model, childTid, true),
    );
  if (flowChildren.length === 0)
    return {
      page: null,
      placement: {
        targetTid: null,
        position: "root-end",
      },
    };
  let candidateTid: Dynamic = flowChildren[0],
    candidateElement: Dynamic = flowChildren.length === 1 ? model.element(candidateTid) : null;
  if (
    !candidateElement ||
    !/^(div|section|main|article)$/.test(model.tagName(candidateTid) ?? "") ||
    model.isUneditable(candidateTid)
  )
    return null;
  let clonedElement: Dynamic = candidateElement.cloneNode(true);
  for (let clonedChild of [...clonedElement.children] as Dynamic) {
    let attribute: Dynamic = clonedChild.getAttribute(DcTplAttribute);
    attribute != null &&
      isAbsolutelyPositionedModelElement(model, parseInt(attribute, 10)) &&
      clonedChild.remove();
  }
  if (
    !pickerElementSignature(
      clonedElement,
      (element?: Dynamic): Dynamic =>
        classifyElementStyleKind(element) === "text",
    )
  )
    return null;
  let hasStyleValue: Dynamic = (property?: Dynamic, expectedValue?: Dynamic): Dynamic =>
      [expectedValue, ""].includes(
        model.effectiveStyleValue(candidateTid, property).trim(),
      ),
    canDropInto: Dynamic =
      hasStyleValue("position", "static") &&
      ["transform", "filter", "contain"].every(
        (property?: Dynamic): Dynamic => hasStyleValue(property, "none"),
      ) &&
      hasStyleValue("will-change", "auto") &&
      (droppedTags == null ||
        model
          .topLevelTags(droppedTags)
          .every(
            (droppedTag?: Dynamic): Dynamic =>
              canContainHtmlTag(
                model.tagName(candidateTid) ?? "",
                droppedTag,
              ),
          ));
  return {
    page: candidateTid,
    placement: canDropInto
      ? {
          targetTid: candidateTid,
          position: "into",
        }
      : {
          targetTid: null,
          position: "root-end",
        },
  };
}
export {
  canFreezeSinglePaste,
  containsFlowPastedElements,
  emptyArtboardDropTarget,
  fileDropPosition,
  fragmentContentElements,
  isAbsolutelyPositionedHtml,
  isAbsolutelyPositionedModelElement,
  parseHtmlFragment,
  pastedElementGeometry,
  pastedRootElementCount,
  pasteParentTarget,
  rootDropContainer,
  singlePastedRootElement,
  wrapInlinePastedHtml,
};
export function installEditorInsertDropTargets(): () => void {
  return () => {};
}
