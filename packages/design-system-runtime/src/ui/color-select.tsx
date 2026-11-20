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
  cssColor: string | undefined,
): React.CSSProperties | undefined {
  if (cssColor === undefined) {
    return;
  }
  if (/gradient\(/.test(cssColor) && !unsafeColorPattern.test(cssColor)) {
    return {
      background: cssColor,
    };
  }
  if (symbolicColorPattern.test(cssColor) && !unsafeColorPattern.test(cssColor)) {
    return {
      backgroundColor: cssColor,
    };
  }
  let value = parseCssColorToHsva(cssColor),
    colorWithAlpha = hsvaToCssColor(value);
  if (value.a < 1) {
    return {
      background: `linear-gradient(${colorWithAlpha}, ${colorWithAlpha}), ${COLOR_ALPHA_CHECKERBOARD}`,
    };
  } else {
    return {
      backgroundColor: colorWithAlpha,
    };
  }
}
function swatchColorKey(color: string): string {
  if (symbolicColorPattern.test(color)) {
    return "sym:" + color.trim();
  } else {
    return hsvaToCssColor(
      parseCssColorToHsva(color),
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
  let value = swatches.some((swatch) => !isEmptySwatch(swatch)),
    hasSwatchTabs = value && color !== undefined,
    fillKind = kind !== undefined && kind.options.length > 1 ? kind : undefined,
    showColorControls =
      fillKind === undefined || fillKind.value === (fillKind.colorValue ?? "color"),
    [internalTab, setInternalTab] = (ColorSelectReact as typeof React).useState(
      () => (value && showColorControls ? "system" : "custom"),
    ),
    selectedTab = !hasSwatchTabs
      ? color === undefined
        ? "system"
        : "custom"
      : (tab ?? internalTab),
    callback = (nextTab: string) => {
      setInternalTab(nextTab);
      onTab?.(nextTab);
    },
    showSwatchSearch =
      hasSwatchTabs &&
      (swatches.some((swatch) => swatch.subgroup !== undefined) ||
        swatches.length > COMMENT_AREA_RESIZE_MIN_PX),
    [searchQuery, setSearchQuery] = (ColorSelectReact as typeof React).useState(
      "",
    ),
    normalizedQuery = showSwatchSearch ? searchQuery.trim().toLowerCase() : "",
    swatchCacheKey = JSON.stringify(
      swatches.map((swatch) => [
        swatch.name,
        swatch.color,
        swatch.label,
        swatch.group,
        swatch.subgroup,
        swatch.empty === true,
        swatch.disabledReason ?? null,
        swatch.picks ?? null,
      ]),
    ),
    { shown: memo, foldedInto: foldedSwatches } = (
      ColorSelectReact as typeof React
    ).useMemo(() => {
      let entries = new Map<string, string>(),
        aliases = new Map<string, string>(),
        items: Color.ColorSwatch[] = [];
      for (let swatch of swatches) {
        if (isEmptySwatch(swatch) || !fold) {
          items.push(swatch);
          continue;
        }
        let colorKey = swatchColorKey(swatch.color),
          entry = entries.get(colorKey);
        if (entry !== undefined && swatchLabelIsColor(swatch)) {
          aliases.set(swatch.name, entry);
          continue;
        }
        if (entry === undefined) {
          entries.set(colorKey, swatch.name);
        }
        items.push(swatch);
      }
      return {
        shown: items,
        foldedInto: aliases,
      };
    }, [swatchCacheKey, fold]),
    selectedSwatch = current !== null ? (foldedSwatches.get(current) ?? current) : null,
    matchingSwatches = memo.filter((swatch) =>
      optionMatchesQuery(
        normalizedQuery,
        swatchLabel(swatch),
        swatch.color,
        swatch.subgroup,
        swatch.group,
      ),
    ),
    searchInput = showSwatchSearch ? (
      <OptionList
        value={searchQuery}
        onChange={setSearchQuery}
        label={get_COLOR_SEARCH_LABEL()}
        className={"mt-1 mb-2 w-0 min-w-full"}
        rowSelector={"[data-swatch]"}
        onEnterIndex={() =>
          optionTypeaheadMatch(
            normalizedQuery,
            matchingSwatches
              .filter((swatch) => swatch.disabledReason === undefined)
              .map((swatch) => swatchLabel(swatch)),
          )
        }
        data-testid={testid !== undefined ? testid + "-search" : undefined}
      />
    ) : null,
    renderSwatch = (swatch: Color.ColorSwatch) => {
      let swatchRow = (
        <SwatchButton
          label={swatchLabel(swatch)}
          data-testid={
            testid !== undefined ? testid + "-" + swatch.name : undefined
          }
          data-swatch={swatch.name}
          paint={
            swatch.empty === true ? undefined : swatchPreviewStyle(swatch.color)
          }
          current={
            swatch.name === selectedSwatch ||
            (swatch.picks !== undefined && swatch.picks === selectedSwatch)
          }
          disabled={swatch.disabledReason !== undefined}
          onMouseDown={(event: React.MouseEvent<HTMLButtonElement>) =>
            event.preventDefault()
          }
          onClick={() => {
            onPicked?.();
            if (
              repick ||
              (swatch.picks ?? swatch.name) !== current ||
              isEmptySwatch(swatch)
            ) {
              onSwatch(swatch.picks ?? swatch.name);
            }
          }}
        />
      );
      if (swatch.disabledReason === undefined) {
        return swatchRow;
      } else {
        return (
          <DisabledReasonTooltip
            reason={swatch.disabledReason}
            wrapperClassName={"flex w-full shrink-0 cursor-not-allowed"}
          >
            {swatchRow}
          </DisabledReasonTooltip>
        );
      }
    },
    renderSwatchGroup = (groupSwatches: Color.ColorSwatch[], groupClassName?: string) => (
      <ColorPickerGroup
        label={title}
        className={joinClassNames("w-0 min-w-full", groupClassName)}
      >
        {groupSwatches.map((swatch, swatchIndex) => {
          let showGroupHeader =
              swatch.group !== undefined &&
              swatch.group !== groupSwatches[swatchIndex - 1]?.group,
            showSubgroupHeader =
              swatch.subgroup !== undefined &&
              (showGroupHeader || swatch.subgroup !== groupSwatches[swatchIndex - 1]?.subgroup);
          return (() => {
            const _Element = (ColorSelectReact as typeof React)
              .Fragment;
            const _elementProps = {
              children: [
                showGroupHeader ? (
                  <ColorPickerHeader
                    text={swatch.group}
                    title={true}
                  />
                ) : null,
                showSubgroupHeader ? (
                  <ColorPickerHeader text={swatch.subgroup} />
                ) : null,
                renderSwatch(swatch),
              ],
            };
            const _elementKey = swatch.name + ":" + String(swatchIndex);
            return <_Element key={_elementKey} {..._elementProps} />;
          })();
        })}
      </ColorPickerGroup>
    ),
    header =
      !headless && (hasSwatchTabs || headerEnd !== undefined) ? (
        <div
          className={joinClassNames(
            "-mx-2 -mt-2 mb-1 flex items-center justify-between gap-2",
            !hasSwatchTabs && "order-first",
          )}
          data-kit={"color-popover-header"}
        >
          {[hasSwatchTabs ? (
              <ColorHexInput
                value={selectedTab}
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
            ), title !== undefined && hasSwatchTabs ? (
              <span className={"sr-only"}>{title}</span>
            ) : null, headerEnd]}
        </div>
      ) : null,
    inlineSwatches = !hasSwatchTabs && color !== undefined ? memo : [],
    customColorControls = (
      <ColorSelectJsx.Fragment>
        {[inlineSwatches.length > 0 ? (
            <div className={"-mx-2 mb-1 flex flex-col"}>
              {renderSwatchGroup(inlineSwatches)}
            </div>
          ) : null, fillKind !== undefined ? (
            <PropertyRow
              label={TYPE_LABEL}
              className={showColorControls ? "mb-1" : undefined}
              {...gradientStopKeyboardHandlers}
            >
              <SegmentedControl
                aria-label={fillKind.label ?? (uiMessage("design-system.colorSelect.fillType"))}
                fullWidth={true}
                segments={fillKind.options.map((option) => ({
                  ...fillModeOption(
                    option.value,
                    option.label,
                    fillKind.disabled === true ||
                      option.disabledReason !== undefined
                      ? true
                      : undefined,
                  ),
                  ...(option.disabledReason !== undefined
                    ? {
                        disabledReason: option.disabledReason,
                      }
                    : {}),
                }))}
                value={fillKind.value}
                onChange={(fillValue: string) =>
                  fillValue !== fillKind.value &&
                  !fillKind.disabled &&
                  fillKind.onChange(fillValue)
                }
              />
            </PropertyRow>
          ) : null, showColorControls && color !== undefined ? (
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
      onKeyDown={createOptionListKeyHandler("[data-swatch]")}
      className={joinClassNames(
        "flex min-w-56 flex-col [--pp-gutter-l:0px] [--pp-gutter-r:0px] [--pp-label-w:3rem]",
        className,
      )}
    >
      {[hasSwatchTabs ? header : null, selectedTab === "system" ? (
          <div
            className={joinClassNames(
              "flex min-h-0 flex-col",
              hasSwatchTabs ? "-mx-2" : "-m-2",
            )}
          >
            {[searchInput, matchingSwatches.length > 0 ? (
                renderSwatchGroup(
                  matchingSwatches,
                  hasSwatchTabs
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
          customColorControls
        ), hasSwatchTabs ? null : header]}
    </div>
  );
}
function normalizeColorSwatches(
  swatches: Color.ColorSwatchInput[] | undefined,
  allowEmpty?: boolean,
  disabledReason?: React.ReactNode,
): Color.ColorSwatch[] {
  let value = (swatches ?? []).map((swatch) =>
    typeof swatch === "string"
      ? {
          name: swatch,
          color: swatch,
        }
      : "value" in swatch
        ? {
            name: swatch.name,
            color: swatch.value,
            label: swatch.label,
            group: swatch.group,
            subgroup: swatch.subgroup,
            ...(swatch.picks !== undefined
              ? {
                  picks: swatch.picks,
                }
              : {}),
          }
        : swatch,
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
  value: cssColor,
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
    callback = (css: string) =>
      rgbaHexColor({
        ...parseCssColorToHsva(css),
        ...(opaque
          ? {
              a: 1,
            }
          : {}),
      }),
    swatchCacheKey = JSON.stringify(memo.map((swatch) => [swatch.name, swatch.color])),
    normalizedSwatchColors = (ColorSelectReact as typeof React).useMemo(
      () =>
        memo.map((swatch) =>
          swatch.empty === true ? null : callback(swatch.color),
        ),
      [swatchCacheKey, opaque],
    ),
    selectedSwatch = (ColorSelectReact as typeof React).useMemo(() => {
      if (none?.current) {
        return emptySwatchValue;
      }
      if (current !== undefined) {
        return current;
      }
      if (unset) {
        return null;
      }
      let normalizedColor = callback(cssColor),
        matchingIndex = normalizedSwatchColors.indexOf(normalizedColor);
      if (matchingIndex < 0) {
        return null;
      } else {
        return memo[matchingIndex].picks ?? memo[matchingIndex].name;
      }
    }, [memo, normalizedSwatchColors, cssColor, unset, opaque, none?.current, current]);
  return (
    <SwatchPalette
      {...props}
      swatches={memo}
      current={selectedSwatch}
      onSwatch={(swatchName: string) => {
        if (swatchName === emptySwatchValue) {
          return none?.onPick();
        }
        if (onSwatch !== undefined) {
          return onSwatch(swatchName);
        }
        let selectedSwatchEntry = memo.find((swatch) => swatch.name === swatchName);
        if (selectedSwatchEntry === undefined) {
          return;
        }
        let nextColor = callback(selectedSwatchEntry.color);
        onChange(nextColor);
        onPickEnd?.(nextColor);
        if (contrast !== undefined) {
          announceLiveMessage(() => {
            let results = colorContrastResults(nextColor, contrast);
            if (results === undefined) {
              return null;
            } else {
              return contrastDisplayInfo(results).spoken;
            }
          });
        }
      }}
      color={{
        value: cssColor,
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
    jsxColorSelectPrimitives = toModuleNamespace(
      loadJsxNamespace(),
      1,
    );
    ColorSelectJsx = toModuleNamespace(
      loadJsxNamespace(),
      1,
    );
    symbolicColorPattern = /^\s*(var|color-mix)\(/i;
    unsafeColorPattern =
      /url\s*\(|image(-set)?\s*\(|src\s*\(|cross-fade\s*\(|element\s*\(|\\/i;
    swatchLabel = (swatch) =>
      swatch.label ?? swatch.name[0].toUpperCase() + swatch.name.slice(1);
    isEmptySwatch = (swatch) => swatch.empty === true || swatch.name === "default";
    swatchLabelIsColor = (swatch) =>
      /^(#|rgba?\(|hsla?\()/i.test((swatch.label ?? swatch.name).trim());
    emptySwatchValue = ":none";
  };
}
