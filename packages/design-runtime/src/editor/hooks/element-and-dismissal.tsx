/** Restored application module; prepare first, initialize in original order. */
import {
  type Dynamic,
} from "../../runtime-types";
import { initializeNpm_usehooks_ts_p0, load_react, npm_useEventListener_bc } from "../../dependencies";
import { toModuleNamespace } from "../../module-helpers";

var reactHooksElementAndDismissal: Dynamic;
var reactHooksElementAndDismissal_2: Dynamic;
var HooksElementAndDismissalSubscribers: Dynamic;
function useElementById(input?: Dynamic): Dynamic {
  let [value, value2]: Dynamic = (0, reactHooksElementAndDismissal.useState)(
    (): Dynamic => (document as Dynamic).getElementById(input),
  );
  (0, reactHooksElementAndDismissal.useLayoutEffect)((): Dynamic => {
    let value3: Dynamic = (document as Dynamic).getElementById(input);
    value2(
      (input2?: Dynamic): Dynamic => (input2 === value3 ? input2 : value3),
    );
  });
  return value;
}
function useLiveDismissalGuard(input?: Dynamic): Dynamic {
  let value: Dynamic = (0, reactHooksElementAndDismissal_2.useRef)(input);
  value.current = input;
  (0, reactHooksElementAndDismissal_2.useEffect)((): Dynamic => {
    let callback: Dynamic = (): Dynamic =>
      typeof value.current == "function" ? value.current() : value.current;
    HooksElementAndDismissalSubscribers.add(callback);
    return (): Dynamic => {
      HooksElementAndDismissalSubscribers.delete(callback);
    };
  }, []);
  (0, npm_useEventListener_bc)(
    "beforeunload",
    (event?: Dynamic): Dynamic => {
      (typeof input == "function" ? input() : input) &&
        (event.preventDefault(), (event.returnValue = ""));
    },
  );
}
export {
  HooksElementAndDismissalSubscribers,
  reactHooksElementAndDismissal,
  reactHooksElementAndDismissal_2,
  useElementById,
  useLiveDismissalGuard,
};
export function installEditorHooksElementAndDismissal(): () => void {
  return () => {
    reactHooksElementAndDismissal = (0, toModuleNamespace)(
      (0, load_react)(),
      1,
    );
    reactHooksElementAndDismissal_2 = (0, toModuleNamespace)(
      (0, load_react)(),
      1,
    );
    (0, initializeNpm_usehooks_ts_p0)();
    HooksElementAndDismissalSubscribers = new Set();
  };
}
