import type * as Model from "../contracts";
import type * as Core from "../contracts/model-core";
import type {
  NormalizedTokens,
  ParseReport,
  TokenCssOptions,
} from "../contracts";
import {
  blobRelativeUrlModelFilePolicy,
  DESIGN_SYSTEM_PATHS,
  encodeRelativeUrlPath,
  isValidDesignSystemPath,
  storagePointerForFile,
} from "./file-policy";
import { parseManifest } from "./file-table";

// 数量与长度上限、各类值的格式
export const TOKEN_NAME_PATTERN = /^[A-Za-z0-9][A-Za-z0-9_.-]{0,63}$/;
export const HEX_COLOR_PATTERN = /^#(?:[0-9a-f]{3,4}|[0-9a-f]{6}|[0-9a-f]{8})$/;
export const COLOR_ALIAS_PATTERN = /^\{([A-Za-z0-9][A-Za-z0-9_.-]{0,63})\}$/;
export const EXTRA_TOKEN_FAMILY_PATTERN =
  /^(?!(?:__proto__|constructor|prototype)$)[A-Za-z][A-Za-z0-9_-]{0,31}$/;
export const BUILTIN_TOKEN_DOCUMENT_KEYS: string[] = [
  "version",
  "color",
  "type",
  "spacing",
  "radius",
  "shadow",
];
export const MAX_COLOR_ALIAS_DEPTH = 16;
export const COLOR_FUNCTION_PATTERN =
  /^(?:rgb|rgba|hsl|hsla|oklch|oklab|lab|lch|color)\([0-9a-z.,%/ \-]{1,60}\)$/;
export const CSS_LENGTH_PATTERN = /^-?\d{1,4}(?:\.\d{1,6})?(?:px|rem|em|%)$|^0$/;
export const FONT_WEIGHT_PATTERN = /^(?:[1-9]\d{0,2}|1000)(?: (?:[1-9]\d{0,2}|1000))?$/;
export const FONT_STACK_PATTERN = /^[^;{}<>()\\\r\n\f]{1,200}$/;
export const MAX_COLOR_THEMES = 8;
export const MAX_COLOR_TOKENS = 600;
export const MAX_PARSED_FONT_FACES = 4096;
export const MAX_FONT_FAMILIES = 12;
export const MAX_TYPOGRAPHY_GROUPS = 12;
export const MAX_TYPOGRAPHY_STYLES = 80;
export const MAX_TOKENS_PER_FAMILY = 60;
export const MAX_EXTRA_TOKEN_FAMILIES = 12;
export const MAX_TOKEN_LABEL_LENGTH = 120;
export const MAX_TOKEN_NOTE_LENGTH = 400;
export const MAX_TOKEN_USAGE_LENGTH = 1000;
export const MAX_TYPE_SAMPLE_LENGTH = 200;
export const BOX_SHADOW_PATTERN = /^[a-z0-9 #%(),./+-]{1,400}$/;
export const MOTION_DURATION_PATTERN = /^(?:\d{1,6}(?:\.\d{1,3})?|\.\d{1,3})m?s$/;
export const MOTION_EASING_PATTERN =
  /^(?:linear|ease|ease-in|ease-out|ease-in-out|step-start|step-end|cubic-bezier\([-\d., ]{1,60}\)|steps\([a-z0-9, -]{1,40}\))$/;
export const EXTRA_TOKEN_VALUE_PATTERN = /^[A-Za-z0-9 #%(),./+_-]{1,200}$/;
export const UNPREFIXED_HEX_COLOR_PATTERN =
  /^(?:[0-9a-f]{3,4}|[0-9a-f]{6}|[0-9a-f]{8})$/;
export const CSS_VARIABLE_TOKEN_FAMILIES: Core.ValueTokenKind[] = [
  "color",
  "spacing",
  "radius",
  "shadow",
  "extra",
];
export const FONT_FACE_FORMAT_NAMES: Record<string, string> = {
  woff2: "woff2",
  woff: "woff",
  ttf: "truetype",
  otf: "opentype",
};

export function isTokenObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
export const normalizeThemeColorValue: (value: unknown) => string | undefined =
  normalizeColorOrAlias;
/** 颜色 token 名称索引的缓存，以 token 数组为键 */
export const colorTokenIndexCache = new WeakMap<
  Model.ColorToken[],
  Map<string, Model.ColorToken>
>();
/** 最近一次生成 tokens.css 的输入与结果 */
let cachedGeneratedTokensCss: {
  tokens: string;
  name: string;
  fonts: string;
  css: string | null;
} | null = null;

export function defineOwnEnumerableProperty(
  target: object,
  key: PropertyKey,
  value: unknown,
): void {
  Object.defineProperty(target, key, {
    value: value,
    enumerable: true,
    writable: true,
    configurable: true,
  });
}
export function isSafeFontStack(stack: string): boolean {
  if (!FONT_STACK_PATTERN.test(stack)) {
    return false;
  }
  if (stack.includes("/*") || stack.includes("*/")) {
    return false;
  }
  let quote: string | null = null;
  for (const char of stack) {
    if (quote === null) {
      if (char === '"' || char === "'") {
        quote = char;
      }
    } else if (char === quote) {
      quote = null;
    }
  }
  return quote === null;
}
export function isColorLiteral(value: unknown): boolean {
  return (
    typeof value === "string" &&
    (HEX_COLOR_PATTERN.test(value) ||
      (COLOR_FUNCTION_PATTERN.test(value) &&
        !/url|var|expression/.test(value)))
  );
}
export function isCssLength(value: unknown): boolean {
  return typeof value === "string" && CSS_LENGTH_PATTERN.test(value);
}
export function isSafeBoxShadow(value: unknown): boolean {
  if (
    typeof value !== "string" ||
    !BOX_SHADOW_PATTERN.test(value) ||
    /(?:url|var|expression|image|image-set|src)\s*\(/.test(value) ||
    value.trim() === ""
  ) {
    return false;
  }
  let depth: number = 0;
  for (const char of value) {
    if (char === "(") {
      depth++;
    } else if (char === ")" && --depth < 0) {
      return false;
    }
  }
  return depth === 0;
}
export function normalizeBoxShadow(value: unknown): string | undefined {
  if (typeof value !== "string") {
    return;
  }
  let normalized = value.trim().toLowerCase().replace(/\s+/g, " ");
  if (isSafeBoxShadow(normalized)) {
    return normalized;
  } else {
    return undefined;
  }
}
export function motionValueKind(value: string): string | undefined {
  if (MOTION_DURATION_PATTERN.test(value)) {
    return "duration";
  } else {
    if (MOTION_EASING_PATTERN.test(value)) {
      return "easing";
    } else {
      return undefined;
    }
  }
}
export function normalizeMotionValue(value: unknown): string | undefined {
  if (
    typeof value === "number" &&
    Number.isFinite(value) &&
    value >= 0 &&
    value < 1e6
  ) {
    return String(Math.round(value)) + "ms";
  }
  if (typeof value !== "string") {
    return;
  }
  let normalized = value.trim().toLowerCase().replace(/\s+/g, " ");
  if (normalized.startsWith(".")) {
    normalized = "0" + normalized;
  }
  if (motionValueKind(normalized) !== undefined) {
    return normalized;
  } else {
    return undefined;
  }
}
export function normalizeExtraTokenValue(value: unknown): string | undefined {
  if (
    typeof value === "number" &&
    Number.isFinite(value) &&
    Math.abs(value) < 1e6
  ) {
    return String(value);
  }
  if (typeof value !== "string") {
    return;
  }
  let normalized = value.trim().replace(/\s+/g, " ");
  if (
    !EXTRA_TOKEN_VALUE_PATTERN.test(normalized) ||
    /(?:url|var|expression|image|image-set|src)\s*\(/i.test(normalized)
  ) {
    return;
  }
  let depth: number = 0;
  for (const char of normalized) {
    if (char === "(") {
      depth++;
    } else if (char === ")" && --depth < 0) {
      return;
    }
  }
  if (depth === 0) {
    return normalized;
  } else {
    return undefined;
  }
}
export function normalizeScalarTokenValue(family: Core.ScalarKind, value: unknown) {
  if (family === "extra") {
    return normalizeExtraTokenValue(value);
  } else {
    return normalizeCssLength(value, family === "radius");
  }
}
export function colorAliasTarget(value: string | undefined) {
  if (value === undefined) {
    return undefined;
  } else {
    return COLOR_ALIAS_PATTERN.exec(value)?.[1];
  }
}
export function isColorOrAlias(value: unknown) {
  return (
    isColorLiteral(value) ||
    (typeof value === "string" && COLOR_ALIAS_PATTERN.test(value))
  );
}
export function truncateTokenText(value: unknown, maxLength: number) {
  if (typeof value !== "string") {
    return "";
  }
  let characters = Array.from(value);
  if (characters.length > maxLength) {
    return characters.slice(0, maxLength).join("");
  } else {
    return value;
  }
}
export function asTokenArray(value: unknown): unknown[] {
  if (Array.isArray(value)) {
    return value;
  } else {
    return [];
  }
}
export function normalizeColorOrAlias(value: unknown): string | undefined {
  if (typeof value !== "string") {
    return;
  }
  let literal = value.trim().toLowerCase();
  if (isColorLiteral(literal)) {
    return literal;
  }
  let alias = value.trim().replace(/^\{--/, "{");
  if (COLOR_ALIAS_PATTERN.test(alias)) {
    return alias;
  } else {
    return undefined;
  }
}
export function normalizeColorEditorInput(input: string) {
  let trimmed = input.trim();
  if (colorAliasTarget(trimmed) !== undefined) {
    return trimmed;
  }
  let lowered = trimmed.toLowerCase();
  if (UNPREFIXED_HEX_COLOR_PATTERN.test(lowered)) {
    return "#" + lowered;
  } else {
    return lowered;
  }
}
export function normalizeCssLength(
  value: unknown,
  allowFullRadius: boolean,
): string | undefined {
  if (typeof value === "number" && Number.isFinite(value)) {
    if (Math.abs(value) >= 1e4) {
      return;
    }
    if (value === 0) {
      return "0";
    } else {
      return String(Math.round(value * 1000) / 1000) + "px";
    }
  }
  if (typeof value !== "string") {
    return;
  }
  let normalized = value.trim().toLowerCase();
  if (allowFullRadius && normalized === "full") {
    return "9999px";
  }
  if (isCssLength(normalized)) {
    return normalized;
  } else {
    return undefined;
  }
}
export function normalizeFontWeight(value: unknown): string | undefined {
  if (
    typeof value === "number" &&
    Number.isInteger(value) &&
    value >= 1 &&
    value <= 1000
  ) {
    return String(value);
  }
  if (typeof value !== "string") {
    return;
  }
  let normalized = value.trim().replace(/\s+/g, " ");
  if (normalized === "normal") {
    return "400";
  }
  if (normalized === "bold") {
    return "700";
  }
  if (FONT_WEIGHT_PATTERN.test(normalized)) {
    return normalized;
  } else {
    return undefined;
  }
}
export function normalizeLineHeight(value: unknown): string | undefined {
  if (
    typeof value === "number" &&
    Number.isFinite(value) &&
    value > 0 &&
    value < 10
  ) {
    return String(Math.round(value * 1000) / 1000);
  }
  if (typeof value === "string" && /^\d(?:\.\d{1,6})?$/.test(value.trim())) {
    if (Number(value) > 0) {
      return value.trim();
    } else {
      return undefined;
    }
  }
  return normalizeCssLength(value, false);
}
export function normalizeTypographyProperty<K extends Core.TypographyProperty>(
  property: K,
  value: unknown,
  families: Record<string, string>,
): Model.TypographyStyle[K] | undefined;
export function normalizeTypographyProperty(
  property: string,
  value: unknown,
  families: Record<string, string>,
) {
  let trimmed = typeof value === "string" ? value.trim() : value;
  switch (property) {
    case "fontSize":
      return normalizeCssLength(trimmed, false);
    case "lineHeight":
      return normalizeLineHeight(trimmed);
    case "fontWeight":
      return normalizeFontWeight(trimmed);
    case "letterSpacing": {
      const spacing = trimmed === "" ? "0" : normalizeCssLength(trimmed, false);
      if (typeof spacing === "string" && spacing.endsWith("%")) {
        return undefined;
      } else {
        return spacing;
      }
    }
    case "fontStyle":
      if (trimmed === "italic" || trimmed === "normal") {
        return trimmed;
      } else {
        return undefined;
      }
    case "opticalSize": {
      if (
        trimmed === null ||
        trimmed === "" ||
        trimmed === "auto" ||
        trimmed === "none"
      ) {
        return null;
      }
      const size =
        typeof trimmed === "number"
          ? trimmed
          : typeof trimmed === "string" &&
              /^\d{1,4}(?:\.\d{1,3})?$/.test(trimmed)
            ? Number(trimmed)
            : NaN;
      if (Number.isFinite(size) && size >= 1 && size <= 1000) {
        return size;
      } else {
        return undefined;
      }
    }
    case "family": {
      const family = typeof trimmed === "string" ? trimmed.toLowerCase() : "";
      if (family === "" || Object.hasOwn(families, family)) {
        return family;
      } else {
        return undefined;
      }
    }
  }
}
/**
 * 把 tokens.json（文本或已解析的对象）读成规整的 token 集合。
 * 不合法的项被丢弃并记入 report.dropped，超限或不识别的内容记入 warnings 与 notes。
 */
export function parseTokens(
  input: unknown,
  report: ParseReport = {
    dropped: [],
    warnings: [],
  },
): NormalizedTokens {
  let source: Record<string, unknown> = {};
  if (typeof input === "string") {
    try {
      const parsed: unknown = JSON.parse(input);
      if (isTokenObject(parsed)) {
        source = parsed;
      } else {
        report.dropped.push("tokens.json: not a JSON object");
      }
    } catch (error) {
      if (input.trim() !== "") {
        report.dropped.push(
          "tokens.json: " + String((error as Error).message).slice(0, 120),
        );
      }
    }
  } else if (isTokenObject(input)) {
    source = input;
  }
  // 颜色主题
  const sourceColor = isTokenObject(source.color) ? source.color : {};
  const themes: Model.ColorTheme[] = [];
  const themeIds = new Set<string>();
  for (const sourceTheme of asTokenArray(sourceColor.themes)) {
    if (themes.length >= MAX_COLOR_THEMES) {
      break;
    }
    const themeId =
      isTokenObject(sourceTheme) && typeof sourceTheme.id === "string"
        ? sourceTheme.id.trim().toLowerCase()
        : typeof sourceTheme === "string"
          ? sourceTheme.trim().toLowerCase()
          : "";
    if (
      !TOKEN_NAME_PATTERN.test(themeId) ||
      themeIds.has(themeId) ||
      themeId === "constructor" ||
      themeId === "prototype" ||
      Object.hasOwn(Object.prototype, themeId)
    ) {
      report.dropped.push(
        "theme " + JSON.stringify(themeId) + ": bad or duplicate id",
      );
      continue;
    }
    themeIds.add(themeId);
    themes.push({
      id: themeId,
      name:
        truncateTokenText(
          isTokenObject(sourceTheme) ? sourceTheme.name : "",
          MAX_TOKEN_LABEL_LENGTH,
        ) || themeId,
    });
  }
  if (themes.length === 0) {
    themes.push({
      id: "light",
      name: "Light",
    });
  }
  // 颜色 token；没有基础主题的值时，用第一个有效的主题值补上
  const baseThemeId = themes[0].id;
  const colorNames = new Set<string>();
  const colorTokens: Model.ColorToken[] = [];
  const sourceColorTokens = Array.isArray(sourceColor.tokens)
    ? asTokenArray(sourceColor.tokens)
    : asTokenArray(sourceColor.groups).flatMap((group) =>
        isTokenObject(group) ? asTokenArray(group.tokens) : [],
      );
  if (
    Array.isArray(sourceColor.tokens) &&
    Array.isArray(sourceColor.groups)
  ) {
    report.warnings.push(
      'tokens.json color has both "tokens" and a legacy "groups" — only "tokens" is read',
    );
  }
  for (const sourceToken of sourceColorTokens) {
    if (colorTokens.length >= MAX_COLOR_TOKENS) {
      report.warnings.push(
        "color tokens capped at " +
          String(MAX_COLOR_TOKENS) +
          " — the rest are ignored",
      );
      break;
    }
    if (!isTokenObject(sourceToken)) {
      continue;
    }
    const name =
      typeof sourceToken.name === "string"
        ? sourceToken.name.trim().replace(/^--/, "")
        : "";
    if (!TOKEN_NAME_PATTERN.test(name) || colorNames.has(name)) {
      report.dropped.push(
        "color " + JSON.stringify(name) + ": bad or duplicate name",
      );
      continue;
    }
    const themeValues: Record<string, string> = {};
    if (isTokenObject(sourceToken.value)) {
      for (const theme of themes) {
        const themeValue = Object.hasOwn(sourceToken.value, theme.id)
          ? normalizeThemeColorValue(sourceToken.value[theme.id])
          : undefined;
        if (themeValue !== undefined) {
          themeValues[theme.id] = themeValue;
        } else if (Object.hasOwn(sourceToken.value, theme.id)) {
          report.dropped.push(
            "color " + name + " [" + theme.id + "]: not a color value",
          );
        }
      }
    } else {
      const baseValue = normalizeThemeColorValue(sourceToken.value);
      if (baseValue !== undefined) {
        themeValues[baseThemeId] = baseValue;
      }
    }
    if (!Object.hasOwn(themeValues, baseThemeId)) {
      const fallbackValue = themes
        .map((theme) =>
          Object.hasOwn(themeValues, theme.id)
            ? themeValues[theme.id]
            : undefined,
        )
        .find((themeValue): boolean => themeValue !== undefined);
      if (fallbackValue === undefined) {
        report.dropped.push("color " + name + ": no valid value");
        continue;
      }
      themeValues[baseThemeId] = fallbackValue;
    }
    colorNames.add(name);
    colorTokens.push({
      name,
      value: themeValues,
      usage: truncateTokenText(sourceToken.usage, MAX_TOKEN_USAGE_LENGTH),
    });
  }
  removeInvalidColorAliases(themes, colorTokens, report);
  // 字体文件；超过上限的部分原样保留在文件里（unreadFonts），不读取
  const sourceType = isTokenObject(source.type) ? source.type : {};
  const fonts: Model.FontFace[] = [];
  const sourceFonts = asTokenArray(sourceType.fonts);
  let fontsExamined = 0;
  for (const sourceFont of sourceFonts) {
    if (fonts.length >= MAX_PARSED_FONT_FACES) {
      break;
    }
    fontsExamined++;
    if (!isTokenObject(sourceFont)) {
      continue;
    }
    const family = truncateTokenText(
      sourceFont.family,
      MAX_TOKEN_LABEL_LENGTH,
    ).trim();
    const fileName =
      typeof sourceFont.file === "string" ? sourceFont.file.trim() : "";
    if (family === "" || !isSafeFontStack(family) || /["']/.test(family)) {
      report.dropped.push(
        "font " + JSON.stringify(fileName) + ": bad family name",
      );
      continue;
    }
    const file = fileName.includes("/") ? fileName : "fonts/" + fileName;
    if (
      fileName === "" ||
      !isValidDesignSystemPath(file) ||
      /^[a-z][a-z0-9+.-]*:/i.test(fileName)
    ) {
      report.dropped.push(
        "font " +
          JSON.stringify(family) +
          ": bad file path (a relative path into the file table, e.g. fonts/Name.woff2)",
      );
      continue;
    }
    const weight = normalizeFontWeight(sourceFont.weight) ?? "400";
    const style: Model.FontFace["style"] =
      sourceFont.style === "italic" || sourceFont.style === "oblique"
        ? sourceFont.style
        : "normal";
    fonts.push({
      family,
      file,
      weight,
      style,
    });
  }
  const unreadFonts = sourceFonts.slice(fontsExamined);
  if (unreadFonts.length > 0) {
    (report.notes ??= []).push(
      "tokens.json type.fonts: " +
        String(unreadFonts.length) +
        (unreadFonts.length === 1
          ? " entry after the first " +
            String(MAX_PARSED_FONT_FACES) +
            " fonts is"
          : " entries after the first " +
            String(MAX_PARSED_FONT_FACES) +
            " fonts are") +
        " kept in the file but not read; remove fonts until the list holds " +
        String(MAX_PARSED_FONT_FACES) +
        " or fewer",
    );
  }
  // 字体族
  const families: Record<string, string> = {};
  if (isTokenObject(sourceType.families)) {
    let familyCount = 0;
    for (const key of Object.keys(sourceType.families)) {
      if (familyCount >= MAX_FONT_FAMILIES) {
        break;
      }
      const familyKey = key.trim().toLowerCase();
      const stack = sourceType.families[key];
      if (
        !TOKEN_NAME_PATTERN.test(familyKey) ||
        typeof stack !== "string" ||
        !isSafeFontStack(stack.trim())
      ) {
        report.dropped.push(
          "font family " + JSON.stringify(key) + ": bad key or stack",
        );
        continue;
      }
      families[familyKey] = stack.trim();
      familyCount++;
    }
  }
  // 文字样式分组；样式名全文件唯一，总数受上限约束
  const styleNames = new Set<string>();
  let styleCount = 0;
  const typographyGroups: Model.TypographyGroup[] = [];
  for (const sourceGroup of asTokenArray(sourceType.groups)) {
    if (typographyGroups.length >= MAX_TYPOGRAPHY_GROUPS) {
      break;
    }
    if (!isTokenObject(sourceGroup)) {
      continue;
    }
    const groupFamily =
      typeof sourceGroup.family === "string" &&
      Object.hasOwn(families, sourceGroup.family.trim().toLowerCase())
        ? sourceGroup.family.trim().toLowerCase()
        : "";
    const styles: Model.TypographyStyle[] = [];
    for (const sourceStyle of asTokenArray(sourceGroup.styles)) {
      if (styleCount >= MAX_TYPOGRAPHY_STYLES) {
        break;
      }
      if (!isTokenObject(sourceStyle)) {
        continue;
      }
      const styleName =
        typeof sourceStyle.name === "string"
          ? sourceStyle.name.trim().replace(/^\./, "")
          : "";
      if (!TOKEN_NAME_PATTERN.test(styleName) || styleNames.has(styleName)) {
        report.dropped.push(
          "type style " +
            JSON.stringify(styleName) +
            ": bad or duplicate name",
        );
        continue;
      }
      const fontSize = normalizeCssLength(sourceStyle.fontSize, false);
      if (fontSize === undefined) {
        report.dropped.push("type style " + styleName + ": bad fontSize");
        continue;
      }
      const lineHeight = normalizeLineHeight(sourceStyle.lineHeight) ?? "1.4";
      const styleFamily =
        typeof sourceStyle.family === "string" &&
        Object.hasOwn(families, sourceStyle.family.trim().toLowerCase())
          ? sourceStyle.family.trim().toLowerCase()
          : "";
      styles.push({
        name: styleName,
        fontSize,
        lineHeight,
        fontWeight: normalizeFontWeight(sourceStyle.fontWeight) ?? "400",
        letterSpacing:
          normalizeCssLength(sourceStyle.letterSpacing, false) ?? "0",
        fontStyle: sourceStyle.fontStyle === "italic" ? "italic" : "normal",
        opticalSize:
          normalizeTypographyProperty(
            "opticalSize",
            sourceStyle.opticalSize,
            families,
          ) ?? null,
        family: styleFamily,
        sample: truncateTokenText(
          sourceStyle.sample,
          MAX_TYPE_SAMPLE_LENGTH,
        ),
        usage: truncateTokenText(sourceStyle.usage, MAX_TOKEN_USAGE_LENGTH),
      });
      styleNames.add(styleName);
      styleCount++;
    }
    typographyGroups.push({
      name:
        truncateTokenText(sourceGroup.name, MAX_TOKEN_LABEL_LENGTH) || "Type",
      family: groupFamily,
      note: truncateTokenText(sourceGroup.note, MAX_TOKEN_NOTE_LENGTH),
      styles,
    });
  }
  // 其余 token 族：名称在所有族之间唯一（对应同一个 CSS 变量）
  const tokenFamiliesByName = new Map(
    colorTokens.map((token) => [token.name, "color"]),
  );
  function parseScalarFamily<Value extends string | Record<string, string>>(
    sourceFamily: unknown,
    familyName: string,
    normalizeValue: (value: unknown, name: string) => Value | undefined,
  ): Model.TokenFamily<{ name: string; value: Value; usage: string }> {
    const family = isTokenObject(sourceFamily) ? sourceFamily : {};
    const tokens: { name: string; value: Value; usage: string }[] = [];
    for (const sourceToken of asTokenArray(family.tokens)) {
      if (tokens.length >= MAX_TOKENS_PER_FAMILY) {
        break;
      }
      if (!isTokenObject(sourceToken)) {
        continue;
      }
      const name =
        typeof sourceToken.name === "string"
          ? sourceToken.name.trim().replace(/^--/, "")
          : "";
      const ownerFamily = tokenFamiliesByName.get(name);
      if (!TOKEN_NAME_PATTERN.test(name) || ownerFamily === familyName) {
        report.dropped.push(
          familyName +
            " " +
            JSON.stringify(name) +
            ": bad or duplicate name",
        );
        continue;
      }
      if (ownerFamily !== undefined) {
        report.dropped.push(
          familyName +
            " " +
            name +
            ": a " +
            ownerFamily +
            " token already has that name (one --" +
            name +
            " across every family)",
        );
        continue;
      }
      const value = normalizeValue(sourceToken.value, name);
      if (value === undefined) {
        report.dropped.push(familyName + " " + name + ": bad value");
        continue;
      }
      tokenFamiliesByName.set(name, familyName);
      tokens.push({
        name,
        value,
        usage: truncateTokenText(sourceToken.usage, MAX_TOKEN_USAGE_LENGTH),
      });
    }
    return {
      note: truncateTokenText(family.note, MAX_TOKEN_NOTE_LENGTH),
      tokens,
    };
  }
  // 阴影的值按主题给出；只有一个值时归到基础主题
  const parseShadowValue = (sourceValue: unknown, name: string) => {
    const themeValues: Record<string, string> = {};
    if (isTokenObject(sourceValue)) {
      for (const theme of themes) {
        if (!Object.hasOwn(sourceValue, theme.id)) {
          continue;
        }
        const shadowValue = normalizeBoxShadow(sourceValue[theme.id]);
        if (shadowValue !== undefined) {
          themeValues[theme.id] = shadowValue;
        } else {
          report.dropped.push(
            "shadow " +
              name +
              " [" +
              theme.id +
              "]: not a box-shadow value",
          );
        }
      }
    } else {
      const baseValue = normalizeBoxShadow(sourceValue);
      if (baseValue !== undefined) {
        themeValues[baseThemeId] = baseValue;
      }
    }
    if (!Object.hasOwn(themeValues, baseThemeId)) {
      const fallbackTheme = themes.find((theme) =>
        Object.hasOwn(themeValues, theme.id),
      );
      if (fallbackTheme === undefined) {
        return;
      }
      themeValues[baseThemeId] = themeValues[fallbackTheme.id];
      delete themeValues[fallbackTheme.id];
    }
    return themeValues;
  };
  const spacing = parseScalarFamily(source.spacing, "spacing", (value) =>
    normalizeCssLength(value, false),
  );
  const radius = parseScalarFamily(source.radius, "radius", (value) =>
    normalizeCssLength(value, true),
  );
  const shadow = parseScalarFamily(source.shadow, "shadow", parseShadowValue);
  const extra: Model.ExtraTokenFamily[] = [];
  // 不识别的顶层键原样保留，序列化时写回
  const kept: Record<string, unknown> = {};
  for (const key of ["shadow"]) {
    if (
      Object.hasOwn(source, key) &&
      !(isTokenObject(source[key]) && Array.isArray(source[key].tokens))
    ) {
      (report.notes ??= []).push(
        "tokens.json " +
          JSON.stringify(key) +
          ' is not shaped {"tokens":[{name,value,usage}]} — kept in the file, not shown',
      );
      defineOwnEnumerableProperty(kept, key, source[key]);
    }
  }
  for (const key of Object.keys(source)) {
    if (BUILTIN_TOKEN_DOCUMENT_KEYS.includes(key)) {
      continue;
    }
    const sourceFamily = source[key];
    if (key === "name" && typeof sourceFamily === "string") {
      defineOwnEnumerableProperty(kept, key, sourceFamily);
      continue;
    }
    if (
      !EXTRA_TOKEN_FAMILY_PATTERN.test(key) ||
      !isTokenObject(sourceFamily) ||
      !Array.isArray(sourceFamily.tokens)
    ) {
      (report.notes ??= []).push(
        "tokens.json " +
          JSON.stringify(key.slice(0, 40)) +
          ' is not a token family ({"tokens":[{name,value,usage}]}) — kept in the file, not shown',
      );
      defineOwnEnumerableProperty(kept, key, sourceFamily);
      continue;
    }
    if (extra.length >= MAX_EXTRA_TOKEN_FAMILIES) {
      (report.notes ??= []).push(
        "token families beyond the built-in ones are capped at " +
          String(MAX_EXTRA_TOKEN_FAMILIES) +
          " — " +
          JSON.stringify(key) +
          " kept in the file, not shown",
      );
      defineOwnEnumerableProperty(kept, key, sourceFamily);
      continue;
    }
    extra.push({
      key,
      ...parseScalarFamily(
        sourceFamily,
        key,
        key === "motion"
          ? (value) =>
              normalizeMotionValue(value) ?? normalizeExtraTokenValue(value)
          : normalizeExtraTokenValue,
      ),
    });
  }
  return {
    version: 1,
    color: {
      themes,
      tokens: colorTokens,
    },
    type: {
      fonts,
      families,
      groups: typographyGroups,
      ...(unreadFonts.length > 0
        ? {
            unreadFonts,
          }
        : {}),
    },
    spacing,
    radius,
    shadow,
    extra,
    kept,
  };
}
/** 解释颜色别名为什么无效；own 表示问题出在这个 token 自己，而不是别名链下游 */
export function explainColorAliasError(
  token: Model.ColorToken,
  themeId: string,
  baseThemeId: string,
  tokensByName: Map<string, Model.ColorToken>,
) {
  const seenNames = new Set([token.name]);
  let currentToken = token;
  for (let depth = 0; depth <= MAX_COLOR_ALIAS_DEPTH; depth++) {
    const target = colorAliasTarget(
      currentToken.value[themeId] ?? currentToken.value[baseThemeId],
    );
    if (target === undefined) {
      return;
    }
    const targetToken = tokensByName.get(target);
    if (targetToken === undefined) {
      return {
        why: (depth === 0 ? "" : "reaches {" + target + "}, which ") + "names no color token",
        own: depth === 0,
      };
    }
    if (seenNames.has(target)) {
      return {
        why: "is a cycle",
        own: target === token.name,
      };
    }
    seenNames.add(target);
    currentToken = targetToken;
  }
  return {
    why: "chains deeper than " + String(MAX_COLOR_ALIAS_DEPTH),
    own: true,
  };
}
/** 反复移除无效的颜色别名（悬空、循环、过深），直到稳定；失去基础主题值的 token 用其他主题值补上或删除 */
export function removeInvalidColorAliases(
  themes: Model.ColorTheme[],
  tokens: Model.ColorToken[],
  report: ParseReport,
): void {
  const baseThemeId = themes[0].id;
  for (;;) {
    const tokensByName = new Map(tokens.map((token) => [token.name, token]));
    const problems: [Model.ColorToken, string, string, boolean][] = [];
    for (const token of tokens) {
      for (const theme of themes) {
        if (colorAliasTarget(token.value[theme.id]) === undefined) {
          continue;
        }
        const problem = explainColorAliasError(
          token,
          theme.id,
          baseThemeId,
          tokensByName,
        );
        if (problem !== undefined) {
          problems.push([token, theme.id, problem.why, problem.own]);
        }
      }
    }
    if (problems.length === 0) {
      return;
    }
    // 有 token 自身的问题时，只处理这些；下游连带的问题等它们移除后再看
    const hasOwnProblem = problems.some((problem) => problem[3]);
    for (const [token, themeId, why, own] of problems) {
      if (hasOwnProblem && !own) {
        continue;
      }
      report.dropped.push(
        "color " +
          token.name +
          " [" +
          themeId +
          "]: " +
          String(token.value[themeId]) +
          " " +
          why,
      );
      delete token.value[themeId];
    }
    for (let index = 0; index < tokens.length; index++) {
      const token = tokens[index];
      if (Object.hasOwn(token.value, baseThemeId)) {
        continue;
      }
      const fallbackTheme = themes.find((theme) =>
        Object.hasOwn(token.value, theme.id),
      );
      if (fallbackTheme === undefined) {
        report.dropped.push("color " + token.name + ": no valid value");
        tokens.splice(index--, 1);
      } else {
        token.value[baseThemeId] = token.value[fallbackTheme.id];
        delete token.value[fallbackTheme.id];
      }
    }
  }
}
/** 序列化成 tokens.json 文本（2 空格缩进，末尾换行）；未被识别的顶层键写回，不覆盖已有键 */
export function serializeTokens(tokens: NormalizedTokens): string {
  const { shadow, extra, kept, ...builtin } = tokens;
  const { unreadFonts, ...type } = builtin.type;
  const serialized: Record<string, unknown> = {
    ...builtin,
    type:
      unreadFonts === undefined
        ? type
        : {
            ...type,
            fonts: [...type.fonts, ...unreadFonts],
          },
  };
  if (shadow.tokens.length > 0) {
    serialized.shadow = shadow;
  }
  for (const family of extra) {
    if (family.tokens.length > 0) {
      serialized[family.key] = {
        note: family.note,
        tokens: family.tokens,
      };
    }
  }
  for (const key of Object.keys(kept)) {
    if (!Object.hasOwn(serialized, key)) {
      defineOwnEnumerableProperty(serialized, key, kept[key]);
    }
  }
  return JSON.stringify(serialized, null, 2) + "\n";
}
export function allColorTokens(tokens: NormalizedTokens) {
  return tokens.color.tokens;
}
export function allTypographyStyles(tokens: NormalizedTokens) {
  return tokens.type.groups.flatMap((group) => group.styles);
}
export function allExtraTokens(tokens: NormalizedTokens) {
  return tokens.extra.flatMap((family) => family.tokens);
}
export function tokenNamesForFamily(
  tokens: NormalizedTokens,
  family: Core.TokenKind,
) {
  if (family === "type") {
    return allTypographyStyles(tokens).map((style) => style.name);
  }
  if (family === "extra") {
    return allExtraTokens(tokens).map((token) => token.name);
  }
  return tokens[family].tokens.map((token) => token.name);
}
/** 与给定族的新 token 同名会冲突的名称：文字样式只和自己比，其余族共用一个 CSS 变量空间 */
export function conflictingTokenNames(
  tokens: NormalizedTokens,
  family: Core.TokenKind,
) {
  if (family === "type") {
    return tokenNamesForFamily(tokens, "type");
  } else {
    return CSS_VARIABLE_TOKEN_FAMILIES.flatMap((variableFamily) =>
      tokenNamesForFamily(tokens, variableFamily),
    );
  }
}
export function shadowValueForTheme(
  token: Model.ShadowToken,
  themeId: string,
  tokens: NormalizedTokens,
) {
  const baseThemeId = tokens.color.themes[0].id;
  if (Object.hasOwn(token.value, themeId)) {
    return token.value[themeId];
  } else {
    return token.value[baseThemeId];
  }
}
export function colorValueForThemeModelTokens(
  token: Model.ColorToken,
  themeId: string,
  tokens: NormalizedTokens,
) {
  const baseThemeId = tokens.color.themes[0].id;
  if (Object.hasOwn(token.value, themeId)) {
    return token.value[themeId];
  } else {
    return token.value[baseThemeId];
  }
}
/** 按名称索引颜色 token；以 token 数组为键缓存 */
export function colorTokenIndex(tokens: NormalizedTokens) {
  let index = colorTokenIndexCache.get(tokens.color.tokens);
  if (index === undefined) {
    index = new Map(tokens.color.tokens.map((token) => [token.name, token]));
    colorTokenIndexCache.set(tokens.color.tokens, index);
  }
  return index;
}
/** 沿别名链解出某个主题下的最终颜色；链断开或成环返回 undefined */
export function resolveColorTokenValue(
  token: Model.ColorToken,
  themeId: string,
  tokens: NormalizedTokens,
) {
  const index = colorTokenIndex(tokens);
  let value: string | undefined = colorValueForThemeModelTokens(
    token,
    themeId,
    tokens,
  );
  for (let step = 0; step <= index.size; step++) {
    const target = colorAliasTarget(value);
    if (target === undefined) {
      return value;
    }
    const targetToken = index.get(target);
    value =
      targetToken === undefined
        ? undefined
        : colorValueForThemeModelTokens(targetToken, themeId, tokens);
  }
  return;
}
/**
 * 把 name 在 themeId 下改成 proposedValue 后，别名是否会成环。
 * 改的是基础主题时，继承基础值的其他主题也一并检查。via 是环上的 token，过深时为 "deep"。
 */
export function detectColorAliasCycle(
  tokens: NormalizedTokens,
  name: string,
  themeId: string,
  proposedValue: string,
): {theme: string; via: string[] | "deep"} | undefined {
  const themes = tokens.color.themes;
  const baseThemeId = themes[0]?.id ?? "";
  if (proposedValue !== "" && colorAliasTarget(proposedValue) === undefined) {
    return;
  }
  const index = colorTokenIndex(tokens);
  const token = index.get(name);
  const value = proposedValue !== "" ? proposedValue : token?.value[baseThemeId];
  const inheritingThemes =
    proposedValue !== "" && themeId === baseThemeId && token !== undefined
      ? themes
          .filter(
            (theme) =>
              theme.id !== baseThemeId && token.value[theme.id] === undefined,
          )
          .map((theme) => theme.id)
      : [];
  for (const checkedTheme of [themeId, ...inheritingThemes]) {
    const visited: string[] = [];
    let target = colorAliasTarget(value);
    for (
      let step = 0;
      step < MAX_COLOR_ALIAS_DEPTH && target !== undefined && target !== name;
      step++
    ) {
      const targetToken = visited.includes(target) ? undefined : index.get(target);
      if (targetToken === undefined) {
        target = undefined;
      } else {
        visited.push(target);
        target = colorAliasTarget(
          targetToken.value[checkedTheme] ?? targetToken.value[baseThemeId],
        );
      }
    }
    if (target !== undefined) {
      return {
        theme: checkedTheme,
        via: target === name ? visited : "deep",
      };
    }
  }
  return;
}
export function typographyStyleFamily(
  style: Model.TypographyStyle,
  group: Model.TypographyGroup,
) {
  if (style.family !== "") {
    return style.family;
  } else {
    return group.family;
  }
}
/** 文字样式的 CSS 简写变量（--text-<name>）；与颜色变量重名的样式不生成 */
export function typographyShorthandVariables(tokens: NormalizedTokens) {
  const occupiedNames = new Set(
    conflictingTokenNames(tokens, "color").map(escapeTokenCssIdentifier),
  );
  const variables = new Map<string, string>();
  for (const group of tokens.type.groups) {
    for (const style of group.styles) {
      const variable: string = "text-" + escapeTokenCssIdentifier(style.name);
      if (!occupiedNames.has(variable)) {
        variables.set(style.name, "--" + variable);
      }
    }
  }
  return variables;
}
export function escapeTokenCssIdentifier(name: string): string {
  let escaped = name.replace(/\./g, "\\.");
  if (/^[0-9]/.test(escaped)) {
    escaped = "\\3" + escaped[0] + " " + escaped.slice(1);
  }
  return escaped;
}
export function escapeTokenCssComment(usage: string) {
  return usage
    .replace(/\*\//g, "* /")
    .replace(/<\//g, "< /")
    .replace(/[\r\n\f]+/g, " ")
    .trim();
}
/**
 * 生成 tokens.css：基础主题放在 :root，其他主题写成 [data-theme] 覆盖，
 * 再接间距、圆角、扩展族、字体族、文字样式类与 @font-face。
 */
export function generateTokensCss(
  tokens: NormalizedTokens,
  options: TokenCssOptions = {},
): string {
  const rules = [];
  const themes = tokens.color.themes;
  const baseThemeId = themes[0].id;
  const colors = allColorTokens(tokens);
  const shadows = tokens.shadow.tokens;
  const usageComment = (usage: string): string =>
    options.usageComments === true && usage !== ""
      ? " /* " + escapeTokenCssComment(usage) + " */"
      : "";
  // 别名写成 var(--x)；withUsage 控制是否附上 usage 注释（只在基础主题块里附）
  const colorDeclaration = (
    token: Model.ColorToken,
    value: string,
    withUsage: boolean,
  ): string => {
    const aliasTarget = colorAliasTarget(value);
    return (
      "  --" +
      escapeTokenCssIdentifier(token.name) +
      ": " +
      (aliasTarget !== undefined
        ? "var(--" + escapeTokenCssIdentifier(aliasTarget) + ")"
        : value) +
      ";" +
      (withUsage ? usageComment(token.usage) : "")
    );
  };
  const scalarDeclaration = (
    token: Model.ScalarToken | Model.ShadowToken,
    value: string,
    withUsage: boolean,
  ): string =>
    "  --" +
    escapeTokenCssIdentifier(token.name) +
    ": " +
    value +
    ";" +
    (withUsage ? usageComment(token.usage) : "");
  if (colors.length > 0 || shadows.length > 0) {
    rules.push(':root, [data-theme="' + baseThemeId + '"] {');
    for (const token of colors) {
      rules.push(colorDeclaration(token, token.value[baseThemeId], true));
    }
    for (const token of shadows) {
      rules.push(scalarDeclaration(token, token.value[baseThemeId], true));
    }
    rules.push("}");
    for (const theme of themes.slice(1)) {
      const declarations = [
        ...colors
          .filter(
            (token) =>
              token.value[theme.id] !== undefined ||
              colorAliasTarget(token.value[baseThemeId]) !== undefined,
          )
          .map((token) =>
            colorDeclaration(
              token,
              token.value[theme.id] ?? token.value[baseThemeId],
              false,
            ),
          ),
        ...shadows
          .filter((token): boolean => token.value[theme.id] !== undefined)
          .map((token) =>
            scalarDeclaration(token, token.value[theme.id], false),
          ),
      ];
      if (declarations.length > 0) {
        rules.push('[data-theme="' + theme.id + '"] {', ...declarations, "}");
      }
    }
  }
  const rootVariables = [];
  for (const token of tokens.spacing.tokens) {
    rootVariables.push(
      "  --" +
        escapeTokenCssIdentifier(token.name) +
        ": " +
        token.value +
        ";" +
        usageComment(token.usage),
    );
  }
  for (const token of tokens.radius.tokens) {
    rootVariables.push(
      "  --" +
        escapeTokenCssIdentifier(token.name) +
        ": " +
        token.value +
        ";" +
        usageComment(token.usage),
    );
  }
  for (const token of allExtraTokens(tokens)) {
    rootVariables.push(
      "  --" +
        escapeTokenCssIdentifier(token.name) +
        ": " +
        token.value +
        ";" +
        usageComment(token.usage),
    );
  }
  for (const [key, stack] of Object.entries(tokens.type.families)) {
    rootVariables.push(
      "  --font-" + escapeTokenCssIdentifier(key) + ": " + stack + ";",
    );
  }
  if (options.styleVars === true) {
    const shorthandVariables = typographyShorthandVariables(tokens);
    for (const group of tokens.type.groups) {
      for (const style of group.styles) {
        const variable = shorthandVariables.get(style.name);
        if (variable === undefined) {
          continue;
        }
        const family = typographyStyleFamily(style, group);
        rootVariables.push(
          "  " +
            variable +
            ": " +
            (style.fontStyle !== "normal" ? style.fontStyle + " " : "") +
            String(style.fontWeight) +
            " " +
            style.fontSize +
            "/" +
            style.lineHeight +
            (family !== ""
              ? " var(--font-" + escapeTokenCssIdentifier(family) + ")"
              : " inherit") +
            ";" +
            usageComment(style.usage),
        );
      }
    }
  }
  if (rootVariables.length > 0) {
    rules.push(":root {", ...rootVariables, "}");
  }
  for (const group of tokens.type.groups) {
    for (const style of group.styles) {
      const family = typographyStyleFamily(style, group);
      const declarations = [
        ...(family !== ""
          ? [
              "  font-family: var(--font-" +
                escapeTokenCssIdentifier(family) +
                ");",
            ]
          : []),
        "  font-size: " + style.fontSize + ";",
        "  line-height: " + style.lineHeight + ";",
        "  font-weight: " + style.fontWeight + ";",
        "  letter-spacing: " + style.letterSpacing + ";",
        ...(style.fontStyle !== "normal"
          ? ["  font-style: " + style.fontStyle + ";"]
          : []),
        ...(style.opticalSize !== null
          ? [
              "  font-variation-settings: 'opsz' " +
                String(style.opticalSize) +
                ";",
            ]
          : []),
      ];
      rules.push(
        "." + escapeTokenCssIdentifier(style.name) + " {",
        ...declarations,
        "}",
      );
    }
  }
  if (options.fontFaces !== false) {
    rules.push(...generateFontFaceRules(tokens, options.fontSrc));
  }
  return rules.join("\n") + (rules.length > 0 ? "\n" : "");
}
export function generateFontFaceRules(
  tokens: NormalizedTokens,
  fontSource?: (path: string) => string | null,
) {
  const rules = [];
  for (const font of tokens.type.fonts) {
    const url = fontSource
      ? fontSource(font.file)
      : encodeRelativeUrlPath(font.file);
    if (url === null) {
      continue;
    }
    const extension = font.file
      .slice(font.file.lastIndexOf(".") + 1)
      .toLowerCase();
    const formatName = FONT_FACE_FORMAT_NAMES[extension];
    rules.push(
      "@font-face {",
      '  font-family: "' + font.family + '";',
      '  src: url("' +
        url.replace(/["\\\n\r\f]/g, "") +
        '")' +
        (formatName !== undefined ? ' format("' + formatName + '")' : "") +
        ";",
      "  font-weight: " + font.weight + ";",
      "  font-style: " + font.style + ";",
      "  font-display: swap;",
      "}",
    );
  }
  return rules;
}
export function generateFontFacesCss(
  tokens: NormalizedTokens,
  fontSource?: (path: string) => string | null,
): string {
  const rules = generateFontFaceRules(tokens, fontSource);
  return rules.join("\n") + (rules.length > 0 ? "\n" : "");
}
export function generateNamedTokensCss(
  tokens: NormalizedTokens,
  name: string,
  fontSource?: (path: string) => string | null,
): string {
  return (
    "/* " +
    (name.trim() !== ""
      ? Array.from(name.replace(/\s+/g, " ").trim())
          .slice(0, 200)
          .join("")
          .replace(/\*\//g, "* /")
          .replace(/<\//g, "< /")
      : "Design system") +
    " — generated from tokens.json */\n" +
    generateTokensCss(tokens, {
      usageComments: true,
      styleVars: true,
      fontSrc: fontSource,
    })
  );
}
/**
 * 由文件表里的 tokens.json 生成 tokens.css；没有 tokens.json 返回 null，
 * 结果含替换字符或 </ 时视为不安全也返回 null。
 * 缓存最近一次的结果，输入为 tokens 文本、系统名称与字体文件内容。
 */
export function generatedTokensCssForFiles(files: Model.FileTable) {
  if (!Object.hasOwn(files, DESIGN_SYSTEM_PATHS.tokens)) {
    return null;
  }
  const manifestName = parseManifest(
    files[DESIGN_SYSTEM_PATHS.manifest] ?? "",
  ).name;
  const name = typeof manifestName === "string" ? manifestName : "";
  const fontSource = (path: string) => {
    const pointer = storagePointerForFile(path, files[path] ?? "");
    if (pointer === null) {
      return encodeRelativeUrlPath(path);
    } else {
      if (pointer.store === "blob") {
        return blobRelativeUrlModelFilePolicy(pointer.id);
      } else {
        return encodeRelativeUrlPath(
          pointer.rel === "" ? path : pointer.rel,
        );
      }
    }
  };
  const tokensText = files[DESIGN_SYSTEM_PATHS.tokens];
  const fontCacheKey = Object.keys(files)
    .filter((path) => path.startsWith(DESIGN_SYSTEM_PATHS.fontsDir))
    .sort()
    .map(
      (path): string =>
        path +
        "=" +
        (storagePointerForFile(path, files[path]) !== null
          ? files[path]
          : "inline"),
    )
    .join("\n");
  if (
    cachedGeneratedTokensCss !== null &&
    cachedGeneratedTokensCss.tokens === tokensText &&
    cachedGeneratedTokensCss.name === name &&
    cachedGeneratedTokensCss.fonts === fontCacheKey
  ) {
    return cachedGeneratedTokensCss.css;
  }
  const generatedCss = generateNamedTokensCss(
    parseTokens(tokensText),
    name,
    fontSource,
  );
  const safeCss =
    generatedCss.includes(String.fromCharCode(65533)) ||
    generatedCss.includes("</")
      ? null
      : generatedCss;
  cachedGeneratedTokensCss = {
    tokens: tokensText,
    name,
    fonts: fontCacheKey,
    css: safeCss,
  };
  return safeCss;
}
/** 把清单里的系统名称写进 tokens.json 的 name；无需改动或结果不安全时返回原文本 */
export function tokensJsonWithManifestName(files: Model.FileTable) {
  const tokensText = files[DESIGN_SYSTEM_PATHS.tokens];
  if (tokensText === undefined) {
    return null;
  }
  const name = truncateTokenText(
    parseManifest(files[DESIGN_SYSTEM_PATHS.manifest] ?? "").name,
    MAX_TOKEN_LABEL_LENGTH,
  ).trim();
  if (name === "" || name.includes(String.fromCharCode(65533))) {
    return tokensText;
  }
  try {
    const parsed: unknown = JSON.parse(tokensText);
    if (
      !isTokenObject(parsed) ||
      parsed.name === name ||
      (parsed.name !== undefined && typeof parsed.name !== "string")
    ) {
      return tokensText;
    }
    const { name: _oldName, ...rest } = parsed;
    const updated: string =
      JSON.stringify(
        {
          name,
          ...rest,
        },
        null,
        2,
      ) + "\n";
    if (updated.includes(String.fromCharCode(65533))) {
      return tokensText;
    } else {
      return updated;
    }
  } catch {
    return tokensText;
  }
}
