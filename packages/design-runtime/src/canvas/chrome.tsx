import { useUiLocale } from '../ui-locale.ts';
import { uiMessage } from '@minedesign/contracts/ui-messages';
/** Restored application module; prepare first, initialize in original order. */
import {
  type Dynamic,
} from "../runtime-types";
import { MeasurementOverlay } from "./measurements";
import { distanceBetweenRects } from "./preview-mounting";
import { useViewport, useViewportStore } from "./viewport-store";
import { Button } from "../cds/button/button";
import { Icon } from "../cds/components/icon";
import { AlignmentGuides } from "../cds/editor/alignment-guides";
import { MenuMenuAssignValue, renderMenuItems } from "../cds/menu/menu";
import { DisabledReasonTooltip, Tooltip } from "../cds/tooltip/tooltip";
import { joinClassNames } from "../editor/chrome/overlay-state";
import { ViewOnlyYouCanInspectThisMessage } from "../editor/outline/annotations";
import { toolbarOverlayHeight } from "../editor/toolbar/layout";
import { reactDomVectorToolState, vectorToolStateReact as React } from "../editor/vector/tool-state";
import { CdsIsland } from "../platform/cds-island";
import { SelectionQuickActions } from "../properties/selection-quick-actions";

var canvasHandleLabelSize: Dynamic;
var maxCanvasOverlayZIndex: Dynamic;
var PositionedSelectionQuickActions: Dynamic;
var artboardHeaderTextClass: Dynamic;
var artboardHeaderButtonClass: Dynamic;
var hideProblemAtNarrowHeaderClass: Dynamic;
var hideTweaksAtNarrowHeaderClass: Dynamic;
var hideDownloadAtNarrowHeaderClass: Dynamic;
var ArtboardHeaderActions: Dynamic;
function ConditionalPortal({
  on: on,
  to: to,
  children: children,
}: Dynamic): Dynamic {
  return on
    ? to && (0, reactDomVectorToolState.createPortal)(children, to)
    : children;
}
function RunWhenSeen({ seen: seen, then: then }: Dynamic): Dynamic {
  (0, React.useEffect)((): Dynamic => {
    seen && then();
  });
  return null;
}
function CanvasRectVisibility({
  rect: rect,
  surfaceRef: surfaceRef,
  children: children,
}: Dynamic): Dynamic {
  let viewportStore: Dynamic = useViewportStore(),
    isRectVisible: Dynamic = (): Dynamic => {
      let viewport: Dynamic = viewportStore.get(),
        current: Dynamic = surfaceRef.current;
      return (
        distanceBetweenRects(rect, {
          x: viewport.x,
          y: viewport.y,
          w: (current?.clientWidth || 1200) / viewport.scale,
          h: (current?.clientHeight || 800) / viewport.scale,
        }) === 0
      );
    };
  return children(
    (0, React.useSyncExternalStore)(
      viewportStore.subscribe,
      isRectVisible,
      isRectVisible,
    ),
  );
}
function CanvasSnapGuides({ guides: guides }: Dynamic): Dynamic {
  useUiLocale();
  let viewport: Dynamic = useViewport();
  return (
    <div
      data-testid={"mega-snap-guides"}
      aria-hidden={"true"}
      className={"pointer-events-none absolute inset-0 z-30"}
    >
      <AlignmentGuides
        scale={1}
        guides={guides.map(
          (guide?: Dynamic): Dynamic => ({
            axis: guide.axis,
            pos:
              (guide.pos - (guide.axis === "x" ? viewport.x : viewport.y)) *
              viewport.scale,
          }),
        )}
      />
    </div>
  );
}
function CanvasGapGuides({ gaps: gaps }: Dynamic): Dynamic {
  useUiLocale();
  let viewport: Dynamic = useViewport(),
    toScreenX: Dynamic = (worldX?: Dynamic): Dynamic =>
      (worldX - viewport.x) * viewport.scale,
    toScreenY: Dynamic = (worldY?: Dynamic): Dynamic =>
      (worldY - viewport.y) * viewport.scale,
    measurement: Dynamic = {
      lines: [],
      labels: [],
    };
  for (let gap of gaps as Dynamic)
    gap.axis === "x"
      ? (measurement.lines.push({
          x1: toScreenX(gap.from),
          y1: toScreenY(gap.at),
          x2: toScreenX(gap.to),
          y2: toScreenY(gap.at),
        }),
        measurement.labels.push({
          x: toScreenX((gap.from + gap.to) / 2),
          y: toScreenY(gap.at),
          text: gap.label,
          axis: "x",
        }))
      : (measurement.lines.push({
          x1: toScreenX(gap.at),
          y1: toScreenY(gap.from),
          x2: toScreenX(gap.at),
          y2: toScreenY(gap.to),
        }),
        measurement.labels.push({
          x: toScreenX(gap.at),
          y: toScreenY((gap.from + gap.to) / 2),
          text: gap.label,
          axis: "y",
        }));
  return (
    <div
      data-testid={"mega-spacing-guides"}
      aria-hidden={"true"}
      className={"pointer-events-none absolute inset-0 z-30"}
    >
      <MeasurementOverlay m={measurement} scale={1} />
    </div>
  );
}
function CanvasAnchoredPopover({
  x: x,
  y: y,
  dy: dy2 = 0,
  belowSheet: belowSheet,
  children: children,
}: Dynamic): Dynamic {
  useUiLocale();
  let viewport: Dynamic = useViewport(),
    screenX: Dynamic = (x - viewport.x) * viewport.scale,
    screenY: Dynamic = Math.max(40, (y - viewport.y) * viewport.scale + dy2),
    popoverRef: Dynamic = (0, React.useRef)(null),
    [measuredSize, setMeasuredSize]: Dynamic = (0, React.useState)(
      null,
    );
  (0, React.useLayoutEffect)((): Dynamic => {
    let current: Dynamic = popoverRef.current;
    if (!current) return;
    let callback: Dynamic = (): Dynamic => {
      let bounds: Dynamic = current.getBoundingClientRect(),
        parentWidth: Dynamic =
          current.offsetParent?.clientWidth ?? (window as Dynamic).innerWidth,
        toolbarInset: Dynamic = toolbarOverlayHeight(current);
      setMeasuredSize(
        (previousSize?: Dynamic): Dynamic =>
          previousSize &&
          Math.abs(previousSize.w - bounds.width) < 0.5 &&
          Math.abs(previousSize.h - bounds.height) < 0.5 &&
          previousSize.pw === parentWidth &&
          previousSize.inset === toolbarInset
            ? previousSize
            : {
                w: bounds.width,
                h: bounds.height,
                pw: parentWidth,
                inset: toolbarInset,
              },
      );
    };
    callback();
    let observer: Dynamic = new ResizeObserver(callback);
    observer.observe(current);
    current.offsetParent && observer.observe(current.offsetParent);
    return (): Dynamic => observer.disconnect();
  }, []);
  return (
    <div
      ref={popoverRef}
      data-mega-chrome={"selection-menu"}
      data-testid={"mega-selection-menu"}
      className={joinClassNames(
        "absolute",
        belowSheet ? "z-[39]" : "z-[45]",
      )}
      style={
        measuredSize
          ? {
              left: Math.max(
                8,
                Math.min(screenX - measuredSize.w / 2, measuredSize.pw - measuredSize.w - 8),
              ),
              top: Math.max(measuredSize.inset + 4, screenY - measuredSize.h - 8),
            }
          : {
              left: screenX,
              top: screenY,
              visibility: "hidden",
            }
      }
    >
      {children([viewport.x, viewport.y, viewport.scale].join(","))}
    </div>
  );
}
function artboardContentBox(
  artboard?: Dynamic,
  fullscreenBox?: Dynamic,
  rowHeight?: Dynamic,
): Dynamic {
  return fullscreenBox
    ? {
        top: rowHeight,
        w: fullscreenBox.w,
        h: fullscreenBox.h - rowHeight,
      }
    : {
        top: rowHeight,
        w: artboard.w,
        h: artboard.h,
      };
}
function focusedArtboardContentRect(
  artboards?: Dynamic,
  focusedFile?: Dynamic,
  fullscreenBox?: Dynamic,
): Dynamic {
  let focusedArtboard: Dynamic =
    focusedFile == null
      ? undefined
      : artboards.find(
          (artboard?: Dynamic): Dynamic => artboard.file === focusedFile,
        );
  if (!focusedArtboard || !fullscreenBox) return null;
  let contentBox: Dynamic = artboardContentBox(
    focusedArtboard,
    fullscreenBox,
    0,
  );
  return {
    file: focusedArtboard.file,
    x: focusedArtboard.x,
    y: focusedArtboard.y + contentBox.top,
    w: contentBox.w,
    h: contentBox.h,
  };
}
function commentPointWithinVisibleContent(
  point?: Dynamic,
  board?: Dynamic,
  visibleContent?: Dynamic,
): Dynamic {
  let clamp: Dynamic = (
      coordinate?: Dynamic,
      min?: Dynamic,
      max?: Dynamic,
    ): Dynamic => Math.max(min, Math.min(max, coordinate)),
    insetX: Dynamic = Math.min(8, visibleContent.w / 2),
    insetY: Dynamic = Math.min(8, visibleContent.h / 2);
  return {
    px: clamp(
      clamp(
        point.x - board.x,
        visibleContent.x + insetX,
        visibleContent.x + visibleContent.w - insetX,
      ),
      insetX,
      board.w - insetX,
    ),
    py: clamp(
      clamp(
        point.y - board.y,
        visibleContent.y + insetY,
        visibleContent.y + visibleContent.h - insetY,
      ),
      insetY,
      board.h - insetY,
    ),
  };
}
function ArtboardNoticeAnchor(props?: Dynamic): Dynamic {
  useUiLocale();
  return (
    <div
      className={"pointer-events-none absolute h-0 w-0"}
      style={{
        left: props.x,
        top: props.y,
      }}
    >
      <ArtboardNoticePlane
        w={props.w}
        full={false}
        inert={props.inert}
        stamp={props.stamp}
      >
        {props.children}
      </ArtboardNoticePlane>
    </div>
  );
}
function ArtboardNoticePlane(props?: Dynamic): Dynamic {
  useUiLocale();
  return (
    <div
      data-mega-notice-plane={""}
      inert={props.inert ? true : undefined}
      className={joinClassNames(
        "@container/foot pointer-events-none absolute left-0 z-30 flex",
        props.full ? "bottom-0 p-3" : "top-full",
      )}
      ref={props.stamp}
      style={{
        width: `calc(${props.w}px * var(--mega-scale))`,
        transform: "scale(var(--mega-inv-scale))",
        transformOrigin: props.full ? "left bottom" : "left top",
        marginTop: props.full
          ? undefined
          : "calc(6px * var(--mega-inv-scale))",
      }}
    >
      {props.children}
    </div>
  );
}
function ArtboardOverlayPlane(props?: Dynamic): Dynamic {
  useUiLocale();
  if (props.fullscreenFile == null)
    return (
      <div className={"pointer-events-none absolute inset-0 z-[28]"}>
        {props.overlay(props.a.file, null)}
      </div>
    );
  if (props.fullscreenFile !== props.a.file) return null;
  let contentBox: Dynamic = artboardContentBox(
    props.a,
    props.fullscreenBox,
    props.rowH,
  );
  return (
    <div
      data-testid={"mega-page-overlay"}
      className={"pointer-events-none absolute left-0 z-[28]"}
      style={{
        top: contentBox.top,
        width: contentBox.w,
        height: contentBox.h,
      }}
    >
      {props.overlay(props.a.file, {
        w: contentBox.w,
        h: contentBox.h,
      })}
    </div>
  );
}
function shouldShowArtboardFaceOverlay(faceState?: Dynamic): Dynamic {
  return (
    faceState.live &&
    !faceState.blocked &&
    !faceState.frameless &&
    !faceState.focused &&
    !faceState.selected &&
    !faceState.playing &&
    !faceState.fullWindow
  );
}
export {
  artboardContentBox,
  ArtboardHeaderActions,
  artboardHeaderButtonClass,
  artboardHeaderTextClass,
  ArtboardNoticeAnchor,
  ArtboardNoticePlane,
  ArtboardOverlayPlane,
  CanvasAnchoredPopover,
  CanvasGapGuides,
  canvasHandleLabelSize,
  CanvasRectVisibility,
  CanvasSnapGuides,
  commentPointWithinVisibleContent,
  ConditionalPortal,
  focusedArtboardContentRect,
  hideDownloadAtNarrowHeaderClass,
  hideProblemAtNarrowHeaderClass,
  hideTweaksAtNarrowHeaderClass,
  maxCanvasOverlayZIndex,
  PositionedSelectionQuickActions,
  RunWhenSeen,
  shouldShowArtboardFaceOverlay,
};
export function installCanvasChrome(): () => void {
  return () => {
    canvasHandleLabelSize = {
      w: 92,
      h: 28,
    };
    maxCanvasOverlayZIndex = 1e5;
    PositionedSelectionQuickActions = (0, React.memo)(
      function ({ at: at, ...props }: Dynamic): Dynamic {
        return <SelectionQuickActions {...props} />;
      },
    );
    artboardHeaderTextClass = "text-inherit";
    artboardHeaderButtonClass = "shrink-0 " + artboardHeaderTextClass;
    hideProblemAtNarrowHeaderClass = "@max-[12.125rem]/hdr:hidden";
    hideTweaksAtNarrowHeaderClass = "@max-[10.5rem]/hdr:hidden";
    hideDownloadAtNarrowHeaderClass = "@max-[8.75rem]/hdr:hidden";
    ArtboardHeaderActions = (0, React.memo)(function (
      props?: Dynamic,
    ): Dynamic {
      let { file: artboardFile, title: artboardTitle }: Dynamic = props,
        containerRef: Dynamic = (0, React.useRef)(null),
        focusedElementRef: Dynamic = (0, React.useRef)(null);
      (0, React.useLayoutEffect)((): Dynamic => {
        let current: Dynamic = focusedElementRef.current;
        !current ||
          current.isConnected ||
          ((focusedElementRef.current = null),
          (document as Dynamic).activeElement === (document as Dynamic).body &&
            containerRef.current?.querySelector('[data-mega-chrome="play"]')?.focus({
              preventScroll: true,
            }));
      }, [props.play]);
      return (
        <div
          ref={containerRef}
          className={"ml-auto flex shrink-0 items-center gap-1.5"}
          onFocusCapture={(event?: Dynamic): Dynamic => {
            focusedElementRef.current =
              event.target.closest(
                '[data-mega-chrome="play"], [role="menu"]',
              ) != null
                ? event.target
                : null;
          }}
          onBlurCapture={(): Dynamic => {
            focusedElementRef.current = null;
          }}
          aria-hidden={props.inert ? true : undefined}
          onPointerDown={(event?: Dynamic): Dynamic =>
            event.stopPropagation()
          }
          onClick={(event?: Dynamic): Dynamic => event.stopPropagation()}
          onDoubleClick={(event?: Dynamic): Dynamic =>
            event.stopPropagation()
          }
        >
          <CdsIsland
            density={"compact"}
            className={"contents text-inherit"}
          >
            {props.problem !== undefined && (<Button
                variant={"ghost"}
                size={"xxs"}
                iconOnly={true}
                data-mega-chrome={"problem"}
                data-testid={"mega-artboard-problem-" + artboardFile}
                tabIndex={props.inert ? -1 : undefined}
                aria-label={uiMessage("canvas.chrome.showErrorNoticeOnArtboard", { artboardTitle: String(artboardTitle) })}
                tooltip={props.problem}
                icon={<Icon name={"Warning"} size={"sm"} />}
                className={joinClassNames(
                  "shrink-0 text-danger",
                  props.play != null && hideProblemAtNarrowHeaderClass,
                )}
                onClick={(): Dynamic => props.onShowProblems(artboardFile)}
              />)}
            {props.tweaks && (<DisabledReasonTooltip
                wrapperClassName={
                  props.play != null ? hideTweaksAtNarrowHeaderClass : undefined
                }
                reason={
                  props.editable || props.inert
                    ? undefined
                    : ViewOnlyYouCanInspectThisMessage
                }
              >
                <Button
                  variant={"ghost"}
                  size={"xxs"}
                  iconOnly={true}
                  data-mega-chrome={"tweaks-open"}
                  data-testid={"mega-artboard-tweaks-open-" + artboardFile}
                  tabIndex={props.inert ? -1 : undefined}
                  aria-label={uiMessage("canvas.chrome.tweaksForArtboard", { artboardTitle: String(artboardTitle) })}
                  tooltip={
                    props.tweaksOpen ? (uiMessage("canvas.chrome.hideThisArtboardSTweaks")) : (uiMessage("canvas.chrome.showThisArtboardSTweaks"))
                  }
                  pressed={props.tweaksOpen}
                  disabled={!props.editable}
                  icon={<Icon name={"Filter"} size={"sm"} />}
                  className={artboardHeaderButtonClass}
                  onClick={(): Dynamic => props.onToggleTweaks(artboardFile)}
                />
              </DisabledReasonTooltip>)}
            {props.download && (<MenuMenuAssignValue.Root
                open={props.exportOpen}
                onOpenChange={(isOpen?: Dynamic): Dynamic =>
                  props.onExportOpenChange(artboardFile, isOpen)
                }
              >
                <DisabledReasonTooltip
                  wrapperClassName={
                    props.play != null
                      ? hideDownloadAtNarrowHeaderClass
                      : undefined
                  }
                  reason={props.inert ? undefined : props.exportDisabledReason}
                >
                  <Tooltip content={"Export this artboard"}>
                    <MenuMenuAssignValue.Trigger
                      disabled={props.exportDisabledReason !== undefined}
                      render={
                        <Button
                          variant={"ghost"}
                          size={"xxs"}
                          iconOnly={true}
                          data-mega-chrome={"download"}
                          data-testid={"mega-artboard-download-" + artboardFile}
                          tabIndex={props.inert ? -1 : undefined}
                          aria-label={uiMessage("canvas.chrome.exportArtboard", { artboardTitle: String(artboardTitle) })}
                          tooltip={false}
                          disabled={props.exportDisabledReason !== undefined}
                          icon={<Icon name={"Download"} size={"sm"} />}
                          className={artboardHeaderButtonClass}
                        />
                      }
                    />
                  </Tooltip>
                </DisabledReasonTooltip>
                <MenuMenuAssignValue.Popup className={"min-w-[190px]"}>
                  {props.exportItems}
                </MenuMenuAssignValue.Popup>
              </MenuMenuAssignValue.Root>)}
            {/* MineDesign：打开全窗口用得更频繁，放在下载右侧 */}
            {props.expand && props.play == null && (<Button
                variant={"ghost"}
                size={"xxs"}
                iconOnly={true}
                data-mega-chrome={"expand"}
                data-testid={"mega-artboard-expand-" + artboardFile}
                tabIndex={props.inert ? -1 : undefined}
                aria-label={uiMessage("canvas.chrome.openArtboardFullWindow", { artboardTitle: String(artboardTitle) })}
                tooltip={uiMessage("canvas.chrome.openFullWindow")}
                icon={<Icon name={"Expand"} size={"sm"} />}
                className={artboardHeaderButtonClass}
                onClick={(): Dynamic => props.onExpand(artboardFile)}
              />)}
            {props.play === "play" && (<MenuMenuAssignValue.Root>
                <MenuMenuAssignValue.Trigger
                  render={
                    <Button
                      variant={"ghost"}
                      size={"xxs"}
                      iconOnly={true}
                      data-mega-chrome={"play"}
                      data-testid={"mega-artboard-play-" + artboardFile}
                      tabIndex={props.inert ? -1 : undefined}
                      aria-label={uiMessage("canvas.chrome.playPrototypeForArtboard", { artboardTitle: String(artboardTitle) })}
                      tooltip={uiMessage("canvas.chrome.playPrototype")}
                      icon={<Icon name={"Play"} size={"sm"} />}
                      className={artboardHeaderButtonClass}
                    />
                  }
                />
                <MenuMenuAssignValue.Popup
                  align={"end"}
                  className={"min-w-[160px]"}
                >
                  {renderMenuItems([
                    {
                      get label() { return uiMessage("canvas.chrome.playOnCanvas"); },
                      onSelect: (): Dynamic => props.onPlay(artboardFile),
                    },
                    {
                      get label() { return uiMessage("canvas.chrome.playFullScreen"); },
                      onSelect: (): Dynamic => props.onExpand(artboardFile),
                    },
                  ])}
                </MenuMenuAssignValue.Popup>
              </MenuMenuAssignValue.Root>)}
            {props.play === "edit" || props.play === "stop" && (<Button
                variant={"ghost"}
                size={"xxs"}
                iconOnly={true}
                data-mega-chrome={"play"}
                data-testid={"mega-artboard-play-" + artboardFile}
                tabIndex={props.inert ? -1 : undefined}
                aria-label={
                  (props.play === "edit" ? uiMessage("canvas.chrome.edit2") : uiMessage("canvas.chrome.stopPlaying2")) + artboardTitle
                }
                tooltip={props.play === "edit" ? (uiMessage("canvas.chrome.edit")) : (uiMessage("canvas.chrome.stopPlaying"))}
                pressed={props.play === "stop"}
                icon={
                  <Icon
                    name={props.play === "edit" ? "Edit" : "Stop"}
                    size={"sm"}
                  />
                }
                className={artboardHeaderButtonClass}
                onClick={(): Dynamic => props.onPlay(artboardFile)}
              />)}
          </CdsIsland>
        </div>
      );
    });
  };
}
