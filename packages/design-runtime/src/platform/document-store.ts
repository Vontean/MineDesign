import { uiMessage } from '@minedesign/contracts/ui-messages';
/** Restored application module; prepare first, initialize in original order. */
import {
  type Dynamic,
} from "../runtime-types";
import { applyCommentOperations, filterEffectiveCommentOperations, maxDocumentComments, parseCommentOperations, parseDocumentComments } from "./comments";
import { createDatabaseDocumentStore, normalizeDocumentTitle, normalizeNewDocumentTitle } from "./database-document-store";
import { getDatabaseRuntimeSnapshot } from "./database-runtime";
import { compileArtifactDocument, maxCompiledDocumentBytes, readCompiledPageParts, readEmbeddedDocument, safeInlineJson } from "./document-compilation";
import { createDocumentStash, createReadOnlyStash, hashDocumentState, parseDocumentStash, readOnlyDocumentMessage } from "./document-stash";
import { recordEdit } from "./edit-count";
import { getAssetsCapability } from "./image-upload";
import { canRequestPublishCapability, getPublishCapability, hasCachedPublishCapability, normalizePublishError, publishAuthorizationErrorCodes, requirePublishCapability } from "./publish";
import { awaitCurrentUserCanEdit } from "./user-capabilities";

function normalizeDocumentSnapshot(
  rawSnapshot?: Dynamic,
  snapshotOptions?: Dynamic,
): Dynamic {
  let snapshot: Dynamic =
      typeof rawSnapshot == "object" && rawSnapshot !== null ? rawSnapshot : {},
    content: Dynamic;
  try {
    content = snapshotOptions.parseContent(snapshot.content);
  } catch {
    content = snapshotOptions.initialContent;
  }
  return {
    title:
      normalizeDocumentTitle(snapshot.title) ??
      snapshotOptions.defaultTitle ??
      "Appifact",
    content: content,
    comments: parseDocumentComments(snapshot.comments),
  };
}
function createDocumentStore(storeOptions?: Dynamic): Dynamic {
  let databaseSnapshot: Dynamic = getDatabaseRuntimeSnapshot();
  if (
    databaseSnapshot !== undefined &&
    storeOptions.publish === undefined &&
    storeOptions.canPublish === undefined &&
    storeOptions.embeddedState === undefined &&
    storeOptions.pageParts === undefined
  )
    return createDatabaseDocumentStore({
      runtime: databaseSnapshot.runtime,
      snapshot: databaseSnapshot.snapshot,
      parseContent: storeOptions.parseContent,
      ...(storeOptions.serializeContent !== undefined
        ? {
            serializeContent: storeOptions.serializeContent,
          }
        : {}),
      ...(storeOptions.contentHold !== undefined
        ? {
            contentHold: storeOptions.contentHold,
          }
        : {}),
      initialContent: storeOptions.initialContent,
      ...(storeOptions.defaultTitle !== undefined
        ? {
            defaultTitle: storeOptions.defaultTitle,
          }
        : {}),
    });
  let pageParts: Dynamic =
      storeOptions.pageParts ??
      readCompiledPageParts((globalThis as Dynamic).document),
    embeddedState: Dynamic =
      storeOptions.embeddedState !== undefined
        ? storeOptions.embeddedState
        : readEmbeddedDocument((globalThis as Dynamic).document),
    documentStash: Dynamic = storeOptions.stash ?? createDocumentStash(),
    readOnlyStash: Dynamic = storeOptions.roFlag ?? createReadOnlyStash(),
    canPublish: Dynamic =
      storeOptions.canPublish ?? canRequestPublishCapability(),
    baseState: Dynamic = normalizeDocumentSnapshot(embeddedState, storeOptions),
    embeddedStateHash: Dynamic = hashDocumentState(
      safeInlineJson(serializeState(baseState)),
    ),
    currentState: Dynamic = baseState,
    pendingCommentOperations: Dynamic = [],
    isDirty: Dynamic = false,
    restoreCount: Dynamic = 0,
    isSaving: Dynamic = false,
    saveErrorMessage: Dynamic,
    saveErrorCode: Dynamic,
    didSaveForReload: Dynamic = false,
    isReloading: Dynamic = false,
    contentHold: Dynamic = storeOptions.contentHold?.(embeddedState?.content),
    isReadOnly: Dynamic = contentHold !== undefined || !canPublish,
    didBootReadOnly: Dynamic = false,
    readOnlyMessage: Dynamic =
      contentHold ??
      (canPublish
        ? undefined
        : // MineDesign: the host global is designHost.
          "This view\u2019s runtime does not offer self-publish (window.designHost.self is absent) \u2014 content can be viewed but not saved from here.");
  if (!isReadOnly) {
    let stashedReadOnlyMessage: Dynamic = readOnlyStash.read();
    stashedReadOnlyMessage !== null &&
      stashedReadOnlyMessage.length > 0 &&
      ((isReadOnly = true), (readOnlyMessage = stashedReadOnlyMessage));
  }
  let isPublishingComments: Dynamic = false,
    commentErrorMessage: Dynamic,
    flag7: Dynamic = false,
    documentListeners: Dynamic = new Set(),
    saveListeners: Dynamic = new Set();
  function readSaveState(): Dynamic {
    if (isReadOnly)
      return didBootReadOnly
        ? {
            status: "readonly",
            message: readOnlyMessage,
            atBoot: true,
          }
        : {
            status: "readonly",
            message: readOnlyMessage,
          };
    let saveState: Dynamic = isSaving
      ? {
          status: "saving",
        }
      : saveErrorMessage !== undefined
        ? {
            status: "error",
            message: saveErrorMessage,
            ...(saveErrorCode !== undefined
              ? {
                  code: saveErrorCode,
                }
              : {}),
          }
        : {
            status: isDirty ? "dirty" : didSaveForReload ? "saved" : "ready",
          };
    return isReloading
      ? {
          ...saveState,
          reloading: true,
        }
      : saveState;
  }
  function readCommentSync(): Dynamic {
    let length: Dynamic = filterEffectiveCommentOperations(
      baseState.comments,
      pendingCommentOperations,
    ).length;
    return isReadOnly && length > 0
      ? {
          status: "blocked",
          pending: length,
          message: readOnlyMessage,
        }
      : commentErrorMessage !== undefined
        ? {
            status: "error",
            pending: length,
            message: commentErrorMessage,
          }
        : isPublishingComments || length > 0
          ? {
              status: "publishing",
              pending: length,
            }
          : {
              status: "idle",
              pending: 0,
            };
  }
  let shouldNotifyNewListener: Dynamic = false;
  function notifyNewListeners(): Dynamic {
    shouldNotifyNewListener && ((shouldNotifyNewListener = false), queueMicrotask((): Dynamic => notifyDocumentChanged()));
  }
  function notifyDocumentChanged(change?: Dynamic): Dynamic {
    documentListeners.size === 0 && (shouldNotifyNewListener = true);
    for (let listener of documentListeners as Dynamic) listener(change);
    notifySaveStateChanged();
  }
  function notifySaveStateChanged(): Dynamic {
    saveListeners.size === 0 && (shouldNotifyNewListener = true);
    let saveState: Dynamic = readSaveState();
    for (let listener of saveListeners as Dynamic) listener(saveState);
  }
  let didWriteStash: Dynamic = true,
    stashOffer: Dynamic,
    expectedEmbeddedHash: Dynamic;
  function writeStash(): Dynamic {
    let commentOperations: Dynamic = pendingCommentOperations,
      stateToStash: Dynamic = stashOffer ? stashOffer.state : currentState;
    didWriteStash = documentStash.write(
      JSON.stringify({
        v: 2,
        at: stashOffer ? stashOffer.at : Date.now(),
        state: stateToStash,
        ...(commentOperations.length > 0
          ? {
              ops: commentOperations,
            }
          : {}),
        ...(expectedEmbeddedHash !== undefined && !stashOffer
          ? {
              expectEmbed: expectedEmbeddedHash,
            }
          : {}),
      }),
    );
    return didWriteStash;
  }
  {
    let stashedDocument: Dynamic = parseDocumentStash(documentStash.read());
    if (stashedDocument) {
      let stashedState: Dynamic = normalizeDocumentSnapshot(
          stashedDocument.state,
          storeOptions,
        ),
        serializeStashedContent: Dynamic = (documentState?: Dynamic): Dynamic =>
          storeOptions.serializeContent !== undefined
            ? storeOptions.serializeContent(documentState.content, documentState.title)
            : documentState.content,
        effectiveCommentOperations: Dynamic = filterEffectiveCommentOperations(
          baseState.comments,
          parseCommentOperations(stashedDocument.ops),
        );
      if (effectiveCommentOperations.length === 0 && stashedDocument.ops === undefined) {
        let existingCommentIds: Dynamic = new Set(
          baseState.comments.map((comment?: Dynamic): Dynamic => comment.id),
        );
        effectiveCommentOperations = stashedState.comments
          .filter((comment?: Dynamic): Dynamic => !existingCommentIds.has(comment.id))
          .map(
            (comment?: Dynamic): Dynamic => ({
              op: "add",
              comment: comment,
            }),
          );
      }
      let matchesEmbeddedState: Dynamic =
        JSON.stringify({
          t: stashedState.title,
          c: serializeStashedContent(stashedState),
        }) ===
        JSON.stringify({
          t: baseState.title,
          c: serializeStashedContent(baseState),
        });
      pendingCommentOperations = effectiveCommentOperations;
      pendingCommentOperations.length > 0 &&
        (currentState = {
          ...currentState,
          comments: applyCommentOperations(
            baseState.comments,
            pendingCommentOperations,
          ),
        });
      matchesEmbeddedState
        ? pendingCommentOperations.length === 0
          ? documentStash.clear()
          : writeStash()
        : stashedDocument.expectEmbed === embeddedStateHash
          ? ((currentState = {
              title: stashedState.title,
              content: stashedState.content,
              comments: applyCommentOperations(
                baseState.comments,
                pendingCommentOperations,
              ),
            }),
            (isDirty = true),
            writeStash())
          : (stashOffer = {
              at: stashedDocument.at,
              state: stashedState,
            });
    }
  }
  function setPublishReadOnly(publishError?: Dynamic): Dynamic {
    isReadOnly = true;
    readOnlyMessage =
      publishError.code === "not_writer"
        ? readOnlyDocumentMessage
        : publishError.code === "consent_required"
          ? "Saving needs the self-publish permission this view declined (or has not answered). Reload and accept the prompt to edit."
          : "This view cannot save: " +
            publishError.message +
            " (" +
            publishError.code +
            ")";
    (publishError.code === "not_writer" ||
      publishError.code === "not_declared" ||
      publishError.code === "capability_disabled" ||
      publishError.code === "capability_removed") &&
      readOnlyStash.write(readOnlyMessage);
  }
  function applyLocalEdit(nextState?: Dynamic, isAutomatic: Dynamic = false): Dynamic {
    currentState = nextState;
    isDirty = true;
    didSaveForReload = false;
    saveErrorMessage = undefined;
    saveErrorCode = undefined;
    isAutomatic || ((stashOffer = undefined), recordEdit());
    writeStash();
    notifyDocumentChanged();
  }
  function refreshLocalComments(): Dynamic {
    currentState = {
      ...currentState,
      comments: applyCommentOperations(baseState.comments, pendingCommentOperations),
    };
    writeStash();
    notifyDocumentChanged();
  }
  function serializeState(documentState?: Dynamic): Dynamic {
    return storeOptions.serializeContent !== undefined
      ? {
          ...documentState,
          content: storeOptions.serializeContent(documentState.content, documentState.title),
        }
      : documentState;
  }
  function compilePage(documentState?: Dynamic): Dynamic {
    return compileArtifactDocument(
      {
        ...pageParts,
        title: documentState.title,
      },
      safeInlineJson(serializeState(documentState)),
    );
  }
  async function publishPage(
    html?: Dynamic,
    publishOptions?: Dynamic,
  ): Promise<Dynamic> {
    return (storeOptions.publish ?? requirePublishCapability())(
      html,
      publishOptions,
    );
  }
  let publishQueue: Dynamic = Promise.resolve();
  function enqueuePublish(operation?: Dynamic): Dynamic {
    let queuedPublish: Dynamic = publishQueue.then(operation, operation);
    publishQueue = queuedPublish.then(
      (): Dynamic => {},
      (): Dynamic => {},
    );
    return queuedPublish;
  }
  function publishComments(): Dynamic {
    if (
      isReadOnly ||
      isPublishingComments ||
      filterEffectiveCommentOperations(baseState.comments, pendingCommentOperations)
        .length === 0
    )
      return;
    isPublishingComments = true;
    commentErrorMessage = undefined;
    notifyDocumentChanged();
    let didPublishConflict: Dynamic = false;
    enqueuePublish(async (): Promise<Dynamic> => {
      try {
        let commentOperations: Dynamic = filterEffectiveCommentOperations(
          baseState.comments,
          pendingCommentOperations,
        );
        if (commentOperations.length === 0) return;
        let state: Dynamic = {
          title: baseState.title,
          content: baseState.content,
          comments: applyCommentOperations(
            baseState.comments,
            commentOperations,
          ),
        };
        if (
          JSON.stringify(state.comments) === JSON.stringify(baseState.comments)
        ) {
          let appliedOperations: Dynamic = new Set(commentOperations);
          pendingCommentOperations = pendingCommentOperations.filter(
            (operation?: Dynamic): Dynamic => !appliedOperations.has(operation),
          );
          currentState = {
            ...currentState,
            comments: applyCommentOperations(
              baseState.comments,
              pendingCommentOperations,
            ),
          };
          writeStash();
          return;
        }
        let compiledPage: Dynamic = compilePage(state);
        if (
          new TextEncoder().encode(compiledPage).length >
          maxCompiledDocumentBytes
        ) {
          commentErrorMessage =
            "The document is over the 16 MiB limit \u2014 the comment is kept locally but cannot publish until content shrinks.";
          return;
        }
        expectedEmbeddedHash = hashDocumentState(
          safeInlineJson(
            serializeState(
              normalizeDocumentSnapshot(
                JSON.parse(JSON.stringify(state)),
                storeOptions,
              ),
            ),
          ),
        );
        writeStash();
        if (isDirty && !didWriteStash) {
          expectedEmbeddedHash = undefined;
          commentErrorMessage =
            "Comment held: you have unsaved edits that could NOT be kept locally (this document is too large to stash), and posting the comment reloads the page. Save your edits first, then retry.";
          return;
        }
        try {
          await publishPage(compiledPage);
        } catch (firstPublishError: Dynamic) {
          if (
            normalizePublishError(firstPublishError).code !==
            "upstream_error"
          )
            throw firstPublishError;
          await new Promise(
            (resolve?: Dynamic): Dynamic =>
              setTimeout(resolve, 400 + Math.random() * 1200),
          );
          await publishPage(compiledPage);
        }
        baseState = state;
        pendingCommentOperations = filterEffectiveCommentOperations(
          baseState.comments,
          pendingCommentOperations,
        );
        currentState = {
          ...currentState,
          comments: applyCommentOperations(
            baseState.comments,
            pendingCommentOperations,
          ),
        };
        writeStash();
      } catch (publishError: Dynamic) {
        expectedEmbeddedHash = undefined;
        let publishFailure: Dynamic = normalizePublishError(publishError);
        publishFailure.code === "conflict"
          ? (didPublishConflict = true)
          : publishAuthorizationErrorCodes.includes(publishFailure.code)
            ? setPublishReadOnly(publishFailure)
            : publishFailure.code === "rate_limited"
              ? ((commentErrorMessage =
                  "Commenting too frequently \u2014 will retry in a moment."),
                setTimeout(
                  (): Dynamic => {
                    commentErrorMessage = undefined;
                    publishComments();
                  },
                  4e3 + Math.random() * 3e3,
                ))
              : (commentErrorMessage =
                  "Comment not published (" +
                  publishFailure.message +
                  ") \u2014 it is kept here; use retry to try again.");
        writeStash();
      } finally {
        isPublishingComments = false;
        notifyDocumentChanged();
        !didPublishConflict && commentErrorMessage === undefined && !isReadOnly && publishComments();
      }
    });
  }
  async function saveDocument(): Promise<Dynamic> {
    if (isReadOnly || isSaving || !isDirty) return;
    isSaving = true;
    saveErrorMessage = undefined;
    saveErrorCode = undefined;
    notifySaveStateChanged();
    let title: Dynamic = currentState.title,
      content: Dynamic = currentState.content;
    await enqueuePublish(async (): Promise<Dynamic> => {
      try {
        writeStash();
        let commentOperations: Dynamic = filterEffectiveCommentOperations(
            baseState.comments,
            pendingCommentOperations,
          ),
          state: Dynamic = {
            title: title,
            content: content,
            comments: applyCommentOperations(
              baseState.comments,
              commentOperations,
            ),
          },
          compiledPage: Dynamic =
            storeOptions.publishesPage === false && storeOptions.publish !== undefined
              ? ""
              : compilePage(state),
          length: Dynamic = new TextEncoder().encode(compiledPage).length;
        if (length > maxCompiledDocumentBytes) {
          saveErrorMessage =
            "The document is " +
            String(Math.round(length / 1024 / 1024)) +
            " MiB \u2014 over the 16 MiB limit. Remove or shrink images (the usual culprit) and save again.";
          return;
        }
        let publishOptions: Dynamic =
            storeOptions.publish !== undefined
              ? {
                  published: serializeState(state),
                  base: serializeState(baseState),
                }
              : undefined,
          publishResult: Dynamic;
        try {
          publishResult = await publishPage(compiledPage, publishOptions);
        } catch (firstPublishError: Dynamic) {
          if (
            normalizePublishError(firstPublishError).code !==
            "upstream_error"
          )
            throw firstPublishError;
          await new Promise(
            (resolve?: Dynamic): Dynamic =>
              setTimeout(resolve, 400 + Math.random() * 1200),
          );
          publishResult = await publishPage(compiledPage, publishOptions);
        }
        baseState = state;
        pendingCommentOperations = filterEffectiveCommentOperations(
          baseState.comments,
          pendingCommentOperations,
        );
        currentState = {
          ...currentState,
          comments: applyCommentOperations(
            baseState.comments,
            pendingCommentOperations,
          ),
        };
        publishResult?.reloads !== false && (isReloading = true);
        currentState.title === title && currentState.content === content
          ? ((isDirty = false),
            (didSaveForReload = publishResult?.reloads !== false),
            pendingCommentOperations.length === 0 && (commentErrorMessage = undefined),
            didSaveForReload || stashOffer || pendingCommentOperations.length > 0 ? writeStash() : documentStash.clear(),
            didSaveForReload || publishComments())
          : !didWriteStash &&
            publishResult?.reloads !== false &&
            (saveErrorMessage =
              "Saved \u2014 but you kept typing during the save, and those newer changes could NOT be kept locally (this document is too large to stash). Copy anything important now: the page is about to reload to the version without them.");
      } catch (publishError: Dynamic) {
        let publishFailure: Dynamic = normalizePublishError(publishError);
        saveErrorCode = publishFailure.code;
        publishFailure.code === "conflict"
          ? (saveErrorMessage = didWriteStash
              ? "Someone saved a newer version first \u2014 loading it now. Your changes are kept and will be offered for restore."
              : "Someone saved a newer version first \u2014 loading it now. Your changes could NOT be kept locally (this document is too large to stash), so copy anything important before the reload.")
          : publishAuthorizationErrorCodes.includes(publishFailure.code)
            ? setPublishReadOnly(publishFailure)
            : publishFailure.say !== undefined
              ? (saveErrorMessage = publishFailure.say)
              : publishFailure.code === "rate_limited"
                ? (saveErrorMessage =
                    "Not saved (" +
                    publishFailure.message +
                    "). Your changes are kept; give it a moment, then save again.")
                : publishFailure.code === "invalid_content" ||
                    publishFailure.code === "transform_error"
                  ? (saveErrorMessage =
                      "The store refused the document (" +
                      publishFailure.code +
                      ": " +
                      publishFailure.message +
                      "). This is usually a content problem \u2014 most often a pasted replacement character (U+FFFD, the question-mark-in-a-box glyph), which the platform rejects; find and remove the odd character, then save again. If the content looks clean, this is an appifact bug.")
                  : publishFailure.code === "too_large"
                    ? (saveErrorMessage =
                        "The store refused the document as too large (16 MiB limit). Remove or shrink images and save again.")
                    : (saveErrorMessage =
                        "Saving failed (" +
                        publishFailure.message +
                        "). Your changes are kept \u2014 try again.");
      } finally {
        isSaving = false;
        notifyDocumentChanged();
      }
    });
  }
  let shouldProbePublishCapability: Dynamic =
      storeOptions.canPublish === undefined &&
      (storeOptions.publish === undefined || storeOptions.publishWrapsFrame === true),
    publishCapabilityProbe: Dynamic =
      !isReadOnly && shouldProbePublishCapability && !hasCachedPublishCapability()
        ? getPublishCapability().then(
            (publishCapability?: Dynamic): Dynamic => {
              publishCapability !== null ||
                isReadOnly ||
                ((isReadOnly = true),
                (didBootReadOnly = !isDirty),
                (readOnlyMessage =
                  "This view can't save: no publish path is available here."),
                notifyDocumentChanged());
            },
          )
        : Promise.resolve();
  !isReadOnly &&
    shouldProbePublishCapability &&
    publishCapabilityProbe
      .then(
        (): Dynamic =>
          isReadOnly
            ? null
            : Promise.all([
                awaitCurrentUserCanEdit(),
                getAssetsCapability(),
              ]),
      )
      .then((capabilityChecks?: Dynamic): Dynamic => {
        capabilityChecks === null ||
          capabilityChecks[0] !== false ||
          capabilityChecks[1] !== null ||
          isReadOnly ||
          ((isReadOnly = true),
          (didBootReadOnly = !isDirty),
          (readOnlyMessage = readOnlyDocumentMessage),
          notifyDocumentChanged());
      });
  isReadOnly || queueMicrotask((): Dynamic => publishComments());
  return {
    saveMode: (): Dynamic => "manual",
    state: (): Dynamic => currentState,
    content: (): Dynamic => currentState.content,
    title: (): Dynamic => currentState.title,
    comments: (): Dynamic => currentState.comments,
    dirty: (): Dynamic => isDirty,
    readOnly: (): Dynamic => isReadOnly,
    saveState: readSaveState,
    commentSync: readCommentSync,
    setContent(nextContent: Dynamic): Dynamic {
      nextContent !== currentState.content &&
        applyLocalEdit({
          ...currentState,
          content: nextContent,
        });
    },
    updateContent(updateContent: Dynamic, updateOptions: Dynamic): Dynamic {
      let nextContent: Dynamic = updateContent(currentState.content);
      nextContent !== currentState.content &&
        applyLocalEdit(
          {
            ...currentState,
            content: nextContent,
          },
          updateOptions?.auto === true,
        );
    },
    adoptRemote(reconcileContent: Dynamic): Dynamic {
      let reconciled: Dynamic = reconcileContent(baseState.content, currentState.content);
      (reconciled.base === baseState.content &&
        reconciled.current === currentState.content) ||
        ((baseState = {
          ...baseState,
          content: reconciled.base,
        }),
        (currentState = {
          ...currentState,
          content: reconciled.current,
        }),
        isDirty &&
          !reconciled.dirty &&
          currentState.title === baseState.title &&
          ((isDirty = false), !stashOffer && pendingCommentOperations.length === 0 && documentStash.clear()),
        isDirty && writeStash(),
        notifyDocumentChanged({
          remote: true,
        }));
    },
    setTitle(requestedTitle: Dynamic): Dynamic {
      let nextTitle: Dynamic = normalizeNewDocumentTitle(requestedTitle);
      nextTitle.length === 0 ||
        nextTitle === currentState.title ||
        applyLocalEdit({
          ...currentState,
          title: nextTitle,
        });
    },
    addComment(commentDraft: Dynamic): Dynamic {
      if (currentState.comments.length >= maxDocumentComments) return;
      let comment: Dynamic = parseDocumentComments([
        {
          ...commentDraft,
          id: crypto.randomUUID().slice(0, 8),
          at: Date.now(),
        },
      ])[0];
      if (comment) {
        pendingCommentOperations = [
          ...pendingCommentOperations,
          {
            op: "add",
            comment: comment,
          },
        ];
        refreshLocalComments();
        publishComments();
        return comment;
      }
    },
    removeComment(commentId: Dynamic): Dynamic {
      (!pendingCommentOperations.some(
        (operation?: Dynamic): Dynamic =>
          operation.op === "add" && operation.comment.id === commentId,
      ) &&
        !baseState.comments.some(
          (comment?: Dynamic): Dynamic => comment.id === commentId,
        )) ||
        ((pendingCommentOperations = [
          ...pendingCommentOperations.filter(
            (operation?: Dynamic): Dynamic =>
              !(operation.op === "add" && operation.comment.id === commentId),
          ),
          {
            op: "remove",
            id: commentId,
          },
        ]),
        refreshLocalComments(),
        publishComments());
    },
    pendingCommentIds(): Dynamic {
      let pendingIds: Dynamic = new Set();
      for (let operation of filterEffectiveCommentOperations(
        baseState.comments,
        pendingCommentOperations,
      ) as Dynamic)
        operation.op === "add" && pendingIds.add(operation.comment.id);
      return pendingIds;
    },
    retryCommentPublish(): Dynamic {
      commentErrorMessage !== undefined && ((commentErrorMessage = undefined), publishComments());
    },
    documentBytes(): Dynamic {
      return new TextEncoder().encode(compilePage(currentState)).length;
    },
    save: saveDocument,
    stashOffer: (): Dynamic =>
      stashOffer
        ? {
            at: stashOffer.at,
          }
        : undefined,
    restoreStash(): Dynamic {
      if (!stashOffer) return;
      let recoveredStash: Dynamic = stashOffer,
        state: Dynamic = {
          title: currentState.title,
          content: currentState.content,
        };
      stashOffer = undefined;
      restoreCount += 1;
      applyLocalEdit({
        title: recoveredStash.state.title,
        content: recoveredStash.state.content,
        comments: applyCommentOperations(baseState.comments, pendingCommentOperations),
      });
      return {
        get label() { return uiMessage("canvas.documentStore.restoreUnsavedChanges"); },
        do(): Dynamic {
          stashOffer = undefined;
          applyLocalEdit({
            title: recoveredStash.state.title,
            content: recoveredStash.state.content,
            comments: applyCommentOperations(
              baseState.comments,
              pendingCommentOperations,
            ),
          });
        },
        undo(): Dynamic {
          stashOffer = recoveredStash;
          applyLocalEdit(
            {
              title: state.title,
              content: state.content,
              comments: applyCommentOperations(
                baseState.comments,
                pendingCommentOperations,
              ),
            },
            true,
          );
          recordEdit();
        },
      };
    },
    restoreCount: (): Dynamic => restoreCount,
    discardStash(): Dynamic {
      stashOffer &&
        ((stashOffer = undefined),
        pendingCommentOperations.length === 0 ? documentStash.clear() : writeStash(),
        notifyDocumentChanged());
    },
    subscribe(listener: Dynamic): Dynamic {
      documentListeners.add(listener);
      notifyNewListeners();
      return (): Dynamic => documentListeners.delete(listener);
    },
    subscribeSave(listener: Dynamic): Dynamic {
      saveListeners.add(listener);
      notifyNewListeners();
      return (): Dynamic => saveListeners.delete(listener);
    },
  };
}
export {
  createDocumentStore,
  normalizeDocumentSnapshot,
};
export function installPlatformDocumentStore(): () => void {
  return () => {};
}
