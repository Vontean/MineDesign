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
  let value: Dynamic = useToastManager(),
    value2: Dynamic = (0, reactChromeToast.useRef)(value);
  (0, reactChromeToast.useLayoutEffect)((): Dynamic => {
    value2.current = value;
  }, [value]);
  let value3: Dynamic = (0, reactChromeToast.useRef)({
      seq: 0,
      id: null,
    }),
    value4: Dynamic = (0, reactChromeToast.useMemo)(
      (): Dynamic => ({
        showToast: (
          input?: Dynamic,
          options: Dynamic = "info",
          options2?: Dynamic,
        ): Dynamic => {
          if (options2?.pinned) {
            let current: Dynamic = value3.current,
              value5: Dynamic = "pinned:" + String(++current.seq);
            current.id = value5;
            value2.current.setPinned({
              title: input,
              description: options2.description,
              variant: ChromeToastInfoSuccessWarningConfig[options],
              action: options2.action,
              dismissible: true,
              onClose: (): Dynamic => {
                current.id === value5 && (current.id = null);
                options2.onClose?.();
              },
            });
            return value5;
          }
          return value2.current.add({
            title: input,
            description: options2?.description,
            variant: ChromeToastInfoSuccessWarningConfig[options],
            action: options2?.action,
            onClose: options2?.onClose,
          });
        },
        hideToast: (input?: Dynamic): Dynamic => {
          if (input.startsWith("pinned:")) {
            value3.current.id === input && value2.current.setPinned(null);
            return;
          }
          value2.current.close(input);
        },
      }),
      [],
    );
  return (
    <EditorToastContext.Provider value={value4}>
      {children}
    </EditorToastContext.Provider>
  );
}
function useToast(): Dynamic {
  let value: Dynamic = (0, reactChromeToast.useContext)(EditorToastContext);
  if (!value)
    throw new Error("useToast must be used within EditorToastProvider");
  return value;
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
