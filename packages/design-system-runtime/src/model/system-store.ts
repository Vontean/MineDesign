import type * as Application from "../contracts/application";
import type * as Storage from "../contracts/model-storage";
import type * as Model from "../contracts";
import type * as Host from "../contracts/platform-host";
/** Restored application module; prepare first, initialize in original order. */
import { getAutoSavingArtifactRuntime } from "../documents/artifact-document";
import { withAutomaticSave } from "../documents/autosave";
import { getSelfPublishCapability, selfPublishAvailable } from "../documents/self-publish";
import { createArtifactDocument } from "../documents/storage";
import { unavailableStorageSlot } from "../documents/write-access";
import { getCurrentUserName } from "../host/user-api";
import { finalizeContentChange, refreshManifest, removeMissingStorageDigests, setLastChange } from "./asset-commands";
import { missingStoredBlobIds } from "./asset-store";
import { EMPTY_DESIGN_SYSTEM_CONTENT, isMigrationExemptHost } from "./boot";
import { parsedDesignSystem, parseDesignSystemContent } from "./derive-system";
import { setProtectedFilePathPredicate } from "./file-commands";
import { constantReadOnlyReasonSlot, DESIGN_SYSTEM_ENVELOPE_PATH, DESIGN_SYSTEM_PATHS, EMPTY_EMBEDDED_PAGE_PARTS, isExpensiveHeldImagePath, isHeldFilePointer } from "./file-policy";
import { parseManifest, setUnboundedFileParsing } from "./file-table";
import { lastChangeFromManifest } from "./last-change";
import { chunkPublishChanges, obsoleteMirrorDeletions } from "./migration-markers";
import { createPageMirrorPublisher, createSystemFilesPublisher, reportPublisherOutcome, saveHealthOutcome } from "./publish";
import { hasPendingRemoteTextUploads, hasUnhydratedRemoteText, remoteTextEntry, setRemoteTextHydrator, setRemoteTextUploadedCallback } from "./remote-text";
import { getStoredSystemStatus, requestStoredDerivedRegeneration, stampLocalSystemLastChange } from "./system-sync";
import { artifactHealth } from "../telemetry/health";

var DERIVED_REFRESH_DELAY_MS: number;
var autosaveInstaller:
  | ((document: Storage.SystemDocument, hold: () => boolean) => void)
  | undefined;
var documentBootOptions: Partial<
  Host.DocumentOptions<Model.DesignSystemContent>
>;
var instanceUsesFilesPublisher: boolean;
var storedSystemDocumentFactory:
  | ((
      parser: Host.ArtifactParser<Model.DesignSystemContent>,
    ) => Storage.SyncedSystemDocument)
  | undefined;
var fileSystemDocumentFactory:
  | ((
      parser: Host.ArtifactParser<Model.DesignSystemContent>,
    ) => Storage.SystemDocument)
  | undefined;
var legacyCleanupGate:
  | (() => Promise<boolean | "later" | null | undefined>)
  | undefined;
var DesignSystemStore: new (
  document?: Storage.SystemDocument,
  options?: Storage.StoreOptions,
) => Storage.DesignSystemStore;
var commandCapableDocument: (
  document: Storage.SystemDocument,
) => Storage.CommandDocument | null;
function refreshNonemptyManifest(
  content: Model.DesignSystemContent,
  title: string,
): Model.DesignSystemContent {
  if (Object.keys(content.files).length === 0) {
    return content;
  }
  return refreshManifest(content, title);
}
async function isLegacyEnvelopeCurrent(
  convertedAt?: string,
  fetchJson: typeof fetch | undefined = typeof fetch === "function" &&
  typeof location !== "undefined"
    ? fetch
    : undefined,
): Promise<null | boolean | undefined> {
  try {
    if (convertedAt === undefined || fetchJson === undefined) {
      return null;
    }
    let value = await fetchJson(DESIGN_SYSTEM_ENVELOPE_PATH, {
      credentials: "same-origin",
      cache: "no-cache",
    });
    if (!value.ok) {
      if (value.status === 404) {
        return false;
      } else {
        return null;
      }
    }
    let manifestText: unknown = (
      (await value.json()) as
        | { content?: { files?: Record<string, unknown> } }
        | null
        | undefined
    )?.content?.files?.[DESIGN_SYSTEM_PATHS.manifest];
    if (
      typeof manifestText !== "string" ||
      Object.keys(parseManifest(manifestText)).length === 0
    ) {
      return null;
    }
    let lastChangeAt = lastChangeFromManifest(manifestText)?.at;
    if (
      lastChangeAt === undefined ||
      Date.parse(lastChangeAt) <= Date.parse(convertedAt)
    ) {
      return true;
    } else {
      return null;
    }
  } catch {
    return null;
  }
}
function setAutosaveInstaller(
  install?: (document: Storage.SystemDocument, hold: () => boolean) => void,
): void {
  autosaveInstaller = install;
}
function setDocumentBootOptions(
  bootOptions: Partial<Host.DocumentOptions<Model.DesignSystemContent>>,
  flags: { instance?: boolean } = {},
): void {
  documentBootOptions = bootOptions;
  instanceUsesFilesPublisher = flags.instance === true;
}
function setFileSystemDocumentFactory(
  factory: (
    parser: Host.ArtifactParser<Model.DesignSystemContent>,
  ) => Storage.SystemDocument,
): void {
  fileSystemDocumentFactory = factory;
}
function documentOptionsForBootMode(
  boot: Storage.SystemBootMode,
  readonlyReason?: string,
): Storage.DocumentBootConfiguration {
  let mode: Storage.SystemBootMode =
    readonlyReason !== undefined
      ? {
          mode: "readonly",
          state: boot.state,
          reason: readonlyReason,
        }
      : boot;
  if (mode.mode === "instance") {
    return {
      boot: mode,
      opts: {
        embeddedState: mode.state,
        pageParts: EMPTY_EMBEDDED_PAGE_PARTS,
      },
      instance: true,
    };
  }
  return {
    boot: mode,
    opts: {
      embeddedState: mode.state,
      pageParts: EMPTY_EMBEDDED_PAGE_PARTS,
      roFlag: constantReadOnlyReasonSlot(mode.reason),
      stash: unavailableStorageSlot,
      canPublish: true,
    },
    instance: false,
  };
}
function hasConfiguredDocumentFactory(): boolean {
  return (
    storedSystemDocumentFactory !== undefined ||
    fileSystemDocumentFactory !== undefined ||
    Object.keys(documentBootOptions).length > 0
  );
}
function changedHeldFilePaths(
  beforeFiles: Model.FileTable,
  afterFiles: Model.FileTable,
  isGone: (path: string) => boolean,
): string[] {
  if (beforeFiles === afterFiles) {
    return [];
  }
  let changed = [];
  for (let value of Object.keys(beforeFiles)) {
    let oldPointer = beforeFiles[value];
    if (
      isHeldFilePointer(value, oldPointer) &&
      afterFiles[value] !== oldPointer &&
      !isGone(value)
    ) {
      changed.push(value);
    }
  }
  return changed.sort();
}
function introducedHeldFilePaths(
  beforeFiles: Model.FileTable,
  afterFiles: Model.FileTable,
): string[] {
  if (beforeFiles === afterFiles) {
    return [];
  }
  let introduced = [];
  for (let value of Object.keys(afterFiles)) {
    let newPointer = afterFiles[value];
    if (
      isHeldFilePointer(value, newPointer) &&
      beforeFiles[value] !== newPointer
    ) {
      introduced.push(value);
    }
  }
  return introduced.sort();
}
function createDesignSystemCommands(
  document: Storage.SystemDocument,
  undoStack: Application.FileEditHistory,
  sharedUndoStack?: Application.FileEditHistory,
  commandOptions: { readGivesUpMs?: number } = {},
): Storage.SystemCommands {
  let commands = commandCapableDocument(document);
  if (commands !== null && sharedUndoStack !== undefined) {
    commands.bindUndoStack?.(sharedUndoStack);
  }
  let refresh = (content: Model.DesignSystemContent) =>
      refreshManifest(content, document.title()),
    coalescedStep: Storage.CoalescedEdit | null = null,
    seal = (): void => {
      if (coalescedStep !== null) {
        let value = coalescedStep;
        coalescedStep = null;
        let content = document.content();
        if (content === value.latest) {
          let refreshedContent = refresh(content);
          if (refreshedContent !== content) {
            value.latest = refreshedContent;
            document.setContent(refreshedContent);
          }
        }
      }
    },
    preparedBytes = new Map<string, Storage.PreparedHeldBytes>(),
    preparing: boolean = false,
    notUndoable: string[] = [],
    basename = (path: string) => path.slice(path.lastIndexOf("/") + 1),
    isGone = (path: string): boolean => commands?.heldGone?.(path) === true,
    preparedStillValid = (path: string): boolean => {
      let entry = preparedBytes.get(path);
      if (entry === undefined) {
        return false;
      }
      if (
        !isHeldFilePointer(
          path,
          document.content().files[path] ?? "",
        ) ||
        commands?.heldStillGood?.(path, entry.witness) !== "good"
      ) {
        preparedBytes.delete(path);
        return false;
      }
      return true;
    },
    bytesNeeded = (
      content: Model.DesignSystemContent,
      mutate: Storage.ContentMutation,
    ) => {
      if (
        commands?.heldBytes === undefined ||
        !Object.values(content.files).includes("file:")
      ) {
        return [];
      }
      let value = mutate(content);
      if (value === content) {
        return [];
      } else {
        return changedHeldFilePaths(
          content.files,
          finalizeContentChange(content, value, document.title())
            .files,
          isGone,
        );
      }
    },
    guardBusy = (): boolean => {
      if (preparing) {
        commands?.tell?.(
          "Still working on your previous change. Try again in a moment.",
        );
      }
      return preparing;
    },
    readTimeoutMs = commandOptions.readGivesUpMs ?? 120000,
    maxImagePaths: number = 64,
    maxImageBytes: number = 67108864;
  return {
    content: () => document.content(),
    seal: seal,
    undo: {
      exec(step: Application.FileEditStep): void {
        seal();
        undoStack.exec(step);
      },
      seed(step: Application.FileEditStep): void {
        seal();
        undoStack.seed(step);
      },
      undo(): void {
        if (guardBusy()) {
          return;
        }
        seal();
        undoStack.undo();
      },
      redo(): void {
        if (guardBusy()) {
          return;
        }
        seal();
        undoStack.redo();
      },
      canUndo: () => undoStack.canUndo(),
      canRedo: () => undoStack.canRedo(),
      redoDepth: () => undoStack.redoDepth(),
      clear(): void {
        seal();
        undoStack.clear();
      },
      subscribe: (listener: () => void) => undoStack.subscribe(listener),
    },
    needs(mutate: Storage.ContentMutation): string[] {
      return bytesNeeded(document.content(), mutate).filter(
        (path): boolean => !preparedStillValid(path),
      );
    },
    busy: (): boolean => preparing,
    lastNotUndoable: () => notUndoable,
    async prepare(
      mutate: Storage.ContentMutation,
    ): Promise<Storage.PreparedEditResult> {
      if (guardBusy()) {
        return {
          ok: false,
          failed: [],
          tooMany: false,
        };
      }
      let requiredPaths = bytesNeeded(document.content(), mutate);
      for (let path of [...preparedBytes.keys()]) {
        if (!requiredPaths.includes(path)) {
          preparedBytes.delete(path);
        }
      }
      let pathsToRead = requiredPaths.filter(
        (path): boolean => !preparedStillValid(path),
      );
      if (pathsToRead.length === 0) {
        return {
          ok: true,
        };
      }
      if (
        pathsToRead.filter(isExpensiveHeldImagePath).length > maxImagePaths
      ) {
        return {
          ok: false,
          failed: pathsToRead,
          tooMany: true,
        };
      }
      preparing = true;
      commands?.setPreparing?.(true);
      try {
        let failedPaths: string[] = [],
          imageBytes = 0,
          deadline = Date.now() + readTimeoutMs;
        for (
          let batchStart = 0;
          batchStart < pathsToRead.length && imageBytes <= maxImageBytes;
          batchStart += 4
        ) {
          if (Date.now() >= deadline) {
            failedPaths.push(...pathsToRead.slice(batchStart));
            break;
          }
          await Promise.all(
            pathsToRead
              .slice(batchStart, batchStart + 4)
              .map(async (path): Promise<void> => {
                let readTimer: ReturnType<typeof setTimeout> | undefined,
                  readResult = await Promise.race([
                    commands?.heldBytes?.(path).catch((): null => null) ??
                      null,
                    new Promise<Storage.PreparedHeldBytes | null>(
                      (resolve): void => {
                        readTimer = setTimeout(
                          () => resolve(null),
                          Math.max(0, deadline - Date.now()),
                        );
                      },
                    ),
                  ]).finally(() => clearTimeout(readTimer));
                if (readResult === null) {
                  failedPaths.push(path);
                } else if (
                  (preparedBytes.set(path, readResult),
                  isExpensiveHeldImagePath(path))
                ) {
                  imageBytes += readResult.value.length;
                }
              }),
          );
        }
        if (imageBytes > maxImageBytes) {
          for (let path of pathsToRead) {
            preparedBytes.delete(path);
          }
          return {
            ok: false,
            failed: pathsToRead,
            tooMany: true,
          };
        }
        if (failedPaths.length === 0) {
          return {
            ok: true,
          };
        } else {
          return {
            ok: false,
            failed: failedPaths.sort(),
            tooMany: false,
          };
        }
      } finally {
        preparing = false;
        commands?.setPreparing?.(false);
      }
    },
    set(editKey: string, mutate: Storage.ContentMutation): boolean {
      if (coalescedStep !== null && coalescedStep.key !== editKey) {
        seal();
      }
      let previousContent = document.content(),
        nextContent = finalizeContentChange(
          previousContent,
          mutate(previousContent),
          document.title(),
        );
      if (nextContent === previousContent) {
        return false;
      }
      if (
        commands?.heldBytes !== undefined &&
        (changedHeldFilePaths(previousContent.files, nextContent.files, isGone).length > 0 ||
          introducedHeldFilePaths(previousContent.files, nextContent.files).length > 0)
      ) {
        return false;
      }
      document.setContent(nextContent);
      let previousStep = coalescedStep?.step,
        changedUncoveredFile =
          previousStep?.leavesAlone !== undefined &&
          [
            ...new Set([
              ...Object.keys(previousContent.files),
              ...Object.keys(nextContent.files),
            ]),
          ].some(
            (path) =>
              previousContent.files[path] !== nextContent.files[path] &&
              previousStep.leavesAlone?.(path) === true,
          );
      if (
        coalescedStep !== null &&
        coalescedStep.key === editKey &&
        coalescedStep.step?.dropped !== true &&
        !changedUncoveredFile
      ) {
        coalescedStep.latest = nextContent;
        coalescedStep.step?.touch();
      } else {
        let state: Storage.CoalescedEdit = {
          key: editKey,
          base: previousContent,
          latest: nextContent,
        };
        coalescedStep = state;
        if (commands !== null) {
          let step = commands.stepCommand(
            editKey,
            () => ({
              before: state.base,
              after: state.latest,
            }),
            {
              applied: true,
            },
          );
          state.step = step;
          undoStack.seed(step);
        } else {
          undoStack.seed({
            label: editKey,
            do: () => document.setContent(state.latest),
            undo: () => document.setContent(state.base),
          });
        }
      }
      return true;
    },
    exec(
      label: string,
      mutate: Storage.ContentMutation,
      editOptions?: { withoutBytes?: string[] },
    ): boolean {
      notUndoable = [];
      if (guardBusy()) {
        return false;
      }
      seal();
      let currentContent = document.content(),
        mutatedContent = mutate(currentContent);
      if (mutatedContent === currentContent) {
        return false;
      }
      let before = currentContent,
        after = finalizeContentChange(
          currentContent,
          mutatedContent,
          document.title(),
        ),
        changedHeldPaths =
          commands?.heldBytes !== undefined
            ? changedHeldFilePaths(currentContent.files, after.files, isGone)
            : [],
        nonUndoablePaths = [],
        usesCarriedBytes: boolean = false;
      if (changedHeldPaths.length > 0) {
        let state: Record<string, string> = {};
        for (let heldPath of changedHeldPaths) {
          if (preparedStillValid(heldPath)) {
            state[heldPath] = preparedBytes.get(heldPath)!.value;
          } else if (
            editOptions?.withoutBytes?.includes(heldPath) === true &&
            !Object.hasOwn(after.files, heldPath)
          ) {
            nonUndoablePaths.push(heldPath);
          } else {
            commands?.tell?.(
              basename(heldPath) +
                " was updated while the page was getting it ready, so nothing was changed. Try again.",
            );
            for (let path of changedHeldPaths) {
              preparedBytes.delete(path);
            }
            return false;
          }
        }
        if (Object.keys(state).length > 0) {
          usesCarriedBytes = true;
          before = finalizeContentChange(
            currentContent,
            {
              ...currentContent,
              files: Object.freeze({
                ...currentContent.files,
                ...state,
              }),
            },
            document.title(),
          );
          let mutationWithBytes = mutate(before);
          if (mutationWithBytes === before) {
            for (let path of changedHeldPaths) {
              preparedBytes.delete(path);
            }
            return false;
          }
          after = finalizeContentChange(
            before,
            mutationWithBytes,
            document.title(),
          );
          if (
            changedHeldFilePaths(before.files, after.files, isGone).some(
              (path): boolean => !nonUndoablePaths.includes(path),
            )
          ) {
            for (let path of changedHeldPaths) {
              preparedBytes.delete(path);
            }
            return false;
          }
          for (let [path, fileBytes] of Object.entries(state)) {
            if (
              !Object.hasOwn(after.files, path) &&
              commands?.sendProblem?.(path, fileBytes) !== undefined
            ) {
              nonUndoablePaths.push(path);
            }
          }
        }
      }
      let introducedPointers =
        commands?.heldBytes !== undefined
          ? introducedHeldFilePaths(currentContent.files, after.files)
          : [];
      if (introducedPointers.length > 0) {
        let removedPointers = Object.keys(currentContent.files).filter(
            (path) =>
              isHeldFilePointer(path, currentContent.files[path]) &&
              !Object.hasOwn(after.files, path),
          ),
          missingPath = removedPointers.find(isGone) ?? removedPointers[0] ?? introducedPointers[0];
        commands?.tell?.(
          basename(missingPath) +
            " is missing from the published system, so it cannot be renamed or moved. Remove it and add the file again.",
        );
        for (let path of changedHeldPaths) {
          preparedBytes.delete(path);
        }
        return false;
      }
      if (commands?.editProblem?.(before, after) !== undefined) {
        for (let path of changedHeldPaths) {
          preparedBytes.delete(path);
        }
        return false;
      }
      if (commands?.heldBytes !== undefined) {
        for (let path of Object.keys(currentContent.files)) {
          if (
            isHeldFilePointer(path, currentContent.files[path]) &&
            !Object.hasOwn(after.files, path) &&
            isGone(path)
          ) {
            nonUndoablePaths.push(path);
          }
        }
      }
      let changedPaths = Object.keys({
        ...before.files,
        ...after.files,
      }).filter(
        (path) =>
          path !== "manifest.json" &&
          before.files[path] !== after.files[path],
      );
      if (
        commands !== null &&
        changedPaths.length > 0 &&
        changedPaths.every((path) => nonUndoablePaths.includes(path))
      ) {
        document.setContent(after);
        notUndoable = [...new Set(nonUndoablePaths)].sort();
        for (let path of changedHeldPaths) {
          preparedBytes.delete(path);
        }
        return true;
      }
      if (commands !== null) {
        let step = commands.stepCommand(label, () => ({
          before: before,
          after: after,
        }));
        if (nonUndoablePaths.length > 0) {
          step.dropPaths?.(new Set(nonUndoablePaths));
        }
        if (usesCarriedBytes) {
          let runStep = step.do.bind(step),
            undoStep = step.undo.bind(step);
          step.do = (): void => {
            commands.carrying?.();
            runStep();
          };
          step.undo = (): void => {
            commands.carrying?.();
            undoStep();
          };
        }
        undoStack.exec(step);
        notUndoable = [...new Set(nonUndoablePaths)].sort();
      } else {
        undoStack.exec({
          label: label,
          do: () => document.setContent(after),
          undo: () => document.setContent(before),
        });
      }
      for (let path of changedHeldPaths) {
        preparedBytes.delete(path);
      }
      return true;
    },
  };
}
export {
  autosaveInstaller,
  changedHeldFilePaths,
  commandCapableDocument,
  createDesignSystemCommands,
  DERIVED_REFRESH_DELAY_MS,
  DesignSystemStore,
  documentBootOptions,
  documentOptionsForBootMode,
  fileSystemDocumentFactory,
  hasConfiguredDocumentFactory,
  instanceUsesFilesPublisher,
  introducedHeldFilePaths,
  isLegacyEnvelopeCurrent,
  legacyCleanupGate,
  refreshNonemptyManifest,
  setAutosaveInstaller,
  setDocumentBootOptions,
  setFileSystemDocumentFactory,
  storedSystemDocumentFactory,
};
export function installModelSystemStore(): () => void {
  return () => {
    DERIVED_REFRESH_DELAY_MS = 4000;
    documentBootOptions = {};
    instanceUsesFilesPublisher = false;
    DesignSystemStore = class DesignSystemStore {
      doc!: Storage.SystemDocument;
      bootReport: Model.ParseReport = {
        dropped: [],
        warnings: [],
      };
      listeners = new Set<() => void>();
      snapshot!: Model.ParsedDesignSystem & { title: string };
      note = "";
      noteFor: Storage.AnnouncedNote | null = null;
      by: Promise<string>;
      holdAutosave = false;
      beforeSave: (() => Promise<unknown>) | null = null;
      constructor(
        providedDocument?: Storage.SystemDocument,
        storeOptions?: Storage.StoreOptions,
      ) {
        let parserOptions = {
          parseContent: (rawContent: unknown) =>
            parseDesignSystemContent(
              rawContent,
              this.bootReport,
              storedSystemDocumentFactory !== undefined &&
                providedDocument === undefined
                ? {
                    unbounded: true,
                  }
                : undefined,
            ),
          initialContent: parseDesignSystemContent(
            EMPTY_DESIGN_SYSTEM_CONTENT,
          ),
          defaultTitle:
            (typeof document !== "undefined" && document.title) ||
            "Design System",
        };
        if (
          providedDocument === undefined &&
          storedSystemDocumentFactory !== undefined
        ) {
          setUnboundedFileParsing(true);
          setProtectedFilePathPredicate(
            (path: string): boolean =>
              remoteTextEntry(path) !== undefined,
          );
        }
        if (
          providedDocument === undefined &&
          storedSystemDocumentFactory === undefined &&
          fileSystemDocumentFactory !== undefined
        ) {
          setUnboundedFileParsing(true);
        }
        let fileSystemDocument =
            providedDocument === undefined &&
            storedSystemDocumentFactory === undefined
              ? fileSystemDocumentFactory?.({
                  ...parserOptions,
                  parseContent: (rawContent: unknown) =>
                    parseDesignSystemContent(
                      rawContent,
                      this.bootReport,
                      {
                        unbounded: true,
                      },
                    ),
                })
              : undefined,
          storedDocument =
            providedDocument === undefined
              ? storedSystemDocumentFactory?.(parserOptions)
              : undefined,
          baseDocument =
            providedDocument ??
            fileSystemDocument ??
            storedDocument ??
            createArtifactDocument({
              parseContent: (rawContent: unknown) =>
                parseDesignSystemContent(rawContent, this.bootReport),
              initialContent: parseDesignSystemContent(
                EMPTY_DESIGN_SYSTEM_CONTENT,
              ),
              defaultTitle:
                (typeof document !== "undefined" && document.title) ||
                "Design System",
              ...(getAutoSavingArtifactRuntime() === undefined &&
              selfPublishAvailable()
                ? {
                    publish: reportPublisherOutcome(
                      instanceUsesFilesPublisher
                        ? createSystemFilesPublisher({
                            onStale: (message: string) =>
                              console.warn("[design-system] " + message),
                          })
                        : createPageMirrorPublisher({
                            onStale: (message: string) =>
                              console.warn(
                                "[design-system] saved the page alone; the files mirrored beside it were NOT updated (" +
                                  message +
                                  ") — the next save from a view that can, or a make.ts build, refreshes what agents read",
                              ),
                          }),
                      (reason: string): void => {
                        this.publishEnd = reason;
                      },
                    ),
                    publishWrapsFrame: true,
                    publishesPage: !instanceUsesFilesPublisher,
                  }
                : instanceUsesFilesPublisher
                  ? {
                      canPublish: false,
                    }
                  : {}),
              ...documentBootOptions,
            });
        this.by =
          storeOptions?.by !== undefined
            ? Promise.resolve(storeOptions.by)
            : getCurrentUserName().then(
                (author) => author ?? "someone",
              );
        this.by.then((author: string) => (this.byName = author));
        let now = storeOptions?.now ?? (() => new Date().toISOString());
        this.stampNow = now;
        this.synced = storedDocument !== undefined;
        if (storeOptions?.legacyServed !== undefined) {
          this.legacyProbe = storeOptions.legacyServed;
        }
        if (fileSystemDocument !== undefined) {
          this.doc = fileSystemDocument;
          this.snapshot = this.buildSnapshot();
          this.lastTitle = this.doc.title();
          this.doc.subscribe(() => this.bump());
          return;
        }
        if (storedDocument !== undefined) {
          setRemoteTextHydrator({
            hydrate: (path: string, text: string, onlyIfMissing?: boolean) =>
              this.update(
                (content) =>
                  onlyIfMissing === true && Object.hasOwn(content.files, path)
                    ? content
                    : {
                        ...content,
                        files: Object.freeze({
                          ...content.files,
                          [path]: text,
                        }),
                      },
                {
                  auto: true,
                },
              ),
          });
          setRemoteTextUploadedCallback(() =>
            this.doc.updateContent(
              (content) => ({
                ...content,
                files: Object.freeze({
                  ...content.files,
                }),
              }),
              {
                auto: true,
              },
            ),
          );
          this.doc = storedDocument;
          this.snapshot = this.buildSnapshot();
          this.lastTitle = this.doc.title();
          this.doc.subscribe(() => this.bump());
          this.doc.subscribeSave((state) => this.scheduleDerived(state.status));
          this.doc.subscribe(() => void this.publishOwed(now));
          return;
        }
        queueMicrotask((): void => {
          try {
            autosaveInstaller?.(this.doc, () => this.holdAutosave);
          } catch {}
        });
        this.doc = withAutomaticSave(
          {
            ...baseDocument,
            save: async (): Promise<void> => {
              let value = await this.by;
              if (
                baseDocument.readOnly() ||
                !baseDocument.dirty() ||
                baseDocument.saveState().status === "saving"
              ) {
                return baseDocument.save();
              }
              if (this.beforeSave !== null) {
                await this.beforeSave().catch((): void => {
                  return;
                });
                if (
                  !baseDocument.dirty() ||
                  baseDocument.saveState().status === "saving"
                ) {
                  return baseDocument.save();
                }
              }
              let saveNote = this.saveNote().trim();
              this.update(
                (content) =>
                  removeMissingStorageDigests(
                    content,
                    missingStoredBlobIds(content.files),
                  ),
                {
                  auto: true,
                },
              );
              this.update(
                (content) =>
                  setLastChange(content, {
                    by: value,
                    via: "page",
                    at: now(),
                    ...(saveNote !== ""
                      ? {
                          note: saveNote,
                        }
                      : {}),
                  }),
                {
                  auto: true,
                },
              );
              this.publishEnd = undefined;
              await baseDocument.save();
              let healthEvent: Storage.HealthEvent | null = saveHealthOutcome(
                baseDocument.saveState().status,
                this.publishEnd,
              );
              if (healthEvent !== null) {
                artifactHealth.report(...healthEvent);
              }
              if (
                baseDocument.saveState().status !== "error" &&
                (saveNote !== "" || this.noteFor === null)
              ) {
                this.setNote("");
              }
            },
          },
          {
            hold: () => this.holdAutosave,
          },
        );
        this.snapshot = this.buildSnapshot();
        this.lastTitle = this.doc.title();
        this.doc.subscribe(() => this.bump());
      }
      lastTitle = "";
      owedRunning = false;
      owedGaveUp = false;
      legacyServed: Promise<boolean | null | undefined> | undefined;
      legacyProbe = isLegacyEnvelopeCurrent;
      synced = false;
      byName = "someone";
      stampNow = () => new Date().toISOString();
      stampBy(): string {
        return this.byName;
      }
      episodeStamped = false;
      async publishOwed(now?: () => string): Promise<void> {
        let status = getStoredSystemStatus(),
          isLive = "loadState" in this.doc && this.doc.loadState() === "live";
        if (
          typeof location !== "undefined" &&
          isMigrationExemptHost(location.hostname)
        ) {
          return;
        }
        if (
          this.owedRunning ||
          this.owedGaveUp ||
          !isLive ||
          !status.loaded ||
          this.doc.readOnly() ||
          hasUnhydratedRemoteText()
        ) {
          return;
        }
        this.legacyServed ??= this.legacyProbe(status.convertedAt);
        if ((await this.legacyServed) !== true) {
          return;
        }
        this.owedRunning = true;
        try {
          let value = await getSelfPublishCapability();
          if (value === null) {
            return;
          }
          if (legacyCleanupGate !== undefined) {
            let canCleanUp = await legacyCleanupGate();
            if (canCleanUp === "later") {
              return;
            }
            if (!canCleanUp) {
              this.owedGaveUp = true;
              return;
            }
            if ((await this.legacyProbe(status.convertedAt)) !== true) {
              this.legacyServed = Promise.resolve(false);
              return;
            }
          }
          for (let batch of chunkPublishChanges(
            obsoleteMirrorDeletions(this.doc.content().files),
          )) {
            await value.publish(batch);
          }
          this.legacyServed = Promise.resolve(false);
        } catch (value: unknown) {
          this.owedGaveUp = true;
          console.warn(
            "[design-system] could not remove this system’s old files after its move to the store; a later open retries: " +
              String(
                (value as { message?: unknown } | null | undefined)?.message ??
                  value,
              ),
          );
        } finally {
          this.owedRunning = false;
        }
      }
      derivedTimer: ReturnType<typeof setTimeout> | undefined;
      sawDirty = false;
      scheduleDerived(status: Host.SaveState["status"]): void {
        if (status === "dirty" || status === "saving") {
          clearTimeout(this.derivedTimer);
          this.derivedTimer = undefined;
          return;
        }
        if (
          !this.sawDirty ||
          this.derivedTimer !== undefined ||
          this.doc.readOnly()
        ) {
          return;
        }
        this.derivedTimer = setTimeout((): void => {
          this.derivedTimer = undefined;
          if (this.doc.readOnly() || this.doc.saveState().status !== "ready") {
            return;
          }
          if (
            hasUnhydratedRemoteText() ||
            hasPendingRemoteTextUploads()
          ) {
            this.scheduleDerived("ready");
            return;
          }
          this.sawDirty = false;
          this.episodeStamped = false;
          requestStoredDerivedRegeneration();
          this.doc.updateContent(
            (content) => ({
              ...content,
              files: Object.freeze({
                ...content.files,
              }),
            }),
            {
              auto: true,
            },
          );
        }, DERIVED_REFRESH_DELAY_MS);
      }
      publishEnd: string | undefined;
      saveNote(): string {
        if (this.noteFor === null || this.noteFor.present) {
          return this.note;
        } else {
          return "";
        }
      }
      setNote(note: string, announcedFiles?: Model.FileTable): void {
        let oldSaveNote = this.saveNote(),
          paths =
            note !== "" && announcedFiles !== undefined
              ? Object.keys(announcedFiles)
              : [],
          files = this.doc.content().files;
        this.noteFor =
          paths.length > 0 && announcedFiles !== undefined
            ? {
                paths: new Set(paths),
                values: new Set(Object.values(announcedFiles)),
                asOf: files,
                present: paths.some((path): boolean => path in files),
              }
            : null;
        this.note = note;
        if (this.saveNote() !== oldSaveNote) {
          for (let value of this.listeners) {
            value();
          }
        }
      }
      followAnnounced(): void {
        let announcement = this.noteFor;
        if (announcement === null) {
          return;
        }
        let files = this.doc.content().files;
        if (files === announcement.asOf) {
          return;
        }
        for (let [value, fileText] of Object.entries(files)) {
          if (announcement.paths.has(value)) {
            announcement.values.add(fileText);
          } else if (
            announcement.values.has(fileText) &&
            !(value in announcement.asOf)
          ) {
            announcement.paths.add(value);
          }
        }
        announcement.asOf = files;
        announcement.present = false;
        for (let value of announcement.paths) {
          if (value in files) {
            announcement.present = true;
          }
        }
      }
      getSnapshot(): Model.ParsedDesignSystem & { title: string } {
        return this.snapshot;
      }
      subscribe(subscriber: () => void): () => void {
        this.listeners.add(subscriber);
        return () => this.listeners.delete(subscriber);
      }
      content(): Model.DesignSystemContent {
        return this.doc.content();
      }
      update(
        mutate: Storage.ContentMutation,
        updateOptions?: { auto?: boolean },
      ): void {
        let before = this.doc.content(),
          after = finalizeContentChange(
            before,
            mutate(before),
            this.doc.title(),
          );
        if (after === before) {
          return;
        }
        if (updateOptions?.auto !== true) {
          this.sawDirty = true;
          if (this.synced && !this.episodeStamped) {
            this.episodeStamped = true;
            stampLocalSystemLastChange({
              by: this.stampBy(),
              via: "page",
              at: this.stampNow(),
            });
          }
        }
        this.doc.updateContent(() => after, updateOptions);
      }
      buildSnapshot(): Model.ParsedDesignSystem & { title: string } {
        let system = parsedDesignSystem(this.doc.content()),
          title = this.doc.title(),
          previousSnapshot = this.snapshot;
        if (
          previousSnapshot !== undefined &&
          previousSnapshot.files === system.files &&
          previousSnapshot.title === title
        ) {
          return previousSnapshot;
        }
        return {
          ...system,
          title: title,
        };
      }
      bump(): void {
        this.followAnnounced();
        let title = this.doc.title();
        if (title !== this.lastTitle) {
          this.lastTitle = title;
          if (!this.doc.readOnly()) {
            let value = this.doc.content(),
              refreshedContent = refreshNonemptyManifest(value, title);
            if (refreshedContent !== value) {
              this.doc.updateContent(() => refreshedContent, {
                auto: true,
              });
              return;
            }
          }
        }
        let snapshot = this.buildSnapshot();
        if (snapshot === this.snapshot) {
          for (let value of this.listeners) {
            value();
          }
          return;
        }
        this.snapshot = snapshot;
        for (let value of this.listeners) {
          value();
        }
      }
    };
    commandCapableDocument = (document: Storage.SystemDocument) =>
      typeof (document as Partial<Storage.CommandDocument>)?.stepCommand ===
      "function"
        ? (document as Storage.CommandDocument)
        : null;
  };
}
