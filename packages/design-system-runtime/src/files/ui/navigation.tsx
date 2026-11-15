import { useUiLocale } from '../../ui-locale.ts';
import { uiMessage } from '@minedesign/contracts/ui-messages';
/** Restored application module; prepare first, initialize in original order. */
import type * as React from "react";
import type * as JsxRuntime from "react/jsx-runtime";
import type {
  NavigationRuntime,
  NavigationProps,
  FloatingNavigationProps,
  NavigationRowsProps,
  PendingSectionRowProps,
  NavigationSearch,
  NavigationSearchState,
  SectionSearchFieldProps,
  NavigationPillActivity,
  SearchEntry,
  SectionRow,
} from "../../contracts/application";
import { loadJsxNamespace } from "../../dependencies";
import { UNCOMMENTABLE_PROPS } from "../../editor/comment-anchors";
import { isComposingEvent } from "../../editor/markdown-toolbar";
import { createNavigationPillActivity, isFindShortcut, reactSectionNavigation, searchSectionsAndFiles } from "./navigation-search";
import { toModuleNamespace } from "../../module-helpers";
import { OPEN_OVERLAY_SELECTOR } from "../../platform/frame-chrome";
import { TOOLBAR_WIDE_BREAKPOINT } from "../../ui/artifact-toolbar";
import { TooltipProvider } from "../../ui/avatars";
import { Button, Button as Button_r } from "../../ui/buttons";
import { TooltipWrapper } from "../../ui/color/gradient-stops";
import { CdsRoot } from "../../ui/overlays";
import { isApplePlatform } from "../../ui/platform-shortcuts";
import { hasOpenOverlay, isOverlayClosed } from "../../ui/property-focus";
import { PropertyPopup } from "../../ui/property-popover";
import { createOptionListKeyHandler, OptionList } from "../../ui/property-search";

var jsxSectionNavigation: typeof JsxRuntime;
var SIDEBAR_MEDIA_QUERY: string;
var SECTION_ICON_NAMES: Record<string, string>;
var NAV_SEARCH_BROWSER_FIND_HINT: string;
var NAV_SECTION_LIST_CLASS: string;
var handleNavigationRowKey: React.KeyboardEventHandler<HTMLElement>;
var NAV_ESCAPE_COMPOSITION_GRACE_MS: number;
var NAV_PILL_ACTIVITY_MS: number;
var NAV_PILL_INITIAL_ACTIVITY_MS: number;
var navigationPillInitialHintShown: boolean;
function sectionIconName(id: string): string {
  return SECTION_ICON_NAMES[id] ?? "Token";
}
function initialSectionFromHash(
  sections: string[] | ((section: string) => boolean),
  fallback: string,
) {
  let hash =
    typeof window === "undefined" ? "" : window.location.hash.slice(1);
  if (
    typeof sections === "function" ? sections(hash) : sections.includes(hash)
  ) {
    return hash;
  } else {
    return fallback;
  }
}
function replaceSectionHash(section: string): void {
  try {
    let { location: value, history: value2 } = window;
    if (value.protocol !== "about:" && value.hash !== "#" + section) {
      value2.replaceState(null, "", "#" + section);
    }
  } catch {}
}
function NavigationConflictMark() {
  useUiLocale();
  return (
    <span
      className={
        "ds-navmark ml-auto inline-flex items-center gap-1 text-caption text-warning"
      }
      data-testid={"ds-navmark"}
      title={
        uiMessage("design-system.navigation.aFileHereWasChangedBySomeoneElseWhileYouWereEditingItChooseTheirsOrYoursAtTheTop")
      }
    >
      {[<span
          aria-hidden={"true"}
          className={"inline-block size-2 rounded-full bg-warning"}
        />, <span className={"sr-only"}>{uiMessage("design-system.navigation.needsYourChoice")}</span>]}
    </span>
  );
}
function PendingSectionRow({
  row: row,
  tip: tip,
  tipId: tipId,
  panel: panel,
}: PendingSectionRowProps) {
  useUiLocale();
  let [value, value2] = reactSectionNavigation.useState(false),
    ref = reactSectionNavigation.useRef(false);
  return (
    <div className={"relative flex w-full shrink-0"}>
      <PropertyPopup
        open={value}
        onOpen={() => value2(true)}
        onClose={() => value2(false)}
        align={"left"}
        popupAttrs={UNCOMMENTABLE_PROPS}
        focusOnOpen={ref.current}
        aria-label={row.label}
        trigger={(input: React.HTMLAttributes<HTMLElement>) => (
          <TooltipWrapper
            tip={tip}
            side={"bottom"}
            align={"left"}
            className={"w-full"}
          >
            <Button
              {...input}
              variant={"ghost"}
              size={"sm"}
              icon={sectionIconName(row.id)}
              aria-describedby={tipId}
              className={"ds-navrow ds-navrow-pending w-full justify-start"}
              data-testid={"ds-pending-" + row.id}
              onClick={(input2: React.MouseEvent<HTMLElement>) => {
                ref.current = input2.detail === 0;
                input.onClick?.(input2);
              }}
            >
              {row.label}
            </Button>
          </TooltipWrapper>
        )}
      >
        {value ? (panel(row, () => value2(false))) : (null)}
      </PropertyPopup>
    </div>
  );
}
function SectionNavigationRows({
  sections: sections,
  tail = [],
  current: current,
  onJump: onJump,
  marks: marks,
  hits: hits,
  pending: pending,
}: NavigationRowsProps) {
  useUiLocale();
  let items = [...sections, ...tail],
    value =
      hits === undefined
        ? items.map((input) => ({
            section: input.id,
            hits: [],
          }))
        : hits.result.groups,
    value2 = reactSectionNavigation.useId();
  return (
    <jsxSectionNavigation.Fragment>
      {value.map((input) => {
        let value3 = items.find((input2) => input2.id === input.section);
        if (value3 === undefined) {
          return null;
        } else {
          return (() => {
            const _Element3 = jsxSectionNavigation.Fragment;
            const _elementProps3 = {
              children: [
                value3 === tail[0] && input !== value[0] ? (
                  <div
                    aria-hidden={"true"}
                    className={"my-1 shrink-0 border-t border-border-line"}
                    data-testid={"ds-nav-rule"}
                  />
                ) : null,
                <Button
                  variant={"ghost"}
                  size={"sm"}
                  icon={sectionIconName(value3.id)}
                  aria-current={
                    value3.id === current ? "location" : undefined
                  }
                  aria-label={
                    value3.count !== undefined && value3.count > 0 ? (((value3.label) + (", ")) + (value3.count.toLocaleString("en-US"))) : (undefined)
                  }
                  className={"ds-navrow w-full justify-start"}
                  data-testid={"ds-jump-" + value3.id}
                  onClick={() => onJump(value3.id)}
                >
                  {[value3.label, marks?.has(value3.id) === true ? (
                      <NavigationConflictMark />
                    ) : null, value3.count !== undefined && value3.count > 0 ? (
                      <span
                        className={
                          "pl-xs text-caption tabular-nums text-muted"
                        }
                        title={value3.countLabel}
                        data-testid={"ds-nav-count"}
                      >
                        {value3.count.toLocaleString("en-US")}
                      </span>
                    ) : null]}
                </Button>,
                input.hits.map((input2, options) =>
                  (() => {
                    const _Element = Button_r;
                    const _elementProps = {
                      variant: "ghost" as const,
                      size: "sm" as const,
                      get "aria-label"() { return input2.detail !== undefined ? (((input2.entry.label) + (", ")) + (input2.detail)) : (undefined); },
                      className: "ds-navrow ds-navhit w-full justify-start",
                      "data-testid": "ds-search-hit",
                      onClick: () => hits?.onPick(input2.entry),
                      children: [
                        <span className={"max-w-full shrink-0 truncate"}>
                          {input2.entry.label}
                        </span>,
                        input2.detail !== undefined ? (
                          <span
                            className={
                              "min-w-0 truncate pl-xs text-caption text-muted"
                            }
                          >
                            {input2.detail}
                          </span>
                        ) : null,
                      ],
                    };
                    const _elementKey = options;
                    return <_Element key={_elementKey} {..._elementProps} />;
                  })(),
                ),
                hits === undefined &&
                value3 === sections[sections.length - 1] &&
                pending !== undefined ? (
                  <TooltipProvider>
                    {[<span id={value2} hidden={true}>
                        {pending.tip}
                      </span>, pending.rows.map((input2) =>
                        (() => {
                          const _Element2 = PendingSectionRow;
                          const _elementProps2 = {
                            row: input2,
                            tip: pending.tip,
                            tipId: value2,
                            panel: pending.panel,
                          };
                          const _elementKey2 = input2.id;
                          return (
                            <_Element2
                              key={_elementKey2}
                              {..._elementProps2}
                            />
                          );
                        })(),
                      )]}
                  </TooltipProvider>
                ) : null,
              ],
            };
            const _elementKey3 = value3.id;
            return <_Element3 key={_elementKey3} {..._elementProps3} />;
          })();
        }
      })}
    </jsxSectionNavigation.Fragment>
  );
}
function focusAndSelectSearchInput(input: HTMLInputElement | null): boolean {
  if (input === null || input.ownerDocument.activeElement === input) {
    return false;
  }
  input.focus();
  input.select();
  return input.ownerDocument.activeElement === input;
}
function hasOtherOpenOverlay(searchInput: HTMLInputElement | null): boolean {
  return Array.from(
    document.querySelectorAll(OPEN_OVERLAY_SELECTOR),
  ).some(
    (input) =>
      !input.contains(searchInput) &&
      !input.hasAttribute("data-mc-scrim") &&
      !(0, isOverlayClosed)(input),
  );
}
function useSectionNavigationSearch(
  search: NavigationSearch | undefined,
  focusSearch: (input: HTMLInputElement | null) => boolean,
): NavigationSearchState {
  let [query, setQuery] = reactSectionNavigation.useState(""),
    index = search?.index,
    fileEntries = search?.tail,
    result = reactSectionNavigation.useMemo(
      () =>
        index === undefined || query.trim() === ""
          ? null
          : (0, searchSectionsAndFiles)(index, fileEntries, query),
      [index, fileEntries, query],
    ),
    box = reactSectionNavigation.useRef<HTMLSpanElement | null>(null),
    focusRef = reactSectionNavigation.useRef(focusSearch);
  focusRef.current = focusSearch;
  let enabled = search !== undefined;
  reactSectionNavigation.useEffect(() => {
    if (!enabled) {
      return;
    }
    let flag = false,
      callback = (event: KeyboardEvent) => {
        if (
          !(0, isFindShortcut)(event) ||
          event.defaultPrevented ||
          (0, isComposingEvent)(event)
        ) {
          return;
        }
        if (!event.repeat) {
          flag = focusRef.current(
            box.current?.querySelector("input") ?? null,
          );
        }
        if (flag) {
          event.preventDefault();
        }
      };
    window.addEventListener("keydown", callback, true);
    return () => window.removeEventListener("keydown", callback, true);
  }, [enabled]);
  return {
    query: query,
    setQuery: setQuery,
    result: result,
    box: box,
  };
}
function useSearchEscapeToRow() {
  let ref = reactSectionNavigation.useRef(-1 / 0);
  return {
    onCompositionEnd: (input: React.CompositionEvent) => {
      ref.current = input.timeStamp;
    },
    onKeyDown: (event: React.KeyboardEvent) => {
      let target = event.target;
      if (
        event.key !== "Escape" ||
        event.defaultPrevented ||
        event.repeat ||
        event.shiftKey ||
        event.ctrlKey ||
        event.altKey ||
        event.metaKey ||
        (0, isComposingEvent)(event) ||
        event.timeStamp - ref.current < NAV_ESCAPE_COMPOSITION_GRACE_MS
      ) {
        return;
      }
      if (!(target instanceof HTMLInputElement) || target.value !== "") {
        return;
      }
      event.preventDefault();
      let ancestor = target.closest("nav");
      (
        ancestor?.querySelector<HTMLElement>(".ds-navrow[aria-current]") ??
        ancestor?.querySelector<HTMLElement>(".ds-navrow")
      )?.focus();
      if (target.ownerDocument.activeElement === target) {
        target.blur();
      }
    },
  };
}
function SectionSearchField({
  query: query,
  setQuery: setQuery,
  result: result,
  box: box,
  escapeToRow = false,
}: SectionSearchFieldProps) {
  useUiLocale();
  let value = useSearchEscapeToRow(),
    value2 = reactSectionNavigation.useId();
  reactSectionNavigation.useEffect(() => {
    let value3 = box.current?.querySelector("input");
    value3?.setAttribute("aria-describedby", value2);
    return () => value3?.removeAttribute("aria-describedby");
  }, [box, value2]);
  return (
    <CdsRoot
      density={"compact"}
      className={"contents"}
      render={escapeToRow ? <div {...value} /> : undefined}
    >
      <span ref={box} className={"contents"}>
        {[<OptionList
            value={query}
            onChange={setQuery}
            label={uiMessage("design-system.navigation.search")}
            rowSelector={".ds-navrow"}
            onEnterIndex={() => result?.bestRow ?? 0}
            className={"mb-sm w-0 min-w-full"}
            data-testid={"ds-search"}
          />, <span id={value2} hidden={true}>
            {NAV_SEARCH_BROWSER_FIND_HINT}
          </span>]}
      </span>
    </CdsRoot>
  );
}
function SectionSearchStatus({
  query: query,
  result: result,
}: Pick<NavigationSearchState, "query" | "result">) {
  useUiLocale();
  let value =
      result === null
        ? null
        : result.total === 0
          ? uiMessage("design-system.navigation.noMatchesFor") + query.trim() + "”"
          : result.hidden > 0
            ? uiMessage("design-system.navigation.searchHidden", {shown: result.total-result.hidden, total: result.total})
            : null,
    value2 =
      result === null
        ? ""
        : uiMessage(result.total === 1 ? "design-system.navigation.match" : "design-system.navigation.matches", {count: result.total});
  return (
    <p
      className={
        value !== null
          ? "break-words px-1.5 py-xs text-footnote text-muted"
          : "sr-only"
      }
      role={"status"}
      data-testid={"ds-search-note"}
    >
      {value ?? (value2)}
    </p>
  );
}
function SidebarSectionNavigation({
  sections: sections,
  tail: tail,
  current: current,
  onJump: onJump,
  dropProps: dropProps,
  footer: footer,
  navRef: navRef,
  marks: marks,
  search: search,
  pending: pending,
}: NavigationProps) {
  useUiLocale();
  let value = useSectionNavigationSearch(
    search,
    (input) =>
      !(0, hasOpenOverlay)() && focusAndSelectSearchInput(input),
  );
  return (
    <nav
      className={
        "ds-section-nav flex h-full w-60 shrink-0 flex-col border-r border-border-line bg-surface-1 p-2"
      }
      aria-label={uiMessage("design-system.navigation.sections")}
      data-testid={"ds-section-nav"}
      data-search-scope={search !== undefined ? "" : undefined}
      onKeyDown={search !== undefined ? handleNavigationRowKey : undefined}
      ref={navRef}
      {...UNCOMMENTABLE_PROPS}
      {...dropProps}
    >
      {[search !== undefined ? (
          <SectionSearchField {...value} escapeToRow={true} />
        ) : null, <div className={NAV_SECTION_LIST_CLASS}>
          {[<SectionNavigationRows
              sections={sections}
              tail={tail}
              current={current}
              onJump={onJump}
              marks={marks}
              pending={pending}
              hits={
                value.result !== null && search !== undefined
                  ? {
                      result: value.result,
                      onPick: search.onPick,
                    }
                  : undefined
              }
            />, search !== undefined ? (
              <SectionSearchStatus
                query={value.query}
                result={value.result}
              />
            ) : null]}
        </div>, footer !== undefined ? (
          <div
            className={"ds-nav-foot flex items-center gap-xs pt-sm"}
            data-testid={"ds-nav-foot"}
          >
            {footer}
          </div>
        ) : null]}
    </nav>
  );
}
function useNavigationPillActivity(
  port: HTMLElement | null | undefined,
  held: boolean,
): boolean {
  let [active, setActive] = reactSectionNavigation.useState(false),
    activity =
      reactSectionNavigation.useRef<NavigationPillActivity | null>(
        null,
      );
  if (activity.current === null) {
    activity.current = (0, createNavigationPillActivity)(
      NAV_PILL_ACTIVITY_MS,
      setActive,
    );
  }
  reactSectionNavigation.useEffect(
    () => () => activity.current?.dispose(),
    [],
  );
  reactSectionNavigation.useEffect(() => {
    if (!navigationPillInitialHintShown) {
      navigationPillInitialHintShown = true;
      activity.current?.bump(NAV_PILL_INITIAL_ACTIVITY_MS);
    }
  }, []);
  reactSectionNavigation.useEffect(
    () => activity.current?.hold(held),
    [held],
  );
  reactSectionNavigation.useEffect(() => {
    if (port === null || port === undefined) {
      return;
    }
    let callback = () => activity.current?.bump();
    port.addEventListener("scroll", callback, {
      passive: true,
    });
    return () => port.removeEventListener("scroll", callback);
  }, [port]);
  return active;
}
function assignReactRef<T>(
  ref: React.Ref<T> | undefined,
  element: T | null,
): void {
  if (typeof ref === "function") {
    ref(element);
  } else if (ref !== undefined && ref !== null) {
    ref.current = element;
  }
}
function isFocusVisible(element: Element | null): boolean {
  try {
    return element instanceof Element && element.matches(":focus-visible");
  } catch {
    return false;
  }
}
function FloatingSectionNavigation({
  sections: sections,
  tail: tail,
  current: current,
  onJump: onJump,
  footer: footer,
  status: status,
  navRef: navRef,
  edgeRef: edgeRef,
  port: port,
  marks: marks,
  search: search,
  pending: pending,
}: FloatingNavigationProps) {
  useUiLocale();
  let [value, value2] = reactSectionNavigation.useState(false),
    [value3, value4] = reactSectionNavigation.useState(false),
    [value5, value6] = reactSectionNavigation.useState(false),
    ref = reactSectionNavigation.useRef(false),
    ref2 = reactSectionNavigation.useRef<HTMLDivElement | null>(null),
    value7 = useSectionNavigationSearch(search, (input) => {
      if (value) {
        return (
          !hasOtherOpenOverlay(input) && focusAndSelectSearchInput(input)
        );
      }
      if (
        (0, hasOpenOverlay)() ||
        ref2.current === null ||
        ref2.current.closest("[inert]") !== null
      ) {
        return false;
      }
      ref2.current.querySelector<HTMLElement>(".ds-nav-fab-btn")?.focus();
      ref.current = true;
      value2(true);
      return true;
    }),
    callback = () => {
      value2(false);
      value7.setQuery("");
    },
    value8 = pending && {
      ...pending,
      panel: (input: SectionRow, options: () => void) =>
        pending.panel(input, () => {
          options();
          callback();
        }),
    },
    callback2 = (input: SearchEntry) => {
      callback();
      window.setTimeout(() => {
        let activeElement = document.activeElement;
        if (
          activeElement instanceof HTMLElement &&
          activeElement.closest(".ds-nav-fab") !== null
        ) {
          activeElement.blur();
        }
        search?.onPick(input);
      }, 0);
    },
    value9 = reactSectionNavigation.useId(),
    value10 = sections.findIndex((input) => input.id === current),
    value11 = value10 >= 0 ? sections[value10] : undefined,
    value12 =
      useNavigationPillActivity(port, value || value3 || value5) &&
      value11 !== undefined;
  return (
    <div
      ref={(input: HTMLDivElement | null) => {
        ref2.current = input;
        assignReactRef(edgeRef, input);
        assignReactRef(navRef, input);
      }}
      className={"ds-nav-fab"}
      data-testid={"ds-nav-fab"}
      {...UNCOMMENTABLE_PROPS}
    >
      <span
        className={
          "ds-nav-fab-live relative inline-flex max-w-full items-center gap-xs"
        }
      >
        {[<PropertyPopup
            open={value}
            onOpen={() => value2(true)}
            onClose={callback}
            trigger={
              <Button
                variant={"secondary"}
                icon={value12 ? sectionIconName(current) : "Menu"}
                aria-label={uiMessage("design-system.navigation.sections")}
                aria-describedby={
                  value11 === undefined
                    ? undefined
                    : value9 + "-n " + value9 + "-c"
                }
                className={"ds-nav-fab-btn"}
                data-wide={value12 ? "" : undefined}
                data-testid={"ds-section-menu"}
                onPointerMove={(input: React.PointerEvent) => {
                  if (input.pointerType === "mouse") {
                    value4(true);
                  }
                }}
                onPointerLeave={() => value4(false)}
                onFocus={(input: React.FocusEvent<HTMLElement>) =>
                  value6(isFocusVisible(input.currentTarget))
                }
                onBlur={() => value6(false)}
                onClick={(input: React.MouseEvent) => {
                  ref.current = input.detail === 0;
                }}
              >
                <span className={"ds-nav-fab-label"} aria-hidden={"true"}>
                  <span className={"ds-nav-fab-text"}>
                    {[<span
                        className={"truncate"}
                        id={value9 + "-n"}
                        data-testid={"ds-section-pill-name"}
                      >
                        {value11?.label ?? ("")}
                      </span>, <span
                        className={"text-caption tabular-nums text-muted"}
                        id={value9 + "-c"}
                        data-testid={"ds-section-pill-at"}
                      >
                        {value11 === undefined ? ("") : uiMessage("design-system.navigation.position", {current: value10 + 1, total: sections.length})}
                      </span>]}
                  </span>
                </span>
              </Button>
            }
            align={"left"}
            aria-label={uiMessage("design-system.navigation.sections")}
            popupAttrs={UNCOMMENTABLE_PROPS}
            focusOnOpen={ref.current}
          >
            {value ? (<nav
                className={
                  "ds-section-nav ds-section-pop flex max-h-[min(70vh,32rem)] w-60 flex-col p-2"
                }
                aria-label={uiMessage("design-system.navigation.sections")}
                data-testid={"ds-section-nav"}
                data-search-scope={search !== undefined ? "" : undefined}
                onKeyDown={
                  search !== undefined ? handleNavigationRowKey : undefined
                }
                {...UNCOMMENTABLE_PROPS}
              >
                {[search !== undefined ? (
                    <SectionSearchField {...value7} />
                  ) : null, <div className={NAV_SECTION_LIST_CLASS}>
                    {[<SectionNavigationRows
                        sections={sections}
                        tail={tail}
                        current={current}
                        onJump={(input: string) => {
                          callback();
                          window.setTimeout(() => onJump(input), 0);
                        }}
                        marks={marks}
                        pending={value8}
                        hits={
                          value7.result !== null && search !== undefined
                            ? {
                                result: value7.result,
                                onPick: callback2,
                              }
                            : undefined
                        }
                      />, search !== undefined ? (
                        <SectionSearchStatus
                          query={value7.query}
                          result={value7.result}
                        />
                      ) : null]}
                  </div>, footer !== undefined ? (
                    <div
                      className={
                        "ds-nav-foot mt-sm flex items-center gap-xs border-t border-alpha-2 pt-sm"
                      }
                      data-testid={"ds-nav-foot"}
                    >
                      {footer}
                    </div>
                  ) : null]}
              </nav>) : (null)}
          </PropertyPopup>, status]}
      </span>
    </div>
  );
}
export {
  assignReactRef,
  FloatingSectionNavigation,
  focusAndSelectSearchInput,
  handleNavigationRowKey,
  hasOtherOpenOverlay,
  initialSectionFromHash,
  isFocusVisible,
  jsxSectionNavigation,
  NAV_ESCAPE_COMPOSITION_GRACE_MS,
  NAV_PILL_ACTIVITY_MS,
  NAV_PILL_INITIAL_ACTIVITY_MS,
  NAV_SEARCH_BROWSER_FIND_HINT,
  NAV_SECTION_LIST_CLASS,
  NavigationConflictMark,
  navigationPillInitialHintShown,
  PendingSectionRow,
  replaceSectionHash,
  SECTION_ICON_NAMES,
  sectionIconName,
  SectionNavigationRows,
  SectionSearchField,
  SectionSearchStatus,
  SIDEBAR_MEDIA_QUERY,
  SidebarSectionNavigation,
  useNavigationPillActivity,
  useSearchEscapeToRow,
  useSectionNavigationSearch,
};
export function installFilesUiNavigation(): () => void {
  return () => {
    jsxSectionNavigation = (0, toModuleNamespace)(
      (0, loadJsxNamespace)(),
      1,
    );
    SIDEBAR_MEDIA_QUERY =
      "(min-width: " + String(TOOLBAR_WIDE_BREAKPOINT) + "px)";
    SECTION_ICON_NAMES = {
      readme: "BookText",
      colors: "Palette",
      type: "TextAa",
      spacing: "ArrowsOut",
      corners: "Frame",
      shadows: "Copy",
      components: "Box",
      assets: "Image",
      files: "Folder",
    };
    NAV_SEARCH_BROWSER_FIND_HINT =
      uiMessage("design-system.navigation.press") +
      ((0, isApplePlatform)() ? "Command+F" : "Ctrl+F") +
      " in this field to find text on the page instead.";
    NAV_SECTION_LIST_CLASS =
      "-mx-2 -my-0.5 flex min-h-0 flex-1 flex-col gap-0.5 overflow-y-auto px-2 py-0.5";
    handleNavigationRowKey = (0, createOptionListKeyHandler)(
      ".ds-navrow",
    );
    NAV_ESCAPE_COMPOSITION_GRACE_MS = 500;
    NAV_PILL_ACTIVITY_MS = 1000;
    NAV_PILL_INITIAL_ACTIVITY_MS = 2500;
    navigationPillInitialHintShown = false;
  };
}
