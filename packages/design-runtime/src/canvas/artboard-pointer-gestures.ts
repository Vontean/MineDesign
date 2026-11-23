import type { Dynamic } from "../runtime-types";
import { announce } from "../editor/accessibility/announcer";
import { normalizeStyleEdits } from "../editor/css/edit-validation";
import { canStartCanvasDrag } from "../editor/geometry/resize";
import { cropIntoFrame, resizeImageCropFrame } from "../editor/media/crop-geometry";
import { imageCropStyleEdits, MediaObjectCropSupports, MediaObjectCropZoom, ThisBrowserCanTZoomAPictureMessage, YouCanTCropAnyFurtherAtMessage } from "../editor/media/object-crop";
import { holdPickerStyle, patchPickerStyle, pickerGesturePhase, resizePickerSelection } from "../editor/picker/bridge";
import { registerElementSession, registerLateGesture, unregisterElementSession } from "../editor/session/element-state";
import { createPreviewHandle } from "../preview/evaluation";
import { focusCanvasDocument } from "./focus";
import type { ArtboardBox } from "./frame-payloads";
import { reactCanvasShape } from "./shape";

type PointerHandlerEvent = Pick<PointerEvent, "pointerId" | "clientX" | "clientY" | "button" | "pointerType" | "stopPropagation"> & {
  currentTarget: Element;
};

export type ArtboardCropPointerHandler = (
  direction: string,
  event: PointerHandlerEvent,
  context: { frame: ArtboardBox; natural: ArtboardBox; rot: number },
) => boolean;

type GripHandle =
  | { kind: "resize"; dir: string }
  | { kind: "rotate"; corner: string }
  | { kind: "endpoint"; which: 0 | 1 };

interface ArtboardPointerOptions {
  iframeRef: { current: HTMLIFrameElement | null };
  chromeSlot: HTMLElement | null | undefined;
  box: ArtboardBox | null | undefined;
  artboardComponentId: string;
  crop: {
    selectedMediaRef: { current: Dynamic };
    activeMediaRef: { current: Dynamic };
    readCropEnabled(): boolean;
    readCropState(): number | null;
    setSelectedMedia: Dynamic;
  };
  applyStyleEdit(element: Element): number;
  replayStyleEdit(element: Element, editCount: number, edits: Dynamic): void;
  onHostGesture?(type: "element-crop" | "element-grip", active: boolean): void;
}

/** Coordinate the crop and transform handles drawn outside the preview iframe. */
export function useArtboardPointerGestures({
  iframeRef,
  chromeSlot,
  box,
  artboardComponentId,
  crop: { selectedMediaRef, activeMediaRef, readCropEnabled, readCropState, setSelectedMedia },
  applyStyleEdit,
  replayStyleEdit,
  onHostGesture,
}: ArtboardPointerOptions) {
  const pointerActive = (0, reactCanvasShape.useRef)(false);

  const handleCropPointerDown: ArtboardCropPointerHandler = (directions, cropPointerEvent, cropContext) => {
    let selectedMedia: Dynamic = selectedMediaRef.current,
      previewHandle: Dynamic = createPreviewHandle(
        iframeRef.current,
      ),
      mediaBounds: Dynamic = activeMediaRef.current;
    if (
      !selectedMedia ||
      !previewHandle ||
      !mediaBounds ||
      !chromeSlot ||
      !box ||
      pointerActive.current ||
      !readCropEnabled() ||
      !canStartCanvasDrag(cropPointerEvent)
    )
      return true;
    const boardBox = box;
    cropPointerEvent.stopPropagation();
    pointerActive.current = true;
    try {
      cropPointerEvent.currentTarget.setPointerCapture(cropPointerEvent.pointerId);
    } catch {}
    onHostGesture?.("element-crop", true);
    let [pointerId, pointerStartX, pointerStartY, chromeElement]: Dynamic = [
        cropPointerEvent.pointerId,
        cropPointerEvent.clientX,
        cropPointerEvent.clientY,
        chromeSlot,
      ],
      getCanvasScale: Dynamic = (): Dynamic => {
        let bounds: Dynamic = chromeElement.getBoundingClientRect();
        return bounds.width > 0 ? bounds.width / boardBox.w : 1;
      },
      toCanvasPoint: Dynamic = (
        clientX?: Dynamic,
        clientY?: Dynamic,
      ): Dynamic => {
        let bounds: Dynamic = chromeElement.getBoundingClientRect();
        return {
          x: (clientX - bounds.left) / getCanvasScale(),
          y: (clientY - bounds.top) / getCanvasScale(),
        };
      },
      pointerStartPoint: Dynamic = toCanvasPoint(pointerStartX, pointerStartY),
      {
        frame: cropFrame,
        natural: naturalImageSize,
        rot: rotation,
      }: Dynamic = cropContext,
      [liveCrop, supportsZoom, cropTid]: Dynamic = [
        selectedMedia.live,
        MediaObjectCropSupports(),
        selectedMedia.tid,
      ],
      isCurrentCrop: Dynamic = (): Dynamic =>
        selectedMediaRef.current === selectedMedia && readCropState() === cropTid,
      [widthDelta, heightDelta]: Dynamic = [
        mediaBounds.w - cropFrame.w,
        mediaBounds.h - cropFrame.h,
      ],
      resizeCropFrame: Dynamic = (
        direction?: Dynamic,
        nextFrame?: Dynamic,
      ): Dynamic => {
        let nextWidth: Dynamic =
            direction.includes("e") || direction.includes("w")
              ? Math.max(1, Math.round(nextFrame.w + widthDelta) - widthDelta)
              : cropFrame.w,
          nextHeight: Dynamic =
            direction.includes("n") || direction.includes("s")
              ? Math.max(1, Math.round(nextFrame.h + heightDelta) - heightDelta)
              : cropFrame.h;
        return {
          x: direction.includes("w") ? cropFrame.w - nextWidth : 0,
          y: direction.includes("n") ? cropFrame.h - nextHeight : 0,
          w: nextWidth,
          h: nextHeight,
        };
      },
      resizeForDirection: Dynamic = (direction?: Dynamic): Dynamic =>
        resizeCropFrame(directions, direction),
      { autoW: autoWidth, autoH: autoHeight }: Dynamic =
        mediaBounds.media ?? {},
      resizeDirection: Dynamic =
        directions.length === 2
          ? directions
          : directions === "e"
            ? autoHeight
              ? "se"
              : "e"
            : directions === "w"
              ? autoHeight
                ? "sw"
                : "w"
              : directions === "s"
                ? autoWidth
                  ? "se"
                  : "s"
                : autoWidth
                  ? "ne"
                  : "n";
    registerElementSession(artboardComponentId, selectedMedia.el);
    pickerGesturePhase(previewHandle, {
      phase: "start",
      kind: "resize",
      dir: resizeDirection,
      x: pointerStartPoint.x,
      y: pointerStartPoint.y,
    });
    let [hasMoved, zoomWarningShown, didResize]: Dynamic = [false, false, false],
      getCropStyleEdits: Dynamic = (
        liveState?: Dynamic,
        frameState?: Dynamic,
      ): Dynamic =>
        Object.fromEntries(
          imageCropStyleEdits(
            frameState,
            naturalImageSize,
            liveState,
          ).map(
            ([propertyName, propertyValue]: Dynamic): Dynamic => [
              propertyName,
              propertyValue ?? "none",
            ],
          ),
        ),
      updateCropState: Dynamic = (
        liveState?: Dynamic,
        frameState?: Dynamic,
      ): Dynamic => {
        selectedMedia.live = liveState;
        selectedMedia.at = {
          frame: frameState,
          natural: naturalImageSize,
        };
        setSelectedMedia(
          (selectedMediaState?: Dynamic): Dynamic =>
            selectedMediaState && {
              ...selectedMediaState,
              live: liveState,
            },
        );
      },
      handleCropPointerMove: Dynamic = (moveEvent: PointerEvent) => {
        if (
          moveEvent.pointerId !== pointerId ||
          (!hasMoved &&
            Math.hypot(moveEvent.clientX - pointerStartX, moveEvent.clientY - pointerStartY) <
              4)
        )
          return;
        if (!isCurrentCrop()) return finishCropGesture(false);
        hasMoved = true;
        let currentPoint: Dynamic = toCanvasPoint(moveEvent.clientX, moveEvent.clientY),
          [deltaX, deltaY, cosRotation, sinRotation]: Dynamic = [
            currentPoint.x - pointerStartPoint.x,
            currentPoint.y - pointerStartPoint.y,
            Math.cos(rotation),
            Math.sin(rotation),
          ],
          [rotatedDeltaX, rotatedDeltaY, minimumCropSize]: Dynamic = [
            deltaX * cosRotation + deltaY * sinRotation,
            deltaY * cosRotation - deltaX * sinRotation,
            Math.max(16 / getCanvasScale(), 8),
          ],
          exceedsZoomLimit: Dynamic = (cropResult?: Dynamic): Dynamic =>
            !supportsZoom && cropResult.zoom > Math.max(1, liveCrop.zoom) + 0.001,
          resizedCrop: Dynamic = resizeImageCropFrame(
            cropFrame,
            naturalImageSize,
            liveCrop,
            directions,
            rotatedDeltaX,
            rotatedDeltaY,
            minimumCropSize,
          ),
          constrainedFrame: Dynamic = resizeForDirection(resizedCrop.frame),
          nextCrop: Dynamic = cropIntoFrame(
            cropFrame,
            naturalImageSize,
            liveCrop,
            constrainedFrame,
          );
        for (let alternateDirection of (exceedsZoomLimit(nextCrop) && directions.length === 2
          ? [directions[1], directions[0]]
          : []) as Dynamic) {
          let alternateCrop: Dynamic = resizeImageCropFrame(
              cropFrame,
              naturalImageSize,
              liveCrop,
              alternateDirection,
              rotatedDeltaX,
              rotatedDeltaY,
              minimumCropSize,
            ),
            [alternateFrame, alternateCropResult]: Dynamic = [
              resizeCropFrame(alternateDirection, alternateCrop.frame),
              cropIntoFrame(
                cropFrame,
                naturalImageSize,
                liveCrop,
                resizeCropFrame(alternateDirection, alternateCrop.frame),
              ),
            ];
          if (!exceedsZoomLimit(alternateCropResult)) {
            [resizedCrop, constrainedFrame, nextCrop] = [alternateCrop, alternateFrame, alternateCropResult];
            break;
          }
        }
        let cropTooSmall: Dynamic =
          (constrainedFrame.w < selectedMedia.at.frame.w ||
            constrainedFrame.h < selectedMedia.at.frame.h) &&
          MediaObjectCropZoom(
            {
              w: constrainedFrame.w,
              h: constrainedFrame.h,
            },
            naturalImageSize,
            nextCrop,
          );
        if (exceedsZoomLimit(nextCrop) || cropTooSmall) {
          zoomWarningShown ||
            announce(
              exceedsZoomLimit(nextCrop)
                ? ThisBrowserCanTZoomAPictureMessage
                : YouCanTCropAnyFurtherAtMessage,
            );
          zoomWarningShown = true;
          return;
        }
        let edgeOffsetX: Dynamic = directions.includes("e")
            ? resizedCrop.frame.w - cropFrame.w
            : directions.includes("w")
              ? resizedCrop.frame.x
              : 0,
          edgeOffsetY: Dynamic = directions.includes("s")
            ? resizedCrop.frame.h - cropFrame.h
            : directions.includes("n")
              ? resizedCrop.frame.y
              : 0;
        resizePickerSelection(
          previewHandle,
          getCropStyleEdits(nextCrop, constrainedFrame),
        );
        didResize = true;
        pickerGesturePhase(previewHandle, {
          phase: "move",
          kind: "resize",
          x: pointerStartPoint.x + edgeOffsetX * cosRotation - edgeOffsetY * sinRotation,
          y: pointerStartPoint.y + edgeOffsetX * sinRotation + edgeOffsetY * cosRotation,
          shift: false,
        });
        updateCropState(nextCrop, {
          w: constrainedFrame.w,
          h: constrainedFrame.h,
        });
      },
      finishCropGesture: Dynamic = (shouldCommit?: Dynamic): Dynamic => {
        window.removeEventListener(
          "pointermove",
          handleCropPointerMove,
        );
        window.removeEventListener("pointerup", handlePointerUp);
        window.removeEventListener(
          "pointercancel",
          handlePointerCancel,
        );
        window.removeEventListener("blur", handleWindowBlur);
        window.removeEventListener(
          "keydown",
          handleCropKeyDown,
          true,
        );
        pointerActive.current = false;
        onHostGesture?.("element-crop", false);
        unregisterElementSession(
          artboardComponentId,
          selectedMedia.el,
          didResize,
        );
        let shouldPersistCrop: Dynamic =
          shouldCommit &&
          hasMoved &&
          isCurrentCrop() &&
          (Math.abs(selectedMedia.at.frame.w - cropFrame.w) >= 0.5 ||
            Math.abs(selectedMedia.at.frame.h - cropFrame.h) >= 0.5);
        if (shouldPersistCrop) {
          let normalizedEdits: Dynamic = normalizeStyleEdits(
              imageCropStyleEdits(
                selectedMedia.at.frame,
                naturalImageSize,
                selectedMedia.live,
              ),
            ),
            serializedEdits: Dynamic = JSON.stringify(normalizedEdits),
            editCount: Dynamic = applyStyleEdit(selectedMedia.el);
          registerLateGesture(artboardComponentId, cropTid, {
            el: selectedMedia.el,
            edits: normalizedEdits,
            lapsed: (status?: Dynamic): Dynamic => {
              if (status === "stale") return void (selectedMedia.wrote = "");
              selectedMediaRef.current === selectedMedia
                ? ((selectedMedia.wrote = ""),
                  isCurrentCrop() &&
                    patchPickerStyle(
                      previewHandle,
                      artboardComponentId,
                      [selectedMedia.tid],
                      getCropStyleEdits(selectedMedia.live, selectedMedia.at.frame),
                      selectedMedia.token,
                    ))
                : selectedMedia.closed === "held" &&
                  selectedMedia.wrote === serializedEdits &&
                  replayStyleEdit(selectedMedia.el, editCount, normalizedEdits);
            },
          });
          selectedMedia.wrote = serializedEdits;
        } else
          hasMoved &&
            selectedMediaRef.current === selectedMedia &&
            updateCropState(liveCrop, cropFrame);
        pickerGesturePhase(previewHandle, {
          phase: "end",
          kind: "resize",
          commit: shouldPersistCrop,
        });
        isCurrentCrop() &&
          holdPickerStyle(
            previewHandle,
            artboardComponentId,
            [selectedMedia.tid],
            getCropStyleEdits(selectedMedia.live, selectedMedia.at.frame),
            selectedMedia.token,
          );
      },
      handlePointerUp: Dynamic = (pointerEvent: PointerEvent) => {
        pointerEvent.pointerId === pointerId && finishCropGesture(true);
      },
      handlePointerCancel: Dynamic = (pointerEvent: PointerEvent) => {
        pointerEvent.pointerId === pointerId && finishCropGesture(false);
      },
      handleCropKeyDown: Dynamic = (event: KeyboardEvent) => {
        /^(Shift|Control|Alt|AltGraph|Meta|OS|CapsLock|NumLock)$/.test(
          event.key,
        ) ||
          (event.preventDefault(),
          event.stopImmediatePropagation(),
          event.key === "Escape" && finishCropGesture(false));
      },
      handleWindowBlur: Dynamic = (): Dynamic => finishCropGesture(true);
    window.addEventListener("pointermove", handleCropPointerMove);
    window.addEventListener("pointerup", handlePointerUp);
    window.addEventListener("pointercancel", handlePointerCancel);
    window.addEventListener("blur", handleWindowBlur);
    window.addEventListener("keydown", handleCropKeyDown, true);
    return true;
  };

  function handleGripDown(source: GripHandle, event: PointerHandlerEvent) {
    if (pointerActive.current || !chromeSlot || !box) return;
    const preview = createPreviewHandle(iframeRef.current);
    if (!preview || !canStartCanvasDrag(event)) return;

    const { pointerId, clientX, clientY, currentTarget } = event;
    const chromeElement = chromeSlot;
    const boardBox = box;
    focusCanvasDocument();
    event.stopPropagation();
    pointerActive.current = true;
    try {
      currentTarget.setPointerCapture(pointerId);
    } catch {}
    onHostGesture?.("element-grip", true);

    function toChromePoint(x: number, y: number) {
      const bounds = chromeElement.getBoundingClientRect();
      const scale = bounds.width > 0 ? bounds.width / boardBox.w : 1;
      return { x: (x - bounds.left) / scale, y: (y - bounds.top) / scale };
    }
    pickerGesturePhase(preview, { phase: "start", ...source, ...toChromePoint(clientX, clientY) });

    let hasMoved = false;
    function move(pointer: PointerEvent) {
      if (
        pointer.pointerId !== pointerId ||
        (!hasMoved && Math.hypot(pointer.clientX - clientX, pointer.clientY - clientY) < 4)
      ) return;
      hasMoved = true;
      pickerGesturePhase(preview, {
        phase: "move",
        kind: source.kind,
        ...toChromePoint(pointer.clientX, pointer.clientY),
        shift: pointer.shiftKey,
      });
    }

    function restoreCapture(pointer: PointerEvent) {
      if (pointer.pointerId !== pointerId || !pointerActive.current) return;
      try {
        chromeElement.setPointerCapture(pointerId);
      } catch {}
    }

    function finish(commit: boolean) {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", release);
      window.removeEventListener("pointercancel", cancel);
      window.removeEventListener("keydown", keyDown, true);
      document.removeEventListener("lostpointercapture", restoreCapture, true);
      pointerActive.current = false;
      onHostGesture?.("element-grip", false);
      pickerGesturePhase(preview, { phase: "end", kind: source.kind, commit });
    }

    function release(pointer: PointerEvent) {
      if (pointer.pointerId === pointerId) finish(hasMoved);
    }

    function cancel(pointer: PointerEvent) {
      if (pointer.pointerId === pointerId) finish(false);
    }

    function keyDown(key: KeyboardEvent) {
      if (key.key !== "Escape") return;
      key.preventDefault();
      key.stopImmediatePropagation();
      finish(false);
    }

    document.addEventListener("lostpointercapture", restoreCapture, true);
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", release);
    window.addEventListener("pointercancel", cancel);
    window.addEventListener("keydown", keyDown, true);
  }

  return { handleCropPointerDown, handleGripDown };
}
