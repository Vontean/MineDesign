/** Restored application module; prepare first, initialize in original order. */
import {
  type Dynamic,
} from "../runtime-types";
import { load_react } from "../dependencies";
import { isPropertyEditorTarget } from "../editor/keyboard/find";
import { isControlTarget } from "../editor/keyboard/paste";
import { hasBlockingEditorOverlay } from "../editor/text/typing-target";
import { toModuleNamespace } from "../module-helpers";

var react_GT: Dynamic;
function isPanKeyboardInput(target?: Dynamic): Dynamic {
  let element: Dynamic = target;
  return (
    element != null &&
    typeof element.tagName == "string" &&
    (/^(INPUT|TEXTAREA|SELECT)$/.test(element.tagName) ||
      element.isContentEditable === true ||
      isPropertyEditorTarget(element))
  );
}
function createSpacePanKeyboardController(
  onHeldChange?: Dynamic,
  controllerOptions: Dynamic = {},
): Dynamic {
  let isBlocked: Dynamic = controllerOptions.blocked ?? hasBlockingEditorOverlay,
    isHeld: Dynamic = false,
    shouldPreventKeyup: Dynamic = false,
    isPanClaimed: Dynamic = false,
    setHeld: Dynamic = (nextHeld?: Dynamic): Dynamic => {
      nextHeld || (shouldPreventKeyup = false);
      isHeld !== nextHeld && ((isHeld = nextHeld), onHeldChange(nextHeld));
    },
    handleKeyDown: Dynamic = (event?: Dynamic): Dynamic => {
      event.code !== "Space" ||
        isBlocked() ||
        isPanKeyboardInput(event.target) ||
        (!event.defaultPrevented &&
          (event.repeat ||
            isPanClaimed ||
            !isControlTarget(event.target)) &&
          event.preventDefault(),
        !event.repeat && (setHeld(true), isPanClaimed && (shouldPreventKeyup = true)));
    },
    handleKeyUp: Dynamic = (event?: Dynamic): Dynamic => {
      event.code === "Space" &&
        (isHeld && shouldPreventKeyup && event.preventDefault(), setHeld(false));
    },
    handlePointerEnd: Dynamic = (): Dynamic => {
      isPanClaimed = false;
    },
    handleBlur: Dynamic = (): Dynamic => {
      isPanClaimed = false;
      setHeld(false);
    };
  (window as Dynamic).addEventListener("keydown", handleKeyDown);
  (window as Dynamic).addEventListener("keyup", handleKeyUp, true);
  (window as Dynamic).addEventListener("pointerup", handlePointerEnd, true);
  (window as Dynamic).addEventListener("pointercancel", handlePointerEnd, true);
  (window as Dynamic).addEventListener("blur", handleBlur);
  return {
    claimPan(): Dynamic {
      isHeld && (shouldPreventKeyup = isPanClaimed = true);
      return isHeld;
    },
    dispose(): Dynamic {
      (window as Dynamic).removeEventListener("keydown", handleKeyDown);
      (window as Dynamic).removeEventListener("keyup", handleKeyUp, true);
      (window as Dynamic).removeEventListener("pointerup", handlePointerEnd, true);
      (window as Dynamic).removeEventListener(
        "pointercancel",
        handlePointerEnd,
        true,
      );
      (window as Dynamic).removeEventListener("blur", handleBlur);
    },
  };
}
function useSpacePanKeyboard(): Dynamic {
  let [isHeldState, setIsHeldState]: Dynamic = (0, react_GT.useState)(false),
    heldRef: Dynamic = (0, react_GT.useRef)(false),
    controllerRef: Dynamic = (0, react_GT.useRef)(null);
  (0, react_GT.useEffect)((): Dynamic => {
    let controller: Dynamic = createSpacePanKeyboardController(
      (nextHeld?: Dynamic): Dynamic => {
        heldRef.current = nextHeld;
        setIsHeldState(nextHeld);
      },
    );
    controllerRef.current = controller;
    return (): Dynamic => {
      controllerRef.current = null;
      controller.dispose();
    };
  }, []);
  let claimPan: Dynamic = (0, react_GT.useCallback)(
    (): Dynamic => controllerRef.current?.claimPan() ?? false,
    [],
  );
  return {
    held: isHeldState,
    heldRef: heldRef,
    claimPan: claimPan,
  };
}
export {
  createSpacePanKeyboardController,
  isPanKeyboardInput,
  react_GT,
  useSpacePanKeyboard,
};
export function installCanvasSpacePan(): () => void {
  return () => {
    react_GT = toModuleNamespace(load_react(), 1);
  };
}
