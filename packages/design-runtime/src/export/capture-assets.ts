/** Restored application module; prepare first, initialize in original order. */
import {
  type Dynamic,
} from "../runtime-types";

function sanitizeXmlCharacters(xmlText?: Dynamic): Dynamic {
  return xmlText.replace(
    /[\uD800-\uDBFF][\uDC00-\uDFFF]|[\u0000-\u0008\u000B\u000C\u000E-\u001F\uFFFE\uFFFF]|[\uD800-\uDFFF]/g,
    (items?: Dynamic): Dynamic =>
      items.length === 2
        ? items
        : items < "\uD800" || items > "\uDFFF"
          ? ""
          : "\uFFFD",
  );
}
function collectCssImageUrls(cssText?: Dynamic): Dynamic {
  if (!cssText || cssText.indexOf("url(") === -1) return [];
  let value: Dynamic = /url\((['"]?)([^'")]+)\1\)/g,
    items: Dynamic = [],
    state: Dynamic = {},
    urlMatch: Dynamic;
  for (; (urlMatch = value.exec(cssText)); )
    urlMatch[2].indexOf("data:") === 0 ||
      state[urlMatch[0]] ||
      ((state[urlMatch[0]] = 1),
      items.push({
        full: urlMatch[0],
        url: urlMatch[2],
      }));
  return items;
}
function replaceCssImageUrls(cssText?: Dynamic, items?: Dynamic): Dynamic {
  let value: Dynamic = cssText;
  for (let index: Dynamic = 0; index < items.length; index++)
    value = value
      .split(items[index].full)
      .join('url("' + items[index].d + '")');
  return value;
}
function prepareWebGlCanvasCapture(
  doc?: Dynamic,
  scheduler?: Dynamic,
): Dynamic {
  let items: Dynamic = [],
    callback: Dynamic = (): Dynamic => {
      for (let index: Dynamic = 0; index < items.length; index++)
        try {
          delete items[index].c.__omCapGl;
        } catch {}
    };
  try {
    let scanShadowRoot: Dynamic = (root?: Dynamic): Dynamic => {
      let value: Dynamic = root.querySelectorAll("*");
      for (let index: Dynamic = 0; index < value.length; index++) {
        let canvasElement: Dynamic = value[index];
        if (canvasElement.tagName.toUpperCase() === "CANVAS") {
          let canvas: Dynamic = canvasElement;
          if (canvas.width && canvas.height) {
            let state: Dynamic = {
              url: null,
            };
            canvas.__omCapGl = state;
            items.push({
              c: canvas,
              m: state,
            });
          }
        }
        canvasElement.shadowRoot && scanShadowRoot(canvasElement.shadowRoot);
      }
    };
    scanShadowRoot(doc);
  } catch {}
  return !items.length || doc.hidden
    ? Promise.resolve(callback)
    : new Promise((resolve?: Dynamic): Dynamic => {
        let flag: Dynamic = false,
          finishCapture: Dynamic = (succeeded?: Dynamic): Dynamic => {
            if (!flag) {
              flag = true;
              if (succeeded)
                for (let index: Dynamic = 0; index < items.length; index++)
                  try {
                    let { c: value, m: canvasState }: Dynamic = items[index],
                      snapshotCanvas: Dynamic = doc.createElement("canvas");
                    snapshotCanvas.width = value.width;
                    snapshotCanvas.height = value.height;
                    let context2d: Dynamic = snapshotCanvas.getContext("2d");
                    if (!context2d) continue;
                    context2d.drawImage(value, 0, 0);
                    let data: Dynamic = context2d.getImageData(
                      0,
                      0,
                      snapshotCanvas.width,
                      snapshotCanvas.height,
                    ).data;
                    for (
                      let count: Dynamic = 3;
                      count < data.length;
                      count += 4
                    )
                      if (data[count]) {
                        canvasState.url = snapshotCanvas.toDataURL();
                        break;
                      }
                  } catch {}
              resolve(callback);
            }
          };
        scheduler.requestAnimationFrame((): Dynamic => finishCapture(true));
        scheduler.setTimeout((): Dynamic => finishCapture(false), 200);
      });
}
export {
  collectCssImageUrls,
  prepareWebGlCanvasCapture,
  replaceCssImageUrls,
  sanitizeXmlCharacters,
};
export function installExportCaptureAssets(): () => void {
  return () => {};
}
