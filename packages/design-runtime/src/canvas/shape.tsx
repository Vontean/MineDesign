import { uiMessage } from '@minedesign/contracts/ui-messages';
import { useUiLocale } from '../ui-locale.ts';
/** Restored application module; prepare first, initialize in original order. */
import {
  type Dynamic,
} from "../runtime-types";
import { annotationColor, annotationCssStyle, annotationEffectsCss, annotationFillDefaults, annotationFillSignature, annotationPathViewBox, AnnotationShapeBody, annotationStrokeWidth, CanvasAnnotationShapeStyleConstant, CanvasAnnotationShapeStyleConstant_2, CanvasAnnotationShapeStyleConstant_3, CanvasAnnotationShapeStyleMatches, jsxCanvasAnnotationShapeStyle } from "./annotation-shape-style";
import { beginArtboardResize } from "./artboard-resize";
import { scheduleImageDecode, watchPointerRelease } from "./image-decode-scheduler";
import { useViewportStore, ViewportScale } from "./viewport-store";
import { SelectionPoints, SelectionRing } from "../cds/components/selection-ring";
import { initializeNpm_usehooks_ts_p0, load_react, load_react_dom } from "../dependencies";
import { joinClassNames } from "../editor/chrome/overlay-state";
import { imageFlipCss } from "../editor/geometry/flip-annotations";
import { angleBetweenPoints, resizeRotatedRect, snapRotation } from "../editor/geometry/rotation";
import { activeResizeGuides, snapResize } from "../editor/geometry/snapping";
import { reactHooksLatestCallback_2 } from "../editor/hooks/latest-callback";
import { imageCropCss } from "../editor/media/crop-geometry";
import { createVideoPlaybackStore } from "../editor/media/video-playback";
import { MediaVideoUploadAutoPlayLoopMutedConfig } from "../editor/media/video-upload";
import { PickerRuntimeScriptTAppAccentConfig } from "../editor/picker/runtime-script";
import { shortenLineEnds, SvgArrowsConstant_2, SvgArrowsFilledOpenConfig, SvgArrowsRefX } from "../editor/svg/arrows";
import { constrainLineAngle } from "../editor/svg/drawing";
import { AnnotationPenEditor } from "../editor/vector/annotation-pen-editor";
import { toModuleNamespace } from "../module-helpers";
import { initializePlatformCdsIsland } from "../platform/cds-island";
import { annotationArrowHeads, annotationBounds, annotationRotation, PlatformFileContentConstant_19, PlatformFileContentConstant_20, PlatformFileContentLimit_6 } from "../platform/file-content";
import { PreviewBlobPathsResolvedValue } from "../preview/blob-paths";

var CanvasShapeX: Dynamic;
var reactCanvasShape: Dynamic;
var reactDomCanvasShape: Dynamic;
var reactCanvasShape_2: Dynamic;
var reactDomCanvasShape_2: Dynamic;
function CanvasShape({
  spec: spec,
  scale: scale,
  editing: editing,
  inert = false,
  commenting = false,
  selected: selected,
  grouped = false,
  objectPress: objectPress,
  onChange: onChange,
  onGesture: onGesture,
  armWindowGestureEnd: armWindowGestureEnd,
  resolveImageSrc: resolveImageSrc,
  snapLines: snapLines,
  onSnapGuides: onSnapGuides,
  cropping = false,
  onCropStart: onCropStart,
  onPictureLoad: onPictureLoad,
  vectorEdit = false,
  onEditPoints: onEditPoints,
}: Dynamic): Dynamic {
  useUiLocale();
  let value: Dynamic = (0, annotationBounds)(spec),
    value2: Dynamic =
      spec.kind === "line" || spec.kind === "arrow" ? spec : null,
    value3: Dynamic = value2
      ? (0, annotationArrowHeads)(value2)
      : null,
    value4: Dynamic =
      !value2 || !value3
        ? null
        : (0, shortenLineEnds)(
            value2.x,
            value2.y,
            value2.x2,
            value2.y2,
            (0, SvgArrowsRefX)(value3.start) *
              (0, annotationStrokeWidth)(
                value2.css,
                CanvasAnnotationShapeStyleConstant_2,
              ),
            (0, SvgArrowsRefX)(value3.end) *
              (0, annotationStrokeWidth)(
                value2.css,
                CanvasAnnotationShapeStyleConstant_2,
              ),
          ),
    callback: Dynamic = (input?: Dynamic): Dynamic =>
      (input === "start" ? "mega-shape-start-head-" : "mega-shape-head-") +
      spec.id,
    value5: Dynamic =
      spec.kind === "rect" || spec.kind === "oval" ? spec : null,
    value6: Dynamic = spec.kind === "pen" ? spec : null,
    value7: Dynamic = spec.kind === "image" ? spec : null,
    [value8, value9]: Dynamic = (0,
    reactHooksLatestCallback_2.useState)(null),
    value10: Dynamic = value7
      ? (resolveImageSrc?.(value7.src) ?? null)
      : null,
    value11: Dynamic =
      value10 !== null && value10 === value8 ? null : value10,
    value12: Dynamic =
      value7?.video === undefined
        ? null
        : (resolveImageSrc?.(value7.video) ?? null),
    [value13, value14]: Dynamic = (0,
    reactHooksLatestCallback_2.useState)(null),
    value15: Dynamic = (0, reactHooksLatestCallback_2.useRef)(null),
    [value16, value17]: Dynamic = (0,
    reactHooksLatestCallback_2.useState)(false);
  (0, reactHooksLatestCallback_2.useEffect)((): Dynamic => {
    let value41: Dynamic = value12 === null ? null : value15.current;
    if (!value41) return;
    if (typeof IntersectionObserver === "undefined") {
      value17(true);
      return;
    }
    let value42: Dynamic = new IntersectionObserver(
      (items?: Dynamic): Dynamic => {
        let value43: Dynamic = items[items.length - 1];
        value43 && value17(value43.isIntersecting);
      },
    );
    value42.observe(value41);
    return (): Dynamic => value42.disconnect();
  }, [value12]);
  let [value18, value19]: Dynamic = (0,
    reactHooksLatestCallback_2.useState)(false),
    value20: Dynamic = value12 !== null && value12 !== value13 && value16;
  (0, reactHooksLatestCallback_2.useEffect)((): Dynamic => {
    if (!value20) return;
    let value41: Dynamic = (0, scheduleImageDecode)(
      spec.id,
      (): Dynamic => value19(true),
    );
    return (): Dynamic => {
      value41();
      value19(false);
    };
  }, [value20, spec.id]);
  let value21: Dynamic = value20 && value18,
    value22: Dynamic = (0, reactHooksLatestCallback_2.useRef)(null),
    value23: Dynamic = (0, reactHooksLatestCallback_2.useRef)(null),
    value24: Dynamic = (0, reactHooksLatestCallback_2.useRef)(null);
  (0, reactHooksLatestCallback_2.useEffect)((): Dynamic => {
    let value41: Dynamic = value21 ? value22.current : null;
    if (!value41) return;
    let value42: Dynamic = (0, createVideoPlaybackStore)(value41);
    value23.current = value42;
    return (): Dynamic => {
      value42.detach();
      value23.current = null;
      value41.isConnected ||
        (value41.pause(), value41.removeAttribute("src"), value41.load());
    };
  }, [value21, value12]);
  let value25: Dynamic = value6?.d,
    value26: Dynamic = (0, reactHooksLatestCallback_2.useMemo)(
      (): Dynamic =>
        value25 === undefined
          ? null
          : (0, annotationPathViewBox)(value25),
      [value25],
    ),
    value27: Dynamic = (0, annotationColor)(
      spec.kind,
      spec.color ?? "default",
    ),
    value28: Dynamic = editing && !inert && !cropping,
    value29: Dynamic =
      commenting && !value28
        ? {
            pointerEvents: "auto",
          }
        : undefined,
    value30: Dynamic = editing ? objectPress : {},
    value31: Dynamic = (0, useViewportStore)(),
    value32: Dynamic = (0, annotationRotation)(spec),
    value33: Dynamic = value32
      ? {
          transform: "rotate(" + String(value32) + "deg)",
        }
      : undefined,
    value34: Dynamic = value32
      ? {
          transform: "rotate(" + String(-value32) + "deg)",
        }
      : undefined,
    value35: Dynamic = value32 ? (value32 * Math.PI) / 180 : undefined,
    value36: Dynamic = (0, imageFlipCss)(spec),
    value37: Dynamic = vectorEdit && value6 !== null && !grouped && !value32,
    [value38, value39]: Dynamic = (0,
    reactHooksLatestCallback_2.useState)(null),
    callback2: Dynamic = (input?: Dynamic, options?: Dynamic): Dynamic => {
      let ancestor: Dynamic = options.currentTarget.closest(
        "[data-mega-annotation]",
      );
      if (!ancestor) return;
      let bounds: Dynamic = ancestor.getBoundingClientRect(),
        [items, items2]: Dynamic = [
          bounds.left + bounds.width / 2,
          bounds.top + bounds.height / 2,
        ],
        [items3, items4]: Dynamic = [
          value32,
          (0, angleBetweenPoints)(
            items,
            items2,
            options.clientX,
            options.clientY,
          ),
        ];
      callback3(
        options,
        "ann-resize",
        (
          input2?: Dynamic,
          options2?: Dynamic,
          context?: Dynamic,
        ): Dynamic => {
          let value41: Dynamic = (0, snapRotation)(
            items3 +
              (0, angleBetweenPoints)(
                items,
                items2,
                context.clientX,
                context.clientY,
              ) -
              items4,
            context.shiftKey,
          );
          value39(value41);
          return {
            rotate: value41,
          };
        },
        {
          rotate: items3,
        },
        (): Dynamic => value39(null),
      );
    },
    value40: Dynamic = (0, reactHooksLatestCallback_2.useRef)(
      editing,
    );
  value40.current = editing;
  let callback3: Dynamic = (
    input?: Dynamic,
    options?: Dynamic,
    context?: Dynamic,
    value41?: Dynamic,
    extra?: Dynamic,
  ): Dynamic =>
    (0, beginArtboardResize)(input, {
      src: options,
      scale: value31.get().scale,
      onGesture: onGesture,
      armWindowGestureEnd: armWindowGestureEnd,
      patchAt: context,
      onChange: onChange,
      restore: value41,
      onEnd: extra,
      sound: (): Dynamic => value40.current,
    });
  return (
    <div
      ref={value15}
      data-clip-failed={
        value12 !== null && value12 === value13 ? "" : undefined
      }
      data-mega-chrome={"annotation"}
      data-mega-annotation={spec.id}
      data-testid={"mega-annotation-" + spec.id}
      data-shape-kind={spec.kind}
      className={"pointer-events-none absolute"}
      style={{
        left: value.x,
        top: value.y,
        width: value.w,
        height: value.h,
        ...value33,
      }}
      onDoubleClick={
        value6 && value28 && onEditPoints && !value32
          ? (input?: Dynamic): Dynamic => {
              input.stopPropagation();
              onEditPoints();
            }
          : undefined
      }
    >
      {value5 && ((() => {
          const _Component = "div";
          const _props = {
            "data-testid": "mega-shape-body-" + spec.id,
            className: (0, joinClassNames)(
              "absolute inset-0 box-border",
              value28 && "pointer-events-auto cursor-grab",
            ),
            style: {
              ...(0, annotationFillDefaults)(
                value5.css,
                value27,
                value5.kind === "oval",
              ),
              ...(0, annotationCssStyle)(value5.css),
              ...(value5.kind === "oval"
                ? {
                    borderRadius: "50%",
                  }
                : {}),
              ...value36,
              ...value29,
            },
            ...value30,
          } as const;
          const _key = (0, annotationFillSignature)(
            value5.css,
            value5.kind === "oval",
          );
          return <_Component key={_key} {..._props} />;
        })())}
      {value7 && value21 && (<AnnotationShapeBody
          on={value7.crop !== undefined}
          id={spec.id}
          css={value7.css}
          mirror={value36}
        >
          <video
            ref={value22}
            data-testid={
              value7.crop !== undefined
                ? undefined
                : "mega-shape-body-" + spec.id
            }
            data-mega-picture={""}
            data-mega-video={""}
            src={value12}
            poster={value11 ?? undefined}
            onLoadedMetadata={onPictureLoad}
            {...MediaVideoUploadAutoPlayLoopMutedConfig}
            autoPlay={!(0, CanvasAnnotationShapeStyleMatches)()}
            disablePictureInPicture={true}
            disableRemotePlayback={true}
            aria-label={value7.alt}
            draggable={false}
            onError={(): Dynamic => value14(value12)}
            className={(0, joinClassNames)(
              "absolute inset-0 box-border block h-full w-full select-none",
              value28
                ? "pointer-events-auto cursor-grab"
                : !editing && "pointer-events-auto cursor-pointer",
            )}
            style={{
              ...(value7.crop !== undefined
                ? (0, imageCropCss)(value7.crop)
                : {
                    objectFit: "fill",
                    ...(0, annotationCssStyle)(value7.css),
                  }),
              ...value29,
            }}
            onDoubleClick={value28 ? onCropStart : undefined}
            {...value30}
            onPointerDown={(event?: Dynamic): Dynamic => {
              let value41: Dynamic =
                event.button === 0 &&
                !event.shiftKey &&
                !event.altKey &&
                !event.metaKey &&
                !event.ctrlKey;
              if (!editing) {
                value41 &&
                  (0, watchPointerRelease)(
                    event.nativeEvent,
                    (): Dynamic => value23.current?.toggle(),
                  );
                return;
              }
              value24.current =
                value41 && !grouped
                  ? {
                      x: event.clientX,
                      y: event.clientY,
                      wasSelected: selected,
                    }
                  : null;
              value30.onPointerDown?.(event);
            }}
            onClick={(input?: Dynamic): Dynamic => {
              let current: Dynamic = value24.current;
              value24.current = null;
              !(
                !current ||
                !value28 ||
                !current.wasSelected ||
                input.detail > 1 ||
                Math.hypot(
                  input.clientX - current.x,
                  input.clientY - current.y,
                ) > 4
              ) && value23.current?.toggle();
            }}
          />
        </AnnotationShapeBody>)}
      {value7 && !value21 && value7.crop !== undefined && value11 !== null ? (<div
          data-testid={"mega-shape-body-" + spec.id}
          className={(0, joinClassNames)(
            "absolute inset-0 box-border overflow-hidden",
            value28 && "pointer-events-auto cursor-grab",
          )}
          style={{
            ...(0, annotationCssStyle)(value7.css),
            ...value36,
            ...value29,
          }}
          onDoubleClick={value28 ? onCropStart : undefined}
          {...value30}
        >
          <img
            data-mega-picture={""}
            src={value11}
            alt={value7.alt ?? ""}
            draggable={false}
            onLoad={onPictureLoad}
            onError={(): Dynamic => value9(value11)}
            className={"block select-none"}
            style={(0, imageCropCss)(value7.crop)}
          />
        </div>) : (value7 &&
        !value21 && (<img
            data-testid={"mega-shape-body-" + spec.id}
            data-mega-picture={value11 === null ? "placeholder" : ""}
            src={value11 ?? PreviewBlobPathsResolvedValue}
            alt={value7.alt ?? ""}
            draggable={false}
            onLoad={onPictureLoad}
            onError={(): Dynamic => {
              value10 !== null && value9(value10);
            }}
            className={(0, joinClassNames)(
              "absolute inset-0 box-border block h-full w-full select-none",
              value28 && "pointer-events-auto cursor-grab",
            )}
            style={{
              objectFit: "fill",
              background:
                value11 === null &&
                value7.css?.["background-color"] === undefined
                  ? "#e8e6e1"
                  : undefined,
              ...(0, annotationCssStyle)(value7.css),
              ...value36,
              ...value29,
            }}
            onDoubleClick={
              value28 && value11 !== null ? onCropStart : undefined
            }
            {...value30}
          />))}
      {value2 && (<svg
          data-testid={"mega-shape-svg-" + spec.id}
          className={"pointer-events-none absolute"}
          style={{
            left: -CanvasAnnotationShapeStyleConstant_3,
            top: -CanvasAnnotationShapeStyleConstant_3,
            overflow: "visible",
            ...(0, annotationEffectsCss)(value2.css),
          }}
          width={value.w + 2 * CanvasAnnotationShapeStyleConstant_3}
          height={value.h + 2 * CanvasAnnotationShapeStyleConstant_3}
        >
          {value3 && (value3.start !== "none" || value3.end !== "none") && (<defs>
              {["start", "end"].map((input?: Dynamic): Dynamic => {
                let value41: Dynamic = value3[input];
                return value41 === "none" ? null : (
                  <marker
                    key={input}
                    id={callback(input)}
                    orient={input === "start" ? "auto-start-reverse" : "auto"}
                    markerWidth={"5"}
                    markerHeight={"5"}
                    refX={SvgArrowsFilledOpenConfig[value41].refX}
                    refY={SvgArrowsConstant_2}
                    overflow={"visible"}
                  >
                    <path
                      d={SvgArrowsFilledOpenConfig[value41].d}
                      stroke={"none"}
                      style={{
                        fill: value2.css?.stroke ?? value27,
                      }}
                    />
                  </marker>
                );
              })}
            </defs>)}
          <line
            x1={
              (value4?.sx ?? value2.x) -
              value.x +
              CanvasAnnotationShapeStyleConstant_3
            }
            y1={
              (value4?.sy ?? value2.y) -
              value.y +
              CanvasAnnotationShapeStyleConstant_3
            }
            x2={
              (value4?.ex ?? value2.x2) -
              value.x +
              CanvasAnnotationShapeStyleConstant_3
            }
            y2={
              (value4?.ey ?? value2.y2) -
              value.y +
              CanvasAnnotationShapeStyleConstant_3
            }
            stroke={value2.css?.stroke ?? value27}
            strokeWidth={(0, annotationStrokeWidth)(
              value2.css,
              CanvasAnnotationShapeStyleConstant_2,
            )}
            strokeLinecap={"round"}
            markerStart={
              value3 && value3.start !== "none"
                ? "url(#" + callback("start") + ")"
                : undefined
            }
            markerEnd={
              value3 && value3.end !== "none"
                ? "url(#" + callback("end") + ")"
                : undefined
            }
          />
          <line
            data-testid={"mega-shape-body-" + spec.id}
            x1={
              value2.x -
              value.x +
              CanvasAnnotationShapeStyleConstant_3
            }
            y1={
              value2.y -
              value.y +
              CanvasAnnotationShapeStyleConstant_3
            }
            x2={
              value2.x2 -
              value.x +
              CanvasAnnotationShapeStyleConstant_3
            }
            y2={
              value2.y2 -
              value.y +
              CanvasAnnotationShapeStyleConstant_3
            }
            stroke={"transparent"}
            strokeWidth={Math.max(
              CanvasAnnotationShapeStyleConstant_2 + 8,
              16 / scale,
            )}
            strokeLinecap={"round"}
            className={(0, joinClassNames)(value28 && "cursor-grab")}
            style={{
              pointerEvents: value28 || commenting ? "stroke" : "none",
            }}
            {...value30}
          />
        </svg>)}
      {value6 && value26 && (<svg
          data-testid={"mega-shape-svg-" + spec.id}
          className={"pointer-events-none absolute inset-0"}
          style={{
            overflow: "visible",
            ...(0, annotationEffectsCss)(value6.css),
          }}
          width={value.w}
          height={value.h}
          viewBox={"0 0 " + String(value26.w) + " " + String(value26.h)}
          preserveAspectRatio={"none"}
        >
          <path
            d={value6.d}
            fill={"none"}
            stroke={value6.css?.stroke ?? value27}
            strokeWidth={(0, annotationStrokeWidth)(
              value6.css,
              CanvasAnnotationShapeStyleConstant,
            )}
            strokeLinecap={"round"}
            strokeLinejoin={"round"}
            vectorEffect={"non-scaling-stroke"}
          />
          <path
            data-testid={"mega-shape-body-" + spec.id}
            d={value6.d}
            fill={"none"}
            stroke={"transparent"}
            strokeWidth={Math.max(12, 16 / scale)}
            strokeLinecap={"round"}
            strokeLinejoin={"round"}
            vectorEffect={"non-scaling-stroke"}
            className={(0, joinClassNames)(value28 && "cursor-grab")}
            style={{
              pointerEvents: value28 || commenting ? "stroke" : "none",
            }}
            {...value30}
          />
        </svg>)}
      {value28 && selected && (<ViewportScale>
          {(input?: Dynamic): Dynamic => (
            <jsxCanvasAnnotationShapeStyle.Fragment>
              {value37 && value6 && value26 && (<div
                  data-mega-chrome={"annotation-resize"}
                  className={"pointer-events-none absolute left-0 top-0"}
                  style={{
                    ...PickerRuntimeScriptTAppAccentConfig,
                    transform: `scale(${String(1 / input)})`,
                    transformOrigin: "0 0",
                  }}
                >
                  <AnnotationPenEditor
                    spec={value6}
                    ext={value26}
                    scale={input}
                    onChange={onChange}
                    onGesture={onGesture}
                    armWindowGestureEnd={armWindowGestureEnd}
                  />
                </div>)}
              {(value5 ?? (value37 ? null : value6) ?? value7) ||
                grouped && (<div
                  data-mega-chrome={"annotation-resize"}
                  data-testid={"mega-annotation-resize-" + spec.id}
                  data-grouped={grouped ? "" : undefined}
                  className={"pointer-events-none absolute inset-0"}
                  style={value34}
                >
                  <SelectionRing
                    frame={{
                      x: 0,
                      y: 0,
                      w: value.w,
                      h: value.h,
                    }}
                    scale={input}
                    rotation={value35}
                    state={grouped ? "member" : "selected"}
                    grips={grouped ? "none" : "corners"}
                    edgeStrips={!value7}
                    onResizeStart={(
                      input2?: Dynamic,
                      options?: Dynamic,
                    ): Dynamic => {
                      let value41: Dynamic = value5 ?? value6 ?? value7,
                        state: Dynamic = {
                          x: value41.x,
                          y: value41.y,
                          w: value41.w,
                          h: value41.h,
                        },
                        value42: Dynamic = value7
                          ? PlatformFileContentConstant_20
                          : PlatformFileContentConstant_19,
                        value43: Dynamic = value32
                          ? null
                          : (snapLines?.() ?? null);
                      callback3(
                        options,
                        "ann-resize",
                        (
                          input3?: Dynamic,
                          options2?: Dynamic,
                          context?: Dynamic,
                        ): Dynamic => {
                          let value44: Dynamic =
                              value43 && !(context.metaKey || context.ctrlKey)
                                ? (0, snapResize)(
                                    state,
                                    input2,
                                    input3,
                                    options2,
                                    value43.lines,
                                    value43.threshold,
                                  )
                                : {
                                    dx: input3,
                                    dy: options2,
                                    guides: [],
                                  },
                            value45: Dynamic = CanvasShapeX(
                              (0, resizeRotatedRect)(
                                state,
                                value32,
                                input2,
                                value44.dx,
                                value44.dy,
                                {
                                  w: value42,
                                  h: value42,
                                },
                                {
                                  w: PlatformFileContentLimit_6,
                                  h: PlatformFileContentLimit_6,
                                },
                                !!value7 ||
                                  (context.shiftKey &&
                                    input2.x !== null &&
                                    input2.y !== null),
                              ),
                            ),
                            value46: Dynamic = (0,
                            activeResizeGuides)(
                              value45,
                              input2,
                              value44.guides,
                            );
                          onSnapGuides?.(value46.length > 0 ? value46 : null);
                          return value45;
                        },
                        state,
                        (): Dynamic => onSnapGuides?.(null),
                      );
                    }}
                    onRotateStart={grouped || value2 ? undefined : callback2}
                    angleLabel={
                      value38 !== null ? String(value38) + "\xB0" : undefined
                    }
                  />
                </div>)}
              {value2 && !grouped && (<SelectionPoints
                  data-mega-chrome={"annotation-resize"}
                  data-testid={"mega-shape-ends-" + spec.id}
                  points={[
                    {
                      x: value2.x - value.x,
                      y: value2.y - value.y,
                    },
                    {
                      x: value2.x2 - value.x,
                      y: value2.y2 - value.y,
                    },
                  ]}
                  scale={input}
                  shape={"square"}
                  cursor={"crosshair"}
                  onPointDragStart={(
                    input2?: Dynamic,
                    options?: Dynamic,
                  ): Dynamic => {
                    let value41: Dynamic = input2 === 0,
                      [value42, value43]: Dynamic = value41
                        ? [value2.x, value2.y]
                        : [value2.x2, value2.y2],
                      value44: Dynamic = value41
                        ? {
                            x: value2.x2,
                            y: value2.y2,
                          }
                        : {
                            x: value2.x,
                            y: value2.y,
                          };
                    callback3(
                      options,
                      "ann-resize",
                      (
                        input3?: Dynamic,
                        options2?: Dynamic,
                        context?: Dynamic,
                      ): Dynamic => {
                        let state: Dynamic = {
                            x: value42 + input3,
                            y: value43 + options2,
                          },
                          value45: Dynamic = context.shiftKey
                            ? (0, constrainLineAngle)(value44, state)
                            : state;
                        return value41
                          ? {
                              x: Math.round(value45.x),
                              y: Math.round(value45.y),
                            }
                          : {
                              x2: Math.round(value45.x),
                              y2: Math.round(value45.y),
                            };
                      },
                      value41
                        ? {
                            x: value42,
                            y: value43,
                          }
                        : {
                            x2: value42,
                            y2: value43,
                          },
                    );
                  }}
                />)}
            </jsxCanvasAnnotationShapeStyle.Fragment>
          )}
        </ViewportScale>)}
    </div>
  );
}
export {
  CanvasShape,
  CanvasShapeX,
  reactCanvasShape,
  reactCanvasShape_2,
  reactDomCanvasShape,
  reactDomCanvasShape_2,
};
export function installCanvasShape(): () => void {
  return () => {
    CanvasShapeX = (input?: Dynamic): Dynamic => ({
      x: Math.round(input.x),
      y: Math.round(input.y),
      w: Math.round(input.w),
      h: Math.round(input.h),
    });
    reactCanvasShape = (0, toModuleNamespace)(
      (0, load_react)(),
      1,
    );
    reactDomCanvasShape = (0, toModuleNamespace)(
      (0, load_react_dom)(),
      1,
    );
    (0, initializeNpm_usehooks_ts_p0)();
    reactCanvasShape_2 = (0, toModuleNamespace)(
      (0, load_react)(),
      1,
    );
    reactDomCanvasShape_2 = (0, toModuleNamespace)(
      (0, load_react_dom)(),
      1,
    );
    (0, initializeNpm_usehooks_ts_p0)();
    (0, initializePlatformCdsIsland)();
  };
}
