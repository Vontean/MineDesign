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
import { PropertiesSizingRowFlexStartStartCenterConfig, PropertiesSizingRowFlexStartStartCenterConfig_2 } from "./sizing-row";
import { PropertyOptionIcon } from "./tool-options";

var PropertiesBoxLayoutStaticRelativeAbsoluteConfig: Dynamic;
function unifiedBoxSideValues(
  input?: Dynamic,
  options?: Dynamic,
  context?: Dynamic,
): Dynamic {
  let value: Dynamic = ["top", "right", "bottom", "left"].map(
    (input2?: Dynamic): Dynamic =>
      input.find(
        (input3?: Dynamic): Dynamic => input3.prop === `${options}-${input2}`,
      ),
  );
  if (value.some((input2?: Dynamic): Dynamic => !input2)) return null;
  let value2: Dynamic = value,
    value3: Dynamic = null,
    items: Dynamic = [undefined, undefined, undefined, undefined];
  for (let index: Dynamic = 0; index < 4; index++) {
    let value4: Dynamic = (value2[index].value ?? "").trim();
    if (!value4 || value2[index].mixed) continue;
    let value5: Dynamic = parseCssNumber(value4);
    if (!value5) return null;
    let value6: Dynamic = value5.unit || "px";
    if (value3 != null && value3 !== value6) return null;
    value3 = value6;
    items[index] = value5.value;
  }
  let callback: Dynamic = (input2?: Dynamic): Dynamic => {
      let value4: Dynamic = parseCssNumber(
        input2.fallback ?? "",
      );
      if (!value4) return input2.fallback ?? "";
      let value5: Dynamic = value4.unit || "px";
      return formatCssNumber(
        roundCssNumber(value4.value, value4.unit),
        value5 === (context ?? value3 ?? "px") ? "" : value5,
      );
    },
    items2: Dynamic = [
      callback(value2[0]),
      callback(value2[1]),
      callback(value2[2]),
      callback(value2[3]),
    ];
  return {
    rows: value2,
    values: items,
    placeholders: items2,
    unit: value3 ?? "px",
    mixed: value2.some((input2?: Dynamic): Dynamic => input2.mixed),
    disabled: value2.some((input2?: Dynamic): Dynamic => input2.disabled),
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
  let value: Dynamic = inheritedFieldsDisabledReason(
      ...["top", "right", "bottom", "left"].map(
        (input?: Dynamic): Dynamic =>
          rows.find(
            (input2?: Dynamic): Dynamic => input2.prop === `${base}-${input}`,
          ),
      ),
    ),
    value2: Dynamic = inheritedFieldsDescription(
      ...["top", "right", "bottom", "left"].map(
        (input?: Dynamic): Dynamic =>
          rows.find(
            (input2?: Dynamic): Dynamic => input2.prop === `${base}-${input}`,
          ),
      ),
    ),
    value3: Dynamic = useStyleCommitScrub(
      (input?: Dynamic): Dynamic => onCommitMany(input),
    ),
    value4: Dynamic = unifiedBoxSideValues(rows, base),
    value5: Dynamic =
      value4 &&
      unifiedBoxSideValues(
        rows.map(
          (input?: Dynamic): Dynamic =>
            inheritedFieldForEdit(input),
        ),
        base,
        value4.unit,
      ),
    value6: Dynamic = value4 &&
      value5 && {
        ...value5,
        unit: value4.unit,
      };
  if (!value6)
    return (
      <jsxMediaPlaybackControls.Fragment>
        {renderRows(
          ["top", "right", "bottom", "left"]
            .map(
              (input?: Dynamic): Dynamic =>
                rows.find(
                  (input2?: Dynamic): Dynamic =>
                    input2.prop === `${base}-${input}`,
                ),
            )
            .filter((input?: Dynamic): Dynamic => !!input)
            .map(
              (input?: Dynamic): Dynamic => ({
                ...input,
                label: `${label} ${input.prop.slice(base.length + 1)}`,
              }),
            ),
        )}
      </jsxMediaPlaybackControls.Fragment>
    );
  let callback: Dynamic = (input?: Dynamic): Dynamic =>
      `${base}-${["top", "right", "bottom", "left"][input]}`,
    value7: Dynamic = value6.rows.some(
      PropertiesInheritedFieldMixedAlias,
    ),
    callback2: Dynamic = (input?: Dynamic): Dynamic =>
      input.map(
        (input2?: Dynamic): Dynamic => ({
          prop: callback(input2.side),
          value:
            input2.value === undefined
              ? null
              : formatCssNumber(input2.value, value6.unit),
        }),
      ),
    value8: Dynamic =
      getFineUnitStep(value6.unit, undefined) != null;
  return (
    <PropertySidesRow
      label={label}
      data-testid={`dc-${base}`}
      title={value}
      description={value2}
      values={value6.values}
      placeholders={value6.placeholders}
      unit={value6.unit}
      min={base === "padding" ? 0 : undefined}
      step={value8 ? 0.1 : undefined}
      smallStep={value8 ? 0.01 : undefined}
      mixed={value6.mixed}
      disabled={value6.disabled}
      onSides={(input?: Dynamic): Dynamic => onCommitMany(callback2(input))}
      onScrubSides={(input?: Dynamic): Dynamic =>
        value3.onScrub(callback2(input))
      }
      onScrubEnd={(): Dynamic => value3.onScrubEnd()}
      onReset={
        value7
          ? (): Dynamic =>
              onCommitMany([
                {
                  prop: base,
                  value: null,
                },
                ...[0, 1, 2, 3].map(
                  (input?: Dynamic): Dynamic => ({
                    prop: callback(input),
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
  let callback: Dynamic = (input?: Dynamic): Dynamic => {
    let value4: Dynamic = (input.value ?? "").trim();
    return (
      input.mixed || !value4 || parseCssNumber(value4) != null
    );
  };
  if (!callback(left) || !callback(top))
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
  let value: Dynamic = inheritedFieldsDisabledReason(left, top),
    value2: Dynamic = inheritedFieldsDescription(left, top);
  left = inheritedFieldForEdit(left);
  top = inheritedFieldForEdit(top);
  let callback2: Dynamic = (
      input?: Dynamic,
      options?: Dynamic,
      context?: Dynamic,
    ): Dynamic => {
      let value4: Dynamic = input.mixed
          ? null
          : parseCssNumber((input.value ?? "").trim()),
        value5: Dynamic = parseCssNumber(input.fallback ?? ""),
        value6: Dynamic = value4?.unit || value5?.unit || "px";
      return (
        <NumericInput
          aria-label={context}
          prefix={options}
          value={value4 ? value4.value : undefined}
          placeholder={
            input.mixed ? (undefined) : (value5 ? (formatCssNumber(
                    roundCssNumber(value5.value, value5.unit),
                    "",
                  )) : (input.fallback || (uiMessage("inspector.boxLayout.auto"))))
          }
          mixed={input.mixed}
          clearable={true}
          refuseLetters={true}
          ownUnit={value6}
          steppers={false}
          disabled={input.disabled}
          onValue={(input2?: Dynamic): Dynamic =>
            onCommitMany([
              {
                prop: input.prop,
                value:
                  input2 === undefined
                    ? null
                    : formatCssNumber(input2, value6),
              },
              ...((input2 !== undefined && input.alsoCommit) || []),
            ])
          }
        />
      );
    },
    value3: Dynamic =
      PropertiesInheritedFieldMixedAlias(left) ||
      PropertiesInheritedFieldMixedAlias(top);
  return (
    <PropertyRow
      label={uiMessage("inspector.boxLayout.offset")}
      data-testid={"dc-offset"}
      title={value}
      description={value2}
      onReset={
        value3 && !left.disabled
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
        {callback2(left, "X", uiMessage("inspector.boxLayout.offsetX"))}
        {callback2(top, "Y", uiMessage("inspector.boxLayout.offsetY"))}
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
  let value: Dynamic = inheritedFieldsDisabledReason(
      justify,
      align,
    ),
    value2: Dynamic = inheritedFieldsDescription(justify, align);
  justify = inheritedFieldForEdit(justify);
  align = inheritedFieldForEdit(align);
  let value3: Dynamic = (justify.mixed ? "" : (justify.value ?? ""))
      .trim()
      .toLowerCase(),
    value4: Dynamic = (align.mixed ? "" : (align.value ?? ""))
      .trim()
      .toLowerCase(),
    value5: Dynamic = value3.startsWith("space-"),
    value6: Dynamic =
      value5 ||
      (!value3 &&
        !justify.mixed &&
        (justify.fallback ?? "").trim().toLowerCase().startsWith("space-")),
    value7: Dynamic =
      justify.prop === "justify-items"
        ? ["start", "center", "end"]
        : ["flex-start", "center", "flex-end"],
    items: Dynamic = ["flex-start", "center", "flex-end"],
    callback: Dynamic = (input?: Dynamic): Dynamic =>
      justify.prop === "justify-items" &&
      (input === "normal" || input === "legacy")
        ? "stretch"
        : input === "start" || input === "left" || input === "normal"
          ? value7[0]
          : input === "end" || input === "right"
            ? value7[2]
            : input,
    callback2: Dynamic = (input?: Dynamic): Dynamic =>
      input === "start" || input === "self-start"
        ? "flex-start"
        : input === "end" || input === "self-end"
          ? "flex-end"
          : input,
    callback3: Dynamic = (input?: Dynamic): Dynamic =>
      input === "stretch" || input === "normal" || input === ""
        ? "flex-start"
        : callback2(input),
    value8: Dynamic = callback(
      value3 || (justify.fallback ?? "").trim().toLowerCase(),
    ),
    value9: Dynamic = callback3(
      value4 || (align.fallback ?? "").trim().toLowerCase(),
    ),
    value10: Dynamic = !!justify.disabled || !!align.disabled,
    value11: Dynamic =
      PropertiesInheritedFieldMixedAlias(justify) ||
      PropertiesInheritedFieldMixedAlias(align),
    callback4: Dynamic = (input?: Dynamic, options?: Dynamic): Dynamic =>
      input[options];
  return (
    <PropertyRow
      label={uiMessage("inspector.boxLayout.align")}
      data-testid={"dc-alignment"}
      title={
        justify.mixed || align.mixed ? (uiMessage("inspector.boxLayout.mixedAcrossTheSelection")) : (value)
      }
      description={justify.mixed || align.mixed ? (undefined) : (value2)}
      onReset={
        value11 && !value10
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
                  PropertiesSizingRowFlexStartStartCenterConfig[
                    "space-between"
                  ]
                }
              />
            }
            aria-label={uiMessage("inspector.boxLayout.distribute")}
            tooltip={
              value6 ? (uiMessage("inspector.boxLayout.distributeSpaceBetweenClickTo", { value1: String(value5 ? ("") : (uiMessage("inspector.boxLayout.inherited"))) })) : (uiMessage("inspector.boxLayout.distributeSpaceBetween"))
            }
            pressed={value6}
            disabled={value10}
            data-testid={"dc-distribute"}
            data-inherited={value6 && !value5 ? "" : undefined}
            className={cn("shrink-0", vertical && "rotate-90")}
            onClick={(): Dynamic =>
              onCommitMany([
                {
                  prop: justify.prop,
                  value: value6
                    ? value5
                      ? null
                      : value7[0]
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
            value6 ? (uiMessage("inspector.boxLayout.computedDistributeDecidesThisAxis")) : (undefined)
          }
          data-testid={"dc-justify-group"}
        >
          <PropertySegments
            label={uiMessage("inspector.boxLayout.justify")}
            compact={true}
            value={
              value6 || justify.mixed
                ? undefined
                : PropertiesInheritedFieldValueAlias(justify) &&
                    value7.includes(callback(value3))
                  ? callback(value3)
                  : undefined
            }
            inherited={
              value6 ||
              justify.mixed ||
              PropertiesInheritedFieldValueAlias(justify)
                ? undefined
                : value7.includes(value8)
                  ? value8
                  : undefined
            }
            mixed={!!justify.mixed}
            disabled={value10 || value6}
            vertical={vertical}
            onChange={(input?: Dynamic): Dynamic =>
              onCommitMany([
                {
                  prop: justify.prop,
                  value: input,
                },
              ])
            }
            options={value7.map(
              (input?: Dynamic, options?: Dynamic): Dynamic => ({
                value: input,
                get label() { return uiMessage("inspector.boxLayout.justify2", { value1: String(["start", "center", "end"][options]) }); },
                glyph: callback4(
                  PropertiesSizingRowFlexStartStartCenterConfig,
                  input,
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
                    items.includes(callback2(value4))
                  ? callback2(value4)
                  : undefined
            }
            inherited={
              align.mixed ||
              PropertiesInheritedFieldValueAlias(align)
                ? undefined
                : items.includes(value9)
                  ? value9
                  : undefined
            }
            mixed={!!align.mixed}
            disabled={value10}
            vertical={vertical}
            onChange={(input?: Dynamic): Dynamic =>
              onCommitMany([
                {
                  prop: align.prop,
                  value: input,
                },
              ])
            }
            options={items.map(
              (input?: Dynamic, options?: Dynamic): Dynamic => ({
                value: input,
                get label() { return uiMessage("inspector.boxLayout.align2", { value1: String(["start", "center", "end"][options]) }); },
                glyph: callback4(
                  PropertiesSizingRowFlexStartStartCenterConfig_2,
                  input,
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
