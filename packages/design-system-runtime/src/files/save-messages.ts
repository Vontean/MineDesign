import { uiMessage } from '@minedesign/contracts/ui-messages';
import type * as Boot from "../contracts/boot";
import type * as Model from "../contracts";
import type * as Storage from "../contracts/model-storage";
import type * as Dom from "../contracts/dom";
import type * as Host from "../contracts/platform-host";
import type * as React from "react";
/** Restored application module; prepare first, initialize in original order. */
import { bindRuntimeValue, type RuntimeBindings } from "../runtime-types";
export function installFilesSaveMessages(runtime: RuntimeBindings): () => void {
  var STUCK_SAVE_REASON_MESSAGES: Record<string, string>;
  var isTextFileListingRow: (row: Model.FileListingRow) => boolean;
  function describeStuckSave(
    stuck: Boot.StuckSave,
    now: number = Date.now(),
  ): string {
    let retentionMessage: string = stuck.stashed
        ? uiMessage("design-system.saveMessages.yourEditIsKeptIn") +
          runtime.CRASH_STASH_RETENTION_LABEL +
          ". If this tab closes, open this page again in this browser to get it back."
        : uiMessage("design-system.saveMessages.yourEditIsKeptOnly"),
      indexDescription: string =
        uiMessage("design-system.saveMessages.theFileThatListsWhat") +
        (stuck.file ?? uiMessage("design-system.saveMessages.itsIndex")) +
        ")";
    if (stuck.code === "index_newer_build") {
      return (
        uiMessage("design-system.saveMessages.notSavedANewerVersion") +
        indexDescription +
        ", and this tab cannot read it. " +
        (stuck.stashed
          ? uiMessage("design-system.saveMessages.yourEditIsKeptIn") +
            runtime.CRASH_STASH_RETENTION_LABEL +
            ": reload the page to get the newer editor, and it is offered back to you."
          : uiMessage("design-system.saveMessages.yourEditIsKeptOnly2"))
      );
    }
    if (stuck.code === "index_damaged") {
      return (
        uiMessage("design-system.saveMessages.notSaved") +
        indexDescription +
        // MineDesign: user-facing copy calls the agent "the agent", not Claude.
        " cannot be read because it is not in the form this editor writes, so nothing can be saved from here. It is looked at again whenever you make a change. If it still cannot be read, ask whoever manages this project, or the agent in the chat, to restore that file. " +
        retentionMessage
      );
    }
    if (stuck.code === "conflict") {
      return (
        uiMessage("design-system.saveMessages.notSavedYetANewer") +
        retentionMessage +
        (stuck.nextRetryAt !== undefined
          ? " Still trying; you can retry now."
          : " You can retry now.")
      );
    }
    if (stuck.code === "upstream_error") {
      return (
        uiMessage("design-system.saveMessages.notSavedYetTheServer") +
        retentionMessage +
        " Still trying; you can retry now."
      );
    }
    if (stuck.code === "rate_limited") {
      let value: number =
        stuck.nextRetryAt === undefined
          ? 0
          : Math.ceil((stuck.nextRetryAt - now) / 1000);
      return (
        uiMessage("design-system.saveMessages.notSavedYetTooMany") +
        retentionMessage +
        (value > 0
          ? " Trying again in about " +
            String(value) +
            (value === 1 ? " second." : " seconds.")
          : " Still trying.")
      );
    }
    return (
      uiMessage("design-system.saveMessages.notSaved") +
      (STUCK_SAVE_REASON_MESSAGES[stuck.code] ??
        uiMessage("design-system.saveMessages.thisChangeCouldNotBe")) +
      ". " +
      retentionMessage
    );
  }
  function formatUnsendableFilesMessage(
    leftOut: readonly Boot.UnsavedFile[],
    options: { stashed?: boolean; restSaved?: boolean } = {},
  ): string {
    let basename = (input: string) => input.slice(input.lastIndexOf("/") + 1),
      first = leftOut[0],
      singular: boolean = leftOut.length === 1,
      retention: string =
        options.stashed === true
          ? uiMessage("design-system.saveMessages.keptInThisBrowserFor") +
            runtime.CRASH_STASH_RETENTION_LABEL
          : uiMessage("design-system.saveMessages.keptOnlyWhileThisTab"),
      suffix: string =
        " Until then " +
        (singular ? uiMessage("design-system.saveMessages.itIs") : uiMessage("design-system.saveMessages.theyAre")) +
        " not saved, and " +
        retention +
        ".";
    if (options.restSaved === false) {
      return (
        (singular
          ? 'Also, "' + basename(first.path) + '" cannot be saved as it is: '
          : "Also, " +
            String(leftOut.length) +
            ' files cannot be saved as they are. The first, "' +
            basename(first.path) +
            '": ') +
        first.why +
        "." +
        suffix
      );
    }
    return (
      (singular
        ? uiMessage("design-system.saveMessages.everythingElseIsSavedBut") +
          basename(first.path) +
          '" is not: '
        : uiMessage("design-system.saveMessages.everythingElseIsSavedBut2") +
          String(leftOut.length) +
          ' files are not. The first, "' +
          basename(first.path) +
          '": ') +
      first.why +
      "." +
      suffix
    );
  }
  bindRuntimeValue(runtime, "describeStuckSave", () => describeStuckSave);
  bindRuntimeValue(
    runtime,
    "formatUnsendableFilesMessage",
    () => formatUnsendableFilesMessage,
  );
  bindRuntimeValue(
    runtime,
    "STUCK_SAVE_REASON_MESSAGES",
    () => STUCK_SAVE_REASON_MESSAGES,
    (value) => {
      STUCK_SAVE_REASON_MESSAGES = value;
    },
  );
  bindRuntimeValue(
    runtime,
    "isTextFileListingRow",
    () => isTextFileListingRow,
    (value) => {
      isTextFileListingRow = value;
    },
  );
  return () => {
    STUCK_SAVE_REASON_MESSAGES = {
      not_writer:
        "you no longer have edit access here. Ask an owner for access, then reload; your edit can be saved once you have it",
      not_declared: "saving is not available on this page",
      capability_disabled:
        "saving is not available on this page right now. Reload to try again",
      too_large:
        "this change is too large to save. Make it smaller and try again",
      read_only_path:
        "this file belongs to the editor itself and cannot be changed",
    };
    isTextFileListingRow = (input) =>
      input.contentType.startsWith("text/") ||
      input.contentType === "application/json" ||
      input.contentType === "image/svg+xml";
  };
}
