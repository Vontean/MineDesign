import { useUiLocale } from '../../ui-locale.ts';
import { uiMessage } from '@minedesign/contracts/ui-messages';
/** Restored application module; prepare first, initialize in original order. */
import {
  type Dynamic,
} from "../../runtime-types";
import { Button, Button as Button_r } from "../../cds/button/button";
import { cn } from "../../cds/theme/class-names";
import { load_react } from "../../dependencies";
import { parseEqualGridColumns, serializeEqualGridColumns } from "../css/grid";
import { parseCssTransform, serializeCssTransform } from "../css/transforms";
import { parseCssNumber } from "../css/values";
import { jsxMediaPlaybackControls, PropertiesInheritedFieldMixedAlias, PropertiesInheritedFieldValueAlias, reactForInspectorLayoutSection } from "../media/playback-controls";
import { PropertiesBoxLayoutStaticRelativeAbsoluteConfig, PropertyBoxSides, PropertyFlexAlignment, PropertyPositionXY } from "./box-layout";
import { inheritedFieldForEdit, inheritedFieldsDescription, inheritedFieldsDisabledReason } from "./inherited-field";
import { NumericInput } from "./numeric-input";
import { secondaryIconButtonClassName, PropertyActions } from "./primitives";
import { PropertyRow } from "./row";
import { PropertySection } from "./section";
import { PropertiesSizingRowLeftHcenterRightConfig } from "./sizing-row";
import { PropertyOptionIcon } from "./tool-options";
import { tableColumnsIcon, tableRowsIcon } from "./tooltip";
import { toModuleNamespace } from "../../module-helpers";

var reactPropertiesLayoutSection: Dynamic;
function LayoutSection({
  rows: rows,
  parentDisplay: parentDisplay,
  display: display,
  multi: multi,
  standaloneTranslate: standaloneTranslate,
  disabledAll: disabledAll,
  disabledWhy: disabledWhy,
  noMargins: noMargins,
  onCommitMany: onCommitMany,
}: Dynamic): Dynamic {
  useUiLocale();
  let entries: Dynamic = new Map(
      rows.map((row?: Dynamic): Dynamic => [row.prop, row]),
    ),
    readRowValue: Dynamic = (prop?: Dynamic, defaultValue: Dynamic = ""): Dynamic => {
      let rowEntry: Dynamic = entries.get(prop);
      return (
        (rowEntry && !rowEntry.mixed ? (rowEntry.value ?? "") : "") ||
        rowEntry?.fallback ||
        defaultValue
      )
        .trim()
        .toLowerCase();
    },
    positionEntry: Dynamic = entries.get("position"),
    positionValue: Dynamic =
      (multi
        ? (positionEntry && !positionEntry.mixed ? (positionEntry.value ?? "") : "")
            .trim()
            .toLowerCase()
        : readRowValue("position")) || "static",
    isAbsolute: Dynamic = positionValue === "absolute" || positionValue === "fixed",
    parentDisplayText: Dynamic = (parentDisplay ?? "").toLowerCase(),
    isPlacedByParent: Dynamic =
      parentDisplay === undefined ||
      parentDisplayText.includes("flex") ||
      parentDisplayText.includes("grid"),
    hasPartialSize: Dynamic = (sizeEntry?: Dynamic): Dynamic => {
      if (!sizeEntry || !PropertiesInheritedFieldValueAlias(sizeEntry))
        return false;
      let parsedSize: Dynamic = parseCssNumber(
        (sizeEntry.value ?? "").trim(),
      );
      return (
        parsedSize != null && !(parsedSize.unit === "%" && parsedSize.value >= 100)
      );
    },
    hasFixedWidth: Dynamic = hasPartialSize(entries.get("width")),
    hasFixedHeight: Dynamic = hasPartialSize(entries.get("height")),
    isPositionMixed: Dynamic = !!entries.get("position")?.mixed,
    isTransformMixed: Dynamic = !!entries.get("transform")?.mixed,
    displayText: Dynamic = (
      readRowValue("display", "") ||
      (display ?? "")
    ).toLowerCase(),
    isBlockLevel: Dynamic =
      /^(block|flex|grid|flow-root|table|list-item)(\s|$)/.test(displayText),
    canAlignWithMargins: Dynamic = !multi && !isPlacedByParent && hasFixedWidth && isBlockLevel,
    isAlignBlocked: Dynamic =
      disabledAll || isPositionMixed || isTransformMixed || !!standaloneTranslate,
    canAlignHorizontally: Dynamic = !isAlignBlocked && (isAbsolute || (canAlignWithMargins && !noMargins)),
    canAlignVertically: Dynamic = !isAlignBlocked && isAbsolute,
    canCenterHorizontally: Dynamic = canAlignHorizontally && hasFixedWidth && !noMargins,
    canCenterVertically: Dynamic = canAlignVertically && hasFixedHeight && !noMargins,
    disabledReason: Dynamic = disabledAll
      ? (disabledWhy ?? "Read-only selection")
      : noMargins && !isAbsolute
        ? noMargins
        : isPositionMixed
          ? uiMessage("inspector.layoutSection.theSelectionMixesPositionedAnd")
          : isTransformMixed
            ? uiMessage("inspector.layoutSection.theSelectedElementsCarryDifferent")
            : standaloneTranslate
              ? uiMessage("inspector.layoutSection.thisElementIsShiftedWith")
              : isPlacedByParent && !isAbsolute
                ? uiMessage("inspector.layoutSection.placedByItsParentSelect")
                : multi && !isAbsolute
                  ? "In-flow elements align one at a time \u2014 select one"
                  : !isAbsolute && !isBlockLevel
                    ? uiMessage("inspector.layoutSection.anInlineElementIgnoresAuto")
                    : !isAbsolute && !hasFixedWidth
                      ? uiMessage("inspector.layoutSection.giveItAFixedWidth")
                      : undefined,
    resetTranslateEdits: Dynamic = (
      axis?: Dynamic,
      force: Dynamic = false,
    ): Dynamic => {
      if (!isAbsolute && !force) return [];
      let transformEntry: Dynamic = entries.get("transform");
      if (
        !PropertiesInheritedFieldValueAlias(transformEntry) ||
        transformEntry.mixed
      )
        return [];
      let parsedTransform: Dynamic = parseCssTransform(transformEntry.value);
      if (!parsedTransform || parsedTransform[axis].value === 0) return [];
      let serializedTransform: Dynamic = serializeCssTransform({
        ...parsedTransform,
        [axis]: {
          value: 0,
          unit: "px",
        },
      });
      return [
        {
          prop: "transform",
          value: serializedTransform === "none" || serializedTransform === "" ? "none" : serializedTransform,
        },
      ];
    },
    resetTranslateX: Dynamic = resetTranslateEdits("x"),
    resetTranslateY: Dynamic = resetTranslateEdits("y"),
    isRelative: Dynamic = positionValue === "relative",
    setOffsetEdit: Dynamic = (prop?: Dynamic, newValue?: Dynamic): Dynamic =>
      noMargins && prop.startsWith("margin-")
        ? []
        : isAbsolute ||
            isRelative ||
            PropertiesInheritedFieldValueAlias(
              entries.get(prop),
            )
          ? [
              {
                prop: prop,
                value: newValue,
              },
            ]
          : [],
    inFlowResetEdits: Dynamic = [
      ...(isRelative
        ? [...setOffsetEdit("left", "0px"), ...setOffsetEdit("right", "auto")]
        : []),
      ...resetTranslateEdits("x", true),
    ],
    horizontalEdits: Dynamic = isAbsolute
      ? {
          left: [
            {
              prop: "left",
              value: "0px",
            },
            ...setOffsetEdit("right", "auto"),
            ...setOffsetEdit("margin-left", "0px"),
            ...setOffsetEdit("margin-right", "0px"),
            ...resetTranslateX,
          ],
          hcenter: [
            {
              prop: "left",
              value: "0px",
            },
            {
              prop: "right",
              value: "0px",
            },
            {
              prop: "margin-left",
              value: "auto",
            },
            {
              prop: "margin-right",
              value: "auto",
            },
            ...resetTranslateX,
          ],
          right: [
            {
              prop: "right",
              value: "0px",
            },
            ...setOffsetEdit("left", "auto"),
            ...setOffsetEdit("margin-left", "0px"),
            ...setOffsetEdit("margin-right", "0px"),
            ...resetTranslateX,
          ],
        }
      : {
          left: [
            {
              prop: "margin-left",
              value: "0px",
            },
            {
              prop: "margin-right",
              value: "auto",
            },
            ...inFlowResetEdits,
          ],
          hcenter: [
            {
              prop: "margin-left",
              value: "auto",
            },
            {
              prop: "margin-right",
              value: "auto",
            },
            ...inFlowResetEdits,
          ],
          right: [
            {
              prop: "margin-left",
              value: "auto",
            },
            {
              prop: "margin-right",
              value: "0px",
            },
            ...inFlowResetEdits,
          ],
        },
    verticalEdits: Dynamic = {
      top: [
        {
          prop: "top",
          value: "0px",
        },
        ...setOffsetEdit("bottom", "auto"),
        ...setOffsetEdit("margin-top", "0px"),
        ...setOffsetEdit("margin-bottom", "0px"),
        ...resetTranslateY,
      ],
      vcenter: [
        {
          prop: "top",
          value: "0px",
        },
        {
          prop: "bottom",
          value: "0px",
        },
        {
          prop: "margin-top",
          value: "auto",
        },
        {
          prop: "margin-bottom",
          value: "auto",
        },
        ...resetTranslateY,
      ],
      bottom: [
        {
          prop: "bottom",
          value: "0px",
        },
        ...setOffsetEdit("top", "auto"),
        ...setOffsetEdit("margin-top", "0px"),
        ...setOffsetEdit("margin-bottom", "0px"),
        ...resetTranslateY,
      ],
    },
    isSameLength: Dynamic = (first?: Dynamic, second?: Dynamic): Dynamic => {
      if (first === second) return true;
      let parsedFirst: Dynamic = parseCssNumber(first),
        parsedSecond: Dynamic = parseCssNumber(second);
      return (
        !!parsedFirst &&
        !!parsedSecond &&
        parsedFirst.value === parsedSecond.value &&
        (parsedFirst.value === 0 ||
          (parsedFirst.unit || "px") === (parsedSecond.unit || "px"))
      );
    },
    filterChangedEdits: Dynamic = (edits?: Dynamic): Dynamic =>
      edits.filter((edit?: Dynamic): Dynamic => {
        let rowEntry: Dynamic = entries.get(edit.prop);
        if (rowEntry?.mixed) return true;
        let currentValue: Dynamic = (rowEntry?.value ?? "").trim();
        if (edit.value == null) return currentValue !== "";
        let effectiveValue: Dynamic =
          currentValue ||
          (!multi && !isAbsolute && !isRelative
            ? (rowEntry?.fallback ?? "").trim()
            : "");
        return !isSameLength(effectiveValue, edit.value);
      }),
    alignDisabledReason: Dynamic = (alignKey?: Dynamic): Dynamic =>
      disabledReason ??
      ((alignKey === "hcenter" || alignKey === "vcenter") && noMargins
        ? noMargins
        : alignKey === "hcenter" && canAlignHorizontally && !hasFixedWidth
          ? entries.get("width")?.mixed
            ? uiMessage("inspector.layoutSection.theSelectedElementsNeedOne")
            : uiMessage("inspector.layoutSection.giveItAFixedWidth2")
          : alignKey === "vcenter" && canAlignVertically && !hasFixedHeight
            ? entries.get("height")?.mixed
              ? uiMessage("inspector.layoutSection.theSelectedElementsNeedOne2")
              : uiMessage("inspector.layoutSection.giveItAFixedHeight")
            : (alignKey === "top" ||
                  alignKey === "vcenter" ||
                  alignKey === "bottom") &&
                !isAbsolute
              ? uiMessage("inspector.layoutSection.positionItFirstAbsoluteOr")
              : ""),
    alignActions: Dynamic = [
      {
        key: "left",
        get label() { return uiMessage("inspector.layoutSection.alignLeft"); },
        glyph: PropertiesSizingRowLeftHcenterRightConfig.left,
        on: canAlignHorizontally,
        edits: horizontalEdits.left,
      },
      {
        key: "hcenter",
        get label() { return uiMessage("inspector.layoutSection.alignHorizontalCenters"); },
        glyph: PropertiesSizingRowLeftHcenterRightConfig.hcenter,
        on: canCenterHorizontally,
        edits: horizontalEdits.hcenter,
      },
      {
        key: "right",
        get label() { return uiMessage("inspector.layoutSection.alignRight"); },
        glyph: PropertiesSizingRowLeftHcenterRightConfig.right,
        on: canAlignHorizontally,
        edits: horizontalEdits.right,
      },
      {
        key: "top",
        get label() { return uiMessage("inspector.layoutSection.alignTop"); },
        glyph: PropertiesSizingRowLeftHcenterRightConfig.top,
        on: canAlignVertically,
        edits: verticalEdits.top,
      },
      {
        key: "vcenter",
        get label() { return uiMessage("inspector.layoutSection.alignVerticalCenters"); },
        glyph: PropertiesSizingRowLeftHcenterRightConfig.vcenter,
        on: canCenterVertically,
        edits: verticalEdits.vcenter,
      },
      {
        key: "bottom",
        get label() { return uiMessage("inspector.layoutSection.alignBottom"); },
        glyph: PropertiesSizingRowLeftHcenterRightConfig.bottom,
        on: canAlignVertically,
        edits: verticalEdits.bottom,
      },
    ];
  return (
    <PropertyRow
      data-testid={"dc-align-actions"}
      title={disabledReason}
      className={"[--prop-row-h:28px] pointer-coarse:[--prop-row-h:40px]"}
    >
      <div
        className={cn(
          "flex min-w-0 flex-1 items-center justify-between",
          secondaryIconButtonClassName,
        )}
      >
        {alignActions.map(
          (action?: Dynamic): Dynamic =>
            (() => {
              const _Component = Button;
              const _props = {
                variant: "ghost",
                iconOnly: true,
                icon: <PropertyOptionIcon icon={action.glyph} />,
                "aria-label": action.label,
                tooltip: action.label,
                get disabledReason() { return ((action.label) + (" \u2014 ")) + (alignDisabledReason(action.key)); },
                disabled: !action.on,
                "data-testid": `dc-align-${action.key}`,
                onClick: (): Dynamic => {
                  let pendingEdits: Dynamic = filterChangedEdits(action.edits);
                  pendingEdits.length > 0 && onCommitMany(pendingEdits);
                },
              } as const;
              const _key = action.key;
              return <_Component key={_key} {..._props} />;
            })(),
        )}
      </div>
    </PropertyRow>
  );
}
function PropertyFlexWrap({
  wrap: wrap,
  onCommitMany: onCommitMany,
}: Dynamic): Dynamic {
  useUiLocale();
  let wrapField: Dynamic = inheritedFieldForEdit(wrap),
    isWrapping: Dynamic = (
      (wrapField.mixed ? "" : (wrapField.value ?? "")) ||
      wrapField.fallback ||
      "nowrap"
    )
      .trim()
      .toLowerCase()
      .startsWith("wrap"),
    hasOwnWrapValue: Dynamic = PropertiesInheritedFieldValueAlias(wrapField);
  return (
    <Button_r
      variant={"ghost"}
      iconOnly={true}
      icon={"ArrowReturn"}
      aria-label={uiMessage("inspector.layoutSection.wrap")}
      tooltip={
        (isWrapping ? uiMessage("inspector.layoutSection.wrapsOntoNewLines") : uiMessage("inspector.layoutSection.noWrap")) + (hasOwnWrapValue ? "" : wrap.inheritedFrom && !wrap.mixed ? ` (from ${wrap.inheritedFrom})` : uiMessage("inspector.layoutSection.inherited"))
      }
      pressed={isWrapping}
      data-inherited={isWrapping && !hasOwnWrapValue ? "" : undefined}
      className={"shrink-0"}
      disabled={wrapField.disabled}
      data-testid={"dc-wrap-toggle"}
      onClick={(): Dynamic =>
        onCommitMany([
          {
            prop: "flex-wrap",
            value: isWrapping ? (hasOwnWrapValue ? null : "nowrap") : "wrap",
          },
        ])
      }
    />
  );
}
function PropertyGridTracks({
  cols: cols,
  rows: rows,
  renderRows: renderRows,
  onCommitMany: onCommitMany,
}: Dynamic): Dynamic {
  useUiLocale();
  let isEqualGridField: Dynamic = (field?: Dynamic): Dynamic =>
    !field.mixed &&
    (!(field.value ?? "").trim() ||
      parseEqualGridColumns(field.value) != null);
  if (!isEqualGridField(cols) || !isEqualGridField(rows))
    return (
      <jsxMediaPlaybackControls.Fragment>
        {renderRows([cols, rows])}
      </jsxMediaPlaybackControls.Fragment>
    );
  let disabledReason: Dynamic = inheritedFieldsDisabledReason(cols, rows),
    description: Dynamic = inheritedFieldsDescription(cols, rows);
  cols = inheritedFieldForEdit(cols);
  rows = inheritedFieldForEdit(rows);
  let renderCountInput: Dynamic = (
      trackField?: Dynamic,
      icon?: Dynamic,
      ariaLabel?: Dynamic,
      autoPlaceholder?: Dynamic,
    ): Dynamic => (
      <NumericInput
        aria-label={ariaLabel}
        prefix={<PropertyOptionIcon icon={icon} />}
        value={parseEqualGridColumns(trackField.value) ?? undefined}
        placeholder={
          trackField.mixed ? (undefined) : (parseEqualGridColumns(trackField.fallback ?? "") != null ? (String(
                  parseEqualGridColumns(trackField.fallback ?? ""),
                )) : (autoPlaceholder))
        }
        mixed={trackField.mixed}
        min={1}
        max={12}
        step={1}
        smallStep={1}
        clearable={true}
        steppers={false}
        disabled={trackField.disabled}
        onValue={(count?: Dynamic): Dynamic =>
          onCommitMany([
            {
              prop: trackField.prop,
              value:
                count === undefined
                  ? null
                  : serializeEqualGridColumns(
                      Math.round(count),
                    ),
            },
          ])
        }
      />
    ),
    hasMixedTrack: Dynamic =
      PropertiesInheritedFieldMixedAlias(cols) ||
      PropertiesInheritedFieldMixedAlias(rows);
  return (
    <PropertyRow
      label={uiMessage("inspector.layoutSection.grid")}
      data-testid={"dc-grid-row"}
      title={
        uiMessage("inspector.layoutSection.columnsRowsAsCountsOf", { disabledReasonPrefix: String(disabledReason ? (disabledReason + ". ") : ("")) })
      }
      description={description}
      onReset={
        hasMixedTrack
          ? (): Dynamic =>
              onCommitMany([
                {
                  prop: cols.prop,
                  value: null,
                },
                {
                  prop: rows.prop,
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
        {renderCountInput(
          cols,
          tableColumnsIcon,
          "Columns",
          "auto",
        )}
        {renderCountInput(
          rows,
          tableRowsIcon,
          "Rows",
          "auto",
        )}
      </div>
    </PropertyRow>
  );
}
function InspectorLayoutSection({
  sec: sec,
  selKey: selKey,
  isNested: isNested,
  readOnly = false,
  renderRows: renderRows,
  renderRow: renderRow,
  addItemsFor: addItemsFor,
  onCommitMany: onCommitMany,
}: Dynamic): Dynamic {
  useUiLocale();
  let entries: Dynamic = new Map(
      sec.rows.map((row?: Dynamic): Dynamic => [row.prop, row]),
    ),
    sizeRows: Dynamic = sec.rows.filter(
      (row?: Dynamic): Dynamic =>
        row.prop === "width" || row.prop === "height",
    ),
    limitRows: Dynamic = sec.rows.filter(
      (row?: Dynamic): Dynamic => /^(min|max)-/.test(row.prop),
    ),
    positionEntry: Dynamic = entries.get("position"),
    topEntry: Dynamic = entries.get("top"),
    leftEntry: Dynamic = entries.get("left"),
    farEdgeEntries: Dynamic = ["bottom", "right"]
      .map((edgeName?: Dynamic): Dynamic => entries.get(edgeName))
      .filter((edgeEntry?: Dynamic): Dynamic => !!edgeEntry),
    items: Dynamic = ["grid-column", "grid-row", "flex-grow"],
    itemRows: Dynamic = sec.rows.filter(
      (row?: Dynamic): Dynamic => items.includes(row.prop),
    ),
    hasPaddingRows: Dynamic = sec.rows.some(
      (row?: Dynamic): Dynamic => row.prop === "padding-top",
    ),
    hasMarginRows: Dynamic = sec.rows.some(
      (row?: Dynamic): Dynamic => row.prop === "margin-top",
    ),
    displayEntry: Dynamic = entries.get("display"),
    directionEntry: Dynamic = entries.get("flex-direction"),
    wrapEntry: Dynamic = entries.get("flex-wrap"),
    wrapValue: Dynamic = (wrapEntry && !wrapEntry.mixed ? (wrapEntry.value ?? "") : "")
      .trim()
      .toLowerCase(),
    isSimpleWrap: Dynamic =
      wrapValue === "" || wrapValue === "wrap" || wrapValue === "nowrap",
    gridColumnsEntry: Dynamic = entries.get("grid-template-columns"),
    gridRowsEntry: Dynamic = entries.get("grid-template-rows"),
    justifyEntry: Dynamic =
      entries.get("justify-content") ?? entries.get("justify-items"),
    alignEntry: Dynamic = entries.get("align-items"),
    gapEntry: Dynamic = entries.get("gap"),
    isColumnDirection: Dynamic = (
      (directionEntry?.mixed ? "" : (directionEntry?.value ?? "")) ||
      directionEntry?.fallback ||
      "row"
    ).startsWith("column"),
    hasMarginValue: Dynamic = sec.rows.some(
      (row?: Dynamic): Dynamic =>
        row.prop.startsWith("margin-") &&
        PropertiesInheritedFieldValueAlias(row),
    ),
    [marginEditorKey, setMarginEditorKey]: Dynamic =
      reactForInspectorLayoutSection.default.useState(""),
    showMarginBox: Dynamic = hasMarginRows && (hasMarginValue || marginEditorKey === selKey),
    isUnexpectedValue: Dynamic = (entry?: Dynamic, expectedValues?: Dynamic): Dynamic =>
      PropertiesInheritedFieldValueAlias(entry) &&
      !entry.mixed &&
      !expectedValues.includes((entry.value ?? "").trim().toLowerCase()),
    positionValue: Dynamic = (
      (positionEntry?.mixed ? "" : (positionEntry?.value ?? "")) ||
      positionEntry?.fallback ||
      "static"
    )
      .trim()
      .toLowerCase(),
    isPositioned: Dynamic = !!positionEntry && !positionEntry.mixed && positionValue !== "static",
    positionRow: Dynamic = positionEntry && {
      ...positionEntry,
      get label() { return uiMessage("inspector.layoutSection.position"); },
      spec: {
        ...positionEntry.spec,
        get label() { return uiMessage("inspector.layoutSection.position"); },
        editor: "select",
        optionLabels: PropertiesBoxLayoutStaticRelativeAbsoluteConfig,
      },
    },
    commitPosition: Dynamic = (prop?: Dynamic, newValue?: Dynamic): Dynamic => {
      if (newValue === "static") {
        let resetEdits: Dynamic = [
          ...(positionValue !== "static" ||
          PropertiesInheritedFieldValueAlias(positionEntry)
            ? [
                {
                  prop: "position",
                  value: "static",
                },
              ]
            : []),
          ...["top", "left", "bottom", "right"]
            .filter(
              (edge?: Dynamic): Dynamic =>
                PropertiesInheritedFieldValueAlias(
                  entries.get(edge),
                ),
            )
            .map(
              (edge?: Dynamic): Dynamic => ({
                prop: edge,
                value: null,
              }),
            ),
        ];
        resetEdits.length > 0 && onCommitMany(resetEdits);
      } else
        onCommitMany([
          {
            prop: prop,
            value: newValue,
          },
        ]);
    },
    gridAlignRows: Dynamic =
      sec.mode === "grid"
        ? [justifyEntry, alignEntry].filter((row?: Dynamic): Dynamic => !!row)
        : [],
    addMenuItems: Dynamic = isNested
      ? []
      : [
          ...addItemsFor(limitRows),
          ...(isPositioned ? addItemsFor(farEdgeEntries) : []),
          ...addItemsFor(gridAlignRows),
          ...(hasMarginRows && !showMarginBox
            ? [
                {
                  get label() { return uiMessage("inspector.layoutSection.margin"); },
                  onSelect: (): Dynamic => setMarginEditorKey(selKey),
                },
              ]
            : []),
        ];
  return (
    <PropertySection
      title={sec.title}
      iconColumn={sec.id === "sizing"}
      actions={
        isNested ? undefined : (
          <PropertyActions
            section={sec.title}
            data-testid={`dc-add-${sec.id}`}
            items={addMenuItems}
            disabled={readOnly}
          />
        )
      }
    >
      {renderRows(sizeRows)}
      {renderRows(limitRows)}
      {positionRow && (renderRow(positionRow, {
          onCommit: commitPosition,
        }))}
      {positionEntry &&
        topEntry &&
        leftEntry &&
        (isPositioned ||
          PropertiesInheritedFieldValueAlias(topEntry) ||
          PropertiesInheritedFieldValueAlias(leftEntry)) && (<PropertyPositionXY
            key={`${selKey}|offset`}
            left={leftEntry}
            top={topEntry}
            renderRows={renderRows}
            onCommitMany={onCommitMany}
          />)}
      {!positionEntry && (renderRows(
          [topEntry, leftEntry].filter(
            (row?: Dynamic): Dynamic =>
              !!row &&
              PropertiesInheritedFieldValueAlias(row),
          ),
        ))}
      {renderRows(
        isPositioned
          ? farEdgeEntries
          : farEdgeEntries.filter(PropertiesInheritedFieldValueAlias),
      )}
      {renderRows(itemRows)}
      {displayEntry && (renderRow(displayEntry))}
      {directionEntry && (renderRow(directionEntry, {
          trailing:
            wrapEntry && isSimpleWrap ? (
              <PropertyFlexWrap wrap={wrapEntry} onCommitMany={onCommitMany} />
            ) : undefined,
        }))}
      {wrapEntry &&
        !isSimpleWrap && (renderRows([
          {
            ...wrapEntry,
            spec: {
              ...wrapEntry.spec,
              editor: "string",
            },
          },
        ]))}
      {gridColumnsEntry && gridRowsEntry ? (<PropertyGridTracks
          key={`${selKey}|grid`}
          cols={gridColumnsEntry}
          rows={gridRowsEntry}
          renderRows={renderRows}
          onCommitMany={onCommitMany}
        />) : (renderRows(
          [gridColumnsEntry, gridRowsEntry].filter((row?: Dynamic): Dynamic => !!row),
        ))}
      {sec.mode === "flex" && justifyEntry && alignEntry && (<PropertyFlexAlignment
          key={`${selKey}|align`}
          justify={justifyEntry}
          align={alignEntry}
          stack={true}
          vertical={isColumnDirection}
          onCommitMany={onCommitMany}
        />)}
      {sec.mode === "flex" &&
        justifyEntry &&
        isUnexpectedValue(justifyEntry, [
          "flex-start",
          "center",
          "flex-end",
          "start",
          "end",
          "left",
          "right",
          "normal",
          "space-between",
          "legacy",
        ]) && (renderRows([
          {
            ...justifyEntry,
            get label() { return uiMessage("inspector.layoutSection.justify"); },
            spec: {
              ...justifyEntry.spec,
              editor: "string",
            },
          },
        ]))}
      {sec.mode === "flex" &&
        alignEntry &&
        isUnexpectedValue(alignEntry, [
          "flex-start",
          "center",
          "flex-end",
          "start",
          "end",
          "self-start",
          "self-end",
        ]) && (renderRows([
          {
            ...alignEntry,
            get label() { return uiMessage("inspector.layoutSection.align"); },
            spec: {
              ...alignEntry.spec,
              editor: "string",
            },
          },
        ]))}
      {sec.mode === undefined &&
        !justifyEntry &&
        alignEntry && (renderRows([
          {
            ...alignEntry,
            spec: {
              ...alignEntry.spec,
              longTail: false,
            },
          },
        ]))}
      {gapEntry && (renderRows([gapEntry]))}
      {renderRows(gridAlignRows)}
      {hasPaddingRows && (<PropertyBoxSides
          key={`${selKey}|padding`}
          label={uiMessage("inspector.layoutSection.padding")}
          base={"padding"}
          rows={sec.rows}
          renderRows={renderRows}
          onCommitMany={onCommitMany}
        />)}
      {showMarginBox && (<PropertyBoxSides
          key={`${selKey}|margin`}
          label={uiMessage("inspector.layoutSection.margin")}
          base={"margin"}
          rows={sec.rows}
          renderRows={renderRows}
          onCommitMany={onCommitMany}
        />)}
    </PropertySection>
  );
}
export {
  InspectorLayoutSection,
  LayoutSection,
  PropertyFlexWrap,
  PropertyGridTracks,
  reactPropertiesLayoutSection,
};
export function installEditorPropertiesLayoutSection(): () => void {
  return () => {
    reactPropertiesLayoutSection = toModuleNamespace(
      load_react(),
      1,
    );
  };
}
