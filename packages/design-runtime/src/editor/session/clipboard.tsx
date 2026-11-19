import { AccessibilityAnnouncementsLabel_10 as pasteHereMessage } from "../accessibility/announcements";
import { AccessibilityAnnouncementsLabel_2 as copiedAsPngMessage } from "../accessibility/announcements";
import { AccessibilityAnnouncementsLabel_3 as copiedAsSvgMessage } from "../accessibility/announcements";
import { AccessibilityAnnouncementsLabel_4 as conversionFailedMessage } from "../accessibility/announcements";
import { AccessibilityAnnouncementsLabel_5 as exportStillRunningMessage } from "../accessibility/announcements";
import { AccessibilityAnnouncementsLabel_6 as notSelectedAnywhereMessage } from "../accessibility/announcements";
import { AccessibilityAnnouncementsLabel_7 as noWidthOrHeightMessage } from "../accessibility/announcements";
import { DownloadsArenTAvailableToYouForMessage } from "../../export/downloads";
import { InspectorEditorEvery } from "../inspector/editor";
import { ItsPictureCouldnTBeMadeTryMessage } from "../accessibility/announcements";
import { SelectionActionsHelmetScHelmetPattern } from "../selection/actions";
import { allowsClipboardImages } from "../clipboard/png-copy";
import { announce } from "../accessibility/announcer";
import { captureArtboardImage } from "../../export/image";
import { captureClipboardSvg } from "../clipboard/svg-copy";
import { clearClipboardBuffers } from "../clipboard/state";
import { clipboardGeneration } from "../clipboard/state";
import { createCurrentWorkingGeneration } from "../clipboard/working-files";
import { emptyClipboardMessage } from "../accessibility/announcements";
import { errorMessage } from "../../platform/rate-limiter";
import { keyboardShortcutLabel } from "../keyboard/shortcuts";
import { missingCopiedImagesMessage } from "../accessibility/announcements";
import { missingSvgImagesMessage } from "../accessibility/announcements";
import { pngCopyFailureMessage } from "../accessibility/announcements";
import { pngDataUrlToBlob } from "../clipboard/png-copy";
import { positionPastedHtml } from "../clipboard/html-placement";
import { sanitizePastedHtml } from "../clipboard/html-sanitization";
import { setPickerSelection } from "../picker/bridge";
import { svgCopyErrorMessage } from "../clipboard/svg-copy";
import { svgCopyFailureMessage } from "../accessibility/announcements";
import { textToParagraphHtml } from "../insert/targets";
import { type Dynamic } from "../../runtime-types";
import { wrapInlinePastedHtml } from "../insert/drop-targets";
import { writeClipboardPng } from "../clipboard/png-copy";
import { writeClipboardSvg } from "../clipboard/svg-copy";

/** 右键菜单选择“粘贴到此处”时运行：读取剪贴板文本或 HTML，清洗后包装为可插入的片段，按点击位置定位并插入当前画板，空剪贴板时提示。 */
export async function pasteClipboardAtPoint(deps: { readonly insertAtPoint: Dynamic; readonly modelRef: Dynamic; readonly readOnlyRef: Dynamic; readonly rootName: Dynamic; readonly showToast: Dynamic; readonly value105: Dynamic; readonly value106: Dynamic; readonly value166: Dynamic; readonly value49: Dynamic; readonly value50: Dynamic; readonly value61: Dynamic; readonly value62: Dynamic; readonly value67: Dynamic }, point?: Dynamic): Promise<Dynamic> {
        if (deps.readOnlyRef.current || !deps.insertAtPoint) return;
        let clipboardContent: Dynamic = await deps.value166();
        if (!clipboardContent || deps.readOnlyRef.current || !deps.value61.current) return;
        let { text: text, foreign: isForeign }: Dynamic = clipboardContent;
        if (!text)
          return void deps.showToast(
            emptyClipboardMessage(
              keyboardShortcutLabel("V"),
            ),
          );
        let wrappedHtml: Dynamic = text.startsWith("<")
            ? wrapInlinePastedHtml(
                isForeign
                  ? sanitizePastedHtml(text)
                  : text,
              )
            : null,
          model: Dynamic = deps.modelRef.current.state(deps.rootName)?.model,
          topLevelCount: Dynamic =
            wrappedHtml != null && model
              ? model
                  .topLevelTags(wrappedHtml)
                  .filter(
                    (tag?: Dynamic): Dynamic =>
                      !SelectionActionsHelmetScHelmetPattern.test(
                        tag,
                      ),
                  ).length
              : 1;
        if (topLevelCount === 0)
          return void deps.showToast(
            emptyClipboardMessage(
              keyboardShortcutLabel("V"),
            ),
          );
        if (topLevelCount > 1)
          return void deps.showToast(pasteHereMessage);
        let insertedTids: Dynamic = await deps.insertAtPoint(
            point,
            (offsetX?: Dynamic, offsetY?: Dynamic): Dynamic =>
              wrappedHtml != null
                ? positionPastedHtml(wrappedHtml, {
                    ox: offsetX,
                    oy: offsetY,
                  })
                : textToParagraphHtml(
                    text,
                    `margin: 0; position: absolute; left: ${offsetX}px; top: ${offsetY}px`,
                  ),
            (): Dynamic => deps.value61.current && !deps.readOnlyRef.current,
          ),
          modelState: Dynamic = deps.modelRef.current.state(deps.rootName);
        if (!insertedTids?.length || !modelState || !deps.value61.current) return;
        let pickerTarget: Dynamic = deps.value67(),
          pushResult: Dynamic = deps.value106(modelState, insertedTids);
        deps.value105(deps.rootName, insertedTids);
        pushResult && (deps.value62.current = deps.value50.current);
        pickerTarget &&
          setTimeout((): Dynamic => {
            let current: Dynamic = deps.value49.current;
            current?.name === deps.rootName &&
              InspectorEditorEvery(current.tids, insertedTids) &&
              setPickerSelection(pickerTarget, insertedTids, deps.rootName);
          }, 60);
      }

/** 选择“复制为 PNG”时运行：截取所选元素的画面并写入系统剪贴板，处理尺寸为零、截图失败、图片缺失与浏览器拒绝等情况并给出提示和播报。 */
export function copySelectionAsPngImage(deps: { readonly rootName: Dynamic; readonly showToast: Dynamic; readonly value67: Dynamic; readonly value70: Dynamic; readonly value72: Dynamic; readonly value74: Dynamic }, tids?: Dynamic): Dynamic {
        let pickerTarget: Dynamic = deps.value67();
        if (!pickerTarget || tids.length !== 1) return;
        if (deps.value72.current || deps.value70)
          return void deps.showToast(exportStillRunningMessage);
        deps.value72.current = true;
        deps.value74(true);
        let copyGeneration: Dynamic = clipboardGeneration(),
          isSameWorkingGeneration: Dynamic = createCurrentWorkingGeneration(),
          failureMessage: Dynamic = null,
          isClipboardImagesBlocked: Dynamic = false,
          missingImageCount: Dynamic = 0,
          pngBlobPromise: Dynamic = (async (): Promise<Dynamic> => {
            try {
              if (!(await allowsClipboardImages())) {
                isClipboardImagesBlocked = true;
                return null;
              }
              let capture: Dynamic = await captureArtboardImage(
                pickerTarget,
                "png",
                2,
                {
                  onBeforeCapture: (): Dynamic =>
                    setPickerSelection(
                      pickerTarget,
                      [...tids],
                      deps.rootName,
                    ),
                },
              ).catch(
                (error?: Dynamic): Dynamic => (
                  (failureMessage = errorMessage(error)),
                  null
                ),
              );
              return capture
                ? capture.ok
                  ? ((missingImageCount = capture.embedWarningCount),
                    clipboardGeneration() === copyGeneration &&
                    isSameWorkingGeneration()
                      ? pngDataUrlToBlob(capture.uri)
                      : null)
                  : ((failureMessage =
                      capture.softError === "zero-size"
                        ? noWidthOrHeightMessage
                        : notSelectedAnywhereMessage),
                    null)
                : null;
            } catch (error: Dynamic) {
              console.error("[copy-png] element", error);
              failureMessage = ItsPictureCouldnTBeMadeTryMessage;
              return null;
            } finally {
              deps.value72.current = false;
              deps.value74(false);
            }
          })();
        writeClipboardPng(pngBlobPromise).then(
          (writeResult?: Dynamic): Dynamic => {
            clipboardGeneration() !== copyGeneration ||
              !isSameWorkingGeneration() ||
              (writeResult === "copied"
                ? (clearClipboardBuffers(),
                  announce(
                    copiedAsPngMessage,
                  ),
                  missingImageCount > 0 &&
                    deps.showToast(
                      missingCopiedImagesMessage(missingImageCount),
                      "info",
                    ))
                : isClipboardImagesBlocked
                  ? deps.showToast(DownloadsArenTAvailableToYouForMessage)
                  : deps.showToast(
                      pngCopyFailureMessage(
                        "element",
                        writeResult === "refused" ? null : failureMessage,
                      ),
                      "error",
                    ));
          },
        );
      }

/** 选择“复制为 SVG”时运行：把所选元素导出为 SVG 并写入系统剪贴板，处理无选中、尺寸为零、图片缺失与浏览器拒绝等情况并给出提示和播报。 */
export function copySelectionAsSvgMarkup(deps: { readonly rootName: Dynamic; readonly showToast: Dynamic; readonly value67: Dynamic; readonly value70: Dynamic; readonly value72: Dynamic; readonly value74: Dynamic }, tids?: Dynamic): Dynamic {
        let pickerTarget: Dynamic = deps.value67();
        if (!pickerTarget || tids.length !== 1) return;
        if (deps.value72.current || deps.value70)
          return void deps.showToast(exportStillRunningMessage);
        deps.value72.current = true;
        deps.value74(true);
        let copyGeneration: Dynamic = clipboardGeneration(),
          isSameWorkingGeneration: Dynamic = createCurrentWorkingGeneration(),
          failureMessage: Dynamic = null,
          isClipboardImagesBlocked: Dynamic = false,
          missingImageCount: Dynamic = 0,
          svgPromise: Dynamic = (async (): Promise<Dynamic> => {
            try {
              if (!(await allowsClipboardImages())) {
                isClipboardImagesBlocked = true;
                return null;
              }
              setPickerSelection(
                pickerTarget,
                [...tids],
                deps.rootName,
              );
              let capture: Dynamic = await captureClipboardSvg(
                pickerTarget,
                "selection",
              ).catch(
                (error?: Dynamic): Dynamic => (
                  console.error("[copy-svg] element", error),
                  (failureMessage = svgCopyErrorMessage(error)),
                  null
                ),
              );
              return capture
                ? capture.ok
                  ? ((missingImageCount = capture.blank),
                    clipboardGeneration() === copyGeneration &&
                    isSameWorkingGeneration()
                      ? capture.svg
                      : null)
                  : ((failureMessage =
                      capture.softError === "zero-size"
                        ? noWidthOrHeightMessage
                        : capture.softError === "no-selection"
                          ? notSelectedAnywhereMessage
                          : conversionFailedMessage),
                    null)
                : null;
            } catch (error: Dynamic) {
              console.error("[copy-svg] element", error);
              failureMessage = conversionFailedMessage;
              return null;
            } finally {
              deps.value72.current = false;
              deps.value74(false);
            }
          })();
        writeClipboardSvg(svgPromise).then(
          (writeResult?: Dynamic): Dynamic => {
            clipboardGeneration() !== copyGeneration ||
              !isSameWorkingGeneration() ||
              (writeResult === "copied"
                ? (clearClipboardBuffers(),
                  announce(
                    copiedAsSvgMessage,
                  ),
                  missingImageCount > 0 &&
                    deps.showToast(
                      missingSvgImagesMessage(missingImageCount),
                      "info",
                    ))
                : isClipboardImagesBlocked
                  ? deps.showToast(DownloadsArenTAvailableToYouForMessage)
                  : deps.showToast(
                      svgCopyFailureMessage(
                        "element",
                        writeResult === "refused" ? null : failureMessage,
                      ),
                      "error",
                    ));
          },
        );
      }
