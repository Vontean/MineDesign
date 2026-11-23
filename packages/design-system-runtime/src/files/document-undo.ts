import { uiMessage } from "@minedesign/contracts/ui-messages";
import type * as Core from "../contracts";
import type * as M from "../contracts/design-system-document";
import type * as F from "../contracts/files-core";
import { buildFilesIndex, projectFilePath } from "../editor/files-index";
import { changedProjectFilePaths, mergeDesignSystemFiles, mergeFilesIndex, supportsDroppedPaths } from "../editor/files-merge";
import { cloneMergeValue, mergeValuesEqual } from "../editor/index-file-store";
import { refreshManifest } from "../model/asset-commands";
import { freezeSortedFileTable } from "../model/file-commands";
import { FILE_CONFLICT_CHOICE_SUFFIX, fileBaseName, summarizeFileNames } from "./carry";
import { describeIndexConflicts, indexPresentationField, indexUndoForeignChanges } from "./index-conflicts";
import { fileContentsSemanticallyEqual, isTokenFilePath, mergeSupportedFileThreeWays } from "./token-merge";
import type { FileClash } from "./file-clash";

/**
 * 撤销栈所需的事实与动作。document 与 flagClashingFile 来自声明靠后或循环依赖的绑定，
 * 由外部以 getter 或函数提供，调用时才读取。flags、pathRevisions 与文档其他部分共享，由外部持有。
 */
export interface DocumentUndoContext {
  readonly document: M.BaseFilesDocument;
  readonly flags: Map<string, M.DocumentFlag>;
  readonly pathRevisions: Map<string, number>;
  emit(eventType: string, eventData?: unknown): void;
  notice(message: string): void;
  liveSha(filePath: string): string | null | undefined;
  flagClashingFile: FileClash["flagClashingFile"];
  flushNow(): void;
}

export interface DocumentUndo {
  /** 创建并登记一条撤销命令；超过 400 条时丢掉最旧的。 */
  createUndoCommand(undoFilePath: string, capturePair: () => M.DocumentUndoPair, commandState?: { applied?: boolean }): M.UndoCommand;
  /** 记录别人对索引的改动（暂存，flush 后才编号入账）。 */
  recordForeignIndexChanges(foreignIndex?: Core.FilesIndex): void;
  /** 暂存的改动编号入账，并修剪不再被任何撤销命令需要的旧记录。 */
  flushForeignIndexChanges(): void;
  /** 路径被对方改动或删除后，从撤销命令里剔除这些路径。 */
  pruneUndoPaths(paths: ReadonlySet<string>, reason: string, includeContext?: boolean): void;
  /** 让所有撤销命令不再动这些路径。 */
  keepOut(paths: Iterable<string>): void;
  /** 路径令牌已被本地有意推进：撤销命令把它当作自己的。 */
  retoken(filePath: string): void;
  /** 本地保留了我方的索引呈现字段：命令跨过对方的索引改动。 */
  spanTheirs(paths: readonly string[], indexOverrides: Core.FilesIndex): void;
  bindUndoStack(stack: F.FileMutationBatch): void;
  /** 最近一次已知的索引基线。 */
  indexBase(): Core.FilesIndex | undefined;
  setIndexBase(index: Core.FilesIndex): void;
  /** 在线后若还没有基线，用当前索引作基线。 */
  ensureIndexBase(): void;
  /** 发送索引时登记基线（最多保留 4 个）；索引发布完成后清空。 */
  notePublishingIndex(indexText: string): void;
  clearPublishingIndexes(): void;
}

export function createDocumentUndo(context: DocumentUndoContext): DocumentUndo {
  const { emit, notice, pathRevisions } = context;
  let UNDO_INDEX_FIELDS: (keyof Core.FilesIndex)[] = [
      "libraries",
      "sections",
      "groups",
      "assetGroups",
      "blobs",
      "namespace",
    ],
    foreignIndexChanges: M.ForeignIndexChange[] = [],
    nextForeignChangeSeq: number = 0,
    pendingForeignIndexChanges: F.FileIndexDelta[] = [],
    lastIndexBase: Core.FilesIndex | undefined,
    publishingIndexBases: Core.FilesIndex[] = [],
    undoStack: F.FileMutationBatch | undefined,
    undoCommands: M.UndoCommand[] = [];
  function recordForeignIndexChanges(foreignIndex?: Core.FilesIndex): void {
    let value = context.document.index().base();
    if (
      publishingIndexBases.some((publishingIndex) =>
        mergeValuesEqual(publishingIndex, value),
      )
    ) {
      lastIndexBase = cloneMergeValue(value);
      return;
    }
    if (foreignIndex !== undefined) {
      let state: Partial<Core.FilesIndex> = {},
        foreignChanges: Partial<Core.FilesIndex> = {};
      for (let fieldName of UNDO_INDEX_FIELDS) {
        if (!mergeValuesEqual(foreignIndex[fieldName], value[fieldName])) {
          (
            state as Record<
              keyof Core.FilesIndex,
              Core.FilesIndex[keyof Core.FilesIndex]
            >
          )[fieldName] = cloneMergeValue(foreignIndex[fieldName]);
          (
            foreignChanges as Record<
              keyof Core.FilesIndex,
              Core.FilesIndex[keyof Core.FilesIndex]
            >
          )[fieldName] = cloneMergeValue(value[fieldName]);
        }
      }
      if (Object.keys(foreignChanges).length + Object.keys(state).length > 0) {
        pendingForeignIndexChanges.push({
          from: state,
          to: foreignChanges,
        });
      }
    }
    lastIndexBase = cloneMergeValue(value);
  }
  function flushForeignIndexChanges(): void {
    for (let change of pendingForeignIndexChanges.splice(0)) {
      foreignIndexChanges.push({
        ...change,
        seq: nextForeignChangeSeq++,
      });
    }
    let value: number = foreignIndexChanges.length - 32;
    for (
      let index: number = 0;
      value > 0 && index < foreignIndexChanges.length;

    ) {
      let seq = foreignIndexChanges[index].seq;
      if (
        foreignIndexChanges.length <= 2000 &&
        undoCommands.some((undoCommand, commandIndex) =>
          undoCommand.needsTheirs(seq, commandIndex === undoCommands.length - 1),
        )
      ) {
        index++;
        continue;
      }
      foreignIndexChanges.splice(index, 1);
      value--;
    }
  }
  function pruneUndoPaths(
    paths: ReadonlySet<string>,
    reason: string,
    includeContext = false,
  ): void {
    let index: number = 0,
      droppedCount: number = 0;
    for (let value of undoCommands) {
      let dropResult = value.dropPaths(paths);
      if (dropResult === "emptied") {
        droppedCount++;
      } else if (dropResult === "trimmed") {
        index++;
      }
    }
    if (droppedCount > 0) {
      undoStack?.prune(
        (undoCommand) =>
          supportsDroppedPaths(undoCommand as M.UndoCommand) &&
          (undoCommand as M.UndoCommand).dropped,
      );
    }
    for (let value: number = undoCommands.length - 1; value >= 0; value--) {
      if (undoCommands[value].dropped) {
        undoCommands.splice(value, 1);
      }
    }
    if (droppedCount + index === 0) {
      return;
    }
    emit("undo-pruned", {
      paths: [...paths].map(projectFilePath),
      why: reason,
      entriesDropped: droppedCount,
      entriesTrimmed: index,
    });
    if (!includeContext) {
      notice(
        uiMessage("design-system.designSystemDocument.someoneElseChanged") +
          summarizeFileNames([...paths]) +
          ", so your earlier edits to " +
          (paths.size === 1 ? "it" : "them") +
          " can no longer be undone from here.",
      );
    }
  }
  function applyUndoDelta(
    mergeDelta: F.FileMergeResult,
    direction: "undo" | "redo",
    description: string,
  ): void {
    let state = {
      label: description,
      files: mergeDelta.files.map(projectFilePath),
      index: mergeDelta.index,
      indexOnly: mergeDelta.index && mergeDelta.files.length === 0,
      localOnly: mergeDelta.localOnly.map(projectFilePath),
      skipped: mergeDelta.skipped.map(projectFilePath),
      indexKept: mergeDelta.indexKept,
    };
    if (mergeDelta.empty) {
      emit(direction, {
        ...state,
        nothing: true,
      });
      if (mergeDelta.skipped.length + mergeDelta.indexKept.length > 0) {
        notice(
          uiMessage("design-system.designSystemDocument.nothingTo") +
            direction +
            " there any more: " +
            [
              ...mergeDelta.skipped.map(fileBaseName),
              ...describeIndexConflicts(
                mergeDelta.indexKept,
                context.document.index().get(),
              ),
            ].join(", ") +
            " changed since.",
        );
      }
      return;
    }
    let value = refreshManifest(
      {
        v: 2,
        files: freezeSortedFileTable(mergeDelta.next),
      },
      context.document.title(),
    );
    context.document.setContent(value);
    for (let filePath of mergeDelta.localOnly) {
      context.flagClashingFile(
        filePath,
        "undo",
        context.liveSha(filePath),
        uiMessage("design-system.designSystemDocument.someoneElseSavedANewer") +
          fileBaseName(filePath) +
          " since that step. Your " +
          direction +
          " shows here but was not saved over theirs." +
          FILE_CONFLICT_CHOICE_SUFFIX,
      );
    }
    if (mergeDelta.indexKept.length > 0) {
      notice(
        uiMessage("design-system.designSystemDocument.partOfThat") +
          direction +
          " was left as it is because someone else changed it since: " +
          describeIndexConflicts(
            mergeDelta.indexKept,
            context.document.index().get(),
          ).join(", ") +
          ".",
      );
    }
    emit(direction, state);
    context.flushNow();
  }
  let mergeUndoTokenText = (
    filePath: string,
    remoteText: string,
    baseText: string,
    localText: string,
  ) => {
    if (
      !isTokenFilePath(filePath) ||
      context.flags.has(filePath) ||
      context.document.held().has(projectFilePath(filePath))
    ) {
      return null;
    }
    let mergeResult = mergeSupportedFileThreeWays(
      filePath,
      remoteText,
      baseText,
      localText,
    );
    if (mergeResult === null || !mergeResult.ok) {
      return null;
    }
    if (
      fileContentsSemanticallyEqual(filePath, mergeResult.text, localText)
    ) {
      return localText;
    } else {
      return mergeResult.text;
    }
  };
  function createUndoCommand(
    undoFilePath: string,
    capturePair: () => M.DocumentUndoPair,
    commandState: { applied?: boolean } = {},
  ) {
    let entries = new Map(pathRevisions),
      value: number = nextForeignChangeSeq,
      endSeq: number = nextForeignChangeSeq,
      nextEndSeq: number = nextForeignChangeSeq,
      values = new Set<string>(),
      excludedPaths = new Set<string>(),
      flag: boolean = false,
      wasApplied: boolean = commandState.applied === true,
      callback = (filePath: string) =>
        context.flags.has(filePath) ||
        context.document.held().has(projectFilePath(filePath)) ||
        (entries.get(filePath) ?? 0) !== (pathRevisions.get(filePath) ?? 0),
      applyDirection = (direction: "undo" | "redo"): void => {
        let { before: beforeState, after: afterState } = capturePair(),
          selectedState = direction === "undo" ? afterState : beforeState,
          previousState = direction === "undo" ? beforeState : afterState,
          earlierChanges = foreignIndexChanges.filter(
            (change) => change.seq >= value && change.seq < endSeq,
          ),
          laterChanges = foreignIndexChanges.filter(
            (change) => change.seq >= endSeq && change.seq < nextEndSeq,
          ),
          applyForeignChanges = () =>
            earlierChanges.reduce(
              (indexState: Core.FilesIndex, indexDelta: F.FileIndexDelta) =>
                mergeFilesIndex(
                  indexDelta.from,
                  indexDelta.to,
                  indexState,
                ).index,
              buildFilesIndex(context.document.title(), beforeState.files),
            ),
          items = [
            ...earlierChanges,
            ...(laterChanges.length > 0
              ? [
                  indexUndoForeignChanges(
                    laterChanges,
                    values,
                    applyForeignChanges(),
                  ),
                ]
              : []),
          ];
        applyUndoDelta(
          mergeDesignSystemFiles(
            context.document.content().files,
            context.document.title(),
            selectedState.files,
            previousState.files,
            {
              stale: callback,
              excluded: excludedPaths,
              merge: mergeUndoTokenText,
              theirIndex: items,
              earlierSide: direction === "undo" ? "to" : "from",
            },
          ),
          direction,
          undoFilePath,
        );
        entries = new Map(pathRevisions);
      },
      state: M.UndoCommand = {
        label: undoFilePath,
        do(): void {
          if (!wasApplied) {
            wasApplied = true;
            context.document.setContent(capturePair().after);
            entries = new Map(pathRevisions);
            return;
          }
          applyDirection("redo");
        },
        undo(): void {
          applyDirection("undo");
        },
        touch(): void {
          entries = new Map(pathRevisions);
          endSeq = nextForeignChangeSeq;
        },
        spanTheirs(paths, indexOverrides): void {
          if (flag) {
            return;
          }
          let { before: beforeState, after: afterState } = capturePair(),
            beforeIndex: Core.FilesIndex = buildFilesIndex(
              context.document.title(),
              afterState.files,
            ),
            afterIndex: Core.FilesIndex = buildFilesIndex(
              context.document.title(),
              beforeState.files,
            ),
            changedPaths = paths.filter((path) => {
              let field = indexPresentationField(
                indexOverrides,
                path,
              );
              return (
                field !== undefined &&
                indexPresentationField(beforeIndex, path) ===
                  field &&
                indexPresentationField(afterIndex, path) !==
                  field
              );
            });
          if (changedPaths.length > 0) {
            nextEndSeq = nextForeignChangeSeq;
            for (let path of changedPaths) {
              values.add(path);
            }
          }
        },
        needsTheirs: (sequence, isLastCommand) =>
          !flag &&
          sequence >= value &&
          (isLastCommand || sequence < Math.max(endSeq, nextEndSeq)),
        retoken(filePath): void {
          if (pathRevisions.has(filePath)) {
            entries.set(filePath, pathRevisions.get(filePath)!);
          }
        },
        keepOut(paths): void {
          if (flag) {
            return;
          }
          let { before: beforeState, after: afterState } = capturePair();
          for (let filePath of paths) {
            if (beforeState.files[filePath] === afterState.files[filePath]) {
              excludedPaths.add(filePath);
            }
          }
        },
        dropPaths(paths): "untouched" | "emptied" | "trimmed" {
          if (flag) {
            return "untouched";
          }
          let { before: beforeState, after: afterState } = capturePair(),
            changedFiles = changedProjectFilePaths(
              beforeState.files,
              afterState.files,
              context.document.title(),
            ),
            hasChangedPath: boolean = false;
          for (let filePath of changedFiles.files) {
            if (paths.has(filePath) && !excludedPaths.has(filePath)) {
              excludedPaths.add(filePath);
              hasChangedPath = true;
            }
          }
          if (!hasChangedPath) {
            return "untouched";
          }
          if (
            !changedFiles.index &&
            changedFiles.files.every((filePath) => excludedPaths.has(filePath))
          ) {
            flag = true;
            return "emptied";
          }
          return "trimmed";
        },
        get dropped(): boolean {
          return flag;
        },
        leavesAlone: (filePath) => excludedPaths.has(filePath),
      };
    undoCommands.push(state);
    if (undoCommands.length > 400) {
      undoCommands.splice(0, undoCommands.length - 400);
    }
    return state;
  }
  return {
    createUndoCommand,
    recordForeignIndexChanges,
    flushForeignIndexChanges,
    pruneUndoPaths,
    keepOut(paths): void {
      for (let undoCommand of undoCommands) {
        undoCommand.keepOut(paths);
      }
    },
    retoken(filePath): void {
      for (let undoCommand of undoCommands) {
        undoCommand.retoken(filePath);
      }
    },
    spanTheirs(paths, indexOverrides): void {
      for (let undoCommand of undoCommands) {
        undoCommand.spanTheirs(paths, indexOverrides);
      }
    },
    bindUndoStack(stack): void {
      undoStack = stack;
    },
    indexBase: () => lastIndexBase,
    setIndexBase(index): void {
      lastIndexBase = index;
    },
    ensureIndexBase(): void {
      if (lastIndexBase === undefined) {
        lastIndexBase = cloneMergeValue(context.document.index().base());
      }
    },
    notePublishingIndex(indexText): void {
      try {
        publishingIndexBases.push(JSON.parse(indexText));
        if (publishingIndexBases.length > 4) {
          publishingIndexBases.shift();
        }
      } catch {}
    },
    clearPublishingIndexes(): void {
      publishingIndexBases.length = 0;
    },
  };
}
