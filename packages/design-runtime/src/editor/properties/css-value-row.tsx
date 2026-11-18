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
  let { text: value, placeholder: value2 }: Dynamic = inspectorFieldDisplay(state);
  return (
    <PropertyRow {...shell}>
      <PropertyTextInput
        display={value}
        placeholder={value2}
        hint={state.hint}
        aria-label={state.label}
        disabled={state.disabled}
        onCommitText={(input?: Dynamic): Dynamic =>
          onCommit(
            state.prop,
            input.trim()
              ? normalizePropertyNumber(state.prop, input.trim())
              : null,
          )
        }
      />
    </PropertyRow>
  );
}
function propertyOptionLabel(input?: Dynamic, options?: Dynamic): Dynamic {
  let value: Dynamic = input?.optionLabels?.[options];
  if (value) return uiCssLabel(options, value);
  let value2: Dynamic = options.replace(/-/g, " ");
  return uiCssLabel(options, value2.charAt(0).toUpperCase() + value2.slice(1));
}
function PropertyCssEnumRow({
  state: state,
  onCommit: onCommit,
  shell: shell,
}: Dynamic): Dynamic {
  useUiLocale();
  let { text: value, isLiteral: value2 }: Dynamic = inspectorFieldDisplay(state);
  if (!value2 && value)
    return (
      <PropertyCssTextRow state={state} onCommit={onCommit} shell={shell} />
    );
  let value3: Dynamic = state.spec?.options ?? [],
    value4: Dynamic = value || "",
    value5: Dynamic = (state.fallback ?? "").trim(),
    value6: Dynamic = value4 === "" && !state.mixed,
    value7: Dynamic = value4 !== "" && !value3.includes(value4),
    items: Dynamic = [...(value7 ? [value4] : []), ...value3],
    callback: Dynamic = (input?: Dynamic): Dynamic =>
      value7 && input === value4
        ? input
        : propertyOptionLabel(state.spec, input),
    value8: Dynamic = value3.includes(value5)
      ? propertyOptionLabel(state.spec, value5)
      : value5;
  return (
    <PropertyRow {...shell}>
      <PropertySelect
        aria-label={state.label}
        items={items.map(
          (input?: Dynamic): Dynamic => ({
            value: input,
            label: callback(input),
          }),
        )}
        value={state.mixed ? null : value4 || null}
        placeholder={state.mixed ? (uiMessage("inspector.cssValueRow.mixed")) : (value5 ? (value8) : (undefined))}
        hint={Value_6}
        title={
          value6 && !state.inheritedFrom ? (uiMessage("inspector.cssValueRow.inheritedRightClickToKeep")) : (undefined)
        }
        disabled={state.disabled}
        onChange={(input?: Dynamic): Dynamic => {
          (input || null) !== (value4 || null) &&
            onCommit(state.prop, input || null);
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
