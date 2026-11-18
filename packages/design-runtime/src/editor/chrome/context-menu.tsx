import { uiMessage } from '@minedesign/contracts/ui-messages';
import { useUiLocale } from '../../ui-locale.ts';
/** Restored application module; prepare first, initialize in original order. */
import {
  type Dynamic,
} from "../../runtime-types";
import { MenuMenuAssignValue, renderMenuItems } from "../../cds/menu/menu";
import { load_react_jsx_runtime } from "../../dependencies";
import { useEscapeReleaseSuppression, usePopoverDismissal as R_usePopoverDismissal } from "./popover";
import { reactChromeTheme_2 } from "./theme";
import { toModuleNamespace } from "../../module-helpers";

var jsxChromeContextMenu: Dynamic;
var ChromeContextMenuConstant: Dynamic;
var jsxChromeContextMenu_2: Dynamic;
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
  let value: Dynamic = at !== null;
  useEscapeReleaseSuppression(value && focusFirstItem);
  let value2: Dynamic = (0, reactChromeTheme_2.useRef)(null),
    value3: Dynamic = (0, reactChromeTheme_2.useRef)(onClose);
  value3.current = onClose;
  let [value4, value5]: Dynamic = (0, reactChromeTheme_2.useState)(
      false,
    ),
    value6: Dynamic = (0, reactChromeTheme_2.useRef)(null);
  (0, reactChromeTheme_2.useLayoutEffect)((): Dynamic => {
    at &&
      ((value6.current = {
        at: at,
        children: children,
        title: title,
        name: title ?? ariaLabel,
        anchor: anchor ?? "point",
      }),
      value5(true));
  }, [at, children, title, ariaLabel, anchor]);
  let value7: Dynamic = at
      ? {
          at: at,
          children: children,
          title: title,
          name: title ?? ariaLabel,
          anchor: anchor ?? "point",
        }
      : value6.current,
    value8: Dynamic = value7?.anchor === "tap",
    value9: Dynamic = value7?.at.x,
    value10: Dynamic = value7?.at.y,
    value11: Dynamic = (0,
    reactChromeTheme_2.useMemo)((): Dynamic => {
      if (value9 === undefined || value10 === undefined) return;
      let state: Dynamic = {
        x: value9,
        y: value10,
        left: value9,
        top: value10,
        right: value9,
        bottom: value10,
        width: 0,
        height: 0,
        toJSON: (): Dynamic => ({
          x: value9,
          y: value10,
          width: 0,
          height: 0,
        }),
      };
      return {
        getBoundingClientRect: (): Dynamic => state,
      };
    }, [value9, value10]),
    value12: Dynamic = (0, reactChromeTheme_2.useRef)(null);
  (0, reactChromeTheme_2.useLayoutEffect)((): Dynamic => {
    if (!value) return;
    let activeElement: Dynamic = (document as Dynamic).activeElement;
    (value4 &&
      (activeElement === (document as Dynamic).body ||
        (value2.current?.contains(activeElement) ?? false))) ||
      (value12.current =
        activeElement instanceof HTMLElement &&
        activeElement !== (document as Dynamic).body
          ? activeElement
          : null);
  }, [value, value4]);
  (0, reactChromeTheme_2.useEffect)((): Dynamic => {
    if (!value || !focusFirstItem) return;
    let value13: Dynamic = requestAnimationFrame((): Dynamic => {
      let current: Dynamic = value2.current;
      if (current === null) return;
      let activeElement: Dynamic = (document as Dynamic).activeElement;
      if (
        activeElement !== null &&
        activeElement !== (document as Dynamic).body &&
        activeElement !== current &&
        !current.contains(activeElement) &&
        activeElement !== value12.current
      )
        return;
      let element: Dynamic = current.querySelector(
        '[role^="menuitem"]:not([aria-disabled="true"]):not([data-disabled])',
      );
      element !== null && element.focus();
    });
    return (): Dynamic => cancelAnimationFrame(value13);
  }, [value, focusFirstItem]);
  return (
    <jsxChromeContextMenu.Fragment>
      {value ? (<R_usePopoverDismissal
          onClose={(): Dynamic => value3.current()}
        />) : (null)}
      <MenuMenuAssignValue.Root
        open={value}
        modal={false}
        onOpenChange={(input?: Dynamic, options?: Dynamic): Dynamic => {
          if (!input) {
            if (options.reason === "outside-press") {
              let value13: Dynamic = options.event?.target;
              if (
                value13 instanceof Element &&
                value13.hasAttribute("data-mc-scrim")
              ) {
                options.cancel();
                return;
              }
            }
            value3.current();
          }
        }}
        onOpenChangeComplete={(input?: Dynamic): Dynamic => {
          input || value5(false);
        }}
      >
        <MenuMenuAssignValue.Popup
          ref={value2}
          anchor={value11}
          side={"bottom"}
          align={value8 ? "center" : "start"}
          sideOffset={value8 ? ChromeContextMenuConstant : 0}
          aria-label={value7?.name}
          {...popupAttrs}
          data-mc-chrome={""}
          data-mc-menu={""}
          finalFocus={(): Dynamic => {
            let activeElement: Dynamic = (document as Dynamic).activeElement;
            if (
              activeElement instanceof HTMLElement &&
              activeElement !== (document as Dynamic).body &&
              !(value2.current?.contains(activeElement) ?? false)
            )
              return false;
            let value13: Dynamic =
              value12.current?.isConnected === true ? value12.current : null;
            (returnFocus !== undefined
              ? returnFocus(value13)
              : value13
            )?.focus({
              preventScroll: true,
            });
            return false;
          }}
          onContextMenu={(event?: Dynamic): Dynamic => {
            event.preventDefault();
            event.stopPropagation();
          }}
          onKeyDown={(input?: Dynamic): Dynamic => {
            input.key !== "Tab" &&
              !input.metaKey &&
              !input.ctrlKey &&
              input.stopPropagation();
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
          {value7?.title !== undefined ? (<MenuMenuAssignValue.Header className={"truncate"}>
              {value7.title}
            </MenuMenuAssignValue.Header>) : (null)}
          {value7?.children}
        </MenuMenuAssignValue.Popup>
      </MenuMenuAssignValue.Root>
    </jsxChromeContextMenu.Fragment>
  );
}
function normalizeEditorMenuItems(input?: Dynamic): Dynamic {
  return renderMenuItems(
    input.map(
      (input2?: Dynamic): Dynamic =>
        input2 === "separator" || !input2.disabledReason
          ? input2
          : {
              ...input2,
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
  jsxChromeContextMenu_2,
  normalizeEditorMenuItems,
};
export function installEditorChromeContextMenu(): () => void {
  return () => {
    jsxChromeContextMenu = toModuleNamespace(
      load_react_jsx_runtime(),
      1,
    );
    ChromeContextMenuConstant = 14;
    jsxChromeContextMenu_2 = toModuleNamespace(
      load_react_jsx_runtime(),
      1,
    );
    ChromeContextMenuIsConnected = (input?: Dynamic): Dynamic => (
      input !== null &&
        queueMicrotask((): Dynamic => {
          input.isConnected &&
            input.focus({
              preventScroll: true,
            });
        }),
      null
    );
  };
}
