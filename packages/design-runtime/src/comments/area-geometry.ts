/** 评论区域的几何计算：矩形相交、归一化（0–1）、角点与位置描述。 */

export interface CommentRect {
  x: number;
  y: number;
  w: number;
  h: number;
}

/** 以所在盒子为基准的归一化区域，坐标范围 0–1。 */
export interface CommentArea {
  x0: number;
  y0: number;
  x1: number;
  y1: number;
}

export interface CommentArtboard<Board = unknown> {
  board: Board;
  frame: CommentRect;
}

/** 评论区域覆盖到的一块画板，inter 是相交矩形，cov 是覆盖画板的比例，b 是相交部分在画板内的归一化区域。 */
export interface CoveredArtboard<Board = unknown> {
  board: Board;
  frame: CommentRect;
  inter: CommentRect;
  cov: number;
  b: CommentArea;
}

export interface CommentPoint {
  x: number;
  y: number;
}

export interface CommentOperationToken {
  begin(): { readonly live: boolean };
  cancel(): void;
}

export const clampCommentFraction = (fraction: number): number => Math.min(1, Math.max(0, fraction));

export const intersectCommentRects = (first: CommentRect, second: CommentRect): CommentRect | null => {
  const left = Math.max(first.x, second.x);
  const top = Math.max(first.y, second.y);
  const right = Math.min(first.x + first.w, second.x + second.w);
  const bottom = Math.min(first.y + first.h, second.y + second.h);
  return right > left && bottom > top ? { x: left, y: top, w: right - left, h: bottom - top } : null;
};

/** 找出评论区域覆盖的画板；覆盖太少的忽略，超过 limit 时保留相交面积最大的。 */
export function artboardsCoveredByCommentArea<Board>(
  area: CommentRect,
  artboards: readonly CommentArtboard<Board>[],
  limit: number = 1 / 0,
): CoveredArtboard<Board>[] {
  const areaSize = Math.max(1e-6, area.w * area.h);
  const covered: CoveredArtboard<Board>[] = [];
  artboards.forEach(({ board, frame }) => {
    const inter = intersectCommentRects(area, frame);
    if (!inter) return;
    const interSize = inter.w * inter.h;
    const frameSize = Math.max(1e-6, frame.w * frame.h);
    (interSize < 0.04 * frameSize && interSize < 0.25 * areaSize) ||
      covered.push({
        board,
        frame,
        inter,
        cov: interSize / frameSize,
        b: {
          x0: (inter.x - frame.x) / frame.w,
          y0: (inter.y - frame.y) / frame.h,
          x1: (inter.x + inter.w - frame.x) / frame.w,
          y1: (inter.y + inter.h - frame.y) / frame.h,
        },
      });
  });
  if (covered.length <= limit) return covered;
  const kept = new Set(
    [...covered].sort((a, b) => b.inter.w * b.inter.h - a.inter.w * a.inter.h).slice(0, limit),
  );
  return covered.filter((item) => kept.has(item));
}

/** 把相交部分换算成画板内容盒中的归一化区域；内容盒无面积或结果为空时返回 null。 */
export function commentAreaWithinArtboardContent(
  coveredArtboard: Pick<CoveredArtboard, 'inter' | 'frame'>,
  contentBox: CommentRect,
): CommentArea | null {
  if (!(contentBox.w > 0 && contentBox.h > 0)) return null;
  const offsetX = coveredArtboard.inter.x - coveredArtboard.frame.x;
  const offsetY = coveredArtboard.inter.y - coveredArtboard.frame.y;
  const area: CommentArea = {
    x0: clampCommentFraction((offsetX - contentBox.x) / contentBox.w),
    y0: clampCommentFraction((offsetY - contentBox.y) / contentBox.h),
    x1: clampCommentFraction((offsetX + coveredArtboard.inter.w - contentBox.x) / contentBox.w),
    y1: clampCommentFraction((offsetY + coveredArtboard.inter.h - contentBox.y) / contentBox.h),
  };
  return area.x1 > area.x0 && area.y1 > area.y0 ? area : null;
}

export function unionCommentRects(rects: readonly CommentRect[]): CommentRect | null {
  if (rects.length === 0) return null;
  let minX = 1 / 0;
  let minY = 1 / 0;
  let maxX = -1 / 0;
  let maxY = -1 / 0;
  for (const rect of rects) {
    minX = Math.min(minX, rect.x);
    minY = Math.min(minY, rect.y);
    maxX = Math.max(maxX, rect.x + rect.w);
    maxY = Math.max(maxY, rect.y + rect.h);
  }
  return { x: minX, y: minY, w: maxX - minX, h: maxY - minY };
}

export function normalizeCommentArea(area: CommentRect, box: CommentRect): CommentArea {
  const width = Math.max(1e-6, box.w);
  const height = Math.max(1e-6, box.h);
  return {
    x0: clampCommentFraction((area.x - box.x) / width),
    y0: clampCommentFraction((area.y - box.y) / height),
    x1: clampCommentFraction((area.x + area.w - box.x) / width),
    y1: clampCommentFraction((area.y + area.h - box.y) / height),
  };
}

export function denormalizeCommentArea(box: CommentRect, area: CommentArea): CommentRect {
  return {
    x: box.x + area.x0 * box.w,
    y: box.y + area.y0 * box.h,
    w: (area.x1 - area.x0) * box.w,
    h: (area.y1 - area.y0) * box.h,
  };
}

/** 离点最近的角：0 左上、1 右上、2 左下、3 右下。 */
export function nearestCommentAreaCorner(box: CommentRect, point: CommentPoint): number {
  const horizontal = point.x > box.x + box.w / 2 ? 1 : 0;
  const vertical = point.y > box.y + box.h / 2 ? 2 : 0;
  return horizontal + vertical;
}

/** 角点坐标；corner 为 null 或 undefined 时取中心。 */
export function commentAreaHandlePoint(box: CommentRect, corner?: number | null): CommentPoint {
  return corner == null
    ? { x: box.x + box.w / 2, y: box.y + box.h / 2 }
    : {
        x: corner & 1 ? box.x + box.w : box.x,
        y: corner & 2 ? box.y + box.h : box.y,
      };
}

/** 用文字描述区域在画板中的位置；覆盖 85% 以上返回空字符串。 */
export function describeCommentAreaLocation(area: CommentArea, coverage: number): string {
  if (coverage >= 0.85) return '';
  if (area.x1 <= 0.15) return 'left edge';
  if (area.x0 >= 0.85) return 'right edge';
  if (area.y1 <= 0.15) return 'top edge';
  if (area.y0 >= 0.85) return 'bottom edge';
  const centerY = (area.y0 + area.y1) / 2;
  const centerX = (area.x0 + area.x1) / 2;
  const vertical =
    area.y1 <= 0.55 && centerY <= 0.35
      ? 'top'
      : area.y0 >= 0.45 && centerY >= 0.65
        ? 'bottom'
        : area.y1 - area.y0 <= 0.5
          ? 'middle'
          : '';
  const horizontal =
    area.x1 <= 0.55 && centerX <= 0.35
      ? 'left'
      : area.x0 >= 0.45 && centerX >= 0.65
        ? 'right'
        : area.x1 - area.x0 <= 0.5
          ? 'centre'
          : '';
  const phrase = [vertical, horizontal].filter(Boolean).join(' ');
  return phrase === 'top' || phrase === 'bottom'
    ? phrase + ' half'
    : phrase === 'left' || phrase === 'right'
      ? phrase + ' side'
      : phrase || 'part';
}

/** 操作令牌：begin 之后若再次 begin 或 cancel，上一次的 live 变为 false。 */
export function createCommentOperationToken(): CommentOperationToken {
  let counter = 0;
  return {
    begin() {
      counter += 1;
      const mine = counter;
      return {
        get live() {
          return counter === mine;
        },
      };
    },
    cancel() {
      counter += 1;
    },
  };
}
