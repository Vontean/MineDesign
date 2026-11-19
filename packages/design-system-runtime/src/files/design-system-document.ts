import { uiMessage } from '@minedesign/contracts/ui-messages';
import type * as Core from "../contracts";
import type * as M from "../contracts/design-system-document";
import type * as F from "../contracts/files-core";
/** Restored application module; prepare first, initialize in original order. */
import { addressedProjectFileUrl, notifyAddressedFiles, setAddressedVersionResolver, setFileVersionResolver } from "../editor/addressed-files";
import { previewStaticNoticeSnapshot } from "../editor/component-preview";
import { blobFilesOwedToFileStorage, buildFilesIndex, damagedDerivedProjectPaths, DEFAULT_FILE_STORAGE_POLICY, encodeFileIndexKey, explainUnpublishableFile, FILES_INDEX_PROJECT_PATH, filesLeftOutOfMigration, isDerivedProjectPath, isProjectContentPath, PROJECT_FILE_PREFIXEditorFilesIndex, projectFilePath, projectFilesForSave, publishableFileMimeType, relativeProjectFilePath, restoreFilesFromIndex, validDerivedProjectFiles } from "../editor/files-index";
import { changedProjectFilePaths, mergeDesignSystemFiles, mergeFilesIndex, supportsDroppedPaths } from "../editor/files-merge";
import { cloneMergeValue, mergeValuesEqual, sha256, sha256Sync } from "../editor/index-file-store";
import { MIGRATION_ANALYTICS_EVENTS, reportMigrationAnalytics } from "../editor/migration-banners";
import { activeElementIsEditing, currentDesignSystemArtifactPath, designSystemFilesCodec, EMPTY_FILES_PEER_SOURCE, FILE_CONFLICT_CHOICE_SUFFIX, fileBaseName, HOT_CARRY_MAX_AGE_MS, HOT_CARRY_MAX_FILES, HOT_CARRY_MAX_INLINE_CHARS, HOT_CARRY_MAX_TOTAL_CHARS, HOT_CARRY_STORAGE_PREFIX, parseCarriedFileEdit, prioritizeStashedTextEdits, readCarriedFileEdits, readCarriedIndexEdit, readOwedArtifactBlob, RECENT_PUBLISH_CLASH_NOTICE_MS, RECENT_PUBLISH_HEAL_WINDOW_MS, restoreDesignSystemView, safeSessionStorage, snapshotDesignSystemView, stripEditingOffFromStashedIndex, summarizeFileNames } from "./carry";
import { CRASH_STASH_RETENTION_LABEL } from "./crash-stash";
import { bytesToFileDataUri } from "./data-uri";
import { createDesignSystemFilesPort, DAMAGED_FILE_REPLACEMENT_CHARACTER } from "./design-system-port";
import { createFilesDocument } from "./document";
import { authoredIndexMergeConflicts, describeIndexConflicts, HOT_CARRY_PROTOCOL_FIELD, indexAuthoredFieldsEqual, indexPresentationField, indexUndoForeignChanges, indexWithoutTitleAndDocs, invalidAssetGroupOrders, isGeneratedIndexField } from "./index-conflicts";
import { fileContentContainsRuntimeMarkers, filePublishRejection, filePublishSizeRejection, MAX_FILE_PUBLISH_ENCODED_BYTES, retryFileRead } from "./paths";
import { describeStuckSave, formatUnsendableFilesMessage } from "./save-messages";
import { availableConflictCopyName, fileContentsSemanticallyEqual, isTokenFilePath, mergeSupportedFileThreeWays, remoteTextLostLocalLines, summarizeConflictNames } from "./token-merge";
import { refreshManifest } from "../model/asset-commands";
import { setHeldFileBaseUrl, stringifyManifestWithinBudget } from "../model/derive-system";
import { generatedConsumptionReadme, stripGeneratedReadmeTail } from "../model/documentation";
import { freezeSortedFileTable } from "../model/file-commands";
import { DESIGN_SYSTEM_PATHS, hasGeneratedSystemHeader, isHeldFilePointer, isTextFilePath, setAllowAllBinaryFilePointers, storagePointerForFile } from "../model/file-policy";
import { DESIGN_SYSTEM_MANIFEST_VERSION, isPublishableFilePathModelFileTable, parseManifest } from "../model/file-table";
import { REACT_LIBRARY_CATALOG } from "../model/libraries";
import { parseManifestBundleMetadata } from "../model/manifest-metadata";
import { generatedReadmeTail, mergeReadmeWithGeneratedTail } from "../model/stored-file-codec";

function createDesignSystemFilesDocument(
  documentOptions: M.DesignSystemFilesDocumentOptions,
): M.DesignSystemFilesDocument {
  setHeldFileBaseUrl(
    PROJECT_FILE_PREFIXEditorFilesIndex,
  );
  let lazy: F.LazyReadState | undefined =
    documentOptions.lazy === true &&
    (documentOptions.port.mayWrite ?? documentOptions.port.canWrite) === false
      ? {
          rows: new Map(),
        }
      : undefined;
  setAllowAllBinaryFilePointers(lazy !== undefined);
  let indexPath: string =
      documentOptions.indexPath ?? FILES_INDEX_PROJECT_PATH,
    flags: Map<string, M.DocumentFlag> = new Map(),
    flaggedPaths: Set<string> = new Set(),
    flagSubscribers: Set<() => void> = new Set(),
    saveSubscribers: Set<(state: M.DocumentSaveState) => void> = new Set(),
    timers: Core.FilesTimers = documentOptions.timers ?? {
      setTimeout: (timerCallback: () => void, delayMs: number) =>
        setTimeout(timerCallback, delayMs),
      clearTimeout: (timerHandle: ReturnType<typeof setTimeout>) =>
        clearTimeout(timerHandle),
      now: (): number => Date.now(),
      random: (): number => Math.random(),
    },
    storage =
      documentOptions.storage !== undefined
        ? documentOptions.storage
        : safeSessionStorage(),
    carryStorageKey =
      HOT_CARRY_STORAGE_PREFIX +
      (documentOptions.stashKey ?? currentDesignSystemArtifactPath()),
    events: M.DocumentEvent[] = [],
    emit = (eventType: string, eventData?: unknown): void => {
      events.push({
        type: eventType,
        data: eventData,
      });
      if (events.length > 200) {
        events.shift();
      }
      try {
        documentOptions.onEvent?.(eventType, eventData);
      } catch {}
    },
    notice = (message: string): void => {
      try {
        documentOptions.onNotice?.(message);
      } catch {}
    },
    clashPolicy = documentOptions.clash ?? "mine",
    preparing = false,
    carrying: boolean = false,
    isBusy = () => {
      try {
        return (
          preparing ||
          carrying ||
          (documentOptions.isBusy ?? (() => activeElementIsEditing()))()
        );
      } catch {
        return preparing || carrying;
      }
    },
    noticedClashShas: Map<string, string | null | undefined> = new Map(),
    pathRevisions: Map<string, number> = new Map(),
    advancePathRevision = (filePath: string): void => {
      pathRevisions.set(filePath, (pathRevisions.get(filePath) ?? 0) + 1);
    },
    notifyFlags = (): void => {
      for (let flagSubscriber of [...flagSubscribers]) {
        try {
          flagSubscriber();
        } catch {}
      }
      let value = enhancedDocument.saveState();
      for (let saveSubscriber of [...saveSubscribers]) {
        try {
          saveSubscriber(value);
        } catch {}
      }
    },
    port = documentOptions.port,
    liveSha = (filePath: string): string | null | undefined =>
      port.liveSha?.(projectFilePath(filePath)),
    readTexts: Map<string, string> = new Map(),
    readShas: Map<string, string> = new Map(),
    locallyHeldTexts: Map<string, string | undefined> = new Map(),
    heldText = (filePath: string, fileContents = document.content().files) =>
      Object.hasOwn(fileContents, filePath) ? fileContents[filePath] : undefined,
    textIsLocallyHeld = (filePath: string, textKey: string) =>
      locallyHeldTexts.has(filePath) &&
      locallyHeldTexts.get(filePath) === heldText(textKey),
    preReadBases: Map<string, M.PreReadBase> = new Map(),
    materializedFingerprints: Map<string, string> = new Map(),
    textFingerprint = (items: string): string =>
      String(items.length) + ":" + items.slice(-96),
    latestVersion: string | undefined,
    latestFrameVersion: string | undefined,
    frameVersionFromBaseUri = () => {
      try {
        return /^\/_f\/([^/]+)\//.exec(
          new URL(globalThis.document?.baseURI ?? "").pathname,
        )?.[1];
      } catch {
        return;
      }
    },
    recordVersion = (version: string): void => {
      latestFrameVersion = frameVersionFromBaseUri();
      if (version !== latestVersion) {
        latestVersion = version;
        notifyAddressedFiles();
      }
    },
    recentPublishes: Map<string, M.RecentPublish> = new Map(),
    recentHeals: Map<string, number> = new Map(),
    consumeRecentHeal = (filePath: string) => {
      let entry = recentHeals.get(filePath);
      recentHeals.delete(filePath);
      return entry !== undefined && timers.now() - entry <= 1e4;
    },
    recentHealTimes: Map<string, number[]> = new Map(),
    mergingTokenPaths: Set<string> = new Set(),
    encoder = new TextEncoder(),
    currentFileText = (filePath: string): string | null => {
      let value = document.content().files[filePath];
      if (typeof value === "string") {
        return value;
      } else {
        return null;
      }
    },
    keepOutOfUndo = (filePath: string): void => {
      for (let value of undoCommands) {
        value.keepOut(new Set([filePath]));
      }
    },
    takeRemoteFile = (filePath: string): void => {
      let value: string = projectFilePath(filePath);
      document.held().add(value);
      let wasMissingRemotely: boolean = liveSha(filePath) === null;
      document.releaseHold(value);
      if (wasMissingRemotely) {
        readTexts.delete(value);
        readShas.delete(value);
        recentPublishes.delete(filePath);
      }
    },
    replaceFileText = (filePath: string, fileText: string): void => {
      keepOutOfUndo(filePath);
      document.updateContent(
        (documentContent) =>
          refreshManifest(
            {
              ...documentContent,
              files: Object.freeze({
                ...documentContent.files,
                [filePath]: fileText,
              }),
            },
            document.title(),
          ),
        {
          auto: true,
        },
      );
    };
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
        queue.withdraw(projectFilePath(filePath));
        refreshUnchangedLocalFile(
          filePath,
          projectFilePath(filePath),
          baseSha !== undefined ? baseSha : (liveSha(filePath) ?? null),
        );
        return;
      }
      if (fileMatchesCurrentPublish(filePath)) {
        queue.withdraw(projectFilePath(filePath));
        keepOutOfUndo(filePath);
        takeRemoteFile(filePath);
        return;
      }
      if (clashPolicy === "mine") {
        keepMineAndRepublish(filePath, baseSha);
        return;
      }
      if (!restoredStashPaths.has(filePath) && !fileSaveIsStuck(filePath)) {
        queue.withdraw(projectFilePath(filePath));
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
    queue.withdraw(projectFilePath(filePath));
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
      queue.withdraw(value);
      keepOutOfUndo(filePath);
      takeRemoteFile(filePath);
      return;
    }
    document.held().delete(value);
    for (let undoCommand of undoCommands) {
      undoCommand.retoken(filePath);
    }
    markDirty(
      value,
      currentFileText(filePath) === null
        ? (): null => null
        : fileValueProvider(filePath),
      remoteSha ?? null,
    );
    emit("clash-mine", {
      path: value,
      theirs: remoteSha ?? null,
    });
    if (!isBusy()) {
      enhancedDocument.flushNow();
    }
  }
  let fileMatchesCurrentPublish = (filePath: string) => {
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
    restoredStashPaths: Set<string> = new Set(),
    fileSaveIsStuck = (filePath: string) =>
      queue
        .state()
        .stuck?.paths?.includes(projectFilePath(filePath)) ===
        true || queue.unsendable().has(projectFilePath(filePath)),
    remoteRevertPending: Set<string> = new Set(),
    remoteRevertTokens: Map<string, object> = new Map();
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
      if (document.loadState() !== "live") {
        remoteRevertPending.delete(filePath);
        return;
      }
      if (isBusy()) {
        timers.setTimeout(callback, 500);
        return;
      }
      queue.withdraw(remotePath);
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
          pruneUndoPaths(new Set([filePath]), uiMessage("design-system.designSystemDocument.tookTheirs"), true);
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
    document.held().delete(remotePath);
    if (!fileMatchesCurrentPublish(filePath)) {
      for (let value of undoCommands) {
        value.retoken(filePath);
      }
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
          disposed ||
          document.loadState() !== "live" ||
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
                    () => documentOptions.port.readBytes(remotePath),
                    timers,
                  ).catch((): void => {
                    return;
                  }),
                  promise,
                ]);
        if (
          remoteRevertTokens.get(filePath) !== state ||
          disposed ||
          document.loadState() !== "live" ||
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
          port.primeRead?.(remotePath, value);
        }
        keepOutOfUndo(filePath);
        takeRemoteFile(filePath);
        if (value === null) {
          readTexts.delete(remotePath);
          readShas.delete(remotePath);
          recentPublishes.delete(filePath);
        }
        advancePathRevision(filePath);
        pruneUndoPaths(new Set([filePath]), uiMessage("design-system.designSystemDocument.tookTheirs"));
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
    queue.withdraw(projectFilePath(filePath));
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
        () => documentOptions.port.readText(absolutePath),
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
      markDirty(absolutePath, fileValueProvider(filePath), remoteFile.sha256);
      enhancedDocument.flushNow();
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
        port.primeRead?.(absolutePath, {
          bytes: encoder.encode(remoteFile.text),
          sha256: remoteFile.sha256,
          contentType:
            publishableFileMimeType(filePath, remoteFile.text) ??
            "text/plain",
        });
      } catch {}
      queue.withdraw(absolutePath);
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
    document.held().delete(absolutePath);
    replaceFileText(filePath, mergeResult.text);
    markDirty(absolutePath, fileValueProvider(filePath), remoteFile.sha256);
    emit("merged", {
      path: absolutePath,
      theirs: remoteFile.sha256,
      wrote: true,
      why: remotePath,
    });
    enhancedDocument.flushNow();
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
        enhancedDocument.flushNow();
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
    publishingIndexBases: Core.FilesIndex[] = [];
  function recordForeignIndexChanges(foreignIndex?: Core.FilesIndex): void {
    let value = document.index().base();
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
  let undoStack: F.FileMutationBatch | undefined,
    undoCommands: M.UndoCommand[] = [];
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
                document.index().get(),
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
      document.title(),
    );
    document.setContent(value);
    for (let filePath of mergeDelta.localOnly) {
      flagClashingFile(
        filePath,
        "undo",
        liveSha(filePath),
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
            document.index().get(),
          ).join(", ") +
          ".",
      );
    }
    emit(direction, state);
    enhancedDocument.flushNow();
  }
  let mergeUndoTokenText = (
    filePath: string,
    remoteText: string,
    baseText: string,
    localText: string,
  ) => {
    if (
      !isTokenFilePath(filePath) ||
      flags.has(filePath) ||
      document.held().has(projectFilePath(filePath))
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
        flags.has(filePath) ||
        document.held().has(projectFilePath(filePath)) ||
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
              buildFilesIndex(document.title(), beforeState.files),
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
            document.content().files,
            document.title(),
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
            document.setContent(capturePair().after);
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
              document.title(),
              afterState.files,
            ),
            afterIndex: Core.FilesIndex = buildFilesIndex(
              document.title(),
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
              document.title(),
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
  let lastGeneratedFiles: Core.FileTable | undefined,
    lastGeneratedTitle: string | undefined,
    generatedTexts: Map<string, string> = new Map(),
    damagedGeneratedPaths: Set<string> = new Set(),
    personChanged: boolean = false,
    generatedReadme: M.GeneratedReadme | undefined,
    generatedReadmeStopped: boolean = false,
    generatedReadmePending: boolean = false,
    generatedReadmeTexts: Set<string> = new Set(),
    generatedReadmeConflictCount = 0,
    recentGeneratedReadmeWrites: number[] = [],
    generatedReadmeTimer: ReturnType<typeof setTimeout> | undefined,
    scheduleReadmeRegeneration = (): void => {
      let value = timers.now();
      while (
        recentGeneratedReadmeWrites.length > 0 &&
        value - recentGeneratedReadmeWrites[0] > 60000
      ) {
        recentGeneratedReadmeWrites.shift();
      }
      if (
        recentGeneratedReadmeWrites.length >= 10 ||
        generatedReadmeTimer !== undefined
      ) {
        return;
      }
      recentGeneratedReadmeWrites.push(value);
      generatedReadmeTimer = timers.setTimeout((): void => {
        generatedReadmeTimer = undefined;
        lastGeneratedFiles = undefined;
        if (regenerate().length > 0) {
          queue.commit();
        }
      }, 1000);
    },
    readmeHeading = (): string =>
      "# " +
      (document.title().replace(/\s+/g, " ").trim() || uiMessage("design-system.designSystemDocument.designSystem")) +
      `
`;
  function ensureReactPreviewLibraries(): void {
    if (!previewStaticNoticeSnapshot()) {
      return;
    }
    let files = document.content().files;
    if (files[DESIGN_SYSTEM_PATHS.bundleJs] === undefined) {
      return;
    }
    let value =
      parseManifestBundleMetadata(
        files[DESIGN_SYSTEM_PATHS.manifest] ?? "",
      ).libraries ?? [];
    if (
      value.some((library) =>
        REACT_LIBRARY_CATALOG.some(
          (existingLibrary): boolean => existingLibrary.name === library.name,
        ),
      )
    ) {
      return;
    }
    let manifestText = stringifyManifestWithinBudget({
      ...parseManifest(
        files[DESIGN_SYSTEM_PATHS.manifest] ?? "",
      ),
      manifestVersion: DESIGN_SYSTEM_MANIFEST_VERSION,
      libraries: [
        ...REACT_LIBRARY_CATALOG.map((library) => ({
          name: library.name,
          version: "18",
        })),
        ...value,
      ],
    });
    document.updateContent(
      (library) =>
        refreshManifest(
          {
            ...library,
            files: Object.freeze({
              ...library.files,
              [DESIGN_SYSTEM_PATHS.manifest]: manifestText,
            }),
          },
          document.title(),
        ),
      {
        auto: true,
      },
    );
  }
  let generatedOwnership: Map<string, "ours" | "theirs" | number> = new Map(),
    foreignFileNoticePaths: Set<string> = new Set(),
    foreignFileNotices: M.ForeignFileNotice[] = [],
    ownershipProbeGeneration: number = 0,
    ownershipProbeChain: Promise<void> = Promise.resolve(),
    disposed: boolean = false,
    ownedFilesDiscovered: boolean = false,
    generatedRefreshOwed: boolean = false,
    ownershipRetryTimer: ReturnType<typeof setTimeout> | undefined,
    ownershipRetryAttempt: number = 0,
    ownershipProbeTimeoutMs: number = 1e4,
    ownershipRetryDelays: number[] = [2000, 5000, 15000, 30000, 60000, 60000],
    fileWasGeneratedByEditor = (filePath: string, fileText: string) => {
      let value: string =
        relativeProjectFilePath(filePath) ?? filePath;
      if (value !== DESIGN_SYSTEM_PATHS.manifest) {
        return hasGeneratedSystemHeader(value, fileText);
      }
      try {
        let parsedFile: { manifestVersion?: unknown; files?: unknown } | null =
          JSON.parse(fileText);
        return (
          parsedFile !== null &&
          typeof parsedFile === "object" &&
          !Array.isArray(parsedFile) &&
          typeof parsedFile.manifestVersion === "number" &&
          (parsedFile.manifestVersion <= DESIGN_SYSTEM_MANIFEST_VERSION ||
            Array.isArray(parsedFile.files))
        );
      } catch {
        return false;
      }
    },
    ownershipProbePending = () =>
      [...generatedOwnership.values()].some(
        (numericValue): boolean => typeof numericValue === "number",
      ),
    generatedWorkPending = () =>
      !disposed &&
      (ownershipProbePending() ||
        ownedFilesDiscovered ||
        generatedRefreshOwed ||
        ownershipRetryTimer !== undefined),
    generatedPendingNotified = false,
    notifyGeneratedPending = (): void => {
      let value = generatedWorkPending();
      if (value === generatedPendingNotified) {
        return;
      }
      generatedPendingNotified = value;
      let saveState = enhancedDocument.saveState();
      for (let subscriber of [...saveSubscribers]) {
        try {
          subscriber(saveState);
        } catch {}
      }
    },
    announceForeignFiles = (): void => {
      let value = foreignFileNotices;
      foreignFileNotices = [];
      for (let operation of ["write", "remove"]) {
        let fileNames = value
          .filter((change): boolean => change.wanted === operation)
          .map((fileEntry) => fileEntry.name);
        if (fileNames.length === 0) {
          continue;
        }
        reportMigrationAnalytics(
          MIGRATION_ANALYTICS_EVENTS.foreignFilesNoticed,
        );
        let singleFile: boolean = fileNames.length === 1;
        notice(
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
    },
    finishOwnershipProbe = (): void => {
      if (disposed) {
        return;
      }
      if (!ownershipProbePending()) {
        if (foreignFileNotices.length > 0) {
          announceForeignFiles();
        }
        if (ownedFilesDiscovered) {
          ownedFilesDiscovered = false;
          generatedRefreshOwed = true;
          lastGeneratedFiles = undefined;
          scheduleGeneratedRetry();
        }
      }
      notifyGeneratedPending();
    },
    ownershipFailureNoticed: boolean = false,
    scheduleOwnershipRetry = (): void => {
      if (disposed || ownershipRetryTimer !== undefined) {
        return;
      }
      if (ownershipRetryAttempt >= ownershipRetryDelays.length) {
        if (!ownershipFailureNoticed) {
          ownershipFailureNoticed = true;
          notice(
            uiMessage("design-system.designSystemDocument.theFilesThisEditorMakes"),
          );
        }
        return;
      }
      ownershipRetryTimer = timers.setTimeout((): void => {
        ownershipRetryTimer = undefined;
        lastGeneratedFiles = undefined;
        regenerate();
        if (queue.state().dirty > 0) {
          queue.commit();
        }
        finishOwnershipProbe();
      }, ownershipRetryDelays[ownershipRetryAttempt++]);
    },
    recordForeignFile = (filePath: string, operation: string): void => {
      generatedOwnership.set(filePath, "theirs");
      if (!foreignFileNoticePaths.has(filePath)) {
        foreignFileNoticePaths.add(filePath);
        foreignFileNotices.push({
          name: relativeProjectFilePath(filePath) ?? filePath,
          wanted: operation,
        });
      }
    },
    withOwnershipDeadline = <Value>(promise: Promise<Value>): Promise<Value> =>
      new Promise<Value>((resolve, reject): void => {
        let value = timers.setTimeout(
          () =>
            reject({
              code: "deadline",
            }),
          ownershipProbeTimeoutMs,
        );
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
  function canGenerateFile(
    filePath: string,
    operation: "write" | "remove",
  ): boolean {
    if (port.liveSha?.(filePath) === null) {
      return true;
    }
    let entry = generatedOwnership.get(filePath);
    if (entry !== undefined) {
      return entry === "ours";
    }
    let peekBytes = port.peekBytes;
    if (peekBytes === undefined) {
      recordForeignFile(filePath, operation);
      ownershipProbeChain.then(finishOwnershipProbe);
      return false;
    }
    let value = ++ownershipProbeGeneration;
    generatedOwnership.set(filePath, value);
    ownershipProbeChain = ownershipProbeChain
      .then(() =>
        withOwnershipDeadline(
          retryFileRead(() => peekBytes(filePath), timers),
        ),
      )
      .then(
        (bytes): string =>
          fileWasGeneratedByEditor(
            filePath,
            new TextDecoder().decode(bytes.bytes),
          )
            ? "ours"
            : "theirs",
        (error: { code?: string } | undefined): string | undefined =>
          error?.code === "not_found" &&
          typeof port.liveSha?.(filePath) !== "string"
            ? "ours"
            : undefined,
      )
      .then((ownershipResult) => {
        if (disposed || generatedOwnership.get(filePath) !== value) {
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
  let settleOwnershipProbes = async (): Promise<void> => {
    for (let index: number = 0; index < 4 && !disposed; index++) {
      await ownershipProbeChain;
      if (ownedFilesDiscovered || generatedRefreshOwed) {
        ownedFilesDiscovered = false;
        generatedRefreshOwed = false;
        if (generatedRetryTimer !== undefined) {
          timers.clearTimeout(generatedRetryTimer);
          generatedRetryTimer = undefined;
        }
        lastGeneratedFiles = undefined;
        regenerate();
        if (queue.state().dirty > 0) {
          queue.commit();
        }
      }
      notifyGeneratedPending();
      if (!ownershipProbePending()) {
        return;
      }
    }
  };
  function regenerate(): string[] {
    if (
      documentOptions.generated !== true ||
      !personChanged ||
      document.readOnly() ||
      document.loadState() !== "live" ||
      flags.size > 0
    ) {
      return [];
    }
    ensureReactPreviewLibraries();
    let files = document.content().files;
    if (
      files === lastGeneratedFiles &&
      document.title() === lastGeneratedTitle
    ) {
      return [];
    }
    lastGeneratedFiles = files;
    lastGeneratedTitle = document.title();
    let items: string[] = [],
      value: Map<string, string> = validDerivedProjectFiles(
        files,
      );
    for (let [filePath, fileText] of value) {
      if (generatedTexts.get(filePath) === fileText) {
        continue;
      }
      if (port.liveSha?.(filePath) === sha256Sync(fileText)) {
        generatedTexts.set(filePath, fileText);
        continue;
      }
      if (!canGenerateFile(filePath, "write")) {
        continue;
      }
      generatedTexts.set(filePath, fileText);
      queue.markDirty(filePath, () => fileText);
      items.push(filePath);
    }
    let values = new Set<string>(
        damagedDerivedProjectPaths(files),
      ),
      damagedPaths = [...values].filter(
        (filePath): boolean => !damagedGeneratedPaths.has(filePath),
      );
    for (let filePath of damagedGeneratedPaths) {
      if (!values.has(filePath)) {
        damagedGeneratedPaths.delete(filePath);
      }
    }
    for (let filePath of damagedPaths) {
      damagedGeneratedPaths.add(filePath);
    }
    if (damagedPaths.length > 0) {
      let singlePath: boolean = damagedPaths.length === 1,
        hasPublishedFiles = damagedPaths.some(
          (filePath): boolean => typeof port.liveSha?.(filePath) === "string",
        );
      notice(
        summarizeFileNames(
          damagedPaths.map(
            (filePath) => relativeProjectFilePath(filePath) ?? filePath,
          ),
        ) +
          (singlePath ? " is" : " are") +
          " not being updated. Find the " +
          DAMAGED_FILE_REPLACEMENT_CHARACTER +
          " in your tokens, names, notes or READMEs and type it again." +
          (hasPublishedFiles ? " What is published stays as it is until then." : ""),
      );
    }
    let knownListing = port.knownListing?.();
    for (let filePath of new Set([
      ...generatedTexts.keys(),
      ...(knownListing !== undefined
        ? [...knownListing.keys()].filter(isDerivedProjectPath)
        : []),
    ])) {
      if (value.has(filePath) || values.has(filePath)) {
        continue;
      }
      generatedTexts.delete(filePath);
      if (port.liveSha?.(filePath) === null) {
        continue;
      }
      if (!canGenerateFile(filePath, "remove")) {
        continue;
      }
      queue.markDirty(filePath, (): null => null);
      items.push(filePath);
    }
    updateReadmeTail(files, items);
    generateMissingReadme(files, items);
    if (items.length > 0) {
      emit("generated", {
        paths: items,
      });
    }
    return items;
  }
  let projectReadmePath: string = projectFilePath(
      DESIGN_SYSTEM_PATHS.readme,
    ),
    CONSUMER_PROJECT_PATH_HINT: string =
      "Every path named below is under `project/` in this design system: read `project/api/tokens.md`, not `api/tokens.md`.",
    wireReadme = (readmeText: string): string => {
      let value = generatedReadmeTail(
        generatedConsumptionReadme(
          Object.freeze({
            ...document.content().files,
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
    },
    lastWireReadme: string | undefined,
    readmeTailPending: boolean = false;
  function updateReadmeTail(fileTable: Core.FileTable, items: string[]): void {
    let value = fileTable[DESIGN_SYSTEM_PATHS.readme];
    if (
      items.length === 0 ||
      typeof value !== "string" ||
      flags.has(DESIGN_SYSTEM_PATHS.readme) ||
      mergingTokenPaths.has(DESIGN_SYSTEM_PATHS.readme) ||
      readTexts.get(projectReadmePath) !== value
    ) {
      return;
    }
    let wireText = wireReadme(value);
    if (wireText === lastWireReadme) {
      return;
    }
    let publishedSha = port.liveSha?.(projectReadmePath);
    if (
      typeof publishedSha === "string" &&
      publishedSha !== readShas.get(projectReadmePath)
    ) {
      return;
    }
    lastWireReadme = wireText;
    if (
      publishedSha === undefined ||
      publishedSha === null ||
      publishedSha === sha256Sync(wireText)
    ) {
      return;
    }
    readmeTailPending = true;
    queue.markDirty(
      projectReadmePath,
      fileValueProvider(DESIGN_SYSTEM_PATHS.readme),
    );
    items.push(projectReadmePath);
  }
  function generateMissingReadme(
    fileTable: Core.FileTable,
    changedPaths: string[],
  ): void {
    if (fileTable[DESIGN_SYSTEM_PATHS.readme] !== undefined) {
      generatedReadme = undefined;
      return;
    }
    if (generatedReadmeStopped) {
      return;
    }
    let value = port.liveSha?.(projectReadmePath),
      readmeText = readmeHeading(),
      wireText = wireReadme(readmeText),
      readmeMissing: boolean = value === null,
      readmeUnchanged =
        value !== undefined ? value : port.heldSha?.(projectReadmePath),
      readmeMatches =
        generatedReadme?.sha !== undefined &&
        readmeUnchanged === generatedReadme.sha &&
        (readmeText !== generatedReadme.text || wireText !== generatedReadme.wire);
    if (!readmeMissing && !readmeMatches) {
      return;
    }
    let previousSha = readmeMissing ? null : generatedReadme!.sha;
    generatedReadme = {
      text: readmeText,
      wire: wireText,
      ...(readmeMissing
        ? {}
        : {
            sha: previousSha,
          }),
    };
    generatedReadmeTexts.add(readmeText);
    generatedReadmePending = true;
    markDirty(projectReadmePath, () => readmeText, previousSha);
    changedPaths.push(projectReadmePath);
  }
  async function writeReadmeTail(): Promise<boolean> {
    if (
      documentOptions.generated !== true ||
      document.readOnly() ||
      document.loadState() !== "live"
    ) {
      return false;
    }
    let value = document.content().files[DESIGN_SYSTEM_PATHS.readme];
    if (
      typeof value !== "string" ||
      flags.has(DESIGN_SYSTEM_PATHS.readme) ||
      mergingTokenPaths.has(DESIGN_SYSTEM_PATHS.readme) ||
      readTexts.get(projectReadmePath) !== value
    ) {
      return false;
    }
    let wireText = wireReadme(value),
      publishedSha = port.liveSha?.(projectReadmePath);
    if (
      publishedSha === undefined ||
      publishedSha === null ||
      publishedSha === sha256Sync(wireText) ||
      fileContentContainsRuntimeMarkers(wireText)
    ) {
      return false;
    }
    let remoteReadme = await documentOptions.port
      .readText(projectReadmePath)
      .catch((): null => null);
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
    queue.markDirty(
      projectReadmePath,
      fileValueProvider(DESIGN_SYSTEM_PATHS.readme),
    );
    emit("generated", {
      paths: [projectReadmePath],
    });
    return true;
  }
  let regenerationTimer: ReturnType<typeof setTimeout> | undefined,
    generatedRetryTimer: ReturnType<typeof setTimeout> | undefined,
    generatedRetryTimes: number[] = [],
    scheduleGeneratedRetry = (): void => {
      if (generatedRetryTimer !== undefined) {
        return;
      }
      let callback = (): void => {
        generatedRetryTimer = undefined;
        let value = timers.now();
        while (
          generatedRetryTimes.length > 0 &&
          value - generatedRetryTimes[0] > 60000
        ) {
          generatedRetryTimes.shift();
        }
        if (generatedRetryTimes.length >= 3) {
          if (generatedRefreshOwed) {
            generatedRetryTimer = timers.setTimeout(
              callback,
              60000 - (value - generatedRetryTimes[0]) + 100,
            );
          }
          return;
        }
        generatedRefreshOwed = false;
        regenerate();
        if (queue.state().dirty > 0) {
          generatedRetryTimes.push(value);
          queue.commit();
        }
        notifyGeneratedPending();
      };
      generatedRetryTimer = timers.setTimeout(callback, 1000);
    },
    flaggedRestoreEdits: Map<string, F.CarriedFileEdit> = new Map(),
    restoreConsumed: boolean = false,
    lateRemovalNoticePaths: Set<string> = new Set(),
    tablePort: M.DesignSystemTablePort = createDesignSystemFilesPort(documentOptions.port, {
      ...(lazy !== undefined
        ? {
            lazy: lazy,
          }
        : {}),
      wireText: (filePath: string, fileText: string) =>
        filePath === projectReadmePath && documentOptions.generated === true
          ? wireReadme(fileText)
          : fileText,
      tableText: (filePath: string, fileText: string) =>
        filePath === projectReadmePath
          ? stripGeneratedReadmeTail(fileText)
          : fileText,
      onReadText(filePath: string, fileText: string, fileSha: string): void {
        let value: string | undefined = relativeProjectFilePath(
          filePath,
        );
        if (value === undefined) {
          return;
        }
        let entry = readTexts.get(filePath);
        if (
          document.loadState() === "live" &&
          !preReadBases.has(filePath) &&
          readShas.get(filePath) !== fileSha &&
          heldText(value) !== fileText
        ) {
          preReadBases.set(filePath, {
            sha: readShas.get(filePath) ?? null,
            text: entry,
          });
        }
        readShas.set(filePath, fileSha);
        if (isHeldFilePointer(value, fileText)) {
          readTexts.delete(filePath);
        } else {
          readTexts.set(filePath, fileText);
        }
        let heldFileText = heldText(value);
        if (
          document.loadState() === "live" &&
          heldFileText !== fileText &&
          heldFileText === entry &&
          !locallyHeldTexts.has(filePath)
        ) {
          locallyHeldTexts.set(filePath, heldFileText);
        }
      },
      onDownloadsRefused(): void {
        timers.setTimeout(
          () =>
            void document.save().catch((): void => {
              return;
            }),
          0,
        );
      },
      onSend(files: Record<string, Core.FilePublishInput>): void {
        let value = files[indexPath];
        if (typeof value !== "string") {
          return;
        }
        publishingIndexFieldRevisions = new Map(localIndexFieldRevisions);
        try {
          publishingIndexBases.push(JSON.parse(value));
          if (publishingIndexBases.length > 4) {
            publishingIndexBases.shift();
          }
        } catch {}
      },
      onPublish(publishReport: M.FilePublishReport): void {
        if (
          publishReport.ok &&
          publishReport.paths.length > 0 &&
          typeof publishReport.version === "string" &&
          publishReport.version !== "" &&
          documentOptions.port.version().version === publishReport.version
        ) {
          recordVersion(publishReport.version);
        }
        let value = publishReport.texts?.[projectReadmePath],
          readmeIsCurrent =
            publishReport.paths.includes(projectReadmePath) &&
            currentFileText(DESIGN_SYSTEM_PATHS.readme) === null &&
            generatedReadme !== undefined &&
            (value === undefined
              ? generatedReadmePending
              : typeof value === "string" && generatedReadmeTexts.has(value));
        if (
          publishReport.paths.includes(projectReadmePath) &&
          (value === undefined ||
            generatedReadme === undefined ||
            value === generatedReadme.text)
        ) {
          generatedReadmePending = false;
        }
        if (publishReport.ok && generatedReadme !== undefined && readmeIsCurrent) {
          let readmeText = publishReport.texts?.[projectReadmePath],
            readmeSha = port.liveSha?.(projectReadmePath);
          if (typeof readmeText === "string" && typeof readmeSha === "string") {
            generatedReadme = {
              text: readmeText,
              wire: wireReadme(readmeText),
              sha: readmeSha,
            };
            if (readmeText !== readmeHeading()) {
              scheduleReadmeRegeneration();
            }
          }
        }
        if (
          !publishReport.ok &&
          publishReport.code === "conflict" &&
          generatedReadme !== undefined &&
          readmeIsCurrent
        ) {
          let hasReadmeSha: boolean = generatedReadme.sha !== undefined;
          generatedReadme = undefined;
          queue.withdraw(projectReadmePath);
          generatedReadmeConflictCount += 1;
          if (
            hasReadmeSha ||
            port.liveSha?.(projectReadmePath) !== null ||
            generatedReadmeConflictCount >= 2
          ) {
            generatedReadmeStopped = true;
          }
        }
        if (publishReport.ok && typeof publishReport.texts?.[indexPath] === "string") {
          try {
            lastIndexBase = JSON.parse(publishReport.texts[indexPath]);
          } catch {}
        }
        if (publishReport.paths.includes(indexPath)) {
          publishingIndexBases.length = 0;
        }
        if (publishReport.ok && publishReport.paths.includes(indexPath)) {
          for (let [fieldName, fieldRevision] of publishingIndexFieldRevisions) {
            if (localIndexFieldRevisions.get(fieldName) === fieldRevision) {
              localIndexFieldRevisions.delete(fieldName);
            }
          }
        }
        if (publishReport.ok && publishReport.texts !== undefined) {
          for (let [publishedPath, publishedText] of Object.entries(publishReport.texts)) {
            let relativePath: string | undefined = relativeProjectFilePath(publishedPath);
            if (
              relativePath === undefined ||
              isDerivedProjectPath(publishedPath)
            ) {
              continue;
            }
            if (publishedPath === projectReadmePath && publishedText !== null && readmeIsCurrent) {
              readTexts.delete(publishedPath);
              readShas.delete(publishedPath);
              recentPublishes.delete(relativePath);
              continue;
            }
            if (
              publishedPath === projectReadmePath &&
              publishedText === null &&
              currentFileText(DESIGN_SYSTEM_PATHS.readme) === null
            ) {
              scheduleReadmeRegeneration();
            }
            let publishedSha = publishReport.shas?.[publishedPath];
            if (publishedPath === projectReadmePath) {
              readmeTailPending = false;
            }
            restoredStashPaths.delete(relativePath);
            preReadBases.delete(publishedPath);
            if (publishedText === null) {
              readTexts.delete(publishedPath);
              readShas.delete(publishedPath);
              recentPublishes.delete(relativePath);
              continue;
            }
            recentPublishes.set(relativePath, {
              at: timers.now(),
              text: publishedText,
              base: readTexts.get(publishedPath),
              sha: publishedSha,
              ...(consumeRecentHeal(relativePath)
                ? {
                    healed: true,
                  }
                : {}),
            });
            readTexts.set(publishedPath, publishedText);
            if (publishedSha !== undefined) {
              readShas.set(publishedPath, publishedSha);
            } else {
              readShas.delete(publishedPath);
            }
          }
        }
        if (publishReport.ok) {
          for (let publishedPath of publishReport.paths) {
            if (isDerivedProjectPath(publishedPath)) {
              if (publishReport.texts !== undefined && publishReport.texts[publishedPath] === null) {
                generatedOwnership.delete(publishedPath);
              } else {
                generatedOwnership.set(publishedPath, "ours");
              }
            }
          }
        }
        let includesIndex = publishReport.paths.includes(indexPath),
          generatedPaths = publishReport.paths.filter(isDerivedProjectPath),
          sourcePaths = publishReport.paths.filter(
            (path) =>
              path !== indexPath &&
              !isDerivedProjectPath(path),
          );
        emit("save", {
          ok: publishReport.ok,
          ...(publishReport.code !== undefined
            ? {
                code: publishReport.code,
              }
            : {}),
          ...(publishReport.version !== undefined
            ? {
                version: publishReport.version,
              }
            : {}),
          files: sourcePaths,
          generated: generatedPaths,
          index: includesIndex,
          indexOnly: includesIndex && sourcePaths.length === 0 && generatedPaths.length === 0,
        });
      },
    }),
    document: M.BaseFilesDocument = createFilesDocument({
      codec: designSystemFilesCodec(indexPath, lazy),
      ...(documentOptions.startWhenNoIndex !== undefined
        ? {
            startWhenNoIndex: documentOptions.startWhenNoIndex,
          }
        : {}),
      parseContent: documentOptions.parseContent,
      initialContent: documentOptions.initialContent,
      ...(documentOptions.defaultTitle !== undefined
        ? {
            defaultTitle: documentOptions.defaultTitle,
          }
        : {}),
      port: tablePort,
      ...(documentOptions.readOnlyReason !== undefined
        ? {
            readOnlyReason: documentOptions.readOnlyReason,
          }
        : {}),
      ...(documentOptions.onNotice !== undefined
        ? {
            onNotice: documentOptions.onNotice,
          }
        : {}),
      onConflict(conflict: F.FileSaveConflict): void {
        if (isDerivedProjectPath(conflict.path)) {
          generatedOwnership.delete(conflict.path);
          queue.withdraw(conflict.path);
          generatedTexts.delete(conflict.path);
          lastGeneratedFiles = undefined;
          emit("generated-behind", {
            path: conflict.path,
          });
          scheduleGeneratedRetry();
          return;
        }
        if (
          conflict.path === projectReadmePath &&
          readmeTailPending &&
          currentFileText(DESIGN_SYSTEM_PATHS.readme) ===
            readTexts.get(projectReadmePath)
        ) {
          readmeTailPending = false;
          lastWireReadme = undefined;
          queue.withdraw(conflict.path);
          lastGeneratedFiles = undefined;
          emit("generated-behind", {
            path: conflict.path,
          });
          if (clashPolicy === "mine") {
            refreshUnchangedLocalFile(
              DESIGN_SYSTEM_PATHS.readme,
              conflict.path,
              conflict.theirsSha,
            );
          }
          scheduleGeneratedRetry();
          return;
        }
        let value: string =
          relativeProjectFilePath(conflict.path) ?? conflict.path;
        advancePathRevision(value);
        resolveOrFlagClash(value, "edit", conflict.theirsSha);
      },
      onRemoteApplied(
        appliedRows: F.FilesRemoteAppliedRow[],
        remoteChange: Core.FileRemoteChange,
      ): void {
        if (
          typeof remoteChange.to.version === "string" &&
          remoteChange.to.version !== ""
        ) {
          recordVersion(remoteChange.to.version);
        }
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
        let values = new Set<string>(),
          removedPaths = new Set<string>();
        for (let row of appliedRows) {
          emit("rebase", {
            path: row.path,
            decision: row.decision,
            sha: row.sha256,
            from: remoteChange.from.version,
            to: remoteChange.to.version,
          });
          if (
            isDerivedProjectPath(row.path) &&
            !(
              generatedOwnership.get(row.path) === "ours" &&
              row.sha256 !== null &&
              port.heldSha?.(row.path) === row.sha256
            )
          ) {
            generatedOwnership.delete(row.path);
          }
          let relativePath: string | undefined = relativeProjectFilePath(row.path);
          if (
            relativePath === undefined ||
            row.decision === "ignored" ||
            row.decision === "index"
          ) {
            continue;
          }
          if (row.path === projectReadmePath) {
            generatedReadme = undefined;
          }
          advancePathRevision(relativePath);
          removedPaths.add(relativePath);
          if (row.decision === "held") {
            resolveOrFlagClash(relativePath, "edit", row.sha256);
            continue;
          }
          if (!isTokenFilePath(relativePath)) {
            values.add(relativePath);
          }
          if (flags.has(relativePath)) {
            unflagFile(relativePath);
          }
          if (row.decision === "removed") {
            readTexts.delete(row.path);
            readShas.delete(row.path);
            recentPublishes.delete(relativePath);
          } else {
            healSimultaneousPublish(relativePath, row.sha256);
          }
        }
        if (appliedRows.some((row): boolean => row.decision === "index")) {
          recordForeignIndexChanges(lastIndexBase);
        }
        flushForeignIndexChanges();
        if (removedPaths.size > 0) {
          for (let undoCommand of undoCommands) {
            undoCommand.keepOut(removedPaths);
          }
        }
        if (values.size > 0) {
          pruneUndoPaths(values, "adopted");
        }
      },
      onIndexMerged(indexMerge: F.IndexMergeNotice): void {
        recordForeignIndexChanges(indexMerge.base);
        if (indexMerge.conflicts.length > 0) {
          flushForeignIndexChanges();
        }
        let value = authoredIndexMergeConflicts(indexMerge);
        emit("index-merged", {
          conflicts: indexMerge.conflicts,
          lost: value,
        });
        let knownFields =
            clashPolicy === "mine" ? keepMineIndexPresentation(indexMerge) : [],
          conflictingFields = value.filter(
            (fieldName): boolean => !knownFields.includes(fieldName),
          );
        if (conflictingFields.length > 0) {
          notice(
            uiMessage("design-system.designSystemDocument.someoneElseChanged") +
              describeIndexConflicts(conflictingFields, indexMerge.merged).join(
                ", ",
              ) +
              " at the same time as you. Theirs was saved first, so theirs was kept.",
          );
        }
        let indexStore = document.index(),
          invalidOrders = invalidAssetGroupOrders(
            indexStore.get(),
            (groupName) => {
              let groupPrefix: string = "assets/" + groupName + "/",
                values = new Set<string>();
              for (let filePath of Object.keys(document.content().files)) {
                if (
                  filePath.startsWith(groupPrefix) &&
                  !(document.content().files[filePath] ?? "").startsWith(
                    "blob:",
                  )
                ) {
                  values.add(filePath.slice(groupPrefix.length));
                }
              }
              return values;
            },
          );
        if (Object.keys(invalidOrders).length > 0) {
          indexStore.update((indexContent): void => {
            for (let [groupName, order] of Object.entries(invalidOrders)) {
              let assetGroup = indexContent.assetGroups?.[groupName];
              if (assetGroup !== undefined) {
                assetGroup.order = order;
              }
            }
          });
          emit("index-orders", {
            groups: Object.keys(invalidOrders),
          });
        }
      },
      isBusy: isBusy,
      snapshot: (carryState) =>
        snapshotHotCarry(carryState as { handoff?: boolean } | undefined),
      restore: (carryState) =>
        restoreHotCarry(carryState as M.RawHotCarry | null | undefined),
      ...(documentOptions.hot !== undefined
        ? {
            hot: documentOptions.hot,
          }
        : {}),
      ...(documentOptions.timers !== undefined
        ? {
            timers: documentOptions.timers,
          }
        : {}),
      ...(documentOptions.commitMs !== undefined
        ? {
            commitMs: documentOptions.commitMs,
          }
        : {}),
      ...(documentOptions.early !== undefined
        ? {
            early: documentOptions.early,
          }
        : {}),
      ...(documentOptions.onHotEvent !== undefined
        ? {
            onHotEvent: documentOptions.onHotEvent,
          }
        : {}),
      ...(documentOptions.onBeforeRestart !== undefined
        ? {
            onBeforeRestart: documentOptions.onBeforeRestart,
          }
        : {}),
      ...(documentOptions.reveal !== undefined
        ? {
            reveal: documentOptions.reveal,
          }
        : {}),
      ...(documentOptions.saveStash !== undefined
        ? {
            saveStash: prioritizeStashedTextEdits(
              stripEditingOffFromStashedIndex(
                documentOptions.saveStash,
                indexPath,
              ),
            ),
          }
        : {}),
      ...(documentOptions.paced !== undefined
        ? {
            paced: documentOptions.paced,
          }
        : {}),
      peers: EMPTY_FILES_PEER_SOURCE,
    }) as M.BaseFilesDocument,
    localIndexFieldRevisions: Map<string, number> = new Map(),
    publishingIndexFieldRevisions: Map<string, number> = new Map(),
    indexFieldRevision: number = 0,
    indexFieldSnapshot: M.IndexFieldSnapshot | undefined,
    trackLocalIndexChanges = (isRemoteUpdate?: boolean): void => {
      let files = document.content().files,
        value = document.title(),
        manifestText = files[DESIGN_SYSTEM_PATHS.manifest];
      if (
        indexFieldSnapshot !== undefined &&
        indexFieldSnapshot.title === value &&
        indexFieldSnapshot.manifest === manifestText
      ) {
        return;
      }
      let currentIndex: Core.FilesIndex = buildFilesIndex(
        value,
        files,
      );
      if (!isRemoteUpdate && indexFieldSnapshot !== undefined) {
        let ix2 = indexFieldSnapshot.ix;
        if (ix2.title !== currentIndex.title) {
          localIndexFieldRevisions.set("title", ++indexFieldRevision);
        }
        for (let sectionName of new Set([
          ...Object.keys(ix2.sections ?? {}),
          ...Object.keys(currentIndex.sections ?? {}),
        ])) {
          if (ix2.sections?.[sectionName] !== currentIndex.sections?.[sectionName]) {
            localIndexFieldRevisions.set(
              "sections/" + sectionName,
              ++indexFieldRevision,
            );
          }
        }
        for (let groupName of new Set([
          ...Object.keys(ix2.assetGroups ?? {}),
          ...Object.keys(currentIndex.assetGroups ?? {}),
        ])) {
          if (
            ix2.assetGroups?.[groupName]?.tile !==
            currentIndex.assetGroups?.[groupName]?.tile
          ) {
            localIndexFieldRevisions.set(
              "assetGroups/" + groupName + "/tile",
              ++indexFieldRevision,
            );
          }
        }
      }
      indexFieldSnapshot = {
        title: value,
        manifest: manifestText,
        ix: currentIndex,
      };
    };
  function keepMineIndexPresentation(mergeNotice: F.IndexMergeNotice): string[] {
    let value: Core.FilesIndex = buildFilesIndex(
        document.title(),
        document.content().files,
        mergeNotice.merged,
      ),
      items: string[] = [];
    document.index().update((index): void => {
      for (let fieldName of mergeNotice.conflicts) {
        if (!localIndexFieldRevisions.has(fieldName)) {
          continue;
        }
        if (fieldName === "title") {
          index.title = value.title;
          items.push(fieldName);
          continue;
        }
        if (fieldName.startsWith("sections/")) {
          let sectionName = fieldName.slice(9),
            sectionValue = value.sections?.[sectionName];
          if (typeof sectionValue === "string") {
            index.sections = {
              ...(index.sections ?? {}),
              [sectionName]: sectionValue,
            };
            items.push(fieldName);
          }
          continue;
        }
        let tileMatch = /^assetGroups\/([^/]+)\/tile$/.exec(fieldName),
          localGroup =
            tileMatch !== null ? index.assetGroups?.[tileMatch[1]] : undefined,
          remoteGroup =
            tileMatch !== null
              ? value.assetGroups?.[tileMatch[1]]?.tile
              : undefined;
        if (localGroup !== undefined && remoteGroup !== undefined) {
          localGroup.tile = remoteGroup;
          items.push(fieldName);
        }
      }
      for (let [sectionName, sectionValue] of Object.entries<string>(
        value.sections ?? {},
      )) {
        if (
          !localIndexFieldRevisions.has("sections/" + sectionName) ||
          Object.hasOwn(index.sections ?? {}, sectionName) ||
          !Object.hasOwn(mergeNotice.base.sections ?? {}, sectionName) ||
          mergeNotice.base.sections?.[sectionName] === sectionValue
        ) {
          continue;
        }
        index.sections = {
          ...(index.sections ?? {}),
          [sectionName]: sectionValue,
        };
        items.push("sections/" + sectionName);
      }
    });
    if (items.length > 0) {
      flushForeignIndexChanges();
      for (let undoCommand of undoCommands) {
        undoCommand.spanTheirs(items, value);
      }
      emit("index-mine-kept", {
        keys: items,
      });
      if (!isBusy()) {
        queue.flushNow();
      }
    }
    return items;
  }
  document.subscribe((change) =>
    trackLocalIndexChanges(change?.remote === true),
  );
  document.whenLive().then(
    () => trackLocalIndexChanges(true),
    (): void => {
      return;
    },
  );
  let queue = document.queue();
  document.whenLive().then(
    (): void => {
      if (lastIndexBase === undefined) {
        lastIndexBase = cloneMergeValue(
          document.index().base(),
        );
      }
    },
    (): void => {
      return;
    },
  );
  let fileValueProvider = (filePath: string) => () => {
      let value = currentFileText(filePath);
      if (value === null) {
        throw Error(filePath + " is no longer in the table");
      }
      return value;
    },
    markDirty = (
      filePath: string,
      publishInput: () => Core.FilePublishInput,
      baseSha: string | null | undefined,
    ) => queue.markDirty(filePath, publishInput, baseSha),
    previousContentFiles = document.content().files;
  document.subscribe((change): void => {
    let files = document.content().files;
    if (change?.remote === true && files !== previousContentFiles) {
      for (let value of new Set([
        ...Object.keys(files),
        ...Object.keys(previousContentFiles),
      ])) {
        if (
          value !== DESIGN_SYSTEM_PATHS.manifest &&
          files[value] !== previousContentFiles[value]
        ) {
          keepOutOfUndo(value);
        }
      }
    }
    if (change?.remote === true) {
      recordForeignIndexChanges(lastIndexBase);
      flushForeignIndexChanges();
    }
    for (let [value, heldTextValue] of locallyHeldTexts) {
      let relativePath: string = relativeProjectFilePath(value)!;
      if (relativePath === undefined || heldText(relativePath, files) !== heldTextValue) {
        locallyHeldTexts.delete(value);
      }
    }
    for (let value of preReadBases.keys()) {
      let relativePath: string | undefined = relativeProjectFilePath(
        value,
      );
      if (
        relativePath === undefined ||
        !readShas.has(value) ||
        (Object.hasOwn(files, relativePath) &&
          (isHeldFilePointer(relativePath, files[relativePath])
            ? !readTexts.has(value)
            : files[relativePath] === readTexts.get(value)))
      ) {
        preReadBases.delete(value);
      }
    }
    previousContentFiles = files;
  });
  let enhancedDocument: M.DesignSystemFilesDocument =
      document as M.DesignSystemFilesDocument,
    disposeDocument = document.dispose.bind(document);
  enhancedDocument.dispose = (): void => {
    disposed = true;
    if (ownershipRetryTimer !== undefined) {
      timers.clearTimeout(ownershipRetryTimer);
    }
    if (generatedReadmeTimer !== undefined) {
      timers.clearTimeout(generatedReadmeTimer);
    }
    if (generatedRetryTimer !== undefined) {
      timers.clearTimeout(generatedRetryTimer);
    }
    if (regenerationTimer !== undefined) {
      timers.clearTimeout(regenerationTimer);
    }
    disposeDocument();
  };
  let restoreStash = document.restoreStash.bind(document);
  enhancedDocument.restoreStash = () => {
    let files = document.content().files,
      callback = (readmeText: string | undefined): void => {
        let currentReadme =
          document.content().files[DESIGN_SYSTEM_PATHS.readme];
        if (
          currentReadme === undefined ||
          currentReadme === readmeText ||
          !/^# [^\n]*\n?$/.test(currentReadme)
        ) {
          return;
        }
        document.updateContent(
          (content) => {
            let { [DESIGN_SYSTEM_PATHS.readme]: readmeFile, ...otherFiles } =
              content.files;
            return refreshManifest(
              {
                ...content,
                files: Object.freeze(
                  readmeText === undefined
                    ? otherFiles
                    : {
                        ...otherFiles,
                        [DESIGN_SYSTEM_PATHS.readme]: readmeText,
                      },
                ),
              },
              document.title(),
            );
          },
          {
            auto: true,
          },
        );
        let entry = readShas.get(projectReadmePath);
        if (readmeText === readTexts.get(projectReadmePath)) {
          queue.withdraw(projectReadmePath);
        } else if (typeof entry === "string") {
          markDirty(
            projectReadmePath,
            () => currentFileText(DESIGN_SYSTEM_PATHS.readme),
            entry,
          );
        } else if (readmeText !== undefined) {
          markDirty(
            projectReadmePath,
            () => currentFileText(DESIGN_SYSTEM_PATHS.readme),
            null,
          );
        } else {
          queue.withdraw(projectReadmePath);
          keepOutOfUndo(DESIGN_SYSTEM_PATHS.readme);
          takeRemoteFile(DESIGN_SYSTEM_PATHS.readme);
        }
      },
      value = restoreStash();
    if (value !== undefined) {
      callback(files[DESIGN_SYSTEM_PATHS.readme]);
      let invoke = value.do.bind(value);
      value.do = (): void => {
        let readmeText =
          document.content().files[DESIGN_SYSTEM_PATHS.readme];
        invoke();
        callback(readmeText);
      };
    }
    if (value !== undefined) {
      let currentFiles = document.content().files;
      for (let filePath of new Set([
        ...Object.keys(files),
        ...Object.keys(currentFiles),
      ])) {
        if (files[filePath] !== currentFiles[filePath]) {
          restoredStashPaths.add(filePath);
        }
      }
    }
    return value;
  };
  document.subscribeLoad((): void => {
    if (
      document.loadState() === "failed" &&
      document.bootFailure() === "access_revoked"
    ) {
      purgeCarryStorage(uiMessage("design-system.designSystemDocument.accessRevoked"));
    }
  });
  function unsavedTextPaths(): string[] {
    if (document.loadState() !== "live" || document.readOnly()) {
      return [];
    }
    let items = [];
    for (let [value, fileText] of projectFilesForSave(
      document.content().files,
    ) as Map<string, string>) {
      let relativePath: string = relativeProjectFilePath(value)!;
      if (
        flags.has(relativePath) ||
        !isTextFilePath(relativePath) ||
        readTexts.get(value) === fileText ||
        textIsLocallyHeld(value, relativePath) ||
        preReadBases.get(value)?.text === fileText
      ) {
        continue;
      }
      items.push(relativePath);
    }
    return items;
  }
  function unsavedRemovedFiles(): Record<string, string | null> {
    let state: Record<string, string | null> = {};
    if (document.loadState() !== "live" || document.readOnly()) {
      return state;
    }
    let files = document.content().files;
    for (let value of new Set([...readTexts.keys(), ...readShas.keys()])) {
      let relativePath: string | undefined = relativeProjectFilePath(
          value,
        ),
        entry = preReadBases.get(value);
      if (
        relativePath !== undefined &&
        !Object.hasOwn(files, relativePath) &&
        !flags.has(relativePath) &&
        !textIsLocallyHeld(value, relativePath) &&
        entry?.sha !== null
      ) {
        state[relativePath] = entry?.sha ?? readShas.get(value) ?? null;
      }
    }
    return state;
  }
  function unsavedBinaryPaths(): string[] {
    let items: string[] = [];
    if (document.loadState() !== "live" || document.readOnly()) {
      return items;
    }
    for (let [value, fileText] of projectFilesForSave(
      document.content().files,
    ) as Map<string, string>) {
      let relativePath: string = relativeProjectFilePath(value)!;
      if (
        isTextFilePath(relativePath) ||
        flags.has(relativePath) ||
        textIsLocallyHeld(value, relativePath)
      ) {
        continue;
      }
      if (
        isHeldFilePointer(relativePath, fileText)
          ? !readShas.has(value)
          : readTexts.get(value) !== fileText
      ) {
        items.push(relativePath);
      }
    }
    return items;
  }
  function snapshotHotCarry(carryInput?: {
    handoff?: boolean;
  }): M.HotCarrySnapshot {
    let value = (
        documentOptions.snapshotView ??
        ((viewState) => snapshotDesignSystemView(viewState))
      )(flaggedPaths),
      pendingTextPaths = unsavedTextPaths(),
      pendingRemovedFiles = unsavedRemovedFiles(),
      indexStore = document.index(),
      baseIndex = indexWithoutTitleAndDocs(indexStore.base()),
      currentIndex = indexWithoutTitleAndDocs(indexStore.get()),
      indexChanged =
        document.loadState() === "live" &&
        !document.readOnly() &&
        !mergeValuesEqual(baseIndex, currentIndex),
      pendingBinaryPaths = unsavedBinaryPaths();
    if (
      flags.size === 0 &&
      pendingTextPaths.length === 0 &&
      !indexChanged &&
      Object.keys(pendingRemovedFiles).length === 0 &&
      pendingBinaryPaths.length === 0
    ) {
      return value;
    }
    let state: Record<string, F.CarriedFileEdit> = {},
      inlineTextEdits: Record<string, F.CarriedFileEdit> = {},
      oversizedTextEdits: Record<string, F.CarriedFileEdit> = {},
      items = [],
      inlineBudget = HOT_CARRY_MAX_INLINE_CHARS,
      files = document.content().files,
      values = new Set(
        Object.keys(pendingRemovedFiles).map((filePath) =>
          readTexts.get(projectFilePath(filePath)),
        ),
      ),
      materializedValues = new Set(
        Object.keys(pendingRemovedFiles).map((filePath) =>
          materializedFingerprints.get(projectFilePath(filePath)),
        ),
      ),
      callback = (
        filePath: string,
        targetEdits: Record<string, F.CarriedFileEdit>,
        fileEdit: F.CarriedFileEdit,
      ): void => {
        let editLength = fileEdit.text.length + (fileEdit.baseText?.length ?? 0);
        if (editLength <= inlineBudget) {
          targetEdits[filePath] = fileEdit;
          inlineBudget -= editLength;
          return;
        }
        oversizedTextEdits[filePath] = fileEdit;
      };
    for (let filePath of flags.keys()) {
      let fileText = files[filePath];
      if (typeof fileText === "string") {
        callback(filePath, state, {
          text: fileText,
          base: flags.get(filePath)?.theirsSha ?? null,
        });
      }
    }
    for (let filePath of pendingTextPaths) {
      let absolutePath: string = projectFilePath(filePath);
      items.push(filePath);
      let entry = preReadBases.get(absolutePath),
        baseText = entry !== undefined ? entry.text : readTexts.get(absolutePath);
      callback(filePath, inlineTextEdits, {
        text: files[filePath],
        base:
          entry !== undefined ? entry.sha : (readShas.get(absolutePath) ?? null),
        ...(isTokenFilePath(filePath) && baseText !== undefined
          ? {
              baseText: baseText,
            }
          : {}),
      });
    }
    let indexEdit: F.CarriedIndexEdit | undefined,
      pendingIndexEdit: F.CarriedIndexEdit | undefined;
    if (indexChanged) {
      let indexSnapshot = {
          base: baseIndex,
          mine: currentIndex,
        },
        length = JSON.stringify(indexSnapshot).length;
      if (length <= inlineBudget) {
        indexEdit = indexSnapshot;
        inlineBudget -= length;
      } else {
        pendingIndexEdit = indexSnapshot;
      }
    }
    stashOversizedCarry(oversizedTextEdits, pendingIndexEdit);
    let saveQueue = document.queue();
    if (
      carryInput?.handoff !== false &&
      Object.keys(oversizedTextEdits).length === 0 &&
      pendingIndexEdit === undefined &&
      pendingBinaryPaths.length === 0 &&
      saveQueue.state().stuck === undefined &&
      saveQueue.conflicted().size === 0 &&
      saveQueue.unsendable().size === 0
    ) {
      saveQueue.stashHandedOff();
    }
    return {
      ...value,
      [HOT_CARRY_PROTOCOL_FIELD]: 1,
      ...(flags.size > 0
        ? {
            mine: state,
          }
        : {}),
      ...(items.length > 0
        ? {
            unsaved: inlineTextEdits,
            unsavedNames: items,
          }
        : {}),
      ...(Object.keys(pendingRemovedFiles).length > 0
        ? {
            removed: pendingRemovedFiles,
          }
        : {}),
      ...(Object.keys(pendingRemovedFiles).length > 0 || pendingBinaryPaths.length > 0
        ? {
            binariesLeft: pendingBinaryPaths.slice(0, 200),
            binariesNew: pendingBinaryPaths
              .filter(
                (filePath) =>
                  !values.has(files[filePath]) &&
                  !materializedValues.has(textFingerprint(files[filePath])),
              )
              .slice(0, 200),
          }
        : {}),
      ...(indexChanged
        ? {
            indexUnsaved: true,
            ...(indexEdit !== undefined
              ? {
                  index: indexEdit,
                }
              : {}),
          }
        : {}),
    };
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
            Object.hasOwn(document.content().files, path),
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
            !Object.hasOwn(document.content().files, filePath)
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
          document.updateContent(
            (content) => {
              let { [filePath]: files, ...remainingFiles } = content.files;
              return refreshManifest(
                {
                  ...content,
                  files: Object.freeze(remainingFiles),
                },
                document.title(),
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
          let entry = document.index().get(),
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
              projectFilesForSave(document.content().files),
            ).content.files;
            document.updateContent(
              () =>
                refreshManifest(
                  {
                    v: 2,
                    files: Object.freeze({
                      ...files,
                    }),
                  },
                  document.title(),
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
                  document.index().get(),
                ).join(", ") +
                ".",
            );
          }
        }
        let newBinaryPaths = newBinaries.filter(
          (filePath): boolean =>
            !Object.hasOwn(document.content().files, filePath),
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
          enhancedDocument.flushNow();
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
          queue.withdraw(projectFilePath(filePath));
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
            Object.hasOwn(document.content().files, filePath),
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
        let loadState = document.loadState();
        if (loadState === "live" && !document.readOnly()) {
          return callback();
        }
        if (loadState === "live" && documentOptions.port.mayWrite === true) {
          return void restoreCallback();
        }
        if (
          loadState === "live" ||
          (loadState === "failed" &&
            document.bootFailure() === "access_revoked")
        ) {
          flaggedRestoreEdits.clear();
          return;
        }
        let retryRestore = (): void => {
          return;
        };
        retryRestore = document.subscribeLoad((): void => {
          if (document.loadState() === "loading") {
            return;
          }
          retryRestore();
          finishRestore();
        });
      };
    Promise.resolve().then(finishRestore);
  }
  document.subscribe((change): void => {
    if (change?.remote === true) {
      return;
    }
    if (!personChanged && queue.pending()) {
      personChanged = true;
    }
    ownershipRetryAttempt = 0;
    ownershipFailureNoticed = false;
    for (let value of flags.keys()) {
      queue.withdraw(projectFilePath(value));
    }
    for (let value of mergingTokenPaths) {
      queue.withdraw(projectFilePath(value));
    }
    if (documentOptions.generated === true) {
      if (regenerationTimer !== undefined) {
        timers.clearTimeout(regenerationTimer);
      }
      regenerationTimer = timers.setTimeout(
        (): void => {
          regenerationTimer = undefined;
          regenerate();
        },
        Math.min(300, Math.floor((documentOptions.commitMs ?? 800) / 2)),
      );
    }
  });
  let hasHeldConflicts = () => flags.size > 0 || mergingTokenPaths.size > 0,
    enhancedQueue: F.FilesSaveQueue = Object.create(queue);
  enhancedQueue.commit = (): void => {
    regenerate();
    queue.commit();
  };
  enhancedQueue.pending = () =>
    queue.pending() || hasHeldConflicts() || generatedWorkPending();
  enhancedDocument.queue = () => enhancedQueue;
  let originalSaveState = document.saveState.bind(document);
  enhancedDocument.saveState = () => {
    let value = originalSaveState();
    if (flags.size === 0) {
      if (
        (mergingTokenPaths.size > 0 || generatedWorkPending()) &&
        value.status === "ready"
      ) {
        return {
          status: "dirty",
        };
      } else {
        return value;
      }
    }
    let queueState = queue.state(),
      hasUnsendableFiles =
        value.status === "error" &&
        queueState.unsendable !== undefined &&
        value.message ===
          formatUnsendableFilesMessage(queueState.unsendable, {
            stashed: queueState.unsendableStashed === true,
          });
    if (value.status !== "ready" && value.status !== "dirty" && !hasUnsendableFiles) {
      return value;
    }
    return {
      status: "error",
      code: "conflict",
      message:
        (flags.size === 1
          ? fileBaseName([...flags.keys()][0]) + " has"
          : String(flags.size) + " files have") +
        " a newer version from someone else and yours is not saved. Choose theirs, yours, or yours as a copy.",
    };
  };
  let originalSubscribeSave = document.subscribeSave.bind(document),
    queueIsClean = () => {
      let value = queue.state();
      return (
        value.dirty === 0 && !value.inFlight && queue.conflicted().size === 0
      );
    };
  originalSubscribeSave((): void => {
    if (carrying && queueIsClean()) {
      carrying = false;
    }
  });
  enhancedDocument.subscribeSave = (subscriber) => {
    saveSubscribers.add(subscriber);
    let value = originalSubscribeSave(() =>
      subscriber(enhancedDocument.saveState()),
    );
    return (): void => {
      saveSubscribers.delete(subscriber);
      value();
    };
  };
  enhancedDocument.dirty = () =>
    queue.pending() || hasHeldConflicts() || generatedWorkPending();
  let originalFlushNow = document.flushNow.bind(document);
  enhancedDocument.flushNow = (): void => {
    regenerate();
    originalFlushNow();
  };
  enhancedDocument.save = async (): Promise<void> => {
    if (document.loadState() === "failed") {
      document.retryLoad();
      return;
    }
    enhancedDocument.flushNow();
    await settleOwnershipProbes();
    await queue.settle();
  };
  enhancedDocument.stuck = () => {
    let value = queue.state(),
      stuck = value.stuck,
      messageSuffix: string =
        value.unsendable !== undefined
          ? " " +
            formatUnsendableFilesMessage(value.unsendable, {
              restSaved: false,
              stashed: value.unsendableStashed === true,
            })
          : "";
    if (stuck === undefined) {
      return undefined;
    } else {
      return {
        code: stuck.code,
        since: stuck.since,
        retryable: stuck.retryable,
        message: describeStuckSave(stuck, timers.now()) + messageSuffix,
      };
    }
  };
  enhancedDocument.retryStuck = () => document.retrySave();
  enhancedDocument.flagged = () => flaggedPaths;
  enhancedDocument.flags = () => flags;
  enhancedDocument.subscribeFlagged = (subscriber) => {
    flagSubscribers.add(subscriber);
    return () => void flagSubscribers.delete(subscriber);
  };
  enhancedDocument.resolveFlagged = (filePath, choice): void => {
    if (!flags.has(filePath)) {
      return;
    }
    if (choice === "mine" && remoteRevertTokens.delete(filePath)) {
      remoteRevertPending.delete(filePath);
    }
    let value: string = projectFilePath(filePath),
      localText = currentFileText(filePath);
    if (choice === "copy") {
      let files = document.content().files,
        remotePath =
          localText === null
            ? null
            : availableConflictCopyName(filePath, (candidatePath) => {
                let candidateSha = port.liveSha?.(
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
      queue.withdraw(value);
      emit("flag-resolved", {
        path: value,
        choice: "copy",
        copy: projectFilePath(remotePath),
      });
      replaceFileText(remotePath, localText);
      advancePathRevision(filePath);
      unflagFile(filePath);
      pruneUndoPaths(new Set([filePath]), uiMessage("design-system.designSystemDocument.keptAsACopy"));
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
      enhancedDocument.flushNow();
      return;
    }
    queue.withdraw(value);
    emit("flag-resolved", {
      path: value,
      choice: choice,
    });
    if (choice === "theirs") {
      advancePathRevision(filePath);
      unflagFile(filePath);
      pruneUndoPaths(new Set([filePath]), uiMessage("design-system.designSystemDocument.tookTheirs"));
      keepOutOfUndo(filePath);
      takeRemoteFile(filePath);
      return;
    }
    let liveShaValue = liveSha(filePath);
    document.held().delete(value);
    unflagFile(filePath);
    for (let undoCommand of undoCommands) {
      undoCommand.retoken(filePath);
    }
    markDirty(value, () => localText, liveShaValue ?? null);
    enhancedDocument.flushNow();
  };
  enhancedDocument.flaggedSides = async (filePath) => {
    let value = currentFileText(filePath),
      remoteText: string | null = null;
    if (liveSha(filePath) !== null) {
      try {
        remoteText = (
          await createDesignSystemFilesPort(
            documentOptions.port,
          ).readText(projectFilePath(filePath))
        ).text;
      } catch {
        remoteText = null;
      }
    }
    return {
      mine: value,
      theirs: remoteText,
    };
  };
  enhancedDocument.stepCommand = createUndoCommand;
  enhancedDocument.bindUndoStack = (undoStackValue): void => {
    undoStack = undoStackValue;
  };
  enhancedDocument.regenerate = regenerate;
  enhancedDocument.writeReadmeTail = writeReadmeTail;
  enhancedDocument.personChanged = (): boolean => personChanged;
  enhancedDocument.events = () => events;
  let entryProblem = (
    filePath: string,
    fileText: string,
  ): M.EntryProblem | undefined => {
    let value: { reason: string } | undefined = filesLeftOutOfMigration({
      [filePath]: fileText,
    })[0];
    if (value !== undefined) {
      return {
        why: value.reason,
        cause:
          explainUnpublishableFile(filePath, fileText)?.cause ??
          (!isTextFilePath(filePath) &&
          storagePointerForFile(filePath, fileText) === null
            ? "unreadable"
            : "other"),
      };
    }
    let problemDetail: M.EntryProblem | undefined;
    try {
      problemDetail = tablePort.entryProblemDetail(
        projectFilePath(filePath),
        fileText,
      );
    } catch {
      problemDetail = filePublishRejection(
        projectFilePath(filePath),
        fileText,
      );
    }
    if (problemDetail !== undefined) {
      return problemDetail;
    }
    let sizeProblem = filePublishSizeRejection(fileText);
    if (sizeProblem === undefined) {
      return undefined;
    } else {
      return {
        why: sizeProblem,
        cause: "size",
      };
    }
  };
  enhancedDocument.neverSaves = entryProblem;
  enhancedDocument.editProblem = (nextDocument, nextOptions): undefined | string => {
    let files = nextDocument.files,
      nextFiles = nextOptions.files;
    if (files === nextFiles) {
      return;
    }
    let value = Object.keys(files).filter(
        (filePath): boolean => !Object.hasOwn(nextFiles, filePath),
      ),
      addedPaths =
        value.length === 0
          ? []
          : Object.keys(nextFiles).filter(
              (filePath): boolean => !Object.hasOwn(files, filePath),
            );
    for (let filePath of addedPaths.length === 0 ? [] : value) {
      let currentFileValue = files[filePath],
        matchingIndex = addedPaths.findIndex(
          (candidatePath): boolean => nextFiles[candidatePath] === currentFileValue,
        );
      if (matchingIndex < 0) {
        continue;
      }
      let renamedPath = addedPaths.splice(matchingIndex, 1)[0],
        callback = (path: string) => entryProblem(path, currentFileValue)?.why;
      if (
        !projectFilesForSave({
          [filePath]: currentFileValue,
        }).has(projectFilePath(filePath))
      ) {
        continue;
      }
      if (
        !(
          isHeldFilePointer(filePath, currentFileValue) ||
          isHeldFilePointer(
            filePath,
            document.content().files[filePath] ?? "",
          )
        ) &&
        !readShas.has(projectFilePath(filePath)) &&
        callback(filePath) !== undefined
      ) {
        continue;
      }
      let problemReason = callback(renamedPath);
      if (problemReason === undefined) {
        continue;
      }
      let isSizeProblem: boolean =
          problemReason === filePublishSizeRejection(currentFileValue),
        displayName =
          fileBaseName(renamedPath) ===
          fileBaseName(filePath)
            ? renamedPath.replace(/^assets\//, "")
            : fileBaseName(renamedPath),
        guidance: string = !isPublishableFilePathModelFileTable(
          projectFilePath(renamedPath),
        )
          ? /[%;:?#\\]/.test(renamedPath)
            ? uiMessage("design-system.designSystemDocument.chooseANameWithoutOr")
            : new TextEncoder().encode(projectFilePath(renamedPath))
                  .length > 512
              ? uiMessage("design-system.designSystemDocument.chooseAShorterName")
              : uiMessage("design-system.designSystemDocument.chooseAnotherName")
          : isSizeProblem && !isTextFilePath(renamedPath)
            ? uiMessage("design-system.designSystemDocument.itIsTooLargeFor") +
              String(
                ((MAX_FILE_PUBLISH_ENCODED_BYTES / 4) * 3) / 1048576,
              ) +
              " MB): keep it where it is, or replace it with a smaller copy first."
            : problemReason.charAt(0).toUpperCase() +
              problemReason.slice(1) +
              (/[.!?]$/.test(problemReason) ? "" : "."),
        problemMessage: string =
          uiMessage("design-system.designSystemDocument.nothingWasChanged") +
          displayName +
          '" cannot be saved, so "' +
          fileBaseName(filePath) +
          '" would have been lost. ' +
          guidance;
      notice(problemMessage);
      return problemMessage;
    }
    return;
  };
  enhancedDocument.heldGone = (filePath): boolean =>
    port.liveSha?.(projectFilePath(filePath)) === null;
  enhancedDocument.heldShaOf = (filePath) =>
    readShas.get(projectFilePath(filePath));
  setFileVersionResolver(enhancedDocument.heldShaOf);
  setAddressedVersionResolver(() =>
    frameVersionFromBaseUri() === latestFrameVersion
      ? latestVersion
      : undefined,
  );
  let readFreshHeldBytes: (url: string) => Promise<Uint8Array | null> =
    documentOptions.readAt ??
    (async (url: string): Promise<Uint8Array | null> => {
      try {
        let value = await fetch(url, {
          credentials: "same-origin",
          cache: "no-store",
        });
        if (value.ok && !value.redirected) {
          return new Uint8Array(await value.arrayBuffer());
        } else {
          return null;
        }
      } catch {
        return null;
      }
    });
  enhancedDocument.setPreparing = (isPreparing): void => {
    preparing = isPreparing;
  };
  enhancedDocument.carrying = (): void => {
    carrying = true;
    timers.setTimeout((): void => {
      if (carrying && queueIsClean()) {
        carrying = false;
      }
    }, 2000);
  };
  enhancedDocument.busy = () => isBusy();
  enhancedDocument.sendProblem = (filePath, fileText) => {
    let value: string | undefined;
    try {
      value = tablePort.entryProblem?.(
        projectFilePath(filePath),
        fileText,
      );
    } catch {
      value = undefined;
    }
    return value ?? filePublishSizeRejection(fileText);
  };
  enhancedDocument.tell = (message) => notice(message);
  enhancedDocument.heldBytes = async (
    filePath,
  ): Promise<M.HeldBytesResult | null> => {
    if (document.readOnly() || document.loadState() !== "live") {
      return null;
    }
    let value = document.content().files[filePath];
    if (
      value === undefined ||
      !isHeldFilePointer(filePath, value)
    ) {
      return null;
    }
    let absolutePath: string = projectFilePath(filePath),
      pathRevision = pathRevisions.get(filePath) ?? 0,
      liveShaValue = port.liveSha?.(absolutePath);
    if (liveShaValue === null) {
      return null;
    }
    let addressedUrl = addressedProjectFileUrl(filePath),
      fileBytes = addressedUrl === undefined ? null : await readFreshHeldBytes(addressedUrl),
      fileSha =
        fileBytes === null ? undefined : await sha256(fileBytes);
    if (
      fileBytes === null ||
      (typeof liveShaValue === "string" && liveShaValue !== fileSha)
    ) {
      try {
        fileBytes = (
          await retryFileRead(
            () => documentOptions.port.readBytes(absolutePath),
            timers,
          )
        ).bytes;
      } catch {
        return null;
      }
      fileSha = await sha256(fileBytes);
    }
    if (
      fileSha === undefined ||
      (typeof liveShaValue === "string" && liveShaValue !== fileSha)
    ) {
      return null;
    }
    if (
      document.content().files[filePath] !== value ||
      (pathRevisions.get(filePath) ?? 0) !== pathRevision
    ) {
      return null;
    }
    let dataUri = bytesToFileDataUri(
      fileBytes,
      publishableFileMimeType(filePath) ??
        "application/octet-stream",
    );
    materializedFingerprints.delete(absolutePath);
    materializedFingerprints.set(absolutePath, textFingerprint(dataUri));
    if (materializedFingerprints.size > 256) {
      materializedFingerprints.delete(
        materializedFingerprints.keys().next().value!,
      );
    }
    return {
      value: dataUri,
      witness: {
        rev: pathRevision,
        sha: fileSha,
      },
    };
  };
  enhancedDocument.heldStillGood = (
    filePath,
    witness,
  ): "gone" | "changed" | "good" => {
    let value = port.liveSha?.(projectFilePath(filePath));
    if (value === null) {
      return "gone";
    }
    if (
      (pathRevisions.get(filePath) ?? 0) !== witness.rev ||
      (typeof value === "string" && value !== witness.sha)
    ) {
      return "changed";
    } else {
      return "good";
    }
  };
  enhancedDocument.materializeOwed = async (
    readBlob: (
      id: string,
    ) => Promise<{ bytes: Uint8Array } | null> = readOwedArtifactBlob,
  ) => {
    if (document.readOnly() || document.loadState() !== "live") {
      return [];
    }
    let items = [];
    for (let { path: value, id: blobId } of blobFilesOwedToFileStorage(
      document.content().files,
      documentOptions.home ?? DEFAULT_FILE_STORAGE_POLICY,
    ) as { path: string; id: string }[]) {
      let blobData = await readBlob(blobId);
      if (blobData === null) {
        continue;
      }
      let materializedValue = isTextFilePath(value)
        ? new TextDecoder().decode(blobData.bytes)
        : bytesToFileDataUri(
            blobData.bytes,
            publishableFileMimeType(value) ??
              "application/octet-stream",
          );
      if (entryProblem(value, materializedValue) !== undefined) {
        continue;
      }
      document.updateContent(
        (fileEntry) =>
          fileEntry.files[value] === "blob:" + blobId
            ? {
                ...fileEntry,
                files: Object.freeze({
                  ...fileEntry.files,
                  [value]: materializedValue,
                }),
              }
            : fileEntry,
        {
          auto: true,
        },
      );
      keepOutOfUndo(value);
      items.push(value);
    }
    return items;
  };
  return enhancedDocument;
}
export {
  createDesignSystemFilesDocument,
};
export function installFilesDesignSystemDocument(): () => void {
  return () => {};
}
