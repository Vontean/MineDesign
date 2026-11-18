/** Restored application module; prepare first, initialize in original order. */
import {
  type Dynamic,
} from "../runtime-types";
import { resolveProjectAssetPath } from "./asset-rewriting";
import { maskHtmlRawContent } from "./html-scanner";

var isProjectSourcePath: Dynamic;
var componentImportTagPattern: Dynamic;
var isHtmlWhitespace: Dynamic;
var namedHtmlEntities: Dynamic;
var artboardNameOf: Dynamic;
var isArtboardImport: Dynamic;
function scanComponentImports(html?: Dynamic): Dynamic {
  let imports: Dynamic = [];
  componentImportTagPattern.lastIndex = 0;
  for (
    let tagMatch: Dynamic = componentImportTagPattern.exec(html);
    tagMatch !== null;
    tagMatch = componentImportTagPattern.exec(html)
  ) {
    let attributeRanges: Dynamic = {},
      attributeName: Dynamic = "",
      recordAttribute: Dynamic = (start?: Dynamic, end?: Dynamic): Dynamic => {
        let normalizedName: Dynamic = attributeName.toLowerCase();
        (normalizedName === "name" || normalizedName === "component") &&
          attributeRanges[normalizedName] === undefined &&
          (attributeRanges[normalizedName] = [start, end]);
        attributeName = "";
      },
      scanState: Dynamic = "gap",
      quoteChar: Dynamic = "",
      valueStart: Dynamic = -1,
      cursor: Dynamic = tagMatch.index + tagMatch[0].length;
    for (; cursor < html.length; cursor += 1) {
      let char: Dynamic = html[cursor];
      if (scanState === "quoted") {
        char === quoteChar && (recordAttribute(valueStart, cursor), (scanState = "gap"));
        continue;
      }
      if (char === ">" || char === "<") break;
      if (scanState === "gap") {
        if (isHtmlWhitespace(char)) continue;
        char === "/"
          ? (attributeName = "")
          : char === "=" && attributeName !== ""
            ? (scanState = "eq")
            : ((attributeName = char), (scanState = "key"));
      } else if (scanState === "key")
        isHtmlWhitespace(char)
          ? (scanState = "gap")
          : char === "="
            ? (scanState = "eq")
            : char === "/"
              ? ((attributeName = ""), (scanState = "gap"))
              : (attributeName += char);
      else if (scanState === "eq") {
        if (isHtmlWhitespace(char)) continue;
        char === '"' || char === "'"
          ? ((quoteChar = char), (valueStart = cursor + 1), (scanState = "quoted"))
          : ((valueStart = cursor), (scanState = "bare"));
      } else
        isHtmlWhitespace(char) &&
          (recordAttribute(valueStart, cursor), (scanState = "gap"));
    }
    scanState === "bare" && recordAttribute(valueStart, cursor);
    let rangeCandidates: Dynamic = /^<d/i.test(tagMatch[0])
        ? [attributeRanges.name, attributeRanges.component]
        : [attributeRanges.component, attributeRanges.name],
      valueRange: Dynamic =
        rangeCandidates.find(
          (range?: Dynamic): Dynamic =>
            range !== undefined && range[1] > range[0],
        ) ?? rangeCandidates.find((range?: Dynamic): Dynamic => range !== undefined);
    valueRange !== undefined &&
      imports.push({
        at: tagMatch.index,
        tag: html.slice(tagMatch.index, cursor),
        value: html.slice(valueRange[0], valueRange[1]),
        from: valueRange[0] - tagMatch.index,
        to: valueRange[1] - tagMatch.index,
      });
    componentImportTagPattern.lastIndex = cursor;
  }
  return imports;
}
function decodeHtmlAttributeEntities(text?: Dynamic): Dynamic {
  return text.replace(
    /&(amp|lt|gt|quot|apos|#[0-9]{1,7}|#x[0-9a-f]{1,6});/gi,
    (entity?: Dynamic, entityName?: Dynamic): Dynamic => {
      if (entityName[0] !== "#")
        return (
          namedHtmlEntities[entityName.toLowerCase()] ??
          entity
        );
      let codePoint: Dynamic =
        entityName[1] === "x" || entityName[1] === "X"
          ? parseInt(entityName.slice(2), 16)
          : parseInt(entityName.slice(1), 10);
      return codePoint > 0 && codePoint <= 1114111
        ? String.fromCodePoint(codePoint)
        : entity;
    },
  );
}
function containsFileReference(text: string, fileReference: string): boolean {
  for (
    let matchIndex: number = text.indexOf(fileReference);
    matchIndex >= 0;
    matchIndex = text.indexOf(fileReference, matchIndex + 1)
  ) {
    let precedingChar: string = matchIndex === 0 ? "" : text[matchIndex - 1];
    if (precedingChar === "") return true;
    if (
      !/[A-Za-z0-9_.-]/.test(precedingChar) &&
      (precedingChar !== "/" ||
        (text[matchIndex - 2] === "." &&
          !/[A-Za-z0-9_./-]/.test(text[matchIndex - 3] ?? "")))
    )
      return true;
  }
  return false;
}
function getProjectFileDependencies(
  html?: Dynamic,
  candidatePaths?: Dynamic,
  isProjectRelative: Dynamic = false,
  baseDirectory: Dynamic = "",
): Dynamic {
  let importedPaths: Dynamic = new Set();
  for (let componentImport of scanComponentImports(html) as Dynamic) {
    let importPath: Dynamic =
      decodeHtmlAttributeEntities(componentImport.value) + ".dc.html";
    importedPaths.add(
      isProjectRelative
        ? (resolveProjectAssetPath(baseDirectory, importPath) ?? importPath)
        : (importPath.split("/").pop() ?? importPath),
    );
  }
  let mentions: Dynamic = isProjectRelative
      ? containsFileReference
      : (text?: Dynamic, fileReference?: Dynamic): Dynamic =>
          text.includes(fileReference),
    dependencies: Dynamic = [];
  for (let candidatePath of candidatePaths as Dynamic) {
    let candidateName: Dynamic = candidatePath.split("/").pop() ?? candidatePath;
    (importedPaths.has(isProjectRelative ? candidatePath : candidateName) ||
      mentions(html, candidatePath) ||
      (!isProjectRelative && mentions(html, candidateName))) &&
      dependencies.push(candidatePath);
  }
  return dependencies;
}
function getImportedArtboardNames(html?: Dynamic): Dynamic {
  let artboardNames: Dynamic = new Set();
  for (let componentImport of scanComponentImports(
    maskHtmlRawContent(html, {
      bodies: "keep",
    }),
  ) as Dynamic) {
    let importValue: Dynamic = decodeHtmlAttributeEntities(componentImport.value);
    importValue !== "" &&
      isArtboardImport(componentImport.tag, importValue) &&
      artboardNames.add(artboardNameOf(importValue));
  }
  return [...artboardNames];
}
function renameComponentImports(html?: Dynamic, renamedArtboards?: Dynamic): Dynamic {
  if (renamedArtboards.size === 0) return html;
  let output: Dynamic = "",
    copiedUntil: Dynamic = 0;
  for (let componentImport of scanComponentImports(html) as Dynamic) {
    let importValue: Dynamic = decodeHtmlAttributeEntities(componentImport.value),
      newName: Dynamic =
        componentImport.value === "" || !isArtboardImport(componentImport.tag, importValue)
          ? undefined
          : renamedArtboards.get(artboardNameOf(importValue)),
      pathParts: Dynamic = /^(.*\/)?(.+?)(\.dc\.html)?$/i.exec(importValue);
    newName === undefined ||
      pathParts === null ||
      ((output +=
        html.slice(copiedUntil, componentImport.at + componentImport.from) +
        (pathParts[1] ?? "") +
        newName +
        (pathParts[3] ?? "")),
      (copiedUntil = componentImport.at + componentImport.to));
  }
  return output + html.slice(copiedUntil);
}
function rewriteProjectReferences(
  text?: Dynamic,
  replacements?: Dynamic,
  scopedNames: Dynamic = new Set(),
  growthBudget?: Dynamic,
): Dynamic {
  if (replacements.size === 0) return text;
  let namesPattern: Dynamic = [...replacements.keys()]
      .sort(
        (left?: Dynamic, right?: Dynamic): Dynamic =>
          right.length - left.length,
      )
      .map(
        (name?: Dynamic): Dynamic =>
          name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
      )
      .join("|"),
    referencePattern: Dynamic = new RegExp(
      "(^|[^A-Za-z0-9_./-])((?:[A-Za-z0-9_.-]{1,100}/){0,16})(" +
        namesPattern +
        ")(?![A-Za-z0-9_-]|\\.[A-Za-z0-9])",
      "g",
    );
  return text.replace(
    referencePattern,
    (
      match?: Dynamic,
      leadingChar?: Dynamic,
      directoryPrefix?: Dynamic,
      matchedName?: Dynamic,
    ): Dynamic => {
      let directory: Dynamic = directoryPrefix.replace(/^\.\//, ""),
        replacement: Dynamic =
          directory !== "" ? replacements.get(directory + matchedName) : undefined,
        isDirectoryMatch: Dynamic = replacement !== undefined;
      replacement === undefined &&
        !(directory !== "" && scopedNames.has(matchedName)) &&
        (replacement = replacements.get(matchedName));
      if (replacement === undefined) return match;
      let rewritten: Dynamic = /^(?:\.{0,2}\/|_blob\/|blob:|data:|https?:)/.test(
        replacement,
      )
        ? leadingChar + replacement
        : isDirectoryMatch
          ? leadingChar + (directoryPrefix.startsWith("./") ? "./" : "") + replacement
          : leadingChar + directoryPrefix + replacement;
      if (growthBudget !== undefined) {
        let growth: Dynamic = rewritten.length - match.length;
        if (growth > growthBudget.left) return match;
        growth > 0 && (growthBudget.left -= growth);
      }
      return rewritten;
    },
  );
}
function getLinkedProjectFiles(html?: Dynamic, knownPaths?: Dynamic): Dynamic {
  let knownNames: Dynamic = new Set();
  for (let knownPath of knownPaths as Dynamic)
    knownNames.add(knownPath.split("/").pop() ?? knownPath);
  let linkedNames: Dynamic = new Set(),
    maskedHtml: Dynamic = maskHtmlRawContent(html, {
      bodies: "keep",
    });
  for (let linkMatch of maskedHtml.matchAll(
    /<(?:script|link)\b[^>]{0,1000}?\s(?:src|href)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/gi,
  ) as Dynamic) {
    let linkPath: Dynamic =
      decodeHtmlAttributeEntities(
        linkMatch[1] ?? linkMatch[2] ?? linkMatch[3] ?? "",
      ).split(/[?#]/)[0] ?? "";
    if (linkPath === "" || /^(?:[a-z][a-z0-9+.-]*:|\/\/|#)/i.test(linkPath))
      continue;
    let linkName: Dynamic = linkPath.split("/").pop() ?? linkPath;
    /\.(css|m?js|jsx|tsx)$/i.test(linkName) &&
      !knownNames.has(linkName) &&
      linkedNames.add(linkName);
  }
  return [...linkedNames];
}
export {
  containsFileReference,
  decodeHtmlAttributeEntities,
  getImportedArtboardNames,
  getLinkedProjectFiles,
  getProjectFileDependencies,
  isProjectSourcePath,
  namedHtmlEntities as PreviewComponentImportsAmpLtGtConfig,
  isHtmlWhitespace as PreviewComponentImportsHandler,
  componentImportTagPattern as PreviewComponentImportsImportPattern,
  artboardNameOf as PreviewComponentImportsReplace,
  isArtboardImport as PreviewComponentImportsTest,
  renameComponentImports,
  rewriteProjectReferences,
  scanComponentImports,
};
export function installPreviewComponentImports(): () => void {
  return () => {
    isProjectSourcePath = (filePath?: Dynamic): Dynamic =>
      /\.(dc\.html|css|m?js|jsx|tsx)$/i.test(filePath);
    componentImportTagPattern = /<(?:dc|x)-import\b/gi;
    isHtmlWhitespace = (char?: Dynamic): Dynamic =>
      char === " " ||
      char === "	" ||
      char ===
        `
` ||
      char === "\r" ||
      char === "\f";
    namedHtmlEntities = {
      amp: "&",
      lt: "<",
      gt: ">",
      quot: '"',
      apos: "'",
    };
    artboardNameOf = (importPath?: Dynamic): Dynamic =>
      (importPath.split("/").pop() ?? importPath).replace(/\.dc\.html$/i, "");
    isArtboardImport = (
      tag?: Dynamic,
      importValue?: Dynamic,
    ): Dynamic => /^<dc-import/i.test(tag) || /\.dc\.html$/i.test(importValue);
  };
}
