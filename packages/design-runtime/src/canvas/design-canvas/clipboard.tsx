import { copiedAsPngMessage } from "../../editor/accessibility/announcements";
import { copiedAsSvgMessage } from "../../editor/accessibility/announcements";
import { conversionFailedMessage } from "../../editor/accessibility/announcements";
import { exportStillRunningMessage as anotherExportRunningMessage } from "../../editor/accessibility/announcements";
import { noWidthOrHeightMessage as noSizeMessage } from "../../editor/accessibility/announcements";
import { previewStoppedReloadMessage as previewStoppedMessage } from "../../editor/accessibility/announcements";
import { notVisibleMessage } from "../../editor/accessibility/announcements";
import { ClipboardArtboardsResolvedValue } from "../../editor/clipboard/artboards";
import { ClipboardFileTransferRegistry } from "../../editor/clipboard/file-transfer";
import { DesignArtboardsKey } from "../../editor/clipboard/state";
import { DownloadsArenTAvailableToYouForMessage } from "../../export/downloads";
import { ItsPageHasNothingToDrawMessage } from "../../editor/accessibility/announcements";
import { ItsPictureCouldnTBeMadeTryMessage } from "../../editor/accessibility/announcements";
import { defaultArtboardWidth } from "../../platform/file-content";
import { defaultArtboardHeight } from "../../platform/file-content";
import { projectFileKey } from "../../platform/file-content";
import { afterClipboardSettled } from "../../editor/clipboard/state";
import { allowsClipboardImages } from "../../editor/clipboard/png-copy";
import { annotationClipboardEntries } from "../../editor/clipboard/annotations";
import { annotationVisibleBounds } from "../../platform/file-content";
import { announce } from "../../editor/accessibility/announcer";
import { artboardAppearanceProperties } from "../../platform/file-content";
import { buildArtboardClipboard } from "../../editor/clipboard/artboards";
import { canvasElementSelectionCount } from "../../editor/selection/canvas-selection";
import { captureArtboardImage } from "../../export/image";
import { captureClipboardSvg } from "../../editor/clipboard/svg-copy";
import { clearClipboardBuffers } from "../../editor/clipboard/state";
import { clipboardContainsFileNames } from "../../editor/clipboard/native";
import { clipboardGeneration } from "../../editor/clipboard/state";
import { clipboardObjectStamp } from "../../editor/clipboard/state";
import { clippedArtboardsMessage } from "../../export/warnings";
import { clippedSvgCopyMessage } from "../../editor/accessibility/announcements";
import { createCurrentWorkingGeneration } from "../../editor/clipboard/working-files";
import { createPreviewHandle } from "../../preview/evaluation";
import { emptyCanvasSelection } from "../../editor/selection/canvas-selection";
import { errorMessage } from "../../platform/rate-limiter";
import { exportFileName } from "../../export/file-names";
import { fetchBlobAsset } from "../../platform/blob-cache";
import { formatArtboardNames } from "../../export/warnings";
import { getActiveClipboardSource } from "../../editor/clipboard/state";
import { getAnnotationClipboard } from "../../editor/clipboard/state";
import { getArtboardCaptureOptions } from "../../export/warnings";
import { getArtboardClipboard } from "../../editor/clipboard/state";
import { getCachedBlobObjectUrl } from "../../platform/blob-cache";
import { getElementClipboard } from "../../editor/clipboard/state";
import { getExternalFileReferences } from "../../platform/external-files";
import { getKvClient } from "../../platform/file-content";
import { hasBlockingEditorOverlay } from "../../editor/text/typing-target";
import { imagePasteRefusal } from "../../editor/keyboard/paste";
import { isClipboardSettling } from "../../editor/clipboard/state";
import { isEditingInputTarget } from "../../editor/keyboard/find";
import { isImageFile } from "../../platform/image-processing";
import { isLoadingArtboardHtml } from "../../platform/design-document-adapter";
import { isVideoFile } from "../../editor/media/video-upload";
import { markConsumedClipboardStamp } from "../../editor/clipboard/state";
import { mirrorArtboardClipboardStamp } from "../../editor/clipboard/state";
import { missingCopiedImagesMessage } from "../../editor/accessibility/announcements";
import { missingSvgImagesMessage } from "../../editor/accessibility/announcements";
import { normalizeAuthoredHtml } from "../../editor/html/authoring";
import { pngCopyFailureMessage } from "../../editor/accessibility/announcements";
import { pngDataUrlToBlob } from "../../editor/clipboard/png-copy";
import { readArtboardClipboard } from "../../editor/clipboard/state";
import { readBoundedClipboardObject } from "../../editor/clipboard/state";
import { rememberClipboardStamp } from "../../editor/clipboard/state";
import { sanitizePastedHtml } from "../../editor/clipboard/html-sanitization";
import { setArtboardClipboard } from "../../editor/clipboard/state";
import { setCanvasElementSelection } from "../../editor/selection/canvas-selection";
import { startClipboardMark } from "../../editor/clipboard/state";
import { svgCopyErrorMessage } from "../../editor/clipboard/svg-copy";
import { svgCopyFailureMessage } from "../../editor/accessibility/announcements";
import { textToParagraphHtml } from "../../editor/insert/targets";
import { type Dynamic } from "../../runtime-types";
import { uiMessage } from "@minedesign/contracts/ui-messages";
import { visibleArtboardCenter } from "../paste-placement";
import { withCaptureViewport } from "../../export/capture-viewport";
import { wrapInlinePastedHtml } from "../../editor/insert/drop-targets";
import { writeClipboardObject } from "../../editor/clipboard/native";
import { writeClipboardPng } from "../../editor/clipboard/png-copy";
import { writeClipboardSvg } from "../../editor/clipboard/svg-copy";
import { readCanvasClipboardText } from "./shared";

/** 在画布上复制画板或说明时运行：读取画板文件与外观属性，写入应用内画板剪贴板并记录剪贴板标记。 */
export function copyBoardsToClipboard(deps: { readonly doc: Dynamic; readonly artboardEntries: Dynamic; readonly manifest: Dynamic }, artboardFiles?: Dynamic, noteIds?: Dynamic, getClipboardMarker?: Dynamic): Dynamic {
        (async (): Promise<Dynamic> => {
          try {
            let artboards: Dynamic = deps.manifest.artboards.filter(
                (artboard?: Dynamic): Dynamic => artboardFiles.has(artboard.file),
              ),
              notes: Dynamic = (deps.manifest.annotations ?? []).filter(
                (note?: Dynamic): Dynamic => noteIds.has(note.id),
              );
            if (artboards.length === 0 && notes.length === 0) {
              setTimeout(
                (): Dynamic =>
                  rememberClipboardStamp(getClipboardMarker?.()?.stamp),
                0,
              );
              return;
            }
            await Promise.all(
              artboards.map(
                (artboard?: Dynamic): Dynamic =>
                  deps.artboardEntries.current.get(artboard.file)?.flushPending(),
              ),
            );
            let files: Dynamic = deps.doc.content().files,
              noteBounds: Dynamic = notes.map(
                (note?: Dynamic): Dynamic =>
                  annotationVisibleBounds(note),
              ),
              originX: Dynamic = Math.min(
                ...artboards.map((box?: Dynamic): Dynamic => box.x),
                ...noteBounds.map((box?: Dynamic): Dynamic => box.x),
              ),
              originY: Dynamic = Math.min(
                ...artboards.map((box?: Dynamic): Dynamic => box.y),
                ...noteBounds.map((box?: Dynamic): Dynamic => box.y),
              ),
              noteEntries: Dynamic = notes.map(
                (note?: Dynamic, index?: Dynamic): Dynamic => {
                  let bounds: Dynamic = noteBounds[index];
                  return {
                    spec: note,
                    dx: bounds.x - originX,
                    dy: bounds.y - originY,
                    w: bounds.w,
                    h: bounds.h,
                  };
                },
              ),
              artboardEntries: Dynamic = [];
            for (let artboard of artboards as Dynamic) {
              let artboardSource: Dynamic =
                (await getKvClient().get(
                  projectFileKey(artboard.file),
                )) ?? files[artboard.file];
              typeof artboardSource != "string" ||
                isLoadingArtboardHtml(artboardSource) ||
                artboardEntries.push({
                  src: artboardSource,
                  stem: artboard.file.replace(/\.dc\.html$/, ""),
                  dx: artboard.x - originX,
                  dy: artboard.y - originY,
                  w: artboard.w,
                  h: artboard.h,
                  ...(artboard.title
                    ? {
                        title: artboard.title,
                      }
                    : {}),
                  ...artboardAppearanceProperties(artboard),
                });
            }
            artboardEntries.length > 0 || (noteEntries.length > 0 && artboards.length === 0)
              ? setArtboardClipboard(
                  artboardEntries,
                  getClipboardMarker?.(),
                  noteEntries,
                )
              : rememberClipboardStamp(getClipboardMarker?.()?.stamp);
          } catch {
            rememberClipboardStamp(getClipboardMarker?.()?.stamp);
          }
        })();
      }

/** 复制到系统剪贴板前运行：把选中的画板与说明序列化为剪贴板数据，并检查体积、未上传文件与未保存修改。 */
export function buildSystemClipboardPayload(deps: { readonly doc: Dynamic; readonly artboardEntries: Dynamic; readonly showDragToast: Dynamic; readonly manifest: Dynamic }, artboardFiles?: Dynamic, noteIds?: Dynamic): Dynamic {
        let artboards: Dynamic = deps.manifest.current.artboards,
          artboardClipboard: Dynamic = buildArtboardClipboard(
            artboards.filter(
              (artboard?: Dynamic): Dynamic => artboardFiles.has(artboard.file),
            ),
            artboards,
            deps.doc.content().files,
            getCachedBlobObjectUrl,
            getExternalFileReferences(),
          );
        if (!artboardClipboard && artboardFiles.size > 0) return {};
        if (artboardClipboard?.tooLarge) {
          deps.showDragToast(
            uiMessage("canvas.designCanvas.copiedThisSelectionIsToo", { limitMb: String(String(ClipboardArtboardsResolvedValue >> 20)) }),
          );
          return {};
        }
        let notes: Dynamic = (deps.manifest.current.annotations ?? []).filter(
            (note?: Dynamic): Dynamic => noteIds.has(note.id),
          ),
          readAssetUrl: Dynamic = (asset?: Dynamic): Dynamic =>
            getCachedBlobObjectUrl(asset) ??
            (fetchBlobAsset(asset).catch((): Dynamic => {}),
            undefined),
          noteClipboard: Dynamic = annotationClipboardEntries(
            notes,
            artboardClipboard?.origin ?? null,
            ClipboardArtboardsResolvedValue -
              (artboardClipboard?.json.length ?? 0),
            !artboardClipboard,
            {
              read: readAssetUrl,
              assets: artboardClipboard?.clip.assets ?? {},
            },
          ),
          unreadFilesMessage: Dynamic = (fileCount?: Dynamic): Dynamic =>
            fileCount === 1
              ? "Copied. One uploaded file wasn't read yet, so another canvas would go without it. Copy again in a moment."
              : uiMessage("canvas.designCanvas.copiedUploadsNotReady", { count: String(String(fileCount)) }),
          unsupportedFilesMessage: Dynamic = (fileCount?: Dynamic): Dynamic =>
            fileCount === 1
              ? "Copied. One uploaded file can't travel to another canvas (only images, stylesheets, scripts, fonts and JSON under 4 MB do); add it again there."
              : uiMessage("canvas.designCanvas.copiedUploadsCannotTransfer", { count: String(String(fileCount)) }),
          { left: skipped }: Dynamic = noteClipboard;
        if (!artboardClipboard) {
          noteClipboard.tooLarge
            ? deps.showDragToast(
                noteClipboard.tooLarge === "bounds"
                  ? ClipboardFileTransferRegistry.tooManyNotesToCopy
                  : ClipboardFileTransferRegistry.tooLargeToCopy,
              )
            : skipped.notRead > 0
              ? deps.showDragToast(
                  ClipboardFileTransferRegistry.picturesNotReady(
                    skipped.notRead,
                  ),
                )
              : skipped.cannot > 0
                ? deps.showDragToast(
                    ClipboardFileTransferRegistry.picturesCantGo(
                      skipped.cannot,
                    ),
                  )
                : skipped.noRoom > 0
                  ? deps.showDragToast(
                      ClipboardFileTransferRegistry.picturesWontFit(
                        skipped.noRoom,
                      ),
                    )
                  : skipped.overCap > 0 &&
                    deps.showDragToast(
                      ClipboardFileTransferRegistry.picturesOverCap(
                        skipped.overCap,
                      ),
                    );
          return {
            ...noteClipboard.fields,
            ...(Object.keys(noteClipboard.assets).length > 0
              ? {
                  assets: noteClipboard.assets,
                }
              : {}),
          };
        }
        let notify: Dynamic = (message?: Dynamic): Dynamic =>
            deps.showDragToast(
              message +
                (noteClipboard.tooLarge
                  ? ClipboardFileTransferRegistry.notesStayedToo
                  : ""),
            ),
          length: Dynamic = artboardClipboard.clip.artboards.filter(
            (artboard?: Dynamic): Dynamic =>
              deps.artboardEntries.current
                .get(artboard.stem + ".dc.html")
                ?.hasPendingEdits(),
          ).length;
        length > 0
          ? notify(
              length === 1
                ? "Copied. One artboard has unsaved edits, so another canvas would get its last saved version. Click outside it, then copy again."
                : uiMessage("canvas.designCanvas.copiedArtboardsUnsaved", { count: String(String(length)) }),
            )
          : artboardClipboard.missingAssets > 0
            ? notify(
                unreadFilesMessage(artboardClipboard.missingAssets + skipped.notRead),
              )
            : skipped.notRead > 0
              ? notify(
                  ClipboardFileTransferRegistry.picturesNotReady(
                    skipped.notRead,
                  ),
                )
              : artboardClipboard.unsupportedAssets > 0
                ? notify(
                    unsupportedFilesMessage(artboardClipboard.unsupportedAssets + skipped.cannot),
                  )
                : skipped.cannot > 0
                  ? notify(
                      ClipboardFileTransferRegistry.picturesCantGo(
                        skipped.cannot,
                      ),
                    )
                  : skipped.noRoom > 0
                    ? notify(
                        ClipboardFileTransferRegistry.picturesWontFit(
                          skipped.noRoom,
                        ),
                      )
                    : noteClipboard.tooLarge &&
                      deps.showDragToast(
                        ClipboardFileTransferRegistry
                          .tooLargeBesideArtboards,
                      );
        return {
          ...artboardClipboard.clip,
          assets: {
            ...artboardClipboard.clip.assets,
            ...noteClipboard.assets,
          },
          ...noteClipboard.fields,
        };
      }

/** 粘贴文本或 HTML 时运行：清理内容后插入目标画板的指定位置；没有目标画板时新建画板承载。 */
export function pasteHtmlIntoArtboard(deps: { readonly abandonSelectionGesture: Dynamic; readonly setSelection: Dynamic; readonly artboardEntries: Dynamic; readonly showDragToast: Dynamic; readonly clearDragToast: Dynamic; readonly componentName: Dynamic; readonly editing: Dynamic; readonly pasteHtmlContent: Dynamic; readonly clearFramePick: Dynamic; readonly pageContents: Dynamic }, pastePoint?: Dynamic, pastedText?: Dynamic): Dynamic {
        if (!deps.editing.current) return;
        let trimmedText: Dynamic = pastedText.trim(),
          content: Dynamic =
            trimmedText || (getElementClipboard() ?? "").trim();
        if (!content) {
          deps.showDragToast(
            uiMessage("canvas.designCanvas.nothingToPasteHereCopy"),
          );
          return;
        }
        let sanitizeIfHtml: Dynamic = (html?: Dynamic): Dynamic =>
          trimmedText.startsWith("<")
            ? sanitizePastedHtml(html)
            : html;
        if (pastePoint.file == null) {
          let wrappedHtml: Dynamic = wrapInlinePastedHtml(
            sanitizeIfHtml(
              content.startsWith("<")
                ? normalizeAuthoredHtml(content)
                : textToParagraphHtml(
                    content,
                    "margin: 0; position: absolute; left: 32px; top: 32px",
                  ),
            ),
          );
          if (!/<[a-z]/i.test(wrappedHtml)) {
            deps.showDragToast(
              uiMessage("canvas.designCanvas.nothingToPasteHereThe"),
            );
            return;
          }
          deps.pasteHtmlContent(
            {
              x: Math.round(
                pastePoint.x - defaultArtboardWidth / 2,
              ),
              y: Math.round(
                pastePoint.y - defaultArtboardHeight / 2,
              ),
              w: defaultArtboardWidth,
              h: defaultArtboardHeight,
            },
            wrappedHtml,
            {
              doneSay: "New artboard from the paste",
            },
          );
          return;
        }
        let file: Dynamic = pastePoint.file,
          artboardName: Dynamic = file.replace(/\.dc\.html$/, ""),
          editor: Dynamic = deps.artboardEntries.current.get(file),
          artboard: Dynamic = deps.pageContents.current.artboards.find(
            (item?: Dynamic): Dynamic => item.file === file,
          );
        if (!editor || !artboard) {
          deps.showDragToast(
            uiMessage("canvas.designCanvas.couldNotPasteIntoArtboard", { artboard: String(artboardName) }),
          );
          return;
        }
        let [offsetX, offsetY]: Dynamic = [
          pastePoint.x - artboard.x,
          pastePoint.y - artboard.y,
        ];
        (content.startsWith("<")
          ? editor.insertHtml(sanitizeIfHtml(content), "stage", {
              ox: offsetX,
              oy: offsetY,
            })
          : editor.insertLayerAt(
              {
                x: offsetX,
                y: offsetY,
              },
              (left?: Dynamic, topOffset?: Dynamic): Dynamic =>
                textToParagraphHtml(
                  content,
                  `margin: 0; position: absolute; left: ${left}px; top: ${topOffset}px`,
                ),
              (): Dynamic => deps.editing.current,
              (html?: Dynamic): Dynamic => {
                let currentEditor: Dynamic = deps.artboardEntries.current.get(file);
                return currentEditor === editor
                  ? null
                  : currentEditor
                    ? currentEditor.insertHtml(html, "stage")
                    : Promise.resolve(null);
              },
            )
        ).then((insertedIds?: Dynamic): Dynamic => {
          if (insertedIds != null) {
            if (insertedIds.length === 0) {
              deps.showDragToast(uiMessage("canvas.designCanvas.couldNotPasteNothingChanged"));
              return;
            }
            deps.abandonSelectionGesture();
            deps.clearFramePick();
            deps.setSelection(
              setCanvasElementSelection(
                emptyCanvasSelection,
                file,
                {
                  name: deps.componentName(file),
                  tids: insertedIds,
                  rect: null,
                  count: insertedIds.length,
                },
                false,
              ),
            );
            deps.clearDragToast(uiMessage("canvas.designCanvas.pastedInto") + artboardName);
          }
        });
      }

/** 注册 keydown、copy、paste 监听：决定复制或粘贴走画板、画布说明还是元素剪贴板，并处理粘贴文件与图片拒绝。 */
export function subscribeClipboardEvents(deps: { readonly doc: Dynamic; readonly focusedFile: Dynamic; readonly selection: Dynamic; readonly camera: Dynamic; readonly clipboardAdapter: Dynamic; readonly copySelection: Dynamic; readonly pasteSelection: Dynamic; readonly clipboardSubscription: Dynamic; readonly measureViewport: Dynamic; readonly copySelectionRef: Dynamic; readonly pasteSelectionRef: Dynamic; readonly editing: Dynamic; readonly showDragToast: Dynamic; readonly copyBoards: Dynamic; readonly pasteBoards: Dynamic; readonly buildClipboardPayload: Dynamic; readonly pasteExternal: Dynamic; readonly pasteHtml: Dynamic; readonly handleImageDrop: Dynamic; readonly pendingCopy: Dynamic; readonly buildClipboardText: Dynamic; readonly pasteTimer: Dynamic; readonly lastPasteKeyTime: Dynamic; readonly pendingSelectionOperations: Dynamic; readonly abandonSelectionGesture: Dynamic }): Dynamic {
    let handleKeyDown: Dynamic = (event?: Dynamic): Dynamic => {
        if (!(event.metaKey || event.ctrlKey) || event.altKey) return;
        let key: Dynamic = event.key.toLowerCase();
        if (
          (key !== "c" && key !== "v") ||
          (!deps.editing.current && key !== "c") ||
          isEditingInputTarget(event.target)
        )
          return;
        if (event.shiftKey) {
          key === "v" && (deps.lastPasteKeyTime.current = event.timeStamp);
          return;
        }
        key === "v" && (deps.lastPasteKeyTime.current = -1 / 0);
        if (key === "c") {
          let selection: Dynamic = deps.selection.current;
          if (!canvasElementSelectionCount(selection)) {
            let isFocusedFileSelected: Dynamic =
              deps.focusedFile.current != null &&
              selection.elements.has(deps.focusedFile.current);
            if (!deps.copySelectionRef.current && isFocusedFileSelected) return;
            if (deps.pendingSelectionOperations.current > 0) {
              let clipboardMark: Dynamic = startClipboardMark({
                markable: false,
              });
              deps.abandonSelectionGesture.current((): Dynamic => {
                deps.pasteSelectionRef.current(clipboardMark);
              }, clipboardMark.drop);
              event.stopPropagation();
            } else deps.pasteSelectionRef.current() && event.stopPropagation();
            return;
          }
          event.stopPropagation();
          if (event.repeat) return;
          let files: Dynamic = deps.doc.content().files;
          if (
            !(selection.artboards.size === 0
              ? selection.notes.size > 0
              : [...selection.artboards].some((file?: Dynamic): Dynamic => {
                  let source: Dynamic = files[file];
                  return (
                    typeof source == "string" &&
                    !isLoadingArtboardHtml(source)
                  );
                }))
          )
            return;
          let state: Dynamic = {
            files: new Set(selection.artboards),
            notes: new Set(selection.notes),
            mark: undefined,
          };
          deps.pendingCopy.current = state;
          deps.copyBoards.current(
            state.files,
            state.notes,
            (): Dynamic => state.mark,
          );
          createFocusTrap();
          setTimeout((): Dynamic => {
            deps.pendingCopy.current === state && (deps.pendingCopy.current = null);
          }, 100);
          return;
        }
        if (hasBlockingEditorOverlay()) return;
        let artboardClip: Dynamic = getArtboardClipboard(),
          noteClip: Dynamic = getAnnotationClipboard(),
          pasteTarget: Dynamic = deps.clipboardAdapter(),
          canvasPasteTarget: Dynamic = pasteTarget?.overAnnotation ? null : pasteTarget,
          pasteAnchor: Dynamic = artboardClip
            ? deps.pasteSelection(artboardClip, noteClip, pasteTarget, canvasPasteTarget)
            : null;
        if (!artboardClip && !canvasPasteTarget) return;
        event.stopPropagation();
        clearTimeout(deps.pasteTimer.current);
        let wasSettling: Dynamic = isClipboardSettling();
        deps.pasteTimer.current = setTimeout((): Dynamic => {
          let isSettling: Dynamic =
            wasSettling || isClipboardSettling();
          afterClipboardSettled((): Dynamic => {
            if (!deps.editing.current) return;
            let latestArtboardClip: Dynamic = isSettling
                ? getArtboardClipboard()
                : artboardClip,
              latestNoteClip: Dynamic = isSettling
                ? getAnnotationClipboard()
                : noteClip,
              latestPasteTarget: Dynamic = isSettling ? deps.clipboardAdapter() : pasteTarget,
              latestCanvasTarget: Dynamic = latestPasteTarget?.overAnnotation ? null : latestPasteTarget;
            latestArtboardClip
              ? deps.pasteBoards.current(
                  latestArtboardClip,
                  latestNoteClip,
                  isSettling
                    ? deps.pasteSelection(latestArtboardClip, latestNoteClip, latestPasteTarget, latestCanvasTarget)
                    : pasteAnchor,
                )
              : latestCanvasTarget &&
                readCanvasClipboardText().then(
                  (text?: Dynamic): Dynamic =>
                    deps.pasteHtml.current(
                      latestCanvasTarget,
                      getActiveClipboardSource({
                        text: text,
                        stamp: null,
                        hasImage: false,
                      }) === "text"
                        ? text
                        : "",
                    ),
                );
          });
        }, 100);
      },
      focusTrap: Dynamic = null,
      removeFocusTrap: Dynamic = (): Dynamic => {
        if (!focusTrap) return;
        let previousFocus: Dynamic = focusTrap.__prev ?? null;
        focusTrap.remove();
        focusTrap = null;
        previousFocus instanceof HTMLElement &&
          previousFocus !== (document as Dynamic).body &&
          previousFocus.isConnected &&
          previousFocus.focus({
            preventScroll: true,
          });
      },
      createFocusTrap: Dynamic = (): Dynamic => {
        removeFocusTrap();
        let textarea: Dynamic = (document as Dynamic).createElement(
          "textarea",
        );
        textarea.__prev = (document as Dynamic).activeElement;
        textarea.setAttribute("aria-hidden", "true");
        textarea.value = " ";
        textarea.style.cssText =
          "position:fixed;left:0;top:0;width:1px;height:1px;opacity:0;pointer-events:none;border:0;padding:0";
        (document as Dynamic).body.appendChild(textarea);
        textarea.focus({
          preventScroll: true,
        });
        textarea.select();
        focusTrap = textarea;
        setTimeout(removeFocusTrap, 0);
      },
      handleCopy: Dynamic = (event?: Dynamic): Dynamic => {
        let pendingCopy: Dynamic = deps.pendingCopy.current;
        if (!event.isTrusted || pendingCopy == null) return;
        deps.pendingCopy.current = null;
        let { stamp: stamp, rendition: rendition }: Dynamic = deps.buildClipboardText(
          pendingCopy.files,
          pendingCopy.notes,
        );
        event.preventDefault();
        event.stopImmediatePropagation();
        writeClipboardObject(event, DesignArtboardsKey, {
          data: {
            stamp: stamp,
            ...deps.buildClipboardPayload.current(pendingCopy.files, pendingCopy.notes),
          },
          text: rendition,
        }) &&
          ((pendingCopy.mark = {
            stamp: stamp,
            rendition: rendition,
          }),
          mirrorArtboardClipboardStamp(stamp, rendition));
      },
      handlePaste: Dynamic = (event?: Dynamic): Dynamic => {
        clearTimeout(deps.pasteTimer.current);
        if (!deps.editing.current || event.timeStamp - deps.lastPasteKeyTime.current < 1e3)
          return;
        let items: Dynamic = [...(event.clipboardData?.files ?? [])],
          mediaFiles: Dynamic = items.filter(
            (file?: Dynamic): Dynamic =>
              isImageFile(file) ||
              isVideoFile(file),
          ),
          pastedText: Dynamic =
            event.clipboardData?.getData("text/plain") ?? "",
          clipboardObject: Dynamic = readBoundedClipboardObject(event),
          foreignArtboards: Dynamic = readArtboardClipboard(clipboardObject),
          state: Dynamic = {
            text: pastedText,
            stamp: clipboardObjectStamp(clipboardObject),
            hasImage:
              mediaFiles.length > 0 &&
              clipboardContainsFileNames(items, pastedText),
            artboards: foreignArtboards,
          },
          refusal: Dynamic = imagePasteRefusal(
            event.target,
            getActiveClipboardSource(state) === "image",
            pastedText,
            mediaFiles.length > 0 && mediaFiles.every(isVideoFile)
              ? "video"
              : "image",
          );
        refusal.to === "nobody" &&
          (event.preventDefault(),
          event.stopImmediatePropagation(),
          deps.showDragToast.current(refusal.say));
        if (refusal.to !== "canvas") return;
        let isSettling: Dynamic = isClipboardSettling(),
          consumeEvent: Dynamic = (shouldStop?: Dynamic): Dynamic => {
            isSettling
              ? markConsumedClipboardStamp(event)
              : (event.preventDefault(),
                shouldStop && event.stopImmediatePropagation());
          };
        afterClipboardSettled(
          (): Dynamic => {
            if (!deps.editing.current) return;
            let clipboardSource: Dynamic = getActiveClipboardSource(
                state,
              ),
              artboardClip: Dynamic = getArtboardClipboard(),
              noteClip: Dynamic = getAnnotationClipboard(),
              pasteTarget: Dynamic = deps.clipboardAdapter(),
              canvasPasteTarget: Dynamic = pasteTarget?.overAnnotation ? null : pasteTarget;
            if (clipboardSource === "foreign-artboards") {
              consumeEvent(false);
              deps.pasteExternal.current(foreignArtboards, deps.copySelection());
              return;
            }
            let centeredArtboard: Dynamic =
                clipboardSource === "image" &&
                (pasteTarget == null
                  ? deps.focusedFile.current == null
                  : pasteTarget.file == null)
                  ? deps.clipboardSubscription()
                  : null,
              imageTarget: Dynamic =
                clipboardSource === "image" && centeredArtboard == null ? pasteTarget : null,
              isCanvasImagePaste: Dynamic =
                clipboardSource === "image" &&
                centeredArtboard == null &&
                imageTarget == null &&
                deps.focusedFile.current == null;
            if (artboardClip && clipboardSource === "artboards") {
              consumeEvent(true);
              deps.pasteBoards.current(
                artboardClip,
                noteClip,
                deps.pasteSelection(artboardClip, noteClip, pasteTarget, canvasPasteTarget),
              );
              return;
            }
            if (
              centeredArtboard == null &&
              imageTarget == null &&
              !isCanvasImagePaste &&
              (clipboardSource === "image" || canvasPasteTarget == null)
            )
              return;
            consumeEvent(true);
            let {
                w: viewportWidth,
                h: viewportHeight,
                top: viewportTop,
              }: Dynamic = deps.measureViewport(),
              camera: Dynamic = deps.camera.get();
            if (centeredArtboard != null) {
              let center: Dynamic = visibleArtboardCenter(
                centeredArtboard,
                {
                  ...camera,
                  y: camera.y + viewportTop / camera.scale,
                  width: viewportWidth,
                  height: viewportHeight - viewportTop,
                },
              );
              deps.handleImageDrop.current(
                mediaFiles,
                center.x,
                center.y,
                "pasted",
                centeredArtboard.file,
              );
            } else
              imageTarget != null
                ? deps.handleImageDrop.current(
                    mediaFiles,
                    imageTarget.x,
                    imageTarget.y,
                    "pasted",
                    imageTarget.file ?? undefined,
                  )
                : isCanvasImagePaste
                  ? deps.handleImageDrop.current(
                      mediaFiles,
                      camera.x + viewportWidth / 2 / camera.scale,
                      camera.y + (viewportTop + viewportHeight) / 2 / camera.scale,
                      "pasted",
                    )
                  : deps.pasteHtml.current(
                      canvasPasteTarget,
                      clipboardSource === "text" ? pastedText : "",
                    );
          },
          (): Dynamic => markConsumedClipboardStamp(event),
        );
      };
    (window as Dynamic).addEventListener("keydown", handleKeyDown, true);
    (window as Dynamic).addEventListener("copy", handleCopy, true);
    (window as Dynamic).addEventListener("paste", handlePaste, true);
    return (): Dynamic => {
      clearTimeout(deps.pasteTimer.current);
      removeFocusTrap();
      (window as Dynamic).removeEventListener("keydown", handleKeyDown, true);
      (window as Dynamic).removeEventListener("copy", handleCopy, true);
      (window as Dynamic).removeEventListener("paste", handlePaste, true);
    };
  }

/** 画板菜单选择复制为 PNG 时运行：截取画板图像并写入系统剪贴板，处理不可见、无法绘制与缺图提示。 */
interface ArtboardClipboardCaptureContext {
  readonly capture: {
    readonly artboardEntries: Dynamic;
    readonly waitForFrame: Dynamic;
    readonly canFitArtboard: Dynamic;
    readonly renderFitAction: Dynamic;
    readonly pageContents: Dynamic;
    readonly rules: Dynamic;
  };
  readonly execution: {
    readonly setExportBusy: (busy: boolean) => void;
    readonly downloadsWithheld: boolean;
    readonly isExportBusy: () => boolean;
  };
  readonly feedback: {
    readonly hideToast: Dynamic;
    readonly showToast: Dynamic;
  };
}

export function copyArtboardAsPng(deps: ArtboardClipboardCaptureContext, file?: Dynamic): Dynamic {
        if (deps.execution.downloadsWithheld) return;
        if (deps.execution.isExportBusy())
          return void deps.feedback.showToast(anotherExportRunningMessage);
        let artboard: Dynamic = deps.capture.pageContents.current.artboards.find(
            (item?: Dynamic): Dynamic => item.file === file,
          ),
          generationAtStart: Dynamic = clipboardGeneration(),
          isStillCurrent: Dynamic = createCurrentWorkingGeneration(),
          failureMessage: Dynamic = null,
          isClipboardBlocked: Dynamic = false,
          state: Dynamic = {
            blank: 0,
          },
          blobPromise: Dynamic = (async (): Promise<Dynamic> => {
            deps.execution.setExportBusy(true);
            try {
              if (!(await allowsClipboardImages())) {
                isClipboardBlocked = true;
                return null;
              }
              let frameElement: Dynamic = await deps.capture.waitForFrame(file),
                previewHandle: Dynamic = frameElement
                  ? createPreviewHandle(frameElement)
                  : null;
              if (
                !frameElement ||
                !previewHandle ||
                frameElement.getBoundingClientRect().width === 0
              ) {
                failureMessage = deps.capture.artboardEntries.current.get(file)?.isBlocked()
                  ? previewStoppedMessage
                  : notVisibleMessage;
                return null;
              }
              let captureResult: Dynamic = await captureArtboardImage(
                previewHandle,
                "png",
                2,
                artboard
                  ? getArtboardCaptureOptions(artboard, deps.capture.rules)
                  : {
                      selectionRoot: "body",
                    },
              ).catch(
                (error?: Dynamic): Dynamic => (
                  (failureMessage = errorMessage(error)),
                  null
                ),
              );
              return captureResult
                ? captureResult.ok
                  ? ((state = {
                      blank: captureResult.embedWarningCount,
                      ...(captureResult.clipped
                        ? {
                            clipped: true,
                          }
                        : {}),
                    }),
                    clipboardGeneration() === generationAtStart &&
                    isStillCurrent()
                      ? pngDataUrlToBlob(captureResult.uri)
                      : null)
                  : ((failureMessage =
                      captureResult.softError === "zero-size"
                        ? noSizeMessage
                        : ItsPageHasNothingToDrawMessage),
                    null)
                : null;
            } catch (error: Dynamic) {
              console.error("[copy-png] artboard", error);
              failureMessage = ItsPictureCouldnTBeMadeTryMessage;
              return null;
            } finally {
              deps.execution.setExportBusy(false);
            }
          })();
        writeClipboardPng(blobPromise).then(
          (writeResult?: Dynamic): Dynamic => {
            if (
              !(
                clipboardGeneration() !== generationAtStart || !isStillCurrent()
              )
            )
              if (writeResult === "copied") {
                clearClipboardBuffers();
                announce(
                  copiedAsPngMessage,
                );
                if (state.clipped) {
                  let fileName: Dynamic = exportFileName(
                      file,
                      artboard?.title,
                    ),
                    canExportFull: Dynamic = deps.capture.canFitArtboard(file),
                    toastId: Dynamic = deps.feedback.showToast(
                      clippedArtboardsMessage(
                        [fileName],
                        canExportFull,
                      ),
                      "info",
                      canExportFull
                        ? {
                            action: deps.capture.renderFitAction(
                              [file],
                              false,
                              (): Dynamic => deps.feedback.hideToast(toastId),
                              false,
                            ),
                            pinned: true,
                          }
                        : undefined,
                    );
                }
                state.blank > 0 &&
                  deps.feedback.showToast(
                    missingCopiedImagesMessage(state.blank),
                    "info",
                  );
              } else
                isClipboardBlocked
                  ? deps.feedback.showToast(DownloadsArenTAvailableToYouForMessage)
                  : deps.feedback.showToast(
                      pngCopyFailureMessage(
                        "artboard",
                        writeResult === "refused" ? null : failureMessage,
                      ),
                      "error",
                    );
          },
        );
      }

/** 画板菜单选择复制为 SVG 时运行：在捕获视口中生成 SVG 并写入剪贴板，处理裁切、缺图与失败提示。 */
export function copyArtboardAsSvg(deps: ArtboardClipboardCaptureContext, file?: Dynamic): Dynamic {
        if (deps.execution.downloadsWithheld) return;
        if (deps.execution.isExportBusy())
          return void deps.feedback.showToast(anotherExportRunningMessage);
        let artboard: Dynamic = deps.capture.pageContents.current.artboards.find(
            (item?: Dynamic): Dynamic => item.file === file,
          ),
          generationAtStart: Dynamic = clipboardGeneration(),
          isStillCurrent: Dynamic = createCurrentWorkingGeneration(),
          failureMessage: Dynamic = null,
          isClipboardBlocked: Dynamic = false,
          blankImageCount: Dynamic = 0,
          wasClipped: Dynamic = false,
          svgPromise: Dynamic = (async (): Promise<Dynamic> => {
            deps.execution.setExportBusy(true);
            try {
              if (!(await allowsClipboardImages())) {
                isClipboardBlocked = true;
                return null;
              }
              let frameElement: Dynamic = await deps.capture.waitForFrame(file),
                previewHandle: Dynamic = frameElement
                  ? createPreviewHandle(frameElement)
                  : null;
              if (
                !frameElement ||
                !previewHandle ||
                frameElement.getBoundingClientRect().width === 0
              ) {
                failureMessage = deps.capture.artboardEntries.current.get(file)?.isBlocked()
                  ? previewStoppedMessage
                  : notVisibleMessage;
                return null;
              }
              let captureOptions: Dynamic = artboard
                  ? getArtboardCaptureOptions(artboard, deps.capture.rules)
                  : null,
                frame: Dynamic = captureOptions?.frame,
                validFrame: Dynamic =
                  frame &&
                  Number.isFinite(frame.w) &&
                  Number.isFinite(frame.h) &&
                  frame.w > 0 &&
                  frame.h > 0
                    ? frame
                    : null,
                captureResult: Dynamic = await withCaptureViewport(
                  previewHandle,
                  validFrame,
                  (): Dynamic =>
                    captureClipboardSvg(
                      previewHandle,
                      "page",
                      validFrame && {
                        w: validFrame.w,
                        h: captureOptions?.clipToFrame ? validFrame.h : null,
                      },
                    ),
                  captureOptions?.settle === true,
                ).catch(
                  (error?: Dynamic): Dynamic => (
                    console.error("[copy-svg] artboard", error),
                    (failureMessage = svgCopyErrorMessage(error)),
                    null
                  ),
                );
              return captureResult
                ? captureResult.ok
                  ? ((blankImageCount = captureResult.blank),
                    (wasClipped = captureResult.clipped),
                    clipboardGeneration() === generationAtStart &&
                    isStillCurrent()
                      ? captureResult.svg
                      : null)
                  : ((failureMessage =
                      captureResult.softError === "zero-size"
                        ? noSizeMessage
                        : conversionFailedMessage),
                    null)
                : null;
            } catch (error: Dynamic) {
              console.error("[copy-svg] artboard", error);
              failureMessage = conversionFailedMessage;
              return null;
            } finally {
              deps.execution.setExportBusy(false);
            }
          })();
        writeClipboardSvg(svgPromise).then(
          (writeResult?: Dynamic): Dynamic => {
            if (
              !(
                clipboardGeneration() !== generationAtStart || !isStillCurrent()
              )
            )
              if (writeResult === "copied") {
                clearClipboardBuffers();
                announce(
                  copiedAsSvgMessage,
                );
                if (wasClipped) {
                  let canExportFull: Dynamic = deps.capture.canFitArtboard(file),
                    toastId: Dynamic = deps.feedback.showToast(
                      clippedSvgCopyMessage(
                        formatArtboardNames([
                          exportFileName(file, artboard?.title),
                        ]),
                        canExportFull,
                      ),
                      "info",
                      canExportFull
                        ? {
                            action: deps.capture.renderFitAction(
                              [file],
                              false,
                              (): Dynamic => deps.feedback.hideToast(toastId),
                              false,
                            ),
                            pinned: true,
                          }
                        : undefined,
                    );
                }
                blankImageCount > 0 &&
                  deps.feedback.showToast(
                    missingSvgImagesMessage(blankImageCount),
                    "info",
                  );
              } else
                isClipboardBlocked
                  ? deps.feedback.showToast(DownloadsArenTAvailableToYouForMessage)
                  : deps.feedback.showToast(
                      svgCopyFailureMessage(
                        "artboard",
                        writeResult === "refused" ? null : failureMessage,
                      ),
                      "error",
                    );
          },
        );
      }
