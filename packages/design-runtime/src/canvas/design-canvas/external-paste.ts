import { ClipboardFileTransferPasted } from "../../editor/clipboard/file-transfer";
import { ClipboardFileTransferRegistry } from "../../editor/clipboard/file-transfer";
import { ClipboardPastePlanningAnnotations } from "../../editor/clipboard/paste-planning";
import { ClipboardPastePlanningIsArray } from "../../editor/clipboard/paste-planning";
import { ClipboardStateIsArray } from "../../editor/clipboard/state";
import { maxAnnotations } from "../../platform/file-content";
import { normalizeAnnotationPasteOrigin } from "../../editor/clipboard/paste-planning";
import { parseAnnotationPaste } from "../../editor/clipboard/paste-planning";
import { parseArtboardClipboard } from "../../editor/clipboard/artboards";
import { pasteCascadeStep } from "../paste-placement";
import { type Dynamic } from "../../runtime-types";
import { uiMessage } from "@minedesign/contracts/ui-messages";
import { pasteExternalArtboards } from "./external-paste-artboards";
import { pasteNotesWithPictures } from "./external-paste-notes";
import type { ExternalPasteOptions, PastePoint } from "./external-paste-shared";
interface PasteTask {
  controller: AbortController;
  done: Promise<void>;
}

/** Own the in-flight paste for one canvas, including cancellation during embed teardown. */
export function createExternalPasteController() {
  let active: PasteTask | null = null;

  function run(operation: (signal: AbortSignal) => Promise<void>) {
    const controller = new AbortController();
    let settle!: () => void;
    const done = new Promise<void>((resolve) => { settle = resolve; });
    active = { controller, done };
    void operation(controller.signal).finally(() => {
      active = null;
      settle();
    });
  }

  function cancel() {
    const task = active;
    task?.controller.abort();
    return task?.done;
  }

  function startPicturePaste(options: ExternalPasteOptions, notes: Dynamic[], pictures: Dynamic) {
    const { document, view, feedback } = options;
    const pasteAnchor = view.getClipboardAnchor();
    if ((document.readManifest().annotations ?? []).length + notes.length + pictures.carried.length > maxAnnotations) {
      feedback.toast(ClipboardFileTransferRegistry.atLimit, "error");
      return;
    }
    const pageId = view.pageId();
    const viewport = view.camera.rest();
    run((signal) => pasteNotesWithPictures(options, notes, pictures, pasteAnchor, pageId, viewport, signal));
  }

  function paste(options: ExternalPasteOptions, clipboardPayload: unknown, pasteAnchor?: PastePoint | null) {
    const { document, view, feedback } = options;
    if (!view.isEditing()) return;
    if (active) {
      feedback.announce(ClipboardFileTransferRegistry.stillPasting);
      return;
    }
    if (!ClipboardStateIsArray(clipboardPayload)) {
      let parsedNotes: Dynamic = parseAnnotationPaste(
        clipboardPayload,
        (notes?: Dynamic): Dynamic =>
          ClipboardPastePlanningAnnotations(
            document.readManifest(),
            notes.map(
              (note?: Dynamic): Dynamic => ({
                ...note,
                ...document.pageMetadata(),
              }),
            ),
            128 * notes.length,
          ),
      );
      if (parsedNotes.land === null)
        parsedNotes.error
          ? feedback.toast(parsedNotes.say, "error")
          : feedback.announce(parsedNotes.say);
      else if (parsedNotes.pictures !== undefined)
        startPicturePaste(options, parsedNotes.land, parsedNotes.pictures);
      else {
        let manifestBefore: Dynamic = document.readManifest();
        document.pasteNotes(
          [],
          normalizeAnnotationPasteOrigin(parsedNotes.land)
            .group,
          view.getClipboardAnchor(),
        );
        if (document.readManifest() === manifestBefore) return;
        ClipboardFileTransferPasted(
          parsedNotes.say,
          parsedNotes.land.map((note?: Dynamic): Dynamic => note.spec),
        )
          ? feedback.announceSuccess(parsedNotes.say)
          : feedback.announce(parsedNotes.say);
      }
      return;
    }
    let notEitherHint: Dynamic = ClipboardPastePlanningIsArray(
        clipboardPayload,
      )
        ? ClipboardFileTransferRegistry.notEither
        : "",
      parsedClipboard: Dynamic = parseArtboardClipboard(clipboardPayload);
    if (!parsedClipboard) {
      feedback.announce(
        uiMessage("canvas.designCanvas.nothingToPasteTheCopied") +
          notEitherHint,
      );
      return;
    }
    const startPageId = view.pageId();
    const viewport = view.camera.rest();
    const cascadeStep = pasteCascadeStep(view.camera.get().scale);
    run((signal) => pasteExternalArtboards(
      options, clipboardPayload, pasteAnchor, parsedClipboard, notEitherHint,
      startPageId, viewport, cascadeStep, signal,
    ));
  }

  return { paste, cancel };
}
