import { useUiLocale } from '../ui-locale.ts';
import { uiMessage } from '@minedesign/contracts/ui-messages';
/** Restored application module; prepare first, initialize in original order. */
import type * as React from "react";
import type {
  ReactNamespace,
  JsxNamespace,
  NumberPropertyRowProps,
  ColorChipProps,
  ColorPropertyRowProps,
  ColorTextPropertyRowProps,
} from "../contracts/composition";
import { loadJsxNamespace, loadReactNamespace } from "../dependencies";
import { toModuleNamespace } from "../module-helpers";
import { Button } from "./buttons";
import { ColorSelect } from "./color-select";
import { contrastDisplayInfo, ContrastMark } from "./color/contrast-controls";
import { colorContrastResults } from "./color/contrast";
import { COLOR_PICKER_POPOVER_CLASS, COLOR_PICKER_POPOVER_HEIGHT, hsvaToHexColor, parseCssColorToHsva } from "./color/picker";
import { Icon } from "./interactions";
import { captureNumberScrubPointer, PropertyNumberInput, useNumberScrubGesture } from "./number-controls";
import { popupPointerEvent } from "./property-focus";
import { joinClassNames } from "./property-icons";
import { DEFAULT_CLOSE_LABEL, MIXED_LABEL } from "./property-labels";
import { PropertyPopup } from "./property-popover";
import { COLOR_SWATCH_CLASS, FieldButton, PropertyColorPreview, PropertyRow, propertyRowPressShouldIgnore } from "./property-row";
import { Select } from "./select";

var reactForUiPropertyRows: ReactNamespace;
var jsxmq: JsxNamespace;
var COLOR_CHIP_PATTERN: RegExp;
var preventDefaultEvent: (event: React.SyntheticEvent) => void;
function NumberPropertyRow({
  label: label,
  value: numberValue,
  onValue: onValue,
  onScrub: onScrub,
  onScrubEnd: onScrubEnd,
  min: min,
  max: max,
  step: step,
  smallStep: smallStep,
  placeholder: placeholder,
  hint: hint,
  emptyStepFrom: emptyStepFrom,
  clearable: clearable,
  prefix: prefix,
  unit: unit,
  units: units,
  onUnit: onUnit,
  mixed: mixed,
  adornment: adornment,
  trailing: trailing,
  onReset: onReset,
  disabled: disabled,
  title: title,
  description: description,
}: NumberPropertyRowProps) {
  useUiLocale();
  let ref = reactForUiPropertyRows.useRef(false),
    callback = () => {
      ref.current = true;
      setTimeout(() => {
        ref.current = false;
      }, 0);
      onScrubEnd?.();
    },
    numericPlaceholder =
      onScrub &&
      emptyStepFrom !== null &&
      placeholder !== undefined &&
      /^-?\d+(\.\d+)?$/.test(placeholder)
        ? Number(placeholder)
        : undefined,
    scrubStart =
      numberValue ??
      (typeof emptyStepFrom === "number" && Number.isFinite(emptyStepFrom)
        ? emptyStepFrom
        : numericPlaceholder),
    canScrub = !disabled && !mixed && scrubStart !== undefined,
    scrubGesture = useNumberScrubGesture({
      value: scrubStart ?? NaN,
      step: step,
      min: min,
      max: max,
      disabled: !canScrub,
      onScrub: (nextNumber: number) => (onScrub ?? onValue)(nextNumber),
      onScrubEnd: callback,
    }),
    hasUnitMenu = units !== undefined && onUnit !== undefined;
  return (
    <PropertyRow
      label={label}
      title={title}
      description={description}
      disabled={disabled}
      onReset={onReset}
      trailing={trailing}
      labelProps={{
        onMouseDown: canScrub ? scrubGesture : undefined,
        onPointerDown: canScrub ? captureNumberScrubPointer : undefined,
        className: canScrub ? "cursor-ew-resize" : undefined,
      }}
      onPress={(element: HTMLElement) => {
        if (ref.current) {
          return;
        }
        element.querySelector("input")?.focus();
      }}
    >
      {[<PropertyNumberInput
          aria-label={label}
          prefix={prefix}
          unit={hasUnitMenu ? undefined : unit}
          value={numberValue}
          onValue={onValue}
          onScrub={onScrub}
          onScrubEnd={callback}
          min={min}
          max={max}
          step={step}
          smallStep={smallStep}
          placeholder={placeholder}
          hint={hint}
          emptyStepFrom={emptyStepFrom}
          clearable={clearable}
          mixed={mixed}
          disabled={disabled}
        />, hasUnitMenu ? (
          <Select
            compact={true}
            aria-label={uiMessage("design-system.propertyRows.unit2", { value1: String(label) })}
            title={uiMessage("design-system.propertyRows.unit")}
            items={units!.map((unitOption: string) => ({
              value: unitOption,
              label: unitOption,
            }))}
            value={unit ?? units![0] ?? null}
            onChange={onUnit!}
            disabled={disabled}
            align={"end"}
          />
        ) : null, adornment]}
    </PropertyRow>
  );
}
function ColorChip({
  hex: hex,
  alpha = 100,
  className: className,
}: ColorChipProps) {
  useUiLocale();
  return (
    <span
      aria-hidden={"true"}
      className={joinClassNames(
        COLOR_SWATCH_CLASS,
        className,
      )}
    >
      {hex !== null ? (<jsxmq.Fragment>
          {[<span
              className={"absolute inset-y-0 left-0 w-1/2"}
              style={{
                backgroundColor: hex,
              }}
            />, <span
              className={"absolute inset-y-0 right-0 w-1/2"}
              style={{
                backgroundColor: hex,
                opacity: Math.round(alpha * 100) / 1e4,
              }}
            />]}
        </jsxmq.Fragment>) : (null)}
    </span>
  );
}
function useContrastResult(
  contrast: import("../contracts/color-controls").ContrastOptions | undefined,
  color: string | undefined,
) {
  let contrastKey = contrast === undefined ? undefined : JSON.stringify(contrast);
  return reactForUiPropertyRows.useMemo(
    () =>
      contrast === undefined || color === undefined
        ? undefined
        : colorContrastResults(color, contrast),
    [contrastKey, color],
  );
}
function ColorPropertyRow({
  label: label,
  value: colorValue,
  onChange: onChange,
  onLive: onLive,
  onLiveEnd: onLiveEnd,
  swatches: swatches,
  current: current,
  onSwatch: onSwatch,
  fold: fold,
  opaque: opaque,
  description: description,
  contrast: contrast,
  contrastMark = false,
  placeholder: placeholder,
  clearLabel: clearLabel,
  popupAttrs: popupAttrs,
  mixed = false,
  unset = false,
  valueName: valueName,
  chip: chip,
  headerTabs: headerTabs,
  panel: panel,
  closeLabel = DEFAULT_CLOSE_LABEL,
  popoverTitle: popoverTitle,
  allowNone: allowNone,
  onNone: onNone,
  isNone: isNone,
  noneDisabledReason: noneDisabledReason,
  disabled: disabled,
  disabledReason: disabledReason,
  keepFocus = false,
  editsAreUndoSteps: editsAreUndoSteps,
  popover: popover,
  open: open,
  onOpenChange: onOpenChange,
  title: title,
  testid: testid,
}: ColorPropertyRowProps) {
  useUiLocale();
  let [internalOpen, setInternalOpen] = reactForUiPropertyRows.useState(false),
    resolvedOpen = open ?? internalOpen,
    callback = (nextOpen: boolean) => {
      setInternalOpen(nextOpen);
      onOpenChange?.(nextOpen);
    },
    [openWithPickerFocus, setOpenWithPickerFocus] = reactForUiPropertyRows.useState(false),
    ref = reactForUiPropertyRows.useRef(false),
    triggerRef = reactForUiPropertyRows.useRef<HTMLButtonElement | null>(null),
    getPopoverAnchor = popover?.anchor,
    resolvePopoverAnchor =
      getPopoverAnchor === undefined
        ? undefined
        : () => (triggerRef.current === null ? null : getPopoverAnchor(triggerRef.current)),
    memo = reactForUiPropertyRows.useMemo(() => {
      let chipColor = colorValue ?? placeholder;
      if (chipColor === undefined) {
        return;
      }
      let hsva = parseCssColorToHsva(chipColor);
      return {
        solid: hsvaToHexColor(hsva),
        alpha: hsva.a,
      };
    }, [colorValue, placeholder]),
    isColorLiteral = colorValue !== undefined && COLOR_CHIP_PATTERN.test(colorValue),
    swatchLabel = reactForUiPropertyRows.useMemo(() => {
      if (!isColorLiteral || memo === undefined) {
        return;
      }
      if (valueName !== undefined) {
        return valueName ?? undefined;
      }
      if (swatches === undefined) {
        return;
      }
      if (current !== undefined) {
        if (current === null) {
          return;
        }
        let matchingSwatch = swatches.find(
          (swatch: import("../contracts/color-controls").ColorSwatchInput) =>
            typeof swatch !== "string" &&
            (swatch.name === current ||
              ("picks" in swatch && swatch.picks === current)),
        );
        if (
          matchingSwatch !== undefined &&
          typeof matchingSwatch !== "string" &&
          matchingSwatch.label !== undefined &&
          matchingSwatch.label.trim() !== ""
        ) {
          return matchingSwatch.label;
        } else {
          return undefined;
        }
      }
      let solidHex = memo.solid.toLowerCase();
      for (let swatch of swatches) {
        let swatchColor =
          typeof swatch === "string"
            ? swatch
            : "value" in swatch
              ? swatch.value
              : swatch.color;
        if (!COLOR_CHIP_PATTERN.test(swatchColor)) {
          continue;
        }
        let swatchHsva = parseCssColorToHsva(swatchColor);
        if (swatchHsva.a < 1) {
          continue;
        }
        if (hsvaToHexColor(swatchHsva).toLowerCase() !== solidHex) {
          continue;
        }
        if (
          typeof swatch !== "string" &&
          swatch.label !== undefined &&
          swatch.label.trim() !== ""
        ) {
          return swatch.label;
        } else {
          return undefined;
        }
      }
      return;
    }, [isColorLiteral, memo, swatches, current, valueName]),
    displayValue =
      colorValue !== undefined
        ? typeof valueName === "string"
          ? valueName
          : isColorLiteral && memo !== undefined
            ? (swatchLabel ?? memo.solid.toUpperCase())
            : colorValue
        : (clearLabel ?? placeholder ?? "None"),
    displayAlpha =
      isColorLiteral && memo !== undefined && memo.alpha < 1
        ? Math.round(memo.alpha * 100) + "%"
        : undefined,
    contrastColor =
      mixed || chip !== undefined ? undefined : (colorValue ?? placeholder),
    contrastResult = useContrastResult(contrast, contrastColor),
    contrastSentence = reactForUiPropertyRows.useMemo(
      () =>
        contrastResult === undefined
          ? undefined
          : contrastDisplayInfo(contrastResult).sentence,
      [contrastResult],
    ),
    describedValue =
      description !== undefined && description !== ""
        ? contrastSentence !== undefined
          ? description.replace(/\.?\s*$/, ". ") + contrastSentence
          : description
        : contrastSentence,
    descriptionId = reactForUiPropertyRows.useId(),
    hasSwatches = swatches !== undefined && swatches.length > 0,
    isColorTab =
      headerTabs === undefined ||
      headerTabs.value === (headerTabs.colorTab ?? "color"),
    [pickerTab, setPickerTab] = reactForUiPropertyRows.useState("system"),
    [previousOpen, setPreviousOpen] = reactForUiPropertyRows.useState(resolvedOpen);
  if (resolvedOpen !== previousOpen) {
    setPreviousOpen(resolvedOpen);
    if (resolvedOpen) {
      setPickerTab(hasSwatches && isColorTab ? "system" : "custom");
      setOpenWithPickerFocus(ref.current);
      ref.current = false;
    }
  }
  let colorPicker = (
    <ColorSelect
      testid={testid !== undefined ? testid + "-menu" : undefined}
      title={popoverTitle ?? (label)}
      swatches={swatches}
      current={current}
      onSwatch={onSwatch}
      fold={fold}
      value={colorValue ?? placeholder ?? "#000000"}
      unset={colorValue === undefined || mixed || !isColorTab || unset}
      repick={unset && current != null}
      opaque={opaque}
      contrast={contrastColor !== undefined ? contrast : undefined}
      onChange={onLive ?? onChange}
      onPickEnd={onLive ? onLiveEnd : undefined}
      none={
        allowNone
          ? {
              current:
                isNone ??
                (colorValue === undefined &&
                  placeholder === undefined &&
                  chip === undefined &&
                  !mixed),
              onPick: () => {
                if (onNone) {
                  onNone();
                } else {
                  onChange(undefined);
                }
                callback(false);
              },
              ...(noneDisabledReason !== undefined
                ? {
                    disabledReason: noneDisabledReason,
                  }
                : {}),
            }
          : undefined
      }
      kind={
        headerTabs !== undefined
          ? {
              value: headerTabs.value,
              options: headerTabs.options,
              onChange: headerTabs.onChange,
              label: headerTabs.label ?? label,
              colorValue: headerTabs.colorTab,
            }
          : undefined
      }
      face={panel}
      tab={hasSwatches ? pickerTab : undefined}
      onTab={setPickerTab}
      heading={popoverTitle ?? label}
      headerEnd={
        hasSwatches || headerTabs !== undefined || popoverTitle !== undefined ? (
          <Button
            variant={"ghost"}
            size={"sm"}
            iconOnly={true}
            icon={
              <Icon
                name={"X"}
                size={"sm"}
                className={"text-secondary"}
              />
            }
            aria-label={closeLabel}
            onClick={() => callback(false)}
            className={"relative shrink-0"}
          />
        ) : undefined
      }
    />
  );
  return (
    <span
      ref={triggerRef}
      className={"relative flex min-w-0 flex-1"}
      title={disabled ? (disabledReason) : (undefined)}
    >
      {[<PropertyPopup
          open={resolvedOpen}
          onOpen={() => callback(true)}
          onClose={() => callback(false)}
          trigger={
            <FieldButton
              data-testid={testid}
              title={disabled ? (disabledReason ?? (title)) : (title)}
              aria-label={
                label + ": " + (mixed ? MIXED_LABEL : chip !== undefined ? chip.text : colorValue !== undefined ? displayValue + (displayAlpha !== undefined ? " " + displayAlpha : "") : clearLabel !== undefined && /[\p{L}\p{N}]/u.test(clearLabel) ? clearLabel : clearLabel !== undefined ? uiMessage("design-system.propertyRows.none") : uiMessage("design-system.propertyRows.unset"))
              }
              aria-describedby={describedValue !== undefined ? descriptionId : undefined}
              disabled={disabled}
              onClick={(mouseEvent: React.MouseEvent<HTMLElement>) => {
                if (!resolvedOpen) {
                  ref.current = mouseEvent.detail === 0;
                }
              }}
              onMouseDown={keepFocus ? preventDefaultEvent : undefined}
              muted={mixed}
              chip={
                mixed ? (
                  <PropertyColorPreview data-kit={"swatch-mixed"}>
                    {[<span
                        className={"absolute inset-y-0 left-0 w-1/2"}
                        style={{
                          backgroundColor: "#ffffff",
                        }}
                      />, <span
                        className={"absolute inset-y-0 right-0 w-1/2"}
                        style={{
                          backgroundColor: "#141413",
                        }}
                      />]}
                  </PropertyColorPreview>
                ) : chip !== undefined ? (
                  <PropertyColorPreview
                    data-kit={"swatch-chip"}
                    background={chip.css}
                  />
                ) : (
                  <ColorChip
                    hex={memo?.solid ?? null}
                    alpha={(memo?.alpha ?? 1) * 100}
                  />
                )
              }
              caption={!mixed && chip === undefined ? displayAlpha : undefined}
              trailing={
                contrastMark && contrastResult !== undefined ? (
                  <ContrastMark
                    results={contrastResult}
                    sentence={false}
                    className={"ml-auto pl-1"}
                  />
                ) : undefined
              }
            >
              {mixed ? (MIXED_LABEL) : (chip !== undefined ? (chip.text) : (displayValue))}
            </FieldButton>
          }
          align={"left"}
          side={popover?.side}
          positionAnchor={resolvePopoverAnchor}
          padding={"none"}
          aria-label={popoverTitle ?? (label)}
          className={COLOR_PICKER_POPOVER_CLASS}
          popupAttrs={popupAttrs}
          editsAreUndoSteps={editsAreUndoSteps}
          focusOnOpen={openWithPickerFocus}
          keepFocus={keepFocus}
          planHeight={
            hasSwatches || headerTabs !== undefined
              ? COLOR_PICKER_POPOVER_HEIGHT
              : undefined
          }
        >
          {keepFocus ? (<div
              data-session-strip={""}
              onKeyDownCapture={popupPointerEvent}
            >
              {colorPicker}
            </div>) : (colorPicker)}
        </PropertyPopup>, describedValue !== undefined ? (
          <span id={descriptionId} hidden={true} data-kit={"field-description"}>
            {describedValue}
          </span>
        ) : null]}
    </span>
  );
}
function ColorTextPropertyRow({
  label: label,
  value: colorValue,
  onChange: onChange,
  contrast: contrast,
  placeholder: placeholder,
  clearLabel: clearLabel,
  adornment: adornment,
  trailing: trailing,
  mixed = false,
  chip: chip,
  onReset: onReset,
  disabled: disabled,
  title: title,
  description: description,
  ...remainingProps
}: ColorTextPropertyRowProps) {
  useUiLocale();
  let [isOpen, setIsOpen] = reactForUiPropertyRows.useState(false);
  return (
    <PropertyRow
      label={label}
      title={title}
      disabled={disabled}
      onReset={
        onReset ??
        (clearLabel !== undefined && colorValue !== undefined
          ? () => onChange(undefined)
          : undefined)
      }
      trailing={trailing}
      onPress={() => {
        if (disabled) {
          return;
        }
        setIsOpen(!isOpen);
      }}
      onPointerDown={(event: React.PointerEvent<HTMLDivElement>) => {
        if (
          isOpen &&
          !propertyRowPressShouldIgnore(
            event.currentTarget,
            event.target as Element,
          )
        ) {
          event.stopPropagation();
        }
      }}
    >
      {[<ColorPropertyRow
          {...remainingProps}
          label={label}
          value={colorValue}
          onChange={onChange}
          description={description}
          contrast={contrast}
          placeholder={placeholder}
          clearLabel={clearLabel}
          mixed={mixed}
          chip={chip}
          disabled={disabled}
          open={isOpen}
          onOpenChange={setIsOpen}
        />, adornment]}
    </PropertyRow>
  );
}
export {
  COLOR_CHIP_PATTERN,
  ColorChip,
  ColorPropertyRow,
  ColorTextPropertyRow,
  jsxmq,
  NumberPropertyRow,
  preventDefaultEvent,
  reactForUiPropertyRows,
  useContrastResult,
};
export function installUiPropertyRows(): () => void {
  return () => {
    reactForUiPropertyRows = toModuleNamespace(
      loadReactNamespace(),
      1,
    );
    jsxmq = toModuleNamespace(loadJsxNamespace(), 1);
    COLOR_CHIP_PATTERN =
      /^(?:#(?:[0-9a-f]{3,4}|[0-9a-f]{6}|[0-9a-f]{8})|rgba?\(\s*[\d.]+[\s,]+[\d.]+[\s,]+[\d.]+(?:[\s,/]+[\d.]+)?\s*\))$/i;
    preventDefaultEvent = (event: React.SyntheticEvent) =>
      event.preventDefault();
  };
}
