import { uiMessage } from '@minedesign/contracts/ui-messages';
import type * as Storage from "../contracts/model-storage";
import type * as Model from "../contracts";
import type * as Host from "../contracts/platform-host";
/** Restored application module; prepare first, initialize in original order. */
import { getSelfPublishCapability, normalizeSelfPublishError } from "../documents/self-publish";
import { consumptionDocumentationForFiles, OMITTED_API_CARDS_NOTICE, stripGeneratedReadmeTail } from "./documentation";
import { DESIGN_SYSTEM_ENVELOPE_PATH, DESIGN_SYSTEM_PATHS, explainUnsafeMirrorPath, GENERATED_TOKENS_CSS_PATH, isGeneratedApiPath, isTextFilePath, parseDataUriHeader, TYPE_RESERVED_FILE_BUDGET } from "./file-policy";
import { ARTIFACT_FILE_LIMITS, isMirrorEligibleFile, mirrorMimeTypeForPath } from "./file-table";
import { generatedTokensCssForFiles, tokensJsonWithManifestName } from "./tokens";

var mirrorContentEncoder: TextEncoder;
var MAX_PUBLISH_BATCH_BYTES: number;
var SYNC_HOST_ERROR_CLASSIFICATIONS: Record<string, string>;
var SYNC_FILE_ERROR_CLASSIFICATIONS: Record<string, string>;
var SYNC_FILE_INPUT_ERROR_CLASSIFICATIONS: Record<string, string>;
var SYNC_PENDING_SAVE_STATES: Set<string>;
var SYNC_READY_SAVE_STATES: Set<string>;
var DOWNLOAD_INTERNAL_FAILURE: Storage.HealthEvent;
var DOWNLOAD_OUTCOME_HEALTH: Record<string, Storage.HealthEvent>;
var DOWNLOAD_ERROR_HEALTH: Record<string, Storage.HealthEvent>;
var SAVE_ERROR_HEALTH: Record<string, string>;
function fileTableOrNull(content: unknown): Model.FileTable | null {
  let files = (content as { files?: unknown } | null | undefined)?.files;
  if (typeof files === "object" && files !== null) {
    return files as Model.FileTable;
  } else {
    return null;
  }
}
function mirrorFileContent(
  path: string,
  content: string,
): { content: string | Blob; contentType: string } | null {
  let mime = mirrorMimeTypeForPath(path)!;
  if (isTextFilePath(path)) {
    return {
      content: content,
      contentType: mime,
    };
  }
  let header = parseDataUriHeader(content),
    binary: string;
  try {
    binary = atob(content.slice(header!.payloadOffset));
  } catch {
    return null;
  }
  let bytes = new Uint8Array(binary.length);
  for (let index: number = 0; index < binary.length; index++) {
    bytes[index] = binary.charCodeAt(index);
  }
  return {
    content: new Blob([bytes], {
      type: mime,
    }),
    contentType: mime,
  };
}
function computeMirrorChanges(
  beforeFiles: Model.FileTable,
  afterFiles: Model.FileTable,
  force: boolean = false,
): Model.FilePublishEntries {
  let changes: Model.FilePublishEntries = {},
    afterTokensCss = generatedTokensCssForFiles(afterFiles),
    beforeTokensCss = generatedTokensCssForFiles(beforeFiles);
  if (afterTokensCss === null) {
    if (
      beforeTokensCss !== null ||
      Object.hasOwn(beforeFiles, GENERATED_TOKENS_CSS_PATH)
    ) {
      changes[GENERATED_TOKENS_CSS_PATH] = null;
    }
  } else if (force || afterTokensCss !== beforeTokensCss) {
    changes[GENERATED_TOKENS_CSS_PATH] = {
      content: afterTokensCss,
      contentType: mirrorMimeTypeForPath(
        GENERATED_TOKENS_CSS_PATH,
      )!,
    };
  }
  let documentation = consumptionDocumentationForFiles(
      afterFiles,
    ),
    beforeCards = consumptionDocumentationForFiles(
      beforeFiles,
    ).files;
  for (let [value, content] of documentation.files) {
    if (force || beforeCards.get(value) !== content) {
      changes[value] = {
        content: content,
        contentType: mirrorMimeTypeForPath(value)!,
      };
    }
  }
  for (let value of beforeCards.keys()) {
    if (!documentation.files.has(value)) {
      changes[value] = null;
    }
  }
  let renamedTokensText = tokensJsonWithManifestName(afterFiles);
  for (let value of Object.keys(afterFiles)) {
    let fileContent = afterFiles[value];
    if (!isMirrorEligibleFile(value, fileContent)) {
      continue;
    }
    if (
      !force &&
      (value === DESIGN_SYSTEM_PATHS.tokens
        ? renamedTokensText ===
          tokensJsonWithManifestName(beforeFiles)
        : beforeFiles[value] === fileContent) &&
      value !== DESIGN_SYSTEM_PATHS.manifest &&
      value !== DESIGN_SYSTEM_PATHS.readme
    ) {
      continue;
    }
    let mirroredContent = mirrorFileContent(
      value,
      value === DESIGN_SYSTEM_PATHS.readme
        ? documentation.readme
        : value === DESIGN_SYSTEM_PATHS.tokens
          ? renamedTokensText!
          : fileContent,
    );
    if (mirroredContent !== null) {
      changes[value] = mirroredContent;
    }
  }
  for (let value of Object.keys(beforeFiles)) {
    if (
      value !== GENERATED_TOKENS_CSS_PATH &&
      !documentation.files.has(value) &&
      isMirrorEligibleFile(value, beforeFiles[value]) &&
      !(
        Object.hasOwn(afterFiles, value) &&
        isMirrorEligibleFile(value, afterFiles[value])
      )
    ) {
      changes[value] = null;
    }
  }
  return changes;
}
function countMirrorFiles(files: Model.FileTable): number {
  let count =
    (generatedTokensCssForFiles(files) !== null ? 1 : 0) +
    consumptionDocumentationForFiles(files).files.size;
  for (let value of Object.keys(files)) {
    if (isMirrorEligibleFile(value, files[value])) {
      count++;
    }
  }
  return count;
}
function estimatePublishContentBytes(
  changes: Model.FilePublishEntries,
): number {
  let bytes = 0;
  for (let value of Object.values(changes)) {
    if (
      value === null ||
      typeof value !== "object" ||
      value instanceof Blob
    ) {
      continue;
    }
    bytes +=
      typeof value.content === "string"
        ? mirrorContentEncoder.encode(value.content).length
        : Math.ceil((value.content.size * 4) / 3);
  }
  return bytes;
}
function createPageMirrorPublisher(
  publisherOptions: Storage.MirrorPublisherOptions = {},
  resolveArtifact: () => Promise<Storage.SelfPublishCapability | null> = getSelfPublishCapability,
): Host.Publisher {
  let mirrorState: string = "untried",
    mirrorCurrent: boolean = false;
  return async (
    content: string,
    publishOptions?: Parameters<Host.Publisher>[1],
  ): ReturnType<Host.Publisher> => {
    let value = await resolveArtifact();
    if (value === null) {
      throw {
        code: "not_granted",
        get message() { return uiMessage("design-system.publish.theArtifactCapabilityIsNotAvailableToThisView"); },
      };
    }
    let publishedTable =
        publishOptions === undefined
          ? null
          : fileTableOrNull(publishOptions.published.content),
      baseTable =
        publishOptions === undefined
          ? null
          : fileTableOrNull(publishOptions.base.content);
    if (publishedTable === null || baseTable === null || mirrorState === "off") {
      return value.publish(content);
    }
    let callback = (stalePath: string) => {
        mirrorCurrent = false;
        publisherOptions.onStale?.(stalePath);
        return value.publish(content);
      },
      changes: Model.FilePublishEntries;
    try {
      changes = computeMirrorChanges(baseTable, publishedTable, !mirrorCurrent);
    } catch (error: unknown) {
      return callback(
        "the mirror could not be computed (" +
          (error instanceof Error ? error.message : String(error)) +
          ")",
      );
    }
    if (
      Math.max(countMirrorFiles(publishedTable), Object.keys(changes).length) + 1 >
        ARTIFACT_FILE_LIMITS.call ||
      mirrorContentEncoder.encode(content).length +
        estimatePublishContentBytes(changes) >
        MAX_PUBLISH_BATCH_BYTES
    ) {
      return callback(
        "the page and its files are more than one save can send",
      );
    }
    changes["index.html"] = {
      content: content,
      contentType: "text/html",
    };
    try {
      let publishResult = await value.publish(changes);
      mirrorState = "on";
      mirrorCurrent = true;
      return {
        ...publishResult,
        reloads: false,
      };
    } catch (error: unknown) {
      let code = normalizeSelfPublishError(error).code;
      if (
        code === "capability_disabled" ||
        code === "capability_removed" ||
        (mirrorState === "untried" &&
          (code === "invalid_content" || code === "transform_error"))
      ) {
        mirrorState = "off";
        return callback(
          "this view cannot write files beside the page (" + code + ")",
        );
      }
      if (code === "too_large") {
        return callback(
          "the page and its files are more than one save can send",
        );
      }
      if (code === "invalid_content" || code === "transform_error") {
        return callback(
          "the files beside the page were refused (" + code + ")",
        );
      }
      if (code === "not_granted" || code === "not_writer") {
        return value.publish(content);
      }
      throw error;
    }
  };
}
function createSystemFilesPublisher(
  publisherOptions: Storage.MirrorPublisherOptions = {},
  resolveArtifact: () => Promise<Storage.SelfPublishCapability | null> = getSelfPublishCapability,
): Host.Publisher {
  let firstPublish: boolean = true,
    owedPaths = new Set<string>(),
    publishedCards = new Map<string, string>(),
    baseCardPaths: Set<string> | null = null;
  return async (
    publishInput: string,
    publishOptions?: Parameters<Host.Publisher>[1],
  ): ReturnType<Host.Publisher> => {
    let value = await resolveArtifact();
    if (value === null) {
      throw {
        code: "not_granted",
        get message() { return uiMessage("design-system.publish.theArtifactCapabilityIsNotAvailableToThisView"); },
      };
    }
    if (publishOptions === undefined) {
      throw {
        code: "invalid_content",
        get message() { return uiMessage("design-system.publish.aSystemMadeFromTheSharedTypeSavesItsFilesNeverAPage"); },
      };
    }
    let publishedTable = fileTableOrNull(publishOptions.published.content),
      baseTable = fileTableOrNull(publishOptions.base.content);
    if (publishedTable === null || baseTable === null) {
      throw {
        code: "invalid_content",
        get message() { return uiMessage("design-system.publish.theDocumentHasNoFileTableToSave"); },
      };
    }
    let state = {
        content:
          JSON.stringify({
            title: publishOptions.published.title,
            content: publishOptions.published.content,
            comments: [],
          }) +
          `
`,
        contentType: "application/json",
      },
      publishLimit =
        ARTIFACT_FILE_LIMITS.files -
        TYPE_RESERVED_FILE_BUDGET.files,
      index = 0,
      flag = false,
      firstIndex = 0;
    try {
      baseCardPaths ??= new Set(
        consumptionDocumentationForFiles(baseTable).files.keys(),
      );
      index = consumptionDocumentationForFiles(publishedTable).files
        .size;
      firstIndex = countMirrorFiles(publishedTable) + 1;
      flag = firstIndex > publishLimit && firstIndex - index <= publishLimit;
    } catch {
      firstIndex =
        Object.keys(publishedTable).filter((path) =>
          isMirrorEligibleFile(path, publishedTable[path]),
        ).length + 2;
    }
    let callback = (entries: Model.FilePublishEntries) => {
        let existingCards: ReadonlyMap<string, string>;
        try {
          existingCards = consumptionDocumentationForFiles(
            publishedTable,
          ).files;
        } catch {
          return entries;
        }
        for (let path of Object.keys(entries)) {
          if (
            isGeneratedApiPath(path) &&
            (entries[path] === null || flag)
          ) {
            delete entries[path];
          }
        }
        let remainingSlots: number =
          ARTIFACT_FILE_LIMITS.call - 1 - Object.keys(entries).length;
        for (let path of new Set([
          ...(baseCardPaths ?? []),
          ...publishedCards.keys(),
        ])) {
          if (remainingSlots <= 0) {
            break;
          }
          if ((flag || !existingCards.has(path)) && !(path in entries)) {
            entries[path] = null;
            remainingSlots--;
          }
        }
        if (!flag) {
          return entries;
        }
        let readmeEntry = entries[DESIGN_SYSTEM_PATHS.readme];
        if (
          readmeEntry !== null &&
          typeof readmeEntry === "object" &&
          !(readmeEntry instanceof Blob) &&
          typeof readmeEntry.content === "string" &&
          !readmeEntry.content.endsWith(OMITTED_API_CARDS_NOTICE)
        ) {
          entries[DESIGN_SYSTEM_PATHS.readme] = {
            ...readmeEntry,
            content: readmeEntry.content + OMITTED_API_CARDS_NOTICE,
          };
        }
        return entries;
      },
      maxBatchLabel: string =
        String(Math.round(MAX_PUBLISH_BATCH_BYTES / 1024 / 1024)) + " MB",
      maxBatchBytes: string =
        "Not saved: this design system is more than one save can send (" +
        maxBatchLabel +
        ") — remove or shrink large files, then save again.";
    if (
      estimatePublishContentBytes({
        [DESIGN_SYSTEM_ENVELOPE_PATH]: state,
      }) > MAX_PUBLISH_BATCH_BYTES
    ) {
      throw makePublishSizeError(maxBatchBytes);
    }
    let pendingChanges: Model.FilePublishEntries | null = null,
      getCurrentPublished = () =>
        (pendingChanges ??= computeMirrorChanges(baseTable, publishedTable, true));
    try {
      for (let path of [...owedPaths]) {
        if ((getCurrentPublished()[path] ?? null) === null) {
          owedPaths.delete(path);
        }
      }
    } catch {
      owedPaths.clear();
    }
    let currentBytes = estimatePublishContentBytes({
        [DESIGN_SYSTEM_ENVELOPE_PATH]: state,
      }),
      cache = new WeakMap<object, number>(),
      processBatch = (batchEntries: Model.FilePublishEntries) => {
        let batchIndex: number = 0;
        try {
          for (let path of Object.keys(batchEntries)) {
            if (
              isGeneratedApiPath(path) &&
              batchEntries[path] !== null
            ) {
              delete batchEntries[path];
            }
          }
          let batchBytes = currentBytes + estimatePublishContentBytes(batchEntries),
            entryCount = Object.keys(batchEntries).length + 1;
          for (let [path, content] of consumptionDocumentationForFiles(publishedTable).files) {
            if (publishedCards.get(path) === content) {
              continue;
            }
            let length = mirrorContentEncoder.encode(content).length;
            if (
              batchBytes + length > MAX_PUBLISH_BATCH_BYTES ||
              entryCount >= ARTIFACT_FILE_LIMITS.call
            ) {
              batchIndex++;
              continue;
            }
            batchEntries[path] = {
              content: content,
              contentType: mirrorMimeTypeForPath(path)!,
            };
            batchBytes += length;
            entryCount++;
          }
        } catch {}
        cache.set(batchEntries, batchIndex);
        return batchEntries;
      },
      currentPublished = () =>
        processBatch(computeMirrorChanges(baseTable, publishedTable, false)),
      items: [string, () => Model.FilePublishEntries][] = [
        [
          "want",
          () => {
            let changes = computeMirrorChanges(baseTable, publishedTable, false);
            for (let path of owedPaths) {
              changes[path] = getCurrentPublished()[path];
            }
            return processBatch(changes);
          },
        ],
        ["changed", currentPublished],
        [
          "least",
          () => {
            let deletedEntries: Model.FilePublishEntries = {};
            try {
              for (let [path, entry] of Object.entries(currentPublished())) {
                if (entry === null) {
                  deletedEntries[path] = null;
                }
              }
            } catch {}
            let manifestContent = publishedTable[DESIGN_SYSTEM_PATHS.manifest],
              manifestChanges =
                typeof manifestContent === "string" &&
                isMirrorEligibleFile(
                  DESIGN_SYSTEM_PATHS.manifest,
                  manifestContent,
                )
                  ? mirrorFileContent(
                      DESIGN_SYSTEM_PATHS.manifest,
                      manifestContent,
                    )
                  : null;
            if (manifestChanges !== null) {
              deletedEntries[DESIGN_SYSTEM_PATHS.manifest] = manifestChanges;
            }
            if (flag) {
              try {
                let readmeContent =
                  DESIGN_SYSTEM_PATHS.readme in currentPublished()
                    ? currentPublished()[DESIGN_SYSTEM_PATHS.readme]
                    : getCurrentPublished()[DESIGN_SYSTEM_PATHS.readme];
                if (readmeContent === null) {
                  deletedEntries[DESIGN_SYSTEM_PATHS.readme] = null;
                } else if (
                  readmeContent !== undefined &&
                  currentBytes +
                    estimatePublishContentBytes({
                      ...deletedEntries,
                      [DESIGN_SYSTEM_PATHS.readme]: readmeContent,
                    }) <=
                    MAX_PUBLISH_BATCH_BYTES
                ) {
                  deletedEntries[DESIGN_SYSTEM_PATHS.readme] = readmeContent;
                } else if (
                  readmeContent !== undefined &&
                  typeof publishedTable[DESIGN_SYSTEM_PATHS.readme] ===
                    "string"
                ) {
                  let readmeState = {
                    content:
                      stripGeneratedReadmeTail(
                        publishedTable[DESIGN_SYSTEM_PATHS.readme],
                      ).replace(/\uFFFD/g, "") +
                      OMITTED_API_CARDS_NOTICE,
                    contentType: mirrorMimeTypeForPath(
                      DESIGN_SYSTEM_PATHS.readme,
                    )!,
                  };
                  if (
                    currentBytes +
                      estimatePublishContentBytes({
                        ...deletedEntries,
                        [DESIGN_SYSTEM_PATHS.readme]: readmeState,
                      }) <=
                    MAX_PUBLISH_BATCH_BYTES
                  ) {
                    deletedEntries[DESIGN_SYSTEM_PATHS.readme] = readmeState;
                  }
                }
              } catch {}
            }
            return deletedEntries;
          },
        ],
      ];
    if (firstPublish) {
      items.unshift([
        "all",
        () => ({
          ...getCurrentPublished(),
        }),
      ]);
    }
    let text: string = "",
      statusMessage: string = "",
      previousStatusMessage = "",
      publishError: Host.PublishError | undefined = undefined,
      allowLeast: boolean = false;
    for (let [publishMode, publishAction] of items) {
      let publishEntries: Model.FilePublishEntries;
      try {
        publishEntries = callback(publishAction());
      } catch (error: unknown) {
        text =
          "the files beside it could not be prepared (" +
          (error instanceof Error ? error.message : String(error)) +
          ") — an appifact bug";
        statusMessage = "Not saved: " + text + ".";
        continue;
      }
      for (let path of Object.keys(publishEntries)) {
        if (explainUnsafeMirrorPath(path) !== null) {
          delete publishEntries[path];
        }
      }
      publishEntries[DESIGN_SYSTEM_ENVELOPE_PATH] = state;
      let statusText: string =
        Object.keys(publishEntries).sort().join(`
`) +
        `
` +
        String(estimatePublishContentBytes(publishEntries));
      if (statusText === previousStatusMessage) {
        continue;
      }
      previousStatusMessage = statusText;
      let length = Object.keys(publishEntries).length,
        publishedCount: number = Math.max(
          firstIndex - (flag ? index : 0),
          length -
            Object.values(publishEntries).filter(
              (entry): boolean => entry === null,
            ).length,
        );
      if (
        publishedCount > publishLimit ||
        length > ARTIFACT_FILE_LIMITS.call ||
        estimatePublishContentBytes(publishEntries) > MAX_PUBLISH_BATCH_BYTES
      ) {
        text =
          publishedCount > publishLimit
            ? "more files than one can hold (" +
              String(publishedCount - (flag ? 0 : index)) +
              " of " +
              String(publishLimit) +
              (index > 0
                ? "; the " +
                  String(index) +
                  " generated api/ cards are left out automatically"
                : "") +
              ")"
            : length > ARTIFACT_FILE_LIMITS.call
              ? "more paths than one save can name (" +
                String(length) +
                " of " +
                String(ARTIFACT_FILE_LIMITS.call) +
                ", " +
                String(
                  Object.values(publishEntries).filter(
                    (entry): boolean => entry === null,
                  ).length,
                ) +
                " of them deletions)"
              : "more than one save can send (" + maxBatchLabel + ")";
        statusMessage =
          publishedCount > publishLimit || length > ARTIFACT_FILE_LIMITS.call
            ? "Not saved: this design system has " +
              text +
              " — remove some, then save again."
            : maxBatchBytes;
        publishError = undefined;
        continue;
      }
      try {
        let publishedEntries = await value.publish(publishEntries),
          values = new Set(
            Object.keys(publishEntries).filter(
              (path) =>
                publishEntries[path] !== null &&
                path !== DESIGN_SYSTEM_PATHS.manifest &&
                path !== DESIGN_SYSTEM_ENVELOPE_PATH,
            ),
          );
        for (let [path, entry] of Object.entries(publishEntries)) {
          if (!isGeneratedApiPath(path)) {
            continue;
          }
          if (entry === null) {
            publishedCards.delete(path);
            baseCardPaths?.delete(path);
          } else if (
            typeof entry === "object" &&
            !(entry instanceof Blob) &&
            typeof (entry as { content?: unknown }).content === "string"
          ) {
            publishedCards.set(
              path,
              (entry as { content: string }).content,
            );
          }
        }
        if (publishMode === "all" || publishMode === "want") {
          owedPaths.clear();
        } else {
          try {
            for (let path of values) {
              owedPaths.delete(path);
            }
            for (let [path, entry] of Object.entries(currentPublished())) {
              if (
                entry !== null &&
                path !== DESIGN_SYSTEM_PATHS.manifest &&
                !values.has(path) &&
                explainUnsafeMirrorPath(path) === null &&
                !isGeneratedApiPath(path)
              ) {
                owedPaths.add(path);
              }
            }
          } catch {}
        }
        let messages: string[] = [];
        if (flag) {
          messages.push(
            "the generated api/ cards were left out: with them this system is " +
              String(firstIndex) +
              " files and one version has room for " +
              String(publishLimit) +
              " — agents read the long-form READMEs instead",
          );
        }
        if (owedPaths.size > 0) {
          messages.push(
            "saved design-system.json; " +
              String(owedPaths.size) +
              " mirrored file(s) beside it are behind (" +
              text +
              ") and ride the next save that fits, or a make.ts build",
          );
        }
        let duplicateCount = cache.get(publishEntries) ?? 0;
        if (publishMode === "least" && !flag) {
          try {
            for (let [path, content] of consumptionDocumentationForFiles(publishedTable).files) {
              if (publishedCards.get(path) !== content) {
                duplicateCount++;
              }
            }
          } catch {}
        }
        if (duplicateCount > 0) {
          messages.push(
            String(duplicateCount) +
              " generated api/ card(s) beside it are a save behind (this save was at the size limit) and ride the next save with room, or a make.ts build",
          );
        }
        if (firstPublish && publishMode !== "all") {
          messages.push(
            "the whole mirror was not re-sent this session (" +
              text +
              "); changed files go beside it as they change — a make.ts build refreshes the rest",
          );
        }
        if (messages.length > 0) {
          publisherOptions.onStale?.(messages.join("; "));
        }
        if (publishMode !== "least" || allowLeast) {
          firstPublish = false;
        }
        return {
          ...publishedEntries,
          reloads: false,
        };
      } catch (error: unknown) {
        let normalizedError = normalizeSelfPublishError(error),
          code = normalizedError.code;
        if (
          code !== "too_large" &&
          code !== "invalid_content" &&
          code !== "transform_error"
        ) {
          throw error;
        }
        text = "the store refused the files beside it (" + code + ")";
        if (publishMode === "all") {
          allowLeast = true;
        }
        statusMessage =
          code === "too_large"
            ? "Not saved: the store refused its files as too large — remove or shrink large files, then save again."
            : "Not saved: the store refused this system’s files (" +
              code +
              (normalizedError.message !== code ? ": " + normalizedError.message : "") +
              ") — usually a content problem, most often a pasted replacement character (U+FFFD, the box glyph) in a document: remove it and save again.";
        publishError = {
          ...normalizedError,
          say: statusMessage,
        };
      }
    }
    throw (
      publishError ??
      makePublishSizeError(statusMessage !== "" ? statusMessage : "Not saved: " + text + ".")
    );
  };
}
function makePublishSizeError(message: string): Storage.MirrorPublishError {
  return {
    code: "too_large",
    message: message,
    say: message,
  };
}
function classifySyncErrorCode(code: string | undefined): string {
  if (code === undefined) {
    return "unknown";
  }
  if (Object.hasOwn(SYNC_HOST_ERROR_CLASSIFICATIONS, code)) {
    return SYNC_HOST_ERROR_CLASSIFICATIONS[code];
  }
  if (Object.hasOwn(SYNC_FILE_ERROR_CLASSIFICATIONS, code)) {
    return SYNC_FILE_ERROR_CLASSIFICATIONS[code];
  } else {
    return "unknown";
  }
}
function syncLoadHealthOutcome(
  loadState: string,
  errorCode: string | undefined,
): Storage.HealthEvent {
  if (loadState === "live") {
    return ["render", "success"];
  }
  if (loadState === "saved_copy") {
    return ["render", "success", "saved_copy"];
  }
  return [
    "render",
    "failure",
    errorCode === "timeout" ? "timeout" : "capability_error",
  ];
}
function monitorSyncLoadHealth(
  document: Storage.MonitoredSyncDocument,
  report: Storage.SyncHealthReporter,
): () => void {
  let reported: boolean = false,
    unsubscribe: (() => void) | undefined,
    check = (): void => {
      if (reported) {
        return;
      }
      let value = document.loadState();
      if (value === "loading") {
        return;
      }
      if (value === "cached" && document.cachedSettled?.() !== true) {
        return;
      }
      reported = true;
      unsubscribe?.();
      safeReportSyncHealth(
        report,
        syncLoadHealthOutcome(
          value === "cached" ? "saved_copy" : value,
          document.syncDetail().lastError?.code,
        ),
      );
    };
  unsubscribe = document.subscribeLoad(check);
  check();
  return (): void => {
    reported = true;
    unsubscribe?.();
  };
}
function monitorSyncSaveHealth(
  document: Storage.MonitoredSyncDocument,
  report: Storage.SyncHealthReporter,
): () => void {
  let previousStatus = document.saveState().status,
    previousLeftOut = new Map<string, string>(),
    unsubscribeStuck =
      document.subscribeStuck?.(() =>
        safeReportSyncHealth(report, ["sync", "failure", "timeout"]),
      ) ?? ((): void => {}),
    unsubscribeSave = document.subscribeSave(
      (state: Storage.MonitoredSaveState): void => {
        let status = state.status;
        if (status === previousStatus) {
          return;
        }
        let value = previousStatus;
        previousStatus = status;
        if (document.loadState() !== "live") {
          return;
        }
        if (status === "ready") {
          previousLeftOut = new Map();
        }
        if (status === "ready" && SYNC_PENDING_SAVE_STATES.has(value)) {
          safeReportSyncHealth(report, ["sync", "success"]);
        } else if (status === "error" && SYNC_READY_SAVE_STATES.has(value)) {
          let syncErrorCode = document.syncDetail().lastError?.code;
          if (syncErrorCode !== undefined || state.leftOut === undefined) {
            safeReportSyncHealth(report, [
              "sync",
              "failure",
              classifySyncErrorCode(syncErrorCode ?? state.code),
            ]);
            return;
          }
          let values = new Set<string>();
          for (let leftOutFile of state.leftOut) {
            if (previousLeftOut.get(leftOutFile.id) !== leftOutFile.cause) {
              values.add(SYNC_FILE_INPUT_ERROR_CLASSIFICATIONS[leftOutFile.cause]);
            }
          }
          previousLeftOut = new Map(
            state.leftOut.map((file) => [file.id, file.cause]),
          );
          for (let errorCode of values) {
            safeReportSyncHealth(report, ["sync", "failure", errorCode]);
          }
        } else if (
          status === "readonly" &&
          SYNC_PENDING_SAVE_STATES.has(value) &&
          document.dirty()
        ) {
          safeReportSyncHealth(report, [
            "sync",
            "failure",
            "capability_denied",
          ]);
        }
      },
    );
  return (): void => {
    unsubscribeStuck();
    unsubscribeSave();
  };
}
function safeReportSyncHealth(
  report: Storage.SyncHealthReporter,
  event: Storage.HealthEvent,
): void {
  try {
    report(event);
  } catch (value: unknown) {
    console.error(
      "appifact sync health: reporter threw; report dropped",
      value,
    );
  }
}
function bootHealthOutcome(
  bootResult: Storage.SystemBootResult & { errorAt?: string },
  successOverride: boolean = false,
): Storage.HealthEvent {
  if (bootResult.origin === "instance" || successOverride) {
    return ["render", "success"];
  }
  if (bootResult.origin === "demo" && bootResult.stateFileFound === false) {
    return ["render", "success"];
  }
  if (bootResult.errorAt === undefined) {
    return ["render", "failure", "internal"];
  }
  return [
    "render",
    "failure",
    bootResult.errorAt === "read" ? "invalid_content" : "network",
  ];
}
function downloadHealthOutcome(
  result: Storage.DownloadOutcome,
): Storage.HealthEvent | undefined {
  return (
    (result.outcome === "unsupported"
      ? DOWNLOAD_ERROR_HEALTH[result.code!]
      : undefined) ?? DOWNLOAD_OUTCOME_HEALTH[result.outcome]
  );
}
function reportPublisherOutcome(
  publish: Host.Publisher,
  report: (result: string) => void,
): Host.Publisher {
  return async (
    content: string,
    publishOptions?: Parameters<Host.Publisher>[1],
  ): ReturnType<Host.Publisher> => {
    try {
      let value = await publish(content, publishOptions);
      if (publishOptions !== undefined) {
        report("landed");
      }
      return value;
    } catch (value: unknown) {
      if (publishOptions !== undefined) {
        report(normalizeSelfPublishError(value).code);
      }
      throw value;
    }
  };
}
function saveHealthOutcome(
  saveStatus: string,
  publishOutcome?: string,
): Storage.HealthEvent | null {
  if (
    saveStatus === "readonly" ||
    saveStatus === "saving" ||
    saveStatus === "loading"
  ) {
    return null;
  }
  if (publishOutcome === "landed") {
    return ["save", "success"];
  }
  if (publishOutcome === undefined) {
    if (saveStatus === "error") {
      return ["save", "failure", "internal"];
    } else {
      return null;
    }
  }
  return ["save", "failure", SAVE_ERROR_HEALTH[publishOutcome]];
}
export {
  bootHealthOutcome,
  classifySyncErrorCode,
  computeMirrorChanges,
  countMirrorFiles,
  createPageMirrorPublisher,
  createSystemFilesPublisher,
  DOWNLOAD_ERROR_HEALTH,
  DOWNLOAD_INTERNAL_FAILURE,
  DOWNLOAD_OUTCOME_HEALTH,
  downloadHealthOutcome,
  estimatePublishContentBytes,
  fileTableOrNull,
  makePublishSizeError,
  MAX_PUBLISH_BATCH_BYTES,
  mirrorContentEncoder,
  mirrorFileContent,
  monitorSyncLoadHealth,
  monitorSyncSaveHealth,
  reportPublisherOutcome,
  safeReportSyncHealth,
  SAVE_ERROR_HEALTH,
  saveHealthOutcome,
  SYNC_FILE_ERROR_CLASSIFICATIONS,
  SYNC_FILE_INPUT_ERROR_CLASSIFICATIONS,
  SYNC_HOST_ERROR_CLASSIFICATIONS,
  SYNC_PENDING_SAVE_STATES,
  SYNC_READY_SAVE_STATES,
  syncLoadHealthOutcome,
};
export function installModelPublish(): () => void {
  return () => {
    mirrorContentEncoder = new TextEncoder();
    MAX_PUBLISH_BATCH_BYTES = 15728640;
    SYNC_HOST_ERROR_CLASSIFICATIONS = {
      refused: "too_large",
      quota_exceeded: "too_large",
      invalid_argument: "invalid_content",
      transform_error: "invalid_content",
      resource_exhausted: "backpressure",
      unavailable: "transient",
      timeout: "timeout",
      revoked: "capability_denied",
      not_granted: "capability_denied",
      capability_disabled: "capability_denied",
      capability_removed: "capability_denied",
    };
    SYNC_FILE_ERROR_CLASSIFICATIONS = {
      conflict: "conflict",
      too_large: "too_large",
      invalid_content: "invalid_content",
      index_damaged: "invalid_content",
      index_newer_build: "internal",
      upstream_error: "transient",
      rate_limited: "backpressure",
      read_only_path: "internal",
      not_writer: "capability_denied",
      not_declared: "capability_denied",
      capability_disabled: "capability_denied",
    };
    SYNC_FILE_INPUT_ERROR_CLASSIFICATIONS = {
      size: "too_large",
      kind: "validation",
      name: "user_error",
      damaged_text: "user_error",
      gone: "internal",
      unreadable: "internal",
      other: "invalid_content",
    };
    SYNC_PENDING_SAVE_STATES = new Set(["dirty", "saving", "error"]);
    SYNC_READY_SAVE_STATES = new Set(["ready", "dirty", "saving"]);
    DOWNLOAD_INTERNAL_FAILURE = ["download", "failure", "internal"];
    DOWNLOAD_OUTCOME_HEALTH = {
      saved: ["download", "success"],
      declined: ["download", "aborted"],
      withheld: ["download", "aborted"],
      unsupported: ["download", "failure", "capability_error"],
    };
    DOWNLOAD_ERROR_HEALTH = {
      too_large: ["download", "aborted"],
      rate_limited: ["download", "aborted"],
      rejected_extension: ["download", "aborted"],
      extension_not_enabled: ["download", "aborted"],
      bad_request: ["download", "failure", "invalid_content"],
    };
    SAVE_ERROR_HEALTH = {
      conflict: "conflict",
      too_large: "too_large",
      invalid_content: "invalid_content",
      transform_error: "invalid_content",
      upstream_error: "transient",
      rate_limited: "backpressure",
      read_only_path: "internal",
      not_writer: "capability_denied",
      not_declared: "capability_denied",
      not_granted: "capability_denied",
      consent_required: "capability_denied",
      capability_disabled: "capability_denied",
      capability_removed: "capability_denied",
    };
  };
}
