interface SelectionSnapshot {
  tids: number[];
  name: string | null;
}

interface MarqueeOptions {
  rootName(): string | null;
  selection(): SelectionSnapshot;
  foreignSelection(): Element | null;
  takeGestureKey(): string;
  overlayRoot(): HTMLElement;
  chromePixels(size: number): number;
  stroke: string;
  candidates(container: Element | null, name: string, mode: string): Element[];
  findInstances(id: string, name: string): Element[];
  unwrap(element: Element): Element;
  isRendered(element: Element): boolean;
  removeAncestors(elements: Element[]): Element[];
  clearHover(): void;
  clearForeignSelection(): void;
  restoreForeignSelection(element: Element): void;
  replaceSelection(selection: SelectionSnapshot): void;
  notifySelection(toggle: boolean, reason?: string): void;
  emit(event: object): void;
  refreshChrome(): void;
}

interface ArmedMarquee {
  x: number;
  y: number;
  container: Element | null;
  rootName: string;
  mode: string;
  toggle: boolean;
  gestureKey: string;
  baseIds: number[];
  previous: SelectionSnapshot;
  previousForeign: Element | null;
}

interface LiveMarquee extends ArmedMarquee {
  box: HTMLDivElement;
  containerId: number | null;
  candidates: Element[];
  lastKey: string | null;
  recompiled: boolean;
}

interface MarqueePointer extends MouseEvent {
  sourceCapabilities?: { firesTouchEvents?: boolean } | null;
}

export function createMarqueeSelection(options: MarqueeOptions) {
  let armed: ArmedMarquee | null = null;
  let live: LiveMarquee | null = null;

  function arm(
    event: MarqueePointer,
    container: Element | null,
    mode: string,
    toggle: boolean,
    previousSelection?: SelectionSnapshot,
  ) {
    if (event.sourceCapabilities?.firesTouchEvents) return;
    const rootName = options.rootName();
    if (!rootName) return;
    const selection = previousSelection || options.selection();
    armed = {
      x: event.clientX,
      y: event.clientY,
      container,
      rootName,
      mode,
      toggle: Boolean(toggle),
      gestureKey: options.takeGestureKey(),
      baseIds: toggle && selection.name === rootName ? selection.tids.slice() : [],
      previous: { tids: selection.tids.slice(), name: selection.name },
      previousForeign: options.foreignSelection(),
    };
  }

  function begin(next: ArmedMarquee, event: MouseEvent) {
    armed = null;
    const box = document.createElement("div");
    box.setAttribute("data-dc-editor-overlay", "");
    box.setAttribute("data-dc-editor-marquee", "");
    box.style.cssText =
      "position:fixed;z-index:2147483646;pointer-events:none;border:" +
      options.chromePixels(1) + "px solid " + options.stroke +
      ";background:color-mix(in srgb," + options.stroke + " 10%,transparent);";
    options.overlayRoot().appendChild(box);
    const tid = next.container ? parseInt(next.container.getAttribute("data-dc-tpl") ?? "", 10) : null;
    live = {
      ...next,
      box,
      containerId: Number.isNaN(tid) ? null : tid,
      candidates: options.candidates(next.container, next.rootName, next.mode),
      lastKey: null,
      recompiled: false,
    };
    options.clearHover();
    options.clearForeignSelection();
    options.emit({ type: "boxLive", gestureKey: next.gestureKey });
    update(live, event);
  }

  function update(gesture: LiveMarquee, event: MouseEvent) {
    const left = Math.min(gesture.x, event.clientX);
    const top = Math.min(gesture.y, event.clientY);
    const width = Math.abs(event.clientX - gesture.x);
    const height = Math.abs(event.clientY - gesture.y);
    const right = left + width;
    const bottom = top + height;
    gesture.box.style.left = left + "px";
    gesture.box.style.top = top + "px";
    gesture.box.style.width = width + "px";
    gesture.box.style.height = height + "px";

    const selectionIds = gesture.baseIds.slice();
    const stale = (gesture.candidates.length === 0 && gesture.lastKey != null) ||
      gesture.candidates.some((candidate) => !candidate.isConnected);
    if (stale) {
      const container = gesture.containerId == null
        ? null
        : options.findInstances(String(gesture.containerId), gesture.rootName)[0];
      gesture.candidates = gesture.containerId == null || container
        ? options.candidates(container, gesture.rootName, gesture.mode)
        : [];
      gesture.recompiled = gesture.candidates.length > 0;
    }

    const deep = gesture.mode === "deep";
    let hits = [];
    for (const candidate of gesture.candidates) {
      const rendered = options.unwrap(candidate);
      const bounds = rendered.getBoundingClientRect();
      if (bounds.width === 0 && bounds.height === 0) continue;
      const hit = deep
        ? left <= bounds.left && bounds.right <= right && top <= bounds.top && bounds.bottom <= bottom
        : left <= bounds.right && bounds.left <= right && top <= bounds.bottom && bounds.top <= bottom;
      if (hit && options.isRendered(rendered)) hits.push(candidate);
    }
    if (deep) hits = options.removeAncestors(hits);
    for (const element of hits) {
      const tid = parseInt(element.getAttribute("data-dc-tpl") ?? "", 10);
      const index = selectionIds.indexOf(tid);
      if (gesture.toggle && index >= 0) selectionIds.splice(index, 1);
      else if (index < 0) selectionIds.push(tid);
    }

    const key = selectionIds.join(",");
    if (key === gesture.lastKey && !gesture.recompiled) return;
    gesture.lastKey = key;
    gesture.recompiled = false;
    options.replaceSelection({ tids: selectionIds, name: selectionIds.length ? gesture.rootName : null });
    options.notifySelection(gesture.toggle);
  }

  function finish(cancel = false) {
    if (!live) return;
    const gesture = live;
    live = null;
    gesture.box.remove();
    options.emit({ type: cancel ? "boxCancel" : "boxEnd", gestureKey: gesture.gestureKey });
    if (!cancel && gesture.lastKey != null) options.notifySelection(gesture.toggle);
    if (cancel) {
      options.replaceSelection({ tids: gesture.previous.tids.slice(), name: gesture.previous.name });
      const reason = "boxcancel:" + gesture.gestureKey;
      const foreign = gesture.previousForeign;
      if (foreign?.isConnected) {
        const html = foreign.outerHTML;
        options.restoreForeignSelection(foreign);
        foreign.setAttribute("data-dc-editor-selected", "");
        options.emit({
          type: "select",
          tids: null,
          foreign: { tag: foreign.tagName.toLowerCase(), html, text: "" },
          re: reason,
        });
      } else {
        options.notifySelection(gesture.toggle, reason);
      }
    }
    options.refreshChrome();
  }

  return {
    arm,
    move(event: MouseEvent) {
      if (live) {
        update(live, event);
        return true;
      }
      if (!armed) return false;
      const dx = event.clientX - armed.x;
      const dy = event.clientY - armed.y;
      const threshold = options.chromePixels(4);
      if (dx * dx + dy * dy > threshold * threshold) begin(armed, event);
      return true;
    },
    finish,
    cancelPending() { armed = null; },
    matchesGesture(key: unknown) { return live !== null && live.gestureKey === key; },
    get active() { return live !== null; },
    get pending() { return armed !== null; },
  };
}
