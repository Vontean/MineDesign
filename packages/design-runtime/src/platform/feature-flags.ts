/** Restored application module; prepare first, initialize in original order. */
import {
  type Dynamic,
} from "../runtime-types";

var AppifactFlagsValue: Dynamic;
var DesignArtboardsAtAddressValue: Dynamic;
var PlatformFeatureFlagsThenValue: Dynamic;
var artboardAddressFlagResolved: Dynamic;
var PlatformFeatureFlagsSubscribers: Dynamic;
function getFeatureFlags(): Dynamic {
  let candidate: Dynamic = (globalThis as Dynamic)[AppifactFlagsValue];
  if (typeof candidate != "object" || candidate === null) return;
  let flagApi: Dynamic = candidate;
  return typeof flagApi.ready == "function" &&
    typeof flagApi.get == "function" &&
    typeof flagApi.all == "function"
    ? candidate
    : undefined;
}
function matchesFeatureFlagType(flagValue?: Dynamic, fallbackValue?: Dynamic): Dynamic {
  return fallbackValue === null
    ? true
    : Array.isArray(fallbackValue)
      ? Array.isArray(flagValue)
      : typeof fallbackValue == "object"
        ? typeof flagValue == "object" && flagValue !== null && !Array.isArray(flagValue)
        : typeof flagValue == typeof fallbackValue;
}
async function awaitFeatureFlag(
  flagKey?: Dynamic,
  fallbackValue?: Dynamic,
): Promise<Dynamic> {
  try {
    let flagApi: Dynamic = getFeatureFlags();
    if (flagApi === undefined) return fallbackValue;
    try {
      await flagApi.ready();
    } catch {}
    let flagValue: Dynamic = flagApi.get(flagKey, fallbackValue);
    return matchesFeatureFlagType(flagValue, fallbackValue) ? flagValue : fallbackValue;
  } catch {
    return fallbackValue;
  }
}
function getFeatureFlag(flagKey?: Dynamic, fallbackValue?: Dynamic): Dynamic {
  try {
    let flagValue: Dynamic = getFeatureFlags()?.get(flagKey, fallbackValue);
    return flagValue !== undefined && matchesFeatureFlagType(flagValue, fallbackValue)
      ? flagValue
      : fallbackValue;
  } catch {
    return fallbackValue;
  }
}
function artboardsAtAddressEnabled(): Dynamic {
  return getFeatureFlag(DesignArtboardsAtAddressValue, false);
}
function subscribeArtboardsAtAddressFlag(listener?: Dynamic): Dynamic {
  return artboardAddressFlagResolved || artboardsAtAddressEnabled()
    ? (): Dynamic => {}
    : (PlatformFeatureFlagsSubscribers.add(listener),
      (PlatformFeatureFlagsThenValue ??= awaitFeatureFlag(
        DesignArtboardsAtAddressValue,
        false,
      ).then((isEnabled?: Dynamic): Dynamic => {
        artboardAddressFlagResolved = true;
        let listeners: Dynamic = [...PlatformFeatureFlagsSubscribers];
        PlatformFeatureFlagsSubscribers.clear();
        if (isEnabled)
          for (let notify of listeners as Dynamic)
            try {
              notify();
            } catch {}
        return isEnabled;
      })),
      (): Dynamic => {
        PlatformFeatureFlagsSubscribers.delete(listener);
      });
}
export {
  AppifactFlagsValue,
  artboardAddressFlagResolved,
  artboardsAtAddressEnabled,
  awaitFeatureFlag,
  DesignArtboardsAtAddressValue,
  getFeatureFlag,
  getFeatureFlags,
  matchesFeatureFlagType,
  PlatformFeatureFlagsSubscribers,
  PlatformFeatureFlagsThenValue,
  subscribeArtboardsAtAddressFlag,
};
export function installPlatformFeatureFlags(): () => void {
  return () => {
    AppifactFlagsValue = "__appifact_flags";
    DesignArtboardsAtAddressValue = "design_artboards_at_address";
    artboardAddressFlagResolved = false;
    PlatformFeatureFlagsSubscribers = new Set();
  };
}
