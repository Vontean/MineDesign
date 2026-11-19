/** Restored application module; prepare first, initialize in original order. */
import {
  type Dynamic,
} from "../../runtime-types";
import { ClipboardFileTransferHandler_7, ClipboardFileTransferSubscribers, ClipboardFileTransferTest, isCarryableProjectFile } from "./file-transfer";
import { isLoadingArtboardHtml } from "../../platform/design-document-adapter";
import { artboardAppearanceProperties, artboardSpecFromProps, canvasMetadataFile, isArtboardFile, isProjectTextFilePath, isTypeDeclarationPath, PlatformFileContentFilesValue, PlatformFileContentLimit_8 as maxProjectPathLength, PlatformFileContentResolvedValue_11 as maxFileContentBytes, PlatformFileContentWebpAvifPattern } from "../../platform/file-content";
import { isEmulatorBlobUrl } from "../../platform/image-upload";
import { getImportedArtboardNames, isProjectSourcePath } from "../../preview/component-imports";
import { collectProjectDependencyFiles } from "../../preview/dependency-graph";

var ClipboardArtboardsResolvedValue: Dynamic;
var ClipboardArtboardsLimit: Dynamic;
var maxAssetBytes: Dynamic;
var ClipboardArtboardsBlobBlobPattern: Dynamic;
var ClipboardArtboardsDataImagePattern: Dynamic;
var ClipboardArtboardsDataTextPattern: Dynamic;
var ClipboardArtboardsTest: Dynamic;
var ClipboardArtboardsDataFontPattern: Dynamic;
var anyDataFontPattern: Dynamic;
var isFontDataUrl: Dynamic;
var maxFontAssets: Dynamic;
var ClipboardArtboardsConstant: Dynamic;
var isSupportedAssetDataUrl: Dynamic;
var maxReferencedAssetFiles: Dynamic;
var ClipboardArtboardsReplace: Dynamic;
var isCarryableAssetPath: Dynamic;
var ClipboardArtboardsAZaZPattern: Dynamic;
var artboardGap: Dynamic;
var maxOffset: Dynamic;
var ClipboardArtboardsBlobPattern: Dynamic;
var ClipboardArtboardsBlobHttpsPattern: Dynamic;
var stripArtboardExtension: Dynamic;
var artboardBaseName: Dynamic;
var fileBaseName: Dynamic;
var clipboardSourceStrings: Dynamic;
var ClipboardArtboardsTextEncoder: Dynamic;
var ClipboardArtboardsEncode: Dynamic;
var ClipboardArtboardsMax: Dynamic;
function referencedAssetFiles(sourceStrings?: Dynamic, candidateFiles?: Dynamic): Dynamic {
  if (candidateFiles.length === 0) return [];
  let referencedBlobs: Dynamic = new Set(sourceStrings.flatMap(getBlobAssetReferences)),
    referencedPaths: Dynamic = new Set(
      candidateFiles
        .filter((file?: Dynamic): Dynamic => referencedBlobs.has(file.ref))
        .map(
          (file?: Dynamic): Dynamic =>
            ClipboardArtboardsReplace(file.path),
        ),
    );
  return candidateFiles
    .filter(
      (file?: Dynamic): Dynamic =>
        referencedPaths.has(ClipboardArtboardsReplace(file.path)) &&
        isCarryableAssetPath(file.path),
    )
    .slice(0, maxReferencedAssetFiles);
}
function getBlobAssetReferences(source?: Dynamic): Dynamic {
  let references: Dynamic = new Set();
  if (source.includes("_blob/"))
    for (let match of source.matchAll(
      ClipboardArtboardsBlobPattern,
    ) as Dynamic)
      references.add("_blob/" + match[1]);
  if (source.includes("blob:") && isEmulatorBlobUrl("blob:"))
    for (let match of source.matchAll(
      ClipboardArtboardsBlobHttpsPattern,
    ) as Dynamic)
      references.add(match[0]);
  return [...references];
}
function collectArtboardClipboardSource(
  selectedArtboards?: Dynamic,
  artboardSpecs?: Dynamic,
  files?: Dynamic,
): Dynamic {
  let loadedArtboards: Dynamic = selectedArtboards.filter(
    (artboard?: Dynamic): Dynamic =>
      typeof files[artboard.file] == "string" &&
      !isLoadingArtboardHtml(files[artboard.file]),
  );
  if (loadedArtboards.length === 0) return null;
  let originX: Dynamic = Math.min(
      ...loadedArtboards.map((artboard?: Dynamic): Dynamic => artboard.x),
    ),
    originY: Dynamic = Math.min(
      ...loadedArtboards.map((artboard?: Dynamic): Dynamic => artboard.y),
    ),
    toClipboardArtboard: Dynamic = (
      spec?: Dynamic,
      offsetX?: Dynamic,
      offsetY?: Dynamic,
    ): Dynamic => ({
      src: files[spec.file],
      stem: stripArtboardExtension(spec.file),
      dx: offsetX,
      dy: offsetY,
      w: spec.w,
      h: spec.h,
      ...(spec.title
        ? {
            title: spec.title,
          }
        : {}),
      ...artboardAppearanceProperties(spec),
    }),
    clipboardArtboards: Dynamic = loadedArtboards.map(
      (artboard?: Dynamic): Dynamic =>
        toClipboardArtboard(artboard, artboard.x - originX, artboard.y - originY),
    ),
    artboardFileByName: Dynamic = new Map(
      Object.keys(files)
        .filter(isArtboardFile)
        .map(
          (file?: Dynamic): Dynamic => [artboardBaseName(file), file],
        ),
    ),
    includedFiles: Dynamic = new Set(
      loadedArtboards.map((artboard?: Dynamic): Dynamic => artboard.file),
    ),
    nextImportX: Dynamic =
      Math.max(
        ...clipboardArtboards.map((placed?: Dynamic): Dynamic => placed.dx + placed.w),
      ) + artboardGap;
  for (let index: Dynamic = 0; index < clipboardArtboards.length; index++)
    for (let importedName of getImportedArtboardNames(
      clipboardArtboards[index].src,
    ) as Dynamic) {
      let entry: Dynamic = artboardFileByName.get(importedName);
      if (
        entry === undefined ||
        includedFiles.has(entry) ||
        isLoadingArtboardHtml(files[entry])
      )
        continue;
      includedFiles.add(entry);
      let importedSpec: Dynamic = artboardSpecs.find(
        (spec?: Dynamic): Dynamic => spec.file === entry,
      ) ?? {
        file: entry,
        x: 0,
        y: 0,
        ...artboardSpecFromProps({}),
      };
      clipboardArtboards.push(toClipboardArtboard(importedSpec, nextImportX, 0));
      nextImportX += importedSpec.w + artboardGap;
    }
  let nonArtboardFiles: Dynamic = {};
  for (let [filePath, fileContent] of Object.entries(files) as Dynamic)
    !isArtboardFile(filePath) &&
      filePath !== canvasMetadataFile &&
      (nonArtboardFiles[filePath] = fileContent);
  let carriedFiles: Dynamic = {};
  for (let placedArtboard of clipboardArtboards as Dynamic) {
    let artboardPath: Dynamic = placedArtboard.stem + ".dc.html";
    for (let [dependencyPath, dependencyContent] of Object.entries(
      collectProjectDependencyFiles(
        {
          ...nonArtboardFiles,
          [artboardPath]: placedArtboard.src,
        },
        artboardPath,
      ),
    ) as Dynamic)
      dependencyPath !== artboardPath && (carriedFiles[dependencyPath] = dependencyContent);
  }
  return {
    artboards: clipboardArtboards,
    carried: carriedFiles,
    origin: {
      x: originX,
      y: originY,
    },
  };
}
function clipboardBlobAssets(
  selectedArtboards?: Dynamic,
  artboardSpecs?: Dynamic,
  files?: Dynamic,
  heldFiles: Dynamic = [],
): Dynamic {
  if (
    !Object.values(files).some(
      (content?: Dynamic): Dynamic =>
        getBlobAssetReferences(content).length > 0,
    )
  )
    return [];
  let source: Dynamic = collectArtboardClipboardSource(
    selectedArtboards,
    artboardSpecs,
    files,
  );
  if (source === null) return [];
  let sourceStrings: Dynamic = clipboardSourceStrings(source);
  return [
    ...new Set([
      ...sourceStrings.flatMap(getBlobAssetReferences),
      ...referencedAssetFiles(sourceStrings, heldFiles).map(
        (file?: Dynamic): Dynamic => file.ref,
      ),
    ]),
  ];
}
function buildArtboardClipboard(
  selectedArtboards?: Dynamic,
  artboardSpecs?: Dynamic,
  files?: Dynamic,
  readAsset?: Dynamic,
  heldFiles: Dynamic = [],
): Dynamic {
  let source: Dynamic = collectArtboardClipboardSource(
    selectedArtboards,
    artboardSpecs,
    files,
  );
  if (source === null) return null;
  let {
      artboards: artboards,
      carried: carriedFiles,
      origin: origin,
    }: Dynamic = source,
    assets: Dynamic = {},
    missingRefs: Dynamic = new Set(),
    unsupportedRefs: Dynamic = new Set(),
    fontAssets: Dynamic = new Map(),
    fontsLeftOut: Dynamic = 0,
    sourceStrings: Dynamic = clipboardSourceStrings(source),
    heldAssetFiles: Dynamic = referencedAssetFiles(sourceStrings, heldFiles);
  for (let assetRef of [
    ...sourceStrings.flatMap(getBlobAssetReferences),
    ...heldAssetFiles.map((file?: Dynamic): Dynamic => file.ref),
  ] as Dynamic) {
    if (
      assets[assetRef] !== undefined ||
      fontAssets.has(assetRef) ||
      missingRefs.has(assetRef) ||
      unsupportedRefs.has(assetRef)
    )
      continue;
    let assetData: Dynamic = readAsset(assetRef);
    assetData === undefined
      ? missingRefs.add(assetRef)
      : assetData.length > maxAssetBytes ||
          !isSupportedAssetDataUrl(assetData)
        ? (unsupportedRefs.add(assetRef),
          anyDataFontPattern.test(assetData) && (fontsLeftOut += 1))
        : ClipboardArtboardsDataFontPattern.test(assetData)
          ? fontAssets.set(assetRef, assetData)
          : Object.keys(assets).length < ClipboardArtboardsLimit
            ? (assets[assetRef] = assetData)
            : missingRefs.add(assetRef);
  }
  let heldMap: Dynamic = Object.fromEntries(
      heldAssetFiles
        .filter(
          (file?: Dynamic): Dynamic => assets[file.ref] !== undefined,
        )
        .map((file?: Dynamic): Dynamic => [file.path, file.ref]),
    ),
    clip: Dynamic = {
      v: 1,
      artboards: artboards,
      files: carriedFiles,
      assets: assets,
      ...(Object.keys(heldMap).length > 0
        ? {
            held: heldMap,
          }
        : {}),
    },
    countSkippedAssets: Dynamic = (): Dynamic => ({
      missingAssets: missingRefs.size,
      unsupportedAssets: unsupportedRefs.size,
    }),
    totalChars: Dynamic = 0;
  for (let artboard of artboards as Dynamic) totalChars += artboard.src.length;
  for (let fileContent of Object.values(carriedFiles) as Dynamic)
    totalChars += fileContent.length;
  for (let assetContent of Object.values(assets) as Dynamic)
    totalChars += assetContent.length;
  if (totalChars > ClipboardArtboardsResolvedValue)
    return {
      clip: clip,
      json: "",
      ...countSkippedAssets(),
      origin: origin,
      tooLarge: true,
    };
  let clipJson: Dynamic = JSON.stringify(clip),
    remainingBudget: Dynamic =
      ClipboardArtboardsResolvedValue -
      clipJson.length -
      ClipboardArtboardsConstant;
  if (remainingBudget < 0)
    for (let fontRef of fontAssets.keys() as Dynamic) unsupportedRefs.add(fontRef);
  if (remainingBudget < 0 || (fontAssets.size === 0 && fontsLeftOut === 0))
    return {
      clip: clip,
      json: clipJson,
      ...countSkippedAssets(),
      origin: origin,
      tooLarge: clipJson.length > ClipboardArtboardsResolvedValue,
    };
  let keptFonts: Dynamic = 0;
  for (let [fontRef, fontData] of fontAssets as Dynamic) {
    let entrySize: Dynamic =
      JSON.stringify(fontRef).length + JSON.stringify(fontData).length + 2;
    keptFonts < maxFontAssets &&
    Object.keys(assets).length < ClipboardArtboardsLimit &&
    entrySize <= remainingBudget
      ? ((assets[fontRef] = fontData), (remainingBudget -= entrySize), (keptFonts += 1))
      : (fontsLeftOut += 1);
  }
  fontsLeftOut > 0 && (clip.fontsLeftOut = fontsLeftOut);
  let finalJson: Dynamic = JSON.stringify(clip);
  return {
    clip: clip,
    json: finalJson,
    ...countSkippedAssets(),
    origin: origin,
    tooLarge: finalJson.length > ClipboardArtboardsResolvedValue,
  };
}
function parseArtboardClipboard(clipboard?: Dynamic): Dynamic {
  if (typeof clipboard != "object" || clipboard === null) return null;
  let parsed: Dynamic = clipboard;
  if (!Array.isArray(parsed.artboards)) return null;
  let totalChars: Dynamic = 0,
    fitsBudget: Dynamic = (text?: Dynamic): Dynamic =>
      (totalChars += text.length) <= ClipboardArtboardsResolvedValue,
    artboards: Dynamic = [];
  for (let rawArtboard of parsed.artboards as Dynamic) {
    if (artboards.length >= PlatformFileContentFilesValue) break;
    if (typeof rawArtboard != "object" || rawArtboard === null) continue;
    let artboardEntry: Dynamic = rawArtboard;
    if (
      typeof artboardEntry.src != "string" ||
      !ClipboardArtboardsEncode(artboardEntry.src)
    )
      continue;
    if (!fitsBudget(artboardEntry.src)) return null;
    let stem: Dynamic =
      typeof artboardEntry.stem == "string" &&
      ClipboardFileTransferHandler_7(artboardEntry.stem + ".dc.html") &&
      !ClipboardFileTransferTest(artboardEntry.stem)
        ? artboardEntry.stem
        : "Artboard";
    artboards.push({
      src: artboardEntry.src,
      stem: stem,
      dx: ClipboardArtboardsMax(artboardEntry.dx),
      dy: ClipboardArtboardsMax(artboardEntry.dy),
      ...artboardSpecFromProps(artboardEntry),
    });
  }
  if (artboards.length === 0) return null;
  let files: Dynamic = {};
  if (typeof parsed.files == "object" && parsed.files !== null) {
    let fileCount: Dynamic = 0;
    for (let [filePath, fileContent] of Object.entries(parsed.files) as Dynamic) {
      if (fileCount >= PlatformFileContentFilesValue) break;
      if (
        !(
          !isCarryableProjectFile(filePath) ||
          typeof fileContent != "string" ||
          !ClipboardArtboardsEncode(fileContent)
        ) &&
        !(
          PlatformFileContentWebpAvifPattern.test(filePath) &&
          !ClipboardArtboardsAZaZPattern.test(fileContent)
        )
      ) {
        if (!fitsBudget(fileContent)) return null;
        files[filePath] = fileContent;
        fileCount += 1;
      }
    }
  }
  let assets: Dynamic = {},
    droppedFonts: Dynamic = 0;
  if (typeof parsed.assets == "object" && parsed.assets !== null) {
    let assetCount: Dynamic = 0,
      fontCount: Dynamic = 0;
    for (let [assetRef, assetData] of Object.entries(parsed.assets) as Dynamic) {
      if (assetCount >= ClipboardArtboardsLimit) break;
      if (
        !(
          !ClipboardArtboardsBlobBlobPattern.test(assetRef) ||
          typeof assetData != "string" ||
          assetData.length > maxAssetBytes ||
          !isSupportedAssetDataUrl(assetData)
        )
      ) {
        if (ClipboardArtboardsDataFontPattern.test(assetData)) {
          if (fontCount >= maxFontAssets) {
            droppedFonts += 1;
            continue;
          }
          fontCount += 1;
        }
        if (!fitsBudget(assetData)) return null;
        assets[assetRef] = assetData;
        assetCount += 1;
      }
    }
  }
  let sourceStrings: Dynamic = [
      ...artboards.map((artboard?: Dynamic): Dynamic => artboard.src),
      ...Object.entries(files)
        .filter(
          ([path]: Dynamic): Dynamic =>
            isProjectSourcePath(path),
        )
        .map(([, content]: Dynamic): Dynamic => content),
    ],
    heldFiles: Dynamic = [];
  if (typeof parsed.held == "object" && parsed.held !== null)
    for (let [heldPath, heldRef] of Object.entries(parsed.held) as Dynamic) {
      if (heldFiles.length >= maxReferencedAssetFiles * 4) break;
      isCarryableAssetPath(heldPath) &&
        typeof heldRef == "string" &&
        assets[heldRef] !== undefined &&
        ClipboardArtboardsTest(assets[heldRef]) &&
        heldFiles.push({
          path: heldPath,
          ref: heldRef,
        });
    }
  let heldMap: Dynamic = Object.fromEntries(
      referencedAssetFiles(sourceStrings, heldFiles).map(
        (file?: Dynamic): Dynamic => [file.path, file.ref],
      ),
    ),
    referencedRefs: Dynamic = new Set([
      ...sourceStrings.flatMap(getBlobAssetReferences),
      ...Object.values(heldMap),
    ]);
  for (let ref of Object.keys(assets) as Dynamic)
    referencedRefs.has(ref) || delete assets[ref];
  let missingCount: Dynamic = [...referencedRefs].filter(
      (ref?: Dynamic): Dynamic => assets[ref] === undefined,
    ).length,
    declaredFontsLeftOut: Dynamic =
      typeof parsed.fontsLeftOut == "number" &&
      Number.isInteger(parsed.fontsLeftOut)
        ? Math.max(0, parsed.fontsLeftOut)
        : 0,
    fontsLeftOutCount: Dynamic = Math.min(
      missingCount,
      declaredFontsLeftOut + droppedFonts,
      ClipboardArtboardsLimit,
    );
  return {
    v: 1,
    artboards: artboards,
    files: files,
    assets: assets,
    ...(Object.keys(heldMap).length > 0
      ? {
          held: heldMap,
        }
      : {}),
    ...(fontsLeftOutCount > 0
      ? {
          fontsLeftOut: fontsLeftOutCount,
        }
      : {}),
  };
}
export {
  artboardBaseName,
  buildArtboardClipboard,
  ClipboardArtboardsAZaZPattern,
  ClipboardArtboardsBlobBlobPattern,
  ClipboardArtboardsBlobHttpsPattern,
  ClipboardArtboardsBlobPattern,
  ClipboardArtboardsConstant,
  maxReferencedAssetFiles as ClipboardArtboardsConstant_2,
  artboardGap as ClipboardArtboardsConstant_3,
  maxOffset as ClipboardArtboardsConstant_4,
  ClipboardArtboardsDataFontPattern,
  anyDataFontPattern as ClipboardArtboardsDataFontPattern_2,
  ClipboardArtboardsDataImagePattern,
  ClipboardArtboardsDataTextPattern,
  ClipboardArtboardsEncode,
  ClipboardArtboardsLimit,
  maxFontAssets as ClipboardArtboardsLimit_2,
  ClipboardArtboardsMax,
  ClipboardArtboardsReplace,
  stripArtboardExtension as ClipboardArtboardsReplace_2,
  ClipboardArtboardsResolvedValue,
  maxAssetBytes as ClipboardArtboardsResolvedValue_2,
  ClipboardArtboardsTest,
  isFontDataUrl as ClipboardArtboardsTest_2,
  isSupportedAssetDataUrl as ClipboardArtboardsTest_3,
  isCarryableAssetPath as ClipboardArtboardsTest_4,
  ClipboardArtboardsTextEncoder,
  clipboardBlobAssets,
  clipboardSourceStrings,
  collectArtboardClipboardSource,
  fileBaseName,
  getBlobAssetReferences,
  parseArtboardClipboard,
  referencedAssetFiles,
};
export function installEditorClipboardArtboards(): () => void {
  return () => {
    ClipboardArtboardsResolvedValue = 8 * 1024 * 1024;
    ClipboardArtboardsLimit = 80;
    maxAssetBytes = 6 * 1024 * 1024;
    ClipboardArtboardsBlobBlobPattern =
      /^(?:_blob\/[0-9a-f]{32}|blob:https?:\/\/[A-Za-z0-9.:-]{1,80}\/[0-9a-f-]{36})$/;
    ClipboardArtboardsDataImagePattern =
      /^data:image\/(?:png|jpe?g|gif|webp|avif|bmp|svg\+xml);base64,[A-Za-z0-9+/=\s]*$/i;
    ClipboardArtboardsDataTextPattern =
      /^data:(?:text\/(?:css|javascript|plain)|application\/json)(?:;\s*charset="?[\w-]+"?)?;base64,[A-Za-z0-9+/=\s]*$/i;
    ClipboardArtboardsTest = (text?: Dynamic): Dynamic =>
      ClipboardArtboardsDataTextPattern.test(text);
    ClipboardArtboardsDataFontPattern =
      /^data:font\/(?:woff2?|ttf|otf);base64,[A-Za-z0-9+/=\s]*$/i;
    anyDataFontPattern = /^data:font\//i;
    isFontDataUrl = (text?: Dynamic): Dynamic =>
      ClipboardArtboardsDataFontPattern.test(text);
    maxFontAssets = 24;
    ClipboardArtboardsConstant = 24;
    isSupportedAssetDataUrl = (dataUrl?: Dynamic): Dynamic =>
      ClipboardArtboardsDataImagePattern.test(dataUrl) ||
      ClipboardArtboardsDataTextPattern.test(dataUrl) ||
      ClipboardArtboardsDataFontPattern.test(dataUrl);
    maxReferencedAssetFiles = 24;
    ClipboardArtboardsReplace = (fileName?: Dynamic): Dynamic =>
      fileName.replace(/\.(?:d\.ts|css|m?js)$/i, "");
    isCarryableAssetPath = (path?: Dynamic): Dynamic =>
      typeof path == "string" &&
      ((isProjectTextFilePath(path) &&
        /\.(?:css|m?js)$/i.test(path)) ||
        isTypeDeclarationPath(path)) &&
      path.length <= maxProjectPathLength - 16 &&
      !/^(?:artifact-type|project)\//i.test(path) &&
      !ClipboardFileTransferSubscribers.has(
        (path.split("/").pop() ?? path).toLowerCase(),
      );
    ClipboardArtboardsAZaZPattern = /^[A-Za-z0-9+/=\s]*$/;
    artboardGap = 80;
    maxOffset = 1e6;
    ClipboardArtboardsBlobPattern = /_blob\/([0-9a-f]{32})(?![0-9a-f])/g;
    ClipboardArtboardsBlobHttpsPattern =
      /blob:https?:\/\/[A-Za-z0-9.:-]{1,80}\/[0-9a-f-]{36}/g;
    stripArtboardExtension = (fileName?: Dynamic): Dynamic =>
      fileName.replace(/\.dc\.html$/, "");
    artboardBaseName = (path?: Dynamic): Dynamic =>
      stripArtboardExtension(path.split("/").pop() ?? path);
    fileBaseName = (path?: Dynamic): Dynamic =>
      path.split("/").pop() ?? path;
    clipboardSourceStrings = (source?: Dynamic): Dynamic => [
      ...source.artboards.map((artboard?: Dynamic): Dynamic => artboard.src),
      ...Object.entries(source.carried)
        .filter(
          ([path]: Dynamic): Dynamic =>
            isProjectSourcePath(path),
        )
        .map(([, content]: Dynamic): Dynamic => content),
    ];
    ClipboardArtboardsTextEncoder = new TextEncoder();
    ClipboardArtboardsEncode = (text?: Dynamic): Dynamic =>
      text.length <= maxFileContentBytes &&
      (text.length * 3 <= maxFileContentBytes ||
        ClipboardArtboardsTextEncoder.encode(text).length <=
          maxFileContentBytes);
    ClipboardArtboardsMax = (amount?: Dynamic, minimum: Dynamic = 0): Dynamic =>
      typeof amount == "number" && Number.isFinite(amount)
        ? Math.max(minimum, Math.min(maxOffset, amount))
        : 0;
  };
}
