import { type Dynamic } from "../../runtime-types";
import { npm_useEventListener_bc } from "../../dependencies";
import { vectorToolStateReact as React } from "../../editor/vector/tool-state";
import { getLinkedArtboards, resolveComponentFile } from "../../preview/dependency-graph";
import { samePreviewFiles } from "../preview-mounting";

/** 合并文档和未落盘更新，延迟刷新被引用的画板组件。 */
export function useLinkedArtboards(doc: Dynamic, headerThemeRequestedRef: { current: Set<string> }) {
  let [linkedArtboards, setLinkedArtboards]: Dynamic = (0,
    React.useState)(
      (): Dynamic => getLinkedArtboards(doc.content().files),
    ),
    pendingContentRef: Dynamic = (0, React.useRef)({}),
    linkedRefreshTimerRef: Dynamic = (0, React.useRef)(undefined),
    scheduleLinkedRefresh: Dynamic = (): Dynamic => {
      clearTimeout(linkedRefreshTimerRef.current);
      linkedRefreshTimerRef.current = setTimeout((): Dynamic => {
        linkedRefreshTimerRef.current = undefined;
        let nextLinked: Dynamic = getLinkedArtboards({
          ...doc.content().files,
          ...pendingContentRef.current,
        });
        setLinkedArtboards(
          (current?: Dynamic): Dynamic =>
            samePreviewFiles(current, nextLinked) ? current : nextLinked,
        );
      }, 150);
    };
  (0, React.useEffect)((): Dynamic => {
    pendingContentRef.current = {};
    scheduleLinkedRefresh();
    let unsubscribeDoc: Dynamic = doc.subscribe((): Dynamic => {
      pendingContentRef.current = {};
      headerThemeRequestedRef.current.clear();
      scheduleLinkedRefresh();
    });
    return (): Dynamic => {
      unsubscribeDoc();
      clearTimeout(linkedRefreshTimerRef.current);
      linkedRefreshTimerRef.current = undefined;
    };
  }, [doc]);
  npm_useEventListener_bc(
    "dc-update",
    (event?: Dynamic): Dynamic => {
      let componentFile: Dynamic = resolveComponentFile(
        doc.content().files,
        event.detail,
      );
      componentFile != null &&
        ((pendingContentRef.current[componentFile] = event.detail.content), scheduleLinkedRefresh());
    },
  );
  return linkedArtboards;
}
