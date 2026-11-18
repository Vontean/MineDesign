import { designPageId } from "../../platform/file-content";
import { emptyCanvasSelection } from "../../editor/selection/canvas-selection";
import { hasBlockingEditorOverlay } from "../../editor/text/typing-target";
import { isEditingInputTarget } from "../../editor/keyboard/find";
import { isInteractivePreviewTarget } from "../preview-navigation";
import { isPreviewMessage } from "../../platform/file-content";
import { recallCanvasView } from "../viewport-memory";
import { stripPreviewProjectRoot } from "../../preview/project-root";
import { type Dynamic } from "../../runtime-types";
import { artboardIsNotExpandedFill, defaultCanvasCamera, parallelCanvasCaptureSemaphore, singleCanvasCaptureSemaphore } from "../design-canvas";

/** 全屏播放画板时注册：Escape 退出播放，方向键/翻页键或预览发来的 __om_step 切换上一个/下一个画板。 */
export function subscribePlayModeKeys(deps: { readonly flag: Dynamic; readonly value177: Dynamic; readonly value220: Dynamic; readonly value347: Dynamic; readonly value389: Dynamic; readonly value391: Dynamic; readonly value393: Dynamic; readonly value87: Dynamic }): Dynamic {
    if (deps.value347 == null || deps.flag) return;
    let handleKeyDown: Dynamic = (event?: Dynamic): Dynamic => {
        if (event.defaultPrevented) return;
        if (event.key === "Escape") {
          if (hasBlockingEditorOverlay() || deps.value220) return;
          event.preventDefault();
          deps.value389();
          return;
        }
        let stepDirection: Dynamic =
          event.key === "ArrowRight" || event.key === "PageDown"
            ? 1
            : event.key === "ArrowLeft" || event.key === "PageUp"
              ? -1
              : 0;
        stepDirection === 0 ||
          event.repeat ||
          event.metaKey ||
          event.ctrlKey ||
          event.altKey ||
          event.shiftKey ||
          hasBlockingEditorOverlay() ||
          isEditingInputTarget(event.target) ||
          isInteractivePreviewTarget(event.target) ||
          (event.preventDefault(), deps.value391(stepDirection));
      },
      handleMessage: Dynamic = (messageEvent?: Dynamic): Dynamic => {
        let messageData: Dynamic = messageEvent.data;
        if (!(!messageData || typeof messageData != "object")) {
          if (messageData.__om_escape === 1) {
            [...deps.value177.current.values()].some(
              (frame?: Dynamic): Dynamic =>
                messageEvent.source !== null &&
                frame.webviewRef.current?.contentWindow === messageEvent.source,
            ) && deps.value389();
            return;
          }
          if (messageData.__om_step === 1 || messageData.__om_step === -1) {
            if (
              navigator.userActivation?.isActive !== true ||
              hasBlockingEditorOverlay()
            )
              return;
            let activeElement: Dynamic = (document as Dynamic).activeElement,
              focusedEntry: Dynamic = [...deps.value177.current.entries()].find(
                ([, frame]: Dynamic): Dynamic =>
                  frame.webviewRef.current === activeElement &&
                  isPreviewMessage(
                    messageEvent,
                    frame.webviewRef.current,
                  ),
              );
            if (
              !focusedEntry ||
              deps.value87.current.artboards.find(
                (artboard?: Dynamic): Dynamic => artboard.file === focusedEntry[0],
              )?.is_interactive === true
            )
              return;
            parallelCanvasCaptureSemaphore.take() &&
              deps.value391(messageData.__om_step) &&
              (deps.value393.current = messageData.__om_step);
          }
        }
      };
    (window as Dynamic).addEventListener("keydown", handleKeyDown);
    (window as Dynamic).addEventListener("message", handleMessage);
    return (): Dynamic => {
      (window as Dynamic).removeEventListener("keydown", handleKeyDown);
      (window as Dynamic).removeEventListener("message", handleMessage);
    };
  }

/** 监听预览 iframe 发出的 __om_open 消息：在用户手势下把链接指向的画板打开为全屏播放，必要时切换页面。 */
export function subscribePreviewOpenMessages(deps: { readonly setSelection: Dynamic; readonly value105: Dynamic; readonly value177: Dynamic; readonly value224: Dynamic; readonly value225: Dynamic; readonly value271: Dynamic; readonly value274: Dynamic; readonly value285: Dynamic; readonly value291: Dynamic; readonly value298: Dynamic; readonly value345: Dynamic; readonly value346: Dynamic; readonly value348: Dynamic; readonly value382: Dynamic; readonly value384: Dynamic; readonly value393: Dynamic; readonly value62: Dynamic; readonly value73: Dynamic; readonly value80: Dynamic }): Dynamic {
    let handleOpenMessage: Dynamic = (messageEvent?: Dynamic): Dynamic => {
      let messageData: Dynamic = messageEvent.data;
      if (
        !messageData ||
        typeof messageData != "object" ||
        typeof messageData.__om_open != "string" ||
        messageData.__om_open.length > 1024
      )
        return;
      let linkedFile: Dynamic = stripPreviewProjectRoot(
        messageData.__om_open,
        messageEvent.source,
      );
      if (navigator.userActivation?.isActive !== true || deps.value285.current)
        return;
      let sourceEntry: Dynamic = [...deps.value177.current.entries()].find(
        ([, frame]: Dynamic): Dynamic =>
          isPreviewMessage(messageEvent, frame.webviewRef.current),
      );
      if (!sourceEntry || sourceEntry[0] === linkedFile) return;
      let isPlayingFromSource: Dynamic =
        !deps.value345.current && sourceEntry[0] === deps.value271.current;
      if (
        (deps.value224.current || deps.value225.current) &&
        !deps.value345.current &&
        !isPlayingFromSource
      )
        return;
      let manifest: Dynamic = deps.value73.current,
        targetFile: Dynamic = linkedFile,
        targetArtboard: Dynamic = manifest.artboards.find(
          (artboard?: Dynamic): Dynamic => artboard.file === targetFile,
        );
      if (
        !targetArtboard ||
        targetArtboard.file === deps.value346.current ||
        !singleCanvasCaptureSemaphore.take()
      )
        return;
      let targetPageId: Dynamic = designPageId(
          targetArtboard,
          manifest.pages,
        ),
        isPageChange: Dynamic = targetPageId !== deps.value80.current;
      if (isPlayingFromSource) {
        if (targetArtboard.frameless) return;
        deps.value384(targetArtboard.file, isPageChange ? targetPageId : undefined);
        isPageChange || deps.value382.current(targetArtboard.file);
        return;
      }
      let shouldSelectTarget: Dynamic = false;
      isPageChange
        ? (deps.value298(targetPageId, shouldSelectTarget ? targetArtboard.file : undefined),
          (deps.value291.current = false))
        : shouldSelectTarget &&
          (deps.value62(),
          deps.setSelection(emptyCanvasSelection),
          deps.value274.current(targetArtboard.file));
      !shouldSelectTarget &&
        sourceEntry[1].webviewRef.current ===
          (document as Dynamic).activeElement &&
        (deps.value393.current = 1);
      deps.value348(
        (previousView?: Dynamic): Dynamic => ({
          file: targetArtboard.file,
          prev:
            previousView?.prev ??
            (isPageChange
              ? (recallCanvasView(targetPageId) ??
                defaultCanvasCamera)
              : deps.value105.get()),
          fit: artboardIsNotExpandedFill(targetArtboard),
        }),
      );
    };
    (window as Dynamic).addEventListener("message", handleOpenMessage);
    return (): Dynamic =>
      (window as Dynamic).removeEventListener("message", handleOpenMessage);
  }
