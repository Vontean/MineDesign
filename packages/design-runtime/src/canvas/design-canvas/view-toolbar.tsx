import type { EditorView, ViewAction } from '@minedesign/contracts/editor-messages';
import { uiMessage } from '@minedesign/contracts/ui-messages';
import { reactChromeTheme as React } from '../../editor/chrome/theme';
import { isApplePlatform } from '../../editor/keyboard/shortcuts';
import { useCommentCardsViewToggle } from '../../comments/comment-cards';
import { artboardNavigationGroupLabels } from '../navigation';
import { viewportScaleLimits } from '../viewport-memory';
import { zoomScalePresets } from '../zoom';

type ScaleListener = (scale: number) => void;
type SubscribeScale = (listener: ScaleListener) => () => void;
interface CameraController {
  get(): { scale: number };
  subscribe(listener: (next: { scale: number }, previous: { scale: number }) => void): () => void;
}
interface CanvasUndo {
  subscribe(listener: () => void): () => void;
  canUndo(): boolean;
  canRedo(): boolean;
  undo(): void;
  redo(): void;
}
interface ViewToggle {
  readonly label: string;
  checked: boolean;
  shortcut?: string;
  onToggle(): void;
}
interface PlayableGroups {
  prototypes: { file: string }[];
  others: { file: string }[];
}
interface ViewFeedback {
  viewChanged(view: EditorView): void;
  onViewAction(listener: (action: ViewAction) => void): () => void;
}
interface CanvasViewToolbarOptions {
  camera: CameraController;
  subscribeScale: SubscribeScale;
  zoomTo(scale: number): void;
  fit(): void;
  history: CanvasUndo | null | undefined;
  editing: boolean;
  commentsController: { exitMode?(): void } | null;
  manifestHistoryRevision: unknown;
  selectionChangeTick: unknown;
  guidesVisible: boolean;
  setGuidesVisible(update: (visible: boolean) => boolean): void;
  feedback: ViewFeedback | null;
  playable: PlayableGroups | null;
  openFile(file: string): void;
  getArtboardTitle(file: string): string;
}
interface CanvasViewToolbar {
  subscribeScale: SubscribeScale;
  getScale(): number;
  stepZoom(direction: number): void;
  getLimits(): { minScale: number; maxScale: number };
  undo: CanvasUndo | undefined;
  viewToggles: ViewToggle[];
  zoomTo(scale: number): void;
  fit(): void;
}
interface InlineZoomControlProps {
  'data-testid': string;
  readout: boolean;
  subscribeScale: SubscribeScale;
  getScale(): number;
  onPickScale(scale: number): void;
  onFit(): void;
  onStepZoom(direction: number): void;
  getLimits(): { minScale: number; maxScale: number };
  undo: CanvasUndo | undefined;
  viewToggles: ViewToggle[];
  fitLabel: string;
  tip: string;
}

export function useCanvasScaleSubscription(camera: CameraController): SubscribeScale {
  const listeners: { current: Set<ScaleListener> } = React.useRef(new Set<ScaleListener>());
  const subscribeScale: SubscribeScale = React.useCallback((listener: ScaleListener) => {
    listeners.current.add(listener);
    listener(camera.get().scale);
    return () => { listeners.current.delete(listener); };
  }, [camera]);
  React.useEffect(() => camera.subscribe((next: { scale: number }, previous: { scale: number }) => {
    if (next.scale !== previous.scale)
      for (const listener of listeners.current) listener(next.scale);
  }), [camera]);
  return subscribeScale;
}

export function useCanvasViewToolbar({
  camera, subscribeScale, zoomTo, fit, history, editing, commentsController,
  manifestHistoryRevision, selectionChangeTick, guidesVisible, setGuidesVisible,
  feedback, playable, openFile, getArtboardTitle,
}: CanvasViewToolbarOptions): CanvasViewToolbar {
  const getScale = React.useCallback(() => camera.get().scale, [camera]);
  const stepZoom = React.useCallback((direction: number) =>
    zoomTo(camera.get().scale * (direction === 1 ? 1.25 : 1 / 1.25)), [camera, zoomTo]);
  const getLimits = React.useCallback(() => viewportScaleLimits, []);
  const [historyRevision, setHistoryRevision] = React.useState(0);
  React.useEffect(() => history?.subscribe(() => setHistoryRevision((revision: number) => revision + 1)), [history]);
  const wrapHistory = React.useCallback((target: CanvasUndo) => ({
    ...target,
    undo: () => { commentsController?.exitMode?.(); target.undo(); },
    redo: () => { commentsController?.exitMode?.(); target.redo(); },
  }), [commentsController]);
  const undo = React.useMemo(() => editing && history ? wrapHistory(history) : undefined,
    [editing, history, wrapHistory, historyRevision, manifestHistoryRevision, selectionChangeTick]);
  const commentCardsToggle = useCommentCardsViewToggle();
  const viewToggles: ViewToggle[] = React.useMemo(() => [
    {
      get label() { return uiMessage('canvas.designCanvas.layoutGuides'); },
      checked: guidesVisible,
      shortcut: 'shift+g',
      onToggle: () => setGuidesVisible((visible: boolean) => !visible),
    },
    ...commentCardsToggle,
  ], [guidesVisible, setGuidesVisible, commentCardsToggle]);

  React.useEffect(() => {
    if (!feedback) return;
    const { minScale, maxScale } = getLimits();
    const groups: [string, { file: string }[]][] = playable ? [
      [artboardNavigationGroupLabels.prototypes, playable.prototypes],
      [artboardNavigationGroupLabels.others, playable.others],
    ] : [];
    return subscribeScale((scale: number) => feedback.viewChanged({
      scale, minScale, maxScale, presets: zoomScalePresets,
      toggles: viewToggles.map((toggle: ViewToggle) => ({
        id: toggle.label, label: toggle.label, checked: !!toggle.checked,
      })),
      canUndo: !!undo?.canUndo(), canRedo: !!undo?.canRedo(),
      play: groups.filter(([, items]) => items.length > 0)
        .map(([label, items]) => ({
          label: String(label),
          items: items.map((item: { file: string }) => ({ file: item.file, title: String(getArtboardTitle(item.file)) })),
        })),
    }));
  }, [feedback, playable, viewToggles, undo, historyRevision, subscribeScale, getLimits]);
  React.useEffect(() => feedback?.onViewAction((action: ViewAction) => {
    if (action.action === 'zoom-in') stepZoom(1);
    else if (action.action === 'zoom-out') stepZoom(-1);
    else if (action.action === 'fit') fit();
    else if (action.action === 'zoom') zoomTo(action.scale);
    else if (action.action === 'undo') undo?.canUndo() && undo.undo();
    else if (action.action === 'redo') undo?.canRedo() && undo.redo();
    else if (action.action === 'toggle') viewToggles.find((toggle: ViewToggle) => toggle.label === action.id)?.onToggle();
    else if (action.action === 'play') openFile(action.file);
  }), [feedback, stepZoom, fit, zoomTo, undo, viewToggles, openFile]);
  return { subscribeScale, getScale, stepZoom, getLimits, undo, viewToggles, zoomTo, fit };
}

export function CanvasInlineViewToolbar({ control: Control, toolbar, fitLabel }: {
  control: (props: InlineZoomControlProps) => any;
  toolbar: CanvasViewToolbar;
  fitLabel: string;
}) {
  return <span data-view-control={''} className={'contents'}>
    <Control data-testid={'dc-zoom'} readout={true}
      subscribeScale={toolbar.subscribeScale} getScale={toolbar.getScale}
      onPickScale={toolbar.zoomTo} onFit={toolbar.fit} onStepZoom={toolbar.stepZoom}
      getLimits={toolbar.getLimits} undo={toolbar.undo} viewToggles={toolbar.viewToggles}
      fitLabel={fitLabel} tip={isApplePlatform()
        ? uiMessage('canvas.designCanvas.zoom0FitStep')
        : uiMessage('canvas.designCanvas.zoomCtrl0FitCtrl')} />
  </span>;
}
