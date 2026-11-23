import { type Dynamic } from "../../runtime-types";
import { isTouchSelectionStart, watchPointerRelease } from "../image-decode-scheduler";
import { canvasFacePointerAction, selectionPointerDownDecision } from "../hit-testing";
import { isAboveTitleRect } from "../pending-artboards";
import { hasBoardSelection } from "../../editor/selection/canvas-selection";
import { resizeRect, resizeRectKeepingAspect } from "../../editor/geometry/resize";
import { activeResizeGuides, snapResize } from "../../editor/geometry/snapping";
import { replaceDesignArtboards } from "../../platform/file-content";
import { canvasTouchDragThresholdPixels, isPrimaryModifierEvent, maximumArtboardSize, minimumArtboardSize } from "../interaction-geometry";
import type { CanvasView, Point, Rectangle, ResizeHandle } from "../../contracts/geometry";

// 单画板槽位的事件处理器。依赖在事件触发时由 JSX 绑定处组装，
// 渲染期派生值（isSelected、armedTool 等）显式传入，ref 在处理器内部读取。

type Ref<T> = { current: T };

/** 槽位对应的画板：位置、尺寸与文件名。 */
interface SlotSpec extends Rectangle {
  file: string;
}

/** 悬停判定只读事件的目标与坐标。 */
interface HoverEvent {
  target: EventTarget;
  currentTarget: HTMLElement;
  clientX: number;
  clientY: number;
}

/** 双击读取的修饰键与画板内偏移。 */
interface FaceClickEvent {
  shiftKey: boolean;
  metaKey: boolean;
  ctrlKey: boolean;
  altKey: boolean;
  nativeEvent: { offsetX: number; offsetY: number };
}

/** 焦点遮罩按下事件的子集。 */
interface FacePressEvent extends FaceClickEvent {
  button: number;
  pointerId: number;
  pointerType: string;
  clientX: number;
  clientY: number;
  currentTarget: HTMLElement;
}

/** 缩放手柄拖动过程中的指针事件。 */
interface ResizeMoveEvent {
  clientX: number;
  clientY: number;
  metaKey: boolean;
  ctrlKey: boolean;
  shiftKey: boolean;
}

/** 只检查"是否存在"的可选处理器，调用发生在别处。 */
type PresenceHandler = ((...args: never[]) => unknown) | undefined;

/** 指针进入槽位：被其他画板标题盖住时不设置悬停。 */
export function enterArtboardSlot(event: HoverEvent, {
  spec, titleHoverRef, setHoveredFile, isPointerAboveOtherTitle,
}: {
  spec: SlotSpec;
  titleHoverRef: Ref<{ release(): void } | null>;
  setHoveredFile: (file: string | null) => void;
  isPointerAboveOtherTitle: (event: HoverEvent, file: string) => boolean;
}): void {
  (!(event.target instanceof HTMLIFrameElement) &&
    isPointerAboveOtherTitle(event, spec.file)) ||
    (titleHoverRef.current?.release(), setHoveredFile(spec.file));
}

/** 指针离开槽位：若进入标题区则交给标题悬停跟踪，否则清空悬停。 */
export function leaveArtboardSlot(event: HoverEvent, {
  spec, aboveDistance, isPointerAboveOtherTitle, trackTitleHover, setHoveredFile,
}: {
  spec: SlotSpec;
  /** 缩放过低而隐藏标题时才有值。 */
  aboveDistance: number | undefined;
  isPointerAboveOtherTitle: (event: HoverEvent, file: string) => boolean;
  trackTitleHover: (slot: HTMLElement, file: string) => void;
  setHoveredFile: (file: string | null) => void;
}): void {
  isPointerAboveOtherTitle(event, spec.file) ||
    (aboveDistance !== undefined &&
    isAboveTitleRect(
      event.clientX,
      event.clientY,
      event.currentTarget.getBoundingClientRect(),
    )
      ? trackTitleHover(event.currentTarget, spec.file)
      : setHoveredFile(null));
}

/** 双击标题进入重命名。 */
export function startArtboardRename(event: unknown, {
  spec, isEventInsideTarget, onRenameArtboard, canEditCanvas, renameCancelledRef,
  isKeyboardInside, keyboardController, setRenamingFile,
}: {
  spec: SlotSpec;
  isEventInsideTarget: (event: unknown) => boolean;
  onRenameArtboard: ((file: string, title: string) => void) | undefined;
  canEditCanvas: boolean;
  renameCancelledRef: Ref<boolean>;
  isKeyboardInside: boolean;
  keyboardController: { onAbandon(): void } | undefined;
  setRenamingFile: (file: string | null) => void;
}): void {
  isEventInsideTarget(event) &&
    onRenameArtboard &&
    canEditCanvas &&
    ((renameCancelledRef.current = false),
    isKeyboardInside && keyboardController?.onAbandon(),
    setRenamingFile(spec.file));
}

/** 重命名输入框键盘：Enter 提交（经失焦），Escape 取消。 */
export function pressRenameKey(
  event: { key: string; stopPropagation(): void; currentTarget: HTMLElement },
  { renameCancelledRef, setRenamingFile }: {
    renameCancelledRef: Ref<boolean>;
    setRenamingFile: (file: string | null) => void;
  },
): void {
  event.stopPropagation();
  event.key === "Enter"
    ? event.currentTarget.blur()
    : event.key === "Escape" &&
      ((renameCancelledRef.current = true),
      setRenamingFile(null));
}

/** 重命名输入框失焦：已取消则忽略，否则提交新名称。 */
export function commitArtboardRename(event: { currentTarget: HTMLInputElement }, {
  spec, renameCancelledRef, setRenamingFile, onRenameArtboard,
}: {
  spec: SlotSpec;
  renameCancelledRef: Ref<boolean>;
  setRenamingFile: (file: string | null) => void;
  onRenameArtboard: ((file: string, title: string) => void) | undefined;
}): void {
  if (renameCancelledRef.current) {
    renameCancelledRef.current = false;
    return;
  }
  setRenamingFile(null);
  onRenameArtboard?.(
    spec.file,
    event.currentTarget.value,
  );
}

/** 拖动选中画板的尺寸手柄：实时改尺寸并显示吸附线，松手提交，取消回退。 */
export function beginArtboardResize(resizeHandle: ResizeHandle, pointerEvent: ResizeMoveEvent, {
  spec, camera, manifestRef, onManifestChange, buildSnapReferenceLines,
  trackHandleDragGestureBound, setSnapGuides,
}: {
  spec: SlotSpec;
  camera: { get(): CanvasView };
  manifestRef: Ref<{ artboards: SlotSpec[] }>;
  /** changeMeta 为 false 表示实时预览，true 表示提交；resizedFrom 记录提交前的尺寸供历史使用。 */
  onManifestChange: (
    manifest: { artboards: SlotSpec[] },
    changeMeta: boolean,
    extra: { resizedFrom: SlotSpec } | undefined,
  ) => void;
  buildSnapReferenceLines: (scope: { files: string[] }) => unknown;
  trackHandleDragGestureBound: (
    pointerEvent: ResizeMoveEvent,
    kind: "resize",
    handlers: {
      live: (moveEvent: ResizeMoveEvent) => void;
      commit: () => void;
      revert: () => void;
      end: () => void;
    },
  ) => void;
  /** 吸附线由 editor/geometry/snapping 生成，这里只负责显示与清除。 */
  setSnapGuides: (guides: unknown[] | null) => void;
}): void {
  let state: Dynamic = {
      x: spec.x,
      y: spec.y,
      w: spec.w,
      h: spec.h,
    },
    [items, startClientY]: Dynamic = [
      pointerEvent.clientX,
      pointerEvent.clientY,
    ],
    resizeKeys: Dynamic = [
      ...(resizeHandle.x
        ? resizeHandle.x === "left"
          ? ["x", "w"]
          : ["w"]
        : []),
      ...(resizeHandle.y
        ? resizeHandle.y === "top"
          ? ["y", "h"]
          : ["h"]
        : []),
    ],
    isCornerResize: Dynamic =
      resizeHandle.x !== null && resizeHandle.y !== null,
    snapReferenceLines: Dynamic = buildSnapReferenceLines({
      files: [spec.file],
    }),
    computeResize: Dynamic = (
      moveEvent?: Dynamic,
    ): Dynamic => {
      let scale: Dynamic = camera.get().scale,
        pointerDelta: Dynamic = {
          dx:
            (moveEvent.clientX - items) / scale,
          dy:
            (moveEvent.clientY - startClientY) / scale,
        },
        snapped: Dynamic =
          moveEvent.metaKey || moveEvent.ctrlKey
            ? {
                ...pointerDelta,
                guides: [],
              }
            : snapResize(
                state,
                resizeHandle,
                pointerDelta.dx,
                pointerDelta.dy,
                snapReferenceLines,
                canvasTouchDragThresholdPixels /
                  scale,
              ),
        [deltaX, deltaY]: Dynamic = [
          Math.round(snapped.dx),
          Math.round(snapped.dy),
        ],
        rawBox: Dynamic =
          isCornerResize && moveEvent.shiftKey
            ? resizeRectKeepingAspect(
                state,
                resizeHandle,
                deltaX,
                deltaY,
                minimumArtboardSize,
                maximumArtboardSize,
              )
            : resizeRect(
                state,
                resizeHandle,
                deltaX,
                deltaY,
                minimumArtboardSize,
                maximumArtboardSize,
              ),
        roundedBox: Dynamic =
          isCornerResize && moveEvent.shiftKey
            ? {
                x: Math.round(rawBox.x),
                y: Math.round(rawBox.y),
                w: Math.round(rawBox.w),
                h: Math.round(rawBox.h),
              }
            : rawBox;
      return {
        box: roundedBox,
        guides: activeResizeGuides(
          roundedBox,
          resizeHandle,
          snapped.guides,
        ),
      };
    },
    pickResizeKeys: Dynamic = (
      box?: Dynamic,
    ): Dynamic =>
      Object.fromEntries(
        resizeKeys.map(
          (key?: Dynamic): Dynamic => [
            key,
            box[key],
          ],
        ),
      ),
    applyArtboardBox: Dynamic = (
      boxChange?: Dynamic,
      changeMeta?: Dynamic,
    ): Dynamic => {
      let currentArtboard: Dynamic =
        manifestRef.current.artboards.find(
          (item?: Dynamic): Dynamic =>
            item.file === spec.file,
        );
      onManifestChange(
        replaceDesignArtboards(
          manifestRef.current,
          manifestRef.current.artboards.map(
            (item?: Dynamic): Dynamic =>
              item.file === spec.file
                ? {
                    ...item,
                    ...pickResizeKeys(boxChange),
                  }
                : item,
          ),
        ),
        changeMeta,
        changeMeta && currentArtboard
          ? {
              resizedFrom: {
                file: spec.file,
                x: currentArtboard.x,
                y: currentArtboard.y,
                w: currentArtboard.w,
                h: currentArtboard.h,
                ...pickResizeKeys(state),
              },
            }
          : undefined,
      );
    },
    currentBox: Dynamic = state;
  trackHandleDragGestureBound(pointerEvent, "resize", {
    live: (moveEvent?: Dynamic): Dynamic => {
      let resizeResult: Dynamic =
        computeResize(moveEvent);
      currentBox = resizeResult.box;
      applyArtboardBox(currentBox, false);
      setSnapGuides(
        resizeResult.guides.length > 0
          ? resizeResult.guides
          : null,
      );
    },
    commit: (): Dynamic =>
      applyArtboardBox(currentBox, true),
    revert: (): Dynamic =>
      applyArtboardBox(state, false),
    end: (): Dynamic => setSnapGuides(null),
  });
}

/** 未加载或延迟挂载的预览占位被按下：松开时才激活预览，放置类工具除外。 */
export function pressOffloadedPreview(event: Pick<FacePressEvent, "button" | "shiftKey" | "nativeEvent">, {
  spec, armedToolRef, supportsClickPlacement, activateArtboardPreview,
}: {
  spec: SlotSpec;
  armedToolRef: Ref<string | null>;
  supportsClickPlacement: (tool: string | null) => boolean;
  activateArtboardPreview: (file: string, additive: boolean) => unknown;
}): void {
  if (
    event.button !== 0 ||
    armedToolRef.current === "note" ||
    armedToolRef.current === "frame" ||
    supportsClickPlacement(
      armedToolRef.current,
    )
  )
    return;
  let shiftKey: Dynamic = event.shiftKey;
  watchPointerRelease(
    event.nativeEvent,
    (): Dynamic =>
      activateArtboardPreview(spec.file, shiftKey),
  );
}

/** 无外框画板（零件）的焦点遮罩被双击：进入零件内部。 */
export function doubleClickFramelessFace(event: Pick<FaceClickEvent, "nativeEvent">, {
  spec, canEditCanvas, onEnterPiece,
}: {
  spec: SlotSpec;
  canEditCanvas: boolean;
  onEnterPiece: ((file: string, x: number, y: number) => void) | undefined;
}): void {
  canEditCanvas &&
    onEnterPiece?.(
      spec.file,
      event.nativeEvent.offsetX,
      event.nativeEvent.offsetY,
    );
}

/** 普通画板的封面遮罩被双击：等封面按下流程结束后通知宿主。 */
export function doubleClickArtboardFace(event: FaceClickEvent, {
  spec, onFaceDoubleClick, canEditCanvas, isTouchPointer, armedTool, fullscreenFile, coverPressRef,
}: {
  spec: SlotSpec;
  onFaceDoubleClick: ((file: string, at: Point) => void) | undefined;
  canEditCanvas: boolean;
  isTouchPointer: boolean;
  armedTool: string | null | undefined;
  fullscreenFile: string | null | undefined;
  coverPressRef: Ref<Promise<unknown> | null>;
}): void {
  if (
    event.shiftKey ||
    event.metaKey ||
    event.ctrlKey ||
    event.altKey ||
    !onFaceDoubleClick ||
    !canEditCanvas ||
    isTouchPointer ||
    (armedTool != null &&
      armedTool !== "select") ||
    fullscreenFile != null
  )
    return;
  let state: Dynamic = {
    x: event.nativeEvent.offsetX,
    y: event.nativeEvent.offsetY,
  };
  (
    coverPressRef.current ?? Promise.resolve()
  ).then(
    (): Dynamic =>
      onFaceDoubleClick(spec.file, state),
  );
}

/** 焦点遮罩按下：按画板类型、触摸、已选元素、Alt 复制分流到选择、移动或拖动。 */
export function pressArtboardFace(event: FacePressEvent, {
  spec, isFrameless, isSelected, usesFaceOverlay, usesSetOverlay, canEditCanvas,
  armedTool, fullscreenFile, onSetMoveCommit, onDuplicateObjects, onFocus,
  selectionRef, dragReleaseRef, cancelHoverCurtain, hasSelectedElements,
  beginElementMove, beginBoardDragBound, selectArtboard, pressArtboardCoverBound,
}: {
  spec: SlotSpec;
  isFrameless: boolean;
  isSelected: boolean;
  usesFaceOverlay: boolean;
  usesSetOverlay: boolean;
  canEditCanvas: boolean;
  armedTool: string | null | undefined;
  fullscreenFile: string | null | undefined;
  /** 只判断是否提供，调用发生在拖动提交处。 */
  onSetMoveCommit: PresenceHandler;
  onDuplicateObjects: PresenceHandler;
  onFocus: (file: string) => void;
  /** 画布选择状态；结构由 editor/selection 定义，这里只原样传递。 */
  selectionRef: Ref<unknown>;
  dragReleaseRef: Ref<(() => void) | null>;
  cancelHoverCurtain: () => void;
  hasSelectedElements: () => boolean;
  beginElementMove: (options: {
    pointerId: number;
    captureEl: HTMLElement;
    clientX: number;
    clientY: number;
    leader: { canvas: { file: string } };
    stillAction: () => void;
    armWait: null;
    heldCover: null;
  }) => void;
  beginBoardDragBound: (
    event: FacePressEvent,
    board: { file: string },
    spec: SlotSpec,
    carry: unknown,
    click: unknown,
  ) => void;
  selectArtboard: (file: string, additive: boolean) => void;
  pressArtboardCoverBound: (
    event: FacePressEvent,
    spec: SlotSpec,
    press: {
      toggle: boolean;
      deepKey: boolean;
      still: boolean | undefined;
      face: boolean;
      kind: "face" | "set" | "focus";
      at: Point;
    },
  ) => void;
}): void {
  cancelHoverCurtain();
  if (event.button !== 0) return;
  let shiftKey: Dynamic = event.shiftKey;
  if (isFrameless) {
    if (
      isTouchSelectionStart(
        event.pointerType,
        isSelected,
      )
    ) {
      watchPointerRelease(
        event.nativeEvent,
        (): Dynamic =>
          selectArtboard(spec.file, shiftKey),
      );
      return;
    }
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
        stillAction: (): Dynamic =>
          selectArtboard(spec.file, false),
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
    );
    return;
  }
  let facePointerAction: Dynamic = canvasFacePointerAction({
      editing: canEditCanvas,
      pointerType: event.pointerType,
      tool: armedTool,
      fullscreen: fullscreenFile != null,
      faceOverlay: usesFaceOverlay,
    }),
    isDeepKey: Dynamic = isPrimaryModifierEvent(event),
    state: Dynamic = {
      x: event.nativeEvent.offsetX,
      y: event.nativeEvent.offsetY,
    },
    pressFace: Dynamic = (
      isStill?: Dynamic,
    ): Dynamic => {
      facePointerAction === "pick" &&
      !(usesSetOverlay && event.pointerType === "touch")
        ? pressArtboardCoverBound(event, spec, {
            toggle: shiftKey,
            deepKey: isDeepKey,
            still: isStill,
            face: usesFaceOverlay,
            kind: usesFaceOverlay
              ? "face"
              : usesSetOverlay
                ? "set"
                : "focus",
            at: state,
          })
        : facePointerAction === "leave"
          ? selectArtboard(spec.file, true)
          : (selectArtboard(spec.file, shiftKey),
            shiftKey || onFocus(spec.file));
    };
  if (event.pointerType === "touch") {
    watchPointerRelease(
      event.nativeEvent,
      (): Dynamic => pressFace(true),
    );
    return;
  }
  if (
    canEditCanvas &&
    isSelected &&
    !shiftKey &&
    !event.altKey &&
    !isDeepKey &&
    fullscreenFile == null
  ) {
    if (onSetMoveCommit && hasSelectedElements()) {
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
        stillAction: (): Dynamic =>
          pressFace(true),
        armWait: null,
        heldCover: null,
      });
      return;
    }
    dragReleaseRef.current = (): Dynamic =>
      pressFace(true);
    beginBoardDragBound(
      event,
      {
        file: spec.file,
      },
      spec,
      selectionRef.current,
      null,
    );
    return;
  }
  if (
    event.altKey &&
    !shiftKey &&
    !usesSetOverlay &&
    onDuplicateObjects &&
    fullscreenFile == null
  ) {
    let altPressDecision: Dynamic = selectionPointerDownDecision(
      selectionRef.current,
      {
        file: spec.file,
      },
      false,
    );
    altPressDecision.selectNow &&
      selectArtboard(spec.file, false);
    beginBoardDragBound(
      event,
      {
        file: spec.file,
      },
      spec,
      altPressDecision.carry,
      altPressDecision.click,
    );
    return;
  }
  pressFace(false);
}

/** 焦点遮罩抬起：先结束拖动，仅在同一指针且未进入拖动时触发待执行的点击。 */
export function releaseArtboardFace(event: Pick<FacePressEvent, "pointerId">, {
  dragSessionRef, dragReleaseRef, updateBoardDragBound,
}: {
  dragSessionRef: Ref<{ pointerId: number; live: boolean } | null>;
  dragReleaseRef: Ref<(() => void) | null>;
  updateBoardDragBound: (event: Pick<FacePressEvent, "pointerId">, ended: boolean) => void;
}): void {
  let [dragSession, releaseHandler]: Dynamic = [
    dragSessionRef.current,
    dragReleaseRef.current,
  ];
  dragReleaseRef.current = null;
  updateBoardDragBound(event, true);
  releaseHandler &&
    dragSession &&
    dragSession.pointerId === event.pointerId &&
    !dragSession.live &&
    releaseHandler();
}
