import { reactChromeTheme as React } from "../../editor/chrome/theme";
import {
  canvasMetadataFile,
  getKvClient,
  projectFileKey,
  replaceDesignArtboards,
  serializeCanvasMetadata,
} from "../../platform/file-content";
import type { ArtboardBox } from "../frame-payloads";
import type { CanvasManifest } from "../manifest-history";

type FileSetUpdate = (previous: Set<string>) => Set<string>;

interface FramelessSizingOptions {
  manifest: CanvasManifest;
  manifestRef: { current: CanvasManifest };
  editing: boolean;
  selectedFile: string | null;
  activeFile: string | null;
  focusedFileRef: { current: string | null };
  activeFileRef: { current: string | null };
  canResize(): boolean;
  isGesturing(): boolean;
  applyLayout(manifest: CanvasManifest): CanvasManifest;
}

/** 根据预览实测内容调整无框画板的尺寸，并在编辑手势结束后继续。 */
export function useFramelessArtboardSizing(options: FramelessSizingOptions) {
  const { useState, useRef, useCallback, useEffect } = React;
  const [emptyFiles, setEmptyFiles]: [Set<string>, (update: FileSetUpdate) => void] = useState(new Set<string>());
  const timers: { current: Map<string, ReturnType<typeof setTimeout>> } = useRef(new Map());
  const deferredHulls: { current: Map<string, ArtboardBox> } = useRef(new Map());
  const recentResizes: { current: Map<string, number[]> } = useRef(new Map());
  const recentlyDropped: { current: Set<string> } = useRef(new Set());

  const markDropped = useCallback((file: string) => {
    recentlyDropped.current.add(file);
  }, []);

  const reportHull = useCallback((file: string, hull: ArtboardBox | null) => {
    setEmptyFiles((previous) => {
      const isEmpty = hull == null;
      if (previous.has(file) === isEmpty) return previous;
      const next = new Set(previous);
      if (isEmpty) next.add(file);
      else next.delete(file);
      return next;
    });

    const timer = timers.current.get(file);
    if (timer) clearTimeout(timer);
    if (hull == null) {
      timers.current.delete(file);
      deferredHulls.current.delete(file);
      return;
    }

    function applyHull(measured: ArtboardBox) {
      timers.current.delete(file);
      const manifest = options.manifestRef.current;
      const artboard = manifest.artboards.find((candidate) => candidate.file === file);
      if (!artboard?.frameless) return;
      const eligible = recentlyDropped.current.has(file) ||
        options.activeFileRef.current === file || options.focusedFileRef.current === file;
      if (!options.canResize() || !eligible) {
        deferredHulls.current.set(file, measured);
        return;
      }
      deferredHulls.current.delete(file);
      if (options.isGesturing()) {
        timers.current.set(file, setTimeout(applyHull, 300, measured));
        return;
      }
      if (Math.abs(Number(artboard.w) - measured.w) <= 1 && Math.abs(Number(artboard.h) - measured.h) <= 1) return;

      const now = Date.now();
      const resizeWindowMs = 5000;
      const withinWindow = (recentResizes.current.get(file) ?? []).filter((timestamp) => now - timestamp < resizeWindowMs);
      if (withinWindow.length >= 8) {
        timers.current.set(file, setTimeout(applyHull, resizeWindowMs - (now - withinWindow[0]!), measured));
        return;
      }
      recentResizes.current.set(file, [...withinWindow, now]);

      const next = options.applyLayout(replaceDesignArtboards(
        manifest,
        manifest.artboards.map((candidate) => candidate.file === file
          ? { ...candidate, w: measured.w, h: measured.h }
          : candidate),
      ));
      getKvClient()
        .set(projectFileKey(canvasMetadataFile), serializeCanvasMetadata(next), { auto: true })
        .catch(() => {});
    }

    timers.current.set(file, setTimeout(applyHull, 400, hull));
  }, []);

  const { manifest, editing, activeFile, selectedFile } = options;
  useEffect(() => {
    const liveFiles = new Set(manifest.artboards.map(({ file }) => file));
    for (const files of [recentlyDropped.current, deferredHulls.current, recentResizes.current]) {
      for (const file of files.keys()) {
        if (!liveFiles.has(file)) files.delete(file);
      }
    }
    setEmptyFiles((previous) => {
      const liveEmptyFiles = [...previous].filter((file) => liveFiles.has(file));
      return liveEmptyFiles.length === previous.size ? previous : new Set(liveEmptyFiles);
    });
  }, [manifest, selectedFile]);

  useEffect(() => () => {
    for (const timer of timers.current.values()) clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!editing) return;
    for (const [file, measured] of [...deferredHulls.current]) {
      if (recentlyDropped.current.has(file) || activeFile === file || selectedFile === file) reportHull(file, measured);
    }
  }, [editing, activeFile, selectedFile, reportHull]);

  return { emptyFiles, setEmptyFiles, markDropped, reportHull };
}
