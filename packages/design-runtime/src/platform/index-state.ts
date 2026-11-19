import type {
  DataRecord,
  MergePolicy,
  VersionedIndex,
  IndexStateOptions,
  IndexFileState,
  IndexWriteListener,
  IndexFileErrorConstructor,
  IndexFileErrorCode,
  ValidatedIndexStateOptions,
} from "../contracts/storage";
/** Restored application module; prepare first, initialize in original order. */
import { cloneIndexValue, equalIndexValue, isPlainMergeObject, mergeIndexValues, normalizeMergeMap, preserveIndexProvenance, setSafeObjectKey } from "./index-merge";

var DESIGN_INDEX_MERGE_POLICY: MergePolicy;
var IndexFileError: IndexFileErrorConstructor;
function canonicalizeIndexValue(indexValue: unknown, topLevel?: boolean): unknown {
  if (Array.isArray(indexValue))
    return indexValue.map((item) => canonicalizeIndexValue(item, false));
  if (!isPlainMergeObject(indexValue)) return indexValue;
  let keys = Object.keys(indexValue)
    .filter((key) => indexValue[key] !== undefined)
    .sort();
  if (topLevel) {
    let versionKeyIndex = keys.indexOf("v");
    versionKeyIndex > 0 && (keys.splice(versionKeyIndex, 1), keys.unshift("v"));
  }
  let canonicalRecord: DataRecord = {};
  for (let key of keys)
    setSafeObjectKey(
      canonicalRecord,
      key,
      canonicalizeIndexValue(indexValue[key], false),
    );
  return canonicalRecord;
}
function stringifyCanonicalIndex(index: unknown): string {
  return (
    JSON.stringify(canonicalizeIndexValue(index, true), null, 2) +
    `
`
  );
}
function createIndexFileState<Index extends VersionedIndex>(
  indexOptions: IndexStateOptions<Index>,
): IndexFileState<Index> {
  let currentIndex = indexOptions.empty(),
    base: Index = cloneIndexValue(currentIndex) as Index,
    baseSha: string | null = null,
    onWrite: IndexWriteListener | undefined,
    conflicts: string[] = [],
    dirty = false;
  function parseIndex(text: string): Index {
    let parsedIndex: unknown;
    try {
      parsedIndex = JSON.parse(text);
    } catch {
      throw new IndexFileError("unreadable", indexOptions.path + " is not JSON");
    }
    if (
      !isPlainMergeObject(parsedIndex) ||
      typeof parsedIndex.v != "number"
    )
      throw new IndexFileError(
        "unreadable",
        indexOptions.path + " has no numeric v",
      );
    let defaultIndex = indexOptions.empty();
    if (parsedIndex.v > (indexOptions.maxVersion ?? defaultIndex.v))
      throw new IndexFileError(
        "newer_version",
        indexOptions.path +
          " was written by a newer editor (v " +
          String(parsedIndex.v) +
          ")",
      );
    for (let [key, defaultValue] of Object.entries(defaultIndex)) {
      if (key === "v") continue;
      let expectedShape = Array.isArray(defaultValue)
        ? "array"
        : isPlainMergeObject(defaultValue)
          ? "object"
          : undefined;
      if (expectedShape === undefined) continue;
      let fieldValue = parsedIndex[key],
        fieldPolicy =
          indexOptions.schema.kind === "map"
            ? indexOptions.schema.keys?.[key]
            : undefined;
      if (
        fieldPolicy?.kind === "records" &&
        expectedShape === "array" &&
        isPlainMergeObject(fieldValue)
      ) {
        let records = normalizeMergeMap(fieldValue, fieldPolicy.by);
        parsedIndex[key] = Object.keys(records).map((id) => records[id]);
        continue;
      }
      ((expectedShape === "array" && !Array.isArray(fieldValue)) ||
        (expectedShape === "object" && !isPlainMergeObject(fieldValue))) &&
        (parsedIndex[key] = defaultValue);
    }
    if (indexOptions.validate && !indexOptions.validate(parsedIndex as VersionedIndex)) {
      throw new IndexFileError(
        "unreadable",
        indexOptions.path + " does not match its document schema",
      );
    }
    return parsedIndex as Index;
  }
  let markDirty = () => {
      dirty = true;
      onWrite?.(indexOptions.path, () => indexState.serialize(), baseSha);
    },
    indexState: IndexFileState<Index> = {
      path: indexOptions.path,
      parse: parseIndex,
      async load() {
        let file;
        try {
          file = await indexOptions.port.readText(indexOptions.path);
        } catch (error: unknown) {
          throw new IndexFileError(
            "not_found",
            indexOptions.path +
              ": " +
              (error instanceof Error
                ? error.message
                : String(
                    (
                      error as
                        | {
                            message?: unknown;
                          }
                        | null
                        | undefined
                    )?.message ?? error,
                  )),
          );
        }
        currentIndex = parseIndex(file.text);
        base = cloneIndexValue(currentIndex) as Index;
        baseSha = file.sha256;
        dirty = false;
        return currentIndex;
      },
      loadText(text, sha) {
        currentIndex = parseIndex(text);
        base = cloneIndexValue(currentIndex) as Index;
        baseSha = sha;
        dirty = false;
        return currentIndex;
      },
      init(initialIndex) {
        currentIndex = initialIndex ?? indexOptions.empty();
        base = indexOptions.empty();
        baseSha = null;
        markDirty();
        return currentIndex;
      },
      get: () => currentIndex,
      base: () => base,
      baseSha: () => baseSha,
      dirty: () => dirty,
      lastConflicts: () => [...conflicts],
      update(edit) {
        edit(currentIndex);
        markDirty();
      },
      mergeFrom(remoteIndex) {
        conflicts = [];
        currentIndex = preserveIndexProvenance(
          mergeIndexValues(base, currentIndex, remoteIndex, indexOptions.schema, {
            conflicts: conflicts,
            externalMembers: indexOptions.externalMembers,
          }),
          remoteIndex,
          base,
        ) as Index;
        base = cloneIndexValue(remoteIndex) as Index;
        return currentIndex;
      },
      serialize: () =>
        stringifyCanonicalIndex(
          preserveIndexProvenance(currentIndex, base),
        ),
      bind(onWriteRequest) {
        onWrite = onWriteRequest;
      },
      markSaved(savedText, sha) {
        try {
          base = JSON.parse(savedText);
        } catch {
          base = cloneIndexValue(currentIndex) as Index;
        }
        baseSha = sha;
        dirty = !equalIndexValue(base, currentIndex);
      },
      async reloadAndMerge() {
        let file = await indexOptions.port.readText(indexOptions.path);
        return file.sha256 === baseSha
          ? []
          : (indexState.mergeFrom(parseIndex(file.text)),
            (baseSha = file.sha256),
            (dirty = !equalIndexValue(base, currentIndex)),
            dirty &&
              onWrite?.(indexOptions.path, () => indexState.serialize(), baseSha),
            [...conflicts]);
      },
    };
  return indexState;
}
export {
  canonicalizeIndexValue,
  createIndexFileState,
  DESIGN_INDEX_MERGE_POLICY,
  IndexFileError,
  stringifyCanonicalIndex,
};
export function installPlatformIndexState(): () => void {
  return () => {
    DESIGN_INDEX_MERGE_POLICY = {
      kind: "map",
      keys: {
        launch: {
          kind: "map",
        },
        pages: {
          kind: "leaf",
        },
        boards: {
          kind: "map",
          of: {
            kind: "map",
            of: {
              kind: "leaf",
            },
          },
        },
        order: {
          kind: "list",
          membersOf: "boards",
        },
        notes: {
          kind: "map",
          of: {
            kind: "map",
            of: {
              kind: "leaf",
            },
          },
        },
        designSystems: {
          kind: "records",
          by: "namespace",
        },
        attachments: {
          kind: "map",
          of: {
            kind: "map",
            of: {
              kind: "leaf",
            },
          },
        },
      },
    };
    IndexFileError = class extends Error {
      declare name: string;
      constructor(code: IndexFileErrorCode, message: string) {
        super(message);
        this.code = code;
        this.name = "IndexFileError";
      }
      code: IndexFileErrorCode;
    };
  };
}
