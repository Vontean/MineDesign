import { subscribeHtmlReferences } from "../../design-system/type-declarations";
import { reactChromeTheme as React } from "../../editor/chrome/theme";
import { OutlineGlyphsTest } from "../../editor/outline/glyphs";
import { isLoadingArtboardHtml } from "../../platform/design-document-adapter";
import { idleTaskScheduler } from "../../platform/idle-scheduler";
import type { Dynamic } from "../../runtime-types";
import { remoteFilesEventName } from "../frame-environment";

type LayerTree = Dynamic[] | null;
type LayerIndex = Record<string, LayerTree | undefined>;
type ExpandedLayers = Record<string, Set<number>>;
type FileSet = Set<string>;
type SetFileState = (update: (files: FileSet) => FileSet) => void;

interface LayerIndexOptions {
  files: { file: string }[];
  pageFiles: { file: string }[];
  selectedFile: string | null;
  doc: { content(): { files: Record<string, Dynamic> } };
  frames: { current: Map<string, { ensureOutline(): Promise<LayerTree> }> };
  manifest: { current: { artboards: { file: string; frameless?: boolean }[] } };
  pendingSelectionFiles: { current: FileSet };
  sessionHistory: { current: { keeper: { prune(): void } } | null };
  setEmptyPieces: SetFileState;
  historyDirty: boolean;
  modelRevision: number;
}

function layerEntriesEqual(previous: Dynamic[], next: Dynamic[]): boolean {
  return previous.length === next.length && previous.every((entry, index) => {
    const candidate = next[index];
    return entry.tid === candidate.tid &&
      entry.kind === candidate.kind &&
      entry.label === candidate.label &&
      entry.glyph === candidate.glyph &&
      entry.detail === candidate.detail &&
      entry.hidden === candidate.hidden &&
      entry.grayed === candidate.grayed &&
      entry.component?.ref === candidate.component?.ref &&
      entry.component?.kind === candidate.component?.kind &&
      entry.noHide === candidate.noHide &&
      entry.tag === candidate.tag &&
      layerEntriesEqual(entry.children, candidate.children);
  });
}

function withoutFiles<T>(record: Record<string, T>, files: readonly string[]) {
  if (!files.length) return record;
  const next = { ...record };
  for (const file of files) delete next[file];
  return next;
}

export function useCanvasLayerIndex({
  files, pageFiles, selectedFile, doc, frames, manifest, pendingSelectionFiles,
  sessionHistory, setEmptyPieces, historyDirty, modelRevision,
}: LayerIndexOptions) {
  const [openFiles, setOpenFiles] = React.useState(
    () => new Set(selectedFile ? [selectedFile] : []),
  );
  React.useEffect(() => {
    if (selectedFile != null) {
      setOpenFiles((open: FileSet) => open.has(selectedFile) ? open : new Set([...open, selectedFile]));
    }
  }, [selectedFile]);
  const [expandedLayers, setExpandedLayers] = React.useState({});
  const [trees, setTrees] = React.useState({});
  const treesRef: { current: LayerIndex } = React.useRef(trees);
  treesRef.current = trees;
  const sidebarScroll = React.useRef(0);
  const [cursor] = React.useState(() => ({ key: null, refocusAt: 0 }));
  const allFileKeys = files.map(({ file }) => file).join("\n");
  const pageFileKeys = pageFiles.map(({ file }) => file).join("\n");

  React.useEffect(() => {
    const existing = new Set(allFileKeys.split("\n"));
    setOpenFiles((open: FileSet) => {
      const kept = new Set([...open].filter((file) => existing.has(file)));
      return kept.size === open.size ? open : kept;
    });
    setTrees((index: LayerIndex) => withoutFiles(index, Object.keys(index).filter((file) => !existing.has(file))));
    setExpandedLayers((expanded: ExpandedLayers) =>
      withoutFiles(expanded, Object.keys(expanded).filter((file) => !existing.has(file))));
    sessionHistory.current?.keeper.prune();
  }, [allFileKeys]);

  const refresh = React.useCallback(function refreshOutline(file: string): void {
    const entry = frames.current.get(file);
    if (!entry) return;
    const source = doc.content().files[file] ?? "";
    entry.ensureOutline().then((items) => {
      if (!frames.current.has(file)) return;
      if ((doc.content().files[file] ?? "") !== source) return refreshOutline(file);
      if (items == null && isLoadingArtboardHtml(source)) return;
      if (items?.length === 0 && manifest.current.artboards.some((artboard) => artboard.file === file && artboard.frameless)) {
        setEmptyPieces((empty) => empty.has(file) ? empty : new Set([...empty, file]));
      }
      setTrees((index: LayerIndex) => {
        const next = items ?? (OutlineGlyphsTest(source) ? null : []);
        const previous = index[file];
        const unchanged = previous === undefined ? false
          : previous === null || next === null ? previous === next
          : layerEntriesEqual(previous, next);
        return unchanged ? index : { ...index, [file]: next };
      });
    });
  }, [doc]);
  const scheduler = React.useMemo(() => new idleTaskScheduler(refresh), [refresh]);
  React.useEffect(() => () => scheduler.dispose(), [scheduler]);
  React.useEffect(() => {
    const page = pageFileKeys ? pageFileKeys.split("\n") : [];
    scheduler.retain((file: string) => page.includes(file));
    scheduler.add(page);
  }, [pageFileKeys, scheduler]);
  React.useEffect(() => {
    if (pageFileKeys) {
      scheduler.add(pageFileKeys.split("\n").filter((file) => treesRef.current[file] === undefined));
    }
  }, [pageFileKeys, historyDirty, scheduler]);
  React.useEffect(() => subscribeHtmlReferences((changed: string[]) => {
    scheduler.add(changed.filter((file) => frames.current.has(file)));
  }), [scheduler]);
  React.useEffect(() => {
    function refreshExternalFiles(event: Event) {
      const changed: string[] = (event as CustomEvent<{ paths?: string[] }>).detail?.paths ?? [];
      const removed = changed.filter((file) => !frames.current.has(file) && treesRef.current[file] !== undefined);
      if (removed.length) setTrees((index: LayerIndex) => withoutFiles(index, removed));
      scheduler.add(changed.filter((file) => frames.current.has(file)));
    }
    window.addEventListener(remoteFilesEventName, refreshExternalFiles);
    return () => window.removeEventListener(remoteFilesEventName, refreshExternalFiles);
  }, [scheduler]);
  const previousSelection = React.useRef(undefined);
  React.useEffect(() => {
    const previous = previousSelection.current;
    previousSelection.current = selectedFile;
    if (previous === undefined) {
      if (selectedFile != null) scheduler.add([selectedFile], { front: true });
    } else if (previous !== null && previous !== selectedFile) {
      refresh(previous);
    }
  }, [selectedFile, scheduler, refresh]);
  React.useEffect(() => {
    const pending = [...pendingSelectionFiles.current];
    pendingSelectionFiles.current.clear();
    for (const file of pending) refresh(file);
  }, [modelRevision, refresh]);

  return { openFiles, setOpenFiles, expandedLayers, setExpandedLayers, trees, treesRef, sidebarScroll, cursor };
}
