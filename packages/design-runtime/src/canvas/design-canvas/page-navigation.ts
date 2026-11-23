import { reactChromeTheme as React } from "../../editor/chrome/theme";
import { useLatestCallback } from "../../editor/hooks/latest-callback";
import { emptyCanvasSelection } from "../../editor/selection/canvas-selection";
import { designPageId } from "../../platform/file-content";
import type { CanvasArtboard, CanvasManifest } from "../manifest-history";
import { defaultPageArtboard } from "../navigation";
import { recallCanvasView } from "../viewport-memory";
import { artboardIsNotExpandedFill, defaultCanvasCamera } from "./playback";

function planCanvasPageLanding(
  manifest: CanvasManifest,
  pageId: string | undefined,
  requestedFile: string | undefined,
  focused: boolean,
): { rememberedArtboard: CanvasArtboard | undefined; firstFramedArtboard: CanvasArtboard | undefined } {
  const onPage = (artboard: CanvasArtboard) => designPageId(artboard, manifest.pages) === pageId;
  const firstFramedArtboard = manifest.artboards.find((artboard) => onPage(artboard) && !artboard.frameless);
  if (!focused) return { firstFramedArtboard, rememberedArtboard: undefined };
  const requestedArtboard = requestedFile === undefined
    ? undefined
    : manifest.artboards.find((artboard) => artboard.file === requestedFile && onPage(artboard));
  return { firstFramedArtboard, rememberedArtboard: requestedArtboard ?? defaultPageArtboard(manifest, pageId) };
}

type CreateFirstArtboard = (file: undefined, content: undefined, options: { auto: true }) => unknown;

type Camera = typeof defaultCanvasCamera;
type FullscreenView = { file: string; prev: Camera; fit: boolean };

interface CanvasPageNavigationOptions {
  activePageId: string;
  activePageRef: { current: string };
  manifestRef: { current: CanvasManifest };
  phoneCanvas: boolean;
  editableRef: { current: boolean };
  readonly fullscreenActiveRef: { current: boolean };
  readonly layerSidebarScroll: { current: number };
  invalidatePendingFocus(): void;
  fitPage: { current: () => unknown };
  restoreCamera: { current: () => void };
  camera: { get(): Camera };
  abandonSelectionGesture(): void;
  clearFramePick(): void;
  setActiveArtboard(file: null): void;
  setSelectedFile(file: string | null): void;
  setSelection(selection: typeof emptyCanvasSelection): void;
  setPage(pageId: string | undefined): void;
  setPlayingFile(file: null): void;
  setFullscreenView(view: FullscreenView | ((previous: FullscreenView | null) => FullscreenView)): void;
}

/** 切页时清空旧选区，并按当前视图模式选择落点和调整镜头。 */
export function useCanvasPageNavigation(options: CanvasPageNavigationOptions) {
  const { activePageId, fitPage, abandonSelectionGesture, clearFramePick } = options;
  const needsFit = React.useRef(false);
  const createAfterSwitch = React.useRef(false);
  const createFirstArtboard: { current: CreateFirstArtboard | null } = React.useRef(null);
  const scheduleFirstArtboard = React.useCallback(() => {
    createAfterSwitch.current = true;
  }, []);

  const switchPage = React.useCallback((pageId?: string, requestedFile?: string) => {
    if (pageId === options.activePageRef.current) return;
    abandonSelectionGesture();
    options.setActiveArtboard(null);
    options.layerSidebarScroll.current = 0;
    options.invalidatePendingFocus();
    const { rememberedArtboard, firstFramedArtboard } = planCanvasPageLanding(
      options.manifestRef.current, pageId, requestedFile, options.fullscreenActiveRef.current,
    );
    if (options.fullscreenActiveRef.current) {
      if (rememberedArtboard) {
        options.setFullscreenView({
          file: rememberedArtboard.file,
          prev: recallCanvasView(pageId) ?? defaultCanvasCamera,
          fit: artboardIsNotExpandedFill(rememberedArtboard),
        });
      } else {
        options.restoreCamera.current();
      }
    }
    clearFramePick();
    options.setSelection(emptyCanvasSelection);
    options.setPlayingFile(null);
    options.setPage(pageId);
    const shouldSelectLanding = !options.phoneCanvas || !options.editableRef.current || options.fullscreenActiveRef.current;
    const landingFile = shouldSelectLanding ? (rememberedArtboard ?? firstFramedArtboard)?.file : undefined;
    options.setSelectedFile(requestedFile ?? landingFile ?? null);
    needsFit.current = !(options.fullscreenActiveRef.current && rememberedArtboard);
  }, [clearFramePick, abandonSelectionGesture]);

  const focusArtboard = useLatestCallback((file: string) => {
    const manifest = options.manifestRef.current;
    const artboard = manifest.artboards.find((candidate) => candidate.file === file);
    if (!artboard || artboard.frameless === true) return;
    const pageId = designPageId(artboard, manifest.pages);
    const pageChanged = pageId !== options.activePageRef.current;
    if (pageChanged) {
      switchPage(pageId, file);
      needsFit.current = false;
    }
    options.setFullscreenView((previous) => ({
      file,
      prev: previous?.prev ?? (pageChanged ? recallCanvasView(pageId) ?? defaultCanvasCamera : options.camera.get()),
      fit: artboardIsNotExpandedFill(artboard),
    }));
  });

  React.useEffect(() => {
    if (createAfterSwitch.current) {
      createAfterSwitch.current = false;
      createFirstArtboard.current?.(undefined, undefined, { auto: true });
    }
    if (!needsFit.current) return;
    needsFit.current = false;
    const timer = window.setTimeout(() => fitPage.current(), 120);
    return () => window.clearTimeout(timer);
  }, [activePageId]);

  return {
    switchPage,
    focusArtboard,
    needsFit,
    scheduleFirstArtboard,
    registerFirstArtboardCreator(create: CreateFirstArtboard) {
      createFirstArtboard.current = create;
    },
  };
}
