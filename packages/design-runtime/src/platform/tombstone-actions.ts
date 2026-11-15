/** Restored application module; prepare first, initialize in original order. */
import {
  type Dynamic,
} from "../runtime-types";

function getTombstoneAction(input?: Dynamic): Dynamic {
  return !input.tombstone || input.deadStore
    ? "nothing"
    : input.canWrite
      ? "reopen-read-only-and-tell"
      : "tell";
}
export {
  getTombstoneAction,
};
export function installPlatformTombstoneActions(): () => void {
  return () => {};
}
