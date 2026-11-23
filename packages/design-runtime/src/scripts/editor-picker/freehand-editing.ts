import { firstRenderedInstance } from "./element-bounds";
import { componentScopeName, outerSvgElement } from "./element-query";
import {
  ancestorTransformInfo,
  decomposedElementTransform,
  elementLayoutDimensions,
} from "./element-transform-geometry";
import { editableSvgGeometry } from "./editable-svg-line";
import { maxPathLength } from "./freehand-path";

const authoredPathPattern =
  /^M ?-?\d+(\.\d+)?[ ,]-?\d+(\.\d+)?( ?([ML] ?-?\d+(\.\d+)?[ ,]-?\d+(\.\d+)?|C ?-?\d+(\.\d+)?([ ,]-?\d+(\.\d+)?){5}))+$/;
const pixelValuePattern = /^-?\d+(\.\d+)?px$/;
const previewPathPattern = /^[MLC\d\s.,-]+$/;
const maxPreviewPathLength = 100_000;

function readEditablePath(element: Element | null) {
  if (!element || element.tagName.toLowerCase() !== "svg") return null;
  const svg = element as SVGSVGElement;
  if (
    editableSvgGeometry(svg) ||
    svg.getAttribute("preserveAspectRatio") !== "none" ||
    svg.style.position !== "absolute" ||
    !pixelValuePattern.test(svg.style.left) ||
    !pixelValuePattern.test(svg.style.top) ||
    getComputedStyle(svg).fill !== "none" ||
    svg.children.length !== 1
  ) return null;

  const path = svg.firstElementChild!;
  if (path.tagName.toLowerCase() !== "path") return null;
  const d = path.getAttribute("d") || "";
  if (d.length > maxPathLength || !authoredPathPattern.test(d)) return null;

  const viewBox = (svg.getAttribute("viewBox") || "").split(/[\s,]+/).map(Number);
  const [originX, originY, vbW, vbH] = viewBox;
  if (viewBox.length !== 4 || originX !== 0 || originY !== 0 || !(vbW > 0) || !(vbH > 0)) return null;

  const transform = decomposedElementTransform(svg);
  return !transform?.plain || ancestorTransformInfo(svg).rotated ? null : { svg, path, d, vbW, vbH };
}

interface FreehandEditingOptions {
  isEnabled(): boolean;
  selection(): { ids: readonly number[]; component: string | null };
  findTemplateInstances(id: string, component: string | null): Element[];
  repaint(): void;
  emit(event: object): void;
}

function isPreviewPath(d: unknown): d is string {
  return typeof d === "string" && previewPathPattern.test(d) && d.length <= maxPreviewPathLength;
}

function roundTenth(value: number) {
  return Math.round(value * 10) / 10;
}

export function createFreehandEditing(options: FreehandEditingOptions) {
  let inFreehandMode = false;
  let previewing: ReturnType<typeof readEditablePath> = null;

  function selectPath(id: number) {
    const { ids, component } = options.selection();
    if (!options.isEnabled() || ids.length !== 1) return null;
    const instances = options.findTemplateInstances(String(ids[0]), component);
    if (!instances.length) return null;
    const svg = outerSvgElement(firstRenderedInstance(instances) || instances[0]);
    return svg && parseInt(svg.getAttribute("data-dc-tpl"), 10) === id ? readEditablePath(svg) : null;
  }

  function restorePreview() {
    if (!previewing) return;
    previewing.path.setAttribute("d", previewing.d);
    previewing = null;
  }

  function preview(id: number, d?: unknown) {
    const selected = d == null ? null : selectPath(id);
    if (previewing && previewing.svg !== selected?.svg) restorePreview();
    if (!selected || !isPreviewPath(d)) return;
    previewing ??= selected;
    selected.path.setAttribute("d", d);
  }

  function commit(id: number, x: number, y: number, w: number, h: number, d: unknown) {
    const selected = selectPath(id);
    restorePreview();
    if (!selected || !isPreviewPath(d) || ![x, y, w, h].every(Number.isFinite)) return;

    const { svg, path } = selected;
    const rect = svg.getBoundingClientRect();
    const scale = elementLayoutDimensions(svg).w / rect.width || 1;
    const left = roundTenth((parseFloat(svg.style.left) || 0) + (x - rect.left) * scale);
    const top = roundTenth((parseFloat(svg.style.top) || 0) + (y - rect.top) * scale);
    const width = Math.max(1, Math.round(w));
    const height = Math.max(1, Math.round(h));
    svg.style.left = left + "px";
    svg.style.top = top + "px";
    svg.style.width = width + "px";
    svg.style.height = height + "px";
    svg.setAttribute("width", String(width));
    svg.setAttribute("height", String(height));
    svg.setAttribute("viewBox", `0 0 ${width} ${height}`);
    path.setAttribute("d", d);
    options.emit({
      type: "strokeEndpoint",
      tid: id,
      name: componentScopeName(svg),
      gestureKey: "g" + Date.now(),
      left, top, width, height, d,
      isArrow: false,
    });
    options.repaint();
  }

  function penInfo(element: Element, rect: DOMRectReadOnly) {
    const selected = inFreehandMode ? readEditablePath(element) : null;
    if (!selected) return null;
    const { w, h } = elementLayoutDimensions(element);
    return {
      tid: parseInt(element.getAttribute("data-dc-tpl")!, 10),
      x: rect.left, y: rect.top, w: rect.width, h: rect.height,
      vbW: selected.vbW, vbH: selected.vbH,
      kx: w / rect.width, ky: h / rect.height,
      d: previewing?.svg === element ? previewing.d : selected.d,
    };
  }

  return {
    isEditable: (element: Element) => readEditablePath(element) !== null,
    get inMode() { return inFreehandMode; },
    get previewActive() { return previewing !== null; },
    enter() {
      if (inFreehandMode) return;
      inFreehandMode = true;
      options.repaint();
    },
    setMode(value?: unknown) {
      if (value === undefined || !!value === inFreehandMode) return;
      inFreehandMode = !!value;
      restorePreview();
      options.repaint();
    },
    reset() {
      restorePreview();
      inFreehandMode = false;
    },
    penInfo,
    preview,
    commit,
  };
}
