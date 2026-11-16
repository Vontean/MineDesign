/** 预览用的模块 Blob 与对象 URL 缓存：同一份文件内容只生成一次 Blob / URL。 */
import { supportsBlobScripts } from "./runtime-loading";

/** 项目文件表：路径 → 文本内容。 */
export type ModuleSources = Record<string, string>;

interface ModuleCacheEntry {
  text: string;
  blob: Blob;
  /** 脚本模块的对象 URL，第一次需要时才生成。 */
  url?: string;
}

/** 模块缓存最多保留的字符数；超过后淘汰不在当前文件表里的旧条目。 */
const moduleCacheLimitChars = 96 * 1024 * 1024;
/** 条目被替换后，旧对象 URL 延迟多久再释放（预览可能还在使用）。 */
const objectUrlRevokeDelayMs = 6e4;
/** 脚本模块的文件键，第 1 组是路径。 */
const moduleFilePattern = /^file:(.*\.m?js)$/i;
/** 链接脚本缓存最多保留的字符数。 */
const linkedScriptLimitChars = 32 * 1024 * 1024;
/** 短于这个长度的文件直接内联，不生成链接脚本。 */
const linkedScriptMinChars = 4 * 1024;

/** 模块缓存，按最近使用排序（最旧的在前）。 */
const moduleCache = new Map<string, ModuleCacheEntry>();
let moduleCacheChars = 0;
/** 链接脚本缓存：路径 + 内容 → 对象 URL，按最近使用排序。 */
const linkedScriptCache = new Map<string, string>();
let linkedScriptChars = 0;

/** 延迟释放条目的对象 URL。 */
export function revokeRuntimeModuleUrl(entry: { url?: string }): void {
  const url = entry.url;
  url !== undefined &&
    setTimeout((): void => URL.revokeObjectURL(url), objectUrlRevokeDelayMs);
}

/** 把文件表同步进缓存：内容变化的重新生成 Blob，超出预算时淘汰表外的旧条目。 */
export function populateRuntimeModuleCache(sources: ModuleSources): void {
  for (const [key, text] of Object.entries(sources)) {
    let entry = moduleCache.get(key);
    (entry === undefined || entry.text !== text) &&
      (entry !== undefined &&
        ((moduleCacheChars -= entry.text.length),
        revokeRuntimeModuleUrl(entry)),
      (entry = {
        text,
        blob: new Blob([text], {
          type: moduleFilePattern.test(key) ? "text/javascript" : "text/plain",
        }),
      }),
      (moduleCacheChars += text.length));
    moduleCache.delete(key);
    moduleCache.set(key, entry);
  }
  for (const [key, entry] of moduleCache) {
    if (moduleCacheChars <= moduleCacheLimitChars) break;
    key in sources ||
      (moduleCache.delete(key), (moduleCacheChars -= entry.text.length));
  }
}

/** 文件表里每个文件的 Blob。 */
export function runtimeModuleBlobs(sources: ModuleSources): Record<string, Blob> {
  populateRuntimeModuleCache(sources);
  const blobs: Record<string, Blob> = {};
  for (const key of Object.keys(sources))
    blobs[key] = moduleCache.get(key)!.blob;
  return blobs;
}

/** 脚本模块（js / mjs）的对象 URL，以路径为键；浏览器不支持 Blob 脚本时为空对象。 */
export function runtimeModuleUrls(
  sources: ModuleSources,
  blobScriptsSupported: boolean = supportsBlobScripts(),
): Record<string, string> {
  const urls: Record<string, string> = {};
  if (!blobScriptsSupported) return urls;
  populateRuntimeModuleCache(sources);
  for (const key of Object.keys(sources)) {
    const match = moduleFilePattern.exec(key);
    if (match === null) continue;
    const entry = moduleCache.get(key)!;
    entry.url ??= URL.createObjectURL(
      new Blob(
        [
          entry.blob,
          `
//# sourceURL=/appifact/` + encodeURI(match[1]),
        ],
        {
          type: "text/javascript",
        },
      ),
    );
    urls[match[1]] = entry.url;
  }
  return urls;
}

/**
 * 为较大的文件生成「写入 window.__dcFiles」的脚本 URL，
 * 避免把大文本内联进 HTML；文件太小或不支持 Blob 脚本时返回 undefined。
 */
export function createLinkedFileScript(
  path: string,
  content: string,
  blobScriptsSupported: boolean = supportsBlobScripts(),
): string | undefined {
  if (!blobScriptsSupported || content.length < linkedScriptMinChars) return;
  const key = path + "\0" + content;
  let url = linkedScriptCache.get(key);
  url === undefined
    ? ((url = URL.createObjectURL(
        new Blob(
          [
            "(window.__dcFiles=window.__dcFiles||{})[",
            JSON.stringify(path),
            "]=",
            JSON.stringify(content),
            ";",
          ],
          {
            type: "text/javascript;charset=utf-8",
          },
        ),
      )),
      (linkedScriptChars += key.length))
    : linkedScriptCache.delete(key);
  linkedScriptCache.set(key, url);
  for (const oldestKey of linkedScriptCache.keys()) {
    if (linkedScriptChars <= linkedScriptLimitChars || oldestKey === key) break;
    linkedScriptCache.delete(oldestKey);
    linkedScriptChars -= oldestKey.length;
  }
  return url;
}
