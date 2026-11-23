/** Restored application module; prepare first, initialize in original order. */
import {
  type Dynamic,
} from "../../runtime-types";
import { load_react_jsx_runtime } from "../../dependencies";
import { reactForUseNumericScrub } from "./tool-options";
import { toModuleNamespace } from "../../module-helpers";

var PropertiesNumericScrubberAlias: Dynamic;
var jsxPropertiesNumericScrubber: Dynamic;
var PropertiesNumericScrubberUseGroupingConfig: Dynamic;
var numericInputFormatter: Dynamic;
var PropertiesNumericScrubberClassNames: Dynamic;
var PropertiesNumericScrubberResolvedValue: Dynamic;
var scrubberStepButtonClassName: Dynamic;
function decimalPlaces(numericValue?: Dynamic): Dynamic {
  let text: Dynamic = String(numericValue),
    dotIndex: Dynamic = text.indexOf(".");
  return dotIndex === -1 || text.includes("e") ? 0 : text.length - dotIndex - 1;
}
function roundNumericStep(num?: Dynamic, step?: Dynamic): Dynamic {
  let factor: Dynamic = 10 ** numericStepPrecision(step);
  return Math.round(num * factor) / factor;
}
function numericStepPrecision(step?: Dynamic): Dynamic {
  return Math.max(
    2,
    decimalPlaces(step),
    Math.ceil(-Math.log10(Math.max(step, Number.EPSILON))),
  );
}
function snapNumericStep(
  rawValue?: Dynamic,
  step?: Dynamic,
  origin?: Dynamic,
): Dynamic {
  if (!(step > 0) || !Number.isFinite(step) || !Number.isFinite(rawValue))
    return rawValue + 0;
  let effectiveStep: Dynamic =
      origin == null && Number.isInteger(step) ? 1 : step,
    effectiveOrigin: Dynamic = origin ?? 0,
    stepsFloat: Dynamic = (rawValue - effectiveOrigin) / effectiveStep,
    stepCount: Dynamic = Math.round(Number(stepsFloat.toPrecision(12))),
    scale: Dynamic =
      10 ** Math.max(numericStepPrecision(effectiveStep), decimalPlaces(effectiveOrigin)),
    snapped: Dynamic =
      Math.round((stepCount * effectiveStep + effectiveOrigin) * scale) / scale + 0;
  if (Math.abs(stepsFloat) < 1e12 && Number.isFinite(snapped)) return snapped;
  let fallback: Dynamic = roundNumericStep(rawValue, step) + 0;
  return Number.isFinite(fallback) ? fallback : rawValue + 0;
}
function stepNumericValue(
  startValue?: Dynamic,
  direction?: Dynamic,
  modifiers?: Dynamic,
  limits: Dynamic = {},
): Dynamic {
  let stepSize: Dynamic = limits.step ?? 1,
    fineStep: Dynamic = Math.min(0.1, stepSize),
    stepAmount: Dynamic = modifiers.altKey
      ? fineStep
      : stepSize * (modifiers.shiftKey ? 10 : 1),
    steppedValue: Dynamic = roundNumericStep(startValue + direction * stepAmount, stepSize);
  limits.min != null && (steppedValue = Math.max(limits.min, steppedValue));
  limits.max != null && (steppedValue = Math.min(limits.max, steppedValue));
  return steppedValue;
}
function createNumericScrubber(getOptions?: Dynamic, startX?: Dynamic): Dynamic {
  let lastX: Dynamic = startX,
    scrubValue: Dynamic = null,
    flag: Dynamic = false;
  return {
    move(clientX: Dynamic, isFast: Dynamic): Dynamic {
      let scrubOptions: Dynamic = getOptions(),
        deltaX: Dynamic = clientX - lastX;
      lastX = clientX;
      if (!flag) {
        if (deltaX === 0) return;
        flag = true;
        scrubOptions.onScrubbing?.(true);
      }
      scrubValue == null &&
        (scrubValue = Number.isFinite(scrubOptions.value) ? scrubOptions.value : 0);
      let stepSize: Dynamic = scrubOptions.step ?? 1,
        clampValue: Dynamic = (candidate?: Dynamic): Dynamic =>
          Math.min(
            scrubOptions.max ?? 1 / 0,
            Math.max(scrubOptions.min ?? -1 / 0, candidate),
          );
      scrubValue = clampValue(scrubValue + deltaX * stepSize * (isFast ? 10 : 1));
      let snappedValue: Dynamic =
        scrubValue === scrubOptions.min || scrubValue === scrubOptions.max
          ? scrubValue
          : clampValue(snapNumericStep(scrubValue, stepSize, scrubOptions.origin));
      scrubOptions.onScrub(snappedValue + 0);
    },
    up(): Dynamic {
      if (!flag) return;
      let scrubOptions: Dynamic = getOptions();
      scrubOptions.onScrubbing?.(false);
      scrubOptions.onScrubEnd?.();
    },
    get live(): Dynamic {
      return flag;
    },
  };
}
function useNumericScrub(latestOptions?: Dynamic): Dynamic {
  let optionsRef: Dynamic = (0, reactForUseNumericScrub.useRef)(
    latestOptions,
  );
  optionsRef.current = latestOptions;
  let cancelGestureRef: Dynamic = (0, reactForUseNumericScrub.useRef)(
    null,
  );
  (0, reactForUseNumericScrub.useEffect)(
    (): Dynamic => (): Dynamic => {
      cancelGestureRef.current &&
        cancelGestureRef.current === PropertiesNumericScrubberAlias &&
        cancelGestureRef.current();
    },
    [],
  );
  return (event?: Dynamic): Dynamic => {
    if (optionsRef.current.disabled || event.button !== 0) return;
    event.preventDefault();
    let activeElement: Dynamic = (document as Dynamic).activeElement;
    activeElement &&
      activeElement !== event.currentTarget &&
      (activeElement.tagName === "INPUT" ||
        activeElement.tagName === "TEXTAREA") &&
      activeElement.blur?.();
    cancelGestureRef.current = installNumericScrubGesture(
      createNumericScrubber((): Dynamic => optionsRef.current, event.clientX),
    );
  };
}
function captureNumericPointer(event?: Dynamic): Dynamic {
  if (!(event.button !== 0 || event.pointerType === "touch"))
    try {
      event.currentTarget.setPointerCapture(event.pointerId);
    } catch {}
}
function installNumericScrubGesture(
  scrubber?: Dynamic,
  eventTarget: Dynamic = window,
): Dynamic {
  PropertiesNumericScrubberAlias?.();
  let handleMouseMove: Dynamic = (rawEvent?: Dynamic): Dynamic => {
      let mouseEvent: Dynamic = rawEvent;
      if (mouseEvent.buttons === 0) {
        endGesture();
        return;
      }
      scrubber.move(mouseEvent.clientX, mouseEvent.shiftKey);
    },
    handleKeyDown: Dynamic = (event?: Dynamic): Dynamic => {
      event.key === "Escape" &&
        (scrubber.live && event.preventDefault(), endGesture());
    },
    endGesture: Dynamic = (): Dynamic => {
      PropertiesNumericScrubberAlias === endGesture &&
        (PropertiesNumericScrubberAlias = null);
      eventTarget.removeEventListener("mousemove", handleMouseMove);
      eventTarget.removeEventListener("mouseup", endGesture);
      eventTarget.removeEventListener("blur", endGesture);
      eventTarget.removeEventListener("keydown", handleKeyDown, true);
      scrubber.up();
    };
  PropertiesNumericScrubberAlias = endGesture;
  eventTarget.addEventListener("mousemove", handleMouseMove);
  eventTarget.addEventListener("mouseup", endGesture);
  eventTarget.addEventListener("blur", endGesture);
  eventTarget.addEventListener("keydown", handleKeyDown, true);
  return endGesture;
}
function numericInputDecimalPlaces(numericValue?: Dynamic): Dynamic {
  let text: Dynamic = String(numericValue),
    dotIndex: Dynamic = text.indexOf(".");
  return dotIndex === -1 || text.includes("e") ? 0 : text.length - dotIndex - 1;
}
export {
  captureNumericPointer,
  createNumericScrubber,
  decimalPlaces,
  installNumericScrubGesture,
  jsxPropertiesNumericScrubber,
  numericInputDecimalPlaces,
  numericInputFormatter,
  numericStepPrecision,
  PropertiesNumericScrubberAlias,
  PropertiesNumericScrubberClassNames,
  scrubberStepButtonClassName,
  PropertiesNumericScrubberResolvedValue,
  PropertiesNumericScrubberUseGroupingConfig,
  roundNumericStep,
  snapNumericStep,
  stepNumericValue,
  useNumericScrub,
};
export function installEditorPropertiesNumericScrubber(): () => void {
  return () => {
    PropertiesNumericScrubberAlias = null;
    jsxPropertiesNumericScrubber = toModuleNamespace(
      load_react_jsx_runtime(),
      1,
    );
    PropertiesNumericScrubberUseGroupingConfig = {
      useGrouping: false,
    };
    numericInputFormatter = new Intl.NumberFormat(
      "en-US",
      PropertiesNumericScrubberUseGroupingConfig,
    );
    PropertiesNumericScrubberClassNames = "select-none text-muted";
    PropertiesNumericScrubberResolvedValue =
      PropertiesNumericScrubberClassNames + " text-caption";
    scrubberStepButtonClassName =
      "flex h-2.5 w-3 items-center justify-center rounded-sm text-muted outline-none hover:text-primary disabled:opacity-50";
  };
}
