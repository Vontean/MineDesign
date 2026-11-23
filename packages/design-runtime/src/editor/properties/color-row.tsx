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
import { PropertiesDropShadowEditorTest, reactForPropertyInspectorField } from "./drop-shadow-editor";
import { inspectorFieldDisplay, emDashPlaceholder } from "./inherited-field";
import { PropertyRow } from "./row";
import { PropertyColorRow } from "./rows";
import { artboardColorSwatchGroup, editorColorSwatches, matchArtboardColorToken, matchAuthoredColorToken, resolveColorSwatchValue } from "./token-color-picker";

var PropertiesColorRowSizeFillShadowSet: Dynamic;
function backgroundWellValue(state?: Dynamic): Dynamic {
  if (state.mixed)
    return {
      empty: true,
    };
  let value: Dynamic = (state.fallback ?? "").trim(),
    fallbackWell: Dynamic =
      value && classifyStyleValue(value).kind === "literal"
        ? {
            css: value,
            empty: false,
          }
        : {
            empty: true,
          },
    currentValue: Dynamic = (state.value ?? "").trim();
  if (!currentValue) return fallbackWell;
  let kind: Dynamic = classifyStyleValue(currentValue).kind;
  return kind === "var"
    ? fallbackWell
    : kind !== "literal"
      ? {
          empty: true,
        }
      : {
          css: currentValue,
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
      dsColorTokens: dsColorTokens,
      artboardColors: artboardColors,
      iframeDefinedVars: iframeDefinedVars,
      editsAreUndoSteps: editsAreUndoSteps,
    }: Dynamic = useInspectorContext(),
    { text: displayText, placeholder: displayPlaceholder }: Dynamic = inspectorFieldDisplay(state),
    { css: cssColor, empty: isEmptyWell }: Dynamic = backgroundWellValue(state),
    tokenColor: Dynamic = resolveColorTokenValue(
      state.varSource ?? state.value,
      dsColorTokens,
    );
  tokenColor && ((cssColor = tokenColor), (isEmptyWell = false));
  let authoredValue: Dynamic = state.mixed
      ? undefined
      : (state.varSource ?? (displayText || displayPlaceholder)) || undefined,
    tokenLookupValue: Dynamic = state.varPartial ? displayText || displayPlaceholder : authoredValue,
    artboardTokenName: Dynamic = (0, reactForPropertyInspectorField.useMemo)(
      (): Dynamic =>
        matchArtboardColorToken(tokenLookupValue, dsColorTokens, iframeDefinedVars),
      [tokenLookupValue, dsColorTokens, iframeDefinedVars],
    ),
    isUnset: Dynamic =
      !!state.inheritedFrom || !(state.varSource ?? state.value ?? "").trim(),
    [designSystemSwatches, setDesignSystemSwatches]: Dynamic = (0,
    reactForPropertyInspectorField.useState)(undefined),
    mergedSwatches: Dynamic = (0, reactForPropertyInspectorField.useMemo)(
      (): Dynamic =>
        mergeDesignSystemSwatches(
          designSystemSwatches,
          editorColorSwatches(dsColorTokens),
        ),
      [designSystemSwatches, dsColorTokens],
    ),
    currentSwatch: Dynamic = (0, reactForPropertyInspectorField.useMemo)(
      (): Dynamic =>
        matchAuthoredColorToken(authoredValue, mergedSwatches, iframeDefinedVars),
      [authoredValue, mergedSwatches, iframeDefinedVars],
    ),
    normalizedColor: Dynamic =
      cssColor !== undefined &&
      PropertiesDropShadowEditorTest(cssColor)
        ? (normalizeCssColor(cssColor) ??
          normalizeCssColor(
            describeColorValue(cssColor),
          ) ??
          cssColor)
        : undefined;
  return (
    <PropertyRow {...shell}>
      <PropertyColorRow
        testid={`dc-color-${state.prop}`}
        label={state.label}
        value={isEmptyWell ? undefined : normalizedColor}
        clearLabel={
          describeColorValue(displayText) ||
          describeColorValue(displayPlaceholder) ||
          emDashPlaceholder
        }
        unset={isUnset}
        valueName={artboardTokenName ?? null}
        mixed={state.mixed}
        disabled={state.disabled}
        swatches={mergedSwatches}
        current={currentSwatch}
        fold={true}
        popoverTitle={ColorValue}
        editsAreUndoSteps={editsAreUndoSteps}
        onOpenChange={(isOpen?: Dynamic): Dynamic => {
          isOpen && setDesignSystemSwatches(artboardColorSwatchGroup(artboardColors));
        }}
        onSwatch={(swatchName?: Dynamic): Dynamic => {
          let swatchValue: Dynamic = resolveColorSwatchValue(
            swatchName,
            mergedSwatches,
            iframeDefinedVars,
          );
          swatchValue !== undefined && onCommit(state.prop, swatchValue);
        }}
        onChange={(nextColor?: Dynamic): Dynamic => {
          nextColor !== undefined && onCommit(state.prop, nextColor);
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
