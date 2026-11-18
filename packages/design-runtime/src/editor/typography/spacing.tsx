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
var PropertiesInheritedFieldMixedAlias_3: Dynamic;
function PropertyTextSpacing({
  lh: lh,
  ls: ls,
  renderRows: renderRows,
  onCommitMany: onCommitMany,
}: Dynamic): Dynamic {
  useUiLocale();
  let value: Dynamic = useStyleCommitScrub(
      (input?: Dynamic): Dynamic => onCommitMany(input),
    ),
    value2: Dynamic = inheritedFieldsDisabledReason(lh, ls),
    value3: Dynamic = inheritedFieldsDescription(lh, ls),
    value4: Dynamic = inheritedFieldForEdit(lh),
    value5: Dynamic = inheritedFieldForEdit(ls),
    callback: Dynamic = (input?: Dynamic): Dynamic => {
      let value9: Dynamic = (input.mixed ? "" : (input.value ?? "")).trim();
      return {
        v: value9,
        n: parseCssNumber(value9),
        fb: parseCssNumber(input.fallback ?? ""),
      };
    },
    value6: Dynamic = callback(value4),
    value7: Dynamic = callback(value5),
    callback2: Dynamic = (input?: Dynamic, options?: Dynamic): Dynamic =>
      options.mixed || !input.v || input.n != null;
  if (!callback2(value6, value4) || !callback2(value7, value5))
    return (
      <jsxTypographySpacing.Fragment>
        {renderRows([lh, ls])}
      </jsxTypographySpacing.Fragment>
    );
  let callback3: Dynamic = (input?: Dynamic, options?: Dynamic): Dynamic =>
      input.n
        ? input.n.unit || options
        : options === ""
          ? ""
          : input.fb?.unit || options,
    callback4: Dynamic = (
      input?: Dynamic,
      options?: Dynamic,
      context?: Dynamic,
    ): Dynamic =>
      input.fb
        ? formatCssNumber(
            roundCssNumber(input.fb.value, input.fb.unit),
            input.fb.unit === callback3(input, options) ? "" : input.fb.unit,
          )
        : context.fallback || "",
    callback5: Dynamic = (
      input?: Dynamic,
      options?: Dynamic,
      context?: Dynamic,
    ): Dynamic =>
      context.mixed
        ? null
        : input.fb && input.fb.unit === callback3(input, options)
          ? input.fb.value
          : (context.spec?.scrubFrom ?? (options === "" ? 1.2 : 0)),
    callback6: Dynamic = (
      input?: Dynamic,
      options?: Dynamic,
      context?: Dynamic,
    ): Dynamic => {
      let value9: Dynamic = callback3(options, context);
      return value9 === (input.spec?.unit ?? context)
        ? (input.spec?.step ?? 1)
        : /^(em|rem|ch|ex|lh|rlh)$/.test(value9)
          ? 0.1
          : 1;
    },
    callback7: Dynamic = (
      input?: Dynamic,
      options?: Dynamic,
      context?: Dynamic,
      value9?: Dynamic,
      extra?: Dynamic,
    ): Dynamic => (
      <NumericInput
        aria-label={value9}
        title={value9}
        prefix={context}
        value={options.n ? options.n.value : undefined}
        min={input.spec?.min}
        max={input.spec?.max}
        emptyStepFrom={callback5(options, extra, input)}
        placeholder={
          input.mixed ? (undefined) : (callback4(options, extra, input))
        }
        mixed={input.mixed}
        step={callback6(input, options, extra)}
        smallStep={callback6(input, options, extra)}
        clearable={true}
        refuseLetters={true}
        ownUnit={callback3(options, extra)}
        unit={
          (options.n || options.fb) && callback3(options, extra)
            ? callback3(options, extra)
            : undefined
        }
        unitScrubs={false}
        steppers={false}
        disabled={input.disabled}
        onValue={(input2?: Dynamic): Dynamic =>
          onCommitMany([
            {
              prop: input.prop,
              value:
                input2 === undefined
                  ? null
                  : formatCssNumber(
                      input2,
                      callback3(options, extra),
                    ),
            },
          ])
        }
        onScrub={(input2?: Dynamic): Dynamic =>
          value.onScrub([
            {
              prop: input.prop,
              value: formatCssNumber(
                input2,
                callback3(options, extra),
              ),
            },
          ])
        }
        onScrubEnd={value.onScrubEnd}
      />
    ),
    value8: Dynamic =
      PropertiesInheritedFieldMixedAlias_3(value4) ||
      PropertiesInheritedFieldMixedAlias_3(value5);
  return (
    <PropertyRow
      label={uiMessage("inspector.spacing.spacing")}
      data-testid={"dc-text-spacing"}
      disabled={value4.disabled || value5.disabled}
      title={
        uiMessage("inspector.spacing.lineHeightLetterSpacing", { value1: String(value2 ? (" \u2014 " + value2) : ("")) })
      }
      description={value3}
      onReset={
        value8
          ? (): Dynamic =>
              onCommitMany([
                {
                  prop: value4.prop,
                  value: null,
                },
                {
                  prop: value5.prop,
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
        {callback7(
          value4,
          value6,
          <PropertyOptionIcon icon={LineHeightValue} />,
          uiMessage("inspector.spacing.lineHeight"),
          "",
        )}
        {callback7(
          value5,
          value7,
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
  PropertiesInheritedFieldMixedAlias_3,
  PropertyTextSpacing,
};
export function installEditorTypographySpacing(): () => void {
  return () => {
    jsxTypographySpacing = toModuleNamespace(
      load_react_jsx_runtime(),
      1,
    );
    PropertiesInheritedFieldMixedAlias_3 =
      PropertiesInheritedFieldMixed;
  };
}
