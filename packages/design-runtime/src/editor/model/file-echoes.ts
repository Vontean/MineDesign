/** Restored application module; prepare first, initialize in original order. */
import {
  type Dynamic,
} from "../../runtime-types";
import { getEditorEventRuntime } from "../events/runtime";

var ModelFileEchoesCache: Dynamic;
var ModelFileEchoesConstant: Dynamic;
var ModelFileEchoesRegistry: Dynamic;
var expectedChangesByProject: Dynamic;
var ModelFileEchoesResolvedValue: Dynamic;
var landedChangesByProject: Dynamic;
function normalizeSmartPunctuation(text?: Dynamic): Dynamic {
  return text
    .replace(/[\u2018\u2019\u201A\u201B\u2039\u203A]/g, "'")
    .replace(/[\u201C\u201D\u201E\u201F\u00AB\u00BB]/g, '"')
    .replace(/[\u2013\u2014]/g, "-")
    .replace(/\u2026/g, "...")
    .replace(/[\u00A0\u2000-\u200A\u202F\u205F\u3000]/g, " ")
    .replace(
      /[\u200B-\u200F\u2028\u2029\u202A-\u202E\u2066-\u2069\u00AD\uFEFF]/g,
      "",
    )
    .replace(/#/g, "");
}
function normalizeProjectFilePath(filePath?: Dynamic): Dynamic {
  let segments: Dynamic = [];
  for (let segment of filePath.split("/") as Dynamic)
    if (!(segment === "" || segment === ".")) {
      if (segment === "..") {
        segments.pop();
        continue;
      }
      segments.push(segment);
    }
  let fileName: Dynamic = segments.pop();
  return fileName === undefined
    ? ""
    : [...segments, normalizeSmartPunctuation(fileName)].join("/");
}
function expectLocalFileEcho(filePath?: Dynamic, count: Dynamic = 1): Dynamic {
  let now: Dynamic = Date.now(),
    entry: Dynamic = ModelFileEchoesCache.get(filePath),
    pendingCount: Dynamic = entry && entry.expires > now ? entry.n : 0;
  ModelFileEchoesCache.set(filePath, {
    n: pendingCount + count,
    expires: now + ModelFileEchoesConstant,
  });
}
function consumeLocalFileEcho(filePath?: Dynamic): Dynamic {
  let entry: Dynamic = ModelFileEchoesCache.get(filePath);
  entry && (entry.n--, entry.n <= 0 && ModelFileEchoesCache.delete(filePath));
}
function normalizeEchoPath(path?: Dynamic): Dynamic {
  return path
    .replace(/^(?:\.\/)+/, "")
    .replace(/\/(?:\.\/)+/g, "/")
    .replace(/\/{2,}/g, "/")
    .replace(/\/+$/, "");
}
function markExpectedFileChange(
  projectPath?: Dynamic,
  ...changedPaths: Dynamic[]
): Dynamic {
  let entry: Dynamic = expectedChangesByProject.get(projectPath);
  entry || ((entry = new Map()), expectedChangesByProject.set(projectPath, entry));
  let now: Dynamic = Date.now(),
    recordExpectedChange: Dynamic = (changedPath?: Dynamic): Dynamic =>
      entry.set(changedPath, {
        t: now,
        landed: entry.get(changedPath)?.landed ?? false,
      });
  changedPaths.length === 0 && recordExpectedChange("");
  for (let changedPath of changedPaths as Dynamic) changedPath && recordExpectedChange(changedPath);
}
function markLandedFileChange(
  projectPath?: Dynamic,
  ...landedPaths: Dynamic[]
): Dynamic {
  if (!landedPaths.some(Boolean)) return;
  let entry: Dynamic = landedChangesByProject.get(projectPath);
  entry || ((entry = new Map()), landedChangesByProject.set(projectPath, entry));
  let now: Dynamic = Date.now(),
    expectedEntries: Dynamic = expectedChangesByProject.get(projectPath);
  for (let landedPath of landedPaths as Dynamic) {
    if (!landedPath) continue;
    let expectedChange: Dynamic = expectedEntries?.get(landedPath);
    expectedChange && (expectedChange.landed = true);
    entry.set(normalizeEchoPath(landedPath), now);
  }
}
function markLocalFileChange(
  projectPath?: Dynamic,
  ...changedPaths: Dynamic[]
): Dynamic {
  markExpectedFileChange(projectPath, ...changedPaths);
  markLandedFileChange(projectPath, ...changedPaths);
  if (!changedPaths.some(Boolean)) {
    let emptyPathChange: Dynamic = expectedChangesByProject.get(projectPath)?.get("");
    emptyPathChange && (emptyPathChange.landed = true);
  }
}
export {
  consumeLocalFileEcho,
  expectLocalFileEcho,
  markExpectedFileChange,
  markLandedFileChange,
  markLocalFileChange,
  ModelFileEchoesCache,
  expectedChangesByProject,
  landedChangesByProject,
  ModelFileEchoesConstant,
  ModelFileEchoesRegistry,
  ModelFileEchoesResolvedValue,
  normalizeEchoPath,
  normalizeProjectFilePath,
  normalizeSmartPunctuation,
};
export function installEditorModelFileEchoes(): () => void {
  return () => {
    ModelFileEchoesCache = new Map();
    ModelFileEchoesConstant = 5e3;
    ModelFileEchoesRegistry = {};
    expectedChangesByProject = new Map();
    ModelFileEchoesResolvedValue = 10 * 6e4;
    landedChangesByProject = new Map();
    {
      let unsubscribe: Dynamic = getEditorEventRuntime().onOmEvent(
        "files-changed",
        (event?: Dynamic): Dynamic => {
          let payload: Dynamic = event,
            projectPath: Dynamic = payload?.projectPath;
          projectPath &&
            (payload?.source === "fanout" || payload?.source === "user-import") &&
            markLocalFileChange(projectPath);
        },
      );
      ModelFileEchoesRegistry.hot?.dispose(unsubscribe);
    }
  };
}
