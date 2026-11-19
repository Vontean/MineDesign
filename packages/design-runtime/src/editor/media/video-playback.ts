import { uiMessage } from '@minedesign/contracts/ui-messages';
/** Restored application module; prepare first, initialize in original order. */
import {
  type Dynamic,
} from "../../runtime-types";
import { initializeCdsIndex } from "../../cds/index";

var B6b0a7Value: Dynamic;
var defaultAnnotationStrokeColor: Dynamic;
var MediaVideoPlaybackPlayPauseSeekConfig: Dynamic;
var MediaVideoPlaybackPlayPauseConfig: Dynamic;
var MediaVideoPlaybackPlayPauseTimeupdateValues: Dynamic;
function formatVideoTime(seconds?: Dynamic): Dynamic {
  let wholeSeconds: Dynamic =
      Number.isFinite(seconds) && seconds > 0 ? Math.floor(seconds) : 0,
    padTwoDigits: Dynamic = (part?: Dynamic): Dynamic =>
      String(part).padStart(2, "0"),
    hours: Dynamic = Math.floor(wholeSeconds / 3600),
    minutes: Dynamic = Math.floor((wholeSeconds % 3600) / 60);
  return hours > 0
    ? String(hours) + ":" + padTwoDigits(minutes) + ":" + padTwoDigits(wholeSeconds % 60)
    : String(minutes) + ":" + padTwoDigits(wholeSeconds % 60);
}
function createVideoPlaybackStore(video?: Dynamic): Dynamic {
  let listeners: Dynamic = new Set(),
    readSnapshot: Dynamic = (): Dynamic => {
      let hasDuration: Dynamic =
        Number.isFinite(video.duration) && video.duration > 0;
      return {
        paused: video.paused,
        currentTime: Number.isFinite(video.currentTime)
          ? video.currentTime
          : 0,
        duration: hasDuration ? video.duration : 0,
        ready: video.readyState >= 1,
        seekable: hasDuration,
        failed: video.error != null,
      };
    },
    notifyListeners: Dynamic = (): Dynamic => {
      let snapshot: Dynamic = readSnapshot();
      for (let listener of [...listeners] as Dynamic) listener(snapshot);
    };
  for (let eventName of MediaVideoPlaybackPlayPauseTimeupdateValues as Dynamic)
    video.addEventListener(eventName, notifyListeners);
  let playVideo: Dynamic = (): Dynamic => {
    Promise.resolve(video.play()).catch((): Dynamic => notifyListeners());
  };
  return {
    play: playVideo,
    pause: (): Dynamic => video.pause(),
    toggle: (): Dynamic => (video.paused ? playVideo() : video.pause()),
    seek: (time?: Dynamic): Dynamic => {
      let duration: Dynamic = readSnapshot().duration;
      Number.isFinite(time) &&
        (video.currentTime = Math.max(
          0,
          duration > 0 ? Math.min(time, duration) : time,
        ));
    },
    subscribe: (listener?: Dynamic): Dynamic => (
      listeners.add(listener),
      listener(readSnapshot()),
      (): Dynamic => {
        listeners.delete(listener);
      }
    ),
    detach: (): Dynamic => {
      for (let eventName of MediaVideoPlaybackPlayPauseTimeupdateValues as Dynamic)
        video.removeEventListener(eventName, notifyListeners);
      listeners.clear();
    },
  };
}
export {
  B6b0a7Value,
  createVideoPlaybackStore,
  defaultAnnotationStrokeColor,
  formatVideoTime,
  MediaVideoPlaybackPlayPauseConfig,
  MediaVideoPlaybackPlayPauseSeekConfig,
  MediaVideoPlaybackPlayPauseTimeupdateValues,
};
export function installEditorMediaVideoPlayback(): () => void {
  return () => {
    B6b0a7Value = "#b6b0a7";
    defaultAnnotationStrokeColor = "#8a8378";
    initializeCdsIndex();
    MediaVideoPlaybackPlayPauseSeekConfig = {
      get play() { return uiMessage("inspector.videoPlayback.play"); },
      pause: "Pause",
      seek: "Seek",
    };
    MediaVideoPlaybackPlayPauseConfig = {
      play: "PlayFilled",
      pause: "Pause",
    };
    MediaVideoPlaybackPlayPauseTimeupdateValues = [
      "play",
      "pause",
      "timeupdate",
      "durationchange",
      "loadedmetadata",
      "seeked",
      "ended",
      "emptied",
      "error",
    ];
  };
}
