/** Restored application module; prepare first, initialize in original order. */
import {
  type Dynamic,
} from "../../runtime-types";
import { initializeOnce } from "../../module-helpers";

var featureLoaderOverride: Dynamic;
var initializePlatformFeatureLoader: Dynamic;
function loadApplicationFeature(input?: Dynamic, options?: Dynamic): Dynamic {
  try {
    return featureLoaderOverride
      ? Promise.resolve(featureLoaderOverride(input, options))
      : options();
  } catch (value: Dynamic) {
    return Promise.reject(
      value instanceof Error ? value : new Error(String(value)),
    );
  }
}
export {
  featureLoaderOverride,
  initializePlatformFeatureLoader,
  loadApplicationFeature,
};
export function installCdsPlatformFeatureLoader(): () => void {
  return () => {
    initializePlatformFeatureLoader = (0, initializeOnce)(
      (): Dynamic => {},
    );
  };
}
