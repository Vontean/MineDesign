import { useUiLocale } from '../../ui-locale.ts';
/** Restored application module; prepare first, initialize in original order. */
import {
  type Dynamic,
} from "../../runtime-types";
import { normalizeCssColor } from "../../design-system/type-declarations";
import { resolveColorTokenValue } from "../accessibility/announcements";
import { ColorValue } from "../color/contrast-copy";
import { classifyStyleValue, describeColorValue } from "../css/values";
import { useInspectorContext } from "../inspector/context-part-2";
import { mergeDesignSystemSwatches } from "./color-swatches";
import { PropertiesDropShadowEditorTest, reactPropertiesDropShadowEditor_2 } from "./drop-shadow-editor";
import { inspectorFieldDisplay, Value_6 } from "./inherited-field";
import { PropertyRow } from "./row";
import { PropertyColorRow } from "./rows";
import { artboardColorSwatchGroup, editorColorSwatches, matchArtboardColorToken, matchAuthoredColorToken, resolveColorSwatchValue } from "./token-color-picker";

var PropertiesColorRowSizeFillShadowSet: Dynamic;
function backgroundWellValue(input?: Dynamic): Dynamic {
  if (input.mixed)
    return {
      empty: true,
    };
  let value: Dynamic = (input.fallback ?? "").trim(),
    value2: Dynamic =
      value && (0, classifyStyleValue)(value).kind === "literal"
        ? {
            css: value,
            empty: false,
          }
        : {
            empty: true,
          },
    value3: Dynamic = (input.value ?? "").trim();
  if (!value3) return value2;
  let kind: Dynamic = (0, classifyStyleValue)(value3).kind;
  return kind === "var"
    ? value2
    : kind !== "literal"
      ? {
          empty: true,
        }
      : {
          css: value3,
          empty: false,
        };
}
function PropertyCssColorRow({
  state: state,
  onCommit: onCommit,
  shell: shell,
}: Dynamic): Dynamic {
  useUiLocale();
  let {
      dsColorTokens: value,
      artboardColors: value2,
      iframeDefinedVars: value3,
      editsAreUndoSteps: value4,
    }: Dynamic = (0, useInspectorContext)(),
    { text: value5, placeholder: value6 }: Dynamic = (0,
    inspectorFieldDisplay)(state),
    { css: value7, empty: value8 }: Dynamic = backgroundWellValue(state),
    value9: Dynamic = (0, resolveColorTokenValue)(
      state.varSource ?? state.value,
      value,
    );
  value9 && ((value7 = value9), (value8 = false));
  let value10: Dynamic = state.mixed
      ? undefined
      : (state.varSource ?? (value5 || value6)) || undefined,
    value11: Dynamic = state.varPartial ? value5 || value6 : value10,
    value12: Dynamic = (0, reactPropertiesDropShadowEditor_2.useMemo)(
      (): Dynamic =>
        (0, matchArtboardColorToken)(value11, value, value3),
      [value11, value, value3],
    ),
    value13: Dynamic =
      !!state.inheritedFrom || !(state.varSource ?? state.value ?? "").trim(),
    [value14, value15]: Dynamic = (0,
    reactPropertiesDropShadowEditor_2.useState)(undefined),
    value16: Dynamic = (0, reactPropertiesDropShadowEditor_2.useMemo)(
      (): Dynamic =>
        (0, mergeDesignSystemSwatches)(
          value14,
          (0, editorColorSwatches)(value),
        ),
      [value14, value],
    ),
    value17: Dynamic = (0, reactPropertiesDropShadowEditor_2.useMemo)(
      (): Dynamic =>
        (0, matchAuthoredColorToken)(value10, value16, value3),
      [value10, value16, value3],
    ),
    value18: Dynamic =
      value7 !== undefined &&
      (0, PropertiesDropShadowEditorTest)(value7)
        ? ((0, normalizeCssColor)(value7) ??
          (0, normalizeCssColor)(
            (0, describeColorValue)(value7),
          ) ??
          value7)
        : undefined;
  return (
    <PropertyRow {...shell}>
      <PropertyColorRow
        testid={`dc-color-${state.prop}`}
        label={state.label}
        value={value8 ? undefined : value18}
        clearLabel={
          (0, describeColorValue)(value5) ||
          (0, describeColorValue)(value6) ||
          Value_6
        }
        unset={value13}
        valueName={value12 ?? null}
        mixed={state.mixed}
        disabled={state.disabled}
        swatches={value16}
        current={value17}
        fold={true}
        popoverTitle={ColorValue}
        editsAreUndoSteps={value4}
        onOpenChange={(input?: Dynamic): Dynamic => {
          input && value15((0, artboardColorSwatchGroup)(value2));
        }}
        onSwatch={(input?: Dynamic): Dynamic => {
          let value19: Dynamic = (0, resolveColorSwatchValue)(
            input,
            value16,
            value3,
          );
          value19 !== undefined && onCommit(state.prop, value19);
        }}
        onChange={(input?: Dynamic): Dynamic => {
          input !== undefined && onCommit(state.prop, input);
        }}
      />
    </PropertyRow>
  );
}
export {
  backgroundWellValue,
  PropertiesColorRowSizeFillShadowSet,
  PropertyCssColorRow,
};
export function installEditorPropertiesColorRow(): () => void {
  return () => {
    PropertiesColorRowSizeFillShadowSet = new Set([
      "size",
      "fill",
      "shadow",
      "image",
      "transform",
    ]);
  };
}
