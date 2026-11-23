import { CanvasAnchoredPopover } from "../chrome";
import { CanvasNote } from "../note";
import { CanvasObjectQuickActions } from "../../properties/annotation-quick-actions";
import { CanvasShape } from "../shape";
import { ConditionalPortal } from "../chrome";
import { CropDoesNotWorkWhileThisMessage } from "../../editor/geometry/flip-annotations";
import { EditingNoteQuickActions } from "../../properties/annotation-quick-actions";
import { MediaCropEditor } from "../../editor/media/crop-editor";
import { NoteQuickActions } from "../../properties/annotation-quick-actions";
import { PickerRuntimeScriptTAppAccentConfig } from "../../editor/picker/runtime-script";
import { minImageDimension as minCropFrameSize } from "../../platform/file-content";
import { PositionedSelectionQuickActions } from "../chrome";
import { SessionStrip } from "../../editor/session-strip/session-strip";
import { ViewportScale } from "../viewport-store";
import { canvasTouchDragThresholdPixels } from "../interaction-geometry";
import { handleQuickActionsArrowKeys } from "../quick-action-keys";
import { imageFlipCss } from "../../editor/geometry/flip-annotations";
import { isShapeAnnotation } from "../../platform/file-content";
import { jsx_Nn } from "../interaction-geometry";
import { rotatedAnnotationBounds } from "../../platform/file-content";
import { supportsClickPlacement } from "../../editor/tools";
import { type Dynamic } from "../../runtime-types";
import { uiMessage } from "@minedesign/contracts/ui-messages";
import { updateAnnotationCrop } from "../../platform/file-content";
import { updateAnnotationTextStyle } from "../../platform/file-content";
import { updateShapeColor } from "../../platform/file-content";

/** 渲染画布对象层时运行：为每个批注渲染形状或便签组件，接上选中、按下、裁剪、吸附参考线、矢量编辑与文字编辑等回调。 */
export function renderCanvasObjects(deps: { readonly armedTool: Dynamic; readonly cropAnnotationFrame: Dynamic; readonly beginImageCrop: Dynamic; readonly trackPointerGesture: Dynamic; readonly updateAnnotation: Dynamic; readonly buildSnapReferenceLines: Dynamic; readonly registerTransformTarget: Dynamic; readonly buildObjectPressHandlersBound: Dynamic; readonly enterVectorEdit: Dynamic; readonly isAnnotationUnder: Dynamic; readonly camera: Dynamic; readonly entry: Dynamic; readonly manifest: Dynamic; readonly selectedNotes: Dynamic; readonly setMeasuredNoteSizes: Dynamic; readonly setQuickActionsState: Dynamic; readonly cropSession: Dynamic; readonly forceRender: Dynamic; readonly isCanvasInert: Dynamic; readonly trackGesture: Dynamic; readonly canEditCanvas: Dynamic; readonly resolvePreviewUrl: Dynamic; readonly isMultiSelection: Dynamic; readonly usesCameraPortal: Dynamic; readonly chromePortalHost: Dynamic; readonly objectsPortalHost: Dynamic; readonly singleSelectedNoteId: Dynamic; readonly setSnapGuides: Dynamic }): Dynamic {
              let renderedObjects: Dynamic = (deps.manifest.annotations ?? []).map(
                (source?: Dynamic): Dynamic => {
                  let objectView: Dynamic = isShapeAnnotation(
                    source,
                  )
                    ? (() => {
                        const ShapeView = CanvasShape;
                        const shapeProps = {
                          spec:
                            deps.cropSession?.id === source.id &&
                            source.kind === "image"
                              ? updateAnnotationCrop(
                                  {
                                    ...source,
                                    ...deps.cropAnnotationFrame(deps.cropSession),
                                  },
                                  deps.cropSession.live,
                                )
                              : source,
                          cropping: deps.cropSession?.id === source.id,
                          onCropStart: (): Dynamic => deps.beginImageCrop(source.id),
                          onPictureLoad: deps.forceRender,
                          scale: deps.entry.scale,
                          editing: deps.canEditCanvas,
                          inert:
                            supportsClickPlacement(deps.armedTool) ||
                            deps.armedTool === "draw",
                          commenting: deps.isCanvasInert,
                          selected: deps.selectedNotes.has(source.id),
                          grouped: deps.isMultiSelection,
                          objectPress: deps.buildObjectPressHandlersBound(source),
                          onChange: (
                            patch?: Dynamic,
                            updateOptions?: Dynamic,
                          ): Dynamic =>
                            deps.updateAnnotation(
                              source.id,
                              (annotation?: Dynamic): Dynamic =>
                                isShapeAnnotation(annotation)
                                  ? {
                                      ...annotation,
                                      ...patch,
                                    }
                                  : annotation,
                              updateOptions,
                            ),
                          onGesture: deps.trackGesture,
                          armWindowGestureEnd: deps.trackPointerGesture,
                          resolveImageSrc: deps.resolvePreviewUrl,
                          snapLines: (): Dynamic => ({
                            lines: deps.buildSnapReferenceLines({
                              notes: [source.id],
                            }),
                            threshold:
                              canvasTouchDragThresholdPixels /
                              deps.camera.get().scale,
                          }),
                          onSnapGuides: deps.setSnapGuides,
                          vectorEdit: deps.armedTool === "vector",
                          onEditPoints:
                            source.kind === "pen"
                              ? (): Dynamic => deps.enterVectorEdit(source.id)
                              : undefined,
                        } as const;
                        const shapeKey = source.id;
                        return <ShapeView key={shapeKey} {...shapeProps} />;
                      })()
                    : (() => {
                        const NoteView = CanvasNote;
                        const noteProps = {
                          spec: source,
                          editing: deps.canEditCanvas,
                          commenting: deps.isCanvasInert,
                          selected: deps.selectedNotes.has(source.id),
                          grouped: deps.isMultiSelection,
                          objectPress: deps.buildObjectPressHandlersBound(source),
                          onChange: (
                            patch?: Dynamic,
                            updateOptions?: Dynamic,
                          ): Dynamic =>
                            deps.updateAnnotation(
                              source.id,
                              (annotation?: Dynamic): Dynamic =>
                                isShapeAnnotation(annotation)
                                  ? annotation
                                  : {
                                      ...annotation,
                                      ...patch,
                                    },
                              updateOptions,
                            ),
                          onGesture: deps.trackGesture,
                          armWindowGestureEnd: deps.trackPointerGesture,
                          snapLines: (): Dynamic => ({
                            lines: deps.buildSnapReferenceLines({
                              notes: [source.id],
                            }),
                            threshold:
                              canvasTouchDragThresholdPixels /
                              deps.camera.get().scale,
                          }),
                          onSnapGuides: deps.setSnapGuides,
                          onTextEditing: (isEditing?: Dynamic): Dynamic =>
                            deps.setQuickActionsState(
                              (currentEditingId?: Dynamic): Dynamic =>
                                isEditing
                                  ? source.id
                                  : currentEditingId === source.id
                                    ? null
                                    : currentEditingId,
                            ),
                          autoEdit:
                            source.text === "" && deps.singleSelectedNoteId === source.id,
                          onMeasure: (size?: Dynamic): Dynamic =>
                            deps.setMeasuredNoteSizes(
                              (sizesById?: Dynamic): Dynamic =>
                                sizesById[source.id]?.w === size.w &&
                                sizesById[source.id]?.h === size.h
                                  ? sizesById
                                  : {
                                      ...sizesById,
                                      [source.id]: size,
                                    },
                            ),
                        } as const;
                        const noteKey = source.id;
                        return <NoteView key={noteKey} {...noteProps} />;
                      })();
                  return {
                    under: deps.isAnnotationUnder(source),
                    node: deps.usesCameraPortal
                      ? (() => {
                          const WrapperTag = "div";
                          const wrapperProps = {
                            ref: deps.registerTransformTarget,
                            className: "absolute left-0 top-0 h-0 w-0",
                            style: {
                              transformOrigin: "0 0",
                            },
                            children: objectView,
                          } as const;
                          const wrapperKey = source.id;
                          return <WrapperTag key={wrapperKey} {...wrapperProps} />;
                        })()
                      : objectView,
                  };
                },
              );
              return deps.usesCameraPortal ? (
                <jsx_Nn.Fragment>
                  <ConditionalPortal on={true} to={deps.objectsPortalHost}>
                    {renderedObjects
                      .filter((entry?: Dynamic): Dynamic => entry.under)
                      .map((entry?: Dynamic): Dynamic => entry.node)}
                  </ConditionalPortal>
                  <ConditionalPortal on={true} to={deps.chromePortalHost}>
                    {renderedObjects
                      .filter((entry?: Dynamic): Dynamic => !entry.under)
                      .map((entry?: Dynamic): Dynamic => entry.node)}
                  </ConditionalPortal>
                </jsx_Nn.Fragment>
              ) : (
                renderedObjects.map((entry?: Dynamic): Dynamic => entry.node)
              );
            }

/** 图片形状进入裁剪时运行：在图片上方渲染裁剪编辑器，换算画框位置与旋转并支持吸附，完成或实时变化时更新形状的裁剪数据。 */
export function renderImageCropEditor(deps: { readonly cropAnnotationFrame: Dynamic; readonly trackPointerGesture: Dynamic; readonly wrapInCameraPortal: Dynamic; readonly cropSession: Dynamic; readonly setCropSession: Dynamic; readonly finishImageCrop: Dynamic; readonly cropAnnotation: Dynamic; readonly trackGesture: Dynamic; readonly resolvePreviewUrl: Dynamic }): Dynamic {
              let cropRect: Dynamic = deps.cropAnnotationFrame(deps.cropSession) ?? deps.cropAnnotation;
              return deps.wrapInCameraPortal(
                "crop",
                <div
                  data-mega-chrome={"crop"}
                  data-testid={"mega-crop"}
                  className={"pointer-events-none absolute z-30"}
                  style={{
                    ...PickerRuntimeScriptTAppAccentConfig,
                    left: cropRect.x,
                    top: cropRect.y,
                    width: cropRect.w,
                    height: cropRect.h,
                    transform: deps.cropSession.rot
                      ? "rotate(" + String(deps.cropSession.rot) + "deg)"
                      : undefined,
                  }}
                >
                  <div
                    className={"absolute"}
                    style={{
                      left: deps.cropSession.edge.l,
                      top: deps.cropSession.edge.t,
                      width: deps.cropSession.local.w,
                      height: deps.cropSession.local.h,
                    }}
                  >
                    <ViewportScale>
                      {(viewportScale?: Dynamic): Dynamic => (
                        <MediaCropEditor
                          frame={{
                            w: deps.cropSession.local.w,
                            h: deps.cropSession.local.h,
                          }}
                          natural={deps.cropSession.natural}
                          crop={deps.cropSession.live}
                          scale={viewportScale}
                          rotation={(deps.cropSession.rot * Math.PI) / 180}
                          src={deps.resolvePreviewUrl(deps.cropAnnotation.src)}
                          onLive={(liveCrop?: Dynamic): Dynamic =>
                            deps.setCropSession(
                              (cropState?: Dynamic): Dynamic =>
                                cropState && {
                                  ...cropState,
                                  live: liveCrop,
                                },
                            )
                          }
                          minFrame={minCropFrameSize}
                          snapFrame={(frame?: Dynamic): Dynamic => {
                            let [left, top, right, bottom]: Dynamic = [
                              Math.round(frame.x),
                              Math.round(frame.y),
                              Math.round(frame.x + frame.w),
                              Math.round(frame.y + frame.h),
                            ];
                            return {
                              x: left,
                              y: top,
                              w: Math.max(
                                minCropFrameSize,
                                right - left,
                              ),
                              h: Math.max(
                                minCropFrameSize,
                                bottom - top,
                              ),
                            };
                          }}
                          onFrame={(frameChange?: Dynamic): Dynamic =>
                            deps.setCropSession(
                              (cropState?: Dynamic): Dynamic =>
                                cropState && {
                                  ...cropState,
                                  live: frameChange.crop,
                                  local: frameChange.frame,
                                },
                            )
                          }
                          onDone={deps.finishImageCrop}
                          onGesture={(isGesturing?: Dynamic): Dynamic => {
                            deps.trackGesture("crop", isGesturing);
                            isGesturing && deps.trackPointerGesture("crop");
                          }}
                        />
                      )}
                    </ViewportScale>
                  </div>
                </div>,
              );
            }

/** 选中单个批注且未处于绘制或放置工具时运行：在其旁渲染快捷操作条（形状的改色、删除、评论、裁剪、替换媒体、打开属性，或便签的文字样式操作）。 */
export function renderAnnotationQuickActions(deps: { readonly findPictureElements: Dynamic; readonly beginImageCrop: Dynamic; readonly updateAnnotation: Dynamic; readonly getAnnotationBox: Dynamic; readonly manifest: Dynamic; readonly onAnnotationCss: Dynamic; readonly onDeleteAnnotation: Dynamic; readonly onOpenPropsPanel: Dynamic; readonly onReplaceAnnotationMedia: Dynamic; readonly quickActionsState: Dynamic; readonly cropSession: Dynamic; readonly finishImageCrop: Dynamic; readonly inspectorPosture: Dynamic; readonly openPropsPanel: Dynamic; readonly isInspectorSheet: Dynamic; readonly canEditCanvas: Dynamic; readonly resolvePreviewUrl: Dynamic; readonly isPhoneCanvas: Dynamic; readonly singleSelectedNoteId: Dynamic; readonly composeNoteComment: Dynamic }): Dynamic {
            let annotation: Dynamic = (deps.manifest.annotations ?? []).find(
              (candidate?: Dynamic): Dynamic => candidate.id === deps.singleSelectedNoteId,
            );
            if (!annotation) return null;
            let isEditingText: Dynamic = deps.quickActionsState === annotation.id;
            if (isEditingText && annotation.kind === "title1") return null;
            let annotationBounds: Dynamic = rotatedAnnotationBounds(
                annotation,
                deps.getAnnotationBox(annotation),
              ),
              restyleNote: Dynamic = (textStyle?: Dynamic): Dynamic =>
                deps.updateAnnotation(
                  annotation.id,
                  (currentAnnotation?: Dynamic): Dynamic =>
                    isShapeAnnotation(currentAnnotation)
                      ? currentAnnotation
                      : updateAnnotationTextStyle(currentAnnotation, textStyle),
                  true,
                );
            return (
              <CanvasAnchoredPopover
                x={annotationBounds.x + annotationBounds.w / 2}
                y={annotationBounds.y}
                belowSheet={deps.inspectorPosture === "sheet"}
              >
                {(anchorPosition?: Dynamic): Dynamic => (
                  <SessionStrip
                    data-testid={"mega-note-strip"}
                    data-mega-selection-strip={""}
                    aria-label={
                      isShapeAnnotation(annotation) ? (uiMessage("canvas.interactionLayer.shapeActions")) : (uiMessage("canvas.interactionLayer.noteActions"))
                    }
                    surface={"popover"}
                    wrap={deps.isInspectorSheet}
                    onKeyDown={handleQuickActionsArrowKeys}
                  >
                    {isShapeAnnotation(annotation) ? ((() => {
                          const _Component8 =
                            CanvasObjectQuickActions;
                          const _props8 = {
                            spec: annotation,
                            onRecolor: (color?: Dynamic): Dynamic =>
                              deps.updateAnnotation(
                                annotation.id,
                                (currentAnnotation?: Dynamic): Dynamic =>
                                  isShapeAnnotation(currentAnnotation)
                                    ? updateShapeColor(
                                        currentAnnotation,
                                        color,
                                      )
                                    : currentAnnotation,
                                true,
                              ),
                            onDelete: (): Dynamic =>
                              deps.onDeleteAnnotation?.(annotation.id),
                            onComment:
                              deps.composeNoteComment &&
                              ((commentPayload?: Dynamic): Dynamic =>
                                deps.composeNoteComment(annotation.id, commentPayload)),
                            cropping: deps.cropSession?.id === annotation.id,
                            onCrop:
                              annotation.kind === "image"
                                ? (): Dynamic =>
                                    deps.cropSession
                                      ? deps.finishImageCrop(true)
                                      : deps.beginImageCrop(annotation.id)
                                : undefined,
                            cropReason:
                              annotation.kind !== "image" || deps.cropSession
                                ? undefined
                                : deps.findPictureElements(annotation.id)
                                  ? imageFlipCss(annotation)
                                    ? CropDoesNotWorkWhileThisMessage
                                    : undefined
                                  : uiMessage("canvas.interactionLayer.thisPictureHasNotLoaded"),
                            clip:
                              annotation.kind === "image" &&
                              annotation.video !== undefined &&
                              deps.onAnnotationCss &&
                              deps.onReplaceAnnotationMedia
                                ? {
                                    src: deps.resolvePreviewUrl(annotation.src) ?? undefined,
                                    onCss: (
                                      cssPatch?: Dynamic,
                                      cssOptions?: Dynamic,
                                    ): Dynamic =>
                                      deps.onAnnotationCss(
                                        annotation.id,
                                        cssPatch,
                                        cssOptions,
                                      ),
                                    onReplace: (replacementMedia?: Dynamic): Dynamic =>
                                      deps.onReplaceAnnotationMedia(
                                        annotation.id,
                                        replacementMedia,
                                      ),
                                    onOpenProps:
                                      deps.isPhoneCanvas && !deps.canEditCanvas
                                        ? undefined
                                        : (): Dynamic => {
                                            deps.onOpenPropsPanel?.();
                                            deps.openPropsPanel();
                                          },
                                  }
                                : undefined,
                          } as const;
                          const _key8 =
                            annotation.id +
                            "@" +
                            [anchorPosition, annotationBounds.x, annotationBounds.y, annotationBounds.w].join(
                              ",",
                            );
                          return <_Component8 key={_key8} {..._props8} />;
                        })()) : (isEditingText ? ((() => {
                            const EditingNoteActionsView =
                              EditingNoteQuickActions;
                            const editingNoteProps = {
                              spec: annotation,
                              onRestyle: restyleNote,
                              onComment:
                                deps.composeNoteComment &&
                                ((commentPayload?: Dynamic): Dynamic =>
                                  deps.composeNoteComment(annotation.id, commentPayload)),
                            } as const;
                            const editingNoteKey =
                              annotation.id +
                              "@" +
                              [
                                anchorPosition,
                                annotation.x,
                                annotation.y,
                                annotation.w,
                              ].join(",");
                            return <EditingNoteActionsView key={editingNoteKey} {...editingNoteProps} />;
                          })()) : ((() => {
                            const NoteActionsView = NoteQuickActions;
                            const noteActionsProps = {
                              spec: annotation,
                              onRestyle: restyleNote,
                              onDelete: (): Dynamic =>
                                deps.onDeleteAnnotation?.(annotation.id),
                              onComment:
                                deps.composeNoteComment &&
                                ((commentPayload?: Dynamic): Dynamic =>
                                  deps.composeNoteComment(annotation.id, commentPayload)),
                            } as const;
                            const noteActionsKey =
                              annotation.id +
                              "@" +
                              [
                                anchorPosition,
                                annotation.x,
                                annotation.y,
                                annotation.w,
                              ].join(",");
                            return <NoteActionsView key={noteActionsKey} {...noteActionsProps} />;
                          })()))}
                  </SessionStrip>
                )}
              </CanvasAnchoredPopover>
            );
          }

/** 选中画板内元素且需要显示快捷操作时运行：在选中区域旁渲染快捷操作条（编辑文字、替换图片或视频、裁剪、链接、格式、评论、打开属性等）。 */
export function renderSelectionQuickActions(deps: { readonly crossFile: Dynamic; readonly elementSelection: Dynamic; readonly manifest: Dynamic; readonly quickProps: Dynamic; readonly seed: Dynamic; readonly textEditState: Dynamic; readonly inspectorPosture: Dynamic; readonly hasTouchToolbar: Dynamic; readonly openPropsPanel: Dynamic; readonly applyQuickProps: Dynamic; readonly handleQuickGesture: Dynamic; readonly handleTextFormat: Dynamic; readonly editQuickText: Dynamic; readonly replaceQuickImage: Dynamic; readonly cropQuickImage: Dynamic; readonly replaceQuickVideo: Dynamic; readonly isInspectorSheet: Dynamic; readonly findQuickVideo: Dynamic; readonly linkQuickElement: Dynamic; readonly composeElementCommentLatest: Dynamic; readonly composeElementComment: Dynamic }): Dynamic {
            let artboard: Dynamic = deps.manifest.artboards.find(
              (candidate?: Dynamic): Dynamic =>
                candidate.file === deps.elementSelection.file,
            );
            if (!artboard) return null;
            let rect: Dynamic = deps.elementSelection.rect,
              anchorX: Dynamic = Math.max(
                0,
                Math.min(artboard.w, rect.x + rect.w / 2),
              ),
              anchorY: Dynamic = Math.max(0, Math.min(artboard.h, rect.y));
            return (
              <CanvasAnchoredPopover
                x={artboard.x + anchorX}
                y={artboard.y + anchorY}
                belowSheet={deps.inspectorPosture === "sheet"}
              >
                {(anchorPosition?: Dynamic): Dynamic => (
                  <SessionStrip
                    data-mega-selection-strip={""}
                    aria-label={uiMessage("canvas.interactionLayer.selectionActions")}
                    surface={"popover"}
                    wrap={deps.isInspectorSheet}
                    onKeyDown={handleQuickActionsArrowKeys}
                  >
                    {(() => {
                      const SelectionActionsView =
                        PositionedSelectionQuickActions;
                      const selectionActionsProps = {
                        at: anchorPosition,
                        text: deps.quickProps?.text ?? 0,
                        shape: deps.quickProps?.shape ?? 0,
                        box: deps.quickProps?.box ?? 0,
                        image: deps.quickProps?.image ?? 0,
                        other: deps.quickProps?.other ?? 0,
                        line: deps.quickProps?.line ?? 0,
                        primaryTag: deps.quickProps?.primaryTag ?? "",
                        part: deps.elementSelection.part,
                        seed: deps.seed,
                        onEditText: deps.quickProps?.onEditText ? deps.editQuickText : null,
                        crossFile: deps.crossFile ?? null,
                        sidebarVisible: false,
                        onOpenProps: deps.openPropsPanel,
                        onApply: deps.applyQuickProps,
                        onGesture: deps.handleQuickGesture,
                        textEdit: deps.textEditState,
                        onReplaceImage: deps.quickProps?.onReplaceImage
                          ? deps.replaceQuickImage
                          : undefined,
                        onCrop: deps.quickProps?.onCrop ? deps.cropQuickImage : undefined,
                        cropping: deps.quickProps?.cropping,
                        cropReason: deps.quickProps?.cropReason,
                        onReplaceVideo: deps.quickProps?.onReplaceVideo
                          ? deps.replaceQuickVideo
                          : undefined,
                        findVideo: deps.quickProps?.findVideo
                          ? deps.findQuickVideo
                          : undefined,
                        onElementLink: deps.quickProps?.onElementLink
                          ? deps.linkQuickElement
                          : undefined,
                        contrastRef: deps.quickProps?.contrastRef,
                        coarse: deps.hasTouchToolbar,
                        compact: deps.isInspectorSheet,
                        onFormat: deps.handleTextFormat,
                        onComment: deps.composeElementComment ? deps.composeElementCommentLatest : undefined,
                      } as const;
                      const selectionActionsKey = deps.elementSelection.identity;
                      return <SelectionActionsView key={selectionActionsKey} {...selectionActionsProps} />;
                    })()}
                  </SessionStrip>
                )}
              </CanvasAnchoredPopover>
            );
          }
