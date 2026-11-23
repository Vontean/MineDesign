import { backgroundEditAnnouncement, propertyEditAnnouncement, stackingAnnouncement } from "../../editor/accessibility/announcements";
import { announce } from "../../editor/accessibility/announcer";
import { reactChromeTheme as React } from "../../editor/chrome/theme";
import { getArtboardPaperSize, isFlowExport } from "../../export/paper-and-scale";
import type { FlowExportOptions, PrintableArtboard } from "../../export/paper-and-scale";
import type { Dynamic } from "../../runtime-types";
import type { BackgroundEdit } from "../artboard-style-commands";
import { artboardOrderHistoryStep, updateArtboardGuides } from "../manifest-history";
import type { CanvasArtboard, CanvasManifest } from "../manifest-history";
import { structurallyEqual } from "../../platform/document-values";
import { artboardRadiusCss, normalizeArtboardRadius, PlatformFileContentSlice, reorderArtboardsOnPages, updateArtboardRadius } from "../../platform/file-content";
import { resizeArtboardFromInput } from "./artboards";

type Ref<T> = { current: T };
type ArtboardManifest = { artboards: (CanvasArtboard & PrintableArtboard)[] };
type PageFill = { background: string; backgroundColor: string; vars: Record<string, string> };
type InspectedFill = (PageFill & { file: string }) | null;
type FillUpdate = InspectedFill | ((previous: InspectedFill) => InspectedFill);

interface ArtboardFillOptions {
  frames: Ref<Map<string, {
    pageFill(): Promise<PageFill | null>;
    setPageFill(edits: BackgroundEdit[]): Promise<boolean>;
  }>>;
  activeEditorFile: Ref<string | null>;
  selectionRevision: number;
  modelRevision: number;
  historyRevision: number;
}

function useArtboardFill(file: string | null, options: ArtboardFillOptions) {
  const { useState, useRef, useCallback, useEffect } = React;
  const inspectedFile: Ref<string | null> = useRef(file);
  inspectedFile.current = file;
  const pending: Ref<{
    timer: ReturnType<typeof setTimeout> | null;
    edit: { file: string; changes: BackgroundEdit[] } | null;
  }> = useRef({ timer: null, edit: null });
  const [fill, setFill]: [InspectedFill, (next: FillUpdate) => void] = useState(null);
  const generation: Ref<number> = useRef(0);
  const activeWrites: Ref<number> = useRef(0);
  const { frames, activeEditorFile, selectionRevision, modelRevision, historyRevision } = options;

  const refresh = useCallback((target: string | null) => {
    const frame = target == null ? undefined : frames.current.get(target);
    if (target == null || !frame) {
      setFill(null);
      return;
    }
    if (activeWrites.current > 0 || pending.current.edit?.file === target) return;
    const before = generation.current;
    frame.pageFill().then((result) => {
      if (inspectedFile.current === target && generation.current === before) {
        setFill(result ? { file: target, ...result } : null);
      }
    }, () => {});
  }, []);
  useEffect(() => {
    refresh(file);
  }, [file, selectionRevision, modelRevision, historyRevision, refresh]);

  const update = useCallback((target: string, changes: BackgroundEdit[]) => {
    generation.current++;
    setFill((previous) => {
      const current = previous?.file === target ? previous : null;
      const next = {
        file: target,
        background: current ? current.background : "",
        backgroundColor: current ? current.backgroundColor : "",
        vars: current ? current.vars : {},
      };
      for (const { prop, value } of changes) {
        if (prop === "background") next.background = value ?? "";
        if (prop === "background-color") next.backgroundColor = value ?? "";
      }
      return next;
    });

    function write(file: string, edits: BackgroundEdit[]) {
      activeWrites.current++;
      function finish() {
        activeWrites.current--;
        if (activeWrites.current === 0 && pending.current.edit == null) refresh(inspectedFile.current);
      }
      (frames.current.get(file)?.setPageFill(edits) ?? Promise.resolve(false)).then((applied) => {
        if (applied) announce(backgroundEditAnnouncement(edits));
        finish();
      }, finish);
    }
    if (target === activeEditorFile.current) {
      write(target, changes);
      return;
    }

    const queue = pending.current;
    queue.edit = { file: target, changes };
    if (queue.timer != null) return;
    function flush() {
      queue.timer = null;
      const edit = queue.edit;
      queue.edit = null;
      if (!edit) return;
      write(edit.file, edit.changes);
      queue.timer = setTimeout(flush, 150);
    }
    flush();
  }, [refresh]);

  return { fill, update };
}

interface ArtboardSettingsOptions extends ArtboardFillOptions {
  selection: { artboards: Set<string>; annotations: Set<string> };
  manifest: ArtboardManifest;
  currentManifest: Ref<ArtboardManifest>;
  exportRules: FlowExportOptions;
  setPrint(file: string, mode: Dynamic): void;
  setPaper(file: string, paper: Dynamic): void;
  setSize(file: string, size: Dynamic, recordHistory?: Dynamic): void;
  setRadius(file: string, radius: Dynamic, preview?: boolean): void;
  setGuides(file: string, guides: Dynamic, preview: boolean): void;
  canFit(file: string): boolean;
  fitHeight(files: string[]): void;
}

/** 一张画板被选中时，合成属性面板需要的值和对应的更新入口。 */
export function useCanvasArtboardSettings(options: ArtboardSettingsOptions) {
  const { selection, manifest, exportRules, currentManifest, setPrint, setPaper, setSize, setRadius, setGuides, canFit, fitHeight } = options;
  const { artboards, annotations } = selection;
  const selected = React.useMemo(() => {
    if (artboards.size !== 1 || annotations.size > 0) return null;
    const file = [...artboards][0];
    return manifest.artboards.find((candidate) => candidate.file === file) ?? null;
  }, [artboards, annotations, manifest]);
  const { fill, update } = useArtboardFill(selected?.file ?? null, options);

  return React.useMemo(() => {
    if (!selected) return null;
    const { file, w, h, print, expand, guides, radius, frameless, title, paper } = selected;
    return {
      file, w, h,
      print: print === "flow" ? "flow" : "fixed",
      ...(isFlowExport({ expand }, exportRules) ? { fillPaginates: true } : {}),
      paper: getArtboardPaperSize(selected),
      paperSet: paper,
      guides: guides ?? [],
      radius,
      ...(frameless ? { frameless: true, label: title } : {}),
      fill: fill?.file === file ? fill : null,
      onSetPrint: (mode: Dynamic) => setPrint(file, mode),
      onSetPaper: (paper: Dynamic) => setPaper(file, paper),
      onSetSize: (size: Dynamic, recordHistory?: Dynamic) => setSize(file, size, recordHistory),
      ...(canFit(file) ? { onFitHeight: () => { fitHeight([file]); } } : {}),
      onSetFill: (edits: BackgroundEdit[]) => update(file, edits),
      onSetRadius: (radius: Dynamic, preview?: boolean) => setRadius(file, radius, preview),
      onSetGuides: (guides: Dynamic) => setGuides(file, guides, false),
      onLiveGuides: (guides: Dynamic) => setGuides(file, guides, true),
      onLiveEnd: () => setGuides(file, currentManifest.current.artboards.find((candidate) => candidate.file === file)?.guides ?? [], false),
    };
  }, [selected, fill, exportRules, fitHeight, canFit, setPrint, setPaper, setSize, update, setGuides, setRadius]);
}

interface ArtboardManifestEdits {
  manifest: CanvasManifest;
  current: Ref<CanvasManifest>;
  saved: Ref<CanvasManifest | null>;
  record: Ref<(step: Dynamic, excluded: Set<string>) => void>;
  setPreview(manifest: CanvasManifest): void;
  persist(manifest: CanvasManifest): void;
}

function replaceArtboard(manifest: CanvasManifest, file: string, update: (artboard: CanvasArtboard) => CanvasArtboard) {
  return { artboards: manifest.artboards.map((artboard) => artboard.file === file ? update(artboard) : artboard) };
}

/** 处理画板清单中的属性变更。拖动中的值只更新预览，提交时记录撤销步骤。 */
export function useArtboardManifestEdits(options: ArtboardManifestEdits) {
  const { useCallback, useRef } = React;
  const { manifest, current, saved, record, setPreview, persist } = options;

  const rename = useCallback((file: string, requestedTitle: string) => {
    const defaultTitle = file.replace(/\.dc\.html$/, "");
    const normalized = PlatformFileContentSlice(requestedTitle);
    if (normalized === undefined) return;
    const target = manifest.artboards.find((artboard) => artboard.file === file);
    const title = normalized === defaultTitle ? undefined : normalized;
    if (!target || (target.title ?? undefined) === title) return;
    record.current({ kind: "rename", file, from: target.title, to: title }, new Set());
    persist(replaceArtboard(manifest, file, ({ title: _previous, ...artboard }) =>
      title ? { ...artboard, title } : artboard));
  }, [manifest, persist]);

  const setPrint = useCallback((file: string, mode: Dynamic) => {
    const target = manifest.artboards.find((artboard) => artboard.file === file);
    const previous = target?.print === "flow" ? "flow" : "fixed";
    if (!target || previous === mode) return;
    record.current({ kind: "print", file, from: previous, to: mode }, new Set());
    persist(replaceArtboard(manifest, file, ({ print: _previous, ...artboard }) =>
      mode === "flow" ? { ...artboard, print: "flow" } : artboard));
  }, [manifest, persist]);

  const setPaper = useCallback((file: string, paper: Dynamic) => {
    const target = manifest.artboards.find((artboard) => artboard.file === file);
    if (!target || target.paper === paper) return;
    record.current({ kind: "paper", file, from: target.paper, to: paper }, new Set());
    persist(replaceArtboard(manifest, file, (artboard) => ({ ...artboard, paper })));
  }, [manifest, persist]);

  const resize = useCallback((file: string, size: Dynamic, recordHistory?: boolean) => resizeArtboardFromInput(
    { record, setPreview, saved, current, persist }, file, size, recordHistory,
  ), [persist]);

  const updatePreviewableProperty = useCallback((
    file: string, kind: "guides" | "radius", value: Dynamic, preview: boolean,
  ) => {
    const manifest = current.current;
    if (!manifest.artboards.some((artboard) => artboard.file === file)) return;
    const next = kind === "guides" ? updateArtboardGuides(manifest, file, value) : updateArtboardRadius(manifest, file, value);
    if (preview) {
      current.current = next;
      setPreview(next);
      return;
    }
    const previous = (saved.current ?? manifest).artboards.find((artboard) => artboard.file === file)?.[kind];
    if (structurallyEqual(previous, value)) {
      setPreview(next);
      return;
    }
    record.current({ kind, file, from: previous, to: value }, new Set());
    persist(next);
    if (kind === "radius") {
      announce(propertyEditAnnouncement([{ prop: "border-radius", value: artboardRadiusCss(value) ?? "0px" }]));
    }
  }, [persist]);

  const setGuides = useCallback((file: string, guides: Dynamic[], preview: boolean) => {
    updatePreviewableProperty(file, "guides", guides.length > 0 ? [...guides] : undefined, preview);
  }, [updatePreviewableProperty]);

  const setRadius = useCallback((file: string, radius: Dynamic, preview = false) => {
    updatePreviewableProperty(file, "radius", normalizeArtboardRadius(radius), preview);
  }, [updatePreviewableProperty]);

  const reorder = useCallback((files: Dynamic, position: Dynamic) => {
    const manifest = current.current;
    const artboards = reorderArtboardsOnPages(manifest.artboards, files, position, manifest.pages);
    if (artboards !== null) {
      record.current(artboardOrderHistoryStep(manifest.artboards, artboards), new Set());
      persist({ ...manifest, artboards });
    }
    announce(stackingAnnouncement(position, artboards !== null));
  }, [persist]);
  const reorderRef = useRef(reorder);
  reorderRef.current = reorder;

  return { rename, setPrint, setPaper, resize, setGuides, setRadius, reorder, reorderRef };
}
