import { useUiLocale } from '../../ui-locale.ts';
import { uiMessage } from '@minedesign/contracts/ui-messages';
/** Restored application module; prepare first, initialize in original order. */
import {
  type Dynamic,
} from "../../runtime-types";
import { SegmentedControl } from "../../cds/components/selection-points";
import { DisabledReasonTooltip } from "../../cds/tooltip/tooltip";
import { joinClassNames } from "../chrome/overlay-state";
import { ColorContrastCopyLabel_2, ColorContrastCopyLabel_3, TypeValue } from "../color/contrast-copy";
import { alphaCheckerboardBackground, ColorSwatchRow, hsvaToRgbaCss, parseHsvaColor, PickerListGroup, PickerListHeader } from "../color/picker-primitives";
import { ColorHexInput, ColorPicker } from "../color/picker";
import { jsxPropertiesGradientEditor, PropertiesGradientEditorColorMixPattern, PropertiesGradientEditorImageCrossFadePattern, PropertiesGradientEditorLabel } from "./gradient-editor";
import { PropertiesNumericInputLimit } from "./numeric-input";
import { pickerSearchInitialIndex, PickerSearchInput, pickerSearchKeyHandler, pickerSearchMatches } from "./picker-search";
import { PropertyRow } from "./row";
import { PropertiesSelectOnKeyDownCaptureConfig } from "./select";
import { toolSegmentOption } from "./tool-options";
import { reactPropertiesTooltip } from "./tooltip";

var PropertiesColorSwatchesEmpty: Dynamic;
var PropertiesColorSwatchesTest: Dynamic;
var PropertiesColorSwatchesLimit: Dynamic;
var NoneValue: Dynamic;
function colorWellStyle(input?: Dynamic): Dynamic {
  if (input === undefined) return;
  if (
    /gradient\(/.test(input) &&
    !PropertiesGradientEditorImageCrossFadePattern.test(input)
  )
    return {
      background: input,
    };
  if (
    PropertiesGradientEditorColorMixPattern.test(input) &&
    !PropertiesGradientEditorImageCrossFadePattern.test(input)
  )
    return {
      backgroundColor: input,
    };
  let value: Dynamic = (0, parseHsvaColor)(input),
    value2: Dynamic = (0, hsvaToRgbaCss)(value);
  return value.a < 1
    ? {
        background: `linear-gradient(${value2}, ${value2}), ${alphaCheckerboardBackground}`,
      }
    : {
        backgroundColor: value2,
      };
}
function normalizedPaintKey(input?: Dynamic): Dynamic {
  return PropertiesGradientEditorColorMixPattern.test(input)
    ? "sym:" + input.trim()
    : (0, hsvaToRgbaCss)((0, parseHsvaColor)(input));
}
function samePaint(input?: Dynamic, options?: Dynamic): Dynamic {
  return normalizedPaintKey(input) === normalizedPaintKey(options);
}
function mergeDesignSystemSwatches(
  input?: Dynamic,
  options?: Dynamic,
): Dynamic {
  if (input === undefined || input.colors.length === 0) return [...options];
  let value: Dynamic = options.findIndex(
      (input2?: Dynamic): Dynamic => !PropertiesColorSwatchesEmpty(input2),
    ),
    value2: Dynamic = (value < 0 ? options : options.slice(0, value)).map(
      (input2?: Dynamic): Dynamic =>
        input2.group === undefined
          ? input2
          : {
              ...input2,
              group: input.label,
              subgroup: undefined,
            },
    ),
    value3: Dynamic = value < 0 ? [] : options.slice(value),
    entries: Dynamic = new Map(),
    entries2: Dynamic = new Map();
  for (let value4 of value3 as Dynamic) {
    if (
      PropertiesColorSwatchesEmpty(value4) ||
      PropertiesColorSwatchesTest(value4) ||
      value4.picks !== undefined
    )
      continue;
    let value5: Dynamic = normalizedPaintKey(value4.color);
    entries.has(value5) || entries.set(value5, value4);
    let value6: Dynamic = (value4.label ?? value4.name).replace(/^--/, "");
    entries2.set(value6, [...(entries2.get(value6) ?? []), value4]);
  }
  let callback: Dynamic = (input2?: Dynamic, options2?: Dynamic): Dynamic => {
      let value4: Dynamic = entries2.get(input2) ?? [];
      return value4.length <= 1 ||
        value4.every(
          (input3?: Dynamic): Dynamic =>
            normalizedPaintKey(input3.color) ===
            normalizedPaintKey(value4[0].color),
        )
        ? value4[0]
        : options2 === undefined
          ? undefined
          : value4.find(
              (input3?: Dynamic): Dynamic =>
                normalizedPaintKey(input3.color) ===
                normalizedPaintKey(options2),
            );
    },
    values: Dynamic = new Set(),
    items: Dynamic = [];
  for (let value4 of input.colors as Dynamic) {
    if (items.length >= PropertiesColorSwatchesLimit) break;
    let value5: Dynamic = /^var\(\s*--([\w-]+)\s*(?:,\s*(.+?)\s*)?\)$/.exec(
        value4,
      ),
      value6: Dynamic =
        value5 !== null
          ? callback(value5[1], value5[2])
          : entries.get(normalizedPaintKey(value4));
    value6 === undefined ||
      values.has(value6.name) ||
      (values.add(value6.name),
      items.push({
        name: "used:" + value6.name,
        color: value6.color,
        label: value6.label ?? value6.name,
        group: input.label,
        picks: value6.name,
      }));
  }
  return items.length === 0 ? [...options] : [...value2, ...items, ...value3];
}
function ColorSwatchPicker({
  title: title,
  swatches: swatches,
  current: current,
  repick = false,
  onSwatch: onSwatch,
  onPicked: onPicked,
  fold = false,
  color: color,
  kind: kind,
  face: face,
  tab: tab,
  onTab: onTab,
  headerEnd: headerEnd,
  heading: heading,
  headless = false,
  testid: testid,
  className: className,
}: Dynamic): Dynamic {
  useUiLocale();
  let value: Dynamic = swatches.some(
      (input?: Dynamic): Dynamic => !PropertiesColorSwatchesEmpty(input),
    ),
    value2: Dynamic = value && color !== undefined,
    value3: Dynamic =
      kind !== undefined && kind.options.length > 1 ? kind : undefined,
    value4: Dynamic =
      value3 === undefined || value3.value === (value3.colorValue ?? "color"),
    [value5, value6]: Dynamic = (0, reactPropertiesTooltip.useState)(
      (): Dynamic => (value && value4 ? "system" : "custom"),
    ),
    value7: Dynamic = value2
      ? (tab ?? value5)
      : color === undefined
        ? "system"
        : "custom",
    callback: Dynamic = (input?: Dynamic): Dynamic => {
      value6(input);
      onTab?.(input);
    },
    value8: Dynamic =
      value2 &&
      (swatches.some(
        (input?: Dynamic): Dynamic => input.subgroup !== undefined,
      ) ||
        swatches.length > PropertiesNumericInputLimit),
    [value9, value10]: Dynamic = (0, reactPropertiesTooltip.useState)(
      "",
    ),
    value11: Dynamic = value8 ? value9.trim().toLowerCase() : "",
    value12: Dynamic = JSON.stringify(
      swatches.map(
        (input?: Dynamic): Dynamic => [
          input.name,
          input.color,
          input.label,
          input.group,
          input.subgroup,
          input.empty === true,
          input.disabledReason ?? null,
          input.picks ?? null,
        ],
      ),
    ),
    { shown: value13, foldedInto: value14 }: Dynamic = (0,
    reactPropertiesTooltip.useMemo)((): Dynamic => {
      let entries: Dynamic = new Map(),
        entries2: Dynamic = new Map(),
        items: Dynamic = [];
      for (let value21 of swatches as Dynamic) {
        if (PropertiesColorSwatchesEmpty(value21) || !fold) {
          items.push(value21);
          continue;
        }
        let value22: Dynamic = normalizedPaintKey(value21.color),
          entry: Dynamic = entries.get(value22);
        if (entry !== undefined && PropertiesColorSwatchesTest(value21)) {
          entries2.set(value21.name, entry);
          continue;
        }
        entry === undefined && entries.set(value22, value21.name);
        items.push(value21);
      }
      return {
        shown: items,
        foldedInto: entries2,
      };
    }, [value12, fold]),
    value15: Dynamic =
      current !== null ? (value14.get(current) ?? current) : null,
    value16: Dynamic = value13.filter(
      (input?: Dynamic): Dynamic =>
        (0, pickerSearchMatches)(
          value11,
          (0, PropertiesGradientEditorLabel)(input),
          input.color,
          input.subgroup,
          input.group,
        ),
    ),
    value17: Dynamic = value8 ? (
      <PickerSearchInput
        value={value9}
        onChange={value10}
        label={ColorContrastCopyLabel_2}
        className={"mt-1 mb-2 w-0 min-w-full"}
        rowSelector={"[data-swatch]"}
        onEnterIndex={(): Dynamic =>
          (0, pickerSearchInitialIndex)(
            value11,
            value16
              .filter(
                (input?: Dynamic): Dynamic =>
                  input.disabledReason === undefined,
              )
              .map(
                (input?: Dynamic): Dynamic =>
                  (0, PropertiesGradientEditorLabel)(input),
              ),
          )
        }
        data-testid={testid !== undefined ? testid + "-search" : undefined}
      />
    ) : null,
    callback2: Dynamic = (input?: Dynamic): Dynamic => {
      let value21: Dynamic = (
        <ColorSwatchRow
          label={(0, PropertiesGradientEditorLabel)(input)}
          data-testid={
            testid !== undefined ? testid + "-" + input.name : undefined
          }
          data-swatch={input.name}
          paint={
            input.empty === true ? undefined : colorWellStyle(input.color)
          }
          current={
            input.name === value15 ||
            (input.picks !== undefined && input.picks === value15)
          }
          disabled={input.disabledReason !== undefined}
          onMouseDown={(event?: Dynamic): Dynamic => event.preventDefault()}
          onClick={(): Dynamic => {
            onPicked?.();
            (repick ||
              (input.picks ?? input.name) !== current ||
              PropertiesColorSwatchesEmpty(input)) &&
              onSwatch(input.picks ?? input.name);
          }}
        />
      );
      return input.disabledReason === undefined ? (
        value21
      ) : (
        <DisabledReasonTooltip
          reason={input.disabledReason}
          wrapperClassName={"flex w-full shrink-0 cursor-not-allowed"}
        >
          {value21}
        </DisabledReasonTooltip>
      );
    },
    callback3: Dynamic = (input?: Dynamic, options?: Dynamic): Dynamic => (
      <PickerListGroup
        label={title}
        className={(0, joinClassNames)("w-0 min-w-full", options)}
      >
        {input.map((input2?: Dynamic, options2?: Dynamic): Dynamic => {
          let value21: Dynamic =
              input2.group !== undefined &&
              input2.group !== input[options2 - 1]?.group,
            value22: Dynamic =
              input2.subgroup !== undefined &&
              (value21 || input2.subgroup !== input[options2 - 1]?.subgroup);
          return (() => {
            const _Component = reactPropertiesTooltip.Fragment;
            const _props = {
              children: [
                value21 ? (
                  <PickerListHeader
                    text={input2.group}
                    title={true}
                  />
                ) : null,
                value22 ? (
                  <PickerListHeader text={input2.subgroup} />
                ) : null,
                callback2(input2),
              ],
            } as const;
            const _key = input2.name + ":" + String(options2);
            return <_Component key={_key} {..._props} />;
          })();
        })}
      </PickerListGroup>
    ),
    value18: Dynamic =
      !headless && (value2 || headerEnd !== undefined) ? (
        <div
          className={(0, joinClassNames)(
            "-mx-2 -mt-2 mb-1 flex items-center justify-between gap-2",
            !value2 && "order-first",
          )}
          data-kit={"color-popover-header"}
        >
          {value2 ? (<ColorHexInput
              value={value7}
              onChange={callback}
              className={""}
            />) : (<span
              className={
                "min-w-0 flex-1 truncate pl-2 text-body-semibold text-primary"
              }
            >
              {heading}
            </span>)}
          {title !== undefined && value2 ? (<span className={"sr-only"}>{title}</span>) : (null)}
          {headerEnd}
        </div>
      ) : null,
    value19: Dynamic = !value2 && color !== undefined ? value13 : [],
    value20: Dynamic = (
      <jsxPropertiesGradientEditor.Fragment>
        {value19.length > 0 ? (<div className={"-mx-2 mb-1 flex flex-col"}>
            {callback3(value19)}
          </div>) : (null)}
        {value3 !== undefined ? (<PropertyRow
            label={TypeValue}
            className={value4 ? "mb-1" : undefined}
            {...PropertiesSelectOnKeyDownCaptureConfig}
          >
            <SegmentedControl
              aria-label={value3.label ?? (uiMessage("inspector.colorSwatches.fillType"))}
              fullWidth={true}
              segments={value3.options.map(
                (input?: Dynamic): Dynamic => ({
                  ...(0, toolSegmentOption)(
                    input.value,
                    input.label,
                    value3.disabled === true ||
                      input.disabledReason !== undefined
                      ? true
                      : undefined,
                  ),
                  ...(input.disabledReason !== undefined
                    ? {
                        disabledReason: input.disabledReason,
                      }
                    : {}),
                }),
              )}
              value={value3.value}
              onChange={(input?: Dynamic): Dynamic =>
                input !== value3.value &&
                !value3.disabled &&
                value3.onChange(input)
              }
            />
          </PropertyRow>) : (null)}
        {value4 && color !== undefined ? (<ColorPicker {...color} />) : (face)}
      </jsxPropertiesGradientEditor.Fragment>
    );
  return (
    <div
      data-kit={"color-selector"}
      data-search-scope={""}
      onKeyDown={(0, pickerSearchKeyHandler)("[data-swatch]")}
      className={(0, joinClassNames)(
        "flex min-w-56 flex-col [--pp-gutter-l:0px] [--pp-gutter-r:0px] [--pp-label-w:3rem]",
        className,
      )}
    >
      {value2 ? (value18) : (null)}
      {value7 === "system" ? (<div
          className={(0, joinClassNames)(
            "flex min-h-0 flex-col",
            value2 ? "-mx-2" : "-m-2",
          )}
        >
          {value17}
          {value16.length > 0 ? (callback3(
              value16,
              value2
                ? "mb-[calc(-1*var(--cs-bottom,16px))] pb-[var(--cs-bottom,16px)]"
                : undefined,
            )) : (<p
              role={"status"}
              className={"px-2 py-1 text-footnote text-muted"}
            >
              {ColorContrastCopyLabel_3}
            </p>)}
        </div>) : (value20)}
      {value2 ? (null) : (value18)}
    </div>
  );
}
function normalizeColorSwatches(
  input?: Dynamic,
  options?: Dynamic,
  context?: Dynamic,
): Dynamic {
  let value: Dynamic = (input ?? []).map(
    (input2?: Dynamic): Dynamic =>
      typeof input2 == "string"
        ? {
            name: input2,
            color: input2,
          }
        : "value" in input2
          ? {
              name: input2.name,
              color: input2.value,
              label: input2.label,
              group: input2.group,
              subgroup: input2.subgroup,
              ...(input2.picks !== undefined
                ? {
                    picks: input2.picks,
                  }
                : {}),
            }
          : input2,
  );
  if (!options) return value;
  let state: Dynamic = {
    name: NoneValue,
    get label() { return uiMessage("inspector.colorSwatches.none"); },
    color: "transparent",
    empty: true,
    group: value[0]?.group,
    subgroup: value[0]?.subgroup,
  };
  context !== undefined && (state.disabledReason = context);
  return [state, ...value];
}
export {
  ColorSwatchPicker,
  colorWellStyle,
  mergeDesignSystemSwatches,
  NoneValue,
  normalizeColorSwatches,
  normalizedPaintKey,
  PropertiesColorSwatchesEmpty,
  PropertiesColorSwatchesLimit,
  PropertiesColorSwatchesTest,
  samePaint,
};
export function installEditorPropertiesColorSwatches(): () => void {
  return () => {
    PropertiesColorSwatchesEmpty = (input?: Dynamic): Dynamic =>
      input.empty === true || input.name === "default";
    PropertiesColorSwatchesTest = (input?: Dynamic): Dynamic =>
      /^(#|rgba?\(|hsla?\()/i.test((input.label ?? input.name).trim());
    PropertiesColorSwatchesLimit = 12;
    NoneValue = ":none";
  };
}
