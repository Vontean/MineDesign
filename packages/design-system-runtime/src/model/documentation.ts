import { uiMessage } from '@minedesign/contracts/ui-messages';
import type * as Core from "../contracts";
import type * as M from "../contracts/documentation";
/** Restored application module; prepare first, initialize in original order. */
import { commonTokenNamePrefix, inferComponentPropControls, MAX_COMPONENT_GROUP_LABEL_LENGTH, wasTypeInferenceIncomplete } from "./component-inference";
import { BLOB_ID_PATTERN, COMPONENT_NAME_PATTERN, DESIGN_SYSTEM_PATHS, GENERATED_API_DIRECTORY, GENERATED_API_FILE_HEADER, GENERATED_TOKENS_CSS_PATH, isValidDesignSystemPath, WINDOW_NAMESPACE_PATTERN } from "./file-policy";
import { isPublishableFilePathModelFileTable, parseManifest } from "./file-table";
import { findPackagedLibrary, LIBRARY_NAME_PATTERN, LIBRARY_VERSION_PATTERN, PACKAGED_LIBRARY_PATH_PATTERN } from "./libraries";
import { escapeTokenCssIdentifier, generatedTokensCssForFiles, parseTokens, resolveColorTokenValue } from "./tokens";

var DEFAULT_TOKEN_CARD_MODE: string;
var GENERATED_CONSUMPTION_HEADING: string;
var GENERATED_INDEX_HEADING: string;
var GENERATED_INLINE_TOKENS_HEADING: string;
var GENERATED_README_SEPARATOR: string;
var STANDALONE_MIGRATION_HEADING: string;
var STANDALONE_MIGRATION_PREFIXES: [string, string];
var STANDALONE_CONSUMPTION_GUIDANCE: string;
var OMITTED_API_CARDS_NOTICE: string;
var DOCS_GLOBAL_IDENTIFIER_PATTERN: RegExp;
var sanitizeMarkdownLine: (text: string) => string;
var sanitizeComponentGroupLabel: (text: string) => string;
var MAX_DOCUMENTED_COMPONENTS: number;
var unicodeCharacterCount: (text: string) => number;
var truncateUnicodeText: (text: string, limit: number) => string;
var countSubstring: (text: string, part: string) => number;
var uniqueValues: <Value>(values: readonly Value[]) => Value[];
var formatCardCharacterCount: (count: number) => string;
var markdownCodeSpan: (text: string) => string;
var markdownTableCell: (text: string) => string;
var MARKDOWN_CODE_FENCE: string;
var joinEnglishList: (items: readonly string[]) => string;
var FONT_INSTALL_PATH_SEGMENT_PATTERN: string;
var FONT_INSTALL_PATH_PATTERN: RegExp;
var isInstallableFontPath: (path: string) => boolean;
var OTHER_PAGE_FONT_GUIDANCE: string;
var SLIDES_FONT_GUIDANCE: string;
var fontConsumptionGuide: (
  canvas: boolean,
  slides: boolean,
  fontPaths: readonly string[],
) => string[];
var COLOR_DOCUMENTATION_GROUPS: M.ColorDocumentationGroup[];
var COLOR_INTERACTION_SUFFIX_PATTERN: RegExp;
var PALETTE_RAMP_TOKEN_PATTERN: RegExp;
var makeApiDocumentationCard: (
  kind: string,
  name: string,
  purpose: string,
  path: string,
  lines: readonly string[],
) => M.ApiDocumentationCard;
var cachedComponentApiCards: M.CachedComponentApiCards | null;
var tokenFamilySlug: (name: string) => string;
var assetDocumentationSlug: (name: string) => string;
var normalizeTextNewlines: (text: string) => string;
var LEGACY_QUICK_START_HEADING: string;
var LEGACY_README_INSTRUCTIONS: string;
var escapeRegexPattern: (text: string) => string;
var README_SEPARATOR_PATTERN_SOURCE: string;
var LEGACY_MARKDOWN_FENCE: string;
var GENERATED_README_HEADING_PATTERN_SOURCE: string;
var GENERATED_README_START_PATTERN: RegExp;
var LEGACY_MANIFEST_FENCE_PATTERN_SOURCE: string;
var LEGACY_README_SECTION_PATTERN: RegExp;
var LEGACY_MANIFEST_FENCE_PATTERN: RegExp;
var LEGACY_GENERATED_SECTION_PATTERN: RegExp;
var stringFileOrNull: (files: Core.FileTable, path: string) => string | null;
var CSS_VAR_REFERENCE_PATTERN: RegExp;
var CSS_VAR_DECLARATION_PATTERN: RegExp;
var CSS_PROPERTY_DECLARATION_PATTERN: RegExp;
var firstRegexCaptureValues: (text: string, pattern: RegExp) => string[];
var registeredCssPropertyNames: (css: string) => string[];
var cssReadsTokensCache: M.CssReadsTokensCache[];
var consumptionDocumentationCache: M.ConsumptionDocumentationCache[];
function parseMarkdownFence(line: string): [string, string] {
  let indent: number = 0;
  while (indent < 3 && line.charAt(indent) === " ") {
    indent++;
  }
  let fenceCharacter = line.charAt(indent);
  if (fenceCharacter !== "`" && fenceCharacter !== "~") {
    return ["", ""];
  }
  let fenceEnd: number = indent;
  while (line.charAt(fenceEnd) === fenceCharacter) {
    fenceEnd++;
  }
  let info = line.slice(fenceEnd);
  if (fenceEnd - indent < 3 || /[\r\u2028\u2029]/.test(info)) {
    return ["", ""];
  } else {
    return [line.slice(indent, fenceEnd), info];
  }
}
function inspectStandaloneMigrationGuide(readme: string): {
  both: boolean;
  script: boolean;
} {
  let [canvasPrefix, slidesPrefix] = STANDALONE_MIGRATION_PREFIXES,
    inMigrationSection: boolean = false,
    fence = "",
    sawCanvas: boolean = false,
    sawSlides = false,
    hasScript = false;
  for (let index = 0; index <= readme.length; ) {
    let value = readme.indexOf(
        `
`,
        index,
      ),
      lineEnd = value === -1 ? readme.length : value,
      lineText = readme.slice(
        index,
        readme.charAt(lineEnd - 1) === "\r" && lineEnd > index
          ? lineEnd - 1
          : lineEnd,
      ),
      trimmedLine = lineText.trimEnd();
    index = lineEnd + 1;
    let [fenceMarker, fenceBody] = parseMarkdownFence(lineText);
    if (fence !== "") {
      if (
        fenceMarker !== "" &&
        fenceMarker[0] === fence[0] &&
        fenceMarker.length >= fence.length &&
        fenceBody.trim() === ""
      ) {
        fence = "";
      }
      continue;
    }
    if (fenceMarker !== "" && (fenceMarker[0] !== "`" || !fenceBody.includes("`"))) {
      fence = fenceMarker;
      continue;
    }
    if (trimmedLine.startsWith("## ") || trimmedLine.startsWith("# ")) {
      if (inMigrationSection && sawCanvas && sawSlides) {
        return {
          both: true,
          script: hasScript,
        };
      }
      inMigrationSection = trimmedLine === STANDALONE_MIGRATION_HEADING;
      sawCanvas = false;
      sawSlides = false;
      hasScript = false;
    } else if (inMigrationSection) {
      if (trimmedLine.startsWith(canvasPrefix)) {
        sawCanvas = true;
        hasScript = hasScript || /`project\/[^`]*\.js`/.test(trimmedLine);
      }
      sawSlides = sawSlides || trimmedLine.startsWith(slidesPrefix);
    }
  }
  if (inMigrationSection && sawCanvas && sawSlides) {
    return {
      both: true,
      script: hasScript,
    };
  } else {
    return {
      both: false,
      script: false,
    };
  }
}
function documentationManifestFacts(
  manifest: M.RawDocManifest,
): M.ManifestDocumentationFacts {
  let hasFileList = Array.isArray(manifest.files),
    files = hasFileList
      ? (manifest.files as unknown[]).filter(
          (candidate: unknown): candidate is string => typeof candidate === "string",
        )
      : [],
    fileSet = new Set(files),
    components = Array.isArray(manifest.components)
      ? (manifest.components as (M.RawDocComponent | null | undefined)[])
          .filter(
            (component): component is M.CheckedDocComponent =>
              typeof component?.name === "string" &&
              COMPONENT_NAME_PATTERN.test(component.name),
          )
          .slice(0, MAX_DOCUMENTED_COMPONENTS)
          .map((component) => ({
            name: component.name,
            group:
              typeof component.group === "string"
                ? sanitizeComponentGroupLabel(component.group)
                : "",
            summary:
              typeof component.summary === "string"
                ? sanitizeMarkdownLine(component.summary).trim()
                : "",
            page: component.page === true,
            readme:
              !hasFileList ||
              fileSet.has(
                DESIGN_SYSTEM_PATHS.componentsDir +
                  component.name +
                  "/README.md",
              ),
          }))
      : [],
    hasBundle =
      components.length > 0 &&
      files.includes(DESIGN_SYSTEM_PATHS.bundleJs),
    libraries = (
      Array.isArray(manifest.libraries)
        ? (manifest.libraries as (M.RawDocLibrary | null | undefined)[])
        : []
    )
      .filter(
        (candidate): candidate is M.CheckedDocLibrary =>
          typeof candidate?.name === "string" &&
          LIBRARY_NAME_PATTERN.test(candidate.name) &&
          typeof candidate.version === "string" &&
          LIBRARY_VERSION_PATTERN.test(candidate.version),
      )
      .map((library) => {
        let value: string | undefined =
          typeof library.global === "string"
            ? library.global
            : findPackagedLibrary(library.name)?.provides[0];
        return {
          name: library.name,
          version: library.version,
          file:
            typeof library.file === "string" &&
            PACKAGED_LIBRARY_PATH_PATTERN.test(library.file)
              ? library.file
              : null,
          global:
            typeof value === "string" &&
            DOCS_GLOBAL_IDENTIFIER_PATTERN.test(value)
              ? value
              : null,
        };
      });
  return {
    ns:
      typeof manifest.namespace === "string" &&
      WINDOW_NAMESPACE_PATTERN.test(manifest.namespace)
        ? manifest.namespace
        : null,
    comps: components,
    libs: libraries,
    bundle: hasBundle,
    listed: hasFileList,
    css: files.includes(DESIGN_SYSTEM_PATHS.bundleCss),
    dts: files.includes(DESIGN_SYSTEM_PATHS.indexDts),
    tokensCss:
      !hasFileList || files.includes(GENERATED_TOKENS_CSS_PATH),
    icon:
      components.find((component) => /^icons?$/i.test(component.name))?.name ?? null,
  };
}
function humanizeFamilyName(key: string): string {
  let humanized = key
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/[-_]+/g, " ")
    .trim()
    .toLowerCase();
  return humanized.charAt(0).toUpperCase() + humanized.slice(1);
}
function generateComponentApiCards(
  declarationText: string | null,
  facts: M.ManifestDocumentationFacts,
): M.ComponentApiCards {
  let cacheKey = JSON.stringify([
    facts.ns,
    facts.css,
    facts.bundle,
    facts.icon,
    facts.comps,
  ]);
  if (
    cachedComponentApiCards !== null &&
    cachedComponentApiCards.dts === declarationText &&
    cachedComponentApiCards.key === cacheKey
  ) {
    return cachedComponentApiCards.out;
  }
  let qualifiedName = (name: string): string =>
      (facts.ns !== null ? facts.ns + "." : "") + name,
    lines = (declarationText ?? "").split(`
`),
    lineCount = lines.length,
    declarationPattern: RegExp =
      /^(?:export )?(?:declare )?(interface|type|const|function|class|namespace) ([A-Za-z_$][\w$]*)/,
    declarations = new Map<string, M.DocDeclarationRange[]>();
  for (let index = 0; index < lineCount; ) {
    let value = declarationPattern.exec(lines[index]);
    if (!value) {
      index++;
      continue;
    }
    let declarationKind = value[1],
      declarationName = value[2],
      braceDepth = 0,
      lineIndex = index;
    while (lineIndex < lineCount) {
      let line = lines[lineIndex],
        trimmedLine = line.trimEnd(),
        lineStart = trimmedLine.trimStart();
      if (
        lineIndex > index &&
        (lineStart.startsWith("*") ||
          lineStart.startsWith("/*") ||
          lineStart.startsWith("//"))
      ) {
        lineIndex++;
        continue;
      }
      braceDepth +=
        countSubstring(line, "{") -
        countSubstring(line, "}") +
        countSubstring(line, "(") -
        countSubstring(line, ")");
      if (braceDepth <= 0 && (trimmedLine.endsWith(";") || trimmedLine.endsWith("}"))) {
        break;
      }
      lineIndex++;
    }
    let commentStart = index;
    while (commentStart > 0) {
      let previousLine = lines[commentStart - 1].trim();
      if (!(previousLine.startsWith("*") || previousLine.startsWith("/**"))) {
        break;
      }
      commentStart--;
    }
    if (!declarations.has(declarationName)) {
      declarations.set(declarationName, []);
    }
    declarations.get(declarationName)!.push([declarationKind, commentStart, index, lineIndex]);
    index = lineIndex + 1;
  }
  let firstDeclaration = (name: string) => declarations.get(name)?.[0],
    joinJSDoc = (jsdocLines: readonly string[]): string => {
      let items = [];
      for (let value of jsdocLines) {
        let line = value
          .trim()
          .replace(/^\/\*\*\s?|\*\/$|^\*\s?/g, "")
          .trim();
        if (line) {
          items.push(line);
        }
      }
      return items.join(" ");
    },
    declarationDoc = (name: string): string => {
      let value = firstDeclaration(name);
      if (value === undefined) {
        return "";
      } else {
        return joinJSDoc(lines.slice(value[1], value[2]));
      }
    },
    constTuples = new Map<string, string[]>(),
    typeAliases = new Map<string, string>();
  for (let [value, declarationsForName] of declarations) {
    for (let [declarationKind, , startLine, endLine] of declarationsForName) {
      if (declarationKind === "const") {
        let tupleMatch = /readonly \[([^\]]*)\]/.exec(
          lines.slice(startLine, endLine + 1).join(`
`),
        );
        if (tupleMatch) {
          constTuples.set(
            value,
            tupleMatch[1]
              .split(",")
              .map((item) => item.trim())
              .filter((item): boolean => item !== "")
              .map((item) => item.replace(/^"+|"+$/g, "")),
          );
        }
      } else if (declarationKind === "type") {
        let aliasMatch =
          /^(?:export )?(?:declare )?type [\w$]+(?:<[^\n=]*?>)? = ([^\n]+);$/.exec(
            lines
              .slice(startLine, endLine + 1)
              .map((item) => item.trim())
              .filter(
                (line) => !line.startsWith("*") && !line.startsWith("/**"),
              )
              .join(" ")
              .replace(/\/\*[\s\S]*?\*\//g, " ")
              .replace(/\s+/g, " "),
          );
        if (aliasMatch) {
          typeAliases.set(value, aliasMatch[1].trim());
        }
      }
    }
  }
  let expandType = (items: string, depth = 0): string => {
      items = items.trim().replace(/import\("react"\)\./g, "React.");
      remainingWork -= items.length / 512;
      if (depth > 3 || remainingWork < 0) {
        return items;
      }
      let value = /^\(typeof (\w+)\)\[number\]$/.exec(items),
        tupleValues = value ? constTuples.get(value[1]) : undefined;
      if (tupleValues) {
        return tupleValues.map((item): string => '"' + item + '"').join(" | ");
      }
      let alias = items !== "IconName" ? typeAliases.get(items) : undefined;
      if (alias !== undefined && unicodeCharacterCount(alias) < 400) {
        let expandedAlias = expandType(alias, depth + 1);
        if (unicodeCharacterCount(expandedAlias) > 1400) {
          return items;
        } else {
          return expandedAlias;
        }
      }
      let utilityMatch = /^(Exclude|Extract)<([\s\S]+)>$/.exec(items);
      if (utilityMatch !== null) {
        let [leftType, rightType] = splitAtDepthZero(utilityMatch[2], ","),
          callback = (typeText: string) =>
            /^(?:"[^"]*"|-?\d[\d.]*|true|false|null|undefined)(?:\s*\|\s*(?:"[^"]*"|-?\d[\d.]*|true|false|null|undefined))*$/.test(
              typeText,
            ),
          leftPart =
            leftType !== undefined ? expandType(leftType, depth + 1) : "",
          rightPart =
            rightType !== undefined ? expandType(rightType, depth + 1) : "";
        if (callback(leftPart) && callback(rightPart)) {
          let values = new Set(splitAtDepthZero(rightPart, "|")),
            filteredParts = splitAtDepthZero(leftPart, "|").filter(
              (part): boolean =>
                (utilityMatch[1] === "Exclude") !== values.has(part),
            );
          if (filteredParts.length > 0) {
            return filteredParts.join(" | ");
          }
        }
        return items;
      }
      if (items.startsWith("Omit<")) {
        return items;
      }
      if (
        items.includes("|") &&
        !items.includes("(") &&
        !items.includes("{") &&
        !items.includes("<")
      ) {
        let parts = items.split("|").map((part) => part.trim());
        return uniqueValues(
          parts.map((part) =>
            /^[A-Z]\w+$/.test(part) ? expandType(part, depth + 1) : part,
          ),
        ).join(" | ");
      }
      return items;
    },
    propertyPattern: RegExp =
      /^\s*(?:readonly )?"?([\w\-]+)"?(\?)?:\s*([\s\S]*?);?\s*$/,
    methodPattern: RegExp =
      /^\s*(?:readonly )?"?([\w\-]+)"?(\?)?(\([\s\S]*);?\s*$/,
    omittedStandardProps = new Set([
      "className",
      "data-testid",
      "style",
      "ref",
      "key",
    ]),
    keepAllProps = new Set<string>(),
    maxUnionArms: number = 32,
    maxProps: number = 160,
    maxTypeTextLength: number = 700,
    externalTypePattern: RegExp =
      /^(?:HTML\w*|React|(?:Omit|Pick|Partial|Readonly|Record|Array|ReadonlyArray|Required|NonNullable|Exclude|Extract|Parameters|ReturnType)(?![\w$]))/,
    identifierPattern: RegExp = /^[A-Za-z_$][\w$]*$/,
    importsByAlias = new Map<string, M.DocImportName>();
  for (let value of lines.slice(0, 200)) {
    let importDeclaration = /^import (?:type )?\{([^}]*)\} from "([^"]+)"/.exec(value);
    if (importDeclaration) {
      for (let importText of importDeclaration[1].split(",")) {
        let importMatch = /^\s*([\w$]+)(?:\s+as\s+([\w$]+))?\s*$/.exec(importText);
        if (importMatch) {
          importsByAlias.set(importMatch[2] ?? importMatch[1], {
            name: importMatch[1],
            from: importDeclaration[2],
          });
        }
      }
    }
  }
  let describeExternalType = (externalTypeName: string, depth = 0): string => {
      let value = externalTypeName.replace(
        /\bimport\("([^"]+)"\)\.([\w$.]+)/g,
        (typeName: string, alias: string, renderContext: string): string =>
          renderContext + " (" + alias + ")",
      );
      value = value.replace(
        /\bComponentProps(?:WithoutRef|WithRef)?<typeof ([\w$.]+)>/g,
        (typeName: string, alias: string): string => alias + " props",
      );
      value = value.replace(
        /\b([A-Za-z_][\w]*(?:\$\d+)?)((?:\.[\w$]+)*)(?![\w$])/g,
        (typeName: string, importAlias: string, renderContext: string) => {
          let entry = importsByAlias.get(importAlias);
          if (entry !== undefined) {
            if (renderContext !== "" || /\$\d+$/.test(importAlias)) {
              return entry.name + renderContext + " (" + entry.from + ")";
            } else {
              return typeName;
            }
          }
          if (depth < 2 && firstDeclaration(importAlias)?.[0] === "type") {
            let typeAlias = (typeAliases.get(importAlias) ?? "").trim();
            if (
              typeAlias !== "" &&
              /^[\w$]+(?:\.[\w$]+)*(?:<[^<>]*>)?$|^ComponentProps/.test(
                typeAlias,
              ) &&
              [...importsByAlias.keys()].some((alias) =>
                new RegExp("\\b" + alias.replace(/\$/g, "\\$") + "\\b").test(
                  typeAlias,
                ),
              )
            ) {
              return describeExternalType(typeAlias, depth + 1) + renderContext;
            }
          }
          if (/\$\d+$/.test(importAlias)) {
            return importAlias.replace(/\$\d+$/, "") + renderContext;
          } else {
            return typeName;
          }
        },
      );
      return value;
    },
    exportsByName = new Map<string, string>();
  for (let [value, declarationsForName] of declarations) {
    if (declarationsForName.some((declaration) => lines[declaration[2]].startsWith("export "))) {
      exportsByName.set(value, value);
    }
  }
  for (let value of lines) {
    if (!value.startsWith("export {")) {
      continue;
    }
    for (let exportName of value.replace(/^export \{|\};?\s*$/g, "").split(",")) {
      let exportMatch = /^\s*(?:type\s+)?([\w$]+)(?:\s+as\s+([\w$]+))?\s*$/.exec(
        exportName,
      );
      if (exportMatch) {
        exportsByName.set(exportMatch[1], exportMatch[2] ?? exportMatch[1]);
      }
    }
  }
  let hasExportList: boolean = exportsByName.size > 0,
    splitAtDepthZero = (items: string, delimiter: string) => {
      let segments = [],
        index: number = 0,
        segmentStart = 0;
      for (let delimiterIndex: number = 0; delimiterIndex < items.length; delimiterIndex++) {
        let value = items[delimiterIndex];
        if (
          value === "<" ||
          value === "(" ||
          value === "[" ||
          value === "{"
        ) {
          index++;
        } else if (
          (value === ">" && items[delimiterIndex - 1] !== "=") ||
          value === ")" ||
          value === "]" ||
          value === "}"
        ) {
          index = Math.max(0, index - 1);
        } else if (value === delimiter && index === 0) {
          segments.push(items.slice(segmentStart, delimiterIndex));
          segmentStart = delimiterIndex + 1;
        }
      }
      segments.push(items.slice(segmentStart));
      return segments
        .map((part) => part.trim())
        .filter((part): boolean => part !== "");
    },
    splitTypeArguments = (typeText: string) => splitAtDepthZero(typeText, ","),
    findTopLevelDelimiter = (items: string, delimiter: string): number => {
      let index: number = 0;
      for (let delimiterIndex: number = 0; delimiterIndex < items.length; delimiterIndex++) {
        let value = items[delimiterIndex];
        if (
          value === "<" ||
          value === "(" ||
          value === "[" ||
          value === "{"
        ) {
          index++;
        } else if (
          (value === ">" && items[delimiterIndex - 1] !== "=") ||
          value === ")" ||
          value === "]" ||
          value === "}"
        ) {
          index = Math.max(0, index - 1);
        } else if (
          value === delimiter &&
          index === 0 &&
          items[delimiterIndex + 1] !== ">"
        ) {
          return delimiterIndex;
        }
      }
      return -1;
    },
    isWrappedExpression = (items: string): boolean => {
      let index: number = 0;
      for (let delimiterIndex: number = 0; delimiterIndex < items.length; delimiterIndex++) {
        let value = items[delimiterIndex];
        if (value === "(") {
          index++;
        } else if (value === ")") {
          index--;
          if (index === 0 && delimiterIndex < items.length - 1) {
            return false;
          }
        }
      }
      return index === 0;
    },
    unwrap = (typeText: string) => {
      let value = typeText.trim();
      for (
        let index: number = 0;
        index < 8 &&
        value.startsWith("(") &&
        value.endsWith(")") &&
        isWrappedExpression(value);
        index++
      ) {
        value = value.slice(1, -1).trim();
      }
      return value;
    },
    mergeUnion = (leftType: string, rightType: string) => {
      let values = new Set(
        [
          ...splitAtDepthZero(leftType, "|"),
          ...splitAtDepthZero(rightType, "|"),
        ].filter((part): boolean => part !== "never"),
      );
      if (
        (values.has("true") && values.has("false")) ||
        values.has("boolean")
      ) {
        values.delete("true");
        values.delete("false");
        values.add("boolean");
      }
      return [...values].join(" | ");
    },
    summarizeInlineObject = (items: string): string =>
      (remainingWork -= items.length / 512) < 0
        ? truncateUnicodeText(items, 80) + "…"
        : splitAtDepthZero(items, "|")
            .map((part) => {
              let value = part.trim();
              if (!(value.startsWith("{") && value.endsWith("}"))) {
                return expandType(value);
              }
              return (
                "{ " +
                splitAtDepthZero(value.slice(1, -1), ";")
                  .map((row): null | string => {
                    let rowMatch =
                      /^(?:readonly )?"?([\w\-]+)"?(\??):\s*([\s\S]*)$/.exec(
                        row.replace(/\/\*[\s\S]*?\*\//g, "").trim(),
                      );
                    if (rowMatch === null) {
                      return null;
                    }
                    let expandedType = expandType(rowMatch[3].replace(/\s+/g, " "));
                    return (
                      rowMatch[1] +
                      rowMatch[2] +
                      (unicodeCharacterCount(expandedType) <= 32
                        ? ": " + expandedType
                        : "")
                    );
                  })
                  .filter((row): boolean => row !== null)
                  .join("; ") +
                " }"
              );
            })
            .join(" | "),
    parsePropRows = (
      declarationLines: readonly string[],
      omittedProps: ReadonlySet<string>,
    ): M.DocPropRow[] => {
      let items: M.DocPropRow[] = [],
        docLines: string[] = [],
        propLines: string[] = [],
        index = 0,
        propCount: number = 0;
      for (let value of declarationLines) {
        let trimmedLine = value.trim(),
          docMatch =
            propLines.length === 0
              ? /^\/\*\*([\s\S]*?)\*\/\s*(?=\S)/.exec(trimmedLine)
              : null;
        if (docMatch !== null) {
          docLines = [docMatch[1]];
          trimmedLine = trimmedLine.slice(docMatch[0].length);
          value = "  " + trimmedLine;
        }
        if (
          propLines.length === 0 &&
          (trimmedLine.startsWith("/**") ||
            trimmedLine.startsWith("*") ||
            trimmedLine.startsWith("//"))
        ) {
          if (!trimmedLine.startsWith("//")) {
            docLines.push(trimmedLine);
          }
          continue;
        }
        if (
          propLines.length === 0 &&
          (trimmedLine === "" || /^[})\]|&,;({]*$/.test(trimmedLine))
        ) {
          docLines = [];
          index = 0;
          continue;
        }
        propLines.push(value);
        index +=
          countSubstring(value, "{") +
          countSubstring(value, "(") +
          countSubstring(value, "[") -
          countSubstring(value, "}") -
          countSubstring(value, ")") -
          countSubstring(value, "]");
        if (index > 0 && propLines.length < 80) {
          continue;
        }
        let propText = propLines.join(`
`);
        propLines = [];
        index = 0;
        let docText = joinJSDoc(docLines).replace(/\s+/g, " ");
        docLines = [];
        if (++propCount > maxProps * 4) {
          break;
        }
        let propertyMatch = propertyPattern.exec(propText),
          methodMatch = propertyMatch === null ? methodPattern.exec(propText) : null;
        if (propertyMatch === null && methodMatch === null) {
          continue;
        }
        let propName = (propertyMatch ?? methodMatch)![1],
          isOptional: boolean = (propertyMatch ?? methodMatch)![2] !== undefined,
          propType =
            propertyMatch !== null
              ? propertyMatch[3].replace(/\s*\n\s*/g, " ").trim()
              : methodMatch![3]
                  .replace(/;\s*$/, "")
                  .replace(/\s*\n\s*/g, " ")
                  .replace(/\):\s*/, ") => ");
        if (
          omittedProps.has(propName) ||
          propType === "never" ||
          docText.includes("@internal")
        ) {
          continue;
        }
        let normalizedType = propType.includes("{")
          ? summarizeInlineObject(
              truncateUnicodeText(propType, maxTypeTextLength * 2),
            )
          : expandType(truncateUnicodeText(propType, maxTypeTextLength * 2));
        items.push([
          propName,
          isOptional ? "" : "*",
          unicodeCharacterCount(normalizedType) > maxTypeTextLength
            ? truncateUnicodeText(normalizedType, maxTypeTextLength) + "…"
            : normalizedType,
          unicodeCharacterCount(docText) > maxTypeTextLength
            ? truncateUnicodeText(docText, maxTypeTextLength) + "…"
            : docText,
        ]);
        if (items.length >= maxProps) {
          break;
        }
      }
      return items;
    },
    variantPropRows = (componentName: string): M.DocPropRow[] => {
      let value = (declarations.get(componentName) ?? []).find(
        (declaration): boolean => declaration[0] === "const",
      );
      if (
        value === undefined ||
        !/\(props\?: \(\{\s*$/.test(lines[value[2]])
      ) {
        return [];
      }
      let componentLines = lines.slice(value[2] + 1, value[3] + 1);
      if (!chargeLines(componentLines)) {
        return [];
      }
      return parsePropRows(componentLines, keepAllProps).map((propRow) => [
        propRow[0],
        "",
        splitAtDepthZero(propRow[2], "|")
          .filter((unionPart) => unionPart !== "null" && unionPart !== "undefined")
          .join(" | "),
        propRow[3],
      ]);
    },
    maxWork: number = 20000,
    remainingWork = maxWork,
    tooWide: boolean = false,
    wideTypeSentinel: string = "\x00wide",
    chargeLines = (items: readonly string[]): boolean => {
      let index = 0;
      for (let value of items) {
        index += value.length;
      }
      remainingWork -= index / 512 + items.length / 8;
      return remainingWork >= 0;
    },
    resolvePropExpression = (
      expression: string,
      visitedTypes: Set<string>,
      omittedProps: ReadonlySet<string>,
      origins: string[],
    ): M.DocPropRow[] => {
      if (--remainingWork < 0) {
        tooWide = true;
        return [];
      }
      let unionText = unwrap(expression.trim()),
        unionParts = uniqueValues(splitAtDepthZero(unionText, "|"));
      if (unionParts.length > maxUnionArms) {
        tooWide = true;
        return [];
      }
      if (unionParts.length > 1) {
        let resolvedRows = unionParts.map((option) =>
          resolvePropExpression(
            option,
            new Set(visitedTypes),
            omittedProps,
            origins,
          ).slice(0, maxProps),
        );
        if (resolvedRows.every((items): boolean => items.length === 0)) {
          return [];
        }
        let uniqueRows = uniqueValues(
          resolvedRows.flat().map((row) => row[0]),
        ).slice(0, maxProps);
        remainingWork -= (uniqueRows.length * resolvedRows.length * maxProps) / 4096;
        if (remainingWork < 0) {
          tooWide = true;
          return [];
        }
        return uniqueRows.map((rowName) => {
          let rowGroups = resolvedRows
              .map((candidateRow) =>
                candidateRow.find((matchingRow): boolean => matchingRow[0] === rowName),
              )
              .filter(
                (row): row is M.DocPropRow => row !== undefined,
              ),
            allOptional: boolean =
              rowGroups.length ===
              resolvedRows.filter((items): boolean => items.length > 0).length;
          return [
            rowName,
            allOptional && rowGroups.every((row): boolean => row[1] === "*")
              ? "*"
              : "",
            rowGroups.map((row) => row[2]).reduce(mergeUnion),
            rowGroups.find((row): boolean => row[3] !== "")?.[3] ?? "",
          ];
        });
      }
      let intersectionParts = splitAtDepthZero(unionText, "&").map(unwrap);
      if (intersectionParts.length > 1) {
        return mergePropRows(
          intersectionParts.flatMap((part) =>
            resolvePropExpression(part, visitedTypes, omittedProps, origins).map(
              (row) => [row, "own"],
            ),
          ),
        );
      }
      let baseExpression = intersectionParts[0] ?? "";
      if (baseExpression.startsWith("{")) {
        let objectBody = baseExpression.slice(1, baseExpression.lastIndexOf("}"));
        return parsePropRows(
          objectBody.includes(`
`)
            ? objectBody.split(`
`)
            : splitAtDepthZero(objectBody, ";").map(
                (line): string => "  " + line + ";",
              ),
          omittedProps,
        );
      }
      if (baseExpression !== unionText && baseExpression.includes("|")) {
        return resolvePropExpression(baseExpression, visitedTypes, omittedProps, origins);
      }
      let variantMatch = /^VariantProps<typeof ([\w$]+)>$/.exec(baseExpression);
      if (variantMatch !== null) {
        return variantPropRows(variantMatch[1]);
      }
      let genericMatch =
          /^(\w*Omit|Pick|Partial|Readonly|Required)<\s*([A-Za-z_$][\w$]*)\s*(?:<(?:[^<>]|<[^<>]*>)*>)?\s*(?:,([\s\S]*))?>$/.exec(
            baseExpression,
          ),
        resolvedTypeName = genericMatch !== null ? genericMatch[2] : baseExpression.split("<")[0].trim(),
        declarationKind = identifierPattern.test(resolvedTypeName)
          ? firstDeclaration(resolvedTypeName)?.[0]
          : undefined;
      if (
        !(declarationKind === "interface" || declarationKind === "type") ||
        externalTypePattern.test(resolvedTypeName)
      ) {
        if (/^[A-Za-z_$][\w$.]*(?:<[\s\S]*>)?(?:\[[^\]]*\])?$/.test(baseExpression)) {
          origins.push(baseExpression);
        }
        return [];
      }
      let [namedRows, inheritedRows] = resolveNamedProps(resolvedTypeName, visitedTypes, omittedProps);
      if (genericMatch !== null && namedRows.length === 0) {
        origins.push(baseExpression);
        return [];
      }
      if (genericMatch !== null) {
        let values = new Set(
          [...(genericMatch[3] ?? "").matchAll(/"([^"]+)"/g)].map(
            (row) => row[1],
          ),
        );
        if (genericMatch[1].endsWith("Omit")) {
          namedRows = namedRows.filter(
            (row): boolean => !values.has(row[0]),
          );
        } else if (genericMatch[1] === "Pick") {
          namedRows = namedRows.filter((row) => values.has(row[0]));
        } else if (genericMatch[1] === "Partial") {
          namedRows = namedRows.map((row) => [
            row[0],
            "",
            row[2],
            row[3],
          ]);
        }
      }
      origins.push(...inheritedRows);
      return namedRows;
    },
    mergePropRows = (origins: readonly M.DocPropOrigin[]): M.DocPropRow[] => {
      let entries = new Map<string, M.DocPropRow>();
      for (let [value] of origins) {
        let entry = entries.get(value[0]);
        entries.set(
          value[0],
          entry === undefined
            ? value
            : [value[0], value[1], value[2], value[3] || entry[3]],
        );
      }
      return [...entries.values()];
    },
    resolveNamedProps = (
      componentName: string,
      visitedTypes = new Set<string>(),
      omittedProps: ReadonlySet<string> = omittedStandardProps,
    ): M.DocResolvedProps => {
      let value = firstDeclaration(componentName);
      if (visitedTypes.size === 0) {
        tooWide = false;
      }
      if (visitedTypes.has(componentName) || value === undefined || visitedTypes.size > 40) {
        return [[], [], null];
      }
      if (--remainingWork < 0) {
        return [[], [], wideTypeSentinel];
      }
      visitedTypes.add(componentName);
      let items: string[] = [],
        declarationLines = lines.slice(value[2], value[3] + 1);
      if (!chargeLines(declarationLines)) {
        return [[], [], wideTypeSentinel];
      }
      let firstLine = declarationLines[0].replace(
          new RegExp(
            "^((?:export )?(?:declare )?(?:interface|type) " +
              componentName.replace(/\$/g, "\\$") +
              ")<(?:[^<>]|<[^<>]*>)*>",
          ),
          "$1",
        ),
        propRows: M.DocPropRow[];
      if (value[0] === "type") {
        let signature = [firstLine, ...declarationLines.slice(1)].join(`
`);
        propRows = resolvePropExpression(
          signature
            .slice(findTopLevelDelimiter(signature, "=") + 1)
            .replace(/;\s*$/, ""),
          visitedTypes,
          omittedProps,
          items,
        );
      } else {
        let baseProps: M.DocPropOrigin[] = [];
        for (let extendsMatch of firstLine.matchAll(/\bextends ([^{]+)\{/g)) {
          for (let baseTypeName of splitTypeArguments(extendsMatch[1])) {
            baseProps.push(
              ...resolvePropExpression(baseTypeName, visitedTypes, omittedProps, items).map(
                (baseType): M.DocPropOrigin => [baseType, "base"],
              ),
            );
          }
        }
        let objectMatch =
          declarationLines.length === 1
            ? /\{([^{}]*)\}\s*\)?;?\s*$/.exec(firstLine)
            : null;
        baseProps.push(
          ...parsePropRows(
            objectMatch !== null
              ? objectMatch[1]
                  .split(";")
                  .map((line): string => "  " + line.trim() + ";")
              : declarationLines.slice(1),
            omittedProps,
          ).map((line): M.DocPropOrigin => [line, "own"]),
        );
        propRows = mergePropRows(baseProps);
      }
      if (propRows.length > maxProps) {
        propRows = propRows.slice(0, maxProps);
      }
      let propType =
          propRows.length === 0 && !tooWide
            ? declarationLines.map((line) => line.trim()).join(" ")
            : "",
        inlineProps =
          tooWide && propRows.length === 0
            ? wideTypeSentinel
            : value[0] === "type" &&
                propRows.length === 0 &&
                !propType.includes("{")
              ? propType
                  .slice(findTopLevelDelimiter(propType, "=") + 1)
                  .replace(/;\s*$/, "")
                  .trim() || null
              : null;
      return [propRows, uniqueValues(items), inlineProps];
    },
    propsNamePattern: RegExp =
      /\b((?:import\("[^"]+"\)\.)?[A-Z][\w$]*(?:\.[A-Z][\w$]*)*?(?:\.Props|Props(?:\$\d+)?))\b/,
    componentPropsType = (componentName: string): string | null => {
      if (declarations.has(componentName + "Props")) {
        return componentName + "Props";
      }
      if (declarations.has(componentName + "RootProps")) {
        return componentName + "RootProps";
      }
      for (let value of declarations.get(componentName) ?? []) {
        if (value[0] !== "function" && value[0] !== "const") {
          continue;
        }
        let propsType =
          value[0] === "function"
            ? lines.slice(value[2], value[3] + 1).join(`
`)
            : lines[value[2]].includes("{")
              ? lines[value[2]].slice(0, lines[value[2]].indexOf("{"))
              : lines[value[2]];
        for (let propsMatch of propsType.matchAll(
          /\b([A-Z][\w$]*Props(?:\$\d+)?)\b(?!\.)/g,
        )) {
          let declarationKind = firstDeclaration(propsMatch[1])?.[0];
          if (declarationKind === "interface" || declarationKind === "type") {
            return propsMatch[1];
          }
        }
        let importedProps = propsNamePattern.exec(
          propsType.replace(/RefAttributes<[^>]*>/g, ""),
        )?.[1];
        if (
          importedProps !== undefined &&
          firstDeclaration(importedProps) === undefined &&
          /[.$]|^import/.test(importedProps) &&
          !/^(?:import\("react"\)|React)\./.test(importedProps) &&
          inlineComponentProps(componentName).length === 0
        ) {
          return importedProps;
        }
      }
      return null;
    },
    wrappedComponentType = (componentName: string): string | null => {
      for (let value of declarations.get(componentName) ?? []) {
        if (value[0] !== "const") {
          continue;
        }
        let wrappedMatch = /:\s*typeof ([\w$]+)\s*&/.exec(lines[value[2]]);
        if (wrappedMatch) {
          return wrappedMatch[1];
        }
      }
      return null;
    },
    inlineComponentProps = (
      componentName: string,
      preferredOptions?: readonly string[],
    ): M.DocPropRow[] => {
      let value = (declarations.get(componentName) ?? []).find(
          (declaration) => declaration[0] === "function" || declaration[0] === "const",
        ),
        declarationLines =
          preferredOptions ??
          (value === undefined ? [] : lines.slice(value[2], value[3] + 1));
      if (declarationLines.length === 0) {
        return [];
      }
      if (
        preferredOptions === undefined &&
        /^(?:export )?declare const [\w$]+:\s*(?:typeof [\w$]+\s*&\s*)?\{\s*$/.test(
          declarationLines[0].trim(),
        )
      ) {
        return [];
      }
      let propsMatch =
        declarationLines.length === 1
          ? /[)}\w>]\s*[:&<]\s*\{([^{}]*)\}\s*[)>&]/.exec(declarationLines[0])
          : null;
      if (propsMatch !== null) {
        return parsePropRows(
          propsMatch[1]
            .split(";")
            .map((line): string => "  " + line.trim() + ";"),
          omittedStandardProps,
        );
      }
      let propsStart = declarationLines.findIndex(
        (line: string, lineIndex: number) =>
          /(?:\}\s*:|\bprops\??\s*:|&|<)\s*\{\s*$/.test(line) &&
          !(
            lineIndex === 0 &&
            /^(?:export )?declare const \w+: \{\s*$/.test(line.trim())
          ),
      );
      if (propsStart === -1) {
        return [];
      }
      let index = 0,
        propsEnd = propsStart + 1;
      for (let lineIndex = propsStart; lineIndex < declarationLines.length; lineIndex++) {
        index +=
          countSubstring(declarationLines[lineIndex], "{") -
          countSubstring(declarationLines[lineIndex], "}");
        if (lineIndex > propsStart && index <= 0) {
          propsEnd = lineIndex;
          break;
        }
        propsEnd = lineIndex + 1;
      }
      return parsePropRows(
        declarationLines.slice(propsStart + 1, propsEnd),
        omittedStandardProps,
      );
    },
    componentParts = (componentName: string): M.DocComponentParts => {
      let callback = (
        typeText: string,
        typeOptions: readonly string[] | null,
      ): [string | null, M.DocPropRow[] | null] => {
        let typeofMatch = /\btypeof ([\w$]+(?:\.[\w$]+)*)/.exec(typeText)?.[1];
        if (typeofMatch !== undefined && typeofMatch.includes(".")) {
          return [typeofMatch + ".Props", null];
        }
        let resolvedPropsType = typeofMatch,
          propsDeclaration = resolvedPropsType !== undefined ? componentPropsType(resolvedPropsType) : null,
          inlineDeclaration =
            resolvedPropsType !== undefined
              ? ""
              : typeText.replace(/RefAttributes<[^>]*>/g, "");
        if (resolvedPropsType === undefined && /^\s*\(/.test(typeText)) {
          let joinedOptions = (typeOptions ?? [typeText]).join(`
`),
            namedType =
              /\(\s*[\w$]+\s*:\s*([A-Z][\w$.]*(?:<[^>]*>)?)\s*\)\s*=>/.exec(
                joinedOptions,
              )?.[1];
          if (namedType !== undefined) {
            return [namedType, null];
          }
          if (/^\s*\(\s*\)\s*=>/.test(typeText)) {
            return [null, []];
          }
          return [
            null,
            typeOptions !== null
              ? inlineComponentProps("", typeOptions)
              : inlineComponentProps("", [
                  typeText.replace(
                    /^(\s*\([^)]*?:\s*\{)/,
                    "declare function x(p: {",
                  ),
                ]),
          ];
        }
        let componentType =
            /(?<![").$\w])\b([A-Z][\w$]*Props(?:\$\d+)?)\b(?!\.)/.exec(
              inlineDeclaration,
            )?.[1],
          propsTypeName =
            (componentType !== undefined && firstDeclaration(componentType) !== undefined
              ? componentType
              : undefined) ??
            propsDeclaration ??
            propsNamePattern.exec(inlineDeclaration)?.[1] ??
            componentType ??
            (/^\s*[\w$]+\$\d+(?:\.[A-Z][\w$]*)+\s*[;&]/.test(typeText)
              ? typeText.trim().replace(/\s*[;&][\s\S]*$/, "") + ".Props"
              : undefined),
          inlineType =
            typeOptions !== null &&
            /(?:Component|FC|ComponentType)<[^{]*\{\s*$/.test(typeOptions[0])
              ? typeOptions
              : null;
        if (propsTypeName !== null && propsTypeName !== undefined) {
          if (inlineType === null || firstDeclaration(propsTypeName) === undefined) {
            return [propsTypeName, null];
          }
          let inlineProps = inlineComponentProps("", inlineType);
          if (inlineProps.length === 0) {
            return [propsTypeName, null];
          }
          return [
            null,
            [
              ...resolveNamedProps(propsTypeName)[0].filter(
                (prop): boolean =>
                  !inlineProps.some((existingProp): boolean => existingProp[0] === prop[0]),
              ),
              ...inlineProps,
            ],
          ];
        }
        let componentProps =
          resolvedPropsType !== undefined
            ? inlineComponentProps(resolvedPropsType)
            : inlineType !== null
              ? inlineComponentProps("", inlineType)
              : [];
        return [
          null,
          componentProps.length > 0 || inlineType !== null || resolvedPropsType !== undefined
            ? componentProps
            : null,
        ];
      };
      for (let [declarationKind, , startLine, endLine] of declarations.get(componentName) ?? []) {
        if (declarationKind !== "const") {
          continue;
        }
        let componentLine = lines[startLine],
          callable = /:\s*typeof [\w$]+\s*&|:\s*\(/.test(componentLine);
        if (
          !/^(?:export )?declare const \w+: \{/.test(componentLine) &&
          !componentLine.includes("& {")
        ) {
          continue;
        }
        let items: M.DocComponentPart[] = [],
          index = 0,
          componentLines = lines.slice(startLine, endLine + 1);
        for (let lineIndex: number = 0; lineIndex < componentLines.length; lineIndex++) {
          let line = componentLines[lineIndex],
            startDepth = index;
          index += countSubstring(line, "{") - countSubstring(line, "}");
          let propMatch =
            startDepth === 1
              ? /^\s+(?:readonly )?([A-Z]\w*)\??:/.exec(line)
              : null;
          if (propMatch === null) {
            continue;
          }
          let scanIndex = lineIndex;
          if (index > 1) {
            let scanDepth = index;
            for (
              scanIndex = lineIndex + 1;
              scanIndex < componentLines.length && scanDepth > 1;
              scanIndex++
            ) {
              scanDepth +=
                countSubstring(componentLines[scanIndex], "{") -
                countSubstring(componentLines[scanIndex], "}");
            }
            scanIndex--;
          }
          let [propType, propSource] = callback(
            line.slice(propMatch[0].length),
            scanIndex > lineIndex ? componentLines.slice(lineIndex, scanIndex + 1) : null,
          );
          items.push([propMatch[1], propType, propSource]);
        }
        return {
          parts: items,
          callable: callable,
        };
      }
      let value = [...exportsByName].find(
          ([name, declaredName]) => declaredName === componentName && name !== componentName,
        )?.[0],
        namespaceDeclaration =
          value !== undefined
            ? (declarations.get(value) ?? []).find(
                (declaration): boolean => declaration[0] === "namespace",
              )
            : undefined;
      if (namespaceDeclaration !== undefined) {
        let items: M.DocComponentPart[] = [];
        for (let line of lines.slice(namespaceDeclaration[2], namespaceDeclaration[3] + 1)) {
          let exportMatch = /^\s*export \{([^}]*)\}/.exec(line);
          if (exportMatch === null) {
            continue;
          }
          for (let exportText of exportMatch[1].split(",")) {
            let aliasMatch = /^\s*([\w$]+)\s+as\s+([A-Z][\w$]*)\s*$/.exec(exportText);
            if (aliasMatch === null) {
              continue;
            }
            let declarationKind = firstDeclaration(aliasMatch[1])?.[0];
            if (
              declarationKind === "const" ||
              declarationKind === "function" ||
              declarationKind === "class"
            ) {
              items.push([
                aliasMatch[2],
                componentPropsType(aliasMatch[1]),
                componentPropsType(aliasMatch[1]) === null
                  ? inlineComponentProps(aliasMatch[1])
                  : null,
              ]);
            }
          }
        }
        if (items.length > 0) {
          return {
            parts: items,
            callable: false,
          };
        }
      }
      return {
        parts: [],
        callable: true,
      };
    },
    documentedComponentNames = new Set(
      facts.comps.map((component) => component.name),
    ),
    isComponentDeclaration = (name: string) =>
      (declarations.get(name) ?? []).some(
        (declaration) =>
          (declaration[0] === "function" &&
            /\):\s*(?:React\.|import\("react"\)\.)?(?:JSX\.Element|ReactElement|ReactNode)/.test(
              lines.slice(declaration[2], declaration[3] + 1).join(" "),
            )) ||
          (declaration[0] === "const" &&
            /(?:ForwardRefExoticComponent|FC|FunctionComponent|NamedExoticComponent|MemoExoticComponent|ComponentType)</.test(
              lines[declaration[2]],
            )) ||
          declaration[0] === "class",
      ),
    relatedComponents = (items: string) =>
      [...declarations.keys()]
        .filter(
          (name) =>
            name.startsWith(items) &&
            name !== items &&
            /^[A-Z]/.test(name.slice(items.length)) &&
            !name.endsWith("Props") &&
            !documentedComponentNames.has(name) &&
            !/(?:Context|Provider|Variants)$/.test(name),
        )
        .filter(
          (name) =>
            (hasExportList ? exportsByName.get(name) === name : true) &&
            isComponentDeclaration(name),
        )
        .slice(0, 12),
    maxRefinedEnumOptions: number = 40,
    refinementBudget: number = Math.max(
      48,
      Math.floor(400000000 / Math.max(1, (declarationText ?? "").length)),
    ),
    refineEnumProps = (
      componentName: string,
      items: M.DocPropRow[],
    ): M.DocPropRow[] => {
      if (
        items.length === 0 ||
        !/Props(?:\$\d+)?$/.test(componentName) ||
        refinementBudget <= 0
      ) {
        return items;
      }
      let value: string = `(?:"[^"]*"|'[^']*'|-?\\d[\\d.]*|true|false|null|undefined|string|number|boolean|ReactNode|ReactElement|React\\.\\w+|IconName|Date|CSSProperties)(?:\\[\\])?`,
        namePattern = new RegExp(
          "^(?:" +
            value +
            "(?:\\s*\\|\\s*" +
            value +
            ")*|\\([\\s\\S]*|\\{[\\s\\S]*)$",
        );
      if (items.every((prop) => namePattern.test(prop[2]))) {
        return items;
      }
      let controls: Core.InferredPropControl[];
      try {
        refinementBudget--;
        controls = inferComponentPropControls(
          componentName.replace(/Props(?:\$\d+)?$/, ""),
          [declarationText ?? ""],
          {
            keep: items.map((prop) => prop[0]),
          },
        );
        if (wasTypeInferenceIncomplete()) {
          refinementBudget = 0;
        }
      } catch {
        refinementBudget = 0;
        return items;
      }
      let entries = new Map(controls.map((control) => [control.name, control]));
      return items.map((prop) => {
        if (namePattern.test(prop[2])) {
          return prop;
        }
        let entry = entries.get(prop[0]);
        if (
          entry === undefined ||
          entry.kind !== "enum" ||
          entry.options === undefined ||
          entry.options.length === 0 ||
          entry.options.length > maxRefinedEnumOptions
        ) {
          return prop;
        }
        let unionOptions = splitAtDepthZero(prop[2], "|"),
          literalOptions = unionOptions.filter((option) => /^"[^"]*"$/.test(option)),
          controlOptions = entry.options.map((option) =>
            entry.numeric === true ||
            (entry.withBool === true &&
              (option === "true" || option === "false"))
              ? option
              : '"' + option + '"',
          );
        if (
          literalOptions.length > 0 &&
          (literalOptions.length <
            unionOptions.filter(
              (option): boolean =>
                !/^(?:string|number|boolean|true|false|null|undefined)$/.test(
                  option,
                ),
            ).length ||
            !literalOptions.every((option) => controlOptions.includes(option)))
        ) {
          return prop;
        }
        if (
          /\bstring\b/.test(prop[2]) ||
          /string\s*&/.test(typeAliases.get(prop[2]) ?? "")
        ) {
          controlOptions.push("string");
        }
        return [prop[0], prop[1], controlOptions.join(" | "), prop[3]];
      });
    },
    kebabPropName = (name: string) =>
      name.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase(),
    maxExampleLength: number = 600,
    componentExamples = (
      items: string,
      props: M.DocPropRow[],
      docs: string,
      prefix = "",
      extraNames = new Set<string>(),
    ): [string, string] => {
      let escapedName = items.replace(/\$/g, "\\$"),
        qualifiedComponentName = qualifiedName(items) + prefix,
        callback = (): [string, string] => {
          let requiredProps = props
              .filter((prop) => prop[1] === "*" && prop[0] !== "children")
              .slice(0, 3),
            openingProps = requiredProps
              .map(([propName, , propType]): string => {
                let literalMatch = /^"[^"]*"/.exec(propType.trim());
                return (
                  " " +
                  propName +
                  (literalMatch
                    ? "=" + literalMatch[0]
                    : propType === "string"
                      ? '="…"'
                      : propType === "number"
                        ? "={0}"
                        : propType === "boolean" || propType === "true"
                          ? ""
                          : "={…}")
                );
              })
              .join(""),
            optionalProps = requiredProps
              .map(([propName, , propType]): string => {
                let literalMatch = /^"[^"]*"/.exec(propType.trim());
                return (
                  " " +
                  kebabPropName(propName) +
                  "=" +
                  (literalMatch
                    ? literalMatch[0]
                    : propType === "string"
                      ? '"…"'
                      : propType === "number"
                        ? '"{{0}}"'
                        : propType === "boolean" || propType === "true"
                          ? '"{{yes}}"'
                          : '"{{…}}"')
                );
              })
              .join(""),
            ellipsis =
              prefix !== "" ||
              props.some((prop): boolean => prop[0] === "children");
          return [
            ellipsis
              ? "<" + qualifiedComponentName + openingProps + ">…</" + qualifiedComponentName + ">"
              : "<" + qualifiedComponentName + openingProps + " />",
            '<x-import component-from-global-scope="' +
              qualifiedComponentName +
              '"' +
              optionalProps +
              ">" +
              (ellipsis ? "…" : "") +
              "</x-import>",
          ];
        },
        hasExampleTag = docs.includes("@example")
          ? docs.slice(docs.indexOf("@example"))
          : docs,
        componentMatch = new RegExp("<" + escapedName + "(\\.\\w+)?(?=[\\s/>])").exec(
          hasExampleTag,
        );
      if (componentMatch === null) {
        return callback();
      }
      let componentSuffix = componentMatch[1] ?? "",
        exampleBody = hasExampleTag.slice(
          componentMatch.index,
          componentMatch.index + maxExampleLength * 4,
        ),
        cursor = 1 + items.length + componentSuffix.length,
        attributes: [string, string | undefined][] = [],
        flag: boolean = false;
      for (;;) {
        while (cursor < exampleBody.length && /\s/.test(exampleBody[cursor])) {
          cursor++;
        }
        if (exampleBody[cursor] === ">") {
          cursor++;
          break;
        }
        if (exampleBody[cursor] === "/" && exampleBody[cursor + 1] === ">") {
          flag = true;
          cursor += 2;
          break;
        }
        let attributeMatch = /^[A-Za-z][\w-]*/.exec(exampleBody.slice(cursor));
        if (attributeMatch === null) {
          return callback();
        }
        cursor += attributeMatch[0].length;
        let attributeValue: string | undefined;
        if (exampleBody[cursor] === "=") {
          if ((cursor++, exampleBody[cursor] === '"')) {
            let quoteEnd = exampleBody.indexOf('"', cursor + 1);
            if (quoteEnd === -1) {
              return callback();
            }
            attributeValue = exampleBody.slice(cursor, quoteEnd + 1);
            cursor = quoteEnd + 1;
          } else if (exampleBody[cursor] === "{") {
            let index: number = 0,
              scanCursor = cursor,
              quote = "";
            for (; scanCursor < exampleBody.length; scanCursor++) {
              let character = exampleBody[scanCursor];
              if (quote !== "") {
                if (character === quote) {
                  quote = "";
                }
                continue;
              }
              if (character === '"' || character === "'" || character === "`") {
                quote = character;
              } else if (character === "{") {
                index++;
              } else if (character === "}" && --index === 0) {
                break;
              }
            }
            if (scanCursor >= exampleBody.length) {
              return callback();
            }
            attributeValue = exampleBody.slice(cursor, scanCursor + 1);
            cursor = scanCursor + 1;
          } else {
            return callback();
          }
        }
        attributes.push([attributeMatch[0], attributeValue]);
        if (attributes.length > 24 || cursor >= exampleBody.length) {
          return callback();
        }
      }
      let text = "";
      if (!flag) {
        let openingTag: string = "<" + items + componentSuffix,
          closingTag: string = "</" + items + componentSuffix + ">",
          count: number = 1,
          tagCursor = cursor;
        for (;;) {
          let openingIndex = exampleBody.indexOf(openingTag, tagCursor),
            closingIndex = exampleBody.indexOf(closingTag, tagCursor);
          if (closingIndex === -1) {
            return callback();
          }
          if (
            openingIndex !== -1 &&
            openingIndex < closingIndex &&
            /[\s/>]/.test(exampleBody[openingIndex + openingTag.length] ?? "")
          ) {
            count++;
            tagCursor = openingIndex + openingTag.length;
            continue;
          }
          if (--count === 0) {
            text = exampleBody.slice(cursor, closingIndex).trim();
            break;
          }
          tagCursor = closingIndex + closingTag.length;
        }
        if (unicodeCharacterCount(text) > maxExampleLength) {
          return callback();
        }
      }
      let values = new Set(props.map((prop) => prop[0]));
      if (
        !attributes.every(
          ([propName]) =>
            values.has(propName) ||
            extraNames.has(propName) ||
            /^(?:aria-|data-|on[A-Z])/.test(propName),
        )
      ) {
        return callback();
      }
      let componentTag = qualifiedName(items) + componentSuffix,
        attributeText = attributes
          .map(
            ([propName, propValue]): string =>
              " " + propName + (propValue === undefined ? "" : "=" + propValue),
          )
          .join(""),
        formatExampleValue = ((exampleInput: string) =>
          exampleInput.replace(
            /<(\/?)([A-Z][\w$]*)(?=[\s/>.])/g,
            (formattedValue: string, componentName: string, componentNamespace: string) =>
              componentNamespace === items ||
              documentedComponentNames.has(componentNamespace) ||
              (exportsByName.get(componentNamespace) === componentNamespace &&
                isComponentDeclaration(componentNamespace))
                ? "<" + componentName + qualifiedName(componentNamespace)
                : formattedValue,
          ))(
          flag
            ? "<" + items + componentSuffix + attributeText + " />"
            : "<" +
                items +
                componentSuffix +
                attributeText +
                ">" +
                text +
                "</" +
                items +
                componentSuffix +
                ">",
        ),
        formatValue = (sourceValue: string) =>
          /^(?:-?\d[\d.]*|true|false|null|[A-Za-z_$][\w$]*(?:\.[A-Za-z_$][\w$]*)*|'[^']*')$/.test(
            sourceValue,
          )
            ? sourceValue
            : "…",
        attributesText = attributes
          .map(
            ([propName, propValue]): string =>
              " " +
              kebabPropName(propName) +
              "=" +
              (propValue === undefined
                ? '"{{yes}}"'
                : propValue.startsWith("{")
                  ? '"{{' +
                    formatValue(propValue.slice(1, -1).trim().replace(/"/g, "'")) +
                    '}}"'
                  : propValue),
          )
          .join(""),
        exampleText = /<\/?[A-Za-z]/.test(text) ? "…" : text;
      return [
        formatExampleValue,
        '<x-import component-from-global-scope="' +
          componentTag +
          '"' +
          attributesText +
          ">" +
          exampleText +
          "</x-import>",
      ];
    },
    propsTable = (
      items: readonly M.DocPropRow[],
      fallbackText = "_No props beyond standard HTML attributes._",
    ) => {
      if (items.length === 0) {
        return fallbackText;
      }
      let rows = ["| prop | type | note |", "| --- | --- | --- |"];
      for (let [value, typeText, requiredFlag, noteText] of items) {
        let typeDisplay = markdownTableCell(describeExternalType(requiredFlag)),
          text: string =
            '(?:"[^"]*"|`[^`]*`|-?\\d[\\d.]*|true|false|null|undefined|string|number|boolean)',
          truncationPattern = new RegExp(
            "^" + text + "(?:\\s*\\\\\\|\\s*" + text + ")*$",
          ).test(typeDisplay);
        if (unicodeCharacterCount(typeDisplay) > (truncationPattern ? 600 : 110)) {
          typeDisplay =
            truncateUnicodeText(typeDisplay, truncationPattern ? 597 : 107).replace(
              /\\$/,
              "",
            ) + "…";
        }
        let noteDisplay = markdownTableCell(noteText);
        if (unicodeCharacterCount(noteDisplay) > 160) {
          noteDisplay = truncateUnicodeText(noteDisplay, 157) + "…";
        }
        rows.push(
          "| " +
            markdownCodeSpan(value) +
            (typeText ? " *" : "") +
            " | " +
            markdownCodeSpan(typeDisplay) +
            " | " +
            noteDisplay +
            " |",
        );
      }
      return rows.join(`
`);
    },
    firstSentence = (text: string) => {
      let value = /^([^\n]+?[.!?])(\s|$)/.exec(text);
      return truncateUnicodeText(value ? value[1] : text, 160).trim();
    },
    iconNames = typeAliases.has("IconName")
      ? [...typeAliases.get("IconName")!.matchAll(/"([^"]+)"/g)].map(
          (row) => row[1],
        )
      : [],
    iconsCard: M.ApiDocumentationCard | null = null;
  if (iconNames.length > 0) {
    let value = qualifiedName(facts.icon ?? "Icon"),
      items = [
        "# Icons",
        "",
        String(iconNames.length) +
          " named glyphs" +
          (facts.css
            ? " from the icon font in " +
              markdownCodeSpan("components/bundle.css")
            : "") +
          ". Never draw an SVG icon the system has.",
        "",
        "## Use",
        "",
        MARKDOWN_CODE_FENCE + "jsx",
        "<" + value + ' name="' + iconNames[0] + '" />',
        MARKDOWN_CODE_FENCE,
        "",
        MARKDOWN_CODE_FENCE + "html",
        '<x-import component-from-global-scope="' +
          value +
          '" name="' +
          iconNames[0] +
          '"></x-import>',
        MARKDOWN_CODE_FENCE,
        "",
        "## Names",
        "",
        [...iconNames].sort().map(markdownCodeSpan).join(", "),
        "",
      ];
    iconsCard = makeApiDocumentationCard(
      "icons",
      "Icons",
      String(iconNames.length) +
        " icon names for " +
        markdownCodeSpan(facts.icon ?? "Icon") +
        " and every " +
        markdownCodeSpan("icon=") +
        " prop.",
      GENERATED_API_DIRECTORY + "icons.md",
      items,
    );
  }
  let componentCards: M.ApiDocumentationCard[] = [];
  for (let value of groupDocumentedComponents(facts).flat()) {
    let name = value.name;
    remainingWork = maxWork;
    let wrappedType = wrappedComponentType(name),
      propsType =
        componentPropsType(name) ??
        (wrappedType !== null ? componentPropsType(wrappedType) : null),
      description =
        declarationDoc(name) ||
        declarationDoc(propsType ?? "") ||
        (wrappedType !== null ? declarationDoc(wrappedType) : ""),
      [enumProps, propRows, extraProps] =
        propsType !== null
          ? resolveNamedProps(propsType)
          : [inlineComponentProps(wrappedType ?? name), [], null],
      refinedProps = refineEnumProps(propsType ?? "", enumProps),
      { parts: pagePartRows, callable: isCallable } = value.page
        ? {
            parts: [],
            callable: false,
          }
        : componentParts(name),
      pageParts = value.page
        ? []
        : relatedComponents(name).filter(
            (partName): boolean =>
              !pagePartRows.some((part): boolean => partName === name + part[0]),
          ),
      summary = value.summary || firstSentence(description) || name + ".",
      values = new Set<string>();
    for (let propRow of propRows) {
      let pickMatch =
        /^(\w*Omit|Pick)<\s*([A-Za-z_$][\w$]*)[^,]*,([\s\S]*)>$/.exec(
          propRow,
        );
      if (pickMatch === null) {
        continue;
      }
      let pickValues = [...pickMatch[3].matchAll(/"([^"]+)"/g)].map(
        (tupleValue) => tupleValue[1],
      );
      if (pickMatch[1] === "Pick") {
        for (let tokenLiteral of pickValues) {
          values.add(tokenLiteral);
        }
      } else {
        for (let prop of resolveNamedProps(pickMatch[2])[0]) {
          if (!pickValues.includes(prop[0])) {
            values.add(prop[0]);
          }
        }
      }
    }
    let [exampleMarkdown, exampleNote] = componentExamples(
        name,
        refinedProps,
        description,
        !isCallable && pagePartRows.some((part): boolean => part[0] === "Root")
          ? ".Root"
          : "",
        values,
      ),
      items = [...pagePartRows.map((part) => part[0]), ...pageParts],
      cardLines = [
        "# " + name,
        "",
        summary,
        "",
        (value.page
          ? "showcase page"
          : markdownCodeSpan(qualifiedName(name))) +
          (value.group !== "" ? " · " + value.group : "") +
          (pagePartRows.length > 0
            ? " · parts: " + pagePartRows.map((part) => part[0]).join(", ")
            : "") +
          (pageParts.length > 0 ? " · with: " + pageParts.join(", ") : ""),
        "",
      ];
    if (value.page) {
      cardLines.push(
        "## Use",
        "",
        "A showcase page of the source project, not a component the bundle exports: there is nothing to mount.",
        "",
      );
    } else if (facts.bundle) {
      cardLines.push(
        "## Use",
        "",
        MARKDOWN_CODE_FENCE + "jsx",
        exampleMarkdown,
        MARKDOWN_CODE_FENCE,
        "",
        MARKDOWN_CODE_FENCE + "html",
        exampleNote,
        MARKDOWN_CODE_FENCE,
        "",
      );
    } else {
      cardLines.push(
        "## Use",
        "",
        "Documentation only: this system ships no " +
          markdownCodeSpan(DESIGN_SYSTEM_PATHS.bundleJs) +
          " to mount it from" +
          (value.readme
            ? " — build to the long README’s guidelines."
            : ". Build to this card."),
        "",
      );
    }
    if (description !== "" && unicodeCharacterCount(description) > 40) {
      cardLines.push(
        "## Notes",
        "",
        truncateUnicodeText(sanitizeMarkdownLine(description), 900),
        "",
      );
    }
    let callback = (text: string) => {
        let cellText = markdownTableCell(text);
        if (unicodeCharacterCount(cellText) > 600) {
          return truncateUnicodeText(cellText, 597) + "…";
        } else {
          return cellText;
        }
      },
      readmeSuffix: string = value.readme ? "; see the long README" : "",
      formatTypeCell = (
        typeName: string | null,
        typeAlias: string | null,
        extraTypes: readonly string[],
      ): string =>
        typeAlias === wideTypeSentinel
          ? "_Props are " +
            markdownCodeSpan(typeName ?? "a union") +
            ", too wide to tabulate here" +
            readmeSuffix +
            " (types: " +
            markdownCodeSpan(DESIGN_SYSTEM_PATHS.indexDts) +
            ")._"
          : typeName !== null && firstDeclaration(typeName) === undefined
            ? "_Props are " +
              markdownCodeSpan(
                markdownTableCell(describeExternalType(typeName)),
              ) +
              ", from the library this wraps — not spelled out in " +
              markdownCodeSpan(DESIGN_SYSTEM_PATHS.indexDts) +
              readmeSuffix +
              "._"
            : typeAlias !== null
              ? "_Props are " +
                markdownCodeSpan(callback(describeExternalType(typeAlias))) +
                ", inherited from the library this wraps — not spelled out in " +
                markdownCodeSpan(DESIGN_SYSTEM_PATHS.indexDts) +
                readmeSuffix +
                "._"
              : extraTypes.length > 0
                ? "_No props of its own; it takes what " +
                  callback(
                    describeExternalType(uniqueValues(extraTypes).join(", ")),
                  ) +
                  " takes._"
                : "_No props of its own._",
      propsNote =
        declarationText === null
          ? "_This system ships no " +
            markdownCodeSpan(DESIGN_SYSTEM_PATHS.indexDts) +
            readmeSuffix +
            "._"
          : propsType === null && propRows.length === 0
            ? refinedProps.length > 0
              ? undefined
              : "_No " +
                markdownCodeSpan(name + "Props") +
                " in " +
                markdownCodeSpan(DESIGN_SYSTEM_PATHS.indexDts) +
                readmeSuffix +
                "._"
            : formatTypeCell(propsType, extraProps, propRows);
    if (!(value.page && propsType === null && refinedProps.length === 0)) {
      cardLines.push(
        "## Props" +
          (propsType !== null ? " (" + describeExternalType(propsType) + ")" : ""),
        "",
        propsTable(refinedProps, propsNote),
        "",
      );
    }
    if (propRows.length > 0 && refinedProps.length > 0) {
      cardLines.push(
        "_Also accepts: " +
          callback(describeExternalType(uniqueValues(propRows).join(", "))) +
          "._",
        "",
      );
    }
    for (let [partName, partPropsType, partControls] of pagePartRows) {
      if (partPropsType !== null && partPropsType === propsType) {
        continue;
      }
      let [partEnumProps, partEnumOptions, partEnumExtra] =
        partPropsType !== null
          ? resolveNamedProps(partPropsType)
          : [partControls ?? [], [], null];
      if (partPropsType === null && partControls === null) {
        cardLines.push(
          "### " + name + "." + partName,
          "",
          "_Its props type is not named in " +
            markdownCodeSpan(DESIGN_SYSTEM_PATHS.indexDts) +
            readmeSuffix +
            "._",
          "",
        );
        continue;
      }
      cardLines.push(
        "### " + name + "." + partName,
        "",
        propsTable(
          refineEnumProps(partPropsType ?? "", partEnumProps),
          formatTypeCell(partPropsType, partEnumExtra, partEnumOptions),
        ),
        "",
      );
      if (partEnumOptions.length > 0 && partEnumProps.length > 0) {
        cardLines.push(
          "_Also accepts: " +
            callback(describeExternalType(uniqueValues(partEnumOptions).join(", "))) +
            "._",
          "",
        );
      }
    }
    for (let partName of pageParts) {
      let partPropsType = componentPropsType(partName),
        partRows =
          partPropsType !== null
            ? refineEnumProps(partPropsType, resolveNamedProps(partPropsType)[0])
            : inlineComponentProps(partName);
      if (partRows.length > 0) {
        cardLines.push(
          "### " + partName,
          "",
          ...(declarationDoc(partName) !== ""
            ? [firstSentence(declarationDoc(partName)), ""]
            : []),
          propsTable(partRows),
          "",
        );
      }
    }
    let referencedTypes: string[] = [];
    for (let propRow of refinedProps) {
      for (let typeMatch of propRow[2].matchAll(
        /\b(?<!typeof )([A-Z][A-Za-z]+)\b(?!\s*\[\s*["'])/g,
      )) {
        let typeName = typeMatch[1];
        if (
          referencedTypes.includes(typeName) ||
          items.includes(typeName) ||
          typeName.endsWith("Props") ||
          typeName.startsWith("React") ||
          typeName.startsWith("HTML") ||
          (facts.ns !== null && typeName.startsWith(facts.ns)) ||
          ["ReactNode", "ReactElement", "IconName", "Date"].includes(typeName)
        ) {
          continue;
        }
        let typeKind = firstDeclaration(typeName)?.[0];
        if (typeKind === "interface" || typeKind === "type") {
          referencedTypes.push(typeName);
        }
      }
    }
    let index: number = 0;
    for (let typeName of referencedTypes) {
      if (index >= 6) {
        break;
      }
      let [typeRows] = resolveNamedProps(typeName, new Set(), keepAllProps);
      if (typeRows.length === 0) {
        continue;
      }
      index++;
      cardLines.push(
        "### " + typeName,
        "",
        ...(declarationDoc(typeName) !== ""
          ? [firstSentence(declarationDoc(typeName)), ""]
          : []),
        propsTable(typeRows),
        "",
      );
    }
    if (value.readme) {
      cardLines.push(
        "## More",
        "",
        "Long-form usage: " +
          markdownCodeSpan(
            DESIGN_SYSTEM_PATHS.componentsDir + name + "/README.md",
          ) +
          ".",
        "",
      );
    }
    if (
      isPublishableFilePathModelFileTable(
        GENERATED_API_DIRECTORY + "components/" + name + ".md",
      )
    ) {
      componentCards.push(
        makeApiDocumentationCard(
          "component",
          name,
          summary,
          GENERATED_API_DIRECTORY + "components/" + name + ".md",
          cardLines,
        ),
      );
    }
  }
  let result = {
    iconNames: iconNames,
    icons: iconsCard,
    components: componentCards,
  };
  cachedComponentApiCards = {
    dts: declarationText,
    key: cacheKey,
    out: result,
  };
  return result;
}
function groupDocumentedComponents(
  facts: M.ManifestDocumentationFacts,
): M.DocumentationComponent[][] {
  let groups = new Map<string, M.DocumentationComponent[]>();
  for (let value of facts.comps) {
    groups.set(value.group, [...(groups.get(value.group) ?? []), value]);
  }
  return [...groups.values()];
}
function fontFamilySlug(family: string): string {
  let slug = family
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  if (slug === "") {
    return "font";
  } else {
    return slug;
  }
}
function chooseRegularFontFace(
  fonts: readonly Core.FontFace[],
): Core.FontFace | undefined {
  let score = (fontFace: Core.FontFace) => {
    let [value, upperWeight] = fontFace.weight.split(" ").map(Number),
      lowerWeight = upperWeight ?? value;
    return (
      (fontFace.style === "normal" ? 0 : 1e4) +
      (value <= 400 && 400 <= lowerWeight
        ? 0
        : Math.min(Math.abs(value - 400), Math.abs(lowerWeight - 400)))
    );
  };
  return [...fonts].sort(
    (leftFont, rightFont) => score(leftFont) - score(rightFont),
  )[0];
}
function generateConsumptionDocumentation(
  documentationOptions: M.ConsumptionDocumentationOptions,
): Core.ConsumptionDocumentation {
  let { tokens: tokens, manifest: manifest } = documentationOptions,
    declarationText =
      documentationOptions.dts === null ? null : normalizeTextNewlines(documentationOptions.dts),
    sourceReadme = normalizeTextNewlines(documentationOptions.readme),
    assetReadmes = Object.fromEntries(
      Object.entries<string>(documentationOptions.assetReadmes)
        .filter((entry): boolean => typeof entry[1] === "string")
        .map(([path, content]) => [path, normalizeTextNewlines(content)]),
    ),
    facts = documentationManifestFacts(manifest),
    namespace = facts.ns ?? "window",
    qualifiedName = (name: string): string =>
      (facts.ns !== null ? facts.ns + "." : "") + name,
    listedPaths = new Set(
      Array.isArray(manifest.files)
        ? (manifest.files as unknown[]).filter(
            (candidate: unknown): candidate is string => typeof candidate === "string",
          )
        : [],
    ),
    storageFiles: Readonly<
      Record<string, M.DocStoredFile | null | undefined>
    > =
      typeof manifest.storage === "object" &&
      manifest.storage !== null &&
      typeof manifest.storage.files === "object" &&
      manifest.storage.files !== null
        ? (manifest.storage.files as Readonly<
            Record<string, M.DocStoredFile | null | undefined>
          >)
        : {},
    fontRows = (() => {
      let value = tokens?.type.fonts ?? [];
      if (value.length === 0) {
        return [];
      }
      let families = tokens!.type.families,
        callback = (path: string) => {
          let storageRecord = storageFiles[path];
          if (
            typeof storageRecord === "object" &&
            storageRecord !== null &&
            storageRecord.store === "blob" &&
            typeof storageRecord.id === "string" &&
            BLOB_ID_PATTERN.test(storageRecord.id)
          ) {
            return markdownCodeSpan("read " + storageRecord.id);
          }
          if (!listedPaths.has(path) && facts.listed) {
            return "inline in the page only";
          }
          let rootPath = documentationOptions.root ?? "";
          if (rootPath === "") {
            return markdownCodeSpan("read " + path);
          } else {
            return (
              markdownCodeSpan("read") +
              " the file with " +
              markdownCodeSpan(rootPath) +
              " in front"
            );
          }
        },
        hasTokenName = (tokenName: string) =>
          Object.keys(facts.tokensCss ? families : {}).find((familyName) =>
            families[familyName]
              .split(",")
              .map((family) =>
                family
                  .trim()
                  .replace(/^["']|["']$/g, "")
                  .toLowerCase(),
              )
              .includes(tokenName.toLowerCase()),
          );
      return uniqueValues(value.map((family) => family.family)).map((family) => {
        let fontFace = chooseRegularFontFace(
            value.filter((candidate): boolean => candidate.family === family),
          )!,
          cssVariable = hasTokenName(family);
        return [
          markdownTableCell(family),
          markdownCodeSpan(fontFace.file) +
            " (weight " +
            markdownTableCell(fontFace.weight) +
            (fontFace.style !== "normal" ? ", " + fontFace.style : "") +
            ")",
          callback(fontFace.file),
          cssVariable !== undefined
            ? markdownCodeSpan(
                "var(--font-" +
                  escapeTokenCssIdentifier(cssVariable) +
                  ")",
              )
            : "",
          markdownCodeSpan(fontFamilySlug(family)),
        ];
      });
    })(),
    cleanReadme = sourceReadme.replace(/\uFFFD/g, "").trimEnd(),
    migrationGuide = inspectStandaloneMigrationGuide(cleanReadme),
    fontPaths = uniqueValues(
      (tokens?.type.fonts ?? []).map((fontPath) => fontPath.file),
    ),
    canInstallFontsByPath =
      !migrationGuide.both &&
      facts.listed &&
      facts.tokensCss &&
      fontPaths.length > 0 &&
      fontPaths.every(
        (path) =>
          listedPaths.has(path) &&
          isInstallableFontPath(path) &&
          storageFiles[path]?.store !== "blob",
      ),
    fontGuide = fontConsumptionGuide(
      canInstallFontsByPath,
      !migrationGuide.both,
      fontPaths,
    ),
    fontTable = () => [
      "| family | file | fetch | CSS | Slides " +
        markdownCodeSpan("faces") +
        " key |",
      "| --- | --- | --- | --- | --- |",
      ...fontRows.map((row): string => "| " + row.join(" | ") + " |"),
    ],
    cards: M.ApiDocumentationCard[] = [],
    cardPaths = new Set<string>(),
    addCard = (
      kind: string,
      name: string,
      purpose: string,
      path: string,
      details: readonly string[],
    ): void => {
      if (cardPaths.has(path.toLowerCase())) {
        return;
      }
      cardPaths.add(path.toLowerCase());
      cards.push(
        makeApiDocumentationCard(kind, name, purpose, path, details),
      );
    };
  if (tokens !== null && tokens.color.tokens.length > 0) {
    let value = tokens.color.themes.map((theme) => theme.id),
      prefix = commonTokenNamePrefix(
        tokens.color.tokens.map((token) => token.name),
      ),
      callback = (token: Core.ColorToken) =>
        prefix !== "" && token.name.startsWith(prefix)
          ? token.name.slice(prefix.length)
          : token.name,
      resolveTokenValue = (token: Core.ColorToken) =>
        value
          .map((alias) =>
            markdownTableCell(
              resolveColorTokenValue(token, alias, tokens) ??
                "",
            ),
          )
          .join(" | "),
      cssPath: string = facts.css
        ? "tokens.css or components/bundle.css"
        : "tokens.css",
      values = new Set<string>();
    for (let group of COLOR_DOCUMENTATION_GROUPS) {
      let groupTokens = tokens.color.tokens.filter(
        (token) =>
          !values.has(token.name) && group.test.test(callback(token)),
      );
      for (let token of groupTokens) {
        values.add(token.name);
      }
      if (groupTokens.length === 0) {
        continue;
      }
      let items = [
        "# Color · " + group.title,
        "",
        "## Use",
        "",
        MARKDOWN_CODE_FENCE + "css",
        "/* any surface that loads " + cssPath + " */",
        "color: var(--" +
          escapeTokenCssIdentifier(groupTokens[0].name) +
          ");",
        "/* a surface with no stylesheet (a slide): the " +
          (value[0] ?? "first") +
          " value" +
          (value.length > 1 ? ", or another theme’s in that mode" : "") +
          " */",
        MARKDOWN_CODE_FENCE,
        "",
        "## Tokens (" + String(groupTokens.length) + ")",
        "",
        "| token | " + value.join(" | ") + " | usage |",
        "| --- |" + " --- |".repeat(value.length) + " --- |",
      ];
      if (group.key === "palette") {
        let entries = new Map<string, [number, string][]>();
        for (let token of groupTokens) {
          let rampMatch = PALETTE_RAMP_TOKEN_PATTERN.exec(callback(token));
          if (rampMatch === null) {
            items.push(
              "| " +
                markdownCodeSpan(token.name) +
                " | " +
                resolveTokenValue(token) +
                " | " +
                markdownTableCell(token.usage) +
                " |",
            );
            continue;
          }
          let rampName = rampMatch[1];
          if (!entries.has(rampName)) {
            entries.set(rampName, []);
          }
          entries
            .get(rampName)!
            .push([
              parseInt(rampMatch[2], 10),
              resolveColorTokenValue(
                token,
                value[0] ?? "",
                tokens,
              ) ?? "",
            ]);
        }
        if (entries.size > 0) {
          items.push(
            "",
            "| ramp | steps | first → last (" + (value[0] ?? "") + ") |",
            "| --- | --- | --- |",
          );
          for (let [rampName, rampEntries] of entries) {
            rampEntries.sort((leftEntry, rightEntry) => leftEntry[0] - rightEntry[0]);
            items.push(
              "| " +
                markdownCodeSpan(prefix + rampName + "-*") +
                " | " +
                rampEntries.map((rampEntry): string => String(rampEntry[0])).join(", ") +
                " | " +
                markdownTableCell(rampEntries[0][1]) +
                " → " +
                markdownTableCell(rampEntries[rampEntries.length - 1][1]) +
                " |",
            );
          }
        }
      } else {
        let interactionTokens = groupTokens.filter((token) =>
          COLOR_INTERACTION_SUFFIX_PATTERN.test(token.name),
        );
        for (let token of groupTokens) {
          if (!COLOR_INTERACTION_SUFFIX_PATTERN.test(token.name)) {
            items.push(
              "| " +
                markdownCodeSpan(token.name) +
                " | " +
                resolveTokenValue(token) +
                " | " +
                markdownTableCell(token.usage) +
                " |",
            );
          }
        }
        if (interactionTokens.length > 0) {
          items.push(
            "",
            "**Interaction states** (same roles, suffixed):",
            "",
            "| token | " + value.join(" | ") + " |",
            "| --- |" + " --- |".repeat(value.length),
          );
          for (let token of interactionTokens) {
            items.push(
              "| " +
                markdownCodeSpan(token.name) +
                " | " +
                resolveTokenValue(token) +
                " |",
            );
          }
        }
      }
      items.push("");
      addCard(
        "tokens",
        "color/" + group.key,
        group.title +
          " — " +
          String(groupTokens.length) +
          (groupTokens.length === 1 ? " token." : " tokens."),
        GENERATED_API_DIRECTORY + "tokens/" + group.key + ".md",
        items,
      );
    }
  }
  if (
    tokens !== null &&
    (tokens.type.groups.length > 0 ||
      tokens.type.fonts.length > 0 ||
      Object.keys(tokens.type.families).length > 0)
  ) {
    let type = tokens.type,
      value = type.groups.flatMap((styleGroup) =>
        styleGroup.styles.map(
          (style): string =>
            "| " +
            markdownCodeSpan(style.name) +
            " | " +
            markdownCodeSpan(
              "." + escapeTokenCssIdentifier(style.name),
            ) +
            ", " +
            markdownCodeSpan(
              "--text-" + escapeTokenCssIdentifier(style.name),
            ) +
            " | " +
            markdownTableCell(style.fontSize) +
            " / " +
            markdownTableCell(style.lineHeight) +
            " | " +
            markdownTableCell(style.fontWeight) +
            " | " +
            markdownCodeSpan(
              markdownTableCell(style.family || styleGroup.family),
            ) +
            " | " +
            markdownTableCell(style.usage) +
            " |",
        ),
      ),
      defaultStyleName = type.groups[0]?.styles[0]?.name ?? "body",
      defaultFamilyName = Object.keys(type.families)[0] ?? "sans",
      items = [
        "# Type",
        "",
        "Use the named styles; no literal px." +
          (type.groups.some((group): boolean => group.note !== "")
            ? " " +
              type.groups
                .map((note) => sanitizeMarkdownLine(note.note).trim())
                .filter((note): boolean => note !== "")
                .join(" ")
            : ""),
        "",
        "## Use",
        "",
        MARKDOWN_CODE_FENCE + "css",
        "font: var(--text-" +
          escapeTokenCssIdentifier(defaultStyleName) +
          ");            /* with tokens.css */",
        "font-family: var(--font-" +
          escapeTokenCssIdentifier(defaultFamilyName) +
          ");   /* the family alone */",
        MARKDOWN_CODE_FENCE,
        "",
      ];
    if (value.length > 0) {
      items.push(
        "## Styles",
        "",
        "| style | CSS | size / line | weight | family | usage |",
        "| --- | --- | --- | --- | --- | --- |",
        ...value,
        "",
      );
    }
    let fontFamilies = Object.entries<string>(type.families);
    if (fontFamilies.length > 0) {
      items.push(
        "## Families",
        "",
        "| family | CSS variable | stack |",
        "| --- | --- | --- |",
        ...fontFamilies.map(
          ([familyName, familyValue]): string =>
            "| " +
            markdownCodeSpan(familyName) +
            " | " +
            markdownCodeSpan("--font-" + familyName) +
            " | " +
            markdownCodeSpan(markdownTableCell(familyValue)) +
            " |",
        ),
        "",
      );
    }
    if (fontRows.length > 0) {
      items.push(
        "## Font files",
        "",
        ...fontGuide,
        "",
        ...(facts.tokensCss
          ? [
              markdownCodeSpan(GENERATED_TOKENS_CSS_PATH) +
                " carries the " +
                markdownCodeSpan("@font-face") +
                " rules for a page that links it and names each family by the CSS variable below.",
              "",
            ]
          : []),
        ...fontTable(),
        "",
        ...(type.fonts.length > fontRows.length
          ? [
              "Every face: " +
                type.fonts
                  .map(
                    (fontFace): string =>
                      markdownCodeSpan(fontFace.file) +
                      " (" +
                      markdownTableCell(fontFace.family) +
                      ", " +
                      markdownTableCell(fontFace.weight) +
                      (fontFace.style !== "normal" ? ", " + fontFace.style : "") +
                      ")",
                  )
                  .join(", ") +
                ".",
              "",
            ]
          : []),
      );
    }
    addCard(
      "tokens",
      "type",
      "Type styles, families, font files.",
      GENERATED_API_DIRECTORY + "tokens/type.md",
      items,
    );
  }
  if (tokens !== null) {
    let value = tokens.color.themes.map((theme) => theme.id),
      callback = (
        sectionId: string,
        sectionTitle: string,
        sectionContext: string,
        items: readonly (Core.ScalarToken | Core.ShadowToken)[],
      ): void => {
        if (items.length === 0) {
          return;
        }
        let formatCell = (cellValue: string | Record<string, string>) => {
            if (typeof cellValue === "string") {
              return markdownTableCell(cellValue);
            }
            let defaultCellValue = cellValue[value[0] ?? ""] ?? "";
            return (
              markdownTableCell(defaultCellValue) +
              value
                .slice(1)
                .map((key): string =>
                  cellValue[key] !== undefined && cellValue[key] !== defaultCellValue
                    ? " · " +
                      key +
                      ": " +
                      markdownTableCell(cellValue[key])
                    : "",
                )
                .join("")
            );
          },
          name = items[0].name,
          markdownLines = [
            "# " + sectionTitle,
            "",
            ...(sectionContext.trim() !== ""
              ? [sanitizeMarkdownLine(sectionContext).trim(), ""]
              : []),
            "## Use",
            "",
            MARKDOWN_CODE_FENCE + "css",
            sectionId === "spacing"
              ? "padding: var(--" +
                escapeTokenCssIdentifier(name) +
                ");"
              : "/* var(--" +
                escapeTokenCssIdentifier(name) +
                ") */",
            MARKDOWN_CODE_FENCE,
            "",
            "## Tokens (" + String(items.length) + ")",
            "",
            "| token | value | usage |",
            "| --- | --- | --- |",
            ...items.map(
              (row): string =>
                "| " +
                markdownCodeSpan(row.name) +
                " | " +
                formatCell(row.value) +
                " | " +
                markdownTableCell(row.usage) +
                " |",
            ),
            "",
          ];
        addCard(
          "tokens",
          sectionId,
          sectionTitle +
            " — " +
            String(items.length) +
            (items.length === 1 ? " token." : " tokens."),
          GENERATED_API_DIRECTORY + "tokens/" + sectionId + ".md",
          markdownLines,
        );
      };
    callback(
      "spacing",
      "Spacing",
      tokens.spacing.note,
      tokens.spacing.tokens,
    );
    callback("radius", "Radius", tokens.radius.note, tokens.radius.tokens);
    callback("shadow", "Shadow", tokens.shadow.note, tokens.shadow.tokens);
    for (let extraTokenFamily of tokens.extra) {
      callback(
        tokenFamilySlug(extraTokenFamily.key),
        humanizeFamilyName(extraTokenFamily.key),
        extraTokenFamily.note,
        extraTokenFamily.tokens,
      );
    }
  }
  let tokenCardMode = documentationOptions.tokenCards ?? DEFAULT_TOKEN_CARD_MODE,
    inlineTokensSection = "";
  if (tokenCardMode !== "per-group" && cards.length > 0) {
    let value = cards.splice(0, cards.length),
      flag: boolean = false,
      callback = (text: string) =>
        text
          .split(
            `
`,
          )
          .map((line) => {
            if (line.startsWith(MARKDOWN_CODE_FENCE)) {
              flag = !flag;
            }
            if (!flag && line.startsWith("#")) {
              return "#" + line;
            } else {
              return line;
            }
          }).join(`
`),
      items = [
        "# Tokens",
        "",
        "Every token of the system, a section per group: " +
          value.map((card) => card.purpose.replace(/\.$/, "")).join("; ") +
          ".",
        "",
        ...value.map((card) => callback(card.text)),
      ];
    if (tokenCardMode === "single") {
      cards.push(
        makeApiDocumentationCard(
          "tokens",
          "tokens",
          "Every token: " +
            value
              .map((token) => token.name.replace(/^color\//, ""))
              .join(", ") +
            ".",
          GENERATED_API_DIRECTORY + "tokens.md",
          items,
        ),
      );
    } else {
      inlineTokensSection = callback(
        items.join(`
`),
      ).replace(
        /^## Tokens\n/,
        GENERATED_INLINE_TOKENS_HEADING +
          `
`,
      );
    }
  }
  let componentCards = generateComponentApiCards(declarationText, facts);
  if (componentCards.icons !== null) {
    cards.push(componentCards.icons);
  }
  let assetGroups = Array.isArray(manifest.assetGroups)
    ? (
        manifest.assetGroups as (M.RawDocAssetGroup | null | undefined)[]
      ).filter(
        (group): group is M.CheckedDocAssetGroup =>
          typeof group === "object" &&
          group !== null &&
          typeof group.name === "string" &&
          isPublishableFilePathModelFileTable(
            GENERATED_API_DIRECTORY +
              "assets/" +
              assetDocumentationSlug(group.name) +
              ".md",
          ),
      )
    : [];
  for (let value of assetGroups) {
    let hasFiles = Array.isArray(value.files)
      ? (value.files as (M.RawDocAssetFile | null | undefined)[]).filter(
          (file): file is M.CheckedDocAssetFile =>
            typeof file?.path === "string" &&
            typeof file.id === "string" &&
            BLOB_ID_PATTERN.test(file.id) &&
            isValidDesignSystemPath(file.path),
        )
      : [];
    if (hasFiles.length === 0) {
      continue;
    }
    let usageNotes: string =
        String(hasFiles.length) + (hasFiles.length === 1 ? " file" : " files"),
      assetUsage = (
        assetReadmes[
          DESIGN_SYSTEM_PATHS.assetsDir + value.name + "/README.md"
        ] ?? ""
      ).trim(),
      items = [
        "# Assets · " + sanitizeMarkdownLine(value.name),
        "",
        usageNotes +
          " under " +
          markdownCodeSpan(
            DESIGN_SYSTEM_PATHS.assetsDir + value.name + "/",
          ) +
          // MineDesign: uploads are files in the system's _blobs/ folder, read like any file, and a consumer imports
          // them with its own tool (design_import_asset), not the Artifact tool's read and publish.
          ", held in the system’s upload store: read one as the file " +
          markdownCodeSpan("_blobs/<id>.<ext>") +
          " in this system’s directory, the id below as " +
          markdownCodeSpan("<id>") +
          " (they are not files under that folder — a read by that path fails), then add it to your own work as an asset (" +
          markdownCodeSpan("design_import_asset") +
          ", where your tool lists that); an SVG may also be inlined. Copy assets, never approximate them.",
        "",
      ];
    if (/^icons?$/i.test(value.name) && facts.icon !== null) {
      items.push(
        "These are the glyphs " +
          markdownCodeSpan(qualifiedName(facts.icon)) +
          " and every " +
          markdownCodeSpan("icon=") +
          " prop render — mount the component wherever the bundle runs; the files are for surfaces without it (a deck)." +
          (componentCards.iconNames.length > 0
            ? " Names: " +
              markdownCodeSpan(GENERATED_API_DIRECTORY + "icons.md") +
              "."
            : ""),
        "",
      );
    }
    items.push(
      "## Use",
      "",
      MARKDOWN_CODE_FENCE + "html",
      '<img src="<the url the asset upload returned for ' +
        sanitizeMarkdownLine(hasFiles[0].path.split("/").at(-1)!) +
        '>" alt="…">',
      MARKDOWN_CODE_FENCE,
      "",
    );
    if (assetUsage !== "") {
      items.push("## Usage notes", "", assetUsage, "");
    }
    items.push(
      "## Files",
      "",
      "| file | fetch |",
      "| --- | --- |",
      ...hasFiles.map(
        (file): string =>
          "| " +
          markdownCodeSpan(markdownTableCell(file.path)) +
          " | " +
          markdownCodeSpan("read " + markdownTableCell(file.id)) +
          " |",
      ),
      "",
    );
    addCard(
      "assets",
      value.name,
      usageNotes + ", by asset id.",
      GENERATED_API_DIRECTORY +
        "assets/" +
        assetDocumentationSlug(value.name) +
        ".md",
      items,
    );
  }
  for (let value of componentCards.components) {
    if (!cardPaths.has(value.path.toLowerCase())) {
      cardPaths.add(value.path.toLowerCase());
      cards.push(value);
    }
  }
  let files = new Map<string, string>(),
    index: Core.ApiDocumentationIndexEntry[] = [];
  for (let value of cards) {
    let fileDescription: string =
      GENERATED_API_FILE_HEADER +
      `
` +
      value.text;
    files.set(value.path, fileDescription);
    index.push({
      kind: value.kind,
      name: value.name,
      purpose: value.purpose,
      path: value.path,
      size: unicodeCharacterCount(fileDescription),
    });
  }
  let cardsOfKind = (kind: string) =>
      index.filter((source): boolean => source.kind === kind),
    hasMigrationGuide = migrationGuide.both,
    consumptionLines = [
      GENERATED_CONSUMPTION_HEADING,
      "",
      ...(hasMigrationGuide ? [STANDALONE_CONSUMPTION_GUIDANCE, ""] : []),
    ],
    readPerThing = [];
  if (cardsOfKind("component").length > 0) {
    readPerThing.push(
      "a component’s props, parts and examples: " +
        markdownCodeSpan(
          GENERATED_API_DIRECTORY + "components/<Comp>.md",
        ),
    );
  }
  if (cardsOfKind("icons").length > 0) {
    readPerThing.push(
      "icon names: " +
        markdownCodeSpan(GENERATED_API_DIRECTORY + "icons.md"),
    );
  }
  if (inlineTokensSection !== "") {
    readPerThing.push("token values: the Tokens section below");
  } else if (cardsOfKind("tokens").length > 0) {
    readPerThing.push(
      "token values: " +
        markdownCodeSpan(
          cardsOfKind("tokens").length === 1 &&
            cardsOfKind("tokens")[0].path ===
              GENERATED_API_DIRECTORY + "tokens.md"
            ? GENERATED_API_DIRECTORY + "tokens.md"
            : GENERATED_API_DIRECTORY + "tokens/<group>.md",
        ),
    );
  }
  if (cardsOfKind("assets").length > 0) {
    readPerThing.push(
      "stored assets and their paths: " +
        markdownCodeSpan(
          GENERATED_API_DIRECTORY + "assets/<Group>.md",
        ),
    );
  }
  let componentCount = facts.comps.filter(
      (component): boolean => !component.page,
    ).length,
    librariesDescription = facts.libs
      .map(
        (component): string =>
          (component.file !== null
            ? markdownCodeSpan(component.file)
            : component.name +
              " " +
              component.version +
              " (not packed in this system: bring your own copy)") +
          (component.global !== null
            ? " (" + markdownCodeSpan("window." + component.global) + ")"
            : ""),
      )
      .join(", "),
    rootComponent = facts.comps.find(
      (component) =>
        component.name === (facts.ns ?? "") + "Root" ||
        component.name === "Root" ||
        component.name === (facts.ns ?? "") + "Provider",
    ),
    hasListedPath = (path: string) =>
      !facts.listed || listedPaths.has(path),
    hasComponentReadmes = facts.comps.some((component) => component.readme),
    componentReadmeCode = markdownCodeSpan(
      DESIGN_SYSTEM_PATHS.componentsDir + "<Comp>/README.md",
    ),
    componentGuidance: string =
      ": read each component’s card" +
      (hasComponentReadmes
        ? ", and its README where it has one (" +
          componentReadmeCode +
          "), and build to those guidelines."
        : " and build to it."),
    tokenGuidance: string =
      inlineTokensSection !== "" || cardsOfKind("tokens").length > 0
        ? "the values are " +
          (tokenCardMode === "inline"
            ? "in the Tokens section below"
            : tokenCardMode === "single"
              ? "on " +
                markdownCodeSpan(
                  GENERATED_API_DIRECTORY + "tokens.md",
                )
              : "on the token cards")
        : "";
  if (hasMigrationGuide && facts.comps.length > 0) {
    let value: string =
        String(componentCount) +
        " component" +
        (componentCount === 1 ? "" : "s"),
      tokensCssPath: string = facts.tokensCss
        ? markdownCodeSpan(GENERATED_TOKENS_CSS_PATH) +
          " is every token as a CSS variable plus " +
          markdownCodeSpan("@font-face") +
          " for the fonts"
        : "",
      readmePath: string =
        facts.libs.length > 0 &&
        facts.libs.every(
          (library) => library.name === "react" || library.name === "react-dom",
        )
          ? "; on a Design canvas skip " +
            (facts.libs.length === 1 ? "that file" : "those files") +
            " (the artboard supplies React)"
          : "";
    consumptionLines.push(
      !migrationGuide.script
        ? String(facts.comps.length) +
            " component" +
            (facts.comps.length === 1 ? " is" : "s are") +
            " documented, and the “Design canvas” line above names no script for " +
            (facts.comps.length === 1 ? "it" : "them") +
            componentGuidance +
            (tokensCssPath !== "" ? " " + tokensCssPath + "." : "")
        : facts.ns === null
          ? "The “Design canvas” line above names the script for this system’s " +
            value +
            ", and no global is recorded for " +
            (componentCount === 1 ? "it" : "them") +
            componentGuidance +
            (tokensCssPath !== "" ? " " + tokensCssPath + "." : "")
          : markdownCodeSpan("window." + facts.ns) +
            " is the components’ global (" +
            value +
            "); the “Design canvas” line above names the script that defines it" +
            (tokensCssPath !== "" ? "; " + tokensCssPath : "") +
            "." +
            (librariesDescription !== ""
              ? " That script needs " +
                librariesDescription +
                ", loaded before it" +
                readmePath +
                "."
              : "") +
            (rootComponent !== undefined
              ? " Wrap everything in one " +
                markdownCodeSpan(qualifiedName(rootComponent.name)) +
                ": it scopes the tokens and settings the components read."
              : "") +
            " Build any UI by mounting these components; never hand-build a control or draw an icon the system provides.",
      "",
    );
  } else if (facts.bundle) {
    consumptionLines.push(
      markdownCodeSpan(DESIGN_SYSTEM_PATHS.bundleJs) +
        " defines " +
        markdownCodeSpan("window." + namespace) +
        " (" +
        String(componentCount) +
        " component" +
        (componentCount === 1 ? "" : "s") +
        ")" +
        (facts.css
          ? "; " +
            markdownCodeSpan(DESIGN_SYSTEM_PATHS.bundleCss) +
            " is its stylesheet"
          : "") +
        (facts.tokensCss
          ? "; " +
            markdownCodeSpan(GENERATED_TOKENS_CSS_PATH) +
            " is every token as a CSS variable plus " +
            markdownCodeSpan("@font-face") +
            " for the fonts"
          : "") +
        "." +
        (documentationOptions.cssReadsTokens === true && facts.css && facts.tokensCss
          ? " " +
            markdownCodeSpan(DESIGN_SYSTEM_PATHS.bundleCss) +
            " reads its variables from " +
            markdownCodeSpan(GENERATED_TOKENS_CSS_PATH) +
            "."
          : "") +
        (librariesDescription !== ""
          ? " The bundle needs " +
            librariesDescription +
            ", loaded before it."
          : "") +
        " Build any UI by mounting these components; never hand-build a control or draw an icon the system provides.",
      "",
      "- **Standalone page:** inline " +
        [
          ...(facts.tokensCss
            ? [markdownCodeSpan(GENERATED_TOKENS_CSS_PATH)]
            : []),
          ...(facts.css
            ? [markdownCodeSpan(DESIGN_SYSTEM_PATHS.bundleCss)]
            : []),
        ].join(" and ") +
        (facts.tokensCss || facts.css
          ? " in a " + markdownCodeSpan("<style>") + ", then "
          : "") +
        (facts.libs.length > 0
          ? "the library files and " +
            markdownCodeSpan(DESIGN_SYSTEM_PATHS.bundleJs) +
            " as classic scripts"
          : markdownCodeSpan(DESIGN_SYSTEM_PATHS.bundleJs) +
            " as a classic script") +
        " (a file containing " +
        markdownCodeSpan("</style") +
        ", " +
        markdownCodeSpan("<\/script") +
        " or " +
        markdownCodeSpan("<\!--") +
        " breaks an inline element: write the sequence " +
        markdownCodeSpan("<\\/style") +
        ", " +
        markdownCodeSpan("<\\/script") +
        " or " +
        markdownCodeSpan("\\x3C!--") +
        " in your copy, or load that file by URL)." +
        (rootComponent !== undefined
          ? " Wrap everything in one " +
            markdownCodeSpan(qualifiedName(rootComponent.name)) +
            ": it scopes the tokens and settings the components read."
          : ""),
      "- **Design canvas:** bring " +
        joinEnglishList([
          ...(facts.css
            ? [markdownCodeSpan(DESIGN_SYSTEM_PATHS.bundleCss)]
            : []),
          markdownCodeSpan(DESIGN_SYSTEM_PATHS.bundleJs),
          ...(facts.dts
            ? [
                markdownCodeSpan(DESIGN_SYSTEM_PATHS.indexDts) +
                  " (for the editor’s props panel)",
              ]
            : []),
        ]) +
        " onto the canvas in full, as the canvas type’s design-system components reference says (a server-side copy first where it offers one)" +
        (facts.css ? "; load the stylesheet before the script" : "") +
        (facts.libs.length > 0 &&
        facts.libs.every(
          (library) => library.name === "react" || library.name === "react-dom",
        )
          ? "; skip the library files (the artboard supplies React)"
          : "") +
        "; mount with " +
        markdownCodeSpan(
          '<x-import component-from-global-scope="' +
            qualifiedName("<Comp>") +
            '" …>',
        ) +
        ".",
      "- **Slides deck, or any surface that cannot run the bundle:** " +
        (tokens === null
          ? "this system has no tokens: there is nothing for a deck to take from it."
          : (fontRows.length > 0 ? "tokens and fonts" : "tokens only") +
            (tokenGuidance !== "" ? " — " + tokenGuidance : "") +
            "; the deck takes " +
            markdownCodeSpan(DESIGN_SYSTEM_PATHS.tokens) +
            " by file path for its colour pickers" +
            (fontRows.length > 0
              ? ", and fonts as “Fonts” below says."
              : ".")),
      "",
    );
  } else if (facts.comps.length > 0) {
    consumptionLines.push(
      String(facts.comps.length) +
        " component" +
        (facts.comps.length === 1 ? " is" : "s are") +
        " documented without a runnable " +
        markdownCodeSpan(DESIGN_SYSTEM_PATHS.bundleJs) +
        componentGuidance +
        (tokens === null
          ? ""
          : " Tokens: " +
            (tokenGuidance !== ""
              ? tokenGuidance + "; a Slides deck or Design canvas also takes "
              : "a Slides deck or Design canvas takes ") +
            markdownCodeSpan(DESIGN_SYSTEM_PATHS.tokens) +
            " by file path."),
      "",
    );
  } else if (cardsOfKind("tokens").length > 0) {
    consumptionLines.push(
      "This system ships tokens" +
        (cardsOfKind("assets").length > 0 ? " and assets" : "") +
        ", no components: take colours, type and fonts from the tokens card below for any page, deck or mock-up; a Slides deck or Design canvas also takes " +
        markdownCodeSpan(DESIGN_SYSTEM_PATHS.tokens) +
        // MineDesign: MineDesign's skills, not the platform types' SKILL.md files.
        " by file path (that kind’s skill says how).",
      "",
    );
  } else {
    consumptionLines.push(
      "This system has no readable tokens and no components yet: the text above" +
        (cardsOfKind("assets").length > 0
          ? " and the asset cards below are"
          : " is") +
        " the whole guide.",
      "",
    );
  }
  if (fontRows.length > 0) {
    consumptionLines.push(...fontGuide, "", ...fontTable(), "");
  }
  consumptionLines.push(
    "**Read, per thing:** " +
      (readPerThing.length > 0
        ? readPerThing.join("; ") +
          ". After this README, fetch the cards and fonts you need in ONE message as parallel calls — none depends on another."
        : "this README is the whole guide."),
    "",
  );
  let longReadmes = [
    ...(hasComponentReadmes ? [componentReadmeCode] : []),
    ...(cardsOfKind("assets").some((asset) =>
      hasListedPath(
        DESIGN_SYSTEM_PATHS.assetsDir + asset.name + "/README.md",
      ),
    )
      ? [
          markdownCodeSpan(
            DESIGN_SYSTEM_PATHS.assetsDir + "<Group>/README.md",
          ),
        ]
      : []),
  ];
  consumptionLines.push(
    "**Two rules.** Before you use a thing — a component, a token group, an icon, an asset — read its card from the index below; a value you did not read from a card is a guess. " +
      joinEnglishList([
        ...(tokens !== null
          ? [markdownCodeSpan(DESIGN_SYSTEM_PATHS.tokens)]
          : []),
        markdownCodeSpan(DESIGN_SYSTEM_PATHS.manifest),
        ...(facts.dts
          ? [markdownCodeSpan(DESIGN_SYSTEM_PATHS.indexDts)]
          : []),
        markdownCodeSpan("design-system.json"),
      ]) +
      " are sources for tools: hand them over. " +
      (longReadmes.length > 0
        ? joinEnglishList(longReadmes) +
          (longReadmes.length === 1 ? " is" : " are") +
          " the long-form second read a card links to; "
        : "") +
      // MineDesign: the authoring guidance is MineDesign's design-system skill; no SKILL.md or artifact-type/ sits beside the files.
      (longReadmes.length > 0 ? "the " : "The ") +
      markdownCodeSpan("design-system") +
      " skill is authoring guidance, not needed to consume the system.",
    "",
  );
  let indexLines = [GENERATED_INDEX_HEADING, ""],
    indexLine = (entry: Core.ApiDocumentationIndexEntry): string =>
      "- " +
      markdownCodeSpan(entry.path) +
      " — " +
      entry.purpose +
      " (" +
      formatCardCharacterCount(entry.size) +
      ")";
  if (cardsOfKind("tokens").length > 0) {
    indexLines.push(
      "**Tokens**",
      "",
      ...cardsOfKind("tokens").map(indexLine),
      "",
    );
  }
  if (cardsOfKind("icons").length + cardsOfKind("assets").length > 0) {
    indexLines.push(
      "**Icons and assets**",
      "",
      ...[...cardsOfKind("icons"), ...cardsOfKind("assets")].map(indexLine),
      "",
    );
  }
  if (facts.comps.length > 0) {
    let length = facts.comps.filter((component) => component.page).length;
    indexLines.push(
      "**Components** (" +
        markdownCodeSpan(
          GENERATED_API_DIRECTORY + "components/<Comp>.md",
        ) +
        ", " +
        String(facts.comps.length) +
        (length > 0
          ? "; " + String(length) + " of them showcase pages"
          : "") +
        ")",
      "",
    );
    for (let value of groupDocumentedComponents(facts)) {
      indexLines.push(
        "- " +
          (value[0].group !== "" ? "**" + value[0].group + "**: " : "") +
          value
            .map(
              (component): string =>
                markdownCodeSpan(component.name) +
                (component.page ? " (showcase page)" : "") +
                " — " +
                markdownTableCell(
                  index.find(
                    (source) =>
                      source.kind === "component" &&
                      source.name === component.name,
                  )?.purpose ??
                    (component.summary || component.name),
                ).replace(/\.+$/, ""),
            )
            .join(" · "),
      );
    }
    indexLines.push("");
  }
  if (index.length === 0) {
    indexLines.push(
      inlineTokensSection !== ""
        ? "No cards: the tokens above are this system so far."
        : "No cards: this system has no tokens, components or stored assets yet.",
      "",
    );
  }
  let generatedReadme = (
    consumptionLines.join(`
`) +
    `
` +
    (inlineTokensSection !== ""
      ? inlineTokensSection +
        `
`
      : "") +
    indexLines.join(`
`)
  ).replace(/\uFFFD/g, "");
  return {
    files: files,
    readme:
      (cleanReadme === "" ? "" : cleanReadme + GENERATED_README_SEPARATOR) +
      generatedReadme,
    index: index,
  };
}
function findLegacyReadmeTail(readme: string): number {
  let seen: number = 0;
  for (let value of readme.matchAll(LEGACY_README_SECTION_PATTERN)) {
    if (++seen > 64) {
      break;
    }
    let manifestStart = readme.indexOf(LEGACY_MARKDOWN_FENCE + "json", value.index);
    if (
      manifestStart === -1 ||
      manifestStart - value.index > 600 ||
      !LEGACY_MANIFEST_FENCE_PATTERN.test(readme.slice(manifestStart, manifestStart + 64))
    ) {
      continue;
    }
    let fenceStart = readme.indexOf(
      `
` + LEGACY_MARKDOWN_FENCE,
      manifestStart + 8,
    );
    if (fenceStart === -1) {
      continue;
    }
    let tailText = readme.slice(fenceStart + 1 + LEGACY_MARKDOWN_FENCE.length);
    if (
      tailText.trim() === "" ||
      LEGACY_GENERATED_SECTION_PATTERN.test(tailText)
    ) {
      return value.index;
    }
  }
  return -1;
}
function generatedReadmeTailOffset(readme: string): number {
  let offsets = [
    GENERATED_README_START_PATTERN.exec(readme)?.index ?? -1,
    findLegacyReadmeTail(readme),
  ].filter((index): boolean => index !== -1);
  if (offsets.length === 0) {
    return -1;
  } else {
    return Math.min(...offsets);
  }
}
function stripGeneratedReadmeTail(readme: string): string {
  let tailOffset = generatedReadmeTailOffset(readme);
  if (tailOffset === -1) {
    return readme;
  } else {
    return readme.slice(0, tailOffset);
  }
}
function parseJsonOrNull(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}
function stripCssComments(css: string): string {
  let parts: string[] = [];
  for (let index = 0; ; ) {
    let value = css.indexOf("/*", index);
    parts.push(css.slice(index, value === -1 ? undefined : value));
    let commentEnd = value === -1 ? -1 : css.indexOf("*/", value + 2);
    if (commentEnd === -1) {
      return parts.join(" ");
    }
    index = commentEnd + 2;
  }
}
function stripConditionalCssRules(css: string): string {
  let conditionalPattern: RegExp = /@(?:media|supports|container)\b/gi,
    parts: string[] = [],
    copyOffset = 0,
    offset: number = 0;
  for (
    let value = conditionalPattern.exec(css);
    value !== null && offset < css.length;
    value = conditionalPattern.exec(css)
  ) {
    for (
      offset = Math.max(offset, conditionalPattern.lastIndex);
      offset < css.length && !"{;}".includes(css.charAt(offset));

    ) {
      offset++;
    }
    if (css.charAt(offset) !== "{") {
      continue;
    }
    parts.push(css.slice(copyOffset, value.index));
    for (let count = 1; ++offset < css.length && count > 0; ) {
      count +=
        css.charAt(offset) === "{" ? 1 : css.charAt(offset) === "}" ? -1 : 0;
    }
    copyOffset = conditionalPattern.lastIndex = offset;
  }
  parts.push(css.slice(copyOffset));
  return parts.join(" ");
}
function bundleCssReadsTokens(
  bundleCss: string | null,
  tokensText: string | null,
  files: Core.FileTable,
) {
  if (bundleCss === null) {
    return false;
  }
  let cached = cssReadsTokensCache.find(
    (bundle) => bundle.css === bundleCss && bundle.tokens === tokensText,
  );
  if (cached !== undefined) {
    return cached.reads;
  }
  let tokensCss: string | null = generatedTokensCssForFiles(
      files,
    ),
    cssWithoutComments = stripCssComments(bundleCss),
    declaredVariables = new Set([
      ...firstRegexCaptureValues(
        stripConditionalCssRules(cssWithoutComments),
        CSS_VAR_DECLARATION_PATTERN,
      ),
      ...registeredCssPropertyNames(cssWithoutComments),
    ]),
    tokenVariables = new Set(
      tokensCss === null
        ? []
        : firstRegexCaptureValues(
            stripCssComments(tokensCss),
            CSS_VAR_DECLARATION_PATTERN,
          ),
    ),
    reads = firstRegexCaptureValues(
      cssWithoutComments,
      CSS_VAR_REFERENCE_PATTERN,
    ).some(
      (variable) => !declaredVariables.has(variable) && tokenVariables.has(variable),
    );
  cssReadsTokensCache.unshift({
    css: bundleCss,
    tokens: tokensText,
    reads: reads,
  });
  cssReadsTokensCache.length = Math.min(cssReadsTokensCache.length, 2);
  return reads;
}
function consumptionDocumentationForFiles(files: Core.FileTable, root = "") {
  let cacheKey = [
      stringFileOrNull(files, DESIGN_SYSTEM_PATHS.readme),
      stringFileOrNull(files, DESIGN_SYSTEM_PATHS.tokens),
      stringFileOrNull(files, DESIGN_SYSTEM_PATHS.manifest),
      stringFileOrNull(files, DESIGN_SYSTEM_PATHS.indexDts),
      root,
      stringFileOrNull(files, DESIGN_SYSTEM_PATHS.bundleCss),
    ],
    assetReadmes: Record<string, string> = {};
  for (let value of Object.keys(files)) {
    if (
      value.startsWith(DESIGN_SYSTEM_PATHS.assetsDir) &&
      value.endsWith("/README.md") &&
      value.split("/").length === 3 &&
      typeof files[value] === "string"
    ) {
      assetReadmes[value] = files[value];
    }
  }
  let assetReadmeCacheKey = Object.entries<string>(assetReadmes).map(
      ([key, mappedValue]): string =>
        key +
        `
` +
        mappedValue,
    ).join(`

`),
    cached = consumptionDocumentationCache.find(
      (entry) =>
        entry.notes === assetReadmeCacheKey &&
        entry.key.every(
          (key, index): boolean => key === cacheKey[index],
        ),
    );
  if (cached !== undefined) {
    return cached.out;
  }
  let rawTokens = cacheKey[1] === null ? null : parseJsonOrNull(cacheKey[1]),
    documentation = generateConsumptionDocumentation({
      dts: cacheKey[3] ?? null,
      tokens:
        typeof rawTokens === "object" &&
        rawTokens !== null &&
        !Array.isArray(rawTokens)
          ? parseTokens(rawTokens)
          : null,
      manifest: parseManifest(cacheKey[2] ?? ""),
      readme: stripGeneratedReadmeTail(cacheKey[0] ?? ""),
      assetReadmes: assetReadmes,
      root: root,
      cssReadsTokens: bundleCssReadsTokens(
        cacheKey[5] ?? null,
        cacheKey[1] ?? null,
        files,
      ),
    });
  consumptionDocumentationCache.unshift({
    key: cacheKey,
    notes: assetReadmeCacheKey,
    out: documentation,
  });
  consumptionDocumentationCache.length = Math.min(
    consumptionDocumentationCache.length,
    2,
  );
  return documentation;
}
function generatedConsumptionReadme(files: Core.FileTable, root = "") {
  return consumptionDocumentationForFiles(files, root).readme;
}
export {
  assetDocumentationSlug,
  bundleCssReadsTokens,
  cachedComponentApiCards,
  chooseRegularFontFace,
  COLOR_DOCUMENTATION_GROUPS,
  COLOR_INTERACTION_SUFFIX_PATTERN,
  consumptionDocumentationCache,
  consumptionDocumentationForFiles,
  countSubstring,
  CSS_PROPERTY_DECLARATION_PATTERN,
  CSS_VAR_DECLARATION_PATTERN,
  CSS_VAR_REFERENCE_PATTERN,
  cssReadsTokensCache,
  DEFAULT_TOKEN_CARD_MODE,
  DOCS_GLOBAL_IDENTIFIER_PATTERN,
  documentationManifestFacts,
  escapeRegexPattern,
  findLegacyReadmeTail,
  firstRegexCaptureValues,
  FONT_INSTALL_PATH_PATTERN,
  FONT_INSTALL_PATH_SEGMENT_PATTERN,
  fontConsumptionGuide,
  fontFamilySlug,
  formatCardCharacterCount,
  generateComponentApiCards,
  generateConsumptionDocumentation,
  GENERATED_CONSUMPTION_HEADING,
  GENERATED_INDEX_HEADING,
  GENERATED_INLINE_TOKENS_HEADING,
  GENERATED_README_HEADING_PATTERN_SOURCE,
  GENERATED_README_SEPARATOR,
  GENERATED_README_START_PATTERN,
  generatedConsumptionReadme,
  generatedReadmeTailOffset,
  groupDocumentedComponents,
  humanizeFamilyName,
  inspectStandaloneMigrationGuide,
  isInstallableFontPath,
  joinEnglishList,
  LEGACY_GENERATED_SECTION_PATTERN,
  LEGACY_MANIFEST_FENCE_PATTERN,
  LEGACY_MANIFEST_FENCE_PATTERN_SOURCE,
  LEGACY_MARKDOWN_FENCE,
  LEGACY_QUICK_START_HEADING,
  LEGACY_README_INSTRUCTIONS,
  LEGACY_README_SECTION_PATTERN,
  makeApiDocumentationCard,
  MARKDOWN_CODE_FENCE,
  markdownCodeSpan,
  markdownTableCell,
  MAX_DOCUMENTED_COMPONENTS,
  normalizeTextNewlines,
  OMITTED_API_CARDS_NOTICE,
  OTHER_PAGE_FONT_GUIDANCE,
  PALETTE_RAMP_TOKEN_PATTERN,
  parseJsonOrNull,
  parseMarkdownFence,
  README_SEPARATOR_PATTERN_SOURCE,
  registeredCssPropertyNames,
  sanitizeComponentGroupLabel,
  sanitizeMarkdownLine,
  SLIDES_FONT_GUIDANCE,
  STANDALONE_CONSUMPTION_GUIDANCE,
  STANDALONE_MIGRATION_HEADING,
  STANDALONE_MIGRATION_PREFIXES,
  stringFileOrNull,
  stripConditionalCssRules,
  stripCssComments,
  stripGeneratedReadmeTail,
  tokenFamilySlug,
  truncateUnicodeText,
  unicodeCharacterCount,
  uniqueValues,
};
export function installModelDocumentation(): () => void {
  return () => {
    DEFAULT_TOKEN_CARD_MODE = "single";
    GENERATED_CONSUMPTION_HEADING =
      "## Consuming this system (generated — do not edit)";
    GENERATED_INDEX_HEADING = "## Index (generated — do not edit)";
    GENERATED_INLINE_TOKENS_HEADING = "## Tokens (generated — do not edit)";
    GENERATED_README_SEPARATOR = `

---

`;
    STANDALONE_MIGRATION_HEADING = "## Migrated from the standalone version";
    STANDALONE_MIGRATION_PREFIXES = [
      "- **Design canvas:** copy `project/",
      "- **Slides deck:** copy `project/",
    ];
    STANDALONE_CONSUMPTION_GUIDANCE =
      "To bring this system onto a Design canvas or into a Slides deck, follow the lines “Design canvas” and “Slides deck” under “Migrated from the standalone version” above.";
    OMITTED_API_CARDS_NOTICE =
      "\n> The api/ cards indexed above are not beside this version: with them this system has more files than one version holds. Until it has fewer files, read `components/<Comp>/README.md` and `assets/<Group>/README.md` instead; token values are in `tokens.css`.\n";
    DOCS_GLOBAL_IDENTIFIER_PATTERN = /^[A-Za-z_$][A-Za-z0-9_$]{0,63}$/;
    sanitizeMarkdownLine = (text) =>
      text.replace(/[\r\n\u2028\u2029\uFFFD]+/g, " ");
    sanitizeComponentGroupLabel = (label) =>
      Array.from<string>(
        sanitizeMarkdownLine(label)
          .replace(/[*_`|<>[\]\\]+/g, " ")
          .replace(/ {2,}/g, " ")
          .trim(),
      )
        .slice(0, MAX_COMPONENT_GROUP_LABEL_LENGTH)
        .join("");
    MAX_DOCUMENTED_COMPONENTS = 1024;
    unicodeCharacterCount = (text): number => {
      let index: number = 0;
      for (let value of text) {
        index++;
      }
      return index;
    };
    truncateUnicodeText = (items, maxLength) =>
      items.length <= maxLength
        ? items
        : Array.from<string>(items).slice(0, maxLength).join("");
    countSubstring = (text, delimiter): number =>
      text.split(delimiter).length - 1;
    uniqueValues = (values) => [...new Set(values)];
    formatCardCharacterCount = (count): string =>
      (count % 1000 === 250
        ? (Math.floor(count / 100) / 10).toFixed(1)
        : (count / 1000).toFixed(1)) + "k";
    markdownCodeSpan = (text) => {
      let value: number = Math.max(
          0,
          ...[...(text.match(/`+/g) ?? [])].map((items) => items.length),
        ),
        fence = "`".repeat(value + 1);
      if (value === 0) {
        return fence + text + fence;
      } else {
        return fence + " " + text + " " + fence;
      }
    };
    markdownTableCell = (text) =>
      sanitizeMarkdownLine(text).replace(/\|/g, "\\|");
    MARKDOWN_CODE_FENCE = "```";
    joinEnglishList = (items) =>
      items.length < 2
        ? items.join("")
        : items.slice(0, -1).join(", ") + " and " + items[items.length - 1];
    FONT_INSTALL_PATH_SEGMENT_PATTERN =
      "[A-Za-z0-9_](?:(?:[A-Za-z0-9._-]| (?=[A-Za-z0-9_]))*[A-Za-z0-9_-])?";
    FONT_INSTALL_PATH_PATTERN = new RegExp(
      "^" +
        FONT_INSTALL_PATH_SEGMENT_PATTERN +
        "(?:/" +
        FONT_INSTALL_PATH_SEGMENT_PATTERN +
        ")*$",
    );
    isInstallableFontPath = (path) =>
      FONT_INSTALL_PATH_PATTERN.test(path) &&
      /\.(?:woff2?|ttf|otf)$/i.test(path) &&
      !/(?:^|\/)node_modules\//i.test(path);
    OTHER_PAGE_FONT_GUIDANCE =
      // MineDesign: a font is a file in the system's directory (an id is its _blobs/<id>.<ext>), copied or imported with
      // the consumer's own tools, not the Artifact tool's read and publish.
      "one file per family is enough (below: the upright face nearest regular weight; bold and italic synthesize). Fetch it as the fetch column says (read the file: a path is in this system’s directory, an id is its " +
      markdownCodeSpan("_blobs/<id>.<ext>") +
      "), copy it beside your page or import it as an asset (" +
      markdownCodeSpan("design_import_asset") +
      ", where your tool lists that) and declare it with an " +
      markdownCodeSpan(
        '@font-face { font-family: "<family>"; src: url(<uploaded>) }',
      ) +
      " rule.";
    SLIDES_FONT_GUIDANCE =
      "- **Slides deck:** for each family you use in the deck (" +
      markdownCodeSpan("faces") +
      " holds at most the number of typefaces Slides’ " +
      markdownCodeSpan("deck-files.md") +
      " gives), install its file with the system and name the path it lands on as that family’s " +
      markdownCodeSpan("src") +
      " in " +
      markdownCodeSpan("project/deck.json") +
      " " +
      markdownCodeSpan("faces") +
      ", under the key in the Slides column. A deck takes a font as a file only under the rule in Slides’ " +
      markdownCodeSpan("fonts.md") +
      " (no space or leading underscore in its path, for two): any other font, or one kept by id, is uploaded as " +
      markdownCodeSpan("fonts.md") +
      " says.";
    fontConsumptionGuide = (fontGuidance, includeSlides, pathContext) => {
      let value = pathContext[0] ?? "",
        items = [
          ...(fontGuidance
            ? [
                "- **Design canvas:** copy " +
                  joinEnglishList(
                    [GENERATED_TOKENS_CSS_PATH, ...pathContext].map(
                      markdownCodeSpan,
                    ),
                  ) +
                  " to the same paths under the canvas’s " +
                  markdownCodeSpan("project/ds/<folder>/") +
                  " (" +
                  markdownCodeSpan("<folder>") +
                  " is the folder you install this system under; " +
                  markdownCodeSpan(value) +
                  " lands on " +
                  markdownCodeSpan("project/ds/<folder>/" + value) +
                  "), in the same call that installs this system. Link that copy of " +
                  markdownCodeSpan(GENERATED_TOKENS_CSS_PATH) +
                  " in the artboard’s " +
                  markdownCodeSpan("<head>") +
                  " as " +
                  markdownCodeSpan("ds/<folder>/tokens.css") +
                  ", or as Design’s instructions say for an artboard in a folder. If the install’s reply leaves a font out, bring that font in as for any other page.",
              ]
            : []),
          ...(includeSlides ? [SLIDES_FONT_GUIDANCE] : []),
        ];
      if (!includeSlides) {
        return [
          "Fonts: on a Design canvas, bring the fonts the “Design canvas” line of this system’s README names; in a Slides deck, the fonts its “Slides deck” line names. Both lines are under “Migrated from the standalone version”. Bring any font that line does not name as for any other page.",
          "",
          "- **Any other page:** " + OTHER_PAGE_FONT_GUIDANCE,
        ];
      }
      if (!fontGuidance) {
        return ["Fonts: " + OTHER_PAGE_FONT_GUIDANCE, "", ...items];
      }
      return [
        "Fonts: " +
          markdownCodeSpan(GENERATED_TOKENS_CSS_PATH) +
          " loads each font from its file, by path.",
        "",
        ...items,
        "- **Any other page:** " + OTHER_PAGE_FONT_GUIDANCE,
      ];
    };
    COLOR_DOCUMENTATION_GROUPS = [
      {
        key: "surface",
        get title() { return uiMessage("design-system.documentation.surfaces"); },
        test: /^(?:surface|page|backdrop|background|canvas|paper|ground)/,
      },
      {
        key: "text",
        get title() { return uiMessage("design-system.documentation.text"); },
        test: /^(?:text|oncolor|ink|fg|foreground)/,
      },
      {
        key: "fill",
        get title() { return uiMessage("design-system.documentation.fillsAndStatusBackgrounds"); },
        test: /^(?:fill|on|bg|accent)-/,
      },
      {
        key: "border",
        get title() { return uiMessage("design-system.documentation.bordersAndRings"); },
        test: /^(?:border|ring|alpha|shadow-color|divider|stroke|outline|hairline)/,
      },
      {
        key: "chart",
        get title() { return uiMessage("design-system.documentation.charts"); },
        test: /^chart-/,
      },
      {
        key: "palette",
        get title() { return uiMessage("design-system.documentation.paletteRampsAndBrand"); },
        test: /^/,
      },
    ];
    COLOR_INTERACTION_SUFFIX_PATTERN =
      /-(?:hover|hovered|active|pressed|disabled|focus)$/;
    PALETTE_RAMP_TOKEN_PATTERN = /^([a-z]+)-(\d+)$/;
    makeApiDocumentationCard = (kind, name, purpose, path, details) => ({
      kind: kind,
      name: name,
      purpose: purpose,
      path: path,
      text: details
        .join(
          `
`,
        )
        .replace(/\uFFFD/g, ""),
    });
    cachedComponentApiCards = null;
    tokenFamilySlug = (familyName) =>
      familyName
        .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "") || "x";
    assetDocumentationSlug = (assetName) =>
      assetName.replace(/[^A-Za-z0-9_.]+/g, "-").replace(/^[-.]+|[-.]+$/g, "") ||
      "group";
    normalizeTextNewlines = (text) =>
      text.replace(
        /\r\n?/g,
        `
`,
      );
    LEGACY_QUICK_START_HEADING =
      "## Quick start (generated from tokens.json — do not edit)";
    LEGACY_README_INSTRUCTIONS =
      "Read this README first; the manifest below lists the files to read and every asset — read tokens.css or components/bundle.js only if the page you build uses them, and read_asset an asset id only if you need that asset.";
    escapeRegexPattern = (pattern) =>
      pattern.replace(/[.*+?^$(){}|[\]\\]/g, "\\$&");
    README_SEPARATOR_PATTERN_SOURCE = "\\r?\\n\\r?\\n---\\r?\\n\\r?\\n";
    LEGACY_MARKDOWN_FENCE = "`".repeat(3);
    GENERATED_README_HEADING_PATTERN_SOURCE =
      escapeRegexPattern(GENERATED_CONSUMPTION_HEADING) +
      "|" +
      escapeRegexPattern(LEGACY_QUICK_START_HEADING);
    GENERATED_README_START_PATTERN = new RegExp(
      "(?:" +
        README_SEPARATOR_PATTERN_SOURCE +
        "|^)(?:" +
        GENERATED_README_HEADING_PATTERN_SOURCE +
        ")",
    );
    LEGACY_MANIFEST_FENCE_PATTERN_SOURCE =
      LEGACY_MARKDOWN_FENCE + 'json\\r?\\n\\{\\s*"manifestVersion"';
    LEGACY_README_SECTION_PATTERN = new RegExp(
      README_SEPARATOR_PATTERN_SOURCE +
        "(?=" +
        escapeRegexPattern(LEGACY_README_INSTRUCTIONS) +
        "|" +
        LEGACY_MANIFEST_FENCE_PATTERN_SOURCE +
        ")",
      "g",
    );
    LEGACY_MANIFEST_FENCE_PATTERN = new RegExp(
      LEGACY_MANIFEST_FENCE_PATTERN_SOURCE,
    );
    LEGACY_GENERATED_SECTION_PATTERN = new RegExp(
      README_SEPARATOR_PATTERN_SOURCE +
        "(?:" +
        GENERATED_README_HEADING_PATTERN_SOURCE +
        "|" +
        escapeRegexPattern(LEGACY_README_INSTRUCTIONS) +
        "|" +
        LEGACY_MANIFEST_FENCE_PATTERN_SOURCE +
        ")",
    );
    stringFileOrNull = (files: Core.FileTable, path: string) =>
      typeof files[path] === "string" ? files[path] : null;
    CSS_VAR_REFERENCE_PATTERN = /var\(\s*(--[A-Za-z0-9_-]+)\s*[,)]/gi;
    CSS_VAR_DECLARATION_PATTERN = /(?:^|[;{\s])(--[A-Za-z0-9_-]+)\s*:/g;
    CSS_PROPERTY_DECLARATION_PATTERN = /@property\s+(--[A-Za-z0-9_-]+)\s*\{/gi;
    firstRegexCaptureValues = (text, pattern) =>
      [...text.matchAll(pattern)].map((match) => match[1]);
    registeredCssPropertyNames = (cssText) =>
      [...cssText.matchAll(CSS_PROPERTY_DECLARATION_PATTERN)].flatMap(
        (match) => {
          let value = cssText.slice(
              match.index + match[0].length,
              match.index + match[0].length + 400,
            ),
            closingBraceIndex = value.indexOf("}");
          if (
            closingBraceIndex !== -1 &&
            /\binitial-value\s*:/i.test(value.slice(0, closingBraceIndex))
          ) {
            return [match[1]];
          } else {
            return [];
          }
        },
      );
    cssReadsTokensCache = [];
    consumptionDocumentationCache = [];
  };
}
