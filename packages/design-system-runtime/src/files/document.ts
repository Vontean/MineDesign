import { uiMessage } from '@minedesign/contracts/ui-messages';
/** Restored application module; prepare first, initialize in original order. */
import type {
  FilesDocumentOptions,
  FilesDocument,
  FileDocumentState,
  FileRetryError,
  CrashStashOffer,
  FilesRemoteAppliedRow,
} from "../contracts/files-core";
import type * as Files from "../contracts";
import { normalizeArtifactTitle, normalizeTitleInput } from "../documents/artifact-document";
import { FILE_LIST_UNAVAILABLE_MESSAGE } from "../documents/write-access";
import { cloneMergeValue, createIndexFileStore, mergeDocumentValues, mergeValuesEqual, removeMissingMergeProperties } from "../editor/index-file-store";
import { BootReadError, filesBootRetryDelayForHotUpdate, getBootstrapRetryDelay, readFilesBootState } from "./boot-reader";
import { applyCrashStashEdits } from "./crash-stash";
import { createFilesHotUpdateController } from "./hot-updates";
import { filesPortExtensions, isReservedProjectFile, MIGRATION_MANIFEST_PATH, PROJECT_FILE_PREFIX, retryFileRead } from "./paths";
import { describeStuckSave, formatUnsendableFilesMessage, isTextFileListingRow } from "./save-messages";
import { createFilesSaveQueue } from "./save-queue";
import { recordArtifactEdit } from "../host/artifact-edit-count";

function createFilesDocument<Index extends { v: number }, Content>(
  documentOptions: FilesDocumentOptions<Index, Content>,
): FilesDocument<Index, Content> {
  let { codec: codec, port: port } = documentOptions,
    timers = documentOptions.timers ?? {
      setTimeout: (documentInput: () => void, documentOptionsA: number) =>
        setTimeout(documentInput, documentOptionsA),
      clearTimeout: (documentInputA: ReturnType<typeof setTimeout>) =>
        clearTimeout(documentInputA),
      now: (): number => Date.now(),
      random: (): number => Math.random(),
    },
    codecWants =
      codec.wants ??
      ((documentInputB: Files.FileListingRow) =>
        documentInputB.path.startsWith(PROJECT_FILE_PREFIX) &&
        isTextFileListingRow(documentInputB)),
    wantsFile = (documentInputC: Files.FileListingRow) =>
      !isInternalPath(documentInputC.path) && codecWants(documentInputC),
    parseContent = (documentInputD: unknown, documentOptionsB: Content) => {
      try {
        return documentOptions.parseContent(documentInputD);
      } catch {
        return documentOptionsB;
      }
    },
    parseTitle = (documentInputE: unknown, documentOptionsC: string) =>
      normalizeArtifactTitle(
        typeof documentInputE === "string" ? documentInputE.trim() : documentInputE,
      ) ?? documentOptionsC,
    state: FileDocumentState<Content> = {
      title: parseTitle(documentOptions.defaultTitle, "Appifact"),
      content: documentOptions.initialContent,
      comments: [],
    },
    fileTexts: Map<string, string> = new Map(),
    fileBaseShas: Map<string, string | null> = new Map(),
    savedFileTexts: Map<string, string> = new Map(),
    fileChangedHere = (documentInputF: string) =>
      fileTexts.has(documentInputF) &&
      fileTexts.get(documentInputF) !== savedFileTexts.get(documentInputF),
    heldRemotePaths: Set<string> = new Set(),
    loadState: "loading" | "failed" | "live" = "loading",
    lastError: { code: string; message: string } | undefined,
    lastSyncedAt: number | undefined,
    commitTimer: ReturnType<typeof setTimeout> | undefined,
    disposed: boolean = false,
    personChanged: boolean = false,
    changeSubscribers: Set<(event?: { remote: boolean }) => void> = new Set(),
    saveSubscribers: Set<
      (state: import("../contracts/platform-host").SaveState) => void
    > = new Set(),
    loadSubscribers: Set<() => void> = new Set(),
    indexStore = createIndexFileStore({
      path: codec.indexPath,
      port: port,
      schema: codec.schema,
      empty: codec.emptyIndex,
      externalMembers: (documentInputG: string) =>
        codec.externalMembers?.(documentInputG, fileTexts),
    }),
    reloadIndex = indexStore.reloadAndMerge.bind(indexStore),
    reloadAndMergeIndex = async (documentInputH: boolean): Promise<string[]> => {
      let value = indexStore.dirty(),
        documentValue = cloneMergeValue(indexStore.base()),
        documentState = cloneMergeValue(indexStore.get()),
        documentResult = await reloadIndex(),
        documentEntry: boolean = !mergeValuesEqual(
          indexStore.base(),
          documentValue,
        );
      if (value && documentEntry) {
        try {
          documentOptions.onIndexMerged?.({
            conflicts: documentResult,
            base: documentValue,
            mine: documentState,
            merged: indexStore.get(),
          });
        } catch {}
      }
      if (documentEntry && documentInputH) {
        composeState(true);
      }
      return documentResult;
    };
  indexStore.reloadAndMerge = () => reloadAndMergeIndex(true);
  let queue = createFilesSaveQueue({
      port: port,
      index: indexStore,
      timers: timers,
      ...(documentOptions.saveStash !== undefined
        ? {
            stash: documentOptions.saveStash,
          }
        : {}),
      ...(documentOptions.paced !== undefined
        ? {
            paced: documentOptions.paced,
          }
        : {}),
      ...(documentOptions.peers !== undefined
        ? {
            peers: documentOptions.peers,
          }
        : {}),
      onConflict(
        documentInputI: import("../contracts/files-core").FileSaveConflict,
      ): void {
        if (documentOptions.onConflict) {
          documentOptions.onConflict(documentInputI);
        } else {
          documentOptions.onNotice?.(
            uiMessage("design-system.document.someoneElseChanged") +
              documentInputI.path.slice(documentInputI.path.lastIndexOf("/") + 1) +
              " while you were editing it. Your version was not saved over theirs.",
          );
        }
      },
      onState(
        documentInputJ: import("../contracts/files-core").FileSaveQueueState,
      ): void {
        if (
          documentInputJ.lastError === undefined &&
          documentInputJ.dirty === 0 &&
          !documentInputJ.inFlight
        ) {
          lastSyncedAt = timers.now();
          for (let [value, documentValueA] of fileTexts) {
            if (
              !queue.conflicted().has(value) &&
              !queue.withdrawn().has(value) &&
              !queue.unsendable().has(value)
            ) {
              savedFileTexts.set(value, documentValueA);
            }
          }
        }
        lastError =
          documentInputJ.lastError !== undefined
            ? {
                code: documentInputJ.lastError,
                message: documentInputJ.lastError,
              }
            : undefined;
        notifySave();
      },
    }),
    notifyChange = (documentInputK?: boolean): void => {
      for (let value of [...changeSubscribers]) {
        try {
          value(
            documentInputK
              ? {
                  remote: true,
                }
              : undefined,
          );
        } catch {}
      }
    },
    notifySave = (): void => {
      let value = saveState();
      for (let documentValueB of [...saveSubscribers]) {
        try {
          documentValueB(value);
        } catch {}
      }
    },
    notifyLoad = (): void => {
      for (let value of [...loadSubscribers]) {
        try {
          value();
        } catch {}
      }
    },
    bootNarrowed: boolean = false,
    bootFailureCode: string | undefined,
    indexNeedsInitialWrite: boolean = false,
    readOnly = () => !port.canWrite || bootNarrowed;
  function saveState(): import("../contracts/platform-host").SaveState & {
    leftOut?: {
      id: string;
      cause: import("../contracts/files-core").UnsendableCause;
    }[];
  } {
    if (loadState === "loading") {
      return {
        status: "loading",
      };
    }
    if (readOnly()) {
      return {
        status: "readonly",
        ...(documentOptions.readOnlyReason !== undefined
          ? {
              message: documentOptions.readOnlyReason,
            }
          : (bootNarrowed || port.narrowed === true) &&
              port.mayWrite !== false
            ? {
                message: FILE_LIST_UNAVAILABLE_MESSAGE,
              }
            : {}),
      };
    }
    let value = queue.state(),
      documentValueC: boolean = value.unsendableStashed === true;
    if (value.stuck !== undefined) {
      return {
        status: "error",
        message:
          describeStuckSave(value.stuck, timers.now()) +
          (value.unsendable !== undefined
            ? " " +
              formatUnsendableFilesMessage(value.unsendable, {
                restSaved: false,
                stashed: documentValueC,
              })
            : ""),
        code: value.stuck.code,
      };
    }
    if (value.inFlight) {
      return {
        status: "saving",
      };
    }
    if (value.lastError !== undefined && value.backoffUntil === undefined) {
      return {
        status: "error",
        message: value.lastError,
        code: value.lastError,
      };
    }
    if (value.dirty > 0) {
      return {
        status: "dirty",
      };
    }
    if (value.unsendable !== undefined) {
      return {
        status: "error",
        message: formatUnsendableFilesMessage(value.unsendable, {
          stashed: documentValueC,
        }),
        code: "invalid_content",
        leftOut: value.unsendable.map(
          (documentInputL: {
            path: string;
            cause: import("../contracts/files-core").UnsendableCause;
          }) => ({
            id: documentInputL.path,
            cause: documentInputL.cause,
          }),
        ),
      };
    }
    return {
      status: "ready",
    };
  }
  function composeState(documentInputM: boolean): void {
    let value = codec.compose(indexStore.get(), fileTexts);
    state = {
      title: parseTitle(value.title, state.title),
      content: parseContent(value.content, state.content),
      comments: state.comments,
    };
    composedPaths.clear();
    try {
      for (let documentValueD of codec.filesOf(state).keys()) {
        composedPaths.add(documentValueD);
      }
    } catch {}
    notifyChange(documentInputM);
  }
  function queueContentChanges(): void {
    let value = codec.filesOf(state);
    for (let [documentStateA, documentResultA] of value) {
      knownOwnedPaths.add(documentStateA);
      composedPaths.add(documentStateA);
      if (fileTexts.get(documentStateA) === documentResultA) {
        continue;
      }
      fileTexts.set(documentStateA, documentResultA);
      queue.markDirty(documentStateA, () => documentResultA, fileBaseShas.get(documentStateA) ?? null);
    }
    for (let documentStateB of [...fileTexts.keys()]) {
      if (
        value.has(documentStateB) ||
        isInternalPath(documentStateB) ||
        !ownsComposedPath(documentStateB)
      ) {
        continue;
      }
      fileTexts.delete(documentStateB);
      queue.markDirty(
        documentStateB,
        (): null => null,
        fileBaseShas.get(documentStateB) ?? null,
      );
    }
    let documentValueE = codec.indexOf(state, indexStore.get());
    if (
      indexNeedsInitialWrite ||
      !mergeValuesEqual(documentValueE, indexStore.get())
    ) {
      indexNeedsInitialWrite = false;
      indexStore.update((documentInputN) =>
        removeMissingMergeProperties(documentInputN, documentValueE),
      );
    }
  }
  let knownOwnedPaths: Set<string> = new Set(),
    composedPaths: Set<string> = new Set(),
    ownsComposedPath = (documentInputO: string) =>
      knownOwnedPaths.has(documentInputO) && composedPaths.has(documentInputO),
    isInternalPath = (documentInputP: string) =>
      documentInputP === codec.indexPath ||
      (codec.type !== undefined
        ? isReservedProjectFile(codec.type, documentInputP)
        : documentInputP === MIGRATION_MANIFEST_PATH);
  function contentChanged(documentInputQ?: boolean): void {
    if (readOnly() || disposed) {
      return;
    }
    personChanged = true;
    if (!documentInputQ) {
      recordArtifactEdit();
    }
    queueContentChanges();
    notifyChange();
    notifySave();
    if (commitTimer !== undefined) {
      timers.clearTimeout(commitTimer);
    }
    commitTimer = timers.setTimeout((): void => {
      commitTimer = undefined;
      queue.commit();
    }, documentOptions.commitMs ?? 800);
  }
  let stashOffer: CrashStashOffer,
    restoreCount = 0,
    loadRetryTimer: ReturnType<typeof setTimeout> | undefined,
    loadRetryAt = 0,
    loadRetryAttempt = 0,
    loadPromise: Promise<void>,
    bootFailure: { error: unknown; at: number } | undefined;
  function scheduleLoadRetry(documentInputR: number, documentOptionsD: boolean = false): void {
    if (disposed) {
      return;
    }
    if (loadRetryTimer !== undefined) {
      if (!documentOptionsD || timers.now() + documentInputR >= loadRetryAt) {
        return;
      }
      timers.clearTimeout(loadRetryTimer);
    }
    loadRetryAt = timers.now() + documentInputR;
    loadRetryTimer = timers.setTimeout((): void => {
      loadRetryTimer = undefined;
      retryLoad(false);
    }, documentInputR);
  }
  function retryLoad(documentInputS: boolean): void {
    if (loadState !== "failed" || disposed) {
      return;
    }
    if (loadRetryTimer !== undefined) {
      timers.clearTimeout(loadRetryTimer);
      loadRetryTimer = undefined;
    }
    loadState = "loading";
    notifyLoad();
    loadPromise = loadFiles(documentInputS);
  }
  let resolveWhenLive: () => void,
    whenLive: Promise<void> = new Promise<void>((documentInputT): void => {
      resolveWhenLive = documentInputT;
    });
  async function loadFiles(documentInputU: boolean = false): Promise<void> {
    let value = timers.now();
    try {
      bootNarrowed = false;
      bootFailureCode = undefined;
      let documentValueF = await readFilesBootState({
        port: port,
        indexPath: codec.indexPath,
        wants: wantsFile,
        timers: timers,
        mayWrite: port.mayWrite ?? port.canWrite,
        ...(documentOptions.early !== undefined
          ? {
              early: documentOptions.early,
            }
          : {}),
      });
      bootNarrowed = documentValueF.narrowed === true;
      indexStore.loadText(documentValueF.index.text, documentValueF.index.sha256);
      for (let [documentStateC, documentResultB] of documentValueF.files) {
        fileTexts.set(documentStateC, documentResultB.text);
        savedFileTexts.set(documentStateC, documentResultB.text);
        fileBaseShas.set(documentStateC, documentResultB.sha256);
        knownOwnedPaths.add(documentStateC);
      }
      loadState = "live";
      lastSyncedAt = timers.now();
      loadRetryAttempt = 0;
      bootFailure = undefined;
      composeState(false);
      resolveWhenLive();
      if (documentOptions.saveStash !== undefined && !readOnly()) {
        let values = new Set(
          documentValueF.listing.map((documentInputV: Files.FileListingRow) => documentInputV.path),
        );
        stashOffer = await applyCrashStashEdits(
          documentOptions.saveStash,
          (documentInputW) =>
            documentInputW === codec.indexPath
              ? indexStore.serialize()
              : (documentValueF.files.get(documentInputW)?.text ??
                (values.has(documentInputW) ? undefined : null)),
        );
      }
    } catch (documentValueG: unknown) {
      if (
        documentOptions.startWhenNoIndex !== undefined &&
        documentValueG instanceof BootReadError &&
        (documentValueG as Error & { code: string; narrowed?: boolean }).code ===
          "no_index" &&
        (documentValueG as Error & { code: string; narrowed?: boolean }).narrowed ===
          false
      ) {
        indexStore.init(documentOptions.startWhenNoIndex());
        queue.withdraw(codec.indexPath);
        indexNeedsInitialWrite = true;
        loadState = "live";
        lastSyncedAt = timers.now();
        loadRetryAttempt = 0;
        bootFailure = undefined;
        composeState(false);
        resolveWhenLive();
        if (documentOptions.saveStash !== undefined && !readOnly()) {
          stashOffer = await applyCrashStashEdits(
            documentOptions.saveStash,
            (documentInputX) =>
              documentInputX === codec.indexPath ? indexStore.serialize() : null,
          );
        }
        notifyLoad();
        notifySave();
        return;
      }
      if (
        documentValueG instanceof BootReadError &&
        (documentValueG as Error & { code: string; narrowed?: boolean }).code ===
          "access_revoked"
      ) {
        await documentOptions.saveStash?.clearArtifact();
      }
      loadState = "failed";
      bootFailureCode =
        documentValueG instanceof BootReadError
          ? (documentValueG as Error & { code: string; narrowed?: boolean }).code
          : undefined;
      lastError = {
        code: "timeout",
        message:
          documentValueG instanceof Error
            ? documentValueG.message
            : String((documentValueG as FileRetryError | null)?.message ?? documentValueG),
      };
      bootFailure = {
        error: documentValueG,
        at: value,
      };
      let documentStateD = getBootstrapRetryDelay(
        documentValueG,
        loadRetryAttempt,
      );
      if (documentStateD !== undefined) {
        if (!documentInputU) {
          loadRetryAttempt += 1;
        }
        scheduleLoadRetry(documentStateD);
      }
    }
    notifyLoad();
    notifySave();
  }
  function restoreStashEdits(documentInputY: NonNullable<CrashStashOffer>): void {
    for (let documentValueH of documentInputY.edits) {
      if (
        isInternalPath(documentValueH.path) ||
        !documentValueH.path.startsWith(PROJECT_FILE_PREFIX)
      ) {
        continue;
      }
      let text = documentValueH.text;
      if (text === null) {
        fileTexts.delete(documentValueH.path);
      } else {
        fileTexts.set(documentValueH.path, text);
        knownOwnedPaths.add(documentValueH.path);
      }
      if (documentValueH.base === null) {
        fileBaseShas.delete(documentValueH.path);
      } else {
        fileBaseShas.set(documentValueH.path, documentValueH.base);
      }
      queue.markDirty(documentValueH.path, () => text, documentValueH.base);
    }
    let value = documentInputY.edits.find(
      (documentInputZ): boolean => documentInputZ.path === codec.indexPath,
    );
    if (value !== undefined && value.text !== null) {
      let documentValueI: Index | undefined;
      try {
        documentValueI = indexStore.parse(value.text);
      } catch {
        documentValueI = undefined;
      }
      if (documentValueI !== undefined) {
        let documentStateE = mergeDocumentValues(
          codec.emptyIndex(),
          documentValueI,
          indexStore.get(),
          codec.schema,
          {
            externalMembers: (memberName) =>
              codec.externalMembers?.(memberName, fileTexts),
          },
        );
        if (!mergeValuesEqual(documentStateE, indexStore.get())) {
          indexStore.update((indexState) =>
            removeMissingMergeProperties(indexState, documentStateE),
          );
        }
      }
    }
    queue.stashRestored();
    personChanged = true;
    composeState(false);
    notifySave();
    if (commitTimer !== undefined) {
      timers.clearTimeout(commitTimer);
    }
    commitTimer = timers.setTimeout((): void => {
      commitTimer = undefined;
      queue.commit();
    }, documentOptions.commitMs ?? 800);
  }
  async function applyRemote(
    remoteChange: Files.FileRemoteChange,
    documentOptionsE?: Map<string, Files.FileBytesRead>,
  ): Promise<void> {
    if (loadState === "failed") {
      let documentValueJ =
        bootFailure === undefined
          ? 0
          : filesBootRetryDelayForHotUpdate(
              bootFailure.error,
              remoteChange,
              codec.indexPath,
              timers.now() - bootFailure.at,
            );
      if (documentValueJ === 0) {
        retryLoad(false);
      } else if (documentValueJ !== undefined) {
        scheduleLoadRetry(documentValueJ, true);
      }
    }
    for (let documentValueK = loadPromise; ; documentValueK = loadPromise) {
      if ((await documentValueK, documentValueK === loadPromise)) {
        break;
      }
    }
    if (loadState !== "live") {
      return;
    }
    if (port.narrowed === true && port.mayWrite !== true) {
      bootNarrowed = true;
    }
    let flag: boolean = false,
      items: FilesRemoteAppliedRow[] = [],
      callback = (
        changedFile: Files.ChangedFileRow,
        documentOptionsF: FilesRemoteAppliedRow["decision"],
      ): void => {
        items.push({
          path: changedFile.path,
          sha256: changedFile.sha256,
          decision: documentOptionsF,
        });
      },
      value = filesPortExtensions(port),
      documentHandler = (documentInput_: string) => {
        let documentValueL = value.heldSha?.(documentInput_);
        return (
          value.wroteSinceAdopt?.(documentInput_) === true &&
          typeof documentValueL === "string" &&
          queue.isOwnEcho({
            path: documentInput_,
            sha256: documentValueL,
          })
        );
      };
    for (let documentValueM of remoteChange.changed) {
      if (documentValueM.path === codec.indexPath) {
        flag = documentValueM.sha256 !== null;
        callback(documentValueM, "index");
        continue;
      }
      if (documentValueM.sha256 === null) {
        if (value.wroteSinceAdopt?.(documentValueM.path) === true) {
          callback(documentValueM, "ignored");
          continue;
        }
        if (fileChangedHere(documentValueM.path)) {
          heldRemotePaths.add(documentValueM.path);
          callback(documentValueM, "held");
          continue;
        }
        if (fileTexts.delete(documentValueM.path)) {
          fileBaseShas.delete(documentValueM.path);
          savedFileTexts.delete(documentValueM.path);
          knownOwnedPaths.delete(documentValueM.path);
          callback(documentValueM, "removed");
        } else {
          callback(documentValueM, "ignored");
        }
        continue;
      }
      if (
        !fileTexts.has(documentValueM.path) &&
        !wantsFile({
          path: documentValueM.path,
          sha256: documentValueM.sha256,
          size: 0,
          contentType: documentOptionsE?.get(documentValueM.path)?.contentType ?? "text/html",
        })
      ) {
        callback(documentValueM, "ignored");
        continue;
      }
      if (documentHandler(documentValueM.path)) {
        callback(documentValueM, "ignored");
        continue;
      }
      if (
        documentOptions.holdRemote?.(documentValueM.path) === true ||
        fileChangedHere(documentValueM.path)
      ) {
        heldRemotePaths.add(documentValueM.path);
        callback(documentValueM, "held");
        continue;
      }
      let documentStateF = await retryFileRead(
        () => port.readText(documentValueM.path),
        timers,
      );
      fileTexts.set(documentValueM.path, documentStateF.text);
      savedFileTexts.set(documentValueM.path, documentStateF.text);
      fileBaseShas.set(documentValueM.path, documentStateF.sha256);
      knownOwnedPaths.add(documentValueM.path);
      callback(documentValueM, "theirs");
    }
    if (flag) {
      await retryFileRead(
        () => reloadAndMergeIndex(false),
        timers,
      );
    }
    composeState(true);
    if (items.length > 0) {
      try {
        documentOptions.onRemoteApplied?.(items, remoteChange);
      } catch {}
    }
  }
  loadPromise = loadFiles();
  let firstLoad = loadPromise,
    hotController = createFilesHotUpdateController({
      port: port,
      hot: documentOptions.hot,
      embedded: documentOptions.embedded,
      isBusy: documentOptions.isBusy,
      snapshot: documentOptions.snapshot,
      restore: documentOptions.restore,
      timers: timers,
      applyRemote: applyRemote,
      ...(documentOptions.early !== undefined
        ? {
            early: documentOptions.early,
          }
        : {}),
      ...(documentOptions.onHotEvent !== undefined
        ? {
            onEvent: documentOptions.onHotEvent,
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
    }),
    unsubscribeRemote = hotController.active
      ? (): void => {
          return;
        }
      : port.onRemoteChange(
          (change) =>
            void applyRemote(change).catch((): void => {
              return;
            }),
        ),
    documentValueN: FilesDocument<Index, Content> = {
      saveMode: (): "auto" => "auto",
      state: () => state,
      content: () => state.content,
      title: () => state.title,
      setTitle(documentInputa: string): void {
        let value = normalizeTitleInput(documentInputa);
        if (value === state.title) {
          return;
        }
        state = {
          ...state,
          title: value,
        };
        contentChanged();
      },
      setContent(documentInputb: Content): void {
        state = {
          ...state,
          content: documentInputb,
        };
        contentChanged();
      },
      updateContent(
        documentInputc: (content: Content) => Content,
        documentOptionsG?: { auto?: boolean },
      ): void {
        state = {
          ...state,
          content: documentInputc(state.content),
        };
        contentChanged(documentOptionsG?.auto);
      },
      comments: () => state.comments,
      addComment(documentInputd) {
        let documentValueO = {
          ...documentInputd,
          id: "c" + String(timers.now()) + String(state.comments.length),
          at: timers.now(),
        };
        state = {
          ...state,
          comments: [
            ...state.comments,
            documentValueO as import("../contracts/platform-host").ArtifactComment,
          ],
        };
        notifyChange();
        return documentValueO as import("../contracts/platform-host").ArtifactComment;
      },
      removeComment(documentInpute): void {
        state = {
          ...state,
          comments: state.comments.filter(
            (documentInputf): boolean => documentInputf.id !== documentInpute,
          ),
        };
        notifyChange();
      },
      commentSync: () => ({
        status: "idle",
        pending: 0,
      }),
      pendingCommentIds: () => new Set(),
      retryCommentPublish: (): void => {
        return;
      },
      dirty: () => queue.pending(),
      readOnly: readOnly,
      saveState: saveState,
      documentBytes: () => {
        let length = indexStore.serialize().length;
        for (let value of fileTexts.values()) {
          length += value.length;
        }
        return length;
      },
      async save(): Promise<void> {
        if (loadState === "failed") {
          documentValueN.retryLoad();
          return;
        }
        documentValueN.flushNow();
        await queue.settle();
      },
      stashOffer: () =>
        stashOffer === undefined
          ? undefined
          : {
              at: stashOffer.at,
            },
      restoreStash() {
        let value = stashOffer;
        if (value === undefined || readOnly()) {
          return;
        }
        stashOffer = undefined;
        let documentValueP = state;
        restoreStashEdits(value);
        restoreCount += 1;
        notifyChange();
        return {
          get label() { return uiMessage("design-system.document.restoreUnsavedEdits"); },
          do: (): void => {
            restoreStashEdits(value);
            notifyChange();
          },
          undo: (): void => {
            state = documentValueP;
            contentChanged();
          },
        };
      },
      discardStash(): void {
        stashOffer = undefined;
        documentOptions.saveStash?.clearOffered();
      },
      restoreCount: () => restoreCount,
      subscribe(documentInputg) {
        changeSubscribers.add(documentInputg);
        return () => void changeSubscribers.delete(documentInputg);
      },
      subscribeSave(documentInputh) {
        saveSubscribers.add(documentInputh);
        return () => void saveSubscribers.delete(documentInputh);
      },
      loadState: () => loadState,
      shown: (): boolean => loadState === "live",
      cachedSettled: (): boolean => false,
      subscribeLoad(documentInputi) {
        loadSubscribers.add(documentInputi);
        return () => void loadSubscribers.delete(documentInputi);
      },
      flushNow(): void {
        if (commitTimer !== undefined) {
          timers.clearTimeout(commitTimer);
          commitTimer = undefined;
        }
        queue.flushNow();
      },
      retryLoad(): void {
        retryLoad(true);
      },
      bootFailure: () =>
        loadState === "failed" ? bootFailureCode : undefined,
      storeUntouched: () =>
        loadState === "live" && !personChanged && fileTexts.size === 0,
      releaseHold(documentInputj): void {
        if (!heldRemotePaths.delete(documentInputj) && !fileChangedHere(documentInputj)) {
          return;
        }
        if (queue.unsendable().has(documentInputj)) {
          queue.withdraw(documentInputj);
        }
        if (
          filesPortExtensions(port).liveSha?.(documentInputj) === null
        ) {
          if (queue.conflicted().has(documentInputj)) {
            return;
          }
          if (fileTexts.delete(documentInputj)) {
            fileBaseShas.delete(documentInputj);
            savedFileTexts.delete(documentInputj);
            knownOwnedPaths.delete(documentInputj);
            composeState(true);
          }
          return;
        }
        retryFileRead(() => port.readText(documentInputj), timers).then(
          (documentInputk): void => {
            if (queue.conflicted().has(documentInputj)) {
              return;
            }
            fileTexts.set(documentInputj, documentInputk.text);
            savedFileTexts.set(documentInputj, documentInputk.text);
            fileBaseShas.set(documentInputj, documentInputk.sha256);
            knownOwnedPaths.add(documentInputj);
            composeState(true);
          },
          (): void => {
            return;
          },
        );
      },
      syncDetail: () => ({
        pending: queue.state().dirty,
        inflight: queue.state().inFlight ? codec.indexPath : null,
        flights: queue.state().inFlight ? 1 : 0,
        ...(lastSyncedAt !== undefined
          ? {
              lastSyncedAt: lastSyncedAt,
            }
          : {}),
        ...(lastError !== undefined
          ? {
              lastError: lastError,
            }
          : {}),
      }),
      dispose(): void {
        disposed = true;
        if (commitTimer !== undefined) {
          timers.clearTimeout(commitTimer);
        }
        if (loadRetryTimer !== undefined) {
          timers.clearTimeout(loadRetryTimer);
        }
        hotController.dispose();
        unsubscribeRemote();
        queue.dispose();
      },
      queue: () => queue,
      hot: () => hotController,
      index: () => indexStore,
      whenLoaded: () => firstLoad,
      whenLive: () => whenLive,
      held: () => heldRemotePaths,
      retrySave: () => queue.retryNow(),
      applyRemote: (documentInputl) => applyRemote(documentInputl),
    };
  return documentValueN;
}
export {
  createFilesDocument,
};
export function installFilesDocument(): () => void {
  return () => {};
}
