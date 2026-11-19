/** Restored application module; prepare first, initialize in original order. */
import {
  type Dynamic,
} from "../../runtime-types";

function splitGridTracks(value?: Dynamic): Dynamic {
  let tracks: Dynamic = [],
    parenDepth: Dynamic = 0,
    text: Dynamic = "";
  for (let char of value as Dynamic) {
    char === "("
      ? parenDepth++
      : char === ")" && (parenDepth = Math.max(0, parenDepth - 1));
    parenDepth === 0 && /\s/.test(char)
      ? (text && tracks.push(text), (text = ""))
      : (text += char);
  }
  text && tracks.push(text);
  return tracks;
}
function parseEqualGridColumns(gridTemplate?: Dynamic): Dynamic {
  let trimmed: Dynamic = (gridTemplate ?? "").trim();
  if (!trimmed || /^none$/i.test(trimmed)) return null;
  let repeatMatch: Dynamic =
    /^repeat\(\s*(\d{1,3})\s*,\s*(?:minmax\(\s*0(?:px)?\s*,\s*1fr\s*\)|1fr)\s*\)$/i.exec(
      trimmed,
    );
  if (repeatMatch) {
    let count: Dynamic = parseInt(repeatMatch[1], 10);
    return count >= 1 ? count : null;
  }
  let tracks: Dynamic = splitGridTracks(trimmed);
  if (tracks.length === 0) return null;
  let toLowerCase: Dynamic = (track?: Dynamic): Dynamic => track.toLowerCase(),
    firstTrack: Dynamic = toLowerCase(tracks[0]),
    compactFirstTrack: Dynamic = firstTrack.replace(/\s+/g, "");
  return /^(?:minmax\(0(?:px)?,1fr\)|[\d.]+(?:px|fr|%|em|rem))$/.test(
    compactFirstTrack,
  ) &&
    tracks.every((track?: Dynamic): Dynamic => toLowerCase(track) === firstTrack)
    ? tracks.length
    : null;
}
function serializeEqualGridColumns(count?: Dynamic): Dynamic {
  return `repeat(${Math.max(1, Math.round(count))}, minmax(0, 1fr))`;
}
export {
  parseEqualGridColumns,
  serializeEqualGridColumns,
  splitGridTracks,
};
export function installEditorCssGrid(): () => void {
  return () => {};
}
