/** Restored application module; prepare first, initialize in original order. */
import {
  type Dynamic,
} from "../runtime-types";

function beforeExport(input?: Dynamic, options?: Dynamic): Dynamic {
  return async (): Promise<Dynamic> => {
    await input.current?.();
    await options();
  };
}
function refreshDesktopRendering(input?: Dynamic): Dynamic {
  let documentElement: Dynamic = (document as Dynamic).documentElement;
  documentElement.style.outline = "1px solid rgba(0,0,0,0.02)";
  let value: Dynamic = input ? input.style.borderBottom : "";
  input && (input.style.borderBottom = "0.5px solid transparent");
  requestAnimationFrame((): Dynamic => {
    documentElement.style.outline = "";
    input && (input.style.borderBottom = value);
  });
}
function scheduleDesktopRenderingRefresh(input?: Dynamic): Dynamic {
  let value: Dynamic = [150, 700, 2e3, 5e3].map(
    (input2?: Dynamic): Dynamic =>
      (window as Dynamic).setTimeout(
        (): Dynamic => refreshDesktopRendering(input()),
        input2,
      ),
  );
  return (): Dynamic =>
    value.forEach(
      (input2?: Dynamic): Dynamic => (window as Dynamic).clearTimeout(input2),
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
