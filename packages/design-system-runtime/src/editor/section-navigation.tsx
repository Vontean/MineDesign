import { uiMessage } from '@minedesign/contracts/ui-messages';
import type * as React from "react";
import type * as Core from "../contracts";
import type * as M from "../contracts/documentation";
import type * as Files from "../contracts/file-browser";
import type * as Application from "../contracts/application";
/** Restored application module; prepare first, initialize in original order. */
import { loadReactNamespace } from "../dependencies";
import { toModuleNamespace } from "../module-helpers";

var reactSectionNavigationEditorSectionNavigation: typeof React;
var editorCardKey: (kind: string, key: string) => string;
var CARD_FLASH_DURATION_MS: number;
var CARD_RETRY_TIMEOUT_MS: number;
var SECTION_SCROLL_CANCEL_TIMEOUT_MS: number;
var SECTION_SCROLL_TARGET_TIMEOUT_MS: number;
var USER_SCROLL_INTERRUPTION_EVENTS: string[];
var SECTION_SCROLL_MARGIN_PX: number;
function findEditorCard(
  root: ParentNode | null,
  target: M.EditorCardTarget,
): HTMLElement | null {
  let value = editorCardKey(target.kind, target.key);
  for (let card of root?.querySelectorAll("[data-card-key]") ?? []) {
    if (
      card instanceof HTMLElement &&
      card.getAttribute("data-card-key") === value
    ) {
      return card;
    }
  }
  return null;
}
function scrollEditorCardIntoView(
  element: HTMLElement,
  immediate: boolean | "title" = false,
): void {
  if (typeof element.scrollIntoView === "function") {
    element.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }
  element.classList.add("ds-flash");
  if (immediate === "title") {
    let titleElement = element.querySelector(".ds-rn-title.kit-rn-editable");
    if (titleElement instanceof HTMLElement) {
      titleElement.click();
    }
  } else if (immediate) {
    let titleElement = element.querySelector(
      'textarea, [contenteditable="true"]',
    );
    if (titleElement instanceof HTMLElement) {
      titleElement.focus({
        preventScroll: true,
      });
    }
  }
  window.setTimeout(
    () => element.classList.remove("ds-flash"),
    CARD_FLASH_DURATION_MS,
  );
}
function useEditorCardFlash(
  root: React.RefObject<HTMLElement | null>,
): M.EditorCardFlashState {
  let [value, setFlashedTarget] =
    reactSectionNavigationEditorSectionNavigation.useState<M.EditorCardTarget | null>(
      null,
    );
  reactSectionNavigationEditorSectionNavigation.useLayoutEffect(() => {
    if (value === null) {
      return;
    }
    let cardElement = findEditorCard(root.current, value);
    if (cardElement === null) {
      let flashTimer = window.setTimeout(
        () =>
          setFlashedTarget((target: M.EditorCardTarget | null) =>
            target === value ? null : target,
          ),
        CARD_RETRY_TIMEOUT_MS,
      );
      return () => window.clearTimeout(flashTimer);
    }
    scrollEditorCardIntoView(cardElement, value.focus ?? false);
    setFlashedTarget(null);
  });
  return {
    reveal: setFlashedTarget,
    pending: value,
  };
}
function findCommentTarget(
  root: ParentNode | null | undefined,
  id: string,
): HTMLElement | null {
  for (let value of root?.querySelectorAll("[data-id]") ?? []) {
    if (
      value instanceof HTMLElement &&
      value.getAttribute("data-id") === id
    ) {
      return value;
    }
  }
  return null;
}
function useEditorSectionNavigation({
  sections: sections,
  port: port,
  shown: shown,
  miss: miss,
}: M.SectionNavigationProps) {
  let [value, setRevealTarget] =
      reactSectionNavigationEditorSectionNavigation.useState<M.SectionNavigationTarget | null>(
        null,
      ),
    [, setRevealVersion] = reactSectionNavigationEditorSectionNavigation.useState(0),
    ref = reactSectionNavigationEditorSectionNavigation.useRef<
      (() => void) | null
    >(null),
    flashTimerRef =
      reactSectionNavigationEditorSectionNavigation.useRef<M.SectionFlash | null>(
        null,
      ),
    callback =
      reactSectionNavigationEditorSectionNavigation.useCallback((): void => {
        ref.current?.();
        setRevealTarget(null);
      }, []),
    sectionsRef = reactSectionNavigationEditorSectionNavigation.useRef({
      shown: shown,
      miss: miss,
    });
  sectionsRef.current = {
    shown: shown,
    miss: miss,
  };
  reactSectionNavigationEditorSectionNavigation.useEffect(
    () => () => ref.current?.(),
    [],
  );
  reactSectionNavigationEditorSectionNavigation.useLayoutEffect(() => {
    if (value === null) {
      return;
    }
    let targetElement = findCommentTarget(
      sections.current[value.section],
      value.target,
    );
    if (targetElement === null) {
      let scrollTimer = window.setTimeout(
          (): void => {
            setRevealTarget((target: M.SectionNavigationTarget | null) =>
              target === value ? null : target,
            );
            sectionsRef.current.miss(value);
          },
          Math.max(0, value.until - Date.now()),
        ),
        sectionElement = sections.current[value.section],
        sectionObserver =
          sectionElement !== null &&
          sectionElement !== undefined &&
          typeof window.MutationObserver === "function"
            ? new window.MutationObserver((): void => {
                if (findCommentTarget(sectionElement, value.target) !== null) {
                  setRevealVersion((version: number) => version + 1);
                }
              })
            : null;
      if (sectionElement !== null && sectionElement !== undefined) {
        sectionObserver?.observe(sectionElement, {
          childList: true,
          subtree: true,
        });
      }
      let clearUserScroll = () => setRevealTarget(null);
      for (let eventType of USER_SCROLL_INTERRUPTION_EVENTS) {
        port?.addEventListener(eventType, clearUserScroll, {
          passive: true,
        });
      }
      return (): void => {
        window.clearTimeout(scrollTimer);
        sectionObserver?.disconnect();
        for (let eventType of USER_SCROLL_INTERRUPTION_EVENTS) {
          port?.removeEventListener(eventType, clearUserScroll);
        }
      };
    }
    setRevealTarget(null);
    ref.current?.();
    if (port !== null && targetElement.getClientRects().length === 0) {
      sectionsRef.current.miss(value);
      return;
    }
    let updateSectionBounds = (): void => {
      if (port === null) {
        targetElement.scrollIntoView?.({
          behavior: "instant",
          block: "center",
        });
        return;
      }
      if (!targetElement.isConnected || targetElement.getClientRects().length === 0) {
        ref.current?.();
        return;
      }
      let bounds = targetElement.getBoundingClientRect(),
        scrollTop: number =
          bounds.height > port.clientHeight - SECTION_SCROLL_MARGIN_PX
            ? SECTION_SCROLL_MARGIN_PX
            : (port.clientHeight - bounds.height) / 2,
        targetScrollTop: number = Math.max(
          0,
          port.scrollTop +
            bounds.top -
            port.getBoundingClientRect().top -
            scrollTop,
        );
      if (Math.abs(targetScrollTop - port.scrollTop) >= 1) {
        port.scrollTo({
          top: targetScrollTop,
          behavior: "instant",
        });
      }
    };
    updateSectionBounds();
    sectionsRef.current.shown(value);
    if (
      document.activeElement === null ||
      document.activeElement === document.body
    ) {
      sections.current[value.section]?.focus({
        preventScroll: true,
      });
    }
    if (flashTimerRef.current !== null) {
      window.clearTimeout(flashTimerRef.current.timer);
      flashTimerRef.current.el.classList.remove("ds-flash");
    }
    targetElement.offsetWidth;
    targetElement.classList.add("ds-flash");
    flashTimerRef.current = {
      el: targetElement,
      timer: window.setTimeout(
        () => targetElement.classList.remove("ds-flash"),
        CARD_FLASH_DURATION_MS,
      ),
    };
    let observer =
      port !== null && typeof ResizeObserver === "function"
        ? new ResizeObserver(updateSectionBounds)
        : null;
    if (observer !== null && port !== null) {
      for (let child of Array.from<Element>(port.children)) {
        observer.observe(child);
      }
    }
    let cancelUserScroll = (): void => {
        ref.current = null;
        observer?.disconnect();
        window.clearTimeout(cancelTimer);
        for (let eventType of USER_SCROLL_INTERRUPTION_EVENTS) {
          port?.removeEventListener(eventType, cancelUserScroll);
        }
      },
      cancelTimer = window.setTimeout(cancelUserScroll, SECTION_SCROLL_CANCEL_TIMEOUT_MS);
    ref.current = cancelUserScroll;
    for (let eventType of USER_SCROLL_INTERRUPTION_EVENTS) {
      port?.addEventListener(eventType, cancelUserScroll, {
        passive: true,
      });
    }
  });
  return {
    reveal: reactSectionNavigationEditorSectionNavigation.useCallback(
      (reveal: Application.EditorSectionReveal) =>
        setRevealTarget({
          ...reveal,
          until: Date.now() + SECTION_SCROLL_TARGET_TIMEOUT_MS,
        }),
      [],
    ),
    release: callback,
  };
}
function createEditorSectionNavigationActions({
  sectionLabel: sectionLabel,
  show: show,
  mark: mark,
  sectionEl: sectionEl,
  say: say,
}: Application.EditorSectionNavigationActionOptions): Application.EditorSectionNavigationActions {
  return {
    shown: (reveal: Application.EditorSectionReveal): void => {
      mark(reveal.section);
      say(
        uiMessage("design-system.sectionNavigation.inView") +
          reveal.label +
          ", in " +
          (sectionLabel(reveal.section) ?? uiMessage("design-system.sectionNavigation.thisPage")) +
          ".",
      );
    },
    miss: (reveal: Application.EditorSectionReveal): void => {
      let value = sectionLabel(reveal.section);
      if (value === undefined) {
        return;
      }
      let activeElement = document.activeElement;
      show(reveal.section);
      if (
        document.activeElement === activeElement ||
        document.activeElement !== sectionEl(reveal.section)
      ) {
        say(uiMessage("design-system.sectionNavigation.inView") + value + ".");
      }
    },
  };
}
export {
  CARD_FLASH_DURATION_MS,
  CARD_RETRY_TIMEOUT_MS,
  createEditorSectionNavigationActions,
  editorCardKey,
  findCommentTarget,
  findEditorCard,
  reactSectionNavigationEditorSectionNavigation,
  scrollEditorCardIntoView,
  SECTION_SCROLL_CANCEL_TIMEOUT_MS,
  SECTION_SCROLL_MARGIN_PX,
  SECTION_SCROLL_TARGET_TIMEOUT_MS,
  useEditorCardFlash,
  useEditorSectionNavigation,
  USER_SCROLL_INTERRUPTION_EVENTS,
};
export function installEditorSectionNavigation(): () => void {
  return () => {
    reactSectionNavigationEditorSectionNavigation = toModuleNamespace(loadReactNamespace(), 1);
    editorCardKey = (kind: string, key: string): string => kind + ":" + key;
    CARD_FLASH_DURATION_MS = 1500;
    CARD_RETRY_TIMEOUT_MS = 15000;
    SECTION_SCROLL_CANCEL_TIMEOUT_MS = 1200;
    SECTION_SCROLL_TARGET_TIMEOUT_MS = 3000;
    USER_SCROLL_INTERRUPTION_EVENTS = [
      "wheel",
      "touchstart",
      "pointerdown",
      "keydown",
    ];
    SECTION_SCROLL_MARGIN_PX = 56;
  };
}
