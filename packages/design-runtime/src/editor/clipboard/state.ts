/** Restored application module; prepare first, initialize in original order. */
import {
  type Dynamic,
} from "../../runtime-types";
import { readClipboardObject } from "./native";
import { PlatformFileContentLimit_5 as maxAnnotationCount } from "../../platform/file-content";

var DesignElementsKey: Dynamic;
var DesignArtboardsKey: Dynamic;
var ClipboardStateResolvedValue: Dynamic;
var ClipboardStateIsArray: Dynamic;
var ClipboardStateHandler: Dynamic;
var ClipboardStateCurrentState: Dynamic;
var ClipboardStateConstant: Dynamic;
var ClipboardStateAlias: Dynamic;
var ClipboardStateBufferRendition: Dynamic;
var ClipboardStateSliceValue: Dynamic;
var ClipboardStateFilterValue: Dynamic;
var ClipboardStateSequenceCounter: Dynamic;
var localClipboardSequence: Dynamic;
var ClipboardStateDeferredTasks: Dynamic;
var ClipboardStateDelayMs: Dynamic;
var ClipboardStateObservedElements: Dynamic;
var ClipboardStateLimit: Dynamic;
var hasPendingClipboardMarks: Dynamic;
var ClipboardStateGeneration: Dynamic;
var ClipboardStateMarkMaxAgeMs: Dynamic;
var ClipboardStateArtboardItems: Dynamic;
var ClipboardStateArtboardAnnotations: Dynamic;
var ClipboardStateNowValue: Dynamic;
var ClipboardStateArtboardStamp: Dynamic;
var ClipboardStateArtboardRendition: Dynamic;
var ClipboardStateReplace: Dynamic;
function clipboardObjectStamp(clipboardObject?: Dynamic): Dynamic {
  if (clipboardObject?.kind !== DesignElementsKey && clipboardObject?.kind !== DesignArtboardsKey)
    return null;
  let stamp: Dynamic = clipboardObject.data?.stamp;
  return typeof stamp == "string" && stamp.length > 0 && stamp.length <= 64
    ? stamp
    : null;
}
function readBoundedClipboardObject(event?: Dynamic): Dynamic {
  return (event.clipboardData?.getData("text/html") ?? "").length >
    ClipboardStateResolvedValue
    ? undefined
    : readClipboardObject(event);
}
function readArtboardClipboard(clipboardObject?: Dynamic): Dynamic {
  if (clipboardObject?.kind !== DesignArtboardsKey) return;
  let data: Dynamic = clipboardObject.data;
  return ClipboardStateIsArray(data) ||
    (Array.isArray(data?.annotations) && data.annotations.length > 0) ||
    ClipboardStateHandler(data?.leftOut) > 0 ||
    ClipboardStateHandler(data?.stayed) > 0
    ? data
    : undefined;
}
function expireClipboardMarks(now?: Dynamic): Dynamic {
  ClipboardStateFilterValue = ClipboardStateFilterValue.filter(
    (mark?: Dynamic): Dynamic =>
      mark.droppedAt > 0
        ? now - mark.droppedAt < ClipboardStateLimit
        : now - mark.at < ClipboardStateMarkMaxAgeMs,
  );
  runDeferredClipboardTasks();
}
function runDeferredClipboardTasks(): Dynamic {
  let readyTasks: Dynamic = ClipboardStateDeferredTasks.filter(
    (task?: Dynamic): Dynamic => !hasPendingClipboardMarks(task.until),
  );
  if (readyTasks.length !== 0) {
    ClipboardStateDeferredTasks = ClipboardStateDeferredTasks.filter(
      (task?: Dynamic): Dynamic => !readyTasks.includes(task),
    );
    for (let task of readyTasks as Dynamic) {
      clearTimeout(task.timer);
      setTimeout(task.run, 0);
    }
  }
}
function afterClipboardSettled(run?: Dynamic, onTimeout?: Dynamic): Dynamic {
  let sequence: Dynamic = ClipboardStateSequenceCounter;
  if (!hasPendingClipboardMarks(sequence)) return run();
  let state: Dynamic = {
    until: sequence,
    run: run,
    timer: setTimeout((): Dynamic => {
      ClipboardStateDeferredTasks = ClipboardStateDeferredTasks.filter(
        (task?: Dynamic): Dynamic => task !== state,
      );
      onTimeout?.();
    }, ClipboardStateDelayMs),
  };
  ClipboardStateDeferredTasks.push(state);
}
function isClipboardSettling(): Dynamic {
  return hasPendingClipboardMarks(ClipboardStateSequenceCounter);
}
function markConsumedClipboardStamp(stamp?: Dynamic): Dynamic {
  ClipboardStateObservedElements.add(stamp);
}
function isClipboardStampConsumed(stamp?: Dynamic): Dynamic {
  return ClipboardStateObservedElements.has(stamp);
}
function clipboardGeneration(): Dynamic {
  return ClipboardStateGeneration;
}
function clearClipboardStamps(): Dynamic {
  for (let stamp of [
    ClipboardStateAlias,
    ClipboardStateArtboardStamp,
  ] as Dynamic)
    stamp &&
      (ClipboardStateSliceValue = [stamp, ...ClipboardStateSliceValue].slice(
        0,
        8,
      ));
  ClipboardStateAlias = null;
  ClipboardStateBufferRendition = null;
  ClipboardStateArtboardStamp = null;
  ClipboardStateArtboardRendition = null;
}
function getElementClipboard(): Dynamic {
  return ClipboardStateCurrentState;
}
function setElementClipboard(buffer?: Dynamic, copyOptions?: Dynamic): Dynamic {
  ClipboardStateGeneration++;
  clearClipboardStamps();
  localClipboardSequence = ++ClipboardStateSequenceCounter;
  ClipboardStateCurrentState = buffer;
  ClipboardStateAlias = copyOptions?.stamp ?? null;
  ClipboardStateBufferRendition =
    ClipboardStateAlias != null && copyOptions?.rendition
      ? copyOptions.rendition
      : null;
  ClipboardStateConstant =
    copyOptions?.inTabOnly && ClipboardStateAlias == null ? Date.now() : 0;
  ClipboardStateArtboardItems = null;
  ClipboardStateArtboardAnnotations = [];
}
function markLocalElementClipboard(buffer?: Dynamic): Dynamic {
  ClipboardStateCurrentState === buffer &&
    (ClipboardStateConstant = Date.now());
}
function rememberClipboardStamp(stamp?: Dynamic): Dynamic {
  stamp &&
    (ClipboardStateSliceValue = [stamp, ...ClipboardStateSliceValue].slice(
      0,
      8,
    ));
}
function mirrorArtboardClipboardStamp(
  stamp?: Dynamic,
  rendition?: Dynamic,
  now: Dynamic = Date.now(),
): Dynamic {
  ClipboardStateArtboardItems == null ||
    ClipboardStateArtboardStamp != null ||
    now - ClipboardStateNowValue > 2e3 ||
    ((ClipboardStateArtboardStamp = stamp),
    (ClipboardStateArtboardRendition = rendition || null));
}
function claimClipboardMark(
  stamp?: Dynamic,
  rendition?: Dynamic,
  now: Dynamic = Date.now(),
): Dynamic {
  expireClipboardMarks(now);
  let hasFreshLocalBuffer: Dynamic =
      ClipboardStateCurrentState != null &&
      ClipboardStateConstant !== 0 &&
      now - ClipboardStateConstant <= 2e3,
    pendingMark: Dynamic = ClipboardStateFilterValue.find(
      (mark?: Dynamic): Dynamic => mark.mark == null && mark.markable,
    ),
    claimedMark: Dynamic =
      pendingMark && !(hasFreshLocalBuffer && localClipboardSequence > pendingMark.seq)
        ? pendingMark
        : undefined;
  pendingMark &&
    !claimedMark &&
    pendingMark.droppedAt > 0 &&
    (ClipboardStateFilterValue = ClipboardStateFilterValue.filter(
      (mark?: Dynamic): Dynamic => mark !== pendingMark,
    ));
  return claimedMark && claimedMark.droppedAt > 0
    ? ((ClipboardStateFilterValue = ClipboardStateFilterValue.filter(
        (mark?: Dynamic): Dynamic => mark !== claimedMark,
      )),
      rememberClipboardStamp(stamp),
      false)
    : claimedMark
      ? ((claimedMark.mark = {
          stamp: stamp,
          rendition: rendition || null,
        }),
        true)
      : hasFreshLocalBuffer
        ? ((ClipboardStateAlias = stamp),
          (ClipboardStateBufferRendition = rendition || null),
          (ClipboardStateConstant = 0),
          true)
        : false;
}
function startClipboardMark(markOptions?: Dynamic): Dynamic {
  let state: Dynamic = {
    at: Date.now(),
    seq: ++ClipboardStateSequenceCounter,
    mark: null,
    droppedAt: 0,
    markable: markOptions?.markable ?? true,
  };
  ClipboardStateGeneration++;
  expireClipboardMarks(state.at);
  ClipboardStateFilterValue = ClipboardStateFilterValue.filter(
    (mark?: Dynamic): Dynamic => mark.droppedAt === 0,
  );
  ClipboardStateFilterValue.push(state);
  return {
    write: (buffer?: Dynamic): Dynamic => {
      ClipboardStateFilterValue = ClipboardStateFilterValue.filter(
        (mark?: Dynamic): Dynamic => mark !== state,
      );
      setElementClipboard(buffer, {
        inTabOnly: true,
        stamp: state.mark?.stamp,
        rendition: state.mark?.rendition,
      });
      runDeferredClipboardTasks();
    },
    drop: (): Dynamic => {
      state.mark == null && state.markable
        ? (state.droppedAt = Date.now())
        : ((ClipboardStateFilterValue = ClipboardStateFilterValue.filter(
            (mark?: Dynamic): Dynamic => mark !== state,
          )),
          rememberClipboardStamp(state.mark?.stamp));
      runDeferredClipboardTasks();
    },
  };
}
function sameClipboardText(text?: Dynamic, otherText?: Dynamic): Dynamic {
  return (
    otherText != null &&
    otherText !== "" &&
    ClipboardStateReplace(text) === ClipboardStateReplace(otherText)
  );
}
function resolveClipboardSource(
  source?: Dynamic,
  clipboard?: Dynamic,
  now?: Dynamic,
): Dynamic {
  let isTextOnly: Dynamic = clipboard.stamp == null && !clipboard.hasImage,
    isSupersededStamp: Dynamic =
      clipboard.stamp != null &&
      (source.supersededStamps ?? []).includes(clipboard.stamp),
    isRecent: Dynamic = (timestamp?: Dynamic): Dynamic =>
      now - timestamp < ClipboardStateMarkMaxAgeMs;
  return source.artboardClip
    ? (clipboard.stamp != null && clipboard.stamp === source.artboardClipStamp) ||
      (isTextOnly &&
        sameClipboardText(clipboard.text, source.artboardClipRendition)) ||
      isSupersededStamp ||
      (source.artboardClipStamp == null && isRecent(source.artboardClipAt))
      ? "artboards"
      : clipboard.artboards != null
        ? "foreign-artboards"
        : clipboard.hasImage
          ? "image"
          : clipboard.text.trim() !== ""
            ? "text"
            : clipboard.stamp != null
              ? "nothing"
              : "artboards"
    : source.buffer != null &&
        ((clipboard.stamp != null && clipboard.stamp === source.bufferStamp) ||
          (isTextOnly &&
            (sameClipboardText(clipboard.text, source.buffer) ||
              sameClipboardText(clipboard.text, source.bufferRendition))) ||
          isSupersededStamp ||
          (source.unmirroredAt > 0 && isRecent(source.unmirroredAt)))
      ? "buffer"
      : clipboard.artboards != null
        ? "foreign-artboards"
        : clipboard.hasImage
          ? "image"
          : clipboard.text.trim() !== ""
            ? "text"
            : source.buffer != null && clipboard.stamp == null
              ? "buffer"
              : "nothing";
}
function getActiveClipboardSource(
  clipboard?: Dynamic,
  now: Dynamic = Date.now(),
): Dynamic {
  return resolveClipboardSource(
    {
      buffer: ClipboardStateCurrentState,
      bufferStamp: ClipboardStateAlias,
      bufferRendition: ClipboardStateBufferRendition,
      unmirroredAt: ClipboardStateConstant,
      artboardClip: ClipboardStateArtboardItems != null,
      artboardClipAt: ClipboardStateNowValue,
      artboardClipStamp: ClipboardStateArtboardStamp,
      artboardClipRendition: ClipboardStateArtboardRendition,
      supersededStamps: ClipboardStateSliceValue,
    },
    clipboard,
    now,
  );
}
function clearClipboardBuffers(): Dynamic {
  clearClipboardStamps();
  ClipboardStateCurrentState = null;
  ClipboardStateConstant = 0;
  ClipboardStateArtboardItems = null;
  ClipboardStateArtboardAnnotations = [];
}
function getArtboardClipboard(): Dynamic {
  return ClipboardStateArtboardItems;
}
function getAnnotationClipboard(): Dynamic {
  return ClipboardStateArtboardItems == null ? [] : ClipboardStateArtboardAnnotations;
}
function setArtboardClipboard(
  artboards?: Dynamic,
  stampOptions?: Dynamic,
  annotations: Dynamic = [],
): Dynamic {
  (artboards.length === 0 && annotations.length === 0) ||
    (ClipboardStateGeneration++,
    clearClipboardStamps(),
    (ClipboardStateArtboardItems = artboards),
    (ClipboardStateArtboardAnnotations = annotations),
    (ClipboardStateNowValue = Date.now()),
    (ClipboardStateArtboardStamp = stampOptions?.stamp ?? null),
    (ClipboardStateArtboardRendition =
      ClipboardStateArtboardStamp != null && stampOptions?.rendition
        ? stampOptions.rendition
        : null),
    (ClipboardStateCurrentState = null));
}
export {
  afterClipboardSettled,
  claimClipboardMark,
  clearClipboardBuffers,
  clearClipboardStamps,
  clipboardGeneration,
  clipboardObjectStamp,
  ClipboardStateAlias,
  ClipboardStateArtboardItems as ClipboardStateAlias_2,
  ClipboardStateArtboardAnnotations as ClipboardStateAlias_3,
  ClipboardStateConstant,
  ClipboardStateSequenceCounter as ClipboardStateConstant_2,
  ClipboardStateGeneration as ClipboardStateConstant_3,
  ClipboardStateCurrentState,
  ClipboardStateDelayMs,
  ClipboardStateFilterValue,
  ClipboardStateDeferredTasks as ClipboardStateFilterValue_2,
  ClipboardStateHandler,
  ClipboardStateIsArray,
  ClipboardStateLimit,
  ClipboardStateMarkMaxAgeMs as ClipboardStateLimit_2,
  ClipboardStateNowValue,
  ClipboardStateObservedElements,
  ClipboardStateReplace,
  ClipboardStateResolvedValue,
  ClipboardStateBufferRendition as ClipboardStateResolvedValue_2,
  ClipboardStateArtboardStamp as ClipboardStateResolvedValue_3,
  ClipboardStateArtboardRendition as ClipboardStateResolvedValue_4,
  ClipboardStateSliceValue,
  DesignArtboardsKey,
  DesignElementsKey,
  expireClipboardMarks,
  getActiveClipboardSource,
  getAnnotationClipboard,
  getArtboardClipboard,
  getElementClipboard,
  hasPendingClipboardMarks,
  isClipboardSettling,
  isClipboardStampConsumed,
  localClipboardSequence,
  markConsumedClipboardStamp,
  markLocalElementClipboard,
  mirrorArtboardClipboardStamp,
  readArtboardClipboard,
  readBoundedClipboardObject,
  rememberClipboardStamp,
  resolveClipboardSource,
  runDeferredClipboardTasks,
  sameClipboardText,
  setArtboardClipboard,
  setElementClipboard,
  startClipboardMark,
};
export function installEditorClipboardState(): () => void {
  return () => {
    DesignElementsKey = "design-elements";
    DesignArtboardsKey = "design-artboards";
    ClipboardStateResolvedValue = 34 * 1024 * 1024;
    ClipboardStateIsArray = (candidate?: Dynamic): Dynamic =>
      typeof candidate == "object" &&
      candidate !== null &&
      Array.isArray(candidate.artboards) &&
      candidate.artboards.length > 0;
    ClipboardStateHandler = (count?: Dynamic): Dynamic =>
      typeof count == "number" &&
      Number.isInteger(count) &&
      count > 0 &&
      count <= maxAnnotationCount
        ? count
        : 0;
    ClipboardStateCurrentState = null;
    ClipboardStateConstant = 0;
    ClipboardStateAlias = null;
    ClipboardStateBufferRendition = null;
    ClipboardStateSliceValue = [];
    ClipboardStateFilterValue = [];
    ClipboardStateSequenceCounter = 0;
    localClipboardSequence = 0;
    ClipboardStateDeferredTasks = [];
    ClipboardStateDelayMs = 3e3;
    ClipboardStateObservedElements = new WeakSet();
    ClipboardStateLimit = 2e3;
    hasPendingClipboardMarks = (
      untilSequence?: Dynamic,
      now: Dynamic = Date.now(),
    ): Dynamic =>
      ClipboardStateFilterValue.some(
        (mark?: Dynamic): Dynamic =>
          mark.droppedAt === 0 &&
          mark.seq <= untilSequence &&
          now - mark.at < ClipboardStateMarkMaxAgeMs,
      );
    ClipboardStateGeneration = 0;
    ClipboardStateMarkMaxAgeMs = 3e4;
    ClipboardStateArtboardItems = null;
    ClipboardStateArtboardAnnotations = [];
    ClipboardStateNowValue = 0;
    ClipboardStateArtboardStamp = null;
    ClipboardStateArtboardRendition = null;
    ClipboardStateReplace = (text?: Dynamic): Dynamic =>
      text.replace(
        /\r\n?/g,
        `
`,
      );
  };
}
