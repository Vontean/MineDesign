type PointerReport =
  | { type: "pointerPresence"; inside: boolean }
  | { type: "pointerAt"; x: number; y: number };

export function createPointerPresence(options: {
  hostIsDragging(): boolean;
  beforePointerLeaves(): void;
  afterPointerLeaves(): void;
  emit(event: PointerReport): void;
}) {
  let inside = false;
  let timer: ReturnType<typeof setTimeout> | undefined;
  let lastSentAt = 0;
  let pending: { type: "pointerAt"; x: number; y: number } | null = null;
  const passiveCapture = { capture: true, passive: true };

  function noteInside() {
    if (inside) return;
    inside = true;
    options.emit({ type: "pointerPresence", inside: true });
  }

  function flush() {
    timer = undefined;
    if (!pending) return;
    lastSentAt = performance.now();
    options.emit(pending);
    pending = null;
  }

  function onMove(event: PointerEvent) {
    if (!event.isTrusted || options.hostIsDragging() || event.pointerType === "touch") return;
    pending = { type: "pointerAt", x: event.clientX, y: event.clientY };
    if (timer !== undefined) return;
    const delay = 80 - (performance.now() - lastSentAt);
    if (delay <= 0) flush();
    else timer = setTimeout(flush, delay);
  }

  function onMouseOver(event: MouseEvent) {
    if (!event.relatedTarget) noteInside();
  }

  function onMouseOut(event: MouseEvent) {
    if (event.relatedTarget) return;
    inside = false;
    options.beforePointerLeaves();
    options.emit({ type: "pointerPresence", inside: false });
    options.afterPointerLeaves();
  }

  function install() {
    document.addEventListener("pointermove", onMove, passiveCapture);
    document.addEventListener("pointerover", (event) => {
      if (!event.relatedTarget) onMove(event);
    }, passiveCapture);
    document.addEventListener("pointerout", (event) => {
      if (event.relatedTarget) return;
      clearTimeout(timer);
      timer = undefined;
      pending = null;
    }, passiveCapture);
  }

  return { get inside() { return inside; }, noteInside, onMouseOver, onMouseOut, install };
}
