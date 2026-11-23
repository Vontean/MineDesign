import { ClipboardAssetsHandler } from "../../editor/clipboard/assets";
import { projectFileKey } from "../../platform/file-content";
import { getKvClient } from "../../platform/file-content";
import { type Dynamic } from "../../runtime-types";
import { uiMessage } from "@minedesign/contracts/ui-messages";
import { uploadDesignFile } from "../working-state";
import { validateCanvasPlacedImage } from "../../assets/image-placement";

export interface PastePoint {
  x: number;
  y: number;
}

export interface ExternalPasteOptions {
  document: {
    store: { content(): { files: Record<string, Dynamic> } };
    supportsLoadState: boolean;
    readManifest(): Dynamic;
    pageMetadata(pageId?: string): Dynamic;
    createNotes(inputs: Dynamic[]): Dynamic[];
    pasteNotes(boards: Dynamic[], notes: Dynamic[], anchor: PastePoint | null | undefined): void;
    persist(patch: object): void;
    recordHistory(step: object, files: Set<string>): void;
  };
  view: {
    pageId(): string;
    isEditing(): boolean;
    getClipboardAnchor(): PastePoint | null | undefined;
    camera: { rest(): Dynamic; get(): { scale: number } };
    isFullscreen(): boolean;
    isHostGesturing(): boolean;
    setSelection(selection: Dynamic): void;
    clearFramePick(): void;
    reveal(bounds: Dynamic): void;
    notePlacement(): void;
  };
  feedback: {
    announce(message: string): void;
    announceSuccess(message: string): void;
    toast(message: string, type: "error"): void;
  };
}

export function getPasteCancelMessage(options: ExternalPasteOptions, signal: AbortSignal, pageId?: string) {
  if (signal.aborted) return uiMessage("canvas.designCanvas.pasteCancelledThisCanvasWas");
  if (!options.view.isEditing()) return uiMessage("canvas.designCanvas.pasteCancelledThisCanvasStopped");
  if (
    pageId !== undefined &&
    pageId !== "" &&
    !(options.document.readManifest().pages ?? []).some((page: { id: string }) => page.id === pageId)
  ) return uiMessage("canvas.designCanvas.pasteCancelledThePageYou");
  return null;
}

export function makePictureOptions(onStored: (path: string) => void, sizeLimit: number) {
  return {
    gate: validateCanvasPlacedImage,
    upload: (file: File) => uploadDesignFile("appifact", null, file),
    stored: onStored,
    discard: deletePasteFile,
    maxPixels: ClipboardAssetsHandler(sizeLimit),
  };
}

export function deletePasteFile(path: string) {
  return getKvClient().delete(projectFileKey(path)).catch(() => false);
}
