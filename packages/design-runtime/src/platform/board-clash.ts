import type { Dynamic } from "../runtime-types";
import { ModelHistoryRebaseSet } from "../editor/model/history-rebase";
import { mergeDcDocuments } from "../editor/model/three-way-merge";
import { canvasMetadataFile, isArtboardFile, parseCanvasMetadata, serializeCanvasMetadata } from "./file-content";
import { cloneIndexValue } from "./index-merge";
import { fromProjectContentPath, toProjectContentPath } from "./project-paths";
import { PlatformSha256Encode, sha256Fallback } from "./sha256";

/**
 * 同名画板冲突流程所需的事实与动作。
 * 声明靠后或会被整体替换的绑定（state、loadedFiles、savedFiles、publisher、
 * indexState 等）用 getter 提供，调用时才读取，避免过期闭包和 TDZ。
 * 启动重试上限等运行时才安装的常量同样用 getter。
 */
export interface BoardClashContext {
  readonly documentOptions: Dynamic;
  readonly timers: Dynamic;
  readonly liveHashes: Map<string, string | null>;
  readonly publishedHashes: Map<string, string | null>;
  readonly fileDirtyVersions: Map<string, unknown>;
  readonly knownArtboardFiles: Set<string>;
  readonly undoHistory: Dynamic[];
  readonly disposed: boolean;
  readonly state: Dynamic;
  readonly loadedFiles: Dynamic;
  readonly savedFiles: Dynamic;
  readonly publisher: Dynamic;
  readonly indexState: Dynamic;
  readonly bootMaxAttempts: number;
  readonly bootMaxWaitMs: number;
  readonly restartDelayMs: number;
  notice(message?: string): void;
  portVersion(): Dynamic;
  readFiles(paths: string[]): Promise<Dynamic>;
  adoptRemoteFiles(files: Dynamic): void;
  replaceDocument(nextDocument: Dynamic): void;
  scheduleLocalSave(): void;
  handleRemoteUpdate(update: Dynamic): Promise<Dynamic> | void;
  shouldHoldRemoteFile(relativePath: string): boolean;
  hasUnsavedFileEdits(relativePath: string): boolean;
  describeIndexMergeConflict(relativePath: string, overlaps: Dynamic): string;
  describeSamePropertyConflict(relativePath: string, overlaps: Dynamic): string;
}

export interface BoardClashes {
  hasClash(relativePath: string): boolean;
  isResolving(relativePath: string): boolean;
  isHeld(relativePath: string): boolean;
  heldPaths(): string[];
  /** 远端又变了：已有冲突提示则只更新对方版本并返回 true。 */
  noteRemoteVersion(relativePath: string, remoteSha: string | null): boolean;
  /** 冲突提示久未回应时重新弹出。 */
  remindStalePrompt(relativePath: string): void;
  /** 暂扣远端文件并启动释放检查。 */
  hold(relativePath: string): void;
  dropHold(relativePath: string): void;
  releaseHeldFile(relativePath: string): void;
  rememberOverwrittenEdit(edit: Dynamic): void;
  forgetOverwrittenEdit(relativePath: string): void;
  reapplyOverwrittenEdit(boardPath: string, remoteContent: string): Dynamic;
  offerOverwrittenEditNotice(edit: Dynamic): void;
  hasLocalBoardChanges(relativePath: string): boolean;
  offerBoardClashNotice(relativePath: string, absolutePath: string, remoteSha: string | null, remoteContent: string | undefined, reason: string): void;
  createMyCopy(boardPath: string, boardContent: string, useNumberedCopy?: boolean): string;
  handleBoardClash(absolutePath: string, remoteSha: string | null, trigger: string): Promise<void>;
  dispose(): void;
}

export function createBoardClashes(context: BoardClashContext): BoardClashes {
  const { documentOptions, timers, notice, liveHashes, publishedHashes, fileDirtyVersions, knownArtboardFiles, undoHistory } = context;
  // 以下状态只属于冲突流程
  const heldRemoteFiles: Dynamic = new Set();
  const overwrittenEdits: Dynamic = new Map();
  const boardClashes: Dynamic = new Map();
  const resolvingClashes: Dynamic = new Set();
  const pendingReadVersions: Dynamic = new Map();

  async function applyClashResolution(
    conflict?: Dynamic,
    silent: Dynamic = false,
    mayApply?: Dynamic,
  ): Promise<Dynamic> {
    let relativePath: Dynamic = fromProjectContentPath(
      conflict.path,
      "design",
    );
    if (relativePath === undefined) return false;
    let remoteContent: Dynamic =
      conflict.theirsSha === null
        ? undefined
        : (await context.readFiles([relativePath]))[relativePath];
    if (
      context.disposed ||
      (conflict.theirsSha !== null && remoteContent === undefined) ||
      (mayApply !== undefined && !mayApply())
    )
      return false;
    let displayName: Dynamic = relativePath.replace(/\.dc\.html$/, "");
    !silent && documentOptions.sameBoardRule === "first"
      ? notice(
          displayName +
            (conflict.theirsSha === null
              ? " deleted remotely"
              : " changed remotely"),
        )
      : !silent &&
        documentOptions.sameBoardRule !== "last" &&
        notice(
          "\u201C" +
            displayName +
            "\u201D was changed by someone else while you were editing it. Their version was loaded; your last change to it was not saved.",
        );
    heldRemoteFiles.delete(relativePath);
    overwrittenEdits.delete(relativePath);
    let nextFiles: Dynamic = {
      ...context.state.content.files,
    };
    remoteContent === undefined
      ? (delete nextFiles[relativePath],
        delete context.loadedFiles[relativePath],
        delete context.savedFiles[relativePath],
        liveHashes.delete(conflict.path))
      : ((nextFiles[relativePath] = remoteContent),
        (context.loadedFiles[relativePath] = remoteContent),
        (context.savedFiles[relativePath] = remoteContent),
        liveHashes.set(conflict.path, conflict.theirsSha));
    context.adoptRemoteFiles(nextFiles);
    return true;
  }
  let hasLocalBoardChanges: Dynamic = (relativePath?: Dynamic): Dynamic =>
      context.hasUnsavedFileEdits(relativePath) ||
      isNewLocalFile(relativePath) ||
      (context.savedFiles[relativePath] !== undefined &&
        context.state.content.files[relativePath] !== undefined &&
        context.state.content.files[relativePath] !== context.savedFiles[relativePath]),
    isNewLocalFile: Dynamic = (relativePath?: Dynamic): Dynamic =>
      context.state.content.files[relativePath] !== undefined &&
      context.savedFiles[relativePath] === undefined &&
      !liveHashes.has(toProjectContentPath(relativePath)),
    isPathTaken: Dynamic = (relativePath?: Dynamic): Dynamic =>
      relativePath in context.state.content.files ||
      fileDirtyVersions.has(relativePath) ||
      liveHashes.has(toProjectContentPath(relativePath)) ||
      (publishedHashes.get(toProjectContentPath(relativePath)) ??
        null) !== null;
  function nextDuplicateFilename(fileName?: Dynamic): Dynamic {
    let stem: Dynamic = fileName.replace(/\.dc\.html$/, ""),
      numberedStem: Dynamic = /^(.*) (\d+)$/.exec(stem),
      baseStem: Dynamic = numberedStem ? numberedStem[1] : stem;
    for (
      let copyNumber: Dynamic = numberedStem ? Number(numberedStem[2]) + 1 : 2;
      ;
      copyNumber++
    ) {
      let candidate: Dynamic = baseStem + " " + String(copyNumber) + ".dc.html";
      if (!isPathTaken(candidate)) return candidate;
    }
  }
  let heldRemoteTimer: Dynamic;
  function scheduleHeldRemoteCheck(): Dynamic {
    heldRemoteTimer !== undefined ||
      context.disposed ||
      (heldRemoteTimer = timers.setTimeout((): Dynamic => {
        heldRemoteTimer = undefined;
        for (let relativePath of [...heldRemoteFiles] as Dynamic)
          context.shouldHoldRemoteFile(relativePath) || releaseHeldFile(relativePath);
        heldRemoteFiles.size > 0 && scheduleHeldRemoteCheck();
      }, documentOptions.heldCheckMs ?? 400));
  }
  function releaseHeldFile(relativePath?: Dynamic): Dynamic {
    heldRemoteFiles.delete(relativePath);
    let absolutePath: Dynamic = toProjectContentPath(relativePath);
    hasLocalBoardChanges(relativePath)
      ? handleBoardClash(
          absolutePath,
          publishedHashes.get(absolutePath) ?? null,
          "remote-while-editing",
        )
      : context.handleRemoteUpdate({
          from: context.portVersion(),
          to: context.portVersion(),
          changed: [
            {
              path: absolutePath,
              sha256: publishedHashes.get(absolutePath) ?? null,
            },
          ],
        });
  }
  async function handleBoardClash(
    absolutePath?: Dynamic,
    remoteSha?: Dynamic,
    trigger?: Dynamic,
  ): Promise<Dynamic> {
    let relativePath: Dynamic = fromProjectContentPath(
      absolutePath,
      "design",
    );
    if (relativePath === undefined || context.disposed || resolvingClashes.has(relativePath))
      return;
    if (boardClashes.has(relativePath)) {
      boardClashes.set(relativePath, {
        ...boardClashes.get(relativePath),
        theirsSha: remoteSha,
      });
      return;
    }
    let initialLocalContent: Dynamic = context.state.content.files[relativePath];
    if (
      initialLocalContent === undefined ||
      (!isArtboardFile(relativePath) &&
        documentOptions.sameBoardRule !== "last")
    )
      return void (await applyClashResolution({
        path: absolutePath,
        base: liveHashes.get(absolutePath) ?? null,
        mine: initialLocalContent ?? null,
        theirsSha: remoteSha,
      }));
    if (
      remoteSha !== null &&
      isArtboardFile(relativePath) &&
      isNewLocalFile(relativePath)
    )
      return adoptIdenticalBoard(relativePath, initialLocalContent, remoteSha);
    if (documentOptions.sameBoardRule === "last") {
      if (
        !hasLocalBoardChanges(relativePath) &&
        remoteSha !== (liveHashes.get(absolutePath) ?? null)
      ) {
        context.publisher.withdraw(absolutePath);
        return void context.handleRemoteUpdate({
          from: context.portVersion(),
          to: context.portVersion(),
          changed: [
            {
              path: absolutePath,
              sha256: remoteSha,
            },
          ],
        });
      }
      publishedHashes.set(absolutePath, remoteSha);
      remoteSha === null
        ? (liveHashes.delete(absolutePath), fileDirtyVersions.delete(relativePath))
        : liveHashes.set(absolutePath, remoteSha);
      delete context.loadedFiles[relativePath];
      heldRemoteFiles.delete(relativePath);
      context.scheduleLocalSave();
      return;
    }
    if (remoteSha !== null && liveHashes.get(absolutePath) === remoteSha) {
      documentOptions.sameBoardRule === "first" &&
        context.publisher.resolveConflict(absolutePath, "theirs");
      context.savedFiles[relativePath] !== undefined &&
        (context.loadedFiles[relativePath] = context.savedFiles[relativePath]);
      context.scheduleLocalSave();
      return;
    }
    if (documentOptions.sameBoardRule === "first") {
      if (context.shouldHoldRemoteFile(relativePath)) {
        heldRemoteFiles.add(relativePath);
        publishedHashes.set(absolutePath, remoteSha);
        scheduleHeldRemoteCheck();
        return;
      }
      resolvingClashes.add(relativePath);
      try {
        let wasHeldAgain: Dynamic = false;
        if (
          (await applyClashResolution(
            {
              path: absolutePath,
              base: liveHashes.get(absolutePath) ?? null,
              mine: initialLocalContent,
              theirsSha: remoteSha,
            },
            false,
            (): Dynamic => (
              (wasHeldAgain = context.shouldHoldRemoteFile(relativePath)),
              wasHeldAgain
                ? false
                : (context.publisher.withdraw(absolutePath),
                  ModelHistoryRebaseSet(relativePath),
                  true)
            ),
          )) ||
          context.disposed
        )
          return void pendingReadVersions.delete(relativePath);
        publishedHashes.set(absolutePath, remoteSha);
        if (wasHeldAgain) {
          heldRemoteFiles.add(relativePath);
          scheduleHeldRemoteCheck();
          return;
        }
        let readRetry: Dynamic = pendingReadVersions.get(relativePath) ?? {
          tries: 0,
        };
        if (readRetry.timer !== undefined) return;
        if (readRetry.tries >= context.bootMaxAttempts) {
          pendingReadVersions.delete(relativePath);
          notice(
            relativePath.replace(/\.dc\.html$/, "") +
              " changed remotely; reload to load it",
          );
          return;
        }
        readRetry.tries += 1;
        readRetry.timer = timers.setTimeout(
          (): Dynamic => {
            readRetry.timer = undefined;
            context.disposed || releaseHeldFile(relativePath);
          },
          Math.min(6e4, context.restartDelayMs * 2 ** (readRetry.tries - 1)),
        );
        pendingReadVersions.set(relativePath, readRetry);
      } finally {
        resolvingClashes.delete(relativePath);
      }
      return;
    }
    resolvingClashes.add(relativePath);
    let mergeStartedAt: Dynamic = timers.now();
    try {
      let baseContent: Dynamic = context.savedFiles[relativePath],
        remoteContent: Dynamic;
      remoteSha !== null && (remoteContent = (await context.readFiles([relativePath]))[relativePath]);
      if (context.disposed) return;
      let localContent: Dynamic = context.state.content.files[relativePath] ?? initialLocalContent,
        merge: Dynamic,
        mergeProblem: Dynamic;
      remoteSha === null
        ? (mergeProblem = "the board was deleted by someone else")
        : remoteContent === undefined
          ? (mergeProblem = "their version could not be read")
          : baseContent === undefined
            ? (mergeProblem = "this tab does not know what its edits started from")
            : ((merge = mergeDcDocuments(
                baseContent,
                localContent,
                remoteContent,
              )),
              merge.ok || (mergeProblem = merge.why));
      let mergeEvent: Dynamic = {
        file: relativePath,
        trigger: trigger,
        ok: merge?.ok === true,
        ...(mergeProblem !== undefined
          ? {
              why: mergeProblem,
            }
          : {}),
        ...(merge !== undefined
          ? {
              regions: merge.regions,
              guard: merge.guard,
            }
          : {}),
        applied: merge?.applied.length ?? 0,
        overlaps: merge?.overlaps.length ?? 0,
        ms: timers.now() - mergeStartedAt,
      };
      undoHistory.push(mergeEvent);
      undoHistory.length > 100 && undoHistory.shift();
      documentOptions.debug?.event("reconcile", {
        ...mergeEvent,
        ...(merge !== undefined
          ? {
              appliedList: merge.applied.slice(0, 24),
              overlapList: merge.overlaps.slice(0, 24),
            }
          : {}),
      });
      if (
        merge?.ok === true &&
        merge.merged !== undefined &&
        remoteContent !== undefined &&
        remoteSha !== null
      ) {
        let mergedFiles: Dynamic = {
          ...context.state.content.files,
          [relativePath]: merge.merged,
        };
        context.savedFiles[relativePath] = remoteContent;
        context.loadedFiles[relativePath] = remoteContent;
        liveHashes.set(absolutePath, remoteSha);
        publishedHashes.set(absolutePath, remoteSha);
        heldRemoteFiles.delete(relativePath);
        let recoveredEdit: Dynamic = reapplyOverwrittenEdit(relativePath, remoteContent);
        context.adoptRemoteFiles(mergedFiles);
        merge.merged !== remoteContent && context.scheduleLocalSave();
        merge.overlaps.length > 0 &&
          notice(context.describeIndexMergeConflict(relativePath, merge.overlaps));
        recoveredEdit !== undefined && offerOverwrittenEditNotice(recoveredEdit);
        return;
      }
      offerBoardClashNotice(
        relativePath,
        absolutePath,
        remoteSha,
        remoteContent,
        mergeProblem ?? "the two versions could not be folded together",
      );
    } finally {
      resolvingClashes.delete(relativePath);
    }
  }
  async function adoptIdenticalBoard(
    boardPath?: Dynamic,
    localContent?: Dynamic,
    remoteSha?: Dynamic,
  ): Promise<Dynamic> {
    resolvingClashes.add(boardPath);
    try {
      if (
        sha256Fallback(
          PlatformSha256Encode(localContent),
        ) === remoteSha
      ) {
        context.loadedFiles[boardPath] = localContent;
        context.savedFiles[boardPath] = localContent;
        liveHashes.set(toProjectContentPath(boardPath), remoteSha);
        context.publisher.resolveConflict(
          toProjectContentPath(boardPath),
          "theirs",
        );
        return;
      }
      let renamedBoardPath: Dynamic = nextDuplicateFilename(boardPath);
      knownArtboardFiles.add(renamedBoardPath);
      let boardMetadata: Dynamic = cloneIndexValue(
        context.indexState.get().boards[boardPath],
      );
      context.indexState.update((index?: Dynamic): Dynamic => {
        index.boards[renamedBoardPath] = boardMetadata ?? {
          x: 0,
          y: 0,
          w: 1280,
          h: 720,
        };
        let sourceOrderIndex: Dynamic = index.order.indexOf(boardPath);
        index.order.splice(
          sourceOrderIndex < 0 ? index.order.length : sourceOrderIndex + 1,
          0,
          renamedBoardPath,
        );
      });
      let remoteContent: Dynamic = (await context.readFiles([boardPath]))[boardPath];
      if (context.disposed) return;
      let nextFiles: Dynamic = {
        ...context.state.content.files,
        [renamedBoardPath]: context.state.content.files[boardPath] ?? localContent,
      };
      delete context.loadedFiles[boardPath];
      remoteContent === undefined
        ? delete nextFiles[boardPath]
        : ((nextFiles[boardPath] = remoteContent),
          (context.loadedFiles[boardPath] = remoteContent),
          (context.savedFiles[boardPath] = remoteContent),
          liveHashes.set(toProjectContentPath(boardPath), remoteSha));
      context.publisher.resolveConflict(
        toProjectContentPath(boardPath),
        "theirs",
      );
      documentOptions.debug?.event("moved-aside", {
        file: boardPath,
        as: renamedBoardPath,
      });
      context.adoptRemoteFiles(nextFiles);
      context.scheduleLocalSave();
    } finally {
      resolvingClashes.delete(boardPath);
    }
  }
  function reapplyOverwrittenEdit(
    boardPath?: Dynamic,
    remoteContent?: Dynamic,
  ): Dynamic {
    let entry: Dynamic = overwrittenEdits.get(boardPath);
    if (
      entry === undefined ||
      (overwrittenEdits.delete(boardPath), remoteContent === entry.mine)
    )
      return;
    let merge: Dynamic = mergeDcDocuments(
      entry.base,
      entry.mine,
      remoteContent,
    );
    if (
      !merge.ok ||
      merge.merged === undefined ||
      merge.merged === remoteContent
    )
      return;
    merge.overlaps.length > 0 &&
      timers.now() - entry.at < context.bootMaxWaitMs &&
      notice(context.describeSamePropertyConflict(boardPath, merge.overlaps));
    let isOverlappingChange: Dynamic = (appliedChange?: Dynamic): Dynamic =>
      merge.overlaps.some(
        (overlap?: Dynamic): Dynamic =>
          overlap.tid === appliedChange.tid &&
          overlap.kind === appliedChange.kind &&
          overlap.name === appliedChange.name,
      );
    return merge.regions.template === "mine" ||
      merge.regions.script === "mine" ||
      merge.regions.outer === "mine" ||
      merge.applied.some((change?: Dynamic): Dynamic => !isOverlappingChange(change))
      ? entry
      : undefined;
  }
  function offerOverwrittenEditNotice(edit?: Dynamic): Dynamic {
    documentOptions.debug?.event("save-dropped", {
      file: edit.file,
    });
    let handled: Dynamic = false,
      putBack: Dynamic = (): Dynamic => {
        if (handled || context.disposed) return;
        handled = true;
        let currentContent: Dynamic = context.state.content.files[edit.file];
        if (currentContent === undefined) return;
        let merge: Dynamic = mergeDcDocuments(
          edit.base,
          edit.mine,
          currentContent,
        );
        if (
          !merge.ok ||
          merge.merged === undefined ||
          merge.merged === currentContent
        ) {
          notice(
            "Your change to \u201C" +
              edit.file.replace(/\.dc\.html$/, "") +
              "\u201D could not be put back on top of the newer version (" +
              (merge.why ?? "nothing to put back") +
              ").",
          );
          return;
        }
        context.adoptRemoteFiles({
          ...context.state.content.files,
          [edit.file]: merge.merged,
        });
        context.scheduleLocalSave();
      };
    if (documentOptions.onSaveDropped !== undefined) {
      try {
        documentOptions.onSaveDropped({
          file: edit.file,
          putBack: putBack,
        });
      } catch {}
      return;
    }
    notice(
      "\u201C" +
        edit.file.replace(/\.dc\.html$/, "") +
        "\u201D was saved over by a version that leaves out a change you had saved.",
    );
  }
  function createMyCopy(
    boardPath?: Dynamic,
    boardContent?: Dynamic,
    useNumberedCopy: Dynamic = false,
  ): Dynamic {
    let files: Dynamic = context.state.content.files,
      boardStem: Dynamic = boardPath.replace(/\.dc\.html$/, ""),
      preferredCopyPath: Dynamic = boardStem + " my copy.dc.html",
      copyPath: Dynamic = useNumberedCopy
        ? nextDuplicateFilename(boardPath)
        : isPathTaken(preferredCopyPath)
          ? nextDuplicateFilename(preferredCopyPath)
          : preferredCopyPath,
      manifest: Dynamic = parseCanvasMetadata(
        files[canvasMetadataFile],
        files,
      ),
      sourceBoard: Dynamic = manifest.artboards.find(
        (board?: Dynamic): Dynamic => board.file === boardPath,
      ),
      nextManifest: Dynamic = {
        ...manifest,
        artboards: [
          ...manifest.artboards,
          {
            ...(sourceBoard ?? {
              x: 0,
              y: 0,
              w: 1280,
              h: 720,
            }),
            file: copyPath,
            x: (sourceBoard?.x ?? 0) + (sourceBoard?.w ?? 1280) + 80,
            ...(useNumberedCopy
              ? {}
              : {
                  get title() { return sourceBoard?.title ?? boardStem + " (my copy)"; },
                }),
          },
        ],
      },
      nextFiles: Dynamic = {
        ...files,
        [copyPath]: boardContent,
      };
    context.replaceDocument({
      ...context.state,
      content: {
        files: {
          ...nextFiles,
          [canvasMetadataFile]: serializeCanvasMetadata(
            parseCanvasMetadata(
              serializeCanvasMetadata(nextManifest),
              nextFiles,
            ),
          ),
        },
      },
    });
    return copyPath;
  }
  function offerBoardClashNotice(
    relativePath?: Dynamic,
    absolutePath?: Dynamic,
    remoteSha?: Dynamic,
    remoteContent?: Dynamic,
    reason?: Dynamic,
  ): Dynamic {
    let localContent: Dynamic = context.state.content.files[relativePath];
    if (documentOptions.onBoardClash === undefined || localContent === undefined) {
      applyClashResolution({
        path: absolutePath,
        base: liveHashes.get(absolutePath) ?? null,
        mine: localContent ?? null,
        theirsSha: remoteSha,
      });
      return;
    }
    boardClashes.set(relativePath, {
      theirsSha: remoteSha,
    });
    let resolved: Dynamic = false,
      resolvedRemoteSha: Dynamic = remoteSha,
      latestRemoteSha: Dynamic = (): Dynamic =>
        publishedHashes.has(absolutePath)
          ? (publishedHashes.get(absolutePath) ?? null)
          : resolvedRemoteSha,
      onResolution: Dynamic =
        (choice?: Dynamic, resolveChoice?: Dynamic): Dynamic =>
        (): Dynamic => {
          if (resolved || context.disposed) return;
          resolved = true;
          let entry: Dynamic = boardClashes.get(relativePath);
          resolvedRemoteSha = entry !== undefined ? entry.theirsSha : remoteSha;
          boardClashes.delete(relativePath);
          resolvingClashes.add(relativePath);
          documentOptions.debug?.event("reconcile-choice", {
            file: relativePath,
            choice: choice,
          });
          Promise.resolve(
            resolveChoice(context.state.content.files[relativePath] ?? localContent),
          ).finally((): Dynamic => {
            resolvingClashes.delete(relativePath);
            context.scheduleLocalSave();
          });
        },
      takeTheirs: Dynamic = (): Dynamic =>
        applyClashResolution(
          {
            path: absolutePath,
            base: liveHashes.get(absolutePath) ?? null,
            mine: localContent,
            theirsSha: latestRemoteSha(),
          },
          true,
        ).then((): Dynamic => {});
    function keepMine(): Dynamic {
      let latestSha: Dynamic = latestRemoteSha();
      latestSha === null
        ? (liveHashes.delete(absolutePath), fileDirtyVersions.delete(relativePath))
        : liveHashes.set(absolutePath, latestSha);
      remoteContent !== undefined && latestSha !== null
        ? ((context.savedFiles[relativePath] = remoteContent), (context.loadedFiles[relativePath] = remoteContent))
        : (delete context.savedFiles[relativePath], delete context.loadedFiles[relativePath]);
    }
    async function keepMineAsCopy(contentToCopy?: Dynamic): Promise<Dynamic> {
      await takeTheirs();
      context.disposed || createMyCopy(relativePath, contentToCopy);
    }
    let offer: Dynamic = {
        file: relativePath,
        why: reason,
        get deleted(): Dynamic {
          return latestRemoteSha() === null;
        },
        takeTheirs: onResolution("take theirs", takeTheirs),
        keepMine: onResolution("keep mine", keepMine),
        keepMineAsCopy: onResolution("keep mine as a copy", keepMineAsCopy),
      },
      showOffer: Dynamic = (): Dynamic => {
        try {
          documentOptions.onBoardClash?.(offer);
        } catch {}
      };
    boardClashes.set(relativePath, {
      theirsSha: remoteSha,
      askedAt: timers.now(),
      ask: showOffer,
    });
    showOffer();
  }
  return {
    hasClash: (relativePath) => boardClashes.has(relativePath),
    isResolving: (relativePath) => resolvingClashes.has(relativePath),
    isHeld: (relativePath) => heldRemoteFiles.has(relativePath),
    heldPaths: () => [...heldRemoteFiles],
    noteRemoteVersion(relativePath, remoteSha) {
      if (!boardClashes.has(relativePath)) return false;
      boardClashes.set(relativePath, {
        ...boardClashes.get(relativePath),
        theirsSha: remoteSha,
      });
      return true;
    },
    remindStalePrompt(relativePath) {
      let clash: Dynamic = boardClashes.get(relativePath);
      clash.ask !== undefined &&
        clash.askedAt !== undefined &&
        timers.now() - clash.askedAt > 2e4 &&
        ((clash.askedAt = timers.now()), clash.ask());
    },
    hold(relativePath) {
      heldRemoteFiles.add(relativePath);
      scheduleHeldRemoteCheck();
    },
    dropHold: (relativePath) => void heldRemoteFiles.delete(relativePath),
    releaseHeldFile,
    rememberOverwrittenEdit: (edit) => void overwrittenEdits.set(edit.file, edit),
    forgetOverwrittenEdit: (relativePath) => void overwrittenEdits.delete(relativePath),
    reapplyOverwrittenEdit,
    offerOverwrittenEditNotice,
    hasLocalBoardChanges,
    offerBoardClashNotice,
    createMyCopy,
    handleBoardClash,
    dispose() {
      heldRemoteTimer !== undefined &&
        (timers.clearTimeout(heldRemoteTimer), (heldRemoteTimer = undefined));
    },
  };
}
