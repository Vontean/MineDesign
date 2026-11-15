/**
 * 画板页面发给画布的数据：实测尺寸与选择框（selection chrome）。
 * 选择框由画板内的选择脚本计算，坐标是画板自身的像素；这里校验、裁剪后交给画布叠层渲染。
 * 叠层功能（选择框、测距、参考线、钢笔路径）都只依赖本文件导出的类型。
 */
import { parseObjectClipPath, parseObjectPosition } from "../editor/media/object-crop";
import { getHiddenPickerTags } from "../editor/picker/hidden-tags";
import { PlatformFileContentConstant_17, PlatformFileContentLimit_6 } from "../platform/file-content";

/** 画板内容区的尺寸（画板像素）。 */
export interface ArtboardBox {
  w: number;
  h: number;
}

export type ObjectFit = "fill" | "contain" | "cover" | "none" | "scale-down";

/** 图片裁剪不可用的原因。 */
export type ImageCropOff = "unloaded" | "turned" | "auto" | "custom";

/** 可裁剪图片的描述：模板 id、原始尺寸、四边内缩比例与当前显示方式。 */
export interface ImageCrop {
  tid: number;
  w: number;
  h: number;
  inset: [number, number, number, number];
  view: { fit: ObjectFit; pos: unknown; box: unknown };
  video?: true;
  abs?: true;
  autoW?: true;
  autoH?: true;
}

export type ImageCropDescriptor = ImageCrop | { off: ImageCropOff };

/** sel 选中、hov 悬停、grip 带控制点的选中框（每个画板至多一个）、busy 生成中的遮罩。 */
export type ChromeRingKind = "sel" | "hov" | "grip" | "busy";

export interface ChromeRing {
  x: number;
  y: number;
  w: number;
  h: number;
  k: ChromeRingKind;
  /** 旋转弧度；框被裁剪到画板范围时不保留。 */
  rot?: number;
  component?: true;
  rotatable?: true;
  group?: true;
  noResize?: true;
  noRotate?: "none" | "layout";
  aspectLock?: true;
  /** 旋转角度（度，取整）。 */
  deg?: number;
  cropOff?: ImageCropOff | "offboard";
  media?: ImageCrop;
}

export interface ChromeLine {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

/** 测距：线段与数值标注。ext 为 1 的线段是延长线。 */
export interface ChromeMeasure {
  lines: Array<ChromeLine & { ext?: 1 }>;
  labels: Array<{ x: number; y: number; text: string; axis: "x" | "y" }>;
}

export interface ChromeGuide {
  axis: "x" | "y";
  pos: number;
}

/** 钢笔路径：所在盒子、viewBox 尺寸、缩放系数与路径数据。 */
export interface ChromePen {
  tid: number;
  x: number;
  y: number;
  w: number;
  h: number;
  vbW: number;
  vbH: number;
  kx: number;
  ky: number;
  d: string;
}

export interface SelectionChrome {
  rings: ChromeRing[];
  stroke: ChromeLine | null;
  measure: ChromeMeasure | null;
  guides: ChromeGuide[] | null;
  /** 指针悬停在画板本身上。 */
  artboard: boolean;
  pen: ChromePen | null;
}

export interface SelectionChromeOptions {
  /** 不产生带控制点的框与钢笔路径（只读或演示时）。 */
  gripless?: boolean;
  /** 正在裁剪的图片的模板 id；它的框允许超出画板更远。 */
  cropTid?: number;
}

/** 裁剪图片时，框可以超出画板的最大距离。 */
export const maxSelectionChromeItems = 8192;
/** 选择框坐标允许超出画板边缘的距离。 */
export const selectionChromeCoordinateOverscan = 256;
export const selectionChromePathPattern =
  /^M ?-?\d+(\.\d+)?[ ,]-?\d+(\.\d+)?( ?([ML] ?-?\d+(\.\d+)?[ ,]-?\d+(\.\d+)?|C ?-?\d+(\.\d+)?([ ,]-?\d+(\.\d+)?){5}))+$/;
export const maxSelectionChromePathLength = 24e3;
/** 低于这个缩放比例时不显示选择框。 */
export const selectionChromeMinimumScale = 0.25;

type Loose = Record<string, unknown> | null | undefined;

const finite = (value: unknown): number | null => (typeof value == "number" && Number.isFinite(value) ? value : null);

/** 画板上报的内容尺寸，取整并限制在允许的范围内。 */
export function normalizeArtboardMeasuredSize(box?: { w?: unknown; h?: unknown } | null): ArtboardBox | null {
  const { w, h } = box ?? {};
  if (typeof w != "number" || typeof h != "number" || !Number.isFinite(w) || !Number.isFinite(h)) return null;
  const clamp = (value: number): number =>
    Math.min(PlatformFileContentLimit_6, Math.max(PlatformFileContentConstant_17, Math.ceil(value)));
  return { w: clamp(w), h: clamp(h) };
}

export function parseImageCropDescriptor(value?: unknown): ImageCropDescriptor | null {
  const media = value as Loose;
  if (!media || typeof media != "object") return null;
  if (media.off === "unloaded" || media.off === "turned" || media.off === "auto") return { off: media.off };
  const isSize = (input: unknown): input is number => typeof input == "number" && input >= 1 && input <= 1e5;
  if (
    !Number.isSafeInteger(media.tid) ||
    !isSize(media.w) ||
    !isSize(media.h) ||
    media.w / media.h > 20 ||
    media.h / media.w > 20 ||
    !Array.isArray(media.inset) ||
    media.inset.length !== 4
  )
    return null;
  const inset = media.inset.map((input: unknown) => (typeof input == "number" && input >= 0 && input < 0.5 ? input : null));
  if (inset.some(input => input === null)) return null;
  // 非字符串当作空串；过长的值无法解析
  const text = (input: unknown): string | null => (typeof input != "string" ? "" : input.length <= 120 ? input : null);
  const [boxText, posText] = [text(media.box), text(media.pos)];
  if (boxText === null || posText === null) return { off: "custom" };
  const [box, pos] = [parseObjectClipPath(boxText), parseObjectPosition(posText)];
  if (box === undefined || (pos === null && posText !== "")) return { off: "custom" };
  const fit = text(media.fit) ?? "";
  return {
    tid: media.tid as number,
    w: media.w,
    h: media.h,
    inset: inset as [number, number, number, number],
    view: { fit: /^(fill|contain|cover|none|scale-down)$/.test(fit) ? (fit as ObjectFit) : "fill", pos, box },
    ...(media.video === true ? { video: true as const } : {}),
    ...(media.abs === true ? { abs: true as const } : {}),
    ...(media.autoW === true ? { autoW: true as const } : {}),
    ...(media.autoH === true ? { autoH: true as const } : {}),
  };
}

/** 画板去掉标题行之后的内容尺寸。 */
export function artboardContentSizeDescriptor<Component>(
  box: ArtboardBox | null | undefined,
  rowHeight: number,
  component: Component,
): (ArtboardBox & { component: Component }) | undefined {
  return box ? { w: box.w, h: box.h - rowHeight, component } : undefined;
}

/**
 * 校验画板发来的选择框数据。
 * 无效的条目被丢弃；超出画板范围的框被裁剪到画板加 overscan 的范围内，被裁剪的框不再带控制点与旋转。
 */
export function parseSelectionChromePayload(
  payload: Record<string, any>,
  viewport: ArtboardBox,
  options: SelectionChromeOptions = {},
): SelectionChrome {
  let overscan = selectionChromeCoordinateOverscan;
  const clampX = (value: number): number => Math.max(-overscan, Math.min(viewport.w + overscan, value));
  const clampY = (value: number): number => Math.max(-overscan, Math.min(viewport.h + overscan, value));

  const rings: ChromeRing[] = [];
  let hasGrip = false;
  if (Array.isArray(payload.rings)) {
    let busyCount = 0;
    for (const source of payload.rings.slice(0, 256)) {
      const x = finite(source?.x),
        y = finite(source?.y),
        w = finite(source?.w),
        h = finite(source?.h);
      if (x == null || y == null || w == null || h == null || w <= 0 || h <= 0) continue;
      const kind: "hov" | "grip" | "sel" =
        source.k === "hov" ? "hov" : source.k === "grip" && !hasGrip && options.gripless !== true ? "grip" : "sel";
      if (kind === "grip") hasGrip = true;
      const cropping = kind === "grip" && options.cropTid !== undefined ? parseImageCropDescriptor(source.media) : null;
      overscan =
        cropping !== null && "tid" in cropping && cropping.tid === options.cropTid
          ? maxSelectionChromeItems
          : selectionChromeCoordinateOverscan;
      const rawRot = finite(source.rot);
      const rot = rawRot != null && rawRot !== 0 && Math.abs(rawRot) < 7 ? rawRot : 0;
      // 旋转后的外接矩形
      const cos = Math.abs(Math.cos(rot)),
        sin = Math.abs(Math.sin(rot)),
        boundsW = w * cos + h * sin,
        boundsH = w * sin + h * cos;
      if (!Number.isFinite(boundsW + boundsH)) continue;
      const boundsX = x + (w - boundsW) / 2,
        boundsY = y + (h - boundsH) / 2,
        left = clampX(boundsX),
        top = clampY(boundsY),
        right = clampX(boundsX + boundsW),
        bottom = clampY(boundsY + boundsH);
      if (right <= left || bottom <= top) continue;
      const clipped = left !== boundsX || top !== boundsY || right !== boundsX + boundsW || bottom !== boundsY + boundsH;
      const ring: ChromeRing = clipped
        ? { x: left, y: top, w: right - left, h: bottom - top, k: kind === "grip" ? "sel" : kind }
        : { x, y, w, h, k: kind };
      if (source.k === "busy") {
        // 遮罩只画在画板内，数量有上限
        const busyX = Math.max(0, ring.x),
          busyY = Math.max(0, ring.y),
          busyW = Math.min(viewport.w, ring.x + ring.w) - busyX,
          busyH = Math.min(viewport.h, ring.y + ring.h) - busyY;
        if (getHiddenPickerTags().length === 0 || busyW <= 0 || busyH <= 0 || ++busyCount > 16) continue;
        const whole = busyX === x && busyY === y && busyW === w && busyH === h;
        rings.push(whole && rot !== 0 ? { x, y, w, h, k: "busy", rot } : { x: busyX, y: busyY, w: busyW, h: busyH, k: "busy" });
        continue;
      }
      if (rot !== 0 && !clipped) ring.rot = rot;
      if (source.component === true) ring.component = true;
      if (ring.k === "grip") {
        if (source.rotatable === true) ring.rotatable = true;
        if (source.group === true) {
          ring.group = true;
          if (source.noResize === true) ring.noResize = true;
          if (source.noRotate === "none" || source.noRotate === "layout") ring.noRotate = source.noRotate;
          if (source.aspectLock === true) ring.aspectLock = true;
        }
        const deg = finite(source.deg);
        if (deg != null && Math.abs(deg) <= 360) ring.deg = Math.round(deg);
      }
      if (source.k === "grip" && kind === "grip") {
        const media = parseImageCropDescriptor(source.media);
        if (media && "off" in media) ring.cropOff = media.off;
        else if (media && ring.k === "grip") ring.media = media;
        else if (media) ring.cropOff = "offboard";
      }
      rings.push(ring);
    }
  }
  overscan = selectionChromeCoordinateOverscan;

  const strokeSource = payload.stroke;
  const x1 = finite(strokeSource?.x1),
    y1 = finite(strokeSource?.y1),
    x2 = finite(strokeSource?.x2),
    y2 = finite(strokeSource?.y2);
  const stroke: ChromeLine | null =
    x1 != null && y1 != null && x2 != null && y2 != null && clampX(x1) === x1 && clampY(y1) === y1 && clampX(x2) === x2 && clampY(y2) === y2
      ? { x1, y1, x2, y2 }
      : null;

  let measure: ChromeMeasure | null = null;
  const measureSource = payload.measure;
  if (measureSource && Array.isArray(measureSource.lines) && Array.isArray(measureSource.labels)) {
    const lines: ChromeMeasure["lines"] = [];
    for (const line of measureSource.lines.slice(0, 12)) {
      const lx1 = finite(line?.x1),
        ly1 = finite(line?.y1),
        lx2 = finite(line?.x2),
        ly2 = finite(line?.y2);
      if (lx1 == null || ly1 == null || lx2 == null || ly2 == null) continue;
      lines.push({ x1: clampX(lx1), y1: clampY(ly1), x2: clampX(lx2), y2: clampY(ly2), ...(line.ext === 1 ? { ext: 1 as const } : null) });
    }
    const labels: ChromeMeasure["labels"] = [];
    for (const label of measureSource.labels.slice(0, 4)) {
      const lx = finite(label?.x),
        ly = finite(label?.y);
      if (lx == null || ly == null || typeof label.text != "string" || !/^\d{1,6}$/.test(label.text)) continue;
      labels.push({ x: clampX(lx), y: clampY(ly), text: label.text, axis: label.axis === "y" ? "y" : "x" });
    }
    if (lines.length > 0) measure = { lines, labels };
  }

  let guides: ChromeGuide[] | null = null;
  if (Array.isArray(payload.guides)) {
    const seen: Partial<Record<"x" | "y", true>> = {};
    for (const guide of payload.guides.slice(0, 4)) {
      const axis = guide?.axis === "x" ? "x" : guide?.axis === "y" ? "y" : null;
      const pos = finite(guide?.pos);
      if (axis == null || pos == null || seen[axis] || pos < 0 || pos > (axis === "x" ? viewport.w : viewport.h)) continue;
      seen[axis] = true;
      (guides ??= []).push({ axis, pos });
    }
  }

  let pen: ChromePen | null = null;
  const penSource = payload.pen;
  if (
    penSource &&
    options.gripless !== true &&
    typeof penSource.d == "string" &&
    penSource.d.length <= maxSelectionChromePathLength &&
    selectionChromePathPattern.test(penSource.d)
  ) {
    const [tid, x, y, w, h, vbW, vbH, kx, ky] = [
      finite(penSource.tid),
      finite(penSource.x),
      finite(penSource.y),
      finite(penSource.w),
      finite(penSource.h),
      finite(penSource.vbW),
      finite(penSource.vbH),
      finite(penSource.kx),
      finite(penSource.ky),
    ];
    if (
      tid != null &&
      tid >= 0 &&
      x != null &&
      y != null &&
      w != null &&
      h != null &&
      w > 0 &&
      h > 0 &&
      vbW != null &&
      vbH != null &&
      vbW > 0 &&
      vbH > 0 &&
      kx != null &&
      ky != null &&
      kx > 0 &&
      ky > 0 &&
      kx < 1e3 &&
      ky < 1e3 &&
      clampX(x) === x &&
      clampY(y) === y &&
      clampX(x + w) === x + w &&
      clampY(y + h) === y + h
    ) {
      // 路径上的每个点换算到画板坐标后也必须在允许范围内
      const [scaleX, scaleY] = [w / vbW, h / vbH];
      const inside = (penSource.d.match(/-?\d+(?:\.\d+)?/g) ?? [])
        .map(Number)
        .every((value: number, index: number) =>
          index % 2 === 0 ? clampX(x + value * scaleX) === x + value * scaleX : clampY(y + value * scaleY) === y + value * scaleY,
        );
      if (inside) pen = { tid: Math.trunc(tid), x, y, w, h, vbW, vbH, kx, ky, d: penSource.d };
    }
  }

  return { rings, stroke, measure, guides, artboard: payload.artboard === true, pen };
}
