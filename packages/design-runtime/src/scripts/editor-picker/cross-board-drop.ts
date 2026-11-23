import type { createHostDragSession } from "./host-drag-session";

interface DropMember {
  tid: unknown;
  tag: string;
  w: number;
  h: number;
  dx: number;
  dy: number;
}

type DropTarget =
  | { el: Element; tid: number | null; invalid?: false }
  | { el: null; tid: null; invalid: true };

interface Insertion {
  n: number;
  targetTid: number | null;
  position: "before" | "after" | "into" | "root-end";
}

interface DropCandidate {
  tag: string;
  origAncestorEls: Element[];
  startRect: Pick<DOMRectReadOnly, "left" | "top" | "width" | "height" | "right" | "bottom">;
  peerParent: null;
  brk: boolean;
  followers: null;
  group: null;
  mode: "abs" | "flow";
  hostKey: unknown;
}

interface CrossBoardDropOptions {
  transfer: Pick<ReturnType<typeof createHostDragSession>, "matches" | "refresh" | "dropPreview">;
  textEditing(): boolean;
  rootName(): string | null;
  excludedElements(key: unknown, root: string): Element[];
  identify(element: Element): number;
  resolve(x: number, y: number, candidate: DropCandidate, excluded: Element[]): DropTarget | null;
  containerLocked(element: Element): boolean;
  canNest(parentTag: string, childTag: string): boolean;
  insertion(container: Element, templateId: number, x: number, y: number, previous: { n: number } | null, excluded: Element[]): Insertion;
  children(container: Element, excluded: Element[]): Element[];
  paintInsertion(container: Element, insertion: Insertion, excluded: Element[], placeholderIndex: number | null): void;
  clearInsertion(): void;
  showContainer(bounds: DOMRectReadOnly, label: string): void;
  clearContainer(): void;
}

function readMembers(value: unknown): DropMember[] | null {
  if (!Array.isArray(value) || value.length === 0 || value.length > 500) return null;
  const members: DropMember[] = [];
  for (const item of value) {
    if (!item || typeof item.tag !== "string") return null;
    const w = Number(item.w);
    const h = Number(item.h);
    const dx = Number(item.dx);
    const dy = Number(item.dy);
    if (!Number.isFinite(w) || !Number.isFinite(h) || !Number.isFinite(dx) || !Number.isFinite(dy)) return null;
    members.push({ tid: item.tid, tag: item.tag.toUpperCase(), w, h, dx, dy });
  }
  return members;
}

/** Plans the receiving board's drop and keeps its visual guide in sync with the plan. */
export function createCrossBoardDropPlanner(options: CrossBoardDropOptions) {
  const preview = options.transfer.dropPreview;

  function clearPlan() {
    preview.remove();
    options.clearInsertion();
    options.clearContainer();
    return { container: null, members: [] };
  }

  return function planDrop(key: unknown, rawX: unknown, rawY: unknown, rawMembers: unknown, mode: unknown) {
    if (!options.transfer.matches(key) || options.textEditing()) return null;
    options.transfer.refresh();
    const x = Number(rawX);
    const y = Number(rawY);
    if (!Number.isFinite(x) || !Number.isFinite(y) ||
        !Array.isArray(rawMembers) || rawMembers.length === 0 || rawMembers.length > 500) return null;
    const root = options.rootName();
    if (!root) return null;
    const excluded = options.excludedElements(key, root);
    const members = readMembers(rawMembers);
    if (!members) return null;

    const primary = members[0];
    let largest = primary;
    for (const member of members) {
      if (member.w * member.h > largest.w * largest.h) largest = member;
    }
    const left = x - largest.w / 2;
    const top = y - largest.h / 2;
    const keepPosition = mode === "keep";
    const candidate: DropCandidate = {
      tag: primary.tag,
      origAncestorEls: [],
      startRect: {
        left, top,
        width: largest.w,
        height: largest.h,
        right: left + largest.w,
        bottom: top + largest.h,
      },
      peerParent: null,
      brk: keepPosition,
      followers: null,
      group: null,
      mode: keepPosition ? "abs" : "flow",
      hostKey: key,
    };
    const anchor = preview.readAnchor(x, y);
    const target = anchor?.sticky
      ? { el: anchor.container, tid: options.identify(anchor.container) }
      : options.resolve(x, y, candidate, excluded);
    const originalBounds = anchor && target?.el === anchor.container
      ? anchor.bounds
      : target?.el?.getBoundingClientRect();
    if (!target || target.invalid) return clearPlan();
    const { el, tid } = target;
    if (tid != null && options.containerLocked(el)) return clearPlan();

    const tag = el.tagName;
    const previous = anchor?.container === el ? { n: anchor.index } : null;
    const insertion = keepPosition || tid == null
      ? null
      : options.insertion(el, tid, x, y, previous, excluded);
    if (insertion && options.canNest(tag, primary.tag)) {
      preview.place(
        el,
        insertion.n,
        options.children(el, excluded),
        primary.w,
        primary.h,
        anchor?.sticky ? anchor.pointer : { x, y },
        originalBounds!,
      );
    } else {
      preview.remove();
    }

    const bounds = el.getBoundingClientRect();
    const borderX = tid != null ? el.clientLeft - el.scrollLeft : 0;
    const borderY = tid != null ? el.clientTop - el.scrollTop : 0;
    const needsPositioning = tid != null && getComputedStyle(el).position === "static";
    const plan = members.map((member) => {
      if (!options.canNest(tag, member.tag)) return { tid: member.tid, refused: "nest" };
      if (keepPosition || tid == null) return {
        tid: member.tid,
        targetTid: tid,
        position: tid == null ? "root-end" : "into",
        absolute: true,
        absStyles: {
          left: Math.round(x + member.dx - bounds.left - borderX) + "px",
          top: Math.round(y + member.dy - bounds.top - borderY) + "px",
          width: Math.round(member.w) + "px",
          height: Math.round(member.h) + "px",
        },
        parentNeedsPositioning: needsPositioning,
      };
      return {
        tid: member.tid,
        targetTid: insertion!.targetTid,
        position: insertion!.position,
        absolute: false,
        parentNeedsPositioning: false,
      };
    });
    if (insertion) options.paintInsertion(el, insertion, excluded, preview.index);
    else options.clearInsertion();
    options.showContainer(bounds, tid == null ? "page" : tag.toLowerCase());
    return { container: tid, members: plan };
  };
}
