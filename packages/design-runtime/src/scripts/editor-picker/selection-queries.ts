import { isRenderedElement, type ElementBounds } from "./element-bounds";
import { expandedSvgBounds, outerSvgElement, unwrapDisplayContentsHost } from "./element-query";
import { isSelectableContainer, removeAncestorSelections, selectableDescendants } from "./selection-candidates";
import type { createSelectionHit } from "./selection-hit";
import { hasOnlyMatchingSvgContent, resolveSingleContentSvg } from "./svg-line-geometry";

interface PickerRect {
  x: number;
  y: number;
  w: number;
  h: number;
}
interface PickerTextHit {
  tid: number;
  tag: string;
  rect: PickerRect;
}
export interface PickerHit extends PickerTextHit {
  root: boolean;
  page: boolean;
  text: PickerTextHit | null;
}

interface QueryOptions {
  isUnselectedEmptyArtboard(ids: number[]): boolean;
  isEmptyArtboard(): boolean;
  editorRootName(): string | null;
  singleRootStampedElement(): Element | null;
  findOuterComponentHost(): Element | null;
  resolvePickTarget: ReturnType<typeof createSelectionHit>["resolvePickTarget"];
  resolveTextPickTarget: ReturnType<typeof createSelectionHit>["resolveTextPickTarget"];
  pickElementBounds(element: Element): ElementBounds;
  editorElementTag(element: Element): string;
  findInstances(id: string, component: string): Element[];
}

function editorId(element: Element) {
  return parseInt(element.getAttribute("data-dc-tpl") || "-1", 10);
}

function box(bounds: ElementBounds) {
  return { x: bounds.left, y: bounds.top, w: bounds.width, h: bounds.height };
}

function positiveBounds(bounds: ElementBounds) {
  return bounds.width > 0 && bounds.height > 0;
}

export function createSelectionQueries(options: QueryOptions) {
  function pickAt(x: unknown, y: unknown, mode?: unknown, selectedIds?: unknown, textIds?: number[]) {
    const clientX = Number(x);
    const clientY = Number(y);
    if (!Number.isFinite(clientX) || !Number.isFinite(clientY)) return null;
    const depth = mode === "deep" || mode === "deeper" ? mode : "plain";
    const ids: number[] = Array.isArray(selectedIds)
      ? selectedIds.filter((id) => typeof id === "number" && Number.isFinite(id))
      : [];
    return new Promise<PickerHit | { empty: true } | null>((resolve) => {
      requestAnimationFrame(() => requestAnimationFrame(() => {
        if (options.isUnselectedEmptyArtboard(ids)) {
          resolve({ empty: true });
          return;
        }
        const hovered = document.elementFromPoint(clientX, clientY);
        const target = hovered && options.resolvePickTarget(hovered, depth, ids);
        if (!target) {
          resolve(null);
          return;
        }
        const element = target.el;
        const root = target.hit === element && element === options.singleRootStampedElement();
        const tid = editorId(element);
        if (tid < 0 || !Number.isFinite(tid)) {
          resolve(null);
          return;
        }
        const rect = box(options.pickElementBounds(element));
        const text = depth === "plain" ? options.resolveTextPickTarget(element, target.hit, textIds ?? []) : null;
        resolve({
          tid,
          tag: options.editorElementTag(element),
          rect,
          root,
          page: target.page,
          text: text ? {
            tid: parseInt(text.getAttribute("data-dc-tpl")!, 10),
            tag: options.editorElementTag(text),
            rect: box(options.pickElementBounds(text)),
          } : null,
        });
      }));
    });
  }

  function pickIn(left: unknown, top: unknown, right: unknown, bottom: unknown, mode?: unknown) {
    const [x1, y1, x2, y2] = [left, top, right, bottom].map(Number);
    if (![x1, y1, x2, y2].every(Number.isFinite) || x2 < x1 || y2 < y1) return [];
    const component = options.editorRootName();
    if (!component || options.isEmptyArtboard()) return [];
    const deep = mode === "deep";
    const root = deep ? null : options.singleRootStampedElement();
    const candidates = selectableDescendants(root && isSelectableContainer(root) ? root : null, component, deep ? "deep" : "plain");
    const hits = candidates.filter((element) => {
      const display = unwrapDisplayContentsHost(element);
      const rect = display.getBoundingClientRect();
      if (rect.width === 0 && rect.height === 0) return false;
      const overlaps = deep
        ? x1 <= rect.left && rect.right <= x2 && y1 <= rect.top && rect.bottom <= y2
        : x1 <= rect.right && rect.left <= x2 && y1 <= rect.bottom && rect.top <= y2;
      return overlaps && isRenderedElement(display);
    });
    const tagRows: { tid: number; tag: string }[] = [];
    for (const element of deep ? removeAncestorSelections(hits) : hits) {
      if (tagRows.length >= 512) break;
      const tid = editorId(element);
      if (Number.isFinite(tid) && tid >= 0) tagRows.push({ tid, tag: options.editorElementTag(element) });
    }
    return tagRows;
  }

  function peerRects(peers: unknown, includeScroll?: unknown) {
    const boxRows: { i: number; x: number; y: number; w: number; h: number }[] = [];
    if (!Array.isArray(peers)) return boxRows;
    const scrollX = includeScroll ? window.scrollX : 0;
    const scrollY = includeScroll ? window.scrollY : 0;
    const component = options.findOuterComponentHost()?.getAttribute("data-sc-name");
    if (!component) return boxRows;

    for (let index = 0; index < peers.length && index < 64; index++) {
      const tid = Number(peers[index]);
      if (!(Number.isInteger(tid) && tid >= 0)) continue;
      for (const element of options.findInstances(String(tid), component)) {
        if (boxRows.length >= 256) break;
        const display = unwrapDisplayContentsHost(element);
        const svg = outerSvgElement(display);
        let target = resolveSingleContentSvg(display, svg, hasOnlyMatchingSvgContent);
        let bounds = expandedSvgBounds(target);
        if (target !== svg && (!positiveBounds(bounds) || !isRenderedElement(target))) {
          target = svg;
          bounds = expandedSvgBounds(target);
        }
        if (positiveBounds(bounds) && isRenderedElement(target)) {
          boxRows.push({ i: index, x: bounds.left + scrollX, y: bounds.top + scrollY, w: bounds.width, h: bounds.height });
        }
      }
    }
    return boxRows;
  }

  return { pickAt, pickIn, peerRects };
}
