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
function normalizedFontFamilyOption(input?: Dynamic): Dynamic {
  let entry: Dynamic = PropertiesAlignmentRowCache.get(
    input.toLowerCase(),
  );
  return entry ? entry.family + ", " + entry.generic : input;
}
function fontFamilyPickerOptions(input?: Dynamic): Dynamic {
  let values: Dynamic = new Set(),
    value: Dynamic = [...PropertiesAlignmentRowCache.values()]
      .map((input2?: Dynamic): Dynamic => input2.family)
      .sort();
  return [
    ...input.map(
      (input2?: Dynamic): Dynamic =>
        PropertiesAlignmentRowCache.get(input2.toLowerCase())
          ?.family ?? input2,
    ),
    ...value,
  ].flatMap(
    (input2?: Dynamic): Dynamic =>
      values.has(input2.toLowerCase())
        ? []
        : (values.add(input2.toLowerCase()),
          [
            {
              value: input2,
              label: input2,
              labelStyle: PropertiesFontFamilyRowTest(input2),
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
  let value: Dynamic = (0, inspectorFieldDisplay)(state);
  if (!value.isLiteral && value.text)
    return (
      <PropertyCssTextRow
        state={state}
        onCommit={onCommit}
        shell={shell}
      />
    );
  let value2: Dynamic = (0, normalizeFontFamilyList)(value.text),
    value3: Dynamic = (0, displayFontFamily)(value.placeholder),
    value4: Dynamic = fontFamilyPickerOptions(pageFonts),
    value5: Dynamic = (0, displayFontFamily)(value2),
    value6: Dynamic =
      value2 === ""
        ? undefined
        : value4.find(
            (input?: Dynamic): Dynamic =>
              input.value.toLowerCase() === value5.toLowerCase(),
          ),
    value7: Dynamic =
      value2 !== "" && !value6
        ? [
            {
              value: value2,
              label: value5,
              labelStyle: {
                fontFamily: value.text,
              },
            },
            ...value4,
          ]
        : value4,
    value8: Dynamic = value2 === "" ? null : (value6?.value ?? value2);
  return (
    <PropertyRow {...shell}>
      <PropertySelect
        aria-label={state.label}
        items={value7}
        value={state.mixed ? null : value8}
        placeholder={state.mixed ? (uiMessage("inspector.fontFamilyRow.mixed")) : (value3 || ("\u2014"))}
        title={
          value8 === null && !state.mixed && !state.inheritedFrom ? (uiMessage("inspector.fontFamilyRow.inheritedRightClickToKeep")) : (undefined)
        }
        disabled={state.disabled}
        searchable={true}
        searchLabel={"Search fonts"}
        onOpenChange={(input?: Dynamic): Dynamic => {
          input &&
            (0, ensureWebFonts)([
              ...TypographyFontCatalogMapValue,
              ...pageWebfonts,
            ]);
        }}
        onChange={(input?: Dynamic): Dynamic => {
          input !== value8 &&
            onCommit(
              state.prop,
              input === value2 ? input : normalizedFontFamilyOption(input),
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
    PropertiesFontFamilyRowTest = (input?: Dynamic): Dynamic =>
      TypographyFontCatalogSerifSansSerifPattern.test(input)
        ? {
            fontFamily: input,
          }
        : /^[\w .-]+$/.test(input)
          ? {
              fontFamily: `'${input}', sans-serif`,
            }
          : undefined;
  };
}
