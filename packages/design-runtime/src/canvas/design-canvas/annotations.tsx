import { CanvasAnnotationShapeStyleLineArrowPenConfig } from "../annotation-shape-style";
import { CanvasImagePlacementError } from "../../assets/image-placement";
import { CanvasWorkingStateJoin } from "../working-state";
import { CanvasWorkingStatePrint } from "../working-state";
import { CanvasWorkingStateReplace } from "../working-state";
import { CanvasWorkingStateWidth } from "../working-state";
import { ModelModelStateLimit } from "../../editor/model/model-state";
import { NotesBlocksHandler } from "../../editor/notes/blocks";
import { PlatformFileContentBackgroundBackgroundColorOpacityValues } from "../../platform/file-content";
import { PlatformFileContentConstant_10 } from "../../platform/file-content";
import { PlatformFileContentConstant_12 } from "../../platform/file-content";
import { PlatformFileContentConstant_13 } from "../../platform/file-content";
import { PlatformFileContentConstant_18 } from "../../platform/file-content";
import { PlatformFileContentConstant_19 } from "../../platform/file-content";
import { PlatformFileContentConstant_20 } from "../../platform/file-content";
import { PlatformFileContentConstant_9 } from "../../platform/file-content";
import { PlatformFileContentKind } from "../../platform/file-content";
import { PlatformFileContentLimit_6 } from "../../platform/file-content";
import { PlatformFileContentMaxW } from "../../platform/file-content";
import { PlatformFileContentSlice } from "../../platform/file-content";
import { PlatformFileContentTest_2 } from "../../platform/file-content";
import { PlatformFileContentTest_3 } from "../../platform/file-content";
import { PlatformFileContentTrim } from "../../platform/file-content";
import { annotationArrowHeads } from "../../platform/file-content";
import { annotationBounds } from "../../platform/file-content";
import { annotationColor } from "../annotation-shape-style";
import { annotationGeometry } from "../../platform/file-content";
import { annotationRotation } from "../../platform/file-content";
import { annotationTextStyle } from "../../platform/file-content";
import { announce } from "../../editor/accessibility/announcer";
import { captureVideoPoster } from "../../editor/media/video-upload";
import { droppedImageLabel } from "../paste-placement";
import { filterSettingHistoryStep } from "../manifest-history";
import { flipAnnotations } from "../../editor/geometry/flip-annotations";
import { imageCropCss } from "../../editor/media/crop-geometry";
import { imageFlipCss } from "../../editor/geometry/flip-annotations";
import { isEmbedFrozen } from "../../platform/file-content";
import { isImageFile } from "../../platform/image-processing";
import { isShapeAnnotation } from "../../platform/file-content";
import { isVideoFile } from "../../editor/media/video-upload";
import { moveAnnotation } from "../../platform/file-content";
import { parseNoteBlocks } from "../../editor/notes/blocks";
import { trackEmbeddedWrite } from "../../platform/file-content";
import { type Dynamic } from "../../runtime-types";
import { uiMessage } from "@minedesign/contracts/ui-messages";
import { uiOperation } from "@minedesign/contracts/ui-value";
import { updateAnnotationAlt } from "../../platform/file-content";
import { updateAnnotationCrop } from "../../platform/file-content";
import { updateAnnotationCss } from "../../platform/file-content";
import { updateAnnotationTextStyle } from "../../platform/file-content";
import { updateAnnotationVideo } from "../../platform/file-content";
import { uploadDesignFile } from "../working-state";
import { uploadDesignVideo } from "../working-state";
import { validateCanvasPlacedImage } from "../../assets/image-placement";
import { videoFileTitle } from "../working-state";
import { videoUploadFailureMessage } from "../../editor/media/video-upload";
import { videoUploadRefusal } from "../../editor/media/video-upload";

/** 把画布说明或图片图形转成可插入画板的 HTML 片段（含旋转、翻转、裁剪与文字样式），无法转换的图形返回 null；拖入画板时使用。 */
export function annotationToElementHtml(deps: Record<string, never>, source?: Dynamic): Dynamic {
      let callback15: Dynamic = (input?: Dynamic): Dynamic =>
          input
            .replace(/&/g, "&amp;")
            .replace(/"/g, "&quot;")
            .replace(/</g, "&lt;"),
        value653: Dynamic = [
          annotationRotation(source) !== 0
            ? "rotate(" +
              String(annotationRotation(source)) +
              "deg)"
            : "",
          imageFlipCss(source)?.transform ?? "",
        ]
          .filter((input?: Dynamic): Dynamic => input !== "")
          .join(" "),
        value654: Dynamic =
          value653 !== "" ? " transform: " + value653 + ";" : "";
      if (isShapeAnnotation(source)) {
        if (source.kind !== "image" || source.video) return null;
        let value657: Dynamic = String(Math.round(source.w)),
          value658: Dynamic = String(Math.round(source.h));
        if (source.crop) {
          let value659: Dynamic = imageCropCss(source.crop),
            value660: Dynamic =
              "position: absolute; width: " +
              value659.width +
              "; height: " +
              value659.height +
              "; left: " +
              value659.left +
              "; top: " +
              value659.top +
              "; max-width: none; max-height: none; object-fit: cover; object-position: " +
              value659.objectPosition;
          return (
            '<div style="position: relative; contain: layout; overflow: hidden; width: ' +
            value657 +
            "px; height: " +
            value658 +
            "px;" +
            value654 +
            '"><img src="' +
            callback15(source.src) +
            '"' +
            (source.alt ? ' alt="' + callback15(source.alt) + '"' : "") +
            ' style="' +
            value660 +
            '"></div>'
          );
        }
        return (
          '<img src="' +
          callback15(source.src) +
          '"' +
          (source.alt ? ' alt="' + callback15(source.alt) + '"' : "") +
          ' width="' +
          value657 +
          '" height="' +
          value658 +
          '" style="width: ' +
          value657 +
          "px; height: auto;" +
          value654 +
          '">'
        );
      }
      let value655: Dynamic = annotationTextStyle(source),
        callback16: Dynamic = (input?: Dynamic): Dynamic =>
          input
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;"),
        state: Dynamic = {
          bold: "strong",
          italic: "em",
          code: "code",
        },
        callback17: Dynamic = (input?: Dynamic): Dynamic =>
          NotesBlocksHandler(input)
            .map(
              (source2?: Dynamic): Dynamic =>
                source2.kind === "text"
                  ? callback16(source2.text)
                  : source2.kind === "link"
                    ? /^https?:\/\//i.test(source2.href)
                      ? '<a href="' +
                        callback15(source2.href) +
                        '">' +
                        callback16(source2.text) +
                        "</a>"
                      : callback16(source2.text)
                    : "<" +
                      state[source2.kind] +
                      ">" +
                      callback16(source2.text) +
                      "</" +
                      state[source2.kind] +
                      ">",
            )
            .join(""),
        value656: Dynamic = parseNoteBlocks(source.text)
          .map(
            (source2?: Dynamic): Dynamic =>
              source2.kind === "p"
                ? "<div>" +
                  (source2.text === "" ? "<br>" : callback17(source2.text)) +
                  "</div>"
                : source2.kind === "ul"
                  ? "<ul>" +
                    source2.items
                      .map(
                        (input?: Dynamic): Dynamic =>
                          "<li>" + callback17(input) + "</li>",
                      )
                      .join("") +
                    "</ul>"
                  : '<ol start="' +
                    String(source2.start) +
                    '">' +
                    source2.items
                      .map(
                        (input?: Dynamic): Dynamic =>
                          "<li>" + callback17(input) + "</li>",
                      )
                      .join("") +
                    "</ol>",
          )
          .join("");
      return source.text.trim() === ""
        ? null
        : '<div style="margin: 0; width: ' +
            String(Math.round(source.w)) +
            "px; font-size: " +
            String(value655.size) +
            "px;" +
            (value655.bold ? " font-weight: 600;" : "") +
            (value655.italic ? " font-style: italic;" : "") +
            " white-space: pre-wrap;" +
            value654 +
            '">' +
            value656 +
            "</div>";
    }

/** 翻转选中的画布图形时运行：计算翻转结果，写回清单并记录 transform 历史，返回已翻转与被拒的项目。 */
export function flipAnnotationsWithHistory(deps: { readonly value140: Dynamic; readonly value224: Dynamic; readonly value413: Dynamic; readonly value73: Dynamic; readonly value98: Dynamic }, input?: Dynamic, options?: Dynamic, context?: Dynamic): Dynamic {
        let current4: Dynamic = deps.value73.current,
          value653: Dynamic = deps.value224.current && true,
          { flips: value654, refused: value655 }: Dynamic = value653
            ? flipAnnotations(
                (current4.annotations ?? []).filter(
                  (input2?: Dynamic): Dynamic => input.has(input2.id),
                ),
                options,
              )
            : {
                flips: [],
                refused: undefined,
              };
        if (value654.length === 0) {
          context !== undefined && deps.value140.current.get(context)?.();
          return value655 === undefined
            ? {
                flipped: false,
              }
            : {
                flipped: false,
                refused: value655,
              };
        }
        let entries: Dynamic = new Map(
          value654.map((input2?: Dynamic): Dynamic => [input2.id, input2.to]),
        );
        deps.value413(
          {
            kind: "transform",
            get label() { return uiMessage("canvas.designCanvas.flip"); },
            boards: [],
            anns: value654,
          },
          new Set(),
          undefined,
          context,
        );
        deps.value98({
          ...current4,
          annotations: (current4.annotations ?? []).map(
            (input2?: Dynamic): Dynamic => {
              let entry: Dynamic = entries.get(input2.id);
              return entry
                ? {
                    ...input2,
                    ...entry,
                  }
                : input2;
            },
          ),
        });
        return value655 === undefined
          ? {
              flipped: true,
            }
          : {
              flipped: true,
              refused: value655,
            };
      }

/** 在属性面板修改画布图形或说明的位置与尺寸时运行：校验数值、按图形类型换算几何并写回清单，记录移动或缩放历史。 */
export function setAnnotationBox(deps: { readonly value396: Dynamic; readonly value68: Dynamic; readonly value70: Dynamic; readonly value73: Dynamic; readonly value98: Dynamic }, input?: Dynamic,
        options?: Dynamic,
        context?: Dynamic,
        value653?: Dynamic): Dynamic {
        let value654: Dynamic = deps.value73.current.annotations ?? [],
          value655: Dynamic = value654.find(
            (input2?: Dynamic): Dynamic => input2.id === input,
          );
        if (
          !value655 ||
          Object.values(options).some(
            (input2?: Dynamic): Dynamic =>
              input2 != null && !Number.isFinite(input2),
          )
        )
          return;
        let value656: Dynamic =
            (deps.value70.current ?? deps.value73.current).annotations?.find(
              (input2?: Dynamic): Dynamic => input2.id === input,
            ) ?? value655,
          callback15: Dynamic = (input2?: Dynamic): Dynamic =>
            Math.max(
              -PlatformFileContentConstant_18,
              Math.min(
                PlatformFileContentConstant_18,
                Math.round(input2),
              ),
            ),
          value657: Dynamic;
        if (
          value655.kind === "rect" ||
          value655.kind === "oval" ||
          value655.kind === "pen" ||
          value655.kind === "image"
        ) {
          let value659: Dynamic =
              value655.kind === "image"
                ? PlatformFileContentConstant_20
                : PlatformFileContentConstant_19,
            callback16: Dynamic = (input2?: Dynamic): Dynamic =>
              Math.min(
                PlatformFileContentLimit_6,
                Math.max(value659, Math.round(input2)),
              ),
            value660: Dynamic =
              options.w !== undefined ? callback16(options.w) : value655.w,
            value661: Dynamic =
              options.h !== undefined ? callback16(options.h) : value655.h;
          if (
            value655.kind === "image" &&
            value653 &&
            (options.w !== undefined) != (options.h !== undefined)
          ) {
            let value662: Dynamic = value656;
            options.w !== undefined
              ? (value661 = callback16((value660 * value662.h) / value662.w))
              : (value660 = callback16((value661 * value662.w) / value662.h));
          }
          value657 = {
            ...value655,
            x: callback15(options.x ?? value655.x),
            y: callback15(options.y ?? value655.y),
            w: value660,
            h: value661,
          };
        } else if (isShapeAnnotation(value655)) {
          let value659: Dynamic = annotationBounds(value655);
          value657 = moveAnnotation(
            value655,
            callback15(value655.x + ((options.x ?? value659.x) - value659.x)),
            callback15(value655.y + ((options.y ?? value659.y) - value659.y)),
          );
        } else {
          let value659: Dynamic =
              options.w !== undefined
                ? Math.min(
                    PlatformFileContentConstant_10,
                    Math.max(
                      PlatformFileContentConstant_9,
                      Math.round(options.w),
                    ),
                  )
                : value655.w,
            callback16: Dynamic = (
              input2?: Dynamic,
              options2?: Dynamic,
            ): Dynamic =>
              input2 === undefined
                ? options2
                : input2 === null
                  ? undefined
                  : Math.min(
                      PlatformFileContentConstant_13,
                      Math.max(
                        PlatformFileContentConstant_12,
                        Math.round(input2),
                      ),
                    ),
            {
              maxW: value660,
              maxH: value661,
              ...value662
            }: Dynamic = value655,
            [items, items2]: Dynamic = [
              value655.kind === "title1"
                ? callback16(options.maxW, value655.maxW)
                : undefined,
              callback16(options.maxH, value655.maxH),
            ];
          value657 = {
            ...value662,
            x: callback15(options.x ?? value655.x),
            y: callback15(options.y ?? value655.y),
            w: value659,
            ...(items !== undefined
              ? {
                  maxW: items,
                }
              : {}),
            ...(items2 !== undefined
              ? {
                  maxH: items2,
                }
              : {}),
          };
        }
        let value658: Dynamic = value654.map(
          (input2?: Dynamic): Dynamic =>
            input2.id === input ? value657 : input2,
        );
        if (!context) {
          deps.value68({
            ...deps.value73.current,
            annotations: value658,
          });
          return;
        }
        if (
          ["x", "y", "w", "h", "maxW", "maxH"].every(
            (input2?: Dynamic): Dynamic =>
              value656[input2] === value657[input2],
          ) &&
          (!("x2" in value656) ||
            (value656.x2 === value657.x2 && value656.y2 === value657.y2))
        ) {
          value655 !== value657 &&
            deps.value68({
              ...deps.value73.current,
              annotations: value658,
            });
          return;
        }
        if (
          isShapeAnnotation(value656) &&
          isShapeAnnotation(value657)
        )
          deps.value396.current(
            {
              kind: "ann-box",
              id: input,
              from: annotationGeometry(value656),
              to: annotationGeometry(value657),
            },
            new Set(),
          );
        else if (
          !isShapeAnnotation(value656) &&
          !isShapeAnnotation(value657)
        ) {
          let value659: Dynamic = ["maxW", "maxH"].filter(
            (input2?: Dynamic): Dynamic =>
              value656[input2] !== value657[input2],
          );
          value659.length > 0 &&
            deps.value396.current(
              {
                kind: "transform",
                get label() { return uiMessage("canvas.designCanvas.resize"); },
                boards: [],
                anns: [
                  {
                    id: input,
                    from: Object.fromEntries(
                      value659.map(
                        (input2?: Dynamic): Dynamic => [
                          input2,
                          value656[input2],
                        ],
                      ),
                    ),
                    to: Object.fromEntries(
                      value659.map(
                        (input2?: Dynamic): Dynamic => [
                          input2,
                          value657[input2],
                        ],
                      ),
                    ),
                  },
                ],
              },
              new Set(),
            );
          value656.w !== value657.w &&
            deps.value396.current(
              {
                kind: "ann-resize",
                id: input,
                from: value656.w,
                to: value657.w,
              },
              new Set(),
            );
          (value656.x !== value657.x || value656.y !== value657.y) &&
            deps.value396.current(
              {
                kind: "ann-move",
                id: input,
                from: {
                  x: value656.x,
                  y: value656.y,
                },
                to: {
                  x: value657.x,
                  y: value657.y,
                },
              },
              new Set(),
            );
        }
        deps.value98({
          ...deps.value73.current,
          annotations: value658,
        });
      }

/** 在属性面板修改画布图形的背景、透明度或图片填充方式时运行（onAnnotationCss）：校验取值、更新样式并合并历史。 */
export function setAnnotationCss(deps: { readonly value188: Dynamic; readonly value396: Dynamic; readonly value405: Dynamic; readonly value408: Dynamic; readonly value412: Dynamic; readonly value415: Dynamic; readonly value68: Dynamic; readonly value70: Dynamic; readonly value73: Dynamic; readonly value98: Dynamic }, input?: Dynamic,
        options?: Dynamic,
        context: Dynamic = false): Dynamic {
        let value653: Dynamic = deps.value73.current.annotations ?? [],
          value654: Dynamic = value653.find(
            (input2?: Dynamic): Dynamic => input2.id === input,
          );
        if (!value654 || !isShapeAnnotation(value654)) return;
        let value655: Dynamic = context
            ? value654
            : ((deps.value70.current ?? deps.value73.current).annotations?.find(
                (input2?: Dynamic): Dynamic => input2.id === input,
              ) ?? value654),
          state: Dynamic = {
            ...(value654.css ?? {}),
          },
          flag2: Dynamic = false;
        for (let { prop: value661, value: value662 } of options as Dynamic) {
          if (
            !PlatformFileContentBackgroundBackgroundColorOpacityValues.includes(
              value661,
            )
          )
            continue;
          let value663: Dynamic = value661;
          if (value662 === null || value662.trim() === "")
            delete state[value663];
          else {
            let value664: Dynamic = PlatformFileContentTrim(
              value663,
              value662,
            );
            value664 === null ? (flag2 = true) : (state[value663] = value664);
          }
        }
        flag2 &&
          deps.value188(
            uiMessage("canvas.designCanvas.thatValueIsnTOne"),
          );
        let value656: Dynamic =
          Object.keys(state).length > 0 ? state : undefined;
        if (context) {
          JSON.stringify(value656 ?? null) !==
            JSON.stringify(value654.css ?? null) &&
            deps.value68({
              ...deps.value73.current,
              annotations: value653.map(
                (input2?: Dynamic): Dynamic =>
                  input2.id === input
                    ? updateAnnotationCss(value654, value656)
                    : input2,
              ),
            });
          return;
        }
        let value657: Dynamic = isShapeAnnotation(value655)
            ? value655.css
            : undefined,
          callback15: Dynamic = (input2?: Dynamic): Dynamic =>
            (value656?.[input2] ?? null) !== (value657?.[input2] ?? null),
          value658: Dynamic =
            value654.kind === "image" &&
            (callback15("object-fit") || callback15("object-position"))
              ? value654.crop
              : undefined,
          callback16: Dynamic = (): Dynamic =>
            value658 !== undefined && value654.kind === "image"
              ? updateAnnotationCrop(
                  updateAnnotationCss(value654, value656),
                  undefined,
                )
              : updateAnnotationCss(value654, value656);
        if (
          JSON.stringify(value656 ?? null) ===
          JSON.stringify(value657 ?? null)
        ) {
          JSON.stringify(value656 ?? null) !==
            JSON.stringify(value654.css ?? null) &&
            deps.value68({
              ...deps.value73.current,
              annotations: value653.map(
                (input2?: Dynamic): Dynamic =>
                  input2.id === input
                    ? updateAnnotationCss(value654, value656)
                    : input2,
              ),
            });
          return;
        }
        let value659: Dynamic =
            PlatformFileContentBackgroundBackgroundColorOpacityValues.filter(
              (input2?: Dynamic): Dynamic =>
                (value657?.[input2] ?? null) !== (state[input2] ?? null),
            ),
          value660: Dynamic = deps.value405.current[deps.value405.current.length - 1];
        if (
          value660?.op.kind === "ann-css" &&
          value660.op.id === input &&
          value660.op.cropFrom === undefined &&
          value658 === undefined &&
          !value660.sealed &&
          value659.length === 1 &&
          value660.cssKey === value659[0] &&
          Date.now() - value660.at < ModelModelStateLimit &&
          deps.value415("undo") === value660
        ) {
          let value661: Dynamic = filterSettingHistoryStep(
            value660.op,
            value659[0],
            value656,
          );
          value660.at = Date.now();
          deps.value412();
          value661
            ? (value660.op = value661)
            : (deps.value405.current.pop(),
              deps.value408((input2?: Dynamic): Dynamic => input2 + 1));
        } else {
          deps.value396.current(
            {
              kind: "ann-css",
              id: input,
              from: value657,
              to: value656,
              ...(value658 !== undefined
                ? {
                    cropFrom: value658,
                  }
                : {}),
            },
            new Set(),
          );
          let value661: Dynamic =
            deps.value405.current[deps.value405.current.length - 1];
          value661 &&
            value659.length === 1 &&
            (value661.cssKey = value659[0]);
        }
        deps.value98({
          ...deps.value73.current,
          annotations: value653.map(
            (input2?: Dynamic): Dynamic =>
              input2.id === input ? callback16() : input2,
          ),
        });
      }

/** 在属性面板修改画布说明或图形的文字样式时运行：写回文字样式并记录 ann-style 历史。 */
export function setAnnotationTextStyle(deps: { readonly value396: Dynamic; readonly value68: Dynamic; readonly value70: Dynamic; readonly value73: Dynamic; readonly value98: Dynamic }, input?: Dynamic,
        options?: Dynamic,
        context: Dynamic = false): Dynamic {
        let value653: Dynamic = deps.value73.current.annotations ?? [],
          value654: Dynamic = value653.find(
            (input2?: Dynamic): Dynamic => input2.id === input,
          );
        if (!value654 || isShapeAnnotation(value654)) return;
        let value655: Dynamic = updateAnnotationTextStyle(
            value654,
            options,
          ),
          value656: Dynamic = value653.map(
            (input2?: Dynamic): Dynamic =>
              input2.id === input ? value655 : input2,
          );
        if (context) {
          JSON.stringify(annotationTextStyle(value654)) !==
            JSON.stringify(annotationTextStyle(value655)) &&
            deps.value68({
              ...deps.value73.current,
              annotations: value656,
            });
          return;
        }
        let value657: Dynamic = (
            deps.value70.current ?? deps.value73.current
          ).annotations?.find(
            (input2?: Dynamic): Dynamic => input2.id === input,
          ),
          value658: Dynamic = annotationTextStyle(
            value657 !== undefined &&
              !isShapeAnnotation(value657)
              ? value657
              : value654,
          ),
          value659: Dynamic = annotationTextStyle(value655);
        if (JSON.stringify(value658) === JSON.stringify(value659)) {
          value654 !== value655 &&
            deps.value68({
              ...deps.value73.current,
              annotations: value656,
            });
          return;
        }
        deps.value396.current(
          {
            kind: "ann-style",
            id: input,
            from: value658,
            to: value659,
          },
          new Set(),
        );
        deps.value98({
          ...deps.value73.current,
          annotations: value656,
        });
      }

/** 在属性面板替换画布图片时运行：校验并上传新图片，更新图片地址、裁剪与替代文字，失败时提示。 */
export function replaceAnnotationPicture(deps: { readonly value188: Dynamic; readonly value396: Dynamic; readonly value73: Dynamic; readonly value98: Dynamic }, input?: Dynamic, options?: Dynamic): Dynamic {
        if (
          typeof options == "string"
            ? PlatformFileContentTest_2(options) === null
            : !(options instanceof File) || !options.type.startsWith("image/")
        )
          return;
        let value653: Dynamic = (deps.value73.current.annotations ?? []).find(
            (input2?: Dynamic): Dynamic => input2.id === input,
          ),
          value654: Dynamic =
            value653?.kind === "image" ? value653.src : undefined;
        trackEmbeddedWrite(
          (async (): Promise<Dynamic> => {
            if (typeof options != "string") {
              let value655: Dynamic = await validateCanvasPlacedImage(options);
              if (value655 !== null)
                throw new CanvasImagePlacementError(value655);
            }
            return typeof options == "string"
              ? {
                  src: options,
                }
              : uploadDesignFile("appifact", null, options);
          })().then(({ src: src }: Dynamic): Dynamic => {
            if (isEmbedFrozen()) return;
            let value655: Dynamic = PlatformFileContentTest_2(
              src,
            );
            if (value655 === null) {
              deps.value188(uiMessage("canvas.designCanvas.couldNotReplaceThePicture"));
              return false;
            }
            let value656: Dynamic = deps.value73.current.annotations ?? [],
              value657: Dynamic = value656.find(
                (input2?: Dynamic): Dynamic => input2.id === input,
              );
            if (
              !value657 ||
              value657.kind !== "image" ||
              value657.src === value655 ||
              value657.src !== value654
            )
              return;
            let value658: Dynamic =
              typeof options == "string"
                ? value657.alt
                : (PlatformFileContentSlice(
                    droppedImageLabel(options, "dropped"),
                  ) ?? value657.alt);
            deps.value396.current(
              {
                kind: "ann-src",
                id: input,
                from: {
                  src: value657.src,
                  alt: value657.alt,
                  crop: value657.crop,
                },
                to: {
                  src: value655,
                  alt: value658,
                },
              },
              new Set(),
            );
            deps.value98({
              ...deps.value73.current,
              annotations: value656.map(
                (input2?: Dynamic): Dynamic =>
                  input2.id === input
                    ? updateAnnotationCrop(
                        updateAnnotationAlt(
                          {
                            ...value657,
                            src: value655,
                          },
                          value658,
                        ),
                        undefined,
                      )
                    : input2,
              ),
            });
          }),
        ).catch(
          (input2?: Dynamic): Dynamic =>
            deps.value188(
              uiMessage("canvas.designCanvas.thePictureWasNotReplaced", { value1: uiOperation(input2 instanceof CanvasImagePlacementError ? input2.message : "the upload failed") }),
            ),
        );
      }

/** 替换画布上的图片或视频时运行（onReplaceAnnotationMedia）：按文件类型上传图片，或探测视频、生成封面后上传，并更新图形与历史。 */
export function replaceAnnotationMedia(deps: { readonly value188: Dynamic; readonly value396: Dynamic; readonly value425: Dynamic; readonly value73: Dynamic; readonly value98: Dynamic }, input?: Dynamic, options?: Dynamic): Dynamic {
        let value653: Dynamic = (deps.value73.current.annotations ?? []).find(
          (input2?: Dynamic): Dynamic => input2.id === input,
        );
        if (
          !value653 ||
          value653.kind !== "image" ||
          !(options instanceof File)
        )
          return;
        let value654: Dynamic = CanvasWorkingStateJoin(options);
        if (
          CanvasWorkingStatePrint(
            deps.value425.current.get(input),
            value654,
            value653,
          )
        )
          return;
        let state: Dynamic = {
            src: value653.src,
            video: value653.video,
          },
          callback15: Dynamic = (
            input2?: Dynamic,
            options2?: Dynamic,
            context?: Dynamic,
          ): Dynamic => {
            let value656: Dynamic = deps.value73.current.annotations ?? [],
              value657: Dynamic = value656.find(
                (input3?: Dynamic): Dynamic => input3.id === input,
              );
            if (
              !value657 ||
              value657.kind !== "image" ||
              value657.src !== state.src ||
              value657.video !== state.video ||
              (value657.src === input2.src && value657.video === input2.video)
            )
              return false;
            let value658: Dynamic = CanvasWorkingStateWidth(
              value657.w,
              context,
              value657.h,
              PlatformFileContentConstant_20,
              PlatformFileContentLimit_6,
            );
            deps.value396.current(
              {
                kind: "ann-src",
                id: input,
                from: {
                  src: value657.src,
                  alt: value657.alt,
                  h: value657.h,
                  ...(value657.video !== undefined
                    ? {
                        video: value657.video,
                      }
                    : {}),
                  ...(value657.crop !== undefined
                    ? {
                        crop: value657.crop,
                      }
                    : {}),
                },
                to: {
                  src: input2.src,
                  alt: options2,
                  h: value658,
                  ...(input2.video !== undefined
                    ? {
                        video: input2.video,
                      }
                    : {}),
                },
              },
              new Set(),
            );
            deps.value98({
              ...deps.value73.current,
              annotations: value656.map(
                (input3?: Dynamic): Dynamic =>
                  input3.id === input
                    ? updateAnnotationCrop(
                        updateAnnotationAlt(
                          updateAnnotationVideo(
                            {
                              ...value657,
                              src: input2.src,
                              h: value658,
                            },
                            input2.video,
                          ),
                          options2,
                        ),
                        undefined,
                      )
                    : input3,
              ),
            });
            deps.value425.current.set(input, {
              print: value654,
              src: input2.src,
              video: input2.video,
            });
            return true;
          };
        if (isImageFile(options)) {
          trackEmbeddedWrite(
            (async (): Promise<Dynamic> => {
              let value656: Dynamic = await validateCanvasPlacedImage(options);
              if (value656 !== null)
                throw new CanvasImagePlacementError(value656);
              let value657: Dynamic = await createImageBitmap(options).then(
                (input2?: Dynamic): Dynamic => {
                  let state2: Dynamic = {
                    width: input2.width,
                    height: input2.height,
                  };
                  input2.close();
                  return state2;
                },
                (): Dynamic => null,
              );
              return {
                ...(await uploadDesignFile(
                  "appifact",
                  null,
                  options,
                )),
                size: value657,
              };
            })().then(({ src: src, size: size }: Dynamic): Dynamic => {
              if (isEmbedFrozen()) return false;
              let value656: Dynamic = PlatformFileContentTest_2(
                src,
              );
              return value656 === null
                ? (deps.value188(
                    uiMessage("canvas.designCanvas.couldNotReplaceTheVideo"),
                  ),
                  false)
                : callback15(
                    {
                      src: value656,
                    },
                    PlatformFileContentSlice(
                      droppedImageLabel(options, "dropped"),
                    ),
                    size,
                  );
            }),
          ).catch(
            (input2?: Dynamic): Dynamic => (
              deps.value188(
                uiMessage("canvas.designCanvas.theVideoWasNotReplaced", { value1: uiOperation(input2 instanceof CanvasImagePlacementError ? input2.message : "the upload failed") }),
              ),
              false
            ),
          );
          return;
        }
        let value655: Dynamic = isVideoFile(options)
          ? videoUploadRefusal(options)
          : "unsupported_type";
        if (value655 !== null) {
          deps.value188(
            CanvasWorkingStateReplace(
              videoUploadFailureMessage(value655),
            ),
          );
          return;
        }
        announce(uiMessage("canvas.designCanvas.uploadingVideo"));
        trackEmbeddedWrite(
          (async (): Promise<Dynamic> => {
            let value656: Dynamic = await captureVideoPoster(
              options,
            ).catch((): Dynamic => "probe_timeout");
            if (typeof value656 == "string") {
              deps.value188(
                CanvasWorkingStateReplace(
                  videoUploadFailureMessage(value656),
                ),
              );
              return false;
            }
            let value657: Dynamic = await uploadDesignFile(
              "appifact",
              null,
              new File(
                [value656.blob],
                videoFileTitle(options) + ".jpg",
                {
                  type: "image/jpeg",
                },
              ),
            ).then(
              (input2?: Dynamic): Dynamic =>
                PlatformFileContentTest_2(input2.src),
              (): Dynamic => null,
            );
            if (isEmbedFrozen()) return false;
            if (value657 === null) {
              deps.value188(
                uiMessage("canvas.designCanvas.couldnTStoreAStill"),
              );
              return false;
            }
            let value658: Dynamic = await uploadDesignVideo(
              options,
              value656,
            );
            if (isEmbedFrozen()) return false;
            if ("refused" in value658) {
              deps.value188(
                CanvasWorkingStateReplace(value658.refused),
              );
              return false;
            }
            let value659: Dynamic = PlatformFileContentTest_3(
              value658.src,
            );
            if (value659 === null) {
              deps.value188(uiMessage("canvas.designCanvas.couldnTReplaceTheVideo"));
              return false;
            }
            let value660: Dynamic = callback15(
              {
                src: value657,
                video: value659,
              },
              PlatformFileContentSlice(
                videoFileTitle(options),
              ),
              value656,
            );
            value660 && announce(uiMessage("canvas.designCanvas.videoReplaced"));
            return value660;
          })(),
        );
      }

/** 只选中一个画布图形或说明时计算（useMemo）：生成属性面板所需的位置、尺寸、颜色、线宽、箭头和文字样式及对应修改回调。 */
export function deriveAnnotationSettings(deps: { readonly value168: Dynamic; readonly value169: Dynamic; readonly value420: Dynamic; readonly value421: Dynamic; readonly value422: Dynamic; readonly value423: Dynamic; readonly value424: Dynamic; readonly value67: Dynamic }): Dynamic {
      if (deps.value169.size !== 1 || deps.value168.size > 0) return null;
      let value653: Dynamic = [...deps.value169][0],
        value654: Dynamic = (deps.value67.annotations ?? []).find(
          (input?: Dynamic): Dynamic => input.id === value653,
        );
      if (!value654) return null;
      let value655: Dynamic = isShapeAnnotation(value654)
        ? annotationBounds(value654)
        : {
            x: value654.x,
            y: value654.y,
            w: value654.w,
          };
      return {
        id: value653,
        kind: value654.kind ?? "note",
        x: value655.x,
        y: value655.y,
        w: value655.w,
        ...("h" in value655 &&
        value654.kind !== "line" &&
        value654.kind !== "arrow"
          ? {
              h: value655.h,
            }
          : {}),
        ...(isShapeAnnotation(value654)
          ? {
              css: value654.css,
              paint: annotationColor(
                value654.kind,
                value654.color ?? "default",
              ),
              ...(value654.kind === "line" ||
              value654.kind === "arrow" ||
              value654.kind === "pen"
                ? {
                    strokeWidth:
                      CanvasAnnotationShapeStyleLineArrowPenConfig[
                        value654.kind
                      ],
                  }
                : {}),
              ...(value654.kind === "line" || value654.kind === "arrow"
                ? {
                    heads: annotationArrowHeads(value654),
                    onSetHeads: (
                      input?: Dynamic,
                      options?: Dynamic,
                    ): Dynamic => deps.value422(value653, input, options),
                  }
                : {}),
              onSetCss: (input?: Dynamic, options?: Dynamic): Dynamic =>
                deps.value421(value653, input, options),
            }
          : {
              textStyle: annotationTextStyle(value654),
              maxW: value654.maxW,
              maxH: value654.maxH,
              defaultMaxW:
                value654.kind === "title1"
                  ? PlatformFileContentMaxW({
                      ...value654,
                      maxW: undefined,
                    })
                  : undefined,
              defaultMaxH: Number.isFinite(
                PlatformFileContentKind({
                  ...value654,
                  maxH: undefined,
                }),
              )
                ? PlatformFileContentKind({
                    ...value654,
                    maxH: undefined,
                  })
                : undefined,
              onSetTextStyle: (input?: Dynamic, options?: Dynamic): Dynamic =>
                deps.value423(value653, input, options),
            }),
        ...(value654.kind === "image"
          ? {
              src: value654.src,
              alt: value654.alt,
              ...(value654.video !== undefined
                ? {
                    video: value654.video,
                  }
                : {
                    onReplaceImage: (input?: Dynamic): Dynamic =>
                      deps.value424(value653, input),
                  }),
            }
          : {}),
        onSetBox: (input?: Dynamic, options?: Dynamic): Dynamic =>
          deps.value420(value653, input, options, false),
      };
    }
