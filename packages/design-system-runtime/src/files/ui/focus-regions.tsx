/** Restored application module; prepare first, initialize in original order. */
import type * as React from "react";
import type {
  FocusRegion,
  LiveFocusRegion,
  FocusRegionOptions,
  FocusRegionController,
} from "../../contracts/application";
import { loadReactNamespace } from "../../dependencies";
import { toModuleNamespace } from "../../module-helpers";
import { announceLiveMessage } from "../../ui/announcements";
import { formatCommandShortcut } from "../../ui/platform-shortcuts";
import { hasOpenOverlay } from "../../ui/property-focus";

var reactFocusRegions: typeof React;
var FOCUS_REGION_FOCUSABLE_SELECTOR: string;
var FOCUS_REGION_HINT_INTERVAL_MS: number;
function focusRegionHint(
  name: string,
  shortcut: string = formatCommandShortcut("F6"),
) {
  return name + " page, press " + shortcut + " to focus it";
}
function notificationsFocusRegion(): FocusRegion {
  return {
    el: () => {
      let element = document.querySelector<HTMLElement>(
        '[role="region"][aria-label="Notifications"]',
      );
      if (element !== null && element.childElementCount > 0) {
        return element;
      } else {
        return null;
      }
    },
    ownsKey: true,
  };
}
function focusRegionElementIsVisible(
  element: HTMLElement,
  rendered: (element: HTMLElement) => boolean,
) {
  return (
    element.closest('[inert], [hidden], [aria-hidden="true"]') == null &&
    rendered(element)
  );
}
function isFocusableRegionElement(
  element: HTMLElement,
  rendered: (element: HTMLElement) => boolean,
) {
  return (
    element.matches(FOCUS_REGION_FOCUSABLE_SELECTOR) &&
    focusRegionElementIsVisible(element, rendered)
  );
}
function focusRegionSelf(element: HTMLElement): boolean {
  let oldTabIndex = element.getAttribute("tabindex");
  if (oldTabIndex === null) {
    element.setAttribute("tabindex", "-1");
  }
  element.focus();
  if (document.activeElement !== element) {
    if (oldTabIndex === null) {
      element.removeAttribute("tabindex");
    }
    return false;
  }
  if (oldTabIndex === null) {
    let callback = () => {
      if (document.activeElement === element) {
        return;
      }
      element.removeAttribute("tabindex");
      element.removeEventListener("blur", callback);
    };
    element.addEventListener("blur", callback);
  }
  return true;
}
function createFocusRegionController(
  regions: () => FocusRegion[],
  {
    blocked = () => hasOpenOverlay(),
    rendered = (element) => element.getClientRects().length > 0,
    say = announceLiveMessage,
    now = () => Date.now(),
  }: FocusRegionOptions = {},
): FocusRegionController {
  let lastFocusedByRegion = new WeakMap<HTMLElement, HTMLElement>(),
    liveRegions = (): LiveFocusRegion[] =>
      regions().flatMap((region) => {
        let value = region.el();
        if (value && value.isConnected) {
          return [
            {
              region: region,
              el: value,
            },
          ];
        } else {
          return [];
        }
      }),
    regionIndexContaining = (
      focusRegions: LiveFocusRegion[],
      element: Element | null,
    ) => {
      if (!(element instanceof HTMLElement)) {
        return -1;
      }
      let value = -1;
      focusRegions.forEach((region, index) => {
        if (
          region.el.contains(element) &&
          (value === -1 || focusRegions[value].el.contains(region.el))
        ) {
          value = index;
        }
      });
      return value;
    },
    activeRegionIndex = (activeRegions: LiveFocusRegion[]) =>
      regionIndexContaining(activeRegions, document.activeElement),
    focusRegion = (focusableRegions: LiveFocusRegion[], targetRegion: LiveFocusRegion) => {
      let value = focusableRegions.filter(
          (region) => region !== targetRegion && targetRegion.el.contains(region.el),
        ),
        entry = lastFocusedByRegion.get(targetRegion.el),
        items = [
          entry && entry.isConnected && targetRegion.el.contains(entry)
            ? entry
            : null,
          targetRegion.region.fallback?.() ?? null,
          ...targetRegion.el.querySelectorAll<HTMLElement>(
            FOCUS_REGION_FOCUSABLE_SELECTOR,
          ),
        ];
      for (let candidateElement of items) {
        if (
          !candidateElement ||
          candidateElement === targetRegion.el ||
          value.some((regionElement) => regionElement.el.contains(candidateElement)) ||
          !isFocusableRegionElement(candidateElement, rendered)
        ) {
          continue;
        }
        candidateElement.focus();
        if (document.activeElement === candidateElement) {
          return true;
        }
      }
      return (
        targetRegion.region.landOnSelf === true &&
        focusRegionElementIsVisible(targetRegion.el, rendered) &&
        focusRegionSelf(targetRegion.el)
      );
    },
    hasMoved = false,
    lastHintAt = Number.NEGATIVE_INFINITY,
    moveAcrossRegions = (
      direction: number,
      includeHome: boolean,
    ): false | "owner" | "moved" => {
      if (blocked()) {
        return false;
      }
      let value = liveRegions(),
        length = value.length;
      if (length === 0) {
        return false;
      }
      let currentIndex = activeRegionIndex(value),
        homeIndex =
          currentIndex !== -1
            ? currentIndex
            : value.findIndex((region) => region.region.home);
      for (let count = 1; count <= length; count++) {
        let nextIndex = (((homeIndex + direction * count) % length) + length) % length;
        if (nextIndex === currentIndex) {
          continue;
        }
        let nextRegion = value[nextIndex];
        if (nextRegion.region.ownsKey === true) {
          if (!includeHome) {
            continue;
          }
          hasMoved = true;
          return "owner";
        }
        if (focusRegion(value, nextRegion)) {
          hasMoved = true;
          return "moved";
        }
      }
      return false;
    },
    move = (direction: number) => moveAcrossRegions(direction, false) === "moved",
    hint = (message: string) => {
      if (hasMoved) {
        return;
      }
      let value = now();
      if (value - lastHintAt < FOCUS_REGION_HINT_INTERVAL_MS) {
        return;
      }
      lastHintAt = value;
      say(focusRegionHint(message));
    },
    rememberFocus = (event: FocusEvent) => {
      let value = liveRegions(),
        focusedElement = event.target instanceof Element ? event.target : null,
        regionIndex = regionIndexContaining(value, focusedElement);
      if (regionIndex !== -1 && focusedElement !== value[regionIndex].el) {
        lastFocusedByRegion.set(value[regionIndex].el, focusedElement as HTMLElement);
      }
    },
    onKeyDown = (event: KeyboardEvent) => {
      if (
        event.key !== "F6" ||
        event.defaultPrevented ||
        event.isComposing ||
        event.altKey ||
        blocked()
      ) {
        return;
      }
      let value = event.repeat
        ? false
        : moveAcrossRegions(event.shiftKey ? -1 : 1, true);
      event.preventDefault();
      if (value === "owner") {
        return;
      }
      if (liveRegions().some((region) => region.region.ownsKey)) {
        event.stopPropagation();
      }
    };
  document.addEventListener("focusin", rememberFocus);
  window.addEventListener("keydown", onKeyDown, true);
  return {
    move: move,
    hint: hint,
    dispose() {
      document.removeEventListener("focusin", rememberFocus);
      window.removeEventListener("keydown", onKeyDown, true);
    },
  };
}
function useFocusRegions(regions: FocusRegion[]) {
  let regionsRef = reactFocusRegions.useRef(regions);
  regionsRef.current = regions;
  let controllerRef = reactFocusRegions.useRef<FocusRegionController | null>(
    null,
  );
  reactFocusRegions.useEffect(() => {
    let value = createFocusRegionController(() => regionsRef.current);
    controllerRef.current = value;
    return () => {
      value.dispose();
      controllerRef.current = null;
    };
  }, []);
  return reactFocusRegions.useMemo(
    () => ({
      hint: (message: string) => controllerRef.current?.hint(message),
    }),
    [],
  );
}
export {
  createFocusRegionController,
  FOCUS_REGION_FOCUSABLE_SELECTOR,
  FOCUS_REGION_HINT_INTERVAL_MS,
  focusRegionElementIsVisible,
  focusRegionHint,
  focusRegionSelf,
  isFocusableRegionElement,
  notificationsFocusRegion,
  reactFocusRegions,
  useFocusRegions,
};
export function installFilesUiFocusRegions(): () => void {
  return () => {
    reactFocusRegions = toModuleNamespace(
      loadReactNamespace(),
      1,
    );
    FOCUS_REGION_FOCUSABLE_SELECTOR =
      'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [contenteditable]:not([contenteditable="false"]), [tabindex]:not([tabindex="-1"]):not(iframe)';
    FOCUS_REGION_HINT_INTERVAL_MS = 120000;
  };
}
