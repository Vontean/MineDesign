import { useUiLocale } from '../../ui-locale.ts';
import { uiMessage } from '@minedesign/contracts/ui-messages';
/** Restored application module; prepare first, initialize in original order. */
import {
  type Dynamic,
} from "../../runtime-types";
import { Button } from "../../cds/button/button";
import { cn } from "../../cds/theme/class-names";
import { formatCssNumber, getFineUnitStep, parseCssNumber, roundCssNumber } from "../css/values";
import { jsxMediaPlaybackControls, PropertiesInheritedFieldMixedAlias, PropertiesInheritedFieldValueAlias } from "../media/playback-controls";
import { inheritedFieldForEdit, inheritedFieldsDescription, inheritedFieldsDisabledReason } from "./inherited-field";
import { useStyleCommitScrub } from "./live-scrub";
import { NumericInput } from "./numeric-input";
import { PropertyRow } from "./row";
import { PropertySegments } from "./segments";
import { PropertySidesRow } from "./sides";
import { PropertiesSizingRowFlexStartStartCenterConfig as justifyGlyphs, PropertiesSizingRowFlexStartStartCenterConfig_2 as alignGlyphs } from "./sizing-row";
import { PropertyOptionIcon } from "./tool-options";

var PropertiesBoxLayoutStaticRelativeAbsoluteConfig: Dynamic;
function unifiedBoxSideValues(
  rows?: Dynamic,
  sideName?: Dynamic,
  defaultUnit?: Dynamic,
): Dynamic {
  let sideRows: Dynamic = ["top", "right", "bottom", "left"].map(
    (sideSuffix?: Dynamic): Dynamic =>
      rows.find(
        (row?: Dynamic): Dynamic => row.prop === `${sideName}-${sideSuffix}`,
      ),
  );
  if (sideRows.some((row?: Dynamic): Dynamic => !row)) return null;
  let orderedRows: Dynamic = sideRows,
    sharedUnit: Dynamic = null,
    items: Dynamic = [undefined, undefined, undefined, undefined];
  for (let index: Dynamic = 0; index < 4; index++) {
    let rowText: Dynamic = (orderedRows[index].value ?? "").trim();
    if (!rowText || orderedRows[index].mixed) continue;
    let parsedNumber: Dynamic = parseCssNumber(rowText);
    if (!parsedNumber) return null;
    let rowUnit: Dynamic = parsedNumber.unit || "px";
    if (sharedUnit != null && sharedUnit !== rowUnit) return null;
    sharedUnit = rowUnit;
    items[index] = parsedNumber.value;
  }
  let fallbackPlaceholder: Dynamic = (row?: Dynamic): Dynamic => {
      let parsedFallback: Dynamic = parseCssNumber(
        row.fallback ?? "",
      );
      if (!parsedFallback) return row.fallback ?? "";
      let fallbackUnit: Dynamic = parsedFallback.unit || "px";
      return formatCssNumber(
        roundCssNumber(parsedFallback.value, parsedFallback.unit),
        fallbackUnit === (defaultUnit ?? sharedUnit ?? "px") ? "" : fallbackUnit,
      );
    },
    placeholders: Dynamic = [
      fallbackPlaceholder(orderedRows[0]),
      fallbackPlaceholder(orderedRows[1]),
      fallbackPlaceholder(orderedRows[2]),
      fallbackPlaceholder(orderedRows[3]),
    ];
  return {
    rows: orderedRows,
    values: items,
    placeholders: placeholders,
    unit: sharedUnit ?? "px",
    mixed: orderedRows.some((row?: Dynamic): Dynamic => row.mixed),
    disabled: orderedRows.some((row?: Dynamic): Dynamic => row.disabled),
  };
}
function PropertyBoxSides({
  label: label,
  base: base,
  rows: rows,
  renderRows: renderRows,
  onCommitMany: onCommitMany,
}: Dynamic): Dynamic {
  useUiLocale();
  let disabledReason: Dynamic = inheritedFieldsDisabledReason(
      ...["top", "right", "bottom", "left"].map(
        (side?: Dynamic): Dynamic =>
          rows.find(
            (row?: Dynamic): Dynamic => row.prop === `${base}-${side}`,
          ),
      ),
    ),
    description: Dynamic = inheritedFieldsDescription(
      ...["top", "right", "bottom", "left"].map(
        (side?: Dynamic): Dynamic =>
          rows.find(
            (row?: Dynamic): Dynamic => row.prop === `${base}-${side}`,
          ),
      ),
    ),
    scrub: Dynamic = useStyleCommitScrub(
      (commits?: Dynamic): Dynamic => onCommitMany(commits),
    ),
    unifiedSides: Dynamic = unifiedBoxSideValues(rows, base),
    unifiedForEdit: Dynamic =
      unifiedSides &&
      unifiedBoxSideValues(
        rows.map(
          (row?: Dynamic): Dynamic =>
            inheritedFieldForEdit(row),
        ),
        base,
        unifiedSides.unit,
      ),
    unified: Dynamic = unifiedSides &&
      unifiedForEdit && {
        ...unifiedForEdit,
        unit: unifiedSides.unit,
      };
  if (!unified)
    return (
      <jsxMediaPlaybackControls.Fragment>
        {renderRows(
          ["top", "right", "bottom", "left"]
            .map(
              (side?: Dynamic): Dynamic =>
                rows.find(
                  (row?: Dynamic): Dynamic =>
                    row.prop === `${base}-${side}`,
                ),
            )
            .filter((row?: Dynamic): Dynamic => !!row)
            .map(
              (row?: Dynamic): Dynamic => ({
                ...row,
                label: `${label} ${row.prop.slice(base.length + 1)}`,
              }),
            ),
        )}
      </jsxMediaPlaybackControls.Fragment>
    );
  let sidePropName: Dynamic = (sideIndex?: Dynamic): Dynamic =>
      `${base}-${["top", "right", "bottom", "left"][sideIndex]}`,
    hasMixedSide: Dynamic = unified.rows.some(
      PropertiesInheritedFieldMixedAlias,
    ),
    toSideCommits: Dynamic = (sideEntries?: Dynamic): Dynamic =>
      sideEntries.map(
        (sideEntry?: Dynamic): Dynamic => ({
          prop: sidePropName(sideEntry.side),
          value:
            sideEntry.value === undefined
              ? null
              : formatCssNumber(sideEntry.value, unified.unit),
        }),
      ),
    hasFineStep: Dynamic =
      getFineUnitStep(unified.unit, undefined) != null;
  return (
    <PropertySidesRow
      label={label}
      data-testid={`dc-${base}`}
      title={disabledReason}
      description={description}
      values={unified.values}
      placeholders={unified.placeholders}
      unit={unified.unit}
      min={base === "padding" ? 0 : undefined}
      step={hasFineStep ? 0.1 : undefined}
      smallStep={hasFineStep ? 0.01 : undefined}
      mixed={unified.mixed}
      disabled={unified.disabled}
      onSides={(sideEntries?: Dynamic): Dynamic => onCommitMany(toSideCommits(sideEntries))}
      onScrubSides={(sideEntries?: Dynamic): Dynamic =>
        scrub.onScrub(toSideCommits(sideEntries))
      }
      onScrubEnd={(): Dynamic => scrub.onScrubEnd()}
      onReset={
        hasMixedSide
          ? (): Dynamic =>
              onCommitMany([
                {
                  prop: base,
                  value: null,
                },
                ...[0, 1, 2, 3].map(
                  (sideIndex?: Dynamic): Dynamic => ({
                    prop: sidePropName(sideIndex),
                    value: null,
                  }),
                ),
              ])
          : undefined
      }
    />
  );
}
function PropertyPositionXY({
  left: left,
  top: top,
  renderRows: renderRows,
  onCommitMany: onCommitMany,
}: Dynamic): Dynamic {
  useUiLocale();
  let isEditableOffset: Dynamic = (offsetRow?: Dynamic): Dynamic => {
    let offsetText: Dynamic = (offsetRow.value ?? "").trim();
    return (
      offsetRow.mixed || !offsetText || parseCssNumber(offsetText) != null
    );
  };
  if (!isEditableOffset(left) || !isEditableOffset(top))
    return (
      <jsxMediaPlaybackControls.Fragment>
        {renderRows([
          {
            ...left,
            get label() { return uiMessage("inspector.boxLayout.offsetX"); },
          },
          {
            ...top,
            get label() { return uiMessage("inspector.boxLayout.offsetY"); },
          },
        ])}
      </jsxMediaPlaybackControls.Fragment>
    );
  let disabledReason: Dynamic = inheritedFieldsDisabledReason(left, top),
    description: Dynamic = inheritedFieldsDescription(left, top);
  left = inheritedFieldForEdit(left);
  top = inheritedFieldForEdit(top);
  let renderOffsetInput: Dynamic = (
      offsetRow?: Dynamic,
      prefix?: Dynamic,
      inputLabel?: Dynamic,
    ): Dynamic => {
      let parsedOffset: Dynamic = offsetRow.mixed
          ? null
          : parseCssNumber((offsetRow.value ?? "").trim()),
        parsedFallback: Dynamic = parseCssNumber(offsetRow.fallback ?? ""),
        offsetUnit: Dynamic = parsedOffset?.unit || parsedFallback?.unit || "px";
      return (
        <NumericInput
          aria-label={inputLabel}
          prefix={prefix}
          value={parsedOffset ? parsedOffset.value : undefined}
          placeholder={
            offsetRow.mixed ? (undefined) : (parsedFallback ? (formatCssNumber(
                    roundCssNumber(parsedFallback.value, parsedFallback.unit),
                    "",
                  )) : (offsetRow.fallback || (uiMessage("inspector.boxLayout.auto"))))
          }
          mixed={offsetRow.mixed}
          clearable={true}
          refuseLetters={true}
          ownUnit={offsetUnit}
          steppers={false}
          disabled={offsetRow.disabled}
          onValue={(nextOffset?: Dynamic): Dynamic =>
            onCommitMany([
              {
                prop: offsetRow.prop,
                value:
                  nextOffset === undefined
                    ? null
                    : formatCssNumber(nextOffset, offsetUnit),
              },
              ...((nextOffset !== undefined && offsetRow.alsoCommit) || []),
            ])
          }
        />
      );
    },
    hasMixedOffset: Dynamic =
      PropertiesInheritedFieldMixedAlias(left) ||
      PropertiesInheritedFieldMixedAlias(top);
  return (
    <PropertyRow
      label={uiMessage("inspector.boxLayout.offset")}
      data-testid={"dc-offset"}
      title={disabledReason}
      description={description}
      onReset={
        hasMixedOffset && !left.disabled
          ? (): Dynamic =>
              onCommitMany([
                {
                  prop: "left",
                  value: null,
                },
                {
                  prop: "top",
                  value: null,
                },
              ])
          : undefined
      }
      onPress={(element?: Dynamic): Dynamic =>
        element.querySelector("input")?.focus()
      }
    >
      <div className={"grid min-w-0 flex-1 grid-cols-2 gap-2"}>
        {renderOffsetInput(left, "X", uiMessage("inspector.boxLayout.offsetX"))}
        {renderOffsetInput(top, "Y", uiMessage("inspector.boxLayout.offsetY"))}
      </div>
    </PropertyRow>
  );
}
function PropertyFlexAlignment({
  justify: justify,
  align: align,
  stack: stack,
  vertical: vertical,
  onCommitMany: onCommitMany,
}: Dynamic): Dynamic {
  useUiLocale();
  let disabledReason: Dynamic = inheritedFieldsDisabledReason(
      justify,
      align,
    ),
    description: Dynamic = inheritedFieldsDescription(justify, align);
  justify = inheritedFieldForEdit(justify);
  align = inheritedFieldForEdit(align);
  let justifyValue: Dynamic = (justify.mixed ? "" : (justify.value ?? ""))
      .trim()
      .toLowerCase(),
    alignValue: Dynamic = (align.mixed ? "" : (align.value ?? ""))
      .trim()
      .toLowerCase(),
    isSpaceValue: Dynamic = justifyValue.startsWith("space-"),
    isDistributed: Dynamic =
      isSpaceValue ||
      (!justifyValue &&
        !justify.mixed &&
        (justify.fallback ?? "").trim().toLowerCase().startsWith("space-")),
    justifyOptions: Dynamic =
      justify.prop === "justify-items"
        ? ["start", "center", "end"]
        : ["flex-start", "center", "flex-end"],
    items: Dynamic = ["flex-start", "center", "flex-end"],
    normalizeJustify: Dynamic = (justifyKeyword?: Dynamic): Dynamic =>
      justify.prop === "justify-items" &&
      (justifyKeyword === "normal" || justifyKeyword === "legacy")
        ? "stretch"
        : justifyKeyword === "start" || justifyKeyword === "left" || justifyKeyword === "normal"
          ? justifyOptions[0]
          : justifyKeyword === "end" || justifyKeyword === "right"
            ? justifyOptions[2]
            : justifyKeyword,
    normalizeAlign: Dynamic = (alignKeyword?: Dynamic): Dynamic =>
      alignKeyword === "start" || alignKeyword === "self-start"
        ? "flex-start"
        : alignKeyword === "end" || alignKeyword === "self-end"
          ? "flex-end"
          : alignKeyword,
    normalizeAlignWithDefault: Dynamic = (alignKeyword?: Dynamic): Dynamic =>
      alignKeyword === "stretch" || alignKeyword === "normal" || alignKeyword === ""
        ? "flex-start"
        : normalizeAlign(alignKeyword),
    inheritedJustify: Dynamic = normalizeJustify(
      justifyValue || (justify.fallback ?? "").trim().toLowerCase(),
    ),
    inheritedAlign: Dynamic = normalizeAlignWithDefault(
      alignValue || (align.fallback ?? "").trim().toLowerCase(),
    ),
    isDisabled: Dynamic = !!justify.disabled || !!align.disabled,
    hasMixedValue: Dynamic =
      PropertiesInheritedFieldMixedAlias(justify) ||
      PropertiesInheritedFieldMixedAlias(align),
    lookupGlyph: Dynamic = (glyphs?: Dynamic, optionKey?: Dynamic): Dynamic =>
      glyphs[optionKey];
  return (
    <PropertyRow
      label={uiMessage("inspector.boxLayout.align")}
      data-testid={"dc-alignment"}
      title={
        justify.mixed || align.mixed ? (uiMessage("inspector.boxLayout.mixedAcrossTheSelection")) : (disabledReason)
      }
      description={justify.mixed || align.mixed ? (undefined) : (description)}
      onReset={
        hasMixedValue && !isDisabled
          ? (): Dynamic =>
              onCommitMany([
                {
                  prop: justify.prop,
                  value: null,
                },
                {
                  prop: align.prop,
                  value: null,
                },
              ])
          : undefined
      }
      trailing={
        stack ? (
          <Button
            variant={"ghost"}
            iconOnly={true}
            icon={
              <PropertyOptionIcon
                icon={
                  justifyGlyphs[
                    "space-between"
                  ]
                }
              />
            }
            aria-label={uiMessage("inspector.boxLayout.distribute")}
            tooltip={
              isDistributed ? (uiMessage("inspector.boxLayout.distributeSpaceBetweenClickTo", { value1: String(isSpaceValue ? ("") : (uiMessage("inspector.boxLayout.inherited"))) })) : (uiMessage("inspector.boxLayout.distributeSpaceBetween"))
            }
            pressed={isDistributed}
            disabled={isDisabled}
            data-testid={"dc-distribute"}
            data-inherited={isDistributed && !isSpaceValue ? "" : undefined}
            className={cn("shrink-0", vertical && "rotate-90")}
            onClick={(): Dynamic =>
              onCommitMany([
                {
                  prop: justify.prop,
                  value: isDistributed
                    ? isSpaceValue
                      ? null
                      : justifyOptions[0]
                    : "space-between",
                },
              ])
            }
          />
        ) : undefined
      }
    >
      <span className={"flex min-w-0 flex-1 flex-wrap items-center gap-2"}>
        <span
          className={"min-w-[calc(var(--cds-h-control)*3)] flex-1"}
          title={
            isDistributed ? (uiMessage("inspector.boxLayout.computedDistributeDecidesThisAxis")) : (undefined)
          }
          data-testid={"dc-justify-group"}
        >
          <PropertySegments
            label={uiMessage("inspector.boxLayout.justify")}
            compact={true}
            value={
              isDistributed || justify.mixed
                ? undefined
                : PropertiesInheritedFieldValueAlias(justify) &&
                    justifyOptions.includes(normalizeJustify(justifyValue))
                  ? normalizeJustify(justifyValue)
                  : undefined
            }
            inherited={
              isDistributed ||
              justify.mixed ||
              PropertiesInheritedFieldValueAlias(justify)
                ? undefined
                : justifyOptions.includes(inheritedJustify)
                  ? inheritedJustify
                  : undefined
            }
            mixed={!!justify.mixed}
            disabled={isDisabled || isDistributed}
            vertical={vertical}
            onChange={(nextJustify?: Dynamic): Dynamic =>
              onCommitMany([
                {
                  prop: justify.prop,
                  value: nextJustify,
                },
              ])
            }
            options={justifyOptions.map(
              (optionValue?: Dynamic, optionIndex?: Dynamic): Dynamic => ({
                value: optionValue,
                get label() { return uiMessage("inspector.boxLayout.justify2", { value1: String(["start", "center", "end"][optionIndex]) }); },
                glyph: lookupGlyph(
                  justifyGlyphs,
                  optionValue,
                ),
              }),
            )}
          />
        </span>
        <span
          className={"min-w-[calc(var(--cds-h-control)*3)] flex-1"}
          data-testid={"dc-align-group"}
        >
          <PropertySegments
            label={uiMessage("inspector.boxLayout.align")}
            compact={true}
            value={
              align.mixed
                ? undefined
                : PropertiesInheritedFieldValueAlias(align) &&
                    items.includes(normalizeAlign(alignValue))
                  ? normalizeAlign(alignValue)
                  : undefined
            }
            inherited={
              align.mixed ||
              PropertiesInheritedFieldValueAlias(align)
                ? undefined
                : items.includes(inheritedAlign)
                  ? inheritedAlign
                  : undefined
            }
            mixed={!!align.mixed}
            disabled={isDisabled}
            vertical={vertical}
            onChange={(nextAlign?: Dynamic): Dynamic =>
              onCommitMany([
                {
                  prop: align.prop,
                  value: nextAlign,
                },
              ])
            }
            options={items.map(
              (optionValue?: Dynamic, optionIndex?: Dynamic): Dynamic => ({
                value: optionValue,
                get label() { return uiMessage("inspector.boxLayout.align2", { value1: String(["start", "center", "end"][optionIndex]) }); },
                glyph: lookupGlyph(
                  alignGlyphs,
                  optionValue,
                ),
              }),
            )}
          />
        </span>
      </span>
    </PropertyRow>
  );
}
export {
  PropertiesBoxLayoutStaticRelativeAbsoluteConfig,
  PropertyBoxSides,
  PropertyFlexAlignment,
  PropertyPositionXY,
  unifiedBoxSideValues,
};
export function installEditorPropertiesBoxLayout(): () => void {
  return () => {
    PropertiesBoxLayoutStaticRelativeAbsoluteConfig = {
      static: "Inline",
      relative: "Relative",
      absolute: "Absolute",
      get fixed() { return uiMessage("inspector.boxLayout.fixed"); },
      sticky: "Sticky",
    };
  };
}
