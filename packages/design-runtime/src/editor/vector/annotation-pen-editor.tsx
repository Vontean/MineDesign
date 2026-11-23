import { uiMessage } from '@minedesign/contracts/ui-messages';
import { useUiLocale } from '../../ui-locale.ts';
/** Restored application module; prepare first, initialize in original order. */
import {
  type Dynamic,
} from "../../runtime-types";
import { reactForVectorPathEditor } from "../hooks/latest-callback";
import { VectorPathEditor } from "./path-editor";
import { parseVectorPath, serializeVectorPathBounds } from "./path-parsing";
import { minShapeDimension as MIN_SHAPE_DIMENSION, maxCanvasItemDimension as MAX_CANVAS_ITEM_DIMENSION, maxPenPathChars as MAX_PEN_PATH_CHARS, sanitizePenPath as normalizePenPath } from "../../platform/file-content";

var VectorAnnotationPenEditorOverflowTouchActionConfig: Dynamic;
var VectorAnnotationPenEditorConstant: Dynamic;
var annotationVectorKey: Dynamic;
function simplifyVectorPath(
  pathData?: Dynamic,
  transform?: Dynamic,
  maxPathLength?: Dynamic,
): Dynamic {
  let scaleFactor: Dynamic =
      Math.max(Math.abs(transform.sx), Math.abs(transform.sy)) || 1,
    simplifiedPath: Dynamic = parseVectorPath(
      pathData,
      transform,
      VectorAnnotationPenEditorConstant * scaleFactor,
    );
  for (
    let tolerance: Dynamic = 2 * VectorAnnotationPenEditorConstant;
    tolerance <= 64 * VectorAnnotationPenEditorConstant &&
    /L/.test(pathData) &&
    (serializeVectorPathBounds(simplifiedPath, 1)?.d.length ?? 0) >
      maxPathLength;
    tolerance *= 2
  )
    simplifiedPath = parseVectorPath(pathData, transform, tolerance * scaleFactor);
  return simplifiedPath;
}
function AnnotationPenEditor({
  spec: spec,
  ext: extension,
  scale: scale,
  onChange: onChange,
  onGesture: onGesture,
  armWindowGestureEnd: armWindowGestureEnd,
}: Dynamic): Dynamic {
  useUiLocale();
  let sourceKey: Dynamic = annotationVectorKey(spec),
    [pathState, setPathState]: Dynamic = (0,
    reactForVectorPathEditor.useState)(
      (): Dynamic => ({
        source: sourceKey,
        path: annotationVectorPath(spec, extension),
      }),
    );
  pathState.source !== sourceKey &&
    setPathState({
      source: sourceKey,
      path: annotationVectorPath(spec, extension),
    });
  let gestureRef: Dynamic = (0, reactForVectorPathEditor.useRef)(null),
    callback: Dynamic = (bounds?: Dynamic): Dynamic => ({
      x: bounds.x,
      y: bounds.y,
      w: Math.max(MIN_SHAPE_DIMENSION, bounds.w),
      h: Math.max(MIN_SHAPE_DIMENSION, bounds.h),
      d: bounds.d,
    }),
    commitPath: Dynamic = (
      bounds?: Dynamic,
      path?: Dynamic,
      isFinal?: Dynamic,
    ): Dynamic => {
      setPathState({
        source: annotationVectorKey(bounds),
        path: path,
      });
      onChange(bounds, isFinal);
    },
    restoreOriginal: Dynamic = (): Dynamic => {
      let currentBounds: Dynamic = gestureRef.current ?? {
        x: spec.x,
        y: spec.y,
        w: spec.w,
        h: spec.h,
        d: spec.d,
      };
      setPathState({
        source: annotationVectorKey(currentBounds),
        path: annotationVectorPath(currentBounds, annotationPenViewBox(currentBounds)),
      });
      onChange(currentBounds, false);
    },
    serializeCandidate: Dynamic = (
      path?: Dynamic,
      includeCommands: Dynamic = false,
    ): Dynamic => {
      let serializedBounds: Dynamic = serializeVectorPathBounds(
        path,
        1,
        !includeCommands,
      );
      return !serializedBounds ||
        serializedBounds.w > MAX_CANVAS_ITEM_DIMENSION ||
        serializedBounds.h > MAX_CANVAS_ITEM_DIMENSION ||
        normalizePenPath(serializedBounds.d) === null
        ? null
        : {
            ...serializedBounds,
            x: Math.round(serializedBounds.x * 10) / 10,
            y: Math.round(serializedBounds.y * 10) / 10,
          };
    };
  return (
    <VectorPathEditor
      testId={"mega-pen-anchors-" + spec.id}
      path={pathState.path}
      scale={scale}
      origin={{
        x: spec.x,
        y: spec.y,
      }}
      onGesture={(gestureBounds?: Dynamic): Dynamic => {
        gestureRef.current = gestureBounds
          ? {
              x: spec.x,
              y: spec.y,
              w: spec.w,
              h: spec.h,
              d: spec.d,
            }
          : null;
        onGesture("ann-anchor", gestureBounds);
        gestureBounds && armWindowGestureEnd("ann-anchor");
      }}
      onLive={(liveBounds?: Dynamic): Dynamic => {
        let liveSerializedBounds: Dynamic = serializeCandidate(liveBounds);
        liveSerializedBounds && commitPath(callback(liveSerializedBounds), liveBounds, false);
      }}
      onCommit={(
        committedBounds?: Dynamic,
        committedPath?: Dynamic,
        isFinal?: Dynamic,
      ): Dynamic => {
        let committedSerializedBounds: Dynamic = serializeCandidate(committedPath, isFinal);
        if (!committedSerializedBounds) return restoreOriginal();
        let normalizedBounds: Dynamic = callback(committedSerializedBounds);
        commitPath(
          normalizedBounds,
          annotationVectorPath(normalizedBounds, annotationPenViewBox(normalizedBounds)),
          true,
        );
      }}
      onCancel={restoreOriginal}
    />
  );
}
function annotationPenViewBox(pathBounds?: Dynamic): Dynamic {
  let value: Dynamic = (pathBounds.d.match(/\d+(?:\.\d+)?/g) ?? []).map(Number),
    [items, maxHeight]: Dynamic = [1, 1];
  for (let index: Dynamic = 0; index + 1 < value.length; index += 2)
    [items, maxHeight] = [
      Math.max(items, value[index]),
      Math.max(maxHeight, value[index + 1]),
    ];
  return {
    w: items,
    h: maxHeight,
  };
}
function annotationVectorPath(bounds?: Dynamic, viewBox?: Dynamic): Dynamic {
  return simplifyVectorPath(
    bounds.d,
    {
      ox: bounds.x,
      oy: bounds.y,
      sx: bounds.w / viewBox.w,
      sy: bounds.h / viewBox.h,
    },
    MAX_PEN_PATH_CHARS,
  );
}
export {
  AnnotationPenEditor,
  annotationPenViewBox,
  annotationVectorKey,
  annotationVectorPath,
  simplifyVectorPath,
  VectorAnnotationPenEditorConstant,
  VectorAnnotationPenEditorOverflowTouchActionConfig,
};
export function installEditorVectorAnnotationPenEditor(): () => void {
  return () => {
    VectorAnnotationPenEditorOverflowTouchActionConfig = {
      overflow: "visible",
      get touchAction() { return uiMessage("inspector.annotationPenEditor.none"); },
    };
    VectorAnnotationPenEditorConstant = 1.25;
    annotationVectorKey = (bounds?: Dynamic): Dynamic =>
      [bounds.x, bounds.y, bounds.w, bounds.h].join(",") + "|" + bounds.d;
  };
}
