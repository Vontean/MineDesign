import { firstRenderedInstance } from "./element-bounds";
import { outerSvgElement, unwrapDisplayContentsHost } from "./element-query";
import { isDeckManagedElement } from "./deck-target";
import { unionMemberBounds } from "./element-transform";
import {
  ancestorTransformSigns,
  decomposedElementTransform,
  elementLayoutDimensions,
  hasComplexAncestorTransform,
  normalizeDegrees,
  parseTransformFunctions,
} from "./element-transform-geometry";
import type { Dynamic } from "../../runtime-types";

interface TransformChromeOptions {
  selection(): { tids: number[]; name: string | null };
  generation(): number;
  canDrawHandles(): boolean;
  isRootComponent(name: string | null): boolean;
  findTemplateInstances(id: string, name: string | null): Element[];
  isUneditableElement(element: Element): boolean;
  isRepeatedDirectiveElement(element: Element): boolean;
  authoredPositioning(element: Element, style: CSSStyleDeclaration): Dynamic;
  editableLine(element: Element): Dynamic;
  penInfo(element: Element, bounds: DOMRect): Dynamic;
  isInlineBox(tag: string): boolean;
  autoDimensions(element: Element): { w: boolean; h: boolean };
  viewportScale(element: Element): number;
  parentScale(element: Element): number;
  readGroupPreview(): Dynamic;
  readSinglePreview(): Dynamic;
  selectionRotation(members: Dynamic[]): Dynamic;
}

function markSelectedStroke(element: Element | null) {
  for (const candidate of document.querySelectorAll("[data-dc-editor-stroke]")) {
    if (candidate !== element) candidate.removeAttribute("data-dc-editor-stroke");
  }
  if (element && !element.hasAttribute("data-dc-editor-stroke")) element.setAttribute("data-dc-editor-stroke", "");
}

function rotatedSelectionBounds(geometry: Dynamic) {
  const rotation = geometry.deg * Math.PI / 180;
  const cos = Math.abs(Math.cos(rotation));
  const sin = Math.abs(Math.sin(rotation));
  const width = geometry.w * cos + geometry.h * sin;
  const height = geometry.w * sin + geometry.h * cos;
  return {
    x: geometry.c.x - width / 2, y: geometry.c.y - height / 2, w: width, h: height,
    box: { x: geometry.c.x - geometry.w / 2, y: geometry.c.y - geometry.h / 2, w: geometry.w, h: geometry.h, rot: rotation },
  };
}

export function createSelectionTransformChrome(options: TransformChromeOptions) {
  let cache: { key: string; generation: number; members: Dynamic[] } | null = null;

  function rotatedElementPose(element: Element, bounds: Pick<DOMRect, "left" | "top" | "width" | "height">) {
    const { left, top, width, height } = bounds;
    const base = { x: left, y: top, w: width, h: height, rot: 0 };
    const transform = decomposedElementTransform(element);
    if (!transform || Math.abs(transform.rot) < 1e-4) return base;
    const dimensions = elementLayoutDimensions(element);
    const scale = options.parentScale(element);
    const signs = ancestorTransformSigns(element);
    const chromeWidth = dimensions.w * Math.abs(transform.sx) * scale;
    const chromeHeight = dimensions.h * Math.abs(transform.sy) * scale;
    if (!(chromeWidth > 0) || !(chromeHeight > 0)) return base;
    return { x: left + (width - chromeWidth) / 2, y: top + (height - chromeHeight) / 2, w: chromeWidth, h: chromeHeight, rot: transform.rot * signs.x * signs.y };
  }

  function canRotate(element: HTMLElement, pose: Dynamic, style?: CSSStyleDeclaration) {
    if (!pose) return false;
    const supported = element.style.transform ? !!parseTransformFunctions(element.style.transform) : !!pose.m.none;
    return supported && ((style ?? getComputedStyle(element)).display !== "inline" ||
      options.isInlineBox((element.tagName || "").toLowerCase()));
  }

  function transformableMembers() {
    const { tids, name } = options.selection();
    if (!options.isRootComponent(name)) return null;
    const members: Dynamic[] = [];
    const visited = new Set<Element>();
    const ancestorRestrictions = new Map<Element | null, boolean>();
    function hasRestrictedParent(element: Element) {
      const parent = element.parentElement;
      if (!ancestorRestrictions.has(parent)) ancestorRestrictions.set(parent, hasComplexAncestorTransform(element));
      return ancestorRestrictions.get(parent);
    }
    for (const id of tids) {
      const instances = options.findTemplateInstances(String(id), name);
      const instance = firstRenderedInstance(instances);
      if (!instance) continue;
      const element = outerSvgElement(instance) as HTMLElement;
      if (visited.has(element)) continue;
      visited.add(element);
      const visible = unwrapDisplayContentsHost(element);
      const rect = visible.getBoundingClientRect();
      if (!(rect.width > 0) || !(rect.height > 0)) continue;
      const style = getComputedStyle(element);
      const absolute = style.position === "absolute" || style.position === "fixed";
      const anchors = absolute ? options.authoredPositioning(element, style) : null;
      const importHost = element.hasAttribute("data-sc-name") || visible !== element;
      const line = importHost ? null : options.editableLine(element);
      const pose = importHost || line ? null : decomposedElementTransform(element);
      const blocked = members.length >= 500 || instances.length !== 1 ||
        options.isUneditableElement(element) || isDeckManagedElement(element) ||
        options.isRepeatedDirectiveElement(element) || (!!line && line.legacy) ||
        hasRestrictedParent(element);
      const movable = !blocked && absolute && !anchors.bothX && !anchors.bothY;
      members.push({
        el: element, pe: visible, tid: parseInt(element.getAttribute("data-dc-tpl")!, 10), r: rect,
        cs: style, anc: anchors, sep: line, pose, deg: pose ? Math.round(pose.rot * 180 / Math.PI) : 0,
        scl: options.viewportScale(visible), fixed: style.position === "fixed", movable,
        turned: !!pose && Math.abs(pose.rot) >= 1e-4,
        sizable: !blocked && !importHost && (!line || movable),
        rotatable: !blocked && !importHost && (line ? movable : canRotate(element, pose, style)),
      });
    }
    for (const member of members) {
      if (members.some((ancestor) => ancestor !== member && ancestor.el.contains(member.el))) {
        member.movable = member.sizable = member.rotatable = false;
      }
    }
    return members.length ? members : null;
  }

  function cachedMembers() {
    const { tids, name } = options.selection();
    const key = name + "|" + tids.join(",");
    const generation = options.generation();
    if (cache?.key === key && cache.generation === generation && cache.members.every((member) => member.pe.isConnected)) {
      for (const member of cache.members) member.r = member.pe.getBoundingClientRect();
      return cache.members;
    }
    const members = transformableMembers();
    cache = members ? { key, generation, members } : null;
    return members;
  }

  function groupChrome() {
    const preview = options.readGroupPreview();
    const members = preview ? preview.members : cachedMembers();
    if (!members) return null;
    const rotation = preview ? preview.live : options.selectionRotation(members);
    let bounds;
    if (rotation) {
      bounds = rotatedSelectionBounds(rotation);
    } else {
      const union = unionMemberBounds(members);
      bounds = { x: union.x, y: union.y, w: union.w, h: union.h, box: { ...union, rot: 0 } };
    }
    let canResize = false;
    let rotatable = 0;
    let layoutLocked = 0;
    let aspectLock = !!rotation && rotation.deg !== 0;
    for (const member of members) {
      if (member.sizable || member.movable) canResize = true;
      if (member.rotatable) {
        rotatable++;
        if (!member.movable) layoutLocked++;
      }
      if (member.sizable && member.turned) aspectLock = true;
    }
    return {
      el: null, group: true, members, ...bounds,
      rotatable: rotatable > 0 && layoutLocked === 0,
      noRotate: rotatable === 0 ? "none" : layoutLocked > 0 ? "layout" : null,
      noResize: !canResize,
      aspectLock,
      deg: preview?.rotate && preview.lastDeg != null ? normalizeDegrees(preview.live.deg) : null,
      stroke: null,
    };
  }

  function mediaCropChrome(element: HTMLElement) {
    const tag = (element.tagName || "").toLowerCase();
    if (tag !== "img" && tag !== "video") return null;
    const source = element as HTMLImageElement & HTMLVideoElement;
    const naturalWidth = tag === "img" ? source.naturalWidth : source.videoWidth;
    const naturalHeight = tag === "img" ? source.naturalHeight : source.videoHeight;
    const { offsetWidth, offsetHeight } = element;
    if (!(naturalWidth > 0) || !(naturalHeight > 0) || !(offsetWidth > 0) || !(offsetHeight > 0)) return { off: "unloaded" };
    const transform = decomposedElementTransform(element);
    const style = getComputedStyle(element) as CSSStyleDeclaration & { objectViewBox?: string };
    const plain = (value: string) => !value || value === "none";
    const hasPlainStyle = !transform && plain(style.transform) && plain(style.rotate) && plain(style.scale);
    if (hasComplexAncestorTransform(element) || (!transform && !hasPlainStyle) ||
        (transform && (transform.mirror || Math.abs(transform.sx - transform.sy) > 1e-4 * transform.sx))) return { off: "turned" };

    const inset = (border: string, padding: string) => (parseFloat(border) || 0) + (parseFloat(padding) || 0);
    const crop: Dynamic = {
      tid: parseInt(element.getAttribute("data-dc-tpl")!, 10), w: naturalWidth, h: naturalHeight,
      inset: [
        inset(style.borderLeftWidth, style.paddingLeft) / offsetWidth,
        inset(style.borderTopWidth, style.paddingTop) / offsetHeight,
        inset(style.borderRightWidth, style.paddingRight) / offsetWidth,
        inset(style.borderBottomWidth, style.paddingBottom) / offsetHeight,
      ],
      fit: style.objectFit || "", pos: style.objectPosition || "", box: style.objectViewBox || "",
    };
    if (tag === "video") crop.video = true;
    if (style.position === "absolute" || style.position === "fixed") crop.abs = true;
    const auto = options.autoDimensions(element);
    if (auto.w && auto.h) return { off: "auto" };
    if (auto.w) crop.autoW = true;
    if (auto.h) crop.autoH = true;
    return crop;
  }

  function selectedTransformChrome(): Dynamic {
    const { tids, name } = options.selection();
    const clearStroke = () => { markSelectedStroke(null); return null; };
    if (!tids.length || !options.canDrawHandles()) return clearStroke();
    if (tids.length > 1) {
      markSelectedStroke(null);
      return groupChrome();
    }
    const instances = options.findTemplateInstances(String(tids[0]), name);
    const first = instances[0];
    if (!first || first.hasAttribute("data-sc-name") || unwrapDisplayContentsHost(first) !== first ||
        options.isUneditableElement(first) || !options.isRootComponent(name)) return clearStroke();
    const transform = options.readSinglePreview();
    const rendered = firstRenderedInstance(instances) ?? (transform ? first : null);
    if (!rendered) return clearStroke();
    const element = transform?.el ?? outerSvgElement(rendered);
    const bounds = element.getBoundingClientRect();
    if (!(bounds.width > 0) || !(bounds.height > 0)) return clearStroke();

    const line = options.editableLine(element);
    const pose = line ? null : decomposedElementTransform(element);
    const pen = line ? null : options.penInfo(element, bounds);
    markSelectedStroke(line ? unwrapDisplayContentsHost(rendered) : null);
    return {
      el: element, x: bounds.left, y: bounds.top, w: bounds.width, h: bounds.height,
      box: rotatedElementPose(element, bounds),
      media: mediaCropChrome(element),
      pen,
      rotatable: canRotate(element, pose),
      deg: transform?.rotate ? transform.lastDeg : null,
      stroke: line ? {
        x1: bounds.left + line.px / line.vbW * bounds.width,
        y1: bounds.top + line.py / line.vbH * bounds.height,
        x2: bounds.left + line.tx / line.vbW * bounds.width,
        y2: bounds.top + line.ty / line.vbH * bounds.height,
      } : null,
    };
  }

  return { transformableMembers, selectedTransformChrome, rotatedElementPose };
}
