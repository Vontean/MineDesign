import { useUiLocale } from '../../ui-locale.ts';
import type { DelayedSpinnerProps, SpinnerProps } from "../../contracts/ui";
import type * as React from "react";
/** Restored application module; prepare first, initialize in original order. */
import { initializeRootFontScaleProbe, scaleCssPixels } from "../platform/root-font-size";
import { cn, initializeClassNames } from "../theme/class-names";
import { load_react, load_react_jsx_runtime } from "../../dependencies";
import { initializeOnce, toModuleNamespace } from "../../module-helpers";

var reactComponentsSpinner: typeof React;
var jsxComponentsSpinner: typeof import("react/jsx-runtime");
var ComponentsSpinnerSMLConfig: Partial<
  Record<NonNullable<SpinnerProps["size"]>, "sm" | "md" | "lg">
>;
var ComponentsSpinnerSmMdLgConfig: Record<
  "sm" | "md" | "lg",
  {
    box: number;
    stroke: number;
  }
>;
var initializeComponentsSpinner: () => void;
function Spinner({
  size = "sm",
  delay = 0,
  inheritColor = false,
  label: label,
  className: className,
}: SpinnerProps): React.ReactElement | null {
  useUiLocale();
  let [isDelayElapsed, setIsDelayElapsed] = (0, reactComponentsSpinner.useState)(delay <= 0),
    [previousDelay, setPreviousDelay] = (0, reactComponentsSpinner.useState)(delay);
  delay !== previousDelay && (setPreviousDelay(delay), delay > 0 && isDelayElapsed && setIsDelayElapsed(false));
  let isVisible = delay <= 0 || isDelayElapsed;
  (0, reactComponentsSpinner.useEffect)(() => {
    if (delay <= 0) return;
    let timerId = window.setTimeout(() => setIsDelayElapsed(true), delay);
    return () => window.clearTimeout(timerId);
  }, [delay]);
  let sizeSpec =
      ComponentsSpinnerSmMdLgConfig[
        (ComponentsSpinnerSMLConfig[size] ?? size) as "sm" | "md" | "lg"
      ],
    arcColor = inheritColor ? "currentColor" : "var(--cds-text-muted)",
    trackColor = inheritColor
      ? "color-mix(in srgb, currentColor 25%, transparent)"
      : "var(--cds-border)",
    boxSize = scaleCssPixels(sizeSpec.box),
    strokeWidth = scaleCssPixels(sizeSpec.stroke),
    innerRadius = `calc(100% - ${strokeWidth})`,
    maskGradient = `radial-gradient(farthest-side, transparent ${innerRadius}, #000 calc(${innerRadius} + 0.5px))`,
    spinnerElement = isVisible ? (
      <span
        data-cds={"Spinner"}
        className={cn(
          "relative inline-block shrink-0 align-middle",
          className,
        )}
        style={{
          width: boxSize,
          height: boxSize,
        }}
        aria-hidden={true}
      >
        <span
          className={"absolute inset-0 rounded-full"}
          style={{
            border: `${strokeWidth} solid ${trackColor}`,
          }}
        />
        <span
          className={
            "absolute inset-0 rounded-full animate-[spin_1s_linear_infinite] motion-reduce:animate-none"
          }
          style={{
            background: `conic-gradient(transparent 40%, ${arcColor})`,
            WebkitMask: maskGradient,
            mask: maskGradient,
          }}
        />
      </span>
    ) : null;
  return label ? (
    <span role={"status"} className={"leading-[0]"}>
      {spinnerElement}
      <DelayedSpinner show={isVisible}>{label}</DelayedSpinner>
    </span>
  ) : (
    spinnerElement
  );
}
function DelayedSpinner({
  show: show,
  children: children,
}: DelayedSpinnerProps): React.ReactElement | null {
  useUiLocale();
  let [isDelayElapsed, setIsDelayElapsed] = (0, reactComponentsSpinner.useState)(false);
  (0, reactComponentsSpinner.useEffect)(() => {
    let timerId = window.setTimeout(() => setIsDelayElapsed(true), 100);
    return () => window.clearTimeout(timerId);
  }, []);
  return show && isDelayElapsed ? <span className={"sr-only"}>{children}</span> : null;
}
export {
  ComponentsSpinnerSMLConfig,
  ComponentsSpinnerSmMdLgConfig,
  DelayedSpinner,
  initializeComponentsSpinner,
  jsxComponentsSpinner,
  reactComponentsSpinner,
  Spinner,
};
export function installCdsComponentsSpinner(): () => void {
  return () => {
    initializeComponentsSpinner = initializeOnce(() => {
      "use client";

      initializeClassNames();
      initializeRootFontScaleProbe();
      reactComponentsSpinner = toModuleNamespace(
        load_react(),
      );
      jsxComponentsSpinner = toModuleNamespace(
        load_react_jsx_runtime(),
      );
      ComponentsSpinnerSMLConfig = {
        s: "sm",
        m: "md",
        l: "lg",
      };
      ComponentsSpinnerSmMdLgConfig = {
        sm: {
          box: 12,
          stroke: 1.5,
        },
        md: {
          box: 16,
          stroke: 1.75,
        },
        lg: {
          box: 20,
          stroke: 2,
        },
      };
    });
  };
}
