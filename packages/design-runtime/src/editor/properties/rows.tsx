import { useUiLocale } from '../../ui-locale.ts';
import { uiMessage } from '@minedesign/contracts/ui-messages';
/** Restored application module; prepare first, initialize in original order. */
import {
  type Dynamic,
} from "../../runtime-types";
import { Button } from "../../cds/button/button";
import { Icon } from "../../cds/components/icon";
import { SegmentedControl } from "../../cds/components/selection-points";
import { Switch } from "../../cds/components/switch";
import { CdsRoot } from "../../cds/theme/root";
import { load_react_jsx_runtime } from "../../dependencies";
import { preventInputEnterSubmit } from "../chrome/focus";
import { joinClassNames } from "../chrome/overlay-state";
import { EditorPopover } from "../chrome/popover";
import { CloseValue, MixedValue } from "../color/contrast-copy";
import { ContrastMark, summarizeContrastResults } from "../color/contrast-ui";
import { evaluateColorContrast } from "../color/contrast";
import { hsvaToRgbHex, parseHsvaColor } from "../color/picker-primitives";
import { ColorPickerConstant, ColorPickerLabel } from "../color/picker";
import { ColorPickerWithSwatches, jsxPropertiesColorPicker } from "./color-picker";
import { NumericInput } from "./numeric-input";
import { captureNumericPointer, stepNumericValue, useNumericScrub } from "./numeric-scrubber";
import { isNestedPropertyControl, PropertiesPrimitivesClassNames_2, PropertyColorWell, PropertyPickerButton } from "./primitives";
import { PropertyRow } from "./row";
import { reactPropertiesSection } from "./section";
import { PropertySelect } from "./select";
import { toModuleNamespace } from "../../module-helpers";

var PropertiesRowsLimit: Dynamic;
var PropertiesRowsRgbaPattern: Dynamic;
var PropertiesRowsPreventDefault: Dynamic;
var jsxPropertiesRows: Dynamic;
function PropertyPanelRoot({
  className: className,
  children: children,
  ...props
}: Dynamic): Dynamic {
  useUiLocale();
  return (
    <CdsRoot
      density={"compact"}
      render={
        <div
          className={joinClassNames(
            "flex flex-col",
            "[--prop-row-h:32px] pointer-coarse:[--prop-row-h:40px]",
            className,
          )}
          {...props}
        />
      }
    >
      {children}
    </CdsRoot>
  );
}
function PropertyTextRow({
  label: label,
  onReset: onReset,
  title: title,
  description: description,
  onPress: onPress,
  disabled: isDisabled,
  trailing: trailing,
  children: children,
}: Dynamic): Dynamic {
  useUiLocale();
  return (
    <PropertyRow
      label={label}
      onReset={onReset}
      onPress={onPress}
      disabled={isDisabled}
      title={title}
      description={description}
      trailing={trailing}
    >
      {children}
    </PropertyRow>
  );
}
function PropertyNumberRow({
  label: label,
  value: currentValue,
  onValue: onValue,
  onScrub: onScrub,
  onScrubEnd: onScrubEnd,
  min: minValue,
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
  disabled: isDisabled,
  title: title,
  description: description,
}: Dynamic): Dynamic {
  useUiLocale();
  let justScrubbedRef: Dynamic = (0, reactPropertiesSection.useRef)(false),
    handleScrubEnd: Dynamic = (): Dynamic => {
      justScrubbedRef.current = true;
      setTimeout((): Dynamic => {
        justScrubbedRef.current = false;
      }, 0);
      onScrubEnd?.();
    },
    placeholderNumber: Dynamic =
      onScrub &&
      emptyStepFrom !== null &&
      placeholder !== undefined &&
      /^-?\d+(\.\d+)?$/.test(placeholder)
        ? Number(placeholder)
        : undefined,
    scrubBaseValue: Dynamic =
      currentValue ??
      (typeof emptyStepFrom == "number" && Number.isFinite(emptyStepFrom)
        ? emptyStepFrom
        : placeholderNumber),
    canScrub: Dynamic = !isDisabled && !mixed && scrubBaseValue !== undefined,
    startScrub: Dynamic = useNumericScrub({
      value: scrubBaseValue ?? NaN,
      step: step,
      min: minValue,
      max: max,
      disabled: !canScrub,
      onScrub: (scrubbedValue?: Dynamic): Dynamic => (onScrub ?? onValue)(scrubbedValue),
      onScrubEnd: handleScrubEnd,
    }),
    hasUnitSelect: Dynamic = units !== undefined && onUnit !== undefined;
  return (
    <PropertyRow
      label={label}
      title={title}
      description={description}
      disabled={isDisabled}
      onReset={onReset}
      trailing={trailing}
      labelProps={{
        onMouseDown: canScrub ? startScrub : undefined,
        onPointerDown: canScrub ? captureNumericPointer : undefined,
        className: canScrub ? "cursor-ew-resize" : undefined,
      }}
      onPress={(element?: Dynamic): Dynamic => {
        justScrubbedRef.current || element.querySelector("input")?.focus();
      }}
    >
      <NumericInput
        aria-label={label}
        prefix={prefix}
        unit={hasUnitSelect ? undefined : unit}
        value={currentValue}
        onValue={onValue}
        onScrub={onScrub}
        onScrubEnd={handleScrubEnd}
        min={minValue}
        max={max}
        step={step}
        smallStep={smallStep}
        placeholder={placeholder}
        hint={hint}
        emptyStepFrom={emptyStepFrom}
        clearable={clearable}
        mixed={mixed}
        disabled={isDisabled}
      />
      {hasUnitSelect ? (<PropertySelect
          compact={true}
          aria-label={uiMessage("inspector.rows.unit2", { value1: String(label) })}
          title={uiMessage("inspector.rows.unit")}
          items={units.map(
            (unitOption?: Dynamic): Dynamic => ({
              value: unitOption,
              label: unitOption,
            }),
          )}
          value={unit ?? units[0] ?? null}
          onChange={onUnit}
          disabled={isDisabled}
          align={"end"}
        />) : (null)}
      {adornment}
    </PropertyRow>
  );
}
function rangeFraction(
  currentValue?: Dynamic,
  minValue?: Dynamic,
  maxValue?: Dynamic,
): Dynamic {
  return maxValue <= minValue
    ? 0
    : Math.max(0, Math.min(1, (currentValue - minValue) / (maxValue - minValue)));
}
function rangeValue(
  fraction?: Dynamic,
  minValue?: Dynamic,
  maxValue?: Dynamic,
  step?: Dynamic,
): Dynamic {
  let rawValue: Dynamic =
    minValue + Math.max(0, Math.min(1, fraction)) * (maxValue - minValue);
  if (!step || step <= 0) return rawValue;
  let snapped: Dynamic =
      Math.round((rawValue - minValue) / step) * step + minValue,
    countDecimals: Dynamic = (numericValue?: Dynamic): Dynamic => {
      let text: Dynamic = String(numericValue),
        dotIndex: Dynamic = text.indexOf(".");
      return dotIndex === -1 ? 0 : text.length - dotIndex - 1;
    },
    precision: Dynamic = Math.max(countDecimals(step), countDecimals(minValue)),
    rounded: Dynamic = precision === 0 ? snapped : Number(snapped.toFixed(precision));
  return Math.max(minValue, Math.min(maxValue, rounded));
}
function PropertyRangeRow({
  label: label,
  value: currentValue,
  onValue: onValue,
  onLive: onLive,
  onLiveEnd: onLiveEnd,
  min: minValue = 0,
  max = 100,
  step = 1,
  unit: unit,
  adornment: adornment,
  mixed = false,
  onReset: onReset,
  disabled: isDisabled,
  title: title,
  description: description,
}: Dynamic): Dynamic {
  useUiLocale();
  let cleanupCallbacksRef: Dynamic = (0, reactPropertiesSection.useRef)(new Set()),
    latestLiveEndRef: Dynamic = (0, reactPropertiesSection.useRef)(onLiveEnd);
  latestLiveEndRef.current = onLiveEnd;
  let latestValueRef: Dynamic = (0, reactPropertiesSection.useRef)(currentValue);
  (0, reactPropertiesSection.useEffect)(
    (): Dynamic => (): Dynamic => {
      for (let cleanup of cleanupCallbacksRef.current as Dynamic) cleanup();
      cleanupCallbacksRef.current.clear();
    },
    [],
  );
  let handlePointerDown: Dynamic = (event?: Dynamic): Dynamic => {
      if (isDisabled || event.button !== 0) return;
      let currentTarget: Dynamic = event.currentTarget,
        bounds: Dynamic = currentTarget.getBoundingClientRect(),
        pointerId: Dynamic = event.pointerId;
      try {
        currentTarget.setPointerCapture(pointerId);
      } catch {}
      currentTarget.focus();
      let lastValue: Dynamic = currentValue,
        hasChanged: Dynamic = false,
        applyPosition: Dynamic = (clientX?: Dynamic): Dynamic => {
          let newValue: Dynamic = rangeValue(
            (clientX - bounds.left - 6) / (bounds.width - 12),
            minValue,
            max,
            step,
          );
          newValue !== lastValue &&
            ((lastValue = newValue), (hasChanged = true), (onLive ?? onValue)(newValue));
        };
      applyPosition(event.clientX);
      let handlePointerMove: Dynamic = (moveEvent?: Dynamic): Dynamic => {
          moveEvent.pointerId === pointerId && applyPosition(moveEvent.clientX);
        },
        removeWindowListeners: Dynamic = (): Dynamic => {
          (window as Dynamic).removeEventListener("pointermove", handlePointerMove);
          (window as Dynamic).removeEventListener("pointerup", handlePointerEnd);
          (window as Dynamic).removeEventListener("pointercancel", handlePointerEnd);
        },
        finishDrag: Dynamic = (): Dynamic => {
          cleanupCallbacksRef.current.delete(finishDrag);
          removeWindowListeners();
          hasChanged && ((hasChanged = false), latestLiveEndRef.current?.(lastValue));
        },
        handlePointerEnd: Dynamic = (endEvent?: Dynamic): Dynamic => {
          endEvent.pointerId === pointerId && finishDrag();
        };
      (window as Dynamic).addEventListener("pointermove", handlePointerMove);
      (window as Dynamic).addEventListener("pointerup", handlePointerEnd);
      (window as Dynamic).addEventListener("pointercancel", handlePointerEnd);
      cleanupCallbacksRef.current.add(finishDrag);
    },
    handleKeyDown: Dynamic = (event?: Dynamic): Dynamic => {
      if (isDisabled) return;
      let nextValue: Dynamic;
      if (event.key === "ArrowRight" || event.key === "ArrowUp")
        nextValue = stepNumericValue(currentValue, 1, event, {
          step: step,
          min: minValue,
          max: max,
        });
      else if (event.key === "ArrowLeft" || event.key === "ArrowDown")
        nextValue = stepNumericValue(currentValue, -1, event, {
          step: step,
          min: minValue,
          max: max,
        });
      else if (event.key === "Home") nextValue = minValue;
      else if (event.key === "End") nextValue = max;
      else if (event.key === " ") {
        event.preventDefault();
        return;
      }
      nextValue !== undefined &&
        (event.preventDefault(), nextValue !== currentValue && onValue(nextValue));
    },
    thumbFraction: Dynamic = rangeFraction(currentValue, minValue, max);
  return (
    <PropertyRow
      label={label}
      title={title}
      description={description}
      disabled={isDisabled}
      onReset={onReset}
    >
      <div className={"w-[68px] shrink-0"}>
        <NumericInput
          aria-label={label}
          value={mixed ? undefined : currentValue}
          mixed={mixed}
          emptyStepFrom={mixed ? null : undefined}
          onValue={(enteredValue?: Dynamic): Dynamic => {
            enteredValue !== undefined && onValue(enteredValue);
          }}
          onScrub={(scrubbedValue?: Dynamic): Dynamic => {
            latestValueRef.current = scrubbedValue;
            (onLive ?? onValue)(scrubbedValue);
          }}
          onScrubEnd={(): Dynamic => latestLiveEndRef.current?.(latestValueRef.current)}
          min={minValue}
          max={max}
          step={step}
          scrubOrigin={minValue}
          unit={unit}
          steppers={false}
          disabled={isDisabled}
        />
      </div>
      <div
        role={"slider"}
        aria-label={label}
        aria-valuemin={minValue}
        aria-valuemax={max}
        aria-valuenow={mixed ? undefined : currentValue}
        aria-valuetext={mixed ? MixedValue : undefined}
        aria-disabled={isDisabled || undefined}
        tabIndex={isDisabled ? -1 : 0}
        onPointerDown={handlePointerDown}
        onKeyDown={handleKeyDown}
        className={
          "group/track relative ml-1 flex h-control min-w-8 flex-1 touch-none select-none items-center px-1.5 outline-none focus-visible:outline-hidden aria-disabled:opacity-50 pointer-coarse:h-10"
        }
      >
        <div className={"h-0.5 w-full rounded-full bg-alpha-2"}>
          {mixed ? (null) : (<div
              className={"h-full rounded-full bg-fill-accent"}
              style={{
                width: String(thumbFraction * 100) + "%",
              }}
            />)}
        </div>
        {mixed ? (null) : (<div
            data-kit={"slider-thumb"}
            className={joinClassNames(
              "pointer-events-none absolute h-3 w-3 -translate-x-1/2 rounded-full",
              "bg-surface-3 shadow-panel-sm group-focus-visible/track:shadow-focus",
            )}
            style={{
              left: "calc(" + String(thumbFraction) + " * (100% - 12px) + 6px)",
            }}
          />)}
      </div>
      {adornment}
    </PropertyRow>
  );
}
function PropertyBooleanRow({
  label: label,
  checked: checked,
  onChange: onChange,
  onReset: onReset,
  disabled: isDisabled,
  title: title,
  description: description,
}: Dynamic): Dynamic {
  useUiLocale();
  return (
    <PropertyRow
      label={label}
      title={title}
      description={description}
      disabled={isDisabled}
      onReset={onReset}
      onPress={(): Dynamic => onChange(!checked)}
    >
      <Switch
        checked={checked}
        onCheckedChange={(isChecked?: Dynamic): Dynamic => onChange(isChecked)}
        aria-label={label}
        disabled={isDisabled}
      />
    </PropertyRow>
  );
}
function PropertyEnumRow({
  label: label,
  options: choices,
  value: selectedValue,
  onChange: onChange,
  popupAttrs: popupAttrs,
  onReset: onReset,
  disabled: isDisabled,
  title: title,
  description: description,
}: Dynamic): Dynamic {
  useUiLocale();
  let usesDropdown: Dynamic = choices.length > PropertiesRowsLimit;
  return (
    <PropertyRow
      label={label}
      title={title}
      description={description}
      disabled={isDisabled}
      onReset={onReset}
      onPress={
        usesDropdown
          ? (element?: Dynamic): Dynamic =>
              element.querySelector('[data-kit="PropertySelect"]')?.click()
          : undefined
      }
    >
      {usesDropdown ? (<PropertySelect
          aria-label={label}
          items={choices.map(
            (option?: Dynamic): Dynamic => ({
              value: option.value,
              label: option.label,
            }),
          )}
          value={selectedValue}
          onChange={onChange}
          disabled={isDisabled}
          popupAttrs={popupAttrs}
        />) : (<SegmentedControl
          aria-label={label}
          fullWidth={
            !choices.every(
              (option?: Dynamic): Dynamic => option.icon !== undefined,
            )
          }
          segments={choices.map((option?: Dynamic): Dynamic => {
            let disabledState: Dynamic = {
              disabled: isDisabled || option.whyDisabled !== undefined,
              disabledReason: option.whyDisabled,
            };
            return option.icon !== undefined
              ? {
                  value: option.value,
                  icon: option.icon,
                  tooltip: option.title ?? option.label,
                  ...disabledState,
                }
              : {
                  value: option.value,
                  label: option.label,
                  tooltip: option.title,
                  ...disabledState,
                };
          })}
          value={selectedValue}
          onChange={isDisabled ? (): Dynamic => {} : onChange}
        />)}
    </PropertyRow>
  );
}
function PropertySelectRow({
  label: label,
  icon: icon,
  hint: hint,
  options: choices,
  value: selectedValue,
  onChange: onChange,
  placeholder: placeholder,
  popupAttrs: popupAttrs,
  searchable: searchable,
  searchLabel: searchLabel,
  onOpenChange: onOpenChange,
  trailing: trailing,
  onReset: onReset,
  disabled: isDisabled,
  title: title,
  description: description,
}: Dynamic): Dynamic {
  useUiLocale();
  return (
    <PropertyRow
      label={label}
      title={title}
      description={description}
      disabled={isDisabled}
      onReset={onReset}
      trailing={trailing}
      onPress={(element?: Dynamic): Dynamic =>
        element.querySelector('[data-kit="PropertySelect"]')?.click()
      }
    >
      <PropertySelect
        aria-label={label}
        icon={icon}
        hint={hint}
        items={choices}
        value={selectedValue}
        onChange={onChange}
        placeholder={placeholder}
        disabled={isDisabled}
        popupAttrs={popupAttrs}
        searchable={searchable}
        searchLabel={searchLabel}
        onOpenChange={onOpenChange}
      />
    </PropertyRow>
  );
}
function ColorWellFace({
  hex: hex,
  alpha = 100,
  className: className,
}: Dynamic): Dynamic {
  useUiLocale();
  return (
    <span
      aria-hidden={"true"}
      className={joinClassNames(
        PropertiesPrimitivesClassNames_2,
        className,
      )}
    >
      {hex !== null ? (<jsxPropertiesColorPicker.Fragment>
          <span
            className={"absolute inset-y-0 left-0 w-1/2"}
            style={{
              backgroundColor: hex,
            }}
          />
          <span
            className={"absolute inset-y-0 right-0 w-1/2"}
            style={{
              backgroundColor: hex,
              opacity: Math.round(alpha * 100) / 1e4,
            }}
          />
        </jsxPropertiesColorPicker.Fragment>) : (null)}
    </span>
  );
}
function useColorContrast(contrast?: Dynamic, colorText?: Dynamic): Dynamic {
  let contrastKey: Dynamic =
    contrast === undefined ? undefined : JSON.stringify(contrast);
  return (0, reactPropertiesSection.useMemo)(
    (): Dynamic =>
      contrast === undefined || colorText === undefined
        ? undefined
        : evaluateColorContrast(colorText, contrast),
    [contrastKey, colorText],
  );
}
function PropertyColorRow({
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
  closeLabel = CloseValue,
  popoverTitle: popoverTitle,
  allowNone: allowNone,
  onNone: onNone,
  isNone: isNone,
  noneDisabledReason: noneDisabledReason,
  disabled: isDisabled,
  disabledReason: disabledReason,
  keepFocus = false,
  editsAreUndoSteps: editsAreUndoSteps,
  popover: popover,
  open: open,
  onOpenChange: onOpenChange,
  title: title,
  testid: testid,
}: Dynamic): Dynamic {
  useUiLocale();
  let [isOpenInternal, setIsOpenInternal]: Dynamic = (0,
    reactPropertiesSection.useState)(false),
    isOpen: Dynamic = open ?? isOpenInternal,
    setOpen: Dynamic = (nextOpen?: Dynamic): Dynamic => {
      setIsOpenInternal(nextOpen);
      onOpenChange?.(nextOpen);
    },
    [shouldFocusOnOpen, setShouldFocusOnOpen]: Dynamic = (0, reactPropertiesSection.useState)(
      false,
    ),
    openedByKeyboardRef: Dynamic = (0, reactPropertiesSection.useRef)(false),
    triggerRef: Dynamic = (0, reactPropertiesSection.useRef)(null),
    anchorOf: Dynamic = popover?.anchor,
    getAnchor: Dynamic =
      anchorOf === undefined
        ? undefined
        : (): Dynamic =>
            triggerRef.current === null ? null : anchorOf(triggerRef.current),
    parsedColor: Dynamic = (0,
    reactPropertiesSection.useMemo)((): Dynamic => {
      let sourceColor: Dynamic = colorValue ?? placeholder;
      if (sourceColor === undefined) return;
      let parsedHsva: Dynamic = parseHsvaColor(sourceColor);
      return {
        solid: hsvaToRgbHex(parsedHsva),
        alpha: parsedHsva.a,
      };
    }, [colorValue, placeholder]),
    isHexColor: Dynamic =
      colorValue !== undefined && PropertiesRowsRgbaPattern.test(colorValue),
    swatchLabel: Dynamic = (0,
    reactPropertiesSection.useMemo)((): Dynamic => {
      if (!isHexColor || parsedColor === undefined) return;
      if (valueName !== undefined) return valueName ?? undefined;
      if (swatches === undefined) return;
      if (current !== undefined) {
        if (current === null) return;
        let matchedSwatch: Dynamic = swatches.find(
          (swatch?: Dynamic): Dynamic =>
            typeof swatch != "string" &&
            (swatch.name === current ||
              ("picks" in swatch && swatch.picks === current)),
        );
        return matchedSwatch !== undefined &&
          typeof matchedSwatch != "string" &&
          matchedSwatch.label !== undefined &&
          matchedSwatch.label.trim() !== ""
          ? matchedSwatch.label
          : undefined;
      }
      let solidHex: Dynamic = parsedColor.solid.toLowerCase();
      for (let swatch of swatches as Dynamic) {
        let swatchValue: Dynamic =
          typeof swatch == "string"
            ? swatch
            : "value" in swatch
              ? swatch.value
              : swatch.color;
        if (!PropertiesRowsRgbaPattern.test(swatchValue)) continue;
        let swatchHsva: Dynamic = parseHsvaColor(swatchValue);
        if (
          !(swatchHsva.a < 1) &&
          hsvaToRgbHex(swatchHsva).toLowerCase() === solidHex
        )
          return typeof swatch != "string" &&
            swatch.label !== undefined &&
            swatch.label.trim() !== ""
            ? swatch.label
            : undefined;
      }
    }, [isHexColor, parsedColor, swatches, current, valueName]),
    displayText: Dynamic =
      colorValue !== undefined
        ? typeof valueName == "string"
          ? valueName
          : isHexColor && parsedColor !== undefined
            ? (swatchLabel ?? parsedColor.solid.toUpperCase())
            : colorValue
        : (clearLabel ?? placeholder ?? "None"),
    alphaText: Dynamic =
      isHexColor && parsedColor !== undefined && parsedColor.alpha < 1
        ? Math.round(parsedColor.alpha * 100) + "%"
        : undefined,
    contrastColor: Dynamic =
      mixed || chip !== undefined ? undefined : (colorValue ?? placeholder),
    contrastResults: Dynamic = useColorContrast(contrast, contrastColor),
    contrastSentence: Dynamic = (0, reactPropertiesSection.useMemo)(
      (): Dynamic =>
        contrastResults === undefined
          ? undefined
          : summarizeContrastResults(contrastResults).sentence,
      [contrastResults],
    ),
    fullDescription: Dynamic =
      description !== undefined && description !== ""
        ? contrastSentence !== undefined
          ? description.replace(/\.?\s*$/, ". ") + contrastSentence
          : description
        : contrastSentence,
    descriptionId: Dynamic = (0, reactPropertiesSection.useId)(),
    hasSwatches: Dynamic = swatches !== undefined && swatches.length > 0,
    isColorTab: Dynamic =
      headerTabs === undefined ||
      headerTabs.value === (headerTabs.colorTab ?? "color"),
    [swatchTab, setSwatchTab]: Dynamic = (0,
    reactPropertiesSection.useState)("system"),
    [wasOpen, setWasOpen]: Dynamic = (0,
    reactPropertiesSection.useState)(isOpen);
  isOpen !== wasOpen &&
    (setWasOpen(isOpen),
    isOpen &&
      (setSwatchTab(hasSwatches && isColorTab ? "system" : "custom"),
      setShouldFocusOnOpen(openedByKeyboardRef.current),
      (openedByKeyboardRef.current = false)));
  let pickerContent: Dynamic = (
    <ColorPickerWithSwatches
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
              onPick: (): Dynamic => {
                onNone ? onNone() : onChange(undefined);
                setOpen(false);
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
      tab={hasSwatches ? swatchTab : undefined}
      onTab={setSwatchTab}
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
            onClick={(): Dynamic => setOpen(false)}
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
      title={isDisabled ? (disabledReason) : (undefined)}
    >
      <EditorPopover
        open={isOpen}
        onOpen={(): Dynamic => setOpen(true)}
        onClose={(): Dynamic => setOpen(false)}
        trigger={
          <PropertyPickerButton
            data-testid={testid}
            title={isDisabled ? (disabledReason ?? (title)) : (title)}
            aria-label={
              label + ": " + (mixed ? MixedValue : chip !== undefined ? chip.text : colorValue !== undefined ? displayText + (alphaText !== undefined ? " " + alphaText : "") : clearLabel !== undefined && /[\p{L}\p{N}]/u.test(clearLabel) ? clearLabel : clearLabel !== undefined ? uiMessage("inspector.rows.none") : uiMessage("inspector.rows.unset"))
            }
            aria-describedby={fullDescription !== undefined ? descriptionId : undefined}
            disabled={isDisabled}
            onClick={(event?: Dynamic): Dynamic => {
              isOpen || (openedByKeyboardRef.current = event.detail === 0);
            }}
            onMouseDown={keepFocus ? PropertiesRowsPreventDefault : undefined}
            muted={mixed}
            chip={
              mixed ? (
                <PropertyColorWell data-kit={"swatch-mixed"}>
                  <span
                    className={"absolute inset-y-0 left-0 w-1/2"}
                    style={{
                      backgroundColor: "#ffffff",
                    }}
                  />
                  <span
                    className={"absolute inset-y-0 right-0 w-1/2"}
                    style={{
                      backgroundColor: "#141413",
                    }}
                  />
                </PropertyColorWell>
              ) : chip !== undefined ? (
                <PropertyColorWell
                  data-kit={"swatch-chip"}
                  background={chip.css}
                />
              ) : (
                <ColorWellFace
                  hex={parsedColor?.solid ?? null}
                  alpha={(parsedColor?.alpha ?? 1) * 100}
                />
              )
            }
            caption={!mixed && chip === undefined ? alphaText : undefined}
            trailing={
              contrastMark && contrastResults !== undefined ? (
                <ContrastMark
                  results={contrastResults}
                  sentence={false}
                  className={"ml-auto pl-1"}
                />
              ) : undefined
            }
          >
            {mixed ? (MixedValue) : (chip !== undefined ? (chip.text) : (displayText))}
          </PropertyPickerButton>
        }
        align={"left"}
        side={popover?.side}
        positionAnchor={getAnchor}
        padding={"none"}
        aria-label={popoverTitle ?? (label)}
        className={ColorPickerLabel}
        popupAttrs={popupAttrs}
        editsAreUndoSteps={editsAreUndoSteps}
        focusOnOpen={shouldFocusOnOpen}
        keepFocus={keepFocus}
        planHeight={
          hasSwatches || headerTabs !== undefined
            ? ColorPickerConstant
            : undefined
        }
      >
        {keepFocus ? (<div
            data-session-strip={""}
            onKeyDownCapture={preventInputEnterSubmit}
          >
            {pickerContent}
          </div>) : (pickerContent)}
      </EditorPopover>
      {fullDescription !== undefined ? (<span id={descriptionId} hidden={true} data-kit={"field-description"}>
          {fullDescription}
        </span>) : (null)}
    </span>
  );
}
function PropertyHexRow({
  label: label,
  value: hexValue,
  onChange: onChange,
  contrast: contrast,
  placeholder: placeholder,
  clearLabel: clearLabel,
  adornment: adornment,
  trailing: trailing,
  mixed = false,
  chip: chip,
  onReset: onReset,
  disabled: isDisabled,
  title: title,
  description: description,
  ...props
}: Dynamic): Dynamic {
  useUiLocale();
  let [isOpen, setIsOpen]: Dynamic = (0,
  reactPropertiesSection.useState)(false);
  return (
    <PropertyRow
      label={label}
      title={title}
      disabled={isDisabled}
      onReset={
        onReset ??
        (clearLabel !== undefined && hexValue !== undefined
          ? (): Dynamic => onChange(undefined)
          : undefined)
      }
      trailing={trailing}
      onPress={(): Dynamic => {
        isDisabled || setIsOpen(!isOpen);
      }}
      onPointerDown={(event?: Dynamic): Dynamic => {
        isOpen &&
          !isNestedPropertyControl(
            event.currentTarget,
            event.target,
          ) &&
          event.stopPropagation();
      }}
    >
      <PropertyColorRow
        {...props}
        label={label}
        value={hexValue}
        onChange={onChange}
        description={description}
        contrast={contrast}
        placeholder={placeholder}
        clearLabel={clearLabel}
        mixed={mixed}
        chip={chip}
        disabled={isDisabled}
        open={isOpen}
        onOpenChange={setIsOpen}
      />
      {adornment}
    </PropertyRow>
  );
}
export {
  ColorWellFace,
  jsxPropertiesRows,
  PropertiesRowsLimit,
  PropertiesRowsPreventDefault,
  PropertiesRowsRgbaPattern,
  PropertyBooleanRow,
  PropertyColorRow,
  PropertyEnumRow,
  PropertyHexRow,
  PropertyNumberRow,
  PropertyPanelRoot,
  PropertyRangeRow,
  PropertySelectRow,
  PropertyTextRow,
  rangeFraction,
  rangeValue,
  useColorContrast,
};
export function installEditorPropertiesRows(): () => void {
  return () => {
    PropertiesRowsLimit = 4;
    PropertiesRowsRgbaPattern =
      /^(?:#(?:[0-9a-f]{3,4}|[0-9a-f]{6}|[0-9a-f]{8})|rgba?\(\s*[\d.]+[\s,]+[\d.]+[\s,]+[\d.]+(?:[\s,/]+[\d.]+)?\s*\))$/i;
    PropertiesRowsPreventDefault = (event?: Dynamic): Dynamic =>
      event.preventDefault();
    jsxPropertiesRows = toModuleNamespace(
      load_react_jsx_runtime(),
      1,
    );
  };
}
