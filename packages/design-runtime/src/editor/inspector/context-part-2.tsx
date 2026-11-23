/** Restored application module; prepare first, initialize in original order. */
import {
  type Dynamic,
} from "../../runtime-types";
import { initializeCdsIndex } from "../../cds/index";
import { iconFontMetadata, initializeIconFontMetadata } from "../../cds/platform/root-font-size";
import { load_react, load_react_jsx_runtime } from "../../dependencies";
import { toModuleNamespace } from "../../module-helpers";

var reactForUseInspectorContext: Dynamic;
var InspectorContextDsColorTokensArtboardColorsDesignColorTokensConfig: Dynamic;
var InspectorContext: Dynamic;
var reactForPropColorInput: Dynamic;
var InspectorContextIconsValue: Dynamic;
var InspectorContextLimit: Dynamic;
var InspectorContextConstant: Dynamic;
var reactForPropertyRow: Dynamic;
var jsxInspectorContext: Dynamic;
function useInspectorContext(): Dynamic {
  return (0, reactForUseInspectorContext.useContext)(InspectorContext);
}
function getSupportedTool(toolName?: Dynamic): Dynamic {
  return typeof toolName == "string" &&
    Object.hasOwn(InspectorContextIconsValue, toolName)
    ? toolName
    : undefined;
}
function isToolNameList(items?: Dynamic): Dynamic {
  if (items.length < InspectorContextLimit) return false;
  let index: Dynamic = 0;
  for (let value of items as Dynamic)
    getSupportedTool(value) !== undefined && index++;
  return index >= items.length * InspectorContextConstant;
}
export {
  getSupportedTool,
  InspectorContext,
  InspectorContextConstant,
  InspectorContextDsColorTokensArtboardColorsDesignColorTokensConfig,
  InspectorContextIconsValue,
  InspectorContextLimit,
  isToolNameList,
  jsxInspectorContext,
  reactForUseInspectorContext,
  reactForPropColorInput,
  reactForPropertyRow,
  useInspectorContext,
};
export function installEditorInspectorContextPart2(): () => void {
  return () => {
    reactForUseInspectorContext = toModuleNamespace(
      load_react(),
      1,
    );
    InspectorContextDsColorTokensArtboardColorsDesignColorTokensConfig = {
      dsColorTokens: [],
      artboardColors: [],
      designColorTokens: [],
      setOverlayHidden: (): Dynamic => {},
      setScrubbing: (): Dynamic => {},
    };
    InspectorContext = (0, reactForUseInspectorContext.createContext)(
      InspectorContextDsColorTokensArtboardColorsDesignColorTokensConfig,
    );
    reactForPropColorInput = toModuleNamespace(
      load_react(),
      1,
    );
    initializeCdsIndex();
    initializeIconFontMetadata();
    InspectorContextIconsValue = iconFontMetadata.icons;
    InspectorContextLimit = 8;
    InspectorContextConstant = 0.9;
    reactForPropertyRow = toModuleNamespace(
      load_react(),
      1,
    );
    initializeCdsIndex();
    initializeCdsIndex();
    jsxInspectorContext = toModuleNamespace(
      load_react_jsx_runtime(),
      1,
    );
  };
}
