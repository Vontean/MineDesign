/** Restored application module; prepare first, initialize in original order. */
import {
  type Dynamic,
} from "../runtime-types";
import { awaitHostCapability, capabilityTimeoutMs } from "../platform/host-capabilities";
import { isEmbeddedApplication } from "../platform/hot-reload";

var embeddedFastEditWorkerSource: Dynamic;
var samplingCapabilityIntercepted: Dynamic;
var originalClaudeUse: Dynamic;
function interceptSamplingCapability(
  embedded: Dynamic = isEmbeddedApplication,
): Dynamic {
  if (!(samplingCapabilityIntercepted || embedded)) {
    samplingCapabilityIntercepted = true;
    try {
      // MineDesign: the host is globalThis.designHost (packages/design/src/editor/design-host.ts), not globalThis.claude.
      let claude: Dynamic = (globalThis as Dynamic).designHost;
      if (typeof claude?.use != "function") return;
      let value: Dynamic = claude.use.bind(claude);
      originalClaudeUse = value;
      Object.defineProperty(claude, "use", {
        value: (capabilityName?: Dynamic, capabilityOptions?: Dynamic): Dynamic =>
          capabilityName === "sample" ? Promise.resolve(null) : value(capabilityName, capabilityOptions),
        writable: true,
        configurable: true,
        enumerable: false,
      });
    } catch {}
  }
}
async function resolveSamplingCapability(
  isValid?: Dynamic,
  timeoutMs: Dynamic = capabilityTimeoutMs,
): Promise<Dynamic> {
  if (originalClaudeUse === null)
    return awaitHostCapability("sample", isValid, timeoutMs);
  let timeout: Dynamic;
  try {
    let promise: Dynamic = new Promise(
        (resolveTimeout?: Dynamic): Dynamic =>
          (timeout = setTimeout(resolveTimeout, timeoutMs, null)),
      ),
      value: Dynamic = await Promise.race([
        originalClaudeUse("sample"),
        promise,
      ]);
    return value?.available !== false && isValid(value) ? value : null;
  } catch {
    return null;
  } finally {
    clearTimeout(timeout);
  }
}
export {
  embeddedFastEditWorkerSource,
  interceptSamplingCapability,
  originalClaudeUse,
  resolveSamplingCapability,
  samplingCapabilityIntercepted,
};
export function installFastEditSamplingCapability(): () => void {
  return () => {
    embeddedFastEditWorkerSource = "";
    samplingCapabilityIntercepted = false;
    originalClaudeUse = null;
  };
}
