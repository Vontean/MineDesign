import { useUiLocale } from '../../ui-locale.ts';
import type { TooltipImplementation } from "../../contracts/ui";
import type * as React from "react";
/** Restored application module; prepare first, initialize in original order. */
import { load_react_jsx_runtime } from "../../dependencies";
import { initializeOnce, toModuleNamespace } from "../../module-helpers";

var jsxTooltipStyles: typeof import("react/jsx-runtime");
var TooltipStylesClassNames: string;
var TooltipStylesCss: string;
var tooltipPopupClasses: string;
var TooltipStylesLabel: string;
var TooltipStylesCss_2: string;
var TooltipStylesLabel_2: string;
var initializeTooltipStyles: () => void;
var tooltipImplementationExports: Partial<TooltipImplementation>;
function DarkScope({
  children: children,
}: React.PropsWithChildren): React.ReactElement {
  useUiLocale();
  return (
    <div className={"cds-dark-scope contents"} data-mode={"dark"}>
      {children}
    </div>
  );
}
export {
  DarkScope,
  initializeTooltipStyles,
  jsxTooltipStyles,
  tooltipImplementationExports,
  tooltipPopupClasses,
  TooltipStylesClassNames,
  TooltipStylesCss,
  TooltipStylesCss_2,
  TooltipStylesLabel,
  TooltipStylesLabel_2,
};
export function installCdsTooltipStyles(): () => void {
  return () => {
    initializeTooltipStyles = initializeOnce(() => {
      "use client";

      jsxTooltipStyles = toModuleNamespace(
        load_react_jsx_runtime(),
      );
      TooltipStylesClassNames =
        "rounded-[calc(0.375rem*var(--cds-rem-scale,1))] bg-[var(--cds-tooltip-bg)] text-[var(--cds-tooltip-fg)] shadow-sm dark:shadow-panel-sm text-[calc(0.8125rem*var(--cds-rem-scale,1))]/[calc(1.125rem*var(--cds-rem-scale,1))] font-normal";
      TooltipStylesCss = `px-2 ${TooltipStylesClassNames}`;
      tooltipPopupClasses =
        "origin-[var(--transform-origin)] transition-[opacity,scale] duration-snap ease-snap motion-reduce:transition-none data-[starting-style]:opacity-0 data-[starting-style]:scale-[0.98] data-[ending-style]:opacity-0 data-[ending-style]:scale-[0.98] data-[instant]:duration-0";
      TooltipStylesLabel = "max-w-[240px] whitespace-normal";
      TooltipStylesCss_2 = `${TooltipStylesLabel} py-1.5`;
      TooltipStylesLabel_2 = "min-w-0 break-words";
    });
    tooltipImplementationExports = {};
  };
}
