import { uiMessage } from '@minedesign/contracts/ui-messages';
import { useUiLocale } from '../../ui-locale.ts';
/** Restored application module; prepare first, initialize in original order. */
import {
  type Dynamic,
} from "../../runtime-types";
import { ButtonButtonClassNames_4, ButtonButtonCss, initializeButtonButton_2 } from "../button/button";
import { initializeButtonContext_2 } from "../button/context";
import { initializeComponentsIcon_2 } from "./icon";
import { initializeDomOwnerWindow } from "../dom/owner-window";
import { initializeDomRefComposition, useMergedRefs } from "../dom/ref-composition";
import { initializeDomSelectionPrevention } from "../dom/selection-prevention";
import { EditorSelectionGeometryFilterValue, EditorSelectionGeometryLeftTopConfig, initializeEditorSelectionGeometry, normalizeCollaboratorIndex, normalizeSelectionRotation, normalizeSelectionScale, OutlineFillAccentValue, resolveSelectionPoints, sameSelectionPoint, SelectionGrip, selectionMetrics, SelectionPoint, selectionPointPosition, selectionRingStroke, SelectionRingSvg } from "../editor/selection-geometry";
import { initializeFieldContext, useFieldDisabled, useFieldInvalid } from "../field/context";
import { initializeMenuPopup_2, useClickToFocus } from "../menu/popup";
import { initializeSheetsMenuPopup_2, subscribeSheetMedia, usesCoarsePointer } from "../sheets/menu-popup";
import { initializeSwitchContext } from "../switch/context";
import { cn, initializeClassNames } from "../theme/class-names";
import { getSizeAttribute, initializeCdsRoot, useExperimentalSettings } from "../theme/root";
import { initializeTokens, tokens } from "../theme/tokens";
import { hasDisabledReason, initializeTooltipDisabledReason } from "../tooltip/disabled-reason";
import { initializeTooltipTooltip, Tooltip, TooltipGroup } from "../tooltip/tooltip";
import { initializeTooltipTrigger_2 } from "../tooltip/trigger";
import { initializeNpm__base_ui_react_H5, initializeNpm__base_ui_react_jve, initializeNpm__base_ui_react_VJe, initializeNpm__base_ui_react_zve, load_react, load_react_jsx_runtime, npm_NumberField_mU } from "../../dependencies";
import { initializeOnce, toModuleNamespace } from "../../module-helpers";

var reactComponentsSelectionRing: Dynamic;
var jsxComponentsSelectionRing: Dynamic;
var selectionRingClasses: Dynamic;
var ComponentsSelectionRingClassNames: Dynamic;
var AspectSquareValue: Dynamic;
var HFullValue: Dynamic;
var ComponentsSelectionRingLabel: Dynamic;
var ComponentsSelectionRingClassNames_2: Dynamic;
var ComponentsSelectionRingClassNames_3: Dynamic;
var ComponentsSelectionRingClassNames_4: Dynamic;
var ComponentsSelectionRingClassNames_5: Dynamic;
var thumbShadowClasses: Dynamic;
var ComponentsSelectionRingClassNames_6: Dynamic;
var ComponentsSelectionRingConstant: Dynamic;
var ComponentsSelectionRingConstant_2: Dynamic;
var ComponentsSelectionRingLimit: Dynamic;
var initializeComponentsSelectionRing: Dynamic;
var ComponentsSelectionRingPointPointStrokeGripHitConfig: Dynamic;
var initializeComponentsSelectionRing_2: Dynamic;
var reactComponentsSelectionRing_2: Dynamic;
var jsxComponentsSelectionRing_2: Dynamic;
var SelectionPoints: Dynamic;
var initializeComponentsSelectionRing_3: Dynamic;
var ComponentsSelectionRingNwNeSeValues: Dynamic;
var ComponentsSelectionRingEwResizeNwseResizeNsResizeValues: Dynamic;
var ComponentsSelectionRingNeSeSwConfig: Dynamic;
var ImageSvgXmlValue: Dynamic;
var rotationCursorSvgHead: Dynamic;
var rotationCursorBodySvg: Dynamic;
var ComponentsSelectionRingResolvedValue: Dynamic;
var initializeComponentsSelectionRing_4: Dynamic;
var reactComponentsSelectionRing_3: Dynamic;
var jsxComponentsSelectionRing_3: Dynamic;
var SelectionRing: Dynamic;
var initializeComponentsSelectionRing_5: Dynamic;
var ComponentsSelectionRingSGDAUDNZDSet: Dynamic;
var ComponentsSelectionRingIntegerGroupDecimalSet: Dynamic;
var initializeComponentsSelectionRing_6: Dynamic;
var reactComponentsSelectionRing_4: Dynamic;
var jsxComponentsSelectionRing_4: Dynamic;
var ComponentsSelectionRingHandler: Dynamic;
var ComponentsSelectionRingHandler_2: Dynamic;
var NumberInput: Dynamic;
var initializeComponentsSelectionRing_7: Dynamic;
function selectionGripHitSize(
  frame?: Dynamic,
  scale?: Dynamic,
  isCoarsePointer?: Dynamic,
): Dynamic {
  if (isCoarsePointer)
    return ComponentsSelectionRingPointPointStrokeGripHitConfig.gripHitTouch;
  let scaledMinSide: Dynamic = Math.min(frame.w, frame.h) * scale;
  return Math.max(
    ComponentsSelectionRingPointPointStrokeGripHitConfig.grip,
    Math.min(
      ComponentsSelectionRingPointPointStrokeGripHitConfig.gripHit,
      scaledMinSide / 2,
    ),
  );
}
function SelectionPointGlyph(): Dynamic {
  useUiLocale();
  let point: Dynamic =
      ComponentsSelectionRingPointPointStrokeGripHitConfig.point,
    pointStroke: Dynamic =
      ComponentsSelectionRingPointPointStrokeGripHitConfig.pointStroke;
  return (
    <span
      data-selection-grip={""}
      className={cn(
        "absolute top-1/2 left-1/2 box-border block -translate-x-1/2 -translate-y-1/2 rounded-full",
        OutlineFillAccentValue,
      )}
      style={{
        width: point,
        height: point,
        backgroundColor: tokens.on.accent.cssVar,
        outlineStyle: "solid",
        outlineWidth: pointStroke,
        outlineOffset: -pointStroke,
        pointerEvents: "none",
      }}
    />
  );
}
function selectionResizeCursor(
  point?: Dynamic,
  rotation: Dynamic = 0,
): Dynamic {
  let directionX: Dynamic = point.x === "left" ? -1 : point.x === "right" ? 1 : 0,
    directionY: Dynamic = point.y === "top" ? -1 : point.y === "bottom" ? 1 : 0;
  return (
    ComponentsSelectionRingEwResizeNwseResizeNsResizeValues[
      ((Math.round((Math.atan2(directionY, directionX) + rotation) / (Math.PI / 4)) %
        4) +
        4) %
        4
    ] ?? "ew-resize"
  );
}
function selectionRotationCursor(
  corner?: Dynamic,
  rotation: Dynamic = 0,
): Dynamic {
  let angleDegrees: Dynamic = Math.round(
    ComponentsSelectionRingNeSeSwConfig[corner] + (rotation * 180) / Math.PI,
  );
  return `url("data:${ImageSvgXmlValue},${rotationCursorSvgHead}${String(angleDegrees)}${ComponentsSelectionRingResolvedValue}") 12 12, grab`;
}
function preventSelectionHandleEvent(event?: Dynamic): Dynamic {
  event.preventDefault();
  event.stopPropagation();
}
function selectionHandleTooltip(
  tooltipKey?: Dynamic,
  tooltip?: Dynamic,
  trigger?: Dynamic,
): Dynamic {
  return hasDisabledReason(tooltip.content) ? (
    <Tooltip
      key={tooltipKey}
      lazy={true}
      content={tooltip.content}
      multiline={tooltip.reason}
      hoverable={false}
      closeOnClick={tooltip.reason ? false : undefined}
      trackCursorAxis={tooltip.followPointer ? "both" : undefined}
    >
      {trigger}
    </Tooltip>
  ) : (
    (0, reactComponentsSelectionRing_3.cloneElement)(trigger, {
      key: tooltipKey,
    })
  );
}
function isOutsideSelectionGrip(
  event?: Dynamic,
  halfWidth?: Dynamic,
  halfHeight?: Dynamic,
  rotation?: Dynamic,
): Dynamic {
  let gripRect: Dynamic =
    event.currentTarget.parentElement?.getBoundingClientRect();
  if (gripRect === undefined) return false;
  let offsetX: Dynamic = event.clientX - (gripRect.left + gripRect.width / 2),
    offsetY: Dynamic = event.clientY - (gripRect.top + gripRect.height / 2),
    localX: Dynamic = offsetX * Math.cos(rotation) + offsetY * Math.sin(rotation),
    localY: Dynamic = offsetY * Math.cos(rotation) - offsetX * Math.sin(rotation);
  return Math.abs(localX) <= halfWidth && Math.abs(localY) <= halfHeight;
}
function selectionPointKey(point?: Dynamic): Dynamic {
  return `${point.x ?? "mid"}-${point.y ?? "mid"}`;
}
function currencySymbol(currencyCode?: Dynamic, locale?: Dynamic): Dynamic {
  let upperCode: Dynamic = currencyCode.toUpperCase();
  try {
    let parts: Dynamic = new Intl.NumberFormat(locale, {
        style: "currency",
        currency: upperCode,
        currencyDisplay: ComponentsSelectionRingSGDAUDNZDSet.has(upperCode)
          ? "code"
          : "symbol",
      }).formatToParts(1),
      currencyIndex: Dynamic = parts.findIndex(
        (part?: Dynamic): Dynamic => part.type === "currency",
      ),
      currencyPart: Dynamic = parts[currencyIndex];
    if (currencyPart === undefined)
      return {
        symbol: upperCode,
        side: "start",
      };
    let side: Dynamic = parts
      .slice(0, currencyIndex)
      .some(
        (part?: Dynamic): Dynamic =>
          ComponentsSelectionRingIntegerGroupDecimalSet.has(part.type),
      )
      ? "end"
      : "start";
    return {
      symbol: currencyPart.value,
      side: side,
    };
  } catch {
    return {
      symbol: upperCode,
      side: "start",
    };
  }
}
function useHydratedNumberInput(): Dynamic {
  return (0, reactComponentsSelectionRing_4.useSyncExternalStore)(
    ComponentsSelectionRingHandler_2,
    (): Dynamic => true,
    (): Dynamic => false,
  );
}
export {
  AspectSquareValue,
  ComponentsSelectionRingClassNames,
  ComponentsSelectionRingClassNames_2,
  ComponentsSelectionRingClassNames_3,
  ComponentsSelectionRingClassNames_4,
  ComponentsSelectionRingClassNames_5,
  ComponentsSelectionRingClassNames_6,
  ComponentsSelectionRingConstant,
  ComponentsSelectionRingConstant_2,
  ComponentsSelectionRingEwResizeNwseResizeNsResizeValues,
  ComponentsSelectionRingHandler,
  ComponentsSelectionRingHandler_2,
  ComponentsSelectionRingIntegerGroupDecimalSet,
  ComponentsSelectionRingLabel,
  thumbShadowClasses as ComponentsSelectionRingLabel_2,
  rotationCursorSvgHead as ComponentsSelectionRingLabel_3,
  ComponentsSelectionRingLimit,
  ComponentsSelectionRingNeSeSwConfig,
  ComponentsSelectionRingNwNeSeValues,
  ComponentsSelectionRingPointPointStrokeGripHitConfig,
  ComponentsSelectionRingResolvedValue,
  ComponentsSelectionRingSGDAUDNZDSet,
  currencySymbol,
  HFullValue,
  ImageSvgXmlValue,
  initializeComponentsSelectionRing,
  initializeComponentsSelectionRing_2,
  initializeComponentsSelectionRing_3,
  initializeComponentsSelectionRing_4,
  initializeComponentsSelectionRing_5,
  initializeComponentsSelectionRing_6,
  initializeComponentsSelectionRing_7,
  isOutsideSelectionGrip,
  jsxComponentsSelectionRing,
  jsxComponentsSelectionRing_2,
  jsxComponentsSelectionRing_3,
  jsxComponentsSelectionRing_4,
  NumberInput,
  preventSelectionHandleEvent,
  reactComponentsSelectionRing,
  reactComponentsSelectionRing_2,
  reactComponentsSelectionRing_3,
  reactComponentsSelectionRing_4,
  rotationCursorBodySvg,
  selectionGripHitSize,
  selectionHandleTooltip,
  SelectionPointGlyph,
  selectionPointKey,
  SelectionPoints,
  selectionResizeCursor,
  SelectionRing,
  selectionRingClasses,
  selectionRotationCursor,
  useHydratedNumberInput,
};
export function installCdsComponentsSelectionRing(): () => void {
  return () => {
    initializeComponentsSelectionRing = initializeOnce(
      (): Dynamic => {
        "use client";

        initializeClassNames();
        initializeDomOwnerWindow();
        initializeCdsRoot();
        initializeDomSelectionPrevention();
        initializeComponentsIcon_2();
        initializeTooltipTrigger_2();
        initializeTooltipTooltip();
        initializeButtonContext_2();
        initializeFieldContext();
        initializeSwitchContext();
        reactComponentsSelectionRing = toModuleNamespace(
          load_react(),
        );
        jsxComponentsSelectionRing = toModuleNamespace(
          load_react_jsx_runtime(),
        );
        initializeNpm__base_ui_react_H5();
        initializeNpm__base_ui_react_zve();
        initializeNpm__base_ui_react_jve();
        selectionRingClasses =
          "cds-reset relative z-[1] inline-flex h-full items-center justify-center gap-1.5 select-none border-0 bg-transparent outline-none focus-visible:outline-hidden rounded-[calc(var(--cds-radius)-2px)] text-body font-normal [&:not([data-disabled])]:hover:text-primary data-[checked]:text-primary data-[disabled]:opacity-disabled transition-shadow duration-fast focus-visible:shadow-focus";
        ComponentsSelectionRingClassNames = "px-md";
        AspectSquareValue = "aspect-square";
        HFullValue = "h-full";
        ComponentsSelectionRingLabel = "grow basis-[calc(var(--cds-pad-md)*2)]";
        ComponentsSelectionRingClassNames_2 = "flex-1";
        ComponentsSelectionRingClassNames_3 = "text-muted";
        ComponentsSelectionRingClassNames_4 =
          "text-secondary [&:not([data-checked]):not([data-disabled])]:hover:bg-fill-ghost-hover";
        ComponentsSelectionRingClassNames_5 =
          "invisible absolute left-0 origin-left rounded-[calc(var(--cds-radius)-1px)] bg-[var(--cds-segmented-control-thumb)]";
        thumbShadowClasses =
          "top-px bottom-px [box-shadow:inset_0_0_0_1px_var(--cds-border),0_1px_2px_0_rgb(0_0_0/0.05)]";
        ComponentsSelectionRingClassNames_6 =
          "inset-y-0 [box-shadow:inset_0_0_0_1px_var(--cds-border)]";
        ComponentsSelectionRingConstant = 30;
        ComponentsSelectionRingConstant_2 = 2;
        ComponentsSelectionRingLimit = 600;
      },
    );
    initializeComponentsSelectionRing_2 = initializeOnce(
      (): Dynamic => {
        initializeEditorSelectionGeometry();
        ComponentsSelectionRingPointPointStrokeGripHitConfig = {
          ...selectionMetrics,
          point: 10,
          pointStroke: 1.5,
          gripHit: 24,
          gripHitTouch: 40,
          edgeHit: 8,
          rotateReach: 16,
        };
      },
    );
    initializeComponentsSelectionRing_3 = initializeOnce(
      (): Dynamic => {
        "use client";

        initializeClassNames();
        initializeTokens();
        initializeSheetsMenuPopup_2();
        initializeEditorSelectionGeometry();
        initializeComponentsSelectionRing_2();
        reactComponentsSelectionRing_2 = toModuleNamespace(
          load_react(),
        );
        jsxComponentsSelectionRing_2 = toModuleNamespace(
          load_react_jsx_runtime(),
        );
        SelectionPoints = (0, reactComponentsSelectionRing_2.forwardRef)(
          function (
            {
              points: points,
              scale = 1,
              shaft: shaft,
              shape = "round",
              onPointDragStart: onPointDragStart,
              cursor = "move",
              className: className,
              ...props
            }: Dynamic,
            forwardedRef?: Dynamic,
          ): Dynamic {
            let isCoarsePointer: Dynamic = (0,
              reactComponentsSelectionRing_2.useSyncExternalStore)(
                subscribeSheetMedia,
                usesCoarsePointer,
                (): Dynamic => false,
              ),
              pointScale: Dynamic = normalizeSelectionScale(scale),
              maxPointSpan: Dynamic = 0;
            for (let pointA of points as Dynamic)
              for (let pointB of points as Dynamic)
                maxPointSpan = Math.max(
                  maxPointSpan,
                  Math.abs(pointA.x - pointB.x),
                  Math.abs(pointA.y - pointB.y),
                );
            let handleSize: Dynamic = isCoarsePointer
                ? ComponentsSelectionRingPointPointStrokeGripHitConfig.gripHitTouch
                : Math.max(
                    ComponentsSelectionRingPointPointStrokeGripHitConfig.grip,
                    Math.min(
                      ComponentsSelectionRingPointPointStrokeGripHitConfig.gripHit,
                      (maxPointSpan * pointScale) / 2,
                    ),
                  ),
              isDraggable: Dynamic = onPointDragStart !== undefined;
            return (
              <div
                {...props}
                ref={forwardedRef}
                data-cds={"SelectionPoints"}
                aria-hidden={"true"}
                className={cn(
                  "pointer-events-none absolute top-0 left-0",
                  className,
                )}
              >
                {shaft !== undefined && shaft.length > 1 ? (<svg
                    data-selection-shaft={""}
                    className={
                      "pointer-events-none absolute top-0 left-0 overflow-visible"
                    }
                    width={1}
                    height={1}
                  >
                    <polyline
                      points={shaft
                        .map(
                          (point?: Dynamic): Dynamic => `${point.x},${point.y}`,
                        )
                        .join(" ")}
                      fill={"none"}
                      stroke={tokens.fill.accent.cssVar}
                      strokeWidth={1 / pointScale}
                    />
                  </svg>) : (null)}
                {points.map(
                  (point?: Dynamic, pointIndex?: Dynamic): Dynamic => (
                    <div
                      key={pointIndex}
                      className={"absolute top-0 left-0 size-0"}
                      style={{
                        transform: `translate(${point.x}px, ${point.y}px) scale(${1 / pointScale})`,
                      }}
                    >
                      <div
                        data-resize-handle={isDraggable ? "" : undefined}
                        data-point-handle={pointIndex}
                        className={"absolute touch-none"}
                        style={{
                          left: -handleSize / 2,
                          top: -handleSize / 2,
                          width: handleSize,
                          height: handleSize,
                          cursor: isDraggable ? cursor : undefined,
                          pointerEvents: isDraggable ? "auto" : "none",
                        }}
                        onPointerDown={
                          isDraggable
                            ? (event?: Dynamic): Dynamic =>
                                onPointDragStart(pointIndex, event)
                            : undefined
                        }
                      >
                        {shape === "square" ? (<SelectionGrip />) : (<SelectionPointGlyph />)}
                      </div>
                    </div>
                  ),
                )}
              </div>
            );
          },
        );
        SelectionPoints.displayName = "SelectionPoints";
      },
    );
    initializeComponentsSelectionRing_4 = initializeOnce(
      (): Dynamic => {
        ComponentsSelectionRingNwNeSeValues = ["nw", "ne", "se", "sw"];
        ComponentsSelectionRingEwResizeNwseResizeNsResizeValues = [
          "ew-resize",
          "nwse-resize",
          "ns-resize",
          "nesw-resize",
        ];
        ComponentsSelectionRingNeSeSwConfig = {
          ne: 0,
          se: 90,
          sw: 180,
          nw: 270,
        };
        ImageSvgXmlValue = "image/svg+xml";
        rotationCursorSvgHead =
          "%3Csvg%20xmlns=%27http://www.w3.org/2000/svg%27%20width=%2724%27%20height=%2724%27%20viewBox=%270%200%2024%2024%27%3E%3Cg%20transform=%27rotate%28";
        rotationCursorBodySvg =
          "%20d=%27M%204.5%2010.7%20L%205.4%2010.4%20A%206.5%206.5%200%200%201%2013.6%2018.6%20L%2013.3%2019.5%20M%206.3%207.8%20L%204.5%2010.7%20L%207.7%2012.0%20M%2012.0%2016.3%20L%2013.3%2019.5%20L%2016.2%2017.7%27";
        ComponentsSelectionRingResolvedValue =
          "%2012%2012%29%27%20fill=%27none%27%20stroke-linecap=%27round%27%20stroke-linejoin=%27round%27%3E" +
          ("%3Cpath" +
            rotationCursorBodySvg +
            "%20stroke=%27white%27%20stroke-width=%273.5%27/%3E") +
          ("%3Cpath" +
            rotationCursorBodySvg +
            "%20stroke=%27black%27%20stroke-width=%271.5%27/%3E") +
          "%3C/g%3E%3C/svg%3E";
      },
    );
    initializeComponentsSelectionRing_5 = initializeOnce(
      (): Dynamic => {
        "use client";

        initializeClassNames();
        initializeSheetsMenuPopup_2();
        initializeEditorSelectionGeometry();
        initializeTooltipDisabledReason();
        initializeTooltipTooltip();
        initializeComponentsSelectionRing_2();
        initializeComponentsSelectionRing_4();
        reactComponentsSelectionRing_3 = toModuleNamespace(
          load_react(),
        );
        jsxComponentsSelectionRing_3 = toModuleNamespace(
          load_react_jsx_runtime(),
        );
        SelectionRing = (0, reactComponentsSelectionRing_3.forwardRef)(
          function (
            {
              frame: frame,
              scale = 1,
              rotation: rotation,
              state = "selected",
              variant = "object",
              grips: grips,
              angleLabel: angleLabel,
              collaborator: collaborator,
              onResizeStart: onResizeStart,
              edgeStrips = true,
              onGripDoubleClick: onGripDoubleClick,
              onRotateStart: onRotateStart,
              resizeDisabledReason: resizeDisabledReason,
              rotateDisabledReason: rotateDisabledReason,
              gripLabel: gripLabel,
              className: className,
              style: style,
              ...props
            }: Dynamic,
            forwardedRef?: Dynamic,
          ): Dynamic {
            let isCoarsePointer: Dynamic = (0,
              reactComponentsSelectionRing_3.useSyncExternalStore)(
                subscribeSheetMedia,
                usesCoarsePointer,
                (): Dynamic => false,
              ),
              frameScale: Dynamic = normalizeSelectionScale(scale),
              collaboratorIndex: Dynamic = normalizeCollaboratorIndex(
                collaborator,
              );
            if (collaborator !== undefined && collaboratorIndex === undefined) return null;
            let ringStroke: Dynamic = selectionRingStroke(
                state,
                collaboratorIndex,
              ),
              gripPoints: Dynamic = resolveSelectionPoints(
                grips,
                state,
                collaboratorIndex,
              ),
              rotationRad: Dynamic = normalizeSelectionRotation(
                rotation,
              ),
              isResizeDisabled: Dynamic = hasDisabledReason(
                resizeDisabledReason,
              ),
              isRotateDisabled: Dynamic = hasDisabledReason(
                rotateDisabledReason,
              ),
              isOwnSelection: Dynamic = collaboratorIndex === undefined && state === "selected",
              canResize: Dynamic =
                isOwnSelection && (isResizeDisabled ? !isCoarsePointer : onResizeStart !== undefined),
              scaledWidth: Dynamic = frame.w * frameScale,
              scaledHeight: Dynamic = frame.h * frameScale,
              gripHitSize: Dynamic = selectionGripHitSize(frame, frameScale, isCoarsePointer),
              edgeHit: Dynamic =
                ComponentsSelectionRingPointPointStrokeGripHitConfig.edgeHit,
              requestedStripPoints: Dynamic =
                typeof grips == "object"
                  ? EditorSelectionGeometryFilterValue.filter(
                      (candidate?: Dynamic): Dynamic =>
                        grips.some(
                          (grip?: Dynamic): Dynamic =>
                            sameSelectionPoint(grip, candidate),
                        ),
                    )
                  : [],
              stripCandidates: Dynamic =
                !canResize ||
                isCoarsePointer ||
                isResizeDisabled ||
                !edgeStrips ||
                gripPoints.length === 0
                  ? []
                  : requestedStripPoints.length > 0
                    ? requestedStripPoints
                    : EditorSelectionGeometryFilterValue,
              isLongEnoughForStrip: Dynamic = (length?: Dynamic): Dynamic =>
                length >=
                3 *
                  ComponentsSelectionRingPointPointStrokeGripHitConfig.edgeHit,
              edgeStripPoints: Dynamic = stripCandidates.filter(
                (stripPoint?: Dynamic): Dynamic =>
                  stripPoint.x === null
                    ? stripPoint.y !== null && isLongEnoughForStrip(scaledHeight)
                    : stripPoint.y === null && isLongEnoughForStrip(scaledWidth),
              ),
              rotateCorners: Dynamic =
                !isOwnSelection || isCoarsePointer || (onRotateStart === undefined && !isRotateDisabled)
                  ? []
                  : ComponentsSelectionRingNwNeSeValues,
              rotateHandleSize: Dynamic =
                gripHitSize / 2 +
                ComponentsSelectionRingPointPointStrokeGripHitConfig.rotateReach,
              resizeTooltip: Dynamic = isResizeDisabled
                ? {
                    content: resizeDisabledReason,
                    reason: true,
                  }
                : {
                    content: gripLabel,
                    reason: false,
                  };
            return (
              <div
                {...props}
                ref={forwardedRef}
                data-cds={"SelectionRing"}
                data-state={collaboratorIndex === undefined ? state : undefined}
                data-variant={collaboratorIndex === undefined ? variant : undefined}
                data-collaborator={collaboratorIndex}
                aria-hidden={"true"}
                className={cn(
                  OutlineFillAccentValue,
                  className,
                )}
                style={{
                  ...style,
                  ...SelectionRingSvg({
                    frame: frame,
                    scale: frameScale,
                    rotation: rotation,
                    stroke: ringStroke,
                    collaborator: collaboratorIndex,
                    variant: variant,
                  }),
                }}
              >
                <TooltipGroup>
                  {rotateCorners.map((corner?: Dynamic): Dynamic => {
                    let rotateHandleStyle: Dynamic = {
                      position: "absolute",
                      left:
                        corner === "nw" || corner === "sw" ? -rotateHandleSize : scaledWidth,
                      top:
                        corner === "nw" || corner === "ne" ? -rotateHandleSize : scaledHeight,
                      width: rotateHandleSize,
                      height: rotateHandleSize,
                      pointerEvents: "auto",
                      cursor: isRotateDisabled
                        ? "default"
                        : selectionRotationCursor(corner, rotationRad),
                    };
                    return selectionHandleTooltip(
                      `rotate-${corner}`,
                      {
                        content: rotateDisabledReason,
                        reason: true,
                      },
                      <div
                        data-resize-handle={""}
                        data-rotate-handle={corner}
                        className={"touch-none"}
                        data-disabled={isRotateDisabled ? "" : undefined}
                        style={rotateHandleStyle}
                        onPointerDown={
                          isRotateDisabled
                            ? preventSelectionHandleEvent
                            : (event?: Dynamic): Dynamic =>
                                onRotateStart?.(corner, event)
                        }
                      />,
                    );
                  })}
                  {edgeStripPoints.map((stripPoint?: Dynamic): Dynamic => {
                    let isHorizontalStrip: Dynamic = stripPoint.x === null,
                      gripInsetAt: Dynamic = (
                        gripX?: Dynamic,
                        gripY?: Dynamic,
                      ): Dynamic =>
                        gripPoints.some(
                          (grip?: Dynamic): Dynamic =>
                            grip.x === gripX && grip.y === gripY,
                        )
                          ? gripHitSize / 2
                          : 0,
                      startInset: Dynamic = isHorizontalStrip
                        ? gripInsetAt("left", stripPoint.y)
                        : gripInsetAt(stripPoint.x, "top"),
                      endInset: Dynamic = isHorizontalStrip
                        ? gripInsetAt("right", stripPoint.y)
                        : gripInsetAt(stripPoint.x, "bottom"),
                      stripStyle: Dynamic = {
                        position: "absolute",
                        pointerEvents: "auto",
                        cursor: selectionResizeCursor(stripPoint, rotationRad),
                        ...(isHorizontalStrip
                          ? {
                              left: startInset,
                              width: Math.max(0, scaledWidth - startInset - endInset),
                              top:
                                (stripPoint.y === "top" ? 0 : scaledHeight) - edgeHit / 2,
                              height: edgeHit,
                            }
                          : {
                              top: startInset,
                              height: Math.max(0, scaledHeight - startInset - endInset),
                              left:
                                (stripPoint.x === "left" ? 0 : scaledWidth) -
                                edgeHit / 2,
                              width: edgeHit,
                            }),
                      };
                    return selectionHandleTooltip(
                      `strip-${selectionPointKey(stripPoint)}`,
                      {
                        content: gripLabel,
                        reason: false,
                        followPointer: true,
                      },
                      <div
                        data-resize-handle={""}
                        data-resize-strip={""}
                        className={"touch-none"}
                        style={stripStyle}
                        onPointerDown={(event?: Dynamic): Dynamic =>
                          onResizeStart?.(stripPoint, event)
                        }
                        onDoubleClick={
                          onGripDoubleClick === undefined
                            ? undefined
                            : (event?: Dynamic): Dynamic => {
                                event.stopPropagation();
                                onGripDoubleClick(stripPoint);
                              }
                        }
                      />,
                    );
                  })}
                  {gripPoints.map((point?: Dynamic): Dynamic => {
                    let gripPosition: Dynamic = selectionPointPosition(
                      point,
                    );
                    if (!canResize)
                      return (() => {
                        const _Component = "span";
                        const _props = {
                          className: "absolute block size-0",
                          style: gripPosition,
                          children: (
                            <SelectionGrip
                              stroke={ringStroke}
                              disabled={isOwnSelection && isResizeDisabled}
                              variant={variant}
                            />
                          ),
                        } as const;
                        const _key = selectionPointKey(point);
                        return <_Component key={_key} {..._props} />;
                      })();
                    let handleStyle: Dynamic = {
                      position: "absolute",
                      left: `calc(${gripPosition.left} - ${gripHitSize / 2}px)`,
                      top: `calc(${gripPosition.top} - ${gripHitSize / 2}px)`,
                      width: gripHitSize,
                      height: gripHitSize,
                      pointerEvents: "auto",
                      cursor: isResizeDisabled
                        ? "default"
                        : selectionResizeCursor(point, rotationRad),
                    };
                    return selectionHandleTooltip(
                      selectionPointKey(point),
                      resizeTooltip,
                      <div
                        data-resize-handle={""}
                        data-disabled={isResizeDisabled ? "" : undefined}
                        className={"touch-none"}
                        style={handleStyle}
                        onPointerDown={
                          isResizeDisabled
                            ? preventSelectionHandleEvent
                            : (event?: Dynamic): Dynamic =>
                                onResizeStart?.(point, event)
                        }
                        onDoubleClick={
                          onGripDoubleClick === undefined || isResizeDisabled
                            ? undefined
                            : (event?: Dynamic): Dynamic => {
                                (isCoarsePointer &&
                                  isOutsideSelectionGrip(
                                    event,
                                    scaledWidth / 2,
                                    scaledHeight / 2,
                                    rotationRad,
                                  )) ||
                                  (event.stopPropagation(),
                                  onGripDoubleClick(point));
                              }
                        }
                      >
                        <SelectionGrip
                          stroke={ringStroke}
                          disabled={isResizeDisabled}
                          variant={variant}
                        />
                      </div>,
                    );
                  })}
                </TooltipGroup>
                {angleLabel !== undefined && collaboratorIndex === undefined ? (<SelectionPoint
                    data-selection-angle={""}
                    scale={1}
                    rotation={rotation}
                    anchor={"center"}
                    at={EditorSelectionGeometryLeftTopConfig}
                    variant={variant}
                  >
                    {angleLabel}
                  </SelectionPoint>) : (null)}
              </div>
            );
          },
        );
        SelectionRing.displayName = "SelectionRing";
      },
    );
    initializeComponentsSelectionRing_6 = initializeOnce(
      (): Dynamic => {
        ComponentsSelectionRingSGDAUDNZDSet = new Set(["SGD", "AUD", "NZD"]);
        ComponentsSelectionRingIntegerGroupDecimalSet = new Set([
          "integer",
          "group",
          "decimal",
          "fraction",
          "minusSign",
          "plusSign",
          "nan",
          "infinity",
        ]);
      },
    );
    initializeComponentsSelectionRing_7 = initializeOnce(
      (): Dynamic => {
        "use client";

        initializeClassNames();
        initializeCdsRoot();
        initializeMenuPopup_2();
        initializeDomRefComposition();
        initializeButtonButton_2();
        initializeFieldContext();
        initializeComponentsSelectionRing_6();
        reactComponentsSelectionRing_4 = toModuleNamespace(
          load_react(),
        );
        jsxComponentsSelectionRing_4 = toModuleNamespace(
          load_react_jsx_runtime(),
        );
        initializeNpm__base_ui_react_VJe();
        ComponentsSelectionRingHandler = (): Dynamic => {};
        ComponentsSelectionRingHandler_2 = (): Dynamic =>
          ComponentsSelectionRingHandler;
        NumberInput = (0, reactComponentsSelectionRing_4.forwardRef)(
          (
            {
              className: className,
              size: size,
              fullWidth = true,
              currency: currency,
              slotStart: slotStart,
              slotEnd: slotEnd,
              value: value,
              defaultValue: defaultValue,
              onValueChange: onValueChange,
              onValueCommitted: onValueCommitted,
              format: format,
              locale: locale,
              min: minValue,
              max: max,
              step: step,
              smallStep: smallStep,
              largeStep: largeStep,
              snapOnStep: snapOnStep,
              allowOutOfRange: allowOutOfRange,
              required: required,
              disabled: disabledProp,
              readOnly: readOnly,
              name: name,
              form: form,
              ...props
            }: Dynamic,
            forwardedRef?: Dynamic,
          ): Dynamic => {
            "use no memo";

            let { id: inputId, ...inputProps }: Dynamic = props,
              contextLocale: Dynamic = useExperimentalSettings(),
              preferredLocale: Dynamic = locale ?? contextLocale,
              isHydrated: Dynamic = useHydratedNumberInput(),
              formatLocale: Dynamic = preferredLocale ?? (isHydrated ? undefined : "en-US"),
              currencyAffix: Dynamic = (0, reactComponentsSelectionRing_4.useMemo)(
                (): Dynamic =>
                  currency !== undefined &&
                  slotStart === undefined &&
                  slotEnd === undefined
                    ? currencySymbol(currency, formatLocale)
                    : null,
                [currency, formatLocale, slotStart, slotEnd],
              ),
              startContent: Dynamic =
                slotStart ?? (currencyAffix?.side === "start" ? currencyAffix.symbol : null),
              endContent: Dynamic =
                slotEnd ?? (currencyAffix?.side === "end" ? currencyAffix.symbol : null),
              affixAriaHidden: Dynamic = currencyAffix !== null || undefined,
              isFieldInvalid: Dynamic = useFieldInvalid(),
              isFieldDisabled: Dynamic = useFieldDisabled(),
              widthClass: Dynamic = fullWidth ? "w-full" : "",
              inputRef: Dynamic = (0, reactComponentsSelectionRing_4.useRef)(
                null,
              ),
              { clickToFocusProps: clickToFocusHandlers }: Dynamic = useClickToFocus(
                (): Dynamic => inputRef.current?.focus(),
                {
                  disabled: disabledProp || isFieldDisabled,
                  readOnly: readOnly,
                },
              ),
              [, forceRerender]: Dynamic = (0,
              reactComponentsSelectionRing_4.useReducer)(
                (renderCount?: Dynamic): Dynamic => renderCount + 1,
                0,
              ),
              handleBlur: Dynamic = (event?: Dynamic): Dynamic => {
                inputProps.onBlur?.(event);
                forceRerender();
              },
              mergedInputRef: Dynamic = useMergedRefs(inputRef, forwardedRef);
            return (
              <npm_NumberField_mU.Root
                data-cds={"NumberInput"}
                {...getSizeAttribute(size)}
                data-invalid={isFieldInvalid || undefined}
                id={inputId}
                value={value}
                defaultValue={defaultValue}
                onValueChange={onValueChange}
                onValueCommitted={onValueCommitted}
                format={format}
                locale={preferredLocale}
                min={minValue}
                max={max}
                step={step}
                smallStep={smallStep}
                largeStep={largeStep}
                snapOnStep={snapOnStep}
                allowOutOfRange={allowOutOfRange}
                required={required}
                disabled={disabledProp}
                readOnly={readOnly}
                name={name}
                form={form}
                onMouseDown={clickToFocusHandlers.onMouseDown}
                className={cn(
                  ButtonButtonCss,
                  "pr-md",
                  "inline-flex",
                  widthClass,
                  "cursor-text items-center gap-[var(--cds-pad-sm,6px)] has-[:focus-visible]:shadow-focus",
                  "data-[disabled]:opacity-disabled",
                  !disabledProp &&
                    "[&:hover:not(:focus-visible):not(:has(:focus-visible)):not([data-invalid]):not([data-disabled])]:shadow-field-hover",
                  className,
                )}
              >
                {startContent ? (<span
                    aria-hidden={affixAriaHidden}
                    className={"flex shrink-0 items-center text-muted"}
                  >
                    {startContent}
                  </span>) : (null)}
                <npm_NumberField_mU.Input
                  ref={mergedInputRef}
                  aria-invalid={
                    inputProps["aria-invalid"] ?? (isFieldInvalid || undefined)
                  }
                  {...inputProps}
                  onBlur={handleBlur}
                  className={cn(
                    ButtonButtonClassNames_4,
                    "disabled:opacity-100",
                  )}
                />
                {endContent ? (<span
                    aria-hidden={affixAriaHidden}
                    className={"flex shrink-0 items-center text-muted"}
                  >
                    {endContent}
                  </span>) : (null)}
              </npm_NumberField_mU.Root>
            );
          },
        );
        NumberInput.displayName = "NumberInput";
      },
    );
  };
}
