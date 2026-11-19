import { uiMessage } from '@minedesign/contracts/ui-messages';
/** Restored application module; prepare first, initialize in original order. */
import {
  type Dynamic,
} from "../../runtime-types";
import { initializeCdsIndex } from "../../cds/index";
import { load_react, load_react_jsx_runtime } from "../../dependencies";
import { styleFieldBoundsValue, styleFieldBoundsValue_2, StyleSchemaShadowXYBlurConfig } from "../style-schema/shadow";
import { styleSchema } from "../style-schema/validation";
import { toModuleNamespace } from "../../module-helpers";

var reactPropertiesStyleBag: Dynamic;
var jsxPropertiesStyleBag: Dynamic;
var PropertiesStyleBagBorderWidthBorderRadiusConfig: Dynamic;
var PropertiesStyleBagItems: Dynamic;
var styleRangeFieldValue: Dynamic;
var filterRangeFields: Dynamic;
var transformRangeFields: Dynamic;
var PropertiesStyleBagTextAlignTextDecorationLineTextDecorationStyleConfig: Dynamic;
var PropertiesStyleBagFilterBackdropFilterConfig: Dynamic;
var PropertiesStyleBagConstant: Dynamic;
var InnerShadowNeedsAFillOrMessage: Dynamic;
var NotOnDiamondOrArrowShapesMessage: Dynamic;
function styleValidatorKind(source?: Dynamic): Dynamic {
  let kind: Dynamic = source.kind;
  return typeof kind == "string" ? kind : "";
}
function styleFiniteField(
  bag?: Dynamic,
  field?: Dynamic,
  fallback?: Dynamic,
): Dynamic {
  let fieldValue: Dynamic = bag[field];
  return typeof fieldValue == "number" && Number.isFinite(fieldValue) ? fieldValue : fallback;
}
function styleStringListField(bag?: Dynamic, field?: Dynamic): Dynamic {
  let fieldValue: Dynamic = bag[field];
  return Array.isArray(fieldValue)
    ? fieldValue.filter((entry?: Dynamic): Dynamic => typeof entry == "string")
    : [];
}
function propertyValidatorForNode(
  propKey?: Dynamic,
  nodeKind?: Dynamic,
): Dynamic {
  let schemaEntry: Dynamic = styleSchema[propKey];
  return nodeKind === "slides-shape" && schemaEntry.shapeValue !== undefined
    ? schemaEntry.shapeValue
    : nodeKind.startsWith("slides-") && schemaEntry.slidesValue !== undefined
      ? schemaEntry.slidesValue
      : schemaEntry.value;
}
function setStyleBagValue(
  bag?: Dynamic,
  key?: Dynamic,
  newValue?: Dynamic,
): Dynamic {
  return {
    ...bag,
    [key]: newValue,
  };
}
function removeStyleBagValue(bag?: Dynamic, key?: Dynamic): Dynamic {
  if (bag === undefined) return;
  let { [key]: removedValue, ...remainingBag }: Dynamic = bag;
  return Object.keys(remainingBag).length === 0 ? undefined : remainingBag;
}
function replaceStyleBagValue(
  bag?: Dynamic,
  key?: Dynamic,
  newValue?: Dynamic,
): Dynamic {
  let updatedBag: Dynamic = bag;
  for (let relatedKey of (PropertiesStyleBagBorderWidthBorderRadiusConfig[
    key
  ] ?? []) as Dynamic)
    updatedBag = removeStyleBagValue(updatedBag, relatedKey);
  return newValue === undefined
    ? removeStyleBagValue(updatedBag, key)
    : setStyleBagValue(updatedBag, key, newValue);
}
function propertyResetPatch(propKey?: Dynamic, newValue?: Dynamic): Dynamic {
  let patch: Dynamic = {};
  for (let relatedKey of (PropertiesStyleBagBorderWidthBorderRadiusConfig[propKey] ??
    []) as Dynamic)
    patch[relatedKey] = undefined;
  patch[propKey] = newValue;
  return patch;
}
function normalizeNegativeZero(numericValue?: Dynamic): Dynamic {
  return numericValue === 0 ? 0 : numericValue;
}
function clampStyleField(validator?: Dynamic, rawValue?: Dynamic): Dynamic {
  let validatorKind: Dynamic = styleValidatorKind(validator),
    lowest: Dynamic = styleFiniteField(validator, "lo", -1e9),
    highest: Dynamic = styleFiniteField(validator, "hi", 1e9),
    clamped: Dynamic = Number.isFinite(rawValue) ? rawValue : lowest;
  if (validatorKind === "int") {
    let step: Dynamic = Math.max(1e-9, styleFiniteField(validator, "step", 1));
    clamped = Math.round(clamped / step) * step;
  }
  clamped = Math.min(highest, Math.max(lowest, clamped));
  validatorKind === "len"
    ? (clamped = Math.round(clamped * 10) / 10)
    : validatorKind === "num" && (clamped = Math.round(clamped * 1e4) / 1e4);
  return normalizeNegativeZero(clamped);
}
function numericStyleValidator(
  kind?: Dynamic,
  lo?: Dynamic,
  hi?: Dynamic,
): Dynamic {
  return {
    kind: kind,
    lo: lo,
    hi: hi,
  };
}
function styleRangeField(
  validators?: Dynamic,
  field?: Dynamic,
  label?: Dynamic,
  kind?: Dynamic,
  step?: Dynamic,
  unit?: Dynamic,
): Dynamic {
  let range: Dynamic = validators[field];
  if (range === undefined)
    throw new Error(`style panel: no validator range for field ${field}`);
  return unit === undefined
    ? {
        field: field,
        label: label,
        min: range.min,
        max: range.max,
        step: step,
        kind: kind,
      }
    : {
        field: field,
        label: label,
        min: range.min,
        max: range.max,
        step: step,
        unit: unit,
        kind: kind,
      };
}
function clampStyleRangeField(source?: Dynamic, rawValue?: Dynamic): Dynamic {
  return clampStyleField(
    numericStyleValidator(source.kind, source.min, source.max),
    rawValue,
  );
}
function propertyDefaultEditorValue(
  propKey?: Dynamic,
  nodeKind?: Dynamic,
): Dynamic {
  let validator: Dynamic = propertyValidatorForNode(propKey, nodeKind);
  switch (styleValidatorKind(validator)) {
    case "len":
    case "num":
    case "int": {
      let lowest: Dynamic = styleFiniteField(validator, "lo", 0),
        highest: Dynamic = styleFiniteField(validator, "hi", 100);
      return clampStyleField(validator, lowest + (highest - lowest) / 2);
    }
    case "enum":
      return styleStringListField(validator, "values")[0];
    case "color":
      return "#445566";
    case "fontFamily":
      return "sans";
    case "str":
      return "sample";
    case "size":
      return {
        px: 240,
      };
    case "shadow":
      return [defaultShadowValue(propKey, false)];
    case "gradient":
      return {
        angle: 180,
        stops: [
          {
            color: "#ffffff",
            pos: 0,
          },
          {
            color: "#000000",
            pos: 100,
          },
        ],
      };
    case "filter":
      return {
        blur: 0,
      };
    case "transform":
      return {
        rotate: 0,
      };
    default:
      return;
  }
}
function defaultShadowValue(propKey?: Dynamic, isInset?: Dynamic): Dynamic {
  return propKey !== "boxShadow"
    ? {
        x: 0,
        y: 1,
        blur: 3,
        color: "#00000033",
      }
    : isInset
      ? {
          x: 0,
          y: 1,
          blur: 2,
          spread: 0,
          inset: true,
          color: "#00000033",
        }
      : {
          x: 0,
          y: 2,
          blur: 8,
          spread: 0,
          color: "#00000033",
        };
}
function ownStyleBagValue(bag?: Dynamic, key?: Dynamic): Dynamic {
  return bag !== undefined && Object.hasOwn(bag, key)
    ? bag[key]
    : undefined;
}
function asFiniteStyleNumber(candidate?: Dynamic): Dynamic {
  return typeof candidate == "number" && Number.isFinite(candidate)
    ? candidate
    : undefined;
}
function asStyleString(candidate?: Dynamic): Dynamic {
  return typeof candidate == "string" ? candidate : undefined;
}
function asStyleRecord(candidate?: Dynamic): Dynamic {
  return candidate !== null && typeof candidate == "object" && !Array.isArray(candidate)
    ? candidate
    : undefined;
}
function styleRecordList(items?: Dynamic): Dynamic {
  return (
    Array.isArray(items) ? items : items === undefined ? [] : [items]
  ).flatMap(
    (item?: Dynamic): Dynamic =>
      asStyleRecord(item) !== undefined ? [item] : [],
  );
}
function shadowEffectLabel(propKey?: Dynamic, effect?: Dynamic): Dynamic {
  return propKey === "boxShadow" && asStyleRecord(effect)?.inset === true
    ? uiMessage("inspector.styleBag.innerShadow")
    : propertyEffectLabel(propKey);
}
function propertyEffectLabel(propKey?: Dynamic): Dynamic {
  let knownLabel: Dynamic = Object.hasOwn(
    PropertiesStyleBagTextAlignTextDecorationLineTextDecorationStyleConfig,
    propKey,
  )
    ? PropertiesStyleBagTextAlignTextDecorationLineTextDecorationStyleConfig[
        propKey
      ]
    : undefined;
  if (knownLabel !== undefined) return knownLabel;
  let spacedName: Dynamic = propKey
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .toLowerCase();
  return spacedName.charAt(0).toUpperCase() + spacedName.slice(1);
}
function equalStyleBags(left?: Dynamic, right?: Dynamic): Dynamic {
  if (left === right) return true;
  if (
    left === null ||
    right === null ||
    typeof left != "object" ||
    typeof right != "object"
  )
    return false;
  let isArray: Dynamic = Array.isArray(left);
  if (isArray !== Array.isArray(right)) return false;
  if (isArray) {
    let leftList: Dynamic = left,
      rightList: Dynamic = right;
    return (
      leftList.length === rightList.length &&
      leftList.every(
        (leftItem?: Dynamic, index?: Dynamic): Dynamic =>
          equalStyleBags(leftItem, rightList[index]),
      )
    );
  }
  let leftRecord: Dynamic = left,
    rightRecord: Dynamic = right,
    leftKeys: Dynamic = Object.keys(leftRecord);
  return (
    leftKeys.length === Object.keys(rightRecord).length &&
    leftKeys.every(
      (key?: Dynamic): Dynamic =>
        Object.hasOwn(rightRecord, key) &&
        equalStyleBags(leftRecord[key], rightRecord[key]),
    )
  );
}
function changedStyleBag(
  bag?: Dynamic,
  key?: Dynamic,
  newValue?: Dynamic,
): Dynamic {
  let updatedBag: Dynamic = replaceStyleBagValue(bag, key, newValue);
  return equalStyleBags(updatedBag, bag)
    ? undefined
    : {
        next: updatedBag,
      };
}
function createStyleBagEditor({
  kind: kind,
  bag: bag,
  onCommit: onCommit,
  onLive: onLive,
  onLiveEnd: onLiveEnd,
  disabled: isDisabled = false,
  disabledKeys: disabledKeys,
  swatches: swatches,
  clearKeys: clearKeys,
  mixedKeys: mixedKeys,
  unifiedColorPopover = false,
}: Dynamic): Dynamic {
  return {
    kind: kind,
    bag: bag,
    disabled: isDisabled,
    disabledKeys: disabledKeys,
    swatches: swatches,
    clearKeys: clearKeys,
    mixedKeys: mixedKeys,
    unifiedColorPopover: unifiedColorPopover,
    clear: (keys?: Dynamic): Dynamic => {
      let updatedBag: Dynamic = bag,
        resetPatch: Dynamic = {};
      for (let key of keys as Dynamic) {
        updatedBag = replaceStyleBagValue(updatedBag, key, undefined);
        resetPatch = {
          ...resetPatch,
          ...propertyResetPatch(key, undefined),
        };
      }
      (!equalStyleBags(updatedBag, bag) ||
        keys.some((key?: Dynamic): Dynamic => mixedKeys?.has(key))) &&
        onCommit(updatedBag, resetPatch);
    },
    commit: (key?: Dynamic, newValue?: Dynamic): Dynamic => {
      let change: Dynamic = changedStyleBag(bag, key, newValue);
      change
        ? onCommit(change.next, propertyResetPatch(key, newValue))
        : mixedKeys?.has(key) &&
          onCommit(bag, propertyResetPatch(key, newValue));
    },
    live: onLive
      ? (key?: Dynamic, newValue?: Dynamic): Dynamic =>
          onLive(
            replaceStyleBagValue(bag, key, newValue),
            propertyResetPatch(key, newValue),
          )
      : undefined,
    liveEnd: onLiveEnd,
  };
}
export {
  asFiniteStyleNumber,
  asStyleRecord,
  asStyleString,
  changedStyleBag,
  clampStyleField,
  clampStyleRangeField,
  createStyleBagEditor,
  defaultShadowValue,
  equalStyleBags,
  InnerShadowNeedsAFillOrMessage,
  jsxPropertiesStyleBag,
  normalizeNegativeZero,
  NotOnDiamondOrArrowShapesMessage,
  numericStyleValidator,
  ownStyleBagValue,
  PropertiesStyleBagBorderWidthBorderRadiusConfig,
  PropertiesStyleBagConstant,
  PropertiesStyleBagFilterBackdropFilterConfig,
  PropertiesStyleBagItems,
  filterRangeFields as PropertiesStyleBagItems_2,
  transformRangeFields as PropertiesStyleBagItems_3,
  PropertiesStyleBagTextAlignTextDecorationLineTextDecorationStyleConfig,
  propertyDefaultEditorValue,
  propertyEffectLabel,
  propertyResetPatch,
  propertyValidatorForNode,
  reactPropertiesStyleBag,
  removeStyleBagValue,
  replaceStyleBagValue,
  setStyleBagValue,
  shadowEffectLabel,
  styleFiniteField,
  styleRangeField,
  styleRangeFieldValue,
  styleRecordList,
  styleStringListField,
  styleValidatorKind,
};
export function installEditorPropertiesStyleBag(): () => void {
  return () => {
    reactPropertiesStyleBag = toModuleNamespace(
      load_react(),
      1,
    );
    initializeCdsIndex();
    jsxPropertiesStyleBag = toModuleNamespace(
      load_react_jsx_runtime(),
      1,
    );
    PropertiesStyleBagBorderWidthBorderRadiusConfig = {
      borderWidth: [
        "borderTopWidth",
        "borderRightWidth",
        "borderBottomWidth",
        "borderLeftWidth",
      ],
      get borderRadius() { return ["borderTopLeftRadius", "borderTopRightRadius", "borderBottomRightRadius", "borderBottomLeftRadius"]; },
    };
    PropertiesStyleBagItems = [
      styleRangeField(
        StyleSchemaShadowXYBlurConfig,
        "x",
        "X",
        "len",
        1,
        "px",
      ),
      styleRangeField(
        StyleSchemaShadowXYBlurConfig,
        "y",
        "Y",
        "len",
        1,
        "px",
      ),
      styleRangeField(
        StyleSchemaShadowXYBlurConfig,
        "blur",
        "Blur",
        "len",
        1,
        "px",
      ),
    ];
    styleRangeFieldValue = styleRangeField(
      StyleSchemaShadowXYBlurConfig,
      "spread",
      "Spread",
      "len",
      1,
      "px",
    );
    filterRangeFields = [
      styleRangeField(
        styleFieldBoundsValue,
        "blur",
        "Blur",
        "len",
        0.5,
        "px",
      ),
      styleRangeField(
        styleFieldBoundsValue,
        "brightness",
        "Brightness",
        "num",
        0.05,
      ),
      styleRangeField(
        styleFieldBoundsValue,
        "contrast",
        "Contrast",
        "num",
        0.05,
      ),
      styleRangeField(
        styleFieldBoundsValue,
        "saturate",
        "Saturate",
        "num",
        0.05,
      ),
      styleRangeField(
        styleFieldBoundsValue,
        "grayscale",
        "Grayscale",
        "num",
        0.05,
      ),
      styleRangeField(
        styleFieldBoundsValue,
        "sepia",
        "Sepia",
        "num",
        0.05,
      ),
      styleRangeField(
        styleFieldBoundsValue,
        "invert",
        "Invert",
        "num",
        0.05,
      ),
      styleRangeField(
        styleFieldBoundsValue,
        "hueRotate",
        "Hue",
        "num",
        1,
        "\xB0",
      ),
    ];
    transformRangeFields = [
      styleRangeField(
        styleFieldBoundsValue_2,
        "translateX",
        uiMessage("inspector.styleBag.moveX"),
        "len",
        1,
        "px",
      ),
      styleRangeField(
        styleFieldBoundsValue_2,
        "translateY",
        uiMessage("inspector.styleBag.moveY"),
        "len",
        1,
        "px",
      ),
      styleRangeField(
        styleFieldBoundsValue_2,
        "scale",
        "Scale",
        "num",
        0.05,
      ),
      styleRangeField(
        styleFieldBoundsValue_2,
        "rotate",
        "Rotate",
        "num",
        1,
        "\xB0",
      ),
      styleRangeField(
        styleFieldBoundsValue_2,
        "skewX",
        uiMessage("inspector.styleBag.skewX"),
        "num",
        1,
        "\xB0",
      ),
      styleRangeField(
        styleFieldBoundsValue_2,
        "skewY",
        uiMessage("inspector.styleBag.skewY"),
        "num",
        1,
        "\xB0",
      ),
    ];
    PropertiesStyleBagTextAlignTextDecorationLineTextDecorationStyleConfig = {
      get textAlign() { return uiMessage("inspector.styleBag.align"); },
      textDecorationLine: "Decoration",
      textDecorationStyle: "Line style",
      textDecorationColor: "Line color",
      textTransform: "Case",
      fontFamily: "Family",
      fontVariantNumeric: "Numerals",
      letterSpacing: "Letter space",
      textStrokeWidth: "Stroke width",
      get textStrokeColor() { return uiMessage("inspector.styleBag.strokeColor"); },
      get backgroundColor() { return uiMessage("inspector.styleBag.background"); },
      get backgroundGradient() { return uiMessage("inspector.styleBag.gradient"); },
      get boxShadow() { return uiMessage("inspector.styleBag.dropShadow"); },
      backdropFilter: "Backdrop",
      mixBlendMode: "Blend mode",
    };
    PropertiesStyleBagFilterBackdropFilterConfig = {
      filter: "Layer blur",
      backdropFilter: "Background blur",
    };
    PropertiesStyleBagConstant = 4;
    InnerShadowNeedsAFillOrMessage =
      uiMessage("inspector.styleBag.innerShadowNeedsAFill");
    NotOnDiamondOrArrowShapesMessage = uiMessage("inspector.styleBag.notOnDiamondOrArrow");
  };
}
