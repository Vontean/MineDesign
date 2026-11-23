import { useUiLocale } from '../../ui-locale.ts';
import { uiMessage } from '@minedesign/contracts/ui-messages';
/** Restored application module; prepare first, initialize in original order. */
import {
  type Dynamic,
} from "../../runtime-types";
import { canvasShapeReact as React } from "../../canvas/shape";
import { cn } from "../../cds/theme/class-names";
import { load_react_jsx_runtime } from "../../dependencies";
import { textContrastContext } from "../accessibility/announcements";
import { utf16SafeSlice } from "../code/unified-diff";
import { isEditablePropMetadata } from "../components/prop-validation";
import { normalizeFontWeight, normalizePixelValue } from "./computed-data";
import { initializeInspectorLinkPopover, linkPopoverExports } from "./link-popover";
import { propertySpecifications as propertySpecs } from "./property-schema";
import { PropertiesInspectorFieldNameComponentFromSet } from "../properties/inspector-field";
import { HostValue } from "../selection/canvas-selection";
import { toModuleNamespace } from "../../module-helpers";

var jsxInspectorEditor: Dynamic;
var InspectorEditorLazyComponent: Dynamic;
var TextListValue: Dynamic;
var maxFallbackColorTokens: Dynamic;
var maxArtboardColorTokens: Dynamic;
var noDesignColorTokens: Dynamic;
var emptyArtboardColors: Dynamic;
var emptyDefinedVars: Dynamic;
var toastDedupeWindowMs: Dynamic;
var editorStillLoadingMessage: Dynamic;
var maxPastedTextLength: Dynamic;
var modifierOnlyKeys: Dynamic;
var pickerInteractionListeners: Dynamic;
var sameTidList: Dynamic;
var collectEditablePropNames: Dynamic;
var inspectorPropertyRowRefKeys: Dynamic;
var kebabToCamel: Dynamic;
var InspectorEditorFontFamilyFontWeightFontSizeSet: Dynamic;
var contrastAffectingProperties: Dynamic;
var pickerFollowedSelectionKey: Dynamic;
var InspectorEditorPropLabelSpecConfig: Dynamic;
var selectOneElementForPngMessage: Dynamic;
var selectOneElementForSvgMessage: Dynamic;
var contentSizedReason: Dynamic;
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
    ? utf16SafeSlice(payload.text, maxPastedTextLength)
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
  maxFallbackColorTokens,
  maxArtboardColorTokens,
  toastDedupeWindowMs,
  sameTidList,
  InspectorEditorFontFamilyFontWeightFontSizeSet,
  noDesignColorTokens,
  emptyArtboardColors,
  collectEditablePropNames,
  editorStillLoadingMessage,
  selectOneElementForPngMessage,
  selectOneElementForSvgMessage,
  contentSizedReason,
  InspectorEditorLazyComponent,
  modifierOnlyKeys,
  InspectorEditorPropLabelSpecConfig,
  kebabToCamel,
  maxPastedTextLength,
  pickerFollowedSelectionKey,
  emptyDefinedVars,
  pickerInteractionListeners,
  inspectorPropertyRowRefKeys,
  contrastAffectingProperties,
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
    InspectorEditorLazyComponent = (0, React.lazy)(
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
    maxFallbackColorTokens = 12;
    maxArtboardColorTokens = 48;
    noDesignColorTokens = [];
    emptyArtboardColors = [];
    emptyDefinedVars = new Set();
    toastDedupeWindowMs = 5e3;
    editorStillLoadingMessage =
      uiMessage("inspector.editor.editorIsStillLoadingTry");
    maxPastedTextLength = 2 * 1024 * 1024;
    modifierOnlyKeys = new Set([
      "Meta",
      "Control",
      "Shift",
      "Alt",
      "CapsLock",
    ]);
    pickerInteractionListeners = new Set();
    if (typeof window !== "undefined") {
      let notifyListeners: Dynamic = (): Dynamic =>
        pickerInteractionListeners.forEach(
          (listener?: Dynamic): Dynamic => listener(),
        );
      (window as Dynamic).addEventListener("pointerdown", notifyListeners, true);
      (window as Dynamic).addEventListener(
        "keydown",
        (keyEvent?: Dynamic): Dynamic => {
          modifierOnlyKeys.has(keyEvent.key) || notifyListeners();
        },
        true,
      );
    }
    sameTidList = (listA?: Dynamic, listB?: Dynamic): Dynamic =>
      listA.length === listB.length &&
      listA.every(
        (itemA?: Dynamic, index?: Dynamic): Dynamic =>
          itemA === listB[index],
      );
    collectEditablePropNames = (metadata?: Dynamic, excludeInspectorFields: Dynamic = true): Dynamic =>
      new Set(
        Object.keys(metadata ?? {}).filter(
          (propName?: Dynamic): Dynamic =>
            !(
              excludeInspectorFields &&
              PropertiesInspectorFieldNameComponentFromSet.has(propName)
            ) && isEditablePropMetadata(metadata?.[propName]),
        ),
      );
    inspectorPropertyRowRefKeys = new Set();
    kebabToCamel = (cssProperty?: Dynamic): Dynamic =>
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
    contrastAffectingProperties = new Set([
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
    pickerFollowedSelectionKey = HostValue + "followed";
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
    selectOneElementForPngMessage = uiMessage("inspector.editor.selectJustOneElementTo");
    selectOneElementForSvgMessage = uiMessage("inspector.editor.selectJustOneElementTo2");
    contentSizedReason =
      uiMessage("inspector.editor.sizedByItsContentDouble");
    inspectorSingleSelectionMessage =
      uiMessage("inspector.editor.onePageAtTheFrame");
  };
}
