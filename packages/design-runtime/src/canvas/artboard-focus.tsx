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
    (input?: Dynamic): Dynamic => {
      if (!isPreviewMessage(input, webviewRef.current)) return;
      let data: Dynamic = input.data;
      data?.type === "__dc_design_mode" &&
        (data.mode === "canvas"
          ? (setDesignModePending(false), setCanvasMode(true))
          : setDesignModePending(true));
    },
  );
  (0, react_nh.useEffect)((): Dynamic => {
    if (readyGeneration === 0) return;
    let value: Dynamic = createPreviewHandle(webviewRef.current);
    value && setPickerTheme(value, resolvedTheme);
  }, [resolvedTheme]);
  (0, react_nh.useEffect)((): Dynamic => {
    if (!designModePending || keepDesignMode) return;
    let value: Dynamic = setTimeout((): Dynamic => {
      setCanvasMode(false);
      setDesignModePending(false);
    }, 500);
    return (): Dynamic => clearTimeout(value);
  }, [designModePending, keepDesignMode]);
  let shouldInstall: Dynamic = enabled || canvasMode;
  (0, react_nh.useEffect)((): Dynamic => {
    if (readyGeneration === 0 || !shouldInstall) return;
    let value: Dynamic = createPreviewHandle(webviewRef.current);
    if (!value) return;
    installPicker(value, resolvedThemeRef.current);
    setPickerReadOnly(value, readOnlyRef.current);
    installPanelHooksRef.current
      ? enablePicker(value)
      : enablePickerPanZoom(value);
    setInstallGeneration((input?: Dynamic): Dynamic => input + 1);
    let flag: Dynamic = false,
      value2: Dynamic = [700, 2e3].map(
        (input?: Dynamic): Dynamic =>
          setTimeout((): Dynamic => {
            isPickerInstalled(value).then(
              (input2?: Dynamic): Dynamic => {
                flag ||
                  input2 ||
                  (installPicker(
                    value,
                    resolvedThemeRef.current,
                  ),
                  setPickerPanZoomArmed(
                    value,
                    forceCanvasMode || canvasModeRef.current,
                  ),
                  setPickerReadOnly(value, readOnlyRef.current),
                  installPanelHooksRef.current
                    ? enablePicker(value)
                    : enablePickerPanZoom(value),
                  setInstallGeneration(
                    (input3?: Dynamic): Dynamic => input3 + 1,
                  ));
              },
            );
          }, input),
      );
    return (): Dynamic => {
      flag = true;
      for (let value3 of value2 as Dynamic) clearTimeout(value3);
      disablePicker(value);
    };
  }, [readyGeneration, shouldInstall]);
  (0, react_nh.useEffect)((): Dynamic => {
    if (readyGeneration === 0 || !shouldInstall) return;
    let value: Dynamic = createPreviewHandle(webviewRef.current);
    value &&
      setPickerPanZoomArmed(
        value,
        forceCanvasMode || canvasMode,
      );
  }, [readyGeneration, shouldInstall, canvasMode, forceCanvasMode]);
  (0, react_nh.useEffect)((): Dynamic => {
    if (readyGeneration === 0 || !shouldInstall) return;
    let value: Dynamic = createPreviewHandle(webviewRef.current);
    value &&
      (setPickerReadOnly(value, readOnly),
      installPanelHooks
        ? enablePicker(value)
        : enablePickerPanZoom(value));
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
