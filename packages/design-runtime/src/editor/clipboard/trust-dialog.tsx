import { useUiLocale } from '../../ui-locale.ts';
import { uiMessage } from '@minedesign/contracts/ui-messages';
/** Restored application module; prepare first, initialize in original order. */
import {
  type Dynamic,
} from "../../runtime-types";
import { Button } from "../../cds/button/button";
import { DialogDialogRootTriggerPopupConfig_2 } from "../../cds/dialog/dialog";
import { initializeCdsIndex } from "../../cds/index";
import { load_react, load_react_jsx_runtime } from "../../dependencies";
import { toModuleNamespace } from "../../module-helpers";

var reactClipboardTrustDialog: Dynamic;
var jsxClipboardTrustDialog: Dynamic;
var ClipboardTrustDialogTitleMessageKeepCodeConfig: Dynamic;
var ClipboardTrustDialogAlias: Dynamic;
var ClipboardTrustDialogConstant: Dynamic;
var ClipboardTrustDialogSubscribers: Dynamic;
var ClipboardTrustDialogHandler: Dynamic;
function askTrustForCodePaste(input?: Dynamic, options?: Dynamic): Dynamic {
  return new Promise((input2?: Dynamic): Dynamic => {
    if (options.aborted || ClipboardTrustDialogSubscribers.size === 0)
      return input2("cancel");
    let callback: Dynamic = (): Dynamic => state.settle("cancel"),
      state: Dynamic = {
        id: ClipboardTrustDialogConstant++,
        n: input,
        settle: (input3?: Dynamic): Dynamic => {
          options.removeEventListener("abort", callback);
          ClipboardTrustDialogAlias === state &&
            ((ClipboardTrustDialogAlias = null),
            ClipboardTrustDialogHandler());
          input2(input3);
        },
      };
    options.addEventListener("abort", callback, {
      once: true,
    });
    let value: Dynamic = ClipboardTrustDialogAlias;
    ClipboardTrustDialogAlias = state;
    value?.settle("cancel");
    ClipboardTrustDialogHandler();
  });
}
function CodePasteTrustDialog(): Dynamic {
  useUiLocale();
  let [value, value2]: Dynamic = (0, reactClipboardTrustDialog.useState)(
    (): Dynamic =>
      ClipboardTrustDialogAlias
        ? {
            p: ClipboardTrustDialogAlias,
            open: true,
          }
        : null,
  );
  (0, reactClipboardTrustDialog.useEffect)((): Dynamic => {
    let callback: Dynamic = (input?: Dynamic): Dynamic =>
      value2(
        (input2?: Dynamic): Dynamic =>
          input
            ? {
                p: input,
                open: true,
              }
            : input2 && {
                ...input2,
                open: false,
              },
      );
    ClipboardTrustDialogSubscribers.add(callback);
    return (): Dynamic => {
      ClipboardTrustDialogSubscribers.delete(callback);
      ClipboardTrustDialogSubscribers.size === 0 &&
        ClipboardTrustDialogAlias?.settle("cancel");
    };
  }, []);
  let value3: Dynamic = (0, reactClipboardTrustDialog.useRef)(null);
  if (!value) return null;
  let { p: value4, open: value5 }: Dynamic = value;
  return (() => {
    const _Component = DialogDialogRootTriggerPopupConfig_2.Root;
    const _props = {
      open: value5,
      onOpenChange: (input?: Dynamic): Dynamic => {
        input || value4.settle("cancel");
      },
      onOpenChangeComplete: (input?: Dynamic): Dynamic => {
        input ||
          value2(
            (input2?: Dynamic): Dynamic =>
              input2?.p === value4 ? null : input2,
          );
      },
      children: (
        <DialogDialogRootTriggerPopupConfig_2.Popup
          size={"sm"}
          initialFocus={value3}
          data-testid={"design-paste-code-dialog"}
        >
          <DialogDialogRootTriggerPopupConfig_2.Header
            description={ClipboardTrustDialogTitleMessageKeepCodeConfig.message(
              value4.n,
            )}
          >
            {ClipboardTrustDialogTitleMessageKeepCodeConfig.title}
          </DialogDialogRootTriggerPopupConfig_2.Header>
          <DialogDialogRootTriggerPopupConfig_2.Footer>
            <Button
              ref={value3}
              data-initial-focus={""}
              onClick={(): Dynamic => value4.settle("without-code")}
            >
              {ClipboardTrustDialogTitleMessageKeepCodeConfig.dropCode}
            </Button>
            <Button
              variant={"primary"}
              onClick={(): Dynamic => value4.settle("with-code")}
            >
              {ClipboardTrustDialogTitleMessageKeepCodeConfig.keepCode}
            </Button>
          </DialogDialogRootTriggerPopupConfig_2.Footer>
        </DialogDialogRootTriggerPopupConfig_2.Popup>
      ),
    } as const;
    const _key = value4.id;
    return <_Component key={_key} {..._props} />;
  })();
}
export {
  askTrustForCodePaste,
  ClipboardTrustDialogAlias,
  ClipboardTrustDialogConstant,
  ClipboardTrustDialogHandler,
  ClipboardTrustDialogSubscribers,
  ClipboardTrustDialogTitleMessageKeepCodeConfig,
  CodePasteTrustDialog,
  jsxClipboardTrustDialog,
  reactClipboardTrustDialog,
};
export function installEditorClipboardTrustDialog(): () => void {
  return () => {
    reactClipboardTrustDialog = toModuleNamespace(
      load_react(),
      1,
    );
    initializeCdsIndex();
    jsxClipboardTrustDialog = toModuleNamespace(
      load_react_jsx_runtime(),
      1,
    );
    ClipboardTrustDialogTitleMessageKeepCodeConfig = {
      get title() { return uiMessage("inspector.trustDialog.pasteWithCode"); },
      message: (input?: Dynamic): Dynamic =>
        input === 1
          ? uiMessage("inspector.trustDialog.onlyIfYouCopiedThis")
          : uiMessage("inspector.trustDialog.onlyIfYouCopiedThese"),
      keepCode: "Paste with code",
      dropCode: "Paste without code",
      dropped: (input?: Dynamic): Dynamic =>
        input === 1 ? ", without its code" : ", without their code",
    };
    ClipboardTrustDialogAlias = null;
    ClipboardTrustDialogConstant = 1;
    ClipboardTrustDialogSubscribers = new Set();
    ClipboardTrustDialogHandler = (): Dynamic => {
      for (let value of ClipboardTrustDialogSubscribers as Dynamic)
        value(ClipboardTrustDialogAlias);
    };
  };
}
