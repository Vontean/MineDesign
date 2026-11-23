import { type Dynamic } from "../../runtime-types";
import { isTouchSelectionStart, watchPointerRelease } from "../image-decode-scheduler";
import { selectionPointerDownDecision } from "../hit-testing";
import { boardSelectionItems, hasBoardSelection } from "../../editor/selection/canvas-selection";

type TitlePressContext = {
  spec: Dynamic;
  renamingFile: Dynamic;
  isSelected: boolean;
  canFocusArtboard: boolean;
  isPlaying: boolean;
  artboardPicking: boolean;
  selectionRef: { current: Dynamic };
  onSetMoveCommit: Dynamic;
  onFocus: Dynamic;
  onSelectObjects: Dynamic;
  isEventInsideTarget: Dynamic;
  selectArtboard: Dynamic;
  hasSelectedElements: Dynamic;
  beginElementMove: Dynamic;
  beginBoardDragBound: Dynamic;
};

/** 标题按下优先处理触摸选择、已选元素移动，再进入画板拖动。 */
export function pressArtboardTitle(event: Dynamic, {
  spec, renamingFile, isSelected, canFocusArtboard, isPlaying, artboardPicking,
  selectionRef, onSetMoveCommit, onFocus, onSelectObjects, isEventInsideTarget,
  selectArtboard, hasSelectedElements, beginElementMove, beginBoardDragBound,
}: TitlePressContext): void {
  if (
    event.button !== 0 ||
    renamingFile === spec.file ||
    !isEventInsideTarget(event)
  )
    return;
  if (
    isTouchSelectionStart(
      event.pointerType,
      isSelected,
    )
  ) {
    let touchShiftKey: Dynamic = event.shiftKey,
      shouldFocusAfterSelect: Dynamic =
        !touchShiftKey && !event.altKey;
    watchPointerRelease(
      event.nativeEvent,
      (): Dynamic => {
        selectArtboard(spec.file, touchShiftKey);
        canFocusArtboard &&
          shouldFocusAfterSelect &&
          !isPlaying &&
          !artboardPicking &&
          onFocus(spec.file);
      },
    );
    return;
  }
  let shiftKey: Dynamic = event.shiftKey;
  if (
    onSetMoveCommit &&
    event.pointerType !== "touch" &&
    !shiftKey &&
    !event.altKey &&
    hasBoardSelection(
      selectionRef.current,
      {
        file: spec.file,
      },
    ) &&
    hasSelectedElements()
  ) {
    let shouldFocusOnStill: Dynamic =
      canFocusArtboard && !isPlaying && !artboardPicking;
    beginElementMove({
      pointerId: event.pointerId,
      captureEl: event.currentTarget,
      clientX: event.clientX,
      clientY: event.clientY,
      leader: {
        canvas: {
          file: spec.file,
        },
      },
      stillAction: (): Dynamic => {
        onSelectObjects(
          boardSelectionItems({
            file: spec.file,
          }),
          "replace",
        );
        shouldFocusOnStill && onFocus(spec.file);
      },
      armWait: null,
      heldCover: null,
    });
    return;
  }
  let pressDecision: Dynamic = selectionPointerDownDecision(
    selectionRef.current,
    {
      file: spec.file,
    },
    shiftKey,
  );
  pressDecision.selectNow &&
    selectArtboard(spec.file, shiftKey);
  beginBoardDragBound(
    event,
    {
      file: spec.file,
    },
    spec,
    pressDecision.carry,
    pressDecision.click,
    canFocusArtboard &&
      !shiftKey &&
      !isPlaying &&
      !artboardPicking,
  );
}
