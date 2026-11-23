import type { Dynamic } from '../../runtime-types';
import { vectorToolStateReact as React } from '../../editor/vector/tool-state';
import { setPrimaryModifierHeld, subscribePrimaryModifierHeld } from '../../editor/primary-modifier';
import { pickerHoverAt } from '../../editor/picker/bridge';
import { createPreviewHandle } from '../../preview/evaluation';
import { isPrimaryModifierEvent } from '../interaction-geometry';

export function toggleArtboardDragCurtain(
  artboard?: Dynamic,
  enabled?: Dynamic,
  templateIds: Dynamic = [],
  passthrough: Dynamic = false,
): Dynamic {
  let previewHandle: Dynamic = artboard
    ? createPreviewHandle(artboard.previewFrameRef.current)
    : null;
  previewHandle &&
    pickerHoverAt(
      previewHandle,
      enabled,
      templateIds,
      passthrough,
      (enabled && artboard?.textTids()) ?? [],
    );
}
/** 在选中画板上协调 hover 遮罩、修饰键和清理。 */
export function useArtboardHoverCurtain({
  artboardHandlesRef, selectedTidsByFileRef, canEditCanvas, armedTool,
  focusedFile, fullscreenFile, playingFile, isTouchPointer, selectedArtboards,
}: {
  artboardHandlesRef: Dynamic;
  selectedTidsByFileRef: Dynamic;
  canEditCanvas: boolean;
  armedTool: string | null;
  focusedFile: string | null;
  fullscreenFile: string | null;
  playingFile: string | null;
  isTouchPointer: boolean;
  selectedArtboards: Set<string>;
}) {
  const hoverCurtainRef: Dynamic = (0, React.useRef)(null);
  let cancelHoverCurtain: Dynamic = (0,
    React.useCallback)((): Dynamic => {
      let current: Dynamic = hoverCurtainRef.current;
      current &&
        (current.raf && cancelAnimationFrame(current.raf),
        (hoverCurtainRef.current = null),
        toggleArtboardDragCurtain(artboardHandlesRef.current.get(current.file), null));
    }, []),
    scheduleHoverCurtain: Dynamic = (file?: Dynamic, event?: Dynamic): Dynamic => {
      if (
        !canEditCanvas ||
        event.pointerType === "touch" ||
        event.buttons !== 0 ||
        (armedTool != null &&
          armedTool !== "select" &&
          armedTool !== "vector")
      ) {
        cancelHoverCurtain();
        return;
      }
      hoverCurtainRef.current && hoverCurtainRef.current.file !== file && cancelHoverCurtain();
      let hoverState: Dynamic = (hoverCurtainRef.current ??= {
        file: file,
        x: 0,
        y: 0,
        deep: false,
        raf: 0,
      });
      hoverState.x = event.nativeEvent.offsetX;
      hoverState.y = event.nativeEvent.offsetY;
      hoverState.deep = isPrimaryModifierEvent(event);
      setPrimaryModifierHeld(hoverState.deep);
      !hoverState.raf &&
        (hoverState.raf = requestAnimationFrame((): Dynamic => {
          hoverState.raf = 0;
          hoverCurtainRef.current === hoverState &&
            toggleArtboardDragCurtain(
              artboardHandlesRef.current.get(file),
              {
                x: hoverState.x,
                y: hoverState.y,
              },
              selectedTidsByFileRef.current?.[file],
              hoverState.deep,
            );
        }));
    };
  (0, React.useEffect)(
    (): Dynamic => cancelHoverCurtain,
    [focusedFile, armedTool, canEditCanvas, fullscreenFile, playingFile, cancelHoverCurtain],
  );
  let hoverFocusedFile: Dynamic =
    canEditCanvas &&
    !isTouchPointer &&
    (armedTool == null || armedTool === "select") &&
    fullscreenFile == null &&
    focusedFile != null &&
    selectedArtboards.has(focusedFile)
      ? focusedFile
      : null;
  (0, React.useEffect)((): Dynamic => {
    let current: Dynamic = hoverCurtainRef.current;
    hoverFocusedFile == null &&
      current?.file === focusedFile &&
      (current.raf && cancelAnimationFrame(current.raf),
      (hoverCurtainRef.current = null));
  }, [hoverFocusedFile, focusedFile]);
  (0, React.useEffect)(
    (): Dynamic =>
      subscribePrimaryModifierHeld(
        (isDeep?: Dynamic): Dynamic => {
          let current: Dynamic = hoverCurtainRef.current;
          current &&
            ((current.deep = isDeep),
            !current.raf &&
              toggleArtboardDragCurtain(
                artboardHandlesRef.current.get(current.file),
                {
                  x: current.x,
                  y: current.y,
                },
                selectedTidsByFileRef.current?.[current.file],
                isDeep,
              ));
        },
      ),
    [],
  );
  return { cancelHoverCurtain, scheduleHoverCurtain };
}
