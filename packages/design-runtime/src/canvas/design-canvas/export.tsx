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
export function runWithPlayPreviewClosed(deps: { readonly value106: Dynamic; readonly value177: Dynamic; readonly value270: Dynamic; readonly value271: Dynamic; readonly value275: Dynamic; readonly value297: Dynamic; readonly value346: Dynamic; readonly value348: Dynamic; readonly value387: Dynamic; readonly value392: Dynamic; readonly value488: Dynamic; readonly value87: Dynamic; readonly value92: Dynamic }, input?: Dynamic, options?: Dynamic): Dynamic {
        let value653: Dynamic = null,
          flag2: Dynamic = false,
          callback15: Dynamic = (): Dynamic => {
            flag2 = true;
          },
          callback16: Dynamic = (input2?: Dynamic): Dynamic => {
            for (let value654 of [
              "pointerdown",
              "wheel",
              "keydown",
            ] as Dynamic)
              input2
                ? deps.value106.current?.addEventListener(value654, callback15, {
                    capture: true,
                    passive: true,
                  })
                : deps.value106.current?.removeEventListener(
                    value654,
                    callback15,
                    true,
                  );
          },
          callback17: Dynamic = (input2?: Dynamic): Dynamic =>
            !flag2 &&
            deps.value346.current === null &&
            deps.value271.current === null &&
            !deps.value488() &&
            deps.value87.current.artboards.some(
              (input3?: Dynamic): Dynamic => input3.file === input2.file,
            ),
          callback18: Dynamic = (input2?: Dynamic): Dynamic => {
            if (
              value653 === null ||
              value653.isConnected ||
              ((document as Dynamic).activeElement !==
                (document as Dynamic).body &&
                (document as Dynamic).activeElement !== null)
            )
              return;
            let callback19: Dynamic = (input3?: Dynamic): Dynamic =>
                (document as Dynamic).querySelector(input3),
              value654: Dynamic =
                callback19('button[data-testid="mega-export"]') ??
                callback19('[data-testid="mega-export"] button') ??
                callback19('[data-testid="mega-collapse"]');
            value654
              ? value654.focus({
                  preventScroll: true,
                })
              : input2 > 0 &&
                requestAnimationFrame((): Dynamic => callback18(input2 - 1));
          };
        return withClosedPreview(
          {
            current: (): Dynamic => {
              let current4: Dynamic = deps.value387.current;
              return !deps.value92 || current4 === null
                ? null
                : input.some(
                      (input2?: Dynamic): Dynamic =>
                        input2.file !== current4.file,
                    )
                  ? {
                      ...current4,
                      playing: deps.value271.current === current4.file,
                    }
                  : null;
            },
            leave: (): Dynamic => {
              value653 =
                (document as Dynamic).hasFocus() &&
                (document as Dynamic).activeElement !==
                  (document as Dynamic).body
                  ? (document as Dynamic).activeElement
                  : null;
              deps.value297.current();
              callback16(true);
            },
            laidOut: async (): Promise<Dynamic> => {
              await new Promise(
                (input2?: Dynamic): Dynamic =>
                  setTimeout((): Dynamic => {
                    let value654: Dynamic = setTimeout(input2, 250);
                    requestAnimationFrame(
                      (): Dynamic =>
                        requestAnimationFrame(
                          (): Dynamic => (clearTimeout(value654), input2()),
                        ),
                    );
                  }, 0),
              );
              await Promise.all(
                input.map((input2?: Dynamic): Dynamic => {
                  let value654: Dynamic = deps.value177.current.get(input2.file)
                    ?.webviewRef.current;
                  return value654
                    ? createPreviewHandle(value654)
                        ?.awaitSettled(1500)
                        .catch((): Dynamic => {})
                    : undefined;
                }),
              );
            },
            mayReopen: callback17,
            reopen: ({ playing: playing, ...props }: Dynamic): Dynamic =>
              new Promise(
                (input2?: Dynamic): Dynamic =>
                  deps.value275((): Dynamic => {
                    input2();
                    callback16(false);
                    if (!callback17(props)) return;
                    deps.value392.current = props.file;
                    deps.value348(props);
                    playing && deps.value270(props.file);
                    requestAnimationFrame((): Dynamic => callback18(2));
                    let value654: Dynamic =
                      value653 !== null
                        ? (document as Dynamic).activeElement?.closest(
                            '[role="dialog"], [role="alertdialog"]',
                          )
                        : null;
                    if (value654) {
                      let observer: Dynamic = new MutationObserver(
                          (): Dynamic => {
                            value654.isConnected ||
                              (callback19(),
                              setTimeout((): Dynamic => callback18(2), 0));
                          },
                        ),
                        callback19: Dynamic = (): Dynamic => (
                          observer.disconnect(),
                          clearTimeout(value655)
                        ),
                        value655: Dynamic = setTimeout(callback19, 12e4);
                      observer.observe((document as Dynamic).body, {
                        childList: true,
                        subtree: true,
                      });
                    }
                  }),
              ),
          },
          options,
        ).finally((): Dynamic => callback16(false));
      }

/** 从画板菜单导出单个画板为图片时运行：截取画板、检查字体替换与裁切及空白尾部，再保存文件并上报结果。 */
export async function exportArtboardAsPng(deps: { readonly hideToast: Dynamic; readonly showToast: Dynamic; readonly value177: Dynamic; readonly value479: Dynamic; readonly value480: Dynamic; readonly value483: Dynamic; readonly value485: Dynamic; readonly value493: Dynamic; readonly value502: Dynamic; readonly value503: Dynamic; readonly value67: Dynamic; readonly value93: Dynamic }, input?: Dynamic, options?: Dynamic): Promise<Dynamic> {
        if (!deps.value493) {
          if (deps.value480) {
            deps.showToast(DownloadsArenTAvailableToYouForMessage);
            return;
          }
          deps.value479(true);
          try {
            let value653: Dynamic = await deps.value483(input),
              value654: Dynamic = value653
                ? createPreviewHandle(value653)
                : null;
            if (
              !value653 ||
              !value654 ||
              value653.getBoundingClientRect().width === 0
            ) {
              deps.showToast(
                deps.value177.current.get(input)?.isBlocked()
                  ? uiMessage("canvas.designCanvas.thisArtboardSPreviewIs")
                  : uiMessage("canvas.designCanvas.thisArtboardIsnTVisible"),
              );
              healthReporter.report(
                ...classifyExportAbort("image"),
              );
              return;
            }
            let value655: Dynamic = deps.value67.artboards.find(
                (input2?: Dynamic): Dynamic => input2.file === input,
              ),
              value656: Dynamic = exportFileName(
                input,
                value655?.title,
              ),
              value657: Dynamic = await exportArtboardImage(
                value654,
                input,
                "png",
                options ?? 2,
                {
                  ...(value655
                    ? getArtboardCaptureOptions(
                        value655,
                        deps.value93,
                      )
                    : {
                        selectionRoot: "body",
                      }),
                  filename:
                    options == null
                      ? value656 + ".png"
                      : value656 + "@" + options + "x.png",
                  scope: deps.value485(1, "one"),
                },
              ),
              [value658]: Dynamic = fontSubstitutionWarnings(
                value657.fontWarningCount,
              ),
              value659: Dynamic =
                value658 !== undefined
                  ? {
                      description: value658,
                    }
                  : undefined;
            if (!value657.ok)
              deps.showToast(
                uiMessage("canvas.designCanvas.couldnTCaptureThisArtboard"),
                "error",
              );
            else if (value657.saveOutcome === "withheld")
              deps.showToast(DownloadsArenTAvailableToYouForMessage);
            else if (
              value657.clipped &&
              value657.saveOutcome !== "declined"
            ) {
              let value660: Dynamic = deps.value502(input),
                value661: Dynamic = deps.showToast(
                  clippedArtboardsMessage([value656], value660),
                  "info",
                  value660
                    ? {
                        ...value659,
                        action: deps.value503(
                          [input],
                          false,
                          (): Dynamic => deps.hideToast(value661),
                          value657.saveOutcome === "unsupported",
                        ),
                        pinned: true,
                      }
                    : value659,
                );
            } else if (value657.saveOutcome !== "declined") {
              let flag2: Dynamic = false;
              if (
                value655 &&
                getArtboardCaptureMode(value655, deps.value93) ===
                  "full" &&
                isFillPagedExport(value655)
              ) {
                let value660: Dynamic = await measureEmptyExportTail(value654, {
                  w: value655.w,
                  h: value655.h,
                }).catch((): Dynamic => null);
                if (
                  value660 !== null &&
                  value660 >= minEmptyExportTail
                ) {
                  let value661: Dynamic = deps.value502(input),
                    value662: Dynamic = deps.showToast(
                      emptyExportTailMessage(
                        [value656],
                        value660,
                      ),
                      "info",
                      value661
                        ? {
                            ...value659,
                            action: deps.value503(
                              [input],
                              false,
                              (): Dynamic => deps.hideToast(value662),
                              value657.saveOutcome === "unsupported",
                            ),
                            pinned: true,
                          }
                        : value659,
                    );
                  flag2 = true;
                }
              }
              !flag2 && value658 !== undefined && deps.showToast(value658, "info");
            }
          } catch (value653: Dynamic) {
            console.error("[download-artboard]", value653);
            deps.showToast(
              uiMessage("canvas.designCanvas.couldnTExportThisArtboard") +
                errorMessage(value653) +
                ".",
              "error",
            );
          } finally {
            deps.value479(false);
          }
        }
      }

/** 从画板菜单导出 HTML 压缩包时运行：收集画板文件、依赖与上传素材，生成 README 并打包 zip，通过宿主或浏览器下载。 */
export async function exportArtboardSourceZip(deps: { readonly assets: Dynamic; readonly doc: Dynamic; readonly showToast: Dynamic; readonly value177: Dynamic; readonly value479: Dynamic; readonly value480: Dynamic; readonly value493: Dynamic; readonly value73: Dynamic }, input?: Dynamic): Promise<Dynamic> {
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
            await deps.value177.current.get(input)?.flushPending();
            let files: Dynamic = deps.doc.content().files,
              callback15: Dynamic = async (
                input2?: Dynamic,
              ): Promise<Dynamic> => {
                let value660: Dynamic =
                  (await getKvClient().get(
                    PlatformFileContentHandler_4(input2),
                  )) ?? files[input2];
                if (
                  typeof value660 == "string" &&
                  input2.endsWith(".dc.html") &&
                  isLoadingArtboardHtml(value660)
                )
                  throw new Error(
                    "an artboard on this canvas has not loaded (its uploaded content is still arriving, or could not be read) \u2014 export again once it shows",
                  );
                return typeof value660 == "string" ? value660 : undefined;
              },
              value653: Dynamic = /\.(png|jpe?g|gif|webp|avif|bmp|svg)$/i,
              entries: Dynamic = new Map(),
              items: Dynamic = [input];
            for (; items.length > 0; ) {
              let value660: Dynamic = items.shift();
              if (entries.has(value660)) continue;
              let value661: Dynamic = await callback15(value660);
              if (
                value661 !== undefined &&
                (entries.set(value660, value661), !value653.test(value660))
              )
                for (let value662 of Object.keys(files) as Dynamic) {
                  if (
                    value662 === value660 ||
                    entries.has(value662) ||
                    value662 === canvasMetadataFile
                  )
                    continue;
                  let value663: Dynamic = (
                    value662.split("/").pop() ?? value662
                  ).replace(/\.dc\.html$/, "");
                  (value662.endsWith(".dc.html")
                    ? value661.includes('name="' + value663 + '"')
                    : value661.includes(value662) ||
                      value661.includes(
                        value662.split("/").pop() ?? value662,
                      )) && items.push(value662);
                }
            }
            let callback16: Dynamic = (input2?: Dynamic): Dynamic => {
                let value660: Dynamic = atob(input2),
                  value661: Dynamic = new Uint8Array(value660.length);
                for (let index: Dynamic = 0; index < value660.length; index++)
                  value661[index] = value660.charCodeAt(index);
                return value661;
              },
              value654: Dynamic = await collectExportUploadedAssets(
                new Map(
                  [...entries].filter(
                    ([input2]: Dynamic): Dynamic =>
                      isProjectSourcePath(input2),
                  ),
                ),
                input,
                fetchExportAsset,
                {
                  taken: Object.keys(files),
                  emulatorBlobUrls: isEmulator(),
                },
              );
            for (let [value660, value661] of value654.sources as Dynamic)
              entries.set(value660, value661);
            let items2: Dynamic = [...value654.entries];
            for (let [value660, value661] of entries as Dynamic)
              if (value653.test(value660)) {
                let value662: Dynamic;
                try {
                  value662 = callback16(value661.replace(/^data:[^,]*,/, ""));
                } catch {
                  continue;
                }
                items2.push({
                  name: value660,
                  data: value662,
                });
              } else
                value660.endsWith(".dc.html")
                  ? items2.push({
                      name: value660,
                      data: prepareExportDcDocument(value661),
                    })
                  : items2.push({
                      name: value660,
                      data: value661,
                    });
            items2.push({
              name: "support.js",
              data: deps.assets.supportJs,
            });
            items2.push({
              name: "vendor/react.js",
              data: deps.assets.reactUmd,
            });
            items2.push({
              name: "vendor/react-dom.js",
              data: deps.assets.reactDomUmd,
            });
            let value655: Dynamic = exportFileName(
              input,
              deps.value73.current.artboards.find(
                (input2?: Dynamic): Dynamic => input2.file === input,
              )?.title,
            );
            items2.push({
              name: "README.md",
              data: designExportReadme(
                value655,
                input,
                [...entries.keys()].filter(
                  (input2?: Dynamic): Dynamic => input2 !== input,
                ),
                value654,
              ),
            });
            let value656: Dynamic = createStoredZip(items2),
              value657: Dynamic = value655 + "-html.zip",
              value658: Dynamic = await saveThroughHost(
                value656,
                value657,
              ),
              value659: Dynamic = missingExportAssetSuffix(
                value654.missing,
              );
            value658.outcome === "saved" &&
              value659 === undefined &&
              deps.showToast(uiMessage("canvas.designCanvas.saved") + value657 + ".", "success");
            value658.outcome !== "withheld" &&
              value658.outcome !== "declined" &&
              value659 !== undefined &&
              deps.showToast(
                (value658.outcome === "saved" ? uiMessage("canvas.designCanvas.saved") : uiMessage("canvas.designCanvas.built")) +
                  value657 +
                  ", " +
                  value659,
                "error",
              );
            value658.outcome === "withheld" &&
              deps.showToast(DownloadsArenTAvailableToYouForMessage);
            if (value658.outcome === "unsupported") {
              try {
                let value660: Dynamic = (document as Dynamic).createElement(
                  "a",
                );
                value660.href = URL.createObjectURL(value656);
                value660.download = value657;
                value660.rel = "noopener";
                value660.style.display = "none";
                (document as Dynamic).body.appendChild(value660);
                value660.click();
                value660.remove();
                setTimeout(
                  (): Dynamic => URL.revokeObjectURL(value660.href),
                  6e4,
                );
              } catch {}
              (window as Dynamic).dispatchEvent(
                new CustomEvent(exportDeliveryEventName, {
                  detail: {
                    url: "",
                    filename: value657,
                    embedWarningCount: 0,
                    file: {
                      blob: value656,
                      mime: "application/zip",
                    },
                    refusal: value658.code,
                  },
                }),
              );
            }
            reportExportOutcome(
              classifyExportSaveOutcome("zip", value658.outcome),
              designAnalyticsEvents.exported.zip,
            );
          } catch (value653: Dynamic) {
            healthReporter.report(
              ...classifyExportFailure("zip"),
            );
            deps.showToast(
              uiMessage("canvas.designCanvas.couldnTBuildTheHTML") + String(value653),
              "error",
            );
          } finally {
            deps.value479(false);
          }
        }
      }

/** HTML 格式导出的生成函数：刷新待保存内容，挑选可导出的画板，生成独立 HTML 文档数据。 */
export async function produceStandaloneHtml(deps: { readonly assets: Dynamic; readonly doc: Dynamic; readonly filePath: Dynamic; readonly value177: Dynamic; readonly value346: Dynamic; readonly value508: Dynamic; readonly value73: Dynamic; readonly value80: Dynamic; readonly value92: Dynamic }): Promise<Dynamic> {
      let value653: Dynamic =
          (document as Dynamic).title ||
          exportBaseFileName(deps.filePath),
        value654: Dynamic = AbortSignal.timeout(55e3),
        files: Dynamic = deps.doc.content().files,
        callback15: Dynamic = async (input?: Dynamic): Promise<Dynamic> => {
          let value658: Dynamic =
            (await getKvClient().get(
              PlatformFileContentHandler_4(input),
            )) ?? files[input];
          if (
            typeof value658 == "string" &&
            input.endsWith(".dc.html") &&
            isLoadingArtboardHtml(value658)
          )
            throw new ExportHtmlError(
              "not_loaded",
              "an artboard on this canvas has not loaded yet",
            );
          return typeof value658 == "string" ? value658 : undefined;
        };
      for (let value658 of deps.value177.current.values() as Dynamic)
        await value658.flushPending();
      let value655: Dynamic = selectHtmlExportArtboards(
          deps.value73.current,
          deps.value80.current,
          deps.value346.current,
        ),
        value656: Dynamic = deps.value92
          ? await deps.value508(
              value655.artboards.map(
                (input?: Dynamic): Dynamic => input.file,
              ),
            )
          : undefined,
        value657: Dynamic = await produceStandaloneHtmlExport(
          {
            kind: "canvas",
            title: value653,
            ...value655,
            paths: Object.keys(files).filter(
              (input?: Dynamic): Dynamic =>
                input !== canvasMetadataFile,
            ),
            read: callback15,
            fetchBlob: (input?: Dynamic): Dynamic =>
              fetch(input, {
                credentials: "same-origin",
                signal: value654,
              }),
            assets: deps.assets,
            importerReady: deps.value92,
            ...(value656 === undefined
              ? {}
              : {
                  fontLoads: value656,
                }),
          },
          {
            signal: value654,
          },
        );
      for (let value658 of value657.warnings as Dynamic)
        console.warn("[design/export] " + value658);
      return {
        filename: value657.filename,
        data: value657.blob,
      };
    }

/** PDF 格式导出的生成函数：拒绝并发导出，收集各画板页面生成 PDF，汇总警告并上报导出事件。 */
export async function producePdfExport(deps: { readonly focusedFileRef: Dynamic; readonly selectionRef: Dynamic; readonly showToast: Dynamic; readonly value346: Dynamic; readonly value478: Dynamic; readonly value479: Dynamic; readonly value483: Dynamic; readonly value484: Dynamic; readonly value485: Dynamic; readonly value487: Dynamic; readonly value489: Dynamic; readonly value494: Dynamic; readonly value495: Dynamic; readonly value497: Dynamic; readonly value498: Dynamic; readonly value499: Dynamic; readonly value502: Dynamic; readonly value514: Dynamic; readonly value516: Dynamic; readonly value92: Dynamic; readonly value93: Dynamic }, input?: Dynamic): Promise<Dynamic> {
        deps.value516.current = {
          notes: [],
          refused: false,
        };
        let callback15: Dynamic = (
            input2?: Dynamic,
            options?: Dynamic,
            context: Dynamic = "refused",
          ): Dynamic => {
            throw (
              (deps.value516.current.refused = true),
              reportExportEvent(context),
              deps.showToast(input2, options),
              new Error(input2)
            );
          },
          text: Dynamic =
            uiMessage("canvas.designCanvas.anotherExportIsStillRunning");
        if (deps.value494()) return callback15(text);
        let value653: Dynamic = null;
        if (
          input.interactive &&
          deps.value92 &&
          deps.value497 &&
          ((value653 = await deps.value487(
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
            input.signal,
          )),
          deps.value478.current)
        ) {
          deps.value489();
          return callback15(text);
        }
        let value654: Dynamic = value653
          ? deps.value514(new Set(value653.files), 1)
          : deps.value514();
        if (!value654.ok) {
          deps.value489();
          return callback15(value654.reason);
        }
        let controller: Dynamic = new AbortController(),
          value655: Dynamic = setTimeout(
            (): Dynamic => controller.abort(),
            55e3,
          );
        value653?.signal.addEventListener(
          "abort",
          (): Dynamic => controller.abort(),
        );
        let { signal: value656 }: Dynamic = controller,
          value657: Dynamic = deps.value485(value654.printable.length, "whole"),
          value658: Dynamic = !value657.partial
            ? (document as Dynamic).title || "design"
            : (sanitizeExportFileName(
                (document as Dynamic).title,
                100,
              ) || "design") + "-selection";
        deps.value479(true);
        try {
          let { blob: value659, ...value660 }: Dynamic = await deps.value495(
            value654.printable,
            (): Dynamic =>
              collectPdfExportPages(
                value654.printable,
                deps.value483,
                value658,
                {
                  signal: value656,
                  rules: deps.value93,
                  textEncoding: deps.value498,
                  tagged: deps.value499,
                },
              ),
          );
          if (value653?.signal.aborted) throw new ExportCancelled();
          reportExportBuilt({
            ...pdfExportWarnings(value660),
            ...value657,
            picked: value653 !== null,
          });
          deps.value516.current.notes = pdfExportMessage(
            value660,
            value654.printable.length,
            {
              embeds: true,
              fitAdvice: value660.emptyTailFiles.some(deps.value502),
            },
          );
          return {
            filename: value660.filename,
            data: value659,
          };
        } catch (value659: Dynamic) {
          if (value653?.signal.aborted) throw new ExportCancelled();
          console.error("[design/export]", value659);
          if (value656.aborted && value659 === value656.reason)
            return callback15(
              uiMessage("canvas.designCanvas.preparingThisDesignSPDF"),
              "error",
              "timedOut",
            );
          throw (
            reportExportEvent("failed"),
            deps.showToast(
              "PDF export failed: " +
                errorMessage(value659) +
                ".",
              "error",
            ),
            value659
          );
        } finally {
          clearTimeout(value655);
          deps.value489();
          deps.value479(false);
        }
      }

/** 整份设计导出 PNG 时运行：在截止时间内逐个截取画板图像，必要时降低缩放，汇总裁切与字体警告，可取消。 */
export async function captureArtboardPngsForExport(deps: { readonly showToast: Dynamic; readonly value177: Dynamic; readonly value479: Dynamic; readonly value483: Dynamic; readonly value485: Dynamic; readonly value489: Dynamic; readonly value519: Dynamic; readonly value93: Dynamic }, items?: Dynamic,
        options?: Dynamic,
        context?: Dynamic): Promise<Dynamic> {
        let value653: Dynamic = deps.value485(items.length, "whole"),
          callback15: Dynamic = (
            input?: Dynamic,
            options2?: Dynamic,
            context2: Dynamic = "refused",
          ): Dynamic => {
            throw (
              (deps.value519.current.refused = true),
              reportExportEvent(context2),
              deps.showToast(input, options2),
              new Error(input)
            );
          };
        if (options.signal.aborted)
          throw (deps.value489(), new ExportCancelled());
        let controller: Dynamic = new AbortController(),
          value654: Dynamic = setTimeout(
            (): Dynamic => controller.abort(),
            interactiveExportDeadline(context) - Date.now(),
          );
        options.signal.addEventListener(
          "abort",
          (): Dynamic => controller.abort(),
        );
        let { signal: value655 }: Dynamic = controller,
          value656: Dynamic = null,
          items2: Dynamic = [],
          index: Dynamic = 0;
        deps.value479(true);
        try {
          let value657: Dynamic = await captureExportArtboards(
            items,
            async (input?: Dynamic): Promise<Dynamic> => {
              let value658: Dynamic =
                  '"' +
                  (input.title ??
                    exportBaseFileName(input.file)) +
                  '"',
                value659: Dynamic = await deps.value483(input.file);
              value655.throwIfAborted();
              let value660: Dynamic = value659
                ? createPreviewHandle(value659)
                : null;
              if (deps.value177.current.get(input.file)?.isBlocked())
                return callback15(
                  value658 +
                    "\u2019s preview is stopped \u2014 reload it before exporting.",
                );
              if (!value659 || !value660)
                return callback15(
                  value658 +
                    " is still loading \u2014 try again in a moment.",
                );
              if (value659.getBoundingClientRect().width === 0)
                return callback15(
                  value658 +
                    " isn\u2019t on screen to capture \u2014 scroll to it, then try again.",
                );
              let value661: Dynamic;
              try {
                value661 = await captureArtboardImage(
                  value660,
                  "png",
                  options.scale,
                  getArtboardCaptureOptions(input, {
                    ...deps.value93,
                    settle:
                      deps.value93.settle &&
                      index < ExportCaptureViewportLimit,
                  }),
                );
              } catch (value662: Dynamic) {
                throw ((value656 = value658), value662);
              }
              if (options.signal.aborted) throw new ExportCancelled();
              return value661.ok
                ? ((index += value661.settleMs ?? 0),
                  artboardNeedsScaledDownExport(input) &&
                    items2.push(value658),
                  {
                    bytes: dataUrlToBytes(value661.uri),
                    blank: value661.embedWarningCount,
                    clipped: value661.clipped,
                    fontFallback: value661.fontWarningCount,
                    hiddenContent: value661.hiddenContent,
                  })
                : callback15(
                    uiMessage("canvas.designCanvas.couldnTCapture") +
                      value658 +
                      " \u2014 it has nothing visible to export.",
                    "error",
                  );
            },
            {
              signal: value655,
            },
          );
          if (options.signal.aborted) throw new ExportCancelled();
          reportExportBuilt({
            ...describeExportCaptureWarnings(
              value657,
              items2.length,
            ),
            ...value653,
            picked: true,
          });
          deps.value519.current.notes = [
            ...(items2.length > 0
              ? [
                  uiMessage("canvas.designCanvas.saved") +
                    (items2.length > 3
                      ? String(items2.length) + " artboards"
                      : items2.join(", ")) +
                    " at a reduced size: over the capture limit.",
                ]
              : []),
            ...(value657.clipped.length > 0
              ? [clippedArtboardsMessage(value657.clipped)]
              : []),
            ...fontSubstitutionWarnings(value657.fontFallback),
            ...(value657.blank === 1
              ? [
                  "1 image could not be embedded and renders blank in the PNGs.",
                ]
              : value657.blank > 1
                ? [
                    String(value657.blank) +
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
            data: value657.blob,
          };
        } catch (value657: Dynamic) {
          if (options.signal.aborted) throw new ExportCancelled();
          if (
            deps.value519.current.refused ||
            value657 instanceof ExportCancelled
          )
            throw value657;
          console.error(
            "[design/export] PNG archive failed" +
              (value656 !== null ? " capturing " + value656 : "") +
              ": " +
              (value657 instanceof Error ? value657.name : typeof value657),
          );
          if (value655.aborted && value657 === value655.reason)
            return callback15(
              uiMessage("canvas.designCanvas.preparingTheseArtboardsPNGsTook") +
                (options.scale === 2 ? "1\xD7, or " : "") +
                uiMessage("canvas.designCanvas.fewerArtboards"),
              "error",
              "timedOut",
            );
          throw (
            reportExportEvent("failed"),
            deps.showToast(
              value656 !== null
                ? uiMessage("canvas.designCanvas.couldnTCapture") +
                    value656 +
                    " as a PNG. " +
                    (options.scale === 2
                      ? uiMessage("canvas.designCanvas.try1OrExportWithout")
                      : uiMessage("canvas.designCanvas.tryAgainWithoutIt"))
                : uiMessage("canvas.designCanvas.couldnTExportTheseArtboards"),
              "error",
            ),
            value657
          );
        } finally {
          clearTimeout(value654);
          deps.value489();
          deps.value479(false);
        }
      }

/** PNG 格式导出的生成函数：根据导出选择挑选画板与缩放，单张直接截取、多张交给 captureArtboardPngsForExport，并处理超大与超时。 */
export async function producePngExport(deps: { readonly callback2: Dynamic; readonly focusedFileRef: Dynamic; readonly selectionRef: Dynamic; readonly showToast: Dynamic; readonly value177: Dynamic; readonly value346: Dynamic; readonly value478: Dynamic; readonly value479: Dynamic; readonly value483: Dynamic; readonly value484: Dynamic; readonly value485: Dynamic; readonly value487: Dynamic; readonly value489: Dynamic; readonly value494: Dynamic; readonly value497: Dynamic; readonly value502: Dynamic; readonly value519: Dynamic; readonly value520: Dynamic; readonly value521: Dynamic; readonly value87: Dynamic; readonly value93: Dynamic }, input?: Dynamic): Promise<Dynamic> {
        let value653: Dynamic = Date.now();
        deps.value519.current = {
          notes: [],
          refused: false,
        };
        let callback15: Dynamic = (
            input2?: Dynamic,
            options?: Dynamic,
            context: Dynamic = "refused",
          ): Dynamic => {
            throw (
              (deps.value519.current.refused = true),
              context !== null && reportExportEvent(context),
              deps.showToast(input2, options),
              new Error(input2)
            );
          },
          text: Dynamic =
            uiMessage("canvas.designCanvas.anotherExportIsStillRunning");
        if (deps.value494()) return callback15(text);
        let value654: Dynamic,
          value655: Dynamic,
          value656: Dynamic = null;
        if (input.interactive && deps.value497) {
          let value660: Dynamic = input.bundle ? "pngs" : "png",
            value661: Dynamic = initialExportPickedFiles(
              value660,
              deps.value484,
              deps.value346.current,
              deps.selectionRef.current.artboards,
              deps.focusedFileRef.current,
            ),
            value662: Dynamic = deps.value484.filter(
              (input2?: Dynamic): Dynamic => value661.has(input2.file),
            );
          value656 = await deps.value487(
            value660,
            {
              picked: value661,
              scale: initialExportScale(
                value662,
                deps.value520.current,
              ),
            },
            input.signal,
          );
          let value663: Dynamic = deps.value87.current.artboards.filter(
              (input2?: Dynamic): Dynamic => !input2.frameless,
            ),
            value664: Dynamic = value656.files.flatMap(
              (input2?: Dynamic): Dynamic =>
                value663.find(
                  (input3?: Dynamic): Dynamic => input3.file === input2,
                ) ?? [],
            );
          if (value664.length < value656.files.length || deps.value478.current) {
            deps.value489();
            return callback15(
              deps.value478.current
                ? text
                : (value656.files.length > 1 ? "An" : "The") +
                    " artboard you chose is no longer on this page.",
            );
          }
          if (value664.length > 1)
            return deps.value521(value664, value656, value653);
          value654 = value664[0];
          value655 = true;
        } else {
          let value660: Dynamic = selectExportCaptureArtboard(
            deps.value484,
            deps.value346.current,
            deps.selectionRef.current.artboards,
            deps.focusedFileRef.current,
          );
          if (value660.artboard === null)
            return callback15(
              value660.covered
                ? '"' +
                    deps.callback2(deps.value346.current) +
                    '" isn\u2019t an artboard. Close its full-window view, then export a PNG.'
                : noExportableArtboardsMessage,
            );
          value654 = value660.artboard;
          value655 = value660.chosen;
        }
        let value657: Dynamic = deps.value485(
            1,
            value656 !== null && input.bundle === true ? "whole" : "one",
          ),
          value658: Dynamic =
            '"' +
            (value654.title ??
              exportBaseFileName(value654.file)) +
            '"',
          value659: Dynamic = Date.now() + 55e3;
        deps.value479(true);
        try {
          let value660: Dynamic = await deps.value483(value654.file);
          if (value656?.signal.aborted) throw new ExportCancelled();
          let value661: Dynamic = value660
            ? createPreviewHandle(value660)
            : null;
          if (deps.value177.current.get(value654.file)?.isBlocked())
            return callback15(
              value658 +
                "\u2019s preview is stopped \u2014 reload it before exporting.",
            );
          if (!value660 || !value661)
            return callback15(
              value658 + " is still loading \u2014 try again in a moment.",
            );
          if (value660.getBoundingClientRect().width === 0)
            return callback15(
              value658 +
                " isn\u2019t on screen to capture \u2014 scroll to it, then try again.",
            );
          let value662: Dynamic = imageCaptureScaleOptions(
              value654.w,
              value654.h,
            )
              .filter(
                (input2?: Dynamic): Dynamic =>
                  input2.fits && input2.scale <= 2,
              )
              .map((input2?: Dynamic): Dynamic => input2.scale),
            value663: Dynamic = value656
              ? value656.scale === 2 && value662.includes(2)
                ? [2, 1]
                : [1]
              : value662.includes(2) && deps.value520.current !== value654.file
                ? [2, 1]
                : [1],
            value664: Dynamic = await drainArtboardExportCaptures(
              async (input2?: Dynamic): Promise<Dynamic> => {
                if (value656?.signal.aborted)
                  throw new ExportCancelled();
                let value667: Dynamic = await captureArtboardImage(
                  value661,
                  "png",
                  input2,
                  getArtboardCaptureOptions(value654, deps.value93),
                );
                return value667.ok
                  ? {
                      bytes: dataUrlToBytes(value667.uri),
                      blank: value667.embedWarningCount,
                      clipped: value667.clipped,
                      fontFallback: value667.fontWarningCount,
                      hiddenContent: value667.hiddenContent,
                    }
                  : null;
              },
              value663,
              value656 ? 1 / 0 : ExportDownloadsResolvedValue,
              value659,
            );
          if (value656?.signal.aborted) throw new ExportCancelled();
          if (!value664.ok) {
            value664.reason === "no_time" &&
              (deps.value520.current = value654.file);
            (value664.reason === "too_large" ||
              (value664.reason === "no_time" &&
                value664.after === "too_large")) &&
              reportExportEvent("tooLarge");
            return callback15(
              value664.reason === "nothing"
                ? uiMessage("canvas.designCanvas.couldnTCapture") +
                    value658 +
                    " \u2014 it has nothing visible to export."
                : value664.reason === "no_time"
                  ? value658 +
                    (value664.after === "too_large"
                      ? ` is over the ${String(ExportDownloadsResolvedValue >> 20)} MB export limit at 2\xD7`
                      : " could not be captured at 2\xD7") +
                    ", and there wasn\u2019t time to try a smaller size. Try again to export it at 1\xD7."
                  : value658 +
                    ` is over the ${String(ExportDownloadsResolvedValue >> 20)} MB export limit` +
                    (value663.length > 1 ? " even at 1\xD7" : "") +
                    ". Export the PDF, or use the artboard\u2019s own Export menu.",
              "error",
              value664.reason === "nothing"
                ? "refused"
                : value664.reason === "no_time" &&
                    value664.after !== "too_large"
                  ? "timedOut"
                  : null,
            );
          }
          let value665: Dynamic =
              value664.steppedDown !== null
                ? value664.steppedDown === "too_large"
                  ? ` at 1\xD7 to fit the ${String(ExportDownloadsResolvedValue >> 20)} MB export limit`
                  : " at 1\xD7: the browser could not capture it at 2\xD7"
                : value662.length === 0
                  ? " at a reduced size: it is larger than the capture limit"
                  : value656
                    ? ""
                    : value662.includes(2)
                      ? value663[0] === 1
                        ? " at 1\xD7: at 2\xD7 it ran out of time before"
                        : ""
                      : " at 1\xD7: it is too large to capture at 2\xD7",
            value666: Dynamic =
              !value664.clipped &&
              getArtboardCaptureMode(value654, deps.value93) ===
                "full" &&
              isFillPagedExport(value654) &&
              Date.now() < value659 - 6e3
                ? await measureEmptyExportTail(value661, {
                    w: value654.w,
                    h: value654.h,
                  }).catch((): Dynamic => null)
                : null;
          if (value656?.signal.aborted) throw new ExportCancelled();
          reportExportBuilt({
            blankImages: value664.blank,
            clipped: value664.clipped,
            fontFallback: value664.fontFallback,
            scaledDown:
              value664.steppedDown !== null || value662.length === 0,
            ...value657,
            ...value664.hiddenContent,
            picked: value656 !== null,
          });
          deps.value519.current.notes = [
            ...(value665 !== "" || !value655
              ? [
                  uiMessage("canvas.designCanvas.saved") +
                    value658 +
                    value665 +
                    "." +
                    (value655
                      ? ""
                      : " To pick a different artboard, select it or open it full-window first."),
                ]
              : []),
            ...(value664.clipped
              ? [
                  clippedArtboardsMessage([
                    value654.title ??
                      exportBaseFileName(value654.file),
                  ]),
                ]
              : []),
            ...(value666 !== null &&
            value666 >= minEmptyExportTail
              ? [
                  emptyExportTailMessage(
                    [
                      value654.title ??
                        exportBaseFileName(value654.file),
                    ],
                    value666,
                    deps.value502(value654.file),
                  ),
                ]
              : []),
            ...fontSubstitutionWarnings(value664.fontFallback),
            ...(value664.blank === 1
              ? [
                  "1 image could not be embedded and renders blank in the PNG.",
                ]
              : value664.blank > 1
                ? [
                    String(value664.blank) +
                      " images could not be embedded and render blank in the PNG.",
                  ]
                : []),
          ];
          return {
            filename:
              exportFileName(value654.file, value654.title) +
              ".png",
            data: value664.bytes,
          };
        } catch (value660: Dynamic) {
          throw value656?.signal.aborted
            ? new ExportCancelled()
            : (deps.value519.current.refused ||
                value660 instanceof ExportCancelled ||
                (console.error("[design/export]", value660),
                reportExportEvent("failed"),
                deps.showToast(
                  uiMessage("canvas.designCanvas.couldnTExport") +
                    value658 +
                    " as a PNG: " +
                    errorMessage(value660) +
                    ". Reload this tab and try again.",
                  "error",
                )),
              value660);
        } finally {
          deps.value489();
          deps.value479(false);
        }
      }
