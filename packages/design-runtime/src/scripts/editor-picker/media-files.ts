import type { Dynamic } from "../../runtime-types";

export function isMediaFile(
  this: Dynamic,
  mediaType?: Dynamic,
  fileName?: Dynamic,
  ..._unusedArgs: Dynamic[]
): Dynamic {
  mediaType = mediaType || "";
  return mediaType === ""
    ? String(fileName || "")
        .slice(-4)
        .toLowerCase() === ".mov"
    : mediaType.indexOf("image/") === 0 || mediaType.indexOf("video/") === 0;
}
