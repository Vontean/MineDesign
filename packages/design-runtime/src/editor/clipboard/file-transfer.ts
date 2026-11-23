import { uiMessage } from '@minedesign/contracts/ui-messages';
/** Restored application module; prepare first, initialize in original order. */
import {
  type Dynamic,
} from "../../runtime-types";
import { ClipboardAnnotationsLimit } from "./annotations";
import { artboardBaseName, ClipboardArtboardsResolvedValue, ClipboardArtboardsTextEncoder, fileBaseName, getBlobAssetReferences } from "./artboards";
import { canvasMetadataFile, encodeStorePathSegment, isArtboardFile, isSafeProjectPath, isShapeAnnotation, isSupportedProjectAsset, maxAnnotations as canvasLimit, maxProjectPathChars as maxProjectPathLength, defaultDocumentFileBytes as maxFileContentBytes, maxSyncedFileBytes as maxInlineFileContentBytes, PlatformFileContentWebpAvifPattern, uniqueArtboardFile } from "../../platform/file-content";
import { isProjectSourcePath, renameComponentImports, rewriteProjectReferences } from "../../preview/component-imports";

var ClipboardFileTransferKind: Dynamic;
var ClipboardFileTransferHandler: Dynamic;
var unreadableNotesAndShapesMessage: Dynamic;
var leftOutShapesMessage: Dynamic;
var VideosCanTBePastedFromAnotherMessage: Dynamic;
var ClipboardFileTransferToUpperCase: Dynamic;
var leftOutPicturesAndVideosMessage: Dynamic;
var copyAgainMessage: Dynamic;
var includedPictureMessage: Dynamic;
var ClipboardFileTransferRegistry: Dynamic;
var ClipboardFileTransferPasted: Dynamic;
var ClipboardFileTransferSubscribers: Dynamic;
var ClipboardFileTransferTest: Dynamic;
var isPastableProjectPath: Dynamic;
function isCarryableProjectFile(filePath?: Dynamic): Dynamic {
  let lowerPath: Dynamic = filePath.toLowerCase();
  return (
    isPastableProjectPath(filePath) &&
    isSupportedProjectAsset(filePath) &&
    lowerPath !== canvasMetadataFile &&
    !isArtboardFile(lowerPath) &&
    !ClipboardFileTransferSubscribers.has(fileBaseName(lowerPath)) &&
    !ClipboardFileTransferTest(lowerPath)
  );
}
function dataUrlToBlob(dataUrl?: Dynamic, baseName?: Dynamic): Dynamic {
  let match: Dynamic =
    /^data:([^;,]+)(?:;\s*charset="?[\w-]+"?)?(;base64)?,/i.exec(dataUrl);
  if (!match) return null;
  try {
    let payload: Dynamic = dataUrl.slice(match[0].length),
      bytes: Dynamic = match[2]
        ? Uint8Array.from(
            atob(payload),
            (char?: Dynamic): Dynamic => char.charCodeAt(0),
          )
        : ClipboardArtboardsTextEncoder.encode(
            decodeURIComponent(payload),
          ),
      extension: Dynamic = (match[1].split("/")[1] ?? "png")
        .replace("jpeg", "jpg")
        .replace("svg+xml", "svg");
    return new File([bytes], baseName + "." + extension, {
      type: match[1],
    });
  } catch {
    return null;
  }
}
function detectFontMimeType(bytes?: Dynamic): Dynamic {
  let signature: Dynamic = String.fromCharCode(...bytes.subarray(0, 4));
  return signature === "wOF2"
    ? "font/woff2"
    : signature === "wOFF"
      ? "font/woff"
      : bytes.length < 5 || bytes[4] !== 0
        ? null
        : signature === "OTTO"
          ? "font/otf"
          : signature === "\0\0\0" || signature === "true"
            ? "font/ttf"
            : null;
}
async function dataUrlToFontFile(
  dataUrl?: Dynamic,
  baseName?: Dynamic,
): Promise<Dynamic> {
  let blob: Dynamic = dataUrlToBlob(dataUrl, baseName),
    mimeType: Dynamic = blob
      ? detectFontMimeType(
          new Uint8Array(await blob.slice(0, 5).arrayBuffer()),
        )
      : null;
  return blob && mimeType
    ? new File([blob], baseName + "." + mimeType.slice(5), {
        type: mimeType,
      })
    : null;
}
function fileDataUrl(fileName?: Dynamic, base64?: Dynamic): Dynamic {
  let extension: Dynamic = (
    /\.([a-z0-9]+)$/i.exec(fileName)?.[1] ?? "png"
  ).toLowerCase();
  return (
    "data:" +
    (extension === "jpg"
      ? "image/jpeg"
      : extension === "svg"
        ? "image/svg+xml"
        : "image/" + extension) +
    ";base64," +
    base64.replace(/\s+/g, "")
  );
}
function replaceClipboardReferences(
  source?: Dynamic,
  replacements?: Dynamic,
  budget?: Dynamic,
): Dynamic {
  if (replacements.size === 0) return source;
  let escapeRegExp: Dynamic = (text?: Dynamic): Dynamic =>
      text.replace(
        /[.*+?^${}()|[\]\\/]/g,
        (char?: Dynamic): Dynamic => "\\" + char,
      ),
    pattern: Dynamic = [...replacements.keys()]
      .sort(
        (first?: Dynamic, second?: Dynamic): Dynamic =>
          second.length - first.length,
      )
      .map(escapeRegExp)
      .join("|");
  return source.replace(
    new RegExp("(?:\\.?/)?(" + pattern + ")", "g"),
    (match?: Dynamic, reference?: Dynamic): Dynamic => {
      let replacement: Dynamic =
        reference.startsWith("_blob/") || match === reference
          ? replacements.get(reference)
          : match.slice(0, match.length - reference.length) +
            replacements.get(reference);
      if (budget !== undefined) {
        let growth: Dynamic = replacement.length - match.length;
        if (growth > budget.left) return match;
        growth > 0 && (budget.left -= growth);
      }
      return replacement;
    },
  );
}
function preparePastedArtboardFiles(
  clipboard?: Dynamic,
  existingFiles?: Dynamic,
  useInlineLimit?: Dynamic,
  reservedNames: Dynamic = new Set(),
  maxFileBytes: Dynamic = useInlineLimit
    ? maxInlineFileContentBytes
    : maxFileContentBytes,
): Dynamic {
  let toLowerCase: Dynamic = (text?: Dynamic): Dynamic => text.toLowerCase(),
    mergedFiles: Dynamic = {
      ...existingFiles,
    },
    usedNames: Dynamic = new Set(
      [...Object.keys(existingFiles), ...Object.keys(clipboard.files)].map(toLowerCase),
    ),
    reservedLower: Dynamic = new Set(
      reservedNames === "unknown" ? [] : [...reservedNames].map(toLowerCase),
    ),
    isReserved: Dynamic = (path?: Dynamic): Dynamic =>
      reservedLower.has(toLowerCase(path)) ||
      reservedLower.has(toLowerCase(fileBaseName(path))),
    isNameFree: Dynamic = (path?: Dynamic): Dynamic =>
      !usedNames.has(toLowerCase(path)) && !isReserved(path),
    pathByLowerName: Dynamic = new Map(
      Object.keys(existingFiles).map(
        (path?: Dynamic): Dynamic => [toLowerCase(path), path],
      ),
    ),
    pathByEncodedName: Dynamic = new Map(
      Object.keys(existingFiles).map(
        (path?: Dynamic): Dynamic => [
          encodeStorePathSegment(path),
          path,
        ],
      ),
    ),
    renamedArtboards: Dynamic = new Map(),
    artboardNames: Dynamic = new Set(
      Object.keys(existingFiles)
        .filter(isArtboardFile)
        .map(
          (path?: Dynamic): Dynamic =>
            toLowerCase(artboardBaseName(path)),
        ),
    ),
    seenStems: Dynamic = new Set(),
    boards: Dynamic = clipboard.artboards.map((artboard?: Dynamic): Dynamic => {
      let entry: Dynamic =
          isPastableProjectPath(artboard.stem + ".dc.html") &&
          !ClipboardFileTransferTest(artboard.stem)
            ? artboard
            : {
                ...artboard,
                stem: "Artboard",
              },
        path: Dynamic = uniqueArtboardFile(
          mergedFiles,
          entry.stem,
          useInlineLimit,
        );
      for (
        let count: Dynamic = 2;
        artboardNames.has(toLowerCase(artboardBaseName(path))) ||
        (pathByLowerName.has(toLowerCase(path)) && existingFiles[path] === undefined);
        count += 1
      )
        path = uniqueArtboardFile(
          mergedFiles,
          entry.stem + String(count),
          useInlineLimit,
        );
      artboardNames.add(toLowerCase(artboardBaseName(path)));
      usedNames.add(toLowerCase(path));
      mergedFiles[path] = entry.src;
      let stemName: Dynamic = artboardBaseName(entry.stem);
      !seenStems.has(stemName) &&
        artboardBaseName(path) !== stemName &&
        renamedArtboards.set(stemName, artboardBaseName(path));
      seenStems.add(stemName);
      return {
        path: path,
        entry: entry,
      };
    }),
    renamedFiles: Dynamic = new Map(),
    pathByBaseName: Dynamic = new Map(),
    ambiguousBaseNames: Dynamic = new Set(),
    clipboardFilePaths: Dynamic = Object.keys(clipboard.files);
  for (let filePath of [...clipboardFilePaths, ...Object.keys(existingFiles)] as Dynamic) {
    let lowerBaseName: Dynamic = toLowerCase(fileBaseName(filePath)),
      entry: Dynamic = pathByBaseName.get(lowerBaseName);
    entry !== undefined &&
      entry !== filePath &&
      (toLowerCase(entry) !== toLowerCase(filePath) ||
        (clipboardFilePaths.includes(entry) && clipboardFilePaths.includes(filePath))) &&
      ambiguousBaseNames
        .add(fileBaseName(filePath))
        .add(fileBaseName(entry))
        .add(lowerBaseName);
    pathByBaseName.set(lowerBaseName, filePath);
  }
  for (let filePath of Object.keys(clipboard.files) as Dynamic)
    /\s/.test(filePath) && ambiguousBaseNames.add(fileBaseName(filePath));
  let referenceKey: Dynamic = (filePath?: Dynamic): Dynamic =>
      ambiguousBaseNames.has(fileBaseName(filePath))
        ? filePath
        : fileBaseName(filePath),
    makeUniqueFilePath: Dynamic = (filePath?: Dynamic): Dynamic => {
      let extensionIndex: Dynamic = fileBaseName(filePath).search(
          /(\.[^./]+)+$/,
        ),
        directory: Dynamic = filePath.slice(
          0,
          filePath.length - fileBaseName(filePath).length,
        ),
        [stem, extension]: Dynamic =
          extensionIndex < 0
            ? [fileBaseName(filePath), ""]
            : [
                fileBaseName(filePath).slice(0, extensionIndex),
                fileBaseName(filePath).slice(extensionIndex),
              ],
        suffixFor: Dynamic = (count?: Dynamic): Dynamic =>
          reservedNames === "unknown"
            ? Math.random().toString(36).slice(2, 6).padEnd(4, "0")
            : String(count),
        candidate: Dynamic = directory + stem + "-" + suffixFor(2) + extension;
      for (let count: Dynamic = 3; !isNameFree(candidate); count += 1)
        candidate = directory + stem + "-" + suffixFor(count) + extension;
      return candidate;
    },
    files: Dynamic = {},
    addedNames: Dynamic = new Set(),
    reused: Dynamic = [],
    dropped: Dynamic = [],
    images: Dynamic = {};
  for (let [filePath, fileContent] of Object.entries(clipboard.files) as Dynamic) {
    if (!isCarryableProjectFile(filePath)) continue;
    let existingPath: Dynamic =
      pathByLowerName.get(toLowerCase(filePath)) ??
      (pathByEncodedName.get(encodeStorePathSegment(filePath)) !== filePath
        ? pathByEncodedName.get(encodeStorePathSegment(filePath))
        : undefined);
    if (existingPath !== undefined && existingFiles[existingPath] === fileContent) {
      reused.push(existingPath);
      if (existingPath !== filePath) {
        let keepFullPath: Dynamic =
          referenceKey(filePath) === filePath ||
          filePath.slice(
            0,
            filePath.length - fileBaseName(filePath).length,
          ) !==
            existingPath.slice(
              0,
              existingPath.length - fileBaseName(existingPath).length,
            );
        keepFullPath && ambiguousBaseNames.add(fileBaseName(filePath));
        renamedFiles.set(
          keepFullPath ? filePath : fileBaseName(filePath),
          keepFullPath ? existingPath : fileBaseName(existingPath),
        );
      }
    } else if (
      useInlineLimit &&
      PlatformFileContentWebpAvifPattern.test(filePath) &&
      fileContent.length > maxInlineFileContentBytes
    )
      images[filePath] = fileDataUrl(filePath, fileContent);
    else if (
      ClipboardArtboardsTextEncoder.encode(fileContent).length > maxFileBytes
    ) {
      dropped.push({
        path: filePath,
        get why() { return ((uiMessage("inspector.fileTransfer.overThisCanvasS")) + (String(Math.floor(maxFileBytes / 1024)))) + (" KB file limit"); },
      });
      if (existingPath !== undefined || isReserved(filePath) || reservedNames === "unknown") {
        let uniquePath: Dynamic = makeUniqueFilePath(filePath);
        usedNames.add(toLowerCase(uniquePath));
        renamedFiles.set(
          referenceKey(filePath),
          referenceKey(filePath) === filePath
            ? uniquePath
            : fileBaseName(uniquePath),
        );
      }
    } else if (
      reservedNames !== "unknown" &&
      existingPath === undefined &&
      !addedNames.has(toLowerCase(filePath)) &&
      !boards.some(
        (board?: Dynamic): Dynamic =>
          toLowerCase(board.path) === toLowerCase(filePath),
      ) &&
      !isReserved(filePath)
    ) {
      files[filePath] = fileContent;
      addedNames.add(toLowerCase(filePath));
    } else {
      let uniquePath: Dynamic = makeUniqueFilePath(filePath);
      renamedFiles.set(
        referenceKey(filePath),
        referenceKey(filePath) === filePath
          ? uniquePath
          : fileBaseName(uniquePath),
      );
      files[uniquePath] = fileContent;
      usedNames.add(toLowerCase(uniquePath));
      addedNames.add(toLowerCase(uniquePath));
    }
    mergedFiles[filePath] = fileContent;
  }
  let renamedAmbiguous: Dynamic = new Set(
      [...renamedFiles.keys()].filter(
        (path?: Dynamic): Dynamic =>
          ambiguousBaseNames.has(fileBaseName(path)),
      ),
    ),
    rewriteSource: Dynamic = (source?: Dynamic): Dynamic =>
      rewriteProjectReferences(
        renameComponentImports(source, renamedArtboards),
        renamedFiles,
        renamedAmbiguous,
      );
  for (let board of boards as Dynamic)
    board.entry = {
      ...board.entry,
      src: rewriteSource(board.entry.src),
    };
  for (let filePath of Object.keys(files) as Dynamic)
    isProjectSourcePath(filePath) &&
      (files[filePath] = rewriteSource(files[filePath]));
  return {
    boards: boards,
    files: files,
    reused: reused,
    dropped: dropped,
    images: images,
    ambiguous: ambiguousBaseNames,
  };
}
function remapPastedAssetFiles(
  prepared?: Dynamic,
  blobMap?: Dynamic,
  assetMap?: Dynamic,
  maxBytes: Dynamic = maxFileContentBytes,
): Dynamic {
  let assetByKey: Dynamic = new Map(
      [...assetMap].map(
        ([path, reference]: Dynamic): Dynamic => [
          prepared.ambiguous.has(fileBaseName(path))
            ? path
            : fileBaseName(path),
          reference,
        ],
      ),
    ),
    ambiguousKeys: Dynamic = new Set(
      [...assetByKey.keys()].filter(
        (key?: Dynamic): Dynamic =>
          prepared.ambiguous.has(fileBaseName(key)),
      ),
    ),
    remainingBudget: Dynamic = ClipboardArtboardsResolvedValue,
    withRelativePrefix: Dynamic = (map?: Dynamic, depth?: Dynamic): Dynamic =>
      depth === 0
        ? map
        : new Map(
            [...map].map(
              ([key, assetPath]: Dynamic): Dynamic => [
                key,
                assetPath.startsWith("./")
                  ? "../".repeat(depth) + assetPath.slice(2)
                  : assetPath,
              ],
            ),
          ),
    rewriteSource: Dynamic = (
      source?: Dynamic,
      sourceBudget?: Dynamic,
      boardPath?: Dynamic,
    ): Dynamic => {
      let depth: Dynamic = boardPath.split("/").length - 1,
        relativeBlobMap: Dynamic = withRelativePrefix(blobMap, depth),
        budget: Dynamic = {
          left: Math.max(
            0,
            Math.min(
              sourceBudget -
                ClipboardArtboardsTextEncoder.encode(source).length,
              remainingBudget,
            ),
          ),
        },
        left: Dynamic = budget.left,
        rewritten: Dynamic = rewriteProjectReferences(
          source,
          withRelativePrefix(assetByKey, depth),
          ambiguousKeys,
          budget,
        ),
        blobReplacements: Dynamic = new Map(
          getBlobAssetReferences(rewritten)
            .filter(
              (reference?: Dynamic): Dynamic =>
                relativeBlobMap.has(reference) && relativeBlobMap.get(reference) !== reference,
            )
            .map((reference?: Dynamic): Dynamic => [reference, relativeBlobMap.get(reference)]),
        );
      rewritten = replaceClipboardReferences(rewritten, blobReplacements, budget);
      remainingBudget -= left - budget.left;
      return rewritten;
    };
  for (let board of prepared.boards as Dynamic)
    board.entry = {
      ...board.entry,
      src: rewriteSource(
        board.entry.src,
        maxFileContentBytes,
        board.path,
      ),
    };
  for (let filePath of Object.keys(prepared.files) as Dynamic)
    isProjectSourcePath(filePath) &&
      (prepared.files[filePath] = rewriteSource(prepared.files[filePath], maxBytes, filePath));
}
export {
  ClipboardFileTransferHandler,
  unreadableNotesAndShapesMessage,
  leftOutShapesMessage,
  leftOutPicturesAndVideosMessage,
  copyAgainMessage,
  includedPictureMessage,
  isPastableProjectPath,
  ClipboardFileTransferKind,
  ClipboardFileTransferPasted,
  ClipboardFileTransferRegistry,
  ClipboardFileTransferSubscribers,
  ClipboardFileTransferTest,
  ClipboardFileTransferToUpperCase,
  dataUrlToBlob,
  dataUrlToFontFile,
  detectFontMimeType,
  fileDataUrl,
  isCarryableProjectFile,
  preparePastedArtboardFiles,
  remapPastedAssetFiles,
  replaceClipboardReferences,
  VideosCanTBePastedFromAnotherMessage,
};
export function installEditorClipboardFileTransfer(): () => void {
  return () => {
    ClipboardFileTransferKind = (annotations?: Dynamic): Dynamic => {
      let kindOf: Dynamic = (source?: Dynamic): Dynamic =>
          source.kind === "image"
            ? "picture"
            : isShapeAnnotation(source)
              ? "shape"
              : "note",
        kinds: Dynamic = ["note", "shape", "picture"].filter(
          (kind?: Dynamic): Dynamic =>
            annotations.some(
              (annotation?: Dynamic): Dynamic => kindOf(annotation) === kind,
            ),
        ),
        countText: Dynamic = String(annotations.length);
      return kinds.length === 1
        ? countText + " " + kinds[0] + (annotations.length === 1 ? "" : "s")
        : countText +
            " " +
            kinds
              .slice(0, -1)
              .map((kind?: Dynamic): Dynamic => kind + "s")
              .join(", ") +
            " and " +
            kinds.at(-1) +
            "s";
    };
    ClipboardFileTransferHandler = (
      count?: Dynamic,
      noun?: Dynamic,
    ): Dynamic =>
      count === 1 ? "1 " + noun : String(count) + " " + noun + "s";
    unreadableNotesAndShapesMessage = (count?: Dynamic): Dynamic =>
      `; ${count === 1 ? "1 note or shape" : String(count) + " notes and shapes"} could not be read`;
    leftOutShapesMessage = (count?: Dynamic): Dynamic =>
      `; ${count === 1 ? "1 shape" : String(count) + " shapes"} left out (copy ${count === 1 ? "it" : "them"} with an artboard to bring ${count === 1 ? "it" : "them"})`;
    VideosCanTBePastedFromAnotherMessage =
      uiMessage("inspector.fileTransfer.videosCanTBePasted");
    ClipboardFileTransferToUpperCase = (text?: Dynamic): Dynamic =>
      text.charAt(0).toUpperCase() + text.slice(1);
    leftOutPicturesAndVideosMessage = (
      total?: Dynamic,
      videoCount: Dynamic = 0,
    ): Dynamic => {
      let pictureCount: Dynamic = total - videoCount;
      return (
        (videoCount > 0
          ? `; ${ClipboardFileTransferHandler(videoCount, "video")} left out (${VideosCanTBePastedFromAnotherMessage})`
          : "") +
        (pictureCount > 0
          ? `; ${ClipboardFileTransferHandler(pictureCount, "picture")} left out (${copyAgainMessage(pictureCount)})`
          : "")
      );
    };
    copyAgainMessage = (count?: Dynamic): Dynamic =>
      `copy ${count === 1 ? "it" : "them"} again, or add ${count === 1 ? "it" : "them"} to this canvas instead`;
    includedPictureMessage = (count?: Dynamic): Dynamic =>
      `the copied ${count === 1 ? uiMessage("inspector.fileTransfer.pictureWasnT") : uiMessage("inspector.fileTransfer.picturesWerenT")} included`;
    ClipboardFileTransferRegistry = {
      pasted: (
        annotations?: Dynamic,
        pictureTotal?: Dynamic,
        unreadCount: Dynamic = 0,
        leftOutShapeCount: Dynamic = 0,
        summary: Dynamic = {},
      ): Dynamic =>
        (annotations.length > 0
          ? uiMessage("inspector.fileTransfer.pasted") +
            ClipboardFileTransferKind(annotations) +
            " from another canvas"
          : uiMessage("inspector.fileTransfer.nothingPasted")) +
        (unreadCount > 0 ? unreadableNotesAndShapesMessage(unreadCount) : "") +
        (leftOutShapeCount > 0 ? leftOutShapesMessage(leftOutShapeCount) : "") +
        (annotations.length > 0 && (summary.plain ?? 0) > 0
          ? ClipboardFileTransferRegistry.plainPictures(summary.plain ?? 0, false)
          : "") +
        ((summary.failed ?? 0) > 0
          ? ClipboardFileTransferRegistry.notBrought(summary.failed ?? 0)
          : "") +
        ((summary.overCap ?? 0) > 0
          ? `; ${ClipboardFileTransferHandler(summary.overCap ?? 0, uiMessage("inspector.fileTransfer.morePicture"))} left out (a paste brings up to ${String(ClipboardAnnotationsLimit)}: copy the rest separately)`
          : "") +
        leftOutPicturesAndVideosMessage(pictureTotal, summary.videos),
      withObjects: (annotations?: Dynamic): Dynamic =>
        " with " + ClipboardFileTransferKind(annotations),
      onlyLeftOut: (pictureTotal?: Dynamic, videoCount: Dynamic = 0): Dynamic =>
        pictureTotal - videoCount <= 0
          ? uiMessage("inspector.fileTransfer.nothingToPasteAddHere", { reason: String(VideosCanTBePastedFromAnotherMessage), items: String(videoCount === 1 ? "the video" : "them") })
          : uiMessage("inspector.fileTransfer.nothingToPasteReasons", { firstReason: String(includedPictureMessage(pictureTotal - videoCount)), secondReason: String(ClipboardFileTransferToUpperCase(copyAgainMessage(pictureTotal - videoCount))) }) +
            (videoCount > 0
              ? ` ${ClipboardFileTransferToUpperCase(VideosCanTBePastedFromAnotherMessage)}.`
              : ""),
      onlyShapes:
        "Nothing to paste: shapes paste into another canvas only together with an artboard. Copy them with one to bring them.",
      alsoLeftOut: (pictureTotal?: Dynamic, videoCount: Dynamic = 0): Dynamic =>
        (videoCount > 0
          ? ` ${ClipboardFileTransferToUpperCase(VideosCanTBePastedFromAnotherMessage)}.`
          : "") +
        (pictureTotal - videoCount > 0
          ? ` ${ClipboardFileTransferToUpperCase(includedPictureMessage(pictureTotal - videoCount))}: ${copyAgainMessage(pictureTotal - videoCount)}.`
          : ""),
      notBrought: (count?: Dynamic): Dynamic =>
        `; ${ClipboardFileTransferHandler(count, "picture")} could not be brought over (try again, or add ${count === 1 ? "it" : "them"} to this canvas instead)`,
      bringing: (count?: Dynamic): Dynamic =>
        uiMessage("inspector.fileTransfer.pastingPicturesFromAnotherCanvas", { pictures: String(count === 1 ? "a picture" : String(count) + " pictures") }),
      stillPasting: "Still working on the previous paste\u2026",
      picturesNotReady: (count?: Dynamic): Dynamic =>
        uiMessage("inspector.fileTransfer.copiedPicturesNotReady", { notReady: String(count === 1 ? uiMessage("inspector.fileTransfer.onePictureWasnT") : String(count) + " pictures weren't"), pronoun: String(count === 1 ? "it" : "them") }),
      picturesCantGo: (count?: Dynamic): Dynamic =>
        uiMessage("inspector.fileTransfer.copiedPicturesCannotTransfer", { pictures: String(count === 1 ? uiMessage("inspector.fileTransfer.onePicture") : String(count) + " pictures"), pronoun: String(count === 1 ? "it" : "them") }),
      picturesWontFit: (count?: Dynamic): Dynamic =>
        uiMessage("inspector.fileTransfer.copiedPicturesDidNotFit", { pictures: String(count === 1 ? uiMessage("inspector.fileTransfer.onePicture") : String(count) + " pictures") }),
      picturesOverCap: (count?: Dynamic): Dynamic =>
        uiMessage("inspector.fileTransfer.copiedPicturesOverLimit", { limit: String(String(ClipboardAnnotationsLimit)), remaining: String(count === 1 ? "one" : String(count)) }),
      wontFitPictures:
        "Couldn't paste: this would make the canvas too large to save. Delete something here first.",
      atLimit: uiMessage("inspector.fileTransfer.couldnTPasteThisWould", { limit: String(String(canvasLimit)) }),
      tooMuchUnasked:
        "Nothing pasted: this is more than can be pasted from another canvas at once. Copy fewer notes at a time.",
      tooMuchStayed:
        "Nothing pasted: this is more than can be pasted from another canvas at once. Copy less at a time.",
      leftOutCaveat: leftOutPicturesAndVideosMessage,
      unreadable:
        "Nothing to paste: the copied notes and shapes could not be read.",
      tooLargeToCopy:
        "Copied. This is more than can be pasted into another canvas at once: copy less at a time. Paste here still works.",
      tooManyNotesToCopy:
        "Copied. This is more than can be pasted into another canvas at once: copy fewer notes at a time. Paste here still works.",
      stayedBehind:
        "; the notes and shapes stayed behind (too large to come with the artboards)",
      tooLargeBesideArtboards:
        "Copied. The artboards will paste into another canvas, but the notes and shapes won't fit with them: copy fewer of them with the artboards. Paste here still works.",
      wontFit:
        "Couldn't paste: the notes would make this canvas too large to save. Copy fewer at a time, or delete something here first.",
      notLanded:
        "; nothing else you copied was pasted (it would take this canvas past its limit: copy less at a time, or delete something here first)",
      notRead: "; the notes and shapes could not be read",
      plainShapes: (count?: Dynamic): Dynamic =>
        `; ${count === 1 ? "1 shape lost its styling" : String(count) + " shapes lost their styling"} (Paste with code keeps it)`,
      plainPictures: (count?: Dynamic, canPasteWithCode?: Dynamic): Dynamic =>
        `; ${ClipboardFileTransferHandler(count, "picture")} lost some effects (${canPasteWithCode ? uiMessage("inspector.fileTransfer.pasteWithCodeKeepsThem") : `to keep them, copy ${count === 1 ? "it" : "them"} with an artboard and choose Paste with code`})`,
      notesTooMuch:
        "; the notes were left out: copy fewer at a time (this is more than can be pasted from another canvas at once)",
      someUnread: unreadableNotesAndShapesMessage,
      alsoUnread: (count?: Dynamic): Dynamic =>
        ` ${count === 1 ? "1 note or shape" : String(count) + " notes and shapes"} could not be read.`,
      notesStayedToo:
        " The notes and shapes are too large to go with the artboards: copy fewer of them with the artboards.",
      notEither: " The notes and shapes were not pasted either.",
      pressAgain: (key?: Dynamic): Dynamic =>
        uiMessage("inspector.fileTransfer.pressAgainToPaste", { shortcut: String(key) }),
    };
    ClipboardFileTransferPasted = (message?: Dynamic, annotations?: Dynamic): Dynamic =>
      annotations.length > 0 &&
      message === ClipboardFileTransferRegistry.pasted(annotations, 0);
    ClipboardFileTransferSubscribers = new Set([
      "support.js",
      "react.js",
      "react-dom.js",
    ]);
    ClipboardFileTransferTest = (path?: Dynamic): Dynamic =>
      /^(?:artifact-type|project)\//i.test(path);
    isPastableProjectPath = (path?: Dynamic): Dynamic =>
      isSafeProjectPath(path) &&
      path.length <= maxProjectPathLength - 16;
  };
}
