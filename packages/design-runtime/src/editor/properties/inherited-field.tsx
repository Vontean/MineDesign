import { useUiLocale } from '../../ui-locale.ts';
import { uiMessage } from '@minedesign/contracts/ui-messages';
/** Restored application module; prepare first, initialize in original order. */
import {
  type Dynamic,
} from "../../runtime-types";
import { Switch } from "../../cds/components/switch";
import { classifyStyleValue } from "../css/values";
import { PropertyRow } from "./row";

var Value_6: Dynamic;
var PropertiesInheritedFieldValue: Dynamic;
var PropertiesInheritedFieldMixed: Dynamic;
function PropertyToggleRow({
  shell: shell,
  label: label,
  on: on,
  disabled: disabled2,
  onToggle: onToggle,
}: Dynamic): Dynamic {
  useUiLocale();
  return (
    <PropertyRow
      label={label}
      {...shell}
      onPress={disabled2 ? undefined : (): Dynamic => onToggle(!on)}
    >
      <span
        data-testid={`dc-bool-${label.toLowerCase()}`}
        className={"inline-flex"}
      >
        <Switch
          checked={on}
          onCheckedChange={onToggle}
          aria-label={label}
          disabled={disabled2}
        />
      </span>
    </PropertyRow>
  );
}
function inspectorFieldDisplay(input?: Dynamic): Dynamic {
  if (input.mixed)
    return {
      text: "",
      get placeholder() { return uiMessage("inspector.inheritedField.mixed"); },
      isLiteral: false,
    };
  let value: Dynamic = input.value ?? "",
    value2: Dynamic = (0, classifyStyleValue)(value);
  return value2.kind === "unset"
    ? {
        text: "",
        placeholder: input.fallback || Value_6,
        isLiteral: true,
      }
    : {
        text: value,
        placeholder: "",
        isLiteral: value2.kind === "literal",
      };
}
function isInheritedInspectorField(input?: Dynamic): Dynamic {
  return !!input.inheritedFrom && !input.mixed;
}
function inheritedFieldForEdit(input?: Dynamic): Dynamic {
  if (!input || !isInheritedInspectorField(input)) return input;
  let callback: Dynamic = (input2?: Dynamic): Dynamic =>
    input2 != null &&
    input2 !== "" &&
    (0, classifyStyleValue)(input2).kind === "literal"
      ? input2
      : undefined;
  return {
    ...input,
    value: null,
    fallback: callback(input.value) ?? (input.fallback || input.value || ""),
    companionValue: null,
    companionFallback:
      callback(input.companionValue) ?? input.companionFallback,
  };
}
function inheritedFieldTooltip(input?: Dynamic): Dynamic {
  if (!isInheritedInspectorField(input)) return;
  let value: Dynamic = input.varSource ? ` (${input.varSource})` : "";
  return uiMessage("inspector.inheritedField.fromValue1Value2EditTo", { value1: String(input.inheritedFrom), value2: String(value) });
}
function inheritedFieldDescription(input?: Dynamic): Dynamic {
  if (isInheritedInspectorField(input))
    return uiMessage("inspector.inheritedField.inheritedFromValue1EditTo", { value1: String(input.inheritedFrom) });
}
function inheritedFieldsDisabledReason(...input: Dynamic[]): Dynamic {
  let value: Dynamic = input.find(
    (input2?: Dynamic): Dynamic => input2?.disabled && input2.whyDisabled,
  )?.whyDisabled;
  if (value !== undefined) return value;
  let { names: value2, partly: value3 }: Dynamic =
    summarizeInheritedFields(input);
  return value2.length > 0
    ? `${value3 ? uiMessage("inspector.inheritedField.partlyFrom") : "From"} ${value2.join(", ")} \u2014 edit to override it here`
    : undefined;
}
function inheritedFieldsDescription(...input: Dynamic[]): Dynamic {
  let { names: value, partly: value2 }: Dynamic =
    summarizeInheritedFields(input);
  return value.length > 0
    ? `${value2 ? uiMessage("inspector.inheritedField.partlyInherited") : "Inherited"} from ${value.join(", ")} \u2014 edit to override`
    : undefined;
}
function summarizeInheritedFields(input?: Dynamic): Dynamic {
  let items: Dynamic = [
      ...new Set(
        input
          .map(
            (input2?: Dynamic): Dynamic =>
              input2 && !input2.mixed ? input2.inheritedFrom : undefined,
          )
          .filter((input2?: Dynamic): Dynamic => !!input2)
          .flatMap((input2?: Dynamic): Dynamic => input2.split(", ")),
      ),
    ],
    value: Dynamic = input.some(
      (input2?: Dynamic): Dynamic =>
        input2 &&
        !input2.mixed &&
        !input2.inheritedFrom &&
        input2.value != null &&
        input2.value !== "",
    );
  return {
    names: items,
    partly: value,
  };
}
export {
  inheritedFieldDescription,
  inheritedFieldForEdit,
  inheritedFieldsDescription,
  inheritedFieldsDisabledReason,
  inheritedFieldTooltip,
  inspectorFieldDisplay,
  isInheritedInspectorField,
  PropertiesInheritedFieldMixed,
  PropertiesInheritedFieldValue,
  PropertyToggleRow,
  summarizeInheritedFields,
  Value_6,
};
export function installEditorPropertiesInheritedField(): () => void {
  return () => {
    Value_6 = "\u2014";
    PropertiesInheritedFieldValue = (input?: Dynamic): Dynamic =>
      !!input && ((input.value != null && input.value !== "") || !!input.mixed);
    PropertiesInheritedFieldMixed = (input?: Dynamic): Dynamic =>
      PropertiesInheritedFieldValue(input) &&
      !(input.mixed && input.inheritedFrom);
  };
}
