import { uiMessage } from '@minedesign/contracts/ui-messages';
import { useUiLocale } from '../../ui-locale.ts';
/** Restored application module; prepare first, initialize in original order. */
import {
  type Dynamic,
} from "../../runtime-types";
import { PropertyCssTextRow } from "./css-value-row";
import { inspectorFieldDisplay, emDashPlaceholder } from "./inherited-field";
import { PropertyRow } from "./row";
import { PropertySelect } from "./select";
import { fontVariantKey, fontVariantLabel, includeCurrentFontVariant, parseFontVariantKey, TypographyFontVariantsFlatMapValue } from "../typography/font-variants";

function PropertyFontWeightRow({
  state: state,
  onCommit: onCommit,
  onCommitMany: onCommitMany,
  onFacesOpen: onFacesOpen,
  shell: shell,
}: Dynamic): Dynamic {
  useUiLocale();
  let { text: value, isLiteral: isLiteral }: Dynamic = inspectorFieldDisplay(state),
    parseWeight: Dynamic = (weightText?: Dynamic): Dynamic =>
      weightText === "bold"
        ? 700
        : weightText === "normal"
          ? 400
          : /^\d+(\.\d+)?$/.test(weightText)
            ? Number(weightText)
            : undefined;
  if (value && (!isLiteral || parseWeight(value.trim()) === undefined))
    return (
      <PropertyCssTextRow
        state={state}
        onCommit={onCommit}
        shell={shell}
      />
    );
  let companionStyle: Dynamic = (state.companionValue ?? "").trim(),
    isItalic: Dynamic = /^(italic|oblique)/.test(
      companionStyle || (state.companionFallback ?? "").trim(),
    ),
    variant: Dynamic = {
      weight:
        parseWeight(value.trim()) ??
        parseWeight((state.fallback ?? "").trim()) ??
        400,
      italic: isItalic,
    },
    hasExplicitValue: Dynamic = value !== "" || companionStyle !== "",
    isMixed: Dynamic = state.mixed || state.companionMixed;
  return (
    <PropertyRow {...shell}>
      <PropertySelect
        aria-label={state.label}
        items={includeCurrentFontVariant(
          state.faces ?? TypographyFontVariantsFlatMapValue,
          variant,
        )}
        value={
          isMixed || !hasExplicitValue
            ? null
            : fontVariantKey(variant.weight, variant.italic)
        }
        placeholder={
          isMixed ? (uiMessage("inspector.fontWeightRow.mixed")) : (fontVariantLabel(variant.weight, variant.italic))
        }
        hint={emDashPlaceholder}
        title={
          !hasExplicitValue && !isMixed && !state.inheritedFrom ? (uiMessage("inspector.fontWeightRow.inheritedRightClickToKeep")) : (undefined)
        }
        disabled={state.disabled}
        onOpenChange={(isOpen?: Dynamic): Dynamic => isOpen && onFacesOpen?.()}
        onChange={(variantKey?: Dynamic): Dynamic => {
          let pickedVariant: Dynamic = parseFontVariantKey(variantKey);
          if (
            pickedVariant === undefined ||
            (hasExplicitValue &&
              !isMixed &&
              pickedVariant.weight === variant.weight &&
              pickedVariant.italic === variant.italic)
          )
            return;
          let fontStyleValue: Dynamic = pickedVariant.italic
              ? "italic"
              : isItalic
                ? "normal"
                : companionStyle || null,
            items: Dynamic = [
              {
                prop: state.prop,
                value: String(pickedVariant.weight),
              },
              {
                prop: "font-style",
                value: fontStyleValue,
              },
            ];
          if (onCommitMany) onCommitMany(items);
          else
            for (let commit of items as Dynamic)
              onCommit(commit.prop, commit.value);
        }}
      />
    </PropertyRow>
  );
}
export {
  PropertyFontWeightRow,
};
export function installEditorPropertiesFontWeightRow(): () => void {
  return () => {};
}
