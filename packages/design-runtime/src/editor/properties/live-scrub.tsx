/** Restored application module; prepare first, initialize in original order. */
import {
  type Dynamic,
} from "../../runtime-types";
import { load_react_jsx_runtime } from "../../dependencies";
import { useInspectorContext } from "../inspector/context-part-2";
import { snapNumericStep } from "./numeric-scrubber";
import { reactPropertiesShadowEffects } from "./shadow-effects";
import { toModuleNamespace } from "../../module-helpers";

var jsxPropertiesLiveScrub: Dynamic;
function useLiveStyleScrub(latestOptions?: Dynamic): Dynamic {
  let optionsRef: Dynamic = (0, reactPropertiesShadowEffects.useRef)(
    latestOptions,
  );
  optionsRef.current = latestOptions;
  let [liveValue, setLiveValue]: Dynamic = (0,
    reactPropertiesShadowEffects.useState)(null),
    { setOverlayHidden: setOverlayHidden, setScrubbing: setScrubbing }: Dynamic = useInspectorContext(),
    cancelActiveScrubRef: Dynamic = (0, reactPropertiesShadowEffects.useRef)(null);
  (0, reactPropertiesShadowEffects.useEffect)(
    (): Dynamic => (): Dynamic => cancelActiveScrubRef.current?.(),
    [],
  );
  return {
    start: (event?: Dynamic): Dynamic => {
      if (optionsRef.current.disabled) return;
      event.preventDefault();
      let currentTarget: Dynamic = event.currentTarget,
        pointerId: Dynamic = event.pointerId;
      currentTarget.setPointerCapture(pointerId);
      let activeElement: Dynamic = (document as Dynamic).activeElement;
      activeElement instanceof HTMLElement &&
        activeElement !== event.currentTarget &&
        (activeElement.tagName === "INPUT" ||
          activeElement.tagName === "TEXTAREA") &&
        activeElement.blur();
      let clientX: Dynamic = event.clientX,
        lastClientX: Dynamic = clientX,
        scrubValue: Dynamic = null,
        startValue: Dynamic = NaN,
        hasPassedThreshold: Dynamic = false,
        hasChangedValue: Dynamic = false,
        isOverlayHidden: Dynamic = false,
        frameRequestId: Dynamic = 0,
        snapToLimits: Dynamic = (rawValue?: Dynamic): Dynamic => {
          let scrubOptions: Dynamic = optionsRef.current;
          if (rawValue === scrubOptions.min || rawValue === scrubOptions.max) return rawValue;
          let snappedValue: Dynamic = snapNumericStep(
            rawValue,
            scrubOptions.step ?? 1,
          );
          scrubOptions.min != null && (snappedValue = Math.max(scrubOptions.min, snappedValue));
          scrubOptions.max != null && (snappedValue = Math.min(scrubOptions.max, snappedValue));
          return snappedValue;
        },
        flushScrubFrame: Dynamic = (): Dynamic => {
          frameRequestId = 0;
          if (scrubValue == null || !hasChangedValue) return;
          let nextValue: Dynamic = snapToLimits(scrubValue);
          isOverlayHidden && setLiveValue(nextValue);
          optionsRef.current.onScrub(nextValue);
        },
        handlePointerMove: Dynamic = (moveEvent?: Dynamic): Dynamic => {
          if (moveEvent.buttons === 0) return endScrub();
          let scrubOptions: Dynamic = optionsRef.current,
            deltaX: Dynamic = moveEvent.clientX - lastClientX;
          deltaX !== 0 &&
            (scrubValue == null &&
              (startValue = scrubValue =
                Number.isFinite(scrubOptions.value) ? scrubOptions.value : 0),
            (lastClientX = moveEvent.clientX),
            isOverlayHidden || ((isOverlayHidden = true), setOverlayHidden(true), setScrubbing(true)),
            (scrubValue +=
              deltaX * (scrubOptions.step ?? 1) * (moveEvent.shiftKey ? 10 : 1)),
            scrubOptions.min != null && (scrubValue = Math.max(scrubOptions.min, scrubValue)),
            scrubOptions.max != null && (scrubValue = Math.min(scrubOptions.max, scrubValue)),
            Math.abs(moveEvent.clientX - clientX) > 0.5 && (hasPassedThreshold = true),
            hasPassedThreshold && snapToLimits(scrubValue) !== startValue && (hasChangedValue = true),
            frameRequestId || (frameRequestId = requestAnimationFrame(flushScrubFrame)));
        },
        hasEnded: Dynamic = false,
        endScrub: Dynamic = (endEvent?: Dynamic): Dynamic => {
          (endEvent instanceof PointerEvent &&
            endEvent.pointerId !== pointerId) ||
            hasEnded ||
            ((hasEnded = true),
            (cancelActiveScrubRef.current = null),
            currentTarget.removeEventListener("pointermove", handlePointerMove),
            currentTarget.removeEventListener("pointerup", endScrub),
            currentTarget.removeEventListener("pointercancel", endScrub),
            currentTarget.removeEventListener(
              "lostpointercapture",
              endScrub,
            ),
            (window as Dynamic).removeEventListener(
              "pointerup",
              endScrub,
              true,
            ),
            (window as Dynamic).removeEventListener(
              "pointercancel",
              endScrub,
              true,
            ),
            (window as Dynamic).removeEventListener(
              "keydown",
              handleEscapeKey,
              true,
            ),
            frameRequestId && (cancelAnimationFrame(frameRequestId), flushScrubFrame()),
            isOverlayHidden && (setLiveValue(null), setScrubbing(false), setOverlayHidden(false)));
        };
      currentTarget.addEventListener("pointermove", handlePointerMove);
      currentTarget.addEventListener("pointerup", endScrub);
      currentTarget.addEventListener("pointercancel", endScrub);
      currentTarget.addEventListener("lostpointercapture", endScrub);
      let handleEscapeKey: Dynamic = (keyEvent?: Dynamic): Dynamic => {
        keyEvent.key === "Escape" &&
          (isOverlayHidden && keyEvent.preventDefault(), endScrub());
      };
      (window as Dynamic).addEventListener("pointerup", endScrub, true);
      (window as Dynamic).addEventListener("pointercancel", endScrub, true);
      (window as Dynamic).addEventListener("keydown", handleEscapeKey, true);
      cancelActiveScrubRef.current = endScrub;
    },
    live: liveValue,
  };
}
function useStyleCommitScrub(latestCommit?: Dynamic): Dynamic {
  let { setOverlayHidden: setOverlayHidden, setScrubbing: setScrubbing }: Dynamic = useInspectorContext(),
    isScrubbingRef: Dynamic = (0, reactPropertiesShadowEffects.useRef)(false),
    isMountedRef: Dynamic = (0, reactPropertiesShadowEffects.useRef)(true),
    commitRef: Dynamic = (0, reactPropertiesShadowEffects.useRef)(latestCommit);
  commitRef.current = latestCommit;
  (0, reactPropertiesShadowEffects.useEffect)(
    (): Dynamic => (
      (isMountedRef.current = true),
      (): Dynamic => {
        isMountedRef.current = false;
        isScrubbingRef.current &&
          ((isScrubbingRef.current = false), setScrubbing(false), setOverlayHidden(false));
      }
    ),
    [setOverlayHidden, setScrubbing],
  );
  return {
    onScrub: (scrubValue?: Dynamic): Dynamic => {
      isMountedRef.current &&
        (isScrubbingRef.current ||
          ((isScrubbingRef.current = true), setOverlayHidden(true), setScrubbing(true)),
        commitRef.current(scrubValue));
    },
    onScrubEnd: (afterEnd?: Dynamic): Dynamic => {
      isScrubbingRef.current &&
        (typeof afterEnd == "function" && afterEnd(),
        (isScrubbingRef.current = false),
        setScrubbing(false),
        setOverlayHidden(false));
    },
  };
}
export {
  jsxPropertiesLiveScrub,
  useLiveStyleScrub,
  useStyleCommitScrub,
};
export function installEditorPropertiesLiveScrub(): () => void {
  return () => {
    jsxPropertiesLiveScrub = toModuleNamespace(
      load_react_jsx_runtime(),
      1,
    );
  };
}
