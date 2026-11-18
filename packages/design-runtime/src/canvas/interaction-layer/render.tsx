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
import { PlatformFileContentConstant_20 as minCropFrameSize } from "../../platform/file-content";
import { PositionedSelectionQuickActions } from "../chrome";
import { SessionStrip } from "../../editor/session-strip/session-strip";
import { ViewportScale } from "../viewport-store";
import { artboardTweaksRowHeight } from "../artboard-tweaks";
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
export function renderCanvasObjects(deps: { readonly armedTool: Dynamic; readonly callback27: Dynamic; readonly callback28: Dynamic; readonly callback30: Dynamic; readonly callback34: Dynamic; readonly callback45: Dynamic; readonly callback5: Dynamic; readonly callback55: Dynamic; readonly callback56: Dynamic; readonly callback6: Dynamic; readonly camera: Dynamic; readonly entry: Dynamic; readonly manifest: Dynamic; readonly selectedNotes: Dynamic; readonly value11: Dynamic; readonly value113: Dynamic; readonly value114: Dynamic; readonly value119: Dynamic; readonly value126: Dynamic; readonly value134: Dynamic; readonly value18: Dynamic; readonly value181: Dynamic; readonly value232: Dynamic; readonly value35: Dynamic; readonly value46: Dynamic; readonly value50: Dynamic; readonly value59: Dynamic; readonly value70: Dynamic }): Dynamic {
              let renderedObjects: Dynamic = (deps.manifest.annotations ?? []).map(
                (source?: Dynamic): Dynamic => {
                  let objectView: Dynamic = isShapeAnnotation(
                    source,
                  )
                    ? (() => {
                        const ShapeView = CanvasShape;
                        const shapeProps = {
                          spec:
                            deps.value114?.id === source.id &&
                            source.kind === "image"
                              ? updateAnnotationCrop(
                                  {
                                    ...source,
                                    ...deps.callback27(deps.value114),
                                  },
                                  deps.value114.live,
                                )
                              : source,
                          cropping: deps.value114?.id === source.id,
                          onCropStart: (): Dynamic => deps.callback28(source.id),
                          onPictureLoad: deps.value119,
                          scale: deps.entry.scale,
                          editing: deps.value18,
                          inert:
                            supportsClickPlacement(deps.armedTool) ||
                            deps.armedTool === "draw",
                          commenting: deps.value126,
                          selected: deps.selectedNotes.has(source.id),
                          grouped: deps.value232,
                          objectPress: deps.callback55(source),
                          onChange: (
                            patch?: Dynamic,
                            updateOptions?: Dynamic,
                          ): Dynamic =>
                            deps.callback34(
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
                          onGesture: deps.value134,
                          armWindowGestureEnd: deps.callback30,
                          resolveImageSrc: deps.value181,
                          snapLines: (): Dynamic => ({
                            lines: deps.callback45({
                              notes: [source.id],
                            }),
                            threshold:
                              canvasTouchDragThresholdPixels /
                              deps.camera.get().scale,
                          }),
                          onSnapGuides: deps.value70,
                          vectorEdit: deps.armedTool === "vector",
                          onEditPoints:
                            source.kind === "pen"
                              ? (): Dynamic => deps.callback56(source.id)
                              : undefined,
                        } as const;
                        const shapeKey = source.id;
                        return <ShapeView key={shapeKey} {...shapeProps} />;
                      })()
                    : (() => {
                        const NoteView = CanvasNote;
                        const noteProps = {
                          spec: source,
                          editing: deps.value18,
                          commenting: deps.value126,
                          selected: deps.selectedNotes.has(source.id),
                          grouped: deps.value232,
                          objectPress: deps.callback55(source),
                          onChange: (
                            patch?: Dynamic,
                            updateOptions?: Dynamic,
                          ): Dynamic =>
                            deps.callback34(
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
                          onGesture: deps.value134,
                          armWindowGestureEnd: deps.callback30,
                          snapLines: (): Dynamic => ({
                            lines: deps.callback45({
                              notes: [source.id],
                            }),
                            threshold:
                              canvasTouchDragThresholdPixels /
                              deps.camera.get().scale,
                          }),
                          onSnapGuides: deps.value70,
                          onTextEditing: (isEditing?: Dynamic): Dynamic =>
                            deps.value113(
                              (currentEditingId?: Dynamic): Dynamic =>
                                isEditing
                                  ? source.id
                                  : currentEditingId === source.id
                                    ? null
                                    : currentEditingId,
                            ),
                          autoEdit:
                            source.text === "" && deps.value59 === source.id,
                          onMeasure: (size?: Dynamic): Dynamic =>
                            deps.value11(
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
                    under: deps.callback6(source),
                    node: deps.value35
                      ? (() => {
                          const WrapperTag = "div";
                          const wrapperProps = {
                            ref: deps.callback5,
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
              return deps.value35 ? (
                <jsx_Nn.Fragment>
                  <ConditionalPortal on={true} to={deps.value50}>
                    {renderedObjects
                      .filter((entry?: Dynamic): Dynamic => entry.under)
                      .map((entry?: Dynamic): Dynamic => entry.node)}
                  </ConditionalPortal>
                  <ConditionalPortal on={true} to={deps.value46}>
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
export function renderImageCropEditor(deps: { readonly callback27: Dynamic; readonly callback30: Dynamic; readonly callback7: Dynamic; readonly value114: Dynamic; readonly value115: Dynamic; readonly value120: Dynamic; readonly value121: Dynamic; readonly value134: Dynamic; readonly value181: Dynamic }): Dynamic {
              let cropRect: Dynamic = deps.callback27(deps.value114) ?? deps.value121;
              return deps.callback7(
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
                    transform: deps.value114.rot
                      ? "rotate(" + String(deps.value114.rot) + "deg)"
                      : undefined,
                  }}
                >
                  <div
                    className={"absolute"}
                    style={{
                      left: deps.value114.edge.l,
                      top: deps.value114.edge.t,
                      width: deps.value114.local.w,
                      height: deps.value114.local.h,
                    }}
                  >
                    <ViewportScale>
                      {(viewportScale?: Dynamic): Dynamic => (
                        <MediaCropEditor
                          frame={{
                            w: deps.value114.local.w,
                            h: deps.value114.local.h,
                          }}
                          natural={deps.value114.natural}
                          crop={deps.value114.live}
                          scale={viewportScale}
                          rotation={(deps.value114.rot * Math.PI) / 180}
                          src={deps.value181(deps.value121.src)}
                          onLive={(liveCrop?: Dynamic): Dynamic =>
                            deps.value115(
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
                            deps.value115(
                              (cropState?: Dynamic): Dynamic =>
                                cropState && {
                                  ...cropState,
                                  live: frameChange.crop,
                                  local: frameChange.frame,
                                },
                            )
                          }
                          onDone={deps.value120}
                          onGesture={(isGesturing?: Dynamic): Dynamic => {
                            deps.value134("crop", isGesturing);
                            isGesturing && deps.callback30("crop");
                          }}
                        />
                      )}
                    </ViewportScale>
                  </div>
                </div>,
              );
            }

/** 选中单个批注且未处于绘制或放置工具时运行：在其旁渲染快捷操作条（形状的改色、删除、评论、裁剪、替换媒体、打开属性，或便签的文字样式操作）。 */
export function renderAnnotationQuickActions(deps: { readonly callback25: Dynamic; readonly callback28: Dynamic; readonly callback34: Dynamic; readonly callback44: Dynamic; readonly manifest: Dynamic; readonly onAnnotationCss: Dynamic; readonly onDeleteAnnotation: Dynamic; readonly onOpenPropsPanel: Dynamic; readonly onReplaceAnnotationMedia: Dynamic; readonly value112: Dynamic; readonly value114: Dynamic; readonly value120: Dynamic; readonly value15: Dynamic; readonly value162: Dynamic; readonly value17: Dynamic; readonly value18: Dynamic; readonly value181: Dynamic; readonly value21: Dynamic; readonly value59: Dynamic; readonly value8: Dynamic }): Dynamic {
            let annotation: Dynamic = (deps.manifest.annotations ?? []).find(
              (candidate?: Dynamic): Dynamic => candidate.id === deps.value59,
            );
            if (!annotation) return null;
            let isEditingText: Dynamic = deps.value112 === annotation.id;
            if (isEditingText && annotation.kind === "title1") return null;
            let annotationBounds: Dynamic = rotatedAnnotationBounds(
                annotation,
                deps.callback44(annotation),
              ),
              restyleNote: Dynamic = (textStyle?: Dynamic): Dynamic =>
                deps.callback34(
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
                belowSheet={deps.value15 === "sheet"}
              >
                {(anchorPosition?: Dynamic): Dynamic => (
                  <SessionStrip
                    data-testid={"mega-note-strip"}
                    data-mega-selection-strip={""}
                    aria-label={
                      isShapeAnnotation(annotation) ? (uiMessage("canvas.interactionLayer.shapeActions")) : (uiMessage("canvas.interactionLayer.noteActions"))
                    }
                    surface={"popover"}
                    wrap={deps.value17}
                    onKeyDown={handleQuickActionsArrowKeys}
                  >
                    {isShapeAnnotation(annotation) ? ((() => {
                          const _Component8 =
                            CanvasObjectQuickActions;
                          const _props8 = {
                            spec: annotation,
                            onRecolor: (color?: Dynamic): Dynamic =>
                              deps.callback34(
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
                              deps.value8 &&
                              ((commentPayload?: Dynamic): Dynamic =>
                                deps.value8(annotation.id, commentPayload)),
                            cropping: deps.value114?.id === annotation.id,
                            onCrop:
                              annotation.kind === "image"
                                ? (): Dynamic =>
                                    deps.value114
                                      ? deps.value120(true)
                                      : deps.callback28(annotation.id)
                                : undefined,
                            cropReason:
                              annotation.kind !== "image" || deps.value114
                                ? undefined
                                : deps.callback25(annotation.id)
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
                                    src: deps.value181(annotation.src) ?? undefined,
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
                                      deps.value21 && !deps.value18
                                        ? undefined
                                        : (): Dynamic => {
                                            deps.onOpenPropsPanel?.();
                                            deps.value162();
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
                                deps.value8 &&
                                ((commentPayload?: Dynamic): Dynamic =>
                                  deps.value8(annotation.id, commentPayload)),
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
                                deps.value8 &&
                                ((commentPayload?: Dynamic): Dynamic =>
                                  deps.value8(annotation.id, commentPayload)),
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
export function renderSelectionQuickActions(deps: { readonly crossFile: Dynamic; readonly elementSelection: Dynamic; readonly flag: Dynamic; readonly fullscreenBox: Dynamic; readonly fullscreenFile: Dynamic; readonly manifest: Dynamic; readonly quickProps: Dynamic; readonly seed: Dynamic; readonly tweakRows: Dynamic; readonly value140: Dynamic; readonly value15: Dynamic; readonly value16: Dynamic; readonly value162: Dynamic; readonly value163: Dynamic; readonly value164: Dynamic; readonly value165: Dynamic; readonly value166: Dynamic; readonly value167: Dynamic; readonly value168: Dynamic; readonly value169: Dynamic; readonly value17: Dynamic; readonly value170: Dynamic; readonly value171: Dynamic; readonly value172: Dynamic; readonly value7: Dynamic }): Dynamic {
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
              anchorY: Dynamic = Math.max(0, Math.min(artboard.h, rect.y)),
              tweakRowOffset: Dynamic =
                artboard.file === deps.fullscreenFile &&
                deps.fullscreenBox &&
                deps.flag &&
                deps.tweakRows?.[artboard.file]
                  ? artboardTweaksRowHeight
                  : 0;
            return (
              <CanvasAnchoredPopover
                x={artboard.x + anchorX}
                y={artboard.y + anchorY}
                dy={tweakRowOffset}
                belowSheet={deps.value15 === "sheet"}
              >
                {(anchorPosition?: Dynamic): Dynamic => (
                  <SessionStrip
                    data-mega-selection-strip={""}
                    aria-label={uiMessage("canvas.interactionLayer.selectionActions")}
                    surface={"popover"}
                    wrap={deps.value17}
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
                        onEditText: deps.quickProps?.onEditText ? deps.value166 : null,
                        crossFile: deps.crossFile ?? null,
                        sidebarVisible: false,
                        onOpenProps: deps.value162,
                        onApply: deps.value163,
                        onGesture: deps.value164,
                        textEdit: deps.value140,
                        onReplaceImage: deps.quickProps?.onReplaceImage
                          ? deps.value167
                          : undefined,
                        onCrop: deps.quickProps?.onCrop ? deps.value168 : undefined,
                        cropping: deps.quickProps?.cropping,
                        cropReason: deps.quickProps?.cropReason,
                        onReplaceVideo: deps.quickProps?.onReplaceVideo
                          ? deps.value169
                          : undefined,
                        findVideo: deps.quickProps?.findVideo
                          ? deps.value170
                          : undefined,
                        onElementLink: deps.quickProps?.onElementLink
                          ? deps.value171
                          : undefined,
                        contrastRef: deps.quickProps?.contrastRef,
                        coarse: deps.value16,
                        compact: deps.value17,
                        onFormat: deps.value165,
                        onComment: deps.value7 ? deps.value172 : undefined,
                      } as const;
                      const selectionActionsKey = deps.elementSelection.identity;
                      return <SelectionActionsView key={selectionActionsKey} {...selectionActionsProps} />;
                    })()}
                  </SessionStrip>
                )}
              </CanvasAnchoredPopover>
            );
          }
