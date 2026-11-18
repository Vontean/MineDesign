/** Restored application module; prepare first, initialize in original order. */
import {
  type Dynamic,
} from "../runtime-types";
import { load_react } from "../dependencies";
import { toModuleNamespace } from "../module-helpers";

var reactPlatformDesignSource: Dynamic;
var PlatformDesignSourceItems: Dynamic;
var getTrustedHostOriginsValue: Dynamic;
var PlatformDesignSourceAlias: Dynamic;
var PlatformDesignSourceAlias_2: Dynamic;
var PlatformDesignSourceSubscribers: Dynamic;
function getTrustedHostOrigins(
  input: Dynamic = typeof window == "object" ? window : undefined,
): Dynamic {
  try {
    let value: Dynamic = input?.__FRAME_PREAMBLE?.origins;
    if (Array.isArray(value))
      return value.filter(
        (input2?: Dynamic): Dynamic => typeof input2 == "string",
      );
  } catch {}
  return PlatformDesignSourceItems;
}
function setDesignSource(input?: Dynamic): Dynamic {
  if (
    !(
      input === PlatformDesignSourceAlias ||
      (input !== null &&
        PlatformDesignSourceAlias !== null &&
        input.url === PlatformDesignSourceAlias.url &&
        input.projectId === PlatformDesignSourceAlias.projectId &&
        input.exportedAt === PlatformDesignSourceAlias.exportedAt)
    )
  ) {
    PlatformDesignSourceAlias = input;
    for (let value of PlatformDesignSourceSubscribers as Dynamic) value();
  }
}
function updateDesignSourceFile(input?: Dynamic): Dynamic {
  input !== PlatformDesignSourceAlias_2 &&
    ((PlatformDesignSourceAlias_2 = input), setDesignSource(null));
}
function getDesignSource(): Dynamic {
  return PlatformDesignSourceAlias;
}
function subscribeDesignSource(input?: Dynamic): Dynamic {
  PlatformDesignSourceSubscribers.add(input);
  return (): Dynamic => {
    PlatformDesignSourceSubscribers.delete(input);
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
  PlatformDesignSourceAlias,
  PlatformDesignSourceAlias_2,
  PlatformDesignSourceItems,
  PlatformDesignSourceSubscribers,
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
    PlatformDesignSourceItems = [];
    getTrustedHostOriginsValue = getTrustedHostOrigins();
    PlatformDesignSourceAlias = null;
    PlatformDesignSourceSubscribers = new Set();
  };
}
