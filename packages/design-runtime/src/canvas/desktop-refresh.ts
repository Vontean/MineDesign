/** Restored application module; prepare first, initialize in original order. */
import {
  type Dynamic,
} from "../runtime-types";

function beforeExport(beforeExportHook?: Dynamic, restoreAfterExport?: Dynamic): Dynamic {
  return async (): Promise<Dynamic> => {
    await beforeExportHook.current?.();
    await restoreAfterExport();
  };
}
function refreshDesktopRendering(headerElement?: Dynamic): Dynamic {
  let documentElement: Dynamic = (document as Dynamic).documentElement;
  documentElement.style.outline = "1px solid rgba(0,0,0,0.02)";
  let previousBorderBottom: Dynamic = headerElement ? headerElement.style.borderBottom : "";
  headerElement && (headerElement.style.borderBottom = "0.5px solid transparent");
  requestAnimationFrame((): Dynamic => {
    documentElement.style.outline = "";
    headerElement && (headerElement.style.borderBottom = previousBorderBottom);
  });
}
function scheduleDesktopRenderingRefresh(getHeaderElement?: Dynamic): Dynamic {
  let timerIds: Dynamic = [150, 700, 2e3, 5e3].map(
    (delayMs?: Dynamic): Dynamic =>
      (window as Dynamic).setTimeout(
        (): Dynamic => refreshDesktopRendering(getHeaderElement()),
        delayMs,
      ),
  );
  return (): Dynamic =>
    timerIds.forEach(
      (timerId?: Dynamic): Dynamic => (window as Dynamic).clearTimeout(timerId),
    );
}
export {
  beforeExport,
  refreshDesktopRendering,
  scheduleDesktopRenderingRefresh,
};
export function installCanvasDesktopRefresh(): () => void {
  return () => {};
}
