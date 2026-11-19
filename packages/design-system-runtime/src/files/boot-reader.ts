import type * as FilesCore from "../contracts/files-core";
import type * as Docs from "../contracts/design-system-document";
import type * as Boot from "../contracts/boot";
import type * as Model from "../contracts";
import type * as Storage from "../contracts/model-storage";
import type * as Dom from "../contracts/dom";
import type * as Host from "../contracts/platform-host";
import type * as React from "react";
/** Restored application module; prepare first, initialize in original order. */
import { IndexFileError } from "../editor/index-file-store";
import { BOOT_FILE_READ_RETRY_DELAYS_MS } from "./hot-updates";
import { FILE_FETCH_RETRY_DELAYS_MS, fileListingIsNarrowed, filesPortExtensions, isRetryableFileReadAccessError, retryFileRead } from "./paths";
import { currentHotReloadBridge } from "../host/hot-reload";

var BootReadError: Boot.BootReadConstructor;
var MAX_BOOT_EARLY_FILE_READ_PASSES: number;
var errorHttpStatus: (input: unknown) => number | undefined;
var errorMessage: (input: unknown) => string;
var isPermanentFilesBootFailure: (input: unknown) => boolean;
var FILES_BOOT_RECOVERY_DELAYS_MS: number[];
var FILES_BOOT_PERMANENT_RETRY_MS: number;
async function readFilesBootState(
  bootOptions: Boot.BootReaderOptions,
): Promise<Boot.BootReadResult> {
  let { port: port, indexPath: indexPath } = bootOptions,
    normalizedPort = filesPortExtensions(port),
    retryDelays = bootOptions.waits ?? BOOT_FILE_READ_RETRY_DELAYS_MS,
    wantsEarlySlide = bootOptions.wants ?? ((): boolean => false),
    timers = bootOptions.timers ?? {
      setTimeout: (bootInput, bootOptionsA) => setTimeout(bootInput, bootOptionsA),
    },
    earlyHotSource = bootOptions.early ?? currentHotReloadBridge(),
    value: number = Math.max(
      1,
      bootOptions.maxPasses ?? MAX_BOOT_EARLY_FILE_READ_PASSES,
    ),
    index = 0,
    callback = (bootInputA: Boot.BootReadEvent): void => {
      try {
        bootOptions.onEvent?.(bootInputA);
      } catch {}
    },
    bootHandler = (bootInputB: number) =>
      new Promise<void>((bootInputC) => void timers.setTimeout(bootInputC, bootInputB));
  function bootValue(): void {
    let bootValueA = earlyHotSource?.queued;
    if (bootValueA === undefined || bootValueA.length === 0) {
      return;
    }
    let bootValueB = bootValueA[bootValueA.length - 1];
    if (port.version().version === bootValueB.to.version) {
      return;
    }
    try {
      normalizedPort.noteAdopted?.(bootValueB.to, bootValueA[0].from);
    } catch {}
  }
  function bootState(bootInputD: unknown, bootOptionsB: string): Boot.BootReadException {
    if (bootInputD instanceof BootReadError) {
      return bootInputD;
    }
    let bootValueC = errorHttpStatus(bootInputD);
    if (
      (bootInputD as { code?: unknown } | null | undefined)?.code === "redirected"
    ) {
      return new BootReadError(
        "unreadable",
        bootOptionsB,
        bootOptionsB + ": " + errorMessage(bootInputD),
      );
    }
    return new BootReadError(
      bootValueC === 401 || bootValueC === 403 ? "access_revoked" : "unreadable",
      bootOptionsB,
      bootOptionsB + ": " + errorMessage(bootInputD),
      bootValueC,
    );
  }
  async function bootResult(
    bootInputE: unknown,
    bootOptionsC: string,
  ): Promise<Model.FileTextRead | undefined> {
    if (
      (bootInputE as { code?: unknown } | null | undefined)?.code !==
        "redirected" ||
      normalizedPort.readTextUnchecked === undefined
    ) {
      return;
    }
    try {
      let bootValueD = await normalizedPort.readTextUnchecked(bootOptionsC);
      callback({
        type: "boot-took-redirected",
        path: bootOptionsC,
      });
      return bootValueD;
    } catch {
      return;
    }
  }
  async function bootValueE<Value>(
    bootInputF: string,
    bootOptionsD: () => Promise<Value>,
    bootValueF?: () => Promise<boolean>,
    bootValueG?: (error: unknown) => Promise<Value | undefined>,
  ): Promise<Value | null> {
    for (let bootIndex: number = 0; ; bootIndex++) {
      try {
        return await bootOptionsD();
      } catch (bootValueH: unknown) {
        if (!isRetryableFileReadAccessError(bootValueH)) {
          throw bootState(bootValueH, bootInputF);
        }
        if (
          bootValueF !== undefined &&
          errorHttpStatus(bootValueH) === 404 &&
          (await bootValueF())
        ) {
          return null;
        }
        if (bootIndex >= retryDelays.length) {
          let bootValueI = await bootValueG?.(bootValueH);
          if (bootValueI !== undefined) {
            return bootValueI;
          }
          throw bootState(bootValueH, bootInputF);
        }
        index += 1;
        let bootValueJ = errorHttpStatus(bootValueH);
        callback({
          type: "boot-retry",
          path: bootInputF,
          attempt: bootIndex + 1,
          ...(bootValueJ !== undefined
            ? {
                status: bootValueJ,
              }
            : {}),
          waitMs: retryDelays[bootIndex],
        });
        await bootHandler(retryDelays[bootIndex]);
      }
    }
  }
  async function bootRead(): Promise<Model.FileTextRead> {
    let bootHandlerA = () =>
        new BootReadError(
          "no_index",
          indexPath,
          indexPath + " is not in this artifact",
          undefined,
          true,
        ),
      bootValueK =
        bootOptions.mayWrite === true
          ? retryDelays
          : FILE_FETCH_RETRY_DELAYS_MS;
    try {
      return await retryFileRead(
        () => port.readText(indexPath),
        timers,
        (bootInputG, bootOptionsE): void => {
          index += 1;
          callback({
            type: "boot-retry",
            path: indexPath,
            attempt: bootInputG,
            ...(errorHttpStatus(bootOptionsE) !== undefined
              ? {
                  status: errorHttpStatus(bootOptionsE),
                }
              : {}),
            waitMs: bootValueK[bootInputG - 1] ?? 0,
          });
        },
        bootValueK,
      );
    } catch (bootValueL: unknown) {
      let bootValueM = await bootResult(bootValueL, indexPath);
      if (bootValueM !== undefined) {
        return bootValueM;
      }
      if (bootOptions.mayWrite !== true || errorHttpStatus(bootValueL) === 404) {
        throw bootHandlerA();
      }
      throw new BootReadError(
        "unreadable",
        indexPath,
        indexPath + ": " + errorMessage(bootValueL),
        errorHttpStatus(bootValueL),
      );
    }
  }
  let bootIndexA = 0;
  async function bootListing(): Promise<Model.FileListing> {
    for (;;) {
      let bootValueN = (await bootValueE("_files.json", () =>
        port.list(),
      )) as Model.FileListing;
      if (
        bootOptions.mayWrite !== true ||
        !fileListingIsNarrowed(bootValueN, port) ||
        bootIndexA >= retryDelays.length
      ) {
        return bootValueN;
      }
      let bootValueO = retryDelays[bootIndexA];
      bootIndexA += 1;
      index += 1;
      callback({
        type: "boot-retry",
        path: "_files.json",
        attempt: bootIndexA,
        reason: "narrowed",
        waitMs: bootValueO,
      });
      await bootHandler(bootValueO);
      try {
        normalizedPort.forgetBootListing?.();
      } catch {}
    }
  }
  let bootHandlerB = (bootInputH: string) => async () => {
      bootValue();
      let bootValueP = await port.list().catch((): void => {
        return;
      });
      return (
        bootValueP !== undefined &&
        !fileListingIsNarrowed(bootValueP, port) &&
        !bootValueP.some((bootInputI): boolean => bootInputI.path === bootInputH)
      );
    },
    bootData: Model.FileTextRead | undefined,
    entries = new Map<string, Model.FileTextRead>(),
    bootEntries = new Map<string, string>();
  for (let count: number = 1; ; count++) {
    bootValue();
    let version = port.version().version,
      bootValueQ = await bootListing(),
      bootValueR = fileListingIsNarrowed(bootValueQ, port),
      bootEntriesA = new Map(bootValueQ.map((bootInputJ) => [bootInputJ.path, bootInputJ])),
      entry = bootEntriesA.get(indexPath);
    if (entry === undefined) {
      if (!bootValueR) {
        throw new BootReadError(
          "no_index",
          indexPath,
          indexPath + " is not in this artifact",
          undefined,
          false,
        );
      }
      bootData = await bootRead();
    }
    for (let bootValueS of [...entries.keys()]) {
      let bootValueT = bootEntriesA.get(bootValueS);
      if (bootValueT === undefined || !wantsEarlySlide(bootValueT)) {
        entries.delete(bootValueS);
        bootEntries.delete(bootValueS);
      }
    }
    let bootValueU = [
      ...(entry !== undefined ? [entry] : []),
      ...bootValueQ.filter(
        (bootInputK) => bootInputK.path !== indexPath && wantsEarlySlide(bootInputK),
      ),
    ].filter((bootInputL): boolean => bootEntries.get(bootInputL.path) !== bootInputL.sha256);
    await Promise.all(
      bootValueU.map(async (bootInputM): Promise<void> => {
        let bootValueV = await bootValueE(
          bootInputM.path,
          () => port.readText(bootInputM.path),
          bootHandlerB(bootInputM.path),
          (bootInputN) => bootResult(bootInputN, bootInputM.path),
        );
        if (bootValueV === null) {
          callback({
            type: "boot-removed",
            path: bootInputM.path,
          });
          entries.delete(bootInputM.path);
          bootEntries.delete(bootInputM.path);
          if (bootInputM.path === indexPath) {
            bootData = undefined;
          }
          return;
        }
        if (bootInputM.path === indexPath) {
          bootData = bootValueV;
        } else {
          entries.set(bootInputM.path, bootValueV);
        }
        bootEntries.set(bootInputM.path, bootInputM.sha256);
      }),
    );
    bootValue();
    let bootValueW = port.version().version;
    if (bootValueW === version || count >= value) {
      if (bootData === undefined) {
        throw new BootReadError(
          "no_index",
          indexPath,
          indexPath + " was removed while the editor booted",
        );
      }
      return {
        version: port.version(),
        listing: bootValueQ,
        index: bootData,
        files: entries,
        retries: index,
        passes: count,
        ...(bootValueR
          ? {
              narrowed: true,
            }
          : {}),
      };
    }
    callback({
      type: "boot-moved",
      from: version,
      to: bootValueW,
    });
  }
}
function classifyFilesBootFailure(error: unknown): Boot.BootFailureClass {
  if (error instanceof IndexFileError) {
    if (error.code === "newer_version") {
      return "newer_build";
    } else {
      if (error.code === "unreadable") {
        return "damaged_index";
      } else {
        return "transient";
      }
    }
  }
  if (error instanceof BootReadError) {
    if (error.code === "no_index" || error.code === "access_revoked") {
      return error.code;
    } else {
      return "transient";
    }
  }
  return "transient";
}
function getBootstrapRetryDelay(
  bootInputO: unknown,
  bootOptionsF: number,
): number | undefined {
  let value: number = Number.isFinite(bootOptionsF) ? Math.floor(bootOptionsF) : 0;
  if (isPermanentFilesBootFailure(bootInputO)) {
    return undefined;
  } else {
    return FILES_BOOT_RECOVERY_DELAYS_MS[
      Math.min(Math.max(0, value), FILES_BOOT_RECOVERY_DELAYS_MS.length - 1)
    ];
  }
}
function filesBootRetryDelayForHotUpdate(
  error: unknown,
  change: Model.FileRemoteChange,
  indexPath: string,
  elapsedMs: number,
): number | undefined {
  let classification = classifyFilesBootFailure(error);
  if (classification === "transient") {
    return Math.max(0, FILES_BOOT_RECOVERY_DELAYS_MS[0] - elapsedMs);
  }
  if (
    classification !== "access_revoked" &&
    !change.changed.some((bootInputP): boolean => bootInputP.path === indexPath)
  ) {
    return;
  }
  return Math.max(0, FILES_BOOT_PERMANENT_RETRY_MS - elapsedMs);
}
export {
  BootReadError,
  classifyFilesBootFailure,
  errorHttpStatus,
  errorMessage,
  FILES_BOOT_PERMANENT_RETRY_MS,
  FILES_BOOT_RECOVERY_DELAYS_MS,
  filesBootRetryDelayForHotUpdate,
  getBootstrapRetryDelay,
  isPermanentFilesBootFailure,
  MAX_BOOT_EARLY_FILE_READ_PASSES,
  readFilesBootState,
};
export function installFilesBootReader(): () => void {
  return () => {
    BootReadError = class BootReadError extends Error {
      declare name: string;
      code: Boot.BootReadException["code"];
      path: string;
      status: number | undefined;
      narrowed: boolean | undefined;
      constructor(
        bootInputQ: Boot.BootReadException["code"],
        bootOptionsG: string,
        bootValueX: string,
        bootValueY?: number,
        bootValueZ?: boolean,
      ) {
        super(bootValueX);
        this.name = "BootReadError";
        this.code = bootInputQ;
        this.path = bootOptionsG;
        this.status = bootValueY;
        this.narrowed = bootValueZ;
      }
    };
    MAX_BOOT_EARLY_FILE_READ_PASSES = 6;
    errorHttpStatus = (bootInputR) => {
      let value = (bootInputR as { status?: unknown } | null | undefined)?.status;
      if (typeof value === "number") {
        return value;
      } else {
        return undefined;
      }
    };
    errorMessage = (bootInputS) =>
      bootInputS instanceof Error
        ? bootInputS.message
        : String(
            (bootInputS as { message?: unknown } | null | undefined)?.message ??
              bootInputS,
          );
    isPermanentFilesBootFailure = (bootInputT): boolean =>
      classifyFilesBootFailure(bootInputT) !== "transient";
    FILES_BOOT_RECOVERY_DELAYS_MS = [
      2000, 4000, 8000, 15000, 30000, 60000, 120000, 300000,
    ];
    FILES_BOOT_PERMANENT_RETRY_MS = 60000;
  };
}
