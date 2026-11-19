import { useUiLocale } from '../ui-locale.ts';
import { uiMessage } from '@minedesign/contracts/ui-messages';
import type * as React from "react";
import type * as Token from "../contracts/token-editors";
import type * as Model from "../contracts";
import type * as Color from "../contracts/color-controls";
/** Restored application module; prepare first, initialize in original order. */
import { loadJsxNamespace, loadReactNamespace } from "../dependencies";
import { UNCOMMENTABLE_PROPS } from "./comment-anchors";
import { showEditorNotification } from "./editable-name";
import { restoreFocusAfterRemoval } from "./section-card";
import { toModuleNamespace } from "../module-helpers";
import { Button } from "../ui/buttons";
import { ContextMenu } from "../ui/context-menu";
import { Menu } from "../ui/menu";

var reactRowContextMenu: typeof import("react");
var jsxRowContextMenu: typeof import("react/jsx-runtime");
var ROW_CONTEXT_LONG_PRESS_MS: number;
var ROW_CONTEXT_MOVE_TOLERANCE_PX: number;
async function copyTextToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {}
  try {
    let value = document.createElement("textarea");
    value.value = text;
    value.style.position = "fixed";
    value.style.opacity = "0";
    document.body.appendChild(value);
    value.select();
    let didCopy = document.execCommand("copy");
    value.remove();
    return didCopy;
  } catch {
    return false;
  }
}
function RemoveRowButton({
  label: label,
  onRemove: onRemove,
  tabIndex: tabIndex,
  "data-testid": dataTestid,
}: Token.RemoveRowButtonProps): React.ReactElement {
  useUiLocale();
  return (
    <Button
      variant={"ghost"}
      size={"sm"}
      iconOnly={true}
      icon={"Trash"}
      aria-label={label}
      tooltip={label}
      className={
        "ds-row-trash opacity-0 group-hover/row:opacity-100 group-focus-within/row:opacity-100 focus-visible:opacity-100 pointer-coarse:opacity-100"
      }
      onClick={(event: React.MouseEvent<HTMLButtonElement>): void => {
        event.stopPropagation();
        let value =
          tabIndex === -1
            ? (): void => {
                return;
              }
            : restoreFocusAfterRemoval(event.currentTarget);
        onRemove();
        value();
      }}
      onKeyDown={(event: React.KeyboardEvent<HTMLButtonElement>): void => {
        if (event.repeat && (event.key === "Enter" || event.key === " ")) {
          event.preventDefault();
        }
      }}
      {...(tabIndex !== undefined
        ? {
            tabIndex: tabIndex,
          }
        : {})}
      data-testid={dataTestid}
      {...UNCOMMENTABLE_PROPS}
    />
  );
}
function useRowContextMenu(enabled: boolean = true): Token.RowContextState {
  let [value, setPoint] = reactRowContextMenu.useState<Token.RowPoint | null>(
      null,
    ),
    [anchor, setMode] = reactRowContextMenu.useState<"point" | "tap">("point"),
    ref = reactRowContextMenu.useRef<Token.RowTouchSession | null>(null),
    touchActiveRef = reactRowContextMenu.useRef(false),
    callback = () => {
      let current = ref.current;
      if (current === null) {
        return false;
      }
      window.clearTimeout(current.timer);
      ref.current = null;
      return current.fired;
    };
  reactRowContextMenu.useEffect(() => () => void callback(), []);
  let isOutsideTarget = (source: HTMLElement, target: HTMLElement) =>
    !source.contains(target) ||
    target.closest('input, textarea, [contenteditable="true"]') !== null;
  return {
    at: value,
    anchor: anchor,
    close: () => setPoint(null),
    rowProps: {
      onTouchStart: (
        event: React.TouchEvent<HTMLElement> & {
          target: HTMLElement;
        },
      ): void => {
        callback();
        if (!enabled || event.touches.length !== 1) {
          return;
        }
        let target = event.target;
        if (isOutsideTarget(event.currentTarget, target)) {
          return;
        }
        let { clientX: touchX, clientY: touchY } = event.touches[0];
        ref.current = {
          x: touchX,
          y: touchY,
          fired: false,
          timer: window.setTimeout((): void => {
            if (ref.current !== null) {
              ref.current.fired = true;
            }
            setMode("tap");
            setPoint({
              x: touchX,
              y: touchY,
            });
          }, ROW_CONTEXT_LONG_PRESS_MS),
        };
      },
      onTouchMove: (event: React.TouchEvent<HTMLElement>): void => {
        let current = ref.current,
          touch = event.touches[0];
        if (
          current !== null &&
          !current.fired &&
          touch !== undefined &&
          Math.hypot(touch.clientX - current.x, touch.clientY - current.y) >
            ROW_CONTEXT_MOVE_TOLERANCE_PX
        ) {
          callback();
        }
      },
      onTouchEnd: (
        event: React.TouchEvent<HTMLElement> & {
          target: HTMLElement;
        },
      ): void => {
        if (callback()) {
          event.preventDefault();
          touchActiveRef.current = true;
          window.setTimeout(() => (touchActiveRef.current = false), 400);
        }
      },
      onTouchCancel: () => void callback(),
      onClickCapture: (
        event: React.MouseEvent<HTMLElement> & {
          target: HTMLElement;
        },
      ): void => {
        if (touchActiveRef.current && event.currentTarget.contains(event.target)) {
          touchActiveRef.current = false;
          event.preventDefault();
          event.stopPropagation();
        }
      },
      onContextMenu: (
        event: React.MouseEvent<HTMLElement> & {
          target: HTMLElement;
        },
      ): void => {
        if (!enabled) {
          return;
        }
        let target = event.target;
        if (isOutsideTarget(event.currentTarget, target)) {
          return;
        }
        event.preventDefault();
        if (ref.current?.fired === true) {
          return;
        }
        callback();
        setMode("point");
        let bounds = event.currentTarget.getBoundingClientRect();
        setPoint(
          event.clientX === 0 && event.clientY === 0
            ? {
                x: bounds.left + 24,
                y: bounds.top + bounds.height / 2,
              }
            : {
                x: event.clientX,
                y: event.clientY,
              },
        );
      },
    },
  };
}
function RowContextMenu({
  title: title,
  at: at2,
  anchor: anchor,
  onClose: onClose,
  actions: actions,
  testid: testid,
}: Token.RowContextMenuProps): React.ReactElement {
  useUiLocale();
  let {
      rename: value,
      copy: copyValue,
      remove: removeAction,
      removeLabel: removeLabel = "Remove",
      goto: gotoAction,
      gotoLabel: gotoLabel = uiMessage("design-system.rowContextMenu.goToTarget"),
      inherit: inheritActions = [],
    } = actions,
    ref = reactRowContextMenu.useRef<HTMLSpanElement | null>(null);
  return (
    <jsxRowContextMenu.Fragment>
      {[<span ref={ref} hidden={true} />, <ContextMenu
          at={at2}
          {...(anchor !== undefined
            ? {
                anchor: anchor,
              }
            : {})}
          onClose={onClose}
          title={title}
          className={"min-w-[11rem]"}
        >
          {[gotoAction !== undefined ? (
              <Menu.Item
                icon={"ArrowRight"}
                onClick={() => requestAnimationFrame(gotoAction)}
                data-testid={
                  testid !== undefined ? testid + "-goto" : undefined
                }
              >
                {gotoLabel}
              </Menu.Item>
            ) : null, inheritActions.map((action, index) =>
              (() => {
                const _Element = Menu.Item;
                const _elementProps = {
                  icon: "ArrowCounterClockwise",
                  onClick: action.run,
                  "data-testid":
                    testid !== undefined
                      ? testid + "-inherit-" + String(index)
                      : undefined,
                  children: action.label,
                };
                const _elementKey = "inh" + String(index);
                return <_Element key={_elementKey} {..._elementProps} />;
              })(),
            ), value !== undefined ? (
              <Menu.Item
                icon={"Edit"}
                onClick={() => requestAnimationFrame(value)}
                data-testid={
                  testid !== undefined ? testid + "-rename" : undefined
                }
              >
                {uiMessage("design-system.rowContextMenu.rename")}
              </Menu.Item>
            ) : null, copyValue !== undefined && copyValue !== "" ? (
              <Menu.Item
                icon={"Copy"}
                onClick={() =>
                  void copyTextToClipboard(copyValue).then((didCopy: boolean) =>
                    showEditorNotification(
                      didCopy ? "Copied " + copyValue : "Couldn’t copy",
                    ),
                  )
                }
                data-testid={
                  testid !== undefined ? testid + "-copy" : undefined
                }
              >
                {uiMessage("design-system.rowContextMenu.copyValue")}
              </Menu.Item>
            ) : null, removeAction !== undefined ? (
              <jsxRowContextMenu.Fragment>
                {[value !== undefined ||
                  (copyValue !== undefined && copyValue !== "") ? (
                    <Menu.Separator />
                  ) : null, <Menu.Item
                    icon={"Trash"}
                    variant={"danger"}
                    onClick={(): void => {
                      let restoreFocus =
                        ref.current !== null
                          ? restoreFocusAfterRemoval(
                              ref.current,
                              true,
                            )
                          : (): void => {
                              return;
                            };
                      removeAction();
                      restoreFocus();
                    }}
                    data-testid={
                      testid !== undefined ? testid + "-remove" : undefined
                    }
                  >
                    {removeLabel}
                  </Menu.Item>]}
              </jsxRowContextMenu.Fragment>
            ) : null]}
        </ContextMenu>]}
    </jsxRowContextMenu.Fragment>
  );
}
export {
  copyTextToClipboard,
  jsxRowContextMenu,
  reactRowContextMenu,
  RemoveRowButton,
  ROW_CONTEXT_LONG_PRESS_MS,
  ROW_CONTEXT_MOVE_TOLERANCE_PX,
  RowContextMenu,
  useRowContextMenu,
};
export function installEditorRowContextMenu(): () => void {
  return () => {
    reactRowContextMenu = toModuleNamespace(
      loadReactNamespace(),
      1,
    );
    jsxRowContextMenu = toModuleNamespace(
      loadJsxNamespace(),
      1,
    );
    ROW_CONTEXT_LONG_PRESS_MS = 500;
    ROW_CONTEXT_MOVE_TOLERANCE_PX = 10;
  };
}
