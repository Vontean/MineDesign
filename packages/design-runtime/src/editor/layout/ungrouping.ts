import { uiMessage } from '@minedesign/contracts/ui-messages';
/** Restored application module; prepare first, initialize in original order. */
import {
  type Dynamic,
} from "../../runtime-types";
import { restoreUngroupedLayout, ungroupedElementRect } from "./grouping";
import { selectedRootElementIds } from "../selection/element-order";

var NothingToUngroupSelectAGroupMessage: Dynamic;
var selfManagedComponentMessage: Dynamic;
var componentInstanceMessage: Dynamic;
var slideMessage: Dynamic;
var repeatedLayerMessage: Dynamic;
var drawingPartMessage: Dynamic;
function ungroupElementRefusal(model?: Dynamic, tid?: Dynamic): Dynamic {
  let element: Dynamic = model.element(tid),
    tagName: Dynamic = model.tagName(tid) ?? "",
    isGroup: Dynamic = element?.hasAttribute("data-dc-group") === true;
  if (model.isUneditable(tid))
    return selfManagedComponentMessage;
  if (tagName === "dc-import" || tagName === "x-import")
    return componentInstanceMessage;
  if (
    tagName === "sc-if" ||
    tagName === "sc-for" ||
    (model.isLoopDriven(tid) && !isGroup)
  )
    return repeatedLayerMessage;
  let isSectionContainer: Dynamic =
    isGroup ||
    (!!element &&
      element.children.length > 0 &&
      [...element.children].every(
        (child?: Dynamic): Dynamic => child.localName === "section",
      ));
  if (
    model.targetParentLocked(tid, "before") &&
    (tagName === "section" || !isSectionContainer)
  )
    return slideMessage;
  if (element?.closest("svg")) return drawingPartMessage;
  let hasTextNode: Dynamic = [...(element?.childNodes ?? [])].some(
    (node?: Dynamic): Dynamic =>
      node.nodeType === Node.TEXT_NODE &&
      (node.nodeValue ?? "").trim() !== "",
  );
  if (!element || hasTextNode || model.childTids(tid).length === 0)
    return NothingToUngroupSelectAGroupMessage;
}
function selectionUngroupRefusal(
  model?: Dynamic,
  tids?: Dynamic,
): Dynamic {
  let firstRefusal: Dynamic;
  for (let tid of selectedRootElementIds(model, [
    ...tids,
  ]) as Dynamic) {
    let refusal: Dynamic = ungroupElementRefusal(model, tid);
    if (refusal === undefined) return;
    firstRefusal ??= refusal;
  }
  return firstRefusal;
}
function ungroupModelElement(
  model?: Dynamic,
  tid?: Dynamic,
  layoutByTid?: Dynamic,
): Dynamic {
  if (!model.element(tid)?.parentNode) return null;
  let zIndexValue: Dynamic = /^(absolute|relative|fixed|sticky)$/.test(
    model.effectiveStyleValue(tid, "position").trim(),
  )
    ? model.effectiveStyleValue(tid, "z-index").trim()
    : "";
  for (let childTid of model.childTids(tid) as Dynamic) {
    let childLayout: Dynamic = layoutByTid?.get(childTid);
    childLayout &&
      (childLayout.position !== "flow" &&
        !childLayout.sameSpace &&
        !childLayout.transformed &&
        restoreUngroupedLayout(
          model,
          childTid,
          childLayout,
          ungroupedElementRect(model, childTid, childLayout),
          0,
          0,
        ),
      /^-?\d+$/.test(zIndexValue) &&
        childLayout.positioned &&
        !model.hasAuthoredStyle(childTid, "z-index") &&
        model.setStyleProperty(childTid, "z-index", zIndexValue));
  }
  return model.unwrapElement(tid);
}
export {
  componentInstanceMessage as LayoutUngroupingLabel,
  slideMessage as LayoutUngroupingLabel_2,
  repeatedLayerMessage as LayoutUngroupingLabel_3,
  drawingPartMessage as LayoutUngroupingLabel_4,
  NothingToUngroupSelectAGroupMessage,
  selectionUngroupRefusal,
  selfManagedComponentMessage as ThisComponentManagesItselfSoItMessage_2,
  ungroupElementRefusal,
  ungroupModelElement,
};
export function installEditorLayoutUngrouping(): () => void {
  return () => {
    NothingToUngroupSelectAGroupMessage =
      uiMessage("inspector.ungrouping.nothingToUngroupSelectA");
    selfManagedComponentMessage =
      uiMessage("inspector.ungrouping.thisComponentManagesItselfSo");
    componentInstanceMessage = uiMessage("inspector.ungrouping.aComponentInstanceCanT");
    slideMessage =
      uiMessage("inspector.ungrouping.aSlideCanTBe");
    repeatedLayerMessage =
      uiMessage("inspector.ungrouping.aRepeatedOrConditionalLayer");
    drawingPartMessage = uiMessage("inspector.ungrouping.partsOfADrawingCan");
  };
}
