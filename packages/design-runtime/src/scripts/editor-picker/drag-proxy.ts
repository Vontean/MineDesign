import { unwrapDisplayContentsHost } from "./element-query";
import { hasIndependentTransforms } from "./element-transform-geometry";
import { DRAG_PROXY_CAPTURE_BUDGET_MS } from "./source-drag-start";
import { ancestorBackgroundColor } from "./text-ground";

const cloneLimit = 200;
const excludedAttributes = new Set([
  "data-dc-tpl", "data-dc-dragging", "data-dc-editor-selected", "data-dc-editor-hover",
  "data-dc-editor-hover-stroke", "data-dc-editor-stroke", "data-dc-editor-patch",
  "data-dc-editor-dragging", "data-dc-drag-follower", "data-dc-drag-block",
  "name", "autoplay", "srcdoc", "is", "autofocus",
]);
const excludedTags = new Set(["style", "link", "script", "template", "noscript", "meta", "base"]);
const sourceTags = new Set(["iframe", "video", "audio", "source", "embed"]);
const chromeUnit = "var(--dc-chrome-unit,1px)";

type StyledElement = HTMLElement | SVGElement;
type DragProxy = { wrap: HTMLDivElement; s: number; ox: number; oy: number };
type StyledClone = { original: Element; clone: StyledElement; substituted: boolean };
type DragGroupProxy = { p: DragProxy; dx: number; dy: number; out?: boolean };
type DragPreview = {
  proxy?: DragProxy | null;
  groupProxies?: DragGroupProxy[];
  grabDx: number;
  grabDy: number;
  alt: boolean;
  parked: boolean;
};

export function hasCustomElementDescendant(element: Element, descendants: ArrayLike<Element>) {
  for (let index = -1; index < descendants.length; index++) {
    const candidate = index < 0 ? element : descendants[index];
    const tag = candidate.localName || "";
    const customized = candidate.getAttribute("is");
    if (candidate.shadowRoot ||
        (window.customElements && ((tag.indexOf("-") > 0 && customElements.get(tag)) ||
          (customized && customElements.get(customized))))) return true;
  }
  return false;
}

function clonePreviewNode(node: Node, styles: StyledClone[]): Node | null {
  if (node.nodeType !== Node.ELEMENT_NODE) return node.cloneNode(false);
  const original = node as Element;
  const tag = original.localName || "";
  if (excludedTags.has(tag)) return null;
  const substituted = tag.includes("-") || tag.includes(":");
  const clone = (substituted
    ? document.createElement("span")
    : document.createElementNS(original.namespaceURI, tag)) as StyledElement;
  for (const attribute of original.attributes) {
    const name = attribute.name.toLowerCase();
    if (name.startsWith("on") || excludedAttributes.has(name)) continue;
    try { clone.setAttributeNS(attribute.namespaceURI, attribute.name, attribute.value); } catch {}
  }
  if (sourceTags.has(tag)) clone.removeAttribute("src");
  if (tag === "object") clone.removeAttribute("data");
  styles.push({ original, clone, substituted });
  for (const child of original.childNodes) {
    const clonedChild = clonePreviewNode(child, styles);
    if (clonedChild) clone.appendChild(clonedChild);
  }
  return clone;
}

function copyComputedStyle(original: Element, clone: StyledElement) {
  if (!clone.style) return;
  const computed = getComputedStyle(original);
  let cssText = "";
  for (let index = 0; index < computed.length; index++) {
    const property = computed[index];
    cssText += property + ":" + computed.getPropertyValue(property) + ";";
  }
  clone.style.cssText = cssText;
}

function untransformedBounds(element: StyledElement) {
  const original = element.getAttribute("style");
  try {
    for (const transform of ["transform", "rotate", "scale", "translate"]) {
      element.style.setProperty(transform, "none", "important");
    }
    return element.getBoundingClientRect();
  } finally {
    if (original === null) element.removeAttribute("style");
    else element.setAttribute("style", original);
  }
}

export function createDragProxyCapture(options: {
  overlayRoot(): HTMLElement;
  parentScale(element: Element): number;
  strokeColor: string;
}) {
  return function capture(element: Element, deadline?: number): DragProxy | null {
    try {
      const box = unwrapDisplayContentsHost(element) as StyledElement;
      const rect = box.getBoundingClientRect();
      if (!(rect.width >= 1 && rect.height >= 1)) return null;
      const computed = getComputedStyle(box);
      const transformed = (computed.transform && computed.transform !== "none") || hasIndependentTransforms(computed);
      let layout = transformed ? untransformedBounds(box) : rect;
      const { offsetWidth, offsetHeight } = box as HTMLElement;
      const scale = offsetWidth > 0 && layout.width > 0 ? layout.width / offsetWidth : options.parentScale(box) || 1;
      const width = offsetWidth > 0 ? offsetWidth : layout.width / scale;
      const height = offsetHeight > 0 ? offsetHeight : layout.height / scale;
      const wrap = document.createElement("div");
      wrap.setAttribute("data-dc-editor-overlay", "");
      wrap.setAttribute("data-dc-editor-drag-proxy", "");
      wrap.setAttribute("inert", "");
      wrap.style.cssText =
        "position:fixed;left:0;top:0;z-index:2147483646;pointer-events:none;display:none;transform-origin:0 0;box-sizing:border-box;" +
        `width:${width}px;height:${height}px;outline:calc(2*${chromeUnit}) solid ${options.strokeColor};outline-offset:calc(-1*${chromeUnit});`;

      const descendants = element.querySelectorAll("*");
      if (descendants.length < cloneLimit && !(deadline != null && Date.now() >= deadline) &&
          !hasCustomElementDescendant(element, descendants)) {
        const styles: StyledClone[] = [];
        const clone = clonePreviewNode(element, styles) as StyledElement;
        const budgetEnd = Math.min(Date.now() + DRAG_PROXY_CAPTURE_BUDGET_MS, deadline ?? Infinity);
        for (const [index, style] of styles.entries()) {
          if (index === 0 || style.substituted || Date.now() < budgetEnd) copyComputedStyle(style.original, style.clone);
        }
        clone.style.setProperty("position", "static", "important");
        clone.style.setProperty("margin", "0", "important");
        clone.style.setProperty("pointer-events", "none", "important");
        if (transformed) {
          wrap.style.outline = "none";
        } else {
          wrap.style.background = ancestorBackgroundColor(box);
          wrap.style.borderRadius = computed.borderRadius;
        }
        wrap.appendChild(clone);
      } else {
        wrap.style.cssText += `outline:none;border-radius:calc(4*${chromeUnit});border:calc(1.5*${chromeUnit}) dashed ${options.strokeColor};background:color-mix(in srgb,${options.strokeColor} 8%,transparent);`;
        if (transformed) {
          wrap.style.width = rect.width / scale + "px";
          wrap.style.height = rect.height / scale + "px";
          layout = rect;
        }
      }
      options.overlayRoot().appendChild(wrap);
      return { wrap, s: scale, ox: layout.left - rect.left, oy: layout.top - rect.top };
    } catch {
      return null;
    }
  };
}

function place(proxy: DragProxy, x: number, y: number, opacity: string, hidden = false) {
  proxy.wrap.style.display = hidden ? "none" : "block";
  proxy.wrap.style.opacity = opacity;
  proxy.wrap.style.transform = `translate(${x + proxy.ox}px,${y + proxy.oy}px) scale(${proxy.s})`;
}

export function positionDragProxy(gesture: DragPreview, event: { clientX: number; clientY: number }, invalid?: boolean) {
  if (!gesture.proxy) return;
  const x = event.clientX - gesture.grabDx;
  const y = event.clientY - gesture.grabDy;
  const opacity = invalid ? "0.4" : "0.85";
  place(gesture.proxy, x, y, opacity);
  for (const { p, dx, dy, out } of gesture.groupProxies ?? []) place(p, x + dx, y + dy, opacity, out);
  gesture.parked = !gesture.alt;
  const mode = gesture.alt ? "copy" : "move";
  if (document.body.getAttribute("data-dc-editor-proxy") !== mode) {
    document.body.setAttribute("data-dc-editor-proxy", mode);
  }
}

export function hideDragProxy(gesture: DragPreview) {
  if (gesture.proxy) gesture.proxy.wrap.style.display = "none";
  for (const { p } of gesture.groupProxies ?? []) p.wrap.style.display = "none";
  gesture.parked = false;
  if (document.body.hasAttribute("data-dc-editor-proxy")) document.body.removeAttribute("data-dc-editor-proxy");
}
