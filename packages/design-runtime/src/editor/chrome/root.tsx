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
var reactChromeRoot: Dynamic;
var reactDomChromeRoot: Dynamic;
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
  reactChromeRoot,
  reactDomChromeRoot,
};
export function installEditorChromeRoot(): () => void {
  return () => {
    jsxChromeRoot = toModuleNamespace(
      load_react_jsx_runtime(),
      1,
    );
    reactChromeRoot = toModuleNamespace(
      load_react(),
      1,
    );
    initializeCdsIndex();
    reactDomChromeRoot = toModuleNamespace(
      load_react_dom(),
      1,
    );
    initializeCdsIndex();
  };
}
