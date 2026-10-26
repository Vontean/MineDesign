import { uiMessage } from '@minedesign/contracts/ui-messages';
/** Restored application module; prepare first, initialize in original order. */
import {
  bindRuntimeValue,
  type Dynamic,
  type RuntimeBindings,
} from "../../runtime-types";

export function installEditorColorContrastCopy(
  runtime: RuntimeBindings,
): () => void {
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
  bindRuntimeValue(
    runtime,
    "reactColorContrastCopy",
    () => reactColorContrastCopy,
    (value) => {
      reactColorContrastCopy = value;
    },
  );
  bindRuntimeValue(
    runtime,
    "ResetValue",
    () => ResetValue,
    (value) => {
      ResetValue = value;
    },
  );
  bindRuntimeValue(
    runtime,
    "ColorContrastCopyLabel",
    () => ColorContrastCopyLabel,
    (value) => {
      ColorContrastCopyLabel = value;
    },
  );
  bindRuntimeValue(
    runtime,
    "ColorContrastCopyHandler",
    () => ColorContrastCopyHandler,
    (value) => {
      ColorContrastCopyHandler = value;
    },
  );
  bindRuntimeValue(
    runtime,
    "CloseValue",
    () => CloseValue,
    (value) => {
      CloseValue = value;
    },
  );
  bindRuntimeValue(
    runtime,
    "TypeValue",
    () => TypeValue,
    (value) => {
      TypeValue = value;
    },
  );
  bindRuntimeValue(
    runtime,
    "MixedValue",
    () => MixedValue,
    (value) => {
      MixedValue = value;
    },
  );
  bindRuntimeValue(
    runtime,
    "ColorValue",
    () => ColorValue,
    (value) => {
      ColorValue = value;
    },
  );
  bindRuntimeValue(
    runtime,
    "ColorContrastCopyLabel_2",
    () => ColorContrastCopyLabel_2,
    (value) => {
      ColorContrastCopyLabel_2 = value;
    },
  );
  bindRuntimeValue(
    runtime,
    "ColorContrastCopyLabel_3",
    () => ColorContrastCopyLabel_3,
    (value) => {
      ColorContrastCopyLabel_3 = value;
    },
  );
  bindRuntimeValue(
    runtime,
    "InThisArtboardMessage",
    () => InThisArtboardMessage,
    (value) => {
      InThisArtboardMessage = value;
    },
  );
  bindRuntimeValue(
    runtime,
    "ColorContrastCopyLabel_4",
    () => ColorContrastCopyLabel_4,
    (value) => {
      ColorContrastCopyLabel_4 = value;
    },
  );
  bindRuntimeValue(
    runtime,
    "ColorContrastCopyLabel_5",
    () => ColorContrastCopyLabel_5,
    (value) => {
      ColorContrastCopyLabel_5 = value;
    },
  );
  bindRuntimeValue(
    runtime,
    "IncreaseValue",
    () => IncreaseValue,
    (value) => {
      IncreaseValue = value;
    },
  );
  bindRuntimeValue(
    runtime,
    "DecreaseValue",
    () => DecreaseValue,
    (value) => {
      DecreaseValue = value;
    },
  );
  bindRuntimeValue(
    runtime,
    "invalidNumericValueMessage",
    () => invalidNumericValueMessage,
  );
  bindRuntimeValue(
    runtime,
    "InheritedValue",
    () => InheritedValue,
    (value) => {
      InheritedValue = value;
    },
  );
  bindRuntimeValue(
    runtime,
    "ColorContrastCopyLabel_6",
    () => ColorContrastCopyLabel_6,
    (value) => {
      ColorContrastCopyLabel_6 = value;
    },
  );
  bindRuntimeValue(
    runtime,
    "ColorContrastCopyLabel_7",
    () => ColorContrastCopyLabel_7,
    (value) => {
      ColorContrastCopyLabel_7 = value;
    },
  );
  bindRuntimeValue(
    runtime,
    "EditValue",
    () => EditValue,
    (value) => {
      EditValue = value;
    },
  );
  bindRuntimeValue(
    runtime,
    "HideValue",
    () => HideValue,
    (value) => {
      HideValue = value;
    },
  );
  bindRuntimeValue(
    runtime,
    "ColorContrastCopyLabel_8",
    () => ColorContrastCopyLabel_8,
    (value) => {
      ColorContrastCopyLabel_8 = value;
    },
  );
  bindRuntimeValue(
    runtime,
    "ColorContrastCopyTopRightBottomValues",
    () => ColorContrastCopyTopRightBottomValues,
    (value) => {
      ColorContrastCopyTopRightBottomValues = value;
    },
  );
  bindRuntimeValue(
    runtime,
    "ColorContrastCopyItems",
    () => ColorContrastCopyItems,
    (value) => {
      ColorContrastCopyItems = value;
    },
  );
  bindRuntimeValue(
    runtime,
    "OnValue",
    () => OnValue,
    (value) => {
      OnValue = value;
    },
  );
  bindRuntimeValue(
    runtime,
    "ColorContrastCopyLabel_9",
    () => ColorContrastCopyLabel_9,
    (value) => {
      ColorContrastCopyLabel_9 = value;
    },
  );
  bindRuntimeValue(
    runtime,
    "ColorContrastCopyLabel_10",
    () => ColorContrastCopyLabel_10,
    (value) => {
      ColorContrastCopyLabel_10 = value;
    },
  );
  bindRuntimeValue(
    runtime,
    "additionalPassingGroundsMessage",
    () => additionalPassingGroundsMessage,
  );
  bindRuntimeValue(runtime, "contrastSentence", () => contrastSentence);
  bindRuntimeValue(
    runtime,
    "detailedContrastSentence",
    () => detailedContrastSentence,
  );
  bindRuntimeValue(
    runtime,
    "summarizedContrastSentence",
    () => summarizedContrastSentence,
  );
  bindRuntimeValue(
    runtime,
    "ColorContrastCopyLabel_11",
    () => ColorContrastCopyLabel_11,
    (value) => {
      ColorContrastCopyLabel_11 = value;
    },
  );
  bindRuntimeValue(
    runtime,
    "readableShadeDescription",
    () => readableShadeDescription,
  );
  return () => {
    reactColorContrastCopy = (0, runtime.toModuleNamespace)(
      (0, runtime.load_react)(),
      1,
    );
    (0, runtime.initializeCdsIndex)();
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
