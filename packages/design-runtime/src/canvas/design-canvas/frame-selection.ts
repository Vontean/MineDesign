import { reactChromeTheme as React } from "../../editor/chrome/theme";
import { applyHostSelectionResponse, HostValue } from "../../editor/selection/canvas-selection";
import type { Dynamic } from "../../runtime-types";
import type { FrameSelection } from "../frame-messages";
import { keyboardNavigationMode } from "../keyboard-navigation";
import { isSessionCancelMessage } from "../working-state";

type Ref<T> = { current: T };
type SelectionTids = number[] | null;
type PendingFrameCommand = { token: string; at: number };
interface SelectionFrame {
  isReady(): boolean;
  setShownSelection(tids: SelectionTids, name: Dynamic, token?: string, sequence?: number): boolean;
}

interface FrameSelectionOptions {
  readonly frames: Ref<Map<string, SelectionFrame>>;
  focusedFile: Ref<string | null>;
  selection: Ref<Dynamic>;
  selectionEpoch: Ref<number>;
  selectionGesture: Ref<{ noteSelection(file: string, tids: SelectionTids, token?: string): boolean | void } | null>;
  sessionCancelTarget: Ref<Dynamic>;
  ignoreClearFromFile: Ref<string | null>;
  componentName(file: string): Dynamic;
  abandonSelectionGesture(): number;
  setSelection(selection: Dynamic): void;
  focus(file: string): Promise<unknown>;
  selectBoard(file: string, additive: boolean): void;
}

interface FrameSelectionBindings extends FrameSelectionOptions {
  tokensByFile: Ref<Map<string, string>>;
  lastReportedSequence: Ref<Map<string, number>>;
  acknowledgments: Ref<Map<string, () => void>>;
  pendingReplay: Ref<{ file: string } | null>;
  activeCommand: Ref<PendingFrameCommand | null>;
  setShownFrameSelection(file: string, tids: SelectionTids, token?: string): string | null;
}

const recentCommandMs = 2000;

/** 管理画布与画板之间的选区同步、回执和聚焦后的选区恢复。 */
export function useFrameSelection(options: FrameSelectionOptions) {
  const { useRef, useMemo } = React;
  const tokensByFile: FrameSelectionBindings["tokensByFile"] = useRef(new Map());
  const lastReportedSequence: FrameSelectionBindings["lastReportedSequence"] = useRef(new Map());
  const acknowledgments: FrameSelectionBindings["acknowledgments"] = useRef(new Map());
  const pendingReplay: FrameSelectionBindings["pendingReplay"] = useRef(null);
  const activeCommand: FrameSelectionBindings["activeCommand"] = useRef(null);
  const tokenSequence: Ref<number> = useRef(0);

  return useMemo(() => {
    function registerToken(file: string, replayToken?: string) {
      const token = replayToken ?? HostValue + String(++tokenSequence.current);
      tokensByFile.current.set(file, token);
      return token;
    }

    function setShownFrameSelection(file: string, tids: SelectionTids, replayToken?: string) {
      const frame = options.frames.current.get(file);
      if (!frame) return null;
      const token = registerToken(file, replayToken);
      return frame.setShownSelection(tids, tids ? options.componentName(file) : null, token, lastReportedSequence.current.get(file) ?? 0)
        ? token
        : null;
    }

    const bindings: FrameSelectionBindings = {
      focusedFile: options.focusedFile,
      selection: options.selection,
      selectionEpoch: options.selectionEpoch,
      selectionGesture: options.selectionGesture,
      sessionCancelTarget: options.sessionCancelTarget,
      ignoreClearFromFile: options.ignoreClearFromFile,
      componentName: options.componentName,
      abandonSelectionGesture: options.abandonSelectionGesture,
      setSelection: options.setSelection,
      focus: options.focus,
      selectBoard: options.selectBoard,
      get frames() { return options.frames; },
      tokensByFile, lastReportedSequence, acknowledgments, pendingReplay, activeCommand, setShownFrameSelection,
    };

    return {
      receive(file: string, event: FrameSelection) {
        routeFrameSelectionEvent(bindings, file, event);
      },
      apply(selection: Dynamic, settings?: { repush?: Iterable<string> }) {
        commitCanvasSelection(bindings, selection, settings);
      },
      focusAndReplay(file: string) {
        return focusArtboardAndReplaySelection(bindings, file);
      },
      recordSequence(file: string, sequence: number) {
        lastReportedSequence.current.set(file, sequence);
      },
      resetSequence(file: string) {
        lastReportedSequence.current.delete(file);
      },
      clearShown(file: string) {
        const frame = options.frames.current.get(file);
        if (frame) frame.setShownSelection(null, null, registerToken(file));
      },
      setShown: setShownFrameSelection,
      markCommandPending(file: string) {
        const token = tokensByFile.current.get(file);
        if (token != null) activeCommand.current = { token, at: Date.now() };
      },
      clearCommand() {
        activeCommand.current = null;
      },
      hasRecentCommand() {
        const command = activeCommand.current;
        return command != null && Date.now() - command.at < recentCommandMs;
      },
      isReplayingFile(file: string | null) {
        const replay = pendingReplay.current;
        return replay != null && replay.file === file;
      },
    };
  }, [options.abandonSelectionGesture]);
}

function routeFrameSelectionEvent(deps: FrameSelectionBindings, file: string, event: FrameSelection) {
  if (file !== deps.focusedFile.current) return;
  if (file === deps.pendingReplay.current?.file && event.tids?.length) deps.pendingReplay.current = null;

  const token = event.re;
  const isHostResponse = token != null && token.startsWith(HostValue);
  if (isHostResponse) {
    deps.acknowledgments.current.get(token)?.();
    if (token === deps.activeCommand.current?.token) deps.activeCommand.current = null;
    if (token !== deps.tokensByFile.current.get(file)) return;
  }
  if (isSessionCancelMessage(token, deps.sessionCancelTarget.current)) {
    deps.sessionCancelTarget.current = null;
    return;
  }
  if (event.artboard) {
    deps.selectBoard(file, event.additive === true);
    return;
  }

  const entry = event.tids?.length ? {
    name: event.name ?? null,
    tids: event.tids,
    rect: event.rect ?? null,
    count: event.tids.length,
    part: event.part,
  } : null;
  const directSelection = !isHostResponse && !(token != null && token.startsWith(keyboardNavigationMode));
  if (directSelection && !event.additive && entry === null && deps.ignoreClearFromFile.current === file) {
    deps.ignoreClearFromFile.current = null;
    return;
  }
  if (deps.selectionGesture.current?.noteSelection(file, entry?.tids ?? null, token) === false) return;
  if (directSelection) {
    if (entry !== null) deps.ignoreClearFromFile.current = null;
    deps.selectionEpoch.current++;
  }
  const response = applyHostSelectionResponse(deps.selection.current, file, {
    entry,
    additive: event.additive === true,
    re: token,
  });
  if (response.kind === "confirm") return;
  deps.selection.current = response.next;
  deps.setSelection(response.next);
  if (response.pushback === "clear") deps.setShownFrameSelection(file, null);
}

function sameTids(left: number[] | undefined, right: number[] | undefined) {
  return left === right || (
    left != null && right != null && left.length === right.length &&
    left.every((tid, index) => tid === right[index])
  );
}

function commitCanvasSelection(
  deps: FrameSelectionBindings,
  nextSelection: Dynamic,
  settings?: { repush?: Iterable<string> },
) {
  const previousSelection = deps.selection.current;
  deps.selection.current = nextSelection;
  deps.setSelection(nextSelection);
  const focusedFile = deps.focusedFile.current;
  for (const file of settings?.repush ?? []) {
    if (file === focusedFile) continue;
    const tids: number[] | undefined = nextSelection.elements.get(file)?.tids;
    if (tids == null) continue;
    for (const delay of [0, 150, 600]) {
      window.setTimeout(() => {
        const currentTids = deps.selection.current.elements.get(file)?.tids;
        if (deps.focusedFile.current !== file && currentTids === tids) {
          deps.frames.current.get(file)?.setShownSelection(tids, deps.componentName(file));
        }
      }, delay);
    }
  }

  if (focusedFile == null) return;
  const previousTids: number[] | undefined = previousSelection.elements.get(focusedFile)?.tids;
  const nextTids: number[] | undefined = nextSelection.elements.get(focusedFile)?.tids;
  const repush = settings?.repush != null && [...settings.repush].includes(focusedFile);
  if (sameTids(previousTids, nextTids) && !(repush && nextTids != null)) return;
  const token = deps.setShownFrameSelection(focusedFile, nextTids ?? null);
  if (!repush || nextTids == null || token == null) return;

  for (const delay of [150, 600]) {
    window.setTimeout(() => {
      const currentTids = deps.selection.current.elements.get(focusedFile)?.tids;
      if (deps.focusedFile.current === focusedFile && deps.tokensByFile.current.get(focusedFile) === token &&
        sameTids(currentTids, nextTids)) {
        deps.setShownFrameSelection(focusedFile, nextTids, token);
      }
    }, delay);
  }
}

/** 等待 iframe 就绪，重发元素选区，直到收到回执、用户改选或超时。 */
function focusArtboardAndReplaySelection(deps: FrameSelectionBindings, file: string): Promise<boolean> {
  const selectionEpoch = deps.abandonSelectionGesture();
  const pending = deps.focusedFile.current !== file ? { file } : null;
  if (pending) deps.pendingReplay.current = pending;

  function clearPending() {
    if (pending && deps.pendingReplay.current === pending) deps.pendingReplay.current = null;
  }
  return deps.focus(file).then(() => new Promise<boolean>((resolve) => {
    const sequence = deps.lastReportedSequence.current.get(file);
    const tokens: string[] = [];
    let pollCount = 0;
    let lastPushAt = 0;
    let confirmed = false;

    function finish() {
      for (const token of tokens) deps.acknowledgments.current.delete(token);
      clearPending();
      resolve(confirmed || (deps.focusedFile.current === file && deps.selection.current.elements.has(file)));
    }

    function poll() {
      if (confirmed || deps.selectionEpoch.current !== selectionEpoch ||
        deps.lastReportedSequence.current.get(file) !== sequence) {
        finish();
        return;
      }
      const entry = deps.selection.current.elements.get(file);
      const focused = deps.focusedFile.current;
      if (!entry || (focused != null && focused !== file) || tokens.length >= 25 || pollCount++ >= 400) {
        finish();
        return;
      }
      const frame = deps.frames.current.get(file);
      if (Date.now() - lastPushAt >= 300 && focused === file && frame?.isReady()) {
        deps.setShownFrameSelection(file, null);
        const token = deps.setShownFrameSelection(file, entry.tids);
        if (token) {
          lastPushAt = Date.now();
          tokens.push(token);
          deps.acknowledgments.current.set(token, () => {
            confirmed = true;
            finish();
          });
        }
      }
      window.setTimeout(poll, 60);
    }
    window.setTimeout(poll, 60);
  })).catch(() => {
    clearPending();
    return false;
  });
}
