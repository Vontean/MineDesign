import type { StoredZipEntry, OwnedBytes } from "../contracts/export";

/** CRC-32（多项式 0xEDB88320）的查表。 */
export const zipCrc32Table: Uint32Array = (() => {
  const table = new Uint32Array(256);
  for (let index = 0; index < 256; index++) {
    let value = index;
    for (let bit = 0; bit < 8; bit++) value = value & 1 ? 3988292384 ^ (value >>> 1) : value >>> 1;
    table[index] = value >>> 0;
  }
  return table;
})();

export function zipCrc32(bytes: Uint8Array): number {
  let crc = 4294967295;
  for (let index = 0; index < bytes.length; index++)
    crc = zipCrc32Table[(crc ^ bytes[index]!) & 255]! ^ (crc >>> 8);
  return (crc ^ 4294967295) >>> 0;
}

/** 生成不压缩（stored）的 zip；所有条目共用调用时刻作为修改时间，文件名按 UTF-8 编码。 */
export function createStoredZip(entries: readonly StoredZipEntry[]): Blob {
  const encoder = new TextEncoder();
  const localFileParts: OwnedBytes[] = [];
  const centralDirectoryParts: OwnedBytes[] = [];
  let archiveOffset = 0;
  const now = new Date();
  const dosTime = (now.getHours() << 11) | (now.getMinutes() << 5) | (now.getSeconds() >> 1);
  const dosDate = ((now.getFullYear() - 1980) << 9) | ((now.getMonth() + 1) << 5) | now.getDate();
  for (const entry of entries) {
    const name = encoder.encode(entry.name);
    const data = typeof entry.data == "string" ? encoder.encode(entry.data) : entry.data;
    const crc = zipCrc32(data);
    // 本地文件头，30 字节
    const local = new DataView(new ArrayBuffer(30));
    local.setUint32(0, 67324752, true);
    local.setUint16(4, 20, true);
    local.setUint16(6, 2048, true);
    local.setUint16(8, 0, true);
    local.setUint16(10, dosTime, true);
    local.setUint16(12, dosDate, true);
    local.setUint32(14, crc, true);
    local.setUint32(18, data.length, true);
    local.setUint32(22, data.length, true);
    local.setUint16(26, name.length, true);
    local.setUint16(28, 0, true);
    localFileParts.push(new Uint8Array(local.buffer), name, data);
    // 中央目录项，46 字节
    const central = new DataView(new ArrayBuffer(46));
    central.setUint32(0, 33639248, true);
    central.setUint16(4, 20, true);
    central.setUint16(6, 20, true);
    central.setUint16(8, 2048, true);
    central.setUint16(10, 0, true);
    central.setUint16(12, dosTime, true);
    central.setUint16(14, dosDate, true);
    central.setUint32(16, crc, true);
    central.setUint32(20, data.length, true);
    central.setUint32(24, data.length, true);
    central.setUint16(28, name.length, true);
    central.setUint16(30, 0, true);
    central.setUint16(32, 0, true);
    central.setUint16(34, 0, true);
    central.setUint16(36, 0, true);
    central.setUint32(38, 0, true);
    central.setUint32(42, archiveOffset, true);
    centralDirectoryParts.push(new Uint8Array(central.buffer), name);
    archiveOffset += 30 + name.length + data.length;
  }
  const centralSize = centralDirectoryParts.reduce((total, part) => total + part.length, 0);
  // 目录结束记录，22 字节
  const end = new DataView(new ArrayBuffer(22));
  end.setUint32(0, 101010256, true);
  end.setUint16(4, 0, true);
  end.setUint16(6, 0, true);
  end.setUint16(8, entries.length, true);
  end.setUint16(10, entries.length, true);
  end.setUint32(12, centralSize, true);
  end.setUint32(16, archiveOffset, true);
  end.setUint16(20, 0, true);
  return new Blob([...localFileParts, ...centralDirectoryParts, new Uint8Array(end.buffer)], {
    type: "application/zip",
  });
}
