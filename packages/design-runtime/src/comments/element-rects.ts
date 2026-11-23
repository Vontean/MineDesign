import type { Dynamic } from "../runtime-types";
import { createPreviewHandle } from "../preview/evaluation";
import { pickerCommentRects } from "../editor/picker/bridge";
import { parseDesignCommentAnchor } from "./anchor-codec";
import { react_mi } from "./area-drawing";
import { commentRectsEqual, commentScopeKey } from "./anchor-resolution";
import type { CommentRect } from "./area-geometry";

/**
 * 评论模式下的元素测量：线程锚点指向的元素和页面在画板内的位置会随预览变化，
 * 这里每秒重测一次并保存结果，供锚点解析与点选使用。
 * 本模块拥有页面矩形、元素矩形两份状态，以及重测定时器和模式变化时的清理。
 */

/** 评论模式开启期间的重测间隔。 */
const commentAnchorRefreshIntervalMs = 1e3;

export interface CommentElementRectsOptions {
  isCommentMode: boolean;
  fullscreenFile: Dynamic;
  /** 当前页面的评论线程；变化时立即重测。 */
  threads: Dynamic[];
  /** 始终指向最新渲染的 threads。 */
  threadsRef: { readonly current: Dynamic[] };
  /** 始终指向最新渲染的“哈希 -> 画板文件”查找函数。 */
  findFileByHashRef: { readonly current: (hash?: Dynamic) => Dynamic };
  /** 取得最新的画板预览句柄表（ref），每次重测时才读取。 */
  getHandlesRef(): { readonly current: Dynamic };
}

export interface CommentElementRects {
  /** 画板文件 -> 测量键 -> 画板内元素矩形（null 表示元素已不存在）。 */
  elementRects: Map<string, Map<string, CommentRect | null>>;
  /** 画板文件 -> 页面在画板内的矩形；原地更新，变化时触发重新渲染。 */
  pageRects: Map<string, CommentRect>;
  /** 记录或清除某个画板的页面矩形，矩形有变化才触发重新渲染。 */
  setPageRect(file: Dynamic, rect: CommentRect | null | undefined): void;
}

export function useCommentElementRects(options: CommentElementRectsOptions): CommentElementRects {
  const { isCommentMode, fullscreenFile, threads, threadsRef, findFileByHashRef, getHandlesRef } = options;
  const pageRectsRef: Dynamic = (0, react_mi.useRef)(new Map());
  const [, setPageRectVersion]: Dynamic = (0, react_mi.useState)(0);
  const setPageRect = (file: Dynamic, rect: CommentRect | null | undefined): void => {
    const previousRect = pageRectsRef.current.get(file) ?? null;
    rect ? pageRectsRef.current.set(file, rect) : pageRectsRef.current.delete(file);
    commentRectsEqual(previousRect, rect) || setPageRectVersion((version?: Dynamic): Dynamic => version + 1);
  };
  const [elementRects, setElementRects]: Dynamic = (0, react_mi.useState)(new Map());
  // 退出评论模式或切换全屏画板时清掉页面矩形，避免下次沿用旧位置
  (0, react_mi.useLayoutEffect)(
    (): Dynamic => (): Dynamic =>
      [...pageRectsRef.current.keys()].forEach((file?: Dynamic): Dynamic => setPageRect(file, null)),
    [isCommentMode, fullscreenFile],
  );
  (0, react_mi.useEffect)((): Dynamic => {
    if (!isCommentMode) return;
    let disposed = false;
    let refreshTimer: Dynamic;
    const refreshElementRects = async (): Promise<Dynamic> => {
      // 需要测量的画板与元素：全屏画板总要测页面；元素、区域、像素锚点各取所需
      const entries: Dynamic = new Map();
      fullscreenFile != null && entries.set(fullscreenFile, new Map());
      for (const thread of threadsRef.current as Dynamic) {
        const parsedAnchor: Dynamic = parseDesignCommentAnchor(thread.anchor);
        const isPixelArtboard = parsedAnchor?.kind === "artboard" && "px" in parsedAnchor;
        if (
          !parsedAnchor ||
          !(
            parsedAnchor.kind === "el" ||
            (parsedAnchor.kind === "area" && parsedAnchor.path != null) ||
            isPixelArtboard
          )
        )
          continue;
        const file: Dynamic = findFileByHashRef.current(parsedAnchor.fileHash);
        if (file == null) continue;
        if (isPixelArtboard) {
          entries.has(file) || entries.set(file, new Map());
          continue;
        }
        let entry: Dynamic = entries.get(file);
        entry || entries.set(file, (entry = new Map()));
        entry.set(commentScopeKey(parsedAnchor.path, parsedAnchor.tid, parsedAnchor.fp), {
          path: parsedAnchor.path,
          tid: parsedAnchor.tid,
          fp: parsedAnchor.fp,
        });
      }
      const measuredRects: Dynamic = new Map();
      await Promise.all(
        [...entries].map(async ([file, scopes]: Dynamic): Promise<Dynamic> => {
          const entry: Dynamic = getHandlesRef().current.get(file);
          const handle: Dynamic =
            entry?.isReady() && !entry.isBlocked() ? createPreviewHandle(entry.previewFrameRef.current) : null;
          const items: Dynamic = [...scopes.values()];
          const rects: Dynamic = handle ? await pickerCommentRects(handle, [{ page: true }, ...items]) : null;
          rects &&
            measuredRects.set(
              file,
              new Map(
                items.map((scope?: Dynamic, index?: Dynamic): Dynamic => [
                  commentScopeKey(scope.path, scope.tid, scope.fp),
                  rects[index + 1] ?? null,
                ]),
              ),
            );
          disposed || setPageRect(file, rects?.[0] ?? null);
        }),
      );
      !disposed &&
        ([...pageRectsRef.current.keys()]
          .filter((file?: Dynamic): Dynamic => !entries.has(file))
          .forEach((file?: Dynamic): Dynamic => setPageRect(file, null)),
        setElementRects((previous?: Dynamic): Dynamic => new Map([...previous, ...measuredRects])),
        (refreshTimer = setTimeout((): Dynamic => {
          refreshElementRects();
        }, commentAnchorRefreshIntervalMs)));
    };
    refreshElementRects();
    return (): Dynamic => {
      disposed = true;
      clearTimeout(refreshTimer);
    };
  }, [isCommentMode, threads, fullscreenFile]);
  return { elementRects, pageRects: pageRectsRef.current, setPageRect };
}
