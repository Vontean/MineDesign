type StyledElement = HTMLElement | SVGElement;
type StylePatch = Record<string, unknown>;
interface MoveFollower {
  tid: number;
  el?: Element | null;
  lastPatch?: StylePatch;
}

interface PreviewGesture {
  el: StyledElement | null;
  tid: number;
  name: string | null;
  gestureKey: string;
  epoch: number;
  group?: { tid: number }[] | null;
  followers?: MoveFollower[] | null;
  brkFollowers?: MoveFollower[] | null;
  parked?: boolean;
  flowBox?: Element | null;
  lastPatch?: StylePatch;
  previewKey?: string;
  previewBox?: Element | null;
  previewActive?: boolean;
  freezeStyle?: StylePatch;
  alt?: boolean;
  mode?: string;
  altClone?: StyledElement | null;
  origParent?: Element | null;
  origNext?: Node | null;
  origStyle: string;
}

interface DragPreviewOptions {
  activeGesture(): PreviewGesture | null;
  findInstances(id: string, name: string | null): Element[];
  isFlowVisible(): boolean;
  paintFlow(container: Element, source: Element, plan: null, group: Element[] | null): void;
  clearPendingStyles(): void;
  patch(key: string, elements: Element[], styles: StylePatch): void;
  emit(event: object): void;
}

export function createSourceDragPreview(options: DragPreviewOptions) {
  function dragged() {
    const gesture = options.activeGesture()!;
    const stamped = document.querySelector<StyledElement>("[data-dc-dragging]");
    gesture.epoch = (stamped && parseInt(stamped.getAttribute("data-dc-dragging")!, 10)) || 0;
    if (stamped) {
      gesture.el = stamped;
    } else {
      const replacement = options.findInstances(String(gesture.tid), gesture.name)[0] as StyledElement | undefined;
      if (replacement) gesture.el = replacement;
      else if (!gesture.el?.isConnected) gesture.el = null;
    }
    return gesture.el;
  }

  function group() {
    const gesture = options.activeGesture();
    if (!gesture?.group) return null;
    const stamped = new Map<string | null, Element>();
    if (gesture.epoch > 0) {
      for (const element of document.querySelectorAll("[data-dc-drag-block]")) {
        stamped.set(element.getAttribute("data-dc-drag-block"), element);
      }
    }
    const elements: Element[] = [];
    for (const { tid } of gesture.group) {
      const id = String(tid);
      const element = gesture.epoch > 0 ? stamped.get(id) : options.findInstances(id, gesture.name)[0];
      if (element) elements.push(element);
    }
    return elements;
  }

  function breakoutFollowers(gesture: PreviewGesture) {
    const byId: Record<string, Element> = {};
    for (const element of document.querySelectorAll("[data-dc-drag-follower]")) {
      byId[element.getAttribute("data-dc-drag-follower")!] = element;
    }
    if (gesture.epoch === 0) {
      for (const { tid } of gesture.brkFollowers!) {
        if (byId[tid]) continue;
        const matches = options.findInstances(String(tid), gesture.name);
        if (matches.length === 1) byId[tid] = matches[0];
      }
    }
    return byId;
  }

  function followerInstances(follower: MoveFollower, name: string | null) {
    return follower.el?.isConnected ? [follower.el] : options.findInstances(String(follower.tid), name);
  }

  function reapplyStyles() {
    const gesture = options.activeGesture();
    if (!gesture) return;
    if (gesture.lastPatch) {
      const element = dragged();
      if (element) options.patch(gesture.gestureKey, [element], gesture.lastPatch);
    }
    for (const follower of gesture.followers ?? []) {
      if (follower.lastPatch) {
        options.patch(gesture.gestureKey + ":" + follower.tid, followerInstances(follower, gesture.name), follower.lastPatch);
      }
    }
  }

  function refreshParked() {
    const gesture = options.activeGesture();
    if (!gesture?.parked) return;
    const element = dragged();
    const peers = group();
    if (element) markDraggedElements(element, peers);
    if (gesture.flowBox?.isConnected && options.isFlowVisible() && element?.parentElement === gesture.flowBox) {
      options.paintFlow(gesture.flowBox, element, null, peers);
    }
  }

  function emitFlow(plan: { n: number; epoch: number; targetTid?: number | null; position: string }, clearPositioning: boolean) {
    const gesture = options.activeGesture()!;
    const key = `flow|${plan.n}|${plan.epoch}`;
    if (gesture.previewKey === key && gesture.previewBox === gesture.flowBox) return;
    gesture.previewKey = key;
    gesture.previewBox = gesture.flowBox;
    gesture.previewActive = true;
    options.clearPendingStyles();
    options.emit({
      type: "movePreview",
      tid: gesture.tid,
      name: gesture.name,
      gestureKey: gesture.gestureKey,
      targetTid: plan.targetTid,
      position: plan.position,
      clearPositioning,
      epoch: plan.epoch,
      freezeStyle: gesture.freezeStyle || undefined,
      group: gesture.group || undefined,
      markFollowers: gesture.brkFollowers?.map(({ tid }) => tid),
    });
  }

  function cancel(gesture: PreviewGesture | null) {
    if (!gesture?.previewActive) return;
    gesture.previewActive = false;
    gesture.previewKey = "";
    options.clearPendingStyles();
    options.emit({ type: "movePreviewCancel", tid: gesture.tid, name: gesture.name, gestureKey: gesture.gestureKey });
  }

  function syncCopy() {
    const gesture = options.activeGesture();
    if (!gesture) return;
    if (gesture.alt && gesture.mode === "abs" && !gesture.altClone && gesture.origParent) {
      const clone = gesture.el!.cloneNode(true) as StyledElement;
      clone.removeAttribute("data-dc-editor-selected");
      clone.removeAttribute("data-dc-editor-dragging");
      clone.removeAttribute("data-dc-dragging");
      clone.setAttribute("data-dc-editor-overlay", "");
      clone.setAttribute("style", gesture.origStyle);
      clone.removeAttribute("data-dc-tpl");
      for (const child of clone.querySelectorAll("[data-dc-tpl]")) child.removeAttribute("data-dc-tpl");
      clone.style.setProperty("pointer-events", "none", "important");
      const anchor = gesture.origNext?.parentNode === gesture.origParent ? gesture.origNext : null;
      gesture.origParent.insertBefore(clone, anchor);
      gesture.altClone = clone;
    } else if (!gesture.alt && gesture.altClone) {
      gesture.altClone.remove();
      gesture.altClone = null;
    }
  }

  return { dragged, group, breakoutFollowers, followerInstances, reapplyStyles, refreshParked, emitFlow, cancel, syncCopy };
}

const dragging = "data-dc-editor-dragging";

export function markDraggedElements(element: Element, group?: Element[] | null) {
  const current = new Set([element, ...(group ?? [])] as StyledElement[]);
  for (const previous of document.querySelectorAll<StyledElement>(`[${dragging}]`)) {
    if (!current.has(previous) && !previous.hasAttribute("data-dc-editor-overlay")) {
      previous.removeAttribute(dragging);
      previous.style.removeProperty("pointer-events");
    }
  }
  for (const member of current) {
    if (!member.hasAttribute(dragging)) member.setAttribute(dragging, "");
    if (member.style.getPropertyValue("pointer-events") !== "none" ||
        member.style.getPropertyPriority("pointer-events") !== "important") {
      member.style.setProperty("pointer-events", "none", "important");
    }
  }
}
