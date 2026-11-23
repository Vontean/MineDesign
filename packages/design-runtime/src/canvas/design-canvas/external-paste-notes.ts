import { ClipboardAnnotationsLimit } from "../../editor/clipboard/annotations";
import { ClipboardFileTransferPasted } from "../../editor/clipboard/file-transfer";
import { ClipboardFileTransferRegistry } from "../../editor/clipboard/file-transfer";
import { ClipboardPastePlanningAnnotations } from "../../editor/clipboard/paste-planning";
import { maxAnnotations } from "../../platform/file-content";
import { annotationVisibleBounds } from "../../platform/file-content";
import { designPageContents } from "../../platform/file-content";
import { normalizeAnnotationPasteOrigin } from "../../editor/clipboard/paste-planning";
import { pastedObjectsBounds } from "../paste-placement";
import { pastedObjectsOrigin } from "../paste-placement";
import { resolveClipboardPictures } from "../../editor/clipboard/assets";
import { sameViewport } from "../viewport-store";
import { selectionFromBoards } from "../../editor/selection/canvas-selection";
import { type Dynamic } from "../../runtime-types";
import { uiMessage } from "@minedesign/contracts/ui-messages";
import { nextArtboardPlacementPoint } from "../paste-placement";
import { deletePasteFile, getPasteCancelMessage, makePictureOptions, type ExternalPasteOptions, type PastePoint } from "./external-paste-shared";
export async function pasteNotesWithPictures(
  { document, view, feedback }: ExternalPasteOptions,
  notesToPaste: Dynamic[],
  pictureInfo: Dynamic,
  notesPasteAnchor: PastePoint | null | undefined,
  targetPageId: string,
  notesViewport: Dynamic,
  signal: AbortSignal,
) {
  const uploadedFiles: string[] = [];
  let isCommitted = false;
  async function deleteFiles() {
    for (const file of uploadedFiles) await deletePasteFile(file);
  }
  try {
    feedback.announce(
      ClipboardFileTransferRegistry.bringing(
        pictureInfo.carried.length,
      ),
    );
    let { landed: landedPictures, failed: failedPictures }: Dynamic =
        await resolveClipboardPictures(
          pictureInfo.carried,
          pictureInfo.assets,
          signal,
          makePictureOptions(
            (file?: Dynamic): Dynamic => uploadedFiles.push(file),
            ClipboardAnnotationsLimit,
          ),
        ),
      cancelMessage: Dynamic = getPasteCancelMessage(
        { document, view, feedback }, signal,
        targetPageId,
      ),
      { group: pastedNotes }: Dynamic = normalizeAnnotationPasteOrigin(
        [...notesToPaste, ...landedPictures].sort(
          (first?: Dynamic, second?: Dynamic): Dynamic =>
            first.order - second.order,
        ),
      );
    if (cancelMessage !== null || pastedNotes.length === 0) {
      feedback.announce(cancelMessage ?? pictureInfo.said([], [], failedPictures));
      return void (await deleteFiles());
    }
    let pageId: Dynamic =
        targetPageId === ""
          ? (document.readManifest().pages?.[0]?.id ?? "")
          : targetPageId,
      targetPageContents: Dynamic = designPageContents(
        document.readManifest(),
        pageId,
      ),
      pasteOrigin: Dynamic = notesPasteAnchor
        ? pastedObjectsOrigin(pastedNotes, notesPasteAnchor)
        : nextArtboardPlacementPoint([
            ...targetPageContents.artboards,
            ...(targetPageContents.annotations ?? []).map(
              annotationVisibleBounds,
            ),
          ]),
      existingNotes: Dynamic = document.readManifest().annotations ?? [],
      noteInputs: Dynamic = pastedNotes.map(
        (noteClip?: Dynamic): Dynamic => {
          let noteBounds: Dynamic = annotationVisibleBounds(noteClip.spec);
          return {
            src: {
              ...noteClip.spec,
              ...document.pageMetadata(targetPageId),
            },
            x:
              pasteOrigin.x +
              noteClip.dx +
              (noteClip.spec.x - noteBounds.x),
            y:
              pasteOrigin.y +
              noteClip.dy +
              (noteClip.spec.y - noteBounds.y),
          };
        },
      ),
      canAddNotes: Dynamic =
        existingNotes.length + noteInputs.length <=
        maxAnnotations,
      newNotes: Dynamic = canAddNotes ? document.createNotes(noteInputs) : [];
    if (
      !canAddNotes ||
      !ClipboardPastePlanningAnnotations(
        document.readManifest(),
        newNotes,
      )
    ) {
      feedback.toast(
        canAddNotes
          ? ClipboardFileTransferRegistry.wontFitPictures
          : ClipboardFileTransferRegistry.atLimit,
        "error",
      );
      return void (await deleteFiles());
    }
    isCommitted = true;
    document.persist({
      artboards: document.readManifest().artboards,
      annotations: [...existingNotes, ...newNotes],
    });
    let files: Dynamic = document.store.content().files;
    document.recordHistory(
      {
        kind: "add",
        entries: [],
        anns: newNotes,
        get label() { return uiMessage("canvas.designCanvas.paste"); },
        files: uploadedFiles
          .filter(
            (file?: Dynamic): Dynamic =>
              typeof files[file] == "string",
          )
          .map(
            (file?: Dynamic): Dynamic => ({
              path: file,
              src: files[file],
            }),
          ),
      },
      new Set(),
    );
    view.pageId() === pageId &&
      (view.clearFramePick(),
      view.setSelection(
        selectionFromBoards({
          files: new Set(),
          notes: new Set(
            newNotes.map(
              (note?: Dynamic): Dynamic => note.id,
            ),
          ),
        }),
      ),
      !notesPasteAnchor &&
        !view.isFullscreen() &&
        !view.isHostGesturing() &&
        sameViewport(view.camera.rest(), notesViewport) &&
        view.reveal(
          pastedObjectsBounds(
            newNotes.map(annotationVisibleBounds),
          ),
        ));
    let doneMessage: Dynamic = pictureInfo.said(
      newNotes,
      landedPictures,
      failedPictures,
    );
    view.pageId() === pageId &&
    ClipboardFileTransferPasted(doneMessage, newNotes)
      ? feedback.announceSuccess(doneMessage)
      : feedback.announce(doneMessage);
  } catch (error: Dynamic) {
    console.error("[design/paste]", error);
    isCommitted || (await deleteFiles());
    feedback.toast(uiMessage("canvas.designCanvas.couldnTPaste2"), "error");
  }
}
