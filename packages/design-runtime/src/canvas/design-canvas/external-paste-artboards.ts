import { PlatformFileContentFilesValue } from "../../platform/file-content";
import { maxAnnotations } from "../../platform/file-content";
import { defaultDocumentFileBytes as maxEmbeddedFileBytes } from "../../platform/file-content";
import { PlatformFileContentWebpAvifPattern } from "../../platform/file-content";
import { ProjectValue } from "../../platform/file-content";
import { askTrustForCodePaste } from "../../editor/clipboard/trust-dialog";
import { awaitFeatureFlag } from "../../platform/feature-flags";
import { blankArtboardBody } from "../../editor/clipboard/annotations";
import { buildAnnotationPaste } from "../../editor/clipboard/paste-planning";
import { clipboardPayloadUsage } from "../../editor/clipboard/assets";
import { errorMessage } from "../../platform/rate-limiter";
import { fileCapFailureMessage } from "../../platform/file-content";
import { getAllFileReferencePaths } from "../../platform/external-files";
import { getDesignSystemFiles } from "../../design-system/published-files";
import { getDocumentFileCap } from "../../platform/file-content";
import { hasPendingFileOverlay } from "../../design-system/type-declarations";
import { parseAnnotationClipboard } from "../../editor/clipboard/pictures";
import { parseClipboardAssets } from "../../editor/clipboard/assets";
import { preparePastedArtboardFiles } from "../../editor/clipboard/file-transfer";
import { remapPastedAssetFiles } from "../../editor/clipboard/file-transfer";
import { type Dynamic } from "../../runtime-types";
import { uiMessage } from "@minedesign/contracts/ui-messages";
import { imageKey, recordPastedReferences, transferPastedAssets } from "./external-paste-assets";
import { commitArtboardPaste } from "./external-paste-commit";
import { describeArtboardPaste } from "./external-paste-report";
import { deletePasteFile, getPasteCancelMessage, type ExternalPasteOptions, type PastePoint } from "./external-paste-shared";
export async function pasteExternalArtboards(
  options: ExternalPasteOptions,
  clipboardPayload: unknown,
  pasteAnchor: PastePoint | null | undefined,
  parsedClipboard: Dynamic,
  notEitherHint: string,
  startPageId: string,
  artboardsViewport: Dynamic,
  cascadeStep: number,
  signal: AbortSignal,
) {
  const { document, view, feedback } = options;
  const uploadedFiles: string[] = [];
  try {
    let trustChoice: Dynamic = (await awaitFeatureFlag(
      "design_cross_canvas_paste_confirm",
      true,
    ))
      ? await askTrustForCodePaste(
          parsedClipboard.artboards.length,
          signal,
        )
      : "with-code";
    if (trustChoice === "cancel") return;
    let earlyCancelMessage: Dynamic = getPasteCancelMessage(options, signal);
    if (earlyCancelMessage !== null) return feedback.announce(earlyCancelMessage);
    let includeCode: Dynamic = trustChoice === "with-code",
      notesClipboard: Dynamic = parseAnnotationClipboard(
        clipboardPayload,
      ),
      notePaste: Dynamic = buildAnnotationPaste(
        notesClipboard?.entries ?? [],
        includeCode,
        notesClipboard?.pictures ?? [],
      ),
      artboardClipboard: Dynamic = includeCode
        ? parsedClipboard
        : blankArtboardBody(parsedClipboard),
      canAddNotes: Dynamic =
        (document.readManifest().annotations ?? []).length +
          notePaste.land.length +
          notePaste.pictures.length <=
        maxAnnotations,
      pictureAssets: Dynamic = canAddNotes
        ? parseClipboardAssets(
            clipboardPayload,
            notePaste.pictures,
            clipboardPayloadUsage(parsedClipboard),
          )
        : new Map(),
      storedPictureFiles: string[] = [],
      droppedSvgCount: Dynamic = includeCode
        ? 0
        : Object.keys(parsedClipboard.files).filter(
            (path?: Dynamic): Dynamic => /\.svg$/i.test(path),
          ).length +
          Object.values(parsedClipboard.assets).filter(
            (data?: Dynamic): Dynamic =>
              /^data:image\/svg\+xml/i.test(data),
          ).length,
      getKnownProjectFiles: Dynamic = (): Dynamic =>
        hasPendingFileOverlay()
          ? new Set(
              [
                ...Object.keys(getDesignSystemFiles()),
                ...getAllFileReferencePaths(),
              ].map(
                (path?: Dynamic): Dynamic =>
                  path.startsWith(ProjectValue)
                    ? path.slice(ProjectValue.length)
                    : path,
              ),
            )
          : "unknown",
      exceedsFileLimit: Dynamic = (
        prepared?: Dynamic,
        existingFiles?: Dynamic,
      ): Dynamic =>
        Object.keys(existingFiles).length +
          prepared.boards.length +
          Object.keys(prepared.files).length >
        PlatformFileContentFilesValue,
      fileCap: Dynamic = getDocumentFileCap(document.store),
      preparedFiles: Dynamic = preparePastedArtboardFiles(
        artboardClipboard,
        document.store.content().files,
        document.supportsLoadState,
        getKnownProjectFiles(),
        fileCap,
      );
    if (exceedsFileLimit(preparedFiles, document.store.content().files)) {
      feedback.toast(
        uiMessage("canvas.designCanvas.couldnTPasteThisCanvas", { limit: String(String(PlatformFileContentFilesValue)) }) +
          notEitherHint,
        "error",
      );
      return;
    }
    const transfers = await transferPastedAssets({
      artboardClipboard, preparedFiles, pictureAssets, notePaste, canAddNotes,
      signal, uploadedFiles, storedPictureFiles, announce: feedback.announce,
    });
    const {
      assetUrls, imageUrls, uploadedPaths, skippedImages, assetMeta, skippedAssets,
      fontsLeftOutCount, pictureResult, undecodableImageKeys,
    } = transfers;
    let cleanupUploads: Dynamic = async (): Promise<Dynamic> => {
        for (let file of uploadedFiles.splice(0) as Dynamic)
          await deletePasteFile(file);
      },
      cancelMessage: Dynamic = getPasteCancelMessage(options, signal, startPageId);
    if (cancelMessage !== null) {
      feedback.announce(cancelMessage);
      return void (await cleanupUploads());
    }
    preparedFiles = preparePastedArtboardFiles(
      artboardClipboard,
      document.store.content().files,
      document.supportsLoadState,
      getKnownProjectFiles(),
      fileCap,
    );
    if (exceedsFileLimit(preparedFiles, document.store.content().files)) {
      feedback.toast(
        uiMessage("canvas.designCanvas.couldnTPasteThisCanvas", { limit: String(String(PlatformFileContentFilesValue)) }) +
          notEitherHint,
        "error",
      );
      return void (await cleanupUploads());
    }
    for (let [path, url] of Object.entries(
      preparedFiles.images,
    ) as Dynamic)
      imageUrls.has(path) ||
        skippedImages.has(path) ||
        (undecodableImageKeys.has(imageKey(path, artboardClipboard.files[path]))
          ? skippedImages.add(path)
          : imageUrls.set(path, url));
    let existingFileNamesLower: Dynamic = new Set(
      Object.keys(document.store.content().files).map(
        (path?: Dynamic): Dynamic => path.toLowerCase(),
      ),
    );
    for (let path of skippedImages as Dynamic)
      path in preparedFiles.images &&
        existingFileNamesLower.has(path.toLowerCase()) &&
        imageUrls.set(
          path,
          path.replace(/(\.[^./]*)?$/, "-missing$1"),
        );
    remapPastedAssetFiles(
      preparedFiles,
      assetUrls,
      imageUrls,
      fileCap,
    );
    let textEncoder: Dynamic = new TextEncoder(),
      pasteableBoards: Dynamic = preparedFiles.boards.filter(
        (board?: Dynamic): Dynamic =>
          textEncoder.encode(board.entry.src).length <=
          maxEmbeddedFileBytes,
      ),
      oversizedBoardCount: Dynamic = preparedFiles.boards.length - pasteableBoards.length;
    if (pasteableBoards.length === 0) {
      feedback.toast(
        uiMessage("canvas.designCanvas.couldnTPasteEveryCopied") +
          notEitherHint,
        "error",
      );
      return void (await cleanupUploads());
    }
    for (let [path, content] of Object.entries(
      preparedFiles.files,
    ) as Dynamic) {
      let dropReason: Dynamic =
        textEncoder.encode(content).length > fileCap
          ? "too large once its images were inlined"
          : PlatformFileContentWebpAvifPattern.test(
                path,
              ) && undecodableImageKeys.has(imageKey(path, content))
            ? "not an image the editor can decode"
            : null;
      dropReason !== null &&
        (delete preparedFiles.files[path],
        preparedFiles.dropped.push({
          path: path,
          why: dropReason,
        }));
    }
    const { artboardCount, acceptedNotes, noteInputs } = await commitArtboardPaste(
      options,
      {
        preparedFiles, pasteableBoards, canAddNotes, uploadedFiles, uploadedPaths, storedPictureFiles,
        noteClips: [...notePaste.land, ...pictureResult.landed].sort((a, b) => a.order - b.order),
      },
      { pasteAnchor, startPageId, artboardsViewport, cascadeStep },
    );
    await recordPastedReferences({
      artboardClipboard, files: document.store.content().files, dropped: preparedFiles.dropped,
      assetUrls, assetMeta, skippedAssets, isEditing: view.isEditing,
    });
    const report = describeArtboardPaste({
      files: document.store.content().files, preparedFiles, pasteableBoards, artboardCount,
      acceptedNotes, includeCode, notesClipboard, pictureResult, notePaste, oversizedBoardCount,
      droppedSvgCount, fontsLeftOutCount, canAddNotes, noteInputs, notEitherHint, clipboardPayload,
    });
    if (report.hasCaveats) feedback.announce(report.message);
    else feedback.announceSuccess(report.message);
  } catch (error: Dynamic) {
    for (let file of uploadedFiles as Dynamic)
      await deletePasteFile(file);
    feedback.toast(
      fileCapFailureMessage(error) ??
        uiMessage("canvas.designCanvas.couldnTPasteTheArtboards") +
          errorMessage(error),
      "error",
    );
  }
}
