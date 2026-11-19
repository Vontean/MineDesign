/** Restored application module; prepare first, initialize in original order. */
import {
  type Dynamic,
} from "../runtime-types";
import { CanvasMeasurementsPattern, CanvasMeasurementsPattern_2 as canvasMeasurementsPatternOverride } from "../canvas/measurements";
import { initializeButtonButton } from "../cds/button/button";
import { initializeComponentsIcon_2 } from "../cds/components/icon";
import { initializeComponentsSelectionRing_5 } from "../cds/components/selection-ring";
import { load_react } from "../dependencies";
import { saveThroughHost } from "./downloads";
import { toModuleNamespace } from "../module-helpers";
import { declineFrameExport, setFrameExportHandler, setFrameExports } from "../platform/frame-host-bridge";

var react_Su: Dynamic;
var react_DB: Dynamic;
var noninteractiveExportWindowMs: Dynamic;
var interactiveExportWindowMs: Dynamic;
var ExportCancelled: Dynamic;
var registeredExportFormats: Dynamic;
var registeredExportOptions: Dynamic;
var queuedExportRequests: Dynamic;
var activeExportRequests: Dynamic;
function exportRequestsCompatible(
  first?: Dynamic,
  second?: Dynamic,
): Dynamic {
  return (
    first.interactive === second.interactive &&
    first.bundle === second.bundle &&
    first.sender === second.sender &&
    first.variant === second.variant &&
    first.windowMs <= second.windowMs
  );
}
function exportCapabilitiesByFormat(formats?: Dynamic): Dynamic {
  let items: Dynamic = [];
  for (let value of formats as Dynamic) {
    let formatIndex: Dynamic = items.findIndex(
        (candidate?: Dynamic): Dynamic => candidate.format === value.format,
      ),
      state: Dynamic = {
        format: value.format,
        ...(value.interactive === true && {
          interactive: true,
        }),
        ...(value.bundle === true && {
          bundle: true,
        }),
        ...(value.handoff === true && {
          handoff: true,
        }),
      };
    if (value.variant === undefined) {
      formatIndex === -1 &&
        items.push({
          ...state,
          ...(value.disabled === true && {
            disabled: true,
          }),
        });
      continue;
    }
    let variantEntry: Dynamic =
      value.disabled === true
        ? {
            id: value.variant,
            disabled: true,
          }
        : {
            id: value.variant,
          };
    if (formatIndex === -1)
      items.push({
        ...state,
        variants: [variantEntry],
      });
    else {
      let formatEntry: Dynamic = items[formatIndex];
      formatEntry.variants !== undefined &&
        (items[formatIndex] = {
          ...formatEntry,
          variants: [...formatEntry.variants, variantEntry],
        });
    }
  }
  return items.map(
    (formatEntry?: Dynamic): Dynamic =>
      formatEntry.variants === undefined
        ? formatEntry
        : formatEntry.variants.every(
              (variant?: Dynamic): Dynamic => variant.disabled === true,
            )
          ? {
              ...formatEntry,
              disabled: true,
              variants: formatEntry.variants.map(
                (variant?: Dynamic): Dynamic => ({
                  id: variant.id,
                }),
              ),
            }
          : formatEntry,
  );
}
function scheduleInteractiveExportRelease(
  request?: Dynamic,
  format?: Dynamic,
): Dynamic {
  !request.interactive ||
    format.releaseRequestAfterMs === undefined ||
    (request.releaseTimer = setTimeout((): Dynamic => {
      request.releaseTimer = undefined;
      request.released = true;
      declineFrameExport(request.request, true);
    }, format.releaseRequestAfterMs));
}
function clearExportReleaseTimer(request?: Dynamic): Dynamic {
  request?.releaseTimer !== undefined &&
    (clearTimeout(request.releaseTimer), (request.releaseTimer = undefined));
}
function takeQueuedExportRequest(
  format?: Dynamic,
  request?: Dynamic,
): Dynamic {
  let entry: Dynamic = queuedExportRequests.get(format),
    value: Dynamic =
      entry === undefined || !exportRequestsCompatible(request, entry)
        ? request
        : entry;
  value === entry && queuedExportRequests.delete(format);
  clearExportReleaseTimer(value);
  return value;
}
function isExportOutcomeFinal(result?: Dynamic): Dynamic {
  switch (result.outcome) {
    case "saved":
    case "declined":
      return true;
    case "withheld":
      return false;
    case "unsupported":
      return result.code !== "no_shell_save" && result.code !== "";
  }
}
async function runExportProducer(
  format?: Dynamic,
  request?: Dynamic,
  signal?: Dynamic,
): Promise<Dynamic> {
  let { format: value, variant: variant }: Dynamic = format,
    producerOptions: Dynamic =
      variant === undefined
        ? {}
        : {
            variant: variant,
          },
    result: Dynamic;
  try {
    result = await format.produce({
      interactive: request.interactive,
      bundle: request.bundle,
      windowMs: request.windowMs,
      ...(request.sender !== undefined && {
        sender: request.sender,
      }),
      signal: signal,
    });
  } catch (error: Dynamic) {
    let cancelled: Dynamic =
        error instanceof Error && error.name === "ExportCancelled",
      requestState: Dynamic = signal.aborted
        ? request
        : takeQueuedExportRequest(value, request);
    clearExportReleaseTimer(requestState);
    requestState.released !== true &&
      declineFrameExport(requestState.request, cancelled);
    return cancelled
      ? {
          format: value,
          ...producerOptions,
          outcome: "declined",
          code: "cancelled",
        }
      : {
          format: value,
          ...producerOptions,
          outcome: "failed",
          code: "producer_failed",
        };
  }
  let queuedRequest: Dynamic = takeQueuedExportRequest(value, request);
  if (queuedRequest.released === true && signal.aborted)
    return {
      format: value,
      ...producerOptions,
      outcome: "unsupported",
      code: "request_unknown",
      filename: result.filename,
    };
  let wasReleased: Dynamic = queuedRequest.released === true,
    saveResult: Dynamic = wasReleased
      ? await saveThroughHost(result.data, result.filename)
      : await saveThroughHost(result.data, result.filename, {
          request: queuedRequest.request,
        });
  !wasReleased &&
    !signal.aborted &&
    request.interactive &&
    format.releaseRequestAfterMs !== undefined &&
    saveResult.outcome === "unsupported" &&
    saveResult.code === "request_unknown" &&
    ((saveResult = await saveThroughHost(
      result.data,
      result.filename,
    )),
    (wasReleased = true));
  !wasReleased &&
    !isExportOutcomeFinal(saveResult) &&
    declineFrameExport(queuedRequest.request);
  let outcome: Dynamic =
    saveResult.outcome === "saved" ? "delivered" : saveResult.outcome;
  return {
    format: value,
    ...producerOptions,
    outcome: outcome,
    code: saveResult.code,
    filename: result.filename,
    ...(wasReleased && {
      late: {
        saved: saveResult,
        file: result,
      },
    }),
  };
}
function enabledExportFormat(format?: Dynamic, variant?: Dynamic): Dynamic {
  let value: Dynamic =
    variant === undefined
      ? registeredExportFormats?.find(
          (candidate?: Dynamic): Dynamic => candidate.format === format,
        )
      : registeredExportFormats?.find(
          (candidate?: Dynamic): Dynamic =>
            candidate.format === format && candidate.variant === variant,
        );
  return value !== undefined && value.disabled !== true ? value : undefined;
}
async function receiveExportRequest(
  format?: Dynamic,
  request?: Dynamic,
  interactive?: Dynamic,
  variant?: Dynamic,
  bundle?: Dynamic,
  windowMs?: Dynamic,
  sender?: Dynamic,
): Promise<Dynamic> {
  let value: Dynamic = enabledExportFormat(format, variant);
  if (value === undefined) {
    variant === undefined &&
      registeredExportFormats?.some(
        (candidate?: Dynamic): Dynamic =>
          candidate.format === format && candidate.variant !== undefined,
      ) === true &&
      declineFrameExport(request);
    return;
  }
  let state: Dynamic = {
    request: request,
    interactive: interactive,
    bundle: bundle,
    windowMs: windowMs,
    ...(sender !== undefined && {
      sender: sender,
    }),
    ...(value.variant !== undefined && {
      variant: value.variant,
    }),
  };
  clearExportReleaseTimer(queuedExportRequests.get(format));
  queuedExportRequests.set(format, state);
  scheduleInteractiveExportRelease(state, value);
  let entry: Dynamic = activeExportRequests.get(format);
  if (entry !== undefined) {
    exportRequestsCompatible(entry, state) || entry.abort.abort();
    return;
  }
  try {
    for (;;) {
      let nextQueuedEntry: Dynamic = queuedExportRequests.get(format),
        enabledVariant: Dynamic =
          nextQueuedEntry === undefined
            ? undefined
            : enabledExportFormat(format, nextQueuedEntry.variant);
      if (nextQueuedEntry === undefined || enabledVariant === undefined) break;
      let controller: Dynamic = new AbortController();
      activeExportRequests.set(format, {
        interactive: nextQueuedEntry.interactive,
        bundle: nextQueuedEntry.bundle,
        windowMs: nextQueuedEntry.windowMs,
        ...(nextQueuedEntry.sender !== undefined && {
          sender: nextQueuedEntry.sender,
        }),
        ...(nextQueuedEntry.variant !== undefined && {
          variant: nextQueuedEntry.variant,
        }),
        abort: controller,
      });
      let result: Dynamic = await runExportProducer(
        enabledVariant,
        nextQueuedEntry,
        controller.signal,
      );
      try {
        registeredExportOptions.onResult?.(result);
      } catch (error: Dynamic) {
        typeof reportError == "function"
          ? reportError(error)
          : console.error(error);
      }
    }
    let queuedEntry: Dynamic = queuedExportRequests.get(format);
    queuedEntry !== undefined &&
      (queuedExportRequests.delete(format),
      clearExportReleaseTimer(queuedEntry),
      queuedEntry.released !== true &&
        declineFrameExport(queuedEntry.request));
  } finally {
    activeExportRequests.delete(format);
  }
}
function onHostExportRequest(
  format?: Dynamic,
  request?: Dynamic,
  interactive?: Dynamic,
  variant?: Dynamic,
  bundle: Dynamic = false,
  windowMs: Dynamic = interactive
    ? interactiveExportWindowMs
    : noninteractiveExportWindowMs,
  sender?: Dynamic,
): Dynamic {
  receiveExportRequest(
    format,
    request,
    interactive,
    variant,
    bundle,
    windowMs,
    sender,
  );
}
function normalizeExportFormats(formats?: Dynamic): Dynamic {
  let items: Dynamic = [];
  for (let value of formats as Dynamic) {
    if (
      !CanvasMeasurementsPattern.test(value.format) ||
      (value.variant !== undefined &&
        (value.handoff === true ||
          !canvasMeasurementsPatternOverride.test(value.variant)))
    )
      continue;
    let formatEntry: Dynamic = items.find(
      (candidate?: Dynamic): Dynamic => candidate.format === value.format,
    );
    (formatEntry !== undefined &&
      (formatEntry.variant === undefined ||
        value.variant === undefined ||
        (formatEntry.interactive === true) != (value.interactive === true) ||
        (formatEntry.bundle === true) != (value.bundle === true) ||
        items.some(
          (candidate?: Dynamic): Dynamic =>
            candidate.format === value.format && candidate.variant === value.variant,
        ))) ||
      items.push(value);
  }
  return items;
}
function registerExportFormats(
  formats?: Dynamic,
  formatOptions: Dynamic = {},
): Dynamic {
  let value: Dynamic = normalizeExportFormats(formats);
  registeredExportFormats = value;
  registeredExportOptions = formatOptions;
  setFrameExportHandler(onHostExportRequest);
  setFrameExports(exportCapabilitiesByFormat(value));
  return (): Dynamic => {
    if (registeredExportFormats === value) {
      registeredExportFormats = null;
      registeredExportOptions = {};
      for (let request of queuedExportRequests.values() as Dynamic) {
        clearExportReleaseTimer(request);
        request.released !== true &&
          declineFrameExport(request.request);
      }
      queuedExportRequests.clear();
      for (let request of activeExportRequests.values() as Dynamic)
        request.abort.abort();
      setFrameExports(null);
      setFrameExportHandler(null);
    }
  };
}
function useExportFormats(formats?: Dynamic, hookOptions?: Dynamic): Dynamic {
  let value: Dynamic = (0, react_DB.useRef)({
    entries: formats,
    opts: hookOptions,
  });
  value.current = {
    entries: formats,
    opts: hookOptions,
  };
  let cleanupRef: Dynamic = (0, react_DB.useRef)(null),
    registeredFormats: Dynamic =
      formats === null
        ? ""
        : JSON.stringify([
            exportCapabilitiesByFormat(formats),
            formats.map(
              (format?: Dynamic): Dynamic =>
                format.releaseRequestAfterMs ?? null,
            ),
          ]);
  (0, react_DB.useEffect)((): Dynamic => {
    let { entries: current }: Dynamic = value.current;
    if (current === null) {
      cleanupRef.current?.();
      cleanupRef.current = null;
      return;
    }
    let formatOptions: Dynamic = current.map(
      (format?: Dynamic): Dynamic => ({
        format: format.format,
        ...(format.variant !== undefined && {
          variant: format.variant,
        }),
        disabled: format.disabled,
        interactive: format.interactive,
        bundle: format.bundle,
        handoff: format.handoff,
        ...(format.releaseRequestAfterMs !== undefined && {
          releaseRequestAfterMs: format.releaseRequestAfterMs,
        }),
        produce: (request?: Dynamic): Dynamic =>
          (
            value.current.entries?.find(
              (candidate?: Dynamic): Dynamic =>
                candidate.format === format.format &&
                candidate.variant === format.variant,
            ) ?? format
          ).produce(request),
      }),
    );
    cleanupRef.current = registerExportFormats(formatOptions, {
      onResult: (result?: Dynamic): Dynamic =>
        value.current.opts?.onResult?.(result),
    });
  }, [registeredFormats]);
  (0, react_DB.useEffect)(
    (): Dynamic => (): Dynamic => {
      cleanupRef.current?.();
      cleanupRef.current = null;
    },
    [],
  );
}
export {
  activeExportRequests,
  clearExportReleaseTimer,
  enabledExportFormat,
  ExportCancelled,
  exportCapabilitiesByFormat,
  exportRequestsCompatible,
  interactiveExportWindowMs,
  isExportOutcomeFinal,
  noninteractiveExportWindowMs,
  normalizeExportFormats,
  onHostExportRequest,
  queuedExportRequests,
  react_DB,
  react_Su,
  receiveExportRequest,
  registeredExportFormats,
  registeredExportOptions,
  registerExportFormats,
  runExportProducer,
  scheduleInteractiveExportRelease,
  takeQueuedExportRequest,
  useExportFormats,
};
export function installExportHostRegistry(): () => void {
  return () => {
    react_Su = toModuleNamespace(load_react(), 1);
    initializeButtonButton();
    initializeComponentsIcon_2();
    initializeComponentsSelectionRing_5();
    react_DB = toModuleNamespace(load_react(), 1);
    noninteractiveExportWindowMs = 6e4;
    interactiveExportWindowMs = 5 * 6e4;
    ExportCancelled = class extends Error {
      declare name: Dynamic;
      constructor() {
        super("export cancelled");
        this.name = "ExportCancelled";
      }
    };
    registeredExportFormats = null;
    registeredExportOptions = {};
    queuedExportRequests = new Map();
    activeExportRequests = new Map();
  };
}
