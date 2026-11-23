import { errorMessage } from "../../platform/rate-limiter";
import { getAllFileReferencePaths } from "../../platform/external-files";
import { hasPendingFileOverlay } from "../../design-system/type-declarations";
import { saveExternalFileReference } from "../../platform/external-files";
import { ClipboardArtboardsLimit } from "../../editor/clipboard/artboards";
import { ClipboardArtboardsTest } from "../../editor/clipboard/artboards";
import { isFontDataUrl } from "../../editor/clipboard/artboards";
import { PlatformFileContentWebpAvifPattern } from "../../platform/file-content";
import { dataUrlToBlob } from "../../editor/clipboard/file-transfer";
import { dataUrlToFontFile } from "../../editor/clipboard/file-transfer";
import { fileDataUrl } from "../../editor/clipboard/file-transfer";
import { getAssetsCapability } from "../../platform/image-upload";
import { isBlobAssetUrl } from "../../platform/image-upload";
import { isPlayableImage } from "../../editor/clipboard/image-validation";
import { resolveClipboardPictures } from "../../editor/clipboard/assets";
import { type Dynamic } from "../../runtime-types";
import { uiMessage } from "@minedesign/contracts/ui-messages";
import { uploadDesignFile } from "../working-state";
import { makePictureOptions } from "./external-paste-shared";
interface TransferOptions {
  artboardClipboard: Dynamic;
  preparedFiles: Dynamic;
  pictureAssets: Map<string, Dynamic>;
  notePaste: Dynamic;
  canAddNotes: boolean;
  signal: AbortSignal;
  uploadedFiles: string[];
  storedPictureFiles: string[];
  announce(message: string): void;
}

export function imageKey(path: string, content: string) {
  return (/\.([^./]+)$/.exec(path)?.[1] ?? "").toLowerCase() + ":" + content;
}

/** Transfer referenced files and collect replacements for the copied artwork. */
export async function transferPastedAssets({
  artboardClipboard, preparedFiles, pictureAssets, notePaste, canAddNotes,
  signal, uploadedFiles, storedPictureFiles, announce,
}: TransferOptions) {
  let assetEntries: Dynamic = [
      ...Object.entries(artboardClipboard.assets).map(
        ([path, data]: Dynamic): Dynamic => [
          path,
          data,
          "asset",
        ],
      ),
      ...Object.entries(preparedFiles.images).map(
        ([path, data]: Dynamic): Dynamic => [
          path,
          data,
          "image",
        ],
      ),
    ],
    isFontAsset: Dynamic = assetEntries.map(
      ([, data, kind]: Dynamic): Dynamic =>
        kind === "asset" &&
        isFontDataUrl(data),
    ),
    sortedEntries: Dynamic = [
      ...assetEntries.filter(
        (assetItem?: Dynamic, index?: Dynamic): Dynamic =>
          !isFontAsset[index],
      ),
      ...assetEntries.filter(
        (assetItem?: Dynamic, index?: Dynamic): Dynamic =>
          isFontAsset[index],
      ),
    ],
    assetUrls: Dynamic = new Map(),
    imageUrls: Dynamic = new Map(),
    uploadedPaths: Dynamic = [],
    skippedImages: Dynamic = new Set(),
    assetMeta: Dynamic = new Map(),
    skippedAssets: Dynamic = new Set(),
    fontsLeftOutCount: Dynamic = artboardClipboard.fontsLeftOut ?? 0,
    uploadBlob: Dynamic = async (
      blob?: Dynamic,
    ): Promise<Dynamic> => {
      let assetsCapability: Dynamic = await getAssetsCapability();
      if (assetsCapability === null || typeof assetsCapability.upload != "function")
        return;
      let mimeType: Dynamic = blob.type.split(";")[0].trim(),
        uploadResult: Dynamic = await assetsCapability.upload(
          new Blob([blob], {
            type: mimeType,
          }),
          {
            type: mimeType,
          },
        ),
        uploadedUrl: Dynamic =
          typeof uploadResult?.url == "string" &&
          isBlobAssetUrl(uploadResult.url)
            ? uploadResult.url
            : typeof uploadResult?.id == "string"
              ? "_blob/" + uploadResult.id
              : undefined;
      return uploadedUrl !== undefined &&
        isBlobAssetUrl(uploadedUrl)
        ? uploadedUrl
        : undefined;
    },
    totalFiles: Dynamic = sortedEntries.length + pictureAssets.size;
  if (totalFiles > 0) {
    let boardCount: Dynamic = preparedFiles.boards.length;
    announce(
      (boardCount === 1
        ? uiMessage("canvas.designCanvas.pastingAnArtboard")
        : uiMessage("canvas.designCanvas.pastingArtboards", { count: String(String(boardCount)) })) +
        `, bringing over ${String(totalFiles)} file${totalFiles === 1 ? "" : "s"}\u2026`,
    );
  }
  if (sortedEntries.length > 0) {
    let nextIndex: Dynamic = 0,
      uploadWorker: Dynamic = async (): Promise<Dynamic> => {
        for (
          let entryIndex: Dynamic = nextIndex++;
          entryIndex < sortedEntries.length && !signal.aborted;
          entryIndex = nextIndex++
        ) {
          let [path, data, kind]: Dynamic =
            sortedEntries[entryIndex];
          if (
            kind === "asset" &&
            isFontDataUrl(data)
          ) {
            let fontFile: Dynamic = await dataUrlToFontFile(
              data,
              "pasted-font-" + String(entryIndex + 1),
            );
            if (signal.aborted) break;
            let fontUrl: Dynamic = fontFile
              ? await uploadBlob(fontFile).catch((): Dynamic => {})
              : undefined;
            fontUrl === undefined
              ? (fontsLeftOutCount += 1)
              : assetUrls.set(
                  path,
                  fontUrl.startsWith("blob:")
                    ? fontUrl
                    : "/" + fontUrl.replace(/^\//, ""),
                );
            continue;
          }
          let blob: Dynamic = dataUrlToBlob(
            data,
            kind === "asset"
              ? "pasted-image-" + String(entryIndex + 1)
              : (path.split("/").pop() ?? path).replace(
                  /\.[^.]+$/,
                  "",
                ),
          );
          if (
            kind === "asset" &&
            ClipboardArtboardsTest(data)
          ) {
            let blobUrl: Dynamic = blob
              ? await uploadBlob(blob).catch((): Dynamic => {})
              : undefined;
            blobUrl === undefined || !blob
              ? skippedAssets.add(path)
              : (assetUrls.set(
                  path,
                  blobUrl.startsWith("blob:")
                    ? blobUrl
                    : "/" + blobUrl.replace(/^\//, ""),
                ),
                assetMeta.set(path, {
                  bytes: blob.size,
                  type: blob.type.split(";")[0].trim(),
                }));
            continue;
          }
          if (
            !blob ||
            !(await isPlayableImage(blob))
          ) {
            skippedImages.add(path);
            continue;
          }
          if (signal.aborted) break;
          let storedSrc: Dynamic = data;
          try {
            storedSrc = (
              await uploadDesignFile(
                "appifact",
                null,
                blob,
              )
            ).src;
            storedSrc.startsWith("./") &&
              (uploadedPaths.push(storedSrc.slice(2)),
              uploadedFiles.push(storedSrc.slice(2)));
          } catch {}
          (kind === "asset" ? assetUrls : imageUrls).set(
            path,
            storedSrc,
          );
        }
      };
    await Promise.all(
      Array.from(
        {
          length: Math.min(4, sortedEntries.length),
        },
        uploadWorker,
      ),
    );
  }
  let pictureResult: Dynamic = canAddNotes
      ? await resolveClipboardPictures(
          notePaste.pictures,
          pictureAssets,
          signal,
          makePictureOptions((file?: Dynamic): Dynamic => {
            storedPictureFiles.push(file);
            uploadedPaths.push(file);
            uploadedFiles.push(file);
          }, ClipboardArtboardsLimit),
        )
      : {
          landed: [],
          failed: 0,
        };
    const undecodableImageKeys = new Set<string>();
  for (let [path, content] of Object.entries(
    artboardClipboard.files,
  ) as Dynamic) {
    if (signal.aborted) break;
    if (
      !PlatformFileContentWebpAvifPattern.test(path) ||
      imageUrls.has(path) ||
      skippedImages.has(path)
    )
      continue;
    let imageBlob: Dynamic = dataUrlToBlob(
      fileDataUrl(path, content),
      "carried",
    );
    (!imageBlob ||
      !(await isPlayableImage(imageBlob))) &&
      undecodableImageKeys.add(imageKey(path, content));
  }
  return { assetUrls, imageUrls, uploadedPaths, skippedImages, assetMeta,
    skippedAssets, fontsLeftOutCount, pictureResult, undecodableImageKeys };
}

interface HeldFileOptions {
  artboardClipboard: Dynamic;
  files: Record<string, Dynamic>;
  dropped: { path: string; why: string }[];
  assetUrls: Map<string, string>;
  assetMeta: Map<string, { bytes: number; type: string }>;
  skippedAssets: Set<string>;
  isEditing(): boolean;
}

/** Record uploaded file references and add omissions to the paste report. */
export async function recordPastedReferences({
  artboardClipboard, files, dropped, assetUrls, assetMeta, skippedAssets, isEditing,
}: HeldFileOptions) {
  let heldAssets: Dynamic = Object.entries(
      artboardClipboard.held ?? {},
    ).filter(
      (
        [path]: Dynamic,
        index?: Dynamic,
        allHeld?: Dynamic,
      ): Dynamic =>
        allHeld.findIndex(
          ([otherPath]: Dynamic): Dynamic =>
            otherPath.toLowerCase() === path.toLowerCase(),
        ) === index,
    ),
    knownFilesLower: Dynamic = new Set(
      [
        ...Object.keys(files),
        ...getAllFileReferencePaths(),
      ].map((path?: Dynamic): Dynamic => path.toLowerCase()),
    ),
    isKnownFile: Dynamic = (path?: Dynamic): Dynamic =>
      !hasPendingFileOverlay() ||
      knownFilesLower.has(path.toLowerCase());
  isEditing() &&
    (await Promise.all(
      heldAssets.map(
        async ([path, assetKey]: Dynamic): Promise<Dynamic> => {
          let assetUrl: Dynamic = assetUrls.get(assetKey),
            assetInfo: Dynamic = assetMeta.get(assetKey);
          if (assetUrl === undefined || assetInfo === undefined) return;
          let savePromise: Dynamic = saveExternalFileReference(
            path,
            assetUrl,
            assetInfo.bytes,
            assetInfo.type,
            isKnownFile,
          );
          await Promise.race([
            savePromise,
            new Promise(
              (resolve?: Dynamic, reject?: Dynamic): Dynamic =>
                setTimeout(
                  (): Dynamic =>
                    reject(new Error("no answer from the store")),
                  8e3,
                ),
            ),
          ]).catch((error?: Dynamic): Dynamic => {
            console.warn(
              "design (paste): the pointer document for " +
                path +
                " was not written \u2014 " +
                errorMessage(error),
            );
            dropped.push({
              path: path,
              why: "its upload came over, but could not be recorded here",
            });
          });
        },
      ),
    ));
  let droppedByKind: Dynamic = new Map();
  for (let assetKey of skippedAssets as Dynamic) {
    let heldPaths: Dynamic = heldAssets
      .filter(([, key]: Dynamic): Dynamic => key === assetKey)
      .map(([path]: Dynamic): Dynamic => path);
    for (let path of heldPaths as Dynamic)
      dropped.push({
        path: path,
        why: "this canvas would not take the upload",
      });
    let assetData: Dynamic = artboardClipboard.assets[assetKey] ?? "",
      kindLabel: Dynamic = /^data:text\/css/i.test(assetData)
        ? "stylesheet"
        : /^data:text\/javascript/i.test(assetData)
          ? "script"
          : "data file";
    heldPaths.length === 0 &&
      droppedByKind.set(kindLabel, (droppedByKind.get(kindLabel) ?? 0) + 1);
  }
  for (let [kindLabel, count] of droppedByKind as Dynamic)
    dropped.push({
      path:
        count === 1
          ? "a " + kindLabel
          : String(count) + " " + kindLabel + "s",
      why: "this canvas would not take the upload",
    });
}
