/** Restored application module; prepare first, initialize in original order. */
import {
  type Dynamic,
} from "../../runtime-types";

var SelectionStackingFilter: Dynamic;
var SelectionStackingIndexOf: Dynamic;
var SelectionStackingEvery: Dynamic;
function canReorderSelection(
  model?: Dynamic,
  tids?: Dynamic,
  offset?: Dynamic,
): Dynamic {
  return tids.some((tid?: Dynamic): Dynamic => {
    let index: Dynamic = SelectionStackingIndexOf(model, tid);
    return (
      index >= 0 &&
      index + offset >= 0 &&
      index + offset < SelectionStackingFilter(model, tid).length
    );
  });
}
function selectionAtStackBoundary(
  model?: Dynamic,
  tids?: Dynamic,
  tid?: Dynamic,
  direction?: Dynamic,
): Dynamic {
  let siblings: Dynamic = SelectionStackingFilter(model, tid),
    selectedCount: Dynamic = siblings.filter(
      (sibling?: Dynamic): Dynamic => tids.includes(sibling),
    ).length;
  return (
    direction < 0 ? siblings.slice(0, selectedCount) : siblings.slice(siblings.length - selectedCount)
  ).every((sibling?: Dynamic): Dynamic => tids.includes(sibling));
}
function reorderModelSelection(
  model?: Dynamic,
  tids?: Dynamic,
  direction?: Dynamic,
  toEdge: Dynamic = false,
): Dynamic {
  let elements: Dynamic = tids
      .map((tid?: Dynamic): Dynamic => model.element(tid))
      .filter((element?: Dynamic): Dynamic => element != null),
    sortedTids: Dynamic = [...tids].sort(
      (first?: Dynamic, second?: Dynamic): Dynamic =>
        SelectionStackingIndexOf(model, first) -
        SelectionStackingIndexOf(model, second),
    ),
    orderedTids: Dynamic = direction > 0 !== toEdge ? sortedTids.reverse() : sortedTids,
    values: Dynamic = new Set();
  if (toEdge)
    for (let tid of orderedTids as Dynamic)
      selectionAtStackBoundary(model, tids, tid, direction) &&
        values.add(model.parentTid(tid));
  let flag: Dynamic = false;
  for (let tid of orderedTids as Dynamic) {
    if (toEdge && values.has(model.parentTid(tid))) continue;
    let siblings: Dynamic = SelectionStackingFilter(model, tid),
      currentIndex: Dynamic = siblings.indexOf(tid);
    if (currentIndex < 0) continue;
    let targetIndex: Dynamic = toEdge
      ? direction < 0
        ? 0
        : siblings.length - 1
      : currentIndex + direction;
    targetIndex < 0 ||
      targetIndex >= siblings.length ||
      targetIndex === currentIndex ||
      (flag =
        model.moveRelative(
          tid,
          siblings[targetIndex],
          direction < 0 ? "before" : "after",
        ) || flag);
  }
  return flag ? elements : null;
}
function modelIdsFromElements(elements?: Dynamic): Dynamic {
  return elements
    .map(
      (element?: Dynamic): Dynamic =>
        parseInt(element.getAttribute("data-dc-tpl") ?? "-1", 10),
    )
    .filter((templateId?: Dynamic): Dynamic => templateId >= 0);
}
export {
  canReorderSelection,
  modelIdsFromElements,
  reorderModelSelection,
  selectionAtStackBoundary,
  SelectionStackingEvery,
  SelectionStackingFilter,
  SelectionStackingIndexOf,
};
export function installEditorSelectionStacking(): () => void {
  return () => {
    SelectionStackingFilter = (model?: Dynamic, tid?: Dynamic): Dynamic =>
      model
        .childTids(model.parentTid(tid))
        .filter((childTid?: Dynamic): Dynamic => model.isOutlineRow(childTid));
    SelectionStackingIndexOf = (model?: Dynamic, tid?: Dynamic): Dynamic =>
      SelectionStackingFilter(model, tid).indexOf(tid);
    SelectionStackingEvery = (
      model?: Dynamic,
      tids?: Dynamic,
      direction?: Dynamic,
    ): Dynamic =>
      tids.every(
        (tid?: Dynamic): Dynamic =>
          selectionAtStackBoundary(model, tids, tid, direction),
      );
  };
}
