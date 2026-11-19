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
  optionValue?: Dynamic,
  tooltipText?: Dynamic,
  isDisabled?: Dynamic,
): Dynamic {
  let baseOption: Dynamic = {
    value: optionValue,
    tooltip: tooltipText,
    ...(isDisabled !== undefined
      ? {
          disabled: isDisabled,
        }
      : {}),
  };
  if (optionValue === "image")
    return {
      ...baseOption,
      icon: "Image",
    };
  let optionIcon: Dynamic = PropertiesTooltipColorGradientConfig[optionValue];
  return optionIcon === undefined
    ? {
        ...baseOption,
        label: tooltipText,
      }
    : {
        ...baseOption,
        label: (0, reactPropertiesTooltip_3.createElement)(
          reactPropertiesTooltip_3.Fragment,
          null,
          (0, reactPropertiesTooltip_3.createElement)(
            PropertyOptionIcon,
            {
              icon: optionIcon,
            },
          ),
          (0, reactPropertiesTooltip_3.createElement)(
            "span",
            {
              className: "sr-only",
            },
            tooltipText,
          ),
        ),
      };
}
function PropertyOptionIcon({
  icon: icon,
  className: className,
}: Dynamic): Dynamic {
  let iconClassName: Dynamic = className ?? "shrink-0";
  return typeof icon == "string"
    ? (0, reactPropertiesTooltip_3.createElement)(Icon, {
        name: icon,
        size: "auto",
        className: iconClassName,
      })
    : (0, reactPropertiesTooltip_3.createElement)(Icon, {
        customIcon: icon,
        size: "auto",
        className: iconClassName,
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
