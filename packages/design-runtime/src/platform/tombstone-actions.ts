/** Restored application module; prepare first, initialize in original order. */
import {
  type Dynamic,
} from "../runtime-types";

function getTombstoneAction(documentState?: Dynamic): Dynamic {
  return !documentState.tombstone || documentState.deadStore
    ? "nothing"
    : documentState.canWrite
      ? "reopen-read-only-and-tell"
      : "tell";
}
export {
  getTombstoneAction,
};
export function installPlatformTombstoneActions(): () => void {
  return () => {};
}
