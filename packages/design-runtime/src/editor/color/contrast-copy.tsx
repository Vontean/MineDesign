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
var ColorContrastCopySearchColorsLabel: Dynamic;
var ColorContrastCopyNoMatchesLabel: Dynamic;
var InThisArtboardMessage: Dynamic;
var ColorContrastCopyInTheseArtboardsLabel: Dynamic;
var ColorContrastCopySearchStylesLabel: Dynamic;
var IncreaseValue: Dynamic;
var DecreaseValue: Dynamic;
var InheritedValue: Dynamic;
var ColorContrastCopyPerSideLabel: Dynamic;
var ColorContrastCopyPerCornerLabel: Dynamic;
var EditValue: Dynamic;
var HideValue: Dynamic;
var ColorContrastCopyValuesDifferLabel: Dynamic;
var ColorContrastCopyTopRightBottomValues: Dynamic;
var ColorContrastCopyItems: Dynamic;
var OnValue: Dynamic;
var ColorContrastCopyGoodContrastLabel: Dynamic;
var ColorContrastCopyPoorContrastLabel: Dynamic;
var ColorContrastCopyUseReadableShadeLabel: Dynamic;
function invalidNumericValueMessage(
  fieldName?: Dynamic,
  unitHint?: Dynamic,
): Dynamic {
  return (
    uiMessage("inspector.contrastCopy.nothingChanged") +
    (fieldName ?? uiMessage("inspector.contrastCopy.thisField")) +
    " takes a number " +
    (unitHint ? uiMessage("inspector.contrastCopy.in") + unitHint : "only") +
    "."
  );
}
function additionalPassingGroundsMessage(count?: Dynamic): Dynamic {
  return count > 0
    ? "; " +
        String(count) +
        (count === 1 ? " more ground passes" : " more grounds pass")
    : "";
}
function contrastSentence(result?: Dynamic): Dynamic {
  return (
    (result.passes ? ColorContrastCopyGoodContrastLabel : ColorContrastCopyPoorContrastLabel) +
    ", " +
    result.ratio +
    " " +
    OnValue +
    " " +
    result.ground +
    (result.passes ? "" : ", below " + result.min)
  );
}
function detailedContrastSentence(result?: Dynamic): Dynamic {
  let sentence: Dynamic = contrastSentence(result),
    failingGrounds: Dynamic = result.alsoFailing ?? [];
  failingGrounds.length > 0 &&
    (sentence += "; also below " + result.min + " on " + failingGrounds.join(" and "));
  return sentence + additionalPassingGroundsMessage(result.alsoPassing ?? 0);
}
function summarizedContrastSentence(result?: Dynamic): Dynamic {
  let failingCount: Dynamic = result.alsoFailing ?? 0;
  return (
    contrastSentence(result) +
    (failingCount > 0
      ? "; also too low on " +
        String(failingCount) +
        (failingCount === 1 ? " more ground" : " more grounds")
      : "") +
    additionalPassingGroundsMessage(result.alsoPassing ?? 0)
  );
}
function readableShadeDescription(shade?: Dynamic): Dynamic {
  return (
    uiMessage("inspector.contrastCopy.changesTheColorTo") +
    shade.hex +
    ", contrast " +
    shade.ratio +
    " on " +
    shade.ground
  );
}
export {
  additionalPassingGroundsMessage,
  CloseValue,
  ColorContrastCopyHandler,
  ColorContrastCopyItems,
  ColorContrastCopyLabel,
  ColorContrastCopyPoorContrastLabel,
  ColorContrastCopyUseReadableShadeLabel,
  ColorContrastCopySearchColorsLabel,
  ColorContrastCopyNoMatchesLabel,
  ColorContrastCopyInTheseArtboardsLabel,
  ColorContrastCopySearchStylesLabel,
  ColorContrastCopyPerSideLabel,
  ColorContrastCopyPerCornerLabel,
  ColorContrastCopyValuesDifferLabel,
  ColorContrastCopyGoodContrastLabel,
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
    reactColorContrastCopy = toModuleNamespace(
      load_react(),
      1,
    );
    initializeCdsIndex();
    ResetValue = "Reset";
    ColorContrastCopyLabel = uiMessage("inspector.contrastCopy.moreActions");
    ColorContrastCopyHandler = (target?: Dynamic): Dynamic => uiMessage("inspector.contrastCopy.addTo") + target;
    CloseValue = "Close";
    TypeValue = "Type";
    MixedValue = "Mixed";
    ColorValue = "Color";
    ColorContrastCopySearchColorsLabel = uiMessage("inspector.contrastCopy.searchColors");
    ColorContrastCopyNoMatchesLabel = uiMessage("inspector.contrastCopy.noMatches");
    InThisArtboardMessage = uiMessage("inspector.contrastCopy.inThisArtboard");
    ColorContrastCopyInTheseArtboardsLabel = uiMessage("inspector.contrastCopy.inTheseArtboards");
    ColorContrastCopySearchStylesLabel = uiMessage("inspector.contrastCopy.searchStyles");
    IncreaseValue = "Increase";
    DecreaseValue = "Decrease";
    InheritedValue = "inherited";
    ColorContrastCopyPerSideLabel = uiMessage("inspector.contrastCopy.perSide");
    ColorContrastCopyPerCornerLabel = uiMessage("inspector.contrastCopy.perCorner");
    EditValue = "Edit";
    HideValue = "Hide";
    ColorContrastCopyValuesDifferLabel =
      uiMessage("inspector.contrastCopy.theValuesDifferMakeThem");
    ColorContrastCopyTopRightBottomValues = ["Top", "Right", "Bottom", "Left"];
    ColorContrastCopyItems = [
      uiMessage("inspector.contrastCopy.topLeft"),
      uiMessage("inspector.contrastCopy.topRight"),
      uiMessage("inspector.contrastCopy.bottomRight"),
      uiMessage("inspector.contrastCopy.bottomLeft"),
    ];
    OnValue = "on";
    ColorContrastCopyGoodContrastLabel = uiMessage("inspector.contrastCopy.goodContrast");
    ColorContrastCopyPoorContrastLabel = uiMessage("inspector.contrastCopy.poorContrast");
    ColorContrastCopyUseReadableShadeLabel = uiMessage("inspector.contrastCopy.useAReadableShade");
  };
}
