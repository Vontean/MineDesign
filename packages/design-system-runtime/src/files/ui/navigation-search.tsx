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
  let isFindBarShortcut =
      !event.ctrlKey &&
      !event.metaKey &&
      !event.altKey &&
      !/^F\d+$/.test(event.key) &&
      event.key !== "Tab" &&
      event.key !== "Enter" &&
      event.key !== " ",
    isEscapeShortcut =
      (event.ctrlKey || event.metaKey) &&
      !event.altKey &&
      FIND_BAR_EDIT_SHORTCUTS.some((shortcut) =>
        matchesLatinShortcut(event, shortcut),
      );
  if (!flag && event.type === "keydown" && (isFindBarShortcut || isEscapeShortcut)) {
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
function installFindBarEventGuards(window: Window): void {
  if (findBarGuardedWindows.has(window)) {
    return;
  }
  findBarGuardedWindows.add(window);
  for (let value of ["keydown", "keyup", "keypress"] as const) {
    window.addEventListener(value, captureFindBarKey, true);
  }
  for (let value of ["cut", "copy", "paste"] as const) {
    window.addEventListener(value, captureFindBarClipboard, true);
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
  return scale.tokens.map((token) => ({
    section: section,
    label: token.name,
    words: searchEntryWords(token.value, token.usage),
    target: commentTargetId("token", token.name),
  }));
}
function buildSectionSearchIndex(
  snapshot: SearchSnapshot,
  sections: SectionRow[],
  sectionTitles: Readonly<Record<string, string>> = {},
) {
  let entriesBySection: Record<string, SearchEntry[]> = {
    readme: snapshot.docs.map((document) => ({
      section: "readme",
      label: document.title,
      words: searchEntryWords(document.path),
      target: commentTargetId("doc", document.path),
    })),
    colors: snapshot.colorGroups.flatMap((colorGroup) =>
      colorGroup.tokens.map((token) => ({
        section: "colors",
        label: token.name,
        words: searchEntryWords(
          ...Object.values(token.value),
          ...Object.values(token.alias ?? {}).map((alias) => alias.css),
          token.usage,
        ),
        target: commentTargetId("token", token.name),
      })),
    ),
    type: snapshot.typeGroups.flatMap((typeGroup) => [
      {
        section: "type",
        label: typeGroup.name,
        words: searchEntryWords(
          snapshot.familyNames[typeGroup.family],
          typeGroup.note,
        ),
        target: commentTargetId("tset", typeGroup.name),
      },
      ...typeGroup.styles.map((style) => ({
        section: "type",
        label: style.name,
        words: searchEntryWords(
          style.fontSize,
          style.fontWeight,
          snapshot.familyNames[style.familyKey ?? typeGroup.family],
          style.usage,
        ),
        target: commentTargetId("style", style.name),
      })),
    ]),
    spacing: tokenSearchEntries("spacing", snapshot.spacing),
    corners: tokenSearchEntries("corners", snapshot.corners),
    shadows: snapshot.shadows.tokens.map((shadow) => ({
      section: "shadows",
      label: shadow.name,
      words: searchEntryWords(shadow.usage, ...Object.values(shadow.value)),
      target: commentTargetId("token", shadow.name),
    })),
    components: snapshot.components.map((component) => ({
      section: "components",
      label: component.name,
      words: [],
      target: commentTargetId("comp", component.name),
    })),
    assets: snapshot.assetGroups.flatMap((assetGroup) => [
      {
        section: "assets",
        label:
          sectionTitles["assets:" + assetGroup.name] ??
          assetGroupDisplayName(assetGroup.name),
        words: searchEntryWords(assetGroup.folder),
        target: commentTargetId("agroup", assetGroup.name),
      },
      ...assetGroup.assets.map((asset) => ({
        section: "assets",
        label: asset.name,
        words: searchEntryWords(asset.path),
        target: commentTargetId("asset", asset.path),
        asset: asset.path,
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
  return sections.flatMap((section) => [
    {
      section: section.id,
      label: section.label,
      words: [],
    },
    ...(entriesBySection[section.id] ?? []),
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
      .filter((term) => term !== ""),
    phrase = terms.join(" "),
    ranked: RankedSearchEntry[] = [];
  for (let value of terms.length === 0 ? [] : index) {
    if (
      !terms.every((term) =>
        optionMatchesQuery(term, value.label, ...value.words),
      )
    ) {
      continue;
    }
    let labelText = value.label.toLowerCase();
    ranked.push({
      entry: value,
      rank:
        labelText === phrase
          ? 0
          : labelText.startsWith(phrase)
            ? 1
            : terms.every((term) =>
                  optionMatchesQuery(term, value.label),
                )
              ? 2
              : 3,
    });
  }
  let targeted = ranked.filter((result) => result.entry.target !== undefined),
    shown = new Set(
      [...targeted]
        .sort((left, right) => left.rank - right.rank)
        .slice(0, limit),
    ),
    groups: SearchRankGroup[] = [];
  for (let value of ranked) {
    if (value.entry.target !== undefined && !shown.has(value)) {
      continue;
    }
    let lastGroup = groups[groups.length - 1];
    if (lastGroup === undefined || lastGroup.section !== value.entry.section) {
      groups.push(
        (lastGroup = {
          section: value.entry.section,
          named: [],
          other: [],
        }),
      );
    }
    if (value.entry.target === undefined) {
      lastGroup.head = value.rank;
    } else {
      (value.rank < 3 ? lastGroup.named : lastGroup.other).push(value);
    }
  }
  let row = 0,
    best = {
      rank: 4,
      row: 0,
    },
    considerBest = (rank: number, rowIndex: number) => {
      if (rank < best.rank) {
        best = {
          rank: rank,
          row: rowIndex,
        };
      }
    };
  return {
    groups: groups.map((group) => {
      if (group.head !== undefined) {
        considerBest(group.head, row);
      }
      row++;
      let value = [...group.named, ...group.other].map((result) => {
        considerBest(result.rank, row++);
        return {
          entry: result.entry,
          detail:
            result.rank < 3
              ? undefined
              : result.entry.words.find((word) =>
                  terms.some((term) =>
                    optionMatchesQuery(term, word),
                  ),
                ),
        };
      });
      return {
        section: group.section,
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
      (count, row) => count + 1 + row.hits.length,
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
    setActive = (isActive: boolean) => {
      if (isActive === active) {
        return;
      }
      active = isActive;
      onChange(isActive);
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
    extend = (durationMs: number) => {
      holdUntil = Math.max(holdUntil, timers.now() + durationMs);
      setActive(true);
      if (timer === undefined) {
        timer = timers.setTimeout(check, durationMs);
      }
    };
  return {
    bump(durationMs = holdMs) {
      extend(durationMs);
    },
    hold(isHeld: boolean) {
      if (isHeld === held) {
        return;
      }
      held = isHeld;
      if (isHeld) {
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
    searchEntryWords = (...terms) =>
      terms
        .filter((term) => term !== undefined && term !== "")
        .map(String);
    FILE_SEARCH_MATCH_LIMIT = 20;
  };
}
