import { reactChromeTheme as React } from "../../editor/chrome/theme";
import { OutlineGlyphsLabel } from "../../editor/outline/glyphs";
import { reconcileAnnotationOutline } from "../../editor/outline/annotations";
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
import { existingThumbnailMessage, loosePiecePlaybackMessage, loosePieceRenameHint, oversizedThumbnailMessage, singleArtboardPngCopyMessage, singleArtboardSvgCopyMessage, staticArtboardPlaybackMessage } from "./messages";
import { emptyCanvasSelectionFiles } from "./shared";

interface ArtboardMenuOptions {
  readonly doc: Dynamic;
  readonly selection: Dynamic;
  readonly camera: Dynamic;
  readonly editing: Dynamic;
  readonly readOnly: Dynamic;
  readonly playingFile: Dynamic;
  readonly focusArtboard: Dynamic;
  readonly renameInCanvas: Dynamic;
  readonly duplicateObjects: Dynamic;
  readonly expandArtboard: Dynamic;
  readonly revealArtboard: Dynamic;
  readonly openInlinePlayback: Dynamic;
  readonly reorderArtboards: Dynamic;
  readonly deleteArtboards: Dynamic;
  readonly downloadsWithheld: Dynamic;
  readonly copyPng: Dynamic;
  readonly copySvg: Dynamic;
  readonly selectArtboard: Dynamic;
  readonly promptRename: Dynamic;
  readonly copyBoardsAndNotes: Dynamic;
  readonly setCover: Dynamic;
  readonly pasteMenuItem: Dynamic;
  readonly manifest: Dynamic;
  readonly imageClipboardEnabled: Dynamic;
}

interface AnnotationMenuOptions {
  readonly selection: Dynamic;
  readonly flipRefusal: Dynamic;
  readonly flipSelection: Dynamic;
  readonly editing: Dynamic;
  readonly selectBoardsAndNotes: Dynamic;
  readonly duplicateObjects: Dynamic;
  readonly deleteBoardsAndNotes: Dynamic;
  readonly flipNotes: Dynamic;
  readonly copyBoardsAndNotes: Dynamic;
  readonly pasteMenuItem: Dynamic;
  readonly manifest: Dynamic;
}

/** 打开画板右键菜单时运行：生成复制（含 PNG/SVG）、重命名、设为缩略图、编辑、画布或全屏播放、新窗口打开、层级与删除等菜单项。 */
function buildArtboardContextMenu(deps: ArtboardMenuOptions, artboardFile?: Dynamic, renameOnCanvas: Dynamic = false): Dynamic {
        let selection: Dynamic = deps.selection.current,
          isInSelection: Dynamic = selection.artboards.has(artboardFile),
          targetFiles: Dynamic = isInSelection
            ? selection.artboards
            : new Set([artboardFile]);
        isInSelection || deps.selectArtboard(artboardFile, false);
        let targetCount: Dynamic = targetFiles.size,
          countSuffix: Dynamic =
            targetCount > 1 ? " " + String(targetCount) + " artboards" : "",
          readOnlyReason: Dynamic = deps.editing.current
            ? undefined
            : ViewOnlyYouCanInspectThisMessage,
          canEdit: Dynamic = (): Dynamic => deps.editing.current && true,
          manifest: Dynamic = deps.manifest.current,
          artboard: Dynamic = manifest.artboards.find(
            (item?: Dynamic): Dynamic => item.file === artboardFile,
          ),
          isPlaying: Dynamic = deps.playingFile.current === artboardFile,
          playDisabledReason: Dynamic = isPlaying
            ? undefined
            : artboard?.frameless
              ? loosePiecePlaybackMessage
              : artboard?.is_interactive !== true
                ? staticArtboardPlaybackMessage
                : undefined;
        return [
          {
            get label() { return uiMessage("canvas.designCanvas.copy", { countSuffix: String(countSuffix) }); },
            hotkey: "cmd+c",
            disabledReason: undefined,
            onClick: (): Dynamic => {
              deps.copyBoardsAndNotes(
                targetFiles,
                isInSelection ? selection.notes : emptyCanvasSelectionFiles,
              );
            },
          },
          ...(deps.imageClipboardEnabled && supportsClipboardImages()
            ? [
                {
                  get label() { return uiMessage("canvas.designCanvas.copyAsPNG"); },
                  disabledReason: deps.downloadsWithheld
                    ? DownloadsArenTAvailableToYouForMessage
                    : targetCount > 1
                      ? singleArtboardPngCopyMessage
                      : undefined,
                  onClick: (): Dynamic => deps.copyPng(artboardFile),
                },
                {
                  get label() { return uiMessage("canvas.designCanvas.copyAsSVG"); },
                  disabledReason: deps.downloadsWithheld
                    ? DownloadsArenTAvailableToYouForMessage
                    : targetCount > 1
                      ? singleArtboardSvgCopyMessage
                      : undefined,
                  onClick: (): Dynamic => deps.copySvg(artboardFile),
                },
              ]
            : []),
          deps.pasteMenuItem(),
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
                deps.duplicateObjects.current({
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
                canEdit() && deps.reorderArtboards(targetFiles, order);
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
              if (!renameOnCanvas) return void deps.promptRename(artboardFile);
              let scale: Dynamic = deps.camera.get().scale;
              artboard &&
                deps.revealArtboard.current({
                  x: artboard.x,
                  y: artboard.y - 32 / scale,
                  w: Math.min(artboard.w, 240 / scale),
                  h: 40 / scale,
                });
              deps.renameInCanvas.current?.(artboardFile);
            },
          },
          {
            get label() { return uiMessage("canvas.designCanvas.setAsThumbnail"); },
            disabledReason: deps.editing.current
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
              canEdit() && deps.setCover(artboardFile);
            },
          },
          {
            get label() { return isPlaying ? (deps.editing.current ? (uiMessage("canvas.designCanvas.edit")) : ("Stop")) : (uiMessage("canvas.designCanvas.playOnCanvas")); },
            disabledReason: playDisabledReason,
            onClick: (): Dynamic => {
              isPlaying
                ? deps.editing.current || deps.readOnly.current
                  ? deps.focusArtboard.current(artboardFile)
                  : deps.openInlinePlayback(null)
                : deps.openInlinePlayback(artboardFile);
            },
          },
          {
            get label() { return artboard?.is_interactive === true && !artboard.frameless ? (uiMessage("canvas.designCanvas.playFullScreen")) : (uiMessage("canvas.designCanvas.openFullWindow")); },
            disabledReason: undefined,
            onClick: (): Dynamic => {
              deps.expandArtboard.current(artboardFile);
            },
          },
          {
            get label() { return uiMessage("canvas.designCanvas.deleteSelection", { countSuffix: String(countSuffix) }); },
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
              canEdit() && deps.deleteArtboards(targetFiles);
            },
          },
        ];
      }

/** 打开画布说明或图形右键菜单时运行：生成复制、水平/垂直翻转与删除等菜单项，只读时禁用。 */
function buildAnnotationContextMenu(deps: AnnotationMenuOptions, annotationId?: Dynamic): Dynamic {
        let selection: Dynamic = deps.selection.current,
          isInSelection: Dynamic = selection.notes.has(annotationId),
          targetSelection: Dynamic = {
            files: emptyBoardSelection.files,
            notes: isInSelection ? selection.notes : new Set([annotationId]),
          };
        !isInSelection && deps.editing.current && deps.selectBoardsAndNotes(targetSelection, "replace");
        let noteCount: Dynamic = targetSelection.notes.size,
          targetFiles: Dynamic = isInSelection
            ? selection.artboards
            : emptyCanvasSelectionFiles,
          objectCount: Dynamic = noteCount + targetFiles.size,
          targetAnnotations: Dynamic = (deps.manifest.current.annotations ?? []).filter(
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
            get label() { return uiMessage("canvas.designCanvas.copy", { countSuffix: String(objectCount > 1 ? " " + String(objectCount) + " objects" : "") }); },
            hotkey: "cmd+c",
            disabledReason: deps.editing.current
              ? undefined
              : ViewOnlyYouCanInspectThisMessage,
            onClick: (): Dynamic => {
              deps.editing.current && deps.copyBoardsAndNotes(targetFiles, targetSelection.notes);
            },
          },
          deps.pasteMenuItem(),
          {
            get label() { return KeyboardEditActionsCutCopyPasteConfig.duplicate.label + objectCount > 1 ? " " + String(objectCount) + " objects" : ""; },
            hotkey:
              KeyboardEditActionsCutCopyPasteConfig.duplicate
                .shortcut,
            disabledReason: deps.editing.current
              ? undefined
              : ViewOnlyYouCanInspectThisMessage,
            onClick: (): Dynamic => {
              deps.editing.current &&
                deps.duplicateObjects.current({
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
              get label() { return uiMessage("canvas.designCanvas.flipSelection", { axis: String(axis) }); },
              separatorBefore: index === 0,
              hotkey: axis === "horizontal" ? "shift+h" : "shift+v",
              disabledReason: deps.editing.current
                ? ((isInSelection ? deps.flipRefusal() : undefined) ?? flipRefusal(axis))
                : ViewOnlyYouCanInspectThisMessage,
              onClick: (): Dynamic => {
                isInSelection
                  ? deps.flipSelection.current(axis)
                  : deps.flipNotes.current(targetSelection.notes, axis);
              },
            }),
          ),
          {
            get label() { return uiMessage("canvas.designCanvas.deleteSelection", { countSuffix: String(noteCount > 1 ? " " + String(noteCount) + " objects" : "") }); },
            separatorBefore: true,
            danger: true,
            ...(isInSelection &&
            (selection.artboards.size > 0 || selection.elements.size > 0)
              ? null
              : {
                  hotkey: "backspace",
                }),
            disabledReason: deps.editing.current
              ? undefined
              : ViewOnlyYouCanInspectThisMessage,
            onClick: (): Dynamic => {
              deps.editing.current && deps.deleteBoardsAndNotes.current(targetSelection);
            },
          },
        ];
      }

type MenuSource = { kind: "artboard"; file: string } | { kind: "object"; id: string } | { kind: "canvas" };
type MenuPosition = { x: number; y: number; keyboard?: boolean };
interface CanvasMenuOptions extends ArtboardMenuOptions, AnnotationMenuOptions {
  annotations: Dynamic[];
  exportPicking: { current: boolean };
  isTextEditing: { current: (() => boolean) | null };
  focusCanvas(): void;
  fitArtboards(): void;
  fitArtboardsLabel: string;
}

export function useCanvasContextMenus(options: CanvasMenuOptions) {
  const { useCallback, useMemo, useRef, useState } = React;
  const artboardMenu = useCallback((file: string, renameOnCanvas?: boolean) =>
    buildArtboardContextMenu(options, file, renameOnCanvas), [
    options.selectArtboard, options.copyBoardsAndNotes, options.copyPng, options.copySvg, options.downloadsWithheld,
    options.imageClipboardEnabled, options.pasteMenuItem, options.setCover, options.reorderArtboards,
    options.deleteArtboards, options.doc, options.openInlinePlayback, options.camera,
  ]);
  const annotationMenu = useCallback((id: string) => buildAnnotationContextMenu(options, id), [
    options.selectBoardsAndNotes, options.copyBoardsAndNotes, options.pasteMenuItem, options.flipRefusal,
  ]);
  const emptyMenu = useCallback(() => [
    options.pasteMenuItem(),
    { label: options.fitArtboardsLabel, hotkey: "cmd+0", separatorBefore: true, onClick: options.fitArtboards },
  ], [options.pasteMenuItem]);
  const annotationCache = useRef(new Map());
  const annotationRows = useMemo(() =>
    reconcileAnnotationOutline(options.annotations ?? [], annotationCache.current), [options.annotations]);
  const [menu, setMenu] = useState(null);
  const open = useCallback((source: MenuSource, position: MenuPosition) => {
    if (options.exportPicking.current || options.isTextEditing.current?.() === true ||
        (source.kind !== "object" && options.selection.current.elements.size > 1)) return;

    let items: Dynamic[];
    let subject: string;
    if (source.kind === "artboard") {
      items = artboardMenu(source.file, true);
      subject = options.manifest.current.artboards.find((artboard: Dynamic) => artboard.file === source.file)?.title
        ?? source.file.replace(/\.dc\.html$/, "");
    } else if (source.kind === "object") {
      items = annotationMenu(source.id);
      subject = annotationRows.find((annotation: Dynamic) => annotation.id === source.id)?.label ?? "Object";
    } else {
      options.focusCanvas();
      items = emptyMenu();
      subject = "Canvas";
    }
    setMenu({
      x: position.x,
      y: position.y,
      keyboard: position.keyboard === true,
      items: items.map(OutlineGlyphsLabel),
      get label() { return uiMessage("canvas.designCanvas.actions", { subject: String(subject) }); },
    });
  }, [options.focusCanvas, artboardMenu, annotationMenu, emptyMenu, annotationRows]);

  return { artboardMenu, annotationMenu, annotationRows, menu, open, close: () => setMenu(null) };
}
