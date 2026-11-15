/** Restored application module; prepare first, initialize in original order. */
import {
  type Dynamic,
} from "../runtime-types";
import { injected_PTt } from "../dependencies";

var standaloneExportBootstrapScript: Dynamic;
export {
  standaloneExportBootstrapScript,
};
export function installExportStandaloneBootstrap(): () => void {
  return () => {
    standaloneExportBootstrapScript = injected_PTt;
  };
}
