/** Restored application module; prepare first, initialize in original order. */
import {
  type Dynamic,
} from "../runtime-types";
import { load_react } from "../dependencies";
import { toModuleNamespace } from "../module-helpers";

var reactPlatformDesignSource: Dynamic;
var defaultTrustedOrigins: Dynamic;
var getTrustedHostOriginsValue: Dynamic;
var designSource: Dynamic;
var sourceFile: Dynamic;
var sourceListeners: Dynamic;
function getTrustedHostOrigins(
  frameWindow: Dynamic = typeof window == "object" ? window : undefined,
): Dynamic {
  try {
    let preambleOrigins: Dynamic = frameWindow?.__FRAME_PREAMBLE?.origins;
    if (Array.isArray(preambleOrigins))
      return preambleOrigins.filter(
        (origin?: Dynamic): Dynamic => typeof origin == "string",
      );
  } catch {}
  return defaultTrustedOrigins;
}
function setDesignSource(nextSource?: Dynamic): Dynamic {
  if (
    !(
      nextSource === designSource ||
      (nextSource !== null &&
        designSource !== null &&
        nextSource.url === designSource.url &&
        nextSource.projectId === designSource.projectId &&
        nextSource.exportedAt === designSource.exportedAt)
    )
  ) {
    designSource = nextSource;
    for (let notify of sourceListeners as Dynamic) notify();
  }
}
function updateDesignSourceFile(nextSourceFile?: Dynamic): Dynamic {
  nextSourceFile !== sourceFile &&
    ((sourceFile = nextSourceFile), setDesignSource(null));
}
function getDesignSource(): Dynamic {
  return designSource;
}
function subscribeDesignSource(listener?: Dynamic): Dynamic {
  sourceListeners.add(listener);
  return (): Dynamic => {
    sourceListeners.delete(listener);
  };
}
function useDesignSource(): Dynamic {
  return (0, reactPlatformDesignSource.useSyncExternalStore)(
    subscribeDesignSource,
    getDesignSource,
    getDesignSource,
  );
}
export {
  getDesignSource,
  getTrustedHostOrigins,
  getTrustedHostOriginsValue,
  designSource as PlatformDesignSourceAlias,
  defaultTrustedOrigins as PlatformDesignSourceItems,
  sourceListeners as PlatformDesignSourceSubscribers,
  reactPlatformDesignSource,
  setDesignSource,
  subscribeDesignSource,
  updateDesignSourceFile,
  useDesignSource,
};
export function installPlatformDesignSource(): () => void {
  return () => {
    reactPlatformDesignSource = toModuleNamespace(
      load_react(),
      1,
    );
    // MineDesign: no host frame is trusted by default; a page that needs one declares origins in __FRAME_PREAMBLE.
    defaultTrustedOrigins = [];
    getTrustedHostOriginsValue = getTrustedHostOrigins();
    designSource = null;
    sourceListeners = new Set();
  };
}
