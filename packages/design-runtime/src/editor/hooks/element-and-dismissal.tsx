/** Restored application module; prepare first, initialize in original order. */
import {
  type Dynamic,
} from "../../runtime-types";
import { initializeNpm_usehooks_ts_p0, load_react, npm_useEventListener_bc } from "../../dependencies";
import { toModuleNamespace } from "../../module-helpers";

var reactHooksElementAndDismissal: Dynamic;
var reactForUseLiveDismissalGuard: Dynamic;
var HooksElementAndDismissalSubscribers: Dynamic;
function useElementById(elementId?: Dynamic): Dynamic {
  let [element, setElement]: Dynamic = (0, reactHooksElementAndDismissal.useState)(
    (): Dynamic => (document as Dynamic).getElementById(elementId),
  );
  (0, reactHooksElementAndDismissal.useLayoutEffect)((): Dynamic => {
    let foundElement: Dynamic = (document as Dynamic).getElementById(elementId);
    setElement(
      (previousElement?: Dynamic): Dynamic => (previousElement === foundElement ? previousElement : foundElement),
    );
  });
  return element;
}
function useLiveDismissalGuard(dismissalGuard?: Dynamic): Dynamic {
  let guardRef: Dynamic = (0, reactForUseLiveDismissalGuard.useRef)(dismissalGuard);
  guardRef.current = dismissalGuard;
  (0, reactForUseLiveDismissalGuard.useEffect)((): Dynamic => {
    let callback: Dynamic = (): Dynamic =>
      typeof guardRef.current == "function" ? guardRef.current() : guardRef.current;
    HooksElementAndDismissalSubscribers.add(callback);
    return (): Dynamic => {
      HooksElementAndDismissalSubscribers.delete(callback);
    };
  }, []);
  npm_useEventListener_bc(
    "beforeunload",
    (event?: Dynamic): Dynamic => {
      (typeof dismissalGuard == "function" ? dismissalGuard() : dismissalGuard) &&
        (event.preventDefault(), (event.returnValue = ""));
    },
  );
}
export {
  HooksElementAndDismissalSubscribers,
  reactHooksElementAndDismissal,
  reactForUseLiveDismissalGuard,
  useElementById,
  useLiveDismissalGuard,
};
export function installEditorHooksElementAndDismissal(): () => void {
  return () => {
    reactHooksElementAndDismissal = toModuleNamespace(
      load_react(),
      1,
    );
    reactForUseLiveDismissalGuard = toModuleNamespace(
      load_react(),
      1,
    );
    initializeNpm_usehooks_ts_p0();
    HooksElementAndDismissalSubscribers = new Set();
  };
}
