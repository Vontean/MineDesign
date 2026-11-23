import type { Dynamic } from "../runtime-types";
import { emitEditorEvent } from "../editor/events/runtime";
import { applyElementUndo } from "../editor/undo/elements";
import { trimUndoHistory } from "../editor/undo/history";
import { reactCanvasShape } from "./shape";

type HistoryDirection = "undo" | "redo";

interface ArtboardHistoryOptions {
  artboardComponentId: string;
  previewFile: string;
  componentSessionRef: { current: Dynamic };
  resolveComponentState(name: string): Dynamic;
  tweakPropertiesRef: { current: Dynamic };
  panelMountedRef: { current: boolean };
  frameHoldRef: { current: Dynamic };
  onHistoryApply?(file: string, direction: HistoryDirection): void;
  onHistoryDrop?(file: string, direction: HistoryDirection): void;
}

/** Bridge canvas history operations to one artboard's edit session and live preview. */
export function useArtboardHistory({
  artboardComponentId,
  previewFile,
  componentSessionRef,
  resolveComponentState,
  tweakPropertiesRef,
  panelMountedRef,
  frameHoldRef,
  onHistoryApply,
  onHistoryDrop,
}: ArtboardHistoryOptions) {
  const getUndoDepth = (0, reactCanvasShape.useCallback)(
    (): number | null => resolveComponentState(artboardComponentId)?.undo.length ?? null,
    [resolveComponentState, artboardComponentId],
  );
  const getUndoFloor = (0, reactCanvasShape.useCallback)((): number | null => {
    const state = resolveComponentState(artboardComponentId);
    return state ? state.undoFloor ?? 0 : null;
  }, [resolveComponentState, artboardComponentId]);
  const getRedoDepth = (0, reactCanvasShape.useCallback)(
    (): number | null => resolveComponentState(artboardComponentId)?.redo.length ?? null,
    [resolveComponentState, artboardComponentId],
  );
  const trimUndoHistoryForComponent = (0, reactCanvasShape.useCallback)((keepCount: number) => {
    const state = resolveComponentState(artboardComponentId);
    if (state) trimUndoHistory(state, keepCount);
  }, [resolveComponentState, artboardComponentId]);
  const dropRedoHistory = (0, reactCanvasShape.useCallback)((historyIndex?: number) => {
    const state = resolveComponentState(artboardComponentId);
    const redo = state?.redo;
    if (!redo?.length) return () => {};
    const dropCount = historyIndex === undefined ? 0 : historyIndex - 1 - state.undo.length;
    if (dropCount < 0 || dropCount >= redo.length) return () => {};
    state.redo = redo.slice(redo.length - dropCount);
    return () => {
      if (state.redo.length === 0) state.redo = redo;
    };
  }, [resolveComponentState, artboardComponentId]);
  const flushPendingWrites = (0, reactCanvasShape.useCallback)(async () => {
    await componentSessionRef.current.writeNow(artboardComponentId);
  }, [artboardComponentId, previewFile]);

  const applyHistoryEntry = (0, reactCanvasShape.useCallback)(
    async (name: string, direction: HistoryDirection) => {
      const state = resolveComponentState(name);
      if (!state) return false;
      const depth = state[direction].length;
      const redoDepth = state.redo.length;
      const previousModel = state.model;
      const restored = applyElementUndo(state, direction, { overrides: tweakPropertiesRef.current.values });
      if (!restored) {
        if (state[direction].length < depth) {
          if (direction === "undo") {
            for (let index = state.redo.length; index < redoDepth; index++) {
              onHistoryDrop?.(previewFile, "redo");
            }
          }
          onHistoryDrop?.(previewFile, direction);
        }
        return false;
      }

      onHistoryApply?.(previewFile, direction);
      if (restored.kind === "prop" || restored.kind === "script") {
        if (restored.kind === "prop") {
          tweakPropertiesRef.current.setProp(restored.prop, restored.liveValue);
        } else {
          emitEditorEvent("dc-update", {
            name,
            path: state.path,
            kind: "js",
            content: restored.js,
            streaming: false,
            viewportKey: "dc-model",
          });
        }
        state.dirty = true;
        return panelMountedRef.current ? true : (await componentSessionRef.current.writeNow(name)) !== "failed";
      }

      state.dirty = true;
      if (!panelMountedRef.current) componentSessionRef.current.writeNow(name);
      state.stampGen = (state.stampGen ?? -1) + 1;
      state.liveStampsStale = false;
      componentSessionRef.current.pushLive(name);
      frameHoldRef.current.onTemplateRestored?.(name, previousModel);
      return (await componentSessionRef.current.writeNow(name)) !== "failed";
    },
    [],
  );

  return {
    getUndoDepth, getUndoFloor, getRedoDepth, trimUndoHistoryForComponent,
    dropRedoHistory, flushPendingWrites, applyHistoryEntry,
  };
}
