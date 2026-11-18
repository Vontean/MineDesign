/**
 * 画布评论卡片的排布：给定各评论目标点的屏幕位置、卡片尺寸与可用区域，算出每张卡片的位置与引线端点。
 * 纯函数，不读 DOM；坐标单位是屏幕像素（与评论图层同一原点），卡片大小不随画布缩放变化。
 *
 * 规则：
 * - 默认放在目标右上方，与目标保持 offsetX / offsetY 的距离；
 * - 右侧或上方放不下时翻到左侧或下方；
 * - 与已放好的卡片或任何目标点相撞时，沿远离目标的方向错开，直到不再相撞；
 * - 按 y、x、id 的顺序逐张放置，相同输入得到相同输出。
 */

export interface CardPoint {
  x: number;
  y: number;
}

export interface CardTarget extends CardPoint {
  id: string;
}

export interface CardSize {
  width: number;
  height: number;
}

export interface CardBounds {
  left: number;
  top: number;
  right: number;
  bottom: number;
}

export interface CardLayoutOptions {
  /** 卡片与目标点的水平距离。 */
  offsetX: number;
  /** 卡片与目标点的垂直距离。 */
  offsetY: number;
  /** 卡片之间的最小间隔。 */
  gap: number;
  /** 目标点周围不许卡片覆盖的半径（编号圆点半径加余量）。 */
  pinRadius: number;
  /** 没有给出尺寸时使用的卡片尺寸。 */
  defaultSize: CardSize;
}

export type CardSide = 'right' | 'left';
export type CardDirection = 'up' | 'down';

export interface CardPlacement {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  side: CardSide;
  direction: CardDirection;
  /** 引线：from 是目标点，to 是卡片边上离目标最近的点。 */
  leader: { from: CardPoint; to: CardPoint };
}

interface Box {
  left: number;
  top: number;
  right: number;
  bottom: number;
}

export const DEFAULT_CARD_LAYOUT_OPTIONS: CardLayoutOptions = {
  offsetX: 32,
  offsetY: 24,
  gap: 8,
  pinRadius: 14,
  defaultSize: { width: 200, height: 56 },
};

// 换到非首选的一侧时，相当于多错开这么多像素；首选侧要错开得更远才换边
const SIDE_CHANGE_COST = 48;
// 换到非首选的上下方向时的代价，小于换边
const DIRECTION_CHANGE_COST = 24;
// 超出可用区域的代价远大于任何错开距离
const OVERFLOW_COST = 1e6;

const overlaps = (a: Box, b: Box): boolean =>
  a.left < b.right && b.left < a.right && a.top < b.bottom && b.top < a.bottom;

const compareTargets = (a: CardTarget, b: CardTarget): number =>
  a.y - b.y || a.x - b.x || (a.id < b.id ? -1 : a.id > b.id ? 1 : 0);

const overflowOf = (box: Box, bounds: CardBounds): number =>
  Math.max(0, bounds.left - box.left) +
  Math.max(0, box.right - bounds.right) +
  Math.max(0, bounds.top - box.top) +
  Math.max(0, box.bottom - bounds.bottom);

/** 沿 direction 移动卡片，越过所有相撞的障碍；每次都越过一个障碍，所以一定会停下。 */
function slideUntilFree(start: Box, direction: CardDirection, obstacles: readonly Box[]): Box {
  let box = start;
  for (;;) {
    const hit = obstacles.find(obstacle => overlaps(box, obstacle));
    if (!hit) return box;
    const height = box.bottom - box.top;
    const top = direction === 'up' ? hit.top - height : hit.bottom;
    box = { left: box.left, right: box.right, top, bottom: top + height };
  }
}

export function layoutCommentCards(
  targets: readonly CardTarget[],
  sizes: Readonly<Record<string, CardSize>>,
  bounds: CardBounds,
  options: Partial<CardLayoutOptions> = {},
): CardPlacement[] {
  const { offsetX, offsetY, gap, pinRadius, defaultSize } = { ...DEFAULT_CARD_LAYOUT_OPTIONS, ...options };
  // 目标点本身也是障碍：卡片不能盖住任何一个编号圆点
  const pins: Box[] = targets.map(target => ({
    left: target.x - pinRadius,
    top: target.y - pinRadius,
    right: target.x + pinRadius,
    bottom: target.y + pinRadius,
  }));
  // 已放好的卡片按 gap 外扩后作为障碍，两张卡片之间至少留出 gap
  const placed: Box[] = [];
  const result: CardPlacement[] = [];

  for (const target of [...targets].sort(compareTargets)) {
    const { width, height } = sizes[target.id] ?? defaultSize;
    const rightX = target.x + offsetX;
    const leftX = target.x - offsetX - width;
    const upY = target.y - offsetY - height;
    const downY = target.y + offsetY;
    const preferLeft = rightX + width > bounds.right && leftX >= bounds.left;
    const preferDown = upY < bounds.top && downY + height <= bounds.bottom;
    const sides: CardSide[] = preferLeft ? ['left', 'right'] : ['right', 'left'];
    const directions: CardDirection[] = preferDown ? ['down', 'up'] : ['up', 'down'];
    const obstacles = [...placed, ...pins];

    let best: { box: Box; side: CardSide; direction: CardDirection; cost: number } | null = null;
    let order = 0;
    for (const side of sides) {
      for (const direction of directions) {
        const left = side === 'right' ? rightX : leftX;
        const top = direction === 'up' ? upY : downY;
        const start: Box = { left, top, right: left + width, bottom: top + height };
        const box = slideUntilFree(start, direction, obstacles);
        const overflow = overflowOf(box, bounds);
        const cost =
          (overflow > 0 ? OVERFLOW_COST + overflow : 0) +
          Math.abs(box.top - start.top) +
          (side === sides[0] ? 0 : SIDE_CHANGE_COST) +
          (direction === directions[0] ? 0 : DIRECTION_CHANGE_COST) +
          order * 0.001;
        order += 1;
        if (!best || cost < best.cost) best = { box, side, direction, cost };
      }
    }
    const { box, side, direction } = best!;
    placed.push({ left: box.left - gap, top: box.top - gap, right: box.right + gap, bottom: box.bottom + gap });
    result.push({
      id: target.id,
      x: box.left,
      y: box.top,
      width,
      height,
      side,
      direction,
      leader: {
        from: { x: target.x, y: target.y },
        to: {
          x: Math.min(Math.max(target.x, box.left), box.right),
          y: Math.min(Math.max(target.y, box.top), box.bottom),
        },
      },
    });
  }
  return result;
}
