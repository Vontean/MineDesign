import type * as Core from "../contracts";
import type * as M from "../contracts/design-system-document";
import type * as F from "../contracts/files-core";
import { damagedDerivedProjectPaths, isDerivedProjectPath, relativeProjectFilePath, validDerivedProjectFiles } from "../editor/files-index";
import { sha256Sync } from "../editor/index-file-store";
import { summarizeFileNames } from "./carry";
import { DAMAGED_FILE_REPLACEMENT_CHARACTER } from "./design-system-port";
import type { GeneratedOwnership } from "./generated-ownership";

/**
 * 派生文件再生成所需的事实与动作。document、queue 来自声明靠后的绑定，用 getter 提供；
 * README 尾部相关动作与预览库安装留在文档里，调用时才读取。
 */
export interface RegenerationContext {
  readonly document: Pick<M.BaseFilesDocument, "readOnly" | "loadState" | "content" | "title">;
  readonly queue: Pick<F.FilesSaveQueue, "markDirty" | "state" | "commit">;
  readonly port: M.DesignSystemFilesDocumentOptions["port"];
  readonly timers: Core.FilesTimers;
  readonly flags: ReadonlyMap<string, M.DocumentFlag>;
  /** 是否生成派生文件（documentOptions.generated === true）。 */
  readonly generated: boolean;
  /** 编辑后到再生成的防抖毫秒数。 */
  readonly debounceMs: number;
  readonly ownership: Pick<GeneratedOwnership, "canGenerateFile" | "refreshOwed" | "clearRefreshOwed" | "notifyPending">;
  userEditedLocally(): boolean;
  notice(message: string): void;
  emit(eventType: string, eventData?: unknown): void;
  ensureReactPreviewLibraries(): void;
  updateReadmeTail(fileTable: Core.FileTable, items: string[]): void;
  generateMissingReadme(fileTable: Core.FileTable, changedPaths: string[]): void;
}

export interface Regeneration {
  /** 把内容里的派生文件与已发布的对齐；返回被标脏的路径。 */
  regenerate(): string[];
  /** 让下一次再生成不再沿用“内容未变”的短路。 */
  invalidate(): void;
  /** 安排一次重试再生成（1 秒后，一分钟内最多 3 次）。 */
  scheduleRetry(): void;
  cancelRetry(): void;
  /** 本地编辑后防抖触发再生成。 */
  scheduleDebounced(): void;
  /** 对方先发布了该派生文件：忘掉我生成过的文本，下次重新写。 */
  forgetGeneratedText(filePath: string): void;
  /** 回收重试与防抖计时器（先重试，后防抖）。 */
  dispose(): void;
}

export function createRegeneration(context: RegenerationContext): Regeneration {
  const { port, timers, flags, ownership } = context;
  // 以下状态只属于再生成
  let lastGeneratedFiles: Core.FileTable | undefined;
  let lastGeneratedTitle: string | undefined;
  const generatedTexts = new Map<string, string>();
  const damagedGeneratedPaths = new Set<string>();
  let regenerationTimer: ReturnType<typeof setTimeout> | undefined;
  let generatedRetryTimer: ReturnType<typeof setTimeout> | undefined;
  const generatedRetryTimes: number[] = [];

  function regenerate(): string[] {
    const { document } = context;
    if (
      !context.generated ||
      !context.userEditedLocally() ||
      document.readOnly() ||
      document.loadState() !== "live" ||
      flags.size > 0
    ) {
      return [];
    }
    context.ensureReactPreviewLibraries();
    const files = document.content().files;
    if (files === lastGeneratedFiles && document.title() === lastGeneratedTitle) {
      return [];
    }
    lastGeneratedFiles = files;
    lastGeneratedTitle = document.title();
    const items: string[] = [],
      value: Map<string, string> = validDerivedProjectFiles(files);
    for (const [filePath, fileText] of value) {
      if (generatedTexts.get(filePath) === fileText) {
        continue;
      }
      if (port.liveSha?.(filePath) === sha256Sync(fileText)) {
        generatedTexts.set(filePath, fileText);
        continue;
      }
      if (!ownership.canGenerateFile(filePath, "write")) {
        continue;
      }
      generatedTexts.set(filePath, fileText);
      context.queue.markDirty(filePath, () => fileText);
      items.push(filePath);
    }
    const values = new Set<string>(damagedDerivedProjectPaths(files)),
      damagedPaths = [...values].filter((filePath): boolean => !damagedGeneratedPaths.has(filePath));
    for (const filePath of damagedGeneratedPaths) {
      if (!values.has(filePath)) {
        damagedGeneratedPaths.delete(filePath);
      }
    }
    for (const filePath of damagedPaths) {
      damagedGeneratedPaths.add(filePath);
    }
    if (damagedPaths.length > 0) {
      const singlePath: boolean = damagedPaths.length === 1,
        hasPublishedFiles = damagedPaths.some((filePath): boolean => typeof port.liveSha?.(filePath) === "string");
      context.notice(
        summarizeFileNames(damagedPaths.map((filePath) => relativeProjectFilePath(filePath) ?? filePath)) +
          (singlePath ? " is" : " are") +
          " not being updated. Find the " +
          DAMAGED_FILE_REPLACEMENT_CHARACTER +
          " in your tokens, names, notes or READMEs and type it again." +
          (hasPublishedFiles ? " What is published stays as it is until then." : ""),
      );
    }
    const knownListing = port.knownListing?.();
    for (const filePath of new Set([
      ...generatedTexts.keys(),
      ...(knownListing !== undefined ? [...knownListing.keys()].filter(isDerivedProjectPath) : []),
    ])) {
      if (value.has(filePath) || values.has(filePath)) {
        continue;
      }
      generatedTexts.delete(filePath);
      if (port.liveSha?.(filePath) === null) {
        continue;
      }
      if (!ownership.canGenerateFile(filePath, "remove")) {
        continue;
      }
      context.queue.markDirty(filePath, (): null => null);
      items.push(filePath);
    }
    context.updateReadmeTail(files, items);
    context.generateMissingReadme(files, items);
    if (items.length > 0) {
      context.emit("generated", { paths: items });
    }
    return items;
  }

  const scheduleRetry = (): void => {
    if (generatedRetryTimer !== undefined) {
      return;
    }
    const callback = (): void => {
      generatedRetryTimer = undefined;
      const value = timers.now();
      while (generatedRetryTimes.length > 0 && value - generatedRetryTimes[0] > 60000) {
        generatedRetryTimes.shift();
      }
      if (generatedRetryTimes.length >= 3) {
        if (ownership.refreshOwed()) {
          generatedRetryTimer = timers.setTimeout(callback, 60000 - (value - generatedRetryTimes[0]) + 100);
        }
        return;
      }
      ownership.clearRefreshOwed();
      regenerate();
      if (context.queue.state().dirty > 0) {
        generatedRetryTimes.push(value);
        context.queue.commit();
      }
      ownership.notifyPending();
    };
    generatedRetryTimer = timers.setTimeout(callback, 1000);
  };

  return {
    regenerate,
    invalidate(): void {
      lastGeneratedFiles = undefined;
    },
    scheduleRetry,
    cancelRetry(): void {
      if (generatedRetryTimer !== undefined) {
        timers.clearTimeout(generatedRetryTimer);
        generatedRetryTimer = undefined;
      }
    },
    scheduleDebounced(): void {
      if (regenerationTimer !== undefined) {
        timers.clearTimeout(regenerationTimer);
      }
      regenerationTimer = timers.setTimeout((): void => {
        regenerationTimer = undefined;
        regenerate();
      }, context.debounceMs);
    },
    forgetGeneratedText(filePath): void {
      generatedTexts.delete(filePath);
    },
    dispose(): void {
      if (generatedRetryTimer !== undefined) {
        timers.clearTimeout(generatedRetryTimer);
      }
      if (regenerationTimer !== undefined) {
        timers.clearTimeout(regenerationTimer);
      }
    },
  };
}
