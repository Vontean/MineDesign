import { useUiLocale } from '../../ui-locale.ts';
import { uiMessage } from '@minedesign/contracts/ui-messages';
/** Restored application module; prepare first, initialize in original order. */
import {
  type Dynamic,
} from "../../runtime-types";
import { load_react_jsx_runtime } from "../../dependencies";
import { formatCssNumber, getFineUnitStep, parseCssNumber, roundCssNumber } from "../css/values";
import { RemovePropertyButton } from "./effect-popup";
import { inheritedFieldDescription, inheritedFieldForEdit, inheritedFieldsDescription, inheritedFieldsDisabledReason, inheritedFieldTooltip, PropertiesInheritedFieldMixed, PropertiesInheritedFieldValue } from "./inherited-field";
import { PropertyInspectorField } from "./inspector-field";
import { reactPropertiesLayoutSection } from "./layout-section";
import { useStyleCommitScrub } from "./live-scrub";
import { PropertyActions } from "./primitives";
import { PropertySection } from "./section";
import { PropertySegmentsRow } from "./segments";
import { PropertyCornersRow, PropertySidesRow } from "./sides";
import { PropertiesTooltipNameViewBoxPathsConfig_6 as PropertiesTooltipSolidBorderGlyph, PropertiesTooltipNameViewBoxPathsConfig_7 as PropertiesTooltipDashedBorderGlyph, PropertiesTooltipNameViewBoxPathsConfig_8 as PropertiesTooltipDottedBorderGlyph } from "./tooltip";
import { TypographyCensusBorderBorderWidthBorderStyleValues } from "../typography/census";
import { toModuleNamespace } from "../../module-helpers";
import { PlatformFileContentBackgroundBackgroundColorOpacityValues } from "../../platform/file-content";

var jsxPropertiesAppearanceSection: Dynamic;
var PropertiesAppearanceSectionFallback: Dynamic;
var hasInheritedFieldValue: Dynamic;
var hasInheritedFieldMixed: Dynamic;
var PropertiesAppearanceSectionBorderTopLeftRadiusBorderTopRightRadiusBorderBottomRightRadiusValues: Dynamic;
var PropertiesAppearanceSectionBorderTopWidthBorderRightWidthBorderBottomWidthValues: Dynamic;
var PropertiesAppearanceSectionItems: Dynamic;
var PropertiesAppearanceSectionMapValue: Dynamic;
var jsxPropertiesAppearanceSection_2: Dynamic;
var jsxPropertiesAppearanceSection_3: Dynamic;
var PropertiesAppearanceSectionSubscribers: Dynamic;
var PropertiesAppearanceSectionFillProperties: Dynamic;
var PropertiesAppearanceSectionLabel: Dynamic;
var PropertiesAppearanceSectionFixedSizeMessage: Dynamic;
var ACanvasPictureShowsAnUploadedMessage: Dynamic;
var PropertiesAppearanceSectionNoteHeightMessage: Dynamic;
var PropertiesAppearanceSectionTitleSizeMessage: Dynamic;
var PropertiesAppearanceSectionOvalRoundMessage: Dynamic;
var PropertiesAppearanceSectionFontStyleOptions: Dynamic;
var PropertiesAppearanceSectionFillOnlyMessage: Dynamic;
var PropertiesAppearanceSectionReplaceVideoMessage: Dynamic;
var PropertiesAppearanceSectionImageVideoRectConfig: Dynamic;
var PropertiesAppearanceSectionWidthHeightPositionSet: Dynamic;
var PropertiesAppearanceSectionNoteTitle1Config: Dynamic;
var PropertiesAppearanceSectionImageProperties: Dynamic;
var PropertiesAppearanceSectionBoxShadowFilterBackdropFilterSet: Dynamic;
var PropertiesAppearanceSectionFontSizeFontWeightSet: Dynamic;
var PropertiesAppearanceSectionHandler: Dynamic;
var PropertiesAppearanceSectionImageRectOvalConfig: Dynamic;
function isLongTailPropertyVisible(
  row?: Dynamic,
  forceShown?: Dynamic,
): Dynamic {
  return (
    !row.spec?.longTail ||
    (row.value != null &&
      row.value !== "" &&
      row.value !== row.spec.defaultValue) ||
    (row.companionValue != null && row.companionValue !== "") ||
    !!row.mixed ||
    !!row.companionMixed ||
    forceShown.has(row.prop)
  );
}
function filterLongTailProperties(
  rows?: Dynamic,
  forceShown?: Dynamic,
  includeVisible: Dynamic = false,
): Dynamic {
  return rows.filter(
    (row?: Dynamic): Dynamic =>
      includeVisible || !isLongTailPropertyVisible(row, forceShown),
  );
}
function PropertyCornerRadius({
  radius: radius,
  corners: corners,
  renderRows: renderRows,
  onCommitMany: onCommitMany,
}: Dynamic): Dynamic {
  useUiLocale();
  let scrub: Dynamic = useStyleCommitScrub(
      (edits?: Dynamic): Dynamic => onCommitMany(edits),
    ),
    cornerRows: Dynamic =
      PropertiesAppearanceSectionBorderTopLeftRadiusBorderTopRightRadiusBorderBottomRightRadiusValues.map(
        (cornerProp?: Dynamic): Dynamic =>
          corners.find((corner?: Dynamic): Dynamic => corner.prop === cornerProp),
      ),
    renderFlatRows: Dynamic = (): Dynamic => (
      <jsxPropertiesAppearanceSection.Fragment>
        {renderRows([
          radius,
          ...cornerRows.filter(
            (corner?: Dynamic): Dynamic =>
              !!corner && hasInheritedFieldValue(corner),
          ),
        ])}
      </jsxPropertiesAppearanceSection.Fragment>
    );
  if (cornerRows.some((corner?: Dynamic): Dynamic => !corner)) return renderFlatRows();
  let commonUnit: Dynamic = null,
    parseRadiusValue: Dynamic = (text?: Dynamic): Dynamic => {
      let trimmedText: Dynamic = (text ?? "").trim();
      if (!trimmedText) return;
      let parsed: Dynamic = parseCssNumber(trimmedText);
      if (!parsed) return "bad";
      let parsedUnit: Dynamic = parsed.unit || "px";
      return commonUnit != null && commonUnit !== parsedUnit
        ? "bad"
        : ((commonUnit = parsedUnit), parsed.value);
    };
  for (let field of [radius, ...cornerRows] as Dynamic)
    if (!field.mixed && parseRadiusValue(field.value) === "bad")
      return renderFlatRows();
  let allCornersAuthored: Dynamic = cornerRows.every(
      (corner?: Dynamic): Dynamic =>
        hasInheritedFieldValue(corner) && !corner.inheritedFrom,
    ),
    disabledReason: Dynamic = inheritedFieldsDisabledReason(
      ...(allCornersAuthored ? [] : [radius]),
      ...cornerRows,
    ),
    description: Dynamic = inheritedFieldsDescription(
      ...(allCornersAuthored ? [] : [radius]),
      ...cornerRows,
    ),
    radiusField: Dynamic = inheritedFieldForEdit(radius),
    cornerFields: Dynamic = cornerRows.map(
      (corner?: Dynamic): Dynamic => inheritedFieldForEdit(corner),
    ),
    radiusValue: Dynamic = radiusField.mixed ? undefined : parseRadiusValue(radiusField.value);
  if (radiusValue === "bad") return renderFlatRows();
  let items: Dynamic = [undefined, undefined, undefined, undefined];
  for (let index: Dynamic = 0; index < 4; index++) {
    let cornerValue: Dynamic = cornerFields[index].mixed
      ? undefined
      : parseRadiusValue(cornerFields[index].value);
    if (cornerValue === "bad") return renderFlatRows();
    items[index] = cornerValue !== undefined ? cornerValue : radiusValue;
  }
  let unit: Dynamic = commonUnit ?? "px",
    placeholders: Dynamic = [
      PropertiesAppearanceSectionFallback(cornerFields[0], unit),
      PropertiesAppearanceSectionFallback(cornerFields[1], unit),
      PropertiesAppearanceSectionFallback(cornerFields[2], unit),
      PropertiesAppearanceSectionFallback(cornerFields[3], unit),
    ],
    isMixed: Dynamic =
      !!radiusField.mixed ||
      cornerFields.some((field?: Dynamic): Dynamic => field.mixed),
    hasResettableValue: Dynamic =
      hasInheritedFieldMixed(radiusField) ||
      cornerFields.some(hasInheritedFieldMixed),
    resetEdits: Dynamic =
      PropertiesAppearanceSectionBorderTopLeftRadiusBorderTopRightRadiusBorderBottomRightRadiusValues.map(
        (prop?: Dynamic): Dynamic => ({
          prop: prop,
          value: null,
        }),
      ),
    supportsFineStep: Dynamic =
      getFineUnitStep(unit, undefined) != null,
    commitSides: Dynamic = (sides?: Dynamic, commit?: Dynamic): Dynamic => {
      if (
        sides.length === 4 &&
        sides.every(
          (side?: Dynamic): Dynamic => side.value === sides[0].value,
        )
      ) {
        let commonValue: Dynamic = sides[0].value;
        commit([
          {
            prop: "border-radius",
            value:
              commonValue === undefined
                ? null
                : formatCssNumber(commonValue, unit),
          },
          ...resetEdits,
        ]);
        return;
      }
      if (
        radiusField.mixed ||
        cornerRows.some((side?: Dynamic): Dynamic => side.mixed)
      ) {
        commit(
          sides.map(
            (side?: Dynamic): Dynamic => ({
              prop: PropertiesAppearanceSectionBorderTopLeftRadiusBorderTopRightRadiusBorderBottomRightRadiusValues[
                side.side
              ],
              value:
                side.value === undefined
                  ? null
                  : formatCssNumber(side.value, unit),
            }),
          ),
        );
        return;
      }
      let nextValues: Dynamic = [...items];
      for (let sideEntry of sides as Dynamic)
        nextValues[sideEntry.side] = sideEntry.value;
      commit([
        {
          prop: "border-radius",
          value: null,
        },
        ...PropertiesAppearanceSectionBorderTopLeftRadiusBorderTopRightRadiusBorderBottomRightRadiusValues.map(
          (prop?: Dynamic, index?: Dynamic): Dynamic => ({
            prop: prop,
            value:
              nextValues[index] === undefined
                ? null
                : formatCssNumber(nextValues[index], unit),
          }),
        ),
      ]);
    };
  return (
    <PropertyCornersRow
      label={uiMessage("inspector.appearanceSection.radius")}
      data-testid={"dc-radius"}
      title={disabledReason}
      description={description}
      values={items}
      placeholders={placeholders}
      unit={unit}
      min={0}
      step={supportsFineStep ? 0.1 : undefined}
      smallStep={supportsFineStep ? 0.01 : undefined}
      mixed={isMixed}
      disabled={
        radius.disabled ||
        cornerFields.some((field?: Dynamic): Dynamic => field.disabled)
      }
      onSides={(sides?: Dynamic): Dynamic => commitSides(sides, onCommitMany)}
      onScrubSides={(sides?: Dynamic): Dynamic =>
        commitSides(sides, scrub.onScrub)
      }
      onScrubEnd={(): Dynamic => scrub.onScrubEnd()}
      onReset={
        hasResettableValue
          ? (): Dynamic =>
              onCommitMany([
                {
                  prop: "border-radius",
                  value: null,
                },
                ...resetEdits,
              ])
          : undefined
      }
    />
  );
}
function PropertyBorderSection({
  rows: rows,
  renderRows: renderRows,
  renderRow: renderRow,
  onCommitMany: onCommitMany,
  hasInline: hasInline,
  classHasBorder: classHasBorder,
  uaBorder: uaBorder,
}: Dynamic): Dynamic {
  useUiLocale();
  let scrub: Dynamic = useStyleCommitScrub(
      (edits?: Dynamic): Dynamic => onCommitMany(edits),
    ),
    styleRow: Dynamic = rows.find(
      (row?: Dynamic): Dynamic => row.prop === "border-style",
    ),
    widthRow: Dynamic = rows.find(
      (row?: Dynamic): Dynamic => row.prop === "border-width",
    ),
    sideWidthRows: Dynamic =
      PropertiesAppearanceSectionBorderTopWidthBorderRightWidthBorderBottomWidthValues.map(
        (prop?: Dynamic): Dynamic =>
          rows.find((row?: Dynamic): Dynamic => row.prop === prop),
      ),
    styleField: Dynamic = inheritedFieldForEdit(styleRow),
    widthField: Dynamic = inheritedFieldForEdit(widthRow),
    colorRow: Dynamic = rows.find(
      (row?: Dynamic): Dynamic => row.prop === "border-color",
    ),
    rawSideFields: Dynamic = sideWidthRows.map(
      (row?: Dynamic): Dynamic => inheritedFieldForEdit(row),
    );
  if (
    !styleField ||
    !widthField ||
    !colorRow ||
    rawSideFields.some((field?: Dynamic): Dynamic => !field)
  )
    return (
      <jsxPropertiesAppearanceSection.Fragment>
        {renderRows(rows.filter(hasInheritedFieldValue))}
      </jsxPropertiesAppearanceSection.Fragment>
    );
  let sideWidthFields: Dynamic = rawSideFields,
    styleTooltip: Dynamic = styleRow
      ? inheritedFieldTooltip(styleRow)
      : undefined,
    styleDescription: Dynamic = styleRow
      ? inheritedFieldDescription(styleRow)
      : undefined,
    widthDisabledReason: Dynamic = inheritedFieldsDisabledReason(
      widthRow,
      ...sideWidthRows,
    ),
    widthDescription: Dynamic = inheritedFieldsDescription(
      widthRow,
      ...sideWidthRows,
    ),
    isKnownBorderStyle: Dynamic = (style?: Dynamic): Dynamic =>
      PropertiesAppearanceSectionItems.some(
        (option?: Dynamic): Dynamic => option.value === style,
      ),
    currentStyle: Dynamic = (
      (styleField.mixed ? "" : styleField.value) ||
      styleField.fallback ||
      "none"
    )
      .trim()
      .toLowerCase(),
    displayStyle: Dynamic =
      currentStyle === "hidden"
        ? "none"
        : !hasInheritedFieldValue(styleRow) &&
            currentStyle !== "none" &&
            !isKnownBorderStyle(currentStyle)
          ? "solid"
          : currentStyle,
    isKnownStyle: Dynamic = isKnownBorderStyle(displayStyle),
    widthParsed: Dynamic = parseCssNumber(
      ((widthField.value || widthField.fallback) ?? "").trim(),
    ),
    sideWidthParsed: Dynamic = sideWidthFields.map(
      (field?: Dynamic): Dynamic =>
        parseCssNumber(
          ((field.value || field.fallback) ?? "").trim(),
        ),
    ),
    hasPositiveSideWidth: Dynamic = sideWidthParsed.some(
      (parsed?: Dynamic): Dynamic => parsed != null && parsed.value > 0,
    ),
    hasVisibleBorder: Dynamic =
      isKnownStyle &&
      displayStyle !== "none" &&
      ((widthParsed?.value ?? 0) > 0 ||
        hasPositiveSideWidth ||
        (!widthParsed && !sideWidthParsed.some(Boolean))),
    effectiveStyle: Dynamic = isKnownStyle ? (hasVisibleBorder ? displayStyle : "none") : "solid";
  if (!isKnownStyle && hasInheritedFieldValue(styleRow))
    return (
      <jsxPropertiesAppearanceSection.Fragment>
        {renderRows([
          styleField,
          colorRow,
          widthField,
          ...sideWidthFields.filter(hasInheritedFieldValue),
        ])}
      </jsxPropertiesAppearanceSection.Fragment>
    );
  let hasStyleValue: Dynamic = hasInheritedFieldValue(styleField),
    commitStyle: Dynamic = (style?: Dynamic): Dynamic => {
      if (style === "none") {
        if (
          !hasStyleValue &&
          !hasVisibleBorder &&
          !(
            hasInline &&
            TypographyCensusBorderBorderWidthBorderStyleValues.some(
              (property?: Dynamic): Dynamic => hasInline(property),
            )
          )
        )
          return;
        let hasInlineBorder: Dynamic = hasInline
            ? [
                "border",
                "border-style",
                "border-top",
                "border-right",
                "border-bottom",
                "border-left",
                "border-top-style",
                "border-right-style",
                "border-bottom-style",
                "border-left-style",
              ].some((property?: Dynamic): Dynamic => hasInline(property))
            : hasStyleValue,
          shouldWriteNone: Dynamic =
            !!classHasBorder ||
            !!uaBorder ||
            !!styleRow?.inheritedFrom ||
            (hasVisibleBorder && !hasInlineBorder);
        onCommitMany(
          shouldWriteNone
            ? [
                ...PropertiesAppearanceSectionMapValue,
                {
                  prop: "border-style",
                  value: "none",
                },
                ...(styleField.alsoCommit ?? []),
              ]
            : PropertiesAppearanceSectionMapValue,
        );
        return;
      }
      let edits: Dynamic = [
          {
            prop: "border-style",
            value: style,
          },
        ],
        sideHasValue: Dynamic = sideWidthRows.map(
          (hasValue?: Dynamic): Dynamic =>
            hasInheritedFieldValue(hasValue),
        ),
        canSeedWidth: Dynamic =
          !widthField.mixed &&
          !sideWidthFields.some((field?: Dynamic): Dynamic => field.mixed);
      hasVisibleBorder ||
        (canSeedWidth &&
          (!widthParsed || widthParsed.value === 0) &&
          (sideHasValue.some(Boolean)
            ? sideHasValue.forEach(
                (hasValue?: Dynamic, index?: Dynamic): Dynamic => {
                  hasValue ||
                    edits.push({
                      prop: PropertiesAppearanceSectionBorderTopWidthBorderRightWidthBorderBottomWidthValues[
                        index
                      ],
                      value: "1px",
                    });
                },
              )
            : edits.push({
                prop: "border-width",
                value: "1px",
              })),
        !colorRow.mixed &&
          !(colorRow.value ?? "").trim() &&
          edits.push({
            prop: "border-color",
            value: "#141413",
          }));
      onCommitMany([...edits, ...(styleField.alsoCommit ?? [])]);
    },
    widthUnit: Dynamic = null,
    parseWidthValue: Dynamic = (text?: Dynamic): Dynamic => {
      let trimmedText: Dynamic = (text ?? "").trim();
      if (!trimmedText) return;
      let parsed: Dynamic = parseCssNumber(trimmedText);
      if (!parsed) return "bad";
      let parsedUnit: Dynamic = parsed.unit || "px";
      return widthUnit != null && widthUnit !== parsedUnit
        ? "bad"
        : ((widthUnit = parsedUnit), parsed.value);
    },
    uniformWidth: Dynamic = widthField.mixed ? undefined : parseWidthValue(widthField.value),
    items: Dynamic = [undefined, undefined, undefined, undefined],
    hasInvalidWidth: Dynamic = uniformWidth === "bad";
  for (let index: Dynamic = 0; index < 4 && !hasInvalidWidth; index++) {
    let sideWidth: Dynamic = sideWidthFields[index].mixed
      ? undefined
      : parseWidthValue(sideWidthFields[index].value);
    sideWidth === "bad"
      ? (hasInvalidWidth = true)
      : (items[index] =
          sideWidth !== undefined
            ? sideWidth
            : uniformWidth === "bad"
              ? undefined
              : uniformWidth);
  }
  let unit: Dynamic = widthUnit ?? "px",
    placeholders: Dynamic = [
      PropertiesAppearanceSectionFallback(sideWidthFields[0], unit),
      PropertiesAppearanceSectionFallback(sideWidthFields[1], unit),
      PropertiesAppearanceSectionFallback(sideWidthFields[2], unit),
      PropertiesAppearanceSectionFallback(sideWidthFields[3], unit),
    ],
    hasResettableValue: Dynamic =
      hasInheritedFieldMixed(widthField) ||
      sideWidthFields.some(hasInheritedFieldMixed),
    isUniform: Dynamic = (sides?: Dynamic): Dynamic =>
      sides.length === 4 &&
      sides.every(
        (side?: Dynamic): Dynamic => side.value === sides[0].value,
      ),
    isMixed: Dynamic =
      !!widthField.mixed ||
      sideWidthFields.some((field?: Dynamic): Dynamic => field.mixed),
    resolveSideWidths: Dynamic = (sides?: Dynamic): Dynamic => {
      let widths: Dynamic = items.map(
        (width?: Dynamic, index?: Dynamic): Dynamic =>
          width ??
          (/^-?[\d.]+$/.test(placeholders[index] ?? "")
            ? parseCssNumber(placeholders[index] ?? "")?.value
            : undefined),
      );
      for (let sideEntry of sides as Dynamic)
        widths[sideEntry.side] = sideEntry.value ?? 0;
      return widths;
    },
    isAllZero: Dynamic = (sides?: Dynamic): Dynamic =>
      isUniform(sides)
        ? (sides[0].value ?? 0) === 0
        : !isMixed &&
          resolveSideWidths(sides).every((width?: Dynamic): Dynamic => width === 0),
    defaultStep: Dynamic =
      getFineUnitStep(unit, undefined) != null ? 0.1 : 1,
    restoreWidth: Dynamic = (side?: Dynamic): Dynamic => {
      let current: Dynamic = resolveSideWidths([])[side];
      return current !== undefined && current > 0 && current < defaultStep
        ? current
        : defaultStep;
    },
    commitWidths: Dynamic = (
      sides?: Dynamic,
      commit?: Dynamic,
      isScrubbing: Dynamic = false,
    ): Dynamic => {
      let isZeroWidth: Dynamic = isAllZero(sides);
      if (isZeroWidth && !isScrubbing) return commitStyle("none");
      if (isUniform(sides)) {
        commit([
          {
            prop: "border-width",
            value: formatCssNumber(
              isZeroWidth ? restoreWidth(0) : sides[0].value,
              unit,
            ),
          },
          ...PropertiesAppearanceSectionBorderTopWidthBorderRightWidthBorderBottomWidthValues.map(
            (prop?: Dynamic): Dynamic => ({
              prop: prop,
              value: null,
            }),
          ),
          ...(widthField.alsoCommit ?? []),
        ]);
        return;
      }
      if (isMixed) {
        commit([
          ...sides.map(
            (side?: Dynamic): Dynamic => ({
              prop: PropertiesAppearanceSectionBorderTopWidthBorderRightWidthBorderBottomWidthValues[
                side.side
              ],
              value: formatCssNumber(side.value ?? 0, unit),
            }),
          ),
          ...(widthField.alsoCommit ?? []),
        ]);
        return;
      }
      let nextWidths: Dynamic = resolveSideWidths(sides);
      if (isZeroWidth)
        for (let sideEntry of sides as Dynamic)
          nextWidths[sideEntry.side] = restoreWidth(sideEntry.side);
      commit([
        {
          prop: "border-width",
          value: null,
        },
        ...PropertiesAppearanceSectionBorderTopWidthBorderRightWidthBorderBottomWidthValues.map(
          (prop?: Dynamic, index?: Dynamic): Dynamic => ({
            prop: prop,
            value:
              nextWidths[index] === undefined
                ? null
                : formatCssNumber(nextWidths[index], unit),
          }),
        ),
        ...(widthField.alsoCommit ?? []),
      ]);
    };
  return (
    <jsxPropertiesAppearanceSection.Fragment>
      <PropertySegmentsRow
        label={uiMessage("inspector.appearanceSection.border")}
        data-testid={"dc-border-style"}
        options={PropertiesAppearanceSectionItems}
        value={
          styleField.mixed
            ? undefined
            : hasStyleValue || effectiveStyle === "none"
              ? effectiveStyle
              : undefined
        }
        inherited={hasStyleValue || effectiveStyle === "none" ? undefined : effectiveStyle}
        mixed={!!styleField.mixed}
        disabled={styleField.disabled}
        title={styleTooltip ?? (hasStyleValue || hasVisibleBorder ? (undefined) : (uiMessage("inspector.appearanceSection.noBorder")))}
        description={styleDescription}
        onChange={commitStyle}
        onReset={
          hasInheritedFieldMixed(styleField)
            ? (): Dynamic => onCommitMany(PropertiesAppearanceSectionMapValue)
            : undefined
        }
      />
      {effectiveStyle !== "none" && !styleField.mixed ? (<jsxPropertiesAppearanceSection.Fragment>
          {renderRow({
            ...colorRow,
            get label() { return uiMessage("inspector.appearanceSection.color"); },
          })}
          {hasInvalidWidth ? (renderRows([
              {
                ...widthField,
                get label() { return uiMessage("inspector.appearanceSection.width"); },
              },
              ...sideWidthFields.filter(hasInheritedFieldValue),
            ])) : (<PropertySidesRow
              label={uiMessage("inspector.appearanceSection.width")}
              data-testid={"dc-border-width"}
              title={widthDisabledReason}
              description={widthDescription}
              values={items}
              placeholders={placeholders}
              unit={unit}
              min={0}
              step={defaultStep === 1 ? undefined : defaultStep}
              smallStep={defaultStep === 1 ? undefined : 0.01}
              mixed={
                !!widthField.mixed ||
                sideWidthFields.some((field?: Dynamic): Dynamic => field.mixed)
              }
              disabled={widthField.disabled}
              onSides={(sides?: Dynamic): Dynamic =>
                commitWidths(sides, onCommitMany)
              }
              onScrubSides={(sides?: Dynamic): Dynamic =>
                commitWidths(sides, scrub.onScrub, true)
              }
              onScrubEnd={(sides?: Dynamic): Dynamic =>
                scrub.onScrubEnd((): Dynamic => {
                  sides.length > 0 && isAllZero(sides) && commitStyle("none");
                })
              }
              onReset={
                hasResettableValue
                  ? (): Dynamic =>
                      onCommitMany([
                        {
                          prop: "border-width",
                          value: null,
                        },
                        ...PropertiesAppearanceSectionBorderTopWidthBorderRightWidthBorderBottomWidthValues.map(
                          (prop?: Dynamic): Dynamic => ({
                            prop: prop,
                            value: null,
                          }),
                        ),
                      ])
                  : undefined
              }
            />)}
        </jsxPropertiesAppearanceSection.Fragment>) : (renderRows(
          [colorRow, widthField, ...sideWidthFields]
            .filter(
              (field?: Dynamic): Dynamic =>
                hasInheritedFieldValue(field) &&
                !field.inheritedFrom,
            )
            .map(
              (field?: Dynamic): Dynamic =>
                field === colorRow
                  ? {
                      ...field,
                      get label() { return uiMessage("inspector.appearanceSection.borderColor"); },
                    }
                  : field,
            ),
        ))}
    </jsxPropertiesAppearanceSection.Fragment>
  );
}
function useVisibleInspectorProperties(config?: Dynamic): Dynamic {
  let isRowShown: Dynamic = (row?: Dynamic): Dynamic =>
      isLongTailPropertyVisible(row, config.forceShown),
    focusRow: Dynamic = (prop?: Dynamic): Dynamic => {
      setTimeout((): Dynamic => {
        let element: Dynamic = (document as Dynamic).querySelector(
            `[data-testid="dc-prop-${prop}"]`,
          ),
          value: Dynamic = element?.querySelector("input");
        value
          ? value.focus()
          : element?.querySelector("button[aria-haspopup]")?.click();
      }, 60);
    },
    revealRow: Dynamic = (row?: Dynamic): Dynamic => {
      config.setForceShown(
        (current?: Dynamic): Dynamic => new Set(current).add(row.prop),
      );
      focusRow(row.prop);
    },
    buildAddItems: Dynamic = (
      rows?: Dynamic,
      includeVisible: Dynamic = false,
    ): Dynamic =>
      filterLongTailProperties(rows, config.forceShown, includeVisible).map(
        (row?: Dynamic): Dynamic => ({
          label: row.label.replace(
            /^./,
            (char?: Dynamic): Dynamic => char.toUpperCase(),
          ),
          disabled: row.disabled,
          disabledReason: row.whyDisabled,
          onSelect: (): Dynamic => revealRow(row),
        }),
      ),
    buildRemoveHandler: Dynamic = (row?: Dynamic): Dynamic =>
      row.spec?.longTail
        ? (): Dynamic =>
            config.setForceShown((current?: Dynamic): Dynamic => {
              let values: Dynamic = new Set(current);
              values.delete(row.prop);
              return values;
            })
        : undefined,
    renderRow: Dynamic = (
      row?: Dynamic,
      overrides: Dynamic = {},
    ): Dynamic =>
      isRowShown(row)
        ? (() => {
            const _Component = PropertyInspectorField;
            const _props = {
              state: row,
              onCommit: overrides.onCommit ?? config.onCommit,
              onCommitMany: overrides.onCommitMany ?? config.onCommitMany,
              onPickImageFile: config.onPickImageFile,
              pageFonts: config.pageFonts,
              pageWebfonts: config.pageWebfonts,
              onFacesOpen: config.onFacesOpen,
              onRemoveRow: buildRemoveHandler(row),
              trailing: overrides.trailing,
              extraMenuItems: overrides.extraMenuItems,
            } as const;
            const _key = `${config.selKey}|${row.prop}`;
            return <_Component key={_key} {..._props} />;
          })()
        : null;
  return {
    isShown: isRowShown,
    revealRow: revealRow,
    addItemsFor: buildAddItems,
    renderRow: renderRow,
    renderRows: (
      rowsToRender?: Dynamic,
      footer?: Dynamic,
      extraMenuItems?: Dynamic,
    ): Dynamic => {
      let visibleRows: Dynamic = rowsToRender.filter(isRowShown);
      return visibleRows.length === 0 && !footer ? null : (
        <jsxPropertiesAppearanceSection_2.Fragment>
          {visibleRows.map(
            (row?: Dynamic): Dynamic =>
              renderRow(row, {
                extraMenuItems: extraMenuItems,
              }),
          )}
          {footer}
        </jsxPropertiesAppearanceSection_2.Fragment>
      );
    },
  };
}
function InspectorAppearanceSection({
  sec: sec,
  selKey: selKey,
  isNested: isNested,
  readOnly: readOnly,
  rows: rows,
  onCommitMany: onCommitMany,
  fillInline: fillInline,
  hasInline: hasInline,
  uaBorder: uaBorder,
  classHasBorder: classHasBorder,
}: Dynamic): Dynamic {
  useUiLocale();
  let {
      isShown: isRowShown,
      addItemsFor: getAddItems,
      renderRow: renderRow,
      renderRows: renderRows,
    }: Dynamic = rows,
    isBorderRow: Dynamic = (row?: Dynamic): Dynamic =>
      row.spec?.section === "border" ||
      row.spec?.section === "borderSides",
    borderRows: Dynamic = sec.rows.filter(isBorderRow),
    otherRows: Dynamic = sec.rows.filter(
      (row?: Dynamic): Dynamic => !isBorderRow(row),
    ),
    addItems: Dynamic = getAddItems(otherRows),
    values: Dynamic = new Set([
      "border-radius",
      "border-top-left-radius",
      "border-top-right-radius",
      "border-bottom-right-radius",
      "border-bottom-left-radius",
    ]),
    radiusRow: Dynamic = otherRows.find(
      (row?: Dynamic): Dynamic => row.prop === "border-radius",
    ),
    cornerRows: Dynamic = otherRows.filter(
      (row?: Dynamic): Dynamic => row.spec?.section === "radius",
    ),
    children: Dynamic = [],
    pendingRows: Dynamic = [],
    flushPendingRows: Dynamic = (key?: Dynamic): Dynamic => {
      pendingRows.length &&
        children.push(
          <reactPropertiesLayoutSection.default.Fragment key={key}>
            {renderRows(pendingRows)}
          </reactPropertiesLayoutSection.default.Fragment>,
        );
      pendingRows = [];
    };
  for (let row of otherRows as Dynamic) {
    if (row.prop === "background") {
      flushPendingRows("pre-fill");
      let hasFillValue: Dynamic =
        fillInline &&
        ((row.value != null && row.value !== "") ||
          (row.companionValue != null && row.companionValue !== "") ||
          !!row.mixed ||
          !!row.companionMixed);
      children.push(
        <reactPropertiesLayoutSection.default.Fragment key={"fill"}>
          {renderRow(row, {
            onCommitMany: onCommitMany,
            trailing:
              hasFillValue && !row.disabled ? (
                <RemovePropertyButton
                  label={uiMessage("inspector.appearanceSection.fill")}
                  onClick={(): Dynamic =>
                    onCommitMany([
                      {
                        prop: "background",
                        value: null,
                      },
                      {
                        prop: "background-color",
                        value: null,
                      },
                    ])
                  }
                />
              ) : undefined,
          })}
        </reactPropertiesLayoutSection.default.Fragment>,
      );
      continue;
    }
    if (row.prop === "border-radius" && radiusRow && isRowShown(radiusRow)) {
      flushPendingRows("pre-radius");
      children.push(
        <PropertyCornerRadius
          key={`${selKey}|radius`}
          radius={radiusRow}
          corners={cornerRows}
          renderRows={renderRows}
          onCommitMany={onCommitMany}
        />,
      );
      continue;
    }
    (values.has(row.prop) &&
      row.prop !== "border-radius" &&
      radiusRow &&
      isRowShown(radiusRow)) ||
      pendingRows.push(row);
  }
  flushPendingRows("rest");
  return (
    <PropertySection
      title={sec.title}
      iconColumn={true}
      actions={
        isNested || addItems.length === 0 ? undefined : (
          <PropertyActions
            section={sec.title}
            data-testid={`dc-add-${sec.id}`}
            items={addItems}
            disabled={readOnly}
          />
        )
      }
    >
      {children}
      {borderRows.length > 0 ? (<PropertyBorderSection
          key={`${selKey}|border`}
          rows={borderRows}
          renderRows={renderRows}
          renderRow={renderRow}
          onCommitMany={onCommitMany}
          hasInline={hasInline}
          uaBorder={uaBorder}
          classHasBorder={classHasBorder}
        />) : (null)}
    </PropertySection>
  );
}
export {
  ACanvasPictureShowsAnUploadedMessage,
  filterLongTailProperties,
  InspectorAppearanceSection,
  isLongTailPropertyVisible,
  jsxPropertiesAppearanceSection,
  jsxPropertiesAppearanceSection_2,
  jsxPropertiesAppearanceSection_3,
  PropertiesAppearanceSectionBorderTopLeftRadiusBorderTopRightRadiusBorderBottomRightRadiusValues,
  PropertiesAppearanceSectionBorderTopWidthBorderRightWidthBorderBottomWidthValues,
  PropertiesAppearanceSectionBoxShadowFilterBackdropFilterSet,
  PropertiesAppearanceSectionFallback,
  PropertiesAppearanceSectionFontSizeFontWeightSet,
  PropertiesAppearanceSectionHandler,
  PropertiesAppearanceSectionImageRectOvalConfig,
  PropertiesAppearanceSectionImageVideoRectConfig,
  PropertiesAppearanceSectionItems,
  PropertiesAppearanceSectionFontStyleOptions as PropertiesAppearanceSectionItems_2,
  PropertiesAppearanceSectionLabel,
  PropertiesAppearanceSectionFixedSizeMessage as PropertiesAppearanceSectionLabel_2,
  PropertiesAppearanceSectionNoteHeightMessage as PropertiesAppearanceSectionLabel_3,
  PropertiesAppearanceSectionTitleSizeMessage as PropertiesAppearanceSectionLabel_4,
  PropertiesAppearanceSectionOvalRoundMessage as PropertiesAppearanceSectionLabel_5,
  PropertiesAppearanceSectionFillOnlyMessage as PropertiesAppearanceSectionLabel_6,
  PropertiesAppearanceSectionReplaceVideoMessage as PropertiesAppearanceSectionLabel_7,
  PropertiesAppearanceSectionMapValue,
  PropertiesAppearanceSectionNoteTitle1Config,
  PropertiesAppearanceSectionSubscribers,
  PropertiesAppearanceSectionFillProperties as PropertiesAppearanceSectionSubscribers_2,
  PropertiesAppearanceSectionImageProperties as PropertiesAppearanceSectionSubscribers_3,
  PropertiesAppearanceSectionWidthHeightPositionSet,
  hasInheritedFieldMixed as PropertiesInheritedFieldMixedAlias_2,
  hasInheritedFieldValue as PropertiesInheritedFieldValueAlias_2,
  PropertyBorderSection,
  PropertyCornerRadius,
  useVisibleInspectorProperties,
};
export function installEditorPropertiesAppearanceSection(): () => void {
  return () => {
    jsxPropertiesAppearanceSection = toModuleNamespace(
      load_react_jsx_runtime(),
      1,
    );
    PropertiesAppearanceSectionFallback = (
      field?: Dynamic,
      defaultUnit: Dynamic = "px",
    ): Dynamic => {
      let parsed: Dynamic = parseCssNumber(field.fallback ?? "");
      if (!parsed) return field.fallback ?? "";
      let unit: Dynamic = parsed.unit || "px";
      return formatCssNumber(
        roundCssNumber(parsed.value, parsed.unit),
        unit === defaultUnit ? "" : unit,
      );
    };
    hasInheritedFieldValue =
      PropertiesInheritedFieldValue;
    hasInheritedFieldMixed =
      PropertiesInheritedFieldMixed;
    PropertiesAppearanceSectionBorderTopLeftRadiusBorderTopRightRadiusBorderBottomRightRadiusValues =
      [
        "border-top-left-radius",
        "border-top-right-radius",
        "border-bottom-right-radius",
        "border-bottom-left-radius",
      ];
    PropertiesAppearanceSectionBorderTopWidthBorderRightWidthBorderBottomWidthValues =
      [
        "border-top-width",
        "border-right-width",
        "border-bottom-width",
        "border-left-width",
      ];
    PropertiesAppearanceSectionItems = [
      {
        value: "none",
        get label() { return uiMessage("inspector.appearanceSection.none"); },
        icon: "Prohibit",
      },
      {
        value: "solid",
        get label() { return uiMessage("inspector.appearanceSection.solid"); },
        glyph: PropertiesTooltipSolidBorderGlyph,
      },
      {
        value: "dashed",
        get label() { return uiMessage("inspector.appearanceSection.dashed"); },
        glyph: PropertiesTooltipDashedBorderGlyph,
      },
      {
        value: "dotted",
        get label() { return uiMessage("inspector.appearanceSection.dotted"); },
        glyph: PropertiesTooltipDottedBorderGlyph,
      },
    ];
    PropertiesAppearanceSectionMapValue =
      TypographyCensusBorderBorderWidthBorderStyleValues.map(
        (pixels?: Dynamic): Dynamic => ({
          prop: pixels,
          value: null,
        }),
      );
    jsxPropertiesAppearanceSection_2 = toModuleNamespace(
      load_react_jsx_runtime(),
      1,
    );
    jsxPropertiesAppearanceSection_3 = toModuleNamespace(
      load_react_jsx_runtime(),
      1,
    );
    PropertiesAppearanceSectionSubscribers = new Set();
    PropertiesAppearanceSectionFillProperties = new Set(
      PlatformFileContentBackgroundBackgroundColorOpacityValues,
    );
    PropertiesAppearanceSectionLabel =
      uiMessage("inspector.appearanceSection.canvasObjectsArePlacedFreely");
    PropertiesAppearanceSectionFixedSizeMessage =
      uiMessage("inspector.appearanceSection.aCanvasObjectHasA");
    ACanvasPictureShowsAnUploadedMessage =
      uiMessage("inspector.appearanceSection.aCanvasPictureShowsAn");
    PropertiesAppearanceSectionNoteHeightMessage =
      uiMessage("inspector.appearanceSection.aNoteIsAsTall");
    PropertiesAppearanceSectionTitleSizeMessage =
      uiMessage("inspector.appearanceSection.aTitleIsAsWide");
    PropertiesAppearanceSectionOvalRoundMessage = uiMessage("inspector.appearanceSection.anOvalIsAlwaysRound");
    PropertiesAppearanceSectionFontStyleOptions = [
      {
        weight: 400,
        italic: false,
      },
      {
        weight: 700,
        italic: false,
      },
      {
        weight: 400,
        italic: true,
      },
      {
        weight: 700,
        italic: true,
      },
    ];
    PropertiesAppearanceSectionFillOnlyMessage =
      uiMessage("inspector.appearanceSection.aCanvasObjectPaintsA");
    PropertiesAppearanceSectionReplaceVideoMessage =
      uiMessage("inspector.appearanceSection.replaceItFromTheStrip");
    PropertiesAppearanceSectionImageVideoRectConfig = {
      image: new Set(["size", "sizing", "image", "appearance", "effects"]),
      video: new Set(["size", "sizing", "media", "appearance", "effects"]),
      rect: new Set(["size", "sizing", "appearance", "effects"]),
      oval: new Set(["size", "sizing", "appearance", "effects"]),
      line: new Set(["size", "sizing", "svgPaint", "appearance", "effects"]),
      arrow: new Set(["size", "sizing", "svgPaint", "appearance", "effects"]),
      pen: new Set(["size", "sizing", "svgPaint", "appearance", "effects"]),
      note: new Set(["size", "sizing", "text"]),
      title1: new Set(["size", "sizing", "text"]),
    };
    PropertiesAppearanceSectionWidthHeightPositionSet = new Set([
      "width",
      "height",
      "position",
      "top",
      "left",
    ]);
    PropertiesAppearanceSectionNoteTitle1Config = {
      note: new Set(),
      title1: new Set(["max-width", "max-height"]),
    };
    PropertiesAppearanceSectionImageProperties = new Set([
      "@src",
      "object-fit",
      "object-position",
    ]);
    PropertiesAppearanceSectionBoxShadowFilterBackdropFilterSet = new Set([
      "box-shadow",
      "filter",
      "backdrop-filter",
    ]);
    PropertiesAppearanceSectionFontSizeFontWeightSet = new Set([
      "font-size",
      "font-weight",
    ]);
    PropertiesAppearanceSectionHandler = (pixels?: Dynamic): Dynamic =>
      pixels === undefined ? "none" : String(pixels) + "px";
    PropertiesAppearanceSectionImageRectOvalConfig = {
      image: "img",
      rect: "div",
      oval: "div",
      line: "svg",
      arrow: "svg",
      pen: "svg",
      note: "p",
      title1: "h1",
    };
  };
}
