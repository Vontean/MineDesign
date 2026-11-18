import { uiMessage } from '@minedesign/contracts/ui-messages';
/** Restored application module; prepare first, initialize in original order. */
import {
  type Dynamic,
} from "../runtime-types";
import { getCachedHostCapability, hasCapabilityLoader, hasCapabilityMethod, resolveHostCapability } from "./host-capabilities";

var publishAuthorizationErrorCodes: Dynamic;
var hasPublishMethod: Dynamic;
var publishErrorCodes: Dynamic;
function hasCachedPublishCapability(): Dynamic {
  return hasPublishMethod(getCachedHostCapability("self"));
}
function canRequestPublishCapability(): Dynamic {
  return hasCachedPublishCapability() || hasCapabilityLoader();
}
function getPublishCapability(): Dynamic {
  return resolveHostCapability("self", hasPublishMethod);
}
function normalizePublishError(input?: Dynamic): Dynamic {
  if (typeof input == "object" && input !== null && "code" in input) {
    let code: Dynamic = input.code,
      message: Dynamic = input.message,
      live: Dynamic = input.live,
      say: Dynamic = input.say;
    if (typeof code == "string" && publishErrorCodes.has(code))
      return {
        code: code,
        message: typeof message == "string" ? message : code,
        live: typeof live == "string" ? live : undefined,
        ...(typeof say == "string"
          ? {
              say: say,
            }
          : {}),
      };
    if (typeof code == "string")
      return {
        code: "upstream_error",
        message:
          (typeof message == "string" ? message : "publish failed") +
          " (unrecognized code: " +
          code +
          ")",
      };
  }
  return {
    code: "upstream_error",
    message: input instanceof Error ? input.message : String(input),
  };
}
function requirePublishCapability(): Dynamic {
  if (!canRequestPublishCapability())
    throw new Error(
      // MineDesign: the host global is designHost.
      "window.designHost.self is missing \u2014 this view\u2019s runtime predates the self capability (or this page is running outside a Frame shell and the emulator). Content cannot be saved from here.",
    );
  return async (input?: Dynamic): Promise<Dynamic> => {
    let value: Dynamic = await getPublishCapability();
    if (value === null)
      throw {
        code: "not_granted",
        get message() { return uiMessage("canvas.publish.theSelfCapabilityIsNotAvailableToThisView"); },
      };
    return value.publish(input);
  };
}
export {
  canRequestPublishCapability,
  getPublishCapability,
  hasCachedPublishCapability,
  hasPublishMethod,
  normalizePublishError,
  publishAuthorizationErrorCodes,
  publishErrorCodes,
  requirePublishCapability,
};
export function installPlatformPublish(): () => void {
  return () => {
    publishAuthorizationErrorCodes = [
      "not_writer",
      "not_declared",
      "not_granted",
      "consent_required",
      "capability_disabled",
      "capability_removed",
    ];
    hasPublishMethod = hasCapabilityMethod("publish");
    publishErrorCodes = new Set([
      "conflict",
      "not_writer",
      "not_declared",
      "too_large",
      "invalid_content",
      "read_only_path",
      "rate_limited",
      "consent_required",
      "upstream_error",
      "not_granted",
      "capability_disabled",
      "capability_removed",
      "transform_error",
    ]);
  };
}
