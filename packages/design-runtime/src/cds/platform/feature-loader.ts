/** Restored application module; prepare first, initialize in original order. */
import {
  type Dynamic,
} from "../../runtime-types";
import { initializeOnce } from "../../module-helpers";

var featureLoaderOverride: Dynamic;
var initializePlatformFeatureLoader: Dynamic;
function loadApplicationFeature(featureName?: Dynamic, loadFeature?: Dynamic): Dynamic {
  try {
    return featureLoaderOverride
      ? Promise.resolve(featureLoaderOverride(featureName, loadFeature))
      : loadFeature();
  } catch (error: Dynamic) {
    return Promise.reject(
      error instanceof Error ? error : new Error(String(error)),
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
    initializePlatformFeatureLoader = initializeOnce(
      (): Dynamic => {},
    );
  };
}
