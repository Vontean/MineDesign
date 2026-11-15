import { useUiLocale } from '../../ui-locale.ts';
/** Restored application module; prepare first, initialize in original order. */
import {
  type Dynamic,
} from "../../runtime-types";
import { initializeCdsIndex } from "../../cds/index";
import { CdsRoot } from "../../cds/theme/root";
import { ToastProvider } from "../../cds/toast/toast";
import { TooltipImplProvider } from "../../cds/tooltip/tooltip";
import { load_react, load_react_dom, load_react_jsx_runtime } from "../../dependencies";
import { toModuleNamespace } from "../../module-helpers";
import { defaultDensity } from "../../platform/document-theme";

var jsxChromeRoot: Dynamic;
var jsxChromeRoot_2: Dynamic;
var reactChromeRoot: Dynamic;
var reactDomChromeRoot: Dynamic;
var jsxChromeRoot_3: Dynamic;
var jsxChromeRoot_4: Dynamic;
var reactChromeRoot_2: Dynamic;
var jsxChromeRoot_5: Dynamic;
function EditorChromeRoot({ children: children }: Dynamic): Dynamic {
  useUiLocale();
  return (
    <CdsRoot
      density={defaultDensity}
      font={"anthropic"}
      className={"contents"}
    >
      <TooltipImplProvider>
        <ToastProvider>{children}</ToastProvider>
      </TooltipImplProvider>
    </CdsRoot>
  );
}
export {
  EditorChromeRoot,
  jsxChromeRoot,
  jsxChromeRoot_2,
  jsxChromeRoot_3,
  jsxChromeRoot_4,
  jsxChromeRoot_5,
  reactChromeRoot,
  reactChromeRoot_2,
  reactDomChromeRoot,
};
export function installEditorChromeRoot(): () => void {
  return () => {
    jsxChromeRoot = (0, toModuleNamespace)(
      (0, load_react_jsx_runtime)(),
      1,
    );
    jsxChromeRoot_2 = (0, toModuleNamespace)(
      (0, load_react_jsx_runtime)(),
      1,
    );
    reactChromeRoot = (0, toModuleNamespace)(
      (0, load_react)(),
      1,
    );
    (0, initializeCdsIndex)();
    reactDomChromeRoot = (0, toModuleNamespace)(
      (0, load_react_dom)(),
      1,
    );
    jsxChromeRoot_3 = (0, toModuleNamespace)(
      (0, load_react_jsx_runtime)(),
      1,
    );
    (0, initializeCdsIndex)();
    jsxChromeRoot_4 = (0, toModuleNamespace)(
      (0, load_react_jsx_runtime)(),
      1,
    );
    reactChromeRoot_2 = (0, toModuleNamespace)(
      (0, load_react)(),
      1,
    );
    jsxChromeRoot_5 = (0, toModuleNamespace)(
      (0, load_react_jsx_runtime)(),
      1,
    );
  };
}
