import { useUiLocale } from '../../ui-locale.ts';
import { uiMessage } from '@minedesign/contracts/ui-messages';
/** Restored application module; prepare first, initialize in original order. */
import {
  type Dynamic,
} from "../../runtime-types";
import { Button } from "../../cds/button/button";
import { alertDialogParts as Dialog } from "../../cds/dialog/dialog";
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
function askTrustForCodePaste(pasteCount?: Dynamic, signal?: Dynamic): Dynamic {
  return new Promise((resolve?: Dynamic): Dynamic => {
    if (signal.aborted || ClipboardTrustDialogSubscribers.size === 0)
      return resolve("cancel");
    let cancelOnAbort: Dynamic = (): Dynamic => state.settle("cancel"),
      state: Dynamic = {
        id: ClipboardTrustDialogConstant++,
        n: pasteCount,
        settle: (decision?: Dynamic): Dynamic => {
          signal.removeEventListener("abort", cancelOnAbort);
          ClipboardTrustDialogAlias === state &&
            ((ClipboardTrustDialogAlias = null),
            ClipboardTrustDialogHandler());
          resolve(decision);
        },
      };
    signal.addEventListener("abort", cancelOnAbort, {
      once: true,
    });
    let previousRequest: Dynamic = ClipboardTrustDialogAlias;
    ClipboardTrustDialogAlias = state;
    previousRequest?.settle("cancel");
    ClipboardTrustDialogHandler();
  });
}
function CodePasteTrustDialog(): Dynamic {
  useUiLocale();
  let [pasteRequest, setPasteRequest]: Dynamic = (0, reactClipboardTrustDialog.useState)(
    (): Dynamic =>
      ClipboardTrustDialogAlias
        ? {
            p: ClipboardTrustDialogAlias,
            open: true,
          }
        : null,
  );
  (0, reactClipboardTrustDialog.useEffect)((): Dynamic => {
    let handleRequest: Dynamic = (incomingRequest?: Dynamic): Dynamic =>
      setPasteRequest(
        (currentRequest?: Dynamic): Dynamic =>
          incomingRequest
            ? {
                p: incomingRequest,
                open: true,
              }
            : currentRequest && {
                ...currentRequest,
                open: false,
              },
      );
    ClipboardTrustDialogSubscribers.add(handleRequest);
    return (): Dynamic => {
      ClipboardTrustDialogSubscribers.delete(handleRequest);
      ClipboardTrustDialogSubscribers.size === 0 &&
        ClipboardTrustDialogAlias?.settle("cancel");
    };
  }, []);
  let initialFocusRef: Dynamic = (0, reactClipboardTrustDialog.useRef)(null);
  if (!pasteRequest) return null;
  let { p: activeRequest, open: isDialogOpen }: Dynamic = pasteRequest;
  return (() => {
    const _Component = Dialog.Root;
    const _props = {
      open: isDialogOpen,
      onOpenChange: (isOpen?: Dynamic): Dynamic => {
        isOpen || activeRequest.settle("cancel");
      },
      onOpenChangeComplete: (isOpen?: Dynamic): Dynamic => {
        isOpen ||
          setPasteRequest(
            (currentRequest?: Dynamic): Dynamic =>
              currentRequest?.p === activeRequest ? null : currentRequest,
          );
      },
      children: (
        <Dialog.Popup
          size={"sm"}
          initialFocus={initialFocusRef}
          data-testid={"design-paste-code-dialog"}
        >
          <Dialog.Header
            description={ClipboardTrustDialogTitleMessageKeepCodeConfig.message(
              activeRequest.n,
            )}
          >
            {ClipboardTrustDialogTitleMessageKeepCodeConfig.title}
          </Dialog.Header>
          <Dialog.Footer>
            <Button
              ref={initialFocusRef}
              data-initial-focus={""}
              onClick={(): Dynamic => activeRequest.settle("without-code")}
            >
              {ClipboardTrustDialogTitleMessageKeepCodeConfig.dropCode}
            </Button>
            <Button
              variant={"primary"}
              onClick={(): Dynamic => activeRequest.settle("with-code")}
            >
              {ClipboardTrustDialogTitleMessageKeepCodeConfig.keepCode}
            </Button>
          </Dialog.Footer>
        </Dialog.Popup>
      ),
    } as const;
    const _key = activeRequest.id;
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
      message: (count?: Dynamic): Dynamic =>
        count === 1
          ? uiMessage("inspector.trustDialog.onlyIfYouCopiedThis")
          : uiMessage("inspector.trustDialog.onlyIfYouCopiedThese"),
      keepCode: "Paste with code",
      dropCode: "Paste without code",
      dropped: (count?: Dynamic): Dynamic =>
        count === 1 ? ", without its code" : ", without their code",
    };
    ClipboardTrustDialogAlias = null;
    ClipboardTrustDialogConstant = 1;
    ClipboardTrustDialogSubscribers = new Set();
    ClipboardTrustDialogHandler = (): Dynamic => {
      for (let subscriber of ClipboardTrustDialogSubscribers as Dynamic)
        subscriber(ClipboardTrustDialogAlias);
    };
  };
}
