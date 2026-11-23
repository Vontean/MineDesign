interface PointerLocation {
  x: number;
  y: number;
}

type Bounds = Pick<DOMRectReadOnly, "left" | "top" | "right" | "bottom">;

interface DropPlaceholder {
  element: HTMLDivElement;
  container: Element;
  index: number;
  pointer: PointerLocation;
  bounds: Bounds;
  observer: MutationObserver;
  expiration?: ReturnType<typeof setTimeout>;
}

interface HostDrag {
  key: string;
  plan: Record<string, unknown> | null;
  watchdog: ReturnType<typeof setTimeout> | null;
  placeholder: DropPlaceholder | null;
}

interface HostDragOptions {
  stroke: string;
  finishSource(key: string, commit: boolean): boolean;
  clearIndicators(): void;
  clearPreview(): void;
  clearPress(): void;
}

const animationEvents = ["animationstart", "animationiteration", "animationend", "animationcancel"];
const pointerEvents = ["mousedown", "pointerdown"];
const suppressedDuringHostDrag: Record<string, number> = {
  stylePreview: 1,
  movePreview: 1,
  movePreviewCancel: 1,
  styleRevert: 1,
  dragState: 1,
  dragExit: 1,
  dragMove: 1,
  dragReturn: 1,
  dragCancel: 1,
  dragDrop: 1,
  selection: 1,
  pointerPresence: 1,
  pointerAt: 1,
  repeatRefused: 1,
};

function containsPoint(rect: Bounds, x: number, y: number) {
  return x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom;
}

/** Owns the iframe side of a host-coordinated drag, including the landing preview. */
export function createHostDragSession(options: HostDragOptions) {
  let session: HostDrag | null = null;

  function start(key: string) {
    session = { key, plan: null, watchdog: null, placeholder: null };
    document.body.setAttribute("data-dc-editor-move", "");
    for (const type of pointerEvents) window.addEventListener(type, cancelFromPointer, true);
    for (const type of animationEvents) window.addEventListener(type, suppressAnimation, true);
  }

  function refresh() {
    if (!session) return;
    if (session.watchdog) clearTimeout(session.watchdog);
    session.watchdog = setTimeout(() => finish(false), 60_000);
  }

  function cancelFromPointer(event: Event) {
    if (session && event.isTrusted) finish(false);
  }

  function suppressAnimation(event: Event) {
    if (session) event.stopImmediatePropagation();
  }

  function finish(commit: boolean) {
    if (!session) return null;
    const ended = session;
    if (ended.watchdog) clearTimeout(ended.watchdog);
    removePlaceholder();
    try {
      if (!options.finishSource(ended.key, commit)) options.clearIndicators();
      if (!commit || !ended.plan) options.clearPreview();
    } finally {
      session = null;
      document.body.removeAttribute("data-dc-editor-move");
      for (const type of pointerEvents) window.removeEventListener(type, cancelFromPointer, true);
      for (const type of animationEvents) window.removeEventListener(type, suppressAnimation, true);
      options.clearPress();
    }
    return ended.plan || null;
  }

  function intercept(event: Record<string, unknown>) {
    if (!session) return false;
    if (event.type === "move") {
      session.plan = event;
      return true;
    }
    return Boolean(suppressedDuringHostDrag[event.type as string]);
  }

  function placePlaceholder(
    container: Element,
    index: number,
    children: readonly Element[],
    width: number,
    height: number,
    pointer: PointerLocation,
    bounds: Bounds,
  ) {
    if (!session) return;
    let element = session.placeholder?.element;
    if (!element?.isConnected) {
      element = document.createElement("div");
      element.setAttribute("data-dc-editor-overlay", "");
      element.setAttribute("data-dc-editor-drop-placeholder", "");
      element.setAttribute("inert", "");
      element.style.cssText =
        "box-sizing:border-box;flex:0 0 auto;margin:0;border-radius:3px;border:calc(1.5*var(--dc-chrome-unit,1px)) dashed color-mix(in srgb," +
        options.stroke + " 85%,transparent);background:color-mix(in srgb," +
        options.stroke + " 8%,transparent);";
      element.style.setProperty("pointer-events", "none", "important");
    }
    element.style.width = Math.max(1, Math.round(width)) + "px";
    element.style.height = Math.max(1, Math.round(height)) + "px";
    const next = index < children.length ? children[index] : null;
    const last = children.length ? children[children.length - 1] : null;
    const inPosition = element.parentNode === container &&
      (next ? element.nextSibling === next : last ? element.previousSibling === last : container.lastChild === element);
    if (!inPosition) {
      if (next) container.insertBefore(element, next);
      else if (last) last.insertAdjacentElement("afterend", element);
      else container.appendChild(element);
    }

    let observer = session.placeholder?.container === container ? session.placeholder.observer : null;
    if (!observer) {
      session.placeholder?.observer.disconnect();
      observer = new MutationObserver((records) => {
        for (const record of records) {
          for (const node of record.addedNodes) {
            if (node.nodeType === 1 && !(node as Element).hasAttribute("data-dc-editor-overlay")) {
              removePlaceholder();
              return;
            }
          }
        }
      });
      observer.observe(container, { childList: true });
    }
    session.placeholder = { element, container, index, pointer, bounds, observer };
  }

  function removePlaceholder() {
    const placeholder = session?.placeholder;
    if (!session || !placeholder) return;
    if (placeholder.expiration) clearTimeout(placeholder.expiration);
    placeholder.observer.disconnect();
    placeholder.element.parentNode?.removeChild(placeholder.element);
    session.placeholder = null;
  }

  function expirePlaceholder() {
    const placeholder = session?.placeholder;
    if (placeholder && !placeholder.expiration) {
      placeholder.expiration = setTimeout(removePlaceholder, 150);
    }
  }

  function readAnchor(x: number, y: number) {
    const placeholder = session?.placeholder;
    if (!placeholder) return null;
    const { element, container, pointer, bounds, index } = placeholder;
    const sticky = element.isConnected && container.isConnected &&
      !containsPoint(container.getBoundingClientRect(), x, y) &&
      (containsPoint(bounds, x, y) || (Math.abs(x - pointer.x) <= 32 && Math.abs(y - pointer.y) <= 32));
    return { container, pointer, bounds, index, sticky };
  }

  return {
    start,
    refresh,
    finish,
    intercept,
    matches(key: unknown) { return session !== null && session.key === key; },
    get active() { return session !== null; },
    get key() { return session?.key ?? null; },
    dropPreview: {
      place: placePlaceholder,
      remove: removePlaceholder,
      expire: expirePlaceholder,
      readAnchor,
      get index() { return session?.placeholder?.index ?? null; },
      get expiring() { return Boolean(session?.placeholder?.expiration); },
    },
  };
}
