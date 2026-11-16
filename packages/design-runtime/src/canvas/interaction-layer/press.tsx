import { InspectorColorPickResolvedValue_2 } from "../../editor/inspector/color-pick";
import { boardSelectionItems } from "../../editor/selection/canvas-selection";
import { canvasDragThresholdPixels } from "../interaction-geometry";
import { emptyBoardSelection } from "../../editor/selection/canvas-selection";
import { hasBoardSelection } from "../../editor/selection/canvas-selection";
import { isTouchSelectionStart } from "../image-decode-scheduler";
import { selectionPointerDownDecision } from "../hit-testing";
import { type Dynamic } from "../../runtime-types";
import { watchPointerRelease } from "../image-decode-scheduler";

/** 按下画板封面准备选元素时运行：监听本次指针直到松开、取消、失焦或元素被移除，返回指针是否移动超过拖动阈值（按 Esc 也视为移动）。 */
export function waitPointerReleaseTravel(deps: { readonly value9: Dynamic }, input?: Dynamic,
      options2?: Dynamic,
      context?: Dynamic,
      value250?: Dynamic,
      extra?: Dynamic,
      detail?: Dynamic): Dynamic {
  return detail
        ? Promise.resolve({
            travelled: false,
          })
        : new Promise((input2?: Dynamic): Dynamic => {
            let flag2: Dynamic = false,
              callback61: Dynamic = (input3?: Dynamic): Dynamic => {
                input3.pointerId === input &&
                  Math.hypot(
                    input3.clientX - value250,
                    input3.clientY - extra,
                  ) >= canvasDragThresholdPixels &&
                  (flag2 = true);
              },
              flag3: Dynamic = false,
              callback62: Dynamic = (input3?: Dynamic): Dynamic => {
                flag3 ||
                  ((flag3 = true),
                  (window as Dynamic).removeEventListener(
                    "pointermove",
                    callback61,
                    true,
                  ),
                  (window as Dynamic).removeEventListener(
                    "pointerup",
                    callback63,
                    true,
                  ),
                  (window as Dynamic).removeEventListener(
                    "pointercancel",
                    callback64,
                    true,
                  ),
                  (window as Dynamic).removeEventListener(
                    "keydown",
                    callback65,
                    true,
                  ),
                  (window as Dynamic).removeEventListener("blur", callback66),
                  (window as Dynamic).removeEventListener(
                    "contextmenu",
                    callback67,
                    true,
                  ),
                  value251?.disconnect(),
                  (window as Dynamic).setTimeout(
                    (): Dynamic =>
                      input2({
                        travelled: flag2 || input3,
                      }),
                    0,
                  ));
              },
              callback63: Dynamic = (input3?: Dynamic): Dynamic => {
                input3.pointerId === input && callback62(false);
              },
              callback64: Dynamic = (input3?: Dynamic): Dynamic => {
                input3.pointerId === input && callback62(true);
              },
              callback65: Dynamic = (input3?: Dynamic): Dynamic => {
                input3.key === "Escape" && (flag2 = true);
              },
              callback66: Dynamic = (): Dynamic => {
                (document as Dynamic).hasFocus() || callback62(true);
              },
              callback67: Dynamic = (): Dynamic => callback62(true),
              value251: Dynamic =
                options2 === "mouse"
                  ? null
                  : new MutationObserver((): Dynamic => {
                      !context.isConnected && callback62(false);
                    });
            value251?.observe(deps.value9.current ?? (document as Dynamic).body, {
              childList: true,
              subtree: true,
            });
            (window as Dynamic).addEventListener(
              "pointermove",
              callback61,
              true,
            );
            (window as Dynamic).addEventListener(
              "pointerup",
              callback63,
              true,
            );
            (window as Dynamic).addEventListener(
              "pointercancel",
              callback64,
              true,
            );
            (window as Dynamic).addEventListener("keydown", callback65, true);
            (window as Dynamic).addEventListener("blur", callback66);
            (window as Dynamic).addEventListener(
              "contextmenu",
              callback67,
              true,
            );
          });
}

/** 在画板封面上按下指针时运行：通知宿主后在画板里拾取指针下的元素，按按下意图决定直接选中元素、切换画板选择、转入框选或交给移动手势；画板未就绪时只聚焦或选中画板。 */
export function pressArtboardCover(deps: { readonly callback17: Dynamic; readonly callback19: Dynamic; readonly callback46: Dynamic; readonly callback53: Dynamic; readonly onArmArtboard: Dynamic; readonly onCoverPick: Dynamic; readonly onCoverPress: Dynamic; readonly onElementPress: Dynamic; readonly onFocus: Dynamic; readonly onPressIntent: Dynamic; readonly onSelectObjects: Dynamic; readonly onSetMoveCommit: Dynamic; readonly pressIntentIs: Dynamic; readonly value2: Dynamic; readonly value222: Dynamic; readonly value26: Dynamic; readonly value29: Dynamic; readonly value57: Dynamic; readonly value60: Dynamic; readonly value92: Dynamic }, input?: Dynamic,
      options2?: Dynamic,
      source?: Dynamic): Dynamic {
      let x: Dynamic = source.at.x,
        y: Dynamic = source.at.y;
      deps.onCoverPress?.(options2.file, {
        x: x,
        y: y,
      });
      let entry2: Dynamic = deps.value2.current.get(options2.file),
        callback61: Dynamic = (): Dynamic => {
          if (source.face) {
            deps.value60(options2.file, true);
            return;
          }
          deps.value60(options2.file, source.toggle);
          source.toggle || deps.onFocus(options2.file);
        },
        callback62: Dynamic = (): Dynamic => {
          source.kind !== "set" && callback61();
        };
      if (!entry2 || !entry2.isReady() || !deps.onElementPress) {
        callback62();
        return;
      }
      let currentTarget: Dynamic = input.currentTarget,
        {
          pointerId: value250,
          pointerType: value251,
          clientX: value252,
          clientY: value253,
        }: Dynamic = input,
        value254: Dynamic = deps.onPressIntent?.() ?? 0,
        callback63: Dynamic = (): Dynamic =>
          deps.pressIntentIs ? deps.pressIntentIs(value254) : true,
        value255: Dynamic = source.still === true,
        flag2: Dynamic = false,
        state: Dynamic = {
          x: value252,
          y: value253,
        },
        flag3: Dynamic = false,
        value256: Dynamic = null,
        callback64: Dynamic = (): Dynamic => {
          (window as Dynamic).removeEventListener("pointermove", callback65);
          (window as Dynamic).removeEventListener("pointerup", callback66);
          (window as Dynamic).removeEventListener(
            "pointercancel",
            callback67,
          );
        },
        callback65: Dynamic = (input2?: Dynamic): Dynamic => {
          input2.pointerId === value250 &&
            ((state = {
              x: input2.clientX,
              y: input2.clientY,
            }),
            Math.hypot(
              input2.clientX - value252,
              input2.clientY - value253,
            ) >= canvasDragThresholdPixels && (flag2 = true));
        },
        callback66: Dynamic = (input2?: Dynamic): Dynamic => {
          if (input2.pointerId !== value250) return;
          value255 = true;
          callback64();
          let value260: Dynamic = value256;
          value256 = null;
          value260 && !flag2 && callback63() && value260();
        },
        callback67: Dynamic = (input2?: Dynamic): Dynamic => {
          input2.pointerId === value250 &&
            ((flag3 = true), (value256 = null), callback64());
        };
      if (!value255) {
        try {
          currentTarget.setPointerCapture(value250);
        } catch {}
        (window as Dynamic).addEventListener("pointermove", callback65);
        (window as Dynamic).addEventListener("pointerup", callback66);
        (window as Dynamic).addEventListener("pointercancel", callback67);
      }
      let callback68: Dynamic = (input2?: Dynamic): Dynamic => {
          value255 ? flag2 || input2() : (value256 = input2);
        },
        value257: Dynamic = deps.value26.current?.[options2.file] ?? [],
        value258: Dynamic = source.deepKey ? "deep" : "plain",
        value259: Dynamic = entry2.pickAt(x, y, value258, value257).then(
          (input2?: Dynamic): Dynamic => {
            if (flag3 || !callback63()) {
              callback64();
              return;
            }
            let callback69: Dynamic = (
                input3?: Dynamic,
                options3?: Dynamic,
              ): Dynamic => {
                if (value255) {
                  flag2 || input3();
                  return;
                }
                callback64();
                deps.callback19(input, {
                  origin: {
                    kind: "artboard",
                    file: options2.file,
                  },
                  mode: value258,
                  toggle: source.toggle,
                  capture: currentTarget,
                  onStillRelease: input3,
                  tree: options3,
                  from: flag2 ? state : undefined,
                });
              },
              callback70: Dynamic = (): Dynamic => {
                source.toggle
                  ? deps.value60(options2.file, true)
                  : source.face || callback61();
              };
            if (input2 == null) {
              callback69(callback70);
              return;
            }
            if ("empty" in input2) {
              callback64();
              let value262: Dynamic = (0,
              selectionPointerDownDecision)(
                deps.value57.current,
                {
                  file: options2.file,
                },
                source.toggle,
              );
              value262.selectNow && deps.value60(options2.file, source.toggle);
              let value263: Dynamic = Object.assign(Object.create(input), {
                currentTarget: currentTarget,
              });
              value255
                ? !flag2 &&
                  value262.click &&
                  deps.onSelectObjects(
                    (0, boardSelectionItems)({
                      file: options2.file,
                    }),
                    value262.click === "toggle" ? "toggle" : "replace",
                  )
                : deps.callback46(
                    value263,
                    {
                      file: options2.file,
                    },
                    options2,
                    value262.carry,
                    value262.click,
                    !source.toggle,
                  );
              value255 && !source.toggle && deps.onFocus(options2.file);
              return;
            }
            if (source.toggle && deps.value57.current.files.has(options2.file)) {
              callback68((): Dynamic => deps.value60(options2.file, true));
              return;
            }
            let value260: Dynamic = value257.includes(input2.tid);
            if (input2.root && !value260) {
              callback69((): Dynamic => {
                source.toggle ||
                  (input2.page
                    ? callback70()
                    : deps.onElementPress(
                        options2.file,
                        input2.tid,
                        input2.rect,
                        "replace",
                        true,
                      ));
              });
              return;
            }
            if (source.deepKey && InspectorColorPickResolvedValue_2) {
              let value262: Dynamic =
                deps.value92.current?.(source.toggle) ?? null;
              if (source.toggle && value260) {
                callback69(
                  (): Dynamic =>
                    deps.onElementPress(
                      options2.file,
                      input2.tid,
                      input2.rect,
                      "remove",
                      false,
                    ),
                  value262,
                );
                return;
              }
              deps.onElementPress(
                options2.file,
                input2.tid,
                input2.rect,
                source.toggle ? "toggle" : "replace",
                false,
              );
              callback69((): Dynamic => {
                source.toggle || deps.onArmArtboard?.(options2.file);
              }, value262);
              return;
            }
            if (source.toggle) {
              value260
                ? callback68(
                    (): Dynamic =>
                      deps.onElementPress(
                        options2.file,
                        input2.tid,
                        input2.rect,
                        "remove",
                        false,
                      ),
                  )
                : (callback64(),
                  deps.onElementPress(
                    options2.file,
                    input2.tid,
                    input2.rect,
                    "toggle",
                    false,
                  ));
              return;
            }
            if (value260) {
              let value262: Dynamic =
                  value257.length === 1 && input2.text ? input2.text : input2,
                callback71: Dynamic = (): Dynamic => {
                  deps.onElementPress(
                    options2.file,
                    value262.tid,
                    value262.rect,
                    "narrow",
                    true,
                  );
                };
              if (deps.onSetMoveCommit && !flag3 && !source.deepKey) {
                callback64();
                if (value255) {
                  flag2 || callback71();
                  return;
                }
                deps.callback53({
                  pointerId: value250,
                  captureEl: currentTarget,
                  clientX: value252,
                  clientY: value253,
                  leader: {
                    file: options2.file,
                    tid: input2.tid,
                  },
                  stillAction: callback71,
                  armWait: null,
                  heldCover: options2.file,
                  from: flag2
                    ? {
                        clientX: state.x,
                        clientY: state.y,
                      }
                    : null,
                });
                return;
              }
              callback68(callback71);
              return;
            }
            let text: Dynamic = input2.text,
              value261: Dynamic = text
                ? (): Dynamic => {
                    deps.onElementPress(
                      options2.file,
                      text.tid,
                      text.rect,
                      "replace",
                      true,
                    );
                  }
                : null;
            callback64();
            if (deps.onSetMoveCommit && !value255 && !source.deepKey) {
              deps.value222(options2.file);
              let value262: Dynamic = deps.onElementPress(
                options2.file,
                input2.tid,
                input2.rect,
                "replace",
                true,
              );
              deps.callback53({
                pointerId: value250,
                captureEl: currentTarget,
                clientX: value252,
                clientY: value253,
                leader: {
                  file: options2.file,
                  tid: input2.tid,
                },
                files: new Map([[options2.file, [input2.tid]]]),
                canvas: emptyBoardSelection,
                stillAction: value261,
                armWait:
                  value262 instanceof Promise
                    ? value262
                    : Promise.resolve(true),
                heldCover: options2.file,
                from: flag2
                  ? {
                      clientX: state.x,
                      clientY: state.y,
                    }
                  : null,
              }) || deps.value222(null);
              return;
            }
            value255 && !flag2 && value261
              ? value261()
              : deps.onElementPress(
                  options2.file,
                  input2.tid,
                  input2.rect,
                  "replace",
                  true,
                );
          },
          (): Dynamic => {
            !flag3 && callback63() && callback62();
          },
        );
      deps.onCoverPick?.(options2.file, value259, {
        gen: value254,
        kind: source.kind ?? "focus",
        ended: deps.callback17(
          value250,
          value251,
          currentTarget,
          value252,
          value253,
          value255,
        ),
      });
      deps.value29.current = value259;
    }

/** 渲染画布上的形状或便签时运行：为该对象生成按下、移动、松开、取消的指针处理函数，按按键与触控决定选中方式，并接入画板拖动手势。 */
export function buildObjectPressHandlers(deps: { readonly callback46: Dynamic; readonly callback49: Dynamic; readonly callback50: Dynamic; readonly callback53: Dynamic; readonly callback54: Dynamic; readonly onSelectObjects: Dynamic; readonly onSetMoveCommit: Dynamic; readonly value57: Dynamic }, input?: Dynamic): Dynamic {
  return {
      onPointerDown: (event?: Dynamic): Dynamic => {
        if (event.button !== 0) return;
        let shiftKey: Dynamic = event.shiftKey;
        if (
          (0, isTouchSelectionStart)(
            event.pointerType,
            deps.value57.current.notes.has(input.id),
          )
        ) {
          (0, watchPointerRelease)(
            event.nativeEvent,
            (): Dynamic =>
              deps.onSelectObjects(
                (0, boardSelectionItems)({
                  note: input.id,
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
          (0, hasBoardSelection)(deps.value57.current, {
            note: input.id,
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
                note: input.id,
              },
            },
            stillAction: (): Dynamic =>
              deps.onSelectObjects(
                (0, boardSelectionItems)({
                  note: input.id,
                }),
                "replace",
              ),
            armWait: null,
            heldCover: null,
          });
          return;
        }
        let value250: Dynamic = (0, selectionPointerDownDecision)(
          deps.value57.current,
          {
            note: input.id,
          },
          shiftKey,
        );
        value250.selectNow &&
          deps.onSelectObjects(
            (0, boardSelectionItems)({
              note: input.id,
            }),
            shiftKey ? "toggle" : "replace",
          );
        deps.callback46(
          event,
          {
            note: input.id,
          },
          input,
          value250.carry,
          value250.click,
        );
      },
      onPointerMove: (input2?: Dynamic): Dynamic => deps.callback50(input2, false),
      onPointerUp: (input2?: Dynamic): Dynamic => deps.callback50(input2, true),
      onPointerCancel: deps.callback49,
    };
}
