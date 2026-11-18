import { CanvasWorkingStateConstant_5 } from "../working-state";
import { CanvasWorkingStateHandler } from "../working-state";
import { PlatformFileContentConstant_20 } from "../../platform/file-content";
import { PlatformFileContentLimit_5 } from "../../platform/file-content";
import { PlatformFileContentLimit_6 } from "../../platform/file-content";
import { PlatformFileContentSlice } from "../../platform/file-content";
import { PlatformFileContentTest_2 } from "../../platform/file-content";
import { PlatformFileContentTest_3 } from "../../platform/file-content";
import { afterNextPaint } from "../working-state";
import { announce } from "../../editor/accessibility/announcer";
import { canDecodeRasterImage } from "../../editor/clipboard/image-validation";
import { captureVideoPoster } from "../../editor/media/video-upload";
import { createDropGhost } from "../working-state";
import { createElementEditId } from "../../editor/geometry/snapping";
import { defaultPlacedImageSize } from "../paste-placement";
import { droppedImageLabel } from "../paste-placement";
import { droppedImageMarkup } from "../paste-placement";
import { droppedImagePlacement } from "../paste-placement";
import { emptyBoardSelection } from "../../editor/selection/canvas-selection";
import { fileDropPosition } from "../../editor/insert/drop-targets";
import { imageHeaderDimensions } from "../working-state";
import { imagePlacementRejectionReason } from "../../assets/image-placement";
import { isEmbedFrozen } from "../../platform/file-content";
import { isSvgFile } from "../working-state";
import { markDropPerformance } from "../working-state";
import { pngPhysicalDimensions } from "../working-state";
import { positionedVideoHtml } from "../working-state";
import { previewImageFile } from "../working-state";
import { probeVideoFile } from "../../editor/media/video-upload";
import { rasterImageDimensions } from "../working-state";
import { registerHiddenPickerTag } from "../../editor/picker/hidden-tags";
import { safeDroppedImageAltText } from "../paste-placement";
import { selectionFromBoards } from "../../editor/selection/canvas-selection";
import { trackEmbeddedWrite } from "../../platform/file-content";
import { type Dynamic } from "../../runtime-types";
import { uiMessage } from "@minedesign/contracts/ui-messages";
import { uiOperation } from "@minedesign/contracts/ui-value";
import { uploadDesignFile } from "../working-state";
import { uploadDesignVideo } from "../working-state";
import { validateCanvasPlacedImage } from "../../assets/image-placement";
import { videoFileTitle } from "../working-state";
import { videoUploadFailureMessage } from "../../editor/media/video-upload";
import { videoUploadRefusal } from "../../editor/media/video-upload";

/** 图片文件拖入或粘贴到画布或画板时运行：校验尺寸与格式、上传文件、显示占位，再作为画布图片或画板内图片元素插入。 */
export function placeDroppedImages(deps: { readonly focusedFileRef: Dynamic; readonly selectionRef: Dynamic; readonly setSelection: Dynamic; readonly value177: Dynamic; readonly value188: Dynamic; readonly value271: Dynamic; readonly value316: Dynamic; readonly value328: Dynamic; readonly value329: Dynamic; readonly value330: Dynamic; readonly value332: Dynamic; readonly value339: Dynamic; readonly value62: Dynamic; readonly value73: Dynamic; readonly value80: Dynamic }, items?: Dynamic,
        options?: Dynamic,
        context?: Dynamic,
        value653?: Dynamic,
        extra?: Dynamic): Dynamic {
        let callback15: Dynamic = (): Dynamic => {};
        trackEmbeddedWrite(
          (async (): Promise<Dynamic> => {
            let value654: Dynamic = deps.value332(options, context, extra);
            if (value654 != null && value654.file === deps.value271.current) {
              deps.value188(
                uiMessage("canvas.designCanvas.nothingAddedThatArtboardIs"),
              );
              return;
            }
            if (extra != null && !value654) {
              deps.value188(uiMessage("canvas.designCanvas.couldNotPlaceTheValue1", { value1: uiOperation(value653) }));
              return;
            }
            let callback16: Dynamic = (
                input?: Dynamic,
                options2?: Dynamic,
                context2?: Dynamic,
              ): Dynamic =>
                droppedImagePlacement(
                  {
                    x: options,
                    y: context,
                  },
                  context2,
                  input,
                  options2,
                ),
              callback17: Dynamic = (
                input?: Dynamic,
                options2?: Dynamic,
              ): Dynamic => {
                let { w: value662, h: value663 }: Dynamic = defaultPlacedImageSize(input, options2);
                return value663 > PlatformFileContentLimit_6
                  ? {
                      w: Math.max(
                        PlatformFileContentConstant_20,
                        Math.round(
                          (value662 * PlatformFileContentLimit_6) /
                            value663,
                        ),
                      ),
                      h: PlatformFileContentLimit_6,
                    }
                  : {
                      w: value662,
                      h: value663,
                    };
              };
            markDropPerformance("received");
            let value655: Dynamic = items.map(
                (): Dynamic => ({
                  d: null,
                  density: null,
                }),
              ),
              current4: Dynamic = deps.value80.current,
              callback18: Dynamic = (input?: Dynamic): Dynamic => {
                let index2: Dynamic = 0,
                  index3: Dynamic = 0,
                  index4: Dynamic = 0;
                return items.map(
                  (input2?: Dynamic, options2?: Dynamic): Dynamic => {
                    if (input(options2)) return null;
                    let value662: Dynamic = value655[options2].d ?? {
                      width: 320,
                      height: 240,
                    };
                    if (value654)
                      return callback16(value662, index2++, value654);
                    let { w: value663, h: value664 }: Dynamic = callback17(
                      value662,
                      value655[options2].density,
                    );
                    index2++ === 0 &&
                      ([index3, index4] = [
                        Math.round(options - value663 / 2),
                        Math.round(context - value664 / 2),
                      ]);
                    let state: Dynamic = {
                      x: index3,
                      y: index4,
                      w: value663,
                      h: value664,
                    };
                    index3 += value663 + 80;
                    return state;
                  },
                );
              },
              value656: Dynamic = callback18((): Dynamic => false).map(
                (input?: Dynamic): Dynamic =>
                  createDropGhost({
                    file: value654?.file ?? null,
                    page: current4,
                    ...input,
                  }),
              ),
              values: Dynamic = new Set(value656.keys()),
              callback19: Dynamic = (
                input?: Dynamic,
                options2?: Dynamic,
              ): Dynamic => {
                values.delete(input) && value656[input][options2]();
              };
            callback15 = (): Dynamic => {
              for (let value662 of [...values] as Dynamic)
                callback19(value662, "cancel");
            };
            value655 = await Promise.all(
              items.map(async (input?: Dynamic): Promise<Dynamic> => {
                let value662: Dynamic = await input
                  .slice(0, 262144)
                  .arrayBuffer()
                  .then((input2?: Dynamic): Dynamic => new DataView(input2))
                  .catch((): Dynamic => null);
                return {
                  d: isSvgFile(input)
                    ? await imageHeaderDimensions(input).catch(
                        (): Dynamic => null,
                      )
                    : value662 &&
                      rasterImageDimensions(value662),
                  density:
                    value662 && pngPhysicalDimensions(value662),
                };
              }),
            );
            callback18((): Dynamic => false).forEach(
              (input?: Dynamic, options2?: Dynamic): Dynamic => {
                input && value656[options2].place(input);
              },
            );
            markDropPerformance("header");
            await afterNextPaint();
            let value657: Dynamic = await Promise.all(
                items.map(
                  (input?: Dynamic): Dynamic =>
                    imagePlacementRejectionReason(input) ==
                      null && !isSvgFile(input)
                      ? canDecodeRasterImage(input)
                      : Promise.resolve(false),
                ),
              ),
              value658: Dynamic = await Promise.all(
                items.map(
                  (input?: Dynamic, options2?: Dynamic): Dynamic =>
                    value657[options2]
                      ? previewImageFile(input, {
                          sized: true,
                          head: value655[options2].d,
                        }).catch((): Dynamic => null)
                      : Promise.resolve(null),
                ),
              ),
              value659: Dynamic = await Promise.all(
                items.map(
                  (input?: Dynamic, options2?: Dynamic): Dynamic =>
                    value658[options2]
                      ? Promise.resolve(null)
                      : validateCanvasPlacedImage(
                          input,
                          isSvgFile(input)
                            ? undefined
                            : value657[options2],
                        ),
                ),
              );
            await Promise.all(
              items.map(
                async (
                  input?: Dynamic,
                  options2?: Dynamic,
                ): Promise<Dynamic> => {
                  value659[options2] == null &&
                    !value658[options2] &&
                    isSvgFile(input) &&
                    (value658[options2] = await previewImageFile(
                      input,
                    ).catch((): Dynamic => null));
                },
              ),
            );
            markDropPerformance("gate");
            let value660: Dynamic = value655.map(
                (input?: Dynamic): Dynamic => input.d,
              ),
              value661: Dynamic = value655.map(
                (input?: Dynamic): Dynamic => input.density,
              );
            items.forEach((input?: Dynamic, options2?: Dynamic): Dynamic => {
              value659[options2] == null &&
                !value658[options2] &&
                value660[options2] == null &&
                (value659[options2] = uiMessage("canvas.designCanvas.tooLargeToPlaceHere"));
            });
            items.forEach((input?: Dynamic, options2?: Dynamic): Dynamic => {
              value659[options2] != null && callback19(options2, "cancel");
            });
            callback18(
              (input?: Dynamic): Dynamic => value659[input] != null,
            ).forEach((input?: Dynamic, options2?: Dynamic): Dynamic => {
              input && value656[options2].move(input.x, input.y);
            });
            let length: Dynamic = value659.filter(
              (input?: Dynamic): Dynamic => input != null,
            ).length;
            length > 0 &&
              deps.value188(
                length === items.length
                  ? uiMessage("canvas.designCanvas.couldnTUseTheValue1", { value1: uiOperation(value653) }) +
                      (items.length > 1 ? uiMessage("canvas.designCanvas.s") : " \u2014 ") +
                      [
                        ...new Set(
                          value659.filter(
                            (input?: Dynamic): Dynamic => input != null,
                          ),
                        ),
                      ].join("; ") +
                      "."
                  : String(length) +
                      ` of the ${value653} files couldn't be used as images \u2014 placing the rest.`,
              );
            if (length === items.length) return;
            let callback20: Dynamic = (
              input?: Dynamic,
              options2?: Dynamic,
            ): Dynamic => {
              let value662: Dynamic = `<svg xmlns="http://www.w3.org/2000/svg" width="${input.width}" height="${input.height}" data-seed="${options2}-${Date.now()}"><rect width="100%" height="100%" fill="#e9e7e2"/></svg>`;
              return {
                url: "data:image/svg+xml," + encodeURIComponent(value662),
                width: input.width,
                height: input.height,
              };
            };
            items.forEach((input?: Dynamic, options2?: Dynamic): Dynamic => {
              value658[options2] =
                value659[options2] != null
                  ? null
                  : (value658[options2] ??
                    callback20(value660[options2], options2));
            });
            let callback21: Dynamic = (
              input?: Dynamic,
              options2?: Dynamic,
              context2?: Dynamic,
              value662?: Dynamic,
            ): Dynamic => {
              let value663: Dynamic = registerHiddenPickerTag(
                  value662,
                ),
                callback22: Dynamic = async (): Promise<Dynamic> => {
                  isEmbedFrozen() ||
                    (await input
                      .swapImageAttrs(context2, {
                        "data-dc-drop": null,
                      })
                      .catch((): Dynamic => false));
                };
              trackEmbeddedWrite(
                uploadDesignFile(
                  "appifact",
                  null,
                  items[options2],
                )
                  .then(async ({ src: src }: Dynamic): Promise<Dynamic> => {
                    if (isEmbedFrozen()) return;
                    (await input.swapImageAttrs(context2, {
                      src: src,
                      "data-dc-drop": null,
                    })) ||
                      (await callback22(),
                      deps.value188(
                        uiMessage("canvas.designCanvas.imageKeptAsAnEmbedded"),
                      ));
                  })
                  .catch(
                    async (): Promise<Dynamic> => (
                      await callback22(),
                      deps.value188(
                        uiMessage("canvas.designCanvas.imageUploadFailedTheValue1", { value1: uiOperation(value653) }),
                      ),
                      false
                    ),
                  )
                  .finally((): Dynamic => {
                    markDropPerformance("upload");
                    value663();
                  }),
              );
            };
            if (!value654) {
              let value662: Dynamic =
                PlatformFileContentLimit_5 -
                (deps.value73.current.annotations ?? []).length -
                deps.value329.current.length;
              if (value662 <= 0) {
                callback15();
                deps.value188(
                  uiMessage("canvas.designCanvas.thisCanvasIsAtIts2") +
                    String(PlatformFileContentLimit_5) +
                    ").",
                );
                return;
              }
              let current5: Dynamic = deps.value80.current,
                state: Dynamic = {
                  sel: deps.selectionRef.current,
                  tool: deps.value339.current,
                  focus: deps.focusedFileRef.current,
                },
                value663: Dynamic = null,
                items2: Dynamic = [],
                index2: Dynamic = 0,
                index3: Dynamic = 0,
                index4: Dynamic = 0,
                index5: Dynamic = 0,
                callback22: Dynamic = (): Dynamic => {
                  if (--index5 > 0 || items2.length === 0) return;
                  let value664: Dynamic = index4 - items2.length,
                    value665: Dynamic =
                      items2.length === 1
                        ? uiMessage("canvas.designCanvas.pictureFromTheValue1Image", { value1: uiOperation(value653) })
                        : `${items2.length} pictures from the ${value653} images`,
                    value666: Dynamic = `${value664} of the ${value653} images ${value664 === 1 ? "was" : "were"} not placed.`;
                  value664 > 0 && deps.value188(value666);
                  announce(
                    value665 +
                      (value664 > 0 ? "; " + value666.slice(0, -1) : "") +
                      (length > 0
                        ? `; ${length} of the ${value653} files couldn't be used`
                        : ""),
                  );
                };
              for (
                let index6: Dynamic = 0;
                index6 < items.length && index4 < value662;
                index6++
              ) {
                let value664: Dynamic = value658[index6];
                if (!value664) continue;
                let value665: Dynamic = value660[index6] ?? {
                    width: value664.width,
                    height: value664.height,
                  },
                  { w: value666, h: value667 }: Dynamic = callback17(
                    value665,
                    value661[index6],
                  );
                index4 === 0 &&
                  ((index2 = Math.round(options - value666 / 2)),
                  (index3 = Math.round(context - value667 / 2)));
                let state2: Dynamic = {
                  key: "pp-" + String(++deps.value330.current),
                  x: index2,
                  y: index3,
                  w: value666,
                  h: value667,
                  url: value664.url,
                  page: current5,
                };
                deps.value328((input?: Dynamic): Dynamic => [...input, state2]);
                callback19(index6, "replaced");
                markDropPerformance("insert");
                let callback23: Dynamic = (): Dynamic => {
                  markDropPerformance("upload");
                  deps.value328(
                    (input?: Dynamic): Dynamic =>
                      input.filter(
                        (input2?: Dynamic): Dynamic => input2 !== state2,
                      ),
                  );
                };
                index5++;
                trackEmbeddedWrite(
                  uploadDesignFile(
                    "appifact",
                    null,
                    items[index6],
                  ).then(({ src: src }: Dynamic): Dynamic => {
                    if (isEmbedFrozen()) return;
                    callback23();
                    let value668: Dynamic = PlatformFileContentTest_2(src);
                    if (value668 === null) {
                      deps.value188(
                        uiMessage("canvas.designCanvas.couldNotPlaceTheValue12", { value1: uiOperation(value653) }),
                      );
                      return callback22();
                    }
                    let value669: Dynamic = deps.value316.current(
                      {
                        kind: "image",
                        x: state2.x,
                        y: state2.y,
                        w: value666,
                        h: value667,
                        src: value668,
                        alt: PlatformFileContentSlice(
                          droppedImageLabel(
                            items[index6],
                            value653,
                          ),
                        ),
                        ...(current5 === "" ||
                        current5 === (deps.value73.current.pages?.[0]?.id ?? "")
                          ? {}
                          : {
                              page: current5,
                            }),
                      },
                      {
                        quiet: true,
                      },
                    );
                    if (value669 === null) {
                      callback22();
                      return false;
                    }
                    items2.push(value669);
                    (deps.selectionRef.current === state.sel ||
                      deps.selectionRef.current === value663) &&
                      deps.value339.current === state.tool &&
                      deps.focusedFileRef.current === state.focus &&
                      deps.value80.current === current5 &&
                      ((value663 = selectionFromBoards({
                        files: emptyBoardSelection.files,
                        notes: new Set(items2),
                      })),
                      (deps.selectionRef.current = value663),
                      deps.value62(),
                      deps.setSelection(value663));
                    callback22();
                  }),
                ).catch((): Dynamic => {
                  callback23();
                  deps.value188(
                    uiMessage("canvas.designCanvas.couldnTUseTheValue12", { value1: uiOperation(value653) }),
                  );
                  callback22();
                });
                index2 += value666 + 80;
                index4++;
              }
              callback15();
              let length2: Dynamic = value658.filter(Boolean).length;
              index4 < length2 &&
                deps.value188(
                  uiMessage("canvas.designCanvas.placingTheFirst") +
                    String(index4) +
                    " \u2014 this canvas is at its limit for notes and shapes (" +
                    String(PlatformFileContentLimit_5) +
                    ").",
                );
              return;
            }
            let entry: Dynamic = deps.value177.current.get(value654.file);
            if (!entry) {
              callback15();
              deps.value188(uiMessage("canvas.designCanvas.couldNotPlaceTheValue1", { value1: uiOperation(value653) }));
              return;
            }
            let index: Dynamic = 0;
            for (let index2: Dynamic = 0; index2 < items.length; index2++) {
              let value662: Dynamic = value658[index2];
              if (!value662) continue;
              let value663: Dynamic = value660[index2] ?? {
                  width: value662.width,
                  height: value662.height,
                },
                {
                  x: value664,
                  y: value665,
                  w: value666,
                }: Dynamic = callback16(value663, index, value654),
                value667: Dynamic = createElementEditId(index2),
                value668: Dynamic = droppedImageMarkup({
                  src: value662.url,
                  mark: value667,
                  alt: safeDroppedImageAltText(
                    droppedImageLabel(items[index2], value653),
                    droppedImageLabel(
                      {
                        name: "",
                      },
                      value653,
                    ),
                  ),
                  natural: value663,
                  left: value664,
                  top: value665,
                  w: value666,
                });
              if ((await entry.insertHtml(value668, "page")).length === 0) {
                callback19(index2, "cancel");
                continue;
              }
              callback19(index2, "landed");
              markDropPerformance("insert");
              index++;
              callback21(entry, index2, value662.url, value667);
            }
            callback15();
            index > 0
              ? announce(
                  index +
                    (index > 1 ? " images " : " image ") +
                    value653 +
                    (length > 0
                      ? `; ${length} of the ${value653} files couldn't be used`
                      : ""),
                )
              : deps.value188(uiMessage("canvas.designCanvas.couldNotPlaceTheValue1", { value1: uiOperation(value653) }));
          })().finally((): Dynamic => callback15()),
        );
      }

/** 视频文件拖入画布或画板时运行：探测视频、生成封面、上传后作为画布视频或画板内视频元素插入，处理数量上限与失败提示。 */
export function placeDroppedVideos(deps: { readonly focusedFileRef: Dynamic; readonly selectionRef: Dynamic; readonly setSelection: Dynamic; readonly value177: Dynamic; readonly value188: Dynamic; readonly value271: Dynamic; readonly value316: Dynamic; readonly value329: Dynamic; readonly value332: Dynamic; readonly value339: Dynamic; readonly value62: Dynamic; readonly value73: Dynamic; readonly value80: Dynamic }, input?: Dynamic,
      options?: Dynamic,
      context?: Dynamic,
      value653?: Dynamic,
      extra?: Dynamic,
      detail?: Dynamic,
      argument?: Dynamic): Dynamic {
      let callback15: Dynamic = (): Dynamic => {};
      trackEmbeddedWrite(
        (async (): Promise<Dynamic> => {
          let value654: Dynamic = deps.value332(options, context, extra);
          if (value654 != null && value654.file === deps.value271.current) {
            deps.value188(
              uiMessage("canvas.designCanvas.nothingAddedThatArtboardIs"),
            );
            return;
          }
          if (extra != null && !value654) {
            deps.value188(
              uiMessage("canvas.designCanvas.couldNotPlaceTheValue13", { value1: uiOperation(value653) }),
            );
            return;
          }
          if (
            value654 &&
            deps.value177.current.get(value654.file)?.isReady() !== true
          ) {
            deps.value188(
              uiMessage("canvas.designCanvas.nothingAddedThatArtboardIsn"),
            );
            return;
          }
          if (value654 && deps.value177.current.get(value654.file)?.holdsDeck()) {
            deps.value188(CanvasWorkingStateHandler("artboard"));
            return;
          }
          let values: Dynamic = new Set(),
            callback16: Dynamic = (input2?: Dynamic): Dynamic => {
              values.add(input2);
              deps.value188([...values].join(" "));
            },
            value655: Dynamic = input.filter((input2?: Dynamic): Dynamic => {
              let value662: Dynamic = videoUploadRefusal(input2);
              value662 != null &&
                callback16(videoUploadFailureMessage(value662));
              return value662 == null;
            }),
            value656: Dynamic = value655.slice(
              0,
              CanvasWorkingStateConstant_5,
            );
          value655.length > value656.length &&
            callback16(
              uiMessage("canvas.designCanvas.addingTheFirstValue1Videos", { value1: String(CanvasWorkingStateConstant_5) }),
            );
          if (value656.length === 0) return;
          if (
            !value654 &&
            (deps.value73.current.annotations ?? []).length +
              deps.value329.current.length +
              value656.length >
              PlatformFileContentLimit_5
          ) {
            deps.value188(
              uiMessage("canvas.designCanvas.thisCanvasIsAtIts2") +
                String(PlatformFileContentLimit_5) +
                ").",
            );
            return;
          }
          markDropPerformance("received");
          let current4: Dynamic = deps.value80.current,
            state: Dynamic = {
              sel: deps.selectionRef.current,
              tool: deps.value339.current,
              focus: deps.focusedFileRef.current,
            },
            value657: Dynamic = null,
            callback17: Dynamic = (
              input2?: Dynamic,
              options2?: Dynamic,
            ): Dynamic => {
              if (value654 && argument) {
                let value666: Dynamic = Math.round(
                    Math.min(input2.width, Math.max(48, argument.w * 0.6)),
                  ),
                  value667: Dynamic = Math.max(
                    1,
                    Math.round((value666 * input2.height) / input2.width),
                  ),
                  { left: value668, top: value669 }: Dynamic = fileDropPosition(
                    argument,
                    detail + options2,
                    value666,
                    value667,
                  );
                return {
                  x: value668,
                  y: value669,
                  w: value666,
                  h: value667,
                };
              }
              if (value654)
                return droppedImagePlacement(
                  {
                    x: options,
                    y: context,
                  },
                  value654,
                  input2,
                  detail + options2,
                );
              let value662: Dynamic = defaultPlacedImageSize(
                  input2,
                  null,
                ),
                { w: value663, h: value664 }: Dynamic =
                  value662.h > PlatformFileContentLimit_6
                    ? {
                        w: Math.max(
                          PlatformFileContentConstant_20,
                          Math.round(
                            (value662.w *
                              PlatformFileContentLimit_6) /
                              value662.h,
                          ),
                        ),
                        h: PlatformFileContentLimit_6,
                      }
                    : value662,
                value665: Dynamic =
                  value657 ??
                  (detail > 0
                    ? Math.round(options) + detail * 1280
                    : Math.round(options - value663 / 2));
              value657 = value665 + value663 + 80;
              return {
                x: value665,
                y: Math.round(context - value664 / 2),
                w: value663,
                h: value664,
              };
            },
            callback18: Dynamic = (input2?: Dynamic): Dynamic =>
              value654 && argument
                ? {
                    ...input2,
                    x: input2.x - argument.sx,
                    y: input2.y - argument.sy,
                  }
                : input2,
            value658: Dynamic = value656.map(
              (input2?: Dynamic, options2?: Dynamic): Dynamic =>
                createDropGhost({
                  file: value654?.file ?? null,
                  page: current4,
                  washless: true,
                  ...callback18(
                    callback17(
                      {
                        width: 320,
                        height: 180,
                      },
                      options2,
                    ),
                  ),
                }),
            );
          value657 = null;
          let values2: Dynamic = new Set(value658.keys()),
            callback19: Dynamic = (
              input2?: Dynamic,
              options2?: Dynamic,
            ): Dynamic => {
              values2.delete(input2) && value658[input2][options2]();
            };
          callback15 = (): Dynamic => {
            for (let value662 of [...values2] as Dynamic)
              callback19(value662, "cancel");
          };
          let value659: Dynamic = await Promise.all(
              value656.map(
                (input2?: Dynamic): Dynamic =>
                  (value654
                    ? probeVideoFile(input2)
                    : captureVideoPoster(input2)
                  ).catch((): Dynamic => "probe_timeout"),
              ),
            ),
            index: Dynamic = 0,
            value660: Dynamic = value659.map(
              (input2?: Dynamic, options2?: Dynamic): Dynamic => {
                if (typeof input2 == "string") {
                  callback19(options2, "cancel");
                  callback16(videoUploadFailureMessage(input2));
                  return null;
                }
                let value662: Dynamic = callback17(input2, index++);
                value658[options2].place(callback18(value662));
                return value662;
              },
            );
          value660.some(Boolean) &&
            announce(
              value660.filter(Boolean).length > 1
                ? uiMessage("canvas.designCanvas.uploadingVideos")
                : uiMessage("canvas.designCanvas.uploadingVideo"),
            );
          let index2: Dynamic = 0,
            value661: Dynamic = null,
            items: Dynamic = [];
          for (let index3: Dynamic = 0; index3 < value656.length; index3++) {
            let value662: Dynamic = value659[index3],
              value663: Dynamic = value660[index3];
            if (
              value662 == null ||
              typeof value662 == "string" ||
              value663 == null
            )
              continue;
            let value664: Dynamic = null;
            if (!value654) {
              let blob: Dynamic = value662.blob;
              value664 =
                blob === undefined
                  ? null
                  : await uploadDesignFile(
                      "appifact",
                      null,
                      new File(
                        [blob],
                        videoFileTitle(value656[index3]) +
                          ".jpg",
                        {
                          type: "image/jpeg",
                        },
                      ),
                    ).then(
                      (input2?: Dynamic): Dynamic =>
                        PlatformFileContentTest_2(input2.src),
                      (): Dynamic => null,
                    );
              if (isEmbedFrozen()) return;
              if (value664 === null) {
                callback19(index3, "cancel");
                callback16(
                  uiMessage("canvas.designCanvas.couldnTStoreAStill2", { value1: uiOperation(value653) }),
                );
                continue;
              }
            }
            let value665: Dynamic = await uploadDesignVideo(
              value656[index3],
              value662,
            );
            markDropPerformance("upload");
            if (isEmbedFrozen()) return;
            if ("refused" in value665) {
              callback19(index3, "cancel");
              callback16(value665.refused);
              if (value665.repeats) break;
              continue;
            }
            if (!value654) {
              let value667: Dynamic = PlatformFileContentTest_3(
                  value665.src,
                ),
                value668: Dynamic =
                  value664 === null || value667 === null
                    ? null
                    : deps.value316.current(
                        {
                          kind: "image",
                          x: value663.x,
                          y: value663.y,
                          w: value663.w,
                          h: value663.h,
                          src: value664,
                          video: value667,
                          alt: PlatformFileContentSlice(
                            videoFileTitle(value656[index3]),
                          ),
                          ...(current4 === "" ||
                          current4 === (deps.value73.current.pages?.[0]?.id ?? "")
                            ? {}
                            : {
                                page: current4,
                              }),
                        },
                        {
                          quiet: true,
                        },
                      );
              if (value668 === null) {
                callback19(index3, "cancel");
                (deps.value73.current.annotations ?? []).length <
                  PlatformFileContentLimit_5 &&
                  callback16(
                    uiMessage("canvas.designCanvas.couldnTAddTheValue1", { value1: uiOperation(value653) }),
                  );
                continue;
              }
              items.push(value668);
              (deps.selectionRef.current === state.sel ||
                deps.selectionRef.current === value661) &&
                deps.value339.current === state.tool &&
                deps.focusedFileRef.current === state.focus &&
                deps.value80.current === current4 &&
                ((value661 = selectionFromBoards({
                  files: emptyBoardSelection.files,
                  notes: new Set(items),
                })),
                (deps.selectionRef.current = value661),
                deps.value62(),
                deps.setSelection(value661));
              callback19(index3, "landed");
              index2++;
              continue;
            }
            let value666: Dynamic;
            for (
              let index4: Dynamic = 0;
              index4 < 120 &&
              !isEmbedFrozen() &&
              ((value666 =
                value654.file === deps.value271.current
                  ? undefined
                  : deps.value177.current.get(value654.file)),
              !value666);
              index4++
            )
              await new Promise(
                (input2?: Dynamic): Dynamic => setTimeout(input2, 500),
              );
            if (
              (value666
                ? await value666.insertHtml(
                    positionedVideoHtml(
                      value665.src,
                      value662,
                      {
                        left: value663.x,
                        top: value663.y,
                        w: value663.w,
                      },
                      safeDroppedImageAltText(
                        videoFileTitle(value656[index3]),
                        videoFileTitle({
                          name: "",
                        }),
                      ),
                    ),
                    "page",
                  )
                : []
              ).length === 0
            ) {
              callback19(index3, "cancel");
              callback16(
                value666
                  ? uiMessage("canvas.designCanvas.couldNotPlaceTheValue14", { value1: uiOperation(value653) })
                  : uiMessage("canvas.designCanvas.theVideoUploadedButIts"),
              );
              continue;
            }
            callback19(index3, "landed");
            markDropPerformance("insert");
            index2++;
          }
          index2 > 0 &&
            announce(
              index2 + (index2 > 1 ? " videos " : " video ") + value653,
            );
        })().finally((): Dynamic => callback15()),
      );
    }
