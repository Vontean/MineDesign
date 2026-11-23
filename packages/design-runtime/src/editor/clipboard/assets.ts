/** Restored application module; prepare first, initialize in original order. */
import {
  type Dynamic,
} from "../../runtime-types";
import { isSupportedDataImage, replaceClipboardPictureSource } from "./annotations";
import { ClipboardArtboardsLimit, ClipboardArtboardsResolvedValue, maxAssetBytes } from "./artboards";
import { dataUrlToBlob } from "./file-transfer";
import { readRasterImagePixels } from "./image-validation";

var ClipboardAssetsConstant: Dynamic;
var ClipboardAssetsHandler: Dynamic;
var clipboardPayloadUsage: Dynamic;
async function resolveClipboardPictures(
  placements?: Dynamic,
  assetsByKey?: Dynamic,
  abortState?: Dynamic,
  uploadHooks?: Dynamic,
): Promise<Dynamic> {
  let blobsByKey: Dynamic = new Map(),
    totalPixels: Dynamic = 0;
  for (let assetKey of new Set(
    placements.map((placement?: Dynamic): Dynamic => placement.asset),
  ) as Dynamic) {
    let entry: Dynamic = assetsByKey.get(assetKey),
      blob: Dynamic =
        entry === undefined
          ? null
          : dataUrlToBlob(
              entry,
              "pasted-picture-" + String(blobsByKey.size + 1),
            ),
      pixelCount: Dynamic =
        blob === null
          ? undefined
          : readRasterImagePixels(
              new Uint8Array(await blob.arrayBuffer()),
            );
    blob === null ||
      pixelCount === undefined ||
      totalPixels + pixelCount > uploadHooks.maxPixels ||
      ((totalPixels += pixelCount), blobsByKey.set(assetKey, blob));
  }
  let uploadedSources: Dynamic = new Map(),
    pendingBlobs: Dynamic = [...blobsByKey],
    uploadTimeout: Dynamic = (): Dynamic =>
      new Promise(
        (resolve?: Dynamic): Dynamic =>
          setTimeout(resolve, uploadHooks.timeoutMs ?? ClipboardAssetsConstant, null),
      ),
    uploadWorker: Dynamic = async (): Promise<Dynamic> => {
      for (
        let pendingEntry: Dynamic = pendingBlobs.shift();
        pendingEntry !== undefined && !abortState.aborted;
        pendingEntry = pendingBlobs.shift()
      ) {
        let [blobKey, pendingBlob]: Dynamic = pendingEntry;
        if (
          (await Promise.resolve()
            .then((): Dynamic => uploadHooks.gate(pendingBlob))
            .catch((): Dynamic => "refused")) !== null ||
          abortState.aborted
        )
          continue;
        let uploadPromise: Dynamic = Promise.resolve()
            .then((): Dynamic => uploadHooks.upload(pendingBlob))
            .then(
              (uploaded?: Dynamic): Dynamic =>
                typeof uploaded?.src == "string" ? uploaded.src : null,
              (): Dynamic => null,
            ),
          uploadedSrc: Dynamic = await Promise.race([uploadPromise, uploadTimeout()]);
        if (uploadedSrc === null) {
          uploadPromise
            .then((abandonedSrc?: Dynamic): Dynamic => {
              abandonedSrc?.startsWith("./") && uploadHooks.discard(abandonedSrc.slice(2));
            })
            .catch((): Dynamic => {});
          continue;
        }
        uploadedSrc.startsWith("./") && uploadHooks.stored(uploadedSrc.slice(2));
        uploadedSources.set(blobKey, uploadedSrc);
      }
    };
  await Promise.all(
    Array.from(
      {
        length: Math.min(4, pendingBlobs.length),
      },
      uploadWorker,
    ),
  );
  let landed: Dynamic = placements.flatMap((placement?: Dynamic): Dynamic => {
    let entry: Dynamic = uploadedSources.get(placement.asset),
      replaced: Dynamic =
        entry === undefined
          ? null
          : replaceClipboardPictureSource(placement, entry);
    return replaced === null ? [] : [replaced];
  });
  return {
    landed: landed,
    failed: placements.length - landed.length,
  };
}
function parseClipboardAssets(
  clipboard?: Dynamic,
  placements?: Dynamic,
  usage: Dynamic = {
    count: 0,
    chars: 0,
    has: (): Dynamic => false,
  },
): Dynamic {
  let entries: Dynamic = new Map(),
    clipboardAssets: Dynamic = clipboard?.assets;
  if (typeof clipboardAssets != "object" || clipboardAssets === null) return entries;
  let { count: assetCount, chars: charCount }: Dynamic = usage;
  for (let { asset: assetKey } of placements as Dynamic) {
    if (entries.has(assetKey) || !Object.hasOwn(clipboardAssets, assetKey)) continue;
    let assetData: Dynamic = clipboardAssets[assetKey];
    if (
      !(
        typeof assetData != "string" ||
        assetData.length > maxAssetBytes ||
        !isSupportedDataImage(assetData)
      )
    ) {
      if (!usage.has(assetKey)) {
        if (
          assetCount >= ClipboardArtboardsLimit ||
          charCount + assetData.length > ClipboardArtboardsResolvedValue
        )
          continue;
        assetCount++;
        charCount += assetData.length;
      }
      entries.set(assetKey, assetData);
    }
  }
  return entries;
}
export {
  ClipboardAssetsConstant,
  ClipboardAssetsHandler,
  clipboardPayloadUsage,
  parseClipboardAssets,
  resolveClipboardPictures,
};
export function installEditorClipboardAssets(): () => void {
  return () => {
    ClipboardAssetsConstant = 6e4;
    ClipboardAssetsHandler = (count?: Dynamic): Dynamic => count * 2560 * 2560;
    clipboardPayloadUsage = (clipboard?: Dynamic): Dynamic => ({
      count: Object.keys(clipboard.assets).length,
      chars: [
        ...clipboard.artboards.map((artboard?: Dynamic): Dynamic => artboard.src),
        ...Object.values(clipboard.files),
        ...Object.values(clipboard.assets),
      ].reduce(
        (total?: Dynamic, text?: Dynamic): Dynamic => total + text.length,
        0,
      ),
      has: (assetKey?: Dynamic): Dynamic => Object.hasOwn(clipboard.assets, assetKey),
    });
  };
}
