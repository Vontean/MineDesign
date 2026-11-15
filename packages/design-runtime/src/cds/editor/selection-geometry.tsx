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
function sameSelectionPoint(input?: Dynamic, options?: Dynamic): Dynamic {
  return input.x === options.x && input.y === options.y;
}
function resolveSelectionPoints(
  input?: Dynamic,
  options?: Dynamic,
  context?: Dynamic,
): Dynamic {
  return context !== undefined
    ? []
    : input === undefined
      ? options === "selected"
        ? cornerSelectionPoints
        : []
      : input === "corners"
        ? cornerSelectionPoints
        : input === "all"
          ? allSelectionPoints
          : input === "none"
            ? []
            : allSelectionPoints.filter(
                (input2?: Dynamic): Dynamic =>
                  input.some(
                    (input3?: Dynamic): Dynamic =>
                      sameSelectionPoint(input3, input2),
                  ),
              );
}
function normalizeSelectionScale(input?: Dynamic): Dynamic {
  return Number.isFinite(input) && input > 0 ? input : 1;
}
function selectionPointPosition(input?: Dynamic): Dynamic {
  return {
    left: input.x === "left" ? "0%" : input.x === "right" ? "100%" : "50%",
    top: input.y === "top" ? "0%" : input.y === "bottom" ? "100%" : "50%",
  };
}
function normalizeSelectionRotation(input?: Dynamic): Dynamic {
  return input !== undefined && Number.isFinite(input) ? input : 0;
}
function selectionRingStroke(input?: Dynamic, options?: Dynamic): Dynamic {
  return options !== undefined
    ? selectionMetrics.ringCollaborator
    : input === "hover"
      ? selectionMetrics.ringHover
      : input === "member"
        ? selectionMetrics.ringMember
        : selectionMetrics.ring;
}
function normalizeCollaboratorIndex(input?: Dynamic): Dynamic {
  return input !== undefined &&
    Number.isInteger(input) &&
    input >= 1 &&
    input <= 6
    ? input
    : undefined;
}
function collaboratorColor(input?: Dynamic): Dynamic {
  let value: Dynamic = normalizeCollaboratorIndex(input);
  return value === undefined
    ? undefined
    : tokens.editor.collaborator[value].cssVar;
}
function SelectionRingSvg({
  frame: frame,
  scale: scale,
  rotation: rotation,
  stroke: stroke,
  collaborator: collaborator,
  variant: variant,
}: Dynamic): Dynamic {
  let value: Dynamic = normalizeSelectionRotation(rotation),
    value2: Dynamic =
      value === 0
        ? ""
        : `translate(${frame.w / 2}px, ${frame.h / 2}px) rotate(${value}rad) translate(${-frame.w / 2}px, ${-frame.h / 2}px) `,
    state: Dynamic = {
      position: "absolute",
      left: 0,
      top: 0,
      width: frame.w * scale,
      height: frame.h * scale,
      transformOrigin: "0 0",
      transform: `translate(${frame.x}px, ${frame.y}px) ${value2}scale(${1 / scale})`,
      outlineWidth: stroke,
      outlineStyle: "solid",
      outlineOffset: 0,
      pointerEvents: "none",
    },
    value3: Dynamic = collaboratorColor(collaborator);
  value3 !== undefined
    ? (state.outlineColor = value3)
    : variant === "component" &&
      (state.outlineColor = tokens.fill.pro.cssVar);
  return state;
}
function SelectionGrip({
  stroke = selectionMetrics.ring,
  disabled: disabled2,
  variant: variant,
}: Dynamic): Dynamic {
  useUiLocale();
  let grip: Dynamic = selectionMetrics.grip,
    value: Dynamic = variant === "component",
    value2: Dynamic = value
      ? tokens.on.pro.cssVar
      : tokens.on.accent.cssVar,
    value3: Dynamic = value
      ? tokens.fill.pro.cssVar
      : tokens.fill.accent.cssVar;
  return (
    <span
      data-selection-grip={""}
      data-disabled={disabled2 ? "" : undefined}
      className={(0, cn)(
        "absolute left-1/2 top-1/2 box-border block -translate-x-1/2 -translate-y-1/2",
        OutlineFillAccentValue,
      )}
      style={{
        width: grip,
        height: grip,
        borderRadius: selectionMetrics.gripRadius,
        backgroundColor: value2,
        outlineStyle: "solid",
        outlineWidth: stroke,
        outlineOffset: -stroke,
        outlineColor: disabled2
          ? `color-mix(in srgb, ${value3} calc(${tokens.opacity.disabled.cssVar} * 100%), ${value2})`
          : value
            ? value3
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
  let value: Dynamic = 1 / scale,
    value2: Dynamic = normalizeSelectionRotation(rotation),
    value3: Dynamic = typeof at.left == "number" && typeof at.top == "number",
    value4: Dynamic = value3 ? `translate(${at.left}px, ${at.top}px) ` : "";
  return (
    <span
      {...props}
      data-variant={variant}
      className={(0, cn)(
        "absolute block whitespace-nowrap rounded-full font-sans text-caption font-medium",
        variant === "component"
          ? "bg-fill-pro text-on-pro"
          : "bg-fill-accent text-on-accent",
      )}
      style={{
        left: value3 ? 0 : at.left,
        top: value3 ? 0 : at.top,
        padding: "0 6px",
        pointerEvents: "none",
        transformOrigin: anchor === "center" ? "50% 50%" : "0 0",
        transform:
          anchor === "center"
            ? `${value4}translate(-50%, -50%) rotate(${-value2}rad) scale(${value})`
            : `${value4}scale(${value})`,
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
    initializeEditorSelectionGeometry = (0, initializeOnce)(
      (): Dynamic => {
        (0, initializeClassNames)();
        (0, initializeTokens)();
        jsxEditorSelectionGeometry = (0, toModuleNamespace)(
          (0, load_react_jsx_runtime)(),
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
          (input?: Dynamic): Dynamic => input.x !== null && input.y !== null,
        );
        EditorSelectionGeometryFilterValue = allSelectionPoints.filter(
          (input?: Dynamic): Dynamic =>
            (input.x === null) != (input.y === null),
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
