import type * as Core from "../contracts";
import type * as M from "../contracts/design-system-document";
import type * as F from "../contracts/files-core";
import { HOT_CARRY_MAX_AGE_MS, HOT_CARRY_MAX_FILES, HOT_CARRY_MAX_TOTAL_CHARS, parseCarriedFileEdit, readCarriedIndexEdit } from "./carry";

interface CarryStorageOptions {
  storage: Pick<Storage, "getItem" | "setItem" | "removeItem"> | null | undefined;
  carryStorageKey: string;
  timers: Pick<Core.FilesTimers, "now">;
  emit(eventType: string, eventData?: unknown): void;
}

/** 缓存暂时超出内联限制的编辑，恢复后按文件消费。 */
export function createCarryStorage({ storage, carryStorageKey, timers, emit }: CarryStorageOptions) {
  function readCarryStorage(): M.CarryStorageState {
    let state: M.CarryStorageState = {
        v: 1,
        files: {},
      },
      value: string | null = null;
    try {
      value = storage?.getItem(carryStorageKey) ?? null;
    } catch {
      return state;
    }
    if (value === null) {
      return state;
    }
    try {
      let carryStorage = JSON.parse(value) as M.CarryStorageWire,
        storageTimestamp = timers.now(),
        callback = (timestamp: unknown): timestamp is number =>
          typeof timestamp === "number" &&
          storageTimestamp - timestamp <= HOT_CARRY_MAX_AGE_MS;
      for (let [filePath, carriedFile] of Object.entries(carryStorage.files ?? {})) {
        let parsedEdit = parseCarriedFileEdit(carriedFile),
          editTimestamp = carriedFile?.at;
        if (parsedEdit !== undefined && callback(editTimestamp)) {
          state.files[filePath] = {
            ...parsedEdit,
            at: editTimestamp,
          };
        }
      }
      let carriedIndex = readCarriedIndexEdit(carryStorage.index),
        indexTimestamp = carryStorage.index?.at;
      if (carriedIndex !== undefined && callback(indexTimestamp)) {
        state.index = {
          ...carriedIndex,
          at: indexTimestamp,
        };
      }
    } catch {}
    return state;
  }
  function writeCarryStorage(carryState: M.CarryStorageState): void {
    try {
      if (
        Object.keys(carryState.files).length === 0 &&
        carryState.index === undefined
      ) {
        storage?.removeItem(carryStorageKey);
      } else {
        storage?.setItem(carryStorageKey, JSON.stringify(carryState));
      }
    } catch {}
  }
  function stashOversizedCarry(
    carriedFiles: Record<string, F.CarriedFileEdit>,
    carriedIndex?: F.CarriedIndexEdit,
  ): void {
    if (
      storage === null ||
      storage === undefined ||
      (Object.keys(carriedFiles).length === 0 && carriedIndex === undefined)
    ) {
      return;
    }
    let value = readCarryStorage(),
      savedAt = timers.now(),
      callback = (fileEdit: F.CarriedFileEdit) =>
        fileEdit.text.length + (fileEdit.baseText?.length ?? 0),
      totalChars = Object.values(value.files).reduce(
        (runningTotal, nextFileEdit) => runningTotal + callback(nextFileEdit),
        0,
      );
    for (let [filePath, fileEdit] of Object.entries(carriedFiles)) {
      if (
        !(filePath in value.files) &&
        Object.keys(value.files).length >= HOT_CARRY_MAX_FILES
      ) {
        continue;
      }
      if (totalChars + callback(fileEdit) > HOT_CARRY_MAX_TOTAL_CHARS) {
        continue;
      }
      value.files[filePath] = {
        ...fileEdit,
        at: savedAt,
      };
      totalChars += callback(fileEdit);
    }
    if (carriedIndex !== undefined) {
      value.index = {
        ...carriedIndex,
        at: savedAt,
      };
    }
    writeCarryStorage(value);
  }
  function consumeCarryStorage(
    requestedPaths: readonly string[],
    includeCarriedIndex?: boolean,
  ): { files: Map<string, F.CarriedFileEdit>; index?: F.CarriedIndexEdit } {
    let value = readCarryStorage(),
      entries = new Map<string, F.CarriedFileEdit>();
    for (let filePath of requestedPaths) {
      let fileEdit = value.files[filePath];
      if (fileEdit === undefined) {
        continue;
      }
      entries.set(filePath, {
        text: fileEdit.text,
        ...(fileEdit.base !== undefined
          ? {
              base: fileEdit.base,
            }
          : {}),
        ...(fileEdit.baseText !== undefined
          ? {
              baseText: fileEdit.baseText,
            }
          : {}),
      });
      delete value.files[filePath];
    }
    let carriedIndex =
      includeCarriedIndex && value.index !== undefined
        ? {
            base: value.index.base,
            mine: value.index.mine,
          }
        : undefined;
    if (includeCarriedIndex) {
      delete value.index;
    }
    writeCarryStorage(value);
    return {
      files: entries,
      ...(carriedIndex !== undefined
        ? {
            index: carriedIndex,
          }
        : {}),
    };
  }
  function clearCarriedFiles(paths: readonly string[]): void {
    let value = readCarryStorage(),
      flag: boolean = false;
    for (let filePath of paths) {
      if (filePath in value.files) {
        delete value.files[filePath];
        flag = true;
      }
    }
    if (flag) {
      writeCarryStorage(value);
    }
  }
  function purgeCarryStorage(reason: string): void {
    try {
      storage?.removeItem(carryStorageKey);
    } catch {}
    emit("carry-purged", {
      why: reason,
    });
  }
  return { stashOversizedCarry, consumeCarryStorage, clearCarriedFiles, purgeCarryStorage };
}
