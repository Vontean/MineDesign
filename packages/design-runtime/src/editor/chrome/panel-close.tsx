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
function usePanelClose(isOpen?: Dynamic, isOpenNowCheck?: Dynamic): Dynamic {
  let latestStateRef: Dynamic = (0, reactChromeResizeGrip.useRef)({
    open: isOpen,
    isOpenNow: isOpenNowCheck,
  });
  latestStateRef.current = {
    open: isOpen,
    isOpenNow: isOpenNowCheck,
  };
  let isMountedRef: Dynamic = (0, reactChromeResizeGrip.useRef)(false);
  (0, reactChromeResizeGrip.useEffect)(
    (): Dynamic => (
      (isMountedRef.current = true),
      (): Dynamic => {
        isMountedRef.current = false;
      }
    ),
    [],
  );
  (0, reactChromeResizeGrip.useEffect)((): Dynamic => {
    if (isOpen)
      return (): Dynamic => {
        ChromeResizeGripCurrentState !== null &&
          requestAnimationFrame((): Dynamic => {
            let { open: current, isOpenNow: latestIsOpenNowCheck }: Dynamic =
              latestStateRef.current;
            (latestIsOpenNowCheck ? latestIsOpenNowCheck() : isMountedRef.current && current) ||
              panelCanRestoreFocus();
          });
      };
  }, [isOpen]);
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
  let focusTarget: Dynamic = ChromeResizeGripCurrentState();
  return focusTarget === null ||
    !focusTarget.isConnected ||
    focusTarget.closest('[inert], [aria-hidden="true"]') !== null
    ? false
    : (focusTarget.focus({
        preventScroll: true,
      }),
      (document as Dynamic).activeElement === focusTarget);
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
    reactChromePanelClose = toModuleNamespace(
      load_react(),
      1,
    );
    jsxChromePanelClose = toModuleNamespace(
      load_react_jsx_runtime(),
      1,
    );
    initializeCdsIndex();
    jsxChromePanelClose_2 = toModuleNamespace(
      load_react_jsx_runtime(),
      1,
    );
    ChromePanelCloseClassNames =
      "[&_[role=radio]]:px-0 [&_[role=radio]]:min-w-[calc(var(--cds-h-control)_-_2px)]";
    ChromePanelCloseClassNames_2 =
      "[&_[data-cds=SegmentedControl]]:gap-0 [&_[data-cds=SegmentedControl]]:p-0 [&_[role=radio]]:px-0 [&_[role=radio]]:min-w-[var(--cds-h-control)]";
  };
}
