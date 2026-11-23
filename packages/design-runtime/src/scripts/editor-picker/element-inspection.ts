import { computedBoxDimensions } from "./element-transform-geometry";
import { collectTextStyles } from "./text-markup";
import { normalizePickerColor, textGroundColors } from "./text-ground";
import type { Dynamic } from "../../runtime-types";

const unsafeCloneTag = /^(INPUT|SELECT|TEXTAREA|OPTION|IMG|IFRAME|VIDEO|AUDIO|CANVAS|OBJECT|EMBED)$/;

function withTemporaryClone<T>(element: HTMLElement, inspect: (element: HTMLElement, style: CSSStyleDeclaration) => T): T | null | undefined {
  const parent = element.parentNode;
  if (!parent || unsafeCloneTag.test(element.tagName) || element.tagName.includes("-")) return undefined;
  const clone = element.cloneNode(false) as HTMLElement;
  clone.setAttribute("data-dc-editor-overlay", "");
  if (element.firstChild) clone.appendChild(document.createTextNode("x"));
  clone.style.setProperty("transition", "none", "important");
  clone.style.setProperty("animation", "none", "important");
  try {
    parent.insertBefore(clone, element);
    return inspect(clone, getComputedStyle(clone));
  } catch {
    return null;
  } finally {
    if (clone.parentNode) clone.parentNode.removeChild(clone);
  }
}

export function inheritedTextStyle(element: HTMLElement) {
  if (!(element.textContent || "").trim() && element.tagName !== "LI" &&
      getComputedStyle(element).display !== "list-item") return null;
  const styles = withTemporaryClone(element, (_clone, style) => collectTextStyles(element, style));
  return styles === undefined
    ? collectTextStyles(element, getComputedStyle(element), ["font-size", "font-family"])
    : styles;
}

export function firstTextFont() {
  try {
    for (const element of document.querySelectorAll("p, label, a")) {
      if (element.closest("[data-dc-editor-overlay],[data-dc-editor-overlay-root]")) continue;
      const rect = element.getBoundingClientRect();
      if (rect.width <= 0 || rect.height <= 0 ||
          rect.bottom < 0 || rect.top > innerHeight || rect.right < 0 || rect.left > innerWidth) continue;
      return getComputedStyle(element).fontFamily || null;
    }
  } catch {}
  return null;
}

function readInheritedProperties(element: HTMLElement, style: CSSStyleDeclaration, properties: readonly string[]) {
  const inherited: Record<string, string> = {};
  for (const property of properties) {
    const inline = element.style.getPropertyValue(property);
    const priority = element.style.getPropertyPriority(property);
    if (!inline) return null;
    element.style.removeProperty(property);
    inherited[property] = style.getPropertyValue(property);
    element.style.setProperty(property, inline, priority);
  }
  return inherited;
}

export function createElementInspector(findInstances: (id: string, name: string | null) => Element[]) {
  return function inspect(
    requestedTemplateId: unknown,
    componentName: string | null,
    properties: readonly string[],
    normalizeColors?: boolean,
    inherited?: boolean,
    ground?: boolean,
    requestedPose?: boolean,
  ) {
    const instances = findInstances(String(requestedTemplateId), componentName || null);
    if (!instances.length) {
      return requestedPose ? { tag: "", instances: 0, computed: {}, parent: null, rendered: false, missing: true } : null;
    }

    const element = instances[0] as HTMLElement;
    const style = getComputedStyle(element);
    let inheritedValues: Record<string, string> | null | undefined;
    if (inherited) {
      inheritedValues = withTemporaryClone(element, (clone, computed) => readInheritedProperties(clone, computed, properties));
      if (inheritedValues === undefined) inheritedValues = readInheritedProperties(element, style, properties);
      if (!inheritedValues) return null;
    }
    const computed: Record<string, string> = {};
    for (const property of properties) {
      const value = inheritedValues ? inheritedValues[property] : property.includes("-")
        ? style.getPropertyValue(property) : (style as Dynamic)[property];
      computed[property] = normalizeColors && /color|fill|stroke/i.test(property) ? normalizePickerColor(value) : value;
    }
    const parentStyle = element.parentElement ? getComputedStyle(element.parentElement) : null;
    const rendered = typeof element.checkVisibility === "function"
      ? element.checkVisibility({ visibilityProperty: true, checkVisibilityCSS: true })
      : element.getClientRects().length > 0 && style.visibility !== "hidden";
    const tag = element.tagName.toLowerCase();
    return {
      tag, instances: instances.length, computed,
      parent: parentStyle ? { display: parentStyle.display, flexDirection: parentStyle.flexDirection } : null,
      rendered,
      ...(ground ? { ground: textGroundColors(element, style) } : {}),
      ...(requestedPose ? {
        pose: style.display === "contents" ? { boxless: true }
          : rendered ? computedBoxDimensions(tag, element.offsetWidth, element.offsetHeight, style) : null,
      } : {}),
    };
  };
}
