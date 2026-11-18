import { AccessibilityAnnouncementsLabel_2 as copiedAsPngMessage } from "../../editor/accessibility/announcements";
import { AccessibilityAnnouncementsLabel_3 as copiedAsSvgMessage } from "../../editor/accessibility/announcements";
import { AccessibilityAnnouncementsLabel_4 as conversionFailedMessage } from "../../editor/accessibility/announcements";
import { AccessibilityAnnouncementsLabel_5 as anotherExportRunningMessage } from "../../editor/accessibility/announcements";
import { AccessibilityAnnouncementsLabel_7 as noSizeMessage } from "../../editor/accessibility/announcements";
import { AccessibilityAnnouncementsLabel_8 as previewStoppedMessage } from "../../editor/accessibility/announcements";
import { AccessibilityAnnouncementsLabel_9 as notVisibleMessage } from "../../editor/accessibility/announcements";
import { ClipboardAnnotationsLimit } from "../../editor/clipboard/annotations";
import { ClipboardArtboardsLimit } from "../../editor/clipboard/artboards";
import { ClipboardArtboardsResolvedValue } from "../../editor/clipboard/artboards";
import { ClipboardArtboardsTest } from "../../editor/clipboard/artboards";
import { ClipboardArtboardsTest_2 as isFontDataUrl } from "../../editor/clipboard/artboards";
import { ClipboardAssetsHandler } from "../../editor/clipboard/assets";
import { ClipboardFileTransferPasted } from "../../editor/clipboard/file-transfer";
import { ClipboardFileTransferRegistry } from "../../editor/clipboard/file-transfer";
import { ClipboardPastePlanningAnnotations } from "../../editor/clipboard/paste-planning";
import { ClipboardPastePlanningHandler } from "../../editor/clipboard/paste-planning";
import { ClipboardPastePlanningIsArray } from "../../editor/clipboard/paste-planning";
import { ClipboardStateIsArray } from "../../editor/clipboard/state";
import { ClipboardTrustDialogTitleMessageKeepCodeConfig } from "../../editor/clipboard/trust-dialog";
import { DesignArtboardsKey } from "../../editor/clipboard/state";
import { DownloadsArenTAvailableToYouForMessage } from "../../export/downloads";
import { ItsPageHasNothingToDrawMessage } from "../../editor/accessibility/announcements";
import { ItsPictureCouldnTBeMadeTryMessage } from "../../editor/accessibility/announcements";
import { PlatformFileContentConstant_5 as defaultArtboardWidth } from "../../platform/file-content";
import { PlatformFileContentConstant_6 as defaultArtboardHeight } from "../../platform/file-content";
import { PlatformFileContentFilesValue } from "../../platform/file-content";
import { PlatformFileContentHandler_4 } from "../../platform/file-content";
import { PlatformFileContentLimit_5 as maxAnnotations } from "../../platform/file-content";
import { PlatformFileContentResolvedValue_11 as maxEmbeddedFileBytes } from "../../platform/file-content";
import { PlatformFileContentWebpAvifPattern } from "../../platform/file-content";
import { ProjectValue } from "../../platform/file-content";
import { afterClipboardSettled } from "../../editor/clipboard/state";
import { allowsClipboardImages } from "../../editor/clipboard/png-copy";
import { annotationClipboardEntries } from "../../editor/clipboard/annotations";
import { annotationVisibleBounds } from "../../platform/file-content";
import { announce } from "../../editor/accessibility/announcer";
import { artboardAppearanceProperties } from "../../platform/file-content";
import { askTrustForCodePaste } from "../../editor/clipboard/trust-dialog";
import { avoidPastedObjectCollisions } from "../paste-placement";
import { awaitFeatureFlag } from "../../platform/feature-flags";
import { blankArtboardBody } from "../../editor/clipboard/annotations";
import { buildAnnotationPaste } from "../../editor/clipboard/paste-planning";
import { buildArtboardClipboard } from "../../editor/clipboard/artboards";
import { canvasElementSelectionCount } from "../../editor/selection/canvas-selection";
import { captureArtboardImage } from "../../export/image";
import { captureClipboardSvg } from "../../editor/clipboard/svg-copy";
import { clearClipboardBuffers } from "../../editor/clipboard/state";
import { clipboardContainsFileNames } from "../../editor/clipboard/native";
import { clipboardGeneration } from "../../editor/clipboard/state";
import { clipboardObjectStamp } from "../../editor/clipboard/state";
import { clipboardPayloadUsage } from "../../editor/clipboard/assets";
import { clippedArtboardsMessage } from "../../export/warnings";
import { clippedSvgCopyMessage } from "../../editor/accessibility/announcements";
import { createCurrentWorkingGeneration } from "../../editor/clipboard/working-files";
import { createPreviewHandle } from "../../preview/evaluation";
import { dataUrlToBlob } from "../../editor/clipboard/file-transfer";
import { dataUrlToFontFile } from "../../editor/clipboard/file-transfer";
import { designAnalyticsEvents } from "../../platform/health-and-analytics";
import { designPageContents } from "../../platform/file-content";
import { duplicateArtboardTitle } from "../../platform/file-content";
import { emptyCanvasSelection } from "../../editor/selection/canvas-selection";
import { errorMessage } from "../../platform/rate-limiter";
import { exportFileName } from "../../export/file-names";
import { fetchBlobAsset } from "../../platform/blob-cache";
import { fileCapFailureMessage } from "../../platform/file-content";
import { fileDataUrl } from "../../editor/clipboard/file-transfer";
import { formatArtboardNames } from "../../export/warnings";
import { frameAnalyticsReporter } from "../../platform/health-and-analytics";
import { getActiveClipboardSource } from "../../editor/clipboard/state";
import { getAllFileReferencePaths } from "../../platform/external-files";
import { getAnnotationClipboard } from "../../editor/clipboard/state";
import { getArtboardCaptureOptions } from "../../export/warnings";
import { getArtboardClipboard } from "../../editor/clipboard/state";
import { getAssetsCapability } from "../../platform/image-upload";
import { getCachedBlobObjectUrl } from "../../platform/blob-cache";
import { getDesignSystemFiles } from "../../design-system/published-files";
import { getDocumentFileCap } from "../../platform/file-content";
import { getElementClipboard } from "../../editor/clipboard/state";
import { getExternalFileReferences } from "../../platform/external-files";
import { getKvClient } from "../../platform/file-content";
import { getLinkedProjectFiles } from "../../preview/component-imports";
import { hasBlockingEditorOverlay } from "../../editor/text/typing-target";
import { hasPendingFileOverlay } from "../../design-system/type-declarations";
import { imagePasteRefusal } from "../../editor/keyboard/paste";
import { isBlobAssetUrl } from "../../platform/image-upload";
import { isClipboardSettling } from "../../editor/clipboard/state";
import { isEditingInputTarget } from "../../editor/keyboard/find";
import { isImageFile } from "../../platform/image-processing";
import { isLoadingArtboardHtml } from "../../platform/design-document-adapter";
import { isPlayableImage } from "../../editor/clipboard/image-validation";
import { isVideoFile } from "../../editor/media/video-upload";
import { markConsumedClipboardStamp } from "../../editor/clipboard/state";
import { mergeDesignSystemFileOverlay } from "../../design-system/file-overlay";
import { mirrorArtboardClipboardStamp } from "../../editor/clipboard/state";
import { missingCopiedImagesMessage } from "../../editor/accessibility/announcements";
import { missingSvgImagesMessage } from "../../editor/accessibility/announcements";
import { normalizeAnnotationPasteOrigin } from "../../editor/clipboard/paste-planning";
import { normalizeAuthoredHtml } from "../../editor/html/authoring";
import { parseAnnotationClipboard } from "../../editor/clipboard/pictures";
import { parseAnnotationPaste } from "../../editor/clipboard/paste-planning";
import { parseArtboardClipboard } from "../../editor/clipboard/artboards";
import { parseClipboardAssets } from "../../editor/clipboard/assets";
import { pasteCascadeStep } from "../paste-placement";
import { pastedObjectsBounds } from "../paste-placement";
import { pastedObjectsOrigin } from "../paste-placement";
import { pngCopyFailureMessage } from "../../editor/accessibility/announcements";
import { pngDataUrlToBlob } from "../../editor/clipboard/png-copy";
import { preparePastedArtboardFiles } from "../../editor/clipboard/file-transfer";
import { readArtboardClipboard } from "../../editor/clipboard/state";
import { readBoundedClipboardObject } from "../../editor/clipboard/state";
import { remapPastedAssetFiles } from "../../editor/clipboard/file-transfer";
import { rememberClipboardStamp } from "../../editor/clipboard/state";
import { resolveClipboardPictures } from "../../editor/clipboard/assets";
import { sameViewport } from "../viewport-store";
import { sanitizePastedHtml } from "../../editor/clipboard/html-sanitization";
import { saveExternalFileReference } from "../../platform/external-files";
import { selectionFromArtboards } from "../../editor/selection/canvas-selection";
import { selectionFromBoards } from "../../editor/selection/canvas-selection";
import { setArtboardClipboard } from "../../editor/clipboard/state";
import { setCanvasElementSelection } from "../../editor/selection/canvas-selection";
import { startClipboardMark } from "../../editor/clipboard/state";
import { svgCopyErrorMessage } from "../../editor/clipboard/svg-copy";
import { svgCopyFailureMessage } from "../../editor/accessibility/announcements";
import { textToParagraphHtml } from "../../editor/insert/targets";
import { type Dynamic } from "../../runtime-types";
import { uiMessage } from "@minedesign/contracts/ui-messages";
import { uniqueArtboardFile } from "../../platform/file-content";
import { uploadDesignFile } from "../working-state";
import { validateCanvasPlacedImage } from "../../assets/image-placement";
import { visibleArtboardCenter } from "../paste-placement";
import { withCaptureViewport } from "../../export/capture-viewport";
import { wrapInlinePastedHtml } from "../../editor/insert/drop-targets";
import { writeClipboardObject } from "../../editor/clipboard/native";
import { writeClipboardPng } from "../../editor/clipboard/png-copy";
import { writeClipboardSvg } from "../../editor/clipboard/svg-copy";
import { crossCanvasPasteConfirmFeatureFlag, nextArtboardPlacementPoint, readCanvasClipboardText } from "../design-canvas";

/** 在画布上复制画板或说明时运行：读取画板文件与外观属性，写入应用内画板剪贴板并记录剪贴板标记。 */
export function copyBoardsToClipboard(deps: { readonly doc: Dynamic; readonly value177: Dynamic; readonly value67: Dynamic }, artboardFiles?: Dynamic, noteIds?: Dynamic, getClipboardMarker?: Dynamic): Dynamic {
        (async (): Promise<Dynamic> => {
          try {
            let artboards: Dynamic = deps.value67.artboards.filter(
                (artboard?: Dynamic): Dynamic => artboardFiles.has(artboard.file),
              ),
              notes: Dynamic = (deps.value67.annotations ?? []).filter(
                (note?: Dynamic): Dynamic => noteIds.has(note.id),
              );
            if (artboards.length === 0 && notes.length === 0) {
              setTimeout(
                (): Dynamic =>
                  rememberClipboardStamp(getClipboardMarker?.()?.stamp),
                0,
              );
              return;
            }
            await Promise.all(
              artboards.map(
                (artboard?: Dynamic): Dynamic =>
                  deps.value177.current.get(artboard.file)?.flushPending(),
              ),
            );
            let files: Dynamic = deps.doc.content().files,
              noteBounds: Dynamic = notes.map(
                (note?: Dynamic): Dynamic =>
                  annotationVisibleBounds(note),
              ),
              originX: Dynamic = Math.min(
                ...artboards.map((box?: Dynamic): Dynamic => box.x),
                ...noteBounds.map((box?: Dynamic): Dynamic => box.x),
              ),
              originY: Dynamic = Math.min(
                ...artboards.map((box?: Dynamic): Dynamic => box.y),
                ...noteBounds.map((box?: Dynamic): Dynamic => box.y),
              ),
              noteEntries: Dynamic = notes.map(
                (note?: Dynamic, index?: Dynamic): Dynamic => {
                  let bounds: Dynamic = noteBounds[index];
                  return {
                    spec: note,
                    dx: bounds.x - originX,
                    dy: bounds.y - originY,
                    w: bounds.w,
                    h: bounds.h,
                  };
                },
              ),
              artboardEntries: Dynamic = [];
            for (let artboard of artboards as Dynamic) {
              let artboardSource: Dynamic =
                (await getKvClient().get(
                  PlatformFileContentHandler_4(artboard.file),
                )) ?? files[artboard.file];
              typeof artboardSource != "string" ||
                isLoadingArtboardHtml(artboardSource) ||
                artboardEntries.push({
                  src: artboardSource,
                  stem: artboard.file.replace(/\.dc\.html$/, ""),
                  dx: artboard.x - originX,
                  dy: artboard.y - originY,
                  w: artboard.w,
                  h: artboard.h,
                  ...(artboard.title
                    ? {
                        title: artboard.title,
                      }
                    : {}),
                  ...artboardAppearanceProperties(artboard),
                });
            }
            artboardEntries.length > 0 || (noteEntries.length > 0 && artboards.length === 0)
              ? setArtboardClipboard(
                  artboardEntries,
                  getClipboardMarker?.(),
                  noteEntries,
                )
              : rememberClipboardStamp(getClipboardMarker?.()?.stamp);
          } catch {
            rememberClipboardStamp(getClipboardMarker?.()?.stamp);
          }
        })();
      }

/** 从应用内剪贴板粘贴画板与说明时运行：生成新文件与标题、避开已有对象层叠放置并选中，失败时提示。 */
export function pasteBoardsFromClipboard(deps: { readonly callback3: Dynamic; readonly callback9: Dynamic; readonly doc: Dynamic; readonly setSelection: Dynamic; readonly showToast: Dynamic; readonly supportsLoadState: Dynamic; readonly value105: Dynamic; readonly value218: Dynamic; readonly value310: Dynamic; readonly value345: Dynamic; readonly value383: Dynamic; readonly value413: Dynamic; readonly value461: Dynamic; readonly value62: Dynamic; readonly value73: Dynamic; readonly value80: Dynamic; readonly value91: Dynamic; readonly value98: Dynamic }, artboardClips?: Dynamic, noteClips?: Dynamic, pasteAnchor?: Dynamic): Dynamic {
        let cascadeStep: Dynamic = pasteCascadeStep(
          deps.value105.get().scale,
        );
        (async (): Promise<Dynamic> => {
          let newFiles: Dynamic = [];
          try {
            let state: Dynamic = {
              ...deps.doc.content().files,
            };
            if (
              Object.keys(state).length + artboardClips.length >
              PlatformFileContentFilesValue
            ) {
              deps.showToast(
                uiMessage("canvas.designCanvas.couldnTPasteThisCanvas", { value1: String(String(PlatformFileContentFilesValue)) }),
                "error",
              );
              return;
            }
            artboardClips.length > 0 && (deps.value310.current = true);
            for (let clip of artboardClips as Dynamic) {
              let newFile: Dynamic = uniqueArtboardFile(
                state,
                clip.stem,
                deps.supportsLoadState,
              );
              state[newFile] = clip.src;
              newFiles.push(newFile);
              deps.value461.current.add(newFile);
              try {
                await getKvClient().set(
                  PlatformFileContentHandler_4(newFile),
                  clip.src,
                );
              } catch (error: Dynamic) {
                for (let file of newFiles as Dynamic)
                  await getKvClient()
                    .delete(
                      PlatformFileContentHandler_4(file),
                    )
                    .catch((): Dynamic => false);
                throw error;
              }
            }
            let pageContents: Dynamic = designPageContents(
                deps.value73.current,
                deps.value80.current,
              ),
              existingArtboards: Dynamic = pageContents.artboards.filter(
                (artboard?: Dynamic): Dynamic =>
                  !deps.value461.current.has(artboard.file),
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
                    ...deps.value91.current,
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
                ...deps.callback3(),
              });
            });
            let sources: Dynamic = artboardClips.map(
                (clip?: Dynamic): Dynamic => clip.src,
              ),
              existingNotes: Dynamic = deps.value73.current.annotations ?? [],
              canAddNotes: Dynamic =
                existingNotes.length + noteClips.length <=
                maxAnnotations,
              newNotes: Dynamic = canAddNotes
                ? deps.callback9(
                    noteClips.map((noteClip?: Dynamic): Dynamic => {
                      let { page: spec, ...noteSpec }: Dynamic = noteClip.spec,
                        noteBounds: Dynamic = annotationVisibleBounds(noteClip.spec);
                      return {
                        src: {
                          ...noteSpec,
                          ...deps.callback3(),
                        },
                        x: pasteOrigin.x + noteClip.dx + (noteSpec.x - noteBounds.x),
                        y: pasteOrigin.y + noteClip.dy + (noteSpec.y - noteBounds.y),
                      };
                    }),
                  )
                : [];
            !canAddNotes &&
              noteClips.length > 0 &&
              deps.showToast(
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
            deps.value98({
              artboards: [
                ...deps.value73.current.artboards.filter(
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
            deps.value413(
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
            newArtboards.length === 0 && deps.value62();
            deps.setSelection(
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
              !deps.value345.current &&
              !deps.value218.current &&
              deps.value383.current(
                pastedObjectsBounds([
                  ...newArtboards,
                  ...newNotes.map(annotationVisibleBounds),
                ]),
              );
          } catch (error: Dynamic) {
            console.error("[design/paste]", error);
            deps.showToast(uiMessage("canvas.designCanvas.couldnTPaste2"), "error");
          } finally {
            for (let file of newFiles as Dynamic)
              deps.value461.current.delete(file);
          }
        })();
      }

/** 复制到系统剪贴板前运行：把选中的画板与说明序列化为剪贴板数据，并检查体积、未上传文件与未保存修改。 */
export function buildSystemClipboardPayload(deps: { readonly doc: Dynamic; readonly value177: Dynamic; readonly value188: Dynamic; readonly value73: Dynamic }, artboardFiles?: Dynamic, noteIds?: Dynamic): Dynamic {
        let artboards: Dynamic = deps.value73.current.artboards,
          artboardClipboard: Dynamic = buildArtboardClipboard(
            artboards.filter(
              (artboard?: Dynamic): Dynamic => artboardFiles.has(artboard.file),
            ),
            artboards,
            deps.doc.content().files,
            getCachedBlobObjectUrl,
            getExternalFileReferences(),
          );
        if (!artboardClipboard && artboardFiles.size > 0) return {};
        if (artboardClipboard?.tooLarge) {
          deps.value188(
            uiMessage("canvas.designCanvas.copiedThisSelectionIsToo", { value1: String(String(ClipboardArtboardsResolvedValue >> 20)) }),
          );
          return {};
        }
        let notes: Dynamic = (deps.value73.current.annotations ?? []).filter(
            (note?: Dynamic): Dynamic => noteIds.has(note.id),
          ),
          readAssetUrl: Dynamic = (asset?: Dynamic): Dynamic =>
            getCachedBlobObjectUrl(asset) ??
            (fetchBlobAsset(asset).catch((): Dynamic => {}),
            undefined),
          noteClipboard: Dynamic = annotationClipboardEntries(
            notes,
            artboardClipboard?.origin ?? null,
            ClipboardArtboardsResolvedValue -
              (artboardClipboard?.json.length ?? 0),
            !artboardClipboard,
            {
              read: readAssetUrl,
              assets: artboardClipboard?.clip.assets ?? {},
            },
          ),
          unreadFilesMessage: Dynamic = (fileCount?: Dynamic): Dynamic =>
            fileCount === 1
              ? "Copied. One uploaded file wasn't read yet, so another canvas would go without it. Copy again in a moment."
              : uiMessage("canvas.designCanvas.copiedValue1UploadedFilesWeren", { value1: String(String(fileCount)) }),
          unsupportedFilesMessage: Dynamic = (fileCount?: Dynamic): Dynamic =>
            fileCount === 1
              ? "Copied. One uploaded file can't travel to another canvas (only images, stylesheets, scripts, fonts and JSON under 4 MB do); add it again there."
              : uiMessage("canvas.designCanvas.copiedValue1UploadedFilesCan", { value1: String(String(fileCount)) }),
          { left: skipped }: Dynamic = noteClipboard;
        if (!artboardClipboard) {
          noteClipboard.tooLarge
            ? deps.value188(
                noteClipboard.tooLarge === "bounds"
                  ? ClipboardFileTransferRegistry.tooManyNotesToCopy
                  : ClipboardFileTransferRegistry.tooLargeToCopy,
              )
            : skipped.notRead > 0
              ? deps.value188(
                  ClipboardFileTransferRegistry.picturesNotReady(
                    skipped.notRead,
                  ),
                )
              : skipped.cannot > 0
                ? deps.value188(
                    ClipboardFileTransferRegistry.picturesCantGo(
                      skipped.cannot,
                    ),
                  )
                : skipped.noRoom > 0
                  ? deps.value188(
                      ClipboardFileTransferRegistry.picturesWontFit(
                        skipped.noRoom,
                      ),
                    )
                  : skipped.overCap > 0 &&
                    deps.value188(
                      ClipboardFileTransferRegistry.picturesOverCap(
                        skipped.overCap,
                      ),
                    );
          return {
            ...noteClipboard.fields,
            ...(Object.keys(noteClipboard.assets).length > 0
              ? {
                  assets: noteClipboard.assets,
                }
              : {}),
          };
        }
        let notify: Dynamic = (message?: Dynamic): Dynamic =>
            deps.value188(
              message +
                (noteClipboard.tooLarge
                  ? ClipboardFileTransferRegistry.notesStayedToo
                  : ""),
            ),
          length: Dynamic = artboardClipboard.clip.artboards.filter(
            (artboard?: Dynamic): Dynamic =>
              deps.value177.current
                .get(artboard.stem + ".dc.html")
                ?.hasPendingEdits(),
          ).length;
        length > 0
          ? notify(
              length === 1
                ? "Copied. One artboard has unsaved edits, so another canvas would get its last saved version. Click outside it, then copy again."
                : uiMessage("canvas.designCanvas.copiedValue1ArtboardsHaveUnsaved", { value1: String(String(length)) }),
            )
          : artboardClipboard.missingAssets > 0
            ? notify(
                unreadFilesMessage(artboardClipboard.missingAssets + skipped.notRead),
              )
            : skipped.notRead > 0
              ? notify(
                  ClipboardFileTransferRegistry.picturesNotReady(
                    skipped.notRead,
                  ),
                )
              : artboardClipboard.unsupportedAssets > 0
                ? notify(
                    unsupportedFilesMessage(artboardClipboard.unsupportedAssets + skipped.cannot),
                  )
                : skipped.cannot > 0
                  ? notify(
                      ClipboardFileTransferRegistry.picturesCantGo(
                        skipped.cannot,
                      ),
                    )
                  : skipped.noRoom > 0
                    ? notify(
                        ClipboardFileTransferRegistry.picturesWontFit(
                          skipped.noRoom,
                        ),
                      )
                    : noteClipboard.tooLarge &&
                      deps.value188(
                        ClipboardFileTransferRegistry
                          .tooLargeBesideArtboards,
                      );
        return {
          ...artboardClipboard.clip,
          assets: {
            ...artboardClipboard.clip.assets,
            ...noteClipboard.assets,
          },
          ...noteClipboard.fields,
        };
      }

/** 粘贴来自系统剪贴板（可能来自其他画布）的画板、说明与图片时运行：解析数据、确认代码信任、迁移字体与图片等资源，再创建画板和图形并提示结果。 */
export function pasteExternalClipboardPayload(deps: { readonly callback3: Dynamic; readonly callback9: Dynamic; readonly doc: Dynamic; readonly setSelection: Dynamic; readonly showToast: Dynamic; readonly supportsLoadState: Dynamic; readonly value105: Dynamic; readonly value109: Dynamic; readonly value188: Dynamic; readonly value189: Dynamic; readonly value218: Dynamic; readonly value224: Dynamic; readonly value310: Dynamic; readonly value345: Dynamic; readonly value369: Dynamic; readonly value383: Dynamic; readonly value413: Dynamic; readonly value464: Dynamic; readonly value62: Dynamic; readonly value73: Dynamic; readonly value80: Dynamic; readonly value98: Dynamic }, clipboardText?: Dynamic, pasteAnchor?: Dynamic): Dynamic {
        if (!deps.value224.current) return;
        if (deps.value369.current) {
          deps.value188(ClipboardFileTransferRegistry.stillPasting);
          return;
        }
        let getPasteCancelMessage: Dynamic = (
            signal?: Dynamic,
            targetPageId?: Dynamic,
          ): Dynamic =>
            signal.aborted
              ? uiMessage("canvas.designCanvas.pasteCancelledThisCanvasWas")
              : deps.value224.current
                ? targetPageId !== undefined &&
                  targetPageId !== "" &&
                  !(deps.value73.current.pages ?? []).some(
                    (page?: Dynamic): Dynamic => page.id === targetPageId,
                  )
                  ? uiMessage("canvas.designCanvas.pasteCancelledThePageYou")
                  : null
                : uiMessage("canvas.designCanvas.pasteCancelledThisCanvasStopped"),
          makePictureOptions: Dynamic = (
            onStored?: Dynamic,
            sizeLimit?: Dynamic,
          ): Dynamic => ({
            gate: validateCanvasPlacedImage,
            upload: (file?: Dynamic): Dynamic =>
              uploadDesignFile("appifact", null, file),
            stored: onStored,
            discard: (path?: Dynamic): Dynamic => {
              getKvClient()
                .delete(PlatformFileContentHandler_4(path))
                .catch((): Dynamic => false);
            },
            maxPixels: ClipboardAssetsHandler(sizeLimit),
          }),
          pasteNotesWithPictures: Dynamic = (
            notesToPaste?: Dynamic,
            pictureInfo?: Dynamic,
            notesPasteAnchor?: Dynamic,
          ): Dynamic => {
            if (
              (deps.value73.current.annotations ?? []).length +
                notesToPaste.length +
                pictureInfo.carried.length >
              maxAnnotations
            )
              return void deps.showToast(
                ClipboardFileTransferRegistry.atLimit,
                "error",
              );
            let targetPageId: Dynamic = deps.value80.current,
              notesViewport: Dynamic = deps.value105.rest(),
              notesAbortController: Dynamic = new AbortController(),
              resolveNotesPasteDone: Dynamic = (): Dynamic => {};
            deps.value369.current = {
              ctrl: notesAbortController,
              done: new Promise((resolve?: Dynamic): Dynamic => {
                resolveNotesPasteDone = resolve;
              }),
            };
            (async (): Promise<Dynamic> => {
              let uploadedFiles: Dynamic = [],
                isCommitted: Dynamic = false,
                deleteFiles: Dynamic = async (
                  files?: Dynamic,
                ): Promise<Dynamic> => {
                  for (let file of files as Dynamic)
                    await getKvClient()
                      .delete(
                        PlatformFileContentHandler_4(file),
                      )
                      .catch((): Dynamic => false);
                };
              try {
                deps.value188(
                  ClipboardFileTransferRegistry.bringing(
                    pictureInfo.carried.length,
                  ),
                );
                let { landed: landedPictures, failed: failedPictures }: Dynamic =
                    await resolveClipboardPictures(
                      pictureInfo.carried,
                      pictureInfo.assets,
                      notesAbortController.signal,
                      makePictureOptions(
                        (file?: Dynamic): Dynamic => uploadedFiles.push(file),
                        ClipboardAnnotationsLimit,
                      ),
                    ),
                  cancelMessage: Dynamic = getPasteCancelMessage(
                    notesAbortController.signal,
                    targetPageId,
                  ),
                  { group: pastedNotes }: Dynamic = normalizeAnnotationPasteOrigin(
                    [...notesToPaste, ...landedPictures].sort(
                      (first?: Dynamic, second?: Dynamic): Dynamic =>
                        first.order - second.order,
                    ),
                  );
                if (cancelMessage !== null || pastedNotes.length === 0) {
                  deps.value188(cancelMessage ?? pictureInfo.said([], [], failedPictures));
                  return void (await deleteFiles(uploadedFiles));
                }
                let pageId: Dynamic =
                    targetPageId === ""
                      ? (deps.value73.current.pages?.[0]?.id ?? "")
                      : targetPageId,
                  targetPageContents: Dynamic = designPageContents(
                    deps.value73.current,
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
                  existingNotes: Dynamic = deps.value73.current.annotations ?? [],
                  noteInputs: Dynamic = pastedNotes.map(
                    (noteClip?: Dynamic): Dynamic => {
                      let noteBounds: Dynamic = annotationVisibleBounds(noteClip.spec);
                      return {
                        src: {
                          ...noteClip.spec,
                          ...deps.callback3(targetPageId),
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
                  newNotes: Dynamic = canAddNotes ? deps.callback9(noteInputs) : [];
                if (
                  !canAddNotes ||
                  !ClipboardPastePlanningAnnotations(
                    deps.value73.current,
                    newNotes,
                  )
                ) {
                  deps.showToast(
                    canAddNotes
                      ? ClipboardFileTransferRegistry.wontFitPictures
                      : ClipboardFileTransferRegistry.atLimit,
                    "error",
                  );
                  return void (await deleteFiles(uploadedFiles));
                }
                isCommitted = true;
                deps.value98({
                  artboards: deps.value73.current.artboards,
                  annotations: [...existingNotes, ...newNotes],
                });
                let files: Dynamic = deps.doc.content().files;
                deps.value413(
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
                deps.value80.current === pageId &&
                  (deps.value62(),
                  deps.setSelection(
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
                    !deps.value345.current &&
                    !deps.value218.current &&
                    sameViewport(deps.value105.rest(), notesViewport) &&
                    deps.value383.current(
                      pastedObjectsBounds(
                        newNotes.map(annotationVisibleBounds),
                      ),
                    ));
                let doneMessage: Dynamic = pictureInfo.said(
                  newNotes,
                  landedPictures,
                  failedPictures,
                );
                deps.value80.current === pageId &&
                ClipboardFileTransferPasted(doneMessage, newNotes)
                  ? deps.value189(doneMessage)
                  : deps.value188(doneMessage);
              } catch (error: Dynamic) {
                console.error("[design/paste]", error);
                isCommitted || (await deleteFiles(uploadedFiles));
                deps.showToast(uiMessage("canvas.designCanvas.couldnTPaste2"), "error");
              } finally {
                deps.value369.current = null;
                resolveNotesPasteDone();
              }
            })();
          };
        if (!ClipboardStateIsArray(clipboardText)) {
          let parsedNotes: Dynamic = parseAnnotationPaste(
            clipboardText,
            (notes?: Dynamic): Dynamic =>
              ClipboardPastePlanningAnnotations(
                deps.value73.current,
                notes.map(
                  (note?: Dynamic): Dynamic => ({
                    ...note,
                    ...deps.callback3(),
                  }),
                ),
                128 * notes.length,
              ),
          );
          if (parsedNotes.land === null)
            parsedNotes.error
              ? deps.showToast(parsedNotes.say, "error")
              : deps.value188(parsedNotes.say);
          else if (parsedNotes.pictures !== undefined)
            pasteNotesWithPictures(parsedNotes.land, parsedNotes.pictures, deps.value109());
          else {
            let manifestBefore: Dynamic = deps.value73.current;
            deps.value464.current(
              [],
              normalizeAnnotationPasteOrigin(parsedNotes.land)
                .group,
              deps.value109(),
            );
            if (deps.value73.current === manifestBefore) return;
            ClipboardFileTransferPasted(
              parsedNotes.say,
              parsedNotes.land.map((note?: Dynamic): Dynamic => note.spec),
            )
              ? deps.value189(parsedNotes.say)
              : deps.value188(parsedNotes.say);
          }
          return;
        }
        let notEitherHint: Dynamic = ClipboardPastePlanningIsArray(
            clipboardText,
          )
            ? ClipboardFileTransferRegistry.notEither
            : "",
          parsedClipboard: Dynamic = parseArtboardClipboard(clipboardText);
        if (!parsedClipboard) {
          deps.value188(
            uiMessage("canvas.designCanvas.nothingToPasteTheCopied") +
              notEitherHint,
          );
          return;
        }
        let shortenText: Dynamic = (text?: Dynamic): Dynamic =>
            text.length > 60 ? text.slice(0, 57) + "\u2026" : text,
          startPageId: Dynamic = deps.value80.current,
          artboardsViewport: Dynamic = deps.value105.rest(),
          cascadeStep: Dynamic = pasteCascadeStep(
            deps.value105.get().scale,
          ),
          controller: Dynamic = new AbortController(),
          resolveArtboardPasteDone: Dynamic = (): Dynamic => {};
        deps.value369.current = {
          ctrl: controller,
          done: new Promise((resolve?: Dynamic): Dynamic => {
            resolveArtboardPasteDone = resolve;
          }),
        };
        (async (): Promise<Dynamic> => {
          let uploadedFiles: Dynamic = [];
          try {
            let trustChoice: Dynamic = (await awaitFeatureFlag(
              crossCanvasPasteConfirmFeatureFlag,
              true,
            ))
              ? await askTrustForCodePaste(
                  parsedClipboard.artboards.length,
                  controller.signal,
                )
              : "with-code";
            if (trustChoice === "cancel") return;
            let earlyCancelMessage: Dynamic = getPasteCancelMessage(controller.signal);
            if (earlyCancelMessage !== null) return deps.value188(earlyCancelMessage);
            let includeCode: Dynamic = trustChoice === "with-code",
              notesClipboard: Dynamic = parseAnnotationClipboard(
                clipboardText,
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
                (deps.value73.current.annotations ?? []).length +
                  notePaste.land.length +
                  notePaste.pictures.length <=
                maxAnnotations,
              pictureAssets: Dynamic = canAddNotes
                ? parseClipboardAssets(
                    clipboardText,
                    notePaste.pictures,
                    clipboardPayloadUsage(parsedClipboard),
                  )
                : new Map(),
              storedPictureFiles: Dynamic = [],
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
              fileCap: Dynamic = getDocumentFileCap(deps.doc),
              preparedFiles: Dynamic = preparePastedArtboardFiles(
                artboardClipboard,
                deps.doc.content().files,
                deps.supportsLoadState,
                getKnownProjectFiles(),
                fileCap,
              );
            if (exceedsFileLimit(preparedFiles, deps.doc.content().files)) {
              deps.showToast(
                uiMessage("canvas.designCanvas.couldnTPasteThisCanvas", { value1: String(String(PlatformFileContentFilesValue)) }) +
                  notEitherHint,
                "error",
              );
              return;
            }
            let assetEntries: Dynamic = [
                ...Object.entries(artboardClipboard.assets).map(
                  ([path, data]: Dynamic): Dynamic => [
                    path,
                    data,
                    "asset",
                  ],
                ),
                ...Object.entries(preparedFiles.images).map(
                  ([path, data]: Dynamic): Dynamic => [
                    path,
                    data,
                    "image",
                  ],
                ),
              ],
              isFontAsset: Dynamic = assetEntries.map(
                ([, data, kind]: Dynamic): Dynamic =>
                  kind === "asset" &&
                  isFontDataUrl(data),
              ),
              sortedEntries: Dynamic = [
                ...assetEntries.filter(
                  (assetItem?: Dynamic, index?: Dynamic): Dynamic =>
                    !isFontAsset[index],
                ),
                ...assetEntries.filter(
                  (assetItem?: Dynamic, index?: Dynamic): Dynamic =>
                    isFontAsset[index],
                ),
              ],
              assetUrls: Dynamic = new Map(),
              imageUrls: Dynamic = new Map(),
              uploadedPaths: Dynamic = [],
              skippedImages: Dynamic = new Set(),
              assetMeta: Dynamic = new Map(),
              skippedAssets: Dynamic = new Set(),
              fontsLeftOutCount: Dynamic = artboardClipboard.fontsLeftOut ?? 0,
              uploadBlob: Dynamic = async (
                blob?: Dynamic,
              ): Promise<Dynamic> => {
                let assetsCapability: Dynamic = await getAssetsCapability();
                if (assetsCapability === null || typeof assetsCapability.upload != "function")
                  return;
                let mimeType: Dynamic = blob.type.split(";")[0].trim(),
                  uploadResult: Dynamic = await assetsCapability.upload(
                    new Blob([blob], {
                      type: mimeType,
                    }),
                    {
                      type: mimeType,
                    },
                  ),
                  uploadedUrl: Dynamic =
                    typeof uploadResult?.url == "string" &&
                    isBlobAssetUrl(uploadResult.url)
                      ? uploadResult.url
                      : typeof uploadResult?.id == "string"
                        ? "_blob/" + uploadResult.id
                        : undefined;
                return uploadedUrl !== undefined &&
                  isBlobAssetUrl(uploadedUrl)
                  ? uploadedUrl
                  : undefined;
              },
              totalFiles: Dynamic = sortedEntries.length + pictureAssets.size;
            if (totalFiles > 0) {
              let boardCount: Dynamic = preparedFiles.boards.length;
              deps.value188(
                (boardCount === 1
                  ? uiMessage("canvas.designCanvas.pastingAnArtboard")
                  : uiMessage("canvas.designCanvas.pastingValue1Artboards", { value1: String(String(boardCount)) })) +
                  `, bringing over ${String(totalFiles)} file${totalFiles === 1 ? "" : "s"}\u2026`,
              );
            }
            if (sortedEntries.length > 0) {
              let nextIndex: Dynamic = 0,
                uploadWorker: Dynamic = async (): Promise<Dynamic> => {
                  for (
                    let entryIndex: Dynamic = nextIndex++;
                    entryIndex < sortedEntries.length && !controller.signal.aborted;
                    entryIndex = nextIndex++
                  ) {
                    let [path, data, kind]: Dynamic =
                      sortedEntries[entryIndex];
                    if (
                      kind === "asset" &&
                      isFontDataUrl(data)
                    ) {
                      let fontFile: Dynamic = await dataUrlToFontFile(
                        data,
                        "pasted-font-" + String(entryIndex + 1),
                      );
                      if (controller.signal.aborted) break;
                      let fontUrl: Dynamic = fontFile
                        ? await uploadBlob(fontFile).catch((): Dynamic => {})
                        : undefined;
                      fontUrl === undefined
                        ? (fontsLeftOutCount += 1)
                        : assetUrls.set(
                            path,
                            fontUrl.startsWith("blob:")
                              ? fontUrl
                              : "/" + fontUrl.replace(/^\//, ""),
                          );
                      continue;
                    }
                    let blob: Dynamic = dataUrlToBlob(
                      data,
                      kind === "asset"
                        ? "pasted-image-" + String(entryIndex + 1)
                        : (path.split("/").pop() ?? path).replace(
                            /\.[^.]+$/,
                            "",
                          ),
                    );
                    if (
                      kind === "asset" &&
                      ClipboardArtboardsTest(data)
                    ) {
                      let blobUrl: Dynamic = blob
                        ? await uploadBlob(blob).catch((): Dynamic => {})
                        : undefined;
                      blobUrl === undefined || !blob
                        ? skippedAssets.add(path)
                        : (assetUrls.set(
                            path,
                            blobUrl.startsWith("blob:")
                              ? blobUrl
                              : "/" + blobUrl.replace(/^\//, ""),
                          ),
                          assetMeta.set(path, {
                            bytes: blob.size,
                            type: blob.type.split(";")[0].trim(),
                          }));
                      continue;
                    }
                    if (
                      !blob ||
                      !(await isPlayableImage(blob))
                    ) {
                      skippedImages.add(path);
                      continue;
                    }
                    if (controller.signal.aborted) break;
                    let storedSrc: Dynamic = data;
                    try {
                      storedSrc = (
                        await uploadDesignFile(
                          "appifact",
                          null,
                          blob,
                        )
                      ).src;
                      storedSrc.startsWith("./") &&
                        (uploadedPaths.push(storedSrc.slice(2)),
                        uploadedFiles.push(storedSrc.slice(2)));
                    } catch {}
                    (kind === "asset" ? assetUrls : imageUrls).set(
                      path,
                      storedSrc,
                    );
                  }
                };
              await Promise.all(
                Array.from(
                  {
                    length: Math.min(4, sortedEntries.length),
                  },
                  uploadWorker,
                ),
              );
            }
            let pictureResult: Dynamic = canAddNotes
                ? await resolveClipboardPictures(
                    notePaste.pictures,
                    pictureAssets,
                    controller.signal,
                    makePictureOptions((file?: Dynamic): Dynamic => {
                      storedPictureFiles.push(file);
                      uploadedPaths.push(file);
                      uploadedFiles.push(file);
                    }, ClipboardArtboardsLimit),
                  )
                : {
                    landed: [],
                    failed: 0,
                  },
              imageKey: Dynamic = (
                path?: Dynamic,
                content?: Dynamic,
              ): Dynamic =>
                (/\.([^./]+)$/.exec(path)?.[1] ?? "").toLowerCase() +
                ":" +
                content,
              undecodableImageKeys: Dynamic = new Set();
            for (let [path, content] of Object.entries(
              artboardClipboard.files,
            ) as Dynamic) {
              if (controller.signal.aborted) break;
              if (
                !PlatformFileContentWebpAvifPattern.test(path) ||
                imageUrls.has(path) ||
                skippedImages.has(path)
              )
                continue;
              let imageBlob: Dynamic = dataUrlToBlob(
                fileDataUrl(path, content),
                "carried",
              );
              (!imageBlob ||
                !(await isPlayableImage(imageBlob))) &&
                undecodableImageKeys.add(imageKey(path, content));
            }
            let cleanupUploads: Dynamic = async (): Promise<Dynamic> => {
                for (let file of uploadedFiles.splice(0) as Dynamic)
                  await getKvClient()
                    .delete(
                      PlatformFileContentHandler_4(file),
                    )
                    .catch((): Dynamic => false);
              },
              cancelMessage: Dynamic = getPasteCancelMessage(controller.signal, startPageId);
            if (cancelMessage !== null) {
              deps.value188(cancelMessage);
              return void (await cleanupUploads());
            }
            preparedFiles = preparePastedArtboardFiles(
              artboardClipboard,
              deps.doc.content().files,
              deps.supportsLoadState,
              getKnownProjectFiles(),
              fileCap,
            );
            if (exceedsFileLimit(preparedFiles, deps.doc.content().files)) {
              deps.showToast(
                uiMessage("canvas.designCanvas.couldnTPasteThisCanvas", { value1: String(String(PlatformFileContentFilesValue)) }) +
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
              Object.keys(deps.doc.content().files).map(
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
              deps.showToast(
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
            deps.value310.current = true;
            for (let [path, content] of Object.entries(
              preparedFiles.files,
            ) as Dynamic) {
              await getKvClient().set(
                PlatformFileContentHandler_4(path),
                content,
              );
              uploadedFiles.push(path);
            }
            let pageId: Dynamic =
                startPageId === ""
                  ? (deps.value73.current.pages?.[0]?.id ?? "")
                  : startPageId,
              artboards: Dynamic = designPageContents(
                deps.value73.current,
                pageId,
              ).artboards,
              boardEntries: Dynamic = pasteableBoards.map(
                (board?: Dynamic): Dynamic => board.entry,
              ),
              noteClips: Dynamic = [...notePaste.land, ...pictureResult.landed].sort(
                (first?: Dynamic, second?: Dynamic): Dynamic =>
                  first.order - second.order,
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
                              deps.value73.current,
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
                PlatformFileContentHandler_4(path),
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
                ...deps.callback3(startPageId),
              });
            }
            let newFiles: Dynamic = new Set(
                newArtboards.map((artboard?: Dynamic): Dynamic => artboard.file),
              ),
              allArtboards: Dynamic = [
                ...deps.value73.current.artboards.filter(
                  (artboard?: Dynamic): Dynamic => !newFiles.has(artboard.file),
                ),
                ...newArtboards,
              ],
              existingNotes: Dynamic = deps.value73.current.annotations ?? [],
              noteInputs: Dynamic = noteClips.map(
                (noteClip?: Dynamic): Dynamic => {
                  let noteBounds: Dynamic = annotationVisibleBounds(noteClip.spec);
                  return {
                    src: {
                      ...noteClip.spec,
                      ...deps.callback3(startPageId),
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
                  ? deps.callback9(noteInputs)
                  : [],
              acceptedNotes: Dynamic =
                newNotes.length > 0 &&
                ClipboardPastePlanningAnnotations(
                  {
                    ...deps.value73.current,
                    artboards: allArtboards,
                  },
                  newNotes,
                )
                  ? newNotes
                  : [];
            uploadedFiles.length = 0;
            deps.value98({
              artboards: allArtboards,
              ...(acceptedNotes.length > 0
                ? {
                    annotations: [...existingNotes, ...acceptedNotes],
                  }
                : {}),
            });
            let files: Dynamic = deps.doc.content().files;
            deps.value413(
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
                await getKvClient()
                  .delete(PlatformFileContentHandler_4(file))
                  .catch((): Dynamic => false);
            deps.value80.current === pageId &&
              deps.setSelection(
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
              deps.value80.current === pageId &&
              !deps.value345.current &&
              !deps.value218.current &&
              sameViewport(deps.value105.rest(), artboardsViewport) &&
              deps.value383.current(pastedObjectsBounds(newArtboards));
            let heldAssets: Dynamic = Object.entries(
                artboardClipboard.held ?? {},
              ).filter(
                (
                  [path]: Dynamic,
                  index?: Dynamic,
                  allHeld?: Dynamic,
                ): Dynamic =>
                  allHeld.findIndex(
                    ([otherPath]: Dynamic): Dynamic =>
                      otherPath.toLowerCase() === path.toLowerCase(),
                  ) === index,
              ),
              knownFilesLower: Dynamic = new Set(
                [
                  ...Object.keys(deps.doc.content().files),
                  ...getAllFileReferencePaths(),
                ].map((path?: Dynamic): Dynamic => path.toLowerCase()),
              ),
              isKnownFile: Dynamic = (path?: Dynamic): Dynamic =>
                !hasPendingFileOverlay() ||
                knownFilesLower.has(path.toLowerCase());
            deps.value224.current &&
              (await Promise.all(
                heldAssets.map(
                  async ([path, assetKey]: Dynamic): Promise<Dynamic> => {
                    let assetUrl: Dynamic = assetUrls.get(assetKey),
                      assetInfo: Dynamic = assetMeta.get(assetKey);
                    if (assetUrl === undefined || assetInfo === undefined) return;
                    let savePromise: Dynamic = saveExternalFileReference(
                      path,
                      assetUrl,
                      assetInfo.bytes,
                      assetInfo.type,
                      isKnownFile,
                    );
                    await Promise.race([
                      savePromise,
                      new Promise(
                        (resolve?: Dynamic, reject?: Dynamic): Dynamic =>
                          setTimeout(
                            (): Dynamic =>
                              reject(new Error("no answer from the store")),
                            8e3,
                          ),
                      ),
                    ]).catch((error?: Dynamic): Dynamic => {
                      console.warn(
                        "design (paste): the pointer document for " +
                          path +
                          " was not written \u2014 " +
                          errorMessage(error),
                      );
                      preparedFiles.dropped.push({
                        path: path,
                        why: "its upload came over, but could not be recorded here",
                      });
                    });
                  },
                ),
              ));
            let droppedByKind: Dynamic = new Map();
            for (let assetKey of skippedAssets as Dynamic) {
              let heldPaths: Dynamic = heldAssets
                .filter(([, key]: Dynamic): Dynamic => key === assetKey)
                .map(([path]: Dynamic): Dynamic => path);
              for (let path of heldPaths as Dynamic)
                preparedFiles.dropped.push({
                  path: path,
                  why: "this canvas would not take the upload",
                });
              let assetData: Dynamic = artboardClipboard.assets[assetKey] ?? "",
                kindLabel: Dynamic = /^data:text\/css/i.test(assetData)
                  ? "stylesheet"
                  : /^data:text\/javascript/i.test(assetData)
                    ? "script"
                    : "data file";
              heldPaths.length === 0 &&
                droppedByKind.set(kindLabel, (droppedByKind.get(kindLabel) ?? 0) + 1);
            }
            for (let [kindLabel, count] of droppedByKind as Dynamic)
              preparedFiles.dropped.push({
                path:
                  count === 1
                    ? "a " + kindLabel
                    : String(count) + " " + kindLabel + "s",
                why: "this canvas would not take the upload",
              });
            let projectFiles: Dynamic = [
                ...Object.keys(
                  mergeDesignSystemFileOverlay(
                    deps.doc.content().files,
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
              length: Dynamic = newArtboards.length,
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
                  : uiMessage("canvas.designCanvas.pastedValue1Artboards", { value1: String(String(length)) })) +
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
                          ClipboardPastePlanningHandler(clipboardText)
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
            caveats ? deps.value188(baseMessage + caveats) : deps.value189(baseMessage);
          } catch (error: Dynamic) {
            for (let file of uploadedFiles as Dynamic)
              await getKvClient()
                .delete(PlatformFileContentHandler_4(file))
                .catch((): Dynamic => false);
            deps.showToast(
              fileCapFailureMessage(error) ??
                uiMessage("canvas.designCanvas.couldnTPasteTheArtboards") +
                  errorMessage(error),
              "error",
            );
          } finally {
            deps.value369.current = null;
            resolveArtboardPasteDone();
          }
        })();
      }

/** 粘贴文本或 HTML 时运行：清理内容后插入目标画板的指定位置；没有目标画板时新建画板承载。 */
export function pasteHtmlIntoArtboard(deps: { readonly abandonSelectionGesture: Dynamic; readonly setSelection: Dynamic; readonly value177: Dynamic; readonly value188: Dynamic; readonly value189: Dynamic; readonly value19: Dynamic; readonly value224: Dynamic; readonly value313: Dynamic; readonly value62: Dynamic; readonly value87: Dynamic }, pastePoint?: Dynamic, pastedText?: Dynamic): Dynamic {
        if (!deps.value224.current) return;
        let trimmedText: Dynamic = pastedText.trim(),
          content: Dynamic =
            trimmedText || (getElementClipboard() ?? "").trim();
        if (!content) {
          deps.value188(
            uiMessage("canvas.designCanvas.nothingToPasteHereCopy"),
          );
          return;
        }
        let sanitizeIfHtml: Dynamic = (html?: Dynamic): Dynamic =>
          trimmedText.startsWith("<")
            ? sanitizePastedHtml(html)
            : html;
        if (pastePoint.file == null) {
          let wrappedHtml: Dynamic = wrapInlinePastedHtml(
            sanitizeIfHtml(
              content.startsWith("<")
                ? normalizeAuthoredHtml(content)
                : textToParagraphHtml(
                    content,
                    "margin: 0; position: absolute; left: 32px; top: 32px",
                  ),
            ),
          );
          if (!/<[a-z]/i.test(wrappedHtml)) {
            deps.value188(
              uiMessage("canvas.designCanvas.nothingToPasteHereThe"),
            );
            return;
          }
          deps.value313(
            {
              x: Math.round(
                pastePoint.x - defaultArtboardWidth / 2,
              ),
              y: Math.round(
                pastePoint.y - defaultArtboardHeight / 2,
              ),
              w: defaultArtboardWidth,
              h: defaultArtboardHeight,
            },
            wrappedHtml,
            {
              doneSay: "New artboard from the paste",
            },
          );
          return;
        }
        let file: Dynamic = pastePoint.file,
          artboardName: Dynamic = file.replace(/\.dc\.html$/, ""),
          editor: Dynamic = deps.value177.current.get(file),
          artboard: Dynamic = deps.value87.current.artboards.find(
            (item?: Dynamic): Dynamic => item.file === file,
          );
        if (!editor || !artboard) {
          deps.value188(
            uiMessage("canvas.designCanvas.couldnTPasteIntoValue1", { value1: String(artboardName) }),
          );
          return;
        }
        let [offsetX, offsetY]: Dynamic = [
          pastePoint.x - artboard.x,
          pastePoint.y - artboard.y,
        ];
        (content.startsWith("<")
          ? editor.insertHtml(sanitizeIfHtml(content), "stage", {
              ox: offsetX,
              oy: offsetY,
            })
          : editor.insertLayerAt(
              {
                x: offsetX,
                y: offsetY,
              },
              (left?: Dynamic, topOffset?: Dynamic): Dynamic =>
                textToParagraphHtml(
                  content,
                  `margin: 0; position: absolute; left: ${left}px; top: ${topOffset}px`,
                ),
              (): Dynamic => deps.value224.current,
              (html?: Dynamic): Dynamic => {
                let currentEditor: Dynamic = deps.value177.current.get(file);
                return currentEditor === editor
                  ? null
                  : currentEditor
                    ? currentEditor.insertHtml(html, "stage")
                    : Promise.resolve(null);
              },
            )
        ).then((insertedIds?: Dynamic): Dynamic => {
          if (insertedIds != null) {
            if (insertedIds.length === 0) {
              deps.value188(uiMessage("canvas.designCanvas.couldNotPasteNothingChanged"));
              return;
            }
            deps.abandonSelectionGesture();
            deps.value62();
            deps.setSelection(
              setCanvasElementSelection(
                emptyCanvasSelection,
                file,
                {
                  name: deps.value19(file),
                  tids: insertedIds,
                  rect: null,
                  count: insertedIds.length,
                },
                false,
              ),
            );
            deps.value189(uiMessage("canvas.designCanvas.pastedInto") + artboardName);
          }
        });
      }

/** 注册 keydown、copy、paste 监听：决定复制或粘贴走画板、画布说明还是元素剪贴板，并处理粘贴文件与图片拒绝。 */
export function subscribeClipboardEvents(deps: { readonly doc: Dynamic; readonly focusedFileRef: Dynamic; readonly selectionRef: Dynamic; readonly value105: Dynamic; readonly value109: Dynamic; readonly value111: Dynamic; readonly value112: Dynamic; readonly value113: Dynamic; readonly value120: Dynamic; readonly value159: Dynamic; readonly value160: Dynamic; readonly value224: Dynamic; readonly value448: Dynamic; readonly value463: Dynamic; readonly value464: Dynamic; readonly value466: Dynamic; readonly value468: Dynamic; readonly value470: Dynamic; readonly value471: Dynamic; readonly value472: Dynamic; readonly value473: Dynamic; readonly value474: Dynamic; readonly value475: Dynamic; readonly value48: Dynamic; readonly value52: Dynamic }): Dynamic {
    let handleKeyDown: Dynamic = (event?: Dynamic): Dynamic => {
        if (!(event.metaKey || event.ctrlKey) || event.altKey) return;
        let key: Dynamic = event.key.toLowerCase();
        if (
          (key !== "c" && key !== "v") ||
          (!deps.value224.current && key !== "c") ||
          isEditingInputTarget(event.target)
        )
          return;
        if (event.shiftKey) {
          key === "v" && (deps.value475.current = event.timeStamp);
          return;
        }
        key === "v" && (deps.value475.current = -1 / 0);
        if (key === "c") {
          let selection: Dynamic = deps.selectionRef.current;
          if (!canvasElementSelectionCount(selection)) {
            let isFocusedFileSelected: Dynamic =
              deps.focusedFileRef.current != null &&
              selection.elements.has(deps.focusedFileRef.current);
            if (!deps.value159.current && isFocusedFileSelected) return;
            if (deps.value48.current > 0) {
              let clipboardMark: Dynamic = startClipboardMark({
                markable: false,
              });
              deps.value52.current((): Dynamic => {
                deps.value160.current(clipboardMark);
              }, clipboardMark.drop);
              event.stopPropagation();
            } else deps.value160.current() && event.stopPropagation();
            return;
          }
          event.stopPropagation();
          if (event.repeat) return;
          let files: Dynamic = deps.doc.content().files;
          if (
            !(selection.artboards.size === 0
              ? selection.notes.size > 0
              : [...selection.artboards].some((file?: Dynamic): Dynamic => {
                  let source: Dynamic = files[file];
                  return (
                    typeof source == "string" &&
                    !isLoadingArtboardHtml(source)
                  );
                }))
          )
            return;
          let state: Dynamic = {
            files: new Set(selection.artboards),
            notes: new Set(selection.notes),
            mark: undefined,
          };
          deps.value472.current = state;
          deps.value463.current(
            state.files,
            state.notes,
            (): Dynamic => state.mark,
          );
          createFocusTrap();
          setTimeout((): Dynamic => {
            deps.value472.current === state && (deps.value472.current = null);
          }, 100);
          return;
        }
        if (hasBlockingEditorOverlay()) return;
        let artboardClip: Dynamic = getArtboardClipboard(),
          noteClip: Dynamic = getAnnotationClipboard(),
          pasteTarget: Dynamic = deps.value109(),
          canvasPasteTarget: Dynamic = pasteTarget?.overAnnotation ? null : pasteTarget,
          pasteAnchor: Dynamic = artboardClip
            ? deps.value112(artboardClip, noteClip, pasteTarget, canvasPasteTarget)
            : null;
        if (!artboardClip && !canvasPasteTarget) return;
        event.stopPropagation();
        clearTimeout(deps.value474.current);
        let wasSettling: Dynamic = isClipboardSettling();
        deps.value474.current = setTimeout((): Dynamic => {
          let isSettling: Dynamic =
            wasSettling || isClipboardSettling();
          afterClipboardSettled((): Dynamic => {
            if (!deps.value224.current) return;
            let latestArtboardClip: Dynamic = isSettling
                ? getArtboardClipboard()
                : artboardClip,
              latestNoteClip: Dynamic = isSettling
                ? getAnnotationClipboard()
                : noteClip,
              latestPasteTarget: Dynamic = isSettling ? deps.value109() : pasteTarget,
              latestCanvasTarget: Dynamic = latestPasteTarget?.overAnnotation ? null : latestPasteTarget;
            latestArtboardClip
              ? deps.value464.current(
                  latestArtboardClip,
                  latestNoteClip,
                  isSettling
                    ? deps.value112(latestArtboardClip, latestNoteClip, latestPasteTarget, latestCanvasTarget)
                    : pasteAnchor,
                )
              : latestCanvasTarget &&
                readCanvasClipboardText().then(
                  (text?: Dynamic): Dynamic =>
                    deps.value470.current(
                      latestCanvasTarget,
                      getActiveClipboardSource({
                        text: text,
                        stamp: null,
                        hasImage: false,
                      }) === "text"
                        ? text
                        : "",
                    ),
                );
          });
        }, 100);
      },
      focusTrap: Dynamic = null,
      removeFocusTrap: Dynamic = (): Dynamic => {
        if (!focusTrap) return;
        let previousFocus: Dynamic = focusTrap.__prev ?? null;
        focusTrap.remove();
        focusTrap = null;
        previousFocus instanceof HTMLElement &&
          previousFocus !== (document as Dynamic).body &&
          previousFocus.isConnected &&
          previousFocus.focus({
            preventScroll: true,
          });
      },
      createFocusTrap: Dynamic = (): Dynamic => {
        removeFocusTrap();
        let textarea: Dynamic = (document as Dynamic).createElement(
          "textarea",
        );
        textarea.__prev = (document as Dynamic).activeElement;
        textarea.setAttribute("aria-hidden", "true");
        textarea.value = " ";
        textarea.style.cssText =
          "position:fixed;left:0;top:0;width:1px;height:1px;opacity:0;pointer-events:none;border:0;padding:0";
        (document as Dynamic).body.appendChild(textarea);
        textarea.focus({
          preventScroll: true,
        });
        textarea.select();
        focusTrap = textarea;
        setTimeout(removeFocusTrap, 0);
      },
      handleCopy: Dynamic = (event?: Dynamic): Dynamic => {
        let pendingCopy: Dynamic = deps.value472.current;
        if (!event.isTrusted || pendingCopy == null) return;
        deps.value472.current = null;
        let { stamp: stamp, rendition: rendition }: Dynamic = deps.value473(
          pendingCopy.files,
          pendingCopy.notes,
        );
        event.preventDefault();
        event.stopImmediatePropagation();
        writeClipboardObject(event, DesignArtboardsKey, {
          data: {
            stamp: stamp,
            ...deps.value466.current(pendingCopy.files, pendingCopy.notes),
          },
          text: rendition,
        }) &&
          ((pendingCopy.mark = {
            stamp: stamp,
            rendition: rendition,
          }),
          mirrorArtboardClipboardStamp(stamp, rendition));
      },
      handlePaste: Dynamic = (event?: Dynamic): Dynamic => {
        clearTimeout(deps.value474.current);
        if (!deps.value224.current || event.timeStamp - deps.value475.current < 1e3)
          return;
        let items: Dynamic = [...(event.clipboardData?.files ?? [])],
          mediaFiles: Dynamic = items.filter(
            (file?: Dynamic): Dynamic =>
              isImageFile(file) ||
              isVideoFile(file),
          ),
          pastedText: Dynamic =
            event.clipboardData?.getData("text/plain") ?? "",
          clipboardObject: Dynamic = readBoundedClipboardObject(event),
          foreignArtboards: Dynamic = readArtboardClipboard(clipboardObject),
          state: Dynamic = {
            text: pastedText,
            stamp: clipboardObjectStamp(clipboardObject),
            hasImage:
              mediaFiles.length > 0 &&
              clipboardContainsFileNames(items, pastedText),
            artboards: foreignArtboards,
          },
          refusal: Dynamic = imagePasteRefusal(
            event.target,
            getActiveClipboardSource(state) === "image",
            pastedText,
            mediaFiles.length > 0 && mediaFiles.every(isVideoFile)
              ? "video"
              : "image",
          );
        refusal.to === "nobody" &&
          (event.preventDefault(),
          event.stopImmediatePropagation(),
          deps.value448.current(refusal.say));
        if (refusal.to !== "canvas") return;
        let isSettling: Dynamic = isClipboardSettling(),
          consumeEvent: Dynamic = (shouldStop?: Dynamic): Dynamic => {
            isSettling
              ? markConsumedClipboardStamp(event)
              : (event.preventDefault(),
                shouldStop && event.stopImmediatePropagation());
          };
        afterClipboardSettled(
          (): Dynamic => {
            if (!deps.value224.current) return;
            let clipboardSource: Dynamic = getActiveClipboardSource(
                state,
              ),
              artboardClip: Dynamic = getArtboardClipboard(),
              noteClip: Dynamic = getAnnotationClipboard(),
              pasteTarget: Dynamic = deps.value109(),
              canvasPasteTarget: Dynamic = pasteTarget?.overAnnotation ? null : pasteTarget;
            if (clipboardSource === "foreign-artboards") {
              consumeEvent(false);
              deps.value468.current(foreignArtboards, deps.value111());
              return;
            }
            let centeredArtboard: Dynamic =
                clipboardSource === "image" &&
                (pasteTarget == null
                  ? deps.focusedFileRef.current == null
                  : pasteTarget.file == null)
                  ? deps.value113()
                  : null,
              imageTarget: Dynamic =
                clipboardSource === "image" && centeredArtboard == null ? pasteTarget : null,
              isCanvasImagePaste: Dynamic =
                clipboardSource === "image" &&
                centeredArtboard == null &&
                imageTarget == null &&
                deps.focusedFileRef.current == null;
            if (artboardClip && clipboardSource === "artboards") {
              consumeEvent(true);
              deps.value464.current(
                artboardClip,
                noteClip,
                deps.value112(artboardClip, noteClip, pasteTarget, canvasPasteTarget),
              );
              return;
            }
            if (
              centeredArtboard == null &&
              imageTarget == null &&
              !isCanvasImagePaste &&
              (clipboardSource === "image" || canvasPasteTarget == null)
            )
              return;
            consumeEvent(true);
            let {
                w: viewportWidth,
                h: viewportHeight,
                top: viewportTop,
              }: Dynamic = deps.value120(),
              camera: Dynamic = deps.value105.get();
            if (centeredArtboard != null) {
              let center: Dynamic = visibleArtboardCenter(
                centeredArtboard,
                {
                  ...camera,
                  y: camera.y + viewportTop / camera.scale,
                  width: viewportWidth,
                  height: viewportHeight - viewportTop,
                },
              );
              deps.value471.current(
                mediaFiles,
                center.x,
                center.y,
                "pasted",
                centeredArtboard.file,
              );
            } else
              imageTarget != null
                ? deps.value471.current(
                    mediaFiles,
                    imageTarget.x,
                    imageTarget.y,
                    "pasted",
                    imageTarget.file ?? undefined,
                  )
                : isCanvasImagePaste
                  ? deps.value471.current(
                      mediaFiles,
                      camera.x + viewportWidth / 2 / camera.scale,
                      camera.y + (viewportTop + viewportHeight) / 2 / camera.scale,
                      "pasted",
                    )
                  : deps.value470.current(
                      canvasPasteTarget,
                      clipboardSource === "text" ? pastedText : "",
                    );
          },
          (): Dynamic => markConsumedClipboardStamp(event),
        );
      };
    (window as Dynamic).addEventListener("keydown", handleKeyDown, true);
    (window as Dynamic).addEventListener("copy", handleCopy, true);
    (window as Dynamic).addEventListener("paste", handlePaste, true);
    return (): Dynamic => {
      clearTimeout(deps.value474.current);
      removeFocusTrap();
      (window as Dynamic).removeEventListener("keydown", handleKeyDown, true);
      (window as Dynamic).removeEventListener("copy", handleCopy, true);
      (window as Dynamic).removeEventListener("paste", handlePaste, true);
    };
  }

/** 画板菜单选择复制为 PNG 时运行：截取画板图像并写入系统剪贴板，处理不可见、无法绘制与缺图提示。 */
export function copyArtboardAsPng(deps: { readonly hideToast: Dynamic; readonly showToast: Dynamic; readonly value177: Dynamic; readonly value479: Dynamic; readonly value480: Dynamic; readonly value483: Dynamic; readonly value494: Dynamic; readonly value502: Dynamic; readonly value503: Dynamic; readonly value87: Dynamic; readonly value93: Dynamic }, file?: Dynamic): Dynamic {
        if (deps.value480) return;
        if (deps.value494())
          return void deps.showToast(anotherExportRunningMessage);
        let artboard: Dynamic = deps.value87.current.artboards.find(
            (item?: Dynamic): Dynamic => item.file === file,
          ),
          generationAtStart: Dynamic = clipboardGeneration(),
          isStillCurrent: Dynamic = createCurrentWorkingGeneration(),
          failureMessage: Dynamic = null,
          isClipboardBlocked: Dynamic = false,
          state: Dynamic = {
            blank: 0,
          },
          blobPromise: Dynamic = (async (): Promise<Dynamic> => {
            deps.value479(true);
            try {
              if (!(await allowsClipboardImages())) {
                isClipboardBlocked = true;
                return null;
              }
              let frameElement: Dynamic = await deps.value483(file),
                previewHandle: Dynamic = frameElement
                  ? createPreviewHandle(frameElement)
                  : null;
              if (
                !frameElement ||
                !previewHandle ||
                frameElement.getBoundingClientRect().width === 0
              ) {
                failureMessage = deps.value177.current.get(file)?.isBlocked()
                  ? previewStoppedMessage
                  : notVisibleMessage;
                return null;
              }
              let captureResult: Dynamic = await captureArtboardImage(
                previewHandle,
                "png",
                2,
                artboard
                  ? getArtboardCaptureOptions(artboard, deps.value93)
                  : {
                      selectionRoot: "body",
                    },
              ).catch(
                (error?: Dynamic): Dynamic => (
                  (failureMessage = errorMessage(error)),
                  null
                ),
              );
              return captureResult
                ? captureResult.ok
                  ? ((state = {
                      blank: captureResult.embedWarningCount,
                      ...(captureResult.clipped
                        ? {
                            clipped: true,
                          }
                        : {}),
                    }),
                    clipboardGeneration() === generationAtStart &&
                    isStillCurrent()
                      ? pngDataUrlToBlob(captureResult.uri)
                      : null)
                  : ((failureMessage =
                      captureResult.softError === "zero-size"
                        ? noSizeMessage
                        : ItsPageHasNothingToDrawMessage),
                    null)
                : null;
            } catch (error: Dynamic) {
              console.error("[copy-png] artboard", error);
              failureMessage = ItsPictureCouldnTBeMadeTryMessage;
              return null;
            } finally {
              deps.value479(false);
            }
          })();
        writeClipboardPng(blobPromise).then(
          (writeResult?: Dynamic): Dynamic => {
            if (
              !(
                clipboardGeneration() !== generationAtStart || !isStillCurrent()
              )
            )
              if (writeResult === "copied") {
                clearClipboardBuffers();
                announce(
                  copiedAsPngMessage,
                );
                if (state.clipped) {
                  let fileName: Dynamic = exportFileName(
                      file,
                      artboard?.title,
                    ),
                    canExportFull: Dynamic = deps.value502(file),
                    toastId: Dynamic = deps.showToast(
                      clippedArtboardsMessage(
                        [fileName],
                        canExportFull,
                      ),
                      "info",
                      canExportFull
                        ? {
                            action: deps.value503(
                              [file],
                              false,
                              (): Dynamic => deps.hideToast(toastId),
                              false,
                            ),
                            pinned: true,
                          }
                        : undefined,
                    );
                }
                state.blank > 0 &&
                  deps.showToast(
                    missingCopiedImagesMessage(state.blank),
                    "info",
                  );
              } else
                isClipboardBlocked
                  ? deps.showToast(DownloadsArenTAvailableToYouForMessage)
                  : deps.showToast(
                      pngCopyFailureMessage(
                        "artboard",
                        writeResult === "refused" ? null : failureMessage,
                      ),
                      "error",
                    );
          },
        );
      }

/** 画板菜单选择复制为 SVG 时运行：在捕获视口中生成 SVG 并写入剪贴板，处理裁切、缺图与失败提示。 */
export function copyArtboardAsSvg(deps: { readonly hideToast: Dynamic; readonly showToast: Dynamic; readonly value177: Dynamic; readonly value479: Dynamic; readonly value480: Dynamic; readonly value483: Dynamic; readonly value494: Dynamic; readonly value502: Dynamic; readonly value503: Dynamic; readonly value87: Dynamic; readonly value93: Dynamic }, file?: Dynamic): Dynamic {
        if (deps.value480) return;
        if (deps.value494())
          return void deps.showToast(anotherExportRunningMessage);
        let artboard: Dynamic = deps.value87.current.artboards.find(
            (item?: Dynamic): Dynamic => item.file === file,
          ),
          generationAtStart: Dynamic = clipboardGeneration(),
          isStillCurrent: Dynamic = createCurrentWorkingGeneration(),
          failureMessage: Dynamic = null,
          isClipboardBlocked: Dynamic = false,
          blankImageCount: Dynamic = 0,
          wasClipped: Dynamic = false,
          svgPromise: Dynamic = (async (): Promise<Dynamic> => {
            deps.value479(true);
            try {
              if (!(await allowsClipboardImages())) {
                isClipboardBlocked = true;
                return null;
              }
              let frameElement: Dynamic = await deps.value483(file),
                previewHandle: Dynamic = frameElement
                  ? createPreviewHandle(frameElement)
                  : null;
              if (
                !frameElement ||
                !previewHandle ||
                frameElement.getBoundingClientRect().width === 0
              ) {
                failureMessage = deps.value177.current.get(file)?.isBlocked()
                  ? previewStoppedMessage
                  : notVisibleMessage;
                return null;
              }
              let captureOptions: Dynamic = artboard
                  ? getArtboardCaptureOptions(artboard, deps.value93)
                  : null,
                frame: Dynamic = captureOptions?.frame,
                validFrame: Dynamic =
                  frame &&
                  Number.isFinite(frame.w) &&
                  Number.isFinite(frame.h) &&
                  frame.w > 0 &&
                  frame.h > 0
                    ? frame
                    : null,
                captureResult: Dynamic = await withCaptureViewport(
                  previewHandle,
                  validFrame,
                  (): Dynamic =>
                    captureClipboardSvg(
                      previewHandle,
                      "page",
                      validFrame && {
                        w: validFrame.w,
                        h: captureOptions?.clipToFrame ? validFrame.h : null,
                      },
                    ),
                  captureOptions?.settle === true,
                ).catch(
                  (error?: Dynamic): Dynamic => (
                    console.error("[copy-svg] artboard", error),
                    (failureMessage = svgCopyErrorMessage(error)),
                    null
                  ),
                );
              return captureResult
                ? captureResult.ok
                  ? ((blankImageCount = captureResult.blank),
                    (wasClipped = captureResult.clipped),
                    clipboardGeneration() === generationAtStart &&
                    isStillCurrent()
                      ? captureResult.svg
                      : null)
                  : ((failureMessage =
                      captureResult.softError === "zero-size"
                        ? noSizeMessage
                        : conversionFailedMessage),
                    null)
                : null;
            } catch (error: Dynamic) {
              console.error("[copy-svg] artboard", error);
              failureMessage = conversionFailedMessage;
              return null;
            } finally {
              deps.value479(false);
            }
          })();
        writeClipboardSvg(svgPromise).then(
          (writeResult?: Dynamic): Dynamic => {
            if (
              !(
                clipboardGeneration() !== generationAtStart || !isStillCurrent()
              )
            )
              if (writeResult === "copied") {
                clearClipboardBuffers();
                announce(
                  copiedAsSvgMessage,
                );
                if (wasClipped) {
                  let canExportFull: Dynamic = deps.value502(file),
                    toastId: Dynamic = deps.showToast(
                      clippedSvgCopyMessage(
                        formatArtboardNames([
                          exportFileName(file, artboard?.title),
                        ]),
                        canExportFull,
                      ),
                      "info",
                      canExportFull
                        ? {
                            action: deps.value503(
                              [file],
                              false,
                              (): Dynamic => deps.hideToast(toastId),
                              false,
                            ),
                            pinned: true,
                          }
                        : undefined,
                    );
                }
                blankImageCount > 0 &&
                  deps.showToast(
                    missingSvgImagesMessage(blankImageCount),
                    "info",
                  );
              } else
                isClipboardBlocked
                  ? deps.showToast(DownloadsArenTAvailableToYouForMessage)
                  : deps.showToast(
                      svgCopyFailureMessage(
                        "artboard",
                        writeResult === "refused" ? null : failureMessage,
                      ),
                      "error",
                    );
          },
        );
      }
