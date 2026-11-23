import { uploadedVideoAnnotation } from "./working-state";
import { structurallyEqual } from "../platform/document-values";
import { annotationArrowHeads, annotationTextStyle, designPageId, isShapeAnnotation, maxDesignPages, moveAnnotation, normalizeDesignLaunch, PlatformFileContentBackgroundBackgroundColorOpacityValues, maxAnnotations as maxAnnotations, updateAnnotationArrowHeads, updateAnnotationColor, updateAnnotationCrop, updateAnnotationCss, updateAnnotationTextStyle, updateArtboardRadius, validCoverArtboard } from "../platform/file-content";

export type HistoryDirection = "undo" | "redo";

export interface DesignPage {
  id: string;
  name: string;
}

export interface CanvasArtboard {
  file: string;
  [key: string]: unknown;
}

export interface CanvasAnnotation {
  id: string;
  kind?: string;
  css?: Record<string, unknown>;
  [key: string]: unknown;
}

/** 启动视图：整个画布（可带页面），或聚焦某块画板。 */
export type CanvasLaunch = { view: "canvas"; page?: string } | { view: "focused"; file: string };

/** 作品清单里与历史相关的部分。 */
export interface CanvasManifest {
  artboards: CanvasArtboard[];
  annotations?: CanvasAnnotation[];
  pages?: DesignPage[];
  launch?: CanvasLaunch;
  cover?: unknown;
  migrated?: boolean;
  [key: string]: unknown;
}

export interface Point {
  x: number;
  y: number;
}
export interface Box extends Point {
  w: number;
  h: number;
}
type Fields = Record<string, unknown>;

/** 一条可撤销、可重做的清单级操作；from 是操作前，to 是操作后。 */
export type CanvasHistoryStep =
  | { kind: "move"; moves: { file: string; from: Point; to: Point }[]; anns?: { id: string; from: Point; to: Point }[] }
  | { kind: "resize"; file: string; from: Box; to: Box }
  | { kind: "transform"; boards: { file: string; from: Fields; to: Fields }[]; anns: { id: string; from: Fields; to: Fields }[] }
  | { kind: "rename"; file: string; from?: string; to?: string }
  | { kind: "print"; file: string; from?: string; to?: string }
  | { kind: "paper"; file: string; from?: unknown; to?: unknown }
  | { kind: "guides"; file: string; from?: unknown; to?: unknown }
  | { kind: "cover"; from?: unknown; to?: unknown }
  | { kind: "page-add"; page: DesignPage; first?: DesignPage }
  | { kind: "page-rename"; id: string; from: string; to: string; first?: DesignPage }
  | { kind: "ann-add" | "ann-delete"; spec: CanvasAnnotation; index: number }
  | { kind: "ann-move"; id: string; from: Point; to: Point }
  | { kind: "ann-resize"; id: string; from: unknown; to: unknown }
  | { kind: "ann-text"; id: string; from: unknown; to: unknown }
  | { kind: "ann-style"; id: string; from: Fields; to: Fields; caps?: { from?: Fields; to?: Fields } }
  | { kind: "ann-box" | "ann-path"; id: string; from: Fields; to: Fields }
  | { kind: "ann-color"; id: string; from: unknown; to: unknown; cssFrom?: Fields; cssTo?: Fields }
  | { kind: "ann-heads"; id: string; from: Fields; to: Fields }
  | { kind: "ann-css"; id: string; from: Fields; to: Fields; cropFrom?: unknown }
  | { kind: "ann-src"; id: string; from: { crop?: unknown; [key: string]: unknown }; to: unknown }
  | {
      kind: "ann-crop";
      id: string;
      from: unknown;
      to: unknown;
      cssFrom?: Fields;
      cssTo?: Fields;
      geomFrom?: Fields;
      geomTo?: Fields;
    }
  | { kind: "radius"; file: string; from: unknown; to: unknown }
  | { kind: "order"; from: string[]; to: string[] };

/** 默认的第一页。 */
export const defaultCanvasPage: Readonly<DesignPage> = Object.freeze({
  id: "page-1",
  name: "Page 1",
});

/** 只剩未改名的默认页时不写入 pages。 */
export const omitDefaultCanvasPage = (
  pages: DesignPage[],
  first: DesignPage | undefined,
): DesignPage[] | undefined =>
  first !== undefined && pages.length === 1 && pages[0].id === first.id && pages[0].name === first.name
    ? undefined
    : pages;

/** 两个对象里取值不同的键。 */
export const changedObjectKeys = (a?: Fields | null, b?: Fields | null): string[] =>
  [...new Set([...Object.keys(a ?? {}), ...Object.keys(b ?? {})])].filter((key) => a?.[key] !== b?.[key]);

/** 取出指定的键，缺失的键值为 undefined。 */
export const pickObjectKeys = (source: Fields | undefined, keys: string[]): Fields =>
  Object.fromEntries(keys.map((key) => [key, source?.[key]]));

/** 启动视图的比较键。 */
export const canvasLaunchViewKey = (launch?: CanvasLaunch): string =>
  launch === undefined ? "" : launch.view === "focused" ? "f:" + launch.file : "c:" + (launch.page ?? "");

/** 页面的新增与改名；无法应用时返回 null。 */
export function applyCanvasPageHistory(
  manifest: CanvasManifest,
  step: Extract<CanvasHistoryStep, { kind: "page-add" | "page-rename" }>,
  direction: HistoryDirection,
): { pages: DesignPage[] | undefined } | null {
  const pages = manifest.pages ?? [];
  const pagesOrFirst =
    pages.length > 0 ? pages : direction === "redo" && step.first !== undefined ? [step.first] : pages;
  if (step.kind === "page-add") {
    const exists = pages.some((page) => page.id === step.page.id);
    if (direction === "redo")
      return exists || pagesOrFirst.length >= maxDesignPages()
        ? null
        : {
            pages: [
              ...(pagesOrFirst.length > 0 || step.page.id === defaultCanvasPage.id ? pagesOrFirst : [defaultCanvasPage]),
              step.page,
            ],
          };
    const onThisPage = (item: unknown) => designPageId(item, pages) === step.page.id;
    return !exists || manifest.artboards.some(onThisPage) || (manifest.annotations ?? []).some(onThisPage)
      ? null
      : { pages: omitDefaultCanvasPage(pages.filter((page) => page.id !== step.page.id), step.first) };
  }
  const name = direction === "undo" ? step.from : step.to;
  const target = pagesOrFirst.find((page) => page.id === step.id);
  if (target === undefined || target.name === name) return null;
  const renamed = pagesOrFirst.map((page) => (page.id === step.id ? { ...page, name } : page));
  return { pages: direction === "undo" ? omitDefaultCanvasPage(renamed, step.first) : renamed };
}

/** 设置或清除某块画板的参考线。 */
export function updateArtboardGuides(manifest: CanvasManifest, file: string, guides: unknown): CanvasManifest {
  return {
    ...manifest,
    artboards: manifest.artboards.map((artboard) => {
      if (artboard.file !== file) return artboard;
      const { guides: _removed, ...rest } = artboard;
      return guides !== undefined ? { ...rest, guides } : rest;
    }),
  };
}

/** 只恢复这次操作改过的设置项，其余沿用当前值。 */
export function mergeChangedArtboardSettings(
  current?: Fields,
  before?: Fields,
  after?: Fields,
  restored?: Fields,
): Fields | undefined {
  const changed = new Set(changedObjectKeys(before, after));
  const merged: Fields = {};
  for (const key of PlatformFileContentBackgroundBackgroundColorOpacityValues as string[]) {
    const value = (changed.has(key) ? restored : current)?.[key];
    if (value !== undefined) merged[key] = value;
  }
  return Object.keys(merged).length > 0 ? merged : undefined;
}

/** 画板顺序变化的历史步骤，只记录位置变了的画板。 */
export function artboardOrderHistoryStep(
  before: CanvasArtboard[],
  after: CanvasArtboard[],
): Extract<CanvasHistoryStep, { kind: "order" }> {
  const moved = before.flatMap((artboard, index) => (after[index]?.file !== artboard.file ? [index] : []));
  return {
    kind: "order",
    from: moved.map((index) => before[index].file),
    to: moved.map((index) => after[index].file),
  };
}

/** 把历史步骤收窄到单个设置项；与当前值相同则返回 null。 */
export function filterSettingHistoryStep<S extends { from?: Fields }>(
  step: S,
  property: string,
  current?: Fields,
): (S & { from: Fields | undefined; to: Fields | undefined }) | null {
  const only = (source?: Fields): Fields | undefined => {
    const value = source?.[property];
    if (value === undefined) return undefined;
    const picked: Fields = {};
    picked[property] = value;
    return picked;
  };
  const [from, to] = [only(step.from), only(current)];
  return from?.[property] === to?.[property] ? null : { ...step, from, to };
}

type Anns = CanvasAnnotation[];
const mapAnnotations = (manifest: CanvasManifest, update: (annotation: CanvasAnnotation) => CanvasAnnotation): CanvasManifest => ({
  ...manifest,
  annotations: (manifest.annotations ?? []).map(update),
});

/** 应用一条历史步骤；"nothing" 表示没有变化，"full" 表示批注已满。 */
export function applyCanvasManifestHistory(
  manifest: CanvasManifest,
  step: CanvasHistoryStep,
  direction: HistoryDirection,
): CanvasManifest | "nothing" | "full" {
  const undoing = direction === "undo";
  switch (step.kind) {
    case "move": {
      const boardTargets = new Map(step.moves.map((move) => [move.file, undoing ? move.from : move.to]));
      const annTargets = new Map((step.anns ?? []).map((ann) => [ann.id, undoing ? ann.from : ann.to]));
      return {
        ...manifest,
        artboards: manifest.artboards.map((artboard) => {
          const target = boardTargets.get(artboard.file);
          return target ? { ...artboard, x: target.x, y: target.y } : artboard;
        }),
        ...(annTargets.size > 0
          ? {
              annotations: (manifest.annotations ?? []).map((annotation) => {
                const target = annTargets.get(annotation.id);
                return target ? moveAnnotation(annotation, target.x, target.y) : annotation;
              }),
            }
          : {}),
      };
    }
    case "resize": {
      const side = undoing ? step.from : step.to;
      const changed = Object.fromEntries(
        (["x", "y", "w", "h"] as const).filter((key) => step.from[key] !== step.to[key]).map((key) => [key, side[key]]),
      );
      return {
        ...manifest,
        artboards: manifest.artboards.map((artboard) => (artboard.file === step.file ? { ...artboard, ...changed } : artboard)),
      };
    }
    case "transform": {
      const side = undoing ? "from" : "to";
      const boardTargets = new Map(step.boards.map((board) => [board.file, board[side]]));
      const annTargets = new Map(step.anns.map((ann) => [ann.id, ann[side]]));
      return {
        ...manifest,
        artboards: manifest.artboards.map((artboard) => {
          const target = boardTargets.get(artboard.file);
          return target ? { ...artboard, ...target } : artboard;
        }),
        ...(annTargets.size > 0
          ? {
              annotations: (manifest.annotations ?? []).map((annotation) => {
                const target = annTargets.get(annotation.id);
                return target ? { ...annotation, ...target } : annotation;
              }),
            }
          : {}),
      };
    }
    case "rename": {
      const title = undoing ? step.from : step.to;
      return {
        ...manifest,
        artboards: manifest.artboards.map((artboard) =>
          artboard.file === step.file ? { ...artboard, ...(title ? { title } : { title: undefined }) } : artboard,
        ),
      };
    }
    case "print": {
      const print = undoing ? step.from : step.to;
      return {
        ...manifest,
        artboards: manifest.artboards.map((artboard) => {
          if (artboard.file !== step.file) return artboard;
          const { print: _removed, ...rest } = artboard;
          return print === "flow" ? { ...rest, print: "flow" } : rest;
        }),
      };
    }
    case "paper": {
      const paper = undoing ? step.from : step.to;
      return {
        ...manifest,
        artboards: manifest.artboards.map((artboard) => {
          if (artboard.file !== step.file) return artboard;
          const { paper: _removed, ...rest } = artboard;
          return paper ? { ...rest, paper } : rest;
        }),
      };
    }
    case "guides":
      return updateArtboardGuides(manifest, step.file, undoing ? step.from : step.to);
    case "cover":
      return { ...manifest, cover: undoing ? step.from : step.to };
    case "page-add":
    case "page-rename": {
      const result = applyCanvasPageHistory(manifest, step, direction);
      return result === null ? "nothing" : { ...manifest, pages: result.pages };
    }
    case "ann-add":
    case "ann-delete": {
      const annotations = manifest.annotations ?? [];
      if ((step.kind === "ann-add") == (direction === "redo")) {
        if (annotations.some((annotation) => annotation.id === step.spec.id)) return "nothing";
        if (annotations.length >= maxAnnotations) return "full";
        const index = step.kind === "ann-delete" ? Math.min(step.index, annotations.length) : annotations.length;
        const next: Anns = [...annotations];
        next.splice(index, 0, step.spec);
        return { ...manifest, annotations: next };
      }
      return { ...manifest, annotations: annotations.filter((annotation) => annotation.id !== step.spec.id) };
    }
    case "ann-move": {
      const target = undoing ? step.from : step.to;
      return mapAnnotations(manifest, (annotation) =>
        annotation.id === step.id && !isShapeAnnotation(annotation) ? { ...annotation, x: target.x, y: target.y } : annotation,
      );
    }
    case "ann-resize": {
      const width = undoing ? step.from : step.to;
      return mapAnnotations(manifest, (annotation) =>
        annotation.id === step.id && !isShapeAnnotation(annotation) ? { ...annotation, w: width } : annotation,
      );
    }
    case "ann-text": {
      const text = undoing ? step.from : step.to;
      return mapAnnotations(manifest, (annotation) =>
        annotation.id === step.id && !isShapeAnnotation(annotation) ? { ...annotation, text } : annotation,
      );
    }
    case "ann-style": {
      const [style, caps] = undoing ? [step.from, step.caps?.from] : [step.to, step.caps?.to];
      return mapAnnotations(manifest, (annotation) =>
        annotation.id === step.id && !isShapeAnnotation(annotation)
          ? {
              ...updateAnnotationTextStyle(annotation, {
                ...annotationTextStyle(annotation),
                ...pickObjectKeys(style, changedObjectKeys(step.from, step.to)),
              }),
              ...caps,
            }
          : annotation,
      );
    }
    case "ann-box":
    case "ann-path": {
      const side = undoing ? step.from : step.to;
      const geometry = step.kind === "ann-path" || "x2" in side ? side : pickObjectKeys(side, changedObjectKeys(step.from, step.to));
      return mapAnnotations(manifest, (annotation) =>
        annotation.id === step.id && isShapeAnnotation(annotation) ? { ...annotation, ...geometry } : annotation,
      );
    }
    case "ann-color": {
      const color = undoing ? step.from : step.to;
      const cssSide = undoing ? step.cssFrom : step.cssTo;
      const hasCss = step.cssFrom !== undefined || step.cssTo !== undefined;
      return mapAnnotations(manifest, (annotation) =>
        annotation.id === step.id && isShapeAnnotation(annotation)
          ? hasCss
            ? updateAnnotationCss(
                updateAnnotationColor(annotation, color),
                mergeChangedArtboardSettings(annotation.css, step.cssFrom, step.cssTo, cssSide),
              )
            : updateAnnotationColor(annotation, color)
          : annotation,
      );
    }
    case "ann-heads": {
      const heads = pickObjectKeys(undoing ? step.from : step.to, changedObjectKeys(step.from, step.to));
      return mapAnnotations(manifest, (annotation) =>
        annotation.id === step.id && (annotation.kind === "line" || annotation.kind === "arrow")
          ? updateAnnotationArrowHeads(annotation, { ...annotationArrowHeads(annotation), ...heads })
          : annotation,
      );
    }
    case "ann-css":
    case "ann-src": {
      const side = undoing ? step.from : step.to;
      const withCrop = (annotation: CanvasAnnotation, crop: unknown) =>
        annotation.kind === "image" ? updateAnnotationCrop(annotation, crop) : annotation;
      return mapAnnotations(manifest, (annotation) => {
        if (annotation.id !== step.id || !isShapeAnnotation(annotation)) return annotation;
        if (step.kind === "ann-src")
          return annotation.kind === "image"
            ? updateAnnotationCrop(uploadedVideoAnnotation(annotation, side), (side as { crop?: unknown }).crop)
            : annotation;
        const updated = updateAnnotationCss(annotation, mergeChangedArtboardSettings(annotation.css, step.from, step.to, side as Fields));
        return step.cropFrom !== undefined ? withCrop(updated, undoing ? step.cropFrom : undefined) : updated;
      });
    }
    case "ann-crop": {
      const hasCss = step.cssFrom !== undefined || step.cssTo !== undefined;
      const geometry = undoing ? step.geomFrom : step.geomTo;
      return mapAnnotations(manifest, (annotation) =>
        annotation.id === step.id && annotation.kind === "image"
          ? updateAnnotationCrop(
              {
                ...(hasCss
                  ? updateAnnotationCss(
                      annotation,
                      mergeChangedArtboardSettings(annotation.css, step.cssFrom, step.cssTo, undoing ? step.cssFrom : step.cssTo),
                    )
                  : annotation),
                ...pickObjectKeys(geometry, changedObjectKeys(step.geomFrom, step.geomTo)),
              },
              undoing ? step.from : step.to,
            )
          : annotation,
      );
    }
    case "radius":
      return updateArtboardRadius(manifest, step.file, undoing ? step.from : step.to);
    case "order": {
      // 目标位置：文件名 -> 它在 from/to 列表里的序号
      const rank = new Map((undoing ? step.from : step.to).map((file, index) => [file, index]));
      // 每页里被调整的画板位置（页内重排，不跨页）
      const slotsByPage = new Map<unknown, number[]>();
      manifest.artboards.forEach((artboard, index) => {
        if (rank.has(artboard.file)) {
          const pageId = designPageId(artboard, manifest.pages);
          slotsByPage.set(pageId, [...(slotsByPage.get(pageId) ?? []), index]);
        }
      });
      const reordered = [...manifest.artboards];
      for (const slots of slotsByPage.values()) {
        const sorted = slots
          .map((slot) => manifest.artboards[slot])
          .sort((a, b) => (rank.get(a.file) as number) - (rank.get(b.file) as number));
        slots.forEach((slot, position) => (reordered[slot] = sorted[position]));
      }
      return reordered.every((artboard, index) => artboard === manifest.artboards[index])
        ? "nothing"
        : { ...manifest, artboards: reordered };
    }
    default:
      throw new Error("this kind of step cannot be undone or redone: " + String((step as { kind?: unknown }).kind));
  }
}

/** 恢复旧清单时，补回新清单缺失的元数据。 */
export function mergeMissingCanvasManifestMetadata(manifest: CanvasManifest, previous: CanvasManifest): CanvasManifest {
  let merged: CanvasManifest =
    "launch" in manifest || previous.launch === undefined ? manifest : { ...manifest, launch: previous.launch };
  if (!("annotations" in merged) && previous.annotations !== undefined)
    merged = { ...merged, annotations: previous.annotations };
  if (!("pages" in merged) && previous.pages !== undefined) merged = { ...merged, pages: previous.pages };
  if (!("migrated" in merged) && previous.migrated === true) merged = { ...merged, migrated: true };
  if (!("cover" in merged) && previous.cover !== undefined) merged = { ...merged, cover: previous.cover };
  if ("cover" in merged && validCoverArtboard(merged.cover, merged.artboards) === undefined) {
    merged = { ...merged };
    delete merged.cover;
  }
  return merged;
}

/** 删除画板或页面后，启动视图若会随之改变则返回规整后的启动视图，否则返回 undefined。 */
export function repairCanvasLaunchAfterDeletion(
  manifest: CanvasManifest,
  deletedFiles: Set<string>,
  deletedPageId?: string,
): CanvasLaunch | undefined {
  const launch = normalizeDesignLaunch(manifest.launch, manifest.artboards, manifest.pages);
  if (launch === undefined) return undefined;
  const afterDeletion = normalizeDesignLaunch(
    launch,
    manifest.artboards.filter((artboard) => !deletedFiles.has(artboard.file)),
    deletedPageId !== undefined ? (manifest.pages ?? []).filter((page) => page.id !== deletedPageId) : manifest.pages,
  );
  return canvasLaunchViewKey(launch) === canvasLaunchViewKey(afterDeletion) ? undefined : launch;
}

/** 历史操作的播报方式。 */
export function canvasHistoryAnnouncementMode(
  direction: HistoryDirection,
  fromPartner: boolean,
  silent: boolean,
): "silent" | "partner" | "say" {
  return silent ? "silent" : direction === "redo" && fromPartner ? "partner" : "say";
}

/** 恢复旧清单时，只有同为整画布且不带页面的启动视图才能沿用。 */
export function compatibleRestoredCanvasLaunch(launch?: CanvasLaunch, previous?: CanvasLaunch): CanvasLaunch | undefined {
  return launch === undefined ||
    previous === undefined ||
    (launch.view === "canvas" && previous.view === "canvas" && previous.page === undefined)
    ? launch
    : undefined;
}

/**
 * 三方合并：在当前清单上叠加"撤销前 -> 撤销后"的差异，
 * 保留别人在此期间新增或修改的画板、批注与页面。
 */
export function reconcileCanvasManifestHistory(
  manifest: CanvasManifest,
  before: CanvasManifest,
  after: CanvasManifest,
): CanvasManifest {
  const mergeList = <T>(
    current: T[] = [],
    beforeList: T[] = [],
    afterList: T[] = [],
    keyOf: (item: T) => string,
    limit = Infinity,
  ): T[] => {
    if (structurallyEqual(current, beforeList)) return [...afterList];
    const beforeByKey = new Map(beforeList.map((item) => [keyOf(item), item]));
    const afterByKey = new Map(afterList.map((item) => [keyOf(item), item]));
    const currentKeys = new Set(current.map(keyOf));
    const kept = current.flatMap((item) => {
      const [beforeItem, afterItem] = [beforeByKey.get(keyOf(item)), afterByKey.get(keyOf(item))];
      return beforeItem === undefined
        ? [item]
        : afterItem === undefined
          ? []
          : [structurallyEqual(item, beforeItem) ? afterItem : item];
    });
    const added = afterList
      .filter((item) => !beforeByKey.has(keyOf(item)) && !currentKeys.has(keyOf(item)))
      .slice(0, Math.max(0, limit - kept.length));
    return [...kept, ...added];
  };
  const artboards = mergeList(manifest.artboards, before.artboards, after.artboards, (item) => item.file);
  const annotations = mergeList(manifest.annotations, before.annotations, after.annotations, (item) => item.id, maxAnnotations);
  const pages = mergeList(manifest.pages, before.pages, after.pages, (item) => item.id, maxDesignPages());
  const mergeField = (key: string): unknown =>
    structurallyEqual(manifest[key] ?? null, before[key] ?? null) ? after[key] : manifest[key];
  const merged: Record<string, unknown> = {
    artboards,
    annotations: annotations.length > 0 ? annotations : undefined,
    pages: pages.length > 0 ? pages : undefined,
    launch: mergeField("launch"),
    cover: validCoverArtboard(mergeField("cover"), artboards) ?? validCoverArtboard(after.cover, artboards),
    migrated: manifest.migrated === true || after.migrated === true ? true : undefined,
  };
  return Object.fromEntries(Object.entries(merged).filter(([, entryValue]) => entryValue !== undefined)) as CanvasManifest;
}
