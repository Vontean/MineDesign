/** 评论标签文案：锚点的简短标题、详细描述，以及按字节预算截断。 */
import { uiMessage } from '@minedesign/contracts/ui-messages';
import { encodeArtboardSelectionPath } from '../collaboration/selection-paths';
import { classifyElementStyleKind } from '../editor/insert/element-kinds';
import { describeCommentAreaLocation, type CommentArea, type CommentRect } from './area-geometry';

export interface CommentArtboardRef {
  file: string;
  title?: string | null;
}

/** 评论里提到的元素：path 是元素编号，kind 是元素类别，text 是文字内容。 */
export interface CommentElementInfo {
  path: string | number;
  kind?: string | null;
  text?: string | null;
}

/** 区域覆盖到的一块画板：cov 是覆盖比例，part 是位置描述，els 是区域内的元素，total 是元素总数。 */
export interface CommentCoveredBoard {
  board: CommentArtboardRef;
  cov: number;
  part?: string | null;
  total?: number;
  els?: CommentElementInfo[];
}

/** 评论所在的对象（备注或设计稿里的标注）。 */
export interface CommentLabelObject {
  kind?: string;
  text?: string | null;
  rotate?: unknown;
  flipX?: unknown;
  flipY?: unknown;
}

export interface CommentPage {
  id: unknown;
  name: string;
}
export interface CanvasLabelAnchor {
  kind: 'canvas';
  pages?: CommentPage[] | null;
  pageKey?: unknown;
}
export interface NoteLabelAnchor {
  kind: 'note';
  note: { kind?: string; text?: string | null };
}
export interface ArtboardLabelAnchor {
  kind: 'artboard';
  board: CommentArtboardRef;
}
export interface ElementLabelAnchor {
  kind: 'el';
  board: CommentArtboardRef;
  el: { kind?: string | null; text?: string | null };
}
export type CommentLabelAnchor = CanvasLabelAnchor | NoteLabelAnchor | ArtboardLabelAnchor | ElementLabelAnchor;

export interface CommentTargetHint {
  canvas?: boolean;
  several?: boolean;
}

/** 评论组件实例里查视图元素的最小接口。 */
export interface CommentElementModel {
  viewEntries(ids: unknown[]): ({ kind: string; words(): string } | undefined)[];
}

export const commentLabelTextEncoder = new TextEncoder();
export const commentLabelByteLength = (text: string): number => commentLabelTextEncoder.encode(text).length;
export const quoteCommentLabelText = (text: string): string => (text ? ' "' + text + '"' : '');
export const commentBreadcrumbSeparator = ' › ';
export const commentAnchorInsetPixels = 16;
export const commentAnchorInsetFraction = 0.25;

/** 标注类型的显示名；多数走文案表，所以用 getter 取当前语言。 */
export const commentAnnotationKindLabels: Record<string, string> = {
  get title1() {
    return uiMessage('feedback.labels.title');
  },
  get rect() {
    return uiMessage('feedback.labels.rectangle');
  },
  get oval() {
    return uiMessage('feedback.labels.oval');
  },
  get line() {
    return uiMessage('feedback.labels.line');
  },
  get arrow() {
    return uiMessage('feedback.labels.arrow');
  },
  get pen() {
    return uiMessage('feedback.labels.drawing');
  },
  image: 'Picture',
};

/** 没有类型的是备注；表里没有的类型返回 undefined。 */
export const commentAnnotationKindLabel = (kind: string | undefined): string =>
  kind === undefined ? 'Note' : commentAnnotationKindLabels[kind];

export const formatCommentPercent = (fraction: number): string => String(Math.round(fraction * 100)) + '%';

/** "#编号 类别 "文字""；textLimit 为空时不带文字。 */
export const commentElementDetail = (element: CommentElementInfo, textLimit?: number | null): string =>
  '#' +
  element.path +
  ' ' +
  (element.kind === 'box' ? 'shape' : element.kind) +
  (textLimit == null ? '' : quoteCommentLabelText(shortenCommentLabelText(element.text, textLimit)));

/** 区域内的元素列表，最多 maxElements 个，其余写成"+N more"。 */
export const commentElementsDetail = (
  board: Pick<CommentCoveredBoard, 'els' | 'total'>,
  maxElements: number | undefined,
  textLimit: number | null,
): string => {
  const elements = board.els ?? [];
  const shown = elements.slice(0, maxElements);
  const hidden = (board.total ?? elements.length) - shown.length;
  const details = shown.map((element) => commentElementDetail(element, textLimit));
  hidden > 0 && details.push('+' + String(hidden) + ' more');
  return details.join(', ');
};

export const commentAreaPartLabel = (part?: string | null): string => (part ? ' (' + part + ')' : '');

/** 旋转和翻转的说明后缀，用于说明相对位置的参照。 */
export const commentObjectTransformSuffix = (object: CommentLabelObject): string => {
  const transform = [object.rotate ? 'turn' : '', object.flipX || object.flipY ? 'flip' : '']
    .filter(Boolean)
    .join(' and ');
  return ' from its top left' + (transform ? ', before its ' + transform : '');
};

export const commentObjectDetail = (object: CommentLabelObject, textLimit?: number | null): string =>
  commentAnnotationKindLabel(object.kind).toLowerCase() +
  (textLimit == null || object.text == null
    ? ''
    : quoteCommentLabelText(shortenCommentLabelText(object.text.trim().split('\n')[0], textLimit)));

/** 把孤立的代理项替换成 U+FFFD，避免编码出非法 UTF-8。 */
export function replaceUnpairedSurrogates(text: string): string {
  return text.replace(/[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?<![\uD800-\uDBFF])[\uDC00-\uDFFF]/g, '�');
}

/** 压缩空白、引号换成弯引号，超过 limit 个字符时截断加省略号。 */
export function shortenCommentLabelText(text: string | null | undefined, limit: number = 40): string {
  const chars = Array.from(replaceUnpairedSurrogates(text ?? '').replace(/\s+/g, ' ').trim().replace(/"/g, '’'));
  return chars.length <= limit ? chars.join('') : chars.slice(0, Math.max(0, limit - 1)).join('').trimEnd() + '…';
}

/** 按 UTF-8 字节数截断，超出时加省略号。 */
export function truncateCommentLabelBytes(text: string, maxBytes: number): string {
  if (commentLabelByteLength(text) <= maxBytes) return text;
  const chars = Array.from(text);
  let length = chars.length;
  while (length > 0 && commentLabelByteLength(chars.slice(0, length).join('').trimEnd() + '…') > maxBytes) length--;
  return chars.slice(0, length).join('').trimEnd() + '…';
}

/** 依次用 40、16 个字符和不带文字的写法，选第一个不超过 512 字节的；都超出就截断。 */
export function fitCommentDetailToByteBudget(format: (textLimit: number | null) => string): string {
  for (const textLimit of [40, 16, null]) {
    const detail = format(textLimit);
    if (commentLabelByteLength(detail) <= 512) return detail;
  }
  return truncateCommentLabelBytes(format(null), 512);
}

export function commentArtboardTitle(artboard: CommentArtboardRef): string {
  return replaceUnpairedSurrogates(artboard.title?.trim() || artboard.file.replace(/\.dc\.html$/, ''));
}

export function commentElementKindLabel(kind?: string | null): string {
  return kind === 'box' || kind === 'shape' ? 'shape' : kind == null || kind === 'other' ? 'element' : kind;
}

/** "类别 "文字""，总长不超过 128 字节（减去 reservedBytes）。 */
export function commentObjectShortLabel(kind: string, text: string | null | undefined, reservedBytes: number = 0): string {
  for (let limit = 40; limit >= 8; limit -= 8) {
    const label = kind + quoteCommentLabelText(shortenCommentLabelText(text, limit));
    if (commentLabelByteLength(label) <= 128 - reservedBytes) return label;
  }
  return truncateCommentLabelBytes(kind, 128 - reservedBytes);
}

/** 元素的类别与文字：优先取视图里的元素，否则按标签名推断。 */
export function describeCommentElement(
  model: CommentElementModel | null | undefined,
  target: { tid?: number | null; tag?: string; text?: string | null },
): { kind: string | null | undefined; text: string | null | undefined } {
  const entry = target.tid != null ? model?.viewEntries([target.tid])[0] : undefined;
  return entry
    ? { kind: entry.kind, text: entry.words() }
    : { kind: target.tag ? classifyElementStyleKind(target.tag) : null, text: target.text };
}

export function commentAnchorShortLabel(anchor: CommentLabelAnchor): string {
  if (anchor.kind === 'canvas') {
    const pages = anchor.pages ?? [];
    const page = pages.length > 1 ? (anchor.pageKey ? pages.find((item) => item.id === anchor.pageKey) : pages[0]) : undefined;
    const suffix = ' \xB7 canvas';
    return page
      ? truncateCommentLabelBytes(replaceUnpairedSurrogates(page.name), 128 - commentLabelByteLength(suffix)) + suffix
      : 'Canvas';
  }
  if (anchor.kind === 'note')
    return commentObjectShortLabel(commentAnnotationKindLabel(anchor.note.kind), (anchor.note.text ?? '').trim().split('\n')[0]);
  const title = commentArtboardTitle(anchor.board);
  return anchor.kind === 'artboard'
    ? truncateCommentLabelBytes(title, 128)
    : commentObjectShortLabel(
        truncateCommentLabelBytes(title, 128) + commentBreadcrumbSeparator + commentElementKindLabel(anchor.el.kind),
        anchor.el.text,
      );
}

/** 画板文件的显示路径：有选择路径编码时用编码。 */
export function commentFileLabel(file: string): string {
  return encodeArtboardSelectionPath(file) ?? replaceUnpairedSurrogates(file);
}

/** 区域覆盖画板的简短标题；一块画板时带位置和元素数，多块时列出名称并在超长时写"+N more"。 */
export function commentArtboardAreaShortLabel(artboards: CommentCoveredBoard[]): string {
  if (artboards.length === 1) {
    const only = artboards[0];
    const count = only.cov < 0.85 ? (only.total ?? only.els?.length ?? 0) : 0;
    const countText = count === 0 ? '' : ' \xB7 ' + String(count) + (count === 1 ? ' element' : ' elements');
    const tail = (only.cov < 0.85 ? commentAreaPartLabel(only.part) : '') + countText;
    return truncateCommentLabelBytes(commentArtboardTitle(only.board), 128 - commentLabelByteLength(tail)) + tail;
  }
  const names = artboards.map(
    (item) => commentArtboardTitle(item.board) + (item.cov < 0.85 ? commentAreaPartLabel(item.part) : ''),
  );
  for (let length = names.length; length >= 1; length--) {
    const more = length < names.length ? ' +' + String(names.length - length) + ' more' : '';
    const label = 'Artboards: ' + names.slice(0, length).join(', ') + more;
    if (commentLabelByteLength(label) <= 128) return label;
    if (length === 1) {
      const first = artboards[0];
      const part = first.cov < 0.85 ? commentAreaPartLabel(first.part) : '';
      return (
        truncateCommentLabelBytes(
          'Artboards: ' + commentArtboardTitle(first.board),
          128 - commentLabelByteLength(part + more),
        ) +
        part +
        more
      );
    }
  }
  return 'Artboards';
}

export function commentObjectPointDetail(
  object: CommentLabelObject,
  point?: { fx: number; fy: number } | null,
): string {
  const placement = point
    ? object.kind === 'line' || object.kind === 'arrow'
      ? ' at ' + formatCommentPercent(point.fx) + ' along from its start'
      : ' at ' +
        formatCommentPercent(point.fx) +
        ' across, ' +
        formatCommentPercent(point.fy) +
        ' down' +
        commentObjectTransformSuffix(object)
    : '';
  return fitCommentDetailToByteBudget((textLimit) => commentObjectDetail(object, textLimit) + placement);
}

export function commentObjectAreaShortLabel(object: CommentLabelObject, area: CommentArea): string {
  const location = describeCommentAreaLocation(area, (area.x1 - area.x0) * (area.y1 - area.y0));
  const suffix = location ? ' (' + location + ')' : '';
  return (
    commentObjectShortLabel(
      commentAnnotationKindLabel(object.kind),
      (object.text ?? '').trim().split('\n')[0],
      commentLabelByteLength(suffix),
    ) + suffix
  );
}

export function commentObjectAreaDetail(object: CommentLabelObject, area: CommentArea): string {
  const extent =
    (area.x1 - area.x0) * (area.y1 - area.y0) >= 0.85
      ? ' (whole)'
      : ': ' +
        formatCommentPercent(area.x0) +
        ' to ' +
        formatCommentPercent(area.x1) +
        ' across, ' +
        formatCommentPercent(area.y0) +
        ' to ' +
        formatCommentPercent(area.y1) +
        ' down' +
        commentObjectTransformSuffix(object);
  return fitCommentDetailToByteBudget((textLimit) => 'area over ' + commentObjectDetail(object, textLimit) + extent);
}

export function commentCanvasPointDetail(x: number, y: number): string {
  return 'canvas ' + String(Math.round(x)) + ',' + String(Math.round(y));
}

export function commentArtboardElementDetail(
  artboard: { file: string },
  element?: CommentElementInfo | null,
): string {
  const file = commentFileLabel(artboard.file);
  return fitCommentDetailToByteBudget((textLimit) =>
    element ? file + ': ' + commentElementDetail(element, textLimit) : file,
  );
}

/** 区域覆盖画板的详细描述，不超过 512 字节：先逐级收紧元素文字和个数，再减少画板数。 */
export function commentArtboardAreaDetail(artboards: CommentCoveredBoard[]): string {
  const describe = (textLimit: number | null, maxElements: number, withElements: boolean, boardCount: number): string => {
    const boards = artboards.slice(0, boardCount).map((item) => {
      const head = commentFileLabel(item.board.file) + ' (' + (item.cov >= 0.85 ? 'whole' : item.part || 'part') + ')';
      const elements =
        withElements && item.cov < 0.85 && (item.els?.length ?? 0) > 0
          ? ': ' + commentElementsDetail(item, maxElements, textLimit)
          : '';
      return head + elements;
    });
    const omitted = artboards.length - boardCount;
    return (
      'Area over ' +
      boards.join('; ') +
      (omitted > 0 ? '; +' + String(omitted) + (omitted === 1 ? ' board' : ' boards') : '')
    );
  };
  const levels: [number | null, number, boolean][] = [
    [40, 8, true],
    [16, 8, true],
    [null, 8, true],
    [null, 4, true],
    [null, 2, true],
    [null, 0, false],
  ];
  for (const [textLimit, maxElements, withElements] of levels) {
    const detail = describe(textLimit, maxElements, withElements, artboards.length);
    if (commentLabelByteLength(detail) <= 512) return detail;
  }
  for (let boardCount = artboards.length - 1; boardCount >= 1; boardCount--) {
    const detail = describe(null, 0, false, boardCount);
    if (commentLabelByteLength(detail) <= 512) return detail;
  }
  return fitCommentDetailToByteBudget(() => describe(null, 0, false, 1));
}

/** 画板上默认评论点：右上角往内缩，缩进取 16 屏幕像素与画板宽高 25% 中较小的。 */
export function defaultArtboardCommentPoint(box: { w: number; h: number }, scale?: number): { fx: number; fy: number } {
  const zoom = Number.isFinite(scale) && (scale as number) > 0 ? (scale as number) : 1;
  const width = Math.max(0, box.w) || 1;
  const height = Math.max(0, box.h) || 1;
  const inset = Math.min(commentAnchorInsetPixels / zoom, width * commentAnchorInsetFraction, height * commentAnchorInsetFraction);
  return { fx: 1 - inset / width, fy: inset / height };
}

export function commentSurfaceAriaLabel(surface: ArtboardLabelAnchor | CanvasLabelAnchor): string {
  if (surface.kind === 'artboard') return 'Comment on artboard ' + commentAnchorShortLabel(surface);
  const pages = surface.pages ?? [];
  const page = pages.length > 1 ? (surface.pageKey ? pages.find((item) => item.id === surface.pageKey) : pages[0]) : undefined;
  return 'Comment on the canvas' + (page ? ', page ' + page.name : '');
}

export function commentTargetKeyboardHint(target: CommentTargetHint): string {
  return [
    'Enter or Space comments on ' + (target.canvas ? 'the canvas' : 'this artboard'),
    ...(target.several ? ['Tab moves between artboards'] : []),
    'Escape leaves comment mode',
  ].join('; ');
}

export function isCommentTargetEvent(event: { target: unknown }): boolean {
  return event.target instanceof Element && event.target.hasAttribute('data-mega-comment-target');
}

/** 把区域限制在视口内，宽高至少 minSize。 */
export function clampCommentAreaToViewport(
  area: CommentRect,
  viewportWidth: number,
  viewportHeight: number,
  minSize: number = 8,
): CommentRect {
  const clamp = (amount: number, low: number, high: number): number => Math.max(low, Math.min(high, amount));
  const x = clamp(area.x, 0, Math.max(0, viewportWidth - minSize));
  const y = clamp(area.y, 0, Math.max(0, viewportHeight - minSize));
  const right = clamp(area.x + area.w, x + minSize, Math.max(viewportWidth, x + minSize));
  const bottom = clamp(area.y + area.h, y + minSize, Math.max(viewportHeight, y + minSize));
  return { x, y, w: right - x, h: bottom - y };
}
