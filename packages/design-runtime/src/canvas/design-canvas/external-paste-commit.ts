import { ClipboardPastePlanningAnnotations } from "../../editor/clipboard/paste-planning";
import { projectFileKey } from "../../platform/file-content";
import { maxAnnotations } from "../../platform/file-content";
import { annotationVisibleBounds } from "../../platform/file-content";
import { artboardAppearanceProperties } from "../../platform/file-content";
import { avoidPastedObjectCollisions } from "../paste-placement";
import { designAnalyticsEvents } from "../../platform/health-and-analytics";
import { designPageContents } from "../../platform/file-content";
import { duplicateArtboardTitle } from "../../platform/file-content";
import { frameAnalyticsReporter } from "../../platform/health-and-analytics";
import { getKvClient } from "../../platform/file-content";
import { normalizeAnnotationPasteOrigin } from "../../editor/clipboard/paste-planning";
import { pastedObjectsBounds } from "../paste-placement";
import { pastedObjectsOrigin } from "../paste-placement";
import { sameViewport } from "../viewport-store";
import { selectionFromArtboards } from "../../editor/selection/canvas-selection";
import { selectionFromBoards } from "../../editor/selection/canvas-selection";
import { type Dynamic } from "../../runtime-types";
import { uiMessage } from "@minedesign/contracts/ui-messages";
import { nextArtboardPlacementPoint } from "../paste-placement";
import { deletePasteFile, type ExternalPasteOptions, type PastePoint } from "./external-paste-shared";

interface PreparedPaste {
  preparedFiles: Dynamic;
  pasteableBoards: Dynamic[];
  noteClips: Dynamic[];
  canAddNotes: boolean;
  uploadedFiles: string[];
  uploadedPaths: string[];
  storedPictureFiles: string[];
}

interface PastePlacement {
  pasteAnchor: PastePoint | null | undefined;
  startPageId: string;
  artboardsViewport: Dynamic;
  cascadeStep: number;
}

/** Write the pasted files and update the canvas manifest, selection and undo history. */
export async function commitArtboardPaste(
  { document, view }: ExternalPasteOptions,
  {
    preparedFiles, pasteableBoards, noteClips, canAddNotes,
    uploadedFiles, uploadedPaths, storedPictureFiles,
  }: PreparedPaste,
  { pasteAnchor, startPageId, artboardsViewport, cascadeStep }: PastePlacement,
) {
  view.notePlacement();
  for (let [path, content] of Object.entries(
    preparedFiles.files,
  ) as Dynamic) {
    await getKvClient().set(
      projectFileKey(path),
      content,
    );
    uploadedFiles.push(path);
  }
  let pageId: Dynamic =
      startPageId === ""
        ? (document.readManifest().pages?.[0]?.id ?? "")
        : startPageId,
    artboards: Dynamic = designPageContents(
      document.readManifest(),
      pageId,
    ).artboards,
    boardEntries: Dynamic = pasteableBoards.map(
      (board?: Dynamic): Dynamic => board.entry,
    ),
    { group: pastedGroup, shift: groupShift }: Dynamic = normalizeAnnotationPasteOrigin([
      ...boardEntries,
      ...noteClips,
    ]),
    baseOrigin: Dynamic = pasteAnchor
      ? pastedObjectsOrigin(pastedGroup, pasteAnchor)
      : nextArtboardPlacementPoint(
          noteClips.length > 0
            ? [
                ...artboards,
                ...(
                  designPageContents(
                    document.readManifest(),
                    pageId,
                  ).annotations ?? []
                ).map(annotationVisibleBounds),
              ]
            : artboards,
        ),
    state: Dynamic = {
      x: baseOrigin.x + groupShift.x,
      y: baseOrigin.y + groupShift.y,
    },
    pasteOrigin: Dynamic = pasteAnchor
      ? avoidPastedObjectCollisions(
          state,
          boardEntries,
          artboards,
          cascadeStep,
        )
      : state,
    newArtboards: Dynamic = [];
  for (let {
    path: path,
    entry: boardEntry,
  } of pasteableBoards as Dynamic) {
    await getKvClient().set(
      projectFileKey(path),
      boardEntry.src,
    );
    uploadedFiles.push(path);
    let boardTitle: Dynamic =
        boardEntry.title ??
        boardEntry.stem.split("/").pop() ??
        boardEntry.stem,
      isTitleTaken: Dynamic = [...artboards, ...newArtboards].some(
        (artboard?: Dynamic): Dynamic =>
          (artboard.title ??
            artboard.file.replace(/\.dc\.html$/, "")) === boardTitle,
      );
    newArtboards.push({
      file: path,
      x: Math.round(pasteOrigin.x + boardEntry.dx),
      y: Math.round(pasteOrigin.y + boardEntry.dy),
      w: boardEntry.w,
      h: boardEntry.h,
      title: isTitleTaken
        ? duplicateArtboardTitle(boardTitle, [
            ...artboards,
            ...newArtboards,
          ])
        : boardTitle,
      ...artboardAppearanceProperties(boardEntry),
      ...document.pageMetadata(startPageId),
    });
  }
  let newFiles: Dynamic = new Set(
      newArtboards.map((artboard?: Dynamic): Dynamic => artboard.file),
    ),
    allArtboards: Dynamic = [
      ...document.readManifest().artboards.filter(
        (artboard?: Dynamic): Dynamic => !newFiles.has(artboard.file),
      ),
      ...newArtboards,
    ],
    existingNotes: Dynamic = document.readManifest().annotations ?? [],
    noteInputs: Dynamic = noteClips.map(
      (noteClip?: Dynamic): Dynamic => {
        let noteBounds: Dynamic = annotationVisibleBounds(noteClip.spec);
        return {
          src: {
            ...noteClip.spec,
            ...document.pageMetadata(startPageId),
          },
          x: pasteOrigin.x + noteClip.dx + (noteClip.spec.x - noteBounds.x),
          y: pasteOrigin.y + noteClip.dy + (noteClip.spec.y - noteBounds.y),
        };
      },
    ),
    newNotes: Dynamic =
      canAddNotes &&
      noteInputs.length > 0 &&
      existingNotes.length + noteInputs.length <=
        maxAnnotations
        ? document.createNotes(noteInputs)
        : [],
    acceptedNotes: Dynamic =
      newNotes.length > 0 &&
      ClipboardPastePlanningAnnotations(
        {
          ...document.readManifest(),
          artboards: allArtboards,
        },
        newNotes,
      )
        ? newNotes
        : [];
  uploadedFiles.length = 0;
  document.persist({
    artboards: allArtboards,
    ...(acceptedNotes.length > 0
      ? {
          annotations: [...existingNotes, ...acceptedNotes],
        }
      : {}),
  });
  let files: Dynamic = document.store.content().files;
  document.recordHistory(
    {
      kind: "add",
      entries: newArtboards.map(
        (artboard?: Dynamic, index?: Dynamic): Dynamic => ({
          file: artboard.file,
          src: pasteableBoards[index].entry.src,
          spec: artboard,
        }),
      ),
      files: [
        ...Object.entries(preparedFiles.files).map(
          ([path, content]: Dynamic): Dynamic => ({
            path: path,
            src: content,
          }),
        ),
        ...uploadedPaths
          .filter(
            (file?: Dynamic): Dynamic =>
              typeof files[file] == "string" &&
              (acceptedNotes.length > 0 || !storedPictureFiles.includes(file)),
          )
          .map(
            (file?: Dynamic): Dynamic => ({
              path: file,
              src: files[file],
            }),
          ),
      ],
      ...(acceptedNotes.length > 0
        ? {
            anns: acceptedNotes,
            get label() { return uiMessage("canvas.designCanvas.paste"); },
          }
        : {}),
    },
    newFiles,
  );
  if (acceptedNotes.length === 0)
    for (let file of storedPictureFiles as Dynamic)
      await deletePasteFile(file);
  view.pageId() === pageId &&
    view.setSelection(
      acceptedNotes.length > 0
        ? selectionFromBoards({
            files: newFiles,
            notes: new Set(
              acceptedNotes.map(
                (note?: Dynamic): Dynamic => note.id,
              ),
            ),
          })
        : selectionFromArtboards(newFiles),
    );
  newArtboards.length > 0 &&
    frameAnalyticsReporter(
      designAnalyticsEvents.artboardInserted,
    );
  !pasteAnchor &&
    view.pageId() === pageId &&
    !view.isFullscreen() &&
    !view.isHostGesturing() &&
    sameViewport(view.camera.rest(), artboardsViewport) &&
    view.reveal(pastedObjectsBounds(newArtboards));
  return { artboardCount: newArtboards.length, acceptedNotes, noteInputs };
}
