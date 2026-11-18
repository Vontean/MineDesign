import { uiMessage } from '@minedesign/contracts/ui-messages';
import { useUiLocale } from '../../ui-locale.ts';
/** Restored application module; prepare first, initialize in original order. */
import {
  type Dynamic,
} from "../../runtime-types";
import { sheetFrameHeight } from "../dom/inert";
import { initializeHooksLayoutEffect, useIsomorphicLayoutEffect } from "../hooks/layout-effect";
import { initializeOverlaysAndroidCloseWatcher, useAndroidCloseWatcher } from "../overlays/android-close-watcher";
import { initializeSheetsKeyboardViewport, isTextInputElement } from "./keyboard-viewport";
import { getSheetFixedPosition, getSheetFrameStyle, initializeSheetsLayout, SheetsLayoutConstant, SheetsLayoutConstant_2 as halfHeightFraction, SheetsLayoutCss, SheetsLayoutCss_3 } from "./layout";
import { getInertPropsValue, initializeSheetsPopupStack, SheetPopupBridgeContext, SheetPopupContext, SheetStackContext, useSheetState } from "./popup-stack";
import { CdsSheetControlHeldAttribute, CdsSheetPressedAttribute, coveredSheetAttribute, initializeSheetsPresentation, sheetContainsTextInput, sheetNeedsScrolling, sheetScrollAttribute } from "./presentation";
import { clearSheetTransition, initializeSheetsStyles, initializeSheetsStyles_2, useLabel, useSheetState_2 } from "./styles";
import { cn, initializeClassNames } from "../theme/class-names";
import { getSizeAttribute, initializeCdsRoot, useCdsWindow } from "../theme/root";
import { initializeNpm_clsx_xh, load_react, load_react_jsx_runtime, npm_clsx_Ea } from "../../dependencies";
import { initializeOnce, toModuleNamespace } from "../../module-helpers";

var reactSheetsChrome: Dynamic;
var jsxSheetsChrome: Dynamic;
var SheetChromeButton: Dynamic;
var SheetsChromeHandleTitleBarDismissButtonConfig: Dynamic;
var initializeSheetsChrome: Dynamic;
var reactSheetsChrome_2: Dynamic;
var initializeSheetsChrome_2: Dynamic;
var reactSheetsChrome_3: Dynamic;
var initializeSheetsChrome_3: Dynamic;
function SheetHandle({ drawPill = true }: Dynamic): Dynamic {
  useUiLocale();
  let handleProps: Dynamic = useSheetState_2();
  return (
    <div
      aria-hidden={true}
      data-cds-sheet-handle={""}
      {...handleProps}
      className={
        "flex min-h-8 shrink-0 touch-none items-center justify-center select-none"
      }
    >
      <div
        className={npm_clsx_Ea(
          "h-1 w-9 rounded-full bg-border",
          !drawPill && "opacity-0",
        )}
      />
    </div>
  );
}
function SheetHeading({ leading: leading, title: title }: Dynamic): Dynamic {
  useUiLocale();
  let headingProps: Dynamic = useSheetState_2(),
    hasLeading: Dynamic = leading != null && leading !== false;
  return !hasLeading &&
    !(title != null && title !== false && title !== "") ? null : (
    <div
      {...headingProps}
      className={
        "order-first flex min-h-control shrink-0 touch-none items-center gap-xs px-1.5 pb-1 select-none"
      }
    >
      {hasLeading && (<span className={"-me-2.5 shrink-0"}>{leading}</span>)}
      <span
        aria-hidden={true}
        className={npm_clsx_Ea(
          "min-w-0 flex-1 truncate text-start text-heading font-semibold text-primary",
          !hasLeading && "ps-2.5",
        )}
      >
        {title}
      </span>
    </div>
  );
}
function SheetBody({
  className: className,
  children: children,
}: Dynamic): Dynamic {
  useUiLocale();
  return (
    <div
      className={cn(
        "flex min-h-0 flex-auto flex-col",
        className,
      )}
    >
      {children}
    </div>
  );
}
function useSheetTextFocus(element?: Dynamic, sheetFrame?: Dynamic): Dynamic {
  let setDetent: Dynamic = sheetFrame?.setDetent,
    holdTextEntryFocus: Dynamic = sheetFrame?.holdTextEntryFocus;
  (0, reactSheetsChrome_2.useEffect)((): Dynamic => {
    if (element === null || setDetent === undefined || holdTextEntryFocus === undefined)
      return;
    let releaseTextEntryFocus: Dynamic = null,
      holdFocus: Dynamic = (): Dynamic => {
        releaseTextEntryFocus === null && (releaseTextEntryFocus = holdTextEntryFocus());
      },
      releaseFocus: Dynamic = (): Dynamic => {
        releaseTextEntryFocus?.();
        releaseTextEntryFocus = null;
      },
      pointerDownTime: Dynamic = 0,
      isTextEntryTarget: Dynamic = (target?: Dynamic): Dynamic => {
        if (!(target instanceof Element)) return false;
        if (isTextInputElement(target)) return true;
        let ancestor: Dynamic = target.closest(
          '[data-cds="TextInput"], label',
        );
        if (ancestor === null) return false;
        let labelControl: Dynamic =
          ancestor instanceof HTMLLabelElement ? ancestor.control : null;
        return (
          isTextInputElement(labelControl) ||
          ancestor.querySelector(
            'input:not([type=button],[type=checkbox],[type=radio],[type=range],[type=submit],[type=reset],[type=color],[type=file],[type=image],[type=hidden],[readonly]), textarea:not([readonly]), [contenteditable=""], [contenteditable="true"], [contenteditable="plaintext-only"]',
          ) !== null
        );
      },
      handlePointerDown: Dynamic = (event?: Dynamic): Dynamic => {
        isTextEntryTarget(event.target) && (pointerDownTime = event.timeStamp || Date.now());
      },
      handleFocusIn: Dynamic = (event?: Dynamic): Dynamic => {
        isTextInputElement(event.target) &&
          (holdFocus(),
          pointerDownTime > 0 &&
            (event.timeStamp || Date.now()) - pointerDownTime < 1e3 &&
            ((pointerDownTime = 0), setDetent("tall")));
      },
      handleClick: Dynamic = (event?: Dynamic): Dynamic => {
        pointerDownTime > 0 && isTextEntryTarget(event.target) && ((pointerDownTime = 0), setDetent("tall"));
      },
      handleFocusOut: Dynamic = (event?: Dynamic): Dynamic => {
        isTextInputElement(event.target) && releaseFocus();
      };
    element.addEventListener("pointerdown", handlePointerDown);
    element.addEventListener("focusin", handleFocusIn);
    element.addEventListener("focusout", handleFocusOut);
    element.addEventListener("click", handleClick);
    element.contains(element.ownerDocument.activeElement) &&
      isTextInputElement(element.ownerDocument.activeElement) &&
      holdFocus();
    return (): Dynamic => {
      element.removeEventListener("pointerdown", handlePointerDown);
      element.removeEventListener("focusin", handleFocusIn);
      element.removeEventListener("focusout", handleFocusOut);
      element.removeEventListener("click", handleClick);
      releaseFocus();
    };
  }, [element, setDetent, holdTextEntryFocus]);
}
function useCoveredSheetState(element?: Dynamic): Dynamic {
  (0, reactSheetsChrome_2.useEffect)((): Dynamic => {
    if (element === null) return;
    let ownerDocument: Dynamic = element.ownerDocument,
      heldControl: Dynamic = null,
      clearPressed: Dynamic = (): Dynamic => {
        element.removeAttribute(CdsSheetPressedAttribute);
        heldControl?.removeAttribute(CdsSheetControlHeldAttribute);
        heldControl = null;
        ownerDocument.removeEventListener("click", clearPressed, true);
        ownerDocument.removeEventListener("pointercancel", clearPressed, true);
        ownerDocument.removeEventListener("keydown", clearPressed, true);
      },
      markPressed: Dynamic = (): Dynamic => {
        ownerDocument.addEventListener("click", clearPressed, true);
        ownerDocument.addEventListener("pointercancel", clearPressed, true);
        ownerDocument.addEventListener("keydown", clearPressed, true);
        element.setAttribute(CdsSheetPressedAttribute, "");
        let control: Dynamic = element.querySelector(
          "[data-cds-sheet-control]",
        );
        control?.matches(":focus-visible, [data-highlighted]") &&
          ((heldControl = control),
          control.setAttribute(CdsSheetControlHeldAttribute, ""));
      };
    element.addEventListener("pointerdown", markPressed, true);
    return (): Dynamic => {
      element.removeEventListener("pointerdown", markPressed, true);
      clearPressed();
    };
  }, [element]);
}
function sheetMutationIsScrollOnly(
  mutations?: Dynamic,
  isGrowing?: Dynamic,
): Dynamic {
  if (!isGrowing) return false;
  let scrollSelector: Dynamic = `[${sheetScrollAttribute}]`,
    addedCount: Dynamic = 0,
    removedCount: Dynamic = 0;
  for (let mutation of mutations as Dynamic) {
    let target: Dynamic = mutation.target,
      mutationElement: Dynamic =
        target.nodeType === Node.ELEMENT_NODE ? target : target.parentElement;
    if (mutationElement === null || mutationElement.closest(scrollSelector) === null) return false;
    addedCount += mutation.addedNodes.length;
    removedCount += mutation.removedNodes.length;
  }
  return addedCount > 0 && removedCount > 0 && removedCount <= addedCount;
}
function sheetNaturalHeight(element?: Dynamic): Dynamic {
  let height: Dynamic = element.getBoundingClientRect().height,
    scrollAreas: Dynamic = Array.from(
      element.querySelectorAll(`[${sheetScrollAttribute}]`),
    );
  if (scrollAreas.length === 0) return height;
  let naturalHeight: Dynamic = height;
  for (let scrollArea of scrollAreas as Dynamic) {
    let firstElementChild: Dynamic = scrollArea.firstElementChild;
    for (
      ;
      firstElementChild !== null &&
      firstElementChild.getClientRects().length === 0;

    )
      firstElementChild = firstElementChild.nextElementSibling;
    let lastElementChild: Dynamic = scrollArea.lastElementChild;
    for (
      ;
      lastElementChild !== null &&
      lastElementChild.getClientRects().length === 0;

    )
      lastElementChild = lastElementChild.previousElementSibling;
    let computedStyle: Dynamic =
        element.ownerDocument.defaultView?.getComputedStyle(scrollArea),
      verticalPadding: Dynamic =
        parseFloat(computedStyle?.paddingTop ?? "0") +
        parseFloat(computedStyle?.paddingBottom ?? "0"),
      contentHeight: Dynamic =
        firstElementChild !== null && lastElementChild !== null
          ? lastElementChild.getBoundingClientRect().bottom -
            firstElementChild.getBoundingClientRect().top +
            verticalPadding
          : verticalPadding;
    naturalHeight += contentHeight - scrollArea.clientHeight;
  }
  return Math.max(0, naturalHeight);
}
function sheetScrollMetrics(sheetElement?: Dynamic): Dynamic {
  let visibleHeight: Dynamic = 0,
    overflowContentHeight: Dynamic = 0;
  for (let value of Array.from(
    sheetElement.querySelectorAll(`[${sheetScrollAttribute}]`),
  ) as Dynamic) {
    visibleHeight += value.clientHeight;
    value.scrollHeight > value.clientHeight + 1 &&
      (overflowContentHeight += value.scrollHeight);
  }
  return {
    visible: visibleHeight,
    overflowContent: overflowContentHeight,
  };
}
function sheetFocusedElementBottom(
  element?: Dynamic,
  focusedElement?: Dynamic,
): Dynamic {
  let defaultView: Dynamic = element.ownerDocument.defaultView;
  if (defaultView === null || focusedElement === null || !element.contains(focusedElement))
    return 0;
  let position: Dynamic = defaultView.getComputedStyle(focusedElement).position;
  if (position === "absolute" || position === "fixed") return 0;
  let overflow: Dynamic = 0;
  for (let currentElement: Dynamic = focusedElement; currentElement !== element; ) {
    let parentElement: Dynamic = currentElement.parentElement;
    if (parentElement === null) break;
    let style: Dynamic = defaultView.getComputedStyle(parentElement),
      parentContentBottom: Dynamic =
        parentElement.getBoundingClientRect().bottom -
        parseFloat(style.paddingBottom) -
        parseFloat(style.borderBottomWidth),
      marginBottom: Dynamic = parseFloat(
        defaultView.getComputedStyle(currentElement).marginBottom,
      );
    overflow += Math.max(
      0,
      currentElement.getBoundingClientRect().bottom +
        Math.max(0, marginBottom) -
        parentContentBottom +
        parentElement.scrollTop,
    );
    currentElement = parentElement;
  }
  return overflow;
}
function useSheetDismissal(
  element?: Dynamic,
  sheetFrame?: Dynamic,
  isCovered?: Dynamic,
): Dynamic {
  let isCoveredRef: Dynamic = (0, reactSheetsChrome_2.useRef)(isCovered);
  (0, reactSheetsChrome_2.useEffect)((): Dynamic => {
    isCoveredRef.current = isCovered;
  }, [isCovered]);
  let isOpen: Dynamic = sheetFrame?.open ?? false,
    dismiss: Dynamic = sheetFrame?.dismiss,
    treeId: Dynamic = sheetFrame?.treeId;
  (0, reactSheetsChrome_2.useEffect)((): Dynamic => {
    if (
      element === null ||
      !isOpen ||
      dismiss === undefined ||
      treeId === undefined
    )
      return;
    let ownerDocument: Dynamic = element.ownerDocument,
      defaultView: Dynamic = ownerDocument.defaultView,
      animationFrameId: Dynamic = 0,
      checkFocusLeft: Dynamic = (): Dynamic => {
        animationFrameId !== 0 ||
          defaultView === null ||
          (animationFrameId = defaultView.requestAnimationFrame((): Dynamic => {
            animationFrameId = 0;
            let activeElement: Dynamic = ownerDocument.activeElement;
            isCoveredRef.current ||
              activeElement === null ||
              activeElement === ownerDocument.body ||
              element.contains(activeElement) ||
              activeElement.closest(
                `[data-sheet-tree="${CSS.escape(treeId)}"]`,
              ) !== null ||
              activeElement.closest(
                '[aria-modal="true"], [data-cds="Dialog"]',
              ) === null ||
              dismiss();
          }));
      };
    element.addEventListener("focusout", checkFocusLeft);
    return (): Dynamic => {
      element.removeEventListener("focusout", checkFocusLeft);
      animationFrameId !== 0 && defaultView?.cancelAnimationFrame(animationFrameId);
    };
  }, [element, isOpen, dismiss, treeId]);
}
function sheetMeasuredFrame(
  sheetElement?: Dynamic,
  height?: Dynamic,
  grows?: Dynamic,
): Dynamic {
  let roundedHeight: Dynamic = Math.round(height),
    chromeHeight: Dynamic = height - sheetScrollMetrics(sheetElement).visible;
  return {
    contentHeight: roundedHeight,
    written: roundedHeight,
    chromeAtPin: chromeHeight,
    chromeSettled: chromeHeight,
    grows: grows,
  };
}
function useSheetPopupHost(): Dynamic {
  "use no memo";

  let sheetState: Dynamic = useSheetState(),
    [hasTextInput, setHasTextInput]: Dynamic = (0, reactSheetsChrome_3.useState)(false),
    hasTextInputRef: Dynamic = (0, reactSheetsChrome_3.useRef)(false),
    pinnedFrameRef: Dynamic = (0, reactSheetsChrome_3.useRef)(null),
    pinnedElementRef: Dynamic = (0, reactSheetsChrome_3.useRef)(null),
    updateHasTextInput: Dynamic = (0, reactSheetsChrome_3.useCallback)(
      (hasInput?: Dynamic): Dynamic => {
        hasTextInputRef.current = hasInput;
        setHasTextInput(hasInput);
      },
      [],
    ),
    [sheetElement, setSheetElement]: Dynamic = (0, reactSheetsChrome_3.useState)(null),
    { sheet: isSheet }: Dynamic = sheetState,
    sheetFrame: Dynamic = (0, reactSheetsChrome_3.useContext)(
      SheetPopupContext,
    ),
    parentStack: Dynamic = (0, reactSheetsChrome_3.useContext)(
      SheetStackContext,
    ),
    sheetElementRef: Dynamic = (0, reactSheetsChrome_3.useRef)(null),
    pinHeight: Dynamic = sheetFrame?.pinHeight,
    setSheetRef: Dynamic = (0, reactSheetsChrome_3.useCallback)(
      (element?: Dynamic): Dynamic => {
        sheetElementRef.current = isSheet ? element : null;
        setSheetElement(isSheet ? element : null);
        (element === null || !isSheet) && updateHasTextInput(false);
        if (element !== null && isSheet) {
          let containsTextInput: Dynamic = sheetContainsTextInput(element);
          if (containsTextInput) {
            let textEntryHeight: Dynamic = `min(${SheetsLayoutCss_3}, ${SheetsLayoutCss})`;
            element.style.minHeight = textEntryHeight;
            element.style.maxHeight = textEntryHeight;
          }
          updateHasTextInput(containsTextInput);
          let height: Dynamic = element.getBoundingClientRect().height,
            needsScrolling: Dynamic = sheetNeedsScrolling(element);
          pinHeight?.(height, needsScrolling);
          pinnedElementRef.current !== element &&
            ((pinnedElementRef.current = element),
            (pinnedFrameRef.current = sheetMeasuredFrame(element, height, needsScrolling)));
        }
      },
      [isSheet, pinHeight, updateHasTextInput],
    ),
    frameHeight: Dynamic = sheetFrame?.height;
  useIsomorphicLayoutEffect((): Dynamic => {
    let current: Dynamic = sheetElementRef.current;
    if (!isSheet || frameHeight !== undefined || current === null) return;
    clearSheetTransition(current);
    let height: Dynamic = current.getBoundingClientRect().height,
      needsScrolling: Dynamic = sheetNeedsScrolling(current);
    pinHeight?.(height, needsScrolling);
    pinnedElementRef.current = current;
    pinnedFrameRef.current = sheetMeasuredFrame(current, height, needsScrolling);
  }, [isSheet, frameHeight, pinHeight]);
  let repinHeight: Dynamic = sheetFrame?.repinHeight,
    drag: Dynamic = sheetFrame?.drag,
    isOpen: Dynamic = sheetFrame?.open ?? false;
  (0, reactSheetsChrome_3.useEffect)((): Dynamic => {
    if (!isSheet || !isOpen || sheetElement === null || repinHeight === undefined)
      return;
    let defaultView: Dynamic = sheetElement.ownerDocument.defaultView;
    if (
      defaultView === null ||
      typeof defaultView.MutationObserver === "undefined"
    )
      return;
    let animationFrameId: Dynamic = 0,
      isGrowing: Dynamic = false,
      shouldRepin: Dynamic = false,
      observedControl: Dynamic = null,
      resizeObserver: Dynamic =
        typeof defaultView.ResizeObserver === "undefined"
          ? null
          : new defaultView.ResizeObserver((): Dynamic => {
              scheduleMeasure();
            }),
      observeControl: Dynamic = (): Dynamic => {
        let element: Dynamic = sheetElement.querySelector(
          "[data-cds-sheet-control]",
        );
        element === observedControl ||
          resizeObserver === null ||
          (observedControl !== null && resizeObserver.unobserve(observedControl),
          (observedControl = element),
          element !== null && resizeObserver.observe(element));
      },
      measureAndRepin: Dynamic = (): Dynamic => {
        animationFrameId = 0;
        if (drag !== undefined && drag.get() !== null) {
          animationFrameId = defaultView.requestAnimationFrame(measureAndRepin);
          return;
        }
        observeControl();
        if (sheetContainsTextInput(sheetElement)) {
          hasTextInputRef.current ||
            (updateHasTextInput(true),
            repinHeight(
              defaultView.innerHeight * halfHeightFraction,
              true,
            ));
          shouldRepin = false;
          return;
        }
        let focusedBottom: Dynamic = sheetFocusedElementBottom(sheetElement, observedControl),
          scrollMetrics: Dynamic = sheetScrollMetrics(sheetElement),
          chromeHeight: Dynamic =
            sheetElement.getBoundingClientRect().height + focusedBottom - scrollMetrics.visible,
          maxHeight: Dynamic =
            defaultView.innerHeight * SheetsLayoutConstant;
        if (shouldRepin) {
          shouldRepin = false;
          let contentHeight: Dynamic = Math.round(
            Math.max(
              sheetNaturalHeight(sheetElement) + focusedBottom,
              scrollMetrics.overflowContent > 0
                ? chromeHeight + scrollMetrics.overflowContent
                : 0,
            ),
          );
          isGrowing = contentHeight > maxHeight;
          pinnedFrameRef.current = {
            contentHeight: contentHeight,
            written: Math.min(contentHeight, maxHeight),
            chromeAtPin: chromeHeight,
            chromeSettled: chromeHeight,
            grows: isGrowing,
          };
          repinHeight(Math.min(contentHeight, maxHeight), isGrowing);
          return;
        }
        let current: Dynamic = pinnedFrameRef.current;
        if (current === null || Math.abs(chromeHeight - current.chromeSettled) < 1)
          return;
        current.chromeSettled = chromeHeight;
        if (Math.abs(chromeHeight - current.chromeAtPin) < 1) {
          repinHeight(current.written, current.grows);
          return;
        }
        let grownContentHeight: Dynamic =
          current.contentHeight + chromeHeight - current.chromeAtPin;
        repinHeight(
          Math.min(grownContentHeight, maxHeight),
          grownContentHeight > maxHeight || current.grows,
        );
      },
      scheduleMeasure: Dynamic = (): Dynamic => {
        animationFrameId === 0 && (animationFrameId = defaultView.requestAnimationFrame(measureAndRepin));
      };
    observeControl();
    let mutationObserver: Dynamic = new defaultView.MutationObserver(
      (mutations?: Dynamic): Dynamic => {
        (animationFrameId !== 0 && shouldRepin) ||
          sheetMutationIsScrollOnly(mutations, isGrowing) ||
          ((shouldRepin = true), scheduleMeasure());
      },
    );
    mutationObserver.observe(sheetElement, {
      childList: true,
      subtree: true,
    });
    return (): Dynamic => {
      mutationObserver.disconnect();
      resizeObserver?.disconnect();
      animationFrameId !== 0 && defaultView.cancelAnimationFrame(animationFrameId);
      pinnedElementRef.current === sheetElement &&
        ((pinnedFrameRef.current = null), (pinnedElementRef.current = null));
    };
  }, [isSheet, isOpen, sheetElement, repinHeight, drag, updateHasTextInput]);
  useSheetTextFocus(sheetElement, sheetFrame);
  useCoveredSheetState(sheetElement);
  useSheetDismissal(sheetElement, sheetFrame, sheetState.covered);
  useAndroidCloseWatcher(
    isSheet && (sheetFrame?.open ?? false),
    sheetFrame?.dismiss,
  );
  let bridgeCover: Dynamic = (0, reactSheetsChrome_3.useContext)(
      SheetPopupBridgeContext,
    ),
    cdsWindow: Dynamic = useCdsWindow(),
    frameHeightPx: Dynamic = sheetFrameHeight(sheetFrame, cdsWindow),
    stack: Dynamic = (0, reactSheetsChrome_3.useMemo)(
      (): Dynamic =>
        isSheet && bridgeCover !== null
          ? {
              depth: sheetState.depth,
              frameHeight: frameHeightPx,
              cover: bridgeCover,
            }
          : null,
      [isSheet, bridgeCover, sheetState.depth, frameHeightPx],
    ),
    isCovered: Dynamic = isSheet && sheetState.covered,
    isInert: Dynamic = isSheet && sheetState.inert,
    frameStyle: Dynamic = isSheet
      ? getSheetFrameStyle(sheetFrame, {
          floor: hasTextInput ? "half" : "content",
          parentFrameHeight: parentStack?.frameHeight,
        })
      : undefined;
  return {
    sheet: isSheet,
    concealed: false,
    chrome: SheetsChromeHandleTitleBarDismissButtonConfig,
    ref: setSheetRef,
    style: frameStyle,
    positionerStyle: isSheet
      ? getSheetFixedPosition(sheetFrame)
      : undefined,
    attrs: {
      ...(isSheet ? getSizeAttribute("lg") : {}),
      "data-presentation": isSheet ? "sheet" : undefined,
      "data-sheet-tree": isSheet ? sheetFrame?.treeId : undefined,
      [coveredSheetAttribute]: isCovered ? "" : undefined,
      "data-cds-sheet-depth": isSheet ? String(sheetState.depth) : undefined,
      "data-cds-sheet-detent": isSheet ? sheetFrame?.detent : undefined,
      "aria-hidden": isInert ? "true" : undefined,
      ...(isInert ? getInertPropsValue : {}),
    },
    frame: sheetFrame,
    state: sheetState,
    stack: stack,
  };
}
function MobileSheetsSheetPopupHost({
  children: children,
}: Dynamic): Dynamic {
  return children(useSheetPopupHost());
}
export {
  initializeSheetsChrome,
  initializeSheetsChrome_2,
  initializeSheetsChrome_3,
  jsxSheetsChrome,
  MobileSheetsSheetPopupHost,
  reactSheetsChrome,
  reactSheetsChrome_2,
  reactSheetsChrome_3,
  SheetBody,
  SheetChromeButton,
  sheetFocusedElementBottom,
  SheetHandle,
  SheetHeading,
  sheetMeasuredFrame,
  sheetMutationIsScrollOnly,
  sheetNaturalHeight,
  SheetsChromeHandleTitleBarDismissButtonConfig,
  sheetScrollMetrics,
  useCoveredSheetState,
  useSheetDismissal,
  useSheetPopupHost,
  useSheetTextFocus,
};
export function installCdsSheetsChrome(): () => void {
  return () => {
    initializeSheetsChrome = initializeOnce((): Dynamic => {
      "use client";

      initializeClassNames();
      initializeSheetsStyles_2();
      initializeSheetsStyles();
      reactSheetsChrome = toModuleNamespace(
        load_react(),
      );
      initializeNpm_clsx_xh();
      jsxSheetsChrome = toModuleNamespace(
        load_react_jsx_runtime(),
      );
      SheetChromeButton = (0, reactSheetsChrome.forwardRef)(function (
        {
          as = "button",
          onDismiss: onDismiss,
          label: label,
          className: className,
          ...props
        }: Dynamic,
        forwardedRef?: Dynamic,
      ): Dynamic {
        let defaultLabel: Dynamic = useLabel("close", "Close"),
          resolvedLabel: Dynamic = label ?? defaultLabel;
        return (() => {
          const _Component = as;
          return (
            <_Component
              ref={forwardedRef}
              type={"button"}
              data-cds-sheet-control={""}
              onClick={onDismiss}
              {...props}
              className={cn(
                "cds-reset mx-1 mb-1 block shrink-0 rounded px-2 text-start text-body font-normal text-primary outline-none select-none focus-visible:bg-fill-ghost-hover focus-visible:outline-hidden [&:not(:focus-visible):not([data-cds-sheet-control-held])]:sr-only",
                "min-h-control",
                className,
              )}
            >
              {resolvedLabel}
            </_Component>
          );
        })();
      });
      SheetsChromeHandleTitleBarDismissButtonConfig = {
        Handle: SheetHandle,
        TitleBar: SheetHeading,
        DismissButton: SheetChromeButton,
        Body: SheetBody,
      };
    });
    initializeSheetsChrome_2 = initializeOnce((): Dynamic => {
      "use client";

      initializeSheetsKeyboardViewport();
      initializeSheetsPresentation();
      reactSheetsChrome_2 = toModuleNamespace(
        load_react(),
      );
    });
    initializeSheetsChrome_3 = initializeOnce((): Dynamic => {
      "use client";

      initializeHooksLayoutEffect();
      initializeCdsRoot();
      initializeOverlaysAndroidCloseWatcher();
      initializeSheetsLayout();
      initializeSheetsPresentation();
      initializeSheetsPopupStack();
      initializeSheetsStyles();
      initializeSheetsChrome();
      initializeSheetsChrome_2();
      reactSheetsChrome_3 = toModuleNamespace(
        load_react(),
      );
    });
  };
}
