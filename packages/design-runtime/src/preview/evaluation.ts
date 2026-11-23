import { getPreviewGenerationGate } from "./generation-gate";
/** Restored application module; prepare first, initialize in original order. */
import {
  type Dynamic,
} from "../runtime-types";
import { buildSettlementScript } from "../export/settlement";
import { currentHttpOrigin, isPreviewMessage } from "../platform/file-content";
import { errorMessage } from "../platform/rate-limiter";

var previewEvaluationRequests: Dynamic;
var previewEvaluationSequence: Dynamic;
var previewMessageListenerInstalled: Dynamic;
function installPreviewMessageListener(): Dynamic {
  previewMessageListenerInstalled ||
    ((previewMessageListenerInstalled = true),
    (window as Dynamic).addEventListener(
      "message",
      (event?: Dynamic): Dynamic => {
        if (event.origin !== currentHttpOrigin()) return;
        let message: Dynamic = event.data;
        message == null ||
          typeof message != "object" ||
          !message.__om_eval_r ||
          typeof message.id != "string" ||
          previewEvaluationRequests.get(message.id)?.(event);
      },
    ));
}
function createPreviewHandle(iframe?: Dynamic): Dynamic {
  if (!iframe) return null;
  let frame: Dynamic = iframe;
  function requestEvaluation(script?: Dynamic, timeoutMs: Dynamic = 1e4): Dynamic {
    let generationGate: Dynamic = getPreviewGenerationGate(frame);
    return generationGate.blocked != null
      ? Promise.reject(new Error("preview is blocked: " + generationGate.blocked))
      : new Promise((resolve?: Dynamic, reject?: Dynamic): Dynamic => {
          let requestId: Dynamic =
              (++previewEvaluationSequence).toString(36) +
              "." +
              Math.random().toString(36).slice(2),
            timeoutId: Dynamic = setTimeout((): Dynamic => {
              cleanup();
              reject(
                new Error(`executeJavaScript timed out (${timeoutMs / 1e3}s)`),
              );
            }, timeoutMs),
            handleReply: Dynamic = (event?: Dynamic): Dynamic => {
              if (!isPreviewMessage(event, frame)) return;
              let reply: Dynamic = event.data;
              cleanup();
              if (reply.ok) {
                if (reply.v === undefined) resolve(undefined);
                else
                  try {
                    resolve(JSON.parse(reply.v));
                  } catch (parseError: Dynamic) {
                    reject(
                      new Error(
                        `eval returned unparseable JSON: ${errorMessage(parseError)}`,
                      ),
                    );
                  }
              } else reject(new Error(reply.e || "eval failed"));
            },
            cleanup: Dynamic = (): Dynamic => {
              clearTimeout(timeoutId);
              previewEvaluationRequests.delete(requestId);
            };
          installPreviewMessageListener();
          previewEvaluationRequests.set(requestId, handleReply);
          frame.contentWindow?.postMessage(
            {
              __om_eval: 1,
              id: requestId,
              code: script,
            },
            "*",
          );
        });
  }
  function evaluate(code?: Dynamic, timeoutMs?: Dynamic): Dynamic {
    return requestEvaluation(code, timeoutMs);
  }
  let consoleListeners: Dynamic = new Map();
  return {
    reload(): Dynamic {
      evaluate("location.reload()").catch((): Dynamic => {
        let reloadUrl: Dynamic = new URL(
          frame.src,
          (window as Dynamic).location.href,
        );
        reloadUrl.searchParams.set("_r", String(Date.now()));
        frame.src = reloadUrl.toString();
      });
    },
    setZoomFactor(zoomFactor: Dynamic): Dynamic {
      frame.style.transform = `scale(${zoomFactor})`;
      frame.style.transformOrigin = "top left";
      frame.style.width = `${100 / zoomFactor}%`;
      frame.style.height = `${100 / zoomFactor}%`;
    },
    lockViewportSize(width: Dynamic, height: Dynamic): Dynamic {
      let lockAttribute: Dynamic = "data-genpptx-vplock",
        isResized: Dynamic =
          Math.abs(frame.offsetWidth - width) >= 1 ||
          Math.abs(frame.offsetHeight - height) >= 1;
      frame.setAttribute(lockAttribute, "");
      let lockStyle: Dynamic = (document as Dynamic).createElement("style");
      lockStyle.setAttribute(lockAttribute, "");
      lockStyle.textContent = `iframe[${lockAttribute}]{width:${width}px!important;height:${height}px!important;flex:none!important;max-width:none!important;max-height:none!important;transform:none!important}`;
      (document as Dynamic).head.appendChild(lockStyle);
      frame.getBoundingClientRect();
      return {
        unlock: (): Dynamic => {
          frame.removeAttribute(lockAttribute);
          lockStyle.remove();
        },
        resized: isResized,
      };
    },
    async executeJavaScript(
      code: Dynamic,
      timeoutMs: Dynamic,
    ): Promise<Dynamic> {
      return evaluate(code, timeoutMs);
    },
    executeJavaScriptUnchecked(code: Dynamic): Dynamic {
      evaluate(code).catch((): Dynamic => {});
    },
    async awaitSettled(settleOptions: Dynamic = 500): Promise<Dynamic> {
      let settlement: Dynamic =
          typeof settleOptions == "number"
            ? {
                capMs: settleOptions,
              }
            : settleOptions,
        capTimeoutId: Dynamic,
        capReached: Dynamic = new Promise((resolve?: Dynamic): Dynamic => {
          capTimeoutId = setTimeout(resolve, settlement.capMs);
        });
      try {
        await Promise.race([
          evaluate(
            buildSettlementScript(settlement),
            settlement.capMs + 1e3,
          ).then(
            (): Dynamic => {},
            (): Dynamic => capReached,
          ),
          capReached,
        ]);
      } finally {
        clearTimeout(capTimeoutId);
      }
    },
    addEventListener(eventName: Dynamic, listener: Dynamic): Dynamic {
      if (eventName === "dom-ready") frame.addEventListener("load", listener);
      else if (eventName === "console-message") {
        let handleConsoleMessage: Dynamic = (event?: Dynamic): Dynamic => {
          if (!isPreviewMessage(event, frame)) return;
          let logMessage: Dynamic = event.data;
          logMessage?.__omelette_log &&
            logMessage.type === "log" &&
            listener({
              message: logMessage.data,
            });
        };
        consoleListeners.set(listener, handleConsoleMessage);
        (window as Dynamic).addEventListener("message", handleConsoleMessage);
      } else frame.addEventListener(eventName, listener);
    },
    removeEventListener(eventName: Dynamic, listener: Dynamic): Dynamic {
      if (eventName === "dom-ready") frame.removeEventListener("load", listener);
      else if (eventName === "console-message") {
        let consoleListener: Dynamic = consoleListeners.get(listener);
        consoleListener &&
          ((window as Dynamic).removeEventListener("message", consoleListener),
          consoleListeners.delete(listener));
      } else frame.removeEventListener(eventName, listener);
    },
  };
}
export {
  createPreviewHandle,
  installPreviewMessageListener,
  previewEvaluationRequests,
  previewEvaluationSequence,
  previewMessageListenerInstalled,
};
export function installPreviewEvaluation(): () => void {
  return () => {
    previewEvaluationRequests = new Map();
    previewEvaluationSequence = 0;
    previewMessageListenerInstalled = false;
  };
}
