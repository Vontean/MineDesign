import { uiMessage } from "@minedesign/contracts/ui-messages";
import { mdnCommentMode, mdnToggleCommentMode } from "../../comments/feedback-panel";
import { npm_useLocalStorage_QP } from "../../dependencies";
import { reactChromeTheme as React } from "../../editor/chrome/theme";
import {
  DcEditorModeKey,
  defaultInspectorOpen,
  getTweakSelection,
  inspectorOpenStorageKey,
  inspectorPanelId,
  inspectorToggleId,
} from "../../editor/inspector/context";
import { selectionFromArtboards } from "../../editor/selection/canvas-selection";
import { hasBlockingEditorOverlay } from "../../editor/text/typing-target";
import { ToolbarPrimitivesComponent } from "../../editor/toolbar/primitives";
import { Icon } from "../../cds/components/icon";
import type { Dynamic } from "../../runtime-types";

type Ref<T> = { current: T };
type SetOpen = (next: boolean | ((previous: boolean) => boolean)) => void;

function focusIsUnassigned() {
  return document.activeElement === document.body || document.activeElement === null;
}

export const inspectorFocusRegion = {
  el: () => document.getElementById(inspectorPanelId),
  fallback: () => document.getElementById(inspectorPanelId)?.querySelector('[role="tab"][aria-selected="true"]') ?? null,
};

export function useCanvasInspectorPanel() {
  const { useRef, useEffect, useCallback } = React;
  const [storedOpen, setStoredOpen] = npm_useLocalStorage_QP<boolean>(inspectorOpenStorageKey, defaultInspectorOpen);
  const [open, setOpen]: [boolean, SetOpen] = [storedOpen, setStoredOpen];

  const moveFocusOnToggle: Ref<boolean> = useRef(false);
  const panelHadFocus: Ref<boolean> = useRef(false);
  useEffect(() => {
    const insidePanel = (target: EventTarget | null) =>
      target instanceof Node && (inspectorFocusRegion.el()?.contains(target) ?? false);
    const onFocusIn = (event: FocusEvent) => {
      panelHadFocus.current = insidePanel(event.target);
    };
    const onFocusOut = (event: FocusEvent) => {
      const target = event.target;
      if (!(target instanceof Node) || !insidePanel(target) || insidePanel(event.relatedTarget)) return;
      queueMicrotask(() => {
        if (target.isConnected && !insidePanel(document.activeElement)) panelHadFocus.current = false;
      });
    };
    document.addEventListener("focusin", onFocusIn);
    document.addEventListener("focusout", onFocusOut);
    return () => {
      document.removeEventListener("focusin", onFocusIn);
      document.removeEventListener("focusout", onFocusOut);
    };
  }, []);

  useEffect(() => {
    const recordFrameShortcut = () => { moveFocusOnToggle.current = !hasBlockingEditorOverlay(); };
    window.addEventListener("panel-toggle-key", recordFrameShortcut);
    return () => window.removeEventListener("panel-toggle-key", recordFrameShortcut);
  }, []);

  const previousOpen: Ref<boolean> = useRef(open);
  useEffect(() => {
    const previous = previousOpen.current;
    previousOpen.current = open;
    if (open === previous) return;
    const requested = moveFocusOnToggle.current;
    moveFocusOnToggle.current = false;
    const frame = requestAnimationFrame(() => {
      const unassigned = focusIsUnassigned();
      const shouldMoveFocus = open ? requested || unassigned : unassigned && (requested || panelHadFocus.current);
      if (!shouldMoveFocus) return;
      const target = open
        ? (inspectorFocusRegion.fallback() ?? inspectorFocusRegion.el()?.querySelector(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
          ))
        : document.getElementById(inspectorToggleId);
      (target as HTMLElement | null | undefined)?.focus({ preventScroll: true });
    });
    return () => cancelAnimationFrame(frame);
  }, [open]);

  const toggle = useCallback((moveFocus: boolean) => {
    moveFocusOnToggle.current = moveFocus;
    setOpen((previous) => !previous);
  }, [setOpen]);
  return { open, setOpen, toggle };
}

export function useInspectorPanelShortcut({
  toggle, phoneCanvas, editing, readOnly, fullscreen, filesOpen,
}: {
  toggle(moveFocus: boolean): void;
  phoneCanvas: boolean;
  editing: Ref<boolean>;
  readOnly: Ref<boolean>;
  fullscreen: Ref<boolean>;
  filesOpen: Ref<boolean>;
}) {
  React.useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.defaultPrevented || event.altKey || event.shiftKey || !(event.metaKey || event.ctrlKey) ||
        (event.key !== "\\" && event.code !== "Backslash") || !(editing.current || readOnly.current) ||
        fullscreen.current || (phoneCanvas && !editing.current) || filesOpen.current) return;
      event.preventDefault();
      if (event.repeat) return;
      const active = document.activeElement;
      const typing = active instanceof HTMLElement &&
        (/^(INPUT|TEXTAREA|SELECT)$/.test(active.tagName) || active.isContentEditable);
      toggle(!hasBlockingEditorOverlay() && !typing);
    };
    window.addEventListener("keydown", onKeyDown, true);
    return () => window.removeEventListener("keydown", onKeyDown, true);
  }, [toggle, phoneCanvas]);
}

interface PanelFeedback {
  panelChanged(open: boolean): void;
  onPanelRequest(onChange: (open: boolean) => void): () => void;
}

export function useHostedInspectorPanel(
  feedback: PanelFeedback | null,
  commenting: boolean,
  inspectorOpen: boolean,
  setInspectorOpen: SetOpen,
) {
  const { useEffect, useRef } = React;
  const panelOpen = feedback != null && (commenting || inspectorOpen);
  const activeCommentMode: Ref<boolean> = useRef(commenting);
  const openBeforeComments: Ref<boolean | null> = useRef(null);
  activeCommentMode.current = commenting;

  useEffect(() => {
    if (!feedback) return;
    mdnCommentMode.set(commenting);
    if (commenting) {
      openBeforeComments.current = inspectorOpen;
      setInspectorOpen(true);
    } else if (openBeforeComments.current !== null) {
      setInspectorOpen(mdnCommentMode.keepPanelOnExit || openBeforeComments.current);
      mdnCommentMode.keepPanelOnExit = false;
      openBeforeComments.current = null;
    }
  }, [feedback, commenting]);
  useEffect(() => {
    feedback?.panelChanged(panelOpen);
  }, [feedback, panelOpen]);
  useEffect(() => feedback?.onPanelRequest((open) => {
    if (!open && activeCommentMode.current) openBeforeComments.current = false;
    setInspectorOpen(open);
  }), [feedback, setInspectorOpen]);
  useEffect(() => {
    if (!feedback || inspectorOpen || !activeCommentMode.current) return;
    openBeforeComments.current = false;
    mdnToggleCommentMode();
  }, [feedback, inspectorOpen]);

  return panelOpen;
}

export function InspectorPanelToggle({ open, toggle }: { open: boolean; toggle(moveFocus: boolean): void }) {
  return (
    <ToolbarPrimitivesComponent
      glyph={<Icon name="SidebarRight" size="auto" className="max-[599px]:rotate-90" />}
      label={uiMessage("canvas.designCanvas.properties")}
      iconOnly={true}
      data-testid="dc-props-toggle"
      tip={open ? uiMessage("canvas.designCanvas.hideThePropertiesPanel") : uiMessage("canvas.designCanvas.showThePropertiesPanel")}
      shortcut={"cmd+\\"}
      pressed={open}
      id={inspectorToggleId}
      onClick={(event: MouseEvent) => toggle(event.detail === 0)}
    />
  );
}

export function InspectorPanelMount({ hosted, open, filesOpen }: { hosted: boolean; open: boolean; filesOpen: boolean }) {
  const layout = hosted
    ? " isolate z-40 min-h-0 flex-1 shrink-0"
    : " isolate z-40 h-full shrink-0 max-[599px]:h-auto max-[599px]:w-full max-[599px]:flex-col";
  const aside = (
    <aside
      id={inspectorPanelId}
      aria-label={uiMessage("canvas.designCanvas.propertiesPanel")}
      inert={filesOpen}
      className={(filesOpen ? "hidden" : "flex") + layout}
    />
  );
  return hosted
    ? <div className="mdn-right-panel" hidden={!open || filesOpen} data-testid="mdn-right-panel">{aside}</div>
    : aside;
}

interface InspectorEntryOptions {
  editing: boolean;
  open: boolean;
  selectedFile: string | null;
  setOpen: SetOpen;
  abandonSelectionGesture(): void;
  leaveFullscreen(): void;
  beginEditing(): void;
  clearFramePick(): void;
  setSelection(selection: Dynamic): void;
  focusArtboard(file: string): Promise<boolean>;
  requestProperties(): void;
}

export function useInspectorEntryPoints(options: InspectorEntryOptions) {
  const { editing, open, selectedFile, setOpen, abandonSelectionGesture, clearFramePick, focusArtboard } = options;
  const [tab, setTab] = npm_useLocalStorage_QP(DcEditorModeKey, null);
  const focusEpoch: Ref<number> = React.useRef(0);
  React.useEffect(() => { focusEpoch.current++; }, [open, tab]);
  const showTweaks = React.useCallback((file: string) => {
    abandonSelectionGesture();
    options.leaveFullscreen();
    options.beginEditing();
    clearFramePick();
    options.setSelection(selectionFromArtboards(new Set([file])));
    const epoch = ++focusEpoch.current;
    focusArtboard(file).then((focused) => {
      if (!focused || epoch !== focusEpoch.current) return;
      setOpen(true);
      setTab("tweaks");
    });
  }, [clearFramePick, focusArtboard, setOpen, setTab, abandonSelectionGesture]);
  const tweaksOpenFile = getTweakSelection(editing, open, tab, selectedFile);
  const toggleTweaks = React.useCallback((file: string) => {
    if (file !== tweaksOpenFile) return showTweaks(file);
    focusEpoch.current++;
    setOpen(false);
  }, [showTweaks, setOpen, tweaksOpenFile]);
  const showArtboardSettings = React.useCallback((file: string) => {
    abandonSelectionGesture();
    options.beginEditing();
    clearFramePick();
    options.setSelection(selectionFromArtboards(new Set([file])));
    options.requestProperties();
  }, [clearFramePick, abandonSelectionGesture]);

  return { showTweaks, toggleTweaks, tweaksOpenFile, showArtboardSettings };
}
