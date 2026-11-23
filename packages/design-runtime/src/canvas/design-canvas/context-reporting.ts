import type { Dynamic } from '../../runtime-types';
import { reactChromeTheme as React } from '../../editor/chrome/theme';
import { setEmbedPresenceListener } from '../../platform/file-content';
import { reportDesignContextSnapshot } from './host';

/** 发布画布上下文，并在宿主请求或视口尺寸变化时重新发布。 */
export function useDesignContextReporting({
  canvasScale, canvasViewport, page, activePageId, activePageTitle,
  selectionChangeTick, modelChangeTick, fullscreenView, editing,
  selectedFileIds, inUseFiles, selection, dirty, problems, getProblems, artboardEntriesRef,
  designContextPublisherRef, canvasContainerRef,
}: {
  canvasScale: Dynamic; canvasViewport: Dynamic; page: Dynamic; activePageId: Dynamic;
  activePageTitle: Dynamic; selectionChangeTick: Dynamic; modelChangeTick: Dynamic;
  fullscreenView: Dynamic; editing: Dynamic; selectedFileIds: Dynamic;
  inUseFiles: Dynamic; selection: Dynamic; dirty: Dynamic; problems: Dynamic; getProblems: () => Dynamic;
  artboardEntriesRef: Dynamic; designContextPublisherRef: Dynamic;
  canvasContainerRef: Dynamic;
}) {
  const report = (0, React.useCallback)(() => reportDesignContextSnapshot({
    selection, camera: canvasScale, measureViewport: canvasViewport,
    selectedFiles: selectedFileIds, inUseFiles, artboardEntries: artboardEntriesRef,
    problems: getProblems(), fullscreenView, publisher: designContextPublisherRef,
    dirty, pageId: activePageId, pageTitle: activePageTitle, page,
  }), [
    canvasScale, canvasViewport, page, activePageId, activePageTitle, selectionChangeTick,
    // 编辑与预览切换会改变布局，保持原有的重新上报时机
    modelChangeTick, fullscreenView, editing, selectedFileIds, inUseFiles,
    selection, dirty, problems,
  ]);
  (0, React.useEffect)(report, [report]);
  (0, React.useEffect)(() => {
    setEmbedPresenceListener(report);
    return () => setEmbedPresenceListener(null);
  }, [report]);
  const reportRef = (0, React.useRef)(report);
  reportRef.current = report;
  (0, React.useEffect)(() => {
    const canvasElement = canvasContainerRef.current;
    if (!canvasElement || typeof ResizeObserver === 'undefined') return;
    const observer = new ResizeObserver(() => reportRef.current());
    observer.observe(canvasElement);
    return () => observer.disconnect();
  }, []);
}
