/** Restored application module; prepare first, initialize in original order. */
import {
  type Dynamic,
} from "../runtime-types";
import { alreadyCompressedExportMimeTypes, containsProjectServeAccessToken, encodeBinaryBase64, exportAssetUuidPattern, hasCompressedFileSignature, maxCssImportDepth, mimeTypePattern, redactProjectServeAccessToken, resolveExportAssetUrl } from "./standalone-html";

var cssImportRulePattern: Dynamic;
var cssAssetUrlPattern: Dynamic;
function escapeExportStyleClosingTag(css?: Dynamic): Dynamic {
  return css.replace(/<\/(style)/gi, "<\\/$1");
}
function escapeExportScriptClosingTags(script?: Dynamic): Dynamic {
  return script.replace(/<\//g, "<\\u002F");
}
function wrapImportedCssConditions(
  css?: Dynamic,
  conditions?: Dynamic,
): Dynamic {
  conditions = conditions.trim();
  if (!conditions) return css;
  let value: Dynamic = null,
    supportsCondition: Dynamic = null,
    layerMatch: Dynamic = /^layer(?=\s|$|\()(?:\(([^)]*)\))?\s*/i.exec(
      conditions,
    );
  layerMatch &&
    ((value = (layerMatch[1] ?? "").trim()),
    (conditions = conditions.slice(layerMatch[0].length)));
  let supportsMatch: Dynamic = /^supports\(/i.exec(conditions);
  if (supportsMatch) {
    let index: Dynamic = 0,
      conditionEnd: Dynamic = supportsMatch[0].length - 1;
    for (; conditionEnd < conditions.length; conditionEnd++)
      if (conditions[conditionEnd] === "(") index++;
      else if (conditions[conditionEnd] === ")" && --index === 0) {
        conditionEnd++;
        break;
      }
    supportsCondition = conditions.slice(supportsMatch[0].length - 1, conditionEnd);
    conditions = conditions.slice(conditionEnd);
  }
  let mediaCondition: Dynamic = conditions.trim();
  mediaCondition &&
    (css = `@media ${mediaCondition} {
${css}
}`);
  supportsCondition &&
    (css = `@supports ${supportsCondition} {
${css}
}`);
  value !== null &&
    (css = value
      ? `@layer ${value} {
${css}
}`
      : `@layer {
${css}
}`);
  return css;
}
async function inlineExportCssImports(
  css?: Dynamic,
  path?: Dynamic,
  resolveAsset?: Dynamic,
  assets?: Dynamic,
  depth?: Dynamic,
  inlineMode?: Dynamic,
  warnings?: Dynamic,
): Promise<Dynamic> {
  if (depth >= maxCssImportDepth) return css;
  let items: Dynamic = [];
  for (let value of css.matchAll(cssImportRulePattern) as Dynamic) {
    let importUrl: Dynamic =
        value[1] ?? value[2] ?? value[3] ?? value[4] ?? value[5],
      scheme: Dynamic = importUrl
        .slice(0, importUrl.indexOf(":") + 1)
        .toLowerCase();
    if (scheme === "data:" || scheme === "blob:") continue;
    let assetUrl: Dynamic = resolveExportAssetUrl(importUrl, path),
      asset: Dynamic = await resolveAsset(assetUrl);
    if (asset) {
      let importedCss: Dynamic = new TextDecoder().decode(asset.data);
      importedCss = await inlineExportCssImports(
        importedCss,
        assetUrl,
        resolveAsset,
        assets,
        depth + 1,
        inlineMode,
        warnings,
      );
      importedCss = wrapImportedCssConditions(importedCss, value[6] || "");
      items.push({
        full: value[0],
        content: importedCss,
      });
    }
  }
  for (let value of items as Dynamic)
    css = css.split(value.full).join(value.content);
  return inlineMode === "data"
    ? inlineExportCssAssetUrls(css, path, resolveAsset, assets, warnings)
    : replaceCssAssetUrlsWithIds(css, path, resolveAsset, assets);
}
async function replaceCssAssetUrlsWithIds(
  css?: Dynamic,
  path?: Dynamic,
  resolveAsset?: Dynamic,
  assets?: Dynamic,
): Promise<Dynamic> {
  let items: Dynamic = [],
    value: Dynamic;
  for (
    cssAssetUrlPattern.lastIndex = 0;
    (value = cssAssetUrlPattern.exec(css)) !== null;

  ) {
    let assetUrl: Dynamic = value[1] ?? value[2] ?? value[3];
    if (exportAssetUuidPattern.test(assetUrl.split("#")[0])) continue;
    let fragmentIndex: Dynamic = assetUrl.indexOf("#"),
      fragment: Dynamic = fragmentIndex >= 0 ? assetUrl.slice(fragmentIndex) : "",
      resolvedUrl: Dynamic = resolveExportAssetUrl(assetUrl, path),
      assetId: Dynamic;
    if (assets.has(resolvedUrl)) assetId = assets.get(resolvedUrl).uuid;
    else {
      let asset: Dynamic = await resolveAsset(resolvedUrl);
      if (!asset) continue;
      assetId = crypto.randomUUID();
      assets.set(resolvedUrl, {
        uuid: assetId,
        data: asset.data,
        mime: asset.mime,
      });
    }
    items.push({
      original: value[0],
      replacement: `url("${assetId}${fragment}")`,
    });
  }
  for (let replacement of items as Dynamic)
    css = css.split(replacement.original).join(replacement.replacement);
  return css;
}
async function inlineExportCssAssetUrls(
  css?: Dynamic,
  path?: Dynamic,
  resolveAsset?: Dynamic,
  assets?: Dynamic,
  warnings?: Dynamic,
): Promise<Dynamic> {
  let items: Dynamic = [],
    values: Dynamic = new Set(),
    value: Dynamic;
  for (
    cssAssetUrlPattern.lastIndex = 0;
    (value = cssAssetUrlPattern.exec(css)) !== null;

  ) {
    let assetUrl: Dynamic = value[1] ?? value[2] ?? value[3],
      fragmentIndex: Dynamic = assetUrl.indexOf("#"),
      fragment: Dynamic = fragmentIndex >= 0 ? assetUrl.slice(fragmentIndex) : "",
      resolvedUrl: Dynamic = resolveExportAssetUrl(
        assetUrl.split("#")[0],
        path,
      );
    if (values.has(resolvedUrl)) continue;
    let entry: Dynamic = assets.get(resolvedUrl);
    entry || (entry = await resolveAsset(resolvedUrl));
    if (!entry) {
      values.add(resolvedUrl);
      continue;
    }
    let mimeType: Dynamic = entry.mime.split(";")[0].trim().toLowerCase();
    if (
      !(
        alreadyCompressedExportMimeTypes.has(mimeType) &&
        hasCompressedFileSignature(entry.data)
      ) &&
      containsProjectServeAccessToken(
        new TextDecoder().decode(entry.data),
      )
    ) {
      warnings.push(
        `serve token not removed: asset "${redactProjectServeAccessToken(resolvedUrl)}" referenced from a stylesheet ships bytes matching a project serve access token \u2014 the published file may carry a live access token`,
      );
      values.add(resolvedUrl);
      continue;
    }
    let dataMimeType: Dynamic = mimeTypePattern.test(mimeType)
      ? mimeType
      : "application/octet-stream";
    items.push({
      original: value[0],
      replacement: `url("data:${dataMimeType};base64,${encodeBinaryBase64(entry.data)}${fragment}")`,
    });
  }
  for (let replacement of items as Dynamic)
    css = css.split(replacement.original).join(replacement.replacement);
  return css;
}
export {
  cssAssetUrlPattern,
  cssImportRulePattern,
  escapeExportScriptClosingTags,
  escapeExportStyleClosingTag,
  inlineExportCssAssetUrls,
  inlineExportCssImports,
  replaceCssAssetUrlsWithIds,
  wrapImportedCssConditions,
};
export function installExportCssAssets(): () => void {
  return () => {
    cssImportRulePattern =
      /@import\s+(?:url\(\s*(?:"([^"]+)"|'([^']+)'|([^)"'\s][^)]*?))\s*\)|"([^"]+)"|'([^']+)')([^;]*);/gi;
    cssAssetUrlPattern =
      /url\(\s*(?:"(?!data:|blob:|#)([^"]+)"|'(?!data:|blob:|#)([^']+)'|(?!['"]|data:|blob:|#)([^)]+?))\s*\)/gi;
  };
}
