/** Restored application module; prepare first, initialize in original order. */
import {
  type Dynamic,
} from "../../runtime-types";
import { propertyScrubberSource } from "../../dependencies";
import { ComponentsDeclarationResolverDelayMs, ComponentsDeclarationResolverElementCache, ComponentsDeclarationResolverNameTypeValueValues, componentTypeCandidates, inferPropsFromDeclarations, typeExpressionTooDeep } from "./declaration-resolver";

var ComponentsTypeInferenceWorkerObservedElements: Dynamic;
var ComponentsTypeInferenceWorkerCurrentState: Dynamic;
var ComponentsTypeInferenceWorkerCreateObjectURLValue: Dynamic;
var ComponentsTypeInferenceWorkerConstant: Dynamic;
var ComponentsTypeInferenceWorkerCache: Dynamic;
var ComponentsTypeInferenceWorkerElementCache: Dynamic;
function componentDeclarationFiles(
  componentName?: Dynamic,
  declarationFiles?: Dynamic,
): Dynamic {
  let prefix: Dynamic = componentName.split(".")[0].toLowerCase(),
    cacheByFiles: Dynamic =
      ComponentsDeclarationResolverElementCache.get(declarationFiles);
  cacheByFiles === undefined &&
    ComponentsDeclarationResolverElementCache.set(
      declarationFiles,
      (cacheByFiles = new Map()),
    );
  let cachedTexts: Dynamic = cacheByFiles.get(prefix);
  if (cachedTexts !== undefined) return cachedTexts;
  let designSystemPrefix: Dynamic =
      "ds/" +
      prefix
        .replace(/[^a-z0-9_-]+/g, "-")
        .replace(/^[-_]+/, "")
        .slice(0, 64)
        .replace(/-+$/, "") +
      "/",
    pathRelevance: Dynamic = (filePath?: Dynamic): Dynamic => {
      let lowerPath: Dynamic = filePath.toLowerCase();
      return Number(
        lowerPath.startsWith("ds/")
          ? lowerPath.startsWith(designSystemPrefix)
          : lowerPath.startsWith(prefix),
      );
    },
    sortedTexts: Dynamic = Object.entries(declarationFiles)
      .filter(
        ([, text]: Dynamic): Dynamic =>
          !typeExpressionTooDeep(text),
      )
      .sort(
        ([pathA]: Dynamic, [pathB]: Dynamic): Dynamic =>
          pathRelevance(pathB) - pathRelevance(pathA) ||
          (pathA < pathB ? -1 : pathA > pathB ? 1 : 0),
      )
      .map(([, text]: Dynamic): Dynamic => text);
  cacheByFiles.set(prefix, sortedTexts);
  return sortedTexts;
}
function supportsTypeInferenceWorker(): Dynamic {
  return typeof Worker !== "undefined" && typeof Blob !== "undefined";
}
function getTypeInferenceWorker(): Dynamic {
  if (ComponentsTypeInferenceWorkerCurrentState !== null)
    return ComponentsTypeInferenceWorkerCurrentState;
  ComponentsTypeInferenceWorkerCreateObjectURLValue ??= URL.createObjectURL(
    new Blob([propertyScrubberSource], {
      type: "text/javascript",
    }),
  );
  let worker: Dynamic = new Worker(
    ComponentsTypeInferenceWorkerCreateObjectURLValue,
  );
  worker.onmessage = (message?: Dynamic): Dynamic => {
    let entry: Dynamic = ComponentsTypeInferenceWorkerCache.get(
      message.data.id,
    );
    entry !== undefined &&
      (ComponentsTypeInferenceWorkerCache.delete(message.data.id),
      clearTimeout(entry.timer),
      entry.resolve(Array.isArray(message.data.specs) ? message.data.specs : []));
  };
  worker.onerror = (): Dynamic => {
    console.warn(
      "design (props panel): the type-declaration reader could not run here \u2014 showing values only",
    );
    ComponentsTypeInferenceWorkerCurrentState === worker &&
      terminateTypeInferenceWorker();
  };
  return (ComponentsTypeInferenceWorkerCurrentState = worker);
}
function terminateTypeInferenceWorker(): Dynamic {
  ComponentsTypeInferenceWorkerCurrentState?.terminate();
  ComponentsTypeInferenceWorkerCurrentState = null;
  for (let pendingRequest of ComponentsTypeInferenceWorkerCache.values() as Dynamic) {
    clearTimeout(pendingRequest.timer);
    pendingRequest.resolve([]);
  }
  ComponentsTypeInferenceWorkerCache.clear();
}
function inferPropsInWorker(candidateNames?: Dynamic, declarationTexts?: Dynamic): Dynamic {
  return ComponentsTypeInferenceWorkerObservedElements.has(declarationTexts)
    ? Promise.resolve([])
    : new Promise((resolve?: Dynamic): Dynamic => {
        let requestId: Dynamic = ComponentsTypeInferenceWorkerConstant++,
          timeoutTimer: Dynamic = setTimeout((): Dynamic => {
            ComponentsTypeInferenceWorkerCache.has(requestId) &&
              (ComponentsTypeInferenceWorkerObservedElements.add(declarationTexts),
              console.warn(
                "design (props panel): reading the design system's type declarations took over " +
                  String(ComponentsDeclarationResolverDelayMs) +
                  " ms \u2014 showing values only",
              ),
              terminateTypeInferenceWorker());
          }, ComponentsDeclarationResolverDelayMs);
        ComponentsTypeInferenceWorkerCache.set(requestId, {
          resolve: resolve,
          timer: timeoutTimer,
          texts: declarationTexts,
        });
        try {
          getTypeInferenceWorker().postMessage({
            id: requestId,
            names: candidateNames,
            texts: declarationTexts,
            keep: ComponentsDeclarationResolverNameTypeValueValues,
          });
        } catch {
          console.warn(
            "design (props panel): the type-declaration reader could not start here \u2014 showing values only",
          );
          terminateTypeInferenceWorker();
        }
      });
}
function cachedInferredComponentProps(
  componentName?: Dynamic,
  declarationTexts?: Dynamic,
): Dynamic {
  return ComponentsTypeInferenceWorkerElementCache.get(declarationTexts)?.get(componentName);
}
async function inferInstalledComponentProps(
  componentName?: Dynamic,
  declarationFiles?: Dynamic,
): Promise<Dynamic> {
  let cachedProps: Dynamic = cachedInferredComponentProps(componentName, declarationFiles);
  if (cachedProps !== undefined) return cachedProps;
  let declarationTexts: Dynamic = componentDeclarationFiles(componentName, declarationFiles),
    items: Dynamic = [];
  if (declarationTexts.length > 0) {
    let candidateNames: Dynamic = componentTypeCandidates(componentName);
    items = supportsTypeInferenceWorker()
      ? await inferPropsInWorker(candidateNames, declarationTexts)
      : inferPropsFromDeclarations(
          candidateNames,
          declarationTexts,
          ComponentsDeclarationResolverNameTypeValueValues,
        );
  }
  let entry: Dynamic = ComponentsTypeInferenceWorkerElementCache.get(declarationFiles);
  entry === undefined &&
    ComponentsTypeInferenceWorkerElementCache.set(
      declarationFiles,
      (entry = new Map()),
    );
  entry.set(componentName, items);
  return items;
}
export {
  cachedInferredComponentProps,
  componentDeclarationFiles,
  ComponentsTypeInferenceWorkerCache,
  ComponentsTypeInferenceWorkerConstant,
  ComponentsTypeInferenceWorkerCreateObjectURLValue,
  ComponentsTypeInferenceWorkerCurrentState,
  ComponentsTypeInferenceWorkerElementCache,
  ComponentsTypeInferenceWorkerObservedElements,
  getTypeInferenceWorker,
  inferInstalledComponentProps,
  inferPropsInWorker,
  supportsTypeInferenceWorker,
  terminateTypeInferenceWorker,
};
export function installEditorComponentsTypeInferenceWorker(): () => void {
  return () => {
    ComponentsTypeInferenceWorkerObservedElements = new WeakSet();
    ComponentsTypeInferenceWorkerCurrentState = null;
    ComponentsTypeInferenceWorkerCreateObjectURLValue = null;
    ComponentsTypeInferenceWorkerConstant = 1;
    ComponentsTypeInferenceWorkerCache = new Map();
    ComponentsTypeInferenceWorkerElementCache = new WeakMap();
  };
}
