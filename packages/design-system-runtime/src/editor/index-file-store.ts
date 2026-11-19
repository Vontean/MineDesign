/** Restored application module; prepare first, initialize in original order. */
import type {
  JsonMergeValue,
  JsonValue,
  JsonRecord,
  MergeSchema,
  MergeDocumentOptions,
  IndexFileStoreOptions,
  IndexFileStore,
  IndexFileErrorConstructor,
  IndexFileErrorCode,
  IndexStoreBinder,
} from "../contracts/files-core";
import type * as Files from "../contracts";

var SHA256_ROUND_CONSTANTS: Uint32Array;
var sha256TextEncoder: TextEncoder;
var encodeFileUtf8: (text: string) => Uint8Array<ArrayBuffer>;
var FILE_MIGRATION_MARKER_FIELDS: string[];
var isMergeObject: (value: unknown) => value is JsonRecord;
var isStringArray: (value: unknown) => value is string[];
var ownMergeProperty: (
  object: JsonRecord | undefined,
  key: string,
) => JsonMergeValue;
var cloneMergeValue: <T>(value: T) => T;
var LEAF_MERGE_SCHEMA: MergeSchema;
var MAX_KEYED_MERGE_LIST_ITEMS: number;
var IndexFileError: IndexFileErrorConstructor;
function sha256Sync(inputData: string | Uint8Array<ArrayBufferLike>) {
  let bytes = typeof inputData === "string" ? encodeFileUtf8(inputData) : inputData,
    byteLength = bytes.length,
    paddedLength: number = ((byteLength + 9 + 63) >> 6) << 6,
    paddedBytes = new Uint8Array(paddedLength);
  paddedBytes.set(bytes);
  paddedBytes[byteLength] = 128;
  let view = new DataView(paddedBytes.buffer);
  view.setUint32(paddedLength - 8, Math.floor(byteLength / 536870912), false);
  view.setUint32(paddedLength - 4, (byteLength << 3) >>> 0, false);
  let state = new Uint32Array([
      1779033703, 3144134277, 1013904242, 2773480762, 1359893119, 2600822924,
      528734635, 1541459225,
    ]),
    words = new Uint32Array(64);
  for (let index = 0; index < paddedLength; index += 64) {
    for (let wordIndex: number = 0; wordIndex < 16; wordIndex++) {
      words[wordIndex] = view.getUint32(index + wordIndex * 4, false);
    }
    for (let count: number = 16; count < 64; count++) {
      let scheduleWord = words[count - 15],
        scheduleWordTwo = words[count - 2],
        scheduleWordThree: number =
          ((scheduleWord >>> 7) | (scheduleWord << 25)) ^
          ((scheduleWord >>> 18) | (scheduleWord << 14)) ^
          (scheduleWord >>> 3),
        scheduleWordFour: number =
          ((scheduleWordTwo >>> 17) | (scheduleWordTwo << 15)) ^
          ((scheduleWordTwo >>> 19) | (scheduleWordTwo << 13)) ^
          (scheduleWordTwo >>> 10);
      words[count] =
        (words[count - 16] + scheduleWordThree + words[count - 7] + scheduleWordFour) | 0;
    }
    let value = state[0],
      stateA = state[1],
      stateB = state[2],
      stateC = state[3],
      stateD = state[4],
      stateE = state[5],
      stateF = state[6],
      stateG = state[7];
    for (let roundIndex: number = 0; roundIndex < 64; roundIndex++) {
      let hashValue: number =
          ((stateD >>> 6) | (stateD << 26)) ^
          ((stateD >>> 11) | (stateD << 21)) ^
          ((stateD >>> 25) | (stateD << 7)),
        choiceTemp = (stateD & stateE) ^ (~stateD & stateF),
        hashValueA: number =
          (stateG +
            hashValue +
            choiceTemp +
            SHA256_ROUND_CONSTANTS[roundIndex] +
            words[roundIndex]) |
          0,
        hashValueB: number =
          ((value >>> 2) | (value << 30)) ^
          ((value >>> 13) | (value << 19)) ^
          ((value >>> 22) | (value << 10)),
        majorityTemp = (value & stateA) ^ (value & stateB) ^ (stateA & stateB),
        hashValueC: number = (hashValueB + majorityTemp) | 0;
      stateG = stateF;
      stateF = stateE;
      stateE = stateD;
      stateD = (stateC + hashValueA) | 0;
      stateC = stateB;
      stateB = stateA;
      stateA = value;
      value = (hashValueA + hashValueC) | 0;
    }
    state[0] = (state[0] + value) | 0;
    state[1] = (state[1] + stateA) | 0;
    state[2] = (state[2] + stateB) | 0;
    state[3] = (state[3] + stateC) | 0;
    state[4] = (state[4] + stateD) | 0;
    state[5] = (state[5] + stateE) | 0;
    state[6] = (state[6] + stateF) | 0;
    state[7] = (state[7] + stateG) | 0;
  }
  let hexDigest = "";
  for (let index: number = 0; index < 8; index++) {
    hexDigest += (state[index] >>> 0).toString(16).padStart(8, "0");
  }
  return hexDigest;
}
async function sha256(
  inputData: string | Uint8Array<ArrayBufferLike>,
): Promise<string> {
  let bytes = typeof inputData === "string" ? encodeFileUtf8(inputData) : inputData,
    subtleCrypto = globalThis.crypto?.subtle;
  if (typeof subtleCrypto?.digest === "function" && bytes.length > 4096) {
    try {
      let value = new Uint8Array(
          await subtleCrypto.digest(
            "SHA-256",
            bytes as Uint8Array<ArrayBuffer>,
          ),
        ),
        text = "";
      for (let byte of value) {
        text += byte.toString(16).padStart(2, "0");
      }
      return text;
    } catch {}
  }
  return sha256Sync(bytes);
}
function preserveFileMigrationMarkers<Value>(
  migrationValue: Value,
  ...migrationValueA: unknown[]
): Value {
  if (!isMergeObject(migrationValue)) {
    return migrationValue;
  }
  let result: JsonRecord = migrationValue;
  for (let migrationValueB of FILE_MIGRATION_MARKER_FIELDS) {
    if (isMergeObject(result[migrationValueB])) {
      continue;
    }
    let migrationValueC = migrationValueA.find(
      (indexValue: unknown): indexValue is JsonRecord =>
        isMergeObject(indexValue) && isMergeObject(indexValue[migrationValueB]),
    );
    if (migrationValueC !== undefined) {
      result = {
        ...result,
        [migrationValueB]: cloneMergeValue(migrationValueC[migrationValueB]),
      };
    }
  }
  return result as unknown as Value;
}
function setMergePropertySafely(
  object: JsonRecord,
  key: string,
  propertyValue: JsonMergeValue,
): void {
  if (key === "__proto__") {
    Object.defineProperty(object, key, {
      value: propertyValue,
      enumerable: true,
      writable: true,
      configurable: true,
    });
  } else {
    object[key] = propertyValue;
  }
}
function removeMissingMergeProperties(
  object: JsonRecord,
  source: JsonRecord,
): void {
  for (let value of Object.keys(object)) {
    if (
      !Object.hasOwn(source, value) &&
      !FILE_MIGRATION_MARKER_FIELDS.includes(value)
    ) {
      delete object[value];
    }
  }
  for (let value of Object.keys(source)) {
    setMergePropertySafely(object, value, source[value]);
  }
}
function mergeValuesEqual(left: unknown, right: unknown): boolean {
  if (left === right) {
    return true;
  }
  if (Array.isArray(left)) {
    return (
      Array.isArray(right) &&
      left.length === right.length &&
      left.every((indexValueA: unknown, indexValueB: number) =>
        mergeValuesEqual(indexValueA, right[indexValueB]),
      )
    );
  }
  if (isMergeObject(left)) {
    if (!isMergeObject(right)) {
      return false;
    }
    let value = Object.keys(left).filter(
        (indexValueC: string): boolean => left[indexValueC] !== undefined,
      ),
      comparisonValue = Object.keys(right).filter(
        (indexValueD: string): boolean => right[indexValueD] !== undefined,
      );
    return (
      value.length === comparisonValue.length &&
      value.every(
        (indexValueE: string) =>
          Object.hasOwn(right, indexValueE) &&
          mergeValuesEqual(left[indexValueE], right[indexValueE]),
      )
    );
  }
  return false;
}
function resolveChildMergeSchema(
  schema: MergeSchema,
  key: string,
  ...schemaValue: JsonMergeValue[]
): MergeSchema {
  if (schema?.kind === "map") {
    let schemaValueA =
      schema.keys !== undefined && Object.hasOwn(schema.keys, key)
        ? schema.keys[key]
        : undefined;
    if (schemaValueA) {
      return schemaValueA;
    }
    if (schema.of) {
      return schema.of;
    }
  }
  let value = schemaValue.filter(
    (indexValueF: JsonMergeValue): boolean => indexValueF !== undefined,
  );
  if (value.length > 0 && value.every(isMergeObject)) {
    return {
      kind: "map",
    };
  }
  if (value.length > 0 && value.every(isStringArray)) {
    return {
      kind: "list",
    };
  }
  return LEAF_MERGE_SCHEMA;
}
function mergeLeafValue(
  base: JsonMergeValue,
  ours: JsonMergeValue,
  theirs: JsonMergeValue,
  path: string,
  conflicts: MergeDocumentOptions,
) {
  if (mergeValuesEqual(ours, base)) {
    return theirs;
  }
  if (mergeValuesEqual(theirs, base) || mergeValuesEqual(ours, theirs)) {
    return ours;
  }
  conflicts.conflicts?.push(path);
  return theirs;
}
function uniqueMergeList(items: readonly string[]) {
  let seen = new Set();
  return items.filter((indexValueG: string) =>
    seen.has(indexValueG) ? false : (seen.add(indexValueG), true),
  );
}
function mergeOrderedStringList(
  base: readonly string[],
  ours: readonly string[],
  theirs: readonly string[],
  allowedMembers?: ReadonlySet<string> | readonly string[],
) {
  let value = uniqueMergeList(base),
    mergedListValue = uniqueMergeList(ours),
    mergedListValueA = uniqueMergeList(theirs),
    mergedListValueB: string[];
  if (mergeValuesEqual(mergedListValueA, value)) {
    mergedListValueB = [...mergedListValue];
  } else if (mergeValuesEqual(mergedListValue, value)) {
    mergedListValueB = [...mergedListValueA];
  } else {
    let values = new Set(value),
      mergedListValueC = new Set(mergedListValueA),
      mergedListValueD = new Set(mergedListValue),
      mergedListValueE = mergeValuesEqual(
        mergedListValueA.filter((indexValueH: string) => values.has(indexValueH)),
        value.filter((indexValueI: string) => mergedListValueC.has(indexValueI)),
      ),
      mergedListValueF = mergeValuesEqual(
        mergedListValue.filter((indexValueJ: string) => values.has(indexValueJ)),
        value.filter((indexValueK: string) => mergedListValueD.has(indexValueK)),
      ),
      mergedListValueG = mergedListValueE && !mergedListValueF,
      [mergedListValueH, mergedListValueI] = mergedListValueG ? [mergedListValue, mergedListValueA] : [mergedListValueA, mergedListValue],
      mergedListValueJ = new Set(mergedListValueI),
      mergedListValueK = new Set(mergedListValueH);
    mergedListValueB = mergedListValueH.filter(
      (indexValueL: string): boolean => !(values.has(indexValueL) && !mergedListValueJ.has(indexValueL)),
    );
    mergedListValueI.forEach((indexValueM: string, indexValueN: number): void => {
      if (values.has(indexValueM) || mergedListValueK.has(indexValueM)) {
        return;
      }
      let indexValueO =
          (mergedListValueG || !mergedListValueE) &&
          mergedListValueI
            .slice(indexValueN + 1)
            .every((indexValueP: string): boolean => !values.has(indexValueP)),
        indexValueQ = indexValueO ? mergedListValueB.length : 0;
      for (
        let indexValueR: number = indexValueN - 1;
        !indexValueO && indexValueR >= 0;
        indexValueR--
      ) {
        let indexValueS = mergedListValueB.indexOf(mergedListValueI[indexValueR]);
        if (indexValueS >= 0) {
          indexValueQ = indexValueS + 1;
          break;
        }
      }
      mergedListValueB.splice(indexValueQ, 0, indexValueM);
    });
  }
  if (allowedMembers !== undefined) {
    let mergedListValueL: ReadonlySet<string> =
      allowedMembers instanceof Set
        ? allowedMembers
        : new Set(allowedMembers);
    mergedListValueB = mergedListValueB.filter((indexValueT: string) => mergedListValueL.has(indexValueT));
    let values = new Set(mergedListValueB);
    for (let mergedListValueM of mergedListValueL) {
      if (!values.has(mergedListValueM)) {
        mergedListValueB.push(mergedListValueM);
      }
    }
  }
  return mergedListValueB;
}
function keyedListToMergeObject(keyedEntry: JsonMergeValue, keyField: string) {
  let items = Array.isArray(keyedEntry)
      ? keyedEntry
      : isMergeObject(keyedEntry)
        ? Object.keys(keyedEntry)
            .filter((indexValueU: string) => Object.hasOwn(keyedEntry, indexValueU))
            .map((indexValueV: string) => keyedEntry[indexValueV])
        : [],
    keyedItems: Record<string, JsonRecord> = Object.create(null);
  for (let keyedEntryA of items) {
    if (
      isMergeObject(keyedEntryA) &&
      typeof keyedEntryA[keyField] === "string" &&
      keyedEntryA[keyField] !== "" &&
      Object.keys(keyedItems).length < MAX_KEYED_MERGE_LIST_ITEMS
    ) {
      keyedItems[keyedEntryA[keyField]] = keyedEntryA;
    }
  }
  return keyedItems;
}
function mergeObjectValues(
  base: JsonRecord | undefined,
  ours: JsonRecord,
  theirs: JsonRecord,
  schema: MergeSchema,
  path: string,
  conflicts: MergeDocumentOptions,
) {
  let state: JsonRecord = {},
    value = uniqueMergeList([...Object.keys(theirs), ...Object.keys(ours)]),
    items: { key: string; schema: Extract<MergeSchema, { kind: "list" }> }[] =
      [];
  for (let mergedPropertyValue of value) {
    let [mergedPropertyValueA, mergedPropertyValueB, mergedPropertyValueC] = [
        ownMergeProperty(base, mergedPropertyValue),
        ownMergeProperty(ours, mergedPropertyValue),
        ownMergeProperty(theirs, mergedPropertyValue),
      ],
      mergedPropertyValueD: boolean = mergedPropertyValueA !== undefined,
      mergedPropertyValueE: boolean = mergedPropertyValueB !== undefined,
      mergedPropertyValueF: boolean = mergedPropertyValueC !== undefined;
    if (mergedPropertyValueD && (!mergedPropertyValueE || !mergedPropertyValueF)) {
      continue;
    }
    if (!mergedPropertyValueE) {
      setMergePropertySafely(state, mergedPropertyValue, cloneMergeValue(mergedPropertyValueC));
      continue;
    }
    if (!mergedPropertyValueF) {
      setMergePropertySafely(state, mergedPropertyValue, cloneMergeValue(mergedPropertyValueB));
      continue;
    }
    let mergedPropertyValueG = resolveChildMergeSchema(
        schema,
        mergedPropertyValue,
        mergedPropertyValueA,
        mergedPropertyValueB,
        mergedPropertyValueC,
      ),
      mergedPropertyValueH = path === "" ? mergedPropertyValue : path + "/" + mergedPropertyValue;
    if (
      mergedPropertyValueG.kind === "map" &&
      isMergeObject(mergedPropertyValueB) &&
      isMergeObject(mergedPropertyValueC)
    ) {
      setMergePropertySafely(
        state,
        mergedPropertyValue,
        mergeObjectValues(
          isMergeObject(mergedPropertyValueA) ? mergedPropertyValueA : undefined,
          mergedPropertyValueB,
          mergedPropertyValueC,
          mergedPropertyValueG,
          mergedPropertyValueH,
          conflicts,
        ),
      );
    } else if (mergedPropertyValueG.kind === "records") {
      let mergedPropertyValueI = mergeObjectValues(
        keyedListToMergeObject(mergedPropertyValueA, mergedPropertyValueG.by),
        keyedListToMergeObject(mergedPropertyValueB, mergedPropertyValueG.by),
        keyedListToMergeObject(mergedPropertyValueC, mergedPropertyValueG.by),
        {
          kind: "map",
          of: LEAF_MERGE_SCHEMA,
        },
        mergedPropertyValueH,
        conflicts,
      );
      setMergePropertySafely(
        state,
        mergedPropertyValue,
        Object.keys(mergedPropertyValueI)
          .slice(0, MAX_KEYED_MERGE_LIST_ITEMS)
          .map((indexValueW: string) => mergedPropertyValueI[indexValueW]),
      );
    } else if (
      mergedPropertyValueG.kind === "list" &&
      isStringArray(mergedPropertyValueB) &&
      isStringArray(mergedPropertyValueC)
    ) {
      setMergePropertySafely(
        state,
        mergedPropertyValue,
        mergeOrderedStringList(
          isStringArray(mergedPropertyValueA) ? mergedPropertyValueA : [],
          mergedPropertyValueB,
          mergedPropertyValueC,
        ),
      );
      items.push({
        key: mergedPropertyValue,
        schema: mergedPropertyValueG,
      });
    } else {
      setMergePropertySafely(
        state,
        mergedPropertyValue,
        cloneMergeValue(
          mergeLeafValue(mergedPropertyValueA, mergedPropertyValueB, mergedPropertyValueC, mergedPropertyValueH, conflicts),
        ),
      );
    }
  }
  for (let { key: mergedPropertyValueJ, schema: mergedPropertyValueK } of items) {
    let mergedPropertyValueL = path === "" ? mergedPropertyValueJ : path + "/" + mergedPropertyValueJ,
      mergedPropertyValueM =
        mergedPropertyValueK.membersOf !== undefined
          ? ownMergeProperty(state, mergedPropertyValueK.membersOf)
          : undefined,
      mergedPropertyValueN = isMergeObject(mergedPropertyValueM)
        ? new Set(Object.keys(mergedPropertyValueM))
        : conflicts.externalMembers?.(mergedPropertyValueL),
      mergedPropertyValueO = ownMergeProperty(state, mergedPropertyValueJ);
    if (mergedPropertyValueN !== undefined) {
      setMergePropertySafely(
        state,
        mergedPropertyValueJ,
        mergeOrderedStringList(
          mergedPropertyValueO as string[],
          mergedPropertyValueO as string[],
          mergedPropertyValueO as string[],
          mergedPropertyValueN,
        ),
      );
    }
  }
  return state;
}
function mergeDocumentValues<Value>(
  base: Value,
  ours: Value,
  theirs: Value,
  schema: MergeSchema,
  indexValueX: MergeDocumentOptions = {},
): Value {
  if (schema.kind === "map" && isMergeObject(ours) && isMergeObject(theirs)) {
    return mergeObjectValues(
      isMergeObject(base) ? base : undefined,
      ours,
      theirs,
      schema,
      "",
      indexValueX,
    ) as unknown as Value;
  }
  if (
    schema.kind === "list" &&
    isStringArray(ours) &&
    isStringArray(theirs)
  ) {
    return mergeOrderedStringList(
      isStringArray(base) ? base : [],
      ours,
      theirs,
      indexValueX.externalMembers?.(""),
    ) as unknown as Value;
  }
  return cloneMergeValue(
    mergeLeafValue(
      base as unknown as JsonMergeValue,
      ours as unknown as JsonMergeValue,
      theirs as unknown as JsonMergeValue,
      "",
      indexValueX,
    ),
  ) as Value;
}
function sortIndexDocumentKeys(
  value: JsonMergeValue,
  root: boolean,
): JsonMergeValue;
function sortIndexDocumentKeys(value: unknown, root: boolean): unknown;
function sortIndexDocumentKeys(sortedValue: unknown, root: boolean): unknown {
  if (Array.isArray(sortedValue)) {
    return sortedValue.map((indexValueY: unknown) => sortIndexDocumentKeys(indexValueY, false));
  }
  if (!isMergeObject(sortedValue)) {
    return sortedValue;
  }
  let result = Object.keys(sortedValue)
    .filter((indexValueZ: string): boolean => sortedValue[indexValueZ] !== undefined)
    .sort();
  if (root) {
    let sortedValueA = result.indexOf("v");
    if (sortedValueA > 0) {
      result.splice(sortedValueA, 1);
      result.unshift("v");
    }
  }
  let state: JsonRecord = {};
  for (let sortedValueB of result) {
    setMergePropertySafely(
      state,
      sortedValueB,
      sortIndexDocumentKeys(sortedValue[sortedValueB], false),
    );
  }
  return state;
}
function serializeIndexDocument(index: unknown): string {
  return (
    JSON.stringify(sortIndexDocumentKeys(index, true), null, 2) +
    `
`
  );
}
function createIndexFileStore<Index extends { v: number }>(
  storeValue: IndexFileStoreOptions<Index>,
): IndexFileStore<Index> {
  let value = storeValue.empty(),
    storeValueA = cloneMergeValue(value),
    storeValueB: string | null = null,
    storeValueC: IndexStoreBinder | undefined,
    items: string[] = [],
    flag: boolean = false;
  function storeValueD(serializedText: string): Index {
    let parsedIndex: JsonMergeValue;
    try {
      parsedIndex = JSON.parse(serializedText);
    } catch {
      throw new IndexFileError("unreadable", storeValue.path + " is not JSON");
    }
    if (!isMergeObject(parsedIndex) || typeof parsedIndex.v !== "number") {
      throw new IndexFileError(
        "unreadable",
        storeValue.path + " has no numeric v",
      );
    }
    let emptyIndex = storeValue.empty();
    if (parsedIndex.v > (storeValue.maxVersion ?? emptyIndex.v)) {
      throw new IndexFileError(
        "newer_version",
        storeValue.path +
          " was written by a newer editor (v " +
          String(parsedIndex.v) +
          ")",
      );
    }
    for (let [propertyKey, indexValue_] of Object.entries(emptyIndex)) {
      if (propertyKey === "v") {
        continue;
      }
      let propertyKind: string | string | undefined = Array.isArray(indexValue_)
        ? "array"
        : isMergeObject(indexValue_)
          ? "object"
          : undefined;
      if (propertyKind === undefined) {
        continue;
      }
      let indexValuea = parsedIndex[propertyKey],
        indexValueb =
          storeValue.schema.kind === "map"
            ? storeValue.schema.keys?.[propertyKey]
            : undefined;
      if (
        indexValueb?.kind === "records" &&
        propertyKind === "array" &&
        isMergeObject(indexValuea)
      ) {
        let indexValuec = keyedListToMergeObject(indexValuea, indexValueb.by);
        parsedIndex[propertyKey] = Object.keys(indexValuec).map(
          (indexValued: string) => indexValuec[indexValued],
        );
        continue;
      }
      if (
        (propertyKind === "array" && !Array.isArray(indexValuea)) ||
        (propertyKind === "object" && !isMergeObject(indexValuea))
      ) {
        parsedIndex[propertyKey] = indexValue_;
      }
    }
    return parsedIndex as unknown as Index;
  }
  let callback = (): void => {
      flag = true;
      storeValueC?.(storeValue.path, () => state.serialize(), storeValueB);
    },
    state: IndexFileStore<Index> = {
      path: storeValue.path,
      parse: storeValueD,
      async load(): Promise<Index> {
        let indexValuee: Files.FileTextRead;
        try {
          indexValuee = await storeValue.port.readText(storeValue.path);
        } catch (indexValuef: unknown) {
          throw new IndexFileError(
            "not_found",
            storeValue.path +
              ": " +
              (indexValuef instanceof Error
                ? indexValuef.message
                : String(
                    (indexValuef as { message?: unknown } | null)?.message ??
                      indexValuef,
                  )),
          );
        }
        value = storeValueD(indexValuee.text);
        storeValueA = cloneMergeValue(value);
        storeValueB = indexValuee.sha256;
        flag = false;
        return value;
      },
      loadText(indexValueg: string, indexValueh: string | null) {
        value = storeValueD(indexValueg);
        storeValueA = cloneMergeValue(value);
        storeValueB = indexValueh;
        flag = false;
        return value;
      },
      init(indexValuei?: Index) {
        value = indexValuei ?? storeValue.empty();
        storeValueA = storeValue.empty();
        storeValueB = null;
        callback();
        return value;
      },
      get: () => value,
      base: () => storeValueA,
      baseSha: () => storeValueB,
      dirty: (): boolean => flag,
      lastConflicts: () => [...items],
      update(indexValuej: (value: Index) => void): void {
        indexValuej(value);
        callback();
      },
      mergeFrom(indexValuek: Index) {
        items = [];
        value = preserveFileMigrationMarkers(
          mergeDocumentValues(storeValueA, value, indexValuek, storeValue.schema, {
            conflicts: items,
            externalMembers: storeValue.externalMembers,
          }),
          indexValuek,
          storeValueA,
        ) as Index;
        storeValueA = cloneMergeValue(indexValuek);
        return value;
      },
      serialize: () =>
        serializeIndexDocument(preserveFileMigrationMarkers(value, storeValueA)),
      bind(indexValuel: IndexStoreBinder): void {
        storeValueC = indexValuel;
      },
      markSaved(indexValuem: string, indexValuen: string): void {
        try {
          storeValueA = JSON.parse(indexValuem);
        } catch {
          storeValueA = cloneMergeValue(value);
        }
        storeValueB = indexValuen;
        flag = !mergeValuesEqual(storeValueA, value);
      },
      async reloadAndMerge(): Promise<string[]> {
        let indexValueo = await storeValue.port.readText(storeValue.path);
        if (indexValueo.sha256 === storeValueB) {
          return [];
        }
        state.mergeFrom(storeValueD(indexValueo.text));
        storeValueB = indexValueo.sha256;
        flag = !mergeValuesEqual(storeValueA, value);
        if (flag) {
          storeValueC?.(storeValue.path, () => state.serialize(), storeValueB);
        }
        return [...items];
      },
    };
  return state;
}
export {
  cloneMergeValue,
  createIndexFileStore,
  encodeFileUtf8,
  FILE_MIGRATION_MARKER_FIELDS,
  IndexFileError,
  isMergeObject,
  isStringArray,
  keyedListToMergeObject,
  LEAF_MERGE_SCHEMA,
  MAX_KEYED_MERGE_LIST_ITEMS,
  mergeDocumentValues,
  mergeLeafValue,
  mergeObjectValues,
  mergeOrderedStringList,
  mergeValuesEqual,
  ownMergeProperty,
  preserveFileMigrationMarkers,
  removeMissingMergeProperties,
  resolveChildMergeSchema,
  serializeIndexDocument,
  setMergePropertySafely,
  sha256,
  SHA256_ROUND_CONSTANTS,
  sha256Sync,
  sha256TextEncoder,
  sortIndexDocumentKeys,
  uniqueMergeList,
};
export function installEditorIndexFileStore(): () => void {
  return () => {
    SHA256_ROUND_CONSTANTS = new Uint32Array([
      1116352408, 1899447441, 3049323471, 3921009573, 961987163, 1508970993,
      2453635748, 2870763221, 3624381080, 310598401, 607225278, 1426881987,
      1925078388, 2162078206, 2614888103, 3248222580, 3835390401, 4022224774,
      264347078, 604807628, 770255983, 1249150122, 1555081692, 1996064986,
      2554220882, 2821834349, 2952996808, 3210313671, 3336571891, 3584528711,
      113926993, 338241895, 666307205, 773529912, 1294757372, 1396182291,
      1695183700, 1986661051, 2177026350, 2456956037, 2730485921, 2820302411,
      3259730800, 3345764771, 3516065817, 3600352804, 4094571909, 275423344,
      430227734, 506948616, 659060556, 883997877, 958139571, 1322822218,
      1537002063, 1747873779, 1955562222, 2024104815, 2227730452, 2361852424,
      2428436474, 2756734187, 3204031479, 3329325298,
    ]);
    sha256TextEncoder = new TextEncoder();
    encodeFileUtf8 = (text: string) => sha256TextEncoder.encode(text);
    FILE_MIGRATION_MARKER_FIELDS = ["convertedFrom", "createdOnFiles"];
    isMergeObject = (indexValuep: unknown): indexValuep is JsonRecord =>
      typeof indexValuep === "object" && indexValuep !== null && !Array.isArray(indexValuep);
    isStringArray = (indexValueq: unknown): indexValueq is string[] =>
      Array.isArray(indexValueq) &&
      indexValueq.every((indexValuer: unknown): boolean => typeof indexValuer === "string");
    ownMergeProperty = (object: JsonRecord | undefined, key: string) =>
      object !== undefined && Object.hasOwn(object, key)
        ? object[key]
        : undefined;
    cloneMergeValue = <T>(indexValues: T): T =>
      indexValues === undefined ? indexValues : JSON.parse(JSON.stringify(indexValues));
    LEAF_MERGE_SCHEMA = {
      kind: "leaf",
    };
    MAX_KEYED_MERGE_LIST_ITEMS = 64;
    IndexFileError = class IndexFileError extends Error {
      declare name: string;
      code: IndexFileErrorCode;
      constructor(indexValuet: IndexFileErrorCode, indexValueu: string) {
        super(indexValueu);
        this.code = indexValuet;
        this.name = "IndexFileError";
      }
    };
  };
}
