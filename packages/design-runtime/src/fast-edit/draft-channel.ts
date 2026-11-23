/** Restored application module; prepare first, initialize in original order. */
import {
  type Dynamic,
} from "../runtime-types";
import { cachedRoomCapability } from "../platform/file-content";

var DRAFT_EVENT_NAME: Dynamic;
var DRAFT_EMIT_MIN_GAP_MS: Dynamic;
var DRAFT_EMIT_MIN_CHARS: Dynamic;
var DRAFT_INITIAL_TIMEOUT_MS: Dynamic;
var DRAFT_HEARTBEAT_MS: Dynamic;
var DRAFT_SOFT_EXPIRY_MS: Dynamic;
var DRAFT_MAX_LIFETIME_MS: Dynamic;
var DRAFT_MAX_TOMBSTONES: Dynamic;
var resolveDraftChannel: Dynamic;
var DRAFT_MAX_ACTIVE_FILES: Dynamic;
function createDraftEmitter(
  path?: Dynamic,
  now: Dynamic = Date.now,
): Dynamic {
  let channel: Dynamic,
    disabled: Dynamic = false,
    sequence: Dynamic = 0,
    draftText: Dynamic = "",
    lastSentText: Dynamic = null,
    lastSentAt: Dynamic = 0,
    emitIntervalMs: Dynamic = 250,
    timer: Dynamic,
    ended: Dynamic = false;
  resolveDraftChannel().then((resolvedChannel?: Dynamic): Dynamic => {
    channel = resolvedChannel;
    resolvedChannel === null || typeof resolvedChannel.emit != "function"
      ? (disabled = true)
      : scheduleEmit(0);
  });
  let emit: Dynamic = (payload?: Dynamic): Dynamic => {
    channel
      ?.emit?.(DRAFT_EVENT_NAME, payload)
      .catch((error?: Dynamic): Dynamic => {
        error?.code !== "upstream_error" && (disabled = true);
      });
  };
  function scheduleEmit(delayMs?: Dynamic): Dynamic {
    disabled ||
      ended ||
      timer !== undefined ||
      channel === undefined ||
      (timer = setTimeout(
        (): Dynamic => {
          timer = undefined;
          if (disabled || ended) return;
          if (draftText === lastSentText && now() - lastSentAt < DRAFT_INITIAL_TIMEOUT_MS)
            return scheduleEmit(DRAFT_INITIAL_TIMEOUT_MS - (now() - lastSentAt));
          let chunks: Dynamic = draftText.match(/[\s\S]{1,1000}/g) ?? [""],
            chunkCount: Dynamic = Math.min(chunks.length, DRAFT_EMIT_MIN_CHARS),
            frameSequence: Dynamic = sequence++;
          lastSentText = draftText;
          lastSentAt = now();
          emitIntervalMs = Math.max(250, 200 * chunkCount);
          chunks.slice(0, chunkCount).forEach(
            (chunk?: Dynamic, chunkIndex?: Dynamic): Dynamic =>
              emit({
                s: path,
                n: frameSequence,
                i: chunkIndex,
                k: chunkCount,
                h: chunk,
              }),
          );
          scheduleEmit();
        },
        delayMs ?? Math.max(0, emitIntervalMs - (now() - lastSentAt)),
      ));
  }
  return {
    frame(nextText: Dynamic): Dynamic {
      draftText = nextText.slice(0, DRAFT_EMIT_MIN_GAP_MS * DRAFT_EMIT_MIN_CHARS);
      timer !== undefined &&
        draftText !== lastSentText &&
        (clearTimeout(timer), (timer = undefined));
      scheduleEmit();
    },
    end(): Dynamic {
      ended ||
        ((ended = true),
        timer !== undefined && clearTimeout(timer),
        !disabled &&
          sequence > 0 &&
          emit({
            s: path,
            end: 1,
          }));
    },
  };
}
function subscribeDraftPreviews(
  onPreview?: Dynamic,
  viewerId?: Dynamic,
  now: Dynamic = Date.now,
  resolveChannel: Dynamic = resolveDraftChannel,
): Dynamic {
  let activePreviews: Dynamic = new Map(),
    tombstones: Dynamic = new Map(),
    rememberTombstone: Dynamic = (
      input?: Dynamic,
      options?: Dynamic,
    ): Dynamic => {
      tombstones.set(input + "\0" + options, now() + DRAFT_MAX_LIFETIME_MS);
      tombstones.size > DRAFT_MAX_TOMBSTONES &&
        tombstones.delete(tombstones.keys().next().value);
    },
    expirePreview: Dynamic = (
      input?: Dynamic,
      options?: Dynamic,
    ): Dynamic => {
      activePreviews.delete(input);
      now() - options.since >= DRAFT_MAX_LIFETIME_MS &&
        rememberTombstone(options.who, input);
      onPreview({
        path: input,
        html: null,
        peer: options.peer,
      });
    },
    value: Dynamic,
    flag: Dynamic = false;
  resolveChannel().then((input?: Dynamic): Dynamic => {
    if (!(flag || input === null || typeof input.on != "function"))
      try {
        value = input.on(DRAFT_EVENT_NAME, (event?: Dynamic): Dynamic => {
          let data: Dynamic = event.data;
          if (
            event.sameTab === true ||
            data === null ||
            typeof data != "object" ||
            typeof data.s != "string" ||
            data.s.length > 64 ||
            !viewerId(data.s) ||
            (!activePreviews.has(data.s) &&
              activePreviews.size >= DRAFT_MAX_ACTIVE_FILES)
          )
            return;
          let peer: Dynamic =
              typeof event.peer == "string" ? event.peer : "",
            sender: Dynamic =
              typeof event.by == "string" && event.by !== ""
                ? "u:" + event.by
                : "p:" + peer,
            entry: Dynamic = tombstones.get(sender + "\0" + data.s);
          if (entry !== undefined) {
            if (now() < entry) return;
            tombstones.delete(sender + "\0" + data.s);
          }
          if (data.end !== undefined) {
            activePreviews.get(data.s)?.peer === peer &&
              (activePreviews.delete(data.s),
              onPreview({
                path: data.s,
                html: null,
                peer: peer,
              }));
            return;
          }
          if (
            typeof data.n != "number" ||
            typeof data.i != "number" ||
            typeof data.k != "number" ||
            typeof data.h != "string" ||
            data.k < 1 ||
            data.k > DRAFT_EMIT_MIN_CHARS ||
            data.i < 0 ||
            data.i >= data.k ||
            data.h.length > DRAFT_EMIT_MIN_GAP_MS
          )
            return;
          let preview: Dynamic = activePreviews.get(data.s);
          if (
            preview !== undefined &&
            preview.who === sender &&
            now() - preview.since >= DRAFT_MAX_LIFETIME_MS
          ) {
            expirePreview(data.s, preview);
            return;
          }
          if (
            (preview !== undefined &&
              preview.peer !== peer &&
              now() - preview.seen < DRAFT_HEARTBEAT_MS) ||
            ((preview === undefined || preview.peer !== peer) &&
              ((preview = {
                peer: peer,
                who: sender,
                n: -1,
                parts: new Map(),
                k: 0,
                seen: now(),
                moved: now(),
                since:
                  preview !== undefined && preview.who === sender
                    ? preview.since
                    : now(),
                last: "\0",
              }),
              activePreviews.set(data.s, preview)),
            (preview.seen = now()),
            data.n < preview.n) ||
            (data.n > preview.n &&
              ((preview.n = data.n),
              (preview.parts = new Map()),
              (preview.k = data.k),
              (preview.moved = now())),
            preview.parts.set(data.i, data.h),
            preview.parts.size < preview.k)
          )
            return;
          let text: Dynamic = "";
          for (let index: Dynamic = 0; index < preview.k; index++)
            text += preview.parts.get(index) ?? "";
          text !== preview.last &&
            ((preview.last = text),
            (preview.moved = now()),
            onPreview({
              path: data.s,
              html: text,
              peer: peer,
            }));
        });
      } catch {}
  });
  let callback: Dynamic = (input?: Dynamic): Dynamic =>
    now() - input.seen < DRAFT_HEARTBEAT_MS &&
    now() - input.moved < DRAFT_SOFT_EXPIRY_MS &&
    now() - input.since < DRAFT_MAX_LIFETIME_MS;
  return {
    holds(input: Dynamic): Dynamic {
      let entry: Dynamic = activePreviews.get(input);
      return entry !== undefined && callback(entry);
    },
    sweep(): Dynamic {
      for (let [path, preview] of [...activePreviews] as Dynamic)
        callback(preview) || expirePreview(path, preview);
      return activePreviews.size > 0;
    },
    stop(): Dynamic {
      flag = true;
      value?.();
    },
  };
}
export {
  createDraftEmitter,
  DRAFT_EMIT_MIN_CHARS,
  DRAFT_EMIT_MIN_GAP_MS,
  DRAFT_EVENT_NAME,
  DRAFT_HEARTBEAT_MS,
  DRAFT_INITIAL_TIMEOUT_MS,
  DRAFT_MAX_ACTIVE_FILES,
  DRAFT_MAX_LIFETIME_MS,
  DRAFT_MAX_TOMBSTONES,
  DRAFT_SOFT_EXPIRY_MS,
  resolveDraftChannel,
  subscribeDraftPreviews,
};
export function installFastEditDraftChannel(): () => void {
  return () => {
    DRAFT_EVENT_NAME = "draft";
    DRAFT_EMIT_MIN_GAP_MS = 1e3;
    DRAFT_EMIT_MIN_CHARS = 40;
    DRAFT_INITIAL_TIMEOUT_MS = 5e3;
    DRAFT_HEARTBEAT_MS = 2e4;
    DRAFT_SOFT_EXPIRY_MS = 9e4;
    DRAFT_MAX_LIFETIME_MS = 18e4;
    DRAFT_MAX_TOMBSTONES = 64;
    resolveDraftChannel = async (): Promise<Dynamic> =>
      await cachedRoomCapability();
    DRAFT_MAX_ACTIVE_FILES = 8;
  };
}
