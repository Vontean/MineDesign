/** Restored application module; prepare first, initialize in original order. */
import type * as React from "react";
import type {
  NavigationSearchRuntime,
  NavigationPillActivity,
  NavigationPillClock,
  RankedSearchEntry,
  SearchEntry,
  SearchRankGroup,
  SearchResult,
  SearchSnapshot,
  SectionRow,
  EditorScale,
} from "../../contracts/application";
import type { ScalarToken, TokenFamily } from "../../contracts";
import { loadReactNamespace } from "../../dependencies";
import { commentTargetId } from "../../editor/comment-anchors";
import { markdownCommitClock } from "../../editor/markdown-commit";
import { assetGroupDisplayName, extraTokenFamilySectionId } from "../../editor/view-model";
import { toModuleNamespace } from "../../module-helpers";
import { isApplePlatform } from "../../ui/platform-shortcuts";
import { optionMatchesQuery } from "../../ui/property-search";

var reactSectionNavigation: typeof React;
var FIND_BAR_ATTRIBUTE: string;
var FIND_BAR_EDIT_SHORTCUTS: string[];
var findBarKeyHandlers: WeakMap<Element, (event: KeyboardEvent) => boolean>;
var findBarGuardedWindows: WeakSet<Window>;
var NAV_SEARCH_MATCH_LIMIT: number;
var searchEntryWords: (...words: (string | number | undefined)[]) => string[];
var FILE_SEARCH_MATCH_LIMIT: number;
function matchesLatinShortcut(
  event: Pick<KeyboardEvent, "key" | "code">,
  letter: string,
): boolean {
  if (event.key.toLowerCase() === letter) {
    return true;
  }
  return (
    event.code === "Key" + letter.toUpperCase() &&
    /^[\p{L}\p{M}]$/u.test(event.key) &&
    !/\p{Script=Latin}/u.test(event.key)
  );
}
function captureFindBarKey(event: KeyboardEvent): void {
  let target = event.target as
      | (EventTarget & Partial<Pick<Element, "closest" | "tagName">>)
      | null,
    value =
      typeof target?.closest === "function"
        ? target.closest("[" + FIND_BAR_ATTRIBUTE + "]")
        : null;
  if (value === null || target === null || event.key === "F6") {
    return;
  }
  let flag = false;
  try {
    flag =
      event.type === "keydown" &&
      findBarKeyHandlers.get(value)?.(event) === true;
  } catch {
    flag = false;
  }
  if (
    flag === false &&
    (target.tagName === "INPUT" ||
      (matchesLatinShortcut(event, "s") &&
        isPrimaryShortcutModifier(event, isApplePlatform())))
  ) {
    return;
  }
  event.stopImmediatePropagation();
  let value2 =
      !event.ctrlKey &&
      !event.metaKey &&
      !event.altKey &&
      !/^F\d+$/.test(event.key) &&
      event.key !== "Tab" &&
      event.key !== "Enter" &&
      event.key !== " ",
    value3 =
      (event.ctrlKey || event.metaKey) &&
      !event.altKey &&
      FIND_BAR_EDIT_SHORTCUTS.some((input) =>
        matchesLatinShortcut(event, input),
      );
  if (!flag && event.type === "keydown" && (value2 || value3)) {
    event.preventDefault();
  }
}
function captureFindBarClipboard(event: ClipboardEvent): void {
  let target = event.target as
    | (EventTarget & Partial<Pick<Element, "closest" | "tagName">>)
    | null;
  if (
    target === null ||
    typeof target.closest !== "function" ||
    target.tagName === "INPUT"
  ) {
    return;
  }
  if (target.closest("[" + FIND_BAR_ATTRIBUTE + "]") === null) {
    return;
  }
  event.stopImmediatePropagation();
  event.preventDefault();
}
function installFindBarEventGuards(input: Window): void {
  if (findBarGuardedWindows.has(input)) {
    return;
  }
  findBarGuardedWindows.add(input);
  for (let value of ["keydown", "keyup", "keypress"] as const) {
    input.addEventListener(value, captureFindBarKey, true);
  }
  for (let value of ["cut", "copy", "paste"] as const) {
    input.addEventListener(value, captureFindBarClipboard, true);
  }
}
function isPrimaryShortcutModifier(
  event: Pick<KeyboardEvent, "altKey" | "ctrlKey" | "metaKey">,
  mac: boolean,
): boolean {
  return (
    !event.altKey &&
    (mac ? event.metaKey && !event.ctrlKey : event.ctrlKey && !event.metaKey)
  );
}
function isFindShortcut(
  event: KeyboardEvent,
  mac: boolean = isApplePlatform(),
) {
  return (
    isPrimaryShortcutModifier(event, mac) &&
    !event.shiftKey &&
    matchesLatinShortcut(event, "f")
  );
}
function tokenSearchEntries(
  section: string,
  scale: EditorScale,
): SearchEntry[] {
  return scale.tokens.map((input) => ({
    section: section,
    label: input.name,
    words: searchEntryWords(input.value, input.usage),
    target: commentTargetId("token", input.name),
  }));
}
function buildSectionSearchIndex(
  snapshot: SearchSnapshot,
  sections: SectionRow[],
  sectionTitles: Readonly<Record<string, string>> = {},
) {
  let entriesBySection: Record<string, SearchEntry[]> = {
    readme: snapshot.docs.map((input) => ({
      section: "readme",
      label: input.title,
      words: searchEntryWords(input.path),
      target: commentTargetId("doc", input.path),
    })),
    colors: snapshot.colorGroups.flatMap((input) =>
      input.tokens.map((input2) => ({
        section: "colors",
        label: input2.name,
        words: searchEntryWords(
          ...Object.values(input2.value),
          ...Object.values(input2.alias ?? {}).map((input3) => input3.css),
          input2.usage,
        ),
        target: commentTargetId("token", input2.name),
      })),
    ),
    type: snapshot.typeGroups.flatMap((input) => [
      {
        section: "type",
        label: input.name,
        words: searchEntryWords(
          snapshot.familyNames[input.family],
          input.note,
        ),
        target: commentTargetId("tset", input.name),
      },
      ...input.styles.map((input2) => ({
        section: "type",
        label: input2.name,
        words: searchEntryWords(
          input2.fontSize,
          input2.fontWeight,
          snapshot.familyNames[input2.familyKey ?? input.family],
          input2.usage,
        ),
        target: commentTargetId("style", input2.name),
      })),
    ]),
    spacing: tokenSearchEntries("spacing", snapshot.spacing),
    corners: tokenSearchEntries("corners", snapshot.corners),
    shadows: snapshot.shadows.tokens.map((input) => ({
      section: "shadows",
      label: input.name,
      words: searchEntryWords(input.usage, ...Object.values(input.value)),
      target: commentTargetId("token", input.name),
    })),
    components: snapshot.components.map((input) => ({
      section: "components",
      label: input.name,
      words: [],
      target: commentTargetId("comp", input.name),
    })),
    assets: snapshot.assetGroups.flatMap((input) => [
      {
        section: "assets",
        label:
          sectionTitles["assets:" + input.name] ??
          assetGroupDisplayName(input.name),
        words: searchEntryWords(input.folder),
        target: commentTargetId("agroup", input.name),
      },
      ...input.assets.map((input2) => ({
        section: "assets",
        label: input2.name,
        words: searchEntryWords(input2.path),
        target: commentTargetId("asset", input2.path),
        asset: input2.path,
      })),
    ]),
  };
  for (let value of snapshot.extras) {
    entriesBySection[extraTokenFamilySectionId(value.key)] =
      tokenSearchEntries(
        extraTokenFamilySectionId(value.key),
        value.scale,
      );
  }
  return sections.flatMap((input) => [
    {
      section: input.id,
      label: input.label,
      words: [],
    },
    ...(entriesBySection[input.id] ?? []),
  ]);
}
function rankSectionSearchResults(
  index: SearchEntry[],
  query: string,
  limit: number = NAV_SEARCH_MATCH_LIMIT,
): SearchResult {
  let terms = query
      .toLowerCase()
      .split(/\s+/)
      .filter((input) => input !== ""),
    phrase = terms.join(" "),
    ranked: RankedSearchEntry[] = [];
  for (let value of terms.length === 0 ? [] : index) {
    if (
      !terms.every((input) =>
        optionMatchesQuery(input, value.label, ...value.words),
      )
    ) {
      continue;
    }
    let value2 = value.label.toLowerCase();
    ranked.push({
      entry: value,
      rank:
        value2 === phrase
          ? 0
          : value2.startsWith(phrase)
            ? 1
            : terms.every((input) =>
                  optionMatchesQuery(input, value.label),
                )
              ? 2
              : 3,
    });
  }
  let targeted = ranked.filter((input) => input.entry.target !== undefined),
    shown = new Set(
      [...targeted]
        .sort((input, options) => input.rank - options.rank)
        .slice(0, limit),
    ),
    groups: SearchRankGroup[] = [];
  for (let value of ranked) {
    if (value.entry.target !== undefined && !shown.has(value)) {
      continue;
    }
    let value2 = groups[groups.length - 1];
    if (value2 === undefined || value2.section !== value.entry.section) {
      groups.push(
        (value2 = {
          section: value.entry.section,
          named: [],
          other: [],
        }),
      );
    }
    if (value.entry.target === undefined) {
      value2.head = value.rank;
    } else {
      (value.rank < 3 ? value2.named : value2.other).push(value);
    }
  }
  let row = 0,
    best = {
      rank: 4,
      row: 0,
    },
    considerBest = (input: number, options: number) => {
      if (input < best.rank) {
        best = {
          rank: input,
          row: options,
        };
      }
    };
  return {
    groups: groups.map((input) => {
      if (input.head !== undefined) {
        considerBest(input.head, row);
      }
      row++;
      let value = [...input.named, ...input.other].map((input2) => {
        considerBest(input2.rank, row++);
        return {
          entry: input2.entry,
          detail:
            input2.rank < 3
              ? undefined
              : input2.entry.words.find((input3) =>
                  terms.some((input4) =>
                    optionMatchesQuery(input4, input3),
                  ),
                ),
        };
      });
      return {
        section: input.section,
        hits: value,
      };
    }),
    total: ranked.length,
    hidden: targeted.length - shown.size,
    bestRow: best.row,
  };
}
function searchSectionsAndFiles(
  index: SearchEntry[],
  files: SearchEntry[] | undefined,
  query: string,
): SearchResult {
  let result = rankSectionSearchResults(index, query);
  if (files === undefined || files.length === 0) {
    return result;
  }
  let fileResult = rankSectionSearchResults(
      files,
      query,
      FILE_SEARCH_MATCH_LIMIT,
    ),
    rowOffset = result.groups.reduce(
      (input, options) => input + 1 + options.hits.length,
      0,
    );
  return {
    groups: [...result.groups, ...fileResult.groups],
    total: result.total + fileResult.total,
    hidden: result.hidden + fileResult.hidden,
    bestRow:
      result.total > 0 || fileResult.total === 0
        ? result.bestRow
        : rowOffset + fileResult.bestRow,
  };
}
function createNavigationPillActivity(
  holdMs: number,
  onChange: (active: boolean) => void,
  timers: NavigationPillClock = markdownCommitClock,
): NavigationPillActivity {
  let active = false,
    held = false,
    holdUntil = 0,
    timer: ReturnType<NavigationPillClock["setTimeout"]> | undefined,
    setActive = (input: boolean) => {
      if (input === active) {
        return;
      }
      active = input;
      onChange(input);
    },
    check = () => {
      timer = undefined;
      if (held) {
        return;
      }
      let value = holdUntil - timers.now();
      if (value <= 0) {
        setActive(false);
      } else {
        timer = timers.setTimeout(check, value);
      }
    },
    extend = (input: number) => {
      holdUntil = Math.max(holdUntil, timers.now() + input);
      setActive(true);
      if (timer === undefined) {
        timer = timers.setTimeout(check, input);
      }
    };
  return {
    bump(input = holdMs) {
      extend(input);
    },
    hold(input: boolean) {
      if (input === held) {
        return;
      }
      held = input;
      if (input) {
        setActive(true);
      } else {
        extend(holdMs);
      }
    },
    dispose() {
      if (timer !== undefined) {
        timers.clearTimeout(timer);
      }
      timer = undefined;
    },
  };
}
export {
  buildSectionSearchIndex,
  captureFindBarClipboard,
  captureFindBarKey,
  createNavigationPillActivity,
  FILE_SEARCH_MATCH_LIMIT,
  FIND_BAR_ATTRIBUTE,
  FIND_BAR_EDIT_SHORTCUTS,
  findBarGuardedWindows,
  findBarKeyHandlers,
  installFindBarEventGuards,
  isFindShortcut,
  isPrimaryShortcutModifier,
  matchesLatinShortcut,
  NAV_SEARCH_MATCH_LIMIT,
  rankSectionSearchResults,
  reactSectionNavigation,
  searchEntryWords,
  searchSectionsAndFiles,
  tokenSearchEntries,
};
export function installFilesUiNavigationSearch(): () => void {
  return () => {
    reactSectionNavigation = toModuleNamespace(
      loadReactNamespace(),
      1,
    );
    FIND_BAR_ATTRIBUTE = "data-mc-find";
    FIND_BAR_EDIT_SHORTCUTS = ["x", "c", "v", "z", "y", "a", "d"];
    findBarKeyHandlers = new WeakMap();
    findBarGuardedWindows = new WeakSet();
    if (typeof window !== "undefined") {
      installFindBarEventGuards(window);
    }
    NAV_SEARCH_MATCH_LIMIT = 100;
    searchEntryWords = (...input) =>
      input
        .filter((input2) => input2 !== undefined && input2 !== "")
        .map(String);
    FILE_SEARCH_MATCH_LIMIT = 20;
  };
}
