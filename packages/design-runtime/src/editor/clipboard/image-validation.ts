/** Restored application module; prepare first, initialize in original order. */
import {
  type Dynamic,
} from "../../runtime-types";

var ClipboardImageValidationLimit: Dynamic;
var maxTotalPixels: Dynamic;
var ClipboardImageValidationSubscribers: Dynamic;
var ClipboardImageValidationScriptIframeObjectSet: Dynamic;
var ClipboardImageValidationHandler: Dynamic;
var ClipboardImageValidationFromCharCode: Dynamic;
var ClipboardImageValidationResolvedValue: Dynamic;
var ClipboardImageValidationDecode: Dynamic;
var ClipboardImageValidationDecode_2: Dynamic;
var ClipboardImageValidationNow: Dynamic;
var ClipboardImageValidationSinceSpentMsConfig: Dynamic;
var spendWindowMs: Dynamic;
var maxSpentMs: Dynamic;
var maxPlainDataUrls: Dynamic;
var ClipboardImageValidationConstant: Dynamic;
var ClipboardImageValidationPattern: Dynamic;
var ClipboardImageValidationIso2022JpReplacementShiftJisSet: Dynamic;
var ClipboardImageValidationCharsetPattern: Dynamic;
var maxDecodableImageBytes: Dynamic;
function readRasterImagePixels(bytes?: Dynamic): Dynamic {
  let readUint16BE: Dynamic = (offset?: Dynamic): Dynamic =>
      (bytes[offset] << 8) | bytes[offset + 1],
    readUint16LE: Dynamic = (offset?: Dynamic): Dynamic =>
      bytes[offset] | (bytes[offset + 1] << 8),
    readUint24LE: Dynamic = (offset?: Dynamic): Dynamic =>
      bytes[offset] | (bytes[offset + 1] << 8) | (bytes[offset + 2] << 16),
    readUint32BE: Dynamic = (offset?: Dynamic): Dynamic =>
      ((bytes[offset] << 24) |
        (bytes[offset + 1] << 16) |
        (bytes[offset + 2] << 8) |
        bytes[offset + 3]) >>>
      0,
    readUint32LE: Dynamic = (offset?: Dynamic): Dynamic =>
      (bytes[offset] |
        (bytes[offset + 1] << 8) |
        (bytes[offset + 2] << 16) |
        (bytes[offset + 3] << 24)) >>>
      0,
    matchesAscii: Dynamic = (offset?: Dynamic, text?: Dynamic): Dynamic =>
      offset + text.length <= bytes.length &&
      [...text].every(
        (char?: Dynamic, charIndex?: Dynamic): Dynamic =>
          bytes[offset + charIndex] === char.charCodeAt(0),
      );
  if (
    bytes.length >= 24 &&
    bytes[0] === 137 &&
    matchesAscii(1, "PNG") &&
    readUint32BE(4) === 218765834 &&
    matchesAscii(12, "IHDR")
  )
    return readUint32BE(16) * readUint32BE(20);
  if (bytes.length >= 10 && matchesAscii(0, "GIF8")) {
    let width: Dynamic = readUint16LE(6),
      height: Dynamic = readUint16LE(8),
      frameCount: Dynamic = 0,
      skipSubBlocks: Dynamic = (offset?: Dynamic): Dynamic => {
        let cursor: Dynamic = offset;
        for (; cursor < bytes.length && bytes[cursor] > 0; )
          cursor += bytes[cursor] + 1;
        return cursor + 1;
      },
      position: Dynamic =
        13 + (bytes[10] & 128 ? 3 << ((bytes[10] & 7) + 1) : 0);
    for (; position < bytes.length && bytes[position] !== 59; ) {
      if (bytes[position] === 33) {
        position = skipSubBlocks(position + 2);
        continue;
      }
      if (bytes[position] !== 44 || position + 10 > bytes.length) return;
      width = Math.max(
        width,
        readUint16LE(position + 1) + readUint16LE(position + 5),
      );
      height = Math.max(
        height,
        readUint16LE(position + 3) + readUint16LE(position + 7),
      );
      frameCount += 1;
      position +=
        10 +
        (bytes[position + 9] & 128 ? 3 << ((bytes[position + 9] & 7) + 1) : 0);
      position = skipSubBlocks(position + 1);
    }
    return frameCount > 0 ? width * height : undefined;
  }
  if (bytes.length >= 26 && matchesAscii(0, "BM"))
    return readUint32LE(14) === 12
      ? readUint16LE(18) * readUint16LE(20)
      : Math.abs(readUint32LE(18) | 0) * Math.abs(readUint32LE(22) | 0);
  if (bytes.length >= 30 && matchesAscii(0, "RIFF") && matchesAscii(8, "WEBP")) {
    let canvasWidth: Dynamic = 0,
      canvasHeight: Dynamic = 0,
      hasDimensions: Dynamic = false;
    for (let count: Dynamic = 12; count + 8 <= bytes.length; ) {
      let chunkSize: Dynamic = readUint32LE(count + 4),
        payloadStart: Dynamic = count + 8;
      if (matchesAscii(count, "VP8X") && payloadStart + 10 <= bytes.length) {
        canvasWidth = Math.max(canvasWidth, readUint24LE(payloadStart + 4) + 1);
        canvasHeight = Math.max(canvasHeight, readUint24LE(payloadStart + 7) + 1);
        hasDimensions = true;
      } else if (matchesAscii(count, "VP8L") && payloadStart + 5 <= bytes.length) {
        let vp8lBits: Dynamic = readUint32LE(payloadStart + 1);
        canvasWidth = Math.max(canvasWidth, (vp8lBits & 16383) + 1);
        canvasHeight = Math.max(canvasHeight, ((vp8lBits >>> 14) & 16383) + 1);
        hasDimensions = true;
      } else if (matchesAscii(count, "VP8 ") && payloadStart + 10 <= bytes.length) {
        canvasWidth = Math.max(canvasWidth, readUint16LE(payloadStart + 6) & 16383);
        canvasHeight = Math.max(canvasHeight, readUint16LE(payloadStart + 8) & 16383);
        hasDimensions = true;
      } else if (matchesAscii(count, "ANMF") && payloadStart + 12 <= bytes.length) {
        canvasWidth = Math.max(
          canvasWidth,
          readUint24LE(payloadStart) * 2 + readUint24LE(payloadStart + 6) + 1,
        );
        canvasHeight = Math.max(
          canvasHeight,
          readUint24LE(payloadStart + 3) * 2 + readUint24LE(payloadStart + 9) + 1,
        );
        hasDimensions = true;
        count = payloadStart + 16;
        continue;
      }
      count = payloadStart + chunkSize + (chunkSize & 1);
    }
    return hasDimensions ? canvasWidth * canvasHeight : undefined;
  }
  if (bytes.length >= 4 && bytes[0] === 255 && bytes[1] === 216) {
    for (let count: Dynamic = 2; count + 9 < bytes.length; ) {
      if (bytes[count] !== 255) return;
      let marker: Dynamic = bytes[count + 1];
      if (marker === 255) {
        count += 1;
        continue;
      }
      if (
        marker === 216 ||
        (marker >= 208 && marker <= 215) ||
        marker === 1
      ) {
        count += 2;
        continue;
      }
      if (
        marker >= 192 &&
        marker <= 207 &&
        marker !== 196 &&
        marker !== 200 &&
        marker !== 204
      )
        return readUint16BE(count + 5) === 0
          ? undefined
          : readUint16BE(count + 5) * readUint16BE(count + 7);
      if (
        !(
          marker === 196 ||
          marker === 204 ||
          marker === 219 ||
          marker === 220 ||
          marker === 221 ||
          (marker >= 224 && marker <= 239) ||
          marker === 254
        )
      )
        return;
      count += 2 + readUint16BE(count + 2);
    }
    return;
  }
  if (!matchesAscii(4, "ftyp")) return;
  let maxPixels: Dynamic;
  for (let count: Dynamic = 8; count + 16 <= bytes.length; count++)
    bytes[count] === 105 &&
      matchesAscii(count, "ispe") &&
      (maxPixels = Math.max(
        maxPixels ?? 0,
        readUint32BE(count + 8) * readUint32BE(count + 12),
      ));
  return maxPixels;
}
function stripDelimitedText(
  text?: Dynamic,
  startMarker?: Dynamic,
  endMarker?: Dynamic,
): Dynamic {
  let stripped: Dynamic = "",
    position: Dynamic = 0;
  for (
    let startIndex: Dynamic = text.indexOf(startMarker);
    startIndex !== -1;
    startIndex = text.indexOf(startMarker, position)
  ) {
    stripped += text.slice(position, startIndex);
    let endIndex: Dynamic = text.indexOf(endMarker, startIndex + startMarker.length);
    if (endIndex === -1) return stripped;
    position = endIndex + endMarker.length;
  }
  return stripped + text.slice(position);
}
function decodePercentEncodedBytes(text?: Dynamic): Dynamic {
  let bytes: Dynamic = new TextEncoder().encode(text);
  if (!text.includes("%")) return bytes;
  let hexDigitValue: Dynamic = (code?: Dynamic): Dynamic =>
      code <= 57 ? code - 48 : (code | 32) - 87,
    isHexDigit: Dynamic = (code?: Dynamic): Dynamic =>
      code !== undefined &&
      ((code >= 48 && code <= 57) ||
        ((code | 32) >= 97 && (code | 32) <= 102)),
    writeIndex: Dynamic = 0;
  for (let readIndex: Dynamic = 0; readIndex < bytes.length; readIndex++)
    bytes[readIndex] === 37 &&
    isHexDigit(bytes[readIndex + 1]) &&
    isHexDigit(bytes[readIndex + 2])
      ? ((bytes[writeIndex++] =
          (hexDigitValue(bytes[readIndex + 1]) << 4) | hexDigitValue(bytes[readIndex + 2])),
        (readIndex += 2))
      : (bytes[writeIndex++] = bytes[readIndex]);
  return bytes.subarray(0, writeIndex);
}
function decodeCssTextEscapes(css?: Dynamic): Dynamic {
  let codePointToString: Dynamic = (codePoint?: Dynamic): Dynamic =>
    Number.isFinite(codePoint) && codePoint > 0 && codePoint <= 1114111
      ? String.fromCodePoint(codePoint)
      : "\uFFFD";
  return css
    .replace(/\\\r?\n|\\\r|\\\f/g, "")
    .replace(
      /\\([0-9a-f]{1,6})(?:\r\n|[ \t\n\r\f])?/gi,
      (match?: Dynamic, hex?: Dynamic): Dynamic =>
        codePointToString(parseInt(hex, 16)),
    )
    .replace(/\\([\s\S])/g, "$1");
}
function findSvgDoctypeEnd(svg?: Dynamic): Dynamic {
  let doctypeStart: Dynamic = svg.indexOf("<!DOCTYPE");
  if (doctypeStart === -1) return;
  let quote: Dynamic = "";
  for (let position: Dynamic = doctypeStart; position < svg.length; position++) {
    let char: Dynamic = svg[position];
    if (quote) char === quote && (quote = "");
    else if (char === '"' || char === "'") quote = char;
    else if (char === ">") return svg.slice(doctypeStart, position + 1);
  }
  return svg.slice(doctypeStart);
}
function hasSafeSvgPreamble(svg?: Dynamic): Dynamic {
  let withoutComments: Dynamic = stripDelimitedText(svg, "<\!--", "-->");
  return (
    validateSvgPreamble(withoutComments) &&
    (withoutComments === svg || validateSvgPreamble(svg))
  );
}
function validateSvgPreamble(svg?: Dynamic): Dynamic {
  let encodingName: Dynamic =
    /^[\s\ufeff]*<\?xml[^>]*encoding\s*=\s*["']\s*([^"']*?)\s*["']/i.exec(
      svg,
    )?.[1];
  if (encodingName !== undefined && !isSafeTextEncoding(encodingName)) return false;
  let doctype: Dynamic = findSvgDoctypeEnd(svg);
  if (doctype === undefined) return !svg.includes("<!ENTITY");
  let bracketOffset: Dynamic = doctype.indexOf("[");
  if (bracketOffset !== -1) {
    let subsetEnd: Dynamic = svg.indexOf(
      "]",
      svg.indexOf("<!DOCTYPE") + bracketOffset,
    );
    if (
      subsetEnd === -1 ||
      svg
        .slice(svg.indexOf("<!DOCTYPE") + bracketOffset + 1, subsetEnd)
        .replace(
          /<!ENTITY\s+[A-Za-z_][\w.-]*\s+(?:"[^"<&%]*"|'[^'<&%]*')\s*>/g,
          "",
        )
        .trim() !== "" ||
      ((doctype = svg.slice(
        svg.indexOf("<!DOCTYPE"),
        svg.indexOf("<!DOCTYPE") + bracketOffset,
      )),
      svg.indexOf("<!ENTITY", subsetEnd) !== -1)
    )
      return false;
  } else if (svg.includes("<!ENTITY")) return false;
  let publicIdMatch: Dynamic = /PUBLIC\s+(?:"([^"]*)"|'([^']*)')/.exec(doctype);
  return (
    publicIdMatch === null ||
    ClipboardImageValidationSubscribers.has(publicIdMatch[1] ?? publicIdMatch[2] ?? "")
  );
}
function validateEmbeddedCssAssets(
  css?: Dynamic,
  budget: Dynamic = ClipboardImageValidationNow(),
  depth: Dynamic = 0,
): Dynamic {
  let decodedCss: Dynamic = decodeCssTextEscapes(css);
  return (
    validateCssDataUrls(decodedCss, budget, depth) &&
    (decodedCss === css || validateCssDataUrls(css, budget, depth))
  );
}
function chargeEmbeddedImageBudget(
  bytes?: Dynamic,
  contentType?: Dynamic,
  sourceKey?: Dynamic,
  checkNestedContent?: Dynamic,
  budget?: Dynamic,
  depth?: Dynamic,
): Dynamic {
  let chargeKey: Dynamic = budget.doc + " " + sourceKey,
    isFirstCharge: Dynamic = !budget.charged.has(chargeKey);
  budget.charged.add(chargeKey);
  if (isFirstCharge && ++budget.count > ClipboardImageValidationLimit) return false;
  let pixelCount: Dynamic = readRasterImagePixels(bytes);
  if (pixelCount !== undefined) {
    if (
      pixelCount > 67108864 ||
      (isFirstCharge && (budget.total += pixelCount),
      budget.total > maxTotalPixels)
    )
      return false;
  } else if (ClipboardImageValidationHandler(bytes)) return false;
  let fontSize: Dynamic = ClipboardImageValidationFromCharCode(bytes);
  if (
    fontSize !== undefined &&
    isFirstCharge &&
    (budget.fonts += Math.max(fontSize, bytes.length)) >
      ClipboardImageValidationResolvedValue
  )
    return false;
  if (!isFirstCharge) return true;
  let decodedTexts: Dynamic = ClipboardImageValidationDecode_2(bytes, contentType),
    uniqueTexts: Dynamic = [
      ...new Set(
        decodedTexts.map(
          (text?: Dynamic): Dynamic => text.replace(/\u0000/g, ""),
        ),
      ),
    ];
  if (
    pixelCount === undefined &&
    fontSize === undefined &&
    uniqueTexts.some(
      (text?: Dynamic): Dynamic =>
        ClipboardImageValidationCharsetPattern.test(text),
    )
  )
    return false;
  if (depth >= 2)
    return (
      pixelCount !== undefined &&
      !uniqueTexts.some(
        (text?: Dynamic): Dynamic =>
          ClipboardImageValidationPattern.test(text) ||
          ClipboardImageValidationPattern.test(decodeCssTextEscapes(text)),
      )
    );
  if (
    checkNestedContent &&
    !uniqueTexts.every(
      (text?: Dynamic): Dynamic =>
        validateEmbeddedCssAssets(text, budget, depth + 1),
    )
  )
    return false;
  for (let decodedText of decodedTexts as Dynamic)
    if (
      /^[\s\ufeff\u0000]*</.test(decodedText) &&
      !validateSvgImage(
        decodedText.replace(/^[\s\ufeff\u0000]+/, ""),
        budget,
        depth + 1,
      )
    )
      return false;
  return true;
}
function isSafeTextEncoding(encodingName?: Dynamic): Dynamic {
  try {
    let encoding: Dynamic = new TextDecoder(encodingName.trim()).encoding;
    return !ClipboardImageValidationIso2022JpReplacementShiftJisSet.has(
      encoding,
    );
  } catch {
    return false;
  }
}
function validateCssDataUrls(
  css?: Dynamic,
  budget?: Dynamic,
  depth?: Dynamic,
): Dynamic {
  if (/@import/i.test(css)) return false;
  let plainUrlCount: Dynamic = 0;
  for (let match of css.matchAll(
    /(?<![a-z0-9+.-])d[\t\n\r]*a[\t\n\r]*t[\t\n\r]*a[\t\n\r]*:/gi,
  ) as Dynamic) {
    if (
      Date.now() > budget.deadline ||
      ++budget.matches > ClipboardImageValidationLimit * 8
    )
      return false;
    let afterScheme: Dynamic = css.slice(match.index + match[0].length),
      commaIndex: Dynamic = afterScheme.indexOf(",");
    if (commaIndex === -1) return false;
    let header: Dynamic = afterScheme.slice(0, commaIndex),
      normalizedHeader: Dynamic = header
        .replace(/[\t\n\r]+/g, "")
        .trim()
        .toLowerCase(),
      payload: Dynamic = afterScheme.slice(commaIndex + 1),
      isBase64: Dynamic = /; *base64$/.test(normalizedHeader);
    if (!isBase64 && /base64/.test(normalizedHeader)) return false;
    let charset: Dynamic = /(?:^|;) *charset=["']?([^;"']*)/.exec(normalizedHeader)?.[1];
    if (charset !== undefined && !isSafeTextEncoding(charset)) return false;
    if (isBase64) {
      let base64Prefix: Dynamic = /^[A-Za-z0-9+/=%\s]*/.exec(payload)![0],
        nextChar: Dynamic = payload[base64Prefix.length];
      if (nextChar !== undefined && !/["');,]/.test(nextChar)) return false;
      let isDecoded: Dynamic = false;
      for (let candidate of new Set([
        base64Prefix,
        base64Prefix.split(/\s/, 1)[0],
      ]) as Dynamic) {
        let base64Text: Dynamic = (
          candidate.includes("%")
            ? new TextDecoder("latin1").decode(
                decodePercentEncodedBytes(candidate),
              )
            : candidate
        ).replace(/[\t\n\f\r ]+/g, "");
        if (/[^A-Za-z0-9+/=]/.test(base64Text)) return false;
        let decodedBytes: Dynamic;
        try {
          decodedBytes = Uint8Array.from(
            atob(base64Text),
            (char?: Dynamic): Dynamic => char.charCodeAt(0),
          );
        } catch {
          continue;
        }
        if (
          !chargeEmbeddedImageBudget(
            decodedBytes,
            normalizedHeader,
            header + "," + candidate,
            true,
            budget,
            depth,
          )
        )
          return false;
        isDecoded = true;
        break;
      }
      if (!isDecoded) return false;
    } else {
      if (++plainUrlCount > maxPlainDataUrls) return false;
      let compactPayload: Dynamic = payload.replace(/[\t\n\r]+/g, ""),
        payloadBytes: Dynamic = decodePercentEncodedBytes(compactPayload);
      if (
        readRasterImagePixels(payloadBytes) !== undefined ||
        ClipboardImageValidationHandler(payloadBytes) ||
        ClipboardImageValidationFromCharCode(payloadBytes) !== undefined ||
        !chargeEmbeddedImageBudget(
          payloadBytes,
          normalizedHeader,
          header + "," + payload,
          true,
          budget,
          depth,
        )
      )
        return false;
    }
  }
  return true;
}
function validateSvgImage(
  svg?: Dynamic,
  budget?: Dynamic,
  depth: Dynamic = 0,
): Dynamic {
  if (budget !== undefined)
    return validateNestedSvgImage(svg, budget, depth);
  let startTime: Dynamic = Date.now();
  startTime - ClipboardImageValidationSinceSpentMsConfig.since >
    spendWindowMs &&
    ((ClipboardImageValidationSinceSpentMsConfig.since = startTime),
    (ClipboardImageValidationSinceSpentMsConfig.spentMs = 0));
  if (
    ClipboardImageValidationSinceSpentMsConfig.spentMs >
    maxSpentMs
  )
    return false;
  let isValid: Dynamic = false;
  try {
    isValid = validateNestedSvgImage(svg, ClipboardImageValidationNow(), 0);
    return isValid;
  } finally {
    let elapsed: Dynamic = Date.now() - startTime;
    (!isValid || elapsed > 1e3) &&
      (ClipboardImageValidationSinceSpentMsConfig.spentMs += elapsed);
  }
}
function validateNestedSvgImage(
  svg?: Dynamic,
  budget?: Dynamic,
  depth?: Dynamic,
): Dynamic {
  let doc: Dynamic = budget.doc;
  budget.doc = ++budget.docs;
  try {
    return validateSvgDocument(svg, budget, depth);
  } finally {
    budget.doc = doc;
  }
}
function validateSvgDocument(
  svg?: Dynamic,
  budget?: Dynamic,
  depth?: Dynamic,
): Dynamic {
  if (typeof DOMParser === "undefined" || !hasSafeSvgPreamble(svg))
    return false;
  let svgDocument: Dynamic = new DOMParser().parseFromString(
    svg,
    "image/svg+xml",
  );
  if (
    svgDocument.getElementsByTagName("parsererror").length > 0 ||
    (svgDocument.doctype?.publicId &&
      !ClipboardImageValidationSubscribers.has(svgDocument.doctype.publicId))
  )
    return false;
  let hasNoProcessingInstructions: Dynamic = (node?: Dynamic): Dynamic => {
    for (
      let firstChild: Dynamic = node.firstChild;
      firstChild;
      firstChild = firstChild.nextSibling
    )
      if (firstChild.nodeType === 7 || !hasNoProcessingInstructions(firstChild)) return false;
    return true;
  };
  if (!hasNoProcessingInstructions(svgDocument)) return false;
  for (let element of Array.from(svgDocument.querySelectorAll("*")) as Dynamic) {
    let localName: Dynamic = element.localName.toLowerCase();
    if (
      ClipboardImageValidationScriptIframeObjectSet.has(localName) ||
      (localName === "style" &&
        (ClipboardImageValidationCharsetPattern.test(
          element.textContent ?? "",
        ) ||
          !validateEmbeddedCssAssets(
            element.textContent ?? "",
            budget,
            depth,
          )))
    )
      return false;
    for (let attribute of Array.from(element.attributes) as Dynamic)
      if (
        ClipboardImageValidationCharsetPattern.test(attribute.value) ||
        !validateEmbeddedCssAssets(attribute.value, budget, depth)
      )
        return false;
  }
  return true;
}
async function hasSafeImagePixelCount(blob?: Dynamic): Promise<Dynamic> {
  try {
    let pixelCount: Dynamic = readRasterImagePixels(
      new Uint8Array(await blob.arrayBuffer()),
    );
    return pixelCount !== undefined && pixelCount <= 67108864;
  } catch {
    return false;
  }
}
async function canDecodeRasterImage(blob?: Dynamic): Promise<Dynamic> {
  return /^image\/svg\+xml(;|$)/i.test(blob.type) ||
    blob.size > maxDecodableImageBytes
    ? false
    : hasSafeImagePixelCount(blob);
}
async function isPlayableImage(
  blob?: Dynamic,
  hasKnownSafePixels?: Dynamic,
): Promise<Dynamic> {
  if (!/^image\/svg\+xml(;|$)/i.test(blob.type))
    try {
      return (hasKnownSafePixels ?? (await hasSafeImagePixelCount(blob)))
        ? ((await createImageBitmap(blob)).close(), true)
        : false;
    } catch {
      return false;
    }
  if (
    !validateSvgImage(
      ClipboardImageValidationDecode(
        new Uint8Array(await blob.arrayBuffer()),
      ),
    )
  )
    return false;
  let objectUrl: Dynamic = URL.createObjectURL(blob),
    image: Dynamic = new Image(),
    loaded: Dynamic = await new Promise((resolve?: Dynamic): Dynamic => {
      let timeoutId: Dynamic = setTimeout((): Dynamic => resolve(false), 1e4);
      image.onload = (): Dynamic => {
        clearTimeout(timeoutId);
        resolve(true);
      };
      image.onerror = (): Dynamic => {
        clearTimeout(timeoutId);
        resolve(false);
      };
      image.src = objectUrl;
    });
  URL.revokeObjectURL(objectUrl);
  return loaded;
}
export {
  canDecodeRasterImage,
  chargeEmbeddedImageBudget,
  ClipboardImageValidationCharsetPattern,
  ClipboardImageValidationConstant,
  ClipboardImageValidationDecode,
  ClipboardImageValidationDecode_2,
  ClipboardImageValidationFromCharCode,
  ClipboardImageValidationHandler,
  ClipboardImageValidationIso2022JpReplacementShiftJisSet,
  ClipboardImageValidationLimit,
  maxTotalPixels as ClipboardImageValidationLimit_2,
  spendWindowMs as ClipboardImageValidationLimit_3,
  maxSpentMs as ClipboardImageValidationLimit_4,
  maxPlainDataUrls as ClipboardImageValidationLimit_5,
  ClipboardImageValidationNow,
  ClipboardImageValidationPattern,
  ClipboardImageValidationResolvedValue,
  maxDecodableImageBytes as ClipboardImageValidationResolvedValue_2,
  ClipboardImageValidationScriptIframeObjectSet,
  ClipboardImageValidationSinceSpentMsConfig,
  ClipboardImageValidationSubscribers,
  decodeCssTextEscapes,
  decodePercentEncodedBytes,
  findSvgDoctypeEnd,
  hasSafeImagePixelCount,
  hasSafeSvgPreamble,
  isPlayableImage,
  isSafeTextEncoding,
  readRasterImagePixels,
  stripDelimitedText,
  validateCssDataUrls,
  validateEmbeddedCssAssets,
  validateNestedSvgImage,
  validateSvgDocument,
  validateSvgImage,
  validateSvgPreamble,
};
export function installEditorClipboardImageValidation(): () => void {
  return () => {
    ClipboardImageValidationLimit = 256;
    maxTotalPixels = 67108864;
    ClipboardImageValidationSubscribers = new Set([
      "-//W3C//DTD SVG 1.1//EN",
      "-//W3C//DTD SVG 1.0//EN",
      "-//W3C//DTD SVG 1.1 Basic//EN",
      "-//W3C//DTD SVG 1.1 Tiny//EN",
    ]);
    ClipboardImageValidationScriptIframeObjectSet = new Set([
      "script",
      "iframe",
      "object",
      "embed",
    ]);
    ClipboardImageValidationHandler = (bytes?: Dynamic): Dynamic =>
      (bytes[0] === 137 &&
        bytes[1] === 80 &&
        bytes[2] === 78 &&
        bytes[3] === 71) ||
      (bytes[0] === 255 && bytes[1] === 216) ||
      (bytes[0] === 71 &&
        bytes[1] === 73 &&
        bytes[2] === 70 &&
        bytes[3] === 56) ||
      (bytes[0] === 66 && bytes[1] === 77) ||
      (bytes[0] === 82 &&
        bytes[1] === 73 &&
        bytes[2] === 70 &&
        bytes[3] === 70) ||
      (bytes[4] === 102 &&
        bytes[5] === 116 &&
        bytes[6] === 121 &&
        bytes[7] === 112) ||
      (bytes[0] === 0 &&
        bytes[1] === 0 &&
        (bytes[2] === 1 || bytes[2] === 2) &&
        bytes[3] === 0) ||
      (bytes[0] === 73 &&
        bytes[1] === 73 &&
        bytes[2] === 42 &&
        bytes[3] === 0) ||
      (bytes[0] === 77 &&
        bytes[1] === 77 &&
        bytes[2] === 0 &&
        bytes[3] === 42) ||
      (bytes[4] === 106 && bytes[5] === 80 && bytes[6] === 32) ||
      (bytes[0] === 255 &&
        bytes[1] === 79 &&
        bytes[2] === 255 &&
        bytes[3] === 81) ||
      (bytes[0] === 37 &&
        bytes[1] === 80 &&
        bytes[2] === 68 &&
        bytes[3] === 70) ||
      (bytes[0] === 255 && bytes[1] === 10) ||
      (bytes[4] === 74 &&
        bytes[5] === 88 &&
        bytes[6] === 76 &&
        bytes[7] === 32);
    ClipboardImageValidationFromCharCode = (bytes?: Dynamic): Dynamic => {
      let signature: Dynamic = String.fromCharCode(
        bytes[0] ?? 0,
        bytes[1] ?? 0,
        bytes[2] ?? 0,
        bytes[3] ?? 0,
      );
      return (signature === "wOFF" || signature === "wOF2") && bytes.length >= 20
        ? ((bytes[16] << 24) |
            (bytes[17] << 16) |
            (bytes[18] << 8) |
            bytes[19]) >>>
            0
        : signature === "OTTO" ||
            signature === "true" ||
            signature === "ttcf" ||
            (bytes[0] === 0 &&
              bytes[1] === 1 &&
              bytes[2] === 0 &&
              bytes[3] === 0)
          ? bytes.length
          : undefined;
    };
    ClipboardImageValidationResolvedValue = 64 * 1024 * 1024;
    ClipboardImageValidationDecode = (
      bytes?: Dynamic,
      contentType: Dynamic = "",
    ): Dynamic => {
      if (bytes[0] === 255 && bytes[1] === 254)
        return new TextDecoder("utf-16le").decode(bytes.subarray(2));
      if (bytes[0] === 254 && bytes[1] === 255)
        return new TextDecoder("utf-16be").decode(bytes.subarray(2));
      if (bytes[0] === 239 && bytes[1] === 187 && bytes[2] === 191)
        return new TextDecoder().decode(bytes.subarray(3));
      let encoding: Dynamic = "utf-8";
      try {
        let charset: Dynamic = /(?:^|;) *charset=["']?([^;"']*)/i.exec(
          contentType,
        )?.[1];
        charset && (encoding = new TextDecoder(charset.trim()).encoding);
      } catch {}
      return new TextDecoder(
        encoding === "utf-16be" || encoding === "utf-16le" ? encoding : "utf-8",
      ).decode(bytes);
    };
    ClipboardImageValidationDecode_2 = (
      bytes?: Dynamic,
      contentType?: Dynamic,
    ): Dynamic => {
      let candidates: Dynamic = new Set([
        ClipboardImageValidationDecode(bytes, contentType),
        new TextDecoder().decode(bytes),
      ]);
      bytes.indexOf(0) !== -1 &&
        (candidates.add(new TextDecoder("utf-16le").decode(bytes)),
        candidates.add(new TextDecoder("utf-16be").decode(bytes)));
      return [...candidates];
    };
    ClipboardImageValidationNow = (): Dynamic => ({
      matches: 0,
      count: 0,
      total: 0,
      fonts: 0,
      deadline: Date.now() + ClipboardImageValidationConstant,
      charged: new Set(),
      doc: 0,
      docs: 0,
    });
    ClipboardImageValidationSinceSpentMsConfig = {
      since: 0,
      spentMs: 0,
    };
    spendWindowMs = 6e4;
    maxSpentMs = 15e3;
    maxPlainDataUrls = 32;
    ClipboardImageValidationConstant = 6e3;
    ClipboardImageValidationPattern =
      /(?<![a-z0-9+.-])d[\t\n\r]*a[\t\n\r]*t[\t\n\r]*a[\t\n\r]*:/i;
    ClipboardImageValidationIso2022JpReplacementShiftJisSet = new Set([
      "iso-2022-jp",
      "replacement",
      "shift_jis",
      "euc-jp",
      "euc-kr",
      "gbk",
      "gb18030",
      "big5",
    ]);
    ClipboardImageValidationCharsetPattern = /@charset|\u001b/i;
    maxDecodableImageBytes = 32 * 1024 * 1024;
  };
}
