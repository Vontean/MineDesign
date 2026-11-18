/** Restored application module; prepare first, initialize in original order. */
import {
  type Dynamic,
} from "../runtime-types";
import { isFrameCaptureDocument } from "./frame-environment";
import { isArtboardFile } from "../platform/file-content";

var resolveDesignFramesReady: Dynamic;
var designFramesReadyPromise: Dynamic;
var resolveCaptureFramesReady: Dynamic;
var captureFramesReadyPromise: Dynamic;
function markDesignFramesReady(): Dynamic {
  resolveDesignFramesReady();
}
function unblockDesignFramesReady(): Dynamic {
  resolveDesignFramesReady();
}
function markCaptureFramesReady(): Dynamic {
  resolveCaptureFramesReady();
}
function waitForDesignFramesReady(): Dynamic {
  return designFramesReadyPromise;
}
function waitForActiveDesignFramesReady(): Dynamic {
  return isFrameCaptureDocument()
    ? captureFramesReadyPromise
    : designFramesReadyPromise;
}
function waitForDesignProjectFrames(project?: Dynamic): Dynamic {
  return Object.keys(project.files).some(isArtboardFile)
    ? waitForActiveDesignFramesReady()
    : Promise.resolve();
}
export {
  captureFramesReadyPromise,
  designFramesReadyPromise,
  markCaptureFramesReady,
  markDesignFramesReady,
  resolveCaptureFramesReady,
  resolveDesignFramesReady,
  unblockDesignFramesReady,
  waitForActiveDesignFramesReady,
  waitForDesignFramesReady,
  waitForDesignProjectFrames,
};
export function installCanvasFrameReadiness(): () => void {
  return () => {
    resolveDesignFramesReady = (): Dynamic => {};
    designFramesReadyPromise = new Promise((input?: Dynamic): Dynamic => {
      resolveDesignFramesReady = input;
    });
    resolveCaptureFramesReady = (): Dynamic => {};
    captureFramesReadyPromise = new Promise((input?: Dynamic): Dynamic => {
      resolveCaptureFramesReady = input;
    });
  };
}
