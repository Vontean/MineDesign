import type { Dynamic } from '../../runtime-types';
import { shouldShowArtboardFaceOverlay } from '../chrome';
import { shouldHideArtboardTitle } from '../pending-artboards';
import { isPreviewHighlighted } from '../preview-mounting';

/**
 * 单个画板槽位的派生值：由画板规格与画布全局状态推导，不读写任何可变状态。
 * `overBudgetPreviewFile` 等渲染期值由调用端算好后传入。
 */
export function deriveArtboardSlot(input: {
  spec: Dynamic;
  focusedFile: Dynamic;
  selectedArtboards: Dynamic;
  enteredFile: Dynamic;
  emptyPieces: Dynamic;
  keyboardInsideFile: Dynamic;
  linkedArtboards: Dynamic;
  fullscreenFile: Dynamic;
  playingFile: Dynamic;
  canEditCanvas: boolean;
  isTouchPointer: boolean;
  armedTool: Dynamic;
  armedEmpty: Dynamic;
  hasSetMoveCommit: boolean;
  hasMultiGroupSelection: boolean;
  heldCover: Dynamic;
  isCanvasInteractive: boolean;
  shouldDelayArtboardMount: (spec: Dynamic) => boolean;
  manifestArtboardCount: number;
  getAboveDistance: (file: string) => Dynamic;
  isPhoneCanvas: boolean;
  phone: boolean;
  renamingFile: Dynamic;
  tweaksOpenFile: Dynamic;
  hoveredFile: Dynamic;
  livePins: Dynamic;
  usesCameraPortal: boolean;
  maxInteractivePreviewCount: number;
  mountedFiles: Dynamic;
  overBudgetPreviewFile: Dynamic;
  artboardHeaderThemes: Dynamic;
  coverFiles: Dynamic;
  blockedFiles: Dynamic;
  artboardNotice: Dynamic;
}): Dynamic {
  const {
    spec, focusedFile, selectedArtboards, enteredFile, emptyPieces, keyboardInsideFile,
    linkedArtboards, fullscreenFile, playingFile,
    canEditCanvas, isTouchPointer, armedTool, armedEmpty, hasSetMoveCommit,
    hasMultiGroupSelection, heldCover, isCanvasInteractive, shouldDelayArtboardMount,
    manifestArtboardCount, getAboveDistance, isPhoneCanvas, phone, renamingFile, tweaksOpenFile, hoveredFile,
    livePins, usesCameraPortal, maxInteractivePreviewCount, mountedFiles, overBudgetPreviewFile,
    artboardHeaderThemes, coverFiles, blockedFiles, artboardNotice,
  } = input;
  const isFocused: Dynamic = spec.file === focusedFile;
  const isSelected: Dynamic = selectedArtboards.has(spec.file);
  const isFrameless: Dynamic = spec.frameless === true;
  const isEntered: Dynamic = isFrameless && enteredFile === spec.file;
  const isEmptyPieces: Dynamic = isFrameless && (emptyPieces?.has(spec.file) ?? false);
  const isKeyboardInside: Dynamic = keyboardInsideFile === spec.file;
  const isComponent: Dynamic = linkedArtboards.has(spec.file);
  const displayTitle: Dynamic = spec.title ?? spec.file.replace(/\.dc\.html$/, '');
  const isPlaying: Dynamic = spec.file === playingFile;
  const usesFaceOverlay: Dynamic =
    !isFrameless &&
    isFocused &&
    isSelected &&
    canEditCanvas &&
    !isTouchPointer &&
    (armedTool == null || armedTool === 'select') &&
    fullscreenFile == null;
  const usesSetOverlay: Dynamic =
    !isFrameless &&
    isFocused &&
    !isSelected &&
    canEditCanvas &&
    !isTouchPointer &&
    (armedTool == null || armedTool === 'select') &&
    fullscreenFile == null &&
    hasSetMoveCommit &&
    (hasMultiGroupSelection || armedEmpty === true);
  const chromeKind: Dynamic = usesFaceOverlay
    ? 'face-overlay'
    : usesSetOverlay
      ? 'set-overlay'
      : 'focus-overlay';
  const isHeldCover: Dynamic = heldCover === spec.file;
  const isMountDelayed: Dynamic = shouldDelayArtboardMount(spec) && !(isFocused && canEditCanvas);
  const canFocusArtboard: Dynamic = isCanvasInteractive && !isMountDelayed;
  const shouldShowFocusOverlay: Dynamic =
    canFocusArtboard &&
    !isPlaying &&
    (isFrameless
      ? !(isEntered && isFocused)
      : !isFocused || usesFaceOverlay || usesSetOverlay || isHeldCover);
  const aboveDistance: Dynamic =
    isFrameless || fullscreenFile != null
      ? undefined
      : getAboveDistance(spec.file);
  const shouldHideTitle: Dynamic = shouldHideArtboardTitle({
    phoneCanvas: isPhoneCanvas,
    selected: isSelected,
    renaming: renamingFile === spec.file,
    playing: isPlaying,
    tweaksOpen: tweaksOpenFile === spec.file,
    armedByTouch: isFocused && isTouchPointer,
    hovered: hoveredFile === spec.file,
  });
  const isLive: Dynamic =
    phone && fullscreenFile != null
      ? isPreviewHighlighted(spec.file, fullscreenFile, livePins)
      : (!usesCameraPortal && manifestArtboardCount <= maxInteractivePreviewCount) ||
        mountedFiles.has(spec.file) ||
        (isPhoneCanvas ? spec.file === overBudgetPreviewFile : isFocused || isPlaying) ||
        spec.file === fullscreenFile;
  const phoneHeaderTheme: Dynamic =
    isPhoneCanvas && !isLive && !isFrameless ? (artboardHeaderThemes.get(spec.file) ?? null) : null;
  const hasCoverOverlay: Dynamic =
    coverFiles?.has(spec.file) === true &&
    shouldShowArtboardFaceOverlay({
      live: isLive,
      blocked: blockedFiles.has(spec.file),
      frameless: isFrameless,
      focused: isFocused,
      selected: isSelected,
      playing: isPlaying,
      fullWindow: fullscreenFile != null,
    });
  const noticeContent: Dynamic =
    fullscreenFile === spec.file ? (artboardNotice?.(spec.file) ?? null) : null;
  return {
    isFocused, isSelected, isFrameless, isEntered, isEmptyPieces, isKeyboardInside, isComponent,
    displayTitle, isPlaying, usesFaceOverlay, usesSetOverlay, chromeKind,
    isHeldCover, isMountDelayed, canFocusArtboard, shouldShowFocusOverlay, aboveDistance,
    shouldHideTitle, isLive, phoneHeaderTheme, hasCoverOverlay, noticeContent,
  };
}
