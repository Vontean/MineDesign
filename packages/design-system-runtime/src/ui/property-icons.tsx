import { useUiLocale } from '../ui-locale.ts';
import type * as React from "react";
import type * as Color from "../contracts/color-controls";
/** Restored application module; prepare first, initialize in original order. */
import { loadJsxNamespace } from "../dependencies";
import { toModuleNamespace } from "../module-helpers";
import { Icon } from "./interactions";

var jsxForUiPropertyIcons: typeof import("react/jsx-runtime");
function joinClassNames(...classNames: (string | false | null | undefined)[]) {
  return classNames.filter(Boolean).join(" ");
}
function KitIcon({
  name: name,
  size = 14,
  className: className,
  style: style,
}: Color.KitIconProps): React.ReactElement {
  useUiLocale();
  return (
    <Icon
      name={name}
      customSize={size}
      className={joinClassNames("shrink-0", className)}
      style={{
        display: "inline-flex",
        ...style,
      }}
    />
  );
}
export {
  joinClassNames,
  jsxForUiPropertyIcons,
  KitIcon,
};
export function installUiPropertyIcons(): () => void {
  return () => {
    jsxForUiPropertyIcons = toModuleNamespace(
      loadJsxNamespace(),
      1,
    );
  };
}
