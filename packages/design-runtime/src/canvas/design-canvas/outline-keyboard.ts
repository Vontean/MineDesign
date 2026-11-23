import type { Dynamic } from '../../runtime-types';
import { reactChromeTheme as React } from '../../editor/chrome/theme';
import { boardSelectionItems, canvasElementSelectionCount, emptyCanvasSelection, filterSelectedElements } from '../../editor/selection/canvas-selection';
import { useCanvasKeyboardNavigation } from '../keyboard-navigation';

/** 连接图层键盘导航、画板 iframe 和画布选区。 */
export function useCanvasOutlineKeyboard({
  focusedFileRef, selectionRef, artboardEntriesRef, editingRef, documentStateRef,
  selectionEpochRef, selectionGestureActiveRef, selectionGestureRef, focusCanvasArtboardRef,
  rootNameOf, selectElementIn, handleFramePick, setSelection, setBoardSelection,
  bringArtboardIntoView, stopOf, sayUnreadable, layerTrees, selectedFile, selection,
  canEditSelection, canInspectSelection, fullscreenView,
}: {
  focusedFileRef: Dynamic; selectionRef: Dynamic; artboardEntriesRef: Dynamic;
  editingRef: Dynamic; documentStateRef: Dynamic; selectionEpochRef: Dynamic;
  selectionGestureActiveRef: Dynamic; selectionGestureRef: Dynamic; focusCanvasArtboardRef: Dynamic;
  rootNameOf: Dynamic; selectElementIn: Dynamic; handleFramePick: Dynamic; setSelection: Dynamic;
  setBoardSelection: Dynamic; bringArtboardIntoView: Dynamic; stopOf: Dynamic; sayUnreadable: Dynamic;
  layerTrees: Dynamic; selectedFile: Dynamic; selection: Dynamic;
  canEditSelection: boolean; canInspectSelection: boolean; fullscreenView: Dynamic;
}) {
  const navigation: Dynamic = useCanvasKeyboardNavigation(
      {
        focusedFileRef: focusedFileRef,
        megaSelRef: selectionRef,
        handlesRef: artboardEntriesRef,
        canEditRef: editingRef,
        titleOf: (file?: Dynamic): Dynamic =>
          documentStateRef.current.artboards.find(
            (artboard?: Dynamic): Dynamic => artboard.file === file,
          )?.title ?? file.replace(/\.dc\.html$/, ""),
        rootNameOf: rootNameOf,
        selectElementIn: selectElementIn,
        clearSelectionQuietly: (): Dynamic => {
          selectionEpochRef.current++;
          handleFramePick();
          selectionGestureActiveRef.current = true;
          setSelection(emptyCanvasSelection);
        },
        selectLayerNow: (
          file?: Dynamic,
          elementId?: Dynamic,
          token?: Dynamic,
          advancesEpoch?: Dynamic,
        ): Dynamic => {
          let entry: Dynamic = artboardEntriesRef.current.get(file);
          return focusedFileRef.current !== file ||
            !entry ||
            !entry.isReady()
            ? false
            : (advancesEpoch && selectionEpochRef.current++,
              entry.setShownSelection(null, null, token),
              entry.setShownSelection([elementId], rootNameOf(file), token));
        },
        forgetHostSelection: (file?: Dynamic): Dynamic => {
          selectionRef.current = filterSelectedElements(
            selectionRef.current,
            (selectedFile?: Dynamic): Dynamic => selectedFile !== file,
          );
          setSelection(
            (previousSelection?: Dynamic): Dynamic =>
              filterSelectedElements(
                previousSelection,
                (selectedFile?: Dynamic): Dynamic => selectedFile !== file,
              ),
          );
        },
        selectArtboard: (file?: Dynamic): Dynamic =>
          setBoardSelection(
            boardSelectionItems({
              file,
            }),
            "replace",
          ),
        clearFrameSelection: (
          file?: Dynamic,
          token?: Dynamic,
        ): Dynamic => {
          artboardEntriesRef.current.get(file)?.setShownSelection(null, null, token);
        },
        focusArtboard: (file?: Dynamic): Dynamic => focusCanvasArtboardRef.current(file),
        bringArtboardIntoView: bringArtboardIntoView,
        stopOf: stopOf,
        sayUnreadable: sayUnreadable,
      },
      layerTrees,
    );
  selectionGestureRef.current = navigation;
  let navigationKeys: Dynamic = (0, React.useMemo)(
      (): Dynamic => ({
        onEnter: navigation.enter,
        onStep: navigation.step,
        onDescend: navigation.descend,
        onAscend: navigation.ascend,
        onLeave: navigation.leave,
        holdKey: navigation.holdKey,
      }),
      [
        navigation.enter,
        navigation.step,
        navigation.descend,
        navigation.ascend,
        navigation.leave,
        navigation.holdKey,
      ],
    ),
    outlineKeyboard: Dynamic = (0, React.useMemo)(
      (): Dynamic => ({
        inside: navigation.inside,
        keys: navigationKeys,
        onAbandon: navigation.abandon,
        onTextEditEnded: navigation.onTextEditEnded,
      }),
      [navigation.inside, navigationKeys, navigation.abandon, navigation.onTextEditEnded],
    ),
    previousSelectedFileRef: Dynamic = (0, React.useRef)(selectedFile);
  (0, React.useEffect)((): Dynamic => {
    let selectionChanged: Dynamic = previousSelectedFileRef.current !== selectedFile;
    previousSelectedFileRef.current = selectedFile;
    let insideFile: Dynamic = navigation.insideRef.current;
    insideFile != null &&
      ((selectionChanged && selectedFile !== insideFile) ||
        canvasElementSelectionCount(selection) ||
        !(canEditSelection || canInspectSelection) ||
        fullscreenView != null) &&
      navigation.abandon();
  }, [navigation, selectedFile, selection, canEditSelection, canInspectSelection, fullscreenView]);
  return outlineKeyboard;
}
