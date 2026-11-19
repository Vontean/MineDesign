/** Restored application module; prepare first, initialize in original order. */
import {
  type Dynamic,
} from "../../runtime-types";

var StyleValue: Dynamic;
var InsertFileDropsConstant: Dynamic;
function createDropMarker(src?: Dynamic): Dynamic {
  return `${src}#drop${++InsertFileDropsConstant}`;
}
async function insertUploadedFiles(dropRequest?: Dynamic): Promise<Dynamic> {
  let {
      files: files,
      targets: targets,
      upload: upload,
      preview: loadPreview,
      patch: applyPatch,
      relocate: relocateTarget,
      relocateByMarker: relocateByMarker,
      markerCleanupAttrs: markerCleanupAttrs,
      placeholderSrc: placeholderSrc,
      swapOverPlaceholder: swapOverPlaceholder,
      readSrc: readSrc,
      onSettled: onSettled,
      onStage: onStage,
      preApplied: preApplied,
      previewAttrs: previewAttrs,
      revertAttrs: revertAttrs,
      yieldCleanupAttrs: yieldCleanupAttrs,
      insertPinned: insertPinned,
    }: Dynamic = dropRequest,
    startTime: Dynamic = Date.now(),
    reportStage: Dynamic = (
      stage?: Dynamic,
      didSucceed?: Dynamic,
      fileIndex?: Dynamic,
    ): Dynamic => {
      try {
        onStage?.(stage, didSucceed, Date.now() - startTime, fileIndex);
      } catch {}
    },
    getYieldAttrs: Dynamic = (fileIndex?: Dynamic): Dynamic =>
      typeof yieldCleanupAttrs == "function"
        ? yieldCleanupAttrs(fileIndex)
        : (yieldCleanupAttrs ?? {
            width: null,
            height: null,
          }),
    failureCount: Dynamic = 0;
  await Promise.all(
    files.map(
      async (file?: Dynamic, fileIndex?: Dynamic): Promise<Dynamic> => {
        let target: Dynamic = targets[fileIndex];
        if (target == null) return;
        let previewSrc: Dynamic = preApplied?.[fileIndex]?.src ?? null,
          applyToTarget: Dynamic = (patchData?: Dynamic): Dynamic => {
            if (applyPatch(target, patchData)) return true;
            let relocatedTarget: Dynamic = previewSrc == null ? null : relocateTarget(previewSrc);
            relocatedTarget ??= relocateByMarker?.(fileIndex) ?? null;
            return relocatedTarget == null
              ? false
              : ((target = relocatedTarget), applyPatch(relocatedTarget, patchData));
          },
          isUploadSettled: Dynamic = false;
        previewSrc != null
          ? reportStage("preview", true, fileIndex)
          : loadPreview(file)
              .then((previewImage?: Dynamic): Dynamic => {
                if (previewImage != null && !isUploadSettled) {
                  let previewMarker: Dynamic = createDropMarker(previewImage.url),
                    previewPatch: Dynamic = previewAttrs?.(previewImage, fileIndex) ?? {
                      width: String(previewImage.width),
                      height: String(previewImage.height),
                    };
                  applyToTarget({
                    ...previewPatch,
                    src: previewMarker,
                  }) && (previewSrc = previewMarker);
                  reportStage("preview", previewSrc != null, fileIndex);
                } else isUploadSettled || reportStage("preview", false, fileIndex);
              })
              .catch((): Dynamic => {
                reportStage("preview", false, fileIndex);
              });
        try {
          let { src: uploadedSrc, base: altText }: Dynamic = await upload(file);
          isUploadSettled = true;
          let markerTarget: Dynamic = relocateByMarker?.(fileIndex);
          markerTarget != null && (target = markerTarget);
          let markerAttrs: Dynamic = markerCleanupAttrs?.(fileIndex) ?? {},
            successState: Dynamic = {
              ...markerAttrs,
              src: uploadedSrc,
              alt: altText,
            };
          previewSrc != null && onSettled?.(previewSrc, successState);
          let currentSrc: Dynamic = readSrc(target);
          currentSrc == null ||
          currentSrc === previewSrc ||
          (((swapOverPlaceholder ?? true) || previewSrc == null) && currentSrc === placeholderSrc)
            ? reportStage("swap", applyToTarget(successState), fileIndex)
            : previewSrc != null || (insertPinned?.(fileIndex) ?? false)
              ? (applyToTarget({
                  ...getYieldAttrs(fileIndex),
                  ...markerAttrs,
                }),
                reportStage("swap", true, fileIndex))
              : (Object.keys(markerAttrs).length > 0 && applyToTarget(markerAttrs),
                reportStage("swap", true, fileIndex));
        } catch (uploadError: Dynamic) {
          isUploadSettled = true;
          try {
            let markerTarget: Dynamic = relocateByMarker?.(fileIndex);
            markerTarget != null && (target = markerTarget);
            let markerAttrs: Dynamic = markerCleanupAttrs?.(fileIndex) ?? {},
              revertState: Dynamic = {
                width: null,
                height: null,
                ...(typeof revertAttrs == "function"
                  ? revertAttrs(fileIndex)
                  : revertAttrs),
                ...markerAttrs,
                src: placeholderSrc,
              };
            previewSrc != null && onSettled?.(previewSrc, revertState);
            let currentSrc: Dynamic = readSrc(target);
            currentSrc == null ||
            currentSrc === previewSrc ||
            (previewSrc == null && currentSrc === placeholderSrc)
              ? reportStage("revert", applyToTarget(revertState), fileIndex)
              : previewSrc != null || (insertPinned?.(fileIndex) ?? false)
                ? (applyToTarget({
                    ...getYieldAttrs(fileIndex),
                    ...markerAttrs,
                  }),
                  reportStage("revert", true, fileIndex))
                : (Object.keys(markerAttrs).length > 0 && applyToTarget(markerAttrs),
                  reportStage("revert", true, fileIndex));
          } catch (revertError: Dynamic) {
            console.error("[dc-editor] image drop revert failed:", revertError);
            reportStage("revert", false, fileIndex);
          }
          failureCount += 1;
          console.error("[dc-editor] image drop upload failed:", uploadError);
        }
      },
    ),
  );
  return failureCount;
}
export {
  createDropMarker,
  InsertFileDropsConstant,
  insertUploadedFiles,
  StyleValue,
};
export function installEditorInsertFileDrops(): () => void {
  return () => {
    StyleValue = "style.";
    InsertFileDropsConstant = 0;
  };
}
