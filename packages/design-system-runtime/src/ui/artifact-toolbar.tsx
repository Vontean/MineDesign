import { useUiLocale } from '../ui-locale.ts';
import { uiMessage } from '@minedesign/contracts/ui-messages';
/** Restored application module; prepare first, initialize in original order. */
import type * as React from "react";
import type {
  ReactNamespace,
  JsxNamespace,
  ToolbarContentOptions,
  SaveStatusProps,
  SaveStatusControlProps,
  ToolbarScrollPaddleProps,
  ToolbarScrollAreaProps,
  ToolbarSaveControlsProps,
  ToolbarSurfaceProps,
  ArtifactToolbarProps,
} from "../contracts/composition";
import { loadJsxNamespace, loadReactNamespace } from "../dependencies";
import { hostDrawsReadOnly, hostDrawsSave, hostTakesRetry, subscribeHostSaveChrome } from "../host/frame-bridge";
import { toModuleNamespace } from "../module-helpers";
import { Tooltip, TooltipProvider } from "./avatars";
import { Button } from "./buttons";
import { Icon } from "./interactions";
import { CdsRoot } from "./overlays";
import { joinClassNames } from "./property-icons";
import { collectFocusableDescendants, suppressEnterClicksUntilRelease } from "./property-popover";
import { useCoarsePointer } from "./select";
import { Surface } from "./surfaces";
import { PANEL_ELEVATION, ToolbarButton, ToolbarFloatingContext, ToolbarQuietContext, useDeferredTooltipFocus, useDisabledButtonDescription } from "./toolbar-controls";

var reactForUiArtifactToolbar: ReactNamespace;
var jsxForUiArtifactToolbar: JsxNamespace;
var TOOLBAR_WIDE_BREAKPOINT: number;
var TOOLBAR_COMPACT_BREAKPOINT: number;
var TOOLBAR_FULL_BREAKPOINT: number;
var TOOLBAR_QUIET_SELECTOR: string;
var TOOLBAR_CONTENT_SELECTOR: string;
var TOOLBAR_LAYOUT_ROLES: Set<string>;
var isToolbarSaveIndicator: (element: Element) => boolean;
var toggleAttributeIfChanged: (
  element: Element,
  attribute: string,
  enabled: boolean,
) => void;
var TOOLBAR_SCROLL_FOCUS_MARGIN: number;
var TOOLBAR_PADDLE_CLASS: string;
function hasVisibleToolbarContent(
  element: Element,
  visibilityOptions: ToolbarContentOptions = {},
) {
  let attribute = element.getAttribute("role");
  if (
    visibilityOptions.skip?.(element) ||
    (visibilityOptions.pinFixed && element.classList.contains("tb-pin-scroll"))
  ) {
    return false;
  }
  if (element.hasAttribute("data-tb-shows") && !element.closest("[hidden]")) {
    return true;
  }
  if (element.matches(TOOLBAR_QUIET_SELECTOR) || attribute === "separator") {
    return false;
  }
  if (
    element.matches(TOOLBAR_CONTENT_SELECTOR) ||
    (attribute !== null && !TOOLBAR_LAYOUT_ROLES.has(attribute))
  ) {
    return true;
  }
  for (let value of element.childNodes) {
    if (value.nodeType === 3 && value.textContent?.trim()) {
      return true;
    }
    if (
      value.nodeType === 1 &&
      hasVisibleToolbarContent(value as Element, visibilityOptions)
    ) {
      return true;
    }
  }
  return false;
}
function toolbarContentCount(
  element: Element,
  visibilityOptions?: ToolbarContentOptions,
) {
  let index = 0;
  for (let value of element.children) {
    index += value.matches("[data-tb-seat], .contents")
      ? toolbarContentCount(value, visibilityOptions)
      : hasVisibleToolbarContent(value as Element, visibilityOptions)
        ? 1
        : 0;
  }
  return index;
}
function updateToolbarEmptyState(toolbar: Element) {
  let state = {
    pinFixed: toolbar.hasAttribute("data-pin-fixed"),
  };
  for (let value of toolbar.querySelectorAll(
    ".tb-slot, .tb-tail, .tb-publish",
  )) {
    toggleAttributeIfChanged(
      value,
      "data-tb-empty",
      !hasVisibleToolbarContent(value, state),
    );
  }
  for (let value of toolbar.querySelectorAll(".tb-tail")) {
    toggleAttributeIfChanged(
      value,
      "data-tb-only-dot",
      !hasVisibleToolbarContent(value, {
        ...state,
        skip: isToolbarSaveIndicator,
      }),
    );
  }
  for (let value of toolbar.querySelectorAll(".tb-publish")) {
    toggleAttributeIfChanged(
      value,
      "data-tb-has-save",
      [...value.querySelectorAll("[data-tb-save]")].some((saveArea: Element) =>
        hasVisibleToolbarContent(saveArea, state),
      ),
    );
  }
  for (let value of toolbar.querySelectorAll(".tb-card")) {
    toggleAttributeIfChanged(
      value,
      "data-tb-empty",
      !hasVisibleToolbarContent(value, state),
    );
  }
  let element = toolbar.querySelector(".tb-card-start");
  if (element) {
    let index = 0;
    for (let value of element.querySelectorAll(".tb-scroll > .tb-slot")) {
      index += toolbarContentCount(value, state);
    }
    toggleAttributeIfChanged(element, "data-tb-floor", index >= 3);
  }
}
function updateToolbarWordLock(toolbar: Element) {
  let element = toolbar.querySelector<HTMLElement>(".tb-scroll");
  if (!element) {
    return;
  }
  if (!element.querySelector(".tb-lock-words")) {
    return element.removeAttribute("data-tb-lock-words");
  }
  if (element.scrollLeft > 1 && !element.hasAttribute("data-tb-lock-words")) {
    return;
  }
  let yieldingContent = element.querySelector<HTMLElement>(".tb-yields"),
    lockMode = yieldingContent ? "yield" : "";
  if (element.getAttribute("data-tb-lock-words") !== lockMode) {
    element.setAttribute("data-tb-lock-words", lockMode);
  }
  let yieldingContentClipped =
    yieldingContent != null &&
    yieldingContent.clientWidth < TOOLBAR_SCROLL_FOCUS_MARGIN &&
    yieldingContent.scrollWidth > yieldingContent.clientWidth;
  if (element.scrollWidth > element.clientWidth + 1 || yieldingContentClipped) {
    element.removeAttribute("data-tb-lock-words");
  }
}
function effectiveToolbarDensity(
  density: import("../contracts/controls").Density = "compact",
) {
  if (useCoarsePointer()) {
    return "comfortable";
  } else {
    return density;
  }
}
function SaveStatusDot({ state: state }: SaveStatusProps) {
  useUiLocale();
  if (state.status === "error" || state.status === "readonly") {
    return <SaveProblemStatus state={state} />;
  }
  let isSaving = state.status === "saving",
    hasPendingEdits = state.status === "dirty";
  return (
    <span
      role={"status"}
      title={
        isSaving ? (uiMessage("design-system.artifactToolbar.saving")) : (hasPendingEdits ? (uiMessage("design-system.artifactToolbar.editsAreHeldInThe")) : (uiMessage("design-system.artifactToolbar.everyChangeSavesAutomatically")))
      }
      className={
        "inline-flex shrink-0 items-center gap-1.5 text-xs whitespace-nowrap text-fg-muted"
      }
    >
      {[<span
          className={
            "h-1.5 w-1.5 shrink-0 rounded-full " +
            (isSaving || hasPendingEdits ? "bg-fill-warning" : "bg-fill-success")
          }
        />, <span className={"tb-status-text truncate"}>
          {isSaving ? (uiMessage("design-system.artifactToolbar.saving")) : (hasPendingEdits ? (uiMessage("design-system.artifactToolbar.unsavedEdits")) : (uiMessage("design-system.artifactToolbar.savedAutomatically")))}
        </span>]}
    </span>
  );
}
function SaveStatusControl({
  state: state,
  onRetry: onRetry,
  tipSide = "bottom",
}: SaveStatusControlProps) {
  useUiLocale();
  let hostShowsSave = reactForUiArtifactToolbar.useSyncExternalStore(
      subscribeHostSaveChrome,
      hostDrawsSave,
      () => false,
    ),
    hostHandlesSaveRetry = reactForUiArtifactToolbar.useSyncExternalStore(
      subscribeHostSaveChrome,
      hostTakesRetry,
      () => false,
    ),
    [isFocused, setFocused] = reactForUiArtifactToolbar.useState(false),
    [isHovered, setHovered] = reactForUiArtifactToolbar.useState(false),
    [retryRequested, setRetryRequested] = reactForUiArtifactToolbar.useState(false),
    status = state.status,
    isWaiting =
      status === "saving" || status === "dirty" || status === "loading";
  if (retryRequested && !isWaiting && status !== "error") {
    setRetryRequested(false);
  }
  let isEngaged = isFocused || isHovered || (retryRequested && isWaiting);
  if (hostShowsSave && (status !== "error" || hostHandlesSaveRetry) && !isEngaged) {
    return null;
  }
  let indicatorState =
      status === "loading" || status === "cached"
        ? "loading"
        : status === "error"
          ? "error"
          : status === "dirty" || status === "saving"
            ? "pending"
            : "synced",
    isQuiet = indicatorState === "synced" && !isEngaged,
    statusText =
      state.message ??
      (indicatorState === "pending"
        ? "Syncing…"
        : indicatorState === "error"
          ? uiMessage("design-system.artifactToolbar.couldnTSyncClickTo")
          : uiMessage("design-system.artifactToolbar.allChangesSynced")),
    canRetry = status === "error" || status === "dirty";
  return (
    <Tooltip
      content={statusText}
      side={tipSide}
      align={"end"}
      multiline={true}
      hoverable={false}
      closeOnClick={false}
    >
      <button
        type={"button"}
        aria-disabled={canRetry ? undefined : true}
        onClick={() => {
          if (!canRetry) {
            return;
          }
          if (status === "error") {
            setRetryRequested(true);
          }
          onRetry();
        }}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        onPointerEnter={() => setHovered(true)}
        onPointerLeave={() => setHovered(false)}
        aria-label={statusText}
        data-sync={indicatorState}
        data-quiet={isQuiet ? "" : undefined}
        data-testid={"sync-dot"}
        className={"tb-sync-dot"}
      >
        <span aria-hidden={"true"} className={"tb-sync-dot-mark"} />
      </button>
    </Tooltip>
  );
}
function SaveProblemStatus({ state: state }: SaveStatusProps) {
  useUiLocale();
  let value = reactForUiArtifactToolbar.useSyncExternalStore(
    subscribeHostSaveChrome,
    hostDrawsReadOnly,
    () => false,
  );
  if (state.status === "error") {
    let errorMessage = state.message ?? uiMessage("design-system.artifactToolbar.couldnTSave");
    return (
      <span
        role={"status"}
        title={errorMessage}
        className={
          "inline-flex max-w-80 shrink-0 items-center gap-1.5 truncate rounded-full bg-bad/10 px-2 py-0.5 text-xs font-medium whitespace-nowrap text-bad"
        }
      >
        {[<span
            className={"h-1.5 w-1.5 shrink-0 rounded-full bg-fill-danger"}
          />, <span className={"tb-status-text truncate"}>{errorMessage}</span>]}
      </span>
    );
  }
  if (state.status === "readonly") {
    if (value) {
      return null;
    }
    return (
      <span
        role={"status"}
        title={state.message ?? (uiMessage("design-system.artifactToolbar.readOnly"))}
        className={
          "tb-lock inline-flex shrink-0 items-center gap-1.5 px-1 text-body whitespace-nowrap text-fg-muted"
        }
      >
        {[<Icon name={"Lock"} size={"auto"} className={"shrink-0"} />, <span className={"tb-lock-words truncate"}>{uiMessage("design-system.artifactToolbar.readOnly")}</span>]}
      </span>
    );
  }
  return null;
}
function toolbarScrollPageTarget(
  direction: number,
  scrollLeft: number,
  viewportWidth: number,
  scrollWidth: number,
  margin: number,
) {
  let maxScrollLeft = Math.max(0, scrollWidth - viewportWidth),
    pageWidth = Math.max(viewportWidth - 2 * margin, 48),
    targetScrollLeft = scrollLeft + direction * pageWidth;
  if (direction === 1 && maxScrollLeft - targetScrollLeft <= margin) {
    targetScrollLeft = maxScrollLeft;
  }
  if (direction === -1 && targetScrollLeft <= margin) {
    targetScrollLeft = 0;
  }
  return Math.min(maxScrollLeft, Math.max(0, targetScrollLeft));
}
function isFocusVisibleUiArtifactToolbar(element: Element) {
  try {
    return element.matches(":focus-visible");
  } catch {
    return false;
  }
}
function ToolbarScrollPaddle({
  dir: dir,
  onPress: onPress,
  onLetGo: onLetGo,
}: ToolbarScrollPaddleProps) {
  useUiLocale();
  let value = dir === -1 ? uiMessage("design-system.artifactToolbar.scrollToolbarLeft") : uiMessage("design-system.artifactToolbar.scrollToolbarRight");
  return (
    <div
      data-tb-paddle={""}
      onClick={(event: React.MouseEvent<HTMLDivElement>) =>
        onPress(event.detail === 0)
      }
      className={joinClassNames(
        TOOLBAR_PADDLE_CLASS,
        dir === -1 ? "left-0" : "right-0",
      )}
    >
      <Button
        iconOnly={true}
        size={"xs"}
        variant={"ghost"}
        icon={dir === -1 ? "CaretLeft" : "CaretRight"}
        aria-label={value}
        tooltip={false}
        onBlur={onLetGo}
        onPointerDown={onLetGo}
      />
    </div>
  );
}
function ToolbarScrollArea({
  leading: leading,
  revealLeading: revealLeading,
  children: children,
}: ToolbarScrollAreaProps) {
  useUiLocale();
  let scrollRef = reactForUiArtifactToolbar.useRef<HTMLDivElement | null>(null),
    viewportRef = reactForUiArtifactToolbar.useRef<HTMLDivElement | null>(null),
    [showLeftPaddle, setShowLeftPaddle] = reactForUiArtifactToolbar.useState(false),
    [showRightPaddle, setShowRightPaddle] = reactForUiArtifactToolbar.useState(false),
    hasCoarsePointer = useCoarsePointer(),
    lastRevealKeyRef = reactForUiArtifactToolbar.useRef<string | undefined>(undefined),
    paddlePressedByKeyboardRef = reactForUiArtifactToolbar.useRef(false),
    movingFocusFromPaddleRef = reactForUiArtifactToolbar.useRef(false);
  reactForUiArtifactToolbar.useEffect(() => {
    if (revealLeading != null && revealLeading !== lastRevealKeyRef.current) {
      scrollRef.current?.scrollTo({
        left: 0,
        behavior: "smooth",
      });
    }
    lastRevealKeyRef.current = revealLeading;
  }, [revealLeading]);
  let updatePaddles = reactForUiArtifactToolbar.useCallback(() => {
    let current = scrollRef.current;
    if (!current) {
      return;
    }
    let hasPaddleSpace =
        (viewportRef.current?.clientWidth ?? current.clientWidth) >=
        (hasCoarsePointer ? 80 : 48),
      canScrollLeft = hasPaddleSpace && current.scrollLeft > 1,
      canScrollRight =
        hasPaddleSpace &&
        current.scrollLeft + current.clientWidth < current.scrollWidth - 1,
      viewport = viewportRef.current,
      activeElement = current.ownerDocument.activeElement,
      focusedPaddle = activeElement?.closest("[data-tb-paddle]");
    if (
      viewport &&
      activeElement &&
      focusedPaddle?.parentElement === viewport &&
      (paddlePressedByKeyboardRef.current || isFocusVisibleUiArtifactToolbar(activeElement))
    ) {
      let isRightPaddle = focusedPaddle === viewport.lastElementChild;
      if (!(isRightPaddle ? canScrollRight : canScrollLeft)) {
        let focusableElements = collectFocusableDescendants(current);
        movingFocusFromPaddleRef.current = true;
        try {
          for (let element of isRightPaddle ? focusableElements.reverse() : focusableElements) {
            if (element.hasAttribute("data-base-ui-focus-guard")) {
              continue;
            }
            element.focus({
              preventScroll: true,
            });
            if (focusedPaddle.contains(current.ownerDocument.activeElement)) {
              continue;
            }
            suppressEnterClicksUntilRelease();
            break;
          }
        } finally {
          movingFocusFromPaddleRef.current = false;
        }
      }
    }
    setShowLeftPaddle(canScrollLeft);
    setShowRightPaddle(canScrollRight);
  }, [hasCoarsePointer]);
  reactForUiArtifactToolbar.useEffect(() => {
    let current = scrollRef.current;
    if (!current) {
      return;
    }
    updatePaddles();
    let ancestor = current.closest(".tb-root"),
      index = 0,
      observer = new ResizeObserver(() => {
        updatePaddles();
        cancelAnimationFrame(index);
        if (ancestor) {
          index = requestAnimationFrame(() =>
            updateToolbarWordLock(ancestor),
          );
        }
      });
    observer.observe(current);
    for (let child of current.children) {
      observer.observe(child);
    }
    let endOfToolbar = ancestor?.querySelector(".tb-card-end");
    if (ancestor) {
      observer.observe(ancestor);
    }
    if (endOfToolbar) {
      observer.observe(endOfToolbar);
    }
    let onWheel = (event: WheelEvent) => {
      if (
        (event.ctrlKey && current.closest("[data-tb-overlay]")) ||
        current.scrollWidth <= current.clientWidth
      ) {
        return;
      }
      let delta =
        Math.abs(event.deltaX) > Math.abs(event.deltaY)
          ? event.deltaX
          : event.deltaY;
      if (delta === 0) {
        return;
      }
      current.scrollLeft += delta;
      event.preventDefault();
    };
    current.addEventListener("wheel", onWheel, {
      passive: false,
    });
    let onFocusIn = (event: FocusEvent) => {
      let target = event.target,
        viewport = viewportRef.current;
      if (
        !viewport ||
        movingFocusFromPaddleRef.current ||
        !(target instanceof Element) ||
        target.hasAttribute("data-base-ui-focus-guard") ||
        !isFocusVisibleUiArtifactToolbar(target)
      ) {
        return;
      }
      let bounds = target.getBoundingClientRect();
      if (bounds.width <= 1) {
        return;
      }
      let viewportBounds = viewport.getBoundingClientRect(),
        childWidth = (selector: string) =>
          viewport.querySelector(":scope > " + selector)?.getBoundingClientRect()
            .width ?? 0,
        paddleWidth = childWidth("[data-tb-paddle]"),
        sideInset =
          viewportBounds.width - 2 * (paddleWidth + childWidth("[data-tb-fade]")) >=
          bounds.width
            ? paddleWidth + childWidth("[data-tb-fade]")
            : paddleWidth,
        visibleLeft = viewportBounds.left + sideInset,
        visibleRight = viewportBounds.right - sideInset,
        scrollDelta =
          bounds.left < visibleLeft || bounds.width > visibleRight - visibleLeft
            ? bounds.left - visibleLeft
            : bounds.right > visibleRight
              ? bounds.right - visibleRight
              : 0;
      if (Math.round(scrollDelta) === 0) {
        return;
      }
      let maxScrollLeft = current.scrollWidth - current.clientWidth,
        targetScrollLeft = current.scrollLeft + scrollDelta;
      if (targetScrollLeft <= sideInset && bounds.right - scrollDelta + targetScrollLeft <= visibleRight) {
        targetScrollLeft = 0;
      } else if (
        maxScrollLeft - targetScrollLeft <= sideInset &&
        bounds.left - scrollDelta - (maxScrollLeft - targetScrollLeft) >= visibleLeft
      ) {
        targetScrollLeft = maxScrollLeft;
      }
      current.scrollLeft = Math.round(targetScrollLeft);
    };
    current.addEventListener("focusin", onFocusIn);
    return () => {
      cancelAnimationFrame(index);
      observer.disconnect();
      current.removeEventListener("wheel", onWheel);
      current.removeEventListener("focusin", onFocusIn);
    };
  }, [updatePaddles]);
  let releasePaddle = () => {
      paddlePressedByKeyboardRef.current = false;
    },
    scrollPage = (direction: number, fromKeyboard: boolean) => {
      let current = scrollRef.current;
      if (!current) {
        return;
      }
      let paddle = viewportRef.current?.querySelector<HTMLElement>(
          ":scope > [data-tb-paddle]",
        ),
        fade = viewportRef.current?.querySelector<HTMLElement>(
          ":scope > span[aria-hidden]",
        ),
        sideMargin = (paddle?.offsetWidth ?? 24) + (fade?.offsetWidth ?? 24),
        viewportWidth = viewportRef.current?.clientWidth ?? current.clientWidth,
        overflowInset = current.clientWidth - viewportWidth;
      paddlePressedByKeyboardRef.current = fromKeyboard;
      current.scrollTo({
        left: toolbarScrollPageTarget(
          direction,
          current.scrollLeft,
          viewportWidth,
          current.scrollWidth - overflowInset,
          sideMargin,
        ),
        behavior: "smooth",
      });
    };
  return (
    <div
      ref={viewportRef}
      className={"relative flex min-w-0 flex-1 items-center self-stretch"}
    >
      {[<div
          ref={scrollRef}
          onScroll={updatePaddles}
          className={
            "tb-scroll flex min-w-0 flex-1 items-center gap-1 self-stretch overflow-x-auto pointer-coarse:gap-1.5"
          }
        >
          {[leading != null ? (
              <span
                data-tb-cluster={""}
                className={
                  "tb-slot flex shrink-0 items-center gap-1 pointer-coarse:gap-1.5"
                }
              >
                {leading}
              </span>
            ) : null, <div
              className={
                "tb-slot flex min-w-max items-center gap-1 pointer-coarse:gap-1.5"
              }
            >
              {children}
            </div>]}
        </div>, showLeftPaddle ? (
          <jsxForUiArtifactToolbar.Fragment>
            {[<ToolbarScrollPaddle
                dir={-1}
                onPress={(fromKeyboard: boolean) => scrollPage(-1, fromKeyboard)}
                onLetGo={releasePaddle}
              />, <span
                aria-hidden={"true"}
                data-tb-fade={"start"}
                className={
                  "pointer-events-none absolute inset-y-0 left-6 z-10 w-6 pointer-coarse:left-10"
                }
              />]}
          </jsxForUiArtifactToolbar.Fragment>
        ) : null, showRightPaddle ? (
          <jsxForUiArtifactToolbar.Fragment>
            {[<span
                aria-hidden={"true"}
                data-tb-fade={"end"}
                className={
                  "pointer-events-none absolute inset-y-0 right-6 z-10 w-6 pointer-coarse:right-10"
                }
              />, <ToolbarScrollPaddle
                dir={1}
                onPress={(fromKeyboard: boolean) => scrollPage(1, fromKeyboard)}
                onLetGo={releasePaddle}
              />]}
          </jsxForUiArtifactToolbar.Fragment>
        ) : null]}
    </div>
  );
}
function ToolbarSaveControls({
  saveState: saveState,
  saveMode = "manual",
  onSave: onSave,
  syncDot = false,
  editing: editing,
  onToggleEdit: onToggleEdit,
}: ToolbarSaveControlsProps) {
  useUiLocale();
  let isReadOnly = saveState.status === "readonly",
    canSave = saveState.status === "dirty" || saveState.status === "error",
    isSaveDisabled = !canSave || saveState.status === "saving",
    isSaving = saveState.status === "saving",
    saveLabel = isSaving ? "Saving…" : "Save",
    saveDescription = isSaving
      ? saveLabel
      : canSave
        ? uiMessage("design-system.artifactToolbar.publishYourChangesEveryOpen")
        : uiMessage("design-system.artifactToolbar.everythingIsPublished"),
    disabledDescription = useDisabledButtonDescription({
      disabled: isSaveDisabled,
      name: saveLabel,
      reason: saveDescription,
    }),
    ref = reactForUiArtifactToolbar.useRef<HTMLSpanElement | null>(null);
  useDeferredTooltipFocus(ref, isSaveDisabled);
  return (
    <jsxForUiArtifactToolbar.Fragment>
      {[!isReadOnly && onToggleEdit ? (
          <ToolbarButton
            icon={"Edit"}
            label={uiMessage("design-system.artifactToolbar.edit")}
            tip={editing ? (uiMessage("design-system.artifactToolbar.doneEditingBackToThe")) : (uiMessage("design-system.artifactToolbar.edit"))}
            pressed={editing === true}
            onClick={onToggleEdit}
            data-testid={"dc-mode-edit"}
          />
        ) : null, !isReadOnly && syncDot ? (
          <SaveStatusControl state={saveState} onRetry={onSave} />
        ) : null, !isReadOnly && saveMode === "manual" && !syncDot ? (
          <Tooltip
            content={saveDescription}
            shortcut={canSave ? "cmd+s" : undefined}
            side={"bottom"}
            align={"end"}
            hoverable={false}
          >
            <span
              ref={ref}
              tabIndex={isSaveDisabled ? 0 : -1}
              {...disabledDescription.props}
              data-tb-save={""}
              className={
                "inline-flex shrink-0 rounded outline-none focus-visible:outline-hidden focus-visible:shadow-focus"
              }
            >
              {[<Button
                  variant={canSave ? "primary" : "secondary"}
                  disabled={isSaveDisabled}
                  onClick={onSave}
                  aria-label={saveLabel}
                  {...disabledDescription.inner}
                >
                  {saveLabel}
                </Button>, disabledDescription.mirror]}
            </span>
          </Tooltip>
        ) : null]}
    </jsxForUiArtifactToolbar.Fragment>
  );
}
function ToolbarSurface({
  floating: floating,
  ...remainingProps
}: ToolbarSurfaceProps) {
  useUiLocale();
  if (floating) {
    return (
      <Surface
        elevation={PANEL_ELEVATION}
        {...remainingProps}
      />
    );
  } else {
    return <div {...remainingProps} />;
  }
}
function ArtifactToolbar({
  title: title,
  saveState: saveState,
  saveMode = "manual",
  syncDot = false,
  onSave: onSave,
  undo: undo,
  publishControls = true,
  pinned: pinned,
  trailing: trailing,
  leading: leading,
  afterUndo: afterUndo,
  undoButtons = true,
  density = "compact",
  touchTargets: touchTargets,
  readOnly: readOnly,
  quietReadOnlyReason: quietReadOnlyReason,
  variant = "docked",
  children: children,
  extrasEnd: extrasEnd,
}: ArtifactToolbarProps) {
  useUiLocale();
  let [, setUndoRevision] = reactForUiArtifactToolbar.useState(0);
  reactForUiArtifactToolbar.useEffect(
    () => undo?.subscribe(() => setUndoRevision((revision: number) => revision + 1)),
    [undo],
  );
  let isReadOnly = readOnly === true || saveState.status === "readonly",
    hostShowsReadOnly = reactForUiArtifactToolbar.useSyncExternalStore(
      subscribeHostSaveChrome,
      hostDrawsReadOnly,
      () => false,
    ),
    resolvedDensity = effectiveToolbarDensity(density),
    toolbarDensity = touchTargets === "square" ? resolvedDensity : density,
    toolbarRef = reactForUiArtifactToolbar.useRef<HTMLDivElement | null>(null),
    [collapsed, setCollapsed] = reactForUiArtifactToolbar.useState(false),
    [pinControls, setPinControls] = reactForUiArtifactToolbar.useState(false),
    hasCoarsePointer = useCoarsePointer(),
    isFloating = variant === "floating";
  reactForUiArtifactToolbar.useLayoutEffect(() => {
    let current = toolbarRef.current;
    if (!current) {
      return;
    }
    let measureToolbar = () => {
        let style = getComputedStyle(current),
          availableWidth =
            current.clientWidth -
            parseFloat(style.paddingLeft || "0") -
            parseFloat(style.paddingRight || "0");
        setCollapsed(current.clientWidth > 0 && availableWidth <= TOOLBAR_WIDE_BREAKPOINT);
        setPinControls(
          current.clientWidth > 0 &&
            availableWidth <=
              (hasCoarsePointer
                ? TOOLBAR_FULL_BREAKPOINT
                : TOOLBAR_COMPACT_BREAKPOINT),
        );
        if (!isFloating) {
          return;
        }
        current.parentElement?.style.setProperty(
          "--tb-overlay-h",
          String(current.offsetHeight) + "px",
        );
        ancestor?.style.setProperty(
          "--tb-row-h",
          String(current.offsetHeight) + "px",
        );
      },
      ancestor = current.closest<HTMLElement>("[data-mc-paned]"),
      observer =
        typeof ResizeObserver !== "undefined"
          ? new ResizeObserver(measureToolbar)
          : null;
    observer?.observe(current);
    measureToolbar();
    return () => {
      observer?.disconnect();
      ancestor?.style.removeProperty("--tb-row-h");
      current.parentElement?.style.removeProperty("--tb-overlay-h");
    };
  }, [hasCoarsePointer, isFloating]);
  reactForUiArtifactToolbar.useLayoutEffect(() => {
    if (!toolbarRef.current) {
      return;
    }
    updateToolbarEmptyState(toolbarRef.current);
    updateToolbarWordLock(toolbarRef.current);
  });
  reactForUiArtifactToolbar.useLayoutEffect(() => {
    let current = toolbarRef.current;
    if (!current || typeof MutationObserver === "undefined") {
      return;
    }
    let index = 0,
      observer = new MutationObserver(() => {
        cancelAnimationFrame(index);
        index = requestAnimationFrame(() => {
          updateToolbarEmptyState(current);
          updateToolbarWordLock(current);
        });
      });
    observer.observe(current, {
      subtree: true,
      childList: true,
      characterData: true,
      attributes: true,
      attributeFilter: [
        "hidden",
        "aria-hidden",
        "data-quiet",
        "data-pin-fixed",
      ],
    });
    return () => {
      observer.disconnect();
      cancelAnimationFrame(index);
    };
  }, []);
  return (
    <CdsRoot
      density={toolbarDensity}
      render={
        <header
          ref={toolbarRef}
          data-collapsed={collapsed ? "" : undefined}
          data-pin-fixed={pinControls ? "" : undefined}
          data-touch-targets={touchTargets}
          data-tb-overlay={isFloating ? "" : undefined}
          className={joinClassNames(
            "tb-root flex shrink-0 items-center",
            isFloating
              ? "absolute inset-x-0 top-0 z-toolbar"
              : "h-10 gap-1 px-1 shadow-[inset_0_-1px_0_0_var(--t-border)] pointer-coarse:h-12 pointer-coarse:gap-1.5 pointer-coarse:px-2",
          )}
        />
      }
    >
      <TooltipProvider>
        <ToolbarFloatingContext.Provider value={collapsed}>
          <ToolbarQuietContext.Provider value={isReadOnly}>
            {[<ToolbarSurface
                floating={isFloating}
                className={"tb-card tb-card-start flex min-w-0 items-center"}
              >
                <ToolbarScrollArea
                  revealLeading={
                    (saveState.status === "readonly" && !hostShowsReadOnly) ||
                    (saveState.status === "error" && !syncDot)
                      ? saveState.status
                      : undefined
                  }
                  leading={
                    <jsxForUiArtifactToolbar.Fragment>
                      {[leading, undo && !isReadOnly && undoButtons ? (
                          <jsxForUiArtifactToolbar.Fragment>
                            {[<ToolbarButton
                                iconOnly={true}
                                icon={"ArrowCounterClockwise"}
                                label={uiMessage("design-system.artifactToolbar.undo")}
                                disabledTip={"Nothing to undo yet"}
                                shortcut={"cmd+z"}
                                disabled={!undo.canUndo()}
                                onClick={() => undo.undo()}
                              />, <ToolbarButton
                                iconOnly={true}
                                icon={"ArrowClockwise"}
                                label={uiMessage("design-system.artifactToolbar.redo")}
                                disabledTip={"Nothing to redo"}
                                shortcut={"shift+cmd+z"}
                                disabled={!undo.canRedo()}
                                onClick={() => undo.redo()}
                              />]}
                          </jsxForUiArtifactToolbar.Fragment>
                        ) : null, afterUndo, saveState.status === "readonly" &&
                        quietReadOnlyReason !== undefined &&
                        saveState.message ===
                          quietReadOnlyReason ? null : syncDot ? (
                          saveState.status === "readonly" ? (
                            <SaveProblemStatus state={saveState} />
                          ) : null
                        ) : saveMode === "auto" ? (
                          <SaveStatusDot state={saveState} />
                        ) : (
                          <SaveProblemStatus state={saveState} />
                        )]}
                    </jsxForUiArtifactToolbar.Fragment>
                  }
                >
                  {children}
                </ToolbarScrollArea>
              </ToolbarSurface>, <ToolbarSurface
                floating={isFloating}
                className={
                  "tb-card tb-card-end ml-auto flex items-center gap-1 pointer-coarse:gap-1.5"
                }
              >
                {[extrasEnd != null ? (
                    <span
                      data-tb-cluster={""}
                      className={
                        "tb-slot flex shrink-0 items-center gap-1 pointer-coarse:gap-1.5"
                      }
                    >
                      {extrasEnd}
                    </span>
                  ) : null, (pinned != null && pinControls) || trailing != null ? (
                    <span
                      className={
                        "tb-tail flex items-center gap-1 pointer-coarse:gap-1.5"
                      }
                    >
                      {[pinned != null && pinControls ? (
                          <span
                            data-tb-cluster={""}
                            className={
                              "tb-pin-fixed flex shrink-0 items-center gap-1 empty:hidden pointer-coarse:gap-1.5"
                            }
                          >
                            {pinned}
                          </span>
                        ) : null, trailing != null ? (
                          <span
                            data-tb-cluster={""}
                            className={
                              "tb-slot flex items-center gap-1 pointer-coarse:gap-1.5"
                            }
                          >
                            {trailing}
                          </span>
                        ) : null]}
                    </span>
                  ) : null, publishControls ? (
                    <span
                      className={
                        "tb-publish flex shrink-0 items-center gap-1 pointer-coarse:gap-1.5"
                      }
                    >
                      <ToolbarSaveControls
                        saveState={saveState}
                        saveMode={saveMode}
                        syncDot={syncDot}
                        onSave={onSave}
                      />
                    </span>
                  ) : null]}
              </ToolbarSurface>]}
          </ToolbarQuietContext.Provider>
        </ToolbarFloatingContext.Provider>
      </TooltipProvider>
    </CdsRoot>
  );
}
export {
  ArtifactToolbar,
  effectiveToolbarDensity,
  hasVisibleToolbarContent,
  isFocusVisibleUiArtifactToolbar,
  isToolbarSaveIndicator,
  jsxForUiArtifactToolbar,
  reactForUiArtifactToolbar,
  SaveProblemStatus,
  SaveStatusControl,
  SaveStatusDot,
  toggleAttributeIfChanged,
  TOOLBAR_COMPACT_BREAKPOINT,
  TOOLBAR_CONTENT_SELECTOR,
  TOOLBAR_FULL_BREAKPOINT,
  TOOLBAR_LAYOUT_ROLES,
  TOOLBAR_PADDLE_CLASS,
  TOOLBAR_QUIET_SELECTOR,
  TOOLBAR_SCROLL_FOCUS_MARGIN,
  TOOLBAR_WIDE_BREAKPOINT,
  toolbarContentCount,
  ToolbarSaveControls,
  ToolbarScrollArea,
  ToolbarScrollPaddle,
  toolbarScrollPageTarget,
  ToolbarSurface,
  updateToolbarEmptyState,
  updateToolbarWordLock,
};
export function installUiArtifactToolbar(): () => void {
  return () => {
    reactForUiArtifactToolbar = toModuleNamespace(
      loadReactNamespace(),
      1,
    );
    jsxForUiArtifactToolbar = toModuleNamespace(
      loadJsxNamespace(),
      1,
    );
    TOOLBAR_WIDE_BREAKPOINT = 1000;
    TOOLBAR_COMPACT_BREAKPOINT = 896;
    TOOLBAR_FULL_BREAKPOINT = 1072;
    TOOLBAR_QUIET_SELECTOR =
      "[hidden], [aria-hidden='true'], [data-quiet], [data-tb-paddle], [data-tb-fade], .tb-divider";
    TOOLBAR_CONTENT_SELECTOR =
      "button, input, select, textarea, a[href], img, svg, video, canvas, [data-cds]:not([data-cds='Surface']), [data-tb-status], [data-tb-shows]";
    TOOLBAR_LAYOUT_ROLES = new Set([
      "presentation",
      "none",
      "group",
      "toolbar",
      "separator",
      "region",
    ]);
    isToolbarSaveIndicator = (element: Element) =>
      element.matches(".tb-sync-dot, [data-tb-save]");
    toggleAttributeIfChanged = (
      element: Element,
      attribute: string,
      enabled: boolean,
    ) => {
      if (enabled !== element.hasAttribute(attribute)) {
        element.toggleAttribute(attribute, enabled);
      }
    };
    TOOLBAR_SCROLL_FOCUS_MARGIN = 48;
    TOOLBAR_PADDLE_CLASS =
      "absolute inset-y-0 z-10 flex w-6 items-center justify-center pointer-coarse:w-10";
  };
}
