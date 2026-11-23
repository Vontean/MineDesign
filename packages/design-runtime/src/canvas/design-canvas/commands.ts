import { uiMessage } from "@minedesign/contracts/ui-messages";
import {
  AccessibilityAnnouncementsUndoRedoConfig,
  CutValue,
  DeletedValue,
  flipDirectionAnnouncement,
} from "../../editor/accessibility/announcements";
import { announce } from "../../editor/accessibility/announcer";
import { reactChromeTheme as React } from "../../editor/chrome/theme";
import { ClipboardFileTransferRegistry } from "../../editor/clipboard/file-transfer";
import { getActiveClipboardSource, getAnnotationClipboard, getArtboardClipboard, startClipboardMark } from "../../editor/clipboard/state";
import { flipAnnotations } from "../../editor/geometry/flip-annotations";
import { isApplePlatform, keyboardShortcutLabel } from "../../editor/keyboard/shortcuts";
import { canvasBoardSelection, boardSelectionCount, emptyBoardSelection, emptyCanvasSelection, selectionFromBoards } from "../../editor/selection/canvas-selection";
import { hasBlockingEditorOverlay, hasHeldUndoOverlay } from "../../editor/text/typing-target";
import type { Dynamic } from "../../runtime-types";
import type { CanvasManifest, HistoryDirection } from "../manifest-history";
import { canvasSelectionsEqual, hasActiveUserGesture } from "./shared";
import { pointerCoordinates } from "../paste-placement";
import { selectionNavigationScope, sessionAllowsMutation } from "../working-state";

type Ref<T> = { current: T };
type Axis = "horizontal" | "vertical";
type Nudge = { dx: number; dy: number; repeat: boolean };
type ClipboardInfo = { seen: { artboards?: unknown; text: string; stamp: unknown; hasImage: boolean } };
type Navigate = { kind: "enter" | "parent" | "next" | "prev" | "all" } | ({ kind: "nudge" } & Nudge);
type InlineHistory = { busy(): boolean; undo(): string; redo(): string };

interface CanvasCommandOptions {
  focusedFile: Ref<string | null>;
  selection: Ref<Dynamic>;
  readonly manifest: Ref<CanvasManifest>;
  readonly editing: Ref<boolean>;
  readonly gesturing: Ref<boolean>;
  moveCommits: Ref<number>;
  pendingSelectionEdits: Ref<number>;
  readonly container: Ref<HTMLElement | null>;
  combinedSelection: boolean;
  selectBoard(file: string): void;
  escape(): boolean;
  navigate(command: Navigate): void;
  abandonSelectionGesture(): void;
  applySelection(selection: Dynamic): void;
  afterSelectionEdits(run: () => void, onCancel?: () => void): void;
  hasRecentFrameCommand(): boolean;
  history: {
    readonly manifest: Ref<{ reachable(direction: HistoryDirection): unknown; apply(direction: HistoryDirection): void }>;
    inline(): InlineHistory | null;
    prepare(direction: HistoryDirection): void;
  };
  clipboard: {
    copyElements(mark?: Dynamic): boolean;
    pointer(): { overAnnotation?: boolean } | null;
    pasteBoards(boards: Dynamic, annotations: Dynamic, point: Dynamic): void;
    pasteAtPointer(pointer: Dynamic): void;
  };
  deleteElements(message: Dynamic, settings?: { elementsOnly: boolean }): boolean;
  deleteSelection(): void;
  duplicate(settings: { elementsOnly?: boolean }): boolean;
  flip(axis: Axis, settings: { elementsOnly?: boolean; then?(message?: string, includeDirection?: boolean): boolean }): void;
  report(message: Dynamic): void;
  say(message: Dynamic): void;
}

/** 让跨画板变更在提交或超时时释放命令占用。 */
export function useCanvasCommandHolds() {
  const pending: Ref<number> = React.useRef(0);
  const hold = React.useCallback((timeoutMs: number) => {
    let released = false;
    pending.current++;
    const timer = window.setTimeout(release, timeoutMs);
    function release() {
      if (released) return;
      released = true;
      window.clearTimeout(timer);
      pending.current--;
    }
    return release;
  }, []);
  return { pending, hold };
}

/** 为画板保留稳定的命令入口，执行时读取画布当前的选区和会话状态。 */
export function useCanvasCommandRouting(options: CanvasCommandOptions) {
  const current: Ref<CanvasCommandOptions> = React.useRef(options);
  current.current = options;
  return React.useCallback((
    key?: string, clipboard?: ClipboardInfo, fromPreview = false, nudge?: Nudge,
  ) => dispatchCanvasCommand(current.current, key, clipboard, fromPreview, nudge), []);
}

function dispatchCanvasCommand(
  options: CanvasCommandOptions,
  key: string | undefined,
  clipboard: ClipboardInfo | undefined,
  fromPreview: boolean,
  nudge: Nudge | undefined,
): boolean {
  switch (key) {
    case "artboard": {
      const file = options.focusedFile.current;
      if (file == null) return false;
      options.selectBoard(file);
      return true;
    }
    case "escape":
      return !fromPreview && options.escape();
    case "deselect": {
      const file = options.focusedFile.current;
      const active = options.pendingSelectionEdits.current > 0 || options.hasRecentFrameCommand();
      if (fromPreview || file == null || !active || !options.selection.current.elements.has(file)) return false;
      options.afterSelectionEdits(() => {
        options.abandonSelectionGesture();
        options.applySelection(emptyCanvasSelection);
      });
      return true;
    }
    case "enter":
    case "parent":
    case "next":
    case "prev":
    case "a":
    case "nudge":
      return navigateSelection(options, key, fromPreview, nudge);
    case "z":
    case "Z":
      return applyHistory(options, key === "Z" ? "redo" : "undo");
    case "v":
      return pasteSelection(options, clipboard);
  }
  if (key === "d" && (options.moveCommits.current > 0 ||
    (options.combinedSelection && options.pendingSelectionEdits.current > 0))) return true;
  if (key === "x" && options.combinedSelection && options.pendingSelectionEdits.current > 0) {
    return dropClipboardMark(fromPreview);
  }
  if (!options.combinedSelection) return false;

  switch (key) {
    case "c":
      if (options.pendingSelectionEdits.current === 0) return options.clipboard.copyElements();
      const mark = startClipboardMark();
      options.afterSelectionEdits(() => { options.clipboard.copyElements(mark); }, mark.drop);
      return true;
    case "x":
      if (!sessionAllowsMutation({ gesturing: options.gesturing.current, setMoveCommits: options.moveCommits.current })) {
        return dropClipboardMark(fromPreview);
      }
      if (!options.clipboard.copyElements()) return false;
      options.deleteElements(CutValue, { elementsOnly: true });
      return true;
    case "delete-while-writing":
      if (options.pendingSelectionEdits.current === 0 && !options.hasRecentFrameCommand()) return false;
      return deleteSelection(options, fromPreview);
    case "delete":
      return deleteSelection(options, fromPreview);
    case "flip-horizontal":
    case "flip-vertical":
      return flipSelection(options, key === "flip-horizontal" ? "horizontal" : "vertical", fromPreview);
    case "d":
      return duplicateSelection(options, fromPreview);
    default:
      return false;
  }
}

function navigateSelection(
  options: CanvasCommandOptions,
  key: "enter" | "parent" | "next" | "prev" | "a" | "nudge",
  fromPreview: boolean,
  nudge: Nudge | undefined,
) {
  if (fromPreview || !options.combinedSelection) return false;
  if (key === "nudge") {
    if (!nudge) return false;
    options.navigate({ kind: "nudge", dx: nudge.dx, dy: nudge.dy, repeat: nudge.repeat });
  } else if (key === "a") {
    if (selectionNavigationScope(options.selection.current, false) === "panel") return false;
    options.navigate({ kind: "all" });
  } else {
    options.navigate({ kind: key });
  }
  return true;
}

function applyHistory(options: CanvasCommandOptions, direction: HistoryDirection) {
  if (hasHeldUndoOverlay() || options.history.inline()?.busy() || options.moveCommits.current > 0) return true;
  options.history.prepare(direction);
  const manifest = options.history.manifest.current;
  if (manifest.reachable(direction)) {
    manifest.apply(direction);
    return true;
  }
  const inline = options.history.inline();
  if (!inline) return true;
  const outcome = direction === "undo" ? inline.undo() : inline.redo();
  if (outcome === "skipped-all") {
    options.say(uiMessage("canvas.designCanvas.nothingLeftTo") + direction + " — that artboard's history changed.");
  } else if (outcome === "empty") {
    announce(AccessibilityAnnouncementsUndoRedoConfig[direction]);
  }
  return true;
}

function pasteSelection(options: CanvasCommandOptions, clipboard?: ClipboardInfo) {
  if (clipboard?.seen.artboards != null && getActiveClipboardSource(clipboard.seen) === "foreign-artboards") {
    if (!options.editing.current) return false;
    if (hasActiveUserGesture() && !hasBlockingEditorOverlay()) {
      const file = options.focusedFile.current;
      const target = file == null ? null : options.container.current?.querySelector<HTMLElement>(
        `[data-mega-artboard="${CSS.escape(file)}"] :is([data-mega-chrome="expand"], [data-mega-chrome="play"])`,
      );
      if (target) target.focus({ preventScroll: true });
      else (document.activeElement as HTMLElement | null)?.blur();
      window.focus();
      options.report(ClipboardFileTransferRegistry.pressAgain(keyboardShortcutLabel("V")));
    }
    return true;
  }
  const pointer = hasActiveUserGesture() && !hasBlockingEditorOverlay() ? options.clipboard.pointer() : null;
  if (pointer == null) return false;
  const annotations = getAnnotationClipboard();
  if (pointer.overAnnotation && annotations.length === 0) return false;
  const source = getActiveClipboardSource(clipboard?.seen ?? { text: "", stamp: null, hasImage: false });
  if (source === "text") return false;
  const boards = getArtboardClipboard();
  if (source === "artboards" && boards) {
    options.clipboard.pasteBoards(boards, annotations, pointerCoordinates(pointer));
  } else {
    if (pointer.overAnnotation) return false;
    options.clipboard.pasteAtPointer(pointer);
  }
  return true;
}

function dropClipboardMark(fromPreview: boolean) {
  if (fromPreview) startClipboardMark().drop();
  return true;
}

function deleteSelection(options: CanvasCommandOptions, fromPreview: boolean) {
  options.afterSelectionEdits(() => {
    if (!fromPreview) {
      options.deleteSelection();
      return;
    }
    const boards = canvasBoardSelection(options.selection.current);
    if (options.deleteElements(DeletedValue, { elementsOnly: true }) && boardSelectionCount(boards) > 0) {
      announceOutsideSelection(options, uiMessage("canvas.designCanvas.theArtboardsAndNotesStay"));
    }
  });
  return true;
}

function flipSelection(options: CanvasCommandOptions, axis: Axis, fromPreview: boolean) {
  if (!fromPreview) {
    options.flip(axis, {});
    return true;
  }
  const selectionBefore = options.selection.current;
  const boards = canvasBoardSelection(selectionBefore);
  const shortcut = (isApplePlatform() ? "⇧" : "Shift+") + (axis === "horizontal" ? "H" : "V");
  options.flip(axis, {
    elementsOnly: true,
    then(message, includeDirection) {
      if (!options.editing.current || !canvasSelectionsEqual(selectionBefore, options.selection.current)) return false;
      const annotations = (options.manifest.current.annotations ?? []).filter(({ id }) => boards.notes.has(id));
      if (flipAnnotations(annotations, axis).flips.length === 0) return false;
      options.abandonSelectionGesture();
      options.applySelection(selectionFromBoards(boards));
      const prefix = message !== undefined ? message + " " : includeDirection ? flipDirectionAnnouncement(axis) + ". " : "";
      announceOutsideSelection(options, prefix + uiMessage("canvas.designCanvas.press") + shortcut +
        " again to flip what is outside the artboards, which stays selected.");
      return true;
    },
  });
  return true;
}

function duplicateSelection(options: CanvasCommandOptions, fromPreview: boolean) {
  const boards = fromPreview ? canvasBoardSelection(options.selection.current) : emptyBoardSelection;
  if (options.duplicate(fromPreview ? { elementsOnly: true } : {}) && boardSelectionCount(boards) > 0) {
    options.applySelection(selectionFromBoards(boards));
    announceOutsideSelection(options, uiMessage("canvas.designCanvas.theArtboardsAndNotesStay2") +
      keyboardShortcutLabel("D") + " again to copy them");
  }
  return true;
}

function announceOutsideSelection(options: CanvasCommandOptions, message: Dynamic) {
  const focused = document.activeElement;
  if (focused instanceof HTMLElement && focused.tagName === "IFRAME") focused.blur();
  window.focus();
  announce(message);
  options.say(message);
}
