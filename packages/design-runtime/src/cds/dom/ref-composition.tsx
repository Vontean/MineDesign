import { useUiLocale } from '../../ui-locale.ts';
import type { ActivityBoundaryProps } from "../../contracts/ui";
import type * as React from "react";
/** Restored application module; prepare first, initialize in original order. */
import { asElement, initializeHooksStableCallback, initializeStableCallbackReact, useStableCallback } from "../hooks/stable-callback";
import { load_react, load_react_jsx_runtime } from "../../dependencies";
import { initializeOnce, toModuleNamespace } from "../../module-helpers";

var reactDomRefComposition: typeof React;
var initializeDomRefComposition: () => void;
var HttpWwwW3Org1999XhtmlValue: string;
var HttpWwwW3Org2000SvgValue: string;
var initializeXmlNamespaceUris: () => void;
var reactForActivityBoundary: typeof React;
var jsxDomRefComposition: typeof import("react/jsx-runtime");
var ActivityVisibilityContext: React.Context<Set<Element> | null>;
var initializeActivityVisibilityContext: () => void;
var DomRefCompositionEventRestoreAllState: {
  event: Event;
  restoreAll: () => void;
} | null;
var DomRefCompositionDragendDropPointerdownValues: string[];
var initializeDomEventRestoreState: () => void;
var reactForDisabledContext: typeof React;
var jsxForDisabledContext: typeof import("react/jsx-runtime");
var DisabledContext: React.Context<boolean>;
var initializeDisabledContext: () => void;
function assignRef<Element>(
  ref: React.Ref<Element> | undefined,
  node: Element | null,
): void | (() => void) {
  if (typeof ref == "function") return ref(node);
  ref && (ref.current = node);
}
function mergeRefs<Element>(
  ...refs: (React.Ref<Element> | undefined)[]
): React.RefCallback<Element> {
  return (node) => {
    let cleanups = refs.map((ref) => assignRef(ref, node));
    if (cleanups.some((cleanup) => typeof cleanup == "function"))
      return () => {
        refs.forEach((ref, refIndex) => {
          let cleanup = cleanups[refIndex];
          typeof cleanup == "function" ? cleanup() : assignRef(ref, null);
        });
      };
  };
}
function useMergedRefs<Element>(
  firstRef?: React.Ref<Element>,
  secondRef?: React.Ref<Element>,
  thirdRef?: React.Ref<Element>,
): React.RefCallback<Element> {
  return (0, reactDomRefComposition.useMemo)(
    () => mergeRefs(firstRef, secondRef, thirdRef),
    [firstRef, secondRef, thirdRef],
  );
}
function useEventRef<Element>(
  refCallback: React.RefCallback<Element>,
  extraRef?: React.Ref<Element>,
): React.RefCallback<Element> {
  let stableCallback = useStableCallback(refCallback);
  return useStableCallback((node) =>
    mergeRefs(stableCallback, extraRef)(node),
  );
}
function elementNamespace(
  domNode: Node | null | undefined,
): string | null | undefined {
  let node = domNode;
  return node?.nodeType === 1 ? (node as Element).namespaceURI : undefined;
}
function isHtmlElement(node: Node | null | undefined): node is HTMLElement {
  return elementNamespace(node) === HttpWwwW3Org1999XhtmlValue;
}
function isSvgElement(node: Node | null | undefined): node is SVGElement {
  return elementNamespace(node) === HttpWwwW3Org2000SvgValue;
}
function hasDisplayNoneAncestor(element: Element): boolean {
  if (!element.isConnected) return false;
  for (
    let ancestor: Element | null = element;
    ancestor !== null;
    ancestor = ancestor.parentElement
  )
    if (
      isHtmlElement(ancestor) &&
      (ancestor as HTMLElement).style.display === "none"
    )
      return true;
  return false;
}
function hasOpenChildOverlay(element: Element): boolean {
  for (let child of element.children)
    if (child.hasAttribute("data-open")) return true;
  return false;
}
function ActivityBoundary({
  actionsRef: actionsRef,
  children: children,
}: ActivityBoundaryProps): React.ReactElement {
  useUiLocale();
  let [hiddenElements] = (0, reactForActivityBoundary.useState)(
      () => new Set<Element>(),
    ),
    hadHiddenOverlayRef = (0, reactForActivityBoundary.useRef)(false);
  (0, reactForActivityBoundary.useEffect)(
    () => (
      hadHiddenOverlayRef.current &&
        ((hadHiddenOverlayRef.current = false), actionsRef.current?.close?.()),
      () => {
        hadHiddenOverlayRef.current = false;
        for (let element of hiddenElements)
          hasDisplayNoneAncestor(element) &&
            hasOpenChildOverlay(element) &&
            (hadHiddenOverlayRef.current = true);
      }
    ),
    [actionsRef, hiddenElements],
  );
  return (
    <ActivityVisibilityContext.Provider value={hiddenElements}>
      {children}
    </ActivityVisibilityContext.Provider>
  );
}
function useCloseOnHiddenActivity(
  enabled: boolean | undefined,
): React.RefObject<HTMLElement | null> {
  let hiddenElements = (0, reactForActivityBoundary.useContext)(
      ActivityVisibilityContext,
    ),
    elementRef = (0, reactForActivityBoundary.useRef)<HTMLElement | null>(null);
  (0, reactForActivityBoundary.useEffect)(() => {
    let current = elementRef.current;
    if (!(!enabled || hiddenElements === null || current === null)) {
      hiddenElements.add(current);
      return () => {
        hiddenElements.delete(current);
      };
    }
  }, [hiddenElements, enabled]);
  return elementRef;
}
function companionModalCatcher(
  container: Element,
  target: EventTarget | null,
): HTMLElement | null {
  let candidate = asElement(target);
  return (
    candidate === null || candidate.parentElement !== container
      ? null
      : candidate.childElementCount === 0 &&
          (candidate as HTMLElement).style.position === "fixed"
        ? candidate
        : null
  ) as HTMLElement | null;
}
function shouldPreventModalCatcherFocus(
  container: Element,
  target: EventTarget | null,
): boolean {
  let catcher = companionModalCatcher(container, target);
  if (catcher === null) return false;
  let activeElement = asElement(catcher.ownerDocument.activeElement),
    scope = container.parentElement ?? container;
  return activeElement === null || !scope.contains(activeElement);
}
function preventModalCatcherPointerFocus(
  event: React.PointerEvent<HTMLElement>,
): void {
  event.pointerType !== "touch" &&
    shouldPreventModalCatcherFocus(event.currentTarget, event.target) &&
    event.preventDefault();
}
function preventModalCatcherMouseFocus(
  event: React.MouseEvent<HTMLElement>,
): void {
  shouldPreventModalCatcherFocus(event.currentTarget, event.target) &&
    event.preventDefault();
}
function handleModalCatcherDismissal(
  event: React.SyntheticEvent<HTMLElement>,
): void {
  let currentTarget = event.currentTarget,
    catcher: HTMLElement | null = null;
  for (let child of currentTarget.children)
    if (
      ((catcher = companionModalCatcher(currentTarget, child)), catcher !== null)
    )
      break;
  if (catcher === null) return;
  let catcherElement = catcher;
  if (
    DomRefCompositionEventRestoreAllState !== null &&
    DomRefCompositionEventRestoreAllState.event === event.nativeEvent
  ) {
    catcherElement.style.pointerEvents = "none";
    let restoreAll = DomRefCompositionEventRestoreAllState.restoreAll;
    DomRefCompositionEventRestoreAllState.restoreAll = () => {
      catcherElement.style.pointerEvents = "";
      restoreAll();
    };
    return;
  }
  DomRefCompositionEventRestoreAllState?.restoreAll();
  catcherElement.style.pointerEvents = "none";
  let ownerDocument = catcherElement.ownerDocument,
    state = {
      event: event.nativeEvent,
      restoreAll: () => {
        catcherElement.style.pointerEvents = "";
        for (let eventName of DomRefCompositionDragendDropPointerdownValues)
          ownerDocument.removeEventListener(eventName, handleOutsideEvent, true);
        DomRefCompositionEventRestoreAllState === state &&
          (DomRefCompositionEventRestoreAllState = null);
      },
    },
    handleOutsideEvent = () => state.restoreAll();
  DomRefCompositionEventRestoreAllState = state;
  for (let eventName of DomRefCompositionDragendDropPointerdownValues)
    ownerDocument.addEventListener(eventName, handleOutsideEvent, true);
}
export {
  ActivityBoundary,
  ActivityVisibilityContext,
  assignRef,
  companionModalCatcher,
  DisabledContext,
  DomRefCompositionDragendDropPointerdownValues,
  DomRefCompositionEventRestoreAllState,
  elementNamespace,
  handleModalCatcherDismissal,
  hasDisplayNoneAncestor,
  hasOpenChildOverlay,
  HttpWwwW3Org1999XhtmlValue,
  HttpWwwW3Org2000SvgValue,
  initializeDomRefComposition,
  initializeXmlNamespaceUris,
  initializeActivityVisibilityContext,
  initializeDomEventRestoreState,
  initializeDisabledContext,
  isHtmlElement,
  isSvgElement,
  jsxDomRefComposition,
  jsxForDisabledContext,
  mergeRefs,
  preventModalCatcherMouseFocus,
  preventModalCatcherPointerFocus,
  reactDomRefComposition,
  reactForActivityBoundary,
  reactForDisabledContext,
  shouldPreventModalCatcherFocus,
  useCloseOnHiddenActivity,
  useEventRef,
  useMergedRefs,
};
export function installCdsDomRefComposition(): () => void {
  return () => {
    initializeDomRefComposition = initializeOnce(() => {
      initializeStableCallbackReact();
      reactDomRefComposition = toModuleNamespace(
        load_react(),
      );
    });
    initializeXmlNamespaceUris = initializeOnce(() => {
      HttpWwwW3Org1999XhtmlValue = "http://www.w3.org/1999/xhtml";
      HttpWwwW3Org2000SvgValue = "http://www.w3.org/2000/svg";
    });
    initializeActivityVisibilityContext = initializeOnce(() => {
      "use client";

      initializeXmlNamespaceUris();
      reactForActivityBoundary = toModuleNamespace(
        load_react(),
      );
      jsxDomRefComposition = toModuleNamespace(
        load_react_jsx_runtime(),
      );
      ActivityVisibilityContext = (0,
      reactForActivityBoundary.createContext)<Set<Element> | null>(null);
    });
    initializeDomEventRestoreState = initializeOnce(() => {
      initializeHooksStableCallback();
      DomRefCompositionEventRestoreAllState = null;
      DomRefCompositionDragendDropPointerdownValues = [
        "dragend",
        "drop",
        "pointerdown",
      ];
    });
    initializeDisabledContext = initializeOnce(() => {
      "use client";

      reactForDisabledContext = toModuleNamespace(
        load_react(),
      );
      jsxForDisabledContext = toModuleNamespace(
        load_react_jsx_runtime(),
      );
      DisabledContext = (0, reactForDisabledContext.createContext)(false);
    });
  };
}
