import { emptyCanvasSelection } from "../../editor/selection/canvas-selection";
import { initializeDesignKeyboardBindings } from "../../application/document-root";
import { panViewport } from "../pan-zoom";
import { recallCanvasView } from "../viewport-memory";
import { resolveCanvasPlaceAction } from "../navigation";
import { runFindRevealAfterSettle } from "../../find/canvas-adapter";
import { selectionFromArtboards } from "../../editor/selection/canvas-selection";
import { type Dynamic } from "../../runtime-types";
import { viewportScaleLimits } from "../viewport-memory";
import { zoomViewportAtPoint } from "../pan-zoom";
import { canvasPanUsageWindowMs, canvasZoomUsageWindow, minimumCanvasZoomUsage } from "../design-canvas";

/** 画布平移或缩放手势时运行（onPanZoom）：按缩放上下限计算以指针为中心的缩放或平移后的视口，并写入视口存储。 */
export function applyPanZoomGesture(deps: { readonly focusedFileRef: Dynamic; readonly value105: Dynamic; readonly value106: Dynamic; readonly value224: Dynamic; readonly value226: Dynamic; readonly value271: Dynamic; readonly value345: Dynamic; readonly value67: Dynamic }, artboardFile?: Dynamic, gesture?: Dynamic): Dynamic {
        if (deps.value345.current) return false;
        let canGesture: Dynamic =
            !deps.value224.current ||
            artboardFile === deps.focusedFileRef.current ||
            artboardFile === deps.value271.current,
          artboard: Dynamic = deps.value67.artboards.find(
            (item?: Dynamic): Dynamic => item.file === artboardFile,
          );
        if (!canGesture || !artboard) return false;
        let gestureState: Dynamic = deps.value226.current;
        gestureState.dx += gesture.dx;
        gestureState.dy += gesture.dy;
        gesture.pinch &&
          ((gestureState.pinch = true),
          (gestureState.dz += gesture.dz),
          gesture.dz !== 0 && (gestureState.zoomMsgs += 1),
          (gestureState.px =
            artboard.x + Math.max(0, Math.min(artboard.w, gesture.x))),
          (gestureState.py =
            artboard.y + Math.max(0, Math.min(artboard.h, gesture.y))));
        gestureState.raf ||
          (gestureState.raf = requestAnimationFrame((): Dynamic => {
            gestureState.raf = 0;
            let now: Dynamic = performance.now();
            now - gestureState.winStart > 1e3 &&
              ((gestureState.winStart = now),
              (gestureState.winPan = 0),
              (gestureState.winZoom = 0));
            let panMagnitude: Dynamic =
                Math.abs(gestureState.dx) + Math.abs(gestureState.dy),
              panFactor: Dynamic =
                panMagnitude > 0
                  ? Math.min(
                      1,
                      Math.max(0, canvasPanUsageWindowMs - gestureState.winPan) /
                        panMagnitude,
                    )
                  : 0,
              panDx: Dynamic = gestureState.dx * panFactor,
              panDy: Dynamic = gestureState.dy * panFactor;
            gestureState.winPan += Math.abs(panDx) + Math.abs(panDy);
            let scale: Dynamic = deps.value105.get().scale,
              desiredZoomLog: Dynamic = gestureState.pinch
                ? Math.log(
                    Math.max(
                      viewportScaleLimits.minScale,
                      Math.min(
                        viewportScaleLimits.maxScale,
                        scale * Math.exp(gestureState.dz),
                      ),
                    ) / scale,
                  )
                : 0,
              zoomBudget: Dynamic = Math.max(
                0,
                canvasZoomUsageWindow - gestureState.winZoom,
              ),
              appliedZoomLog: Dynamic = Math.max(
                -zoomBudget,
                Math.min(zoomBudget, desiredZoomLog),
              );
            gestureState.winZoom += Math.max(
              Math.abs(appliedZoomLog),
              gestureState.zoomMsgs * minimumCanvasZoomUsage,
            );
            let isPinch: Dynamic = gestureState.pinch,
              pinchX: Dynamic = gestureState.px,
              pinchY: Dynamic = gestureState.py,
              viewWidth: Dynamic = deps.value106.current?.clientWidth ?? 0,
              viewHeight: Dynamic = deps.value106.current?.clientHeight ?? 0;
            gestureState.dx = 0;
            gestureState.dy = 0;
            gestureState.dz = 0;
            gestureState.zoomMsgs = 0;
            gestureState.pinch = false;
            deps.value105.set((currentView?: Dynamic): Dynamic => {
              let nextView: Dynamic = currentView;
              if (isPinch && appliedZoomLog !== 0) {
                let anchorX: Dynamic = Math.max(
                    0,
                    Math.min(viewWidth, (pinchX - nextView.x) * nextView.scale),
                  ),
                  anchorY: Dynamic = Math.max(
                    0,
                    Math.min(viewHeight, (pinchY - nextView.y) * nextView.scale),
                  );
                nextView = zoomViewportAtPoint(
                  nextView,
                  anchorX,
                  anchorY,
                  Math.exp(appliedZoomLog),
                  viewportScaleLimits,
                );
              }
              (panDx !== 0 || panDy !== 0) &&
                (nextView = panViewport(
                  nextView,
                  -panDx,
                  -panDy,
                ));
              return nextView;
            });
          }));
        return true;
      }

/** 打开画布位置链接（页面、画板、播放或窗口）时运行：解析目标动作，切换页面、聚焦或播放画板，并恢复对应视口。 */
export function navigateToCanvasPlace(deps: { readonly abandonSelectionGesture: Dynamic; readonly setSelection: Dynamic; readonly value105: Dynamic; readonly value2: Dynamic; readonly value224: Dynamic; readonly value225: Dynamic; readonly value273: Dynamic; readonly value275: Dynamic; readonly value284: Dynamic; readonly value291: Dynamic; readonly value298: Dynamic; readonly value310: Dynamic; readonly value346: Dynamic; readonly value380: Dynamic; readonly value559: Dynamic; readonly value563: Dynamic; readonly value62: Dynamic; readonly value73: Dynamic; readonly value80: Dynamic }, placeLink?: Dynamic, isRestoring: Dynamic = false): Dynamic {
    let placeAction: Dynamic = resolveCanvasPlaceAction(
      placeLink,
      deps.value73.current,
      {
        filling: deps.value346.current,
        plays: true,
        pageId: deps.value80.current,
        mayFocus: deps.value224.current || deps.value225.current || false,
        restoring: isRestoring,
      },
    );
    if (placeAction === null) return null;
    deps.value563.current?.abort();
    if (placeAction.do === "nothing") return placeAction.lands;
    let applyPlaceAction: Dynamic = (): Dynamic => {
        deps.value284(false);
        deps.abandonSelectionGesture();
        deps.value62();
        let restoreView: Dynamic = (pageId?: Dynamic): Dynamic => {
          let savedView: Dynamic = recallCanvasView(pageId);
          savedView !== undefined &&
            ((deps.value291.current = false),
            (deps.value310.current = true),
            deps.value105.set(savedView, true));
        };
        placeAction.do === "play"
          ? deps.value380(placeAction.file)
          : placeAction.do === "page"
            ? placeAction.id === deps.value80.current
              ? deps.setSelection(emptyCanvasSelection)
              : (deps.value298(placeAction.id),
                placeAction.camera || restoreView(placeAction.id))
            : placeAction.do === "window"
              ? placeAction.page !== deps.value80.current
                ? deps.value298(placeAction.page, placeAction.file)
                : (deps.setSelection(emptyCanvasSelection),
                  deps.value559(placeAction.file),
                  deps.value273(placeAction.file))
              : (placeAction.page !== deps.value80.current
                  ? (deps.value298(
                      placeAction.page,
                      placeAction.focus ? placeAction.file : undefined,
                    ),
                    placeAction.camera || restoreView(placeAction.page))
                  : (placeAction.focus && deps.value273(placeAction.file),
                    placeAction.camera && deps.value559(placeAction.file)),
                deps.setSelection(
                  selectionFromArtboards(
                    new Set([placeAction.file]),
                  ),
                ));
      },
      needsPageChange: Dynamic =
        placeAction.do === "window" ||
        placeAction.do === "play" ||
        (placeAction.do === "page" ? placeAction.id : placeAction.page) !==
          deps.value80.current;
    needsPageChange && initializeDesignKeyboardBindings();
    let controller: Dynamic = new AbortController();
    deps.value563.current = controller;
    runFindRevealAfterSettle(
      needsPageChange && deps.value2.current?.() === true,
      controller.signal,
      deps.value275,
      applyPlaceAction,
    );
    return placeAction.lands;
  }
