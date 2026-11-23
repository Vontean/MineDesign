const textPlacementGuardMs = 500;

export function createTextPlacementInputGuard(isEditing: () => boolean) {
  let suppressUntil = 0;
  let stalePress = false;

  function beginFreshPress(event: PointerEvent) {
    if (event.isTrusted && event.button === 0 && !(event.timeStamp < suppressUntil)) {
      stalePress = false;
    }
  }

  function suppressEditClick(event: MouseEvent) {
    if (!event.isTrusted || event.button !== 0) return false;
    const tooEarly = event.timeStamp < suppressUntil;
    if (event.type === "mousedown") stalePress = tooEarly;
    if (!tooEarly && !(stalePress && event.detail > 0)) return false;
    event.preventDefault();
    event.stopPropagation();
    return true;
  }

  function onPreviewMouseDown(event: MouseEvent) {
    if (isEditing() || !event.isTrusted || event.button !== 0) return;
    stalePress = event.timeStamp < suppressUntil;
    if (stalePress) event.preventDefault();
  }

  return {
    holdFrom(timestamp: number) { suppressUntil = timestamp + textPlacementGuardMs; },
    blocksPreviewDoubleClick: (event: MouseEvent) => event.timeStamp < suppressUntil || stalePress,
    beginFreshPress,
    suppressEditClick,
    install() {
      document.addEventListener("pointercancel", () => { stalePress = false; }, true);
      document.addEventListener("mousedown", onPreviewMouseDown, true);
    },
  };
}
