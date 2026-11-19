import type * as Host from "../contracts/platform-host";
import type * as React from "react";
/** Restored application module; prepare first, initialize in original order. */

var capabilityLoadTimeoutMs: number;
function getClaudeBridge(): Host.ClaudeBridge | undefined {
  // MineDesign: the host is globalThis.designSystemHost (packages/design-system/src/editor/design-system-host.ts), not globalThis.claude.
  return (
    globalThis as typeof globalThis &
      Pick<Host.ProtocolGlobal, "designSystemHost">
  ).designSystemHost;
}
function hasClaudeCapabilityLoader(): boolean {
  return typeof getClaudeBridge()?.use === "function";
}
function getClaudeCapability(name: string): unknown {
  return getClaudeBridge()?.[name];
}
async function loadClaudeCapability(name: string): Promise<unknown> {
  let value = getClaudeBridge();
  if (typeof value?.use !== "function") {
    return null;
  }
  let capabilityResult = await value.use.call(value, name);
  if (
    (capabilityResult as { available?: unknown } | null | undefined)?.available ===
    false
  ) {
    return null;
  } else {
    return capabilityResult;
  }
}
async function getOrLoadClaudeCapability<Capability>(
  name: string,
  validate: (value: unknown) => value is Capability,
  timeoutMs: number = capabilityLoadTimeoutMs,
): Promise<Capability | null> {
  let value = getClaudeCapability(name);
  if (validate(value)) {
    return value;
  }
  return loadClaudeCapabilityWithTimeout(name, validate, timeoutMs);
}
async function loadClaudeCapabilityWithTimeout<Capability>(
  name: string,
  validate: (value: unknown) => value is Capability,
  timeoutMs: number = capabilityLoadTimeoutMs,
): Promise<Capability | null> {
  let value: ReturnType<typeof setTimeout> | undefined;
  try {
    let promise = new Promise<null>(
        (resolveTimeout) => (value = setTimeout(resolveTimeout, timeoutMs, null)),
      ),
      timedResult = await Promise.race([loadClaudeCapability(name), promise]);
    if (validate(timedResult)) {
      return timedResult;
    } else {
      return null;
    }
  } catch {
    return null;
  } finally {
    clearTimeout(value);
  }
}
function capabilityHasMethod<Method extends string>(
  methodName: Method,
): (
  input: unknown,
) => input is Record<Method, (...args: unknown[]) => unknown> {
  return (
    candidate: unknown,
  ): candidate is Record<Method, (...args: unknown[]) => unknown> =>
    (typeof candidate === "object" || typeof candidate === "function") &&
    candidate !== null &&
    typeof (candidate as Record<string, unknown>)[methodName] === "function";
}
export {
  capabilityHasMethod,
  capabilityLoadTimeoutMs,
  getClaudeBridge,
  getClaudeCapability,
  getOrLoadClaudeCapability,
  hasClaudeCapabilityLoader,
  loadClaudeCapability,
  loadClaudeCapabilityWithTimeout,
};
export function installHostClaudeCapabilities(): () => void {
  return () => {
    capabilityLoadTimeoutMs = 45000;
  };
}
