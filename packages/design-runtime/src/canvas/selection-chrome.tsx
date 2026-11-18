import { uiMessage } from '@minedesign/contracts/ui-messages';
import { useUiLocale } from '../ui-locale.ts';
/** Restored application module; prepare first, initialize in original order. */
import {
  type Dynamic,
} from "../runtime-types";
import type { ArtboardBox, SelectionChrome } from "./frame-payloads";
import { MeasurementOverlay } from "./measurements";
import { UploadingOverlay } from "./picture-drop-ghost";
import { SelectionPoints, SelectionRing, SelectionRing as SelectionRing_r } from "../cds/components/selection-ring";
import { AlignmentGuides } from "../cds/editor/alignment-guides";
import { initializeCdsIndex } from "../cds/index";
import { load_react_jsx_runtime } from "../dependencies";
import { MediaCropEditor } from "../editor/media/crop-editor";
import { ThePageLayoutPlacesTheTopMessage } from "../editor/media/object-crop";
import { toModuleNamespace } from "../module-helpers";

var jsx__b: Dynamic;
var resizeGripCursorOverrides: Dynamic;
var noopResizeGrip: Dynamic;
var selectionResizeDisabledMessage: Dynamic;
var selectionRotateDisabledMessages: Dynamic;
function resizeGripCompassDirection(grip?: Dynamic): Dynamic {
  return (
    (grip.y === "top" ? "n" : grip.y === "bottom" ? "s" : "") +
    (grip.x === "left" ? "w" : grip.x === "right" ? "e" : "")
  );
}
function SelectionChromeOverlay({
  chrome: chrome,
  scale: scale,
  interactive: interactive,
  onGripDown: onGripDown,
  onContextMenu: onContextMenu,
  crop: crop,
  board: board,
}: {
  chrome: SelectionChrome;
  scale: number;
  interactive?: Dynamic;
  onGripDown?: Dynamic;
  onContextMenu?: Dynamic;
  crop?: Dynamic;
  board?: (ArtboardBox & { component?: Dynamic }) | null;
}): Dynamic {
  useUiLocale();
  let stroke: Dynamic = chrome.stroke,
    sortedRings: Dynamic = [...chrome.rings].sort(
      (firstRing?: Dynamic, secondRing?: Dynamic): Dynamic =>
        +(firstRing.k === "grip") - +(secondRing.k === "grip"),
    ),
    hasGroupGrip: Dynamic = sortedRings.some(
      (ring?: Dynamic): Dynamic => ring.k === "grip" && ring.group,
    ),
    index: Dynamic = 0;
  return (
    <div
      className={"absolute inset-0"}
      style={{
        pointerEvents: "none",
      }}
      data-testid={"mega-element-chrome"}
      onContextMenu={onContextMenu}
    >
      {chrome.artboard && board && (<SelectionRing
          data-testid={"mega-artboard-hover"}
          className={"[[data-mega-selected]_&]:hidden"}
          frame={{
            x: 0,
            y: 0,
            w: board.w,
            h: board.h,
          }}
          scale={scale}
          state={"hover"}
          variant={board.component ? "component" : "object"}
        />)}
      {sortedRings.map(
        (ring?: Dynamic, ringIndex?: Dynamic): Dynamic =>
          ring.k === "busy"
            ? (() => {
                const _Component = "div";
                const _props = {
                  "data-testid": "mega-element-busy",
                  style: {
                    position: "absolute",
                    left: ring.x,
                    top: ring.y,
                    width: ring.w,
                    height: ring.h,
                    transform: ring.rot
                      ? "rotate(" + String(ring.rot) + "rad)"
                      : undefined,
                    pointerEvents: "none",
                  },
                  children: <UploadingOverlay />,
                } as const;
                const _key = "busy" + String(index++);
                return <_Component key={_key} {..._props} />;
              })()
            : ring.k === "hov"
              ? (() => {
                  const HoverRingElement = SelectionRing_r;
                  const hoverRingProps = {
                    "data-testid": "mega-element-hover",
                    "data-component": ring.component ? "" : undefined,
                    frame: {
                      x: ring.x,
                      y: ring.y,
                      w: ring.w,
                      h: ring.h,
                    },
                    scale: scale,
                    rotation: ring.rot,
                    state: "hover",
                    variant: ring.component ? "component" : "object",
                  } as const;
                  const hoverRingKey = "hov" + String(ringIndex);
                  return <HoverRingElement key={hoverRingKey} {...hoverRingProps} />;
                })()
              : ring.k === "grip" && crop && ring.media?.tid === crop.tid
                ? ((): Dynamic => {
                    let [insetLeft, insetTop, insetRight, insetBottom]: Dynamic =
                        ring.media.inset,
                      cropFrame: Dynamic = {
                        w: ring.w * (1 - insetLeft - insetRight),
                        h: ring.h * (1 - insetTop - insetBottom),
                      },
                      cropNatural: Dynamic = {
                        w: ring.media.w,
                        h: ring.media.h,
                      };
                    return (
                      <div
                        key={"crop"}
                        data-testid={"mega-element-crop"}
                        style={{
                          position: "absolute",
                          left: ring.x + ring.w * insetLeft,
                          top: ring.y + ring.h * insetTop,
                          width: cropFrame.w,
                          height: cropFrame.h,
                          transform: ring.rot
                            ? "rotate(" + String(ring.rot) + "rad)"
                            : undefined,
                          transformOrigin:
                            String(ring.w * (0.5 - insetLeft)) +
                            "px " +
                            String(ring.h * (0.5 - insetTop)) +
                            "px",
                        }}
                      >
                        <MediaCropEditor
                          frame={cropFrame}
                          natural={cropNatural}
                          crop={crop.live}
                          scale={scale}
                          rotation={ring.rot}
                          src={crop.src}
                          video={ring.media.video}
                          zoomDisabledReason={crop.zoomDisabledReason}
                          onLive={(liveCrop?: Dynamic): Dynamic =>
                            crop.onLive(liveCrop, cropFrame, cropNatural)
                          }
                          onDone={crop.onDone}
                          onGesture={crop.onGesture}
                          onFrame={noopResizeGrip}
                          frameHandleOff={
                            ring.media.abs
                              ? undefined
                              : resizeGripCursorOverrides
                          }
                          onSideStart={(
                            side?: Dynamic,
                            pointerEvent?: Dynamic,
                          ): Dynamic =>
                            crop.onSideStart(side, pointerEvent, {
                              frame: cropFrame,
                              natural: cropNatural,
                              rot: ring.rot ?? 0,
                              abs: ring.media?.abs === true,
                            })
                          }
                        />
                      </div>
                    );
                  })()
                : (() => {
                    const RingElement = "div";
                    const ringProps = {
                      "data-testid":
                        ring.k !== "grip"
                          ? "mega-element-ring"
                          : ring.group
                            ? "mega-element-group-grips"
                            : "mega-element-grips",
                      "data-component": ring.component ? "" : undefined,
                      children: (
                        <SelectionRing
                          frame={{
                            x: ring.x,
                            y: ring.y,
                            w: ring.w,
                            h: ring.h,
                          }}
                          scale={scale}
                          rotation={ring.rot}
                          state={
                            ring.k === "sel" && hasGroupGrip
                              ? "member"
                              : "selected"
                          }
                          variant={ring.component ? "component" : "object"}
                          grips={
                            ring.k === "grip" && interactive
                              ? "corners"
                              : "none"
                          }
                          edgeStrips={!ring.aspectLock}
                          resizeDisabledReason={
                            ring.k === "grip" &&
                            interactive &&
                            ring.noResize
                              ? selectionResizeDisabledMessage
                              : undefined
                          }
                          onResizeStart={
                            ring.k === "grip"
                              ? (
                                  grip?: Dynamic,
                                  pointerEvent?: Dynamic,
                                ): Dynamic =>
                                  onGripDown(
                                    {
                                      kind: "resize",
                                      dir: resizeGripCompassDirection(grip),
                                    },
                                    pointerEvent,
                                  )
                              : undefined
                          }
                          onRotateStart={
                            ring.k === "grip" &&
                            interactive &&
                            ring.rotatable
                              ? (
                                  corner?: Dynamic,
                                  pointerEvent?: Dynamic,
                                ): Dynamic =>
                                  onGripDown(
                                    {
                                      kind: "rotate",
                                      corner: corner,
                                    },
                                    pointerEvent,
                                  )
                              : undefined
                          }
                          rotateDisabledReason={
                            ring.k === "grip" &&
                            interactive &&
                            ring.group &&
                            !ring.rotatable
                              ? selectionRotateDisabledMessages[
                                  ring.noRotate ?? "none"
                                ]
                              : undefined
                          }
                          angleLabel={
                            ring.deg != null
                              ? String(ring.deg) + "\xB0"
                              : undefined
                          }
                        />
                      ),
                    } as const;
                    const ringKey =
                      ring.k === "grip" ? "grip" : "sel" + String(ringIndex);
                    return <RingElement key={ringKey} {...ringProps} />;
                  })(),
      )}
      {chrome.measure ? (<MeasurementOverlay m={chrome.measure} scale={scale} />) : (null)}
      {chrome.guides ? (<AlignmentGuides guides={chrome.guides} scale={scale} />) : (null)}
      {stroke ? (<SelectionPoints
          data-testid={"mega-element-line"}
          points={[
            {
              x: stroke.x1,
              y: stroke.y1,
            },
            {
              x: stroke.x2,
              y: stroke.y2,
            },
          ]}
          shaft={[
            {
              x: stroke.x1,
              y: stroke.y1,
            },
            {
              x: stroke.x2,
              y: stroke.y2,
            },
          ]}
          scale={scale}
          shape={"square"}
          onPointDragStart={
            interactive
              ? (pointIndex?: Dynamic, pointerEvent?: Dynamic): Dynamic =>
                  onGripDown(
                    {
                      kind: "endpoint",
                      which: pointIndex === 0 ? 0 : 1,
                    },
                    pointerEvent,
                  )
              : undefined
          }
        />) : (null)}
    </div>
  );
}
export {
  jsx__b,
  noopResizeGrip,
  resizeGripCompassDirection,
  resizeGripCursorOverrides,
  SelectionChromeOverlay,
  selectionResizeDisabledMessage,
  selectionRotateDisabledMessages,
};
export function installCanvasSelectionChrome(): () => void {
  return () => {
    initializeCdsIndex();
    jsx__b = toModuleNamespace(
      load_react_jsx_runtime(),
      1,
    );
    resizeGripCursorOverrides = {
      n: ThePageLayoutPlacesTheTopMessage,
      w: ThePageLayoutPlacesTheTopMessage,
      nw: ThePageLayoutPlacesTheTopMessage,
      ne: ThePageLayoutPlacesTheTopMessage,
      sw: ThePageLayoutPlacesTheTopMessage,
    };
    noopResizeGrip = (): Dynamic => {};
    selectionResizeDisabledMessage =
      uiMessage("canvas.selectionChrome.nothingInThisSelectionCan");
    selectionRotateDisabledMessages = {
      none: "Nothing in this selection can be rotated.",
      layout:
        "Rotate works on freely placed elements. Drag these out of their layout first.",
    };
  };
}
