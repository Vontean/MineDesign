import type * as Core from "../contracts";
import type * as M from "../contracts/documentation";
/** Restored application module; prepare first, initialize in original order. */

var DEFAULT_COMPONENT_PREVIEW_HEIGHT: number;
var MAX_COMPONENT_GROUP_LABEL_LENGTH: number;
var COMPONENT_CARD_HEADER_PATTERN: RegExp;
var COMPONENT_CARD_ATTRIBUTE_PATTERN: RegExp;
var NUMERIC_TOKEN_SUFFIX_PATTERN: RegExp;
var TOKEN_NAME_SEPARATOR: string;
var PALETTE_GROUP_NAME: string;
var MAX_INFERRED_COMPONENT_PROPS: number;
var MAX_REFERENCED_TYPE_NAMES: number;
var MAX_TYPE_BODY_MEMBERS: number;
var MAX_TYPE_INFERENCE_WORK: number;
var MAX_TYPE_INFERENCE_SCANNED_CHARACTERS: number;
var TYPE_INFERENCE_OVER_BUDGET: symbol;
var MAX_PROPS_INHERITANCE_DEPTH: number;
var TYPE_IDENTIFIER_PATTERN: RegExp;
var QUOTED_TYPE_LITERAL_PATTERN: RegExp;
var NUMERIC_TYPE_LITERAL_PATTERN: RegExp;
var MAX_TYPE_RESOLUTION_DEPTH: number;
var MAX_TEMPLATE_TYPE_EXPANSIONS: number;
var MAX_ENUM_CONTROL_OPTIONS: number;
var MIN_NUMERIC_ENUM_OPTIONS: number;
var NON_EDITABLE_REACT_TYPES: Set<string>;
var typeLiteralSets: WeakMap<string[], Set<string>>;
var TypeDeclarationResolver: M.TypeDeclarationResolverConstructor;
var OMITTED_COMPONENT_PROPS: Set<string>;
var cachedTypeDeclarationResolver: M.ResolverCache | null;
var typeInferenceIncomplete: boolean;
function clampSingleLineText(text: string, maxLength: number): string {
  let characters = Array.from<string>(text.replace(/[\r\n\t]+/g, " ").trim());
  if (characters.length > maxLength) {
    return characters.slice(0, maxLength).join("").trim();
  } else {
    return characters.join("");
  }
}
function parseComponentCardHeader(
  html: string,
): Core.ComponentCardMetadata | null {
  let header = COMPONENT_CARD_HEADER_PATTERN.exec(
    html.charCodeAt(0) === 65279 ? html.slice(1) : html,
  );
  if (header === null) {
    return null;
  }
  let metadata: Core.ComponentCardMetadata = {};
  for (let value of (header[1] ?? "")
    .trimEnd()
    .matchAll(COMPONENT_CARD_ATTRIBUTE_PATTERN)) {
    let headerKind = (value[1] ?? "").toLowerCase(),
      headerValue = value[2] ?? value[3] ?? "";
    if (headerKind === "group") {
      let groupName = clampSingleLineText(headerValue, 64);
      if (groupName !== "" && !/[<>"]/.test(groupName)) {
        metadata.group = groupName;
      }
    } else if (headerKind === "height") {
      let height: number = Number(headerValue);
      if (headerValue !== "" && Number.isFinite(height)) {
        metadata.height = Math.round(Math.min(4000, Math.max(40, height)));
      }
    } else if (headerKind === "width") {
      let width: number = Number(headerValue);
      if (headerValue !== "" && Number.isFinite(width)) {
        metadata.width = Math.round(Math.min(4000, Math.max(240, width)));
      }
    } else if (headerKind === "subtitle") {
      let subtitle = clampSingleLineText(headerValue, 120);
      if (subtitle !== "") {
        metadata.subtitle = subtitle;
      }
    } else if (headerKind === "floor") {
      metadata.floor = true;
    } else if (headerKind === "page") {
      metadata.page = true;
    }
  }
  return metadata;
}
function skipHtmlPreamble(html: string): number {
  let offset: number = html.charCodeAt(0) === 65279 ? 1 : 0;
  while (offset < html.length && /\s/.test(html[offset])) {
    offset++;
  }
  let doctype = /^<!doctype\b[^>]*>\s*/i.exec(
    html.slice(offset, offset + 512),
  );
  if (doctype !== null) {
    return offset + doctype[0].length;
  } else {
    return offset;
  }
}
function componentCardMetadata(
  html: string,
): Core.ComponentCardMetadata | null {
  let preambleEnd = skipHtmlPreamble(html),
    firstNewline = html.indexOf(
      `
`,
      preambleEnd,
    );
  return parseComponentCardHeader(
    html.slice(preambleEnd, firstNewline < 0 ? undefined : firstNewline),
  );
}
function splitTokenName(name: string): string[] {
  return name.split("-");
}
function commonTokenNamePrefix(names: readonly string[]): string {
  if (names.length < 2) {
    return "";
  }
  let firstName = names[0],
    commonPrefix = "";
  for (
    let value = firstName.indexOf("-");
    value > 0;
    value = firstName.indexOf("-", value + 1)
  ) {
    let prefixCandidate = firstName.slice(0, value + 1);
    if (
      !names.every(
        (items) => items.startsWith(prefixCandidate) && items.length > prefixCandidate.length,
      )
    ) {
      break;
    }
    if (names.some((name) => tokenHasGroupSuffix(name, prefixCandidate))) {
      commonPrefix = prefixCandidate;
    }
  }
  return commonPrefix;
}
function tokenGroupName(name: string, prefix = ""): string {
  let suffix =
      prefix !== "" && name.startsWith(prefix) && name.length > prefix.length
        ? name.slice(prefix.length)
        : name,
    numericMatch = NUMERIC_TOKEN_SUFFIX_PATTERN.exec(suffix);
  if (
    numericMatch !== null &&
    numericMatch[1] !== undefined &&
    numericMatch[1] !== ""
  ) {
    return numericMatch[1];
  }
  let hyphenOffset = suffix.indexOf("-");
  if (hyphenOffset > 0) {
    return suffix.slice(0, hyphenOffset);
  } else {
    return suffix;
  }
}
function tokenHasGroupSuffix(name: string, prefix = ""): boolean {
  let suffix =
    prefix !== "" && name.startsWith(prefix) && name.length > prefix.length
      ? name.slice(prefix.length)
      : name;
  return tokenGroupName(name, prefix) !== suffix;
}
function groupTokensByName<Token extends { name: string }>(
  tokens: readonly Token[],
): M.TokenNameGroup<Token>[] {
  let prefix = commonTokenNamePrefix(tokens.map((token) => token.name)),
    groups = new Map<string, Token[]>(),
    ungrouped: Token[] = [];
  for (let value of tokens) {
    if (!tokenHasGroupSuffix(value.name, prefix)) {
      ungrouped.push(value);
      continue;
    }
    let groupName = tokenGroupName(value.name, prefix),
      entry = groups.get(groupName);
    if (entry === undefined) {
      groups.set(groupName, (entry = []));
    }
    entry.push(value);
  }
  let groupEntries = [...groups.entries()].map(
    ([groupName, groupTokens]: [string, Token[]]) => ({
      name: groupName,
      tokens: groupTokens,
    }),
  );
  if (ungrouped.length > 0) {
    return [
      {
        name: "",
        tokens: ungrouped,
      },
      ...groupEntries,
    ];
  } else {
    return groupEntries;
  }
}
function groupColorPaletteTokens(
  tokens: Core.NormalizedTokens,
): M.ColorPaletteGroup[] {
  let byGroup = new Map<
      string,
      Core.NormalizedTokens["color"]["tokens"][number][]
    >(),
    prefix = commonTokenNamePrefix(
      tokens.color.tokens.map((token) => token.name),
    );
  for (let value of tokens.color.tokens) {
    let groupName = tokenGroupName(value.name, prefix),
      entry = byGroup.get(groupName);
    if (entry === undefined) {
      byGroup.set(groupName, (entry = []));
    }
    entry.push(value);
  }
  let palettes: M.ColorPaletteGroup[] = [];
  for (let [value, groupTokens] of byGroup) {
    if (
      groupTokens.some((token) => tokenHasGroupSuffix(token.name, prefix)) &&
      groupTokens.length >= 1
    ) {
      palettes.push({
        name: value,
        numeric: groupTokens.every((token) =>
          NUMERIC_TOKEN_SUFFIX_PATTERN.test(token.name),
        ),
        tokens: groupTokens,
      });
    }
  }
  let paletteNames = new Set(palettes.map((palette) => palette.name)),
    ungrouped = [...byGroup.entries()]
      .filter(([groupName]): boolean => !paletteNames.has(groupName))
      .flatMap(([, groupTokens]) => groupTokens);
  ungrouped.sort(
    (leftToken, rightToken) =>
      tokens.color.tokens.indexOf(leftToken) -
      tokens.color.tokens.indexOf(rightToken),
  );
  if (ungrouped.length > 0) {
    return [
      {
        name: "",
        numeric: false,
        tokens: ungrouped,
      },
      ...palettes,
    ];
  } else {
    return palettes;
  }
}
function coerceControlOption(
  control: M.InferredControl,
  option: string,
): string | number | boolean {
  if (control.numeric === true) {
    return Number(option);
  }
  if (
    control.withBool === true &&
    (option === "true" || option === "false")
  ) {
    return option === "true";
  }
  return option;
}
function isValidTypeDeclarationName(name: string): boolean {
  return TYPE_IDENTIFIER_PATTERN.test(name) && name.length <= 80;
}
function skipBalancedTypeExpression(text: string, start: number): number {
  let open = text[start],
    close: string =
      open === "{" ? "}" : open === "(" ? ")" : open === "[" ? "]" : ">",
    depth: number = 0;
  for (let value = start; value < text.length; value++) {
    let currentChar = text[value];
    if (currentChar === '"' || currentChar === "'" || currentChar === "`") {
      let quoteChar = currentChar;
      value++;
      while (value < text.length && text[value] !== quoteChar) {
        if (text[value] === "\\") {
          value++;
        }
        value++;
      }
      continue;
    }
    if (currentChar === "/" && text[value + 1] === "*") {
      let commentEnd = text.indexOf("*/", value + 2);
      if (commentEnd === -1) {
        return -1;
      }
      value = commentEnd + 1;
      continue;
    }
    if (currentChar === "/" && text[value + 1] === "/") {
      let expressionEnd = text.indexOf(
        `
`,
        value,
      );
      if (expressionEnd === -1) {
        return -1;
      }
      value = expressionEnd;
      continue;
    }
    if (currentChar === open) {
      depth++;
    } else if (currentChar === close) {
      depth--;
      if (depth === 0) {
        return value + 1;
      }
    }
  }
  return -1;
}
function typeDeclarationEnd(text: string, start: number): number {
  let offset = start;
  while (offset < text.length) {
    let value = text[offset];
    if (value === ";") {
      return offset;
    }
    if (value === "{" || value === "(" || value === "[") {
      let bodyEnd = skipBalancedTypeExpression(text, offset);
      if (bodyEnd === -1) {
        return text.length;
      }
      offset = bodyEnd;
      continue;
    }
    if (value === '"' || value === "'" || value === "`") {
      let quoteChar = value;
      offset++;
      while (offset < text.length && text[offset] !== quoteChar) {
        if (text[offset] === "\\") {
          offset++;
        }
        offset++;
      }
      offset++;
      continue;
    }
    if (value === "/" && text[offset + 1] === "*") {
      let commentEnd = text.indexOf("*/", offset + 2);
      offset = commentEnd === -1 ? text.length : commentEnd + 2;
      continue;
    }
    if (value === "/" && text[offset + 1] === "/") {
      let expressionEnd = text.indexOf(
        `
`,
        offset,
      );
      offset = expressionEnd === -1 ? text.length : expressionEnd + 1;
      continue;
    }
    offset++;
  }
  return text.length;
}
function findTypeDeclaration(
  texts: readonly string[],
  name: string,
): M.TypeDeclaration | null {
  for (let value of texts) {
    for (let declarationKind of ["interface", "type", "const", "enum"] as const) {
      let index = 0,
        declarationPrefix: string = declarationKind + " " + name;
      for (;;) {
        let declarationIndex = value.indexOf(declarationPrefix, index);
        if (declarationIndex === -1) {
          break;
        }
        index = declarationIndex + declarationPrefix.length;
        let previousChar = declarationIndex === 0 ? " " : (value[declarationIndex - 1] ?? " "),
          nextChar = value[index] ?? " ";
        if (/[\w$]/.test(previousChar) || /[\w$]/.test(nextChar)) {
          continue;
        }
        if (declarationKind === "interface" || declarationKind === "enum") {
          let bodyStart = value.indexOf("{", index);
          if (bodyStart === -1) {
            break;
          }
          let bodyEnd = skipBalancedTypeExpression(value, bodyStart);
          if (bodyEnd === -1) {
            break;
          }
          return {
            kind: declarationKind,
            head: value.slice(index, bodyStart),
            body: value.slice(bodyStart + 1, bodyEnd - 1),
          };
        }
        let prefixLength = value
            .slice(index)
            .replace(/^\s*(?:<[^=]*>\s*)?[=:]\s*/, ""),
          nameLength = value.length - index - prefixLength.length,
          declarationStart = index + nameLength,
          declarationEnd = typeDeclarationEnd(value, declarationStart);
        return {
          kind: declarationKind,
          head: value.slice(declarationStart, declarationEnd),
          body: "",
        };
      }
    }
  }
  return null;
}
function parseTypeBodyMembers(body: string): M.TypeBodyMember[] {
  let members: M.TypeBodyMember[] = [],
    offset = 0,
    doc = "";
  while (offset < body.length && members.length < MAX_TYPE_BODY_MEMBERS) {
    let value = body[offset];
    if (
      value === " " ||
      value ===
        `
` ||
      value === "\t" ||
      value === "\r"
    ) {
      offset++;
      continue;
    }
    if (value === "/" && body[offset + 1] === "*") {
      let commentEnd = body.indexOf("*/", offset + 2),
        commentText = body.slice(offset, commentEnd === -1 ? body.length : commentEnd + 2);
      doc = commentText.startsWith("/**") ? commentText : "";
      offset = commentEnd === -1 ? body.length : commentEnd + 2;
      continue;
    }
    if (value === "/" && body[offset + 1] === "/") {
      let expressionEnd = body.indexOf(
        `
`,
        offset,
      );
      offset = expressionEnd === -1 ? body.length : expressionEnd + 1;
      continue;
    }
    let memberEnd = typeDeclarationEnd(body, offset),
      memberBody = body.slice(offset, memberEnd);
    offset = memberEnd + 1;
    let memberMatch =
      /^\s*(?:readonly\s+)?(?:"([^"]+)"|'([^']+)'|([A-Za-z_$][\w$]*))(?:\s*(\?))?\s*:\s*([\s\S]+)$/.exec(
        memberBody,
      );
    if (memberMatch !== null) {
      let memberName = memberMatch[1] ?? memberMatch[2] ?? memberMatch[3] ?? "";
      members.push({
        name: memberName,
        optional: memberMatch[4] !== undefined,
        type: (memberMatch[5] ?? "").trim(),
        doc: doc,
      });
    }
    doc = "";
  }
  return members;
}
function referencedTypeNames(head: string): string[] {
  let outerText = "",
    offset = 0;
  while (offset < head.length) {
    if (head[offset] === "{") {
      let value = skipBalancedTypeExpression(head, offset);
      if (value === -1) {
        break;
      }
      offset = value;
      continue;
    }
    outerText += head[offset];
    offset++;
  }
  let names: string[] = [],
    identifierPattern: RegExp = /\b([A-Z][\w$]*)\b(\s*\[)?/g,
    match: RegExpExecArray | null;
  while ((match = identifierPattern.exec(outerText)) !== null) {
    let value = match[1] ?? "";
    if (match[2] !== undefined) {
      continue;
    }
    if (
      value === "Omit" ||
      value === "Pick" ||
      value === "Partial" ||
      value === "Required" ||
      value === "NonNullable" ||
      value === "Readonly" ||
      value === "React"
    ) {
      continue;
    }
    if (!names.includes(value)) {
      names.push(value);
    }
    if (names.length >= MAX_REFERENCED_TYPE_NAMES) {
      break;
    }
  }
  return names;
}
function inlineTypeObjectBodies(head: string): string[] {
  let bodies: string[] = [],
    offset = 0;
  while (offset < head.length) {
    let value = head[offset];
    if (value === "{") {
      let objectEnd = skipBalancedTypeExpression(head, offset);
      if (objectEnd === -1) {
        break;
      }
      bodies.push(head.slice(offset + 1, objectEnd - 1));
      offset = objectEnd;
      continue;
    }
    if (value === "(" || value === "[") {
      offset++;
      continue;
    }
    if (value === "<") {
      let objectEnd = skipBalancedTypeExpression(head, offset);
      offset = objectEnd === -1 ? head.length : objectEnd;
      continue;
    }
    offset++;
  }
  return bodies;
}
function createTypeInferenceState(): M.TypeInferenceState {
  return {
    literals: [],
    numeric: true,
    str: false,
    num: false,
    bool: false,
    node: false,
    other: false,
    unresolved: [],
  };
}
function appendTypeLiteral(
  state: M.TypeInferenceState,
  literal: string,
  forceString = false,
): void {
  let literals = typeLiteralSets.get(state.literals);
  if (literals === undefined) {
    typeLiteralSets.set(state.literals, (literals = new Set(state.literals)));
  }
  if (literals.size > MAX_ENUM_CONTROL_OPTIONS) {
    return;
  }
  if (!literals.has(literal)) {
    literals.add(literal);
    state.literals.push(literal);
  }
  if (forceString || !NUMERIC_TYPE_LITERAL_PATTERN.test(literal)) {
    state.numeric = false;
  }
}
function mergeInferredControl(
  state: M.TypeInferenceState,
  control: M.InferredControl | null,
): void {
  if (control === null) {
    state.other = true;
    return;
  }
  if (control.kind === "enum") {
    let value = control.options ?? [];
    if (control.withBool === true) {
      state.bool = true;
    }
    for (let controlValue of control.withBool === true ? value.slice(2) : value) {
      appendTypeLiteral(state, controlValue);
    }
    if (control.numeric !== true) {
      state.numeric = false;
    }
  } else if (control.kind === "boolean") {
    state.bool = true;
  } else if (control.kind === "number") {
    state.num = true;
  } else if (((state.str = true), control.typeName !== undefined)) {
    state.unresolved.push(control.typeName);
  }
}
function enumControlFromLiterals(
  values: readonly string[],
): M.InferredControl {
  let control: M.InferredControl = {
    kind: "enum",
    options: [...new Set(values)].slice(0, MAX_ENUM_CONTROL_OPTIONS + 1),
  };
  if (
    control.options !== undefined &&
    control.options.length > 0 &&
    control.options.every((option) => NUMERIC_TYPE_LITERAL_PATTERN.test(option))
  ) {
    control.numeric = true;
  }
  return control;
}
function inferEnumDeclaration(body: string): M.InferredControl | null {
  let options: string[] = [],
    numeric: boolean = true,
    nextNumericValue = 0;
  for (let value of splitTypeExpression(stripTypeComments(body), ",")) {
    let enumMatch =
      /^\s*(?:"([^"]+)"|'([^']+)'|([A-Za-z_$][\w$]*))\s*(?:=([\s\S]*))?$/.exec(
        value.trim(),
      );
    if (enumMatch === null) {
      continue;
    }
    let enumValue =
      enumMatch[4] === undefined ? undefined : enumMatch[4].trim() || undefined;
    if (enumValue === undefined) {
      options.push(String(nextNumericValue++));
      continue;
    }
    let quotedValue = QUOTED_TYPE_LITERAL_PATTERN.exec(enumValue);
    if (quotedValue !== null) {
      options.push(quotedValue[1] ?? quotedValue[2] ?? "");
      numeric = false;
      continue;
    }
    if (NUMERIC_TYPE_LITERAL_PATTERN.test(enumValue)) {
      options.push(enumValue);
      nextNumericValue = Number(enumValue) + 1;
      continue;
    }
    return null;
  }
  if (options.length === 0) {
    return null;
  }
  let control: M.InferredControl = {
    kind: "enum",
    options: options,
  };
  if (numeric) {
    control.numeric = true;
  }
  return control;
}
function arrayElementTypeExpression(typeText: string): string {
  let normalized = unwrapTypeExpression(stripTypeComments(typeText)).replace(
    /^readonly\s+/,
    "",
  );
  if (normalized.startsWith("[") && normalized.endsWith("]")) {
    return splitTypeExpression(normalized.slice(1, -1), ",").join(" | ");
  }
  let arrayMatch = /^(?:ReadonlyArray|Array)\s*<([\s\S]*)>$/.exec(normalized);
  if (arrayMatch !== null) {
    return arrayMatch[1] ?? "";
  }
  if (normalized.endsWith("[]")) {
    return normalized.slice(0, -2);
  }
  return normalized;
}
function stripTypeComments(text: string): string {
  let withoutComments = "",
    copyOffset = 0,
    offset = 0;
  while (offset < text.length) {
    let value = text[offset];
    if (value === '"' || value === "'" || value === "`") {
      offset++;
      while (offset < text.length && text[offset] !== value) {
        offset += text[offset] === "\\" ? 2 : 1;
      }
      offset++;
      continue;
    }
    if (value === "/" && text[offset + 1] === "*") {
      withoutComments += text.slice(copyOffset, offset);
      let commentEnd = text.indexOf("*/", offset + 2);
      if (commentEnd === -1) {
        return withoutComments.trim();
      }
      offset = copyOffset = commentEnd + 2;
      continue;
    }
    offset++;
  }
  return (withoutComments + text.slice(copyOffset)).trim();
}
function unwrapTypeExpression(text: string): string {
  let unwrapped = text.trim();
  for (
    let index: number = 0;
    index < 8 &&
    unwrapped.startsWith("(") &&
    skipBalancedTypeExpression(unwrapped, 0) === unwrapped.length;
    index++
  ) {
    unwrapped = unwrapped.slice(1, -1).trim();
  }
  return unwrapped;
}
function conciseTypeDescription(typeText: string): string {
  let description = stripTypeComments(typeText).replace(/\s+/g, " ");
  if (description.length > 40) {
    return description.slice(0, 37) + "…";
  } else {
    return description;
  }
}
function splitTypeExpression(text: string, separator: string): string[] {
  let parts: string[] = [],
    depth: number = 0,
    partStart = 0,
    offset: number = 0;
  while (offset < text.length) {
    let value = text[offset];
    if (value === '"' || value === "'" || value === "`") {
      let quoteChar = value;
      offset++;
      while (offset < text.length && text[offset] !== quoteChar) {
        if (text[offset] === "\\") {
          offset++;
        }
        offset++;
      }
      offset++;
      continue;
    }
    if (value === "{" || value === "(" || value === "[" || value === "<") {
      depth++;
    } else if (
      value === "}" ||
      value === ")" ||
      value === "]" ||
      value === ">"
    ) {
      if (!(value === ">" && text[offset - 1] === "=")) {
        depth--;
      }
    } else if (value === separator && depth === 0) {
      parts.push(text.slice(partStart, offset).trim());
      partStart = offset + 1;
    }
    offset++;
  }
  parts.push(text.slice(partStart).trim());
  return parts.filter((part): boolean => part !== "");
}
function inferVariantPropsType(
  typeText: string,
  resolver: M.TypeDeclarationResolver,
) {
  let variantMatch =
    /VariantProps<typeof\s+([A-Za-z_$][\w$]*)>\s*\[\s*"([^"]+)"\s*\]/.exec(
      typeText,
    );
  if (variantMatch === null) {
    return null;
  }
  let declaration = resolver.decl(variantMatch[1] ?? "");
  if (declaration === null) {
    return null;
  }
  let variantKey = variantMatch[2] ?? "";
  for (let value of resolver.heads(declaration.head)) {
    for (let member of resolver.members(value)) {
      if (member.name === variantKey) {
        return member.type;
      }
    }
  }
  return null;
}
function parseJSDocDefault(
  doc: string,
  control: M.InferredControl,
): string | number | boolean | undefined {
  let defaultMatch =
    /@default\s+(?:`([^`]*)`|"([^"]*)"|'([^']*)'|(\S+))/.exec(doc);
  if (defaultMatch === null) {
    return;
  }
  let rawDefault = (
    defaultMatch[1] ??
    defaultMatch[2] ??
    defaultMatch[3] ??
    defaultMatch[4] ??
    ""
  ).replace(/^["'`]|["'`]$/g, "");
  if (control.kind === "boolean") {
    if (rawDefault === "true") {
      return true;
    } else {
      if (rawDefault === "false") {
        return false;
      } else {
        return undefined;
      }
    }
  }
  if (control.kind === "number") {
    let value: number = Number(rawDefault);
    if (Number.isFinite(value)) {
      return value;
    } else {
      return undefined;
    }
  }
  if (control.kind === "enum") {
    if (control.options?.includes(rawDefault) !== true) {
      return;
    }
    return coerceControlOption(control, rawDefault);
  }
  return rawDefault;
}
function wasTypeInferenceIncomplete(): boolean {
  return typeInferenceIncomplete;
}
function getTypeDeclarationResolver(
  texts: readonly string[],
): M.TypeDeclarationResolver {
  if (
    cachedTypeDeclarationResolver !== null &&
    cachedTypeDeclarationResolver.texts.length === texts.length &&
    cachedTypeDeclarationResolver.texts.every(
      (leftText, rightText): boolean => leftText === texts[rightText],
    )
  ) {
    return cachedTypeDeclarationResolver.rs.reuse();
  }
  let resolver = new TypeDeclarationResolver(texts);
  cachedTypeDeclarationResolver = {
    texts: texts,
    rs: resolver,
  };
  return resolver;
}
function inferComponentPropControls(
  componentName: string,
  texts: readonly (string | undefined)[],
  controlOptions?: { keep?: readonly string[] },
) {
  typeInferenceIncomplete = false;
  let declarationTexts = texts.filter(
    (candidate): candidate is string => typeof candidate === "string" && candidate !== "",
  );
  if (
    !isValidTypeDeclarationName(componentName) ||
    declarationTexts.length === 0
  ) {
    return [];
  }
  let keepProps = new Set(controlOptions?.keep),
    controls = new Map<string, Core.InferredPropControl>(),
    visitedTypes = new Set<string>(),
    resolver = getTypeDeclarationResolver(declarationTexts),
    visitPropsType = (typeName: string, depth: number): void => {
      if (
        depth > MAX_PROPS_INHERITANCE_DEPTH ||
        visitedTypes.has(typeName) ||
        controls.size >= MAX_INFERRED_COMPONENT_PROPS
      ) {
        return;
      }
      visitedTypes.add(typeName);
      let value = resolver.decl(typeName);
      if (value === null || value.kind === "const" || value.kind === "enum") {
        return;
      }
      let referencedTypes =
        value.kind === "interface"
          ? [value.body]
          : resolver.heads(value.head);
      for (let referencedType of referencedTypes) {
        for (let property of resolver.members(referencedType)) {
          resolver.tick();
          if (controls.size >= MAX_INFERRED_COMPONENT_PROPS) {
            break;
          }
          if (
            (OMITTED_COMPONENT_PROPS.has(property.name) &&
              !keepProps.has(property.name)) ||
            (property.name.startsWith("on") && /^on[A-Z]/.test(property.name))
          ) {
            continue;
          }
          if (/@deprecated\b/.test(property.doc)) {
            continue;
          }
          if (/^\s*never\s*$/.test(property.type)) {
            continue;
          }
          let resolvedType = resolver.resolve(property.type, 0);
          if (resolvedType === null) {
            continue;
          }
          let entry = controls.get(property.name);
          if (
            entry !== undefined &&
            !(
              entry.kind === "string" &&
              entry.typeName !== undefined &&
              resolvedType.kind !== "string"
            )
          ) {
            continue;
          }
          let state: Core.InferredPropControl = {
            name: property.name,
            kind: resolvedType.kind,
          };
          if (resolvedType.options !== undefined) {
            state.options = resolvedType.options;
          }
          if (resolvedType.numeric === true) {
            state.numeric = true;
          }
          if (resolvedType.withBool === true) {
            state.withBool = true;
          }
          if (resolvedType.typeName !== undefined) {
            state.typeName = resolvedType.typeName;
          }
          let defaultValue = parseJSDocDefault(property.doc, resolvedType);
          if (defaultValue !== undefined) {
            state.default = defaultValue;
          }
          if (!property.optional) {
            state.required = true;
          }
          controls.set(property.name, state);
        }
      }
      resolver.charge(value.head.length);
      for (let referencedType of referencedTypeNames(value.head)) {
        visitPropsType(referencedType, depth + 1);
      }
    };
  try {
    visitPropsType(componentName + "Props", 0);
  } catch (value: unknown) {
    cachedTypeDeclarationResolver = null;
    if (value !== TYPE_INFERENCE_OVER_BUDGET) {
      throw value;
    }
    typeInferenceIncomplete = true;
    return [];
  }
  let result = [...controls.values()];
  result.sort((leftProp, rightProp): number =>
    leftProp.name === "children" ? -1 : rightProp.name === "children" ? 1 : 0,
  );
  return result;
}
function jsonForInlineScript(jsonValue: M.JsonValue): string {
  return JSON.stringify(jsonValue)!.replaceAll("<", "\\u003c");
}
function generateComponentMountHtml(
  componentName: string,
  mountOptions: M.ComponentMountOptions,
): string {
  let namespace = mountOptions.namespace;
  if (
    !isValidTypeDeclarationName(componentName) ||
    !isValidTypeDeclarationName(namespace)
  ) {
    return (
      '<p style="font:13px system-ui;color:#888;padding:16px">This preview has no window namespace to render ' +
      escapeHtmlAttribute(componentName) +
      " from.</p>"
    );
  }
  let reactGlobal =
      mountOptions.globals.find((globalName) => /^react$/i.test(globalName)) ?? "React",
    domGlobal =
      mountOptions.globals.find((globalName) => /^reactdom$/i.test(globalName)) ??
      "ReactDOM";
  if (
    !isValidTypeDeclarationName(reactGlobal) ||
    !isValidTypeDeclarationName(domGlobal)
  ) {
    return "";
  }
  let configurationJson = jsonForInlineScript({
    ns: namespace,
    name: componentName,
    react: reactGlobal,
    dom: domGlobal,
  });
  return (
    '<style>html,body{margin:0}body{padding:16px;font-family:var(--font-sans,system-ui)}#root{display:flex;flex-wrap:wrap;align-items:center;gap:12px}</style><div id="root"></div><script>window.__dsProps = ' +
    jsonForInlineScript(mountOptions.values) +
    `;<\/script><script>(function () {
  var cfg = ` +
    configurationJson +
    `;
  var R = window[cfg.react], D = window[cfg.dom], NS = window[cfg.ns];
  var root = document.getElementById("root");
  var C = NS && NS[cfg.name];
  if (!R || !D || typeof C !== 'function' && typeof C !== 'object' || C === null) { root.textContent = cfg.name + ' is not exported from window.' + cfg.ns; root.style.cssText = 'font:13px system-ui;color:#888'; return; }
  var props = Object.assign({}, window.__dsProps);
  var kids = props.children; delete props.children;
  var el = kids === undefined || kids === '' ? R.createElement(C, props) : R.createElement(C, props, kids);
  var Root = NS[cfg.ns + 'Root'] || NS.Root || NS.Provider || NS.ThemeProvider;
  var tree = typeof Root === "function" || typeof Root === "object" && Root !== null ? R.createElement(Root, null, el) : el;
  if (typeof D.createRoot === "function") D.createRoot(root).render(tree); else D.render(tree, root);
})();<\/script>`
  );
}
function escapeHtmlAttribute(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
export {
  appendTypeLiteral,
  arrayElementTypeExpression,
  cachedTypeDeclarationResolver,
  clampSingleLineText,
  coerceControlOption,
  commonTokenNamePrefix,
  COMPONENT_CARD_ATTRIBUTE_PATTERN,
  COMPONENT_CARD_HEADER_PATTERN,
  componentCardMetadata,
  conciseTypeDescription,
  createTypeInferenceState,
  DEFAULT_COMPONENT_PREVIEW_HEIGHT,
  enumControlFromLiterals,
  escapeHtmlAttribute,
  findTypeDeclaration,
  generateComponentMountHtml,
  getTypeDeclarationResolver,
  groupColorPaletteTokens,
  groupTokensByName,
  inferComponentPropControls,
  inferEnumDeclaration,
  inferVariantPropsType,
  inlineTypeObjectBodies,
  isValidTypeDeclarationName,
  jsonForInlineScript,
  MAX_COMPONENT_GROUP_LABEL_LENGTH,
  MAX_ENUM_CONTROL_OPTIONS,
  MAX_INFERRED_COMPONENT_PROPS,
  MAX_PROPS_INHERITANCE_DEPTH,
  MAX_REFERENCED_TYPE_NAMES,
  MAX_TEMPLATE_TYPE_EXPANSIONS,
  MAX_TYPE_BODY_MEMBERS,
  MAX_TYPE_INFERENCE_SCANNED_CHARACTERS,
  MAX_TYPE_INFERENCE_WORK,
  MAX_TYPE_RESOLUTION_DEPTH,
  mergeInferredControl,
  MIN_NUMERIC_ENUM_OPTIONS,
  NON_EDITABLE_REACT_TYPES,
  NUMERIC_TOKEN_SUFFIX_PATTERN,
  NUMERIC_TYPE_LITERAL_PATTERN,
  OMITTED_COMPONENT_PROPS,
  PALETTE_GROUP_NAME,
  parseComponentCardHeader,
  parseJSDocDefault,
  parseTypeBodyMembers,
  QUOTED_TYPE_LITERAL_PATTERN,
  referencedTypeNames,
  skipBalancedTypeExpression,
  skipHtmlPreamble,
  splitTokenName,
  splitTypeExpression,
  stripTypeComments,
  TOKEN_NAME_SEPARATOR,
  tokenGroupName,
  tokenHasGroupSuffix,
  TYPE_IDENTIFIER_PATTERN,
  TYPE_INFERENCE_OVER_BUDGET,
  typeDeclarationEnd,
  TypeDeclarationResolver,
  typeInferenceIncomplete,
  typeLiteralSets,
  unwrapTypeExpression,
  wasTypeInferenceIncomplete,
};
export function installModelComponentInference(): () => void {
  return () => {
    DEFAULT_COMPONENT_PREVIEW_HEIGHT = 120;
    MAX_COMPONENT_GROUP_LABEL_LENGTH = 64;
    COMPONENT_CARD_HEADER_PATTERN =
      /^[ \t]*<\!--\s*@dsCard\b((?:(?!--)[^\r\n])*)(?:[\r\n]\s*)?-->/;
    COMPONENT_CARD_ATTRIBUTE_PATTERN =
      /([A-Za-z][A-Za-z0-9_-]*)(?:\s*=\s*(?:"([^"]*)"|([^\s"'<>=]+)))?/g;
    NUMERIC_TOKEN_SUFFIX_PATTERN = /^(.*?)-\d{1,4}$/;
    TOKEN_NAME_SEPARATOR = "-";
    PALETTE_GROUP_NAME = "Palette";
    MAX_INFERRED_COMPONENT_PROPS = 24;
    MAX_REFERENCED_TYPE_NAMES = 32;
    MAX_TYPE_BODY_MEMBERS = 2000;
    MAX_TYPE_INFERENCE_WORK = 50000;
    MAX_TYPE_INFERENCE_SCANNED_CHARACTERS = 268435456;
    TYPE_INFERENCE_OVER_BUDGET = Symbol("over budget");
    MAX_PROPS_INHERITANCE_DEPTH = 4;
    TYPE_IDENTIFIER_PATTERN = /^[A-Za-z_$][\w$]*$/;
    QUOTED_TYPE_LITERAL_PATTERN = /^(?:"([^"\\]*)"|'([^'\\]*)')$/;
    NUMERIC_TYPE_LITERAL_PATTERN = /^-?\d+(?:\.\d+)?$/;
    MAX_TYPE_RESOLUTION_DEPTH = 12;
    MAX_TEMPLATE_TYPE_EXPANSIONS = 64;
    MAX_ENUM_CONTROL_OPTIONS = 400;
    MIN_NUMERIC_ENUM_OPTIONS = 3;
    NON_EDITABLE_REACT_TYPES = new Set([
      "ReactElement",
      "JSX.Element",
      "Element",
      "HTMLElement",
      "ComponentType",
      "FC",
      "FunctionComponent",
      "ElementType",
      "Ref",
      "RefObject",
      "CSSProperties",
    ]);
    typeLiteralSets = new WeakMap();
    TypeDeclarationResolver = class TypeDeclarationResolver {
      readonly texts: readonly string[];
      decls = new Map<string, M.TypeDeclaration | null>();
      named = new Map<string, M.InferredControl | null>();
      busy = new Set<string>();
      readonly textBytes: number;
      constructor(texts: readonly string[]) {
        this.texts = texts;
        this.textBytes = texts.reduce(
          (count, items) => count + items.length,
          0,
        );
      }
      work = 0;
      scanned = 0;
      reuse() {
        this.work = 0;
        this.scanned = 0;
        this.busy.clear();
        this.named.clear();
        return this;
      }
      tick(units = 1): void {
        if ((this.work += units) > MAX_TYPE_INFERENCE_WORK) {
          throw TYPE_INFERENCE_OVER_BUDGET;
        }
      }
      charge(characters: number): void {
        if (
          (this.scanned += characters) > MAX_TYPE_INFERENCE_SCANNED_CHARACTERS
        ) {
          throw TYPE_INFERENCE_OVER_BUDGET;
        }
      }
      headBodies = new Map<string, string[]>();
      heads(typeText: string): string[] {
        let cached = this.headBodies.get(typeText);
        if (cached === undefined) {
          this.charge(typeText.length);
          cached = inlineTypeObjectBodies(typeText);
          this.headBodies.set(typeText, cached);
        }
        this.tick();
        return cached;
      }
      bodies = new Map<string, M.TypeBodyMember[]>();
      members(body: string): M.TypeBodyMember[] {
        let members = this.bodies.get(body);
        if (members === undefined) {
          this.charge(body.length);
          members = parseTypeBodyMembers(body);
          this.bodies.set(body, members);
        }
        this.tick(1 + (members.length >> 4));
        return members;
      }
      decl(name: string): M.TypeDeclaration | null {
        let cached = this.decls.get(name);
        if (cached !== undefined) {
          return cached;
        }
        this.tick(25);
        this.charge(this.textBytes);
        let declaration = findTypeDeclaration(this.texts, name);
        this.decls.set(name, declaration);
        return declaration;
      }
      resolve(typeText: string, depth: number): M.InferredControl | null {
        this.tick();
        let state = createTypeInferenceState();
        this.arms(typeText, depth, state);
        return this.control(state, typeText);
      }
      resolveName(name: string, depth: number): M.InferredControl | null {
        let cached = this.named.get(name);
        if (cached !== undefined) {
          return cached;
        }
        if (this.busy.has(name) || depth > MAX_TYPE_RESOLUTION_DEPTH) {
          return {
            kind: "string",
            typeName: name,
          };
        }
        this.busy.add(name);
        let control: M.InferredControl | null,
          declaration = this.decl(name);
        if (declaration === null) {
          control = NON_EDITABLE_REACT_TYPES.has(name)
            ? null
            : {
                kind: "string",
                typeName: name,
              };
        } else if (declaration.kind === "type") {
          control = this.resolve(declaration.head, depth + 1);
          if (
            control !== null &&
            control.kind === "string" &&
            control.typeName !== undefined &&
            this.decl(control.typeName) === null
          ) {
            control = {
              kind: "string",
              typeName: name,
            };
          }
        } else if (declaration.kind === "enum") {
          control = inferEnumDeclaration(declaration.body);
        } else {
          control = null;
        }
        this.busy.delete(name);
        this.named.set(name, control);
        return control;
      }
      arms(typeText: string, depth: number, state: M.TypeInferenceState): void {
        this.charge(typeText.length);
        for (let value of splitTypeExpression(
          stripTypeComments(typeText),
          "|",
        )) {
          this.tick();
          this.charge(value.length);
          let unwrappedType = unwrapTypeExpression(value);
          if (
            unwrappedType === "" ||
            unwrappedType === "undefined" ||
            unwrappedType === "null" ||
            unwrappedType === "never"
          ) {
            continue;
          }
          let quotedMatch = QUOTED_TYPE_LITERAL_PATTERN.exec(unwrappedType);
          if (quotedMatch !== null) {
            appendTypeLiteral(state, quotedMatch[1] ?? quotedMatch[2] ?? "", true);
            continue;
          }
          if (NUMERIC_TYPE_LITERAL_PATTERN.test(unwrappedType)) {
            appendTypeLiteral(state, unwrappedType);
            continue;
          }
          if (unwrappedType === "boolean" || unwrappedType === "true" || unwrappedType === "false") {
            state.bool = true;
            continue;
          }
          if (unwrappedType === "number") {
            state.num = true;
            continue;
          }
          if (unwrappedType === "string") {
            state.str = true;
            continue;
          }
          if (unwrappedType === "ReactNode" || unwrappedType === "React.ReactNode") {
            state.node = true;
            continue;
          }
          if (unwrappedType.startsWith("`") && unwrappedType.endsWith("`")) {
            let templateOptions = this.template(unwrappedType.slice(1, -1), depth);
            if (templateOptions === null) {
              state.str = true;
            } else {
              for (let option of templateOptions) {
                appendTypeLiteral(state, option);
              }
            }
            continue;
          }
          let specialControl = this.special(unwrappedType, depth);
          if (specialControl !== undefined) {
            mergeInferredControl(state, specialControl);
            continue;
          }
          if (TYPE_IDENTIFIER_PATTERN.test(unwrappedType)) {
            mergeInferredControl(state, this.resolveName(unwrappedType, depth));
            continue;
          }
          state.other = true;
        }
      }
      special(
        typeText: string,
        depth: number,
      ): M.InferredControl | null | undefined {
        let generic = /^([A-Za-z_$][\w$]*)\s*<([\s\S]*)>$/.exec(typeText);
        if (generic !== null) {
          if (depth > MAX_TYPE_RESOLUTION_DEPTH) {
            return null;
          }
          let value = generic[1] ?? "",
            genericArguments = splitTypeExpression(generic[2] ?? "", ",");
          if (value === "NonNullable" && genericArguments.length === 1) {
            return this.resolve(genericArguments[0] ?? "", depth + 1);
          }
          if (
            (value === "Extract" || value === "Exclude") &&
            genericArguments.length === 2
          ) {
            return this.extract(
              value === "Extract",
              genericArguments[0] ?? "",
              genericArguments[1] ?? "",
              depth,
            );
          }
          return null;
        }
        let variantType = inferVariantPropsType(typeText, this);
        if (variantType !== null) {
          return this.resolve(variantType, depth + 1);
        }
        let keyofMatch = /^keyof\s+(typeof\s+)?([A-Za-z_$][\w$]*)$/.exec(
          typeText,
        );
        if (keyofMatch !== null) {
          let value = this.keysOf(
            keyofMatch[2] ?? "",
            keyofMatch[1] !== undefined,
            depth,
          );
          if (value === null) {
            return null;
          } else {
            return enumControlFromLiterals(value);
          }
        }
        let arrayMatch =
          /^\(?\s*typeof\s+([A-Za-z_$][\w$]*)\s*\)?\s*\[\s*number\s*\]$/.exec(
            typeText,
          );
        if (arrayMatch !== null) {
          let value = this.decl(arrayMatch[1] ?? "");
          if (value === null || value.kind !== "const") {
            return null;
          }
          this.charge(value.head.length);
          return this.resolve(
            arrayElementTypeExpression(value.head),
            depth + 1,
          );
        }
        let memberMatch =
          /^([A-Za-z_$][\w$]*)\s*\[\s*(?:"([^"]+)"|'([^']+)')\s*\]$/.exec(
            typeText,
          );
        if (memberMatch !== null) {
          let value = this.memberType(
            memberMatch[1] ?? "",
            memberMatch[2] ?? memberMatch[3] ?? "",
            depth,
          );
          if (value === null) {
            return null;
          } else {
            return this.resolve(value, depth + 1);
          }
        }
        if (typeText.startsWith("typeof ")) {
          return null;
        }
        return;
      }
      extract(
        isExtract: boolean,
        sourceType: string,
        filterType: string,
        depth: number,
      ) {
        let filterState = createTypeInferenceState();
        this.arms(filterType, depth + 1, filterState);
        let sourceState = createTypeInferenceState();
        this.arms(sourceType, depth + 1, sourceState);
        if (isExtract) {
          if (
            sourceState.literals.length === 0 &&
            !sourceState.str &&
            !sourceState.num &&
            !sourceState.bool &&
            filterState.literals.length > 0 &&
            !filterState.str
          ) {
            return enumControlFromLiterals(filterState.literals);
          }
          let state = {
            ...createTypeInferenceState(),
            literals: filterState.str
              ? sourceState.literals
              : sourceState.literals.filter((literal) =>
                  filterState.literals.includes(literal),
                ),
          };
          state.numeric = state.literals.every((literal) =>
            NUMERIC_TYPE_LITERAL_PATTERN.test(literal),
          );
          state.str = sourceState.str && filterState.str;
          state.num = sourceState.num && filterState.num;
          state.bool = sourceState.bool && filterState.bool;
          state.node = sourceState.node && filterState.node;
          return this.control(state, sourceType);
        }
        let excluded = {
          ...sourceState,
          literals: sourceState.literals.filter(
            (literal): boolean => !filterState.literals.includes(literal),
          ),
          unresolved: [...sourceState.unresolved],
        };
        if (filterState.str) {
          excluded.literals = [];
        }
        excluded.numeric = excluded.literals.every((literal) =>
          NUMERIC_TYPE_LITERAL_PATTERN.test(literal),
        );
        if (filterState.bool) {
          excluded.bool = false;
        }
        if (filterState.num) {
          excluded.num = false;
        }
        if (filterState.str) {
          excluded.str = false;
        }
        return this.control(excluded, sourceType);
      }
      keysOf(name: string, isTypeof: boolean, depth: number): string[] | null {
        if (depth > MAX_TYPE_RESOLUTION_DEPTH) {
          return null;
        }
        let declaration = this.decl(name);
        if (declaration === null) {
          return null;
        }
        if (isTypeof) {
          if (declaration.kind !== "const") {
            return null;
          }
          let value = this.heads(declaration.head);
          if (value.length === 0) {
            return null;
          } else {
            return this.members(value[0] ?? "").map((member) => member.name);
          }
        }
        if (declaration.kind === "interface") {
          return this.members(declaration.body).map((member) => member.name);
        }
        if (declaration.kind !== "type") {
          return null;
        }
        this.charge(declaration.head.length);
        let head = unwrapTypeExpression(stripTypeComments(declaration.head)),
          typeOfMatch = /^typeof\s+([A-Za-z_$][\w$]*)$/.exec(head);
        if (typeOfMatch !== null) {
          return this.keysOf(typeOfMatch[1] ?? "", true, depth + 1);
        }
        if (TYPE_IDENTIFIER_PATTERN.test(head)) {
          return this.keysOf(head, false, depth + 1);
        }
        let bodies = this.heads(head);
        if (bodies.length === 0) {
          return null;
        } else {
          return this.members(bodies[0] ?? "").map((member) => member.name);
        }
      }
      memberType(name: string, property: string, depth: number): string | null {
        if (depth > MAX_TYPE_RESOLUTION_DEPTH) {
          return null;
        }
        let declaration = this.decl(name);
        if (declaration === null || declaration.kind === "enum") {
          return null;
        }
        let bodies =
          declaration.kind === "interface"
            ? [declaration.body]
            : this.heads(declaration.head);
        for (let value of bodies) {
          for (let member of this.members(value)) {
            if (member.name === property) {
              return member.type;
            }
          }
        }
        if (declaration.kind === "type") {
          this.charge(declaration.head.length);
          let value = unwrapTypeExpression(stripTypeComments(declaration.head));
          if (TYPE_IDENTIFIER_PATTERN.test(value)) {
            return this.memberType(value, property, depth + 1);
          }
        }
        return null;
      }
      template(templateText: string, depth: number): string[] | null {
        let expansions = [""],
          offset = 0;
        while (offset < templateText.length) {
          let value = templateText.indexOf("${", offset);
          if (value === -1) {
            let suffix = templateText.slice(offset);
            expansions = expansions.map((prefix) => prefix + suffix);
            break;
          }
          let templatePrefix = templateText.slice(offset, value),
            expressionEnd = skipBalancedTypeExpression(templateText, value + 1);
          if (expressionEnd === -1) {
            return null;
          }
          let resolvedEnum = this.resolve(
            templateText.slice(value + 2, expressionEnd - 1),
            depth + 1,
          );
          if (resolvedEnum === null || resolvedEnum.kind !== "enum") {
            return null;
          }
          let enumOptions = resolvedEnum.options ?? [];
          if (
            expansions.length * enumOptions.length >
            MAX_TEMPLATE_TYPE_EXPANSIONS
          ) {
            return null;
          }
          expansions = expansions.flatMap((prefix) =>
            enumOptions.map((option) => prefix + templatePrefix + option),
          );
          offset = expressionEnd;
        }
        return expansions;
      }
      control(
        state: M.TypeInferenceState,
        typeText: string,
      ): M.InferredControl | null {
        let literals = state.literals,
          hasStringOrNode = state.str || state.node;
        if (literals.length > 0 && !hasStringOrNode) {
          if (state.num && literals.length < MIN_NUMERIC_ENUM_OPTIONS) {
            return {
              kind: "string",
              typeName: conciseTypeDescription(typeText),
            };
          }
          if (literals.length > MAX_ENUM_CONTROL_OPTIONS) {
            return {
              kind: "string",
              typeName: conciseTypeDescription(typeText),
            };
          }
          let inferredState: M.InferredControl = {
            kind: "enum",
            options: state.bool ? ["true", "false", ...literals] : literals,
          };
          if (state.bool) {
            inferredState.withBool = true;
          } else if (state.numeric) {
            inferredState.numeric = true;
          }
          return inferredState;
        }
        if (hasStringOrNode) {
          if (!state.str && state.other && state.unresolved.length === 0) {
            return {
              kind: "string",
              typeName: "ReactNode",
            };
          }
          if (state.unresolved.length > 0) {
            return {
              kind: "string",
              typeName: state.unresolved[0],
            };
          } else {
            return {
              kind: "string",
            };
          }
        }
        if (state.num && !state.bool) {
          return {
            kind: "number",
          };
        }
        if (state.bool && !state.num) {
          return {
            kind: "boolean",
          };
        }
        if (state.num && state.bool) {
          return {
            kind: "string",
            typeName: conciseTypeDescription(typeText),
          };
        }
        if (state.unresolved.length > 0) {
          return {
            kind: "string",
            typeName: state.unresolved[0],
          };
        }
        return null;
      }
    };
    OMITTED_COMPONENT_PROPS = new Set([
      "ref",
      "key",
      "render",
      "style",
      "className",
      "id",
      "tabIndex",
      "role",
      "name",
      "form",
      "type",
      "value",
      "defaultValue",
      "suppressHydrationWarning",
    ]);
    cachedTypeDeclarationResolver = null;
    typeInferenceIncomplete = false;
  };
}
