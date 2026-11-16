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
import { PlatformFileContentConstant_20 } from "../../platform/file-content";
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
              let value250: Dynamic = (deps.manifest.annotations ?? []).map(
                (source?: Dynamic): Dynamic => {
                  let value251: Dynamic = (0, isShapeAnnotation)(
                    source,
                  )
                    ? (() => {
                        const _Component2 = CanvasShape;
                        const _props2 = {
                          spec:
                            deps.value114?.id === source.id &&
                            source.kind === "image"
                              ? (0, updateAnnotationCrop)(
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
                            (0, supportsClickPlacement)(deps.armedTool) ||
                            deps.armedTool === "draw",
                          commenting: deps.value126,
                          selected: deps.selectedNotes.has(source.id),
                          grouped: deps.value232,
                          objectPress: deps.callback55(source),
                          onChange: (
                            input?: Dynamic,
                            options2?: Dynamic,
                          ): Dynamic =>
                            deps.callback34(
                              source.id,
                              (input2?: Dynamic): Dynamic =>
                                (0, isShapeAnnotation)(input2)
                                  ? {
                                      ...input2,
                                      ...input,
                                    }
                                  : input2,
                              options2,
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
                        const _key2 = source.id;
                        return <_Component2 key={_key2} {..._props2} />;
                      })()
                    : (() => {
                        const _Component3 = CanvasNote;
                        const _props3 = {
                          spec: source,
                          editing: deps.value18,
                          commenting: deps.value126,
                          selected: deps.selectedNotes.has(source.id),
                          grouped: deps.value232,
                          objectPress: deps.callback55(source),
                          onChange: (
                            input?: Dynamic,
                            options2?: Dynamic,
                          ): Dynamic =>
                            deps.callback34(
                              source.id,
                              (input2?: Dynamic): Dynamic =>
                                (0, isShapeAnnotation)(input2)
                                  ? input2
                                  : {
                                      ...input2,
                                      ...input,
                                    },
                              options2,
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
                          onTextEditing: (input?: Dynamic): Dynamic =>
                            deps.value113(
                              (input2?: Dynamic): Dynamic =>
                                input
                                  ? source.id
                                  : input2 === source.id
                                    ? null
                                    : input2,
                            ),
                          autoEdit:
                            source.text === "" && deps.value59 === source.id,
                          onMeasure: (input?: Dynamic): Dynamic =>
                            deps.value11(
                              (input2?: Dynamic): Dynamic =>
                                input2[source.id]?.w === input.w &&
                                input2[source.id]?.h === input.h
                                  ? input2
                                  : {
                                      ...input2,
                                      [source.id]: input,
                                    },
                            ),
                        } as const;
                        const _key3 = source.id;
                        return <_Component3 key={_key3} {..._props3} />;
                      })();
                  return {
                    under: deps.callback6(source),
                    node: deps.value35
                      ? (() => {
                          const _Component4 = "div";
                          const _props4 = {
                            ref: deps.callback5,
                            className: "absolute left-0 top-0 h-0 w-0",
                            style: {
                              transformOrigin: "0 0",
                            },
                            children: value251,
                          } as const;
                          const _key4 = source.id;
                          return <_Component4 key={_key4} {..._props4} />;
                        })()
                      : value251,
                  };
                },
              );
              return deps.value35 ? (
                <jsx_Nn.Fragment>
                  <ConditionalPortal on={true} to={deps.value50}>
                    {value250
                      .filter((input?: Dynamic): Dynamic => input.under)
                      .map((input?: Dynamic): Dynamic => input.node)}
                  </ConditionalPortal>
                  <ConditionalPortal on={true} to={deps.value46}>
                    {value250
                      .filter((input?: Dynamic): Dynamic => !input.under)
                      .map((input?: Dynamic): Dynamic => input.node)}
                  </ConditionalPortal>
                </jsx_Nn.Fragment>
              ) : (
                value250.map((input?: Dynamic): Dynamic => input.node)
              );
            }

/** 图片形状进入裁剪时运行：在图片上方渲染裁剪编辑器，换算画框位置与旋转并支持吸附，完成或实时变化时更新形状的裁剪数据。 */
export function renderImageCropEditor(deps: { readonly callback27: Dynamic; readonly callback30: Dynamic; readonly callback7: Dynamic; readonly value114: Dynamic; readonly value115: Dynamic; readonly value120: Dynamic; readonly value121: Dynamic; readonly value134: Dynamic; readonly value181: Dynamic }): Dynamic {
              let value250: Dynamic = deps.callback27(deps.value114) ?? deps.value121;
              return deps.callback7(
                "crop",
                <div
                  data-mega-chrome={"crop"}
                  data-testid={"mega-crop"}
                  className={"pointer-events-none absolute z-30"}
                  style={{
                    ...PickerRuntimeScriptTAppAccentConfig,
                    left: value250.x,
                    top: value250.y,
                    width: value250.w,
                    height: value250.h,
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
                      {(input?: Dynamic): Dynamic => (
                        <MediaCropEditor
                          frame={{
                            w: deps.value114.local.w,
                            h: deps.value114.local.h,
                          }}
                          natural={deps.value114.natural}
                          crop={deps.value114.live}
                          scale={input}
                          rotation={(deps.value114.rot * Math.PI) / 180}
                          src={deps.value181(deps.value121.src)}
                          onLive={(input2?: Dynamic): Dynamic =>
                            deps.value115(
                              (input3?: Dynamic): Dynamic =>
                                input3 && {
                                  ...input3,
                                  live: input2,
                                },
                            )
                          }
                          minFrame={PlatformFileContentConstant_20}
                          snapFrame={(input2?: Dynamic): Dynamic => {
                            let [items, items2, items3, items4]: Dynamic = [
                              Math.round(input2.x),
                              Math.round(input2.y),
                              Math.round(input2.x + input2.w),
                              Math.round(input2.y + input2.h),
                            ];
                            return {
                              x: items,
                              y: items2,
                              w: Math.max(
                                PlatformFileContentConstant_20,
                                items3 - items,
                              ),
                              h: Math.max(
                                PlatformFileContentConstant_20,
                                items4 - items2,
                              ),
                            };
                          }}
                          onFrame={(input2?: Dynamic): Dynamic =>
                            deps.value115(
                              (input3?: Dynamic): Dynamic =>
                                input3 && {
                                  ...input3,
                                  live: input2.crop,
                                  local: input2.frame,
                                },
                            )
                          }
                          onDone={deps.value120}
                          onGesture={(input2?: Dynamic): Dynamic => {
                            deps.value134("crop", input2);
                            input2 && deps.callback30("crop");
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
            let value250: Dynamic = (deps.manifest.annotations ?? []).find(
              (input?: Dynamic): Dynamic => input.id === deps.value59,
            );
            if (!value250) return null;
            let value251: Dynamic = deps.value112 === value250.id;
            if (value251 && value250.kind === "title1") return null;
            let value252: Dynamic = (0, rotatedAnnotationBounds)(
                value250,
                deps.callback44(value250),
              ),
              callback61: Dynamic = (input?: Dynamic): Dynamic =>
                deps.callback34(
                  value250.id,
                  (input2?: Dynamic): Dynamic =>
                    (0, isShapeAnnotation)(input2)
                      ? input2
                      : (0, updateAnnotationTextStyle)(input2, input),
                  true,
                );
            return (
              <CanvasAnchoredPopover
                x={value252.x + value252.w / 2}
                y={value252.y}
                belowSheet={deps.value15 === "sheet"}
              >
                {(input?: Dynamic): Dynamic => (
                  <SessionStrip
                    data-testid={"mega-note-strip"}
                    data-mega-selection-strip={""}
                    aria-label={
                      (0, isShapeAnnotation)(value250) ? (uiMessage("canvas.interactionLayer.shapeActions")) : (uiMessage("canvas.interactionLayer.noteActions"))
                    }
                    surface={"popover"}
                    wrap={deps.value17}
                    onKeyDown={handleQuickActionsArrowKeys}
                  >
                    {(0, isShapeAnnotation)(value250) ? ((() => {
                          const _Component8 =
                            CanvasObjectQuickActions;
                          const _props8 = {
                            spec: value250,
                            onRecolor: (input2?: Dynamic): Dynamic =>
                              deps.callback34(
                                value250.id,
                                (input3?: Dynamic): Dynamic =>
                                  (0, isShapeAnnotation)(input3)
                                    ? (0, updateShapeColor)(
                                        input3,
                                        input2,
                                      )
                                    : input3,
                                true,
                              ),
                            onDelete: (): Dynamic =>
                              deps.onDeleteAnnotation?.(value250.id),
                            onComment:
                              deps.value8 &&
                              ((input2?: Dynamic): Dynamic =>
                                deps.value8(value250.id, input2)),
                            cropping: deps.value114?.id === value250.id,
                            onCrop:
                              value250.kind === "image"
                                ? (): Dynamic =>
                                    deps.value114
                                      ? deps.value120(true)
                                      : deps.callback28(value250.id)
                                : undefined,
                            cropReason:
                              value250.kind !== "image" || deps.value114
                                ? undefined
                                : deps.callback25(value250.id)
                                  ? (0, imageFlipCss)(value250)
                                    ? CropDoesNotWorkWhileThisMessage
                                    : undefined
                                  : uiMessage("canvas.interactionLayer.thisPictureHasNotLoaded"),
                            clip:
                              value250.kind === "image" &&
                              value250.video !== undefined &&
                              deps.onAnnotationCss &&
                              deps.onReplaceAnnotationMedia
                                ? {
                                    src: deps.value181(value250.src) ?? undefined,
                                    onCss: (
                                      input2?: Dynamic,
                                      options2?: Dynamic,
                                    ): Dynamic =>
                                      deps.onAnnotationCss(
                                        value250.id,
                                        input2,
                                        options2,
                                      ),
                                    onReplace: (input2?: Dynamic): Dynamic =>
                                      deps.onReplaceAnnotationMedia(
                                        value250.id,
                                        input2,
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
                            value250.id +
                            "@" +
                            [input, value252.x, value252.y, value252.w].join(
                              ",",
                            );
                          return <_Component8 key={_key8} {..._props8} />;
                        })()) : (value251 ? ((() => {
                            const _Component9 =
                              EditingNoteQuickActions;
                            const _props9 = {
                              spec: value250,
                              onRestyle: callback61,
                              onComment:
                                deps.value8 &&
                                ((input2?: Dynamic): Dynamic =>
                                  deps.value8(value250.id, input2)),
                            } as const;
                            const _key9 =
                              value250.id +
                              "@" +
                              [
                                input,
                                value250.x,
                                value250.y,
                                value250.w,
                              ].join(",");
                            return <_Component9 key={_key9} {..._props9} />;
                          })()) : ((() => {
                            const _Component0 = NoteQuickActions;
                            const _props0 = {
                              spec: value250,
                              onRestyle: callback61,
                              onDelete: (): Dynamic =>
                                deps.onDeleteAnnotation?.(value250.id),
                              onComment:
                                deps.value8 &&
                                ((input2?: Dynamic): Dynamic =>
                                  deps.value8(value250.id, input2)),
                            } as const;
                            const _key0 =
                              value250.id +
                              "@" +
                              [
                                input,
                                value250.x,
                                value250.y,
                                value250.w,
                              ].join(",");
                            return <_Component0 key={_key0} {..._props0} />;
                          })()))}
                  </SessionStrip>
                )}
              </CanvasAnchoredPopover>
            );
          }

/** 选中画板内元素且需要显示快捷操作时运行：在选中区域旁渲染快捷操作条（编辑文字、替换图片或视频、裁剪、链接、格式、评论、打开属性等）。 */
export function renderSelectionQuickActions(deps: { readonly crossFile: Dynamic; readonly elementSelection: Dynamic; readonly flag: Dynamic; readonly fullscreenBox: Dynamic; readonly fullscreenFile: Dynamic; readonly manifest: Dynamic; readonly quickProps: Dynamic; readonly seed: Dynamic; readonly tweakRows: Dynamic; readonly value140: Dynamic; readonly value15: Dynamic; readonly value16: Dynamic; readonly value162: Dynamic; readonly value163: Dynamic; readonly value164: Dynamic; readonly value165: Dynamic; readonly value166: Dynamic; readonly value167: Dynamic; readonly value168: Dynamic; readonly value169: Dynamic; readonly value17: Dynamic; readonly value170: Dynamic; readonly value171: Dynamic; readonly value172: Dynamic; readonly value7: Dynamic }): Dynamic {
            let value250: Dynamic = deps.manifest.artboards.find(
              (input?: Dynamic): Dynamic =>
                input.file === deps.elementSelection.file,
            );
            if (!value250) return null;
            let rect: Dynamic = deps.elementSelection.rect,
              value251: Dynamic = Math.max(
                0,
                Math.min(value250.w, rect.x + rect.w / 2),
              ),
              value252: Dynamic = Math.max(0, Math.min(value250.h, rect.y)),
              value253: Dynamic =
                value250.file === deps.fullscreenFile &&
                deps.fullscreenBox &&
                deps.flag &&
                deps.tweakRows?.[value250.file]
                  ? artboardTweaksRowHeight
                  : 0;
            return (
              <CanvasAnchoredPopover
                x={value250.x + value251}
                y={value250.y + value252}
                dy={value253}
                belowSheet={deps.value15 === "sheet"}
              >
                {(input?: Dynamic): Dynamic => (
                  <SessionStrip
                    data-mega-selection-strip={""}
                    aria-label={uiMessage("canvas.interactionLayer.selectionActions")}
                    surface={"popover"}
                    wrap={deps.value17}
                    onKeyDown={handleQuickActionsArrowKeys}
                  >
                    {(() => {
                      const _Component1 =
                        PositionedSelectionQuickActions;
                      const _props1 = {
                        at: input,
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
                      const _key1 = deps.elementSelection.identity;
                      return <_Component1 key={_key1} {..._props1} />;
                    })()}
                  </SessionStrip>
                )}
              </CanvasAnchoredPopover>
            );
          }
