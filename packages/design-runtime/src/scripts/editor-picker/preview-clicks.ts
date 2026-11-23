import { eventMatchesSelector } from "./wheel-targets";

const nativeControls =
  'a[href], area[href], button, input, select, textarea, summary, label, video[controls], audio[controls], [role="button"], [onclick], [ondblclick], [contenteditable]:not([contenteditable="false" i]), image-slot';

export function togglePreviewVideo(event: MouseEvent) {
  const video = event.target as HTMLVideoElement | null;
  if (!event.isTrusted || video?.tagName !== "VIDEO" || video.controls ||
      event.detail > 1 || eventMatchesSelector(event, nativeControls)) return;
  const wasPaused = video.paused;
  setTimeout(() => {
    if (!video.isConnected || video.paused !== wasPaused) return;
    if (wasPaused) video.play()?.catch(() => {});
    else video.pause();
  }, 0);
}

interface PreviewClickOptions {
  isEditing(): boolean;
  isReadOnly(): boolean;
  isPlaying(): boolean;
  blocksDoubleClick(event: MouseEvent): boolean;
  stampedTarget(event: MouseEvent): Element | null;
  normalizeTarget(element: Element): Element;
  selectForEditing(element: Element): void;
  textMapReady(): boolean;
  beginTextEdit(element: Element): void;
  click(event: { type: "previewClick"; shift: boolean; meta: boolean }): void;
}

export function createPreviewClicks(options: PreviewClickOptions) {
  let pendingTarget: Element | null = null;
  let revision = 0;

  function onClick(event: MouseEvent) {
    if (!event.isTrusted || options.isEditing() || eventMatchesSelector(event, nativeControls)) return;
    if (options.isPlaying()) togglePreviewVideo(event);
    options.click({ type: "previewClick", shift: event.shiftKey, meta: event.metaKey || event.ctrlKey });
  }

  function onDoubleClick(event: MouseEvent) {
    if (!event.isTrusted || options.isEditing() || options.isReadOnly() ||
        options.blocksDoubleClick(event) || eventMatchesSelector(event, nativeControls)) return;
    const target = options.stampedTarget(event);
    if (!target) return;
    pendingTarget = target;
    const capturedRevision = ++revision;
    setTimeout(() => {
      if (revision === capturedRevision) pendingTarget = null;
    }, 2000);
  }

  function replay() {
    if (options.isReadOnly()) pendingTarget = null;
    if (!pendingTarget || !options.isEditing()) return;
    if (!pendingTarget.isConnected || !pendingTarget.hasAttribute("data-dc-tpl")) {
      pendingTarget = null;
      return;
    }
    const element = options.normalizeTarget(pendingTarget);
    options.selectForEditing(element);
    if (options.textMapReady()) {
      pendingTarget = null;
      options.beginTextEdit(element);
    }
  }

  return { onClick, onDoubleClick, replay, cancel: () => { pendingTarget = null; } };
}

export function createForwardedDoubleClick() {
  let armed: { x: number; y: number; time: number } | null = null;
  return {
    arm(x: unknown, y: unknown) {
      const clientX = Number(x), clientY = Number(y);
      if (Number.isFinite(clientX) && Number.isFinite(clientY)) {
        armed = { x: clientX, y: clientY, time: Date.now() };
      }
    },
    take(event: MouseEvent, maxDistance: number) {
      const previous = armed;
      armed = null;
      return previous !== null && Date.now() - previous.time < 500 &&
        Math.hypot(event.clientX - previous.x, event.clientY - previous.y) <= maxDistance;
    },
    cancel() { armed = null; },
  };
}
