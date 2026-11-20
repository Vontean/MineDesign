/** Restored application module; prepare first, initialize in original order. */
import {
  type Dynamic,
} from "../runtime-types";
import { isRetryableAccessFailure, PlatformAccessRetryItems, retryAccessFailure } from "./access-retry";
import { isNarrowedFileContext } from "./file-content";
import { PlatformFilesHotReloadItems } from "./files-hot-reload";
import { getHotReloadController } from "./hot-reload";
import { IndexFileError } from "./index-state";

var BootReadError: Dynamic;
var BOOT_READ_MAX_PASSES: Dynamic;
var getErrorHttpStatus: Dynamic;
var getErrorMessage: Dynamic;
var isPermanentBootstrapFailure: Dynamic;
var BOOT_RETRY_BACKOFF_MS: Dynamic;
var DAMAGED_INDEX_RETRY_DELAY_MS: Dynamic;
async function readBootFiles(readOptions?: Dynamic): Promise<Dynamic> {
  let { port: port, indexPath: indexPath }: Dynamic = readOptions,
    readPort: Dynamic = port,
    retryWaits: Dynamic =
      readOptions.waits ?? PlatformFilesHotReloadItems,
    wantsFile: Dynamic = readOptions.wants ?? ((): Dynamic => false),
    timers: Dynamic = readOptions.timers ?? {
      setTimeout: (resolve?: Dynamic, delay?: Dynamic): Dynamic =>
        setTimeout(resolve, delay),
    },
    earlyUpdates: Dynamic =
      readOptions.early ?? getHotReloadController(),
    maxPasses: Dynamic = Math.max(
      1,
      readOptions.maxPasses ?? BOOT_READ_MAX_PASSES,
    ),
    passes: Dynamic = 0,
    reportEvent: Dynamic = (event?: Dynamic): Dynamic => {
      try {
        readOptions.onEvent?.(event);
      } catch {}
    },
    sleep: Dynamic = (milliseconds?: Dynamic): Dynamic =>
      new Promise((resolveSleep?: Dynamic): Dynamic => {
        timers.setTimeout(resolveSleep, milliseconds);
      });
  function adoptQueuedVersion(): Dynamic {
    let queuedVersions: Dynamic = earlyUpdates?.queued;
    if (queuedVersions === undefined || queuedVersions.length === 0) return;
    let latestVersion: Dynamic = queuedVersions[queuedVersions.length - 1];
    if (port.version().version !== latestVersion.to.version)
      try {
        readPort.noteAdopted?.(latestVersion.to, queuedVersions[0].from);
      } catch {}
  }
  function wrapReadError(error?: Dynamic, contextTag?: Dynamic): Dynamic {
    if (error instanceof BootReadError) return error;
    let status: Dynamic = getErrorHttpStatus(error);
    return error?.code === "redirected"
      ? new BootReadError(
          "unreadable",
          contextTag,
          contextTag + ": " + getErrorMessage(error),
        )
      : new BootReadError(
          status === 401 || status === 403 ? "access_revoked" : "unreadable",
          contextTag,
          contextTag + ": " + getErrorMessage(error),
          status,
        );
  }
  async function value(
    pathValue?: Dynamic,
    path?: Dynamic,
  ): Promise<Dynamic> {
    if (
      !(
        pathValue?.code !== "redirected" ||
        readPort.readTextUnchecked === undefined
      )
    )
      try {
        let fileText: Dynamic = await readPort.readTextUnchecked(path);
        reportEvent({
          type: "boot-took-redirected",
          path: path,
        });
        return fileText;
      } catch {
        return;
      }
  }
  async function readWithRetry(
    filePath?: Dynamic,
    readAttempt?: Dynamic,
    onNotFound?: Dynamic,
    onRetry?: Dynamic,
  ): Promise<Dynamic> {
    for (let attemptIndex: Dynamic = 0; ; attemptIndex++)
      try {
        return await readAttempt();
      } catch (error: Dynamic) {
        if (!isRetryableAccessFailure(error))
          throw wrapReadError(error, filePath);
        if (
          onNotFound !== undefined &&
          getErrorHttpStatus(error) === 404 &&
          (await onNotFound())
        )
          return null;
        if (attemptIndex >= retryWaits.length) {
          let fallbackValue: Dynamic = await onRetry?.(error);
          if (fallbackValue !== undefined) return fallbackValue;
          throw wrapReadError(error, filePath);
        }
        passes += 1;
        let status: Dynamic = getErrorHttpStatus(error);
        reportEvent({
          type: "boot-retry",
          path: filePath,
          attempt: attemptIndex + 1,
          ...(status !== undefined
            ? {
                status: status,
              }
            : {}),
          waitMs: retryWaits[attemptIndex],
        });
        await sleep(retryWaits[attemptIndex]);
      }
  }
  async function readIndexFile(): Promise<Dynamic> {
    let getIndexFile: Dynamic = (): Dynamic =>
        new BootReadError(
          "no_index",
          indexPath,
          indexPath + " is not in this artifact",
          undefined,
          true,
        ),
      activeRetryWaits: Dynamic =
        readOptions.mayWrite === true
          ? retryWaits
          : PlatformAccessRetryItems;
    try {
      return await retryAccessFailure(
        (): Dynamic => port.readText(indexPath),
        timers,
        (attempt?: Dynamic, error?: Dynamic): Dynamic => {
          passes += 1;
          reportEvent({
            type: "boot-retry",
            path: indexPath,
            attempt: attempt,
            ...(getErrorHttpStatus(error) !== undefined
              ? {
                  status: getErrorHttpStatus(error),
                }
              : {}),
            waitMs: activeRetryWaits[attempt - 1] ?? 0,
          });
        },
        activeRetryWaits,
      );
    } catch (error: Dynamic) {
      let fallbackValue: Dynamic = await value(error, indexPath);
      if (fallbackValue !== undefined) return fallbackValue;
      throw readOptions.mayWrite !== true || getErrorHttpStatus(error) === 404
        ? getIndexFile()
        : new BootReadError(
            "unreadable",
            indexPath,
            indexPath + ": " + getErrorMessage(error),
            getErrorHttpStatus(error),
          );
    }
  }
  let index: Dynamic = 0;
  async function readProjectFiles(): Promise<Dynamic> {
    for (;;) {
      let indexFile: Dynamic = await readWithRetry(
        "_files.json",
        (): Dynamic => port.list(),
      );
      if (
        readOptions.mayWrite !== true ||
        !isNarrowedFileContext(indexFile, port) ||
        index >= retryWaits.length
      )
        return indexFile;
      let waitMs: Dynamic = retryWaits[index];
      index += 1;
      passes += 1;
      reportEvent({
        type: "boot-retry",
        path: "_files.json",
        attempt: index,
        reason: "narrowed",
        waitMs: waitMs,
      });
      await sleep(waitMs);
      try {
        readPort.forgetBootListing?.();
      } catch {}
    }
  }
  let callback: Dynamic =
      (path?: Dynamic): Dynamic =>
      async (): Promise<Dynamic> => {
        adoptQueuedVersion();
        let files: Dynamic = await port.list().catch((): Dynamic => {});
        return (
          files !== undefined &&
          !isNarrowedFileContext(files, port) &&
          !files.some((file?: Dynamic): Dynamic => file.path === path)
        );
      },
    fileVersion: Dynamic,
    entries: Dynamic = new Map(),
    fileHashes: Dynamic = new Map();
  for (let count: Dynamic = 1; ; count++) {
    adoptQueuedVersion();
    let version: Dynamic = port.version().version,
      listedFiles: Dynamic = await readProjectFiles(),
      isNarrowed: Dynamic = isNarrowedFileContext(listedFiles, port),
      indexEntries: Dynamic = new Map(
        listedFiles.map((file?: Dynamic): Dynamic => [file.path, file]),
      ),
      entry: Dynamic = indexEntries.get(indexPath);
    if (entry === undefined) {
      if (!isNarrowed)
        throw new BootReadError(
          "no_index",
          indexPath,
          indexPath + " is not in this artifact",
          undefined,
          false,
        );
      fileVersion = await readIndexFile();
    }
    for (let path of [...entries.keys()] as Dynamic) {
      let indexEntry: Dynamic = indexEntries.get(path);
      (indexEntry === undefined || !wantsFile(indexEntry)) &&
        (entries.delete(path), fileHashes.delete(path));
    }
    let filesToRead: Dynamic = [
      ...(entry !== undefined ? [entry] : []),
      ...listedFiles.filter(
        (file?: Dynamic): Dynamic =>
          file.path !== indexPath && wantsFile(file),
      ),
    ].filter(
      (file?: Dynamic): Dynamic => fileHashes.get(file.path) !== file.sha256,
    );
    await Promise.all(
      filesToRead.map(async (file?: Dynamic): Promise<Dynamic> => {
        let fileContent: Dynamic = await readWithRetry(
          file.path,
          (): Dynamic => port.readText(file.path),
          callback(file.path),
          (error?: Dynamic): Dynamic => value(error, file.path),
        );
        if (fileContent === null) {
          reportEvent({
            type: "boot-removed",
            path: file.path,
          });
          entries.delete(file.path);
          fileHashes.delete(file.path);
          file.path === indexPath && (fileVersion = undefined);
          return;
        }
        file.path === indexPath
          ? (fileVersion = fileContent)
          : entries.set(file.path, fileContent);
        fileHashes.set(file.path, file.sha256);
      }),
    );
    adoptQueuedVersion();
    let nextVersion: Dynamic = port.version().version;
    if (nextVersion === version || count >= maxPasses) {
      if (fileVersion === undefined)
        throw new BootReadError(
          "no_index",
          indexPath,
          indexPath + " was removed while the editor booted",
        );
      return {
        version: port.version(),
        listing: listedFiles,
        index: fileVersion,
        files: entries,
        retries: passes,
        passes: count,
        ...(isNarrowed
          ? {
              narrowed: true,
            }
          : {}),
      };
    }
    reportEvent({
      type: "boot-moved",
      from: version,
      to: nextVersion,
    });
  }
}
function classifyBootstrapFailure(error?: Dynamic): Dynamic {
  return error instanceof IndexFileError
    ? error.code === "newer_version"
      ? "newer_build"
      : error.code === "unreadable"
        ? "damaged_index"
        : "transient"
    : error instanceof BootReadError &&
        (error.code === "no_index" || error.code === "access_revoked")
      ? error.code
      : "transient";
}
function getBootstrapRetryDelay(error?: Dynamic, attempt?: Dynamic): Dynamic {
  let retryIndex: Dynamic = Number.isFinite(attempt)
    ? Math.floor(attempt)
    : 0;
  return isPermanentBootstrapFailure(error)
    ? undefined
    : BOOT_RETRY_BACKOFF_MS[
        Math.min(Math.max(0, retryIndex), BOOT_RETRY_BACKOFF_MS.length - 1)
      ];
}
function getRestartDelay(
  error?: Dynamic,
  update?: Dynamic,
  indexPath?: Dynamic,
  elapsedMs?: Dynamic,
): Dynamic {
  let failureCategory: Dynamic = classifyBootstrapFailure(error);
  if (failureCategory === "transient")
    return Math.max(0, BOOT_RETRY_BACKOFF_MS[0] - elapsedMs);
  if (
    !(
      failureCategory !== "access_revoked" &&
      !update.changed.some(
        (file?: Dynamic): Dynamic => file.path === indexPath,
      )
    )
  )
    return Math.max(0, DAMAGED_INDEX_RETRY_DELAY_MS - elapsedMs);
}
export {
  BOOT_READ_MAX_PASSES,
  BOOT_RETRY_BACKOFF_MS,
  BootReadError,
  classifyBootstrapFailure,
  DAMAGED_INDEX_RETRY_DELAY_MS,
  getBootstrapRetryDelay,
  getErrorHttpStatus,
  getErrorMessage,
  getRestartDelay,
  isPermanentBootstrapFailure,
  readBootFiles,
};
export function installPlatformBootReader(): () => void {
  return () => {
    BootReadError = class extends Error {
      declare name: Dynamic;
      code: Dynamic;
      path: Dynamic;
      status: Dynamic;
      narrowed: Dynamic;
      constructor(
        code: Dynamic,
        path: Dynamic,
        message: Dynamic,
        status: Dynamic,
        narrowed: Dynamic,
      ) {
        super(message);
        this.name = "BootReadError";
        this.code = code;
        this.path = path;
        this.status = status;
        this.narrowed = narrowed;
      }
    };
    BOOT_READ_MAX_PASSES = 6;
    getErrorHttpStatus = (error?: Dynamic): Dynamic => {
      let value: Dynamic = error?.status;
      return typeof value == "number" ? value : undefined;
    };
    getErrorMessage = (error?: Dynamic): Dynamic =>
      error instanceof Error ? error.message : String(error?.message ?? error);
    isPermanentBootstrapFailure = (error?: Dynamic): Dynamic =>
      classifyBootstrapFailure(error) !== "transient";
    BOOT_RETRY_BACKOFF_MS = [2e3, 4e3, 8e3, 15e3, 3e4, 6e4, 12e4, 3e5];
    DAMAGED_INDEX_RETRY_DELAY_MS = 6e4;
  };
}
