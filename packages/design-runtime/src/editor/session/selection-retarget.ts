import type { Dynamic } from "../../runtime-types";

/** 判断两个 tid 列表是否逐项相同。 */
function sameTids(left?: Dynamic, right?: Dynamic): boolean {
  if (left === right) return true;
  if (!left || !right || left.length !== right.length) return false;
  return left.every((tid: Dynamic, index: number): boolean => tid === right[index]);
}

/**
 * 模型替换后，把根画板上的当前选区改指向新的 tid 列表。
 * 非根画板选区或空列表返回 null（不重定向）；`changed` 表示 tid 与原来不同。
 */
function retargetedSelection(
  previous: Dynamic,
  rootName: string,
  relocatedTids: Dynamic,
  tagOfLast: (tid: Dynamic) => Dynamic,
): { selection: Dynamic; changed: boolean } | null {
  if (previous?.name !== rootName || relocatedTids.length === 0) return null;
  return {
    selection: {
      ...previous,
      tids: relocatedTids,
      tag: tagOfLast(relocatedTids[relocatedTids.length - 1]) ?? previous.tag,
    },
    changed: !sameTids(previous.tids, relocatedTids),
  };
}

/** document 捕获 keydown：仅修饰键或长按重复不消耗 picker 选区同步。 */
function keyConsumesSelectionSync(
  keyEvent: { key: string; repeat?: boolean },
  modifierOnlyKeys: { has(key: string): boolean },
): boolean {
  return !(modifierOnlyKeys.has(keyEvent.key) || keyEvent.repeat);
}

export { keyConsumesSelectionSync, retargetedSelection };
