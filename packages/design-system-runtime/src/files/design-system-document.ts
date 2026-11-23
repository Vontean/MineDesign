import { uiMessage } from '@minedesign/contracts/ui-messages';
import type * as Core from "../contracts";
import type * as M from "../contracts/design-system-document";
import type * as F from "../contracts/files-core";
/** Restored application module; prepare first, initialize in original order. */
import { addressedProjectFileUrl, notifyAddressedFiles, setAddressedVersionResolver, setFileVersionResolver } from "../editor/addressed-files";
import { previewStaticNoticeSnapshot } from "../editor/component-preview";
import { blobFilesOwedToFileStorage, buildFilesIndex, damagedDerivedProjectPaths, DEFAULT_FILE_STORAGE_POLICY, explainUnpublishableFile, FILES_INDEX_PROJECT_PATH, filesLeftOutOfMigration, isDerivedProjectPath, PROJECT_FILE_PREFIXEditorFilesIndex, projectFilePath, projectFilesForSave, publishableFileMimeType, relativeProjectFilePath, validDerivedProjectFiles } from "../editor/files-index";
import { sha256, sha256Sync } from "../editor/index-file-store";
import { MIGRATION_ANALYTICS_EVENTS, reportMigrationAnalytics } from "../editor/migration-banners";
import { activeElementIsEditing, currentDesignSystemArtifactPath, designSystemFilesCodec, EMPTY_FILES_PEER_SOURCE, fileBaseName, HOT_CARRY_STORAGE_PREFIX, prioritizeStashedTextEdits, readOwedArtifactBlob, safeSessionStorage, stripEditingOffFromStashedIndex, summarizeFileNames } from "./carry";
import { createCarryStorage } from "./carry-storage";
import { createHotCarryRestorer } from "./hot-carry-restore";
import { snapshotHotCarry } from "./hot-carry-snapshot";
import {  } from "./crash-stash";
import { bytesToFileDataUri } from "./data-uri";
import { createDesignSystemFilesPort, DAMAGED_FILE_REPLACEMENT_CHARACTER } from "./design-system-port";
import { createFilesDocument } from "./document";
import { createDocumentUndo } from "./document-undo";
import { createFileClash } from "./file-clash";
import { authoredIndexMergeConflicts, describeIndexConflicts, invalidAssetGroupOrders } from "./index-conflicts";
import { fileContentContainsRuntimeMarkers, filePublishRejection, filePublishSizeRejection, MAX_FILE_PUBLISH_ENCODED_BYTES, retryFileRead } from "./paths";
import { describeStuckSave, formatUnsendableFilesMessage } from "./save-messages";
import { isTokenFilePath } from "./token-merge";
import { refreshManifest } from "../model/asset-commands";
import { setHeldFileBaseUrl, stringifyManifestWithinBudget } from "../model/derive-system";
import { generatedConsumptionReadme, stripGeneratedReadmeTail } from "../model/documentation";
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
    currentFileText = (filePath: string): string | null => {
      let value = document.content().files[filePath];
      if (typeof value === "string") {
        return value;
      } else {
        return null;
      }
    },
    keepOutOfUndo = (filePath: string): void => {
      documentUndo.keepOut(new Set([filePath]));
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
  const { stashOversizedCarry, consumeCarryStorage, clearCarriedFiles, purgeCarryStorage } = createCarryStorage({
    storage, carryStorageKey, timers, emit,
  });
  // 同名文件冲突：标记、提示、用户选择与释放都在模块内。document、queue 等靠后声明的绑定用 getter 或函数惰性读取
  const fileClash = createFileClash({
    get document() { return document; },
    get queue() { return queue; },
    port, clashPolicy, flags, flaggedPaths, noticedClashShas, readTexts, readShas, recentPublishes, timers,
    emit, notice, notifyFlags, isBusy, liveSha, currentFileText, keepOutOfUndo, takeRemoteFile,
    replaceFileText, advancePathRevision, clearCarriedFiles,
    isDisposed: () => disposed,
    retokenUndo: (filePath) => documentUndo.retoken(filePath),
    pruneUndoPaths: (paths, reason, includeContext) => documentUndo.pruneUndoPaths(paths, reason, includeContext),
    markDirty: (filePath, publishInput, baseSha) => markDirty(filePath, publishInput, baseSha),
    fileValueProvider: (filePath) => fileValueProvider(filePath),
    flushNow: () => enhancedDocument.flushNow(),
  });
  const { flagClashingFile, unflagFile, resolveOrFlagClash, refreshUnchangedLocalFile, healSimultaneousPublish,
    consumeRecentHeal, mergingTokenPaths } = fileClash;
  // 撤销栈：命令的创建、应用与修剪，以及别人对索引的改动记录。flagClashingFile 与 fileClash 互相依赖，惰性读取
  const documentUndo = createDocumentUndo({
    get document() { return document; },
    flags, pathRevisions, emit, notice, liveSha,
    flagClashingFile: (...flagArguments) => flagClashingFile(...flagArguments),
    flushNow: () => enhancedDocument.flushNow(),
  });
  let lastGeneratedFiles: Core.FileTable | undefined,
    lastGeneratedTitle: string | undefined,
    generatedTexts: Map<string, string> = new Map(),
    damagedGeneratedPaths: Set<string> = new Set(),
    userEditedLocally: boolean = false,
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
      !userEditedLocally ||
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
    // 恢复流程的状态在模块内；document、queue 等靠后声明的绑定用 getter 惰性读取
    hotCarryRestorer = createHotCarryRestorer({
      get document() { return document; },
      get queue() { return queue; },
      documentOptions, indexPath, flags, flaggedPaths, noticedClashShas, timers, emit, notice,
      consumeCarryStorage, currentFileText, liveSha, replaceFileText, flagClashingFile, notifyFlags,
      flushNow: () => enhancedDocument.flushNow(),
    }),
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
          documentUndo.notePublishingIndex(value);
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
            documentUndo.setIndexBase(JSON.parse(publishReport.texts[indexPath]));
          } catch {}
        }
        if (publishReport.paths.includes(indexPath)) {
          documentUndo.clearPublishingIndexes();
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
            fileClash.forgetRestoredStash(relativePath);
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
        hotCarryRestorer.announceLateRemovals(appliedRows);
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
          documentUndo.recordForeignIndexChanges(documentUndo.indexBase());
        }
        documentUndo.flushForeignIndexChanges();
        if (removedPaths.size > 0) {
          documentUndo.keepOut(removedPaths);
        }
        if (values.size > 0) {
          documentUndo.pruneUndoPaths(values, "adopted");
        }
      },
      onIndexMerged(indexMerge: F.IndexMergeNotice): void {
        documentUndo.recordForeignIndexChanges(indexMerge.base);
        if (indexMerge.conflicts.length > 0) {
          documentUndo.flushForeignIndexChanges();
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
        snapshotHotCarry({ document, documentOptions, flags, flaggedPaths, readTexts, readShas, preReadBases, materializedFingerprints, textIsLocallyHeld, textFingerprint, stashOversizedCarry }, carryState as { handoff?: boolean } | undefined),
      restore: (carryState) =>
        hotCarryRestorer.restore(carryState as M.RawHotCarry | null | undefined),
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
      documentUndo.flushForeignIndexChanges();
      documentUndo.spanTheirs(items, value);
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
      documentUndo.ensureIndexBase();
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
      documentUndo.recordForeignIndexChanges(documentUndo.indexBase());
      documentUndo.flushForeignIndexChanges();
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
          fileClash.markRestoredStash(filePath);
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
  document.subscribe((change): void => {
    if (change?.remote === true) {
      return;
    }
    if (!userEditedLocally && queue.pending()) {
      userEditedLocally = true;
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
  enhancedDocument.resolveFlagged = fileClash.resolveFlagged;
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
  enhancedDocument.stepCommand = documentUndo.createUndoCommand;
  enhancedDocument.bindUndoStack = documentUndo.bindUndoStack;
  enhancedDocument.regenerate = regenerate;
  enhancedDocument.writeReadmeTail = writeReadmeTail;
  enhancedDocument.personChanged = (): boolean => userEditedLocally;
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
