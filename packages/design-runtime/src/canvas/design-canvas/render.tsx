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
export function buildArtboardContextMenu(deps: { readonly doc: Dynamic; readonly selectionRef: Dynamic; readonly value105: Dynamic; readonly value224: Dynamic; readonly value225: Dynamic; readonly value271: Dynamic; readonly value274: Dynamic; readonly value293: Dynamic; readonly value323: Dynamic; readonly value379: Dynamic; readonly value383: Dynamic; readonly value384: Dynamic; readonly value403: Dynamic; readonly value449: Dynamic; readonly value480: Dynamic; readonly value505: Dynamic; readonly value506: Dynamic; readonly value578: Dynamic; readonly value588: Dynamic; readonly value589: Dynamic; readonly value590: Dynamic; readonly value591: Dynamic; readonly value73: Dynamic; readonly value92: Dynamic }, artboardFile?: Dynamic, renameOnCanvas: Dynamic = false): Dynamic {
        let selection: Dynamic = deps.selectionRef.current,
          isInSelection: Dynamic = selection.artboards.has(artboardFile),
          targetFiles: Dynamic = isInSelection
            ? selection.artboards
            : new Set([artboardFile]);
        isInSelection || deps.value578(artboardFile, false);
        let targetCount: Dynamic = targetFiles.size,
          countSuffix: Dynamic =
            targetCount > 1 ? " " + String(targetCount) + " artboards" : "",
          readOnlyReason: Dynamic = deps.value224.current
            ? undefined
            : ViewOnlyYouCanInspectThisMessage,
          canEdit: Dynamic = (): Dynamic => deps.value224.current && true,
          manifest: Dynamic = deps.value73.current,
          artboard: Dynamic = manifest.artboards.find(
            (item?: Dynamic): Dynamic => item.file === artboardFile,
          ),
          isPlaying: Dynamic = deps.value271.current === artboardFile,
          playDisabledReason: Dynamic = isPlaying
            ? undefined
            : artboard?.frameless
              ? loosePiecePlaybackMessage
              : artboard?.is_interactive !== true
                ? staticArtboardPlaybackMessage
                : undefined;
        return [
          {
            get label() { return uiMessage("canvas.designCanvas.copy", { value1: String(countSuffix) }); },
            hotkey: "cmd+c",
            disabledReason: undefined,
            onClick: (): Dynamic => {
              deps.value589(
                targetFiles,
                isInSelection ? selection.notes : emptyCanvasSelectionFiles,
              );
            },
          },
          ...(deps.value92 && supportsClipboardImages()
            ? [
                {
                  get label() { return uiMessage("canvas.designCanvas.copyAsPNG"); },
                  disabledReason: deps.value480
                    ? DownloadsArenTAvailableToYouForMessage
                    : targetCount > 1
                      ? singleArtboardPngCopyMessage
                      : undefined,
                  onClick: (): Dynamic => deps.value505(artboardFile),
                },
                {
                  get label() { return uiMessage("canvas.designCanvas.copyAsSVG"); },
                  disabledReason: deps.value480
                    ? DownloadsArenTAvailableToYouForMessage
                    : targetCount > 1
                      ? singleArtboardSvgCopyMessage
                      : undefined,
                  onClick: (): Dynamic => deps.value506(artboardFile),
                },
              ]
            : []),
          deps.value591(),
          {
            label:
              KeyboardEditActionsCutCopyPasteConfig.duplicate.label +
              countSuffix,
            hotkey:
              KeyboardEditActionsCutCopyPasteConfig.duplicate
                .shortcut,
            disabledReason: readOnlyReason,
            onClick: (): Dynamic => {
              canEdit() &&
                deps.value323.current({
                  files: targetFiles,
                  notes: isInSelection
                    ? selection.notes
                    : emptyCanvasSelectionFiles,
                });
            },
          },
          ...["front", "back"].map(
            (order?: Dynamic, index?: Dynamic): Dynamic => ({
              label:
                KeyboardEditActionsCutCopyPasteConfig[order].label,
              hotkey:
                KeyboardEditActionsCutCopyPasteConfig[order]
                  .shortcut,
              separatorBefore: index === 0,
              disabledReason:
                readOnlyReason ??
                (reorderArtboardsOnPages(
                  manifest.artboards,
                  targetFiles,
                  order,
                  manifest.pages,
                ) === null
                  ? stackingAnnouncement(order, false)
                  : undefined),
              onClick: (): Dynamic => {
                canEdit() && deps.value403(targetFiles, order);
              },
            }),
          ),
          {
            get label() { return uiMessage("canvas.designCanvas.rename"); },
            separatorBefore: true,
            disabledReason:
              readOnlyReason ??
              (renameOnCanvas && artboard?.frameless
                ? loosePieceRenameHint
                : undefined),
            onClick: (): Dynamic => {
              if (!canEdit()) return;
              if (!renameOnCanvas) return void deps.value588(artboardFile);
              let scale: Dynamic = deps.value105.get().scale;
              artboard &&
                deps.value383.current({
                  x: artboard.x,
                  y: artboard.y - 32 / scale,
                  w: Math.min(artboard.w, 240 / scale),
                  h: 40 / scale,
                });
              deps.value293.current?.(artboardFile);
            },
          },
          {
            get label() { return uiMessage("canvas.designCanvas.setAsThumbnail"); },
            disabledReason: deps.value224.current
              ? manifest.cover === artboardFile
                ? existingThumbnailMessage
                : artboard !== undefined &&
                    shouldStoreArtboardByReference(
                      artboard,
                      deps.doc.content().files[artboardFile] ?? "",
                    )
                  ? oversizedThumbnailMessage
                  : undefined
              : ViewOnlyYouCanInspectThisMessage,
            onClick: (): Dynamic => {
              canEdit() && deps.value590(artboardFile);
            },
          },
          {
            get label() { return isPlaying ? (deps.value224.current ? (uiMessage("canvas.designCanvas.edit")) : ("Stop")) : (uiMessage("canvas.designCanvas.playOnCanvas")); },
            disabledReason: playDisabledReason,
            onClick: (): Dynamic => {
              isPlaying
                ? deps.value224.current || deps.value225.current
                  ? deps.value274.current(artboardFile)
                  : deps.value384(null)
                : deps.value384(artboardFile);
            },
          },
          {
            get label() { return artboard?.is_interactive === true && !artboard.frameless ? (uiMessage("canvas.designCanvas.playFullScreen")) : (uiMessage("canvas.designCanvas.openFullWindow")); },
            disabledReason: undefined,
            onClick: (): Dynamic => {
              deps.value379.current(artboardFile);
            },
          },
          {
            get label() { return uiMessage("canvas.designCanvas.delete2", { value1: String(countSuffix) }); },
            separatorBefore: true,
            danger: true,
            ...(isInSelection &&
            (selection.notes.size > 0 || selection.elements.size > 0)
              ? null
              : {
                  hotkey: "backspace",
                }),
            disabledReason: readOnlyReason,
            onClick: (): Dynamic => {
              canEdit() && deps.value449(targetFiles);
            },
          },
        ];
      }

/** 打开画布说明或图形右键菜单时运行：生成复制、水平/垂直翻转与删除等菜单项，只读时禁用。 */
export function buildAnnotationContextMenu(deps: { readonly selectionRef: Dynamic; readonly value150: Dynamic; readonly value152: Dynamic; readonly value224: Dynamic; readonly value314: Dynamic; readonly value323: Dynamic; readonly value459: Dynamic; readonly value46: Dynamic; readonly value589: Dynamic; readonly value591: Dynamic; readonly value73: Dynamic }, annotationId?: Dynamic): Dynamic {
        let selection: Dynamic = deps.selectionRef.current,
          isInSelection: Dynamic = selection.notes.has(annotationId),
          targetSelection: Dynamic = {
            files: emptyBoardSelection.files,
            notes: isInSelection ? selection.notes : new Set([annotationId]),
          };
        !isInSelection && deps.value224.current && deps.value314(targetSelection, "replace");
        let noteCount: Dynamic = targetSelection.notes.size,
          targetFiles: Dynamic = isInSelection
            ? selection.artboards
            : emptyCanvasSelectionFiles,
          objectCount: Dynamic = noteCount + targetFiles.size,
          targetAnnotations: Dynamic = (deps.value73.current.annotations ?? []).filter(
            (annotation?: Dynamic): Dynamic => targetSelection.notes.has(annotation.id),
          ),
          flipRefusal: Dynamic = (axis?: Dynamic): Dynamic => {
            if (isInSelection && selection.elements.size > 0) return;
            let flipResult: Dynamic = flipAnnotations(
              targetAnnotations,
              axis,
            );
            return flipResult.flips.length > 0 ? undefined : flipResult.refused;
          };
        return [
          {
            get label() { return uiMessage("canvas.designCanvas.copy", { value1: String(objectCount > 1 ? " " + String(objectCount) + " objects" : "") }); },
            hotkey: "cmd+c",
            disabledReason: deps.value224.current
              ? undefined
              : ViewOnlyYouCanInspectThisMessage,
            onClick: (): Dynamic => {
              deps.value224.current && deps.value589(targetFiles, targetSelection.notes);
            },
          },
          deps.value591(),
          {
            get label() { return KeyboardEditActionsCutCopyPasteConfig.duplicate.label + objectCount > 1 ? " " + String(objectCount) + " objects" : ""; },
            hotkey:
              KeyboardEditActionsCutCopyPasteConfig.duplicate
                .shortcut,
            disabledReason: deps.value224.current
              ? undefined
              : ViewOnlyYouCanInspectThisMessage,
            onClick: (): Dynamic => {
              deps.value224.current &&
                deps.value323.current({
                  files: targetFiles,
                  notes: targetSelection.notes,
                });
            },
          },
          ...(!(isInSelection && selection.elements.size > 0) &&
          targetAnnotations.every(
            (annotation?: Dynamic): Dynamic => annotation.kind === undefined,
          )
            ? []
            : ["horizontal", "vertical"]
          ).map(
            (axis?: Dynamic, index?: Dynamic): Dynamic => ({
              get label() { return uiMessage("canvas.designCanvas.flip2", { value1: String(axis) }); },
              separatorBefore: index === 0,
              hotkey: axis === "horizontal" ? "shift+h" : "shift+v",
              disabledReason: deps.value224.current
                ? ((isInSelection ? deps.value150() : undefined) ?? flipRefusal(axis))
                : ViewOnlyYouCanInspectThisMessage,
              onClick: (): Dynamic => {
                isInSelection
                  ? deps.value152.current(axis)
                  : deps.value46.current(targetSelection.notes, axis);
              },
            }),
          ),
          {
            get label() { return uiMessage("canvas.designCanvas.delete2", { value1: String(noteCount > 1 ? " " + String(noteCount) + " objects" : "") }); },
            separatorBefore: true,
            danger: true,
            ...(isInSelection &&
            (selection.artboards.size > 0 || selection.elements.size > 0)
              ? null
              : {
                  hotkey: "backspace",
                }),
            disabledReason: deps.value224.current
              ? undefined
              : ViewOnlyYouCanInspectThisMessage,
            onClick: (): Dynamic => {
              deps.value224.current && deps.value459.current(targetSelection);
            },
          },
        ];
      }
