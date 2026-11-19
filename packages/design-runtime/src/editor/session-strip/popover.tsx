import { uiMessage } from '@minedesign/contracts/ui-messages';
import { useUiLocale } from '../../ui-locale.ts';
/** Restored application module; prepare first, initialize in original order. */
import {
  type Dynamic,
} from "../../runtime-types";
import { Button } from "../../cds/button/button";
import { initializeCdsIndex } from "../../cds/index";
import { MenuMenuAssignValue } from "../../cds/menu/menu";
import { Tooltip } from "../../cds/tooltip/tooltip";
import { reactCollaborationPeerBadge_3 } from "../../collaboration/peer-badge";
import { load_react, load_react_jsx_runtime } from "../../dependencies";
import { joinClassNames } from "../chrome/overlay-state";
import { ToolbarCaret, toolbarItemTooltip, ToolbarPrimitivesContext, useDisabledToolbarItem, useToolbarItemAccessibility, useToolbarPress } from "../toolbar/primitives";
import { toModuleNamespace } from "../../module-helpers";

var jsxSessionStripPopover: Dynamic;
var reactSessionStripPopover: Dynamic;
var jsxSessionStripPopover_2: Dynamic;
function SessionStripPopover(props?: Dynamic): Dynamic {
  useUiLocale();
  let {
      label: label,
      tip: tip,
      descriptionSuffix: descriptionSuffix,
      children: children,
      align: align = "start",
      side: side = "bottom",
      open: controlledOpen,
      onOpenChange: onOpenChange,
      disabled: disabled = false,
      disabledTip: disabledTip,
      finalFocus: finalFocus,
      className: className,
      "data-testid": testId,
    }: Dynamic = props,
    isToolbarContext: Dynamic = (0, reactCollaborationPeerBadge_3.useContext)(
      ToolbarPrimitivesContext,
    ),
    wrapperRef: Dynamic = (0, reactCollaborationPeerBadge_3.useRef)(
      null,
    ),
    popupRef: Dynamic = (0, reactCollaborationPeerBadge_3.useRef)(
      null,
    ),
    [uncontrolledOpen, setUncontrolledOpen]: Dynamic = (0,
    reactCollaborationPeerBadge_3.useState)(false),
    isOpenValue: Dynamic = controlledOpen ?? uncontrolledOpen,
    [isFocusWithin, setIsFocusWithin]: Dynamic = (0,
    reactCollaborationPeerBadge_3.useState)(false),
    popupFinalFocus: Dynamic = finalFocus === true ? undefined : finalFocus,
    pendingFocusRef: Dynamic = (0, reactCollaborationPeerBadge_3.useRef)(
      false,
    ),
    latestPropsRef: Dynamic = (0, reactCollaborationPeerBadge_3.useRef)({
      disabled: disabled,
      popupFinalFocus: popupFinalFocus,
    });
  latestPropsRef.current = {
    disabled: disabled,
    popupFinalFocus: popupFinalFocus,
  };
  let hadFocusVisibleRef: Dynamic = (0, reactCollaborationPeerBadge_3.useRef)(
      false,
    ),
    popupRefCallback: Dynamic = (0, reactCollaborationPeerBadge_3.useCallback)(
      (element?: Dynamic): Dynamic => {
        popupRef.current = element;
        element === null &&
          setTimeout((): Dynamic => {
            pendingFocusRef.current = false;
            let current: Dynamic = wrapperRef.current;
            if (
              !hadFocusVisibleRef.current ||
              !latestPropsRef.current.disabled ||
              current === null ||
              latestPropsRef.current.popupFinalFocus === false ||
              !current.ownerDocument.hasFocus()
            )
              return;
            let activeElement: Dynamic = current.ownerDocument.activeElement;
            (activeElement === null ||
              activeElement === current.ownerDocument.body ||
              !activeElement.isConnected) &&
              current.focus({
                preventScroll: true,
              });
          }, 0);
      },
      [],
    ),
    iconName: Dynamic = props.icon ?? props.glyph,
    accessibleName: Dynamic =
      props.readout === undefined || props.readout === ""
        ? label
        : props.readout + ", " + label,
    isPressed: Dynamic =
      props.readout === undefined ? props.pressed : undefined,
    isEmphasized: Dynamic = props.readout === undefined && props.emphasis === true,
    isIconOnly: Dynamic = props.iconOnly === true || (isToolbarContext && !isEmphasized),
    disabledItem: Dynamic = useDisabledToolbarItem({
      disabled: disabled,
      name: accessibleName,
      reason: disabledTip ?? tip,
      pressed: isPressed,
      expanded: false,
      hasPopup: "menu",
    });
  useToolbarPress(wrapperRef, disabled);
  let content: Dynamic = toolbarItemTooltip({
      label: label,
      tip: tip,
      disabledTip: disabledTip,
      disabled: disabled,
    }).content,
    accessibility: Dynamic = useToolbarItemAccessibility({
      disabled: disabled,
      name: accessibleName,
      tip: content,
      descriptionSuffix: descriptionSuffix,
    }),
    trigger: Dynamic =
      props.readout !== undefined ? (
        <MenuMenuAssignValue.Trigger
          render={
            <Button
              variant={"ghost"}
              disabled={disabled}
              aria-label={accessibleName}
              aria-describedby={accessibility.describedBy}
              {...disabledItem.inner}
              data-testid={testId}
              className={"shrink-0 tabular-nums"}
            >
              {props.readoutSizer === undefined ? (props.readout) : (<span
                  data-sizer={props.readoutSizer}
                  className={
                    "inline-flex flex-col items-center before:invisible before:h-0 before:content-[attr(data-sizer)]"
                  }
                >
                  {props.readout}
                </span>)}
              <ToolbarCaret />
            </Button>
          }
        />
      ) : (
        <MenuMenuAssignValue.Trigger
          render={
            isIconOnly && props.caret !== true ? (
              <Button
                iconOnly={true}
                variant={"ghost"}
                icon={iconName}
                pressed={isPressed}
                disabled={disabled}
                aria-label={label}
                aria-describedby={accessibility.describedBy}
                {...disabledItem.inner}
                data-testid={testId}
                className={"shrink-0"}
              />
            ) : (
              <Button
                variant={
                  isEmphasized ? (disabled ? "secondary" : "primary") : "ghost"
                }
                icon={iconName}
                pressed={isPressed}
                disabled={disabled}
                aria-label={label}
                aria-describedby={accessibility.describedBy}
                {...disabledItem.inner}
                data-testid={testId}
                className={"shrink-0"}
              >
                {isIconOnly ? (null) : (label)}
                {props.caret === true ? (<ToolbarCaret inherit={isEmphasized && !disabled} />) : (null)}
              </Button>
            )
          }
        />
      ),
    wrapperClassName: Dynamic = joinClassNames(
      "relative inline-flex shrink-0 rounded align-top outline-none focus-visible:outline-hidden focus-visible:shadow-focus",
      className,
    );
  (0, reactCollaborationPeerBadge_3.useLayoutEffect)((): Dynamic => {
    disabled &&
      isOpenValue &&
      (controlledOpen === undefined && setUncontrolledOpen(false), onOpenChange?.(false));
    setIsFocusWithin(
      !disabled &&
        wrapperRef.current !== null &&
        wrapperRef.current.contains(wrapperRef.current.ownerDocument.activeElement),
    );
  }, [disabled]);
  let isEffectivelyOpen: Dynamic = isOpenValue && !disabled,
    wasOpenRef: Dynamic = (0, reactCollaborationPeerBadge_3.useRef)(
      false,
    );
  (0, reactCollaborationPeerBadge_3.useLayoutEffect)((): Dynamic => {
    wasOpenRef.current &&
      !isEffectivelyOpen &&
      (hadFocusVisibleRef.current =
        popupRef.current?.querySelector(":focus-visible") != null);
    if (wasOpenRef.current && !isEffectivelyOpen && !disabled && popupFinalFocus !== false) {
      let current: Dynamic = wrapperRef.current;
      current !== null &&
      current.contains(current.ownerDocument.activeElement)
        ? setIsFocusWithin(true)
        : (pendingFocusRef.current = true);
    }
    wasOpenRef.current = isEffectivelyOpen;
  }, [isEffectivelyOpen]);
  return (
    <MenuMenuAssignValue.Root
      open={isEffectivelyOpen}
      disabled={disabled}
      onOpenChange={(nextOpen?: Dynamic): Dynamic => {
        controlledOpen === undefined && setUncontrolledOpen(nextOpen);
        onOpenChange?.(nextOpen);
      }}
    >
      <Tooltip
        content={content}
        side={side}
        hoverable={false}
        open={!disabled && (isOpenValue || isFocusWithin) ? false : undefined}
      >
        <span
          ref={wrapperRef}
          tabIndex={disabled ? 0 : -1}
          {...disabledItem.props}
          onPointerEnter={isFocusWithin ? (): Dynamic => setIsFocusWithin(false) : undefined}
          onBlur={isFocusWithin ? (): Dynamic => setIsFocusWithin(false) : undefined}
          onFocus={(event?: Dynamic): Dynamic => {
            let relatedTarget: Dynamic = event.relatedTarget,
              isFocusFromOutside: Dynamic =
                relatedTarget !== null &&
                relatedTarget.isConnected &&
                !popupRef.current?.contains(relatedTarget) &&
                !wrapperRef.current?.contains(relatedTarget);
            pendingFocusRef.current
              ? ((pendingFocusRef.current = false),
                !isFocusFromOutside && !disabled && setIsFocusWithin(true))
              : isFocusWithin && isFocusFromOutside && setIsFocusWithin(false);
          }}
          data-tb-icon={
            props.readout === undefined && props.caret !== true && isIconOnly
              ? ""
              : undefined
          }
          data-tb-readout={props.readout !== undefined ? "" : undefined}
          className={wrapperClassName}
        >
          {trigger}
          {accessibility.mirror}
          {disabledItem.mirror}
        </span>
      </Tooltip>
      <MenuMenuAssignValue.Popup
        ref={popupRefCallback}
        side={side}
        align={align}
        finalFocus={popupFinalFocus}
      >
        {children}
      </MenuMenuAssignValue.Popup>
    </MenuMenuAssignValue.Root>
  );
}
export {
  jsxSessionStripPopover,
  jsxSessionStripPopover_2,
  reactSessionStripPopover,
  SessionStripPopover,
};
export function installEditorSessionStripPopover(): () => void {
  return () => {
    jsxSessionStripPopover = toModuleNamespace(
      load_react_jsx_runtime(),
      1,
    );
    reactSessionStripPopover = toModuleNamespace(
      load_react(),
      1,
    );
    initializeCdsIndex();
    jsxSessionStripPopover_2 = toModuleNamespace(
      load_react_jsx_runtime(),
      1,
    );
  };
}
