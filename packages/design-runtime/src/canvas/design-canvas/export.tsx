import { DownloadsArenTAvailableToYouForMessage } from "../../export/downloads";
import { ExportCancelled } from "../../export/host-registry";
import { ExportCaptureViewportLimit } from "../../export/capture-viewport";
import { ExportDownloadsResolvedValue } from "../../export/downloads";
import { projectFileKey } from "../../platform/file-content";
import { artboardNeedsScaledDownExport } from "../../export/picker";
import { canvasMetadataFile } from "../../platform/file-content";
import { captureArtboardImage } from "../../export/image";
import { captureExportArtboards } from "../../export/capture";
import { classifyExportAbort } from "../../export/outcomes";
import { classifyExportFailure } from "../../export/outcomes";
import { classifyExportSaveOutcome } from "../../export/outcomes";
import { clippedArtboardsMessage } from "../../export/warnings";
import { collectExportUploadedAssets } from "../../export/uploaded-assets";
import { collectPdfExportPages } from "../../export/pdf/orchestration";
import { createPreviewHandle } from "../../preview/evaluation";
import { createStoredZip } from "../../export/stored-zip";
import { dataUrlToBytes } from "../../export/capture-warnings";
import { describeExportCaptureWarnings } from "../../export/capture";
import { designAnalyticsEvents } from "../../platform/health-and-analytics";
import { designExportReadme } from "../../export/readme";
import { downloadsWithheld } from "../../export/downloads";
import { drainArtboardExportCaptures } from "../../export/capture";
import { emptyExportTailMessage } from "../../export/warnings";
import { errorMessage } from "../../platform/rate-limiter";
import { exportArtboardImage } from "../../export/image";
import { exportBaseFileName } from "../../export/file-names";
import { exportDeliveryEventName } from "../../export/delivery";
import { exportFileName } from "../../export/file-names";
import { fetchExportAsset } from "../../export/uploaded-assets";
import { fontSubstitutionWarnings } from "../../export/warnings";
import { getArtboardCaptureMode } from "../../export/warnings";
import { getArtboardCaptureOptions } from "../../export/warnings";
import { getKvClient } from "../../platform/file-content";
import { healthReporter } from "../../platform/health-and-analytics";
import { imageCaptureScaleOptions } from "../../export/paper-and-scale";
import { initialExportPickedFiles } from "../../export/picker";
import { initialExportScale } from "../../export/picker";
import { interactiveExportDeadline } from "../../export/picker";
import { isEmulator } from "../../platform/emulator";
import { isFillPagedExport } from "../../export/paper-and-scale";
import { isLoadingArtboardHtml } from "../../platform/design-document-adapter";
import { isProjectSourcePath } from "../../preview/component-imports";
import { measureEmptyExportTail } from "../../export/capture-viewport";
import { minEmptyExportTail } from "../../export/paper-and-scale";
import { missingExportAssetSuffix } from "../../export/readme";
import { noExportableArtboardsMessage } from "../../export/artboard-menu";
import { pdfExportMessage } from "../../export/pdf/orchestration";
import { pdfExportWarnings } from "../../export/pdf/orchestration";
import { prepareExportDcDocument } from "../../preview/build-document";
import { reportExportBuilt } from "../../export/analytics";
import { reportExportEvent } from "../../export/analytics";
import { reportExportOutcome } from "../../platform/health-and-analytics";
import { sanitizeExportFileName } from "../../export/file-names";
import { saveThroughHost } from "../../export/downloads";
import { selectExportCaptureArtboard } from "../../export/capture";
import { type Dynamic } from "../../runtime-types";
import type { ExportArtboard } from "../../contracts/export";
import type { CanvasArtboard } from "../manifest-history";
import { uiMessage } from "@minedesign/contracts/ui-messages";
import { withClosedPreview } from "../preview-navigation";

/** 导出或捕获画板前使用：临时关闭全屏播放，等预览布局稳定后执行任务，结束后在条件允许时恢复播放并还原焦点。 */
interface ClosedPreviewExportContext {
  readonly view: {
    readonly container: Dynamic;
    readonly setPlayingFile: Dynamic;
    readonly playingFile: Dynamic;
    readonly navigateAfterEdits: Dynamic;
    readonly restoreCamera: Dynamic;
    readonly fullscreenFile: Dynamic;
    readonly setFullscreenView: Dynamic;
    readonly fullscreenView: Dynamic;
    readonly landingFile: Dynamic;
  };
  readonly artboards: {
    readonly entries: Dynamic;
    readonly pageContents: Dynamic;
  };
  readonly picker: {
    readonly isOpen: Dynamic;
    readonly fullExportEnabled: boolean;
  };
}

export function runWithPlayPreviewClosed(deps: ClosedPreviewExportContext, exportArtboards?: Dynamic, closeOptions?: Dynamic): Dynamic {
        let focusedElement: Dynamic = null,
          hasUserInteracted: Dynamic = false,
          markUserInteracted: Dynamic = (): Dynamic => {
            hasUserInteracted = true;
          },
          setInteractionListening: Dynamic = (shouldListen?: Dynamic): Dynamic => {
            for (let eventType of [
              "pointerdown",
              "wheel",
              "keydown",
            ] as Dynamic)
              shouldListen
                ? deps.view.container.current?.addEventListener(eventType, markUserInteracted, {
                    capture: true,
                    passive: true,
                  })
                : deps.view.container.current?.removeEventListener(
                    eventType,
                    markUserInteracted,
                    true,
                  );
          },
          canReopen: Dynamic = (previewState?: Dynamic): Dynamic =>
            !hasUserInteracted &&
            deps.view.fullscreenFile.current === null &&
            deps.view.playingFile.current === null &&
            !deps.picker.isOpen() &&
            deps.artboards.pageContents.current.artboards.some(
              (artboard?: Dynamic): Dynamic => artboard.file === previewState.file,
            ),
          restoreFocus: Dynamic = (attemptsLeft?: Dynamic): Dynamic => {
            if (
              focusedElement === null ||
              focusedElement.isConnected ||
              ((document as Dynamic).activeElement !==
                (document as Dynamic).body &&
                (document as Dynamic).activeElement !== null)
            )
              return;
            let queryElement: Dynamic = (selector?: Dynamic): Dynamic =>
                (document as Dynamic).querySelector(selector),
              exportButton: Dynamic =
                queryElement('button[data-testid="mega-export"]') ??
                queryElement('[data-testid="mega-export"] button') ??
                queryElement('[data-testid="mega-collapse"]');
            exportButton
              ? exportButton.focus({
                  preventScroll: true,
                })
              : attemptsLeft > 0 &&
                requestAnimationFrame((): Dynamic => restoreFocus(attemptsLeft - 1));
          };
        return withClosedPreview(
          {
            current: (): Dynamic => {
              let currentPreview: Dynamic = deps.view.fullscreenView.current;
              return !deps.picker.fullExportEnabled || currentPreview === null
                ? null
                : exportArtboards.some(
                      (artboard?: Dynamic): Dynamic =>
                        artboard.file !== currentPreview.file,
                    )
                  ? {
                      ...currentPreview,
                      playing: deps.view.playingFile.current === currentPreview.file,
                    }
                  : null;
            },
            leave: (): Dynamic => {
              focusedElement =
                (document as Dynamic).hasFocus() &&
                (document as Dynamic).activeElement !==
                  (document as Dynamic).body
                  ? (document as Dynamic).activeElement
                  : null;
              deps.view.restoreCamera.current();
              setInteractionListening(true);
            },
            laidOut: async (): Promise<Dynamic> => {
              await new Promise(
                (resolveSettled?: Dynamic): Dynamic =>
                  setTimeout((): Dynamic => {
                    let fallbackTimer: Dynamic = setTimeout(resolveSettled, 250);
                    requestAnimationFrame(
                      (): Dynamic =>
                        requestAnimationFrame(
                          (): Dynamic => (clearTimeout(fallbackTimer), resolveSettled()),
                        ),
                    );
                  }, 0),
              );
              await Promise.all(
                exportArtboards.map((artboard?: Dynamic): Dynamic => {
                  let webview: Dynamic = deps.artboards.entries.current.get(artboard.file)
                    ?.previewFrameRef.current;
                  return webview
                    ? createPreviewHandle(webview)
                        ?.awaitSettled(1500)
                        .catch((): Dynamic => {})
                    : undefined;
                }),
              );
            },
            mayReopen: canReopen,
            reopen: ({ playing: playing, ...props }: Dynamic): Dynamic =>
              new Promise(
                (resolveReopened?: Dynamic): Dynamic =>
                  deps.view.navigateAfterEdits((): Dynamic => {
                    resolveReopened();
                    setInteractionListening(false);
                    if (!canReopen(props)) return;
                    deps.view.landingFile.current = props.file;
                    deps.view.setFullscreenView(props);
                    playing && deps.view.setPlayingFile(props.file);
                    requestAnimationFrame((): Dynamic => restoreFocus(2));
                    let openDialog: Dynamic =
                      focusedElement !== null
                        ? (document as Dynamic).activeElement?.closest(
                            '[role="dialog"], [role="alertdialog"]',
                          )
                        : null;
                    if (openDialog) {
                      let observer: Dynamic = new MutationObserver(
                          (): Dynamic => {
                            openDialog.isConnected ||
                              (stopWatching(),
                              setTimeout((): Dynamic => restoreFocus(2), 0));
                          },
                        ),
                        stopWatching: Dynamic = (): Dynamic => (
                          observer.disconnect(),
                          clearTimeout(watchTimeout)
                        ),
                        watchTimeout: Dynamic = setTimeout(stopWatching, 12e4);
                      observer.observe((document as Dynamic).body, {
                        childList: true,
                        subtree: true,
                      });
                    }
                  }),
              ),
          },
          closeOptions,
        ).finally((): Dynamic => setInteractionListening(false));
      }

/** 从画板菜单导出单个画板为图片时运行：截取画板、检查字体替换与裁切及空白尾部，再保存文件并上报结果。 */
interface ArtboardPngExportContext {
  readonly capture: {
    readonly artboardEntries: Dynamic;
    readonly waitForFrame: Dynamic;
    readonly describeScope: Dynamic;
    readonly canFitArtboard: Dynamic;
    readonly renderFitAction: Dynamic;
    readonly manifest: Dynamic;
    readonly rules: Dynamic;
  };
  readonly execution: {
    readonly setExportBusy: (busy: boolean) => void;
    readonly downloadsWithheld: boolean;
    readonly exportBusy: boolean;
  };
  readonly feedback: {
    readonly hideToast: Dynamic;
    readonly showToast: Dynamic;
  };
}

export async function exportArtboardAsPng(deps: ArtboardPngExportContext, file?: Dynamic, scale?: Dynamic): Promise<Dynamic> {
        if (!deps.execution.exportBusy) {
          if (deps.execution.downloadsWithheld) {
            deps.feedback.showToast(DownloadsArenTAvailableToYouForMessage);
            return;
          }
          deps.execution.setExportBusy(true);
          try {
            let frameElement: Dynamic = await deps.capture.waitForFrame(file),
              previewHandle: Dynamic = frameElement
                ? createPreviewHandle(frameElement)
                : null;
            if (
              !frameElement ||
              !previewHandle ||
              frameElement.getBoundingClientRect().width === 0
            ) {
              deps.feedback.showToast(
                deps.capture.artboardEntries.current.get(file)?.isBlocked()
                  ? uiMessage("canvas.designCanvas.thisArtboardSPreviewIs")
                  : uiMessage("canvas.designCanvas.thisArtboardIsnTVisible"),
              );
              healthReporter.report(
                ...classifyExportAbort("image"),
              );
              return;
            }
            let artboard: Dynamic = deps.capture.manifest.artboards.find(
                (item?: Dynamic): Dynamic => item.file === file,
              ),
              baseName: Dynamic = exportFileName(
                file,
                artboard?.title,
              ),
              capture: Dynamic = await exportArtboardImage(
                previewHandle,
                file,
                "png",
                scale ?? 2,
                {
                  ...(artboard
                    ? getArtboardCaptureOptions(
                        artboard,
                        deps.capture.rules,
                      )
                    : {
                        selectionRoot: "body",
                      }),
                  filename:
                    scale == null
                      ? baseName + ".png"
                      : baseName + "@" + scale + "x.png",
                  scope: deps.capture.describeScope(1, "one"),
                },
              ),
              [fontWarning]: Dynamic = fontSubstitutionWarnings(
                capture.fontWarningCount,
              ),
              toastDetails: Dynamic =
                fontWarning !== undefined
                  ? {
                      description: fontWarning,
                    }
                  : undefined;
            if (!capture.ok)
              deps.feedback.showToast(
                uiMessage("canvas.designCanvas.couldnTCaptureThisArtboard"),
                "error",
              );
            else if (capture.saveOutcome === "withheld")
              deps.feedback.showToast(DownloadsArenTAvailableToYouForMessage);
            else if (
              capture.clipped &&
              capture.saveOutcome !== "declined"
            ) {
              let canFixClipping: Dynamic = deps.capture.canFitArtboard(file),
                clippedToastId: Dynamic = deps.feedback.showToast(
                  clippedArtboardsMessage([baseName], canFixClipping),
                  "info",
                  canFixClipping
                    ? {
                        ...toastDetails,
                        action: deps.capture.renderFitAction(
                          [file],
                          false,
                          (): Dynamic => deps.feedback.hideToast(clippedToastId),
                          capture.saveOutcome === "unsupported",
                        ),
                        pinned: true,
                      }
                    : toastDetails,
                );
            } else if (capture.saveOutcome !== "declined") {
              let shownTailWarning: Dynamic = false;
              if (
                artboard &&
                getArtboardCaptureMode(artboard, deps.capture.rules) ===
                  "full" &&
                isFillPagedExport(artboard)
              ) {
                let emptyTail: Dynamic = await measureEmptyExportTail(previewHandle, {
                  w: artboard.w,
                  h: artboard.h,
                }).catch((): Dynamic => null);
                if (
                  emptyTail !== null &&
                  emptyTail >= minEmptyExportTail
                ) {
                  let canFixTail: Dynamic = deps.capture.canFitArtboard(file),
                    tailToastId: Dynamic = deps.feedback.showToast(
                      emptyExportTailMessage(
                        [baseName],
                        emptyTail,
                      ),
                      "info",
                      canFixTail
                        ? {
                            ...toastDetails,
                            action: deps.capture.renderFitAction(
                              [file],
                              false,
                              (): Dynamic => deps.feedback.hideToast(tailToastId),
                              capture.saveOutcome === "unsupported",
                            ),
                            pinned: true,
                          }
                        : toastDetails,
                    );
                  shownTailWarning = true;
                }
              }
              !shownTailWarning && fontWarning !== undefined && deps.feedback.showToast(fontWarning, "info");
            }
          } catch (error: Dynamic) {
            console.error("[download-artboard]", error);
            deps.feedback.showToast(
              uiMessage("canvas.designCanvas.couldnTExportThisArtboard") +
                errorMessage(error) +
                ".",
              "error",
            );
          } finally {
            deps.execution.setExportBusy(false);
          }
        }
      }

/** 从画板菜单导出 HTML 压缩包时运行：收集画板文件、依赖与上传素材，生成 README 并打包 zip，通过宿主或浏览器下载。 */
interface ArtboardSourceExportContext {
  readonly document: {
    readonly assets: Dynamic;
    readonly doc: Dynamic;
    readonly manifest: Dynamic;
  };
  readonly capture: {
    readonly artboardEntries: Dynamic;
  };
  readonly execution: {
    readonly setExportBusy: (busy: boolean) => void;
    readonly downloadsWithheld: boolean;
    readonly exportBusy: boolean;
  };
  readonly feedback: {
    readonly showToast: Dynamic;
  };
}

export async function exportArtboardSourceZip(deps: ArtboardSourceExportContext, file?: Dynamic): Promise<Dynamic> {
        if (!deps.execution.exportBusy) {
          if (deps.execution.downloadsWithheld) {
            deps.feedback.showToast(DownloadsArenTAvailableToYouForMessage);
            return;
          }
          deps.execution.setExportBusy(true);
          try {
            if (await downloadsWithheld()) {
              deps.feedback.showToast(DownloadsArenTAvailableToYouForMessage);
              healthReporter.report(
                ...classifyExportAbort("zip"),
              );
              return;
            }
            await deps.capture.artboardEntries.current.get(file)?.flushPending();
            let files: Dynamic = deps.document.doc.content().files,
              readFileContent: Dynamic = async (
                path?: Dynamic,
              ): Promise<Dynamic> => {
                let content: Dynamic =
                  (await getKvClient().get(
                    projectFileKey(path),
                  )) ?? files[path];
                if (
                  typeof content == "string" &&
                  path.endsWith(".dc.html") &&
                  isLoadingArtboardHtml(content)
                )
                  throw new Error(
                    "an artboard on this canvas has not loaded (its uploaded content is still arriving, or could not be read) \u2014 export again once it shows",
                  );
                return typeof content == "string" ? content : undefined;
              },
              imagePathPattern: Dynamic = /\.(png|jpe?g|gif|webp|avif|bmp|svg)$/i,
              entries: Dynamic = new Map(),
              items: Dynamic = [file];
            for (; items.length > 0; ) {
              let queuedPath: Dynamic = items.shift();
              if (entries.has(queuedPath)) continue;
              let queuedContent: Dynamic = await readFileContent(queuedPath);
              if (
                queuedContent !== undefined &&
                (entries.set(queuedPath, queuedContent), !imagePathPattern.test(queuedPath))
              )
                for (let candidatePath of Object.keys(files) as Dynamic) {
                  if (
                    candidatePath === queuedPath ||
                    entries.has(candidatePath) ||
                    candidatePath === canvasMetadataFile
                  )
                    continue;
                  let candidateName: Dynamic = (
                    candidatePath.split("/").pop() ?? candidatePath
                  ).replace(/\.dc\.html$/, "");
                  (candidatePath.endsWith(".dc.html")
                    ? queuedContent.includes('name="' + candidateName + '"')
                    : queuedContent.includes(candidatePath) ||
                      queuedContent.includes(
                        candidatePath.split("/").pop() ?? candidatePath,
                      )) && items.push(candidatePath);
                }
            }
            let base64ToBytes: Dynamic = (base64?: Dynamic): Dynamic => {
                let binary: Dynamic = atob(base64),
                  bytes: Dynamic = new Uint8Array(binary.length);
                for (let index: Dynamic = 0; index < binary.length; index++)
                  bytes[index] = binary.charCodeAt(index);
                return bytes;
              },
              uploadedAssets: Dynamic = await collectExportUploadedAssets(
                new Map(
                  [...entries].filter(
                    ([sourcePath]: Dynamic): Dynamic =>
                      isProjectSourcePath(sourcePath),
                  ),
                ),
                file,
                fetchExportAsset,
                {
                  taken: Object.keys(files),
                  emulatorBlobUrls: isEmulator(),
                },
              );
            for (let [sourcePath, sourceContent] of uploadedAssets.sources as Dynamic)
              entries.set(sourcePath, sourceContent);
            let zipEntries: Dynamic = [...uploadedAssets.entries];
            for (let [entryPath, entryContent] of entries as Dynamic)
              if (imagePathPattern.test(entryPath)) {
                let imageBytes: Dynamic;
                try {
                  imageBytes = base64ToBytes(entryContent.replace(/^data:[^,]*,/, ""));
                } catch {
                  continue;
                }
                zipEntries.push({
                  name: entryPath,
                  data: imageBytes,
                });
              } else
                entryPath.endsWith(".dc.html")
                  ? zipEntries.push({
                      name: entryPath,
                      data: prepareExportDcDocument(entryContent),
                    })
                  : zipEntries.push({
                      name: entryPath,
                      data: entryContent,
                    });
            zipEntries.push({
              name: "support.js",
              data: deps.document.assets.supportJs,
            });
            zipEntries.push({
              name: "vendor/react.js",
              data: deps.document.assets.reactUmd,
            });
            zipEntries.push({
              name: "vendor/react-dom.js",
              data: deps.document.assets.reactDomUmd,
            });
            let baseName: Dynamic = exportFileName(
              file,
              deps.document.manifest.current.artboards.find(
                (artboard?: Dynamic): Dynamic => artboard.file === file,
              )?.title,
            );
            zipEntries.push({
              name: "README.md",
              data: designExportReadme(
                baseName,
                file,
                [...entries.keys()].filter(
                  (otherFile?: Dynamic): Dynamic => otherFile !== file,
                ),
                uploadedAssets,
              ),
            });
            let zipBlob: Dynamic = createStoredZip(zipEntries),
              zipName: Dynamic = baseName + "-html.zip",
              saveResult: Dynamic = await saveThroughHost(
                zipBlob,
                zipName,
              ),
              missingSuffix: Dynamic = missingExportAssetSuffix(
                uploadedAssets.missing,
              );
            saveResult.outcome === "saved" &&
              missingSuffix === undefined &&
              deps.feedback.showToast(uiMessage("canvas.designCanvas.saved") + zipName + ".", "success");
            saveResult.outcome !== "withheld" &&
              saveResult.outcome !== "declined" &&
              missingSuffix !== undefined &&
              deps.feedback.showToast(
                (saveResult.outcome === "saved" ? uiMessage("canvas.designCanvas.saved") : uiMessage("canvas.designCanvas.built")) +
                  zipName +
                  ", " +
                  missingSuffix,
                "error",
              );
            saveResult.outcome === "withheld" &&
              deps.feedback.showToast(DownloadsArenTAvailableToYouForMessage);
            if (saveResult.outcome === "unsupported") {
              try {
                let downloadLink: Dynamic = (document as Dynamic).createElement(
                  "a",
                );
                downloadLink.href = URL.createObjectURL(zipBlob);
                downloadLink.download = zipName;
                downloadLink.rel = "noopener";
                downloadLink.style.display = "none";
                (document as Dynamic).body.appendChild(downloadLink);
                downloadLink.click();
                downloadLink.remove();
                setTimeout(
                  (): Dynamic => URL.revokeObjectURL(downloadLink.href),
                  6e4,
                );
              } catch {}
              (window as Dynamic).dispatchEvent(
                new CustomEvent(exportDeliveryEventName, {
                  detail: {
                    url: "",
                    filename: zipName,
                    embedWarningCount: 0,
                    file: {
                      blob: zipBlob,
                      mime: "application/zip",
                    },
                    refusal: saveResult.code,
                  },
                }),
              );
            }
            reportExportOutcome(
              classifyExportSaveOutcome("zip", saveResult.outcome),
              designAnalyticsEvents.exported.zip,
            );
          } catch (error: Dynamic) {
            healthReporter.report(
              ...classifyExportFailure("zip"),
            );
            deps.feedback.showToast(
              uiMessage("canvas.designCanvas.couldnTBuildTheHTML") + String(error),
              "error",
            );
          } finally {
            deps.execution.setExportBusy(false);
          }
        }
      }

/** PDF 格式导出的生成函数：拒绝并发导出，收集各画板页面生成 PDF，汇总警告并上报导出事件。 */
type PrintableArtboard = CanvasArtboard & ExportArtboard;
type ExportDeliveryState = { current: { notes: string[]; refused: boolean } };

interface PdfExportContext {
  readonly selection: {
    readonly focusedFile: { current: string | null };
    readonly current: Dynamic;
    readonly fullscreenFile: { current: string | null };
    readonly printableArtboards: PrintableArtboard[];
  };
  readonly picker: {
    readonly chooseArtboards: Dynamic;
    readonly endPicking: Dynamic;
    readonly canPickArtboards: boolean;
    readonly fullExportEnabled: boolean;
    readonly validatePrintableArtboards: Dynamic;
  };
  readonly execution: {
    readonly exporting: { current: boolean };
    readonly setExportBusy: (busy: boolean) => void;
    readonly isExportBusy: () => boolean;
    readonly withPlayPreviewClosed: Dynamic;
  };
  readonly capture: {
    readonly waitForFrame: Dynamic;
    readonly describeScope: Dynamic;
    readonly canFitArtboard: (file: string) => boolean;
    readonly rules: Dynamic;
    readonly textEncoding: Dynamic;
    readonly taggedPdf: boolean;
  };
  readonly delivery: {
    readonly state: ExportDeliveryState;
  };
  readonly feedback: {
    readonly showToast: Dynamic;
  };
}

export async function producePdfExport(deps: PdfExportContext, request?: Dynamic): Promise<Dynamic> {
        deps.delivery.state.current = {
          notes: [],
          refused: false,
        };
        let refuseExport: Dynamic = (
            message?: Dynamic,
            toastKind?: Dynamic,
            reason: Dynamic = "refused",
          ): Dynamic => {
            throw (
              (deps.delivery.state.current.refused = true),
              reportExportEvent(reason),
              deps.feedback.showToast(message, toastKind),
              new Error(message)
            );
          },
          text: Dynamic =
            uiMessage("canvas.designCanvas.anotherExportIsStillRunning");
        if (deps.execution.isExportBusy()) return refuseExport(text);
        let pickedExport: Dynamic = null;
        if (
          request.interactive &&
          deps.picker.fullExportEnabled &&
          deps.picker.canPickArtboards &&
          ((pickedExport = await deps.picker.chooseArtboards(
            "pdf",
            {
              picked: initialExportPickedFiles(
                "pdf",
                deps.selection.printableArtboards,
                deps.selection.fullscreenFile.current,
                deps.selection.current.current.artboards,
                deps.selection.focusedFile.current,
              ),
              scale: 1,
            },
            request.signal,
          )),
          deps.execution.exporting.current)
        ) {
          deps.picker.endPicking();
          return refuseExport(text);
        }
        let printableSelection: Dynamic = pickedExport
          ? deps.picker.validatePrintableArtboards(new Set(pickedExport.files), 1)
          : deps.picker.validatePrintableArtboards();
        if (!printableSelection.ok) {
          deps.picker.endPicking();
          return refuseExport(printableSelection.reason);
        }
        let controller: Dynamic = new AbortController(),
          deadlineTimer: Dynamic = setTimeout(
            (): Dynamic => controller.abort(),
            55e3,
          );
        pickedExport?.signal.addEventListener(
          "abort",
          (): Dynamic => controller.abort(),
        );
        let { signal: abortSignal }: Dynamic = controller,
          scopeInfo: Dynamic = deps.capture.describeScope(printableSelection.printable.length, "whole"),
          documentName: Dynamic = !scopeInfo.partial
            ? (document as Dynamic).title || "design"
            : (sanitizeExportFileName(
                (document as Dynamic).title,
                100,
              ) || "design") + "-selection";
        deps.execution.setExportBusy(true);
        try {
          let { blob: pdfBlob, ...pdfReport }: Dynamic = await deps.execution.withPlayPreviewClosed(
            printableSelection.printable,
            (): Dynamic =>
              collectPdfExportPages(
                printableSelection.printable,
                deps.capture.waitForFrame,
                documentName,
                {
                  signal: abortSignal,
                  rules: deps.capture.rules,
                  textEncoding: deps.capture.textEncoding,
                  tagged: deps.capture.taggedPdf,
                },
              ),
          );
          if (pickedExport?.signal.aborted) throw new ExportCancelled();
          reportExportBuilt({
            ...pdfExportWarnings(pdfReport),
            ...scopeInfo,
            picked: pickedExport !== null,
          });
          deps.delivery.state.current.notes = pdfExportMessage(
            pdfReport,
            printableSelection.printable.length,
            {
              embeds: true,
              fitAdvice: pdfReport.emptyTailFiles.some(deps.capture.canFitArtboard),
            },
          );
          return {
            filename: pdfReport.filename,
            data: pdfBlob,
          };
        } catch (error: Dynamic) {
          if (pickedExport?.signal.aborted) throw new ExportCancelled();
          console.error("[design/export]", error);
          if (abortSignal.aborted && error === abortSignal.reason)
            return refuseExport(
              uiMessage("canvas.designCanvas.preparingThisDesignSPDF"),
              "error",
              "timedOut",
            );
          throw (
            reportExportEvent("failed"),
            deps.feedback.showToast(
              "PDF export failed: " +
                errorMessage(error) +
                ".",
              "error",
            ),
            error
          );
        } finally {
          clearTimeout(deadlineTimer);
          deps.picker.endPicking();
          deps.execution.setExportBusy(false);
        }
      }

/** 整份设计导出 PNG 时运行：在截止时间内逐个截取画板图像，必要时降低缩放，汇总裁切与字体警告，可取消。 */
interface PngBatchCaptureContext {
  readonly capture: {
    readonly artboardEntries: Dynamic;
    readonly waitForFrame: Dynamic;
    readonly describeScope: Dynamic;
    readonly rules: Dynamic;
  };
  readonly execution: {
    readonly setExportBusy: (busy: boolean) => void;
  };
  readonly picker: {
    readonly endPicking: Dynamic;
  };
  readonly delivery: {
    readonly state: ExportDeliveryState;
  };
  readonly feedback: {
    readonly showToast: Dynamic;
  };
}

export async function captureArtboardPngsForExport(deps: PngBatchCaptureContext, artboards?: Dynamic,
        request?: Dynamic,
        startedAt?: Dynamic): Promise<Dynamic> {
        let scopeInfo: Dynamic = deps.capture.describeScope(artboards.length, "whole"),
          refuseExport: Dynamic = (
            message?: Dynamic,
            toastKind?: Dynamic,
            reason: Dynamic = "refused",
          ): Dynamic => {
            throw (
              (deps.delivery.state.current.refused = true),
              reportExportEvent(reason),
              deps.feedback.showToast(message, toastKind),
              new Error(message)
            );
          };
        if (request.signal.aborted)
          throw (deps.picker.endPicking(), new ExportCancelled());
        let controller: Dynamic = new AbortController(),
          deadlineTimer: Dynamic = setTimeout(
            (): Dynamic => controller.abort(),
            interactiveExportDeadline(startedAt) - Date.now(),
          );
        request.signal.addEventListener(
          "abort",
          (): Dynamic => controller.abort(),
        );
        let { signal: abortSignal }: Dynamic = controller,
          failedArtboardLabel: Dynamic = null,
          reducedSizeLabels: Dynamic = [],
          index: Dynamic = 0;
        deps.execution.setExportBusy(true);
        try {
          let captureSummary: Dynamic = await captureExportArtboards(
            artboards,
            async (artboard?: Dynamic): Promise<Dynamic> => {
              let artboardLabel: Dynamic =
                  '"' +
                  (artboard.title ??
                    exportBaseFileName(artboard.file)) +
                  '"',
                frameElement: Dynamic = await deps.capture.waitForFrame(artboard.file);
              abortSignal.throwIfAborted();
              let previewHandle: Dynamic = frameElement
                ? createPreviewHandle(frameElement)
                : null;
              if (deps.capture.artboardEntries.current.get(artboard.file)?.isBlocked())
                return refuseExport(
                  artboardLabel +
                    "\u2019s preview is stopped \u2014 reload it before exporting.",
                );
              if (!frameElement || !previewHandle)
                return refuseExport(
                  artboardLabel +
                    " is still loading \u2014 try again in a moment.",
                );
              if (frameElement.getBoundingClientRect().width === 0)
                return refuseExport(
                  artboardLabel +
                    " isn\u2019t on screen to capture \u2014 scroll to it, then try again.",
                );
              let captured: Dynamic;
              try {
                captured = await captureArtboardImage(
                  previewHandle,
                  "png",
                  request.scale,
                  getArtboardCaptureOptions(artboard, {
                    ...deps.capture.rules,
                    settle:
                      deps.capture.rules.settle &&
                      index < ExportCaptureViewportLimit,
                  }),
                );
              } catch (captureError: Dynamic) {
                throw ((failedArtboardLabel = artboardLabel), captureError);
              }
              if (request.signal.aborted) throw new ExportCancelled();
              return captured.ok
                ? ((index += captured.settleMs ?? 0),
                  artboardNeedsScaledDownExport(artboard) &&
                    reducedSizeLabels.push(artboardLabel),
                  {
                    bytes: dataUrlToBytes(captured.uri),
                    blank: captured.embedWarningCount,
                    clipped: captured.clipped,
                    fontFallback: captured.fontWarningCount,
                    hiddenContent: captured.hiddenContent,
                  })
                : refuseExport(
                    uiMessage("canvas.designCanvas.couldnTCapture") +
                      artboardLabel +
                      " \u2014 it has nothing visible to export.",
                    "error",
                  );
            },
            {
              signal: abortSignal,
            },
          );
          if (request.signal.aborted) throw new ExportCancelled();
          reportExportBuilt({
            ...describeExportCaptureWarnings(
              captureSummary,
              reducedSizeLabels.length,
            ),
            ...scopeInfo,
            picked: true,
          });
          deps.delivery.state.current.notes = [
            ...(reducedSizeLabels.length > 0
              ? [
                  uiMessage("canvas.designCanvas.saved") +
                    (reducedSizeLabels.length > 3
                      ? String(reducedSizeLabels.length) + " artboards"
                      : reducedSizeLabels.join(", ")) +
                    " at a reduced size: over the capture limit.",
                ]
              : []),
            ...(captureSummary.clipped.length > 0
              ? [clippedArtboardsMessage(captureSummary.clipped)]
              : []),
            ...fontSubstitutionWarnings(captureSummary.fontFallback),
            ...(captureSummary.blank === 1
              ? [
                  "1 image could not be embedded and renders blank in the PNGs.",
                ]
              : captureSummary.blank > 1
                ? [
                    String(captureSummary.blank) +
                      " images could not be embedded and render blank in the PNGs.",
                  ]
                : []),
          ];
          return {
            filename:
              (sanitizeExportFileName(
                (document as Dynamic).title,
                100,
              ) || "design") + "-png.zip",
            data: captureSummary.blob,
          };
        } catch (error: Dynamic) {
          if (request.signal.aborted) throw new ExportCancelled();
          if (
            deps.delivery.state.current.refused ||
            error instanceof ExportCancelled
          )
            throw error;
          console.error(
            "[design/export] PNG archive failed" +
              (failedArtboardLabel !== null ? " capturing " + failedArtboardLabel : "") +
              ": " +
              (error instanceof Error ? error.name : typeof error),
          );
          if (abortSignal.aborted && error === abortSignal.reason)
            return refuseExport(
              uiMessage("canvas.designCanvas.preparingTheseArtboardsPNGsTook") +
                (request.scale === 2 ? "1\xD7, or " : "") +
                uiMessage("canvas.designCanvas.fewerArtboards"),
              "error",
              "timedOut",
            );
          throw (
            reportExportEvent("failed"),
            deps.feedback.showToast(
              failedArtboardLabel !== null
                ? uiMessage("canvas.designCanvas.couldnTCapture") +
                    failedArtboardLabel +
                    " as a PNG. " +
                    (request.scale === 2
                      ? uiMessage("canvas.designCanvas.try1OrExportWithout")
                      : uiMessage("canvas.designCanvas.tryAgainWithoutIt"))
                : uiMessage("canvas.designCanvas.couldnTExportTheseArtboards"),
              "error",
            ),
            error
          );
        } finally {
          clearTimeout(deadlineTimer);
          deps.picker.endPicking();
          deps.execution.setExportBusy(false);
        }
      }

/** PNG 格式导出的生成函数：根据导出选择挑选画板与缩放，单张直接截取、多张交给 captureArtboardPngsForExport，并处理超大与超时。 */
interface PngExportContext {
  readonly selection: {
    readonly focusedFile: { current: string | null };
    readonly current: Dynamic;
    readonly fullscreenFile: { current: string | null };
    readonly printableArtboards: PrintableArtboard[];
    readonly pageContents: { current: { artboards: PrintableArtboard[] } };
  };
  readonly picker: {
    readonly chooseArtboards: Dynamic;
    readonly endPicking: Dynamic;
    readonly canPickArtboards: boolean;
  };
  readonly execution: {
    readonly exporting: { current: boolean };
    readonly setExportBusy: (busy: boolean) => void;
    readonly isExportBusy: () => boolean;
  };
  readonly capture: {
    readonly getArtboardTitle: Dynamic;
    readonly artboardEntries: Dynamic;
    readonly waitForFrame: Dynamic;
    readonly describeScope: Dynamic;
    readonly canFitArtboard: (file: string) => boolean;
    readonly capturePngs: Dynamic;
    readonly rules: Dynamic;
  };
  readonly delivery: {
    readonly state: ExportDeliveryState;
    readonly batch: { current: string | null };
  };
  readonly feedback: {
    readonly showToast: Dynamic;
  };
}

export async function producePngExport(deps: PngExportContext, request?: Dynamic): Promise<Dynamic> {
        let startedAt: Dynamic = Date.now();
        deps.delivery.state.current = {
          notes: [],
          refused: false,
        };
        let refuseExport: Dynamic = (
            message?: Dynamic,
            toastKind?: Dynamic,
            reason: Dynamic = "refused",
          ): Dynamic => {
            throw (
              (deps.delivery.state.current.refused = true),
              reason !== null && reportExportEvent(reason),
              deps.feedback.showToast(message, toastKind),
              new Error(message)
            );
          },
          text: Dynamic =
            uiMessage("canvas.designCanvas.anotherExportIsStillRunning");
        if (deps.execution.isExportBusy()) return refuseExport(text);
        let artboard: Dynamic,
          isChosen: Dynamic,
          pickedExport: Dynamic = null;
        if (request.interactive && deps.picker.canPickArtboards) {
          let pickedKind: Dynamic = request.bundle ? "pngs" : "png",
            pickedFiles: Dynamic = initialExportPickedFiles(
              pickedKind,
              deps.selection.printableArtboards,
              deps.selection.fullscreenFile.current,
              deps.selection.current.current.artboards,
              deps.selection.focusedFile.current,
            ),
            pickedArtboards: Dynamic = deps.selection.printableArtboards.filter(
              (item?: Dynamic): Dynamic => pickedFiles.has(item.file),
            );
          pickedExport = await deps.picker.chooseArtboards(
            pickedKind,
            {
              picked: pickedFiles,
              scale: initialExportScale(
                pickedArtboards,
                deps.delivery.batch.current,
              ),
            },
            request.signal,
          );
          let pageArtboards: Dynamic = deps.selection.pageContents.current.artboards.filter(
              (item?: Dynamic): Dynamic => !item.frameless,
            ),
            chosenArtboards: Dynamic = pickedExport.files.flatMap(
              (file?: Dynamic): Dynamic =>
                pageArtboards.find(
                  (pageArtboard?: Dynamic): Dynamic => pageArtboard.file === file,
                ) ?? [],
            );
          if (chosenArtboards.length < pickedExport.files.length || deps.execution.exporting.current) {
            deps.picker.endPicking();
            return refuseExport(
              deps.execution.exporting.current
                ? text
                : (pickedExport.files.length > 1 ? "An" : "The") +
                    " artboard you chose is no longer on this page.",
            );
          }
          if (chosenArtboards.length > 1)
            return deps.capture.capturePngs(chosenArtboards, pickedExport, startedAt);
          artboard = chosenArtboards[0];
          isChosen = true;
        } else {
          let selection: Dynamic = selectExportCaptureArtboard(
            deps.selection.printableArtboards,
            deps.selection.fullscreenFile.current,
            deps.selection.current.current.artboards,
            deps.selection.focusedFile.current,
          );
          if (selection.artboard === null)
            return refuseExport(
              selection.covered
                ? '"' +
                    deps.capture.getArtboardTitle(deps.selection.fullscreenFile.current) +
                    '" isn\u2019t an artboard. Close its full-window view, then export a PNG.'
                : noExportableArtboardsMessage,
            );
          artboard = selection.artboard;
          isChosen = selection.chosen;
        }
        let scopeInfo: Dynamic = deps.capture.describeScope(
            1,
            pickedExport !== null && request.bundle === true ? "whole" : "one",
          ),
          artboardLabel: Dynamic =
            '"' +
            (artboard.title ??
              exportBaseFileName(artboard.file)) +
            '"',
          deadline: Dynamic = Date.now() + 55e3;
        deps.execution.setExportBusy(true);
        try {
          let frameElement: Dynamic = await deps.capture.waitForFrame(artboard.file);
          if (pickedExport?.signal.aborted) throw new ExportCancelled();
          let previewHandle: Dynamic = frameElement
            ? createPreviewHandle(frameElement)
            : null;
          if (deps.capture.artboardEntries.current.get(artboard.file)?.isBlocked())
            return refuseExport(
              artboardLabel +
                "\u2019s preview is stopped \u2014 reload it before exporting.",
            );
          if (!frameElement || !previewHandle)
            return refuseExport(
              artboardLabel + " is still loading \u2014 try again in a moment.",
            );
          if (frameElement.getBoundingClientRect().width === 0)
            return refuseExport(
              artboardLabel +
                " isn\u2019t on screen to capture \u2014 scroll to it, then try again.",
            );
          let fittingScales: Dynamic = imageCaptureScaleOptions(
              artboard.w,
              artboard.h,
            )
              .filter(
                (scaleOption?: Dynamic): Dynamic =>
                  scaleOption.fits && scaleOption.scale <= 2,
              )
              .map((scaleOption?: Dynamic): Dynamic => scaleOption.scale),
            scaleAttempts: Dynamic = pickedExport
              ? pickedExport.scale === 2 && fittingScales.includes(2)
                ? [2, 1]
                : [1]
              : fittingScales.includes(2) && deps.delivery.batch.current !== artboard.file
                ? [2, 1]
                : [1],
            captureOutcome: Dynamic = await drainArtboardExportCaptures(
              async (scale?: Dynamic): Promise<Dynamic> => {
                if (pickedExport?.signal.aborted)
                  throw new ExportCancelled();
                let captured: Dynamic = await captureArtboardImage(
                  previewHandle,
                  "png",
                  scale,
                  getArtboardCaptureOptions(artboard, deps.capture.rules),
                );
                return captured.ok
                  ? {
                      bytes: dataUrlToBytes(captured.uri),
                      blank: captured.embedWarningCount,
                      clipped: captured.clipped,
                      fontFallback: captured.fontWarningCount,
                      hiddenContent: captured.hiddenContent,
                    }
                  : null;
              },
              scaleAttempts,
              pickedExport ? 1 / 0 : ExportDownloadsResolvedValue,
              deadline,
            );
          if (pickedExport?.signal.aborted) throw new ExportCancelled();
          if (!captureOutcome.ok) {
            captureOutcome.reason === "no_time" &&
              (deps.delivery.batch.current = artboard.file);
            (captureOutcome.reason === "too_large" ||
              (captureOutcome.reason === "no_time" &&
                captureOutcome.after === "too_large")) &&
              reportExportEvent("tooLarge");
            return refuseExport(
              captureOutcome.reason === "nothing"
                ? uiMessage("canvas.designCanvas.couldnTCapture") +
                    artboardLabel +
                    " \u2014 it has nothing visible to export."
                : captureOutcome.reason === "no_time"
                  ? artboardLabel +
                    (captureOutcome.after === "too_large"
                      ? ` is over the ${String(ExportDownloadsResolvedValue >> 20)} MB export limit at 2\xD7`
                      : " could not be captured at 2\xD7") +
                    ", and there wasn\u2019t time to try a smaller size. Try again to export it at 1\xD7."
                  : artboardLabel +
                    ` is over the ${String(ExportDownloadsResolvedValue >> 20)} MB export limit` +
                    (scaleAttempts.length > 1 ? " even at 1\xD7" : "") +
                    ". Export the PDF, or use the artboard\u2019s own Export menu.",
              "error",
              captureOutcome.reason === "nothing"
                ? "refused"
                : captureOutcome.reason === "no_time" &&
                    captureOutcome.after !== "too_large"
                  ? "timedOut"
                  : null,
            );
          }
          let sizeNote: Dynamic =
              captureOutcome.steppedDown !== null
                ? captureOutcome.steppedDown === "too_large"
                  ? ` at 1\xD7 to fit the ${String(ExportDownloadsResolvedValue >> 20)} MB export limit`
                  : " at 1\xD7: the browser could not capture it at 2\xD7"
                : fittingScales.length === 0
                  ? " at a reduced size: it is larger than the capture limit"
                  : pickedExport
                    ? ""
                    : fittingScales.includes(2)
                      ? scaleAttempts[0] === 1
                        ? " at 1\xD7: at 2\xD7 it ran out of time before"
                        : ""
                      : " at 1\xD7: it is too large to capture at 2\xD7",
            emptyTail: Dynamic =
              !captureOutcome.clipped &&
              getArtboardCaptureMode(artboard, deps.capture.rules) ===
                "full" &&
              isFillPagedExport(artboard) &&
              Date.now() < deadline - 6e3
                ? await measureEmptyExportTail(previewHandle, {
                    w: artboard.w,
                    h: artboard.h,
                  }).catch((): Dynamic => null)
                : null;
          if (pickedExport?.signal.aborted) throw new ExportCancelled();
          reportExportBuilt({
            blankImages: captureOutcome.blank,
            clipped: captureOutcome.clipped,
            fontFallback: captureOutcome.fontFallback,
            scaledDown:
              captureOutcome.steppedDown !== null || fittingScales.length === 0,
            ...scopeInfo,
            ...captureOutcome.hiddenContent,
            picked: pickedExport !== null,
          });
          deps.delivery.state.current.notes = [
            ...(sizeNote !== "" || !isChosen
              ? [
                  uiMessage("canvas.designCanvas.saved") +
                    artboardLabel +
                    sizeNote +
                    "." +
                    (isChosen
                      ? ""
                      : " To pick a different artboard, select it or open it full-window first."),
                ]
              : []),
            ...(captureOutcome.clipped
              ? [
                  clippedArtboardsMessage([
                    artboard.title ??
                      exportBaseFileName(artboard.file),
                  ]),
                ]
              : []),
            ...(emptyTail !== null &&
            emptyTail >= minEmptyExportTail
              ? [
                  emptyExportTailMessage(
                    [
                      artboard.title ??
                        exportBaseFileName(artboard.file),
                    ],
                    emptyTail,
                    deps.capture.canFitArtboard(artboard.file),
                  ),
                ]
              : []),
            ...fontSubstitutionWarnings(captureOutcome.fontFallback),
            ...(captureOutcome.blank === 1
              ? [
                  "1 image could not be embedded and renders blank in the PNG.",
                ]
              : captureOutcome.blank > 1
                ? [
                    String(captureOutcome.blank) +
                      " images could not be embedded and render blank in the PNG.",
                  ]
                : []),
          ];
          return {
            filename:
              exportFileName(artboard.file, artboard.title) +
              ".png",
            data: captureOutcome.bytes,
          };
        } catch (error: Dynamic) {
          throw pickedExport?.signal.aborted
            ? new ExportCancelled()
            : (deps.delivery.state.current.refused ||
                error instanceof ExportCancelled ||
                (console.error("[design/export]", error),
                reportExportEvent("failed"),
                deps.feedback.showToast(
                  uiMessage("canvas.designCanvas.couldnTExport") +
                    artboardLabel +
                    " as a PNG: " +
                    errorMessage(error) +
                    ". Reload this tab and try again.",
                  "error",
                )),
              error);
        } finally {
          deps.picker.endPicking();
          deps.execution.setExportBusy(false);
        }
      }
