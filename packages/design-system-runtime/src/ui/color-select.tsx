import { useUiLocale } from '../ui-locale.ts';
import { uiMessage } from '@minedesign/contracts/ui-messages';
import type * as React from "react";
import type * as Color from "../contracts/color-controls";
/** Restored application module; prepare first, initialize in original order. */
import { loadJsxNamespace } from "../dependencies";
import { toModuleNamespace } from "../module-helpers";
import { announceLiveMessage } from "./announcements";
import { DisabledReasonTooltip } from "./avatars";
import { contrastDisplayInfo } from "./color/contrast-controls";
import { colorContrastResults } from "./color/contrast";
import { gradientStopKeyboardHandlers } from "./color/gradient-stops";
import { COLOR_ALPHA_CHECKERBOARD, ColorHexInput, ColorPicker, ColorPickerGroup, ColorPickerHeader, hsvaToCssColor, parseCssColorToHsva, rgbaHexColor, SwatchButton } from "./color/picker";
import { ColorSelectReact, fillModeOption } from "./inspector-icons";
import { joinClassNames } from "./property-icons";
import { get_COLOR_SEARCH_LABEL, get_NO_COLOR_MATCHES_LABEL, TYPE_LABEL } from "./property-labels";
import { PropertyRow } from "./property-row";
import { COMMENT_AREA_RESIZE_MIN_PX, createOptionListKeyHandler, OptionList, optionMatchesQuery, optionTypeaheadMatch } from "./property-search";
import { SegmentedControl } from "./segmented-control";

var jsxColorSelectPrimitives: typeof import("react/jsx-runtime");
var ColorSelectJsx: typeof import("react/jsx-runtime");
var symbolicColorPattern: RegExp;
var unsafeColorPattern: RegExp;
var swatchLabel: (swatch: Color.ColorSwatch) => string;
var isEmptySwatch: (swatch: Color.ColorSwatch) => boolean;
var swatchLabelIsColor: (swatch: Color.ColorSwatch) => boolean;
var emptySwatchValue: string;
function swatchPreviewStyle(
  input: string | undefined,
): React.CSSProperties | undefined {
  if (input === undefined) {
    return;
  }
  if (/gradient\(/.test(input) && !unsafeColorPattern.test(input)) {
    return {
      background: input,
    };
  }
  if (symbolicColorPattern.test(input) && !unsafeColorPattern.test(input)) {
    return {
      backgroundColor: input,
    };
  }
  let value = (0, parseCssColorToHsva)(input),
    value2 = (0, hsvaToCssColor)(value);
  if (value.a < 1) {
    return {
      background: `linear-gradient(${value2}, ${value2}), ${COLOR_ALPHA_CHECKERBOARD}`,
    };
  } else {
    return {
      backgroundColor: value2,
    };
  }
}
function swatchColorKey(color: string): string {
  if (symbolicColorPattern.test(color)) {
    return "sym:" + color.trim();
  } else {
    return (0, hsvaToCssColor)(
      (0, parseCssColorToHsva)(color),
    );
  }
}
function SwatchPalette({
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
}: Color.SwatchPaletteProps): React.ReactElement {
  useUiLocale();
  let value = swatches.some((input) => !isEmptySwatch(input)),
    value2 = value && color !== undefined,
    value3 = kind !== undefined && kind.options.length > 1 ? kind : undefined,
    value4 =
      value3 === undefined || value3.value === (value3.colorValue ?? "color"),
    [value5, value6] = (ColorSelectReact as typeof React).useState(
      () => (value && value4 ? "system" : "custom"),
    ),
    value7 = !value2
      ? color === undefined
        ? "system"
        : "custom"
      : (tab ?? value5),
    callback = (input: string) => {
      value6(input);
      onTab?.(input);
    },
    value8 =
      value2 &&
      (swatches.some((input) => input.subgroup !== undefined) ||
        swatches.length > COMMENT_AREA_RESIZE_MIN_PX),
    [value9, value10] = (ColorSelectReact as typeof React).useState(
      "",
    ),
    value11 = value8 ? value9.trim().toLowerCase() : "",
    value12 = JSON.stringify(
      swatches.map((input) => [
        input.name,
        input.color,
        input.label,
        input.group,
        input.subgroup,
        input.empty === true,
        input.disabledReason ?? null,
        input.picks ?? null,
      ]),
    ),
    { shown: memo, foldedInto: memo2 } = (
      ColorSelectReact as typeof React
    ).useMemo(() => {
      let entries = new Map<string, string>(),
        entries2 = new Map<string, string>(),
        items: Color.ColorSwatch[] = [];
      for (let value19 of swatches) {
        if (isEmptySwatch(value19) || !fold) {
          items.push(value19);
          continue;
        }
        let value20 = swatchColorKey(value19.color),
          entry = entries.get(value20);
        if (entry !== undefined && swatchLabelIsColor(value19)) {
          entries2.set(value19.name, entry);
          continue;
        }
        if (entry === undefined) {
          entries.set(value20, value19.name);
        }
        items.push(value19);
      }
      return {
        shown: items,
        foldedInto: entries2,
      };
    }, [value12, fold]),
    value13 = current !== null ? (memo2.get(current) ?? current) : null,
    value14 = memo.filter((input) =>
      (0, optionMatchesQuery)(
        value11,
        swatchLabel(input),
        input.color,
        input.subgroup,
        input.group,
      ),
    ),
    value15 = value8 ? (
      <OptionList
        value={value9}
        onChange={value10}
        label={get_COLOR_SEARCH_LABEL()}
        className={"mt-1 mb-2 w-0 min-w-full"}
        rowSelector={"[data-swatch]"}
        onEnterIndex={() =>
          (0, optionTypeaheadMatch)(
            value11,
            value14
              .filter((input) => input.disabledReason === undefined)
              .map((input) => swatchLabel(input)),
          )
        }
        data-testid={testid !== undefined ? testid + "-search" : undefined}
      />
    ) : null,
    callback2 = (input: Color.ColorSwatch) => {
      let value19 = (
        <SwatchButton
          label={swatchLabel(input)}
          data-testid={
            testid !== undefined ? testid + "-" + input.name : undefined
          }
          data-swatch={input.name}
          paint={
            input.empty === true ? undefined : swatchPreviewStyle(input.color)
          }
          current={
            input.name === value13 ||
            (input.picks !== undefined && input.picks === value13)
          }
          disabled={input.disabledReason !== undefined}
          onMouseDown={(event: React.MouseEvent<HTMLButtonElement>) =>
            event.preventDefault()
          }
          onClick={() => {
            onPicked?.();
            if (
              repick ||
              (input.picks ?? input.name) !== current ||
              isEmptySwatch(input)
            ) {
              onSwatch(input.picks ?? input.name);
            }
          }}
        />
      );
      if (input.disabledReason === undefined) {
        return value19;
      } else {
        return (
          <DisabledReasonTooltip
            reason={input.disabledReason}
            wrapperClassName={"flex w-full shrink-0 cursor-not-allowed"}
          >
            {value19}
          </DisabledReasonTooltip>
        );
      }
    },
    callback3 = (input: Color.ColorSwatch[], options?: string) => (
      <ColorPickerGroup
        label={title}
        className={(0, joinClassNames)("w-0 min-w-full", options)}
      >
        {input.map((input2, options2) => {
          let value19 =
              input2.group !== undefined &&
              input2.group !== input[options2 - 1]?.group,
            value20 =
              input2.subgroup !== undefined &&
              (value19 || input2.subgroup !== input[options2 - 1]?.subgroup);
          return (() => {
            const _Element = (ColorSelectReact as typeof React)
              .Fragment;
            const _elementProps = {
              children: [
                value19 ? (
                  <ColorPickerHeader
                    text={input2.group}
                    title={true}
                  />
                ) : null,
                value20 ? (
                  <ColorPickerHeader text={input2.subgroup} />
                ) : null,
                callback2(input2),
              ],
            };
            const _elementKey = input2.name + ":" + String(options2);
            return <_Element key={_elementKey} {..._elementProps} />;
          })();
        })}
      </ColorPickerGroup>
    ),
    value16 =
      !headless && (value2 || headerEnd !== undefined) ? (
        <div
          className={(0, joinClassNames)(
            "-mx-2 -mt-2 mb-1 flex items-center justify-between gap-2",
            !value2 && "order-first",
          )}
          data-kit={"color-popover-header"}
        >
          {[value2 ? (
              <ColorHexInput
                value={value7}
                onChange={callback}
                className={""}
              />
            ) : (
              <span
                className={
                  "min-w-0 flex-1 truncate pl-2 text-body-semibold text-primary"
                }
              >
                {heading}
              </span>
            ), title !== undefined && value2 ? (
              <span className={"sr-only"}>{title}</span>
            ) : null, headerEnd]}
        </div>
      ) : null,
    value17 = !value2 && color !== undefined ? memo : [],
    value18 = (
      <ColorSelectJsx.Fragment>
        {[value17.length > 0 ? (
            <div className={"-mx-2 mb-1 flex flex-col"}>
              {callback3(value17)}
            </div>
          ) : null, value3 !== undefined ? (
            <PropertyRow
              label={TYPE_LABEL}
              className={value4 ? "mb-1" : undefined}
              {...gradientStopKeyboardHandlers}
            >
              <SegmentedControl
                aria-label={value3.label ?? (uiMessage("design-system.colorSelect.fillType"))}
                fullWidth={true}
                segments={value3.options.map((input) => ({
                  ...(0, fillModeOption)(
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
                }))}
                value={value3.value}
                onChange={(input: string) =>
                  input !== value3.value &&
                  !value3.disabled &&
                  value3.onChange(input)
                }
              />
            </PropertyRow>
          ) : null, value4 && color !== undefined ? (
            <ColorPicker {...color} />
          ) : (
            face
          )]}
      </ColorSelectJsx.Fragment>
    );
  return (
    <div
      data-kit={"color-selector"}
      data-search-scope={""}
      onKeyDown={(0, createOptionListKeyHandler)("[data-swatch]")}
      className={(0, joinClassNames)(
        "flex min-w-56 flex-col [--pp-gutter-l:0px] [--pp-gutter-r:0px] [--pp-label-w:3rem]",
        className,
      )}
    >
      {[value2 ? value16 : null, value7 === "system" ? (
          <div
            className={(0, joinClassNames)(
              "flex min-h-0 flex-col",
              value2 ? "-mx-2" : "-m-2",
            )}
          >
            {[value15, value14.length > 0 ? (
                callback3(
                  value14,
                  value2
                    ? "mb-[calc(-1*var(--cs-bottom,16px))] pb-[var(--cs-bottom,16px)]"
                    : undefined,
                )
              ) : (
                <p
                  role={"status"}
                  className={"px-2 py-1 text-footnote text-muted"}
                >
                  {get_NO_COLOR_MATCHES_LABEL()}
                </p>
              )]}
          </div>
        ) : (
          value18
        ), value2 ? null : value16]}
    </div>
  );
}
function normalizeColorSwatches(
  swatches: Color.ColorSwatchInput[] | undefined,
  allowEmpty?: boolean,
  disabledReason?: React.ReactNode,
): Color.ColorSwatch[] {
  let value = (swatches ?? []).map((input) =>
    typeof input === "string"
      ? {
          name: input,
          color: input,
        }
      : "value" in input
        ? {
            name: input.name,
            color: input.value,
            label: input.label,
            group: input.group,
            subgroup: input.subgroup,
            ...(input.picks !== undefined
              ? {
                  picks: input.picks,
                }
              : {}),
          }
        : input,
  );
  if (!allowEmpty) {
    return value;
  }
  let state: Color.ColorSwatch = {
    name: emptySwatchValue,
    get label() { return uiMessage("design-system.colorSelect.none"); },
    color: "transparent",
    empty: true,
    group: value[0]?.group,
    subgroup: value[0]?.subgroup,
  };
  if (disabledReason !== undefined) {
    state.disabledReason = disabledReason;
  }
  return [state, ...value];
}
function ColorSelect({
  value: value,
  unset: unset,
  opaque: opaque,
  onChange: onChange,
  onPickEnd: onPickEnd,
  contrast: contrast,
  swatches: swatches,
  none: none,
  current: current,
  onSwatch: onSwatch,
  ...props
}: Color.ColorSelectProps): React.ReactElement {
  useUiLocale();
  let memo = (ColorSelectReact as typeof React).useMemo(
      () =>
        normalizeColorSwatches(
          swatches,
          none !== undefined,
          none?.disabledReason,
        ),
      [swatches, none !== undefined, none?.disabledReason],
    ),
    callback = (input: string) =>
      (0, rgbaHexColor)({
        ...(0, parseCssColorToHsva)(input),
        ...(opaque
          ? {
              a: 1,
            }
          : {}),
      }),
    value2 = JSON.stringify(memo.map((input) => [input.name, input.color])),
    memo2 = (ColorSelectReact as typeof React).useMemo(
      () =>
        memo.map((input) =>
          input.empty === true ? null : callback(input.color),
        ),
      [value2, opaque],
    ),
    memo3 = (ColorSelectReact as typeof React).useMemo(() => {
      if (none?.current) {
        return emptySwatchValue;
      }
      if (current !== undefined) {
        return current;
      }
      if (unset) {
        return null;
      }
      let value3 = callback(value),
        value4 = memo2.indexOf(value3);
      if (value4 < 0) {
        return null;
      } else {
        return memo[value4].picks ?? memo[value4].name;
      }
    }, [memo, memo2, value, unset, opaque, none?.current, current]);
  return (
    <SwatchPalette
      {...props}
      swatches={memo}
      current={memo3}
      onSwatch={(input: string) => {
        if (input === emptySwatchValue) {
          return none?.onPick();
        }
        if (onSwatch !== undefined) {
          return onSwatch(input);
        }
        let value3 = memo.find((input2) => input2.name === input);
        if (value3 === undefined) {
          return;
        }
        let value4 = callback(value3.color);
        onChange(value4);
        onPickEnd?.(value4);
        if (contrast !== undefined) {
          (0, announceLiveMessage)(() => {
            let value5 = (0, colorContrastResults)(value4, contrast);
            if (value5 === undefined) {
              return null;
            } else {
              return (0, contrastDisplayInfo)(value5).spoken;
            }
          });
        }
      }}
      color={{
        value: value,
        unset: unset,
        opaque: opaque,
        onChange: onChange,
        onPickEnd: onPickEnd,
        contrast: contrast,
      }}
    />
  );
}
export {
  ColorSelect,
  ColorSelectJsx,
  emptySwatchValue,
  isEmptySwatch,
  jsxColorSelectPrimitives,
  normalizeColorSwatches,
  swatchColorKey,
  swatchLabel,
  swatchLabelIsColor,
  SwatchPalette,
  swatchPreviewStyle,
  symbolicColorPattern,
  unsafeColorPattern,
};
export function installUiColorSelect(): () => void {
  return () => {
    jsxColorSelectPrimitives = (0, toModuleNamespace)(
      (0, loadJsxNamespace)(),
      1,
    );
    ColorSelectJsx = (0, toModuleNamespace)(
      (0, loadJsxNamespace)(),
      1,
    );
    symbolicColorPattern = /^\s*(var|color-mix)\(/i;
    unsafeColorPattern =
      /url\s*\(|image(-set)?\s*\(|src\s*\(|cross-fade\s*\(|element\s*\(|\\/i;
    swatchLabel = (input) =>
      input.label ?? input.name[0].toUpperCase() + input.name.slice(1);
    isEmptySwatch = (input) => input.empty === true || input.name === "default";
    swatchLabelIsColor = (input) =>
      /^(#|rgba?\(|hsla?\()/i.test((input.label ?? input.name).trim());
    emptySwatchValue = ":none";
  };
}
