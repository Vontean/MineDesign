import { uiMessage } from '@minedesign/contracts/ui-messages';
/** Restored application module; prepare first, initialize in original order. */
import {
  type Dynamic,
} from "../runtime-types";
import { DesignSystemPublishedFilesAlias, DesignSystemPublishedFilesCache, DesignSystemPublishedFilesFromEntriesValue, DesignSystemPublishedFilesSubscribers } from "./published-files";
import { parseCompleteDesignSystem } from "./token-parsing";
import { getTypeDeclarationReferences, parseFileReferencesValue, parseFontFileReferences, PlatformExternalFilesItems } from "../platform/external-files";
import { maxDeclarationFileBytes as maxDeclarationFileLength, ProjectValue } from "../platform/file-content";
import { loadReferencedFiles, parseFileReferences, PlatformFileReferencesLimit, maxDeclarationFiles as maxDeclarationFileCount } from "../platform/file-references";
import { getAssetsCapability, isBlobAssetUrl } from "../platform/image-upload";

import { set_DesignSystemPublishedFilesAlias, set_DesignSystemPublishedFilesFromEntriesValue } from "./published-files";
import { set_PlatformExternalFilesItems, set_PlatformExternalFilesResolvedValue, set_PlatformExternalFilesResolvedValue_2, set_parseFileReferencesValue } from "../platform/external-files";
var DesignSystemTypeDeclarationsRegistry: Dynamic;
var DesignSystemTypeDeclarationsAlias: Dynamic;
var DesignSystemTypeDeclarationsFailedValue: Dynamic;
var DesignSystemTypeDeclarationsResolvedValue: Dynamic;
var declarationFetcher: Dynamic;
var DesignSystemTypeDeclarationsSubscribers: Dynamic;
var pendingFileOverlay: Dynamic;
var DesignSystemTypeDeclarationsItems: Dynamic;
var retryCooldownMs: Dynamic;
var failedOverlayFiles: Dynamic;
var nextOverlayRetryAt: Dynamic;
var DesignSystemTypeDeclarationsTextEncoder: Dynamic;
var DesignSystemTypeDeclarationsReduce: Dynamic;
var maxHtmlReferenceBytes: Dynamic;
var ApplicationJsonValue: Dynamic;
var DesignSystemTypeDeclarationsDelayMs: Dynamic;
var DesignSystemTypeDeclarationsCache: Dynamic;
var blobUrlByHtmlHash: Dynamic;
var pendingHtmlFetches: Dynamic;
var lastPublishAtByHtmlHash: Dynamic;
var DesignSystemTypeDeclarationsLimit: Dynamic;
var htmlReferenceByArtboardPath: Dynamic;
var htmlReferenceStore: Dynamic;
var htmlReferenceListeners: Dynamic;
var htmlReferenceUploadWaiters: Dynamic;
var oversizedHtmlHashes: Dynamic;
var DesignSystemTypeDeclarationsReplace: Dynamic;
var DesignSystemTypeDeclarationsGet: Dynamic;
var isUploadUnavailable: Dynamic;
var declarationDebounceMs: Dynamic;
var pendingHtmlByArtboardPath: Dynamic;
var publishTimerByArtboardPath: Dynamic;
var uploadingArtboardPaths: Dynamic;
var DesignSystemTypeDeclarationsGetLength: Dynamic;
var DesignSystemsKey: Dynamic;
var DesignSystemTypeDeclarationsAZaZAZaZPattern: Dynamic;
var DesignSystemTypeDeclarationsMax: Dynamic;
var DesignSystemTypeDeclarationsPadStart: Dynamic;
var DesignSystemTypeDeclarationsPow: Dynamic;
var PaletteValue: Dynamic;
var DesignSystemTypeDeclarationsPattern: Dynamic;
var DesignSystemTypeDeclarationsRgbaHslaPattern: Dynamic;
var DesignSystemTypeDeclarationsElementCache: Dynamic;
function getDeclarationFiles(): Dynamic {
  return DesignSystemTypeDeclarationsRegistry;
}
function subscribeDeclarationFiles(listener?: Dynamic): Dynamic {
  DesignSystemTypeDeclarationsSubscribers.add(listener);
  return (): Dynamic => {
    DesignSystemTypeDeclarationsSubscribers.delete(listener);
  };
}
function setDeclarationReferences(
  references?: Dynamic,
  fetcher?: Dynamic,
): Dynamic {
  let referencesKey: Dynamic = JSON.stringify(references);
  if (referencesKey !== DesignSystemTypeDeclarationsAlias)
    if (
      ((DesignSystemTypeDeclarationsAlias = referencesKey),
      (DesignSystemTypeDeclarationsRegistry = {}),
      (DesignSystemTypeDeclarationsFailedValue = []),
      (declarationFetcher = fetcher),
      fetcher !== undefined && references.length > 0)
    )
      loadTypeDeclarationFiles(referencesKey, references, fetcher, 0);
    else
      for (let notifyListener of DesignSystemTypeDeclarationsSubscribers as Dynamic)
        notifyListener();
}
function loadTypeDeclarationFiles(
  referencesKey?: Dynamic,
  references?: Dynamic,
  fetcher?: Dynamic,
  attempt?: Dynamic,
): Dynamic {
  loadReferencedFiles(references, fetcher).then(
    (loadResult?: Dynamic): Dynamic => {
      if (DesignSystemTypeDeclarationsAlias !== referencesKey) return;
      let loadedFiles: Dynamic = Object.entries(loadResult.files).filter(
        ([, fileText]: Dynamic): Dynamic =>
          fileText.length <= maxDeclarationFileLength,
      );
      if (loadedFiles.length > 0) {
        DesignSystemTypeDeclarationsRegistry = {
          ...DesignSystemTypeDeclarationsRegistry,
          ...Object.fromEntries(loadedFiles),
        };
        for (let notifyListener of DesignSystemTypeDeclarationsSubscribers as Dynamic)
          notifyListener();
      }
      let retryDelay: Dynamic = DesignSystemTypeDeclarationsItems[attempt];
      DesignSystemTypeDeclarationsFailedValue = [];
      loadResult.failed.length > 0 && retryDelay !== undefined
        ? setTimeout((): Dynamic => {
            DesignSystemTypeDeclarationsAlias === referencesKey &&
              loadTypeDeclarationFiles(
                referencesKey,
                loadResult.failed,
                fetcher,
                attempt + 1,
              );
          }, retryDelay)
        : loadResult.failed.length > 0 &&
          ((DesignSystemTypeDeclarationsFailedValue = loadResult.failed),
          (DesignSystemTypeDeclarationsResolvedValue =
            Date.now() + retryCooldownMs));
    },
  );
}
function retryTypeDeclarationFiles(): Dynamic {
  DesignSystemTypeDeclarationsFailedValue.length > 0 &&
    declarationFetcher !== undefined &&
    Date.now() >= DesignSystemTypeDeclarationsResolvedValue &&
    ((DesignSystemTypeDeclarationsResolvedValue =
      Date.now() + retryCooldownMs),
    loadTypeDeclarationFiles(
      DesignSystemTypeDeclarationsAlias,
      DesignSystemTypeDeclarationsFailedValue,
      declarationFetcher,
      DesignSystemTypeDeclarationsItems.length,
    ));
}
function hasPendingFileOverlay(): Dynamic {
  return pendingFileOverlay;
}
function clearPendingFileOverlay(): Dynamic {
  pendingFileOverlay = false;
}
function setPublishedFileReferences(
  publishedFiles?: Dynamic,
  fetcher: Dynamic = sameOriginFileFetcher(),
): Dynamic {
  pendingFileOverlay = true;
  let fontReferences: Dynamic = parseFontFileReferences(publishedFiles);
  set_PlatformExternalFilesResolvedValue(typeof publishedFiles == "object" && publishedFiles !== null
      ? Object.keys(publishedFiles)
          .filter(
            (path?: Dynamic): Dynamic =>
              path.startsWith(ProjectValue),
          )
          .map(
            (path?: Dynamic): Dynamic =>
              path.slice(ProjectValue.length),
          )
      : []);
  set_PlatformExternalFilesResolvedValue_2(fontReferences.types ?? []);
  setDeclarationReferences(
    getTypeDeclarationReferences(),
    fetcher,
  );
  fontReferences.dropped !== undefined &&
    console.warn(
      "design (instance files): not serving " +
        String(fontReferences.dropped) +
        " file(s) published under project/ (not a .css/.js/.mjs/.jsx/.tsx/.json support file, over 20 MiB, or past " +
        String(PlatformFileReferencesLimit) +
        "; or a .d.ts over 2 MiB / past " +
        String(maxDeclarationFileCount) +
        ")",
    );
  set_PlatformExternalFilesItems([...fontReferences]);
  loadInstanceFileReferences(fetcher);
}
function setInstanceFileReferences(
  fileReferences?: Dynamic,
  fetcher: Dynamic = sameOriginFileFetcher(),
): Dynamic {
  set_parseFileReferencesValue(parseFileReferences(fileReferences));
  loadInstanceFileReferences(fetcher);
  retryTypeDeclarationFiles();
}
function loadInstanceFileReferences(fetcher?: Dynamic): Dynamic {
  let references: Dynamic = Object.assign(
      [
        ...PlatformExternalFilesItems,
        ...parseFileReferencesValue.filter(
          (reference?: Dynamic): Dynamic =>
            !PlatformExternalFilesItems.some(
              (existing?: Dynamic): Dynamic => existing.path === reference.path,
            ),
        ),
      ].slice(0, PlatformFileReferencesLimit),
      parseFileReferencesValue.dropped !== undefined
        ? {
            dropped: parseFileReferencesValue.dropped,
          }
        : {},
    ),
    referencesKey: Dynamic = JSON.stringify([references, references.dropped ?? 0]);
  if (referencesKey === DesignSystemPublishedFilesAlias) {
    failedOverlayFiles.length > 0 &&
      fetcher !== undefined &&
      Date.now() >= nextOverlayRetryAt &&
      ((nextOverlayRetryAt =
        Date.now() + retryCooldownMs),
      loadDesignSystemFileOverlay(
        referencesKey,
        references,
        failedOverlayFiles,
        DesignSystemTypeDeclarationsItems.length,
        DesignSystemTypeDeclarationsReduce(),
        fetcher,
      ));
    return;
  }
  set_DesignSystemPublishedFilesAlias(referencesKey);
  failedOverlayFiles = [];
  references.dropped !== undefined &&
    console.warn(
      "design (instance files): ignoring " +
        String(references.dropped) +
        " listed entr" +
        (references.dropped === 1 ? "y" : "ies") +
        " (not a files/ kind of store path, a file outside project/, over 20 MiB, duplicate, or past " +
        String(PlatformFileReferencesLimit) +
        ")",
    );
  if (fetcher === undefined) return;
  let loadedReferences: Dynamic = references.filter(
    (reference?: Dynamic): Dynamic =>
      DesignSystemPublishedFilesCache.get(reference.path) ===
      reference.file,
  );
  loadDesignSystemFileOverlay(
    referencesKey,
    references,
    references.filter((reference?: Dynamic): Dynamic => !loadedReferences.includes(reference)),
    0,
    loadedReferences.reduce(
      (totalBytes?: Dynamic, reference?: Dynamic): Dynamic =>
        totalBytes +
        DesignSystemTypeDeclarationsTextEncoder.encode(
          DesignSystemPublishedFilesFromEntriesValue[reference.path] ??
            "",
        ).length,
      0,
    ),
    fetcher,
  );
}
function loadDesignSystemFileOverlay(
  overlayKey?: Dynamic,
  references?: Dynamic,
  pendingReferences?: Dynamic,
  attempt?: Dynamic,
  loadedBytes?: Dynamic,
  fetcher?: Dynamic,
): Dynamic {
  loadReferencedFiles(pendingReferences, fetcher, loadedBytes).then(
    (loadResult?: Dynamic): Dynamic => {
      if (DesignSystemPublishedFilesAlias !== overlayKey) return;
      let listedPaths: Dynamic = new Set(
          references.map((reference?: Dynamic): Dynamic => reference.path),
        ),
        previousFileCount: Dynamic = Object.keys(
          DesignSystemPublishedFilesFromEntriesValue,
        ).length;
      set_DesignSystemPublishedFilesFromEntriesValue(Object.fromEntries(
        Object.entries({
          ...DesignSystemPublishedFilesFromEntriesValue,
          ...loadResult.files,
        }).filter(([path]: Dynamic): Dynamic => listedPaths.has(path)),
      ));
      for (let pendingReference of pendingReferences as Dynamic)
        pendingReference.path in loadResult.files &&
          DesignSystemPublishedFilesCache.set(
            pendingReference.path,
            pendingReference.file,
          );
      for (let cachedPath of [
        ...DesignSystemPublishedFilesCache.keys(),
      ] as Dynamic)
        cachedPath in DesignSystemPublishedFilesFromEntriesValue ||
          DesignSystemPublishedFilesCache.delete(cachedPath);
      console.info(
        "design (instance files): " +
          String(
            Object.keys(DesignSystemPublishedFilesFromEntriesValue)
              .length,
          ) +
          " of " +
          String(references.length) +
          " listed file(s) loaded" +
          (loadResult.skipped > 0
            ? ", " + String(loadResult.skipped) + " skipped"
            : ""),
      );
      if (
        Object.keys(loadResult.files).length > 0 ||
        Object.keys(DesignSystemPublishedFilesFromEntriesValue)
          .length !== previousFileCount
      )
        for (let notifyListener of DesignSystemPublishedFilesSubscribers as Dynamic)
          notifyListener();
      let retryDelay: Dynamic = DesignSystemTypeDeclarationsItems[attempt];
      failedOverlayFiles = [];
      loadResult.failed.length > 0 && retryDelay !== undefined
        ? setTimeout((): Dynamic => {
            DesignSystemPublishedFilesAlias === overlayKey &&
              loadDesignSystemFileOverlay(
                overlayKey,
                references,
                loadResult.failed,
                attempt + 1,
                DesignSystemTypeDeclarationsReduce(),
                fetcher,
              );
          }, retryDelay)
        : loadResult.failed.length > 0 &&
          ((failedOverlayFiles = loadResult.failed),
          (nextOverlayRetryAt =
            Date.now() + retryCooldownMs));
    },
  );
}
function sameOriginFileFetcher(): Dynamic {
  return typeof location === "undefined" || typeof fetch === "undefined"
    ? undefined
    : (url?: Dynamic): Dynamic =>
        fetch(url, {
          credentials: "same-origin",
        });
}
function isKnownHtmlReference(html?: Dynamic): Dynamic {
  return oversizedHtmlHashes.has(
    hashHtmlReference(html),
  );
}
function subscribeHtmlReferences(listener?: Dynamic): Dynamic {
  htmlReferenceListeners.add(listener);
  return (): Dynamic => {
    htmlReferenceListeners.delete(listener);
  };
}
function hashHtmlReference(text?: Dynamic): Dynamic {
  let hashHigh: Dynamic = 3735928559 ^ text.length,
    hashLow: Dynamic = 1103547991 ^ text.length;
  for (let index: Dynamic = 0; index < text.length; index++) {
    let charCode: Dynamic = text.charCodeAt(index);
    hashHigh = Math.imul(hashHigh ^ charCode, 2654435761);
    hashLow = Math.imul(hashLow ^ charCode, 1597334677);
  }
  hashHigh =
    (Math.imul(hashHigh ^ (hashHigh >>> 16), 2246822507) ^
      Math.imul(hashLow ^ (hashLow >>> 13), 3266489909)) >>>
    0;
  hashLow =
    (Math.imul(hashLow ^ (hashLow >>> 16), 2246822507) ^
      Math.imul(hashHigh ^ (hashHigh >>> 13), 3266489909)) >>>
    0;
  return (
    hashLow.toString(16) + hashHigh.toString(16) + "." + String(text.length)
  );
}
function setHtmlReferenceStore(store?: Dynamic): Dynamic {
  htmlReferenceStore = store;
}
function getReferencedHtml(blobUrl?: Dynamic): Dynamic {
  return DesignSystemTypeDeclarationsCache.get(
    DesignSystemTypeDeclarationsReplace(blobUrl),
  );
}
function getArtboardHtmlReference(artboardPath?: Dynamic): Dynamic {
  return htmlReferenceByArtboardPath.get(artboardPath);
}
function htmlReferenceForText(html?: Dynamic): Dynamic {
  let entry: Dynamic = blobUrlByHtmlHash.get(
    hashHtmlReference(html),
  );
  return entry !== undefined &&
    DesignSystemTypeDeclarationsCache.get(entry) === html
    ? entry
    : undefined;
}
function getHtmlReferenceState(): Dynamic {
  return isUploadUnavailable;
}
function cacheReferencedHtml(blobUrl?: Dynamic, html?: Dynamic): Dynamic {
  DesignSystemTypeDeclarationsCache.set(
    DesignSystemTypeDeclarationsReplace(blobUrl),
    html,
  );
  blobUrlByHtmlHash.set(
    hashHtmlReference(html),
    DesignSystemTypeDeclarationsReplace(blobUrl),
  );
}
function setArtboardHtmlReferences(
  artboardReferences?: Dynamic,
  fetcher: Dynamic = sameOriginAssetFetcher(),
): Dynamic {
  let blobUrlByKey: Dynamic = new Map();
  for (let [artboardPath, reference] of artboardReferences as Dynamic)
    isBlobAssetUrl(reference.ref) &&
      (htmlReferenceByArtboardPath.set(artboardPath, {
        ref: DesignSystemTypeDeclarationsReplace(reference.ref),
        bytes: reference.bytes,
      }),
      blobUrlByKey.set(
        DesignSystemTypeDeclarationsReplace(reference.ref),
        reference.ref,
      ));
  if (fetcher !== undefined)
    for (let [
      cachedArtboardPath,
      { ref: referenceKey },
    ] of htmlReferenceByArtboardPath as Dynamic)
      DesignSystemTypeDeclarationsCache.has(referenceKey) ||
        pendingHtmlFetches.has(referenceKey) ||
        DesignSystemTypeDeclarationsGet(referenceKey) ||
        (pendingHtmlFetches.add(referenceKey),
        fetchHtmlReference(blobUrlByKey.get(referenceKey) ?? referenceKey, fetcher).then(
          (html?: Dynamic): Dynamic => {
            pendingHtmlFetches.delete(referenceKey);
            if (html === undefined) {
              lastPublishAtByHtmlHash.set(referenceKey, Date.now());
              clearTimeout(htmlReferenceUploadWaiters);
              htmlReferenceUploadWaiters = setTimeout(
                (): Dynamic =>
                  setArtboardHtmlReferences(
                    new Map(htmlReferenceByArtboardPath),
                    fetcher,
                  ),
                DesignSystemTypeDeclarationsLimit + 50,
              );
              return;
            }
            lastPublishAtByHtmlHash.delete(referenceKey);
            cacheReferencedHtml(referenceKey, html);
            let artboardPaths: Dynamic = [...htmlReferenceByArtboardPath]
              .filter(([, reference]: Dynamic): Dynamic => reference.ref === referenceKey)
              .map(([artboardPath]: Dynamic): Dynamic => artboardPath);
            for (let artboardPath of artboardPaths as Dynamic)
              htmlReferenceStore?.hydrate(artboardPath, html);
            for (let notifyListener of htmlReferenceListeners as Dynamic)
              notifyListener(artboardPaths);
          },
        ));
}
async function fetchHtmlReference(
  url?: Dynamic,
  fetcher?: Dynamic,
): Promise<Dynamic> {
  try {
    let timeoutId: Dynamic,
      response: Dynamic = await Promise.race([
        fetcher(url),
        new Promise((resolve?: Dynamic, reject?: Dynamic): Dynamic => {
          timeoutId = setTimeout(
            (): Dynamic => reject(new Error("timeout")),
            DesignSystemTypeDeclarationsDelayMs,
          );
        }),
      ]).finally((): Dynamic => clearTimeout(timeoutId));
    if (!response.ok) throw new Error("not found");
    let responseText: Dynamic = await response.text();
    if (
      DesignSystemTypeDeclarationsGetLength(responseText) >
      maxHtmlReferenceBytes
    )
      throw new Error(
        "over " +
          String(maxHtmlReferenceBytes) +
          " bytes",
      );
    let blobContent: Dynamic = JSON.parse(responseText);
    if (
      blobContent === null ||
      typeof blobContent != "object" ||
      typeof blobContent.html != "string"
    )
      throw new Error("not a board blob");
    return blobContent.html;
  } catch (error: Dynamic) {
    console.warn(
      "design (board blob): could not read " +
        url +
        ": " +
        String(error).slice(0, 120),
    );
    return;
  }
}
function scheduleHtmlUpload(artboardPath?: Dynamic, html?: Dynamic): Dynamic {
  htmlReferenceForText(html) === undefined &&
    (pendingHtmlByArtboardPath.set(artboardPath, html),
    clearTimeout(publishTimerByArtboardPath.get(artboardPath)),
    publishTimerByArtboardPath.set(
      artboardPath,
      setTimeout((): Dynamic => {
        publishHtmlReference(artboardPath);
      }, declarationDebounceMs),
    ));
}
async function publishHtmlReference(artboardPath?: Dynamic): Promise<Dynamic> {
  publishTimerByArtboardPath.delete(artboardPath);
  let entry: Dynamic = pendingHtmlByArtboardPath.get(artboardPath);
  if (
    entry === undefined ||
    uploadingArtboardPaths.has(artboardPath)
  )
    return;
  let htmlHash: Dynamic = hashHtmlReference(entry);
  if (htmlReferenceForText(entry) !== undefined) {
    htmlReferenceStore?.resync();
    return;
  }
  if (oversizedHtmlHashes.has(htmlHash)) return;
  if (DesignSystemTypeDeclarationsGet(htmlHash)) {
    publishTimerByArtboardPath.set(
      artboardPath,
      setTimeout(
        (): Dynamic => {
          publishHtmlReference(artboardPath);
        },
        DesignSystemTypeDeclarationsLimit -
          (Date.now() -
            (lastPublishAtByHtmlHash.get(htmlHash) ?? 0)) +
          50,
      ),
    );
    return;
  }
  let blobJson: Dynamic = JSON.stringify({
    v: 1,
    path: artboardPath,
    html: entry,
  });
  if (
    DesignSystemTypeDeclarationsGetLength(blobJson) >
    maxHtmlReferenceBytes
  ) {
    oversizedHtmlHashes.add(htmlHash);
    htmlReferenceStore?.resync();
    return;
  }
  uploadingArtboardPaths.add(artboardPath);
  try {
    let assetsCapability: Dynamic = await getAssetsCapability();
    isUploadUnavailable =
      assetsCapability === null || typeof assetsCapability.upload != "function";
    if (assetsCapability === null || typeof assetsCapability.upload != "function")
      throw (
        htmlReferenceStore?.resync(),
        new Error("this view cannot upload")
      );
    let uploadResult: Dynamic = await assetsCapability.upload(
        new Blob([blobJson], {
          type: ApplicationJsonValue,
        }),
        {
          type: ApplicationJsonValue,
        },
      ),
      blobUrl: Dynamic =
        typeof uploadResult?.url == "string" &&
        isBlobAssetUrl(uploadResult.url)
          ? uploadResult.url
          : typeof uploadResult?.id == "string"
            ? "_blob/" + uploadResult.id
            : undefined;
    if (blobUrl === undefined || !isBlobAssetUrl(blobUrl))
      throw new Error("upload returned no usable reference");
    cacheReferencedHtml(blobUrl, entry);
    htmlReferenceStore?.resync();
  } catch (error: Dynamic) {
    lastPublishAtByHtmlHash.set(htmlHash, Date.now());
    console.warn(
      "design (board blob): upload of " +
        artboardPath +
        " failed: " +
        String(error).slice(0, 120),
    );
    !isUploadUnavailable &&
      !publishTimerByArtboardPath.has(artboardPath) &&
      publishTimerByArtboardPath.set(
        artboardPath,
        setTimeout((): Dynamic => {
          publishHtmlReference(artboardPath);
        }, DesignSystemTypeDeclarationsLimit + 50),
      );
  } finally {
    uploadingArtboardPaths.delete(artboardPath);
    pendingHtmlByArtboardPath.get(artboardPath) !== entry &&
      !publishTimerByArtboardPath.has(artboardPath) &&
      publishTimerByArtboardPath.set(
        artboardPath,
        setTimeout((): Dynamic => {
          publishHtmlReference(artboardPath);
        }, declarationDebounceMs),
      );
  }
}
function knownHtmlReferenceState(html?: Dynamic): Dynamic {
  return DesignSystemTypeDeclarationsGet(hashHtmlReference(html));
}
function sameOriginAssetFetcher(): Dynamic {
  return typeof location === "undefined" || typeof fetch === "undefined"
    ? undefined
    : (url?: Dynamic): Dynamic =>
        fetch(url, {
          credentials: "same-origin",
        });
}
function cssColorNumber(valueText?: Dynamic, percentBase?: Dynamic): Dynamic {
  if (valueText === "none") return 0;
  let numberMatch: Dynamic = /^(-?\d*\.?\d+(?:e-?\d+)?)(%?)$/.exec(valueText);
  if (numberMatch !== null)
    return numberMatch[2] === "%"
      ? (Number(numberMatch[1]) / 100) * percentBase
      : Number(numberMatch[1]);
}
function cssColorAngle(angleText?: Dynamic): Dynamic {
  let angleMatch: Dynamic = /^(-?\d*\.?\d+)(deg|rad|grad|turn)?$/.exec(
    angleText === "none" ? "0" : angleText,
  );
  return angleMatch === null
    ? undefined
    : (((Number(angleMatch[1]) *
        (angleMatch[2] === "rad"
          ? 180 / Math.PI
          : angleMatch[2] === "grad"
            ? 0.9
            : angleMatch[2] === "turn"
              ? 360
              : 1)) %
        360) +
        360) %
        360;
}
function parseColorFunction(colorText?: Dynamic, functionName?: Dynamic): Dynamic {
  let functionMatch: Dynamic = new RegExp("^" + functionName + "\\((.*)\\)$").exec(colorText);
  if (functionMatch === null) return;
  let parts: Dynamic = functionMatch[1].trim().split(/\s*[,/]\s*|\s+/);
  return parts.length === 3 || parts.length === 4 ? parts : undefined;
}
function oklabToCssRgb(
  lightness?: Dynamic,
  axisA?: Dynamic,
  axisB?: Dynamic,
): Dynamic {
  let lCubed: Dynamic =
      (lightness + 0.3963377774 * axisA + 0.2158037573 * axisB) ** 3,
    mCubed: Dynamic =
      (lightness - 0.1055613458 * axisA - 0.0638541728 * axisB) ** 3,
    sCubed: Dynamic =
      (lightness - 0.0894841775 * axisA - 1.291485548 * axisB) ** 3;
  return [
    DesignSystemTypeDeclarationsPow(
      4.0767416621 * lCubed - 3.3077115913 * mCubed + 0.2309699292 * sCubed,
    ),
    DesignSystemTypeDeclarationsPow(
      -1.2684380046 * lCubed + 2.6097574011 * mCubed - 0.3413193965 * sCubed,
    ),
    DesignSystemTypeDeclarationsPow(
      -0.0041960863 * lCubed - 0.7034186147 * mCubed + 1.707614701 * sCubed,
    ),
  ];
}
function labToCssRgb(
  lightness?: Dynamic,
  axisA?: Dynamic,
  axisB?: Dynamic,
): Dynamic {
  let fy: Dynamic = (lightness + 16) / 116,
    fx: Dynamic = fy + axisA / 500,
    fz: Dynamic = fy - axisB / 200,
    inverseLabCurve: Dynamic = (curveInput?: Dynamic): Dynamic =>
      curveInput ** 3 > 216 / 24389
        ? curveInput ** 3
        : (116 * curveInput - 16) / (24389 / 27),
    [xD50, yD50, zD50]: Dynamic = [
      inverseLabCurve(fx) * 0.96422,
      (lightness > 8 ? fy ** 3 : lightness / (24389 / 27)) * 1,
      inverseLabCurve(fz) * 0.82521,
    ],
    xD65: Dynamic =
      0.9555766 * xD50 - 0.0230393 * yD50 + 0.0631636 * zD50,
    yD65: Dynamic =
      -0.0282895 * xD50 + 1.0099416 * yD50 + 0.0210077 * zD50,
    zD65: Dynamic =
      0.0122982 * xD50 - 0.020483 * yD50 + 1.3299098 * zD50;
  return [
    DesignSystemTypeDeclarationsPow(
      3.2404542 * xD65 - 1.5371385 * yD65 - 0.4985314 * zD65,
    ),
    DesignSystemTypeDeclarationsPow(
      -0.969266 * xD65 + 1.8760108 * yD65 + 0.041556 * zD65,
    ),
    DesignSystemTypeDeclarationsPow(
      0.0556434 * xD65 - 0.2040259 * yD65 + 1.0572252 * zD65,
    ),
  ];
}
function normalizeCssColor(colorText?: Dynamic): Dynamic {
  let lowered: Dynamic = colorText.trim().toLowerCase();
  if (lowered.length > 96) return;
  let hexDigits: Dynamic = /^#([0-9a-f]{3,4}|[0-9a-f]{6}|[0-9a-f]{8})$/.exec(
    lowered,
  )?.[1];
  if (hexDigits !== undefined) {
    let expandedHex: Dynamic =
      hexDigits.length <= 4
        ? [...hexDigits]
            .map((character?: Dynamic): Dynamic => character + character)
            .join("")
        : hexDigits;
    return (
      "#" +
      (expandedHex.endsWith("ff") && expandedHex.length === 8
        ? expandedHex.slice(0, 6)
        : expandedHex)
    );
  }
  let colorFunction: Dynamic = /^(rgba?|hsla?|oklch|oklab|lab|lch)\(/.exec(
      lowered,
    )?.[1],
    components: Dynamic =
      colorFunction !== undefined ? parseColorFunction(lowered, colorFunction) : undefined;
  if (colorFunction === undefined || components === undefined) return;
  let alpha: Dynamic =
      components[3] !== undefined ? cssColorNumber(components[3], 1) : 1,
    rgbChannels: Dynamic;
  if (colorFunction === "rgb" || colorFunction === "rgba") {
    let [red, green, blue]: Dynamic = [
      cssColorNumber(components[0], 255),
      cssColorNumber(components[1], 255),
      cssColorNumber(components[2], 255),
    ];
    red !== undefined &&
      green !== undefined &&
      blue !== undefined &&
      (rgbChannels = [red / 255, green / 255, blue / 255]);
  } else if (colorFunction === "hsl" || colorFunction === "hsla") {
    let [hue, saturation, lightness]: Dynamic = [
      cssColorAngle(components[0]),
      cssColorNumber(components[1].replace(/%$/, ""), 100),
      cssColorNumber(components[2].replace(/%$/, ""), 100),
    ];
    if (hue !== undefined && saturation !== undefined && lightness !== undefined) {
      let [saturationRatio, lightnessRatio]: Dynamic = [
          DesignSystemTypeDeclarationsMax(saturation / 100),
          DesignSystemTypeDeclarationsMax(lightness / 100),
        ],
        channelForOffset: Dynamic = (channelOffset?: Dynamic): Dynamic => {
          let hueSector: Dynamic = (channelOffset + hue / 30) % 12;
          return (
            lightnessRatio -
            saturationRatio *
              Math.min(lightnessRatio, 1 - lightnessRatio) *
              Math.max(-1, Math.min(hueSector - 3, 9 - hueSector, 1))
          );
        };
      rgbChannels = [channelForOffset(0), channelForOffset(8), channelForOffset(4)];
    }
  } else if (colorFunction === "oklab" || colorFunction === "oklch") {
    let lightness: Dynamic = cssColorNumber(components[0], 1),
      axisA: Dynamic = cssColorNumber(components[1], 0.4),
      axisB: Dynamic =
        colorFunction === "oklab" ? cssColorNumber(components[2], 0.4) : undefined;
    if (colorFunction === "oklch") {
      let hueAngle: Dynamic = cssColorAngle(components[2]);
      axisA !== undefined &&
        hueAngle !== undefined &&
        ([axisA, axisB] = [
          Math.max(0, axisA) * Math.cos((hueAngle * Math.PI) / 180),
          Math.max(0, axisA) * Math.sin((hueAngle * Math.PI) / 180),
        ]);
    }
    lightness !== undefined &&
      axisA !== undefined &&
      axisB !== undefined &&
      (rgbChannels = oklabToCssRgb(
        DesignSystemTypeDeclarationsMax(lightness),
        axisA,
        axisB,
      ));
  } else {
    let lightness: Dynamic = cssColorNumber(components[0], 100),
      axisA: Dynamic = cssColorNumber(
        components[1],
        colorFunction === "lab" ? 125 : 150,
      ),
      axisB: Dynamic =
        colorFunction === "lab" ? cssColorNumber(components[2], 125) : undefined;
    if (colorFunction === "lch") {
      let hueAngle: Dynamic = cssColorAngle(components[2]);
      axisA !== undefined &&
        hueAngle !== undefined &&
        ([axisA, axisB] = [
          Math.max(0, axisA) * Math.cos((hueAngle * Math.PI) / 180),
          Math.max(0, axisA) * Math.sin((hueAngle * Math.PI) / 180),
        ]);
    }
    lightness !== undefined &&
      axisA !== undefined &&
      axisB !== undefined &&
      (rgbChannels = labToCssRgb(
        Math.max(0, Math.min(100, lightness)),
        axisA,
        axisB,
      ));
  }
  if (
    rgbChannels === undefined ||
    alpha === undefined ||
    rgbChannels.some((channel?: Dynamic): Dynamic => !Number.isFinite(channel))
  )
    return;
  let hexColor: Dynamic =
    "#" +
    DesignSystemTypeDeclarationsPadStart(rgbChannels[0]) +
    DesignSystemTypeDeclarationsPadStart(rgbChannels[1]) +
    DesignSystemTypeDeclarationsPadStart(rgbChannels[2]);
  return alpha >= 1
    ? hexColor
    : hexColor + DesignSystemTypeDeclarationsPadStart(alpha);
}
function sharedColorTokenPrefix(tokenNames?: Dynamic): Dynamic {
  if (tokenNames.length < 2) return "";
  let firstName: Dynamic = tokenNames[0],
    text: Dynamic = "";
  for (
    let dashIndex: Dynamic = firstName.indexOf("-");
    dashIndex > 0;
    dashIndex = firstName.indexOf("-", dashIndex + 1)
  ) {
    let candidatePrefix: Dynamic = firstName.slice(0, dashIndex + 1);
    if (
      !tokenNames.every(
        (tokenName?: Dynamic): Dynamic =>
          tokenName.startsWith(candidatePrefix) && tokenName.length > candidatePrefix.length,
      )
    )
      break;
    tokenNames.some(
      (tokenName?: Dynamic): Dynamic => hasColorTokenGroup(tokenName, candidatePrefix),
    ) && (text = candidatePrefix);
  }
  return text;
}
function colorTokenGroup(tokenName?: Dynamic, prefix: Dynamic = ""): Dynamic {
  let localName: Dynamic =
      prefix !== "" &&
      tokenName.startsWith(prefix) &&
      tokenName.length > prefix.length
        ? tokenName.slice(prefix.length)
        : tokenName,
    groupMatch: Dynamic = DesignSystemTypeDeclarationsPattern.exec(localName);
  if (groupMatch !== null && groupMatch[1] !== undefined && groupMatch[1] !== "")
    return groupMatch[1];
  let dashIndex: Dynamic = localName.indexOf("-");
  return dashIndex > 0 ? localName.slice(0, dashIndex) : localName;
}
function hasColorTokenGroup(tokenName?: Dynamic, prefix: Dynamic = ""): Dynamic {
  let localName: Dynamic =
    prefix !== "" && tokenName.startsWith(prefix) && tokenName.length > prefix.length
      ? tokenName.slice(prefix.length)
      : tokenName;
  return colorTokenGroup(tokenName, prefix) !== localName;
}
function groupColorTokens(tokenNames?: Dynamic): Dynamic {
  let sharedPrefix: Dynamic = sharedColorTokenPrefix(tokenNames),
    entries: Dynamic = new Map();
  for (let tokenName of tokenNames as Dynamic) {
    let groupName: Dynamic = colorTokenGroup(tokenName, sharedPrefix),
      entry: Dynamic = entries.get(groupName);
    entry === undefined && entries.set(groupName, (entry = []));
    entry.push(tokenName);
  }
  let namedGroups: Dynamic = [],
    ungroupedNames: Dynamic = [];
  for (let [groupLabel, groupNames] of entries as Dynamic)
    groupNames.some(
      (tokenName?: Dynamic): Dynamic => hasColorTokenGroup(tokenName, sharedPrefix),
    )
      ? namedGroups.push({
          label: groupLabel,
          names: groupNames,
        })
      : ungroupedNames.push(...groupNames);
  let orderByName: Dynamic = new Map(
    tokenNames.map(
      (tokenName?: Dynamic, position?: Dynamic): Dynamic => [tokenName, position],
    ),
  );
  ungroupedNames.sort(
    (firstName?: Dynamic, secondName?: Dynamic): Dynamic =>
      (orderByName.get(firstName) ?? 0) - (orderByName.get(secondName) ?? 0),
  );
  return ungroupedNames.length > 0
    ? [
        {
          label: PaletteValue,
          names: ungroupedNames,
        },
        ...namedGroups,
      ]
    : namedGroups;
}
function normalizeColorTokenName(name?: Dynamic): Dynamic {
  if (typeof name != "string") return;
  let bareName: Dynamic = name.replace(/^(--|\.)/, "");
  return DesignSystemTypeDeclarationsAZaZAZaZPattern.test(bareName)
    ? bareName
    : undefined;
}
function boundedDesignSystemText(
  text?: Dynamic,
  maxLength?: Dynamic,
): Dynamic {
  if (typeof text != "string" || text.trim() === "") return;
  let trimmed: Dynamic = text.trim();
  return trimmed.length > maxLength
    ? Array.from(trimmed).slice(0, maxLength).join("")
    : trimmed;
}
function designSystemName(designSystem?: Dynamic): Dynamic {
  return boundedDesignSystemText(designSystem?.name, 80);
}
function createDesignSystemModel(
  title?: Dynamic,
  url?: Dynamic,
  themeName?: Dynamic,
  colors?: Dynamic,
  typeStyles: Dynamic = [],
): Dynamic {
  if (colors.length === 0 && typeStyles.length === 0) return;
  let safeUrl: Dynamic = boundedDesignSystemText(url, 2e3),
    safeThemeName: Dynamic = boundedDesignSystemText(themeName, 80);
  return {
    get title() { return boundedDesignSystemText(title, 80) ?? (uiMessage("canvas.typeDeclarations.designSystem")); },
    ...(safeUrl !== undefined && /^https:\/\//.test(safeUrl)
      ? {
          url: safeUrl,
        }
      : {}),
    ...(safeThemeName !== undefined
      ? {
          theme: safeThemeName,
        }
      : {}),
    colors: colors,
    ...(typeStyles.length > 0
      ? {
          type: typeStyles,
        }
      : {}),
  };
}
function colorTokenGroupLabels(system?: Dynamic, color?: Dynamic): Dynamic {
  return hasSingleColorGroup(system)
    ? {
        group: system.title,
      }
    : {
        group: system.title,
        subgroup: color.group,
      };
}
function hasSingleColorGroup(system?: Dynamic): Dynamic {
  let entry: Dynamic = DesignSystemTypeDeclarationsElementCache.get(system);
  entry === undefined &&
    DesignSystemTypeDeclarationsElementCache.set(
      system,
      (entry = system.colors.every(
        (color?: Dynamic): Dynamic => color.group === system.colors[0].group,
      )),
    );
  return entry;
}
function typographyGroupLabels(system?: Dynamic, typeStyle?: Dynamic): Dynamic {
  let styles: Dynamic = system.type ?? [];
  return styles.every(
    (style?: Dynamic): Dynamic => style.group === styles[0].group,
  )
    ? {
        group: system.title,
      }
    : {
        group: system.title,
        subgroup: typeStyle.group,
      };
}
function parseDesignSystemEntry(entry?: Dynamic): Dynamic {
  if (typeof entry != "object" || entry === null) return;
  let entryRecord: Dynamic = entry;
  return parseCompleteDesignSystem(entryRecord.tokens, {
    title: boundedDesignSystemText(entryRecord.title, 80),
    url: boundedDesignSystemText(entryRecord.url, 2e3),
  });
}
function parseDesignSystems(source?: Dynamic): Dynamic {
  if (typeof source != "object" || source === null) return [];
  let sourceRecord: Dynamic = source;
  if (
    sourceRecord.systems === undefined &&
    ((typeof sourceRecord.color == "object" && sourceRecord.color !== null) ||
      (typeof sourceRecord.type == "object" && sourceRecord.type !== null))
  )
    return parseDesignSystems({
      v: 1,
      systems: [
        {
          tokens: source,
        },
      ],
    });
  if (
    (sourceRecord.v !== undefined && sourceRecord.v !== 1) ||
    !Array.isArray(sourceRecord.systems)
  )
    return [];
  let parsedSystems: Dynamic = sourceRecord.systems
      .map(parseDesignSystemEntry)
      .filter((system?: Dynamic): Dynamic => system !== undefined),
    uniqueSystems: Dynamic = [];
  for (let system of parsedSystems as Dynamic) {
    if (uniqueSystems.length >= 4) break;
    let title: Dynamic = system.title;
    for (
      let count: Dynamic = 2;
      uniqueSystems.some((existing?: Dynamic): Dynamic => existing.title === title) ||
      (title !== system.title &&
        parsedSystems.some((candidate?: Dynamic): Dynamic => candidate.title === title));
      count++
    )
      title = system.title + " " + String(count);
    uniqueSystems.push(
      title === system.title
        ? system
        : {
            ...system,
            title: title,
          },
    );
  }
  return uniqueSystems;
}
export {
  ApplicationJsonValue,
  boundedDesignSystemText,
  cacheReferencedHtml,
  clearPendingFileOverlay,
  colorTokenGroup,
  colorTokenGroupLabels,
  createDesignSystemModel,
  cssColorAngle,
  cssColorNumber,
  designSystemName,
  DesignSystemsKey,
  DesignSystemTypeDeclarationsAlias,
  DesignSystemTypeDeclarationsAZaZAZaZPattern,
  DesignSystemTypeDeclarationsCache,
  blobUrlByHtmlHash,
  lastPublishAtByHtmlHash,
  htmlReferenceByArtboardPath,
  pendingHtmlByArtboardPath,
  publishTimerByArtboardPath,
  DesignSystemTypeDeclarationsDelayMs,
  declarationDebounceMs,
  DesignSystemTypeDeclarationsElementCache,
  DesignSystemTypeDeclarationsFailedValue,
  DesignSystemTypeDeclarationsGet,
  DesignSystemTypeDeclarationsGetLength,
  DesignSystemTypeDeclarationsItems,
  DesignSystemTypeDeclarationsLimit,
  DesignSystemTypeDeclarationsMax,
  DesignSystemTypeDeclarationsPadStart,
  DesignSystemTypeDeclarationsPattern,
  DesignSystemTypeDeclarationsPow,
  DesignSystemTypeDeclarationsReduce,
  DesignSystemTypeDeclarationsRegistry,
  DesignSystemTypeDeclarationsReplace,
  DesignSystemTypeDeclarationsResolvedValue,
  DesignSystemTypeDeclarationsRgbaHslaPattern,
  DesignSystemTypeDeclarationsSubscribers,
  DesignSystemTypeDeclarationsTextEncoder,
  fetchHtmlReference,
  getArtboardHtmlReference,
  getDeclarationFiles,
  getHtmlReferenceState,
  getReferencedHtml,
  groupColorTokens,
  hasColorTokenGroup,
  hashHtmlReference,
  hasPendingFileOverlay,
  hasSingleColorGroup,
  htmlReferenceForText,
  htmlReferenceUploadWaiters,
  isKnownHtmlReference,
  knownHtmlReferenceState,
  labToCssRgb,
  loadDesignSystemFileOverlay,
  loadInstanceFileReferences,
  loadTypeDeclarationFiles,
  normalizeColorTokenName,
  normalizeCssColor,
  oklabToCssRgb,
  PaletteValue,
  parseColorFunction,
  parseDesignSystemEntry,
  parseDesignSystems,
  pendingFileOverlay,
  publishHtmlReference,
  retryTypeDeclarationFiles,
  sameOriginAssetFetcher,
  sameOriginFileFetcher,
  scheduleHtmlUpload,
  setArtboardHtmlReferences,
  setDeclarationReferences,
  setHtmlReferenceStore,
  setInstanceFileReferences,
  setPublishedFileReferences,
  sharedColorTokenPrefix,
  subscribeDeclarationFiles,
  subscribeHtmlReferences,
  typographyGroupLabels,
};
export function installDesignSystemTypeDeclarations(): () => void {
  return () => {
    DesignSystemTypeDeclarationsRegistry = {};
    DesignSystemTypeDeclarationsAlias = "[]";
    DesignSystemTypeDeclarationsFailedValue = [];
    DesignSystemTypeDeclarationsResolvedValue = 0;
    DesignSystemTypeDeclarationsSubscribers = new Set();
    pendingFileOverlay = false;
    DesignSystemTypeDeclarationsItems = [3e3, 15e3, 6e4];
    retryCooldownMs = 5 * 6e4;
    failedOverlayFiles = [];
    nextOverlayRetryAt = 0;
    DesignSystemTypeDeclarationsTextEncoder = new TextEncoder();
    DesignSystemTypeDeclarationsReduce = (): Dynamic =>
      Object.values(DesignSystemPublishedFilesFromEntriesValue).reduce(
        (totalBytes?: Dynamic, text?: Dynamic): Dynamic =>
          totalBytes +
          DesignSystemTypeDeclarationsTextEncoder.encode(text).length,
        0,
      );
    maxHtmlReferenceBytes = 2 * 1024 * 1024;
    ApplicationJsonValue = "application/json";
    DesignSystemTypeDeclarationsDelayMs = 15e3;
    DesignSystemTypeDeclarationsCache = new Map();
    blobUrlByHtmlHash = new Map();
    pendingHtmlFetches = new Set();
    lastPublishAtByHtmlHash = new Map();
    DesignSystemTypeDeclarationsLimit = 6e4;
    htmlReferenceByArtboardPath = new Map();
    htmlReferenceListeners = new Set();
    oversizedHtmlHashes = new Set();
    DesignSystemTypeDeclarationsReplace = (path?: Dynamic): Dynamic =>
      path.replace(/^\//, "");
    DesignSystemTypeDeclarationsGet = (htmlHash?: Dynamic): Dynamic => {
      let entry: Dynamic = lastPublishAtByHtmlHash.get(htmlHash);
      return (
        entry !== undefined &&
        Date.now() - entry < DesignSystemTypeDeclarationsLimit
      );
    };
    isUploadUnavailable = false;
    declarationDebounceMs = 800;
    pendingHtmlByArtboardPath = new Map();
    publishTimerByArtboardPath = new Map();
    uploadingArtboardPaths = new Set();
    DesignSystemTypeDeclarationsGetLength = (text?: Dynamic): Dynamic =>
      new TextEncoder().encode(text).length;
    DesignSystemsKey = "design-systems";
    DesignSystemTypeDeclarationsAZaZAZaZPattern =
      /^[A-Za-z0-9][A-Za-z0-9_.-]{0,63}$/;
    DesignSystemTypeDeclarationsMax = (unitValue?: Dynamic): Dynamic =>
      Math.max(0, Math.min(1, unitValue));
    DesignSystemTypeDeclarationsPadStart = (unitValue?: Dynamic): Dynamic =>
      Math.round(DesignSystemTypeDeclarationsMax(unitValue) * 255)
        .toString(16)
        .padStart(2, "0");
    DesignSystemTypeDeclarationsPow = (linearChannel?: Dynamic): Dynamic =>
      linearChannel <= 0.0031308
        ? 12.92 * linearChannel
        : 1.055 * Math.pow(linearChannel, 1 / 2.4) - 0.055;
    PaletteValue = "Palette";
    DesignSystemTypeDeclarationsPattern = /^(.*?)-\d{1,4}$/;
    DesignSystemTypeDeclarationsRgbaHslaPattern =
      /^(#([0-9a-f]{3,4}|[0-9a-f]{6}|[0-9a-f]{8})|(rgba?|hsla?|oklch|oklab|lab|lch|color)\([0-9a-z.,%/ \-]{1,60}\)|\{.+\})$/i;
    DesignSystemTypeDeclarationsElementCache = new WeakMap();
  };
}
