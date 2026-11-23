import { ClipboardFileTransferRegistry } from "../../editor/clipboard/file-transfer";
import { ClipboardPastePlanningHandler } from "../../editor/clipboard/paste-planning";
import { ClipboardTrustDialogTitleMessageKeepCodeConfig } from "../../editor/clipboard/trust-dialog";
import { getLinkedProjectFiles } from "../../preview/component-imports";
import { mergeDesignSystemFileOverlay } from "../../design-system/file-overlay";
import { type Dynamic } from "../../runtime-types";
import { uiMessage } from "@minedesign/contracts/ui-messages";

interface PasteReportOptions {
  files: Record<string, Dynamic>;
  preparedFiles: Dynamic;
  pasteableBoards: Dynamic[];
  artboardCount: number;
  acceptedNotes: Dynamic[];
  includeCode: boolean;
  notesClipboard: Dynamic;
  pictureResult: Dynamic;
  notePaste: Dynamic;
  oversizedBoardCount: number;
  droppedSvgCount: number;
  fontsLeftOutCount: number;
  canAddNotes: boolean;
  noteInputs: Dynamic[];
  notEitherHint: string;
  clipboardPayload: unknown;
}

function shortenText(text: string) {
  return text.length > 60 ? text.slice(0, 57) + "…" : text;
}

export function describeArtboardPaste({
  files, preparedFiles, pasteableBoards, artboardCount, acceptedNotes, includeCode, notesClipboard,
  pictureResult, notePaste, oversizedBoardCount, droppedSvgCount, fontsLeftOutCount, canAddNotes,
  noteInputs, notEitherHint, clipboardPayload,
}: PasteReportOptions) {
  let projectFiles: Dynamic = [
      ...Object.keys(
        mergeDesignSystemFileOverlay(
          files,
        ),
      ),
      "support.js",
    ],
    missingLinkedFiles: Dynamic = [
      ...new Set(
        pasteableBoards.flatMap(
          (board?: Dynamic): Dynamic =>
            getLinkedProjectFiles(
              board.entry.src,
              projectFiles,
            ),
        ),
      ),
    ].map(shortenText),
    length: number = artboardCount,
    fileName: Dynamic = (dropped?: Dynamic): Dynamic =>
      dropped.path.split("/").pop() ?? dropped.path,
    droppedSummary: Dynamic =
      preparedFiles.dropped.length === 0
        ? ""
        : preparedFiles.dropped.every(
              (item?: Dynamic): Dynamic =>
                item.why === preparedFiles.dropped[0].why,
            )
          ? `; ${shortenText(preparedFiles.dropped.map(fileName).join(", "))} left out (${preparedFiles.dropped[0].why})`
          : `; left out: ${preparedFiles.dropped
                .slice(0, 3)
                .map(
                  (item?: Dynamic): Dynamic =>
                    `${shortenText(fileName(item))} (${item.why})`,
                )
                .join(
                  ", ",
                )}${preparedFiles.dropped.length > 3 ? "\u2026" : ""}`,
    baseMessage: Dynamic =
      (length === 1
        ? uiMessage("canvas.designCanvas.pastedAnArtboard")
        : uiMessage("canvas.designCanvas.pastedArtboards", { count: String(String(length)) })) +
      (acceptedNotes.length > 0
        ? ClipboardFileTransferRegistry.withObjects(
            acceptedNotes,
          )
        : "") +
      " from another canvas" +
      (includeCode
        ? ""
        : ClipboardTrustDialogTitleMessageKeepCodeConfig.dropped(
            length,
          )),
    leftOutCount: Dynamic = notesClipboard?.leftOut ?? 0,
    notBroughtCount: Dynamic =
      pictureResult.failed + (notesClipboard?.unreadPictures ?? 0),
    plainPictureCount: Dynamic = pictureResult.landed.filter(
      (note?: Dynamic): Dynamic =>
        notePaste.plainPictures.has(note.spec.id),
    ).length,
    pictureCount: Dynamic =
      (notesClipboard?.pictures.length ?? 0) +
      (notesClipboard?.unreadPictures ?? 0),
    caveats: Dynamic =
      (oversizedBoardCount > 0
        ? `; ${String(oversizedBoardCount)} left out (over 2 MiB with images inlined)`
        : "") +
      droppedSummary +
      (droppedSvgCount > 0
        ? `; ${droppedSvgCount === 1 ? "1 SVG image" : `${String(droppedSvgCount)} SVG images`} left out (Paste with code keeps ${droppedSvgCount === 1 ? "it" : "them"})`
        : "") +
      (fontsLeftOutCount > 0
        ? `; ${fontsLeftOutCount === 1 ? "1 font" : `${String(fontsLeftOutCount)} fonts`} did not come across, so some text may show in a different font`
        : "") +
      (!canAddNotes || noteInputs.length > acceptedNotes.length
        ? ClipboardFileTransferRegistry.notLanded
        : notEitherHint !== "" &&
            (notesClipboard?.entries.length ?? 0) + pictureCount === 0
          ? ClipboardFileTransferRegistry.notRead
          : (notesClipboard?.unread ?? 0) > 0
            ? ClipboardFileTransferRegistry.someUnread(
                notesClipboard?.unread ?? 0,
              )
            : notEitherHint === "" &&
                ClipboardPastePlanningHandler(clipboardPayload)
              ? ClipboardFileTransferRegistry.stayedBehind
              : "") +
      (notePaste.notesOut > 0
        ? ClipboardFileTransferRegistry.notesTooMuch
        : "") +
      (acceptedNotes.length > 0 && notePaste.plain > 0
        ? ClipboardFileTransferRegistry.plainShapes(
            notePaste.plain,
          )
        : "") +
      (acceptedNotes.length > 0 && plainPictureCount > 0
        ? ClipboardFileTransferRegistry.plainPictures(
            plainPictureCount,
            true,
          )
        : "") +
      (notBroughtCount > 0
        ? ClipboardFileTransferRegistry.notBrought(notBroughtCount)
        : "") +
      ClipboardFileTransferRegistry.leftOutCaveat(
        leftOutCount,
        notesClipboard?.videos ?? 0,
      ) +
      (missingLinkedFiles.length > 0
        ? `. It loads ${missingLinkedFiles.slice(0, 3).join(", ")}${missingLinkedFiles.length > 3 ? "\u2026" : ""}, which this canvas doesn't have. Publish that here for it to render as designed.`
        : "");
  return { message: baseMessage + caveats, hasCaveats: caveats !== "" };
}
