import { hasPaintedTextBox, pointHitsText } from "./element-bounds";
import { componentScopeName } from "./element-query";
import type { createSelectionHit } from "./selection-hit";
import type { createSelectionPress } from "./selection-press";

type Press = ReturnType<ReturnType<typeof createSelectionPress>["take"]>;
type Hit = ReturnType<ReturnType<typeof createSelectionHit>["resolveHitTarget"]>;
interface Selection {
  tids: number[];
  name: string | null;
}

interface SelectionClickOptions {
  isMac: boolean;
  selection(): Selection;
  setSelection(tids: number[], name: string | null, part: "text" | null): void;
  takePress(): Press;
  resolveHit: ReturnType<typeof createSelectionHit>["resolveHitTarget"];
  editableDescendant: ReturnType<typeof createSelectionHit>["editableDescendantAncestor"];
  classifyForeignHit: ReturnType<typeof createSelectionHit>["classifyForeignHit"];
  isTextEditable(element: Element): boolean;
  isTextElement(element: Element, id: number): boolean;
  sourceElementTag(element: Element): string;
  selectElement(element: Element, additive: boolean): void;
  selectArtboard(additive?: boolean): void;
  selectForeign(element: Element, additive: boolean): void;
  emitSelection(tag?: string, payload?: undefined, additive?: boolean): void;
  clearForeignSelection(): void;
  repaint(): void;
  doubleClick(event: MouseEvent): void;
}

function hitElement(hit: Hit) {
  return typeof hit === "object" ? hit?.el ?? null : null;
}

function templateId(element: Element) {
  return parseInt(element.getAttribute("data-dc-tpl")!, 10);
}

export function createSelectionClick(options: SelectionClickOptions) {
  function selectTextPart(event: MouseEvent, target: Element, hit: Hit, selected: Selection) {
    const singleClick = (event.detail || 0) < 2;
    if (singleClick && hit && typeof hit === "object" && hit.hit && !options.isTextEditable(target)) {
      const editable = options.editableDescendant(target, hit.hit);
      if (editable) {
        options.selectElement(editable, false);
        return;
      }
    }
    const id = templateId(target);
    if (selected.tids.length !== 1 || selected.tids[0] !== id) return;
    if (singleClick && options.isTextElement(target, id) &&
        hasPaintedTextBox(target) && pointHitsText(target, event.clientX, event.clientY)) {
      options.setSelection(selected.tids, selected.name, "text");
      options.repaint();
      options.emitSelection(options.sourceElementTag(target), undefined, true);
      return;
    }
    options.emitSelection(options.sourceElementTag(target));
    if (singleClick && target.tagName === "VIDEO") {
      const video = target as HTMLVideoElement;
      if (video.paused) video.play()?.catch(() => {});
      else video.pause();
    }
  }

  return function selectOnClick(event: MouseEvent) {
    const press = options.takePress();
    const selected = options.selection();
    const additive = event.shiftKey;
    const deep = options.isMac ? event.metaKey : event.ctrlKey;
    const hit = options.resolveHit(event, "plain", selected.tids, selected.name);
    const element = hitElement(hit);
    if ((event.detail || 0) >= 3 && !additive && !event.altKey && !deep && element &&
        selected.tids.length === 1 && selected.name === componentScopeName(element) &&
        selected.tids[0] === templateId(element)) {
      options.doubleClick(event);
      return;
    }

    if (press) {
      switch (press.release) {
        case "none":
        case "keep":
          return;
        case "artboard":
          options.selectArtboard();
          return;
        case "root":
        case "narrow":
        case "text":
          options.selectElement(press.target!, false);
          return;
        case "remove": {
          const id = press.target ? templateId(press.target) : NaN;
          const index = selected.tids.indexOf(id);
          if (index >= 0) {
            selected.tids.splice(index, 1);
            options.setSelection(selected.tids, selected.tids.length ? selected.name : null, null);
            options.repaint();
            options.emitSelection(undefined, undefined, true);
          }
          return;
        }
        case "text-part":
          selectTextPart(event, press.target!, hit, selected);
          return;
        case "background":
          break;
      }
    }

    if (hit && typeof hit === "object" && hit.page && !deep) {
      if (!additive) options.selectArtboard();
      return;
    }
    if (!element) {
      const target = event.target as Element;
      if (hit === "unstamped" && options.classifyForeignHit(target) === "foreign") {
        options.selectForeign(target, additive);
      } else {
        options.selectArtboard(additive);
      }
      return;
    }

    options.clearForeignSelection();
    const deeper = additive ? null : hitElement(options.resolveHit(event, "click", selected.tids, selected.name));
    const target = deeper ?? element;
    const id = templateId(target);
    const component = componentScopeName(target);
    const selectsText = !additive && (event.detail || 0) < 2 && selected.tids.length === 1 &&
      selected.tids[0] === id && selected.name === component && options.isTextElement(target, id) &&
      hasPaintedTextBox(target) && pointHitsText(target, event.clientX, event.clientY);
    let tids: number[];
    if (additive && selected.name === component && selected.tids.length) {
      tids = selected.tids;
      const index = tids.indexOf(id);
      if (index >= 0) tids.splice(index, 1);
      else tids.push(id);
    } else {
      tids = [id];
    }
    options.setSelection(tids, tids.length ? component : null, selectsText ? "text" : null);
    options.repaint();
    options.emitSelection(target.hasAttribute("data-sc-name") ? "dc-import" : target.tagName.toLowerCase(), undefined, additive);
  };
}
