/** Restored application module; prepare first, initialize in original order. */
import {
  type Dynamic,
} from "../../runtime-types";
import { svgShapeTags } from "../inspector/style-metadata";

var selectedRootElementIds: Dynamic;
var selectedElementsInDocumentOrder: Dynamic;
function promoteSvgShapeToRoot(model?: Dynamic, tid?: Dynamic): Dynamic {
  let element: Dynamic = model.element(tid);
  if (!element || !svgShapeTags.has(element.tagName.toLowerCase()))
    return tid;
  let svgAncestor: Dynamic = element.closest("svg");
  if (!svgAncestor) return tid;
  let templateId: Dynamic = parseInt(
    svgAncestor.getAttribute("data-dc-tpl") ?? "-1",
    10,
  );
  return templateId >= 0 ? templateId : tid;
}
function containsUneditableSelection(
  model?: Dynamic,
  tids?: Dynamic,
): Dynamic {
  return tids.some(
    (tid?: Dynamic): Dynamic =>
      model.element(tid) == null || model.isLoopDriven(tid),
  );
}
function copySelectedElementsHtml(model?: Dynamic, items?: Dynamic): Dynamic {
  if (items.length === 0 || containsUneditableSelection(model, items))
    return null;
  let htmlParts: Dynamic = selectedRootElementIds(model, [
    ...new Set(
      items.map(
        (tid?: Dynamic): Dynamic => promoteSvgShapeToRoot(model, tid),
      ),
    ),
  ])
    .map((rootTid?: Dynamic): Dynamic => model.subtreeHtml(rootTid))
    .filter((html?: Dynamic): Dynamic => html != null);
  return htmlParts.length === 0
    ? null
    : htmlParts.join(`
`);
}
export {
  containsUneditableSelection,
  copySelectedElementsHtml,
  promoteSvgShapeToRoot,
  selectedElementsInDocumentOrder,
  selectedRootElementIds,
};
export function installEditorSelectionElementOrder(): () => void {
  return () => {
    selectedRootElementIds = (model?: Dynamic, tids?: Dynamic): Dynamic =>
      tids.filter(
        (tid?: Dynamic): Dynamic =>
          !tids.some(
            (otherTid?: Dynamic): Dynamic =>
              otherTid !== tid && model.isWithin(otherTid, tid),
          ),
      );
    selectedElementsInDocumentOrder = (
      model?: Dynamic,
      tids?: Dynamic,
    ): Dynamic =>
      tids
        .map(
          (tid?: Dynamic): Dynamic => ({
            t: tid,
            e: model.element(tid),
          }),
        )
        .filter((entry?: Dynamic): Dynamic => entry.e != null)
        .sort(
          (first?: Dynamic, second?: Dynamic): Dynamic =>
            first.e.compareDocumentPosition(second.e) &
            Node.DOCUMENT_POSITION_FOLLOWING
              ? -1
              : 1,
        )
        .map((entry?: Dynamic): Dynamic => entry.t);
  };
}
