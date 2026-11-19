/** Restored injected script; compiled as an isolated IIFE before insertion into a preview. */
import type { Dynamic } from "../runtime-types";
import { elementToSVG as elementToSVG, inlineResources as inlineResources } from "dom-to-svg";
var SVG_NAMESPACE: Dynamic = "http://www.w3.org/2000/svg",
  CAPTURE_OVERLAY_STYLES: Dynamic =
    ":root:root:root body *{user-select:text!important;-webkit-user-select:text!important}[data-dc-editor-overlay],[data-omelette-chrome],[data-noncommentable]{display:none!important}",
  TOP_LEVEL_SHADOW_HOST_SELECTOR: Dynamic = ".sc-host:not(.sc-host .sc-host)",
  colorSamplingContext: Dynamic = null;
function toRgbaColor(
  this: Dynamic,
  cssColor?: Dynamic,
  ..._unusedArgs: Dynamic[]
): Dynamic {
  if (
    ((colorSamplingContext ??= (document as Dynamic)
      .createElement("canvas")
      .getContext("2d", {
        willReadFrequently: true,
      })),
    !colorSamplingContext || !CSS.supports("color", cssColor))
  )
    return null;
  colorSamplingContext.clearRect(0, 0, 1, 1);
  colorSamplingContext.fillStyle = "#0000";
  colorSamplingContext.fillStyle = cssColor;
  colorSamplingContext.fillRect(0, 0, 1, 1);
  let [red, green, blue, alphaByte]: Dynamic = colorSamplingContext.getImageData(
    0,
    0,
    1,
    1,
  ).data;
  return (
    "rgba(" +
    String(red) +
    ", " +
    String(green) +
    ", " +
    String(blue) +
    ", " +
    String(Math.round(((alphaByte ?? 0) / 255) * 1e3) / 1e3) +
    ")"
  );
}
var SHADOW_COLOR_PATTERN: Dynamic =
  /(?:rgba?|hsla?|hwb|lab|lch|oklab|oklch|color|color-mix|light-dark)\((?:[^()]|\([^()]*\))*\)|#[0-9a-f]{3,8}\b/i;
function parseOuterShadows(
  this: Dynamic,
  boxShadow?: Dynamic,
  ..._parserArgs: Dynamic[]
): Dynamic {
  if (!boxShadow || boxShadow === "none") return [];
  let shadows: Dynamic = [];
  for (let rawShadow of boxShadow.split(/,(?![^(]*\))/) as Dynamic) {
    let shadow: Dynamic = rawShadow.trim();
    if (/\binset\b/.test(shadow)) continue;
    let colorMatch: Dynamic = shadow.match(SHADOW_COLOR_PATTERN),
      color: Dynamic = colorMatch ? toRgbaColor(colorMatch[0]) : null;
    if (!colorMatch || !color) continue;
    let filtered: Dynamic = shadow
      .replace(colorMatch[0], " ")
      .trim()
      .split(/\s+/)
      .map(parseFloat)
      .filter(
        (length?: Dynamic, ..._unusedArgs: Dynamic[]): Dynamic =>
          !(Number as Dynamic).isNaN(length),
      );
    filtered.length < 2 ||
      shadows.push({
        x: filtered[0] ?? 0,
        y: filtered[1] ?? 0,
        blur: filtered[2] ?? 0,
        spread: filtered[3] ?? 0,
        color: color,
      });
  }
  return shadows;
}
function createSvgElement(
  this: Dynamic,
  svgDocument?: Dynamic,
  tagName?: Dynamic,
  attributes?: Dynamic,
  ..._unusedArgs: Dynamic[]
): Dynamic {
  let element: Dynamic = svgDocument.createElementNS(SVG_NAMESPACE, tagName);
  for (let [attribute, attributeValue] of (Object as Dynamic).entries(attributes) as Dynamic)
    element.setAttribute(attribute, String(attributeValue));
  return element;
}
function appendBoxShadows(
  this: Dynamic,
  svgDocument?: Dynamic,
  rootSvg?: Dynamic,
  captureBounds?: Dynamic,
  elements?: Dynamic,
  ..._shadowArgs: Dynamic[]
): Dynamic {
  let definitions: Dynamic = rootSvg.querySelector("defs");
  definitions ||
    ((definitions = svgDocument.createElementNS(SVG_NAMESPACE, "defs")),
    rootSvg.insertBefore(definitions, rootSvg.firstChild));
  let rootBackground: Dynamic = rootSvg.querySelector(
      'g[data-stacking-layer="rootBackgroundAndBorders"]',
    ),
    index: Dynamic = 0;
  for (let sourceElement of elements as Dynamic) {
    let style: Dynamic = getComputedStyle(sourceElement);
    if (
      style.boxShadow === "none" ||
      style.display === "none" ||
      style.visibility === "hidden"
    )
      continue;
    let bounds: Dynamic = sourceElement.getBoundingClientRect();
    if (!bounds.width || !bounds.height) continue;
    let cornerRadius: Dynamic = parseFloat(style.borderTopLeftRadius) || 0,
      matchingRect: Dynamic = [...rootSvg.querySelectorAll("rect")].find(
        (rect?: Dynamic, ..._unusedArgs: Dynamic[]): Dynamic =>
          !rect.hasAttribute("mask") &&
          Math.abs(Number(rect.getAttribute("x")) - bounds.x) < 0.6 &&
          Math.abs(Number(rect.getAttribute("y")) - bounds.y) < 0.6 &&
          Math.abs(Number(rect.getAttribute("width")) - bounds.width) <
            0.6 &&
          Math.abs(Number(rect.getAttribute("height")) - bounds.height) <
            0.6,
      );
    for (let shadow of parseOuterShadows(style.boxShadow) as Dynamic) {
      let captureArea: Dynamic = "dc-shadow-" + String(++index),
        mask: Dynamic = createSvgElement(svgDocument, "mask", {
          id: captureArea + "-cut",
          maskUnits: "userSpaceOnUse",
          x: captureBounds.x,
          y: captureBounds.y,
          width: captureBounds.width,
          height: captureBounds.height,
        });
      mask.append(
        createSvgElement(svgDocument, "rect", {
          x: captureBounds.x,
          y: captureBounds.y,
          width: captureBounds.width,
          height: captureBounds.height,
          fill: "#fff",
        }),
        createSvgElement(svgDocument, "rect", {
          x: bounds.x,
          y: bounds.y,
          width: bounds.width,
          height: bounds.height,
          rx: cornerRadius,
          ry: cornerRadius,
          fill: "#000",
        }),
      );
      definitions.append(mask);
      let shadowRect: Dynamic = createSvgElement(svgDocument, "rect", {
        x: bounds.x - shadow.spread + shadow.x,
        y: bounds.y - shadow.spread + shadow.y,
        width: Math.max(0, bounds.width + 2 * shadow.spread),
        height: Math.max(0, bounds.height + 2 * shadow.spread),
        rx: Math.max(0, cornerRadius + shadow.spread),
        ry: Math.max(0, cornerRadius + shadow.spread),
        fill: shadow.color,
        mask: "url(#" + captureArea + "-cut)",
      });
      if (shadow.blur > 0) {
        let blurFilter: Dynamic = createSvgElement(svgDocument, "filter", {
          id: captureArea,
          x: "-50%",
          y: "-50%",
          width: "200%",
          height: "200%",
        });
        blurFilter.append(
          createSvgElement(svgDocument, "feGaussianBlur", {
            stdDeviation: shadow.blur / 2,
          }),
        );
        definitions.append(blurFilter);
        shadowRect.setAttribute("filter", "url(#" + captureArea + ")");
      }
      matchingRect
        ? matchingRect.before(shadowRect)
        : rootBackground
          ? rootBackground.after(shadowRect)
          : rootSvg.insertBefore(shadowRect, definitions.nextSibling);
    }
  }
}
function appendCanvasImages(
  this: Dynamic,
  svgDocument?: Dynamic,
  rootSvg?: Dynamic,
  sourceRoot?: Dynamic,
  ..._unusedArgs: Dynamic[]
): Dynamic {
  for (let canvas of sourceRoot.querySelectorAll("canvas") as Dynamic) {
    let bounds: Dynamic = canvas.getBoundingClientRect();
    if (!bounds.width || !bounds.height) continue;
    let imageUrl: Dynamic;
    try {
      imageUrl = canvas.toDataURL("image/png");
    } catch {
      continue;
    }
    rootSvg.append(
      createSvgElement(svgDocument, "image", {
        x: bounds.x,
        y: bounds.y,
        width: bounds.width,
        height: bounds.height,
        href: imageUrl,
      }),
    );
  }
}
async function __dcSvgCapture(
  this: Dynamic,
  captureMode?: Dynamic,
  requestedSize: Dynamic = null,
  ..._captureArgs: Dynamic[]
): Promise<Dynamic> {
  let capturePage: Dynamic = captureMode === "page",
    selectedElement: Dynamic = capturePage
      ? null
      : (document as Dynamic).querySelector("[data-dc-editor-selected]"),
    captureRoot: Dynamic = capturePage
      ? (document as Dynamic).documentElement
      : selectedElement &&
        (selectedElement.ownerSVGElement != null
          ? (selectedElement.closest("svg") ?? selectedElement)
          : selectedElement);
  if (!captureRoot)
    return {
      e: "no-selection",
    };
  let shadowHost: Dynamic =
      (document as Dynamic).querySelector(TOP_LEVEL_SHADOW_HOST_SELECTOR) ?? (document as Dynamic).body,
    captureStyleSheet: Dynamic = new CSSStyleSheet();
  captureStyleSheet.replaceSync(
    CAPTURE_OVERLAY_STYLES +
      (shadowHost.style.transform
        ? (shadowHost === (document as Dynamic).body ? "body" : TOP_LEVEL_SHADOW_HOST_SELECTOR) +
          "{transform:none!important}"
        : ""),
  );
  let body: Dynamic = (document as Dynamic).body,
    overlayWasHidden: Dynamic = body.hasAttribute("data-dc-editor-overlay-hidden"),
    wasCapturing: Dynamic = body.hasAttribute("data-dc-capturing"),
    selection: Dynamic = getSelection(),
    previousSelectionRange: Dynamic =
      selection && selection.rangeCount > 0 ? selection.getRangeAt(0) : null,
    svgDocument: Dynamic,
    captureArea: Dynamic,
    wasClipped: Dynamic = false,
    rootSvg: Dynamic;
  try {
    if (
      (((document as Dynamic).adoptedStyleSheets = [
        ...(document as Dynamic).adoptedStyleSheets,
        captureStyleSheet,
      ]),
      body.setAttribute("data-dc-editor-overlay-hidden", ""),
      capturePage && body.setAttribute("data-dc-capturing", ""),
      (captureArea = capturePage
        ? new DOMRect(
            -scrollX,
            -scrollY,
            requestedSize?.w ??
              Math.max(
                innerWidth,
                (document as Dynamic).documentElement.scrollWidth,
              ),
            requestedSize?.h ??
              Math.max(
                innerHeight,
                (document as Dynamic).documentElement.scrollHeight,
              ),
          )
        : captureRoot.getBoundingClientRect()),
      !captureArea.width || !captureArea.height)
    )
      return {
        e: "zero-size",
      };
    if (
      (capturePage &&
        requestedSize?.h != null &&
        (document as Dynamic).documentElement.scrollHeight > requestedSize.h + 1 &&
        (wasClipped = true),
      (svgDocument = elementToSVG(captureRoot, {
        captureArea: captureArea,
        keepLinks: false,
      })),
      (rootSvg = svgDocument.documentElement),
      capturePage)
    ) {
      let element: Dynamic = rootSvg.querySelector(
        'g[data-stacking-layer="rootBackgroundAndBorders"] > rect',
      );
      if (element)
        for (let [attribute, attributeValue] of [
          ["x", captureArea.x],
          ["y", captureArea.y],
          ["width", captureArea.width],
          ["height", captureArea.height],
        ] as Dynamic)
          element.setAttribute(attribute, String(attributeValue));
    }
    appendBoxShadows(
      svgDocument,
      rootSvg,
      captureArea,
      capturePage
        ? body.querySelectorAll("*")
        : [captureRoot, ...captureRoot.querySelectorAll("*")],
    );
    appendCanvasImages(svgDocument, rootSvg, captureRoot);
  } finally {
    (document as Dynamic).adoptedStyleSheets = (
      document as Dynamic
    ).adoptedStyleSheets.filter(
      (styleSheet?: Dynamic, ..._unusedArgs: Dynamic[]): Dynamic =>
        styleSheet !== captureStyleSheet,
    );
    overlayWasHidden || body.removeAttribute("data-dc-editor-overlay-hidden");
    capturePage && !wasCapturing && body.removeAttribute("data-dc-capturing");
    selection &&
      (selection.removeAllRanges(), previousSelectionRange && selection.addRange(previousSelectionRange));
  }
  for (let styleElement of [...rootSvg.querySelectorAll("style")] as Dynamic)
    styleElement.remove();
  await inlineResources(rootSvg);
  let svgText: Dynamic = new XMLSerializer().serializeToString(rootSvg);
  return wasClipped
    ? {
        s: svgText,
        clipped: true,
      }
    : {
        s: svgText,
      };
}
(window as Dynamic).__dcSvgCapture = __dcSvgCapture;
