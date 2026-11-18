import { expect, it } from 'vitest';
import { type CardPlacement, layoutCommentCards } from './card-layout';

const bounds = { left: 0, top: 0, right: 1000, bottom: 800 };
const size = { width: 200, height: 56 };
const options = { offsetX: 32, offsetY: 24, gap: 8, pinRadius: 14, defaultSize: size };

const separated = (a: CardPlacement, b: CardPlacement, gap: number): boolean =>
  a.x + a.width + gap <= b.x || b.x + b.width + gap <= a.x || a.y + a.height + gap <= b.y || b.y + b.height + gap <= a.y;

const coversPoint = (card: CardPlacement, x: number, y: number, radius: number): boolean =>
  card.x < x + radius && x - radius < card.x + card.width && card.y < y + radius && y - radius < card.y + card.height;

it('单张卡片默认放在目标右上方，引线从目标连到卡片左下角', () => {
  const [card] = layoutCommentCards([{ id: 'a', x: 400, y: 400 }], {}, bounds, options);
  expect(card).toMatchObject({ x: 432, y: 320, side: 'right', direction: 'up' });
  expect(card!.leader).toEqual({ from: { x: 400, y: 400 }, to: { x: 432, y: 376 } });
});

it('两张相邻的卡片自动错开，不重叠，也不盖住任何目标点', () => {
  const targets = [
    { id: 'a', x: 400, y: 400 },
    { id: 'b', x: 410, y: 420 },
  ];
  const cards = layoutCommentCards(targets, {}, bounds, options);
  expect(cards).toHaveLength(2);
  expect(separated(cards[0]!, cards[1]!, 8)).toBe(true);
  for (const card of cards) for (const target of targets) expect(coversPoint(card, target.x, target.y, 14)).toBe(false);
});

it('靠近右边缘时翻到左侧，靠近上边缘时翻到下方', () => {
  const [right] = layoutCommentCards([{ id: 'a', x: 950, y: 400 }], {}, bounds, options);
  expect(right).toMatchObject({ side: 'left', direction: 'up', x: 950 - 32 - 200 });
  const [top] = layoutCommentCards([{ id: 'a', x: 400, y: 30 }], {}, bounds, options);
  expect(top).toMatchObject({ side: 'right', direction: 'down', y: 54 });
});

it('相同输入得到相同输出，与目标的传入顺序无关', () => {
  const targets = [
    { id: 'b', x: 300, y: 300 },
    { id: 'a', x: 310, y: 300 },
    { id: 'c', x: 305, y: 320 },
  ];
  const first = layoutCommentCards(targets, { a: { width: 200, height: 72 } }, bounds, options);
  const again = layoutCommentCards([...targets].reverse(), { a: { width: 200, height: 72 } }, bounds, options);
  expect(again).toEqual(first);
});

it('大量卡片挤在一起时两两不重叠', () => {
  const targets = Array.from({ length: 40 }, (_, i) => ({ id: `t${i}`, x: 400 + (i % 5) * 12, y: 300 + Math.floor(i / 5) * 10 }));
  const cards = layoutCommentCards(targets, {}, bounds, options);
  expect(cards).toHaveLength(40);
  for (let i = 0; i < cards.length; i++) {
    for (let j = i + 1; j < cards.length; j++) expect(separated(cards[i]!, cards[j]!, 8)).toBe(true);
    for (const target of targets) expect(coversPoint(cards[i]!, target.x, target.y, 14)).toBe(false);
  }
});
