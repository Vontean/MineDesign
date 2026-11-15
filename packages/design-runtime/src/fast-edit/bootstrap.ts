/** Restored application module; prepare first, initialize in original order. */
import {
  type Dynamic,
} from "../runtime-types";
import { setEditorReadyPromise } from "../editor/selection/host";
import { registerFastEditComposer } from "./composer";
import { embeddedFastEditWorkerSource, resolveSamplingCapability } from "./sampling-capability";
import { createSamplingClient, fastEditSandboxAdapter } from "./sandbox-adapter";
import { installFastEditWorker } from "./sandbox";
import { fastEditCanvasSystemPrompt, fastEditFilesSystemPrompt } from "./system-prompts";
import { awaitFeatureFlag } from "../platform/feature-flags";

var FAST_EDIT_WORKER_META_NAME: Dynamic;
var FAST_EDIT_WORKER_FETCH_RETRY_MS: Dynamic;
var FAST_EDIT_WORKER_FETCH_TIMEOUT_MS: Dynamic;
var FAST_EDIT_FEATURE_FLAG: Dynamic;
var FAST_EDIT_SAMPLING_FLAG: Dynamic;
var FAST_EDIT_MODEL_TIERS: Dynamic;
var FAST_EDIT_REASONING_EFFORTS: Dynamic;
async function loadFastEditWorker(options?: Dynamic): Promise<Dynamic> {
  let workerUrl: Dynamic = options.address();
  if (workerUrl === undefined) return false;
  for (let index: Dynamic = 0; ; index++) {
    let controller: Dynamic = new AbortController(),
      value: Dynamic = options.timer(
        FAST_EDIT_WORKER_FETCH_TIMEOUT_MS,
        (): Dynamic => controller.abort(),
      ),
      index2: Dynamic = 0,
      value2: Dynamic;
    try {
      let value3: Dynamic = await options.fetch(workerUrl, {
        priority: "low",
        signal: controller.signal,
      });
      index2 = value3.status;
      value3.ok && (value2 = new Uint8Array(await value3.arrayBuffer()));
    } catch {
      index2 = 0;
    } finally {
      value();
    }
    if (value2 !== undefined)
      try {
        return await options.accept(value2);
      } catch {
        return false;
      }
    if (
      !(index2 === 0 || index2 === 401 || index2 === 403) ||
      index >= FAST_EDIT_WORKER_FETCH_RETRY_MS.length
    )
      return false;
    await options.wait(FAST_EDIT_WORKER_FETCH_RETRY_MS[index]);
  }
}
function getFastEditWorkerUrl(): Dynamic {
  if (typeof document === "undefined") return;
  let value: Dynamic = (document as Dynamic)
    .querySelector('meta[name="' + FAST_EDIT_WORKER_META_NAME + '"]')
    ?.getAttribute("content");
  if (value)
    try {
      return new URL(value, (document as Dynamic).baseURI).href;
    } catch {
      return;
    }
}
async function readFastEditSamplingConfiguration(): Promise<Dynamic> {
  let {
      modelTier: value,
      model: value2,
      effort: value3,
    }: Dynamic = await (0, awaitFeatureFlag)(
      FAST_EDIT_SAMPLING_FLAG,
      {
        modelTier: "quick",
      },
    ),
    value4: Dynamic = FAST_EDIT_REASONING_EFFORTS.find(
      (input?: Dynamic): Dynamic => input === value3,
    );
  return {
    modelTier:
      FAST_EDIT_MODEL_TIERS.find(
        (input?: Dynamic): Dynamic => input === value,
      ) ?? "quick",
    ...(typeof value2 == "string" && value2 !== ""
      ? {
          model: value2,
        }
      : {}),
    ...(value4 !== undefined
      ? {
          effort: value4,
        }
      : {}),
  };
}
function initializeFastEdit(
  readFeatureFlag: Dynamic = awaitFeatureFlag,
  registerComposer: Dynamic = registerFastEditComposer,
): Dynamic {
  let enabledPromise: Dynamic = readFeatureFlag(
      FAST_EDIT_FEATURE_FLAG,
      false,
    ),
    workerAvailablePromise: Dynamic = enabledPromise
      .then(
        (input?: Dynamic): Dynamic =>
          input
            ? embeddedFastEditWorkerSource !== ""
              ? (0, installFastEditWorker)(
                  new TextEncoder().encode(
                    embeddedFastEditWorkerSource,
                  ),
                )
              : loadFastEditWorker({
                  address: getFastEditWorkerUrl,
                  fetch: (input2?: Dynamic, options?: Dynamic): Dynamic =>
                    fetch(input2, options),
                  wait: (input2?: Dynamic): Dynamic =>
                    new Promise(
                      (input3?: Dynamic): Dynamic =>
                        setTimeout(input3, input2),
                    ),
                  timer: (input2?: Dynamic, options?: Dynamic): Dynamic => {
                    let value: Dynamic = setTimeout(options, input2);
                    return (): Dynamic => clearTimeout(value);
                  },
                  accept: installFastEditWorker,
                })
            : false,
      )
      .catch((): Dynamic => false);
  (0, setEditorReadyPromise)(
    enabledPromise.then(
      async (input?: Dynamic): Promise<Dynamic> =>
        input &&
        (await (0, resolveSamplingCapability)(
          (input2?: Dynamic): Dynamic => typeof input2 == "function",
        )) !== null &&
        (await workerAvailablePromise),
    ),
  );
  enabledPromise.then(async (input?: Dynamic): Promise<Dynamic> => {
    if (!input) return;
    let { modelTier: value, ...value2 }: Dynamic =
      await readFastEditSamplingConfiguration();
    registerComposer({
      commentRules: fastEditCanvasSystemPrompt,
      newArtboardRules: fastEditFilesSystemPrompt,
      createEngine: (input2?: Dynamic): Dynamic =>
        (0, createSamplingClient)(input2, value2),
      sandbox: {
        ...fastEditSandboxAdapter,
        available: workerAvailablePromise,
      },
      tier: value,
    });
  });
}
export {
  FAST_EDIT_FEATURE_FLAG,
  FAST_EDIT_MODEL_TIERS,
  FAST_EDIT_REASONING_EFFORTS,
  FAST_EDIT_SAMPLING_FLAG,
  FAST_EDIT_WORKER_FETCH_RETRY_MS,
  FAST_EDIT_WORKER_FETCH_TIMEOUT_MS,
  FAST_EDIT_WORKER_META_NAME,
  getFastEditWorkerUrl,
  initializeFastEdit,
  loadFastEditWorker,
  readFastEditSamplingConfiguration,
};
export function installFastEditBootstrap(): () => void {
  return () => {
    FAST_EDIT_WORKER_META_NAME = "fast-edit-worker-file";
    FAST_EDIT_WORKER_FETCH_RETRY_MS = [1500, 6e3];
    FAST_EDIT_WORKER_FETCH_TIMEOUT_MS = 3e4;
    FAST_EDIT_FEATURE_FLAG = "design_fast_edit";
    FAST_EDIT_SAMPLING_FLAG = "design_fast_edit_sample";
    FAST_EDIT_MODEL_TIERS = ["quick", "default", "complex"];
    FAST_EDIT_REASONING_EFFORTS = ["low", "medium", "high"];
  };
}
