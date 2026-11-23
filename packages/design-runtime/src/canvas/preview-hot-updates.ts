import type { Dynamic } from "../runtime-types";
import { npm_useEventListener_bc } from "../dependencies";
import { mergeDesignSystemFileOverlay } from "../design-system/file-overlay";
import { notifyUndoGesture } from "../editor/history-ownership";
import { PickerBridgeLabel } from "../editor/picker/bridge";
import { addressedArtboardFailure } from "../preview/addressed-artboards";
import { projectDirectoryOf, rewriteProjectAssets } from "../preview/asset-rewriting";
import { normalizeBlobAssetPaths, normalizeProjectBlobPaths } from "../preview/blob-paths";
import { componentRuntimeDependencies } from "../preview/build-document";
import { resolveComponentFile, updateComponentRuntimeScript, type ComponentSource } from "../preview/dependency-graph";
import { rewritePreviewAssets } from "../preview/dependency-injection";
import { createPreviewHandle } from "../preview/evaluation";
import { selectPageFiles } from "./compilation-cache";
import { reactCanvasShape } from "./shape";

interface PreviewUpdateDetail extends ComponentSource {
  content: string;
}

declare global {
  interface WindowEventMap {
    "dc-update": CustomEvent<PreviewUpdateDetail>;
  }
}

interface PreviewHotUpdateOptions {
  file: string;
  iframe: { current: HTMLIFrameElement | null };
  files(): Record<string, Dynamic>;
  projectRoot(): string | undefined;
  loadedComponents: { current: Set<string> };
  loadingComponents: { current: Set<string> };
  coveredStylesheets: { current: Set<string> };
  onStylesheetsSettled(): void;
}

/** Apply edits to the current preview and track dependencies as its runtime loads them. */
export function usePreviewHotUpdates(options: PreviewHotUpdateOptions) {
  const reloadTimer = (0, reactCanvasShape.useRef)(null) as { current: ReturnType<typeof setTimeout> | null };

  function cancelReload() {
    if (reloadTimer.current !== null) clearTimeout(reloadTimer.current);
  }
  (0, reactCanvasShape.useEffect)(() => cancelReload, []);

  npm_useEventListener_bc("dc-update", (event) => {
    const { detail } = event;
    const { file, iframe, loadedComponents, loadingComponents, coveredStylesheets } = options;
    if (!createPreviewHandle(iframe.current)) return;

    const mergedFiles = mergeDesignSystemFileOverlay(options.files());
    const resolvedFile = resolveComponentFile(mergedFiles, { ...detail, kind: "html" });
    if (
      resolvedFile !== undefined &&
      resolvedFile !== file &&
      !loadedComponents.current.has(resolvedFile) &&
      !loadingComponents.current.has(resolvedFile)
    ) return;

    const updatedFile = resolvedFile ?? file;
    const projectRoot = options.projectRoot();
    let includesAddressedFiles = false;
    if (projectRoot !== undefined && detail.kind === "html") {
      const failure = addressedArtboardFailure({ ...mergedFiles, [updatedFile]: detail.content }, file, projectRoot);
      includesAddressedFiles = failure === undefined;
      if (failure !== undefined) {
        notifyUndoGesture("board-address", {
          file,
          how: "a push prepared by copying files in",
          why: failure,
        });
      }
    }
    const previewFiles = includesAddressedFiles ? selectPageFiles(mergedFiles) : mergedFiles;
    const inlined = resolvedFile === file && detail.kind === "html" ? new Set<string>() : undefined;
    const rewritten = detail.kind === "html"
      ? rewritePreviewAssets(
        detail.content,
        previewFiles,
        updatedFile,
        inlined ? { inlined } : { covered: coveredStylesheets.current },
      )
      : rewriteProjectAssets(detail.content, previewFiles, projectDirectoryOf(updatedFile));
    if (inlined) coveredStylesheets.current = inlined;

    const loaded = loadedComponents.current;
    const dependencies = componentRuntimeDependencies(previewFiles, file, loaded, detail, coveredStylesheets.current);
    const paths = Object.keys(dependencies);
    const content = normalizeBlobAssetPaths(rewritten);
    const stagedFiles = normalizeProjectBlobPaths(dependencies);
    const preview = createPreviewHandle(iframe.current);
    if (!preview) return;

    const stageDependencies = paths.length > 0
      ? `window.__dcFiles=Object.assign(window.__dcFiles||{},${JSON.stringify(stagedFiles)});`
      : "";
    const runtimeUpdate = updateComponentRuntimeScript(file, detail, content);
    const pickerBridge = detail.kind === "html" ? PickerBridgeLabel : "";
    const updateScript = stageDependencies + runtimeUpdate + pickerBridge;
    if (inlined && !detail.streaming) {
      cancelReload();
      reloadTimer.current = setTimeout(options.onStylesheetsSettled, 400);
    }
    if (paths.length === 0) {
      preview.executeJavaScriptUnchecked(updateScript);
      return;
    }

    for (const path of paths) loadingComponents.current.add(path);
    preview.executeJavaScript(updateScript + ";void 0").then(() => {
      for (const path of paths) {
        loaded.add(path);
        loadingComponents.current.delete(path);
      }
    }, () => {});
  });
}
