import { uiMessage } from '@minedesign/contracts/ui-messages';
import { useUiLocale } from '../ui-locale.ts';
/** Restored application module; prepare first, initialize in original order. */
import {
  type Dynamic,
} from "../runtime-types";
import { annotationColor, annotationCssStyle, annotationEffectsCss, annotationFillDefaults, annotationFillSignature, annotationPathViewBox, AnnotationShapeBody, annotationStrokeWidth, CanvasAnnotationShapeStyleConstant, defaultArrowStrokeWidth as lineDefaultStrokeWidth, svgOverflowPadding as lineSvgPadding, CanvasAnnotationShapeStyleMatches, jsxCanvasAnnotationShapeStyle } from "./annotation-shape-style";
import { beginArtboardResize } from "./artboard-resize";
import { scheduleImageDecode, watchPointerRelease } from "./image-decode-scheduler";
import { useViewportStore, ViewportScale } from "./viewport-store";
import { SelectionPoints, SelectionRing } from "../cds/components/selection-ring";
import { initializeNpm_usehooks_ts_p0, load_react, load_react_dom } from "../dependencies";
import { joinClassNames } from "../editor/chrome/overlay-state";
import { imageFlipCss } from "../editor/geometry/flip-annotations";
import { angleBetweenPoints, resizeRotatedRect, snapRotation } from "../editor/geometry/rotation";
import { activeResizeGuides, snapResize } from "../editor/geometry/snapping";
import { reactForCanvasShape } from "../editor/hooks/latest-callback";
import { imageCropCss } from "../editor/media/crop-geometry";
import { createVideoPlaybackStore } from "../editor/media/video-playback";
import { MediaVideoUploadAutoPlayLoopMutedConfig } from "../editor/media/video-upload";
import { PickerRuntimeScriptTAppAccentConfig } from "../editor/picker/runtime-script";
import { shortenLineEnds, arrowHeadCenterY as arrowMarkerRefY, SvgArrowsFilledOpenConfig, SvgArrowsRefX } from "../editor/svg/arrows";
import { constrainLineAngle } from "../editor/svg/drawing";
import { AnnotationPenEditor } from "../editor/vector/annotation-pen-editor";
import { toModuleNamespace } from "../module-helpers";
import { initializePlatformCdsIsland } from "../platform/cds-island";
import { annotationArrowHeads, annotationBounds, annotationRotation, minShapeDimension as minShapeSize, minImageDimension as minImageSize, maxCanvasItemDimension as maxShapeSize } from "../platform/file-content";
import { blobPlaceholderImage } from "../preview/blob-paths";

var CanvasShapeX: Dynamic;
var reactCanvasShape: Dynamic;
var reactDomCanvasShape: Dynamic;
var React: Dynamic;
var reactDomForAnchoredDesignProperties: Dynamic;
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
  let shapeBounds: Dynamic = annotationBounds(spec),
    lineSpec: Dynamic =
      spec.kind === "line" || spec.kind === "arrow" ? spec : null,
    arrowHeads: Dynamic = lineSpec
      ? annotationArrowHeads(lineSpec)
      : null,
    shortenedLine: Dynamic =
      !lineSpec || !arrowHeads
        ? null
        : shortenLineEnds(
            lineSpec.x,
            lineSpec.y,
            lineSpec.x2,
            lineSpec.y2,
            SvgArrowsRefX(arrowHeads.start) *
              annotationStrokeWidth(
                lineSpec.css,
                lineDefaultStrokeWidth,
              ),
            SvgArrowsRefX(arrowHeads.end) *
              annotationStrokeWidth(
                lineSpec.css,
                lineDefaultStrokeWidth,
              ),
          ),
    callback: Dynamic = (endName?: Dynamic): Dynamic =>
      (endName === "start" ? "mega-shape-start-head-" : "mega-shape-head-") +
      spec.id,
    boxSpec: Dynamic =
      spec.kind === "rect" || spec.kind === "oval" ? spec : null,
    penSpec: Dynamic = spec.kind === "pen" ? spec : null,
    imageSpec: Dynamic = spec.kind === "image" ? spec : null,
    [failedImageSrc, setFailedImageSrc]: Dynamic = (0,
    reactForCanvasShape.useState)(null),
    imageSrc: Dynamic = imageSpec
      ? (resolveImageSrc?.(imageSpec.src) ?? null)
      : null,
    displayImageSrc: Dynamic =
      imageSrc !== null && imageSrc === failedImageSrc ? null : imageSrc,
    videoSrc: Dynamic =
      imageSpec?.video === undefined
        ? null
        : (resolveImageSrc?.(imageSpec.video) ?? null),
    [failedVideoSrc, setFailedVideoSrc]: Dynamic = (0,
    reactForCanvasShape.useState)(null),
    containerRef: Dynamic = (0, reactForCanvasShape.useRef)(null),
    [isInViewport, setIsInViewport]: Dynamic = (0,
    reactForCanvasShape.useState)(false);
  (0, reactForCanvasShape.useEffect)((): Dynamic => {
    let containerElement: Dynamic = videoSrc === null ? null : containerRef.current;
    if (!containerElement) return;
    if (typeof IntersectionObserver === "undefined") {
      setIsInViewport(true);
      return;
    }
    let intersectionObserver: Dynamic = new IntersectionObserver(
      (items?: Dynamic): Dynamic => {
        let lastEntry: Dynamic = items[items.length - 1];
        lastEntry && setIsInViewport(lastEntry.isIntersecting);
      },
    );
    intersectionObserver.observe(containerElement);
    return (): Dynamic => intersectionObserver.disconnect();
  }, [videoSrc]);
  let [isDecodeReady, setIsDecodeReady]: Dynamic = (0,
    reactForCanvasShape.useState)(false),
    shouldDecodeVideo: Dynamic = videoSrc !== null && videoSrc !== failedVideoSrc && isInViewport;
  (0, reactForCanvasShape.useEffect)((): Dynamic => {
    if (!shouldDecodeVideo) return;
    let cancelDecode: Dynamic = scheduleImageDecode(
      spec.id,
      (): Dynamic => setIsDecodeReady(true),
    );
    return (): Dynamic => {
      cancelDecode();
      setIsDecodeReady(false);
    };
  }, [shouldDecodeVideo, spec.id]);
  let shouldRenderVideo: Dynamic = shouldDecodeVideo && isDecodeReady,
    videoRef: Dynamic = (0, reactForCanvasShape.useRef)(null),
    playbackStoreRef: Dynamic = (0, reactForCanvasShape.useRef)(null),
    pressStartRef: Dynamic = (0, reactForCanvasShape.useRef)(null);
  (0, reactForCanvasShape.useEffect)((): Dynamic => {
    let videoElement: Dynamic = shouldRenderVideo ? videoRef.current : null;
    if (!videoElement) return;
    let playbackStore: Dynamic = createVideoPlaybackStore(videoElement);
    playbackStoreRef.current = playbackStore;
    return (): Dynamic => {
      playbackStore.detach();
      playbackStoreRef.current = null;
      videoElement.isConnected ||
        (videoElement.pause(), videoElement.removeAttribute("src"), videoElement.load());
    };
  }, [shouldRenderVideo, videoSrc]);
  let penPath: Dynamic = penSpec?.d,
    penViewBox: Dynamic = (0, reactForCanvasShape.useMemo)(
      (): Dynamic =>
        penPath === undefined
          ? null
          : annotationPathViewBox(penPath),
      [penPath],
    ),
    shapeColor: Dynamic = annotationColor(
      spec.kind,
      spec.color ?? "default",
    ),
    isDirectlyEditable: Dynamic = editing && !inert && !cropping,
    commentPointerStyle: Dynamic =
      commenting && !isDirectlyEditable
        ? {
            pointerEvents: "auto",
          }
        : undefined,
    pressHandlers: Dynamic = editing ? objectPress : {},
    viewportStore: Dynamic = useViewportStore(),
    rotationDegrees: Dynamic = annotationRotation(spec),
    rotationStyle: Dynamic = rotationDegrees
      ? {
          transform: "rotate(" + String(rotationDegrees) + "deg)",
        }
      : undefined,
    counterRotationStyle: Dynamic = rotationDegrees
      ? {
          transform: "rotate(" + String(-rotationDegrees) + "deg)",
        }
      : undefined,
    rotationRadians: Dynamic = rotationDegrees ? (rotationDegrees * Math.PI) / 180 : undefined,
    flipStyle: Dynamic = imageFlipCss(spec),
    isPenVectorEditing: Dynamic = vectorEdit && penSpec !== null && !grouped && !rotationDegrees,
    [rotationAngleLabel, setRotationAngleLabel]: Dynamic = (0,
    reactForCanvasShape.useState)(null),
    handleRotateStart: Dynamic = (rotateHandle?: Dynamic, pointerEvent?: Dynamic): Dynamic => {
      let ancestor: Dynamic = pointerEvent.currentTarget.closest(
        "[data-mega-annotation]",
      );
      if (!ancestor) return;
      let bounds: Dynamic = ancestor.getBoundingClientRect(),
        [centerX, centerY]: Dynamic = [
          bounds.left + bounds.width / 2,
          bounds.top + bounds.height / 2,
        ],
        [startRotation, startPointerAngle]: Dynamic = [
          rotationDegrees,
          angleBetweenPoints(
            centerX,
            centerY,
            pointerEvent.clientX,
            pointerEvent.clientY,
          ),
        ];
      beginResizeGesture(
        pointerEvent,
        "ann-resize",
        (
          deltaX?: Dynamic,
          deltaY?: Dynamic,
          moveEvent?: Dynamic,
        ): Dynamic => {
          let snappedRotation: Dynamic = snapRotation(
            startRotation +
              angleBetweenPoints(
                centerX,
                centerY,
                moveEvent.clientX,
                moveEvent.clientY,
              ) -
              startPointerAngle,
            moveEvent.shiftKey,
          );
          setRotationAngleLabel(snappedRotation);
          return {
            rotate: snappedRotation,
          };
        },
        {
          rotate: startRotation,
        },
        (): Dynamic => setRotationAngleLabel(null),
      );
    },
    isEditingRef: Dynamic = (0, reactForCanvasShape.useRef)(
      editing,
    );
  isEditingRef.current = editing;
  let beginResizeGesture: Dynamic = (
    startEvent?: Dynamic,
    source?: Dynamic,
    computePatch?: Dynamic,
    restorePatch?: Dynamic,
    onEnd?: Dynamic,
  ): Dynamic =>
    beginArtboardResize(startEvent, {
      src: source,
      scale: viewportStore.get().scale,
      onGesture: onGesture,
      armWindowGestureEnd: armWindowGestureEnd,
      patchAt: computePatch,
      onChange: onChange,
      restore: restorePatch,
      onEnd: onEnd,
      sound: (): Dynamic => isEditingRef.current,
    });
  return (
    <div
      ref={containerRef}
      data-clip-failed={
        videoSrc !== null && videoSrc === failedVideoSrc ? "" : undefined
      }
      data-mega-chrome={"annotation"}
      data-mega-annotation={spec.id}
      data-testid={"mega-annotation-" + spec.id}
      data-shape-kind={spec.kind}
      className={"pointer-events-none absolute"}
      style={{
        left: shapeBounds.x,
        top: shapeBounds.y,
        width: shapeBounds.w,
        height: shapeBounds.h,
        ...rotationStyle,
      }}
      onDoubleClick={
        penSpec && isDirectlyEditable && onEditPoints && !rotationDegrees
          ? (event?: Dynamic): Dynamic => {
              event.stopPropagation();
              onEditPoints();
            }
          : undefined
      }
    >
      {boxSpec && ((() => {
          const _Component = "div";
          const _props = {
            "data-testid": "mega-shape-body-" + spec.id,
            className: joinClassNames(
              "absolute inset-0 box-border",
              isDirectlyEditable && "pointer-events-auto cursor-grab",
            ),
            style: {
              ...annotationFillDefaults(
                boxSpec.css,
                shapeColor,
                boxSpec.kind === "oval",
              ),
              ...annotationCssStyle(boxSpec.css),
              ...(boxSpec.kind === "oval"
                ? {
                    borderRadius: "50%",
                  }
                : {}),
              ...flipStyle,
              ...commentPointerStyle,
            },
            ...pressHandlers,
          } as const;
          const _key = annotationFillSignature(
            boxSpec.css,
            boxSpec.kind === "oval",
          );
          return <_Component key={_key} {..._props} />;
        })())}
      {imageSpec && shouldRenderVideo && (<AnnotationShapeBody
          on={imageSpec.crop !== undefined}
          id={spec.id}
          css={imageSpec.css}
          mirror={flipStyle}
        >
          <video
            ref={videoRef}
            data-testid={
              imageSpec.crop !== undefined
                ? undefined
                : "mega-shape-body-" + spec.id
            }
            data-mega-picture={""}
            data-mega-video={""}
            src={videoSrc}
            poster={displayImageSrc ?? undefined}
            onLoadedMetadata={onPictureLoad}
            {...MediaVideoUploadAutoPlayLoopMutedConfig}
            autoPlay={!CanvasAnnotationShapeStyleMatches()}
            disablePictureInPicture={true}
            disableRemotePlayback={true}
            aria-label={imageSpec.alt}
            draggable={false}
            onError={(): Dynamic => setFailedVideoSrc(videoSrc)}
            className={joinClassNames(
              "absolute inset-0 box-border block h-full w-full select-none",
              isDirectlyEditable
                ? "pointer-events-auto cursor-grab"
                : !editing && "pointer-events-auto cursor-pointer",
            )}
            style={{
              ...(imageSpec.crop !== undefined
                ? imageCropCss(imageSpec.crop)
                : {
                    objectFit: "fill",
                    ...annotationCssStyle(imageSpec.css),
                  }),
              ...commentPointerStyle,
            }}
            onDoubleClick={isDirectlyEditable ? onCropStart : undefined}
            {...pressHandlers}
            onPointerDown={(event?: Dynamic): Dynamic => {
              let isPrimaryPress: Dynamic =
                event.button === 0 &&
                !event.shiftKey &&
                !event.altKey &&
                !event.metaKey &&
                !event.ctrlKey;
              if (!editing) {
                isPrimaryPress &&
                  watchPointerRelease(
                    event.nativeEvent,
                    (): Dynamic => playbackStoreRef.current?.toggle(),
                  );
                return;
              }
              pressStartRef.current =
                isPrimaryPress && !grouped
                  ? {
                      x: event.clientX,
                      y: event.clientY,
                      wasSelected: selected,
                    }
                  : null;
              pressHandlers.onPointerDown?.(event);
            }}
            onClick={(clickEvent?: Dynamic): Dynamic => {
              let current: Dynamic = pressStartRef.current;
              pressStartRef.current = null;
              !(
                !current ||
                !isDirectlyEditable ||
                !current.wasSelected ||
                clickEvent.detail > 1 ||
                Math.hypot(
                  clickEvent.clientX - current.x,
                  clickEvent.clientY - current.y,
                ) > 4
              ) && playbackStoreRef.current?.toggle();
            }}
          />
        </AnnotationShapeBody>)}
      {imageSpec && !shouldRenderVideo && imageSpec.crop !== undefined && displayImageSrc !== null ? (<div
          data-testid={"mega-shape-body-" + spec.id}
          className={joinClassNames(
            "absolute inset-0 box-border overflow-hidden",
            isDirectlyEditable && "pointer-events-auto cursor-grab",
          )}
          style={{
            ...annotationCssStyle(imageSpec.css),
            ...flipStyle,
            ...commentPointerStyle,
          }}
          onDoubleClick={isDirectlyEditable ? onCropStart : undefined}
          {...pressHandlers}
        >
          <img
            data-mega-picture={""}
            src={displayImageSrc}
            alt={imageSpec.alt ?? ""}
            draggable={false}
            onLoad={onPictureLoad}
            onError={(): Dynamic => setFailedImageSrc(displayImageSrc)}
            className={"block select-none"}
            style={imageCropCss(imageSpec.crop)}
          />
        </div>) : (imageSpec &&
        !shouldRenderVideo && (<img
            data-testid={"mega-shape-body-" + spec.id}
            data-mega-picture={displayImageSrc === null ? "placeholder" : ""}
            src={displayImageSrc ?? blobPlaceholderImage}
            alt={imageSpec.alt ?? ""}
            draggable={false}
            onLoad={onPictureLoad}
            onError={(): Dynamic => {
              imageSrc !== null && setFailedImageSrc(imageSrc);
            }}
            className={joinClassNames(
              "absolute inset-0 box-border block h-full w-full select-none",
              isDirectlyEditable && "pointer-events-auto cursor-grab",
            )}
            style={{
              objectFit: "fill",
              background:
                displayImageSrc === null &&
                imageSpec.css?.["background-color"] === undefined
                  ? "#e8e6e1"
                  : undefined,
              ...annotationCssStyle(imageSpec.css),
              ...flipStyle,
              ...commentPointerStyle,
            }}
            onDoubleClick={
              isDirectlyEditable && displayImageSrc !== null ? onCropStart : undefined
            }
            {...pressHandlers}
          />))}
      {lineSpec && (<svg
          data-testid={"mega-shape-svg-" + spec.id}
          className={"pointer-events-none absolute"}
          style={{
            left: -lineSvgPadding,
            top: -lineSvgPadding,
            overflow: "visible",
            ...annotationEffectsCss(lineSpec.css),
          }}
          width={shapeBounds.w + 2 * lineSvgPadding}
          height={shapeBounds.h + 2 * lineSvgPadding}
        >
          {arrowHeads && (arrowHeads.start !== "none" || arrowHeads.end !== "none") && (<defs>
              {["start", "end"].map((endName?: Dynamic): Dynamic => {
                let headStyle: Dynamic = arrowHeads[endName];
                return headStyle === "none" ? null : (
                  <marker
                    key={endName}
                    id={callback(endName)}
                    orient={endName === "start" ? "auto-start-reverse" : "auto"}
                    markerWidth={"5"}
                    markerHeight={"5"}
                    refX={SvgArrowsFilledOpenConfig[headStyle].refX}
                    refY={arrowMarkerRefY}
                    overflow={"visible"}
                  >
                    <path
                      d={SvgArrowsFilledOpenConfig[headStyle].d}
                      stroke={"none"}
                      style={{
                        fill: lineSpec.css?.stroke ?? shapeColor,
                      }}
                    />
                  </marker>
                );
              })}
            </defs>)}
          <line
            x1={
              (shortenedLine?.sx ?? lineSpec.x) -
              shapeBounds.x +
              lineSvgPadding
            }
            y1={
              (shortenedLine?.sy ?? lineSpec.y) -
              shapeBounds.y +
              lineSvgPadding
            }
            x2={
              (shortenedLine?.ex ?? lineSpec.x2) -
              shapeBounds.x +
              lineSvgPadding
            }
            y2={
              (shortenedLine?.ey ?? lineSpec.y2) -
              shapeBounds.y +
              lineSvgPadding
            }
            stroke={lineSpec.css?.stroke ?? shapeColor}
            strokeWidth={annotationStrokeWidth(
              lineSpec.css,
              lineDefaultStrokeWidth,
            )}
            strokeLinecap={"round"}
            markerStart={
              arrowHeads && arrowHeads.start !== "none"
                ? "url(#" + callback("start") + ")"
                : undefined
            }
            markerEnd={
              arrowHeads && arrowHeads.end !== "none"
                ? "url(#" + callback("end") + ")"
                : undefined
            }
          />
          <line
            data-testid={"mega-shape-body-" + spec.id}
            x1={
              lineSpec.x -
              shapeBounds.x +
              lineSvgPadding
            }
            y1={
              lineSpec.y -
              shapeBounds.y +
              lineSvgPadding
            }
            x2={
              lineSpec.x2 -
              shapeBounds.x +
              lineSvgPadding
            }
            y2={
              lineSpec.y2 -
              shapeBounds.y +
              lineSvgPadding
            }
            stroke={"transparent"}
            strokeWidth={Math.max(
              lineDefaultStrokeWidth + 8,
              16 / scale,
            )}
            strokeLinecap={"round"}
            className={joinClassNames(isDirectlyEditable && "cursor-grab")}
            style={{
              pointerEvents: isDirectlyEditable || commenting ? "stroke" : "none",
            }}
            {...pressHandlers}
          />
        </svg>)}
      {penSpec && penViewBox && (<svg
          data-testid={"mega-shape-svg-" + spec.id}
          className={"pointer-events-none absolute inset-0"}
          style={{
            overflow: "visible",
            ...annotationEffectsCss(penSpec.css),
          }}
          width={shapeBounds.w}
          height={shapeBounds.h}
          viewBox={"0 0 " + String(penViewBox.w) + " " + String(penViewBox.h)}
          preserveAspectRatio={"none"}
        >
          <path
            d={penSpec.d}
            fill={"none"}
            stroke={penSpec.css?.stroke ?? shapeColor}
            strokeWidth={annotationStrokeWidth(
              penSpec.css,
              CanvasAnnotationShapeStyleConstant,
            )}
            strokeLinecap={"round"}
            strokeLinejoin={"round"}
            vectorEffect={"non-scaling-stroke"}
          />
          <path
            data-testid={"mega-shape-body-" + spec.id}
            d={penSpec.d}
            fill={"none"}
            stroke={"transparent"}
            strokeWidth={Math.max(12, 16 / scale)}
            strokeLinecap={"round"}
            strokeLinejoin={"round"}
            vectorEffect={"non-scaling-stroke"}
            className={joinClassNames(isDirectlyEditable && "cursor-grab")}
            style={{
              pointerEvents: isDirectlyEditable || commenting ? "stroke" : "none",
            }}
            {...pressHandlers}
          />
        </svg>)}
      {isDirectlyEditable && selected && (<ViewportScale>
          {(viewportScale?: Dynamic): Dynamic => (
            <jsxCanvasAnnotationShapeStyle.Fragment>
              {isPenVectorEditing && penSpec && penViewBox && (<div
                  data-mega-chrome={"annotation-resize"}
                  className={"pointer-events-none absolute left-0 top-0"}
                  style={{
                    ...PickerRuntimeScriptTAppAccentConfig,
                    transform: `scale(${String(1 / viewportScale)})`,
                    transformOrigin: "0 0",
                  }}
                >
                  <AnnotationPenEditor
                    spec={penSpec}
                    ext={penViewBox}
                    scale={viewportScale}
                    onChange={onChange}
                    onGesture={onGesture}
                    armWindowGestureEnd={armWindowGestureEnd}
                  />
                </div>)}
              {(boxSpec ?? (isPenVectorEditing ? null : penSpec) ?? imageSpec) ||
                grouped && (<div
                  data-mega-chrome={"annotation-resize"}
                  data-testid={"mega-annotation-resize-" + spec.id}
                  data-grouped={grouped ? "" : undefined}
                  className={"pointer-events-none absolute inset-0"}
                  style={counterRotationStyle}
                >
                  <SelectionRing
                    frame={{
                      x: 0,
                      y: 0,
                      w: shapeBounds.w,
                      h: shapeBounds.h,
                    }}
                    scale={viewportScale}
                    rotation={rotationRadians}
                    state={grouped ? "member" : "selected"}
                    grips={grouped ? "none" : "corners"}
                    edgeStrips={!imageSpec}
                    onResizeStart={(
                      handle?: Dynamic,
                      startEvent?: Dynamic,
                    ): Dynamic => {
                      let targetSpec: Dynamic = boxSpec ?? penSpec ?? imageSpec,
                        state: Dynamic = {
                          x: targetSpec.x,
                          y: targetSpec.y,
                          w: targetSpec.w,
                          h: targetSpec.h,
                        },
                        minSize: Dynamic = imageSpec
                          ? minImageSize
                          : minShapeSize,
                        snapConfig: Dynamic = rotationDegrees
                          ? null
                          : (snapLines?.() ?? null);
                      beginResizeGesture(
                        startEvent,
                        "ann-resize",
                        (
                          deltaX?: Dynamic,
                          deltaY?: Dynamic,
                          moveEvent?: Dynamic,
                        ): Dynamic => {
                          let snapped: Dynamic =
                              snapConfig && !(moveEvent.metaKey || moveEvent.ctrlKey)
                                ? snapResize(
                                    state,
                                    handle,
                                    deltaX,
                                    deltaY,
                                    snapConfig.lines,
                                    snapConfig.threshold,
                                  )
                                : {
                                    dx: deltaX,
                                    dy: deltaY,
                                    guides: [],
                                  },
                            newFrame: Dynamic = CanvasShapeX(
                              resizeRotatedRect(
                                state,
                                rotationDegrees,
                                handle,
                                snapped.dx,
                                snapped.dy,
                                {
                                  w: minSize,
                                  h: minSize,
                                },
                                {
                                  w: maxShapeSize,
                                  h: maxShapeSize,
                                },
                                !!imageSpec ||
                                  (moveEvent.shiftKey &&
                                    handle.x !== null &&
                                    handle.y !== null),
                              ),
                            ),
                            resizeGuides: Dynamic = activeResizeGuides(
                              newFrame,
                              handle,
                              snapped.guides,
                            );
                          onSnapGuides?.(resizeGuides.length > 0 ? resizeGuides : null);
                          return newFrame;
                        },
                        state,
                        (): Dynamic => onSnapGuides?.(null),
                      );
                    }}
                    onRotateStart={grouped || lineSpec ? undefined : handleRotateStart}
                    angleLabel={
                      rotationAngleLabel !== null ? String(rotationAngleLabel) + "\xB0" : undefined
                    }
                  />
                </div>)}
              {lineSpec && !grouped && (<SelectionPoints
                  data-mega-chrome={"annotation-resize"}
                  data-testid={"mega-shape-ends-" + spec.id}
                  points={[
                    {
                      x: lineSpec.x - shapeBounds.x,
                      y: lineSpec.y - shapeBounds.y,
                    },
                    {
                      x: lineSpec.x2 - shapeBounds.x,
                      y: lineSpec.y2 - shapeBounds.y,
                    },
                  ]}
                  scale={viewportScale}
                  shape={"square"}
                  cursor={"crosshair"}
                  onPointDragStart={(
                    endIndex?: Dynamic,
                    startEvent?: Dynamic,
                  ): Dynamic => {
                    let isStartPoint: Dynamic = endIndex === 0,
                      [pointStartX, pointStartY]: Dynamic = isStartPoint
                        ? [lineSpec.x, lineSpec.y]
                        : [lineSpec.x2, lineSpec.y2],
                      oppositePoint: Dynamic = isStartPoint
                        ? {
                            x: lineSpec.x2,
                            y: lineSpec.y2,
                          }
                        : {
                            x: lineSpec.x,
                            y: lineSpec.y,
                          };
                    beginResizeGesture(
                      startEvent,
                      "ann-resize",
                      (
                        deltaX?: Dynamic,
                        deltaY?: Dynamic,
                        moveEvent?: Dynamic,
                      ): Dynamic => {
                        let state: Dynamic = {
                            x: pointStartX + deltaX,
                            y: pointStartY + deltaY,
                          },
                          nextPoint: Dynamic = moveEvent.shiftKey
                            ? constrainLineAngle(oppositePoint, state)
                            : state;
                        return isStartPoint
                          ? {
                              x: Math.round(nextPoint.x),
                              y: Math.round(nextPoint.y),
                            }
                          : {
                              x2: Math.round(nextPoint.x),
                              y2: Math.round(nextPoint.y),
                            };
                      },
                      isStartPoint
                        ? {
                            x: pointStartX,
                            y: pointStartY,
                          }
                        : {
                            x2: pointStartX,
                            y2: pointStartY,
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
  React as canvasShapeReact,
  reactDomCanvasShape,
  reactDomForAnchoredDesignProperties,
};
export function installCanvasShape(): () => void {
  return () => {
    CanvasShapeX = (rect?: Dynamic): Dynamic => ({
      x: Math.round(rect.x),
      y: Math.round(rect.y),
      w: Math.round(rect.w),
      h: Math.round(rect.h),
    });
    reactCanvasShape = toModuleNamespace(
      load_react(),
      1,
    );
    reactDomCanvasShape = toModuleNamespace(
      load_react_dom(),
      1,
    );
    initializeNpm_usehooks_ts_p0();
    React = toModuleNamespace(
      load_react(),
      1,
    );
    reactDomForAnchoredDesignProperties = toModuleNamespace(
      load_react_dom(),
      1,
    );
    initializeNpm_usehooks_ts_p0();
    initializePlatformCdsIsland();
  };
}
