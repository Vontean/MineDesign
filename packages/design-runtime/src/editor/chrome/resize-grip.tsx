import { uiMessage } from '@minedesign/contracts/ui-messages';
import { useUiLocale } from '../../ui-locale.ts';
/** Restored application module; prepare first, initialize in original order. */
import {
  type Dynamic,
} from "../../runtime-types";
import { ComponentsSelectionPointsComponent } from "../../cds/components/selection-points";
import { Tooltip } from "../../cds/tooltip/tooltip";
import { load_react, load_react_jsx_runtime } from "../../dependencies";
import { joinClassNames } from "./overlay-state";
import { jsxForPanelResizeGrip, reactChromePanelShell } from "./panel-shell";
import { startPanelResizeGesture } from "./panel-width";
import { EditorTooltip } from "../properties/tooltip";
import { toModuleNamespace } from "../../module-helpers";

var jsxChromeResizeGrip: Dynamic;
var reactChromeResizeGrip: Dynamic;
var ChromeResizeGripCurrentState: Dynamic;
function PanelWidthGrip({
  width: width,
  min: minWidth,
  max: max,
  defaultWidth: defaultWidth,
  gesture: gesture,
  label = uiMessage("inspector.resizeGrip.resizePanel"),
  className: className,
}: Dynamic): Dynamic {
  useUiLocale();
  let createResizeTo: Dynamic =
    (targetWidth?: Dynamic): Dynamic =>
    (): Dynamic => {
      gesture.onResizeStart("keys");
      gesture.onResize(width - targetWidth, "keys");
      gesture.onResizeEnd(true, "keys");
    };
  return (
    <PanelResizeGrip
      side={"inline-start"}
      name={"panel"}
      label={label}
      now={width}
      min={minWidth}
      max={max}
      valueText={String(width) + " pixels wide"}
      gesture={gesture}
      onHome={createResizeTo(minWidth)}
      onEnd={createResizeTo(max)}
      onReset={createResizeTo(defaultWidth)}
      className={joinClassNames(
        "[&:not(:focus-visible)>[data-cds-part=resize-pill]]:opacity-0",
        className,
      )}
    />
  );
}
function PanelResizeGrip({
  name: name,
  label: label,
  now: now,
  min: minValue,
  max: max,
  valueText: valueText,
  side = "top",
  gesture: gesture,
  disabled: isDisabled = false,
  unavailableTip: unavailableTip,
  onHome: onHome,
  onEnd: onEnd,
  onReset: onReset,
  className: className,
  grabClassName = "justify-center pointer-coarse:flex",
  grabTargetClassName: grabTargetClassName,
}: Dynamic): Dynamic {
  useUiLocale();
  let isInlineStart: Dynamic = side === "inline-start",
    gestureRef: Dynamic = (0, reactChromePanelShell.useRef)(gesture);
  gestureRef.current = gesture;
  let isDisabledRef: Dynamic = (0, reactChromePanelShell.useRef)(isDisabled);
  isDisabledRef.current = isDisabled;
  let [isGripActive, setIsGripActive]: Dynamic = (0, reactChromePanelShell.useState)(
      false,
    ),
    [isFocused, setIsFocused]: Dynamic = (0, reactChromePanelShell.useState)(
      false,
    ),
    [isTooltipDismissed, setIsTooltipDismissed]: Dynamic = (0, reactChromePanelShell.useState)(
      false,
    ),
    tipId: Dynamic = (0, reactChromePanelShell.useId)(),
    activeSourceRef: Dynamic = (0, reactChromePanelShell.useRef)(null),
    cancelGestureRef: Dynamic = (0, reactChromePanelShell.useRef)(null);
  (0, reactChromePanelShell.useEffect)(
    (): Dynamic => (): Dynamic => cancelGestureRef.current?.(true),
    [],
  );
  let recentResizeEndsRef: Dynamic = (0, reactChromePanelShell.useRef)([
      false,
      false,
    ]),
    resizeGesture: Dynamic = (0, reactChromePanelShell.useMemo)(
      (): Dynamic => ({
        onResizeStart: (source: Dynamic = "keys"): Dynamic => {
          isDisabledRef.current ||
            (activeSourceRef.current === source &&
              (cancelGestureRef.current
                ? cancelGestureRef.current()
                : ((activeSourceRef.current = null),
                  gestureRef.current.onResizeEnd(true, source))),
            activeSourceRef.current === null &&
              ((activeSourceRef.current = source),
              setIsGripActive(true),
              gestureRef.current.onResizeStart(source)));
        },
        onResize: (delta?: Dynamic, source: Dynamic = "keys"): Dynamic => {
          activeSourceRef.current === source &&
            gestureRef.current.onResize(delta, source);
        },
        onResizeEnd: (
          committed?: Dynamic,
          source: Dynamic = "keys",
          endContext?: Dynamic,
        ): Dynamic => {
          activeSourceRef.current === source &&
            ((activeSourceRef.current = null),
            (cancelGestureRef.current = null),
            setIsGripActive(false),
            source !== "keys" &&
              (recentResizeEndsRef.current = [recentResizeEndsRef.current[1], committed]),
            gestureRef.current.onResizeEnd(committed, source, endContext));
        },
      }),
      [],
    ),
    startPointerResize: Dynamic = (event?: Dynamic, pointerMode?: Dynamic): Dynamic => {
      let pointerSource: Dynamic = "pointer:" + event.pointerId;
      if (
        isDisabledRef.current ||
        (activeSourceRef.current !== null && activeSourceRef.current !== pointerSource)
      ) {
        event.isPrimary &&
          event.button === 0 &&
          !(pointerMode === "touch" && event.pointerType === "mouse") &&
          event.preventDefault();
        return;
      }
      let cancelResize: Dynamic = startPanelResizeGesture(
        event,
        isInlineStart ? "x" : "y",
        resizeGesture,
        pointerMode,
      );
      activeSourceRef.current === pointerSource && (cancelGestureRef.current = cancelResize);
    },
    runKeyAction: Dynamic = (action?: Dynamic): Dynamic => {
      !isDisabled && activeSourceRef.current === null && action?.();
    },
    disabledTip: Dynamic = isDisabled ? unavailableTip : undefined;
  (0, reactChromePanelShell.useEffect)((): Dynamic => {
    isDisabled || setIsTooltipDismissed(false);
  }, [isDisabled]);
  let isTooltipOpen: Dynamic = disabledTip !== undefined && isFocused && !isTooltipDismissed,
    gripElement: Dynamic = (
      <ComponentsSelectionPointsComponent
        side={side}
        aria-label={label}
        aria-valuenow={now}
        aria-valuemin={minValue}
        aria-valuemax={max}
        aria-valuetext={valueText}
        aria-disabled={isDisabled || undefined}
        aria-describedby={disabledTip !== undefined ? tipId : undefined}
        data-kit={name + "-resize"}
        onResizeStart={resizeGesture.onResizeStart}
        onResize={resizeGesture.onResize}
        onResizeEnd={resizeGesture.onResizeEnd}
        onPointerDown={(event?: Dynamic): Dynamic => startPointerResize(event, "all")}
        onFocus={(): Dynamic => {
          setIsFocused(true);
          setIsTooltipDismissed(false);
        }}
        onBlur={(): Dynamic => setIsFocused(false)}
        onDoubleClick={(): Dynamic => {
          !recentResizeEndsRef.current[0] && !recentResizeEndsRef.current[1] && runKeyAction(onReset);
        }}
        onKeyDown={(event?: Dynamic): Dynamic => {
          if (
            event.metaKey ||
            event.ctrlKey ||
            event.altKey ||
            event.shiftKey ||
            (event.key !== "Home" && event.key !== "End")
          )
            return;
          let keyAction: Dynamic = isDisabled
            ? undefined
            : event.key === "Home"
              ? onHome
              : onEnd;
          keyAction && (event.preventDefault(), runKeyAction(keyAction));
        }}
        className={joinClassNames(
          "z-10 touch-none [--cds-ring-outer:1px] [--cds-ring-inner:0px]",
          isGripActive && "[--cds-resize-pill-force:1]",
          isDisabled
            ? "pointer-events-none pointer-coarse:[--cds-resize-pill-force:0.2]"
            : !isInlineStart &&
                !isGripActive &&
                "pointer-coarse:[--cds-resize-pill-force:0.5] [&:hover:not(:focus-visible)>[data-cds-part=resize-pill]]:opacity-50",
          !isInlineStart &&
            "[&:not(:focus-visible)>[data-cds-part=resize-pill]]:top-[calc(50%+6px)]",
          className,
        )}
      />
    );
  return (
    <jsxForPanelResizeGrip.Fragment>
      {isDisabled ? (null) : (<div
          data-kit={name + "-grab"}
          onPointerDown={(event?: Dynamic): Dynamic =>
            startPointerResize(event, isInlineStart ? "all" : "touch")
          }
          aria-hidden={"true"}
          className={joinClassNames(
            "absolute z-10 hidden touch-none",
            isInlineStart
              ? "inset-y-0 left-0 w-0 flex-col items-center"
              : "inset-x-0 top-0 h-0 items-start",
            grabClassName,
          )}
        >
          <span
            className={joinClassNames(
              isInlineStart ? "h-full w-10 cursor-col-resize" : "h-10 w-24",
              grabTargetClassName,
            )}
          />
        </div>)}
      <Tooltip
        content={disabledTip ?? ""}
        side={isInlineStart ? "left" : "top"}
        open={isTooltipOpen}
        onOpenChange={(isOpen?: Dynamic): Dynamic => {
          !isOpen && isTooltipOpen && setIsTooltipDismissed(true);
        }}
      >
        {gripElement}
      </Tooltip>
      {disabledTip !== undefined ? (<jsxForPanelResizeGrip.Fragment>
          <span id={tipId} hidden={true}>
            {disabledTip}
          </span>
          <EditorTooltip
            tip={disabledTip}
            side={isInlineStart ? "left" : "top"}
            className={
              isInlineStart
                ? "absolute! inset-y-0 -left-1.5 z-10 w-3 cursor-default"
                : "absolute! inset-x-0 -top-1.5 z-10 h-3 cursor-default"
            }
          >
            <span className={"size-full"} />
          </EditorTooltip>
        </jsxForPanelResizeGrip.Fragment>) : (null)}
    </jsxForPanelResizeGrip.Fragment>
  );
}
export {
  ChromeResizeGripCurrentState,
  jsxChromeResizeGrip,
  PanelResizeGrip,
  PanelWidthGrip,
  reactChromeResizeGrip,
};
export function installEditorChromeResizeGrip(): () => void {
  return () => {
    jsxChromeResizeGrip = toModuleNamespace(
      load_react_jsx_runtime(),
      1,
    );
    reactChromeResizeGrip = toModuleNamespace(
      load_react(),
      1,
    );
    ChromeResizeGripCurrentState = null;
  };
}
