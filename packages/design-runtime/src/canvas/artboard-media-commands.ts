import type { Dynamic } from "../runtime-types";
import { DcTplAttribute } from "../editor/html/authoring";
import { MediaObjectCropTest } from "../editor/media/object-crop";
import { findPreviewMediaElement } from "../editor/media/playback-controls";
import { validatePastedAttributeEdits } from "../editor/undo/elements";
import { createVideoElementIdentity, isValidVideoDimensions, resolveVideoElementIdentity } from "./content-snapshots";
import { reactCanvasShape } from "./shape";

type ImageEdits = Record<string, string | null>;
type VideoIdentity = { src: string; nth: number; of: number };
type VideoReplacement = { src: string; width: number; height: number };

interface ArtboardMediaOptions {
  artboardComponentId: string;
  previewFile: string;
  componentSessionRef: { current: Dynamic };
  resolveComponentState(component: string): Dynamic;
  finishCropRef: { current(commit: boolean): void };
  iframeRef: { current: HTMLIFrameElement | null };
}

function clearCropForReplacement(model: Dynamic, tid: number) {
  if (!MediaObjectCropTest((property: string) => model.inlineStyleValue(tid, property))) return;
  model.setStyleProperty(tid, "object-view-box", null);
  model.setStyleProperty(tid, "object-position", null);
}

/** Resolve stable media targets and replace sources through the artboard edit session. */
export function useArtboardMediaCommands({
  artboardComponentId,
  previewFile,
  componentSessionRef,
  resolveComponentState,
  finishCropRef,
  iframeRef,
}: ArtboardMediaOptions) {
  const swapImageAttrs = (0, reactCanvasShape.useCallback)(
    async (source: string, edits: ImageEdits) => {
      if (!validatePastedAttributeEdits(edits)) return false;
      let updated = false;
      await componentSessionRef.current.mutate(
        artboardComponentId,
        (_model: Dynamic, state: Dynamic) => {
          if (state.path !== previewFile) return false;
          for (const element of state.model.elementsByAttr("src", source)) {
            if (element.tagName.toLowerCase() !== "img") continue;
            const tid = parseInt(element.getAttribute(DcTplAttribute) ?? "-1", 10);
            if (tid < 0) continue;
            for (const [attribute, value] of Object.entries(edits)) {
              state.model.setAttribute(tid, attribute, value);
            }
            updated = true;
          }
          return updated;
        },
        { structural: false },
      );
      return updated;
    },
    [artboardComponentId, previewFile],
  );

  const replaceImageFor = (0, reactCanvasShape.useCallback)(
    async (tid: number, edits: ImageEdits) => {
      if (!validatePastedAttributeEdits(edits)) return false;
      finishCropRef.current(false);
      const status = await componentSessionRef.current.mutate(
        artboardComponentId,
        (_model: Dynamic, state: Dynamic) => {
          if (state.path !== previewFile) return false;
          const element = state.model.element(tid);
          if (!element || element.tagName.toLowerCase() !== "img") return false;
          for (const [attribute, value] of Object.entries(edits)) {
            state.model.setAttribute(tid, attribute, value);
          }
          clearCropForReplacement(state.model, tid);
          return true;
        },
        { structural: false, pushUndo: true },
      );
      return status === "applied" || status === "applied-dirty";
    },
    [artboardComponentId, previewFile],
  );

  const videoElement = (0, reactCanvasShape.useCallback)((tid: number) => {
    try {
      return findPreviewMediaElement(iframeRef.current?.contentDocument, DcTplAttribute, tid, artboardComponentId);
    } catch {
      return null;
    }
  }, [artboardComponentId]);

  const videoKey = (0, reactCanvasShape.useCallback)((tid: number) => {
    const state = resolveComponentState(artboardComponentId);
    return state ? createVideoElementIdentity(state.model, tid) : null;
  }, [resolveComponentState, artboardComponentId]);

  const replaceVideoFor = (0, reactCanvasShape.useCallback)(
    async (identity: VideoIdentity, video: VideoReplacement) => {
      if (!isValidVideoDimensions(video)) return "refused";
      let failure = "gone";
      finishCropRef.current(false);
      const status = await componentSessionRef.current.mutate(
        artboardComponentId,
        (_model: Dynamic, state: Dynamic) => {
          if (state.path !== previewFile) return false;
          const tid = resolveVideoElementIdentity(state.model, identity);
          if (typeof tid !== "number") {
            failure = tid;
            return false;
          }
          clearCropForReplacement(state.model, tid);
          state.model.setAttribute(tid, "src", video.src);
          state.model.setAttribute(tid, "width", String(video.width));
          state.model.setAttribute(tid, "height", String(video.height));
          state.model.setAttribute(tid, "poster", null);
          return true;
        },
        { structural: false, pushUndo: true },
      );
      return status === "applied" || status === "applied-dirty" ? "ok" : failure;
    },
    [artboardComponentId, previewFile],
  );

  return { swapImageAttrs, replaceImageFor, videoElement, videoKey, replaceVideoFor };
}
