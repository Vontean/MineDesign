import type { Dynamic } from "../runtime-types";
import { equivalentDesignImportTags } from "./compilation-cache";
import { reactCanvasShape } from "./shape";
import { parseElementMoveSnapshot, parseGroupMoveSnapshot } from "../editor/clipboard/layout-snapshots";
import { emptyArtboardDropTarget } from "../editor/insert/drop-targets";
import { beginPickerMove, cancelPickerMove, clearPickerDropPlan, exitPickerMove, finishPickerMove, pickerMoveHold, planPickerDrop, returnPickerMove, settlePickerMove, touchPickerMove, updatePickerMove } from "../editor/picker/bridge";
import { createPreviewHandle } from "../preview/evaluation";
import { modelHasEmptyStage } from "./artboard-picker-selection";
import { canDropHtml, type ArtboardMoveOptions } from "./artboard-element-moves";

interface PickerPoint {
  x: number;
  y: number;
}

interface PickerRect extends PickerPoint {
  w: number;
  h: number;
}

function readMoveBounds(value: unknown): PickerRect | null {
  if (value === null || typeof value !== "object") return null;
  const bounds = value as Record<string, unknown>;
  const isCoordinate = (coordinate: unknown): coordinate is number =>
    typeof coordinate === "number" && Number.isFinite(coordinate) && Math.abs(coordinate) < 1e6;
  const { x, y, w, h } = bounds;
  return isCoordinate(x) && isCoordinate(y) && isCoordinate(w) && isCoordinate(h) ? { x, y, w, h } : null;
}

function parseMoveStart(result: unknown, tid: number, allowedIds: readonly number[], readModel: () => Dynamic) {
  if (result === null || typeof result !== "object") return null;
  const payload = result as Record<string, unknown>;
  const { tids, tag, mode, members } = payload;
  if (!Array.isArray(tids) || tids.length === 0 || tids.length > 500) return null;
  const validIds = tids.filter((id) => Number.isInteger(id) && id >= 0);
  if (validIds.length !== tids.length || !validIds.every((id) => allowedIds.includes(id))) return null;
  const model = readModel();
  if (!model || validIds.some((id) => !model.element(id)) || typeof tag !== "string") return null;
  if (!equivalentDesignImportTags(model.tagName(tid)?.toLowerCase() ?? "", tag)) return null;
  const rect = readMoveBounds(payload.rect);
  if (!rect) return null;

  const parsedMembers: { tid: number; tag: string; rect: PickerRect }[] = [];
  if (Array.isArray(members)) {
    for (const member of members.slice(0, 500)) {
      if (member === null || typeof member !== "object" ||
        !Number.isInteger(member.tid) || !validIds.includes(member.tid) ||
        typeof member.tag !== "string" || !/^[a-z][a-z0-9-]{0,63}$/.test(member.tag) ||
        !equivalentDesignImportTags(model.tagName(member.tid)?.toLowerCase() ?? "", member.tag)) continue;
      const memberRect = readMoveBounds(member.rect);
      if (memberRect) parsedMembers.push({ tid: member.tid, tag: member.tag, rect: memberRect });
    }
  }
  return { tids: validIds, rect, mode: mode === "abs" ? "abs" : "flow", members: parsedMembers };
}

/** Drive the preview picker and validate move snapshots before they reach the model. */
export function useArtboardPickerMoves({
  iframeRef,
  componentSessionRef,
  artboardComponentId,
  resolveComponentState,
}: Omit<ArtboardMoveOptions, "previewFile">) {
  const moveStart = (0, reactCanvasShape.useCallback)(
    async (
      gestureKey: string,
      tid: number,
      point: PickerPoint | null,
      modifiers: Dynamic,
      allowedIds: number[],
    ) => {
      const preview = createPreviewHandle(iframeRef.current);
      if (
        !preview ||
        !allowedIds.includes(tid) ||
        !(await componentSessionRef.current.ensureModel(artboardComponentId))
      ) return null;

      const raw = await beginPickerMove(preview, gestureKey, tid, point?.x ?? null, point?.y ?? null, modifiers);
      const parsed = parseMoveStart(raw, tid, allowedIds, () => componentSessionRef.current.state(artboardComponentId)?.model);
      if (parsed === null) cancelPickerMove(preview, gestureKey);
      return parsed;
    },
    [artboardComponentId],
  ),
  moveMove = (0, reactCanvasShape.useCallback)(
    (gestureKey: string, point: PickerPoint, modifiers: Dynamic) => {
      const preview = createPreviewHandle(iframeRef.current);
      if (preview) updatePickerMove(preview, gestureKey, point.x, point.y, modifiers);
    },
    [],
  ),
  moveCancel = (0, reactCanvasShape.useCallback)((gestureKey: string) => {
    const preview = createPreviewHandle(iframeRef.current);
    if (preview) cancelPickerMove(preview, gestureKey);
  }, []),
  moveSettle = (0, reactCanvasShape.useCallback)(() => {
    const preview = createPreviewHandle(iframeRef.current);
    if (preview) settlePickerMove(preview);
  }, []),
  moveEnd = (0, reactCanvasShape.useCallback)(
    async (gestureKey: string, point: PickerPoint, modifiers: Dynamic, fallback: Dynamic) => {
      const preview = createPreviewHandle(iframeRef.current);
      if (!preview) return null;
      const result = await finishPickerMove(preview, gestureKey, point.x, point.y, modifiers);
      return result == null || typeof result !== "object" || result.plan == null
        ? null
        : parseElementMoveSnapshot(result.plan, fallback);
    },
    [],
  ),
  stageIsEmpty = (0, reactCanvasShape.useCallback)(async () => {
    if (!(await componentSessionRef.current.ensureModel(artboardComponentId))) return false;
    const state = componentSessionRef.current.state(artboardComponentId);
    return state ? modelHasEmptyStage(state.model) : false;
  }, [artboardComponentId]),
  isFreeCanvas: Dynamic = (0, reactCanvasShape.useCallback)(
    async (point?: Dynamic): Promise<Dynamic> => {
      if (!(await componentSessionRef.current.ensureModel(artboardComponentId))) return false;
      let componentState: Dynamic = componentSessionRef.current.state(artboardComponentId);
      return (
        componentState != null &&
        emptyArtboardDropTarget(componentState.model, point) !=
          null
      );
    },
    [artboardComponentId],
  ),
  moveHost: Dynamic = (0, reactCanvasShape.useCallback)(
    async (selection?: Dynamic, point?: Dynamic): Promise<Dynamic> => {
      let previewHandle: Dynamic = createPreviewHandle(
        iframeRef.current,
      );
      return previewHandle
        ? pickerMoveHold(previewHandle, selection, point)
        : false;
    },
    [],
  ),
  moveExit: Dynamic = (0, reactCanvasShape.useCallback)(
    (reason?: Dynamic): Dynamic => {
      let previewHandle: Dynamic = createPreviewHandle(
        iframeRef.current,
      );
      previewHandle && exitPickerMove(previewHandle, reason);
    },
    [],
  ),
  moveReturn: Dynamic = (0, reactCanvasShape.useCallback)(
    (reason?: Dynamic): Dynamic => {
      let previewHandle: Dynamic = createPreviewHandle(
        iframeRef.current,
      );
      previewHandle && returnPickerMove(previewHandle, reason);
    },
    [],
  ),
  moveTouch: Dynamic = (0, reactCanvasShape.useCallback)(
    (touch?: Dynamic): Dynamic => {
      let previewHandle: Dynamic = createPreviewHandle(
        iframeRef.current,
      );
      previewHandle && touchPickerMove(previewHandle, touch);
    },
    [],
  ),
  dropPlanAt: Dynamic = (0, reactCanvasShape.useCallback)(
    async (
      selection?: Dynamic,
      point?: Dynamic,
      movingMembers?: Dynamic,
      dropContext?: Dynamic,
    ): Promise<Dynamic> => {
      let previewHandle: Dynamic = createPreviewHandle(
        iframeRef.current,
      );
      if (!previewHandle || movingMembers.length > 500) return null;
      let dropPlan: Dynamic = await planPickerDrop(
          previewHandle,
          selection,
          point.x,
          point.y,
          movingMembers,
          dropContext,
        ),
        groupMovePlan: Dynamic = parseGroupMoveSnapshot(
          dropPlan,
          movingMembers.map((element?: Dynamic): Dynamic => element.tid),
        );
      if (!groupMovePlan) return null;
      let model: Dynamic = (await componentSessionRef.current.ensureModel(
        artboardComponentId,
      ))
        ? resolveComponentState(artboardComponentId)
        : null;
      if (!model) return null;
      let refusedTids: Dynamic = [...groupMovePlan.refused],
        landingTids: Dynamic = groupMovePlan.landing.filter(
          (element?: Dynamic): Dynamic => {
            let landingEntry: Dynamic =
                movingMembers.find(
                  (landing?: Dynamic): Dynamic =>
                    landing.tid === element.tid,
                )?.tag ?? "div",
              dropPreview: Dynamic = canDropHtml(
                model.model,
                element,
                landingEntry,
                null,
              );
            dropPreview || refusedTids.push(element.tid);
            return dropPreview;
          },
        );
      return {
        container: groupMovePlan.container,
        landing: landingTids,
        refused: refusedTids,
      };
    },
    [resolveComponentState, artboardComponentId],
  ),
  dropPlanClear: Dynamic = (0, reactCanvasShape.useCallback)(
    (reason?: Dynamic, force: Dynamic = false): Dynamic => {
      let previewHandle: Dynamic = createPreviewHandle(
        iframeRef.current,
      );
      previewHandle &&
        clearPickerDropPlan(previewHandle, reason, force);
    },
    [],
  );

  return {
    moveStart, moveMove, moveCancel, moveSettle, moveEnd,
    stageIsEmpty, isFreeCanvas, moveHost, moveExit, moveReturn, moveTouch,
    dropPlanAt, dropPlanClear,
  };
}
