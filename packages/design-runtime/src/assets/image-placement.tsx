/** Restored application module; prepare first, initialize in original order. */
import {
  type Dynamic,
} from "../runtime-types";
import { CanvasWorkingStateFloorValue, isSvgFile } from "../canvas/working-state";
import { load_react_jsx_runtime } from "../dependencies";
import { maxDecodableImageBytes as maxClipboardImageBytes, isPlayableImage } from "../editor/clipboard/image-validation";
import { toModuleNamespace } from "../module-helpers";

var jsx_Gn: Dynamic;
var maxAnimatedGifPlacementBytes: Dynamic;
var maxCanvasImagePlacementBytes: Dynamic;
var CanvasImagePlacementError: Dynamic;
function imagePlacementRejectionReason(file?: Dynamic): Dynamic {
  return file.type === "image/gif" && file.size > maxAnimatedGifPlacementBytes
    ? `animated GIFs over ${maxAnimatedGifPlacementBytes >> 20} MB can't be placed`
    : file.size > maxCanvasImagePlacementBytes ||
        ((isSvgFile(file) || file.type === "image/gif") &&
          file.size > CanvasWorkingStateFloorValue)
      ? "too large to place here"
      : null;
}
async function validateCanvasPlacedImage(
  file?: Dynamic,
  decodeOptions?: Dynamic,
): Promise<Dynamic> {
  return (
    imagePlacementRejectionReason(file) ??
    ((await isPlayableImage(file, decodeOptions).catch(
      (): Dynamic => false,
    ))
      ? null
      : "not an image the editor can decode")
  );
}
export {
  CanvasImagePlacementError,
  imagePlacementRejectionReason,
  jsx_Gn,
  maxAnimatedGifPlacementBytes,
  maxCanvasImagePlacementBytes,
  validateCanvasPlacedImage,
};
export function installAssetsImagePlacement(): () => void {
  return () => {
    jsx_Gn = toModuleNamespace(
      load_react_jsx_runtime(),
      1,
    );
    maxAnimatedGifPlacementBytes = 2 * 1024 * 1024;
    maxCanvasImagePlacementBytes =
      maxClipboardImageBytes;
    CanvasImagePlacementError = class extends Error {};
  };
}
