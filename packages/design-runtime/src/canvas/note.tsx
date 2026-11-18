import { uiMessage } from '@minedesign/contracts/ui-messages';
import { useUiLocale } from '../ui-locale.ts';
/** Restored application module; prepare first, initialize in original order. */
import {
  type Dynamic,
} from "../runtime-types";
import { beginArtboardResize } from "./artboard-resize";
import { CanvasPanZoomRound, CanvasPanZoomScrollTop, reactCanvasPanZoom } from "./pan-zoom";
import { useViewportStore, ViewportScale } from "./viewport-store";
import { SelectionRing } from "../cds/components/selection-ring";
import { load_react_jsx_runtime } from "../dependencies";
import { joinClassNames } from "../editor/chrome/overlay-state";
import { showEditorToast } from "../editor/chrome/pending-toasts";
import { angleBetweenPoints, resizeRotatedRect, snapRotation } from "../editor/geometry/rotation";
import { activeResizeGuides, snapResize } from "../editor/geometry/snapping";
import { handleNoteAutoformat, handleNoteFormattingShortcut, installNoteInputRules, moveNoteCaretToEnd, NotesAutoformatOnPasteOnDropOnDragStartConfig } from "../editor/notes/autoformat";
import { NotesBlocksReplace_2 as normalizeNoteBlocks, renderNoteMarkdown } from "../editor/notes/blocks";
import { applyNoteMarkdownDom, normalizeNoteLineBreaks, NotesDomHandler_2, NotesDomJoin, serializeNoteDom } from "../editor/notes/dom";
import { createNoteLinkEditor, NotesLinkEditingClosest, NotesLinkEditingHandler, NotesLinkEditingMin, NotesLinkEditingSize } from "../editor/notes/link-editing";
import { toModuleNamespace } from "../module-helpers";
import { annotationTextFit, annotationTextStyle, PlatformFileContentConstant_10 as noteMaxWidth, PlatformFileContentConstant_13 as noteMaxHeight, PlatformFileContentConstant_9 as noteMinWidth, PlatformFileContentKind, PlatformFileContentLimit_4 as noteTextLimit, PlatformFileContentMaxW, PlatformFileContentMin, PlatformFileContentSlice_2 as truncateNoteText } from "../platform/file-content";

var jsxCanvasNote: Dynamic;
function CanvasNote({
  spec: spec,
  editing: editing,
  commenting = false,
  selected: selected,
  grouped = false,
  objectPress: objectPress,
  onChange: onChange,
  onGesture: onGesture,
  armWindowGestureEnd: armWindowGestureEnd,
  onTextEditing: onTextEditing,
  autoEdit: autoEdit,
  onMeasure: onMeasure,
  snapLines: snapLines,
  onSnapGuides: onSnapGuides,
}: Dynamic): Dynamic {
  useUiLocale();
  let [isEditingText, setIsEditingText]: Dynamic = (0, reactCanvasPanZoom.useState)(
    autoEdit === true,
  );
  (0, reactCanvasPanZoom.useEffect)(
    (): Dynamic => (
      onTextEditing?.(isEditingText),
      (): Dynamic => {
        isEditingText && onTextEditing?.(false);
      }
    ),
    [isEditingText],
  );
  let editorRef: Dynamic = (0, reactCanvasPanZoom.useRef)(null),
    linkEditorRef: Dynamic = (0, reactCanvasPanZoom.useRef)(null),
    focusOutHandlerRef: Dynamic = (0, reactCanvasPanZoom.useRef)(null),
    clearFocusOutHandler: Dynamic = (): Dynamic => {
      focusOutHandlerRef.current &&
        (document as Dynamic).removeEventListener(
          "focusout",
          focusOutHandlerRef.current,
          true,
        );
      focusOutHandlerRef.current = null;
    };
  (0, reactCanvasPanZoom.useEffect)((): Dynamic => clearFocusOutHandler, []);
  let noteRef: Dynamic = (0, reactCanvasPanZoom.useRef)(null),
    isTitle: Dynamic = spec.kind === "title1",
    viewportStore: Dynamic = useViewportStore(),
    rotation: Dynamic = spec.rotate ?? 0,
    editingRef: Dynamic = (0, reactCanvasPanZoom.useRef)(editing);
  editingRef.current = editing;
  let [rotationPreview, setRotationPreview]: Dynamic = (0, reactCanvasPanZoom.useState)(
      null,
    ),
    startRotate: Dynamic = (grip?: Dynamic, pointerEvent?: Dynamic): Dynamic => {
      if (!noteRef.current) return;
      let bounds: Dynamic = noteRef.current.getBoundingClientRect(),
        [centerX, centerY]: Dynamic = [
          bounds.left + bounds.width / 2,
          bounds.top + bounds.height / 2,
        ],
        [startRotation, startAngle]: Dynamic = [
          rotation,
          angleBetweenPoints(
            centerX,
            centerY,
            pointerEvent.clientX,
            pointerEvent.clientY,
          ),
        ];
      beginArtboardResize(pointerEvent, {
        src: "ann-resize",
        scale: viewportStore.get().scale,
        sound: (): Dynamic => editingRef.current,
        onGesture: onGesture,
        armWindowGestureEnd: armWindowGestureEnd,
        patchAt: (
          deltaX?: Dynamic,
          deltaY?: Dynamic,
          moveEvent?: Dynamic,
        ): Dynamic => {
          let nextRotation: Dynamic = snapRotation(
            startRotation +
              angleBetweenPoints(
                centerX,
                centerY,
                moveEvent.clientX,
                moveEvent.clientY,
              ) -
              startAngle,
            moveEvent.shiftKey,
          );
          setRotationPreview(nextRotation);
          return {
            rotate: nextRotation,
          };
        },
        onChange: onChange,
        restore: {
          rotate: startRotation,
        },
        onEnd: (): Dynamic => setRotationPreview(null),
      });
    },
    setNoteElement: Dynamic = (0, reactCanvasPanZoom.useCallback)(
      (element?: Dynamic): Dynamic => (
        (noteRef.current = element),
        isTitle ? viewportStore.stamp(element) : undefined
      ),
      [viewportStore, isTitle],
    ),
    scrollRef: Dynamic = (0, reactCanvasPanZoom.useRef)(null),
    contentRef: Dynamic = (0, reactCanvasPanZoom.useRef)(null),
    handleTouchPointerDown: Dynamic = (event?: Dynamic): Dynamic => {
      if (event.pointerType !== "touch") return;
      let [touchPointerId, savedView]: Dynamic = [event.pointerId, viewportStore.get()],
        handlePointerEnd: Dynamic = (endEvent?: Dynamic): Dynamic => {
          if (endEvent.pointerId === touchPointerId) {
            for (let eventName of ["pointercancel", "pointerup"] as Dynamic)
              (window as Dynamic).removeEventListener(
                eventName,
                handlePointerEnd,
                true,
              );
            endEvent.type === "pointercancel" &&
              (window as Dynamic).setTimeout(
                (): Dynamic => viewportStore.set(savedView),
                0,
              );
          }
        };
      for (let eventName of ["pointercancel", "pointerup"] as Dynamic)
        (window as Dynamic).addEventListener(eventName, handlePointerEnd, true);
    },
    [scrollEdges, setScrollEdges]: Dynamic = (0, reactCanvasPanZoom.useState)({
      above: false,
      below: false,
    }),
    updateScrollEdges: Dynamic = (0,
    reactCanvasPanZoom.useCallback)((): Dynamic => {
      let current: Dynamic = scrollRef.current;
      if (!current) return;
      let nextEdges: Dynamic = CanvasPanZoomScrollTop(current);
      setScrollEdges(
        (previousEdges?: Dynamic): Dynamic =>
          previousEdges.above === nextEdges.above && previousEdges.below === nextEdges.below
            ? previousEdges
            : nextEdges,
      );
    }, []),
    measureRef: Dynamic = (0, reactCanvasPanZoom.useRef)(null),
    [measuredSize, setMeasuredSize]: Dynamic = (0, reactCanvasPanZoom.useState)({
      w: 0,
      h: 0,
    }),
    [liveText, setLiveText]: Dynamic = (0, reactCanvasPanZoom.useState)(
      null,
    ),
    [contentHeight, setContentHeight]: Dynamic = (0, reactCanvasPanZoom.useState)(0),
    [draftMaxH, setDraftMaxH]: Dynamic = (0, reactCanvasPanZoom.useState)(
      null,
    ),
    [noteSize, setNoteSize]: Dynamic = (0, reactCanvasPanZoom.useState)({
      w: 0,
      h: 0,
    }),
    onMeasureRef: Dynamic = (0, reactCanvasPanZoom.useRef)(onMeasure);
  onMeasureRef.current = onMeasure;
  let isEditingRef: Dynamic = (0, reactCanvasPanZoom.useRef)(isEditingText);
  isEditingRef.current = isEditingText;
  (0, reactCanvasPanZoom.useLayoutEffect)((): Dynamic => {
    let current: Dynamic = noteRef.current;
    if (!current) return;
    let measureNote: Dynamic = (): Dynamic => {
        let size: Dynamic = {
          w: current.offsetWidth,
          h: current.offsetHeight,
        };
        setNoteSize(size);
        isEditingRef.current || onMeasureRef.current?.(size);
      },
      noteObserver: Dynamic = new ResizeObserver(measureNote);
    noteObserver.observe(current);
    measureNote();
    let measureContent: Dynamic = (): Dynamic => {
        updateScrollEdges();
        let [scrollElement, contentElement]: Dynamic = [measureRef.current, contentRef.current];
        scrollElement &&
          setMeasuredSize(
            (previousSize?: Dynamic): Dynamic =>
              previousSize.w === scrollElement.offsetWidth &&
              previousSize.h === scrollElement.offsetHeight
                ? previousSize
                : {
                    w: scrollElement.offsetWidth,
                    h: scrollElement.offsetHeight,
                  },
          );
        contentElement && setContentHeight(contentElement.offsetHeight);
      },
      contentObserver: Dynamic = new ResizeObserver(measureContent);
    for (let observedElement of [
      scrollRef.current,
      contentRef.current,
      measureRef.current,
    ] as Dynamic)
      observedElement && contentObserver.observe(observedElement);
    measureContent();
    return (): Dynamic => {
      noteObserver.disconnect();
      contentObserver.disconnect();
    };
  }, [updateScrollEdges, isTitle]);
  (0, reactCanvasPanZoom.useLayoutEffect)((): Dynamic => {
    let current: Dynamic = noteRef.current;
    !isEditingText &&
      current &&
      onMeasureRef.current?.({
        w: current.offsetWidth,
        h: current.offsetHeight,
      });
  }, [isEditingText]);
  (0, reactCanvasPanZoom.useEffect)((): Dynamic => {
    (!editing || !selected) && isEditingText && finishEditing();
  }, [editing, selected]);
  (0, reactCanvasPanZoom.useEffect)((): Dynamic => {
    if (!isEditingText) return;
    let current: Dynamic = editorRef.current;
    if (!current) return;
    isTitle
      ? ((current.textContent = NotesDomHandler_2(spec.text)),
        (lastSavedTextRef.current = current.textContent))
      : (applyNoteMarkdownDom(current, spec.text),
        (lastSavedTextRef.current = serializeNoteDom(current)));
    hasToastedRef.current = false;
    let removeInputRules: Dynamic = installNoteInputRules(
        current,
        (): Dynamic =>
          isTitle ? null : annotationTextStyle(spec),
      ),
      linkEditor: Dynamic = (linkEditorRef.current = createNoteLinkEditor(
        current,
      ));
    current.focus();
    moveNoteCaretToEnd(current) &&
      scrollRef.current &&
      (scrollRef.current.scrollTop = scrollRef.current.scrollHeight);
    return (): Dynamic => {
      removeInputRules();
      linkEditor.stop();
    };
  }, [isEditingText]);
  let lastSavedTextRef: Dynamic = (0, reactCanvasPanZoom.useRef)(""),
    hasToastedRef: Dynamic = (0, reactCanvasPanZoom.useRef)(false),
    finishEditing: Dynamic = (reason: Dynamic = "leave"): Dynamic => {
      let current: Dynamic = editorRef.current;
      if (!current) {
        setLiveText(null);
        return setIsEditingText(false);
      }
      let nextText: Dynamic = null,
        currentText: Dynamic = isTitle
          ? current.innerText.replace(/\n$/, "")
          : serializeNoteDom(current);
      if (currentText !== lastSavedTextRef.current) {
        let normalizedText: Dynamic = isTitle
          ? NotesDomJoin(
              truncateNoteText(currentText),
            )
          : normalizeNoteBlocks(currentText);
        if (normalizedText.length <= noteTextLimit)
          nextText = isTitle
            ? normalizedText
            : truncateNoteText(normalizedText);
        else if (reason === "escape" && !hasToastedRef.current) {
          hasToastedRef.current = true;
          showEditorToast(
            uiMessage("canvas.note.thisNoteIsOverIts") +
              String(noteTextLimit) +
              "-character limit. Shorten it to save; leaving discards the edit.",
          );
          return;
        } else
          showEditorToast(
            uiMessage("canvas.note.editDiscardedTheNoteWas") +
              String(noteTextLimit) +
              "-character limit.",
          );
      }
      setIsEditingText(false);
      setLiveText(null);
      nextText !== null &&
        nextText !== spec.text &&
        onChange(
          {
            text: nextText,
          },
          true,
        );
    },
    textStyle: Dynamic = annotationTextStyle(spec),
    renderedText: Dynamic = (0, reactCanvasPanZoom.useMemo)(
      (): Dynamic =>
        isTitle
          ? NotesDomHandler_2(spec.text)
          : renderNoteMarkdown(spec.text),
      [spec.text, isTitle],
    ),
    fontMetrics: Dynamic = PlatformFileContentMin(textStyle.size),
    // MineDesign：便签不再有高度上限，文字按宽度换行、便签随之长高，不截断也不滚动；maxH 是拖出来的最小高度
    maxHeight: Dynamic = isTitle ? PlatformFileContentKind(spec) : 1 / 0,
    isOverflowing: Dynamic = !isTitle && contentHeight > maxHeight,
    isScrollable: Dynamic = !isTitle && (isEditingText || (editing ? selected : isOverflowing));
  (0, reactCanvasPanZoom.useLayoutEffect)((): Dynamic => {
    !isScrollable && scrollRef.current && (scrollRef.current.scrollTop = 0);
    updateScrollEdges();
  }, [isScrollable, updateScrollEdges]);
  let textFit: Dynamic = isTitle
      ? annotationTextFit(
          measuredSize,
          textStyle.size,
          PlatformFileContentMaxW(spec),
          maxHeight,
        )
      : null,
    isScaled: Dynamic = textFit !== null && (textFit.k < 1 || textFit.wrap),
    scaledSize: Dynamic =
      !textFit || !isScaled
        ? null
        : textFit.wrap
          ? {
              w: PlatformFileContentMaxW(spec),
              h: Math.min(
                Math.ceil(contentHeight * textFit.k),
                isEditingText ? 1 / 0 : maxHeight,
              ),
            }
          : {
              w: Math.ceil(measuredSize.w * textFit.k),
              h: Math.ceil(measuredSize.h * textFit.k),
            },
    lineClamp: Dynamic =
      textFit?.wrap && !isEditingText && Number.isFinite(maxHeight)
        ? Math.max(
            1,
            Math.floor(
              (maxHeight / textFit.k - 2 * fontMetrics.py) /
                (textStyle.size * fontMetrics.lh),
            ),
          )
        : null,
    textBoxStyle: Dynamic =
      isTitle && !textFit?.wrap
        ? {
            ...NotesLinkEditingSize(spec),
            whiteSpace: "pre",
          }
        : NotesLinkEditingSize(spec),
    fadeSize: Dynamic = CanvasPanZoomRound(textStyle.size),
    maskStops: Dynamic = [
      scrollEdges.above ? "transparent" : "#000",
      "#000 " + String(scrollEdges.above ? fadeSize : 0) + "px",
      "#000 calc(100% - " + String(scrollEdges.below ? fadeSize : 0) + "px)",
      scrollEdges.below ? "transparent" : "#000",
    ],
    maskImage: Dynamic =
      scrollEdges.above || scrollEdges.below
        ? "linear-gradient(to bottom, " + maskStops.join(", ") + ")"
        : undefined,
    getContentHeight: Dynamic = (): Dynamic =>
      contentRef.current?.offsetHeight ?? noteSize.h,
    // 拖到贴合文字时记为自动高度，不写 maxH
    toMaxH: Dynamic = (height?: Dynamic): Dynamic =>
      height <= getContentHeight() + 1
        ? undefined
        : Math.min(noteMaxHeight, Math.round(height)),
    pressHandlers: Dynamic = {
      ...objectPress,
      onPointerDown: (pressEvent?: Dynamic): Dynamic =>
        editing && !isEditingText ? objectPress.onPointerDown?.(pressEvent) : undefined,
    };
  return (
    <div
      ref={setNoteElement}
      data-mega-chrome={"annotation"}
      data-mega-annotation={spec.id}
      data-testid={"mega-annotation-" + spec.id}
      data-note-kind={spec.kind ?? "note"}
      data-note-size={annotationTextStyle(spec).size}
      className={joinClassNames(
        "absolute rounded-[2px]",
        !editing && "pointer-events-none",
        editing && !isEditingText && "cursor-grab",
        isTitle
          ? joinClassNames(
              "shadow-[0_0_0_var(--ring-w,0px)_var(--cds-border-strong)]",
              isEditingText && "[--ring-w:var(--hair)]",
              editing && !selected && "hover:[--ring-w:var(--hair)]",
            )
          : undefined,
      )}
      style={{
        left: spec.x,
        top: spec.y,
        width: isTitle ? (scaledSize?.w ?? "max-content") : spec.w,
        height: scaledSize?.h,
        minHeight: isTitle ? undefined : spec.maxH,
        // 编辑器样式表是预编译的，便签的圆角和描边写成行内样式
        ...(isTitle
          ? {}
          : {
              background: "var(--note-fill)",
              borderRadius: 12,
              boxShadow:
                "inset 0 0 0 1px color-mix(in oklab, var(--note-fill), #000 14%)",
            }),
        ...(isTitle
          ? {}
          : {
              "--note-fill": NotesLinkEditingHandler(
                textStyle.fill,
              ),
            }),
        isolation: "isolate",
        ...(rotation
          ? {
              transform: "rotate(" + String(rotation) + "deg)",
            }
          : {}),
        ...(isTitle
          ? {
              "--hair": "calc(1px * var(--mega-inv-scale))",
            }
          : {}),
        ...(commenting && !editing
          ? {
              pointerEvents: "auto",
            }
          : {}),
      }}
      {...pressHandlers}
      onDoubleClick={(clickEvent?: Dynamic): Dynamic => {
        !editing || isEditingText || (clickEvent.stopPropagation(), setIsEditingText(true));
      }}
    >
      <div
        ref={isTitle ? undefined : scrollRef}
        data-note-scroll={isTitle ? undefined : ""}
        onScroll={isTitle ? undefined : updateScrollEdges}
        tabIndex={!editing && isOverflowing ? 0 : undefined}
        role={!editing && isOverflowing ? "region" : undefined}
        aria-label={!editing && isOverflowing ? (uiMessage("canvas.note.stickyNoteScrolls")) : (undefined)}
        onPointerDown={!isTitle && !editing ? handleTouchPointerDown : undefined}
        style={
          isTitle
            ? scaledSize
              ? {
                  width: scaledSize.w,
                  height: scaledSize.h,
                  ...(lineClamp !== null
                    ? {
                        overflow: "hidden",
                        touchAction: "none",
                      }
                    : {}),
                }
              : undefined
            : {
                overflowX: "hidden",
                overflowY: isScrollable ? "auto" : "hidden",
                touchAction:
                  isOverflowing && (isEditingText || !editing) ? "pan-y" : "none",
                overscrollBehavior: "contain",
                pointerEvents: !editing && isOverflowing ? "auto" : undefined,
                maskImage: maskImage,
                WebkitMaskImage: maskImage,
              }
        }
      >
        <div
          ref={contentRef}
          style={
            textFit && isScaled
              ? {
                  width: textFit.wrap
                    ? PlatformFileContentMaxW(spec) / textFit.k
                    : measuredSize.w,
                  transform: "scale(" + String(textFit.k) + ")",
                  transformOrigin: "0 0",
                  paddingBottom: lineClamp !== null ? fontMetrics.py : undefined,
                }
              : undefined
          }
        >
          {isEditingText ? (<div
              key={"edit"}
              ref={editorRef}
              contentEditable={true}
              {...NotesAutoformatOnPasteOnDropOnDragStartConfig}
              onFocus={clearFocusOutHandler}
              onBlur={(blurEvent?: Dynamic): Dynamic => {
                if (
                  !NotesLinkEditingClosest(blurEvent.relatedTarget)
                )
                  return finishEditing();
                clearFocusOutHandler();
                let handleLaterFocusOut: Dynamic = (focusEvent?: Dynamic): Dynamic => {
                  NotesLinkEditingClosest(
                    focusEvent.relatedTarget,
                  ) ||
                    (clearFocusOutHandler(),
                    focusEvent.relatedTarget !== editorRef.current && finishEditing());
                };
                focusOutHandlerRef.current = handleLaterFocusOut;
                (document as Dynamic).addEventListener(
                  "focusout",
                  handleLaterFocusOut,
                  true,
                );
              }}
              onInput={(event?: Dynamic): Dynamic => {
                hasToastedRef.current = false;
                if (isTitle)
                  return setLiveText(
                    event.currentTarget.innerText.replace(/\n$/, ""),
                  );
                handleNoteAutoformat(
                  event.currentTarget,
                  event.nativeEvent,
                  serializeNoteDom,
                  ["ul", "ol"],
                  true,
                );
                normalizeNoteLineBreaks(event.currentTarget);
              }}
              onKeyDown={(event?: Dynamic): Dynamic => {
                event.key === "Escape"
                  ? (event.preventDefault(),
                    event.stopPropagation(),
                    finishEditing("escape"))
                  : !isTitle && event.key === "Enter" && event.shiftKey
                    ? (event.preventDefault(),
                      (document as Dynamic).execCommand("insertParagraph"))
                    : handleNoteFormattingShortcut(
                        event,
                        isTitle ? null : textStyle,
                      );
              }}
              onPointerDown={(pointerEvent?: Dynamic): Dynamic =>
                pointerEvent.stopPropagation()
              }
              onMouseDown={(mouseEvent?: Dynamic): Dynamic =>
                linkEditorRef.current?.onMouseDown(mouseEvent)
              }
              data-note-text={""}
              className={
                "select-text whitespace-pre-wrap break-words outline-none"
              }
              style={textBoxStyle}
            />) : (<div
              key={"view"}
              data-note-text={""}
              className={"whitespace-pre-wrap break-words"}
              style={
                lineClamp !== null
                  ? {
                      ...textBoxStyle,
                      paddingBottom: 0,
                      minHeight: undefined,
                      display: "-webkit-box",
                      WebkitBoxOrient: "vertical",
                      WebkitLineClamp: lineClamp,
                      overflow: "hidden",
                      touchAction: "none",
                    }
                  : textBoxStyle
              }
            >
              {spec.text.length > 0 ? (renderedText) : (<span
                  className={"opacity-40 whitespace-nowrap"}
                  style={{
                    fontSize: "min(1em, 24px)",
                  }}
                >
                  {editing ? (uiMessage("canvas.note.doubleClickToType")) : ("")}
                </span>)}
            </div>)}
        </div>
      </div>
      {isTitle && (<div
          ref={measureRef}
          aria-hidden={"true"}
          className={
            "pointer-events-none invisible absolute left-0 top-0 w-max whitespace-pre"
          }
          style={NotesLinkEditingSize(spec)}
        >
          {(isEditingText ? liveText : null) ?? renderedText}
        </div>)}
      {editing && selected && !isEditingText && (<div
          data-mega-chrome={"annotation-resize"}
          data-testid={"mega-annotation-resize-" + spec.id}
          data-grouped={grouped ? "" : undefined}
          className={"pointer-events-none absolute inset-0"}
          style={
            rotation
              ? {
                  transform: "rotate(" + String(-rotation) + "deg)",
                }
              : undefined
          }
        >
          <ViewportScale>
            {(viewportScale?: Dynamic): Dynamic => (
              <SelectionRing
                frame={{
                  x: 0,
                  y: 0,
                  w: isTitle ? noteSize.w : spec.w,
                  h: draftMaxH ?? noteSize.h,
                }}
                scale={viewportScale}
                rotation={rotation ? (rotation * Math.PI) / 180 : undefined}
                state={grouped ? "member" : "selected"}
                grips={isTitle || grouped ? "none" : "corners"}
                onRotateStart={grouped ? undefined : startRotate}
                angleLabel={
                  rotationPreview !== null ? String(rotationPreview) + "\xB0" : undefined
                }
                onGripDoubleClick={(): Dynamic => {
                  // 双击拖柄：高度回到刚好放下文字
                  spec.maxH !== undefined &&
                    onChange({ maxH: undefined }, true);
                }}
                onResizeStart={(
                  grip?: Dynamic,
                  pointerEvent?: Dynamic,
                ): Dynamic => {
                  let isBottomOnly: Dynamic = !rotation && grip.y === "bottom",
                    startRect: Dynamic = {
                      x: spec.x,
                      y: spec.y,
                      w: spec.w,
                      h: isBottomOnly
                        ? Math.max(noteSize.h, spec.maxH ?? 0)
                        : noteSize.h,
                    },
                    movesOrigin: Dynamic =
                      !!rotation || grip.x === "left" || grip.y === "top",
                    snapState: Dynamic = rotation
                      ? null
                      : (snapLines?.() ?? null);
                  beginArtboardResize(pointerEvent, {
                    src: "ann-resize",
                    scale: viewportStore.get().scale,
                    sound: (): Dynamic => editingRef.current,
                    onGesture: onGesture,
                    armWindowGestureEnd: armWindowGestureEnd,
                    patchAt: (
                      deltaX?: Dynamic,
                      deltaY?: Dynamic,
                      moveEvent?: Dynamic,
                    ): Dynamic => {
                      let maxHeightLimit: Dynamic = noteMaxHeight,
                        isShallowDrag: Dynamic =
                          grip.x !== null &&
                          grip.y !== null &&
                          !rotation &&
                          Math.abs(deltaY) * viewportStore.get().scale < 6,
                        shouldSnapY: Dynamic =
                          !isShallowDrag && !(isBottomOnly && grip.x !== null),
                        snapped: Dynamic =
                          snapState && !(moveEvent.metaKey || moveEvent.ctrlKey)
                            ? snapResize(
                                startRect,
                                {
                                  x: grip.x,
                                  y: shouldSnapY ? grip.y : null,
                                },
                                deltaX,
                                isShallowDrag ? 0 : deltaY,
                                snapState.lines,
                                snapState.threshold,
                              )
                            : {
                                dx: deltaX,
                                dy: isShallowDrag ? 0 : deltaY,
                                guides: [],
                              };
                      isBottomOnly &&
                        startRect.h + snapped.dy > getContentHeight() &&
                        (snapped = {
                          dx: snapped.dx,
                          dy: isShallowDrag ? 0 : deltaY,
                          guides: snapped.guides.filter(
                            (guide?: Dynamic): Dynamic =>
                              guide.axis === "x",
                          ),
                        });
                      let resizedRect: Dynamic = resizeRotatedRect(
                          startRect,
                          rotation,
                          grip,
                          snapped.dx,
                          snapped.dy,
                          {
                            w: noteMinWidth,
                            h: getContentHeight(),
                          },
                          {
                            w: noteMaxWidth,
                            h: maxHeightLimit,
                          },
                        ),
                        nextWidth: Dynamic =
                          grip.x !== null
                            ? NotesLinkEditingMin(resizedRect.w)
                            : spec.w,
                        nextMaxH: Dynamic =
                          grip.y === null
                            ? undefined
                            : Math.round(resizedRect.h) === Math.round(startRect.h)
                              ? spec.maxH
                              : toMaxH(resizedRect.h);
                      grip.y !== null &&
                        setDraftMaxH(
                          nextMaxH !== undefined && nextMaxH !== spec.maxH
                            ? nextMaxH
                            : null,
                        );
                      let activeGuides: Dynamic = activeResizeGuides(
                        {
                          x: movesOrigin ? Math.round(resizedRect.x) : spec.x,
                          y: movesOrigin ? Math.round(resizedRect.y) : spec.y,
                          w: nextWidth,
                          h: Math.round(resizedRect.h),
                        },
                        grip,
                        snapped.guides,
                      );
                      onSnapGuides?.(activeGuides.length > 0 ? activeGuides : null);
                      return {
                        ...(movesOrigin
                          ? {
                              x: Math.round(resizedRect.x),
                              y: Math.round(resizedRect.y),
                            }
                          : {}),
                        ...(grip.x !== null
                          ? {
                              w: nextWidth,
                            }
                          : {}),
                        ...(grip.y !== null
                          ? {
                              maxH: nextMaxH,
                            }
                          : {}),
                      };
                    },
                    onChange: onChange,
                    restore: {
                      ...(movesOrigin
                        ? {
                            x: spec.x,
                            y: spec.y,
                          }
                        : {}),
                      ...(grip.x !== null
                        ? {
                            w: spec.w,
                          }
                        : {}),
                      ...(grip.y !== null
                        ? {
                            maxH: spec.maxH,
                          }
                        : {}),
                    },
                    onEnd: (): Dynamic => {
                      setDraftMaxH(null);
                      onSnapGuides?.(null);
                    },
                  });
                }}
              />
            )}
          </ViewportScale>
        </div>)}
    </div>
  );
}
export {
  CanvasNote,
  jsxCanvasNote,
};
export function installCanvasNote(): () => void {
  return () => {
    jsxCanvasNote = toModuleNamespace(
      load_react_jsx_runtime(),
      1,
    );
  };
}
