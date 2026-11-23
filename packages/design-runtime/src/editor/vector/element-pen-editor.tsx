import { useUiLocale } from '../../ui-locale.ts';
/** Restored application module; prepare first, initialize in original order. */
import {
  type Dynamic,
} from "../../runtime-types";
import { reactForVectorPathEditor } from "../hooks/latest-callback";
import { simplifyVectorPath } from "./annotation-pen-editor";
import { VectorPathEditor } from "./path-editor";
import { mapVectorPath, serializeVectorPath, serializeVectorPathBounds } from "./path-parsing";
import { maxCanvasItemDimension as MAX_CANVAS_ITEM_DIMENSION } from "../../platform/file-content";

var VectorElementPenEditorLimit: Dynamic;
var VectorElementPenEditorXYConfig: Dynamic;
function ElementPenEditor({
  pen: pen,
  scale: scale,
  onPreview: onPreview,
  onCommitStroke: onCommitStroke,
  onGesture: onGesture,
}: Dynamic): Dynamic {
  useUiLocale();
  let pathSignature: Dynamic =
      pen.d + "|" + [pen.x, pen.y, pen.w, pen.h, pen.vbW, pen.vbH].join(","),
    [pathState, setPathState]: Dynamic = (0,
    reactForVectorPathEditor.useState)(
      (): Dynamic => ({
        source: pathSignature,
        path: elementVectorPath(pen),
      }),
    );
  pathState.source !== pathSignature &&
    setPathState({
      source: pathSignature,
      path: elementVectorPath(pen),
    });
  let animationFrameRef: Dynamic = (0, reactForVectorPathEditor.useRef)(0),
    tid: Dynamic = pen.tid,
    previewRef: Dynamic = (0, reactForVectorPathEditor.useRef)(
      onPreview,
    );
  previewRef.current = onPreview;
  (0, reactForVectorPathEditor.useEffect)(
    (): Dynamic => (): Dynamic => {
      cancelAnimationFrame(animationFrameRef.current);
      previewRef.current(tid, null);
    },
    [tid],
  );
  let callback: Dynamic = (path?: Dynamic): Dynamic => {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = requestAnimationFrame((): Dynamic => {
        onPreview(
          pen.tid,
          serializeVectorPath(
            mapVectorPath(
              path,
              (point?: Dynamic): Dynamic => ({
                x: ((point.x - pen.x) * pen.vbW) / pen.w,
                y: ((point.y - pen.y) * pen.vbH) / pen.h,
              }),
            ),
            1,
          ),
        );
      });
    },
    cancelEditing: Dynamic = (): Dynamic => {
      cancelAnimationFrame(animationFrameRef.current);
      setPathState({
        source: pathSignature,
        path: elementVectorPath(pen),
      });
      onPreview(pen.tid, null);
    },
    serializeStroke: Dynamic = (
      candidatePath?: Dynamic,
      includeClose: Dynamic = false,
    ): Dynamic => {
      let serializedStroke: Dynamic = serializeVectorPathBounds(
        mapVectorPath(
          candidatePath,
          (point?: Dynamic): Dynamic => ({
            x: point.x * pen.kx,
            y: point.y * pen.ky,
          }),
        ),
        1,
        !includeClose,
      );
      return serializedStroke &&
        /[LC]/.test(serializedStroke.d) &&
        serializedStroke.d.length <= VectorElementPenEditorLimit &&
        serializedStroke.w <= MAX_CANVAS_ITEM_DIMENSION &&
        serializedStroke.h <= MAX_CANVAS_ITEM_DIMENSION
        ? serializedStroke
        : null;
    };
  return (
    <VectorPathEditor
      testId={"mega-pen-anchors-artboard"}
      path={pathState.path}
      scale={scale}
      origin={VectorElementPenEditorXYConfig}
      onGesture={onGesture}
      onLive={(livePath?: Dynamic): Dynamic => {
        serializeStroke(livePath) &&
          (setPathState(
            (previousState?: Dynamic): Dynamic => ({
              ...previousState,
              path: livePath,
            }),
          ),
          callback(livePath));
      }}
      onCommit={(
        committedPath?: Dynamic,
        commitOptions?: Dynamic,
        isFinal?: Dynamic,
      ): Dynamic => {
        cancelAnimationFrame(animationFrameRef.current);
        let committedStroke: Dynamic = serializeStroke(commitOptions, isFinal);
        if (!committedStroke) return cancelEditing();
        setPathState(
          (nextState?: Dynamic): Dynamic => ({
            ...nextState,
            path: commitOptions,
          }),
        );
        onCommitStroke(
          pen.tid,
          {
            x: committedStroke.x / pen.kx,
            y: committedStroke.y / pen.ky,
            w: Math.max(2, committedStroke.w),
            h: Math.max(2, committedStroke.h),
          },
          committedStroke.d,
        );
      }}
      onCancel={cancelEditing}
    />
  );
}
function elementVectorPath(bounds?: Dynamic): Dynamic {
  return simplifyVectorPath(
    bounds.d,
    {
      ox: bounds.x,
      oy: bounds.y,
      sx: bounds.w / bounds.vbW,
      sy: bounds.h / bounds.vbH,
    },
    VectorElementPenEditorLimit / Math.max(bounds.kx, bounds.ky, 1),
  );
}
export {
  ElementPenEditor,
  elementVectorPath,
  VectorElementPenEditorLimit,
  VectorElementPenEditorXYConfig,
};
export function installEditorVectorElementPenEditor(): () => void {
  return () => {
    VectorElementPenEditorLimit = 24e3;
    VectorElementPenEditorXYConfig = {
      x: 0,
      y: 0,
    };
  };
}
