import { maxVideosPerDrop } from "../working-state";
import { CanvasWorkingStateHandler } from "../working-state";
import { minImageDimension as minDroppedImageWidth } from "../../platform/file-content";
import { maxAnnotations as annotationLimit } from "../../platform/file-content";
import { maxCanvasItemDimension as maxDroppedImageHeight } from "../../platform/file-content";
import { PlatformFileContentSlice } from "../../platform/file-content";
import { parseAnnotationImageUrl as validatedImageSrc } from "../../platform/file-content";
import { parseAnnotationVideoUrl as validatedVideoSrc } from "../../platform/file-content";
import { afterNextPaint } from "../working-state";
import { announce } from "../../editor/accessibility/announcer";
import { canDecodeRasterImage } from "../../editor/clipboard/image-validation";
import { captureVideoPoster } from "../../editor/media/video-upload";
import { createDropGhost } from "../working-state";
import { createElementEditId } from "../../editor/geometry/snapping";
import { defaultPlacedImageSize } from "../paste-placement";
import { droppedImageLabel } from "../paste-placement";
import { droppedImageMarkup } from "../paste-placement";
import { droppedImagePlacement } from "../paste-placement";
import { emptyBoardSelection } from "../../editor/selection/canvas-selection";
import { fileDropPosition } from "../../editor/insert/drop-targets";
import { imageHeaderDimensions } from "../working-state";
import { imagePlacementRejectionReason } from "../../assets/image-placement";
import { isEmbedFrozen } from "../../platform/file-content";
import { isSvgFile } from "../working-state";
import { markDropPerformance } from "../working-state";
import { pngPhysicalDimensions } from "../working-state";
import { positionedVideoHtml } from "../working-state";
import { previewImageFile } from "../working-state";
import { probeVideoFile } from "../../editor/media/video-upload";
import { rasterImageDimensions } from "../working-state";
import { registerHiddenPickerTag } from "../../editor/picker/hidden-tags";
import { safeDroppedImageAltText } from "../paste-placement";
import { selectionFromBoards } from "../../editor/selection/canvas-selection";
import { trackEmbeddedWrite } from "../../platform/file-content";
import { type Dynamic } from "../../runtime-types";
import { uiMessage } from "@minedesign/contracts/ui-messages";
import { uiOperation } from "@minedesign/contracts/ui-value";
import { uploadDesignFile } from "../working-state";
import { uploadDesignVideo } from "../working-state";
import { validateCanvasPlacedImage } from "../../assets/image-placement";
import { videoFileTitle } from "../working-state";
import { videoUploadFailureMessage } from "../../editor/media/video-upload";
import { videoUploadRefusal } from "../../editor/media/video-upload";

/** 图片文件拖入或粘贴到画布或画板时运行：校验尺寸与格式、上传文件、显示占位，再作为画布图片或画板内图片元素插入。 */
export function placeDroppedImages(deps: { readonly focusedFile: Dynamic; readonly selection: Dynamic; readonly setSelection: Dynamic; readonly artboardEntries: Dynamic; readonly showDragToast: Dynamic; readonly playingFile: Dynamic; readonly addAnnotation: Dynamic; readonly setPendingPictures: Dynamic; readonly pendingPictures: Dynamic; readonly pictureSequence: Dynamic; readonly findDropArtboard: Dynamic; readonly canvasTool: Dynamic; readonly clearFramePick: Dynamic; readonly manifest: Dynamic; readonly activePage: Dynamic }, files?: Dynamic,
        dropX?: Dynamic,
        dropY?: Dynamic,
        sourceLabel?: Dynamic,
        targetHint?: Dynamic): Dynamic {
        let cancelGhosts: Dynamic = (): Dynamic => {};
        trackEmbeddedWrite(
          (async (): Promise<Dynamic> => {
            let targetArtboard: Dynamic = deps.findDropArtboard(dropX, dropY, targetHint);
            if (targetArtboard != null && targetArtboard.file === deps.playingFile.current) {
              deps.showDragToast(
                uiMessage("canvas.designCanvas.nothingAddedThatArtboardIs"),
              );
              return;
            }
            if (targetHint != null && !targetArtboard) {
              deps.showDragToast(uiMessage("canvas.designCanvas.couldNotPlaceImage", { source: uiOperation(sourceLabel) }));
              return;
            }
            let placeInArtboard: Dynamic = (
                naturalSize?: Dynamic,
                slotIndex?: Dynamic,
                artboard?: Dynamic,
              ): Dynamic =>
                droppedImagePlacement(
                  {
                    x: dropX,
                    y: dropY,
                  },
                  artboard,
                  naturalSize,
                  slotIndex,
                ),
              fitCanvasImageSize: Dynamic = (
                naturalSize?: Dynamic,
                density?: Dynamic,
              ): Dynamic => {
                let { w: defaultWidth, h: defaultHeight }: Dynamic = defaultPlacedImageSize(naturalSize, density);
                return defaultHeight > maxDroppedImageHeight
                  ? {
                      w: Math.max(
                        minDroppedImageWidth,
                        Math.round(
                          (defaultWidth * maxDroppedImageHeight) /
                            defaultHeight,
                        ),
                      ),
                      h: maxDroppedImageHeight,
                    }
                  : {
                      w: defaultWidth,
                      h: defaultHeight,
                    };
              };
            markDropPerformance("received");
            let headerInfos: Dynamic = files.map(
                (): Dynamic => ({
                  d: null,
                  density: null,
                }),
              ),
              pageId: Dynamic = deps.activePage.current,
              computePlacements: Dynamic = (shouldSkip?: Dynamic): Dynamic => {
                let slotCounter: Dynamic = 0,
                  nextX: Dynamic = 0,
                  nextY: Dynamic = 0;
                return files.map(
                  (file?: Dynamic, fileIndex?: Dynamic): Dynamic => {
                    if (shouldSkip(fileIndex)) return null;
                    let naturalDimensions: Dynamic = headerInfos[fileIndex].d ?? {
                      width: 320,
                      height: 240,
                    };
                    if (targetArtboard)
                      return placeInArtboard(naturalDimensions, slotCounter++, targetArtboard);
                    let { w: placedWidth, h: placedHeight }: Dynamic = fitCanvasImageSize(
                      naturalDimensions,
                      headerInfos[fileIndex].density,
                    );
                    slotCounter++ === 0 &&
                      ([nextX, nextY] = [
                        Math.round(dropX - placedWidth / 2),
                        Math.round(dropY - placedHeight / 2),
                      ]);
                    let state: Dynamic = {
                      x: nextX,
                      y: nextY,
                      w: placedWidth,
                      h: placedHeight,
                    };
                    nextX += placedWidth + 80;
                    return state;
                  },
                );
              },
              ghosts: Dynamic = computePlacements((): Dynamic => false).map(
                (placement?: Dynamic): Dynamic =>
                  createDropGhost({
                    file: targetArtboard?.file ?? null,
                    page: pageId,
                    ...placement,
                  }),
              ),
              values: Dynamic = new Set(ghosts.keys()),
              settleGhost: Dynamic = (
                ghostIndex?: Dynamic,
                action?: Dynamic,
              ): Dynamic => {
                values.delete(ghostIndex) && ghosts[ghostIndex][action]();
              };
            cancelGhosts = (): Dynamic => {
              for (let ghostIndex of [...values] as Dynamic)
                settleGhost(ghostIndex, "cancel");
            };
            headerInfos = await Promise.all(
              files.map(async (file?: Dynamic): Promise<Dynamic> => {
                let headerView: Dynamic = await file
                  .slice(0, 262144)
                  .arrayBuffer()
                  .then((buffer?: Dynamic): Dynamic => new DataView(buffer))
                  .catch((): Dynamic => null);
                return {
                  d: isSvgFile(file)
                    ? await imageHeaderDimensions(file).catch(
                        (): Dynamic => null,
                      )
                    : headerView &&
                      rasterImageDimensions(headerView),
                  density:
                    headerView && pngPhysicalDimensions(headerView),
                };
              }),
            );
            computePlacements((): Dynamic => false).forEach(
              (placement?: Dynamic, fileIndex?: Dynamic): Dynamic => {
                placement && ghosts[fileIndex].place(placement);
              },
            );
            markDropPerformance("header");
            await afterNextPaint();
            let canDecodeFlags: Dynamic = await Promise.all(
                files.map(
                  (file?: Dynamic): Dynamic =>
                    imagePlacementRejectionReason(file) ==
                      null && !isSvgFile(file)
                      ? canDecodeRasterImage(file)
                      : Promise.resolve(false),
                ),
              ),
              previews: Dynamic = await Promise.all(
                files.map(
                  (file?: Dynamic, fileIndex?: Dynamic): Dynamic =>
                    canDecodeFlags[fileIndex]
                      ? previewImageFile(file, {
                          sized: true,
                          head: headerInfos[fileIndex].d,
                        }).catch((): Dynamic => null)
                      : Promise.resolve(null),
                ),
              ),
              rejections: Dynamic = await Promise.all(
                files.map(
                  (file?: Dynamic, fileIndex?: Dynamic): Dynamic =>
                    previews[fileIndex]
                      ? Promise.resolve(null)
                      : validateCanvasPlacedImage(
                          file,
                          isSvgFile(file)
                            ? undefined
                            : canDecodeFlags[fileIndex],
                        ),
                ),
              );
            await Promise.all(
              files.map(
                async (
                  file?: Dynamic,
                  fileIndex?: Dynamic,
                ): Promise<Dynamic> => {
                  rejections[fileIndex] == null &&
                    !previews[fileIndex] &&
                    isSvgFile(file) &&
                    (previews[fileIndex] = await previewImageFile(
                      file,
                    ).catch((): Dynamic => null));
                },
              ),
            );
            markDropPerformance("gate");
            let dimensionList: Dynamic = headerInfos.map(
                (headerInfo?: Dynamic): Dynamic => headerInfo.d,
              ),
              densityList: Dynamic = headerInfos.map(
                (headerInfo?: Dynamic): Dynamic => headerInfo.density,
              );
            files.forEach((file?: Dynamic, fileIndex?: Dynamic): Dynamic => {
              rejections[fileIndex] == null &&
                !previews[fileIndex] &&
                dimensionList[fileIndex] == null &&
                (rejections[fileIndex] = uiMessage("canvas.designCanvas.tooLargeToPlaceHere"));
            });
            files.forEach((file?: Dynamic, fileIndex?: Dynamic): Dynamic => {
              rejections[fileIndex] != null && settleGhost(fileIndex, "cancel");
            });
            computePlacements(
              (fileIndex?: Dynamic): Dynamic => rejections[fileIndex] != null,
            ).forEach((placement?: Dynamic, fileIndex?: Dynamic): Dynamic => {
              placement && ghosts[fileIndex].move(placement.x, placement.y);
            });
            let length: Dynamic = rejections.filter(
              (rejection?: Dynamic): Dynamic => rejection != null,
            ).length;
            length > 0 &&
              deps.showDragToast(
                length === files.length
                  ? uiMessage("canvas.designCanvas.couldNotUseImageFile", { source: uiOperation(sourceLabel) }) +
                      (files.length > 1 ? uiMessage("canvas.designCanvas.s") : " \u2014 ") +
                      [
                        ...new Set(
                          rejections.filter(
                            (rejection?: Dynamic): Dynamic => rejection != null,
                          ),
                        ),
                      ].join("; ") +
                      "."
                  : String(length) +
                      ` of the ${sourceLabel} files couldn't be used as images \u2014 placing the rest.`,
              );
            if (length === files.length) return;
            let placeholderImage: Dynamic = (
              size?: Dynamic,
              seed?: Dynamic,
            ): Dynamic => {
              let svgMarkup: Dynamic = `<svg xmlns="http://www.w3.org/2000/svg" width="${size.width}" height="${size.height}" data-seed="${seed}-${Date.now()}"><rect width="100%" height="100%" fill="#e9e7e2"/></svg>`;
              return {
                url: "data:image/svg+xml," + encodeURIComponent(svgMarkup),
                width: size.width,
                height: size.height,
              };
            };
            files.forEach((file?: Dynamic, fileIndex?: Dynamic): Dynamic => {
              previews[fileIndex] =
                rejections[fileIndex] != null
                  ? null
                  : (previews[fileIndex] ??
                    placeholderImage(dimensionList[fileIndex], fileIndex));
            });
            let uploadAndSwap: Dynamic = (
              artboardHandle?: Dynamic,
              fileIndex?: Dynamic,
              previewUrl?: Dynamic,
              editMark?: Dynamic,
            ): Dynamic => {
              let releasePickerTag: Dynamic = registerHiddenPickerTag(
                  editMark,
                ),
                clearDropMark: Dynamic = async (): Promise<Dynamic> => {
                  isEmbedFrozen() ||
                    (await artboardHandle
                      .swapImageAttrs(previewUrl, {
                        "data-dc-drop": null,
                      })
                      .catch((): Dynamic => false));
                };
              trackEmbeddedWrite(
                uploadDesignFile(
                  "appifact",
                  null,
                  files[fileIndex],
                )
                  .then(async ({ src: src }: Dynamic): Promise<Dynamic> => {
                    if (isEmbedFrozen()) return;
                    (await artboardHandle.swapImageAttrs(previewUrl, {
                      src: src,
                      "data-dc-drop": null,
                    })) ||
                      (await clearDropMark(),
                      deps.showDragToast(
                        uiMessage("canvas.designCanvas.imageKeptAsAnEmbedded"),
                      ));
                  })
                  .catch(
                    async (): Promise<Dynamic> => (
                      await clearDropMark(),
                      deps.showDragToast(
                        uiMessage("canvas.designCanvas.imageUploadFailedPreviewKept", { source: uiOperation(sourceLabel) }),
                      ),
                      false
                    ),
                  )
                  .finally((): Dynamic => {
                    markDropPerformance("upload");
                    releasePickerTag();
                  }),
              );
            };
            if (!targetArtboard) {
              let availableSlots: Dynamic =
                annotationLimit -
                (deps.manifest.current.annotations ?? []).length -
                deps.pendingPictures.current.length;
              if (availableSlots <= 0) {
                cancelGhosts();
                deps.showDragToast(
                  uiMessage("canvas.designCanvas.thisCanvasIsAtIts2") +
                    String(annotationLimit) +
                    ").",
                );
                return;
              }
              let currentPageId: Dynamic = deps.activePage.current,
                state: Dynamic = {
                  sel: deps.selection.current,
                  tool: deps.canvasTool.current,
                  focus: deps.focusedFile.current,
                },
                droppedSelection: Dynamic = null,
                placedNotes: Dynamic = [],
                nextX: Dynamic = 0,
                nextY: Dynamic = 0,
                placedCount: Dynamic = 0,
                pendingUploads: Dynamic = 0,
                finishUpload: Dynamic = (): Dynamic => {
                  if (--pendingUploads > 0 || placedNotes.length === 0) return;
                  let unplacedCount: Dynamic = placedCount - placedNotes.length,
                    placedSummary: Dynamic =
                      placedNotes.length === 1
                        ? uiMessage("canvas.designCanvas.pictureFromImage", { source: uiOperation(sourceLabel) })
                        : `${placedNotes.length} pictures from the ${sourceLabel} images`,
                    unplacedMessage: Dynamic = `${unplacedCount} of the ${sourceLabel} images ${unplacedCount === 1 ? "was" : "were"} not placed.`;
                  unplacedCount > 0 && deps.showDragToast(unplacedMessage);
                  announce(
                    placedSummary +
                      (unplacedCount > 0 ? "; " + unplacedMessage.slice(0, -1) : "") +
                      (length > 0
                        ? `; ${length} of the ${sourceLabel} files couldn't be used`
                        : ""),
                  );
                };
              for (
                let fileIndex: Dynamic = 0;
                fileIndex < files.length && placedCount < availableSlots;
                fileIndex++
              ) {
                let preview: Dynamic = previews[fileIndex];
                if (!preview) continue;
                let naturalSize: Dynamic = dimensionList[fileIndex] ?? {
                    width: preview.width,
                    height: preview.height,
                  },
                  { w: placedWidth, h: placedHeight }: Dynamic = fitCanvasImageSize(
                    naturalSize,
                    densityList[fileIndex],
                  );
                placedCount === 0 &&
                  ((nextX = Math.round(dropX - placedWidth / 2)),
                  (nextY = Math.round(dropY - placedHeight / 2)));
                let pendingPicture: Dynamic = {
                  key: "pp-" + String(++deps.pictureSequence.current),
                  x: nextX,
                  y: nextY,
                  w: placedWidth,
                  h: placedHeight,
                  url: preview.url,
                  page: currentPageId,
                };
                deps.setPendingPictures((pictures?: Dynamic): Dynamic => [...pictures, pendingPicture]);
                settleGhost(fileIndex, "replaced");
                markDropPerformance("insert");
                let removePendingPicture: Dynamic = (): Dynamic => {
                  markDropPerformance("upload");
                  deps.setPendingPictures(
                    (pictures?: Dynamic): Dynamic =>
                      pictures.filter(
                        (picture?: Dynamic): Dynamic => picture !== pendingPicture,
                      ),
                  );
                };
                pendingUploads++;
                trackEmbeddedWrite(
                  uploadDesignFile(
                    "appifact",
                    null,
                    files[fileIndex],
                  ).then(({ src: src }: Dynamic): Dynamic => {
                    if (isEmbedFrozen()) return;
                    removePendingPicture();
                    let uploadedSrc: Dynamic = validatedImageSrc(src);
                    if (uploadedSrc === null) {
                      deps.showDragToast(
                        uiMessage("canvas.designCanvas.couldNotPlaceImageHere", { source: uiOperation(sourceLabel) }),
                      );
                      return finishUpload();
                    }
                    let createdNote: Dynamic = deps.addAnnotation.current(
                      {
                        kind: "image",
                        x: pendingPicture.x,
                        y: pendingPicture.y,
                        w: placedWidth,
                        h: placedHeight,
                        src: uploadedSrc,
                        alt: PlatformFileContentSlice(
                          droppedImageLabel(
                            files[fileIndex],
                            sourceLabel,
                          ),
                        ),
                        ...(currentPageId === "" ||
                        currentPageId === (deps.manifest.current.pages?.[0]?.id ?? "")
                          ? {}
                          : {
                              page: currentPageId,
                            }),
                      },
                      {
                        quiet: true,
                      },
                    );
                    if (createdNote === null) {
                      finishUpload();
                      return false;
                    }
                    placedNotes.push(createdNote);
                    (deps.selection.current === state.sel ||
                      deps.selection.current === droppedSelection) &&
                      deps.canvasTool.current === state.tool &&
                      deps.focusedFile.current === state.focus &&
                      deps.activePage.current === currentPageId &&
                      ((droppedSelection = selectionFromBoards({
                        files: emptyBoardSelection.files,
                        notes: new Set(placedNotes),
                      })),
                      (deps.selection.current = droppedSelection),
                      deps.clearFramePick(),
                      deps.setSelection(droppedSelection));
                    finishUpload();
                  }),
                ).catch((): Dynamic => {
                  removePendingPicture();
                  deps.showDragToast(
                    uiMessage("canvas.designCanvas.imageNotPlaced", { source: uiOperation(sourceLabel) }),
                  );
                  finishUpload();
                });
                nextX += placedWidth + 80;
                placedCount++;
              }
              cancelGhosts();
              let previewCount: Dynamic = previews.filter(Boolean).length;
              placedCount < previewCount &&
                deps.showDragToast(
                  uiMessage("canvas.designCanvas.placingTheFirst") +
                    String(placedCount) +
                    " \u2014 this canvas is at its limit for notes and shapes (" +
                    String(annotationLimit) +
                    ").",
                );
              return;
            }
            let entry: Dynamic = deps.artboardEntries.current.get(targetArtboard.file);
            if (!entry) {
              cancelGhosts();
              deps.showDragToast(uiMessage("canvas.designCanvas.couldNotPlaceImage", { source: uiOperation(sourceLabel) }));
              return;
            }
            let index: Dynamic = 0;
            for (let fileIndex: Dynamic = 0; fileIndex < files.length; fileIndex++) {
              let preview: Dynamic = previews[fileIndex];
              if (!preview) continue;
              let naturalSize: Dynamic = dimensionList[fileIndex] ?? {
                  width: preview.width,
                  height: preview.height,
                },
                {
                  x: left,
                  y: top,
                  w: width,
                }: Dynamic = placeInArtboard(naturalSize, index, targetArtboard),
                editMark: Dynamic = createElementEditId(fileIndex),
                markup: Dynamic = droppedImageMarkup({
                  src: preview.url,
                  mark: editMark,
                  alt: safeDroppedImageAltText(
                    droppedImageLabel(files[fileIndex], sourceLabel),
                    droppedImageLabel(
                      {
                        name: "",
                      },
                      sourceLabel,
                    ),
                  ),
                  natural: naturalSize,
                  left: left,
                  top: top,
                  w: width,
                });
              if ((await entry.insertHtml(markup, "page")).length === 0) {
                settleGhost(fileIndex, "cancel");
                continue;
              }
              settleGhost(fileIndex, "landed");
              markDropPerformance("insert");
              index++;
              uploadAndSwap(entry, fileIndex, preview.url, editMark);
            }
            cancelGhosts();
            index > 0
              ? announce(
                  index +
                    (index > 1 ? " images " : " image ") +
                    sourceLabel +
                    (length > 0
                      ? `; ${length} of the ${sourceLabel} files couldn't be used`
                      : ""),
                )
              : deps.showDragToast(uiMessage("canvas.designCanvas.couldNotPlaceImage", { source: uiOperation(sourceLabel) }));
          })().finally((): Dynamic => cancelGhosts()),
        );
      }

/** 视频文件拖入画布或画板时运行：探测视频、生成封面、上传后作为画布视频或画板内视频元素插入，处理数量上限与失败提示。 */
export function placeDroppedVideos(deps: { readonly focusedFile: Dynamic; readonly selection: Dynamic; readonly setSelection: Dynamic; readonly artboardEntries: Dynamic; readonly showDragToast: Dynamic; readonly playingFile: Dynamic; readonly addAnnotation: Dynamic; readonly pendingPictures: Dynamic; readonly findDropArtboard: Dynamic; readonly canvasTool: Dynamic; readonly clearFramePick: Dynamic; readonly manifest: Dynamic; readonly activePage: Dynamic }, files?: Dynamic,
      dropX?: Dynamic,
      dropY?: Dynamic,
      sourceLabel?: Dynamic,
      targetHint?: Dynamic,
      slotOffset?: Dynamic,
      dropArea?: Dynamic): Dynamic {
      let cancelGhosts: Dynamic = (): Dynamic => {};
      trackEmbeddedWrite(
        (async (): Promise<Dynamic> => {
          let targetArtboard: Dynamic = deps.findDropArtboard(dropX, dropY, targetHint);
          if (targetArtboard != null && targetArtboard.file === deps.playingFile.current) {
            deps.showDragToast(
              uiMessage("canvas.designCanvas.nothingAddedThatArtboardIs"),
            );
            return;
          }
          if (targetHint != null && !targetArtboard) {
            deps.showDragToast(
              uiMessage("canvas.designCanvas.videoArtboardGone", { source: uiOperation(sourceLabel) }),
            );
            return;
          }
          if (
            targetArtboard &&
            deps.artboardEntries.current.get(targetArtboard.file)?.isReady() !== true
          ) {
            deps.showDragToast(
              uiMessage("canvas.designCanvas.nothingAddedThatArtboardIsn"),
            );
            return;
          }
          if (targetArtboard && deps.artboardEntries.current.get(targetArtboard.file)?.holdsDeck()) {
            deps.showDragToast(CanvasWorkingStateHandler("artboard"));
            return;
          }
          let values: Dynamic = new Set(),
            reportProblem: Dynamic = (message?: Dynamic): Dynamic => {
              values.add(message);
              deps.showDragToast([...values].join(" "));
            },
            acceptedFiles: Dynamic = files.filter((file?: Dynamic): Dynamic => {
              let refusal: Dynamic = videoUploadRefusal(file);
              refusal != null &&
                reportProblem(videoUploadFailureMessage(refusal));
              return refusal == null;
            }),
            uploadFiles: Dynamic = acceptedFiles.slice(
              0,
              maxVideosPerDrop,
            );
          acceptedFiles.length > uploadFiles.length &&
            reportProblem(
              uiMessage("canvas.designCanvas.addingFirstVideos", { count: String(maxVideosPerDrop) }),
            );
          if (uploadFiles.length === 0) return;
          if (
            !targetArtboard &&
            (deps.manifest.current.annotations ?? []).length +
              deps.pendingPictures.current.length +
              uploadFiles.length >
              annotationLimit
          ) {
            deps.showDragToast(
              uiMessage("canvas.designCanvas.thisCanvasIsAtIts2") +
                String(annotationLimit) +
                ").",
            );
            return;
          }
          markDropPerformance("received");
          let pageId: Dynamic = deps.activePage.current,
            state: Dynamic = {
              sel: deps.selection.current,
              tool: deps.canvasTool.current,
              focus: deps.focusedFile.current,
            },
            nextX: Dynamic = null,
            computePlacement: Dynamic = (
              naturalSize?: Dynamic,
              slotIndex?: Dynamic,
            ): Dynamic => {
              if (targetArtboard && dropArea) {
                let placedWidth: Dynamic = Math.round(
                    Math.min(naturalSize.width, Math.max(48, dropArea.w * 0.6)),
                  ),
                  placedHeight: Dynamic = Math.max(
                    1,
                    Math.round((placedWidth * naturalSize.height) / naturalSize.width),
                  ),
                  { left: left, top: top }: Dynamic = fileDropPosition(
                    dropArea,
                    slotOffset + slotIndex,
                    placedWidth,
                    placedHeight,
                  );
                return {
                  x: left,
                  y: top,
                  w: placedWidth,
                  h: placedHeight,
                };
              }
              if (targetArtboard)
                return droppedImagePlacement(
                  {
                    x: dropX,
                    y: dropY,
                  },
                  targetArtboard,
                  naturalSize,
                  slotOffset + slotIndex,
                );
              let defaultSize: Dynamic = defaultPlacedImageSize(
                  naturalSize,
                  null,
                ),
                { w: canvasWidth, h: canvasHeight }: Dynamic =
                  defaultSize.h > maxDroppedImageHeight
                    ? {
                        w: Math.max(
                          minDroppedImageWidth,
                          Math.round(
                            (defaultSize.w *
                              maxDroppedImageHeight) /
                              defaultSize.h,
                          ),
                        ),
                        h: maxDroppedImageHeight,
                      }
                    : defaultSize,
                placedX: Dynamic =
                  nextX ??
                  (slotOffset > 0
                    ? Math.round(dropX) + slotOffset * 1280
                    : Math.round(dropX - canvasWidth / 2));
              nextX = placedX + canvasWidth + 80;
              return {
                x: placedX,
                y: Math.round(dropY - canvasHeight / 2),
                w: canvasWidth,
                h: canvasHeight,
              };
            },
            toLocalRect: Dynamic = (rect?: Dynamic): Dynamic =>
              targetArtboard && dropArea
                ? {
                    ...rect,
                    x: rect.x - dropArea.sx,
                    y: rect.y - dropArea.sy,
                  }
                : rect,
            ghosts: Dynamic = uploadFiles.map(
              (file?: Dynamic, fileIndex?: Dynamic): Dynamic =>
                createDropGhost({
                  file: targetArtboard?.file ?? null,
                  page: pageId,
                  washless: true,
                  ...toLocalRect(
                    computePlacement(
                      {
                        width: 320,
                        height: 180,
                      },
                      fileIndex,
                    ),
                  ),
                }),
            );
          nextX = null;
          let pendingGhostIndexes: Dynamic = new Set(ghosts.keys()),
            settleGhost: Dynamic = (
              ghostIndex?: Dynamic,
              action?: Dynamic,
            ): Dynamic => {
              pendingGhostIndexes.delete(ghostIndex) && ghosts[ghostIndex][action]();
            };
          cancelGhosts = (): Dynamic => {
            for (let ghostIndex of [...pendingGhostIndexes] as Dynamic)
              settleGhost(ghostIndex, "cancel");
          };
          let probeResults: Dynamic = await Promise.all(
              uploadFiles.map(
                (file?: Dynamic): Dynamic =>
                  (targetArtboard
                    ? probeVideoFile(file)
                    : captureVideoPoster(file)
                  ).catch((): Dynamic => "probe_timeout"),
              ),
            ),
            index: Dynamic = 0,
            placements: Dynamic = probeResults.map(
              (probeResult?: Dynamic, fileIndex?: Dynamic): Dynamic => {
                if (typeof probeResult == "string") {
                  settleGhost(fileIndex, "cancel");
                  reportProblem(videoUploadFailureMessage(probeResult));
                  return null;
                }
                let placement: Dynamic = computePlacement(probeResult, index++);
                ghosts[fileIndex].place(toLocalRect(placement));
                return placement;
              },
            );
          placements.some(Boolean) &&
            announce(
              placements.filter(Boolean).length > 1
                ? uiMessage("canvas.designCanvas.uploadingVideos")
                : uiMessage("canvas.designCanvas.uploadingVideo"),
            );
          let landedCount: Dynamic = 0,
            droppedSelection: Dynamic = null,
            items: Dynamic = [];
          for (let fileIndex: Dynamic = 0; fileIndex < uploadFiles.length; fileIndex++) {
            let probeResult: Dynamic = probeResults[fileIndex],
              placement: Dynamic = placements[fileIndex];
            if (
              probeResult == null ||
              typeof probeResult == "string" ||
              placement == null
            )
              continue;
            let posterSrc: Dynamic = null;
            if (!targetArtboard) {
              let blob: Dynamic = probeResult.blob;
              posterSrc =
                blob === undefined
                  ? null
                  : await uploadDesignFile(
                      "appifact",
                      null,
                      new File(
                        [blob],
                        videoFileTitle(uploadFiles[fileIndex]) +
                          ".jpg",
                        {
                          type: "image/jpeg",
                        },
                      ),
                    ).then(
                      (uploaded?: Dynamic): Dynamic =>
                        validatedImageSrc(uploaded.src),
                      (): Dynamic => null,
                    );
              if (isEmbedFrozen()) return;
              if (posterSrc === null) {
                settleGhost(fileIndex, "cancel");
                reportProblem(
                  uiMessage("canvas.designCanvas.couldNotStoreVideoStill", { source: uiOperation(sourceLabel) }),
                );
                continue;
              }
            }
            let videoUpload: Dynamic = await uploadDesignVideo(
              uploadFiles[fileIndex],
              probeResult,
            );
            markDropPerformance("upload");
            if (isEmbedFrozen()) return;
            if ("refused" in videoUpload) {
              settleGhost(fileIndex, "cancel");
              reportProblem(videoUpload.refused);
              if (videoUpload.repeats) break;
              continue;
            }
            if (!targetArtboard) {
              let videoSrc: Dynamic = validatedVideoSrc(
                  videoUpload.src,
                ),
                createdNote: Dynamic =
                  posterSrc === null || videoSrc === null
                    ? null
                    : deps.addAnnotation.current(
                        {
                          kind: "image",
                          x: placement.x,
                          y: placement.y,
                          w: placement.w,
                          h: placement.h,
                          src: posterSrc,
                          video: videoSrc,
                          alt: PlatformFileContentSlice(
                            videoFileTitle(uploadFiles[fileIndex]),
                          ),
                          ...(pageId === "" ||
                          pageId === (deps.manifest.current.pages?.[0]?.id ?? "")
                            ? {}
                            : {
                                page: pageId,
                              }),
                        },
                        {
                          quiet: true,
                        },
                      );
              if (createdNote === null) {
                settleGhost(fileIndex, "cancel");
                (deps.manifest.current.annotations ?? []).length <
                  annotationLimit &&
                  reportProblem(
                    uiMessage("canvas.designCanvas.couldNotAddVideo", { source: uiOperation(sourceLabel) }),
                  );
                continue;
              }
              items.push(createdNote);
              (deps.selection.current === state.sel ||
                deps.selection.current === droppedSelection) &&
                deps.canvasTool.current === state.tool &&
                deps.focusedFile.current === state.focus &&
                deps.activePage.current === pageId &&
                ((droppedSelection = selectionFromBoards({
                  files: emptyBoardSelection.files,
                  notes: new Set(items),
                })),
                (deps.selection.current = droppedSelection),
                deps.clearFramePick(),
                deps.setSelection(droppedSelection));
              settleGhost(fileIndex, "landed");
              landedCount++;
              continue;
            }
            let artboardHandle: Dynamic;
            for (
              let attempt: Dynamic = 0;
              attempt < 120 &&
              !isEmbedFrozen() &&
              ((artboardHandle =
                targetArtboard.file === deps.playingFile.current
                  ? undefined
                  : deps.artboardEntries.current.get(targetArtboard.file)),
              !artboardHandle);
              attempt++
            )
              await new Promise(
                (resolve?: Dynamic): Dynamic => setTimeout(resolve, 500),
              );
            if (
              (artboardHandle
                ? await artboardHandle.insertHtml(
                    positionedVideoHtml(
                      videoUpload.src,
                      probeResult,
                      {
                        left: placement.x,
                        top: placement.y,
                        w: placement.w,
                      },
                      safeDroppedImageAltText(
                        videoFileTitle(uploadFiles[fileIndex]),
                        videoFileTitle({
                          name: "",
                        }),
                      ),
                    ),
                    "page",
                  )
                : []
              ).length === 0
            ) {
              settleGhost(fileIndex, "cancel");
              reportProblem(
                artboardHandle
                  ? uiMessage("canvas.designCanvas.couldNotPlaceVideo", { source: uiOperation(sourceLabel) })
                  : uiMessage("canvas.designCanvas.theVideoUploadedButIts"),
              );
              continue;
            }
            settleGhost(fileIndex, "landed");
            markDropPerformance("insert");
            landedCount++;
          }
          landedCount > 0 &&
            announce(
              landedCount + (landedCount > 1 ? " videos " : " video ") + sourceLabel,
            );
        })().finally((): Dynamic => cancelGhosts()),
      );
    }
