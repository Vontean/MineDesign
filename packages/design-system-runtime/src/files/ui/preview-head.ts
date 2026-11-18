import { uiMessage } from '@minedesign/contracts/ui-messages';
import type * as React from "react";
import type * as Preview from "../../contracts/preview";
import type * as Model from "../../contracts";
/** Restored application module; prepare first, initialize in original order. */
import { addressedProjectFileUrl, resolveFileVersion } from "../../editor/addressed-files";
import { previewStaticNoticeSnapshot } from "../../editor/component-preview";
import { isPreviewRunnerEnabled } from "../../editor/preview-runner";
import { publishedPreviewUrl } from "../../editor/published-preview";
import { swatchHeadsEqual } from "../../editor/swatch-runtime";
import { previewLibraryScripts } from "./handoff-runtime";
import { cachedFileAvailability, fileAvailabilityUrlPath, getFileAvailabilityRevision } from "./preview-availability";
import { hasBundleMetadata, isClaudeEmulator } from "../../model/derive-system";
import { DESIGN_SYSTEM_PATHS, estimateDataUriBytes, isHeldFilePointer, parseDataUriHeader, storagePointerForFile } from "../../model/file-policy";
import { REACT_LIBRARY_CATALOG, resolvePreviewLibraries } from "../../model/libraries";
import { generateFontFacesCss, generateTokensCss, isColorLiteral } from "../../model/tokens";

var preferLivePreviewUrls: boolean;
var previewHeadCache: Preview.PreviewHeadCache;
var supportsLivePreviewUrls: () => boolean;
function blobRelativeUrl(id: string): string {
  return "/_blob/" + id;
}
function previewFontIdentity(
  system: Preview.PreviewSystem,
  path: string,
): string {
  let file = system.files[path];
  if (file === undefined) {
    return "missing:" + path;
  }
  let reference = storagePointerForFile(path, file);
  if (reference !== null) {
    return (
      reference.store +
      ":" +
      path +
      ":" +
      (reference.store === "blob"
        ? reference.id
        : reference.rel || (resolveFileVersion(path) ?? ""))
    );
  } else {
    return (
      "held:" +
      path +
      ":" +
      String(estimateDataUriBytes(file)) +
      ":" +
      hashPreviewContent(file)
    );
  }
}
function hashPreviewContent(text: string): string {
  let hash = 2166136261;
  for (let index = 0; index < text.length; index++) {
    hash ^= text.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(36);
}
function previewFontSource(
  system: Preview.PreviewSystem,
  path: string,
  preferUrl: boolean = true,
): string | null {
  let file = system.files[path];
  if (file === undefined) {
    return null;
  }
  let reference = storagePointerForFile(path, file);
  if (reference !== null) {
    if (reference.store !== "blob") {
      let value = isHeldFilePointer(path, file)
        ? (addressedProjectFileUrl(path) ??
          system.fonts.find((input) => input.path === path)?.src ??
          "")
        : "";
      try {
        if (value === "") {
          return null;
        } else {
          return new URL(value, document.baseURI).pathname;
        }
      } catch {
        return null;
      }
    }
    if (isClaudeEmulator()) {
      let value =
        system.fonts.find((input) => input.path === path)?.src ?? "";
      if (value === "") {
        return null;
      } else {
        return value;
      }
    }
    return blobRelativeUrl(reference.id);
  }
  if (parseDataUriHeader(file) === null) {
    return null;
  }
  if (!preferUrl) {
    return file;
  }
  if (preferLivePreviewUrls && supportsLivePreviewUrls()) {
    return publishedPreviewUrl(path, file, "font")?.url ?? file;
  }
  if (
    cachedFileAvailability(
      path,
      estimateDataUriBytes(file),
    ) === true
  ) {
    return fileAvailabilityUrlPath(path);
  } else {
    return file;
  }
}
function previewColorSchemeCss(
  mode: Preview.PreviewMode,
  hasDarkTheme: boolean,
  transparent: boolean = true,
): string {
  if (mode === "dark" && !hasDarkTheme) {
    return `
html{color-scheme:light}`;
  }
  return (
    `
html{color-scheme:` +
    mode +
    "}" +
    (transparent ? "html,body{background:transparent!important}" : "")
  );
}
function darkThemeId(system: Preview.PreviewSystem): string | undefined {
  return system.tokens.color.themes.find(
    (input) => /dark/i.test(input.id) || /dark/i.test(input.name),
  )?.id;
}
function defaultPreviewThemeId(
  system: Preview.PreviewSystem,
  mode: Preview.PreviewMode,
): string | undefined {
  return (
    (mode === "dark" ? darkThemeId(system) : undefined) ??
    system.tokens.color.themes[0]?.id
  );
}
function previewLibraries(
  system: Preview.PreviewSystem,
): Preview.PreviewLibraryResult {
  let addReact =
      previewStaticNoticeSnapshot() &&
      system.bundle.js !== null &&
      !system.bundle.declared.some((input) =>
        REACT_LIBRARY_CATALOG.some(
          (input2: { name: string }) => input2.name === input.name,
        ),
      ),
    declared = addReact
      ? [
          ...REACT_LIBRARY_CATALOG.map(
            (input: { name: string; version: string }) => ({
              name: input.name,
              version: input.version,
            }),
          ),
          ...system.bundle.declared,
        ]
      : system.bundle.declared,
    hasLibraryFile = (input: string) =>
      system.bundle.libraries.load.some((input2) => input2.file === input) ||
      (addReact &&
        REACT_LIBRARY_CATALOG.some(
          (input2: { packedFile: string }) => input2.packedFile === input,
        ) &&
        Object.hasOwn(system.files, input));
  return {
    addReact: addReact,
    libraries:
      system.bundle.js === null
        ? system.bundle.libraries
        : resolvePreviewLibraries(
            declared,
            hasLibraryFile,
            undefined,
            true,
          ),
  };
}
function previewStaticStatus(
  system: Preview.PreviewSystem,
  libraries: Model.ResolvedLibraries = previewLibraries(system).libraries,
): Preview.PreviewStaticStatus {
  if (system.bundle.js !== null && libraries.missing.length > 0) {
    let { missing: value, missingFiles: value2 } = libraries,
      value3 = Object.freeze(
        value2.length === value.length
          ? [...value2]
          : value.map((input) => "components/lib/… for " + input),
      );
    return {
      staticReason:
        uiMessage("design-system.previewHead.previewsCanTRun") +
        (value3.length === 1
          ? "1 file is missing."
          : String(value3.length) + " files are missing."),
      staticMissing: value3,
    };
  }
  return {
    staticReason:
      system.components.length > 0 &&
      system.bundle.js === null &&
      hasBundleMetadata(system.bundle)
        ? uiMessage("design-system.previewHead.previewsCanTRunComponents")
        : "",
    staticMissing: Object.freeze([]),
  };
}
function createPreviewHead(
  system: Preview.PreviewSystem,
  mode: Preview.PreviewMode = "light",
  themeId?: string,
  transparent: boolean = true,
  ground?: string,
  preferUrl: boolean = true,
): Preview.PreviewHeadResult {
  let cache = previewHeadCache.get(system.files);
  if (cache === undefined) {
    previewHeadCache.set(system.files, (cache = new Map()));
  }
  let selectedTheme =
      themeId !== undefined &&
      system.tokens.color.themes.some((input) => input.id === themeId)
        ? themeId
        : defaultPreviewThemeId(system, mode),
    { addReact: addReact, libraries: libraries } = previewLibraries(system),
    useLiveUrls =
      preferUrl && preferLivePreviewUrls && supportsLivePreviewUrls(),
    heldUrl = (
      input: string,
      options: "style" | "script" | "font",
    ): Preview.PreviewHeldUrl | undefined => {
      let value = useLiveUrls ? system.files[input] : undefined,
        value2 =
          value === undefined || value === ""
            ? undefined
            : publishedPreviewUrl(input, value, options);
      if (value2 === undefined) {
        return undefined;
      } else {
        return Object.freeze({
          ...value2,
          file: input,
        });
      }
    },
    bundleCssUrl = heldUrl(DESIGN_SYSTEM_PATHS.bundleCss, "style"),
    libraryScriptUrls: (Preview.PreviewHeldUrl | undefined)[] =
      libraries.load.map((input) => heldUrl(input.file, "script")),
    bundleJsUrl = heldUrl(DESIGN_SYSTEM_PATHS.bundleJs, "script"),
    fontUrls: Preview.PreviewFontUrl[] = !useLiveUrls
      ? []
      : system.tokens.type.fonts.flatMap((input) => {
          let value = system.files[input.file],
            value2 =
              value === undefined ||
              parseDataUriHeader(value) === null
                ? undefined
                : publishedPreviewUrl(input.file, value, "font");
          if (value2 === undefined) {
            return [];
          } else {
            return [
              Object.freeze({
                url: value2.url,
                file: input.file,
                face: Object.freeze({
                  family: input.family,
                  weight: String(input.weight),
                  style: String(input.style),
                }),
              }),
            ];
          }
        }),
    urlFingerprint =
      "|u:" +
      (!preferUrl
        ? "off"
        : !useLiveUrls
          ? "g" + String(getFileAvailabilityRevision())
          : [bundleCssUrl, ...libraryScriptUrls, bundleJsUrl, ...fontUrls]
              .map((input) => input?.url ?? "")
              .join(",")),
    baseCacheKey =
      mode +
      ":" +
      (selectedTheme ?? "") +
      ":" +
      (transparent ? "flush" : "ground") +
      ":" +
      (ground ?? "") +
      (addReact ? ":react" : ""),
    cacheKey = baseCacheKey + urlFingerprint,
    cached = cache.get(cacheKey);
  if (cached !== undefined) {
    return cached;
  }
  let previous: Preview.PreviewHeadResult | undefined;
  for (let value of [...cache.keys()]) {
    if (!value.startsWith(baseCacheKey + "|u:")) {
      continue;
    }
    previous = cache.get(value);
    cache.delete(value);
  }
  let hasDarkTheme = darkThemeId(system) !== undefined,
    tokensCss =
      generateTokensCss(system.tokens, {
        fontFaces: false,
      }) +
      previewColorSchemeCss(mode, hasDarkTheme, transparent) +
      (ground !== undefined && isColorLiteral(ground)
        ? "html{background:" + ground + "!important}"
        : ""),
    fontsCss = generateFontFacesCss(
      system.tokens,
      (input: string) => previewFontSource(system, input, preferUrl),
    ),
    fontsKey = generateFontFacesCss(
      system.tokens,
      (input: string) => previewFontIdentity(system, input),
    ),
    { staticReason: staticReason, staticMissing: staticMissing } =
      previewStaticStatus(system, libraries),
    runnable = staticReason === "",
    hasUrls =
      fontUrls.length > 0 ||
      (runnable &&
        [bundleCssUrl, bundleJsUrl, ...libraryScriptUrls].some(
          (input) => input !== undefined,
        )),
    result: Preview.PreviewHeadResult = Object.freeze({
      head: Object.freeze({
        tokensCss: tokensCss,
        fontsCss: fontsCss,
        fontsKey: fontsKey,
        bundleCss: system.bundle.css ?? "",
        runtimeScripts: Object.freeze(
          staticReason === ""
            ? previewLibraryScripts(libraries, system.files)
            : [],
        ),
        runtimeTags: Object.freeze(
          staticReason === ""
            ? libraries.fetch.map((input) =>
                Object.freeze({
                  src: input.url,
                  integrity: input.integrity,
                }),
              )
            : [],
        ),
        bundleJs: system.bundle.js ?? "",
        ...(fontUrls.length > 0
          ? {
              fontsCssHeld: generateFontFacesCss(
                system.tokens,
                (input: string) => previewFontSource(system, input, false),
              ),
            }
          : {}),
        ...(hasUrls
          ? {
              urls: Object.freeze({
                ...(runnable && bundleCssUrl !== undefined
                  ? {
                      bundleCss: bundleCssUrl,
                    }
                  : {}),
                runtimeScripts: Object.freeze(
                  runnable ? libraryScriptUrls : [],
                ),
                ...(runnable && bundleJsUrl !== undefined
                  ? {
                      bundleJs: bundleJsUrl,
                    }
                  : {}),
                fonts: Object.freeze(fontUrls),
              }),
            }
          : {}),
        ...(selectedTheme !== undefined
          ? {
              themeId: selectedTheme,
            }
          : {}),
        mode: mode,
        colorScheme: mode === "dark" && !hasDarkTheme ? "light" : mode,
      }),
      staticReason: staticReason,
      staticMissing: staticMissing,
    });
  if (previous !== undefined) {
    swatchHeadsEqual(previous.head, result.head);
  }
  cache.set(cacheKey, result);
  return result;
}
export {
  blobRelativeUrl,
  createPreviewHead,
  darkThemeId,
  defaultPreviewThemeId,
  hashPreviewContent,
  preferLivePreviewUrls,
  previewColorSchemeCss,
  previewFontIdentity,
  previewFontSource,
  previewHeadCache,
  previewLibraries,
  previewStaticStatus,
  supportsLivePreviewUrls,
};
export function installFilesUiPreviewHead(): () => void {
  return () => {
    preferLivePreviewUrls = true;
    previewHeadCache = new WeakMap();
    supportsLivePreviewUrls = () =>
      isPreviewRunnerEnabled(globalThis);
  };
}
