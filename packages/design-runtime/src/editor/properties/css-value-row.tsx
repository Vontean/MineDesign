import { uiCssLabel } from '@minedesign/contracts/ui-value';
import { uiMessage } from '@minedesign/contracts/ui-messages';
import { useUiLocale } from '../../ui-locale.ts';
/** Restored application module; prepare first, initialize in original order. */
import {
  type Dynamic,
} from "../../runtime-types";
import { normalizePropertyNumber } from "../inspector/property-schema";
import { PropertyTextInput } from "./css-number-row";
import { inspectorFieldDisplay, Value_6 } from "./inherited-field";
import { PropertyRow } from "./row";
import { PropertySelect } from "./select";

function PropertyCssTextRow({
  state: state,
  onCommit: onCommit,
  shell: shell,
}: Dynamic): Dynamic {
  useUiLocale();
  let { text: value, placeholder: placeholder }: Dynamic = inspectorFieldDisplay(state);
  return (
    <PropertyRow {...shell}>
      <PropertyTextInput
        display={value}
        placeholder={placeholder}
        hint={state.hint}
        aria-label={state.label}
        disabled={state.disabled}
        onCommitText={(text?: Dynamic): Dynamic =>
          onCommit(
            state.prop,
            text.trim()
              ? normalizePropertyNumber(state.prop, text.trim())
              : null,
          )
        }
      />
    </PropertyRow>
  );
}
function propertyOptionLabel(spec?: Dynamic, optionName?: Dynamic): Dynamic {
  let value: Dynamic = spec?.optionLabels?.[optionName];
  if (value) return uiCssLabel(optionName, value);
  let spacedName: Dynamic = optionName.replace(/-/g, " ");
  return uiCssLabel(optionName, spacedName.charAt(0).toUpperCase() + spacedName.slice(1));
}
function PropertyCssEnumRow({
  state: state,
  onCommit: onCommit,
  shell: shell,
}: Dynamic): Dynamic {
  useUiLocale();
  let { text: value, isLiteral: isLiteral }: Dynamic = inspectorFieldDisplay(state);
  if (!isLiteral && value)
    return (
      <PropertyCssTextRow state={state} onCommit={onCommit} shell={shell} />
    );
  let specOptions: Dynamic = state.spec?.options ?? [],
    currentValue: Dynamic = value || "",
    fallbackValue: Dynamic = (state.fallback ?? "").trim(),
    isInherited: Dynamic = currentValue === "" && !state.mixed,
    isCustomValue: Dynamic = currentValue !== "" && !specOptions.includes(currentValue),
    items: Dynamic = [...(isCustomValue ? [currentValue] : []), ...specOptions],
    toItemLabel: Dynamic = (optionValue?: Dynamic): Dynamic =>
      isCustomValue && optionValue === currentValue
        ? optionValue
        : propertyOptionLabel(state.spec, optionValue),
    fallbackLabel: Dynamic = specOptions.includes(fallbackValue)
      ? propertyOptionLabel(state.spec, fallbackValue)
      : fallbackValue;
  return (
    <PropertyRow {...shell}>
      <PropertySelect
        aria-label={state.label}
        items={items.map(
          (optionValue?: Dynamic): Dynamic => ({
            value: optionValue,
            label: toItemLabel(optionValue),
          }),
        )}
        value={state.mixed ? null : currentValue || null}
        placeholder={state.mixed ? (uiMessage("inspector.cssValueRow.mixed")) : (fallbackValue ? (fallbackLabel) : (undefined))}
        hint={Value_6}
        title={
          isInherited && !state.inheritedFrom ? (uiMessage("inspector.cssValueRow.inheritedRightClickToKeep")) : (undefined)
        }
        disabled={state.disabled}
        onChange={(nextValue?: Dynamic): Dynamic => {
          (nextValue || null) !== (currentValue || null) &&
            onCommit(state.prop, nextValue || null);
        }}
      />
    </PropertyRow>
  );
}
export {
  PropertyCssEnumRow,
  PropertyCssTextRow,
  propertyOptionLabel,
};
export function installEditorPropertiesCssValueRow(): () => void {
  return () => {};
}
