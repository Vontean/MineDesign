import { isDeckManagedElement } from "./deck-target";
import { isUneditableElement } from "./drop-container";
import { componentScopeName, outerSvgElement, unwrapDisplayContentsHost } from "./element-query";
import type { createHostDragSession } from "./host-drag-session";

interface Modifiers {
  alt?: boolean;
  ctrl?: boolean;
  meta?: boolean;
  shift?: boolean;
}

interface SourceDrag {
  el: Element;
  tid: number;
  hostKey?: string;
  gestureKey: string;
  hostParked?: boolean;
  exited?: boolean;
  droppedOut?: boolean;
  startRect: DOMRectReadOnly;
  mode: string;
  followers?: { tid: number }[];
  group?: { tid: number }[];
  brkFollowers?: { tid: number }[];
}

interface HostDragCommandsOptions {
  transfer: ReturnType<typeof createHostDragSession>;
  activeDrag(): SourceDrag | null;
  canStart(): boolean;
  rootName(): string | null;
  findInstances(id: string, name: string): Element[];
  declaredDragParent(hit: Element, element: Element): Element;
  elementTag(element: Element): string;
  armSource(element: Element, x: number, y: number): void;
  beginSource(event: ReturnType<typeof syntheticMove>): boolean;
  updateSource(event: ReturnType<typeof syntheticMove>): void;
  finishSource(commit: boolean): void;
  exitSource(copy: boolean): void;
  parkSource(gesture: SourceDrag): void;
  unparkSource(gesture: SourceDrag): void;
  clearDropIndicators(): void;
  settlePreview(): void;
}

const hostKeyPattern = /^[0-9a-f]{16}$/;

function box(rect: DOMRectReadOnly) {
  return { x: rect.left, y: rect.top, w: rect.width, h: rect.height };
}

function syntheticMove(x: unknown, y: unknown, modifiers?: Modifiers | null) {
  return {
    type: "mousemove",
    clientX: Number(x) || 0,
    clientY: Number(y) || 0,
    buttons: 1,
    button: 0,
    altKey: !!modifiers?.alt,
    ctrlKey: !!modifiers?.ctrl,
    metaKey: !!modifiers?.meta,
    shiftKey: !!modifiers?.shift,
    target: null,
    isTrusted: false,
    pointerType: "mouse",
    preventDefault() {},
    stopPropagation() {},
    stopImmediatePropagation() {},
  };
}

export function createHostDragCommands(options: HostDragCommandsOptions) {
  const transfer = options.transfer;

  function stopPrevious() {
    if (transfer.active) transfer.finish(false);
    if (options.activeDrag()) options.finishSource(false);
  }

  function moveStart(key: unknown, template: string | number, x?: unknown, y?: unknown, modifiers?: Modifiers | null) {
    if (!hostKeyPattern.test(String(key)) || !options.canStart()) return null;
    stopPrevious();
    const id = parseInt(String(template), 10);
    if (!Number.isFinite(id) || id < 0) return null;
    const root = options.rootName();
    if (!root) return null;
    const matches = options.findInstances(String(id), root);
    if (matches.length !== 1) return null;
    const element = options.declaredDragParent(matches[0], outerSvgElement(matches[0]));
    if (componentScopeName(element) !== root || isUneditableElement(element) || isDeckManagedElement(element)) return null;
    const bounds = unwrapDisplayContentsHost(element).getBoundingClientRect();
    const left = x == null ? bounds.left + bounds.width / 2 : Number(x);
    const top = y == null ? bounds.top + bounds.height / 2 : Number(y);
    if (!Number.isFinite(left) || !Number.isFinite(top)) return null;
    transfer.start(String(key));
    transfer.refresh();
    options.armSource(element, left, top);
    let started = false;
    try { started = options.beginSource(syntheticMove(left, top, modifiers)); } catch {}
    const gesture = options.activeDrag();
    if (!started || !gesture || gesture.hostKey !== transfer.key) {
      transfer.finish(false);
      return null;
    }
    const ids = new Set<number>([gesture.tid]);
    for (const list of [gesture.followers, gesture.group, modifiers?.ctrl ? gesture.brkFollowers : null]) {
      for (const { tid } of list ?? []) {
        if (isFinite(tid)) ids.add(tid);
      }
    }
    const members = [];
    for (const tid of ids) {
      const instances = options.findInstances(String(tid), root);
      if (instances.length !== 1) continue;
      const member = instances[0];
      members.push({ tid, tag: options.elementTag(member), rect: box(unwrapDisplayContentsHost(member).getBoundingClientRect()) });
    }
    return { tids: [...ids], tag: options.elementTag(gesture.el), rect: box(gesture.startRect), mode: gesture.mode, members };
  }

  function moveMove(key: unknown, x?: unknown, y?: unknown, modifiers?: Modifiers | null) {
    const gesture = options.activeDrag();
    if (!transfer.matches(key) || !gesture || !Number.isFinite(Number(x)) || !Number.isFinite(Number(y)) ||
        x == null || y == null) return;
    transfer.refresh();
    if (!gesture.hostParked) options.updateSource(syntheticMove(x, y, modifiers));
  }

  function moveEnd(key: unknown, x?: unknown, y?: unknown, modifiers?: Modifiers | null) {
    if (!transfer.matches(key)) return null;
    const gesture = options.activeDrag();
    if (gesture?.hostParked) {
      transfer.finish(false);
      return { plan: null, tids: [] };
    }
    if (gesture) options.updateSource(syntheticMove(x, y, modifiers));
    const latest = options.activeDrag();
    const tids = latest ? [latest.tid] : [];
    const plan = transfer.finish(true);
    if (plan) {
      delete plan.type;
      delete plan.name;
      delete plan.gestureKey;
      delete plan.epoch;
    }
    return { plan, tids };
  }

  function moveHost(key: unknown, command?: unknown) {
    if (!hostKeyPattern.test(String(key))) return false;
    if (command === "close") {
      if (transfer.matches(key) && !options.activeDrag()) transfer.finish(false);
      return true;
    }
    if (command !== "open" || !options.canStart()) return false;
    if (!transfer.matches(key)) {
      stopPrevious();
      transfer.start(String(key));
    }
    transfer.refresh();
    return true;
  }

  function moveExit(key: unknown) {
    const gesture = options.activeDrag();
    if (!transfer.matches(key) || !gesture || gesture.hostKey !== key) return;
    transfer.refresh();
    options.parkSource(gesture);
  }

  function moveReturn(key: unknown) {
    const gesture = options.activeDrag();
    if (!transfer.matches(key) || !gesture || gesture.hostKey !== key) return;
    transfer.refresh();
    options.unparkSource(gesture);
  }

  return {
    moveStart, moveMove, moveEnd, moveHost, moveExit, moveReturn,
    moveCancel(key: unknown) {
      if (transfer.matches(key)) transfer.finish(false);
    },
    moveTouch(key: unknown) {
      if (transfer.matches(key)) transfer.refresh();
    },
    dropPlanClear(key: unknown, retainPlaceholder?: boolean) {
      if (!transfer.matches(key)) return;
      if (retainPlaceholder) transfer.dropPreview.expire();
      else transfer.dropPreview.remove();
      if (!options.activeDrag()) options.clearDropIndicators();
    },
    moveSettle() {
      if (!transfer.dropPreview.expiring) transfer.dropPreview.remove();
      if (!options.activeDrag()) options.settlePreview();
    },
    exitDrag(key: unknown, copy?: boolean) {
      const gesture = options.activeDrag();
      if (gesture && gesture.gestureKey === key) options.exitSource(!!copy);
    },
    finishExitedDrag(key: unknown) {
      const gesture = options.activeDrag();
      if (!gesture || gesture.gestureKey !== key || !gesture.exited) return;
      gesture.droppedOut = true;
      options.finishSource(false);
    },
    abortDrag(key: unknown) {
      const gesture = options.activeDrag();
      if (gesture && gesture.gestureKey === key) options.finishSource(false);
    },
  };
}
