/** Restored application module; prepare first, initialize in original order. */
import {
  type Dynamic,
} from "../runtime-types";

var sha256RoundConstants: Uint32Array;
var PlatformSha256TextEncoder: TextEncoder;
var PlatformSha256Encode: (text: string) => Uint8Array<ArrayBuffer>;
function sha256Fallback(message: string | Uint8Array): string {
  let bytes = typeof message == "string" ? PlatformSha256Encode(message) : message,
    byteLength = bytes.length,
    paddedLength = ((byteLength + 9 + 63) >> 6) << 6,
    paddedBytes = new Uint8Array(paddedLength);
  paddedBytes.set(bytes);
  paddedBytes[byteLength] = 128;
  let paddedView = new DataView(paddedBytes.buffer);
  paddedView.setUint32(paddedLength - 8, Math.floor(byteLength / 536870912), false);
  paddedView.setUint32(paddedLength - 4, (byteLength << 3) >>> 0, false);
  let hashState = new Uint32Array([
      1779033703, 3144134277, 1013904242, 2773480762, 1359893119, 2600822924,
      528734635, 1541459225,
    ]),
    schedule = new Uint32Array(64);
  for (let blockOffset = 0; blockOffset < paddedLength; blockOffset += 64) {
    for (let wordIndex = 0; wordIndex < 16; wordIndex++)
      schedule[wordIndex] = paddedView.getUint32(blockOffset + wordIndex * 4, false);
    for (let wordIndex = 16; wordIndex < 64; wordIndex++) {
      let earlierWord = schedule[wordIndex - 15]!,
        recentWord = schedule[wordIndex - 2]!,
        smallSigma0 =
          ((earlierWord >>> 7) | (earlierWord << 25)) ^
          ((earlierWord >>> 18) | (earlierWord << 14)) ^
          (earlierWord >>> 3),
        smallSigma1 =
          ((recentWord >>> 17) | (recentWord << 15)) ^
          ((recentWord >>> 19) | (recentWord << 13)) ^
          (recentWord >>> 10);
      schedule[wordIndex] =
        (schedule[wordIndex - 16]! + smallSigma0 + schedule[wordIndex - 7]! + smallSigma1) | 0;
    }
    let a = hashState[0]!,
      b = hashState[1]!,
      c = hashState[2]!,
      d = hashState[3]!,
      e = hashState[4]!,
      f = hashState[5]!,
      g = hashState[6]!,
      h = hashState[7]!;
    for (let round = 0; round < 64; round++) {
      let bigSigma1 =
          ((e >>> 6) | (e << 26)) ^
          ((e >>> 11) | (e << 21)) ^
          ((e >>> 25) | (e << 7)),
        choose = (e & f) ^ (~e & g),
        roundSum =
          (h +
            bigSigma1 +
            choose +
            sha256RoundConstants[round]! +
            schedule[round]!) |
          0,
        bigSigma0 =
          ((a >>> 2) | (a << 30)) ^
          ((a >>> 13) | (a << 19)) ^
          ((a >>> 22) | (a << 10)),
        majority = (a & b) ^ (a & c) ^ (b & c),
        majoritySum = (bigSigma0 + majority) | 0;
      h = g;
      g = f;
      f = e;
      e = (d + roundSum) | 0;
      d = c;
      c = b;
      b = a;
      a = (roundSum + majoritySum) | 0;
    }
    hashState[0] = (hashState[0]! + a) | 0;
    hashState[1] = (hashState[1]! + b) | 0;
    hashState[2] = (hashState[2]! + c) | 0;
    hashState[3] = (hashState[3]! + d) | 0;
    hashState[4] = (hashState[4]! + e) | 0;
    hashState[5] = (hashState[5]! + f) | 0;
    hashState[6] = (hashState[6]! + g) | 0;
    hashState[7] = (hashState[7]! + h) | 0;
  }
  let digestHex = "";
  for (let wordIndex = 0; wordIndex < 8; wordIndex++)
    digestHex += (hashState[wordIndex]! >>> 0).toString(16).padStart(8, "0");
  return digestHex;
}
async function sha256(
  message: string | Uint8Array<ArrayBuffer>,
): Promise<string> {
  let bytes = typeof message == "string" ? PlatformSha256Encode(message) : message,
    subtleCrypto = globalThis.crypto?.subtle;
  if (typeof subtleCrypto?.digest == "function" && bytes.length > 4096)
    try {
      let digest = new Uint8Array(await subtleCrypto.digest("SHA-256", bytes)),
        digestHex = "";
      for (let byte of digest) digestHex += byte.toString(16).padStart(2, "0");
      return digestHex;
    } catch {}
  return sha256Fallback(bytes);
}
export {
  PlatformSha256Encode,
  PlatformSha256TextEncoder,
  sha256,
  sha256Fallback,
  sha256RoundConstants,
};
export function installPlatformSha256(): () => void {
  return () => {
    sha256RoundConstants = new Uint32Array([
      1116352408, 1899447441, 3049323471, 3921009573, 961987163, 1508970993,
      2453635748, 2870763221, 3624381080, 310598401, 607225278, 1426881987,
      1925078388, 2162078206, 2614888103, 3248222580, 3835390401, 4022224774,
      264347078, 604807628, 770255983, 1249150122, 1555081692, 1996064986,
      2554220882, 2821834349, 2952996808, 3210313671, 3336571891, 3584528711,
      113926993, 338241895, 666307205, 773529912, 1294757372, 1396182291,
      1695183700, 1986661051, 2177026350, 2456956037, 2730485921, 2820302411,
      3259730800, 3345764771, 3516065817, 3600352804, 4094571909, 275423344,
      430227734, 506948616, 659060556, 883997877, 958139571, 1322822218,
      1537002063, 1747873779, 1955562222, 2024104815, 2227730452, 2361852424,
      2428436474, 2756734187, 3204031479, 3329325298,
    ]);
    PlatformSha256TextEncoder = new TextEncoder();
    PlatformSha256Encode = (text?: Dynamic): Dynamic =>
      PlatformSha256TextEncoder.encode(text);
  };
}
