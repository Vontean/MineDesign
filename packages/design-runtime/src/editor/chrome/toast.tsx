import { useUiLocale } from '../../ui-locale.ts';
/** Restored application module; prepare first, initialize in original order. */
import {
  type Dynamic,
} from "../../runtime-types";
import { initializeCdsIndex } from "../../cds/index";
import { useToastManager } from "../../cds/toast/toast";
import { load_react, load_react_jsx_runtime } from "../../dependencies";
import { toModuleNamespace } from "../../module-helpers";

var reactChromeToast: Dynamic;
var jsxChromeToast: Dynamic;
var ChromeToastInfoSuccessWarningConfig: Dynamic;
var EditorToastContext: Dynamic;
function EditorToastProvider({ children: children }: Dynamic): Dynamic {
  useUiLocale();
  let toastManager: Dynamic = useToastManager(),
    toastManagerRef: Dynamic = (0, reactChromeToast.useRef)(toastManager);
  (0, reactChromeToast.useLayoutEffect)((): Dynamic => {
    toastManagerRef.current = toastManager;
  }, [toastManager]);
  let pinnedToastRef: Dynamic = (0, reactChromeToast.useRef)({
      seq: 0,
      id: null,
    }),
    toastApi: Dynamic = (0, reactChromeToast.useMemo)(
      (): Dynamic => ({
        showToast: (
          title?: Dynamic,
          variant: Dynamic = "info",
          toastOptions?: Dynamic,
        ): Dynamic => {
          if (toastOptions?.pinned) {
            let current: Dynamic = pinnedToastRef.current,
              pinnedId: Dynamic = "pinned:" + String(++current.seq);
            current.id = pinnedId;
            toastManagerRef.current.setPinned({
              title: title,
              description: toastOptions.description,
              variant: ChromeToastInfoSuccessWarningConfig[variant],
              action: toastOptions.action,
              dismissible: true,
              onClose: (): Dynamic => {
                current.id === pinnedId && (current.id = null);
                toastOptions.onClose?.();
              },
            });
            return pinnedId;
          }
          return toastManagerRef.current.add({
            title: title,
            description: toastOptions?.description,
            variant: ChromeToastInfoSuccessWarningConfig[variant],
            action: toastOptions?.action,
            onClose: toastOptions?.onClose,
          });
        },
        hideToast: (toastId?: Dynamic): Dynamic => {
          if (toastId.startsWith("pinned:")) {
            pinnedToastRef.current.id === toastId && toastManagerRef.current.setPinned(null);
            return;
          }
          toastManagerRef.current.close(toastId);
        },
      }),
      [],
    );
  return (
    <EditorToastContext.Provider value={toastApi}>
      {children}
    </EditorToastContext.Provider>
  );
}
function useToast(): Dynamic {
  let toastApi: Dynamic = (0, reactChromeToast.useContext)(EditorToastContext);
  if (!toastApi)
    throw new Error("useToast must be used within EditorToastProvider");
  return toastApi;
}
export {
  ChromeToastInfoSuccessWarningConfig,
  EditorToastContext,
  EditorToastProvider,
  jsxChromeToast,
  reactChromeToast,
  useToast,
};
export function installEditorChromeToast(): () => void {
  return () => {
    reactChromeToast = toModuleNamespace(
      load_react(),
      1,
    );
    initializeCdsIndex();
    jsxChromeToast = toModuleNamespace(
      load_react_jsx_runtime(),
      1,
    );
    ChromeToastInfoSuccessWarningConfig = {
      info: "neutral",
      success: "neutral",
      warning: "warning",
      error: "danger",
    };
    EditorToastContext = (0, reactChromeToast.createContext)(null);
  };
}
