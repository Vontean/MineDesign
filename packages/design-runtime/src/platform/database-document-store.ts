import { uiMessage } from '@minedesign/contracts/ui-messages';
/** Restored application module; prepare first, initialize in original order. */
import {
  type Dynamic,
} from "../runtime-types";
import { maxDocumentComments, parseDocumentComments, truncateUtf16Safely } from "./comments";
import { recordEdit } from "./edit-count";

var PlatformDatabaseDocumentStoreConstant: Dynamic;
function normalizeDocumentTitle(items?: Dynamic): Dynamic {
  return typeof items == "string" && items.length > 0
    ? truncateUtf16Safely(
        items,
        PlatformDatabaseDocumentStoreConstant,
      )
    : undefined;
}
function normalizeNewDocumentTitle(title?: Dynamic): Dynamic {
  return truncateUtf16Safely(
    title.trim(),
    PlatformDatabaseDocumentStoreConstant,
  );
}
function createDatabaseDocumentStore(storeOptions?: Dynamic): Dynamic {
  let databaseRuntime: Dynamic = storeOptions.runtime;
  function parseContentWithFallback(rawContent?: Dynamic): Dynamic {
    try {
      return storeOptions.parseContent(rawContent);
    } catch {
      return storeOptions.initialContent;
    }
  }
  let defaultTitle: Dynamic = storeOptions.defaultTitle ?? "Untitled",
    documentState: Dynamic = {
      title: normalizeDocumentTitle(storeOptions.snapshot.title) ?? defaultTitle,
      content: parseContentWithFallback(storeOptions.snapshot.content),
      comments: parseDocumentComments(storeOptions.snapshot.comments),
    },
    isReadOnly: Dynamic = databaseRuntime.saving.status === "readonly",
    contentHoldReason: Dynamic = storeOptions.contentHold?.(storeOptions.snapshot.content),
    saveErrorMessage: Dynamic =
      databaseRuntime.saving.status === "error"
        ? (databaseRuntime.saving.lastError?.message ??
          "Autosave failed \u2014 retrying.")
        : undefined,
    isSaving: Dynamic = databaseRuntime.saving.status === "saving",
    pendingCommentIds: Dynamic = new Set(),
    documentListeners: Dynamic = new Set(),
    saveStateListeners: Dynamic = new Set();
  function getSaveState(): Dynamic {
    return contentHoldReason !== undefined
      ? {
          status: "readonly",
          message: contentHoldReason,
        }
      : isReadOnly
        ? {
            status: "readonly",
            get message() { return uiMessage("canvas.databaseDocumentStore.thisViewCannotEditTheDocument"); },
          }
        : saveErrorMessage !== undefined
          ? {
              status: "error",
              message: saveErrorMessage,
            }
          : isSaving || databaseRuntime.saving.pending > 0
            ? {
                status: "saving",
              }
            : {
                status: "ready",
              };
  }
  function notifyListeners(): Dynamic {
    for (let listener of [...documentListeners] as Dynamic) listener();
    let saveState: Dynamic = getSaveState();
    for (let listener of [...saveStateListeners] as Dynamic) listener(saveState);
  }
  databaseRuntime.saving.onStatus((status?: Dynamic, saveError?: Dynamic): Dynamic => {
    isSaving = status === "saving";
    status === "readonly" && (isReadOnly = true);
    status === "error"
      ? (saveErrorMessage = saveError?.message ?? "Autosave failed \u2014 retrying.")
      : (status === "idle" || status === "readonly") && (saveErrorMessage = undefined);
    status === "idle" && pendingCommentIds.clear();
    notifyListeners();
  });
  databaseRuntime.doc.observe("", (changes?: Dynamic): Dynamic => {
    let didChange: Dynamic = false;
    for (let change of changes as Dynamic)
      change.origin !== "local" &&
        (change.key === "title"
          ? ((documentState.title = normalizeDocumentTitle(change.value) ?? defaultTitle),
            (didChange = true))
          : change.key === "content"
            ? ((documentState.content = parseContentWithFallback(change.value)),
              (contentHoldReason = storeOptions.contentHold?.(change.value)),
              (didChange = true))
            : change.key === "comments" &&
              ((documentState.comments = parseDocumentComments(
                change.value,
              )),
              (didChange = true)));
    didChange && notifyListeners();
  });
  let serializeContent: Dynamic = (content?: Dynamic): Dynamic =>
    storeOptions.serializeContent !== undefined
      ? storeOptions.serializeContent(content, documentState.title)
      : content;
  function saveField(key?: Dynamic, fieldValue?: Dynamic): Dynamic {
    databaseRuntime.doc.set(key, fieldValue).catch((): Dynamic => {
      saveErrorMessage = "Autosave failed \u2014 the change may not be stored.";
      notifyListeners();
    });
  }
  return {
    saveMode: (): Dynamic => "auto",
    title: (): Dynamic => documentState.title,
    setTitle: (nextTitle?: Dynamic): Dynamic => {
      if (contentHoldReason !== undefined) return;
      let normalizedTitle: Dynamic = normalizeNewDocumentTitle(nextTitle);
      normalizedTitle.length === 0 ||
        normalizedTitle === documentState.title ||
        ((documentState.title = normalizedTitle),
        saveField("title", normalizedTitle),
        storeOptions.serializeContent !== undefined &&
          saveField("content", serializeContent(documentState.content)),
        recordEdit(),
        notifyListeners());
    },
    content: (): Dynamic => documentState.content,
    setContent: (nextContent?: Dynamic): Dynamic => {
      contentHoldReason !== undefined ||
        nextContent === documentState.content ||
        ((documentState.content = nextContent),
        saveField("content", serializeContent(nextContent)),
        recordEdit(),
        notifyListeners());
    },
    updateContent: (updateContent?: Dynamic, updateOptions?: Dynamic): Dynamic => {
      if (contentHoldReason !== undefined) return;
      let nextContent: Dynamic = updateContent(documentState.content);
      nextContent !== documentState.content &&
        ((documentState.content = nextContent),
        saveField("content", serializeContent(nextContent)),
        updateOptions?.auto !== true && recordEdit(),
        notifyListeners());
    },
    state: (): Dynamic => documentState,
    comments: (): Dynamic => documentState.comments,
    addComment: (commentDraft?: Dynamic): Dynamic => {
      if (documentState.comments.length >= maxDocumentComments) return;
      let comment: Dynamic = parseDocumentComments([
        {
          ...commentDraft,
          id: crypto.randomUUID().slice(0, 8),
          at: Date.now(),
        },
      ])[0];
      if (comment) {
        documentState.comments = [...documentState.comments, comment];
        pendingCommentIds.add(comment.id);
        saveField("comments", documentState.comments);
        notifyListeners();
        return comment;
      }
    },
    removeComment: (commentId?: Dynamic): Dynamic => {
      let remainingComments: Dynamic = documentState.comments.filter(
        (comment?: Dynamic): Dynamic => comment.id !== commentId,
      );
      remainingComments.length !== documentState.comments.length &&
        ((documentState.comments = remainingComments),
        pendingCommentIds.delete(commentId),
        saveField("comments", documentState.comments),
        notifyListeners());
    },
    commentSync: (): Dynamic => {
      let size: Dynamic = pendingCommentIds.size;
      return isReadOnly && size > 0
        ? {
            status: "blocked",
            pending: size,
            get message() { return uiMessage("canvas.databaseDocumentStore.thisViewCannotEditTheDocument"); },
          }
        : saveErrorMessage !== undefined && size > 0
          ? {
              status: "error",
              pending: size,
              message: saveErrorMessage,
            }
          : size > 0
            ? {
                status: "publishing",
                pending: size,
              }
            : {
                status: "idle",
                pending: 0,
              };
    },
    pendingCommentIds: (): Dynamic => new Set(pendingCommentIds),
    retryCommentPublish: (): Dynamic => {
      databaseRuntime.saving.save().catch((): Dynamic => {});
    },
    dirty: (): Dynamic => false,
    readOnly: (): Dynamic => isReadOnly || contentHoldReason !== undefined,
    saveState: getSaveState,
    documentBytes: (): Dynamic =>
      new TextEncoder().encode(JSON.stringify(documentState)).length,
    save: async (): Promise<Dynamic> => {
      isReadOnly ||
        (await databaseRuntime.saving.save().catch((): Dynamic => {}), notifyListeners());
    },
    stashOffer: (): Dynamic => {},
    restoreStash: (): Dynamic => {},
    discardStash: (): Dynamic => {},
    restoreCount: (): Dynamic => 0,
    subscribe: (listener?: Dynamic): Dynamic => (
      documentListeners.add(listener),
      (): Dynamic => documentListeners.delete(listener)
    ),
    subscribeSave: (listener?: Dynamic): Dynamic => (
      saveStateListeners.add(listener),
      (): Dynamic => saveStateListeners.delete(listener)
    ),
  };
}
export {
  createDatabaseDocumentStore,
  normalizeDocumentTitle,
  normalizeNewDocumentTitle,
  PlatformDatabaseDocumentStoreConstant,
};
export function installPlatformDatabaseDocumentStore(): () => void {
  return () => {
    PlatformDatabaseDocumentStoreConstant = 200;
  };
}
