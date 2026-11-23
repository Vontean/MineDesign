import { normalizeSvgHit, outerSvgElement, type createElementQuery } from "./element-query";

type PickMode = "click" | "plain" | "deep" | "deeper";
type HitInput = Element | Event | null | undefined;
type HitTarget = "empty" | "unstamped" | {
  el: Element;
  hit: Element;
  ruled: boolean;
  page: boolean;
};

interface SelectionHitOptions {
  document: Document;
  elements: Pick<ReturnType<typeof createElementQuery>,
    "findTemplateInstances" | "findOuterComponentHost" | "normalizeComponentHit" |
    "belongsToOuterComponent" | "stampedAncestorChain" | "editorRootName" |
    "singleRootStampedElement" | "isUnselectedEmptyArtboard" | "hitArtboardBackground"
  >;
  eventHitsOverlay(input: HitInput): boolean;
  isTouchPointer(): boolean;
  isFreehandMode(): boolean;
  isEditableFreehandPath(element: Element): boolean;
  isTextEditable(element: Element): boolean;
}

function chooseSelectionDepth(
  hitCount: number,
  skipOuterHit: boolean,
  selectedDepth: number,
  containingDepth: number,
  mode: PickMode,
) {
  if (hitCount <= 0) return -1;
  if (mode === "deep") return hitCount - 1;
  if (mode === "deeper" && selectedDepth >= 0) return Math.min(selectedDepth + 1, hitCount - 1);
  const nextDepth = Math.max(selectedDepth, containingDepth + 1);
  if (selectedDepth >= 0 || containingDepth >= 0) return Math.min(nextDepth, hitCount - 1);
  return skipOuterHit && hitCount > 1 ? 1 : 0;
}

function isElement(input: unknown): input is Element {
  const candidate = input as Element | null | undefined;
  return Boolean(candidate?.nodeType === 1 && candidate.closest);
}

/** Resolve pointer hits against the active selection, text targets and artboard. */
export function createSelectionHit(options: SelectionHitOptions) {
  const { document, elements, isTextEditable } = options;
  const { stampedAncestorChain } = elements;
  let selectionCache: { key: string; elements: Element[] } = { key: "", elements: [] };

  function invalidateSelectionCache() {
    selectionCache = { key: "", elements: [] };
  }

  function selectedElementInstances(ids: number[], name: string | null) {
    const key = name + "|" + ids.join(",");
    if (selectionCache.key === key && selectionCache.elements.every((element) => element.isConnected)) {
      return selectionCache.elements;
    }
    const instances = ids.flatMap((id) => elements.findTemplateInstances(String(id), name));
    selectionCache = { key, elements: instances };
    return instances;
  }

  function lastFreehandAncestor(chain: Element[]) {
    const last = chain[chain.length - 1];
    return last && options.isEditableFreehandPath(outerSvgElement(last)) ? last : null;
  }

  function nextEditableAncestorIndex(chain: Element[], depth: number) {
    for (let index = depth + 1; index < chain.length; index++) {
      if (isTextEditable(chain[index])) return index;
    }
    return -1;
  }

  function resolveSelectionAncestor(
    element: Element,
    mode: PickMode,
    selectedIds?: number[],
    name?: string | null,
  ) {
    const chain = stampedAncestorChain(element);
    if (!chain.length) return null;
    const depthMode = mode === "click" ? "plain" : mode;
    if (options.isFreehandMode() && depthMode === "plain") {
      const freehand = lastFreehandAncestor(chain);
      if (freehand) return freehand;
    }

    const rootName = elements.editorRootName();
    let selectedDepth = -1;
    let containingDepth = -1;
    if (selectedIds?.length) {
      for (const selected of selectedElementInstances(selectedIds, name ?? rootName)) {
        for (let depth = chain.length - 1; depth >= 0; depth--) {
          if (chain[depth] === selected) {
            selectedDepth = Math.max(depth, selectedDepth);
            break;
          }
          if (chain[depth].contains(selected)) {
            containingDepth = Math.max(depth, containingDepth);
            break;
          }
        }
      }
    }

    let depth = chooseSelectionDepth(
      chain.length,
      chain[0] === elements.singleRootStampedElement(),
      selectedDepth,
      containingDepth,
      depthMode,
    );
    if (mode === "click" && depth >= 0 && !isTextEditable(chain[depth])) {
      const editableDepth = nextEditableAncestorIndex(chain, depth);
      if (editableDepth >= 0) depth = editableDepth;
    }
    return depth < 0 ? null : chain[depth];
  }

  function editableDescendantAncestor(selected: Element, hit: Element | null) {
    if (!hit || hit === selected || !selected.contains(hit)) return null;
    const chain = stampedAncestorChain(hit);
    const selectedDepth = chain.indexOf(selected);
    const editableDepth = selectedDepth < 0 ? -1 : nextEditableAncestorIndex(chain, selectedDepth);
    return editableDepth < 0 ? null : chain[editableDepth];
  }

  function resolveTextPickTarget(selected: Element, hit: Element, textIds: number[]) {
    if (!Array.isArray(textIds) || !textIds.length) return null;
    const ids = new Set(textIds.map(String));
    const isTextHit = (element: Element) => ids.has(String(parseInt(element.getAttribute("data-dc-tpl")!, 10)));
    if (isTextHit(selected)) return null;

    const chain = stampedAncestorChain(hit);
    const selectedDepth = chain.indexOf(selected);
    if (selectedDepth < 0) return null;
    for (let depth = selectedDepth + 1; depth < chain.length; depth++) {
      if (isTextHit(chain[depth])) return chain[depth];
    }
    return null;
  }

  function normalizePickElement(element: Element) {
    return elements.normalizeComponentHit(normalizeSvgHit(element));
  }

  function resolveHitTarget(
    input: HitInput,
    mode: PickMode,
    selectedIds?: number[],
    name?: string | null,
  ): HitTarget | null {
    const direct = isElement(input);
    const target = direct ? input : (input as Event | null | undefined)?.target;
    if (!isElement(target)) return null;
    if (elements.isUnselectedEmptyArtboard(selectedIds, name)) return "empty";
    const stamped = options.eventHitsOverlay(input) ? null : target.closest("[data-dc-tpl]");
    if (!stamped) return "unstamped";

    const hit = normalizePickElement(stamped);
    const ancestor = resolveSelectionAncestor(hit, mode, selectedIds, name);
    const touchEvent = options.isTouchPointer() && !direct;
    return {
      el: ancestor || hit,
      hit,
      ruled: ancestor !== null,
      page: mode !== "deep" && !touchEvent && elements.hitArtboardBackground(ancestor, hit, selectedIds, name),
    };
  }

  function classifyForeignHit(element: Element) {
    const outer = elements.findOuterComponentHost();
    const foreign = element !== document.body &&
      element !== document.documentElement &&
      !(outer && element.contains(outer)) &&
      !element.querySelector("[data-dc-tpl]") &&
      !element.closest("[data-dc-editor-overlay]") &&
      !element.closest("[data-dc-tpl]");
    return foreign ? "foreign" : "artboard";
  }

  function resolvePickTarget(element: Element, mode: PickMode, selectedIds?: number[]) {
    const target = resolveHitTarget(element, mode, selectedIds, null);
    return target && typeof target !== "string" && elements.belongsToOuterComponent(target.hit) ? target : null;
  }

  return {
    classifyForeignHit,
    editableDescendantAncestor,
    invalidateSelectionCache,
    lastFreehandAncestor,
    normalizePickElement,
    resolveHitTarget,
    resolvePickTarget,
    resolveSelectionAncestor,
    resolveTextPickTarget,
  };
}
