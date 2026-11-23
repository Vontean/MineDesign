import { reactChromeTheme as React } from "../../editor/chrome/theme";
import { equalPropValues } from "../../editor/components/prop-validation";
import { ModelModelStateLimit } from "../../editor/model/model-state";
import type { Dynamic } from "../../runtime-types";
import type { CanvasManifest, HistoryDirection } from "../manifest-history";
import { applyCanvasHistoryStep, applyUndoRedoStep, recordCanvasHistoryStep } from "./history";

type Ref<T> = { current: T };
type HistoryDepth = [file: string, depth: number | null | undefined];
interface ManifestHistoryEntry {
  op: Dynamic;
  at: number;
  depths: HistoryDepth[];
  bound?: Dynamic;
  sealed?: boolean;
  nudgeKey?: string;
  cssKey?: string;
}

interface ManifestHistoryOptions {
  doc: Dynamic;
  manifest: CanvasManifest;
  latestManifest: Ref<CanvasManifest>;
  savedManifest: Ref<CanvasManifest>;
  page: Ref<string>;
  frames: Ref<Map<string, { dropRedo(): () => void }>>;
  hostGesturing: Ref<boolean>;
  textEdit: Ref<Dynamic>;
  pendingRecords: Ref<Map<Dynamic, () => void>>;
  boundRecordMergers: Ref<Map<Dynamic, (step: Dynamic) => void>>;
  switchPage(page: string, file?: string): void;
  persist(next: Dynamic, base?: Dynamic): void;
  showToast(message: Dynamic, kind?: Dynamic): void;
  say(message: Dynamic): void;
  clearInlineRedo(): (() => void) | undefined;
  clearKeptRedo(): (() => void) | undefined;
  inlineHistory(): Dynamic;
  whenReady(condition: () => boolean, action: () => void): void;
}

/** 作品级历史记录画板、页面与批注的变更，并以画板本地历史深度判断可撤销性。 */
export function useCanvasManifestHistory(options: ManifestHistoryOptions) {
  const { useRef, useState, useCallback } = React;
  const undo: Ref<ManifestHistoryEntry[]> = useRef([]);
  const redo: Ref<ManifestHistoryEntry[]> = useRef([]);
  const applying: Ref<ManifestHistoryEntry | null> = useRef(null);
  const generation: Ref<number> = useRef(0);
  const trimmedUndoCount: Ref<number> = useRef(0);
  const localDepths: Ref<Map<string, number>> = useRef(new Map());
  const revokedPush: Ref<{ file: string; restore(): void } | null> = useRef(null);
  const markIds: Ref<WeakMap<ManifestHistoryEntry, number>> = useRef(new WeakMap());
  const nextMarkId: Ref<number> = useRef(1);
  const [revision, setRevision] = useState(0);
  const notify = useCallback(() => setRevision((previous: number) => previous + 1), []);

  const undoTip = useCallback(() => undo.current.at(-1), []);
  const removeUndoTip = useCallback(() => {
    undo.current.pop();
    notify();
  }, [notify]);
  const localDepth = useCallback((file: string) => localDepths.current.get(file) ?? 0, []);
  const adjustLocalDepth = useCallback((file: string, delta: number) => {
    localDepths.current.set(file, localDepth(file) + delta);
  }, [localDepth]);
  const invalidateRedo = useCallback(() => {
    const before = ++generation.current;
    revokedPush.current = null;
    const previousRedo = redo.current;
    redo.current = [];
    const rollsBack = [
      options.clearInlineRedo() ?? (() => {}),
      options.clearKeptRedo() ?? (() => {}),
    ];
    for (const frame of options.frames.current.values()) rollsBack.push(frame.dropRedo());
    if (previousRedo.length > 0) notify();
    return () => {
      if (generation.current === before) generation.current = before - 1;
      if (redo.current.length === 0) redo.current = previousRedo;
      for (const rollBack of rollsBack) rollBack();
      notify();
    };
  }, [notify]);
  const rememberLocalPush = useCallback((file: string) => {
    revokedPush.current = { file, restore: invalidateRedo() };
    adjustLocalDepth(file, 1);
  }, [invalidateRedo, adjustLocalDepth]);
  const revokeLocalPush = useCallback((file: string) => {
    const pending = revokedPush.current;
    revokedPush.current = null;
    if (pending?.file === file) pending.restore();
  }, []);
  const adjustForLocalEviction = useCallback((file: string, direction: HistoryDirection) => {
    const currentDepth = localDepth(file);
    const firstAffectedDepth = direction === "undo" ? currentDepth : currentDepth + 1;
    const applyingEntry = applying.current;
    const entries = [...undo.current, ...redo.current, ...(applyingEntry ? [applyingEntry] : [])];
    for (const { depths } of entries) {
      for (const depth of depths) {
        if (depth[0] === file && depth[1] != null && depth[1] >= firstAffectedDepth) depth[1]--;
      }
    }
    notify();
    if (direction !== "redo") localDepths.current.set(file, currentDepth - 1);
  }, [localDepth, notify]);

  const { manifest, persist, switchPage, say, showToast, whenReady } = options;
  const record = useCallback((step: Dynamic, excluded: Set<string>, extras?: Iterable<string>, bound?: Dynamic) =>
    recordCanvasHistoryStep({
      pendingRecords: options.pendingRecords,
      boundRecordMergers: options.boundRecordMergers,
      textEdit: options.textEdit,
      undo,
      notify,
      trimmedUndoCount,
      invalidateRedo,
      localDepths,
      manifest,
    }, step, excluded, extras, bound), [manifest, notify, invalidateRedo]);

  const reachable = useCallback((direction: HistoryDirection) => {
    const entry = (direction === "undo" ? undo.current : redo.current).at(-1);
    if (!entry || entry.depths.some(([file, depth]) => localDepth(file) !== (depth ?? 0))) return null;
    return entry;
  }, [localDepth]);

  const recordTweak = useCallback((file: string, before: Dynamic, after: Dynamic, merge = true) => {
    const previous = undoTip();
    const changed = Object.keys(after);
    const key = changed.length === 1 ? changed[0] : undefined;
    const priorKeys = previous?.op.kind === "tweak" ? Object.keys(previous.op.to) : [];
    if (merge && key !== undefined && previous?.op.kind === "tweak" && !previous.sealed &&
      previous.op.file === file && priorKeys.length === 1 && priorKeys[0] === key &&
      Date.now() - previous.at < ModelModelStateLimit && reachable("undo") === previous) {
      previous.op = { ...previous.op, to: after };
      previous.at = Date.now();
      invalidateRedo();
      if (equalPropValues(previous.op.from[key], after[key])) removeUndoTip();
      return;
    }
    record({ kind: "tweak", file, from: before, to: after }, new Set<string>());
    const added = undoTip();
    if (!merge && added) added.sealed = true;
  }, [undoTip, reachable, record, invalidateRedo, removeUndoTip]);

  const discardBound = useCallback((key: Dynamic) => {
    function discard() {
      const previousLength = undo.current.length + redo.current.length;
      undo.current = undo.current.filter((step) => step.bound !== key);
      redo.current = redo.current.filter((step) => step.bound !== key);
      if (undo.current.length + redo.current.length !== previousLength) notify();
    }
    if (applying.current?.bound === key) whenReady(() => applying.current === null, discard);
    else discard();
  }, [whenReady, notify]);

  const applyToDocument = useCallback((step: Dynamic, direction: HistoryDirection) => applyCanvasHistoryStep({
    doc: options.doc,
    frames: options.frames,
    switchPage,
    savedManifest: options.savedManifest,
    activePage: options.page,
    persist,
  }, step, direction), [persist, switchPage]);

  const applyBound = useCallback((key: Dynamic, direction: HistoryDirection, onSkipped?: () => void) => {
    const bridge = options.inlineHistory();
    if (!bridge) {
      onSkipped?.();
      return;
    }
    whenReady(() => !bridge.busy(), () => {
      if (bridge.headBound(direction) !== key) {
        onSkipped?.();
        return;
      }
      if (direction === "undo") bridge.undo();
      else bridge.redo();
    });
  }, [whenReady]);

  const apply = useCallback((direction: HistoryDirection, linkedStepAlreadyApplied = false) => applyUndoRedoStep({
    showToast, say, hostGesturing: options.hostGesturing, undo, redo, notify, generation,
    applyToDocument, reachable, applying, applyBound, localDepths, latestManifest: options.latestManifest,
  }, direction, linkedStepAlreadyApplied), [showToast, say, notify, applyToDocument, reachable, applyBound]);

  const mark = useCallback(() => {
    const tail = undoTip();
    if (tail && !markIds.current.has(tail)) markIds.current.set(tail, nextMarkId.current++);
    const depths = [...localDepths.current]
      .filter(([, depth]) => depth !== 0)
      .map(([file, depth]) => file + "=" + String(depth)).sort().join(",");
    const lastId = tail === undefined ? "" : String(markIds.current.get(tail));
    return String(undo.current.length) + ":" + lastId + "/" + String(redo.current.length) + "|" + depths + "#" + String(generation.current);
  }, [undoTip]);
  const depth = useCallback(() => trimmedUndoCount.current + undo.current.length +
    [...localDepths.current.values()].reduce((sum, count) => sum + count, 0), []);
  const isApplying = useCallback(() => applying.current !== null, []);

  return {
    revision, record, recordTweak, apply, reachable, isApplying, discardBound,
    undoTip, removeUndoTip, invalidateRedo, notify, mark, depth,
    localDepth, adjustLocalDepth, rememberLocalPush, revokeLocalPush, adjustForLocalEviction,
  };
}
