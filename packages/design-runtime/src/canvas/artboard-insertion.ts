import type { Dynamic } from "../runtime-types";
import { positionPastedHtml } from "../editor/clipboard/html-placement";
import { containsFlowPastedElements, emptyArtboardDropTarget, pasteParentTarget, wrapInlinePastedHtml } from "../editor/insert/drop-targets";
import { defaultInsertionPoint, insertHtmlIntoModel, insertionPointForSelection, sameInsertionPoint } from "../editor/insert/targets";
import { SelectionActionsHelmetScHelmetPattern } from "../editor/selection/actions";
import { placeElementAtMeasuredPoint, requestInsertionContainerTransform } from "../geometry/insertion-transform";
import { createPreviewHandle } from "../preview/evaluation";
import { reactCanvasShape } from "./shape";

type InsertionPoint = { x: number; y: number };
type RenderPlacement = (left: number, top: number) => string;
type ResolveReplacement = (html: string) => number[] | null | Promise<number[] | null>;

interface ArtboardInsertionOptions {
  artboardComponentId: string;
  previewFile: string;
  componentSessionRef: { current: Dynamic };
  resolveComponentState(component: string): Dynamic;
  iframeRef: { current: HTMLIFrameElement | null };
}

function resolveHtmlInsertion(model: Dynamic, html: string, mode: string, context: Dynamic) {
  const acceptsPosition = context != null && model.topLevelTags(html)
    .filter((tag: string) => !SelectionActionsHelmetScHelmetPattern.test(tag)).length === 1;
  const position = acceptsPosition ? context : null;
  const emptyTarget = position != null || mode === "page" ? emptyArtboardDropTarget(model, html) : null;
  const pasteTarget = pasteParentTarget(mode, position, emptyTarget, html);
  const intoFlow = mode === "root-end" && containsFlowPastedElements(pasteTarget != null, html);
  const placement = emptyTarget
    ? emptyTarget.placement
    : mode === "stage"
      ? defaultInsertionPoint(model, html)
      : intoFlow
        ? insertionPointForSelection(model, [], html)
        : { targetTid: null, position: "root-end" };
  return { html: pasteTarget ? positionPastedHtml(html, pasteTarget) : html, placement };
}

/** Resolve HTML and measured insertions before committing to the current artboard model. */
export function useArtboardInsertion({
  artboardComponentId,
  previewFile,
  componentSessionRef,
  resolveComponentState,
  iframeRef,
}: ArtboardInsertionOptions) {
  const insertHtml = (0, reactCanvasShape.useCallback)(
    async (html: string, mode = "root-end", context?: Dynamic) => {
      let inserted: number[] = [];
      await componentSessionRef.current.mutate(
        artboardComponentId,
        (_model: Dynamic, state: Dynamic) => {
          if (state.path !== previewFile) return false;
          let target = resolveHtmlInsertion(state.model, html, mode, context);
          const wrapped = mode === "stage" ? wrapInlinePastedHtml(html) : html;
          if (wrapped !== html) {
            const fallback = resolveHtmlInsertion(state.model, wrapped, mode, context);
            if (sameInsertionPoint(fallback.placement, target.placement)) target = fallback;
          }
          inserted = insertHtmlIntoModel(state, target.html, target.placement);
          return inserted.length > 0;
        },
        { structural: true },
      );
      return inserted;
    },
    [artboardComponentId, previewFile],
  );

  const insertLayerAt = (0, reactCanvasShape.useCallback)(
    (point: InsertionPoint, render: RenderPlacement, isLive: () => boolean, replaced: ResolveReplacement) => {
      const preview = createPreviewHandle(iframeRef.current);
      return placeElementAtMeasuredPoint({
        state: () => resolveComponentState(artboardComponentId),
        measure: (tid: number, x: number, y: number) => preview
          ? requestInsertionContainerTransform(preview, artboardComponentId, tid, x, y)
          : Promise.resolve(null),
        live: isLive,
        replaced,
        async mutate(insert: (state: Dynamic) => number[]) {
          let inserted: number[] = [];
          await componentSessionRef.current.mutate(
            artboardComponentId,
            (_model: Dynamic, state: Dynamic) => {
              if (state.path !== previewFile) return false;
              inserted = insert(state);
              return inserted.length > 0;
            },
            { structural: true },
          );
          return inserted;
        },
      }, point, render);
    },
    [resolveComponentState, artboardComponentId, previewFile],
  );
  const insertAtPoint = (0, reactCanvasShape.useCallback)(
    (point: InsertionPoint, render: RenderPlacement, isLive: () => boolean) => insertLayerAt(point, render, isLive, () => null),
    [insertLayerAt],
  );
  return { insertHtml, insertLayerAt, insertAtPoint };
}
