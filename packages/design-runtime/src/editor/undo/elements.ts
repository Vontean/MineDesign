import { applyPendingUndoEntry, type PropUndoEntry, type ScriptUndoEntry, type UndoDirection, type UndoEntry, type UndoHistoryState, type UndoLiveContext } from "./history";
import { blobAssetPathPattern, isEmulatorBlobUrl } from "../../platform/image-upload";

/** 元素模型里撤销需要的能力：序列化、按快照重建、判断结构是否相同。 */
export interface UndoElementModel {
  serialize(): string;
  rebuild(snapshot: string): UndoElementModel;
  sameSkeleton(other: UndoElementModel): boolean;
}

/** 元素撤销用的会话字段。 */
export interface ElementUndoState extends UndoHistoryState {
  model: UndoElementModel;
  liveStampsStale: boolean;
  previewBaseline?: unknown;
}

export type ElementUndoResult =
  | { kind: "template" }
  | { kind: "prop"; prop: string; liveValue: string | undefined; episode: "closed" | "reopened" | null }
  | { kind: "script"; js: string | undefined };

/** 粘贴时允许的属性名。 */
export const UndoElementsSrcWidthHeightSet: ReadonlySet<string> = new Set([
  "src",
  "width",
  "height",
  "srcset",
  "data-dc-drop",
]);
/** 相对资源路径，如 ./img-1.png。 */
export const UndoElementsAZaZAZaZPattern = /^\.\/[A-Za-z0-9_-][A-Za-z0-9_.-]{0,199}$/;
/** 1 到 5 位的整数尺寸。 */
export const UndoElementsPattern = /^\d{1,5}$/;
/** src 是否指向画板内的相对资源、上传资源或模拟器 blob。 */
export const UndoElementsTest = (value: string): boolean =>
  UndoElementsAZaZAZaZPattern.test(value) ||
  blobAssetPathPattern.test(value) ||
  isEmulatorBlobUrl(value) ||
  false;

/** 从撤销或重做栈弹出一项并应用；栈空返回 null。 */
export function applyElementUndo(
  state: ElementUndoState,
  direction: UndoDirection,
  live?: UndoLiveContext,
): ElementUndoResult | null {
  const from = direction === "undo" ? state.undo : state.redo;
  const to = direction === "undo" ? state.redo : state.undo;
  const entry: UndoEntry | undefined = from.pop();
  if (entry == null) return null;
  if (typeof entry == "string") {
    to.push(state.model.serialize());
    state.model = state.model.rebuild(entry);
    state.liveStampsStale = false;
    state.previewBaseline = undefined;
    return { kind: "template" };
  }
  const applied = applyPendingUndoEntry(state, entry as PropUndoEntry | ScriptUndoEntry, direction, live);
  if (applied == null) {
    if (direction === "undo") state.redo = [];
    return null;
  }
  to.push(applied.twin);
  return applied.result;
}

/** 新旧模型的历史能否沿用：同一个、结构相同可保留、否则清空。 */
export function modelHistoryCompatibility(
  current: UndoElementModel,
  next: UndoElementModel,
): "same" | "keep" | "clear" {
  return current === next ? "same" : next.sameSkeleton(current) ? "keep" : "clear";
}

/** 粘贴的属性编辑是否都在白名单内且值合法。 */
export function validatePastedAttributeEdits(edits: Record<string, string | null | undefined>): boolean {
  for (const [name, value] of Object.entries(edits))
    if (
      !UndoElementsSrcWidthHeightSet.has(name) ||
      (name === "src" && value != null && !UndoElementsTest(value)) ||
      ((name === "srcset" || name === "data-dc-drop") && value != null) ||
      (name !== "src" && value != null && !UndoElementsPattern.test(value))
    )
      return false;
  return true;
}
