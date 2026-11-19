/** Restored application module; prepare first, initialize in original order. */
import {
  type Dynamic,
} from "../../runtime-types";
import { OutlineAnnotationsResolvedValue } from "../outline/annotations";

function getEditorEventRuntime(): Dynamic {
  return OutlineAnnotationsResolvedValue;
}
function emitEditorEvent(eventName?: Dynamic, eventDetail?: Dynamic): Dynamic {
  getEditorEventRuntime().emitOmEvent(eventName, eventDetail);
  return true;
}
export {
  emitEditorEvent,
  getEditorEventRuntime,
};
export function installEditorEventsRuntime(): () => void {
  return () => {};
}
