import { uiMessage } from '@minedesign/contracts/ui-messages';
import type * as Host from "../contracts/platform-host";
import type * as React from "react";
/** Restored application module; prepare first, initialize in original order. */
import { recordArtifactEdit } from "../host/artifact-edit-count";
import { MAX_ARTIFACT_COMMENTS, normalizeComments } from "../host/claude-session";
import { truncateUtf16Safely } from "../platform/compiled-page";

var RAIL_THUMB_RESIZE_SETTLE_MS: number;
var activeArtifactDocument: Host.ActiveArtifactRuntime | undefined;
function normalizeArtifactTitle(title: unknown): string | undefined {
  if (typeof title === "string" && title.length > 0) {
    return truncateUtf16Safely(
      title,
      RAIL_THUMB_RESIZE_SETTLE_MS,
    );
  } else {
    return undefined;
  }
}
function normalizeTitleInput(title: string): string {
  return truncateUtf16Safely(
    title.trim(),
    RAIL_THUMB_RESIZE_SETTLE_MS,
  );
}
function createRuntimeArtifactDocument<Content>(
  documentOptions: Host.RuntimeDocumentOptions<Content>,
): Host.ArtifactDocument<Content> {
  let runtime = documentOptions.runtime;
  function parseContent(serializedContent: unknown): Content {
    try {
      return documentOptions.parseContent(serializedContent);
    } catch {
      return documentOptions.initialContent;
    }
  }
  let defaultTitle = documentOptions.defaultTitle ?? "Untitled",
    snapshot = {
      title: normalizeArtifactTitle(documentOptions.snapshot.title) ?? defaultTitle,
      content: parseContent(documentOptions.snapshot.content),
      comments: normalizeComments(documentOptions.snapshot.comments),
    },
    readOnly: boolean = runtime.saving.status === "readonly",
    contentHoldReason = documentOptions.contentHold?.(documentOptions.snapshot.content),
    saveError =
      runtime.saving.status === "error"
        ? (runtime.saving.lastError?.message ??
          "Autosave failed — retrying.")
        : undefined,
    saving: boolean = runtime.saving.status === "saving",
    pendingCommentIds = new Set<string>(),
    documentSubscribers = new Set<(event?: { remote: boolean }) => void>(),
    saveSubscribers = new Set<(state: Host.SaveState) => void>();
  function getSaveState(): Host.SaveState {
    if (contentHoldReason !== undefined) {
      return {
        status: "readonly",
        message: contentHoldReason,
      };
    }
    if (readOnly) {
      return {
        status: "readonly",
        get message() { return uiMessage("design-system.artifactDocument.thisViewCannotEditTheDocument"); },
      };
    }
    if (saveError !== undefined) {
      return {
        status: "error",
        message: saveError,
      };
    }
    if (saving || runtime.saving.pending > 0) {
      return {
        status: "saving",
      };
    }
    return {
      status: "ready",
    };
  }
  function notifySubscribers(): void {
    for (let subscriber of [...documentSubscribers]) {
      subscriber();
    }
    let value = getSaveState();
    for (let subscriber of [...saveSubscribers]) {
      subscriber(value);
    }
  }
  runtime.saving.onStatus((status, statusError): void => {
    saving = status === "saving";
    if (status === "readonly") {
      readOnly = true;
    }
    if (status === "error") {
      saveError = statusError?.message ?? "Autosave failed — retrying.";
    } else if (status === "idle" || status === "readonly") {
      saveError = undefined;
    }
    if (status === "idle") {
      pendingCommentIds.clear();
    }
    notifySubscribers();
  });
  runtime.doc.observe("", (changes): void => {
    let flag: boolean = false;
    for (let value of changes) {
      if (value.origin === "local") {
        continue;
      }
      if (value.key === "title") {
        snapshot.title = normalizeArtifactTitle(value.value) ?? defaultTitle;
        flag = true;
      } else if (value.key === "content") {
        snapshot.content = parseContent(value.value);
        contentHoldReason = documentOptions.contentHold?.(value.value);
        flag = true;
      } else if (value.key === "comments") {
        snapshot.comments = normalizeComments(value.value);
        flag = true;
      }
    }
    if (flag) {
      notifySubscribers();
    }
  });
  let serializeContent = (content: Content): unknown =>
    documentOptions.serializeContent !== undefined
      ? documentOptions.serializeContent(content, snapshot.title)
      : content;
  function setRuntimeField(field: string, fieldValue: unknown): void {
    runtime.doc.set(field, fieldValue).catch((): void => {
      saveError = "Autosave failed — the change may not be stored.";
      notifySubscribers();
    });
  }
  return {
    saveMode: (): "auto" => "auto",
    title: () => snapshot.title,
    setTitle: (title): void => {
      if (contentHoldReason !== undefined) {
        return;
      }
      let value = normalizeTitleInput(title);
      if (value.length === 0 || value === snapshot.title) {
        return;
      }
      snapshot.title = value;
      setRuntimeField("title", value);
      if (documentOptions.serializeContent !== undefined) {
        setRuntimeField("content", serializeContent(snapshot.content));
      }
      recordArtifactEdit();
      notifySubscribers();
    },
    content: () => snapshot.content,
    setContent: (content): void => {
      if (contentHoldReason !== undefined || content === snapshot.content) {
        return;
      }
      snapshot.content = content;
      setRuntimeField("content", serializeContent(content));
      recordArtifactEdit();
      notifySubscribers();
    },
    updateContent: (updater, updateOptions): void => {
      if (contentHoldReason !== undefined) {
        return;
      }
      let value = updater(snapshot.content);
      if (value === snapshot.content) {
        return;
      }
      snapshot.content = value;
      setRuntimeField("content", serializeContent(value));
      if (updateOptions?.auto !== true) {
        recordArtifactEdit();
      }
      notifySubscribers();
    },
    state: () => snapshot,
    comments: () => snapshot.comments,
    addComment: (comment) => {
      if (snapshot.comments.length >= MAX_ARTIFACT_COMMENTS) {
        return;
      }
      let value = normalizeComments([
        {
          ...comment,
          id: crypto.randomUUID().slice(0, 8),
          at: Date.now(),
        },
      ])[0];
      if (!value) {
        return;
      }
      snapshot.comments = [...snapshot.comments, value];
      pendingCommentIds.add(value.id);
      setRuntimeField("comments", snapshot.comments);
      notifySubscribers();
      return value;
    },
    removeComment: (commentId): void => {
      let value = snapshot.comments.filter(
        (comment: Host.ArtifactComment): boolean => comment.id !== commentId,
      );
      if (value.length === snapshot.comments.length) {
        return;
      }
      snapshot.comments = value;
      pendingCommentIds.delete(commentId);
      setRuntimeField("comments", snapshot.comments);
      notifySubscribers();
    },
    commentSync: () => {
      let size = pendingCommentIds.size;
      if (readOnly && size > 0) {
        return {
          status: "blocked",
          pending: size,
          get message() { return uiMessage("design-system.artifactDocument.thisViewCannotEditTheDocument"); },
        };
      }
      if (saveError !== undefined && size > 0) {
        return {
          status: "error",
          pending: size,
          message: saveError,
        };
      }
      if (size > 0) {
        return {
          status: "publishing",
          pending: size,
        };
      }
      return {
        status: "idle",
        pending: 0,
      };
    },
    pendingCommentIds: () => new Set(pendingCommentIds),
    retryCommentPublish: (): void => {
      runtime.saving.save().catch((): void => {});
    },
    dirty: (): boolean => false,
    readOnly: () => readOnly || contentHoldReason !== undefined,
    saveState: getSaveState,
    documentBytes: () =>
      new TextEncoder().encode(JSON.stringify(snapshot)).length,
    save: async (): Promise<void> => {
      if (readOnly) {
        return;
      }
      await runtime.saving.save().catch((): void => {});
      notifySubscribers();
    },
    stashOffer: (): undefined => {
      return;
    },
    restoreStash: (): undefined => {
      return;
    },
    discardStash: (): void => {
      return;
    },
    restoreCount: (): number => 0,
    subscribe: (subscriber) => {
      documentSubscribers.add(subscriber);
      return () => documentSubscribers.delete(subscriber);
    },
    subscribeSave: (subscriber) => {
      saveSubscribers.add(subscriber);
      return () => saveSubscribers.delete(subscriber);
    },
  };
}
function setAutoSavingArtifactRuntime(
  runtime: Host.ActiveArtifactRuntime | undefined,
): void {
  activeArtifactDocument = runtime;
}
function getAutoSavingArtifactRuntime():
  | Host.ActiveArtifactRuntime
  | undefined {
  return activeArtifactDocument;
}
async function detectAutoSavingArtifactRuntime(): Promise<void> {
  if (typeof window === "undefined") {
    return;
  }
  let value: Host.ProtocolGlobal = window;
  if (value.appifact === undefined) {
    return;
  }
  try {
    let runtime = await value.appifact.ready();
    if (runtime.saving.mode !== "auto") {
      return;
    }
    let snapshot = await runtime.doc.getAll();
    setAutoSavingArtifactRuntime({
      runtime: runtime,
      snapshot: snapshot,
    });
  } catch (error: unknown) {
    console.error(
      "appifact runtime probe failed — booting the frame model",
      error,
    );
  }
}
export {
  activeArtifactDocument,
  createRuntimeArtifactDocument,
  detectAutoSavingArtifactRuntime,
  getAutoSavingArtifactRuntime,
  normalizeArtifactTitle,
  normalizeTitleInput,
  RAIL_THUMB_RESIZE_SETTLE_MS,
  setAutoSavingArtifactRuntime,
};
export function installDocumentsArtifactDocument(): () => void {
  return () => {
    RAIL_THUMB_RESIZE_SETTLE_MS = 200;
  };
}
