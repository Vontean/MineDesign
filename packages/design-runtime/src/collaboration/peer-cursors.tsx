import { uiMessage } from '@minedesign/contracts/ui-messages';
import { useUiLocale } from '../ui-locale.ts';
/** Restored application module; prepare first, initialize in original order. */
import {
  type Dynamic,
} from "../runtime-types";
import { initializeCdsIndex } from "../cds/index";
import { tokens } from "../cds/theme/tokens";
import { load_react, load_react_jsx_runtime } from "../dependencies";
import { toModuleNamespace } from "../module-helpers";
import { cachedRoomCapability, hasRoomCapability, roomPeersStore } from "../platform/file-content";
import { getUserNames } from "../platform/user-capabilities";

var reactCollaborationPeerCursors: Dynamic;
var reactCollaborationPeerCursors_2: Dynamic;
var reactCollaborationPeerCursors_3: Dynamic;
var jsxCollaborationPeerCursors: Dynamic;
var jsxCollaborationPeerCursors_2: Dynamic;
var CollaborationPeerCursorsResolvedValue: Dynamic;
var CollaborationPeerCursorsLimit: Dynamic;
var CollaborationPeerCursorsDelayMs: Dynamic;
var CollaborationPeerCursorsItems: Dynamic;
var CollaborationPeerCursorsPattern: Dynamic;
var CollaborationPeerCursorsCache: Dynamic;
var CollaborationPeerCursorsConstant: Dynamic;
var peerMessageMaxLength: Dynamic;
var peerChatHoldMs: Dynamic;
var peerChatFadeMs: Dynamic;
var CollaborationPeerCursorsDelayMs_2: Dynamic;
var CollaborationPeerCursorsMcChatHoldMcChatFadeMcChatExitConfig: Dynamic;
var PeerCursorLabel: Dynamic;
var CollaborationPeerCursorsCache_2: Dynamic;
function PeerCursorGlyph({ color: color }: Dynamic): Dynamic {
  useUiLocale();
  return (
    <svg
      aria-hidden={"true"}
      width={"16"}
      height={"16"}
      viewBox={"0 0 16 16"}
      className={"mc-peer-cursor-arrow"}
    >
      <path
        d={"M1.5 1.2 L14 7.2 L8.4 8.6 L6.4 14.5 Z"}
        fill={color}
        stroke={"#fff"}
        strokeWidth={"1.2"}
        strokeLinejoin={"round"}
      />
    </svg>
  );
}
function peerColor(items?: Dynamic): Dynamic {
  let index: Dynamic = 0;
  for (let charIndex: Dynamic = 0; charIndex < items.length; charIndex++)
    index = (index * 31 + items.charCodeAt(charIndex)) >>> 0;
  return (
    CollaborationPeerCursorsItems[
      index % CollaborationPeerCursorsItems.length
    ] ?? "#788c5d"
  );
}
function peerCollaboratorIndex(colorHex?: Dynamic, peerId?: Dynamic): Dynamic {
  return (
    (typeof colorHex == "string" && CollaborationPeerCursorsPattern.test(colorHex)
      ? CollaborationPeerCursorsCache.get(colorHex.toLowerCase())
      : undefined) ??
    CollaborationPeerCursorsCache.get(peerColor(peerId)) ??
    1
  );
}
function peerCollaboratorToken(collaboratorIndex?: Dynamic): Dynamic {
  return (
    tokens.editor.collaborator[collaboratorIndex]?.cssVar ??
    tokens.editor.collaborator[1].cssVar
  );
}
function peerMotionReduced(): Dynamic {
  return (
    typeof matchMedia == "function" &&
    matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}
function usePeerMessageVisibility(messageShape?: Dynamic): Dynamic {
  let elementRef: Dynamic = (0, reactCollaborationPeerCursors_3.useRef)(null),
    lastLayoutRef: Dynamic = (0, reactCollaborationPeerCursors_3.useRef)(null),
    current: Dynamic = elementRef.current,
    isFaded: Dynamic =
      current != null &&
      typeof getComputedStyle == "function" &&
      parseFloat(getComputedStyle(current).opacity) < 0.2;
  (0, reactCollaborationPeerCursors_3.useLayoutEffect)((): Dynamic => {
    let element: Dynamic = elementRef.current;
    if (!element) return;
    let state: Dynamic = {
        w: element.offsetWidth,
        h: element.offsetHeight,
        shape: messageShape,
      },
      previousLayout: Dynamic = lastLayoutRef.current;
    lastLayoutRef.current = state;
    if (
      !previousLayout ||
      previousLayout.shape === messageShape ||
      !state.w ||
      !state.h ||
      typeof element.animate != "function"
    )
      return;
    for (let animation of (element.getAnimations?.() ?? []) as Dynamic)
      animation.animationName || animation.cancel();
    if (isFaded || peerMotionReduced()) {
      element.animate(
        [
          {
            opacity: 0,
          },
          {
            opacity: 1,
          },
        ],
        {
          duration: 160,
          easing: "ease-out",
        },
      );
      return;
    }
    let startScale: Dynamic = Math.min(
        2,
        Math.max(
          0.5,
          Math.sqrt((previousLayout.w / state.w) * (previousLayout.h / state.h)),
        ),
      ),
      isLineShape: Dynamic = messageShape === "line";
    element.animate(
      [
        {
          transform: "scale(" + startScale + ")",
          transformOrigin: "0 0",
        },
        {
          transform: "scale(1)",
          transformOrigin: "0 0",
        },
      ],
      {
        duration: isLineShape ? 200 : 160,
        easing: isLineShape ? "cubic-bezier(.2,.9,.3,1.15)" : "ease-in",
      },
    );
  });
  return elementRef;
}
function normalizePeerMessage(message?: Dynamic): Dynamic {
  let normalized: Dynamic = Array.from(
    message
      .replace(/[\p{Cc}\p{Zl}\p{Zp}\s]+/gu, " ")
      .replace(/[^\P{Cf}\u200C\u200D]+/gu, ""),
  )
    .slice(0, peerMessageMaxLength)
    .join("");
  return /^[\s\u200C\u200D\p{Variation_Selector}]*$/u.test(normalized)
    ? ""
    : normalized;
}
function createPresenceReporter(reporterOptions: Dynamic = {}): Dynamic {
  let getNow: Dynamic = reporterOptions.now ?? ((): Dynamic => Date.now()),
    minDelta: Dynamic = reporterOptions.minDelta ?? 0.002,
    idleNullMs: Dynamic =
      reporterOptions.idleNullMs ?? CollaborationPeerCursorsResolvedValue,
    isDisabled: Dynamic = !hasRoomCapability(),
    lastSent: Dynamic,
    lastPosition: Dynamic,
    pendingTimer: Dynamic,
    pendingMove: Dynamic,
    idleTimer: Dynamic,
    flag: Dynamic = false,
    text: Dynamic = "";
  async function sendPresence(payload?: Dynamic): Promise<Dynamic> {
    if (isDisabled) return;
    let roomCapability: Dynamic = await cachedRoomCapability();
    if (typeof roomCapability?.presence != "function") {
      isDisabled = true;
      return;
    }
    try {
      await roomCapability.presence.call(roomCapability, payload);
    } catch (error: Dynamic) {
      let errorCode: Dynamic =
        typeof error == "object" && error !== null ? error.code : "";
      errorCode !== "upstream_error" &&
        errorCode !== "invalid_argument" &&
        (isDisabled = true);
    }
  }
  function clearPresence(): Dynamic {
    idleTimer !== undefined && clearTimeout(idleTimer);
    idleTimer = undefined;
    pendingMove = undefined;
    lastSent = undefined;
    flag &&
      ((flag = false),
      sendPresence({
        cursor: null,
      }));
  }
  function reportCursor(
    surfaceId?: Dynamic,
    x?: Dynamic,
    y?: Dynamic,
  ): Dynamic {
    let timestamp: Dynamic = getNow();
    lastSent = {
      s: surfaceId,
      x: x,
      y: y,
      at: timestamp,
    };
    lastPosition = {
      s: surfaceId,
      x: x,
      y: y,
    };
    flag = true;
    let roundCoordinate: Dynamic = (coordinate?: Dynamic): Dynamic =>
      Math.round(coordinate * 1e4) / 1e4;
    sendPresence({
      cursor: {
        s: surfaceId.slice(0, CollaborationPeerCursorsConstant),
        x: roundCoordinate(x),
        y: roundCoordinate(y),
        t: timestamp,
        ...(text === ""
          ? {}
          : {
              m: text,
            }),
      },
    });
    idleTimer !== undefined && clearTimeout(idleTimer);
    idleTimer = setTimeout(clearPresence, idleNullMs);
  }
  let callback: Dynamic = (): Dynamic => state.clear();
  typeof addEventListener == "function" &&
    addEventListener("pagehide", callback);
  let state: Dynamic = {
    move(surfaceId: Dynamic, x: Dynamic, y: Dynamic): Dynamic {
      if (
        isDisabled ||
        !Number.isFinite(x) ||
        !Number.isFinite(y) ||
        (lastSent &&
          lastSent.s === surfaceId &&
          Math.abs(lastSent.x - x) < minDelta &&
          Math.abs(lastSent.y - y) < minDelta)
      )
        return;
      let timestamp: Dynamic = getNow();
      if (
        lastSent &&
        lastSent.s === surfaceId &&
        timestamp - lastSent.at < CollaborationPeerCursorsDelayMs
      ) {
        pendingMove = {
          s: surfaceId,
          x: x,
          y: y,
        };
        pendingTimer ??= setTimeout((): Dynamic => {
          pendingTimer = undefined;
          let pendingPosition: Dynamic = pendingMove;
          pendingMove = undefined;
          pendingPosition && reportCursor(pendingPosition.s, pendingPosition.x, pendingPosition.y);
        }, CollaborationPeerCursorsDelayMs);
        return;
      }
      pendingMove = undefined;
      reportCursor(surfaceId, x, y);
    },
    say(message: Dynamic): Dynamic {
      let normalizedMessage: Dynamic = normalizePeerMessage(message);
      if (isDisabled || normalizedMessage === text || !lastPosition) return false;
      text = normalizedMessage;
      let position: Dynamic = pendingMove ?? lastPosition;
      pendingMove = undefined;
      reportCursor(position.s, position.x, position.y);
      return true;
    },
    live: (): Dynamic => !isDisabled && lastPosition !== undefined,
    clear(): Dynamic {
      clearPresence();
    },
    setWho(name: Dynamic, color: Dynamic): Dynamic {
      let displayName: Dynamic = Array.from(name).slice(0, 40).join(""),
        colorHex: Dynamic = CollaborationPeerCursorsPattern.test(color)
          ? color
          : "";
      (displayName === "" && colorHex === "") ||
        sendPresence({
          who: {
            n: displayName,
            c: colorHex,
          },
        });
    },
    dispose(): Dynamic {
      clearPresence();
      isDisabled = true;
      pendingTimer !== undefined && clearTimeout(pendingTimer);
      typeof removeEventListener == "function" &&
        removeEventListener("pagehide", callback);
    },
  };
  return state;
}
function getPeerCursors(
  peers?: Dynamic,
  surfaceId?: Dynamic,
  nowMs?: Dynamic,
  userNames: Dynamic = CollaborationPeerCursorsCache_2,
): Dynamic {
  let items: Dynamic = [];
  for (let peer of peers as Dynamic) {
    if (peer.sameTab) continue;
    let cursor: Dynamic = peer.presence.cursor;
    if (typeof cursor != "object" || cursor === null) continue;
    let peerCursor: Dynamic = cursor;
    if (peerCursor.s !== surfaceId) continue;
    let t: Dynamic = peerCursor.t,
      reportedAt: Dynamic =
        typeof t == "number" && Number.isFinite(t)
          ? Math.min(t, nowMs)
          : peer.updatedAt,
      ageMs: Dynamic = nowMs - reportedAt;
    if (ageMs >= CollaborationPeerCursorsResolvedValue) continue;
    let x: Dynamic = peerCursor.x,
      y3: Dynamic = peerCursor.y;
    if (
      typeof x != "number" ||
      typeof y3 != "number" ||
      !Number.isFinite(x) ||
      !Number.isFinite(y3)
    )
      continue;
    let who: Dynamic = peer.presence.who,
      whoInfo: Dynamic = typeof who == "object" && who !== null ? who : {},
      displayName: Dynamic = (
        (peer.by !== null && userNames.get(peer.by)) ||
        (typeof whoInfo.n == "string" ? whoInfo.n : "")
      ).slice(0, 40),
      collaboratorIndex: Dynamic = peerCollaboratorIndex(whoInfo.c, peer.peer),
      messageAgeMs: Dynamic =
        peer.updatedAt > 0 ? nowMs - peer.updatedAt : ageMs,
      message: Dynamic =
        typeof peerCursor.m == "string" &&
        messageAgeMs <
          peerChatHoldMs +
            peerChatFadeMs
          ? normalizePeerMessage(peerCursor.m).trim()
          : "";
    items.push({
      peer: peer.peer,
      x: x,
      y: y3,
      name: displayName,
      collaborator: collaboratorIndex,
      idleMs: Math.max(0, ageMs),
      message: message,
    });
  }
  return items;
}
function usePeerProfiles(peers?: Dynamic): Dynamic {
  let userIdsKey: Dynamic = [
      ...new Set(
        peers.flatMap(
          (peer?: Dynamic): Dynamic =>
            peer.by !== null && !peer.sameTab ? [peer.by] : [],
        ),
      ),
    ].sort().join(`
`),
    [userNames, setUserNames]: Dynamic = (0, reactCollaborationPeerCursors_3.useState)(
      CollaborationPeerCursorsCache_2,
    );
  (0, reactCollaborationPeerCursors_3.useEffect)((): Dynamic => {
    if (userIdsKey === "") return;
    let flag: Dynamic = true;
    getUserNames(
      userIdsKey.split(`
`),
    ).then((names?: Dynamic): Dynamic => {
      flag && setUserNames(names);
    });
    return (): Dynamic => {
      flag = false;
    };
  }, [userIdsKey]);
  return userNames;
}
function usePeerCursors(
  surfaceId?: Dynamic,
  getNow: Dynamic = Date.now,
): Dynamic {
  let peers: Dynamic = (0,
    reactCollaborationPeerCursors_3.useSyncExternalStore)(
      roomPeersStore.subscribe,
      roomPeersStore.getSnapshot,
      roomPeersStore.getSnapshot,
    ),
    userNames: Dynamic = usePeerProfiles(peers),
    [, setTick]: Dynamic = (0, reactCollaborationPeerCursors_3.useState)(0);
  (0, reactCollaborationPeerCursors_3.useEffect)((): Dynamic => {
    let intervalId: Dynamic = setInterval(
      (): Dynamic => setTick((tick?: Dynamic): Dynamic => tick + 1),
      5e3,
    );
    return (): Dynamic => clearInterval(intervalId);
  }, []);
  return getPeerCursors(peers, surfaceId, getNow(), userNames);
}
function PeerCursors({
  surface: surface,
  toLocal: toLocal,
  glyphScale: glyphScale,
  className: className,
  now: now,
  working: working,
}: Dynamic): Dynamic {
  useUiLocale();
  let cursors: Dynamic = usePeerCursors(surface, now),
    glyphScaleFactor: Dynamic =
      glyphScale !== undefined &&
      Number.isFinite(glyphScale) &&
      glyphScale > 0
        ? glyphScale
        : 1;
  return (
    <div
      aria-hidden={"true"}
      className={"mc-peer-cursors " + (className ?? "")}
    >
      {cursors.map((cursor?: Dynamic): Dynamic => {
        let localPosition: Dynamic = toLocal(cursor.x, cursor.y);
        if (localPosition === null) return null;
        let isIdle: Dynamic = cursor.idleMs >= CollaborationPeerCursorsLimit,
          cursorColor: Dynamic = peerCollaboratorToken(cursor.collaborator);
        return (() => {
          const _Component = "div";
          const _props = {
            className: "mc-peer-cursor",
            "data-idle": isIdle ? "true" : undefined,
            style: {
              transform:
                "translate(" +
                localPosition.left +
                "px," +
                localPosition.top +
                "px)" +
                (glyphScaleFactor === 1 ? "" : " scale(" + glyphScaleFactor + ")"),
              transformOrigin: "0 0",
            },
            children: [
              <PeerCursorGlyph color={cursorColor} />,
              <PeerCursorLabel
                name={cursor.name}
                color={cursorColor}
                message={cursor.message}
                dim={isIdle}
                working={working?.has(cursor.peer) === true}
              />,
            ],
          } as const;
          const _key = cursor.peer;
          return <_Component key={_key} {..._props} />;
        })();
      })}
    </div>
  );
}
export {
  CollaborationPeerCursorsCache,
  CollaborationPeerCursorsCache_2,
  CollaborationPeerCursorsConstant,
  peerMessageMaxLength as CollaborationPeerCursorsConstant_2,
  peerChatHoldMs as CollaborationPeerCursorsConstant_3,
  peerChatFadeMs as CollaborationPeerCursorsConstant_4,
  CollaborationPeerCursorsDelayMs,
  CollaborationPeerCursorsDelayMs_2,
  CollaborationPeerCursorsItems,
  CollaborationPeerCursorsLimit,
  CollaborationPeerCursorsMcChatHoldMcChatFadeMcChatExitConfig,
  CollaborationPeerCursorsPattern,
  CollaborationPeerCursorsResolvedValue,
  createPresenceReporter,
  getPeerCursors,
  jsxCollaborationPeerCursors,
  jsxCollaborationPeerCursors_2,
  normalizePeerMessage,
  peerCollaboratorIndex,
  peerCollaboratorToken,
  peerColor,
  PeerCursorGlyph,
  PeerCursorLabel,
  PeerCursors,
  peerMotionReduced,
  reactCollaborationPeerCursors,
  reactCollaborationPeerCursors_2,
  reactCollaborationPeerCursors_3,
  usePeerCursors,
  usePeerMessageVisibility,
  usePeerProfiles,
};
export function installCollaborationPeerCursors(): () => void {
  return () => {
    reactCollaborationPeerCursors = toModuleNamespace(
      load_react(),
      1,
    );
    reactCollaborationPeerCursors_2 = toModuleNamespace(
      load_react(),
      1,
    );
    initializeCdsIndex();
    reactCollaborationPeerCursors_3 = toModuleNamespace(
      load_react(),
      1,
    );
    initializeCdsIndex();
    jsxCollaborationPeerCursors = toModuleNamespace(
      load_react_jsx_runtime(),
      1,
    );
    jsxCollaborationPeerCursors_2 = toModuleNamespace(
      load_react_jsx_runtime(),
      1,
    );
    CollaborationPeerCursorsResolvedValue = 15 * 6e4;
    CollaborationPeerCursorsLimit = 6e4;
    CollaborationPeerCursorsDelayMs = 33;
    CollaborationPeerCursorsItems = [
      "#62744c",
      "#b04e72",
      "#5b7596",
      "#a3651f",
      "#7a6ba8",
      "#3f7a75",
    ];
    CollaborationPeerCursorsPattern = /^#[0-9a-f]{6}$/i;
    CollaborationPeerCursorsCache = new Map([
      ["#7a6ba8", 1],
      ["#b04e72", 2],
      ["#3f7a75", 3],
      ["#62744c", 4],
      ["#a3651f", 5],
      ["#5b7596", 6],
      ["#c7c9d1", 6],
    ]);
    CollaborationPeerCursorsConstant = 128;
    peerMessageMaxLength = 50;
    peerChatHoldMs = 5e3;
    peerChatFadeMs = 600;
    CollaborationPeerCursorsDelayMs_2 = 150;
    CollaborationPeerCursorsMcChatHoldMcChatFadeMcChatExitConfig = {
      get "--mc-chat-hold"() { return (peerChatHoldMs) + ("ms"); },
      get "--mc-chat-fade"() { return (peerChatFadeMs) + ("ms"); },
      get "--mc-chat-exit"() { return (CollaborationPeerCursorsDelayMs_2) + ("ms"); },
    };
    PeerCursorLabel = (0, reactCollaborationPeerCursors_3.memo)(function ({
      name: name,
      color: color,
      message: message,
      dim: dim,
      working: working,
    }: Dynamic): Dynamic {
      let messageStateRef: Dynamic = (0, reactCollaborationPeerCursors_3.useRef)({
        m: "",
        n: 0,
      });
      message !== messageStateRef.current.m &&
        (messageStateRef.current = {
          m: message,
          n: message === "" ? messageStateRef.current.n : messageStateRef.current.n + 1,
        });
      let [seenBeat, setSeenBeat]: Dynamic = (0,
        reactCollaborationPeerCursors_3.useState)(0),
        mode: Dynamic =
          message !== "" && seenBeat !== messageStateRef.current.n ? "line" : "name",
        labelRef: Dynamic = usePeerMessageVisibility(mode);
      return dim && mode === "name" && !working ? null : (
        <span
          ref={labelRef}
          className={
            "mc-peer-tag " +
            (mode === "name" ? "mc-peer-cursor-label" : "mc-cursor-chat")
          }
          data-mode={mode}
          data-working={working && mode === "name" ? "true" : undefined}
          data-beat={mode === "line" ? messageStateRef.current.n % 2 : undefined}
          style={{
            background: color,
            ...CollaborationPeerCursorsMcChatHoldMcChatFadeMcChatExitConfig,
          }}
          onAnimationEnd={(event?: Dynamic): Dynamic => {
            event.target === event.currentTarget &&
              event.animationName ===
                "mc-cursor-chat-fade-" + (messageStateRef.current.n % 2) &&
              setSeenBeat(messageStateRef.current.n);
          }}
        >
          {mode === "name" ? (<span key={"name"} className={"mc-peer-tag-name"}>
              {(name || "Someone").slice(0, 16)}
            </span>) : (<span key={"line"} className={"mc-peer-tag-line"}>
              {message}
            </span>)}
          {working && mode === "name" ? (<span className={"mc-peer-tag-dots"}>
              <i />
              <i />
              <i />
            </span>) : (null)}
        </span>
      );
    });
    CollaborationPeerCursorsCache_2 = new Map();
  };
}
