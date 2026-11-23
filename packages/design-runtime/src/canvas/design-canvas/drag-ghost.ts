import { buildDcDocument } from "../../editor/clipboard/html-placement";
import { mergeDesignSystemFileOverlay } from "../../design-system/file-overlay";
import { normalizeProjectBlobPaths } from "../../preview/blob-paths";
import { buildPreviewDocument, evaluationOnlyDocumentHtml as ghostSrcdoc } from "../../preview/build-document";
import { collectProjectDependencyFiles } from "../../preview/dependency-graph";
import { createLinkedFileScript, runtimeModuleBlobs, runtimeModuleUrls } from "../../preview/module-cache";
import { type ProjectFiles } from "../../preview/asset-rewriting";

const dragGhostFilename = "__drag-ghost.dc.html";

interface DragBox {
  w: number;
  h: number;
  ew: number;
  eh: number;
  ox: number;
  oy: number;
  gx: number;
  gy: number;
}

interface DragStart {
  key: string;
  file: string;
  tids: number[] | null;
  box: DragBox | null;
}

interface DragGhost {
  srcdoc: string;
  boot: { doc: string; parts: Record<string, Blob>; urls: Record<string, string> } | null;
}

interface DragPreviewState {
  ghost: DragGhost | null;
  [key: string]: unknown;
}

interface GhostArtboard {
  renderDefaults(): Promise<unknown>;
  serializeSelection(tids: number[] | null, options: {
    bakeProps: boolean;
    lift: DragBox;
    vals: unknown;
  }): string | null;
}

interface DragGhostDependencies {
  readonly assets: unknown;
  readonly doc: { content(): { files: ProjectFiles } };
  readonly artboardEntriesRef: { current: ReadonlyMap<string, GhostArtboard> };
  readonly setDragPreview: (update: (state: DragPreviewState | null) => DragPreviewState | null) => void;
  readonly dragGhostRef: { current: { key: string; ghost: DragGhost | null } | null };
}

/** Build the pointer-following preview from the selected elements at drag start. */
export function buildDragGhostPreview(deps: DragGhostDependencies, dragStart: DragStart): void {
  if (!dragStart.box || deps.dragGhostRef.current?.key === dragStart.key) return;
  deps.dragGhostRef.current = { key: dragStart.key, ghost: null };
  const entry = deps.artboardEntriesRef.current.get(dragStart.file);
  const box = dragStart.box;
  if (!entry) return;

  try {
    entry.renderDefaults().then((renderDefaults: unknown): void => {
      if (deps.dragGhostRef.current?.key !== dragStart.key) return;
      const ghostMarkup = entry.serializeSelection(dragStart.tids, {
        bakeProps: true,
        lift: box,
        vals: renderDefaults,
      });
      if (!ghostMarkup || ghostMarkup.length > 2e5) return;
      const files = deps.doc.content().files;
      const state = {
        ...mergeDesignSystemFileOverlay(files),
        [dragGhostFilename]: buildDcDocument(ghostMarkup, files[dragStart.file] ?? "", { logic: false }),
      };
      const projectFiles = normalizeProjectBlobPaths(collectProjectDependencyFiles(state, dragGhostFilename));
      const { doc: previewDoc, parts: previewParts } = buildPreviewDocument(
        projectFiles, dragGhostFilename, deps.assets, new Set(),
        { frameless: true, fileUrlFor: createLinkedFileScript },
      );
      const ghost = Object.keys(previewParts).length > 0
        ? { srcdoc: ghostSrcdoc, boot: { doc: previewDoc, parts: runtimeModuleBlobs(previewParts), urls: runtimeModuleUrls(previewParts) } }
        : { srcdoc: previewDoc, boot: null };
      deps.dragGhostRef.current.ghost = ghost;
      deps.setDragPreview((dragState: DragPreviewState | null): DragPreviewState | null => dragState && { ...dragState, ghost });
    }).catch((): void => {});
  } catch {}
}
