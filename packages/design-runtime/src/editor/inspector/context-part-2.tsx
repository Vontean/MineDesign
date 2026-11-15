/** Restored application module; prepare first, initialize in original order. */
import {
  type Dynamic,
} from "../../runtime-types";
import { initializeCdsIndex } from "../../cds/index";
import { iconFontMetadata, initializePlatformRootFontSize_4 } from "../../cds/platform/root-font-size";
import { load_react, load_react_jsx_runtime } from "../../dependencies";
import { toModuleNamespace } from "../../module-helpers";

var reactInspectorContext_2: Dynamic;
var InspectorContextDsColorTokensArtboardColorsDesignColorTokensConfig: Dynamic;
var InspectorContext: Dynamic;
var reactInspectorContext_3: Dynamic;
var InspectorContextIconsValue: Dynamic;
var InspectorContextLimit: Dynamic;
var InspectorContextConstant: Dynamic;
var reactInspectorContext_4: Dynamic;
var jsxInspectorContext: Dynamic;
function useInspectorContext(): Dynamic {
  return (0, reactInspectorContext_2.useContext)(InspectorContext);
}
function getSupportedTool(input?: Dynamic): Dynamic {
  return typeof input == "string" &&
    Object.hasOwn(InspectorContextIconsValue, input)
    ? input
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
  reactInspectorContext_2,
  reactInspectorContext_3,
  reactInspectorContext_4,
  useInspectorContext,
};
export function installEditorInspectorContextPart2(): () => void {
  return () => {
    reactInspectorContext_2 = (0, toModuleNamespace)(
      (0, load_react)(),
      1,
    );
    InspectorContextDsColorTokensArtboardColorsDesignColorTokensConfig = {
      dsColorTokens: [],
      artboardColors: [],
      designColorTokens: [],
      setOverlayHidden: (): Dynamic => {},
      setScrubbing: (): Dynamic => {},
    };
    InspectorContext = (0, reactInspectorContext_2.createContext)(
      InspectorContextDsColorTokensArtboardColorsDesignColorTokensConfig,
    );
    reactInspectorContext_3 = (0, toModuleNamespace)(
      (0, load_react)(),
      1,
    );
    (0, initializeCdsIndex)();
    (0, initializePlatformRootFontSize_4)();
    InspectorContextIconsValue = iconFontMetadata.icons;
    InspectorContextLimit = 8;
    InspectorContextConstant = 0.9;
    reactInspectorContext_4 = (0, toModuleNamespace)(
      (0, load_react)(),
      1,
    );
    (0, initializeCdsIndex)();
    (0, initializeCdsIndex)();
    jsxInspectorContext = (0, toModuleNamespace)(
      (0, load_react_jsx_runtime)(),
      1,
    );
  };
}
