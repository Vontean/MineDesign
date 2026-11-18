import { uiMessage } from '@minedesign/contracts/ui-messages';
import { useUiLocale } from '../../ui-locale.ts';
import type * as React from "react";
/** Restored application module; prepare first, initialize in original order. */
import { cn, initializeClassNames } from "../theme/class-names";
import { load_react, load_react_jsx_runtime } from "../../dependencies";
import { initializeOnce, toModuleNamespace } from "../../module-helpers";

var reactTooltipDisabledReason: typeof React;
var jsxTooltipDisabledReason: typeof import("react/jsx-runtime");
var CdsDisabledReasonAttribute: string;
var initializeTooltipDisabledReason: () => void;
function disabledReasonWrapperProps(
  reason: React.ReactNode,
  descriptionId?: string,
  extraClassName?: string,
): {
  tabIndex: number;
  "aria-describedby": string | undefined;
  className: string;
} {
  let value = hasDisabledReason(reason);
  return {
    tabIndex: value ? 0 : -1,
    "aria-describedby": value ? descriptionId : undefined,
    className: cn("inline-flex", extraClassName),
  };
}
function hasDisabledReason(reason: React.ReactNode): boolean {
  return !!reason;
}
function DisabledReasonDescription({
  id: id,
  reason: reason,
}: {
  id?: string;
  reason?: React.ReactNode;
}): React.ReactElement {
  useUiLocale();
  let value = (0, reactTooltipDisabledReason.useRef)<HTMLSpanElement | null>(
    null,
  );
  (0, reactTooltipDisabledReason.useEffect)(() => {}, [reason]);
  return (
    <span
      ref={value}
      id={id}
      hidden={true}
      {...{
        [CdsDisabledReasonAttribute]: "",
      }}
    >
      {hasDisabledReason(reason) ? (reason) : (null)}
    </span>
  );
}
export {
  CdsDisabledReasonAttribute,
  DisabledReasonDescription,
  disabledReasonWrapperProps,
  hasDisabledReason,
  initializeTooltipDisabledReason,
  jsxTooltipDisabledReason,
  reactTooltipDisabledReason,
};
export function installCdsTooltipDisabledReason(): () => void {
  return () => {
    initializeTooltipDisabledReason = initializeOnce(() => {
      "use client";

      initializeClassNames();
      reactTooltipDisabledReason = toModuleNamespace(
        load_react(),
      );
      jsxTooltipDisabledReason = toModuleNamespace(
        load_react_jsx_runtime(),
      );
      CdsDisabledReasonAttribute = "data-cds-disabled-reason";
    });
  };
}
