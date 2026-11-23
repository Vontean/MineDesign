import { uiMessage } from "@minedesign/contracts/ui-messages";
import {
  pendingUndoAnnouncement,
  summarizeChangedArtboards,
  undoRedoPastTense,
  undoTargetAnnouncement,
} from "../../editor/accessibility/announcements";
import { announce } from "../../editor/accessibility/announcer";
import { reactChromeTheme as React } from "../../editor/chrome/theme";
import { designPageId } from "../../platform/file-content";
import type { Dynamic } from "../../runtime-types";
import type { CanvasManifest, HistoryDirection } from "../manifest-history";
import {
  CanvasWorkingStateHas as shouldAnnounceDroppedHistory,
  createEditSessionManager,
  createInlineHistoryBridge,
  createSessionHistory,
  readHeldSessionState,
  recordSessionLoadStart,
  textEditHistoryEpoch,
  updateTextEditHistoryCounts,
} from "../working-state";

type Ref<T> = { current: T };
type DocumentFiles = { content(): { files: Record<string, unknown> } };
type PanelUndoControls = { undo(): void; redo(): void };
type Toast = (message: Dynamic, tone: "warning", options?: { description: Dynamic }) => unknown;

interface HistoryArtboard {
  ensureModel(component: Dynamic): unknown;
  undoDepth(): unknown;
  undoFloor(): unknown;
  redoDepth(): unknown;
  cutUndo(options: Dynamic): unknown;
  dropRedo(options: Dynamic): void;
  flushPending(): unknown;
  applyHistory(component: Dynamic, direction: HistoryDirection): Promise<unknown>;
}

interface SessionHistoryOptions {
  doc: DocumentFiles;
  editing: boolean;
  resetTick: number;
  frames: Ref<Map<string, HistoryArtboard>>;
  savedManifest: Ref<CanvasManifest | null>;
  activePage: Ref<string>;
  mayShowPage(): boolean;
  afterExitGuard(callback: () => void): unknown;
  switchPage(page: string, target?: string): void;
  artboardTitle(file: string): string;
  componentName(file: string): Dynamic;
  showToast: Toast;
  say(message: Dynamic): void;
  refreshHistory(file: string): void;
  applyBoundStep(key: Dynamic, direction: HistoryDirection): void;
}

function createHistoryKeeper(options: SessionHistoryOptions, latest: Ref<SessionHistoryOptions>, manager: Ref<Dynamic>) {
  function inDocument(file: string) {
    return options.savedManifest.current?.artboards.some((artboard) => artboard.file === file) === true &&
      latest.current.doc.content().files[file] !== undefined;
  }

  function pageOfFile(file: string) {
    const manifest = options.savedManifest.current;
    const artboard = manifest?.artboards.find((candidate) => candidate.file === file);
    return manifest && artboard ? designPageId(artboard, manifest.pages) : undefined;
  }

  const changed: string[] = [];
  const other: string[] = [];
  let noticeTimer: ReturnType<typeof setTimeout> | undefined;
  function cancelNotice() {
    clearTimeout(noticeTimer);
    noticeTimer = undefined;
    changed.length = 0;
    other.length = 0;
  }

  const keeper = createSessionHistory({
    inDocument,
    isProtected: (file: string) => pageOfFile(file) === options.activePage.current ||
      manager.current?.undoFile() === file || manager.current?.redoFile() === file,
    now: () => performance.now(),
    onDrop(file: string, reason: string) {
      manager.current?.forget(file);
      if (!shouldAnnounceDroppedHistory(reason)) return;
      (reason === "changed" ? changed : other).push(options.artboardTitle(file));
      if (noticeTimer !== undefined) return;
      const documentAtDrop = latest.current.doc;
      noticeTimer = setTimeout(() => {
        noticeTimer = undefined;
        if (latest.current.doc !== documentAtDrop) {
          cancelNotice();
          return;
        }
        const { message, description } = summarizeChangedArtboards(changed.splice(0), other.splice(0));
        latest.current.showToast(message, "warning", description === undefined ? undefined : { description });
      }, 50);
    },
  });

  const host = {
    inDocument,
    openPage: () => options.activePage.current,
    pageOfFile,
    isFramed: (file: string) => options.savedManifest.current?.artboards.some((artboard) =>
      artboard.file === file && !artboard.frameless) === true,
    startLoad(file: string) {
      const frame = options.frames.current.get(file);
      recordSessionLoadStart(keeper, file, frame ? () => frame.ensureModel(options.componentName(file)) : undefined);
    },
    mayShowPage: options.mayShowPage,
    currentSrc: (file: string) => latest.current.doc.content().files[file],
    afterExitGuard: options.afterExitGuard,
    switchPage: (page: string, target?: string) => latest.current.switchPage(page, target),
    say(source: { kind: "loading"; dir: HistoryDirection; file: string } | { kind: string; dir: HistoryDirection; page: string }) {
      if (source.kind === "loading" && "file" in source) {
        announce(pendingUndoAnnouncement(source.dir, options.artboardTitle(source.file)));
        return;
      }
      const page = "page" in source ? source.page : undefined;
      const title = options.savedManifest.current?.pages?.find(({ id }) => id === page)?.name ??
        uiMessage("canvas.designCanvas.page1");
      options.say(undoTargetAnnouncement(source.dir, title));
    },
  };
  return { keeper, host, cancelNotice };
}

/** 画板间共享的编辑历史。切页时保留可恢复的会话，作品切换时释放它们。 */
export function useCanvasSessionHistory(options: SessionHistoryOptions) {
  const { useEffect, useRef, useCallback } = React;
  const latest: Ref<SessionHistoryOptions> = useRef(options);
  latest.current = options;
  const panel: Ref<{ file: string | null; undoControls: PanelUndoControls | null }> = useRef({ file: null, undoControls: null });
  const recentRefusal: Ref<{ key: string; at: number } | null> = useRef(null);
  const manager = useRef(null);
  const sessionHistory: Ref<ReturnType<typeof createHistoryKeeper> | null> = useRef(null);
  const bridge = useRef(null);
  sessionHistory.current ??= createHistoryKeeper(options, latest, manager);
  const { keeper, host, cancelNotice } = sessionHistory.current;

  const wasEditing: Ref<boolean> = useRef(false);
  const { editing, resetTick, doc } = options;
  useEffect(() => {
    const { clear, epoch } = textEditHistoryEpoch(editing, wasEditing.current, resetTick);
    wasEditing.current = editing;
    if (clear) keeper.clearAll();
    keeper.setEpoch(epoch);
  }, [editing, resetTick, keeper]);
  useEffect(() => {
    keeper.clearAll();
    return cancelNotice;
  }, [doc, keeper]);

  manager.current ??= createEditSessionManager({
    depths: (file: string) => readHeldSessionState(keeper, host.inDocument, file, "depth",
      () => options.frames.current.get(file)?.undoDepth() ?? null),
    floor: (file: string) => readHeldSessionState(keeper, host.inDocument, file, "floor",
      () => options.frames.current.get(file)?.undoFloor() ?? null),
    redos: (file: string) => readHeldSessionState(keeper, host.inDocument, file, "redos",
      () => options.frames.current.get(file)?.redoDepth() ?? null),
    cutUndo: (file: string, settings: Dynamic) => options.frames.current.get(file)?.cutUndo(settings),
    dropRedo: (file: string, settings: Dynamic) => { options.frames.current.get(file)?.dropRedo(settings); },
    onAtomicRefused(file: string | undefined, reason: string, scope: string, otherFile?: string) {
      if (reason !== "failed" && file !== undefined) options.refreshHistory(file);
      if (reason === "capped") return;
      const key = String(file) + ":" + reason + ":" + String(otherFile);
      const previous = recentRefusal.current;
      if (previous?.key === key && Date.now() - previous.at < 4000) return;
      recentRefusal.current = { key, at: Date.now() };
      if (reason === "stale" && scope === "whole" && file === undefined) return;
      options.say(atomicRefusalMessage(options, reason, scope, otherFile));
    },
    onBoundApplied: options.applyBoundStep,
    apply(file: string, direction: HistoryDirection, flush: boolean) {
      const { file: selectedFile, undoControls } = panel.current;
      if (file === selectedFile && undoControls) {
        undoControls[direction === "undo" ? "undo" : "redo"]();
        return flush ? options.frames.current.get(file)?.flushPending() : undefined;
      }
      return options.frames.current.get(file)?.applyHistory(options.componentName(file), direction).then((applied) => {
        if (!applied) return;
        const name = (file.split("/").pop() ?? file).replace(/\.dc\.html$/, "");
        options.say((direction === "undo" ? uiMessage("canvas.designCanvas.undidOn")
          : uiMessage("canvas.designCanvas.redidOn")) + name);
      });
    },
  });
  bridge.current ??= createInlineHistoryBridge(manager.current, keeper, host);
  const setPanelUndoTarget = useCallback((file: string | null, undoControls: PanelUndoControls | null) => {
    panel.current = { file, undoControls };
  }, []);
  return { sessionHistory, keeper, bridge, setPanelUndoTarget };
}

function atomicRefusalMessage(options: SessionHistoryOptions, reason: string, scope: string, otherFile?: string) {
  const text = uiMessage("canvas.designCanvas.thatMoveAcrossArtboardsCan");
  if (reason !== "stale") return uiMessage("canvas.designCanvas.couldnTUndoOrRedo");
  if (scope === "others") {
    return otherFile !== undefined
      ? text + " Undo puts back what it still can; the rest stays in " + options.artboardTitle(otherFile) +
        ", and undo there no longer goes back past the move."
      : text + " Undo now puts the moved elements back where they came from; the copies stay.";
  }
  if (scope === "holder") return text + " Redo now puts the copies back; the originals stay.";
  if (scope === "whole") return text + " Undo and redo still move the elements; the artboards that moved with them stay.";
  return otherFile !== undefined
    ? text + " What you moved stays in " + options.artboardTitle(otherFile) + ", and undo there no longer goes back past the move."
    : text;
}

interface HistoryTransactionOptions {
  manifestHistory: Dynamic;
  inlineHistory: Ref<Dynamic>;
  textEdit: Ref<Dynamic>;
  focusedFile: Ref<Dynamic>;
  flushPending: Ref<boolean>;
  recordArtboardActivity(file?: Dynamic): void;
  markSelectionFile(file?: Dynamic): void;
  setSelectionChangeTick(update: (tick: number) => number): void;
}

/** 画板上报的撤销栈事务（入栈、应用、撤回、挤出）：同步清单历史、文字编辑计数、活动记录与选区刷新。 */
export function useCanvasHistoryTransactions(options: HistoryTransactionOptions) {
  const { useCallback } = React;
  const { manifestHistory, inlineHistory, textEdit, focusedFile, flushPending } = options;
  const { recordArtboardActivity, markSelectionFile, setSelectionChangeTick } = options;
  const updateTextHistory = useCallback((input?: Dynamic, mode?: Dynamic) => {
    const openTextEdit = textEdit.current;
    openTextEdit !== null &&
      input === focusedFile.current &&
      !flushPending.current &&
      updateTextEditHistoryCounts(openTextEdit, mode);
  }, []);
  const handleHistoryPush = useCallback((input?: Dynamic) => {
    updateTextHistory(input, "push");
    manifestHistory.rememberLocalPush(input);
    inlineHistory.current?.reportPush(input);
    manifestHistory.notify();
    recordArtboardActivity(input);
    markSelectionFile(input);
    setSelectionChangeTick((tick) => tick + 1);
  }, [recordArtboardActivity, markSelectionFile, manifestHistory.rememberLocalPush, manifestHistory.notify, updateTextHistory]);
  const trackHistoryApply = useCallback((input?: Dynamic, direction?: Dynamic) => {
    manifestHistory.adjustLocalDepth(input, direction === "undo" ? -1 : 1);
    recordArtboardActivity(input);
    markSelectionFile(input);
    setSelectionChangeTick((tick) => tick + 1);
  }, [recordArtboardActivity, markSelectionFile, manifestHistory.adjustLocalDepth]);
  const handleHistoryRevoke = useCallback((input?: Dynamic) => {
    updateTextHistory(input, "revoke");
    trackHistoryApply(input, "undo");
    manifestHistory.revokeLocalPush(input);
  }, [trackHistoryApply, updateTextHistory, manifestHistory.revokeLocalPush]);
  const handleHistoryApply = useCallback((input?: Dynamic, direction?: Dynamic) => {
    updateTextHistory(input, direction);
    trackHistoryApply(input, direction);
    announce(undoRedoPastTense[direction as keyof typeof undoRedoPastTense]);
  }, [trackHistoryApply, updateTextHistory]);
  const handleHistoryDrop = useCallback((input?: Dynamic, direction?: Dynamic) => {
    updateTextHistory(input, direction === "undo" ? "drop-undo" : "drop-redo");
    manifestHistory.adjustForLocalEviction(input, direction);
    if (direction !== "redo") {
      recordArtboardActivity(input);
      markSelectionFile(input);
      setSelectionChangeTick((tick) => tick + 1);
    }
  }, [recordArtboardActivity, markSelectionFile, updateTextHistory, manifestHistory.adjustForLocalEviction]);
  return { handleHistoryPush, handleHistoryRevoke, handleHistoryApply, handleHistoryDrop };
}
