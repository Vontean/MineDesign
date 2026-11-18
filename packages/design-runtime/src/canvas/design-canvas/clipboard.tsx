import { AccessibilityAnnouncementsLabel_2 } from "../../editor/accessibility/announcements";
import { AccessibilityAnnouncementsLabel_3 } from "../../editor/accessibility/announcements";
import { AccessibilityAnnouncementsLabel_4 } from "../../editor/accessibility/announcements";
import { AccessibilityAnnouncementsLabel_5 } from "../../editor/accessibility/announcements";
import { AccessibilityAnnouncementsLabel_7 } from "../../editor/accessibility/announcements";
import { AccessibilityAnnouncementsLabel_8 } from "../../editor/accessibility/announcements";
import { AccessibilityAnnouncementsLabel_9 } from "../../editor/accessibility/announcements";
import { ClipboardAnnotationsLimit } from "../../editor/clipboard/annotations";
import { ClipboardArtboardsLimit } from "../../editor/clipboard/artboards";
import { ClipboardArtboardsResolvedValue } from "../../editor/clipboard/artboards";
import { ClipboardArtboardsTest } from "../../editor/clipboard/artboards";
import { ClipboardArtboardsTest_2 } from "../../editor/clipboard/artboards";
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
import { PlatformFileContentConstant_5 } from "../../platform/file-content";
import { PlatformFileContentConstant_6 } from "../../platform/file-content";
import { PlatformFileContentFilesValue } from "../../platform/file-content";
import { PlatformFileContentHandler_4 } from "../../platform/file-content";
import { PlatformFileContentLimit_5 } from "../../platform/file-content";
import { PlatformFileContentResolvedValue_11 } from "../../platform/file-content";
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
export function copyBoardsToClipboard(deps: { readonly doc: Dynamic; readonly value177: Dynamic; readonly value67: Dynamic }, input?: Dynamic, options?: Dynamic, context?: Dynamic): Dynamic {
        (async (): Promise<Dynamic> => {
          try {
            let value653: Dynamic = deps.value67.artboards.filter(
                (input2?: Dynamic): Dynamic => input.has(input2.file),
              ),
              value654: Dynamic = (deps.value67.annotations ?? []).filter(
                (input2?: Dynamic): Dynamic => options.has(input2.id),
              );
            if (value653.length === 0 && value654.length === 0) {
              setTimeout(
                (): Dynamic =>
                  rememberClipboardStamp(context?.()?.stamp),
                0,
              );
              return;
            }
            await Promise.all(
              value653.map(
                (input2?: Dynamic): Dynamic =>
                  deps.value177.current.get(input2.file)?.flushPending(),
              ),
            );
            let files: Dynamic = deps.doc.content().files,
              value655: Dynamic = value654.map(
                (input2?: Dynamic): Dynamic =>
                  annotationVisibleBounds(input2),
              ),
              value656: Dynamic = Math.min(
                ...value653.map((input2?: Dynamic): Dynamic => input2.x),
                ...value655.map((input2?: Dynamic): Dynamic => input2.x),
              ),
              value657: Dynamic = Math.min(
                ...value653.map((input2?: Dynamic): Dynamic => input2.y),
                ...value655.map((input2?: Dynamic): Dynamic => input2.y),
              ),
              value658: Dynamic = value654.map(
                (input2?: Dynamic, options2?: Dynamic): Dynamic => {
                  let value659: Dynamic = value655[options2];
                  return {
                    spec: input2,
                    dx: value659.x - value656,
                    dy: value659.y - value657,
                    w: value659.w,
                    h: value659.h,
                  };
                },
              ),
              items: Dynamic = [];
            for (let value659 of value653 as Dynamic) {
              let value660: Dynamic =
                (await getKvClient().get(
                  PlatformFileContentHandler_4(value659.file),
                )) ?? files[value659.file];
              typeof value660 != "string" ||
                isLoadingArtboardHtml(value660) ||
                items.push({
                  src: value660,
                  stem: value659.file.replace(/\.dc\.html$/, ""),
                  dx: value659.x - value656,
                  dy: value659.y - value657,
                  w: value659.w,
                  h: value659.h,
                  ...(value659.title
                    ? {
                        title: value659.title,
                      }
                    : {}),
                  ...artboardAppearanceProperties(value659),
                });
            }
            items.length > 0 || (value658.length > 0 && value653.length === 0)
              ? setArtboardClipboard(
                  items,
                  context?.(),
                  value658,
                )
              : rememberClipboardStamp(context?.()?.stamp);
          } catch {
            rememberClipboardStamp(context?.()?.stamp);
          }
        })();
      }

/** 从应用内剪贴板粘贴画板与说明时运行：生成新文件与标题、避开已有对象层叠放置并选中，失败时提示。 */
export function pasteBoardsFromClipboard(deps: { readonly callback3: Dynamic; readonly callback9: Dynamic; readonly doc: Dynamic; readonly setSelection: Dynamic; readonly showToast: Dynamic; readonly supportsLoadState: Dynamic; readonly value105: Dynamic; readonly value218: Dynamic; readonly value310: Dynamic; readonly value345: Dynamic; readonly value383: Dynamic; readonly value413: Dynamic; readonly value461: Dynamic; readonly value62: Dynamic; readonly value73: Dynamic; readonly value80: Dynamic; readonly value91: Dynamic; readonly value98: Dynamic }, items?: Dynamic, items2?: Dynamic, context?: Dynamic): Dynamic {
        let value653: Dynamic = pasteCascadeStep(
          deps.value105.get().scale,
        );
        (async (): Promise<Dynamic> => {
          let items3: Dynamic = [];
          try {
            let state: Dynamic = {
              ...deps.doc.content().files,
            };
            if (
              Object.keys(state).length + items.length >
              PlatformFileContentFilesValue
            ) {
              deps.showToast(
                uiMessage("canvas.designCanvas.couldnTPasteThisCanvas", { value1: String(String(PlatformFileContentFilesValue)) }),
                "error",
              );
              return;
            }
            items.length > 0 && (deps.value310.current = true);
            for (let value661 of items as Dynamic) {
              let value662: Dynamic = uniqueArtboardFile(
                state,
                value661.stem,
                deps.supportsLoadState,
              );
              state[value662] = value661.src;
              items3.push(value662);
              deps.value461.current.add(value662);
              try {
                await getKvClient().set(
                  PlatformFileContentHandler_4(value662),
                  value661.src,
                );
              } catch (value663: Dynamic) {
                for (let value664 of items3 as Dynamic)
                  await getKvClient()
                    .delete(
                      PlatformFileContentHandler_4(value664),
                    )
                    .catch((): Dynamic => false);
                throw value663;
              }
            }
            let value654: Dynamic = designPageContents(
                deps.value73.current,
                deps.value80.current,
              ),
              value655: Dynamic = value654.artboards.filter(
                (input?: Dynamic): Dynamic =>
                  !deps.value461.current.has(input.file),
              ),
              value656: Dynamic = context
                ? avoidPastedObjectCollisions(
                    pastedObjectsOrigin(
                      [...items, ...items2],
                      context,
                    ),
                    items,
                    value655,
                    value653,
                  )
                : nextArtboardPlacementPoint([
                    ...value655,
                    ...deps.value91.current,
                    ...(value654.annotations ?? []).map(
                      annotationVisibleBounds,
                    ),
                  ]),
              items4: Dynamic = [];
            items.forEach((input?: Dynamic, options?: Dynamic): Dynamic => {
              items4.push({
                file: items3[options],
                x: Math.round(value656.x + input.dx),
                y: Math.round(value656.y + input.dy),
                w: input.w,
                h: input.h,
                title: duplicateArtboardTitle(
                  input.title ?? input.stem,
                  [...value655, ...items4],
                ),
                ...artboardAppearanceProperties(input),
                ...deps.callback3(),
              });
            });
            let value657: Dynamic = items.map(
                (input?: Dynamic): Dynamic => input.src,
              ),
              value658: Dynamic = deps.value73.current.annotations ?? [],
              value659: Dynamic =
                value658.length + items2.length <=
                PlatformFileContentLimit_5,
              value660: Dynamic = value659
                ? deps.callback9(
                    items2.map((input?: Dynamic): Dynamic => {
                      let { page: spec, ...spec2 }: Dynamic = input.spec,
                        value661: Dynamic = annotationVisibleBounds(input.spec);
                      return {
                        src: {
                          ...spec2,
                          ...deps.callback3(),
                        },
                        x: value656.x + input.dx + (spec2.x - value661.x),
                        y: value656.y + input.dy + (spec2.y - value661.y),
                      };
                    }),
                  )
                : [];
            !value659 &&
              items2.length > 0 &&
              deps.showToast(
                (items4.length > 0
                  ? uiMessage("canvas.designCanvas.theArtboardsWerePastedThe")
                  : uiMessage("canvas.designCanvas.couldnTPaste")) +
                  " \u2014 this canvas is at its limit for notes and shapes (" +
                  String(PlatformFileContentLimit_5) +
                  ").",
                "error",
              );
            if (items4.length === 0 && value660.length === 0) return;
            let values: Dynamic = new Set(
              items4.map((input?: Dynamic): Dynamic => input.file),
            );
            deps.value98({
              artboards: [
                ...deps.value73.current.artboards.filter(
                  (input?: Dynamic): Dynamic => !values.has(input.file),
                ),
                ...items4,
              ],
              ...(value660.length > 0
                ? {
                    annotations: [...value658, ...value660],
                  }
                : {}),
            });
            deps.value413(
              {
                kind: "add",
                entries: items4.map(
                  (input?: Dynamic, options?: Dynamic): Dynamic => ({
                    file: input.file,
                    src: value657[options] ?? "",
                    spec: input,
                  }),
                ),
                ...(value660.length > 0
                  ? {
                      anns: value660,
                      get label() { return uiMessage("canvas.designCanvas.paste"); },
                    }
                  : {}),
              },
              values,
            );
            items4.length === 0 && deps.value62();
            deps.setSelection(
              selectionFromBoards({
                files: values,
                notes: new Set(
                  value660.map((input?: Dynamic): Dynamic => input.id),
                ),
              }),
            );
            items4.length > 0 &&
              frameAnalyticsReporter(
                designAnalyticsEvents.artboardInserted,
              );
            !context &&
              !deps.value345.current &&
              !deps.value218.current &&
              deps.value383.current(
                pastedObjectsBounds([
                  ...items4,
                  ...value660.map(annotationVisibleBounds),
                ]),
              );
          } catch (value654: Dynamic) {
            console.error("[design/paste]", value654);
            deps.showToast(uiMessage("canvas.designCanvas.couldnTPaste2"), "error");
          } finally {
            for (let value654 of items3 as Dynamic)
              deps.value461.current.delete(value654);
          }
        })();
      }

/** 复制到系统剪贴板前运行：把选中的画板与说明序列化为剪贴板数据，并检查体积、未上传文件与未保存修改。 */
export function buildSystemClipboardPayload(deps: { readonly doc: Dynamic; readonly value177: Dynamic; readonly value188: Dynamic; readonly value73: Dynamic }, input?: Dynamic, options?: Dynamic): Dynamic {
        let artboards: Dynamic = deps.value73.current.artboards,
          value653: Dynamic = buildArtboardClipboard(
            artboards.filter(
              (input2?: Dynamic): Dynamic => input.has(input2.file),
            ),
            artboards,
            deps.doc.content().files,
            getCachedBlobObjectUrl,
            getExternalFileReferences(),
          );
        if (!value653 && input.size > 0) return {};
        if (value653?.tooLarge) {
          deps.value188(
            uiMessage("canvas.designCanvas.copiedThisSelectionIsToo", { value1: String(String(ClipboardArtboardsResolvedValue >> 20)) }),
          );
          return {};
        }
        let value654: Dynamic = (deps.value73.current.annotations ?? []).filter(
            (input2?: Dynamic): Dynamic => options.has(input2.id),
          ),
          callback15: Dynamic = (input2?: Dynamic): Dynamic =>
            getCachedBlobObjectUrl(input2) ??
            (fetchBlobAsset(input2).catch((): Dynamic => {}),
            undefined),
          value655: Dynamic = annotationClipboardEntries(
            value654,
            value653?.origin ?? null,
            ClipboardArtboardsResolvedValue -
              (value653?.json.length ?? 0),
            !value653,
            {
              read: callback15,
              assets: value653?.clip.assets ?? {},
            },
          ),
          callback16: Dynamic = (input2?: Dynamic): Dynamic =>
            input2 === 1
              ? "Copied. One uploaded file wasn't read yet, so another canvas would go without it. Copy again in a moment."
              : uiMessage("canvas.designCanvas.copiedValue1UploadedFilesWeren", { value1: String(String(input2)) }),
          callback17: Dynamic = (input2?: Dynamic): Dynamic =>
            input2 === 1
              ? "Copied. One uploaded file can't travel to another canvas (only images, stylesheets, scripts, fonts and JSON under 4 MB do); add it again there."
              : uiMessage("canvas.designCanvas.copiedValue1UploadedFilesCan", { value1: String(String(input2)) }),
          { left: value656 }: Dynamic = value655;
        if (!value653) {
          value655.tooLarge
            ? deps.value188(
                value655.tooLarge === "bounds"
                  ? ClipboardFileTransferRegistry.tooManyNotesToCopy
                  : ClipboardFileTransferRegistry.tooLargeToCopy,
              )
            : value656.notRead > 0
              ? deps.value188(
                  ClipboardFileTransferRegistry.picturesNotReady(
                    value656.notRead,
                  ),
                )
              : value656.cannot > 0
                ? deps.value188(
                    ClipboardFileTransferRegistry.picturesCantGo(
                      value656.cannot,
                    ),
                  )
                : value656.noRoom > 0
                  ? deps.value188(
                      ClipboardFileTransferRegistry.picturesWontFit(
                        value656.noRoom,
                      ),
                    )
                  : value656.overCap > 0 &&
                    deps.value188(
                      ClipboardFileTransferRegistry.picturesOverCap(
                        value656.overCap,
                      ),
                    );
          return {
            ...value655.fields,
            ...(Object.keys(value655.assets).length > 0
              ? {
                  assets: value655.assets,
                }
              : {}),
          };
        }
        let callback18: Dynamic = (input2?: Dynamic): Dynamic =>
            deps.value188(
              input2 +
                (value655.tooLarge
                  ? ClipboardFileTransferRegistry.notesStayedToo
                  : ""),
            ),
          length: Dynamic = value653.clip.artboards.filter(
            (input2?: Dynamic): Dynamic =>
              deps.value177.current
                .get(input2.stem + ".dc.html")
                ?.hasPendingEdits(),
          ).length;
        length > 0
          ? callback18(
              length === 1
                ? "Copied. One artboard has unsaved edits, so another canvas would get its last saved version. Click outside it, then copy again."
                : uiMessage("canvas.designCanvas.copiedValue1ArtboardsHaveUnsaved", { value1: String(String(length)) }),
            )
          : value653.missingAssets > 0
            ? callback18(
                callback16(value653.missingAssets + value656.notRead),
              )
            : value656.notRead > 0
              ? callback18(
                  ClipboardFileTransferRegistry.picturesNotReady(
                    value656.notRead,
                  ),
                )
              : value653.unsupportedAssets > 0
                ? callback18(
                    callback17(value653.unsupportedAssets + value656.cannot),
                  )
                : value656.cannot > 0
                  ? callback18(
                      ClipboardFileTransferRegistry.picturesCantGo(
                        value656.cannot,
                      ),
                    )
                  : value656.noRoom > 0
                    ? callback18(
                        ClipboardFileTransferRegistry.picturesWontFit(
                          value656.noRoom,
                        ),
                      )
                    : value655.tooLarge &&
                      deps.value188(
                        ClipboardFileTransferRegistry
                          .tooLargeBesideArtboards,
                      );
        return {
          ...value653.clip,
          assets: {
            ...value653.clip.assets,
            ...value655.assets,
          },
          ...value655.fields,
        };
      }

/** 粘贴来自系统剪贴板（可能来自其他画布）的画板、说明与图片时运行：解析数据、确认代码信任、迁移字体与图片等资源，再创建画板和图形并提示结果。 */
export function pasteExternalClipboardPayload(deps: { readonly callback3: Dynamic; readonly callback9: Dynamic; readonly doc: Dynamic; readonly setSelection: Dynamic; readonly showToast: Dynamic; readonly supportsLoadState: Dynamic; readonly value105: Dynamic; readonly value109: Dynamic; readonly value188: Dynamic; readonly value189: Dynamic; readonly value218: Dynamic; readonly value224: Dynamic; readonly value310: Dynamic; readonly value345: Dynamic; readonly value369: Dynamic; readonly value383: Dynamic; readonly value413: Dynamic; readonly value464: Dynamic; readonly value62: Dynamic; readonly value73: Dynamic; readonly value80: Dynamic; readonly value98: Dynamic }, input?: Dynamic, options?: Dynamic): Dynamic {
        if (!deps.value224.current) return;
        if (deps.value369.current) {
          deps.value188(ClipboardFileTransferRegistry.stillPasting);
          return;
        }
        let callback15: Dynamic = (
            input2?: Dynamic,
            options2?: Dynamic,
          ): Dynamic =>
            input2.aborted
              ? uiMessage("canvas.designCanvas.pasteCancelledThisCanvasWas")
              : deps.value224.current
                ? options2 !== undefined &&
                  options2 !== "" &&
                  !(deps.value73.current.pages ?? []).some(
                    (input3?: Dynamic): Dynamic => input3.id === options2,
                  )
                  ? uiMessage("canvas.designCanvas.pasteCancelledThePageYou")
                  : null
                : uiMessage("canvas.designCanvas.pasteCancelledThisCanvasStopped"),
          callback16: Dynamic = (
            input2?: Dynamic,
            options2?: Dynamic,
          ): Dynamic => ({
            gate: validateCanvasPlacedImage,
            upload: (input3?: Dynamic): Dynamic =>
              uploadDesignFile("appifact", null, input3),
            stored: input2,
            discard: (input3?: Dynamic): Dynamic => {
              getKvClient()
                .delete(PlatformFileContentHandler_4(input3))
                .catch((): Dynamic => false);
            },
            maxPixels: ClipboardAssetsHandler(options2),
          }),
          callback17: Dynamic = (
            items?: Dynamic,
            options2?: Dynamic,
            context?: Dynamic,
          ): Dynamic => {
            if (
              (deps.value73.current.annotations ?? []).length +
                items.length +
                options2.carried.length >
              PlatformFileContentLimit_5
            )
              return void deps.showToast(
                ClipboardFileTransferRegistry.atLimit,
                "error",
              );
            let current5: Dynamic = deps.value80.current,
              value657: Dynamic = deps.value105.rest(),
              controller2: Dynamic = new AbortController(),
              callback20: Dynamic = (): Dynamic => {};
            deps.value369.current = {
              ctrl: controller2,
              done: new Promise((input2?: Dynamic): Dynamic => {
                callback20 = input2;
              }),
            };
            (async (): Promise<Dynamic> => {
              let items2: Dynamic = [],
                flag2: Dynamic = false,
                callback21: Dynamic = async (
                  input2?: Dynamic,
                ): Promise<Dynamic> => {
                  for (let value658 of input2 as Dynamic)
                    await getKvClient()
                      .delete(
                        PlatformFileContentHandler_4(value658),
                      )
                      .catch((): Dynamic => false);
                };
              try {
                deps.value188(
                  ClipboardFileTransferRegistry.bringing(
                    options2.carried.length,
                  ),
                );
                let { landed: value658, failed: value659 }: Dynamic =
                    await resolveClipboardPictures(
                      options2.carried,
                      options2.assets,
                      controller2.signal,
                      callback16(
                        (input2?: Dynamic): Dynamic => items2.push(input2),
                        ClipboardAnnotationsLimit,
                      ),
                    ),
                  value660: Dynamic = callback15(
                    controller2.signal,
                    current5,
                  ),
                  { group: value661 }: Dynamic = normalizeAnnotationPasteOrigin(
                    [...items, ...value658].sort(
                      (input2?: Dynamic, options3?: Dynamic): Dynamic =>
                        input2.order - options3.order,
                    ),
                  );
                if (value660 !== null || value661.length === 0) {
                  deps.value188(value660 ?? options2.said([], [], value659));
                  return void (await callback21(items2));
                }
                let value662: Dynamic =
                    current5 === ""
                      ? (deps.value73.current.pages?.[0]?.id ?? "")
                      : current5,
                  value663: Dynamic = designPageContents(
                    deps.value73.current,
                    value662,
                  ),
                  value664: Dynamic = context
                    ? pastedObjectsOrigin(value661, context)
                    : nextArtboardPlacementPoint([
                        ...value663.artboards,
                        ...(value663.annotations ?? []).map(
                          annotationVisibleBounds,
                        ),
                      ]),
                  value665: Dynamic = deps.value73.current.annotations ?? [],
                  value666: Dynamic = value661.map(
                    (input2?: Dynamic): Dynamic => {
                      let value670: Dynamic = annotationVisibleBounds(input2.spec);
                      return {
                        src: {
                          ...input2.spec,
                          ...deps.callback3(current5),
                        },
                        x:
                          value664.x +
                          input2.dx +
                          (input2.spec.x - value670.x),
                        y:
                          value664.y +
                          input2.dy +
                          (input2.spec.y - value670.y),
                      };
                    },
                  ),
                  value667: Dynamic =
                    value665.length + value666.length <=
                    PlatformFileContentLimit_5,
                  value668: Dynamic = value667 ? deps.callback9(value666) : [];
                if (
                  !value667 ||
                  !ClipboardPastePlanningAnnotations(
                    deps.value73.current,
                    value668,
                  )
                ) {
                  deps.showToast(
                    value667
                      ? ClipboardFileTransferRegistry.wontFitPictures
                      : ClipboardFileTransferRegistry.atLimit,
                    "error",
                  );
                  return void (await callback21(items2));
                }
                flag2 = true;
                deps.value98({
                  artboards: deps.value73.current.artboards,
                  annotations: [...value665, ...value668],
                });
                let files: Dynamic = deps.doc.content().files;
                deps.value413(
                  {
                    kind: "add",
                    entries: [],
                    anns: value668,
                    get label() { return uiMessage("canvas.designCanvas.paste"); },
                    files: items2
                      .filter(
                        (input2?: Dynamic): Dynamic =>
                          typeof files[input2] == "string",
                      )
                      .map(
                        (input2?: Dynamic): Dynamic => ({
                          path: input2,
                          src: files[input2],
                        }),
                      ),
                  },
                  new Set(),
                );
                deps.value80.current === value662 &&
                  (deps.value62(),
                  deps.setSelection(
                    selectionFromBoards({
                      files: new Set(),
                      notes: new Set(
                        value668.map(
                          (input2?: Dynamic): Dynamic => input2.id,
                        ),
                      ),
                    }),
                  ),
                  !context &&
                    !deps.value345.current &&
                    !deps.value218.current &&
                    sameViewport(deps.value105.rest(), value657) &&
                    deps.value383.current(
                      pastedObjectsBounds(
                        value668.map(annotationVisibleBounds),
                      ),
                    ));
                let value669: Dynamic = options2.said(
                  value668,
                  value658,
                  value659,
                );
                deps.value80.current === value662 &&
                ClipboardFileTransferPasted(value669, value668)
                  ? deps.value189(value669)
                  : deps.value188(value669);
              } catch (value658: Dynamic) {
                console.error("[design/paste]", value658);
                flag2 || (await callback21(items2));
                deps.showToast(uiMessage("canvas.designCanvas.couldnTPaste2"), "error");
              } finally {
                deps.value369.current = null;
                callback20();
              }
            })();
          };
        if (!ClipboardStateIsArray(input)) {
          let value657: Dynamic = parseAnnotationPaste(
            input,
            (items?: Dynamic): Dynamic =>
              ClipboardPastePlanningAnnotations(
                deps.value73.current,
                items.map(
                  (input2?: Dynamic): Dynamic => ({
                    ...input2,
                    ...deps.callback3(),
                  }),
                ),
                128 * items.length,
              ),
          );
          if (value657.land === null)
            value657.error
              ? deps.showToast(value657.say, "error")
              : deps.value188(value657.say);
          else if (value657.pictures !== undefined)
            callback17(value657.land, value657.pictures, deps.value109());
          else {
            let current5: Dynamic = deps.value73.current;
            deps.value464.current(
              [],
              normalizeAnnotationPasteOrigin(value657.land)
                .group,
              deps.value109(),
            );
            if (deps.value73.current === current5) return;
            ClipboardFileTransferPasted(
              value657.say,
              value657.land.map((input2?: Dynamic): Dynamic => input2.spec),
            )
              ? deps.value189(value657.say)
              : deps.value188(value657.say);
          }
          return;
        }
        let value653: Dynamic = ClipboardPastePlanningIsArray(
            input,
          )
            ? ClipboardFileTransferRegistry.notEither
            : "",
          value654: Dynamic = parseArtboardClipboard(input);
        if (!value654) {
          deps.value188(
            uiMessage("canvas.designCanvas.nothingToPasteTheCopied") +
              value653,
          );
          return;
        }
        let callback18: Dynamic = (items?: Dynamic): Dynamic =>
            items.length > 60 ? items.slice(0, 57) + "\u2026" : items,
          current4: Dynamic = deps.value80.current,
          value655: Dynamic = deps.value105.rest(),
          value656: Dynamic = pasteCascadeStep(
            deps.value105.get().scale,
          ),
          controller: Dynamic = new AbortController(),
          callback19: Dynamic = (): Dynamic => {};
        deps.value369.current = {
          ctrl: controller,
          done: new Promise((input2?: Dynamic): Dynamic => {
            callback19 = input2;
          }),
        };
        (async (): Promise<Dynamic> => {
          let items: Dynamic = [];
          try {
            let value657: Dynamic = (await awaitFeatureFlag(
              crossCanvasPasteConfirmFeatureFlag,
              true,
            ))
              ? await askTrustForCodePaste(
                  value654.artboards.length,
                  controller.signal,
                )
              : "with-code";
            if (value657 === "cancel") return;
            let value658: Dynamic = callback15(controller.signal);
            if (value658 !== null) return deps.value188(value658);
            let value659: Dynamic = value657 === "with-code",
              value660: Dynamic = parseAnnotationClipboard(
                input,
              ),
              value661: Dynamic = buildAnnotationPaste(
                value660?.entries ?? [],
                value659,
                value660?.pictures ?? [],
              ),
              value662: Dynamic = value659
                ? value654
                : blankArtboardBody(value654),
              value663: Dynamic =
                (deps.value73.current.annotations ?? []).length +
                  value661.land.length +
                  value661.pictures.length <=
                PlatformFileContentLimit_5,
              value664: Dynamic = value663
                ? parseClipboardAssets(
                    input,
                    value661.pictures,
                    clipboardPayloadUsage(value654),
                  )
                : new Map(),
              items2: Dynamic = [],
              value665: Dynamic = value659
                ? 0
                : Object.keys(value654.files).filter(
                    (input2?: Dynamic): Dynamic => /\.svg$/i.test(input2),
                  ).length +
                  Object.values(value654.assets).filter(
                    (input2?: Dynamic): Dynamic =>
                      /^data:image\/svg\+xml/i.test(input2),
                  ).length,
              callback20: Dynamic = (): Dynamic =>
                hasPendingFileOverlay()
                  ? new Set(
                      [
                        ...Object.keys(getDesignSystemFiles()),
                        ...getAllFileReferencePaths(),
                      ].map(
                        (input2?: Dynamic): Dynamic =>
                          input2.startsWith(ProjectValue)
                            ? input2.slice(ProjectValue.length)
                            : input2,
                      ),
                    )
                  : "unknown",
              callback21: Dynamic = (
                input2?: Dynamic,
                options2?: Dynamic,
              ): Dynamic =>
                Object.keys(options2).length +
                  input2.boards.length +
                  Object.keys(input2.files).length >
                PlatformFileContentFilesValue,
              value666: Dynamic = getDocumentFileCap(deps.doc),
              value667: Dynamic = preparePastedArtboardFiles(
                value662,
                deps.doc.content().files,
                deps.supportsLoadState,
                callback20(),
                value666,
              );
            if (callback21(value667, deps.doc.content().files)) {
              deps.showToast(
                uiMessage("canvas.designCanvas.couldnTPasteThisCanvas", { value1: String(String(PlatformFileContentFilesValue)) }) +
                  value653,
                "error",
              );
              return;
            }
            let items3: Dynamic = [
                ...Object.entries(value662.assets).map(
                  ([input2, input3]: Dynamic): Dynamic => [
                    input2,
                    input3,
                    "asset",
                  ],
                ),
                ...Object.entries(value667.images).map(
                  ([input2, input3]: Dynamic): Dynamic => [
                    input2,
                    input3,
                    "image",
                  ],
                ),
              ],
              value668: Dynamic = items3.map(
                ([, input2, input3]: Dynamic): Dynamic =>
                  input3 === "asset" &&
                  ClipboardArtboardsTest_2(input2),
              ),
              items4: Dynamic = [
                ...items3.filter(
                  (input2?: Dynamic, options2?: Dynamic): Dynamic =>
                    !value668[options2],
                ),
                ...items3.filter(
                  (input2?: Dynamic, options2?: Dynamic): Dynamic =>
                    value668[options2],
                ),
              ],
              entries: Dynamic = new Map(),
              entries2: Dynamic = new Map(),
              items5: Dynamic = [],
              values: Dynamic = new Set(),
              entries3: Dynamic = new Map(),
              values2: Dynamic = new Set(),
              value669: Dynamic = value662.fontsLeftOut ?? 0,
              callback22: Dynamic = async (
                input2?: Dynamic,
              ): Promise<Dynamic> => {
                let value695: Dynamic = await getAssetsCapability();
                if (value695 === null || typeof value695.upload != "function")
                  return;
                let value696: Dynamic = input2.type.split(";")[0].trim(),
                  value697: Dynamic = await value695.upload(
                    new Blob([input2], {
                      type: value696,
                    }),
                    {
                      type: value696,
                    },
                  ),
                  value698: Dynamic =
                    typeof value697?.url == "string" &&
                    isBlobAssetUrl(value697.url)
                      ? value697.url
                      : typeof value697?.id == "string"
                        ? "_blob/" + value697.id
                        : undefined;
                return value698 !== undefined &&
                  isBlobAssetUrl(value698)
                  ? value698
                  : undefined;
              },
              value670: Dynamic = items4.length + value664.size;
            if (value670 > 0) {
              let length3: Dynamic = value667.boards.length;
              deps.value188(
                (length3 === 1
                  ? uiMessage("canvas.designCanvas.pastingAnArtboard")
                  : uiMessage("canvas.designCanvas.pastingValue1Artboards", { value1: String(String(length3)) })) +
                  `, bringing over ${String(value670)} file${value670 === 1 ? "" : "s"}\u2026`,
              );
            }
            if (items4.length > 0) {
              let index: Dynamic = 0,
                callback27: Dynamic = async (): Promise<Dynamic> => {
                  for (
                    let value695: Dynamic = index++;
                    value695 < items4.length && !controller.signal.aborted;
                    value695 = index++
                  ) {
                    let [value696, value697, value698]: Dynamic =
                      items4[value695];
                    if (
                      value698 === "asset" &&
                      ClipboardArtboardsTest_2(value697)
                    ) {
                      let value701: Dynamic = await dataUrlToFontFile(
                        value697,
                        "pasted-font-" + String(value695 + 1),
                      );
                      if (controller.signal.aborted) break;
                      let value702: Dynamic = value701
                        ? await callback22(value701).catch((): Dynamic => {})
                        : undefined;
                      value702 === undefined
                        ? (value669 += 1)
                        : entries.set(
                            value696,
                            value702.startsWith("blob:")
                              ? value702
                              : "/" + value702.replace(/^\//, ""),
                          );
                      continue;
                    }
                    let value699: Dynamic = dataUrlToBlob(
                      value697,
                      value698 === "asset"
                        ? "pasted-image-" + String(value695 + 1)
                        : (value696.split("/").pop() ?? value696).replace(
                            /\.[^.]+$/,
                            "",
                          ),
                    );
                    if (
                      value698 === "asset" &&
                      ClipboardArtboardsTest(value697)
                    ) {
                      let value701: Dynamic = value699
                        ? await callback22(value699).catch((): Dynamic => {})
                        : undefined;
                      value701 === undefined || !value699
                        ? values2.add(value696)
                        : (entries.set(
                            value696,
                            value701.startsWith("blob:")
                              ? value701
                              : "/" + value701.replace(/^\//, ""),
                          ),
                          entries3.set(value696, {
                            bytes: value699.size,
                            type: value699.type.split(";")[0].trim(),
                          }));
                      continue;
                    }
                    if (
                      !value699 ||
                      !(await isPlayableImage(value699))
                    ) {
                      values.add(value696);
                      continue;
                    }
                    if (controller.signal.aborted) break;
                    let value700: Dynamic = value697;
                    try {
                      value700 = (
                        await uploadDesignFile(
                          "appifact",
                          null,
                          value699,
                        )
                      ).src;
                      value700.startsWith("./") &&
                        (items5.push(value700.slice(2)),
                        items.push(value700.slice(2)));
                    } catch {}
                    (value698 === "asset" ? entries : entries2).set(
                      value696,
                      value700,
                    );
                  }
                };
              await Promise.all(
                Array.from(
                  {
                    length: Math.min(4, items4.length),
                  },
                  callback27,
                ),
              );
            }
            let value671: Dynamic = value663
                ? await resolveClipboardPictures(
                    value661.pictures,
                    value664,
                    controller.signal,
                    callback16((input2?: Dynamic): Dynamic => {
                      items2.push(input2);
                      items5.push(input2);
                      items.push(input2);
                    }, ClipboardArtboardsLimit),
                  )
                : {
                    landed: [],
                    failed: 0,
                  },
              callback23: Dynamic = (
                input2?: Dynamic,
                options2?: Dynamic,
              ): Dynamic =>
                (/\.([^./]+)$/.exec(input2)?.[1] ?? "").toLowerCase() +
                ":" +
                options2,
              values3: Dynamic = new Set();
            for (let [value695, value696] of Object.entries(
              value662.files,
            ) as Dynamic) {
              if (controller.signal.aborted) break;
              if (
                !PlatformFileContentWebpAvifPattern.test(value695) ||
                entries2.has(value695) ||
                values.has(value695)
              )
                continue;
              let value697: Dynamic = dataUrlToBlob(
                fileDataUrl(value695, value696),
                "carried",
              );
              (!value697 ||
                !(await isPlayableImage(value697))) &&
                values3.add(callback23(value695, value696));
            }
            let callback24: Dynamic = async (): Promise<Dynamic> => {
                for (let value695 of items.splice(0) as Dynamic)
                  await getKvClient()
                    .delete(
                      PlatformFileContentHandler_4(value695),
                    )
                    .catch((): Dynamic => false);
              },
              value672: Dynamic = callback15(controller.signal, current4);
            if (value672 !== null) {
              deps.value188(value672);
              return void (await callback24());
            }
            value667 = preparePastedArtboardFiles(
              value662,
              deps.doc.content().files,
              deps.supportsLoadState,
              callback20(),
              value666,
            );
            if (callback21(value667, deps.doc.content().files)) {
              deps.showToast(
                uiMessage("canvas.designCanvas.couldnTPasteThisCanvas", { value1: String(String(PlatformFileContentFilesValue)) }) +
                  value653,
                "error",
              );
              return void (await callback24());
            }
            for (let [value695, value696] of Object.entries(
              value667.images,
            ) as Dynamic)
              entries2.has(value695) ||
                values.has(value695) ||
                (values3.has(callback23(value695, value662.files[value695]))
                  ? values.add(value695)
                  : entries2.set(value695, value696));
            let values4: Dynamic = new Set(
              Object.keys(deps.doc.content().files).map(
                (input2?: Dynamic): Dynamic => input2.toLowerCase(),
              ),
            );
            for (let value695 of values as Dynamic)
              value695 in value667.images &&
                values4.has(value695.toLowerCase()) &&
                entries2.set(
                  value695,
                  value695.replace(/(\.[^./]*)?$/, "-missing$1"),
                );
            remapPastedAssetFiles(
              value667,
              entries,
              entries2,
              value666,
            );
            let value673: Dynamic = new TextEncoder(),
              value674: Dynamic = value667.boards.filter(
                (input2?: Dynamic): Dynamic =>
                  value673.encode(input2.entry.src).length <=
                  PlatformFileContentResolvedValue_11,
              ),
              value675: Dynamic = value667.boards.length - value674.length;
            if (value674.length === 0) {
              deps.showToast(
                uiMessage("canvas.designCanvas.couldnTPasteEveryCopied") +
                  value653,
                "error",
              );
              return void (await callback24());
            }
            for (let [value695, value696] of Object.entries(
              value667.files,
            ) as Dynamic) {
              let value697: Dynamic =
                value673.encode(value696).length > value666
                  ? "too large once its images were inlined"
                  : PlatformFileContentWebpAvifPattern.test(
                        value695,
                      ) && values3.has(callback23(value695, value696))
                    ? "not an image the editor can decode"
                    : null;
              value697 !== null &&
                (delete value667.files[value695],
                value667.dropped.push({
                  path: value695,
                  why: value697,
                }));
            }
            deps.value310.current = true;
            for (let [value695, value696] of Object.entries(
              value667.files,
            ) as Dynamic) {
              await getKvClient().set(
                PlatformFileContentHandler_4(value695),
                value696,
              );
              items.push(value695);
            }
            let value676: Dynamic =
                current4 === ""
                  ? (deps.value73.current.pages?.[0]?.id ?? "")
                  : current4,
              artboards: Dynamic = designPageContents(
                deps.value73.current,
                value676,
              ).artboards,
              value677: Dynamic = value674.map(
                (input2?: Dynamic): Dynamic => input2.entry,
              ),
              value678: Dynamic = [...value661.land, ...value671.landed].sort(
                (input2?: Dynamic, options2?: Dynamic): Dynamic =>
                  input2.order - options2.order,
              ),
              { group: value679, shift: value680 }: Dynamic = normalizeAnnotationPasteOrigin([
                ...value677,
                ...value678,
              ]),
              value681: Dynamic = options
                ? pastedObjectsOrigin(value679, options)
                : nextArtboardPlacementPoint(
                    value678.length > 0
                      ? [
                          ...artboards,
                          ...(
                            designPageContents(
                              deps.value73.current,
                              value676,
                            ).annotations ?? []
                          ).map(annotationVisibleBounds),
                        ]
                      : artboards,
                  ),
              state: Dynamic = {
                x: value681.x + value680.x,
                y: value681.y + value680.y,
              },
              value682: Dynamic = options
                ? avoidPastedObjectCollisions(
                    state,
                    value677,
                    artboards,
                    value656,
                  )
                : state,
              items6: Dynamic = [];
            for (let {
              path: value695,
              entry: value696,
            } of value674 as Dynamic) {
              await getKvClient().set(
                PlatformFileContentHandler_4(value695),
                value696.src,
              );
              items.push(value695);
              let value697: Dynamic =
                  value696.title ??
                  value696.stem.split("/").pop() ??
                  value696.stem,
                value698: Dynamic = [...artboards, ...items6].some(
                  (input2?: Dynamic): Dynamic =>
                    (input2.title ??
                      input2.file.replace(/\.dc\.html$/, "")) === value697,
                );
              items6.push({
                file: value695,
                x: Math.round(value682.x + value696.dx),
                y: Math.round(value682.y + value696.dy),
                w: value696.w,
                h: value696.h,
                title: value698
                  ? duplicateArtboardTitle(value697, [
                      ...artboards,
                      ...items6,
                    ])
                  : value697,
                ...artboardAppearanceProperties(value696),
                ...deps.callback3(current4),
              });
            }
            let values5: Dynamic = new Set(
                items6.map((input2?: Dynamic): Dynamic => input2.file),
              ),
              items7: Dynamic = [
                ...deps.value73.current.artboards.filter(
                  (input2?: Dynamic): Dynamic => !values5.has(input2.file),
                ),
                ...items6,
              ],
              value683: Dynamic = deps.value73.current.annotations ?? [],
              value684: Dynamic = value678.map(
                (input2?: Dynamic): Dynamic => {
                  let value695: Dynamic = annotationVisibleBounds(input2.spec);
                  return {
                    src: {
                      ...input2.spec,
                      ...deps.callback3(current4),
                    },
                    x: value682.x + input2.dx + (input2.spec.x - value695.x),
                    y: value682.y + input2.dy + (input2.spec.y - value695.y),
                  };
                },
              ),
              value685: Dynamic =
                value663 &&
                value684.length > 0 &&
                value683.length + value684.length <=
                  PlatformFileContentLimit_5
                  ? deps.callback9(value684)
                  : [],
              value686: Dynamic =
                value685.length > 0 &&
                ClipboardPastePlanningAnnotations(
                  {
                    ...deps.value73.current,
                    artboards: items7,
                  },
                  value685,
                )
                  ? value685
                  : [];
            items.length = 0;
            deps.value98({
              artboards: items7,
              ...(value686.length > 0
                ? {
                    annotations: [...value683, ...value686],
                  }
                : {}),
            });
            let files: Dynamic = deps.doc.content().files;
            deps.value413(
              {
                kind: "add",
                entries: items6.map(
                  (input2?: Dynamic, options2?: Dynamic): Dynamic => ({
                    file: input2.file,
                    src: value674[options2].entry.src,
                    spec: input2,
                  }),
                ),
                files: [
                  ...Object.entries(value667.files).map(
                    ([input2, input3]: Dynamic): Dynamic => ({
                      path: input2,
                      src: input3,
                    }),
                  ),
                  ...items5
                    .filter(
                      (input2?: Dynamic): Dynamic =>
                        typeof files[input2] == "string" &&
                        (value686.length > 0 || !items2.includes(input2)),
                    )
                    .map(
                      (input2?: Dynamic): Dynamic => ({
                        path: input2,
                        src: files[input2],
                      }),
                    ),
                ],
                ...(value686.length > 0
                  ? {
                      anns: value686,
                      get label() { return uiMessage("canvas.designCanvas.paste"); },
                    }
                  : {}),
              },
              values5,
            );
            if (value686.length === 0)
              for (let value695 of items2 as Dynamic)
                await getKvClient()
                  .delete(PlatformFileContentHandler_4(value695))
                  .catch((): Dynamic => false);
            deps.value80.current === value676 &&
              deps.setSelection(
                value686.length > 0
                  ? selectionFromBoards({
                      files: values5,
                      notes: new Set(
                        value686.map(
                          (input2?: Dynamic): Dynamic => input2.id,
                        ),
                      ),
                    })
                  : selectionFromArtboards(values5),
              );
            items6.length > 0 &&
              frameAnalyticsReporter(
                designAnalyticsEvents.artboardInserted,
              );
            !options &&
              deps.value80.current === value676 &&
              !deps.value345.current &&
              !deps.value218.current &&
              sameViewport(deps.value105.rest(), value655) &&
              deps.value383.current(pastedObjectsBounds(items6));
            let value687: Dynamic = Object.entries(
                value662.held ?? {},
              ).filter(
                (
                  [input2]: Dynamic,
                  options2?: Dynamic,
                  context?: Dynamic,
                ): Dynamic =>
                  context.findIndex(
                    ([input3]: Dynamic): Dynamic =>
                      input3.toLowerCase() === input2.toLowerCase(),
                  ) === options2,
              ),
              values6: Dynamic = new Set(
                [
                  ...Object.keys(deps.doc.content().files),
                  ...getAllFileReferencePaths(),
                ].map((input2?: Dynamic): Dynamic => input2.toLowerCase()),
              ),
              callback25: Dynamic = (input2?: Dynamic): Dynamic =>
                !hasPendingFileOverlay() ||
                values6.has(input2.toLowerCase());
            deps.value224.current &&
              (await Promise.all(
                value687.map(
                  async ([input2, input3]: Dynamic): Promise<Dynamic> => {
                    let entry: Dynamic = entries.get(input3),
                      entry2: Dynamic = entries3.get(input3);
                    if (entry === undefined || entry2 === undefined) return;
                    let value695: Dynamic = saveExternalFileReference(
                      input2,
                      entry,
                      entry2.bytes,
                      entry2.type,
                      callback25,
                    );
                    await Promise.race([
                      value695,
                      new Promise(
                        (input4?: Dynamic, options2?: Dynamic): Dynamic =>
                          setTimeout(
                            (): Dynamic =>
                              options2(new Error("no answer from the store")),
                            8e3,
                          ),
                      ),
                    ]).catch((input4?: Dynamic): Dynamic => {
                      console.warn(
                        "design (paste): the pointer document for " +
                          input2 +
                          " was not written \u2014 " +
                          errorMessage(input4),
                      );
                      value667.dropped.push({
                        path: input2,
                        why: "its upload came over, but could not be recorded here",
                      });
                    });
                  },
                ),
              ));
            let entries4: Dynamic = new Map();
            for (let value695 of values2 as Dynamic) {
              let value696: Dynamic = value687
                .filter(([, input2]: Dynamic): Dynamic => input2 === value695)
                .map(([input2]: Dynamic): Dynamic => input2);
              for (let value699 of value696 as Dynamic)
                value667.dropped.push({
                  path: value699,
                  why: "this canvas would not take the upload",
                });
              let value697: Dynamic = value662.assets[value695] ?? "",
                value698: Dynamic = /^data:text\/css/i.test(value697)
                  ? "stylesheet"
                  : /^data:text\/javascript/i.test(value697)
                    ? "script"
                    : "data file";
              value696.length === 0 &&
                entries4.set(value698, (entries4.get(value698) ?? 0) + 1);
            }
            for (let [value695, value696] of entries4 as Dynamic)
              value667.dropped.push({
                path:
                  value696 === 1
                    ? "a " + value695
                    : String(value696) + " " + value695 + "s",
                why: "this canvas would not take the upload",
              });
            let items8: Dynamic = [
                ...Object.keys(
                  mergeDesignSystemFileOverlay(
                    deps.doc.content().files,
                  ),
                ),
                "support.js",
              ],
              value688: Dynamic = [
                ...new Set(
                  value674.flatMap(
                    (input2?: Dynamic): Dynamic =>
                      getLinkedProjectFiles(
                        input2.entry.src,
                        items8,
                      ),
                  ),
                ),
              ].map(callback18),
              length: Dynamic = items6.length,
              callback26: Dynamic = (input2?: Dynamic): Dynamic =>
                input2.path.split("/").pop() ?? input2.path,
              value689: Dynamic =
                value667.dropped.length === 0
                  ? ""
                  : value667.dropped.every(
                        (input2?: Dynamic): Dynamic =>
                          input2.why === value667.dropped[0].why,
                      )
                    ? `; ${callback18(value667.dropped.map(callback26).join(", "))} left out (${value667.dropped[0].why})`
                    : `; left out: ${value667.dropped
                          .slice(0, 3)
                          .map(
                            (input2?: Dynamic): Dynamic =>
                              `${callback18(callback26(input2))} (${input2.why})`,
                          )
                          .join(
                            ", ",
                          )}${value667.dropped.length > 3 ? "\u2026" : ""}`,
              value690: Dynamic =
                (length === 1
                  ? uiMessage("canvas.designCanvas.pastedAnArtboard")
                  : uiMessage("canvas.designCanvas.pastedValue1Artboards", { value1: String(String(length)) })) +
                (value686.length > 0
                  ? ClipboardFileTransferRegistry.withObjects(
                      value686,
                    )
                  : "") +
                " from another canvas" +
                (value659
                  ? ""
                  : ClipboardTrustDialogTitleMessageKeepCodeConfig.dropped(
                      length,
                    )),
              value691: Dynamic = value660?.leftOut ?? 0,
              value692: Dynamic =
                value671.failed + (value660?.unreadPictures ?? 0),
              length2: Dynamic = value671.landed.filter(
                (input2?: Dynamic): Dynamic =>
                  value661.plainPictures.has(input2.spec.id),
              ).length,
              value693: Dynamic =
                (value660?.pictures.length ?? 0) +
                (value660?.unreadPictures ?? 0),
              value694: Dynamic =
                (value675 > 0
                  ? `; ${String(value675)} left out (over 2 MiB with images inlined)`
                  : "") +
                value689 +
                (value665 > 0
                  ? `; ${value665 === 1 ? "1 SVG image" : `${String(value665)} SVG images`} left out (Paste with code keeps ${value665 === 1 ? "it" : "them"})`
                  : "") +
                (value669 > 0
                  ? `; ${value669 === 1 ? "1 font" : `${String(value669)} fonts`} did not come across, so some text may show in a different font`
                  : "") +
                (!value663 || value684.length > value686.length
                  ? ClipboardFileTransferRegistry.notLanded
                  : value653 !== "" &&
                      (value660?.entries.length ?? 0) + value693 === 0
                    ? ClipboardFileTransferRegistry.notRead
                    : (value660?.unread ?? 0) > 0
                      ? ClipboardFileTransferRegistry.someUnread(
                          value660?.unread ?? 0,
                        )
                      : value653 === "" &&
                          ClipboardPastePlanningHandler(input)
                        ? ClipboardFileTransferRegistry.stayedBehind
                        : "") +
                (value661.notesOut > 0
                  ? ClipboardFileTransferRegistry.notesTooMuch
                  : "") +
                (value686.length > 0 && value661.plain > 0
                  ? ClipboardFileTransferRegistry.plainShapes(
                      value661.plain,
                    )
                  : "") +
                (value686.length > 0 && length2 > 0
                  ? ClipboardFileTransferRegistry.plainPictures(
                      length2,
                      true,
                    )
                  : "") +
                (value692 > 0
                  ? ClipboardFileTransferRegistry.notBrought(value692)
                  : "") +
                ClipboardFileTransferRegistry.leftOutCaveat(
                  value691,
                  value660?.videos ?? 0,
                ) +
                (value688.length > 0
                  ? `. It loads ${value688.slice(0, 3).join(", ")}${value688.length > 3 ? "\u2026" : ""}, which this canvas doesn't have. Publish that here for it to render as designed.`
                  : "");
            value694 ? deps.value188(value690 + value694) : deps.value189(value690);
          } catch (value657: Dynamic) {
            for (let value658 of items as Dynamic)
              await getKvClient()
                .delete(PlatformFileContentHandler_4(value658))
                .catch((): Dynamic => false);
            deps.showToast(
              fileCapFailureMessage(value657) ??
                uiMessage("canvas.designCanvas.couldnTPasteTheArtboards") +
                  errorMessage(value657),
              "error",
            );
          } finally {
            deps.value369.current = null;
            callback19();
          }
        })();
      }

/** 粘贴文本或 HTML 时运行：清理内容后插入目标画板的指定位置；没有目标画板时新建画板承载。 */
export function pasteHtmlIntoArtboard(deps: { readonly abandonSelectionGesture: Dynamic; readonly setSelection: Dynamic; readonly value177: Dynamic; readonly value188: Dynamic; readonly value189: Dynamic; readonly value19: Dynamic; readonly value224: Dynamic; readonly value313: Dynamic; readonly value62: Dynamic; readonly value87: Dynamic }, input?: Dynamic, options?: Dynamic): Dynamic {
        if (!deps.value224.current) return;
        let value653: Dynamic = options.trim(),
          value654: Dynamic =
            value653 || (getElementClipboard() ?? "").trim();
        if (!value654) {
          deps.value188(
            uiMessage("canvas.designCanvas.nothingToPasteHereCopy"),
          );
          return;
        }
        let callback15: Dynamic = (input2?: Dynamic): Dynamic =>
          value653.startsWith("<")
            ? sanitizePastedHtml(input2)
            : input2;
        if (input.file == null) {
          let value657: Dynamic = wrapInlinePastedHtml(
            callback15(
              value654.startsWith("<")
                ? normalizeAuthoredHtml(value654)
                : textToParagraphHtml(
                    value654,
                    "margin: 0; position: absolute; left: 32px; top: 32px",
                  ),
            ),
          );
          if (!/<[a-z]/i.test(value657)) {
            deps.value188(
              uiMessage("canvas.designCanvas.nothingToPasteHereThe"),
            );
            return;
          }
          deps.value313(
            {
              x: Math.round(
                input.x - PlatformFileContentConstant_5 / 2,
              ),
              y: Math.round(
                input.y - PlatformFileContentConstant_6 / 2,
              ),
              w: PlatformFileContentConstant_5,
              h: PlatformFileContentConstant_6,
            },
            value657,
            {
              doneSay: "New artboard from the paste",
            },
          );
          return;
        }
        let file: Dynamic = input.file,
          value655: Dynamic = file.replace(/\.dc\.html$/, ""),
          entry: Dynamic = deps.value177.current.get(file),
          value656: Dynamic = deps.value87.current.artboards.find(
            (input2?: Dynamic): Dynamic => input2.file === file,
          );
        if (!entry || !value656) {
          deps.value188(
            uiMessage("canvas.designCanvas.couldnTPasteIntoValue1", { value1: String(value655) }),
          );
          return;
        }
        let [items, items2]: Dynamic = [
          input.x - value656.x,
          input.y - value656.y,
        ];
        (value654.startsWith("<")
          ? entry.insertHtml(callback15(value654), "stage", {
              ox: items,
              oy: items2,
            })
          : entry.insertLayerAt(
              {
                x: items,
                y: items2,
              },
              (input2?: Dynamic, options2?: Dynamic): Dynamic =>
                textToParagraphHtml(
                  value654,
                  `margin: 0; position: absolute; left: ${input2}px; top: ${options2}px`,
                ),
              (): Dynamic => deps.value224.current,
              (input2?: Dynamic): Dynamic => {
                let entry2: Dynamic = deps.value177.current.get(file);
                return entry2 === entry
                  ? null
                  : entry2
                    ? entry2.insertHtml(input2, "stage")
                    : Promise.resolve(null);
              },
            )
        ).then((items3?: Dynamic): Dynamic => {
          if (items3 != null) {
            if (items3.length === 0) {
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
                  tids: items3,
                  rect: null,
                  count: items3.length,
                },
                false,
              ),
            );
            deps.value189(uiMessage("canvas.designCanvas.pastedInto") + value655);
          }
        });
      }

/** 注册 keydown、copy、paste 监听：决定复制或粘贴走画板、画布说明还是元素剪贴板，并处理粘贴文件与图片拒绝。 */
export function subscribeClipboardEvents(deps: { readonly doc: Dynamic; readonly focusedFileRef: Dynamic; readonly selectionRef: Dynamic; readonly value105: Dynamic; readonly value109: Dynamic; readonly value111: Dynamic; readonly value112: Dynamic; readonly value113: Dynamic; readonly value120: Dynamic; readonly value159: Dynamic; readonly value160: Dynamic; readonly value224: Dynamic; readonly value448: Dynamic; readonly value463: Dynamic; readonly value464: Dynamic; readonly value466: Dynamic; readonly value468: Dynamic; readonly value470: Dynamic; readonly value471: Dynamic; readonly value472: Dynamic; readonly value473: Dynamic; readonly value474: Dynamic; readonly value475: Dynamic; readonly value48: Dynamic; readonly value52: Dynamic }): Dynamic {
    let callback15: Dynamic = (event?: Dynamic): Dynamic => {
        if (!(event.metaKey || event.ctrlKey) || event.altKey) return;
        let value654: Dynamic = event.key.toLowerCase();
        if (
          (value654 !== "c" && value654 !== "v") ||
          (!deps.value224.current && value654 !== "c") ||
          isEditingInputTarget(event.target)
        )
          return;
        if (event.shiftKey) {
          value654 === "v" && (deps.value475.current = event.timeStamp);
          return;
        }
        value654 === "v" && (deps.value475.current = -1 / 0);
        if (value654 === "c") {
          let current4: Dynamic = deps.selectionRef.current;
          if (!canvasElementSelectionCount(current4)) {
            let value661: Dynamic =
              deps.focusedFileRef.current != null &&
              current4.elements.has(deps.focusedFileRef.current);
            if (!deps.value159.current && value661) return;
            if (deps.value48.current > 0) {
              let value662: Dynamic = startClipboardMark({
                markable: false,
              });
              deps.value52.current((): Dynamic => {
                deps.value160.current(value662);
              }, value662.drop);
              event.stopPropagation();
            } else deps.value160.current() && event.stopPropagation();
            return;
          }
          event.stopPropagation();
          if (event.repeat) return;
          let files: Dynamic = deps.doc.content().files;
          if (
            !(current4.artboards.size === 0
              ? current4.notes.size > 0
              : [...current4.artboards].some((input?: Dynamic): Dynamic => {
                  let value661: Dynamic = files[input];
                  return (
                    typeof value661 == "string" &&
                    !isLoadingArtboardHtml(value661)
                  );
                }))
          )
            return;
          let state: Dynamic = {
            files: new Set(current4.artboards),
            notes: new Set(current4.notes),
            mark: undefined,
          };
          deps.value472.current = state;
          deps.value463.current(
            state.files,
            state.notes,
            (): Dynamic => state.mark,
          );
          callback17();
          setTimeout((): Dynamic => {
            deps.value472.current === state && (deps.value472.current = null);
          }, 100);
          return;
        }
        if (hasBlockingEditorOverlay()) return;
        let value655: Dynamic = getArtboardClipboard(),
          value656: Dynamic = getAnnotationClipboard(),
          value657: Dynamic = deps.value109(),
          value658: Dynamic = value657?.overAnnotation ? null : value657,
          value659: Dynamic = value655
            ? deps.value112(value655, value656, value657, value658)
            : null;
        if (!value655 && !value658) return;
        event.stopPropagation();
        clearTimeout(deps.value474.current);
        let value660: Dynamic = isClipboardSettling();
        deps.value474.current = setTimeout((): Dynamic => {
          let value661: Dynamic =
            value660 || isClipboardSettling();
          afterClipboardSettled((): Dynamic => {
            if (!deps.value224.current) return;
            let value662: Dynamic = value661
                ? getArtboardClipboard()
                : value655,
              value663: Dynamic = value661
                ? getAnnotationClipboard()
                : value656,
              value664: Dynamic = value661 ? deps.value109() : value657,
              value665: Dynamic = value664?.overAnnotation ? null : value664;
            value662
              ? deps.value464.current(
                  value662,
                  value663,
                  value661
                    ? deps.value112(value662, value663, value664, value665)
                    : value659,
                )
              : value665 &&
                readCanvasClipboardText().then(
                  (input?: Dynamic): Dynamic =>
                    deps.value470.current(
                      value665,
                      getActiveClipboardSource({
                        text: input,
                        stamp: null,
                        hasImage: false,
                      }) === "text"
                        ? input
                        : "",
                    ),
                );
          });
        }, 100);
      },
      value653: Dynamic = null,
      callback16: Dynamic = (): Dynamic => {
        if (!value653) return;
        let value654: Dynamic = value653.__prev ?? null;
        value653.remove();
        value653 = null;
        value654 instanceof HTMLElement &&
          value654 !== (document as Dynamic).body &&
          value654.isConnected &&
          value654.focus({
            preventScroll: true,
          });
      },
      callback17: Dynamic = (): Dynamic => {
        callback16();
        let value654: Dynamic = (document as Dynamic).createElement(
          "textarea",
        );
        value654.__prev = (document as Dynamic).activeElement;
        value654.setAttribute("aria-hidden", "true");
        value654.value = " ";
        value654.style.cssText =
          "position:fixed;left:0;top:0;width:1px;height:1px;opacity:0;pointer-events:none;border:0;padding:0";
        (document as Dynamic).body.appendChild(value654);
        value654.focus({
          preventScroll: true,
        });
        value654.select();
        value653 = value654;
        setTimeout(callback16, 0);
      },
      callback18: Dynamic = (event?: Dynamic): Dynamic => {
        let current4: Dynamic = deps.value472.current;
        if (!event.isTrusted || current4 == null) return;
        deps.value472.current = null;
        let { stamp: value654, rendition: value655 }: Dynamic = deps.value473(
          current4.files,
          current4.notes,
        );
        event.preventDefault();
        event.stopImmediatePropagation();
        writeClipboardObject(event, DesignArtboardsKey, {
          data: {
            stamp: value654,
            ...deps.value466.current(current4.files, current4.notes),
          },
          text: value655,
        }) &&
          ((current4.mark = {
            stamp: value654,
            rendition: value655,
          }),
          mirrorArtboardClipboardStamp(value654, value655));
      },
      callback19: Dynamic = (event?: Dynamic): Dynamic => {
        clearTimeout(deps.value474.current);
        if (!deps.value224.current || event.timeStamp - deps.value475.current < 1e3)
          return;
        let items: Dynamic = [...(event.clipboardData?.files ?? [])],
          value654: Dynamic = items.filter(
            (input?: Dynamic): Dynamic =>
              isImageFile(input) ||
              isVideoFile(input),
          ),
          value655: Dynamic =
            event.clipboardData?.getData("text/plain") ?? "",
          value656: Dynamic = readBoundedClipboardObject(event),
          value657: Dynamic = readArtboardClipboard(value656),
          state: Dynamic = {
            text: value655,
            stamp: clipboardObjectStamp(value656),
            hasImage:
              value654.length > 0 &&
              clipboardContainsFileNames(items, value655),
            artboards: value657,
          },
          value658: Dynamic = imagePasteRefusal(
            event.target,
            getActiveClipboardSource(state) === "image",
            value655,
            value654.length > 0 && value654.every(isVideoFile)
              ? "video"
              : "image",
          );
        value658.to === "nobody" &&
          (event.preventDefault(),
          event.stopImmediatePropagation(),
          deps.value448.current(value658.say));
        if (value658.to !== "canvas") return;
        let value659: Dynamic = isClipboardSettling(),
          callback20: Dynamic = (input?: Dynamic): Dynamic => {
            value659
              ? markConsumedClipboardStamp(event)
              : (event.preventDefault(),
                input && event.stopImmediatePropagation());
          };
        afterClipboardSettled(
          (): Dynamic => {
            if (!deps.value224.current) return;
            let value660: Dynamic = getActiveClipboardSource(
                state,
              ),
              value661: Dynamic = getArtboardClipboard(),
              value662: Dynamic = getAnnotationClipboard(),
              value663: Dynamic = deps.value109(),
              value664: Dynamic = value663?.overAnnotation ? null : value663;
            if (value660 === "foreign-artboards") {
              callback20(false);
              deps.value468.current(value657, deps.value111());
              return;
            }
            let value665: Dynamic =
                value660 === "image" &&
                (value663 == null
                  ? deps.focusedFileRef.current == null
                  : value663.file == null)
                  ? deps.value113()
                  : null,
              value666: Dynamic =
                value660 === "image" && value665 == null ? value663 : null,
              value667: Dynamic =
                value660 === "image" &&
                value665 == null &&
                value666 == null &&
                deps.focusedFileRef.current == null;
            if (value661 && value660 === "artboards") {
              callback20(true);
              deps.value464.current(
                value661,
                value662,
                deps.value112(value661, value662, value663, value664),
              );
              return;
            }
            if (
              value665 == null &&
              value666 == null &&
              !value667 &&
              (value660 === "image" || value664 == null)
            )
              return;
            callback20(true);
            let {
                w: value668,
                h: value669,
                top: value670,
              }: Dynamic = deps.value120(),
              entry: Dynamic = deps.value105.get();
            if (value665 != null) {
              let value671: Dynamic = visibleArtboardCenter(
                value665,
                {
                  ...entry,
                  y: entry.y + value670 / entry.scale,
                  width: value668,
                  height: value669 - value670,
                },
              );
              deps.value471.current(
                value654,
                value671.x,
                value671.y,
                "pasted",
                value665.file,
              );
            } else
              value666 != null
                ? deps.value471.current(
                    value654,
                    value666.x,
                    value666.y,
                    "pasted",
                    value666.file ?? undefined,
                  )
                : value667
                  ? deps.value471.current(
                      value654,
                      entry.x + value668 / 2 / entry.scale,
                      entry.y + (value670 + value669) / 2 / entry.scale,
                      "pasted",
                    )
                  : deps.value470.current(
                      value664,
                      value660 === "text" ? value655 : "",
                    );
          },
          (): Dynamic => markConsumedClipboardStamp(event),
        );
      };
    (window as Dynamic).addEventListener("keydown", callback15, true);
    (window as Dynamic).addEventListener("copy", callback18, true);
    (window as Dynamic).addEventListener("paste", callback19, true);
    return (): Dynamic => {
      clearTimeout(deps.value474.current);
      callback16();
      (window as Dynamic).removeEventListener("keydown", callback15, true);
      (window as Dynamic).removeEventListener("copy", callback18, true);
      (window as Dynamic).removeEventListener("paste", callback19, true);
    };
  }

/** 画板菜单选择复制为 PNG 时运行：截取画板图像并写入系统剪贴板，处理不可见、无法绘制与缺图提示。 */
export function copyArtboardAsPng(deps: { readonly hideToast: Dynamic; readonly showToast: Dynamic; readonly value177: Dynamic; readonly value479: Dynamic; readonly value480: Dynamic; readonly value483: Dynamic; readonly value494: Dynamic; readonly value502: Dynamic; readonly value503: Dynamic; readonly value87: Dynamic; readonly value93: Dynamic }, input?: Dynamic): Dynamic {
        if (deps.value480) return;
        if (deps.value494())
          return void deps.showToast(AccessibilityAnnouncementsLabel_5);
        let value653: Dynamic = deps.value87.current.artboards.find(
            (input2?: Dynamic): Dynamic => input2.file === input,
          ),
          value654: Dynamic = clipboardGeneration(),
          value655: Dynamic = createCurrentWorkingGeneration(),
          value656: Dynamic = null,
          flag2: Dynamic = false,
          state: Dynamic = {
            blank: 0,
          },
          value657: Dynamic = (async (): Promise<Dynamic> => {
            deps.value479(true);
            try {
              if (!(await allowsClipboardImages())) {
                flag2 = true;
                return null;
              }
              let value658: Dynamic = await deps.value483(input),
                value659: Dynamic = value658
                  ? createPreviewHandle(value658)
                  : null;
              if (
                !value658 ||
                !value659 ||
                value658.getBoundingClientRect().width === 0
              ) {
                value656 = deps.value177.current.get(input)?.isBlocked()
                  ? AccessibilityAnnouncementsLabel_8
                  : AccessibilityAnnouncementsLabel_9;
                return null;
              }
              let value660: Dynamic = await captureArtboardImage(
                value659,
                "png",
                2,
                value653
                  ? getArtboardCaptureOptions(value653, deps.value93)
                  : {
                      selectionRoot: "body",
                    },
              ).catch(
                (input2?: Dynamic): Dynamic => (
                  (value656 = errorMessage(input2)),
                  null
                ),
              );
              return value660
                ? value660.ok
                  ? ((state = {
                      blank: value660.embedWarningCount,
                      ...(value660.clipped
                        ? {
                            clipped: true,
                          }
                        : {}),
                    }),
                    clipboardGeneration() === value654 &&
                    value655()
                      ? pngDataUrlToBlob(value660.uri)
                      : null)
                  : ((value656 =
                      value660.softError === "zero-size"
                        ? AccessibilityAnnouncementsLabel_7
                        : ItsPageHasNothingToDrawMessage),
                    null)
                : null;
            } catch (value658: Dynamic) {
              console.error("[copy-png] artboard", value658);
              value656 = ItsPictureCouldnTBeMadeTryMessage;
              return null;
            } finally {
              deps.value479(false);
            }
          })();
        writeClipboardPng(value657).then(
          (input2?: Dynamic): Dynamic => {
            if (
              !(
                clipboardGeneration() !== value654 || !value655()
              )
            )
              if (input2 === "copied") {
                clearClipboardBuffers();
                announce(
                  AccessibilityAnnouncementsLabel_2,
                );
                if (state.clipped) {
                  let value658: Dynamic = exportFileName(
                      input,
                      value653?.title,
                    ),
                    value659: Dynamic = deps.value502(input),
                    value660: Dynamic = deps.showToast(
                      clippedArtboardsMessage(
                        [value658],
                        value659,
                      ),
                      "info",
                      value659
                        ? {
                            action: deps.value503(
                              [input],
                              false,
                              (): Dynamic => deps.hideToast(value660),
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
                flag2
                  ? deps.showToast(DownloadsArenTAvailableToYouForMessage)
                  : deps.showToast(
                      pngCopyFailureMessage(
                        "artboard",
                        input2 === "refused" ? null : value656,
                      ),
                      "error",
                    );
          },
        );
      }

/** 画板菜单选择复制为 SVG 时运行：在捕获视口中生成 SVG 并写入剪贴板，处理裁切、缺图与失败提示。 */
export function copyArtboardAsSvg(deps: { readonly hideToast: Dynamic; readonly showToast: Dynamic; readonly value177: Dynamic; readonly value479: Dynamic; readonly value480: Dynamic; readonly value483: Dynamic; readonly value494: Dynamic; readonly value502: Dynamic; readonly value503: Dynamic; readonly value87: Dynamic; readonly value93: Dynamic }, input?: Dynamic): Dynamic {
        if (deps.value480) return;
        if (deps.value494())
          return void deps.showToast(AccessibilityAnnouncementsLabel_5);
        let value653: Dynamic = deps.value87.current.artboards.find(
            (input2?: Dynamic): Dynamic => input2.file === input,
          ),
          value654: Dynamic = clipboardGeneration(),
          value655: Dynamic = createCurrentWorkingGeneration(),
          value656: Dynamic = null,
          flag2: Dynamic = false,
          index: Dynamic = 0,
          flag3: Dynamic = false,
          value657: Dynamic = (async (): Promise<Dynamic> => {
            deps.value479(true);
            try {
              if (!(await allowsClipboardImages())) {
                flag2 = true;
                return null;
              }
              let value658: Dynamic = await deps.value483(input),
                value659: Dynamic = value658
                  ? createPreviewHandle(value658)
                  : null;
              if (
                !value658 ||
                !value659 ||
                value658.getBoundingClientRect().width === 0
              ) {
                value656 = deps.value177.current.get(input)?.isBlocked()
                  ? AccessibilityAnnouncementsLabel_8
                  : AccessibilityAnnouncementsLabel_9;
                return null;
              }
              let value660: Dynamic = value653
                  ? getArtboardCaptureOptions(value653, deps.value93)
                  : null,
                value661: Dynamic = value660?.frame,
                value662: Dynamic =
                  value661 &&
                  Number.isFinite(value661.w) &&
                  Number.isFinite(value661.h) &&
                  value661.w > 0 &&
                  value661.h > 0
                    ? value661
                    : null,
                value663: Dynamic = await withCaptureViewport(
                  value659,
                  value662,
                  (): Dynamic =>
                    captureClipboardSvg(
                      value659,
                      "page",
                      value662 && {
                        w: value662.w,
                        h: value660?.clipToFrame ? value662.h : null,
                      },
                    ),
                  value660?.settle === true,
                ).catch(
                  (input2?: Dynamic): Dynamic => (
                    console.error("[copy-svg] artboard", input2),
                    (value656 = svgCopyErrorMessage(input2)),
                    null
                  ),
                );
              return value663
                ? value663.ok
                  ? ((index = value663.blank),
                    (flag3 = value663.clipped),
                    clipboardGeneration() === value654 &&
                    value655()
                      ? value663.svg
                      : null)
                  : ((value656 =
                      value663.softError === "zero-size"
                        ? AccessibilityAnnouncementsLabel_7
                        : AccessibilityAnnouncementsLabel_4),
                    null)
                : null;
            } catch (value658: Dynamic) {
              console.error("[copy-svg] artboard", value658);
              value656 = AccessibilityAnnouncementsLabel_4;
              return null;
            } finally {
              deps.value479(false);
            }
          })();
        writeClipboardSvg(value657).then(
          (input2?: Dynamic): Dynamic => {
            if (
              !(
                clipboardGeneration() !== value654 || !value655()
              )
            )
              if (input2 === "copied") {
                clearClipboardBuffers();
                announce(
                  AccessibilityAnnouncementsLabel_3,
                );
                if (flag3) {
                  let value658: Dynamic = deps.value502(input),
                    value659: Dynamic = deps.showToast(
                      clippedSvgCopyMessage(
                        formatArtboardNames([
                          exportFileName(input, value653?.title),
                        ]),
                        value658,
                      ),
                      "info",
                      value658
                        ? {
                            action: deps.value503(
                              [input],
                              false,
                              (): Dynamic => deps.hideToast(value659),
                              false,
                            ),
                            pinned: true,
                          }
                        : undefined,
                    );
                }
                index > 0 &&
                  deps.showToast(
                    missingSvgImagesMessage(index),
                    "info",
                  );
              } else
                flag2
                  ? deps.showToast(DownloadsArenTAvailableToYouForMessage)
                  : deps.showToast(
                      svgCopyFailureMessage(
                        "artboard",
                        input2 === "refused" ? null : value656,
                      ),
                      "error",
                    );
          },
        );
      }
