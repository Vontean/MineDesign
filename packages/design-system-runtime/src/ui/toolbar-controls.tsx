import { uiMessage } from '@minedesign/contracts/ui-messages';
import { useUiLocale } from '../ui-locale.ts';
import type * as React from "react";
import type * as Color from "../contracts/color-controls";
/** Restored application module; prepare first, initialize in original order. */
import { loadJsxNamespace, loadReactNamespace } from "../dependencies";
import { toModuleNamespace } from "../module-helpers";
import { OPEN_OVERLAY_SELECTOR } from "../platform/frame-chrome";
import { shortcutToAriaKeyShortcuts, Tooltip, TooltipProvider, useAppleKeyboard } from "./avatars";
import { Counter } from "./badges";
import { Button } from "./buttons";
import { Icon } from "./interactions";
import { CdsRoot } from "./overlays";
import { TEXT_EDITABLE_SELECTOR, ToolbarTooltipSideContext } from "./property-focus";
import { joinClassNames } from "./property-icons";
import { COARSE_POINTER_QUERY, useCoarsePointer } from "./select";
import { Surface } from "./surfaces";

var jsxToolbarLabels: typeof import("react/jsx-runtime");
var jsxToolbarSeparators: typeof import("react/jsx-runtime");
var reactToolbarLayout: typeof import("react");
var jsxToolbarLayout: typeof import("react/jsx-runtime");
var reactToolbarButtons: typeof import("react");
var jsxToolbarButtons: typeof import("react/jsx-runtime");
var jsxToolbarIndicators: typeof import("react/jsx-runtime");
var reactToolbarControls: typeof import("react");
var reactForUiToolbarControls: typeof import("react");
var PANEL_ELEVATION: "panel";
var POPOVER_ELEVATION: "popover";
var reactToolbarButton: typeof import("react");
var jsxForUiToolbarControls: typeof import("react/jsx-runtime");
var ToolbarFloatingContext: React.Context<boolean>;
var ToolbarQuietContext: React.Context<boolean>;
var SHORTCUT_MODIFIER_NAMES: Record<string, [string, string]>;
var SHORTCUT_MODIFIER_LABELS: string[];
var SHORTCUT_KEY_NAMES: Record<string, string | [string, string]>;
var ownShortcutMapping: <T>(
  mapping: Record<string, T>,
  key: string,
) => T | undefined;
var SHORTCUT_SPOKEN_REPLACEMENTS: [RegExp, string, string][];
var ToolbarButton: React.ForwardRefExoticComponent<
  Color.ToolbarButtonProps & React.RefAttributes<HTMLButtonElement>
>;
var toolbarButtonJsx: typeof import("react/jsx-runtime");
var toolbarPointerSession: Color.ToolbarPointerSession | null;
var installedToolbarPointerDocuments: WeakSet<Document>;
var monotonicNow: () => number | null;
var TOOLBAR_POINTER_TIME_TOLERANCE: number;
var TOOLBAR_POINTER_COORDINATE_TOLERANCE: number;
var TOOLBAR_TOUCH_HOLD_MS: number;
var TOOLBAR_TOUCH_RECENCY_MS: number;
var TOOLBAR_STRAY_HOLD_MS: number;
var TOOLBAR_EARLY_HOLD_MS: number;
var pointInsideElement: (element: Element, x: number, y: number) => boolean;
var matchesToolbarPointerEvent: (
  event: Pick<MouseEvent, "timeStamp" | "clientX" | "clientY">,
  timestamp: number,
  x: number,
  y: number,
) => boolean;
var toolbarStrips: Set<HTMLElement>;
var toolbarClickThroughTimer: ReturnType<typeof setTimeout> | null;
var lastToolbarTouchRelease: number | null;
var afterTwoAnimationFramesUiToolbarControls: (
  callback: FrameRequestCallback,
) => void;
var TOOLBAR_POSITION_TOLERANCE: number;
var toolbarTouchDeadlines: WeakMap<Element, Color.ToolbarTouchDeadline>;
var ToolbarGroupWrapContext: React.Context<boolean>;
var ToolbarStripButton: React.ForwardRefExoticComponent<
  Color.ToolbarStripButtonProps & React.RefAttributes<HTMLButtonElement>
>;
function ToolbarCaret({
  inherit = false,
}: {
  inherit?: boolean;
} = {}): React.ReactElement {
  useUiLocale();
  return (
    <Icon
      name={"CaretDown"}
      size={"xs"}
      className={joinClassNames(
        "-mx-0.5 shrink-0",
        !inherit && "text-fg-muted",
      )}
    />
  );
}
function toolbarTooltipContent(props: Color.ToolbarTip): {
  content: string;
  shortcut?: string;
} {
  if (props.disabled) {
    return {
      content: props.disabledTip ?? props.tip ?? props.label,
      shortcut: undefined,
    };
  } else {
    return {
      content: props.tip ?? props.label,
      shortcut: props.shortcut,
    };
  }
}
function useDisabledButtonDescription(
  options: Color.ToolbarDisabledDescription,
): Color.ToolbarDisabledAccessibility {
  let value = reactToolbarButton.useId();
  if (!options.disabled) {
    return {
      props: {},
      inner: {},
      mirror: null,
    };
  }
  let hasDistinctReason = !!options.reason && options.reason !== options.name;
  return {
    props: {
      role: "button",
      "aria-disabled": true,
      "aria-label": options.name,
      "aria-describedby": hasDistinctReason ? value : undefined,
      "aria-pressed": options.pressed,
      "aria-expanded": options.expanded,
      "aria-haspopup": options.hasPopup,
    },
    inner: {
      "aria-hidden": true,
    },
    mirror: hasDistinctReason ? (
      <span hidden={true} id={value}>
        {options.reason}
      </span>
    ) : null,
  };
}
function useDeferredTooltipFocus(
  enabled: React.RefObject<HTMLElement | null>,
  onChange: boolean,
): void {
  let ref = reactToolbarButton.useRef(onChange);
  ref.current = onChange;
  let lastFocusVisibleRef = reactToolbarButton.useRef<boolean | undefined>(
      undefined,
    ),
    returnFocusToButtonRef = reactToolbarButton.useRef(false),
    current = reactToolbarButton.useRef(
      (event: Color.ToolbarFocusEvent) => {
        let currentTarget = event.currentTarget;
        if (event.type === "pointerdown") {
          lastFocusVisibleRef.current = false;
        } else if (event.type === "focusout") {
          let relatedTarget = event.relatedTarget;
          if (
            event.target === currentTarget &&
            relatedTarget instanceof Node &&
            relatedTarget.isConnected &&
            !currentTarget.contains(relatedTarget)
          ) {
            returnFocusToButtonRef.current = false;
          }
        } else if (
          ((lastFocusVisibleRef.current =
            event.target instanceof Element &&
            event.target.matches(":focus-visible")),
          event.type === "focusin" &&
            event.target === currentTarget &&
            ref.current)
        ) {
          returnFocusToButtonRef.current = lastFocusVisibleRef.current;
        }
      },
    ).current,
    cancelFocusReturn = reactToolbarButton.useRef(() => {
      returnFocusToButtonRef.current = false;
    }).current,
    subscribedElementRef = reactToolbarButton.useRef<HTMLElement | null>(null),
    callback = (element: HTMLElement | null) => {
      let previousElement = subscribedElementRef.current;
      if (element === previousElement) {
        return;
      }
      let items = ["focusin", "focusout", "keydown", "pointerdown"] as const;
      if (previousElement !== null) {
        for (let value of items) {
          previousElement.removeEventListener(value, current as EventListener);
        }
        previousElement.ownerDocument.removeEventListener(
          "pointerdown",
          cancelFocusReturn,
          true,
        );
      }
      subscribedElementRef.current = element;
      if (element !== null) {
        for (let value of items) {
          element.addEventListener(value, current as EventListener);
        }
        element.ownerDocument.addEventListener("pointerdown", cancelFocusReturn, true);
      }
    };
  reactToolbarButton.useLayoutEffect(() => callback(enabled.current));
  reactToolbarButton.useLayoutEffect(() => () => callback(null), []);
  reactToolbarButton.useLayoutEffect(() => {
    let buttonWrapper = enabled.current;
    if (buttonWrapper === null) {
      return;
    }
    let ownerDocument = buttonWrapper.ownerDocument,
      value =
        ownerDocument.activeElement instanceof HTMLElement ||
        ownerDocument.activeElement instanceof SVGElement
          ? ownerDocument.activeElement
          : null,
      noFocusedControl =
        value === null ||
        value === ownerDocument.body ||
        value === ownerDocument.documentElement;
    if (onChange) {
      if (
        ownerDocument.hasFocus() &&
        !noFocusedControl &&
        value !== buttonWrapper &&
        buttonWrapper.contains(value) &&
        (lastFocusVisibleRef.current ?? value!.matches(":focus-visible"))
      ) {
        buttonWrapper.focus({
          preventScroll: true,
        });
      }
    } else {
      let shouldReturnFocus = returnFocusToButtonRef.current;
      returnFocusToButtonRef.current = false;
      if (
        shouldReturnFocus &&
        (value === buttonWrapper || (noFocusedControl && ownerDocument.hasFocus()))
      ) {
        buttonWrapper.querySelector("button")?.focus({
          preventScroll: true,
        });
      }
    }
  }, [onChange]);
}
function accessibleKeyShortcut(
  shortcut: string,
  isMac: boolean,
): string | undefined {
  let value = shortcut.trim().replace(/\s*\+\s*/g, "+");
  if (value === "" || /\s/.test(value)) {
    return;
  }
  let items: string[] = [],
    keys: string[] = [];
  for (let token of value.split("+")) {
    let normalizedToken = token.toLowerCase();
    if (normalizedToken === "") {
      continue;
    }
    let modifierNames = ownShortcutMapping(SHORTCUT_MODIFIER_NAMES, normalizedToken);
    if (modifierNames !== undefined) {
      let modifierName = modifierNames[isMac ? 0 : 1];
      if (!items.includes(modifierName)) {
        items.push(modifierName);
      }
      continue;
    }
    let keyName = ownShortcutMapping(SHORTCUT_KEY_NAMES, normalizedToken);
    keys.push(
      keyName !== undefined
        ? typeof keyName === "string"
          ? keyName
          : keyName[isMac ? 0 : 1]
        : normalizedToken.length === 1
          ? normalizedToken.toUpperCase()
          : normalizedToken.charAt(0).toUpperCase() + normalizedToken.slice(1),
    );
  }
  if (keys.length === 0) {
    return;
  }
  items.sort(
    (leftModifier, rightModifier) =>
      SHORTCUT_MODIFIER_LABELS.indexOf(leftModifier) -
      SHORTCUT_MODIFIER_LABELS.indexOf(rightModifier),
  );
  return [...items, ...keys].join("+");
}
function spokenShortcut(shortcut: string, isMac: boolean): string {
  let value = shortcut;
  for (let [tokenPattern, macReplacement, otherReplacement] of SHORTCUT_SPOKEN_REPLACEMENTS) {
    value = value.replace(tokenPattern, isMac ? macReplacement : otherReplacement);
  }
  return value.replace(/ {2,}/g, " ").trim();
}
function useButtonAccessibility(
  props: Color.ToolbarAccessibleDescription,
): Color.ToolbarAccessibility {
  let value = reactToolbarButton.useId(),
    usesAppleKeyboard = useAppleKeyboard(),
    isEnabled = !props.disabled,
    includeTip = props.tip !== "" && !props.name.includes(props.tip),
    readableShortcut =
      isEnabled && props.shortcut !== undefined
        ? accessibleKeyShortcut(props.shortcut, usesAppleKeyboard)
        : undefined,
    ariaKeyShortcuts =
      isEnabled && props.shortcut !== undefined
        ? shortcutToAriaKeyShortcuts(props.shortcut, usesAppleKeyboard)
        : undefined,
    descriptionSuffix =
      isEnabled && props.descriptionSuffix ? props.descriptionSuffix : undefined,
    hasDescription =
      isEnabled && (includeTip || readableShortcut !== undefined || descriptionSuffix !== undefined),
    describedBy =
      [props.describedBy, hasDescription ? value : undefined]
        .filter(Boolean)
        .join(" ") || undefined;
  if (!hasDescription) {
    return {
      describedBy: describedBy,
      keyShortcuts: ariaKeyShortcuts,
      mirror: null,
    };
  }
  let description = [
      includeTip ? spokenShortcut(props.tip, usesAppleKeyboard) : undefined,
      readableShortcut !== undefined ? "Shortcut: " + readableShortcut : undefined,
    ]
      .filter(Boolean)
      .join(". "),
    fullDescription =
      descriptionSuffix === undefined
        ? description
        : description === ""
          ? descriptionSuffix
          : description + (/[.!?]$/.test(description) ? " " : ". ") + descriptionSuffix;
  return {
    describedBy: describedBy,
    keyShortcuts: ariaKeyShortcuts,
    mirror: (
      <span hidden={true} id={value}>
        {fullDescription}
      </span>
    ),
  };
}
function completedToolbarPointerSession(
  session: Color.ToolbarPointerSession | null,
  allowStray: boolean = false,
): Color.CompletedToolbarPointerSession | null {
  if (
    session === null ||
    session.ended === null ||
    (session.onStrip && !(allowStray && session.stray === true)) ||
    session.inPopup ||
    session.mouse
  ) {
    return null;
  }
  if (!(session.ended.at - session.began.at >= 0)) {
    return null;
  }
  return session as Color.CompletedToolbarPointerSession;
}
function installToolbarPointerTracking(ownerDocument: Document): void {
  if (installedToolbarPointerDocuments.has(ownerDocument)) {
    return;
  }
  installedToolbarPointerDocuments.add(ownerDocument);
  ownerDocument.addEventListener(
    "pointerdown",
    (event: PointerEvent) => {
      if (event.isPrimary === false) {
        return;
      }
      let value = monotonicNow();
      for (let clickThroughElement of Array.from<Element>(
        ownerDocument.querySelectorAll("[data-mc-through]"),
      )) {
        let clickThroughDeadline = Number(
          clickThroughElement.getAttribute("data-mc-through") || Number.NaN,
        );
        if (
          !(
            value !== null &&
            value < clickThroughDeadline &&
            clickThroughDeadline - value <= TOOLBAR_EARLY_HOLD_MS
          )
        ) {
          clickThroughElement.removeAttribute("data-mc-through");
        }
      }
      let target = event.target as Element | null,
        toolbarStrip = target?.closest?.("[data-mc-strip]") ?? null,
        state: Color.ToolbarPointerSession = {
          onStrip: toolbarStrip !== null,
          inPopup: target?.closest?.(OPEN_OVERLAY_SELECTOR) != null,
          mouse: event.pointerType === "mouse",
          began: {
            x: event.clientX,
            y: event.clientY,
            at: event.timeStamp,
            perf: value,
          },
          ended: null,
        },
        eventAge = value === null ? -1 : value - event.timeStamp;
      if (
        toolbarStrip !== null &&
        event.pointerType !== "mouse" &&
        eventAge >= 0 &&
        eventAge <= TOOLBAR_TOUCH_RECENCY_MS
      ) {
        state.early =
          event.timeStamp < toolbarElementClickThroughDeadline(toolbarStrip);
      }
      let previousSession = completedToolbarPointerSession(
          toolbarPointerSession,
          true,
        ),
        timeSincePreviousRelease = previousSession === null ? -1 : event.timeStamp - previousSession.ended.at,
        sessionStart = previousSession === null ? 0 : (previousSession.runAt ?? previousSession.ended.at);
      if (
        previousSession !== null &&
        timeSincePreviousRelease >= 0 &&
        timeSincePreviousRelease <= TOOLBAR_POINTER_TIME_TOLERANCE &&
        event.timeStamp - sessionStart < TOOLBAR_TOUCH_HOLD_MS
      ) {
        state.runAt = sessionStart;
        state.stray =
          event.pointerType !== "mouse" &&
          toolbarStrip !== null &&
          pointInsideElement(toolbarStrip, previousSession.ended.x, previousSession.ended.y);
      }
      toolbarPointerSession = state;
    },
    true,
  );
  ownerDocument.addEventListener(
    "pointerup",
    (pointerEvent: PointerEvent) => {
      if (pointerEvent.isPrimary !== false && toolbarPointerSession !== null) {
        toolbarPointerSession.ended = {
          at: pointerEvent.timeStamp,
          x: pointerEvent.clientX,
          y: pointerEvent.clientY,
          perf: monotonicNow(),
        };
      }
      updateToolbarClickThroughAttributes();
    },
    true,
  );
}
function isToolbarClickThrough(event: Color.ToolbarClickEvent): boolean {
  let value = toolbarPointerSession;
  if (event.detail === 0 || value === null) {
    return false;
  }
  if (value.stray === true || value.early === true) {
    return (
      matchesToolbarPointerEvent(
        event,
        value.began.at,
        value.began.x,
        value.began.y,
      ) ||
      (value.ended !== null &&
        matchesToolbarPointerEvent(
          event,
          value.ended.at,
          value.ended.x,
          value.ended.y,
        ))
    );
  }
  return (
    !value.onStrip &&
    value.ended !== null &&
    matchesToolbarPointerEvent(
      event,
      value.ended.at,
      value.ended.x,
      value.ended.y,
    )
  );
}
function coarseToolbarPointer(): boolean {
  try {
    return (
      typeof matchMedia === "function" &&
      matchMedia(COARSE_POINTER_QUERY)?.matches === true
    );
  } catch {
    return false;
  }
}
function updateToolbarTouchDeadline(
  element: HTMLElement,
  active: boolean,
): void {
  let entry = toolbarTouchDeadlines.get(element);
  if (!active) {
    if (entry !== undefined) {
      toolbarTouchDeadlines.delete(element);
    }
    return;
  }
  let value = monotonicNow(),
    bounds = element.getBoundingClientRect(),
    positionChanged =
      entry === undefined ||
      Math.abs(bounds.left - entry.left) > TOOLBAR_POSITION_TOLERANCE ||
      Math.abs(bounds.top - entry.top) > TOOLBAR_POSITION_TOLERANCE,
    pointerSession = toolbarPointerSession,
    lastPointerTime =
      pointerSession === null
        ? null
        : pointerSession.ended === null
          ? pointerSession.began.perf
          : pointerSession.ended.perf,
    pointerAge = value === null || lastPointerTime === null ? -1 : value - lastPointerTime,
    isRecentToolbarInteraction =
      pointerSession !== null &&
      ((pointerSession.onStrip && pointerSession.stray !== true && pointerSession.early !== true) ||
        pointerSession.inPopup) &&
      pointerAge >= 0 &&
      pointerAge <=
        (pointerSession.ended === null
          ? TOOLBAR_TOUCH_HOLD_MS
          : TOOLBAR_POINTER_TIME_TOLERANCE);
  if (isRecentToolbarInteraction && entry !== undefined) {
    [entry.left, entry.top] = [bounds.left, bounds.top];
  }
  if (
    !positionChanged ||
    value === null ||
    !(bounds.width > 0 && bounds.height > 0) ||
    !coarseToolbarPointer()
  ) {
    return;
  }
  if (isRecentToolbarInteraction) {
    if (entry === undefined) {
      toolbarTouchDeadlines.set(element, {
        left: bounds.left,
        top: bounds.top,
        end: 0,
        since: value,
        movedAt: 0,
      });
    }
    return;
  }
  let movementStartedAt =
      entry !== undefined &&
      (value < entry.end || value - entry.movedAt <= TOOLBAR_TOUCH_HOLD_MS)
        ? entry.since
        : value,
    state = {
      left: bounds.left,
      top: bounds.top,
      end: Math.min(
        value + TOOLBAR_STRAY_HOLD_MS + TOOLBAR_POINTER_TIME_TOLERANCE,
        movementStartedAt + TOOLBAR_EARLY_HOLD_MS,
      ),
      since: movementStartedAt,
      movedAt: value,
    };
  toolbarTouchDeadlines.set(element, state);
  afterTwoAnimationFramesUiToolbarControls(() => {
    let frameTime = monotonicNow();
    if (frameTime !== null && toolbarTouchDeadlines.get(element) === state) {
      state.end = Math.min(
        state.end,
        frameTime + TOOLBAR_POINTER_TIME_TOLERANCE,
      );
    }
    updateToolbarClickThroughAttributes();
  });
}
function toolbarElementClickThroughDeadline(element: Element): number {
  let value = completedToolbarPointerSession(toolbarPointerSession),
    pointerDeadline =
      value !== null &&
      value.end !== undefined &&
      pointInsideElement(element, value.ended.x, value.ended.y)
        ? value.end
        : 0;
  return Math.max(toolbarTouchDeadlines.get(element)?.end ?? 0, pointerDeadline);
}
function toolbarStripClickThroughDeadline(
  element: HTMLElement,
  now: number,
): number {
  return Math.max(
    toolbarTouchDeadlines.get(element)?.end ?? 0,
    toolbarRecentTouchDeadline(element, now),
  );
}
function toolbarRecentTouchDeadline(
  element: HTMLElement,
  now: number,
): number {
  let value = completedToolbarPointerSession(toolbarPointerSession);
  if (value === null || value.ended.perf === null) {
    return 0;
  }
  if (value.end === undefined) {
    let timeSinceRelease = now - value.ended.perf;
    if (
      !(timeSinceRelease >= 0 && timeSinceRelease <= TOOLBAR_TOUCH_RECENCY_MS) ||
      !pointInsideElement(element, value.ended.x, value.ended.y)
    ) {
      return 0;
    }
    let belongsToPreviousTouch =
      lastToolbarTouchRelease !== null &&
      value.began.perf !== null &&
      value.began.perf < lastToolbarTouchRelease;
    if (!belongsToPreviousTouch) {
      lastToolbarTouchRelease =
        now + TOOLBAR_STRAY_HOLD_MS + TOOLBAR_TOUCH_HOLD_MS;
    }
    let releaseDeadline = lastToolbarTouchRelease ?? 0;
    value.end = Math.min(
      now + TOOLBAR_STRAY_HOLD_MS + TOOLBAR_POINTER_TIME_TOLERANCE,
      releaseDeadline,
    );
    afterTwoAnimationFramesUiToolbarControls(() => {
      let frameTime = monotonicNow();
      if (frameTime !== null && !belongsToPreviousTouch && lastToolbarTouchRelease === releaseDeadline) {
        lastToolbarTouchRelease = Math.min(
          releaseDeadline,
          frameTime + TOOLBAR_TOUCH_HOLD_MS,
        );
      }
      if (frameTime !== null && value.end !== undefined) {
        value.end = Math.min(
          value.end,
          frameTime + TOOLBAR_POINTER_TIME_TOLERANCE,
          lastToolbarTouchRelease ?? 0,
        );
      }
      updateToolbarClickThroughAttributes();
    });
  }
  if (
    now < value.end &&
    pointInsideElement(element, value.ended.x, value.ended.y)
  ) {
    return value.end;
  } else {
    return 0;
  }
}
function updateToolbarOverflowAttributes(
  strip: HTMLElement,
  row: HTMLElement,
): void {
  strip.toggleAttribute("data-mc-more-start", row.scrollLeft > 1);
  strip.toggleAttribute(
    "data-mc-more-end",
    row.scrollLeft < row.scrollWidth - row.clientWidth - 1,
  );
}
function updateToolbarClickThroughAttributes(): void {
  if (toolbarClickThroughTimer !== null) {
    clearTimeout(toolbarClickThroughTimer);
  }
  toolbarClickThroughTimer = null;
  let value = monotonicNow(),
    index = 0;
  for (let strip of toolbarStrips) {
    let deadline =
      value === null ? 0 : toolbarStripClickThroughDeadline(strip, value);
    if (value !== null && value < deadline) {
      strip.setAttribute("data-mc-through", String(Math.ceil(deadline)));
      index = Math.max(index, deadline);
    } else {
      strip.removeAttribute("data-mc-through");
    }
  }
  if (value !== null && index > 0) {
    toolbarClickThroughTimer = setTimeout(
      updateToolbarClickThroughAttributes,
      Math.min(TOOLBAR_POINTER_TIME_TOLERANCE, Math.max(0, index - value)) +
        1,
    );
  }
}
function ToolbarStrip({
  className: className,
  onPointerDown: onPointerDown,
  onMouseDown: onMouseDown,
  onMouseDownCapture: onMouseDownCapture,
  onClickCapture: onClickCapture,
  onScroll: onScroll,
  children: children,
  surface = "panel",
  placed = "above",
  coversSelection: coversSelection,
  wrap = false,
  ...remainingProps
}: Color.ToolbarStripProps): React.ReactElement {
  useUiLocale();
  reactForUiToolbarControls.useEffect(
    () => installToolbarPointerTracking(document),
    [],
  );
  let ref = reactForUiToolbarControls.useRef<HTMLDivElement | null>(null),
    toolbarRowRef = reactForUiToolbarControls.useRef<HTMLDivElement | null>(null),
    value = useCoarsePointer();
  reactForUiToolbarControls.useLayoutEffect(() => {
    let current = ref.current;
    if (current === null) {
      return;
    }
    toolbarStrips.add(current);
    return () => {
      toolbarStrips.delete(current);
      if (toolbarStrips.size === 0 && toolbarClickThroughTimer !== null) {
        clearTimeout(toolbarClickThroughTimer);
        toolbarClickThroughTimer = null;
      }
    };
  }, []);
  reactForUiToolbarControls.useLayoutEffect(() => {
    if (ref.current !== null) {
      updateToolbarTouchDeadline(ref.current, coversSelection === true);
    }
    updateToolbarClickThroughAttributes();
    if (ref.current !== null && toolbarRowRef.current !== null) {
      updateToolbarOverflowAttributes(ref.current, toolbarRowRef.current);
    }
  });
  reactForUiToolbarControls.useLayoutEffect(() => {
    let current = ref.current,
      toolbarRow = toolbarRowRef.current;
    if (
      current === null ||
      toolbarRow === null ||
      typeof ResizeObserver === "undefined"
    ) {
      return;
    }
    let observer = new ResizeObserver(() =>
      updateToolbarOverflowAttributes(current, toolbarRow),
    );
    observer.observe(toolbarRow);
    return () => observer.disconnect();
  }, []);
  reactForUiToolbarControls.useLayoutEffect(() => {
    let current = ref.current,
      toolbarRow = toolbarRowRef.current;
    if (
      surface !== "popover" ||
      current === null ||
      toolbarRow === null ||
      typeof ResizeObserver === "undefined"
    ) {
      return;
    }
    let callback = () => {
        let element = toolbarRow.querySelector<HTMLElement>(
            '[data-cds="Button"]',
          ),
          rowStyle = getComputedStyle(toolbarRow),
          singleRowHeight =
            (element?.offsetHeight ?? 0) +
            (parseFloat(rowStyle.paddingTop) || 0) +
            (parseFloat(rowStyle.paddingBottom) || 0);
        current.toggleAttribute(
          "data-mc-wrapped",
          element !== null && toolbarRow.clientHeight > singleRowHeight + 1,
        );
      },
      observer = new ResizeObserver(callback);
    observer.observe(toolbarRow);
    callback();
    return () => observer.disconnect();
  }, [surface]);
  return (
    <CdsRoot
      density={surface === "popover" && value ? "comfortable" : "compact"}
      render={
        <Surface
          elevation={POPOVER_ELEVATION}
          role={"toolbar"}
          data-mc-strip={""}
          data-mc-surface={surface}
          onPointerDown={(pointerEvent: React.PointerEvent<HTMLDivElement>) => {
            pointerEvent.stopPropagation();
            onPointerDown?.(pointerEvent);
          }}
          onMouseDownCapture={(
            event: React.MouseEvent<HTMLDivElement> & {
              target: HTMLElement;
            },
          ) => {
            if (
              event.currentTarget.contains(event.target) &&
              isToolbarClickThrough(event)
            ) {
              event.preventDefault();
              event.stopPropagation();
            }
            onMouseDownCapture?.(event);
          }}
          onClickCapture={(
            event: React.MouseEvent<HTMLDivElement> & {
              target: HTMLElement;
            },
          ) => {
            if (
              event.currentTarget.contains(event.target) &&
              isToolbarClickThrough(event)
            ) {
              event.preventDefault();
              event.stopPropagation();
            }
            onClickCapture?.(event);
          }}
          onMouseDown={(
            event: React.MouseEvent<HTMLDivElement> & {
              target: HTMLElement;
            },
          ) => {
            if (!event.target.closest(TEXT_EDITABLE_SELECTOR)) {
              event.preventDefault();
            }
            onMouseDown?.(event);
          }}
          className={joinClassNames(
            "z-selection flex items-center",
            surface === "popover"
              ? "[--mc-group-gap:2px] [--mc-strip-gap:4px] [--mc-strip-pad:5px] pointer-coarse:rounded-xl pointer-coarse:[--mc-group-gap:8px] pointer-coarse:[--mc-strip-gap:8px] pointer-coarse:[--mc-strip-pad:6px] [&_[data-mc-divider]]:mx-0"
              : "[--mc-strip-gap:2px] [--mc-strip-pad:4px] [--mc-group-gap:4px]",
            "max-w-[calc(100vw-16px)] overflow-clip",
            className,
          )}
          {...remainingProps}
          ref={ref}
        />
      }
    >
      <div className={"relative min-w-0 flex-auto rounded-[inherit]"}>
        {[<div
            ref={toolbarRowRef}
            data-mc-row={""}
            onScroll={(scrollEvent: React.UIEvent<HTMLDivElement>) => {
              if (ref.current !== null) {
                updateToolbarOverflowAttributes(
                  ref.current,
                  scrollEvent.currentTarget,
                );
              }
              onScroll?.(scrollEvent);
            }}
            className={joinClassNames(
              "flex min-w-0 items-center gap-[var(--mc-strip-gap)] rounded-[inherit] p-[var(--mc-strip-pad)]",
              wrap
                ? "flex-wrap"
                : "overflow-x-auto [clip-path:inset(0_1px)] [scrollbar-width:none] [&>*]:shrink-0",
            )}
          >
            <ToolbarTooltipSideContext.Provider
              value={placed === "below" ? "bottom" : "top"}
            >
              <ToolbarGroupWrapContext.Provider value={wrap}>
                <TooltipProvider>{children}</TooltipProvider>
              </ToolbarGroupWrapContext.Provider>
            </ToolbarTooltipSideContext.Provider>
          </div>, <span
            aria-hidden={"true"}
            data-tb-fade={"start"}
            className={
              "pointer-events-none absolute inset-y-px left-px z-10 w-12"
            }
          >
            <span
              className={
                "pointer-events-auto absolute inset-y-0 left-0 w-[30%]"
              }
            />
          </span>, <span
            aria-hidden={"true"}
            data-tb-fade={"end"}
            className={
              "pointer-events-none absolute inset-y-px right-px z-10 w-12"
            }
          >
            <span
              className={
                "pointer-events-auto absolute inset-y-0 right-0 w-[30%]"
              }
            />
          </span>]}
      </div>
    </CdsRoot>
  );
}
function ToolbarDivider(): React.ReactElement {
  useUiLocale();
  return (
    <span
      aria-hidden={"true"}
      data-mc-divider={""}
      className={"mx-0.5 h-[18px] w-px bg-border-line"}
    />
  );
}
export {
  accessibleKeyShortcut,
  afterTwoAnimationFramesUiToolbarControls,
  coarseToolbarPointer,
  completedToolbarPointerSession,
  installedToolbarPointerDocuments,
  installToolbarPointerTracking,
  isToolbarClickThrough,
  jsxForUiToolbarControls,
  toolbarButtonJsx as jsxForUiToolbarControls2,
  jsxToolbarButtons,
  jsxToolbarIndicators,
  jsxToolbarLabels,
  jsxToolbarLayout,
  jsxToolbarSeparators,
  lastToolbarTouchRelease,
  matchesToolbarPointerEvent,
  monotonicNow,
  ownShortcutMapping,
  PANEL_ELEVATION,
  pointInsideElement,
  POPOVER_ELEVATION,
  reactForUiToolbarControls,
  reactToolbarButton as reactForUiToolbarControls2,
  reactToolbarButtons,
  reactToolbarControls,
  reactToolbarLayout,
  SHORTCUT_KEY_NAMES,
  SHORTCUT_MODIFIER_LABELS,
  SHORTCUT_MODIFIER_NAMES,
  SHORTCUT_SPOKEN_REPLACEMENTS,
  spokenShortcut,
  TOOLBAR_EARLY_HOLD_MS,
  TOOLBAR_POINTER_COORDINATE_TOLERANCE,
  TOOLBAR_POINTER_TIME_TOLERANCE,
  TOOLBAR_POSITION_TOLERANCE,
  TOOLBAR_STRAY_HOLD_MS,
  TOOLBAR_TOUCH_HOLD_MS,
  TOOLBAR_TOUCH_RECENCY_MS,
  ToolbarButton,
  ToolbarCaret,
  toolbarClickThroughTimer,
  ToolbarDivider,
  toolbarElementClickThroughDeadline,
  ToolbarFloatingContext,
  ToolbarGroupWrapContext,
  toolbarPointerSession,
  ToolbarQuietContext,
  toolbarRecentTouchDeadline,
  ToolbarStrip,
  ToolbarStripButton,
  toolbarStripClickThroughDeadline,
  toolbarStrips,
  toolbarTooltipContent,
  toolbarTouchDeadlines,
  updateToolbarClickThroughAttributes,
  updateToolbarOverflowAttributes,
  updateToolbarTouchDeadline,
  useButtonAccessibility,
  useDeferredTooltipFocus,
  useDisabledButtonDescription,
};
export function installUiToolbarControls(): () => void {
  return () => {
    jsxToolbarLabels = toModuleNamespace(
      loadJsxNamespace(),
      1,
    );
    jsxToolbarSeparators = toModuleNamespace(
      loadJsxNamespace(),
      1,
    );
    reactToolbarLayout = toModuleNamespace(
      loadReactNamespace(),
      1,
    );
    jsxToolbarLayout = toModuleNamespace(
      loadJsxNamespace(),
      1,
    );
    reactToolbarButtons = toModuleNamespace(
      loadReactNamespace(),
      1,
    );
    jsxToolbarButtons = toModuleNamespace(
      loadJsxNamespace(),
      1,
    );
    jsxToolbarIndicators = toModuleNamespace(
      loadJsxNamespace(),
      1,
    );
    reactToolbarControls = toModuleNamespace(
      loadReactNamespace(),
      1,
    );
    reactForUiToolbarControls = toModuleNamespace(
      loadReactNamespace(),
      1,
    );
    PANEL_ELEVATION = "panel";
    POPOVER_ELEVATION = "popover";
    reactToolbarButton = toModuleNamespace(
      loadReactNamespace(),
      1,
    );
    jsxForUiToolbarControls = toModuleNamespace(
      loadJsxNamespace(),
      1,
    );
    ToolbarFloatingContext = reactToolbarButton.createContext(false);
    ToolbarQuietContext = reactToolbarButton.createContext(false);
    SHORTCUT_MODIFIER_NAMES = {
      ctrl: ["Control", "Ctrl"],
      control: ["Control", "Ctrl"],
      alt: ["Option", "Alt"],
      option: ["Option", "Alt"],
      shift: ["Shift", "Shift"],
      cmd: ["Command", "Ctrl"],
      command: ["Command", "Ctrl"],
      meta: ["Command", "Ctrl"],
    };
    SHORTCUT_MODIFIER_LABELS = [
      "Control",
      "Ctrl",
      "Option",
      "Alt",
      "Shift",
      "Command",
    ];
    SHORTCUT_KEY_NAMES = {
      esc: "Escape",
      escape: "Escape",
      enter: ["Return", "Enter"],
      return: ["Return", "Enter"],
      delete: ["Delete", "Backspace"],
      backspace: ["Delete", "Backspace"],
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
    ownShortcutMapping = <T,>(mapping: Record<string, T>, key: string) =>
      Object.hasOwn(mapping, key) ? mapping[key] : undefined;
    SHORTCUT_SPOKEN_REPLACEMENTS = [
      [/⌘/g, "Command ", "Ctrl "],
      [/⇧/g, "Shift ", "Shift "],
      [/⌥/g, "Option ", "Alt "],
      [/⌃/g, "Control ", "Ctrl "],
      [/⏎/g, "Return", "Enter"],
      [/⌫/g, "Delete", "Backspace"],
    ];
    ToolbarButton = reactToolbarButton.forwardRef(function (
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
      }: Color.ToolbarButtonProps,
      forwardedRef: React.ForwardedRef<HTMLButtonElement>,
    ) {
      let value = reactToolbarButton.useContext(ToolbarFloatingContext),
        isDisabled = props.disabled === true,
        buttonLabel = count ? label + " (" + String(count) + ")" : label,
        buttonIcon = icon ?? glyph,
        tooltip = toolbarTooltipContent({
          label: label,
          tip: tip,
          disabledTip: disabledTip,
          shortcut: shortcut,
          disabled: isDisabled,
        }),
        accessibility = useButtonAccessibility({
          disabled: isDisabled,
          name: buttonLabel,
          tip: tooltip.content,
          shortcut: tooltip.shortcut,
          describedBy: ariaDescribedby,
          descriptionSuffix: descriptionSuffix,
        }),
        disabledAccessibility = useDisabledButtonDescription({
          disabled: isDisabled,
          name: buttonLabel,
          reason: disabledTip ?? tip,
          pressed: pressed,
          expanded: expanded ?? ariaExpanded,
          hasPopup: props["aria-haspopup"],
        }),
        ref = reactToolbarButton.useRef<HTMLElement | null>(null);
      useDeferredTooltipFocus(ref, isDisabled);
      let state = {
          ...props,
          ref: forwardedRef,
          variant: variant,
          pressed: pressed,
          "aria-expanded": expanded ?? ariaExpanded,
          "aria-label": buttonLabel,
          "aria-describedby": accessibility.describedBy,
          "aria-keyshortcuts":
            props["aria-keyshortcuts"] ?? accessibility.keyShortcuts,
          ...disabledAccessibility.inner,
        },
        useIconOnlyLayout = iconOnly === true || (value && variant !== "primary"),
        hideText = useIconOnlyLayout && caret !== true;
      return (
        <Tooltip
          content={tooltip.content}
          shortcut={tooltip.shortcut}
          side={tipSide}
          hoverable={false}
        >
          <span
            ref={ref}
            tabIndex={isDisabled ? 0 : -1}
            {...disabledAccessibility.props}
            data-tb-icon={hideText ? "" : undefined}
            className={joinClassNames(
              "relative inline-flex shrink-0 rounded align-top outline-none focus-visible:outline-hidden focus-visible:shadow-focus",
              className,
            )}
          >
            {[useIconOnlyLayout ? (
                caret === true ? (
                  <Button {...state} icon={buttonIcon}>
                    <ToolbarCaret />
                  </Button>
                ) : (
                  <Button
                    {...state}
                    iconOnly={true}
                    icon={buttonIcon}
                    tooltip={false}
                  />
                )
              ) : (
                <Button {...state} icon={buttonIcon}>
                  {[label, children, caret === true ? (
                      <ToolbarCaret inherit={variant === "primary"} />
                    ) : null]}
                </Button>
              ), count ? (
                <span
                  aria-hidden={"true"}
                  className={
                    "pointer-events-none absolute -top-0.5 -right-0.5 flex"
                  }
                >
                  <Counter
                    value={count}
                    variant={"accent"}
                    size={"xs"}
                  />
                </span>
              ) : null, accessibility.mirror, disabledAccessibility.mirror]}
          </span>
        </Tooltip>
      );
    });
    toolbarButtonJsx = toModuleNamespace(
      loadJsxNamespace(),
      1,
    );
    toolbarPointerSession = null;
    installedToolbarPointerDocuments = new WeakSet();
    monotonicNow = () =>
      typeof performance === "undefined" ? null : performance.now();
    TOOLBAR_POINTER_TIME_TOLERANCE = 500;
    TOOLBAR_POINTER_COORDINATE_TOLERANCE = 8;
    TOOLBAR_TOUCH_HOLD_MS = 1000;
    TOOLBAR_TOUCH_RECENCY_MS = 5000;
    TOOLBAR_STRAY_HOLD_MS = 3000;
    TOOLBAR_EARLY_HOLD_MS = 8000;
    pointInsideElement = (element: Element, x: number, y: number) => {
      let bounds = element.getBoundingClientRect();
      return (
        bounds.width > 0 &&
        bounds.height > 0 &&
        x >= bounds.left &&
        x <= bounds.right &&
        y >= bounds.top &&
        y <= bounds.bottom
      );
    };
    if (typeof document !== "undefined") {
      installToolbarPointerTracking(document);
    }
    matchesToolbarPointerEvent = (
      event: Pick<MouseEvent, "timeStamp" | "clientX" | "clientY">,
      timestamp: number,
      x: number,
      y: number,
    ) =>
      Math.abs(event.timeStamp - timestamp) <= TOOLBAR_POINTER_TIME_TOLERANCE &&
      Math.abs(event.clientX - x) <= TOOLBAR_POINTER_COORDINATE_TOLERANCE &&
      Math.abs(event.clientY - y) <= TOOLBAR_POINTER_COORDINATE_TOLERANCE;
    toolbarStrips = new Set();
    toolbarClickThroughTimer = null;
    lastToolbarTouchRelease = null;
    afterTwoAnimationFramesUiToolbarControls = (
      callback: FrameRequestCallback,
    ) => {
      if (typeof requestAnimationFrame === "function") {
        requestAnimationFrame(() => requestAnimationFrame(callback));
      }
    };
    TOOLBAR_POSITION_TOLERANCE = 4;
    toolbarTouchDeadlines = new WeakMap();
    ToolbarGroupWrapContext = reactForUiToolbarControls.createContext(true);
    ToolbarStripButton = reactForUiToolbarControls.forwardRef(function (
      {
        className: className,
        type: type,
        onMouseDown: onMouseDown,
        chevron: chevron,
        icon: icon,
        children: children,
        title: title,
        disabled: disabled,
        "aria-pressed": ariaPressed,
        "aria-label": ariaLabel,
        "aria-expanded": ariaExpanded,
        "aria-describedby": ariaDescribedby,
        ...props
      }: Color.ToolbarStripButtonProps,
      forwardedRef: React.ForwardedRef<HTMLButtonElement>,
    ) {
      let value =
          ariaPressed === undefined
            ? undefined
            : ariaPressed === true || ariaPressed === "true",
        callback = (event: React.MouseEvent<HTMLButtonElement>) => {
          event.preventDefault();
          onMouseDown?.(event);
        },
        isDisabled = disabled === true,
        tooltipSide =
          reactForUiToolbarControls.useContext(
            ToolbarTooltipSideContext,
          ) ?? "top",
        accessibleLabel =
          ariaLabel ?? (typeof children === "string" ? children : undefined),
        disabledAccessibility = useDisabledButtonDescription({
          disabled: isDisabled && title !== undefined,
          name: accessibleLabel ?? title ?? "",
          reason: title,
          pressed: ariaPressed,
          expanded: ariaExpanded,
          hasPopup: props["aria-haspopup"],
        }),
        ref = reactForUiToolbarControls.useRef<HTMLElement | null>(null);
      useDeferredTooltipFocus(ref, isDisabled && title !== undefined);
      let descriptionId = reactForUiToolbarControls.useId(),
        describeWithTitle = !isDisabled && !!title && accessibleLabel?.startsWith(title) !== true,
        describedBy =
          [ariaDescribedby, describeWithTitle ? descriptionId : undefined]
            .filter(Boolean)
            .join(" ") || undefined,
        state = {
          ref: forwardedRef,
          variant: "ghost" as const,
          type: type ?? "button",
          pressed: value,
          disabled: disabled,
          "aria-expanded": ariaExpanded,
          "aria-describedby": describedBy,
          onMouseDown: callback,
          className: joinClassNames("shrink-0", className),
          ...props,
          "data-mc-item": "",
          ...disabledAccessibility.inner,
        },
        button =
          icon !== undefined &&
          (children === undefined || children === null) ? (
            <Button
              {...state}
              iconOnly={true}
              icon={icon}
              aria-label={ariaLabel ?? ("")}
              tooltip={false}
            />
          ) : (
            <Button {...state} icon={icon} aria-label={ariaLabel}>
              {[children, chevron === true ? (
                  <Icon
                    name={"CaretDown"}
                    size={"sm"}
                    className={"shrink-0 opacity-60"}
                  />
                ) : null]}
            </Button>
          );
      if (title === undefined) {
        return button;
      }
      return (
        <Tooltip
          content={title}
          side={tooltipSide}
          hoverable={false}
          open={
            (ariaExpanded === true || ariaExpanded === "true") && !isDisabled
              ? false
              : undefined
          }
        >
          <span
            ref={ref}
            tabIndex={isDisabled ? 0 : -1}
            {...disabledAccessibility.props}
            data-tip={title}
            className={
              "relative inline-flex shrink-0 rounded align-top outline-none focus-visible:outline-hidden focus-visible:shadow-focus"
            }
          >
            {[button, describeWithTitle ? (
                <span hidden={true} id={descriptionId}>
                  {title}
                </span>
              ) : null, disabledAccessibility.mirror]}
          </span>
        </Tooltip>
      );
    });
  };
}
