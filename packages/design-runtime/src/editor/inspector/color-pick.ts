/** Restored application module; prepare first, initialize in original order. */
import {
  type Dynamic,
} from "../../runtime-types";
import { initializeEditorAttributeValidation } from "../attribute-validation";
import { parseStyleDeclarations } from "../css/declarations";
import { InspectorPopoverPositionGUseSet, InspectorPopoverPositionPropConfig } from "./popover-position";
import { hasTextBackgroundClip, InspectorPropertySchemaItems } from "./property-schema";
import { formatPropertyKey, svgShapeTags } from "./style-metadata";
import { hasAuthoredAppearance } from "../typography/census";

var supportsDirectoryPicker: Dynamic;
var supportsSpeechRecognition: Dynamic;
var InspectorColorPickResolvedValue: Dynamic;
var InspectorColorPickResolvedValue_2: Dynamic;
var InspectorColorPickResolvedValue_3: Dynamic;
var InspectorColorPickResolvedValue_4: Dynamic;
var InspectorColorPickResolvedValue_5: Dynamic;
var InspectorColorPickResolvedValue_6: Dynamic;
var supportsScreenDetails: Dynamic;
var supportsIntlSegmentation: Dynamic;
function inspectSelectedColor(element?: Dynamic): Dynamic {
  let tagName: Dynamic = element.tag.toLowerCase(),
    declarations: Dynamic = parseStyleDeclarations(
      element.authoredStyle,
    ),
    authoredValue: Dynamic = (propName?: Dynamic): Dynamic =>
      declarations.find((declaration?: Dynamic): Dynamic => declaration.prop === propName)
        ?.value;
  if (
    svgShapeTags.has(tagName) ||
    InspectorPopoverPositionGUseSet.has(tagName)
  ) {
    let strokeColor: Dynamic = (
      authoredValue("stroke") ??
      element.computed.stroke ??
      ""
    ).toLowerCase();
    return svgShapeTags.has(tagName) &&
      strokeColor !== "" &&
      strokeColor !== "none"
      ? {
          prop: formatPropertyKey("stroke", authoredValue),
        }
      : {
          prop: svgShapeTags.has(tagName)
            ? formatPropertyKey("fill", authoredValue)
            : "fill",
        };
  }
  if (element.isTextEditable)
    return hasTextBackgroundClip(authoredValue)
      ? {
          prop: "color",
          unset: ["background", ...InspectorPropertySchemaItems],
        }
      : {
          prop: "color",
        };
  let hasBackground: Dynamic = authoredValue("background") != null;
  if (hasBackground || authoredValue("background-color") != null)
    return hasBackground
      ? {
          ...InspectorPopoverPositionPropConfig,
          unset: ["background"],
        }
      : InspectorPopoverPositionPropConfig;
  if (tagName === "svg") {
    let strokeColor: Dynamic = (
      authoredValue("stroke") ??
      element.computed.stroke ??
      ""
    ).toLowerCase();
    if (strokeColor !== "" && strokeColor !== "none")
      return {
        prop: "stroke",
      };
  }
  let borderStyle: Dynamic = element.computed.borderTopStyle ?? "",
    borderWidth: Dynamic = element.computed.borderTopWidth ?? "";
  return hasAuthoredAppearance(element.authoredStyle) ||
    (borderStyle !== "" && borderStyle !== "none" && borderWidth !== "" && borderWidth !== "0px")
    ? {
        prop: "border-color",
      }
    : InspectorPopoverPositionPropConfig;
}
function supportsInspectorEyeDropper(): Dynamic {
  return typeof EyeDropper !== "undefined";
}
async function pickInspectorEyeDropper(): Promise<Dynamic> {
  if (typeof EyeDropper === "undefined") return null;
  try {
    return (await new EyeDropper().open()).sRGBHex;
  } catch {
    return null;
  }
}
export {
  InspectorColorPickResolvedValue,
  InspectorColorPickResolvedValue_2,
  InspectorColorPickResolvedValue_3,
  InspectorColorPickResolvedValue_4,
  InspectorColorPickResolvedValue_5,
  InspectorColorPickResolvedValue_6,
  inspectSelectedColor,
  pickInspectorEyeDropper,
  supportsDirectoryPicker,
  supportsInspectorEyeDropper,
  supportsIntlSegmentation,
  supportsScreenDetails,
  supportsSpeechRecognition,
};
export function installEditorInspectorColorPick(): () => void {
  return () => {
    supportsDirectoryPicker =
      typeof window !== "undefined" && "showDirectoryPicker" in window;
    supportsSpeechRecognition =
      typeof window !== "undefined" &&
      ("SpeechRecognition" in window || "webkitSpeechRecognition" in window);
    InspectorColorPickResolvedValue =
      typeof navigator !== "undefined" &&
      (/iPad|iPhone|iPod/.test(navigator.userAgent) ||
        (navigator.platform === "MacIntel" &&
          (navigator.maxTouchPoints ?? 0) > 1));
    InspectorColorPickResolvedValue_2 =
      typeof navigator !== "undefined" &&
      /^Mac/.test(navigator.platform) &&
      !InspectorColorPickResolvedValue;
    InspectorColorPickResolvedValue_3 =
      typeof window !== "undefined" &&
      typeof (window as Dynamic).matchMedia == "function" &&
      (window as Dynamic).matchMedia("(pointer: coarse)").matches;
    InspectorColorPickResolvedValue_4 =
      typeof window !== "undefined" &&
      (!!(window as Dynamic).__OMELETTE_DESKTOP__ ||
        (typeof navigator !== "undefined" &&
          /claude(nest|gov)?\//i.test(navigator.userAgent)));
    InspectorColorPickResolvedValue_5 =
      InspectorColorPickResolvedValue_4 &&
      typeof navigator !== "undefined" &&
      /claudenest\//i.test(navigator.userAgent);
    InspectorColorPickResolvedValue_6 =
      InspectorColorPickResolvedValue_4 &&
      typeof window !== "undefined" &&
      (window as Dynamic).self === (window as Dynamic).top;
    supportsScreenDetails =
      typeof window !== "undefined" && "getScreenDetails" in window;
    supportsIntlSegmentation = ((): Dynamic => {
      if (typeof Intl === "undefined" || typeof Intl.Segmenter != "function")
        return null;
      try {
        return new Intl.Segmenter(
          (typeof navigator !== "undefined" && navigator.language) || "en-US",
          {
            granularity: "word",
          },
        );
      } catch {
        try {
          return new Intl.Segmenter("en-US", {
            granularity: "word",
          });
        } catch {
          return null;
        }
      }
    })();
    initializeEditorAttributeValidation();
  };
}
