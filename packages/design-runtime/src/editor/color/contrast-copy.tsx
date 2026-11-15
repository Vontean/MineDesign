import { uiMessage } from '@minedesign/contracts/ui-messages';
/** Restored application module; prepare first, initialize in original order. */
import {
  type Dynamic,
} from "../../runtime-types";
import { initializeCdsIndex } from "../../cds/index";
import { load_react } from "../../dependencies";
import { toModuleNamespace } from "../../module-helpers";

var reactColorContrastCopy: Dynamic;
var ResetValue: Dynamic;
var ColorContrastCopyLabel: Dynamic;
var ColorContrastCopyHandler: Dynamic;
var CloseValue: Dynamic;
var TypeValue: Dynamic;
var MixedValue: Dynamic;
var ColorValue: Dynamic;
var ColorContrastCopyLabel_2: Dynamic;
var ColorContrastCopyLabel_3: Dynamic;
var InThisArtboardMessage: Dynamic;
var ColorContrastCopyLabel_4: Dynamic;
var ColorContrastCopyLabel_5: Dynamic;
var IncreaseValue: Dynamic;
var DecreaseValue: Dynamic;
var InheritedValue: Dynamic;
var ColorContrastCopyLabel_6: Dynamic;
var ColorContrastCopyLabel_7: Dynamic;
var EditValue: Dynamic;
var HideValue: Dynamic;
var ColorContrastCopyLabel_8: Dynamic;
var ColorContrastCopyTopRightBottomValues: Dynamic;
var ColorContrastCopyItems: Dynamic;
var OnValue: Dynamic;
var ColorContrastCopyLabel_9: Dynamic;
var ColorContrastCopyLabel_10: Dynamic;
var ColorContrastCopyLabel_11: Dynamic;
function invalidNumericValueMessage(
  input?: Dynamic,
  options?: Dynamic,
): Dynamic {
  return (
    uiMessage("inspector.contrastCopy.nothingChanged") +
    (input ?? uiMessage("inspector.contrastCopy.thisField")) +
    " takes a number " +
    (options ? uiMessage("inspector.contrastCopy.in") + options : "only") +
    "."
  );
}
function additionalPassingGroundsMessage(input?: Dynamic): Dynamic {
  return input > 0
    ? "; " +
        String(input) +
        (input === 1 ? " more ground passes" : " more grounds pass")
    : "";
}
function contrastSentence(input?: Dynamic): Dynamic {
  return (
    (input.passes ? ColorContrastCopyLabel_9 : ColorContrastCopyLabel_10) +
    ", " +
    input.ratio +
    " " +
    OnValue +
    " " +
    input.ground +
    (input.passes ? "" : ", below " + input.min)
  );
}
function detailedContrastSentence(input?: Dynamic): Dynamic {
  let value: Dynamic = contrastSentence(input),
    value2: Dynamic = input.alsoFailing ?? [];
  value2.length > 0 &&
    (value += "; also below " + input.min + " on " + value2.join(" and "));
  return value + additionalPassingGroundsMessage(input.alsoPassing ?? 0);
}
function summarizedContrastSentence(input?: Dynamic): Dynamic {
  let value: Dynamic = input.alsoFailing ?? 0;
  return (
    contrastSentence(input) +
    (value > 0
      ? "; also too low on " +
        String(value) +
        (value === 1 ? " more ground" : " more grounds")
      : "") +
    additionalPassingGroundsMessage(input.alsoPassing ?? 0)
  );
}
function readableShadeDescription(input?: Dynamic): Dynamic {
  return (
    uiMessage("inspector.contrastCopy.changesTheColorTo") +
    input.hex +
    ", contrast " +
    input.ratio +
    " on " +
    input.ground
  );
}
export {
  additionalPassingGroundsMessage,
  CloseValue,
  ColorContrastCopyHandler,
  ColorContrastCopyItems,
  ColorContrastCopyLabel,
  ColorContrastCopyLabel_10,
  ColorContrastCopyLabel_11,
  ColorContrastCopyLabel_2,
  ColorContrastCopyLabel_3,
  ColorContrastCopyLabel_4,
  ColorContrastCopyLabel_5,
  ColorContrastCopyLabel_6,
  ColorContrastCopyLabel_7,
  ColorContrastCopyLabel_8,
  ColorContrastCopyLabel_9,
  ColorContrastCopyTopRightBottomValues,
  ColorValue,
  contrastSentence,
  DecreaseValue,
  detailedContrastSentence,
  EditValue,
  HideValue,
  IncreaseValue,
  InheritedValue,
  InThisArtboardMessage,
  invalidNumericValueMessage,
  MixedValue,
  OnValue,
  reactColorContrastCopy,
  readableShadeDescription,
  ResetValue,
  summarizedContrastSentence,
  TypeValue,
};
export function installEditorColorContrastCopy(): () => void {
  return () => {
    reactColorContrastCopy = (0, toModuleNamespace)(
      (0, load_react)(),
      1,
    );
    (0, initializeCdsIndex)();
    ResetValue = "Reset";
    ColorContrastCopyLabel = uiMessage("inspector.contrastCopy.moreActions");
    ColorContrastCopyHandler = (input?: Dynamic): Dynamic => uiMessage("inspector.contrastCopy.addTo") + input;
    CloseValue = "Close";
    TypeValue = "Type";
    MixedValue = "Mixed";
    ColorValue = "Color";
    ColorContrastCopyLabel_2 = uiMessage("inspector.contrastCopy.searchColors");
    ColorContrastCopyLabel_3 = uiMessage("inspector.contrastCopy.noMatches");
    InThisArtboardMessage = uiMessage("inspector.contrastCopy.inThisArtboard");
    ColorContrastCopyLabel_4 = uiMessage("inspector.contrastCopy.inTheseArtboards");
    ColorContrastCopyLabel_5 = uiMessage("inspector.contrastCopy.searchStyles");
    IncreaseValue = "Increase";
    DecreaseValue = "Decrease";
    InheritedValue = "inherited";
    ColorContrastCopyLabel_6 = uiMessage("inspector.contrastCopy.perSide");
    ColorContrastCopyLabel_7 = uiMessage("inspector.contrastCopy.perCorner");
    EditValue = "Edit";
    HideValue = "Hide";
    ColorContrastCopyLabel_8 =
      uiMessage("inspector.contrastCopy.theValuesDifferMakeThem");
    ColorContrastCopyTopRightBottomValues = ["Top", "Right", "Bottom", "Left"];
    ColorContrastCopyItems = [
      uiMessage("inspector.contrastCopy.topLeft"),
      uiMessage("inspector.contrastCopy.topRight"),
      uiMessage("inspector.contrastCopy.bottomRight"),
      uiMessage("inspector.contrastCopy.bottomLeft"),
    ];
    OnValue = "on";
    ColorContrastCopyLabel_9 = uiMessage("inspector.contrastCopy.goodContrast");
    ColorContrastCopyLabel_10 = uiMessage("inspector.contrastCopy.poorContrast");
    ColorContrastCopyLabel_11 = uiMessage("inspector.contrastCopy.useAReadableShade");
  };
}
