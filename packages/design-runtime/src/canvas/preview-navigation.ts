/** 预览中的画板翻页：可打印画板的顺序与相邻画板，以及预览里的交互元素判断。 */

/** 画板的最小描述；frameless 为 true 的画板不参与翻页。 */
export interface PrintableArtboardLike {
  file: unknown;
  frameless?: unknown;
}

/** 画板在可打印画板中的位置。 */
export interface PrintableArtboardPosition {
  index: number;
  count: number;
}

export type AdjacentPrintableArtboard<T> = { artboard: T } & Partial<PrintableArtboardPosition>;

/** 预览中的这些元素自己处理键盘与指针，翻页等画布快捷键要让开。 */
export const interactivePreviewSelector =
  "input,textarea,select,video,audio,canvas,[role=application],[role=scrollbar],[aria-roledescription=carousel],[aria-roledescription=slide],[role=textbox],[role=searchbox],[role=combobox],[role=spinbutton],[role=slider],[role=radiogroup],[role=radio],[role=tablist],[role=tab],[role=toolbar],[role=menu],[role=menubar],[role=menuitem],[role=menuitemradio],[role=menuitemcheckbox],[role=listbox],[role=option],[role=tree],[role=treegrid],[role=grid]";

/** 预览窗口的控制接口，withClosedPreview 靠它关闭并恢复预览。 */
export interface PreviewSession<State> {
  current(): State | null;
  leave(): void;
  laidOut(): Promise<unknown>;
  mayReopen(state: State): boolean;
  reopen(state: State): Promise<unknown>;
}

export function printableArtboards<T extends PrintableArtboardLike>(artboards: T[]): T[] {
  return artboards.filter((artboard) => artboard.frameless !== true);
}

/** 画板在可打印画板中的序号与总数；找不到时为 null。 */
export function printableArtboardIndex(
  artboards: PrintableArtboardLike[],
  file: unknown,
): PrintableArtboardPosition | null {
  const printable = printableArtboards(artboards);
  const index = printable.findIndex((artboard) => artboard.file === file);
  return index < 0
    ? null
    : {
        index,
        count: printable.length,
      };
}

/** 沿 direction（1 或 -1）找下一个可打印画板；到头或当前画板不在列表里时为 null。 */
export function adjacentPrintableArtboard<T extends PrintableArtboardLike>(
  artboards: T[],
  currentFile: unknown,
  direction: number,
): AdjacentPrintableArtboard<T> | null {
  const currentIndex = artboards.findIndex((artboard) => artboard.file === currentFile);
  if (currentIndex < 0) return null;
  for (
    let i = currentIndex + direction;
    i >= 0 && i < artboards.length;
    i += direction
  ) {
    const candidate = artboards[i];
    if (candidate.frameless === true) continue;
    const position = printableArtboardIndex(artboards, candidate.file);
    return {
      artboard: candidate,
      ...position,
    };
  }
  return null;
}

export function isInteractivePreviewTarget(target: unknown): boolean {
  const element = target as Pick<HTMLElement, "closest" | "isContentEditable"> | null | undefined;
  return element == null || typeof element.closest != "function"
    ? false
    : element.isContentEditable === true ||
        element.closest(interactivePreviewSelector) != null;
}

/** 先关闭预览再执行 task，结束后按需恢复预览。 */
export async function withClosedPreview<State, Result>(
  preview: PreviewSession<State>,
  task: () => Result | Promise<Result>,
): Promise<Result> {
  const state = preview.current();
  if (state === null) return task();
  preview.leave();
  await preview.laidOut();
  try {
    return await task();
  } finally {
    preview.mayReopen(state) && (await preview.reopen(state));
  }
}
