/** Restored application module; prepare first, initialize in original order. */
import {
  type Dynamic,
} from "../runtime-types";
import { isNarrowedFileContext } from "./file-content";

var PlatformAccessRetryItems: Dynamic;
function isRetryableAccessFailure(error?: Dynamic): Dynamic {
  let value: Dynamic = error?.status;
  return value === 401 || value === 403 || value === 404;
}
async function listWritableFiles(access?: Dynamic): Promise<Dynamic> {
  if (
    access.mayWrite === true &&
    typeof access.listUnlessNarrowed == "function"
  )
    return await access.listUnlessNarrowed();
  let value: Dynamic = await access.list();
  if (
    access.mayWrite === true &&
    isNarrowedFileContext(value, access)
  )
    throw {
      code: "http",
      status: 403,
      narrowed: true,
      message: "_files.json: marked as narrowed",
    };
  return value;
}
async function retryAccessFailure(
  operation?: Dynamic,
  retryOptions?: Dynamic,
  onRetry?: Dynamic,
  items: Dynamic = PlatformAccessRetryItems,
): Promise<Dynamic> {
  let value: Dynamic = retryOptions ?? {
    setTimeout: (resolve?: Dynamic, delay?: Dynamic): Dynamic =>
      setTimeout(resolve, delay),
  };
  for (let index: Dynamic = 0; ; index++)
    try {
      return await operation();
    } catch (error: Dynamic) {
      if (index >= items.length || !isRetryableAccessFailure(error))
        throw error;
      onRetry?.(index + 1, error);
      await new Promise((resolveAttempt?: Dynamic): Dynamic => {
        value.setTimeout(resolveAttempt, items[index]);
      });
    }
}
export {
  isRetryableAccessFailure,
  listWritableFiles,
  PlatformAccessRetryItems,
  retryAccessFailure,
};
export function installPlatformAccessRetry(): () => void {
  return () => {
    PlatformAccessRetryItems = [50, 100, 200, 400, 800];
  };
}
