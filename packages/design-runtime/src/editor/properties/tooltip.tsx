import { uiMessage } from '@minedesign/contracts/ui-messages';
import { useUiLocale } from '../../ui-locale.ts';
/** Restored application module; prepare first, initialize in original order. */
import {
  type Dynamic,
} from "../../runtime-types";
import { initializeCdsIndex } from "../../cds/index";
import { Tooltip } from "../../cds/tooltip/tooltip";
import { load_react, load_react_jsx_runtime } from "../../dependencies";
import { joinClassNames } from "../chrome/overlay-state";
import { toModuleNamespace } from "../../module-helpers";

var jsxPropertiesTooltip: Dynamic;
var reactPropertiesTooltip: Dynamic;
var reactForGradientEditor: Dynamic;
var reactForToolSegmentOption: Dynamic;
var PropertiesTooltipHandler: Dynamic;
var TextAlignLeftValue: Dynamic;
var TextAlignCenterValue: Dynamic;
var TextAlignRightValue: Dynamic;
var TextAlignJustifyValue: Dynamic;
var LineHeightValue: Dynamic;
var borderWeightIcon: Dynamic;
var borderSidesIcon: Dynamic;
var cornerRadiusIcon: Dynamic;
var cornerEachIcon: Dynamic;
var CropValue: Dynamic;
var spacingIcon: Dynamic;
var strokeSolidIcon: Dynamic;
var strokeDashedIcon: Dynamic;
var strokeDottedIcon: Dynamic;
var tableRowsIcon: Dynamic;
var tableColumnsIcon: Dynamic;
var fillSolidIcon: Dynamic;
var fillGradientIcon: Dynamic;
var angleIcon: Dynamic;
var PropertiesTooltipColorGradientConfig: Dynamic;
function EditorTooltip({
  tip: tip,
  shortcut: shortcut,
  side = "top",
  align = "center",
  wrap = false,
  delay: delay,
  className: className,
  children: children,
}: Dynamic): Dynamic {
  useUiLocale();
  return (
    <Tooltip
      content={tip}
      shortcut={shortcut}
      side={side}
      align={
        align === "right" ? "end" : align === "left" ? "start" : "center"
      }
      multiline={wrap}
      delay={delay}
      hoverable={false}
    >
      <span
        data-tip={typeof tip == "string" ? (tip) : (undefined)}
        className={joinClassNames(
          "relative inline-flex align-top",
          className,
        )}
      >
        {children}
      </span>
    </Tooltip>
  );
}
export {
  CropValue,
  EditorTooltip,
  jsxPropertiesTooltip,
  LineHeightValue,
  PropertiesTooltipColorGradientConfig,
  PropertiesTooltipHandler,
  borderWeightIcon as PropertiesTooltipNameViewBoxPathsConfig,
  tableColumnsIcon,
  fillSolidIcon,
  fillGradientIcon,
  angleIcon,
  borderSidesIcon,
  cornerRadiusIcon,
  cornerEachIcon,
  spacingIcon,
  strokeSolidIcon,
  strokeDashedIcon,
  strokeDottedIcon,
  tableRowsIcon,
  reactPropertiesTooltip,
  reactForGradientEditor,
  reactForToolSegmentOption,
  TextAlignCenterValue,
  TextAlignJustifyValue,
  TextAlignLeftValue,
  TextAlignRightValue,
};
export function installEditorPropertiesTooltip(): () => void {
  return () => {
    jsxPropertiesTooltip = toModuleNamespace(
      load_react_jsx_runtime(),
      1,
    );
    reactPropertiesTooltip = toModuleNamespace(
      load_react(),
      1,
    );
    initializeCdsIndex();
    reactForGradientEditor = toModuleNamespace(
      load_react(),
      1,
    );
    initializeCdsIndex();
    reactForToolSegmentOption = toModuleNamespace(
      load_react(),
      1,
    );
    initializeCdsIndex();
    PropertiesTooltipHandler = (
      pathData?: Dynamic,
      strokeWidth: Dynamic = 1,
    ): Dynamic => ({
      d: pathData,
      strokeWidth: strokeWidth,
    });
    TextAlignLeftValue = "TextAlignLeft";
    TextAlignCenterValue = "TextAlignCenter";
    TextAlignRightValue = "TextAlignRight";
    TextAlignJustifyValue = "TextAlignJustify";
    LineHeightValue = "LineHeight";
    borderWeightIcon = {
      name: "BorderWeight",
      viewBox: 16,
      get paths() { return [PropertiesTooltipHandler("M3.2 3H12.8"), PropertiesTooltipHandler("M3.2 8H12.8", 1.5), PropertiesTooltipHandler("M3.2 13H12.8", 2)]; },
    };
    borderSidesIcon = {
      name: "BorderSides",
      viewBox: 16,
      get paths() { return [PropertiesTooltipHandler(
          "M5.327 2.655H10.673M5.327 13.345H10.673M2.655 5.328V10.673M13.345 5.328V10.673",
        )]; },
    };
    cornerRadiusIcon = {
      name: "CornerRadius",
      viewBox: 16,
      paths: [PropertiesTooltipHandler("M3 14V9C3 5.686 5.686 3 9 3H14")],
    };
    cornerEachIcon = {
      name: "CornerEach",
      viewBox: 16,
      get paths() { return [PropertiesTooltipHandler(
          "M2.739 5.826V4.739C2.739 3.634 3.634 2.739 4.739 2.739H5.826M10.174 2.739H11.261C12.366 2.739 13.261 3.634 13.261 4.739V5.826M13.261 10.174V11.261C13.261 12.366 12.366 13.261 11.261 13.261H10.174M5.826 13.261H4.739C3.634 13.261 2.739 12.366 2.739 11.261V10.174",
        )]; },
    };
    CropValue = "Crop";
    spacingIcon = {
      name: "Spacing",
      viewBox: 16,
      get paths() { return [PropertiesTooltipHandler(
          "M2 4V3C2 2.448 2.448 2 3 2H4M12 2H13C13.552 2 14 2.448 14 3V4M14 12V13C14 13.552 13.552 14 13 14H12M2 12V13C2 13.552 2.448 14 3 14H4M7 2H9M7 14H9M2 7V9M14 7V9",
        ), PropertiesTooltipHandler(
          "M6 5.6H10C10.221 5.6 10.4 5.779 10.4 6V10C10.4 10.221 10.221 10.4 10 10.4H6C5.779 10.4 5.6 10.221 5.6 10V6C5.6 5.779 5.779 5.6 6 5.6Z",
        )]; },
    };
    strokeSolidIcon = {
      name: "StrokeSolid",
      viewBox: 16,
      paths: [PropertiesTooltipHandler("M2 8H14", 1.5)],
    };
    strokeDashedIcon = {
      name: "StrokeDashed",
      viewBox: 16,
      get paths() { return [PropertiesTooltipHandler("M1.5 8H4.5M6.5 8H9.5M11.5 8H14.5", 1.5)]; },
    };
    strokeDottedIcon = {
      name: "StrokeDotted",
      viewBox: 16,
      get paths() { return [PropertiesTooltipHandler(
          "M2 8H2.01M5 8H5.01M8 8H8.01M11 8H11.01M14 8H14.01",
          1.5,
        )]; },
    };
    tableRowsIcon = {
      name: "TableRows",
      viewBox: 16,
      get paths() { return [PropertiesTooltipHandler(
          "M3.865 4H12.135M3.865 8H12.135M3.865 12H12.135",
        )]; },
    };
    tableColumnsIcon = {
      name: "TableColumns",
      viewBox: 16,
      get paths() { return [PropertiesTooltipHandler(
          "M4 3.865V12.135M8 3.865V12.135M12 3.865V12.135",
        )]; },
    };
    fillSolidIcon = {
      name: "FillSolid",
      viewBox: 16,
      get paths() { return ["M4.25 3H11.75C12.44 3 13 3.56 13 4.25V11.75C13 12.44 12.44 13 11.75 13H4.25C3.56 13 3 12.44 3 11.75V4.25C3 3.56 3.56 3 4.25 3Z"]; },
    };
    fillGradientIcon = {
      name: "FillGradient",
      viewBox: 16,
      get paths() { return [PropertiesTooltipHandler(
          "M4.25 3.5H11.75C12.164 3.5 12.5 3.836 12.5 4.25V11.75C12.5 12.164 12.164 12.5 11.75 12.5H4.25C3.836 12.5 3.5 12.164 3.5 11.75V4.25C3.5 3.836 3.836 3.5 4.25 3.5Z",
        ), "M12 6V11.75C12 11.888 11.888 12 11.75 12H6L12 6Z", "M10.2 4L4 10.2V8.5L8.5 4H10.2Z"]; },
    };
    angleIcon = {
      name: "Angle",
      viewBox: 16,
      get paths() { return [PropertiesTooltipHandler(
          "M3.5 8A4.5 4.5 0 0 1 12.5 8A4.5 4.5 0 0 1 3.5 8ZM8 8L11.2 4.8",
        )]; },
    };
    PropertiesTooltipColorGradientConfig = {
      color: fillSolidIcon,
      gradient: fillGradientIcon,
    };
  };
}
