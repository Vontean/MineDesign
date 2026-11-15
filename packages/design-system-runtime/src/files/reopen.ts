import { uiMessage } from '@minedesign/contracts/ui-messages';
import type * as FilesCore from "../contracts/files-core";
import type * as Docs from "../contracts/design-system-document";
import type * as Boot from "../contracts/boot";
import type * as Model from "../contracts";
import type * as Storage from "../contracts/model-storage";
import type * as Dom from "../contracts/dom";
import type * as Host from "../contracts/platform-host";
import type * as React from "react";
/** Restored application module; prepare first, initialize in original order. */
import { showEditorPromiseNotification } from "../editor/editable-name";
import { BOOT_LIVE_NOTICE_MESSAGES, get_DESIGN_SYSTEM_CHANGED_MESSAGE, get_MIGRATION_RUNNING_MESSAGE, get_MOVED_RELOAD_MESSAGE, get_OLDER_COPY_READONLY_MESSAGE, get_PARTIAL_DESIGN_SYSTEM_MESSAGE, get_REOPEN_FAILED_MESSAGE, restartWithReloadFallback } from "./boot-decisions";
import { canRestartArtifact } from "./hot-updates";
import { announceAndWaitToReopen, announceReopenedArtifact } from "./initialize-store";
import { restoreReopenedFocus } from "./migration-editing-hold";
import { setAutosaveInstaller } from "../model/system-store";
import { announceLiveMessage } from "../ui/announcements";

var MIGRATION_DONE_REOPEN_MESSAGE: string;
var MIGRATION_ENDED_REOPEN_MESSAGE: string;
var MIGRATION_STARTING_REOPEN_MESSAGE: string;
var EDITABLE_DESIGN_SYSTEM_REOPENED_MESSAGE: string;
var DESIGN_SYSTEM_REOPENED_MESSAGE: string;
var BOOT_LIVE_ANNOUNCEMENT_MESSAGES: Map<string, string>;
var activeDesignSystemDocument: Boot.ActiveDocument | undefined;
var legacyDesignSystemDocument: Boot.ActiveDocument | undefined;
var legacyDesignSystemIsBusy: () => boolean;
var activeDesignSystemHasUnsentEdits: () => boolean;
var lastDesignSystemTypingAt: number;
var designSystemTypingListenerInstalled: boolean;
var safeReopenSessionStorage: () => globalThis.Storage | undefined;
var designSystemRestartFunction: () =>
  | ((options: { note: string }) => void)
  | undefined;
var DEFAULT_RELOAD_MESSAGE: string;
var announceReloadRequired: (input?: string) => void;
var DESIGN_SYSTEM_REOPEN_WATCHDOG_MS: number;
var designSystemReopenPending: boolean;
var singleFileMigrationRunning: boolean;
function installDesignSystemTypingListener(): void {
  if (designSystemTypingListenerInstalled || typeof window === "undefined") {
    return;
  }
  designSystemTypingListenerInstalled = true;
  (window as Host.ProtocolGlobal).addEventListener(
    "keydown",
    (event): void => {
      let target = event.target as
        | (Element & { isContentEditable?: boolean })
        | null;
      if (
        target !== null &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable)
      ) {
        lastDesignSystemTypingAt = Date.now();
      }
    },
    true,
  );
}
function restartDesignSystemWithFallback(message?: string): void {
  (0, restartWithReloadFallback)({
    restart: designSystemRestartFunction(),
    note: "design system keeps its content as files",
    ask: () => announceReloadRequired(message),
    watchdogMs: DESIGN_SYSTEM_REOPEN_WATCHDOG_MS,
    setTimeout: (input: () => void, options: number) =>
      setTimeout(input, options),
  });
}
function reopenForEditingTransition(transition: "on" | "off"): void {
  if (designSystemReopenPending) {
    return;
  }
  let restart = designSystemRestartFunction();
  if (restart === undefined) {
    if (transition === "on") {
      designSystemReopenPending = true;
      announceReloadRequired(get_REOPEN_FAILED_MESSAGE());
    }
    return;
  }
  designSystemReopenPending = true;
  installDesignSystemTypingListener();
  let fallback = (): void => {
    designSystemReopenPending = false;
    if (transition === "on") {
      announceReloadRequired(get_REOPEN_FAILED_MESSAGE());
    }
  };
  (0, announceAndWaitToReopen)({
    say: (input: string) => (0, announceLiveMessage)(input),
    message: get_DESIGN_SYSTEM_CHANGED_MESSAGE(),
    isTyping: (): boolean => Date.now() - lastDesignSystemTypingAt < 2000,
    hasUnsentEdits: activeDesignSystemHasUnsentEdits,
    reopen: () =>
      (0, restartWithReloadFallback)({
        restart: restart,
        note:
          uiMessage("design-system.reopen.designSystemTheEditingOff") +
          (transition === "on" ? "removed" : "added"),
        ask: fallback,
        watchdogMs: DESIGN_SYSTEM_REOPEN_WATCHDOG_MS,
        setTimeout: (input: () => void, options: number) =>
          setTimeout(input, options),
      }),
    timers: {
      setTimeout: (input: () => void, options: number) =>
        setTimeout(input, options),
      clearTimeout: (input: ReturnType<typeof setTimeout> | undefined) =>
        clearTimeout(input),
      now: (): number => Date.now(),
    },
    note: {
      store: safeReopenSessionStorage(),
      get why() { return ("editing_") + (transition); },
      focus: location.hash.replace(/^#/, ""),
    },
  });
}
function reopenAfterFilesMigration(
  why: string,
  restart: boolean = true,
  message?: string,
  fallbackMessage?: string,
): void {
  if (designSystemReopenPending) {
    return;
  }
  designSystemReopenPending = true;
  let plainReload = !restart || why === "found_on_files";
  if (!plainReload && designSystemRestartFunction() === undefined) {
    let index = 0;
    try {
      let value = (
        JSON.parse(
          sessionStorage.getItem("ds-moved-reloads") ?? "[]",
        ) as unknown[]
      ).filter((input): boolean => Date.now() - (input as number) < 60000);
      index = value.length;
      sessionStorage.setItem(
        "ds-moved-reloads",
        JSON.stringify([...value, Date.now()]),
      );
    } catch {
      index = 2;
    }
    if (index >= 2) {
      return announceReloadRequired();
    }
    location.reload();
    return;
  }
  installDesignSystemTypingListener();
  try {
    activeDesignSystemDocument?.flushNow?.();
    activeDesignSystemDocument?.save?.();
  } catch {}
  let saveDeadline = Date.now() + 30000,
    reopen = (): void => {
      if (activeDesignSystemHasUnsentEdits() && Date.now() < saveDeadline) {
        setTimeout(reopen, 500);
        return;
      }
      if (plainReload) {
        location.reload();
      } else {
        restartDesignSystemWithFallback(fallbackMessage);
      }
    };
  (0, announceAndWaitToReopen)({
    say: (input: string) => (0, announceLiveMessage)(input),
    message:
      message ??
      (restart
        ? uiMessage("design-system.reopen.thisDesignSystemHasMoved")
        : uiMessage("design-system.reopen.theMoveOfThisDesign")),
    isTyping: (): boolean => Date.now() - lastDesignSystemTypingAt < 2000,
    hasUnsentEdits: activeDesignSystemHasUnsentEdits,
    reopen: reopen,
    timers: {
      setTimeout: (input: () => void, options: number) =>
        setTimeout(input, options),
      clearTimeout: (input: ReturnType<typeof setTimeout> | undefined) =>
        clearTimeout(input),
      now: (): number => Date.now(),
    },
    note: {
      store: safeReopenSessionStorage(),
      why: why,
      focus: location.hash.replace(/^#/, ""),
    },
  });
}
function announceDesignSystemReopened(): void {
  (0, announceReopenedArtifact)({
    store: safeReopenSessionStorage(),
    now: Date.now(),
    say: (input: string) => (0, announceLiveMessage)(input),
    message: (): string =>
      activeDesignSystemDocument !== undefined &&
      !activeDesignSystemDocument.readOnly()
        ? uiMessage("design-system.reopen.theDesignSystemHasReopened")
        : uiMessage("design-system.reopen.theDesignSystemHasReopened2"),
    focus: (input: string | undefined) =>
      (0, restoreReopenedFocus)(window, input),
  });
}
function waitForBootLiveAnnouncer(message?: string): void {
  let passes = 0,
    timer = setInterval((): void => {
      passes += 1;
      if (
        document.querySelector('[data-kit="live-announcer"]') === null &&
        passes < 80
      ) {
        return;
      }
      clearInterval(timer);
      announceDesignSystemReopened();
      if (
        message !== undefined &&
        BOOT_LIVE_NOTICE_MESSAGES.has(message)
      ) {
        (0, announceLiveMessage)(
          BOOT_LIVE_ANNOUNCEMENT_MESSAGES.get(message) ?? message,
        );
      }
    }, 250);
}
function get_MIGRATION_DONE_REOPEN_MESSAGE() {
  return uiMessage("design-system.reopen.thisDesignSystemHasMoved");
}
function get_MIGRATION_ENDED_REOPEN_MESSAGE() {
  return uiMessage("design-system.reopen.theMoveOfThisDesign");
}
function get_MIGRATION_STARTING_REOPEN_MESSAGE() {
  return uiMessage("design-system.reopen.thisDesignSystemIsAbout");
}
function get_EDITABLE_DESIGN_SYSTEM_REOPENED_MESSAGE() {
  return uiMessage("design-system.reopen.theDesignSystemHasReopened");
}
function get_DESIGN_SYSTEM_REOPENED_MESSAGE() {
  return uiMessage("design-system.reopen.theDesignSystemHasReopened2");
}
export {
  activeDesignSystemDocument,
  activeDesignSystemHasUnsentEdits,
  announceDesignSystemReopened,
  announceReloadRequired,
  BOOT_LIVE_ANNOUNCEMENT_MESSAGES,
  DEFAULT_RELOAD_MESSAGE,
  DESIGN_SYSTEM_REOPEN_WATCHDOG_MS,
  get_DESIGN_SYSTEM_REOPENED_MESSAGE,
  designSystemReopenPending,
  designSystemRestartFunction,
  designSystemTypingListenerInstalled,
  get_EDITABLE_DESIGN_SYSTEM_REOPENED_MESSAGE,
  installDesignSystemTypingListener,
  lastDesignSystemTypingAt,
  legacyDesignSystemDocument,
  legacyDesignSystemIsBusy,
  get_MIGRATION_DONE_REOPEN_MESSAGE,
  get_MIGRATION_ENDED_REOPEN_MESSAGE,
  get_MIGRATION_STARTING_REOPEN_MESSAGE,
  reopenAfterFilesMigration,
  reopenForEditingTransition,
  restartDesignSystemWithFallback,
  safeReopenSessionStorage,
  singleFileMigrationRunning,
  waitForBootLiveAnnouncer,
};
export function set_activeDesignSystemDocument(value: any): any {
  activeDesignSystemDocument = value;
  return value;
}
export function set_singleFileMigrationRunning(value: any): any {
  singleFileMigrationRunning = value;
  return value;
}
export function installFilesReopen(): () => void {
  return () => {
    MIGRATION_DONE_REOPEN_MESSAGE =
      "This design system has moved to a newer way of saving. The page reopens in a moment.";
    MIGRATION_ENDED_REOPEN_MESSAGE =
      "The move of this design system has ended. The page reopens in a moment.";
    MIGRATION_STARTING_REOPEN_MESSAGE =
      "This design system is about to be moved to a newer way of saving. Your changes are saved. The page reopens in a moment.";
    EDITABLE_DESIGN_SYSTEM_REOPENED_MESSAGE =
      "The design system has reopened. Editing is back.";
    DESIGN_SYSTEM_REOPENED_MESSAGE = "The design system has reopened.";
    BOOT_LIVE_ANNOUNCEMENT_MESSAGES = new Map([
      [get_MOVED_RELOAD_MESSAGE(), get_MOVED_RELOAD_MESSAGE()],
      [
        get_MIGRATION_RUNNING_MESSAGE(),
        uiMessage("design-system.reopen.thisDesignSystemIsBeing"),
      ],
      [
        get_PARTIAL_DESIGN_SYSTEM_MESSAGE(),
        uiMessage("design-system.reopen.partOfThisDesignSystem"),
      ],
      [
        get_OLDER_COPY_READONLY_MESSAGE(),
        uiMessage("design-system.reopen.anOlderCopyOfThis"),
      ],
    ]);
    legacyDesignSystemIsBusy = (): boolean => false;
    (0, setAutosaveInstaller)(
      (input: Boot.ActiveDocument, options: () => boolean): void => {
        legacyDesignSystemDocument = input;
        legacyDesignSystemIsBusy = options;
        activeDesignSystemDocument ??= input;
      },
    );
    activeDesignSystemHasUnsentEdits = () => {
      let value = activeDesignSystemDocument?.saveState().status;
      return value === "dirty" || value === "saving";
    };
    lastDesignSystemTypingAt = 0;
    designSystemTypingListenerInstalled = false;
    safeReopenSessionStorage = () => {
      try {
        return sessionStorage;
      } catch {
        return;
      }
    };
    designSystemRestartFunction = () => {
      if (!(0, canRestartArtifact)()) {
        return;
      }
      // MineDesign: the host is globalThis.designSystemHost (packages/design-system/src/editor/design-system-host.ts), not globalThis.claude.
      let value = (
        globalThis as typeof globalThis &
          Pick<Host.ProtocolGlobal, "designSystemHost">
      ).designSystemHost?.hot;
      return value?.restart?.bind(value);
    };
    DEFAULT_RELOAD_MESSAGE = get_MOVED_RELOAD_MESSAGE();
    announceReloadRequired = (input = DEFAULT_RELOAD_MESSAGE): void => {
      (0, showEditorPromiseNotification)(input, null);
      (0, announceLiveMessage)(input);
    };
    DESIGN_SYSTEM_REOPEN_WATCHDOG_MS = 6000;
    designSystemReopenPending = false;
    singleFileMigrationRunning = false;
  };
}
