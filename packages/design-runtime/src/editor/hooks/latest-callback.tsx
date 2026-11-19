/** Restored application module; prepare first, initialize in original order. */
import {
  type Dynamic,
} from "../../runtime-types";
import { load_react, load_react_jsx_runtime } from "../../dependencies";
import { toModuleNamespace } from "../../module-helpers";

var reactHooksLatestCallback: Dynamic;
var reactHooksLatestCallback_2: Dynamic;
var reactHooksLatestCallback_3: Dynamic;
var reactHooksLatestCallback_4: Dynamic;
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
  reactHooksLatestCallback_2,
  reactHooksLatestCallback_3,
  reactHooksLatestCallback_4,
  useLatestCallback,
};
export function installEditorHooksLatestCallback(): () => void {
  return () => {
    reactHooksLatestCallback = toModuleNamespace(
      load_react(),
      1,
    );
    reactHooksLatestCallback_2 = toModuleNamespace(
      load_react(),
      1,
    );
    reactHooksLatestCallback_3 = toModuleNamespace(
      load_react(),
      1,
    );
    reactHooksLatestCallback_4 = toModuleNamespace(
      load_react(),
      1,
    );
    jsxHooksLatestCallback = toModuleNamespace(
      load_react_jsx_runtime(),
      1,
    );
  };
}
