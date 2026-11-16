import type {
  JsonMergeValue,
  JsonValue,
  JsonRecord,
  MergeChoice,
  TokenMergeResult,
} from "../contracts/files-core";
import { mergeOrderedStringList } from "../editor/index-file-store";
import { DESIGN_SYSTEM_PATHS } from "../model/file-policy";
import { parseTokens, serializeTokens } from "../model/tokens";

/** 数组元素用哪个字段识别身份，按这个顺序取第一个在所有版本里都唯一的字符串字段 */
export const MERGE_ARRAY_ID_FIELDS = ["id", "name", "key", "file"];

export function isPlainMergeRecord(value: unknown): value is JsonRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/** 按序列化结果比较，键序不同视为不同 */
export function serializedValuesEqual(
  first: JsonMergeValue,
  second: JsonMergeValue,
): boolean {
  return JSON.stringify(first) === JSON.stringify(second);
}

export function cloneJsonValue<T extends JsonMergeValue>(value: T): T {
  return value === undefined ? value : JSON.parse(JSON.stringify(value));
}

export function isTokenFilePath(path: string): boolean {
  return path === DESIGN_SYSTEM_PATHS.tokens;
}

/** 各版本的数组都是记录、且某个字段在每个数组里都是不重复的字符串时，返回该字段名 */
export function mergeArrayIdentityField(...arrays: JsonMergeValue[]) {
  const presentArrays = arrays.filter(
    (value: JsonMergeValue): value is JsonValue[] => Array.isArray(value),
  );
  if (
    presentArrays.length === 0 ||
    presentArrays.every((items: JsonValue[]): boolean => items.length === 0)
  ) {
    return null;
  }
  for (const field of MERGE_ARRAY_ID_FIELDS) {
    if (
      presentArrays.every((items: JsonValue[]): boolean => {
        const seen = new Set<string>();
        for (const item of items) {
          if (
            !isPlainMergeRecord(item) ||
            typeof item[field] !== "string" ||
            seen.has(item[field])
          ) {
            return false;
          }
          seen.add(item[field]);
        }
        return true;
      })
    ) {
      return field;
    }
  }
  return null;
}

/**
 * JSON 三方合并：两边相同或只有一边改动时取改动的一边；对象逐键合并；
 * 有身份字段的数组按元素合并；其余情况记为冲突（path 以 / 分隔），按 choice 取一边。
 */
export function mergeJsonValueThreeWays(
  base: JsonMergeValue,
  mine: JsonMergeValue,
  theirs: JsonMergeValue,
  path: string,
  conflicts: string[],
  choice: MergeChoice,
): JsonMergeValue {
  if (serializedValuesEqual(mine, theirs)) {
    return mine;
  }
  if (serializedValuesEqual(base, mine)) {
    return cloneJsonValue(theirs);
  }
  if (serializedValuesEqual(base, theirs)) {
    return mine;
  }
  if (
    isPlainMergeRecord(mine) &&
    isPlainMergeRecord(theirs) &&
    (isPlainMergeRecord(base) || base === undefined)
  ) {
    const baseRecord = base ?? {};
    const merged: JsonRecord = {};
    for (const key of new Set([...Object.keys(mine), ...Object.keys(theirs)])) {
      const inMine = Object.hasOwn(mine, key);
      const inTheirs = Object.hasOwn(theirs, key);
      const value = mergeJsonValueThreeWays(
        Object.hasOwn(baseRecord, key) ? baseRecord[key] : undefined,
        inMine ? mine[key] : undefined,
        inTheirs ? theirs[key] : undefined,
        path === "" ? key : path + "/" + key,
        conflicts,
        choice,
      );
      if (value !== undefined) {
        // 用 defineProperty 保证 "__proto__" 这类键也作为自有属性写入
        Object.defineProperty(merged, key, {
          value,
          enumerable: true,
          writable: true,
          configurable: true,
        });
      }
    }
    return merged;
  }
  if (
    Array.isArray(mine) &&
    Array.isArray(theirs) &&
    (Array.isArray(base) || base === undefined)
  ) {
    const identityField = mergeArrayIdentityField(base, mine, theirs);
    if (identityField !== null) {
      return mergeIdentifiedArrayThreeWays(
        (base ?? []) as JsonRecord[],
        mine as JsonRecord[],
        theirs as JsonRecord[],
        identityField,
        path,
        conflicts,
        choice,
      );
    }
  }
  conflicts.push(path);
  if (choice === "theirs") {
    return cloneJsonValue(theirs);
  } else {
    return mine;
  }
}

/** 按身份字段逐元素三方合并数组；顺序按三方列表合并，漏掉的元素追加在末尾 */
export function mergeIdentifiedArrayThreeWays(
  base: JsonRecord[],
  mine: JsonRecord[],
  theirs: JsonRecord[],
  identityField: string,
  path: string,
  conflicts: string[],
  choice: MergeChoice,
) {
  const indexByIdentity = (records: JsonRecord[]) =>
    new Map(
      records.map((record: JsonRecord) => [
        record[identityField] as string,
        record,
      ]),
    );
  const baseById = indexByIdentity(base);
  const mineById = indexByIdentity(mine);
  const theirsById = indexByIdentity(theirs);
  const mergedById = new Map<string, JsonMergeValue>();
  for (const id of new Set([...mineById.keys(), ...theirsById.keys()])) {
    const baseEntry = baseById.get(id);
    const mineEntry = mineById.get(id);
    const theirsEntry = theirsById.get(id);
    const entryPath: string = path + "/" + id;
    // 两边都有
    if (mineEntry !== undefined && theirsEntry !== undefined) {
      if (
        serializedValuesEqual(mineEntry, theirsEntry) ||
        serializedValuesEqual(baseEntry, theirsEntry)
      ) {
        mergedById.set(id, mineEntry);
      } else if (serializedValuesEqual(baseEntry, mineEntry)) {
        mergedById.set(id, cloneJsonValue(theirsEntry));
      } else {
        conflicts.push(entryPath);
        mergedById.set(
          id,
          choice === "theirs" ? cloneJsonValue(theirsEntry) : mineEntry,
        );
      }
      continue;
    }
    // 只有一边有
    const present = mineEntry ?? theirsEntry;
    if (baseEntry === undefined) {
      mergedById.set(
        id,
        mineEntry !== undefined ? present : cloneJsonValue(present),
      );
      continue;
    }
    if (serializedValuesEqual(baseEntry, present)) {
      continue;
    }
    // 一边删除、另一边修改：冲突，保留与 choice 一致的一边
    conflicts.push(entryPath);
    if (mineEntry !== undefined ? choice === "mine" : choice === "theirs") {
      mergedById.set(
        id,
        mineEntry !== undefined ? present : cloneJsonValue(present),
      );
    }
  }
  const idsOf = (records: JsonRecord[]) =>
    records.map((record: JsonRecord) => record[identityField] as string);
  const order = mergeOrderedStringList(
    idsOf(base),
    idsOf(mine),
    idsOf(theirs),
  ).filter((id: string) => mergedById.has(id));
  for (const id of mergedById.keys()) {
    if (!order.includes(id)) {
      order.push(id);
    }
  }
  return order.map((id: string) => mergedById.get(id));
}

export function mergeJsonThreeWays(
  base: JsonMergeValue,
  mine: JsonMergeValue,
  theirs: JsonMergeValue,
  choice: MergeChoice = "mine",
) {
  const conflicts: string[] = [];
  return {
    value: mergeJsonValueThreeWays(base, mine, theirs, "", conflicts, choice),
    conflicts,
  };
}

/** 读出 tokens 文本并规整后再序列化的 JSON；strict 时有被丢弃的内容就返回 null */
export function parseMergeableTokens(
  text: string,
  strict: boolean,
): JsonMergeValue | null {
  const report = {
    dropped: [],
    warnings: [],
  };
  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    return null;
  }
  if (!isPlainMergeRecord(parsed)) {
    return null;
  }
  const tokens = parseTokens(parsed, report);
  if (strict && report.dropped.length > 0) {
    return null;
  }
  try {
    return JSON.parse(serializeTokens(tokens));
  } catch {
    return null;
  }
}

/** tokens.json 的三方合并；choice 为 "mine" 时有冲突就失败，为 "theirs" 时取对方并在 kept 返回冲突路径 */
export function mergeTokenFileThreeWays(
  baseText: string,
  mineText: string,
  theirsText: string,
  choice: MergeChoice = "mine",
): TokenMergeResult {
  if (mineText === theirsText) {
    return {
      ok: true,
      text: mineText,
      kept: [],
    };
  }
  const base = parseMergeableTokens(baseText, false);
  const mine = parseMergeableTokens(mineText, true);
  const theirs = parseMergeableTokens(theirsText, true);
  if (base === null || mine === null || theirs === null) {
    return {
      ok: false,
      why: "unreadable",
      conflicts: [],
    };
  }
  const merged = mergeJsonThreeWays(base, mine, theirs, choice);
  if (merged.conflicts.length > 0 && choice === "mine") {
    return {
      ok: false,
      why: "conflict",
      conflicts: merged.conflicts,
    };
  }
  const report = {
    dropped: [],
    warnings: [],
  };
  const normalized = parseTokens(merged.value, report);
  if (report.dropped.length > 0) {
    return {
      ok: false,
      why: "unreadable",
      conflicts: [],
    };
  }
  return {
    ok: true,
    text: serializeTokens(normalized),
    kept: choice === "theirs" ? merged.conflicts : [],
  };
}

/** 目前只支持 tokens.json；其他文件返回 null */
export function mergeSupportedFileThreeWays(
  path: string,
  base: string,
  mine: string,
  theirs: string,
  choice: MergeChoice = "mine",
): TokenMergeResult | null {
  if (isTokenFilePath(path)) {
    return mergeTokenFileThreeWays(base, mine, theirs, choice);
  } else {
    return null;
  }
}

/** 文本相同，或同为 tokens.json 且规整后的内容相同 */
export function fileContentsSemanticallyEqual(
  path: string,
  left: string,
  right: string,
) {
  if (left === right) {
    return true;
  }
  if (!isTokenFilePath(path)) {
    return false;
  }
  const leftTokens = parseMergeableTokens(left, false);
  const rightTokens = parseMergeableTokens(right, false);
  return (
    leftTokens !== null &&
    rightTokens !== null &&
    serializedValuesEqual(leftTokens, rightTokens)
  );
}

/** 冲突路径的最后一段，去重后最多列 3 个，其余写成 "and N more" */
export function summarizeConflictNames(paths: readonly string[]) {
  const names = [
    ...new Set(
      paths
        .map((path: string) => path.slice(path.lastIndexOf("/") + 1))
        .filter((name: string): boolean => name !== ""),
    ),
  ];
  if (names.length <= 3) {
    return names.join(", ");
  } else {
    return (
      names.slice(0, 3).join(", ") +
      " and " +
      String(names.length - 3) +
      " more"
    );
  }
}

/**
 * 远端文本是否丢了本地的修改：本地有新增行而远端没带上，
 * 或本地删掉的行在远端又出现时视为丢失（按行计数比较）。
 */
export function remoteTextLostLocalLines(
  base: string,
  mine: string,
  theirs: string,
): boolean {
  if (theirs === mine || mine === base) {
    return false;
  }
  if (theirs === base) {
    return true;
  }
  const lineCounts = (text: string) => {
    const counts = new Map<string, number>();
    for (const line of text.split("\n")) {
      counts.set(line, (counts.get(line) ?? 0) + 1);
    }
    return counts;
  };
  const baseLines = lineCounts(base);
  const mineLines = lineCounts(mine);
  const theirsLines = lineCounts(theirs);
  let localAdditionsKept = 0;
  for (const [line, count] of mineLines) {
    const added = count - (baseLines.get(line) ?? 0);
    if (added > 0) {
      localAdditionsKept += Math.min(
        added,
        Math.max(
          0,
          (theirsLines.get(line) ?? 0) - (baseLines.get(line) ?? 0),
        ),
      );
    }
  }
  if (localAdditionsKept > 0) {
    return false;
  }
  let localRemovalsLost = 0;
  for (const [line, count] of baseLines) {
    const removed = count - (mineLines.get(line) ?? 0);
    if (removed > 0) {
      localRemovalsLost += Math.min(
        removed,
        Math.max(
          0,
          (theirsLines.get(line) ?? 0) - (mineLines.get(line) ?? 0),
        ),
      );
    }
  }
  if (localRemovalsLost > 0) {
    return true;
  }
  for (const [line, count] of baseLines) {
    if ((theirsLines.get(line) ?? 0) < count) {
      return false;
    }
  }
  return true;
}

/** 为冲突的文件找一个不重名的副本路径（x-copy.ext、x-copy-2.ext…），最多试 20 个 */
export function availableConflictCopyName(
  path: string,
  available: (path: string) => boolean,
): string | null {
  const slash = path.lastIndexOf("/");
  const folder = path.slice(0, slash + 1);
  const name = path.slice(slash + 1);
  const extension = /\.d\.ts$/i.test(name)
    ? name.slice(-5)
    : name.lastIndexOf(".") > 0
      ? name.slice(name.lastIndexOf("."))
      : "";
  const stem = name.slice(0, name.length - extension.length);
  for (let count = 1; count <= 20; count++) {
    const candidate =
      folder +
      stem +
      (count === 1 ? "-copy" : "-copy-" + String(count)) +
      extension;
    if (available(candidate)) {
      return candidate;
    }
  }
  return null;
}
