/** Restored application module; prepare first, initialize in original order. */
import {
  type Dynamic,
} from "../../runtime-types";
import { initializeCdsIndex } from "../../cds/index";
import { load_react, load_react_jsx_runtime } from "../../dependencies";
import { ChromeResizeGripCurrentState, reactChromeResizeGrip } from "./resize-grip";
import { toModuleNamespace } from "../../module-helpers";

var reactChromePanelClose: Dynamic;
var jsxChromePanelClose: Dynamic;
var jsxChromePanelClose_2: Dynamic;
var ChromePanelCloseClassNames: Dynamic;
var ChromePanelCloseClassNames_2: Dynamic;
function usePanelClose(input?: Dynamic, options?: Dynamic): Dynamic {
  let value: Dynamic = (0, reactChromeResizeGrip.useRef)({
    open: input,
    isOpenNow: options,
  });
  value.current = {
    open: input,
    isOpenNow: options,
  };
  let value2: Dynamic = (0, reactChromeResizeGrip.useRef)(false);
  (0, reactChromeResizeGrip.useEffect)(
    (): Dynamic => (
      (value2.current = true),
      (): Dynamic => {
        value2.current = false;
      }
    ),
    [],
  );
  (0, reactChromeResizeGrip.useEffect)((): Dynamic => {
    if (input)
      return (): Dynamic => {
        ChromeResizeGripCurrentState !== null &&
          requestAnimationFrame((): Dynamic => {
            let { open: current, isOpenNow: current2 }: Dynamic =
              value.current;
            (current2 ? current2() : value2.current && current) ||
              panelCanRestoreFocus();
          });
      };
  }, [input]);
}
function panelCanRestoreFocus(): Dynamic {
  if (
    ChromeResizeGripCurrentState === null ||
    !(document as Dynamic).hasFocus()
  )
    return false;
  let activeElement: Dynamic = (document as Dynamic).activeElement;
  if (
    !(
      activeElement === null ||
      activeElement === (document as Dynamic).body ||
      activeElement === (document as Dynamic).documentElement
    )
  )
    return false;
  let value: Dynamic = (0, ChromeResizeGripCurrentState)();
  return value === null ||
    !value.isConnected ||
    value.closest('[inert], [aria-hidden="true"]') !== null
    ? false
    : (value.focus({
        preventScroll: true,
      }),
      (document as Dynamic).activeElement === value);
}
export {
  ChromePanelCloseClassNames,
  ChromePanelCloseClassNames_2,
  jsxChromePanelClose,
  jsxChromePanelClose_2,
  panelCanRestoreFocus,
  reactChromePanelClose,
  usePanelClose,
};
export function installEditorChromePanelClose(): () => void {
  return () => {
    reactChromePanelClose = (0, toModuleNamespace)(
      (0, load_react)(),
      1,
    );
    jsxChromePanelClose = (0, toModuleNamespace)(
      (0, load_react_jsx_runtime)(),
      1,
    );
    (0, initializeCdsIndex)();
    jsxChromePanelClose_2 = (0, toModuleNamespace)(
      (0, load_react_jsx_runtime)(),
      1,
    );
    ChromePanelCloseClassNames =
      "[&_[role=radio]]:px-0 [&_[role=radio]]:min-w-[calc(var(--cds-h-control)_-_2px)]";
    ChromePanelCloseClassNames_2 =
      "[&_[data-cds=SegmentedControl]]:gap-0 [&_[data-cds=SegmentedControl]]:p-0 [&_[role=radio]]:px-0 [&_[role=radio]]:min-w-[var(--cds-h-control)]";
  };
}
