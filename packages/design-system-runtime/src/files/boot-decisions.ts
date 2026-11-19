import { uiMessage } from '@minedesign/contracts/ui-messages';
import type * as Boot from "../contracts/boot";
import type * as Model from "../contracts";
import type * as Storage from "../contracts/model-storage";
import type * as Dom from "../contracts/dom";
import type * as Host from "../contracts/platform-host";
import type * as React from "react";
/** Restored application module; prepare first, initialize in original order. */
import { isCiLastChange, parseLastChange } from "../model/last-change";
import { SYSTEM_COLLECTION, SYSTEM_META_DOCUMENT_PATH } from "../model/stored-file-codec";

var STORE_META_READ_TIMEOUT_MS: number;
var STORE_META_LOADING_NOTICE_MS: number;
var STORE_META_RETRY_MS: number;
var PIPELINE_READONLY_MESSAGE: string;
var MIGRATED_READONLY_MESSAGE: string;
var DESIGN_SYSTEM_CHANGED_MESSAGE: string;
var DESIGN_SYSTEM_READONLY_MESSAGE: string;
var storeMetaFaultCode: (input: unknown) => string;
var presentStoreMeta: (input: unknown) => Boot.MetaOutcome;
var STORE_MODE_DECISION_TIMEOUT_MS: number;
var FILES_UNREADABLE_MESSAGE: string;
var MOVED_RELOAD_MESSAGE: string;
var PARTIAL_DESIGN_SYSTEM_MESSAGE: string;
var DUPLICATE_FILE_INDEX_MESSAGE: string;
var INVALID_PROJECT_INDEX_MESSAGE: string;
var OLDER_COPY_READONLY_MESSAGE: string;
var MIGRATION_OTHER_TAB_WAIT_MS: number;
var MIGRATION_RUNNING_MESSAGE: string;
var DESIGN_SYSTEM_SETUP_MESSAGE: string;
var REOPEN_FAILED_MESSAGE: string;
var BOOT_LIVE_NOTICE_MESSAGES: Set<string>;
async function readAuthoritativeStoreMeta(
  readOptions: Boot.MetaReadOptions,
  timeoutMs: number = STORE_META_READ_TIMEOUT_MS,
  timers: Boot.TimerPair = globalThis,
): Promise<Boot.MetaOutcome> {
  let getMeta = readOptions.handle?.doc(SYSTEM_META_DOCUMENT_PATH).get;
  if (typeof getMeta !== "function") {
    return readStoreMetaThroughSubscription(readOptions.port, timeoutMs, timers);
  }
  let timeout: ReturnType<typeof setTimeout> | undefined;
  try {
    return await Promise.race([
      getMeta
        .call(readOptions.handle?.doc(SYSTEM_META_DOCUMENT_PATH))
        .then(
          (
            snapshot: Boot.NativeLegacyDocumentSnapshot,
          ): Boot.MetaOutcome | Promise<Boot.MetaOutcome> =>
            snapshot.exists
              ? presentStoreMeta(snapshot.data?.())
              : snapshot.metadata?.fromCache === true
                ? readStoreMetaThroughSubscription(
                    readOptions.port,
                    timeoutMs,
                    timers,
                  )
                : {
                    state: "absent",
                  },
          (error: unknown): Boot.MetaOutcome => ({
            state: "unavailable",
            fault: storeMetaFaultCode(error),
          }),
        ),
      new Promise<Boot.MetaOutcome>(
        (resolve) =>
          (timeout = timers.setTimeout(
            () =>
              resolve({
                state: "unavailable",
                fault: "timeout",
              }),
            timeoutMs,
          )),
      ),
    ]);
  } finally {
    timers.clearTimeout(timeout);
  }
}
function readStoreMetaThroughSubscription(
  port: Storage.DatabasePort,
  timeoutMs: number,
  timers: Boot.TimerPair,
): Promise<Boot.MetaOutcome> {
  return new Promise<Boot.MetaOutcome>((resolve): void => {
    let flag: boolean = false,
      value: { data: unknown } | null = null,
      cancelWait: (() => void) | undefined,
      callback = (outcome: Boot.MetaOutcome): void => {
        if (flag) {
          return;
        }
        flag = true;
        timers.clearTimeout(timeoutId);
        queueMicrotask(() => cancelWait?.());
        resolve(outcome);
      },
      timeoutId = timers.setTimeout(
        () =>
          callback({
            state: "unavailable",
            fault: "timeout",
          }),
        timeoutMs,
      );
    cancelWait = port.subscribe(
      SYSTEM_COLLECTION,
      (snapshots, changeOptions): void => {
        for (let snapshot of snapshots) {
          if (snapshot.path === SYSTEM_META_DOCUMENT_PATH) {
            value =
              snapshot.type !== "removed"
                ? {
                    data: snapshot.data,
                  }
                : null;
          }
        }
        if (value !== null) {
          callback(presentStoreMeta(value.data));
        } else if (!changeOptions.fromCache) {
          callback({
            state: "absent",
          });
        }
      },
      (error) =>
        callback({
          state: "unavailable",
          fault: error.code,
        }),
    );
    if (flag) {
      cancelWait!();
    }
  });
}
function lastChangeIsImported(lastChange: unknown): boolean {
  return isCiLastChange(
    parseLastChange(lastChange).value,
  );
}
function chooseDesignSystemFileHome(
  homes: Boot.FileHomes,
): Boot.FileHomeDecision {
  let defaults = {
    ignoredRoot: false,
    ignoredSingleFile: false,
    strayRoot: false,
    twoIndexes: false,
    unread: false,
    asGoodAsMissing: false,
  };
  if (homes.project === "unread" || homes.root === "unread") {
    return {
      at: "none",
      ...defaults,
      unread: true,
    };
  }
  let sameMarkedRoot = homes.root === "marked" && homes.sameText === true;
  if (homes.project === "marked") {
    return {
      at: "project",
      ...defaults,
      ignoredRoot: homes.root !== "absent" && !sameMarkedRoot,
      ignoredSingleFile: homes.root === "envelope",
      twoIndexes: homes.root === "marked" && !sameMarkedRoot,
    };
  }
  if (homes.root === "marked" || homes.root === "envelope") {
    return {
      at: "root",
      ...defaults,
    };
  }
  return {
    at: "none",
    ...defaults,
    strayRoot: homes.root === "unmarked",
    asGoodAsMissing: homes.root === "absent" || homes.root === "unmarked",
  };
}
async function chooseDesignSystemBootMode(
  bootOptions: Boot.BootModeOptions,
): Promise<"files" | "tree" | "start-tree" | "readonly-store"> {
  if (bootOptions.typePage) {
    return "files";
  }
  if (bootOptions.origin === "instance" && bootOptions.ownLayout === "tree") {
    return "tree";
  }
  let missingOwnState =
    bootOptions.origin === "demo" && bootOptions.stateFileFound === false;
  if (
    missingOwnState &&
    bootOptions.storeAbsent &&
    !bootOptions.forcedReadOnly &&
    (await bootOptions.mayStartOnFiles())
  ) {
    return "start-tree";
  }
  if (
    missingOwnState &&
    !bootOptions.emulator &&
    (!bootOptions.storeAbsent || bootOptions.forcedReadOnly)
  ) {
    return "readonly-store";
  }
  return "files";
}
function chooseTreeBootOutcome(
  treeOptions: Boot.TreeBootOptions,
): Boot.TreeBootOutcome {
  if (treeOptions.project === "unread") {
    return {
      boot: "readonly",
      reason: uiMessage("design-system.bootDecisions.couldnTReadThisDesign"),
    };
  }
  if (treeOptions.origin === "instance" && treeOptions.tree) {
    return {
      boot: "tree",
      ...(treeOptions.pipeline
        ? {
            readOnly: uiMessage("design-system.bootDecisions.thisDesignSystemIsKept"),
          }
        : treeOptions.editingOff
          ? {
              readOnly: uiMessage("design-system.bootDecisions.migratedFromTheStandaloneVersion"),
            }
          : {}),
    };
  }
  if (treeOptions.project === "marked") {
    return {
      boot: "failed",
    };
  }
  if (treeOptions.project !== "absent") {
    return {
      boot: "readonly",
      reason: INVALID_PROJECT_INDEX_MESSAGE,
    };
  }
  return {
    boot: "empty",
    ...(treeOptions.pipeline
      ? {
          readOnly: uiMessage("design-system.bootDecisions.thisDesignSystemIsKept"),
        }
      : {}),
  };
}
async function mayInitializeEmptyFilesStore(
  initOptions: Boot.MayInitializeOptions,
): Promise<boolean> {
  if (!initOptions.canReopen || initOptions.automation || initOptions.pipeline) {
    return false;
  }
  if (!(await initOptions.switchOn())) {
    return false;
  }
  return initOptions.canWrite();
}
function isRecentSingleFileMoveNote(moveOptions: {
  singleFileHere: boolean;
  canReopen: boolean;
  noteAt: number | null | undefined;
  now: number;
}): boolean {
  return (
    moveOptions.singleFileHere &&
    moveOptions.canReopen &&
    moveOptions.noteAt !== null &&
    Number.isFinite(moveOptions.noteAt) &&
    moveOptions.now - (moveOptions.noteAt as number) >= 0 &&
    moveOptions.now - (moveOptions.noteAt as number) < 60000
  );
}
function holdCleanSingleFileForMigration(holdOptions: {
  clean(): boolean;
  leaveNote(): boolean | undefined;
  hold(): void;
}): boolean {
  if (!holdOptions.clean() || !holdOptions.leaveNote()) {
    return false;
  }
  holdOptions.hold();
  return true;
}
function completeSingleFileMigrationBoot(
  migrationOptions: Boot.CompleteMigrationOptions,
): void {
  if (migrationOptions.end === "landed") {
    return;
  }
  if (migrationOptions.end === "busy") {
    return migrationOptions.waitForTheirs();
  }
  migrationOptions.skip();
  if (migrationOptions.notice !== undefined) {
    migrationOptions.carryNotice(migrationOptions.notice);
  }
  if (migrationOptions.end === "restart") {
    migrationOptions.restart();
  } else {
    migrationOptions.reload();
  }
}
function singleFileMigrationExit(
  outcome: Boot.MigrationOutcome,
  indexState: string,
): Boot.MigrationExit {
  if (indexState === "marked") {
    return "landed";
  }
  if (outcome.result === "busy") {
    return "busy";
  }
  let publishedBeforeFailure =
      outcome.result === "aborted" &&
      (outcome.stage === "publish" ||
        outcome.stage === "recheck" ||
        outcome.stage === "sentinel" ||
        outcome.stage === "tombstone"),
    alreadyMoved =
      outcome.result === "skipped" &&
      (outcome.reason === "already_moved" ||
        outcome.reason === "already_files");
  if (
    outcome.result === "converted" ||
    indexState === "unreadable" ||
    publishedBeforeFailure ||
    alreadyMoved ||
    outcome.code === "conflict"
  ) {
    return "restart";
  } else {
    return "reload";
  }
}
function isRecentMigrationAttempt(attemptOptions: {
  runningAt: number | null | undefined;
  now: number;
}): boolean {
  return (
    attemptOptions.runningAt !== null &&
    Number.isFinite(attemptOptions.runningAt) &&
    attemptOptions.now - (attemptOptions.runningAt as number) >= 0 &&
    attemptOptions.now - (attemptOptions.runningAt as number) < 600000
  );
}
function migrationOtherTabWaitOutcome(otherTabOptions: {
  movedTo: boolean;
  waitedMs: number;
}): "landed" | "wait" | "gave-up" {
  if (otherTabOptions.movedTo) {
    return "landed";
  } else {
    if (otherTabOptions.waitedMs < MIGRATION_OTHER_TAB_WAIT_MS) {
      return "wait";
    } else {
      return "gave-up";
    }
  }
}
function readRecentMigrationNotice(
  text: string | null,
  now: number,
): string | null {
  try {
    let value =
      text === null
        ? null
        : (JSON.parse(text) as { at?: unknown; words?: unknown } | null);
    if (
      typeof value?.at === "number" &&
      typeof value.words === "string" &&
      now - value.at >= 0 &&
      now - value.at < 300000
    ) {
      return value.words;
    } else {
      return null;
    }
  } catch {
    return null;
  }
}
async function mayMigrateDesignSystem(
  migrationOptions: Boot.MayMigrateOptions,
): Promise<boolean> {
  if (
    migrationOptions.typeHost ||
    migrationOptions.pipeline ||
    lastChangeIsImported(migrationOptions.lastChange) ||
    migrationOptions.automation ||
    migrationOptions.skipped ||
    !migrationOptions.canReopen
  ) {
    return false;
  }
  if (!(await migrationOptions.switchOn())) {
    return false;
  }
  return migrationOptions.canWrite();
}
function mountInitializedFilesOutcome(mountOptions: {
  started: string;
  mount(message: string): void;
  reopen(): void;
  reload(): void;
}): boolean {
  if (mountOptions.started === "no") {
    return false;
  }
  if (mountOptions.started === "exists" || mountOptions.started === "unsure") {
    mountOptions.mount(uiMessage("design-system.bootDecisions.couldnTReadThisDesign"));
  } else if (
    (mountOptions.mount(uiMessage("design-system.bootDecisions.thisDesignSystemIsBeing2")),
    mountOptions.started === "created")
  ) {
    mountOptions.reopen();
  } else {
    mountOptions.reload();
  }
  return true;
}
function resolveMigratedReadonlyReason(
  reason: string | undefined,
  access: Host.WriteAccess | undefined,
): string | undefined {
  if (
    reason !== MIGRATED_READONLY_MESSAGE ||
    access === undefined ||
    access.canWrite
  ) {
    return reason;
  }
  return access.reason ?? uiMessage("design-system.bootDecisions.thisDesignSystemCanT");
}
function editingOffTransition(transitionOptions: {
  offAtBoot: boolean;
  offNow: boolean;
  canWrite: boolean;
}): "on" | "off" | null {
  if (transitionOptions.offAtBoot) {
    if (transitionOptions.offNow) {
      return null;
    } else {
      return "on";
    }
  }
  if (transitionOptions.offNow && transitionOptions.canWrite) {
    return "off";
  } else {
    return null;
  }
}
function restartWithReloadFallback(restartOptions: Boot.RestartFallback): void {
  if (restartOptions.restart === undefined) {
    return restartOptions.ask();
  }
  try {
    restartOptions.restart({
      note: restartOptions.note,
    });
  } catch {
    return restartOptions.ask();
  }
  restartOptions.setTimeout(restartOptions.ask, restartOptions.watchdogMs);
}
function get_PIPELINE_READONLY_MESSAGE() {
  return uiMessage("design-system.bootDecisions.thisDesignSystemIsKept");
}
function get_MIGRATED_READONLY_MESSAGE() {
  return uiMessage("design-system.bootDecisions.migratedFromTheStandaloneVersion");
}
function get_DESIGN_SYSTEM_CHANGED_MESSAGE() {
  return uiMessage("design-system.bootDecisions.thisDesignSystemHasChanged");
}
function get_DESIGN_SYSTEM_READONLY_MESSAGE() {
  return uiMessage("design-system.bootDecisions.thisDesignSystemCanT");
}
function get_FILES_UNREADABLE_MESSAGE() {
  return uiMessage("design-system.bootDecisions.couldnTReadThisDesign");
}
function get_MOVED_RELOAD_MESSAGE() {
  return uiMessage("design-system.bootDecisions.thisDesignSystemNowSaves");
}
function get_PARTIAL_DESIGN_SYSTEM_MESSAGE() {
  return uiMessage("design-system.bootDecisions.partOfThisDesignSystem");
}
function get_DUPLICATE_FILE_INDEX_MESSAGE() {
  return uiMessage("design-system.bootDecisions.thisDesignSystemHasTwo");
}
function get_OLDER_COPY_READONLY_MESSAGE() {
  return uiMessage("design-system.bootDecisions.anOlderCopyOfThis");
}
function get_MIGRATION_RUNNING_MESSAGE() {
  return uiMessage("design-system.bootDecisions.thisDesignSystemIsBeing");
}
function get_DESIGN_SYSTEM_SETUP_MESSAGE() {
  return uiMessage("design-system.bootDecisions.thisDesignSystemIsBeing2");
}
function get_REOPEN_FAILED_MESSAGE() {
  return uiMessage("design-system.bootDecisions.thisDesignSystemDidNot");
}
export {
  BOOT_LIVE_NOTICE_MESSAGES,
  chooseDesignSystemBootMode,
  chooseDesignSystemFileHome,
  chooseTreeBootOutcome,
  completeSingleFileMigrationBoot,
  get_DESIGN_SYSTEM_CHANGED_MESSAGE,
  get_DESIGN_SYSTEM_READONLY_MESSAGE,
  get_DESIGN_SYSTEM_SETUP_MESSAGE,
  get_DUPLICATE_FILE_INDEX_MESSAGE,
  editingOffTransition,
  get_FILES_UNREADABLE_MESSAGE,
  holdCleanSingleFileForMigration,
  INVALID_PROJECT_INDEX_MESSAGE,
  isRecentMigrationAttempt,
  isRecentSingleFileMoveNote,
  lastChangeIsImported,
  mayInitializeEmptyFilesStore,
  mayMigrateDesignSystem,
  get_MIGRATED_READONLY_MESSAGE,
  MIGRATION_OTHER_TAB_WAIT_MS,
  get_MIGRATION_RUNNING_MESSAGE,
  migrationOtherTabWaitOutcome,
  mountInitializedFilesOutcome,
  get_MOVED_RELOAD_MESSAGE,
  get_OLDER_COPY_READONLY_MESSAGE,
  get_PARTIAL_DESIGN_SYSTEM_MESSAGE,
  get_PIPELINE_READONLY_MESSAGE,
  presentStoreMeta,
  readAuthoritativeStoreMeta,
  readRecentMigrationNotice,
  readStoreMetaThroughSubscription,
  get_REOPEN_FAILED_MESSAGE,
  resolveMigratedReadonlyReason,
  restartWithReloadFallback,
  singleFileMigrationExit,
  STORE_META_LOADING_NOTICE_MS,
  STORE_META_READ_TIMEOUT_MS,
  STORE_META_RETRY_MS,
  STORE_MODE_DECISION_TIMEOUT_MS,
  storeMetaFaultCode,
};
export function installFilesBootDecisions(): () => void {
  return () => {
    STORE_META_READ_TIMEOUT_MS = 8000;
    STORE_META_LOADING_NOTICE_MS = 30000;
    STORE_META_RETRY_MS = 1e4;
    PIPELINE_READONLY_MESSAGE =
      "This design system is kept up to date automatically from the codebase, so it can’t be edited here.";
    MIGRATED_READONLY_MESSAGE =
      "Migrated from the standalone version. It can’t be edited here until it is cleaned up.";
    DESIGN_SYSTEM_CHANGED_MESSAGE =
      "This design system has changed. The page reopens in a moment.";
    DESIGN_SYSTEM_READONLY_MESSAGE = "This design system can’t be edited here.";
    storeMetaFaultCode = (error) => {
      let value = (error as { code?: unknown } | null | undefined)?.code;
      if (typeof value === "string") {
        return value;
      } else {
        return "error";
      }
    };
    presentStoreMeta = (metadata) =>
      typeof metadata === "object" &&
      metadata !== null &&
      Object.keys(metadata).length > 0
        ? {
            state: "present",
            meta: metadata,
          }
        : {
            state: "present",
          };
    STORE_MODE_DECISION_TIMEOUT_MS = 1500;
    FILES_UNREADABLE_MESSAGE =
      "Couldn’t read this design system’s files. Reload to try again.";
    MOVED_RELOAD_MESSAGE =
      "This design system now saves in a newer way. Reload the page to keep editing it.";
    // MineDesign: user-facing copy calls the agent "the agent", not Claude.
    PARTIAL_DESIGN_SYSTEM_MESSAGE =
      "Part of this design system could not be found just now, so editing is off, and what is shown here may be out of date or incomplete. Reload to try again; if it stays like this, ask the agent to restore this design system’s design-system.json from its version history.";
    DUPLICATE_FILE_INDEX_MESSAGE =
      "This design system has two different lists of its files, so editing is off until one of them is removed. Ask the agent to compare project/design-system.json with design-system.json and remove the one that is out of date.";
    INVALID_PROJECT_INDEX_MESSAGE =
      "project/design-system.json isn’t a valid file list. Ask the agent to repair it.";
    OLDER_COPY_READONLY_MESSAGE =
      "An older copy of this design system was saved over the current one, so editing is off here. Ask the agent to compare the two and put back the one you want.";
    MIGRATION_OTHER_TAB_WAIT_MS = 150000;
    MIGRATION_RUNNING_MESSAGE =
      "This design system is being moved to a newer way of saving. The page reopens when that is done.";
    DESIGN_SYSTEM_SETUP_MESSAGE =
      "This design system is being set up. The page reopens in a few seconds; if it does not, reload the page.";
    REOPEN_FAILED_MESSAGE =
      "This design system did not reopen by itself. Reload the page to start editing it.";
    BOOT_LIVE_NOTICE_MESSAGES = new Set([
      uiMessage("design-system.bootDecisions.thisDesignSystemIsBeing"),
      uiMessage("design-system.bootDecisions.partOfThisDesignSystem"),
      uiMessage("design-system.bootDecisions.thisDesignSystemNowSaves"),
      uiMessage("design-system.bootDecisions.thisDesignSystemIsBeing2"),
      uiMessage("design-system.bootDecisions.anOlderCopyOfThis"),
    ]);
  };
}
