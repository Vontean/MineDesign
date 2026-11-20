/** Restored application module; prepare first, initialize in original order. */
import type * as Core from "../contracts/model-core";
import type * as Model from "../contracts";
import { parsedDesignSystem } from "./derive-system";
import { setDesignSystemFile, setDesignSystemReadme } from "./file-commands";
import { DESIGN_SYSTEM_PATHS } from "./file-policy";
import { allExtraTokens, colorAliasTarget, colorValueForThemeModelTokens, conflictingTokenNames, detectColorAliasCycle, FONT_STACK_PATTERN, MAX_FONT_FAMILIES, MAX_TOKEN_NOTE_LENGTH, MAX_TOKEN_USAGE_LENGTH, normalizeBoxShadow, normalizeColorOrAlias, normalizeScalarTokenValue, normalizeTypographyProperty, resolveColorTokenValue, serializeTokens, TOKEN_NAME_PATTERN, tokenNamesForFamily } from "./tokens";

var defaultFontFamilyStack: (name: string) => string;
var autoCreatedFontFamilyKeys: Set<string>;
function updateTokens(
  content: Model.DesignSystemContent,
  mutate: (tokens: Model.NormalizedTokens) => boolean,
) {
  let tokens = structuredClone(
    parsedDesignSystem(content).tokens,
  );
  if (!mutate(tokens)) {
    return content;
  }
  return setDesignSystemFile(
    content,
    DESIGN_SYSTEM_PATHS.tokens,
    serializeTokens(tokens),
  );
}
function setColorTokenValue(
  content: Model.DesignSystemContent,
  name: string,
  themeId: string,
  colorValue: unknown,
) {
  let normalized = normalizeColorOrAlias(colorValue);
  if (normalized === undefined) {
    return content;
  }
  return updateTokens(content, (tokens): boolean => {
    if (
      !tokens.color.themes.some((theme): boolean => theme.id === themeId)
    ) {
      return false;
    }
    let aliasTarget = colorAliasTarget(normalized);
    if (
      aliasTarget !== undefined &&
      (aliasTarget === name ||
        !tokens.color.tokens.some(
          (token): boolean => token.name === aliasTarget,
        ) ||
        detectColorAliasCycle(
          tokens,
          name,
          themeId,
          normalized,
        ) !== undefined)
    ) {
      return false;
    }
    for (let token of tokens.color.tokens) {
      if (token.name === name) {
        if (token.value[themeId] === normalized) {
          return false;
        }
        token.value[themeId] = normalized;
        return true;
      }
    }
    return false;
  });
}
function clearColorThemeOverride(
  content: Model.DesignSystemContent,
  name: string,
  themeId: string,
) {
  return updateTokens(content, (tokens): boolean => {
    if (
      tokens.color.themes.length === 0 ||
      tokens.color.themes[0]?.id === themeId
    ) {
      return false;
    }
    if (
      !tokens.color.themes.some((theme): boolean => theme.id === themeId)
    ) {
      return false;
    }
    for (let value of tokens.color.tokens) {
      if (value.name === name) {
        if (
          !Object.hasOwn(value.value, themeId) ||
          detectColorAliasCycle(tokens, name, themeId, "") !==
            undefined
        ) {
          return false;
        }
        delete value.value[themeId];
        return true;
      }
    }
    return false;
  });
}
function setColorTokenUsage(
  content: Model.DesignSystemContent,
  name: string,
  usage: string,
) {
  let clampedUsage = Array.from(usage)
    .slice(0, MAX_TOKEN_USAGE_LENGTH)
    .join("");
  return updateTokens(content, (tokens): boolean => {
    for (let token of tokens.color.tokens) {
      if (token.name === name) {
        if (token.usage === clampedUsage) {
          return false;
        }
        token.usage = clampedUsage;
        return true;
      }
    }
    return false;
  });
}
function editableTokensForFamily(
  tokens: Model.NormalizedTokens,
  family: Core.ValueTokenKind,
) {
  if (family === "extra") {
    return allExtraTokens(tokens);
  } else {
    return tokens[family].tokens;
  }
}
function scalarTokensForFamily(
  tokens: Model.NormalizedTokens,
  family: Core.ScalarKind,
) {
  if (family === "extra") {
    return allExtraTokens(tokens);
  } else {
    return tokens[family].tokens;
  }
}
function setTokenUsage(
  content: Model.DesignSystemContent,
  family: Core.ValueTokenKind,
  name: string,
  usage: string,
) {
  let clampedUsage = Array.from(usage)
    .slice(0, MAX_TOKEN_USAGE_LENGTH)
    .join("");
  return updateTokens(content, (tokens): boolean => {
    let token = editableTokensForFamily(tokens, family).find(
      (entry): boolean => entry.name === name,
    );
    if (token === undefined || token.usage === clampedUsage) {
      return false;
    }
    token.usage = clampedUsage;
    return true;
  });
}
function setShadowTokenValue(
  content: Model.DesignSystemContent,
  name: string,
  themeId: string,
  shadowValue: unknown,
) {
  let normalized = normalizeBoxShadow(shadowValue);
  if (normalized === undefined) {
    return content;
  }
  return updateTokens(content, (tokens): boolean => {
    if (
      !tokens.color.themes.some((theme): boolean => theme.id === themeId)
    ) {
      return false;
    }
    let token = tokens.shadow.tokens.find(
      (entry): boolean => entry.name === name,
    );
    if (token === undefined || token.value[themeId] === normalized) {
      return false;
    }
    token.value[themeId] = normalized;
    return true;
  });
}
function setTypographyStyleUsage(
  content: Model.DesignSystemContent,
  name: string,
  usage: string,
) {
  let clampedUsage = Array.from(usage)
    .slice(0, MAX_TOKEN_USAGE_LENGTH)
    .join("");
  return updateTokens(content, (tokens): boolean => {
    for (let group of tokens.type.groups) {
      for (let style of group.styles) {
        if (style.name === name) {
          if (style.usage === clampedUsage) {
            return false;
          }
          style.usage = clampedUsage;
          return true;
        }
      }
    }
    return false;
  });
}
function setTokenFamilyNote(
  content: Model.DesignSystemContent,
  family: Core.ScalarKind,
  note: string,
  extraFamily?: string,
) {
  let clampedNote = Array.from(note.replace(/\s+/g, " ").trim())
    .slice(0, MAX_TOKEN_NOTE_LENGTH)
    .join("");
  return updateTokens(content, (tokens): boolean => {
    let value =
      family === "extra"
        ? tokens.extra.find((familyEntry): boolean => familyEntry.key === extraFamily)
        : tokens[family];
    if (value === undefined || value.note === clampedNote) {
      return false;
    }
    value.note = clampedNote;
    return true;
  });
}
function setScalarTokenValue(
  content: Model.DesignSystemContent,
  family: Core.ScalarKind,
  name: string,
  scalarValue: unknown,
) {
  let normalized = normalizeScalarTokenValue(family, scalarValue);
  if (normalized === undefined) {
    return content;
  }
  return updateTokens(content, (tokens): boolean => {
    let token = scalarTokensForFamily(tokens, family).find(
      (entry): boolean => entry.name === name,
    );
    if (token === undefined || token.value === normalized) {
      return false;
    }
    token.value = normalized;
    return true;
  });
}
function findFontFamilyKey(
  families: Record<string, string>,
  fontName: string,
) {
  let normalizedName = fontName.trim().toLowerCase();
  if (normalizedName === "") {
    return;
  }
  for (let [familyKey, fontStack] of Object.entries(families)) {
    let firstFamilyMatch = /^\s*(?:"([^"]{1,80})"|'([^']{1,80})'|([^,'"]{1,80}))/.exec(
      fontStack,
    );
    if (
      (firstFamilyMatch?.[1] ?? firstFamilyMatch?.[2] ?? firstFamilyMatch?.[3] ?? "")
        .trim()
        .toLowerCase() === normalizedName ||
      familyKey === normalizedName
    ) {
      return familyKey;
    }
  }
  return;
}
function pruneUnusedFontFamily(
  tokens: Model.NormalizedTokens,
  key: string,
): void {
  if (key === "" || !autoCreatedFontFamilyKeys.has(key)) {
    return;
  }
  let stack = tokens.type.families[key],
    fontName =
      stack === undefined
        ? null
        : (/^'([^']+)', sans-serif$/.exec(stack)?.[1] ?? null);
  if (fontName === null || stack !== defaultFontFamilyStack(fontName)) {
    return;
  }
  if (
    tokens.type.groups.some(
      (group) =>
        group.family === key ||
        group.styles.some((style): boolean => style.family === key),
    ) ||
    tokens.type.fonts.some(
      (face) =>
        face.family.trim().toLowerCase() === fontName.toLowerCase() ||
        findFontFamilyKey(tokens.type.families, face.family) === key,
    )
  ) {
    return;
  }
  delete tokens.type.families[key];
}
function pruneUnusedFontFamilies(tokens: Model.NormalizedTokens): void {
  for (let value of Object.keys(tokens.type.families)) {
    pruneUnusedFontFamily(tokens, value);
  }
}
function validateNewFontFamily(
  fontName: string,
  families: Record<string, string>,
): string | null {
  let normalized = fontName.replace(/\s+/g, " ").trim();
  if (normalized === "") {
    return "A font name is needed.";
  }
  if (
    /['",]/.test(normalized) ||
    !FONT_STACK_PATTERN.test(defaultFontFamilyStack(normalized)) ||
    normalized.length > 80
  ) {
    return "One font name, without quotes, commas or CSS punctuation.";
  }
  if (
    findFontFamilyKey(families, normalized) === undefined &&
    Object.keys(families).length >= MAX_FONT_FAMILIES
  ) {
    return (
      "The system already has " +
      String(MAX_FONT_FAMILIES) +
      " font families — pick one of them."
    );
  }
  return null;
}
function setTypographyFontFamily(
  content: Model.DesignSystemContent,
  styleName: string,
  fontName: string,
) {
  let normalized = fontName.replace(/\s+/g, " ").trim();
  return updateTokens(content, (tokens): boolean => {
    if (validateNewFontFamily(normalized, tokens.type.families) !== null) {
      return false;
    }
    let familyKey = findFontFamilyKey(tokens.type.families, normalized);
    if (familyKey === undefined) {
      let fontStack = defaultFontFamilyStack(normalized),
        baseFamilyKey =
          (
            normalized
              .toLowerCase()
              .replace(/[^a-z0-9]+/g, "-")
              .replace(/^-+|-+$/g, "") || "font"
          )
            .slice(0, 48)
            .replace(/-+$/, "") || "font";
      familyKey = baseFamilyKey;
      for (
        let count: number = 2;
        Object.hasOwn(tokens.type.families, familyKey);
        count++
      ) {
        familyKey = baseFamilyKey + "-" + String(count);
      }
      if (!TOKEN_NAME_PATTERN.test(familyKey)) {
        return false;
      }
      tokens.type.families[familyKey] = fontStack;
      autoCreatedFontFamilyKeys.add(familyKey);
    }
    for (let group of tokens.type.groups) {
      for (let style of group.styles) {
        if (style.name === styleName) {
          if (style.family === familyKey) {
            return false;
          }
          let family = style.family;
          style.family = familyKey;
          if (family !== familyKey) {
            pruneUnusedFontFamily(tokens, family);
          }
          return true;
        }
      }
    }
    return false;
  });
}
function setTypographyProperty<K extends Core.TypographyProperty>(
  content: Model.DesignSystemContent,
  styleName: string,
  property: K,
  propertyValue: unknown,
) {
  return updateTokens(content, (tokens): boolean => {
    let normalizedProperty = normalizeTypographyProperty(
      property,
      propertyValue,
      tokens.type.families,
    );
    if (normalizedProperty === undefined) {
      return false;
    }
    for (let group of tokens.type.groups) {
      for (let style of group.styles) {
        if (style.name === styleName) {
          if (style[property] === normalizedProperty) {
            return false;
          }
          let family = style.family;
          style[property] = normalizedProperty;
          if (property === "family") {
            pruneUnusedFontFamily(tokens, family);
          }
          return true;
        }
      }
    }
    return false;
  });
}
function typographyStyleByName(tokens: Model.NormalizedTokens, name: string) {
  for (let value of tokens.type.groups) {
    for (let style of value.styles) {
      if (style.name === name) {
        return style;
      }
    }
  }
  return;
}
function normalizeTokenName(name: string) {
  return name.trim().replace(/^--/, "");
}
function renameReadmeTokenCodeSpans(
  readme: string,
  oldName: string,
  newName: string,
) {
  return readme.split("`" + oldName + "`").join("`" + newName + "`");
}
function renameToken(
  content: Model.DesignSystemContent,
  family: Core.TokenKind,
  oldName: string,
  newName: string,
) {
  let normalizedName = normalizeTokenName(newName);
  if (
    !TOKEN_NAME_PATTERN.test(normalizedName) ||
    normalizedName === oldName
  ) {
    return content;
  }
  let tokens = parsedDesignSystem(content).tokens;
  if (
    !tokenNamesForFamily(tokens, family).includes(oldName) ||
    conflictingTokenNames(tokens, family).includes(
      normalizedName,
    )
  ) {
    return content;
  }
  let renamed = renameTokenInTokens(content, family, oldName, normalizedName);
  if (renamed === content) {
    return content;
  }
  let readme = renamed.files[DESIGN_SYSTEM_PATHS.readme];
  if (readme === undefined) {
    return renamed;
  } else {
    return setDesignSystemReadme(
      renamed,
      renameReadmeTokenCodeSpans(readme, oldName, normalizedName),
    );
  }
}
function renameColorTokensAtomically(
  content: Model.DesignSystemContent,
  renames: [string, string][],
) {
  let working = content;
  for (let [oldName, newName] of renames) {
    if (oldName === newName) {
      continue;
    }
    let renamedContent = renameToken(working, "color", oldName, newName);
    if (renamedContent === working) {
      return content;
    }
    working = renamedContent;
  }
  return working;
}
function renameTokenInTokens(
  content: Model.DesignSystemContent,
  family: Core.TokenKind,
  oldName: string,
  newName: string,
) {
  return updateTokens(content, (tokens): boolean => {
    if (conflictingTokenNames(tokens, family).includes(newName)) {
      return false;
    }
    if (family === "color") {
      let renamedToken = tokens.color.tokens.find(
        (token): boolean => token.name === oldName,
      );
      if (renamedToken === undefined) {
        return false;
      }
      renamedToken.name = newName;
      for (let token of tokens.color.tokens) {
        for (let themeId of Object.keys(token.value)) {
          if (token.value[themeId] === "{" + oldName + "}") {
            token.value[themeId] = "{" + newName + "}";
          }
        }
      }
      return true;
    }
    let value =
      family === "type"
        ? typographyStyleByName(tokens, oldName)
        : editableTokensForFamily(tokens, family).find(
            (token): boolean => token.name === oldName,
          );
    if (value === undefined) {
      return false;
    }
    value.name = newName;
    return true;
  });
}
function resolveAliasesBeforeTokenDeletion(
  tokens: Model.NormalizedTokens,
  deletedNames: ReadonlySet<string>,
): void {
  for (let value of tokens.color.tokens) {
    if (deletedNames.has(value.name)) {
      continue;
    }
    let state: Record<string, string | undefined> = {},
      flag: boolean = false;
    for (let theme of tokens.color.themes) {
      let aliasTarget = colorAliasTarget(
        colorValueForThemeModelTokens(value, theme.id, tokens),
      );
      if (aliasTarget !== undefined && deletedNames.has(aliasTarget)) {
        flag = true;
        state[theme.id] = resolveColorTokenValue(
          value,
          theme.id,
          tokens,
        );
      }
    }
    if (!flag) {
      continue;
    }
    for (let [themeId, resolvedValue] of Object.entries(state)) {
      if (resolvedValue !== undefined) {
        value.value[themeId] = resolvedValue;
      } else {
        delete value.value[themeId];
      }
    }
  }
}
function deleteColorTokens(
  content: Model.DesignSystemContent,
  names: string[],
) {
  let deletedNames = new Set(
    names.filter((name) =>
      tokenNamesForFamily(
        parsedDesignSystem(content).tokens,
        "color",
      ).includes(name),
    ),
  );
  if (deletedNames.size === 0) {
    return content;
  }
  return updateTokens(content, (tokens): boolean => {
    resolveAliasesBeforeTokenDeletion(tokens, deletedNames);
    tokens.color.tokens = tokens.color.tokens.filter(
      (token): boolean => !deletedNames.has(token.name),
    );
    return true;
  });
}
function deleteToken(
  content: Model.DesignSystemContent,
  family: Core.TokenKind,
  name: string,
) {
  let tokens = parsedDesignSystem(content).tokens;
  if (!tokenNamesForFamily(tokens, family).includes(name)) {
    return content;
  }
  return updateTokens(content, (editableTokens): boolean => {
    if (family === "color") {
      resolveAliasesBeforeTokenDeletion(editableTokens, new Set([name]));
      let length = editableTokens.color.tokens.length;
      editableTokens.color.tokens = editableTokens.color.tokens.filter(
        (token): boolean => token.name !== name,
      );
      return editableTokens.color.tokens.length !== length;
    }
    if (family === "type") {
      for (let group of editableTokens.type.groups) {
        let styleIndex = group.styles.findIndex(
          (style): boolean => style.name === name,
        );
        if (styleIndex >= 0) {
          group.styles.splice(styleIndex, 1);
          if (group.styles.length === 0) {
            editableTokens.type.groups = editableTokens.type.groups.filter(
              (otherGroup): boolean => otherGroup !== group,
            );
          }
          pruneUnusedFontFamilies(editableTokens);
          return true;
        }
      }
      return false;
    }
    if (family === "extra") {
      for (let extraFamily of editableTokens.extra) {
        let extraTokenIndex = extraFamily.tokens.findIndex(
          (token): boolean => token.name === name,
        );
        if (extraTokenIndex < 0) {
          continue;
        }
        extraFamily.tokens.splice(extraTokenIndex, 1);
        if (extraFamily.tokens.length === 0) {
          editableTokens.extra = editableTokens.extra.filter(
            (otherFamily): boolean => otherFamily !== extraFamily,
          );
        }
        return true;
      }
      return false;
    }
    let value = editableTokensForFamily(editableTokens, family),
      tokenIndex = value.findIndex((token): boolean => token.name === name);
    if (tokenIndex < 0) {
      return false;
    }
    value.splice(tokenIndex, 1);
    return true;
  });
}
export {
  autoCreatedFontFamilyKeys,
  clearColorThemeOverride,
  defaultFontFamilyStack,
  deleteColorTokens,
  deleteToken,
  editableTokensForFamily,
  findFontFamilyKey,
  normalizeTokenName,
  pruneUnusedFontFamilies,
  pruneUnusedFontFamily,
  renameColorTokensAtomically,
  renameReadmeTokenCodeSpans,
  renameToken,
  renameTokenInTokens,
  resolveAliasesBeforeTokenDeletion,
  scalarTokensForFamily,
  setColorTokenUsage,
  setColorTokenValue,
  setScalarTokenValue,
  setShadowTokenValue,
  setTokenFamilyNote,
  setTokenUsage,
  setTypographyFontFamily,
  setTypographyProperty,
  setTypographyStyleUsage,
  typographyStyleByName,
  updateTokens,
  validateNewFontFamily,
};
export function installModelTokenCommands(): () => void {
  return () => {
    defaultFontFamilyStack = (familyName): string => "'" + familyName + "', sans-serif";
    autoCreatedFontFamilyKeys = new Set();
  };
}
