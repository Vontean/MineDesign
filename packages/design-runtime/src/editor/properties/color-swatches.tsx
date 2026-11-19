import { useUiLocale } from '../../ui-locale.ts';
import { uiMessage } from '@minedesign/contracts/ui-messages';
/** Restored application module; prepare first, initialize in original order. */
import {
  type Dynamic,
} from "../../runtime-types";
import { SegmentedControl } from "../../cds/components/selection-points";
import { DisabledReasonTooltip } from "../../cds/tooltip/tooltip";
import { joinClassNames } from "../chrome/overlay-state";
import { ColorContrastCopyLabel_2 as searchLabel, ColorContrastCopyLabel_3 as noMatchesMessage, TypeValue } from "../color/contrast-copy";
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
function colorWellStyle(paint?: Dynamic): Dynamic {
  if (paint === undefined) return;
  if (
    /gradient\(/.test(paint) &&
    !PropertiesGradientEditorImageCrossFadePattern.test(paint)
  )
    return {
      background: paint,
    };
  if (
    PropertiesGradientEditorColorMixPattern.test(paint) &&
    !PropertiesGradientEditorImageCrossFadePattern.test(paint)
  )
    return {
      backgroundColor: paint,
    };
  let hsva: Dynamic = parseHsvaColor(paint),
    rgbaCss: Dynamic = hsvaToRgbaCss(hsva);
  return hsva.a < 1
    ? {
        background: `linear-gradient(${rgbaCss}, ${rgbaCss}), ${alphaCheckerboardBackground}`,
      }
    : {
        backgroundColor: rgbaCss,
      };
}
function normalizedPaintKey(paint?: Dynamic): Dynamic {
  return PropertiesGradientEditorColorMixPattern.test(paint)
    ? "sym:" + paint.trim()
    : hsvaToRgbaCss(parseHsvaColor(paint));
}
function samePaint(paintA?: Dynamic, paintB?: Dynamic): Dynamic {
  return normalizedPaintKey(paintA) === normalizedPaintKey(paintB);
}
function mergeDesignSystemSwatches(
  designSystemColors?: Dynamic,
  swatches?: Dynamic,
): Dynamic {
  if (designSystemColors === undefined || designSystemColors.colors.length === 0) return [...swatches];
  let firstSwatchIndex: Dynamic = swatches.findIndex(
      (swatch?: Dynamic): Dynamic => !PropertiesColorSwatchesEmpty(swatch),
    ),
    leadingSwatches: Dynamic = (firstSwatchIndex < 0 ? swatches : swatches.slice(0, firstSwatchIndex)).map(
      (swatch?: Dynamic): Dynamic =>
        swatch.group === undefined
          ? swatch
          : {
              ...swatch,
              group: designSystemColors.label,
              subgroup: undefined,
            },
    ),
    trailingSwatches: Dynamic = firstSwatchIndex < 0 ? [] : swatches.slice(firstSwatchIndex),
    swatchByPaint: Dynamic = new Map(),
    swatchesByLabel: Dynamic = new Map();
  for (let swatch of trailingSwatches as Dynamic) {
    if (
      PropertiesColorSwatchesEmpty(swatch) ||
      PropertiesColorSwatchesTest(swatch) ||
      swatch.picks !== undefined
    )
      continue;
    let paintKey: Dynamic = normalizedPaintKey(swatch.color);
    swatchByPaint.has(paintKey) || swatchByPaint.set(paintKey, swatch);
    let labelKey: Dynamic = (swatch.label ?? swatch.name).replace(/^--/, "");
    swatchesByLabel.set(labelKey, [...(swatchesByLabel.get(labelKey) ?? []), swatch]);
  }
  let findByLabel: Dynamic = (labelKey?: Dynamic, paint?: Dynamic): Dynamic => {
      let candidates: Dynamic = swatchesByLabel.get(labelKey) ?? [];
      return candidates.length <= 1 ||
        candidates.every(
          (candidate?: Dynamic): Dynamic =>
            normalizedPaintKey(candidate.color) ===
            normalizedPaintKey(candidates[0].color),
        )
        ? candidates[0]
        : paint === undefined
          ? undefined
          : candidates.find(
              (candidate?: Dynamic): Dynamic =>
                normalizedPaintKey(candidate.color) ===
                normalizedPaintKey(paint),
            );
    },
    seenNames: Dynamic = new Set(),
    items: Dynamic = [];
  for (let usedColor of designSystemColors.colors as Dynamic) {
    if (items.length >= PropertiesColorSwatchesLimit) break;
    let varMatch: Dynamic = /^var\(\s*--([\w-]+)\s*(?:,\s*(.+?)\s*)?\)$/.exec(
        usedColor,
      ),
      matchedSwatch: Dynamic =
        varMatch !== null
          ? findByLabel(varMatch[1], varMatch[2])
          : swatchByPaint.get(normalizedPaintKey(usedColor));
    matchedSwatch === undefined ||
      seenNames.has(matchedSwatch.name) ||
      (seenNames.add(matchedSwatch.name),
      items.push({
        name: "used:" + matchedSwatch.name,
        color: matchedSwatch.color,
        label: matchedSwatch.label ?? matchedSwatch.name,
        group: designSystemColors.label,
        picks: matchedSwatch.name,
      }));
  }
  return items.length === 0 ? [...swatches] : [...leadingSwatches, ...items, ...trailingSwatches];
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
  let hasSwatches: Dynamic = swatches.some(
      (swatch?: Dynamic): Dynamic => !PropertiesColorSwatchesEmpty(swatch),
    ),
    hasColorPicker: Dynamic = hasSwatches && color !== undefined,
    kindOptions: Dynamic =
      kind !== undefined && kind.options.length > 1 ? kind : undefined,
    isColorKind: Dynamic =
      kindOptions === undefined || kindOptions.value === (kindOptions.colorValue ?? "color"),
    [activeTab, setActiveTab]: Dynamic = (0, reactPropertiesTooltip.useState)(
      (): Dynamic => (hasSwatches && isColorKind ? "system" : "custom"),
    ),
    currentTab: Dynamic = hasColorPicker
      ? (tab ?? activeTab)
      : color === undefined
        ? "system"
        : "custom",
    changeTab: Dynamic = (nextTab?: Dynamic): Dynamic => {
      setActiveTab(nextTab);
      onTab?.(nextTab);
    },
    isSearchable: Dynamic =
      hasColorPicker &&
      (swatches.some(
        (swatch?: Dynamic): Dynamic => swatch.subgroup !== undefined,
      ) ||
        swatches.length > PropertiesNumericInputLimit),
    [searchText, setSearchText]: Dynamic = (0, reactPropertiesTooltip.useState)(
      "",
    ),
    searchQuery: Dynamic = isSearchable ? searchText.trim().toLowerCase() : "",
    swatchSignature: Dynamic = JSON.stringify(
      swatches.map(
        (swatch?: Dynamic): Dynamic => [
          swatch.name,
          swatch.color,
          swatch.label,
          swatch.group,
          swatch.subgroup,
          swatch.empty === true,
          swatch.disabledReason ?? null,
          swatch.picks ?? null,
        ],
      ),
    ),
    { shown: shownSwatches, foldedInto: foldedInto }: Dynamic = (0,
    reactPropertiesTooltip.useMemo)((): Dynamic => {
      let nameByPaint: Dynamic = new Map(),
        foldedNames: Dynamic = new Map(),
        items: Dynamic = [];
      for (let swatch of swatches as Dynamic) {
        if (PropertiesColorSwatchesEmpty(swatch) || !fold) {
          items.push(swatch);
          continue;
        }
        let paintKey: Dynamic = normalizedPaintKey(swatch.color),
          entry: Dynamic = nameByPaint.get(paintKey);
        if (entry !== undefined && PropertiesColorSwatchesTest(swatch)) {
          foldedNames.set(swatch.name, entry);
          continue;
        }
        entry === undefined && nameByPaint.set(paintKey, swatch.name);
        items.push(swatch);
      }
      return {
        shown: items,
        foldedInto: foldedNames,
      };
    }, [swatchSignature, fold]),
    currentName: Dynamic =
      current !== null ? (foldedInto.get(current) ?? current) : null,
    visibleSwatches: Dynamic = shownSwatches.filter(
      (swatch?: Dynamic): Dynamic =>
        pickerSearchMatches(
          searchQuery,
          PropertiesGradientEditorLabel(swatch),
          swatch.color,
          swatch.subgroup,
          swatch.group,
        ),
    ),
    searchInput: Dynamic = isSearchable ? (
      <PickerSearchInput
        value={searchText}
        onChange={setSearchText}
        label={searchLabel}
        className={"mt-1 mb-2 w-0 min-w-full"}
        rowSelector={"[data-swatch]"}
        onEnterIndex={(): Dynamic =>
          pickerSearchInitialIndex(
            searchQuery,
            visibleSwatches
              .filter(
                (swatch?: Dynamic): Dynamic =>
                  swatch.disabledReason === undefined,
              )
              .map(
                (swatch?: Dynamic): Dynamic =>
                  PropertiesGradientEditorLabel(swatch),
              ),
          )
        }
        data-testid={testid !== undefined ? testid + "-search" : undefined}
      />
    ) : null,
    renderSwatchRow: Dynamic = (swatch?: Dynamic): Dynamic => {
      let swatchRow: Dynamic = (
        <ColorSwatchRow
          label={PropertiesGradientEditorLabel(swatch)}
          data-testid={
            testid !== undefined ? testid + "-" + swatch.name : undefined
          }
          data-swatch={swatch.name}
          paint={
            swatch.empty === true ? undefined : colorWellStyle(swatch.color)
          }
          current={
            swatch.name === currentName ||
            (swatch.picks !== undefined && swatch.picks === currentName)
          }
          disabled={swatch.disabledReason !== undefined}
          onMouseDown={(event?: Dynamic): Dynamic => event.preventDefault()}
          onClick={(): Dynamic => {
            onPicked?.();
            (repick ||
              (swatch.picks ?? swatch.name) !== current ||
              PropertiesColorSwatchesEmpty(swatch)) &&
              onSwatch(swatch.picks ?? swatch.name);
          }}
        />
      );
      return swatch.disabledReason === undefined ? (
        swatchRow
      ) : (
        <DisabledReasonTooltip
          reason={swatch.disabledReason}
          wrapperClassName={"flex w-full shrink-0 cursor-not-allowed"}
        >
          {swatchRow}
        </DisabledReasonTooltip>
      );
    },
    renderSwatchGroup: Dynamic = (groupSwatches?: Dynamic, groupClassName?: Dynamic): Dynamic => (
      <PickerListGroup
        label={title}
        className={joinClassNames("w-0 min-w-full", groupClassName)}
      >
        {groupSwatches.map((swatch?: Dynamic, swatchIndex?: Dynamic): Dynamic => {
          let startsGroup: Dynamic =
              swatch.group !== undefined &&
              swatch.group !== groupSwatches[swatchIndex - 1]?.group,
            startsSubgroup: Dynamic =
              swatch.subgroup !== undefined &&
              (startsGroup || swatch.subgroup !== groupSwatches[swatchIndex - 1]?.subgroup);
          return (() => {
            const _Component = reactPropertiesTooltip.Fragment;
            const _props = {
              children: [
                startsGroup ? (
                  <PickerListHeader
                    text={swatch.group}
                    title={true}
                  />
                ) : null,
                startsSubgroup ? (
                  <PickerListHeader text={swatch.subgroup} />
                ) : null,
                renderSwatchRow(swatch),
              ],
            } as const;
            const _key = swatch.name + ":" + String(swatchIndex);
            return <_Component key={_key} {..._props} />;
          })();
        })}
      </PickerListGroup>
    ),
    header: Dynamic =
      !headless && (hasColorPicker || headerEnd !== undefined) ? (
        <div
          className={joinClassNames(
            "-mx-2 -mt-2 mb-1 flex items-center justify-between gap-2",
            !hasColorPicker && "order-first",
          )}
          data-kit={"color-popover-header"}
        >
          {hasColorPicker ? (<ColorHexInput
              value={currentTab}
              onChange={changeTab}
              className={""}
            />) : (<span
              className={
                "min-w-0 flex-1 truncate pl-2 text-body-semibold text-primary"
              }
            >
              {heading}
            </span>)}
          {title !== undefined && hasColorPicker ? (<span className={"sr-only"}>{title}</span>) : (null)}
          {headerEnd}
        </div>
      ) : null,
    inlineSwatches: Dynamic = !hasColorPicker && color !== undefined ? shownSwatches : [],
    customBody: Dynamic = (
      <jsxPropertiesGradientEditor.Fragment>
        {inlineSwatches.length > 0 ? (<div className={"-mx-2 mb-1 flex flex-col"}>
            {renderSwatchGroup(inlineSwatches)}
          </div>) : (null)}
        {kindOptions !== undefined ? (<PropertyRow
            label={TypeValue}
            className={isColorKind ? "mb-1" : undefined}
            {...PropertiesSelectOnKeyDownCaptureConfig}
          >
            <SegmentedControl
              aria-label={kindOptions.label ?? (uiMessage("inspector.colorSwatches.fillType"))}
              fullWidth={true}
              segments={kindOptions.options.map(
                (kindOption?: Dynamic): Dynamic => ({
                  ...toolSegmentOption(
                    kindOption.value,
                    kindOption.label,
                    kindOptions.disabled === true ||
                      kindOption.disabledReason !== undefined
                      ? true
                      : undefined,
                  ),
                  ...(kindOption.disabledReason !== undefined
                    ? {
                        disabledReason: kindOption.disabledReason,
                      }
                    : {}),
                }),
              )}
              value={kindOptions.value}
              onChange={(nextKind?: Dynamic): Dynamic =>
                nextKind !== kindOptions.value &&
                !kindOptions.disabled &&
                kindOptions.onChange(nextKind)
              }
            />
          </PropertyRow>) : (null)}
        {isColorKind && color !== undefined ? (<ColorPicker {...color} />) : (face)}
      </jsxPropertiesGradientEditor.Fragment>
    );
  return (
    <div
      data-kit={"color-selector"}
      data-search-scope={""}
      onKeyDown={pickerSearchKeyHandler("[data-swatch]")}
      className={joinClassNames(
        "flex min-w-56 flex-col [--pp-gutter-l:0px] [--pp-gutter-r:0px] [--pp-label-w:3rem]",
        className,
      )}
    >
      {hasColorPicker ? (header) : (null)}
      {currentTab === "system" ? (<div
          className={joinClassNames(
            "flex min-h-0 flex-col",
            hasColorPicker ? "-mx-2" : "-m-2",
          )}
        >
          {searchInput}
          {visibleSwatches.length > 0 ? (renderSwatchGroup(
              visibleSwatches,
              hasColorPicker
                ? "mb-[calc(-1*var(--cs-bottom,16px))] pb-[var(--cs-bottom,16px)]"
                : undefined,
            )) : (<p
              role={"status"}
              className={"px-2 py-1 text-footnote text-muted"}
            >
              {noMatchesMessage}
            </p>)}
        </div>) : (customBody)}
      {hasColorPicker ? (null) : (header)}
    </div>
  );
}
function normalizeColorSwatches(
  swatches?: Dynamic,
  hasNone?: Dynamic,
  noneDisabledReason?: Dynamic,
): Dynamic {
  let normalizedSwatches: Dynamic = (swatches ?? []).map(
    (swatch?: Dynamic): Dynamic =>
      typeof swatch == "string"
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
  if (!hasNone) return normalizedSwatches;
  let noneSwatch: Dynamic = {
    name: NoneValue,
    get label() { return uiMessage("inspector.colorSwatches.none"); },
    color: "transparent",
    empty: true,
    group: normalizedSwatches[0]?.group,
    subgroup: normalizedSwatches[0]?.subgroup,
  };
  noneDisabledReason !== undefined && (noneSwatch.disabledReason = noneDisabledReason);
  return [noneSwatch, ...normalizedSwatches];
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
    PropertiesColorSwatchesEmpty = (swatch?: Dynamic): Dynamic =>
      swatch.empty === true || swatch.name === "default";
    PropertiesColorSwatchesTest = (swatch?: Dynamic): Dynamic =>
      /^(#|rgba?\(|hsla?\()/i.test((swatch.label ?? swatch.name).trim());
    PropertiesColorSwatchesLimit = 12;
    NoneValue = ":none";
  };
}
