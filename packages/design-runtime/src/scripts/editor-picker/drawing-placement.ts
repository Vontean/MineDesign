import { isCollapsedDeckWrapper, isDeckStage, isDeckStageWrapper } from "./deck-target";
import { nearestComponentName } from "./element-query";
import type { ElementBounds } from "./element-bounds";

const toolDimensions: Record<string, [number, number] | null> = {
  rect: [120, 120],
  oval: [96, 96],
  frame: [200, 96],
  grid: [200, 120],
  text: [140, 22],
  arrow: null,
  line: null,
  draw: null,
};
const nestingBoundary = new Set([
  "button", "td", "th", "caption", "table", "object", "marquee", "applet",
  "template", "html", "foreignobject", "desc", "title", "mi", "mo", "mn",
  "ms", "mtext", "annotation-xml",
]);

export function isLineTool(tool: string) {
  return tool === "arrow" || tool === "line";
}

export function clickInsertDimensions(tool: string) {
  return toolDimensions[tool] || (isLineTool(tool) ? [160, 0] : [120, 120]);
}

export interface DrawingContainer {
  el: Element | null;
  tid: number | null;
  name: string | null;
  rect: ElementBounds;
}

interface ContainerOptions {
  activeTool(): string;
  canContainElements(element: Element): boolean;
  forbiddenInParagraph: Record<string, boolean>;
  allowedChildTags: Record<string, Record<string, boolean>>;
}

export function createDrawingContainerFinder(options: ContainerOptions) {
  function violatesNesting(element: Element) {
    const tool = options.activeTool();
    const insertedTag = isLineTool(tool) || tool === "draw" ? "svg" : "div";
    const allowed = options.allowedChildTags[(element.tagName || "").toLowerCase()];
    if (allowed && !allowed[insertedTag]) return true;
    if (!options.forbiddenInParagraph[insertedTag]) return false;
    for (let ancestor: Element | null = element; ancestor; ancestor = ancestor.parentElement) {
      const tag = (ancestor.tagName || "").toLowerCase();
      if (nestingBoundary.has(tag)) break;
      if (tag === "p") return true;
    }
    return false;
  }

  return (x: number, y: number): DrawingContainer => {
    let hit = document.elementFromPoint(x, y);
    while (hit instanceof SVGElement) hit = hit.parentElement;
    let element = hit?.closest("[data-dc-tpl]") ?? null;
    while (element && (!options.canContainElements(element) || violatesNesting(element) ||
           isDeckStage(element) || isDeckStageWrapper(element) || isCollapsedDeckWrapper(element))) {
      element = element.parentElement?.closest("[data-dc-tpl]") ?? null;
    }
    if (element) return {
      el: element,
      tid: parseInt(element.getAttribute("data-dc-tpl")!, 10),
      name: nearestComponentName(element),
      rect: element.getBoundingClientRect(),
    };

    const root = document.querySelector(".sc-host");
    const bounds = root?.getBoundingClientRect() ?? { left: 0, top: 0, right: innerWidth, bottom: innerHeight };
    const right = Math.max(bounds.right, innerWidth);
    const bottom = Math.max(bounds.bottom, innerHeight);
    return {
      el: root,
      tid: null,
      name: root?.getAttribute("data-sc-name") || null,
      rect: { left: bounds.left, top: bounds.top, right, bottom, width: right - bounds.left, height: bottom - bounds.top },
    };
  };
}

export function createPlacementOverlay({
  overlayRoot, strokeColor, cssPixels,
}: { overlayRoot(): HTMLElement; strokeColor: string; cssPixels(pixels: number): number }) {
  let overlay: { box: HTMLDivElement; parent: HTMLDivElement; label: HTMLDivElement } | null = null;

  function ensure() {
    if (overlay) return overlay;
    const box = document.createElement("div");
    box.setAttribute("data-dc-editor-overlay", "");
    box.style.cssText =
      `position:fixed;z-index:2147483645;pointer-events:none;display:none;border:1.5px dashed ${strokeColor};background:color-mix(in srgb,${strokeColor} 8%,transparent);border-radius:4px;`;
    const parent = document.createElement("div");
    parent.setAttribute("data-dc-editor-overlay", "");
    parent.style.cssText = "position:fixed;z-index:2147483644;pointer-events:none;display:none;";
    const label = document.createElement("div");
    label.style.cssText = "position:absolute;top:-18px;left:0;font:10px/1.4 ui-monospace,monospace;background:rgba(120,120,120,0.9);color:#fff;padding:1px 5px;border-radius:3px;white-space:nowrap;";
    parent.appendChild(label);
    overlayRoot().appendChild(parent);
    overlayRoot().appendChild(box);
    overlay = { box, parent, label };
    return overlay;
  }

  function hide() {
    hideBox();
    hideParent();
  }

  function showParent(bounds: Pick<ElementBounds, "left" | "top" | "width" | "height">, _label?: string) {
    const { parent, label } = ensure();
    parent.style.display = "block";
    parent.style.left = bounds.left + "px";
    parent.style.top = bounds.top + "px";
    parent.style.width = bounds.width + "px";
    parent.style.height = bounds.height + "px";
    parent.style.outline = cssPixels(1.5) + "px solid " + strokeColor;
    parent.style.outlineOffset = "0px";
    label.style.display = "none";
  }

  function hideParent() {
    if (overlay) overlay.parent.style.display = "none";
  }

  function hideBox() {
    if (overlay) overlay.box.style.display = "none";
  }

  function previewShape(tool: string, event: Pick<MouseEvent, "clientX" | "clientY">) {
    if (isLineTool(tool) || tool === "draw") {
      hide();
      return;
    }
    const { box, parent } = ensure();
    const [width, height] = toolDimensions[tool] ?? [120, 120];
    box.style.display = "block";
    box.style.left = event.clientX + "px";
    box.style.top = event.clientY + "px";
    box.style.width = width + "px";
    box.style.height = height + "px";
    box.style.borderRadius = tool === "oval" ? "50%" : "4px";
    parent.style.display = "none";
  }

  return { ensure, hide, hideParent, showParent, hideBox, previewShape };
}
