/** Restored application module; prepare first, initialize in original order. */

function artboardsInReadingOrder<
  Board extends {
    x?: number;
    y?: number;
    h: number;
  },
>(boards: readonly Board[]): Board[] {
  let callback: (board: Board) => number = (board) => board.x ?? 0,
    getBoardTop: (board: Board) => number = (board) => board.y ?? 0,
    items: {
      bottom: number;
      mid: number;
      items: Board[];
    }[] = [];
  for (let value of [...boards].sort(
    (leftBoard, rightBoard) =>
      getBoardTop(leftBoard) - getBoardTop(rightBoard) ||
      callback(leftBoard) - callback(rightBoard),
  )) {
    let previousGroup = items[items.length - 1];
    previousGroup &&
    (getBoardTop(value) + value.h / 2 < previousGroup.bottom ||
      getBoardTop(value) < previousGroup.mid)
      ? (previousGroup.items.push(value),
        (previousGroup.bottom = Math.max(previousGroup.bottom, getBoardTop(value) + value.h)))
      : items.push({
          bottom: getBoardTop(value) + value.h,
          mid: getBoardTop(value) + value.h / 2,
          items: [value],
        });
  }
  return items.flatMap((group) =>
    group.items.sort(
      (leftBoard, rightBoard) =>
        callback(leftBoard) - callback(rightBoard) ||
        getBoardTop(leftBoard) - getBoardTop(rightBoard),
    ),
  );
}
export {
  artboardsInReadingOrder,
};
export function installExportReadingOrder(): () => void {
  return () => {};
}
