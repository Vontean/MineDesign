import { isDeckManagedElement } from "./deck-target";
import { isUneditableElement } from "./drop-container";
import { componentScopeName } from "./element-query";

export function selectableDescendants(container: Element | null, component: string | null, mode: string) {
  const candidates: Element[] = [];
  for (const element of document.querySelectorAll("[data-dc-tpl]")) {
    if (componentScopeName(element) !== component) continue;
    if (mode !== "deep" && (element.parentElement?.closest("[data-dc-tpl]") ?? null) !== container) continue;
    if (!isDeckManagedElement(element) && !element.closest("[data-dc-editor-overlay]")) candidates.push(element);
  }
  return candidates;
}

export function isSelectableContainer(element: Element) {
  if (isUneditableElement(element) || isDeckManagedElement(element) || (element.tagName || "").toLowerCase() === "svg") return false;
  return selectableDescendants(element, componentScopeName(element), "plain").some((child) => {
    const { display, position } = getComputedStyle(child);
    return display !== "none" && (display !== "inline" || position === "absolute" || position === "fixed");
  });
}

export function removeAncestorSelections(elements: Element[]) {
  const ancestors = new Set<Element>();
  for (const element of elements) {
    for (let parent = element.parentElement; parent; parent = parent.parentElement) ancestors.add(parent);
  }
  return elements.filter((element) => !ancestors.has(element));
}
