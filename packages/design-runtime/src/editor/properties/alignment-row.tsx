import { uiMessage } from '@minedesign/contracts/ui-messages';
import { useUiLocale } from '../../ui-locale.ts';
/** Restored application module; prepare first, initialize in original order. */
import {
  type Dynamic,
} from "../../runtime-types";
import { Button } from "../../cds/button/button";
import { ButtonGroup } from "../../cds/button/group";
import { cn } from "../../cds/theme/class-names";
import { classifyStyleValue } from "../css/values";
import { PropertyCssEnumRow, PropertyCssTextRow, propertyOptionLabel } from "./css-value-row";
import { inspectorFieldDisplay } from "./inherited-field";
import { PropertyRow } from "./row";
import { PropertySegments } from "./segments";
import { PropertiesSizingRowFlexStartStartCenterConfig, alignItemsIcons as PropertiesSizingRowAlignIcons } from "./sizing-row";
import { TextAlignCenterValue, TextAlignJustifyValue, TextAlignLeftValue, TextAlignRightValue } from "./tooltip";
import { PropertiesTransformRowRowColumnRowReverseConfig } from "./transform-row";
import { TypographyFontCatalogItems, GOOGLE_FONT_CATALOG as TypographyFontCatalogWebFonts } from "../typography/font-catalog";

var PropertiesAlignmentRowSansSerifMonoConfig: Dynamic;
var PropertiesAlignmentRowCache: Dynamic;
function alignmentOptionIcon(propertyName?: Dynamic, optionValue?: Dynamic): Dynamic {
  if (propertyName === "text-align")
    return (
      {
        left: TextAlignLeftValue,
        center: TextAlignCenterValue,
        right: TextAlignRightValue,
        justify: TextAlignJustifyValue,
      } as Dynamic
    )[optionValue];
  if (
    propertyName === "justify-content" ||
    propertyName === "justify-items" ||
    propertyName === "justify-self"
  )
    return (
      PropertiesSizingRowFlexStartStartCenterConfig[optionValue] ??
      PropertiesSizingRowAlignIcons[optionValue]
    );
  if (propertyName === "align-items" || propertyName === "align-self")
    return PropertiesSizingRowAlignIcons[optionValue];
}
function PropertyAlignmentRow({
  state: state,
  onCommit: onCommit,
  shell: shell,
}: Dynamic): Dynamic {
  useUiLocale();
  if (
    classifyStyleValue(state.value).kind !== "literal" &&
    (state.value ?? "").trim()
  )
    return (
      <PropertyCssTextRow
        state={state}
        onCommit={onCommit}
        shell={shell}
      />
    );
  let value: Dynamic = state.companionMixed ?? false,
    companionValueText: Dynamic = (state.companionValue ?? "").trim(),
    literalCompanionValue: Dynamic =
      companionValueText && classifyStyleValue(companionValueText).kind === "literal"
        ? companionValueText
        : "",
    decorationLineValue: Dynamic = value
      ? ""
      : literalCompanionValue || (state.companionFallback ?? "").trim(),
    values: Dynamic = new Set(
      decorationLineValue
        .split(/\s+/)
        .filter((token?: Dynamic): Dynamic => token && token !== "none"),
    ),
    callback: Dynamic = (line?: Dynamic): Dynamic => {
      let nextLines: Dynamic = new Set(values);
      nextLines.has(line) ? nextLines.delete(line) : nextLines.add(line);
      onCommit(
        "text-decoration-line",
        nextLines.size ? [...nextLines].join(" ") : "none",
      );
    },
    hasLiteralCompanion: Dynamic = literalCompanionValue !== "",
    renderDecorationButton: Dynamic = (
      isPressed?: Dynamic,
      isMixed?: Dynamic,
      label?: Dynamic,
      icon?: Dynamic,
      handleClick?: Dynamic,
      isExplicit: Dynamic = true,
    ): Dynamic => (
      <Button
        iconOnly={true}
        icon={icon}
        aria-label={label}
        pressed={isPressed && !isMixed}
        tooltip={
          isMixed ? (`${label} \u2014 mixed`) : (isPressed && !isExplicit ? (`${label} (inherited)`) : (label))
        }
        disabled={state.disabled}
        data-testid={`dc-typestyle-${label.toLowerCase()}`}
        data-inherited={isPressed && !isMixed && !isExplicit ? "" : undefined}
        className={cn(isMixed && "opacity-45")}
        onClick={handleClick}
      />
    );
  return (
    <PropertyRow {...shell}>
      <ButtonGroup
        aria-label={state.label}
        variant={"joined"}
        buttonVariant={"secondary"}
      >
        {renderDecorationButton(
          values.has("underline"),
          value,
          "Underline",
          "TextUnderline",
          (): Dynamic => callback("underline"),
          hasLiteralCompanion,
        )}
        {renderDecorationButton(
          values.has("line-through"),
          value,
          "Strikethrough",
          <span
            aria-hidden={true}
            style={{
              fontSize: 13,
              lineHeight: 1,
              textDecoration: "line-through",
            }}
          >
            {"S"}
          </span>,
          (): Dynamic => callback("line-through"),
          hasLiteralCompanion,
        )}
      </ButtonGroup>
    </PropertyRow>
  );
}
function PropertyCssSegmentsRow({
  state: state,
  onCommit: onCommit,
  shell: shell,
}: Dynamic): Dynamic {
  useUiLocale();
  let { text: value, isLiteral: isLiteral }: Dynamic = inspectorFieldDisplay(state);
  if (!isLiteral && value)
    return (
      <PropertyCssTextRow
        state={state}
        onCommit={onCommit}
        shell={shell}
      />
    );
  let specOptions: Dynamic = state.spec?.options ?? [],
    currentValue: Dynamic = value || "",
    fallbackValue: Dynamic = state.fallback ?? "",
    effectiveValue: Dynamic =
      currentValue ||
      (state.mixed
        ? ""
        : fallbackValue === "normal" || fallbackValue === "legacy"
          ? (state.spec?.defaultValue ?? "")
          : state.prop === "text-align" &&
              (fallbackValue === "start" || fallbackValue === "end")
            ? fallbackValue === "start"
              ? "left"
              : "right"
            : fallbackValue),
    fixedOptions: Dynamic = (
      {
        "justify-content": ["flex-start", "center", "flex-end"],
        "justify-items": ["start", "center", "end"],
        "align-items": ["flex-start", "center", "flex-end"],
        "flex-direction": ["row", "column"],
      } as Dynamic
    )[state.prop],
    segmentOptions: Dynamic = fixedOptions
      ? [
          ...fixedOptions,
          ...(state.prop === "align-items" &&
          (currentValue === "baseline" || (!currentValue && effectiveValue === "baseline"))
            ? ["baseline"]
            : []),
        ]
      : specOptions,
    allOptionsHaveIcons: Dynamic = segmentOptions.every(
      (option?: Dynamic): Dynamic =>
        alignmentOptionIcon(state.prop, option) != null ||
        option === "auto" ||
        PropertiesTransformRowRowColumnRowReverseConfig[option] !=
          null,
    );
  if (!allOptionsHaveIcons && specOptions.length > 4)
    return (
      <PropertyCssEnumRow
        state={{
          ...state,
          fallback: currentValue ? state.fallback : effectiveValue,
        }}
        onCommit={onCommit}
        shell={shell}
      />
    );
  let isVertical: Dynamic =
      (state.flexDirection ?? "row").startsWith("column") &&
      (state.prop === "justify-content" ||
        state.prop === "align-items" ||
        state.prop === "justify-items"),
    normalizedFallback: Dynamic = (state.fallback ?? "").trim().toLowerCase(),
    callback: Dynamic = (fallbackKeyword?: Dynamic): Dynamic =>
      fixedOptions
        ? fallbackKeyword === "" ||
          fallbackKeyword === "normal" ||
          fallbackKeyword === "stretch" ||
          fallbackKeyword === "start" ||
          fallbackKeyword === "self-start" ||
          fallbackKeyword === "left"
          ? segmentOptions[0]
          : fallbackKeyword === "end" || fallbackKeyword === "self-end" || fallbackKeyword === "right"
            ? segmentOptions[
                segmentOptions.length - 1 - (segmentOptions.includes("baseline") ? 1 : 0)
              ]
            : undefined
        : undefined,
    inheritedValue: Dynamic =
      fixedOptions && !segmentOptions.includes(effectiveValue) && !currentValue && !state.inheritedFrom
        ? (callback(normalizedFallback) ?? effectiveValue)
        : effectiveValue,
    isInherited: Dynamic = !currentValue && !state.mixed && segmentOptions.includes(inheritedValue),
    shouldSplitLayout: Dynamic = allOptionsHaveIcons && segmentOptions.length > 4,
    segments: Dynamic = (
      <PropertySegments
        label={state.label}
        options={segmentOptions.map(
          (option?: Dynamic): Dynamic => ({
            value: option,
            label: propertyOptionLabel(state.spec, option),
            tooltip: `${state.label}: ${propertyOptionLabel(state.spec, option)}`,
            icon: PropertiesTransformRowRowColumnRowReverseConfig[
              option
            ],
            glyph: alignmentOptionIcon(state.prop, option),
          }),
        )}
        value={currentValue || undefined}
        inherited={isInherited ? inheritedValue : undefined}
        inheritedHint={
          state.disabled ? "inherited" : "inherited \u2014 click to set"
        }
        mixed={state.mixed}
        disabled={state.disabled}
        vertical={isVertical}
        onChange={(nextValue?: Dynamic): Dynamic => onCommit(state.prop, nextValue)}
        data-testid={isInherited ? `dc-seg-inherited-${state.prop}` : undefined}
      />
    );
  return shouldSplitLayout ? (
    <div className={"contents"} data-testid={shell["data-testid"]}>
      <PropertyRow
        {...shell}
        description={undefined}
        data-testid={undefined}
        className={"min-h-0 pt-1"}
      />
      <PropertyRow
        title={shell.title}
        description={shell.description}
      >
        {segments}
      </PropertyRow>
    </div>
  ) : (
    <PropertyRow {...shell}>{segments}</PropertyRow>
  );
}
export {
  alignmentOptionIcon,
  PropertiesAlignmentRowCache,
  PropertiesAlignmentRowSansSerifMonoConfig,
  PropertyAlignmentRow,
  PropertyCssSegmentsRow,
};
export function installEditorPropertiesAlignmentRow(): () => void {
  return () => {
    PropertiesAlignmentRowSansSerifMonoConfig = {
      sans: "sans-serif",
      serif: "serif",
      mono: "monospace",
    };
    PropertiesAlignmentRowCache = new Map(
      [
        ...TypographyFontCatalogItems,
        ...TypographyFontCatalogWebFonts,
      ].map(
        (fontEntry?: Dynamic): Dynamic => [
          fontEntry.family.toLowerCase(),
          {
            family: fontEntry.family,
            generic: PropertiesAlignmentRowSansSerifMonoConfig[fontEntry.generic],
          },
        ],
      ),
    );
  };
}
