import { uiMessage } from '@minedesign/contracts/ui-messages';
import { useUiLocale } from '../ui-locale.ts';
/** Restored application module; prepare first, initialize in original order. */
import {
  type Dynamic,
} from "../runtime-types";
import { load_react, load_react_jsx_runtime } from "../dependencies";
import { pickerCommentRects } from "../editor/picker/bridge";
import { setHostedEditorComponent, setSelectionActionHandler, setSelectionHostFactory } from "../editor/selection/host";
import { createFastEditController } from "./controller";
import { FastEditDebugPanel } from "./debug-panel";
import { instrumentSamplingClient, isFastEditDebugEnabled, recordFastEditNoCall } from "./debug-store";
import { probeRenderedElementHit, probeRenderedElementLayout } from "./dom-probes";
import { subscribeDraftPreviews } from "./draft-channel";
import { DraftArtboardPreviews, draftHtmlPreviewStore } from "./draft-previews";
import { captureFastEditCanvasState } from "./request";
import { resolveSamplingCapability } from "./sampling-capability";
import { ReactFastEdit } from "./sandbox-adapter";
import { createFastEditSessionState } from "./session";
import { buildStaticFastEditPreview } from "./static-preview";
import { validateFastEditTemplate } from "./template-validation";
import { toModuleNamespace } from "../module-helpers";
import { awaitHostCapability } from "../platform/host-capabilities";
import { isSaveReporterActive, subscribeSaveEvents } from "../platform/save-events";
import { createPreviewHandle } from "../preview/evaluation";

var ReactSamplingCapability: Dynamic;
var isSamplingFunction: Dynamic;
var fastEditUiJsxRuntime: Dynamic;
var getArtboardViewportBounds: Dynamic;
var fastEditHistoryLimit: Dynamic;
function useSamplingCapability(
  capabilityName?: Dynamic,
  isValid: Dynamic = isSamplingFunction,
): Dynamic {
  let [capability, setCapability]: Dynamic = (0,
  ReactSamplingCapability.useState)(undefined);
  (0, ReactSamplingCapability.useEffect)((): Dynamic => {
    if (capabilityName === null) {
      setCapability(undefined);
      return;
    }
    let flag: Dynamic = true;
    (capabilityName === "sample"
      ? resolveSamplingCapability(isValid)
      : awaitHostCapability(capabilityName, isValid)
    ).then((input?: Dynamic): Dynamic => {
      flag && setCapability((): Dynamic => input);
    });
    return (): Dynamic => {
      flag = false;
    };
  }, [capabilityName]);
  return capability;
}
function rankVisibleArtboards(files?: Dynamic): Dynamic {
  return files
    .map((input?: Dynamic): Dynamic => {
      let value: Dynamic = getArtboardViewportBounds(input),
        visibleArea: Dynamic =
          value === undefined
            ? 0
            : Math.max(
                0,
                Math.min(value.right, (window as Dynamic).innerWidth) -
                  Math.max(value.left, 0),
              ) *
              Math.max(
                0,
                Math.min(value.bottom, (window as Dynamic).innerHeight) -
                  Math.max(value.top, 0),
              );
      return {
        f: input,
        area: visibleArea,
      };
    })
    .filter((input?: Dynamic): Dynamic => input.area > 0)
    .sort(
      (input?: Dynamic, options?: Dynamic): Dynamic =>
        options.area - input.area,
    )
    .map((input?: Dynamic): Dynamic => input.f);
}
function FastEditComposer({ host: host, parts: parts }: Dynamic): Dynamic {
  useUiLocale();
  let hostRef: Dynamic = (0, ReactFastEdit.useRef)(host);
  hostRef.current = host;
  let sample: Dynamic = useSamplingCapability(
      host.readOnly ? null : "sample",
    ),
    debugEnabled: Dynamic = (0, ReactFastEdit.useMemo)(
      (): Dynamic => isFastEditDebugEnabled(),
      [],
    ),
    engine: Dynamic = (0, ReactFastEdit.useMemo)(
      (): Dynamic =>
        typeof sample != "function"
          ? null
          : debugEnabled
            ? instrumentSamplingClient(
                parts.createEngine(sample),
              )
            : parts.createEngine(sample),
      [sample, parts, debugEnabled],
    );
  (0, ReactFastEdit.useEffect)(
    (): Dynamic => (): Dynamic => engine?.dispose(),
    [engine],
  );
  let historyLimitRef: Dynamic = (0, ReactFastEdit.useRef)(
    fastEditHistoryLimit(undefined),
  );
  (0, ReactFastEdit.useEffect)((): Dynamic => {
    engine
      ?.maxPromptBytes()
      .then((input?: Dynamic): Dynamic => {
        historyLimitRef.current = fastEditHistoryLimit(input);
      })
      .catch((): Dynamic => {});
  }, [engine]);
  let sessionRef: Dynamic = (0, ReactFastEdit.useRef)(
      createFastEditSessionState(undefined),
    ),
    busyRef: Dynamic = (0, ReactFastEdit.useRef)(false),
    enabled: Dynamic = engine !== null && !host.readOnly,
    controllerRef: Dynamic = (0, ReactFastEdit.useRef)(null);
  (0, ReactFastEdit.useEffect)((): Dynamic => {
    if (!enabled) return;
    let value: Dynamic = subscribeDraftPreviews(
      (input?: Dynamic): Dynamic => {
        if (input.html === null) {
          draftHtmlPreviewStore.hold(input.path, false);
          return;
        }
        draftHtmlPreviewStore.hold(input.path, true);
        let html: Dynamic = input.html;
        html !== "" &&
          (async (): Promise<Dynamic> => {
            let originalTemplate: Dynamic = await hostRef.current.handlesRef.current
              ?.get(input.path)
              ?.askTemplate()
              .catch((): Dynamic => null);
            if (typeof originalTemplate != "string" || !value.holds(input.path)) return;
            let validation: Dynamic = validateFastEditTemplate(
              originalTemplate,
              html,
            );
            if (validation.ok)
              try {
                draftHtmlPreviewStore.hold(
                  input.path,
                  true,
                  buildStaticFastEditPreview(
                    validation.template,
                    {},
                  ),
                );
              } catch {}
          })();
      },
      (input?: Dynamic): Dynamic =>
        hostRef.current.canvas
          .boards()
          .some((board?: Dynamic): Dynamic => board.file === input),
    );
    controllerRef.current = value;
    let sweepTimer: Dynamic = setInterval((): Dynamic => {
      value.sweep();
    }, 2e3);
    return (): Dynamic => {
      clearInterval(sweepTimer);
      value.stop();
      controllerRef.current = null;
    };
  }, [enabled]);
  (0, ReactFastEdit.useEffect)((): Dynamic => {
    if (!enabled) return;
    let callback: Dynamic = (): Dynamic => {
        busyRef.current = true;
      },
      releaseBusy: Dynamic = (): Dynamic => {
        busyRef.current = false;
      };
    (window as Dynamic).addEventListener("pointerdown", callback, {
      capture: true,
      passive: true,
    });
    for (let eventName of ["pointerup", "pointercancel", "blur"] as Dynamic)
      (window as Dynamic).addEventListener(eventName, releaseBusy, {
        capture: true,
        passive: true,
      });
    let value: Dynamic = subscribeSaveEvents(
      (input?: Dynamic): Dynamic => {
        let current: Dynamic = sessionRef.current;
        if (input.type === "event" && input.name === "apply")
          for (let file of (input.data?.boardsReread ?? []) as Dynamic)
            typeof file == "string" &&
              current.othersChanged.size < 24 &&
              current.othersChanged.add(file);
        else if (input.type === "landed" && current.busy === null) {
          let touchedFile: Dynamic = input.paths
            .map(
              (path?: Dynamic): Dynamic => path.replace(/^project\//, ""),
            )
            .find((path?: Dynamic): Dynamic => path.endsWith(".dc.html"));
          touchedFile !== undefined && (current.lastTouched = touchedFile);
        }
      },
    );
    return (): Dynamic => {
      (window as Dynamic).removeEventListener("pointerdown", callback, {
        capture: true,
      });
      for (let eventName of ["pointerup", "pointercancel", "blur"] as Dynamic)
        (window as Dynamic).removeEventListener(eventName, releaseBusy, {
          capture: true,
        });
      value();
    };
  }, [enabled]);
  (0, ReactFastEdit.useEffect)((): Dynamic => {
    if (!enabled || engine === null) return;
    let value: Dynamic = createFastEditController(
      (): Dynamic => ({
        rules: parts.commentRules,
        addRules: parts.newArtboardRules,
        engine: engine,
        sandbox: parts.sandbox,
        session: sessionRef.current,
        host: (): Dynamic => hostRef.current,
        holds: (input?: Dynamic): Dynamic =>
          controllerRef.current?.holds(input) ?? false,
        inView: rankVisibleArtboards,
        pointerDown: (): Dynamic => busyRef.current,
        maxBytes: historyLimitRef.current,
        ...(isSaveReporterActive()
          ? {
              onDocEvent: subscribeSaveEvents,
            }
          : {}),
        ...(debugEnabled
          ? {
              onNoCall: recordFastEditNoCall,
            }
          : {}),
        rectsOf: async (
          input?: Dynamic,
          options?: Dynamic,
        ): Promise<Dynamic> => {
          let artboard: Dynamic =
              hostRef.current.handlesRef.current?.get(input),
            preview: Dynamic =
              artboard?.isReady() === true && !artboard.isBlocked()
                ? createPreviewHandle(artboard.previewFrameRef.current)
                : null;
          return preview == null
            ? null
            : pickerCommentRects(preview, options);
        },
        layoutOf: async (
          input?: Dynamic,
          options?: Dynamic,
        ): Promise<Dynamic> => {
          let artboard: Dynamic =
              hostRef.current.handlesRef.current?.get(input),
            preview: Dynamic =
              artboard?.isReady() === true && !artboard.isBlocked()
                ? createPreviewHandle(artboard.previewFrameRef.current)
                : null;
          return preview == null
            ? null
            : probeRenderedElementLayout(preview, options);
        },
        drawnAt: async (
          input?: Dynamic,
          options?: Dynamic,
          context?: Dynamic,
        ): Promise<Dynamic> => {
          let artboard: Dynamic =
              hostRef.current.handlesRef.current?.get(input),
            preview: Dynamic =
              artboard?.isReady() === true && !artboard.isBlocked()
                ? createPreviewHandle(artboard.previewFrameRef.current)
                : null;
          return preview == null
            ? null
            : probeRenderedElementHit(preview, options, context);
        },
      }),
      {
        tier: (): Dynamic => parts.tier,
      },
    );
    setSelectionActionHandler(value.fastTrack);
    setSelectionHostFactory(value.side);
    let flag: Dynamic = true;
    (async (): Promise<Dynamic> => {
      for (; flag; ) {
        let capturedCount: Dynamic = await captureFastEditCanvasState({
          host: (): Dynamic => hostRef.current,
          session: sessionRef.current,
        }).catch((): Dynamic => 1);
        await new Promise(
          (input?: Dynamic): Dynamic =>
            setTimeout(input, capturedCount > 0 ? 400 : 2500),
        );
      }
    })();
    return (): Dynamic => {
      flag = false;
      setSelectionActionHandler(null);
      setSelectionHostFactory(null);
    };
  }, [enabled, engine, parts, debugEnabled]);
  return enabled ? (
    <fastEditUiJsxRuntime.Fragment>
      <DraftArtboardPreviews
        boards={(): Dynamic => hostRef.current.canvas.boards()}
      />
      {debugEnabled && !host.hidden && (<FastEditDebugPanel />)}
    </fastEditUiJsxRuntime.Fragment>
  ) : null;
}
function registerFastEditComposer(parts?: Dynamic): Dynamic {
  setHostedEditorComponent(
    ({ host: host }: Dynamic): Dynamic => (
      <FastEditComposer host={host} parts={parts} />
    ),
  );
}
export {
  FastEditComposer,
  fastEditHistoryLimit,
  fastEditUiJsxRuntime,
  getArtboardViewportBounds,
  isSamplingFunction,
  rankVisibleArtboards,
  ReactSamplingCapability,
  registerFastEditComposer,
  useSamplingCapability,
};
export function installFastEditComposer(): () => void {
  return () => {
    ReactSamplingCapability = toModuleNamespace(
      load_react(),
      1,
    );
    isSamplingFunction = (input?: Dynamic): Dynamic =>
      typeof input == "function";
    fastEditUiJsxRuntime = toModuleNamespace(
      load_react_jsx_runtime(),
      1,
    );
    getArtboardViewportBounds = (input?: Dynamic): Dynamic =>
      (document as Dynamic)
        .querySelector('[data-mega-artboard="' + CSS.escape(input) + '"]')
        ?.getBoundingClientRect();
    fastEditHistoryLimit = (input?: Dynamic): Dynamic =>
      typeof input == "number" && Number.isFinite(input) && input > 4096
        ? Math.min(6e4, input - 512)
        : 6e4;
  };
}
