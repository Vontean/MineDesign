/** Restored application module; prepare first, initialize in original order. */
import {
  type Dynamic,
} from "../runtime-types";
import { readReadOnlyStash } from "./document-stash";
import { getAssetsCapability } from "./image-upload";
import { canRequestPublishCapability } from "./publish";
import { getCurrentUserCanEdit, getCurrentUserPermission } from "./user-capabilities";

var SIGN_IN_REQUIRED_REASON: Dynamic;
var EDITING_UNAVAILABLE_REASON: Dynamic;
var LIVE_READONLY_REASON: Dynamic;
var CANVAS_READ_ERROR_REASON: Dynamic;
var unavailableEmbeddedCache: Dynamic;
var EMPTY_EMBEDDED_CONTENT: Dynamic;
async function resolveDesignWriteAccess(): Promise<Dynamic> {
  if (!(0, canRequestPublishCapability)())
    return {
      canWrite: false,
      reason: EDITING_UNAVAILABLE_REASON,
    };
  let value: Dynamic = (0, readReadOnlyStash)();
  if (value !== null)
    return {
      canWrite: false,
      reason: value,
    };
  let [value2, value3, value4, value5]: Dynamic = await Promise.all([
    (0, getCurrentUserPermission)("data.write"),
    (0, getCurrentUserPermission)("files.write"),
    (0, getCurrentUserCanEdit)(),
    (0, getAssetsCapability)(),
  ]);
  return value2 !== null || value3 !== null
    ? (value2 === true || value3 === true) && value4 !== false
      ? {
          canWrite: true,
        }
      : {
          canWrite: false,
          reason: LIVE_READONLY_REASON,
        }
    : value4 !== true && value5 === null
      ? {
          canWrite: false,
          reason: LIVE_READONLY_REASON,
        }
      : {
          canWrite: true,
        };
}
function createReadonlyEmbeddedCache(input?: Dynamic): Dynamic {
  return {
    read: (): Dynamic => input,
    write: (): Dynamic => false,
    clear(): Dynamic {},
  };
}
function createEmbeddedReadonlyState(
  input?: Dynamic,
  options: Dynamic = SIGN_IN_REQUIRED_REASON,
): Dynamic {
  return {
    embeddedState: {
      title:
        typeof document !== "undefined"
          ? (document as Dynamic).title
          : undefined,
      content: input,
      comments: [],
    },
    roFlag: createReadonlyEmbeddedCache(options),
    stash: unavailableEmbeddedCache,
    canPublish: true,
    pageParts: EMPTY_EMBEDDED_CONTENT,
  };
}
export {
  CANVAS_READ_ERROR_REASON,
  createEmbeddedReadonlyState,
  createReadonlyEmbeddedCache,
  EDITING_UNAVAILABLE_REASON,
  EMPTY_EMBEDDED_CONTENT,
  LIVE_READONLY_REASON,
  resolveDesignWriteAccess,
  SIGN_IN_REQUIRED_REASON,
  unavailableEmbeddedCache,
};
export function installPlatformWriteAccess(): () => void {
  return () => {
    SIGN_IN_REQUIRED_REASON =
      // MineDesign: user-facing copy calls the agent "the agent", not Claude.
      "Sign in to see this content, then reload the page. If you\u2019re already signed in, you might not have access to it.";
    EDITING_UNAVAILABLE_REASON = "Editing isn\u2019t available in this view.";
    LIVE_READONLY_REASON = "Read-only. You can view live changes.";
    CANVAS_READ_ERROR_REASON =
      "Couldn\u2019t read the full file list. Reload to try again.";
    unavailableEmbeddedCache = {
      read: (): Dynamic => null,
      write: (): Dynamic => false,
      clear(): Dynamic {},
    };
    EMPTY_EMBEDDED_CONTENT = {
      title: "",
      readme: "",
      readmeMeta: "",
      css: "",
      js: "",
      emulator: false,
    };
  };
}
