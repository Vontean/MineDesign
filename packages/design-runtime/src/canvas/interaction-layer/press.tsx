import { InspectorColorPickResolvedValue_2 as isMetaPrimaryKey } from "../../editor/inspector/color-pick";
import { boardSelectionItems } from "../../editor/selection/canvas-selection";
import { canvasDragThresholdPixels } from "../interaction-geometry";
import { emptyBoardSelection } from "../../editor/selection/canvas-selection";
import { hasBoardSelection } from "../../editor/selection/canvas-selection";
import { isTouchSelectionStart } from "../image-decode-scheduler";
import { selectionPointerDownDecision } from "../hit-testing";
import { type Dynamic } from "../../runtime-types";
import { watchPointerRelease } from "../image-decode-scheduler";

/** 按下画板封面准备选元素时运行：监听本次指针直到松开、取消、失焦或元素被移除，返回指针是否移动超过拖动阈值（按 Esc 也视为移动）。 */
export function waitPointerReleaseTravel(deps: { readonly value9: Dynamic }, pointerId?: Dynamic,
      pointerType?: Dynamic,
      targetElement?: Dynamic,
      startX?: Dynamic,
      startY?: Dynamic,
      isAlreadyReleased?: Dynamic): Dynamic {
  return isAlreadyReleased
        ? Promise.resolve({
            travelled: false,
          })
        : new Promise((resolve?: Dynamic): Dynamic => {
            let hasTravelled: Dynamic = false,
              handlePointerMove: Dynamic = (moveEvent?: Dynamic): Dynamic => {
                moveEvent.pointerId === pointerId &&
                  Math.hypot(
                    moveEvent.clientX - startX,
                    moveEvent.clientY - startY,
                  ) >= canvasDragThresholdPixels &&
                  (hasTravelled = true);
              },
              isFinished: Dynamic = false,
              finish: Dynamic = (forceTravelled?: Dynamic): Dynamic => {
                isFinished ||
                  ((isFinished = true),
                  (window as Dynamic).removeEventListener(
                    "pointermove",
                    handlePointerMove,
                    true,
                  ),
                  (window as Dynamic).removeEventListener(
                    "pointerup",
                    handlePointerUp,
                    true,
                  ),
                  (window as Dynamic).removeEventListener(
                    "pointercancel",
                    handlePointerCancel,
                    true,
                  ),
                  (window as Dynamic).removeEventListener(
                    "keydown",
                    handleKeyDown,
                    true,
                  ),
                  (window as Dynamic).removeEventListener("blur", handleBlur),
                  (window as Dynamic).removeEventListener(
                    "contextmenu",
                    handleContextMenu,
                    true,
                  ),
                  removalObserver?.disconnect(),
                  (window as Dynamic).setTimeout(
                    (): Dynamic =>
                      resolve({
                        travelled: hasTravelled || forceTravelled,
                      }),
                    0,
                  ));
              },
              handlePointerUp: Dynamic = (upEvent?: Dynamic): Dynamic => {
                upEvent.pointerId === pointerId && finish(false);
              },
              handlePointerCancel: Dynamic = (cancelEvent?: Dynamic): Dynamic => {
                cancelEvent.pointerId === pointerId && finish(true);
              },
              handleKeyDown: Dynamic = (keyEvent?: Dynamic): Dynamic => {
                keyEvent.key === "Escape" && (hasTravelled = true);
              },
              handleBlur: Dynamic = (): Dynamic => {
                (document as Dynamic).hasFocus() || finish(true);
              },
              handleContextMenu: Dynamic = (): Dynamic => finish(true),
              removalObserver: Dynamic =
                pointerType === "mouse"
                  ? null
                  : new MutationObserver((): Dynamic => {
                      !targetElement.isConnected && finish(false);
                    });
            removalObserver?.observe(deps.value9.current ?? (document as Dynamic).body, {
              childList: true,
              subtree: true,
            });
            (window as Dynamic).addEventListener(
              "pointermove",
              handlePointerMove,
              true,
            );
            (window as Dynamic).addEventListener(
              "pointerup",
              handlePointerUp,
              true,
            );
            (window as Dynamic).addEventListener(
              "pointercancel",
              handlePointerCancel,
              true,
            );
            (window as Dynamic).addEventListener("keydown", handleKeyDown, true);
            (window as Dynamic).addEventListener("blur", handleBlur);
            (window as Dynamic).addEventListener(
              "contextmenu",
              handleContextMenu,
              true,
            );
          });
}

/** 在画板封面上按下指针时运行：通知宿主后在画板里拾取指针下的元素，按按下意图决定直接选中元素、切换画板选择、转入框选或交给移动手势；画板未就绪时只聚焦或选中画板。 */
export function pressArtboardCover(deps: { readonly callback17: Dynamic; readonly callback19: Dynamic; readonly callback46: Dynamic; readonly callback53: Dynamic; readonly onArmArtboard: Dynamic; readonly onCoverPick: Dynamic; readonly onCoverPress: Dynamic; readonly onElementPress: Dynamic; readonly onFocus: Dynamic; readonly onPressIntent: Dynamic; readonly onSelectObjects: Dynamic; readonly onSetMoveCommit: Dynamic; readonly pressIntentIs: Dynamic; readonly value2: Dynamic; readonly value222: Dynamic; readonly value26: Dynamic; readonly value29: Dynamic; readonly value57: Dynamic; readonly value60: Dynamic; readonly value92: Dynamic }, pointerEvent?: Dynamic,
      artboard?: Dynamic,
      source?: Dynamic): Dynamic {
      let x: Dynamic = source.at.x,
        y: Dynamic = source.at.y;
      deps.onCoverPress?.(artboard.file, {
        x: x,
        y: y,
      });
      let artboardEntry: Dynamic = deps.value2.current.get(artboard.file),
        selectCover: Dynamic = (): Dynamic => {
          if (source.face) {
            deps.value60(artboard.file, true);
            return;
          }
          deps.value60(artboard.file, source.toggle);
          source.toggle || deps.onFocus(artboard.file);
        },
        selectCoverUnlessSet: Dynamic = (): Dynamic => {
          source.kind !== "set" && selectCover();
        };
      if (!artboardEntry || !artboardEntry.isReady() || !deps.onElementPress) {
        selectCoverUnlessSet();
        return;
      }
      let currentTarget: Dynamic = pointerEvent.currentTarget,
        {
          pointerId: pointerId,
          pointerType: pointerType,
          clientX: startClientX,
          clientY: startClientY,
        }: Dynamic = pointerEvent,
        pressIntent: Dynamic = deps.onPressIntent?.() ?? 0,
        isPressIntentCurrent: Dynamic = (): Dynamic =>
          deps.pressIntentIs ? deps.pressIntentIs(pressIntent) : true,
        hasReleased: Dynamic = source.still === true,
        hasTravelled: Dynamic = false,
        lastPointer: Dynamic = {
          x: startClientX,
          y: startClientY,
        },
        isCancelled: Dynamic = false,
        pendingRelease: Dynamic = null,
        stopTracking: Dynamic = (): Dynamic => {
          (window as Dynamic).removeEventListener("pointermove", handlePointerMove);
          (window as Dynamic).removeEventListener("pointerup", handlePointerUp);
          (window as Dynamic).removeEventListener(
            "pointercancel",
            handlePointerCancel,
          );
        },
        handlePointerMove: Dynamic = (moveEvent?: Dynamic): Dynamic => {
          moveEvent.pointerId === pointerId &&
            ((lastPointer = {
              x: moveEvent.clientX,
              y: moveEvent.clientY,
            }),
            Math.hypot(
              moveEvent.clientX - startClientX,
              moveEvent.clientY - startClientY,
            ) >= canvasDragThresholdPixels && (hasTravelled = true));
        },
        handlePointerUp: Dynamic = (upEvent?: Dynamic): Dynamic => {
          if (upEvent.pointerId !== pointerId) return;
          hasReleased = true;
          stopTracking();
          let releaseAction: Dynamic = pendingRelease;
          pendingRelease = null;
          releaseAction && !hasTravelled && isPressIntentCurrent() && releaseAction();
        },
        handlePointerCancel: Dynamic = (cancelEvent?: Dynamic): Dynamic => {
          cancelEvent.pointerId === pointerId &&
            ((isCancelled = true), (pendingRelease = null), stopTracking());
        };
      if (!hasReleased) {
        try {
          currentTarget.setPointerCapture(pointerId);
        } catch {}
        (window as Dynamic).addEventListener("pointermove", handlePointerMove);
        (window as Dynamic).addEventListener("pointerup", handlePointerUp);
        (window as Dynamic).addEventListener("pointercancel", handlePointerCancel);
      }
      let runOnRelease: Dynamic = (action?: Dynamic): Dynamic => {
          hasReleased ? hasTravelled || action() : (pendingRelease = action);
        },
        selectedTids: Dynamic = deps.value26.current?.[artboard.file] ?? [],
        pickMode: Dynamic = source.deepKey ? "deep" : "plain",
        pickPromise: Dynamic = artboardEntry.pickAt(x, y, pickMode, selectedTids).then(
          (pickedElement?: Dynamic): Dynamic => {
            if (isCancelled || !isPressIntentCurrent()) {
              stopTracking();
              return;
            }
            let handOffToMarquee: Dynamic = (
                onStillRelease?: Dynamic,
                tree?: Dynamic,
              ): Dynamic => {
                if (hasReleased) {
                  hasTravelled || onStillRelease();
                  return;
                }
                stopTracking();
                deps.callback19(pointerEvent, {
                  origin: {
                    kind: "artboard",
                    file: artboard.file,
                  },
                  mode: pickMode,
                  toggle: source.toggle,
                  capture: currentTarget,
                  onStillRelease: onStillRelease,
                  tree: tree,
                  from: hasTravelled ? lastPointer : undefined,
                });
              },
              selectArtboardFallback: Dynamic = (): Dynamic => {
                source.toggle
                  ? deps.value60(artboard.file, true)
                  : source.face || selectCover();
              };
            if (pickedElement == null) {
              handOffToMarquee(selectArtboardFallback);
              return;
            }
            if ("empty" in pickedElement) {
              stopTracking();
              let pressDecision: Dynamic = selectionPointerDownDecision(
                deps.value57.current,
                {
                  file: artboard.file,
                },
                source.toggle,
              );
              pressDecision.selectNow && deps.value60(artboard.file, source.toggle);
              let eventWithTarget: Dynamic = Object.assign(Object.create(pointerEvent), {
                currentTarget: currentTarget,
              });
              hasReleased
                ? !hasTravelled &&
                  pressDecision.click &&
                  deps.onSelectObjects(
                    boardSelectionItems({
                      file: artboard.file,
                    }),
                    pressDecision.click === "toggle" ? "toggle" : "replace",
                  )
                : deps.callback46(
                    eventWithTarget,
                    {
                      file: artboard.file,
                    },
                    artboard,
                    pressDecision.carry,
                    pressDecision.click,
                    !source.toggle,
                  );
              hasReleased && !source.toggle && deps.onFocus(artboard.file);
              return;
            }
            if (source.toggle && deps.value57.current.files.has(artboard.file)) {
              runOnRelease((): Dynamic => deps.value60(artboard.file, true));
              return;
            }
            let isAlreadySelected: Dynamic = selectedTids.includes(pickedElement.tid);
            if (pickedElement.root && !isAlreadySelected) {
              handOffToMarquee((): Dynamic => {
                source.toggle ||
                  (pickedElement.page
                    ? selectArtboardFallback()
                    : deps.onElementPress(
                        artboard.file,
                        pickedElement.tid,
                        pickedElement.rect,
                        "replace",
                        true,
                      ));
              });
              return;
            }
            if (source.deepKey && isMetaPrimaryKey) {
              let treeSweeper: Dynamic =
                deps.value92.current?.(source.toggle) ?? null;
              if (source.toggle && isAlreadySelected) {
                handOffToMarquee(
                  (): Dynamic =>
                    deps.onElementPress(
                      artboard.file,
                      pickedElement.tid,
                      pickedElement.rect,
                      "remove",
                      false,
                    ),
                  treeSweeper,
                );
                return;
              }
              deps.onElementPress(
                artboard.file,
                pickedElement.tid,
                pickedElement.rect,
                source.toggle ? "toggle" : "replace",
                false,
              );
              handOffToMarquee((): Dynamic => {
                source.toggle || deps.onArmArtboard?.(artboard.file);
              }, treeSweeper);
              return;
            }
            if (source.toggle) {
              isAlreadySelected
                ? runOnRelease(
                    (): Dynamic =>
                      deps.onElementPress(
                        artboard.file,
                        pickedElement.tid,
                        pickedElement.rect,
                        "remove",
                        false,
                      ),
                  )
                : (stopTracking(),
                  deps.onElementPress(
                    artboard.file,
                    pickedElement.tid,
                    pickedElement.rect,
                    "toggle",
                    false,
                  ));
              return;
            }
            if (isAlreadySelected) {
              let targetElement: Dynamic =
                  selectedTids.length === 1 && pickedElement.text ? pickedElement.text : pickedElement,
                narrowSelection: Dynamic = (): Dynamic => {
                  deps.onElementPress(
                    artboard.file,
                    targetElement.tid,
                    targetElement.rect,
                    "narrow",
                    true,
                  );
                };
              if (deps.onSetMoveCommit && !isCancelled && !source.deepKey) {
                stopTracking();
                if (hasReleased) {
                  hasTravelled || narrowSelection();
                  return;
                }
                deps.callback53({
                  pointerId: pointerId,
                  captureEl: currentTarget,
                  clientX: startClientX,
                  clientY: startClientY,
                  leader: {
                    file: artboard.file,
                    tid: pickedElement.tid,
                  },
                  stillAction: narrowSelection,
                  armWait: null,
                  heldCover: artboard.file,
                  from: hasTravelled
                    ? {
                        clientX: lastPointer.x,
                        clientY: lastPointer.y,
                      }
                    : null,
                });
                return;
              }
              runOnRelease(narrowSelection);
              return;
            }
            let text: Dynamic = pickedElement.text,
              textPressAction: Dynamic = text
                ? (): Dynamic => {
                    deps.onElementPress(
                      artboard.file,
                      text.tid,
                      text.rect,
                      "replace",
                      true,
                    );
                  }
                : null;
            stopTracking();
            if (deps.onSetMoveCommit && !hasReleased && !source.deepKey) {
              deps.value222(artboard.file);
              let armWait: Dynamic = deps.onElementPress(
                artboard.file,
                pickedElement.tid,
                pickedElement.rect,
                "replace",
                true,
              );
              deps.callback53({
                pointerId: pointerId,
                captureEl: currentTarget,
                clientX: startClientX,
                clientY: startClientY,
                leader: {
                  file: artboard.file,
                  tid: pickedElement.tid,
                },
                files: new Map([[artboard.file, [pickedElement.tid]]]),
                canvas: emptyBoardSelection,
                stillAction: textPressAction,
                armWait:
                  armWait instanceof Promise
                    ? armWait
                    : Promise.resolve(true),
                heldCover: artboard.file,
                from: hasTravelled
                  ? {
                      clientX: lastPointer.x,
                      clientY: lastPointer.y,
                    }
                  : null,
              }) || deps.value222(null);
              return;
            }
            hasReleased && !hasTravelled && textPressAction
              ? textPressAction()
              : deps.onElementPress(
                  artboard.file,
                  pickedElement.tid,
                  pickedElement.rect,
                  "replace",
                  true,
                );
          },
          (): Dynamic => {
            !isCancelled && isPressIntentCurrent() && selectCoverUnlessSet();
          },
        );
      deps.onCoverPick?.(artboard.file, pickPromise, {
        gen: pressIntent,
        kind: source.kind ?? "focus",
        ended: deps.callback17(
          pointerId,
          pointerType,
          currentTarget,
          startClientX,
          startClientY,
          hasReleased,
        ),
      });
      deps.value29.current = pickPromise;
    }

/** 渲染画布上的形状或便签时运行：为该对象生成按下、移动、松开、取消的指针处理函数，按按键与触控决定选中方式，并接入画板拖动手势。 */
export function buildObjectPressHandlers(deps: { readonly callback46: Dynamic; readonly callback49: Dynamic; readonly callback50: Dynamic; readonly callback53: Dynamic; readonly callback54: Dynamic; readonly onSelectObjects: Dynamic; readonly onSetMoveCommit: Dynamic; readonly value57: Dynamic }, note?: Dynamic): Dynamic {
  return {
      onPointerDown: (event?: Dynamic): Dynamic => {
        if (event.button !== 0) return;
        let shiftKey: Dynamic = event.shiftKey;
        if (
          isTouchSelectionStart(
            event.pointerType,
            deps.value57.current.notes.has(note.id),
          )
        ) {
          watchPointerRelease(
            event.nativeEvent,
            (): Dynamic =>
              deps.onSelectObjects(
                boardSelectionItems({
                  note: note.id,
                }),
                shiftKey ? "toggle" : "replace",
              ),
          );
          return;
        }
        event.stopPropagation();
        if (
          deps.onSetMoveCommit &&
          event.pointerType !== "touch" &&
          !shiftKey &&
          !event.altKey &&
          hasBoardSelection(deps.value57.current, {
            note: note.id,
          }) &&
          deps.callback54()
        ) {
          deps.callback53({
            pointerId: event.pointerId,
            captureEl: event.currentTarget,
            clientX: event.clientX,
            clientY: event.clientY,
            leader: {
              canvas: {
                note: note.id,
              },
            },
            stillAction: (): Dynamic =>
              deps.onSelectObjects(
                boardSelectionItems({
                  note: note.id,
                }),
                "replace",
              ),
            armWait: null,
            heldCover: null,
          });
          return;
        }
        let pressDecision: Dynamic = selectionPointerDownDecision(
          deps.value57.current,
          {
            note: note.id,
          },
          shiftKey,
        );
        pressDecision.selectNow &&
          deps.onSelectObjects(
            boardSelectionItems({
              note: note.id,
            }),
            shiftKey ? "toggle" : "replace",
          );
        deps.callback46(
          event,
          {
            note: note.id,
          },
          note,
          pressDecision.carry,
          pressDecision.click,
        );
      },
      onPointerMove: (moveEvent?: Dynamic): Dynamic => deps.callback50(moveEvent, false),
      onPointerUp: (upEvent?: Dynamic): Dynamic => deps.callback50(upEvent, true),
      onPointerCancel: deps.callback49,
    };
}
