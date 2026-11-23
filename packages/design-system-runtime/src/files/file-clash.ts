import { uiMessage } from "@minedesign/contracts/ui-messages";
import type * as Core from "../contracts";
import type * as M from "../contracts/design-system-document";
import type * as F from "../contracts/files-core";
import { isProjectContentPath, projectFilePath, publishableFileMimeType } from "../editor/files-index";
import { FILE_CONFLICT_CHOICE_SUFFIX, fileBaseName, RECENT_PUBLISH_CLASH_NOTICE_MS, RECENT_PUBLISH_HEAL_WINDOW_MS } from "./carry";
import { retryFileRead } from "./paths";
import { availableConflictCopyName, fileContentsSemanticallyEqual, isTokenFilePath, mergeSupportedFileThreeWays, remoteTextLostLocalLines, summarizeConflictNames } from "./token-merge";

/**
 * 同名文件冲突所需的事实与动作。document、queue、markDirty 等声明靠后的绑定
 * 用 getter 或函数提供，调用时才读取，避免过期闭包和 TDZ。
 * flags、flaggedPaths、noticedClashShas、readTexts、readShas、recentPublishes
 * 与文档其他部分共享，由外部持有。
 */
export interface FileClashContext {
  readonly document: M.BaseFilesDocument;
  readonly queue: Pick<F.FilesSaveQueue, "withdraw" | "flushNow" | "state" | "unsendable">;
  readonly port: M.DesignSystemFilesDocumentOptions["port"];
  readonly clashPolicy: "mine" | "theirs" | "ask";
  readonly flags: Map<string, M.DocumentFlag>;
  readonly flaggedPaths: Set<string>;
  readonly noticedClashShas: Map<string, string | null | undefined>;
  readonly readTexts: Map<string, string>;
  readonly readShas: Map<string, string>;
  readonly recentPublishes: Map<string, M.RecentPublish>;
  readonly timers: Pick<Core.FilesTimers, "now" | "setTimeout">;
  emit(eventType: string, eventData?: unknown): void;
  notice(message: string): void;
  notifyFlags(): void;
  isBusy(): boolean;
  isDisposed(): boolean;
  liveSha(filePath: string): string | null | undefined;
  currentFileText(filePath: string): string | null;
  keepOutOfUndo(filePath: string): void;
  takeRemoteFile(filePath: string): void;
  replaceFileText(filePath: string, fileText: string): void;
  advancePathRevision(filePath: string): void;
  clearCarriedFiles(paths: string[]): void;
  retokenUndo(filePath: string): void;
  pruneUndoPaths(paths: ReadonlySet<string>, reason: string, includeContext?: boolean): void;
  markDirty(filePath: string, publishInput: () => Core.FilePublishInput, baseSha: string | null | undefined): void;
  fileValueProvider(filePath: string): () => string;
  flushNow(): void;
}

export interface FileClash {
  /** 标记冲突文件；按策略可能直接取对方版本、重新发布我的版本或弹出选择。 */
  flagClashingFile(filePath: string, clashReason: string, baseSha: string | null | undefined, detailMessage?: string, additionalClash?: string, shouldPrompt?: boolean): void;
  /** 释放冲突标记，并清掉携带的暂存。 */
  unflagFile(filePath: string): void;
  /** 保存被拒后：令牌文件先三方合并，其余直接标记。 */
  resolveOrFlagClash(filePath: string, clashReason: string, baseSha: string | null | undefined, detailMessage?: string): void;
  /** 本地没有改动时，拉取并采用对方版本。 */
  refreshUnchangedLocalFile(filePath: string, remotePath: string, remoteSha: string | null): void;
  /** 同时发布后，把对方的版本与我的编辑合回来。 */
  healSimultaneousPublish(filePath: string, remoteSha: string | null): void;
  /** 用户在冲突提示里做出的选择：theirs、mine 或 copy。 */
  resolveFlagged(filePath: string, choice: "mine" | "theirs" | "copy"): void;
  /** 发布成功后取走一次“刚合并过”的标记。 */
  consumeRecentHeal(filePath: string): boolean;
  /** 正在做令牌三方合并的路径（保存与脏状态判断读取）。 */
  readonly mergingTokenPaths: ReadonlySet<string>;
  /** 恢复暂存后改动过的路径：冲突时按 ask 策略必须提示。 */
  markRestoredStash(filePath: string): void;
  forgetRestoredStash(filePath: string): void;
}

export function createFileClash(context: FileClashContext): FileClash {
  const { clashPolicy, flags, flaggedPaths, noticedClashShas, readTexts, readShas, recentPublishes, timers,
    emit, notice, notifyFlags, isBusy, liveSha, currentFileText, keepOutOfUndo, takeRemoteFile,
    replaceFileText, advancePathRevision, clearCarriedFiles } = context;
  const encoder = new TextEncoder();
  // 以下状态只属于冲突处理
  const recentHeals = new Map<string, number>();
  const recentHealTimes = new Map<string, number[]>();
  const mergingTokenPaths = new Set<string>();
  const restoredStashPaths = new Set<string>();
  const remoteRevertPending = new Set<string>();
  const remoteRevertTokens = new Map<string, object>();
  const consumeRecentHeal = (filePath: string): boolean => {
    const entry = recentHeals.get(filePath);
    recentHeals.delete(filePath);
    return entry !== undefined && timers.now() - entry <= 1e4;
  };
  const fileMatchesCurrentPublish = (filePath: string) => {
      let value = currentFileText(filePath);
      return (
        value !== null &&
        recentPublishes.get(filePath)?.text === value &&
        readTexts.get(projectFilePath(filePath)) === value
      );
    },
    fileMatchesReadBase = (filePath: string) => {
      let value = currentFileText(filePath);
      return (
        value !== null &&
        readTexts.get(projectFilePath(filePath)) === value
      );
    },
    fileSaveIsStuck = (filePath: string) =>
      context.queue
        .state()
        .stuck?.paths?.includes(projectFilePath(filePath)) ===
        true || context.queue.unsendable().has(projectFilePath(filePath));
  function flagClashingFile(
    filePath: string,
    clashReason: string,
    baseSha: string | null | undefined,
    detailMessage?: string,
    additionalClash?: string,
    shouldPrompt = clashPolicy === "ask",
  ): void {
    if (clashReason === "edit" && !shouldPrompt && !flags.has(filePath)) {
      if (clashPolicy === "mine" && fileMatchesReadBase(filePath)) {
        context.queue.withdraw(projectFilePath(filePath));
        refreshUnchangedLocalFile(
          filePath,
          projectFilePath(filePath),
          baseSha !== undefined ? baseSha : (liveSha(filePath) ?? null),
        );
        return;
      }
      if (fileMatchesCurrentPublish(filePath)) {
        context.queue.withdraw(projectFilePath(filePath));
        keepOutOfUndo(filePath);
        takeRemoteFile(filePath);
        return;
      }
      if (clashPolicy === "mine") {
        keepMineAndRepublish(filePath, baseSha);
        return;
      }
      if (!restoredStashPaths.has(filePath) && !fileSaveIsStuck(filePath)) {
        context.queue.withdraw(projectFilePath(filePath));
        revertToTheirs(
          filePath,
          projectFilePath(filePath),
          baseSha ?? null,
        );
        return;
      }
    }
    let entry = flags.get(filePath),
      clashMessage = additionalClash ?? entry?.clash;
    flags.set(filePath, {
      path: filePath,
      why: entry?.why ?? clashReason,
      theirsSha: baseSha,
      since: entry?.since ?? timers.now(),
      ...(clashMessage !== undefined
        ? {
            clash: clashMessage,
          }
        : {}),
    });
    flaggedPaths.add(filePath);
    context.queue.withdraw(projectFilePath(filePath));
    if (entry === undefined) {
      emit("flag", {
        path: projectFilePath(filePath),
        why: clashReason,
        theirs: baseSha ?? null,
        ...(clashMessage !== undefined
          ? {
              clash: clashMessage,
            }
          : {}),
      });
    }
    if (!noticedClashShas.has(filePath)) {
      noticedClashShas.set(filePath, baseSha);
      notice(
        detailMessage ??
          (baseSha === null
            ? uiMessage("design-system.designSystemDocument.someoneElseDeleted") +
              fileBaseName(filePath) +
              " while you were editing it. Your version is kept here and was not saved." +
              FILE_CONFLICT_CHOICE_SUFFIX
            : uiMessage("design-system.designSystemDocument.someoneElseChanged") +
              fileBaseName(filePath) +
              " while you were editing it. Your version is kept here and was not saved over theirs." +
              FILE_CONFLICT_CHOICE_SUFFIX),
      );
    }
    if (entry === undefined || entry.theirsSha !== baseSha) {
      notifyFlags();
    }
  }
  function unflagFile(filePath: string): void {
    noticedClashShas.delete(filePath);
    clearCarriedFiles([filePath]);
    flaggedPaths.delete(filePath);
    if (flags.delete(filePath)) {
      notifyFlags();
    }
  }
  function keepMineAndRepublish(
    filePath: string,
    providedSha: string | null | undefined,
  ): void {
    let value: string = projectFilePath(filePath),
      remoteSha = providedSha !== undefined ? providedSha : liveSha(filePath);
    if (currentFileText(filePath) === null && remoteSha !== null) {
      context.queue.withdraw(value);
      keepOutOfUndo(filePath);
      takeRemoteFile(filePath);
      return;
    }
    context.document.held().delete(value);
    context.retokenUndo(filePath);
    context.markDirty(
      value,
      currentFileText(filePath) === null
        ? (): null => null
        : context.fileValueProvider(filePath),
      remoteSha ?? null,
    );
    emit("clash-mine", {
      path: value,
      theirs: remoteSha ?? null,
    });
    if (!isBusy()) {
      context.flushNow();
    }
  }
  function revertToTheirs(
    filePath: string,
    remotePath: string,
    remoteSha: string | null,
  ): void {
    if (remoteRevertPending.has(filePath)) {
      return;
    }
    remoteRevertPending.add(filePath);
    emit("conflict-reverted", {
      path: remotePath,
      theirs: remoteSha,
    });
    let callback = (): void => {
      if (context.document.loadState() !== "live") {
        remoteRevertPending.delete(filePath);
        return;
      }
      if (isBusy()) {
        timers.setTimeout(callback, 500);
        return;
      }
      context.queue.withdraw(remotePath);
      let entry = readShas.get(remotePath);
      keepOutOfUndo(filePath);
      takeRemoteFile(filePath);
      let retryCheck = (): boolean =>
          liveSha(filePath) === null
            ? currentFileText(filePath) === null
            : readShas.get(remotePath) !== entry,
        index: number = 0,
        scheduleRetry = (): void => {
          if (!retryCheck() && index++ < 30) {
            timers.setTimeout(scheduleRetry, 100);
            return;
          }
          remoteRevertPending.delete(filePath);
          if (!retryCheck()) {
            advancePathRevision(filePath);
            flagClashingFile(
              filePath,
              "edit",
              remoteSha,
              undefined,
              undefined,
              true,
            );
            return;
          }
          advancePathRevision(filePath);
          if (flags.has(filePath)) {
            unflagFile(filePath);
          }
          context.pruneUndoPaths(new Set([filePath]), uiMessage("design-system.designSystemDocument.tookTheirs"), true);
          notice(
            fileBaseName(filePath) +
              (currentFileText(filePath) === null
                ? " deleted remotely"
                : " changed remotely"),
          );
        };
      scheduleRetry();
    };
    callback();
  }
  function refreshUnchangedLocalFile(
    filePath: string,
    remotePath: string,
    remoteSha: string | null,
  ): void {
    context.document.held().delete(remotePath);
    if (!fileMatchesCurrentPublish(filePath)) {
      context.retokenUndo(filePath);
    }
    if (remoteRevertPending.has(filePath)) {
      return;
    }
    remoteRevertPending.add(filePath);
    emit("clash-nothing-mine", {
      path: remotePath,
      theirs: remoteSha,
    });
    let state = {};
    remoteRevertTokens.set(filePath, state);
    let callback = (): void => {
        if (remoteRevertTokens.get(filePath) === state) {
          remoteRevertTokens.delete(filePath);
          remoteRevertPending.delete(filePath);
        }
      },
      items = [1000, 3000, 1e4, 30000],
      index = 0,
      refresh = async (): Promise<void> => {
        if (
          remoteRevertTokens.get(filePath) !== state ||
          context.isDisposed() ||
          context.document.loadState() !== "live" ||
          flags.has(filePath) ||
          !fileMatchesReadBase(filePath)
        ) {
          return callback();
        }
        if (isBusy()) {
          timers.setTimeout(() => void refresh(), 500);
          return;
        }
        if (readShas.get(remotePath) === liveSha(filePath)) {
          return callback();
        }
        let promise = new Promise<undefined>(
            (resolve) => void timers.setTimeout(() => resolve(undefined), 5000),
          ),
          value =
            liveSha(filePath) === null
              ? await null
              : await Promise.race([
                  retryFileRead(
                    () => context.port.readBytes(remotePath),
                    timers,
                  ).catch((): void => {
                    return;
                  }),
                  promise,
                ]);
        if (
          remoteRevertTokens.get(filePath) !== state ||
          context.isDisposed() ||
          context.document.loadState() !== "live" ||
          flags.has(filePath) ||
          !fileMatchesReadBase(filePath)
        ) {
          return callback();
        }
        if (
          readShas.get(remotePath) === liveSha(filePath) ||
          (value !== undefined &&
            value !== null &&
            value.sha256 === readShas.get(remotePath))
        ) {
          return callback();
        }
        let liveShaValue = liveSha(filePath),
          isChanged =
            value !== undefined &&
            (value === null
              ? liveShaValue !== null
              : liveShaValue !== undefined && liveShaValue !== value.sha256);
        if (value === undefined || isChanged) {
          let retryDelay = items[index];
          if (retryDelay === undefined) {
            return callback();
          }
          timers.setTimeout(() => void refresh(), isChanged ? 0 : retryDelay);
          index += 1;
          return;
        }
        if (isBusy()) {
          timers.setTimeout(() => void refresh(), 500);
          return;
        }
        callback();
        if (value !== null) {
          context.port.primeRead?.(remotePath, value);
        }
        keepOutOfUndo(filePath);
        takeRemoteFile(filePath);
        if (value === null) {
          readTexts.delete(remotePath);
          readShas.delete(remotePath);
          recentPublishes.delete(filePath);
        }
        advancePathRevision(filePath);
        context.pruneUndoPaths(new Set([filePath]), uiMessage("design-system.designSystemDocument.tookTheirs"));
      };
    refresh();
  }
  function resolveOrFlagClash(
    filePath: string,
    clashReason: string,
    baseSha: string | null | undefined,
    detailMessage?: string,
  ): void {
    if (clashPolicy !== "mine" && restoredStashPaths.has(filePath)) {
      flagClashingFile(filePath, clashReason, baseSha, detailMessage);
      return;
    }
    let entry = flags.get(filePath);
    if (
      !isTokenFilePath(filePath) ||
      baseSha === null ||
      (entry !== undefined &&
        (entry.why !== "edit" || entry.clash !== undefined))
    ) {
      flagClashingFile(filePath, clashReason, baseSha, detailMessage);
      return;
    }
    context.queue.withdraw(projectFilePath(filePath));
    if (mergingTokenPaths.has(filePath)) {
      return;
    }
    mergingTokenPaths.add(filePath);
    notifyFlags();
    mergeClashingTokenFile(filePath, clashReason, baseSha, detailMessage).catch(
      (): void => {
        mergingTokenPaths.delete(filePath);
        flagClashingFile(filePath, clashReason, baseSha, detailMessage);
      },
    );
  }
  async function mergeClashingTokenFile(
    filePath: string,
    remotePath: string,
    baseSha: string | null | undefined,
    detailMessage?: string,
  ): Promise<void> {
    let absolutePath: string = projectFilePath(filePath),
      remoteFile: Core.FileTextRead | undefined;
    try {
      remoteFile = await retryFileRead(
        () => context.port.readText(absolutePath),
        timers,
      );
    } catch {
      remoteFile = undefined;
    }
    mergingTokenPaths.delete(filePath);
    let entry = readTexts.get(absolutePath),
      remoteSha = readShas.get(absolutePath),
      localText = currentFileText(filePath),
      clashEntry = flags.get(filePath);
    if (
      remoteFile === undefined ||
      entry === undefined ||
      localText === null ||
      (clashEntry !== undefined &&
        (clashEntry.why !== "edit" || clashEntry.clash !== undefined))
    ) {
      flagClashingFile(filePath, remotePath, remoteFile?.sha256 ?? baseSha, detailMessage);
      return;
    }
    if (remoteFile.sha256 === remoteSha) {
      if (baseSha !== undefined && baseSha !== remoteFile.sha256) {
        flagClashingFile(filePath, remotePath, baseSha, detailMessage);
        return;
      }
      if (flags.has(filePath)) {
        unflagFile(filePath);
      }
      context.markDirty(absolutePath, context.fileValueProvider(filePath), remoteFile.sha256);
      context.flushNow();
      notifyFlags();
      return;
    }
    let mergeResult = mergeSupportedFileThreeWays(
      filePath,
      entry,
      localText,
      remoteFile.text,
    );
    if (
      clashPolicy === "mine" &&
      mergeResult !== null &&
      !mergeResult.ok &&
      mergeResult.why === "conflict"
    ) {
      let tokenMergeResult = mergeSupportedFileThreeWays(
        filePath,
        entry,
        remoteFile.text,
        localText,
        "theirs",
      );
      if (tokenMergeResult !== null && tokenMergeResult.ok) {
        mergeResult = {
          ok: true,
          text: tokenMergeResult.text,
          kept: [],
        };
      }
    }
    if (mergeResult === null || !mergeResult.ok) {
      let fallbackText =
        mergeResult !== null && mergeResult.why === "conflict"
          ? summarizeConflictNames(mergeResult.conflicts)
          : undefined;
      flagClashingFile(
        filePath,
        remotePath,
        remoteFile.sha256,
        fallbackText !== undefined
          ? uiMessage("design-system.designSystemDocument.youAndSomeoneElseBoth") +
              fallbackText +
              " in " +
              fileBaseName(filePath) +
              ". Theirs was saved first; yours is kept here and was not saved over theirs." +
              FILE_CONFLICT_CHOICE_SUFFIX
          : detailMessage,
        fallbackText,
      );
      return;
    }
    advancePathRevision(filePath);
    if (flags.has(filePath)) {
      unflagFile(filePath);
    }
    readTexts.set(absolutePath, remoteFile.text);
    readShas.set(absolutePath, remoteFile.sha256);
    if (
      fileContentsSemanticallyEqual(
        filePath,
        mergeResult.text,
        remoteFile.text,
      )
    ) {
      try {
        context.port.primeRead?.(absolutePath, {
          bytes: encoder.encode(remoteFile.text),
          sha256: remoteFile.sha256,
          contentType:
            publishableFileMimeType(filePath, remoteFile.text) ??
            "text/plain",
        });
      } catch {}
      context.queue.withdraw(absolutePath);
      keepOutOfUndo(filePath);
      takeRemoteFile(filePath);
      emit("merged", {
        path: absolutePath,
        theirs: remoteFile.sha256,
        wrote: false,
        why: remotePath,
      });
      notifyFlags();
      return;
    }
    context.document.held().delete(absolutePath);
    replaceFileText(filePath, mergeResult.text);
    context.markDirty(absolutePath, context.fileValueProvider(filePath), remoteFile.sha256);
    emit("merged", {
      path: absolutePath,
      theirs: remoteFile.sha256,
      wrote: true,
      why: remotePath,
    });
    context.flushNow();
    notifyFlags();
  }
  function healSimultaneousPublish(
    filePath: string,
    remoteSha: string | null,
  ): void {
    let entry = recentPublishes.get(filePath);
    if (
      entry === undefined ||
      entry.healed === true ||
      remoteSha === null ||
      entry.sha === remoteSha ||
      timers.now() - entry.at > RECENT_PUBLISH_HEAL_WINDOW_MS ||
      entry.base === undefined
    ) {
      return;
    }
    let value = currentFileText(filePath);
    if (value === null || value === entry.text) {
      return;
    }
    recentPublishes.delete(filePath);
    if (isTokenFilePath(filePath)) {
      let mergeResult = mergeSupportedFileThreeWays(
        filePath,
        entry.base,
        entry.text,
        value,
        "theirs",
      );
      if (mergeResult === null || !mergeResult.ok) {
        return;
      }
      let shouldRestoreMergedEdits: boolean = !fileContentsSemanticallyEqual(
        filePath,
        mergeResult.text,
        value,
      );
      if (shouldRestoreMergedEdits) {
        let now = timers.now(),
          healTimes = (recentHealTimes.get(filePath) ?? []).filter(
            (timestamp): boolean => now - timestamp <= 60000,
          );
        if (healTimes.length >= 3) {
          shouldRestoreMergedEdits = false;
        } else {
          healTimes.push(now);
          recentHealTimes.set(filePath, healTimes);
        }
      }
      if (shouldRestoreMergedEdits) {
        emit("healed", {
          path: projectFilePath(filePath),
          theirs: remoteSha,
          kept: mergeResult.kept,
        });
        recentHeals.set(filePath, timers.now());
        replaceFileText(filePath, mergeResult.text);
        context.flushNow();
      }
      if (
        clashPolicy !== "mine" &&
        mergeResult.kept.length > 0 &&
        (shouldRestoreMergedEdits ||
          timers.now() - entry.at <= RECENT_PUBLISH_CLASH_NOTICE_MS)
      ) {
        notice(
          uiMessage("design-system.designSystemDocument.someoneElseSaved") +
            fileBaseName(filePath) +
            " at the same moment as you. For " +
            summarizeConflictNames(mergeResult.kept) +
            ", which you both changed, theirs is kept." +
            (shouldRestoreMergedEdits ? " Your other changes were put back." : ""),
        );
      }
      return;
    }
    if (
      clashPolicy === "mine" ||
      !remoteTextLostLocalLines(entry.base, entry.text, value)
    ) {
      return;
    }
    emit("overwritten", {
      path: projectFilePath(filePath),
      theirs: remoteSha,
    });
    replaceFileText(filePath, entry.text);
    flagClashingFile(
      filePath,
      "overwritten",
      remoteSha,
      uiMessage("design-system.designSystemDocument.someoneElseSaved") +
        fileBaseName(filePath) +
        " at the same moment as you, and their version replaced yours. Yours is back here and is not saved." +
        FILE_CONFLICT_CHOICE_SUFFIX,
    );
  }
  const resolveFlagged = (filePath: string, choice: "mine" | "theirs" | "copy"): void => {
    if (!flags.has(filePath)) {
      return;
    }
    if (choice === "mine" && remoteRevertTokens.delete(filePath)) {
      remoteRevertPending.delete(filePath);
    }
    let value: string = projectFilePath(filePath),
      localText = currentFileText(filePath);
    if (choice === "copy") {
      let files = context.document.content().files,
        remotePath =
          localText === null
            ? null
            : availableConflictCopyName(filePath, (candidatePath) => {
                let candidateSha = context.port.liveSha?.(
                  projectFilePath(candidatePath),
                );
                return (
                  !Object.hasOwn(files, candidatePath) &&
                  isProjectContentPath(
                    projectFilePath(candidatePath),
                  ) &&
                  (candidateSha === undefined || candidateSha === null)
                );
              });
      if (remotePath === null || localText === null) {
        notice(
          uiMessage("design-system.designSystemDocument.thereIsNoFreeName") +
            fileBaseName(filePath) +
            " for a copy. Choose theirs or yours instead.",
        );
        return;
      }
      context.queue.withdraw(value);
      emit("flag-resolved", {
        path: value,
        choice: "copy",
        copy: projectFilePath(remotePath),
      });
      replaceFileText(remotePath, localText);
      advancePathRevision(filePath);
      unflagFile(filePath);
      context.pruneUndoPaths(new Set([filePath]), uiMessage("design-system.designSystemDocument.keptAsACopy"));
      keepOutOfUndo(filePath);
      takeRemoteFile(filePath);
      notice(
        uiMessage("design-system.designSystemDocument.yourVersionOf") +
          fileBaseName(filePath) +
          " is kept as " +
          fileBaseName(remotePath) +
          "; " +
          fileBaseName(filePath) +
          " now has theirs.",
      );
      context.flushNow();
      return;
    }
    context.queue.withdraw(value);
    emit("flag-resolved", {
      path: value,
      choice: choice,
    });
    if (choice === "theirs") {
      advancePathRevision(filePath);
      unflagFile(filePath);
      context.pruneUndoPaths(new Set([filePath]), uiMessage("design-system.designSystemDocument.tookTheirs"));
      keepOutOfUndo(filePath);
      takeRemoteFile(filePath);
      return;
    }
    let liveShaValue = liveSha(filePath);
    context.document.held().delete(value);
    unflagFile(filePath);
    context.retokenUndo(filePath);
    context.markDirty(value, () => localText, liveShaValue ?? null);
    context.flushNow();
  };
  return {
    flagClashingFile,
    unflagFile,
    resolveOrFlagClash,
    refreshUnchangedLocalFile,
    healSimultaneousPublish,
    resolveFlagged,
    consumeRecentHeal,
    mergingTokenPaths,
    markRestoredStash: (filePath) => void restoredStashPaths.add(filePath),
    forgetRestoredStash: (filePath) => void restoredStashPaths.delete(filePath),
  };
}
