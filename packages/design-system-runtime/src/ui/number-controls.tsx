import { uiMessage } from '@minedesign/contracts/ui-messages';
import { useUiLocale } from '../ui-locale.ts';
import type * as React from "react";
import type * as Color from "../contracts/color-controls";
/** Restored application module; prepare first, initialize in original order. */
import { loadJsxNamespace, loadReactNamespace } from "../dependencies";
import { toModuleNamespace } from "../module-helpers";
import { announceLiveMessage } from "./announcements";
import { NumberInput } from "./number-input";
import { joinClassNames, KitIcon } from "./property-icons";
import { DECREASE_LABEL, INCREASE_LABEL, MIXED_LABEL, numberChangeRefusalMessage } from "./property-labels";

var reactPropertyNumberInput: typeof import("react");
var reactForUiNumberControls: typeof import("react");
var activeNumberScrubCleanup: (() => void) | null;
var jsxForUiNumberControls: typeof import("react/jsx-runtime");
var PROPERTY_NUMBER_FORMAT_OPTIONS: Intl.NumberFormatOptions;
var propertyNumberFormatter: Intl.NumberFormat;
var PROPERTY_NUMBER_UNIT_CLASS: string;
var PROPERTY_NUMBER_INPUT_CLASS: string;
var PROPERTY_NUMBER_STEPPER_CLASS: string;
function decimalPlaces(value: number): number {
  let numberText = String(value),
    decimalPoint = numberText.indexOf(".");
  if (decimalPoint === -1 || numberText.includes("e")) {
    return 0;
  } else {
    return numberText.length - decimalPoint - 1;
  }
}
function roundScrubValue(value: number, step: number): number {
  let roundingScale = 10 ** scrubPrecision(step);
  return Math.round(value * roundingScale) / roundingScale;
}
function scrubPrecision(step: number): number {
  return Math.max(
    2,
    decimalPlaces(step),
    Math.ceil(-Math.log10(Math.max(step, Number.EPSILON))),
  );
}
function snapScrubValue(
  value: number,
  step: number,
  origin?: number | null,
): number {
  if (!(step > 0) || !Number.isFinite(step) || !Number.isFinite(value)) {
    return value + 0;
  }
  let snapStep = origin == null && Number.isInteger(step) ? 1 : step,
    snapOrigin = origin ?? 0,
    stepOffset = (value - snapOrigin) / snapStep,
    roundedSteps = Math.round(Number(stepOffset.toPrecision(12))),
    roundingScale = 10 ** Math.max(scrubPrecision(snapStep), decimalPlaces(snapOrigin)),
    snappedValue = Math.round((roundedSteps * snapStep + snapOrigin) * roundingScale) / roundingScale + 0;
  if (Math.abs(stepOffset) < 1000000000000 && Number.isFinite(snappedValue)) {
    return snappedValue;
  }
  let roundedFallback = roundScrubValue(value, step) + 0;
  if (Number.isFinite(roundedFallback)) {
    return roundedFallback;
  } else {
    return value + 0;
  }
}
function createNumberScrubGesture(
  getOptions: () => Color.NumberScrubOptions,
  startX: number,
): Color.NumberScrubGesture {
  let value = startX,
    unsnappedValue: number | null = null,
    flag = false;
  return {
    move(clientX: number, accelerate?: boolean) {
      let scrubOptions = getOptions(),
        deltaX = clientX - value;
      value = clientX;
      if (!flag) {
        if (deltaX === 0) {
          return;
        }
        flag = true;
        scrubOptions.onScrubbing?.(true);
      }
      if (unsnappedValue == null) {
        unsnappedValue = Number.isFinite(scrubOptions.value) ? scrubOptions.value : 0;
      }
      let step = scrubOptions.step ?? 1,
        callback = (candidateValue: number) =>
          Math.min(
            scrubOptions.max ?? 1 / 0,
            Math.max(scrubOptions.min ?? -1 / 0, candidateValue),
          );
      unsnappedValue = callback(unsnappedValue + deltaX * step * (accelerate ? 10 : 1));
      let scrubbedValue =
        unsnappedValue === scrubOptions.min || unsnappedValue === scrubOptions.max
          ? unsnappedValue
          : callback(snapScrubValue(unsnappedValue, step, scrubOptions.origin));
      scrubOptions.onScrub(scrubbedValue + 0);
    },
    up() {
      if (!flag) {
        return;
      }
      let scrubOptions = getOptions();
      scrubOptions.onScrubbing?.(false);
      scrubOptions.onScrubEnd?.();
    },
    get live() {
      return flag;
    },
  };
}
function useNumberScrubGesture(
  options: Color.NumberScrubOptions,
): React.MouseEventHandler<HTMLElement> {
  let ref = reactForUiNumberControls.useRef(options);
  ref.current = options;
  let gestureCleanupRef = reactForUiNumberControls.useRef<(() => void) | null>(null);
  reactForUiNumberControls.useEffect(
    () => () => {
      if (gestureCleanupRef.current && gestureCleanupRef.current === activeNumberScrubCleanup) {
        gestureCleanupRef.current();
      }
    },
    [],
  );
  return (event) => {
    if (ref.current.disabled) {
      return;
    }
    if (event.button !== 0) {
      return;
    }
    event.preventDefault();
    let activeElement = document.activeElement;
    if (
      activeElement &&
      activeElement !== event.currentTarget &&
      (activeElement.tagName === "INPUT" ||
        activeElement.tagName === "TEXTAREA")
    ) {
      (activeElement as HTMLElement).blur?.();
    }
    gestureCleanupRef.current = attachNumberScrubGesture(
      createNumberScrubGesture(() => ref.current, event.clientX),
    );
  };
}
function captureNumberScrubPointer(
  event: React.PointerEvent<HTMLElement>,
): void {
  if (event.button !== 0 || event.pointerType === "touch") {
    return;
  }
  try {
    event.currentTarget.setPointerCapture(event.pointerId);
  } catch {}
}
function attachNumberScrubGesture(
  gesture: Color.NumberScrubGesture,
  ownWindow: Window = window,
): () => void {
  activeNumberScrubCleanup?.();
  let callback = (mouseEvent: MouseEvent) => {
      let value = mouseEvent;
      if (value.buttons === 0) {
        finishGesture();
        return;
      }
      gesture.move(value.clientX, value.shiftKey);
    },
    handleEscape = (event: KeyboardEvent) => {
      if (event.key !== "Escape") {
        return;
      }
      if (gesture.live) {
        event.preventDefault();
      }
      finishGesture();
    },
    finishGesture = () => {
      if (activeNumberScrubCleanup === finishGesture) {
        activeNumberScrubCleanup = null;
      }
      ownWindow.removeEventListener("mousemove", callback);
      ownWindow.removeEventListener("mouseup", finishGesture);
      ownWindow.removeEventListener("blur", finishGesture);
      ownWindow.removeEventListener("keydown", handleEscape, true);
      gesture.up();
    };
  activeNumberScrubCleanup = finishGesture;
  ownWindow.addEventListener("mousemove", callback);
  ownWindow.addEventListener("mouseup", finishGesture);
  ownWindow.addEventListener("blur", finishGesture);
  ownWindow.addEventListener("keydown", handleEscape, true);
  return finishGesture;
}
function numberInputDecimalPlaces(value: number): number {
  let numberText = String(value),
    decimalPoint = numberText.indexOf(".");
  if (decimalPoint === -1 || numberText.includes("e")) {
    return 0;
  } else {
    return numberText.length - decimalPoint - 1;
  }
}
function PropertyNumberInput({
  value: numberValue,
  onValue: onValue,
  onScrub: onScrub,
  onScrubEnd: onScrubEnd,
  prefix: prefix,
  unit: unit,
  unitScrubs = true,
  refuseLetters = false,
  ownUnit = typeof unit === "string" ? unit : undefined,
  min: min,
  max: max,
  step: step,
  scrubOrigin: scrubOrigin,
  smallStep: smallStep,
  emptyStepFrom: emptyStepFrom,
  placeholder: placeholder,
  hint: hint,
  clearable: clearable,
  mixed = false,
  steppers = true,
  fullWidth = true,
  disabled: disabled,
  title: title,
  "aria-label": ariaLabel,
  inputRef: inputRef,
  className: className,
}: Color.PropertyNumberInputProps): React.ReactElement {
  useUiLocale();
  let ref = reactPropertyNumberInput.useRef<HTMLInputElement | null>(null),
    callback = reactPropertyNumberInput.useCallback(
      (element: HTMLInputElement | null) => {
        ref.current = element;
        if (typeof inputRef === "function") {
          inputRef(element);
        } else if (inputRef) {
          inputRef.current = element;
        }
      },
      [inputRef],
    ),
    hasUnit =
      unit !== undefined && unit !== null && unit !== false && unit !== "",
    numericPlaceholder =
      numberValue === undefined &&
      !mixed &&
      emptyStepFrom !== null &&
      placeholder !== undefined &&
      /^-?\d+(\.\d+)?$/.test(placeholder)
        ? Number(placeholder)
        : undefined,
    displayedNumber = numberValue ?? numericPlaceholder,
    suppressCommitRef = reactPropertyNumberInput.useRef(false),
    pendingSelectAllRef = reactPropertyNumberInput.useRef(false),
    stepBlurRef = reactPropertyNumberInput.useRef(false),
    typedUnitRef = reactPropertyNumberInput.useRef(""),
    refuseNextStepRef = reactPropertyNumberInput.useRef(false),
    rejectTypedUnit = () => {
      let typedUnit = typedUnitRef.current.toLowerCase();
      typedUnitRef.current = "";
      if (
        !refuseLetters ||
        !typedUnit ||
        typedUnit === (ownUnit ?? "").toLowerCase()
      ) {
        return false;
      }
      if (stepBlurRef.current) {
        refuseNextStepRef.current = true;
      }
      return true;
    },
    regularStep = step ?? 1,
    fineStep = smallStep ?? Math.min(0.1, regularStep),
    fieldLabel =
      ariaLabel ||
      (typeof prefix === "string" && prefix !== "" ? prefix : undefined),
    commitNumber = (nextNumber: number | null) => {
      if (suppressCommitRef.current) {
        return;
      }
      if (rejectTypedUnit()) {
        announceLiveMessage(
          numberChangeRefusalMessage(fieldLabel, ownUnit),
        );
        return;
      }
      if (nextNumber === null) {
        if (
          clearable &&
          !mixed &&
          numberValue !== undefined &&
          !(stepBlurRef.current && emptyStepFrom !== undefined)
        ) {
          onValue(undefined);
        }
        return;
      }
      if (numberValue === undefined && min !== undefined) {
        nextNumber = Math.max(min, nextNumber);
      }
      if (numberValue === undefined && max !== undefined) {
        nextNumber = Math.min(max, nextNumber);
      }
      if (mixed || nextNumber !== numberValue) {
        onValue(nextNumber);
      }
    },
    handleInputKeyDown = (event: Color.NumberInputKeyEvent) => {
      pendingSelectAllRef.current = false;
      refuseNextStepRef.current = false;
      if (!event.metaKey && !event.ctrlKey) {
        if (/^[a-zA-Z%]$/.test(event.key)) {
          typedUnitRef.current += event.key;
        } else if (/^[0-9.\-]$/.test(event.key)) {
          typedUnitRef.current = "";
        }
      }
      if (event.key === "Enter") {
        event.preventDefault();
        let current = ref.current;
        current?.blur();
        current?.focus();
        current?.select();
        pendingSelectAllRef.current = true;
        queueMicrotask(() => {
          if (!pendingSelectAllRef.current || !current) {
            return;
          }
          pendingSelectAllRef.current = false;
          if (current.ownerDocument.activeElement === current) {
            current.select();
          }
        });
        return;
      }
      if (event.key === "Escape") {
        event.preventDefault();
        typedUnitRef.current = "";
        suppressCommitRef.current = true;
        ref.current?.blur();
        suppressCommitRef.current = false;
        return;
      }
      if (event.key === "ArrowUp" || event.key === "ArrowDown") {
        if (
          emptyStepFrom !== undefined &&
          (ref.current?.value ?? "").trim() === ""
        ) {
          let preventBaseUIHandler = event.preventBaseUIHandler;
          if (preventBaseUIHandler) {
            preventBaseUIHandler.call(event);
          }
          event.preventDefault();
          event.stopPropagation();
          applyStep(event.key === "ArrowUp" ? 1 : -1, event);
        }
        let current = ref.current;
        pendingSelectAllRef.current = true;
        setTimeout(() => {
          if (!pendingSelectAllRef.current || !current) {
            return;
          }
          pendingSelectAllRef.current = false;
          if (current.ownerDocument.activeElement === current) {
            current.select();
          }
        }, 0);
        return;
      }
      if (event.key === "Home" || event.key === "End") {
        let preventBaseUIHandler = event.preventBaseUIHandler;
        if (preventBaseUIHandler) {
          preventBaseUIHandler.call(event);
        } else {
          event.preventDefault();
        }
        event.stopPropagation();
        return;
      }
      event.stopPropagation();
    },
    scrubStart =
      numberValue ??
      (typeof emptyStepFrom === "number" && Number.isFinite(emptyStepFrom)
        ? emptyStepFrom
        : onScrub
          ? numericPlaceholder
          : undefined),
    canScrub = !disabled && !mixed && scrubStart !== undefined,
    [scrubState, setScrubState] =
      reactPropertyNumberInput.useState<Color.NumberScrubState | null>(null),
    startScrubbing = useNumberScrubGesture({
      value: scrubStart ?? NaN,
      step: step,
      min: min,
      max: max,
      origin: scrubOrigin,
      disabled: !canScrub,
      onScrub: (nextNumber) => {
        setScrubState((previousScrub) => ({
          from: previousScrub ? previousScrub.from : numberValue,
          v: nextNumber,
          hostMoved:
            !!previousScrub && (previousScrub.hostMoved || !Object.is(numberValue, previousScrub.from)),
        }));
        (onScrub ?? onValue)(nextNumber);
      },
      onScrubEnd: () => {
        setScrubState(null);
        onScrubEnd?.();
      },
    }),
    handleScrubMouseDown = (mouseEvent: React.MouseEvent<HTMLElement>) => {
      startScrubbing(mouseEvent);
      mouseEvent.stopPropagation();
    },
    refocusInput = () => {
      let current = ref.current;
      if (!current) {
        return;
      }
      refuseNextStepRef.current = false;
      if (current.ownerDocument.activeElement === current) {
        stepBlurRef.current = true;
        try {
          current.blur();
        } finally {
          stepBlurRef.current = false;
        }
      }
      current.focus({
        preventScroll: true,
      });
    },
    applyStep = (
      direction: number,
      modifiers: {
        altKey: boolean;
        shiftKey: boolean;
      },
    ) => {
      let formattedNumber =
          displayedNumber === undefined || mixed
            ? ""
            : propertyNumberFormatter.format(displayedNumber),
        consumeStepRefusal = () => {
          if (!refuseNextStepRef.current) {
            return false;
          }
          refuseNextStepRef.current = false;
          typedUnitRef.current = "";
          return true;
        };
      if (consumeStepRefusal()) {
        return;
      }
      let current = ref.current;
      if (
        current &&
        current.ownerDocument.activeElement === current &&
        current.value !== formattedNumber
      ) {
        refocusInput();
      }
      if (consumeStepRefusal()) {
        return;
      }
      typedUnitRef.current = "";
      let inputText = ref.current?.value ?? "",
        typedNumber =
          inputText !== formattedNumber ? Number.parseFloat(inputText) : Number.NaN,
        isEmpty = mixed || inputText.trim() === "";
      if (isEmpty && !Number.isFinite(typedNumber) && emptyStepFrom === null) {
        return;
      }
      let startingNumber = Number.isFinite(typedNumber)
          ? typedNumber
          : isEmpty
            ? (emptyStepFrom ?? min ?? 0)
            : (displayedNumber ?? 0),
        increment = modifiers.altKey
          ? fineStep
          : regularStep * (modifiers.shiftKey ? 10 : 1),
        decimalPrecision = Math.min(
          20,
          Math.max(
            numberInputDecimalPlaces(startingNumber),
            numberInputDecimalPlaces(regularStep),
            modifiers.altKey ? numberInputDecimalPlaces(fineStep) : 0,
          ),
        ),
        steppedNumber = Number((startingNumber + direction * increment).toFixed(decimalPrecision));
      if (min !== undefined) {
        steppedNumber = Math.max(min, steppedNumber);
      }
      if (max !== undefined) {
        steppedNumber = Math.min(max, steppedNumber);
      }
      if (mixed || steppedNumber !== displayedNumber) {
        onValue(steppedNumber);
      }
    },
    state = {
      ref: callback,
      value: mixed
        ? null
        : ((scrubState && !scrubState.hostMoved && Object.is(scrubState.from, numberValue)
            ? scrubState.v
            : displayedNumber) ?? null),
      onValueCommitted: commitNumber,
      min: min,
      max: max,
      step: regularStep,
      largeStep: regularStep * 10,
      smallStep: fineStep,
      format: PROPERTY_NUMBER_FORMAT_OPTIONS,
      locale: "en-US",
      inputMode: "decimal" as const,
      "aria-label": fieldLabel,
      disabled: disabled,
      placeholder: mixed ? MIXED_LABEL : (placeholder ?? hint),
      onKeyDown: handleInputKeyDown,
      onFocus: (event: React.FocusEvent<HTMLInputElement>) => {
        event.preventDefault();
        event.currentTarget.select();
        typedUnitRef.current = "";
      },
    },
    showSteppers = steppers;
  return (
    <NumberInput
      {...state}
      title={title}
      fullWidth={fullWidth}
      className={joinClassNames(
        "group/field min-w-12",
        !mixed &&
          numericPlaceholder === undefined &&
          placeholder !== undefined &&
          placeholder !== MIXED_LABEL &&
          "[&_input]:placeholder:text-primary",
        className,
      )}
      slotStart={
        prefix !== undefined && prefix !== "" ? (
          <span
            data-scrub={""}
            onMouseDown={canScrub ? handleScrubMouseDown : undefined}
            onPointerDown={canScrub ? captureNumberScrubPointer : undefined}
            className={joinClassNames(
              PROPERTY_NUMBER_UNIT_CLASS,
              "inline-flex items-center text-caption-medium",
              canScrub && "cursor-ew-resize",
            )}
          >
            {prefix}
          </span>
        ) : undefined
      }
      slotEnd={
        hasUnit || showSteppers ? (
          <span className={"flex items-center gap-2"}>
            {[hasUnit ? (
                <span
                  data-scrub={""}
                  onMouseDown={canScrub && unitScrubs ? handleScrubMouseDown : undefined}
                  onPointerDown={
                    canScrub && unitScrubs
                      ? captureNumberScrubPointer
                      : undefined
                  }
                  className={joinClassNames(
                    PROPERTY_NUMBER_INPUT_CLASS,
                    canScrub && unitScrubs && "cursor-ew-resize",
                  )}
                >
                  {unit}
                </span>
              ) : null, showSteppers ? (
                <span
                  className={
                    "hidden flex-col group-focus-within/field:flex pointer-coarse:hidden!"
                  }
                >
                  {[<button
                      type={"button"}
                      tabIndex={-1}
                      aria-label={
                        fieldLabel ? (((INCREASE_LABEL) + (" ")) + (fieldLabel)) : (INCREASE_LABEL)
                      }
                      className={PROPERTY_NUMBER_STEPPER_CLASS}
                      disabled={disabled}
                      onMouseDown={(
                        event: React.MouseEvent<HTMLButtonElement>,
                      ) => {
                        event.preventDefault();
                        if (event.button !== 0) {
                          return;
                        }
                        refocusInput();
                      }}
                      onMouseLeave={() => (refuseNextStepRef.current = false)}
                      onClick={(mouseEvent: React.MouseEvent<HTMLButtonElement>) =>
                        applyStep(1, mouseEvent)
                      }
                    >
                      <KitIcon name={"CaretUp"} size={12} />
                    </button>, <button
                      type={"button"}
                      tabIndex={-1}
                      aria-label={
                        fieldLabel ? (((DECREASE_LABEL) + (" ")) + (fieldLabel)) : (DECREASE_LABEL)
                      }
                      className={PROPERTY_NUMBER_STEPPER_CLASS}
                      disabled={disabled}
                      onMouseDown={(
                        event: React.MouseEvent<HTMLButtonElement>,
                      ) => {
                        event.preventDefault();
                        if (event.button !== 0) {
                          return;
                        }
                        refocusInput();
                      }}
                      onMouseLeave={() => (refuseNextStepRef.current = false)}
                      onClick={(mouseEvent: React.MouseEvent<HTMLButtonElement>) =>
                        applyStep(-1, mouseEvent)
                      }
                    >
                      <KitIcon name={"CaretDown"} size={12} />
                    </button>]}
                </span>
              ) : null]}
          </span>
        ) : undefined
      }
    />
  );
}
export {
  activeNumberScrubCleanup,
  attachNumberScrubGesture,
  captureNumberScrubPointer,
  createNumberScrubGesture,
  decimalPlaces,
  jsxForUiNumberControls,
  numberInputDecimalPlaces,
  PROPERTY_NUMBER_FORMAT_OPTIONS,
  PROPERTY_NUMBER_INPUT_CLASS,
  PROPERTY_NUMBER_STEPPER_CLASS,
  PROPERTY_NUMBER_UNIT_CLASS,
  propertyNumberFormatter,
  PropertyNumberInput,
  reactForUiNumberControls,
  reactPropertyNumberInput,
  roundScrubValue,
  scrubPrecision,
  snapScrubValue,
  useNumberScrubGesture,
};
export function installUiNumberControls(): () => void {
  return () => {
    reactPropertyNumberInput = toModuleNamespace(
      loadReactNamespace(),
      1,
    );
    reactForUiNumberControls = toModuleNamespace(
      loadReactNamespace(),
      1,
    );
    activeNumberScrubCleanup = null;
    jsxForUiNumberControls = toModuleNamespace(
      loadJsxNamespace(),
      1,
    );
    PROPERTY_NUMBER_FORMAT_OPTIONS = {
      useGrouping: false,
    };
    propertyNumberFormatter = new Intl.NumberFormat(
      "en-US",
      PROPERTY_NUMBER_FORMAT_OPTIONS,
    );
    PROPERTY_NUMBER_UNIT_CLASS = "select-none text-muted";
    PROPERTY_NUMBER_INPUT_CLASS = PROPERTY_NUMBER_UNIT_CLASS + " text-caption";
    PROPERTY_NUMBER_STEPPER_CLASS =
      "flex h-2.5 w-3 items-center justify-center rounded-sm text-muted outline-none hover:text-primary disabled:opacity-50";
  };
}
