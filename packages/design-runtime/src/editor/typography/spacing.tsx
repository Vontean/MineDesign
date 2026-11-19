import { useUiLocale } from '../../ui-locale.ts';
import { uiMessage } from '@minedesign/contracts/ui-messages';
/** Restored application module; prepare first, initialize in original order. */
import {
  type Dynamic,
} from "../../runtime-types";
import { load_react_jsx_runtime } from "../../dependencies";
import { formatCssNumber, parseCssNumber, roundCssNumber } from "../css/values";
import { inheritedFieldForEdit, inheritedFieldsDescription, inheritedFieldsDisabledReason, PropertiesInheritedFieldMixed } from "../properties/inherited-field";
import { useStyleCommitScrub } from "../properties/live-scrub";
import { NumericInput } from "../properties/numeric-input";
import { PropertyRow } from "../properties/row";
import { PropertyOptionIcon } from "../properties/tool-options";
import { LineHeightValue } from "../properties/tooltip";
import { toModuleNamespace } from "../../module-helpers";

var jsxTypographySpacing: Dynamic;
var INHERITED_SPACING_FIELD_MIXED: Dynamic;
function PropertyTextSpacing({
  lh: lh,
  ls: ls,
  renderRows: renderRows,
  onCommitMany: onCommitMany,
}: Dynamic): Dynamic {
  useUiLocale();
  let value: Dynamic = useStyleCommitScrub(
      (commitValues?: Dynamic): Dynamic => onCommitMany(commitValues),
    ),
    disabledReason: Dynamic = inheritedFieldsDisabledReason(lh, ls),
    description: Dynamic = inheritedFieldsDescription(lh, ls),
    lineHeightField: Dynamic = inheritedFieldForEdit(lh),
    letterSpacingField: Dynamic = inheritedFieldForEdit(ls),
    callback: Dynamic = (field?: Dynamic): Dynamic => {
      let trimmedValue: Dynamic = (field.mixed ? "" : (field.value ?? "")).trim();
      return {
        v: trimmedValue,
        n: parseCssNumber(trimmedValue),
        fb: parseCssNumber(field.fallback ?? ""),
      };
    },
    lineHeightValue: Dynamic = callback(lineHeightField),
    letterSpacingValue: Dynamic = callback(letterSpacingField),
    isValidParsedValue: Dynamic = (parsedValue?: Dynamic, field?: Dynamic): Dynamic =>
      field.mixed || !parsedValue.v || parsedValue.n != null;
  if (!isValidParsedValue(lineHeightValue, lineHeightField) || !isValidParsedValue(letterSpacingValue, letterSpacingField))
    return (
      <jsxTypographySpacing.Fragment>
        {renderRows([lh, ls])}
      </jsxTypographySpacing.Fragment>
    );
  let resolveUnit: Dynamic = (parsedValue?: Dynamic, fallbackUnit?: Dynamic): Dynamic =>
      parsedValue.n
        ? parsedValue.n.unit || fallbackUnit
        : fallbackUnit === ""
          ? ""
          : parsedValue.fb?.unit || fallbackUnit,
    formatFallbackValue: Dynamic = (
      property?: Dynamic,
      unit?: Dynamic,
      field?: Dynamic,
    ): Dynamic =>
      property.fb
        ? formatCssNumber(
            roundCssNumber(property.fb.value, property.fb.unit),
            property.fb.unit === resolveUnit(property, unit) ? "" : property.fb.unit,
          )
        : field.fallback || "",
    getEmptyStep: Dynamic = (
      property?: Dynamic,
      unit?: Dynamic,
      field?: Dynamic,
    ): Dynamic =>
      field.mixed
        ? null
        : property.fb && property.fb.unit === resolveUnit(property, unit)
          ? property.fb.value
          : (field.spec?.scrubFrom ?? (unit === "" ? 1.2 : 0)),
    getStepSize: Dynamic = (
      property?: Dynamic,
      parsedValue?: Dynamic,
      unit?: Dynamic,
    ): Dynamic => {
      let resolvedUnit: Dynamic = resolveUnit(parsedValue, unit);
      return resolvedUnit === (property.spec?.unit ?? unit)
        ? (property.spec?.step ?? 1)
        : /^(em|rem|ch|ex|lh|rlh)$/.test(resolvedUnit)
          ? 0.1
          : 1;
    },
    renderNumericField: Dynamic = (
      property?: Dynamic,
      parsedValue?: Dynamic,
      prefixIcon?: Dynamic,
      ariaLabel?: Dynamic,
      unit?: Dynamic,
    ): Dynamic => (
      <NumericInput
        aria-label={ariaLabel}
        title={ariaLabel}
        prefix={prefixIcon}
        value={parsedValue.n ? parsedValue.n.value : undefined}
        min={property.spec?.min}
        max={property.spec?.max}
        emptyStepFrom={getEmptyStep(parsedValue, unit, property)}
        placeholder={
          property.mixed ? (undefined) : (formatFallbackValue(parsedValue, unit, property))
        }
        mixed={property.mixed}
        step={getStepSize(property, parsedValue, unit)}
        smallStep={getStepSize(property, parsedValue, unit)}
        clearable={true}
        refuseLetters={true}
        ownUnit={resolveUnit(parsedValue, unit)}
        unit={
          (parsedValue.n || parsedValue.fb) && resolveUnit(parsedValue, unit)
            ? resolveUnit(parsedValue, unit)
            : undefined
        }
        unitScrubs={false}
        steppers={false}
        disabled={property.disabled}
        onValue={(nextValue?: Dynamic): Dynamic =>
          onCommitMany([
            {
              prop: property.prop,
              value:
                nextValue === undefined
                  ? null
                  : formatCssNumber(
                      nextValue,
                      resolveUnit(parsedValue, unit),
                    ),
            },
          ])
        }
        onScrub={(scrubbedValue?: Dynamic): Dynamic =>
          value.onScrub([
            {
              prop: property.prop,
              value: formatCssNumber(
                scrubbedValue,
                resolveUnit(parsedValue, unit),
              ),
            },
          ])
        }
        onScrubEnd={value.onScrubEnd}
      />
    ),
    hasMixedValue: Dynamic =
      INHERITED_SPACING_FIELD_MIXED(lineHeightField) ||
      INHERITED_SPACING_FIELD_MIXED(letterSpacingField);
  return (
    <PropertyRow
      label={uiMessage("inspector.spacing.spacing")}
      data-testid={"dc-text-spacing"}
      disabled={lineHeightField.disabled || letterSpacingField.disabled}
      title={
        uiMessage("inspector.spacing.lineHeightLetterSpacing", { value1: String(disabledReason ? (" \u2014 " + disabledReason) : ("")) })
      }
      description={description}
      onReset={
        hasMixedValue
          ? (): Dynamic =>
              onCommitMany([
                {
                  prop: lineHeightField.prop,
                  value: null,
                },
                {
                  prop: letterSpacingField.prop,
                  value: null,
                },
              ])
          : undefined
      }
      onPress={(element?: Dynamic): Dynamic =>
        element.querySelector("input")?.focus()
      }
    >
      <div className={"grid min-w-0 flex-1 grid-cols-2 gap-2"}>
        {renderNumericField(
          lineHeightField,
          lineHeightValue,
          <PropertyOptionIcon icon={LineHeightValue} />,
          uiMessage("inspector.spacing.lineHeight"),
          "",
        )}
        {renderNumericField(
          letterSpacingField,
          letterSpacingValue,
          <PropertyOptionIcon icon={"LetterSpacing"} />,
          uiMessage("inspector.spacing.letterSpacing"),
          "px",
        )}
      </div>
    </PropertyRow>
  );
}
export {
  jsxTypographySpacing,
  INHERITED_SPACING_FIELD_MIXED as PropertiesInheritedFieldMixedAlias_3,
  PropertyTextSpacing,
};
export function installEditorTypographySpacing(): () => void {
  return () => {
    jsxTypographySpacing = toModuleNamespace(
      load_react_jsx_runtime(),
      1,
    );
    INHERITED_SPACING_FIELD_MIXED =
      PropertiesInheritedFieldMixed;
  };
}
