import { useUiLocale } from '../ui-locale.ts';
import { uiMessage } from '@minedesign/contracts/ui-messages';
/** Restored application module; prepare first, initialize in original order. */
import {
  type Dynamic,
} from "../runtime-types";
import { load_react, load_react_dom, load_react_jsx_runtime } from "../dependencies";
import { toModuleNamespace } from "../module-helpers";

var ReactDraftPreviews: Dynamic;
var draftPreviewPortal: Dynamic;
var draftDocumentPreviews: Dynamic;
var draftPreviewListeners: Dynamic;
var draftPreviewSnapshot: Dynamic;
var notifyDraftPreviewListeners: Dynamic;
var draftDocumentPreviewStore: Dynamic;
var draftHtmlPreviews: Dynamic;
var draftHtmlPreviewListeners: Dynamic;
var draftHtmlPreviewSnapshot: Dynamic;
var notifyDraftHtmlPreviewListeners: Dynamic;
var setDraftHtmlPreview: Dynamic;
var draftHtmlPreviewStore: Dynamic;
var draftJsxRuntime: Dynamic;
var DRAFT_PREVIEW_EXPIRY_MS: Dynamic;
var DRAFT_IFRAME_STYLE: Dynamic;
function DraftArtboardPreviews({ boards: boards }: Dynamic): Dynamic {
  useUiLocale();
  let documentPreviews: Dynamic = (0,
    ReactDraftPreviews.useSyncExternalStore)(
      draftDocumentPreviewStore.subscribe,
      draftDocumentPreviewStore.all,
    ),
    htmlPreviews: Dynamic = (0, ReactDraftPreviews.useSyncExternalStore)(
      draftHtmlPreviewStore.subscribe,
      draftHtmlPreviewStore.all,
    ),
    hasPreviews: Dynamic = documentPreviews.length + htmlPreviews.length > 0,
    [activePreview, setActivePreview]: Dynamic = (0,
    ReactDraftPreviews.useState)(null);
  (0, ReactDraftPreviews.useEffect)((): Dynamic => {
    if (!hasPreviews) return;
    let callback: Dynamic = (): Dynamic => {
      let element: Dynamic = (document as Dynamic).querySelector(
        "[data-mega-world]",
      );
      setActivePreview(
        (input?: Dynamic): Dynamic => (input === element ? input : element),
      );
    };
    callback();
    let value2: Dynamic = setInterval(callback, 500);
    return (): Dynamic => clearInterval(value2);
  }, [hasPreviews]);
  if (activePreview === null || !activePreview.isConnected || !hasPreviews)
    return null;
  let value: Dynamic = boards();
  return (0, draftPreviewPortal.createPortal)(
    <draftJsxRuntime.Fragment>
      {documentPreviews.map(
        ([input, input2]: Dynamic): Dynamic => (
          <div
            key={"g" + input}
            data-fast-edit-ghost={input}
            aria-hidden={"true"}
            style={{
              position: "absolute",
              left: input2.x,
              top: input2.y,
              width: input2.w,
              height: input2.h,
              zIndex: DRAFT_PREVIEW_EXPIRY_MS,
              pointerEvents: "none",
              overflow: "hidden",
            }}
          >
            <iframe
              // MineDesign: user-facing copy calls the agent "the agent", not Claude.
              title={uiMessage("canvas.draftPreviews.whatTheAgentIsMaking")}
              sandbox={""}
              srcDoc={input2.doc}
              tabIndex={-1}
              style={DRAFT_IFRAME_STYLE}
            />
          </div>
        ),
      )}
      {htmlPreviews.map(([input, input2]: Dynamic): Dynamic => {
        let value2: Dynamic = value.find(
          (input3?: Dynamic): Dynamic => input3.file === input,
        );
        return value2 === undefined ||
          activePreview.querySelector(
            '[data-mega-artboard="' + CSS.escape(input) + '"]',
          ) === null ? null : (
          <div
            key={"p" + input}
            data-fast-edit-preview={input}
            role={input2.cover ? "status" : undefined}
            aria-hidden={input2.cover ? undefined : "true"}
            style={{
              position: "absolute",
              left: value2.x,
              top: value2.y,
              width: value2.w,
              height: value2.h,
              zIndex: DRAFT_PREVIEW_EXPIRY_MS,
              overflow: "hidden",
              pointerEvents: input2.cover ? "auto" : "none",
              cursor: input2.cover ? "progress" : undefined,
            }}
          >
            {input2.doc !== null && (<iframe
                // MineDesign: user-facing copy calls the agent "the agent", not Claude.
                title={uiMessage("canvas.draftPreviews.whatTheAgentHasWrittenSoFar")}
                sandbox={""}
                srcDoc={input2.doc}
                tabIndex={-1}
                style={DRAFT_IFRAME_STYLE}
              />)}
          </div>
        );
      })}
    </draftJsxRuntime.Fragment>,
    activePreview,
  );
}
export {
  DRAFT_IFRAME_STYLE,
  DRAFT_PREVIEW_EXPIRY_MS,
  DraftArtboardPreviews,
  draftDocumentPreviews,
  draftDocumentPreviewStore,
  draftHtmlPreviewListeners,
  draftHtmlPreviews,
  draftHtmlPreviewSnapshot,
  draftHtmlPreviewStore,
  draftJsxRuntime,
  draftPreviewListeners,
  draftPreviewPortal,
  draftPreviewSnapshot,
  notifyDraftHtmlPreviewListeners,
  notifyDraftPreviewListeners,
  ReactDraftPreviews,
  setDraftHtmlPreview,
};
export function installFastEditDraftPreviews(): () => void {
  return () => {
    ReactDraftPreviews = (0, toModuleNamespace)(
      (0, load_react)(),
      1,
    );
    draftPreviewPortal = (0, toModuleNamespace)(
      (0, load_react_dom)(),
      1,
    );
    draftDocumentPreviews = new Map();
    draftPreviewListeners = new Set();
    draftPreviewSnapshot = [];
    notifyDraftPreviewListeners = (): Dynamic => {
      draftPreviewSnapshot = [...draftDocumentPreviews];
      for (let value of draftPreviewListeners as Dynamic) value();
    };
    draftDocumentPreviewStore = {
      all: (): Dynamic => draftPreviewSnapshot,
      set(input: Dynamic, options: Dynamic): Dynamic {
        let entry: Dynamic = draftDocumentPreviews.get(input);
        (entry !== undefined &&
          entry.doc === options.doc &&
          entry.x === options.x &&
          entry.y === options.y &&
          entry.w === options.w &&
          entry.h === options.h) ||
          (draftDocumentPreviews.set(input, options),
          notifyDraftPreviewListeners());
      },
      drop(input: Dynamic): Dynamic {
        draftDocumentPreviews.delete(input) && notifyDraftPreviewListeners();
      },
      clear(): Dynamic {
        draftDocumentPreviews.size > 0 &&
          (draftDocumentPreviews.clear(), notifyDraftPreviewListeners());
      },
      subscribe(input: Dynamic): Dynamic {
        draftPreviewListeners.add(input);
        return (): Dynamic => {
          draftPreviewListeners.delete(input);
        };
      },
    };
    draftHtmlPreviews = new Map();
    draftHtmlPreviewListeners = new Set();
    draftHtmlPreviewSnapshot = [];
    notifyDraftHtmlPreviewListeners = (): Dynamic => {
      draftHtmlPreviewSnapshot = [...draftHtmlPreviews];
      for (let value of draftHtmlPreviewListeners as Dynamic) value();
    };
    setDraftHtmlPreview = (input?: Dynamic, options?: Dynamic): Dynamic => {
      let entry: Dynamic = draftHtmlPreviews.get(input);
      if (options.doc === null && !options.cover) {
        entry !== undefined &&
          (draftHtmlPreviews.delete(input), notifyDraftHtmlPreviewListeners());
        return;
      }
      (entry !== undefined &&
        entry.doc === options.doc &&
        entry.cover === options.cover) ||
        (draftHtmlPreviews.set(input, options),
        notifyDraftHtmlPreviewListeners());
    };
    draftHtmlPreviewStore = {
      all: (): Dynamic => draftHtmlPreviewSnapshot,
      set(input: Dynamic, options: Dynamic): Dynamic {
        setDraftHtmlPreview(input, {
          doc: options,
          cover: draftHtmlPreviews.get(input)?.cover ?? false,
        });
      },
      hold(input: Dynamic, options: Dynamic, context: Dynamic): Dynamic {
        setDraftHtmlPreview(input, {
          doc:
            context === undefined
              ? options
                ? (draftHtmlPreviews.get(input)?.doc ?? null)
                : null
              : context,
          cover: options,
        });
      },
      clear(): Dynamic {
        let flag: Dynamic = false;
        for (let [value, value2] of [...draftHtmlPreviews] as Dynamic)
          value2.cover || (draftHtmlPreviews.delete(value), (flag = true));
        flag && notifyDraftHtmlPreviewListeners();
      },
      subscribe(input: Dynamic): Dynamic {
        draftHtmlPreviewListeners.add(input);
        return (): Dynamic => {
          draftHtmlPreviewListeners.delete(input);
        };
      },
    };
    draftJsxRuntime = (0, toModuleNamespace)(
      (0, load_react_jsx_runtime)(),
      1,
    );
    DRAFT_PREVIEW_EXPIRY_MS = 9e5;
    DRAFT_IFRAME_STYLE = {
      position: "absolute",
      inset: 0,
      width: "100%",
      height: "100%",
      border: 0,
      background: "#ffffff",
      pointerEvents: "none",
    };
  };
}
