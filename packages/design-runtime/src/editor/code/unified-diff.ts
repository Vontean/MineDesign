/** Restored application module; prepare first, initialize in original order. */
import {
  type Dynamic,
} from "../../runtime-types";

function utf16SafeSlice(
  text?: Dynamic,
  start?: Dynamic,
  end?: Dynamic,
): Dynamic {
  let sliceStart: Dynamic = end === undefined ? 0 : start,
    sliceEnd: Dynamic = end === undefined ? start : end;
  if (sliceEnd >= text.length) return text.slice(sliceStart);
  if (sliceEnd <= 0) return "";
  let lastCode: Dynamic = text.charCodeAt(sliceEnd - 1);
  lastCode >= 55296 && lastCode <= 56319 && sliceEnd--;
  return text.slice(sliceStart, sliceEnd);
}
function diffLines(oldLines?: Dynamic, newLines?: Dynamic): Dynamic {
  let oldLength: Dynamic = oldLines.length,
    newLength: Dynamic = newLines.length,
    maxEdits: Dynamic = oldLength + newLength,
    offset: Dynamic = maxEdits,
    furthestX: Dynamic = new Int32Array(2 * maxEdits + 1),
    trace: Dynamic = [],
    editCount: Dynamic = -1;
  e: for (let index: Dynamic = 0; index <= maxEdits; index++) {
    trace.push(furthestX.slice());
    for (let diagonal: Dynamic = -index; diagonal <= index; diagonal += 2) {
      let x: Dynamic =
          diagonal === -index ||
          (diagonal !== index &&
            furthestX[offset + diagonal - 1] < furthestX[offset + diagonal + 1])
            ? furthestX[offset + diagonal + 1]
            : furthestX[offset + diagonal - 1] + 1,
        y: Dynamic = x - diagonal;
      for (
        ;
        x < oldLength &&
        y < newLength &&
        oldLines[x] === newLines[y];

      ) {
        x++;
        y++;
      }
      furthestX[offset + diagonal] = x;
      if (x >= oldLength && y >= newLength) {
        editCount = index;
        break e;
      }
    }
  }
  let script: Dynamic = [],
    oldIndex: Dynamic = oldLength,
    newIndex: Dynamic = newLength;
  for (let editStep: Dynamic = editCount; editStep > 0; editStep--) {
    let previousFurthest: Dynamic = trace[editStep],
      currentDiagonal: Dynamic = oldIndex - newIndex,
      isInsert: Dynamic =
        currentDiagonal === -editStep ||
        (currentDiagonal !== editStep &&
          previousFurthest[offset + currentDiagonal - 1] < previousFurthest[offset + currentDiagonal + 1]),
      previousDiagonal: Dynamic = isInsert ? currentDiagonal + 1 : currentDiagonal - 1,
      previousX: Dynamic = previousFurthest[offset + previousDiagonal],
      previousY: Dynamic = previousX - previousDiagonal;
    for (; oldIndex > previousX && newIndex > previousY; ) {
      script.push({
        tag: " ",
        line: oldLines[--oldIndex],
      });
      newIndex--;
    }
    isInsert
      ? script.push({
          tag: "+",
          line: newLines[--newIndex],
        })
      : script.push({
          tag: "-",
          line: oldLines[--oldIndex],
        });
  }
  for (; oldIndex > 0 && newIndex > 0; ) {
    script.push({
      tag: " ",
      line: oldLines[--oldIndex],
    });
    newIndex--;
  }
  for (; oldIndex > 0; )
    script.push({
      tag: "-",
      line: oldLines[--oldIndex],
    });
  for (; newIndex > 0; )
    script.push({
      tag: "+",
      line: newLines[--newIndex],
    });
  script.reverse();
  return script;
}
function formatUnifiedDiff(
  oldText?: Dynamic,
  newText?: Dynamic,
  contextLines: Dynamic = 5,
  maxLength: Dynamic = 2e4,
  withHunkHeaders: Dynamic = false,
): Dynamic {
  if (oldText === newText) return "";
  let diff: Dynamic = diffLines(
      oldText.split(`
`),
      newText.split(`
`),
    ),
    keepMask: Dynamic = new Uint8Array(diff.length);
  for (let lineIndex: Dynamic = 0; lineIndex < diff.length; lineIndex++)
    diff[lineIndex].tag !== " " && (keepMask[lineIndex] = 1);
  if (!keepMask.some(Boolean)) return "";
  for (let lineIndex: Dynamic = 0; lineIndex < diff.length; lineIndex++)
    if (diff[lineIndex].tag !== " ")
      for (
        let windowIndex: Dynamic = Math.max(0, lineIndex - contextLines);
        windowIndex <= Math.min(diff.length - 1, lineIndex + contextLines);
        windowIndex++
      )
        keepMask[windowIndex] = 1;
  let oldLineNumbers: Dynamic = [],
    newLineNumbers: Dynamic = [],
    oldLineNumber: Dynamic = 1,
    newLineNumber: Dynamic = 1;
  for (let entry of diff as Dynamic) {
    oldLineNumbers.push(oldLineNumber);
    newLineNumbers.push(newLineNumber);
    entry.tag !== "+" && oldLineNumber++;
    entry.tag !== "-" && newLineNumber++;
  }
  let outputLines: Dynamic = [],
    isInHunk: Dynamic = false,
    hunkStart: Dynamic = 0,
    hunkInsertAt: Dynamic = 0,
    insertHunkHeader: Dynamic = (hunkEnd?: Dynamic): Dynamic => {
      let oldCount: Dynamic = 0,
        newCount: Dynamic = 0;
      for (let hunkLineIndex: Dynamic = hunkStart; hunkLineIndex <= hunkEnd; hunkLineIndex++) {
        diff[hunkLineIndex].tag !== "+" && oldCount++;
        diff[hunkLineIndex].tag !== "-" && newCount++;
      }
      outputLines.splice(
        hunkInsertAt,
        0,
        `@@ -${oldLineNumbers[hunkStart]},${oldCount} +${newLineNumbers[hunkStart]},${newCount} @@`,
      );
    };
  for (let lineIndex: Dynamic = 0; lineIndex < diff.length; lineIndex++) {
    if (!keepMask[lineIndex]) {
      isInHunk &&
        (withHunkHeaders ? insertHunkHeader(lineIndex - 1) : outputLines.push("  \u2026"),
        (isInHunk = false));
      continue;
    }
    isInHunk ||
      (withHunkHeaders && outputLines.length > 0 && outputLines.push(""),
      (hunkStart = lineIndex),
      (hunkInsertAt = outputLines.length));
    isInHunk = true;
    outputLines.push(diff[lineIndex].tag + " " + diff[lineIndex].line);
  }
  isInHunk && withHunkHeaders && insertHunkHeader(diff.length - 1);
  let output: Dynamic = outputLines.join(`
`);
  output.length > maxLength &&
    (output =
      utf16SafeSlice(output, maxLength - 15) +
      `
\u2026 (truncated)`);
  return output;
}
export {
  diffLines,
  formatUnifiedDiff,
  utf16SafeSlice,
};
export function installEditorCodeUnifiedDiff(): () => void {
  return () => {};
}
