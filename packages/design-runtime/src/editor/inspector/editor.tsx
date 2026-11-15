import { useUiLocale } from '../../ui-locale.ts';
import { uiMessage } from '@minedesign/contracts/ui-messages';
/** Restored application module; prepare first, initialize in original order. */
import {
  type Dynamic,
} from "../../runtime-types";
import { reactCanvasShape_2 } from "../../canvas/shape";
import { cn } from "../../cds/theme/class-names";
import { load_react_jsx_runtime } from "../../dependencies";
import { textContrastContext } from "../accessibility/announcements";
import { utf16SafeSlice } from "../code/unified-diff";
import { isEditablePropMetadata } from "../components/prop-validation";
import { normalizeFontWeight, normalizePixelValue } from "./computed-data";
import { initializeInspectorLinkPopover, linkPopoverExports } from "./link-popover";
import { InspectorPropertySchemaItems_2 } from "./property-schema";
import { PropertiesInspectorFieldNameComponentFromSet } from "../properties/inspector-field";
import { HostValue } from "../selection/canvas-selection";
import { toModuleNamespace } from "../../module-helpers";

var jsxInspectorEditor: Dynamic;
var InspectorEditorLazyComponent: Dynamic;
var TextListValue: Dynamic;
var InspectorEditorConstant: Dynamic;
var InspectorEditorConstant_2: Dynamic;
var InspectorEditorItems: Dynamic;
var InspectorEditorItems_2: Dynamic;
var InspectorEditorSubscribers: Dynamic;
var InspectorEditorConstant_3: Dynamic;
var InspectorEditorLabel: Dynamic;
var InspectorEditorResolvedValue: Dynamic;
var InspectorEditorMetaControlShiftSet: Dynamic;
var InspectorEditorSubscribers_2: Dynamic;
var InspectorEditorEvery: Dynamic;
var InspectorEditorKeys: Dynamic;
var InspectorEditorSubscribers_3: Dynamic;
var InspectorEditorReplace: Dynamic;
var InspectorEditorFontFamilyFontWeightFontSizeSet: Dynamic;
var InspectorEditorSubscribers_4: Dynamic;
var InspectorEditorResolvedValue_2: Dynamic;
var InspectorEditorPropLabelSpecConfig: Dynamic;
var InspectorEditorLabel_2: Dynamic;
var InspectorEditorLabel_3: Dynamic;
var InspectorEditorLabel_4: Dynamic;
var inspectorSingleSelectionMessage: Dynamic;
function markBlockedDragElements(
  input?: Dynamic,
  options?: Dynamic,
  context?: Dynamic,
): Dynamic {
  for (let value of (options ?? []) as Dynamic)
    value !== context &&
      input.setAttribute(value, "data-dc-drag-block", String(value));
}
function normalizePasteStamp(input?: Dynamic): Dynamic {
  let stamp: Dynamic = input.stamp;
  return typeof stamp == "string" && stamp.length > 0 && stamp.length <= 64
    ? stamp
    : null;
}
function foreignArtboardPasteContext(input?: Dynamic): Dynamic {
  let foreignArtboards: Dynamic = input.foreignArtboards;
  return typeof foreignArtboards == "number" &&
    Number.isFinite(foreignArtboards) &&
    foreignArtboards > 0
    ? {
        forwarded: Math.min(Math.floor(foreignArtboards), 999),
      }
    : undefined;
}
function boundedPasteText(input?: Dynamic): Dynamic {
  return typeof input.text == "string"
    ? (0, utf16SafeSlice)(input.text, InspectorEditorResolvedValue)
    : "";
}
function textContrastGround(input?: Dynamic, options?: Dynamic): Dynamic {
  if (
    input === null ||
    options.backgroundClip === "text" ||
    options.webkitBackgroundClip === "text"
  )
    return null;
  let value: Dynamic = (0, normalizePixelValue)(options.fontSize),
    value2: Dynamic = (0, normalizeFontWeight)(options.fontWeight);
  return {
    ...(0, textContrastContext)(
      input.behind,
      value === null ? null : parseFloat(value),
      value2 === null ? null : parseFloat(value2),
    ),
    ink: input.ink,
  };
}
function InspectorEmptyState(input?: Dynamic): Dynamic {
  useUiLocale();
  return (
    <div
      {...input}
      className={(0, cn)(
        "py-7 px-5 text-center text-xs text-secondary leading-normal",
        input.className,
      )}
    />
  );
}
export {
  boundedPasteText,
  foreignArtboardPasteContext,
  InspectorEditorConstant,
  InspectorEditorConstant_2,
  InspectorEditorConstant_3,
  InspectorEditorEvery,
  InspectorEditorFontFamilyFontWeightFontSizeSet,
  InspectorEditorItems,
  InspectorEditorItems_2,
  InspectorEditorKeys,
  InspectorEditorLabel,
  InspectorEditorLabel_2,
  InspectorEditorLabel_3,
  InspectorEditorLabel_4,
  InspectorEditorLazyComponent,
  InspectorEditorMetaControlShiftSet,
  InspectorEditorPropLabelSpecConfig,
  InspectorEditorReplace,
  InspectorEditorResolvedValue,
  InspectorEditorResolvedValue_2,
  InspectorEditorSubscribers,
  InspectorEditorSubscribers_2,
  InspectorEditorSubscribers_3,
  InspectorEditorSubscribers_4,
  InspectorEmptyState,
  inspectorSingleSelectionMessage,
  jsxInspectorEditor,
  markBlockedDragElements,
  normalizePasteStamp,
  textContrastGround,
  TextListValue,
};
export function installEditorInspectorEditor(): () => void {
  return () => {
    jsxInspectorEditor = (0, toModuleNamespace)(
      (0, load_react_jsx_runtime)(),
      1,
    );
    InspectorEditorLazyComponent = (0, reactCanvasShape_2.lazy)(
      (): Dynamic =>
        Promise.resolve()
          .then(
            (): Dynamic => (
              (0, initializeInspectorLinkPopover)(),
              linkPopoverExports
            ),
          )
          .then(
            (input?: Dynamic): Dynamic => ({
              default: input.DcLinkPopover,
            }),
          ),
    );
    TextListValue = "text:list";
    InspectorEditorConstant = 12;
    InspectorEditorConstant_2 = 48;
    InspectorEditorItems = [];
    InspectorEditorItems_2 = [];
    InspectorEditorSubscribers = new Set();
    InspectorEditorConstant_3 = 5e3;
    InspectorEditorLabel =
      uiMessage("inspector.editor.editorIsStillLoadingTry");
    InspectorEditorResolvedValue = 2 * 1024 * 1024;
    InspectorEditorMetaControlShiftSet = new Set([
      "Meta",
      "Control",
      "Shift",
      "Alt",
      "CapsLock",
    ]);
    InspectorEditorSubscribers_2 = new Set();
    if (typeof window !== "undefined") {
      let callback: Dynamic = (): Dynamic =>
        InspectorEditorSubscribers_2.forEach(
          (input?: Dynamic): Dynamic => input(),
        );
      (window as Dynamic).addEventListener("pointerdown", callback, true);
      (window as Dynamic).addEventListener(
        "keydown",
        (input?: Dynamic): Dynamic => {
          InspectorEditorMetaControlShiftSet.has(input.key) || callback();
        },
        true,
      );
    }
    InspectorEditorEvery = (items?: Dynamic, items2?: Dynamic): Dynamic =>
      items.length === items2.length &&
      items.every(
        (input?: Dynamic, options?: Dynamic): Dynamic =>
          input === items2[options],
      );
    InspectorEditorKeys = (input?: Dynamic, options: Dynamic = true): Dynamic =>
      new Set(
        Object.keys(input ?? {}).filter(
          (input2?: Dynamic): Dynamic =>
            !(
              options &&
              PropertiesInspectorFieldNameComponentFromSet.has(input2)
            ) && (0, isEditablePropMetadata)(input?.[input2]),
        ),
      );
    InspectorEditorSubscribers_3 = new Set();
    InspectorEditorReplace = (input?: Dynamic): Dynamic =>
      input.replace(
        /-([a-z])/g,
        (input2?: Dynamic, options?: Dynamic): Dynamic => options.toUpperCase(),
      );
    InspectorEditorFontFamilyFontWeightFontSizeSet = new Set([
      "font-family",
      "font-weight",
      "font-size",
      "line-height",
      "letter-spacing",
    ]);
    InspectorEditorSubscribers_4 = new Set([
      "color",
      "font-size",
      "font-weight",
      "font",
      "background",
      "background-color",
      "background-image",
      "background-clip",
      "-webkit-background-clip",
      "opacity",
      "filter",
      "backdrop-filter",
      "mix-blend-mode",
    ]);
    InspectorEditorResolvedValue_2 = HostValue + "followed";
    InspectorEditorPropLabelSpecConfig = {
      prop: "background",
      get label() { return uiMessage("inspector.editor.background"); },
      spec: {
        ...InspectorPropertySchemaItems_2.find(
          (input?: Dynamic): Dynamic => input.prop === "background",
        ),
        get label() { return uiMessage("inspector.editor.background"); },
      },
      value: null,
    };
    InspectorEditorLabel_2 = uiMessage("inspector.editor.selectJustOneElementTo");
    InspectorEditorLabel_3 = uiMessage("inspector.editor.selectJustOneElementTo2");
    InspectorEditorLabel_4 =
      uiMessage("inspector.editor.sizedByItsContentDouble");
    inspectorSingleSelectionMessage =
      uiMessage("inspector.editor.onePageAtTheFrame");
  };
}
