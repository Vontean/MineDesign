import { uiMessage } from "@minedesign/contracts/ui-messages";
import type * as Core from "../contracts";
import type * as M from "../contracts/design-system-document";
import type * as F from "../contracts/files-core";
import { encodeFileIndexKey, projectFilePath, projectFilesForSave, relativeProjectFilePath, restoreFilesFromIndex } from "../editor/files-index";
import { mergeFilesIndex } from "../editor/files-merge";
import { mergeValuesEqual } from "../editor/index-file-store";
import { isTextFilePath } from "../model/file-policy";
import { refreshManifest } from "../model/asset-commands";
import { FILE_CONFLICT_CHOICE_SUFFIX, fileBaseName, readCarriedFileEdits, readCarriedIndexEdit, restoreDesignSystemView, summarizeFileNames } from "./carry";
import type { createCarryStorage } from "./carry-storage";
import { CRASH_STASH_RETENTION_LABEL } from "./crash-stash";
import { describeIndexConflicts, HOT_CARRY_PROTOCOL_FIELD, indexAuthoredFieldsEqual, isGeneratedIndexField } from "./index-conflicts";
import { fileContentsSemanticallyEqual, mergeSupportedFileThreeWays } from "./token-merge";

/**
 * 恢复流程所需的事实与动作。document、queue 等声明靠后的绑定用 getter 提供，
 * 在调用时才读取，避免过期闭包和 TDZ。
 */
export interface HotCarryRestoreContext {
  readonly document: M.BaseFilesDocument;
  readonly queue: { withdraw(path: string): void };
  readonly documentOptions: Pick<M.DesignSystemFilesDocumentOptions, "restoreView" | "saveStash" | "port">;
  readonly indexPath: string;
  readonly flags: Map<string, M.DocumentFlag>;
  readonly flaggedPaths: Set<string>;
  readonly noticedClashShas: Map<string, string | null | undefined>;
  readonly timers: Pick<Core.FilesTimers, "now">;
  emit(eventType: string, eventData?: unknown): void;
  notice(message: string): void;
  consumeCarryStorage: ReturnType<typeof createCarryStorage>["consumeCarryStorage"];
  currentFileText(filePath: string): string | null;
  liveSha(filePath: string): string | null | undefined;
  replaceFileText(filePath: string, fileText: string): void;
  flagClashingFile(filePath: string, clashReason: string, baseSha: string | null | undefined, detailMessage?: string): void;
  notifyFlags(): void;
  flushNow(): void;
}

export interface HotCarryRestorer {
  /** 热重载后恢复上一页携带的未保存编辑；整个文档生命周期只消费一次。 */
  restore(carryInput: M.RawHotCarry | null | undefined): void;
  /** 远端更新落地后，为“恢复时误报删除、其实已保存”的文件补发提示。 */
  announceLateRemovals(appliedRows: readonly F.FilesRemoteAppliedRow[]): void;
}

export function createHotCarryRestorer(context: HotCarryRestoreContext): HotCarryRestorer {
  const { documentOptions, indexPath, flags, flaggedPaths, noticedClashShas, timers, emit, notice,
    consumeCarryStorage, currentFileText, liveSha, replaceFileText, flagClashingFile, notifyFlags } = context;
  // 以下状态只属于恢复流程
  const flaggedRestoreEdits = new Map<string, F.CarriedFileEdit>();
  const lateRemovalNoticePaths = new Set<string>();
  let restoreConsumed = false;

  function announceLateRemovals(appliedRows: readonly F.FilesRemoteAppliedRow[]): void {
    let value = [...lateRemovalNoticePaths].filter((filePath) =>
      appliedRows.some(
        (row) =>
          row.decision === "removed" &&
          relativeProjectFilePath(row.path) === filePath,
      ),
    );
    lateRemovalNoticePaths.clear();
    if (value.length > 0) {
      emit("restore-landed-late", {
        paths: value.map(projectFilePath),
      });
      notice(
        uiMessage("design-system.designSystemDocument.thePageSaidAMoment") +
          summarizeFileNames(value) +
          " did not go through. It did: it had already been sent when the page reloaded, and it has been saved now. There is nothing to do again.",
      );
    }
  }
    function restoreHotCarry(carryInput: M.RawHotCarry | null | undefined) {
      if (carryInput === undefined || carryInput === null || restoreConsumed) {
        return;
      }
      restoreConsumed = true;
      let value = carryInput,
        hasValidIndex: boolean =
          (carryInput as Record<string, unknown>)[
            HOT_CARRY_PROTOCOL_FIELD
          ] === 1,
        unsavedPaths = hasValidIndex
          ? []
          : [
              ...new Set([
                ...(Array.isArray(value.unsavedNames)
                  ? (value.unsavedNames as unknown[]).filter(
                      (candidate: unknown): candidate is string =>
                        typeof candidate === "string",
                    )
                  : [
                      ...readCarriedFileEdits(
                        carryInput,
                        "unsaved",
                      ).keys(),
                    ]),
                ...(typeof value.removed === "object" && value.removed !== null
                  ? Object.keys(value.removed)
                  : []),
              ]),
            ].slice(0, 200);
      if (
        !hasValidIndex &&
        (unsavedPaths.length > 0 ||
          value.indexUnsaved === true ||
          value.index !== undefined)
      ) {
        let {
          unsaved: unsavedFiles,
          unsavedNames: unsavedNames,
          removed: removedFiles,
          index: carriedIndex,
          indexUnsaved: indexIsUnsaved,
          binariesLeft: remainingBinaries,
          ...carryEdits
        } = carryInput;
        consumeCarryStorage(unsavedPaths, true);
        emit("restore-lost", {
          paths: unsavedPaths.map(projectFilePath),
          why: "the page that reloaded was an older build",
        });
        notice(
          uiMessage("design-system.designSystemDocument.thePageReloadedAndYour") +
            (unsavedPaths.length > 0
              ? " to " + summarizeFileNames(unsavedPaths)
              : "") +
            " could not be carried across. What is saved is shown; those changes are gone.",
        );
        return void restoreHotCarryEdits(carryEdits);
      }
      restoreHotCarryEdits(carryInput);
    }
    function restoreHotCarryEdits(carryInput: M.RawHotCarry): void {
      let value = carryInput,
        allPaths = (
          documentOptions.restoreView ??
          ((viewState) => restoreDesignSystemView(viewState))
        )(carryInput),
        flaggedFiles = readCarriedFileEdits(carryInput),
        unsavedFiles = readCarriedFileEdits(carryInput, "unsaved"),
        unsavedNames = Array.isArray(value.unsavedNames)
          ? (value.unsavedNames as unknown[])
              .filter(
                (path: unknown): path is string =>
                  typeof path === "string",
              )
              .slice(0, 200)
          : [...unsavedFiles.keys()],
        carriedIndex = readCarriedIndexEdit(value.index),
        indexIsUnsaved = value.indexUnsaved === true || carriedIndex !== undefined,
        carryStorage = consumeCarryStorage(
          [
            ...allPaths.filter((path): boolean => !flaggedFiles.has(path)),
            ...unsavedNames.filter((path): boolean => !unsavedFiles.has(path)),
          ],
          indexIsUnsaved && carriedIndex === undefined,
        );
      for (let path of allPaths) {
        let fileEdit = flaggedFiles.get(path) ?? carryStorage.files.get(path);
        if (fileEdit !== undefined) {
          flaggedRestoreEdits.set(path, fileEdit);
        }
      }
      let entries = new Map<string, F.CarriedFileEdit>();
      for (let path of unsavedNames) {
        let fileEdit = unsavedFiles.get(path) ?? carryStorage.files.get(path);
        if (fileEdit !== undefined) {
          entries.set(path, fileEdit);
        }
      }
      let indexEdit = carriedIndex ?? carryStorage.index,
        items = [
          ...allPaths.filter(
            (path): boolean => !flaggedRestoreEdits.has(path),
          ),
          ...unsavedNames.filter((path): boolean => !entries.has(path)),
          ...(indexIsUnsaved && indexEdit === undefined ? [indexPath] : []),
        ];
      if (items.length > 0) {
        emit("restore-lost", {
          paths: items.map((path) =>
            path === indexPath
              ? path
              : projectFilePath(path),
          ),
        });
        notice(
          uiMessage("design-system.designSystemDocument.thePageReloadedAndYour2") +
            summarizeFileNames(items) +
            " could not be carried across. What is saved is shown; those changes are gone.",
        );
      }
      let removedFiles = new Map<string, string | null>();
      if (typeof value.removed === "object" && value.removed !== null) {
        for (let [path, removedText] of Object.entries<unknown>(
          value.removed as Record<string, unknown>,
        ).slice(0, 200)) {
          if (typeof removedText === "string" || removedText === null) {
            removedFiles.set(path, removedText);
          }
        }
      }
      let remainingBinaries = Array.isArray(value.binariesLeft)
          ? (value.binariesLeft as unknown[]).filter(
              (path: unknown): path is string => typeof path === "string",
            )
          : undefined,
        removedNames =
          (Array.isArray(value.unsavedNames) &&
            value.unsavedNames.length > 200) ||
          (typeof value.removed === "object" &&
            value.removed !== null &&
            Object.keys(value.removed).length > 200),
        hasTextFiles = items.some(
          (path) =>
            path !== indexPath && isTextFilePath(path),
        ),
        hasBinaryFiles =
          remainingBinaries === undefined ||
          remainingBinaries.length > 0 ||
          items.some(
            (path) =>
              path !== indexPath && !isTextFilePath(path),
          ),
        removedPaths = [...removedFiles.keys()].filter(
          (path) =>
            removedNames ||
            (isTextFilePath(path) ? hasTextFiles : hasBinaryFiles),
        );
      for (let path of removedPaths) {
        removedFiles.delete(path);
      }
      let newBinaries = Array.isArray(value.binariesNew)
        ? (value.binariesNew as unknown[]).filter(
            (path: unknown): path is string => typeof path === "string",
          )
        : [];
      if (
        flaggedRestoreEdits.size === 0 &&
        entries.size === 0 &&
        indexEdit === undefined &&
        removedFiles.size === 0 &&
        removedPaths.length === 0 &&
        newBinaries.length === 0
      ) {
        return;
      }
      let callback = (): void => {
          let missingPaths = [],
            conflictPaths = [],
            restoredPaths = removedPaths.filter((path) =>
              Object.hasOwn(context.document.content().files, path),
            );
          if (restoredPaths.length > 0) {
            emit("restore-unremoved", {
              paths: restoredPaths.map(projectFilePath),
            });
            for (let path of restoredPaths) {
              lateRemovalNoticePaths.add(path);
            }
            let singlePath: boolean = restoredPaths.length === 1;
            notice(
              uiMessage("design-system.designSystemDocument.thePageReloadedBeforeYour") +
                summarizeFileNames(restoredPaths) +
                " was saved, so it did not go through: " +
                (singlePath
                  ? summarizeFileNames(restoredPaths) + " is"
                  : uiMessage("design-system.designSystemDocument.theyAre")) +
                " still here. Do it again. If you had renamed " +
                (singlePath ? "it" : "one") +
                " and " +
                (singlePath ? "the" : "its") +
                " new name is here too, remove the one you do not want.",
            );
          }
          for (let [filePath, fileEdit] of entries) {
            let localText = currentFileText(filePath);
            if (
              localText !== null &&
              fileContentsSemanticallyEqual(
                filePath,
                localText,
                fileEdit.text,
              )
            ) {
              continue;
            }
            let liveShaValue = liveSha(filePath),
              canMerge =
                liveShaValue !== undefined &&
                fileEdit.base !== undefined &&
                liveShaValue !== fileEdit.base;
            if (canMerge && localText !== null && fileEdit.baseText !== undefined) {
              let mergeResult = mergeSupportedFileThreeWays(
                filePath,
                fileEdit.baseText,
                fileEdit.text,
                localText,
              );
              if (mergeResult !== null && mergeResult.ok) {
                if (
                  !fileContentsSemanticallyEqual(
                    filePath,
                    mergeResult.text,
                    localText,
                  )
                ) {
                  replaceFileText(filePath, mergeResult.text);
                  conflictPaths.push(filePath);
                }
                continue;
              }
            }
            replaceFileText(filePath, fileEdit.text);
            conflictPaths.push(filePath);
            if (canMerge) {
              flagClashingFile(
                filePath,
                "restored",
                liveShaValue,
                uiMessage("design-system.designSystemDocument.someoneElseChanged") +
                  fileBaseName(filePath) +
                  " while the page reloaded. Your unsaved version is back on screen and was not saved over theirs." +
                  FILE_CONFLICT_CHOICE_SUFFIX,
              );
            }
          }
          let removedMissingPaths = [];
          for (let [filePath, removedSha] of removedFiles) {
            if (
              currentFileText(filePath) === null &&
              !Object.hasOwn(context.document.content().files, filePath)
            ) {
              continue;
            }
            let liveShaValue = liveSha(filePath);
            if (
              liveShaValue !== undefined &&
              removedSha !== null &&
              liveShaValue !== removedSha
            ) {
              removedMissingPaths.push(filePath);
              continue;
            }
            context.document.updateContent(
              (content) => {
                let { [filePath]: files, ...remainingFiles } = content.files;
                return refreshManifest(
                  {
                    ...content,
                    files: Object.freeze(remainingFiles),
                  },
                  context.document.title(),
                );
              },
              {
                auto: true,
              },
            );
            conflictPaths.push(filePath);
          }
          if (removedMissingPaths.length > 0) {
            notice(
              uiMessage("design-system.designSystemDocument.youHadRemoved") +
                summarizeFileNames(removedMissingPaths) +
                " just before the page reloaded, and someone else changed " +
                (removedMissingPaths.length === 1 ? "it" : "them") +
                " meanwhile, so " +
                (removedMissingPaths.length === 1 ? uiMessage("design-system.designSystemDocument.itWas") : uiMessage("design-system.designSystemDocument.theyWere")) +
                " left in place.",
            );
          }
          let indexKeptPaths: string[] = [],
            flag: boolean = false;
          if (indexEdit !== undefined) {
            let entry = context.document.index().get(),
              missingBinaries = (remainingBinaries ?? [])
                .map(encodeFileIndexKey as (path: string) => string)
                .filter(
                  (blobPath) =>
                    Object.hasOwn(indexEdit.base.blobs ?? {}, blobPath) &&
                    !Object.hasOwn(indexEdit.mine.blobs ?? {}, blobPath),
                ),
              blobData =
                missingBinaries.length === 0
                  ? indexEdit.mine
                  : {
                      ...indexEdit.mine,
                      blobs: {
                        ...indexEdit.mine.blobs,
                        ...Object.fromEntries(
                          missingBinaries.map((blobPath) => [
                            blobPath,
                            indexEdit.base.blobs[blobPath],
                          ]),
                        ),
                      },
                    },
              { index: mergedIndex, kept: keptIndexFields } = mergeFilesIndex(
                indexEdit.base,
                blobData,
                entry,
              );
            indexKeptPaths = keptIndexFields.filter(
              (fieldName) =>
                !fieldName.startsWith("docs") &&
                fieldName !== "title" &&
                !isGeneratedIndexField(fieldName),
            );
            if (!mergeValuesEqual(mergedIndex, entry)) {
              let files: Core.FileTable = restoreFilesFromIndex(
                mergedIndex,
                projectFilesForSave(context.document.content().files),
              ).content.files;
              context.document.updateContent(
                () =>
                  refreshManifest(
                    {
                      v: 2,
                      files: Object.freeze({
                        ...files,
                      }),
                    },
                    context.document.title(),
                  ),
                {
                  auto: true,
                },
              );
              flag = true;
            }
            if (indexKeptPaths.length > 0) {
              notice(
                uiMessage("design-system.designSystemDocument.partOfYourUnsavedChange") +
                  describeIndexConflicts(
                    indexKeptPaths,
                    context.document.index().get(),
                  ).join(", ") +
                  ".",
              );
            }
          }
          let newBinaryPaths = newBinaries.filter(
            (filePath): boolean =>
              !Object.hasOwn(context.document.content().files, filePath),
          );
          if (newBinaryPaths.length > 0) {
            emit("restore-lost", {
              paths: newBinaryPaths.map(projectFilePath),
            });
            notice(
              uiMessage("design-system.designSystemDocument.thePageReloadedBefore") +
                summarizeFileNames(newBinaryPaths) +
                " " +
                (newBinaryPaths.length === 1 ? "was" : "were") +
                " saved, so " +
                (newBinaryPaths.length === 1 ? uiMessage("design-system.designSystemDocument.itIs") : uiMessage("design-system.designSystemDocument.theyAre")) +
                " gone. Add " +
                (newBinaryPaths.length === 1 ? "it" : "them") +
                " again.",
            );
          }
          if (conflictPaths.length > 0 || flag) {
            emit("resumed", {
              paths: conflictPaths.map(projectFilePath),
              index: flag,
              indexKept: indexKeptPaths,
            });
            context.flushNow();
          }
          for (let [filePath, fileEdit] of flaggedRestoreEdits) {
            let localText = currentFileText(filePath);
            if (localText !== null && localText === fileEdit.text) {
              continue;
            }
            replaceFileText(filePath, fileEdit.text);
            flags.set(filePath, {
              path: filePath,
              why: "restored",
              theirsSha: liveSha(filePath),
              since: timers.now(),
            });
            flaggedPaths.add(filePath);
            noticedClashShas.set(filePath, liveSha(filePath));
            context.queue.withdraw(projectFilePath(filePath));
            missingPaths.push(filePath);
          }
          flaggedRestoreEdits.clear();
          if (missingPaths.length > 0) {
            emit("restored", {
              paths: missingPaths.map(projectFilePath),
            });
            notifyFlags();
          }
        },
        restoreCallback = async (): Promise<void> => {
          let restoredEntries = new Map([...flaggedRestoreEdits, ...entries]);
          flaggedRestoreEdits.clear();
          let missingPaths = [...removedFiles.keys(), ...removedPaths].filter((filePath) =>
              Object.hasOwn(context.document.content().files, filePath),
            ),
            indexMissing =
              indexEdit !== undefined &&
              !indexAuthoredFieldsEqual(indexEdit.base, indexEdit.mine);
          if (restoredEntries.size === 0 && !indexMissing && missingPaths.length === 0) {
            return;
          }
          let values = new Set<string>();
          if (documentOptions.saveStash !== undefined && restoredEntries.size > 0) {
            let stashResult = await documentOptions.saveStash.put(
                [...restoredEntries].map(([filePath, fileEdit]) => ({
                  path: projectFilePath(filePath),
                  text: fileEdit.text,
                  base: fileEdit.base ?? null,
                })),
                documentOptions.port.version().version,
              ),
              stashedPaths = stashResult
                ? []
                : ((await documentOptions.saveStash.read())?.edits ?? []);
            values = stashResult
              ? new Set(restoredEntries.keys())
              : new Set(
                  stashedPaths.flatMap((stashedEdit) => {
                    let relativePath: string | undefined = relativeProjectFilePath(stashedEdit.path);
                    if (
                      relativePath !== undefined &&
                      restoredEntries.get(relativePath)?.text === stashedEdit.text
                    ) {
                      return [relativePath];
                    } else {
                      return [];
                    }
                  }),
                );
          }
          let restoredPaths = [...restoredEntries.keys()].filter((filePath) =>
              values.has(filePath),
            ),
            unrestoredPaths = missingPaths.filter(
              (filePath): boolean => !restoredEntries.has(filePath),
            ),
            discardedPaths = [
              ...[...restoredEntries.keys()].filter(
                (filePath): boolean => !values.has(filePath),
              ),
              ...(indexMissing ? [indexPath] : []),
            ],
            formatPaths = (paths: readonly string[]) =>
              paths.map((filePath) =>
                filePath === indexPath
                  ? filePath
                  : projectFilePath(filePath),
              );
          if (restoredPaths.length > 0) {
            emit("restore-kept", {
              paths: formatPaths(restoredPaths),
            });
          }
          if (discardedPaths.length + unrestoredPaths.length > 0) {
            emit("restore-lost", {
              paths: formatPaths([...discardedPaths, ...unrestoredPaths]),
            });
          }
          let text: string = uiMessage("design-system.designSystemDocument.thePageReloadedAndOpened"),
            textPrefix: string =
              restoredPaths.length > 0
                ? uiMessage("design-system.designSystemDocument.yourVersionOf") +
                  summarizeFileNames(restoredPaths) +
                  " is kept on this device for " +
                  CRASH_STASH_RETENTION_LABEL +
                  ". Reload to try getting it back. "
                : "",
            textMiddle: string =
              discardedPaths.length > 0
                ? uiMessage("design-system.designSystemDocument.yourUnsavedChangesTo") +
                  summarizeFileNames(discardedPaths) +
                  " could not be kept here and are gone. "
                : "",
            textSuffix: string =
              unrestoredPaths.length > 0
                ? uiMessage("design-system.designSystemDocument.youHadRemoved") +
                  summarizeFileNames(unrestoredPaths) +
                  "; that was not kept, and " +
                  (unrestoredPaths.length === 1 ? uiMessage("design-system.designSystemDocument.theFileIs") : uiMessage("design-system.designSystemDocument.theFilesAre")) +
                  " still here."
                : "";
          notice((text + textPrefix + textMiddle + textSuffix).trim());
        },
        finishRestore = () => {
          let loadState = context.document.loadState();
          if (loadState === "live" && !context.document.readOnly()) {
            return callback();
          }
          if (loadState === "live" && documentOptions.port.mayWrite === true) {
            return void restoreCallback();
          }
          if (
            loadState === "live" ||
            (loadState === "failed" &&
              context.document.bootFailure() === "access_revoked")
          ) {
            flaggedRestoreEdits.clear();
            return;
          }
          let retryRestore = (): void => {
            return;
          };
          retryRestore = context.document.subscribeLoad((): void => {
            if (context.document.loadState() === "loading") {
              return;
            }
            retryRestore();
            finishRestore();
          });
        };
      Promise.resolve().then(finishRestore);
    }

  return { restore: restoreHotCarry, announceLateRemovals };
}
