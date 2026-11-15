import { useUiLocale } from '../ui-locale.ts';
/** Restored application module; prepare first, initialize in original order. */
import {
  type Dynamic,
} from "../runtime-types";
import { initializeCdsIndex } from "../cds/index";
import { CdsRoot } from "../cds/theme/root";
import { load_react_jsx_runtime } from "../dependencies";
import { initializeOnce, toModuleNamespace } from "../module-helpers";
import { initializePlatformTheme, useDocumentTheme } from "./theme";

var jsxPlatformCdsIsland: Dynamic;
var cdsIslandClassName: Dynamic;
var initializePlatformCdsIsland: Dynamic;
function CdsIsland({ className: className, ...props }: Dynamic): Dynamic {
  useUiLocale();
  let { resolved: value }: Dynamic = (0, useDocumentTheme)();
  return (
    <CdsRoot
      mode={value}
      className={
        className ? cdsIslandClassName + " " + className : cdsIslandClassName
      }
      {...props}
    />
  );
}
export {
  CdsIsland,
  cdsIslandClassName,
  initializePlatformCdsIsland,
  jsxPlatformCdsIsland,
};
export function installPlatformCdsIsland(): () => void {
  return () => {
    initializePlatformCdsIsland = (0, initializeOnce)((): Dynamic => {
      "use strict";

      (0, initializeCdsIndex)();
      (0, initializePlatformTheme)();
      jsxPlatformCdsIsland = (0, toModuleNamespace)(
        (0, load_react_jsx_runtime)(),
        1,
      );
      cdsIslandClassName = "cds-island";
    });
  };
}
