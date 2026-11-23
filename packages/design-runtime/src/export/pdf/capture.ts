/** Restored application module; prepare first, initialize in original order. */
import {
  type Dynamic,
} from "../../runtime-types";
import { buildCaptureScript } from "../capture-script";
import { ExportCaptureViewportLabel, lockCaptureViewport } from "../capture-viewport";
import { collectCaptureWarnings, countMatchingExportWarnings, ExportCaptureWarningsItems, FONT_FALLBACK_WARNING_PHRASES as ExportCaptureWarningsItemsForCapture } from "../capture-warnings";
import { ExportDeliveryCapMsFinishAnimationsConfig, ExportDeliveryCapMsFinishAnimationsEagerImagesConfig } from "../delivery";
import { isLanguageTag } from "./language";
import { normalizePdfLink } from "./link-annotations";
import { maxListItemIndex as pdfTextOperatorsLimit } from "./text-operators";
import { normalizeExportWarnings } from "../warnings";

var PdfCaptureLimit: Dynamic;
var PdfCaptureConstant: Dynamic;
var targetRasterWidth: Dynamic;
var getPdfRasterScale: Dynamic;
var flowPageMarginRatio: Dynamic;
var flowCaptureBatchPages: Dynamic;
var maxFlowPages: Dynamic;
var maxTextRuns: Dynamic;
var maxCapturedItemsPerPage: Dynamic;
var maxPageImageUriChars: Dynamic;
var maxTotalImageUriChars: Dynamic;
var maxTextRunChars: Dynamic;
var maxCapturedTextChars: Dynamic;
var PdfCapturePH1H2Set: Dynamic;
var PdfCaptureHas: Dynamic;
var maxFigureAltChars: Dynamic;
function parseCapturedTextRuns(
  items?: Dynamic,
  maxTextWidth?: Dynamic,
  maxTextHeight?: Dynamic,
): Dynamic {
  if (!Array.isArray(items))
    return {
      runs: [],
      capped: false,
    };
  let textRuns: Dynamic = [],
    index: Dynamic = 0,
    value: Dynamic = Math.min(items.length, 4 * maxTextRuns);
  for (let runIndex: Dynamic = 0; runIndex < value; runIndex++) {
    let runInput: Dynamic = items[runIndex];
    if (typeof runInput != "object" || runInput === null) continue;
    let {
      t: text,
      x: x,
      y: y,
      s: fontSize,
      w: width,
      b: baseline,
      i: fontIndex,
      sp: smallCaps,
      a: colorIndex,
    }: Dynamic = runInput;
    if (
      typeof text != "string" ||
      typeof x != "number" ||
      typeof y != "number" ||
      typeof fontSize != "number" ||
      typeof width != "number" ||
      !Number.isFinite(x) ||
      !Number.isFinite(y) ||
      !Number.isFinite(fontSize) ||
      !Number.isFinite(width) ||
      fontSize <= 0 ||
      fontSize > maxTextHeight ||
      width < 0 ||
      width > 3 * maxTextWidth ||
      x > maxTextWidth ||
      x + width < 0 ||
      y < 0 ||
      y > maxTextHeight
    )
      continue;
    let textStart: Dynamic =
        text.charCodeAt(maxTextRunChars) >= 56320 &&
        text.charCodeAt(maxTextRunChars) <= 57343
          ? maxTextRunChars - 1
          : maxTextRunChars,
      textChunk: Dynamic = text.slice(0, textStart);
    if (
      textRuns.length >= maxTextRuns ||
      index + textChunk.length > maxCapturedTextChars
    )
      return {
        runs: textRuns,
        capped: true,
      };
    index += textChunk.length;
    let state: Dynamic = {
      t: textChunk,
      x: x,
      y: y,
      s: fontSize,
      w: width,
    };
    typeof baseline == "number" &&
      Number.isInteger(baseline) &&
      baseline >= 0 &&
      baseline < maxTextRuns &&
      ((state.b = baseline),
      typeof fontIndex == "number" &&
        Number.isInteger(fontIndex) &&
        fontIndex >= 0 &&
        fontIndex < pdfTextOperatorsLimit &&
        (state.i = fontIndex),
      typeof smallCaps == "boolean" && (state.sp = smallCaps));
    typeof colorIndex == "number" &&
      Number.isInteger(colorIndex) &&
      colorIndex >= 0 &&
      colorIndex < maxCapturedItemsPerPage &&
      (state.a = colorIndex);
    textRuns.push(state);
  }
  return {
    runs: textRuns,
    capped: false,
  };
}
function parseCapturedFigure(
  figureInput?: Dynamic,
  maxFigureWidth?: Dynamic,
  maxFigureHeight?: Dynamic,
): Dynamic {
  if (typeof figureInput != "object" || figureInput === null) return;
  let {
    r: value,
    a: figureAltText,
    l: figureLabelIndex,
    x: figureX,
    y: figureY,
    w: figureWidth,
    h: figureHeight,
  }: Dynamic = figureInput;
  if (
    value !== "Figure" ||
    typeof figureX != "number" ||
    typeof figureY != "number" ||
    typeof figureWidth != "number" ||
    typeof figureHeight != "number" ||
    ![figureX, figureY, figureWidth, figureHeight].every(Number.isFinite) ||
    !(figureWidth > 0) ||
    !(figureHeight > 0)
  )
    return;
  let clippedX: Dynamic = Math.max(0, figureX),
    clippedY: Dynamic = Math.max(0, figureY),
    clippedRight: Dynamic = Math.min(maxFigureWidth, figureX + figureWidth),
    clippedBottom: Dynamic = Math.min(maxFigureHeight, figureY + figureHeight);
  if (!(clippedRight - clippedX > 0) || !(clippedBottom - clippedY > 0)) return;
  let state: Dynamic = {
    ...(typeof figureLabelIndex == "number" &&
    Number.isInteger(figureLabelIndex) &&
    figureLabelIndex >= 0 &&
    figureLabelIndex < maxCapturedItemsPerPage
      ? {
          l: figureLabelIndex,
        }
      : {}),
    x: clippedX,
    y: clippedY,
    w: clippedRight - clippedX,
    h: clippedBottom - clippedY,
  };
  if (typeof figureAltText != "string")
    return {
      r: "Figure",
      ...state,
    };
  let altTextStart: Dynamic =
    figureAltText.charCodeAt(maxFigureAltChars - 1) >= 55296 &&
    figureAltText.charCodeAt(maxFigureAltChars - 1) <= 56319
      ? maxFigureAltChars - 1
      : maxFigureAltChars;
  return {
    r: "Figure",
    a: figureAltText.slice(0, altTextStart),
    ...state,
  };
}
function parseCapturedBlocks(
  items?: Dynamic,
  maxBlockWidth?: Dynamic,
  maxBlockHeight?: Dynamic,
): Dynamic {
  if (!Array.isArray(items)) return [];
  let blocks: Dynamic = [],
    value: Dynamic = Math.min(items.length, maxTextRuns);
  for (let index: Dynamic = 0; index < value; index++) {
    let blockInput: Dynamic = items[index];
    blocks.push(
      PdfCaptureHas(blockInput)
        ? blockInput
        : parseCapturedFigure(blockInput, maxBlockWidth, maxBlockHeight),
    );
  }
  return blocks;
}
function remapCapturedTextBlocks(
  capturedBlocks?: Dynamic,
  fontRoles?: Dynamic,
  lineBounds?: Dynamic,
): Dynamic {
  let values: Dynamic = new Set();
  for (let value of capturedBlocks as Dynamic) {
    let blockText: Dynamic =
      value.b === undefined ? undefined : fontRoles[value.b];
    typeof blockText == "string" &&
      !(blockText === "L" && value.i === undefined) &&
      values.add(value.b);
  }
  let items: Dynamic = [],
    entries: Dynamic = new Map();
  fontRoles.forEach((roleName?: Dynamic, roleIndex?: Dynamic): Dynamic => {
    if (
      !(
        items.length >= pdfTextOperatorsLimit ||
        roleName === undefined
      )
    ) {
      if (typeof roleName == "string") {
        if (!values.has(roleIndex)) return;
        entries.set(roleIndex, items.length);
        items.push({
          role: roleName,
        });
      } else if (
        lineBounds === undefined ||
        (roleName.y >= lineBounds.y0 && roleName.y < lineBounds.y1)
      ) {
        let value: Dynamic =
            lineBounds === undefined
              ? roleName.y
              : Math.max(roleName.y, lineBounds.base ?? lineBounds.y0),
          blockY: Dynamic =
            lineBounds === undefined
              ? value
              : value - (lineBounds.base ?? lineBounds.y0) + lineBounds.off,
          blockHeight: Dynamic =
            lineBounds === undefined
              ? roleName.h
              : Math.min(roleName.y + roleName.h, lineBounds.y1) - value;
        if (!(blockHeight > 0)) return;
        let state: Dynamic = {
          role: "Figure",
          ...(roleName.a !== undefined
            ? {
                alt: roleName.a,
              }
            : {}),
          ...(roleName.l !== undefined
            ? {
                link: roleName.l,
              }
            : {}),
          x: roleName.x,
          y: blockY,
          w: roleName.w,
          h: blockHeight,
        };
        items.push(state);
      }
    }
  });
  return {
    textRuns: capturedBlocks.map((runInput?: Dynamic): Dynamic => {
      let { b: value, i: fontIndex, sp: smallCaps, ...runProperties }: Dynamic = runInput,
        baseline: Dynamic =
          value === undefined ? undefined : entries.get(value),
        isLargeCaps: Dynamic = value !== undefined && fontRoles[value] === "L";
      if (baseline === undefined || (isLargeCaps && fontIndex === undefined))
        return runProperties;
      let normalizedRun: Dynamic = isLargeCaps
        ? {
            ...runProperties,
            b: baseline,
            i: fontIndex,
          }
        : {
            ...runProperties,
            b: baseline,
          };
      smallCaps !== undefined && (normalizedRun.sp = smallCaps);
      return normalizedRun;
    }),
    blocks: items,
  };
}
function normalizeCaptureLanguage(languageInput?: Dynamic): Dynamic {
  return isLanguageTag(languageInput) ? languageInput : undefined;
}
function parseCapturedLinks(
  items?: Dynamic,
  maxLinkWidth?: Dynamic,
  maxLinkHeight?: Dynamic,
): Dynamic {
  if (!Array.isArray(items)) return [];
  let links: Dynamic = [],
    value: Dynamic = Math.min(items.length, 4 * maxCapturedItemsPerPage);
  for (
    let index: Dynamic = 0;
    index < value && links.length < maxCapturedItemsPerPage;
    index++
  ) {
    let linkInput: Dynamic = items[index];
    if (typeof linkInput != "object" || linkInput === null) continue;
    let {
        u: linkUrl,
        x: linkX,
        y: linkY,
        w: linkWidth,
        h: linkHeight,
        a: linkIndex,
      }: Dynamic = linkInput,
      normalizedLink: Dynamic = normalizePdfLink(linkUrl);
    if (
      normalizedLink === undefined ||
      typeof linkX != "number" ||
      typeof linkY != "number" ||
      typeof linkWidth != "number" ||
      typeof linkHeight != "number"
    )
      continue;
    let clippedX: Dynamic = Math.max(0, linkX),
      clippedY: Dynamic = Math.max(0, linkY),
      clippedRight: Dynamic = Math.min(maxLinkWidth, linkX + linkWidth),
      clippedBottom: Dynamic = Math.min(maxLinkHeight, linkY + linkHeight);
    if (!(clippedRight - clippedX >= 1 && clippedBottom - clippedY >= 1)) continue;
    let state: Dynamic = {
      u: normalizedLink,
      x: clippedX,
      y: clippedY,
      w: clippedRight - clippedX,
      h: clippedBottom - clippedY,
    };
    typeof linkIndex == "number" &&
      Number.isInteger(linkIndex) &&
      linkIndex >= 0 &&
      linkIndex < maxCapturedItemsPerPage &&
      (state.a = linkIndex);
    links.push(state);
  }
  return links;
}
function clipCapturedLinks(
  capturedLinks?: Dynamic,
  clipTop?: Dynamic,
  clipBottom?: Dynamic,
  offsetTop?: Dynamic,
): Dynamic {
  return capturedLinks.flatMap((link?: Dynamic): Dynamic => {
    let linkTop: Dynamic = Math.max(link.y, clipTop),
      linkBottom: Dynamic = Math.min(link.y + link.h, clipBottom);
    return linkBottom - linkTop >= 1
      ? [
          {
            ...link,
            y: linkTop - clipTop + offsetTop,
            h: linkBottom - linkTop,
          },
        ]
      : [];
  });
}
async function captureArtboardPdfPages(
  browserPage?: Dynamic,
  artboard?: Dynamic,
  captureContext: Dynamic = {
    flow: false,
  },
  waitForSettle: Dynamic = false,
): Promise<Dynamic> {
  let settleConfiguration: Dynamic = waitForSettle
      ? captureContext?.flow
        ? ExportDeliveryCapMsFinishAnimationsConfig
        : ExportDeliveryCapMsFinishAnimationsEagerImagesConfig
      : null,
    viewportLock: Dynamic = await lockCaptureViewport(
      browserPage,
      artboard,
      settleConfiguration,
    ),
    release: Dynamic = viewportLock.release,
    settleMs: Dynamic = viewportLock.settleMs;
  try {
    let flag: Dynamic = false;
    captureContext?.flow &&
      captureContext.ifScrolls &&
      (await browserPage
        .executeJavaScript(
          "Math.max(document.documentElement.scrollHeight,document.body?document.body.scrollHeight:0)>" +
            String(Number(artboard.h) + 4),
          2e3,
        )
        .catch((): Dynamic => null)) !== true &&
      ((captureContext = {
        flow: false,
      }),
      (flag = true));
    let pageCountLimit: Dynamic = captureContext?.flow ? maxFlowPages : 1,
      captureSize: Dynamic =
        captureContext?.flow && captureContext.pageH
          ? {
              w: artboard.w,
              h: captureContext.pageH,
            }
          : artboard,
      pageMargin: Dynamic = captureContext?.flow
        ? Math.round(captureSize.h * flowPageMarginRatio)
        : 0,
      callback: Dynamic = async (
        captureInput?: Dynamic,
        pageOffset?: Dynamic,
        pageTops?: Dynamic,
      ): Promise<Dynamic> => {
        let captureScript: Dynamic = buildCaptureScript(
            "image/jpeg",
            PdfCaptureConstant,
            0,
            captureInput,
            false,
            false,
            0,
            "",
            false,
            true,
            false,
            "",
            "body",
            "",
            false,
            true,
            captureSize,
            captureContext && {
              h: captureSize.h,
              max: pageCountLimit,
              margin: pageMargin,
              from: pageOffset,
              count: flowCaptureBatchPages,
              tops: pageTops,
            },
          ),
          captureResult: Dynamic;
        try {
          let timeoutMs: Dynamic =
            15e3 + (captureContext?.flow ? 4e3 * flowCaptureBatchPages : 0);
          captureResult = await browserPage.executeJavaScript(captureScript, timeoutMs);
        } catch (captureError: Dynamic) {
          throw (
            console.error("[pdf-export] capture failed:", captureError),
            new Error("its page hit an error while it was being drawn")
          );
        }
        return typeof captureResult == "object" && captureResult !== null
          ? captureResult
          : null;
      },
      isJpegDataUri: Dynamic = (items?: Dynamic): Dynamic =>
        typeof items == "string" &&
        items.length <= maxPageImageUriChars &&
        items.startsWith("data:image/jpeg;base64,"),
      validatePageTops: Dynamic = (items?: Dynamic): Dynamic => {
        if (
          !Array.isArray(items) ||
          items.length < 1 ||
          items.length > pageCountLimit ||
          items[0] !== 0
        )
          return null;
        for (let count: Dynamic = 1; count < items.length; count++) {
          let pageTop: Dynamic = items[count];
          if (
            typeof pageTop != "number" ||
            !Number.isFinite(pageTop) ||
            !(pageTop > items[count - 1])
          )
            return null;
        }
        return items;
      },
      capturePages: Dynamic = async (captureScale?: Dynamic): Promise<Dynamic> => {
        let firstCapture: Dynamic = await callback(captureScale, 0);
        if (!captureContext || !firstCapture || "e" in firstCapture)
          return {
            res: firstCapture,
            uris: firstCapture && "u" in firstCapture ? [firstCapture.u] : [],
          };
        let pageTops: Dynamic = validatePageTops(firstCapture.pt),
          pageCounts: Dynamic = validatePageTops(firstCapture.pc);
        if (
          pageTops === null ||
          pageCounts === null ||
          pageCounts.length !== pageTops.length ||
          !Array.isArray(firstCapture.pg)
        )
          throw new Error(
            "its preview returned no usable pages; reload it and try again",
          );
        let pageUris: Dynamic = firstCapture.pg.slice(0, pageTops.length),
          count: Dynamic = 1,
          withinPayloadLimit: Dynamic = (): Dynamic =>
            pageUris.reduce(
              (part?: Dynamic, items?: Dynamic): Dynamic =>
                part + (typeof items == "string" ? items.length : 0),
              0,
            ) <= maxTotalImageUriChars;
        if (!withinPayloadLimit())
          throw new Error("the pages are too large to export");
        for (
          ;
          pageUris.length < pageTops.length && pageUris.every(isJpegDataUri);

        ) {
          if (++count > Math.ceil(pageCountLimit / flowCaptureBatchPages) + 1)
            throw new Error(ExportCaptureViewportLabel);
          let nextCapture: Dynamic = await callback(
              captureScale,
              pageUris.length,
              pageCounts,
            ),
            nextPageUris: Dynamic =
              nextCapture && !("e" in nextCapture) && Array.isArray(nextCapture.pg)
                ? nextCapture.pg.slice(0, pageTops.length - pageUris.length)
                : [];
          if (
            nextPageUris.length === 0 ||
            !nextCapture ||
            "e" in nextCapture ||
            typeof nextCapture.lh != "number" ||
            typeof firstCapture.lh != "number" ||
            !(Math.abs(nextCapture.lh - firstCapture.lh) <= 4)
          )
            throw new Error(ExportCaptureViewportLabel);
          if (!nextPageUris.every(isJpegDataUri))
            throw new Error(
              "a page image came back empty; it may be too large to export",
            );
          pageUris.push(...nextPageUris);
          if (!withinPayloadLimit())
            throw new Error("the pages are too large to export");
        }
        return {
          res: firstCapture,
          uris: pageUris,
        };
      };
    captureContext?.flow &&
      (await browserPage
        .executeJavaScript(
          "window.__omCaptureCache={};window.__omCaptureFontCss=null;null",
          5e3,
        )
        .catch((): Dynamic => {}));
    let retryUsed: Dynamic = false,
      captureWithRetry: Dynamic = (retryScale?: Dynamic): Dynamic =>
        capturePages(retryScale).catch(
          async (retryError?: Dynamic): Promise<Dynamic> => {
            if (
              settleConfiguration === null ||
              retryUsed ||
              !(retryError instanceof Error) ||
              retryError.message !== ExportCaptureViewportLabel
            )
              throw retryError;
            retryUsed = true;
            let retryStartedAt: Dynamic = Date.now();
            await browserPage.awaitSettled(settleConfiguration);
            settleMs += Date.now() - retryStartedAt;
            await browserPage
              .executeJavaScript("window.__omCaptureFontCss=null;null", 5e3)
              .catch((): Dynamic => {});
            return capturePages(retryScale);
          },
        ),
      scale: Dynamic = captureContext?.maxScale ?? PdfCaptureLimit,
      scaledDown: Dynamic = false,
      { res: captureResponse, uris: responsePageUris }: Dynamic = await captureWithRetry(scale),
      captureWarnings: Dynamic = collectCaptureWarnings(
        [],
        captureResponse,
        ExportCaptureWarningsItemsForCapture,
      );
    for (let fallbackScale of [2, 1].filter(
      (candidateScale?: Dynamic): Dynamic => candidateScale < scale,
    ) as Dynamic) {
      if (
        !captureResponse ||
        "e" in captureResponse ||
        (responsePageUris.length > 0 && responsePageUris.every(isJpegDataUri))
      )
        break;
      scale = fallbackScale;
      scaledDown = true;
      ({ res: captureResponse, uris: responsePageUris } = await captureWithRetry(fallbackScale));
      captureWarnings = collectCaptureWarnings(
        captureWarnings,
        captureResponse,
        ExportCaptureWarningsItemsForCapture,
      );
    }
    if (!captureResponse)
      throw new Error(
        "its preview returned no image; reload it and try again",
      );
    if ("e" in captureResponse) {
      if (captureResponse.e !== "no-selection" && captureResponse.e !== "zero-size")
        throw new Error(
          "its preview returned no image; reload it and try again",
        );
      return {
        ok: false,
        softError: captureResponse.e,
      };
    }
    let embedWarningCount: Dynamic = countMatchingExportWarnings(
        captureResponse.w,
        ExportCaptureWarningsItems,
      ),
      hiddenContent: Dynamic = normalizeExportWarnings(captureResponse.hc),
      length: Dynamic = captureWarnings.length,
      state: Dynamic = {
        ...(length
          ? {
              fontWarningCount: length,
            }
          : {}),
        ...(scaledDown
          ? {
              scaledDown: true,
            }
          : {}),
      },
      validPageUris: Dynamic = responsePageUris.filter(isJpegDataUri);
    if (validPageUris.length === 0 || validPageUris.length !== responsePageUris.length)
      throw new Error(
        "a page image came back empty; it may be too large to export",
      );
    let canvasWidth: Dynamic =
        typeof captureResponse.cw == "number" && Number.isInteger(captureResponse.cw)
          ? captureResponse.cw
          : 0,
      canvasHeight: Dynamic =
        typeof captureResponse.ch == "number" && Number.isInteger(captureResponse.ch)
          ? captureResponse.ch
          : 0;
    if (canvasWidth <= 0 || canvasHeight <= 0 || canvasWidth > 1e6 || canvasHeight > 1e6)
      throw new Error("its preview returned an image with no usable size");
    let linksPartial: Dynamic =
        Array.isArray(captureResponse.w) &&
        captureResponse.w.some(
          (warning?: Dynamic): Dynamic =>
            warning === "links could not be measured" ||
            warning === "some links were left out",
        ),
      textPartial: Dynamic =
        captureResponse.tt === true ||
        (Array.isArray(captureResponse.w) &&
          captureResponse.w.some(
            (warning?: Dynamic): Dynamic =>
              warning === "text layer could not be measured",
          )),
      language: Dynamic = normalizeCaptureLanguage(captureResponse.lg);
    if (!captureContext) {
      let lineHeight: Dynamic =
          typeof captureResponse.lh == "number" && captureResponse.lh < 1e7 ? captureResponse.lh : 0,
        singlePageText: Dynamic = parseCapturedTextRuns(captureResponse.t, canvasWidth, canvasHeight);
      return {
        ok: true,
        pages: [
          {
            uri: validPageUris[0],
            ...remapCapturedTextBlocks(
              singlePageText.runs,
              parseCapturedBlocks(captureResponse.tb, canvasWidth, canvasHeight),
            ),
            links: parseCapturedLinks(captureResponse.l, canvasWidth, canvasHeight),
          },
        ],
        ...(language !== undefined
          ? {
              lang: language,
            }
          : {}),
        cw: canvasWidth,
        ch: canvasHeight,
        cssW: captureSize.w,
        cssH: Math.max(captureSize.h, lineHeight > 0 ? lineHeight : canvasHeight / scale),
        embedWarningCount: embedWarningCount,
        ...state,
        textPartial: singlePageText.capped || textPartial,
        linksPartial: linksPartial,
        overflowed: false,
        boxed: false,
        ...(Object.keys(hiddenContent).length > 0
          ? {
              hiddenContent: hiddenContent,
            }
          : {}),
        ...(waitForSettle
          ? {
              settleMs: settleMs,
            }
          : {}),
      };
    }
    let allPageTops: Dynamic = validatePageTops(captureResponse.pt);
    if (!(allPageTops[allPageTops.length - 1] < pageCountLimit * canvasHeight))
      throw new Error(
        "its preview returned no usable pages; reload it and try again",
      );
    let basePageOffset: Dynamic =
        typeof captureResponse.po == "number" && captureResponse.po >= 0 && captureResponse.po < canvasHeight
          ? captureResponse.po
          : 0,
      allTextRuns: Dynamic = parseCapturedTextRuns(
        captureResponse.t,
        canvasWidth,
        allPageTops[allPageTops.length - 1] + canvasHeight,
      ),
      allBlocks: Dynamic = parseCapturedBlocks(
        captureResponse.tb,
        canvasWidth,
        allPageTops[allPageTops.length - 1] + canvasHeight,
      ),
      allLinks: Dynamic = parseCapturedLinks(
        captureResponse.l,
        canvasWidth,
        allPageTops[allPageTops.length - 1] + canvasHeight,
      );
    return {
      ok: true,
      pages: validPageUris.map((pageUri?: Dynamic, pageIndex?: Dynamic): Dynamic => {
        let pageOffset: Dynamic = pageIndex > 0 ? basePageOffset : 0;
        return {
          uri: pageUri,
          links: clipCapturedLinks(
            allLinks,
            allPageTops[pageIndex],
            Math.min(
              pageIndex + 1 < allPageTops.length ? allPageTops[pageIndex + 1] : 1 / 0,
              allPageTops[pageIndex] + canvasHeight - pageOffset,
            ),
            pageOffset,
          ),
          ...remapCapturedTextBlocks(
            allTextRuns.runs
              .filter(
                (textRun?: Dynamic): Dynamic =>
                  textRun.y >= allPageTops[pageIndex] &&
                  (pageIndex + 1 === allPageTops.length ||
                    textRun.y < allPageTops[pageIndex + 1]) &&
                  textRun.y - allPageTops[pageIndex] + pageOffset <= canvasHeight,
              )
              .map(
                (textRun?: Dynamic): Dynamic => ({
                  ...textRun,
                  y: textRun.y - allPageTops[pageIndex] + pageOffset,
                }),
              ),
            allBlocks,
            {
              y0: pageIndex > 0 ? allPageTops[pageIndex] : -1 / 0,
              y1: Math.min(
                pageIndex + 1 < allPageTops.length ? allPageTops[pageIndex + 1] : 1 / 0,
                allPageTops[pageIndex] + canvasHeight - pageOffset,
              ),
              off: pageOffset,
              base: allPageTops[pageIndex],
            },
          ),
        };
      }),
      ...(language !== undefined
        ? {
            lang: language,
          }
        : {}),
      cw: canvasWidth,
      ch: canvasHeight,
      cssW: captureSize.w,
      cssH: captureSize.h,
      embedWarningCount: embedWarningCount,
      ...state,
      textPartial: allTextRuns.capped || textPartial,
      linksPartial: linksPartial,
      overflowed: captureResponse.pm === 1,
      boxed: captureResponse.pm === 2,
      ...(flag
        ? {
            atFrame: true,
          }
        : {}),
      ...(Object.keys(hiddenContent).length > 0
        ? {
            hiddenContent: hiddenContent,
          }
        : {}),
      ...(waitForSettle
        ? {
            settleMs: settleMs,
          }
        : {}),
    };
  } finally {
    release();
    await browserPage
      .executeJavaScript(
        "window.__omCaptureCache=undefined;window.__omCaptureFontCss=undefined;null",
        5e3,
      )
      .catch((): Dynamic => {});
  }
}
export {
  captureArtboardPdfPages,
  clipCapturedLinks,
  getPdfRasterScale,
  normalizeCaptureLanguage,
  parseCapturedBlocks,
  parseCapturedFigure,
  parseCapturedLinks,
  parseCapturedTextRuns,
  PdfCaptureConstant,
  PdfCaptureHas,
  PdfCaptureLimit,
  maxFlowPages,
  PdfCapturePH1H2Set,
  remapCapturedTextBlocks,
};
export function installExportPdfCapture(): () => void {
  return () => {
    PdfCaptureLimit = 3;
    PdfCaptureConstant = 0.9;
    targetRasterWidth = 2550;
    getPdfRasterScale = (scale?: Dynamic): Dynamic => {
      let value: Dynamic = Math.ceil(targetRasterWidth / scale);
      return value >= PdfCaptureLimit ? PdfCaptureLimit : value >= 2 ? 2 : 1;
    };
    flowPageMarginRatio = 0.05;
    flowCaptureBatchPages = 6;
    maxFlowPages = 100;
    maxTextRuns = 2e4;
    maxCapturedItemsPerPage = 4e3;
    maxPageImageUriChars = 64e6;
    maxTotalImageUriChars = 52e7;
    maxTextRunChars = 4e3;
    maxCapturedTextChars = 15e4;
    PdfCapturePH1H2Set = new Set([
      "P",
      "H1",
      "H2",
      "H3",
      "H4",
      "H5",
      "H6",
      "L",
      "Artifact",
    ]);
    PdfCaptureHas = (captureValue?: Dynamic): Dynamic =>
      typeof captureValue == "string" && PdfCapturePH1H2Set.has(captureValue);
    maxFigureAltChars = 1e3;
  };
}
