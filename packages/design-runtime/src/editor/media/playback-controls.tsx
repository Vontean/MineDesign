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
var MediaPlaybackControlsLabel: Dynamic;
var ThisVideoCouldnTBeLoadedMessage: Dynamic;
var ThisVideoCouldnTBeLoadedSoMessage: Dynamic;
var MediaPlaybackControlsQuerySelector: Dynamic;
var ThisVideoDoesnTSayHowLongMessage: Dynamic;
var MediaPlaybackControlsFound: Dynamic;
var MediaPlaybackControlsFound_2: Dynamic;
var reactMediaPlaybackControls: Dynamic;
var reactMediaPlaybackControls_2: Dynamic;
var jsxMediaPlaybackControls: Dynamic;
var PropertiesInheritedFieldValueAlias: Dynamic;
var PropertiesInheritedFieldMixedAlias: Dynamic;
function findPreviewMediaElement(
  input?: Dynamic,
  options?: Dynamic,
  context?: Dynamic,
  value?: Dynamic,
): Dynamic {
  if (!input) return null;
  let value2: Dynamic = [
    ...input.querySelectorAll(
      (0, SessionArtboardStateHandler)(options, context),
    ),
  ].filter(
    (input2?: Dynamic): Dynamic =>
      (input2.closest("[data-sc-name]")?.getAttribute("data-sc-name") ??
        value) === value,
  );
  return (
    value2.find(
      (input2?: Dynamic): Dynamic =>
        typeof input2.checkVisibility == "function"
          ? input2.checkVisibility()
          : true,
    ) ??
    value2[0] ??
    null
  );
}
function useVideoPlayback(input?: Dynamic, options: Dynamic = 0): Dynamic {
  let [value, value2]: Dynamic = (0,
    reactSessionArtboardState.useState)(
      SessionArtboardStatePausedCurrentTimeDurationConfig,
    ),
    [value3, value4]: Dynamic = (0,
    reactSessionArtboardState.useState)(false),
    [, value5]: Dynamic = (0, reactSessionArtboardState.useState)(0),
    value6: Dynamic = (0, reactSessionArtboardState.useRef)(null),
    value7: Dynamic = (0, reactSessionArtboardState.useRef)(null),
    value8: Dynamic = (0, reactSessionArtboardState.useRef)(input);
  value8.current = input;
  (0, reactSessionArtboardState.useEffect)((): Dynamic => {
    let callback: Dynamic = (): Dynamic => {},
      value9: Dynamic,
      callback2: Dynamic = (): Dynamic => {
        let value10: Dynamic = value8.current();
        if (
          value10 !== null &&
          value10 === value7.current &&
          value10.isConnected
        ) {
          value9 = setTimeout(callback2, 1e3);
          return;
        }
        callback();
        value6.current?.detach();
        value6.current = null;
        value7.current = value10;
        value4(value10 !== null);
        if (value10) {
          let value11: Dynamic = (0, createVideoPlaybackStore)(
            value10,
          );
          value6.current = value11;
          callback = value11.subscribe(value2);
        } else {
          value2(SessionArtboardStatePausedCurrentTimeDurationConfig);
          value5((input2?: Dynamic): Dynamic => input2 + 1);
        }
        value9 = setTimeout(callback2, value10 ? 1e3 : 300);
      };
    callback2();
    return (): Dynamic => {
      clearTimeout(value9);
      callback();
      value6.current?.detach();
      value6.current = null;
      value7.current = null;
    };
  }, [options]);
  return {
    at: value,
    found: value3,
    toggle: (): Dynamic => value6.current?.toggle(),
    seek: (input2?: Dynamic): Dynamic => {
      value6.current?.seek(input2);
      value2(
        (input3?: Dynamic): Dynamic => ({
          ...input3,
          currentTime: Math.max(0, Math.min(input2, input3.duration)),
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
      at: value,
      found: value2,
      toggle: value3,
    }: Dynamic = useVideoPlayback(find, gen),
    value4: Dynamic = MediaPlaybackControlsFound_2(
      {
        found: value2,
        ready: value.ready,
        failed: value.failed,
      },
      value2 ? undefined : whyAbsent?.(),
    ),
    value5: Dynamic = value.paused
      ? MediaVideoPlaybackPlayPauseSeekConfig.play
      : MediaVideoPlaybackPlayPauseSeekConfig.pause;
  return (
    <SessionStripButton
      data-testid={"mega-video-playpause"}
      icon={
        <Icon
          name={
            value.paused
              ? MediaVideoPlaybackPlayPauseConfig.play
              : MediaVideoPlaybackPlayPauseConfig.pause
          }
          size={"sm"}
        />
      }
      aria-label={value5}
      title={value4 ?? (uiMessage("inspector.playbackControls.video", { value1: String(value5) }))}
      disabled={value4 !== undefined}
      onClick={value3}
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
      at: value,
      found: value2,
      toggle: value3,
      seek: value4,
    }: Dynamic = useVideoPlayback(find, gen),
    value5: Dynamic = MediaPlaybackControlsFound(
      {
        found: value2,
        ready: value.ready,
        seekable: value.seekable,
        failed: value.failed,
      },
      value2 ? undefined : whyAbsent?.(),
    ),
    value6: Dynamic = value2 && value.ready;
  return (
    <PropertyRangeRow
      label={uiMessage("inspector.playbackControls.time")}
      value={Math.round(value.currentTime * 10) / 10}
      min={0}
      max={Math.max(0.1, Math.round(value.duration * 10) / 10)}
      step={0.1}
      unit={"s"}
      disabled={value5 !== undefined}
      title={
        (value5) ?? (((((MediaVideoPlaybackPlayPauseSeekConfig.seek) + (": ")) + ((0, formatVideoTime)(value.currentTime))) + (" / ")) + ((0, formatVideoTime)(value.duration)))
      }
      onLive={value4}
      onValue={value4}
      adornment={
        <Button
          variant={"ghost"}
          size={"xxs"}
          data-testid={"dc-video-playpause"}
          aria-label={
            value.paused ? (MediaVideoPlaybackPlayPauseSeekConfig.play) : (MediaVideoPlaybackPlayPauseSeekConfig.pause)
          }
          title={value6 ? (undefined) : (value5)}
          disabled={!value6}
          onClick={value3}
        >
          <Icon
            name={
              value.paused
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
  MediaPlaybackControlsFound,
  MediaPlaybackControlsFound_2,
  MediaPlaybackControlsLabel,
  MediaPlaybackControlsQuerySelector,
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
    MediaPlaybackControlsLabel = uiMessage("inspector.playbackControls.theVideoHasnTLoaded");
    ThisVideoCouldnTBeLoadedMessage = uiMessage("inspector.playbackControls.thisVideoCouldnTBe");
    ThisVideoCouldnTBeLoadedSoMessage =
      uiMessage("inspector.playbackControls.thisVideoCouldnTBe2");
    MediaPlaybackControlsQuerySelector = (input?: Dynamic): Dynamic =>
      (0, isImageDecodeQueued)(input)
        ? uiMessage("inspector.playbackControls.only") +
          String(4) +
          " videos play at once on a page. This one starts when another is deleted or leaves view."
        : (document as Dynamic).querySelector(
              '[data-mega-annotation="' +
                CSS.escape(input) +
                '"][data-clip-failed]',
            ) != null
          ? ThisVideoCouldnTBeLoadedSoMessage
          : undefined;
    ThisVideoDoesnTSayHowLongMessage =
      uiMessage("inspector.playbackControls.thisVideoDoesnTSay");
    MediaPlaybackControlsFound = (
      input?: Dynamic,
      options?: Dynamic,
    ): Dynamic =>
      input.found
        ? input.failed
          ? ThisVideoCouldnTBeLoadedMessage
          : input.ready
            ? input.seekable
              ? undefined
              : ThisVideoDoesnTSayHowLongMessage
            : MediaPlaybackControlsLabel
        : (options ?? ThisVideoIsnTPlayingHereRightMessage);
    MediaPlaybackControlsFound_2 = (
      input?: Dynamic,
      options?: Dynamic,
    ): Dynamic =>
      input.found
        ? input.failed
          ? ThisVideoCouldnTBeLoadedMessage
          : input.ready
            ? undefined
            : MediaPlaybackControlsLabel
        : (options ?? ThisVideoIsnTPlayingHereRightMessage);
    (0, initializeCdsIndex)();
    reactMediaPlaybackControls = (0, toModuleNamespace)(
      (0, load_react)(),
      1,
    );
    reactMediaPlaybackControls_2 = (0, toModuleNamespace)(
      (0, load_react)(),
      1,
    );
    (0, initializeCdsIndex)();
    jsxMediaPlaybackControls = (0, toModuleNamespace)(
      (0, load_react_jsx_runtime)(),
      1,
    );
    PropertiesInheritedFieldValueAlias = PropertiesInheritedFieldValue;
    PropertiesInheritedFieldMixedAlias = PropertiesInheritedFieldMixed;
  };
}
