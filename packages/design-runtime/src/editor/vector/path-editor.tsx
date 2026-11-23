import { useUiLocale } from '../../ui-locale.ts';
/** Restored application module; prepare first, initialize in original order. */
import {
  type Dynamic,
} from "../../runtime-types";
import { focusCanvasDocument } from "../../canvas/focus";
import { load_react_jsx_runtime } from "../../dependencies";
import { reactForVectorPathEditor } from "../hooks/latest-callback";
import { hasBlockingEditorOverlay } from "../text/typing-target";
import { VectorAnnotationPenEditorOverflowTouchActionConfig } from "./annotation-pen-editor";
import { VectorPathControls } from "./path-controls";
import { showVectorControls } from "./path-editing";
import { deleteVectorAnchorKeepingCurve } from "./path-parsing";
import { useVectorEditor } from "./use-vector-editor";
import { toModuleNamespace } from "../../module-helpers";

var jsxVectorPathEditor: Dynamic;
var VectorPathEditorConstant: Dynamic;
var TOUCH_CONTROL_PADDING_PX: Dynamic;
var AppifactPenAnchorClaimKey: Dynamic;
function VectorPathEditor({
  path: path,
  scale: scale,
  origin: origin,
  onLive: onLive,
  onCommit: onCommit,
  onCancel: onCancel,
  onGesture: onGesture,
  testId: testId,
}: Dynamic): Dynamic {
  useUiLocale();
  let [value, setSelected]: Dynamic = (0,
    reactForVectorPathEditor.useState)(undefined),
    editorRef: Dynamic = (0, reactForVectorPathEditor.useRef)(null),
    pathRef: Dynamic = (0, reactForVectorPathEditor.useRef)(path);
  pathRef.current = path;
  let livePathRef: Dynamic = (0, reactForVectorPathEditor.useRef)(null),
    committedPathRef: Dynamic = (0, reactForVectorPathEditor.useRef)(null),
    hoveredPointRef: Dynamic = (0, reactForVectorPathEditor.useRef)(null),
    selectedPoint: Dynamic = value,
    selectedAnchor: Dynamic = selectedPoint
      ? path.contours[selectedPoint.contour]?.anchors[selectedPoint.anchor]
      : undefined;
  if (selectedPoint && path !== committedPathRef.current && path !== livePathRef.current) {
    let current: Dynamic = hoveredPointRef.current;
    if (
      current &&
      (!selectedAnchor ||
        Math.abs(selectedAnchor.x - current.x) > 0.25 ||
        Math.abs(selectedAnchor.y - current.y) > 0.25)
    ) {
      let part: Dynamic = selectedPoint.part;
      selectedPoint = undefined;
      path.contours.forEach(
        (contour?: Dynamic, contourIndex?: Dynamic): Dynamic =>
          contour.anchors.forEach(
            (anchor?: Dynamic, anchorIndex?: Dynamic): Dynamic => {
              Math.abs(anchor.x - current.x) <= 0.25 &&
                Math.abs(anchor.y - current.y) <= 0.25 &&
                (selectedPoint = {
                  contour: contourIndex,
                  anchor: anchorIndex,
                  part:
                    part !== "anchor" && anchor.seg.kind !== "cubic"
                      ? "anchor"
                      : part,
                });
            },
          ),
      );
    } else selectedAnchor || (selectedPoint = undefined);
    let selectedCandidate: Dynamic = selectedPoint;
    selectedCandidate
      ? (selectedCandidate.contour !== value.contour ||
          selectedCandidate.anchor !== value.anchor ||
          selectedCandidate.part !== value.part) &&
        setSelected(selectedCandidate)
      : setSelected(undefined);
  }
  let selectedPointState: Dynamic = selectedPoint,
    selectedAnchorState: Dynamic = selectedPointState
      ? path.contours[selectedPointState.contour]?.anchors[selectedPointState.anchor]
      : undefined;
  hoveredPointRef.current = selectedAnchorState
    ? {
        x: selectedAnchorState.x,
        y: selectedAnchorState.y,
      }
    : null;
  committedPathRef.current = path;
  let viewportRef: Dynamic = (0, reactForVectorPathEditor.useRef)({
      left: 0,
      top: 0,
    }),
    viewTransform: Dynamic = (0, reactForVectorPathEditor.useMemo)(
      (): Dynamic => ({
        scale: scale,
        toScreen: (point?: Dynamic): Dynamic => ({
          x: (point.x - origin.x) * scale,
          y: (point.y - origin.y) * scale,
        }),
        toModel: (screenX?: Dynamic, screenY?: Dynamic): Dynamic => {
          let canvasBounds: Dynamic = editorRef.current?.getBoundingClientRect();
          return {
            x:
              origin.x +
              (screenX - (canvasBounds?.left ?? 0) + viewportRef.current.left) / scale,
            y:
              origin.y +
              (screenY - (canvasBounds?.top ?? 0) + viewportRef.current.top) / scale,
          };
        },
      }),
      [scale, origin.x, origin.y],
    ),
    interactionRef: Dynamic = (0, reactForVectorPathEditor.useRef)({});
  (0, reactForVectorPathEditor.useEffect)((): Dynamic => {
    let handleSelectionChange: Dynamic = (selection?: Dynamic): Dynamic => {
      selection.detail !== interactionRef.current && setSelected(undefined);
    };
    (window as Dynamic).addEventListener(
      AppifactPenAnchorClaimKey,
      handleSelectionChange,
    );
    return (): Dynamic =>
      (window as Dynamic).removeEventListener(
        AppifactPenAnchorClaimKey,
        handleSelectionChange,
      );
  }, []);
  let editorSession: Dynamic = useVectorEditor({
      path: path,
      onLive: (liveSelection?: Dynamic): Dynamic => {
        livePathRef.current = liveSelection;
        onLive(liveSelection);
      },
      onCommit: (committedSelection?: Dynamic, committedPath?: Dynamic): Dynamic => {
        livePathRef.current = committedPath;
        onCommit(committedSelection, committedPath);
      },
      tool: "select",
      selected: selectedPointState,
      onSelect: (selection?: Dynamic): Dynamic => {
        selection &&
          (window as Dynamic).dispatchEvent(
            new CustomEvent(AppifactPenAnchorClaimKey, {
              detail: interactionRef.current,
            }),
          );
        setSelected(selection);
      },
      view: viewTransform,
      controls: "selected",
    }),
    { handles: pointerHandlers }: Dynamic = editorSession,
    gestureRef: Dynamic = (0, reactForVectorPathEditor.useRef)(null),
    interactionHandlers: Dynamic = (0, reactForVectorPathEditor.useRef)({
      onCancel: onCancel,
      onGesture: onGesture,
    });
  interactionHandlers.current = {
    onCancel: onCancel,
    onGesture: onGesture,
  };
  (0, reactForVectorPathEditor.useEffect)(
    (): Dynamic => (): Dynamic => gestureRef.current?.end("cancel"),
    [],
  );
  (0, reactForVectorPathEditor.useEffect)((): Dynamic => {
    let activeSelection: Dynamic = selectedPointState;
    if (!activeSelection) return;
    let handleKeyDown: Dynamic = (event?: Dynamic): Dynamic => {
      if (event.key !== "Delete" && event.key !== "Backspace") return;
      let target: Dynamic = event.target;
      if (
        (target &&
          (target.tagName === "INPUT" ||
            target.tagName === "TEXTAREA" ||
            target.isContentEditable)) ||
        hasBlockingEditorOverlay()
      )
        return;
      let nextSelection: Dynamic =
        activeSelection.part === "anchor"
          ? deleteVectorAnchorKeepingCurve(
              pathRef.current,
              activeSelection,
            )
          : pathRef.current;
      nextSelection &&
        (event.preventDefault(),
        event.stopImmediatePropagation(),
        activeSelection.part === "anchor" &&
          (gestureRef.current?.end("cancel"),
          editorSession.cancelSession(),
          setSelected(undefined),
          (livePathRef.current = nextSelection),
          onCommit(pathRef.current, nextSelection, true)));
    };
    (window as Dynamic).addEventListener("keydown", handleKeyDown, true);
    return (): Dynamic =>
      (window as Dynamic).removeEventListener("keydown", handleKeyDown, true);
  }, [selectedPointState?.contour, selectedPointState?.anchor, selectedPointState?.part, onCommit]);
  let callback: Dynamic = (pointerDownEvent?: Dynamic): Dynamic => {
      if (pointerDownEvent.button !== 0 || gestureRef.current) return;
      pointerDownEvent.stopPropagation();
      let activeElement: Dynamic = (document as Dynamic).activeElement;
      activeElement &&
        activeElement.tagName === "IFRAME" &&
        activeElement.blur();
      focusCanvasDocument();
      pointerHandlers.onPointerDown(pointerDownEvent);
      let pointerId: Dynamic = pointerDownEvent.pointerId,
        handlePointerCancel: Dynamic = (pointerEvent?: Dynamic): Dynamic => {
          pointerEvent.pointerId === pointerId && gestureRef.current?.end("cancel");
        };
      gestureRef.current = {
        end: (endReason?: Dynamic): Dynamic => {
          gestureRef.current = null;
          (window as Dynamic).removeEventListener("pointerup", handlePointerCancel);
          (window as Dynamic).removeEventListener("pointercancel", handlePointerCancel);
          endReason === "cancel" &&
            (editorSession.cancelSession(), interactionHandlers.current.onCancel());
          interactionHandlers.current.onGesture?.(false);
        },
      };
      (window as Dynamic).addEventListener("pointerup", handlePointerCancel);
      (window as Dynamic).addEventListener("pointercancel", handlePointerCancel);
      onGesture?.(true);
    },
    handlePointerUp: Dynamic = (pointerEvent?: Dynamic): Dynamic => {
      pointerHandlers.onPointerUp(pointerEvent);
      gestureRef.current?.end("up");
    },
    handlePointerCancelEvent: Dynamic = (pointerEvent?: Dynamic): Dynamic => {
      pointerHandlers.onPointerCancel(pointerEvent);
      gestureRef.current?.end("cancel");
    },
    state: Dynamic = {
      onPointerDown: callback,
      onPointerMove: pointerHandlers.onPointerMove,
      onPointerUp: handlePointerUp,
      onPointerCancel: handlePointerCancelEvent,
    },
    controlPadding: Dynamic =
      editorSession.hitRadiusPx === TOUCH_CONTROL_PADDING_PX
        ? TOUCH_CONTROL_PADDING_PX
        : VectorPathEditorConstant,
    items: Dynamic = [],
    [minX, minY, maxX, maxY]: Dynamic = [
      1 / 0,
      1 / 0,
      -1 / 0,
      -1 / 0,
    ];
  path.contours.forEach(
    (contour?: Dynamic, contourIndex?: Dynamic): Dynamic =>
      contour.anchors.forEach(
        (anchor?: Dynamic, anchorIndex?: Dynamic): Dynamic => {
          let renderControl: Dynamic = (
            controlPoint?: Dynamic,
            hoverPoint?: Dynamic,
            cursor?: Dynamic,
          ): Dynamic => {
            let screenPoint: Dynamic = viewTransform.toScreen(hoverPoint);
            [minX, minY, maxX, maxY] = [
              Math.min(minX, screenPoint.x),
              Math.min(minY, screenPoint.y),
              Math.max(maxX, screenPoint.x),
              Math.max(maxY, screenPoint.y),
            ];
            items.push({
              key: controlPoint,
              s: screenPoint,
              cursor: cursor,
            });
          };
          anchorIndex > 0 &&
            anchor.seg.kind === "cubic" &&
            (showVectorControls(
              "selected",
              contour,
              contourIndex,
              anchorIndex,
              "c",
              selectedPointState,
            ) &&
              renderControl(
                `c1${String(contourIndex)}:${String(anchorIndex)}`,
                anchor.seg.c1,
                "crosshair",
              ),
            showVectorControls(
              "selected",
              contour,
              contourIndex,
              anchorIndex,
              "c2",
              selectedPointState,
            ) &&
              renderControl(
                `c2${String(contourIndex)}:${String(anchorIndex)}`,
                anchor.seg.c2,
                "crosshair",
              ));
          renderControl(
            `a${String(contourIndex)}:${String(anchorIndex)}`,
            anchor,
            "move",
          );
        },
      ),
  );
  let canvasRect: Dynamic = items.length
    ? {
        left: minX - controlPadding - 2,
        top: minY - controlPadding - 2,
        w: maxX - minX + 2 * controlPadding + 4,
        h: maxY - minY + 2 * controlPadding + 4,
      }
    : {
        left: 0,
        top: 0,
        w: 1,
        h: 1,
      };
  viewportRef.current = canvasRect;
  return (
    <svg
      ref={editorRef}
      data-mega-chrome={"pen-anchors"}
      data-testid={testId}
      className={"pointer-events-none absolute select-none"}
      width={canvasRect.w}
      height={canvasRect.h}
      style={{
        ...VectorAnnotationPenEditorOverflowTouchActionConfig,
        left: canvasRect.left,
        top: canvasRect.top,
      }}
    >
      <g
        transform={`translate(${String(-canvasRect.left)} ${String(-canvasRect.top)})`}
      >
        <VectorPathControls
          path={path}
          selected={selectedPointState}
          draft={editorSession.draft}
          hover={undefined}
          view={viewTransform}
          hitRadiusPx={editorSession.hitRadiusPx}
          controls={"selected"}
        />
        {items.map(
          ({ key: key, s: s, cursor: cursor }: Dynamic): Dynamic => (
            <circle
              key={key}
              data-pen-part={key}
              cx={s.x}
              cy={s.y}
              r={controlPadding}
              fill={"transparent"}
              style={{
                pointerEvents: "auto",
                cursor: cursor,
                touchAction: "none",
              }}
              {...state}
            />
          ),
        )}
      </g>
    </svg>
  );
}
export {
  AppifactPenAnchorClaimKey,
  jsxVectorPathEditor,
  VectorPathEditor,
  VectorPathEditorConstant,
  TOUCH_CONTROL_PADDING_PX,
};
export function installEditorVectorPathEditor(): () => void {
  return () => {
    jsxVectorPathEditor = toModuleNamespace(
      load_react_jsx_runtime(),
      1,
    );
    VectorPathEditorConstant = 10;
    TOUCH_CONTROL_PADDING_PX = 20;
    AppifactPenAnchorClaimKey = "appifact-pen-anchor-claim";
  };
}
