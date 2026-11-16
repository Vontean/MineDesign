import type { EditorColorToken } from "../contracts/application";
import type {
  ContrastMatcher,
  ContrastMention,
  InferredContrastPair,
} from "../contracts/editor-runtime";
import {
  commonTokenNamePrefix,
  NUMERIC_TOKEN_SUFFIX_PATTERN,
  splitTokenName,
  TOKEN_NAME_SEPARATOR,
} from "../model/component-inference";

/** 颜色角色词表，下标即角色序号：表面、文字、强调、边框、on 前景 */
export const COLOR_ROLE_WORDS: string[][] = [
  [
    "surface",
    "bg",
    "background",
    "page",
    "ground",
    "canvas",
    "paper",
    "base",
  ],
  ["text", "ink", "fg", "foreground", "copy", "heading", "body"],
  [
    "accent",
    "brand",
    "primary",
    "secondary",
    "fill",
    "link",
    "action",
    "interactive",
  ],
  [
    "border",
    "divider",
    "line",
    "rule",
    "stroke",
    "outline",
    "separator",
    "hairline",
  ],
  ["on", "oncolor"],
];
export const COLOR_SURFACE_ROLE = 0;
export const COLOR_TEXT_ROLE = 1;
export const COLOR_BORDER_ROLE = 3;
export const COLOR_ON_ROLE = 4;

export const CONTRAST_EXCLUDED_TOKEN_WORDS = new Set([
  "disabled",
  "inactive",
  "inverse",
  "inverted",
  "reverse",
]);
export const CONTRAST_HIGHLIGHT_WORDS = new Set([
  "highlight",
  "wash",
  "tint",
  "selection",
]);
export const CONTRAST_SURFACE_MODIFIER_WORDS = new Set([
  "default",
  "base",
  "main",
  "plain",
  "subtle",
  "subtler",
  "subtlest",
  "muted",
  "soft",
  "secondary",
  "tertiary",
  "raised",
  "sunken",
  "inset",
  "elevated",
  "lowest",
  "lower",
  "low",
  "high",
  "higher",
  "highest",
  "dim",
  "bright",
  "container",
  "card",
  "panel",
  "popover",
  "sheet",
  "page",
  "canvas",
  "app",
  "body",
  "alt",
  "layer",
  "level",
]);
export const CONTRAST_ON_VERB_WORDS = new Set([
  "based",
  "depend",
  "depends",
  "depending",
  "rely",
  "relies",
  "relying",
  "build",
  "builds",
  "building",
  "built",
  "turn",
  "turns",
  "turning",
  "turned",
  "focus",
  "focuses",
  "focusing",
  "focused",
  "click",
  "clicking",
  "clicked",
]);
export const CONTRAST_NEGATION_WORDS = new Set([
  "never",
  "not",
  "avoid",
  "dont",
  "don’t",
  "don't",
  "except",
]);
export const CONTRAST_TEXT_USAGE_PATTERN =
  /\b(?:text|label|copy|heading|caption|type)s?\b/i;
export const CONTRAST_ON_WORD_PATTERN = /(?<![A-Za-z0-9_-])on(?![A-Za-z0-9_-])/gi;
export const CONTRAST_CLAUSE_BOUNDARY_PATTERN = /[.;:()\u2014]|\s[-\u2013]\s/;
export const CONTRAST_CLAUSE_BOUNDARIES_PATTERN = /[.;:()\u2014]|\s[-\u2013]\s/g;
export const CONTRAST_TOKEN_JOIN_PATTERN =
  /^[\s`,/&]*(?:(?:and|or|either|the|a|an)\b[\s`,/&]*)*$/i;

/** 去掉名称开头的命名空间前缀；前缀整个就是名称时保持原样 */
export function stripTokenNamespace(name: string, namespace: string): string {
  return namespace !== "" &&
    name.startsWith(namespace) &&
    name.length > namespace.length
    ? name.slice(namespace.length)
    : name;
}

/** 转成可放进 RegExp 的字面文本 */
export function escapeContrastRegex(text: string): string {
  return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** 名称第一段所属的颜色角色序号（COLOR_ROLE_WORDS 的下标），不属于任何角色为 -1 */
export function colorTokenRole(name: string, namespace: string): number {
  const firstWord = (
    splitTokenName(stripTokenNamespace(name, namespace))[0] ?? ""
  ).toLowerCase();
  return COLOR_ROLE_WORDS.findIndex((words) => words.includes(firstWord));
}

/** 能作为对比度底色的 token：不是文字、"on" 前景色或边框 */
export function isContrastBackgroundToken(
  name: string,
  namespace: string,
): boolean {
  const role = colorTokenRole(name, namespace);
  return (
    role !== COLOR_TEXT_ROLE &&
    role !== COLOR_ON_ROLE &&
    role !== COLOR_BORDER_ROLE
  );
}

/** 通用的表面色：名称除第一段外只剩层级、容器之类的修饰词 */
export function isGeneralSurfaceToken(
  name: string,
  namespace: string,
): boolean {
  return splitTokenName(stripTokenNamespace(name, namespace))
    .slice(1)
    .every(
      (word: string) =>
        CONTRAST_SURFACE_MODIFIER_WORDS.has(word.toLowerCase()) ||
        colorTokenRole(word, "") === COLOR_SURFACE_ROLE,
    );
}

/** 为每个底色 token 生成在说明文字里查找它的正则；长名称排在前面，优先匹配 */
export function contrastTokenMatchers(
  names: Iterable<string>,
  namespace: string,
): ContrastMatcher[] {
  const keys: { name: string; key: string }[] = [];
  for (const name of names) {
    if (!isContrastBackgroundToken(name, namespace)) {
      continue;
    }
    keys.push({
      name,
      key: name,
    });
    const shortKey = stripTokenNamespace(name, namespace);
    if (shortKey !== name) {
      keys.push({
        name,
        key: shortKey,
      });
    }
  }
  keys.sort((left, right) => right.key.length - left.key.length);
  return keys.map(({ name, key }) => ({
    name,
    re: new RegExp(
      "(^|[^A-Za-z0-9_.-])`?" +
        escapeContrastRegex(key) +
        "`?(?=$|[^A-Za-z0-9_-])",
      "i",
    ),
  }));
}

/**
 * 从使用说明里找出 "on <底色>" 提到的底色，按出现位置排序。
 * "on" 之前的分句里有否定词，或紧跟 depends、click 等动词时，这个 "on" 不算。
 */
export function contrastBackgroundsInUsage(
  usage: string | undefined,
  name: string,
  matchers: ContrastMatcher[],
): string[] {
  if (
    usage === undefined ||
    usage === "" ||
    usage.search(CONTRAST_ON_WORD_PATTERN) < 0
  ) {
    return [];
  }
  const positions = new Map<string, number>();
  for (const onMatch of usage.matchAll(CONTRAST_ON_WORD_PATTERN)) {
    const onIndex = onMatch.index ?? 0;
    const wordsBefore = (
      usage
        .slice(0, onIndex)
        .split(CONTRAST_CLAUSE_BOUNDARIES_PATTERN)
        .pop() ?? ""
    )
      .trimEnd()
      .split(/\s+/)
      .map((word) => word.toLowerCase().replace(/[^a-z'\u2019]/g, ""));
    if (
      wordsBefore.some((word) => CONTRAST_NEGATION_WORDS.has(word)) ||
      CONTRAST_ON_VERB_WORDS.has(wordsBefore[wordsBefore.length - 1] ?? "")
    ) {
      continue;
    }
    // 只看 "on" 之后、本分句结束之前的文字
    let clause = usage.slice(onIndex + onMatch[0].length);
    const clauseEnd = clause.search(CONTRAST_CLAUSE_BOUNDARY_PATTERN);
    if (clauseEnd >= 0) {
      clause = clause.slice(0, clauseEnd);
    }
    const mentions: ContrastMention[] = [];
    for (const matcher of matchers) {
      if (
        matcher.name === name ||
        positions.has(matcher.name) ||
        mentions.some((mention): boolean => mention.name === matcher.name)
      ) {
        continue;
      }
      const found = matcher.re.exec(clause);
      if (found === null) {
        continue;
      }
      const start = found.index + (found[1] ?? "").length;
      // 与已记录的提及重叠时，保留先匹配到的（名称更长的）
      if (
        mentions.some(
          (mention) =>
            start < mention.end && found.index + found[0].length > mention.start,
        )
      ) {
        continue;
      }
      mentions.push({
        name: matcher.name,
        start,
        end: found.index + found[0].length,
      });
    }
    mentions.sort((left, right) => left.start - right.start);
    // 只接受用 and、or、逗号连起来的连续提及
    let previousEnd = -1;
    for (const mention of mentions) {
      if (
        previousEnd >= 0 &&
        !CONTRAST_TOKEN_JOIN_PATTERN.test(
          clause.slice(previousEnd, mention.start),
        )
      ) {
        break;
      }
      positions.set(mention.name, onIndex + mention.start);
      previousEnd = mention.end;
    }
  }
  return [...positions.entries()]
    .sort((left, right) => left[1] - right[1])
    .map(([tokenName]) => tokenName);
}

/**
 * 为文字与 "on" 前景色 token 推断要对比的底色，来源依次是：
 * usage 说明里提到的底色、名称里 on 之后的底色（on）、所有通用表面色（name）。
 */
export function inferColorContrastPairs(
  tokens: Pick<EditorColorToken, "name" | "usage">[],
): Map<string, InferredContrastPair> {
  const names = new Set(tokens.map((token) => token.name));
  const namespace = commonTokenNamePrefix([...names]);
  const matchers = contrastTokenMatchers(names, namespace);
  const surfaceNames = tokens
    .filter(
      (token) =>
        colorTokenRole(token.name, namespace) === COLOR_SURFACE_ROLE &&
        !NUMERIC_TOKEN_SUFFIX_PATTERN.test(
          stripTokenNamespace(token.name, namespace),
        ) &&
        isGeneralSurfaceToken(token.name, namespace),
    )
    .map((token) => token.name);
  const pairs = new Map<string, InferredContrastPair>();
  for (const token of tokens) {
    const role = colorTokenRole(token.name, namespace);
    if (role === COLOR_SURFACE_ROLE || role === COLOR_BORDER_ROLE) {
      continue;
    }
    const words = splitTokenName(
      stripTokenNamespace(token.name, namespace),
    ).map((word: string) => word.toLowerCase());
    // "on" 所在位置：on 角色名在开头，文字角色名里 on 在第二段及以后
    const onIndex =
      role === COLOR_ON_ROLE
        ? 0
        : role === COLOR_TEXT_ROLE
          ? words.indexOf("on", 1)
          : -1;
    if (
      role === COLOR_TEXT_ROLE &&
      words
        .slice(1, onIndex > 0 ? onIndex : undefined)
        .some(
          (word: string) =>
            CONTRAST_HIGHLIGHT_WORDS.has(word) ||
            colorTokenRole(word, "") === COLOR_SURFACE_ROLE,
        )
    ) {
      continue;
    }
    if (words.some((word: string) => CONTRAST_EXCLUDED_TOKEN_WORDS.has(word))) {
      continue;
    }
    const fromUsage =
      role === COLOR_TEXT_ROLE ||
      role === COLOR_ON_ROLE ||
      (token.usage !== undefined && CONTRAST_TEXT_USAGE_PATTERN.test(token.usage))
        ? contrastBackgroundsInUsage(token.usage, token.name, matchers)
        : [];
    if (fromUsage.length > 0) {
      pairs.set(token.name, {
        against: fromUsage,
        source: "usage",
      });
      continue;
    }
    if (onIndex >= 0) {
      const background = splitTokenName(
        stripTokenNamespace(token.name, namespace),
      )
        .slice(onIndex + 1)
        .join(TOKEN_NAME_SEPARATOR);
      const target = [namespace + background, background].find(
        (candidate) =>
          candidate !== "" &&
          candidate !== token.name &&
          names.has(candidate) &&
          isContrastBackgroundToken(candidate, namespace),
      );
      if (target !== undefined) {
        pairs.set(token.name, {
          against: [target],
          source: "on",
        });
      }
      continue;
    }
    if (role === COLOR_TEXT_ROLE) {
      const against = surfaceNames.filter((name): boolean => name !== token.name);
      if (against.length > 0) {
        pairs.set(token.name, {
          against,
          source: "name",
        });
      }
    }
  }
  return pairs;
}
