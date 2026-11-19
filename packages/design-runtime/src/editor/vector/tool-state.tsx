/** Restored application module; prepare first, initialize in original order. */
import {
  type Dynamic,
} from "../../runtime-types";
import { initializeNpm_usehooks_ts_p0, load_react, load_react_dom } from "../../dependencies";
import { toModuleNamespace } from "../../module-helpers";

var reactVectorToolState: Dynamic;
var reactVectorToolState_2: Dynamic;
var reactDomVectorToolState: Dynamic;
function useVectorToolReset(
  toolKind?: Dynamic,
  selection?: Dynamic,
  resetToolState?: Dynamic,
): Dynamic {
  let value: Dynamic = (0, reactVectorToolState.useRef)(null);
  (0, reactVectorToolState.useEffect)((): Dynamic => {
    toolKind !== "vector"
      ? (value.current = null)
      : value.current == null
        ? (value.current = selection)
        : value.current !== selection &&
          resetToolState((resetCount?: Dynamic): Dynamic => resetCount + 1);
  }, [toolKind, selection, resetToolState]);
}
export {
  reactDomVectorToolState,
  reactVectorToolState,
  reactVectorToolState_2,
  useVectorToolReset,
};
export function installEditorVectorToolState(): () => void {
  return () => {
    reactVectorToolState = toModuleNamespace(
      load_react(),
      1,
    );
    reactVectorToolState_2 = toModuleNamespace(
      load_react(),
      1,
    );
    reactDomVectorToolState = toModuleNamespace(
      load_react_dom(),
      1,
    );
    initializeNpm_usehooks_ts_p0();
  };
}
