/** Worker entry: disable network/storage APIs, cap console output and dispatch input. */
import { createEditRuntime, DEFAULT_LIMITS } from "./runtime";
import type { Dynamic } from "./types";
try {
  Function("");
} catch (value: Dynamic) {
  throw Error(
    "eval is blocked in the sandbox Worker (the page CSP must allow unsafe-eval for the frame)",
  );
}
var sendWorkerMessage: Dynamic = (self as Dynamic).postMessage.bind(self);
var scheduleHeartbeat: Dynamic = (self as Dynamic).setInterval.bind(self);
var BLOCKED_WORKER_CAPABILITIES: Dynamic = [
  "fetch",
  "XMLHttpRequest",
  "WebSocket",
  "WebSocketStream",
  "WebTransport",
  "EventSource",
  "FontFace",
  "importScripts",
  "Worker",
  "SharedWorker",
  "BroadcastChannel",
  "indexedDB",
  "caches",
  "RTCPeerConnection",
  "Request",
  "createImageBitmap",
];
for (let value of BLOCKED_WORKER_CAPABILITIES) {
  for (
    let globalPrototype: Dynamic = self;
    globalPrototype && globalPrototype !== Object.prototype;
    globalPrototype = Object.getPrototypeOf(globalPrototype)
  )
    try {
      delete globalPrototype[value];
    } catch (propertyDeleteError: Dynamic) {}
  try {
    Object.defineProperty(self, value, {
      value: undefined,
      writable: false,
      configurable: false,
    });
  } catch (definePropertyError: Dynamic) {}
}
try {
  let value: Dynamic = Object.getPrototypeOf((self as Dynamic).navigator);
  delete value.sendBeacon;
  delete value.serviceWorker;
  delete value.storage;
  delete value.locks;
} catch (value: Dynamic) {}
var consoleLogCount: Dynamic = 0;
var createConsoleLogger: Dynamic =
  (logLevel?: Dynamic, ..._extraArguments: Dynamic[]): Dynamic =>
  (...consoleArguments: Dynamic[]): Dynamic => {
    if (consoleLogCount++ >= DEFAULT_LIMITS.maxLogs) return;
    let value: Dynamic;
    try {
      value = consoleArguments
        .map(
          (loggedValue?: Dynamic, ..._unusedArguments: Dynamic[]): Dynamic =>
            typeof loggedValue === "string"
              ? loggedValue
              : (JSON.stringify(loggedValue) ?? String(loggedValue)),
        )
        .join(" ");
    } catch (serializationError: Dynamic) {
      value = consoleArguments.map(String).join(" ");
    }
    sendWorkerMessage({
      kind: "log",
      message: (logLevel === "log" ? "" : logLevel + ": ") + value.slice(0, 1500),
    });
  };
(self as Dynamic).console = {
  log: createConsoleLogger("log"),
  info: createConsoleLogger("log"),
  debug: createConsoleLogger("log"),
  warn: createConsoleLogger("warn"),
  error: createConsoleLogger("error"),
  trace(): Dynamic {},
  table: createConsoleLogger("log"),
  group(): Dynamic {},
  groupEnd(): Dynamic {},
  assert(): Dynamic {},
  time(): Dynamic {},
  timeEnd(): Dynamic {},
};
var editRuntime: Dynamic = createEditRuntime(sendWorkerMessage);
scheduleHeartbeat(
  (..._unusedArguments: Dynamic[]): Dynamic =>
    sendWorkerMessage({
      kind: "beat",
    }),
  500,
);
(self as Dynamic).onmessage = (
  messageEvent?: Dynamic,
  ..._unusedArguments: Dynamic[]
): Dynamic => {
  let data: Dynamic = messageEvent.data;
  if (!data || typeof data !== "object") return;
  try {
    if (data.kind === "init")
      editRuntime.init(
        data.html,
        data.deck || null,
        data.verbs || null,
        data.sdk || null,
        {
          previewMs: data.previewMs,
          pace: data.pace,
          chains: data.chains,
        },
      );
    else if (data.kind === "chunk" && typeof data.text === "string")
      editRuntime.chunk(data.text);
    else if (data.kind === "flush") editRuntime.flush();
    else if (data.kind === "view") editRuntime.view(data.id, data.req);
    else if (data.kind === "handles") editRuntime.handles(data.since, data.req);
    else if (data.kind === "end") editRuntime.end();
  } catch (value: Dynamic) {
    sendWorkerMessage({
      kind: "error",
      message: ("sandbox: " + String(value)).slice(0, 500),
      stmt: "",
    });
  }
};
