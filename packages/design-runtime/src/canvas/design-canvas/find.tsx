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
        scrollsItself: (input?: Dynamic): Dynamic =>
          input === deps.value346.current || input === deps.value271.current,
        frame: (input?: Dynamic): Dynamic => {
          let entry: Dynamic = deps.value177.current.get(input);
          return entry != null && entry.isReady() && !entry.isBlocked()
            ? entry.webviewRef.current
            : null;
        },
        canvasRoot: (): Dynamic => deps.value106.current,
        storedText: (input?: Dynamic): Dynamic =>
          (0, designFileTextRuns)(input, deps.doc.content().files[input]),
        keepRunning: deps.value566,
        showPage: (
          input?: Dynamic,
          options?: Dynamic,
          context?: Dynamic,
        ): Dynamic => (
          (0, initializeDesignKeyboardBindings)(),
          (0, runFindRevealAfterSettle)(
            deps.value2.current?.() === true,
            context,
            deps.value275,
            (): Dynamic => {
              deps.value298(input, options);
              deps.value291.current = false;
              deps.value569.showedPage(input, deps.value105.get());
            },
          )
        ),
        editorOn: (input?: Dynamic): Dynamic => {
          try {
            return (
              deps.value177.current
                .get(input)
                ?.webviewRef.current?.contentDocument?.body?.hasAttribute(
                  "data-dc-editor-on",
                ) === true
            );
          } catch {
            return false;
          }
        },
        showInWindow: (
          input?: Dynamic,
          options?: Dynamic,
          context?: Dynamic,
        ): Dynamic => {
          let value653: Dynamic = (0, canRevealFindMatch)(
            input !== deps.value80.current,
            deps.value345.current,
            options === deps.value346.current,
          );
          value653 && (0, initializeDesignKeyboardBindings)();
          return (0, runFindRevealAfterSettle)(
            value653 && deps.value2.current?.() === true,
            context,
            deps.value275,
            (): Dynamic => {
              let value654: Dynamic = input !== deps.value80.current;
              if (
                !(
                  value654 &&
                  (deps.value298(input, options),
                  (deps.value291.current = false),
                  deps.value345.current)
                )
              ) {
                if (!deps.value345.current) {
                  let value655: Dynamic = deps.value569.opensWindow(
                    input,
                    value654,
                    deps.value105.get(),
                    deps.value568.current,
                  );
                  deps.value379.current(
                    options,
                    value655 === "page"
                      ? ((0, recallCanvasView)(input) ??
                          defaultCanvasCamera)
                      : value655 === "fit"
                        ? defaultCanvasCamera
                        : undefined,
                  );
                  return;
                }
                deps.value382.current(options);
              }
            },
          );
        },
        panTo: (input?: Dynamic, options?: Dynamic): Dynamic =>
          deps.value105.glide((input2?: Dynamic): Dynamic => {
            deps.value569.pansFrom(input2, deps.value568.current);
            let value653: Dynamic = (0, isArtboardInViewport)(
                options === true
                  ? {
                      ...input2,
                      ...(0, findRestoreCamera)(
                        input2,
                        deps.value568.current,
                      ),
                    }
                  : input2,
                input,
                deps.value120(),
              ),
              callback15: Dynamic = (input3?: Dynamic): Dynamic => (
                (deps.value568.current =
                  options === true
                    ? null
                    : {
                        from: input2,
                        to: input3,
                      }),
                input3
              ),
              value654: Dynamic = (document as Dynamic)
                .querySelector("[" + McFindAttribute + "]")
                ?.getBoundingClientRect(),
              value655: Dynamic = deps.value106.current?.getBoundingClientRect();
            if (!value654 || !value655) return callback15(value653);
            let value656: Dynamic =
                value655.left + (input.x - value653.x) * value653.scale,
              value657: Dynamic =
                value655.top + (input.y - value653.y) * value653.scale,
              value658: Dynamic =
                value656 < value654.right &&
                value656 + input.w * value653.scale > value654.left &&
                value657 < value654.bottom + 8 &&
                value657 + input.h * value653.scale > value654.top;
            return callback15(
              value658
                ? {
                    ...value653,
                    y:
                      value653.y -
                      (value654.bottom + 8 - value657) / value653.scale,
                  }
                : value653,
            );
          }),
        toCanvas: (input?: Dynamic): Dynamic => {
          deps.value105.halt();
          let entry: Dynamic = deps.value105.get(),
            value653: Dynamic = deps.value106.current?.getBoundingClientRect();
          return {
            x: entry.x + (input.x - (value653?.left ?? 0)) / entry.scale,
            y: entry.y + (input.y - (value653?.top ?? 0)) / entry.scale,
            w: input.w / entry.scale,
            h: input.h / entry.scale,
          };
        },
      };
}
