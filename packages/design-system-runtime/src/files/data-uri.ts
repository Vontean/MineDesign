import type { FileData } from "../contracts/files-core";
import { parseDataUriHeader } from "../model/file-policy";

export const BASE64_ALPHABET =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
/** 每次交给 btoa 的字节数，需是 3 的倍数，避免中间出现填充符 */
export const BASE64_ENCODE_CHUNK_BYTES = 24576;

/** 分块编码，避免一次展开超大数组触发参数个数上限 */
export function encodeBytesBase64(bytes: Uint8Array<ArrayBufferLike>) {
  let base64 = "";
  for (
    let offset = 0;
    offset < bytes.length;
    offset += BASE64_ENCODE_CHUNK_BYTES
  ) {
    base64 += btoa(
      String.fromCharCode.apply(
        null,
        bytes.subarray(
          offset,
          offset + BASE64_ENCODE_CHUNK_BYTES,
        ) as unknown as number[],
      ),
    );
  }
  return base64;
}

/** 宽松解码：丢弃字母表外的字符，缺失的填充按长度推断 */
export function decodeBytesBase64(text: string) {
  const base64 = text.replace(/[^A-Za-z0-9+/]/g, "");
  const bytes = new Uint8Array(Math.floor((base64.length * 3) / 4));
  let written = 0;
  for (let offset = 0; offset + 1 < base64.length; offset += 4) {
    const first = BASE64_ALPHABET.indexOf(base64[offset]);
    const second = BASE64_ALPHABET.indexOf(base64[offset + 1]);
    const third =
      offset + 2 < base64.length
        ? BASE64_ALPHABET.indexOf(base64[offset + 2])
        : -1;
    const fourth =
      offset + 3 < base64.length
        ? BASE64_ALPHABET.indexOf(base64[offset + 3])
        : -1;
    bytes[written++] = (first << 2) | (second >> 4);
    if (third >= 0) {
      bytes[written++] = ((second & 15) << 4) | (third >> 2);
    }
    if (fourth >= 0) {
      bytes[written++] = ((third & 3) << 6) | fourth;
    }
  }
  return bytes.subarray(0, written);
}

export function bytesToFileDataUri(
  bytes: Uint8Array<ArrayBufferLike>,
  mime: string,
): string {
  return "data:" + mime + ";base64," + encodeBytesBase64(bytes);
}

/** 解析 data URI；头部不合法或百分号编码有误时返回 null */
export function decodeHeldFileDataUri(dataUri: string): FileData | null {
  const header = parseDataUriHeader(dataUri);
  if (header === null) {
    return null;
  }
  const payload = dataUri.slice(header.payloadOffset);
  if (header.base64) {
    return {
      bytes: decodeBytesBase64(payload),
      type: header.mime,
    };
  }
  try {
    return {
      bytes: new TextEncoder().encode(decodeURIComponent(payload)),
      type: header.mime,
    };
  } catch {
    return null;
  }
}
