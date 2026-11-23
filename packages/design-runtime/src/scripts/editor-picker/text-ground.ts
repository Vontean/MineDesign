const rgbaPattern = /^rgba?\((\d{1,3}(?:\.\d+)?), (\d{1,3}(?:\.\d+)?), (\d{1,3}(?:\.\d+)?)(?:, (\d(?:\.\d+)?|\.\d+))?\)$/;
const paintedElements = /^(img|video|canvas|svg|picture|iframe|embed|object|input|textarea|select|button|meter|progress)$/i;
const ignoredOverlay = "[data-dc-editor-overlay],[data-dc-editor-overlay-root],[data-omelette-chrome],[data-omelette-injected]";
type Rgba = [number, number, number, number];

let colorCanvas: CanvasRenderingContext2D | null = null;

export function normalizePickerColor<T>(color: T): T | string {
  if (typeof color !== "string" || color.startsWith("rgb")) return color;
  try {
    if (!colorCanvas) {
      const canvas = document.createElement("canvas");
      canvas.width = canvas.height = 1;
      colorCanvas = canvas.getContext("2d", { willReadFrequently: true });
    }
    if (!colorCanvas) return color;
    colorCanvas.fillStyle = "#010203";
    colorCanvas.fillStyle = color;
    if (colorCanvas.fillStyle === "#010203") return color;
    colorCanvas.clearRect(0, 0, 1, 1);
    colorCanvas.fillRect(0, 0, 1, 1);
    const [r, g, b, a] = colorCanvas.getImageData(0, 0, 1, 1).data;
    return a === 255 ? `rgb(${r}, ${g}, ${b})` : `rgba(${r}, ${g}, ${b}, ${Math.round(a / 2.55) / 100})`;
  } catch {
    return color;
  }
}

export function ancestorBackgroundColor(element: Element) {
  for (let ancestor = element.parentElement; ancestor; ancestor = ancestor.parentElement) {
    const color = getComputedStyle(ancestor).backgroundColor || "";
    if (!color || color === "transparent" ||
        (color.startsWith("rgba(") && color.endsWith(", 0)")) || color.endsWith("/ 0)")) continue;
    return color;
  }
  return "#fff";
}

function readColor(value: string): Rgba | null {
  const color = normalizePickerColor(value || "transparent");
  if (color === "transparent") return [0, 0, 0, 0];
  const match = rgbaPattern.exec(color);
  return match ? [+match[1], +match[2], +match[3], match[4] === undefined ? 1 : +match[4]] : null;
}

function isPainted(color: Rgba | null) {
  return color === null || color[3] > 0.02;
}

function nonDefault(value: string | undefined, initial: string) {
  return !!value && value !== initial;
}

function hasVisiblePaint(element: Element) {
  if (paintedElements.test(element.tagName || "")) return true;
  for (const node of element.childNodes) {
    if (node.nodeType === Node.TEXT_NODE && /\S/.test((node as Text).data)) return true;
  }
  const style = getComputedStyle(element);
  if (nonDefault(style.backgroundImage, "none") || isPainted(readColor(style.backgroundColor))) return true;
  for (const side of ["Top", "Right", "Bottom", "Left"] as const) {
    if (parseFloat(style[`border${side}Width`]) > 0 && style[`border${side}Style`] !== "none" &&
        isPainted(readColor(style[`border${side}Color`]))) return true;
  }
  return false;
}

function groundIsUnreliable(element: Element, opaqueLayer: Element, translucentLayers: Element[], atPageRoot: boolean) {
  const rect = element.getBoundingClientRect();
  const { body } = document;
  if (typeof document.elementsFromPoint !== "function" || !body?.hasAttribute("data-dc-editor-on") ||
      body.getAttribute("data-dc-editor-tool") === "interact") return true;
  const left = Math.max(rect.left, 0), right = Math.min(rect.right, innerWidth);
  const top = Math.max(rect.top, 0), bottom = Math.min(rect.bottom, innerHeight);
  if (!(right > left && bottom > top)) return true;
  const y = (top + bottom) / 2;
  for (const x of [(left + right) / 2, left + Math.min(4, (right - left) / 4)]) {
    let foundElement = false;
    let foundOpaque = false;
    let foundTranslucent = 0;
    for (const hit of document.elementsFromPoint(x, y)) {
      if (hit === element) foundElement = true;
      if (hit === opaqueLayer) {
        if (!foundElement) return true;
        foundOpaque = true;
        break;
      }
      if (translucentLayers.includes(hit)) foundTranslucent++;
      if (hit !== element && !element.contains(hit) && !hit.contains(element) &&
          !hit.closest(ignoredOverlay) && hasVisiblePaint(hit)) return true;
    }
    if (!foundElement || foundTranslucent !== translucentLayers.length || (!foundOpaque && !atPageRoot)) return true;
  }
  return false;
}

function composeGround(opaque: Rgba, layers: Rgba[]) {
  let [r, g, b] = opaque;
  for (let index = layers.length - 1; index >= 0; index--) {
    const [red, green, blue, alpha] = layers[index];
    r = alpha * red + (1 - alpha) * r;
    g = alpha * green + (1 - alpha) * g;
    b = alpha * blue + (1 - alpha) * b;
  }
  return `rgb(${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)})`;
}

function backdropColor(element: Element) {
  const colors: Rgba[] = [];
  const translucent: Element[] = [];
  let composed: string | null = null;
  let opaque: Element | null = null;
  let rootPainted = false;
  for (let layer: Element | null = element; layer?.nodeType === Node.ELEMENT_NODE; layer = layer.parentElement) {
    const style = getComputedStyle(layer) as CSSStyleDeclaration & { webkitBackdropFilter?: string };
    if ((style.opacity !== "" && parseFloat(style.opacity) < 1) ||
        nonDefault(style.filter, "none") || nonDefault(style.mixBlendMode, "normal") ||
        nonDefault(style.maskImage, "none") || nonDefault(style.webkitMaskImage, "none")) return null;
    if (composed !== null) {
      if (layer === document.documentElement) {
        const color = readColor(style.backgroundColor);
        rootPainted = nonDefault(style.backgroundImage, "none") || isPainted(color);
      }
      continue;
    }
    if (nonDefault(style.backgroundImage, "none") || nonDefault(style.backdropFilter, "none") ||
        nonDefault(style.webkitBackdropFilter, "none")) return null;
    const color = readColor(style.backgroundColor);
    if (!color) return null;
    if (color[3] >= 0.98) {
      composed = composeGround(color, colors);
      opaque = layer;
    } else if (color[3] > 0.02) {
      colors.push(color);
      translucent.push(layer);
    }
  }
  if (composed === null || !opaque) return null;
  const atPageRoot = opaque === document.documentElement || (opaque === document.body && !rootPainted);
  return groundIsUnreliable(element, opaque, translucent, atPageRoot) ? null : composed;
}

export function textGroundColors(element: Element, style: CSSStyleDeclaration) {
  if (element.namespaceURI === "http://www.w3.org/2000/svg") return null;
  const behind = backdropColor(element);
  return behind === null ? null : { behind, ink: normalizePickerColor(style.webkitTextFillColor || style.color) };
}
