import { componentScopeName, nearestComponentName } from "./element-query";
import { svgTextViewportScale } from "./svg-text-editor";

type Pointer = Pick<MouseEvent, "clientX" | "clientY">;

function isNonblankText(node: Node) {
  return node.nodeType === Node.TEXT_NODE && !!node.nodeValue?.trim();
}

function isInterpolation(node: Node) {
  if (node.nodeType !== Node.ELEMENT_NODE) return false;
  const element = node as Element;
  return !element.hasAttribute("data-dc-tpl") && /\bsc-interp\b/.test(String(element.className || ""));
}

export function hasDirectTextContent(element: Element) {
  return Array.from(element.childNodes).some((child) => isNonblankText(child) || isInterpolation(child));
}

export function hasOnlyInterpolatedText(element: Element) {
  let hasInterpolation = false;
  for (const child of element.childNodes) {
    if (isNonblankText(child)) return false;
    if (isInterpolation(child)) hasInterpolation = true;
  }
  return hasInterpolation;
}

export function isTextAtPointer(element: Element, { clientX, clientY }: Pointer) {
  const node = document.caretRangeFromPoint
    ? document.caretRangeFromPoint(clientX, clientY)?.startContainer
    : document.caretPositionFromPoint?.(clientX, clientY)?.offsetNode;
  return !!node && node.parentNode === element && isNonblankText(node);
}

export function isForeignTextElement(element: Element | null, outer: Element | null) {
  return !!element && element.nodeType === Node.ELEMENT_NODE &&
    element !== document.body && element !== document.documentElement &&
    !(outer && element.contains(outer)) &&
    !!(outer || document.querySelector("[data-dc-tpl]")) &&
    !element.closest("[data-dc-tpl],[data-dc-editor-overlay],.sc-placeholder") &&
    !element.querySelector("[data-dc-tpl]") && hasDirectTextContent(element);
}

export function findEditableSvgText(svg: SVGElement, pointer: Pointer, isEditable: (element: Element) => boolean) {
  const root = svg.tagName.toLowerCase() === "svg" ? svg : svg.ownerSVGElement;
  if (!root) return null;
  const component = componentScopeName(svg);
  const range = document.createRange();
  let closestText: SVGElement | null = null;
  let bestDistance = 1;
  for (const candidate of root.querySelectorAll<SVGElement>("text[data-dc-tpl], tspan[data-dc-tpl], textPath[data-dc-tpl]")) {
    if (componentScopeName(candidate) !== component || !isEditable(candidate)) continue;
    const padding = (parseFloat(getComputedStyle(candidate).fontSize) || 16) * svgTextViewportScale(candidate);
    const bounds = candidate.getBoundingClientRect();
    const walker = document.createTreeWalker(candidate, NodeFilter.SHOW_TEXT);
    for (let node = walker.nextNode(); node; node = walker.nextNode()) {
      for (let index = 0; index < node.nodeValue!.length; index++) {
        range.setStart(node, index);
        range.setEnd(node, index + 1);
        const rect = range.getBoundingClientRect();
        const x = rect.left + rect.width / 2;
        const y = rect.top + rect.height / 2;
        if (!(rect.width > 0) || x < bounds.left - padding || x > bounds.right + padding ||
            y < bounds.top - padding || y > bounds.bottom + padding) continue;

        const dx = x - pointer.clientX;
        const dy = y - pointer.clientY;
        const distance = Math.sqrt(dx * dx + dy * dy) / padding;
        if (distance < bestDistance) {
          closestText = candidate;
          bestDistance = distance;
        }
      }
    }
  }
  return closestText;
}

export function textEditDenial(element: Element, target: Element, tid: number, pointer: Pointer, outer: () => Element | null) {
  const imported = element.classList.contains("sc-host-x");
  if (!hasDirectTextContent(element)) {
    const foreign = !imported && target !== element && target.closest("[data-dc-tpl]") === element &&
      hasDirectTextContent(target) && !target.closest(".sc-placeholder") && !/\bsc-interp\b/.test(String(target.className || ""));
    return foreign ? { type: "textEditDenied", tid: -1, name: null, foreign: true } : null;
  }
  const host = outer();
  if (!imported && host && !host.contains(element) && nearestComponentName(element) == null) {
    return { type: "textEditDenied", tid, name: null, portaled: true };
  }
  let display = "";
  try { display = getComputedStyle(element).display || ""; } catch {}
  return {
    type: "textEditDenied",
    tid,
    name: nearestComponentName(element),
    x: pointer.clientX,
    y: pointer.clientY,
    items: /flex|grid/.test(display),
    bound: element.hasAttribute("data-sc-name") && hasOnlyInterpolatedText(element),
  };
}
