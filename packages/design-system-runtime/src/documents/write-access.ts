import type * as Host from "../contracts/platform-host";
import type * as React from "react";
/** Restored application module; prepare first, initialize in original order. */
import { selfPublishAvailable } from "./self-publish";
import { readCurrentArtifactReadOnlyReason } from "./storage";
import { currentUserCan, currentUserCanEdit } from "../host/user-api";
import { getAssetsCapability } from "../media/assets";

var CONTENT_SIGN_IN_REQUIRED_MESSAGE: string;
var EDITING_UNAVAILABLE_MESSAGE: string;
var LIVE_READ_ONLY_MESSAGE: string;
var FILE_LIST_UNAVAILABLE_MESSAGE: string;
var unavailableStorageSlot: Host.StorageSlot;
async function determineSlidesWriteAccess(): Promise<Host.WriteAccess> {
  if (!(0, selfPublishAvailable)()) {
    return {
      canWrite: false,
      reason: EDITING_UNAVAILABLE_MESSAGE,
    };
  }
  let options = (0, readCurrentArtifactReadOnlyReason)();
  if (options !== null) {
    return {
      canWrite: false,
      reason: options,
    };
  }
  let [value, value2, value3, value4] = await Promise.all([
    (0, currentUserCan)("data.write"),
    (0, currentUserCan)("files.write"),
    (0, currentUserCanEdit)(),
    (0, getAssetsCapability)(),
  ]);
  if (value !== null || value2 !== null) {
    if ((value === true || value2 === true) && value3 !== false) {
      return {
        canWrite: true,
      };
    } else {
      return {
        canWrite: false,
        reason: LIVE_READ_ONLY_MESSAGE,
      };
    }
  }
  if (value3 !== true && value4 === null) {
    return {
      canWrite: false,
      reason: LIVE_READ_ONLY_MESSAGE,
    };
  }
  return {
    canWrite: true,
  };
}
export {
  CONTENT_SIGN_IN_REQUIRED_MESSAGE,
  determineSlidesWriteAccess,
  EDITING_UNAVAILABLE_MESSAGE,
  FILE_LIST_UNAVAILABLE_MESSAGE,
  LIVE_READ_ONLY_MESSAGE,
  unavailableStorageSlot,
};
export function installDocumentsWriteAccess(): () => void {
  return () => {
    CONTENT_SIGN_IN_REQUIRED_MESSAGE =
      // MineDesign: user-facing copy calls the agent "the agent", not Claude.
      "Sign in to see this content, then reload the page. If you’re already signed in, you might not have access to it.";
    EDITING_UNAVAILABLE_MESSAGE = "Editing isn’t available in this view.";
    LIVE_READ_ONLY_MESSAGE = "Read-only. You can view live changes.";
    FILE_LIST_UNAVAILABLE_MESSAGE =
      "Couldn’t read the full file list. Reload to try again.";
    unavailableStorageSlot = {
      read: (): null => null,
      write: (): boolean => false,
      clear(): void {},
    };
  };
}
