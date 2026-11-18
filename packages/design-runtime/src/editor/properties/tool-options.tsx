/** Restored application module; prepare first, initialize in original order. */
import {
  type Dynamic,
} from "../../runtime-types";
import { Icon } from "../../cds/components/icon";
import { initializeCdsIndex } from "../../cds/index";
import { load_react } from "../../dependencies";
import { PropertiesTooltipColorGradientConfig, reactPropertiesTooltip_3 } from "./tooltip";
import { toModuleNamespace } from "../../module-helpers";

var reactPropertiesToolOptions: Dynamic;
var reactPropertiesToolOptions_2: Dynamic;
function toolSegmentOption(
  input?: Dynamic,
  options?: Dynamic,
  context?: Dynamic,
): Dynamic {
  let state: Dynamic = {
    value: input,
    tooltip: options,
    ...(context !== undefined
      ? {
          disabled: context,
        }
      : {}),
  };
  if (input === "image")
    return {
      ...state,
      icon: "Image",
    };
  let value: Dynamic = PropertiesTooltipColorGradientConfig[input];
  return value === undefined
    ? {
        ...state,
        label: options,
      }
    : {
        ...state,
        label: (0, reactPropertiesTooltip_3.createElement)(
          reactPropertiesTooltip_3.Fragment,
          null,
          (0, reactPropertiesTooltip_3.createElement)(
            PropertyOptionIcon,
            {
              icon: value,
            },
          ),
          (0, reactPropertiesTooltip_3.createElement)(
            "span",
            {
              className: "sr-only",
            },
            options,
          ),
        ),
      };
}
function PropertyOptionIcon({
  icon: icon,
  className: className,
}: Dynamic): Dynamic {
  let value: Dynamic = className ?? "shrink-0";
  return typeof icon == "string"
    ? (0, reactPropertiesTooltip_3.createElement)(Icon, {
        name: icon,
        size: "auto",
        className: value,
      })
    : (0, reactPropertiesTooltip_3.createElement)(Icon, {
        customIcon: icon,
        size: "auto",
        className: value,
      });
}
export {
  PropertyOptionIcon,
  reactPropertiesToolOptions,
  reactPropertiesToolOptions_2,
  toolSegmentOption,
};
export function installEditorPropertiesToolOptions(): () => void {
  return () => {
    reactPropertiesToolOptions = toModuleNamespace(
      load_react(),
      1,
    );
    initializeCdsIndex();
    reactPropertiesToolOptions_2 = toModuleNamespace(
      load_react(),
      1,
    );
  };
}
