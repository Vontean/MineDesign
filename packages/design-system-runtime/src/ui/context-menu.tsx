import { uiMessage } from '@minedesign/contracts/ui-messages';
import { useUiLocale } from '../ui-locale.ts';
/** Restored application module; prepare first, initialize in original order. */
import type * as React from "react";
import type {
  ReactNamespace,
  JsxNamespace,
  ContextMenuProps,
  RetainedContextMenu,
  PopupChangeDetails,
} from "../contracts/composition";
import { loadJsxNamespace, loadReactNamespace } from "../dependencies";
import { toModuleNamespace } from "../module-helpers";
import { Menu } from "./menu";
import { PopupScrim } from "./property-popover";

var reactContextMenu: ReactNamespace;
var jsxChromeContextMenu: JsxNamespace;
var ChromeContextMenuConstant: number;
function ContextMenu({
  at: at2,
  onClose: onClose,
  children: children,
  title: title,
  "aria-label": ariaLabel,
  anchor: anchor,
  className: className,
  focusFirstItem = false,
}: ContextMenuProps) {
  useUiLocale();
  let open = at2 !== null,
    popupRef = reactContextMenu.useRef<HTMLDivElement | null>(null),
    onCloseRef = reactContextMenu.useRef(onClose);
  onCloseRef.current = onClose;
  let [retained, setRetained] = reactContextMenu.useState(false),
    lastContentRef = reactContextMenu.useRef<RetainedContextMenu | null>(
      null,
    );
  reactContextMenu.useLayoutEffect(() => {
    if (at2) {
      lastContentRef.current = {
        at: at2,
        children: children,
        title: title,
        name: title ?? ariaLabel,
        anchor: anchor ?? "point",
      };
      setRetained(true);
    }
  }, [at2, children, title, ariaLabel, anchor]);
  let content = at2
      ? {
          at: at2,
          children: children,
          title: title,
          name: title ?? ariaLabel,
          anchor: anchor ?? "point",
        }
      : lastContentRef.current,
    value = content?.anchor === "tap",
    anchorX = content?.at.x,
    anchorY = content?.at.y,
    memo = reactContextMenu.useMemo(() => {
      if (anchorX === undefined || anchorY === undefined) {
        return;
      }
      let state = {
        x: anchorX,
        y: anchorY,
        left: anchorX,
        top: anchorY,
        right: anchorX,
        bottom: anchorY,
        width: 0,
        height: 0,
        toJSON: () => ({
          x: anchorX,
          y: anchorY,
          width: 0,
          height: 0,
        }),
      };
      return {
        getBoundingClientRect: () => state,
      };
    }, [anchorX, anchorY]),
    ref = reactContextMenu.useRef<HTMLElement | null>(null);
  reactContextMenu.useLayoutEffect(() => {
    if (!open) {
      return;
    }
    let activeElement = document.activeElement;
    if (
      retained &&
      (activeElement === document.body ||
        (popupRef.current?.contains(activeElement) ?? false))
    ) {
      return;
    }
    ref.current =
      activeElement instanceof HTMLElement && activeElement !== document.body
        ? activeElement
        : null;
  }, [open, retained]);
  reactContextMenu.useEffect(() => {
    if (!open || !focusFirstItem) {
      return;
    }
    let openFrame = requestAnimationFrame(() => {
      let current = popupRef.current;
      if (current === null) {
        return;
      }
      let activeElement = document.activeElement;
      if (
        activeElement !== null &&
        activeElement !== document.body &&
        activeElement !== current &&
        !current.contains(activeElement) &&
        activeElement !== ref.current
      ) {
        return;
      }
      let element = current.querySelector<HTMLElement>(
        '[role^="menuitem"]:not([aria-disabled="true"]):not([data-disabled])',
      );
      if (element !== null) {
        element.focus();
      }
    });
    return () => cancelAnimationFrame(openFrame);
  }, [open, focusFirstItem]);
  return (
    <jsxChromeContextMenu.Fragment>
      {[open ? (
          <PopupScrim onClose={() => onCloseRef.current()} />
        ) : null, <Menu.Root
          open={open}
          modal={false}
          onOpenChange={(nextOpen: boolean, changeDetails: PopupChangeDetails) => {
            if (nextOpen) {
              return;
            }
            if (changeDetails.reason === "outside-press") {
              let target = changeDetails.event?.target;
              if (
                target instanceof Element &&
                target.hasAttribute("data-mc-scrim")
              ) {
                changeDetails.cancel();
                return;
              }
            }
            onCloseRef.current();
          }}
          onOpenChangeComplete={(isOpen: boolean) => {
            if (!isOpen) {
              setRetained(false);
            }
          }}
        >
          <Menu.Popup
            ref={popupRef}
            anchor={memo}
            side={"bottom"}
            align={value ? "center" : "start"}
            sideOffset={value ? ChromeContextMenuConstant : 0}
            aria-label={content?.name}
            data-mc-chrome={""}
            data-mc-menu={""}
            finalFocus={() => {
              let activeElement = document.activeElement;
              if (
                activeElement instanceof HTMLElement &&
                activeElement !== document.body &&
                !(popupRef.current?.contains(activeElement) ?? false)
              ) {
                return false;
              }
              let current = ref.current;
              if (current !== null && current.isConnected) {
                current.focus({
                  preventScroll: true,
                });
              }
              return false;
            }}
            onContextMenu={(event: React.MouseEvent<HTMLElement>) => {
              event.preventDefault();
              event.stopPropagation();
            }}
            onKeyDown={(keyEvent: React.KeyboardEvent<HTMLElement>) => {
              if (keyEvent.key !== "Tab" && !keyEvent.metaKey && !keyEvent.ctrlKey) {
                keyEvent.stopPropagation();
              }
            }}
            className={className}
          >
            {[content?.title !== undefined ? (
                <Menu.Header className={"truncate"}>
                  {content.title}
                </Menu.Header>
              ) : null, content?.children]}
          </Menu.Popup>
        </Menu.Root>]}
    </jsxChromeContextMenu.Fragment>
  );
}
export {
  ChromeContextMenuConstant,
  ContextMenu,
  jsxChromeContextMenu,
  reactContextMenu,
};
export function installUiContextMenu(): () => void {
  return () => {
    reactContextMenu = toModuleNamespace(
      loadReactNamespace(),
      1,
    );
    jsxChromeContextMenu = toModuleNamespace(
      loadJsxNamespace(),
      1,
    );
    ChromeContextMenuConstant = 14;
  };
}
