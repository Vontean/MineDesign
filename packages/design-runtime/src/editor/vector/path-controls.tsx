import { useUiLocale } from '../../ui-locale.ts';
/** Restored application module; prepare first, initialize in original order. */
import {
  type Dynamic,
} from "../../runtime-types";
import { previousContourAnchor, showVectorControls, VectorPathEditingConstant } from "./path-editing";

var VectorPathControlsLabel: Dynamic;
var activeControlColor: Dynamic;
function VectorPathControls({
  path: path,
  selected: selected,
  draft: draft,
  hover: hover,
  view: view,
  hitRadiusPx: hitRadiusPx,
  controls: controls,
}: Dynamic): Dynamic {
  useUiLocale();
  let controlRadius: Dynamic = Math.max(3.5, hitRadiusPx * 0.45),
    items: Dynamic = [];
  path.contours.forEach((contour?: Dynamic, contourIndex?: Dynamic): Dynamic => {
    contour.anchors.forEach((anchor?: Dynamic, anchorIndex?: Dynamic): Dynamic => {
      let screenAnchor: Dynamic = view.toScreen(anchor),
        isSelectedAnchor: Dynamic =
          selected &&
          selected.contour === contourIndex &&
          selected.anchor === anchorIndex,
        renderControlHandle: Dynamic = (
          controlPoint?: Dynamic,
          previousPoint?: Dynamic,
          controlKey?: Dynamic,
        ): Dynamic => {
          let screenControlPoint: Dynamic = view.toScreen(controlPoint),
            screenPreviousPoint: Dynamic = view.toScreen(previousPoint);
          items.push(
            <line
              key={controlKey}
              x1={screenPreviousPoint.x}
              y1={screenPreviousPoint.y}
              x2={screenControlPoint.x}
              y2={screenControlPoint.y}
              stroke={VectorPathControlsLabel}
              strokeDasharray={"3 3"}
              opacity={0.7}
            />,
          );
        },
        renderControlPoint: Dynamic = (
          controlPoint?: Dynamic,
          controlPart?: Dynamic,
          controlKey?: Dynamic,
        ): Dynamic => {
          let screenControlPoint: Dynamic = view.toScreen(controlPoint),
            isSelectedControl: Dynamic = isSelectedAnchor && selected.part === controlPart;
          items.push(
            <circle
              key={controlKey}
              cx={screenControlPoint.x}
              cy={screenControlPoint.y}
              r={isSelectedControl ? controlRadius + 1 : controlRadius - 0.5}
              fill={
                isSelectedControl ? activeControlColor : "var(--t-panel, #fff)"
              }
              stroke={
                isSelectedControl ? activeControlColor : VectorPathControlsLabel
              }
              strokeWidth={1.25}
            />,
          );
        },
        previousAnchor: Dynamic = previousContourAnchor(contour, anchorIndex),
        isControlVisible: Dynamic = (controlPart?: Dynamic): Dynamic =>
          showVectorControls(
            controls,
            contour,
            contourIndex,
            anchorIndex,
            controlPart,
            selected,
          );
      anchor.seg.kind === "quad" && previousAnchor && isControlVisible("c")
        ? (renderControlHandle(anchor.seg.c, previousAnchor, `t${contourIndex}:${anchorIndex}a`),
          renderControlHandle(anchor.seg.c, anchor, `t${contourIndex}:${anchorIndex}b`),
          renderControlPoint(anchor.seg.c, "c", `q${contourIndex}:${anchorIndex}`))
        : anchor.seg.kind === "cubic" &&
          previousAnchor &&
          (isControlVisible("c") &&
            (renderControlHandle(anchor.seg.c1, previousAnchor, `t${contourIndex}:${anchorIndex}a`),
            renderControlPoint(anchor.seg.c1, "c", `c1${contourIndex}:${anchorIndex}`)),
          isControlVisible("c2") &&
            (renderControlHandle(anchor.seg.c2, anchor, `t${contourIndex}:${anchorIndex}b`),
            renderControlPoint(anchor.seg.c2, "c2", `c2${contourIndex}:${anchorIndex}`)));
      let isAnchorSelected: Dynamic = isSelectedAnchor && selected.part === "anchor";
      items.push(
        <rect
          key={`a${contourIndex}:${anchorIndex}`}
          x={screenAnchor.x - (isAnchorSelected ? controlRadius + 1 : controlRadius)}
          y={screenAnchor.y - (isAnchorSelected ? controlRadius + 1 : controlRadius)}
          width={2 * (isAnchorSelected ? controlRadius + 1 : controlRadius)}
          height={2 * (isAnchorSelected ? controlRadius + 1 : controlRadius)}
          fill={isAnchorSelected ? activeControlColor : "var(--t-panel, #fff)"}
          stroke={isAnchorSelected ? activeControlColor : "var(--t-fg, #141413)"}
          strokeWidth={1.25}
        />,
      );
    });
  });
  if (draft.length > 0) {
    let screenDraft: Dynamic = draft.map(
        (draftPoint?: Dynamic): Dynamic => view.toScreen(draftPoint),
      ),
      draftStart: Dynamic = screenDraft[0],
      draftPath: Dynamic =
        "M" +
        screenDraft
          .map((draftPoint?: Dynamic): Dynamic => `${draftPoint.x} ${draftPoint.y}`)
          .join(" L") +
        (hover
          ? ` L${view.toScreen(hover).x} ${view.toScreen(hover).y}`
          : "");
    items.push(
      <path
        key={"draft"}
        d={draftPath}
        fill={"none"}
        stroke={activeControlColor}
        strokeWidth={1.5}
        strokeDasharray={"4 3"}
      />,
    );
    draftStart &&
      draft.length >= 3 &&
      items.push(
        <circle
          key={"draft-close"}
          cx={draftStart.x}
          cy={draftStart.y}
          r={VectorPathEditingConstant}
          fill={"none"}
          stroke={activeControlColor}
          strokeWidth={1.5}
        />,
      );
    for (let [draftIndex, draftPoint] of screenDraft.entries() as Dynamic)
      items.push(
        <rect
          key={`d${draftIndex}`}
          x={draftPoint.x - controlRadius + 1}
          y={draftPoint.y - controlRadius + 1}
          width={2 * controlRadius - 2}
          height={2 * controlRadius - 2}
          fill={activeControlColor}
        />,
      );
  }
  return <g>{items}</g>;
}
export {
  VectorPathControls,
  VectorPathControlsLabel,
  activeControlColor as VectorPathControlsLabel_2,
};
export function installEditorVectorPathControls(): () => void {
  return () => {
    VectorPathControlsLabel = "var(--t-fg-muted, #73726c)";
    activeControlColor = "var(--t-app-accent, #2a78d6)";
  };
}
