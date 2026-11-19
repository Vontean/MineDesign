import type {
  FileIndexDelta,
  FileMergeOptions,
  FileMutation,
  FileMutationBatch,
  IndexPresentationDelta,
  IndexPresentationPatch,
  JsonMergeValue,
  JsonRecord,
  MergeSchema,
} from "../contracts/files-core";
import type { FileTable, FilesIndex } from "../contracts";
import {
  assetFileIndexAddress,
  buildFilesIndex,
  FILES_INDEX_MERGE_SCHEMA,
  projectFilePath,
  projectFilesForSave,
  relativeProjectFilePath,
  restoreFilesFromIndex,
} from "./files-index";
import {
  cloneMergeValue,
  mergeOrderedStringList,
  mergeValuesEqual,
} from "./index-file-store";

/** 存盘用的项目文件，键改成相对路径 */
export function relativeProjectFilesForMerge(
  files: FileTable,
): Map<string, string> {
  const entries = new Map<string, string>();
  for (const [path, content] of projectFilesForSave(files)) {
    entries.set(relativeProjectFilePath(path)!, content);
  }
  return entries;
}

export function isFilesMergeObject(candidate: unknown): candidate is JsonRecord {
  return typeof candidate === "object" && candidate !== null && !Array.isArray(candidate);
}

export function isFilesMergeStringArray(candidate: unknown): candidate is string[] {
  return (
    Array.isArray(candidate) &&
    candidate.every((item: unknown): boolean => typeof item === "string")
  );
}

export function supportsDroppedPaths(document: {
  dropPaths?: unknown;
}): boolean {
  return typeof document.dropPaths === "function";
}

/** subset 在 order 中出现的顺序，是否与它自身的顺序一致 */
export function isOrderSubsequence(
  order: readonly string[],
  subset: readonly string[],
) {
  const subsetItems = new Set(subset);
  const orderItems = new Set(order);
  return mergeValuesEqual(
    order.filter((item: string) => subsetItems.has(item)),
    subset.filter((item: string) => orderItems.has(item)),
  );
}

/** 取 key 对应的子结构：先看 schema 声明，再按各版本实际的值推断 */
export function resolveFilesMergeSchema(
  schema: MergeSchema | undefined,
  key: string,
  ...schemaValues: JsonMergeValue[]
): MergeSchema {
  if (schema?.kind === "map") {
    const declared =
      schema.keys !== undefined && Object.hasOwn(schema.keys, key)
        ? schema.keys[key]
        : undefined;
    if (declared !== undefined) {
      return declared;
    }
    if (schema.of !== undefined) {
      return schema.of;
    }
  }
  const present = schemaValues.filter(
    (mergeValue: JsonMergeValue): boolean => mergeValue !== undefined,
  );
  if (present.length > 0 && present.every(isFilesMergeObject)) {
    return {
      kind: "map",
    };
  }
  if (present.length > 0 && present.every(isFilesMergeStringArray)) {
    return {
      kind: "list",
    };
  }
  return {
    kind: "leaf",
  };
}

/**
 * 以对方（theirs）为准合并索引，但保留本地（ours）相对 base 的改动。
 * 与本地改动冲突、需要取对方的路径记入 kept。
 */
export function mergeFilesIndexKeepingLocal(
  base: JsonMergeValue,
  ours: JsonMergeValue,
  theirs: JsonMergeValue,
  schema: MergeSchema,
  path: string,
  kept: string[],
): JsonMergeValue {
  if (mergeValuesEqual(ours, base) || mergeValuesEqual(theirs, ours)) {
    return theirs;
  }
  if (mergeValuesEqual(theirs, base)) {
    return cloneMergeValue(ours);
  }
  if (
    schema.kind === "map" &&
    isFilesMergeObject(theirs) &&
    (isFilesMergeObject(base) || base === undefined) &&
    (isFilesMergeObject(ours) || ours === undefined) &&
    (isFilesMergeObject(base) || isFilesMergeObject(ours))
  ) {
    const baseRecord = base ?? {};
    const oursRecord = ours ?? {};
    const merged: JsonRecord = {};
    const own = (record: JsonRecord, key: string) =>
      Object.hasOwn(record, key) ? record[key] : undefined;
    for (const key of new Set([
      ...Object.keys(theirs),
      ...Object.keys(oursRecord),
      ...Object.keys(baseRecord),
    ])) {
      const value = mergeFilesIndexKeepingLocal(
        own(baseRecord, key),
        own(oursRecord, key),
        own(theirs, key),
        resolveFilesMergeSchema(
          schema,
          key,
          own(baseRecord, key),
          own(oursRecord, key),
          own(theirs, key),
        ),
        path === "" ? key : path + "/" + key,
        kept,
      );
      if (value !== undefined) {
        merged[key] = value;
      }
    }
    return merged;
  }
  if (
    schema.kind === "list" &&
    isFilesMergeStringArray(base) &&
    isFilesMergeStringArray(ours) &&
    isFilesMergeStringArray(theirs)
  ) {
    const merged = mergeOrderedStringList(base, ours, theirs);
    if (!isOrderSubsequence(ours, merged)) {
      kept.push(path);
    }
    return merged;
  }
  kept.push(path);
  return theirs;
}

export function mergeFilesIndex(
  base: Partial<FilesIndex> | IndexPresentationPatch,
  ours: Partial<FilesIndex> | IndexPresentationPatch,
  theirs: FilesIndex,
) {
  const kept: string[] = [];
  return {
    index: mergeFilesIndexKeepingLocal(
      base as unknown as JsonRecord,
      ours as unknown as JsonRecord,
      theirs as unknown as JsonRecord,
      FILES_INDEX_MERGE_SCHEMA,
      "",
      kept,
    ) as unknown as FilesIndex,
    kept,
  };
}

/** 索引里除标题与文档元数据以外的部分 */
export function filesIndexWithoutDocumentMetadata(index: FilesIndex) {
  const { docs: _docs, title: _title, ...rest } = index;
  return rest;
}

/** 把 nextFiles 写到 files 上，并删掉 previousFiles 里有、nextFiles 里没有的路径 */
export function removeDroppedFiles(
  files: FileTable,
  previousFiles: ReadonlyMap<string, string>,
  nextFiles: ReadonlyMap<string, string>,
) {
  const result = {
    ...files,
  };
  for (const path of previousFiles.keys()) {
    if (!nextFiles.has(path)) {
      delete result[path];
    }
  }
  for (const [path, content] of nextFiles) {
    result[path] = content;
  }
  return result;
}

/**
 * 把 before 到 after 的改动应用到 currentFiles 上。
 * 逐文件三方判断：当前文件没被改过才直接应用；被改过时先试 options.merge，
 * 失败则跳过（skipped），已过期的文件改为只保留本地（localOnly）。
 * 文件索引另按索引结构合并。
 */
export function mergeDesignSystemFiles(
  currentFiles: FileTable,
  title: string,
  beforeFiles: FileTable,
  afterFiles: FileTable,
  mergeOptions: FileMergeOptions = {},
) {
  const beforeProjectFiles = relativeProjectFilesForMerge(beforeFiles);
  const afterProjectFiles = relativeProjectFilesForMerge(afterFiles);
  const currentProjectFiles = relativeProjectFilesForMerge(currentFiles);
  const appliedPaths: string[] = [];
  const localOnlyPaths: string[] = [];
  const skippedPaths: string[] = [];
  const nextProjectFiles = new Map(currentProjectFiles);
  for (const path of new Set([
    ...beforeProjectFiles.keys(),
    ...afterProjectFiles.keys(),
  ])) {
    const before = beforeProjectFiles.get(path);
    const after = afterProjectFiles.get(path);
    if (before === after || mergeOptions.excluded?.has(path) === true) {
      continue;
    }
    const current = currentProjectFiles.get(path);
    if (current === after) {
      continue;
    }
    const applyAfter = (): void => {
      if (after === undefined) {
        nextProjectFiles.delete(path);
      } else {
        nextProjectFiles.set(path, after);
      }
    };
    const stale: boolean = mergeOptions.stale?.(path) === true;
    if (stale || current !== before) {
      const mergedText =
        before !== undefined && after !== undefined && current !== undefined
          ? (mergeOptions.merge?.(path, before, after, current) ?? null)
          : null;
      if (mergedText !== null) {
        if (mergedText === current) {
          continue;
        }
        appliedPaths.push(path);
        nextProjectFiles.set(path, mergedText);
        continue;
      }
      if (stale) {
        localOnlyPaths.push(path);
        applyAfter();
        continue;
      }
      skippedPaths.push(path);
      continue;
    }
    appliedPaths.push(path);
    applyAfter();
  }
  // 较早的一侧缺少对方已有的索引改动时，先按 theirIndex 补上
  const rebaseIndex = (index: FilesIndex) =>
    (mergeOptions.theirIndex ?? []).reduce(
      (
        merged: FilesIndex,
        delta: FileIndexDelta | IndexPresentationDelta,
      ) => mergeFilesIndex(delta.from, delta.to, merged).index,
      index,
    );
  const removeExcludedIndexEntries = (index: FilesIndex) => {
    if (mergeOptions.excluded === undefined || mergeOptions.excluded.size === 0) {
      return index;
    }
    const cloned = cloneMergeValue(index);
    for (const path of mergeOptions.excluded) {
      const address = assetFileIndexAddress(path);
      if (address === null) {
        continue;
      }
      const entries =
        address.group === null
          ? cloned.blobs
          : Object.hasOwn(cloned.assetGroups, address.group)
            ? cloned.assetGroups[address.group]?.files
            : undefined;
      if (entries !== undefined) {
        delete entries[address.key];
      }
    }
    return cloned;
  };
  const beforeIndex = removeExcludedIndexEntries(
    mergeOptions.earlierSide === "from"
      ? rebaseIndex(buildFilesIndex(title, beforeFiles))
      : buildFilesIndex(title, beforeFiles),
  );
  const afterIndex = removeExcludedIndexEntries(
    mergeOptions.earlierSide === "to"
      ? rebaseIndex(buildFilesIndex(title, afterFiles))
      : buildFilesIndex(title, afterFiles),
  );
  let indexChanged = false;
  let keptIndexPaths: string[] = [];
  let nextFiles: FileTable;
  if (
    !mergeValuesEqual(
      filesIndexWithoutDocumentMetadata(beforeIndex),
      filesIndexWithoutDocumentMetadata(afterIndex),
    )
  ) {
    const currentIndex = buildFilesIndex(title, currentFiles);
    const { index: mergedIndex, kept } = mergeFilesIndex(
      beforeIndex,
      afterIndex,
      currentIndex,
    );
    keptIndexPaths = kept.filter(
      (path: string) => !path.startsWith("docs") && path !== "title",
    );
    indexChanged = !mergeValuesEqual(
      filesIndexWithoutDocumentMetadata(mergedIndex),
      filesIndexWithoutDocumentMetadata(currentIndex),
    );
    const entries = new Map<string, string>();
    for (const [path, content] of nextProjectFiles) {
      entries.set(projectFilePath(path), content);
    }
    nextFiles = indexChanged
      ? {
          ...restoreFilesFromIndex(mergedIndex, entries).content.files,
        }
      : removeDroppedFiles(
          currentFiles,
          currentProjectFiles,
          nextProjectFiles,
        );
    return {
      next: nextFiles,
      viaIndex: indexChanged,
      files: appliedPaths.sort(),
      localOnly: localOnlyPaths.sort(),
      skipped: skippedPaths.sort(),
      index: indexChanged,
      indexKept: keptIndexPaths,
      empty:
        appliedPaths.length + localOnlyPaths.length === 0 && !indexChanged,
    };
  }
  nextFiles = removeDroppedFiles(
    currentFiles,
    currentProjectFiles,
    nextProjectFiles,
  );
  return {
    next: nextFiles,
    viaIndex: false,
    files: appliedPaths.sort(),
    localOnly: localOnlyPaths.sort(),
    skipped: skippedPaths.sort(),
    index: false,
    indexKept: keptIndexPaths,
    empty: appliedPaths.length + localOnlyPaths.length === 0,
  };
}

/** before 与 after 之间有改动的项目文件，以及索引是否变化 */
export function changedProjectFilePaths(
  before: FileTable,
  after: FileTable,
  projectRoot: string,
) {
  const beforeFiles = relativeProjectFilesForMerge(before);
  const afterFiles = relativeProjectFilesForMerge(after);
  const changed = [];
  for (const path of new Set([...beforeFiles.keys(), ...afterFiles.keys()])) {
    if (beforeFiles.get(path) !== afterFiles.get(path)) {
      changed.push(path);
    }
  }
  return {
    files: changed.sort(),
    index: !mergeValuesEqual(
      filesIndexWithoutDocumentMetadata(buildFilesIndex(projectRoot, before)),
      filesIndexWithoutDocumentMetadata(buildFilesIndex(projectRoot, after)),
    ),
  };
}

/**
 * 文件操作的撤销与重做栈。exec 执行并入栈，seed 只入栈（操作已由外部完成）；
 * 新操作入栈时清空重做栈；撤销栈超过 limit 时丢弃最早的。
 */
export function createFileMutationBatch<Mutation extends FileMutation>(
  limit: number = 200,
): FileMutationBatch<Mutation> {
  const undoStack: Mutation[] = [];
  const redoStack: Mutation[] = [];
  const listeners = new Set<() => void>();
  const notify = (): void => {
    for (const listener of [...listeners]) {
      listener();
    }
  };
  return {
    exec(mutation: Mutation): void {
      if (mutation.canDo?.() === false) {
        return;
      }
      mutation.do();
      undoStack.push(mutation);
      if (undoStack.length > limit) {
        undoStack.shift();
      }
      redoStack.length = 0;
      notify();
    },
    seed(mutation: Mutation): void {
      undoStack.push(mutation);
      if (undoStack.length > limit) {
        undoStack.shift();
      }
      redoStack.length = 0;
      notify();
    },
    undo(): void {
      const mutation = undoStack[undoStack.length - 1];
      if (!mutation || mutation.canUndo?.() === false) {
        return;
      }
      undoStack.pop();
      mutation.undo();
      redoStack.push(mutation);
      notify();
    },
    redo(): void {
      const mutation = redoStack[redoStack.length - 1];
      if (!mutation || mutation.canDo?.() === false) {
        return;
      }
      redoStack.pop();
      mutation.do();
      undoStack.push(mutation);
      notify();
    },
    canUndo: (): boolean => undoStack.length > 0,
    canRedo: (): boolean => redoStack.length > 0,
    redoDepth: () => redoStack.length,
    clear(): void {
      if (undoStack.length === 0 && redoStack.length === 0) {
        return;
      }
      undoStack.length = 0;
      redoStack.length = 0;
      notify();
    },
    subscribe(listener: () => void) {
      listeners.add(listener);
      return () => void listeners.delete(listener);
    },
    /** 移除两个栈里满足条件的操作，返回移除个数 */
    prune(shouldRemove: (mutation: Mutation) => boolean): number {
      let removed = 0;
      for (const stack of [undoStack, redoStack]) {
        for (let index = stack.length - 1; index >= 0; index--) {
          if (shouldRemove(stack[index])) {
            stack.splice(index, 1);
            removed++;
          }
        }
      }
      if (removed > 0) {
        notify();
      }
      return removed;
    },
  };
}
