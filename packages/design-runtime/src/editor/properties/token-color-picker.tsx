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
import { PropertiesDropShadowEditorTest, reactPropertiesDropShadowEditor_3 } from "./drop-shadow-editor";
import { toModuleNamespace } from "../../module-helpers";

var reactPropertiesTokenColorPicker: Dynamic;
var reactPropertiesTokenColorPicker_2: Dynamic;
var AssetPickerContext: Dynamic;
function matchArtboardColorToken(
  input?: Dynamic,
  options?: Dynamic,
  context?: Dynamic,
): Dynamic {
  let value: Dynamic = (input ?? "").trim();
  if (value === "" || value.length > 128) return;
  let value2: Dynamic = cssVariableName(value);
  if (value2 !== null) return value2.replace(/^--/, "");
  if (context === undefined) return;
  let callback: Dynamic = (input2?: Dynamic): Dynamic => {
      let value4: Dynamic =
        normalizeCssColor(input2) ??
        (/^[a-z]+$/i.test(input2.trim()) &&
        PropertiesDropShadowEditorTest(input2)
          ? input2
          : undefined);
      return value4 === undefined
        ? undefined
        : hsvaToRgbaCss(parseHsvaColor(value4));
    },
    value3: Dynamic = callback(value);
  return value3 === undefined
    ? undefined
    : options
        .find(
          (input2?: Dynamic): Dynamic =>
            input2.name.startsWith("--") &&
            !context.has(input2.name) &&
            callback(
              resolveColorTokenValue(input2.value, options) ??
                input2.value,
            ) === value3,
        )
        ?.name.replace(/^--/, "");
}
function editorColorSwatches(input?: Dynamic): Dynamic {
  return input.map((input2?: Dynamic): Dynamic => {
    let value: Dynamic = input2.name.replace(/^--/, "");
    return {
      name: input2.name,
      color:
        resolveColorTokenValue(input2.value, input) ??
        input2.value,
      label: value.startsWith("#") ? value.toUpperCase() : value,
      ...(input2.group !== undefined
        ? {
            group: input2.group,
          }
        : {}),
      ...(input2.subgroup !== undefined
        ? {
            subgroup: input2.subgroup,
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
  input?: Dynamic,
  options?: Dynamic,
  context?: Dynamic,
): Dynamic {
  if (input === undefined) return null;
  let value: Dynamic = cssVariableName(input);
  if (value !== null)
    return options.some((input2?: Dynamic): Dynamic => input2.name === value)
      ? value
      : null;
  if (!PropertiesDropShadowEditorTest(input)) return null;
  let value2: Dynamic = hsvaToRgbaCss(
      parseHsvaColor(input),
    ),
    value3: Dynamic = options.find(
      (input2?: Dynamic): Dynamic =>
        context?.has(input2.picks ?? input2.name) !== true &&
        hsvaToRgbaCss(
          parseHsvaColor(input2.color),
        ) === value2,
    );
  return value3 === undefined ? null : (value3.picks ?? value3.name);
}
function resolveColorSwatchValue(
  input?: Dynamic,
  options?: Dynamic,
  context?: Dynamic,
): Dynamic {
  let value: Dynamic = options.find(
    (input2?: Dynamic): Dynamic => input2.name === input,
  );
  if (value)
    return context?.has(input) === true
      ? cssVariableValue(input)
      : value.color;
}
function TokenColorPicker({
  value: value,
  authoredValue: authoredValue,
  onChange: onChange,
  onPickEnd: onPickEnd,
  tokens: tokens2,
  context: context,
  iframeDefinedVars: iframeDefinedVars,
  unset: unset,
  title: title,
  contrast: contrast,
  ...props
}: Dynamic): Dynamic {
  useUiLocale();
  let value2: Dynamic = (0,
    reactPropertiesDropShadowEditor_3.useMemo)(
      (): Dynamic =>
        resolveColorTokenValue(value, tokens2) ?? value,
      [value, tokens2],
    ),
    value3: Dynamic = (0, reactPropertiesDropShadowEditor_3.useMemo)(
      (): Dynamic =>
        mergeDesignSystemSwatches(
          context,
          editorColorSwatches(tokens2),
        ),
      [tokens2, context],
    ),
    value4: Dynamic = authoredValue ?? (unset ? undefined : value),
    value5: Dynamic = (0, reactPropertiesDropShadowEditor_3.useMemo)(
      (): Dynamic =>
        matchAuthoredColorToken(value4, value3, iframeDefinedVars),
      [value4, value3, iframeDefinedVars],
    );
  return (
    <div data-testid={"dc-color-picker-body"}>
      <ColorSwatchPicker
        {...props}
        title={title}
        swatches={value3}
        current={value5}
        repick={unset === true && value5 !== null}
        fold={true}
        onSwatch={(input?: Dynamic): Dynamic => {
          let value6: Dynamic = resolveColorSwatchValue(
            input,
            value3,
            iframeDefinedVars,
          );
          value6 !== undefined && (onChange(value6), onPickEnd?.(value6));
        }}
        color={{
          value: value2 || "#ffffff",
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
  reactPropertiesTokenColorPicker_2,
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
    reactPropertiesTokenColorPicker_2 = toModuleNamespace(
      load_react(),
      1,
    );
    AssetPickerContext = (0, reactPropertiesTokenColorPicker_2.createContext)({
      projectPath: "appifact",
      canEdit: true,
    });
  };
}
