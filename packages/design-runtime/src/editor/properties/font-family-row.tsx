import { uiMessage } from '@minedesign/contracts/ui-messages';
import { useUiLocale } from '../../ui-locale.ts';
/** Restored application module; prepare first, initialize in original order. */
import {
  type Dynamic,
} from "../../runtime-types";
import { normalizeFontFamilyList } from "../css/values";
import { PropertiesAlignmentRowCache } from "./alignment-row";
import { PropertyCssTextRow } from "./css-value-row";
import { inspectorFieldDisplay } from "./inherited-field";
import { PropertyRow } from "./row";
import { PropertySelect } from "./select";
import { ensureWebFonts, TypographyFontCatalogMapValue, TypographyFontCatalogSerifSansSerifPattern } from "../typography/font-catalog";
import { displayFontFamily } from "../typography/font-family";

var PropertiesFontFamilyRowTest: Dynamic;
function normalizedFontFamilyOption(familyName?: Dynamic): Dynamic {
  let entry: Dynamic = PropertiesAlignmentRowCache.get(
    familyName.toLowerCase(),
  );
  return entry ? entry.family + ", " + entry.generic : familyName;
}
function fontFamilyPickerOptions(pageFontFamilies?: Dynamic): Dynamic {
  let seenFamilies: Dynamic = new Set(),
    catalogFamilies: Dynamic = [...PropertiesAlignmentRowCache.values()]
      .map((entry?: Dynamic): Dynamic => entry.family)
      .sort();
  return [
    ...pageFontFamilies.map(
      (family?: Dynamic): Dynamic =>
        PropertiesAlignmentRowCache.get(family.toLowerCase())
          ?.family ?? family,
    ),
    ...catalogFamilies,
  ].flatMap(
    (family?: Dynamic): Dynamic =>
      seenFamilies.has(family.toLowerCase())
        ? []
        : (seenFamilies.add(family.toLowerCase()),
          [
            {
              value: family,
              label: family,
              labelStyle: PropertiesFontFamilyRowTest(family),
            },
          ]),
  );
}
function PropertyFontFamilyRow({
  state: state,
  onCommit: onCommit,
  pageFonts = [],
  pageWebfonts = [],
  shell: shell,
}: Dynamic): Dynamic {
  useUiLocale();
  let display: Dynamic = inspectorFieldDisplay(state);
  if (!display.isLiteral && display.text)
    return (
      <PropertyCssTextRow
        state={state}
        onCommit={onCommit}
        shell={shell}
      />
    );
  let normalizedFamily: Dynamic = normalizeFontFamilyList(display.text),
    placeholderFamily: Dynamic = displayFontFamily(display.placeholder),
    pickerOptions: Dynamic = fontFamilyPickerOptions(pageFonts),
    displayedFamily: Dynamic = displayFontFamily(normalizedFamily),
    matchedOption: Dynamic =
      normalizedFamily === ""
        ? undefined
        : pickerOptions.find(
            (option?: Dynamic): Dynamic =>
              option.value.toLowerCase() === displayedFamily.toLowerCase(),
          ),
    selectItems: Dynamic =
      normalizedFamily !== "" && !matchedOption
        ? [
            {
              value: normalizedFamily,
              label: displayedFamily,
              labelStyle: {
                fontFamily: display.text,
              },
            },
            ...pickerOptions,
          ]
        : pickerOptions,
    selectedValue: Dynamic = normalizedFamily === "" ? null : (matchedOption?.value ?? normalizedFamily);
  return (
    <PropertyRow {...shell}>
      <PropertySelect
        aria-label={state.label}
        items={selectItems}
        value={state.mixed ? null : selectedValue}
        placeholder={state.mixed ? (uiMessage("inspector.fontFamilyRow.mixed")) : (placeholderFamily || ("\u2014"))}
        title={
          selectedValue === null && !state.mixed && !state.inheritedFrom ? (uiMessage("inspector.fontFamilyRow.inheritedRightClickToKeep")) : (undefined)
        }
        disabled={state.disabled}
        searchable={true}
        searchLabel={"Search fonts"}
        onOpenChange={(isOpen?: Dynamic): Dynamic => {
          isOpen &&
            ensureWebFonts([
              ...TypographyFontCatalogMapValue,
              ...pageWebfonts,
            ]);
        }}
        onChange={(nextFamily?: Dynamic): Dynamic => {
          nextFamily !== selectedValue &&
            onCommit(
              state.prop,
              nextFamily === normalizedFamily ? nextFamily : normalizedFontFamilyOption(nextFamily),
            );
        }}
      />
    </PropertyRow>
  );
}
export {
  fontFamilyPickerOptions,
  normalizedFontFamilyOption,
  PropertiesFontFamilyRowTest,
  PropertyFontFamilyRow,
};
export function installEditorPropertiesFontFamilyRow(): () => void {
  return () => {
    PropertiesFontFamilyRowTest = (familyName?: Dynamic): Dynamic =>
      TypographyFontCatalogSerifSansSerifPattern.test(familyName)
        ? {
            fontFamily: familyName,
          }
        : /^[\w .-]+$/.test(familyName)
          ? {
              fontFamily: `'${familyName}', sans-serif`,
            }
          : undefined;
  };
}
