import { reactChromeTheme as React } from "../../editor/chrome/theme";
import { emptyCanvasSelection } from "../../editor/selection/canvas-selection";
import type { Dynamic } from "../../runtime-types";
import type { CanvasArtboard, CanvasManifest } from "../manifest-history";

type Ref<T> = { current: T };
type ArtboardFile = string | null;
const recentDragMs = 5000;

interface ArtboardFocusOptions {
  selectedFile: ArtboardFile;
  activeFile: ArtboardFile;
  focusedFile: Ref<ArtboardFile>;
  activeFileRef: Ref<ArtboardFile>;
  manifest: Ref<CanvasManifest>;
  visiblePage: { artboards: CanvasArtboard[] };
  visiblePageRef: Ref<{ artboards: CanvasArtboard[] }>;
  playingFile: Ref<ArtboardFile>;
  stopPlaying(): void;
  stopPlaybackOnFocus(): boolean;
  enterPreview(): Promise<unknown> | undefined;
  setSelectedFile(file: ArtboardFile): void;
  setActiveFile(file: ArtboardFile | ((previous: ArtboardFile) => ArtboardFile)): void;
  afterFocusChange(file: ArtboardFile): void;
  dragTimes: Ref<Map<string, number>>;
  abandonSelectionGesture(): void;
  clearFramePick(): void;
  setSelection(selection: Dynamic): void;
}

/** 切换编辑画板时先完成旧会话，离开临时选中的画板后恢复先前的画板。 */
export function useCanvasArtboardFocus(options: ArtboardFocusOptions) {
  const { useRef, useCallback, useEffect, useLayoutEffect } = React;
  const previousFramedFile: Ref<ArtboardFile> = useRef(null);
  const focusEpoch: Ref<number> = useRef(0);
  const lastDrop: Ref<{ file: string; at: number } | null> = useRef(null);
  const { selectedFile, activeFile, visiblePage, abandonSelectionGesture, clearFramePick } = options;

  useLayoutEffect(() => {
    options.focusedFile.current = selectedFile;
    options.afterFocusChange(selectedFile);
  }, [selectedFile]);

  const focus = useCallback((file: ArtboardFile) => {
    if (file === options.playingFile.current || options.stopPlaybackOnFocus()) options.stopPlaying();
    options.setActiveFile((previous) => previous === file ? previous : null);
    if (file === selectedFile) return Promise.resolve(true);
    const epoch = focusEpoch.current;
    return (async () => {
      await options.enterPreview();
      if (focusEpoch.current !== epoch) return false;
      options.setSelectedFile(file);
      return true;
    })();
  }, [selectedFile]);
  const focusRef: Ref<(file: ArtboardFile) => Promise<boolean>> = useRef(focus);
  focusRef.current = focus;

  const invalidatePendingFocus = useCallback(() => { focusEpoch.current++; }, []);
  const recordDropTarget = useCallback((file: string) => {
    lastDrop.current = { file, at: Date.now() };
  }, []);
  const afterPreview = useCallback((run: () => void) => {
    void (async () => {
      try {
        await options.enterPreview();
      } catch {}
      run();
    })();
  }, []);
  useEffect(() => {
    if (selectedFile != null && options.manifest.current.artboards.some(({ file, frameless }) =>
      file === selectedFile && !frameless)) {
      previousFramedFile.current = selectedFile;
    }
  }, [selectedFile]);

  const leave = useCallback(() => {
    const active = options.activeFileRef.current;
    if (active == null) return;
    options.setActiveFile(null);
    const previous = previousFramedFile.current;
    if (previous == null || previous === active ||
      !options.visiblePageRef.current.artboards.some(({ file }) => file === previous)) return;
    const lastDrag = options.dragTimes.current.get(previous);
    const drop = lastDrop.current;
    if ((drop?.file === previous && Date.now() - drop.at < recentDragMs) ||
      (lastDrag != null && Date.now() - lastDrag < recentDragMs) ||
      previous === options.playingFile.current) {
      options.setSelectedFile(null);
    } else {
      focusRef.current(previous);
    }
  }, []);
  const leaveRef: Ref<() => void> = useRef(leave);
  leaveRef.current = leave;

  const clearSelection = useCallback(() => {
    abandonSelectionGesture();
    leave();
    clearFramePick();
    options.setSelection(emptyCanvasSelection);
  }, [abandonSelectionGesture, leave, clearFramePick]);

  useEffect(() => {
    if (activeFile != null && !visiblePage.artboards.some(({ file }) => file === activeFile)) {
      options.setActiveFile(null);
    }
  }, [activeFile, visiblePage]);

  return { focus, focusRef, afterPreview, invalidatePendingFocus, recordDropTarget, leaveRef, clearSelection };
}
