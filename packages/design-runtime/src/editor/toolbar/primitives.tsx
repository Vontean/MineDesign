import { uiMessage } from '@minedesign/contracts/ui-messages';
import { useUiLocale } from '../../ui-locale.ts';
/** Restored application module; prepare first, initialize in original order. */
import {
  type Dynamic,
} from "../../runtime-types";
import { Button } from "../../cds/button/button";
import { Counter } from "../../cds/components/counter";
import { Icon } from "../../cds/components/icon";
import { parseSingleShortcut, useAppleKeyboard } from "../../cds/components/shortcut";
import { Tooltip } from "../../cds/tooltip/tooltip";
import { load_react, load_react_jsx_runtime } from "../../dependencies";
import { joinClassNames } from "../chrome/overlay-state";
import { toModuleNamespace } from "../../module-helpers";
import { reactPlatformFrameHostBridge } from "../../platform/frame-host-bridge";

var jsxToolbarPrimitives: Dynamic;
var ToolbarPrimitivesContext: Dynamic;
var toolbarReadOnlyContext: Dynamic;
var ToolbarPrimitivesCtrlControlAltConfig: Dynamic;
var ToolbarPrimitivesControlCtrlOptionValues: Dynamic;
var ToolbarPrimitivesEscEscapeEnterConfig: Dynamic;
var ToolbarPrimitivesHandler: Dynamic;
var ToolbarPrimitivesItems: Dynamic;
var ToolbarPrimitivesComponent: Dynamic;
var reactToolbarPrimitives: Dynamic;
var ToolbarPrimitivesMediaQuery: Dynamic;
var ToolbarPrimitivesLabel: Dynamic;
function ToolbarCaret({ inherit: inheritIcon = false }: Dynamic = {}): Dynamic {
  useUiLocale();
  return (
    <Icon
      name={"CaretDown"}
      size={"xs"}
      className={joinClassNames(
        "-mx-0.5 shrink-0",
        !inheritIcon && "text-fg-muted",
      )}
    />
  );
}
function toolbarItemTooltip(item?: Dynamic): Dynamic {
  return item.disabled
    ? {
        content: item.disabledTip ?? item.tip ?? item.label,
        shortcut: undefined,
      }
    : {
        content: item.tip ?? item.label,
        shortcut: item.shortcut,
      };
}
function useDisabledToolbarItem(item?: Dynamic): Dynamic {
  let value: Dynamic = (0, reactPlatformFrameHostBridge.useId)();
  if (!item.disabled)
    return {
      props: {},
      inner: {},
      mirror: null,
    };
  let hasReason: Dynamic = !!item.reason && item.reason !== item.name;
  return {
    props: {
      role: "button",
      "aria-disabled": true,
      "aria-label": item.name,
      "aria-describedby": hasReason ? value : undefined,
      "aria-pressed": item.pressed,
      "aria-expanded": item.expanded,
      "aria-haspopup": item.hasPopup,
    },
    inner: {
      "aria-hidden": true,
    },
    mirror: hasReason ? (
      <span hidden={true} id={value}>
        {item.reason}
      </span>
    ) : null,
  };
}
function useToolbarPress(buttonRef?: Dynamic, pressOptions?: Dynamic): Dynamic {
  let value: Dynamic = (0, reactPlatformFrameHostBridge.useRef)(
    pressOptions,
  );
  value.current = pressOptions;
  let focusVisibleRef: Dynamic = (0, reactPlatformFrameHostBridge.useRef)(
      undefined,
    ),
    isPressedRef: Dynamic = (0, reactPlatformFrameHostBridge.useRef)(false),
    current: Dynamic = (0, reactPlatformFrameHostBridge.useRef)(
      (event?: Dynamic): Dynamic => {
        let currentTarget: Dynamic = event.currentTarget;
        if (event.type === "pointerdown") focusVisibleRef.current = false;
        else if (event.type === "focusout") {
          let relatedTarget: Dynamic = event.relatedTarget;
          event.target === currentTarget &&
            relatedTarget instanceof Node &&
            relatedTarget.isConnected &&
            !currentTarget.contains(relatedTarget) &&
            (isPressedRef.current = false);
        } else {
          focusVisibleRef.current =
            event.target instanceof Element &&
            event.target.matches(":focus-visible");
          event.type === "focusin" &&
            event.target === currentTarget &&
            value.current &&
            (isPressedRef.current = focusVisibleRef.current);
        }
      },
    ).current,
    handleFocusReset: Dynamic = (0, reactPlatformFrameHostBridge.useRef)(
      (): Dynamic => {
        isPressedRef.current = false;
      },
    ).current,
    elementRef: Dynamic = (0, reactPlatformFrameHostBridge.useRef)(null),
    callback: Dynamic = (element?: Dynamic): Dynamic => {
      let currentElement: Dynamic = elementRef.current;
      if (element === currentElement) return;
      let items: Dynamic = ["focusin", "focusout", "keydown", "pointerdown"];
      if (currentElement !== null) {
        for (let eventName of items as Dynamic)
          currentElement.removeEventListener(eventName, current);
        currentElement.ownerDocument.removeEventListener(
          "pointerdown",
          handleFocusReset,
          true,
        );
      }
      elementRef.current = element;
      if (element !== null) {
        for (let eventName of items as Dynamic)
          element.addEventListener(eventName, current);
        element.ownerDocument.addEventListener("pointerdown", handleFocusReset, true);
      }
    };
  (0, reactPlatformFrameHostBridge.useLayoutEffect)(
    (): Dynamic => callback(buttonRef.current),
  );
  (0, reactPlatformFrameHostBridge.useLayoutEffect)(
    (): Dynamic => (): Dynamic => callback(null),
    [],
  );
  (0, reactPlatformFrameHostBridge.useLayoutEffect)((): Dynamic => {
    let currentElement: Dynamic = buttonRef.current;
    if (currentElement === null) return;
    let ownerDocument: Dynamic = currentElement.ownerDocument,
      activeElement: Dynamic =
        ownerDocument.activeElement instanceof HTMLElement ||
        ownerDocument.activeElement instanceof SVGElement
          ? ownerDocument.activeElement
          : null,
      isOutside: Dynamic =
        activeElement === null ||
        activeElement === ownerDocument.body ||
        activeElement === ownerDocument.documentElement;
    if (pressOptions)
      ownerDocument.hasFocus() &&
        !isOutside &&
        activeElement !== currentElement &&
        currentElement.contains(activeElement) &&
        (focusVisibleRef.current ?? activeElement.matches(":focus-visible")) &&
        currentElement.focus({
          preventScroll: true,
        });
    else {
      let isFocused: Dynamic = isPressedRef.current;
      isPressedRef.current = false;
      isFocused &&
        (activeElement === currentElement || (isOutside && ownerDocument.hasFocus())) &&
        currentElement.querySelector("button")?.focus({
          preventScroll: true,
        });
    }
  }, [pressOptions]);
}
function formatToolbarShortcut(shortcut?: Dynamic, isApple?: Dynamic): Dynamic {
  let value: Dynamic = shortcut.trim().replace(/\s*\+\s*/g, "+");
  if (value === "" || /\s/.test(value)) return;
  let items: Dynamic = [],
    secondaryShortcuts: Dynamic = [];
  for (let shortcutPart of value.split("+") as Dynamic) {
    let normalizedPart: Dynamic = shortcutPart.toLowerCase();
    if (normalizedPart === "") continue;
    let shortcutPair: Dynamic = ToolbarPrimitivesHandler(
      ToolbarPrimitivesCtrlControlAltConfig,
      normalizedPart,
    );
    if (shortcutPair !== undefined) {
      let displayShortcut: Dynamic = shortcutPair[isApple ? 0 : 1];
      items.includes(displayShortcut) || items.push(displayShortcut);
      continue;
    }
    let fallbackShortcut: Dynamic = ToolbarPrimitivesHandler(
      ToolbarPrimitivesEscEscapeEnterConfig,
      normalizedPart,
    );
    secondaryShortcuts.push(
      fallbackShortcut !== undefined
        ? typeof fallbackShortcut == "string"
          ? fallbackShortcut
          : fallbackShortcut[isApple ? 0 : 1]
        : normalizedPart.length === 1
          ? normalizedPart.toUpperCase()
          : normalizedPart.charAt(0).toUpperCase() + normalizedPart.slice(1),
    );
  }
  if (secondaryShortcuts.length !== 0) {
    items.sort(
      (leftShortcut?: Dynamic, rightShortcut?: Dynamic): Dynamic =>
        ToolbarPrimitivesControlCtrlOptionValues.indexOf(leftShortcut) -
        ToolbarPrimitivesControlCtrlOptionValues.indexOf(rightShortcut),
    );
    return [...items, ...secondaryShortcuts].join("+");
  }
}
function normalizeToolbarTooltip(
  tooltip?: Dynamic,
  isApple?: Dynamic,
): Dynamic {
  let value: Dynamic = tooltip;
  for (let [token, appleLabel, standardLabel] of ToolbarPrimitivesItems as Dynamic)
    value = value.replace(token, isApple ? appleLabel : standardLabel);
  return value.replace(/ {2,}/g, " ").trim();
}
function useToolbarItemAccessibility(item?: Dynamic): Dynamic {
  let value: Dynamic = (0, reactPlatformFrameHostBridge.useId)(),
    isAppleKeyboard: Dynamic = useAppleKeyboard(),
    isEnabled: Dynamic = !item.disabled,
    hasTip: Dynamic = item.tip !== "" && !item.name.includes(item.tip),
    descriptionSuffix: Dynamic =
      isEnabled && item.shortcut !== undefined
        ? formatToolbarShortcut(item.shortcut, isAppleKeyboard)
        : undefined,
    keyShortcuts: Dynamic =
      isEnabled && item.shortcut !== undefined
        ? parseSingleShortcut(item.shortcut, isAppleKeyboard)
        : undefined,
    shortcutLabel: Dynamic =
      isEnabled && item.descriptionSuffix ? item.descriptionSuffix : undefined,
    describedById: Dynamic =
      isEnabled && (hasTip || descriptionSuffix !== undefined || shortcutLabel !== undefined),
    describedBy: Dynamic =
      [item.describedBy, describedById ? value : undefined]
        .filter(Boolean)
        .join(" ") || undefined;
  if (!describedById)
    return {
      describedBy: describedBy,
      keyShortcuts: keyShortcuts,
      mirror: null,
    };
  let accessibleLabel: Dynamic = [
      hasTip ? normalizeToolbarTooltip(item.tip, isAppleKeyboard) : undefined,
      descriptionSuffix !== undefined ? "Shortcut: " + descriptionSuffix : undefined,
    ]
      .filter(Boolean)
      .join(". "),
    finalLabel: Dynamic =
      shortcutLabel === undefined
        ? accessibleLabel
        : accessibleLabel === ""
          ? shortcutLabel
          : accessibleLabel + (/[.!?]$/.test(accessibleLabel) ? " " : ". ") + shortcutLabel;
  return {
    describedBy: describedBy,
    keyShortcuts: keyShortcuts,
    mirror: (
      <span hidden={true} id={value}>
        {finalLabel}
      </span>
    ),
  };
}
export {
  formatToolbarShortcut,
  jsxToolbarPrimitives,
  normalizeToolbarTooltip,
  reactToolbarPrimitives,
  ToolbarCaret,
  toolbarItemTooltip,
  ToolbarPrimitivesComponent,
  ToolbarPrimitivesContext,
  toolbarReadOnlyContext,
  ToolbarPrimitivesControlCtrlOptionValues,
  ToolbarPrimitivesCtrlControlAltConfig,
  ToolbarPrimitivesEscEscapeEnterConfig,
  ToolbarPrimitivesHandler,
  ToolbarPrimitivesItems,
  ToolbarPrimitivesLabel,
  ToolbarPrimitivesMediaQuery,
  useDisabledToolbarItem,
  useToolbarItemAccessibility,
  useToolbarPress,
};
export function installEditorToolbarPrimitives(): () => void {
  return () => {
    jsxToolbarPrimitives = toModuleNamespace(
      load_react_jsx_runtime(),
      1,
    );
    ToolbarPrimitivesContext = (0,
    reactPlatformFrameHostBridge.createContext)(false);
    toolbarReadOnlyContext = (0,
    reactPlatformFrameHostBridge.createContext)(false);
    ToolbarPrimitivesCtrlControlAltConfig = {
      get ctrl() { return [uiMessage("inspector.primitives.control"), "Ctrl"]; },
      get control() { return [uiMessage("inspector.primitives.control"), "Ctrl"]; },
      alt: ["Option", "Alt"],
      option: ["Option", "Alt"],
      shift: ["Shift", "Shift"],
      cmd: ["Command", "Ctrl"],
      command: ["Command", "Ctrl"],
      meta: ["Command", "Ctrl"],
    };
    ToolbarPrimitivesControlCtrlOptionValues = [
      "Control",
      "Ctrl",
      "Option",
      "Alt",
      "Shift",
      "Command",
    ];
    ToolbarPrimitivesEscEscapeEnterConfig = {
      esc: "Escape",
      escape: "Escape",
      enter: ["Return", "Enter"],
      return: ["Return", "Enter"],
      get delete() { return [uiMessage("inspector.primitives.delete"), "Backspace"]; },
      get backspace() { return [uiMessage("inspector.primitives.delete"), "Backspace"]; },
      space: "Space",
      tab: "Tab",
      up: "Up Arrow",
      down: "Down Arrow",
      left: "Left Arrow",
      right: "Right Arrow",
      pageup: "Page Up",
      pagedown: "Page Down",
      "\\": "Backslash",
      "/": "Slash",
      "-": "Minus",
      "=": "Equals",
      ",": "Comma",
      ".": "Period",
      ";": "Semicolon",
      "'": "Apostrophe",
      "`": "Backtick",
      "[": "Left Bracket",
      "]": "Right Bracket",
    };
    ToolbarPrimitivesHandler = (dictionary?: Dynamic, key?: Dynamic): Dynamic =>
      Object.hasOwn(dictionary, key) ? dictionary[key] : undefined;
    ToolbarPrimitivesItems = [
      [/⌘/g, "Command ", "Ctrl "],
      [/⇧/g, "Shift ", "Shift "],
      [/⌥/g, "Option ", "Alt "],
      [/⌃/g, "Control ", "Ctrl "],
      [/⏎/g, "Return", "Enter"],
      [/⌫/g, "Delete", "Backspace"],
    ];
    ToolbarPrimitivesComponent = (0,
    reactPlatformFrameHostBridge.forwardRef)(function (
      {
        icon: icon,
        glyph: glyph,
        label: label,
        tip: tip,
        disabledTip: disabledTip,
        shortcut: shortcut,
        descriptionSuffix: descriptionSuffix,
        children: children,
        pressed: pressed,
        expanded: expanded,
        count: count,
        iconOnly: iconOnly,
        caret: caret,
        tipSide = "bottom",
        className: className,
        variant = "ghost",
        "aria-expanded": ariaExpanded,
        "aria-describedby": ariaDescribedby,
        ...props
      }: Dynamic,
      buttonRef?: Dynamic,
    ): Dynamic {
      let value: Dynamic = (0, reactPlatformFrameHostBridge.useContext)(
          ToolbarPrimitivesContext,
        ),
        isDisabled: Dynamic = props.disabled === true,
        buttonLabel: Dynamic = count ? label + " (" + String(count) + ")" : label,
        buttonIcon: Dynamic = icon ?? glyph,
        tooltip: Dynamic = toolbarItemTooltip({
          label: label,
          tip: tip,
          disabledTip: disabledTip,
          shortcut: shortcut,
          disabled: isDisabled,
        }),
        accessibility: Dynamic = useToolbarItemAccessibility({
          disabled: isDisabled,
          name: buttonLabel,
          tip: tooltip.content,
          shortcut: tooltip.shortcut,
          describedBy: ariaDescribedby,
          descriptionSuffix: descriptionSuffix,
        }),
        disabledProps: Dynamic = useDisabledToolbarItem({
          disabled: isDisabled,
          name: buttonLabel,
          reason: disabledTip ?? tip,
          pressed: pressed,
          expanded: expanded ?? ariaExpanded,
          hasPopup: props["aria-haspopup"],
        }),
        buttonElementRef: Dynamic = (0, reactPlatformFrameHostBridge.useRef)(
          null,
        );
      useToolbarPress(buttonElementRef, isDisabled);
      let state: Dynamic = {
          ...props,
          ref: buttonRef,
          variant: variant,
          pressed: pressed,
          "aria-expanded": expanded ?? ariaExpanded,
          "aria-label": buttonLabel,
          "aria-describedby": accessibility.describedBy,
          "aria-keyshortcuts":
            props["aria-keyshortcuts"] ?? accessibility.keyShortcuts,
          ...disabledProps.inner,
        },
        isIconOnly: Dynamic = iconOnly === true || (value && variant !== "primary"),
        showIconOnly: Dynamic = isIconOnly && caret !== true;
      return (
        <Tooltip
          content={tooltip.content}
          shortcut={tooltip.shortcut}
          side={tipSide}
          hoverable={false}
        >
          <span
            ref={buttonElementRef}
            tabIndex={isDisabled ? 0 : -1}
            {...disabledProps.props}
            data-tb-icon={showIconOnly ? "" : undefined}
            className={joinClassNames(
              "relative inline-flex shrink-0 rounded align-top outline-none focus-visible:outline-hidden focus-visible:shadow-focus",
              className,
            )}
          >
            {isIconOnly ? (caret === true ? (<Button {...state} icon={buttonIcon}>
                  <ToolbarCaret />
                </Button>) : (<Button
                  {...state}
                  iconOnly={true}
                  icon={buttonIcon}
                  tooltip={false}
                />)) : (<Button {...state} icon={buttonIcon}>
                {label}
                {children}
                {caret === true ? (<ToolbarCaret inherit={variant === "primary"} />) : (null)}
              </Button>)}
            {count ? (<span
                aria-hidden={"true"}
                className={
                  "pointer-events-none absolute -top-0.5 -right-0.5 flex"
                }
              >
                <Counter value={count} variant={"accent"} size={"xs"} />
              </span>) : (null)}
            {accessibility.mirror}
            {disabledProps.mirror}
          </span>
        </Tooltip>
      );
    });
    reactToolbarPrimitives = toModuleNamespace(
      load_react(),
      1,
    );
    ToolbarPrimitivesMediaQuery = "(pointer: coarse)";
    ToolbarPrimitivesLabel = "(pointer: coarse) and (max-width: 599px)";
  };
}
