import { uiMessage } from '@minedesign/contracts/ui-messages';
/** Restored application module; prepare first, initialize in original order. */
import {
  type Dynamic,
} from "../../runtime-types";
import { parseStyleDeclarations } from "../css/declarations";
import { getElementInspector } from "./element";
import { InspectorPropertySchemaBackgroundFontWeightFontStyleConfig, InspectorPropertySchemaCursorPointerEventsObjectFitValues } from "./property-schema";
import { InspectorStyleMetadataStrokeStrokeWidthFillValues, InspectorStyleMetadataSubscribers, InspectorStyleMetadataTextTspanTextpathSet, svgShapeTags } from "./style-metadata";
import { SvgArrowPropertiesLabel, allArrowsNeedThicknessMessage as mixedArrowheadReason } from "../svg/arrow-properties";

var InspectorSelectionSubscribers: Dynamic;
function orderInspectorSections(sections?: Dynamic): Dynamic {
  let sectionRank: Dynamic = {
      size: 0,
      sizing: 1,
      text: !sections.some(
        (section?: Dynamic): Dynamic =>
          ![
            "size",
            "sizing",
            "appearance",
            "text",
            "effects",
            "link",
          ].includes(section.id),
      )
        ? 2
        : 4,
      appearance: 3,
      effects: 5,
    },
    rankOf: Dynamic = (sectionId?: Dynamic): Dynamic => sectionRank[sectionId] ?? 2;
  sections.sort(
    (sectionA?: Dynamic, sectionB?: Dynamic): Dynamic =>
      rankOf(sectionA.id) - rankOf(sectionB.id),
  );
}
function resolveInspectorInheritedValues(
  sections?: Dynamic,
  advancedRows?: Dynamic,
  classSources?: Dynamic,
  authoredValues?: Dynamic,
): Dynamic {
  if (!classSources) return;
  let hasValue: Dynamic = (rawValue?: Dynamic): Dynamic =>
      rawValue != null && rawValue !== "",
    classSourceFor: Dynamic = (prop?: Dynamic): Dynamic =>
      Object.hasOwn(classSources, prop) ? classSources[prop] : undefined,
    resolveRowInheritance: Dynamic = (row?: Dynamic): Dynamic => {
      let ownInherited: Dynamic = hasValue(row.value)
        ? classSourceFor(row.prop)
        : undefined;
      if (hasValue(row.value) && !ownInherited) return;
      let companionProp: Dynamic = Object.hasOwn(
          InspectorPropertySchemaBackgroundFontWeightFontStyleConfig,
          row.prop,
        )
          ? InspectorPropertySchemaBackgroundFontWeightFontStyleConfig[
              row.prop
            ]
          : undefined,
        needsCompanion: Dynamic =
          !!companionProp &&
          (hasValue(row.companionValue) || hasValue(authoredValues.get(companionProp))),
        companionInherited: Dynamic = companionProp && needsCompanion ? classSourceFor(companionProp) : undefined;
      if (needsCompanion && !companionInherited) return;
      let inheritedFrom: Dynamic = ownInherited ?? companionInherited;
      inheritedFrom && (row.inheritedFrom = inheritedFrom);
    };
  for (let section of sections as Dynamic) section.rows.forEach(resolveRowInheritance);
  advancedRows.forEach(resolveRowInheritance);
}
function inspectSingleElement(element?: Dynamic): Dynamic {
  return getElementInspector(element);
}
function filterLayoutInspectorRows(inspector?: Dynamic): Dynamic {
  let isFilled: Dynamic = (row?: Dynamic): Dynamic =>
    (row.value != null && row.value !== "") || !!row.mixed;
  return {
    sections: inspector.sections.flatMap((section?: Dynamic): Dynamic => {
      let value: Dynamic = section.rows.filter(
        (row?: Dynamic): Dynamic =>
          InspectorSelectionSubscribers.has(row.prop) &&
          (section.id === "size" || section.id === "text" || isFilled(row)),
      );
      return value.length > 0
        ? [
            {
              ...section,
              rows: value,
            },
          ]
        : [];
    }),
    advanced: inspector.advanced.filter(
      (row?: Dynamic): Dynamic =>
        InspectorSelectionSubscribers.has(row.prop) && isFilled(row),
    ),
  };
}
function inspectElementSelection(elements?: Dynamic): Dynamic {
  if (elements.length === 0)
    return {
      sections: [],
      advanced: [],
    };
  if (elements.length === 1) return inspectSingleElement(elements[0]);
  let hasAuthoredProp: Dynamic = (element?: Dynamic, prop?: Dynamic): Dynamic =>
      svgShapeTags.has(element.tag) &&
      parseStyleDeclarations(element.authoredStyle).some(
        (declaration?: Dynamic): Dynamic => declaration.prop === prop,
      ),
    authoredPaintProps: Dynamic = new Set(
      InspectorStyleMetadataStrokeStrokeWidthFillValues.filter(
        (prop?: Dynamic): Dynamic =>
          elements.some((element?: Dynamic): Dynamic => hasAuthoredProp(element, prop)),
      ),
    ),
    perElementInspectors: Dynamic = elements.map(
      (element?: Dynamic): Dynamic =>
        getElementInspector(element, {
          forMulti: true,
          cssPaint: authoredPaintProps,
        }),
    ),
    mergeRows: Dynamic = (rowsPerElement?: Dynamic): Dynamic =>
      rowsPerElement[0]
        .map((baseRow?: Dynamic): Dynamic => {
          let matchingRows: Dynamic = rowsPerElement.map(
            (elementRows?: Dynamic): Dynamic =>
              elementRows.find(
                (candidate?: Dynamic): Dynamic => candidate.prop === baseRow.prop,
              ),
          );
          if (matchingRows.some((row?: Dynamic): Dynamic => row == null))
            return null;
          let values: Dynamic = matchingRows.map(
              (row?: Dynamic): Dynamic => row.value ?? "",
            ),
            companionValues: Dynamic = matchingRows.map(
              (row?: Dynamic): Dynamic => row.companionValue ?? "",
            ),
            valuesAgree: Dynamic = values.every(
              (item?: Dynamic): Dynamic => item === values[0],
            ),
            companionAgree: Dynamic = companionValues.every(
              (item?: Dynamic): Dynamic => item === companionValues[0],
            ),
            commitsAgree: Dynamic = matchingRows.every(
              (row?: Dynamic): Dynamic =>
                JSON.stringify(row.alsoCommit ?? null) ===
                  JSON.stringify(matchingRows[0].alsoCommit ?? null) &&
                JSON.stringify(row.alsoCommitOnClear ?? null) ===
                  JSON.stringify(matchingRows[0].alsoCommitOnClear ?? null),
            ),
            mergedRow: Dynamic = {
              ...baseRow,
              value: (valuesAgree && values[0]) || null,
              companionValue: (companionAgree && companionValues[0]) || null,
              mixed: !valuesAgree,
              companionMixed: !companionAgree,
            };
          if (
            !commitsAgree &&
            (delete mergedRow.alsoCommit,
            delete mergedRow.alsoCommitOnClear,
            mergedRow.prop === "@target")
          )
            return null;
          matchingRows.some((row?: Dynamic): Dynamic => row?.noHug) &&
            (mergedRow.noHug = true);
          if (mergedRow.textFill !== undefined) {
            let textFills: Dynamic = matchingRows.map(
              (textFill?: Dynamic): Dynamic => textFill.textFill,
            );
            if (
              textFills.some(
                (textFill?: Dynamic): Dynamic =>
                  textFill === undefined ||
                  textFill.clipped !== textFills[0].clipped ||
                  textFill.inlineClip !== textFills[0].inlineClip ||
                  textFill.transparentInk !== textFills[0].transparentInk,
              )
            )
              delete mergedRow.textFill;
            else if (
              textFills.some(
                (textFill?: Dynamic): Dynamic =>
                  (textFill.layer ?? "") !== (textFills[0].layer ?? ""),
              )
            ) {
              let { computedLayer: computedLayer, ...textFillWithoutComputed }: Dynamic =
                textFills[0];
              mergedRow.textFill = {
                ...textFillWithoutComputed,
                layer: null,
              };
            }
          }
          matchingRows.some(
            (row?: Dynamic): Dynamic =>
              row.whyDisabled !== mergedRow.whyDisabled,
          ) &&
            (mergedRow.whyDisabled !== undefined &&
              (mergedRow.disabled = matchingRows.some(
                (row?: Dynamic): Dynamic =>
                  row.disabled === true &&
                  row.whyDisabled === undefined,
              )),
            delete mergedRow.whyDisabled);
          matchingRows.some(
            (row?: Dynamic): Dynamic =>
              row.whyDisabled === SvgArrowPropertiesLabel,
          ) &&
            Object.assign(mergedRow, {
              disabled: true,
              whyDisabled: matchingRows.every(
                (row?: Dynamic): Dynamic =>
                  row.whyDisabled === SvgArrowPropertiesLabel,
              )
                ? SvgArrowPropertiesLabel
                : mixedArrowheadReason,
            });
          mergedRow.spec?.longTail &&
            matchingRows.some(
              (row?: Dynamic): Dynamic => !row.spec?.longTail,
            ) &&
            (mergedRow.spec = {
              ...mergedRow.spec,
              longTail: false,
            });
          let fallbacks: Dynamic = matchingRows.map(
            (fallback?: Dynamic): Dynamic => fallback.fallback ?? "",
          );
          fallbacks.every(
            (fallback?: Dynamic): Dynamic => fallback === fallbacks[0],
          ) || delete mergedRow.fallback;
          delete mergedRow.companionFallback;
          let varSources: Dynamic = matchingRows
            .map((row?: Dynamic): Dynamic => row.varSource)
            .filter((varSource?: Dynamic): Dynamic => !!varSource);
          valuesAgree && varSources.length > 0
            ? ((mergedRow.varSource = varSources[0]),
              varSources.length < matchingRows.length ||
              varSources.some(
                (varSource?: Dynamic): Dynamic => varSource !== varSources[0],
              )
                ? (mergedRow.varPartial = true)
                : delete mergedRow.varPartial)
            : (delete mergedRow.varSource, delete mergedRow.varPartial);
          let companionVarSources: Dynamic = matchingRows
            .map((row?: Dynamic): Dynamic => row.companionVarSource)
            .filter((varSource?: Dynamic): Dynamic => !!varSource);
          companionAgree && companionVarSources.length > 0
            ? ((mergedRow.companionVarSource = companionVarSources[0]),
              companionVarSources.length < matchingRows.length ||
              companionVarSources.some(
                (varSource?: Dynamic): Dynamic => varSource !== companionVarSources[0],
              )
                ? (mergedRow.companionVarPartial = true)
                : delete mergedRow.companionVarPartial)
            : (delete mergedRow.companionVarSource,
              delete mergedRow.companionVarPartial);
          let inheritedFroms: Dynamic = matchingRows.map(
            (row?: Dynamic): Dynamic => row.inheritedFrom,
          );
          companionAgree && inheritedFroms.every((inheritedFrom?: Dynamic): Dynamic => !!inheritedFrom)
            ? (mergedRow.inheritedFrom = [...new Set(inheritedFroms)].join(", "))
            : delete mergedRow.inheritedFrom;
          return mergedRow;
        })
        .filter((row?: Dynamic): Dynamic => row != null),
    mergedSections: Dynamic = [];
  for (let section of perElementInspectors[0].sections as Dynamic) {
    let sectionsAcrossElements: Dynamic = perElementInspectors.map(
      (inspector?: Dynamic): Dynamic =>
        inspector.sections.find(
          (candidate?: Dynamic): Dynamic => candidate.id === section.id,
        ),
    );
    if (sectionsAcrossElements.some((candidateSection?: Dynamic): Dynamic => candidateSection == null)) continue;
    let modes: Dynamic = new Set(
        sectionsAcrossElements.map((candidateSection?: Dynamic): Dynamic => candidateSection.mode),
      ),
      mergedRows: Dynamic = mergeRows(
        sectionsAcrossElements.map((candidateSection?: Dynamic): Dynamic => candidateSection.rows),
      ),
      mergedSection: Dynamic = {
        ...section,
        rows: mergedRows,
        ...(modes.size > 1
          ? {
              mode: undefined,
            }
          : {}),
      };
    sectionsAcrossElements.every(
      (candidateSection?: Dynamic): Dynamic => candidateSection.shadowTarget === "shape",
    ) || delete mergedSection.shadowTarget;
    delete mergedSection.dropShadowReason;
    mergedSections.push(mergedSection);
  }
  let sectionKind: Dynamic = (inspector?: Dynamic, element?: Dynamic): Dynamic =>
    inspector.sections.find(
      (candidate?: Dynamic): Dynamic =>
        !["size", "sizing", "appearance", "text", "effects"].includes(
          candidate.id,
        ),
    )?.id ??
    (InspectorStyleMetadataSubscribers.has(element.tag) ||
    InspectorStyleMetadataTextTspanTextpathSet.has(element.tag)
      ? "text"
      : "container");
  if (
    perElementInspectors
      .map(
        (kind?: Dynamic, index?: Dynamic): Dynamic =>
          sectionKind(kind, elements[index]),
      )
      .every((kind?: Dynamic): Dynamic => kind === "text")
  ) {
    let textIndex: Dynamic = mergedSections.findIndex(
      (section?: Dynamic): Dynamic => section.id === "text",
    );
    textIndex >= 0 &&
      (mergedSections[textIndex] = {
        ...mergedSections[textIndex],
        title: uiMessage("inspector.selection.text", { count: String(elements.length) }),
      });
  }
  orderInspectorSections(mergedSections);
  if (
    !(
      mergedSections
        .find((section?: Dynamic): Dynamic => section.id === "link")
        ?.rows.some((row?: Dynamic): Dynamic => row.prop === "@target") ??
      false
    )
  )
    for (let inspector of perElementInspectors as Dynamic) {
      let targetRow: Dynamic = inspector.sections
        .find((section?: Dynamic): Dynamic => section.id === "link")
        ?.rows.find((row?: Dynamic): Dynamic => row.prop === "@target");
      targetRow &&
        targetRow.value != null &&
        targetRow.value !== "" &&
        !inspector.advanced.some(
          (row?: Dynamic): Dynamic => row.prop === "@target",
        ) &&
        inspector.advanced.push({
          prop: "@target",
          get label() { return uiMessage("inspector.selection.target"); },
          value: targetRow.value,
          disabled: targetRow.disabled,
        });
    }
  let mergedProps: Dynamic = new Set(
      mergedSections.flatMap(
        (section?: Dynamic): Dynamic =>
          section.rows.map((row?: Dynamic): Dynamic => row.prop),
      ),
    ),
    hasSvgText: Dynamic = elements.some(
      (element?: Dynamic): Dynamic =>
        InspectorStyleMetadataTextTspanTextpathSet.has(element.tag),
    );
  perElementInspectors.forEach((inspector?: Dynamic, index?: Dynamic): Dynamic => {
    for (let row of inspector.sections.flatMap(
      (section?: Dynamic): Dynamic => section.rows,
    ) as Dynamic) {
      if (
        !(
          InspectorStyleMetadataStrokeStrokeWidthFillValues.includes(
            row.prop,
          ) ||
          (hasSvgText && row.prop === "color")
        ) ||
        mergedProps.has(row.prop) ||
        row.value == null ||
        row.value === ""
      )
        continue;
      let isAuthored: Dynamic = parseStyleDeclarations(
          elements[index].authoredStyle,
        ).some((declaration?: Dynamic): Dynamic => declaration.prop === row.prop),
        advancedProp: Dynamic = isAuthored ? row.prop : `@${row.prop}`;
      inspector.advanced.some(
        (candidate?: Dynamic): Dynamic => candidate.prop === advancedProp,
      ) ||
        inspector.advanced.push({
          prop: advancedProp,
          label: advancedProp,
          value: row.value,
          ...(row.varSource
            ? {
                varSource: row.varSource,
              }
            : {}),
          ...(isAuthored && row.inheritedFrom
            ? {
                inheritedFrom: row.inheritedFrom,
              }
            : {}),
          disabled: row.disabled,
        });
    }
  });
  let advancedByProp: Dynamic = new Map(),
    mergedSectionProps: Dynamic = new Set(
      perElementInspectors.flatMap(
        (inspector?: Dynamic): Dynamic =>
          inspector.sections.flatMap(
            (section?: Dynamic): Dynamic =>
              section.rows.map((row?: Dynamic): Dynamic => row.prop),
          ),
      ),
    );
  for (let inspector of perElementInspectors as Dynamic)
    for (let advancedRow of inspector.advanced as Dynamic) {
      if (advancedRow.stale && mergedSectionProps.has(advancedRow.prop)) continue;
      let rowsForProp: Dynamic = advancedByProp.get(advancedRow.prop) ?? [];
      rowsForProp.push(advancedRow);
      advancedByProp.set(advancedRow.prop, rowsForProp);
    }
  let orderByProp: Dynamic = new Map(
      InspectorPropertySchemaCursorPointerEventsObjectFitValues.map(
        (prop?: Dynamic, order?: Dynamic): Dynamic => [prop, order],
      ),
    ),
    propGroup: Dynamic = (prop?: Dynamic): Dynamic =>
      prop.startsWith("@") ? 2 : orderByProp.has(prop) ? 1 : 0,
    mergedAdvanced: Dynamic = [...advancedByProp.keys()]
      .sort(
        (propA?: Dynamic, propB?: Dynamic): Dynamic =>
          propGroup(propA) - propGroup(propB) ||
          (orderByProp.get(propA) ?? 0) - (orderByProp.get(propB) ?? 0),
      )
      .map((prop?: Dynamic): Dynamic => {
        let entry: Dynamic = advancedByProp.get(prop),
          firstRow: Dynamic = entry[0],
          rowValues: Dynamic = entry.map(
            (row?: Dynamic): Dynamic => row.value ?? "",
          ),
          mergedAdvancedRow: Dynamic =
            entry.length === perElementInspectors.length &&
            rowValues.every((rowValue?: Dynamic): Dynamic => rowValue === rowValues[0])
              ? {
                  ...firstRow,
                }
              : {
                  ...firstRow,
                  prop: prop,
                  value: null,
                  mixed: true,
                },
          advancedInheritedFroms: Dynamic = entry.map(
            (row?: Dynamic): Dynamic => row.inheritedFrom,
          );
        entry.length === perElementInspectors.length &&
        advancedInheritedFroms.every((inheritedFrom?: Dynamic): Dynamic => !!inheritedFrom)
          ? (mergedAdvancedRow.inheritedFrom = [...new Set(advancedInheritedFroms)].join(", "))
          : delete mergedAdvancedRow.inheritedFrom;
        return mergedAdvancedRow;
      });
  return {
    sections: mergedSections,
    advanced: mergedAdvanced,
  };
}
export {
  filterLayoutInspectorRows,
  inspectElementSelection,
  InspectorSelectionSubscribers,
  inspectSingleElement,
  orderInspectorSections,
  resolveInspectorInheritedValues,
};
export function installEditorInspectorSelection(): () => void {
  return () => {
    InspectorSelectionSubscribers = new Set([
      "width",
      "height",
      "position",
      "top",
      "left",
      "bottom",
      "right",
      "inset",
      "z-index",
      "transform",
      "__text",
    ]);
  };
}
