import { uiMessage } from "@minedesign/contracts/ui-messages";
import type * as Core from "../contracts";
import type * as M from "../contracts/design-system-document";
import type * as F from "../contracts/files-core";
import { PROJECT_FILE_PREFIXEditorFilesIndex } from "../editor/files-index";
import { sha256Sync } from "../editor/index-file-store";
import { generatedConsumptionReadme } from "../model/documentation";
import { DESIGN_SYSTEM_PATHS } from "../model/file-policy";
import { generatedReadmeTail, mergeReadmeWithGeneratedTail } from "../model/stored-file-codec";
import { fileContentContainsRuntimeMarkers } from "./paths";
import type { Regeneration } from "./regeneration";

/**
 * README 生成内容（缺失时的标题、末尾“Consuming this system”段）所需的事实与动作。
 * document、queue 来自声明靠后的绑定，用 getter 提供；readTexts、readShas、flags
 * 与文档其他部分共享，由外部持有。
 */
export interface GeneratedReadmeContext {
  readonly document: Pick<M.BaseFilesDocument, "title" | "content" | "readOnly" | "loadState">;
  readonly queue: Pick<F.FilesSaveQueue, "markDirty" | "withdraw" | "commit">;
  readonly port: M.DesignSystemFilesDocumentOptions["port"];
  readonly timers: Core.FilesTimers;
  readonly flags: ReadonlyMap<string, M.DocumentFlag>;
  readonly mergingTokenPaths: ReadonlySet<string>;
  readonly readTexts: ReadonlyMap<string, string>;
  readonly readShas: ReadonlyMap<string, string>;
  /** 是否生成派生文件（documentOptions.generated === true）。 */
  readonly generated: boolean;
  readonly clashPolicy: "mine" | "theirs" | "ask";
  /** README 在项目里的路径（带 project/ 前缀）。 */
  readonly projectReadmePath: string;
  readonly regeneration: Pick<Regeneration, "regenerate" | "invalidate" | "scheduleRetry">;
  emit(eventType: string, eventData?: unknown): void;
  currentFileText(filePath: string): string | null;
  fileValueProvider(filePath: string): () => string;
  refreshUnchangedLocalFile(filePath: string, remotePath: string, remoteSha: string | null): void;
}

export interface GeneratedReadme {
  /** 带上生成尾部的 README 线上文本（保存与读取端口使用）。 */
  wire(readmeText: string): string;
  /** 再生成时：README 已发布且尾部过期，把它标脏重发。 */
  updateReadmeTail(fileTable: Core.FileTable, items: string[]): void;
  /** 再生成时：README 缺失就用标题生成一份。 */
  generateMissingReadme(fileTable: Core.FileTable, changedPaths: string[]): void;
  /** 对外的“现在补写 README 尾部”；写入队列后返回 true。 */
  writeReadmeTail(): Promise<boolean>;
  /**
   * 保存回调第一步：登记 README 发布结果（成功则记下发布的文本与 sha，冲突则撤回并停手）。
   * 返回这次发布的 README 是否仍是我们生成的那份，供回调后面的逐路径处理使用。
   */
  noteReadmePublish(publishReport: M.FilePublishReport): boolean;
  /** 保存回调逐路径处理 README 时：安排一次 README 再生成。 */
  scheduleRegeneration(): void;
  /** 保存回调逐路径处理 README 时：尾部已随发布落地。 */
  markTailPublished(): void;
  /** 保存冲突：只是尾部过期时，撤回、刷新并重试，返回 true 表示已处理。 */
  handleTailConflict(conflict: F.FileSaveConflict): boolean;
  /** 对方改动了 README：忘掉我们生成过的那份。 */
  forgetGeneratedReadme(): void;
  /** 回收 README 再生成计时器（不重置句柄，与原 dispose 一致）。 */
  dispose(): void;
}

export function createGeneratedReadme(context: GeneratedReadmeContext): GeneratedReadme {
  const { port, timers, flags, mergingTokenPaths, readTexts, readShas, projectReadmePath, regeneration } = context;
  const CONSUMER_PROJECT_PATH_HINT =
    "Every path named below is under `project/` in this design system: read `project/api/tokens.md`, not `api/tokens.md`.";
  // 以下状态只属于 README 尾部与缺失 README 的生成
  let generatedReadme: M.GeneratedReadme | undefined;
  let generatedReadmeStopped = false;
  let generatedReadmePending = false;
  const generatedReadmeTexts = new Set<string>();
  let generatedReadmeConflictCount = 0;
  const recentGeneratedReadmeWrites: number[] = [];
  let generatedReadmeTimer: ReturnType<typeof setTimeout> | undefined;
  let lastWireReadme: string | undefined;
  let readmeTailPending = false;

  const readmeHeading = (): string =>
    "# " +
    (context.document.title().replace(/\s+/g, " ").trim() || uiMessage("design-system.designSystemDocument.designSystem")) +
    `
`;
  const scheduleRegeneration = (): void => {
    const value = timers.now();
    while (recentGeneratedReadmeWrites.length > 0 && value - recentGeneratedReadmeWrites[0] > 60000) {
      recentGeneratedReadmeWrites.shift();
    }
    if (recentGeneratedReadmeWrites.length >= 10 || generatedReadmeTimer !== undefined) {
      return;
    }
    recentGeneratedReadmeWrites.push(value);
    generatedReadmeTimer = timers.setTimeout((): void => {
      generatedReadmeTimer = undefined;
      regeneration.invalidate();
      if (regeneration.regenerate().length > 0) {
        context.queue.commit();
      }
    }, 1000);
  };
  const wire = (readmeText: string): string => {
    const value = generatedReadmeTail(
      generatedConsumptionReadme(
        Object.freeze({
          ...context.document.content().files,
          [DESIGN_SYSTEM_PATHS.readme]: readmeText,
        }),
        PROJECT_FILE_PREFIXEditorFilesIndex,
      ),
    );
    return mergeReadmeWithGeneratedTail(
      readmeText,
      value.replace(
        /^(## Consuming this system[^\n]*\n)/,
        `$1
` +
          CONSUMER_PROJECT_PATH_HINT +
          `
`,
      ),
    );
  };

  function updateReadmeTail(fileTable: Core.FileTable, items: string[]): void {
    const value = fileTable[DESIGN_SYSTEM_PATHS.readme];
    if (
      items.length === 0 ||
      typeof value !== "string" ||
      flags.has(DESIGN_SYSTEM_PATHS.readme) ||
      mergingTokenPaths.has(DESIGN_SYSTEM_PATHS.readme) ||
      readTexts.get(projectReadmePath) !== value
    ) {
      return;
    }
    const wireText = wire(value);
    if (wireText === lastWireReadme) {
      return;
    }
    const publishedSha = port.liveSha?.(projectReadmePath);
    if (typeof publishedSha === "string" && publishedSha !== readShas.get(projectReadmePath)) {
      return;
    }
    lastWireReadme = wireText;
    if (publishedSha === undefined || publishedSha === null || publishedSha === sha256Sync(wireText)) {
      return;
    }
    readmeTailPending = true;
    context.queue.markDirty(projectReadmePath, context.fileValueProvider(DESIGN_SYSTEM_PATHS.readme));
    items.push(projectReadmePath);
  }

  function generateMissingReadme(fileTable: Core.FileTable, changedPaths: string[]): void {
    if (fileTable[DESIGN_SYSTEM_PATHS.readme] !== undefined) {
      generatedReadme = undefined;
      return;
    }
    if (generatedReadmeStopped) {
      return;
    }
    const value = port.liveSha?.(projectReadmePath),
      readmeText = readmeHeading(),
      wireText = wire(readmeText),
      readmeMissing: boolean = value === null,
      readmeUnchanged = value !== undefined ? value : port.heldSha?.(projectReadmePath),
      readmeMatches =
        generatedReadme?.sha !== undefined &&
        readmeUnchanged === generatedReadme.sha &&
        (readmeText !== generatedReadme.text || wireText !== generatedReadme.wire);
    if (!readmeMissing && !readmeMatches) {
      return;
    }
    const previousSha = readmeMissing ? null : generatedReadme!.sha;
    generatedReadme = {
      text: readmeText,
      wire: wireText,
      ...(readmeMissing ? {} : { sha: previousSha }),
    };
    generatedReadmeTexts.add(readmeText);
    generatedReadmePending = true;
    context.queue.markDirty(projectReadmePath, () => readmeText, previousSha);
    changedPaths.push(projectReadmePath);
  }

  async function writeReadmeTail(): Promise<boolean> {
    const { document } = context;
    if (!context.generated || document.readOnly() || document.loadState() !== "live") {
      return false;
    }
    const value = document.content().files[DESIGN_SYSTEM_PATHS.readme];
    if (
      typeof value !== "string" ||
      flags.has(DESIGN_SYSTEM_PATHS.readme) ||
      mergingTokenPaths.has(DESIGN_SYSTEM_PATHS.readme) ||
      readTexts.get(projectReadmePath) !== value
    ) {
      return false;
    }
    const wireText = wire(value),
      publishedSha = port.liveSha?.(projectReadmePath);
    if (
      publishedSha === undefined ||
      publishedSha === null ||
      publishedSha === sha256Sync(wireText) ||
      fileContentContainsRuntimeMarkers(wireText)
    ) {
      return false;
    }
    const remoteReadme = await port.readText(projectReadmePath).catch((): null => null);
    if (
      remoteReadme === null ||
      remoteReadme.text.includes("## Consuming this system") ||
      document.readOnly() ||
      readTexts.get(projectReadmePath) !== value
    ) {
      return false;
    }
    lastWireReadme = wireText;
    readmeTailPending = true;
    context.queue.markDirty(projectReadmePath, context.fileValueProvider(DESIGN_SYSTEM_PATHS.readme));
    context.emit("generated", { paths: [projectReadmePath] });
    return true;
  }

  function noteReadmePublish(publishReport: M.FilePublishReport): boolean {
    const value = publishReport.texts?.[projectReadmePath],
      readmeIsCurrent =
        publishReport.paths.includes(projectReadmePath) &&
        context.currentFileText(DESIGN_SYSTEM_PATHS.readme) === null &&
        generatedReadme !== undefined &&
        (value === undefined ? generatedReadmePending : typeof value === "string" && generatedReadmeTexts.has(value));
    if (
      publishReport.paths.includes(projectReadmePath) &&
      (value === undefined || generatedReadme === undefined || value === generatedReadme.text)
    ) {
      generatedReadmePending = false;
    }
    if (publishReport.ok && generatedReadme !== undefined && readmeIsCurrent) {
      const readmeText = publishReport.texts?.[projectReadmePath],
        readmeSha = port.liveSha?.(projectReadmePath);
      if (typeof readmeText === "string" && typeof readmeSha === "string") {
        generatedReadme = {
          text: readmeText,
          wire: wire(readmeText),
          sha: readmeSha,
        };
        if (readmeText !== readmeHeading()) {
          scheduleRegeneration();
        }
      }
    }
    if (!publishReport.ok && publishReport.code === "conflict" && generatedReadme !== undefined && readmeIsCurrent) {
      const hasReadmeSha: boolean = generatedReadme.sha !== undefined;
      generatedReadme = undefined;
      context.queue.withdraw(projectReadmePath);
      generatedReadmeConflictCount += 1;
      if (hasReadmeSha || port.liveSha?.(projectReadmePath) !== null || generatedReadmeConflictCount >= 2) {
        generatedReadmeStopped = true;
      }
    }
    return readmeIsCurrent;
  }

  return {
    wire,
    updateReadmeTail,
    generateMissingReadme,
    writeReadmeTail,
    noteReadmePublish,
    scheduleRegeneration,
    markTailPublished(): void {
      readmeTailPending = false;
    },
    handleTailConflict(conflict): boolean {
      if (
        conflict.path !== projectReadmePath ||
        !readmeTailPending ||
        context.currentFileText(DESIGN_SYSTEM_PATHS.readme) !== readTexts.get(projectReadmePath)
      ) {
        return false;
      }
      readmeTailPending = false;
      lastWireReadme = undefined;
      context.queue.withdraw(conflict.path);
      regeneration.invalidate();
      context.emit("generated-behind", { path: conflict.path });
      if (context.clashPolicy === "mine") {
        context.refreshUnchangedLocalFile(DESIGN_SYSTEM_PATHS.readme, conflict.path, conflict.theirsSha);
      }
      regeneration.scheduleRetry();
      return true;
    },
    forgetGeneratedReadme(): void {
      generatedReadme = undefined;
    },
    dispose(): void {
      if (generatedReadmeTimer !== undefined) {
        timers.clearTimeout(generatedReadmeTimer);
      }
    },
  };
}
