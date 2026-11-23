import type { Dynamic } from "../runtime-types";
import { flipModelSelection, inspectFlipSelection, selectionNeedsFlipInspection } from "../editor/geometry/flip-elements";
import { deleteModelElements } from "../editor/insert/targets";
import { ModelModelStateLimit as nudgeUndoWindowMs } from "../editor/model/model-state";
import { inspectPickerSelection } from "../editor/picker/bridge";
import { containsUneditableSelection, selectedRootElementIds } from "../editor/selection/element-order";
import { canMovePositionedSelection, hasPositionedSelectionAxes, nudgeModelSelection } from "../editor/selection/nudge";
import { canReorderSelection, modelIdsFromElements, reorderModelSelection } from "../editor/selection/stacking";
import { promotedSvgSelection, selectionAdjacentSiblings, selectionChildren, selectionParents, selectionSiblingIds } from "../editor/selection/tree-navigation";
import { createPreviewHandle } from "../preview/evaluation";
import { reactCanvasShape } from "./shape";

interface SelectionCommandOptions {
  artboardComponentId: string;
  previewFile: string;
  iframeRef: { current: HTMLIFrameElement | null };
  componentSessionRef: { current: Dynamic };
}

interface NudgeHistory {
  key: string;
  at: number;
  depth: number;
  top: unknown;
}

interface FlipInspection {
  tids: number[];
  picked: (Element | null)[];
  facts: Dynamic;
}

function wasApplied(status: unknown) {
  return status === "applied" || status === "applied-dirty";
}

/** Apply selection changes through the edit session for one artboard. */
export function useArtboardSelectionCommands({
  artboardComponentId,
  previewFile,
  iframeRef,
  componentSessionRef,
}: SelectionCommandOptions) {
  const nudgeHistory: { current: NudgeHistory | null } = (0, reactCanvasShape.useRef)(null);
  const pendingNudge: { current: Promise<unknown> } = (0, reactCanvasShape.useRef)(Promise.resolve());

  const removeSelection = (0, reactCanvasShape.useCallback)(
    async (tids: Iterable<number>) => wasApplied(await componentSessionRef.current.mutate(
      artboardComponentId,
      (_model: Dynamic, state: Dynamic) => state.path === previewFile && deleteModelElements(state, tids) > 0,
      { structural: true },
    )),
    [artboardComponentId, previewFile],
  );

  const duplicateSelection = (0, reactCanvasShape.useCallback)(
    async (tids: Iterable<number>) => wasApplied(await componentSessionRef.current.mutate(
      artboardComponentId,
      (_model: Dynamic, state: Dynamic) => {
        if (state.path !== previewFile || containsUneditableSelection(state.model, [...tids])) return false;
        const model = state.model;
        const roots: number[] = selectedRootElementIds(model, [...tids]).filter((tid: number) =>
          model.element(tid) != null && !model.isUneditable(tid),
        );
        let changed = false;
        for (const tid of roots) {
          if (model.duplicateElement(tid)) changed = true;
        }
        if (changed) model.restamp();
        return changed;
      },
      { structural: true },
    )),
    [artboardComponentId, previewFile],
  );

  const walkSelectionTids = (0, reactCanvasShape.useCallback)(async (tids: number[], direction: string) => {
    const state = await componentSessionRef.current.ensureModel(artboardComponentId);
    if (!state || state.path !== previewFile) return null;
    const { model } = state;
    switch (direction) {
      case "children": return selectionChildren(model, tids);
      case "parents": return selectionParents(model, tids);
      case "siblings": return selectionSiblingIds(model, tids);
      default: return selectionAdjacentSiblings(model, tids, direction);
    }
  }, [artboardComponentId, previewFile]);

  const moveSelection = (0, reactCanvasShape.useCallback)(
    async (tids: number[], dx: number, dy: number, beforeReorder?: () => void) => {
      const unchanged = { tids: [...tids], did: "none" };
      if (!Number.isFinite(dx) || !Number.isFinite(dy) || (dx === 0 && dy === 0)) return unchanged;
      const state = await componentSessionRef.current.ensureModel(artboardComponentId);
      if (!state || state.path !== previewFile) return unchanged;
      const { targets } = promotedSvgSelection(state.model, tids);
      if (targets.length === 0) return unchanged;
      if (canMovePositionedSelection(state.model, targets)) {
        if (!hasPositionedSelectionAxes(state.model, targets, dx, dy)) return unchanged;
        const key = targets.join(",");
        const at = Date.now();
        const previous = nudgeHistory.current;
        const merge = previous != null && previous.key === key &&
          at - previous.at < nudgeUndoWindowMs && state.undo.length === previous.depth &&
          state.undo[previous.depth - 1] === previous.top;
        const status = await componentSessionRef.current.mutate(
          artboardComponentId,
          (model: Dynamic, next: Dynamic) => {
            if (next.path !== previewFile) return false;
            nudgeModelSelection(model, targets, dx, dy);
            return true;
          },
          { structural: false, pushUndo: !merge },
        );
        const applied = wasApplied(status);
        const current = componentSessionRef.current.state(artboardComponentId);
        if (applied && current) {
          const depth = current.undo.length;
          nudgeHistory.current = { key, at, depth, top: current.undo[depth - 1] };
        }
        return applied ? { tids: [...tids], did: "nudged" } : unchanged;
      }

      const valid = tids.filter((tid) => state.model.element(tid) != null);
      const direction = dx < 0 || dy < 0 ? -1 : 1;
      if (!canReorderSelection(state.model, valid, direction)) return unchanged;
      beforeReorder?.();
      let moved: Element[] | null = null;
      const status = await componentSessionRef.current.mutate(
        artboardComponentId,
        (model: Dynamic, next: Dynamic) => {
          if (next.path !== previewFile) return false;
          moved = reorderModelSelection(model, valid, direction);
          return moved != null;
        },
        { structural: true },
      );
      nudgeHistory.current = null;
      return wasApplied(status) && moved != null
        ? { tids: modelIdsFromElements(moved), did: "reordered" }
        : unchanged;
    },
    [artboardComponentId, previewFile],
  );

  const nudgeSelection = (0, reactCanvasShape.useCallback)(
    (tids: number[], dx: number, dy: number, beforeReorder?: () => void) => {
      function run() {
        let timer: ReturnType<typeof setTimeout>;
        const deadline = new Promise((resolve) => {
          timer = setTimeout(() => resolve({ tids: [...tids], did: "timeout" }), 1e4);
        });
        return Promise.race([moveSelection(tids, dx, dy, beforeReorder), deadline])
          .finally(() => clearTimeout(timer));
      }
      const result = pendingNudge.current.then(run, run);
      pendingNudge.current = result.catch(() => {});
      return result;
    },
    [moveSelection],
  );

  const flipRead = (0, reactCanvasShape.useCallback)(async (tids: number[]): Promise<FlipInspection | null> => {
    const state = await componentSessionRef.current.ensureModel(artboardComponentId);
    const preview = createPreviewHandle(iframeRef.current);
    if (!state || state.path !== previewFile || !preview) return null;
    const picked = tids.map((tid) => state.model.element(tid));
    const facts = await inspectFlipSelection(
      state.model,
      tids,
      (tid: number, properties: string[], afterPaint: boolean) =>
        inspectPickerSelection(preview, tid, artboardComponentId, properties, { pose: true, afterPaint }),
    );
    return selectionNeedsFlipInspection(state.model, tids, facts) ? null : { tids, picked, facts };
  }, [artboardComponentId, previewFile]);

  const flipSelection = (0, reactCanvasShape.useCallback)(
    async ({ tids, picked, facts }: FlipInspection, direction: Dynamic) => {
      let result: { flipped: number[]; refused?: unknown } = { flipped: [] };
      const status = await componentSessionRef.current.mutate(
        artboardComponentId,
        (model: Dynamic, state: Dynamic) => {
          if (state.path !== previewFile || tids.some((tid, index) => model.element(tid) !== picked[index])) {
            return false;
          }
          result = flipModelSelection(model, tids, direction, facts);
          return result.flipped.length > 0;
        },
        { structural: false, pushUndo: true },
      );
      const applied = wasApplied(status);
      const writeRefused = !applied && result.flipped.length > 0;
      return {
        flipped: applied ? result.flipped.length : 0,
        ...(result.refused !== undefined && !writeRefused ? { refused: result.refused } : {}),
      };
    },
    [artboardComponentId, previewFile],
  );

  return { removeSelection, duplicateSelection, walkSelectionTids, nudgeSelection, flipRead, flipSelection };
}
