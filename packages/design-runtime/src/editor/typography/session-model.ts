import { uiMessage } from '@minedesign/contracts/ui-messages';
/** Restored application module; prepare first, initialize in original order. */
import {
  type Dynamic,
} from "../../runtime-types";
import { parseStyleDeclarations } from "../css/declarations";
import { InspectorComputedDataPattern, normalizeInspectorComputedData } from "../inspector/computed-data";
import { summarizeFontSizeUsage } from "./census";
import { displayFontFamily } from "./font-family";
import { authoredTypographyMetrics, matchedDesignSystemTextStyle, TypographyMetricsFontSize, TypographyMetricsHandler, typographyStyleEdits } from "./metrics";

function typographySessionModel(selection?: Dynamic): Dynamic {
  let {
      metrics: value,
      sizeMixed: sizeMixed,
      ownFamily: ownFamily,
      family: family,
      sizes: sizes,
      sizeNames: sizeNames,
      sizeFamilies: sizeFamilies,
      systemRows: systemRows,
      hasSystem: hasSystem,
      single: isSingle,
    }: Dynamic = selection,
    size: Dynamic = value.size,
    matchedStyle: Dynamic = sizeMixed
      ? undefined
      : matchedDesignSystemTextStyle(systemRows, value),
    availableSizes: Dynamic = hasSystem ? [] : sizes,
    fontStyle: Dynamic =
      size !== undefined && !sizeMixed && availableSizes.includes(size),
    sizeFamily: Dynamic = size !== undefined ? sizeFamilies.get(size) : undefined,
    matchedName: Dynamic =
      fontStyle &&
      (ownFamily === undefined ||
        (sizeFamily !== undefined &&
          displayFontFamily(ownFamily).toLowerCase() ===
            displayFontFamily(sizeFamily).toLowerCase()))
        ? (sizeNames.get(size) ?? null)
        : null,
    matchedId: Dynamic = matchedStyle?.id ?? (fontStyle ? String(size) : null),
    matchedStyleName: Dynamic = matchedStyle?.style.name ?? matchedName ?? null,
    chipText: Dynamic =
      matchedStyle?.style.name ??
      matchedName ??
      [
        displayFontFamily(family),
        sizeMixed ? "Mixed" : size === undefined ? "" : String(Math.round(size)),
      ]
        .filter(Boolean)
        .join(" \xB7 "),
    items: Dynamic = [
      ...availableSizes.map((sizeValue?: Dynamic): Dynamic => {
        let sizeLabel: Dynamic =
          sizeNames.get(sizeValue) ??
          (displayFontFamily(sizeFamilies.get(sizeValue) ?? family) ||
            String(sizeValue));
        return {
          value: String(sizeValue),
          text: sizeLabel,
          get hint() { return (String(sizeValue)) + ("px"); },
          labelStyle: {
            fontFamily: sizeFamilies.get(sizeValue) ?? (family || undefined),
            fontSize: Math.min(20, Math.max(13, sizeValue / 2.4)),
          },
        };
      }),
      ...systemRows.map(
        ({
          id: id,
          style: style,
          group: group,
          subgroup: subgroup,
          subtitle: subtitle,
        }: Dynamic): Dynamic => ({
          value: id,
          text: style.name,
          get hint() { return (String(TypographyMetricsFontSize(style))) + ("px"); },
          labelStyle: {
            fontFamily: style.family?.stack,
            fontWeight: TypographyMetricsHandler(
              style.fontWeight,
            ),
            fontStyle: style.italic ? "italic" : undefined,
            fontSize: Math.min(20, Math.max(13, style.fontSize / 2.4)),
          },
          get title() { return ((style.name) + (" \xB7 ")) + (subtitle); },
          ...(group !== undefined
            ? {
                group: group,
              }
            : {}),
          ...(subgroup !== undefined
            ? {
                subgroup: subgroup,
              }
            : {}),
        }),
      ),
    ];
  return {
    value: matchedId,
    chipText: chipText,
    matchedName: matchedStyleName,
    mixed: sizeMixed,
    options: items,
    editsFor: (fontSize?: Dynamic): Dynamic => {
      let systemRow: Dynamic = systemRows.find(
        (style?: Dynamic): Dynamic => style.id === fontSize,
      );
      if (systemRow !== undefined)
        return typographyStyleEdits(systemRow.style);
      let styleEdits: Dynamic =
        matchedStyle !== undefined && isSingle
          ? [
              "line-height",
              "letter-spacing",
              "font-weight",
              "font-style",
              ...(matchedStyle.style.family !== undefined ? ["font-family"] : []),
            ].map((sizeValue?: Dynamic): Dynamic => [sizeValue, undefined])
          : [];
      return [["font-size", fontSize + "px"], ...styleEdits];
    },
  };
}
function typographyCensusOptions(census?: Dynamic): Dynamic {
  let callback: Dynamic = (rawValue?: Dynamic): Dynamic => {
      let numericValue: Dynamic = parseFloat(rawValue);
      return Number.isFinite(numericValue) ? numericValue : undefined;
    },
    normalizeValue: Dynamic = (rawValue?: Dynamic): Dynamic =>
      /px$/.test(rawValue)
        ? callback(rawValue)
        : /pt$/.test(rawValue)
          ? Math.round(((callback(rawValue) ?? 0) * 4) / 3)
          : undefined,
    value: Dynamic = [
      ...new Set(
        [...census.sizes]
          .map(normalizeValue)
          .filter(
            (size?: Dynamic): Dynamic => size !== undefined && size > 0,
          ),
      ),
    ].sort(
      (size?: Dynamic, otherSize?: Dynamic): Dynamic => otherSize - size,
    ),
    entries: Dynamic = new Map();
  for (let [sizeKey, sizeUsage] of Object.entries(
    census.sizeRoles ?? {},
  ) as Dynamic) {
    let normalizedSize: Dynamic = normalizeValue(sizeKey);
    if (normalizedSize === undefined) continue;
    let familyCounts: Dynamic = entries.get(normalizedSize) ?? new Map();
    for (let [familyName, usageCount] of Object.entries(sizeUsage) as Dynamic)
      familyCounts.set(familyName, (familyCounts.get(familyName) ?? 0) + usageCount);
    entries.set(normalizedSize, familyCounts);
  }
  let sizeNames: Dynamic = summarizeFontSizeUsage(value, entries),
    sizeFamilies: Dynamic = new Map();
  for (let [familyKey, familyUsage] of Object.entries(
    census.sizeFamilies ?? {},
  ) as Dynamic) {
    let normalizedFamily: Dynamic = normalizeValue(familyKey);
    normalizedFamily !== undefined &&
      !sizeFamilies.has(normalizedFamily) &&
      InspectorComputedDataPattern.test(familyUsage) &&
      sizeFamilies.set(normalizedFamily, familyUsage);
  }
  return {
    sizes: value,
    sizeNames: sizeNames,
    sizeFamilies: sizeFamilies,
  };
}
function typographySelectionModel(selection?: Dynamic): Dynamic {
  let {
    items: value,
    census: census,
    systemRows: systemRows,
    hasSystem: hasSystem,
  }: Dynamic = selection;
  if (value.length === 0) return null;
  let {
    sizes: sizes,
    sizeNames: sizeNames,
    sizeFamilies: sizeFamilies,
  }: Dynamic = typographyCensusOptions(census);
  if (sizes.length === 0 && systemRows.length === 0) return null;
  let metrics: Dynamic = value.map(
      (element?: Dynamic): Dynamic =>
        authoredTypographyMetrics(
          element.tag,
          element.inlineStyle ?? "",
          element.computed,
        ),
    )[0],
    sizeMixed: Dynamic =
      value.length > 1 &&
      new Set(
        value.map((element?: Dynamic): Dynamic => element.inlineSize ?? null),
      ).size > 1,
    entries: Dynamic = new Map(
      parseStyleDeclarations(value[0].authoredStyle).map(
        (declaration?: Dynamic): Dynamic => [declaration.prop, declaration.value],
      ),
    ),
    computed: Dynamic = normalizeInspectorComputedData("text", {
      tag: value[0].tag,
      computed: value[0].computed,
    }),
    family: Dynamic = entries.get("font-family") ?? computed.fontFamily ?? "";
  return typographySessionModel({
    metrics: metrics,
    sizeMixed: sizeMixed,
    ownFamily: value[0].inlineFamily ?? undefined,
    family: InspectorComputedDataPattern.test(family) ? family : "",
    sizes: sizes,
    sizeNames: sizeNames,
    sizeFamilies: sizeFamilies,
    systemRows: systemRows,
    hasSystem: hasSystem,
    single: value.length <= 1,
  });
}
export {
  typographyCensusOptions,
  typographySelectionModel,
  typographySessionModel,
};
export function installEditorTypographySessionModel(): () => void {
  return () => {};
}
