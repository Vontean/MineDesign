/** Restored application module; prepare first, initialize in original order. */
import {
  type Dynamic,
} from "../../runtime-types";

function deflateSizeBound(byteLength?: Dynamic): Dynamic {
  return (
    byteLength +
    Math.floor(byteLength / 4096) +
    Math.floor(byteLength / 16384) +
    Math.floor(byteLength / 33554432) +
    13
  );
}
function validateLosslessPicture(
  picture?: Dynamic,
  jpegSize?: Dynamic,
): Dynamic {
  if (typeof picture != "object" || picture === null)
    throw new Error("its lossless picture is not an object");
  if (
    !Number.isInteger(picture.width) ||
    !Number.isInteger(picture.height) ||
    picture.width !== jpegSize.width ||
    picture.height !== jpegSize.height
  )
    throw new Error(
      "its lossless picture is " +
        String(picture.width) +
        "\xD7" +
        String(picture.height) +
        " pixels but its JPEG is " +
        String(jpegSize.width) +
        "\xD7" +
        String(jpegSize.height),
    );
  let zlib: Dynamic = picture.zlib;
  if (
    Object.prototype.toString.call(zlib) !== "[object Uint8Array]" ||
    zlib.length < 8 ||
    zlib.length > deflateSizeBound(picture.width * picture.height * 3) ||
    (zlib[0] & 15) !== 8 ||
    zlib[0] >> 4 > 7 ||
    ((zlib[0] << 8) | zlib[1]) % 31 !== 0 ||
    (zlib[1] & 32) !== 0
  )
    throw new Error(
      "its lossless picture is not a zlib stream of its pixels",
    );
}
export {
  deflateSizeBound,
  validateLosslessPicture,
};
export function installExportPdfLossless(): () => void {
  return () => {};
}
