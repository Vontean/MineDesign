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
      let textCount: Dynamic = 0,
        shapeCount: Dynamic = 0,
        boxCount: Dynamic = 0,
        imageCount: Dynamic = 0,
        otherCount: Dynamic = 0,
        lineCount: Dynamic = 0,
        moreStyles: Dynamic = {},
        primaryTag: Dynamic = "",
        imageSrc: Dynamic = null,
        linkHref: Dynamic = null,
        fontSizes: Dynamic = [],
        listKind: Dynamic = "none",
        styleProperties: Dynamic = [
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
        primaryTextRef: Dynamic = null,
        isPrimaryEditable: Dynamic = false,
        primaryElement: Dynamic = null,
        textColor: Dynamic = null,
        fontSize: Dynamic = null,
        fontFamily: Dynamic = null,
        background: Dynamic = null,
        stroke: Dynamic = null,
        pageFonts: Dynamic = [];
      for (let [file, selectedEntry] of deps.selection.elements as Dynamic) {
        let entry: Dynamic = deps.value177.current.get(file),
          describedNodes: Dynamic = entry?.describeTids(selectedEntry.tids) ?? [],
          isPrimaryFile: Dynamic = file === deps.selection.primary,
          fileSource: Dynamic = deps.value19(file);
        for (let node of describedNodes as Dynamic) {
          if (
            isPrimaryFile &&
            primaryElement == null &&
            ((primaryElement = {
              file: file,
              tid: node.tid,
              kind: node.kind,
            }),
            (primaryTag = node.tag),
            entry)
          ) {
            for (let styleProperty of styleProperties as Dynamic) {
              let styleValue: Dynamic = entry.readInlineStyle(
                fileSource,
                node.tid,
                styleProperty,
              );
              styleValue && (moreStyles[styleProperty] = styleValue);
            }
            node.kind === "image" &&
              (imageSrc =
                entry.readAttrs(fileSource, node.tid)?.src ?? null);
            node.tag === "a" &&
              (linkHref =
                entry.readAttrs(fileSource, node.tid)?.href ?? null);
            listKind = entry.listKindOf(node.tid);
          }
          node.kind === "box"
            ? boxCount++
            : node.kind === "image"
              ? imageCount++
              : node.kind === "other" && otherCount++;
          node.kind === "text" &&
            (textCount++,
            entry &&
              fontSizes.length < 64 &&
              fontSizes.push(
                entry.readInlineStyle(fileSource, node.tid, "font-size") ||
                  null,
              ),
            isPrimaryFile &&
              primaryTextRef == null &&
              ((primaryTextRef = {
                file: file,
                tid: node.tid,
              }),
              (isPrimaryEditable = node.editable)),
            isPrimaryFile &&
              entry &&
              textColor == null &&
              fontSize == null &&
              ((textColor =
                entry.readInlineStyle(fileSource, node.tid, "color") ||
                null),
              (fontSize =
                entry.readInlineStyle(fileSource, node.tid, "font-size") ||
                null),
              (fontFamily =
                entry.readInlineStyle(
                  fileSource,
                  node.tid,
                  "font-family",
                ) || null)),
            isPrimaryFile &&
              entry &&
              background == null &&
              (background =
                entry.readInlineStyle(
                  fileSource,
                  node.tid,
                  "background-color",
                ) || null));
          if (node.kind === "shape" || node.kind === "box") {
            node.kind === "shape" && shapeCount++;
            let nonNoneOrNull: Dynamic = (paintValue?: Dynamic): Dynamic =>
                paintValue && paintValue !== "none" ? paintValue : null,
              nodeAttrs: Dynamic =
                isPrimaryFile && entry
                  ? entry.readAttrs(fileSource, node.tid)
                  : null;
            isPrimaryFile &&
              entry &&
              background == null &&
              (background =
                nonNoneOrNull(
                  entry.readInlineStyle(
                    fileSource,
                    node.tid,
                    "background-color",
                  ),
                ) ||
                nonNoneOrNull(
                  entry.readInlineStyle(fileSource, node.tid, "fill"),
                ) ||
                nonNoneOrNull(nodeAttrs?.fill) ||
                null);
            isPrimaryFile &&
              entry &&
              stroke == null &&
              (stroke =
                nonNoneOrNull(
                  entry.readInlineStyle(fileSource, node.tid, "stroke"),
                ) ||
                nonNoneOrNull(
                  entry.readInlineStyle(
                    fileSource,
                    node.tid,
                    "border-color",
                  ),
                ) ||
                nonNoneOrNull(nodeAttrs?.stroke) ||
                null);
          } else
            node.kind === "line" &&
              (lineCount++,
              isPrimaryFile &&
                entry &&
                stroke == null &&
                (stroke =
                  entry.readInlineStyle(fileSource, node.tid, "stroke") ||
                  entry.readInlineStyle(
                    fileSource,
                    node.tid,
                    "border-color",
                  ) ||
                  null));
        }
        isPrimaryFile && entry && (pageFonts = entry.pageFonts());
      }
      let fontsByLowercase: Dynamic = new Map(),
        addFontName: Dynamic = (fontName?: Dynamic): Dynamic => {
          let lowerName: Dynamic = fontName.toLowerCase();
          fontsByLowercase.has(lowerName) || fontsByLowercase.set(lowerName, fontName);
        };
      for (let pageFont of pageFonts as Dynamic) addFontName(pageFont);
      let sizes: Dynamic = new Set(),
        webfonts: Dynamic = new Set(),
        colorCounts: Dynamic = new Map(),
        selectionColorCounts: Dynamic = new Map(),
        sizeRoles: Dynamic = {},
        sizeFamilies: Dynamic = {};
      for (let [censusFile, censusEntry] of deps.value177.current as Dynamic) {
        let census: Dynamic = censusEntry.pageCensus();
        for (let font of census.fonts as Dynamic) addFontName(font);
        for (let webfont of census.webfonts as Dynamic)
          webfonts.add(webfont);
        for (let size of census.sizes as Dynamic) sizes.add(size);
        for (let [color, colorCount] of census.colors as Dynamic)
          colorCounts.set(color, (colorCounts.get(color) ?? 0) + colorCount);
        if (deps.selection.elements.has(censusFile))
          for (let [color, colorCount] of census.colors as Dynamic)
            selectionColorCounts.set(color, (selectionColorCounts.get(color) ?? 0) + colorCount);
        for (let [role, roleSizes] of census.roles as Dynamic)
          for (let [sizeKey, sizeCount] of roleSizes as Dynamic)
            (sizeRoles[role] ??= {})[sizeKey] =
              (sizeRoles[role]?.[sizeKey] ?? 0) + sizeCount;
        for (let [family, familyValue] of census.families as Dynamic)
          sizeFamilies[family] ??= familyValue;
      }
      let topKeys: Dynamic = (
          counts?: Dynamic,
          limit?: Dynamic,
        ): Dynamic =>
          [...counts]
            .sort(
              (entryA?: Dynamic, entryB?: Dynamic): Dynamic =>
                entryB[1] - entryA[1],
            )
            .slice(0, limit)
            .map(([key]: Dynamic): Dynamic => key),
        topColors: Dynamic = topKeys(colorCounts, 12),
        topSelectionColors: Dynamic = topKeys(
          selectionColorCounts,
          canvasSelectionChromeInsetPixels,
        );
      topSelectionColors.join(`
`) !==
        deps.value242.current.join(`
`) && (deps.value242.current = topSelectionColors);
      let fontNames: Dynamic = new Set(fontsByLowercase.values());
      return {
        text: textCount,
        shape: shapeCount,
        box: boxCount,
        image: imageCount,
        other: otherCount,
        line: lineCount,
        primaryTag: primaryTag,
        primaryText: primaryTextRef,
        primaryEditable: isPrimaryEditable,
        probeEl: primaryTextRef
          ? {
              ...primaryTextRef,
              kind: "text",
            }
          : primaryElement,
        seed: {
          epoch: deps.value232,
          color: textColor,
          fontSize: fontSize,
          fontFamily: fontFamily,
          background: background,
          stroke: stroke,
          more: moreStyles,
          imageSrc: imageSrc,
          href: linkHref,
          list: listKind,
          fontSizes: fontSizes,
          fonts: [...fontNames],
          webfonts: [...webfonts],
          sizes: [...sizes],
          sizeRoles: sizeRoles,
          sizeFamilies: sizeFamilies,
          colors: topColors,
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
                                    let documentIdentity: Dynamic = deps.value63?.identity,
                                      fileInput: Dynamic = (
                                        document as Dynamic
                                      ).createElement("input");
                                    fileInput.type = "file";
                                    fileInput.accept = "image/*";
                                    fileInput.hidden = true;
                                    (document as Dynamic).body.appendChild(
                                      fileInput,
                                    );
                                    fileInput.addEventListener(
                                      "cancel",
                                      (): Dynamic => fileInput.remove(),
                                    );
                                    fileInput.onchange = (): Dynamic => {
                                      let pickedFile: Dynamic =
                                        fileInput.files?.[0];
                                      fileInput.remove();
                                      pickedFile &&
                                        trackEmbeddedWrite(
                                          uploadDesignFile(
                                            "appifact",
                                            null,
                                            pickedFile,
                                          ).then(
                                            ({
                                              src: src,
                                            }: Dynamic): Dynamic =>
                                              isEmbedFrozen() ||
                                              deps.value64.current?.identity !==
                                                documentIdentity
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
                                            (placed?: Dynamic): Dynamic => {
                                              placed === false &&
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
                                    fileInput.click();
                                  }

/** 属性面板点击替换视频时运行：打开文件选择框，校验与探测视频、上传后替换选中视频元素，并播报结果。 */
export function pickReplacementVideo(deps: { readonly value177: Dynamic; readonly value188: Dynamic; readonly value244: Dynamic; readonly value271: Dynamic }): Dynamic {
                                    let probeEl: Dynamic = deps.value244.probeEl;
                                    if (!probeEl) return;
                                    let videoKey: Dynamic =
                                      deps.value177.current
                                        .get(probeEl.file)
                                        ?.videoKey(probeEl.tid) ?? null;
                                    if (videoKey === null)
                                      return deps.value188(
                                        "This video can't be replaced: it has no file of its own.",
                                      );
                                    if (videoKey.src.includes("{{"))
                                      return deps.value188(
                                        "This video's file comes from the design's data, so it can't be replaced here.",
                                      );
                                    let fileInput: Dynamic = (
                                      document as Dynamic
                                    ).createElement("input");
                                    fileInput.type = "file";
                                    fileInput.accept =
                                      VideoMp4VideoWebmVideoQuicktimeMovValue;
                                    fileInput.hidden = true;
                                    (document as Dynamic).body.appendChild(
                                      fileInput,
                                    );
                                    fileInput.addEventListener(
                                      "cancel",
                                      (): Dynamic => fileInput.remove(),
                                    );
                                    fileInput.onchange = (): Dynamic => {
                                      let pickedFile: Dynamic =
                                        fileInput.files?.[0];
                                      fileInput.remove();
                                      if (!pickedFile) return;
                                      if (!isVideoFile(pickedFile))
                                        return deps.value188(
                                          "Pick a video file to replace a video.",
                                        );
                                      let refusal: Dynamic = videoUploadRefusal(pickedFile);
                                      if (refusal !== null)
                                        return deps.value188(
                                          CanvasWorkingStateReplace(
                                            videoUploadFailureMessage(
                                              refusal,
                                            ),
                                          ),
                                        );
                                      announce(
                                        "Uploading video",
                                      );
                                      trackEmbeddedWrite(
                                        (async (): Promise<Dynamic> => {
                                          let probe: Dynamic = await probeVideoFile(
                                            pickedFile,
                                          ).catch(
                                            (): Dynamic => "probe_timeout",
                                          );
                                          if (typeof probe == "string") {
                                            deps.value188(
                                              CanvasWorkingStateReplace(
                                                videoUploadFailureMessage(
                                                  probe,
                                                ),
                                              ),
                                            );
                                            return false;
                                          }
                                          let upload: Dynamic = await uploadDesignVideo(
                                            pickedFile,
                                            probe,
                                          );
                                          if (isEmbedFrozen())
                                            return false;
                                          if ("refused" in upload) {
                                            deps.value188(
                                              CanvasWorkingStateReplace(
                                                upload.refused,
                                              ),
                                            );
                                            return false;
                                          }
                                          let getFrameEntry: Dynamic =
                                              (): Dynamic =>
                                                probeEl.file ===
                                                deps.value271.current
                                                  ? undefined
                                                  : deps.value177.current.get(
                                                      probeEl.file,
                                                    ),
                                            frameEntry: Dynamic = getFrameEntry();
                                          for (
                                            let index: Dynamic = 0;
                                            !frameEntry &&
                                            index < 240 &&
                                            !isEmbedFrozen();
                                            index++
                                          ) {
                                            await new Promise(
                                              (resolve?: Dynamic): Dynamic =>
                                                setTimeout(resolve, 250),
                                            );
                                            frameEntry = getFrameEntry();
                                          }
                                          if (isEmbedFrozen())
                                            return false;
                                          if (!frameEntry) {
                                            deps.value188(
                                              "The video wasn't replaced: its artboard isn't open for editing. Open it and replace the video again.",
                                            );
                                            return false;
                                          }
                                          let replaceResult: Dynamic =
                                            await frameEntry.replaceVideoFor(
                                              videoKey,
                                              {
                                                src: upload.src,
                                                width: probe.width,
                                                height: probe.height,
                                              },
                                            );
                                          replaceResult === "ok"
                                            ? announce(
                                                "Video replaced",
                                              )
                                            : deps.value188(
                                                replaceResult === "unsure"
                                                  ? "The video wasn't replaced: a copy of it was added or removed meanwhile, so which one you meant can't be told. Select it and replace it again."
                                                  : replaceResult === "gone"
                                                    ? "The video wasn't replaced: it was changed or removed meanwhile. Select the video and replace it again."
                                                    : "The video wasn't replaced: the new file couldn't be used. Pick another .mp4, .mov or .webm.",
                                              );
                                          return replaceResult === "ok";
                                        })(),
                                      );
                                    };
                                    fileInput.click();
                                  }
