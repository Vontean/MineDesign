/** Restored application module; prepare first, initialize in original order. */
import {
  type Dynamic,
} from "../runtime-types";

var frameCaptureAttribute: Dynamic;
var forceRefreshEventName: Dynamic;
var remoteFilesEventName: Dynamic;
function isFrameCaptureDocument(targetDocument: Dynamic = document): Dynamic {
  return targetDocument.documentElement.hasAttribute(frameCaptureAttribute);
}
export {
  forceRefreshEventName,
  frameCaptureAttribute,
  isFrameCaptureDocument,
  remoteFilesEventName,
};
export function installCanvasFrameEnvironment(): () => void {
  return () => {
    frameCaptureAttribute = "data-frame-capture";
    forceRefreshEventName = "appifact:force-refresh";
    remoteFilesEventName = "appifact:remote-files";
  };
}
