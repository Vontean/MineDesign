import { canvasShapeReact as React } from "../../canvas/shape";
import { useDownloadsWithheld } from "../../export/downloads";
import { captureArtboardThumbnail, exportArtboardImage } from "../../export/image";
import { useClipboardFeatureFlag } from "../clipboard/working-files";
import { useProgressCursor } from "../hooks/alternate-cursor";
import { setPickerSelection } from "../picker/bridge";
import type { Dynamic } from "../../runtime-types";

/** 持有选区图片导出的状态、并发锁及导出请求。 */
export function useSelectionImageExport(
  selection: Dynamic,
  selectionRef: Dynamic,
  filePathRef: Dynamic,
  getPreviewFrame: Dynamic,
  exportTitle: Dynamic,
) {
  let [pendingExportFormat, setPendingExportFormat]: Dynamic = (0, React.useState)(
      null,
    ),
    isCopyingImageRef: Dynamic = (0, React.useRef)(false),
    [isCopyingImage, setIsCopyingImage]: Dynamic = (0, React.useState)(
      false,
    );
  useProgressCursor(pendingExportFormat != null || isCopyingImage);
  let [exportImageError, setExportImageError]: Dynamic = (0, React.useState)(
      null,
    ),
    areDownloadsWithheld: Dynamic = useDownloadsWithheld(),
    isClipboardFeatureEnabled: Dynamic = useClipboardFeatureFlag(),
    [isExportSectionOpen, setIsExportSectionOpen]: Dynamic = (0, React.useState)(
      false,
    ),
    [exportImageFormat, setExportImageFormat]: Dynamic = (0, React.useState)(
      "png",
    ),
    [exportImageScale, setExportImageScale]: Dynamic = (0, React.useState)(2),
    [exportImagePreview, setExportImagePreview]: Dynamic = (0, React.useState)(
      null,
    ),
    exportPreviewRequestRef: Dynamic = (0, React.useRef)(0);
  (0, React.useEffect)((): Dynamic => {
    setExportImageError(null);
  }, [selection]);
  let exportSelectedImage: Dynamic = (0, React.useCallback)(
      async (requestedFormat?: Dynamic, requestedScale?: Dynamic): Promise<Dynamic> => {
        let selectedElements: Dynamic = selectionRef.current,
          previewFrame: Dynamic = getPreviewFrame();
        if (!(pendingExportFormat || isCopyingImageRef.current || !selectedElements || !previewFrame)) {
          if (areDownloadsWithheld) {
            setExportImageError("withheld");
            return;
          }
          setPendingExportFormat(requestedFormat);
          setExportImageError(null);
          try {
            let exportOutcome: Dynamic = await exportArtboardImage(
              previewFrame,
              filePathRef.current,
              requestedFormat,
              requestedScale,
              {
                onBeforeCapture: (): Dynamic =>
                  setPickerSelection(
                    previewFrame,
                    selectedElements.tids,
                    selectedElements.name,
                  ),
                title: exportTitle,
              },
            );
            exportOutcome.ok && exportOutcome.saveOutcome === "withheld"
              ? setExportImageError("withheld")
              : exportOutcome.ok || setExportImageError("stale");
          } catch (exportError: Dynamic) {
            console.error("[selection-export] failed:", exportError);
            setExportImageError("failed");
          } finally {
            setPendingExportFormat(null);
          }
        }
      },
      [pendingExportFormat, getPreviewFrame, areDownloadsWithheld, exportTitle],
    );
  return {
    pendingExportFormat, isCopyingImageRef, setIsCopyingImage,
    exportImageError, areDownloadsWithheld, isClipboardFeatureEnabled,
    isExportSectionOpen, setIsExportSectionOpen, exportImageFormat, setExportImageFormat,
    exportImageScale, setExportImageScale, exportImagePreview, setExportImagePreview,
    exportPreviewRequestRef, exportSelectedImage,
  };
}

/** 与原预览 effect 保持同一挂载位置，取消过期请求。 */
export function useSelectionImagePreview(
  isExportSectionOpen: Dynamic,
  selection: Dynamic,
  editorMode: Dynamic,
  getPreviewFrame: Dynamic,
  exportPreviewRequestRef: Dynamic,
  setExportImagePreview: Dynamic,
): void {
  (0, React.useEffect)((): Dynamic => {
    let exportPreviewRequest: Dynamic = ++exportPreviewRequestRef.current;
    if (!isExportSectionOpen || !selection) {
      setExportImagePreview(null);
      return;
    }
    setExportImagePreview("pending");
    let exportPreviewTimeout: Dynamic = setTimeout((): Dynamic => {
      let previewFrame: Dynamic = getPreviewFrame();
      if (!previewFrame) {
        exportPreviewRequest === exportPreviewRequestRef.current && setExportImagePreview("empty");
        return;
      }
      setPickerSelection(previewFrame, selection.tids, selection.name);
      captureArtboardThumbnail(previewFrame).then(
        (captureResult?: Dynamic): Dynamic => {
          exportPreviewRequest === exportPreviewRequestRef.current &&
            setExportImagePreview(
              captureResult.ok
                ? {
                    url: captureResult.url,
                  }
                : "empty",
            );
        },
      );
    }, 300);
    return (): Dynamic => clearTimeout(exportPreviewTimeout);
  }, [isExportSectionOpen, selection, editorMode, getPreviewFrame]);
}
