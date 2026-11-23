import { componentScopeName } from "./element-query";
import { eventHitsEditorOverlay } from "./wheel-targets";

interface Point {
  x: number;
  y: number;
}

interface TemplateSelection {
  tids: number[];
  name: string | null;
}

type PressSelection = Point & TemplateSelection;

interface DeferredMenu extends Point {
  element: Element | null;
  previousSelection: PressSelection | null;
}

interface ContextMenuOptions {
  isMac: boolean;
  isEditing(): boolean;
  isTextEditing(): boolean;
  activeTool(): string;
  selection(): TemplateSelection;
  selectionBeforePress(): PressSelection | null;
  pendingDrag(): Point | null;
  findTemplateInstances(id: number, component: string | null): Element[];
  eventTarget(event: MouseEvent): Element | null;
  normalizeTarget(element: Element): Element;
  resolveAncestor(element: Element, mode: "plain", ids: number[], component: string | null): Element | null;
  stampedAncestors(element: Element): readonly Element[];
  isNestedImport(element: Element): boolean;
  suppressViewportMenu(): boolean;
  deferViewportMenu(event: MouseEvent): boolean;
  cancelGestures(): void;
  replaceSelection(element: Element): void;
  emit(event: object): void;
}

function isSelected(element: Element, selection: TemplateSelection) {
  return selection.name === componentScopeName(element) &&
    selection.tids.includes(parseInt(element.getAttribute("data-dc-tpl")!, 10));
}

export function createPickerContextMenu(options: ContextMenuOptions) {
  let pending: DeferredMenu | null = null;
  let lastKeyboardMenu = 0;
  let lastTextMenu = 0;

  function openForSelection() {
    const { tids, name } = options.selection();
    if (!tids.length) return;
    const [element] = options.findTemplateInstances(tids[0], name);
    if (!element) return;
    lastKeyboardMenu = Date.now();
    const bounds = element.getBoundingClientRect();
    options.emit({
      type: "contextMenu",
      key: true,
      x: bounds.left + Math.min(40, bounds.width / 2),
      y: bounds.top + Math.min(24, bounds.height / 2),
    });
  }

  function openAt(x: number, y: number, element: Element | null, previousSelection?: TemplateSelection | null) {
    options.cancelGestures();
    if (element) {
      const target = options.normalizeTarget(element);
      const selection = previousSelection || options.selection();
      let ancestor = options.resolveAncestor(target, "plain", selection.tids, selection.name) || target;
      if (!isSelected(ancestor, selection)) {
        const ancestors = options.stampedAncestors(target);
        for (let index = ancestors.length - 1; index >= 0 && ancestors[index] !== ancestor; index--) {
          if (options.isNestedImport(ancestors[index])) {
            ancestor = ancestors[index];
            break;
          }
        }
      }
      if (!isSelected(ancestor, options.selection())) options.replaceSelection(ancestor);
    }
    options.emit({ type: "contextMenu", x, y });
  }

  function onContextMenu(event: MouseEvent) {
    if (options.suppressViewportMenu() || Date.now() - lastKeyboardMenu < 500) {
      event.preventDefault();
      event.stopPropagation();
      return;
    }
    if (!options.isEditing() || options.activeTool() === "interact") return;
    if (options.isTextEditing()) {
      lastTextMenu = Date.now();
      return;
    }
    if (eventHitsEditorOverlay(event)) return;
    event.preventDefault();
    event.stopPropagation();
    if (options.deferViewportMenu(event)) return;
    const { clientX: x, clientY: y } = event;
    const ctrlClick = options.isMac && event.ctrlKey && event.button !== 2;
    const beforePress = ctrlClick ? options.selectionBeforePress() : null;
    const previousSelection = beforePress?.x === x && beforePress.y === y ? beforePress : null;
    const press = options.pendingDrag();
    if (ctrlClick && press?.x === x && press.y === y) {
      pending = { x, y, element: options.eventTarget(event), previousSelection };
      return;
    }
    openAt(x, y, options.eventTarget(event), previousSelection);
  }

  function finishMouseUp(event: MouseEvent, canOpen: boolean, suppressClick: () => void) {
    const deferred = pending;
    pending = null;
    if (!deferred || event.type !== "mouseup" || !canOpen) return false;
    suppressClick();
    const element = deferred.element?.isConnected ? deferred.element : options.eventTarget(event);
    openAt(deferred.x, deferred.y, element, deferred.previousSelection);
    return true;
  }

  return {
    onContextMenu,
    openAt,
    openForSelection,
    finishMouseUp,
    get pending() { return pending !== null; },
    cancelPending() { pending = null; },
    canNotifyTextBlur: () => Date.now() - lastTextMenu > 500,
  };
}
