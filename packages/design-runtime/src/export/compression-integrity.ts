import type { OwnedBytes } from "../contracts/export";
/** Restored application module; prepare first, initialize in original order. */
import { encodeBinaryBase64 } from "./standalone-html";

var exportIntegrityHashAlgorithms: Readonly<
  Record<string, string | undefined>
>;
async function gzipExportAsset(bytes: OwnedBytes): Promise<OwnedBytes> {
  let value = new CompressionStream("gzip"),
    writer = value.writable.getWriter();
  writer.write(bytes);
  writer.close();
  let reader = value.readable.getReader(),
    items: OwnedBytes[] = [],
    index = 0;
  for (;;) {
    const {
      done: isDone,
      value: compressedChunk,
    }: ReadableStreamReadResult<OwnedBytes> = await reader.read();
    if (isDone) break;
    items.push(compressedChunk);
    index += compressedChunk.length;
  }
  let compressedBytes = new Uint8Array(index),
    writeOffset = 0;
  for (let chunk of items) {
    compressedBytes.set(chunk, writeOffset);
    writeOffset += chunk.length;
  }
  return compressedBytes;
}
async function verifyExportAssetIntegrity(
  bytes: OwnedBytes,
  integrity: string,
): Promise<boolean> {
  let value = integrity.indexOf("-"),
    hashAlgorithm = exportIntegrityHashAlgorithms[integrity.slice(0, value)];
  if (!hashAlgorithm) return false;
  let digest = await crypto.subtle.digest(hashAlgorithm, bytes);
  return (
    encodeBinaryBase64(new Uint8Array(digest)) ===
    integrity.slice(value + 1)
  );
}
export {
  exportIntegrityHashAlgorithms,
  gzipExportAsset,
  verifyExportAssetIntegrity,
};
export function installExportCompressionIntegrity(): () => void {
  return () => {
    exportIntegrityHashAlgorithms = {
      sha256: "SHA-256",
      sha384: "SHA-384",
      sha512: "SHA-512",
    };
  };
}
