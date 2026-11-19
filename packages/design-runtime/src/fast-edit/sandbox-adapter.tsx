import { uiMessage } from '@minedesign/contracts/ui-messages';
/** Restored application module; prepare first, initialize in original order. */
import {
  type Dynamic,
} from "../runtime-types";
import { load_react } from "../dependencies";
import { createFastEditSandbox, FAST_EDIT_CANVAS_SANDBOX_LIMITS } from "./sandbox";
import { toModuleNamespace } from "../module-helpers";

var fastEditSandboxAdapter: Dynamic;
var ReactFastEdit: Dynamic;
function createSamplingClient(
  sample?: Dynamic,
  configuration?: Dynamic,
): Dynamic {
  return {
    call({
      turns: turns,
      tier: tier,
      images: images,
      onText: onText,
    }: Dynamic): Dynamic {
      let controller: Dynamic = new AbortController();
      return {
        promise: sample([...turns], {
          cache: false,
          modelTier: tier,
          ...configuration,
          ...(images.length > 0
            ? {
                images: [...images],
              }
            : {}),
          signal: controller.signal,
          onText: (textEvent?: Dynamic): Dynamic => onText(textEvent.text),
        }),
        cancel: (): Dynamic => controller.abort(),
      };
    },
    maxPromptBytes: async (): Promise<Dynamic> =>
      (await sample.limits?.())?.maxPromptBytes,
    dispose: (): Dynamic => {},
  };
}
export {
  createSamplingClient,
  fastEditSandboxAdapter,
  ReactFastEdit,
};
export function installFastEditSandboxAdapter(): () => void {
  return () => {
    fastEditSandboxAdapter = {
      create(sandboxInput: Dynamic): Dynamic {
        let value: Dynamic = createFastEditSandbox({
            sdk: 3,
            files: sandboxInput.files.map(
              (file?: Dynamic): Dynamic => ({
                ...file,
              }),
            ),
            index: {
              title: sandboxInput.title,
            },
            ...(sandboxInput.current !== undefined
              ? {
                  current: sandboxInput.current,
                }
              : {}),
            limits: FAST_EDIT_CANVAS_SANDBOX_LIMITS,
            onHtml: (htmlEvent?: Dynamic): Dynamic =>
              sandboxInput.onHtml({
                id: htmlEvent.slideId ?? null,
                html: htmlEvent.html,
                ...(htmlEvent.final === true
                  ? {
                      final: true,
                    }
                  : {}),
              }),
            onOp: (operation?: Dynamic): Dynamic => sandboxInput.onOp(operation.op),
            onDone: (doneEvent?: Dynamic): Dynamic =>
              sandboxInput.onDone({
                changed: Array.isArray(doneEvent.changed) ? doneEvent.changed : [],
                ...(typeof doneEvent.stmt == "string"
                  ? {
                      stmt: doneEvent.stmt,
                    }
                  : {}),
                ...(doneEvent.threw !== undefined || doneEvent.skipped === true
                  ? {
                      failed: true,
                    }
                  : {}),
              }),
            onError: (errorEvent?: Dynamic): Dynamic => sandboxInput.onError(errorEvent),
            onLog: (logEvent?: Dynamic): Dynamic =>
              sandboxInput.onLog(
                typeof logEvent.n == "number"
                  ? {
                      n: logEvent.n,
                      message:
                        String(logEvent.message) +
                        (logEvent.cut === true
                          ? `
(cut here)`
                          : ""),
                    }
                  : {},
              ),
            onTouch: (touchEvent?: Dynamic): Dynamic =>
              sandboxInput.onTouch(touchEvent.slideId),
            onPreview: (event?: Dynamic): Dynamic =>
              sandboxInput.onPreview?.({
                method: event.method,
                target: event.target,
                html: event.html,
              }),
          }),
          flag: Dynamic = false,
          callback: Dynamic = (runCallback?: Dynamic): Dynamic => {
            if (!flag)
              try {
                runCallback();
              } catch {
                flag = true;
                sandboxInput.onError({
                  get message() { return uiMessage("canvas.sandboxAdapter.theSandboxFrameIsGone"); },
                  fatal: true,
                });
              }
          };
        return {
          ready: Promise.resolve(value.ready).then(
            (readyResult?: Dynamic): Dynamic =>
              readyResult === undefined
                ? {
                    ok: true,
                  }
                : readyResult,
          ),
          feed: (chunk?: Dynamic): Dynamic =>
            callback((): Dynamic => value.feed(chunk)),
          flush: (): Dynamic => callback((): Dynamic => value.flush?.()),
          end: (): Dynamic => callback((): Dynamic => value.end()),
          stop: (): Dynamic => value.stop(),
          destroy: (): Dynamic => value.destroy(),
          view: async (viewOptions?: Dynamic): Promise<Dynamic> => {
            let viewResult: Dynamic = await value.view?.(viewOptions);
            return viewResult == null
              ? null
              : {
                  html: viewResult.html,
                  prefix: viewResult.prefix,
                };
          },
        };
      },
      roundTrip(html: Dynamic): Dynamic {
        return new Promise((resolve?: Dynamic): Dynamic => {
          let value: Dynamic,
            callback: Dynamic = (sandboxResult?: Dynamic): Dynamic => {
              try {
                value?.destroy();
              } catch {}
              resolve(sandboxResult);
            };
          try {
            value = createFastEditSandbox({
              html: html,
              onHtml: (htmlEvent?: Dynamic): Dynamic => {
                htmlEvent.final === true && callback(htmlEvent.html);
              },
              onError: (errorEvent?: Dynamic): Dynamic => {
                errorEvent.fatal === true && callback(null);
              },
            });
          } catch {
            resolve(null);
            return;
          }
          Promise.resolve(value.ready)
            .then((readyResult?: Dynamic): Dynamic => {
              readyResult !== undefined && readyResult.ok === false
                ? callback(null)
                : value.end();
            })
            .catch((): Dynamic => callback(null));
          setTimeout((): Dynamic => callback(null), 4e3);
        });
      },
    };
    ReactFastEdit = toModuleNamespace(
      load_react(),
      1,
    );
  };
}
