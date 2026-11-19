import { uiMessage } from '@minedesign/contracts/ui-messages';
/** Restored application module; prepare first, initialize in original order. */
import type {
  IndexMergeNotice,
  IndexPresentationPatch,
  IndexPresentationDelta,
  FileIndexDelta,
} from "../contracts/files-core";
import type * as Files from "../contracts";
import { decodeFileIndexKey } from "../editor/files-index";
import { isOrderSubsequence } from "../editor/files-merge";
import { FILE_MIGRATION_MARKER_FIELDS, mergeValuesEqual } from "../editor/index-file-store";

var HOT_CARRY_PROTOCOL_FIELD: string;
var describeIndexConflicts: (
  paths: readonly string[],
  index: Files.FilesIndex,
) => string[];
var isGeneratedIndexField: (path: string) => boolean;
var indexPresentationField: (
  index: Files.FilesIndex,
  path: string,
) => string | undefined;
function indexWithoutTitleAndDocs(index: Files.FilesIndex) {
  let { title: title, docs: docs, ...contentIndex } = index;
  return contentIndex;
}
function describeIndexConflictPath(
  path: string,
  index: Files.FilesIndex,
): string {
  let parts = path.split("/");
  if (parts[0] === "sections") {
    return (
      uiMessage("design-system.indexConflicts.theCardTitle") +
      (typeof index.sections?.[parts[1] ?? ""] === "string"
        ? index.sections[parts[1]]
        : decodeFileIndexKey(parts[1] ?? "")) +
      "”"
    );
  }
  if (parts[0] === "assetGroups" && parts[2] === "order") {
    return (
      uiMessage("design-system.indexConflicts.theOrderOf") +
      (index.assetGroups?.[parts[1] ?? ""]?.name ??
        decodeFileIndexKey(parts[1] ?? ""))
    );
  }
  if (parts[0] === "assetGroups" && parts[2] === "tile") {
    return (
      uiMessage("design-system.indexConflicts.theTileSizeOf") +
      (index.assetGroups?.[parts[1] ?? ""]?.name ??
        decodeFileIndexKey(parts[1] ?? ""))
    );
  }
  if (parts[0] === "assetGroups" && parts[2] === "files") {
    return (
      decodeFileIndexKey(parts[3] ?? "") +
      " in " +
      (index.assetGroups?.[parts[1] ?? ""]?.name ??
        decodeFileIndexKey(parts[1] ?? ""))
    );
  }
  if (parts[0] === "groups") {
    return uiMessage("design-system.indexConflicts.theOrderOfTheAsset");
  }
  if (parts[0] === "title") {
    return uiMessage("design-system.indexConflicts.theNameOfTheSystem");
  }
  if (parts[0] === "libraries") {
    return uiMessage("design-system.indexConflicts.theRuntimeLibraries");
  }
  return uiMessage("design-system.indexConflicts.thisDesignSystemSList");
}
function invalidAssetGroupOrders(
  index: Files.FilesIndex,
  knownGroupFiles: (name: string) => ReadonlySet<string> = () => new Set(),
) {
  let fixedOrders: Record<string, string[]> = {};
  for (let [value, groupIndex] of Object.entries(index.assetGroups ?? {})) {
    if (typeof groupIndex !== "object" || groupIndex === null) {
      continue;
    }
    let order = Array.isArray(groupIndex.order) ? groupIndex.order : [];
    if (order.length === 0) {
      continue;
    }
    let values = new Set([
        ...Object.values(groupIndex.files ?? {})
          .map((name: Files.IndexBlobRecord) => name?.name)
          .filter((name: string): boolean => typeof name === "string"),
        ...knownGroupFiles(groupIndex.name),
      ]),
      seenNames = new Set(),
      fixedOrder = order.filter(
        (name: string) =>
          typeof name === "string" &&
          values.has(name) &&
          !seenNames.has(name) &&
          (seenNames.add(name), true),
      );
    if (!mergeValuesEqual(fixedOrder, order)) {
      fixedOrders[value] = fixedOrder;
    }
  }
  return fixedOrders;
}
function indexAuthoredFieldsEqual(
  left: import("../contracts/files-core").CarriedFilesIndex,
  right: import("../contracts/files-core").CarriedFilesIndex,
) {
  let authoredFields = (
    index: import("../contracts/files-core").CarriedFilesIndex,
  ) =>
    Object.fromEntries(
      Object.entries(index).filter(
        ([field]: [string, unknown]): boolean =>
          !isGeneratedIndexField(field),
      ),
    );
  return mergeValuesEqual(
    authoredFields(left),
    authoredFields(right),
  );
}
function authoredIndexMergeConflicts(merge: IndexMergeNotice) {
  let conflicts = new Set(
    merge.conflicts.filter(
      (path: string) =>
        !path.startsWith("docs") && !isGeneratedIndexField(path),
    ),
  );
  if (
    !mergeValuesEqual(merge.mine.groups, merge.base.groups) &&
    !isOrderSubsequence(merge.mine.groups, merge.merged.groups)
  ) {
    conflicts.add("groups");
  }
  for (let [value, mergedGroup] of Object.entries(merge.mine.assetGroups ?? {})) {
    let baseOrder = merge.base.assetGroups?.[value]?.order,
      mergedOrder = merge.merged.assetGroups?.[value]?.order;
    if (
      baseOrder !== undefined &&
      mergedOrder !== undefined &&
      !mergeValuesEqual(mergedGroup.order, baseOrder) &&
      !isOrderSubsequence(mergedGroup.order, mergedOrder)
    ) {
      conflicts.add("assetGroups/" + value + "/order");
    }
  }
  return [...conflicts];
}
function indexUndoForeignChanges(
  changes: FileIndexDelta[],
  conflicts: Iterable<string>,
  index: Files.FilesIndex,
) {
  let from: IndexPresentationPatch = {},
    to2: IndexPresentationPatch = {};
  for (let value of conflicts) {
    let groupName = /^assetGroups\/([^/]+)\/tile$/.exec(value)?.[1],
      sectionName = value.startsWith("sections/") ? value.slice(9) : undefined,
      change = [...changes]
        .reverse()
        .find((delta: FileIndexDelta) =>
          sectionName !== undefined
            ? (delta.from.sections !== undefined ||
                delta.to.sections !== undefined) &&
              delta.from.sections?.[sectionName] !== delta.to.sections?.[sectionName]
            : groupName !== undefined &&
              (delta.from.assetGroups !== undefined ||
                delta.to.assetGroups !== undefined) &&
              delta.from.assetGroups?.[groupName]?.tile !==
                delta.to.assetGroups?.[groupName]?.tile,
        );
    if (change === undefined) {
      continue;
    }
    if (sectionName !== undefined) {
      (from.sections ??= {})[sectionName] = index.sections?.[sectionName];
      (to2.sections ??= {})[sectionName] = change.to.sections?.[sectionName];
    } else if (groupName !== undefined) {
      (from.assetGroups ??= {})[groupName] = {
        tile: index.assetGroups?.[groupName]?.tile,
      };
      (to2.assetGroups ??= {})[groupName] = {
        tile: change.to.assetGroups?.[groupName]?.tile,
      };
    }
  }
  return {
    from: from,
    to: to2,
  };
}
export {
  authoredIndexMergeConflicts,
  describeIndexConflictPath,
  describeIndexConflicts,
  HOT_CARRY_PROTOCOL_FIELD,
  indexAuthoredFieldsEqual,
  indexPresentationField,
  indexUndoForeignChanges,
  indexWithoutTitleAndDocs,
  invalidAssetGroupOrders,
  isGeneratedIndexField,
};
export function installFilesIndexConflicts(): () => void {
  return () => {
    HOT_CARRY_PROTOCOL_FIELD = "books";
    describeIndexConflicts = (
      paths: readonly string[],
      index: Files.FilesIndex,
    ) => [
      ...new Set(
        paths.map((path: string) =>
          describeIndexConflictPath(path, index),
        ),
      ),
    ];
    isGeneratedIndexField = (field: string) =>
      FILE_MIGRATION_MARKER_FIELDS.includes(field.split("/")[0]);
    indexPresentationField = (index: Files.FilesIndex, path: string) => {
      if (path.startsWith("sections/")) {
        return index.sections?.[path.slice(9)];
      }
      let value = /^assetGroups\/([^/]+)\/tile$/.exec(path);
      if (value !== null) {
        return index.assetGroups?.[value[1]]?.tile;
      } else {
        return undefined;
      }
    };
  };
}
