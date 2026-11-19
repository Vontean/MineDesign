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
function useDesignColorTokens(unusedOptions?: Dynamic): Dynamic {
  let designSystems: Dynamic = useDesignSystems();
  return (0, reactCodeScriptLiterals.useMemo)((): Dynamic => {
    let seenNames: Dynamic = new Set(),
      items: Dynamic = [];
    for (let designSystem of designSystems as Dynamic)
      for (let color of designSystem.colors as Dynamic)
        seenNames.has(color.name) ||
          (seenNames.add(color.name),
          items.push({
            name: "--" + color.name,
            value: color.value,
            ...colorTokenGroupLabels(designSystem, color),
          }));
    return {
      tokens: items,
      themes: [],
    };
  }, [designSystems]);
}
export {
  jsxCodeDesignColorTokens,
  reactCodeDesignColorTokens,
  useDesignColorTokens,
};
export function installEditorCodeDesignColorTokens(): () => void {
  return () => {
    initializeCdsIndex();
    reactCodeDesignColorTokens = toModuleNamespace(
      load_react(),
      1,
    );
    initializePlatformCdsIsland();
    jsxCodeDesignColorTokens = toModuleNamespace(
      load_react_jsx_runtime(),
      1,
    );
  };
}
