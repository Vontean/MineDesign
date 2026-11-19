import type { JsonValue, DataRecord } from "../contracts/storage";
/** Restored application module; prepare first, initialize in original order. */

var htmlEscapePattern: RegExp;
var unicodeSeparatorPattern: RegExp;
var DELETE_DOCUMENT: symbol;
var serializedObjectCache: WeakMap<object, string>;
var prototypeKey: string;
function serializedDocumentBytes(documentValue: JsonValue): number {
  let serializedJson: string = JSON.stringify(documentValue)!,
    escapeOverheadBytes =
      5 * (serializedJson.match(htmlEscapePattern)?.length ?? 0) +
      3 * (serializedJson.match(unicodeSeparatorPattern)?.length ?? 0);
  return new TextEncoder().encode(serializedJson).length + escapeOverheadBytes;
}
function isPlainRecord(candidate: unknown): candidate is DataRecord {
  return typeof candidate == "object" && candidate !== null && !Array.isArray(candidate);
}
function sortJsonObjectKeys(key: string, jsonValue: unknown): unknown {
  if (!isPlainRecord(jsonValue)) return jsonValue;
  let sortedRecord: DataRecord = {};
  for (let property of Object.keys(jsonValue).sort())
    sortedRecord[property] = jsonValue[property];
  return sortedRecord;
}
function stableStringify(record: object): string {
  let cachedJson = serializedObjectCache.get(record);
  if (cachedJson !== undefined) return cachedJson;
  let json = JSON.stringify(record, sortJsonObjectKeys) ?? "undefined";
  serializedObjectCache.set(record, json);
  return json;
}
function structurallyEqual(left: unknown, right: unknown): boolean {
  return left === right
    ? true
    : typeof left != "object" ||
        typeof right != "object" ||
        left === null ||
        right === null
      ? false
      : stableStringify(left) === stableStringify(right);
}
function deepMerge(base: DataRecord, patch: DataRecord): DataRecord {
  let merged = {
    ...base,
  };
  for (let property of Object.keys(patch)) {
    let patchValue = patch[property];
    if (patchValue === undefined || property === prototypeKey) continue;
    let baseValue = merged[property];
    merged[property] =
      isPlainRecord(baseValue) && isPlainRecord(patchValue)
        ? deepMerge(baseValue, patchValue)
        : patchValue;
  }
  return merged;
}
function mergeCompatibleRecords(
  base: DataRecord,
  patch: DataRecord,
): DataRecord | null {
  let merged = {
    ...base,
  };
  for (let property of Object.keys(patch)) {
    let patchValue = patch[property];
    if (patchValue === undefined || property === prototypeKey) continue;
    let baseValue = merged[property];
    if (isPlainRecord(patchValue) && baseValue !== undefined) {
      if (!isPlainRecord(baseValue)) return null;
      let mergedValue = mergeCompatibleRecords(baseValue, patchValue);
      if (mergedValue === null) return null;
      merged[property] = mergedValue;
    } else merged[property] = patchValue;
  }
  return merged;
}
function diffRecord(
  before: DataRecord | undefined,
  after: DataRecord,
): DataRecord | null {
  if (before === after) return null;
  if (before === undefined) return after;
  let patch: DataRecord | null = null;
  for (let property of Object.keys(after)) {
    if (property === prototypeKey) continue;
    let newValue = after[property],
      oldValue = before[property];
    if (newValue === undefined) {
      oldValue !== undefined && ((patch ??= {})[property] = null);
      continue;
    }
    if (oldValue !== newValue)
      if (isPlainRecord(oldValue) && isPlainRecord(newValue)) {
        let nestedPatch = diffRecord(oldValue, newValue);
        nestedPatch !== null && ((patch ??= {})[property] = nestedPatch);
      } else
        (oldValue === undefined || !structurallyEqual(oldValue, newValue)) &&
          ((patch ??= {})[property] = newValue);
  }
  for (let property of Object.keys(before))
    before[property] !== undefined &&
      after[property] === undefined &&
      ((patch ??= {})[property] = null);
  return patch;
}
function removeNullValues(sourceRecord: DataRecord): DataRecord {
  let cleanedRecord: DataRecord | undefined;
  for (let property of Object.keys(sourceRecord)) {
    let originalValue = sourceRecord[property],
      cleanedValue = originalValue;
    originalValue == null || property === prototypeKey
      ? (cleanedValue = undefined)
      : isPlainRecord(originalValue) && (cleanedValue = removeNullValues(originalValue));
    cleanedValue !== originalValue &&
      ((cleanedRecord ??= {
        ...sourceRecord,
      }),
      cleanedValue === undefined ? delete cleanedRecord[property] : (cleanedRecord[property] = cleanedValue));
  }
  return cleanedRecord ?? sourceRecord;
}
function countRecordNulls(record: DataRecord): number {
  let nullCount = 0;
  for (let fieldValue of Object.values(record))
    fieldValue === null
      ? (nullCount += 1)
      : isPlainRecord(fieldValue) && (nullCount += countRecordNulls(fieldValue));
  return nullCount;
}
function recordDepth(record: unknown, depthLimit: number = 64): number {
  if (typeof record != "object" || record === null) return 0;
  let maxChildDepth = 0;
  for (let child of Array.isArray(record) ? record : Object.values(record))
    if (
      ((maxChildDepth = Math.max(
        maxChildDepth,
        recordDepth(child, depthLimit - 1),
      )),
      maxChildDepth >= depthLimit)
    )
      break;
  return maxChildDepth + 1;
}
function dirname(path: string): string {
  let slash = path.lastIndexOf("/");
  return slash < 0 ? "" : path.slice(0, slash);
}
function basename(path: string): string {
  return path.slice(path.lastIndexOf("/") + 1);
}
export {
  basename,
  countRecordNulls,
  deepMerge,
  DELETE_DOCUMENT,
  diffRecord,
  dirname,
  isPlainRecord,
  mergeCompatibleRecords,
  serializedObjectCache as PlatformDocumentValuesElementCache,
  htmlEscapePattern as PlatformDocumentValuesPattern,
  unicodeSeparatorPattern as PlatformDocumentValuesPattern_2,
  prototypeKey as ProtoValue,
  recordDepth,
  removeNullValues,
  serializedDocumentBytes,
  sortJsonObjectKeys,
  stableStringify,
  structurallyEqual,
};
export function installPlatformDocumentValues(): () => void {
  return () => {
    htmlEscapePattern = /[<>&]/g;
    unicodeSeparatorPattern = /[\u2028\u2029]/g;
    DELETE_DOCUMENT = Symbol("DELETE_DOC");
    serializedObjectCache = new WeakMap();
    prototypeKey = "__proto__";
  };
}
