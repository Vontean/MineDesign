import { uiMessage } from '@minedesign/contracts/ui-messages';
import { useUiLocale } from '../../ui-locale.ts';
/** Restored application module; prepare first, initialize in original order. */
import {
  type Dynamic,
} from "../../runtime-types";
import { Icon } from "../../cds/components/icon";
import { menuItemVariants } from "../../cds/menu/item-styles";
import { editableElementSelector } from "./focus";
import { joinClassNames } from "./overlay-state";

var ChromeMenuItemPreventDefault: Dynamic;
var ChromeMenuItemTarget: Dynamic;
function EditorMenuItem({
  onClick: onClick,
  children: children,
  disabled: isDisabled,
  title: title,
  danger: danger,
  checked: checked,
  hint: hint,
  icon: icon,
  "data-testid": dataTestid,
}: Dynamic): Dynamic {
  useUiLocale();
  return (
    <button
      type={"button"}
      data-kit={"MenuItem"}
      data-testid={dataTestid}
      disabled={isDisabled}
      title={title}
      aria-pressed={checked}
      onMouseDown={ChromeMenuItemPreventDefault}
      onClick={onClick}
      className={joinClassNames(
        menuItemVariants({
          variant: danger ? "danger" : "default",
        }),
        "cursor-default text-left disabled:cursor-not-allowed disabled:opacity-50",
        danger
          ? "enabled:hover:bg-fill-danger enabled:hover:text-on-danger focus-visible:bg-fill-danger focus-visible:text-on-danger"
          : "enabled:hover:bg-fill-ghost-hover focus-visible:bg-fill-ghost-hover",
      )}
    >
      {icon !== undefined ? (<span
          className={"flex size-icon shrink-0 items-center justify-center"}
        >
          {typeof icon == "string" ? (<Icon name={icon} size={"auto"} />) : (icon || (null))}
        </span>) : (null)}
      {typeof children == "string" || typeof children == "number" ? (<span className={"min-w-0 flex-1 truncate"}>{children}</span>) : (<span className={"flex min-w-0 flex-1 items-center gap-xs"}>
          {children}
        </span>)}
      {checked !== undefined || hint ? (<span className={"ml-md flex shrink-0 items-center gap-xs"}>
          {hint ? (<span
              className={joinClassNames(
                "max-w-[160px] shrink-0 truncate py-[0.125em] -my-[0.125em] text-footnote tabular-nums text-muted",
                danger &&
                  !isDisabled &&
                  "group-hover/menu-danger:text-on-danger group-focus-visible/menu-danger:text-on-danger",
              )}
            >
              {hint}
            </span>) : (null)}
          {checked !== undefined ? (<span
              className={
                "-mr-1 flex size-icon shrink-0 items-center justify-center"
              }
              style={{
                color: "var(--cds-fill-accent)",
              }}
            >
              {checked ? (<Icon name={"Check"} size={"auto"} bold={true} />) : (null)}
            </span>) : (null)}
        </span>) : (null)}
    </button>
  );
}
function getFocusableElements(container?: Dynamic): Dynamic {
  return Array.from(
    container.querySelectorAll(
      'button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [href], [tabindex]:not([tabindex="-1"])',
    ),
  ).filter(
    (element?: Dynamic): Dynamic =>
      element.tabIndex >= 0 && element.closest('[aria-hidden="true"]') === null,
  );
}
function isBaseUiFocusGuard(openChangeDetails?: Dynamic): Dynamic {
  let eventTarget: Dynamic = openChangeDetails.trigger ?? openChangeDetails.event?.target;
  return (
    eventTarget instanceof Element && eventTarget.hasAttribute("data-base-ui-focus-guard")
  );
}
export {
  ChromeMenuItemPreventDefault,
  ChromeMenuItemTarget,
  EditorMenuItem,
  getFocusableElements,
  isBaseUiFocusGuard,
};
export function installEditorChromeMenuItem(): () => void {
  return () => {
    ChromeMenuItemPreventDefault = (event?: Dynamic): Dynamic =>
      event.preventDefault();
    ChromeMenuItemTarget = (event?: Dynamic): Dynamic => {
      (!(event.target instanceof Element) ||
        event.target.closest(editableElementSelector) === null) &&
        event.preventDefault();
    };
  };
}
