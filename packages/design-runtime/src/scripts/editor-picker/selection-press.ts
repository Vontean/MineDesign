import { componentScopeName, outerSvgElement } from "./element-query";
import type { createSelectionHit } from "./selection-hit";

interface Selection {
  tids: number[];
  name: string | null;
}

interface PressOrigin extends Selection {
  x: number;
  y: number;
}

type ReleaseAction = "artboard" | "none" | "background" | "keep" | "root" | "remove" | "narrow" | "text-part" | "text";
interface Press {
  release: ReleaseAction;
  target: Element | null;
  was?: PressOrigin | null;
}

interface SelectionPressOptions {
  isMac: boolean;
  selection(): Selection;
  rootName(): string | null;
  rootElement(): Element | null;
  resolveHit: ReturnType<typeof createSelectionHit>["resolveHitTarget"];
  editableDescendant: ReturnType<typeof createSelectionHit>["editableDescendantAncestor"];
  isTextEditable(element: Element): boolean;
  isSelectableContainer(element: Element): boolean;
  selectElement(element: Element, additive: boolean): void;
  selectArtboard(additive?: boolean): void;
  armMarquee(event: MouseEvent, root: Element | null, depth: "plain" | "deep", additive: boolean, selection?: Selection): void;
  armDrag(event: MouseEvent, element: Element, alreadySelected: boolean): void;
}

export function createSelectionPress(options: SelectionPressOptions) {
  let press: Press | null = null;

  function start(event: MouseEvent) {
    press = null;
    const target = event.target as Element | null;
    if (target?.closest?.("[data-dc-editor-overlay]")) return;

    const deep = options.isMac ? event.metaKey : event.ctrlKey;
    const additive = event.shiftKey;
    const rootName = options.rootName();
    const selected = options.selection();
    const hit = rootName
      ? options.resolveHit(event, deep ? "deep" : "plain", selected.tids, selected.name)
      : null;
    if (event.altKey && !additive && !deep) press = { release: "artboard", target: null };

    if (!hit || typeof hit === "string" || !hit.ruled) {
      if (hit === "empty" && (!event.altKey || (!additive && !deep))) {
        options.selectArtboard(additive);
        press = { release: "none", target: null };
        return;
      }
      const root = options.rootElement();
      if (rootName) {
        options.armMarquee(event, root && options.isSelectableContainer(root) ? root : null, deep ? "deep" : "plain", additive);
      }
      press ??= { release: "background", target: null };
      return;
    }

    const element = hit.el;
    const tid = parseInt(element.getAttribute("data-dc-tpl")!, 10);
    const alreadySelected = selected.name === componentScopeName(element) && selected.tids.includes(tid);
    const beforePress = { tids: selected.tids.slice(), name: selected.name };
    const root = options.rootElement();
    if (element === root && !alreadySelected && !deep && !event.altKey &&
        !target?.closest?.("[data-drags-parent]") && options.isSelectableContainer(root)) {
      options.armMarquee(event, root, "plain", additive);
      press = { release: additive ? "keep" : hit.page ? "background" : "root", target: element };
      return;
    }

    const editable = !additive && !deep && !alreadySelected && !options.isTextEditable(element)
      ? options.editableDescendant(element, hit.hit)
      : null;
    if (!press) {
      if (additive && alreadySelected) {
        press = { release: "remove", target: element };
      } else if (additive) {
        options.selectElement(element, true);
        press = { release: "none", target: element };
      } else if (alreadySelected) {
        const release = selected.tids.length > 1 ? "narrow" : deep ? "none" : "text-part";
        press = { release, target: element };
      } else if (editable) {
        press = { release: "text", target: editable };
      } else {
        options.selectElement(element, false);
        const was = options.isMac && event.ctrlKey && !deep
          ? { ...beforePress, x: event.clientX, y: event.clientY }
          : null;
        press = { release: "none", target: element, was };
      }
    }
    if (deep && options.isMac) {
      options.armMarquee(event, null, "deep", additive, beforePress);
      return;
    }
    options.armDrag(event, outerSvgElement(element), alreadySelected);
  }

  return {
    start,
    previousSelection: () => press?.was ?? null,
    take() {
      const pending = press;
      press = null;
      return pending;
    },
    clear() { press = null; },
    expire() {
      if (press) setTimeout(() => { press = null; }, 0);
    },
  };
}
