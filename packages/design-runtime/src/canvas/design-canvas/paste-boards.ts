import type { Dynamic } from '../../runtime-types';
import { uiMessage } from '@minedesign/contracts/ui-messages';
import { selectionFromBoards } from '../../editor/selection/canvas-selection';
import { designAnalyticsEvents, frameAnalyticsReporter } from '../../platform/health-and-analytics';
import { PlatformFileContentFilesValue, projectFileKey, maxAnnotations, annotationVisibleBounds, artboardAppearanceProperties, designPageContents, duplicateArtboardTitle, getKvClient, uniqueArtboardFile } from '../../platform/file-content';
import { avoidPastedObjectCollisions, nextArtboardPlacementPoint, pasteCascadeStep, pastedObjectsBounds, pastedObjectsOrigin } from '../paste-placement';

interface PasteBoardsContext {
  document: { doc: Dynamic; supportsLoadState: boolean; manifest: Dynamic; activePage: Dynamic; pendingFiles: Dynamic; persistManifest: Dynamic; pageSelection: Dynamic; createNotes: Dynamic; recordHistory: Dynamic };
  placement: { camera: Dynamic; hostGesturing: Dynamic; placeActive: Dynamic; fullscreenActive: Dynamic; fitPastedBounds: Dynamic; creationBoxes: Dynamic };
  selection: { setSelection: Dynamic; clearFramePick: Dynamic };
  showToast: Dynamic;
}

/** 从应用内剪贴板粘贴画板与说明，写入文件后更新画布及撤销历史。 */
export function pasteBoardsFromClipboard(context: PasteBoardsContext, artboardClips?: Dynamic, noteClips?: Dynamic, pasteAnchor?: Dynamic): Dynamic {
  let cascadeStep: Dynamic = pasteCascadeStep(
    context.placement.camera.get().scale,
  );
  (async (): Promise<Dynamic> => {
    let newFiles: Dynamic = [];
    try {
      let state: Dynamic = {
        ...context.document.doc.content().files,
      };
      if (
        Object.keys(state).length + artboardClips.length >
        PlatformFileContentFilesValue
      ) {
        context.showToast(
          uiMessage("canvas.designCanvas.couldnTPasteThisCanvas", { limit: String(String(PlatformFileContentFilesValue)) }),
          "error",
        );
        return;
      }
      artboardClips.length > 0 && (context.placement.placeActive.current = true);
      for (let clip of artboardClips as Dynamic) {
        let newFile: Dynamic = uniqueArtboardFile(
          state,
          clip.stem,
          context.document.supportsLoadState,
        );
        state[newFile] = clip.src;
        newFiles.push(newFile);
        context.document.pendingFiles.current.add(newFile);
        try {
          await getKvClient().set(
            projectFileKey(newFile),
            clip.src,
          );
        } catch (error: Dynamic) {
          for (let file of newFiles as Dynamic)
            await getKvClient()
              .delete(
                projectFileKey(file),
              )
              .catch((): Dynamic => false);
          throw error;
        }
      }
      let pageContents: Dynamic = designPageContents(
          context.document.manifest.current,
          context.document.activePage.current,
        ),
        existingArtboards: Dynamic = pageContents.artboards.filter(
          (artboard?: Dynamic): Dynamic =>
            !context.document.pendingFiles.current.has(artboard.file),
        ),
        pasteOrigin: Dynamic = pasteAnchor
          ? avoidPastedObjectCollisions(
              pastedObjectsOrigin(
                [...artboardClips, ...noteClips],
                pasteAnchor,
              ),
              artboardClips,
              existingArtboards,
              cascadeStep,
            )
          : nextArtboardPlacementPoint([
              ...existingArtboards,
              ...context.placement.creationBoxes.current,
              ...(pageContents.annotations ?? []).map(
                annotationVisibleBounds,
              ),
            ]),
        newArtboards: Dynamic = [];
      artboardClips.forEach((clip?: Dynamic, index?: Dynamic): Dynamic => {
        newArtboards.push({
          file: newFiles[index],
          x: Math.round(pasteOrigin.x + clip.dx),
          y: Math.round(pasteOrigin.y + clip.dy),
          w: clip.w,
          h: clip.h,
          title: duplicateArtboardTitle(
            clip.title ?? clip.stem,
            [...existingArtboards, ...newArtboards],
          ),
          ...artboardAppearanceProperties(clip),
          ...context.document.pageSelection(),
        });
      });
      let sources: Dynamic = artboardClips.map(
          (clip?: Dynamic): Dynamic => clip.src,
        ),
        existingNotes: Dynamic = context.document.manifest.current.annotations ?? [],
        canAddNotes: Dynamic =
          existingNotes.length + noteClips.length <=
          maxAnnotations,
        newNotes: Dynamic = canAddNotes
          ? context.document.createNotes(
              noteClips.map((noteClip?: Dynamic): Dynamic => {
                let { page: spec, ...noteSpec }: Dynamic = noteClip.spec,
                  noteBounds: Dynamic = annotationVisibleBounds(noteClip.spec);
                return {
                  src: {
                    ...noteSpec,
                    ...context.document.pageSelection(),
                  },
                  x: pasteOrigin.x + noteClip.dx + (noteSpec.x - noteBounds.x),
                  y: pasteOrigin.y + noteClip.dy + (noteSpec.y - noteBounds.y),
                };
              }),
            )
          : [];
      !canAddNotes &&
        noteClips.length > 0 &&
        context.showToast(
          (newArtboards.length > 0
            ? uiMessage("canvas.designCanvas.theArtboardsWerePastedThe")
            : uiMessage("canvas.designCanvas.couldnTPaste")) +
            " \u2014 this canvas is at its limit for notes and shapes (" +
            String(maxAnnotations) +
            ").",
          "error",
        );
      if (newArtboards.length === 0 && newNotes.length === 0) return;
      let values: Dynamic = new Set(
        newArtboards.map((artboard?: Dynamic): Dynamic => artboard.file),
      );
      context.document.persistManifest({
        artboards: [
          ...context.document.manifest.current.artboards.filter(
            (artboard?: Dynamic): Dynamic => !values.has(artboard.file),
          ),
          ...newArtboards,
        ],
        ...(newNotes.length > 0
          ? {
              annotations: [...existingNotes, ...newNotes],
            }
          : {}),
      });
      context.document.recordHistory(
        {
          kind: "add",
          entries: newArtboards.map(
            (artboard?: Dynamic, index?: Dynamic): Dynamic => ({
              file: artboard.file,
              src: sources[index] ?? "",
              spec: artboard,
            }),
          ),
          ...(newNotes.length > 0
            ? {
                anns: newNotes,
                get label() { return uiMessage("canvas.designCanvas.paste"); },
              }
            : {}),
        },
        values,
      );
      newArtboards.length === 0 && context.selection.clearFramePick();
      context.selection.setSelection(
        selectionFromBoards({
          files: values,
          notes: new Set(
            newNotes.map((note?: Dynamic): Dynamic => note.id),
          ),
        }),
      );
      newArtboards.length > 0 &&
        frameAnalyticsReporter(
          designAnalyticsEvents.artboardInserted,
        );
      !pasteAnchor &&
        !context.placement.fullscreenActive.current &&
        !context.placement.hostGesturing.current &&
        context.placement.fitPastedBounds.current(
          pastedObjectsBounds([
            ...newArtboards,
            ...newNotes.map(annotationVisibleBounds),
          ]),
        );
    } catch (error: Dynamic) {
      console.error("[design/paste]", error);
      context.showToast(uiMessage("canvas.designCanvas.couldnTPaste2"), "error");
    } finally {
      for (let file of newFiles as Dynamic)
        context.document.pendingFiles.current.delete(file);
    }
  })();
}

