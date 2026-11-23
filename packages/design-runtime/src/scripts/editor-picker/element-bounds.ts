import { unwrapDisplayContentsHost } from "./element-query";

interface Edges {
  l: number;
  t: number;
  r: number;
  b: number;
}

export type ElementBounds = Pick<DOMRect, "left" | "top" | "right" | "bottom" | "width" | "height">;

function extendViewportEdges(edges: Edges | null, bounds: ElementBounds): Edges {
  if (!edges) return { l: bounds.left, t: bounds.top, r: bounds.right, b: bounds.bottom };
  edges.l = Math.min(edges.l, bounds.left);
  edges.t = Math.min(edges.t, bounds.top);
  edges.r = Math.max(edges.r, bounds.right);
  edges.b = Math.max(edges.b, bounds.bottom);
  return edges;
}

export function viewportBox(bounds: ElementBounds) {
  return { x: bounds.left, y: bounds.top, w: bounds.width, h: bounds.height };
}

function boxFromEdges({ l, t, r, b }: Edges) {
  return { x: l, y: t, w: r - l, h: b - t };
}

function nodeContentRange(node: Node) {
  try {
    const range = document.createRange();
    range.selectNodeContents(node);
    return range;
  } catch {
    return null;
  }
}

export function visibleContentBounds(element: Element): ElementBounds {
  if (element.getClientRects().length) return element.getBoundingClientRect();

  let combined: ElementBounds | null = null;
  let fallback: ElementBounds | null = null;
  for (const child of element.childNodes) {
    let rect: ElementBounds | null = null;
    if (child.nodeType === Node.ELEMENT_NODE) {
      const childElement = child as Element;
      rect = getComputedStyle(childElement).display === "contents"
        ? visibleContentBounds(childElement)
        : childElement.getBoundingClientRect();
    } else if (child.nodeType === Node.TEXT_NODE) {
      rect = nodeContentRange(child)?.getBoundingClientRect() ?? null;
    }
    if (!rect) continue;
    if (!(rect.width > 0 && rect.height > 0)) {
      if (!fallback && (rect.width || rect.height || rect.left || rect.top)) fallback = rect;
      continue;
    }
    if (!combined) {
      combined = rect;
      continue;
    }
    const left = Math.min(combined.left, rect.left);
    const top = Math.min(combined.top, rect.top);
    const right = Math.max(combined.right, rect.right);
    const bottom = Math.max(combined.bottom, rect.bottom);
    combined = { left, top, right, bottom, width: right - left, height: bottom - top };
  }
  return combined ?? fallback ?? element.getBoundingClientRect();
}

export function textContentBounds(element: Node) {
  let edges: Edges | null = null;
  for (const rect of nodeContentRange(element)?.getClientRects() ?? []) {
    if (rect.width > 0 && rect.height > 0) edges = extendViewportEdges(edges, rect);
  }
  return edges;
}

export function pointHitsText(element: Node, x: number, y: number) {
  for (const rect of nodeContentRange(element)?.getClientRects() ?? []) {
    if (x >= rect.left - 2 && x <= rect.right + 2 &&
        y >= rect.top - 2 && y <= rect.bottom + 2 && rect.width > 0) return true;
  }
  return false;
}

export function hasPaintedTextBox(element: Element) {
  const style = getComputedStyle(element);
  const background = style.backgroundColor;
  const channels = /^rgba?\(([^)]*)\)$/.exec(background || "")?.[1].split(/[\s,\/]+/).filter(Boolean);
  const opacity = !background || background === "transparent"
    ? 0 : channels && channels.length > 3 ? parseFloat(channels[3]) : 1;
  const paintedBackground = opacity >= 0.2 && style.backgroundClip !== "text" && style.webkitBackgroundClip !== "text";
  const paintedBorder = ["Top", "Right", "Bottom", "Left"].some((side) =>
    style[`border${side}Style` as keyof CSSStyleDeclaration] !== "none" &&
    parseFloat(style[`border${side}Width` as keyof CSSStyleDeclaration] as string) > 0,
  );
  if ((!paintedBackground && !paintedBorder) || !element.textContent?.trim()) return false;
  for (const child of element.querySelectorAll("[data-dc-tpl]")) {
    if (child.children.length) return false;
  }
  return true;
}

interface SelectionBoundsOptions {
  findTemplateInstances(id: number, componentName: string | null): Element[];
  svgGeometryBounds(element: Element): ElementBounds;
}

export function createSelectionBounds({ findTemplateInstances, svgGeometryBounds }: SelectionBoundsOptions) {
  function pickElementBounds(element: Element) {
    const svgBounds = svgGeometryBounds(unwrapDisplayContentsHost(element));
    return svgBounds.width || svgBounds.height ? svgBounds : visibleContentBounds(element);
  }

  function selectionBounds(templateIds: number[], componentName: string | null, part: string | null) {
    if (part === "text" && templateIds.length === 1) {
      const [element] = findTemplateInstances(templateIds[0], componentName);
      const textBounds = element ? textContentBounds(element) : null;
      if (textBounds) return boxFromEdges(textBounds);
    }

    let bounds: Edges | null = null;
    for (const id of templateIds) {
      for (const element of findTemplateInstances(id, componentName)) {
        try {
          const rect = pickElementBounds(element);
          if (rect && (rect.width !== 0 || rect.height !== 0)) bounds = extendViewportEdges(bounds, rect);
        } catch {}
      }
    }
    return bounds ? boxFromEdges(bounds) : null;
  }

  return { pickElementBounds, selectionBounds };
}

export function isRenderedElement(element: Element) {
  try {
    return element.checkVisibility
      ? element.checkVisibility({ checkOpacity: true, checkVisibilityCSS: true })
      : getComputedStyle(element).visibility !== "hidden";
  } catch {
    return true;
  }
}

export function firstRenderedInstance(instances: Element[]) {
  return instances.find(isRenderedElement) ?? null;
}
