/** 项目文件里的相对路径：解析成项目内路径，并把图片引用内联成 data URI。 */

/** 项目文件表：路径 → 文本内容；图片素材的内容是 base64。 */
export type ProjectFiles = Record<string, string>;

/** 图片素材的路径（含 svg）。 */
export const imagePathPattern = /\.(png|jpe?g|gif|webp|avif|bmp|svg)$/i;
/** 脚本源文件的路径。 */
export const scriptPathPattern = /\.(m?js|jsx|tsx)$/i;

const imageMimeTypes: Record<string, string> = {
  png: "image/png",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  gif: "image/gif",
  webp: "image/webp",
  avif: "image/avif",
  bmp: "image/bmp",
  svg: "image/svg+xml",
};

/** 最近一次改写的输入与结果；输入的三项都与上次是同一个值时直接复用。 */
let lastRewrite: {
  source: string;
  files: ProjectFiles;
  fromDir: string;
  out: string;
} | null = null;

/** 文件所在目录，保留末尾的斜杠；根目录下的文件为空串。 */
export function projectDirectoryOf(path: string): string {
  return path.slice(0, path.lastIndexOf("/") + 1);
}

/**
 * 把 reference 按 baseDir 解析成项目内的文件路径。
 * 外部地址、空路径和以 `.`、`..` 结尾的路径返回 null。
 */
export function resolveProjectAssetPath(
  baseDir: string,
  reference: string,
): string | null {
  let path = reference.split("#")[0].split("?")[0].trim();
  if (
    /(^|\/)\.{0,2}$/.test(path) ||
    /^[a-z][a-z0-9+.-]*:/i.test(path) ||
    path.startsWith("//")
  )
    return null;
  path.startsWith("/appifact/")
    ? ((path = path.slice(10)), (baseDir = ""))
    : path.startsWith("/") && (baseDir = "");
  try {
    path = decodeURIComponent(path);
  } catch {}
  const segments: string[] = [];
  for (const segment of (baseDir + path).split("/"))
    segment === "" ||
      segment === "." ||
      (segment === ".." ? segments.pop() : segments.push(segment));
  return segments.length > 0 ? segments.join("/") : null;
}

/** 从 fromDir 指向 target 的相对路径（fromDir 是目录路径）。 */
export function relativeProjectPath(fromDir: string, target: string): string {
  const fromSegments = fromDir.split("/").filter(Boolean);
  const targetSegments = target.split("/");
  let common = 0;
  while (
    common < fromSegments.length &&
    common < targetSegments.length - 1 &&
    fromSegments[common] === targetSegments[common]
  )
    common++;
  return (
    "../".repeat(fromSegments.length - common) +
    targetSegments.slice(common).join("/")
  );
}

/**
 * 把 source 里引用到的图片素材换成 data URI（src、poster、href、url() 与 srcset）。
 * fromDir 是 source 所在目录，用来识别相对写法。
 */
export function rewriteProjectAssets(
  source: string,
  files: ProjectFiles,
  fromDir: string = "",
): string {
  if (
    lastRewrite?.files === files &&
    lastRewrite.source === source &&
    lastRewrite.fromDir === fromDir
  )
    return lastRewrite.out;
  let out = source;
  const entries = Object.entries(files);
  // 与 source 同目录的文件优先
  fromDir !== "" &&
    entries.sort(
      ([pathA], [pathB]): number =>
        Number(pathB.startsWith(fromDir)) - Number(pathA.startsWith(fromDir)),
    );
  for (const [path, base64] of entries) {
    if (!imagePathPattern.test(path)) continue;
    const relativePath =
      fromDir === "" ? path : relativeProjectPath(fromDir, path);
    const encodedPath = encodeURI(path);
    if (
      !out.includes(path) &&
      !out.includes(relativePath) &&
      (encodedPath === path ||
        (!out.includes(encodedPath) && !out.includes(encodeURI(relativePath))))
    )
      continue;
    const extension = path.slice(path.lastIndexOf(".") + 1).toLowerCase();
    const dataUri =
      "data:" +
      (imageMimeTypes[extension] ?? "application/octet-stream") +
      ";base64," +
      base64;
    const spellings = new Set([path, "./" + path, "/" + path, relativePath]);
    relativePath.startsWith("../") || spellings.add("./" + relativePath);
    if (encodedPath !== path)
      for (const spelling of [...spellings]) spellings.add(encodeURI(spelling));
    for (const spelling of spellings) {
      for (const attribute of ["src=", "poster=", "href="]) {
        for (const quote of ['"', "'"])
          out = out
            .split(attribute + quote + spelling + quote)
            .join(attribute + quote + dataUri + quote);
        for (const terminator of [" ", ">", "\n", "\t", "\r", "\f"])
          out = out
            .split(attribute + spelling + terminator)
            .join(attribute + dataUri + terminator);
      }
      for (const quote of ['"', "'", ""])
        out = out
          .split("url(" + quote + spelling + quote + ")")
          .join("url(" + quote + dataUri + quote + ")");
    }
  }
  /srcset\s*=/i.test(out) &&
    (out = out.replace(
      /(\b(?:data-)?srcset\s*=\s*)("([^"]*)"|'([^']*)')/gi,
      (
        _match: string,
        prefix: string,
        quoted: string,
        doubleQuoted?: string,
        singleQuoted?: string,
      ): string => {
        const list = doubleQuoted ?? singleQuoted ?? "";
        const quote = quoted[0];
        const candidates = list.split(",").map((candidate): string => {
          const trimmed = candidate.trim();
          if (trimmed === "") return candidate;
          const urlEnd = trimmed.search(/\s/);
          const url = urlEnd < 0 ? trimmed : trimmed.slice(0, urlEnd);
          const descriptor = urlEnd < 0 ? "" : trimmed.slice(urlEnd);
          const resolved = resolveProjectAssetPath(fromDir, url);
          if (
            resolved === null ||
            files[resolved] == null ||
            !imagePathPattern.test(resolved)
          )
            return candidate;
          const extension = resolved
            .slice(resolved.lastIndexOf(".") + 1)
            .toLowerCase();
          return (
            " data:" +
            (imageMimeTypes[extension] ?? "application/octet-stream") +
            ";base64," +
            files[resolved] +
            descriptor
          );
        });
        return prefix + quote + candidates.join(",").trim() + quote;
      },
    ));
  lastRewrite = {
    source,
    files,
    fromDir,
    out,
  };
  return out;
}
