import { uiMessage } from '@minedesign/contracts/ui-messages';
import { useUiLocale } from '../../ui-locale.ts';
/** Restored application module; prepare first, initialize in original order. */
import {
  type Dynamic,
} from "../../runtime-types";
import { TextInput } from "../../cds/components/text-input";
import { cn } from "../../cds/theme/class-names";
import { designSystemColorOptions, useDesignSystems } from "../../design-system/store";
import { hsvaToRgbaHex, parseHsvaColor } from "../color/picker-primitives";
import { getSupportedTool, isToolNameList, reactForPropColorInput } from "../inspector/context-part-2";
import { PropertiesRowsLimit, PropertyBooleanRow, PropertyEnumRow, PropertyHexRow, PropertyNumberRow, PropertyRangeRow, PropertySelectRow, PropertyTextRow } from "../properties/rows";
import { sanitizeCssBackground, sanitizeCssColor } from "../../platform/css-sanitization";

var ComponentsPropEditorsDataTweakPopupConfig: Dynamic;
var ComponentsPropEditorsPattern: Dynamic;
var ComponentsPropEditors234Config: Dynamic;
function primitivePropText(value?: Dynamic): Dynamic {
  return value == null || typeof value == "object" ? "" : String(value);
}
function numericPropValue(value?: Dynamic): Dynamic {
  if (typeof value == "number")
    return Number.isFinite(value) ? value : undefined;
  if (typeof value == "string" && value.trim() !== "") {
    let parsed: Dynamic = Number(value);
    return Number.isFinite(parsed) ? parsed : undefined;
  }
}
function propStepDecimalPlaces(step?: Dynamic): Dynamic {
  let stepText: Dynamic = String(step),
    dotIndex: Dynamic = stepText.indexOf(".");
  return dotIndex === -1 || stepText.includes("e") ? 0 : stepText.length - dotIndex - 1;
}
function clampPropStep(
  value?: Dynamic,
  min?: Dynamic,
  max?: Dynamic,
  step?: Dynamic,
): Dynamic {
  if (!(step > 0)) return Math.min(max, Math.max(min, value));
  let decimals: Dynamic = Math.max(
      propStepDecimalPlaces(step),
      propStepDecimalPlaces(min),
    ),
    snapped: Dynamic = Number(
      (Math.round((value - min) / step) * step + min).toFixed(
        decimals,
      ),
    );
  return Math.min(max, Math.max(min, snapped));
}
function propOptionItems(options?: Dynamic): Dynamic {
  return (options ?? []).map(
    (option?: Dynamic): Dynamic =>
      option != null && typeof option == "object" && "value" in option
        ? {
            value: option.value,
            label: String(option.label ?? option.value),
          }
        : {
            value: option,
            label: String(option),
          },
  );
}
function isLightHexColor(hex?: Dynamic): Dynamic {
  let digits: Dynamic = hex.replace("#", ""),
    fullHex: Dynamic =
      digits.length === 3
        ? digits.replace(/./g, (digit?: Dynamic): Dynamic => digit + digit)
        : digits.padEnd(6, "0"),
    rgb: Dynamic = parseInt(fullHex.slice(0, 6), 16);
  if (Number.isNaN(rgb)) return true;
  let red: Dynamic = (rgb >> 16) & 255,
    green: Dynamic = (rgb >> 8) & 255,
    blue: Dynamic = rgb & 255;
  return red * 299 + green * 587 + blue * 114 > 148e3;
}
function PropPaletteCards({
  options: options,
  value: value,
  onChange: onChange,
  size = "card",
  "aria-label": ariaLabel,
}: Dynamic): Dynamic {
  useUiLocale();
  let toKey: Dynamic = (option?: Dynamic): Dynamic =>
      String(JSON.stringify(option)).toLowerCase(),
    selectedKey: Dynamic = toKey(value),
    isRowSize: Dynamic = size === "row";
  return (
    <div
      className={cn(
        "flex min-w-0 flex-1 gap-1.5",
        isRowSize && "flex-wrap gap-1 py-0.5",
      )}
      role={"radiogroup"}
      aria-label={ariaLabel}
    >
      {options.map((option?: Dynamic, index?: Dynamic): Dynamic => {
        let colors: Dynamic = (Array.isArray(option) ? option : [option]).map(
            String,
          ),
          [mainColor = "#000", ...sideColors]: Dynamic = colors,
          visibleSideColors: Dynamic = sideColors.slice(0, isRowSize ? 3 : 4),
          isSelected: Dynamic = toKey(option) === selectedKey;
        return (
          <button
            key={index}
            type={"button"}
            role={"radio"}
            aria-checked={isSelected}
            aria-label={colors.join(", ")}
            title={colors.join(" \xB7 ")}
            onClick={(): Dynamic => onChange(option)}
            className={cn(
              "relative min-w-0 cursor-default overflow-hidden border-0 p-0",
              isRowSize
                ? "h-control basis-[calc((100%-0.5rem)/3)] rounded pointer-coarse:h-10"
                : "h-[46px] flex-1 rounded-md",
              "transition-[transform,box-shadow] duration-[120ms] ease-[cubic-bezier(.3,.7,.4,1)]",
              isSelected
                ? "shadow-[0_0_0_1.5px_var(--cds-text-primary),0_2px_6px_rgba(0,0,0,0.15)]"
                : cn(
                    "shadow-card-ring hover:shadow-field-hover",
                    !isRowSize && "hover:-translate-y-px",
                  ),
            )}
            style={{
              background: sanitizeCssBackground(mainColor),
            }}
          >
            {visibleSideColors.length > 0 && (<span
                className={
                  "absolute inset-y-0 right-0 flex w-[34%] flex-col shadow-[-1px_0_0_rgba(0,0,0,0.1)]"
                }
              >
                {visibleSideColors.map(
                  (sideColor?: Dynamic, sideIndex?: Dynamic): Dynamic => (
                    <i
                      key={sideIndex}
                      className={cn(
                        "flex-1",
                        sideIndex > 0 &&
                          "shadow-[0_-1px_0_color-mix(in_srgb,var(--cds-text-primary)_18%,transparent)]",
                      )}
                      style={{
                        background: sanitizeCssBackground(
                          sideColor,
                        ),
                      }}
                    />
                  ),
                )}
              </span>)}
            {isSelected && (<svg
                viewBox={"0 0 14 14"}
                aria-hidden={"true"}
                className={cn(
                  "absolute drop-shadow-[0_1px_1px_rgba(0,0,0,0.3)]",
                  isRowSize
                    ? "left-1 top-1 h-[11px] w-[11px]"
                    : "left-1.5 top-1.5 h-[13px] w-[13px]",
                )}
              >
                <path
                  d={"M3 7.2 5.8 10 11 4.2"}
                  fill={"none"}
                  strokeWidth={"2.2"}
                  strokeLinecap={"round"}
                  strokeLinejoin={"round"}
                  stroke={
                    isLightHexColor(mainColor) ? "rgba(0,0,0,.78)" : "#fff"
                  }
                />
              </svg>)}
          </button>
        );
      })}
    </div>
  );
}
function propColorEditorKind(items?: Dynamic): Dynamic {
  return items.length > 0 &&
    !items.every((option?: Dynamic): Dynamic => typeof option == "string")
    ? "palette-cards"
    : "color-well";
}
function canonicalPropHexColor(color?: Dynamic): Dynamic {
  return hsvaToRgbaHex(parseHsvaColor(color));
}
function propColorOptionKeys(colors?: Dynamic): Dynamic {
  return colors.map((color?: Dynamic, index?: Dynamic): Dynamic => {
    let trimmed: Dynamic = color.trim();
    return ComponentsPropEditorsPattern.test(trimmed)
      ? canonicalPropHexColor(trimmed)
      : /\bvar\s*\(/i.test(trimmed)
        ? `\0unkeyable-${index}`
        : /^(?:inherit|initial|unset|revert|revert-layer|currentcolor)$/i.test(
              trimmed,
            )
          ? `\0unkeyable-${index}`
          : typeof CSS !== "undefined" &&
              typeof CSS.supports == "function" &&
              CSS.supports("color", trimmed)
            ? canonicalPropHexColor(trimmed)
            : `\0unkeyable-${index}`;
  });
}
function restorePropColorOption(
  swatches?: Dynamic,
  swatchKeys?: Dynamic,
  pickedColor?: Dynamic,
): Dynamic {
  let keyIndex: Dynamic = swatchKeys.indexOf(canonicalPropHexColor(pickedColor));
  return keyIndex >= 0 ? swatches[keyIndex] : pickedColor.toLowerCase();
}
function designSystemPropColorOptions(
  swatches?: Dynamic,
  swatchKeys?: Dynamic,
  designSystems?: Dynamic,
): Dynamic {
  let systemOptions: Dynamic = designSystemColorOptions(designSystems),
    entries: Dynamic = new Map();
  for (let systemOption of systemOptions as Dynamic) {
    if (
      typeof systemOption == "string" ||
      !ComponentsPropEditorsPattern.test(systemOption.value) ||
      parseHsvaColor(systemOption.value).a < 1
    )
      continue;
    let hex: Dynamic = canonicalPropHexColor(systemOption.value);
    entries.has(hex) || entries.set(hex, systemOption.label ?? systemOption.name);
  }
  return [
    ...swatches.map((swatch?: Dynamic, index?: Dynamic): Dynamic => {
      let label: Dynamic = ComponentsPropEditorsPattern.test(swatch.trim())
        ? entries.get(swatchKeys[index])
        : undefined;
      return label === undefined
        ? swatch
        : {
            name: swatch,
            value: swatch,
            label: label,
          };
    }),
    ...systemOptions,
  ];
}
function PropRangeInput({
  name: name,
  cur: cur,
  min: minValue,
  max: max,
  step: step,
  unit: unit,
  onChange: onChange,
  onReset: onReset,
}: Dynamic): Dynamic {
  useUiLocale();
  let currentValue: Dynamic = numericPropValue(cur) ?? minValue,
    lastValueRef: Dynamic = (0, reactForPropColorInput.useRef)(currentValue);
  lastValueRef.current = currentValue;
  return (
    <PropertyRangeRow
      label={name}
      value={currentValue}
      min={minValue}
      max={max}
      step={step}
      unit={unit}
      onValue={(nextValue?: Dynamic): Dynamic => {
        let clamped: Dynamic = clampPropStep(nextValue, minValue, max, step);
        clamped !== lastValueRef.current &&
          ((lastValueRef.current = clamped), onChange(clamped));
      }}
      onReset={onReset}
    />
  );
}
function PropColorInput({
  name: name,
  cur: cur,
  swatches: swatches,
  onChange: onChange,
  onReset: onReset,
  tweak: tweak,
}: Dynamic): Dynamic {
  useUiLocale();
  let trimmed: Dynamic = typeof cur == "string" ? cur.trim() : "",
    validColor: Dynamic =
      trimmed !== "" && sanitizeCssColor(trimmed) === trimmed
        ? trimmed
        : undefined,
    stableSwatches: Dynamic = (0, reactForPropColorInput.useMemo)(
      (): Dynamic => swatches,
      [swatches.join("\0"), swatches.length],
    ),
    swatchKeys: Dynamic = (0, reactForPropColorInput.useMemo)(
      (): Dynamic => propColorOptionKeys(stableSwatches),
      [stableSwatches],
    ),
    designSystems: Dynamic = useDesignSystems(),
    allSwatches: Dynamic = (0, reactForPropColorInput.useMemo)(
      (): Dynamic => designSystemPropColorOptions(stableSwatches, swatchKeys, designSystems),
      [stableSwatches, swatchKeys, designSystems],
    );
  return (
    <PropertyHexRow
      label={name}
      value={validColor}
      swatches={allSwatches}
      onReset={onReset}
      popupAttrs={
        tweak ? ComponentsPropEditorsDataTweakPopupConfig : undefined
      }
      onChange={(pickedColor?: Dynamic): Dynamic => {
        pickedColor !== undefined &&
          onChange(restorePropColorOption(stableSwatches, swatchKeys, pickedColor));
      }}
    />
  );
}
function propOptionsFitSegments(items?: Dynamic): Dynamic {
  return items.length < 2 || items.length > PropertiesRowsLimit
    ? false
    : items.reduce(
        (maxLength?: Dynamic, item?: Dynamic): Dynamic =>
          Math.max(maxLength, item.label.length),
        0,
      ) <= (ComponentsPropEditors234Config[items.length] ?? 0);
}
function ComponentPropInput({
  name: name,
  meta: meta,
  value: value,
  onChange: onChange,
  onReset: onReset,
  tweak = false,
  unsetHint: unsetHint,
}: Dynamic): Dynamic {
  useUiLocale();
  let currentValue: Dynamic =
    value === undefined &&
    (unsetHint === undefined || meta.editor === "boolean")
      ? meta.default
      : value;
  switch (meta.editor) {
    case "boolean":
      return (
        <PropertyBooleanRow
          label={name}
          checked={!!currentValue}
          onChange={onChange}
          onReset={onReset}
        />
      );
    case "int":
    case "float": {
      let isInt: Dynamic = meta.editor === "int",
        step: Dynamic = isInt
          ? Math.max(1, Math.trunc(meta.step ?? 1))
          : (meta.step ?? 1);
      return (
        <PropertyNumberRow
          label={name}
          value={numericPropValue(currentValue)}
          min={meta.min}
          max={meta.max}
          step={step}
          smallStep={isInt ? step : undefined}
          unit={meta.unit}
          placeholder={unsetHint}
          clearable={true}
          onValue={(nextValue?: Dynamic): Dynamic => {
            if (nextValue === undefined) return onChange(undefined);
            onChange(isInt ? Math.trunc(nextValue) : nextValue);
          }}
          onReset={onReset}
        />
      );
    }
    case "range":
      return (
        <PropRangeInput
          name={name}
          cur={currentValue}
          min={meta.min ?? 0}
          max={meta.max ?? 100}
          step={meta.step ?? 1}
          unit={meta.unit}
          onChange={onChange}
          onReset={onReset}
        />
      );
    case "color": {
      let colorOptions: Dynamic = (
        Array.isArray(meta.options) ? meta.options : []
      ).slice(0, 64);
      return propColorEditorKind(colorOptions) === "palette-cards" ? (
        <PropertyTextRow label={name} onReset={onReset}>
          <PropPaletteCards
            size={"row"}
            aria-label={name}
            options={colorOptions}
            value={currentValue}
            onChange={onChange}
          />
        </PropertyTextRow>
      ) : (
        <PropColorInput
          name={name}
          cur={currentValue}
          swatches={colorOptions}
          onChange={onChange}
          onReset={onReset}
          tweak={tweak}
        />
      );
    }
    case "enum": {
      let optionItems: Dynamic = propOptionItems(meta.options),
        selectItems: Dynamic = optionItems.map(
          (item?: Dynamic, index?: Dynamic): Dynamic => ({
            value: String(index),
            label: item.label,
          }),
        ),
        selectedValue: Dynamic =
          currentValue ?? (unsetHint === undefined ? optionItems[0]?.value : undefined),
        selectedIndex: Dynamic = optionItems.findIndex(
          (item?: Dynamic): Dynamic => item.value === selectedValue,
        );
      selectedIndex < 0 &&
        (selectedIndex = optionItems.findIndex(
          (item?: Dynamic): Dynamic =>
            String(item.value) === primitivePropText(selectedValue),
        ));
      let handleSelect: Dynamic = (indexText?: Dynamic): Dynamic => {
        let chosenItem: Dynamic = optionItems[Number(indexText)];
        chosenItem !== undefined && onChange(chosenItem.value);
      };
      if (
        propOptionsFitSegments(optionItems) &&
        !(unsetHint !== undefined && currentValue === undefined)
      )
        return (
          <PropertyEnumRow
            label={name}
            options={selectItems}
            popupAttrs={
              tweak ? ComponentsPropEditorsDataTweakPopupConfig : undefined
            }
            value={String(selectedIndex)}
            onChange={handleSelect}
            onReset={onReset}
          />
        );
      let isToolList: Dynamic = isToolNameList(
          optionItems.map((item?: Dynamic): Dynamic => item.value),
        ),
        selectItemsWithIcons: Dynamic = isToolList
          ? selectItems.map(
              (item?: Dynamic, index?: Dynamic): Dynamic => ({
                ...item,
                icon:
                  getSupportedTool(optionItems[index].value) ??
                  null,
              }),
            )
          : selectItems;
      return (
        <PropertySelectRow
          label={name}
          options={selectItemsWithIcons}
          popupAttrs={
            tweak ? ComponentsPropEditorsDataTweakPopupConfig : undefined
          }
          value={selectedIndex < 0 ? "" : String(selectedIndex)}
          placeholder={
            currentValue === undefined && unsetHint !== undefined ? (undefined) : (primitivePropText(selectedValue))
          }
          hint={unsetHint}
          searchable={selectItems.length > 12}
          searchLabel={isToolList ? "Search icons" : undefined}
          onChange={handleSelect}
          onReset={onReset}
        />
      );
    }
    default:
      return (
        <PropertyTextRow
          label={name}
          onReset={onReset}
          onPress={(element?: Dynamic): Dynamic =>
            element.querySelector("input")?.focus()
          }
        >
          <TextInput
            aria-label={name}
            value={primitivePropText(currentValue)}
            onChange={(event?: Dynamic): Dynamic =>
              onChange(event.target.value)
            }
          />
        </PropertyTextRow>
      );
  }
}
export {
  canonicalPropHexColor,
  clampPropStep,
  ComponentPropInput,
  ComponentsPropEditors234Config,
  ComponentsPropEditorsDataTweakPopupConfig,
  ComponentsPropEditorsPattern,
  designSystemPropColorOptions,
  isLightHexColor,
  numericPropValue,
  primitivePropText,
  propColorEditorKind,
  PropColorInput,
  propColorOptionKeys,
  propOptionItems,
  propOptionsFitSegments,
  PropPaletteCards,
  PropRangeInput,
  propStepDecimalPlaces,
  restorePropColorOption,
};
export function installEditorComponentsPropEditors(): () => void {
  return () => {
    ComponentsPropEditorsDataTweakPopupConfig = {
      "data-tweak-popup": "",
    };
    ComponentsPropEditorsPattern =
      /^#(?:[0-9a-f]{3,4}|[0-9a-f]{6}|[0-9a-f]{8})$/i;
    ComponentsPropEditors234Config = {
      2: 12,
      3: 7,
      4: 4,
    };
  };
}
