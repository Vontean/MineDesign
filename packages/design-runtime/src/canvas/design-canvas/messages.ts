import { uiMessage } from "@minedesign/contracts/ui-messages";
import type { Dynamic } from "../../runtime-types";

/**
 * 画布的提示文案。
 *
 * 这些是 `export let`：由入口的 installCanvasDesignCanvas 在启动时调用 installCanvasMessages() 按当前语言赋值，
 * 使用方在调用时读取（ESM live binding），所以不能改成导入时求值的常量。
 */
export let canvasNeedsPageMessage: Dynamic;
export let fitArtboardsLabel: Dynamic;
export let loosePieceRenameHint: Dynamic;
export let staleDeleteFailureMessage: Dynamic;
export let singleArtboardPngCopyMessage: Dynamic;
export let singleArtboardSvgCopyMessage: Dynamic;
export let staticArtboardPlaybackMessage: Dynamic;
export let loosePiecePlaybackMessage: Dynamic;
export let pageHasNoArtboardsMessage: Dynamic;
export let existingThumbnailMessage: Dynamic;
export let oversizedThumbnailMessage: Dynamic;
export let exportAlreadyRunningMessage: Dynamic;

export function installCanvasMessages(): void {
  canvasNeedsPageMessage = uiMessage("canvas.designCanvas.aCanvasNeedsAtLeast");
  fitArtboardsLabel = uiMessage("canvas.designCanvas.fitArtboards");
  loosePieceRenameHint =
    uiMessage("canvas.designCanvas.aLoosePieceShowsNo");
  staleDeleteFailureMessage = (input?: Dynamic): Dynamic =>
    uiMessage("canvas.designCanvas.nothingWasDeleted") + input + "” is now the only page.";
  singleArtboardPngCopyMessage =
    uiMessage("canvas.designCanvas.selectJustOneArtboardTo");
  singleArtboardSvgCopyMessage =
    uiMessage("canvas.designCanvas.selectJustOneArtboardTo2");
  staticArtboardPlaybackMessage =
    uiMessage("canvas.designCanvas.onlyPrototypeArtboardsMarkedInteractive");
  loosePiecePlaybackMessage =
    uiMessage("canvas.designCanvas.aLoosePieceDoesnT");
  pageHasNoArtboardsMessage = uiMessage("canvas.designCanvas.thisPageHasNoArtboards");
  existingThumbnailMessage = uiMessage("canvas.designCanvas.thisArtboardIsAlreadyThe");
  oversizedThumbnailMessage =
    uiMessage("canvas.designCanvas.thisArtboardIsTooLarge");
  exportAlreadyRunningMessage =
    uiMessage("canvas.designCanvas.anotherExportIsStillRunning");
}
