import { CanvasWorkingStateHandler } from "../../canvas/working-state";
import { DcTplAttribute } from "../html/authoring";
import { sameTidList } from "../inspector/editor";
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

interface InsertHtmlAtTargetDependencies {
  readonly incrementSessionEpoch: Dynamic;
  readonly markModelDirty: Dynamic;
  readonly modelRef: Dynamic;
  readonly pushLiveModel: Dynamic;
  readonly rootName: Dynamic;
  readonly pushUndoEdit: Dynamic;
  readonly revokeUndoEdit: Dynamic;
  readonly selectElements: Dynamic;
  readonly retargetSelection: Dynamic;
  readonly setSelection: Dynamic;
  readonly selectionRef: Dynamic;
  readonly selectionSequenceRef: Dynamic;
  readonly pendingSelectionRef: Dynamic;
  readonly notePendingHighlight: Dynamic;
  readonly advanceSelectionSequence: Dynamic;
  readonly lastEditedTemplateRef: Dynamic;
  readonly getPreviewFrame: Dynamic;
}

/** 粘贴或用工具放置内容时运行：把一段 HTML 插入到目标元素之后或画板根部（必要时先把 SVG 图形提升到根部），推送实时模型、标脏并选中新插入的元素。 */
export function insertHtmlAtTarget(deps: InsertHtmlAtTargetDependencies, html?: Dynamic,
        undoLabel?: Dynamic,
        placement?: Dynamic,
        shouldSelect: Dynamic = true): Dynamic {
        let docState: Dynamic = deps.modelRef.current.state(deps.rootName);
        if (!docState) return [];
        let current: Dynamic = deps.selectionRef.current,
          selectedTids: Dynamic =
            current && current.name === deps.rootName
              ? current.tids.filter(
                  (tid?: Dynamic): Dynamic =>
                    docState.model.element(tid) != null,
                )
              : [],
          anchorTid: Dynamic =
            selectedTids.length > 0
              ? Math.max(
                  ...selectedTids.map(
                    (tid?: Dynamic): Dynamic =>
                      promoteSvgShapeToRoot(
                        docState.model,
                        tid,
                      ),
                  ),
                )
              : null,
          targetTid: Dynamic = placement ? placement.targetTid : anchorTid,
          position: Dynamic = placement
            ? placement.position
            : anchorTid == null
              ? "root-end"
              : "after",
          redo: Dynamic = docState.redo,
          undoEntry: Dynamic = deps.pushUndoEdit(deps.rootName, undoLabel, docState),
          insertedTids: Dynamic = insertHtmlIntoModel(
            docState,
            html,
            {
              targetTid: targetTid,
              position: position,
            },
          );
        if (insertedTids.length === 0) {
          deps.revokeUndoEdit(docState, undoEntry, redo);
          return [];
        }
        deps.lastEditedTemplateRef.current = deps.rootName;
        deps.pushLiveModel(deps.rootName, docState);
        deps.markModelDirty(deps.rootName);
        deps.incrementSessionEpoch();
        let previewFrame: Dynamic = deps.getPreviewFrame();
        if (shouldSelect) {
          let selectionSyncFlag: Dynamic = deps.retargetSelection(docState, insertedTids);
          deps.selectElements(deps.rootName, insertedTids);
          selectionSyncFlag && deps.notePendingHighlight();
          let selectionAtInsert: Dynamic = deps.pendingSelectionRef.current;
          previewFrame &&
            setTimeout((): Dynamic => {
              let currentSelection: Dynamic = deps.selectionRef.current;
              ((deps.pendingSelectionRef.current === selectionAtInsert &&
                selectionAtInsert?.seq === deps.selectionSequenceRef.current) ||
                (currentSelection?.name === deps.rootName &&
                  sameTidList(
                    currentSelection.tids,
                    insertedTids,
                  ))) &&
                setPickerSelection(previewFrame, insertedTids, deps.rootName);
            }, 60);
        } else
          deps.selectionRef.current?.name === deps.rootName &&
            (previewFrame &&
              setPickerSelection(previewFrame, null, null),
            deps.advanceSelectionSequence(),
            deps.setSelection(null));
        return insertedTids;
      }

interface PlaceToolElementAtPointDependencies {
  readonly drawExitGraceUntilRef: Dynamic;
  readonly filePath: Dynamic;
  readonly incrementSessionEpoch: Dynamic;
  readonly markModelDirty: Dynamic;
  readonly modelRef: Dynamic;
  readonly pushLiveModel: Dynamic;
  readonly rootName: Dynamic;
  readonly sessionAliveRef: Dynamic;
  readonly setTool: Dynamic;
  readonly toolRef: Dynamic;
  readonly pendingTextTargetTidRef: Dynamic;
  readonly insertHtml: Dynamic;
  readonly getPreviewFrame: Dynamic;
  readonly cacheFeedbackLabel: Dynamic;
}

/** 用绘制类工具（文字、形状、线条、箭头、自由绘制）在画板上点击或拖出范围时运行：生成对应的 HTML 插入画板，文字工具会接管延迟输入并进入编辑；放入静态定位容器时把容器改为相对定位，最后切回选择工具。 */
export async function placeToolElementAtPoint(deps: PlaceToolElementAtPointDependencies, placement?: Dynamic,
        toolOverride?: Dynamic,
        providedTextInput?: Dynamic): Promise<Dynamic> {
        let isDrawActive: Dynamic =
            deps.toolRef.current === "draw" ||
            Date.now() < deps.drawExitGraceUntilRef.current,
          tool: Dynamic =
            placement.path && isDrawActive ? "draw" : (toolOverride ?? deps.toolRef.current);
        if (
          tool === "select" ||
          tool === "interact" ||
          tool === "hand"
        )
          return;
        let html: Dynamic =
            tool === "arrow"
              ? arrowDrawingHtml(
                  defaultLineLength,
                  0,
                  1,
                  1,
                  "",
                  defaultAnnotationStrokeColor,
                )
              : defaultToolTemplates[tool],
          textInput: Dynamic =
            tool !== "text"
              ? null
              : toolOverride === undefined
                ? beginDeferredTextInput()
                : (providedTextInput ?? null);
        if (tool === "text") {
          if (toolOverride === undefined && textInput === null) return;
          let previewFrame: Dynamic = deps.getPreviewFrame(),
            firstTextFont: Dynamic = previewFrame
              ? await getPickerFirstTextFont(previewFrame)
              : null;
          if (!deps.sessionAliveRef.current) {
            textInput !== null &&
              finishDeferredTextInput("edit", textInput);
            return;
          }
          let fontStyleEdits: Dynamic =
            typeof firstTextFont == "string" && firstTextFont
              ? normalizeStyleEdits([
                  ["font-family", firstTextFont.replace(/"/g, "'")],
                ])
              : [];
          if (fontStyleEdits.length > 0) {
            let fontFamilyValue: Dynamic = fontStyleEdits[0][1];
            html = html.replace(
              /style="([^"]*)"/,
              (match?: Dynamic, styleAttr?: Dynamic): Dynamic =>
                `style="${styleAttr}; font-family: ${fontFamilyValue}"`,
            );
          }
        }
        if (tool === "draw") {
          if (!placement.path || !placement.rect) {
            placement.endTool && deps.setTool("select");
            return;
          }
          let rect: Dynamic = placement.rect;
          html = `<svg width="${rect.w}" height="${rect.h}" viewBox="0 0 ${rect.w} ${rect.h}" preserveAspectRatio="none" style="position: absolute; left: ${rect.x}px; top: ${rect.y}px; width: ${rect.w}px; height: ${rect.h}px; overflow: visible; fill: none; stroke: ${defaultAnnotationStrokeColor}; stroke-width: 2; stroke-linecap: round; stroke-linejoin: round"><path d="${placement.path.d}" vector-effect="non-scaling-stroke"></path></svg>`;
        }
        if ((tool === "arrow" || tool === "line") && placement.rect) {
          let rect: Dynamic = placement.rect,
            buildLineHtml: Dynamic =
              tool === "arrow"
                ? arrowDrawingHtml
                : lineDrawingHtml,
            { dx: insetX, dy: insetY }: Dynamic = lineDrawingInset(rect.w, rect.h);
          html = buildLineHtml(
            rect.w,
            rect.h,
            placement.dir?.x ?? 1,
            placement.dir?.y ?? -1,
            `position: absolute; left: ${rect.x - insetX}px; top: ${rect.y - insetY}px; `,
            defaultAnnotationStrokeColor,
          );
        }
        let isRootTarget: Dynamic =
          (placement.name ?? deps.rootName) === deps.rootName && placement.targetTid != null;
        if (
          placement.rect &&
          tool !== "draw" &&
          tool !== "arrow" &&
          tool !== "line"
        ) {
          let rect: Dynamic = placement.rect;
          html = html.replace(
            /style="([^"]*)"/,
            (match?: Dynamic, styleAttr?: Dynamic): Dynamic =>
              `style="${styleAttr}; position: absolute; left: ${rect.x}px; top: ${rect.y}px${rect.w > 0 ? `; width: ${rect.w}px` : ""}${rect.h > 0 ? `; height: ${rect.h}px` : ""}"`,
          );
        }
        if (tool === "text") {
          let previewFrame: Dynamic = deps.getPreviewFrame();
          previewFrame && notePickerTextInsert(previewFrame);
        }
        let insertedTids: Dynamic = deps.insertHtml(
          html,
          `insert-${tool}-${Date.now()}`,
          isRootTarget
            ? {
                targetTid: placement.targetTid,
                position: placement.position,
              }
            : {
                targetTid: null,
                position: "root-end",
              },
          tool !== "draw",
        );
        tool === "draw" &&
          deps.cacheFeedbackLabel(
            `${deps.modelRef.current.state(deps.rootName)?.path ?? deps.filePath}: drew a freehand SVG path \u2014 use the screenshot tool to view it`,
          );
        if (tool === "text") {
          let previewFrame: Dynamic = deps.getPreviewFrame(),
            textSink: Dynamic =
              previewFrame && insertedTids && insertedTids.length > 0 && textInput !== null
                ? attachDeferredTextSink(textInput, {
                    key: (typed?: Dynamic): Dynamic =>
                      pickerHeldTextKey(previewFrame, typed),
                    drop: (isKept?: Dynamic): Dynamic => {
                      !isKept &&
                        deps.pendingTextTargetTidRef.current === insertedTids[0] &&
                        (deps.pendingTextTargetTidRef.current = null);
                      dropPickerInsertedTextEdit(
                        previewFrame,
                        isKept,
                      );
                    },
                  })
                : null;
          !previewFrame || !insertedTids || !textSink
            ? (textInput !== null &&
                finishDeferredTextInput("edit", textInput),
              previewFrame &&
                !hasDeferredTextSink() &&
                dropPickerInsertedTextEdit(previewFrame, false))
            : ((deps.pendingTextTargetTidRef.current = insertedTids[0]),
              startPickerInsertedTextEdit(
                previewFrame,
                insertedTids[0],
                deps.rootName,
                textSink.typed,
                textSink.until,
              ));
        }
        if (placement.rect && isRootTarget && placement.targetTid != null) {
          let docState: Dynamic = deps.modelRef.current.state(deps.rootName);
          if (
            docState &&
            !docState.model.inlineStyleValue(placement.targetTid, "position")
          ) {
            let targetElement: Dynamic = docState.model.element(placement.targetTid),
              previewFrame: Dynamic = deps.getPreviewFrame();
            ((previewFrame
              ? await inspectPickerSelection(
                  previewFrame,
                  placement.targetTid,
                  deps.rootName,
                  ["position"],
                )
              : null
            )?.computed.position ?? "static") === "static" &&
              docState.model.element(placement.targetTid) === targetElement &&
              (docState.model.setStyleProperty(
                placement.targetTid,
                "position",
                "relative",
              ),
              deps.pushLiveModel(deps.rootName, docState),
              deps.markModelDirty(deps.rootName),
              deps.incrementSessionEpoch());
          }
        }
        (tool !== "draw" || placement.endTool) && deps.setTool("select");
      }

interface InsertImageFilesIntoArtboardDependencies {
  readonly fileDirectory: Dynamic;
  readonly incrementSessionEpoch: Dynamic;
  readonly markModelDirty: Dynamic;
  readonly modelRef: Dynamic;
  readonly pendingStampEditsRef: Dynamic;
  readonly projectPath: Dynamic;
  readonly pushLiveModel: Dynamic;
  readonly rootName: Dynamic;
  readonly showToast: Dynamic;
  readonly insertHtml: Dynamic;
  readonly typingQuietScheduler: Dynamic;
  readonly entryCheckPromiseRef: Dynamic;
}

/** 粘贴或拖入图片文件后运行：读取图片尺寸，按落点找到可容纳的容器（含幻灯片舞台、空画板），上传并插入图片元素，失败或目标不能放图片时提示。 */
export async function insertImageFilesIntoArtboard(deps: InsertImageFilesIntoArtboardDependencies, dataset?: Dynamic,
        files?: Dynamic,
        dropContext?: Dynamic): Promise<Dynamic> {
        let shownBox: Dynamic =
            dataset.source === "paste" ? null : deps.typingQuietScheduler.shown(),
          verb: Dynamic =
            dataset.source === "paste" ? "pasted" : "dropped",
          sizePromises: Dynamic = files.map(
            (file?: Dynamic): Dynamic =>
              imageHeaderDimensions(file),
          ),
          previewPromises: Dynamic = files.map(
            (file?: Dynamic, index?: Dynamic): Dynamic =>
              (isSvgFile(file)
                ? previewImageFile(file)
                : Promise.all([
                    dropContext.sized[index],
                    sizePromises[index],
                  ]).then(
                    ([isSized, head]: Dynamic): Dynamic =>
                      isSized
                        ? previewImageFile(file, {
                            sized: true,
                            head: head,
                          })
                        : null,
                  )
              ).catch((): Dynamic => null),
          );
        deps.entryCheckPromiseRef.current && (await deps.entryCheckPromiseRef.current);
        let hasTargetTid: Dynamic =
            (dataset.name ?? deps.rootName) === deps.rootName &&
            dataset.targetTid != null,
          slide: Dynamic = dataset.slide,
          slideCount: Dynamic = slide?.count,
          slideAnchor: Dynamic =
            slide != null &&
            typeof slide == "object" &&
            Number.isInteger(slide.deck) &&
            Number.isInteger(slide.index) &&
            Number.isInteger(slideCount) &&
            (slide.label == null || typeof slide.label == "string") &&
            (dataset.name ?? deps.rootName) === deps.rootName
              ? {
                  deck: slide.deck,
                  index: slide.index,
                  count: slideCount,
                  label:
                    typeof slide.label == "string"
                      ? slide.label.slice(0, 256)
                      : null,
                }
              : null,
          point: Dynamic = dataset.point,
          validPoint: Dynamic =
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
          roundCoordinate: Dynamic = (coordinate?: Dynamic): Dynamic =>
            typeof coordinate == "number" &&
            Number.isFinite(coordinate) &&
            Math.abs(coordinate) <= 2e4
              ? Math.round(coordinate)
              : null,
          atCoordinates: Dynamic =
            at != null && typeof at == "object"
              ? [at.x, at.y, at.sx, at.sy, at.w, at.h].map(roundCoordinate)
              : [],
          atRect: Dynamic =
            atCoordinates.length === 6 &&
            atCoordinates.every((coordinate?: Dynamic): Dynamic => coordinate != null)
              ? {
                  x: atCoordinates[0],
                  y: atCoordinates[1],
                  sx: atCoordinates[2],
                  sy: atCoordinates[3],
                  w: atCoordinates[4],
                  h: atCoordinates[5],
                }
              : null,
          docState: Dynamic = deps.modelRef.current.state(deps.rootName);
        if (!docState) {
          deps.showToast(
            files.length > 1
              ? uiMessage("inspector.session.couldNotAddImages", { operation: uiOperation(verb) })
              : uiMessage("inspector.session.couldNotAddImage", { operation: uiOperation(verb) }),
            "error",
          );
          return;
        }
        let targetTid: Dynamic = hasTargetTid
            ? relocateSingleElementId(
                shownBox,
                docState.model,
                dataset.targetTid,
              )
            : null,
          targetElement: Dynamic =
            targetTid != null ? docState.model.element(targetTid) : null,
          position: Dynamic = dataset.position,
          findSlideAnchor: Dynamic = (): Dynamic =>
            slideAnchor == null
              ? null
              : docState.model.resolveSlideAnchor(slideAnchor);
        if (slideAnchor) {
          let slideElement: Dynamic = findSlideAnchor();
          slideElement != null &&
            (targetElement == null ||
              !(slideElement === targetElement || slideElement.contains(targetElement))) &&
            ((targetElement = slideElement), (position = "into"));
        }
        targetElement != null &&
          position !== "into" &&
          targetElement.parentElement != null &&
          isDeckStageElement(targetElement.parentElement) &&
          (position = "into");
        let placeholderSrcValue: Dynamic =
            "data:image/svg+xml,%3Csvg%20xmlns=%27http://www.w3.org/2000/svg%27%20width=%27320%27%20height=%27200%27%3E%3Crect%20width=%27100%25%27%20height=%27100%25%27%20fill=%27%23b6b0a7%27/%3E%3C/svg%3E",
          neutralAttrs: Dynamic = {
            width: null,
            height: null,
            [`${StyleValue}width`]: null,
            [`${StyleValue}aspect-ratio`]: null,
          },
          imageSizes: Dynamic = await Promise.all(sizePromises),
          previewResults: Dynamic = files.map((): Dynamic => null);
        previewPromises.forEach((previewPromise?: Dynamic, index?: Dynamic): Dynamic => {
          previewPromise.then((preview?: Dynamic): Dynamic => {
            previewResults[index] = preview;
          });
        });
        await Promise.resolve();
        let previews: Dynamic = [...previewResults],
          preApplied: Dynamic = previews.map(
            (preview?: Dynamic): Dynamic =>
              preview
                ? {
                    src: createDropMarker(preview.url),
                  }
                : null,
          ),
          marks: Dynamic = dropContext.marks,
          dropTid: Dynamic = null;
        if (targetElement != null) {
          let elementTid: Dynamic = parseInt(
            targetElement.getAttribute(DcTplAttribute) ?? "-1",
            10,
          );
          dropTid =
            elementTid >= 0 && docState.model.element(elementTid) === targetElement
              ? elementTid
              : null;
        }
        if (dropTid == null && slideAnchor != null) {
          let slideStageElement: Dynamic = findSlideAnchor();
          if (slideStageElement != null) {
            let stageTid: Dynamic = parseInt(
              slideStageElement.getAttribute(DcTplAttribute) ?? "-1",
              10,
            );
            stageTid >= 0 &&
              docState.model.element(stageTid) === slideStageElement &&
              ((dropTid = stageTid), (position = "into"));
          }
        }
        let dropContainer: Dynamic =
            dropTid != null
              ? getDropContainer(
                  docState.model.element(dropTid),
                  position,
                )
              : null,
          pointInContainer: Dynamic =
            validPoint != null && dropContainer != null ? validPoint : null,
          emptyArtboardTarget: Dynamic =
            pointInContainer == null && slideAnchor == null && atRect != null
              ? emptyArtboardDropTarget(docState.model)
              : null,
          rootContainer: Dynamic =
            emptyArtboardTarget != null && dropTid != null && dropTid !== emptyArtboardTarget.page
              ? rootDropContainer(
                  docState.model,
                  emptyArtboardTarget,
                  dropTid,
                )
              : null,
          fileDropTarget: Dynamic =
            emptyArtboardTarget != null &&
            (rootContainer == null ||
              !rootContainer.takesFiles ||
              (rootContainer.top === dropTid && position !== "into"))
              ? atRect
              : null;
        pointInContainer?.needsPositioning &&
          dropTid != null &&
          !docState.model.inlineStyleValue(dropTid, "position") &&
          docState.model.setStyleProperty(dropTid, "position", "relative");
        let dropWidth: Dynamic = (preview?: Dynamic): Dynamic =>
            dropContainer
              ? droppedImageWidth(preview, dropContainer.w, dropContainer.h)
              : fileDropTarget
                ? Math.round(
                    Math.min(preview.width, Math.max(48, fileDropTarget.w * 0.6)),
                  )
                : preview.width,
          clampPosition: Dynamic =
            pointInContainer == null || dropContainer == null
              ? null
              : (
                  index?: Dynamic,
                  width?: Dynamic,
                  height?: Dynamic,
                ): Dynamic =>
                  clampDroppedImagePosition(
                    pointInContainer.x - width / 2 + index * 24,
                    pointInContainer.y - height / 2 + index * 24,
                    width,
                    height,
                    dropContainer.w,
                    dropContainer.h,
                  ),
          positionFor: Dynamic =
            clampPosition ??
            (fileDropTarget == null
              ? null
              : (
                  index?: Dynamic,
                  width?: Dynamic,
                  height?: Dynamic,
                ): Dynamic =>
                  fileDropPosition(
                    fileDropTarget,
                    index,
                    width,
                    height,
                  ));
        atRect != null &&
          files.forEach((file?: Dynamic, index?: Dynamic): Dynamic => {
            let preview: Dynamic = previews[index] ?? imageSizes[index],
              width: Dynamic = preview
                ? fileDropTarget
                  ? dropWidth(preview)
                  : Math.round(
                      Math.min(
                        preview.width,
                        Math.max(48, atRect.w * 0.5),
                      ),
                    )
                : 320,
              height: Dynamic = preview
                ? Math.max(
                    1,
                    Math.round((width * preview.height) / preview.width),
                  )
                : 200,
              { left: left, top: top }: Dynamic = fileDropTarget
                ? fileDropPosition(
                    fileDropTarget,
                    index,
                    width,
                    height,
                  )
                : {
                    left:
                      atRect.x + atRect.sx - width / 2 + index * 24,
                    top:
                      atRect.y + atRect.sy - height / 2 + index * 24,
                  };
            dropContext.place(index, {
              x: Math.round(left - atRect.sx),
              y: Math.round(top - atRect.sy),
              w: width,
              h: height,
            });
          });
        let imageHtml: Dynamic = files.map(
            (file?: Dynamic, index?: Dynamic): Dynamic => {
              let preview: Dynamic = previews[index] ?? imageSizes[index],
                width: Dynamic = preview ? dropWidth(preview) : null,
                sizeStyle: Dynamic =
                  preview && width != null
                    ? `; width: ${width}px; aspect-ratio: ${preview.width} / ${preview.height}`
                    : "",
                sizeAttrs: Dynamic =
                  preview && width != null
                    ? ` width="${width}" height="${Math.max(1, Math.round((width * preview.height) / preview.width))}"`
                    : "",
                src: Dynamic = preApplied[index]?.src ?? placeholderSrcValue,
                backgroundStyle: Dynamic = preApplied[index]
                  ? " background-color: #b6b0a7;"
                  : "",
                positionStyle: Dynamic =
                  dropContainer != null ? " position: relative; z-index: 1;" : "";
              if (positionFor) {
                let placedWidth: Dynamic = width ?? 320,
                  placedHeight: Dynamic =
                    preview && width != null
                      ? Math.max(
                          1,
                          Math.round(
                            (width * preview.height) / preview.width,
                          ),
                        )
                      : 200,
                  { left: left, top: top }: Dynamic = positionFor(
                    index,
                    placedWidth,
                    placedHeight,
                  );
                positionStyle = ` position: absolute; left: ${left}px; top: ${top}px;${clampPosition ? " z-index: 1;" : ""}`;
              }
              return `<img src="${src}" alt="" data-dc-drop="${marks[index]}"${sizeAttrs} style="max-width: 100%; height: auto; display: block;${backgroundStyle}${positionStyle} object-fit: cover${sizeStyle}">`;
            },
          ).join(`
`),
            insertedElements: Dynamic = (
            deps.insertHtml(
              imageHtml,
              `image-drop-${Date.now()}`,
              fileDropTarget && emptyArtboardTarget
                ? emptyArtboardTarget.placement
                : dropTid != null
                  ? {
                      targetTid: dropTid,
                      position: position,
                    }
                  : {
                      targetTid: null,
                      position: "root-end",
                    },
            ) ?? []
          ).map((tid?: Dynamic): Dynamic => docState.model.element(tid));
        if (insertedElements.every((element?: Dynamic): Dynamic => element == null)) {
          deps.showToast(
            uiMessage("inspector.session.targetCannotHoldImages", { operation: uiOperation(verb === "pasted" ? "select" : "drop onto") }),
            "error",
          );
          return;
        }
        let currentDocState: Dynamic = (): Dynamic =>
          deps.modelRef.current.state(deps.rootName) ?? docState;
        markDropPerformance("insert");
        let unregisterMarkers: Dynamic = marks.map(registerHiddenPickerTag);
        dropContext.landed();
        let failedCount: Dynamic = await insertUploadedFiles({
          files: files,
          targets: insertedElements,
          upload: (file?: Dynamic): Dynamic =>
            uploadDesignFile(deps.projectPath, deps.fileDirectory, file),
          preview: (file?: Dynamic): Dynamic =>
            previewPromises[files.indexOf(file)] ??
            previewImageFile(file),
          preApplied: preApplied,
          patch: (element?: Dynamic, attrs?: Dynamic): Dynamic => {
            let latestDoc: Dynamic = currentDocState(),
              elementTid: Dynamic = parseInt(
                element.getAttribute(DcTplAttribute) ?? "-1",
                10,
              );
            if (elementTid < 0 || latestDoc.model.element(elementTid) !== element)
              return false;
            for (let [attrName, attrValue] of Object.entries(
              attrs,
            ) as Dynamic)
              attrName.startsWith(StyleValue)
                ? latestDoc.model.setStyleProperty(
                    elementTid,
                    attrName.slice(StyleValue.length),
                    attrValue,
                  )
                : latestDoc.model.setAttribute(elementTid, attrName, attrValue);
            deps.pushLiveModel(deps.rootName, latestDoc);
            deps.markModelDirty(deps.rootName);
            deps.incrementSessionEpoch();
            return true;
          },
          relocate: (src?: Dynamic): Dynamic =>
            currentDocState().model.elementsByAttr("src", src)[0] ?? null,
          relocateByMarker: (index?: Dynamic): Dynamic =>
            currentDocState().model.elementsByAttr(
              "data-dc-drop",
              marks[index],
            )[0] ?? null,
          markerCleanupAttrs: (): Dynamic => ({
            "data-dc-drop": null,
            [`${StyleValue}background-color`]: null,
          }),
          readSrc: (element?: Dynamic): Dynamic =>
            element.getAttribute("src"),
          onStage: (stage?: Dynamic): Dynamic => {
            markDropPerformance(stage);
          },
          onSettled: (src?: Dynamic, attrs?: Dynamic): Dynamic =>
            rememberImageInsert(deps.pendingStampEditsRef.current, {
              name: deps.rootName,
              src: src,
              attrs: attrs,
            }),
          previewAttrs: (preview?: Dynamic, index?: Dynamic): Dynamic => {
            let width: Dynamic = dropWidth(preview),
              height: Dynamic = Math.max(
                1,
                Math.round((width * preview.height) / preview.width),
              ),
              previewAttrs: Dynamic = {
                width: String(width),
                height: String(height),
                [`${StyleValue}width`]: `${width}px`,
                [`${StyleValue}aspect-ratio`]: `${preview.width} / ${preview.height}`,
              };
            if (positionFor) {
              let { left: left, top: top }: Dynamic = positionFor(
                index,
                width,
                height,
              );
              previewAttrs[`${StyleValue}left`] = `${left}px`;
              previewAttrs[`${StyleValue}top`] = `${top}px`;
            }
            return previewAttrs;
          },
          yieldCleanupAttrs: (preview?: Dynamic): Dynamic =>
            positionFor
              ? {
                  width: null,
                  height: null,
                  [`${StyleValue}aspect-ratio`]: null,
                }
              : neutralAttrs,
          revertAttrs: (index?: Dynamic): Dynamic => {
            if (!positionFor) return neutralAttrs;
            let { left: left, top: top }: Dynamic = positionFor(
              index,
              320,
              200,
            );
            return {
              ...neutralAttrs,
              [`${StyleValue}left`]: `${left}px`,
              [`${StyleValue}top`]: `${top}px`,
            };
          },
          insertPinned: (index?: Dynamic): Dynamic =>
            (previews[index] ?? imageSizes[index]) != null,
          placeholderSrc: placeholderSrcValue,
        }).finally((): Dynamic => {
          for (let unregister of unregisterMarkers as Dynamic) unregister();
        });
        failedCount > 0 &&
          deps.showToast(
            files.length > 1
              ? uiMessage("inspector.session.couldNotAddSomeImages", { failed: String(failedCount), total: String(files.length), operation: uiOperation(verb) })
              : uiMessage("inspector.session.couldNotAddImage", { operation: uiOperation(verb) }),
            "error",
          );
        return failedCount === 0;
      }

interface RouteDroppedMediaFilesDependencies {
  readonly filePath: Dynamic;
  readonly modelRef: Dynamic;
  readonly onDropVideos: Dynamic;
  readonly rootName: Dynamic;
  readonly showToast: Dynamic;
  readonly insertImageFiles: Dynamic;
  readonly pendingImageDropsRef: Dynamic;
  readonly previewFrameRef: Dynamic;
}

/** 文件拖入或粘贴到画板时运行：筛出图片与视频，视频交给视频上传流程，其余文件提示不支持，图片交给插图流程并在结束后清理拖放状态。 */
export async function routeDroppedMediaFiles(deps: RouteDroppedMediaFilesDependencies, dataset?: Dynamic): Promise<Dynamic> {
        let files: Dynamic = (dataset.files ?? []).filter(
            (file?: Dynamic): Dynamic => file instanceof File,
          ),
          imageFiles: Dynamic = files
            .filter(
              (file?: Dynamic): Dynamic => file.type.startsWith("image/"),
            )
            .slice(0, 6),
          videoFiles: Dynamic = files.filter(isVideoFile),
          verb: Dynamic =
            dataset.source === "paste" ? "pasted" : "dropped",
          at: Dynamic = dataset.at,
          isValidCoordinate: Dynamic = (coordinate?: Dynamic): Dynamic =>
            typeof coordinate == "number" &&
            Number.isFinite(coordinate) &&
            Math.abs(coordinate) <= 2e4,
          dropRect: Dynamic =
            at != null &&
            typeof at == "object" &&
            isValidCoordinate(at.x) &&
            isValidCoordinate(at.y) &&
            isValidCoordinate(at.sx) &&
            isValidCoordinate(at.sy) &&
            isValidCoordinate(at.w) &&
            isValidCoordinate(at.h)
              ? {
                  x: Math.round(at.x),
                  y: Math.round(at.y),
                  sx: Math.round(at.sx),
                  sy: Math.round(at.sy),
                  w: Math.round(at.w),
                  h: Math.round(at.h),
                }
              : null;
        videoFiles.length > 0
          ? dataset.slide != null ||
            deps.modelRef.current.state(deps.rootName)?.model.findDeckStage() != null ||
            deps.previewFrameRef.current?.contentDocument?.querySelector(
              "deck-stage",
            ) != null
            ? deps.showToast(CanvasWorkingStateHandler("artboard"))
            : deps.onDropVideos
              ? deps.onDropVideos(videoFiles, {
                  at: dropRect,
                  verb: verb,
                  after: imageFiles.length,
                })
              : deps.showToast(
                  videoUploadFailureMessage("unavailable"),
                )
          : imageFiles.length === 0 &&
            Date.now() - deps.pendingImageDropsRef.current > 5e3 &&
            ((deps.pendingImageDropsRef.current = Date.now()),
            deps.showToast(
              dataset.refuse === true
                ? uiMessage("inspector.session.filesCanTBeDropped")
                : uiMessage("inspector.session.onlyImagesAndMp4Mov", { operation: uiOperation(verb) }),
            ));
        if (imageFiles.length === 0) return;
        let dropSession: Dynamic = receiveFileDrops(
          imageFiles,
          deps.filePath,
          at != null &&
            typeof at == "object" &&
            isValidCoordinate(at.x) &&
            isValidCoordinate(at.y)
            ? {
                x: at.x,
                y: at.y,
              }
            : null,
        );
        try {
          return await deps.insertImageFiles(dataset, imageFiles, dropSession);
        } finally {
          dropSession.end();
        }
      }

interface UploadReplacementImageDependencies {
  readonly fileDirectory: Dynamic;
  readonly incrementSessionEpoch: Dynamic;
  readonly markModelDirty: Dynamic;
  readonly modelRef: Dynamic;
  readonly onHistoryDrop: Dynamic;
  readonly pendingStampEditsRef: Dynamic;
  readonly projectPath: Dynamic;
  readonly pushLiveModel: Dynamic;
  readonly readOnlyRef: Dynamic;
  readonly rootName: Dynamic;
  readonly showToast: Dynamic;
  readonly pushUndoEdit: Dynamic;
  readonly editSelectionProperty: Dynamic;
  readonly replacementImageUploadsRef: Dynamic;
  readonly selectionRef: Dynamic;
  readonly undoEditGroupRef: Dynamic;
  readonly lastEditedTemplateRef: Dynamic;
  readonly cacheFeedbackLabel: Dynamic;
}

/** 替换选中图片时运行：把用户选择的文件上传到作品目录，多选时统一改 src，单选时替换图片并记录撤销、推送实时模型；上传失败时提示。 */
export async function uploadReplacementImage(deps: UploadReplacementImageDependencies, file?: Dynamic): Promise<Dynamic> {
        let current: Dynamic = deps.selectionRef.current;
        if (!current || deps.readOnlyRef.current || current.name !== deps.rootName)
          return;
        let docState: Dynamic = deps.modelRef.current.state(current.name);
        if (!docState) return;
        let currentDocState: Dynamic = (): Dynamic =>
            deps.modelRef.current.state(current.name) ?? docState,
          existingTids: Dynamic = current.tids.filter(
            (tid?: Dynamic): Dynamic =>
              docState.model.element(tid) != null,
          );
        if (existingTids.length === 0) return;
        if (existingTids.length > 1) {
          try {
            let { src: uploadedSrc }: Dynamic = await uploadDesignFile(deps.projectPath, deps.fileDirectory, file);
            deps.editSelectionProperty("@src", uploadedSrc);
          } catch (uploadError: Dynamic) {
            console.error("[dc-editor] image pick upload failed:", uploadError);
            deps.showToast(uiMessage("inspector.session.couldNotUploadTheImage"), "error");
            return false;
          }
          return;
        }
        let imageTid: Dynamic = existingTids[0],
          imageElement: Dynamic = docState.model.element(imageTid);
        if (imageElement == null) return;
        let uploadToken: Dynamic = (deps.replacementImageUploadsRef.current.get(imageElement) ?? 0) + 1;
        deps.replacementImageUploadsRef.current.set(imageElement, uploadToken);
        let undoKey: Dynamic = `src-pick-${Date.now()}`,
          redoSnapshot: Dynamic = null,
          {
            failed: failed,
            relName: relName,
            src: replacedSrc,
            applied: applied,
          }: Dynamic = await replaceSelectedImage({
            file: file,
            el: imageElement,
            getModel: (): Dynamic => currentDocState().model,
            isCurrent: (): Dynamic =>
              deps.replacementImageUploadsRef.current.get(imageElement) === uploadToken,
            upload: (uploadFile?: Dynamic): Dynamic =>
              uploadDesignFile(
                deps.projectPath,
                deps.fileDirectory,
                uploadFile,
              ),
            pushUndo: (): Dynamic => {
              let state: Dynamic = currentDocState();
              redoSnapshot = state.redo.slice();
              deps.pushUndoEdit(current.name, undoKey, state);
            },
            afterPatch: (): Dynamic => {
              deps.lastEditedTemplateRef.current = current.name;
              deps.pushLiveModel(current.name, currentDocState());
              deps.markModelDirty(current.name);
              deps.incrementSessionEpoch();
            },
            recordSettled: (settled?: Dynamic): Dynamic =>
              rememberImageInsert(deps.pendingStampEditsRef.current, {
                name: current.name,
                ...settled,
              }),
          });
        if (failed) {
          let pendingUndo: Dynamic = deps.undoEditGroupRef.current,
            latestState: Dynamic = currentDocState();
          pendingUndo &&
            pendingUndo.name === current.name &&
            pendingUndo.key === undoKey &&
            redoSnapshot != null &&
            latestState.undo.length > 0 &&
            (latestState.undo.pop(),
            (latestState.redo = redoSnapshot),
            deps.onHistoryDrop?.("undo"),
            (deps.undoEditGroupRef.current = null));
          return deps.replacementImageUploadsRef.current.get(imageElement) === uploadToken
            ? (deps.showToast(uiMessage("inspector.session.couldNotUploadTheImage"), "error"), false)
            : undefined;
        } else
          relName != null &&
            applied &&
            deps.cacheFeedbackLabel(
              `${docState.path}: set @src=${replacedSrc ?? "./" + relName} on img`,
              `${docState.path}:@src:${imageTid}`,
            );
      }
