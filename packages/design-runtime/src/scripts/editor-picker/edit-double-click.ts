import { isDeckStageWrapper } from "./deck-target";
import { isImageSlotWrapper } from "./drop-container";
import { componentScopeName, nearestComponentName } from "./element-query";
import {
  findEditableSvgText, hasDirectTextContent, hasOnlyInterpolatedText, isForeignTextElement,
  isTextAtPointer, textEditDenial,
} from "./text-hit";
import { eventHitsEditorOverlay } from "./wheel-targets";
import type { createSelectionHit } from "./selection-hit";

interface EditingText {
  el: Element;
  svg?: SVGElement | null;
}

interface Selection {
  ids: number[];
  component: string | null;
}

interface DoubleClickOptions {
  isEditing(): boolean;
  isReadOnly(): boolean;
  activeTool(): string;
  cancelForwarded(): void;
  suppressStale(event: MouseEvent): boolean;
  currentText(): EditingText | null;
  pressedInsideTextEditor(): boolean;
  isTextEditable(element: Element): boolean;
  svgDoubleClick(event: MouseEvent): void;
  beginImported(element: Element, id: number, event: MouseEvent): boolean;
  beginTemplate(element: Element): void;
  stampedTarget(event: MouseEvent): Element | null;
  outerComponent(): Element | null;
  selection(): Selection;
  select(element: Element): void;
  selectScope(element: Element, scope: Element): void;
  enterFreehand(element: Element): void;
  normalizeComponent(element: Element): Element;
  normalizePick: ReturnType<typeof createSelectionHit>["normalizePickElement"];
  resolveAncestor: ReturnType<typeof createSelectionHit>["resolveSelectionAncestor"];
  lastFreehandAncestor: ReturnType<typeof createSelectionHit>["lastFreehandAncestor"];
  stampedAncestors(element: Element): Element[];
  isRootComponent(component: string | null): boolean;
  emit(event: object): void;
}

function idOf(element: Element) {
  return parseInt(element.getAttribute("data-dc-tpl")!, 10);
}

function consume(event: MouseEvent) {
  event.preventDefault();
  event.stopPropagation();
}

function closestText(options: DoubleClickOptions, element: SVGElement, event: MouseEvent) {
  return findEditableSvgText(element, event, options.isTextEditable);
}

export function createEditDoubleClick(options: DoubleClickOptions) {
  function insideSvg(event: MouseEvent) {
    const current = options.currentText()?.svg;
    const target = event?.target as Element | null;
    if (!current || !target?.closest) return false;
    if (current.contains(target)) return true;
    return target instanceof SVGElement && (target.ownerSVGElement || target) === current.ownerSVGElement &&
      !hasDirectTextContent(target) && event.clientX != null && closestText(options, target, event) === current;
  }

  function insideText(event: MouseEvent) {
    const current = options.currentText();
    return !!current && (current.el.contains(event.target as Node) || insideSvg(event));
  }

  function reportUnstampedText(target: Element, event: MouseEvent) {
    const host = options.outerComponent();
    const rootText = host && target && (target === host
      ? isTextAtPointer(host, event)
      : target.parentElement === host && /\bsc-interp\b/.test(String(target.className || "")));
    if (rootText && host) {
      consume(event);
      options.emit({ type: "textEditDenied", tid: -1, name: host.getAttribute("data-sc-name"), rootText: true,
        bound: hasOnlyInterpolatedText(host) });
    } else if (isForeignTextElement(target, host)) {
      consume(event);
      options.emit({ type: "textEditDenied", tid: -1, name: null, foreign: true });
    }
  }

  function openUnmappedText(element: Element, tid: number, target: Element, selected: Selection, event: MouseEvent) {
    if (/^(img|video)$/i.test(element.tagName) && selected.ids.length === 1 &&
        selected.ids[0] === tid && options.isRootComponent(selected.component)) {
      options.emit({ type: "cropRequest", tid });
      return;
    }
    const hitImportedText = target !== element && isTextAtPointer(target, event);
    if (element.classList.contains("sc-host-x") &&
        (hitImportedText || !element.querySelector("[data-dc-tpl]")) &&
        !isDeckStageWrapper(element) && !isImageSlotWrapper(element)) {
      if (!options.beginImported(element, tid, event)) {
        options.emit({ type: "textEditDenied", tid, name: nearestComponentName(element), imported: true });
      }
      return;
    }
    const denial = textEditDenial(element, target, tid, event, options.outerComponent);
    if (denial) options.emit(denial);
  }

  function onDoubleClick(event: MouseEvent) {
    options.cancelForwarded();
    if (!options.isEditing() || options.suppressStale(event) || options.activeTool() === "interact" ||
        eventHitsEditorOverlay(event)) return;
    if (options.isReadOnly()) {
      consume(event);
      return;
    }
    const current = options.currentText();
    const target = event.target as Element;
    if (current && (current.el === target || current.el.contains(target))) return;
    if (current && options.pressedInsideTextEditor() && target.contains?.(current.el)) {
      consume(event);
      return;
    }
    if (insideSvg(event)) {
      consume(event);
      options.svgDoubleClick(event);
      return;
    }
    if (event.type === "dblclick" && (event.detail || 0) > 2) {
      consume(event);
      return;
    }

    let element = options.stampedTarget(event);
    if (!element) {
      reportUnstampedText(target, event);
      return;
    }

    let id = idOf(element);
    const normalized = options.normalizePick(element);
    const freehand = options.activeTool() === "select"
      ? options.lastFreehandAncestor(options.stampedAncestors(normalized))
      : null;
    if (freehand) {
      consume(event);
      options.enterFreehand(freehand);
      options.emit({ type: "penDblClick" });
      return;
    }
    const selected = options.selection();
    let scope = options.normalizeComponent(element);
    const ancestor = options.resolveAncestor(normalized, "plain", selected.ids, selected.component);
    if (ancestor) {
      const ancestorId = idOf(ancestor);
      if (selected.component !== componentScopeName(ancestor) || !selected.ids.includes(ancestorId)) {
        consume(event);
        options.select(ancestor);
        return;
      }
      const deeper = options.resolveAncestor(normalized, "deeper", selected.ids, selected.component);
      if (deeper && deeper !== ancestor && !options.isTextEditable(ancestor)) {
        consume(event);
        options.select(deeper);
        return;
      }
      if (ancestor !== scope && ancestor !== element) {
        element = scope = ancestor;
        id = ancestorId;
      }
    }
    if (scope !== element) {
      consume(event);
      options.selectScope(element, scope);
      return;
    }
    if (!options.isTextEditable(element) && element instanceof SVGElement && !hasDirectTextContent(element)) {
      const svgText = closestText(options, element, event);
      if (svgText) {
        element = svgText;
        id = idOf(element);
      }
    }
    consume(event);
    if (options.isTextEditable(element)) options.beginTemplate(element);
    else openUnmappedText(element, id, target, selected, event);
  }

  return { onDoubleClick, insideText, insideSvg };
}
