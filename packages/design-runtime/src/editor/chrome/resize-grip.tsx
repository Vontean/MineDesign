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
import { jsxChromePanelShell_2, reactChromePanelShell } from "./panel-shell";
import { startPanelResizeGesture } from "./panel-width";
import { EditorTooltip } from "../properties/tooltip";
import { toModuleNamespace } from "../../module-helpers";

var jsxChromeResizeGrip: Dynamic;
var reactChromeResizeGrip: Dynamic;
var ChromeResizeGripCurrentState: Dynamic;
function PanelWidthGrip({
  width: width,
  min: min2,
  max: max,
  defaultWidth: defaultWidth,
  gesture: gesture,
  label = uiMessage("inspector.resizeGrip.resizePanel"),
  className: className,
}: Dynamic): Dynamic {
  useUiLocale();
  let callback: Dynamic =
    (input?: Dynamic): Dynamic =>
    (): Dynamic => {
      gesture.onResizeStart("keys");
      gesture.onResize(width - input, "keys");
      gesture.onResizeEnd(true, "keys");
    };
  return (
    <PanelResizeGrip
      side={"inline-start"}
      name={"panel"}
      label={label}
      now={width}
      min={min2}
      max={max}
      valueText={String(width) + " pixels wide"}
      gesture={gesture}
      onHome={callback(min2)}
      onEnd={callback(max)}
      onReset={callback(defaultWidth)}
      className={(0, joinClassNames)(
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
  min: min2,
  max: max,
  valueText: valueText,
  side = "top",
  gesture: gesture,
  disabled: disabled2 = false,
  unavailableTip: unavailableTip,
  onHome: onHome,
  onEnd: onEnd,
  onReset: onReset,
  className: className,
  grabClassName = "justify-center pointer-coarse:flex",
  grabTargetClassName: grabTargetClassName,
}: Dynamic): Dynamic {
  useUiLocale();
  let value: Dynamic = side === "inline-start",
    value2: Dynamic = (0, reactChromePanelShell.useRef)(gesture);
  value2.current = gesture;
  let value3: Dynamic = (0, reactChromePanelShell.useRef)(disabled2);
  value3.current = disabled2;
  let [value4, value5]: Dynamic = (0, reactChromePanelShell.useState)(
      false,
    ),
    [value6, value7]: Dynamic = (0, reactChromePanelShell.useState)(
      false,
    ),
    [value8, value9]: Dynamic = (0, reactChromePanelShell.useState)(
      false,
    ),
    value10: Dynamic = (0, reactChromePanelShell.useId)(),
    value11: Dynamic = (0, reactChromePanelShell.useRef)(null),
    value12: Dynamic = (0, reactChromePanelShell.useRef)(null);
  (0, reactChromePanelShell.useEffect)(
    (): Dynamic => (): Dynamic => value12.current?.(true),
    [],
  );
  let value13: Dynamic = (0, reactChromePanelShell.useRef)([
      false,
      false,
    ]),
    value14: Dynamic = (0, reactChromePanelShell.useMemo)(
      (): Dynamic => ({
        onResizeStart: (input: Dynamic = "keys"): Dynamic => {
          value3.current ||
            (value11.current === input &&
              (value12.current
                ? value12.current()
                : ((value11.current = null),
                  value2.current.onResizeEnd(true, input))),
            value11.current === null &&
              ((value11.current = input),
              value5(true),
              value2.current.onResizeStart(input)));
        },
        onResize: (input?: Dynamic, options: Dynamic = "keys"): Dynamic => {
          value11.current === options &&
            value2.current.onResize(input, options);
        },
        onResizeEnd: (
          input?: Dynamic,
          options: Dynamic = "keys",
          context?: Dynamic,
        ): Dynamic => {
          value11.current === options &&
            ((value11.current = null),
            (value12.current = null),
            value5(false),
            options !== "keys" &&
              (value13.current = [value13.current[1], input]),
            value2.current.onResizeEnd(input, options, context));
        },
      }),
      [],
    ),
    callback: Dynamic = (event?: Dynamic, options?: Dynamic): Dynamic => {
      let value18: Dynamic = "pointer:" + event.pointerId;
      if (
        value3.current ||
        (value11.current !== null && value11.current !== value18)
      ) {
        event.isPrimary &&
          event.button === 0 &&
          !(options === "touch" && event.pointerType === "mouse") &&
          event.preventDefault();
        return;
      }
      let value19: Dynamic = (0, startPanelResizeGesture)(
        event,
        value ? "x" : "y",
        value14,
        options,
      );
      value11.current === value18 && (value12.current = value19);
    },
    callback2: Dynamic = (input?: Dynamic): Dynamic => {
      !disabled2 && value11.current === null && input?.();
    },
    value15: Dynamic = disabled2 ? unavailableTip : undefined;
  (0, reactChromePanelShell.useEffect)((): Dynamic => {
    disabled2 || value9(false);
  }, [disabled2]);
  let value16: Dynamic = value15 !== undefined && value6 && !value8,
    value17: Dynamic = (
      <ComponentsSelectionPointsComponent
        side={side}
        aria-label={label}
        aria-valuenow={now}
        aria-valuemin={min2}
        aria-valuemax={max}
        aria-valuetext={valueText}
        aria-disabled={disabled2 || undefined}
        aria-describedby={value15 !== undefined ? value10 : undefined}
        data-kit={name + "-resize"}
        onResizeStart={value14.onResizeStart}
        onResize={value14.onResize}
        onResizeEnd={value14.onResizeEnd}
        onPointerDown={(input?: Dynamic): Dynamic => callback(input, "all")}
        onFocus={(): Dynamic => {
          value7(true);
          value9(false);
        }}
        onBlur={(): Dynamic => value7(false)}
        onDoubleClick={(): Dynamic => {
          !value13.current[0] && !value13.current[1] && callback2(onReset);
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
          let value18: Dynamic = disabled2
            ? undefined
            : event.key === "Home"
              ? onHome
              : onEnd;
          value18 && (event.preventDefault(), callback2(value18));
        }}
        className={(0, joinClassNames)(
          "z-10 touch-none [--cds-ring-outer:1px] [--cds-ring-inner:0px]",
          value4 && "[--cds-resize-pill-force:1]",
          disabled2
            ? "pointer-events-none pointer-coarse:[--cds-resize-pill-force:0.2]"
            : !value &&
                !value4 &&
                "pointer-coarse:[--cds-resize-pill-force:0.5] [&:hover:not(:focus-visible)>[data-cds-part=resize-pill]]:opacity-50",
          !value &&
            "[&:not(:focus-visible)>[data-cds-part=resize-pill]]:top-[calc(50%+6px)]",
          className,
        )}
      />
    );
  return (
    <jsxChromePanelShell_2.Fragment>
      {disabled2 ? (null) : (<div
          data-kit={name + "-grab"}
          onPointerDown={(input?: Dynamic): Dynamic =>
            callback(input, value ? "all" : "touch")
          }
          aria-hidden={"true"}
          className={(0, joinClassNames)(
            "absolute z-10 hidden touch-none",
            value
              ? "inset-y-0 left-0 w-0 flex-col items-center"
              : "inset-x-0 top-0 h-0 items-start",
            grabClassName,
          )}
        >
          <span
            className={(0, joinClassNames)(
              value ? "h-full w-10 cursor-col-resize" : "h-10 w-24",
              grabTargetClassName,
            )}
          />
        </div>)}
      <Tooltip
        content={value15 ?? ""}
        side={value ? "left" : "top"}
        open={value16}
        onOpenChange={(input?: Dynamic): Dynamic => {
          !input && value16 && value9(true);
        }}
      >
        {value17}
      </Tooltip>
      {value15 !== undefined ? (<jsxChromePanelShell_2.Fragment>
          <span id={value10} hidden={true}>
            {value15}
          </span>
          <EditorTooltip
            tip={value15}
            side={value ? "left" : "top"}
            className={
              value
                ? "absolute! inset-y-0 -left-1.5 z-10 w-3 cursor-default"
                : "absolute! inset-x-0 -top-1.5 z-10 h-3 cursor-default"
            }
          >
            <span className={"size-full"} />
          </EditorTooltip>
        </jsxChromePanelShell_2.Fragment>) : (null)}
    </jsxChromePanelShell_2.Fragment>
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
    jsxChromeResizeGrip = (0, toModuleNamespace)(
      (0, load_react_jsx_runtime)(),
      1,
    );
    reactChromeResizeGrip = (0, toModuleNamespace)(
      (0, load_react)(),
      1,
    );
    ChromeResizeGripCurrentState = null;
  };
}
