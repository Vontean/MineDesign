import type * as Host from "../contracts/platform-host";
import type * as React from "react";
/** Restored application module; prepare first, initialize in original order. */
import { capabilityHasMethod, loadClaudeCapabilityWithTimeout } from "../host/claude-capabilities";
import { isEmulatorPage } from "../platform/emulator";

var storedBlobPattern: RegExp;
async function getAssetsCapability(): Promise<Host.AssetsCapability | null> {
  // MineDesign: the host is globalThis.designSystemHost (packages/design-system/src/editor/design-system-host.ts), not globalThis.claude.
  let claude = (
    globalThis as typeof globalThis &
      Pick<Host.ProtocolGlobal, "designSystemHost">
  ).designSystemHost;
  if (typeof claude?.use === "function") {
    return loadClaudeCapabilityWithTimeout(
      "assets",
      capabilityHasMethod("upload"),
    ) as Promise<Host.AssetsCapability | null>;
  }
  if (typeof claude?.assets?.upload === "function") {
    return claude.assets;
  } else {
    return null;
  }
}
function isEmulatorBlobUrl(url: string): boolean {
  return url.startsWith("blob:") && isEmulatorPage();
}
function isStoredBlobReference(url: string): boolean {
  return storedBlobPattern.test(url) || isEmulatorBlobUrl(url);
}
export {
  getAssetsCapability,
  isEmulatorBlobUrl,
  isStoredBlobReference,
  storedBlobPattern,
};
export function installMediaAssets(): () => void {
  return () => {
    storedBlobPattern = /^\/?_blob\/[0-9a-f]{32}$/;
  };
}
