import { McFindAttribute } from "../../editor/keyboard/find";
import { canRevealFindMatch } from "../../find/canvas-adapter";
import { designFileTextRuns } from "../../find/canvas-adapter";
import { findRestoreCamera } from "../../find/canvas-adapter";
import { initializeDesignKeyboardBindings } from "../../application/document-root";
import { isArtboardInViewport } from "../viewport-store";
import { recallCanvasView } from "../viewport-memory";
import { runFindRevealAfterSettle } from "../../find/canvas-adapter";
import { type Dynamic } from "../../runtime-types";
import { defaultCanvasCamera } from "../design-canvas";

/** 页面或画板变化时计算（useMemo）：为查找栏提供画板文本、显示匹配项所需的平移与聚焦，以及关闭后恢复视口。 */
export function buildFindCanvasAdapter(deps: { readonly doc: Dynamic; readonly value105: Dynamic; readonly value106: Dynamic; readonly value120: Dynamic; readonly value177: Dynamic; readonly value2: Dynamic; readonly value271: Dynamic; readonly value275: Dynamic; readonly value291: Dynamic; readonly value298: Dynamic; readonly value345: Dynamic; readonly value346: Dynamic; readonly value379: Dynamic; readonly value382: Dynamic; readonly value566: Dynamic; readonly value568: Dynamic; readonly value569: Dynamic; readonly value73: Dynamic; readonly value80: Dynamic; readonly value99: Dynamic }): Dynamic {
  return {
        manifest: (): Dynamic => deps.value73.current,
        pageId: (): Dynamic => deps.value80.current,
        windowFile: (): Dynamic => deps.value346.current,
        showsTextMatchesOnCanvas: (): Dynamic => !deps.value99,
        scrollsItself: (file?: Dynamic): Dynamic =>
          file === deps.value346.current || file === deps.value271.current,
        frame: (file?: Dynamic): Dynamic => {
          let entry: Dynamic = deps.value177.current.get(file);
          return entry != null && entry.isReady() && !entry.isBlocked()
            ? entry.webviewRef.current
            : null;
        },
        canvasRoot: (): Dynamic => deps.value106.current,
        storedText: (file?: Dynamic): Dynamic =>
          designFileTextRuns(file, deps.doc.content().files[file]),
        keepRunning: deps.value566,
        showPage: (
          pageId?: Dynamic,
          target?: Dynamic,
          revealContext?: Dynamic,
        ): Dynamic => (
          initializeDesignKeyboardBindings(),
          runFindRevealAfterSettle(
            deps.value2.current?.() === true,
            revealContext,
            deps.value275,
            (): Dynamic => {
              deps.value298(pageId, target);
              deps.value291.current = false;
              deps.value569.showedPage(pageId, deps.value105.get());
            },
          )
        ),
        editorOn: (file?: Dynamic): Dynamic => {
          try {
            return (
              deps.value177.current
                .get(file)
                ?.webviewRef.current?.contentDocument?.body?.hasAttribute(
                  "data-dc-editor-on",
                ) === true
            );
          } catch {
            return false;
          }
        },
        showInWindow: (
          pageId?: Dynamic,
          target?: Dynamic,
          revealContext?: Dynamic,
        ): Dynamic => {
          let canReveal: Dynamic = canRevealFindMatch(
            pageId !== deps.value80.current,
            deps.value345.current,
            target === deps.value346.current,
          );
          canReveal && initializeDesignKeyboardBindings();
          return runFindRevealAfterSettle(
            canReveal && deps.value2.current?.() === true,
            revealContext,
            deps.value275,
            (): Dynamic => {
              let isOtherPage: Dynamic = pageId !== deps.value80.current;
              if (
                !(
                  isOtherPage &&
                  (deps.value298(pageId, target),
                  (deps.value291.current = false),
                  deps.value345.current)
                )
              ) {
                if (!deps.value345.current) {
                  let openPlan: Dynamic = deps.value569.opensWindow(
                    pageId,
                    isOtherPage,
                    deps.value105.get(),
                    deps.value568.current,
                  );
                  deps.value379.current(
                    target,
                    openPlan === "page"
                      ? (recallCanvasView(pageId) ??
                          defaultCanvasCamera)
                      : openPlan === "fit"
                        ? defaultCanvasCamera
                        : undefined,
                  );
                  return;
                }
                deps.value382.current(target);
              }
            },
          );
        },
        panTo: (targetRect?: Dynamic, isRestoring?: Dynamic): Dynamic =>
          deps.value105.glide((currentCamera?: Dynamic): Dynamic => {
            deps.value569.pansFrom(currentCamera, deps.value568.current);
            let nextCamera: Dynamic = isArtboardInViewport(
                isRestoring === true
                  ? {
                      ...currentCamera,
                      ...findRestoreCamera(
                        currentCamera,
                        deps.value568.current,
                      ),
                    }
                  : currentCamera,
                targetRect,
                deps.value120(),
              ),
              commitCamera: Dynamic = (camera?: Dynamic): Dynamic => (
                (deps.value568.current =
                  isRestoring === true
                    ? null
                    : {
                        from: currentCamera,
                        to: camera,
                      }),
                camera
              ),
              findBarRect: Dynamic = (document as Dynamic)
                .querySelector("[" + McFindAttribute + "]")
                ?.getBoundingClientRect(),
              canvasRect: Dynamic = deps.value106.current?.getBoundingClientRect();
            if (!findBarRect || !canvasRect) return commitCamera(nextCamera);
            let screenLeft: Dynamic =
                canvasRect.left + (targetRect.x - nextCamera.x) * nextCamera.scale,
              screenTop: Dynamic =
                canvasRect.top + (targetRect.y - nextCamera.y) * nextCamera.scale,
              isCoveredByFindBar: Dynamic =
                screenLeft < findBarRect.right &&
                screenLeft + targetRect.w * nextCamera.scale > findBarRect.left &&
                screenTop < findBarRect.bottom + 8 &&
                screenTop + targetRect.h * nextCamera.scale > findBarRect.top;
            return commitCamera(
              isCoveredByFindBar
                ? {
                    ...nextCamera,
                    y:
                      nextCamera.y -
                      (findBarRect.bottom + 8 - screenTop) / nextCamera.scale,
                  }
                : nextCamera,
            );
          }),
        toCanvas: (screenRect?: Dynamic): Dynamic => {
          deps.value105.halt();
          let entry: Dynamic = deps.value105.get(),
            canvasBounds: Dynamic = deps.value106.current?.getBoundingClientRect();
          return {
            x: entry.x + (screenRect.x - (canvasBounds?.left ?? 0)) / entry.scale,
            y: entry.y + (screenRect.y - (canvasBounds?.top ?? 0)) / entry.scale,
            w: screenRect.w / entry.scale,
            h: screenRect.h / entry.scale,
          };
        },
      };
}
