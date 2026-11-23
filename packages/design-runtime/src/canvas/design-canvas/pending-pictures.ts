import { reactChromeTheme as React } from "../../editor/chrome/theme";
import type { Dynamic } from "../../runtime-types";

/** 上传完成前显示的图片占位；page 是放置时的画布页，key 为 "pp-序号"。 */
export interface PendingPicture {
  readonly key: string;
  readonly x: number;
  readonly y: number;
  readonly w: number;
  readonly h: number;
  readonly url: string;
  readonly page: string;
}

export interface PendingPicturesState {
  readonly pendingPictures: PendingPicture[];
  readonly setPendingPictures: (update: PendingPicture[] | ((pictures: PendingPicture[]) => PendingPicture[])) => void;
  readonly pendingPicturesRef: { current: PendingPicture[] };
  readonly pendingPictureSequenceRef: { current: number };
  readonly pagePendingPictures: PendingPicture[];
}

/**
 * 待放置图片：拖入或粘贴的图片在上传完成前先以占位显示。
 * 状态跨页保留，画布只渲染当前页的占位；序号 ref 用来给新占位排序。
 */
export function usePendingPictures(activePageId: string): PendingPicturesState {
  const [pendingPictures, setPendingPictures]: Dynamic = React.useState([]);
  const pendingPicturesRef: Dynamic = React.useRef(pendingPictures);
  // 渲染期同步，放置动作在事件里读到最新占位列表
  pendingPicturesRef.current = pendingPictures;
  const pendingPictureSequenceRef: Dynamic = React.useRef(0);
  const pagePendingPictures: Dynamic = React.useMemo(
    (): Dynamic => pendingPictures.filter((input?: Dynamic): Dynamic => input.page === activePageId),
    [pendingPictures, activePageId],
  );
  return { pendingPictures, setPendingPictures, pendingPicturesRef, pendingPictureSequenceRef, pagePendingPictures };
}
