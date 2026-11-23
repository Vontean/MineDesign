import { initializeDesignKeyboardBindings } from "../../application/document-root";
import { reactChromeTheme as React } from "../../editor/chrome/theme";
import { emptyCanvasSelection, selectionFromArtboards } from "../../editor/selection/canvas-selection";
import { runFindRevealAfterSettle } from "../../find/canvas-adapter";
import { embedMemoryPrefix } from "../../platform/file-content";
import type { Dynamic } from "../../runtime-types";
import { currentCanvasPlaceFragment, resolveCanvasPlaceAction } from "../navigation";
import { classifyPlaceLink, createPlaceLinkReporter, observeGotoAnchorMessages, rememberPlaceLink } from "../place-link";
import { recallCanvasView } from "../viewport-memory";

type Ref<T> = { current: T };

interface CanvasPlaceOptions {
  selection: Dynamic;
  fullscreenViewFile: string | null;
  activePage: string;
  allowPlaybackFragment: boolean;
  manifest: Ref<Dynamic>;
  activePageRef: Ref<string>;
  fullscreenFile: Ref<string | null>;
  editing: Ref<boolean>;
  readOnly: Ref<boolean>;
  isTextEditing: Ref<(() => boolean) | null>;
  restoringPage: Ref<boolean>;
  placeActive: Ref<boolean>;
  camera: { set(view: Dynamic, exact: boolean): void };
  settle: Dynamic;
  resetSelectionGesture(): void;
  prepareFramePick(): void;
  setPendingFocus(pending: boolean): void;
  setSelection(selection: Dynamic): void;
  openPage(page: string, artboard?: string): void;
  showArtboard(file: string): void;
  focusArtboard(file: string): void;
  playArtboard(file: string): void;
}

function navigateToCanvasPlace(options: CanvasPlaceOptions, pending: Ref<AbortController | null>, fragment: string, restoring: boolean) {
  const action = resolveCanvasPlaceAction(fragment, options.manifest.current, {
    filling: options.fullscreenFile.current,
    plays: true,
    pageId: options.activePageRef.current,
    mayFocus: options.editing.current || options.readOnly.current || false,
    restoring,
  });
  if (action === null) return null;
  pending.current?.abort();
  if (action.do === "nothing") return action.lands;

  function restoreView(page: string) {
    const savedView = recallCanvasView(page);
    if (savedView === undefined) return;
    options.restoringPage.current = false;
    options.placeActive.current = true;
    options.camera.set(savedView, true);
  }

  function applyPlaceAction() {
    options.setPendingFocus(false);
    options.resetSelectionGesture();
    options.prepareFramePick();
    switch (action.do) {
      case "play":
        options.playArtboard(action.file);
        return;
      case "page":
        if (action.id === options.activePageRef.current) {
          options.setSelection(emptyCanvasSelection);
        } else {
          options.openPage(action.id);
          if (!action.camera) restoreView(action.id);
        }
        return;
      case "window":
        if (action.page !== options.activePageRef.current) {
          options.openPage(action.page, action.file);
        } else {
          options.setSelection(emptyCanvasSelection);
          options.showArtboard(action.file);
          options.focusArtboard(action.file);
        }
        return;
      default:
        if (action.page !== options.activePageRef.current) {
          options.openPage(action.page, action.focus ? action.file : undefined);
          if (!action.camera) restoreView(action.page);
        } else {
          if (action.focus) options.focusArtboard(action.file);
          if (action.camera) options.showArtboard(action.file);
        }
        options.setSelection(selectionFromArtboards(new Set([action.file])));
    }
  }

  const targetPage = action.do === "page" ? action.id : action.page;
  const needsPageChange = action.do === "window" || action.do === "play" || targetPage !== options.activePageRef.current;
  if (needsPageChange) initializeDesignKeyboardBindings();
  const controller = new AbortController();
  pending.current = controller;
  runFindRevealAfterSettle(
    needsPageChange && options.isTextEditing.current?.() === true,
    controller.signal,
    options.settle,
    applyPlaceAction,
  );
  return action.lands;
}

export function useCanvasPlaceNavigation(options: CanvasPlaceOptions) {
  const fragment = currentCanvasPlaceFragment(
    options.selection, options.fullscreenViewFile, options.activePage, options.allowPlaybackFragment,
  );
  const currentFragment = React.useRef(fragment);
  currentFragment.current = fragment;
  const latest = React.useRef(options);
  latest.current = options;
  const pending: Ref<AbortController | null> = React.useRef(null);
  const reporter = React.useRef(null);

  React.useEffect(() => {
    if (embedMemoryPrefix() !== "") return;
    const activeReporter = createPlaceLinkReporter();
    reporter.current = activeReporter;
    const stopListening = observeGotoAnchorMessages((target: string) => {
      const landed = navigateToCanvasPlace(latest.current, pending, target, false);
      if (landed !== null) rememberPlaceLink("goto", target);
      activeReporter.answer(landed ?? currentFragment.current);
    });
    const initial = classifyPlaceLink();
    if (initial) {
      rememberPlaceLink("link", initial.place);
      if (initial.why !== "known") {
        navigateToCanvasPlace(latest.current, pending, initial.place, initial.why === "here");
      }
    }
    return () => {
      stopListening();
      activeReporter.stop();
      reporter.current = null;
    };
  }, []);
  React.useEffect(() => reporter.current?.report(fragment), [fragment]);
}
