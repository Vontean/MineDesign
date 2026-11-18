import { DownloadsArenTAvailableToYouForMessage } from "../../export/downloads";
import { ExportCancelled } from "../../export/host-registry";
import { ExportCaptureViewportLimit } from "../../export/capture-viewport";
import { ExportDownloadsResolvedValue } from "../../export/downloads";
import { ExportHtmlError } from "../../export/html-producer";
import { PlatformFileContentHandler_4 } from "../../platform/file-content";
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
import { produceStandaloneHtmlExport } from "../../export/html-producer";
import { reportExportBuilt } from "../../export/analytics";
import { reportExportEvent } from "../../export/analytics";
import { reportExportOutcome } from "../../platform/health-and-analytics";
import { sanitizeExportFileName } from "../../export/file-names";
import { saveThroughHost } from "../../export/downloads";
import { selectExportCaptureArtboard } from "../../export/capture";
import { selectHtmlExportArtboards } from "../../export/html-producer";
import { type Dynamic } from "../../runtime-types";
import { uiMessage } from "@minedesign/contracts/ui-messages";
import { withClosedPreview } from "../preview-navigation";

/** 导出或捕获画板前使用：临时关闭全屏播放，等预览布局稳定后执行任务，结束后在条件允许时恢复播放并还原焦点。 */
export function runWithPlayPreviewClosed(deps: { readonly value106: Dynamic; readonly value177: Dynamic; readonly value270: Dynamic; readonly value271: Dynamic; readonly value275: Dynamic; readonly value297: Dynamic; readonly value346: Dynamic; readonly value348: Dynamic; readonly value387: Dynamic; readonly value392: Dynamic; readonly value488: Dynamic; readonly value87: Dynamic; readonly value92: Dynamic }, exportArtboards?: Dynamic, closeOptions?: Dynamic): Dynamic {
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
                ? deps.value106.current?.addEventListener(eventType, markUserInteracted, {
                    capture: true,
                    passive: true,
                  })
                : deps.value106.current?.removeEventListener(
                    eventType,
                    markUserInteracted,
                    true,
                  );
          },
          canReopen: Dynamic = (previewState?: Dynamic): Dynamic =>
            !hasUserInteracted &&
            deps.value346.current === null &&
            deps.value271.current === null &&
            !deps.value488() &&
            deps.value87.current.artboards.some(
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
              let currentPreview: Dynamic = deps.value387.current;
              return !deps.value92 || currentPreview === null
                ? null
                : exportArtboards.some(
                      (artboard?: Dynamic): Dynamic =>
                        artboard.file !== currentPreview.file,
                    )
                  ? {
                      ...currentPreview,
                      playing: deps.value271.current === currentPreview.file,
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
              deps.value297.current();
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
                  let webview: Dynamic = deps.value177.current.get(artboard.file)
                    ?.webviewRef.current;
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
                  deps.value275((): Dynamic => {
                    resolveReopened();
                    setInteractionListening(false);
                    if (!canReopen(props)) return;
                    deps.value392.current = props.file;
                    deps.value348(props);
                    playing && deps.value270(props.file);
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
export async function exportArtboardAsPng(deps: { readonly hideToast: Dynamic; readonly showToast: Dynamic; readonly value177: Dynamic; readonly value479: Dynamic; readonly value480: Dynamic; readonly value483: Dynamic; readonly value485: Dynamic; readonly value493: Dynamic; readonly value502: Dynamic; readonly value503: Dynamic; readonly value67: Dynamic; readonly value93: Dynamic }, file?: Dynamic, scale?: Dynamic): Promise<Dynamic> {
        if (!deps.value493) {
          if (deps.value480) {
            deps.showToast(DownloadsArenTAvailableToYouForMessage);
            return;
          }
          deps.value479(true);
          try {
            let frameElement: Dynamic = await deps.value483(file),
              previewHandle: Dynamic = frameElement
                ? createPreviewHandle(frameElement)
                : null;
            if (
              !frameElement ||
              !previewHandle ||
              frameElement.getBoundingClientRect().width === 0
            ) {
              deps.showToast(
                deps.value177.current.get(file)?.isBlocked()
                  ? uiMessage("canvas.designCanvas.thisArtboardSPreviewIs")
                  : uiMessage("canvas.designCanvas.thisArtboardIsnTVisible"),
              );
              healthReporter.report(
                ...classifyExportAbort("image"),
              );
              return;
            }
            let artboard: Dynamic = deps.value67.artboards.find(
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
                        deps.value93,
                      )
                    : {
                        selectionRoot: "body",
                      }),
                  filename:
                    scale == null
                      ? baseName + ".png"
                      : baseName + "@" + scale + "x.png",
                  scope: deps.value485(1, "one"),
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
              deps.showToast(
                uiMessage("canvas.designCanvas.couldnTCaptureThisArtboard"),
                "error",
              );
            else if (capture.saveOutcome === "withheld")
              deps.showToast(DownloadsArenTAvailableToYouForMessage);
            else if (
              capture.clipped &&
              capture.saveOutcome !== "declined"
            ) {
              let canFixClipping: Dynamic = deps.value502(file),
                clippedToastId: Dynamic = deps.showToast(
                  clippedArtboardsMessage([baseName], canFixClipping),
                  "info",
                  canFixClipping
                    ? {
                        ...toastDetails,
                        action: deps.value503(
                          [file],
                          false,
                          (): Dynamic => deps.hideToast(clippedToastId),
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
                getArtboardCaptureMode(artboard, deps.value93) ===
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
                  let canFixTail: Dynamic = deps.value502(file),
                    tailToastId: Dynamic = deps.showToast(
                      emptyExportTailMessage(
                        [baseName],
                        emptyTail,
                      ),
                      "info",
                      canFixTail
                        ? {
                            ...toastDetails,
                            action: deps.value503(
                              [file],
                              false,
                              (): Dynamic => deps.hideToast(tailToastId),
                              capture.saveOutcome === "unsupported",
                            ),
                            pinned: true,
                          }
                        : toastDetails,
                    );
                  shownTailWarning = true;
                }
              }
              !shownTailWarning && fontWarning !== undefined && deps.showToast(fontWarning, "info");
            }
          } catch (error: Dynamic) {
            console.error("[download-artboard]", error);
            deps.showToast(
              uiMessage("canvas.designCanvas.couldnTExportThisArtboard") +
                errorMessage(error) +
                ".",
              "error",
            );
          } finally {
            deps.value479(false);
          }
        }
      }

/** 从画板菜单导出 HTML 压缩包时运行：收集画板文件、依赖与上传素材，生成 README 并打包 zip，通过宿主或浏览器下载。 */
export async function exportArtboardSourceZip(deps: { readonly assets: Dynamic; readonly doc: Dynamic; readonly showToast: Dynamic; readonly value177: Dynamic; readonly value479: Dynamic; readonly value480: Dynamic; readonly value493: Dynamic; readonly value73: Dynamic }, file?: Dynamic): Promise<Dynamic> {
        if (!deps.value493) {
          if (deps.value480) {
            deps.showToast(DownloadsArenTAvailableToYouForMessage);
            return;
          }
          deps.value479(true);
          try {
            if (await downloadsWithheld()) {
              deps.showToast(DownloadsArenTAvailableToYouForMessage);
              healthReporter.report(
                ...classifyExportAbort("zip"),
              );
              return;
            }
            await deps.value177.current.get(file)?.flushPending();
            let files: Dynamic = deps.doc.content().files,
              readFileContent: Dynamic = async (
                path?: Dynamic,
              ): Promise<Dynamic> => {
                let content: Dynamic =
                  (await getKvClient().get(
                    PlatformFileContentHandler_4(path),
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
              data: deps.assets.supportJs,
            });
            zipEntries.push({
              name: "vendor/react.js",
              data: deps.assets.reactUmd,
            });
            zipEntries.push({
              name: "vendor/react-dom.js",
              data: deps.assets.reactDomUmd,
            });
            let baseName: Dynamic = exportFileName(
              file,
              deps.value73.current.artboards.find(
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
              deps.showToast(uiMessage("canvas.designCanvas.saved") + zipName + ".", "success");
            saveResult.outcome !== "withheld" &&
              saveResult.outcome !== "declined" &&
              missingSuffix !== undefined &&
              deps.showToast(
                (saveResult.outcome === "saved" ? uiMessage("canvas.designCanvas.saved") : uiMessage("canvas.designCanvas.built")) +
                  zipName +
                  ", " +
                  missingSuffix,
                "error",
              );
            saveResult.outcome === "withheld" &&
              deps.showToast(DownloadsArenTAvailableToYouForMessage);
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
            deps.showToast(
              uiMessage("canvas.designCanvas.couldnTBuildTheHTML") + String(error),
              "error",
            );
          } finally {
            deps.value479(false);
          }
        }
      }

/** HTML 格式导出的生成函数：刷新待保存内容，挑选可导出的画板，生成独立 HTML 文档数据。 */
export async function produceStandaloneHtml(deps: { readonly assets: Dynamic; readonly doc: Dynamic; readonly filePath: Dynamic; readonly value177: Dynamic; readonly value346: Dynamic; readonly value508: Dynamic; readonly value73: Dynamic; readonly value80: Dynamic; readonly value92: Dynamic }): Promise<Dynamic> {
      let documentTitle: Dynamic =
          (document as Dynamic).title ||
          exportBaseFileName(deps.filePath),
        timeoutSignal: Dynamic = AbortSignal.timeout(55e3),
        files: Dynamic = deps.doc.content().files,
        readFileContent: Dynamic = async (path?: Dynamic): Promise<Dynamic> => {
          let content: Dynamic =
            (await getKvClient().get(
              PlatformFileContentHandler_4(path),
            )) ?? files[path];
          if (
            typeof content == "string" &&
            path.endsWith(".dc.html") &&
            isLoadingArtboardHtml(content)
          )
            throw new ExportHtmlError(
              "not_loaded",
              "an artboard on this canvas has not loaded yet",
            );
          return typeof content == "string" ? content : undefined;
        };
      for (let loadedArtboard of deps.value177.current.values() as Dynamic)
        await loadedArtboard.flushPending();
      let exportSelection: Dynamic = selectHtmlExportArtboards(
          deps.value73.current,
          deps.value80.current,
          deps.value346.current,
        ),
        fontLoads: Dynamic = deps.value92
          ? await deps.value508(
              exportSelection.artboards.map(
                (artboard?: Dynamic): Dynamic => artboard.file,
              ),
            )
          : undefined,
        htmlExport: Dynamic = await produceStandaloneHtmlExport(
          {
            kind: "canvas",
            title: documentTitle,
            ...exportSelection,
            paths: Object.keys(files).filter(
              (path?: Dynamic): Dynamic =>
                path !== canvasMetadataFile,
            ),
            read: readFileContent,
            fetchBlob: (url?: Dynamic): Dynamic =>
              fetch(url, {
                credentials: "same-origin",
                signal: timeoutSignal,
              }),
            assets: deps.assets,
            importerReady: deps.value92,
            ...(fontLoads === undefined
              ? {}
              : {
                  fontLoads: fontLoads,
                }),
          },
          {
            signal: timeoutSignal,
          },
        );
      for (let warning of htmlExport.warnings as Dynamic)
        console.warn("[design/export] " + warning);
      return {
        filename: htmlExport.filename,
        data: htmlExport.blob,
      };
    }

/** PDF 格式导出的生成函数：拒绝并发导出，收集各画板页面生成 PDF，汇总警告并上报导出事件。 */
export async function producePdfExport(deps: { readonly focusedFileRef: Dynamic; readonly selectionRef: Dynamic; readonly showToast: Dynamic; readonly value346: Dynamic; readonly value478: Dynamic; readonly value479: Dynamic; readonly value483: Dynamic; readonly value484: Dynamic; readonly value485: Dynamic; readonly value487: Dynamic; readonly value489: Dynamic; readonly value494: Dynamic; readonly value495: Dynamic; readonly value497: Dynamic; readonly value498: Dynamic; readonly value499: Dynamic; readonly value502: Dynamic; readonly value514: Dynamic; readonly value516: Dynamic; readonly value92: Dynamic; readonly value93: Dynamic }, request?: Dynamic): Promise<Dynamic> {
        deps.value516.current = {
          notes: [],
          refused: false,
        };
        let refuseExport: Dynamic = (
            message?: Dynamic,
            toastKind?: Dynamic,
            reason: Dynamic = "refused",
          ): Dynamic => {
            throw (
              (deps.value516.current.refused = true),
              reportExportEvent(reason),
              deps.showToast(message, toastKind),
              new Error(message)
            );
          },
          text: Dynamic =
            uiMessage("canvas.designCanvas.anotherExportIsStillRunning");
        if (deps.value494()) return refuseExport(text);
        let pickedExport: Dynamic = null;
        if (
          request.interactive &&
          deps.value92 &&
          deps.value497 &&
          ((pickedExport = await deps.value487(
            "pdf",
            {
              picked: initialExportPickedFiles(
                "pdf",
                deps.value484,
                deps.value346.current,
                deps.selectionRef.current.artboards,
                deps.focusedFileRef.current,
              ),
              scale: 1,
            },
            request.signal,
          )),
          deps.value478.current)
        ) {
          deps.value489();
          return refuseExport(text);
        }
        let printableSelection: Dynamic = pickedExport
          ? deps.value514(new Set(pickedExport.files), 1)
          : deps.value514();
        if (!printableSelection.ok) {
          deps.value489();
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
          scopeInfo: Dynamic = deps.value485(printableSelection.printable.length, "whole"),
          documentName: Dynamic = !scopeInfo.partial
            ? (document as Dynamic).title || "design"
            : (sanitizeExportFileName(
                (document as Dynamic).title,
                100,
              ) || "design") + "-selection";
        deps.value479(true);
        try {
          let { blob: pdfBlob, ...pdfReport }: Dynamic = await deps.value495(
            printableSelection.printable,
            (): Dynamic =>
              collectPdfExportPages(
                printableSelection.printable,
                deps.value483,
                documentName,
                {
                  signal: abortSignal,
                  rules: deps.value93,
                  textEncoding: deps.value498,
                  tagged: deps.value499,
                },
              ),
          );
          if (pickedExport?.signal.aborted) throw new ExportCancelled();
          reportExportBuilt({
            ...pdfExportWarnings(pdfReport),
            ...scopeInfo,
            picked: pickedExport !== null,
          });
          deps.value516.current.notes = pdfExportMessage(
            pdfReport,
            printableSelection.printable.length,
            {
              embeds: true,
              fitAdvice: pdfReport.emptyTailFiles.some(deps.value502),
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
            deps.showToast(
              "PDF export failed: " +
                errorMessage(error) +
                ".",
              "error",
            ),
            error
          );
        } finally {
          clearTimeout(deadlineTimer);
          deps.value489();
          deps.value479(false);
        }
      }

/** 整份设计导出 PNG 时运行：在截止时间内逐个截取画板图像，必要时降低缩放，汇总裁切与字体警告，可取消。 */
export async function captureArtboardPngsForExport(deps: { readonly showToast: Dynamic; readonly value177: Dynamic; readonly value479: Dynamic; readonly value483: Dynamic; readonly value485: Dynamic; readonly value489: Dynamic; readonly value519: Dynamic; readonly value93: Dynamic }, artboards?: Dynamic,
        request?: Dynamic,
        startedAt?: Dynamic): Promise<Dynamic> {
        let scopeInfo: Dynamic = deps.value485(artboards.length, "whole"),
          refuseExport: Dynamic = (
            message?: Dynamic,
            toastKind?: Dynamic,
            reason: Dynamic = "refused",
          ): Dynamic => {
            throw (
              (deps.value519.current.refused = true),
              reportExportEvent(reason),
              deps.showToast(message, toastKind),
              new Error(message)
            );
          };
        if (request.signal.aborted)
          throw (deps.value489(), new ExportCancelled());
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
        deps.value479(true);
        try {
          let captureSummary: Dynamic = await captureExportArtboards(
            artboards,
            async (artboard?: Dynamic): Promise<Dynamic> => {
              let artboardLabel: Dynamic =
                  '"' +
                  (artboard.title ??
                    exportBaseFileName(artboard.file)) +
                  '"',
                frameElement: Dynamic = await deps.value483(artboard.file);
              abortSignal.throwIfAborted();
              let previewHandle: Dynamic = frameElement
                ? createPreviewHandle(frameElement)
                : null;
              if (deps.value177.current.get(artboard.file)?.isBlocked())
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
                    ...deps.value93,
                    settle:
                      deps.value93.settle &&
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
          deps.value519.current.notes = [
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
            deps.value519.current.refused ||
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
            deps.showToast(
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
          deps.value489();
          deps.value479(false);
        }
      }

/** PNG 格式导出的生成函数：根据导出选择挑选画板与缩放，单张直接截取、多张交给 captureArtboardPngsForExport，并处理超大与超时。 */
export async function producePngExport(deps: { readonly callback2: Dynamic; readonly focusedFileRef: Dynamic; readonly selectionRef: Dynamic; readonly showToast: Dynamic; readonly value177: Dynamic; readonly value346: Dynamic; readonly value478: Dynamic; readonly value479: Dynamic; readonly value483: Dynamic; readonly value484: Dynamic; readonly value485: Dynamic; readonly value487: Dynamic; readonly value489: Dynamic; readonly value494: Dynamic; readonly value497: Dynamic; readonly value502: Dynamic; readonly value519: Dynamic; readonly value520: Dynamic; readonly value521: Dynamic; readonly value87: Dynamic; readonly value93: Dynamic }, request?: Dynamic): Promise<Dynamic> {
        let startedAt: Dynamic = Date.now();
        deps.value519.current = {
          notes: [],
          refused: false,
        };
        let refuseExport: Dynamic = (
            message?: Dynamic,
            toastKind?: Dynamic,
            reason: Dynamic = "refused",
          ): Dynamic => {
            throw (
              (deps.value519.current.refused = true),
              reason !== null && reportExportEvent(reason),
              deps.showToast(message, toastKind),
              new Error(message)
            );
          },
          text: Dynamic =
            uiMessage("canvas.designCanvas.anotherExportIsStillRunning");
        if (deps.value494()) return refuseExport(text);
        let artboard: Dynamic,
          isChosen: Dynamic,
          pickedExport: Dynamic = null;
        if (request.interactive && deps.value497) {
          let pickedKind: Dynamic = request.bundle ? "pngs" : "png",
            pickedFiles: Dynamic = initialExportPickedFiles(
              pickedKind,
              deps.value484,
              deps.value346.current,
              deps.selectionRef.current.artboards,
              deps.focusedFileRef.current,
            ),
            pickedArtboards: Dynamic = deps.value484.filter(
              (item?: Dynamic): Dynamic => pickedFiles.has(item.file),
            );
          pickedExport = await deps.value487(
            pickedKind,
            {
              picked: pickedFiles,
              scale: initialExportScale(
                pickedArtboards,
                deps.value520.current,
              ),
            },
            request.signal,
          );
          let pageArtboards: Dynamic = deps.value87.current.artboards.filter(
              (item?: Dynamic): Dynamic => !item.frameless,
            ),
            chosenArtboards: Dynamic = pickedExport.files.flatMap(
              (file?: Dynamic): Dynamic =>
                pageArtboards.find(
                  (pageArtboard?: Dynamic): Dynamic => pageArtboard.file === file,
                ) ?? [],
            );
          if (chosenArtboards.length < pickedExport.files.length || deps.value478.current) {
            deps.value489();
            return refuseExport(
              deps.value478.current
                ? text
                : (pickedExport.files.length > 1 ? "An" : "The") +
                    " artboard you chose is no longer on this page.",
            );
          }
          if (chosenArtboards.length > 1)
            return deps.value521(chosenArtboards, pickedExport, startedAt);
          artboard = chosenArtboards[0];
          isChosen = true;
        } else {
          let selection: Dynamic = selectExportCaptureArtboard(
            deps.value484,
            deps.value346.current,
            deps.selectionRef.current.artboards,
            deps.focusedFileRef.current,
          );
          if (selection.artboard === null)
            return refuseExport(
              selection.covered
                ? '"' +
                    deps.callback2(deps.value346.current) +
                    '" isn\u2019t an artboard. Close its full-window view, then export a PNG.'
                : noExportableArtboardsMessage,
            );
          artboard = selection.artboard;
          isChosen = selection.chosen;
        }
        let scopeInfo: Dynamic = deps.value485(
            1,
            pickedExport !== null && request.bundle === true ? "whole" : "one",
          ),
          artboardLabel: Dynamic =
            '"' +
            (artboard.title ??
              exportBaseFileName(artboard.file)) +
            '"',
          deadline: Dynamic = Date.now() + 55e3;
        deps.value479(true);
        try {
          let frameElement: Dynamic = await deps.value483(artboard.file);
          if (pickedExport?.signal.aborted) throw new ExportCancelled();
          let previewHandle: Dynamic = frameElement
            ? createPreviewHandle(frameElement)
            : null;
          if (deps.value177.current.get(artboard.file)?.isBlocked())
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
              : fittingScales.includes(2) && deps.value520.current !== artboard.file
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
                  getArtboardCaptureOptions(artboard, deps.value93),
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
              (deps.value520.current = artboard.file);
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
              getArtboardCaptureMode(artboard, deps.value93) ===
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
          deps.value519.current.notes = [
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
                    deps.value502(artboard.file),
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
            : (deps.value519.current.refused ||
                error instanceof ExportCancelled ||
                (console.error("[design/export]", error),
                reportExportEvent("failed"),
                deps.showToast(
                  uiMessage("canvas.designCanvas.couldnTExport") +
                    artboardLabel +
                    " as a PNG: " +
                    errorMessage(error) +
                    ". Reload this tab and try again.",
                  "error",
                )),
              error);
        } finally {
          deps.value489();
          deps.value479(false);
        }
      }
