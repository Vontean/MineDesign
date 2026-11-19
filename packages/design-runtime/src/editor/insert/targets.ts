/** Restored application module; prepare first, initialize in original order. */
import {
  type Dynamic,
} from "../../runtime-types";
import { ClipboardTemplateFlatteningHelmetScriptPattern } from "../clipboard/template-flattening";
import { canContainHtmlTag } from "../html/authoring";
import { escapeHtml } from "../html/escaping";
import { isUnconstrainedAbsoluteElement } from "../layout/insets";
import { promoteSvgShapeToRoot } from "../selection/element-order";
import { SvgArrowsDcArrowHeadFilledPattern, SvgArrowsHandler } from "../svg/arrows";
import { selectedSvgElements } from "../typography/census";

function sameInsertionPoint(pointA?: Dynamic, pointB?: Dynamic): Dynamic {
  return (
    pointA?.position === pointB?.position &&
    pointA?.targetTid === pointB?.targetTid
  );
}
function sameArrowHtml(htmlA?: Dynamic, htmlB?: Dynamic): Dynamic {
  let normalizeArrowHtml: Dynamic = (html?: Dynamic): Dynamic =>
    html
      .trim()
      .replace(
        SvgArrowsDcArrowHeadFilledPattern,
        (matchedText?: Dynamic, arrowHeadCapture?: Dynamic): Dynamic =>
          SvgArrowsHandler(arrowHeadCapture),
      );
  return normalizeArrowHtml(htmlA) === normalizeArrowHtml(htmlB ?? "");
}
function insertionPointForSelection(
  model?: Dynamic,
  selectedTids?: Dynamic,
  html?: Dynamic,
): Dynamic {
  if (selectedTids.length === 0)
    return model.findDeckStage()
      ? {
          targetTid: null,
          position: "root-end",
        }
      : defaultInsertionPoint(model, html);
  let promotedTids: Dynamic = [
      ...new Set(
        selectedTids.map(
          (tid?: Dynamic): Dynamic =>
            promoteSvgShapeToRoot(model, tid),
        ),
      ),
    ],
    lastTid: Dynamic = Math.max(...promotedTids),
    fallbackPoint: Dynamic = {
      targetTid: lastTid,
      position: "after",
    },
    lastElement: Dynamic = promotedTids.length === 1 ? model.element(lastTid) : null;
  if (!lastElement) return fallbackPoint;
  let tagName: Dynamic = model.tagName(lastTid) ?? "";
  if (/^(x-import|dc-import|helmet|sc-for|sc-if)$/.test(tagName)) return fallbackPoint;
  for (let ancestor: Dynamic = lastElement; ancestor; ancestor = ancestor.parentElement)
    if (ancestor.tagName.toLowerCase() === "svg") return fallbackPoint;
  if (model.isUneditable(lastTid) || model.isTextEditable(lastTid)) return fallbackPoint;
  let topLevelTags: Dynamic = model.topLevelTags(html);
  return topLevelTags.length === 0 ||
    !topLevelTags.every(
      (tag?: Dynamic): Dynamic =>
        canContainHtmlTag(tagName, tag),
    ) ||
    sameArrowHtml(html, model.subtreeHtml(lastTid))
    ? fallbackPoint
    : {
        targetTid: lastTid,
        position: "into",
      };
}
function defaultInsertionPoint(model?: Dynamic, html?: Dynamic): Dynamic {
  let visibleChildTids: Dynamic = (parentTid?: Dynamic): Dynamic =>
      model
        .childTids(parentTid)
        .filter(
          (childTid?: Dynamic): Dynamic =>
            !ClipboardTemplateFlatteningHelmetScriptPattern.test(
              model.tagName(childTid) ?? "",
            ),
        ),
    rootTids: Dynamic = visibleChildTids(null),
    inFlowTids: Dynamic = rootTids.filter((tid?: Dynamic): Dynamic => {
      let element: Dynamic = model.element(tid);
      return !(
        element && isUnconstrainedAbsoluteElement(element, true)
      );
    }),
    candidateTids: Dynamic = inFlowTids.length > 0 ? inFlowTids : rootTids,
    importChain: Dynamic = [];
  for (; candidateTids.length === 1 && isDetachableImport(model, candidateTids[0]); ) {
    importChain.push(candidateTids[0]);
    candidateTids = visibleChildTids(candidateTids[0]);
  }
  let isRepeatedHtml: Dynamic = importChain.some(
      (tid?: Dynamic): Dynamic =>
        sameArrowHtml(html, model.subtreeHtml(tid)),
    ),
    nestedPoint: Dynamic =
      candidateTids.length === 1 && !isRepeatedHtml
        ? insertionPointForSelection(model, candidateTids, html)
        : null;
  return nestedPoint?.position === "into"
    ? nestedPoint
    : {
        targetTid: null,
        position: "root-end",
      };
}
function isDetachableImport(model?: Dynamic, tid?: Dynamic): Dynamic {
  let importElement: Dynamic = model.element(tid);
  if (
    !importElement ||
    model.tagName(tid) !== "x-import" ||
    model.isUneditable(tid) ||
    model.findDeckStage(tid)
  )
    return false;
  let meaningfulChildren: Dynamic = [...importElement.childNodes].filter(
    (node?: Dynamic): Dynamic =>
      !(
        node.nodeType === 1 &&
        ClipboardTemplateFlatteningHelmetScriptPattern.test(
          node.tagName,
        )
      ),
  );
  return (
    meaningfulChildren.filter((node?: Dynamic): Dynamic => node.nodeType === 1)
      .length === 1 &&
    meaningfulChildren.every(
      (node?: Dynamic): Dynamic =>
        node.nodeType === 1 ||
        node.nodeType === 8 ||
        (node.textContent ?? "").trim() === "",
    )
  );
}
function textToParagraphHtml(
  text?: Dynamic,
  style: Dynamic = "margin: 0",
): Dynamic {
  return text.startsWith("<")
    ? text
    : `<p style="${style}">${escapeHtml(text)}</p>`;
}
function insertHtmlIntoModel(
  editor?: Dynamic,
  html?: Dynamic,
  insertionPoint?: Dynamic,
): Dynamic {
  let insertedElements: Dynamic = editor.model.insertHtml(
    html,
    insertionPoint.targetTid,
    insertionPoint.position,
  );
  return !insertedElements || insertedElements.length === 0
    ? []
    : (editor.model.restamp(),
      insertedElements
        .map(
          (element?: Dynamic): Dynamic =>
            parseInt(element.getAttribute("data-dc-tpl") ?? "-1", 10),
        )
        .filter((tid?: Dynamic): Dynamic => tid >= 0));
}
function deleteModelElements(editor?: Dynamic, tids?: Dynamic): Dynamic {
  let existingTids: Dynamic = tids.filter(
    (tid?: Dynamic): Dynamic => editor.model.element(tid) != null,
  );
  if (
    existingTids.some(
      (tid?: Dynamic): Dynamic => editor.model.isLoopDriven(tid),
    )
  )
    return 0;
  let editableTids: Dynamic = existingTids.filter(
    (tid?: Dynamic): Dynamic => !editor.model.isUneditable(tid),
  );
  if (editableTids.length === 0) return 0;
  let removableElements: Dynamic = selectedSvgElements(editor.model, [
    ...editableTids,
  ]);
  for (let element of removableElements as Dynamic) editor.model.removeElement(element);
  editor.model = editor.model.rebuild(editor.model.serialize());
  return removableElements.length;
}
function restoreGroupPosition(
  model?: Dynamic,
  snapshot?: Dynamic,
  groupTid?: Dynamic,
  expectedParentTid?: Dynamic,
): Dynamic {
  if (
    snapshot.parentTid == null ||
    snapshot.parentTid !== expectedParentTid ||
    !model.element(snapshot.parentTid)
  )
    return;
  let toPixels: Dynamic = (rawValue?: Dynamic): Dynamic =>
      typeof rawValue == "number" &&
      Number.isFinite(rawValue) &&
      Math.abs(rawValue) < 1e5
        ? String(Math.round(rawValue)) + "px"
        : null,
    siblings: Dynamic = Array.isArray(snapshot.siblings)
      ? snapshot.siblings.slice(0, 200)
      : [],
    tidCounts: Dynamic = new Map();
  for (let sibling of siblings as Dynamic)
    sibling &&
      typeof sibling.tid == "number" &&
      tidCounts.set(sibling.tid, (tidCounts.get(sibling.tid) ?? 0) + 1);
  for (let sibling of siblings as Dynamic) {
    if (
      !sibling ||
      typeof sibling.tid != "number" ||
      (tidCounts.get(sibling.tid) ?? 0) > 1 ||
      sibling.tid === groupTid ||
      model.parentTid(sibling.tid) !== snapshot.parentTid
    )
      continue;
    let leftPx: Dynamic = toPixels(sibling.left),
      topPx: Dynamic = toPixels(sibling.top),
      widthPx: Dynamic = toPixels(sibling.w),
      heightPx: Dynamic = toPixels(sibling.h);
    leftPx == null ||
      topPx == null ||
      widthPx == null ||
      heightPx == null ||
      (model.setStyleProperty(sibling.tid, "position", "absolute"),
      model.setStyleProperty(sibling.tid, "left", leftPx),
      model.setStyleProperty(sibling.tid, "top", topPx),
      model.setStyleProperty(sibling.tid, "width", widthPx),
      model.setStyleProperty(sibling.tid, "height", heightPx),
      model.setStyleProperty(sibling.tid, "box-sizing", "border-box"),
      model.setStyleProperty(sibling.tid, "max-width", "none"),
      model.setStyleProperty(sibling.tid, "max-height", "none"),
      model.setStyleProperty(sibling.tid, "min-width", "0"),
      model.setStyleProperty(sibling.tid, "min-height", "0"));
  }
  let groupWidthPx: Dynamic = toPixels(snapshot.w),
    groupHeightPx: Dynamic = toPixels(snapshot.h);
  groupWidthPx != null &&
    groupHeightPx != null &&
    (model.setStyleProperty(snapshot.parentTid, "width", groupWidthPx),
    model.setStyleProperty(snapshot.parentTid, "height", groupHeightPx),
    model.setStyleProperty(snapshot.parentTid, "box-sizing", "border-box"),
    model.setStyleProperty(snapshot.parentTid, "max-width", "none"),
    model.setStyleProperty(snapshot.parentTid, "max-height", "none"),
    model.setStyleProperty(snapshot.parentTid, "flex-grow", "0"),
    model.setStyleProperty(snapshot.parentTid, "flex-shrink", "0"),
    model.setStyleProperty(snapshot.parentTid, "flex-basis", "auto"),
    model.inlineStyleValue(snapshot.parentTid, "position") ||
      model.setStyleProperty(snapshot.parentTid, "position", "relative"));
}
export {
  defaultInsertionPoint,
  deleteModelElements,
  insertHtmlIntoModel,
  insertionPointForSelection,
  isDetachableImport,
  restoreGroupPosition,
  sameArrowHtml,
  sameInsertionPoint,
  textToParagraphHtml,
};
export function installEditorInsertTargets(): () => void {
  return () => {};
}
