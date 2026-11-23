import type { Dynamic } from "../runtime-types";
import {
  CssEditValidationBackgroundBackgroundColorSet as backgroundProperties,
  isSafeBackgroundStyle,
  normalizeStyleEdits,
} from "../editor/css/edit-validation";
import { DcTplAttribute } from "../editor/html/authoring";
import { ModelModelStateLimit as undoMergeWindowMs } from "../editor/model/model-state";
import { arrowSnapshotsForPropertyChange, restoreArrowSnapshots } from "../editor/svg/arrow-editing";
import { knownWebFontFamily } from "../editor/typography/font-catalog";
import { firstFontFamily } from "../editor/typography/font-family";
import { reactCanvasShape } from "./shape";

type StyleEdit = [property: string, value: string | null];
type StyleEdits = readonly StyleEdit[];
export type BackgroundEdit = { prop: string; value: string | null };

interface StyleCommandOptions {
  artboardComponentId: string;
  previewFile: string;
  componentSessionRef: { current: Dynamic };
  resolveComponentState(component: string): Dynamic;
}

interface FillHistory {
  key: string;
  at: number;
  depth: number;
  top: unknown;
}

function wasApplied(status: unknown) {
  return status === "applied" || status === "applied-dirty";
}

function setElementStyles(model: Dynamic, tid: number, edits: StyleEdits) {
  let changed = false;
  for (const [property, value] of edits) {
    if (model.setStyleProperty(tid, property, value)) changed = true;
  }
  return changed;
}

/** Serialize all canvas style writes and own the undo boundaries of a style gesture. */
export function useArtboardStyleCommands({
  artboardComponentId,
  previewFile,
  componentSessionRef,
  resolveComponentState,
}: StyleCommandOptions) {
  const queue: { current: Promise<unknown> } = (0, reactCanvasShape.useRef)(Promise.resolve());
  const lastFill: { current: FillHistory | null } = (0, reactCanvasShape.useRef)(null);
  const gestureStart: { current: string | null } = (0, reactCanvasShape.useRef)(null);
  const editCounts: { current: WeakMap<Element, number> } = (0, reactCanvasShape.useRef)(new WeakMap());

  const enqueue: <T>(write: () => T) => Promise<Awaited<T>> = (0, reactCanvasShape.useCallback)(
    <T>(write: () => T) => {
      const result = queue.current.then(write, write);
      queue.current = result.catch(() => {});
      return result;
    },
    [],
  );

  const setStylePropsPerTid = (0, reactCanvasShape.useCallback)(
    (edits: Iterable<[number, StyleEdits]>, options?: { undo?: boolean }) => {
      const editsById = new Map<number, StyleEdits>();
      for (const [tid, changes] of edits) {
        const normalized = normalizeStyleEdits(changes);
        if (normalized.length > 0) editsById.set(tid, normalized);
      }
      if (editsById.size === 0) return Promise.resolve(false);

      return enqueue(async () => {
        const status = await componentSessionRef.current.mutate(
          artboardComponentId,
          (model: Dynamic, state: Dynamic) => {
            if (state.path !== previewFile) return false;
            const changes = [...editsById.values()].flat();
            const arrows = arrowSnapshotsForPropertyChange(state.model, editsById.keys(), changes.map(([property]) => property));
            let updated = false;
            for (const [tid, edits] of editsById) {
              if (state.model.element(tid) && setElementStyles(model, tid, edits)) updated = true;
            }
            if (!updated) return false;
            restoreArrowSnapshots(state.model, arrows);
            for (const [property, value] of changes) {
              if (property !== "font-family" || !value) continue;
              const family = knownWebFontFamily(firstFontFamily(value));
              if (family !== undefined) model.ensureWebfontLink(family);
            }
            return true;
          },
          { structural: false, pushUndo: options?.undo ?? true },
        );
        return wasApplied(status);
      });
    },
    [artboardComponentId, previewFile, enqueue],
  );

  const pageFill = (0, reactCanvasShape.useCallback)(
    () => componentSessionRef.current.ensureModel(artboardComponentId).then(
      (state: Dynamic) => state && state.path === previewFile ? state.model.pageFill() : null,
    ),
    [artboardComponentId, previewFile],
  );

  const setPageFill = (0, reactCanvasShape.useCallback)((edits: BackgroundEdit[]) => {
    const normalized = edits.map(({ prop, value }) => ({
      prop,
      value: value === null ? null : isSafeBackgroundStyle(prop, value),
    }));
    if (
      normalized.length === 0 ||
      normalized.some(({ prop, value }, index) =>
        !backgroundProperties.has(prop) || (edits[index].value !== null && value === null),
      )
    ) return Promise.resolve(false);

    return enqueue(async () => {
      const state = resolveComponentState(artboardComponentId);
      const key = normalized.map(({ prop }) => prop).join("+");
      const at = Date.now();
      const previous = lastFill.current;
      const mergeUndo = previous != null && state != null && previous.key === key &&
        at - previous.at < undoMergeWindowMs && state.undo.length === previous.depth &&
        state.undo[previous.depth - 1] === previous.top;
      const status = await componentSessionRef.current.mutate(
        artboardComponentId,
        (model: Dynamic, state: Dynamic) => state.path === previewFile && model.setPageFill(normalized),
        { structural: false, pushUndo: !mergeUndo },
      );
      const applied = wasApplied(status);
      const updated = resolveComponentState(artboardComponentId);
      if (applied && updated) {
        const depth = updated.undo.length;
        lastFill.current = { key, at, depth, top: updated.undo[depth - 1] };
      }
      return applied;
    });
  }, [artboardComponentId, previewFile, enqueue, resolveComponentState]);

  const beginStyleGesture = (0, reactCanvasShape.useCallback)(() => {
    enqueue(() => {
      const state = resolveComponentState(artboardComponentId);
      gestureStart.current = state ? state.model.serialize() : null;
    });
  }, [enqueue, resolveComponentState, artboardComponentId]);

  const endStyleGesture = (0, reactCanvasShape.useCallback)(
    () => enqueue(() => {
      const start = gestureStart.current;
      gestureStart.current = null;
      return start == null ? false : componentSessionRef.current.pushUndoSnapshot(artboardComponentId, start);
    }),
    [enqueue, artboardComponentId],
  );

  const applyStyleEdit = (0, reactCanvasShape.useCallback)((element: Element) => {
    const count = (editCounts.current.get(element) ?? 0) + 1;
    editCounts.current.set(element, count);
    return count;
  }, []);

  const setStyleProperty = (0, reactCanvasShape.useCallback)(
    (element: Element, edits: StyleEdits) => {
      applyStyleEdit(element);
      return enqueue(() => componentSessionRef.current.mutate(
        artboardComponentId,
        (model: Dynamic, state: Dynamic) => {
          const tid = parseInt(element.getAttribute(DcTplAttribute) ?? "", 10);
          if (state.path !== previewFile || state.model.element(tid) !== element) return false;
          return setElementStyles(model, tid, edits);
        },
        { structural: false, pushUndo: true },
      ));
    },
    [previewFile, artboardComponentId, enqueue, applyStyleEdit],
  );

  const currentWriter = (0, reactCanvasShape.useRef)(setStyleProperty);
  currentWriter.current = setStyleProperty;

  function replayStyleEdit(element: Element, count: number, edits: StyleEdits) {
    if (editCounts.current.get(element) === count) currentWriter.current(element, edits);
  }

  return {
    pageFill, setPageFill, setStylePropsPerTid, beginStyleGesture, endStyleGesture,
    applyStyleEdit, setStyleProperty, replayStyleEdit,
  };
}
