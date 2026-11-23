/** Restored application module; prepare first, initialize in original order. */
import {
  type Dynamic,
} from "../../runtime-types";
import { load_react, load_react_jsx_runtime } from "../../dependencies";
import { toModuleNamespace } from "../../module-helpers";

var reactHooksLatestCallback: Dynamic;
var reactForCanvasShape: Dynamic;
var reactForVectorPathEditor: Dynamic;
var reactForUseVectorEditor: Dynamic;
var jsxHooksLatestCallback: Dynamic;
function useLatestCallback(callback?: Dynamic): Dynamic {
  let callbackRef: Dynamic = (0, reactHooksLatestCallback.useRef)(callback);
  (0, reactHooksLatestCallback.useInsertionEffect)((): Dynamic => {
    callbackRef.current = callback;
  });
  return (0, reactHooksLatestCallback.useCallback)(
    (...callbackArgs: Dynamic[]): Dynamic => callbackRef.current(...callbackArgs),
    [],
  );
}
export {
  jsxHooksLatestCallback,
  reactHooksLatestCallback,
  reactForCanvasShape,
  reactForVectorPathEditor,
  reactForUseVectorEditor,
  useLatestCallback,
};
export function installEditorHooksLatestCallback(): () => void {
  return () => {
    reactHooksLatestCallback = toModuleNamespace(
      load_react(),
      1,
    );
    reactForCanvasShape = toModuleNamespace(
      load_react(),
      1,
    );
    reactForVectorPathEditor = toModuleNamespace(
      load_react(),
      1,
    );
    reactForUseVectorEditor = toModuleNamespace(
      load_react(),
      1,
    );
    jsxHooksLatestCallback = toModuleNamespace(
      load_react_jsx_runtime(),
      1,
    );
  };
}
