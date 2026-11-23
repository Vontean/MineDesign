import { CanvasAnnotationShapeStyleLineArrowPenConfig } from "../annotation-shape-style";
import { CanvasImagePlacementError } from "../../assets/image-placement";
import { CanvasWorkingStateJoin } from "../working-state";
import { CanvasWorkingStatePrint } from "../working-state";
import { CanvasWorkingStateReplace } from "../working-state";
import { CanvasWorkingStateWidth } from "../working-state";
import { ModelModelStateLimit } from "../../editor/model/model-state";
import { NotesBlocksHandler } from "../../editor/notes/blocks";
import { PlatformFileContentBackgroundBackgroundColorOpacityValues } from "../../platform/file-content";
import { maxTextAnnotationWidth as maxNoteWidth } from "../../platform/file-content";
import { minAnnotationDimensionLimit as minNoteMaxExtent } from "../../platform/file-content";
import { maxAnnotationDimensionLimit as maxNoteMaxExtent } from "../../platform/file-content";
import { maxCanvasCoordinate as maxCoordinate } from "../../platform/file-content";
import { minShapeDimension as minShapeSize } from "../../platform/file-content";
import { minImageDimension as minImageSize } from "../../platform/file-content";
import { minTextAnnotationWidth as minNoteWidth } from "../../platform/file-content";
import { PlatformFileContentKind } from "../../platform/file-content";
import { maxCanvasItemDimension as maxShapeSize } from "../../platform/file-content";
import { PlatformFileContentMaxW } from "../../platform/file-content";
import { PlatformFileContentSlice } from "../../platform/file-content";
import { parseAnnotationImageUrl as asImageSourcePath } from "../../platform/file-content";
import { parseAnnotationVideoUrl as asBlobAssetUrl } from "../../platform/file-content";
import { PlatformFileContentTrim } from "../../platform/file-content";
import { annotationArrowHeads } from "../../platform/file-content";
import { annotationBounds } from "../../platform/file-content";
import { annotationColor } from "../annotation-shape-style";
import { annotationGeometry } from "../../platform/file-content";
import { annotationRotation } from "../../platform/file-content";
import { annotationTextStyle } from "../../platform/file-content";
import { announce } from "../../editor/accessibility/announcer";
import { captureVideoPoster } from "../../editor/media/video-upload";
import { droppedImageLabel } from "../paste-placement";
import { filterSettingHistoryStep } from "../manifest-history";
import { flipAnnotations } from "../../editor/geometry/flip-annotations";
import { imageCropCss } from "../../editor/media/crop-geometry";
import { imageFlipCss } from "../../editor/geometry/flip-annotations";
import { isEmbedFrozen } from "../../platform/file-content";
import { isImageFile } from "../../platform/image-processing";
import { isShapeAnnotation } from "../../platform/file-content";
import { isVideoFile } from "../../editor/media/video-upload";
import { moveAnnotation } from "../../platform/file-content";
import { parseNoteBlocks } from "../../editor/notes/blocks";
import { trackEmbeddedWrite } from "../../platform/file-content";
import { type Dynamic } from "../../runtime-types";
import { uiMessage } from "@minedesign/contracts/ui-messages";
import { uiOperation } from "@minedesign/contracts/ui-value";
import { updateAnnotationAlt } from "../../platform/file-content";
import { updateAnnotationCrop } from "../../platform/file-content";
import { updateAnnotationCss } from "../../platform/file-content";
import { updateAnnotationTextStyle } from "../../platform/file-content";
import { updateAnnotationVideo } from "../../platform/file-content";
import { uploadDesignFile } from "../working-state";
import { uploadDesignVideo } from "../working-state";
import { validateCanvasPlacedImage } from "../../assets/image-placement";
import { videoFileTitle } from "../working-state";
import { videoUploadFailureMessage } from "../../editor/media/video-upload";
import { videoUploadRefusal } from "../../editor/media/video-upload";

/** 把画布说明或图片图形转成可插入画板的 HTML 片段（含旋转、翻转、裁剪与文字样式），无法转换的图形返回 null；拖入画板时使用。 */
export function annotationToElementHtml(deps: Record<string, never>, source?: Dynamic): Dynamic {
      let escapeAttribute: Dynamic = (rawText?: Dynamic): Dynamic =>
          rawText
            .replace(/&/g, "&amp;")
            .replace(/"/g, "&quot;")
            .replace(/</g, "&lt;"),
        transformValue: Dynamic = [
          annotationRotation(source) !== 0
            ? "rotate(" +
              String(annotationRotation(source)) +
              "deg)"
            : "",
          imageFlipCss(source)?.transform ?? "",
        ]
          .filter((part?: Dynamic): Dynamic => part !== "")
          .join(" "),
        transformStyle: Dynamic =
          transformValue !== "" ? " transform: " + transformValue + ";" : "";
      if (isShapeAnnotation(source)) {
        if (source.kind !== "image" || source.video) return null;
        let widthPx: Dynamic = String(Math.round(source.w)),
          heightPx: Dynamic = String(Math.round(source.h));
        if (source.crop) {
          let cropCss: Dynamic = imageCropCss(source.crop),
            cropImageStyle: Dynamic =
              "position: absolute; width: " +
              cropCss.width +
              "; height: " +
              cropCss.height +
              "; left: " +
              cropCss.left +
              "; top: " +
              cropCss.top +
              "; max-width: none; max-height: none; object-fit: cover; object-position: " +
              cropCss.objectPosition;
          return (
            '<div style="position: relative; contain: layout; overflow: hidden; width: ' +
            widthPx +
            "px; height: " +
            heightPx +
            "px;" +
            transformStyle +
            '"><img src="' +
            escapeAttribute(source.src) +
            '"' +
            (source.alt ? ' alt="' + escapeAttribute(source.alt) + '"' : "") +
            ' style="' +
            cropImageStyle +
            '"></div>'
          );
        }
        return (
          '<img src="' +
          escapeAttribute(source.src) +
          '"' +
          (source.alt ? ' alt="' + escapeAttribute(source.alt) + '"' : "") +
          ' width="' +
          widthPx +
          '" height="' +
          heightPx +
          '" style="width: ' +
          widthPx +
          "px; height: auto;" +
          transformStyle +
          '">'
        );
      }
      let textStyle: Dynamic = annotationTextStyle(source),
        escapeText: Dynamic = (rawText?: Dynamic): Dynamic =>
          rawText
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;"),
        inlineTagByKind: Dynamic = {
          bold: "strong",
          italic: "em",
          code: "code",
        },
        renderInline: Dynamic = (inlineText?: Dynamic): Dynamic =>
          NotesBlocksHandler(inlineText)
            .map(
              (run?: Dynamic): Dynamic =>
                run.kind === "text"
                  ? escapeText(run.text)
                  : run.kind === "link"
                    ? /^https?:\/\//i.test(run.href)
                      ? '<a href="' +
                        escapeAttribute(run.href) +
                        '">' +
                        escapeText(run.text) +
                        "</a>"
                      : escapeText(run.text)
                    : "<" +
                      inlineTagByKind[run.kind] +
                      ">" +
                      escapeText(run.text) +
                      "</" +
                      inlineTagByKind[run.kind] +
                      ">",
            )
            .join(""),
        bodyHtml: Dynamic = parseNoteBlocks(source.text)
          .map(
            (block?: Dynamic): Dynamic =>
              block.kind === "p"
                ? "<div>" +
                  (block.text === "" ? "<br>" : renderInline(block.text)) +
                  "</div>"
                : block.kind === "ul"
                  ? "<ul>" +
                    block.items
                      .map(
                        (item?: Dynamic): Dynamic =>
                          "<li>" + renderInline(item) + "</li>",
                      )
                      .join("") +
                    "</ul>"
                  : '<ol start="' +
                    String(block.start) +
                    '">' +
                    block.items
                      .map(
                        (item?: Dynamic): Dynamic =>
                          "<li>" + renderInline(item) + "</li>",
                      )
                      .join("") +
                    "</ol>",
          )
          .join("");
      return source.text.trim() === ""
        ? null
        : '<div style="margin: 0; width: ' +
            String(Math.round(source.w)) +
            "px; font-size: " +
            String(textStyle.size) +
            "px;" +
            (textStyle.bold ? " font-weight: 600;" : "") +
            (textStyle.italic ? " font-style: italic;" : "") +
            " white-space: pre-wrap;" +
            transformStyle +
            '">' +
            bodyHtml +
            "</div>";
    }

/** 翻转选中的画布图形时运行：计算翻转结果，写回清单并记录 transform 历史，返回已翻转与被拒的项目。 */
export function flipAnnotationsWithHistory(deps: { readonly finishBoundOperation: Dynamic; readonly editing: Dynamic; readonly recordHistory: Dynamic; readonly manifest: Dynamic; readonly persistManifest: Dynamic }, annotationIds?: Dynamic, flipAxis?: Dynamic, historyContext?: Dynamic): Dynamic {
        let manifest: Dynamic = deps.manifest.current,
          canFlip: Dynamic = deps.editing.current && true,
          { flips: flips, refused: refused }: Dynamic = canFlip
            ? flipAnnotations(
                (manifest.annotations ?? []).filter(
                  (annotation?: Dynamic): Dynamic => annotationIds.has(annotation.id),
                ),
                flipAxis,
              )
            : {
                flips: [],
                refused: undefined,
              };
        if (flips.length === 0) {
          historyContext !== undefined && deps.finishBoundOperation.current.get(historyContext)?.();
          return refused === undefined
            ? {
                flipped: false,
              }
            : {
                flipped: false,
                refused: refused,
              };
        }
        let flipById: Dynamic = new Map(
          flips.map((flip?: Dynamic): Dynamic => [flip.id, flip.to]),
        );
        deps.recordHistory(
          {
            kind: "transform",
            get label() { return uiMessage("canvas.designCanvas.flip"); },
            boards: [],
            anns: flips,
          },
          new Set(),
          undefined,
          historyContext,
        );
        deps.persistManifest({
          ...manifest,
          annotations: (manifest.annotations ?? []).map(
            (annotation?: Dynamic): Dynamic => {
              let flip: Dynamic = flipById.get(annotation.id);
              return flip
                ? {
                    ...annotation,
                    ...flip,
                  }
                : annotation;
            },
          ),
        });
        return refused === undefined
          ? {
              flipped: true,
            }
          : {
              flipped: true,
              refused: refused,
            };
      }

/** 在属性面板修改画布图形或说明的位置与尺寸时运行：校验数值、按图形类型换算几何并写回清单，记录移动或缩放历史。 */
export function setAnnotationBox(deps: { readonly recordHistory: Dynamic; readonly setManifestState: Dynamic; readonly previousManifest: Dynamic; readonly manifest: Dynamic; readonly persistManifest: Dynamic }, annotationId?: Dynamic,
        boxChanges?: Dynamic,
        shouldRecordHistory?: Dynamic,
        keepAspectRatio?: Dynamic): Dynamic {
        let annotations: Dynamic = deps.manifest.current.annotations ?? [],
          annotation: Dynamic = annotations.find(
            (item?: Dynamic): Dynamic => item.id === annotationId,
          );
        if (
          !annotation ||
          Object.values(boxChanges).some(
            (changeValue?: Dynamic): Dynamic =>
              changeValue != null && !Number.isFinite(changeValue),
          )
        )
          return;
        let baseline: Dynamic =
            (deps.previousManifest.current ?? deps.manifest.current).annotations?.find(
              (item?: Dynamic): Dynamic => item.id === annotationId,
            ) ?? annotation,
          clampCoordinate: Dynamic = (coordinate?: Dynamic): Dynamic =>
            Math.max(
              -maxCoordinate,
              Math.min(
                maxCoordinate,
                Math.round(coordinate),
              ),
            ),
          nextAnnotation: Dynamic;
        if (
          annotation.kind === "rect" ||
          annotation.kind === "oval" ||
          annotation.kind === "pen" ||
          annotation.kind === "image"
        ) {
          let minSize: Dynamic =
              annotation.kind === "image"
                ? minImageSize
                : minShapeSize,
            clampSize: Dynamic = (size?: Dynamic): Dynamic =>
              Math.min(
                maxShapeSize,
                Math.max(minSize, Math.round(size)),
              ),
            nextWidth: Dynamic =
              boxChanges.w !== undefined ? clampSize(boxChanges.w) : annotation.w,
            nextHeight: Dynamic =
              boxChanges.h !== undefined ? clampSize(boxChanges.h) : annotation.h;
          if (
            annotation.kind === "image" &&
            keepAspectRatio &&
            (boxChanges.w !== undefined) != (boxChanges.h !== undefined)
          ) {
            let baselineSize: Dynamic = baseline;
            boxChanges.w !== undefined
              ? (nextHeight = clampSize((nextWidth * baselineSize.h) / baselineSize.w))
              : (nextWidth = clampSize((nextHeight * baselineSize.w) / baselineSize.h));
          }
          nextAnnotation = {
            ...annotation,
            x: clampCoordinate(boxChanges.x ?? annotation.x),
            y: clampCoordinate(boxChanges.y ?? annotation.y),
            w: nextWidth,
            h: nextHeight,
          };
        } else if (isShapeAnnotation(annotation)) {
          let bounds: Dynamic = annotationBounds(annotation);
          nextAnnotation = moveAnnotation(
            annotation,
            clampCoordinate(annotation.x + ((boxChanges.x ?? bounds.x) - bounds.x)),
            clampCoordinate(annotation.y + ((boxChanges.y ?? bounds.y) - bounds.y)),
          );
        } else {
          let noteWidth: Dynamic =
              boxChanges.w !== undefined
                ? Math.min(
                    maxNoteWidth,
                    Math.max(
                      minNoteWidth,
                      Math.round(boxChanges.w),
                    ),
                  )
                : annotation.w,
            clampNoteMaxExtent: Dynamic = (
              extent?: Dynamic,
              fallback?: Dynamic,
            ): Dynamic =>
              extent === undefined
                ? fallback
                : extent === null
                  ? undefined
                  : Math.min(
                      maxNoteMaxExtent,
                      Math.max(
                        minNoteMaxExtent,
                        Math.round(extent),
                      ),
                    ),
            {
              maxW: currentMaxW,
              maxH: currentMaxH,
              ...restProps
            }: Dynamic = annotation,
            [nextMaxW, nextMaxH]: Dynamic = [
              annotation.kind === "title1"
                ? clampNoteMaxExtent(boxChanges.maxW, annotation.maxW)
                : undefined,
              clampNoteMaxExtent(boxChanges.maxH, annotation.maxH),
            ];
          nextAnnotation = {
            ...restProps,
            x: clampCoordinate(boxChanges.x ?? annotation.x),
            y: clampCoordinate(boxChanges.y ?? annotation.y),
            w: noteWidth,
            ...(nextMaxW !== undefined
              ? {
                  maxW: nextMaxW,
                }
              : {}),
            ...(nextMaxH !== undefined
              ? {
                  maxH: nextMaxH,
                }
              : {}),
          };
        }
        let nextAnnotations: Dynamic = annotations.map(
          (item?: Dynamic): Dynamic =>
            item.id === annotationId ? nextAnnotation : item,
        );
        if (!shouldRecordHistory) {
          deps.setManifestState({
            ...deps.manifest.current,
            annotations: nextAnnotations,
          });
          return;
        }
        if (
          ["x", "y", "w", "h", "maxW", "maxH"].every(
            (key?: Dynamic): Dynamic =>
              baseline[key] === nextAnnotation[key],
          ) &&
          (!("x2" in baseline) ||
            (baseline.x2 === nextAnnotation.x2 && baseline.y2 === nextAnnotation.y2))
        ) {
          annotation !== nextAnnotation &&
            deps.setManifestState({
              ...deps.manifest.current,
              annotations: nextAnnotations,
            });
          return;
        }
        if (
          isShapeAnnotation(baseline) &&
          isShapeAnnotation(nextAnnotation)
        )
          deps.recordHistory.current(
            {
              kind: "ann-box",
              id: annotationId,
              from: annotationGeometry(baseline),
              to: annotationGeometry(nextAnnotation),
            },
            new Set(),
          );
        else if (
          !isShapeAnnotation(baseline) &&
          !isShapeAnnotation(nextAnnotation)
        ) {
          let changedKeys: Dynamic = ["maxW", "maxH"].filter(
            (key?: Dynamic): Dynamic =>
              baseline[key] !== nextAnnotation[key],
          );
          changedKeys.length > 0 &&
            deps.recordHistory.current(
              {
                kind: "transform",
                get label() { return uiMessage("canvas.designCanvas.resize"); },
                boards: [],
                anns: [
                  {
                    id: annotationId,
                    from: Object.fromEntries(
                      changedKeys.map(
                        (key?: Dynamic): Dynamic => [
                          key,
                          baseline[key],
                        ],
                      ),
                    ),
                    to: Object.fromEntries(
                      changedKeys.map(
                        (key?: Dynamic): Dynamic => [
                          key,
                          nextAnnotation[key],
                        ],
                      ),
                    ),
                  },
                ],
              },
              new Set(),
            );
          baseline.w !== nextAnnotation.w &&
            deps.recordHistory.current(
              {
                kind: "ann-resize",
                id: annotationId,
                from: baseline.w,
                to: nextAnnotation.w,
              },
              new Set(),
            );
          (baseline.x !== nextAnnotation.x || baseline.y !== nextAnnotation.y) &&
            deps.recordHistory.current(
              {
                kind: "ann-move",
                id: annotationId,
                from: {
                  x: baseline.x,
                  y: baseline.y,
                },
                to: {
                  x: nextAnnotation.x,
                  y: nextAnnotation.y,
                },
              },
              new Set(),
            );
        }
        deps.persistManifest({
          ...deps.manifest.current,
          annotations: nextAnnotations,
        });
      }

/** 在属性面板修改画布图形的背景、透明度或图片填充方式时运行（onAnnotationCss）：校验取值、更新样式并合并历史。 */
export function setAnnotationCss(deps: {
  history: {
    undoTip(): Dynamic;
    reachable(direction: "undo"): Dynamic;
    invalidateRedo(): void;
    removeUndoTip(): void;
  };
  readonly showDragToast: Dynamic; readonly recordHistory: Dynamic; readonly setManifestState: Dynamic; readonly previousManifest: Dynamic; readonly manifest: Dynamic; readonly persistManifest: Dynamic }, annotationId?: Dynamic,
        cssChanges?: Dynamic,
        skipHistory: Dynamic = false): Dynamic {
        let annotations: Dynamic = deps.manifest.current.annotations ?? [],
          annotation: Dynamic = annotations.find(
            (item?: Dynamic): Dynamic => item.id === annotationId,
          );
        if (!annotation || !isShapeAnnotation(annotation)) return;
        let baseline: Dynamic = skipHistory
            ? annotation
            : ((deps.previousManifest.current ?? deps.manifest.current).annotations?.find(
                (item?: Dynamic): Dynamic => item.id === annotationId,
              ) ?? annotation),
          nextCss: Dynamic = {
            ...(annotation.css ?? {}),
          },
          hasInvalidValue: Dynamic = false;
        for (let { prop: cssProp, value: cssValue } of cssChanges as Dynamic) {
          if (
            !PlatformFileContentBackgroundBackgroundColorOpacityValues.includes(
              cssProp,
            )
          )
            continue;
          let propName: Dynamic = cssProp;
          if (cssValue === null || cssValue.trim() === "")
            delete nextCss[propName];
          else {
            let sanitizedValue: Dynamic = PlatformFileContentTrim(
              propName,
              cssValue,
            );
            sanitizedValue === null ? (hasInvalidValue = true) : (nextCss[propName] = sanitizedValue);
          }
        }
        hasInvalidValue &&
          deps.showDragToast(
            uiMessage("canvas.designCanvas.thatValueIsnTOne"),
          );
        let finalCss: Dynamic =
          Object.keys(nextCss).length > 0 ? nextCss : undefined;
        if (skipHistory) {
          JSON.stringify(finalCss ?? null) !==
            JSON.stringify(annotation.css ?? null) &&
            deps.setManifestState({
              ...deps.manifest.current,
              annotations: annotations.map(
                (item?: Dynamic): Dynamic =>
                  item.id === annotationId
                    ? updateAnnotationCss(annotation, finalCss)
                    : item,
              ),
            });
          return;
        }
        let baselineCss: Dynamic = isShapeAnnotation(baseline)
            ? baseline.css
            : undefined,
          hasCssChanged: Dynamic = (propName?: Dynamic): Dynamic =>
            (finalCss?.[propName] ?? null) !== (baselineCss?.[propName] ?? null),
          cropBefore: Dynamic =
            annotation.kind === "image" &&
            (hasCssChanged("object-fit") || hasCssChanged("object-position"))
              ? annotation.crop
              : undefined,
          buildUpdatedAnnotation: Dynamic = (): Dynamic =>
            cropBefore !== undefined && annotation.kind === "image"
              ? updateAnnotationCrop(
                  updateAnnotationCss(annotation, finalCss),
                  undefined,
                )
              : updateAnnotationCss(annotation, finalCss);
        if (
          JSON.stringify(finalCss ?? null) ===
          JSON.stringify(baselineCss ?? null)
        ) {
          JSON.stringify(finalCss ?? null) !==
            JSON.stringify(annotation.css ?? null) &&
            deps.setManifestState({
              ...deps.manifest.current,
              annotations: annotations.map(
                (item?: Dynamic): Dynamic =>
                  item.id === annotationId
                    ? updateAnnotationCss(annotation, finalCss)
                    : item,
              ),
            });
          return;
        }
        let changedProps: Dynamic =
            PlatformFileContentBackgroundBackgroundColorOpacityValues.filter(
              (propName?: Dynamic): Dynamic =>
                (baselineCss?.[propName] ?? null) !== (nextCss[propName] ?? null),
            ),
          lastHistoryStep: Dynamic = deps.history.undoTip();
        if (
          lastHistoryStep?.op.kind === "ann-css" &&
          lastHistoryStep.op.id === annotationId &&
          lastHistoryStep.op.cropFrom === undefined &&
          cropBefore === undefined &&
          !lastHistoryStep.sealed &&
          changedProps.length === 1 &&
          lastHistoryStep.cssKey === changedProps[0] &&
          Date.now() - lastHistoryStep.at < ModelModelStateLimit &&
          deps.history.reachable("undo") === lastHistoryStep
        ) {
          let mergedOp: Dynamic = filterSettingHistoryStep(
            lastHistoryStep.op,
            changedProps[0],
            finalCss,
          );
          lastHistoryStep.at = Date.now();
          deps.history.invalidateRedo();
          mergedOp
            ? (lastHistoryStep.op = mergedOp)
            : deps.history.removeUndoTip();
        } else {
          deps.recordHistory.current(
            {
              kind: "ann-css",
              id: annotationId,
              from: baselineCss,
              to: finalCss,
              ...(cropBefore !== undefined
                ? {
                    cropFrom: cropBefore,
                  }
                : {}),
            },
            new Set(),
          );
          let pushedStep: Dynamic =
            deps.history.undoTip();
          pushedStep &&
            changedProps.length === 1 &&
            (pushedStep.cssKey = changedProps[0]);
        }
        deps.persistManifest({
          ...deps.manifest.current,
          annotations: annotations.map(
            (item?: Dynamic): Dynamic =>
              item.id === annotationId ? buildUpdatedAnnotation() : item,
          ),
        });
      }

/** 在属性面板修改画布说明或图形的文字样式时运行：写回文字样式并记录 ann-style 历史。 */
export function setAnnotationTextStyle(deps: { readonly recordHistory: Dynamic; readonly setManifestState: Dynamic; readonly previousManifest: Dynamic; readonly manifest: Dynamic; readonly persistManifest: Dynamic }, annotationId?: Dynamic,
        styleChanges?: Dynamic,
        skipHistory: Dynamic = false): Dynamic {
        let annotations: Dynamic = deps.manifest.current.annotations ?? [],
          annotation: Dynamic = annotations.find(
            (item?: Dynamic): Dynamic => item.id === annotationId,
          );
        if (!annotation || isShapeAnnotation(annotation)) return;
        let updatedAnnotation: Dynamic = updateAnnotationTextStyle(
            annotation,
            styleChanges,
          ),
          nextAnnotations: Dynamic = annotations.map(
            (item?: Dynamic): Dynamic =>
              item.id === annotationId ? updatedAnnotation : item,
          );
        if (skipHistory) {
          JSON.stringify(annotationTextStyle(annotation)) !==
            JSON.stringify(annotationTextStyle(updatedAnnotation)) &&
            deps.setManifestState({
              ...deps.manifest.current,
              annotations: nextAnnotations,
            });
          return;
        }
        let baseline: Dynamic = (
            deps.previousManifest.current ?? deps.manifest.current
          ).annotations?.find(
            (item?: Dynamic): Dynamic => item.id === annotationId,
          ),
          styleBefore: Dynamic = annotationTextStyle(
            baseline !== undefined &&
              !isShapeAnnotation(baseline)
              ? baseline
              : annotation,
          ),
          styleAfter: Dynamic = annotationTextStyle(updatedAnnotation);
        if (JSON.stringify(styleBefore) === JSON.stringify(styleAfter)) {
          annotation !== updatedAnnotation &&
            deps.setManifestState({
              ...deps.manifest.current,
              annotations: nextAnnotations,
            });
          return;
        }
        deps.recordHistory.current(
          {
            kind: "ann-style",
            id: annotationId,
            from: styleBefore,
            to: styleAfter,
          },
          new Set(),
        );
        deps.persistManifest({
          ...deps.manifest.current,
          annotations: nextAnnotations,
        });
      }

/** 在属性面板替换画布图片时运行：校验并上传新图片，更新图片地址、裁剪与替代文字，失败时提示。 */
export function replaceAnnotationPicture(deps: { readonly showDragToast: Dynamic; readonly recordHistory: Dynamic; readonly manifest: Dynamic; readonly persistManifest: Dynamic }, annotationId?: Dynamic, picture?: Dynamic): Dynamic {
        if (
          typeof picture == "string"
            ? asImageSourcePath(picture) === null
            : !(picture instanceof File) || !picture.type.startsWith("image/")
        )
          return;
        let annotation: Dynamic = (deps.manifest.current.annotations ?? []).find(
            (item?: Dynamic): Dynamic => item.id === annotationId,
          ),
          originalSrc: Dynamic =
            annotation?.kind === "image" ? annotation.src : undefined;
        trackEmbeddedWrite(
          (async (): Promise<Dynamic> => {
            if (typeof picture != "string") {
              let validationError: Dynamic = await validateCanvasPlacedImage(picture);
              if (validationError !== null)
                throw new CanvasImagePlacementError(validationError);
            }
            return typeof picture == "string"
              ? {
                  src: picture,
                }
              : uploadDesignFile("appifact", null, picture);
          })().then(({ src: src }: Dynamic): Dynamic => {
            if (isEmbedFrozen()) return;
            let validSrc: Dynamic = asImageSourcePath(
              src,
            );
            if (validSrc === null) {
              deps.showDragToast(uiMessage("canvas.designCanvas.couldNotReplaceThePicture"));
              return false;
            }
            let annotations: Dynamic = deps.manifest.current.annotations ?? [],
              currentAnnotation: Dynamic = annotations.find(
                (item?: Dynamic): Dynamic => item.id === annotationId,
              );
            if (
              !currentAnnotation ||
              currentAnnotation.kind !== "image" ||
              currentAnnotation.src === validSrc ||
              currentAnnotation.src !== originalSrc
            )
              return;
            let alt: Dynamic =
              typeof picture == "string"
                ? currentAnnotation.alt
                : (PlatformFileContentSlice(
                    droppedImageLabel(picture, "dropped"),
                  ) ?? currentAnnotation.alt);
            deps.recordHistory.current(
              {
                kind: "ann-src",
                id: annotationId,
                from: {
                  src: currentAnnotation.src,
                  alt: currentAnnotation.alt,
                  crop: currentAnnotation.crop,
                },
                to: {
                  src: validSrc,
                  alt: alt,
                },
              },
              new Set(),
            );
            deps.persistManifest({
              ...deps.manifest.current,
              annotations: annotations.map(
                (item?: Dynamic): Dynamic =>
                  item.id === annotationId
                    ? updateAnnotationCrop(
                        updateAnnotationAlt(
                          {
                            ...currentAnnotation,
                            src: validSrc,
                          },
                          alt,
                        ),
                        undefined,
                      )
                    : item,
              ),
            });
          }),
        ).catch(
          (error?: Dynamic): Dynamic =>
            deps.showDragToast(
              uiMessage("canvas.designCanvas.thePictureWasNotReplaced", { reason: uiOperation(error instanceof CanvasImagePlacementError ? error.message : "the upload failed") }),
            ),
        );
      }

/** 替换画布上的图片或视频时运行（onReplaceAnnotationMedia）：按文件类型上传图片，或探测视频、生成封面后上传，并更新图形与历史。 */
export function replaceAnnotationMedia(deps: { readonly showDragToast: Dynamic; readonly recordHistory: Dynamic; readonly mediaOperations: Dynamic; readonly manifest: Dynamic; readonly persistManifest: Dynamic }, annotationId?: Dynamic, mediaFile?: Dynamic): Dynamic {
        let annotation: Dynamic = (deps.manifest.current.annotations ?? []).find(
          (item?: Dynamic): Dynamic => item.id === annotationId,
        );
        if (
          !annotation ||
          annotation.kind !== "image" ||
          !(mediaFile instanceof File)
        )
          return;
        let mediaFingerprint: Dynamic = CanvasWorkingStateJoin(mediaFile);
        if (
          CanvasWorkingStatePrint(
            deps.mediaOperations.current.get(annotationId),
            mediaFingerprint,
            annotation,
          )
        )
          return;
        let originalMedia: Dynamic = {
            src: annotation.src,
            video: annotation.video,
          },
          applyReplacement: Dynamic = (
            newMedia?: Dynamic,
            alt?: Dynamic,
            size?: Dynamic,
          ): Dynamic => {
            let annotations: Dynamic = deps.manifest.current.annotations ?? [],
              currentAnnotation: Dynamic = annotations.find(
                (item?: Dynamic): Dynamic => item.id === annotationId,
              );
            if (
              !currentAnnotation ||
              currentAnnotation.kind !== "image" ||
              currentAnnotation.src !== originalMedia.src ||
              currentAnnotation.video !== originalMedia.video ||
              (currentAnnotation.src === newMedia.src && currentAnnotation.video === newMedia.video)
            )
              return false;
            let newHeight: Dynamic = CanvasWorkingStateWidth(
              currentAnnotation.w,
              size,
              currentAnnotation.h,
              minImageSize,
              maxShapeSize,
            );
            deps.recordHistory.current(
              {
                kind: "ann-src",
                id: annotationId,
                from: {
                  src: currentAnnotation.src,
                  alt: currentAnnotation.alt,
                  h: currentAnnotation.h,
                  ...(currentAnnotation.video !== undefined
                    ? {
                        video: currentAnnotation.video,
                      }
                    : {}),
                  ...(currentAnnotation.crop !== undefined
                    ? {
                        crop: currentAnnotation.crop,
                      }
                    : {}),
                },
                to: {
                  src: newMedia.src,
                  alt: alt,
                  h: newHeight,
                  ...(newMedia.video !== undefined
                    ? {
                        video: newMedia.video,
                      }
                    : {}),
                },
              },
              new Set(),
            );
            deps.persistManifest({
              ...deps.manifest.current,
              annotations: annotations.map(
                (item?: Dynamic): Dynamic =>
                  item.id === annotationId
                    ? updateAnnotationCrop(
                        updateAnnotationAlt(
                          updateAnnotationVideo(
                            {
                              ...currentAnnotation,
                              src: newMedia.src,
                              h: newHeight,
                            },
                            newMedia.video,
                          ),
                          alt,
                        ),
                        undefined,
                      )
                    : item,
              ),
            });
            deps.mediaOperations.current.set(annotationId, {
              print: mediaFingerprint,
              src: newMedia.src,
              video: newMedia.video,
            });
            return true;
          };
        if (isImageFile(mediaFile)) {
          trackEmbeddedWrite(
            (async (): Promise<Dynamic> => {
              let validationError: Dynamic = await validateCanvasPlacedImage(mediaFile);
              if (validationError !== null)
                throw new CanvasImagePlacementError(validationError);
              let imageSize: Dynamic = await createImageBitmap(mediaFile).then(
                (bitmap?: Dynamic): Dynamic => {
                  let bitmapSize: Dynamic = {
                    width: bitmap.width,
                    height: bitmap.height,
                  };
                  bitmap.close();
                  return bitmapSize;
                },
                (): Dynamic => null,
              );
              return {
                ...(await uploadDesignFile(
                  "appifact",
                  null,
                  mediaFile,
                )),
                size: imageSize,
              };
            })().then(({ src: src, size: size }: Dynamic): Dynamic => {
              if (isEmbedFrozen()) return false;
              let validSrc: Dynamic = asImageSourcePath(
                src,
              );
              return validSrc === null
                ? (deps.showDragToast(
                    uiMessage("canvas.designCanvas.couldNotReplaceTheVideo"),
                  ),
                  false)
                : applyReplacement(
                    {
                      src: validSrc,
                    },
                    PlatformFileContentSlice(
                      droppedImageLabel(mediaFile, "dropped"),
                    ),
                    size,
                  );
            }),
          ).catch(
            (error?: Dynamic): Dynamic => (
              deps.showDragToast(
                uiMessage("canvas.designCanvas.theVideoWasNotReplaced", { reason: uiOperation(error instanceof CanvasImagePlacementError ? error.message : "the upload failed") }),
              ),
              false
            ),
          );
          return;
        }
        let refusal: Dynamic = isVideoFile(mediaFile)
          ? videoUploadRefusal(mediaFile)
          : "unsupported_type";
        if (refusal !== null) {
          deps.showDragToast(
            CanvasWorkingStateReplace(
              videoUploadFailureMessage(refusal),
            ),
          );
          return;
        }
        announce(uiMessage("canvas.designCanvas.uploadingVideo"));
        trackEmbeddedWrite(
          (async (): Promise<Dynamic> => {
            let poster: Dynamic = await captureVideoPoster(
              mediaFile,
            ).catch((): Dynamic => "probe_timeout");
            if (typeof poster == "string") {
              deps.showDragToast(
                CanvasWorkingStateReplace(
                  videoUploadFailureMessage(poster),
                ),
              );
              return false;
            }
            let posterSrc: Dynamic = await uploadDesignFile(
              "appifact",
              null,
              new File(
                [poster.blob],
                videoFileTitle(mediaFile) + ".jpg",
                {
                  type: "image/jpeg",
                },
              ),
            ).then(
              (upload?: Dynamic): Dynamic =>
                asImageSourcePath(upload.src),
              (): Dynamic => null,
            );
            if (isEmbedFrozen()) return false;
            if (posterSrc === null) {
              deps.showDragToast(
                uiMessage("canvas.designCanvas.couldnTStoreAStill"),
              );
              return false;
            }
            let videoUpload: Dynamic = await uploadDesignVideo(
              mediaFile,
              poster,
            );
            if (isEmbedFrozen()) return false;
            if ("refused" in videoUpload) {
              deps.showDragToast(
                CanvasWorkingStateReplace(videoUpload.refused),
              );
              return false;
            }
            let videoSrc: Dynamic = asBlobAssetUrl(
              videoUpload.src,
            );
            if (videoSrc === null) {
              deps.showDragToast(uiMessage("canvas.designCanvas.couldnTReplaceTheVideo"));
              return false;
            }
            let replaced: Dynamic = applyReplacement(
              {
                src: posterSrc,
                video: videoSrc,
              },
              PlatformFileContentSlice(
                videoFileTitle(mediaFile),
              ),
              poster,
            );
            replaced && announce(uiMessage("canvas.designCanvas.videoReplaced"));
            return replaced;
          })(),
        );
      }

/** 只选中一个画布图形或说明时计算（useMemo）：生成属性面板所需的位置、尺寸、颜色、线宽、箭头和文字样式及对应修改回调。 */
export function deriveAnnotationSettings(deps: { readonly selectedFiles: Dynamic; readonly selectedNotes: Dynamic; readonly setBox: Dynamic; readonly setCss: Dynamic; readonly setArrowHeads: Dynamic; readonly setTextStyle: Dynamic; readonly replacePicture: Dynamic; readonly manifestState: Dynamic }): Dynamic {
      if (deps.selectedNotes.size !== 1 || deps.selectedFiles.size > 0) return null;
      let annotationId: Dynamic = [...deps.selectedNotes][0],
        annotation: Dynamic = (deps.manifestState.annotations ?? []).find(
          (item?: Dynamic): Dynamic => item.id === annotationId,
        );
      if (!annotation) return null;
      let bounds: Dynamic = isShapeAnnotation(annotation)
        ? annotationBounds(annotation)
        : {
            x: annotation.x,
            y: annotation.y,
            w: annotation.w,
          };
      return {
        id: annotationId,
        kind: annotation.kind ?? "note",
        x: bounds.x,
        y: bounds.y,
        w: bounds.w,
        ...("h" in bounds &&
        annotation.kind !== "line" &&
        annotation.kind !== "arrow"
          ? {
              h: bounds.h,
            }
          : {}),
        ...(isShapeAnnotation(annotation)
          ? {
              css: annotation.css,
              paint: annotationColor(
                annotation.kind,
                annotation.color ?? "default",
              ),
              ...(annotation.kind === "line" ||
              annotation.kind === "arrow" ||
              annotation.kind === "pen"
                ? {
                    strokeWidth:
                      CanvasAnnotationShapeStyleLineArrowPenConfig[
                        annotation.kind
                      ],
                  }
                : {}),
              ...(annotation.kind === "line" || annotation.kind === "arrow"
                ? {
                    heads: annotationArrowHeads(annotation),
                    onSetHeads: (
                      startHead?: Dynamic,
                      endHead?: Dynamic,
                    ): Dynamic => deps.setArrowHeads(annotationId, startHead, endHead),
                  }
                : {}),
              onSetCss: (cssChanges?: Dynamic, skipHistory?: Dynamic): Dynamic =>
                deps.setCss(annotationId, cssChanges, skipHistory),
            }
          : {
              textStyle: annotationTextStyle(annotation),
              maxW: annotation.maxW,
              maxH: annotation.maxH,
              defaultMaxW:
                annotation.kind === "title1"
                  ? PlatformFileContentMaxW({
                      ...annotation,
                      maxW: undefined,
                    })
                  : undefined,
              defaultMaxH: Number.isFinite(
                PlatformFileContentKind({
                  ...annotation,
                  maxH: undefined,
                }),
              )
                ? PlatformFileContentKind({
                    ...annotation,
                    maxH: undefined,
                  })
                : undefined,
              onSetTextStyle: (styleChanges?: Dynamic, skipHistory?: Dynamic): Dynamic =>
                deps.setTextStyle(annotationId, styleChanges, skipHistory),
            }),
        ...(annotation.kind === "image"
          ? {
              src: annotation.src,
              alt: annotation.alt,
              ...(annotation.video !== undefined
                ? {
                    video: annotation.video,
                  }
                : {
                    onReplaceImage: (picture?: Dynamic): Dynamic =>
                      deps.replacePicture(annotationId, picture),
                  }),
            }
          : {}),
        onSetBox: (boxChanges?: Dynamic, shouldRecordHistory?: Dynamic): Dynamic =>
          deps.setBox(annotationId, boxChanges, shouldRecordHistory, false),
      };
    }
