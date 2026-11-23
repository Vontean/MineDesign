/** Restored application module; prepare first, initialize in original order. */
import {
  type Dynamic,
} from "../runtime-types";
import { ExportDeliveryCapMsFinishAnimationsEagerImagesConfig } from "./delivery";
import { exportHeightTolerance } from "./paper-and-scale";
import { maxCanvasItemDimension as MAX_CANVAS_ITEM_DIMENSION } from "../platform/file-content";

var ExportCaptureViewportLimit: Dynamic;
var ExportCaptureViewportLabel: Dynamic;
var measureContentHeightScript: Dynamic;
var ExportCaptureViewportConstant: Dynamic;
var ExportCaptureViewportItems: Dynamic;
var measureExportTailScript: Dynamic;
async function lockCaptureViewport(
  captureClient?: Dynamic,
  viewportSize?: Dynamic,
  settleContext: Dynamic = null,
): Promise<Dynamic> {
  let value: Dynamic = await captureClient
      .executeJavaScript("[window.scrollX,window.scrollY]", 2e3)
      .catch((): Dynamic => null),
    { unlock: releaseViewport, resized: wasResized }: Dynamic = captureClient.lockViewportSize(
      viewportSize.w,
      viewportSize.h,
    ),
    callback: Dynamic = (): Dynamic => {
      releaseViewport();
      (wasResized || settleContext) &&
        Array.isArray(value) &&
        value.every(
          (coordinate?: Dynamic): Dynamic =>
            typeof coordinate == "number" && Number.isFinite(coordinate),
        ) &&
        captureClient.executeJavaScriptUnchecked(
          "window.scrollTo(" +
            String(value[0]) +
            "," +
            String(value[1]) +
            ")",
        );
    };
  if (!wasResized && !settleContext)
    return {
      release: callback,
      settleMs: 0,
    };
  let index: Dynamic = 0;
  try {
    if (wasResized) {
      let width: Dynamic = String(Number(viewportSize.w) || 0),
        height: Dynamic = String(Number(viewportSize.h) || 0);
      await captureClient
        .executeJavaScript(
          "new Promise(function(r){var n=0;(function t(){(Math.abs(window.innerWidth-" +
            width +
            ")<1&&Math.abs(window.innerHeight-" +
            height +
            ")<1)||++n>30?r(null):setTimeout(t,16)})()})",
          2e3,
        )
        .catch((): Dynamic => {});
    }
    let settledAt: Dynamic = Date.now();
    await captureClient.awaitSettled(settleContext ?? 1500);
    settleContext && (index = Date.now() - settledAt);
  } catch (error: Dynamic) {
    throw (callback(), error);
  }
  return {
    release: callback,
    settleMs: index,
  };
}
async function measureArtboardContentHeight(
  captureClient?: Dynamic,
  viewportSize?: Dynamic,
): Promise<Dynamic> {
  return withCaptureViewport(captureClient, viewportSize, async (): Promise<Dynamic> => {
    await captureClient.awaitSettled(1500).catch((): Dynamic => {});
    let value: Dynamic = await captureClient
      .executeJavaScript(measureContentHeightScript, 2e3)
      .catch((): Dynamic => null);
    return typeof value == "number" &&
      Number.isFinite(value) &&
      value >= 1 &&
      value <= 1e6
      ? value
      : null;
  });
}
async function measureExpandedContentHeight(
  captureClient?: Dynamic,
  viewportSize?: Dynamic,
): Promise<Dynamic> {
  let value: Dynamic = await measureArtboardContentHeight(captureClient, viewportSize);
  if (value === null || value <= viewportSize.h + exportHeightTolerance)
    return value;
  let expandedHeight: Dynamic = await measureArtboardContentHeight(captureClient, {
    w: viewportSize.w,
    h: Math.min(
      MAX_CANVAS_ITEM_DIMENSION,
      Math.ceil(value),
      viewportSize.h + ExportCaptureViewportConstant,
    ),
  });
  return expandedHeight !== null && expandedHeight > value + exportHeightTolerance
    ? "unsettled"
    : value;
}
function normalizeExportTailMetrics(metrics?: Dynamic): Dynamic {
  if (typeof metrics != "object" || metrics === null) return null;
  let { h: value, g: geometryHeight, c: contentState }: Dynamic = metrics,
    callback: Dynamic = (metric?: Dynamic): Dynamic =>
      typeof metric == "number" &&
      Number.isFinite(metric) &&
      metric >= 0 &&
      metric <= 1e6;
  return callback(value) &&
    value >= 1 &&
    callback(geometryHeight) &&
    (contentState === 0 || contentState === 1)
    ? {
        h: value,
        g: geometryHeight,
        c: contentState,
      }
    : null;
}
async function measureFlowExportHeight(
  captureClient?: Dynamic,
  viewportSize?: Dynamic,
): Promise<Dynamic> {
  let [value, initialHeights]: Dynamic = ExportCaptureViewportItems,
    callback: Dynamic = (height?: Dynamic): Dynamic =>
      withCaptureViewport(
        captureClient,
        {
          w: viewportSize.w,
          h: height,
        },
        async (): Promise<Dynamic> =>
          normalizeExportTailMetrics(
            await captureClient
              .executeJavaScript(measureExportTailScript, 2e3)
              .catch((): Dynamic => null),
          ),
      ),
    firstMetrics: Dynamic = await callback(value);
  if (firstMetrics === null) return null;
  if (firstMetrics.c === 1) return "unsettled";
  let secondMetrics: Dynamic = await callback(initialHeights);
  if (secondMetrics === null) return null;
  if (secondMetrics.c === 1) return "unsettled";
  let firstExceedsViewport: Dynamic = firstMetrics.h > value + exportHeightTolerance,
    secondExceedsViewport: Dynamic = secondMetrics.h > initialHeights + exportHeightTolerance,
    firstContentHeight: Dynamic = Math.min(firstMetrics.g, firstMetrics.h),
    secondContentHeight: Dynamic = Math.min(secondMetrics.g, secondMetrics.h),
    resolvedHeight: Dynamic;
  if (firstExceedsViewport) {
    if (
      secondExceedsViewport &&
      Math.abs(secondMetrics.h - firstMetrics.h) > exportHeightTolerance
    )
      return "unsettled";
    resolvedHeight = Math.max(firstMetrics.h, firstContentHeight);
  } else {
    if (secondExceedsViewport || Math.abs(secondContentHeight - firstContentHeight) > exportHeightTolerance)
      return "unsettled";
    if (firstContentHeight < 1) return "empty";
    resolvedHeight = Math.max(firstContentHeight, secondContentHeight);
  }
  for (
    let index: Dynamic = 0;
    resolvedHeight + exportHeightTolerance < viewportSize.h;
    index++
  ) {
    let measuredHeight: Dynamic = await measureArtboardContentHeight(captureClient, {
      w: viewportSize.w,
      h: Math.ceil(resolvedHeight),
    });
    if (measuredHeight === null) return null;
    if (measuredHeight <= Math.ceil(resolvedHeight) + exportHeightTolerance) break;
    if (index === 1) return "unsettled";
    resolvedHeight = measuredHeight;
  }
  return Math.min(resolvedHeight, viewportSize.h);
}
async function measureEmptyExportTail(
  captureClient?: Dynamic,
  viewportSize?: Dynamic,
  timeoutMs: Dynamic = 2500,
): Promise<Dynamic> {
  return withCaptureViewport(captureClient, viewportSize, async (): Promise<Dynamic> => {
    let value: Dynamic = normalizeExportTailMetrics(
      await captureClient
        .executeJavaScript(measureExportTailScript, timeoutMs)
        .catch((): Dynamic => null),
    );
    return value === null ||
      value.c === 1 ||
      value.g < 1 ||
      value.h > viewportSize.h + exportHeightTolerance
      ? null
      : Math.max(0, Math.round(viewportSize.h - value.g));
  });
}
async function withCaptureViewport(
  captureClient?: Dynamic,
  viewportSize?: Dynamic,
  captureOperation?: Dynamic,
  finishAnimations: Dynamic = false,
): Promise<Dynamic> {
  if (!viewportSize) return captureOperation(0);
  let { release: releaseViewport, settleMs: settleMs }: Dynamic =
    await lockCaptureViewport(
      captureClient,
      viewportSize,
      finishAnimations
        ? ExportDeliveryCapMsFinishAnimationsEagerImagesConfig
        : null,
    );
  try {
    return await captureOperation(settleMs);
  } finally {
    releaseViewport();
  }
}
export {
  ExportCaptureViewportConstant,
  ExportCaptureViewportItems,
  ExportCaptureViewportLabel,
  ExportCaptureViewportLimit,
  lockCaptureViewport,
  measureArtboardContentHeight,
  measureContentHeightScript,
  measureEmptyExportTail,
  measureExpandedContentHeight,
  measureExportTailScript,
  measureFlowExportHeight,
  normalizeExportTailMetrics,
  withCaptureViewport,
};
export function installExportCaptureViewport(): () => void {
  return () => {
    ExportCaptureViewportLimit = 15e3;
    ExportCaptureViewportLabel =
      "the artboard changed while it was being paginated";
    measureContentHeightScript =
      "(function(){var d=document.documentElement,b=document.body,o=function(e){return e?getComputedStyle(e).overflowY:''};return /hidden|clip/.test(o(d)+o(b))?window.innerHeight:Math.max(d.scrollHeight,b?b.scrollHeight:0)})()";
    ExportCaptureViewportConstant = 480;
    ExportCaptureViewportItems = [240, 400];
    measureExportTailScript =
      "(function(){var d=document.documentElement,b=document.body;if(!b)return null;var cs=function(e){return getComputedStyle(e)};if(/hidden|clip/.test(cs(d).overflowY+cs(b).overflowY))return{h:window.innerHeight,g:0,c:1};var sh=Math.max(d.scrollHeight,b.scrollHeight),sw=d.clientWidth,g=0,sy=window.scrollY,sx=window.scrollX;var media={IMG:1,SVG:1,svg:1,CANVAS:1,VIDEO:1,PICTURE:1,INPUT:1,BUTTON:1,TEXTAREA:1,SELECT:1,IFRAME:1,HR:1};var cv=null,seen={};try{cv=document.createElement('canvas');cv.width=cv.height=1;cv=cv.getContext('2d',{willReadFrequently:true})}catch(e){cv=null}var rgb=function(v){if(!v||v==='transparent')return null;var m=/^rgba?\\(([^)]+)\\)/.exec(v),p;if(m){p=m[1].split(',').map(parseFloat);return p.length>3&&!(p[3]>0.05)?null:p}if(!cv)return null;if(v in seen)return seen[v];try{cv.clearRect(0,0,1,1);cv.fillStyle='rgba(0,0,0,0)';cv.fillStyle=v;cv.fillRect(0,0,1,1);p=cv.getImageData(0,0,1,1).data;seen[v]=p[3]>12?[p[0],p[1],p[2]]:null}catch(e){seen[v]=null}return seen[v]};var behind=function(e){for(;e;e=e.parentElement){var c=rgb(cs(e).backgroundColor);if(c)return c}return[255,255,255]};var all=b.querySelectorAll('*'),n=Math.min(all.length,20000),fixed=new Map();for(var i=0;i<n;i++){var el=all[i],t=el.tagName;if(t==='SCRIPT'||t==='STYLE'||t==='TEMPLATE'||t==='LINK')continue;if(!media[t]&&el.namespaceURI!=='http://www.w3.org/1999/xhtml')continue;var s=cs(el),f=s.position==='fixed'||fixed.get(el.parentElement)===true;fixed.set(el,f);if(f)continue;if((el.checkVisibility?!el.checkVisibility({visibilityProperty:true}):(s.display==='none'||s.visibility==='hidden'))||parseFloat(s.opacity)===0)continue;var r=el.getBoundingClientRect();if(!(r.width>0&&r.height>0))continue;var top=r.top+sy,bot=r.bottom+sy;if(top<=24&&bot>=sh-24&&(r.width>=sw*0.6||(r.left+sx>24&&r.right+sx<sw-24)))continue;var has=!!media[t]||s.backgroundImage!=='none'||(s.borderBottomStyle!=='none'&&parseFloat(s.borderBottomWidth)>0);if(!has)for(var c=el.firstChild;c;c=c.nextSibling)if(c.nodeType===3&&c.textContent.trim()){has=true;break}if(!has&&r.height>=40){var own=rgb(s.backgroundColor);if(own){var bh=behind(el.parentElement);if(Math.abs(own[0]-bh[0])+Math.abs(own[1]-bh[1])+Math.abs(own[2]-bh[2])>24)has=true}}if(has&&bot>g)g=bot}return{h:sh,g:all.length>n?0:Math.ceil(g),c:0}})()";
  };
}
