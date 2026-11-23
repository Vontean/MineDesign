import { type Dynamic } from "../../runtime-types";
import { vectorToolStateReact as React } from "../../editor/vector/tool-state";
import { isAboveTitleRect } from "../pending-artboards";

/** 跨标题和 iframe 跟踪指针悬停，并在卸载时释放监听。 */
export function useArtboardTitleHover() {
  let [hoveredFile, setHoveredFile]: Dynamic = (0,
    React.useState)(null),
    titleHoverRef: Dynamic = (0, React.useRef)(null);
  (0, React.useEffect)(
    (): Dynamic => (): Dynamic => titleHoverRef.current?.release(),
    [],
  );
  let trackTitleHover: Dynamic = (
      element?: Dynamic,
      file?: Dynamic,
    ): Dynamic => {
      titleHoverRef.current?.release();
      let stopTitleHover: Dynamic = (): Dynamic => {
          (window as Dynamic).removeEventListener(
            "pointermove",
            handleTitleHoverMove,
            true,
          );
          (window as Dynamic).removeEventListener(
            "pointerout",
            handleTitleHoverMove,
            true,
          );
          titleHoverRef.current = null;
        },
        handleTitleHoverMove: Dynamic = (event?: Dynamic): Dynamic => {
          let hoverTarget: Dynamic =
            event.type !== "pointerout"
              ? event.target
              : event.relatedTarget instanceof HTMLIFrameElement
                ? event.relatedTarget
                : null;
          (event.type === "pointerout"
            ? event.relatedTarget != null && hoverTarget == null
            : isAboveTitleRect(
                event.clientX,
                event.clientY,
                element.getBoundingClientRect(),
              )) ||
            (stopTitleHover(),
            setHoveredFile(
              hoverTarget instanceof Element
                ? (hoverTarget
                    .closest("[data-mega-artboard]")
                    ?.getAttribute("data-mega-artboard") ?? null)
                : null,
            ));
        };
      (window as Dynamic).addEventListener("pointermove", handleTitleHoverMove, true);
      (window as Dynamic).addEventListener("pointerout", handleTitleHoverMove, true);
      titleHoverRef.current = {
        el: element,
        file: file,
        release: stopTitleHover,
      };
    },
    isPointerAboveOtherTitle: Dynamic = (event?: Dynamic, file?: Dynamic): Dynamic => {
      let current: Dynamic = titleHoverRef.current;
      return (
        current != null &&
        current.file !== file &&
        isAboveTitleRect(
          event.clientX,
          event.clientY,
          current.el.getBoundingClientRect(),
        )
      );
    };
  return { hoveredFile, setHoveredFile, titleHoverRef, trackTitleHover, isPointerAboveOtherTitle };
}
