import type { Dynamic } from "../../runtime-types";
import { isEmptyLayoutWrapper, startsAtViewportEdges } from "./layout-insertion";
import { expandThinBounds } from "./resize-geometry";

const TEMPLATE = "data-dc-tpl";
const COMPONENT = "data-sc-name";
const OVERLAY = "data-dc-editor-overlay";
const SKIPPED_ROOT_TAGS = /^(helmet|sc-helmet|script|style|link|noscript|template)$/i;
const SVG_SHAPES = new Set(["path", "line", "circle", "rect", "ellipse", "polygon", "polyline"]);

export function nearestComponentName(element: Element) {
  return element.closest(`[${COMPONENT}]`)?.getAttribute(COMPONENT) ?? null;
}

/** A stamped component host belongs to the caller that imported it. */
export function componentScopeName(element: Element) {
  const scopedElement = element.hasAttribute(COMPONENT) ? element.parentElement : element;
  return scopedElement ? nearestComponentName(scopedElement) : null;
}

export function unwrapDisplayContentsHost(element: Dynamic): Dynamic {
  if (element?.classList?.contains("sc-host-x") && element.firstElementChild) {
    try {
      if (getComputedStyle(element).display === "contents") return element.firstElementChild;
    } catch {}
  }
  return element;
}

function findDisplayContentsHost(element: Dynamic): Element | null {
  const host = element?.parentElement;
  if (
    !host?.classList.contains("sc-host-x") ||
    host.firstElementChild !== element ||
    element.hasAttribute(TEMPLATE)
  ) return null;
  try {
    return getComputedStyle(host).display === "contents" ? host : null;
  } catch {
    return null;
  }
}

function isSvgShape(element: Element) {
  return SVG_SHAPES.has((element.tagName || "").toLowerCase());
}

export function normalizeSvgHit(element: Dynamic): Dynamic {
  if (!element?.closest) return element;
  const svg = element.closest(`svg[${TEMPLATE}]`);
  if (!svg || svg === element || componentScopeName(svg) !== componentScopeName(element)) {
    return element;
  }
  return isSvgShape(element) && element.hasAttribute(TEMPLATE) ? element : svg;
}

export function outerSvgElement(element: Dynamic): Dynamic {
  if (!element?.closest || !element.getAttribute || !isSvgShape(element)) return element;
  const svg = element.closest(`svg[${TEMPLATE}]`);
  return svg && svg !== element && componentScopeName(svg) === componentScopeName(element)
    ? svg
    : element;
}

export function expandedSvgBounds(element: Element) {
  const bounds = element.getBoundingClientRect();
  return isSvgShape(element) ? expandThinBounds(bounds, 8) : bounds;
}

interface ElementQueryOptions {
  document: Document;
  readAnnotatedTemplate(name: string): unknown;
  describeImport(tag: string, attributes: Record<string, string>): unknown;
  collectImportedIds(template: string): Record<string, number>;
  isUneditable(element: Element): boolean;
  isDeckManaged(element: Element): boolean;
  hasCustomElementDescendant(element: Element, descendants: NodeListOf<Element>): boolean;
  isTextTag(tag: string): boolean;
  isSelectableContainer(element: Element): boolean;
}

/** Resolve stamped preview elements by component scope and DOM ancestry. */
export function createElementQuery(options: ElementQueryOptions) {
  const { document } = options;
  const importsByComponent = new Map<string, { source: string; ids: Record<string, number> }>();

  function findOuterComponentHost() {
    return document.querySelector(".sc-host:not(.sc-host .sc-host)");
  }

  function editorRootElement() {
    return findOuterComponentHost() || document.body;
  }

  function editorRootName() {
    const root = editorRootElement();
    return root ? root.getAttribute(COMPONENT) || nearestComponentName(root) : null;
  }

  function isNestedComponentImport(element: Dynamic) {
    if (element?.hasAttribute?.(COMPONENT)) {
      return Boolean(
        element.parentElement?.closest(`[${COMPONENT}]`) &&
        options.describeImport("dc-import", { name: element.getAttribute(COMPONENT) || "" }),
      );
    }
    const host = element?.classList?.contains("sc-host-x") ? element : findDisplayContentsHost(element);
    const templateId = host?.getAttribute(TEMPLATE);
    if (templateId == null) return false;
    const name = nearestComponentName(host);
    let source: unknown;
    try {
      source = name == null ? null : options.readAnnotatedTemplate(name);
    } catch {}
    if (name == null || typeof source !== "string") return false;
    let cached = importsByComponent.get(name);
    if (!cached || cached.source !== source) {
      cached = { source, ids: options.collectImportedIds(source) };
      importsByComponent.set(name, cached);
    }
    return cached.ids[templateId] === 1;
  }

  function normalizeComponentHit(element: Element) {
    const outer = findOuterComponentHost();
    const outerName = outer?.getAttribute(COMPONENT);
    if (!outerName || element === outer || componentScopeName(element) === outerName) return element;

    let host = element.closest(`[${COMPONENT}]`);
    while (host && host !== outer) {
      const parent = host.parentElement;
      if (parent && nearestComponentName(parent) === outerName) {
        return host.hasAttribute(TEMPLATE) ? host : element;
      }
      host = parent?.closest(`[${COMPONENT}]`) ?? null;
    }
    return element;
  }

  function belongsToOuterComponent(element: Element) {
    const outerName = findOuterComponentHost()?.getAttribute(COMPONENT);
    return !outerName || componentScopeName(element) === outerName ||
      (element.hasAttribute(COMPONENT) &&
        element.parentElement !== null &&
        nearestComponentName(element.parentElement) === outerName);
  }

  function rootStampedElements() {
    const root = editorRootElement();
    if (!root) return [];
    const rootName = editorRootName();
    const stamped: Element[] = [];
    function collect(parent: Element) {
      for (const child of parent.children) {
        if (child.hasAttribute(OVERLAY) || SKIPPED_ROOT_TAGS.test(child.tagName)) continue;
        if (child.hasAttribute(TEMPLATE)) {
          if (!rootName || componentScopeName(child) === rootName) stamped.push(child);
        } else {
          collect(child);
        }
      }
    }
    collect(root);
    return stamped;
  }

  function singleRootStampedElement() {
    const roots = rootStampedElements();
    return roots.length === 1 ? roots[0] : null;
  }

  function isEmptyArtboard() {
    const roots = rootStampedElements();
    if (roots.length === 0) return true;
    if (roots.length !== 1) return false;
    const [root] = roots;
    return !options.isUneditable(root) &&
      !options.isDeckManaged(root) &&
      !options.hasCustomElementDescendant(root, root.querySelectorAll("*")) &&
      isEmptyLayoutWrapper(root, options.isTextTag);
  }

  function isUnselectedEmptyArtboard(selectedIds?: number[], selectedName?: string | null) {
    if (!editorRootName() || !isEmptyArtboard()) return false;
    const root = singleRootStampedElement();
    return !(root &&
      selectedIds && selectedIds.indexOf(parseInt(root.getAttribute(TEMPLATE)!, 10)) >= 0 &&
      (selectedName == null || selectedName === editorRootName()));
  }

  function hitArtboardBackground(
    ancestor: Element | null,
    hit: Element,
    selectedIds?: number[],
    selectedName?: string | null,
  ) {
    if (
      ancestor !== hit ||
      document.documentElement.hasAttribute("data-dc-frameless") ||
      hit !== singleRootStampedElement() ||
      (selectedIds && selectedIds.indexOf(parseInt(hit.getAttribute(TEMPLATE)!, 10)) >= 0 &&
        (selectedName == null || selectedName === componentScopeName(hit))) ||
      !options.isSelectableContainer(hit)
    ) return false;

    const scroll = document.scrollingElement || document.documentElement;
    const bounds = hit.getBoundingClientRect();
    return startsAtViewportEdges({
      left: bounds.left + scroll.scrollLeft,
      top: bounds.top + scroll.scrollTop,
      right: bounds.right + scroll.scrollLeft,
    }, document.documentElement.clientWidth);
  }

  function stampedAncestorChain(element: Element) {
    const root = editorRootElement();
    const rootName = editorRootName();
    const chain: Element[] = [];
    const enclosingSvg = isSvgShape(element) ? element.closest(`svg[${TEMPLATE}]`) : null;
    for (let ancestor: Element | null = element; ancestor && ancestor !== root; ancestor = ancestor.parentElement) {
      if (
        ancestor !== enclosingSvg &&
        ancestor.hasAttribute(TEMPLATE) &&
        (!rootName || componentScopeName(ancestor) === rootName) &&
        !options.isDeckManaged(ancestor) &&
        !ancestor.closest(`[${OVERLAY}]`)
      ) chain.unshift(ancestor);
    }
    return chain;
  }

  function findTemplateInstances(templateId: Dynamic, name?: string | null) {
    const matches = document.querySelectorAll(`[${TEMPLATE}="${templateId}"]`);
    return Array.from(matches).filter((element) => componentScopeName(element) === name);
  }

  return {
    belongsToOuterComponent,
    editorRootName,
    findOuterComponentHost,
    findTemplateInstances,
    hitArtboardBackground,
    isEmptyArtboard,
    isNestedComponentImport,
    isUnselectedEmptyArtboard,
    normalizeComponentHit,
    singleRootStampedElement,
    stampedAncestorChain,
  };
}
