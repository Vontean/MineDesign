import { DownloadsArenTAvailableToYouForMessage } from "../../export/downloads";
import { KeyboardEditActionsCutCopyPasteConfig } from "../../editor/keyboard/edit-actions";
import { ViewOnlyYouCanInspectThisMessage } from "../../editor/outline/annotations";
import { emptyBoardSelection } from "../../editor/selection/canvas-selection";
import { flipAnnotations } from "../../editor/geometry/flip-annotations";
import { reorderArtboardsOnPages } from "../../platform/file-content";
import { shouldStoreArtboardByReference } from "../../platform/design-document-adapter";
import { stackingAnnouncement } from "../../editor/accessibility/announcements";
import { supportsClipboardImages } from "../../editor/clipboard/png-copy";
import { type Dynamic } from "../../runtime-types";
import { uiMessage } from "@minedesign/contracts/ui-messages";
import { emptyCanvasSelectionFiles, existingThumbnailMessage, loosePiecePlaybackMessage, loosePieceRenameHint, oversizedThumbnailMessage, singleArtboardPngCopyMessage, singleArtboardSvgCopyMessage, staticArtboardPlaybackMessage } from "../design-canvas";

/** 打开画板右键菜单时运行：生成复制（含 PNG/SVG）、重命名、设为缩略图、编辑、画布或全屏播放、新窗口打开、层级与删除等菜单项。 */
export function buildArtboardContextMenu(deps: { readonly doc: Dynamic; readonly selectionRef: Dynamic; readonly value105: Dynamic; readonly value224: Dynamic; readonly value225: Dynamic; readonly value271: Dynamic; readonly value274: Dynamic; readonly value293: Dynamic; readonly value323: Dynamic; readonly value379: Dynamic; readonly value383: Dynamic; readonly value384: Dynamic; readonly value403: Dynamic; readonly value449: Dynamic; readonly value480: Dynamic; readonly value505: Dynamic; readonly value506: Dynamic; readonly value578: Dynamic; readonly value588: Dynamic; readonly value589: Dynamic; readonly value590: Dynamic; readonly value591: Dynamic; readonly value73: Dynamic; readonly value92: Dynamic }, input?: Dynamic, options: Dynamic = false): Dynamic {
        let current4: Dynamic = deps.selectionRef.current,
          value653: Dynamic = current4.artboards.has(input),
          value654: Dynamic = value653
            ? current4.artboards
            : new Set([input]);
        value653 || deps.value578(input, false);
        let size: Dynamic = value654.size,
          value655: Dynamic =
            size > 1 ? " " + String(size) + " artboards" : "",
          value656: Dynamic = deps.value224.current
            ? undefined
            : ViewOnlyYouCanInspectThisMessage,
          callback15: Dynamic = (): Dynamic => deps.value224.current && true,
          current5: Dynamic = deps.value73.current,
          value657: Dynamic = current5.artboards.find(
            (input2?: Dynamic): Dynamic => input2.file === input,
          ),
          value658: Dynamic = deps.value271.current === input,
          value659: Dynamic = value658
            ? undefined
            : value657?.frameless
              ? loosePiecePlaybackMessage
              : value657?.is_interactive !== true
                ? staticArtboardPlaybackMessage
                : undefined;
        return [
          {
            get label() { return uiMessage("canvas.designCanvas.copy", { value1: String(value655) }); },
            hotkey: "cmd+c",
            disabledReason: undefined,
            onClick: (): Dynamic => {
              deps.value589(
                value654,
                value653 ? current4.notes : emptyCanvasSelectionFiles,
              );
            },
          },
          ...(deps.value92 && (0, supportsClipboardImages)()
            ? [
                {
                  get label() { return uiMessage("canvas.designCanvas.copyAsPNG"); },
                  disabledReason: deps.value480
                    ? DownloadsArenTAvailableToYouForMessage
                    : size > 1
                      ? singleArtboardPngCopyMessage
                      : undefined,
                  onClick: (): Dynamic => deps.value505(input),
                },
                {
                  get label() { return uiMessage("canvas.designCanvas.copyAsSVG"); },
                  disabledReason: deps.value480
                    ? DownloadsArenTAvailableToYouForMessage
                    : size > 1
                      ? singleArtboardSvgCopyMessage
                      : undefined,
                  onClick: (): Dynamic => deps.value506(input),
                },
              ]
            : []),
          deps.value591(),
          {
            label:
              KeyboardEditActionsCutCopyPasteConfig.duplicate.label +
              value655,
            hotkey:
              KeyboardEditActionsCutCopyPasteConfig.duplicate
                .shortcut,
            disabledReason: value656,
            onClick: (): Dynamic => {
              callback15() &&
                deps.value323.current({
                  files: value654,
                  notes: value653
                    ? current4.notes
                    : emptyCanvasSelectionFiles,
                });
            },
          },
          ...["front", "back"].map(
            (input2?: Dynamic, options2?: Dynamic): Dynamic => ({
              label:
                KeyboardEditActionsCutCopyPasteConfig[input2].label,
              hotkey:
                KeyboardEditActionsCutCopyPasteConfig[input2]
                  .shortcut,
              separatorBefore: options2 === 0,
              disabledReason:
                value656 ??
                ((0, reorderArtboardsOnPages)(
                  current5.artboards,
                  value654,
                  input2,
                  current5.pages,
                ) === null
                  ? (0, stackingAnnouncement)(input2, false)
                  : undefined),
              onClick: (): Dynamic => {
                callback15() && deps.value403(value654, input2);
              },
            }),
          ),
          {
            get label() { return uiMessage("canvas.designCanvas.rename"); },
            separatorBefore: true,
            disabledReason:
              value656 ??
              (options && value657?.frameless
                ? loosePieceRenameHint
                : undefined),
            onClick: (): Dynamic => {
              if (!callback15()) return;
              if (!options) return void deps.value588(input);
              let scale: Dynamic = deps.value105.get().scale;
              value657 &&
                deps.value383.current({
                  x: value657.x,
                  y: value657.y - 32 / scale,
                  w: Math.min(value657.w, 240 / scale),
                  h: 40 / scale,
                });
              deps.value293.current?.(input);
            },
          },
          {
            get label() { return uiMessage("canvas.designCanvas.setAsThumbnail"); },
            disabledReason: deps.value224.current
              ? current5.cover === input
                ? existingThumbnailMessage
                : value657 !== undefined &&
                    (0, shouldStoreArtboardByReference)(
                      value657,
                      deps.doc.content().files[input] ?? "",
                    )
                  ? oversizedThumbnailMessage
                  : undefined
              : ViewOnlyYouCanInspectThisMessage,
            onClick: (): Dynamic => {
              callback15() && deps.value590(input);
            },
          },
          {
            get label() { return value658 ? (deps.value224.current ? (uiMessage("canvas.designCanvas.edit")) : ("Stop")) : (uiMessage("canvas.designCanvas.playOnCanvas")); },
            disabledReason: value659,
            onClick: (): Dynamic => {
              value658
                ? deps.value224.current || deps.value225.current
                  ? deps.value274.current(input)
                  : deps.value384(null)
                : deps.value384(input);
            },
          },
          {
            get label() { return value657?.is_interactive === true && !value657.frameless ? (uiMessage("canvas.designCanvas.playFullScreen")) : (uiMessage("canvas.designCanvas.openFullWindow")); },
            disabledReason: undefined,
            onClick: (): Dynamic => {
              deps.value379.current(input);
            },
          },
          {
            get label() { return uiMessage("canvas.designCanvas.delete2", { value1: String(value655) }); },
            separatorBefore: true,
            danger: true,
            ...(value653 &&
            (current4.notes.size > 0 || current4.elements.size > 0)
              ? null
              : {
                  hotkey: "backspace",
                }),
            disabledReason: value656,
            onClick: (): Dynamic => {
              callback15() && deps.value449(value654);
            },
          },
        ];
      }

/** 打开画布说明或图形右键菜单时运行：生成复制、水平/垂直翻转与删除等菜单项，只读时禁用。 */
export function buildAnnotationContextMenu(deps: { readonly selectionRef: Dynamic; readonly value150: Dynamic; readonly value152: Dynamic; readonly value224: Dynamic; readonly value314: Dynamic; readonly value323: Dynamic; readonly value459: Dynamic; readonly value46: Dynamic; readonly value589: Dynamic; readonly value591: Dynamic; readonly value73: Dynamic }, input?: Dynamic): Dynamic {
        let current4: Dynamic = deps.selectionRef.current,
          value653: Dynamic = current4.notes.has(input),
          state: Dynamic = {
            files: emptyBoardSelection.files,
            notes: value653 ? current4.notes : new Set([input]),
          };
        !value653 && deps.value224.current && deps.value314(state, "replace");
        let size: Dynamic = state.notes.size,
          value654: Dynamic = value653
            ? current4.artboards
            : emptyCanvasSelectionFiles,
          value655: Dynamic = size + value654.size,
          value656: Dynamic = (deps.value73.current.annotations ?? []).filter(
            (input2?: Dynamic): Dynamic => state.notes.has(input2.id),
          ),
          callback15: Dynamic = (input2?: Dynamic): Dynamic => {
            if (value653 && current4.elements.size > 0) return;
            let value657: Dynamic = (0, flipAnnotations)(
              value656,
              input2,
            );
            return value657.flips.length > 0 ? undefined : value657.refused;
          };
        return [
          {
            get label() { return uiMessage("canvas.designCanvas.copy", { value1: String(value655 > 1 ? " " + String(value655) + " objects" : "") }); },
            hotkey: "cmd+c",
            disabledReason: deps.value224.current
              ? undefined
              : ViewOnlyYouCanInspectThisMessage,
            onClick: (): Dynamic => {
              deps.value224.current && deps.value589(value654, state.notes);
            },
          },
          deps.value591(),
          {
            get label() { return KeyboardEditActionsCutCopyPasteConfig.duplicate.label + value655 > 1 ? " " + String(value655) + " objects" : ""; },
            hotkey:
              KeyboardEditActionsCutCopyPasteConfig.duplicate
                .shortcut,
            disabledReason: deps.value224.current
              ? undefined
              : ViewOnlyYouCanInspectThisMessage,
            onClick: (): Dynamic => {
              deps.value224.current &&
                deps.value323.current({
                  files: value654,
                  notes: state.notes,
                });
            },
          },
          ...(!(value653 && current4.elements.size > 0) &&
          value656.every(
            (source?: Dynamic): Dynamic => source.kind === undefined,
          )
            ? []
            : ["horizontal", "vertical"]
          ).map(
            (input2?: Dynamic, options?: Dynamic): Dynamic => ({
              get label() { return uiMessage("canvas.designCanvas.flip2", { value1: String(input2) }); },
              separatorBefore: options === 0,
              hotkey: input2 === "horizontal" ? "shift+h" : "shift+v",
              disabledReason: deps.value224.current
                ? ((value653 ? deps.value150() : undefined) ?? callback15(input2))
                : ViewOnlyYouCanInspectThisMessage,
              onClick: (): Dynamic => {
                value653
                  ? deps.value152.current(input2)
                  : deps.value46.current(state.notes, input2);
              },
            }),
          ),
          {
            get label() { return uiMessage("canvas.designCanvas.delete2", { value1: String(size > 1 ? " " + String(size) + " objects" : "") }); },
            separatorBefore: true,
            danger: true,
            ...(value653 &&
            (current4.artboards.size > 0 || current4.elements.size > 0)
              ? null
              : {
                  hotkey: "backspace",
                }),
            disabledReason: deps.value224.current
              ? undefined
              : ViewOnlyYouCanInspectThisMessage,
            onClick: (): Dynamic => {
              deps.value224.current && deps.value459.current(state);
            },
          },
        ];
      }
