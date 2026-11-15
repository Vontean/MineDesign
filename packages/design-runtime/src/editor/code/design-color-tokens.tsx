/** Restored application module; prepare first, initialize in original order. */
import {
  type Dynamic,
} from "../../runtime-types";
import { initializeCdsIndex } from "../../cds/index";
import { load_react, load_react_jsx_runtime } from "../../dependencies";
import { useDesignSystems } from "../../design-system/store";
import { colorTokenGroupLabels } from "../../design-system/type-declarations";
import { reactCodeScriptLiterals } from "./script-literals";
import { toModuleNamespace } from "../../module-helpers";
import { initializePlatformCdsIsland } from "../../platform/cds-island";

var reactCodeDesignColorTokens: Dynamic;
var jsxCodeDesignColorTokens: Dynamic;
function useDesignColorTokens(input?: Dynamic): Dynamic {
  let value: Dynamic = (0, useDesignSystems)();
  return (0, reactCodeScriptLiterals.useMemo)((): Dynamic => {
    let values: Dynamic = new Set(),
      items: Dynamic = [];
    for (let value2 of value as Dynamic)
      for (let value3 of value2.colors as Dynamic)
        values.has(value3.name) ||
          (values.add(value3.name),
          items.push({
            name: "--" + value3.name,
            value: value3.value,
            ...(0, colorTokenGroupLabels)(value2, value3),
          }));
    return {
      tokens: items,
      themes: [],
    };
  }, [value]);
}
export {
  jsxCodeDesignColorTokens,
  reactCodeDesignColorTokens,
  useDesignColorTokens,
};
export function installEditorCodeDesignColorTokens(): () => void {
  return () => {
    (0, initializeCdsIndex)();
    reactCodeDesignColorTokens = (0, toModuleNamespace)(
      (0, load_react)(),
      1,
    );
    (0, initializePlatformCdsIsland)();
    jsxCodeDesignColorTokens = (0, toModuleNamespace)(
      (0, load_react_jsx_runtime)(),
      1,
    );
  };
}
