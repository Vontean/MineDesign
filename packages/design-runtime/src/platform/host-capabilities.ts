/** Restored application module; prepare first, initialize in original order. */
import {
  type Dynamic,
} from "../runtime-types";

var capabilityTimeoutMs: Dynamic;
function getClaudeHost(): Dynamic {
  // MineDesign: the host is globalThis.designHost (packages/design/src/editor/design-host.ts), not globalThis.claude.
  return (globalThis as Dynamic).designHost;
}
function hasCapabilityLoader(): Dynamic {
  return typeof getClaudeHost()?.use == "function";
}
function getCachedHostCapability(name?: Dynamic): Dynamic {
  return getClaudeHost()?.[name];
}
async function requestHostCapability(name?: Dynamic): Promise<Dynamic> {
  let host: Dynamic = getClaudeHost();
  if (typeof host?.use != "function") return null;
  let capability: Dynamic = await host.use.call(host, name);
  return capability?.available === false ? null : capability;
}
async function resolveHostCapability(
  name?: Dynamic,
  isUsable?: Dynamic,
  timeoutMs: Dynamic = capabilityTimeoutMs,
): Promise<Dynamic> {
  let cachedCapability: Dynamic = getCachedHostCapability(name);
  return isUsable(cachedCapability)
    ? cachedCapability
    : awaitHostCapability(name, isUsable, timeoutMs);
}
async function awaitHostCapability(
  name?: Dynamic,
  isUsable?: Dynamic,
  timeoutMs: Dynamic = capabilityTimeoutMs,
): Promise<Dynamic> {
  let timeout: Dynamic;
  try {
    let timeoutPromise: Dynamic = new Promise(
        (resolve?: Dynamic): Dynamic =>
          (timeout = setTimeout(resolve, timeoutMs, null)),
      ),
      capability: Dynamic = await Promise.race([
        requestHostCapability(name),
        timeoutPromise,
      ]);
    return isUsable(capability) ? capability : null;
  } catch {
    return null;
  } finally {
    clearTimeout(timeout);
  }
}
function hasCapabilityMethod(method?: Dynamic): Dynamic {
  return (capability?: Dynamic): Dynamic =>
    (typeof capability == "object" || typeof capability == "function") &&
    capability !== null &&
    typeof capability[method] == "function";
}
export {
  awaitHostCapability,
  capabilityTimeoutMs,
  getCachedHostCapability,
  getClaudeHost,
  hasCapabilityLoader,
  hasCapabilityMethod,
  requestHostCapability,
  resolveHostCapability,
};
export function installPlatformHostCapabilities(): () => void {
  return () => {
    capabilityTimeoutMs = 45e3;
  };
}
