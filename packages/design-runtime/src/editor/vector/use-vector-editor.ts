/** Restored application module; prepare first, initialize in original order. */
import {
  type Dynamic,
} from "../../runtime-types";
import { reactHooksLatestCallback_4 } from "../hooks/latest-callback";
import { blurVectorInput, captureVectorPointer, constrainVectorPointAngle, deleteVectorAnchor, moveVectorPart, previousContourAnchor, resetVectorControl, sameVectorPath, showVectorControls, vectorHitRadius, vectorPartPoint, VectorPathEditingConstant, VectorPathEditingConstant_2 as TOUCH_HIT_RADIUS_PX, VectorPathEditingLimit, vectorUsesCoarsePointer } from "./path-editing";

function useVectorEditor(request?: Dynamic): Dynamic {
  let [value, setRequest]: Dynamic = (0,
    reactHooksLatestCallback_4.useState)([]),
    draftRef: Dynamic = (0, reactHooksLatestCallback_4.useRef)([]),
    setDraft: Dynamic = (0, reactHooksLatestCallback_4.useCallback)(
      (nextRequest?: Dynamic): Dynamic => {
        draftRef.current = nextRequest;
        setRequest(nextRequest);
      },
      [],
    ),
    [hoveredPoint, setHoveredPoint]: Dynamic = (0,
    reactHooksLatestCallback_4.useState)(undefined),
    activePointerRef: Dynamic = (0, reactHooksLatestCallback_4.useRef)(
      undefined,
    ),
    pointerTypeRef: Dynamic = (0, reactHooksLatestCallback_4.useRef)("mouse"),
    pointerIdRef: Dynamic = (0, reactHooksLatestCallback_4.useRef)(
      undefined,
    ),
    shiftKeyRef: Dynamic = (0, reactHooksLatestCallback_4.useRef)(false),
    pathRef: Dynamic = (0, reactHooksLatestCallback_4.useRef)(
      request.path,
    );
  pathRef.current = request.path;
  let viewRef: Dynamic = (0, reactHooksLatestCallback_4.useRef)(
    request.view,
  );
  viewRef.current = request.view;
  let interactionModeRef: Dynamic = (0, reactHooksLatestCallback_4.useRef)(
      undefined,
    ),
    gestureRef: Dynamic = (0, reactHooksLatestCallback_4.useRef)(
      undefined,
    ),
    livePathRef: Dynamic = (0, reactHooksLatestCallback_4.useRef)(null),
    hitRadius: Dynamic = vectorUsesCoarsePointer()
      ? TOUCH_HIT_RADIUS_PX
      : VectorPathEditingConstant,
    getPointAtEvent: Dynamic = (0, reactHooksLatestCallback_4.useCallback)(
      (point?: Dynamic, radius?: Dynamic): Dynamic => {
        let modelRadius: Dynamic = radius / request.view.scale,
          radiusSquared: Dynamic = modelRadius * modelRadius,
          nearestDistance: Dynamic,
          nearestPoint: Dynamic = radiusSquared,
          callback: Dynamic = (
            candidate?: Dynamic,
            candidateIndex?: Dynamic,
          ): Dynamic => {
            let deltaX: Dynamic = candidate.x - point.x,
              deltaY: Dynamic = candidate.y - point.y,
              distanceSquared: Dynamic = deltaX * deltaX + deltaY * deltaY;
            distanceSquared <= nearestPoint && ((nearestPoint = distanceSquared), (nearestDistance = candidateIndex));
          };
        request.path.contours.forEach(
          (contour?: Dynamic, contourIndex?: Dynamic): Dynamic => {
            contour.anchors.forEach(
              (anchor?: Dynamic, anchorIndex?: Dynamic): Dynamic => {
                callback(anchor, {
                  contour: contourIndex,
                  anchor: anchorIndex,
                  part: "anchor",
                });
                if (!(anchorIndex > 0 || contour.closed)) return;
                let getControlPoint: Dynamic = (controlPart?: Dynamic): Dynamic =>
                  showVectorControls(
                    request.controls,
                    contour,
                    contourIndex,
                    anchorIndex,
                    controlPart,
                    request.selected,
                  );
                anchor.seg.kind === "quad"
                  ? getControlPoint("c") &&
                    callback(anchor.seg.c, {
                      contour: contourIndex,
                      anchor: anchorIndex,
                      part: "c",
                    })
                  : anchor.seg.kind === "cubic" &&
                    (getControlPoint("c") &&
                      callback(anchor.seg.c1, {
                        contour: contourIndex,
                        anchor: anchorIndex,
                        part: "c",
                      }),
                    getControlPoint("c2") &&
                      callback(anchor.seg.c2, {
                        contour: contourIndex,
                        anchor: anchorIndex,
                        part: "c2",
                      }));
              },
            );
          },
        );
        return nearestDistance;
      },
      [request.path, request.view.scale, request.controls, request.selected],
    ),
    getChordOrigin: Dynamic = (0, reactHooksLatestCallback_4.useCallback)(
      (selection?: Dynamic): Dynamic => {
        let contour: Dynamic = request.path.contours[selection.contour];
        if (!contour) return;
        let anchor: Dynamic = contour.anchors[selection.anchor];
        if (!anchor) return;
        if (selection.part === "c" && anchor.seg.kind === "cubic") {
          let previousAnchor: Dynamic = previousContourAnchor(
            contour,
            selection.anchor,
          );
          return previousAnchor
            ? {
                x: previousAnchor.x,
                y: previousAnchor.y,
              }
            : {
                x: anchor.x,
                y: anchor.y,
              };
        }
        if (selection.part !== "anchor")
          return {
            x: anchor.x,
            y: anchor.y,
          };
        let nextAnchor: Dynamic = previousContourAnchor(
          contour,
          selection.anchor,
        );
        return nextAnchor
          ? {
              x: nextAnchor.x,
              y: nextAnchor.y,
            }
          : undefined;
      },
      [request.path],
    ),
    handlePointerDown: Dynamic = (0, reactHooksLatestCallback_4.useCallback)(
      (event?: Dynamic): Dynamic => {
        if (event.button !== 0) return;
        let modelPoint: Dynamic = request.view.toModel(
          event.clientX,
          event.clientY,
        );
        if (request.readOnly) {
          request.tool !== "pen"
            ? request.onPanStart?.(event)
            : captureVectorPointer(
                event.currentTarget,
                event.pointerId,
              );
          return;
        }
        if (request.tool === "pen") {
          event.preventDefault();
          if (pointerIdRef.current !== undefined) return;
          blurVectorInput();
          let current: Dynamic = draftRef.current,
            firstDraftPoint: Dynamic =
              event.shiftKey && current.length > 0
                ? constrainVectorPointAngle(
                    current[current.length - 1],
                    modelPoint,
                  )
                : modelPoint;
          if (current.length >= 3) {
            let draftStart: Dynamic = current[0],
              draftEnd: Dynamic =
                vectorHitRadius(event) / request.view.scale;
            if (
              Math.hypot(draftStart.x - firstDraftPoint.x, draftStart.y - firstDraftPoint.y) <=
              draftEnd
            ) {
              pointerIdRef.current = event.pointerId;
              interactionModeRef.current = "close";
              captureVectorPointer(
                event.currentTarget,
                event.pointerId,
              );
              return;
            }
          }
          setDraft([...current, firstDraftPoint]);
          interactionModeRef.current = "append";
          setHoveredPoint(firstDraftPoint);
          captureVectorPointer(
            event.currentTarget,
            event.pointerId,
          );
          return;
        }
        if (gestureRef.current) return;
        let selectedPoint: Dynamic = getPointAtEvent(
          modelPoint,
          Math.max(vectorHitRadius(event), hitRadius),
        );
        request.onSelect(selectedPoint);
        if (!selectedPoint) {
          request.onPanStart?.(event);
          return;
        }
        blurVectorInput();
        event.preventDefault();
        captureVectorPointer(
          event.currentTarget,
          event.pointerId,
        );
        let selectedPartPoint: Dynamic = vectorPartPoint(
          request.path,
          selectedPoint,
        );
        gestureRef.current = {
          sel: selectedPoint,
          before: request.path,
          chordOrigin: getChordOrigin(selectedPoint),
          startModel: modelPoint,
          grabOffset: selectedPartPoint
            ? {
                x: selectedPartPoint.x - modelPoint.x,
                y: selectedPartPoint.y - modelPoint.y,
              }
            : {
                x: 0,
                y: 0,
              },
          startScreen: {
            x: event.clientX,
            y: event.clientY,
          },
          pointerId: event.pointerId,
          moved: false,
        };
        livePathRef.current = null;
      },
      [
        request.readOnly,
        request.tool,
        request.view,
        request.path,
        value,
        getPointAtEvent,
        getChordOrigin,
      ],
    ),
    handlePointerMove: Dynamic = (0, reactHooksLatestCallback_4.useCallback)(
      (pointerEvent?: Dynamic): Dynamic => {
        let modelPoint: Dynamic = request.view.toModel(
          pointerEvent.clientX,
          pointerEvent.clientY,
        );
        if (request.tool === "pen") {
          let draftPoints: Dynamic = draftRef.current;
          pointerTypeRef.current = pointerEvent.pointerType;
          pointerEvent.buttons === 0 && (activePointerRef.current = modelPoint);
          setHoveredPoint(
            pointerEvent.shiftKey && draftPoints.length > 0
              ? constrainVectorPointAngle(
                  draftPoints[draftPoints.length - 1],
                  modelPoint,
                )
              : modelPoint,
          );
          return;
        }
        let current: Dynamic = gestureRef.current;
        if (!current || pointerEvent.pointerId !== current.pointerId) return;
        if (!current.moved) {
          let screenDeltaX: Dynamic = pointerEvent.clientX - current.startScreen.x,
            screenDeltaY: Dynamic = pointerEvent.clientY - current.startScreen.y;
          if (Math.hypot(screenDeltaX, screenDeltaY) < VectorPathEditingLimit)
            return;
          current.moved = true;
          current.before = pathRef.current;
          let selectedPartPoint: Dynamic = vectorPartPoint(
            current.before,
            current.sel,
          );
          selectedPartPoint &&
            (current.grabOffset = {
              x: selectedPartPoint.x - current.startModel.x,
              y: selectedPartPoint.y - current.startModel.y,
            });
          current.chordOrigin = getChordOrigin(current.sel);
        }
        let state: Dynamic = {
            x: modelPoint.x + current.grabOffset.x,
            y: modelPoint.y + current.grabOffset.y,
          },
          shouldConstrain: Dynamic = pointerEvent.shiftKey
            ? constrainVectorPointAngle(
                current.chordOrigin ?? {
                  x: current.startModel.x + current.grabOffset.x,
                  y: current.startModel.y + current.grabOffset.y,
                },
                state,
              )
            : state;
        current.lastRaw = state;
        let updatedPath: Dynamic = moveVectorPart(
          current.before,
          current.sel,
          shouldConstrain,
        );
        livePathRef.current = updatedPath;
        request.onLive(updatedPath);
      },
      [request.tool, request.view, request.onLive, value, getChordOrigin],
    ),
    handlePointerUp: Dynamic = (0, reactHooksLatestCallback_4.useCallback)(
      (pointerEvent?: Dynamic): Dynamic => {
        if (pointerIdRef.current === pointerEvent.pointerId) {
          pointerIdRef.current = undefined;
          interactionModeRef.current = undefined;
          let draftPoints: Dynamic = draftRef.current,
            firstPoint: Dynamic = draftPoints[0];
          if (firstPoint) {
            let viewTransform: Dynamic = viewRef.current,
              modelPoint: Dynamic = viewTransform.toModel(
                pointerEvent.clientX,
                pointerEvent.clientY,
              ),
              lastPoint: Dynamic = draftPoints[draftPoints.length - 1],
              distanceToStart: Dynamic =
                pointerEvent.shiftKey && draftPoints.length > 0 && lastPoint
                  ? constrainVectorPointAngle(lastPoint, modelPoint)
                  : modelPoint,
              pointToStart: Dynamic =
                vectorHitRadius(pointerEvent) / viewTransform.scale;
            Math.hypot(firstPoint.x - distanceToStart.x, firstPoint.y - distanceToStart.y) <=
              pointToStart && cancelGesture.current();
          }
          return;
        }
        let current: Dynamic = gestureRef.current;
        if (
          !current ||
          pointerEvent.pointerId !== current.pointerId ||
          ((gestureRef.current = undefined), !current.moved)
        )
          return;
        let livePath: Dynamic = livePathRef.current;
        livePathRef.current = null;
        livePath &&
          !sameVectorPath(livePath, current.before) &&
          request.onCommit(current.before, livePath);
      },
      [request.onCommit],
    ),
    cancelSession: Dynamic = (0,
    reactHooksLatestCallback_4.useCallback)((): Dynamic => {
      pointerIdRef.current = undefined;
      let current: Dynamic = gestureRef.current;
      gestureRef.current = undefined;
      current &&
        ((livePathRef.current = null),
        current.moved && request.onLive(current.before));
    }, [request.onLive]);
  (0, reactHooksLatestCallback_4.useEffect)((): Dynamic => {
    let callback: Dynamic = (keyboardEvent?: Dynamic): Dynamic => {
      if (keyboardEvent.key !== "Shift") return;
      let isShiftKeyDown: Dynamic = keyboardEvent.type === "keydown";
      shiftKeyRef.current = isShiftKeyDown;
      let current: Dynamic = gestureRef.current;
      if (current && current.moved && current.lastRaw) {
        let shiftSelection: Dynamic = isShiftKeyDown
            ? constrainVectorPointAngle(
                current.chordOrigin ?? {
                  x: current.startModel.x + current.grabOffset.x,
                  y: current.startModel.y + current.grabOffset.y,
                },
                current.lastRaw,
              )
            : current.lastRaw,
          updatedPath: Dynamic = moveVectorPart(
            current.before,
            current.sel,
            shiftSelection,
          );
        livePathRef.current = updatedPath;
        request.onLive(updatedPath);
      }
      if (request.tool === "pen" && activePointerRef.current) {
        let draftPoints: Dynamic = draftRef.current;
        setHoveredPoint(
          isShiftKeyDown && draftPoints.length > 0
            ? constrainVectorPointAngle(
                draftPoints[draftPoints.length - 1],
                activePointerRef.current,
              )
            : activePointerRef.current,
        );
      }
    };
    (window as Dynamic).addEventListener("keydown", callback);
    (window as Dynamic).addEventListener("keyup", callback);
    return (): Dynamic => {
      (window as Dynamic).removeEventListener("keydown", callback);
      (window as Dynamic).removeEventListener("keyup", callback);
    };
  }, [request.tool, request.onLive]);
  (0, reactHooksLatestCallback_4.useEffect)((): Dynamic => {
    request.tool !== "pen" &&
      ((pointerIdRef.current = undefined),
      draftRef.current.length > 0 && setDraft([]),
      resetInteraction());
  }, [request.tool]);
  function resetInteraction(): Dynamic {
    setHoveredPoint(undefined);
    activePointerRef.current = undefined;
  }
  function commitPath(items?: Dynamic, constrain?: Dynamic): Dynamic {
    let current: Dynamic = activePointerRef.current;
    if (!current || items.length === 0) {
      resetInteraction();
      return;
    }
    let lastPoint: Dynamic = items[items.length - 1];
    setHoveredPoint(
      constrain && lastPoint
        ? constrainVectorPointAngle(lastPoint, current)
        : current,
    );
  }
  function buildPath(): Dynamic {
    let current: Dynamic = draftRef.current;
    if (current.length < 3) return;
    pointerIdRef.current = undefined;
    let anchors: Dynamic = current.map(
        (point?: Dynamic): Dynamic => ({
          x: point.x,
          y: point.y,
          seg: {
            kind: "line",
          },
        }),
      ),
      path: Dynamic = request.path;
    request.onCommit(path, {
      contours: [
        ...path.contours,
        {
          anchors: anchors,
          closed: true,
        },
      ],
    });
    setDraft([]);
    resetInteraction();
    request.onToolDone?.();
  }
  let cancelGesture: Dynamic = (0, reactHooksLatestCallback_4.useRef)(
    buildPath,
  );
  cancelGesture.current = buildPath;
  let handleKeyboard: Dynamic = (0, reactHooksLatestCallback_4.useCallback)(
    (event?: Dynamic): Dynamic => {
      if (request.tool === "pen") {
        if (
          event.key === "Enter" &&
          !request.readOnly &&
          draftRef.current.length >= 3
        ) {
          event.preventDefault();
          buildPath();
          return true;
        }
        if (event.key === "Escape") {
          event.preventDefault();
          pointerIdRef.current = undefined;
          setDraft([]);
          resetInteraction();
          request.onToolDone?.();
          return true;
        }
        if (event.key === "Backspace" && draftRef.current.length > 0) {
          event.preventDefault();
          let remainingDraft: Dynamic = draftRef.current.slice(0, -1);
          setDraft(remainingDraft);
          interactionModeRef.current = undefined;
          commitPath(remainingDraft, event.shiftKey === true);
          return true;
        }
        if (event.key !== "Delete" && event.key !== "Backspace") return false;
      }
      if (
        (event.key === "Delete" || event.key === "Backspace") &&
        request.selected &&
        !request.readOnly
      ) {
        event.preventDefault();
        let current: Dynamic = gestureRef.current;
        cancelSession();
        let basePath: Dynamic = current?.moved ? current.before : request.path,
          nextPath: Dynamic =
            request.selected.part === "anchor"
              ? deleteVectorAnchor(basePath, request.selected)
              : resetVectorControl(basePath, request.selected);
        nextPath !== basePath &&
          (request.onCommit(basePath, nextPath), request.onSelect(undefined));
        return true;
      }
      return false;
    },
    [request.tool, request.selected, request.readOnly, request.path],
  );
  return {
    handles: {
      onPointerDown: handlePointerDown,
      onPointerMove: handlePointerMove,
      onPointerLeave: (pointerEvent?: Dynamic): Dynamic => {
        pointerEvent.pointerType === "touch"
          ? pointerTypeRef.current === "touch" && setHoveredPoint(undefined)
          : resetInteraction();
      },
      onPointerUp: handlePointerUp,
      onPointerCancel: (pointerEvent?: Dynamic): Dynamic => {
        if (pointerIdRef.current === pointerEvent.pointerId) {
          pointerIdRef.current = undefined;
          interactionModeRef.current = undefined;
          return;
        }
        let current: Dynamic = gestureRef.current;
        if (current && pointerEvent.pointerId === current.pointerId) {
          cancelSession();
          return;
        }
      },
      handleKey: handleKeyboard,
    },
    draft: value,
    hover: hoveredPoint,
    hitRadiusPx: hitRadius,
    cancelSession: cancelSession,
    closeDraft: buildPath,
    discardDraft: (): Dynamic => {
      pointerIdRef.current = undefined;
      setDraft([]);
      resetInteraction();
      request.onToolDone?.();
    },
    cancelPenDown: (): Dynamic => {
      if (interactionModeRef.current === "append") {
        let remainingDraft: Dynamic = draftRef.current.slice(0, -1);
        setDraft(remainingDraft);
        commitPath(remainingDraft, shiftKeyRef.current);
      } else interactionModeRef.current === "close" && (pointerIdRef.current = undefined);
      interactionModeRef.current = undefined;
    },
  };
}
export {
  useVectorEditor,
};
export function installEditorVectorUseVectorEditor(): () => void {
  return () => {};
}
