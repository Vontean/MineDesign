import { AccessibilityAnnouncementsLabel_10 } from "../accessibility/announcements";
import { AccessibilityAnnouncementsLabel_2 } from "../accessibility/announcements";
import { AccessibilityAnnouncementsLabel_3 } from "../accessibility/announcements";
import { AccessibilityAnnouncementsLabel_4 } from "../accessibility/announcements";
import { AccessibilityAnnouncementsLabel_5 } from "../accessibility/announcements";
import { AccessibilityAnnouncementsLabel_6 } from "../accessibility/announcements";
import { AccessibilityAnnouncementsLabel_7 } from "../accessibility/announcements";
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
export async function pasteClipboardAtPoint(deps: { readonly insertAtPoint: Dynamic; readonly modelRef: Dynamic; readonly readOnlyRef: Dynamic; readonly rootName: Dynamic; readonly showToast: Dynamic; readonly value105: Dynamic; readonly value106: Dynamic; readonly value166: Dynamic; readonly value49: Dynamic; readonly value50: Dynamic; readonly value61: Dynamic; readonly value62: Dynamic; readonly value67: Dynamic }, input?: Dynamic): Promise<Dynamic> {
        if (deps.readOnlyRef.current || !deps.insertAtPoint) return;
        let value307: Dynamic = await deps.value166();
        if (!value307 || deps.readOnlyRef.current || !deps.value61.current) return;
        let { text: value308, foreign: value309 }: Dynamic = value307;
        if (!value308)
          return void deps.showToast(
            (0, emptyClipboardMessage)(
              (0, keyboardShortcutLabel)("V"),
            ),
          );
        let value310: Dynamic = value308.startsWith("<")
            ? (0, wrapInlinePastedHtml)(
                value309
                  ? (0, sanitizePastedHtml)(value308)
                  : value308,
              )
            : null,
          value311: Dynamic = deps.modelRef.current.state(deps.rootName)?.model,
          value312: Dynamic =
            value310 != null && value311
              ? value311
                  .topLevelTags(value310)
                  .filter(
                    (input2?: Dynamic): Dynamic =>
                      !SelectionActionsHelmetScHelmetPattern.test(
                        input2,
                      ),
                  ).length
              : 1;
        if (value312 === 0)
          return void deps.showToast(
            (0, emptyClipboardMessage)(
              (0, keyboardShortcutLabel)("V"),
            ),
          );
        if (value312 > 1)
          return void deps.showToast(AccessibilityAnnouncementsLabel_10);
        let value313: Dynamic = await deps.insertAtPoint(
            input,
            (input2?: Dynamic, options?: Dynamic): Dynamic =>
              value310 != null
                ? (0, positionPastedHtml)(value310, {
                    ox: input2,
                    oy: options,
                  })
                : (0, textToParagraphHtml)(
                    value308,
                    `margin: 0; position: absolute; left: ${input2}px; top: ${options}px`,
                  ),
            (): Dynamic => deps.value61.current && !deps.readOnlyRef.current,
          ),
          value314: Dynamic = deps.modelRef.current.state(deps.rootName);
        if (!value313?.length || !value314 || !deps.value61.current) return;
        let value315: Dynamic = deps.value67(),
          value316: Dynamic = deps.value106(value314, value313);
        deps.value105(deps.rootName, value313);
        value316 && (deps.value62.current = deps.value50.current);
        value315 &&
          setTimeout((): Dynamic => {
            let current: Dynamic = deps.value49.current;
            current?.name === deps.rootName &&
              (0, InspectorEditorEvery)(current.tids, value313) &&
              (0, setPickerSelection)(value315, value313, deps.rootName);
          }, 60);
      }

/** 选择“复制为 PNG”时运行：截取所选元素的画面并写入系统剪贴板，处理尺寸为零、截图失败、图片缺失与浏览器拒绝等情况并给出提示和播报。 */
export function copySelectionAsPngImage(deps: { readonly rootName: Dynamic; readonly showToast: Dynamic; readonly value67: Dynamic; readonly value70: Dynamic; readonly value72: Dynamic; readonly value74: Dynamic }, items2?: Dynamic): Dynamic {
        let value307: Dynamic = deps.value67();
        if (!value307 || items2.length !== 1) return;
        if (deps.value72.current || deps.value70)
          return void deps.showToast(AccessibilityAnnouncementsLabel_5);
        deps.value72.current = true;
        deps.value74(true);
        let value308: Dynamic = (0, clipboardGeneration)(),
          value309: Dynamic = (0, createCurrentWorkingGeneration)(),
          value310: Dynamic = null,
          flag: Dynamic = false,
          index: Dynamic = 0,
          value311: Dynamic = (async (): Promise<Dynamic> => {
            try {
              if (!(await (0, allowsClipboardImages)())) {
                flag = true;
                return null;
              }
              let value312: Dynamic = await (0, captureArtboardImage)(
                value307,
                "png",
                2,
                {
                  onBeforeCapture: (): Dynamic =>
                    (0, setPickerSelection)(
                      value307,
                      [...items2],
                      deps.rootName,
                    ),
                },
              ).catch(
                (input?: Dynamic): Dynamic => (
                  (value310 = (0, errorMessage)(input)),
                  null
                ),
              );
              return value312
                ? value312.ok
                  ? ((index = value312.embedWarningCount),
                    (0, clipboardGeneration)() === value308 &&
                    value309()
                      ? (0, pngDataUrlToBlob)(value312.uri)
                      : null)
                  : ((value310 =
                      value312.softError === "zero-size"
                        ? AccessibilityAnnouncementsLabel_7
                        : AccessibilityAnnouncementsLabel_6),
                    null)
                : null;
            } catch (value312: Dynamic) {
              console.error("[copy-png] element", value312);
              value310 = ItsPictureCouldnTBeMadeTryMessage;
              return null;
            } finally {
              deps.value72.current = false;
              deps.value74(false);
            }
          })();
        (0, writeClipboardPng)(value311).then(
          (input?: Dynamic): Dynamic => {
            (0, clipboardGeneration)() !== value308 ||
              !value309() ||
              (input === "copied"
                ? ((0, clearClipboardBuffers)(),
                  (0, announce)(
                    AccessibilityAnnouncementsLabel_2,
                  ),
                  index > 0 &&
                    deps.showToast(
                      (0, missingCopiedImagesMessage)(index),
                      "info",
                    ))
                : flag
                  ? deps.showToast(DownloadsArenTAvailableToYouForMessage)
                  : deps.showToast(
                      (0, pngCopyFailureMessage)(
                        "element",
                        input === "refused" ? null : value310,
                      ),
                      "error",
                    ));
          },
        );
      }

/** 选择“复制为 SVG”时运行：把所选元素导出为 SVG 并写入系统剪贴板，处理无选中、尺寸为零、图片缺失与浏览器拒绝等情况并给出提示和播报。 */
export function copySelectionAsSvgMarkup(deps: { readonly rootName: Dynamic; readonly showToast: Dynamic; readonly value67: Dynamic; readonly value70: Dynamic; readonly value72: Dynamic; readonly value74: Dynamic }, items2?: Dynamic): Dynamic {
        let value307: Dynamic = deps.value67();
        if (!value307 || items2.length !== 1) return;
        if (deps.value72.current || deps.value70)
          return void deps.showToast(AccessibilityAnnouncementsLabel_5);
        deps.value72.current = true;
        deps.value74(true);
        let value308: Dynamic = (0, clipboardGeneration)(),
          value309: Dynamic = (0, createCurrentWorkingGeneration)(),
          value310: Dynamic = null,
          flag: Dynamic = false,
          index: Dynamic = 0,
          value311: Dynamic = (async (): Promise<Dynamic> => {
            try {
              if (!(await (0, allowsClipboardImages)())) {
                flag = true;
                return null;
              }
              (0, setPickerSelection)(
                value307,
                [...items2],
                deps.rootName,
              );
              let value312: Dynamic = await (0, captureClipboardSvg)(
                value307,
                "selection",
              ).catch(
                (input?: Dynamic): Dynamic => (
                  console.error("[copy-svg] element", input),
                  (value310 = (0, svgCopyErrorMessage)(input)),
                  null
                ),
              );
              return value312
                ? value312.ok
                  ? ((index = value312.blank),
                    (0, clipboardGeneration)() === value308 &&
                    value309()
                      ? value312.svg
                      : null)
                  : ((value310 =
                      value312.softError === "zero-size"
                        ? AccessibilityAnnouncementsLabel_7
                        : value312.softError === "no-selection"
                          ? AccessibilityAnnouncementsLabel_6
                          : AccessibilityAnnouncementsLabel_4),
                    null)
                : null;
            } catch (value312: Dynamic) {
              console.error("[copy-svg] element", value312);
              value310 = AccessibilityAnnouncementsLabel_4;
              return null;
            } finally {
              deps.value72.current = false;
              deps.value74(false);
            }
          })();
        (0, writeClipboardSvg)(value311).then(
          (input?: Dynamic): Dynamic => {
            (0, clipboardGeneration)() !== value308 ||
              !value309() ||
              (input === "copied"
                ? ((0, clearClipboardBuffers)(),
                  (0, announce)(
                    AccessibilityAnnouncementsLabel_3,
                  ),
                  index > 0 &&
                    deps.showToast(
                      (0, missingSvgImagesMessage)(index),
                      "info",
                    ))
                : flag
                  ? deps.showToast(DownloadsArenTAvailableToYouForMessage)
                  : deps.showToast(
                      (0, svgCopyFailureMessage)(
                        "element",
                        input === "refused" ? null : value310,
                      ),
                      "error",
                    ));
          },
        );
      }
