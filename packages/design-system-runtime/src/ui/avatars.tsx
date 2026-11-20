import { uiMessage } from '@minedesign/contracts/ui-messages';
import { useUiLocale } from '../ui-locale.ts';
import type * as Overlays from "../contracts/overlays";
import type { Tooltip as TooltipPrimitive } from "@base-ui/react/tooltip";
import type * as React from "react";
import type {
  ShortcutModifier,
  ShortcutChord,
  ShortcutLabel,
  ShortcutProps,
  BrowserWindow,
  ShrinkWrapMeasurement,
  ShrinkWrapLayout,
  ShrinkWrapJob,
  ShrinkWrapQueue,
  ShrinkWrapResizeStore,
  ShrinkWrapLoadingStore,
  ShrinkWrapRecompute,
  ShrinkWrapSchedule,
  ShrinkWrapOptions,
  CancelableTimeout,
  HotReloadCopyExports,
} from "../contracts/dom";
/** Restored application module; prepare first, initialize in original order. */
import { baseTooltip, initializeNpmDependency, loadJsxNamespace, loadReactNamespace } from "../dependencies";
import { get_IGNORED_LEGACY_ROOT_FILE_MESSAGE, get_UNREAD_LEGACY_STORE_CHANGES_MESSAGE } from "../files/application-boot";
import { get_EXTERNAL_CHANGES_FOLDED_MESSAGE, storeFoldKeptFilesMessage } from "../files/per-file-boot";
import { DEFAULT_RELOAD_MESSAGE, get_DESIGN_SYSTEM_REOPENED_MESSAGE, get_EDITABLE_DESIGN_SYSTEM_REOPENED_MESSAGE, get_MIGRATION_DONE_REOPEN_MESSAGE, get_MIGRATION_ENDED_REOPEN_MESSAGE, get_MIGRATION_STARTING_REOPEN_MESSAGE } from "../files/reopen";
import { get_MIGRATION_INTERRUPTED_MESSAGE, get_MIGRATION_OTHER_TAB_TIMEOUT_MESSAGE, get_MIGRATION_REOPEN_UNAVAILABLE_MESSAGE, get_MIGRATION_STOPPED_RELOAD_MESSAGE, get_MIGRATION_STOPPED_REOPEN_MESSAGE, get_MIGRATION_UNCHANGED_MESSAGE, get_MIGRATION_UNREADABLE_FILE_MESSAGE, temporarilyUnsavableMigrationFilesMessage, unpublishableMigrationFilesMessage } from "../files/single-file-migration-boot";
import { defineLiveExports, initializeOnce, toModuleNamespace } from "../module-helpers";
import { initializeErrorReporting, initializeEventCallbacks, initializeInputDismissalTracking, invokeAndReportError, isInputTriggeredBlur, useOptionalEventCallback } from "./foundation";
import { cn, CollisionPaddingProvider, initializeClassNames, initializeCollisionPadding, initializeLayers, initializeMergedRefs, initializePortalRoot, initializeTranslations, layerBaseContext, PortalRoot, useDefaultOverlayLayer, useMergedRefs, useTranslation } from "./interactions";
import { initializeCdsRoot, usePortalContainer } from "./overlays";

var reactShortcut: typeof React;
var jsxShortcut: typeof import("react/jsx-runtime");
var shortcutKeycapClasses: string;
var singleCharacterKeycapClasses: string;
var multipleCharacterKeycapClasses: string;
var shortcutTextKeyClasses: string;
var shortcutVariantClasses: Record<"keycap" | "text", string>;
var SHORTCUT_SEQUENCE_SEPARATOR: string;
var SHORTCUT_MODIFIER_SEPARATOR: string;
var appleKeyboardUserAgentPattern: RegExp;
var subscribeAppleKeyboardNoop: (listener: () => void) => () => void;
var shortcutModifierNames: ShortcutModifier[];
var isShortcutModifier: (input: string) => input is ShortcutModifier;
var shortcutModifierOrder: ShortcutModifier[];
var appleModifierLabels: Record<ShortcutModifier, string>;
var otherModifierLabels: Record<ShortcutModifier, string>;
var appleKeyLabels: Record<string, string>;
var otherKeyLabels: Record<string, string>;
var appleAriaModifierNames: Record<string, string>;
var otherAriaModifierNames: Record<string, string>;
var initializeShortcuts: () => void;
var reactTextOverflow: typeof React;
var documentTextRanges: WeakMap<Document, Range>;
var initializeTextClipping: () => void;
var reactCancelableTimeout: typeof React;
var initializeCancelableTimeout: () => void;
var SHRINK_WRAP_STYLE_PROPERTY: "maxWidth";
var shrinkWrapBaselineWidths: WeakMap<HTMLElement, string>;
var shrinkWrapWrittenWidths: WeakMap<HTMLElement, string>;
var SHRINK_WRAP_MAX_ITERATIONS: number;
var SHRINK_WRAP_ATTRIBUTE: string;
var SHRINK_WRAP_MAX_LINE_RECTS: number;
var shrinkWrapAtomicTags: Set<string>;
var shrinkWrapQueues: WeakMap<Window, ShrinkWrapQueue>;
var shrinkWrapResizeObservers: WeakMap<BrowserWindow, ShrinkWrapResizeStore>;
var shrinkWrapWindowResizeStores: WeakMap<
  EventTarget,
  ShrinkWrapLoadingStore
>;
var initializeShrinkWrapMeasurement: () => void;
var reactShrinkWrap: typeof React;
var jsxShrinkWrap: typeof import("react/jsx-runtime");
var ShrinkWrap: React.ForwardRefExoticComponent<
  React.ComponentPropsWithoutRef<"div"> &
    ShrinkWrapOptions &
    React.RefAttributes<HTMLDivElement>
>;
var initializeShrinkWrap: () => void;
var buttonBackgroundLayerClasses: string;
var buttonFocusClasses: string;
var dangerButtonFocusClasses: string;
var buttonFillLayerClasses: string;
var buttonBackgroundShadowClasses: string;
var buttonJoinedFillClasses: string;
var buttonPressedFillClasses: string;
var secondaryButtonFillClasses: string;
var buttonSolidInsetClasses: string;
var initializeDisabledReasonDebug: () => void;
var reactDisabledReason: typeof React;
var jsxDisabledReason: typeof import("react/jsx-runtime");
var disabledReasonFocusClasses: string;
var DISABLED_REASON_ATTRIBUTE: string;
var initializeDisabledReason: () => void;
var jsxTooltipClasses: typeof import("react/jsx-runtime");
var tooltipBaseClasses: string;
var singleLineTooltipClasses: string;
var tooltipDetailClasses: string;
var multilineTooltipBaseClasses: string;
var multilineTooltipClasses: string;
var multilineTooltipArrowClass: string;
var initializeTooltipClasses: () => void;
var reactTooltipContext: typeof React;
var tooltipsDisabledContext: React.Context<boolean>;
var tooltipImplementationContext: React.Context<Overlays.TooltipImplementation | null>;
var initializeTooltipContext: () => void;
var tooltipExports: Overlays.TooltipImplementation & {
  useTooltipTrigger(): boolean;
  useTooltipGroup(): boolean;
  OverflowTooltip: React.ComponentType<Overlays.OverflowTooltipProps>;
};
var reactTooltip: typeof React;
var jsxTooltip: typeof import("react/jsx-runtime");
var activeTooltipActionsRef: React.RefObject<Overlays.TooltipInstantActions> | null;
var TOOLTIP_NO_SHOW: Overlays.EmptyTooltipContent;
var closedTooltipState: Overlays.TooltipBodyState;
var openTooltipState: Overlays.TooltipBodyUpdate;
var closeTooltipState: Overlays.TooltipBodyUpdate;
var clearTooltipBody: Overlays.TooltipBodyUpdate;
var openTooltipWithBody: (
  body: React.ReactNode,
) => Overlays.TooltipBodyUpdate;
var replaceTooltipBody: (body: React.ReactNode) => Overlays.TooltipBodyUpdate;
var resetTooltipState: Overlays.TooltipBodyUpdate;
var tooltipSingleLineClasses: string;
var tooltipTextBalanceClass: string;
var tooltipSecondaryDetailClasses: string;
var tooltipContentRowClasses: string;
var tooltipContentAlignmentClass: string;
var tooltipMultilineBodyClasses: string;
var OverflowTooltip: React.ForwardRefExoticComponent<
  Overlays.OverflowTooltipProps & React.RefAttributes<HTMLSpanElement>
>;
var defaultTooltipImplementation: Overlays.TooltipImplementation;
var tooltipProviderContext: React.Context<boolean>;
var initializeTooltip: () => void;
var initializeHostSupport: () => void;
var hotReloadCopyExports: HotReloadCopyExports;
function getKeycapClasses(label: string | undefined): string {
  return `${shortcutKeycapClasses} ${Array.from(label ?? "").length === 1 ? singleCharacterKeycapClasses : multipleCharacterKeycapClasses}`;
}
function Shortcut({
  keys: keys,
  variant = "keycap",
  onFill = false,
  className: className,
  ...props
}: ShortcutProps): React.ReactElement {
  useUiLocale();
  let usesAppleKeyboard = useAppleKeyboard(),
    sequenceSeparator = useTranslation(
      "sequenceThen",
      SHORTCUT_SEQUENCE_SEPARATOR,
    ),
    chords = parseShortcutSequence(keys).map((chord: string) =>
      renderShortcutChord(chord, usesAppleKeyboard),
    ),
    usesSpokenLabels = variant === "text" && !usesAppleKeyboard;
  return (
    <span
      {...props}
      data-cds={"Shortcut"}
      data-variant={variant}
      className={cn(
        shortcutVariantClasses[variant],
        onFill && "[--cds-shortcut-cap-ink:currentColor]",
        className,
      )}
    >
      {chords.map((labels: ShortcutLabel[], chordIndex: number) =>
        (() => {
          const ChordFragment = reactShortcut.Fragment;
          const chordProps = {
            children: [
              chordIndex > 0 && (
                <span
                  className={"px-[2px] [color:var(--cds-shortcut-cap-ink)]"}
                >
                  {sequenceSeparator}
                </span>
              ),
              labels.map(
                (
                  { label: label, spoken: spoken }: ShortcutLabel,
                  keyIndex: number,
                ) =>
                  (() => {
                    const _Element = reactShortcut.Fragment;
                    const _elementProps = {
                      children: [
                        usesSpokenLabels && keyIndex > 0 && (
                          <span
                            className={
                              "mx-[-0.3em] [color:var(--cds-shortcut-cap-ink)]"
                            }
                          >
                            {SHORTCUT_MODIFIER_SEPARATOR}
                          </span>
                        ),
                        <kbd
                          className={
                            variant === "text"
                              ? shortcutTextKeyClasses
                              : getKeycapClasses(label)
                          }
                        >
                          {spoken === undefined ? (label) : (usesSpokenLabels ? (spoken) : (<jsxShortcut.Fragment>
                              {[<span aria-hidden={"true"}>{label}</span>, <span className={"sr-only select-none"}>
                                  {spoken}
                                </span>]}
                            </jsxShortcut.Fragment>))}
                        </kbd>,
                      ],
                    };
                    const _elementKey = keyIndex;
                    return <_Element key={_elementKey} {..._elementProps} />;
                  })(),
              ),
            ],
          };
          const chordKey = chordIndex;
          return <ChordFragment key={chordKey} {...chordProps} />;
        })(),
      )}
    </span>
  );
}
function useAppleKeyboard(): boolean {
  return reactShortcut.useSyncExternalStore(
    subscribeAppleKeyboardNoop,
    () => appleKeyboardUserAgentPattern.test(navigator.userAgent),
    () => false,
  );
}
function ownPropertyValue<Value>(
  record: Readonly<Record<string, Value>>,
  key: string,
): Value | undefined {
  if (Object.hasOwn(record, key)) {
    return record[key];
  } else {
    return undefined;
  }
}
function getShortcutKeyLabel(key: string, useAppleLabels: boolean): string {
  let value = ownPropertyValue(
    useAppleLabels ? appleKeyLabels : otherKeyLabels,
    key,
  );
  if (value !== undefined) {
    return value;
  }
  if (/^f\d+$/.test(key)) {
    return key.toUpperCase();
  }
  if (key.length === 1) {
    return key.toUpperCase();
  }
  return key.charAt(0).toUpperCase() + key.slice(1);
}
function parseShortcutSequence(shortcut: string): string[] {
  let normalized = shortcut.trim().replace(/\s*\+\s*/g, "+");
  if (normalized) {
    return normalized.split(/\s+/);
  } else {
    return [];
  }
}
function parseShortcutChord(
  chord: string,
  useAppleLabels: boolean | undefined,
): ShortcutChord {
  let value = chord
      .toLowerCase()
      .split("+")
      .map((part: string) => part.trim())
      .filter((part: string) => part !== ""),
    items: ShortcutModifier[] = [],
    keys: string[] = [];
  for (let part of value) {
    if (isShortcutModifier(part)) {
      items.push(part);
    } else {
      keys.push(part);
    }
  }
  let callback = (modifier: string) =>
    (shortcutModifierOrder as readonly string[]).indexOf(
      !useAppleLabels &&
        (modifier === "cmd" || modifier === "command" || modifier === "meta")
        ? "ctrl"
        : modifier,
    );
  items.sort(
    (left: ShortcutModifier, right: ShortcutModifier) =>
      callback(left) - callback(right),
  );
  return {
    modifiers: items,
    keys: keys,
  };
}
function renderShortcutChord(
  chord: string,
  useAppleLabels: boolean,
): ShortcutLabel[] {
  let { modifiers: modifiers, keys: keys } = parseShortcutChord(chord, useAppleLabels),
    modifierLabels = useAppleLabels ? appleModifierLabels : otherModifierLabels,
    callback = (key: string, label: string) => {
      if (/^[A-Za-z0-9 ]+$/.test(label)) {
        return {
          label: label,
        };
      }
      let spokenLabel = ownPropertyValue(appleAriaModifierNames, key);
      if (spokenLabel === undefined) {
        return {
          label: label,
        };
      } else {
        return {
          label: label,
          spoken: spokenLabel,
        };
      }
    };
  return [
    ...modifiers.map((modifier: ShortcutModifier) =>
      callback(modifier, modifierLabels[modifier]),
    ),
    ...keys.map((key: string) =>
      callback(key, getShortcutKeyLabel(key, useAppleLabels)),
    ),
  ];
}
function shortcutToAriaKeyShortcuts(
  shortcut: string,
  useAppleLabels: boolean,
): string | undefined {
  let [chord, ...remainingChords] = parseShortcutSequence(shortcut);
  if (chord === undefined || remainingChords.length > 0) {
    return;
  }
  let { modifiers: modifiers, keys: keys } = parseShortcutChord(
    chord,
    useAppleLabels,
  );
  if (keys.length !== 1) {
    return;
  }
  let primaryModifier = useAppleLabels ? "Meta" : "Control",
    callback = (items: string) =>
      items === "cmd" || items === "command" || items === "meta"
        ? primaryModifier
        : (ownPropertyValue(otherAriaModifierNames, items) ??
          (/^f\d+$/.test(items)
            ? items.toUpperCase()
            : items.length === 1
              ? items
              : items.charAt(0).toUpperCase() + items.slice(1)));
  return [...modifiers, ...keys].map(callback).join("+");
}
function isTextRangeClipped(element: HTMLElement): boolean {
  let ownerDocument = element.ownerDocument,
    entry = documentTextRanges.get(ownerDocument);
  if (entry === undefined) {
    entry = ownerDocument.createRange();
    documentTextRanges.set(ownerDocument, entry);
  }
  entry.selectNodeContents(element);
  let value = entry.getBoundingClientRect?.();
  entry.setStart(ownerDocument, 0);
  entry.collapse(true);
  if (value === undefined || value.width === 0) {
    return false;
  }
  let bounds = element.getBoundingClientRect();
  return value.right - bounds.right > 0.1 || bounds.left - value.left > 0.1;
}
function useCancelableTimeout(): CancelableTimeout {
  let ref = reactCancelableTimeout.useRef<number | undefined>(undefined),
    callback = reactCancelableTimeout.useCallback(() => {
      window.clearTimeout(ref.current);
      ref.current = undefined;
    }, []),
    start = reactCancelableTimeout.useCallback(
      (delayMs: number, run: () => void) => {
        callback();
        ref.current = window.setTimeout(run, delayMs);
      },
      [callback],
    );
  reactCancelableTimeout.useEffect(() => callback, [callback]);
  return reactCancelableTimeout.useMemo(
    () => ({
      start: start,
      cancel: callback,
    }),
    [start, callback],
  );
}
function writeShrinkWrapWidth(element: HTMLElement, width: string): void {
  element.style[SHRINK_WRAP_STYLE_PROPERTY] = width;
  shrinkWrapWrittenWidths.set(element, width);
}
function captureShrinkWrapBaseline(element: HTMLElement): void {
  let value = element.style[SHRINK_WRAP_STYLE_PROPERTY];
  if (
    !shrinkWrapBaselineWidths.has(element) ||
    value !== shrinkWrapWrittenWidths.get(element)
  ) {
    shrinkWrapBaselineWidths.set(element, value);
  }
}
function measureShrinkWrapLineRects(
  element: HTMLElement,
  shouldStopAtWidth?: (width: number) => boolean,
): ShrinkWrapMeasurement {
  let ownerDocument = element.ownerDocument,
    defaultView = ownerDocument.defaultView,
    items: DOMRect[] = [],
    contentLeft = Number.POSITIVE_INFINITY,
    contentRight = Number.NEGATIVE_INFINITY,
    addContentRect = (rect: DOMRect) => {
      items.push(rect);
      if (rect.left < contentLeft) {
        contentLeft = rect.left;
      }
      if (rect.right > contentRight) {
        contentRight = rect.right;
      }
    },
    index = 0,
    boundsLeft = Number.POSITIVE_INFINITY,
    boundsRight = Number.NEGATIVE_INFINITY,
    expandBounds = (rect: DOMRect) => {
      if (rect.left < boundsLeft) {
        boundsLeft = rect.left;
      }
      if (rect.right > boundsRight) {
        boundsRight = rect.right;
      }
    },
    isWithinFillRegion = (candidateNode: Node) => {
      for (
        let ancestor =
          candidateNode.nodeType === 1 ? (candidateNode as Element) : candidateNode.parentElement;
        ancestor && ancestor !== element;
        ancestor = ancestor.parentElement
      ) {
        if (ancestor.getAttribute("data-shrinkwrap") === "fill") {
          return true;
        }
      }
      return false;
    },
    value = ownerDocument.createRange(),
    walker = ownerDocument.createTreeWalker(element, 5, {
      acceptNode: (candidateNode: Node) => {
        if (candidateNode.nodeType === 1) {
          let style = defaultView?.getComputedStyle(candidateNode as Element);
          if (
            style &&
            (style.display === "none" ||
              style.position === "absolute" ||
              style.position === "fixed")
          ) {
            return 2;
          }
          return 1;
        }
        if (isWithinFillRegion(candidateNode)) {
          return 2;
        } else {
          return 1;
        }
      },
    }),
    node = walker.nextNode();
  while (node) {
    if (node.nodeType === 3) {
      value.selectNodeContents(node);
      for (let rect of value.getClientRects?.() ?? []) {
        if (rect.width > 0) {
          addContentRect(rect);
          expandBounds(rect);
        }
      }
    } else {
      let child = node as HTMLElement,
        childStyle = defaultView?.getComputedStyle(child),
        bounds = child.getBoundingClientRect();
      if (bounds.width > 0) {
        expandBounds(bounds);
      }
      if (
        childStyle &&
        !isWithinFillRegion(child) &&
        isShrinkWrapAtomicElement(child, childStyle)
      ) {
        for (let rect of child.getClientRects()) {
          if (rect.width > 0) {
            addContentRect(rect);
          }
        }
      }
      if (
        childStyle &&
        (childStyle.overflowX !== "visible" || childStyle.overflowY !== "visible")
      ) {
        index +=
          Math.max(0, child.scrollWidth - child.clientWidth) +
          Math.max(0, child.scrollHeight - child.clientHeight);
      }
    }
    if (
      shouldStopAtWidth &&
      contentRight > contentLeft &&
      shouldStopAtWidth(contentRight - contentLeft)
    ) {
      break;
    }
    node = walker.nextNode();
  }
  return {
    rects: items,
    left: contentLeft,
    right: contentRight,
    clipped: index,
    boundLeft: boundsLeft,
    boundRight: boundsRight,
  };
}
function isShrinkWrapAtomicElement(
  element: Element,
  style: CSSStyleDeclaration,
): boolean {
  if (shrinkWrapAtomicTags.has(element.tagName.toUpperCase())) {
    return true;
  }
  return style.display.startsWith("inline");
}
function measureShrinkWrapLayout(
  element: HTMLElement,
  {
    rects: rects,
    clipped: clipped,
    boundLeft: boundLeft,
    boundRight: boundRight,
  }: ShrinkWrapMeasurement,
): ShrinkWrapLayout {
  let value = element.ownerDocument.defaultView?.getComputedStyle(element),
    bounds = element.getBoundingClientRect(),
    index = 0;
  if (value && Number.isFinite(boundLeft)) {
    let computedWidth = parseFloat(value.width),
      borderBoxWidth =
        value.boxSizing === "border-box"
          ? computedWidth
          : computedWidth +
            parseFloat(value.paddingLeft) +
            parseFloat(value.paddingRight) +
            parseFloat(value.borderLeftWidth) +
            parseFloat(value.borderRightWidth),
      scale = borderBoxWidth > 0 ? bounds.width / borderBoxWidth || 1 : 1,
      contentLeft =
        bounds.left +
        (parseFloat(value.borderLeftWidth) + parseFloat(value.paddingLeft)) *
          scale,
      contentRight =
        bounds.right -
        (parseFloat(value.borderRightWidth) +
          parseFloat(value.paddingRight)) *
          scale;
    index =
      Math.max(0, boundRight - contentRight) + Math.max(0, contentLeft - boundLeft);
  }
  return {
    height: element.scrollHeight,
    overflow: element.scrollWidth,
    client: element.clientWidth,
    spill: index,
    clipped: clipped,
    widths: rects.map((rect) => rect.width),
  };
}
function preservesShrinkWrapLayout(
  natural: ShrinkWrapLayout,
  candidate: ShrinkWrapLayout,
): boolean {
  if (
    candidate.height > natural.height ||
    candidate.overflow > candidate.client + 0.5 ||
    candidate.spill > natural.spill + 0.5 ||
    candidate.clipped > natural.clipped + 0.5
  ) {
    return false;
  }
  return (
    natural.widths.length === candidate.widths.length &&
    natural.widths.every(
      (width, index) =>
        Math.abs(width - (candidate.widths[index] ?? NaN)) <= 0.5,
    )
  );
}
function shrinkWrapLayoutImproved(
  natural: ShrinkWrapLayout,
  candidate: ShrinkWrapLayout,
): boolean {
  return (
    (candidate.height < natural.height ||
      candidate.clipped < natural.clipped - 0.5) &&
    natural.widths.length === candidate.widths.length &&
    natural.widths.every(
      (width, index) =>
        Math.abs(width - (candidate.widths[index] ?? NaN)) <= 0.5,
    )
  );
}
function restoreShrinkWrapWidth(element: HTMLElement): void {
  if (!shrinkWrapBaselineWidths.has(element)) {
    return;
  }
  captureShrinkWrapBaseline(element);
  writeShrinkWrapWidth(element, shrinkWrapBaselineWidths.get(element) ?? "");
}
function createShrinkWrapJob(
  element: HTMLElement,
  onDone: (width: number | null) => void,
): ShrinkWrapJob {
  return {
    el: element,
    done: onDone,
    boxWidth: 0,
    borderBoxSizing: true,
    natural: null,
    candidate: 0,
    stage: "read",
    lo: 0,
    hi: 0,
    probes: 0,
    resizeDue: false,
  };
}
function settleShrinkWrapJob(
  job: ShrinkWrapJob,
  width: number | null,
): void {
  if (width === null) {
    restoreShrinkWrapWidth(job.el);
  } else {
    writeShrinkWrapWidth(job.el, `${width}px`);
  }
  job.stage = "settled";
  job.done(width);
}
function readShrinkWrapNaturalLayout(job: ShrinkWrapJob): void {
  let { el: element } = job,
    defaultView = element.ownerDocument.defaultView;
  if (!defaultView || typeof element.getBoundingClientRect !== "function") {
    settleShrinkWrapJob(job, null);
    return;
  }
  let style = defaultView.getComputedStyle(element),
    computedWidth = parseFloat(style.width);
  if (!Number.isFinite(computedWidth) || computedWidth <= 0) {
    settleShrinkWrapJob(job, null);
    return;
  }
  let usesBorderBox = style.boxSizing === "border-box",
    horizontalInsets =
      parseFloat(style.paddingLeft) +
      parseFloat(style.paddingRight) +
      parseFloat(style.borderLeftWidth) +
      parseFloat(style.borderRightWidth),
    borderBoxWidth = usesBorderBox ? computedWidth : computedWidth + horizontalInsets,
    scale = element.getBoundingClientRect().width / borderBoxWidth || 1,
    toCssWidth = (visualWidth: number) => {
      let unscaledWidth = visualWidth / scale;
      return Math.ceil((usesBorderBox ? unscaledWidth + horizontalInsets : unscaledWidth) - 0.001);
    },
    wouldUseNaturalWidth = (visualWidth: number) => toCssWidth(visualWidth) >= computedWidth - 0.5,
    measurement = measureShrinkWrapLineRects(element, wouldUseNaturalWidth);
  if (measurement.rects.length === 0) {
    settleShrinkWrapJob(job, null);
    return;
  }
  let measuredWidth = measurement.right - measurement.left;
  if (wouldUseNaturalWidth(measuredWidth)) {
    settleShrinkWrapJob(job, null);
    return;
  }
  job.natural = measureShrinkWrapLayout(element, measurement);
  job.boxWidth = computedWidth;
  job.borderBoxSizing = usesBorderBox;
  job.candidate = toCssWidth(measuredWidth);
  job.stage = "verify";
}
function checkShrinkWrapCandidate(job: ShrinkWrapJob): boolean | "shrank" {
  if (job.natural === null) {
    return false;
  }
  let value = measureShrinkWrapLayout(
    job.el,
    measureShrinkWrapLineRects(job.el),
  );
  if (shrinkWrapLayoutImproved(job.natural, value)) {
    return "shrank";
  } else {
    return preservesShrinkWrapLayout(job.natural, value);
  }
}
function advanceShrinkWrapSearch(
  job: ShrinkWrapJob,
  layoutMatches: boolean,
): number | null {
  let { boxWidth: value } = job;
  if (job.stage === "verify") {
    if (layoutMatches) {
      settleShrinkWrapJob(job, job.candidate);
      return null;
    }
    job.stage = "nudge1";
    if (job.candidate + 1 < value) {
      return job.candidate + 1;
    }
    job.stage = "bisect";
  } else if (job.stage === "nudge1") {
    if (layoutMatches) {
      settleShrinkWrapJob(job, job.candidate + 1);
      return null;
    }
    job.stage = "nudge2";
    if (job.candidate + 2 < value) {
      return job.candidate + 2;
    }
    job.stage = "bisect";
  } else if (job.stage === "nudge2") {
    if (layoutMatches) {
      settleShrinkWrapJob(job, job.candidate + 2);
      return null;
    }
    job.stage = "bisect";
  } else if (job.stage === "bisect") {
    job.probes += 1;
    let midpoint = job.lo > 0 ? Math.floor((job.lo + job.hi) / 2) : NaN;
    if (layoutMatches) {
      job.hi = midpoint;
    } else {
      job.lo = midpoint;
    }
  }
  if (job.stage === "bisect") {
    if (job.lo === 0) {
      job.lo = job.candidate + 2;
      job.hi = Math.ceil(value);
    }
    if (
      job.probes >= SHRINK_WRAP_MAX_ITERATIONS ||
      job.hi - job.lo <= 1
    ) {
      if (job.hi < value - 0.5) {
        settleShrinkWrapJob(job, job.hi);
      } else {
        settleShrinkWrapJob(job, null);
      }
      return null;
    }
    return Math.floor((job.lo + job.hi) / 2);
  }
  return null;
}
function runShrinkWrapJobs(jobs: ShrinkWrapJob[]): void {
  for (let job of jobs) {
    captureShrinkWrapBaseline(job.el);
    restoreShrinkWrapWidth(job.el);
  }
  for (let job of jobs) {
    readShrinkWrapNaturalLayout(job);
  }
  let value = jobs.filter((job) => job.stage === "verify");
  for (let job of value) {
    writeShrinkWrapWidth(job.el, `${job.candidate}px`);
  }
  for (let index = 0; value.length > 0 && index < 16; index++) {
    let layoutChecks = value.map((job): [ShrinkWrapJob, boolean | "shrank"] => [
        job,
        checkShrinkWrapCandidate(job),
      ]),
      items: [ShrinkWrapJob, number][] = [];
    for (let [job, layoutCheck] of layoutChecks) {
      if (layoutCheck === "shrank") {
        settleShrinkWrapJob(job, null);
        continue;
      }
      let nextWidth = advanceShrinkWrapSearch(job, layoutCheck);
      if (nextWidth !== null) {
        items.push([job, nextWidth]);
      }
    }
    for (let [job, width] of items) {
      writeShrinkWrapWidth(job.el, `${width}px`);
    }
    value = items.map(([job]) => job);
  }
  for (let job of value) {
    if (job.stage !== "settled") {
      settleShrinkWrapJob(job, null);
    }
  }
}
function shrinkWrapSynchronously(element: HTMLElement): number | null {
  let value: number | null = null;
  runShrinkWrapJobs([
    createShrinkWrapJob(element, (width) => {
      value = width;
    }),
  ]);
  return value;
}
function getShrinkWrapQueue(ownerWindow: Window): ShrinkWrapQueue {
  let entry = shrinkWrapQueues.get(ownerWindow);
  if (!entry) {
    entry = {
      queue: new Map(),
      microtaskQueued: false,
      frameQueued: 0,
    };
    shrinkWrapQueues.set(ownerWindow, entry);
  }
  return entry;
}
function drainShrinkWrapQueue(
  ownerWindow: Window,
  schedule: ShrinkWrapQueue,
  items: ShrinkWrapJob[],
): void {
  if (items.length > 0) {
    runShrinkWrapJobs(items);
  }
  if (schedule.queue.size > 0) {
    return;
  }
  if (schedule.frameQueued) {
    ownerWindow.cancelAnimationFrame(schedule.frameQueued);
    schedule.frameQueued = 0;
  }
  if (!schedule.microtaskQueued) {
    shrinkWrapQueues.delete(ownerWindow);
  }
}
function flushShrinkWrapMicrotask(ownerWindow: Window): void {
  let entry = shrinkWrapQueues.get(ownerWindow);
  if (!entry) {
    return;
  }
  entry.microtaskQueued = false;
  if (entry.frameQueued) {
    ownerWindow.cancelAnimationFrame(entry.frameQueued);
    entry.frameQueued = 0;
  }
  let items = [...entry.queue.values()];
  entry.queue.clear();
  drainShrinkWrapQueue(ownerWindow, entry, items);
}
function flushShrinkWrapResizeJobs(ownerWindow: Window): void {
  let entry = shrinkWrapQueues.get(ownerWindow);
  if (!entry) {
    return;
  }
  let items: ShrinkWrapJob[] = [];
  for (let [value, job] of entry.queue) {
    if (job.resizeDue) {
      entry.queue.delete(value);
      items.push(job);
    }
  }
  drainShrinkWrapQueue(ownerWindow, entry, items);
}
function enqueueShrinkWrapJob(
  element: HTMLElement,
  onDone: (width: number | null) => void,
  schedule: ShrinkWrapSchedule,
): void {
  let defaultView = element.ownerDocument.defaultView;
  if (!defaultView) {
    onDone(shrinkWrapSynchronously(element));
    return;
  }
  let value = getShrinkWrapQueue(defaultView),
    entry = value.queue.get(element);
  if (entry) {
    entry.done = onDone;
  } else {
    entry = createShrinkWrapJob(element, onDone);
    value.queue.set(element, entry);
  }
  if (schedule === "microtask") {
    if (!value.microtaskQueued) {
      value.microtaskQueued = true;
      queueMicrotask(() => {
        flushShrinkWrapMicrotask(defaultView);
      });
    }
  } else if (schedule === "resize") {
    entry.resizeDue = true;
  } else if (!value.frameQueued && !value.microtaskQueued) {
    value.frameQueued = defaultView.requestAnimationFrame(() => {
      flushShrinkWrapMicrotask(defaultView);
    });
  }
}
function cancelShrinkWrapJob(element: HTMLElement): void {
  let defaultView = element.ownerDocument.defaultView;
  if (!defaultView) {
    return;
  }
  let entry = shrinkWrapQueues.get(defaultView);
  if (!entry) {
    return;
  }
  entry.queue.delete(element);
  drainShrinkWrapQueue(defaultView, entry, []);
}
function shouldRecomputeShrinkWrap(resize: ShrinkWrapRecompute): boolean {
  if (resize.self) {
    let value =
      resize.applied !== null && Math.abs(resize.inline - resize.applied) <= 1;
    return (
      Math.abs(resize.block - resize.prevBlock) > 1 ||
      (!value && Math.abs(resize.inline - resize.prevInline) > 1)
    );
  }
  return Math.abs(resize.inline - resize.prevInline) > 1;
}
function registerShrinkWrapResizeHandler(
  ownerWindow: BrowserWindow,
  element: Element,
  onResize: (entry: ResizeObserverEntry) => void,
): void {
  let entry = shrinkWrapResizeObservers.get(ownerWindow);
  if (!entry) {
    let entries = new Map<
      Element,
      Set<(entry: ResizeObserverEntry) => void>
    >();
    entry = {
      observer: new ownerWindow.ResizeObserver((observations) => {
        for (let value of observations) {
          for (let handler of entries.get(value.target) ?? []) {
            handler(value);
          }
        }
        flushShrinkWrapResizeJobs(ownerWindow);
      }),
      handlers: entries,
      paused: new Set(),
      resumeQueued: 0,
    };
    shrinkWrapResizeObservers.set(ownerWindow, entry);
  }
  let handlers = entry.handlers.get(element);
  if (!handlers) {
    try {
      entry.observer.observe(element);
    } catch (value: unknown) {
      if (entry.handlers.size === 0) {
        shrinkWrapResizeObservers.delete(ownerWindow);
      }
      throw value;
    }
    handlers = new Set();
    entry.handlers.set(element, handlers);
  }
  handlers.add(onResize);
}
function unregisterShrinkWrapResizeHandler(
  ownerWindow: BrowserWindow,
  element: Element,
  onResize: (entry: ResizeObserverEntry) => void,
): void {
  let entry = shrinkWrapResizeObservers.get(ownerWindow),
    value = entry?.handlers.get(element);
  if (!entry || !value) {
    return;
  }
  value.delete(onResize);
  if (value.size === 0) {
    entry.handlers.delete(element);
    entry.paused.delete(element);
    entry.observer.unobserve(element);
  }
  if (entry.handlers.size === 0) {
    entry.observer.disconnect();
    if (entry.resumeQueued) {
      ownerWindow.cancelAnimationFrame(entry.resumeQueued);
    }
    shrinkWrapResizeObservers.delete(ownerWindow);
  }
}
function pauseShrinkWrapResizeObservation(
  ownerWindow: BrowserWindow,
  element: Element,
): void {
  let entry = shrinkWrapResizeObservers.get(ownerWindow);
  if (!entry || !entry.handlers.has(element) || entry.paused.has(element)) {
    return;
  }
  entry.observer.unobserve(element);
  entry.paused.add(element);
  if (!entry.resumeQueued) {
    entry.resumeQueued = ownerWindow.requestAnimationFrame(() => {
      entry.resumeQueued = 0;
      for (let value of entry.paused) {
        if (entry.handlers.has(value)) {
          entry.observer.observe(value);
        }
      }
      entry.paused.clear();
    });
  }
}
function subscribeShrinkWrapWindowResize(
  eventTarget: EventTarget | undefined,
  onRefit: () => void,
): () => void {
  if (typeof eventTarget?.addEventListener !== "function") {
    return () => {
      return;
    };
  }
  let entry = shrinkWrapWindowResizeStores.get(eventTarget);
  if (!entry) {
    let values = new Set<() => void>(),
      callback = () => {
        for (let refit of values) {
          refit();
        }
      };
    eventTarget.addEventListener("loadingdone", callback);
    entry = {
      refits: values,
      listener: callback,
    };
    shrinkWrapWindowResizeStores.set(eventTarget, entry);
  }
  let value = entry;
  value.refits.add(onRefit);
  return () => {
    value.refits.delete(onRefit);
    if (
      value.refits.size === 0 &&
      shrinkWrapWindowResizeStores.get(eventTarget) === value
    ) {
      shrinkWrapWindowResizeStores.delete(eventTarget);
      eventTarget.removeEventListener?.("loadingdone", value.listener);
    }
  };
}
function observeShrinkWrap(
  element: HTMLElement,
  { immediate: immediate = false }: Pick<ShrinkWrapOptions, "immediate"> = {},
): () => void {
  let flag = false,
    value: number | null = null,
    defaultView = element.ownerDocument.defaultView as BrowserWindow | null,
    entries = new Map<
      Element,
      {
        inline: number;
        block: number;
      }
    >(),
    items: Element[] = [],
    callback = (target: Element) => {
      let targetElement = target as HTMLElement;
      entries.set(target, {
        inline: targetElement.offsetWidth ?? 0,
        block: targetElement.offsetHeight ?? 0,
      });
    },
    resizeWindow = defaultView?.ResizeObserver ? defaultView : null,
    index = 0,
    onFit = (width: number | null) => {
      if (flag) {
        return;
      }
      value = width;
      for (let target of items) {
        callback(target);
      }
      if (resizeWindow && index > 0) {
        for (let target of items.slice(index)) {
          pauseShrinkWrapResizeObservation(resizeWindow, target);
        }
      }
      index = 0;
    },
    queueFit = (schedule: ShrinkWrapSchedule) => {
      if (!flag) {
        enqueueShrinkWrapJob(element, onFit, schedule);
      }
    },
    onResize = (event: ResizeObserverEntry) => {
      let borderBox = event.borderBoxSize?.[0],
        inlineSize = borderBox ? borderBox.inlineSize : event.contentRect.width,
        blockSize = borderBox ? borderBox.blockSize : event.contentRect.height,
        previousSize = entries.get(event.target) ?? {
          inline: inlineSize,
          block: blockSize,
        };
      entries.set(event.target, {
        inline: inlineSize,
        block: blockSize,
      });
      let isTargetElement = event.target === element;
      if (
        shouldRecomputeShrinkWrap({
          self: isTargetElement,
          inline: inlineSize,
          block: blockSize,
          prevInline: previousSize.inline,
          prevBlock: previousSize.block,
          applied: value,
        })
      ) {
        if (!isTargetElement) {
          index = Math.max(index, items.indexOf(event.target));
        }
        queueFit(isTargetElement ? "frame" : "resize");
      }
    },
    observeTarget = (target: Element) => {
      if (resizeWindow) {
        registerShrinkWrapResizeHandler(resizeWindow, target, onResize);
      }
      items.push(target);
      if (immediate) {
        callback(target);
      }
    },
    mutationObserver: MutationObserver | null = null,
    unsubscribeFontResize = () => {
      return;
    },
    stopObserving = () => {
      flag = true;
      cancelShrinkWrapJob(element);
      if (resizeWindow) {
        for (let target of items) {
          unregisterShrinkWrapResizeHandler(resizeWindow, target, onResize);
        }
      }
      mutationObserver?.disconnect();
      unsubscribeFontResize();
      restoreShrinkWrapWidth(element);
    };
  try {
    if (immediate) {
      value = shrinkWrapSynchronously(element);
    } else {
      queueFit("microtask");
    }
    observeTarget(element);
    for (
      let parentElement = element.parentElement, ancestorDepth = 0;
      parentElement && ancestorDepth < SHRINK_WRAP_MAX_LINE_RECTS;
      parentElement = parentElement.parentElement, ancestorDepth++
    ) {
      observeTarget(parentElement);
    }
    if (defaultView?.MutationObserver) {
      let observer = new defaultView.MutationObserver(() => {
        queueFit("microtask");
      });
      observer.observe(element, {
        subtree: true,
        childList: true,
        characterData: true,
        attributes: true,
        attributeFilter: [SHRINK_WRAP_ATTRIBUTE],
      });
      mutationObserver = observer;
    }
    let fonts = element.ownerDocument.fonts,
      refitAfterFonts = () => queueFit("microtask");
    unsubscribeFontResize = subscribeShrinkWrapWindowResize(fonts, refitAfterFonts);
    if (fonts && fonts.status !== "loaded") {
      fonts.ready.then(refitAfterFonts);
    }
  } catch (error: unknown) {
    try {
      stopObserving();
    } catch {}
    throw error;
  }
  return stopObserving;
}
function useShrinkWrapRef({
  enabled: enabled = true,
  immediate: immediate = false,
}: ShrinkWrapOptions = {}): React.RefCallback<HTMLElement> {
  let ref = reactShrinkWrap.useRef<(() => void) | null>(null);
  return reactShrinkWrap.useCallback(
    (element: HTMLElement | null) => {
      let current = ref.current;
      ref.current = null;
      if (current) {
        invokeAndReportError(current);
      }
      if (!element) {
        return;
      }
      if (!enabled) {
        restoreShrinkWrapWidth(element);
        return;
      }
      invokeAndReportError(() => {
        ref.current = observeShrinkWrap(element, {
          immediate: immediate,
        });
      });
    },
    [enabled, immediate],
  );
}
function getButtonBackgroundLayerClasses(layerOptions: {
  joined?: boolean;
  solid?: boolean;
}): string {
  return `${buttonBackgroundLayerClasses} ${!layerOptions.joined && layerOptions.solid ? buttonSolidInsetClasses : "inset-0"} ${layerOptions.joined ? "" : buttonBackgroundShadowClasses}`;
}
function getDisabledReasonWrapperProps(
  disabledReason: React.ReactNode,
  descriptionId: string | undefined,
  className: string | undefined,
): React.HTMLAttributes<HTMLSpanElement> & {
  "data-cds-disabled-reason-wrapper": string;
} {
  let value = hasDisabledReason(disabledReason);
  return {
    tabIndex: value ? 0 : -1,
    "aria-describedby": value ? descriptionId : undefined,
    "data-cds-disabled-reason-wrapper": "",
    className: cn(
      "inline-flex",
      disabledReasonFocusClasses,
      className,
    ),
  };
}
function hasDisabledReason(reason: React.ReactNode): boolean {
  return !!reason;
}
function DisabledReasonAnnouncement({
  id: id,
  reason: reason,
}: {
  id?: string;
  reason?: React.ReactNode;
}): React.ReactElement {
  useUiLocale();
  let ref = reactDisabledReason.useRef<HTMLSpanElement | null>(null);
  reactDisabledReason.useEffect(() => {
    return;
  }, [reason]);
  return (
    <span
      ref={ref}
      id={id}
      hidden={true}
      {...{
        [DISABLED_REASON_ATTRIBUTE]: "",
      }}
    >
      {hasDisabledReason(reason) ? (reason) : (null)}
    </span>
  );
}
function DarkTooltipScope({
  children: children,
}: React.PropsWithChildren): React.ReactElement {
  useUiLocale();
  return (
    <div className={"cds-dark-scope contents"} data-mode={"dark"}>
      {children}
    </div>
  );
}
function useTooltipsDisabled(): boolean {
  return reactTooltipContext.useContext(tooltipsDisabledContext);
}
function cancelInputDismissingTooltipOpen(
  isOpening: boolean,
  changeDetails: TooltipPrimitive.Root.ChangeEventDetails,
): boolean {
  if (
    isOpening &&
    changeDetails.reason === "trigger-focus" &&
    isInputTriggeredBlur(changeDetails.event)
  ) {
    changeDetails.cancel();
    return true;
  }
  return false;
}
function closePreviousTooltip(
  nextActionsRef: React.RefObject<Overlays.TooltipInstantActions>,
): void {
  if (activeTooltipActionsRef !== null && activeTooltipActionsRef !== nextActionsRef) {
    activeTooltipActionsRef.current?.closeInstant();
  }
  activeTooltipActionsRef = nextActionsRef;
}
function isEmptyTooltipContent(content: unknown): boolean {
  return (
    content === null ||
    content === undefined ||
    content === "" ||
    typeof content === "boolean" ||
    (Array.isArray(content) && content.every(isEmptyTooltipContent))
  );
}
function evaluateTooltipContent(
  renderContent: () => React.ReactNode,
): React.ReactNode | Overlays.EmptyTooltipContent {
  let value = renderContent();
  if (isEmptyTooltipContent(value)) {
    return TOOLTIP_NO_SHOW;
  } else {
    return value;
  }
}
function TooltipShortcut({
  keys: keys,
  className: className,
}: {
  keys: string;
  className?: string;
}): React.ReactElement {
  useUiLocale();
  return (
    <Shortcut
      keys={keys}
      variant={"text"}
      className={cn(
        "text-[calc(0.75rem*var(--cds-rem-scale,1))] [--cds-shortcut-cap-ink:var(--cds-text-muted)]",
        className,
      )}
    />
  );
}
function Tooltip({
  content: content,
  detail: tooltipDetail,
  secondaryHint: secondaryHint,
  multiline: multiline,
  shortcut: shortcut,
  side = "top",
  align: align,
  sideOffset = 4,
  collisionPadding: collisionPadding,
  trackCursorAxis: trackCursorAxis,
  delay = 300,
  open: open,
  onOpenChange: onOpenChange,
  closeDelay: closeDelay,
  hoverable = true,
  closeOnClick: closeOnClick,
  lazy = false,
  openOnHandedBackFocus = false,
  triggerRef: triggerRef,
  container: container,
  className: className,
  children: children,
}: Overlays.TooltipProps): React.ReactElement {
  useUiLocale();
  let portalContainer = usePortalContainer(),
    shrinkWrapRef = useShrinkWrapRef({
      immediate: true,
    }),
    triggerId = reactTooltip.useId(),
    rootActionsRef = reactTooltip.useRef<TooltipPrimitive.Root.Actions | null>(null),
    [closeWithoutAnimation, setCloseWithoutAnimation] = reactTooltip.useState(false),
    tooltipActionsRef = reactTooltip.useRef({
      closeInstant: () => {
        setCloseWithoutAnimation(true);
        rootActionsRef.current?.close();
      },
    }),
    [hoveredTrigger, setHoveredTrigger] = reactTooltip.useState<Element | null>(null),
    [tooltipState, setTooltipState] = reactTooltip.useState(closedTooltipState);
  if (open === false && tooltipState.open) {
    setTooltipState(closeTooltipState);
  }
  let hasDeferredContent = typeof content === "function",
    hasPotentialContent = hasDeferredContent || !isEmptyTooltipContent(content),
    tooltipBody =
      !hasDeferredContent && hasPotentialContent ? (content as React.ReactNode) : tooltipState.body,
    hasTooltipBody = !isEmptyTooltipContent(tooltipBody),
    isTooltipOpen = (open ?? tooltipState.open) && (!hasDeferredContent || hasTooltipBody);
  if (!hasDeferredContent && hasPotentialContent && isTooltipOpen && !Object.is(tooltipState.body, content)) {
    setTooltipState(replaceTooltipBody(content as React.ReactNode));
  }
  let updateTooltipOpen = reactTooltip.useCallback(
      (nextOpen: boolean, changeDetails: TooltipPrimitive.Root.ChangeEventDetails) => {
        if (
          !openOnHandedBackFocus &&
          cancelInputDismissingTooltipOpen(nextOpen, changeDetails)
        ) {
          return false;
        }
        if (nextOpen) {
          if (typeof content !== "function") {
            setTooltipState(openTooltipWithBody(content));
          } else if (!isTooltipOpen) {
            let evaluatedContent = evaluateTooltipContent(content);
            if (evaluatedContent === TOOLTIP_NO_SHOW) {
              changeDetails.cancel();
              return false;
            }
            setTooltipState(openTooltipWithBody(evaluatedContent));
          } else {
            setTooltipState(openTooltipState);
          }
          setCloseWithoutAnimation(false);
          closePreviousTooltip(tooltipActionsRef);
        } else if (
          (setTooltipState(isTooltipOpen ? closeTooltipState : resetTooltipState),
          activeTooltipActionsRef === tooltipActionsRef)
        ) {
          activeTooltipActionsRef = null;
        }
        setHoveredTrigger(
          nextOpen && changeDetails.reason === "trigger-hover"
            ? (changeDetails.trigger ?? null)
            : null,
        );
        onOpenChange?.(nextOpen);
        return true;
      },
      [onOpenChange, openOnHandedBackFocus, content, isTooltipOpen],
    ),
    isControlled = open !== undefined,
    isInternallyOpen = tooltipState.open;
  reactTooltip.useEffect(() => {
    if (!isControlled || !hasPotentialContent || !hasTooltipBody) {
      return;
    }
    if (open) {
      closePreviousTooltip(tooltipActionsRef);
    } else if (activeTooltipActionsRef === tooltipActionsRef) {
      activeTooltipActionsRef = null;
    }
    return () => {
      if (!isInternallyOpen && activeTooltipActionsRef === tooltipActionsRef) {
        activeTooltipActionsRef = null;
      }
    };
  }, [isControlled, open, hasPotentialContent, hasTooltipBody, isInternallyOpen, hasDeferredContent]);
  let handleOpenChangeComplete = reactTooltip.useCallback((nextOpen: boolean) => {
    if (!nextOpen) {
      setCloseWithoutAnimation(false);
      setHoveredTrigger(null);
      setTooltipState(clearTooltipBody);
    }
  }, []);
  reactTooltip.useEffect(() => {
    if (!hoveredTrigger) {
      return;
    }
    let ownerDocument = hoveredTrigger.ownerDocument,
      handleAncestorScroll = (event: Event) => {
        let target = event.target as Node | null;
        if (target && target !== hoveredTrigger && target.contains(hoveredTrigger)) {
          tooltipActionsRef.current.closeInstant();
        }
      };
    ownerDocument.addEventListener("scroll", handleAncestorScroll, {
      capture: true,
      passive: true,
    });
    return () => {
      ownerDocument.removeEventListener("scroll", handleAncestorScroll, {
        capture: true,
      });
    };
  }, [hoveredTrigger]);
  reactTooltip.useEffect(() => {
    return () => {
      if (activeTooltipActionsRef === tooltipActionsRef) {
        activeTooltipActionsRef = null;
      }
    };
  }, []);
  let overlayLayer = useDefaultOverlayLayer("tooltip"),
    [lazyHandle] = reactTooltip.useState(() =>
      lazy && open === undefined ? baseTooltip.createHandle() : null,
    ),
    [hasMountedLazyRoot, setHasMountedLazyRoot] = reactTooltip.useState(false),
    shouldMountRoot = hasMountedLazyRoot || lazyHandle === null,
    lazyOpenStartedRef = reactTooltip.useRef(false),
    mountLazyRoot = reactTooltip.useCallback(() => {
      lazyOpenStartedRef.current = true;
      setHasMountedLazyRoot(true);
    }, []),
    openingTimeout = useCancelableTimeout(),
    lazyHoveredTriggerRef = reactTooltip.useRef<HTMLElement | null>(null),
    isLazyTooltipOpenRef = reactTooltip.useRef(false);
  reactTooltip.useEffect(() => {
    if (open === false) {
      isLazyTooltipOpenRef.current = false;
    }
  }, [open]);
  let openLazyTooltip = useOptionalEventCallback(() => {
      if (lazyOpenStartedRef.current || shouldMountRoot || !hasPotentialContent || open !== undefined) {
        return;
      }
      let bodyToShow: React.ReactNode;
      if (typeof content === "function") {
        let evaluatedContent = evaluateTooltipContent(content);
        if (evaluatedContent === TOOLTIP_NO_SHOW) {
          return;
        }
        bodyToShow = evaluatedContent;
      } else {
        bodyToShow = content;
      }
      mountLazyRoot();
      setCloseWithoutAnimation(false);
      closePreviousTooltip(tooltipActionsRef);
      setHoveredTrigger(lazyHoveredTriggerRef.current);
      setTooltipState(openTooltipWithBody(bodyToShow));
      isLazyTooltipOpenRef.current = true;
      onOpenChange?.(true);
    }),
    handleLazyPointerEnter = useOptionalEventCallback(
      (pointerEvent: React.PointerEvent<HTMLElement>) => {
        if (shouldMountRoot || pointerEvent.pointerType === "touch") {
          return;
        }
        if (!hasPotentialContent) {
          return;
        }
        lazyHoveredTriggerRef.current = pointerEvent.currentTarget;
        openingTimeout.start(delay, openLazyTooltip);
      },
    ),
    handleLazyPointerDown = useOptionalEventCallback(() => {
      if (closeOnClick !== false) {
        openingTimeout.cancel();
      }
    }),
    handleLazyFocus = useOptionalEventCallback(
      (event: React.FocusEvent<HTMLElement>) => {
        if (shouldMountRoot) {
          return;
        }
        if (!event.target.matches(":focus-visible")) {
          return;
        }
        if (
          !openOnHandedBackFocus &&
          isInputTriggeredBlur(event.nativeEvent)
        ) {
          return;
        }
        lazyHoveredTriggerRef.current = null;
        openingTimeout.cancel();
        openLazyTooltip();
      },
    );
  if (lazyHandle !== null && open === true && !hasMountedLazyRoot) {
    setHasMountedLazyRoot(true);
  }
  let handleLazyOpenChange = reactTooltip.useCallback(
      (nextOpen: boolean, changeDetails: TooltipPrimitive.Root.ChangeEventDetails) => {
        if (
          !openOnHandedBackFocus &&
          cancelInputDismissingTooltipOpen(nextOpen, changeDetails)
        ) {
          return;
        }
        if (nextOpen && isLazyTooltipOpenRef.current && isTooltipOpen) {
          setTooltipState(openTooltipState);
          return;
        }
        if (updateTooltipOpen(nextOpen, changeDetails)) {
          isLazyTooltipOpenRef.current = nextOpen;
        }
      },
      [updateTooltipOpen, openOnHandedBackFocus, isTooltipOpen],
    ),
    renderTrigger =
      reactTooltip.isValidElement(children) &&
      children.type !== reactTooltip.Fragment
        ? children
        : (triggerProps: React.HTMLAttributes<HTMLSpanElement>) => (
            <span {...triggerProps} className={"inline-flex"}>
              {children}
            </span>
          ),
    tooltipTrigger = (
      <baseTooltip.Trigger
        ref={triggerRef as React.Ref<HTMLButtonElement>}
        id={triggerId}
        delay={delay}
        closeDelay={closeDelay}
        closeOnClick={closeOnClick}
        handle={lazyHandle ?? undefined}
        disabled={lazyHandle !== null && !shouldMountRoot ? !hasPotentialContent : undefined}
        onPointerEnter={lazyHandle ? handleLazyPointerEnter : undefined}
        onPointerLeave={lazyHandle ? openingTimeout.cancel : undefined}
        onPointerDown={lazyHandle ? handleLazyPointerDown : undefined}
        onFocus={lazyHandle ? handleLazyFocus : undefined}
        render={renderTrigger}
      />
    ),
    tooltipPortal =
      shouldMountRoot && hasTooltipBody ? (
        <baseTooltip.Portal container={(container ?? portalContainer) as import("../contracts/overlays").BaseUIPortalContainer}>
          <PortalRoot>
            <CollisionPaddingProvider
              override={collisionPadding}
              container={container ?? portalContainer}
            >
              {(resolvedCollisionPadding: Overlays.CollisionPadding) => (
                <layerBaseContext.Provider value={overlayLayer.base}>
                  <baseTooltip.Positioner
                    data-cds={"Tooltip"}
                    className={"data-[anchor-hidden]:invisible"}
                    style={overlayLayer.style}
                    side={side}
                    align={align}
                    sideOffset={sideOffset}
                    collisionPadding={resolvedCollisionPadding}
                  >
                    <baseTooltip.Popup
                      ref={shrinkWrapRef}
                      role={"tooltip"}
                      style={
                        closeWithoutAnimation
                          ? {
                              transition: "none",
                            }
                          : undefined
                      }
                      className={cn(
                        tooltipSingleLineClasses,
                        tooltipSecondaryDetailClasses,
                        multiline || tooltipDetail || secondaryHint
                          ? tooltipMultilineBodyClasses
                          : tooltipContentRowClasses,
                        !shortcut && tooltipTextBalanceClass,
                        className,
                      )}
                    >
                      <DarkTooltipScope>
                        {multiline || tooltipDetail || secondaryHint ? (<jsxTooltip.Fragment>
                            {[<span
                                className={
                                  "inline-flex min-w-0 items-center gap-2"
                                }
                              >
                                {[<span
                                    className={multilineTooltipArrowClass}
                                  >
                                    {tooltipBody}
                                  </span>, shortcut && (
                                    <TooltipShortcut keys={shortcut} />
                                  )]}
                              </span>, secondaryHint && (
                                <span
                                  className={
                                    "inline-flex min-w-0 items-center gap-2"
                                  }
                                >
                                  {[<span className={"min-w-0 break-words"}>
                                      {secondaryHint.label}
                                    </span>, <TooltipShortcut
                                      keys={secondaryHint.shortcut}
                                    />]}
                                </span>
                              ), tooltipDetail && (
                                <span
                                  className={
                                    "break-words text-[calc(0.6875rem*var(--cds-rem-scale,1))]/[calc(0.875rem*var(--cds-rem-scale,1))] text-secondary"
                                  }
                                >
                                  {tooltipDetail}
                                </span>
                              )]}
                          </jsxTooltip.Fragment>) : (<jsxTooltip.Fragment>
                            {[<span className={multilineTooltipArrowClass}>
                                {tooltipBody}
                              </span>, shortcut && (
                                <TooltipShortcut
                                  keys={shortcut}
                                  className={tooltipContentAlignmentClass}
                                />
                              )]}
                          </jsxTooltip.Fragment>)}
                      </DarkTooltipScope>
                    </baseTooltip.Popup>
                  </baseTooltip.Positioner>
                </layerBaseContext.Provider>
              )}
            </CollisionPaddingProvider>
          </PortalRoot>
        </baseTooltip.Portal>
      ) : null;
  if (lazyHandle) {
    return (
      <jsxTooltip.Fragment>
        {[<tooltipImplementationContext.Provider
            value={defaultTooltipImplementation}
          >
            <tooltipsDisabledContext.Provider value={hasPotentialContent}>
              {tooltipTrigger}
            </tooltipsDisabledContext.Provider>
          </tooltipImplementationContext.Provider>, shouldMountRoot && (
            <baseTooltip.Root
              handle={lazyHandle}
              open={isTooltipOpen}
              disableHoverablePopup={!hoverable}
              trackCursorAxis={trackCursorAxis}
              disabled={!hasPotentialContent}
              actionsRef={rootActionsRef}
              onOpenChange={handleLazyOpenChange}
              onOpenChangeComplete={handleOpenChangeComplete}
              triggerId={triggerId}
            >
              {tooltipPortal}
            </baseTooltip.Root>
          )]}
      </jsxTooltip.Fragment>
    );
  }
  return (
    <baseTooltip.Root
      open={isTooltipOpen}
      disableHoverablePopup={!hoverable}
      trackCursorAxis={trackCursorAxis}
      disabled={!hasPotentialContent}
      actionsRef={rootActionsRef}
      onOpenChange={updateTooltipOpen}
      onOpenChangeComplete={handleOpenChangeComplete}
      triggerId={triggerId}
    >
      {[<tooltipImplementationContext.Provider
          value={defaultTooltipImplementation}
        >
          <tooltipsDisabledContext.Provider value={hasPotentialContent}>
            {tooltipTrigger}
          </tooltipsDisabledContext.Provider>
        </tooltipImplementationContext.Provider>, tooltipPortal]}
    </baseTooltip.Root>
  );
}
function DisabledReasonTooltip({
  reason: reason,
  side: side,
  align: align,
  sideOffset: sideOffset,
  multiline = true,
  delay: delay,
  collisionPadding: collisionPadding,
  hoverable: hoverable,
  className: className,
  wrapperClassName: wrapperClassName,
  children: children,
}: Overlays.DisabledTooltipProps): React.ReactElement {
  useUiLocale();
  let value = reactTooltip.useId();
  return (
    <Tooltip
      content={hasDisabledReason(reason) ? reason : undefined}
      side={side}
      align={align}
      sideOffset={sideOffset}
      multiline={multiline}
      delay={delay}
      collisionPadding={collisionPadding}
      hoverable={hoverable}
      className={className}
      closeOnClick={false}
      openOnHandedBackFocus={true}
    >
      <span
        {...getDisabledReasonWrapperProps(reason, value, wrapperClassName)}
      >
        {[children, <DisabledReasonAnnouncement id={value} reason={reason} />]}
      </span>
    </Tooltip>
  );
}
function TooltipImplementationProvider({
  children: children,
}: React.PropsWithChildren): React.ReactElement {
  useUiLocale();
  return (
    <tooltipImplementationContext.Provider
      value={defaultTooltipImplementation}
    >
      {children}
    </tooltipImplementationContext.Provider>
  );
}
function useHasTooltipProvider(): boolean {
  return reactTooltip.useContext(tooltipProviderContext);
}
function TooltipProvider({
  delay = 600,
  closeDelay = 200,
  children: children,
}: React.PropsWithChildren<{
  delay?: number;
  closeDelay?: number;
}>): React.ReactElement {
  useUiLocale();
  return (
    <tooltipProviderContext.Provider value={true}>
      <baseTooltip.Provider delay={delay} closeDelay={closeDelay}>
        {children}
      </baseTooltip.Provider>
    </tooltipProviderContext.Provider>
  );
}
export {
  activeTooltipActionsRef,
  advanceShrinkWrapSearch,
  appleAriaModifierNames,
  appleKeyboardUserAgentPattern,
  appleKeyLabels,
  appleModifierLabels,
  buttonBackgroundLayerClasses,
  buttonBackgroundShadowClasses,
  buttonFillLayerClasses,
  buttonFocusClasses,
  buttonJoinedFillClasses,
  buttonPressedFillClasses,
  buttonSolidInsetClasses,
  cancelInputDismissingTooltipOpen,
  cancelShrinkWrapJob,
  captureShrinkWrapBaseline,
  checkShrinkWrapCandidate,
  clearTooltipBody,
  closedTooltipState,
  closePreviousTooltip,
  closeTooltipState,
  createShrinkWrapJob,
  dangerButtonFocusClasses,
  DarkTooltipScope,
  defaultTooltipImplementation,
  DISABLED_REASON_ATTRIBUTE,
  DisabledReasonAnnouncement,
  disabledReasonFocusClasses,
  DisabledReasonTooltip,
  documentTextRanges,
  drainShrinkWrapQueue,
  enqueueShrinkWrapJob,
  evaluateTooltipContent,
  flushShrinkWrapMicrotask,
  flushShrinkWrapResizeJobs,
  getButtonBackgroundLayerClasses,
  getDisabledReasonWrapperProps,
  getKeycapClasses,
  getShortcutKeyLabel,
  getShrinkWrapQueue,
  hasDisabledReason,
  hotReloadCopyExports,
  initializeCancelableTimeout,
  initializeDisabledReason,
  initializeDisabledReasonDebug,
  initializeHostSupport,
  initializeShortcuts,
  initializeShrinkWrap,
  initializeShrinkWrapMeasurement,
  initializeTextClipping,
  initializeTooltip,
  initializeTooltipClasses,
  initializeTooltipContext,
  isEmptyTooltipContent,
  isShortcutModifier,
  isShrinkWrapAtomicElement,
  isTextRangeClipped,
  jsxDisabledReason,
  jsxShortcut,
  jsxShrinkWrap,
  jsxTooltip,
  jsxTooltipClasses,
  measureShrinkWrapLayout,
  measureShrinkWrapLineRects,
  multilineTooltipArrowClass,
  multilineTooltipBaseClasses,
  multilineTooltipClasses,
  multipleCharacterKeycapClasses,
  observeShrinkWrap,
  openTooltipState,
  openTooltipWithBody,
  otherAriaModifierNames,
  otherKeyLabels,
  otherModifierLabels,
  OverflowTooltip,
  ownPropertyValue,
  parseShortcutChord,
  parseShortcutSequence,
  pauseShrinkWrapResizeObservation,
  reactCancelableTimeout,
  reactDisabledReason,
  reactShortcut,
  reactShrinkWrap,
  reactTextOverflow,
  reactTooltip,
  reactTooltipContext,
  readShrinkWrapNaturalLayout,
  registerShrinkWrapResizeHandler,
  renderShortcutChord,
  replaceTooltipBody,
  resetTooltipState,
  restoreShrinkWrapWidth,
  runShrinkWrapJobs,
  secondaryButtonFillClasses,
  settleShrinkWrapJob,
  Shortcut,
  SHORTCUT_MODIFIER_SEPARATOR,
  SHORTCUT_SEQUENCE_SEPARATOR,
  shortcutKeycapClasses,
  shortcutModifierNames,
  shortcutModifierOrder,
  shortcutTextKeyClasses,
  shortcutToAriaKeyShortcuts,
  shortcutVariantClasses,
  shouldRecomputeShrinkWrap,
  SHRINK_WRAP_ATTRIBUTE,
  SHRINK_WRAP_MAX_ITERATIONS,
  SHRINK_WRAP_MAX_LINE_RECTS,
  SHRINK_WRAP_STYLE_PROPERTY,
  ShrinkWrap,
  shrinkWrapAtomicTags,
  shrinkWrapBaselineWidths,
  shrinkWrapLayoutImproved,
  preservesShrinkWrapLayout as shrinkWrapLayoutWorsened,
  shrinkWrapQueues,
  shrinkWrapResizeObservers,
  shrinkWrapSynchronously,
  shrinkWrapWindowResizeStores,
  shrinkWrapWrittenWidths,
  singleCharacterKeycapClasses,
  singleLineTooltipClasses,
  subscribeAppleKeyboardNoop,
  subscribeShrinkWrapWindowResize,
  Tooltip,
  TOOLTIP_NO_SHOW,
  tooltipBaseClasses,
  tooltipContentAlignmentClass,
  tooltipContentRowClasses,
  tooltipDetailClasses,
  tooltipExports,
  tooltipImplementationContext,
  TooltipImplementationProvider,
  tooltipMultilineBodyClasses,
  TooltipProvider,
  tooltipProviderContext,
  tooltipsDisabledContext,
  tooltipSecondaryDetailClasses,
  TooltipShortcut,
  tooltipSingleLineClasses,
  tooltipTextBalanceClass,
  unregisterShrinkWrapResizeHandler,
  useAppleKeyboard,
  useCancelableTimeout,
  useHasTooltipProvider,
  useShrinkWrapRef,
  useTooltipsDisabled,
  writeShrinkWrapWidth,
};
export function installUiAvatars(): () => void {
  return () => {
    shortcutKeycapClasses =
      "inline-flex shrink-0 items-center justify-center h-[calc(1em+6px)] rounded-[var(--cds-keycap-radius,4px)] [color:var(--cds-shortcut-cap-ink)] bg-[color:var(--cds-shortcut-cap-fill)] border border-[color:var(--cds-shortcut-cap-line)] font-inherit [font-variation-settings:inherit] [line-height:1]";
    singleCharacterKeycapClasses = "w-[calc(1em+6px)] px-0";
    multipleCharacterKeycapClasses = "min-w-[calc(1em+6px)] px-[3px]";
    shortcutTextKeyClasses =
      "font-inherit [font-variation-settings:inherit] [color:var(--cds-shortcut-cap-ink)]";
    SHORTCUT_SEQUENCE_SEPARATOR = "then";
    SHORTCUT_MODIFIER_SEPARATOR = "+";
    subscribeAppleKeyboardNoop = () => () => {
      return;
    };
    isShortcutModifier = (key: string): key is ShortcutModifier =>
      (shortcutModifierNames as readonly string[]).includes(key);
    initializeShortcuts = initializeOnce(() => {
      initializeClassNames();
      initializeTranslations();
      reactShortcut = toModuleNamespace(
        loadReactNamespace(),
        1,
      );
      jsxShortcut = toModuleNamespace(
        loadJsxNamespace(),
        1,
      );
      shortcutVariantClasses = {
        keycap: "inline-flex shrink-0 items-center gap-[2px] text-caption",
        text: "inline-flex shrink-0 items-baseline gap-[0.3em] text-caption",
      };
      appleKeyboardUserAgentPattern = /mac|iphone|ipad|ipod/i;
      shortcutModifierNames = [
        "cmd",
        "command",
        "meta",
        "ctrl",
        "control",
        "alt",
        "option",
        "shift",
      ];
      shortcutModifierOrder = [
        "ctrl",
        "control",
        "alt",
        "option",
        "shift",
        "cmd",
        "command",
        "meta",
      ];
      appleModifierLabels = {
        ctrl: "⌃",
        control: "⌃",
        alt: "⌥",
        option: "⌥",
        shift: "⇧",
        cmd: "⌘",
        command: "⌘",
        meta: "⌘",
      };
      otherModifierLabels = {
        ctrl: "Ctrl",
        control: "Ctrl",
        alt: "Alt",
        option: "Alt",
        shift: "Shift",
        cmd: "Ctrl",
        command: "Ctrl",
        meta: "Ctrl",
      };
      appleKeyLabels = {
        space: "␣",
        enter: "⏎",
        return: "⏎",
        delete: "⌫",
        backspace: "⌫",
        escape: "Esc",
        esc: "Esc",
        tab: "⇥",
        up: "↑",
        down: "↓",
        left: "←",
        right: "→",
        pageup: "Page Up",
        pagedown: "Page Down",
        home: "Home",
        end: "End",
        insert: "Insert",
      };
      otherKeyLabels = {
        space: "Space",
        enter: "⏎",
        return: "⏎",
        delete: "Backspace",
        backspace: "Backspace",
        escape: "Esc",
        esc: "Esc",
        tab: "Tab",
        up: "↑",
        down: "↓",
        left: "←",
        right: "→",
        pageup: "Page Up",
        pagedown: "Page Down",
        home: "Home",
        end: "End",
        insert: "Insert",
      };
      appleAriaModifierNames = {
        cmd: "Command",
        command: "Command",
        meta: "Command",
        ctrl: "Control",
        control: "Control",
        alt: "Option",
        option: "Option",
        shift: "Shift",
        enter: "Enter",
        return: "Enter",
        space: "Space",
        tab: "Tab",
        delete: "Delete",
        backspace: "Delete",
        up: "Up",
        down: "Down",
        left: "Left",
        right: "Right",
      };
      otherAriaModifierNames = {
        ctrl: "Control",
        control: "Control",
        alt: "Alt",
        option: "Alt",
        shift: "Shift",
        enter: "Enter",
        return: "Enter",
        escape: "Escape",
        esc: "Escape",
        space: "Space",
        tab: "Tab",
        delete: "Backspace",
        backspace: "Backspace",
        up: "ArrowUp",
        down: "ArrowDown",
        left: "ArrowLeft",
        right: "ArrowRight",
        home: "Home",
        end: "End",
        pageup: "PageUp",
        pagedown: "PageDown",
        insert: "Insert",
      };
    });
    initializeTextClipping = initializeOnce(() => {
      reactTextOverflow = toModuleNamespace(
        loadReactNamespace(),
        1,
      );
      documentTextRanges = new WeakMap();
    });
    initializeCancelableTimeout = initializeOnce(() => {
      reactCancelableTimeout = toModuleNamespace(
        loadReactNamespace(),
        1,
      );
    });
    SHRINK_WRAP_STYLE_PROPERTY = "maxWidth";
    SHRINK_WRAP_MAX_ITERATIONS = 12;
    SHRINK_WRAP_ATTRIBUTE = "data-shrinkwrap";
    SHRINK_WRAP_MAX_LINE_RECTS = 16;
    initializeShrinkWrapMeasurement = initializeOnce(() => {
      shrinkWrapBaselineWidths = new WeakMap();
      shrinkWrapWrittenWidths = new WeakMap();
      shrinkWrapAtomicTags = new Set([
        "IMG",
        "SVG",
        "VIDEO",
        "AUDIO",
        "CANVAS",
        "IFRAME",
        "EMBED",
        "OBJECT",
        "PICTURE",
        "INPUT",
        "TEXTAREA",
        "SELECT",
        "PROGRESS",
        "METER",
      ]);
      shrinkWrapQueues = new WeakMap();
      shrinkWrapResizeObservers = new WeakMap();
      shrinkWrapWindowResizeStores = new WeakMap();
    });
    initializeShrinkWrap = initializeOnce(() => {
      initializeErrorReporting();
      initializeMergedRefs();
      initializeShrinkWrapMeasurement();
      reactShrinkWrap = toModuleNamespace(
        loadReactNamespace(),
        1,
      );
      jsxShrinkWrap = toModuleNamespace(
        loadJsxNamespace(),
        1,
      );
      ShrinkWrap = reactShrinkWrap.forwardRef(
        (
          {
            enabled = true,
            immediate = false,
            children: children,
            ...props
          }: React.ComponentPropsWithoutRef<"div"> & ShrinkWrapOptions,
          forwardedRef: React.ForwardedRef<HTMLDivElement>,
        ): React.ReactElement => {
          let shrinkWrapRef = useShrinkWrapRef({
              enabled: enabled,
              immediate: immediate,
            }),
            mergedRef = useMergedRefs(forwardedRef, shrinkWrapRef);
          return (
            <div ref={mergedRef} data-cds={"ShrinkWrap"} {...props}>
              {children}
            </div>
          );
        },
      );
      ShrinkWrap.displayName = "ShrinkWrap";
    });
    buttonBackgroundLayerClasses = "absolute -z-[1] rounded-[inherit]";
    buttonFocusClasses =
      "focus-visible:shadow-focus [&[data-initial-focus]:focus]:shadow-focus";
    dangerButtonFocusClasses =
      "focus-visible:shadow-focus-danger [&[data-initial-focus]:focus]:shadow-focus-danger";
    buttonFillLayerClasses =
      "absolute inset-0 rounded-[inherit] transition-[background-color,box-shadow,color] duration-fast ease-out group-focus-visible/btn:shadow-[inset_0_0_0_1px_var(--cds-page-bg)] group-[[data-initial-focus]:focus]/btn:shadow-[inset_0_0_0_1px_var(--cds-page-bg)]";
    buttonBackgroundShadowClasses = "cds-btn-squish";
    buttonJoinedFillClasses =
      "shadow-field group-aria-pressed/btn:shadow-field-pressed group-focus-visible/btn:group-aria-pressed/btn:shadow-[inset_0_0_0_1px_var(--cds-page-bg)]";
    buttonPressedFillClasses =
      "group-aria-pressed/btn:bg-accent group-hover/btn:group-aria-pressed/btn:bg-accent";
    secondaryButtonFillClasses =
      "bg-fill-secondary group-hover/btn:bg-fill-secondary-hover group-[[aria-haspopup][aria-expanded=true]]/btn:bg-fill-secondary-hover";
    buttonSolidInsetClasses = "inset-[0.5px]";
    initializeDisabledReasonDebug = () => {};
    DISABLED_REASON_ATTRIBUTE = "data-cds-disabled-reason";
    initializeDisabledReason = initializeOnce(() => {
      initializeClassNames();
      initializeDisabledReasonDebug();
      reactDisabledReason = toModuleNamespace(
        loadReactNamespace(),
        1,
      );
      jsxDisabledReason = toModuleNamespace(
        loadJsxNamespace(),
        1,
      );
      disabledReasonFocusClasses = `rounded outline-none focus-visible:outline-hidden [&[data-initial-focus]:focus]:outline-hidden transition-shadow duration-fast ${buttonFocusClasses}`;
    });
    tooltipBaseClasses =
      "rounded-[calc(0.375rem*var(--cds-rem-scale,1))] bg-[var(--cds-tooltip-bg)] text-[var(--cds-tooltip-fg)] shadow-sm dark:shadow-panel-sm print:hidden text-[calc(0.8125rem*var(--cds-rem-scale,1))]/[calc(1.125rem*var(--cds-rem-scale,1))] font-normal";
    tooltipDetailClasses =
      "origin-[var(--transform-origin)] transition-[opacity,scale] duration-snap ease-snap motion-reduce:transition-none data-[starting-style]:opacity-0 data-[starting-style]:scale-[0.98] data-[ending-style]:opacity-0 data-[ending-style]:scale-[0.98] data-[instant]:duration-0";
    multilineTooltipBaseClasses = "max-w-[240px] whitespace-normal";
    multilineTooltipArrowClass = "min-w-0 break-words";
    initializeTooltipClasses = initializeOnce(() => {
      jsxTooltipClasses = toModuleNamespace(
        loadJsxNamespace(),
        1,
      );
      singleLineTooltipClasses = `px-2 ${tooltipBaseClasses}`;
      multilineTooltipClasses = `${multilineTooltipBaseClasses} py-1.5`;
    });
    initializeTooltipContext = initializeOnce(() => {
      reactTooltipContext = toModuleNamespace(
        loadReactNamespace(),
        1,
      );
      tooltipsDisabledContext = reactTooltipContext.createContext(false);
      tooltipImplementationContext =
        reactTooltipContext.createContext<Overlays.TooltipImplementation | null>(
          null,
        );
    });
    tooltipExports = {} as typeof tooltipExports;
    defineLiveExports(tooltipExports, {
      useTooltipTrigger: () => useTooltipsDisabled,
      useTooltipGroup: () => useHasTooltipProvider,
      TooltipImplProvider: () => TooltipImplementationProvider,
      TooltipGroup: () => TooltipProvider,
      Tooltip: () => Tooltip,
      OverflowTooltip: () => OverflowTooltip,
      DisabledReasonTooltip: () => DisabledReasonTooltip,
    });
    activeTooltipActionsRef = null;
    openTooltipState = (state) =>
      state.open
        ? state
        : {
            ...state,
            open: true,
          };
    closeTooltipState = (state) =>
      state.open
        ? {
            ...state,
            open: false,
          }
        : state;
    clearTooltipBody = (state) =>
      state.body === undefined
        ? state
        : {
            ...state,
            body: undefined,
          };
    openTooltipWithBody = (body) => (state) =>
      state.open && Object.is(state.body, body)
        ? state
        : {
            open: true,
            body: body,
          };
    replaceTooltipBody = (body) => (state) =>
      Object.is(state.body, body)
        ? state
        : {
            ...state,
            body: body,
          };
    resetTooltipState = (state) =>
      state.open || state.body !== undefined ? closedTooltipState : state;
    tooltipTextBalanceClass = "text-balance";
    tooltipContentRowClasses =
      "inline-flex items-center gap-2 min-h-[calc(1.5rem*var(--cds-rem-scale,1))] max-w-[240px] py-[calc(0.1875rem*var(--cds-rem-scale,1))]";
    tooltipContentAlignmentClass = "self-start";
    initializeTooltip = initializeOnce(() => {
      initializeInputDismissalTracking();
      initializeClassNames();
      initializeCdsRoot();
      initializeLayers();
      initializeEventCallbacks();
      initializeMergedRefs();
      initializePortalRoot();
      initializeCollisionPadding();
      initializeTextClipping();
      initializeCancelableTimeout();
      initializeShortcuts();
      initializeShrinkWrap();
      initializeDisabledReason();
      initializeTooltipClasses();
      initializeTooltipContext();
      initializeNpmDependency();
      reactTooltip = toModuleNamespace(
        loadReactNamespace(),
        1,
      );
      jsxTooltip = toModuleNamespace(
        loadJsxNamespace(),
        1,
      );
      TOOLTIP_NO_SHOW = Symbol(
        "cds.Tooltip.noShow",
      ) as Overlays.EmptyTooltipContent;
      closedTooltipState = {
        open: false,
        body: undefined,
      };
      tooltipSingleLineClasses = singleLineTooltipClasses;
      tooltipSecondaryDetailClasses = tooltipDetailClasses;
      tooltipMultilineBodyClasses = `flex flex-col gap-0.5 ${multilineTooltipClasses}`;
      OverflowTooltip = reactTooltip.forwardRef(function (
        {
          className: className,
          side: side,
          align: align,
          sideOffset: sideOffset,
          delay: delay,
          collisionPadding: collisionPadding,
          hoverable: hoverable,
          lazy: lazy,
          children: children,
          ...props
        }: Overlays.OverflowTooltipProps,
        forwardedRef: React.ForwardedRef<HTMLSpanElement>,
      ): React.ReactElement {
        let ref = reactTooltip.useRef<HTMLSpanElement | null>(null),
          mergedRef = useMergedRefs(ref, forwardedRef),
          tooltipsDisabled = useTooltipsDisabled();
        return (
          <Tooltip
            content={
              tooltipsDisabled
                ? undefined
                : () => {
                    let current = ref.current;
                    if (current === null) {
                      return;
                    }
                    if (
                      current.scrollWidth > current.clientWidth ||
                      isTextRangeClipped(current)
                    ) {
                      return children;
                    } else {
                      return undefined;
                    }
                  }
            }
            side={side}
            align={align}
            sideOffset={sideOffset}
            delay={delay}
            collisionPadding={collisionPadding}
            hoverable={hoverable}
            lazy={lazy}
          >
            <span
              {...props}
              ref={mergedRef}
              data-cds={"OverflowTooltip"}
              className={cn(
                "block min-w-0 overflow-x-clip text-ellipsis whitespace-nowrap",
                className,
              )}
            >
              {children}
            </span>
          </Tooltip>
        );
      });
      OverflowTooltip.displayName = "OverflowTooltip";
      defaultTooltipImplementation = {
        Tooltip: Tooltip,
        DisabledReasonTooltip: DisabledReasonTooltip,
      };
      tooltipProviderContext = reactTooltip.createContext(false);
    });
    initializeHostSupport = () => {};
    hotReloadCopyExports = {} as HotReloadCopyExports;
    defineLiveExports(hotReloadCopyExports, {
      unpublishableWords: (): HotReloadCopyExports["unpublishableWords"] =>
        unpublishableMigrationFilesMessage,
      keptWords: (): HotReloadCopyExports["keptWords"] =>
        storeFoldKeptFilesMessage,
      downloadsRefusedWords:
        (): HotReloadCopyExports["downloadsRefusedWords"] =>
          temporarilyUnsavableMigrationFilesMessage,
      STRAY_INDEX_NOTICE: (): string =>
        get_IGNORED_LEGACY_ROOT_FILE_MESSAGE(),
      STORE_WRITTEN_NOTICE: (): string =>
        get_UNREAD_LEGACY_STORE_CHANGES_MESSAGE(),
      REOPENED_VIEW_ONLY_MESSAGE: (): string =>
        get_DESIGN_SYSTEM_REOPENED_MESSAGE(),
      REOPENED_MESSAGE: (): string =>
        get_EDITABLE_DESIGN_SYSTEM_REOPENED_MESSAGE(),
      RELOAD_YOURSELF_NOTICE: (): string => DEFAULT_RELOAD_MESSAGE,
      NOT_REOPENED_SPOKEN: (): string => get_MIGRATION_UNCHANGED_MESSAGE(),
      NOT_REOPENED_NOTICE: (): string =>
        get_MIGRATION_REOPEN_UNAVAILABLE_MESSAGE(),
      NOT_MOVED_REOPEN_MESSAGE: (): string =>
        get_MIGRATION_STOPPED_REOPEN_MESSAGE(),
      NOT_MOVED_RELOAD_NOTICE: (): string =>
        get_MIGRATION_STOPPED_RELOAD_MESSAGE(),
      NOT_MOVED_INTERRUPTED_NOTICE: (): string =>
        get_MIGRATION_INTERRUPTED_MESSAGE(),
      MOVE_WAIT_OVER_MESSAGE: (): string =>
        get_MIGRATION_OTHER_TAB_TIMEOUT_MESSAGE(),
      MOVE_STOPPED_NOTICE: (): string =>
        get_MIGRATION_UNREADABLE_FILE_MESSAGE(),
      MOVE_ENDED_REOPEN_MESSAGE: (): string =>
        get_MIGRATION_ENDED_REOPEN_MESSAGE(),
      MOVED_REOPEN_MESSAGE: (): string => get_MIGRATION_DONE_REOPEN_MESSAGE(),
      FOLDED_NOTICE: (): string => get_EXTERNAL_CHANGES_FOLDED_MESSAGE(),
      ABOUT_TO_MOVE_MESSAGE: (): string =>
        get_MIGRATION_STARTING_REOPEN_MESSAGE(),
    });
  };
}
