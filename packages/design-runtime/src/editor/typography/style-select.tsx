import { useUiLocale } from '../../ui-locale.ts';
import { uiMessage } from '@minedesign/contracts/ui-messages';
/** Restored application module; prepare first, initialize in original order. */
import {
  type Dynamic,
} from "../../runtime-types";
import { Button } from "../../cds/button/button";
import { PropertySelectRow } from "../properties/rows";
import { PropertySegmentsRow } from "../properties/segments";
import { SessionStripTextItems } from "../session-strip/text";

function TypographyStyleSelect({
  model: model,
  attached: attached,
  disabled: disabled2,
  onApply: onApply,
  onDetach: onDetach,
}: Dynamic): Dynamic {
  useUiLocale();
  let value: Dynamic = model.options.map(
    (input?: Dynamic): Dynamic => ({
      value: input.value,
      label: input.text,
      hint: input.hint,
      labelStyle: input.labelStyle,
      ...(input.group !== undefined
        ? {
            group: input.group,
          }
        : {}),
      ...(input.subgroup !== undefined
        ? {
            subgroup: input.subgroup,
          }
        : {}),
      ...(input.title !== undefined
        ? {
            title: input.title,
          }
        : {}),
    }),
  );
  return (
    <PropertySelectRow
      label={uiMessage("inspector.styleSelect.textStyle")}
      icon={attached ? "TextAa" : undefined}
      options={value}
      value={attached ? (model.value ?? "") : ""}
      placeholder={model.mixed ? (uiMessage("inspector.styleSelect.mixed")) : (attached ? ("") : (uiMessage("inspector.styleSelect.custom")))}
      title={
        value.length === 0 ? (uiMessage("inspector.styleSelect.noTypeStylesInThis")) : (!attached && !model.mixed && model.matchedName !== null ? (uiMessage("inspector.styleSelect.customMatches", { value1: String(model.matchedName) })) : (undefined))
      }
      searchable={true}
      searchLabel={"Search styles"}
      disabled={disabled2 || value.length === 0}
      trailing={
        attached ? (
          <Button
            variant={"ghost"}
            iconOnly={true}
            icon={"Minus"}
            aria-label={uiMessage("inspector.styleSelect.detachFromTheTextStyle")}
            tooltip={
              uiMessage("inspector.styleSelect.detachEditFontWeightSizeLineHeightAndLetterSpacingOnThisText")
            }
            data-testid={"dc-text-detach"}
            disabled={disabled2}
            onClick={onDetach}
          />
        ) : undefined
      }
      onChange={(input?: Dynamic): Dynamic => onApply(model.editsFor(input))}
    />
  );
}
function TypographyVariantSelect({
  value: value,
  mixed: mixed,
  disabled: disabled2,
  disabledReason: disabledReason,
  onChange: onChange,
  onReset: onReset,
}: Dynamic): Dynamic {
  useUiLocale();
  return (
    <div
      className={"contents"}
      onMouseDown={(event?: Dynamic): Dynamic => event.preventDefault()}
    >
      <PropertySegmentsRow
        label={uiMessage("inspector.styleSelect.list")}
        data-testid={"dc-text-list"}
        options={SessionStripTextItems}
        value={value}
        mixed={mixed}
        disabled={disabled2 || disabledReason != null}
        title={disabledReason ?? (undefined)}
        onReset={onReset}
        onChange={onChange}
      />
    </div>
  );
}
export {
  TypographyStyleSelect,
  TypographyVariantSelect,
};
export function installEditorTypographyStyleSelect(): () => void {
  return () => {};
}
