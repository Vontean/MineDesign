import { uiMessage } from '@minedesign/contracts/ui-messages';
import { useUiLocale } from '../../ui-locale.ts';
/** Restored application module; prepare first, initialize in original order. */
import {
  type Dynamic,
} from "../../runtime-types";
import { MenuMenuAssignValue, renderMenuItems } from "../../cds/menu/menu";
import { load_react_jsx_runtime } from "../../dependencies";
import { useEscapeReleaseSuppression, usePopoverDismissal as R_usePopoverDismissal } from "./popover";
import { reactForEditorContextMenu } from "./theme";
import { toModuleNamespace } from "../../module-helpers";

var jsxChromeContextMenu: Dynamic;
var ChromeContextMenuConstant: Dynamic;
var ChromeContextMenuIsConnected: Dynamic;
function EditorContextMenu({
  at: at,
  onClose: onClose,
  children: children,
  title: title,
  "aria-label": ariaLabel,
  anchor: anchor,
  className: className,
  minWidth: minWidth,
  popupAttrs: popupAttrs,
  returnFocus: returnFocus,
  focusFirstItem = false,
}: Dynamic): Dynamic {
  useUiLocale();
  let isOpen: Dynamic = at !== null;
  useEscapeReleaseSuppression(isOpen && focusFirstItem);
  let popupRef: Dynamic = (0, reactForEditorContextMenu.useRef)(null),
    onCloseRef: Dynamic = (0, reactForEditorContextMenu.useRef)(onClose);
  onCloseRef.current = onClose;
  let [isMounted, setIsMounted]: Dynamic = (0, reactForEditorContextMenu.useState)(
      false,
    ),
    lastMenuRef: Dynamic = (0, reactForEditorContextMenu.useRef)(null);
  (0, reactForEditorContextMenu.useLayoutEffect)((): Dynamic => {
    at &&
      ((lastMenuRef.current = {
        at: at,
        children: children,
        title: title,
        name: title ?? ariaLabel,
        anchor: anchor ?? "point",
      }),
      setIsMounted(true));
  }, [at, children, title, ariaLabel, anchor]);
  let currentMenu: Dynamic = at
      ? {
          at: at,
          children: children,
          title: title,
          name: title ?? ariaLabel,
          anchor: anchor ?? "point",
        }
      : lastMenuRef.current,
    isTapAnchor: Dynamic = currentMenu?.anchor === "tap",
    anchorX: Dynamic = currentMenu?.at.x,
    anchorY: Dynamic = currentMenu?.at.y,
    virtualAnchor: Dynamic = (0,
    reactForEditorContextMenu.useMemo)((): Dynamic => {
      if (anchorX === undefined || anchorY === undefined) return;
      let state: Dynamic = {
        x: anchorX,
        y: anchorY,
        left: anchorX,
        top: anchorY,
        right: anchorX,
        bottom: anchorY,
        width: 0,
        height: 0,
        toJSON: (): Dynamic => ({
          x: anchorX,
          y: anchorY,
          width: 0,
          height: 0,
        }),
      };
      return {
        getBoundingClientRect: (): Dynamic => state,
      };
    }, [anchorX, anchorY]),
    previousFocusRef: Dynamic = (0, reactForEditorContextMenu.useRef)(null);
  (0, reactForEditorContextMenu.useLayoutEffect)((): Dynamic => {
    if (!isOpen) return;
    let activeElement: Dynamic = (document as Dynamic).activeElement;
    (isMounted &&
      (activeElement === (document as Dynamic).body ||
        (popupRef.current?.contains(activeElement) ?? false))) ||
      (previousFocusRef.current =
        activeElement instanceof HTMLElement &&
        activeElement !== (document as Dynamic).body
          ? activeElement
          : null);
  }, [isOpen, isMounted]);
  (0, reactForEditorContextMenu.useEffect)((): Dynamic => {
    if (!isOpen || !focusFirstItem) return;
    let frameId: Dynamic = requestAnimationFrame((): Dynamic => {
      let current: Dynamic = popupRef.current;
      if (current === null) return;
      let activeElement: Dynamic = (document as Dynamic).activeElement;
      if (
        activeElement !== null &&
        activeElement !== (document as Dynamic).body &&
        activeElement !== current &&
        !current.contains(activeElement) &&
        activeElement !== previousFocusRef.current
      )
        return;
      let element: Dynamic = current.querySelector(
        '[role^="menuitem"]:not([aria-disabled="true"]):not([data-disabled])',
      );
      element !== null && element.focus();
    });
    return (): Dynamic => cancelAnimationFrame(frameId);
  }, [isOpen, focusFirstItem]);
  return (
    <jsxChromeContextMenu.Fragment>
      {isOpen ? (<R_usePopoverDismissal
          onClose={(): Dynamic => onCloseRef.current()}
        />) : (null)}
      <MenuMenuAssignValue.Root
        open={isOpen}
        modal={false}
        onOpenChange={(nextOpen?: Dynamic, changeDetails?: Dynamic): Dynamic => {
          if (!nextOpen) {
            if (changeDetails.reason === "outside-press") {
              let eventTarget: Dynamic = changeDetails.event?.target;
              if (
                eventTarget instanceof Element &&
                eventTarget.hasAttribute("data-mc-scrim")
              ) {
                changeDetails.cancel();
                return;
              }
            }
            onCloseRef.current();
          }
        }}
        onOpenChangeComplete={(nextOpen?: Dynamic): Dynamic => {
          nextOpen || setIsMounted(false);
        }}
      >
        <MenuMenuAssignValue.Popup
          ref={popupRef}
          anchor={virtualAnchor}
          side={"bottom"}
          align={isTapAnchor ? "center" : "start"}
          sideOffset={isTapAnchor ? ChromeContextMenuConstant : 0}
          aria-label={currentMenu?.name}
          {...popupAttrs}
          data-mc-chrome={""}
          data-mc-menu={""}
          finalFocus={(): Dynamic => {
            let activeElement: Dynamic = (document as Dynamic).activeElement;
            if (
              activeElement instanceof HTMLElement &&
              activeElement !== (document as Dynamic).body &&
              !(popupRef.current?.contains(activeElement) ?? false)
            )
              return false;
            let returnTarget: Dynamic =
              previousFocusRef.current?.isConnected === true ? previousFocusRef.current : null;
            (returnFocus !== undefined
              ? returnFocus(returnTarget)
              : returnTarget
            )?.focus({
              preventScroll: true,
            });
            return false;
          }}
          onContextMenu={(event?: Dynamic): Dynamic => {
            event.preventDefault();
            event.stopPropagation();
          }}
          onKeyDown={(event?: Dynamic): Dynamic => {
            event.key !== "Tab" &&
              !event.metaKey &&
              !event.ctrlKey &&
              event.stopPropagation();
          }}
          className={className}
          style={
            minWidth !== undefined
              ? {
                  minWidth: minWidth,
                }
              : undefined
          }
        >
          {currentMenu?.title !== undefined ? (<MenuMenuAssignValue.Header className={"truncate"}>
              {currentMenu.title}
            </MenuMenuAssignValue.Header>) : (null)}
          {currentMenu?.children}
        </MenuMenuAssignValue.Popup>
      </MenuMenuAssignValue.Root>
    </jsxChromeContextMenu.Fragment>
  );
}
function normalizeEditorMenuItems(items?: Dynamic): Dynamic {
  return renderMenuItems(
    items.map(
      (item?: Dynamic): Dynamic =>
        item === "separator" || !item.disabledReason
          ? item
          : {
              ...item,
              disabled: true,
            },
    ),
  );
}
function EditorMenu({
  at: at,
  onClose: onClose,
  items: items,
  minWidth: minWidth,
  owner: owner,
  label: label,
  focusFirstItem: focusFirstItem,
}: Dynamic): Dynamic {
  useUiLocale();
  return (
    <EditorContextMenu
      at={at}
      onClose={onClose}
      aria-label={label}
      minWidth={minWidth}
      focusFirstItem={focusFirstItem}
      returnFocus={ChromeContextMenuIsConnected}
      popupAttrs={
        owner !== undefined
          ? {
              "data-menu-owner": owner,
            }
          : undefined
      }
    >
      {at !== null ? (normalizeEditorMenuItems(items)) : (null)}
    </EditorContextMenu>
  );
}
export {
  ChromeContextMenuConstant,
  ChromeContextMenuIsConnected,
  EditorContextMenu,
  EditorMenu,
  jsxChromeContextMenu,
  normalizeEditorMenuItems,
};
export function installEditorChromeContextMenu(): () => void {
  return () => {
    jsxChromeContextMenu = toModuleNamespace(
      load_react_jsx_runtime(),
      1,
    );
    ChromeContextMenuConstant = 14;
    ChromeContextMenuIsConnected = (element?: Dynamic): Dynamic => (
      element !== null &&
        queueMicrotask((): Dynamic => {
          element.isConnected &&
            element.focus({
              preventScroll: true,
            });
        }),
      null
    );
  };
}
