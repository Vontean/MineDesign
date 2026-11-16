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
    let callback15: Dynamic = (event?: Dynamic): Dynamic => {
        if (event.defaultPrevented) return;
        if (event.key === "Escape") {
          if ((0, hasBlockingEditorOverlay)() || deps.value220) return;
          event.preventDefault();
          deps.value389();
          return;
        }
        let value653: Dynamic =
          event.key === "ArrowRight" || event.key === "PageDown"
            ? 1
            : event.key === "ArrowLeft" || event.key === "PageUp"
              ? -1
              : 0;
        value653 === 0 ||
          event.repeat ||
          event.metaKey ||
          event.ctrlKey ||
          event.altKey ||
          event.shiftKey ||
          (0, hasBlockingEditorOverlay)() ||
          (0, isEditingInputTarget)(event.target) ||
          (0, isInteractivePreviewTarget)(event.target) ||
          (event.preventDefault(), deps.value391(value653));
      },
      callback16: Dynamic = (dataset?: Dynamic): Dynamic => {
        let data: Dynamic = dataset.data;
        if (!(!data || typeof data != "object")) {
          if (data.__om_escape === 1) {
            [...deps.value177.current.values()].some(
              (input?: Dynamic): Dynamic =>
                dataset.source !== null &&
                input.webviewRef.current?.contentWindow === dataset.source,
            ) && deps.value389();
            return;
          }
          if (data.__om_step === 1 || data.__om_step === -1) {
            if (
              navigator.userActivation?.isActive !== true ||
              (0, hasBlockingEditorOverlay)()
            )
              return;
            let activeElement: Dynamic = (document as Dynamic).activeElement,
              value653: Dynamic = [...deps.value177.current.entries()].find(
                ([, input]: Dynamic): Dynamic =>
                  input.webviewRef.current === activeElement &&
                  (0, isPreviewMessage)(
                    dataset,
                    input.webviewRef.current,
                  ),
              );
            if (
              !value653 ||
              deps.value87.current.artboards.find(
                (input?: Dynamic): Dynamic => input.file === value653[0],
              )?.is_interactive === true
            )
              return;
            parallelCanvasCaptureSemaphore.take() &&
              deps.value391(data.__om_step) &&
              (deps.value393.current = data.__om_step);
          }
        }
      };
    (window as Dynamic).addEventListener("keydown", callback15);
    (window as Dynamic).addEventListener("message", callback16);
    return (): Dynamic => {
      (window as Dynamic).removeEventListener("keydown", callback15);
      (window as Dynamic).removeEventListener("message", callback16);
    };
  }

/** 监听预览 iframe 发出的 __om_open 消息：在用户手势下把链接指向的画板打开为全屏播放，必要时切换页面。 */
export function subscribePreviewOpenMessages(deps: { readonly setSelection: Dynamic; readonly value105: Dynamic; readonly value177: Dynamic; readonly value224: Dynamic; readonly value225: Dynamic; readonly value271: Dynamic; readonly value274: Dynamic; readonly value285: Dynamic; readonly value291: Dynamic; readonly value298: Dynamic; readonly value345: Dynamic; readonly value346: Dynamic; readonly value348: Dynamic; readonly value382: Dynamic; readonly value384: Dynamic; readonly value393: Dynamic; readonly value62: Dynamic; readonly value73: Dynamic; readonly value80: Dynamic }): Dynamic {
    let callback15: Dynamic = (dataset?: Dynamic): Dynamic => {
      let data: Dynamic = dataset.data;
      if (
        !data ||
        typeof data != "object" ||
        typeof data.__om_open != "string" ||
        data.__om_open.length > 1024
      )
        return;
      let value653: Dynamic = (0, stripPreviewProjectRoot)(
        data.__om_open,
        dataset.source,
      );
      if (navigator.userActivation?.isActive !== true || deps.value285.current)
        return;
      let value654: Dynamic = [...deps.value177.current.entries()].find(
        ([, input]: Dynamic): Dynamic =>
          (0, isPreviewMessage)(dataset, input.webviewRef.current),
      );
      if (!value654 || value654[0] === value653) return;
      let value655: Dynamic =
        !deps.value345.current && value654[0] === deps.value271.current;
      if (
        (deps.value224.current || deps.value225.current) &&
        !deps.value345.current &&
        !value655
      )
        return;
      let current4: Dynamic = deps.value73.current,
        value656: Dynamic = value653,
        value657: Dynamic = current4.artboards.find(
          (input?: Dynamic): Dynamic => input.file === value656,
        );
      if (
        !value657 ||
        value657.file === deps.value346.current ||
        !singleCanvasCaptureSemaphore.take()
      )
        return;
      let value658: Dynamic = (0, designPageId)(
          value657,
          current4.pages,
        ),
        value659: Dynamic = value658 !== deps.value80.current;
      if (value655) {
        if (value657.frameless) return;
        deps.value384(value657.file, value659 ? value658 : undefined);
        value659 || deps.value382.current(value657.file);
        return;
      }
      let flag2: Dynamic = false;
      value659
        ? (deps.value298(value658, flag2 ? value657.file : undefined),
          (deps.value291.current = false))
        : flag2 &&
          (deps.value62(),
          deps.setSelection(emptyCanvasSelection),
          deps.value274.current(value657.file));
      !flag2 &&
        value654[1].webviewRef.current ===
          (document as Dynamic).activeElement &&
        (deps.value393.current = 1);
      deps.value348(
        (input?: Dynamic): Dynamic => ({
          file: value657.file,
          prev:
            input?.prev ??
            (value659
              ? ((0, recallCanvasView)(value658) ??
                defaultCanvasCamera)
              : deps.value105.get()),
          fit: artboardIsNotExpandedFill(value657),
        }),
      );
    };
    (window as Dynamic).addEventListener("message", callback15);
    return (): Dynamic =>
      (window as Dynamic).removeEventListener("message", callback15);
  }
