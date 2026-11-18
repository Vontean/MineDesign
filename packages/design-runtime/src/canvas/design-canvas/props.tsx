import { CanvasWorkingStateReplace } from "../working-state";
import { InspectorPropertySchemaItems } from "../../editor/inspector/property-schema";
import { VideoMp4VideoWebmVideoQuicktimeMovValue } from "../../editor/media/video-upload";
import { announce } from "../../editor/accessibility/announcer";
import { isEmbedFrozen } from "../../platform/file-content";
import { isVideoFile } from "../../editor/media/video-upload";
import { probeVideoFile } from "../../editor/media/video-upload";
import { trackEmbeddedWrite } from "../../platform/file-content";
import { type Dynamic } from "../../runtime-types";
import { uploadDesignFile } from "../working-state";
import { uploadDesignVideo } from "../working-state";
import { videoUploadFailureMessage } from "../../editor/media/video-upload";
import { videoUploadRefusal } from "../../editor/media/video-upload";
import { canvasSelectionChromeInsetPixels } from "../design-canvas";

/** 选择变化时计算（useMemo）：汇总选中元素的标签、文字、样式、字体与颜色普查，生成属性面板使用的 probe 与 seed。 */
export function deriveSelectionInspectorProbe(deps: { readonly selection: Dynamic; readonly value177: Dynamic; readonly value19: Dynamic; readonly value232: Dynamic; readonly value242: Dynamic }): Dynamic {
      if (deps.selection.elements.size === 0) return null;
      let index: Dynamic = 0,
        index2: Dynamic = 0,
        index3: Dynamic = 0,
        index4: Dynamic = 0,
        index5: Dynamic = 0,
        index6: Dynamic = 0,
        state: Dynamic = {},
        text: Dynamic = "",
        value653: Dynamic = null,
        value654: Dynamic = null,
        items: Dynamic = [],
        text2: Dynamic = "none",
        items2: Dynamic = [
          "font-weight",
          "font-style",
          "text-decoration-line",
          "text-align",
          "line-height",
          "letter-spacing",
          "border-style",
          "border-width",
          "border-top-width",
          "border-right-width",
          "border-bottom-width",
          "border-left-width",
          "border-color",
          "border-radius",
          "border-top-left-radius",
          "border-top-right-radius",
          "border-bottom-right-radius",
          "border-bottom-left-radius",
          "padding-top",
          "padding-right",
          "padding-bottom",
          "padding-left",
          "margin-top",
          "margin-right",
          "margin-bottom",
          "margin-left",
          "stroke-width",
          "stroke-dasharray",
          "fill",
          "background-color",
          "background",
          ...InspectorPropertySchemaItems,
        ],
        value655: Dynamic = null,
        flag2: Dynamic = false,
        value656: Dynamic = null,
        value657: Dynamic = null,
        value658: Dynamic = null,
        value659: Dynamic = null,
        value660: Dynamic = null,
        value661: Dynamic = null,
        items3: Dynamic = [];
      for (let [value664, value665] of deps.selection.elements as Dynamic) {
        let entry: Dynamic = deps.value177.current.get(value664),
          value666: Dynamic = entry?.describeTids(value665.tids) ?? [],
          value667: Dynamic = value664 === deps.selection.primary,
          value668: Dynamic = deps.value19(value664);
        for (let value669 of value666 as Dynamic) {
          if (
            value667 &&
            value656 == null &&
            ((value656 = {
              file: value664,
              tid: value669.tid,
              kind: value669.kind,
            }),
            (text = value669.tag),
            entry)
          ) {
            for (let value670 of items2 as Dynamic) {
              let value671: Dynamic = entry.readInlineStyle(
                value668,
                value669.tid,
                value670,
              );
              value671 && (state[value670] = value671);
            }
            value669.kind === "image" &&
              (value653 =
                entry.readAttrs(value668, value669.tid)?.src ?? null);
            value669.tag === "a" &&
              (value654 =
                entry.readAttrs(value668, value669.tid)?.href ?? null);
            text2 = entry.listKindOf(value669.tid);
          }
          value669.kind === "box"
            ? index3++
            : value669.kind === "image"
              ? index4++
              : value669.kind === "other" && index5++;
          value669.kind === "text" &&
            (index++,
            entry &&
              items.length < 64 &&
              items.push(
                entry.readInlineStyle(value668, value669.tid, "font-size") ||
                  null,
              ),
            value667 &&
              value655 == null &&
              ((value655 = {
                file: value664,
                tid: value669.tid,
              }),
              (flag2 = value669.editable)),
            value667 &&
              entry &&
              value657 == null &&
              value658 == null &&
              ((value657 =
                entry.readInlineStyle(value668, value669.tid, "color") ||
                null),
              (value658 =
                entry.readInlineStyle(value668, value669.tid, "font-size") ||
                null),
              (value659 =
                entry.readInlineStyle(
                  value668,
                  value669.tid,
                  "font-family",
                ) || null)),
            value667 &&
              entry &&
              value660 == null &&
              (value660 =
                entry.readInlineStyle(
                  value668,
                  value669.tid,
                  "background-color",
                ) || null));
          if (value669.kind === "shape" || value669.kind === "box") {
            value669.kind === "shape" && index2++;
            let callback17: Dynamic = (input?: Dynamic): Dynamic =>
                input && input !== "none" ? input : null,
              value670: Dynamic =
                value667 && entry
                  ? entry.readAttrs(value668, value669.tid)
                  : null;
            value667 &&
              entry &&
              value660 == null &&
              (value660 =
                callback17(
                  entry.readInlineStyle(
                    value668,
                    value669.tid,
                    "background-color",
                  ),
                ) ||
                callback17(
                  entry.readInlineStyle(value668, value669.tid, "fill"),
                ) ||
                callback17(value670?.fill) ||
                null);
            value667 &&
              entry &&
              value661 == null &&
              (value661 =
                callback17(
                  entry.readInlineStyle(value668, value669.tid, "stroke"),
                ) ||
                callback17(
                  entry.readInlineStyle(
                    value668,
                    value669.tid,
                    "border-color",
                  ),
                ) ||
                callback17(value670?.stroke) ||
                null);
          } else
            value669.kind === "line" &&
              (index6++,
              value667 &&
                entry &&
                value661 == null &&
                (value661 =
                  entry.readInlineStyle(value668, value669.tid, "stroke") ||
                  entry.readInlineStyle(
                    value668,
                    value669.tid,
                    "border-color",
                  ) ||
                  null));
        }
        value667 && entry && (items3 = entry.pageFonts());
      }
      let entries: Dynamic = new Map(),
        callback15: Dynamic = (input?: Dynamic): Dynamic => {
          let value664: Dynamic = input.toLowerCase();
          entries.has(value664) || entries.set(value664, input);
        };
      for (let value664 of items3 as Dynamic) callback15(value664);
      let values: Dynamic = new Set(),
        values2: Dynamic = new Set(),
        entries2: Dynamic = new Map(),
        entries3: Dynamic = new Map(),
        state2: Dynamic = {},
        state3: Dynamic = {};
      for (let [value664, value665] of deps.value177.current as Dynamic) {
        let value666: Dynamic = value665.pageCensus();
        for (let value667 of value666.fonts as Dynamic) callback15(value667);
        for (let value667 of value666.webfonts as Dynamic)
          values2.add(value667);
        for (let value667 of value666.sizes as Dynamic) values.add(value667);
        for (let [value667, value668] of value666.colors as Dynamic)
          entries2.set(value667, (entries2.get(value667) ?? 0) + value668);
        if (deps.selection.elements.has(value664))
          for (let [value667, value668] of value666.colors as Dynamic)
            entries3.set(value667, (entries3.get(value667) ?? 0) + value668);
        for (let [value667, value668] of value666.roles as Dynamic)
          for (let [value669, value670] of value668 as Dynamic)
            (state2[value667] ??= {})[value669] =
              (state2[value667]?.[value669] ?? 0) + value670;
        for (let [value667, value668] of value666.families as Dynamic)
          state3[value667] ??= value668;
      }
      let callback16: Dynamic = (
          input?: Dynamic,
          options?: Dynamic,
        ): Dynamic =>
          [...input]
            .sort(
              (input2?: Dynamic, options2?: Dynamic): Dynamic =>
                options2[1] - input2[1],
            )
            .slice(0, options)
            .map(([input2]: Dynamic): Dynamic => input2),
        value662: Dynamic = callback16(entries2, 12),
        value663: Dynamic = callback16(
          entries3,
          canvasSelectionChromeInsetPixels,
        );
      value663.join(`
`) !==
        deps.value242.current.join(`
`) && (deps.value242.current = value663);
      let values3: Dynamic = new Set(entries.values());
      return {
        text: index,
        shape: index2,
        box: index3,
        image: index4,
        other: index5,
        line: index6,
        primaryTag: text,
        primaryText: value655,
        primaryEditable: flag2,
        probeEl: value655
          ? {
              ...value655,
              kind: "text",
            }
          : value656,
        seed: {
          epoch: deps.value232,
          color: value657,
          fontSize: value658,
          fontFamily: value659,
          background: value660,
          stroke: value661,
          more: state,
          imageSrc: value653,
          href: value654,
          list: text2,
          fontSizes: items,
          fonts: [...values3],
          webfonts: [...values2],
          sizes: [...values],
          sizeRoles: state2,
          sizeFamilies: state3,
          colors: value662,
          artboardColors: deps.value242.current,
        },
      };
    }

/** 属性面板点击替换图片时运行：打开文件选择框，上传所选图片并替换选中图片元素的地址。 */
export function pickReplacementImage(deps: { readonly value177: Dynamic; readonly value188: Dynamic; readonly value244: Dynamic; readonly value63: Dynamic; readonly value64: Dynamic }): Dynamic {
                                    let probeEl: Dynamic = deps.value244.probeEl;
                                    if (!probeEl) return;
                                    if (
                                      /\{\{/.test(
                                        deps.value244.seed.imageSrc ?? "",
                                      )
                                    )
                                      return deps.value188(
                                        "This image comes from the design's script \u2014 change it in Properties.",
                                      );
                                    let value653: Dynamic = deps.value63?.identity,
                                      value654: Dynamic = (
                                        document as Dynamic
                                      ).createElement("input");
                                    value654.type = "file";
                                    value654.accept = "image/*";
                                    value654.hidden = true;
                                    (document as Dynamic).body.appendChild(
                                      value654,
                                    );
                                    value654.addEventListener(
                                      "cancel",
                                      (): Dynamic => value654.remove(),
                                    );
                                    value654.onchange = (): Dynamic => {
                                      let value655: Dynamic =
                                        value654.files?.[0];
                                      value654.remove();
                                      value655 &&
                                        trackEmbeddedWrite(
                                          uploadDesignFile(
                                            "appifact",
                                            null,
                                            value655,
                                          ).then(
                                            ({
                                              src: src,
                                            }: Dynamic): Dynamic =>
                                              isEmbedFrozen() ||
                                              deps.value64.current?.identity !==
                                                value653
                                                ? null
                                                : (deps.value177.current
                                                    .get(probeEl.file)
                                                    ?.replaceImageFor(
                                                      probeEl.tid,
                                                      {
                                                        src: src,
                                                        height: null,
                                                        srcset: null,
                                                      },
                                                    ) ?? false),
                                          ),
                                        )
                                          .then(
                                            (input?: Dynamic): Dynamic => {
                                              input === false &&
                                                deps.value188(
                                                  "That image could not be placed here.",
                                                );
                                            },
                                          )
                                          .catch(
                                            (): Dynamic =>
                                              deps.value188(
                                                "Image upload failed.",
                                              ),
                                          );
                                    };
                                    value654.click();
                                  }

/** 属性面板点击替换视频时运行：打开文件选择框，校验与探测视频、上传后替换选中视频元素，并播报结果。 */
export function pickReplacementVideo(deps: { readonly value177: Dynamic; readonly value188: Dynamic; readonly value244: Dynamic; readonly value271: Dynamic }): Dynamic {
                                    let probeEl: Dynamic = deps.value244.probeEl;
                                    if (!probeEl) return;
                                    let value653: Dynamic =
                                      deps.value177.current
                                        .get(probeEl.file)
                                        ?.videoKey(probeEl.tid) ?? null;
                                    if (value653 === null)
                                      return deps.value188(
                                        "This video can't be replaced: it has no file of its own.",
                                      );
                                    if (value653.src.includes("{{"))
                                      return deps.value188(
                                        "This video's file comes from the design's data, so it can't be replaced here.",
                                      );
                                    let value654: Dynamic = (
                                      document as Dynamic
                                    ).createElement("input");
                                    value654.type = "file";
                                    value654.accept =
                                      VideoMp4VideoWebmVideoQuicktimeMovValue;
                                    value654.hidden = true;
                                    (document as Dynamic).body.appendChild(
                                      value654,
                                    );
                                    value654.addEventListener(
                                      "cancel",
                                      (): Dynamic => value654.remove(),
                                    );
                                    value654.onchange = (): Dynamic => {
                                      let value655: Dynamic =
                                        value654.files?.[0];
                                      value654.remove();
                                      if (!value655) return;
                                      if (!isVideoFile(value655))
                                        return deps.value188(
                                          "Pick a video file to replace a video.",
                                        );
                                      let value656: Dynamic = videoUploadRefusal(value655);
                                      if (value656 !== null)
                                        return deps.value188(
                                          CanvasWorkingStateReplace(
                                            videoUploadFailureMessage(
                                              value656,
                                            ),
                                          ),
                                        );
                                      announce(
                                        "Uploading video",
                                      );
                                      trackEmbeddedWrite(
                                        (async (): Promise<Dynamic> => {
                                          let value657: Dynamic = await probeVideoFile(
                                            value655,
                                          ).catch(
                                            (): Dynamic => "probe_timeout",
                                          );
                                          if (typeof value657 == "string") {
                                            deps.value188(
                                              CanvasWorkingStateReplace(
                                                videoUploadFailureMessage(
                                                  value657,
                                                ),
                                              ),
                                            );
                                            return false;
                                          }
                                          let value658: Dynamic = await uploadDesignVideo(
                                            value655,
                                            value657,
                                          );
                                          if (isEmbedFrozen())
                                            return false;
                                          if ("refused" in value658) {
                                            deps.value188(
                                              CanvasWorkingStateReplace(
                                                value658.refused,
                                              ),
                                            );
                                            return false;
                                          }
                                          let callback15: Dynamic =
                                              (): Dynamic =>
                                                probeEl.file ===
                                                deps.value271.current
                                                  ? undefined
                                                  : deps.value177.current.get(
                                                      probeEl.file,
                                                    ),
                                            value659: Dynamic = callback15();
                                          for (
                                            let index: Dynamic = 0;
                                            !value659 &&
                                            index < 240 &&
                                            !isEmbedFrozen();
                                            index++
                                          ) {
                                            await new Promise(
                                              (input?: Dynamic): Dynamic =>
                                                setTimeout(input, 250),
                                            );
                                            value659 = callback15();
                                          }
                                          if (isEmbedFrozen())
                                            return false;
                                          if (!value659) {
                                            deps.value188(
                                              "The video wasn't replaced: its artboard isn't open for editing. Open it and replace the video again.",
                                            );
                                            return false;
                                          }
                                          let value660: Dynamic =
                                            await value659.replaceVideoFor(
                                              value653,
                                              {
                                                src: value658.src,
                                                width: value657.width,
                                                height: value657.height,
                                              },
                                            );
                                          value660 === "ok"
                                            ? announce(
                                                "Video replaced",
                                              )
                                            : deps.value188(
                                                value660 === "unsure"
                                                  ? "The video wasn't replaced: a copy of it was added or removed meanwhile, so which one you meant can't be told. Select it and replace it again."
                                                  : value660 === "gone"
                                                    ? "The video wasn't replaced: it was changed or removed meanwhile. Select the video and replace it again."
                                                    : "The video wasn't replaced: the new file couldn't be used. Pick another .mp4, .mov or .webm.",
                                              );
                                          return value660 === "ok";
                                        })(),
                                      );
                                    };
                                    value654.click();
                                  }
