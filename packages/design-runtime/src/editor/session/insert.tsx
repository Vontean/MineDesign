import { CanvasWorkingStateHandler } from "../../canvas/working-state";
import { DcTplAttribute } from "../html/authoring";
import { InspectorEditorEvery } from "../inspector/editor";
import { StyleValue } from "../insert/file-drops";
import { arrowDrawingHtml } from "../svg/drawing";
import { attachDeferredTextSink } from "../text/deferred-input";
import { beginDeferredTextInput } from "../text/deferred-input";
import { clampDroppedImagePosition } from "../insert/image-transfer";
import { createDropMarker } from "../insert/file-drops";
import { defaultAnnotationStrokeColor } from "../media/video-playback";
import { defaultLineLength } from "../tools";
import { defaultToolTemplates } from "../tools";
import { dropPickerInsertedTextEdit } from "../picker/bridge";
import { droppedImageWidth } from "../insert/image-transfer";
import { emptyArtboardDropTarget } from "../insert/drop-targets";
import { fileDropPosition } from "../insert/drop-targets";
import { finishDeferredTextInput } from "../text/deferred-input";
import { getDropContainer } from "../model/labels";
import { getPickerFirstTextFont } from "../picker/bridge";
import { hasDeferredTextSink } from "../text/deferred-input";
import { imageHeaderDimensions } from "../../canvas/working-state";
import { insertHtmlIntoModel } from "../insert/targets";
import { insertUploadedFiles } from "../insert/file-drops";
import { inspectPickerSelection } from "../picker/bridge";
import { isDeckStageElement } from "../model/labels";
import { isSvgFile } from "../../canvas/working-state";
import { isVideoFile } from "../media/video-upload";
import { lineDrawingHtml } from "../svg/drawing";
import { lineDrawingInset } from "../svg/drawing";
import { markDropPerformance } from "../../canvas/working-state";
import { normalizeStyleEdits } from "../css/edit-validation";
import { notePickerTextInsert } from "../picker/bridge";
import { pickerHeldTextKey } from "../picker/bridge";
import { previewImageFile } from "../../canvas/working-state";
import { promoteSvgShapeToRoot } from "../selection/element-order";
import { receiveFileDrops } from "../insert/image-transfer";
import { registerHiddenPickerTag } from "../picker/hidden-tags";
import { relocateSingleElementId } from "../model/selection-relocation";
import { rememberImageInsert } from "../insert/image-transfer";
import { replaceSelectedImage } from "../media/image-replacement";
import { rootDropContainer } from "../insert/drop-targets";
import { setPickerSelection } from "../picker/bridge";
import { startPickerInsertedTextEdit } from "../picker/bridge";
import { type Dynamic } from "../../runtime-types";
import { uiMessage } from "@minedesign/contracts/ui-messages";
import { uiOperation } from "@minedesign/contracts/ui-value";
import { uploadDesignFile } from "../../canvas/working-state";
import { videoUploadFailureMessage } from "../media/video-upload";

/** 粘贴或用工具放置内容时运行：把一段 HTML 插入到目标元素之后或画板根部（必要时先把 SVG 图形提升到根部），推送实时模型、标脏并选中新插入的元素。 */
export function insertHtmlAtTarget(deps: { readonly incrementSessionEpoch: Dynamic; readonly markModelDirty: Dynamic; readonly modelRef: Dynamic; readonly pushLiveModel: Dynamic; readonly rootName: Dynamic; readonly value101: Dynamic; readonly value102: Dynamic; readonly value105: Dynamic; readonly value106: Dynamic; readonly value3: Dynamic; readonly value49: Dynamic; readonly value50: Dynamic; readonly value51: Dynamic; readonly value62: Dynamic; readonly value66: Dynamic; readonly value67: Dynamic }, input?: Dynamic,
        options?: Dynamic,
        context?: Dynamic,
        value307: Dynamic = true): Dynamic {
        let value308: Dynamic = deps.modelRef.current.state(deps.rootName);
        if (!value308) return [];
        let current: Dynamic = deps.value49.current,
          value309: Dynamic =
            current && current.name === deps.rootName
              ? current.tids.filter(
                  (input2?: Dynamic): Dynamic =>
                    value308.model.element(input2) != null,
                )
              : [],
          value310: Dynamic =
            value309.length > 0
              ? Math.max(
                  ...value309.map(
                    (input2?: Dynamic): Dynamic =>
                      (0, promoteSvgShapeToRoot)(
                        value308.model,
                        input2,
                      ),
                  ),
                )
              : null,
          value311: Dynamic = context ? context.targetTid : value310,
          value312: Dynamic = context
            ? context.position
            : value310 == null
              ? "root-end"
              : "after",
          redo: Dynamic = value308.redo,
          value313: Dynamic = deps.value101(deps.rootName, options, value308),
          value314: Dynamic = (0, insertHtmlIntoModel)(
            value308,
            input,
            {
              targetTid: value311,
              position: value312,
            },
          );
        if (value314.length === 0) {
          deps.value102(value308, value313, redo);
          return [];
        }
        deps.value66.current = deps.rootName;
        deps.pushLiveModel(deps.rootName, value308);
        deps.markModelDirty(deps.rootName);
        deps.incrementSessionEpoch();
        let value315: Dynamic = deps.value67();
        if (value307) {
          let value316: Dynamic = deps.value106(value308, value314);
          deps.value105(deps.rootName, value314);
          value316 && (deps.value62.current = deps.value50.current);
          let current2: Dynamic = deps.value51.current;
          value315 &&
            setTimeout((): Dynamic => {
              let current3: Dynamic = deps.value49.current;
              ((deps.value51.current === current2 &&
                current2?.seq === deps.value50.current) ||
                (current3?.name === deps.rootName &&
                  (0, InspectorEditorEvery)(
                    current3.tids,
                    value314,
                  ))) &&
                (0, setPickerSelection)(value315, value314, deps.rootName);
            }, 60);
        } else
          deps.value49.current?.name === deps.rootName &&
            (value315 &&
              (0, setPickerSelection)(value315, null, null),
            deps.value50.current++,
            deps.value3(null));
        return value314;
      }

/** 用绘制类工具（文字、形状、线条、箭头、自由绘制）在画板上点击或拖出范围时运行：生成对应的 HTML 插入画板，文字工具会接管延迟输入并进入编辑；放入静态定位容器时把容器改为相对定位，最后切回选择工具。 */
export async function placeToolElementAtPoint(deps: { readonly drawExitGraceUntilRef: Dynamic; readonly filePath: Dynamic; readonly incrementSessionEpoch: Dynamic; readonly markModelDirty: Dynamic; readonly modelRef: Dynamic; readonly pushLiveModel: Dynamic; readonly rootName: Dynamic; readonly sessionAliveRef: Dynamic; readonly setTool: Dynamic; readonly toolRef: Dynamic; readonly value107: Dynamic; readonly value163: Dynamic; readonly value67: Dynamic; readonly value8: Dynamic }, input?: Dynamic,
        options?: Dynamic,
        context?: Dynamic): Promise<Dynamic> {
        let value307: Dynamic =
            deps.toolRef.current === "draw" ||
            Date.now() < deps.drawExitGraceUntilRef.current,
          value308: Dynamic =
            input.path && value307 ? "draw" : (options ?? deps.toolRef.current);
        if (
          value308 === "select" ||
          value308 === "interact" ||
          value308 === "hand"
        )
          return;
        let value309: Dynamic =
            value308 === "arrow"
              ? (0, arrowDrawingHtml)(
                  defaultLineLength,
                  0,
                  1,
                  1,
                  "",
                  defaultAnnotationStrokeColor,
                )
              : defaultToolTemplates[value308],
          value310: Dynamic =
            value308 !== "text"
              ? null
              : options === undefined
                ? (0, beginDeferredTextInput)()
                : (context ?? null);
        if (value308 === "text") {
          if (options === undefined && value310 === null) return;
          let value313: Dynamic = deps.value67(),
            value314: Dynamic = value313
              ? await (0, getPickerFirstTextFont)(value313)
              : null;
          if (!deps.sessionAliveRef.current) {
            value310 !== null &&
              (0, finishDeferredTextInput)("edit", value310);
            return;
          }
          let value315: Dynamic =
            typeof value314 == "string" && value314
              ? (0, normalizeStyleEdits)([
                  ["font-family", value314.replace(/"/g, "'")],
                ])
              : [];
          if (value315.length > 0) {
            let value316: Dynamic = value315[0][1];
            value309 = value309.replace(
              /style="([^"]*)"/,
              (input2?: Dynamic, options2?: Dynamic): Dynamic =>
                `style="${options2}; font-family: ${value316}"`,
            );
          }
        }
        if (value308 === "draw") {
          if (!input.path || !input.rect) {
            input.endTool && deps.setTool("select");
            return;
          }
          let rect: Dynamic = input.rect;
          value309 = `<svg width="${rect.w}" height="${rect.h}" viewBox="0 0 ${rect.w} ${rect.h}" preserveAspectRatio="none" style="position: absolute; left: ${rect.x}px; top: ${rect.y}px; width: ${rect.w}px; height: ${rect.h}px; overflow: visible; fill: none; stroke: ${defaultAnnotationStrokeColor}; stroke-width: 2; stroke-linecap: round; stroke-linejoin: round"><path d="${input.path.d}" vector-effect="non-scaling-stroke"></path></svg>`;
        }
        if ((value308 === "arrow" || value308 === "line") && input.rect) {
          let rect: Dynamic = input.rect,
            value313: Dynamic =
              value308 === "arrow"
                ? arrowDrawingHtml
                : lineDrawingHtml,
            { dx: value314, dy: value315 }: Dynamic = (0,
            lineDrawingInset)(rect.w, rect.h);
          value309 = value313(
            rect.w,
            rect.h,
            input.dir?.x ?? 1,
            input.dir?.y ?? -1,
            `position: absolute; left: ${rect.x - value314}px; top: ${rect.y - value315}px; `,
            defaultAnnotationStrokeColor,
          );
        }
        let value311: Dynamic =
          (input.name ?? deps.rootName) === deps.rootName && input.targetTid != null;
        if (
          input.rect &&
          value308 !== "draw" &&
          value308 !== "arrow" &&
          value308 !== "line"
        ) {
          let rect: Dynamic = input.rect;
          value309 = value309.replace(
            /style="([^"]*)"/,
            (input2?: Dynamic, options2?: Dynamic): Dynamic =>
              `style="${options2}; position: absolute; left: ${rect.x}px; top: ${rect.y}px${rect.w > 0 ? `; width: ${rect.w}px` : ""}${rect.h > 0 ? `; height: ${rect.h}px` : ""}"`,
          );
        }
        if (value308 === "text") {
          let value313: Dynamic = deps.value67();
          value313 && (0, notePickerTextInsert)(value313);
        }
        let value312: Dynamic = deps.value163(
          value309,
          `insert-${value308}-${Date.now()}`,
          value311
            ? {
                targetTid: input.targetTid,
                position: input.position,
              }
            : {
                targetTid: null,
                position: "root-end",
              },
          value308 !== "draw",
        );
        value308 === "draw" &&
          deps.value8(
            `${deps.modelRef.current.state(deps.rootName)?.path ?? deps.filePath}: drew a freehand SVG path \u2014 use the screenshot tool to view it`,
          );
        if (value308 === "text") {
          let value313: Dynamic = deps.value67(),
            value314: Dynamic =
              value313 && value312 && value312.length > 0 && value310 !== null
                ? (0, attachDeferredTextSink)(value310, {
                    key: (input2?: Dynamic): Dynamic =>
                      (0, pickerHeldTextKey)(value313, input2),
                    drop: (input2?: Dynamic): Dynamic => {
                      !input2 &&
                        deps.value107.current === value312[0] &&
                        (deps.value107.current = null);
                      (0, dropPickerInsertedTextEdit)(
                        value313,
                        input2,
                      );
                    },
                  })
                : null;
          !value313 || !value312 || !value314
            ? (value310 !== null &&
                (0, finishDeferredTextInput)("edit", value310),
              value313 &&
                !(0, hasDeferredTextSink)() &&
                (0, dropPickerInsertedTextEdit)(value313, false))
            : ((deps.value107.current = value312[0]),
              (0, startPickerInsertedTextEdit)(
                value313,
                value312[0],
                deps.rootName,
                value314.typed,
                value314.until,
              ));
        }
        if (input.rect && value311 && input.targetTid != null) {
          let value313: Dynamic = deps.modelRef.current.state(deps.rootName);
          if (
            value313 &&
            !value313.model.inlineStyleValue(input.targetTid, "position")
          ) {
            let value314: Dynamic = value313.model.element(input.targetTid),
              value315: Dynamic = deps.value67();
            ((value315
              ? await (0, inspectPickerSelection)(
                  value315,
                  input.targetTid,
                  deps.rootName,
                  ["position"],
                )
              : null
            )?.computed.position ?? "static") === "static" &&
              value313.model.element(input.targetTid) === value314 &&
              (value313.model.setStyleProperty(
                input.targetTid,
                "position",
                "relative",
              ),
              deps.pushLiveModel(deps.rootName, value313),
              deps.markModelDirty(deps.rootName),
              deps.incrementSessionEpoch());
          }
        }
        (value308 !== "draw" || input.endTool) && deps.setTool("select");
      }

/** 粘贴或拖入图片文件后运行：读取图片尺寸，按落点找到可容纳的容器（含幻灯片舞台、空画板），上传并插入图片元素，失败或目标不能放图片时提示。 */
export async function insertImageFilesIntoArtboard(deps: { readonly fileDirectory: Dynamic; readonly incrementSessionEpoch: Dynamic; readonly markModelDirty: Dynamic; readonly modelRef: Dynamic; readonly pendingStampEditsRef: Dynamic; readonly projectPath: Dynamic; readonly pushLiveModel: Dynamic; readonly rootName: Dynamic; readonly showToast: Dynamic; readonly value163: Dynamic; readonly value38: Dynamic; readonly value92: Dynamic }, dataset?: Dynamic,
        items2?: Dynamic,
        context?: Dynamic): Promise<Dynamic> {
        let value307: Dynamic =
            dataset.source === "paste" ? null : deps.value38.shown(),
          value308: Dynamic =
            dataset.source === "paste" ? "pasted" : "dropped",
          value309: Dynamic = items2.map(
            (input?: Dynamic): Dynamic =>
              (0, imageHeaderDimensions)(input),
          ),
          value310: Dynamic = items2.map(
            (input?: Dynamic, options?: Dynamic): Dynamic =>
              ((0, isSvgFile)(input)
                ? (0, previewImageFile)(input)
                : Promise.all([
                    context.sized[options],
                    value309[options],
                  ]).then(
                    ([input2, input3]: Dynamic): Dynamic =>
                      input2
                        ? (0, previewImageFile)(input, {
                            sized: true,
                            head: input3,
                          })
                        : null,
                  )
              ).catch((): Dynamic => null),
          );
        deps.value92.current && (await deps.value92.current);
        let value311: Dynamic =
            (dataset.name ?? deps.rootName) === deps.rootName &&
            dataset.targetTid != null,
          slide: Dynamic = dataset.slide,
          value312: Dynamic = slide?.count,
          value313: Dynamic =
            slide != null &&
            typeof slide == "object" &&
            Number.isInteger(slide.deck) &&
            Number.isInteger(slide.index) &&
            Number.isInteger(value312) &&
            (slide.label == null || typeof slide.label == "string") &&
            (dataset.name ?? deps.rootName) === deps.rootName
              ? {
                  deck: slide.deck,
                  index: slide.index,
                  count: value312,
                  label:
                    typeof slide.label == "string"
                      ? slide.label.slice(0, 256)
                      : null,
                }
              : null,
          point: Dynamic = dataset.point,
          value314: Dynamic =
            point != null &&
            typeof point == "object" &&
            typeof point.x == "number" &&
            Number.isFinite(point.x) &&
            Math.abs(point.x) <= 2e4 &&
            typeof point.y == "number" &&
            Number.isFinite(point.y) &&
            Math.abs(point.y) <= 2e4
              ? {
                  x: point.x,
                  y: point.y,
                  needsPositioning: point.needsPositioning === true,
                }
              : null,
          at: Dynamic = dataset.at,
          callback7: Dynamic = (input?: Dynamic): Dynamic =>
            typeof input == "number" &&
            Number.isFinite(input) &&
            Math.abs(input) <= 2e4
              ? Math.round(input)
              : null,
          value315: Dynamic =
            at != null && typeof at == "object"
              ? [at.x, at.y, at.sx, at.sy, at.w, at.h].map(callback7)
              : [],
          value316: Dynamic =
            value315.length === 6 &&
            value315.every((input?: Dynamic): Dynamic => input != null)
              ? {
                  x: value315[0],
                  y: value315[1],
                  sx: value315[2],
                  sy: value315[3],
                  w: value315[4],
                  h: value315[5],
                }
              : null,
          value317: Dynamic = deps.modelRef.current.state(deps.rootName);
        if (!value317) {
          deps.showToast(
            items2.length > 1
              ? uiMessage("inspector.session.couldNotAddTheValue1", { value1: uiOperation(value308) })
              : uiMessage("inspector.session.couldNotAddTheValue12", { value1: uiOperation(value308) }),
            "error",
          );
          return;
        }
        let value318: Dynamic = value311
            ? (0, relocateSingleElementId)(
                value307,
                value317.model,
                dataset.targetTid,
              )
            : null,
          value319: Dynamic =
            value318 != null ? value317.model.element(value318) : null,
          position: Dynamic = dataset.position,
          callback8: Dynamic = (): Dynamic =>
            value313 == null
              ? null
              : value317.model.resolveSlideAnchor(value313);
        if (value313) {
          let value335: Dynamic = callback8();
          value335 != null &&
            (value319 == null ||
              !(value335 === value319 || value335.contains(value319))) &&
            ((value319 = value335), (position = "into"));
        }
        value319 != null &&
          position !== "into" &&
          value319.parentElement != null &&
          (0, isDeckStageElement)(value319.parentElement) &&
          (position = "into");
        let text2: Dynamic =
            "data:image/svg+xml,%3Csvg%20xmlns=%27http://www.w3.org/2000/svg%27%20width=%27320%27%20height=%27200%27%3E%3Crect%20width=%27100%25%27%20height=%27100%25%27%20fill=%27%23b6b0a7%27/%3E%3C/svg%3E",
          state: Dynamic = {
            width: null,
            height: null,
            [`${StyleValue}width`]: null,
            [`${StyleValue}aspect-ratio`]: null,
          },
          value320: Dynamic = await Promise.all(value309),
          value321: Dynamic = items2.map((): Dynamic => null);
        value310.forEach((input?: Dynamic, options?: Dynamic): Dynamic => {
          input.then((input2?: Dynamic): Dynamic => {
            value321[options] = input2;
          });
        });
        await Promise.resolve();
        let items3: Dynamic = [...value321],
          value322: Dynamic = items3.map(
            (input?: Dynamic): Dynamic =>
              input
                ? {
                    src: (0, createDropMarker)(input.url),
                  }
                : null,
          ),
          marks: Dynamic = context.marks,
          value323: Dynamic = null;
        if (value319 != null) {
          let value335: Dynamic = parseInt(
            value319.getAttribute(DcTplAttribute) ?? "-1",
            10,
          );
          value323 =
            value335 >= 0 && value317.model.element(value335) === value319
              ? value335
              : null;
        }
        if (value323 == null && value313 != null) {
          let value335: Dynamic = callback8();
          if (value335 != null) {
            let value336: Dynamic = parseInt(
              value335.getAttribute(DcTplAttribute) ?? "-1",
              10,
            );
            value336 >= 0 &&
              value317.model.element(value336) === value335 &&
              ((value323 = value336), (position = "into"));
          }
        }
        let value324: Dynamic =
            value323 != null
              ? (0, getDropContainer)(
                  value317.model.element(value323),
                  position,
                )
              : null,
          value325: Dynamic =
            value314 != null && value324 != null ? value314 : null,
          value326: Dynamic =
            value325 == null && value313 == null && value316 != null
              ? (0, emptyArtboardDropTarget)(value317.model)
              : null,
          value327: Dynamic =
            value326 != null && value323 != null && value323 !== value326.page
              ? (0, rootDropContainer)(
                  value317.model,
                  value326,
                  value323,
                )
              : null,
          value328: Dynamic =
            value326 != null &&
            (value327 == null ||
              !value327.takesFiles ||
              (value327.top === value323 && position !== "into"))
              ? value316
              : null;
        value325?.needsPositioning &&
          value323 != null &&
          !value317.model.inlineStyleValue(value323, "position") &&
          value317.model.setStyleProperty(value323, "position", "relative");
        let callback9: Dynamic = (input?: Dynamic): Dynamic =>
            value324
              ? (0, droppedImageWidth)(input, value324.w, value324.h)
              : value328
                ? Math.round(
                    Math.min(input.width, Math.max(48, value328.w * 0.6)),
                  )
                : input.width,
          value329: Dynamic =
            value325 == null || value324 == null
              ? null
              : (
                  input?: Dynamic,
                  options?: Dynamic,
                  context2?: Dynamic,
                ): Dynamic =>
                  (0, clampDroppedImagePosition)(
                    value325.x - options / 2 + input * 24,
                    value325.y - context2 / 2 + input * 24,
                    options,
                    context2,
                    value324.w,
                    value324.h,
                  ),
          value330: Dynamic =
            value329 ??
            (value328 == null
              ? null
              : (
                  input?: Dynamic,
                  options?: Dynamic,
                  context2?: Dynamic,
                ): Dynamic =>
                  (0, fileDropPosition)(
                    value328,
                    input,
                    options,
                    context2,
                  ));
        value316 != null &&
          items2.forEach((input?: Dynamic, options?: Dynamic): Dynamic => {
            let value335: Dynamic = items3[options] ?? value320[options],
              value336: Dynamic = value335
                ? value328
                  ? callback9(value335)
                  : Math.round(
                      Math.min(
                        value335.width,
                        Math.max(48, value316.w * 0.5),
                      ),
                    )
                : 320,
              value337: Dynamic = value335
                ? Math.max(
                    1,
                    Math.round((value336 * value335.height) / value335.width),
                  )
                : 200,
              { left: value338, top: value339 }: Dynamic = value328
                ? (0, fileDropPosition)(
                    value328,
                    options,
                    value336,
                    value337,
                  )
                : {
                    left:
                      value316.x + value316.sx - value336 / 2 + options * 24,
                    top:
                      value316.y + value316.sy - value337 / 2 + options * 24,
                  };
            context.place(options, {
              x: Math.round(value338 - value316.sx),
              y: Math.round(value339 - value316.sy),
              w: value336,
              h: value337,
            });
          });
        let value331: Dynamic = items2.map(
            (input?: Dynamic, options?: Dynamic): Dynamic => {
              let value335: Dynamic = items3[options] ?? value320[options],
                value336: Dynamic = value335 ? callback9(value335) : null,
                value337: Dynamic =
                  value335 && value336 != null
                    ? `; width: ${value336}px; aspect-ratio: ${value335.width} / ${value335.height}`
                    : "",
                value338: Dynamic =
                  value335 && value336 != null
                    ? ` width="${value336}" height="${Math.max(1, Math.round((value336 * value335.height) / value335.width))}"`
                    : "",
                value339: Dynamic = value322[options]?.src ?? text2,
                value340: Dynamic = value322[options]
                  ? " background-color: #b6b0a7;"
                  : "",
                value341: Dynamic =
                  value324 != null ? " position: relative; z-index: 1;" : "";
              if (value330) {
                let value342: Dynamic = value336 ?? 320,
                  value343: Dynamic =
                    value335 && value336 != null
                      ? Math.max(
                          1,
                          Math.round(
                            (value336 * value335.height) / value335.width,
                          ),
                        )
                      : 200,
                  { left: value344, top: value345 }: Dynamic = value330(
                    options,
                    value342,
                    value343,
                  );
                value341 = ` position: absolute; left: ${value344}px; top: ${value345}px;${value329 ? " z-index: 1;" : ""}`;
              }
              return `<img src="${value339}" alt="" data-dc-drop="${marks[options]}"${value338} style="max-width: 100%; height: auto; display: block;${value340}${value341} object-fit: cover${value337}">`;
            },
          ).join(`
`),
            value332: Dynamic = (
            deps.value163(
              value331,
              `image-drop-${Date.now()}`,
              value328 && value326
                ? value326.placement
                : value323 != null
                  ? {
                      targetTid: value323,
                      position: position,
                    }
                  : {
                      targetTid: null,
                      position: "root-end",
                    },
            ) ?? []
          ).map((input?: Dynamic): Dynamic => value317.model.element(input));
        if (value332.every((input?: Dynamic): Dynamic => input == null)) {
          deps.showToast(
            uiMessage("inspector.session.targetCannotHoldImagesValue1", { value1: uiOperation(value308 === "pasted" ? "select" : "drop onto") }),
            "error",
          );
          return;
        }
        let callback10: Dynamic = (): Dynamic =>
          deps.modelRef.current.state(deps.rootName) ?? value317;
        (0, markDropPerformance)("insert");
        let value333: Dynamic = marks.map(registerHiddenPickerTag);
        context.landed();
        let value334: Dynamic = await (0, insertUploadedFiles)({
          files: items2,
          targets: value332,
          upload: (input?: Dynamic): Dynamic =>
            (0, uploadDesignFile)(deps.projectPath, deps.fileDirectory, input),
          preview: (input?: Dynamic): Dynamic =>
            value310[items2.indexOf(input)] ??
            (0, previewImageFile)(input),
          preApplied: value322,
          patch: (element?: Dynamic, options?: Dynamic): Dynamic => {
            let value335: Dynamic = callback10(),
              value336: Dynamic = parseInt(
                element.getAttribute(DcTplAttribute) ?? "-1",
                10,
              );
            if (value336 < 0 || value335.model.element(value336) !== element)
              return false;
            for (let [value337, value338] of Object.entries(
              options,
            ) as Dynamic)
              value337.startsWith(StyleValue)
                ? value335.model.setStyleProperty(
                    value336,
                    value337.slice(StyleValue.length),
                    value338,
                  )
                : value335.model.setAttribute(value336, value337, value338);
            deps.pushLiveModel(deps.rootName, value335);
            deps.markModelDirty(deps.rootName);
            deps.incrementSessionEpoch();
            return true;
          },
          relocate: (input?: Dynamic): Dynamic =>
            callback10().model.elementsByAttr("src", input)[0] ?? null,
          relocateByMarker: (input?: Dynamic): Dynamic =>
            callback10().model.elementsByAttr(
              "data-dc-drop",
              marks[input],
            )[0] ?? null,
          markerCleanupAttrs: (): Dynamic => ({
            "data-dc-drop": null,
            [`${StyleValue}background-color`]: null,
          }),
          readSrc: (element?: Dynamic): Dynamic =>
            element.getAttribute("src"),
          onStage: (input?: Dynamic): Dynamic => {
            (0, markDropPerformance)(input);
          },
          onSettled: (input?: Dynamic, options?: Dynamic): Dynamic =>
            (0, rememberImageInsert)(deps.pendingStampEditsRef.current, {
              name: deps.rootName,
              src: input,
              attrs: options,
            }),
          previewAttrs: (input?: Dynamic, options?: Dynamic): Dynamic => {
            let value335: Dynamic = callback9(input),
              value336: Dynamic = Math.max(
                1,
                Math.round((value335 * input.height) / input.width),
              ),
              state2: Dynamic = {
                width: String(value335),
                height: String(value336),
                [`${StyleValue}width`]: `${value335}px`,
                [`${StyleValue}aspect-ratio`]: `${input.width} / ${input.height}`,
              };
            if (value330) {
              let { left: value337, top: value338 }: Dynamic = value330(
                options,
                value335,
                value336,
              );
              state2[`${StyleValue}left`] = `${value337}px`;
              state2[`${StyleValue}top`] = `${value338}px`;
            }
            return state2;
          },
          yieldCleanupAttrs: (input?: Dynamic): Dynamic =>
            value330
              ? {
                  width: null,
                  height: null,
                  [`${StyleValue}aspect-ratio`]: null,
                }
              : state,
          revertAttrs: (input?: Dynamic): Dynamic => {
            if (!value330) return state;
            let { left: value335, top: value336 }: Dynamic = value330(
              input,
              320,
              200,
            );
            return {
              ...state,
              [`${StyleValue}left`]: `${value335}px`,
              [`${StyleValue}top`]: `${value336}px`,
            };
          },
          insertPinned: (input?: Dynamic): Dynamic =>
            (items3[input] ?? value320[input]) != null,
          placeholderSrc: text2,
        }).finally((): Dynamic => {
          for (let value335 of value333 as Dynamic) value335();
        });
        value334 > 0 &&
          deps.showToast(
            items2.length > 1
              ? uiMessage("inspector.session.couldNotAddValue1Of", { value1: String(value334), value2: String(items2.length), value3: uiOperation(value308) })
              : uiMessage("inspector.session.couldNotAddTheValue12", { value1: uiOperation(value308) }),
            "error",
          );
        return value334 === 0;
      }

/** 文件拖入或粘贴到画板时运行：筛出图片与视频，视频交给视频上传流程，其余文件提示不支持，图片交给插图流程并在结束后清理拖放状态。 */
export async function routeDroppedMediaFiles(deps: { readonly filePath: Dynamic; readonly modelRef: Dynamic; readonly onDropVideos: Dynamic; readonly rootName: Dynamic; readonly showToast: Dynamic; readonly value179: Dynamic; readonly value180: Dynamic; readonly webviewRef: Dynamic }, dataset?: Dynamic): Promise<Dynamic> {
        let value307: Dynamic = (dataset.files ?? []).filter(
            (input?: Dynamic): Dynamic => input instanceof File,
          ),
          value308: Dynamic = value307
            .filter(
              (input?: Dynamic): Dynamic => input.type.startsWith("image/"),
            )
            .slice(0, 6),
          value309: Dynamic = value307.filter(isVideoFile),
          value310: Dynamic =
            dataset.source === "paste" ? "pasted" : "dropped",
          at: Dynamic = dataset.at,
          callback7: Dynamic = (input?: Dynamic): Dynamic =>
            typeof input == "number" &&
            Number.isFinite(input) &&
            Math.abs(input) <= 2e4,
          value311: Dynamic =
            at != null &&
            typeof at == "object" &&
            callback7(at.x) &&
            callback7(at.y) &&
            callback7(at.sx) &&
            callback7(at.sy) &&
            callback7(at.w) &&
            callback7(at.h)
              ? {
                  x: Math.round(at.x),
                  y: Math.round(at.y),
                  sx: Math.round(at.sx),
                  sy: Math.round(at.sy),
                  w: Math.round(at.w),
                  h: Math.round(at.h),
                }
              : null;
        value309.length > 0
          ? dataset.slide != null ||
            deps.modelRef.current.state(deps.rootName)?.model.findDeckStage() != null ||
            deps.webviewRef.current?.contentDocument?.querySelector(
              "deck-stage",
            ) != null
            ? deps.showToast((0, CanvasWorkingStateHandler)("artboard"))
            : deps.onDropVideos
              ? deps.onDropVideos(value309, {
                  at: value311,
                  verb: value310,
                  after: value308.length,
                })
              : deps.showToast(
                  (0, videoUploadFailureMessage)("unavailable"),
                )
          : value308.length === 0 &&
            Date.now() - deps.value180.current > 5e3 &&
            ((deps.value180.current = Date.now()),
            deps.showToast(
              dataset.refuse === true
                ? uiMessage("inspector.session.filesCanTBeDropped")
                : uiMessage("inspector.session.onlyImagesAndMp4Mov", { value1: uiOperation(value310) }),
            ));
        if (value308.length === 0) return;
        let value312: Dynamic = (0, receiveFileDrops)(
          value308,
          deps.filePath,
          at != null &&
            typeof at == "object" &&
            callback7(at.x) &&
            callback7(at.y)
            ? {
                x: at.x,
                y: at.y,
              }
            : null,
        );
        try {
          return await deps.value179(dataset, value308, value312);
        } finally {
          value312.end();
        }
      }

/** 替换选中图片时运行：把用户选择的文件上传到作品目录，多选时统一改 src，单选时替换图片并记录撤销、推送实时模型；上传失败时提示。 */
export async function uploadReplacementImage(deps: { readonly fileDirectory: Dynamic; readonly incrementSessionEpoch: Dynamic; readonly markModelDirty: Dynamic; readonly modelRef: Dynamic; readonly onHistoryDrop: Dynamic; readonly pendingStampEditsRef: Dynamic; readonly projectPath: Dynamic; readonly pushLiveModel: Dynamic; readonly readOnlyRef: Dynamic; readonly rootName: Dynamic; readonly showToast: Dynamic; readonly value101: Dynamic; readonly value151: Dynamic; readonly value183: Dynamic; readonly value49: Dynamic; readonly value65: Dynamic; readonly value66: Dynamic; readonly value8: Dynamic }, input?: Dynamic): Promise<Dynamic> {
        let current: Dynamic = deps.value49.current;
        if (!current || deps.readOnlyRef.current || current.name !== deps.rootName)
          return;
        let value307: Dynamic = deps.modelRef.current.state(current.name);
        if (!value307) return;
        let callback7: Dynamic = (): Dynamic =>
            deps.modelRef.current.state(current.name) ?? value307,
          value308: Dynamic = current.tids.filter(
            (input2?: Dynamic): Dynamic =>
              value307.model.element(input2) != null,
          );
        if (value308.length === 0) return;
        if (value308.length > 1) {
          try {
            let { src: value318 }: Dynamic = await (0,
            uploadDesignFile)(deps.projectPath, deps.fileDirectory, input);
            deps.value151("@src", value318);
          } catch (value318: Dynamic) {
            console.error("[dc-editor] image pick upload failed:", value318);
            deps.showToast(uiMessage("inspector.session.couldNotUploadTheImage"), "error");
            return false;
          }
          return;
        }
        let value309: Dynamic = value308[0],
          value310: Dynamic = value307.model.element(value309);
        if (value310 == null) return;
        let value311: Dynamic = (deps.value183.current.get(value310) ?? 0) + 1;
        deps.value183.current.set(value310, value311);
        let value312: Dynamic = `src-pick-${Date.now()}`,
          value313: Dynamic = null,
          {
            failed: value314,
            relName: value315,
            src: value316,
            applied: value317,
          }: Dynamic = await (0, replaceSelectedImage)({
            file: input,
            el: value310,
            getModel: (): Dynamic => callback7().model,
            isCurrent: (): Dynamic =>
              deps.value183.current.get(value310) === value311,
            upload: (input2?: Dynamic): Dynamic =>
              (0, uploadDesignFile)(
                deps.projectPath,
                deps.fileDirectory,
                input2,
              ),
            pushUndo: (): Dynamic => {
              let value318: Dynamic = callback7();
              value313 = value318.redo.slice();
              deps.value101(current.name, value312, value318);
            },
            afterPatch: (): Dynamic => {
              deps.value66.current = current.name;
              deps.pushLiveModel(current.name, callback7());
              deps.markModelDirty(current.name);
              deps.incrementSessionEpoch();
            },
            recordSettled: (input2?: Dynamic): Dynamic =>
              (0, rememberImageInsert)(deps.pendingStampEditsRef.current, {
                name: current.name,
                ...input2,
              }),
          });
        if (value314) {
          let current2: Dynamic = deps.value65.current,
            value318: Dynamic = callback7();
          current2 &&
            current2.name === current.name &&
            current2.key === value312 &&
            value313 != null &&
            value318.undo.length > 0 &&
            (value318.undo.pop(),
            (value318.redo = value313),
            deps.onHistoryDrop?.("undo"),
            (deps.value65.current = null));
          return deps.value183.current.get(value310) === value311
            ? (deps.showToast(uiMessage("inspector.session.couldNotUploadTheImage"), "error"), false)
            : undefined;
        } else
          value315 != null &&
            value317 &&
            deps.value8(
              `${value307.path}: set @src=${value316 ?? "./" + value315} on img`,
              `${value307.path}:@src:${value309}`,
            );
      }
