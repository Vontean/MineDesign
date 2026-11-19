import { uiMessage } from '@minedesign/contracts/ui-messages';
import { useUiLocale } from '../../ui-locale.ts';
/** Restored application module; prepare first, initialize in original order. */
import {
  type Dynamic,
} from "../../runtime-types";
import { Button } from "../../cds/button/button";
import { Icon } from "../../cds/components/icon";
import { Surface } from "../../cds/components/surface";
import { CdsRoot } from "../../cds/theme/root";
import { Tooltip, TooltipGroup } from "../../cds/tooltip/tooltip";
import { ChromeFocusContext, editableElementSelector } from "../chrome/focus";
import { joinClassNames } from "../chrome/overlay-state";
import { observeSessionStripPointers, reactSessionStripPointerState, recordSessionStripOcclusion, SessionStripContext, sessionStripPointerDeadline, SessionStripPointerStateCurrentState, SessionStripPointerStateLimit, SessionStripPointerStateNow, SessionStripPointerStateSubscribers, suppressSessionStripClick } from "./pointer-state";
import { useTouchToolbar } from "../toolbar/layout";
import { useDisabledToolbarItem, useToolbarPress } from "../toolbar/primitives";
import { PopoverValue } from "../../platform/frame-host-bridge";

import { set_SessionStripPointerStateCurrentState } from "./pointer-state";
var SessionStripButton: Dynamic;
function updateSessionStripScrollAttrs(
  strip?: Dynamic,
  row?: Dynamic,
): Dynamic {
  strip.toggleAttribute("data-mc-more-start", row.scrollLeft > 1);
  strip.toggleAttribute(
    "data-mc-more-end",
    row.scrollLeft < row.scrollWidth - row.clientWidth - 1,
  );
}
function refreshSessionStripPointers(): Dynamic {
  SessionStripPointerStateCurrentState !== null &&
    clearTimeout(SessionStripPointerStateCurrentState);
  set_SessionStripPointerStateCurrentState(null);
  let now: Dynamic = SessionStripPointerStateNow(),
    index: Dynamic = 0;
  for (let stripElement of SessionStripPointerStateSubscribers as Dynamic) {
    let deadline: Dynamic =
      now === null
        ? 0
        : sessionStripPointerDeadline(stripElement, now);
    now !== null && now < deadline
      ? (stripElement.setAttribute("data-mc-through", String(Math.ceil(deadline))),
        (index = Math.max(index, deadline)))
      : stripElement.removeAttribute("data-mc-through");
  }
  now !== null &&
    index > 0 &&
    (set_SessionStripPointerStateCurrentState(setTimeout(
      refreshSessionStripPointers,
      Math.min(
        SessionStripPointerStateLimit,
        Math.max(0, index - now),
      ) + 1,
    )));
}
function SessionStrip({
  className: className,
  onPointerDown: onPointerDown,
  onMouseDown: onMouseDown,
  onMouseDownCapture: onMouseDownCapture,
  onClickCapture: onClickCapture,
  onScroll: onScroll,
  children: children,
  surface = "panel",
  placed = "above",
  coversSelection: coversSelection,
  wrap = false,
  ...props
}: Dynamic): Dynamic {
  useUiLocale();
  (0, reactSessionStripPointerState.useEffect)(
    (): Dynamic => observeSessionStripPointers(document),
    [],
  );
  let stripRef: Dynamic = (0, reactSessionStripPointerState.useRef)(
      null,
    ),
    rowRef: Dynamic = (0, reactSessionStripPointerState.useRef)(null),
    isTouchToolbar: Dynamic = useTouchToolbar();
  (0, reactSessionStripPointerState.useLayoutEffect)((): Dynamic => {
    let current: Dynamic = stripRef.current;
    if (current !== null) {
      SessionStripPointerStateSubscribers.add(current);
      return (): Dynamic => {
        SessionStripPointerStateSubscribers.delete(current);
        SessionStripPointerStateSubscribers.size === 0 &&
          SessionStripPointerStateCurrentState !== null &&
          (clearTimeout(SessionStripPointerStateCurrentState),
          (set_SessionStripPointerStateCurrentState(null)));
      };
    }
  }, []);
  (0, reactSessionStripPointerState.useLayoutEffect)((): Dynamic => {
    stripRef.current !== null &&
      recordSessionStripOcclusion(
        stripRef.current,
        coversSelection === true,
      );
    refreshSessionStripPointers();
    stripRef.current !== null &&
      rowRef.current !== null &&
      updateSessionStripScrollAttrs(stripRef.current, rowRef.current);
  });
  (0, reactSessionStripPointerState.useLayoutEffect)((): Dynamic => {
    let current: Dynamic = stripRef.current,
      rowElement: Dynamic = rowRef.current;
    if (
      current === null ||
      rowElement === null ||
      typeof ResizeObserver === "undefined"
    )
      return;
    let observer: Dynamic = new ResizeObserver(
      (): Dynamic => updateSessionStripScrollAttrs(current, rowElement),
    );
    observer.observe(rowElement);
    return (): Dynamic => observer.disconnect();
  }, []);
  (0, reactSessionStripPointerState.useLayoutEffect)((): Dynamic => {
    let current: Dynamic = stripRef.current,
      rowElement: Dynamic = rowRef.current;
    if (
      surface !== "popover" ||
      current === null ||
      rowElement === null ||
      typeof ResizeObserver === "undefined"
    )
      return;
    let updateWrapped: Dynamic = (): Dynamic => {
        let element: Dynamic = rowElement.querySelector('[data-cds="Button"]'),
          rowStyle: Dynamic = getComputedStyle(rowElement),
          singleLineHeight: Dynamic =
            (element?.offsetHeight ?? 0) +
            (parseFloat(rowStyle.paddingTop) || 0) +
            (parseFloat(rowStyle.paddingBottom) || 0);
        current.toggleAttribute(
          "data-mc-wrapped",
          element !== null && rowElement.clientHeight > singleLineHeight + 1,
        );
      },
      observer: Dynamic = new ResizeObserver(updateWrapped);
    observer.observe(rowElement);
    updateWrapped();
    return (): Dynamic => observer.disconnect();
  }, [surface]);
  return (
    <CdsRoot
      density={surface === "popover" && isTouchToolbar ? "comfortable" : "compact"}
      render={
        <Surface
          elevation={PopoverValue}
          role={"toolbar"}
          data-mc-strip={""}
          data-mc-surface={surface}
          onPointerDown={(event?: Dynamic): Dynamic => {
            event.stopPropagation();
            onPointerDown?.(event);
          }}
          onMouseDownCapture={(event?: Dynamic): Dynamic => {
            event.currentTarget.contains(event.target) &&
              suppressSessionStripClick(event) &&
              (event.preventDefault(), event.stopPropagation());
            onMouseDownCapture?.(event);
          }}
          onClickCapture={(event?: Dynamic): Dynamic => {
            event.currentTarget.contains(event.target) &&
              suppressSessionStripClick(event) &&
              (event.preventDefault(), event.stopPropagation());
            onClickCapture?.(event);
          }}
          onMouseDown={(event?: Dynamic): Dynamic => {
            event.target.closest(editableElementSelector) ||
              event.preventDefault();
            onMouseDown?.(event);
          }}
          className={joinClassNames(
            "z-selection flex items-center",
            surface === "popover"
              ? "[--mc-group-gap:2px] [--mc-strip-gap:4px] [--mc-strip-pad:5px] pointer-coarse:rounded-xl pointer-coarse:[--mc-group-gap:8px] pointer-coarse:[--mc-strip-gap:8px] pointer-coarse:[--mc-strip-pad:6px] [&_[data-mc-divider]]:mx-0"
              : "[--mc-strip-gap:2px] [--mc-strip-pad:4px] [--mc-group-gap:4px]",
            "max-w-[calc(100vw-16px)] overflow-clip",
            className,
          )}
          {...props}
          ref={stripRef}
        />
      }
    >
      <div className={"relative min-w-0 flex-auto rounded-[inherit]"}>
        <div
          ref={rowRef}
          data-mc-row={""}
          onScroll={(event?: Dynamic): Dynamic => {
            stripRef.current !== null &&
              updateSessionStripScrollAttrs(
                stripRef.current,
                event.currentTarget,
              );
            onScroll?.(event);
          }}
          className={joinClassNames(
            "flex min-w-0 items-center gap-[var(--mc-strip-gap)] rounded-[inherit] p-[var(--mc-strip-pad)]",
            wrap
              ? "flex-wrap"
              : "overflow-x-auto [clip-path:inset(0_1px)] [scrollbar-width:none] [&>*]:shrink-0",
          )}
        >
          <ChromeFocusContext.Provider
            value={placed === "below" ? "bottom" : "top"}
          >
            <SessionStripContext.Provider value={wrap}>
              <TooltipGroup>{children}</TooltipGroup>
            </SessionStripContext.Provider>
          </ChromeFocusContext.Provider>
        </div>
        <span
          aria-hidden={"true"}
          data-tb-fade={"start"}
          className={
            "pointer-events-none absolute inset-y-px left-px z-10 w-12"
          }
        >
          <span
            className={
              "pointer-events-auto absolute inset-y-0 left-0 w-[30%]"
            }
          />
        </span>
        <span
          aria-hidden={"true"}
          data-tb-fade={"end"}
          className={
            "pointer-events-none absolute inset-y-px right-px z-10 w-12"
          }
        >
          <span
            className={
              "pointer-events-auto absolute inset-y-0 right-0 w-[30%]"
            }
          />
        </span>
      </div>
    </CdsRoot>
  );
}
function SessionStripGroup({
  wrap = false,
  fields = false,
  className: className,
  ...props
}: Dynamic): Dynamic {
  useUiLocale();
  let isWrapContext: Dynamic = (0, reactSessionStripPointerState.useContext)(
    SessionStripContext,
  );
  return (
    <span
      data-mc-group={""}
      className={joinClassNames(
        "flex items-center gap-y-1",
        fields ? "gap-x-1" : "gap-x-[var(--mc-group-gap,4px)]",
        wrap && isWrapContext && "max-w-full shrink-0 flex-wrap",
        className,
      )}
      {...props}
    />
  );
}
function SessionStripDivider(): Dynamic {
  useUiLocale();
  return (
    <span
      aria-hidden={"true"}
      data-mc-divider={""}
      className={"mx-0.5 h-[18px] w-px bg-border-line"}
    />
  );
}
export {
  refreshSessionStripPointers,
  SessionStrip,
  SessionStripButton,
  SessionStripDivider,
  SessionStripGroup,
  updateSessionStripScrollAttrs,
};
export function installEditorSessionStripSessionStrip(): () => void {
  return () => {
    SessionStripButton = (0, reactSessionStripPointerState.forwardRef)(
      function (
        {
          className: className,
          type: type,
          onMouseDown: onMouseDown,
          chevron: chevron,
          icon: icon,
          children: children,
          title: title,
          disabled: disabledProp,
          "aria-pressed": ariaPressed,
          "aria-label": ariaLabel,
          "aria-expanded": ariaExpanded,
          "aria-describedby": ariaDescribedby,
          ...props
        }: Dynamic,
        forwardedRef?: Dynamic,
      ): Dynamic {
        let isPressed: Dynamic =
            ariaPressed === undefined
              ? undefined
              : ariaPressed === true || ariaPressed === "true",
          handleMouseDown: Dynamic = (event?: Dynamic): Dynamic => {
            event.preventDefault();
            onMouseDown?.(event);
          },
          isDisabled: Dynamic = disabledProp === true,
          tooltipSide: Dynamic =
            (0, reactSessionStripPointerState.useContext)(
              ChromeFocusContext,
            ) ?? "top",
          accessibleName: Dynamic =
            ariaLabel ?? (typeof children == "string" ? children : undefined),
          disabledItem: Dynamic = useDisabledToolbarItem({
            disabled: isDisabled && title !== undefined,
            name: accessibleName ?? title ?? "",
            reason: title,
            pressed: ariaPressed,
            expanded: ariaExpanded,
            hasPopup: props["aria-haspopup"],
          }),
          wrapperRef: Dynamic = (0, reactSessionStripPointerState.useRef)(
            null,
          );
        useToolbarPress(wrapperRef, isDisabled && title !== undefined);
        let hintId: Dynamic = (0,
          reactSessionStripPointerState.useId)(),
          hasDisabledHint: Dynamic =
            !isDisabled && !!title && accessibleName?.startsWith(title) !== true,
          describedBy: Dynamic =
            [ariaDescribedby, hasDisabledHint ? hintId : undefined]
              .filter(Boolean)
              .join(" ") || undefined,
          buttonProps: Dynamic = {
            ref: forwardedRef,
            variant: "ghost",
            type: type ?? "button",
            pressed: isPressed,
            disabled: disabledProp,
            "aria-expanded": ariaExpanded,
            "aria-describedby": describedBy,
            onMouseDown: handleMouseDown,
            className: joinClassNames("shrink-0", className),
            ...props,
            "data-mc-item": "",
            ...disabledItem.inner,
          },
          button: Dynamic =
            icon !== undefined && children == null ? (
              <Button
                {...buttonProps}
                iconOnly={true}
                icon={icon}
                aria-label={ariaLabel ?? ("")}
                tooltip={false}
              />
            ) : (
              <Button {...buttonProps} icon={icon} aria-label={ariaLabel}>
                {children}
                {chevron === true ? (<Icon
                    name={"CaretDown"}
                    size={"sm"}
                    className={"shrink-0 opacity-60"}
                  />) : (null)}
              </Button>
            );
        return title === undefined ? (
          button
        ) : (
          <Tooltip
            content={title}
            side={tooltipSide}
            hoverable={false}
            open={
              (ariaExpanded === true || ariaExpanded === "true") && !isDisabled
                ? false
                : undefined
            }
          >
            <span
              ref={wrapperRef}
              tabIndex={isDisabled ? 0 : -1}
              {...disabledItem.props}
              data-tip={title}
              className={
                "relative inline-flex shrink-0 rounded align-top outline-none focus-visible:outline-hidden focus-visible:shadow-focus"
              }
            >
              {button}
              {hasDisabledHint ? (<span hidden={true} id={hintId}>
                  {title}
                </span>) : (null)}
              {disabledItem.mirror}
            </span>
          </Tooltip>
        );
      },
    );
  };
}
