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
import { InspectorPropertySchemaItems_2 as propertySpecs } from "./property-schema";
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
  model?: Dynamic,
  tids?: Dynamic,
  exceptTid?: Dynamic,
): Dynamic {
  for (let tid of (tids ?? []) as Dynamic)
    tid !== exceptTid &&
      model.setAttribute(tid, "data-dc-drag-block", String(tid));
}
function normalizePasteStamp(payload?: Dynamic): Dynamic {
  let stamp: Dynamic = payload.stamp;
  return typeof stamp == "string" && stamp.length > 0 && stamp.length <= 64
    ? stamp
    : null;
}
function foreignArtboardPasteContext(payload?: Dynamic): Dynamic {
  let foreignArtboards: Dynamic = payload.foreignArtboards;
  return typeof foreignArtboards == "number" &&
    Number.isFinite(foreignArtboards) &&
    foreignArtboards > 0
    ? {
        forwarded: Math.min(Math.floor(foreignArtboards), 999),
      }
    : undefined;
}
function boundedPasteText(payload?: Dynamic): Dynamic {
  return typeof payload.text == "string"
    ? utf16SafeSlice(payload.text, InspectorEditorResolvedValue)
    : "";
}
function textContrastGround(ground?: Dynamic, computed?: Dynamic): Dynamic {
  if (
    ground === null ||
    computed.backgroundClip === "text" ||
    computed.webkitBackgroundClip === "text"
  )
    return null;
  let fontSize: Dynamic = normalizePixelValue(computed.fontSize),
    fontWeight: Dynamic = normalizeFontWeight(computed.fontWeight);
  return {
    ...textContrastContext(
      ground.behind,
      fontSize === null ? null : parseFloat(fontSize),
      fontWeight === null ? null : parseFloat(fontWeight),
    ),
    ink: ground.ink,
  };
}
function InspectorEmptyState(props?: Dynamic): Dynamic {
  useUiLocale();
  return (
    <div
      {...props}
      className={cn(
        "py-7 px-5 text-center text-xs text-secondary leading-normal",
        props.className,
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
    jsxInspectorEditor = toModuleNamespace(
      load_react_jsx_runtime(),
      1,
    );
    InspectorEditorLazyComponent = (0, reactCanvasShape_2.lazy)(
      (): Dynamic =>
        Promise.resolve()
          .then(
            (): Dynamic => (
              initializeInspectorLinkPopover(),
              linkPopoverExports
            ),
          )
          .then(
            (linkPopoverModule?: Dynamic): Dynamic => ({
              default: linkPopoverModule.DcLinkPopover,
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
      let notifyListeners: Dynamic = (): Dynamic =>
        InspectorEditorSubscribers_2.forEach(
          (listener?: Dynamic): Dynamic => listener(),
        );
      (window as Dynamic).addEventListener("pointerdown", notifyListeners, true);
      (window as Dynamic).addEventListener(
        "keydown",
        (keyEvent?: Dynamic): Dynamic => {
          InspectorEditorMetaControlShiftSet.has(keyEvent.key) || notifyListeners();
        },
        true,
      );
    }
    InspectorEditorEvery = (listA?: Dynamic, listB?: Dynamic): Dynamic =>
      listA.length === listB.length &&
      listA.every(
        (itemA?: Dynamic, index?: Dynamic): Dynamic =>
          itemA === listB[index],
      );
    InspectorEditorKeys = (metadata?: Dynamic, excludeInspectorFields: Dynamic = true): Dynamic =>
      new Set(
        Object.keys(metadata ?? {}).filter(
          (propName?: Dynamic): Dynamic =>
            !(
              excludeInspectorFields &&
              PropertiesInspectorFieldNameComponentFromSet.has(propName)
            ) && isEditablePropMetadata(metadata?.[propName]),
        ),
      );
    InspectorEditorSubscribers_3 = new Set();
    InspectorEditorReplace = (cssProperty?: Dynamic): Dynamic =>
      cssProperty.replace(
        /-([a-z])/g,
        (matchText?: Dynamic, letter?: Dynamic): Dynamic => letter.toUpperCase(),
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
        ...propertySpecs.find(
          (propertySpec?: Dynamic): Dynamic => propertySpec.prop === "background",
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
