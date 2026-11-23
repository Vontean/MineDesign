import { useUiLocale } from '../../ui-locale.ts';
import { uiMessage } from '@minedesign/contracts/ui-messages';
/** Restored application module; prepare first, initialize in original order. */
import {
  type Dynamic,
} from "../../runtime-types";
import { Switch } from "../../cds/components/switch";
import { classifyStyleValue } from "../css/values";
import { PropertyRow } from "./row";

var emDashPlaceholder: Dynamic;
var PropertiesInheritedFieldValue: Dynamic;
var PropertiesInheritedFieldMixed: Dynamic;
function PropertyToggleRow({
  shell: shell,
  label: label,
  on: on,
  disabled: isDisabled,
  onToggle: onToggle,
}: Dynamic): Dynamic {
  useUiLocale();
  return (
    <PropertyRow
      label={label}
      {...shell}
      onPress={isDisabled ? undefined : (): Dynamic => onToggle(!on)}
    >
      <span
        data-testid={`dc-bool-${label.toLowerCase()}`}
        className={"inline-flex"}
      >
        <Switch
          checked={on}
          onCheckedChange={onToggle}
          aria-label={label}
          disabled={isDisabled}
        />
      </span>
    </PropertyRow>
  );
}
function inspectorFieldDisplay(field?: Dynamic): Dynamic {
  if (field.mixed)
    return {
      text: "",
      get placeholder() { return uiMessage("inspector.inheritedField.mixed"); },
      isLiteral: false,
    };
  let fieldValue: Dynamic = field.value ?? "",
    valueKind: Dynamic = classifyStyleValue(fieldValue);
  return valueKind.kind === "unset"
    ? {
        text: "",
        placeholder: field.fallback || emDashPlaceholder,
        isLiteral: true,
      }
    : {
        text: fieldValue,
        placeholder: "",
        isLiteral: valueKind.kind === "literal",
      };
}
function isInheritedInspectorField(field?: Dynamic): Dynamic {
  return !!field.inheritedFrom && !field.mixed;
}
function inheritedFieldForEdit(field?: Dynamic): Dynamic {
  if (!field || !isInheritedInspectorField(field)) return field;
  let literalOrUndefined: Dynamic = (candidate?: Dynamic): Dynamic =>
    candidate != null &&
    candidate !== "" &&
    classifyStyleValue(candidate).kind === "literal"
      ? candidate
      : undefined;
  return {
    ...field,
    value: null,
    fallback: literalOrUndefined(field.value) ?? (field.fallback || field.value || ""),
    companionValue: null,
    companionFallback:
      literalOrUndefined(field.companionValue) ?? field.companionFallback,
  };
}
function inheritedFieldTooltip(field?: Dynamic): Dynamic {
  if (!isInheritedInspectorField(field)) return;
  let varSuffix: Dynamic = field.varSource ? ` (${field.varSource})` : "";
  return uiMessage("inspector.inheritedField.sourceEditToOverride", { source: String(field.inheritedFrom), variableSuffix: String(varSuffix) });
}
function inheritedFieldDescription(field?: Dynamic): Dynamic {
  if (isInheritedInspectorField(field))
    return uiMessage("inspector.inheritedField.inheritedFromEditToOverride", { source: String(field.inheritedFrom) });
}
function inheritedFieldsDisabledReason(...fields: Dynamic[]): Dynamic {
  let explicitReason: Dynamic = fields.find(
    (field?: Dynamic): Dynamic => field?.disabled && field.whyDisabled,
  )?.whyDisabled;
  if (explicitReason !== undefined) return explicitReason;
  let { names: inheritedNames, partly: isPartly }: Dynamic =
    summarizeInheritedFields(fields);
  return inheritedNames.length > 0
    ? `${isPartly ? uiMessage("inspector.inheritedField.partlyFrom") : "From"} ${inheritedNames.join(", ")} \u2014 edit to override it here`
    : undefined;
}
function inheritedFieldsDescription(...fields: Dynamic[]): Dynamic {
  let { names: inheritedNames, partly: isPartly }: Dynamic =
    summarizeInheritedFields(fields);
  return inheritedNames.length > 0
    ? `${isPartly ? uiMessage("inspector.inheritedField.partlyInherited") : "Inherited"} from ${inheritedNames.join(", ")} \u2014 edit to override`
    : undefined;
}
function summarizeInheritedFields(fields?: Dynamic): Dynamic {
  let items: Dynamic = [
      ...new Set(
        fields
          .map(
            (field?: Dynamic): Dynamic =>
              field && !field.mixed ? field.inheritedFrom : undefined,
          )
          .filter((source?: Dynamic): Dynamic => !!source)
          .flatMap((sources?: Dynamic): Dynamic => sources.split(", ")),
      ),
    ],
    hasOwnValue: Dynamic = fields.some(
      (field?: Dynamic): Dynamic =>
        field &&
        !field.mixed &&
        !field.inheritedFrom &&
        field.value != null &&
        field.value !== "",
    );
  return {
    names: items,
    partly: hasOwnValue,
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
  emDashPlaceholder,
};
export function installEditorPropertiesInheritedField(): () => void {
  return () => {
    emDashPlaceholder = "\u2014";
    PropertiesInheritedFieldValue = (field?: Dynamic): Dynamic =>
      !!field && ((field.value != null && field.value !== "") || !!field.mixed);
    PropertiesInheritedFieldMixed = (field?: Dynamic): Dynamic =>
      PropertiesInheritedFieldValue(field) &&
      !(field.mixed && field.inheritedFrom);
  };
}
