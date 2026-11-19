import type { DataRecord } from "../contracts/storage";
import type {
  UnicodeRange,
  FontDescriptor,
  ExportFontFace,
  FontUsageIndex,
  FontPruning,
  ExportAssetResolver,
  FontAwareResolver,
} from "../contracts/fonts";
import type { PreviewHandle } from "../contracts/geometry";
/** Restored application module; prepare first, initialize in original order. */

var fontLoadStates: Set<string>;
var maxExportFontFaces: number;
var maxExportFontDescriptorLength: number;
var maxExportFontDescriptorBytes: number;
var exportFontProbeTimeoutMs: number;
var fontLoadProbeScript: (timeoutMs: number) => string;
var fontLoadProbeScriptDefault: string;
var isValidExportFontDescriptor: (state: unknown) => state is FontDescriptor;
var fullUnicodeRange: UnicodeRange;
var normalizeFontFamily: (family: string) => string;
var fontUnicodeRangesKey: (ranges: readonly UnicodeRange[]) => string;
var fontFaceKey: (family: string, style: string, weight: string) => string;
var spaceCodepoint: number;
var fontRangesContainSpace: (ranges: readonly UnicodeRange[]) => boolean;
var cssFontFaceRulePattern: RegExp;
var cssFontFacePropertyPattern: (property: string) => RegExp;
var fontFamilyDeclarationPattern: RegExp;
var fontStyleDeclarationPattern: RegExp;
var fontWeightDeclarationPattern: RegExp;
var fontUnicodeRangeDeclarationPattern: RegExp;
var fontFaceAssetUrlPattern: RegExp;
var googleFontsCssUrlPattern: RegExp;
async function collectArtboardFontDescriptors(
  webview: PreviewHandle,
): Promise<FontDescriptor[] | null> {
  try {
    let value = await webview.executeJavaScript(
      fontLoadProbeScriptDefault,
      exportFontProbeTimeoutMs + 5e3,
    );
    return !Array.isArray(value) ||
      value.length > maxExportFontFaces ||
      !value.every(isValidExportFontDescriptor) ||
      value.reduce(
        (totalLength, descriptor) =>
          totalLength +
          descriptor.family.length +
          descriptor.style.length +
          descriptor.weight.length +
          descriptor.unicodeRange.length,
        0,
      ) > maxExportFontDescriptorBytes ||
      (value.length > 0 &&
        value.every((state) => state.status === "unloaded"))
      ? null
      : value.map((state) => ({
          family: state.family,
          style: state.style,
          weight: state.weight,
          unicodeRange: state.unicodeRange,
          status: state.status,
        }));
  } catch {
    return null;
  }
}
function parseFontUnicodeRanges(
  unicodeRange?: string,
): UnicodeRange[] | null {
  if (unicodeRange === undefined || unicodeRange.trim() === "")
    return [fullUnicodeRange];
  let items: UnicodeRange[] = [];
  for (let value of unicodeRange.split(",")) {
    let rangeMatch = /^u\+([0-9a-f?]{1,6})(?:-([0-9a-f]{1,6}))?$/i.exec(
      value.trim(),
    );
    if (rangeMatch === null) return null;
    let [, startCode, endCode] = rangeMatch;
    endCode !== undefined
      ? items.push([parseInt(startCode!, 16), parseInt(endCode, 16)])
      : startCode!.includes("?")
        ? items.push([
            parseInt(startCode!.replaceAll("?", "0"), 16),
            parseInt(startCode!.replaceAll("?", "f"), 16),
          ])
        : items.push([parseInt(startCode!, 16), parseInt(startCode!, 16)]);
  }
  if (
    items.some(
      ([start, end]) =>
        Number.isNaN(start) || Number.isNaN(end) || start > end,
    )
  )
    return null;
  items.sort((leftRange, rightRange) => leftRange[0] - rightRange[0]);
  let mergedRanges: UnicodeRange[] = [];
  for (let value of items) {
    let previousRange = mergedRanges[mergedRanges.length - 1];
    previousRange !== undefined && value[0] <= previousRange[1] + 1
      ? (previousRange[1] = Math.max(previousRange[1], value[1]))
      : mergedRanges.push([value[0], value[1]]);
  }
  return mergedRanges;
}
function normalizeFontWeightRange(weight: string): string {
  let value = weight
      .trim()
      .toLowerCase()
      .split(/\s+/)
      .filter((weightValue) => weightValue !== ""),
    callback: (weight: string) => number = (weightValue) =>
      weightValue === "normal" ? 400 : weightValue === "bold" ? 700 : Number(weightValue),
    minWeight = value.length === 0 ? 400 : callback(value[0]!),
    maxWeight = value.length > 1 ? callback(value[1]!) : minWeight;
  return Number.isFinite(minWeight) && Number.isFinite(maxWeight)
    ? String(Math.min(minWeight, maxWeight)) +
        " " +
        String(Math.max(minWeight, maxWeight))
    : value.join(" ");
}
function parseExportFontFaceRules(css: string): ExportFontFace[] {
  let items: ExportFontFace[] = [];
  for (let value of css.match(cssFontFaceRulePattern) ?? []) {
    if (value.indexOf("{") !== value.lastIndexOf("{")) continue;
    let unicodeRanges = parseFontUnicodeRanges(
        fontUnicodeRangeDeclarationPattern.exec(value)?.[1],
      ),
      assetUrls = [...value.matchAll(fontFaceAssetUrlPattern)]
        .map((match) =>
          (match[1] ?? match[2] ?? match[3] ?? "").split("#")[0]!.trim(),
        )
        .filter((url) => /^https:\/\//i.test(url));
    if (assetUrls.length === 0) continue;
    let familyDeclaration = fontFamilyDeclarationPattern.exec(value)?.[1] ?? "";
    items.push({
      family: normalizeFontFamily(familyDeclaration),
      face: fontFaceKey(
        familyDeclaration,
        fontStyleDeclarationPattern.exec(value)?.[1] ?? "normal",
        fontWeightDeclarationPattern.exec(value)?.[1] ?? "400",
      ),
      ranges: unicodeRanges === null ? null : fontUnicodeRangesKey(unicodeRanges),
      coversSpace: unicodeRanges === null || fontRangesContainSpace(unicodeRanges),
      files: assetUrls,
    });
  }
  return items;
}
function indexExportFontUsage(
  fontFaces: readonly FontDescriptor[],
): FontUsageIndex {
  let entries: Map<string, string[]> = new Map(),
    drawnFontsByFamily: Map<string, Set<string>> = new Map();
  for (let value of fontFaces) {
    let ranges = parseFontUnicodeRanges(value.unicodeRange),
      status = value.status.toLowerCase(),
      fontRuleKey =
        fontFaceKey(value.family, value.style, value.weight) +
        `
` +
        (ranges === null ? "unreadable" : fontUnicodeRangesKey(ranges));
    if (ranges !== null) {
      let entry = entries.get(fontRuleKey);
      entry === undefined
        ? entries.set(fontRuleKey, [status])
        : entry.push(status);
    }
    if (status !== "unloaded") {
      let entry = drawnFontsByFamily.get(normalizeFontFamily(value.family));
      entry === undefined
        ? drawnFontsByFamily.set(normalizeFontFamily(value.family), new Set([fontRuleKey]))
        : entry.add(fontRuleKey);
    }
  }
  return {
    byRule: entries,
    drawnByFamily: drawnFontsByFamily,
  };
}
function pruneUnusedExportFontFaces(
  css: string,
  fontUsage: FontUsageIndex,
): FontPruning {
  let value = parseExportFontFaceRules(css),
    values = new Set(
      value.map((fontFace) =>
        fontFace.ranges === null
          ? null
          : fontFace.face +
            `
` +
            fontFace.ranges,
      ),
    ),
    usedFamilies = new Set(
      [...fontUsage.drawnByFamily]
        .filter(([, fontRuleSet]) =>
          [...fontRuleSet].some((fontRuleKey) => !values.has(fontRuleKey)),
        )
        .map(([family]) => family),
    ),
    shouldKeep = value.map((fontFace) => {
      if (fontFace.ranges === null || usedFamilies.has(fontFace.family)) return true;
      let entry = fontUsage.byRule.get(
        fontFace.face +
          `
` +
          fontFace.ranges,
      );
      return (
        entry === undefined || entry.some((status) => status !== "unloaded")
      );
    }),
    keptFaces = new Set(
      value
        .filter((fontFace, index) => shouldKeep[index])
        .map((fontFace) => fontFace.face),
    ),
    keepFiles: Set<string> = new Set(),
    leaveFiles: Set<string> = new Set();
  value.forEach((fontFace, index) => {
    let shouldKeepFace =
      shouldKeep[index] || (fontFace.coversSpace && keptFaces.has(fontFace.face));
    for (let file of fontFace.files) (shouldKeepFace ? keepFiles : leaveFiles).add(file);
  });
  for (let file of keepFiles) leaveFiles.delete(file);
  return {
    keep: keepFiles,
    leave: leaveFiles,
  };
}
function createFontAwareExportResolver(
  resolveAsset: ExportAssetResolver,
  fontDescriptors: readonly FontDescriptor[],
): FontAwareResolver {
  let value = indexExportFontUsage(fontDescriptors),
    values: Set<string> = new Set(),
    resolvingUrls: Set<string> = new Set(),
    omittedUrls: Set<string> = new Set();
  return {
    resolve: async (url, resolveOptions) => {
      if (resolvingUrls.has(url)) {
        omittedUrls.add(url);
        return null;
      }
      let asset = await resolveAsset(url, resolveOptions);
      if (
        asset !== null &&
        fontDescriptors.length > 0 &&
        /^text\/css\b/i.test(asset.mime)
      ) {
        let cssText = new TextDecoder().decode(asset.data),
          { keep: keepFiles, leave: leaveFiles } = googleFontsCssUrlPattern.test(
            url,
          )
            ? pruneUnusedExportFontFaces(cssText, value)
            : {
                keep: parseExportFontFaceRules(cssText).flatMap(
                  (fontFace) => fontFace.files,
                ),
                leave: [],
              };
        for (let file of keepFiles) {
          values.add(file);
          resolvingUrls.delete(file);
        }
        for (let file of leaveFiles) values.has(file) || resolvingUrls.add(file);
      }
      return asset;
    },
    leftOut: () => [...omittedUrls],
  };
}
export {
  collectArtboardFontDescriptors,
  createFontAwareExportResolver,
  cssFontFacePropertyPattern,
  cssFontFaceRulePattern,
  exportFontProbeTimeoutMs,
  fontFaceAssetUrlPattern,
  fontFaceKey,
  fontFamilyDeclarationPattern,
  fontLoadProbeScript,
  fontLoadProbeScriptDefault,
  fontLoadStates,
  fontRangesContainSpace,
  fontStyleDeclarationPattern,
  fontUnicodeRangeDeclarationPattern,
  fontUnicodeRangesKey,
  fontWeightDeclarationPattern,
  fullUnicodeRange,
  googleFontsCssUrlPattern,
  indexExportFontUsage,
  isValidExportFontDescriptor,
  maxExportFontDescriptorBytes,
  maxExportFontDescriptorLength,
  maxExportFontFaces,
  normalizeFontFamily,
  normalizeFontWeightRange,
  parseExportFontFaceRules,
  parseFontUnicodeRanges,
  pruneUnusedExportFontFaces,
  spaceCodepoint,
};
export function installExportFontUsage(): () => void {
  return () => {
    fontLoadStates = new Set(["unloaded", "loading", "loaded", "error"]);
    maxExportFontFaces = 2e4;
    maxExportFontDescriptorLength = 16e3;
    maxExportFontDescriptorBytes = 8e6;
    exportFontProbeTimeoutMs = 3e3;
    fontLoadProbeScript = (timeoutMs: number): string =>
      "(function(){if(window.frames.length>0||!document.fonts)return null;var deadline=Date.now()+" +
      String(timeoutMs) +
      `;var raf=window.requestAnimationFrame||function(f){setTimeout(f,16)};var headAt=Date.now();var mo=window.MutationObserver&&document.head?new MutationObserver(function(){headAt=Date.now()}):null;if(mo)mo.observe(document.head,{childList:true});var pending=function(){void(document.body&&document.body.offsetHeight);if(Date.now()-headAt<200||document.readyState!=='complete')return true;var l=document.querySelectorAll('link[rel~="stylesheet"][href^="https://fonts.googleapis.com/"]');for(var i=0;i<l.length;i++){if(!l[i].sheet)return true}return false};var loaded=new Promise(function(r){var on=0;var done=function(v){if(mo)mo.disconnect();r(v)};var tick=function(){if(!pending())done(true);else if(Date.now()>deadline)done(false);else setTimeout(tick,100)};var start=function(){if(!on){on=1;tick()}};raf(function(){raf(start)});setTimeout(start,120)});return loaded.then(function(ok){if(!ok)return null;var settled=document.fonts.ready.then(function(){},function(){});var cap=new Promise(function(r){setTimeout(r,Math.max(0,deadline-Date.now()))});return Promise.race([settled,cap]).then(function(){void(document.documentElement&&document.documentElement.offsetHeight);var o=[],seen={};document.fonts.forEach(function(f){var r={family:String(f.family),style:String(f.style),weight:String(f.weight),unicodeRange:String(f.unicodeRange),status:String(f.status)};var k=[r.family,r.style,r.weight,r.unicodeRange,r.status].join('|');if(!seen[k]){seen[k]=1;o.push(r)}});return o})})})()`;
    fontLoadProbeScriptDefault = fontLoadProbeScript(exportFontProbeTimeoutMs);
    isValidExportFontDescriptor = (state: unknown): state is FontDescriptor =>
      typeof state == "object" &&
      state !== null &&
      ["family", "style", "weight", "unicodeRange", "status"].every(
        (key) =>
          typeof (state as DataRecord)[key] == "string" &&
          ((state as DataRecord)[key] as string).length <=
            maxExportFontDescriptorLength,
      ) &&
      fontLoadStates.has((state as DataRecord).status as string);
    fullUnicodeRange = [0, 1114111];
    normalizeFontFamily = (family: string): string =>
      family
        .trim()
        .replace(/^["']|["']$/g, "")
        .trim()
        .toLowerCase();
    fontUnicodeRangesKey = (ranges: readonly UnicodeRange[]): string =>
      ranges
        .map((range) => String(range[0]) + "-" + String(range[1]))
        .join(",");
    fontFaceKey = (family: string, style: string, weight: string): string =>
      normalizeFontFamily(family) +
      `
` +
      style.trim().toLowerCase() +
      `
` +
      normalizeFontWeightRange(weight);
    spaceCodepoint = 32;
    fontRangesContainSpace = (ranges: readonly UnicodeRange[]): boolean =>
      ranges.some(
        ([start, end]) =>
          start <= spaceCodepoint && spaceCodepoint <= end,
      );
    cssFontFaceRulePattern = /@font-face\s*\{[^}]*\}/gi;
    cssFontFacePropertyPattern = (property: string): RegExp =>
      new RegExp("(?:^|[{;\\s])" + property + "\\s*:\\s*([^;}]+)", "i");
    fontFamilyDeclarationPattern = cssFontFacePropertyPattern("font-family");
    fontStyleDeclarationPattern = cssFontFacePropertyPattern("font-style");
    fontWeightDeclarationPattern = cssFontFacePropertyPattern("font-weight");
    fontUnicodeRangeDeclarationPattern =
      cssFontFacePropertyPattern("unicode-range");
    fontFaceAssetUrlPattern =
      /url\(\s*(?:"(?!data:|blob:|#)([^"]+)"|'(?!data:|blob:|#)([^']+)'|(?!['"]|data:|blob:|#)([^)]+?))\s*\)/gi;
    googleFontsCssUrlPattern = /^https:\/\/fonts\.googleapis\.com\//i;
  };
}
