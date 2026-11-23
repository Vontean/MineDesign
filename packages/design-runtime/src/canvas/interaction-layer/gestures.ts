import { useLatestCallback } from "../../editor/hooks/latest-callback";
import { suppressNativeContextMenu } from "../../editor/outline/native-menu";
import { schedulePrimaryModifierHeld } from "../../editor/primary-modifier";
import { vectorToolStateReact as React } from "../../editor/vector/tool-state";

type Ref<T> = { current: T };
type GestureKind = string;

type CanvasGestureOptions = {
  canvasRootRef: Ref<HTMLElement | null>;
  onHostGesturing?: (isGesturing: boolean) => void;
  deferredContextClick: {
    move(event: PointerEvent): void;
    end(hasPointerUp: boolean): void;
  };
  endBoardDrag(pointerId: number): void;
};

/** 管理手势期间画板的惰性状态、指针结束和窗口监听。 */
export function useCanvasGestures({
  canvasRootRef,
  onHostGesturing,
  deferredContextClick,
  endBoardDrag,
}: CanvasGestureOptions) {
  const [isGestureActive, setIsGestureActive]: [boolean, (active: boolean) => void] =
    (0, React.useState)(false);
  const [isCanvasInert, setIsCanvasInert]: [boolean, (inert: boolean) => void] =
    (0, React.useState)(false);
  const isCanvasInertRef: Ref<boolean> = (0, React.useRef)(isCanvasInert);
  isCanvasInertRef.current = isCanvasInert;

  const activeGesturesRef: Ref<Set<GestureKind>> = (0, React.useRef)(new Set());
  const isMouseDownRef: Ref<boolean> = (0, React.useRef)(false);
  const onHostGesturingRef: Ref<CanvasGestureOptions["onHostGesturing"]> =
    (0, React.useRef)(onHostGesturing);
  onHostGesturingRef.current = onHostGesturing;

  const syncFramesInert = (): void => {
    const isGesturing = activeGesturesRef.current.size > 0 || isMouseDownRef.current;
    canvasRootRef.current?.toggleAttribute("data-mega-frames-inert", isGesturing);
    onHostGesturingRef.current?.(isGesturing);
  };
  const gestureStartRef: Ref<number | null> = (0, React.useRef)(null);
  const trackGesture: (gestureKind: GestureKind, isActive: boolean) => void = useLatestCallback(
    (gestureKind: GestureKind, isActive: boolean): void => {
      const current = activeGesturesRef.current;
      if (isActive && current.size === 0) gestureStartRef.current = performance.now();
      if (isActive) current.add(gestureKind);
      else current.delete(gestureKind);
      if (current.size === 0) gestureStartRef.current = null;
      setIsGestureActive(current.size > 0);
      syncFramesInert();
    },
  );
  const handleModifierKey: (
    event: unknown,
    modifierKey: unknown,
    isModifierHeld: boolean,
    isFromFrame: boolean,
  ) => void = (0, React.useCallback)(
    (_event: unknown, _modifierKey: unknown, isModifierHeld: boolean, isFromFrame: boolean): void => {
      if (activeGesturesRef.current.size > 0) return;
      if (isFromFrame && !isModifierHeld && document.hasFocus()) return;
      schedulePrimaryModifierHeld(isModifierHeld);
    },
    [],
  );
  const trackPointerGesture = (gestureKind: GestureKind, buttonMask = 0): void => {
    const handleGestureMove = (moveEvent: PointerEvent): void => {
      if (buttonMask === 2) deferredContextClick.move(moveEvent);
      if (moveEvent.pointerType !== "touch" && (moveEvent.buttons & buttonMask) === 0) {
        endGesture(moveEvent);
      }
    };
    if (buttonMask === 2) suppressNativeContextMenu(true);
    const endGesture = (endEvent: PointerEvent): void => {
      window.removeEventListener("pointerup", endGesture);
      window.removeEventListener("pointercancel", endGesture);
      if (buttonMask) window.removeEventListener("pointermove", handleGestureMove);
      if (buttonMask === 2) suppressNativeContextMenu(false);
      if (buttonMask === 2) deferredContextClick.end(endEvent.type !== "pointercancel");
      trackGesture(gestureKind, false);
      if (gestureKind === "pan") canvasRootRef.current?.removeAttribute("data-mega-grabbing");
      if (gestureKind === "frame-drag") endBoardDrag(endEvent.pointerId);
    };
    window.addEventListener("pointerup", endGesture);
    window.addEventListener("pointercancel", endGesture);
    if (buttonMask) window.addEventListener("pointermove", handleGestureMove);
  };

  (0, React.useEffect)((): (() => void) => {
    const setMouseDown = (isDown: boolean): void => {
      isMouseDownRef.current = isDown;
      syncFramesInert();
    };
    const releaseMouse = (): void => setMouseDown(false);
    const handleWindowPointerDown = (event: PointerEvent): void => {
      if (event.pointerType === "mouse" && event.button === 0) setMouseDown(true);
    };
    const handleWindowBlur = (): void => {
      if (!document.hasFocus()) releaseMouse();
    };
    window.addEventListener("pointerdown", handleWindowPointerDown, true);
    window.addEventListener("pointerup", releaseMouse, true);
    window.addEventListener("pointercancel", releaseMouse, true);
    window.addEventListener("contextmenu", releaseMouse, true);
    window.addEventListener("blur", handleWindowBlur);
    return (): void => {
      window.removeEventListener("pointerdown", handleWindowPointerDown, true);
      window.removeEventListener("pointerup", releaseMouse, true);
      window.removeEventListener("pointercancel", releaseMouse, true);
      window.removeEventListener("contextmenu", releaseMouse, true);
      window.removeEventListener("blur", handleWindowBlur);
    };
  }, []);

  return {
    isGestureActive, isCanvasInert, setIsCanvasInert, isCanvasInertRef,
    activeGesturesRef, gestureStartRef, trackGesture, handleModifierKey,
    trackPointerGesture,
  };
}
