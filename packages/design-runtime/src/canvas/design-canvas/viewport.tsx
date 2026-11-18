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
export function applyPanZoomGesture(deps: { readonly focusedFileRef: Dynamic; readonly value105: Dynamic; readonly value106: Dynamic; readonly value224: Dynamic; readonly value226: Dynamic; readonly value271: Dynamic; readonly value345: Dynamic; readonly value67: Dynamic }, input?: Dynamic, options?: Dynamic): Dynamic {
        if (deps.value345.current) return false;
        let value653: Dynamic =
            !deps.value224.current ||
            input === deps.focusedFileRef.current ||
            input === deps.value271.current,
          value654: Dynamic = deps.value67.artboards.find(
            (input2?: Dynamic): Dynamic => input2.file === input,
          );
        if (!value653 || !value654) return false;
        let current4: Dynamic = deps.value226.current;
        current4.dx += options.dx;
        current4.dy += options.dy;
        options.pinch &&
          ((current4.pinch = true),
          (current4.dz += options.dz),
          options.dz !== 0 && (current4.zoomMsgs += 1),
          (current4.px =
            value654.x + Math.max(0, Math.min(value654.w, options.x))),
          (current4.py =
            value654.y + Math.max(0, Math.min(value654.h, options.y))));
        current4.raf ||
          (current4.raf = requestAnimationFrame((): Dynamic => {
            current4.raf = 0;
            let value655: Dynamic = performance.now();
            value655 - current4.winStart > 1e3 &&
              ((current4.winStart = value655),
              (current4.winPan = 0),
              (current4.winZoom = 0));
            let value656: Dynamic =
                Math.abs(current4.dx) + Math.abs(current4.dy),
              value657: Dynamic =
                value656 > 0
                  ? Math.min(
                      1,
                      Math.max(0, canvasPanUsageWindowMs - current4.winPan) /
                        value656,
                    )
                  : 0,
              value658: Dynamic = current4.dx * value657,
              value659: Dynamic = current4.dy * value657;
            current4.winPan += Math.abs(value658) + Math.abs(value659);
            let scale: Dynamic = deps.value105.get().scale,
              value660: Dynamic = current4.pinch
                ? Math.log(
                    Math.max(
                      viewportScaleLimits.minScale,
                      Math.min(
                        viewportScaleLimits.maxScale,
                        scale * Math.exp(current4.dz),
                      ),
                    ) / scale,
                  )
                : 0,
              value661: Dynamic = Math.max(
                0,
                canvasZoomUsageWindow - current4.winZoom,
              ),
              value662: Dynamic = Math.max(
                -value661,
                Math.min(value661, value660),
              );
            current4.winZoom += Math.max(
              Math.abs(value662),
              current4.zoomMsgs * minimumCanvasZoomUsage,
            );
            let pinch: Dynamic = current4.pinch,
              px2: Dynamic = current4.px,
              py2: Dynamic = current4.py,
              value663: Dynamic = deps.value106.current?.clientWidth ?? 0,
              value664: Dynamic = deps.value106.current?.clientHeight ?? 0;
            current4.dx = 0;
            current4.dy = 0;
            current4.dz = 0;
            current4.zoomMsgs = 0;
            current4.pinch = false;
            deps.value105.set((input2?: Dynamic): Dynamic => {
              let value665: Dynamic = input2;
              if (pinch && value662 !== 0) {
                let value666: Dynamic = Math.max(
                    0,
                    Math.min(value663, (px2 - value665.x) * value665.scale),
                  ),
                  value667: Dynamic = Math.max(
                    0,
                    Math.min(value664, (py2 - value665.y) * value665.scale),
                  );
                value665 = zoomViewportAtPoint(
                  value665,
                  value666,
                  value667,
                  Math.exp(value662),
                  viewportScaleLimits,
                );
              }
              (value658 !== 0 || value659 !== 0) &&
                (value665 = panViewport(
                  value665,
                  -value658,
                  -value659,
                ));
              return value665;
            });
          }));
        return true;
      }

/** 打开画布位置链接（页面、画板、播放或窗口）时运行：解析目标动作，切换页面、聚焦或播放画板，并恢复对应视口。 */
export function navigateToCanvasPlace(deps: { readonly abandonSelectionGesture: Dynamic; readonly setSelection: Dynamic; readonly value105: Dynamic; readonly value2: Dynamic; readonly value224: Dynamic; readonly value225: Dynamic; readonly value273: Dynamic; readonly value275: Dynamic; readonly value284: Dynamic; readonly value291: Dynamic; readonly value298: Dynamic; readonly value310: Dynamic; readonly value346: Dynamic; readonly value380: Dynamic; readonly value559: Dynamic; readonly value563: Dynamic; readonly value62: Dynamic; readonly value73: Dynamic; readonly value80: Dynamic }, input?: Dynamic, options: Dynamic = false): Dynamic {
    let value653: Dynamic = resolveCanvasPlaceAction(
      input,
      deps.value73.current,
      {
        filling: deps.value346.current,
        plays: true,
        pageId: deps.value80.current,
        mayFocus: deps.value224.current || deps.value225.current || false,
        restoring: options,
      },
    );
    if (value653 === null) return null;
    deps.value563.current?.abort();
    if (value653.do === "nothing") return value653.lands;
    let callback15: Dynamic = (): Dynamic => {
        deps.value284(false);
        deps.abandonSelectionGesture();
        deps.value62();
        let callback16: Dynamic = (input2?: Dynamic): Dynamic => {
          let value655: Dynamic = recallCanvasView(input2);
          value655 !== undefined &&
            ((deps.value291.current = false),
            (deps.value310.current = true),
            deps.value105.set(value655, true));
        };
        value653.do === "play"
          ? deps.value380(value653.file)
          : value653.do === "page"
            ? value653.id === deps.value80.current
              ? deps.setSelection(emptyCanvasSelection)
              : (deps.value298(value653.id),
                value653.camera || callback16(value653.id))
            : value653.do === "window"
              ? value653.page !== deps.value80.current
                ? deps.value298(value653.page, value653.file)
                : (deps.setSelection(emptyCanvasSelection),
                  deps.value559(value653.file),
                  deps.value273(value653.file))
              : (value653.page !== deps.value80.current
                  ? (deps.value298(
                      value653.page,
                      value653.focus ? value653.file : undefined,
                    ),
                    value653.camera || callback16(value653.page))
                  : (value653.focus && deps.value273(value653.file),
                    value653.camera && deps.value559(value653.file)),
                deps.setSelection(
                  selectionFromArtboards(
                    new Set([value653.file]),
                  ),
                ));
      },
      value654: Dynamic =
        value653.do === "window" ||
        value653.do === "play" ||
        (value653.do === "page" ? value653.id : value653.page) !==
          deps.value80.current;
    value654 && initializeDesignKeyboardBindings();
    let controller: Dynamic = new AbortController();
    deps.value563.current = controller;
    runFindRevealAfterSettle(
      value654 && deps.value2.current?.() === true,
      controller.signal,
      deps.value275,
      callback15,
    );
    return value653.lands;
  }
