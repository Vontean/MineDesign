import { uiMessage } from "@minedesign/contracts/ui-messages";
import { type Dynamic } from "../../runtime-types";
import { announce } from "../../editor/accessibility/announcer";
import { CropDoesNotWorkWhileThisMessage, imageFlipCss } from "../../editor/geometry/flip-annotations";
import { useLatestCallback } from "../../editor/hooks/latest-callback";
import { blurBeforeCrop } from "../../editor/media/crop-editor";
import { mediaNaturalDimensions, normalizeCenteredImageCrop, rotatedCropFrame, sameImageCrop } from "../../editor/media/crop-geometry";
import { cropFromObjectStyles, parseObjectPosition } from "../../editor/media/object-crop";
import { supportsClickPlacement } from "../../editor/tools";
import { reactDomVectorToolState, vectorToolStateReact as React } from "../../editor/vector/tool-state";
import { annotationRotation, updateAnnotationCrop, updateAnnotationCss } from "../../platform/file-content";

/** 在原有 hook 顺序中创建裁剪状态，后续生命周期使用同一个 ref。 */
export function useImageCropState() {
  const [cropSession, setCropSession]: Dynamic = (0, React.useState)(null);
  const cropSessionRef: Dynamic = (0, React.useRef)(cropSession);
  cropSessionRef.current = cropSession;
  return { cropSession, setCropSession, cropSessionRef };
}

type CropLifecycleOptions = {
  cropState: ReturnType<typeof useImageCropState>;
  canvasRootRef: Dynamic;
  manifest: Dynamic;
  getCurrentManifest(): Dynamic;
  updateAnnotation(...args: Dynamic[]): Dynamic;
  onSetMoveSay: Dynamic;
  canEditCanvas: Dynamic;
  singleSelectedNoteId: Dynamic;
  armedTool: Dynamic;
  fullscreenFile: Dynamic;
};

/** 处理图片裁剪的开始、提交及选区变化时的取消。 */
export function useImageCropLifecycle({
  cropState: { cropSession, setCropSession, cropSessionRef },
  canvasRootRef, manifest, getCurrentManifest, updateAnnotation, onSetMoveSay,
  canEditCanvas, singleSelectedNoteId, armedTool, fullscreenFile,
}: CropLifecycleOptions) {
  let findPictureElements: Dynamic = (noteId?: Dynamic): Dynamic => {
      let pictureBody: Dynamic = canvasRootRef.current?.querySelector(
          '[data-testid="mega-shape-body-' + noteId + '"]',
        ),
        pictureImage: Dynamic = pictureBody?.matches("img, video")
          ? pictureBody
          : pictureBody?.querySelector("img, video");
      return pictureBody &&
        pictureImage &&
        pictureImage.dataset.megaPicture === "" &&
        mediaNaturalDimensions(pictureImage)
        ? {
            img: pictureImage,
            body: pictureBody,
          }
        : null;
    },
    isCropFrameChanged: Dynamic = (session?: Dynamic): Dynamic =>
      session.local.x !== 0 ||
      session.local.y !== 0 ||
      session.local.w !== session.pad0.w ||
      session.local.h !== session.pad0.h,
    cropAnnotationFrame: Dynamic = (session?: Dynamic): Dynamic => {
      if (!isCropFrameChanged(session)) return null;
      let cropFrame: Dynamic = rotatedCropFrame(
        session.pad0,
        (session.rot * Math.PI) / 180,
        session.local,
      );
      return {
        x: cropFrame.x - session.edge.l,
        y: cropFrame.y - session.edge.t,
        w: cropFrame.w + session.edge.l + session.edge.r,
        h: cropFrame.h + session.edge.t + session.edge.b,
      };
    },
    beginImageCrop: Dynamic = (annotationId?: Dynamic): Dynamic => {
      if (!findPictureElements(annotationId)) return;
      let flipCheckAnnotation: Dynamic = (getCurrentManifest().annotations ?? []).find(
        (item?: Dynamic): Dynamic => item.id === annotationId,
      );
      if (flipCheckAnnotation && imageFlipCss(flipCheckAnnotation))
        return void onSetMoveSay?.(CropDoesNotWorkWhileThisMessage);
      (0, reactDomVectorToolState.flushSync)(blurBeforeCrop);
      let imageAnnotation: Dynamic = (getCurrentManifest().annotations ?? []).find(
          (item?: Dynamic): Dynamic => item.id === annotationId,
        ),
        picture: Dynamic = findPictureElements(annotationId);
      if (imageAnnotation?.kind !== "image" || !picture) return;
      let naturalSize: Dynamic = mediaNaturalDimensions(
          picture.img,
        ),
        edge: Dynamic = {
          l: picture.body.clientLeft,
          t: picture.body.clientTop,
          r:
            imageAnnotation.w - picture.body.clientLeft - picture.body.clientWidth,
          b:
            imageAnnotation.h - picture.body.clientTop - picture.body.clientHeight,
        },
        localFrame: Dynamic = {
          x: 0,
          y: 0,
          w: picture.body.clientWidth,
          h: picture.body.clientHeight,
        },
        imageStyle: Dynamic = getComputedStyle(picture.img),
        initialCrop: Dynamic =
          imageAnnotation.crop ??
          cropFromObjectStyles(localFrame, naturalSize, {
            fit: imageStyle.objectFit,
            pos: parseObjectPosition(imageStyle.objectPosition),
            box: null,
          });
      setCropSession({
        id: annotationId,
        src: imageAnnotation.src,
        natural: naturalSize,
        rot: annotationRotation(imageAnnotation),
        pad0: {
          x: imageAnnotation.x + edge.l,
          y: imageAnnotation.y + edge.t,
          w: localFrame.w,
          h: localFrame.h,
        },
        edge: edge,
        local: localFrame,
        live: initialCrop,
        before: initialCrop,
      });
    },
    finishImageCrop: Dynamic = useLatestCallback(
      (shouldCommit?: Dynamic): Dynamic => {
        let current: Dynamic = cropSessionRef.current;
        if (!current) return;
        cropSessionRef.current = null;
        setCropSession(null);
        let cropTarget: Dynamic = (getCurrentManifest().annotations ?? []).find(
            (item?: Dynamic): Dynamic => item.id === current.id,
          ),
          normalizedCrop: Dynamic = normalizeCenteredImageCrop(
            current.local,
            current.natural,
            current.live,
          ),
          isFrameChanged: Dynamic = isCropFrameChanged(current);
        if (
          !shouldCommit ||
          cropTarget?.kind !== "image" ||
          cropTarget.src !== current.src ||
          (!isFrameChanged &&
            sameImageCrop(
              normalizedCrop,
              normalizeCenteredImageCrop(
                current.pad0,
                current.natural,
                current.before,
              ),
            ))
        )
          return;
        let { "object-position": objectPositionUnused, ...cssRest }: Dynamic =
            cropTarget.css ?? {},
          frameUpdate: Dynamic = cropAnnotationFrame(current);
        updateAnnotation(
          current.id,
          (source?: Dynamic): Dynamic =>
            source.kind === "image"
              ? updateAnnotationCrop(
                  {
                    ...updateAnnotationCss(source, {
                      ...cssRest,
                      "object-fit": "cover",
                    }),
                    ...frameUpdate,
                  },
                  normalizedCrop,
                )
              : source,
          true,
        );
        announce(
          normalizedCrop || isFrameChanged ? "Cropped." : uiMessage("canvas.interactionLayer.cropRemoved"),
        );
      },
    ),
    cropAnnotation: Dynamic = cropSession
      ? (manifest.annotations ?? []).find(
          (item?: Dynamic): Dynamic => item.id === cropSession.id,
        )
      : undefined,
    shouldCancelCrop: Dynamic =
      cropSession !== null &&
      (!canEditCanvas ||
        cropAnnotation?.kind !== "image" ||
        cropAnnotation.src !== cropSession.src),
    shouldCommitCrop: Dynamic =
      cropSession !== null &&
      (singleSelectedNoteId !== cropSession.id ||
        supportsClickPlacement(armedTool) ||
        armedTool === "draw" ||
        fullscreenFile != null);
  (0, React.useEffect)((): Dynamic => {
    shouldCancelCrop ? finishImageCrop(false) : shouldCommitCrop && finishImageCrop(true);
  }, [shouldCancelCrop, shouldCommitCrop, finishImageCrop]);
  return { findPictureElements, cropAnnotationFrame, beginImageCrop, finishImageCrop, cropAnnotation };
}
