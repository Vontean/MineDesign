export interface JpegInfo {
  width: number;
  height: number;
  /** 颜色分量数：1 为灰度，3 为 RGB */
  components: number;
}

export function pixelsToPoints(pixels: number): number {
  return (pixels * 72) / 96;
}

/** 解码 JPEG 的 data URL；不是 JPEG 的 data URL 或 base64 无效时返回 undefined。 */
export function decodeJpegDataUrl(url: string): Uint8Array | undefined {
  const prefix = "data:image/jpeg;base64,";
  if (url.startsWith(prefix))
    try {
      return decodeBase64Bytes(url.slice(prefix.length));
    } catch {
      return undefined;
    }
}

export function decodeBase64Bytes(base64: string): Uint8Array {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index++) bytes[index] = binary.charCodeAt(index);
  return bytes;
}

/** 从 JPEG 字节读取尺寸与颜色分量数；只接受 8 位的灰度与 RGB，其余抛出带原因的错误。 */
export function readJpegDimensions(bytes: ArrayLike<number>): JpegInfo {
  if (bytes.length < 4 || bytes[0] !== 255 || bytes[1] !== 216)
    throw new Error("not a JPEG image (missing SOI marker)");
  let offset = 2;
  for (;;) {
    if (offset + 1 >= bytes.length) throw new Error("not a valid JPEG image (no frame header found)");
    if (bytes[offset] !== 255) throw new Error("not a valid JPEG image (corrupt marker stream)");
    // 标记前可以有多个 0xFF 填充
    let markerPos = offset + 1;
    while (markerPos < bytes.length && bytes[markerPos] === 255) markerPos++;
    if (markerPos >= bytes.length) throw new Error("not a valid JPEG image (truncated)");
    const marker = bytes[markerPos]!;
    // TEM 与 RSTn 没有长度字段
    if (marker === 1 || (marker >= 208 && marker <= 215)) {
      offset = markerPos + 1;
      continue;
    }
    // 遇到 EOI 或 SOS 仍没有帧头
    if (marker === 217 || marker === 218) throw new Error("not a valid JPEG image (no frame header found)");
    if (offset + 3 >= bytes.length || markerPos + 2 >= bytes.length)
      throw new Error("not a valid JPEG image (truncated)");
    const segmentLength = (bytes[markerPos + 1]! << 8) | bytes[markerPos + 2]!;
    if (segmentLength < 2 || markerPos + 1 + segmentLength > bytes.length)
      throw new Error("not a valid JPEG image (truncated segment)");
    // SOF0、SOF1、SOF2：基线、扩展顺序、渐进
    if (marker === 192 || marker === 193 || marker === 194) {
      if (segmentLength < 8) throw new Error("not a valid JPEG image (bad frame header)");
      const precision = bytes[markerPos + 3];
      const height = (bytes[markerPos + 4]! << 8) | bytes[markerPos + 5]!;
      const width = (bytes[markerPos + 6]! << 8) | bytes[markerPos + 7]!;
      const components = bytes[markerPos + 8];
      if (precision !== 8) throw new Error("unsupported JPEG (only 8-bit precision embeds)");
      if (width === 0 || height === 0) throw new Error("not a valid JPEG image (zero size)");
      if (components !== 1 && components !== 3)
        throw new Error(
          "unsupported JPEG color layout (" + String(components) + " components — only grayscale and RGB embed)",
        );
      return { width, height, components };
    }
    // 其余 SOFn（不含 DHT=196、JPG=200、DAC=204）是无法嵌入的变体
    if (marker >= 195 && marker <= 207 && marker !== 196 && marker !== 200 && marker !== 204)
      throw new Error("unsupported JPEG variant (not baseline or progressive)");
    offset = markerPos + 1 + segmentLength;
  }
}
