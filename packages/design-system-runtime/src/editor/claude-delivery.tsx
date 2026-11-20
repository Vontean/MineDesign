import type * as React from "react";
import type * as Editor from "../contracts/editor-runtime";
import type * as Model from "../contracts";
import type * as Application from "../contracts/application";
/** Restored application module; prepare first, initialize in original order. */
import { loadReactNamespace } from "../dependencies";
import { copyTextToClipboard } from "./row-context-menu";
import { loadClaudeCapability } from "../host/claude-capabilities";
import { isArtifactOwner } from "../host/user-api";
import { toModuleNamespace } from "../module-helpers";
import { truncateUtf16Safely } from "../platform/compiled-page";

var reactDesignSystemEditors: typeof import("react");
var reactColorEditors: typeof import("react");
// MineDesign: the host is globalThis.designSystemHost (packages/design-system/src/editor/design-system-host.ts), not globalThis.claude.
var roomApiOwner: Editor.ClaudeEnvironment["designSystemHost"];
var roomApiPromise: Promise<Editor.RoomCapability | null> | undefined;
var EMPTY_ROOM_PEERS: readonly Editor.RoomPeer[];
var roomPeers: readonly Editor.RoomPeer[];
var roomPeerSubscribers: Set<() => void>;
var roomPeerListenerStarted: boolean;
var roomPeerUnsubscribe: (() => void) | null;
var roomPeerStore: Editor.RoomPeerStore;
var SEND_TO_CLAUDE_METHOD: "sendToClaudeSession";
var CAN_SEND_TO_CLAUDE_METHOD: "canSendToClaudeSession";
var CLAUDE_SELECTION_TEXT_MAX: number;
var CLAUDE_SELECTION_LABEL_MAX: number;
var CLAUDE_REQUEST_MAX: number;
var CLAUDE_PAYLOAD_MAX: number;
var CLAUDE_SEND_TIMEOUT_MS: number;
var ClaudeRequestTimeoutError: new (message?: string) => Error;
var UNSAFE_CLAUDE_REQUEST_CHARACTERS: RegExp;
var sanitizeClaudeRequest: (text: string, limit: number) => string;
var selectionTruncationNote: (length: number) => string;
var SELECTION_TRUNCATION_NOTE_PATTERN: RegExp;
var SELECTION_TRUNCATION_NOTE_RESERVE: number;
var claudePayloadLength: (payload: unknown) => number;
var UNSAFE_ARTIFACT_LABEL_PATTERN: RegExp;
var EMPTY_CLAUDE_DELIVERY_CONTEXT: Application.ClaudeDeliveryContext;
async function resolveClaudeRoom(): Promise<Editor.RoomCapability | null> {
  // MineDesign: the host is globalThis.designSystemHost (packages/design-system/src/editor/design-system-host.ts), not globalThis.claude.
  let claude = (globalThis as Editor.ClaudeEnvironment).designSystemHost;
  try {
    if (typeof claude?.use === "function") {
      let value = await loadClaudeCapability("room");
      if (typeof value === "object" && value !== null) {
        return value as Editor.RoomCapability;
      } else {
        return null;
      }
    }
  } catch {
    return null;
  }
  if (typeof claude?.room?.presence === "function") {
    return claude.room;
  } else {
    return null;
  }
}
function cachedClaudeRoom(): Promise<Editor.RoomCapability | null> {
  // MineDesign: the host is globalThis.designSystemHost (packages/design-system/src/editor/design-system-host.ts), not globalThis.claude.
  let claude = (globalThis as Editor.ClaudeEnvironment).designSystemHost;
  if (roomApiPromise === undefined || roomApiOwner !== claude) {
    roomApiOwner = claude;
    roomApiPromise = resolveClaudeRoom();
  }
  return roomApiPromise;
}
function normalizeRoomPeers(peerPayload: unknown): readonly Editor.RoomPeer[] {
  if (!Array.isArray(peerPayload)) {
    return EMPTY_ROOM_PEERS;
  }
  let items: Editor.RoomPeer[] = [];
  for (let peerRecord of peerPayload as unknown[]) {
    if (typeof peerRecord !== "object" || peerRecord === null) {
      continue;
    }
    let peerData = peerRecord as Record<string, unknown>;
    if (typeof peerData.peer !== "string") {
      continue;
    }
    items.push({
      peer: peerData.peer,
      by:
        typeof peerData.by === "string" && peerData.by !== "" ? peerData.by : null,
      isMe: peerData.isMe === true,
      sameTab: peerData.sameTab === true,
      presence:
        typeof peerData.presence === "object" && peerData.presence !== null
          ? peerData.presence
          : {},
      updatedAt: typeof peerData.updatedAt === "number" ? peerData.updatedAt : 0,
    });
  }
  return items;
}
function startRoomPeerListener(): void {
  if (roomPeerListenerStarted) {
    return;
  }
  roomPeerListenerStarted = true;
  cachedClaudeRoom().then((room): void => {
    if (typeof room?.onPeers !== "function" || !roomPeerListenerStarted) {
      return;
    }
    try {
      let value = room.onPeers.call(
        room,
        (peerSnapshot): void => {
          roomPeers = normalizeRoomPeers(peerSnapshot.peers);
          for (let notifySubscriber of [...roomPeerSubscribers]) {
            notifySubscriber();
          }
        },
        (): void => {
          roomPeers = EMPTY_ROOM_PEERS;
          for (let notifySubscriber of [...roomPeerSubscribers]) {
            notifySubscriber();
          }
        },
      );
      if (typeof value === "function") {
        roomPeerUnsubscribe = value as () => void;
      }
    } catch {}
  });
}
function getObjectProperty(object: unknown, key: string): unknown {
  if (typeof object === "object" && object !== null) {
    return (object as Record<string, unknown>)[key];
  } else {
    return undefined;
  }
}
function resolvePromptSuggestion(
  environment: unknown = globalThis,
): ((prompt: string) => Promise<void>) | undefined {
  // MineDesign: the host is globalThis.designSystemHost (packages/design-system/src/editor/design-system-host.ts), not globalThis.claude.
  let value = getObjectProperty(
      getObjectProperty(environment, "designSystemHost"),
      "chat",
    ),
    suggestPrompt = getObjectProperty(value, "suggestPrompt");
  if (typeof suggestPrompt !== "function") {
    return;
  }
  return async (promptText: string): Promise<void> => {
    await (suggestPrompt as (prompt: string) => Promise<unknown>).call(value, promptText);
  };
}
function withClaudeRequestTimeout<T>(
  promise: Promise<T>,
  timeout: number,
): Promise<T> {
  return new Promise<T>((resolvePromise, rejectPromise): void => {
    let value = setTimeout(
      () => rejectPromise(new ClaudeRequestTimeoutError("timeout")),
      timeout,
    );
    promise.then(
      (result) => {
        clearTimeout(value);
        return resolvePromise(result);
      },
      (error: unknown) => {
        clearTimeout(value);
        return rejectPromise(error);
      },
    );
  });
}
function fitClaudePayload(
  payload: Editor.SessionPayload,
): Editor.SessionPayload {
  let value = payload;
  for (
    let index: number = 0;
    index < 8 && value.selectedText !== undefined;
    index++
  ) {
    let excessLength: number = claudePayloadLength(value) - CLAUDE_PAYLOAD_MAX;
    if (excessLength <= 0) {
      break;
    }
    let { selectedText: selectedText, ...payloadWithoutText } = value,
      textWithoutNote = selectedText.replace(SELECTION_TRUNCATION_NOTE_PATTERN, ""),
      payloadLengthRatio: number =
        claudePayloadLength(textWithoutNote) / Math.max(1, textWithoutNote.length),
      targetTextLength: number =
        textWithoutNote.length -
        Math.ceil(
          (excessLength + SELECTION_TRUNCATION_NOTE_RESERVE) / Math.max(1, payloadLengthRatio),
        ),
      truncatedText =
        targetTextLength > 0 ? truncateUtf16Safely(textWithoutNote, targetTextLength) : "";
    value =
      truncatedText.length > 0
        ? {
            ...payloadWithoutText,
            selectedText: truncatedText + selectionTruncationNote(truncatedText.length),
          }
        : payloadWithoutText;
  }
  return value;
}
function roomWithSendCapability(
  namespace: unknown,
): Editor.SessionSender | null {
  if (
    typeof getObjectProperty(namespace, SEND_TO_CLAUDE_METHOD) === "function"
  ) {
    return namespace as Editor.SessionSender;
  } else {
    return null;
  }
}
function resolveSessionRoute(
  routeOptions: Editor.SessionRouteOptions = {},
): Promise<Editor.SessionRoute | null> {
  return resolveClaudeSessionCapability(
    routeOptions,
    (sender: Editor.SessionSender, availability: unknown) =>
      chooseSessionRoute(sender, availability, routeOptions.confirm === true),
  );
}
function chooseSessionRoute(
  namespace: Editor.SessionSender,
  availability: unknown,
  confirmed: boolean,
): Editor.SessionRoute | null {
  if (availability === "available") {
    return {
      ns: namespace,
      road: "pane",
    };
  }
  if (availability === "available_if_summoned") {
    return {
      ns: namespace,
      road: "summon",
    };
  }
  if (availability === "available_if_opened") {
    return {
      ns: namespace,
      road: "open",
    };
  }
  if (availability === "available_if_confirmed" && confirmed) {
    return {
      ns: namespace,
      road: "confirm",
    };
  }
  return null;
}
async function resolveClaudeSessionCapability<T>(
  capabilityOptions: Editor.SessionRouteOptions,
  choose: (namespace: Editor.SessionSender, availability: unknown) => T,
): Promise<T | null> {
  try {
    let value = capabilityOptions.resolveRoom ?? resolveClaudeRoom,
      senderNamespace = roomWithSendCapability(await value());
    if (!senderNamespace) {
      return null;
    }
    let sendMethod = senderNamespace[CAN_SEND_TO_CLAUDE_METHOD];
    if (typeof sendMethod !== "function") {
      return null;
    }
    return choose(senderNamespace, await sendMethod.call(senderNamespace));
  } catch {
    return null;
  }
}
async function sendOrSuggestToClaude(
  request: Editor.SessionRequest,
  available: object | null,
  environment: unknown = globalThis,
  copy: (text: string) => Promise<boolean> = copyTextToClipboard,
): Promise<"staged" | "unanswered" | "sent" | "copied" | "failed"> {
  let value = await trySendToClaudeSession(
    request,
    available,
    (errorCode: unknown): boolean =>
      !(request.deliver === "send" && errorCode === "rate_limited"),
  );
  if (value !== null) {
    if (value === "started") {
      return "staged";
    } else {
      return value;
    }
  }
  return suggestPromptOrCopy(request.fallbackPrompt, environment, copy);
}
function callSendToClaude(
  namespace: object,
  payload: Editor.SessionPayload,
  request: Editor.SessionRequest,
): Promise<unknown> {
  if (request.deliver !== "send") {
    return (namespace as Editor.SessionSender)[SEND_TO_CLAUDE_METHOD](
      payload,
    );
  }
  if (!request.onStatus) {
    return (namespace as Editor.SessionSender)[SEND_TO_CLAUDE_METHOD](
      payload,
      {
        deliver: "send",
      },
    );
  }
  return (namespace as Editor.SessionSender)[SEND_TO_CLAUDE_METHOD](payload, {
    deliver: "send",
    onStatus: request.onStatus,
  });
}
function isClaudeSessionDestination(destination: unknown): boolean {
  let destinationType = getObjectProperty(destination, "to");
  return destinationType === "session" || destinationType === "new";
}
async function trySendToClaudeSession(
  request: Editor.SessionRequest,
  available: object | null,
  send: (code: unknown) => boolean,
): Promise<"started" | "staged" | "unanswered" | null> {
  let value = sanitizeClaudeRequest(request.request, Number.MAX_SAFE_INTEGER);
  if (available && value.length <= CLAUDE_REQUEST_MAX) {
    let sendPromise: Promise<unknown> | null = null;
    try {
      let selectionLabel = request.selection?.label?.trim(),
        selectionText = request.selection
          ? sanitizeClaudeRequest(
              request.selection.text,
              Number.MAX_SAFE_INTEGER,
            )
          : "",
        selectionNote =
          selectionText.length <= CLAUDE_SELECTION_TEXT_MAX
            ? selectionText
            : truncateUtf16Safely(
                selectionText,
                CLAUDE_SELECTION_TEXT_MAX,
              ) +
              selectionTruncationNote(
                truncateUtf16Safely(
                  selectionText,
                  CLAUDE_SELECTION_TEXT_MAX,
                ).length,
              ),
        payload = fitClaudePayload({
          ...(selectionLabel
            ? {
                label: sanitizeClaudeRequest(
                  selectionLabel,
                  CLAUDE_SELECTION_LABEL_MAX,
                ),
              }
            : {}),
          ...(selectionText.trim() !== ""
            ? {
                selectedText: selectionNote,
              }
            : {}),
          request: value,
        });
      sendPromise =
        selectionText.trim() === "" || payload.selectedText !== undefined
          ? callSendToClaude(available, payload, request)
          : null;
    } catch {
      sendPromise = null;
    }
    if (sendPromise) {
      try {
        let route = await withClaudeRequestTimeout(
          sendPromise,
          CLAUDE_SEND_TIMEOUT_MS,
        );
        if (
          request.deliver === "send" &&
          isClaudeSessionDestination(route)
        ) {
          return "started";
        } else {
          return "staged";
        }
      } catch (sendError) {
        if (
          sendError instanceof ClaudeRequestTimeoutError ||
          !send(getObjectProperty(sendError, "code"))
        ) {
          return "unanswered";
        }
      }
    }
  }
  return null;
}
async function suggestPromptOrCopy(
  prompt: string,
  environment: unknown = globalThis,
  copy: (text: string) => Promise<boolean> = copyTextToClipboard,
): Promise<"sent" | "copied" | "failed"> {
  let value = resolvePromptSuggestion(environment);
  if (value) {
    try {
      await value(prompt);
      return "sent";
    } catch {}
  }
  if (await copy(prompt)) {
    return "copied";
  } else {
    return "failed";
  }
}
function safeArtifactLabel(label: unknown): string {
  let labelText = String(label ?? "").replace(
    UNSAFE_ARTIFACT_LABEL_PATTERN,
    "?",
  );
  if (labelText.length <= 120) {
    return labelText;
  }
  let count = 120,
    codeUnit = labelText.charCodeAt(count - 1);
  if (codeUnit >= 55296 && codeUnit <= 56319) {
    count -= 1;
  }
  return labelText.slice(0, count) + "…";
}
async function resolveClaudeDeliveryContext(
  resolveSession: () => Promise<Editor.SessionRoute | null> = resolveSessionRoute,
  resolveOwnerChat: () =>
    | Promise<boolean | undefined>
    | boolean
    | undefined = isArtifactOwner,
): Promise<Application.ClaudeDeliveryContext> {
  try {
    let value = await resolveSession();
    if (value?.road === "pane") {
      return {
        sender: value.ns,
        ownerChat: null,
      };
    }
    return {
      sender: null,
      ownerChat:
        value?.road === "open" && (await resolveOwnerChat())
          ? value.ns
          : null,
    };
  } catch {
    return EMPTY_CLAUDE_DELIVERY_CONTEXT;
  }
}
function createClaudeDeliveryContextStore(
  resolveContext: () => Promise<Application.ClaudeDeliveryContext> = resolveClaudeDeliveryContext,
): Application.ClaudeDeliveryContextStore {
  let value = EMPTY_CLAUDE_DELIVERY_CONTEXT,
    index: number = 0,
    bestIndex = 0;
  return {
    current: () => value,
    refresh: (): void => {
      let candidateIndex = ++index;
      resolveContext().then((resolvedContext): void => {
        if (candidateIndex < bestIndex) {
          return;
        }
        bestIndex = candidateIndex;
        value = resolvedContext;
      });
    },
  };
}
async function resolveOwnerChatCapability(
  environment: Editor.ClaudeEnvironment = globalThis as Editor.ClaudeEnvironment,
): Promise<Editor.OwnerChatCapability | null> {
  // MineDesign: the host is globalThis.designSystemHost (packages/design-system/src/editor/design-system-host.ts), not globalThis.claude.
  let claude = environment.designSystemHost;
  try {
    if (typeof claude?.use === "function") {
      let value = await claude.use.call(claude, "comments");
      if (
        typeof value === "object" &&
        value !== null &&
        (value as Editor.OwnerChatCapability).available !== false
      ) {
        return value as Editor.OwnerChatCapability;
      } else {
        return null;
      }
    }
  } catch {
    return null;
  }
  if (typeof claude?.comments === "object" && claude.comments !== null) {
    return claude.comments;
  } else {
    return null;
  }
}
function chooseClaudeDeliveryRoad(
  request: Application.ClaudeRequest,
  deliveryContext: Application.ClaudeDeliveryContext,
  holdOwnerChat: boolean,
): Application.ClaudeDeliveryRoad {
  if (
    request.ownerChat !== true ||
    deliveryContext.sender !== null ||
    deliveryContext.ownerChat === null
  ) {
    return "sender";
  }
  if (holdOwnerChat) {
    return "held";
  } else {
    return "ownerChat";
  }
}
function deliverClaudeRequest(
  request: Application.ClaudeRequest,
  anchor: Element | null | undefined,
  deliveryContext: Application.ClaudeDeliveryContext,
  holdOwnerChat: boolean = false,
  environment?: Editor.ClaudeEnvironment,
  copy?: (text: string) => Promise<boolean>,
): Promise<Application.ClaudeDeliveryResult> {
  let value = chooseClaudeDeliveryRoad(request, deliveryContext, holdOwnerChat);
  if (value === "sender") {
    return deliverClaudePrompt(
      request,
      anchor,
      deliveryContext.sender,
      environment,
      copy,
    );
  }
  if (value === "held") {
    return deliverClaudePrompt(request, anchor, null, environment, copy).then(
      (source) =>
        source.kind === "suggested" ||
        source.kind === "copied" ||
        source.kind === "failed"
          ? {
              ...source,
              held: true,
            }
          : source,
    );
  }
  let { deliver: deliveryMode, ...requestWithoutMode } = request;
  return deliverClaudePrompt(
    requestWithoutMode,
    anchor,
    deliveryContext.ownerChat,
    environment,
    copy,
  );
}
async function deliverClaudePrompt(
  request: Application.ClaudeRequest,
  anchor: Element | null | undefined,
  sender: object | null = null,
  environment: Editor.ClaudeEnvironment = globalThis as Editor.ClaudeEnvironment,
  copy: (text: string) => Promise<boolean> = copyTextToClipboard,
): Promise<Application.ClaudeDeliveryResult> {
  let prompt = request.prompt;
  if (sender !== null) {
    let value = await sendOrSuggestToClaude(
      {
        selection:
          request.label === undefined
            ? null
            : {
                text: "",
                label: request.label,
              },
        request: request.request ?? prompt,
        fallbackPrompt: prompt,
        deliver: request.deliver,
      },
      sender,
      environment,
      copy,
    );
    return {
      kind: value === "sent" ? "suggested" : value,
    };
  }
  let ownerChat = await resolveOwnerChatCapability(environment);
  if (ownerChat !== null && typeof ownerChat.sendToClaude === "function") {
    try {
      if (
        (typeof ownerChat.canSendToClaude === "function"
          ? await ownerChat.canSendToClaude.call(ownerChat)
          : "available") === "available"
      ) {
        let value = anchor ?? environment.document?.body ?? null,
          promptSuggestion =
            typeof ownerChat.anchorFor === "function" && value !== null
              ? await ownerChat.anchorFor.call(ownerChat, value)
              : {
                  path: "body:nth-of-type(1)",
                  x: 0.5,
                  y: 0.5,
                },
          sendResult = await ownerChat.sendToClaude.call(ownerChat, {
            anchor: promptSuggestion,
            text: prompt,
          });
        return {
          kind: "sent",
          ...(typeof sendResult?.threadId === "string"
            ? {
                threadId: sendResult.threadId,
              }
            : {}),
        };
      }
    } catch {}
  }
  let fallbackOutcome = await suggestPromptOrCopy(prompt, environment, copy);
  return {
    kind: fallbackOutcome === "sent" ? "suggested" : fallbackOutcome,
  };
}
export {
  cachedClaudeRoom,
  callSendToClaude,
  CAN_SEND_TO_CLAUDE_METHOD,
  chooseClaudeDeliveryRoad,
  chooseSessionRoute,
  CLAUDE_PAYLOAD_MAX,
  CLAUDE_REQUEST_MAX,
  CLAUDE_SELECTION_LABEL_MAX,
  CLAUDE_SELECTION_TEXT_MAX,
  CLAUDE_SEND_TIMEOUT_MS,
  claudePayloadLength,
  ClaudeRequestTimeoutError,
  createClaudeDeliveryContextStore,
  deliverClaudePrompt,
  deliverClaudeRequest,
  EMPTY_CLAUDE_DELIVERY_CONTEXT,
  EMPTY_ROOM_PEERS,
  fitClaudePayload,
  getObjectProperty,
  isClaudeSessionDestination,
  normalizeRoomPeers,
  reactColorEditors,
  reactDesignSystemEditors,
  resolveClaudeDeliveryContext,
  resolveClaudeRoom,
  resolveClaudeSessionCapability,
  resolveOwnerChatCapability,
  resolvePromptSuggestion,
  resolveSessionRoute,
  roomApiOwner,
  roomApiPromise,
  roomPeerListenerStarted,
  roomPeers,
  roomPeerStore,
  roomPeerSubscribers,
  roomPeerUnsubscribe,
  roomWithSendCapability,
  safeArtifactLabel,
  sanitizeClaudeRequest,
  SELECTION_TRUNCATION_NOTE_PATTERN,
  SELECTION_TRUNCATION_NOTE_RESERVE,
  selectionTruncationNote,
  SEND_TO_CLAUDE_METHOD,
  sendOrSuggestToClaude,
  startRoomPeerListener,
  suggestPromptOrCopy,
  trySendToClaudeSession,
  UNSAFE_ARTIFACT_LABEL_PATTERN,
  UNSAFE_CLAUDE_REQUEST_CHARACTERS,
  withClaudeRequestTimeout,
};
export function installEditorClaudeDelivery(): () => void {
  return () => {
    reactDesignSystemEditors = toModuleNamespace(
      loadReactNamespace(),
      1,
    );
    reactColorEditors = toModuleNamespace(
      loadReactNamespace(),
      1,
    );
    EMPTY_ROOM_PEERS = Object.freeze([]);
    roomPeers = EMPTY_ROOM_PEERS;
    roomPeerSubscribers = new Set();
    roomPeerListenerStarted = false;
    roomPeerUnsubscribe = null;
    roomPeerStore = {
      getSnapshot: () => roomPeers,
      subscribe(subscriber: () => void) {
        roomPeerSubscribers.add(subscriber);
        startRoomPeerListener();
        return () => roomPeerSubscribers.delete(subscriber);
      },
    };
    SEND_TO_CLAUDE_METHOD = "sendToClaudeSession";
    CAN_SEND_TO_CLAUDE_METHOD = "canSendToClaudeSession";
    CLAUDE_SELECTION_TEXT_MAX = 1800;
    CLAUDE_SELECTION_LABEL_MAX = 120;
    CLAUDE_REQUEST_MAX = 2000;
    CLAUDE_PAYLOAD_MAX = 4000;
    CLAUDE_SEND_TIMEOUT_MS = 4000;
    ClaudeRequestTimeoutError = class ClaudeRequestTimeoutError extends (
      Error
    ) {};
    UNSAFE_CLAUDE_REQUEST_CHARACTERS =
      /[\u0000-\u0008\u000B-\u001F\u007F-\u009F\u2028\u2029\u00AD\u034F\u061C\u115F\u1160\u17B4\u17B5\u180B-\u180F\u200B\u200E\u200F\u202A-\u202E\u2060-\u206F\u2800\u3164\uFEFF\uFFA0\uFFF0-\uFFF8\uFFFD\u{16FE4}\u{1BCA0}-\u{1BCA3}\u{1D173}-\u{1D17A}\u{E0000}-\u{E00FF}\u{E01F0}-\u{E0FFF}]|(?![\u200C\u200D])\p{Cf}|\p{Co}|\p{Noncharacter_Code_Point}|[\uD800-\uDFFF]/gu;
    sanitizeClaudeRequest = (text: string, limit: number) =>
      truncateUtf16Safely(
        text.replace(UNSAFE_CLAUDE_REQUEST_CHARACTERS, ""),
        limit,
      );
    selectionTruncationNote = (length: number): string =>
      `
[selection truncated here at ` +
      String(length) +
      " characters]";
    SELECTION_TRUNCATION_NOTE_PATTERN =
      /\n\[selection truncated here at \d+ characters\]$/;
    SELECTION_TRUNCATION_NOTE_RESERVE = selectionTruncationNote(99999).length;
    claudePayloadLength = (payload: unknown) =>
      new TextEncoder().encode(JSON.stringify(payload)).length;
    UNSAFE_ARTIFACT_LABEL_PATTERN = new RegExp(
      `[<>"\r
\u2028\u2029]`,
      "g",
    );
    EMPTY_CLAUDE_DELIVERY_CONTEXT = {
      sender: null,
      ownerChat: null,
    };
  };
}
