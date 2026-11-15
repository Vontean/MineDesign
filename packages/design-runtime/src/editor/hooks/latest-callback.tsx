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
function useLatestCallback(input?: Dynamic): Dynamic {
  let value: Dynamic = (0, reactHooksLatestCallback.useRef)(input);
  (0, reactHooksLatestCallback.useInsertionEffect)((): Dynamic => {
    value.current = input;
  });
  return (0, reactHooksLatestCallback.useCallback)(
    (...input2: Dynamic[]): Dynamic => value.current(...input2),
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
    reactHooksLatestCallback = (0, toModuleNamespace)(
      (0, load_react)(),
      1,
    );
    reactHooksLatestCallback_2 = (0, toModuleNamespace)(
      (0, load_react)(),
      1,
    );
    reactHooksLatestCallback_3 = (0, toModuleNamespace)(
      (0, load_react)(),
      1,
    );
    reactHooksLatestCallback_4 = (0, toModuleNamespace)(
      (0, load_react)(),
      1,
    );
    jsxHooksLatestCallback = (0, toModuleNamespace)(
      (0, load_react_jsx_runtime)(),
      1,
    );
  };
}
