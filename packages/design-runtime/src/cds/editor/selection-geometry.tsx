import { useUiLocale } from '../../ui-locale.ts';
/** Restored application module; prepare first, initialize in original order. */
import {
  type Dynamic,
} from "../../runtime-types";
import { cn, initializeClassNames } from "../theme/class-names";
import { initializeTokens, tokens } from "../theme/tokens";
import { load_react_jsx_runtime } from "../../dependencies";
import { initializeOnce, toModuleNamespace } from "../../module-helpers";

var jsxEditorSelectionGeometry: Dynamic;
var selectionMetrics: Dynamic;
var allSelectionPoints: Dynamic;
var cornerSelectionPoints: Dynamic;
var EditorSelectionGeometryFilterValue: Dynamic;
var OutlineFillAccentValue: Dynamic;
var EditorSelectionGeometryLeftTopConfig: Dynamic;
var initializeEditorSelectionGeometry: Dynamic;
function sameSelectionPoint(pointA?: Dynamic, pointB?: Dynamic): Dynamic {
  return pointA.x === pointB.x && pointA.y === pointB.y;
}
function resolveSelectionPoints(
  grips?: Dynamic,
  state?: Dynamic,
  collaboratorIndex?: Dynamic,
): Dynamic {
  return collaboratorIndex !== undefined
    ? []
    : grips === undefined
      ? state === "selected"
        ? cornerSelectionPoints
        : []
      : grips === "corners"
        ? cornerSelectionPoints
        : grips === "all"
          ? allSelectionPoints
          : grips === "none"
            ? []
            : allSelectionPoints.filter(
                (point?: Dynamic): Dynamic =>
                  grips.some(
                    (grip?: Dynamic): Dynamic =>
                      sameSelectionPoint(grip, point),
                  ),
              );
}
function normalizeSelectionScale(scale?: Dynamic): Dynamic {
  return Number.isFinite(scale) && scale > 0 ? scale : 1;
}
function selectionPointPosition(point?: Dynamic): Dynamic {
  return {
    left: point.x === "left" ? "0%" : point.x === "right" ? "100%" : "50%",
    top: point.y === "top" ? "0%" : point.y === "bottom" ? "100%" : "50%",
  };
}
function normalizeSelectionRotation(rotation?: Dynamic): Dynamic {
  return rotation !== undefined && Number.isFinite(rotation) ? rotation : 0;
}
function selectionRingStroke(state?: Dynamic, collaboratorIndex?: Dynamic): Dynamic {
  return collaboratorIndex !== undefined
    ? selectionMetrics.ringCollaborator
    : state === "hover"
      ? selectionMetrics.ringHover
      : state === "member"
        ? selectionMetrics.ringMember
        : selectionMetrics.ring;
}
function normalizeCollaboratorIndex(collaborator?: Dynamic): Dynamic {
  return collaborator !== undefined &&
    Number.isInteger(collaborator) &&
    collaborator >= 1 &&
    collaborator <= 6
    ? collaborator
    : undefined;
}
function collaboratorColor(collaborator?: Dynamic): Dynamic {
  let collaboratorIndex: Dynamic = normalizeCollaboratorIndex(collaborator);
  return collaboratorIndex === undefined
    ? undefined
    : tokens.editor.collaborator[collaboratorIndex].cssVar;
}
function SelectionRingSvg({
  frame: frame,
  scale: scale,
  rotation: rotation,
  stroke: stroke,
  collaborator: collaborator,
  variant: variant,
}: Dynamic): Dynamic {
  let rotationRad: Dynamic = normalizeSelectionRotation(rotation),
    rotationTransform: Dynamic =
      rotationRad === 0
        ? ""
        : `translate(${frame.w / 2}px, ${frame.h / 2}px) rotate(${rotationRad}rad) translate(${-frame.w / 2}px, ${-frame.h / 2}px) `,
    ringStyle: Dynamic = {
      position: "absolute",
      left: 0,
      top: 0,
      width: frame.w * scale,
      height: frame.h * scale,
      transformOrigin: "0 0",
      transform: `translate(${frame.x}px, ${frame.y}px) ${rotationTransform}scale(${1 / scale})`,
      outlineWidth: stroke,
      outlineStyle: "solid",
      outlineOffset: 0,
      pointerEvents: "none",
    },
    collaboratorOutline: Dynamic = collaboratorColor(collaborator);
  collaboratorOutline !== undefined
    ? (ringStyle.outlineColor = collaboratorOutline)
    : variant === "component" &&
      (ringStyle.outlineColor = tokens.fill.pro.cssVar);
  return ringStyle;
}
function SelectionGrip({
  stroke = selectionMetrics.ring,
  disabled: disabledProp,
  variant: variant,
}: Dynamic): Dynamic {
  useUiLocale();
  let grip: Dynamic = selectionMetrics.grip,
    isComponent: Dynamic = variant === "component",
    gripBackground: Dynamic = isComponent
      ? tokens.on.pro.cssVar
      : tokens.on.accent.cssVar,
    gripOutline: Dynamic = isComponent
      ? tokens.fill.pro.cssVar
      : tokens.fill.accent.cssVar;
  return (
    <span
      data-selection-grip={""}
      data-disabled={disabledProp ? "" : undefined}
      className={cn(
        "absolute left-1/2 top-1/2 box-border block -translate-x-1/2 -translate-y-1/2",
        OutlineFillAccentValue,
      )}
      style={{
        width: grip,
        height: grip,
        borderRadius: selectionMetrics.gripRadius,
        backgroundColor: gripBackground,
        outlineStyle: "solid",
        outlineWidth: stroke,
        outlineOffset: -stroke,
        outlineColor: disabledProp
          ? `color-mix(in srgb, ${gripOutline} calc(${tokens.opacity.disabled.cssVar} * 100%), ${gripBackground})`
          : isComponent
            ? gripOutline
            : undefined,
        pointerEvents: "none",
      }}
    />
  );
}
function SelectionPoint({
  scale: scale,
  rotation = 0,
  at: at,
  anchor: anchor,
  variant: variant,
  children: children,
  ...props
}: Dynamic): Dynamic {
  useUiLocale();
  let inverseScale: Dynamic = 1 / scale,
    rotationRad: Dynamic = normalizeSelectionRotation(rotation),
    isPixelPosition: Dynamic = typeof at.left == "number" && typeof at.top == "number",
    translateTransform: Dynamic = isPixelPosition ? `translate(${at.left}px, ${at.top}px) ` : "";
  return (
    <span
      {...props}
      data-variant={variant}
      className={cn(
        "absolute block whitespace-nowrap rounded-full font-sans text-caption font-medium",
        variant === "component"
          ? "bg-fill-pro text-on-pro"
          : "bg-fill-accent text-on-accent",
      )}
      style={{
        left: isPixelPosition ? 0 : at.left,
        top: isPixelPosition ? 0 : at.top,
        padding: "0 6px",
        pointerEvents: "none",
        transformOrigin: anchor === "center" ? "50% 50%" : "0 0",
        transform:
          anchor === "center"
            ? `${translateTransform}translate(-50%, -50%) rotate(${-rotationRad}rad) scale(${inverseScale})`
            : `${translateTransform}scale(${inverseScale})`,
      }}
    >
      {children}
    </span>
  );
}
export {
  allSelectionPoints,
  collaboratorColor,
  cornerSelectionPoints,
  EditorSelectionGeometryFilterValue,
  EditorSelectionGeometryLeftTopConfig,
  initializeEditorSelectionGeometry,
  jsxEditorSelectionGeometry,
  normalizeCollaboratorIndex,
  normalizeSelectionRotation,
  normalizeSelectionScale,
  OutlineFillAccentValue,
  resolveSelectionPoints,
  sameSelectionPoint,
  SelectionGrip,
  selectionMetrics,
  SelectionPoint,
  selectionPointPosition,
  selectionRingStroke,
  SelectionRingSvg,
};
export function installCdsEditorSelectionGeometry(): () => void {
  return () => {
    initializeEditorSelectionGeometry = initializeOnce(
      (): Dynamic => {
        initializeClassNames();
        initializeTokens();
        jsxEditorSelectionGeometry = toModuleNamespace(
          load_react_jsx_runtime(),
        );
        selectionMetrics = {
          ring: 2,
          ringHover: 1.5,
          ringMember: 1,
          ringCollaborator: 1.5,
          grip: 12,
          gripRadius: 1,
          guide: 1,
        };
        allSelectionPoints = [
          {
            x: "left",
            y: "top",
          },
          {
            x: null,
            y: "top",
          },
          {
            x: "right",
            y: "top",
          },
          {
            x: "right",
            y: null,
          },
          {
            x: "right",
            y: "bottom",
          },
          {
            x: null,
            y: "bottom",
          },
          {
            x: "left",
            y: "bottom",
          },
          {
            x: "left",
            y: null,
          },
        ];
        cornerSelectionPoints = allSelectionPoints.filter(
          (point?: Dynamic): Dynamic => point.x !== null && point.y !== null,
        );
        EditorSelectionGeometryFilterValue = allSelectionPoints.filter(
          (point?: Dynamic): Dynamic =>
            (point.x === null) != (point.y === null),
        );
        OutlineFillAccentValue = "outline-fill-accent";
        EditorSelectionGeometryLeftTopConfig = {
          left: "50%",
          top: "calc(100% + 20.5px)",
        };
      },
    );
  };
}
