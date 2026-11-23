import { uiMessage } from '@minedesign/contracts/ui-messages';
/** Restored application module; prepare first, initialize in original order. */
import {
  type Dynamic,
} from "../runtime-types";
import { peerMessageMaxLength, peerChatHoldMs, peerChatFadeMs, peerChatExitDelayMs, CollaborationPeerCursorsMcChatHoldMcChatFadeMcChatExitConfig, normalizePeerMessage, peerCollaboratorIndex, peerCollaboratorToken, reactForUsePresenceComposer } from "./peer-cursors";
import { hasBlockingOverlay } from "../editor/chrome/overlay-state";
import { roomPeersStore } from "../platform/file-content";

var CollaborationPresenceComposerJoin: Dynamic;
function isPeerTextInput(target?: Dynamic): Dynamic {
  let element: Dynamic = target;
  return (
    element != null &&
    typeof element.tagName == "string" &&
    (/^(INPUT|TEXTAREA|SELECT)$/.test(element.tagName) ||
      element.isContentEditable === true)
  );
}
function usePresenceComposer({
  reporter: reporter,
  color: color,
  canOpen: canOpen,
  idleMs = peerChatHoldMs,
}: Dynamic): Dynamic {
  let [isOpen, setIsOpen]: Dynamic = (0,
    reactForUsePresenceComposer.useState)(false),
    [isLeaving, setIsLeaving]: Dynamic = (0,
    reactForUsePresenceComposer.useState)(false),
    [draft, setDraft]: Dynamic = (0,
    reactForUsePresenceComposer.useState)(""),
    [isFading, setIsFading]: Dynamic = (0,
    reactForUsePresenceComposer.useState)(false),
    closeTimerRef: Dynamic = (0, reactForUsePresenceComposer.useRef)(
      undefined,
    ),
    [bubbleColor, setBubbleColor]: Dynamic = (0,
    reactForUsePresenceComposer.useState)(""),
    [anchorPoint, setAnchorPoint]: Dynamic = (0,
    reactForUsePresenceComposer.useState)(null),
    pointerRef: Dynamic = (0, reactForUsePresenceComposer.useRef)(
      null,
    ),
    isActiveRef: Dynamic = (0, reactForUsePresenceComposer.useRef)(
      false,
    );
  isActiveRef.current = isOpen && !isLeaving;
  let bubbleRef: Dynamic = (0, reactForUsePresenceComposer.useRef)(
      null,
    ),
    inputRef: Dynamic = (0, reactForUsePresenceComposer.useRef)(
      null,
    ),
    previousFocusRef: Dynamic = (0, reactForUsePresenceComposer.useRef)(
      null,
    ),
    timersRef: Dynamic = (0, reactForUsePresenceComposer.useRef)(
      [],
    ),
    latestPropsRef: Dynamic = (0, reactForUsePresenceComposer.useRef)({
      reporter: reporter,
      canOpen: canOpen,
      idleMs: idleMs,
      color: color,
    });
  latestPropsRef.current = {
    reporter: reporter,
    canOpen: canOpen,
    idleMs: idleMs,
    color: color,
  };
  let clearTimers: Dynamic = (): Dynamic => {
      for (let timerId of timersRef.current as Dynamic) clearTimeout(timerId);
      timersRef.current = [];
    },
    closeComposer: Dynamic = (): Dynamic => {
      clearTimers();
      latestPropsRef.current.reporter()?.say("");
      setIsLeaving(true);
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = setTimeout((): Dynamic => {
        setIsOpen(false);
        setIsLeaving(false);
        setDraft("");
        setIsFading(false);
      }, peerChatExitDelayMs);
      let current: Dynamic = previousFocusRef.current;
      previousFocusRef.current = null;
      let activeElement: Dynamic = (document as Dynamic).activeElement;
      (activeElement === inputRef.current ||
        activeElement === null ||
        activeElement === (document as Dynamic).body) &&
        (document as Dynamic).hasFocus() &&
        current?.isConnected &&
        typeof current.focus == "function" &&
        current.focus();
      (document as Dynamic).activeElement === inputRef.current &&
        inputRef.current?.blur();
    },
    closeComposerRef: Dynamic = (0, reactForUsePresenceComposer.useRef)(
      closeComposer,
    );
  closeComposerRef.current = closeComposer;
  let restartIdleTimers: Dynamic = (): Dynamic => {
      clearTimers();
      setIsFading(false);
      let currentIdleMs: Dynamic = latestPropsRef.current.idleMs;
      timersRef.current = [
        setTimeout((): Dynamic => setIsFading(true), currentIdleMs),
        setTimeout(
          (): Dynamic => closeComposerRef.current(),
          currentIdleMs + peerChatFadeMs,
        ),
      ];
    },
    reportMessage: Dynamic = (message?: Dynamic): Dynamic => {
      latestPropsRef.current
        .reporter()
        ?.say(normalizePeerMessage(message).trim());
    };
  (0, reactForUsePresenceComposer.useEffect)((): Dynamic => {
    let handlePointerMove: Dynamic = (event?: Dynamic): Dynamic => {
        pointerRef.current = {
          x: event.clientX,
          y: event.clientY,
        };
        isActiveRef.current && setAnchorPoint(pointerRef.current);
      },
      handleSlashKeyDown: Dynamic = (event?: Dynamic): Dynamic => {
        if (
          event.key !== "/" ||
          event.metaKey ||
          event.ctrlKey ||
          event.altKey ||
          event.repeat ||
          event.defaultPrevented ||
          event.isComposing
        )
          return;
        let {
          reporter: getPresenceReporter,
          canOpen: canOpenComposer,
          color: peerColorHex,
        }: Dynamic = latestPropsRef.current;
        if (
          isPeerTextInput(event.target) ||
          (canOpenComposer !== undefined && !canOpenComposer(event))
        )
          return;
        if (isActiveRef.current) {
          (document as Dynamic).activeElement !== inputRef.current &&
            (event.preventDefault(), inputRef.current?.focus(), restartIdleTimers());
          return;
        }
        if (getPresenceReporter()?.live() !== true) return;
        event.preventDefault();
        previousFocusRef.current = (document as Dynamic).activeElement;
        let selfPeer: Dynamic = roomPeersStore
          .getSnapshot()
          .find((peer?: Dynamic): Dynamic => peer.sameTab);
        setBubbleColor(
          peerCollaboratorToken(
            peerCollaboratorIndex(peerColorHex, selfPeer?.peer ?? ""),
          ),
        );
        setAnchorPoint(pointerRef.current);
        setDraft("");
        setIsFading(false);
        clearTimeout(closeTimerRef.current);
        setIsLeaving(false);
        setIsOpen(true);
        restartIdleTimers();
        inputRef.current?.focus();
      },
      flag: Dynamic = false,
      handleEscapeKeyDown: Dynamic = (event?: Dynamic): Dynamic => {
        if (event.key === "Escape") {
          if (!event.repeat) {
            let hasModifier: Dynamic =
              event.metaKey ||
              event.ctrlKey ||
              event.altKey ||
              event.shiftKey;
            flag =
              isActiveRef.current &&
              !event.defaultPrevented &&
              !event.isComposing &&
              event.keyCode !== 229 &&
              !hasModifier &&
              !isPeerTextInput(event.target) &&
              !hasBlockingOverlay();
          }
          flag &&
            (event.preventDefault(),
            event.stopPropagation(),
            event.repeat || closeComposerRef.current());
        }
      },
      resetEscapeGuard: Dynamic = (event?: Dynamic): Dynamic => {
        (event.type === "blur" || event.key === "Escape") && (flag = false);
      };
    (window as Dynamic).addEventListener("pointermove", handlePointerMove, true);
    (window as Dynamic).addEventListener("keydown", handleSlashKeyDown);
    (window as Dynamic).addEventListener("keydown", handleEscapeKeyDown, true);
    (window as Dynamic).addEventListener("keyup", resetEscapeGuard, true);
    (window as Dynamic).addEventListener("blur", resetEscapeGuard);
    return (): Dynamic => {
      (window as Dynamic).removeEventListener("pointermove", handlePointerMove, true);
      (window as Dynamic).removeEventListener("keydown", handleSlashKeyDown);
      (window as Dynamic).removeEventListener("keydown", handleEscapeKeyDown, true);
      (window as Dynamic).removeEventListener("keyup", resetEscapeGuard, true);
      (window as Dynamic).removeEventListener("blur", resetEscapeGuard);
    };
  }, []);
  (0, reactForUsePresenceComposer.useEffect)(
    (): Dynamic => (): Dynamic => {
      for (let timerId of timersRef.current as Dynamic) clearTimeout(timerId);
      clearTimeout(closeTimerRef.current);
      latestPropsRef.current.reporter()?.say("");
    },
    [],
  );
  (0, reactForUsePresenceComposer.useLayoutEffect)(
    (): Dynamic => {
      let current: Dynamic = bubbleRef.current;
      if (!current) return;
      let anchor: Dynamic = anchorPoint ?? {
          x: (window as Dynamic).innerWidth / 2,
          y: (window as Dynamic).innerHeight / 2,
        },
        offsetWidth: Dynamic = current.offsetWidth,
        offsetHeight: Dynamic = current.offsetHeight,
        left: Dynamic = Math.max(
          4,
          Math.min(
            anchor.x + 10,
            (window as Dynamic).innerWidth - offsetWidth - 4,
          ),
        ),
        top: Dynamic =
          anchor.y + 16 + offsetHeight > (window as Dynamic).innerHeight - 4
            ? Math.max(4, anchor.y - 12 - offsetHeight)
            : anchor.y + 16;
      current.style.transform =
        "translate(" + left + "px," + top + "px)";
    },
  );
  return isOpen ? (
    <div
      ref={bubbleRef}
      className={"mc-cursor-chat-self"}
      data-fading={isFading ? "true" : undefined}
      data-leaving={isLeaving ? "true" : undefined}
      style={{
        ...CollaborationPeerCursorsMcChatHoldMcChatFadeMcChatExitConfig,
        "--mc-chat-hold": idleMs + "ms",
      }}
    >
      <label
        className={"mc-cursor-chat"}
        style={{
          background: bubbleColor,
        }}
      >
        <span className={"mc-cursor-chat-sizer"} aria-hidden={"true"}>
          {draft || (" ")}
        </span>
        <input
          ref={inputRef}
          className={"mc-cursor-chat-input"}
          aria-label={uiMessage("canvas.presenceComposer.cursorChat")}
          autoFocus={true}
          autoComplete={"off"}
          spellCheck={false}
          size={1}
          readOnly={isLeaving}
          value={draft}
          onChange={(event?: Dynamic): Dynamic => {
            restartIdleTimers();
            let trimmedText: Dynamic = CollaborationPresenceComposerJoin(
              event.target.value,
            );
            setDraft(trimmedText);
            reportMessage(trimmedText);
          }}
          onKeyDown={(event?: Dynamic): Dynamic => {
            isLeaving ||
              event.nativeEvent.isComposing ||
              (restartIdleTimers(),
              event.key === "Escape"
                ? (event.preventDefault(),
                  event.stopPropagation(),
                  draft === ""
                    ? closeComposer()
                    : (setDraft(""), reportMessage(""), restartIdleTimers()))
                : event.key === "Enter"
                  ? (event.preventDefault(), setDraft(""))
                  : event.key === "/" &&
                    event.repeat &&
                    draft === "" &&
                    event.preventDefault());
          }}
        />
      </label>
    </div>
  ) : null;
}
export {
  CollaborationPresenceComposerJoin,
  isPeerTextInput,
  usePresenceComposer,
};
export function installCollaborationPresenceComposer(): () => void {
  return () => {
    CollaborationPresenceComposerJoin = (text?: Dynamic): Dynamic =>
      Array.from(text)
        .slice(0, peerMessageMaxLength)
        .join("");
  };
}
