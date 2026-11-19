/** Restored application module; prepare first, initialize in original order. */
import type * as Core from "../contracts/model-core";
import type * as Model from "../contracts";
import type {
  DesignSystemContent,
  FileTable,
  ParseReport,
  ParsedDesignSystem,
} from "../contracts";
import { componentCardMetadata, DEFAULT_COMPONENT_PREVIEW_HEIGHT } from "./component-inference";
import { assetKindForPath, blobRelativeUrlModelFilePolicy, COMPONENT_FILENAMES, COMPONENT_NAME_PATTERN, COVER_COMPONENT_NAME, DESIGN_SYSTEM_PATHS, encodeRelativeUrlPath, estimateDataUriBytes, explainUnsafeMirrorPath, fileExtension, GENERATED_TOKENS_CSS_PATH, isHeldFilePointer, isTextFilePath, mimeTypeForPath, parseDataUriHeader, pathBasename, storageKindForFile, storagePointerForFile } from "./file-policy";
import { classifyDesignSystemFile, computeFileBudgetUsage, createParseReport, DESIGN_SYSTEM_INLINE_LIMITS, DESIGN_SYSTEM_MANIFEST_VERSION, estimateEmbeddedStringBytes, isMirrorEligibleFile, MAX_DISPLAYED_DOCUMENTS, MAX_PRETTY_MANIFEST_BYTES, parseFileTable, parseManifest } from "./file-table";
import { lastChangeFromManifest, serializeLastChange } from "./last-change";
import { inferDeclaredLibraries, resolvePreviewLibraries, serializeResolvedLibraries } from "./libraries";
import { DEFAULT_ASSET_TILE_SIZE, isDesignSystemContentObject, ownPropertyOrUndefined, parseAssetGroupMetadata, parseBundleHeader, parseManifestBundleMetadata, sectionTitlesFromManifest, serializeSectionTitles } from "./manifest-metadata";
import { reconcileStorageCatalog, serializeStorageCatalog, storageCatalogFromManifest, storageRecordForFile, uniqueStoredBlobBytes } from "./storage";
import { generatedTokensCssForFiles, parseTokens } from "./tokens";

var hasBundleMetadata: (
  bundle: Pick<ParsedDesignSystem["bundle"], "namespace" | "declared">,
) => boolean;
var DEFAULT_COVER_PREVIEW_HEIGHT: number;
var DEFAULT_SHOWCASE_PREVIEW_WIDTH: number;
var MOBILE_PREVIEW_HEIGHTS: Set<number>;
var MOBILE_PREVIEW_LABEL_PATTERN: RegExp;
var shouldUseDesktopShowcaseWidth: (
  metadata: Model.ComponentCardMetadata,
  name: string,
) => boolean;
var UNGROUPED_ASSETS_NAME: string;
var heldFileBaseUrl: string | undefined;
var parsedDesignSystemCache: WeakMap<DesignSystemContent, ParsedDesignSystem>;
var parsedDesignSystemBudgetCache: WeakMap<
  DesignSystemContent,
  WeakMap<Core.PageBudgetProvider, ParsedDesignSystem>
>;
var MAX_COMPONENT_SUMMARY_LENGTH: number;
function parseDesignSystemContent(
  source: unknown,
  report?: ParseReport,
  parseOptions?: {
    unbounded?: boolean;
  },
): DesignSystemContent {
  let parseReport = report ?? createParseReport();
  parseReport.dropped.length = 0;
  parseReport.warnings.length = 0;
  let content = isDesignSystemContentObject(source) ? source : {};
  return {
    v: 2,
    files: parseFileTable(content.files, parseReport, parseOptions),
  };
}
function assetRelativeGroupKey(
  asset: Pick<Model.ParsedAsset, "name" | "subpath">,
) {
  if (asset.subpath !== "") {
    return asset.subpath + "/" + asset.name;
  } else {
    return asset.name;
  }
}
function isWallAssetKind(kind: Model.AssetKind) {
  return kind === "image" || kind === "svg";
}
function orderAssetTiles<Asset extends { key: string; wall: boolean }>(
  assets: Asset[],
  order: string[],
) {
  let rank = new Map(order.map((asset, index) => [asset, index])),
    rankForAsset = (asset: Asset, fallbackIndex: number) =>
      rank.get(asset.key) ?? order.length + fallbackIndex,
    sorted: Asset[] = assets
      .map((asset, index): [Asset, number] => [
        asset,
        rankForAsset(asset, index),
      ])
      .sort((left, right) => left[1] - right[1])
      .map((rankedAsset) => rankedAsset[0]);
  return [
    ...sorted.filter((asset) => asset.wall),
    ...sorted.filter((asset): boolean => !asset.wall),
  ];
}
function markdownDocumentTitle(markdown: string) {
  return (
    markdown
      .replace(/^`{3,}[^`\n]*\n[\s\S]*?\n`{3,}/gm, "")
      .match(/^#\s+(.+)$/m)?.[1] ?? ""
  ).trim();
}
function humanizeDocumentFilename(path: string) {
  let title = pathBasename(path)
    .replace(/\.[^.]+$/, "")
    .replace(/^\d+[-_]/, "")
    .replace(/[-_]+/g, " ")
    .trim();
  if (title === "") {
    return path;
  } else {
    return title.charAt(0).toUpperCase() + title.slice(1);
  }
}
function assetGroupSlug(name: string, usedSlugs?: Set<string>) {
  let slug = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
  if (slug === "") {
    slug = "group";
  }
  if (usedSlugs !== undefined) {
    let count: number = 2,
      value = slug;
    while (usedSlugs.has(slug)) {
      slug = value + "-" + String(count++);
    }
    usedSlugs.add(slug);
  }
  return slug;
}
function isClaudeEmulator() {
  let runtime = globalThis as Core.EmulatorFlags;
  // MineDesign: the host is globalThis.designSystemHost (packages/design-system/src/editor/design-system-host.ts), not globalThis.claude.
  return (
    runtime.designSystemHost?.__emulator === true ||
    runtime.window?.designSystemHost?.__emulator === true
  );
}
function setHeldFileBaseUrl(baseUrl: string | undefined): void {
  heldFileBaseUrl = baseUrl;
}
function filePreviewUrl(
  files: FileTable,
  path: string,
  catalog?: Model.StorageCatalog,
) {
  let content = files[path];
  if (content === undefined) {
    return null;
  }
  let pointer = storagePointerForFile(path, content);
  if (pointer !== null) {
    if (pointer.store === "file") {
      if (
        heldFileBaseUrl !== undefined &&
        isHeldFilePointer(path, content)
      ) {
        return heldFileBaseUrl + encodeRelativeUrlPath(path);
      } else {
        return null;
      }
    }
    let value = catalog?.files[path];
    if (
      value !== undefined &&
      value.id === pointer.id &&
      value.url !== undefined &&
      isClaudeEmulator()
    ) {
      return value.url;
    } else {
      return blobRelativeUrlModelFilePolicy(pointer.id);
    }
  }
  if (isTextFilePath(path)) {
    return (
      "data:" +
      mimeTypeForPath(path) +
      ";charset=utf-8," +
      encodeURIComponent(content)
    );
  }
  if (parseDataUriHeader(content) !== null) {
    return content;
  } else {
    return null;
  }
}
function isDataUriUrl(url: string) {
  return /^data:/i.test(url);
}
function binaryFileBytes(
  files: FileTable,
  path: string,
  catalog: Model.StorageCatalog,
) {
  let content = files[path];
  if (content === undefined) {
    return 0;
  }
  if (parseDataUriHeader(content) !== null) {
    return estimateDataUriBytes(content);
  }
  return storageRecordForFile(files, catalog, path)?.bytes ?? 0;
}
function inferFontFamilyFromFilename(name: string) {
  return (
    name
      .replace(/\.[a-z0-9]+$/i, "")
      .replace(
        /[-_](roman|regular|italic|italics|variable|web|bold|light|medium|\d+x\d+)/gi,
        "",
      )
      .replace(/[-_]+/g, " ")
      .trim() || name
  );
}
function parsedDesignSystem(
  content: DesignSystemContent,
  budgetProvider?: {
    pageBytes?(path: string): number | undefined;
  },
): ParsedDesignSystem {
  if (budgetProvider === undefined) {
    let entry = parsedDesignSystemCache.get(content);
    if (entry !== undefined) {
      return entry;
    }
    let value = parseDesignSystemFiles(content.files);
    parsedDesignSystemCache.set(content, value);
    return value;
  }
  let byBudget = parsedDesignSystemBudgetCache.get(content);
  if (byBudget === undefined) {
    parsedDesignSystemBudgetCache.set(content, (byBudget = new WeakMap()));
  }
  let cached = byBudget.get(budgetProvider);
  if (cached === undefined) {
    byBudget.set(
      budgetProvider,
      (cached = parseDesignSystemFiles(content.files, budgetProvider)),
    );
  }
  return cached;
}
function parseDesignSystemFiles(
  files: FileTable,
  budgetProvider?: {
    pageBytes?(path: string): number | undefined;
  },
): ParsedDesignSystem {
  let readme = files[DESIGN_SYSTEM_PATHS.readme] ?? "",
    tokensReport: ParseReport = {
      dropped: [],
      warnings: [],
    },
    tokens = parseTokens(
      files[DESIGN_SYSTEM_PATHS.tokens] ?? "",
      tokensReport,
    ),
    metaReport: ParseReport = {
      dropped: [],
      warnings: [],
    },
    manifest = parseManifest(
      files[DESIGN_SYSTEM_PATHS.manifest] ?? "",
      metaReport,
    ),
    bundleMetadata = parseManifestBundleMetadata(
      manifest,
      metaReport,
    ),
    assetsMeta = parseAssetGroupMetadata(manifest, metaReport),
    lastChange = lastChangeFromManifest(manifest, metaReport),
    storage = storageCatalogFromManifest(manifest, metaReport),
    sectionTitles = sectionTitlesFromManifest(manifest),
    bundleJs = files[DESIGN_SYSTEM_PATHS.bundleJs] ?? null,
    bundleHeader =
      bundleJs !== null ? parseBundleHeader(bundleJs) : null,
    namespace = bundleHeader?.namespace ?? bundleMetadata.namespace ?? null,
    hasLibraryFile = (path: string) =>
      classifyDesignSystemFile(path) === "componentLib" &&
      Object.hasOwn(files, path),
    declaredLibraries = bundleMetadata.libraries ?? [],
    inferredLibraries =
      bundleJs !== null
        ? inferDeclaredLibraries(
            declaredLibraries,
            hasLibraryFile,
          )
        : declaredLibraries,
    libraries = resolvePreviewLibraries(
      inferredLibraries,
      hasLibraryFile,
    ),
    loadedLibraryPaths = new Set(libraries.load.map((library) => library.file)),
    declarations: { path: string; text: string }[] = [],
    componentFiles = new Map<string, Core.ComponentFileSources>(),
    docs: ParsedDesignSystem["docs"] = [],
    docsLeftOut: string[] = [],
    otherFiles: string[] = [];
  for (let value of Object.keys(files).sort()) {
    let fileKind = classifyDesignSystemFile(value);
    if (fileKind === "doc") {
      let fileContents = files[value];
      if (
        docs.length < MAX_DISPLAYED_DOCUMENTS &&
        (budgetProvider?.pageBytes?.(value) ??
          estimateEmbeddedStringBytes(fileContents)) <=
          DESIGN_SYSTEM_INLINE_LIMITS.readme
      ) {
        docs.push({
          path: value,
          title:
            markdownDocumentTitle(fileContents) || humanizeDocumentFilename(value),
          markdown: fileContents,
        });
      } else {
        docsLeftOut.push(value);
      }
    }
    if (
      fileKind === "dts" &&
      !value.startsWith(DESIGN_SYSTEM_PATHS.archivedDir)
    ) {
      declarations.push({
        path: value,
        text: files[value],
      });
    }
    if (
      fileKind === "preview" ||
      fileKind === "componentReadme" ||
      (fileKind === "dts" &&
        value.startsWith(DESIGN_SYSTEM_PATHS.componentsDir))
    ) {
      let parts = value
          .slice(DESIGN_SYSTEM_PATHS.componentsDir.length)
          .split("/"),
        componentName = parts[0];
      if (
        parts.length !== 2 ||
        !COMPONENT_NAME_PATTERN.test(componentName)
      ) {
        if (fileKind !== "dts") {
          otherFiles.push(value);
        }
        continue;
      }
      if (fileKind === "dts" && parts[1] !== componentName + ".d.ts") {
        continue;
      }
      let componentEntry = componentFiles.get(componentName) ?? {
        preview: null,
        readme: null,
        dts: null,
      };
      if (fileKind === "preview") {
        componentEntry.preview = files[value];
      } else if (fileKind === "componentReadme") {
        componentEntry.readme = files[value];
      } else {
        componentEntry.dts = value;
      }
      componentFiles.set(componentName, componentEntry);
    } else if (fileKind === "componentLib") {
      if (!loadedLibraryPaths.has(value)) {
        otherFiles.push(value);
      }
    } else if (fileKind === "componentOther" || fileKind === "other") {
      otherFiles.push(value);
    }
  }
  declarations.sort((left, right): number =>
    left.path === DESIGN_SYSTEM_PATHS.indexDts
      ? -1
      : right.path === DESIGN_SYSTEM_PATHS.indexDts
        ? 1
        : left.path < right.path
          ? -1
          : 1,
  );
  let coverFiles = componentFiles.get(COVER_COMPONENT_NAME),
    coverPreview =
      bundleHeader?.components.includes(COVER_COMPONENT_NAME) ===
        true ||
      coverFiles?.readme != null ||
      coverFiles?.dts != null
        ? null
        : (coverFiles?.preview ?? null),
    cover =
      coverPreview !== null
        ? {
            previewHtml: coverPreview,
            height:
              componentCardMetadata(coverPreview)?.height ??
              DEFAULT_COVER_PREVIEW_HEIGHT,
          }
        : null,
    components: Model.ParsedComponent[] = [],
    componentNames = new Set<string>(),
    addComponent = (componentName: string, listingKind: "header" | "files"): void => {
      if (
        componentNames.has(componentName) ||
        (componentName === COVER_COMPONENT_NAME && coverPreview !== null)
      ) {
        return;
      }
      componentNames.add(componentName);
      let entry = componentFiles.get(componentName),
        value = entry?.preview ?? null,
        componentMetadata =
          value !== null ? componentCardMetadata(value) : null,
        guidelinesPath: string | null =
          entry?.readme != null
            ? DESIGN_SYSTEM_PATHS.componentsDir +
              componentName +
              "/" +
              COMPONENT_FILENAMES.readme
            : null,
        isPage = componentMetadata?.page === true && listingKind !== "header";
      components.push({
        name: componentName,
        previewHtml: value,
        guidelinesMd: guidelinesPath !== null ? files[guidelinesPath] : null,
        guidelinesPath: guidelinesPath,
        dts: entry?.dts != null ? files[entry.dts] : null,
        dtsPath: entry?.dts ?? null,
        group: componentMetadata?.group ?? "",
        subtitle: componentMetadata?.subtitle ?? "",
        floor: componentMetadata?.floor === true,
        page: isPage,
        previewHeight:
          componentMetadata?.height ?? DEFAULT_COMPONENT_PREVIEW_HEIGHT,
        previewWidth:
          componentMetadata?.width ??
          (componentMetadata !== null &&
          isPage &&
          shouldUseDesktopShowcaseWidth(componentMetadata, componentName)
            ? DEFAULT_SHOWCASE_PREVIEW_WIDTH
            : null),
        listedBy: listingKind,
      });
    };
  if (bundleHeader !== null) {
    for (let value of bundleHeader.components) {
      addComponent(value, "header");
    }
  }
  for (let value of [...componentFiles.keys()].sort()) {
    if (
      componentFiles.get(value)?.preview != null ||
      componentFiles.get(value)?.readme != null
    ) {
      addComponent(value, "files");
    }
  }
  let fonts: Model.ParsedFont[] = [],
    fontPaths = new Set<string>(),
    makeFont = (
      fontFace: Model.FontFace | null,
      fontPath: string,
    ): Model.ParsedFont => {
      let value = files[fontPath],
        fontFileName = pathBasename(fontPath);
      return {
        path: fontPath,
        fileName: fontFileName,
        family:
          fontFace !== null ? fontFace.family : inferFontFamilyFromFilename(fontFileName),
        weight: fontFace !== null ? fontFace.weight : "400",
        style:
          fontFace !== null
            ? fontFace.style
            : /italic/i.test(fontFileName)
              ? "italic"
              : "normal",
        format: fileExtension(fontPath),
        src:
          value !== undefined &&
          (parseDataUriHeader(value) !== null ||
            storagePointerForFile(fontPath, value) !== null)
            ? (filePreviewUrl(files, fontPath, storage) ?? "")
            : "",
        store:
          value !== undefined
            ? storageKindForFile(fontPath, value)
            : "inline",
        bytes: binaryFileBytes(files, fontPath, storage),
        referenced: fontFace !== null,
        missing: value === undefined,
      };
    };
  for (let value of tokens.type.fonts) {
    fonts.push(makeFont(value, value.file));
    fontPaths.add(value.file);
  }
  for (let value of Object.keys(files)) {
    if (
      value.startsWith(DESIGN_SYSTEM_PATHS.fontsDir) &&
      !fontPaths.has(value)
    ) {
      fonts.push(makeFont(null, value));
    }
  }
  let assetsByGroup = new Map<string, Model.ParsedAsset[]>(),
    assetCount: number = 0;
  for (let value of Object.keys(files)) {
    if (!value.startsWith(DESIGN_SYSTEM_PATHS.assetsDir)) {
      continue;
    }
    let segments = value
        .slice(DESIGN_SYSTEM_PATHS.assetsDir.length)
        .split("/"),
      assetName = segments.pop()!,
      assetGroup = segments.length > 0 ? segments.shift()! : UNGROUPED_ASSETS_NAME,
      assetSubpath = segments.join("/"),
      assetContents = files[value],
      isTextAsset =
        isTextFilePath(value) &&
        storagePointerForFile(value, assetContents) === null,
      state: Model.ParsedAsset = {
        path: value,
        name: assetName,
        group: assetGroup,
        subpath: assetSubpath,
        ext: fileExtension(value),
        mime: mimeTypeForPath(value),
        kind: assetKindForPath(value),
        isText: isTextAsset,
        store: storageKindForFile(value, assetContents),
        bytes: isTextAsset
          ? assetContents.length
          : binaryFileBytes(files, value, storage),
      },
      groupAssets = assetsByGroup.get(assetGroup) ?? [];
    groupAssets.push(state);
    assetsByGroup.set(assetGroup, groupAssets);
    assetCount++;
  }
  let groupNames = [
      ...assetsMeta.groups.filter((groupName) => assetsByGroup.has(groupName)),
      ...[...assetsByGroup.keys()].filter(
        (groupName): boolean => !assetsMeta.groups.includes(groupName),
      ),
    ],
    usedSlugs = new Set<string>(),
    assetGroups = groupNames.map((groupName) => {
      let entry = assetsByGroup.get(groupName)!,
        values = new Set(
          entry.map((asset) => assetRelativeGroupKey(asset)),
        ),
        value = (
          ownPropertyOrUndefined(assetsMeta.orders, groupName) ?? []
        ).filter((asset) => values.has(asset)),
        orderedAssets = orderAssetTiles(
          entry.map((source) => ({
            key: assetRelativeGroupKey(source),
            wall: isWallAssetKind(source.kind),
            a: source,
          })),
          value,
        ).map((asset) => asset.a);
      return {
        name: groupName,
        slug: assetGroupSlug(groupName, usedSlugs),
        tile:
          ownPropertyOrUndefined(assetsMeta.tiles, groupName) ??
          DEFAULT_ASSET_TILE_SIZE,
        order: value,
        assets: orderedAssets,
      };
    });
  return {
    files: files,
    readme: readme,
    docs: docs,
    docsLeftOut: docsLeftOut,
    tokens: tokens,
    tokensReport: tokensReport,
    assetsMeta: assetsMeta,
    lastChange: lastChange,
    sectionTitles: sectionTitles,
    metaReport: metaReport,
    bundle: {
      js: bundleJs,
      css: files[DESIGN_SYSTEM_PATHS.bundleCss] ?? null,
      dts: declarations,
      header: bundleHeader,
      namespace: namespace,
      declared: inferredLibraries,
      libraries: libraries,
      jsBytes:
        bundleJs !== null
          ? estimateEmbeddedStringBytes(bundleJs)
          : 0,
    },
    components: components,
    cover: cover,
    fonts: fonts,
    assetFonts: assetGroups.flatMap((assetGroup) =>
      assetGroup.assets
        .filter((source): boolean => source.kind === "font")
        .map((asset) => makeFont(null, asset.path)),
    ),
    assetGroups: assetGroups,
    assetCount: assetCount,
    otherFiles: otherFiles.sort(),
    storage: storage,
    blobBytesUsed: uniqueStoredBlobBytes(storage),
    bytes: computeFileBudgetUsage(
      files,
      (filePath) =>
        storageRecordForFile(files, storage, filePath)?.bytes ?? 0,
      (filePath) => budgetProvider?.pageBytes?.(filePath),
    ),
  };
}
function componentGuidelineSummary(markdown: string | null) {
  if (markdown === null) {
    return "";
  }
  return summarizeMarkdownParagraph(firstMarkdownParagraphLines(markdown));
}
function firstMarkdownParagraphLines(markdown: string) {
  let inFence: boolean = false,
    htmlTerminator: string | null = null,
    lines: string[] = [];
  for (let value of markdown.split(/\r?\n/)) {
    let trimmedMarkdown = value.trim();
    if (htmlTerminator !== null) {
      if (trimmedMarkdown.includes(htmlTerminator)) {
        htmlTerminator = null;
      }
      continue;
    }
    if (
      /^~~~/.test(trimmedMarkdown) ||
      (/^```/.test(trimmedMarkdown) && !trimmedMarkdown.replace(/^`+/, "").includes("`"))
    ) {
      inFence = !inFence;
      if (lines.length > 0) {
        break;
      }
      continue;
    }
    if (inFence) {
      continue;
    }
    if (trimmedMarkdown === "") {
      if (lines.length > 0) {
        break;
      }
      continue;
    }
    if (trimmedMarkdown.startsWith("<\!--") && !trimmedMarkdown.includes("-->")) {
      htmlTerminator = "-->";
      if (lines.length > 0) {
        break;
      }
      continue;
    }
    if (/^<\/?[!A-Za-z][^>]*$/.test(trimmedMarkdown)) {
      htmlTerminator = ">";
      if (lines.length > 0) {
        break;
      }
      continue;
    }
    if (/^(={3,}|-{3,})$/.test(trimmedMarkdown) && lines.length === 1) {
      lines.length = 0;
      continue;
    }
    if (
      /^#{1,6}(\s|$)/.test(trimmedMarkdown) ||
      /^(-{3,}|\*{3,}|_{3,}|={3,})$/.test(trimmedMarkdown) ||
      trimmedMarkdown.startsWith("|") ||
      /^<\/?[!A-Za-z][^>]*>?$/.test(trimmedMarkdown) ||
      /^(import|export)\s/.test(trimmedMarkdown)
    ) {
      if (lines.length > 0) {
        break;
      }
      continue;
    }
    lines.push(trimmedMarkdown);
  }
  return lines;
}
function summarizeMarkdownParagraph(lines: string[]) {
  let plainText = lines.join(" ");
  plainText = plainText
    .replace(/<\!--[\s\S]*?-->/g, " ")
    .replace(/<\/?[A-Za-z][^>]*>/g, " ")
    .replace(/!\[[^\]]*\]\([^)]*\)/g, " ")
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/\[([^\]]*)\]\[[^\]]*\]/g, "$1")
    .replace(/`([^`]*)`/g, "$1")
    .replace(/(\*\*|__)(.+?)\1/g, "$2")
    .replace(/(^|[\s(])[*_]([^*_]+)[*_](?=[\s).,;:!?]|$)/g, "$1$2")
    .replace(/~~(.+?)~~/g, "$1")
    .replace(/^\s*(?:[-*+]|\d+[.)])\s+/, "")
    .replace(/^\s*>\s*/, "")
    .replace(/\\([\\`*_{}[\]()#+\-.!>~|])/g, "$1")
    .replace(/\s+/g, " ")
    .trim();
  if (plainText === "") {
    return "";
  }
  let sentenceEnd = /[.!?](?=\s+[A-Z0-9"'\u201c\u2018(\[]|\s*$)/.exec(
      plainText,
    ),
    summary =
      sentenceEnd !== null
        ? plainText.slice(0, sentenceEnd.index + 1)
        : plainText;
  if (Array.from(summary).length > MAX_COMPONENT_SUMMARY_LENGTH) {
    summary =
      Array.from(summary)
        .slice(0, MAX_COMPONENT_SUMMARY_LENGTH - 1)
        .join("")
        .trimEnd() + "…";
  }
  return summary;
}
function componentManifestEntry(component: Model.ParsedComponent) {
  let entry: Core.ComponentManifestEntry = {
    name: component.name,
  };
  if (component.group !== "") {
    entry.group = component.group;
  }
  let summary = componentGuidelineSummary(component.guidelinesMd);
  if (summary !== "") {
    entry.summary = summary;
  }
  if (component.page) {
    entry.page = true;
  }
  return entry;
}
function manifestMirrorFilePaths(files: FileTable) {
  let paths =
    generatedTokensCssForFiles(files) !== null
      ? [GENERATED_TOKENS_CSS_PATH]
      : [];
  for (let value of Object.keys(files)) {
    if (
      isMirrorEligibleFile(value, files[value]) &&
      value !== DESIGN_SYSTEM_PATHS.readme &&
      value !== DESIGN_SYSTEM_PATHS.manifest &&
      value !== DESIGN_SYSTEM_PATHS.tokens &&
      !value.startsWith(DESIGN_SYSTEM_PATHS.archivedDir) &&
      explainUnsafeMirrorPath(value) === null
    ) {
      paths.push(value);
    }
  }
  return paths.sort();
}
function buildDesignSystemManifest(system: ParsedDesignSystem, name: string): Core.DesignSystemManifestResult {
  let lastChange = serializeLastChange(system.lastChange),
    storage: Model.StorageCatalog = reconcileStorageCatalog(
      system.files,
      system.storage,
    ),
    serializedStorage = serializeStorageCatalog(storage),
    sections = serializeSectionTitles(system.sectionTitles);
  return {
    manifestVersion: DESIGN_SYSTEM_MANIFEST_VERSION,
    name: name,
    namespace: system.bundle.namespace,
    files: manifestMirrorFilePaths(system.files),
    libraries: serializeResolvedLibraries(
      system.bundle.declared,
      system.bundle.libraries,
    ),
    components: system.components.map(componentManifestEntry),
    ...(lastChange !== undefined
      ? {
          lastChange: lastChange,
        }
      : {}),
    assetGroups: system.assetGroups.map((assetGroup) => {
      let value = assetGroup.assets.flatMap((asset) => {
        let blobId = storage.files[asset.path]?.id;
        if (blobId !== undefined) {
          return [
            {
              path: asset.path,
              id: blobId,
            },
          ];
        } else {
          return [];
        }
      });
      return {
        name: assetGroup.name,
        ...(assetGroup.tile !== DEFAULT_ASSET_TILE_SIZE
          ? {
              tile: assetGroup.tile,
            }
          : {}),
        ...(assetGroup.order.length > 0
          ? {
              order: assetGroup.order,
            }
          : {}),
        ...(value.length > 0
          ? {
              files: value,
            }
          : {}),
      };
    }),
    ...(serializedStorage !== undefined
      ? {
          storage: serializedStorage,
        }
      : {}),
    ...(sections !== undefined
      ? {
          sections: sections,
        }
      : {}),
  };
}
function serializeDesignSystemManifest(manifest: unknown) {
  return stringifyManifestWithinBudget(manifest);
}
function stringifyManifestWithinBudget(manifest: unknown): string {
  let pretty: string =
    JSON.stringify(manifest, null, 2) +
    `
`;
  if (
    estimateEmbeddedStringBytes(pretty) <=
    MAX_PRETTY_MANIFEST_BYTES
  ) {
    return pretty;
  }
  return (
    JSON.stringify(manifest) +
    `
`
  );
}
export {
  assetGroupSlug,
  assetRelativeGroupKey,
  binaryFileBytes,
  buildDesignSystemManifest,
  componentGuidelineSummary,
  componentManifestEntry,
  DEFAULT_COVER_PREVIEW_HEIGHT,
  DEFAULT_SHOWCASE_PREVIEW_WIDTH,
  filePreviewUrl,
  firstMarkdownParagraphLines,
  hasBundleMetadata,
  heldFileBaseUrl,
  humanizeDocumentFilename,
  inferFontFamilyFromFilename,
  isClaudeEmulator,
  isDataUriUrl,
  isWallAssetKind,
  manifestMirrorFilePaths,
  markdownDocumentTitle,
  MAX_COMPONENT_SUMMARY_LENGTH,
  MOBILE_PREVIEW_HEIGHTS,
  MOBILE_PREVIEW_LABEL_PATTERN,
  orderAssetTiles,
  parsedDesignSystem,
  parsedDesignSystemBudgetCache,
  parsedDesignSystemCache,
  parseDesignSystemContent,
  parseDesignSystemFiles,
  serializeDesignSystemManifest,
  setHeldFileBaseUrl,
  shouldUseDesktopShowcaseWidth,
  stringifyManifestWithinBudget,
  summarizeMarkdownParagraph,
  UNGROUPED_ASSETS_NAME,
};
export function installModelDeriveSystem(): () => void {
  return () => {
    hasBundleMetadata = (metadata) =>
      metadata.namespace !== null || metadata.declared.length > 0;
    DEFAULT_COVER_PREVIEW_HEIGHT = 280;
    DEFAULT_SHOWCASE_PREVIEW_WIDTH = 1280;
    MOBILE_PREVIEW_HEIGHTS = new Set([
      736, 780, 812, 844, 852, 874, 896, 915, 926, 932, 956, 1112, 1133, 1180,
      1194, 1366,
    ]);
    MOBILE_PREVIEW_LABEL_PATTERN =
      /mobile|android|tablet|iphone|ipad|smartphone|(^|[^a-z])(ios|phone)/;
    shouldUseDesktopShowcaseWidth = (asset, label): boolean => {
      let value = asset.height ?? 0;
      if (
        value < 700 ||
        MOBILE_PREVIEW_HEIGHTS.has(value) ||
        /^components?$/i.test((asset.group ?? "").trim())
      ) {
        return false;
      }
      let labelParts = [
        asset.group,
        label,
        label.replace(/([a-z\d])([A-Z])/g, "$1 $2"),
        asset.subtitle,
      ]
        .join(" ")
        .toLowerCase();
      return !MOBILE_PREVIEW_LABEL_PATTERN.test(labelParts);
    };
    UNGROUPED_ASSETS_NAME = "Other";
    parsedDesignSystemCache = new WeakMap();
    parsedDesignSystemBudgetCache = new WeakMap();
    MAX_COMPONENT_SUMMARY_LENGTH = 160;
  };
}
