import { useUiLocale } from '../../ui-locale.ts';
import { uiMessage } from '@minedesign/contracts/ui-messages';
/** Restored application module; prepare first, initialize in original order. */
import {
  type Dynamic,
} from "../../runtime-types";
import { isImageDecodeQueued } from "../../canvas/image-decode-scheduler";
import { Button } from "../../cds/button/button";
import { Icon } from "../../cds/components/icon";
import { initializeCdsIndex } from "../../cds/index";
import { load_react, load_react_jsx_runtime } from "../../dependencies";
import { createVideoPlaybackStore, formatVideoTime, MediaVideoPlaybackPlayPauseConfig, MediaVideoPlaybackPlayPauseSeekConfig } from "./video-playback";
import { PropertiesInheritedFieldMixed, PropertiesInheritedFieldValue } from "../properties/inherited-field";
import { PropertyRangeRow } from "../properties/rows";
import { SessionStripButton } from "../session-strip/session-strip";
import { reactSessionArtboardState, SessionArtboardStateHandler, SessionArtboardStatePausedCurrentTimeDurationConfig } from "../session/artboard-state";
import { toModuleNamespace } from "../../module-helpers";

var ThisVideoIsnTPlayingHereRightMessage: Dynamic;
var notLoadedMessage: Dynamic;
var ThisVideoCouldnTBeLoadedMessage: Dynamic;
var ThisVideoCouldnTBeLoadedSoMessage: Dynamic;
var unavailableVideoReason: Dynamic;
var ThisVideoDoesnTSayHowLongMessage: Dynamic;
var seekDisabledReason: Dynamic;
var playDisabledReason: Dynamic;
var reactMediaPlaybackControls: Dynamic;
var reactMediaPlaybackControls_2: Dynamic;
var jsxMediaPlaybackControls: Dynamic;
var PropertiesInheritedFieldValueAlias: Dynamic;
var PropertiesInheritedFieldMixedAlias: Dynamic;
function findPreviewMediaElement(
  root?: Dynamic,
  selectorKind?: Dynamic,
  selectorContext?: Dynamic,
  scopeName?: Dynamic,
): Dynamic {
  if (!root) return null;
  let candidates: Dynamic = [
    ...root.querySelectorAll(
      SessionArtboardStateHandler(selectorKind, selectorContext),
    ),
  ].filter(
    (candidate?: Dynamic): Dynamic =>
      (candidate.closest("[data-sc-name]")?.getAttribute("data-sc-name") ??
        scopeName) === scopeName,
  );
  return (
    candidates.find(
      (candidate?: Dynamic): Dynamic =>
        typeof candidate.checkVisibility == "function"
          ? candidate.checkVisibility()
          : true,
    ) ??
    candidates[0] ??
    null
  );
}
function useVideoPlayback(getVideoElement?: Dynamic, generation: Dynamic = 0): Dynamic {
  let [playback, setPlayback]: Dynamic = (0,
    reactSessionArtboardState.useState)(
      SessionArtboardStatePausedCurrentTimeDurationConfig,
    ),
    [hasVideo, setHasVideo]: Dynamic = (0,
    reactSessionArtboardState.useState)(false),
    [, setRenderTick]: Dynamic = (0, reactSessionArtboardState.useState)(0),
    storeRef: Dynamic = (0, reactSessionArtboardState.useRef)(null),
    videoRef: Dynamic = (0, reactSessionArtboardState.useRef)(null),
    getVideoElementRef: Dynamic = (0, reactSessionArtboardState.useRef)(getVideoElement);
  getVideoElementRef.current = getVideoElement;
  (0, reactSessionArtboardState.useEffect)((): Dynamic => {
    let unsubscribe: Dynamic = (): Dynamic => {},
      timerId: Dynamic,
      syncVideo: Dynamic = (): Dynamic => {
        let video: Dynamic = getVideoElementRef.current();
        if (
          video !== null &&
          video === videoRef.current &&
          video.isConnected
        ) {
          timerId = setTimeout(syncVideo, 1e3);
          return;
        }
        unsubscribe();
        storeRef.current?.detach();
        storeRef.current = null;
        videoRef.current = video;
        setHasVideo(video !== null);
        if (video) {
          let store: Dynamic = createVideoPlaybackStore(
            video,
          );
          storeRef.current = store;
          unsubscribe = store.subscribe(setPlayback);
        } else {
          setPlayback(SessionArtboardStatePausedCurrentTimeDurationConfig);
          setRenderTick((tick?: Dynamic): Dynamic => tick + 1);
        }
        timerId = setTimeout(syncVideo, video ? 1e3 : 300);
      };
    syncVideo();
    return (): Dynamic => {
      clearTimeout(timerId);
      unsubscribe();
      storeRef.current?.detach();
      storeRef.current = null;
      videoRef.current = null;
    };
  }, [generation]);
  return {
    at: playback,
    found: hasVideo,
    toggle: (): Dynamic => storeRef.current?.toggle(),
    seek: (time?: Dynamic): Dynamic => {
      storeRef.current?.seek(time);
      setPlayback(
        (current?: Dynamic): Dynamic => ({
          ...current,
          currentTime: Math.max(0, Math.min(time, current.duration)),
        }),
      );
    },
  };
}
function VideoPlayControl({
  find: find,
  gen = 0,
  whyAbsent: whyAbsent,
}: Dynamic): Dynamic {
  useUiLocale();
  let {
      at: playback,
      found: isFound,
      toggle: togglePlayback,
    }: Dynamic = useVideoPlayback(find, gen),
    disabledReason: Dynamic = playDisabledReason(
      {
        found: isFound,
        ready: playback.ready,
        failed: playback.failed,
      },
      isFound ? undefined : whyAbsent?.(),
    ),
    label: Dynamic = playback.paused
      ? MediaVideoPlaybackPlayPauseSeekConfig.play
      : MediaVideoPlaybackPlayPauseSeekConfig.pause;
  return (
    <SessionStripButton
      data-testid={"mega-video-playpause"}
      icon={
        <Icon
          name={
            playback.paused
              ? MediaVideoPlaybackPlayPauseConfig.play
              : MediaVideoPlaybackPlayPauseConfig.pause
          }
          size={"sm"}
        />
      }
      aria-label={label}
      title={disabledReason ?? (uiMessage("inspector.playbackControls.video", { value1: String(label) }))}
      disabled={disabledReason !== undefined}
      onClick={togglePlayback}
    />
  );
}
function VideoSeekControl({
  find: find,
  gen = 0,
  whyAbsent: whyAbsent,
}: Dynamic): Dynamic {
  useUiLocale();
  let {
      at: playback,
      found: isFound,
      toggle: togglePlayback,
      seek: seekTo,
    }: Dynamic = useVideoPlayback(find, gen),
    disabledReason: Dynamic = seekDisabledReason(
      {
        found: isFound,
        ready: playback.ready,
        seekable: playback.seekable,
        failed: playback.failed,
      },
      isFound ? undefined : whyAbsent?.(),
    ),
    canToggle: Dynamic = isFound && playback.ready;
  return (
    <PropertyRangeRow
      label={uiMessage("inspector.playbackControls.time")}
      value={Math.round(playback.currentTime * 10) / 10}
      min={0}
      max={Math.max(0.1, Math.round(playback.duration * 10) / 10)}
      step={0.1}
      unit={"s"}
      disabled={disabledReason !== undefined}
      title={
        (disabledReason) ?? (((((MediaVideoPlaybackPlayPauseSeekConfig.seek) + (": ")) + (formatVideoTime(playback.currentTime))) + (" / ")) + (formatVideoTime(playback.duration)))
      }
      onLive={seekTo}
      onValue={seekTo}
      adornment={
        <Button
          variant={"ghost"}
          size={"xxs"}
          data-testid={"dc-video-playpause"}
          aria-label={
            playback.paused ? (MediaVideoPlaybackPlayPauseSeekConfig.play) : (MediaVideoPlaybackPlayPauseSeekConfig.pause)
          }
          title={canToggle ? (undefined) : (disabledReason)}
          disabled={!canToggle}
          onClick={togglePlayback}
        >
          <Icon
            name={
              playback.paused
                ? MediaVideoPlaybackPlayPauseConfig.play
                : MediaVideoPlaybackPlayPauseConfig.pause
            }
            size={"xs"}
          />
        </Button>
      }
    />
  );
}
export {
  findPreviewMediaElement,
  jsxMediaPlaybackControls,
  seekDisabledReason as MediaPlaybackControlsFound,
  playDisabledReason as MediaPlaybackControlsFound_2,
  notLoadedMessage as MediaPlaybackControlsLabel,
  unavailableVideoReason as MediaPlaybackControlsQuerySelector,
  PropertiesInheritedFieldMixedAlias,
  PropertiesInheritedFieldValueAlias,
  reactMediaPlaybackControls,
  reactMediaPlaybackControls_2,
  ThisVideoCouldnTBeLoadedMessage,
  ThisVideoCouldnTBeLoadedSoMessage,
  ThisVideoDoesnTSayHowLongMessage,
  ThisVideoIsnTPlayingHereRightMessage,
  useVideoPlayback,
  VideoPlayControl,
  VideoSeekControl,
};
export function installEditorMediaPlaybackControls(): () => void {
  return () => {
    ThisVideoIsnTPlayingHereRightMessage =
      uiMessage("inspector.playbackControls.thisVideoIsnTPlaying");
    notLoadedMessage = uiMessage("inspector.playbackControls.theVideoHasnTLoaded");
    ThisVideoCouldnTBeLoadedMessage = uiMessage("inspector.playbackControls.thisVideoCouldnTBe");
    ThisVideoCouldnTBeLoadedSoMessage =
      uiMessage("inspector.playbackControls.thisVideoCouldnTBe2");
    unavailableVideoReason = (annotationId?: Dynamic): Dynamic =>
      isImageDecodeQueued(annotationId)
        ? uiMessage("inspector.playbackControls.only") +
          String(4) +
          " videos play at once on a page. This one starts when another is deleted or leaves view."
        : (document as Dynamic).querySelector(
              '[data-mega-annotation="' +
                CSS.escape(annotationId) +
                '"][data-clip-failed]',
            ) != null
          ? ThisVideoCouldnTBeLoadedSoMessage
          : undefined;
    ThisVideoDoesnTSayHowLongMessage =
      uiMessage("inspector.playbackControls.thisVideoDoesnTSay");
    seekDisabledReason = (
      state?: Dynamic,
      absentReason?: Dynamic,
    ): Dynamic =>
      state.found
        ? state.failed
          ? ThisVideoCouldnTBeLoadedMessage
          : state.ready
            ? state.seekable
              ? undefined
              : ThisVideoDoesnTSayHowLongMessage
            : notLoadedMessage
        : (absentReason ?? ThisVideoIsnTPlayingHereRightMessage);
    playDisabledReason = (
      state?: Dynamic,
      absentReason?: Dynamic,
    ): Dynamic =>
      state.found
        ? state.failed
          ? ThisVideoCouldnTBeLoadedMessage
          : state.ready
            ? undefined
            : notLoadedMessage
        : (absentReason ?? ThisVideoIsnTPlayingHereRightMessage);
    initializeCdsIndex();
    reactMediaPlaybackControls = toModuleNamespace(
      load_react(),
      1,
    );
    reactMediaPlaybackControls_2 = toModuleNamespace(
      load_react(),
      1,
    );
    initializeCdsIndex();
    jsxMediaPlaybackControls = toModuleNamespace(
      load_react_jsx_runtime(),
      1,
    );
    PropertiesInheritedFieldValueAlias = PropertiesInheritedFieldValue;
    PropertiesInheritedFieldMixedAlias = PropertiesInheritedFieldMixed;
  };
}
