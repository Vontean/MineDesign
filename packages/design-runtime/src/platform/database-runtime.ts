/** Restored application module; prepare first, initialize in original order. */
import {
  type Dynamic,
} from "../runtime-types";

var databaseRuntimeSnapshot: Dynamic;
function setDatabaseRuntimeSnapshot(snapshot?: Dynamic): Dynamic {
  databaseRuntimeSnapshot = snapshot;
}
function getDatabaseRuntimeSnapshot(): Dynamic {
  return databaseRuntimeSnapshot;
}
async function initializeDatabaseRuntime(): Promise<Dynamic> {
  if (typeof window === "undefined") return;
  let frameWindow: Dynamic = window;
  if (frameWindow.appifact !== undefined)
    try {
      let databaseRuntime: Dynamic = await frameWindow.appifact.ready();
      if (databaseRuntime.saving.mode !== "auto") return;
      let documentSnapshot: Dynamic = await databaseRuntime.doc.getAll();
      setDatabaseRuntimeSnapshot({
        runtime: databaseRuntime,
        snapshot: documentSnapshot,
      });
    } catch (probeError: Dynamic) {
      console.error(
        "appifact runtime probe failed \u2014 booting the frame model",
        probeError,
      );
    }
}
export {
  databaseRuntimeSnapshot,
  getDatabaseRuntimeSnapshot,
  initializeDatabaseRuntime,
  setDatabaseRuntimeSnapshot,
};
export function installPlatformDatabaseRuntime(): () => void {
  return () => {};
}
