import type { Dynamic } from "../runtime-types";
import { classifyElementStyleKind } from "../editor/insert/element-kinds";
import {
  armPickerByClick, beginPickerTextPlacing, cancelPickerBox, clearPickerPart, finishExitedPickerDrag,
  formatPickerText, pickAtPoint, pickInBox, setPickerSelection, startPickerTextEdit,
} from "../editor/picker/bridge";
import { pickerElementSignature } from "../editor/picker/runtime-script";
import { SelectionActionsHelmetScHelmetPattern } from "../editor/selection/actions";
import { createPreviewHandle } from "../preview/evaluation";
import { equivalentDesignImportTags } from "./compilation-cache";
import { reactCanvasShape } from "./shape";

interface PickerSelectionOptions {
  iframeRef: { current: HTMLIFrameElement | null };
  componentSessionRef: { current: Dynamic };
  artboardComponentId: string;
}

export function readArtboardRootTids(model: Dynamic): number[] {
  return model.childTids(null).filter((tid: number) =>
    !SelectionActionsHelmetScHelmetPattern.test(model.tagName(tid) ?? ""),
  );
}

export function modelHasEmptyStage(model: Dynamic, roots = readArtboardRootTids(model)) {
  if (roots.length === 0) return true;
  const root = roots.length === 1 ? model.element(roots[0]) : null;
  return root != null && pickerElementSignature(root, (element: Element) =>
    classifyElementStyleKind(element) === "text",
  );
}

function matchesTemplateTag(model: Dynamic, tid: number, tag: string) {
  return equivalentDesignImportTags(model.tagName(tid)?.toLowerCase() ?? "", tag);
}

/** Map selection requests and responses between the canvas and one live preview. */
export function useArtboardPickerSelection({
  iframeRef,
  componentSessionRef,
  artboardComponentId,
}: PickerSelectionOptions) {
  const cache: { current: { src: string; tids: number[] } | null } = (0, reactCanvasShape.useRef)(null);
  const readTextTids = (0, reactCanvasShape.useCallback)((): number[] | null => {
    const model = componentSessionRef.current.state(artboardComponentId)?.model;
    if (!model) return null;
    const src = model.serialize();
    const tids = cache.current?.src === src
      ? cache.current!.tids
      : model.textEditables().map((element: { tid: number }) => element.tid);
    cache.current = { src, tids };
    return tids;
  }, [artboardComponentId]);

  const pickAt = (0, reactCanvasShape.useCallback)(
    async (x: number, y: number, mode = "plain", candidateTids: number[] = []) => {
      const preview = createPreviewHandle(iframeRef.current);
      if (!preview || !(await componentSessionRef.current.ensureModel(artboardComponentId))) return null;
      const picked = await pickAtPoint(preview, x, y, mode, candidateTids, readTextTids() ?? []);
      if (!picked) return null;
      const model = componentSessionRef.current.state(artboardComponentId)?.model;
      if (!model) return null;
      const roots = readArtboardRootTids(model);
      if ("empty" in picked) return modelHasEmptyStage(model, roots) ? picked : null;

      const element = model.element(picked.tid);
      if (!element || !matchesTemplateTag(model, picked.tid, picked.tag)) return null;
      const root = picked.root && roots.length === 1 && roots[0] === picked.tid;
      const text = picked.text;
      const nestedText = !root && text ? model.element(text.tid) : null;
      const textHit = text && nestedText && element.contains(nestedText) &&
        matchesTemplateTag(model, text.tid, text.tag) &&
        model.isTextEditable(text.tid) && !model.isTextEditable(picked.tid)
        ? { tid: text.tid, rect: text.rect }
        : null;
      return { tid: picked.tid, rect: picked.rect, root, page: root && picked.page, text: textHit };
    },
    [artboardComponentId, readTextTids],
  );

  const pickIn = (0, reactCanvasShape.useCallback)(async (box: Dynamic, rootName: string) => {
    const preview = createPreviewHandle(iframeRef.current);
    if (!preview || !(await componentSessionRef.current.ensureModel(artboardComponentId))) return null;
    const picked = await pickInBox(preview, box, rootName);
    if (picked == null) return null;
    const state = componentSessionRef.current.state(artboardComponentId);
    if (!state) return null;
    const model = state.model;
    const tids: number[] = picked.filter(({ tid, tag }: { tid: number; tag: string }) =>
      model.element(tid) != null && matchesTemplateTag(model, tid, tag),
    ).map((element: { tid: number }) => element.tid);
    return [...new Set(tids)];
  }, [artboardComponentId]);

  const setShownSelection = (0, reactCanvasShape.useCallback)(
    (tids: Iterable<number> | null, rootName: string | null, anchorTid?: number, sequence?: number) => {
      const preview = createPreviewHandle(iframeRef.current);
      if (!preview) return false;
      setPickerSelection(preview, tids ? [...tids] : null, rootName, anchorTid, sequence);
      return true;
    },
    [],
  );

  const clearLabelPart = (0, reactCanvasShape.useCallback)(() => {
    const preview = createPreviewHandle(iframeRef.current);
    if (preview) clearPickerPart(preview);
  }, []);
  const hostDrag = (0, reactCanvasShape.useCallback)((mode: string, gestureKey: string, commit?: boolean) => {
    const preview = createPreviewHandle(iframeRef.current);
    if (preview) finishExitedPickerDrag(preview, mode, gestureKey, !!commit);
  }, []);
  const cancelBox = (0, reactCanvasShape.useCallback)((gestureKey: string) => {
    const preview = createPreviewHandle(iframeRef.current);
    if (preview) cancelPickerBox(preview, gestureKey);
  }, []);
  const armedByClick = (0, reactCanvasShape.useCallback)((tool: string, options: Dynamic) => {
    const preview = createPreviewHandle(iframeRef.current);
    if (preview) armPickerByClick(preview, tool, options);
  }, []);
  const textPlacing = (0, reactCanvasShape.useCallback)(() => {
    const preview = createPreviewHandle(iframeRef.current);
    if (preview) beginPickerTextPlacing(preview);
  }, []);
  const formatCommand = (0, reactCanvasShape.useCallback)((command: Dynamic) => {
    const preview = createPreviewHandle(iframeRef.current);
    if (preview) formatPickerText(preview, command);
  }, []);
  const startTextEdit = (0, reactCanvasShape.useCallback)((tid: number, name: string, caret: Dynamic) => {
    const preview = createPreviewHandle(iframeRef.current);
    if (preview) startPickerTextEdit(preview, name, tid, caret);
  }, []);

  return {
    readTextTids, pickAt, pickIn, setShownSelection, clearLabelPart, hostDrag, cancelBox, armedByClick,
    textPlacing, formatCommand, startTextEdit,
  };
}
