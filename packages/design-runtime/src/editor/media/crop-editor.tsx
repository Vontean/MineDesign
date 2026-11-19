import { useUiLocale } from '../../ui-locale.ts';
import { uiMessage } from '@minedesign/contracts/ui-messages';
/** Restored application module; prepare first, initialize in original order. */
import {
  type Dynamic,
} from "../../runtime-types";
import { ComponentsSelectionRingPointPointStrokeGripHitConfig } from "../../cds/components/selection-ring";
import { announce } from "../accessibility/announcer";
import { cropIntoFrame, imageCropRect, resizeImageCropCorner, resizeImageCropFrame, sameImageCrop, translateImageCrop, zoomImageCrop } from "./crop-geometry";
import { PropertiesSidesArrowLeftArrowRightArrowUpConfig, PropertiesSidesConstant as wheelZoomSensitivity, PropertiesSidesConstant_2 as dimmedMediaOpacity, PropertiesSidesConstant_3 as keyboardZoomFactor, PropertiesSidesNESConfig, PropertiesSidesNESValues, PropertiesSidesNSEConfig, PropertiesSidesNwNeSeConfig, PropertiesSidesNwNeSeValues, reactPropertiesSides, RESIZE_EDGE_MIN_LENGTH_PX, RESIZE_HANDLE_HIT_SIZE_PX, RESIZE_HANDLE_LENGTH_PX, RESIZE_HANDLE_THICKNESS_PX } from "../properties/sides";

function blurBeforeCrop(): Dynamic {
  let activeElement: Dynamic = (document as Dynamic).activeElement;
  !(activeElement instanceof HTMLElement) ||
    activeElement.closest("[data-media-crop-keep]") ||
    ((activeElement.isContentEditable ||
      /^(INPUT|TEXTAREA|SELECT)$/.test(activeElement.tagName) ||
      activeElement.closest('button, a[href], [role="button"]')) &&
      activeElement.blur());
}
function MediaCropEditor({
  frame: frame,
  natural: natural,
  crop: crop,
  scale: scale,
  rotation = 0,
  src: src,
  video = false,
  zoomDisabledReason: zoomDisabledReason,
  onLive: onLive,
  onDone: onDone,
  onGesture: onGesture,
  onFrame: onFrame,
  frameHandleOff: frameHandleOff,
  minFrame = 0,
  snapFrame: snapFrame,
  onSideStart: onSideStart,
}: Dynamic): Dynamic {
  useUiLocale();
  let latestPropsRef: Dynamic = (0, reactPropertiesSides.useRef)({
    frame: frame,
    natural: natural,
    crop: crop,
    scale: scale,
    rotation: rotation,
    zoomDisabledReason: zoomDisabledReason,
    onLive: onLive,
    onDone: onDone,
    onGesture: onGesture,
    onFrame: onFrame,
  });
  latestPropsRef.current = {
    frame: frame,
    natural: natural,
    crop: crop,
    scale: scale,
    rotation: rotation,
    zoomDisabledReason: zoomDisabledReason,
    onLive: onLive,
    onDone: onDone,
    onGesture: onGesture,
    onFrame: onFrame,
  };
  let containerRef: Dynamic = (0, reactPropertiesSides.useRef)(null),
    gestureRef: Dynamic = (0, reactPropertiesSides.useRef)(null),
    frameOriginRef: Dynamic = (0, reactPropertiesSides.useRef)({
      x: 0,
      y: 0,
    }),
    externalDragActiveRef: Dynamic = (0, reactPropertiesSides.useRef)(false),
    [isDragging, setIsDragging]: Dynamic = (0, reactPropertiesSides.useState)(
      false,
    ),
    [isShowingImageBounds, setIsShowingImageBounds]: Dynamic = (0, reactPropertiesSides.useState)(
      false,
    ),
    applyCrop: Dynamic = (nextCrop?: Dynamic, nextFrame?: Dynamic): Dynamic => {
      let current: Dynamic = latestPropsRef.current;
      nextFrame && current.onFrame
        ? ((frameOriginRef.current = {
            x: nextFrame.x,
            y: nextFrame.y,
          }),
          current.onFrame({
            crop: nextCrop,
            frame: nextFrame,
          }))
        : sameImageCrop(nextCrop, current.crop) ||
          current.onLive(nextCrop);
    },
    endGesture: Dynamic = (shouldRevert?: Dynamic): Dynamic => {
      let current: Dynamic = gestureRef.current;
      current &&
        ((gestureRef.current = null),
        current.el.hasPointerCapture(current.pid) &&
          current.el.releasePointerCapture(current.pid),
        shouldRevert &&
          applyCrop(
            current.start,
            current.drag.of === "side"
              ? {
                  ...current.base,
                  ...current.frame,
                }
              : undefined,
          ),
        setIsDragging(false),
        latestPropsRef.current.onGesture?.(false));
    };
  (0, reactPropertiesSides.useEffect)((): Dynamic => {
    let current: Dynamic = latestPropsRef.current;
    announce(
      "Cropping. Press Enter when done. " +
        (current.onFrame ? uiMessage("inspector.cropEditor.dragAnEdgeToCrop") : "") +
        uiMessage("inspector.cropEditor.arrowKeysMoveThePicture") +
        (current.zoomDisabledReason === undefined
          ? " Plus and minus zoom it."
          : ""),
    );
    let handleKeyDown: Dynamic = (event?: Dynamic): Dynamic => {
        let latest: Dynamic = latestPropsRef.current,
          target: Dynamic = event.target;
        if (
          externalDragActiveRef.current ||
          (target instanceof HTMLElement &&
            (target.isContentEditable ||
              /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName))) ||
          ((event.key === "Enter" || event.key === " ") &&
            target instanceof Element &&
            target.closest('button, a[href], [role="button"]'))
        )
          return;
        let isUndoRedoKey: Dynamic =
            (event.metaKey || event.ctrlKey) &&
            (event.key.toLowerCase() === "z" ||
              event.key.toLowerCase() === "y"),
          zoomFactor: Dynamic =
            !event.metaKey && !event.ctrlKey && !event.altKey
              ? event.key === "+" || event.key === "="
                ? keyboardZoomFactor
                : event.key === "-" || event.key === "_"
                  ? 1 / keyboardZoomFactor
                  : 0
              : 0,
          arrowDirection: Dynamic =
            !event.metaKey && !event.ctrlKey && !event.altKey
              ? PropertiesSidesArrowLeftArrowRightArrowUpConfig[
                  event.key
                ]
              : undefined;
        if (
          event.key !== "Escape" &&
          event.key !== "Enter" &&
          !isUndoRedoKey &&
          zoomFactor === 0 &&
          arrowDirection === undefined
        ) {
          !(
            event.key === " " ||
            event.key === "Tab" ||
            ((event.metaKey || event.ctrlKey) && /^[-=+01]$/.test(event.key))
          ) &&
            !/^(Shift|Control|Alt|AltGraph|Meta|OS|Hyper|Super|Fn|FnLock|Symbol|SymbolLock|CapsLock|NumLock|ScrollLock|Dead|Process|Unidentified)$/.test(
              event.key,
            ) &&
            !gestureRef.current &&
            latest.onDone(true);
          return;
        }
        event.preventDefault();
        event.stopImmediatePropagation();
        if (gestureRef.current)
          return event.key === "Escape" ? endGesture(true) : undefined;
        if (arrowDirection) {
          let step: Dynamic = (event.shiftKey ? 10 : 1) / latest.scale;
          applyCrop(
            translateImageCrop(
              latest.frame,
              latest.natural,
              latest.crop,
              arrowDirection[0] * step,
              arrowDirection[1] * step,
            ),
          );
        } else
          zoomFactor !== 0
            ? latest.zoomDisabledReason === undefined
              ? applyCrop(
                  zoomImageCrop(
                    latest.frame,
                    latest.natural,
                    latest.crop,
                    zoomFactor,
                  ),
                )
              : announce(latest.zoomDisabledReason)
            : isUndoRedoKey
              ? event.key.toLowerCase() === "z" &&
                !event.shiftKey &&
                latest.onDone(false)
              : latest.onDone(true);
      },
      handlePointerDown: Dynamic = (event?: Dynamic): Dynamic => {
        let targetElement: Dynamic =
          event.target instanceof Element ? event.target : null;
        externalDragActiveRef.current ||
          (event.button === 0 &&
            !containerRef.current?.contains(targetElement) &&
            !targetElement?.closest("[data-media-crop-keep]") &&
            latestPropsRef.current.onDone(true));
      },
      zoomAtPoint: Dynamic = (
        clientX?: Dynamic,
        clientY?: Dynamic,
        factor?: Dynamic,
      ): Dynamic => {
        let latest: Dynamic = latestPropsRef.current,
          container: Dynamic = containerRef.current;
        if (!container || gestureRef.current || externalDragActiveRef.current) return;
        let bounds: Dynamic = container.getBoundingClientRect(),
          [offsetX, offsetY]: Dynamic = [
            (clientX - (bounds.left + bounds.width / 2)) / latest.scale,
            (clientY - (bounds.top + bounds.height / 2)) / latest.scale,
          ],
          [cosRotation, sinRotation]: Dynamic = [
            Math.cos(-latest.rotation),
            Math.sin(-latest.rotation),
          ],
          origin: Dynamic = {
            x: latest.frame.w / 2 + offsetX * cosRotation - offsetY * sinRotation,
            y: latest.frame.h / 2 + offsetX * sinRotation + offsetY * cosRotation,
          },
          nextCrop: Dynamic = zoomImageCrop(
            latest.frame,
            latest.natural,
            latest.crop,
            Math.min(2, Math.max(0.5, factor)),
            origin,
          );
        sameImageCrop(nextCrop, latest.crop) ||
          latest.onLive(nextCrop);
      },
      [pinchScale, pinchStartedAt]: Dynamic = [0, 0],
      cancelEvent: Dynamic = (event?: Dynamic): Dynamic => (
        event.preventDefault(),
        event.stopPropagation()
      ),
      handleWheel: Dynamic = (event?: Dynamic): Dynamic => {
        !(event.ctrlKey || event.metaKey) ||
          latestPropsRef.current.zoomDisabledReason !== undefined ||
          (cancelEvent(event),
          pinchScale !== 0 && Date.now() - pinchStartedAt > 1e3 && (pinchScale = 0),
          pinchScale === 0 &&
            zoomAtPoint(
              event.clientX,
              event.clientY,
              Math.exp(-event.deltaY * wheelZoomSensitivity),
            ));
      },
      hasZoomDisabledReason: Dynamic = (): Dynamic =>
        latestPropsRef.current.zoomDisabledReason !== undefined,
      handleGestureStart: Dynamic = (event?: Dynamic): Dynamic => {
        hasZoomDisabledReason() ||
          (cancelEvent(event), ([pinchScale, pinchStartedAt] = [1, Date.now()]));
      },
      handleGestureChange: Dynamic = (event?: Dynamic): Dynamic => {
        if (hasZoomDisabledReason()) return;
        cancelEvent(event);
        let gestureEvent: Dynamic = event;
        pinchScale === 0 ||
          !(typeof gestureEvent.scale == "number" && gestureEvent.scale > 0) ||
          (zoomAtPoint(
            gestureEvent.clientX ?? 0,
            gestureEvent.clientY ?? 0,
            gestureEvent.scale / pinchScale,
          ),
          ([pinchScale, pinchStartedAt] = [gestureEvent.scale, Date.now()]));
      },
      handleGestureEnd: Dynamic = (event?: Dynamic): Dynamic => {
        hasZoomDisabledReason() || (cancelEvent(event), (pinchScale = 0));
      },
      containerElement: Dynamic = containerRef.current;
    (window as Dynamic).addEventListener("keydown", handleKeyDown, true);
    (window as Dynamic).addEventListener("pointerdown", handlePointerDown, true);
    containerElement?.addEventListener("wheel", handleWheel, {
      passive: false,
    });
    containerElement?.addEventListener("gesturestart", handleGestureStart);
    containerElement?.addEventListener("gesturechange", handleGestureChange);
    containerElement?.addEventListener("gestureend", handleGestureEnd);
    return (): Dynamic => {
      (window as Dynamic).removeEventListener("keydown", handleKeyDown, true);
      (window as Dynamic).removeEventListener("pointerdown", handlePointerDown, true);
      containerElement?.removeEventListener("wheel", handleWheel);
      containerElement?.removeEventListener("gesturestart", handleGestureStart);
      containerElement?.removeEventListener("gesturechange", handleGestureChange);
      containerElement?.removeEventListener("gestureend", handleGestureEnd);
      endGesture(false);
    };
  }, []);
  let startGesture: Dynamic = (event?: Dynamic, drag?: Dynamic): Dynamic => {
      if (!(event.button !== 0 || gestureRef.current)) {
        event.preventDefault();
        event.stopPropagation();
        try {
          event.currentTarget.setPointerCapture(event.pointerId);
        } catch {}
        gestureRef.current = {
          pid: event.pointerId,
          el: event.currentTarget,
          sx: event.clientX,
          sy: event.clientY,
          start: latestPropsRef.current.crop,
          frame: {
            w: frame.w,
            h: frame.h,
          },
          base: {
            ...frameOriginRef.current,
          },
          drag: drag,
        };
        setIsDragging(true);
        onGesture?.(true);
      }
    },
    moveGesture: Dynamic = (event?: Dynamic): Dynamic => {
      let current: Dynamic = gestureRef.current;
      if (!current || event.pointerId !== current.pid) return;
      let [deltaX, deltaY]: Dynamic = [
          (event.clientX - current.sx) / scale,
          (event.clientY - current.sy) / scale,
        ],
        [cosRotation, sinRotation]: Dynamic = [
          Math.cos(-rotation),
          Math.sin(-rotation),
        ],
        [rotatedDeltaX, rotatedDeltaY]: Dynamic = [
          deltaX * cosRotation - deltaY * sinRotation,
          deltaX * sinRotation + deltaY * cosRotation,
        ];
      if (current.drag.of === "side") {
        let resized: Dynamic = resizeImageCropFrame(
            current.frame,
            natural,
            current.start,
            current.drag.side,
            rotatedDeltaX,
            rotatedDeltaY,
            Math.max(RESIZE_HANDLE_HIT_SIZE_PX / scale, minFrame),
          ),
          rawFrame: Dynamic = {
            x: current.base.x + resized.frame.x,
            y: current.base.y + resized.frame.y,
            w: resized.frame.w,
            h: resized.frame.h,
          },
          finalFrame: Dynamic = snapFrame ? snapFrame(rawFrame) : rawFrame,
          finalCrop: Dynamic = snapFrame
            ? cropIntoFrame(
                current.frame,
                natural,
                current.start,
                {
                  x: finalFrame.x - current.base.x,
                  y: finalFrame.y - current.base.y,
                  w: finalFrame.w,
                  h: finalFrame.h,
                },
              )
            : resized.crop;
        (zoomDisabledReason === undefined ||
          finalCrop.zoom <= Math.max(1, current.start.zoom) + 0.001) &&
          applyCrop(finalCrop, finalFrame);
      } else
        applyCrop(
          current.drag.of === "media"
            ? translateImageCrop(
                current.frame,
                natural,
                current.start,
                rotatedDeltaX,
                rotatedDeltaY,
              )
            : resizeImageCropCorner(
                current.frame,
                natural,
                current.start,
                current.drag.corner,
                rotatedDeltaX,
                rotatedDeltaY,
              ),
        );
    },
    createDragHandlers: Dynamic = (drag?: Dynamic, onStart?: Dynamic): Dynamic => ({
      onPointerDown: (event?: Dynamic): Dynamic => {
        event.button === 0 && (onStart?.(), startGesture(event, drag));
      },
      onPointerMove: moveGesture,
      onPointerUp: (event?: Dynamic): Dynamic =>
        gestureRef.current?.pid === event.pointerId && endGesture(false),
      onPointerCancel: (event?: Dynamic): Dynamic =>
        gestureRef.current?.pid === event.pointerId && endGesture(true),
      onLostPointerCapture: (event?: Dynamic): Dynamic => {
        if (gestureRef.current?.pid === event.pointerId) {
          if (event.buttons === 0) return endGesture(false);
          try {
            event.currentTarget.setPointerCapture(event.pointerId);
          } catch {
            endGesture(false);
          }
        }
      },
    }),
    createSideHandlers: Dynamic = (side?: Dynamic): Dynamic => {
      let baseHandlers: Dynamic = createDragHandlers(
        {
          of: "side",
          side: side,
        },
        (): Dynamic => setIsShowingImageBounds(false),
      );
      return {
        ...baseHandlers,
        onPointerDown: (downEvent?: Dynamic): Dynamic => {
          if (downEvent.button !== 0 || !onSideStart?.(side, downEvent))
            return baseHandlers.onPointerDown(downEvent);
          setIsShowingImageBounds(false);
          externalDragActiveRef.current = true;
          let pointerId: Dynamic = downEvent.pointerId,
            endExternalDrag: Dynamic = (): Dynamic => {
              externalDragActiveRef.current = false;
              (window as Dynamic).removeEventListener(
                "pointerup",
                handleExternalPointerEnd,
                true,
              );
              (window as Dynamic).removeEventListener(
                "pointercancel",
                handleExternalPointerEnd,
                true,
              );
              (window as Dynamic).removeEventListener("blur", endExternalDrag);
            },
            handleExternalPointerEnd: Dynamic = (event?: Dynamic): Dynamic => {
              event.pointerId === pointerId && endExternalDrag();
            };
          (window as Dynamic).addEventListener("pointerup", handleExternalPointerEnd, true);
          (window as Dynamic).addEventListener(
            "pointercancel",
            handleExternalPointerEnd,
            true,
          );
          (window as Dynamic).addEventListener("blur", endExternalDrag);
        },
      };
    },
    createDisabledHandlers: Dynamic = (message?: Dynamic): Dynamic => ({
      onPointerDown: (event?: Dynamic): Dynamic => (
        event.preventDefault(),
        event.stopPropagation(),
        announce(message)
      ),
    }),
    imageRect: Dynamic = imageCropRect(frame, natural, crop),
    isCoarsePointer: Dynamic =
      typeof matchMedia == "function" &&
      matchMedia("(pointer: coarse)").matches,
    cornerHitSize: Dynamic =
      (isCoarsePointer
        ? ComponentsSelectionRingPointPointStrokeGripHitConfig
            .gripHitTouch
        : ComponentsSelectionRingPointPointStrokeGripHitConfig.grip +
          4) / scale,
    cornerDotSize: Dynamic =
      ComponentsSelectionRingPointPointStrokeGripHitConfig.grip /
      scale,
    sideHitSize: Dynamic =
      (isCoarsePointer
        ? ComponentsSelectionRingPointPointStrokeGripHitConfig
            .gripHitTouch
        : 20) / scale,
    isZoomLocked: Dynamic = zoomDisabledReason !== undefined,
    canResizeFrame: Dynamic = onFrame !== undefined,
    [handleLength, handleThickness]: Dynamic = [
      RESIZE_HANDLE_LENGTH_PX / scale,
      RESIZE_HANDLE_THICKNESS_PX / scale,
    ],
    handleStyle: Dynamic = {
      position: "absolute",
      background: "var(--t-app-accent)",
      boxShadow: "0 0 0 " + String(1 / scale) + "px #fff",
      borderRadius: handleThickness / 2,
    },
    accentHandleStyle: Dynamic = {
      ...handleStyle,
      boxShadow: undefined,
    },
    whiteHandleStyle: Dynamic = {
      ...handleStyle,
      background: "#fff",
    },
    [clipLeft, clipTop, clipRight, clipBottom]: Dynamic = [
      -imageRect.x,
      -imageRect.y,
      -imageRect.x + frame.w,
      -imageRect.y + frame.h,
    ].map((coordinate?: Dynamic): Dynamic => String(coordinate) + "px"),
    clipPath: Dynamic = `polygon(evenodd, 0 0, 100% 0, 100% 100%, 0 100%, 0 0, ${clipLeft} ${clipTop}, ${clipLeft} ${clipBottom}, ${clipRight} ${clipBottom}, ${clipRight} ${clipTop}, ${clipLeft} ${clipTop})`,
    mediaStyle: Dynamic = {
      position: "absolute",
      inset: 0,
      width: "100%",
      height: "100%",
      opacity: dimmedMediaOpacity,
      pointerEvents: "none",
      userSelect: "none",
      clipPath: clipPath,
    },
    panStyle: Dynamic = {
      position: "absolute",
      cursor: isDragging ? "grabbing" : "grab",
      touchAction: "none",
      pointerEvents: "auto",
    };
  return (
    <div
      ref={containerRef}
      data-media-crop={""}
      role={"group"}
      aria-label={uiMessage("inspector.cropEditor.crop")}
      style={{
        position: "absolute",
        inset: 0,
      }}
    >
      <div
        data-media-crop-pan={""}
        style={{
          ...panStyle,
          left: imageRect.x,
          top: imageRect.y,
          width: imageRect.w,
          height: imageRect.h,
        }}
        {...createDragHandlers(
          {
            of: "media",
          },
          (): Dynamic => setIsShowingImageBounds(true),
        )}
      >
        {src !== null && (video ? (<video
              src={src}
              muted={true}
              playsInline={true}
              preload={"metadata"}
              style={mediaStyle}
            />) : (<img src={src} alt={""} draggable={false} style={mediaStyle} />))}
      </div>
      {canResizeFrame && (<div
          data-media-crop-inside={""}
          style={{
            ...panStyle,
            inset: 0,
          }}
          {...createDragHandlers(
            {
              of: "media",
            },
            (): Dynamic => setIsShowingImageBounds(false),
          )}
        />)}
      <div
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          outlineWidth:
            ComponentsSelectionRingPointPointStrokeGripHitConfig
              .ring / scale,
          outlineStyle: "solid",
          outlineColor: "var(--t-app-accent)",
        }}
      />
      {canResizeFrame && isShowingImageBounds && (<div
          style={{
            position: "absolute",
            left: imageRect.x,
            top: imageRect.y,
            width: imageRect.w,
            height: imageRect.h,
            pointerEvents: "none",
            outlineWidth: 1 / scale,
            outlineStyle: "solid",
            outlineColor: "var(--t-app-accent)",
          }}
        />)}
      {canResizeFrame && (PropertiesSidesNESValues.map((side?: Dynamic): Dynamic => {
          let disabledReason: Dynamic = frameHandleOff?.[side],
            isCorner: Dynamic = side.length === 2;
          if (
            !isCorner &&
            (side === "n" || side === "s" ? frame.w : frame.h) * scale <
              RESIZE_EDGE_MIN_LENGTH_PX
          )
            return null;
          let [anchorX, anchorY]: Dynamic = [
              side.includes("w")
                ? 0
                : side.includes("e")
                  ? frame.w
                  : frame.w / 2,
              side.includes("n")
                ? 0
                : side.includes("s")
                  ? frame.h
                  : frame.h / 2,
            ],
            directionX: Dynamic = side.includes("e") ? -1 : 1,
            directionY: Dynamic = side.includes("s") ? -1 : 1,
            [barOffsetX, barOffsetY]: Dynamic = [
              directionX > 0
                ? sideHitSize / 2 - handleThickness / 2
                : sideHitSize / 2 + handleThickness / 2 - handleLength,
              directionY > 0
                ? sideHitSize / 2 - handleThickness / 2
                : sideHitSize / 2 + handleThickness / 2 - handleLength,
            ];
          return (
            <div
              key={side}
              data-media-crop-side={side}
              role={"img"}
              aria-label={
                uiMessage("inspector.cropEditor.cropHandle", { value1: String(PropertiesSidesNESConfig[side]) })
              }
              title={disabledReason ?? (uiMessage("inspector.cropEditor.dragToCrop"))}
              aria-disabled={disabledReason !== undefined || undefined}
              style={{
                position: "absolute",
                left: anchorX - sideHitSize / 2,
                top: anchorY - sideHitSize / 2,
                width: sideHitSize,
                height: sideHitSize,
                cursor:
                  disabledReason !== undefined
                    ? "not-allowed"
                    : PropertiesSidesNSEConfig[side],
                touchAction: "none",
                pointerEvents: "auto",
                opacity: disabledReason !== undefined ? 0.45 : undefined,
              }}
              {...(disabledReason !== undefined
                ? createDisabledHandlers(disabledReason)
                : createSideHandlers(side))}
            >
              {isCorner ? ([whiteHandleStyle, accentHandleStyle].map(
                  (style?: Dynamic, index?: Dynamic): Dynamic => (
                    <reactPropertiesSides.Fragment key={index}>
                      <div
                        style={{
                          ...style,
                          left: barOffsetX,
                          top: sideHitSize / 2 - handleThickness / 2,
                          width: handleLength,
                          height: handleThickness,
                        }}
                      />
                      <div
                        style={{
                          ...style,
                          left: sideHitSize / 2 - handleThickness / 2,
                          top: barOffsetY,
                          width: handleThickness,
                          height: handleLength,
                        }}
                      />
                    </reactPropertiesSides.Fragment>
                  ),
                )) : (side === "n" || side === "s" ? (<div
                  style={{
                    ...handleStyle,
                    width: handleLength * 1.5,
                    height: handleThickness,
                    left: sideHitSize / 2 - (handleLength * 1.5) / 2,
                    top: sideHitSize / 2 - handleThickness / 2,
                  }}
                />) : (<div
                  style={{
                    ...handleStyle,
                    width: handleThickness,
                    height: handleLength * 1.5,
                    left: sideHitSize / 2 - handleThickness / 2,
                    top: sideHitSize / 2 - (handleLength * 1.5) / 2,
                  }}
                />))}
            </div>
          );
        }))}
      {!canResizeFrame || isShowingImageBounds && (PropertiesSidesNwNeSeValues.map(
          (corner?: Dynamic): Dynamic => (
            <div
              key={corner}
              data-media-crop-handle={corner}
              role={"img"}
              aria-label={
                uiMessage("inspector.cropEditor.zoomHandle", { value1: String(PropertiesSidesNwNeSeConfig[corner]) })
              }
              title={zoomDisabledReason ?? (uiMessage("inspector.cropEditor.dragToZoom"))}
              aria-disabled={isZoomLocked || undefined}
              style={{
                position: "absolute",
                left:
                  (corner === "nw" || corner === "sw"
                    ? imageRect.x
                    : imageRect.x + imageRect.w) -
                  cornerHitSize / 2,
                top:
                  (corner === "nw" || corner === "ne"
                    ? imageRect.y
                    : imageRect.y + imageRect.h) -
                  cornerHitSize / 2,
                width: cornerHitSize,
                height: cornerHitSize,
                display: "grid",
                placeItems: "center",
                cursor: isZoomLocked
                  ? "not-allowed"
                  : corner === "nw" || corner === "se"
                    ? "nwse-resize"
                    : "nesw-resize",
                touchAction: "none",
                pointerEvents: "auto",
              }}
              {...(isZoomLocked
                ? createDisabledHandlers(zoomDisabledReason)
                : createDragHandlers({
                    of: "corner",
                    corner: corner,
                  }))}
            >
              <div
                style={{
                  width: cornerDotSize,
                  height: cornerDotSize,
                  boxSizing: "border-box",
                  borderRadius: "50%",
                  background: "#fff",
                  borderWidth: 1.5 / scale,
                  borderStyle: "solid",
                  borderColor: "var(--t-app-accent)",
                  opacity: isZoomLocked ? 0.45 : undefined,
                }}
              />
            </div>
          ),
        ))}
    </div>
  );
}
export {
  blurBeforeCrop,
  MediaCropEditor,
};
export function installEditorMediaCropEditor(): () => void {
  return () => {};
}
