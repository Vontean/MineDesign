import { useUiLocale } from '../../ui-locale.ts';
/** Restored application module; prepare first, initialize in original order. */
import {
  type Dynamic,
} from "../../runtime-types";
import { load_react_jsx_runtime } from "../../dependencies";
import { announce } from "../accessibility/announcer";
import { summarizeContrastResults } from "../color/contrast-ui";
import { evaluateColorContrast } from "../color/contrast";
import { hsvaToRgbaHex, parseHsvaColor } from "../color/picker-primitives";
import { ColorSwatchPicker, NoneValue, normalizeColorSwatches } from "./color-swatches";
import { reactPropertiesTooltip } from "./tooltip";
import { toModuleNamespace } from "../../module-helpers";

var jsxPropertiesColorPicker: Dynamic;
function ColorPickerWithSwatches({
  value: colorValue,
  unset: unset,
  opaque: opaque,
  onChange: onChange,
  onPickEnd: onPickEnd,
  contrast: contrast,
  swatches: swatches,
  none: noneOption,
  current: current,
  onSwatch: onSwatch,
  ...props
}: Dynamic): Dynamic {
  useUiLocale();
  let normalizedSwatches: Dynamic = (0, reactPropertiesTooltip.useMemo)(
      (): Dynamic =>
        normalizeColorSwatches(
          swatches,
          noneOption !== undefined,
          noneOption?.disabledReason,
        ),
      [swatches, noneOption !== undefined, noneOption?.disabledReason],
    ),
    toHex: Dynamic = (hsvaInput?: Dynamic): Dynamic =>
      hsvaToRgbaHex({
        ...parseHsvaColor(hsvaInput),
        ...(opaque
          ? {
              a: 1,
            }
          : {}),
      }),
    swatchSignature: Dynamic = JSON.stringify(
      normalizedSwatches.map((swatch?: Dynamic): Dynamic => [swatch.name, swatch.color]),
    ),
    swatchHexes: Dynamic = (0, reactPropertiesTooltip.useMemo)(
      (): Dynamic =>
        normalizedSwatches.map(
          (swatch?: Dynamic): Dynamic =>
            swatch.empty === true ? null : toHex(swatch.color),
        ),
      [swatchSignature, opaque],
    ),
    currentSwatchName: Dynamic = (0,
    reactPropertiesTooltip.useMemo)((): Dynamic => {
      if (noneOption?.current) return NoneValue;
      if (current !== undefined) return current;
      if (unset) return null;
      let currentHex: Dynamic = toHex(colorValue),
        swatchIndex: Dynamic = swatchHexes.indexOf(currentHex);
      return swatchIndex < 0
        ? null
        : (normalizedSwatches[swatchIndex].picks ?? normalizedSwatches[swatchIndex].name);
    }, [normalizedSwatches, swatchHexes, colorValue, unset, opaque, noneOption?.current, current]);
  return (
    <ColorSwatchPicker
      {...props}
      swatches={normalizedSwatches}
      current={currentSwatchName}
      onSwatch={(swatchName?: Dynamic): Dynamic => {
        if (swatchName === NoneValue) return noneOption?.onPick();
        if (onSwatch !== undefined) return onSwatch(swatchName);
        let pickedSwatch: Dynamic = normalizedSwatches.find(
          (swatch?: Dynamic): Dynamic => swatch.name === swatchName,
        );
        if (pickedSwatch === undefined) return;
        let pickedHex: Dynamic = toHex(pickedSwatch.color);
        onChange(pickedHex);
        onPickEnd?.(pickedHex);
        contrast !== undefined &&
          announce((): Dynamic => {
            let contrastResults: Dynamic = evaluateColorContrast(
              pickedHex,
              contrast,
            );
            return contrastResults === undefined
              ? null
              : summarizeContrastResults(contrastResults).spoken;
          });
      }}
      color={{
        value: colorValue,
        unset: unset,
        opaque: opaque,
        onChange: onChange,
        onPickEnd: onPickEnd,
        contrast: contrast,
      }}
    />
  );
}
export {
  ColorPickerWithSwatches,
  jsxPropertiesColorPicker,
};
export function installEditorPropertiesColorPicker(): () => void {
  return () => {
    jsxPropertiesColorPicker = toModuleNamespace(
      load_react_jsx_runtime(),
      1,
    );
  };
}
