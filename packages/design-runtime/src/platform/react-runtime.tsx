/** Restored application module; prepare first, initialize in original order. */
import {
  type Dynamic,
} from "../runtime-types";
import { dcSupportSource, load_react_dom_client, react18UmdSource, reactDom18UmdSource } from "../dependencies";
import { toModuleNamespace } from "../module-helpers";

var reactDomClientPlatformReactRuntime: Dynamic;
var runtimeEmbeddedReact: Dynamic;
export {
  reactDomClientPlatformReactRuntime,
  runtimeEmbeddedReact,
};
export function installPlatformReactRuntime(): () => void {
  return () => {
    reactDomClientPlatformReactRuntime = toModuleNamespace(
      load_react_dom_client(),
      1,
    );
    runtimeEmbeddedReact = {
      reactUmd: react18UmdSource,
      reactDomUmd: reactDom18UmdSource,
      supportJs: dcSupportSource,
    };
  };
}
