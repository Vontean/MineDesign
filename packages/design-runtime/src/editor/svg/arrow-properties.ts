import { uiMessage } from '@minedesign/contracts/ui-messages';
/** Restored application module; prepare first, initialize in original order. */
import {
  type Dynamic,
} from "../../runtime-types";

var SvgArrowPropertiesHeadStartHeadEndConfig: Dynamic;
var SvgArrowPropertiesNoneOpenFilledConfig: Dynamic;
var SvgArrowPropertiesLabel: Dynamic;
var allArrowsNeedThicknessMessage: Dynamic;
function findSvgShaft(svgRoot?: Dynamic, isShaftNode?: Dynamic): Dynamic {
  let state: Dynamic = {
      defs: 1,
      marker: 1,
      metadata: 1,
      title: 1,
      desc: 1,
      style: 1,
    },
    callback: Dynamic = (node?: Dynamic): Dynamic => {
      for (let index: Dynamic = 0; index < node.children.length; index++) {
        let value: Dynamic = node.children[index],
          tagName: Dynamic = (value.tagName || "").toLowerCase();
        if (
          !(state[tagName] === 1 || isShaftNode(value)) &&
          !(tagName === "g" && callback(value))
        )
          return false;
      }
      return true;
    };
  return callback(svgRoot);
}
function arrowHeadPropertyRows(arrowData?: Dynamic): Dynamic {
  let heads: Dynamic = arrowData.heads;
  return heads
    ? ["__headStart", "__headEnd"].map((headProperty?: Dynamic): Dynamic => {
        let value: Dynamic =
            heads[headProperty === "__headStart" ? "start" : "end"],
          headLabel: Dynamic = SvgArrowPropertiesHeadStartHeadEndConfig[headProperty];
        return {
          prop: headProperty,
          label: headLabel,
          spec: {
            prop: headProperty,
            label: headLabel,
            editor: "flexSeg",
            section: "stroke",
            options: Object.keys(SvgArrowPropertiesNoneOpenFilledConfig),
            optionLabels: SvgArrowPropertiesNoneOpenFilledConfig,
          },
          value: value === "unknown" ? null : value,
          disabled: arrowData.disabled || heads.width == null,
          ...(heads.width == null && !arrowData.disabled
            ? {
                whyDisabled: SvgArrowPropertiesLabel,
              }
            : {}),
        };
      })
    : [];
}
export {
  arrowHeadPropertyRows,
  findSvgShaft,
  SvgArrowPropertiesHeadStartHeadEndConfig,
  SvgArrowPropertiesLabel,
  allArrowsNeedThicknessMessage as SvgArrowPropertiesLabel_2,
  SvgArrowPropertiesNoneOpenFilledConfig,
};
export function installEditorSvgArrowProperties(): () => void {
  return () => {
    SvgArrowPropertiesHeadStartHeadEndConfig = {
      __headStart: "Start",
      __headEnd: "End",
    };
    SvgArrowPropertiesNoneOpenFilledConfig = {
      get none() { return uiMessage("inspector.arrowProperties.none"); },
      get open() { return uiMessage("inspector.arrowProperties.open"); },
      filled: "Filled",
    };
    SvgArrowPropertiesLabel =
      uiMessage("inspector.arrowProperties.toChooseAnArrowheadFirst");
    allArrowsNeedThicknessMessage =
      uiMessage("inspector.arrowProperties.toChooseAnArrowheadFirst2");
  };
}
