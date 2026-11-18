import { uiMessage } from '@minedesign/contracts/ui-messages';
/** Restored application module; prepare first, initialize in original order. */
import {
  type Dynamic,
} from "../../runtime-types";
import { initializeComponentsCounter_6, LinkElement, TextLinkIcon } from "./counter";
import { initializeComponentsIcon_2 } from "./icon";
import { DialogDialogCurrentState } from "../dialog/dialog";
import { DisabledContext, initializeDomRefComposition_5 } from "../dom/ref-composition";
import { initializeHooksLayoutEffect, useIsomorphicLayoutEffect } from "../hooks/layout-effect";
import { asElement } from "../hooks/stable-callback";
import { getLinkRel, initializeCdsLinks, initializeCdsLinks_2, initializeLinkRouter, isBlockedHref, isNewBrowsingContext, sanitizeHref } from "../links";
import { initializeSheetsKeyboardViewport, isTextInputElement, useKeyboardViewport } from "../sheets/keyboard-viewport";
import { initializeSheetsStyles_2, useLabel } from "../sheets/styles";
import { cn, initializeClassNames } from "../theme/class-names";
import { initializeNpm_clsx_xh, load_react, load_react_jsx_runtime, npm_clsx_Ea } from "../../dependencies";
import { initializeOnce, toModuleNamespace } from "../../module-helpers";

import { set_DialogDialogCurrentState } from "../dialog/dialog";
var reactComponentsTextLink: Dynamic;
var jsxComponentsTextLink: Dynamic;
var ComponentsTextLinkClassNames: Dynamic;
var ComponentsTextLinkClassNames_2: Dynamic;
var ComponentsTextLinkCss: Dynamic;
var ComponentsTextLinkClassNames_3: Dynamic;
var ComponentsTextLinkClassNames_4: Dynamic;
var ComponentsTextLinkCss_2: Dynamic;
var ComponentsTextLinkClassNamesAlias: Dynamic;
var TextLink: Dynamic;
var initializeComponentsTextLink: Dynamic;
var reactComponentsTextLink_2: Dynamic;
var ComponentsTextLinkConstant: Dynamic;
var ComponentsTextLinkCss_3: Dynamic;
var ComponentsTextLinkLimit: Dynamic;
var ComponentsTextLinkTopMaxHeightMinHeightValues: Dynamic;
var ComponentsTextLinkBottomInsetTranslateValues: Dynamic;
var ComponentsTextLinkTopValues: Dynamic;
var initializeComponentsTextLink_2: Dynamic;
function readStyleProperty(style?: Dynamic, property?: Dynamic): Dynamic {
  return {
    value: style.getPropertyValue(property),
    priority: style.getPropertyPriority(property),
  };
}
function isOwnedImportantStyle(
  style?: Dynamic,
  property?: Dynamic,
  writtenValue?: Dynamic,
): Dynamic {
  return (
    writtenValue !== undefined &&
    style.getPropertyPriority(property) === "important" &&
    style.getPropertyValue(property) === writtenValue
  );
}
function restoreOwnedDialogStyles(owned?: Dynamic): Dynamic {
  let style: Dynamic = owned.node.style;
  for (let property of ComponentsTextLinkTopMaxHeightMinHeightValues as Dynamic)
    if (isOwnedImportantStyle(style, property, owned.written[property])) {
      let { value: baselineValue, priority: baselinePriority }: Dynamic =
        owned.baseline[property];
      style.setProperty(property, baselineValue, baselinePriority);
    }
}
function useDialogKeyboardViewport(isEnabled?: Dynamic): Dynamic {
  let [dialogNode, setDialogNode]: Dynamic = (0, reactComponentsTextLink_2.useState)(
      null,
    ),
    [viewport, setViewport]: Dynamic = (0, reactComponentsTextLink_2.useState)(null),
    subscribeToFocus: Dynamic = (0, reactComponentsTextLink_2.useCallback)(
      (onChange?: Dynamic): Dynamic =>
        !isEnabled || dialogNode === null
          ? (): Dynamic => {}
          : (dialogNode.addEventListener("focusin", onChange),
            dialogNode.addEventListener("focusout", onChange),
            (): Dynamic => {
              dialogNode.removeEventListener("focusin", onChange);
              dialogNode.removeEventListener("focusout", onChange);
            }),
      [isEnabled, dialogNode],
    ),
    getIsInputFocused: Dynamic = (0,
    reactComponentsTextLink_2.useCallback)((): Dynamic => {
      if (!isEnabled || dialogNode === null) return false;
      let activeElement: Dynamic = dialogNode.ownerDocument.activeElement;
      return (
        dialogNode.contains(activeElement) &&
        isTextInputElement(activeElement)
      );
    }, [isEnabled, dialogNode]),
    isInputFocused: Dynamic = (0, reactComponentsTextLink_2.useSyncExternalStore)(
      subscribeToFocus,
      getIsInputFocused,
      (): Dynamic => false,
    );
  useKeyboardViewport(
    isEnabled && (isInputFocused || viewport !== null),
    setViewport,
  );
  let keyboardFrame: Dynamic = (0, reactComponentsTextLink_2.useMemo)(
      (): Dynamic => dialogKeyboardFrame(viewport),
      [viewport],
    ),
    ownedStylesRef: Dynamic = (0, reactComponentsTextLink_2.useRef)(null);
  useIsomorphicLayoutEffect((): Dynamic => {
    let staleOwned: Dynamic = ownedStylesRef.current;
    staleOwned !== null &&
      (staleOwned.node !== dialogNode || keyboardFrame === undefined) &&
      (restoreOwnedDialogStyles(staleOwned), (ownedStylesRef.current = null));
    if (dialogNode === null || keyboardFrame === undefined) return;
    let style: Dynamic = dialogNode.style,
      targetStyles: Dynamic = {
        top: keyboardFrame.top,
        "max-height": keyboardFrame.maxHeight,
        "min-height": "0px",
      },
      owned: Dynamic = ownedStylesRef.current;
    if (owned === null) {
      if (
        ComponentsTextLinkTopValues.some(
          (property?: Dynamic): Dynamic =>
            style.getPropertyValue(property) !== "",
        )
      )
        return;
      owned = {
        node: dialogNode,
        baseline: {
          top: readStyleProperty(style, "top"),
          "max-height": readStyleProperty(style, "max-height"),
          "min-height": readStyleProperty(style, "min-height"),
        },
        intended: {},
        written: {},
        cap: "",
      };
      ownedStylesRef.current = owned;
    } else {
      let hasForeignPositioning: Dynamic =
        ComponentsTextLinkBottomInsetTranslateValues.some(
          (property?: Dynamic): Dynamic =>
            style.getPropertyValue(property) !== "",
        );
      for (let property of ComponentsTextLinkTopMaxHeightMinHeightValues as Dynamic)
        if (
          !isOwnedImportantStyle(style, property, owned.written[property])
        ) {
          let currentValue: Dynamic = readStyleProperty(style, property);
          owned.baseline[property] = currentValue;
          property === "top" && currentValue.value !== "" && (hasForeignPositioning = true);
        }
      if (hasForeignPositioning) {
        restoreOwnedDialogStyles(owned);
        ownedStylesRef.current = null;
        return;
      }
    }
    for (let property of ComponentsTextLinkTopMaxHeightMinHeightValues as Dynamic)
      (owned.intended[property] !== targetStyles[property] ||
        !isOwnedImportantStyle(style, property, owned.written[property])) &&
        (style.setProperty(property, targetStyles[property], "important"),
        (owned.intended[property] = targetStyles[property]),
        (owned.written[property] = style.getPropertyValue(property)));
    if (owned.cap !== keyboardFrame.maxHeight) {
      owned.cap = keyboardFrame.maxHeight;
      let activeElement: Dynamic = dialogNode.ownerDocument.activeElement,
        defaultView: Dynamic = dialogNode.ownerDocument.defaultView;
      defaultView !== null &&
        activeElement instanceof defaultView.HTMLElement &&
        activeElement !== dialogNode &&
        dialogNode.contains(activeElement) &&
        scrollDialogInputIntoView(dialogNode, activeElement);
    }
  });
  useIsomorphicLayoutEffect(
    (): Dynamic => (): Dynamic => {
      ownedStylesRef.current !== null &&
        (restoreOwnedDialogStyles(ownedStylesRef.current), (ownedStylesRef.current = null));
    },
    [],
  );
  return setDialogNode;
}
function dialogKeyboardFrame(viewport?: Dynamic): Dynamic {
  if (!(viewport === null || viewport.visible < ComponentsTextLinkLimit))
    return {
      top: `calc(${viewport.offset + (viewport.visible + ComponentsTextLinkConstant) / 2}px - ${ComponentsTextLinkCss_3} / 2)`,
      maxHeight: `calc(${viewport.visible - ComponentsTextLinkConstant}px - ${ComponentsTextLinkCss_3})`,
    };
}
function scrollDialogInputIntoView(
  element?: Dynamic,
  focusedElement?: Dynamic,
): Dynamic {
  let defaultView: Dynamic = element.ownerDocument.defaultView;
  if (defaultView !== null)
    for (
      let parentElement: Dynamic = focusedElement.parentElement;
      parentElement !== null;
      parentElement =
        parentElement === element ? null : parentElement.parentElement
    ) {
      if (parentElement.scrollHeight <= parentElement.clientHeight) continue;
      let { overflowY: style }: Dynamic =
        defaultView.getComputedStyle(parentElement);
      if (style !== "auto" && style !== "scroll") continue;
      let containerBounds: Dynamic = parentElement.getBoundingClientRect(),
        inputBounds: Dynamic = focusedElement.getBoundingClientRect();
      inputBounds.bottom > containerBounds.bottom
        ? (parentElement.scrollTop +=
            inputBounds.bottom - containerBounds.bottom + ComponentsTextLinkConstant)
        : inputBounds.top < containerBounds.top &&
          (parentElement.scrollTop -=
            containerBounds.top - inputBounds.top + ComponentsTextLinkConstant);
    }
}
function preventDialogMouseSelection(event?: Dynamic): Dynamic {
  event.preventDefault();
}
function preserveDialogFocus(event?: Dynamic): Dynamic {
  if (event.button !== 0) {
    event.preventDefault();
    return;
  }
  let currentTarget: Dynamic = event.currentTarget,
    parentElement: Dynamic = currentTarget.parentElement,
    ownerDocument: Dynamic = currentTarget.ownerDocument,
    focusedElement: Dynamic = asElement(ownerDocument.activeElement);
  if (
    parentElement === null ||
    focusedElement === null ||
    !parentElement.contains(focusedElement)
  )
    return;
  DialogDialogCurrentState?.abort();
  let abortController: Dynamic = new (ownerDocument.defaultView?.AbortController ??
    AbortController)();
  set_DialogDialogCurrentState(abortController);
  let { signal: signal }: Dynamic = abortController;
  signal.addEventListener(
    "abort",
    (): Dynamic => {
      DialogDialogCurrentState === abortController &&
        (set_DialogDialogCurrentState(null));
    },
    {
      once: true,
    },
  );
  ownerDocument.addEventListener("mousedown", (): Dynamic => abortController.abort(), {
    capture: true,
    once: true,
    signal: signal,
  });
  ownerDocument.addEventListener(
    "mouseup",
    (mouseUpEvent?: Dynamic): Dynamic => {
      abortController.abort();
      mouseUpEvent.target !== currentTarget &&
        ownerDocument.activeElement === ownerDocument.body &&
        focusedElement.isConnected &&
        focusedElement.focus({
          preventScroll: true,
        });
    },
    {
      capture: true,
      once: true,
      signal: signal,
    },
  );
}
export {
  ComponentsTextLinkBottomInsetTranslateValues,
  ComponentsTextLinkClassNames,
  ComponentsTextLinkClassNames_2,
  ComponentsTextLinkClassNames_3,
  ComponentsTextLinkClassNames_4,
  ComponentsTextLinkClassNamesAlias,
  ComponentsTextLinkConstant,
  ComponentsTextLinkCss,
  ComponentsTextLinkCss_2,
  ComponentsTextLinkCss_3,
  ComponentsTextLinkLimit,
  ComponentsTextLinkTopMaxHeightMinHeightValues,
  ComponentsTextLinkTopValues,
  dialogKeyboardFrame,
  initializeComponentsTextLink,
  initializeComponentsTextLink_2,
  isOwnedImportantStyle,
  jsxComponentsTextLink,
  preserveDialogFocus,
  preventDialogMouseSelection,
  reactComponentsTextLink,
  reactComponentsTextLink_2,
  readStyleProperty,
  restoreOwnedDialogStyles,
  scrollDialogInputIntoView,
  TextLink,
  useDialogKeyboardViewport,
};
export function installCdsComponentsTextLink(): () => void {
  return () => {
    initializeComponentsTextLink = initializeOnce((): Dynamic => {
      "use client";

      initializeClassNames();
      initializeSheetsStyles_2();
      initializeCdsLinks();
      initializeCdsLinks_2();
      initializeLinkRouter();
      initializeDomRefComposition_5();
      initializeComponentsIcon_2();
      initializeComponentsCounter_6();
      reactComponentsTextLink = toModuleNamespace(
        load_react(),
      );
      initializeNpm_clsx_xh();
      jsxComponentsTextLink = toModuleNamespace(
        load_react_jsx_runtime(),
      );
      ComponentsTextLinkClassNames = "cds-reset cds-text-link";
      ComponentsTextLinkClassNames_2 = "cds-text-link-underline";
      ComponentsTextLinkCss = `${ComponentsTextLinkClassNames} ${ComponentsTextLinkClassNames_2} inline`;
      ComponentsTextLinkClassNames_3 =
        "text-inherit [transition-property:text-decoration-color,box-shadow]";
      ComponentsTextLinkClassNames_4 =
        "[transition-property:text-decoration-color]";
      ComponentsTextLinkCss_2 = `${ComponentsTextLinkClassNames} inline-flex items-baseline`;
      ComponentsTextLinkClassNamesAlias = ComponentsTextLinkClassNames_2;
      TextLink = (0, reactComponentsTextLink.forwardRef)(
        (
          {
            className: className,
            children: children,
            icon: icon,
            iconPosition = "end",
            external: external,
            inheritColor: inheritColor,
            render: render,
            "aria-describedby": ariaDescribedby,
            ...props
          }: Dynamic,
          forwardedRef?: Dynamic,
        ): Dynamic => {
          let hasHref: Dynamic = "href" in props && props.href !== undefined,
            isDisabledContext: Dynamic = (0, reactComponentsTextLink.useContext)(
              DisabledContext,
            ),
            shouldInheritColor: Dynamic = inheritColor ?? isDisabledContext,
            externalMode: Dynamic =
              external &&
              !(
                hasHref &&
                !(0, reactComponentsTextLink.isValidElement)(render) &&
                isBlockedHref(
                  props.href,
                  sanitizeHref(props.href),
                )
              )
                ? external
                : false,
            target: Dynamic = hasHref
              ? (props.target ?? (externalMode ? "_blank" : undefined))
              : undefined,
            rel: Dynamic = hasHref
              ? (props.rel ??
                (externalMode &&
                target !== undefined &&
                !isNewBrowsingContext(target)
                  ? getLinkRel(props.href, target)
                  : undefined))
              : undefined,
            hintId: Dynamic = (0, reactComponentsTextLink.useId)(),
            newTabHint: Dynamic = (
              <span id={hintId} hidden={true} className={"sr-only"}>
                {useLabel("opensInNewTab", "(opens in new tab)")}
              </span>
            ),
            iconName: Dynamic =
              icon || (externalMode === "with-icon" ? "ArrowUpRight" : undefined),
            hasIcon: Dynamic = !!iconName,
            linkClassName: Dynamic = `${cn(hasIcon ? npm_clsx_Ea(ComponentsTextLinkCss_2, icon ? "gap-[0.25em]" : "gap-0") : ComponentsTextLinkCss, shouldInheritColor && ComponentsTextLinkClassNames_3)}`,
            linkBody: Dynamic = hasIcon ? (
              <jsxComponentsTextLink.Fragment>
                {iconPosition === "start" && (TextLinkIcon(iconName))}
                <span
                  className={npm_clsx_Ea(
                    ComponentsTextLinkClassNamesAlias,
                    shouldInheritColor && ComponentsTextLinkClassNames_4,
                  )}
                >
                  {children}
                </span>
                {iconPosition === "end" && (TextLinkIcon(iconName))}
                {externalMode && (newTabHint)}
              </jsxComponentsTextLink.Fragment>
            ) : externalMode ? (
              <jsxComponentsTextLink.Fragment>
                {children}
                {newTabHint}
              </jsxComponentsTextLink.Fragment>
            ) : (
              children
            ),
            bodyClassName: Dynamic = cn(
              linkClassName,
              "cursor-pointer",
              className,
            ),
            isDisabled: Dynamic = props.disabled ?? false;
          return (
            <LinkElement
              stamp={{
                "data-cds": "TextLink",
              }}
              forwardedRef={forwardedRef}
              linkInput={{
                href: hasHref ? props.href : undefined,
                routerOptions: hasHref ? props.routerOptions : undefined,
                target: target,
                rel: rel,
                download: hasHref ? props.download : undefined,
              }}
              render={render}
              body={linkBody}
              className={bodyClassName}
              actionClassName={cn(
                linkClassName,
                isDisabled ? "cursor-default opacity-disabled" : "cursor-pointer",
                className,
              )}
              actionDisabled={isDisabled}
              rest={{
                ...props,
                ...(shouldInheritColor && {
                  "data-inherit-color": "",
                }),
                "aria-describedby":
                  [ariaDescribedby, externalMode ? hintId : undefined]
                    .filter(Boolean)
                    .join(" ") || undefined,
              }}
            />
          );
        },
      );
      TextLink.displayName = "TextLink";
    });
    initializeComponentsTextLink_2 = initializeOnce(
      (): Dynamic => {
        "use client";

        initializeHooksLayoutEffect();
        initializeSheetsKeyboardViewport();
        reactComponentsTextLink_2 = toModuleNamespace(
          load_react(),
        );
        ComponentsTextLinkConstant = 8;
        ComponentsTextLinkCss_3 = `max(${ComponentsTextLinkConstant}px, env(safe-area-inset-bottom, 0px))`;
        ComponentsTextLinkLimit = 240;
        ComponentsTextLinkTopMaxHeightMinHeightValues = [
          "top",
          "max-height",
          "min-height",
        ];
        ComponentsTextLinkBottomInsetTranslateValues = [
          "bottom",
          "inset",
          "translate",
          "transform",
        ];
        ComponentsTextLinkTopValues = [
          "top",
          ...ComponentsTextLinkBottomInsetTranslateValues,
        ];
      },
    );
  };
}
