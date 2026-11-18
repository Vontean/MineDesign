/** Restored application module; prepare first, initialize in original order. */
import { loadReactNamespace } from "../dependencies";
import { toModuleNamespace } from "../module-helpers";

var DesignSystemReactRuntime: typeof import("react");
export {
  DesignSystemReactRuntime,
};
export function installModelReactRuntime(): () => void {
  return () => {
    DesignSystemReactRuntime = toModuleNamespace(
      loadReactNamespace(),
      1,
    );
  };
}
