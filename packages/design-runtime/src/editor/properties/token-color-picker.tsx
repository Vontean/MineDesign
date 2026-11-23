import { useUiLocale } from '../../ui-locale.ts';
/** Restored application module; prepare first, initialize in original order. */
import {
  type Dynamic,
} from "../../runtime-types";
import { cssVariableName, cssVariableValue } from "../../canvas/working-state";
import { initializeCdsIndex } from "../../cds/index";
import { load_react } from "../../dependencies";
import { normalizeCssColor } from "../../design-system/type-declarations";
import { resolveColorTokenValue } from "../accessibility/announcements";
import { InThisArtboardMessage } from "../color/contrast-copy";
import { hsvaToRgbaCss, parseHsvaColor } from "../color/picker-primitives";
import { ColorSwatchPicker, mergeDesignSystemSwatches } from "./color-swatches";
import { PropertiesDropShadowEditorTest, reactForTokenColorPicker } from "./drop-shadow-editor";
import { toModuleNamespace } from "../../module-helpers";

var reactPropertiesTokenColorPicker: Dynamic;
var reactForAssetPickerContext: Dynamic;
var AssetPickerContext: Dynamic;
function matchArtboardColorToken(
  cssValue?: Dynamic,
  tokens?: Dynamic,
  excludedNames?: Dynamic,
): Dynamic {
  let trimmedValue: Dynamic = (cssValue ?? "").trim();
  if (trimmedValue === "" || trimmedValue.length > 128) return;
  let variableName: Dynamic = cssVariableName(trimmedValue);
  if (variableName !== null) return variableName.replace(/^--/, "");
  if (excludedNames === undefined) return;
  let toComparableColor: Dynamic = (colorText?: Dynamic): Dynamic => {
      let validColor: Dynamic =
        normalizeCssColor(colorText) ??
        (/^[a-z]+$/i.test(colorText.trim()) &&
        PropertiesDropShadowEditorTest(colorText)
          ? colorText
          : undefined);
      return validColor === undefined
        ? undefined
        : hsvaToRgbaCss(parseHsvaColor(validColor));
    },
    targetColor: Dynamic = toComparableColor(trimmedValue);
  return targetColor === undefined
    ? undefined
    : tokens
        .find(
          (token?: Dynamic): Dynamic =>
            token.name.startsWith("--") &&
            !excludedNames.has(token.name) &&
            toComparableColor(
              resolveColorTokenValue(token.value, tokens) ??
                token.value,
            ) === targetColor,
        )
        ?.name.replace(/^--/, "");
}
function editorColorSwatches(tokens?: Dynamic): Dynamic {
  return tokens.map((token?: Dynamic): Dynamic => {
    let tokenLabel: Dynamic = token.name.replace(/^--/, "");
    return {
      name: token.name,
      color:
        resolveColorTokenValue(token.value, tokens) ??
        token.value,
      label: tokenLabel.startsWith("#") ? tokenLabel.toUpperCase() : tokenLabel,
      ...(token.group !== undefined
        ? {
            group: token.group,
          }
        : {}),
      ...(token.subgroup !== undefined
        ? {
            subgroup: token.subgroup,
          }
        : {}),
    };
  });
}
function artboardColorSwatchGroup(items?: Dynamic): Dynamic {
  return items.length > 0
    ? {
        label: InThisArtboardMessage,
        colors: items,
      }
    : undefined;
}
function matchAuthoredColorToken(
  authoredValue?: Dynamic,
  swatches?: Dynamic,
  usedNames?: Dynamic,
): Dynamic {
  if (authoredValue === undefined) return null;
  let variableName: Dynamic = cssVariableName(authoredValue);
  if (variableName !== null)
    return swatches.some((swatch?: Dynamic): Dynamic => swatch.name === variableName)
      ? variableName
      : null;
  if (!PropertiesDropShadowEditorTest(authoredValue)) return null;
  let targetColor: Dynamic = hsvaToRgbaCss(
      parseHsvaColor(authoredValue),
    ),
    matchingSwatch: Dynamic = swatches.find(
      (swatch?: Dynamic): Dynamic =>
        usedNames?.has(swatch.picks ?? swatch.name) !== true &&
        hsvaToRgbaCss(
          parseHsvaColor(swatch.color),
        ) === targetColor,
    );
  return matchingSwatch === undefined ? null : (matchingSwatch.picks ?? matchingSwatch.name);
}
function resolveColorSwatchValue(
  swatchName?: Dynamic,
  swatches?: Dynamic,
  definedVars?: Dynamic,
): Dynamic {
  let swatch: Dynamic = swatches.find(
    (candidate?: Dynamic): Dynamic => candidate.name === swatchName,
  );
  if (swatch)
    return definedVars?.has(swatchName) === true
      ? cssVariableValue(swatchName)
      : swatch.color;
}
function TokenColorPicker({
  value: colorValue,
  authoredValue: authoredValue,
  onChange: onChange,
  onPickEnd: onPickEnd,
  tokens: tokenList,
  context: artboardSwatches,
  iframeDefinedVars: iframeDefinedVars,
  unset: unset,
  title: title,
  contrast: contrast,
  ...props
}: Dynamic): Dynamic {
  useUiLocale();
  let resolvedColor: Dynamic = (0,
    reactForTokenColorPicker.useMemo)(
      (): Dynamic =>
        resolveColorTokenValue(colorValue, tokenList) ?? colorValue,
      [colorValue, tokenList],
    ),
    allSwatches: Dynamic = (0, reactForTokenColorPicker.useMemo)(
      (): Dynamic =>
        mergeDesignSystemSwatches(
          artboardSwatches,
          editorColorSwatches(tokenList),
        ),
      [tokenList, artboardSwatches],
    ),
    authoredColor: Dynamic = authoredValue ?? (unset ? undefined : colorValue),
    selectedSwatchName: Dynamic = (0, reactForTokenColorPicker.useMemo)(
      (): Dynamic =>
        matchAuthoredColorToken(authoredColor, allSwatches, iframeDefinedVars),
      [authoredColor, allSwatches, iframeDefinedVars],
    );
  return (
    <div data-testid={"dc-color-picker-body"}>
      <ColorSwatchPicker
        {...props}
        title={title}
        swatches={allSwatches}
        current={selectedSwatchName}
        repick={unset === true && selectedSwatchName !== null}
        fold={true}
        onSwatch={(swatchName?: Dynamic): Dynamic => {
          let swatchColor: Dynamic = resolveColorSwatchValue(
            swatchName,
            allSwatches,
            iframeDefinedVars,
          );
          swatchColor !== undefined && (onChange(swatchColor), onPickEnd?.(swatchColor));
        }}
        color={{
          value: resolvedColor || "#ffffff",
          unset: unset,
          onChange: onChange,
          onPickEnd: onPickEnd,
          contrast: contrast,
        }}
      />
    </div>
  );
}
export {
  artboardColorSwatchGroup,
  AssetPickerContext,
  editorColorSwatches,
  matchArtboardColorToken,
  matchAuthoredColorToken,
  reactPropertiesTokenColorPicker,
  reactForAssetPickerContext,
  resolveColorSwatchValue,
  TokenColorPicker,
};
export function installEditorPropertiesTokenColorPicker(): () => void {
  return () => {
    reactPropertiesTokenColorPicker = toModuleNamespace(
      load_react(),
      1,
    );
    initializeCdsIndex();
    reactForAssetPickerContext = toModuleNamespace(
      load_react(),
      1,
    );
    AssetPickerContext = (0, reactForAssetPickerContext.createContext)({
      projectPath: "appifact",
      canEdit: true,
    });
  };
}
