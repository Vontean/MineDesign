/** Restored application module; prepare first, initialize in original order. */
import {
  type Dynamic,
} from "../runtime-types";
import { initializeNpm_usehooks_ts_p0, load_react, npm_useEventListener_bc } from "../dependencies";
import { disablePicker, enablePicker, enablePickerPanZoom, installPicker, isPickerInstalled, setPickerPanZoomArmed, setPickerReadOnly, setPickerTheme } from "../editor/picker/bridge";
import { toModuleNamespace } from "../module-helpers";
import { isPreviewMessage } from "../platform/file-content";
import { initializePlatformTheme, useDocumentTheme } from "../platform/theme";
import { createPreviewHandle } from "../preview/evaluation";

var react_nh: Dynamic;
function useArtboardRuntimeInstallation(
  webviewRef?: Dynamic,
  readyGeneration?: Dynamic,
  panelMounted?: Dynamic,
  enabled?: Dynamic,
  keepDesignMode?: Dynamic,
  forceCanvasMode: Dynamic = false,
  readOnly: Dynamic = false,
): Dynamic {
  let [canvasMode, setCanvasMode]: Dynamic = (0, react_nh.useState)(false),
    canvasModeRef: Dynamic = (0, react_nh.useRef)(canvasMode);
  canvasModeRef.current = canvasMode;
  let installPanelHooks: Dynamic = enabled && panelMounted,
    installPanelHooksRef: Dynamic = (0, react_nh.useRef)(installPanelHooks);
  installPanelHooksRef.current = installPanelHooks;
  let readOnlyRef: Dynamic = (0, react_nh.useRef)(readOnly);
  readOnlyRef.current = readOnly;
  let [installGeneration, setInstallGeneration]: Dynamic = (0,
    react_nh.useState)(0),
    [designModePending, setDesignModePending]: Dynamic = (0,
    react_nh.useState)(false),
    { resolved: resolvedTheme }: Dynamic = useDocumentTheme(),
    resolvedThemeRef: Dynamic = (0, react_nh.useRef)(resolvedTheme);
  resolvedThemeRef.current = resolvedTheme;
  (0, react_nh.useEffect)((): Dynamic => {
    setCanvasMode(false);
    setDesignModePending(false);
  }, [readyGeneration]);
  npm_useEventListener_bc(
    "message",
    (messageEvent?: Dynamic): Dynamic => {
      if (!isPreviewMessage(messageEvent, webviewRef.current)) return;
      let data: Dynamic = messageEvent.data;
      data?.type === "__dc_design_mode" &&
        (data.mode === "canvas"
          ? (setDesignModePending(false), setCanvasMode(true))
          : setDesignModePending(true));
    },
  );
  (0, react_nh.useEffect)((): Dynamic => {
    if (readyGeneration === 0) return;
    let previewHandle: Dynamic = createPreviewHandle(webviewRef.current);
    previewHandle && setPickerTheme(previewHandle, resolvedTheme);
  }, [resolvedTheme]);
  (0, react_nh.useEffect)((): Dynamic => {
    if (!designModePending || keepDesignMode) return;
    let timeoutId: Dynamic = setTimeout((): Dynamic => {
      setCanvasMode(false);
      setDesignModePending(false);
    }, 500);
    return (): Dynamic => clearTimeout(timeoutId);
  }, [designModePending, keepDesignMode]);
  let shouldInstall: Dynamic = enabled || canvasMode;
  (0, react_nh.useEffect)((): Dynamic => {
    if (readyGeneration === 0 || !shouldInstall) return;
    let previewHandle: Dynamic = createPreviewHandle(webviewRef.current);
    if (!previewHandle) return;
    installPicker(previewHandle, resolvedThemeRef.current);
    setPickerReadOnly(previewHandle, readOnlyRef.current);
    installPanelHooksRef.current
      ? enablePicker(previewHandle)
      : enablePickerPanZoom(previewHandle);
    setInstallGeneration((generation?: Dynamic): Dynamic => generation + 1);
    let flag: Dynamic = false,
      retryTimerIds: Dynamic = [700, 2e3].map(
        (delayMs?: Dynamic): Dynamic =>
          setTimeout((): Dynamic => {
            isPickerInstalled(previewHandle).then(
              (isPickerReady?: Dynamic): Dynamic => {
                flag ||
                  isPickerReady ||
                  (installPicker(
                    previewHandle,
                    resolvedThemeRef.current,
                  ),
                  setPickerPanZoomArmed(
                    previewHandle,
                    forceCanvasMode || canvasModeRef.current,
                  ),
                  setPickerReadOnly(previewHandle, readOnlyRef.current),
                  installPanelHooksRef.current
                    ? enablePicker(previewHandle)
                    : enablePickerPanZoom(previewHandle),
                  setInstallGeneration(
                    (generation?: Dynamic): Dynamic => generation + 1,
                  ));
              },
            );
          }, delayMs),
      );
    return (): Dynamic => {
      flag = true;
      for (let timerId of retryTimerIds as Dynamic) clearTimeout(timerId);
      disablePicker(previewHandle);
    };
  }, [readyGeneration, shouldInstall]);
  (0, react_nh.useEffect)((): Dynamic => {
    if (readyGeneration === 0 || !shouldInstall) return;
    let previewHandle: Dynamic = createPreviewHandle(webviewRef.current);
    previewHandle &&
      setPickerPanZoomArmed(
        previewHandle,
        forceCanvasMode || canvasMode,
      );
  }, [readyGeneration, shouldInstall, canvasMode, forceCanvasMode]);
  (0, react_nh.useEffect)((): Dynamic => {
    if (readyGeneration === 0 || !shouldInstall) return;
    let previewHandle: Dynamic = createPreviewHandle(webviewRef.current);
    previewHandle &&
      (setPickerReadOnly(previewHandle, readOnly),
      installPanelHooks
        ? enablePicker(previewHandle)
        : enablePickerPanZoom(previewHandle));
  }, [readyGeneration, shouldInstall, installPanelHooks, readOnly]);
  return {
    installGen: installGeneration,
    canvasMode: canvasMode,
  };
}
export {
  react_nh,
  useArtboardRuntimeInstallation,
};
export function installCanvasArtboardFocus(): () => void {
  return () => {
    react_nh = toModuleNamespace(load_react(), 1);
    initializeNpm_usehooks_ts_p0();
    initializePlatformTheme();
  };
}
