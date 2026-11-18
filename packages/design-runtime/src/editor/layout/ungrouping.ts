import { uiMessage } from '@minedesign/contracts/ui-messages';
/** Restored application module; prepare first, initialize in original order. */
import {
  type Dynamic,
} from "../../runtime-types";
import { restoreUngroupedLayout, ungroupedElementRect } from "./grouping";
import { selectedRootElementIds } from "../selection/element-order";

var NothingToUngroupSelectAGroupMessage: Dynamic;
var ThisComponentManagesItselfSoItMessage_2: Dynamic;
var LayoutUngroupingLabel: Dynamic;
var LayoutUngroupingLabel_2: Dynamic;
var LayoutUngroupingLabel_3: Dynamic;
var LayoutUngroupingLabel_4: Dynamic;
function ungroupElementRefusal(input?: Dynamic, options?: Dynamic): Dynamic {
  let value: Dynamic = input.element(options),
    value2: Dynamic = input.tagName(options) ?? "",
    value3: Dynamic = value?.hasAttribute("data-dc-group") === true;
  if (input.isUneditable(options))
    return ThisComponentManagesItselfSoItMessage_2;
  if (value2 === "dc-import" || value2 === "x-import")
    return LayoutUngroupingLabel;
  if (
    value2 === "sc-if" ||
    value2 === "sc-for" ||
    (input.isLoopDriven(options) && !value3)
  )
    return LayoutUngroupingLabel_3;
  let value4: Dynamic =
    value3 ||
    (!!value &&
      value.children.length > 0 &&
      [...value.children].every(
        (input2?: Dynamic): Dynamic => input2.localName === "section",
      ));
  if (
    input.targetParentLocked(options, "before") &&
    (value2 === "section" || !value4)
  )
    return LayoutUngroupingLabel_2;
  if (value?.closest("svg")) return LayoutUngroupingLabel_4;
  let value5: Dynamic = [...(value?.childNodes ?? [])].some(
    (input2?: Dynamic): Dynamic =>
      input2.nodeType === Node.TEXT_NODE &&
      (input2.nodeValue ?? "").trim() !== "",
  );
  if (!value || value5 || input.childTids(options).length === 0)
    return NothingToUngroupSelectAGroupMessage;
}
function selectionUngroupRefusal(
  input?: Dynamic,
  options?: Dynamic,
): Dynamic {
  let value: Dynamic;
  for (let value2 of selectedRootElementIds(input, [
    ...options,
  ]) as Dynamic) {
    let value3: Dynamic = ungroupElementRefusal(input, value2);
    if (value3 === undefined) return;
    value ??= value3;
  }
  return value;
}
function ungroupModelElement(
  input?: Dynamic,
  options?: Dynamic,
  context?: Dynamic,
): Dynamic {
  if (!input.element(options)?.parentNode) return null;
  let value: Dynamic = /^(absolute|relative|fixed|sticky)$/.test(
    input.effectiveStyleValue(options, "position").trim(),
  )
    ? input.effectiveStyleValue(options, "z-index").trim()
    : "";
  for (let value2 of input.childTids(options) as Dynamic) {
    let value3: Dynamic = context?.get(value2);
    value3 &&
      (value3.position !== "flow" &&
        !value3.sameSpace &&
        !value3.transformed &&
        restoreUngroupedLayout(
          input,
          value2,
          value3,
          ungroupedElementRect(input, value2, value3),
          0,
          0,
        ),
      /^-?\d+$/.test(value) &&
        value3.positioned &&
        !input.hasAuthoredStyle(value2, "z-index") &&
        input.setStyleProperty(value2, "z-index", value));
  }
  return input.unwrapElement(options);
}
export {
  LayoutUngroupingLabel,
  LayoutUngroupingLabel_2,
  LayoutUngroupingLabel_3,
  LayoutUngroupingLabel_4,
  NothingToUngroupSelectAGroupMessage,
  selectionUngroupRefusal,
  ThisComponentManagesItselfSoItMessage_2,
  ungroupElementRefusal,
  ungroupModelElement,
};
export function installEditorLayoutUngrouping(): () => void {
  return () => {
    NothingToUngroupSelectAGroupMessage =
      uiMessage("inspector.ungrouping.nothingToUngroupSelectA");
    ThisComponentManagesItselfSoItMessage_2 =
      uiMessage("inspector.ungrouping.thisComponentManagesItselfSo");
    LayoutUngroupingLabel = uiMessage("inspector.ungrouping.aComponentInstanceCanT");
    LayoutUngroupingLabel_2 =
      uiMessage("inspector.ungrouping.aSlideCanTBe");
    LayoutUngroupingLabel_3 =
      uiMessage("inspector.ungrouping.aRepeatedOrConditionalLayer");
    LayoutUngroupingLabel_4 = uiMessage("inspector.ungrouping.partsOfADrawingCan");
  };
}
