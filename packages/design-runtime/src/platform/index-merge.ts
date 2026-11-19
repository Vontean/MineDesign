import type {
  DataRecord,
  MergePolicy,
  ListMergePolicy,
  MergeContext,
} from "../contracts/storage";
/** Restored application module; prepare first, initialize in original order. */

var INDEX_PRESERVED_METADATA_KEYS: readonly string[];
var isPlainMergeObject: (input: unknown) => input is DataRecord;
var isStringList: (input: unknown) => input is string[];
var getOwnMergeValue: (input: DataRecord | undefined, key: string) => unknown;
var cloneIndexValue: (input: unknown) => unknown;
var LEAF_MERGE_POLICY: MergePolicy;
var MAX_MERGED_OBJECT_KEYS: number;
function preserveIndexProvenance<Value>(
  mergedIndex: Value,
  ...sources: unknown[]
): Value {
  if (!isPlainMergeObject(mergedIndex)) return mergedIndex;
  let result = mergedIndex;
  for (let key of INDEX_PRESERVED_METADATA_KEYS) {
    if (isPlainMergeObject(result[key])) continue;
    let source = sources.find(
      (candidate): candidate is DataRecord =>
        isPlainMergeObject(candidate) && isPlainMergeObject(candidate[key]),
    );
    source !== undefined &&
      (result = {
        ...result,
        [key]: cloneIndexValue(source[key]),
      });
  }
  return result;
}
function setSafeObjectKey(
  object: DataRecord,
  key: string,
  propertyValue: unknown,
): void {
  key === "__proto__"
    ? Object.defineProperty(object, key, {
        value: propertyValue,
        enumerable: true,
        writable: true,
        configurable: true,
      })
    : (object[key] = propertyValue);
}
function replaceIndexObjectProperties(
  target: DataRecord,
  source: DataRecord,
): void {
  for (let key of Object.keys(target))
    !Object.hasOwn(source, key) &&
      !INDEX_PRESERVED_METADATA_KEYS.includes(key) &&
      delete target[key];
  for (let key of Object.keys(source))
    setSafeObjectKey(target, key, source[key]);
}
function equalIndexValue(left: unknown, right: unknown): boolean {
  if (left === right) return true;
  if (Array.isArray(left))
    return (
      Array.isArray(right) &&
      left.length === right.length &&
      left.every((item, index) => equalIndexValue(item, right[index]))
    );
  if (isPlainMergeObject(left)) {
    if (!isPlainMergeObject(right)) return false;
    let leftKeys = Object.keys(left).filter(
        (key) => left[key] !== undefined,
      ),
      rightKeys = Object.keys(right).filter(
        (key) => right[key] !== undefined,
      );
    return (
      leftKeys.length === rightKeys.length &&
      leftKeys.every(
        (key) =>
          Object.hasOwn(right, key) &&
          equalIndexValue(left[key], right[key]),
      )
    );
  }
  return false;
}
function getChildMergePolicy(
  policy: MergePolicy | undefined,
  key: string,
  ...values: unknown[]
): MergePolicy {
  if (policy?.kind === "map") {
    let keyPolicy =
      policy.keys !== undefined && Object.hasOwn(policy.keys, key)
        ? policy.keys[key]
        : undefined;
    if (keyPolicy) return keyPolicy;
    if (policy.of) return policy.of;
  }
  let existingValues = values.filter((value) => value !== undefined);
  return existingValues.length > 0 && existingValues.every(isPlainMergeObject)
    ? {
        kind: "map",
      }
    : existingValues.length > 0 && existingValues.every(isStringList)
      ? {
          kind: "list",
        }
      : LEAF_MERGE_POLICY;
}
function mergeLeafValue(
  base: unknown,
  local: unknown,
  remote: unknown,
  path: string,
  mergeContext: MergeContext,
): unknown {
  return equalIndexValue(local, base)
    ? remote
    : equalIndexValue(remote, base) || equalIndexValue(local, remote)
      ? local
      : (mergeContext.conflicts?.push(path), remote);
}
function uniqueMergeKeys(keys: readonly string[]): string[] {
  let seen = new Set();
  return keys.filter((key) =>
    seen.has(key) ? false : (seen.add(key), true),
  );
}
function mergeOrderedStringList(
  base: readonly string[],
  local: readonly string[],
  remote: readonly string[],
  allowedKeys?: ReadonlySet<string> | readonly string[],
): string[] {
  let baseKeys = uniqueMergeKeys(base),
    localKeys = uniqueMergeKeys(local),
    remoteKeys = uniqueMergeKeys(remote),
    merged: string[];
  if (equalIndexValue(remoteKeys, baseKeys)) merged = [...localKeys];
  else if (equalIndexValue(localKeys, baseKeys)) merged = [...remoteKeys];
  else {
    let baseMembership = new Set(baseKeys),
      remoteMembership = new Set(remoteKeys),
      localMembership = new Set(localKeys),
      remoteOrderUnchanged = equalIndexValue(
        remoteKeys.filter((key) => baseMembership.has(key)),
        baseKeys.filter((key) => remoteMembership.has(key)),
      ),
      localOrderUnchanged = equalIndexValue(
        localKeys.filter((key) => baseMembership.has(key)),
        baseKeys.filter((key) => localMembership.has(key)),
      ),
      preferLocalOrder = remoteOrderUnchanged && !localOrderUnchanged,
      [primaryOrder, secondaryOrder] = preferLocalOrder
        ? [localKeys, remoteKeys]
        : [remoteKeys, localKeys],
      secondaryMembership = new Set(secondaryOrder),
      primaryMembership = new Set(primaryOrder);
    merged = primaryOrder.filter(
      (key) => !(baseMembership.has(key) && !secondaryMembership.has(key)),
    );
    secondaryOrder.forEach((key, index) => {
      if (baseMembership.has(key) || primaryMembership.has(key)) return;
      let appendAtEnd =
          (preferLocalOrder || !remoteOrderUnchanged) &&
          secondaryOrder.slice(index + 1).every((followingKey) => !baseMembership.has(followingKey)),
        insertAt = appendAtEnd ? merged.length : 0;
      for (let previousIndex = index - 1; !appendAtEnd && previousIndex >= 0; previousIndex--) {
        let mergedIndex = merged.indexOf(secondaryOrder[previousIndex]!);
        if (mergedIndex >= 0) {
          insertAt = mergedIndex + 1;
          break;
        }
      }
      merged.splice(insertAt, 0, key);
    });
  }
  if (allowedKeys !== undefined) {
    let allowedMembership =
      allowedKeys instanceof Set ? allowedKeys : new Set(allowedKeys);
    merged = merged.filter((key) => allowedMembership.has(key));
    let mergedMembership = new Set(merged);
    for (let key of allowedMembership) mergedMembership.has(key) || merged.push(key);
  }
  return merged;
}
function normalizeMergeMap(
  inputRecords: unknown,
  idProperty: string,
): Record<string, DataRecord> {
  let records = Array.isArray(inputRecords)
      ? inputRecords
      : isPlainMergeObject(inputRecords)
        ? Object.keys(inputRecords)
            .filter((key) => Object.hasOwn(inputRecords, key))
            .map((key) => inputRecords[key])
        : [],
    result: Record<string, DataRecord> = Object.create(null);
  for (let record of records)
    isPlainMergeObject(record) &&
      typeof record[idProperty] == "string" &&
      record[idProperty] !== "" &&
      Object.keys(result).length < MAX_MERGED_OBJECT_KEYS &&
      (result[record[idProperty]] = record);
  return result;
}
function mergeMapValues(
  base: DataRecord | undefined,
  local: DataRecord,
  remote: DataRecord,
  policy: MergePolicy,
  path: string,
  mergeContext: MergeContext,
): DataRecord {
  let result: DataRecord = {},
    keys = uniqueMergeKeys([...Object.keys(remote), ...Object.keys(local)]),
    deferredLists: {
      key: string;
      schema: ListMergePolicy;
    }[] = [];
  for (let key of keys) {
    let [baseValue, localValue, remoteValue] = [
        getOwnMergeValue(base, key),
        getOwnMergeValue(local, key),
        getOwnMergeValue(remote, key),
      ],
      hadBase = baseValue !== undefined,
      hasLocal = localValue !== undefined,
      hasRemote = remoteValue !== undefined;
    if (hadBase && (!hasLocal || !hasRemote)) continue;
    if (!hasLocal) {
      setSafeObjectKey(result, key, cloneIndexValue(remoteValue));
      continue;
    }
    if (!hasRemote) {
      setSafeObjectKey(result, key, cloneIndexValue(localValue));
      continue;
    }
    let childPolicy = getChildMergePolicy(policy, key, baseValue, localValue, remoteValue),
      childPath = path === "" ? key : path + "/" + key;
    if (
      childPolicy.kind === "map" &&
      isPlainMergeObject(localValue) &&
      isPlainMergeObject(remoteValue)
    )
      setSafeObjectKey(
        result,
        key,
        mergeMapValues(
          isPlainMergeObject(baseValue) ? baseValue : undefined,
          localValue,
          remoteValue,
          childPolicy,
          childPath,
          mergeContext,
        ),
      );
    else if (childPolicy.kind === "records") {
      let mergedRecords = mergeMapValues(
        normalizeMergeMap(baseValue, childPolicy.by),
        normalizeMergeMap(localValue, childPolicy.by),
        normalizeMergeMap(remoteValue, childPolicy.by),
        {
          kind: "map",
          of: LEAF_MERGE_POLICY,
        },
        childPath,
        mergeContext,
      );
      setSafeObjectKey(
        result,
        key,
        Object.keys(mergedRecords)
          .slice(0, MAX_MERGED_OBJECT_KEYS)
          .map((id) => mergedRecords[id]),
      );
    } else
      childPolicy.kind === "list" && isStringList(localValue) && isStringList(remoteValue)
        ? (setSafeObjectKey(
            result,
            key,
            mergeOrderedStringList(
              isStringList(baseValue) ? baseValue : [],
              localValue,
              remoteValue,
            ),
          ),
          deferredLists.push({
            key: key,
            schema: childPolicy,
          }))
        : setSafeObjectKey(
            result,
            key,
            cloneIndexValue(
              mergeLeafValue(baseValue, localValue, remoteValue, childPath, mergeContext),
            ),
          );
  }
  for (let { key: key, schema: listPolicy } of deferredLists) {
    let listPath = path === "" ? key : path + "/" + key,
      members =
        listPolicy.membersOf !== undefined
          ? getOwnMergeValue(result, listPolicy.membersOf)
          : undefined,
      allowedKeys = isPlainMergeObject(members)
        ? new Set(Object.keys(members))
        : mergeContext.externalMembers?.(listPath),
      orderedKeys = getOwnMergeValue(result, key) as string[];
    allowedKeys !== undefined &&
      setSafeObjectKey(
        result,
        key,
        mergeOrderedStringList(orderedKeys, orderedKeys, orderedKeys, allowedKeys),
      );
  }
  return result;
}
function mergeIndexValues(
  base: unknown,
  local: unknown,
  remote: unknown,
  policy: MergePolicy,
  mergeContext: MergeContext = {},
): unknown {
  return policy.kind === "map" &&
    isPlainMergeObject(local) &&
    isPlainMergeObject(remote)
    ? mergeMapValues(
        isPlainMergeObject(base) ? base : undefined,
        local,
        remote,
        policy,
        "",
        mergeContext,
      )
    : policy.kind === "list" && isStringList(local) && isStringList(remote)
      ? mergeOrderedStringList(
          isStringList(base) ? base : [],
          local,
          remote,
          mergeContext.externalMembers?.(""),
        )
      : cloneIndexValue(mergeLeafValue(base, local, remote, "", mergeContext));
}
export {
  cloneIndexValue,
  equalIndexValue,
  getChildMergePolicy,
  getOwnMergeValue,
  INDEX_PRESERVED_METADATA_KEYS,
  isPlainMergeObject,
  isStringList,
  LEAF_MERGE_POLICY,
  MAX_MERGED_OBJECT_KEYS,
  mergeIndexValues,
  mergeLeafValue,
  mergeMapValues,
  mergeOrderedStringList,
  normalizeMergeMap,
  preserveIndexProvenance,
  replaceIndexObjectProperties,
  setSafeObjectKey,
  uniqueMergeKeys,
};
export function installPlatformIndexMerge(): () => void {
  return () => {
    INDEX_PRESERVED_METADATA_KEYS = ["convertedFrom", "createdOnFiles"];
    isPlainMergeObject = (value: unknown): value is DataRecord =>
      typeof value == "object" && value !== null && !Array.isArray(value);
    isStringList = (value: unknown): value is string[] =>
      Array.isArray(value) &&
      value.every((item) => typeof item == "string");
    getOwnMergeValue = (record: DataRecord | undefined, key: string): unknown =>
      record !== undefined && Object.hasOwn(record, key) ? record[key] : undefined;
    cloneIndexValue = (value: unknown): unknown =>
      value === undefined ? value : JSON.parse(JSON.stringify(value));
    LEAF_MERGE_POLICY = {
      kind: "leaf",
    };
    MAX_MERGED_OBJECT_KEYS = 64;
  };
}
