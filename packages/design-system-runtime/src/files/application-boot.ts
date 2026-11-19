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
import { loadJsxNamespace } from "../dependencies";
import { CONTENT_SIGN_IN_REQUIRED_MESSAGE, determineSlidesWriteAccess } from "../documents/write-access";
import { showEditorPromiseNotification } from "../editor/editable-name";
import { FILES_INDEX_NAME, FILES_INDEX_PROJECT_PATH, hasFilesMigrationMarker, parseFilesIndex, readTreeIndex, TREE_INDEX_FIELD } from "../editor/files-index";
import { BOOT_LIVE_NOTICE_MESSAGES, chooseDesignSystemBootMode, chooseDesignSystemFileHome, get_DUPLICATE_FILE_INDEX_MESSAGE, get_MIGRATION_RUNNING_MESSAGE, get_PIPELINE_READONLY_MESSAGE, get_REOPEN_FAILED_MESSAGE, isRecentMigrationAttempt, isRecentSingleFileMoveNote, mountInitializedFilesOutcome, STORE_META_LOADING_NOTICE_MS, STORE_META_RETRY_MS, STORE_MODE_DECISION_TIMEOUT_MS } from "./boot-decisions";
import { createFilesDebugger, filesModeDebugEnabled } from "./debug-panel";
import { BOOT_FILE_READ_RETRY_DELAYS_MS, canRestartArtifact, getHotCapability } from "./hot-updates";
import { readLegacyDesignSystemState } from "./legacy-state-reader";
import { MAX_DESIGN_SYSTEM_INDEX_CHARS } from "./migration-codec";
import { afterTwoAnimationFrames, bootPerFileDesignSystem } from "./per-file-boot";
import { installDesignSystemTypingListener, restartDesignSystemWithFallback, waitForBootLiveAnnouncer } from "./reopen";
import { consumeMigrationNotice, consumeMigrationRunningNote, consumeSingleFileMoveNote, get_MIGRATION_INTERRUPTED_MESSAGE, mayStartEmptyFilesSystem, prepareSingleFileMigrationReopen, runSingleFileMigrationBoot, skipMigrationForTab, startEmptyFilesDesignSystem } from "./single-file-migration-boot";
import { prepareDesignSystemThumbnailCapture, stateEnvelopeTitle, waitForThumbnailResources } from "./thumbnail-readiness";
import { capabilityLoadTimeoutMs } from "../host/claude-capabilities";
import { activeHotReloadSession } from "../host/hot-reload";
import { currentUserCanEdit } from "../host/user-api";
import { getAssetsCapability } from "../media/assets";
import { chooseDesignSystemBootModeModelBoot, isDesignSystemTypeHostModelBoot, isMigrationExemptHost } from "../model/boot";
import { DESIGN_SYSTEM_DEMO_PATH, parseDesignSystemEnvelope } from "../model/file-policy";
import { bootHealthOutcome } from "../model/publish";
import { documentOptionsForBootMode, setDocumentBootOptions } from "../model/system-store";
import { toModuleNamespace } from "../module-helpers";
import { isEmulatorPage } from "../platform/emulator";
import { artifactHealth } from "../telemetry/health";
import { initializeDocumentColorMode } from "../ui/color-mode";

import { set_singleFileMigrationBootHeld } from "./single-file-migration-boot";
var jsxDesignSystemBootstrap: typeof import("react/jsx-runtime");
var isDesignSystemTypeHost: boolean;
var designSystemBootStartedAt: number;
var designSystemFilesDebugger: FilesCore.FilesDebugger | undefined;
var perFileDesignSystemBooted: boolean;
var resolveDesignSystemFirstPaint: () => void;
var designSystemFirstPaint: Promise<void>;
var hasIgnoredLegacyRootFile: boolean;
var IGNORED_LEGACY_ROOT_FILE_MESSAGE: string;
var UNREAD_LEGACY_STORE_CHANGES_MESSAGE: string;
var unreadDesignSystemFileHomes: () => Boot.FileHomes;
var designSystemFileHomeDecision: Boot.FileHomeDecision;
var designSystemFileHomes: Boot.FileHomes;
var designSystemStateLayout: (input: Boot.RawEnvelope) => "tree" | "envelope";
function configureLegacyDesignSystemBoot(
  outcome: Boot.LegacyInitialState,
  emptyWriteAccess: boolean | null = null,
  readOnlyReason?: string,
): void {
  let {
    boot: boot,
    opts: options,
    instance: instance,
  } = documentOptionsForBootMode(
    chooseDesignSystemBootModeModelBoot(
      outcome,
      emptyWriteAccess,
      isDesignSystemTypeHost,
    ),
    readOnlyReason,
  );
  if (outcome.error !== undefined && boot.mode !== "instance") {
    console.warn("design-system (files mode): " + outcome.error);
  }
  let title = stateEnvelopeTitle(boot.state);
  if (title !== undefined) {
    document.title = title;
  }
  setDocumentBootOptions(options, {
    instance: instance,
  });
}
async function probeLegacyDesignSystemWriteAccess(): Promise<boolean | null> {
  let writeDenied: boolean = false,
    probe = new Promise<boolean | null>((resolveProbe): void => {
      let count: number = 2,
        callback = (capabilityResult: boolean | null | undefined) => {
          if (capabilityResult === true) {
            return resolveProbe(true);
          }
          if (capabilityResult === false) {
            writeDenied = true;
          }
          if (--count === 0) {
            resolveProbe(writeDenied ? false : null);
          }
        };
      currentUserCanEdit().then(callback);
      getAssetsCapability().then((capability) =>
        callback(capability === null ? null : true),
      );
    }),
    timer: ReturnType<typeof setTimeout> | undefined;
  try {
    return await Promise.race([
      probe,
      new Promise<boolean | null>(
        (resolve) =>
          (timer = setTimeout(
            () => resolve(writeDenied ? false : null),
            capabilityLoadTimeoutMs,
          )),
      ),
    ]);
  } finally {
    clearTimeout(timer);
  }
}
function failedLegacyStateOutcome(error: unknown): Boot.LegacyInitialState {
  return {
    state: {},
    origin: "failed",
    error: error instanceof Error ? error.message : String(error),
  };
}
function initializeDesignSystemFilesDebugger(): void {
  if (
    designSystemFilesDebugger !== undefined ||
    typeof document === "undefined" ||
    !filesModeDebugEnabled("files")
  ) {
    return;
  }
  let value = createFilesDebugger({
    product: "design-system",
    hot: getHotCapability(),
    bootStartedAt: designSystemBootStartedAt,
  });
  designSystemFilesDebugger = value;
  value.field("mode", "per-file (design-system.json is the index)");
  value.phase(uiMessage("design-system.applicationBoot.indexRead"));
  value.mount("files");
}
function readDesignSystemBootStateFile(
  text: string,
  path: string,
  homes: Boot.FileHomes,
): Boot.LegacyReadSuccess | string {
  let index =
      text.length > MAX_DESIGN_SYSTEM_INDEX_CHARS
        ? null
        : parseFilesIndex(text),
    marked = index !== null && hasFilesMigrationMarker(index);
  if (path === FILES_INDEX_PROJECT_PATH) {
    homes.project = marked ? "marked" : "other";
    homes.projectText = text;
    if (index === null || !marked) {
      return uiMessage("design-system.applicationBoot.notAMarkedIndexUnder");
    }
    return {
      envelope: {
        title: index.title,
        content: {
          v: 2,
          files: {},
        },
        [TREE_INDEX_FIELD]: index,
      },
    };
  }
  if (index === null) {
    let value = parseDesignSystemEnvelope(text);
    if (path === FILES_INDEX_NAME) {
      homes.root = typeof value === "string" ? "other" : "envelope";
    }
    return value;
  }
  if (path === FILES_INDEX_NAME) {
    homes.root = marked ? "marked" : "unmarked";
    homes.rootText = text;
  }
  if (!marked) {
    return uiMessage("design-system.applicationBoot.anIndexWithoutAFiles");
  }
  return {
    envelope: {
      title: index.title,
      content: {
        v: 2,
        files: {},
      },
      [TREE_INDEX_FIELD]: index,
    },
  };
}
function recordDesignSystemFileHomeDecision(
  outcome: Boot.LegacyInitialState,
  decision: Boot.FileHomeDecision,
): void {
  designSystemFileHomeDecision = decision;
  hasIgnoredLegacyRootFile =
    designSystemFileHomeDecision.strayRoot ||
    (designSystemFileHomeDecision.ignoredRoot &&
      !designSystemFileHomeDecision.ignoredSingleFile);
  if (
    outcome.origin === "instance" &&
    readTreeIndex(outcome.state) !== undefined
  ) {
    activeHotReloadSession?.armReady();
    if (!isDesignSystemTypeHost) {
      initializeDesignSystemFilesDebugger();
    }
  }
}
function applyFileHomeReadAnswers(
  homes: Boot.FileHomes,
  answers: Record<string, Boot.LegacyAnswerKind> | undefined,
): Boot.FileHomes {
  let answerState = (
    path: string,
    homeKind: Boot.FileHomeKind,
  ): Boot.FileHomeKind =>
    answers?.[path] === "unread"
      ? "unread"
      : answers?.[path] === "missing"
        ? "absent"
        : homeKind;
  return {
    ...homes,
    project: answerState(FILES_INDEX_PROJECT_PATH, homes.project),
    root: answerState(FILES_INDEX_NAME, homes.root),
  };
}
async function readDesignSystemInitialState(
  onOwn?: (
    state: Boot.RawEnvelope | "missing" | "unreadable",
    homes: Boot.FileHomeDecision,
  ) => void,
): Promise<Boot.LegacyInitialState> {
  try {
    let values = new Set<string>(),
      callback = async (path: string) => {
        let controller = new AbortController(),
          isCached = values.has(path);
        values.add(path);
        let timeoutId = setTimeout(
          () => controller.abort(),
          isCached
            ? STORE_META_RETRY_MS
            : STORE_META_LOADING_NOTICE_MS,
        );
        try {
          return await fetch(path, {
            signal: controller.signal,
          });
        } finally {
          clearTimeout(timeoutId);
        }
      },
      value = unreadDesignSystemFileHomes(),
      applyAnswers = (
        answers: Record<string, Boot.LegacyAnswerKind> | undefined,
      ) => {
        let stateAnswers = applyFileHomeReadAnswers(value, answers);
        return chooseDesignSystemFileHome({
          ...stateAnswers,
          sameText:
            stateAnswers.projectText !== undefined &&
            stateAnswers.projectText === stateAnswers.rootText,
        });
      },
      readBootState = () =>
        readLegacyDesignSystemState({
          stateFiles: [FILES_INDEX_PROJECT_PATH],
          demoFile: DESIGN_SYSTEM_DEMO_PATH,
          fetch: callback,
          mayWrite: async () =>
            (await determineSlidesWriteAccess()).canWrite,
          refusedWaits: BOOT_FILE_READ_RETRY_DELAYS_MS,
          read: (path: string, mode: string) =>
            readDesignSystemBootStateFile(path, mode, value),
          ...(onOwn !== undefined
            ? {
                onOwn: (
                  envelope: Boot.RawEnvelope | "missing" | "unreadable",
                  answers: Record<string, Boot.LegacyAnswerKind>,
                ) => onOwn(envelope, applyAnswers(answers)),
              }
            : {}),
        }),
      bootState = await readBootState();
    if (
      bootState.stateFileAnswers?.[FILES_INDEX_PROJECT_PATH] === "unread"
    ) {
      await new Promise<void>(
        (resolve) =>
          void setTimeout(resolve, STORE_MODE_DECISION_TIMEOUT_MS),
      );
      Object.assign(value, unreadDesignSystemFileHomes());
      bootState = await readBootState();
    }
    designSystemFileHomes = applyFileHomeReadAnswers(
      value,
      bootState.stateFileAnswers,
    );
    recordDesignSystemFileHomeDecision(
      bootState,
      applyAnswers(bootState.stateFileAnswers),
    );
    return bootState;
  } catch (value: unknown) {
    designSystemFileHomes = {
      project: "unread",
      root: "unread",
    };
    return failedLegacyStateOutcome(value);
  }
}
async function bootLegacyDesignSystemMode(
  readOnlyReason?: string,
  storeHandle: Boot.NativeLegacyDatabase | null = null,
  initialStatePromise?: Promise<Boot.LegacyInitialState>,
  renderReport?: Boot.HealthReport,
  storeFault?: string,
): Promise<void> {
  let recentMigration = isRecentMigrationAttempt({
      runningAt: consumeMigrationRunningNote(),
      now: Date.now(),
    }),
    carriedNotice = consumeMigrationNotice(),
    outcome = await (initialStatePromise ?? readDesignSystemInitialState()),
    report: Boot.HealthReport = bootHealthOutcome(
      outcome,
      isDesignSystemTypeHost,
    );
  artifactHealth.report(
    ...(renderReport !== undefined && report[1] === "success"
      ? renderReport
      : report),
  );
  let mode = await chooseDesignSystemBootMode({
    storeAbsent: storeHandle !== null && storeFault === undefined,
    forcedReadOnly: readOnlyReason !== undefined,
    typePage: isDesignSystemTypeHost,
    emulator: isEmulatorPage(),
    origin: outcome.origin,
    stateFileFound: outcome.stateFileFound,
    mayStartOnFiles: mayStartEmptyFilesSystem,
    ownLayout: designSystemStateLayout(outcome.state),
  });
  if (mode === "tree") {
    return bootPerFileDesignSystem(
      outcome,
      readOnlyReason ??
        (isMigrationExemptHost(location.hostname)
          ? get_PIPELINE_READONLY_MESSAGE()
          : designSystemFileHomeDecision.twoIndexes
            ? get_DUPLICATE_FILE_INDEX_MESSAGE()
            : undefined),
      storeHandle,
    );
  }
  if (mode === "start-tree") {
    let callback = (noticeMessage: string): void => {
      configureLegacyDesignSystemBoot(outcome, null, noticeMessage);
      if (BOOT_LIVE_NOTICE_MESSAGES.has(noticeMessage)) {
        waitForBootLiveAnnouncer(noticeMessage);
      }
      prepareDesignSystemThumbnailCapture();
    };
    if (
      mountInitializedFilesOutcome({
        started: await startEmptyFilesDesignSystem(storeHandle!),
        mount: callback,
        reopen: () =>
          restartDesignSystemWithFallback(
            get_REOPEN_FAILED_MESSAGE(),
          ),
        reload: () => location.reload(),
      })
    ) {
      return;
    }
  }
  if (mode === "readonly-store") {
    configureLegacyDesignSystemBoot(
      outcome,
      null,
      readOnlyReason ?? CONTENT_SIGN_IN_REQUIRED_MESSAGE,
    );
    prepareDesignSystemThumbnailCapture();
    return;
  }
  let singleFileInstance =
      !isDesignSystemTypeHost &&
      outcome.origin === "instance" &&
      readOnlyReason === undefined &&
      storeHandle !== null &&
      storeFault === undefined &&
      designSystemStateLayout(outcome.state) === "envelope",
    moveInterrupted = singleFileInstance && recentMigration;
  if (moveInterrupted) {
    skipMigrationForTab();
  }
  let notice = singleFileInstance
    ? (carriedNotice ??
      (moveInterrupted ? get_MIGRATION_INTERRUPTED_MESSAGE() : null))
    : null;
  if (notice !== null) {
    afterTwoAnimationFrames(() =>
      showEditorPromiseNotification(notice, null),
    );
  }
  let holdSingleFile = (set_singleFileMigrationBootHeld(isRecentSingleFileMoveNote({
    noteAt: singleFileInstance
      ? consumeSingleFileMoveNote()
      : null,
    now: Date.now(),
    canReopen: canRestartArtifact(),
    singleFileHere: singleFileInstance,
  })));
  configureLegacyDesignSystemBoot(
    outcome,
    !isDesignSystemTypeHost &&
      outcome.origin === "demo" &&
      outcome.stateFileFound === false
      ? await probeLegacyDesignSystemWriteAccess()
      : null,
    holdSingleFile ? get_MIGRATION_RUNNING_MESSAGE() : readOnlyReason,
  );
  let liveMessage = holdSingleFile
    ? get_MIGRATION_RUNNING_MESSAGE()
    : readOnlyReason;
  if (
    liveMessage !== undefined &&
    BOOT_LIVE_NOTICE_MESSAGES.has(liveMessage)
  ) {
    installDesignSystemTypingListener();
    waitForBootLiveAnnouncer(liveMessage);
  }
  if (outcome.origin === "instance") {
    waitForThumbnailResources();
  } else {
    prepareDesignSystemThumbnailCapture();
  }
  if (holdSingleFile) {
    afterTwoAnimationFrames(
      () =>
        void runSingleFileMigrationBoot(
          storeHandle!,
          outcome.state,
        ).catch((): void => {
          return;
        }),
    );
  } else if (singleFileInstance) {
    afterTwoAnimationFrames(() =>
      setTimeout(
        () =>
          void prepareSingleFileMigrationReopen(
            outcome.state,
          ).catch((): void => {
            return;
          }),
        1000,
      ),
    );
  }
}
function get_IGNORED_LEGACY_ROOT_FILE_MESSAGE() {
  return uiMessage("design-system.applicationBoot.thisDesignSystemHasAn");
}
function get_UNREAD_LEGACY_STORE_CHANGES_MESSAGE() {
  return uiMessage("design-system.applicationBoot.somethingWasSavedForThis");
}
export {
  applyFileHomeReadAnswers,
  bootLegacyDesignSystemMode,
  configureLegacyDesignSystemBoot,
  designSystemBootStartedAt,
  designSystemFileHomeDecision,
  designSystemFileHomes,
  designSystemFilesDebugger,
  designSystemFirstPaint,
  designSystemStateLayout,
  failedLegacyStateOutcome,
  hasIgnoredLegacyRootFile,
  get_IGNORED_LEGACY_ROOT_FILE_MESSAGE,
  initializeDesignSystemFilesDebugger,
  isDesignSystemTypeHost,
  jsxDesignSystemBootstrap,
  perFileDesignSystemBooted,
  probeLegacyDesignSystemWriteAccess,
  readDesignSystemBootStateFile,
  readDesignSystemInitialState,
  recordDesignSystemFileHomeDecision,
  resolveDesignSystemFirstPaint,
  get_UNREAD_LEGACY_STORE_CHANGES_MESSAGE,
  unreadDesignSystemFileHomes,
};
export function set_perFileDesignSystemBooted(bootValue: any): any {
  perFileDesignSystemBooted = bootValue;
  return bootValue;
}
export function installFilesApplicationBoot(): () => void {
  return () => {
    jsxDesignSystemBootstrap = toModuleNamespace(
      loadJsxNamespace(),
      1,
    );
    initializeDocumentColorMode(document);
    isDesignSystemTypeHost = isDesignSystemTypeHostModelBoot(
      location.hostname,
    );
    designSystemBootStartedAt =
      typeof performance !== "undefined" ? performance.now() : 0;
    perFileDesignSystemBooted = false;
    resolveDesignSystemFirstPaint = (): void => {
      return;
    };
    designSystemFirstPaint = new Promise<void>((resolve): void => {
      resolveDesignSystemFirstPaint = resolve;
    });
    hasIgnoredLegacyRootFile = false;
    IGNORED_LEGACY_ROOT_FILE_MESSAGE =
      "This design system has an extra file named design-system.json that the page does not use. Nothing is wrong with what you see here; you can leave the file alone.";
    UNREAD_LEGACY_STORE_CHANGES_MESSAGE =
      // MineDesign: user-facing copy calls the agent "the agent", not Claude.
      "Something was saved for this design system in a place this page no longer reads, after it was set up, so it is not shown here. If a change the agent made seems to be missing, ask the agent to make it again in this design system’s files.";
    unreadDesignSystemFileHomes = () => ({
      project: "unread",
      root: "unread",
    });
    designSystemFileHomeDecision = chooseDesignSystemFileHome({
      project: "absent",
      root: "absent",
    });
    designSystemFileHomes = {
      project: "unread",
      root: "unread",
    };
    designSystemStateLayout = (envelope: Boot.RawEnvelope): "tree" | "envelope" =>
      readTreeIndex(envelope) !== undefined ? "tree" : "envelope";
  };
}
