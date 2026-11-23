import { uiMessage } from "@minedesign/contracts/ui-messages";
import type * as Core from "../contracts";
import type * as M from "../contracts/design-system-document";
import type * as F from "../contracts/files-core";
import { MIGRATION_ANALYTICS_EVENTS, reportMigrationAnalytics } from "../editor/migration-banners";
import { relativeProjectFilePath } from "../editor/files-index";
import { DESIGN_SYSTEM_PATHS, hasGeneratedSystemHeader } from "../model/file-policy";
import { DESIGN_SYSTEM_MANIFEST_VERSION } from "../model/file-table";
import { summarizeFileNames } from "./carry";
import { retryFileRead } from "./paths";

/**
 * 生成文件所有权探测所需的事实与动作。queue、saveState 与再生成相关动作
 * 来自声明靠后的绑定，用 getter 或函数提供，调用时才读取。
 */
export interface GeneratedOwnershipContext {
  readonly port: M.DesignSystemFilesDocumentOptions["port"];
  readonly timers: Core.FilesTimers;
  readonly queue: Pick<F.FilesSaveQueue, "state" | "commit">;
  readonly saveSubscribers: ReadonlySet<(state: M.DocumentSaveState) => void>;
  notice(message: string): void;
  isDisposed(): boolean;
  saveState(): M.DocumentSaveState;
  /** 再生成一次；返回被标脏的路径。 */
  regenerate(): string[];
  /** 让下一次再生成不再沿用“内容未变”的短路。 */
  invalidateGeneratedFiles(): void;
  scheduleGeneratedRetry(): void;
  cancelGeneratedRetry(): void;
}

export interface GeneratedOwnership {
  /** 能否写入或删除生成文件；还没探测过时先发起探测并返回 false。 */
  canGenerateFile(filePath: string, operation: "write" | "remove"): boolean;
  /** 探测未完成、待补做的再生成或重试计时器在等：保存状态按未完成处理。 */
  workPending(): boolean;
  /** 等探测队列落定，必要时补做一次再生成并提交。 */
  settleProbes(): Promise<void>;
  /** 用户再次编辑后，探测重试从头计数。 */
  resetRetryBudget(): void;
  /** 再生成的重试计时器读取：探测后是否还欠一次刷新。 */
  refreshOwed(): boolean;
  clearRefreshOwed(): void;
  isOurs(filePath: string): boolean;
  forget(filePath: string): void;
  markOurs(filePath: string): void;
  /** 工作状态变化时通知保存订阅者（只在变化时发出）。 */
  notifyPending(): void;
  /** 回收探测重试计时器（不重置句柄，与原 dispose 一致）。 */
  dispose(): void;
}

export function createGeneratedOwnership(context: GeneratedOwnershipContext): GeneratedOwnership {
  const { port, timers, saveSubscribers } = context;
  // 以下状态只属于所有权探测
  const generatedOwnership = new Map<string, "ours" | "theirs" | number>();
  const foreignFileNoticePaths = new Set<string>();
  let foreignFileNotices: M.ForeignFileNotice[] = [];
  let ownershipProbeGeneration = 0;
  let ownershipProbeChain: Promise<void> = Promise.resolve();
  let ownedFilesDiscovered = false;
  let generatedRefreshOwed = false;
  let ownershipRetryTimer: ReturnType<typeof setTimeout> | undefined;
  let ownershipRetryAttempt = 0;
  const ownershipProbeTimeoutMs = 1e4;
  const ownershipRetryDelays = [2000, 5000, 15000, 30000, 60000, 60000];
  let generatedPendingNotified = false;
  let ownershipFailureNoticed = false;

  const fileWasGeneratedByEditor = (filePath: string, fileText: string) => {
    const value: string = relativeProjectFilePath(filePath) ?? filePath;
    if (value !== DESIGN_SYSTEM_PATHS.manifest) {
      return hasGeneratedSystemHeader(value, fileText);
    }
    try {
      const parsedFile: { manifestVersion?: unknown; files?: unknown } | null = JSON.parse(fileText);
      return (
        parsedFile !== null &&
        typeof parsedFile === "object" &&
        !Array.isArray(parsedFile) &&
        typeof parsedFile.manifestVersion === "number" &&
        (parsedFile.manifestVersion <= DESIGN_SYSTEM_MANIFEST_VERSION || Array.isArray(parsedFile.files))
      );
    } catch {
      return false;
    }
  };
  const ownershipProbePending = () =>
    [...generatedOwnership.values()].some((numericValue): boolean => typeof numericValue === "number");
  const workPending = () =>
    !context.isDisposed() &&
    (ownershipProbePending() || ownedFilesDiscovered || generatedRefreshOwed || ownershipRetryTimer !== undefined);
  const notifyGeneratedPending = (): void => {
    const value = workPending();
    if (value === generatedPendingNotified) {
      return;
    }
    generatedPendingNotified = value;
    const saveState = context.saveState();
    for (const subscriber of [...saveSubscribers]) {
      try {
        subscriber(saveState);
      } catch {}
    }
  };
  const announceForeignFiles = (): void => {
    const value = foreignFileNotices;
    foreignFileNotices = [];
    for (const operation of ["write", "remove"]) {
      const fileNames = value.filter((change): boolean => change.wanted === operation).map((fileEntry) => fileEntry.name);
      if (fileNames.length === 0) {
        continue;
      }
      reportMigrationAnalytics(MIGRATION_ANALYTICS_EVENTS.foreignFilesNoticed);
      const singleFile: boolean = fileNames.length === 1;
      context.notice(
        summarizeFileNames(fileNames) +
          (singleFile
            ? " in this system was not made by this editor, so it is left as it is"
            : " in this system were not made by this editor, so they are left as they are") +
          (operation === "write"
            ? singleFile
              ? "; changes you make here are not written to it."
              : "; changes you make here are not written to them."
            : "."),
      );
    }
  };
  const finishOwnershipProbe = (): void => {
    if (context.isDisposed()) {
      return;
    }
    if (!ownershipProbePending()) {
      if (foreignFileNotices.length > 0) {
        announceForeignFiles();
      }
      if (ownedFilesDiscovered) {
        ownedFilesDiscovered = false;
        generatedRefreshOwed = true;
        context.invalidateGeneratedFiles();
        context.scheduleGeneratedRetry();
      }
    }
    notifyGeneratedPending();
  };
  const scheduleOwnershipRetry = (): void => {
    if (context.isDisposed() || ownershipRetryTimer !== undefined) {
      return;
    }
    if (ownershipRetryAttempt >= ownershipRetryDelays.length) {
      if (!ownershipFailureNoticed) {
        ownershipFailureNoticed = true;
        context.notice(uiMessage("design-system.designSystemDocument.theFilesThisEditorMakes"));
      }
      return;
    }
    ownershipRetryTimer = timers.setTimeout((): void => {
      ownershipRetryTimer = undefined;
      context.invalidateGeneratedFiles();
      context.regenerate();
      if (context.queue.state().dirty > 0) {
        context.queue.commit();
      }
      finishOwnershipProbe();
    }, ownershipRetryDelays[ownershipRetryAttempt++]);
  };
  const recordForeignFile = (filePath: string, operation: string): void => {
    generatedOwnership.set(filePath, "theirs");
    if (!foreignFileNoticePaths.has(filePath)) {
      foreignFileNoticePaths.add(filePath);
      foreignFileNotices.push({
        name: relativeProjectFilePath(filePath) ?? filePath,
        wanted: operation,
      });
    }
  };
  const withOwnershipDeadline = <Value>(promise: Promise<Value>): Promise<Value> =>
    new Promise<Value>((resolve, reject): void => {
      const value = timers.setTimeout(() => reject({ code: "deadline" }), ownershipProbeTimeoutMs);
      promise.then(
        (rejectedValue): void => {
          timers.clearTimeout(value);
          resolve(rejectedValue);
        },
        (error: unknown): void => {
          timers.clearTimeout(value);
          reject(error);
        },
      );
    });

  function canGenerateFile(filePath: string, operation: "write" | "remove"): boolean {
    if (port.liveSha?.(filePath) === null) {
      return true;
    }
    const entry = generatedOwnership.get(filePath);
    if (entry !== undefined) {
      return entry === "ours";
    }
    const peekBytes = port.peekBytes;
    if (peekBytes === undefined) {
      recordForeignFile(filePath, operation);
      ownershipProbeChain.then(finishOwnershipProbe);
      return false;
    }
    const value = ++ownershipProbeGeneration;
    generatedOwnership.set(filePath, value);
    ownershipProbeChain = ownershipProbeChain
      .then(() => withOwnershipDeadline(retryFileRead(() => peekBytes(filePath), timers)))
      .then(
        (bytes): string =>
          fileWasGeneratedByEditor(filePath, new TextDecoder().decode(bytes.bytes)) ? "ours" : "theirs",
        (error: { code?: string } | undefined): string | undefined =>
          error?.code === "not_found" && typeof port.liveSha?.(filePath) !== "string" ? "ours" : undefined,
      )
      .then((ownershipResult) => {
        if (context.isDisposed() || generatedOwnership.get(filePath) !== value) {
          return finishOwnershipProbe();
        }
        if (ownershipResult === undefined) {
          generatedOwnership.delete(filePath);
          scheduleOwnershipRetry();
        } else if (((ownershipRetryAttempt = 0), ownershipResult === "theirs")) {
          recordForeignFile(filePath, operation);
        } else {
          generatedOwnership.set(filePath, "ours");
          ownedFilesDiscovered = true;
        }
        finishOwnershipProbe();
      })
      .catch((): void => {
        if (generatedOwnership.get(filePath) === value) {
          generatedOwnership.delete(filePath);
          scheduleOwnershipRetry();
        }
        finishOwnershipProbe();
      });
    notifyGeneratedPending();
    return false;
  }

  const settleProbes = async (): Promise<void> => {
    for (let index = 0; index < 4 && !context.isDisposed(); index++) {
      await ownershipProbeChain;
      if (ownedFilesDiscovered || generatedRefreshOwed) {
        ownedFilesDiscovered = false;
        generatedRefreshOwed = false;
        context.cancelGeneratedRetry();
        context.invalidateGeneratedFiles();
        context.regenerate();
        if (context.queue.state().dirty > 0) {
          context.queue.commit();
        }
      }
      notifyGeneratedPending();
      if (!ownershipProbePending()) {
        return;
      }
    }
  };

  return {
    canGenerateFile,
    workPending,
    notifyPending: notifyGeneratedPending,
    settleProbes,
    resetRetryBudget(): void {
      ownershipRetryAttempt = 0;
      ownershipFailureNoticed = false;
    },
    refreshOwed: () => generatedRefreshOwed,
    clearRefreshOwed(): void {
      generatedRefreshOwed = false;
    },
    isOurs: (filePath) => generatedOwnership.get(filePath) === "ours",
    forget(filePath): void {
      generatedOwnership.delete(filePath);
    },
    markOurs(filePath): void {
      generatedOwnership.set(filePath, "ours");
    },
    dispose(): void {
      if (ownershipRetryTimer !== undefined) {
        timers.clearTimeout(ownershipRetryTimer);
      }
    },
  };
}
