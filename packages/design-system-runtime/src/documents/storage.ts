import { uiMessage } from '@minedesign/contracts/ui-messages';
import type * as Host from "../contracts/platform-host";
import type * as React from "react";
/** Restored application module; prepare first, initialize in original order. */
import { createRuntimeArtifactDocument, getAutoSavingArtifactRuntime, normalizeArtifactTitle, normalizeTitleInput } from "./artifact-document";
import { createSelfPublisher, getSelfPublishCapability, normalizeSelfPublishError, SELF_PUBLISH_PERMISSION_ERROR_CODES, selfPublishAvailable, selfPublishInstalled } from "./self-publish";
import { normalizeArtifactSessionPath, recordArtifactEdit } from "../host/artifact-edit-count";
import { applicableCommentOperations, applyCommentOperations, MAX_ARTIFACT_COMMENTS, normalizeCommentOperations, normalizeComments } from "../host/claude-session";
import { currentUserCanEditAsync } from "../host/user-api";
import { getAssetsCapability } from "../media/assets";
import { assembleCompiledPage, compiledPageMaxBytes, readCompiledPageAnatomy, readCompiledPageDocument, stringifyInlineJson } from "../platform/compiled-page";

var READ_ONLY_ARTIFACT_MESSAGE: string;
var ARTIFACT_STASH_PREFIX: string;
var ARTIFACT_READ_ONLY_PREFIX: string;
function artifactStashKey(sessionPath: string): string {
  return (
    ARTIFACT_STASH_PREFIX + normalizeArtifactSessionPath(sessionPath)
  );
}
function createSessionStorageSlot(key: string): Host.StorageSlot {
  return {
    read() {
      try {
        return sessionStorage.getItem(key);
      } catch {
        return null;
      }
    },
    write(serializedValue): boolean {
      try {
        sessionStorage.setItem(key, serializedValue);
        return true;
      } catch {
        return false;
      }
    },
    clear(): void {
      try {
        sessionStorage.removeItem(key);
      } catch {}
    },
  };
}
function currentArtifactStash(): Host.StorageSlot {
  return createSessionStorageSlot(artifactStashKey(location.pathname));
}
function createArtifactLocalFlag(flagName: string): Host.StorageSlot {
  if (typeof location === "undefined") {
    return {
      read: (): null => null,
      write: (): boolean => false,
      clear: (): void => {
        return;
      },
    };
  }
  return createSessionStorageSlot(
    "appifact-" +
      flagName +
      "/" +
      normalizeArtifactSessionPath(location.pathname),
  );
}
function readCurrentArtifactReadOnlyReason(): string | null {
  let value = currentArtifactReadOnlySlot().read();
  if (value !== null && value.length > 0) {
    return value;
  } else {
    return null;
  }
}
function currentArtifactReadOnlySlot(): Host.StorageSlot {
  if (typeof location === "undefined") {
    return {
      read: (): null => null,
      write: (): boolean => false,
      clear: (): void => {
        return;
      },
    };
  }
  return createSessionStorageSlot(
    ARTIFACT_READ_ONLY_PREFIX +
      artifactStashKey(location.pathname).slice(ARTIFACT_STASH_PREFIX.length),
  );
}
function hashArtifactState(text: string): string {
  let firstHash: number = 3735928559,
    secondHash: number = 1103547991;
  for (let index: number = 0; index < text.length; index++) {
    let value = text.charCodeAt(index);
    firstHash = Math.imul(firstHash ^ value, 2654435761);
    secondHash = Math.imul(secondHash ^ value, 1597334677);
  }
  firstHash =
    Math.imul(firstHash ^ (firstHash >>> 16), 2246822507) ^
    Math.imul(secondHash ^ (secondHash >>> 13), 3266489909);
  secondHash =
    Math.imul(secondHash ^ (secondHash >>> 16), 2246822507) ^
    Math.imul(firstHash ^ (firstHash >>> 13), 3266489909);
  return (
    (secondHash >>> 0).toString(16).padStart(8, "0") +
    (firstHash >>> 0).toString(16).padStart(8, "0")
  );
}
function parseArtifactStash(
  text: string | null,
): Host.ParsedStash | undefined {
  if (text === null) {
    return;
  }
  try {
    let value = JSON.parse(text) as Record<string, unknown> | null;
    if (
      typeof value === "object" &&
      value !== null &&
      (value.v === 2 || value.v === 1) &&
      typeof value.at === "number" &&
      "state" in value
    ) {
      let stashRecord = value;
      return {
        at: stashRecord.at as number,
        state: stashRecord.state,
        ops: stashRecord.ops,
        expectEmbed:
          typeof stashRecord.expectEmbed === "string"
            ? stashRecord.expectEmbed
            : undefined,
      };
    }
  } catch {}
  return;
}
function parseEmbeddedArtifactState<Content>(
  state: unknown,
  parser: Host.ArtifactParser<Content>,
): Host.ArtifactEnvelope<Content> {
  let record =
      typeof state === "object" && state !== null
        ? (state as Record<string, unknown>)
        : {},
    content: Content;
  try {
    content = parser.parseContent(record.content);
  } catch {
    content = parser.initialContent;
  }
  return {
    title:
      normalizeArtifactTitle(record.title) ??
      parser.defaultTitle ??
      "Appifact",
    content: content,
    comments: normalizeComments(record.comments),
  };
}
function createArtifactDocument<Content>(
  documentOptions: Host.DocumentOptions<Content>,
): Host.ArtifactDocument<Content> {
  let autoSaveRuntime = getAutoSavingArtifactRuntime();
  if (
    autoSaveRuntime !== undefined &&
    documentOptions.publish === undefined &&
    documentOptions.canPublish === undefined &&
    documentOptions.embeddedState === undefined &&
    documentOptions.pageParts === undefined
  ) {
    return createRuntimeArtifactDocument({
      runtime: autoSaveRuntime.runtime,
      snapshot: autoSaveRuntime.snapshot,
      parseContent: documentOptions.parseContent,
      ...(documentOptions.serializeContent !== undefined
        ? {
            serializeContent: documentOptions.serializeContent,
          }
        : {}),
      ...(documentOptions.contentHold !== undefined
        ? {
            contentHold: documentOptions.contentHold,
          }
        : {}),
      initialContent: documentOptions.initialContent,
      ...(documentOptions.defaultTitle !== undefined
        ? {
            defaultTitle: documentOptions.defaultTitle,
          }
        : {}),
    });
  }
  let pageParts =
      documentOptions.pageParts ??
      readCompiledPageAnatomy(
        (globalThis as typeof globalThis & { document: Document }).document,
      ),
    embeddedState =
      documentOptions.embeddedState !== undefined
        ? documentOptions.embeddedState
        : readCompiledPageDocument(
            (globalThis as typeof globalThis & { document: Document })
              .document,
          ),
    stash = documentOptions.stash ?? currentArtifactStash(),
    readOnlyFlag = documentOptions.roFlag ?? currentArtifactReadOnlySlot(),
    canPublish = documentOptions.canPublish ?? selfPublishAvailable(),
    publishedState = parseEmbeddedArtifactState(embeddedState, documentOptions),
    embeddedStateHash = hashArtifactState(
      stringifyInlineJson(serializeEnvelope(publishedState)),
    ),
    localState = publishedState,
    pendingCommentOperations: Host.CommentOperation[] = [],
    dirty: boolean = false,
    restoreCount = 0,
    saving: boolean = false,
    saveError: string | undefined,
    saveErrorCode: string | undefined,
    hasSaved: boolean = false,
    reloading: boolean = false,
    contentHoldReason = documentOptions.contentHold?.(
      (embeddedState as { content?: unknown } | undefined)?.content,
    ),
    readOnly = contentHoldReason !== undefined || !canPublish,
    readOnlyAtBoot: boolean = false,
    readOnlyReason =
      contentHoldReason ??
      (canPublish
        ? undefined
        : // MineDesign: the host global is designSystemHost, not claude.
          "This view’s runtime does not offer self-publish (window." +
          "designSystemHost.self is absent) — content can be viewed but not saved " +
          "from here.");
  if (!readOnly) {
    let value = readOnlyFlag.read();
    if (value !== null && value.length > 0) {
      readOnly = true;
      readOnlyReason = value;
    }
  }
  let publishingComments: boolean = false,
    commentPublishError: string | undefined,
    flag: boolean = false,
    documentSubscribers = new Set<(event?: { remote: boolean }) => void>(),
    saveSubscribers = new Set<(state: Host.SaveState) => void>();
  function getSaveState(): Host.SaveState {
    if (readOnly) {
      if (readOnlyAtBoot) {
        return {
          status: "readonly",
          message: readOnlyReason,
          atBoot: true,
        };
      } else {
        return {
          status: "readonly",
          message: readOnlyReason,
        };
      }
    }
    let value: Host.SaveState = saving
      ? {
          status: "saving",
        }
      : saveError !== undefined
        ? {
            status: "error",
            message: saveError,
            ...(saveErrorCode !== undefined
              ? {
                  code: saveErrorCode,
                }
              : {}),
          }
        : {
            status: dirty ? "dirty" : hasSaved ? "saved" : "ready",
          };
    if (reloading) {
      return {
        ...value,
        reloading: true,
      };
    } else {
      return value;
    }
  }
  function getCommentSyncState(): Host.CommentSync {
    let length = applicableCommentOperations(
      publishedState.comments,
      pendingCommentOperations,
    ).length;
    if (readOnly && length > 0) {
      return {
        status: "blocked",
        pending: length,
        message: readOnlyReason,
      };
    }
    if (commentPublishError !== undefined) {
      return {
        status: "error",
        pending: length,
        message: commentPublishError,
      };
    }
    if (publishingComments || length > 0) {
      return {
        status: "publishing",
        pending: length,
      };
    }
    return {
      status: "idle",
      pending: 0,
    };
  }
  let notificationOwed: boolean = false;
  function flushOwedNotification(): void {
    if (!notificationOwed) {
      return;
    }
    notificationOwed = false;
    queueMicrotask(() => notifyDocumentSubscribers());
  }
  function notifyDocumentSubscribers(event?: { remote: boolean }): void {
    if (documentSubscribers.size === 0) {
      notificationOwed = true;
    }
    for (let value of documentSubscribers) {
      value(event);
    }
    notifySaveSubscribers();
  }
  function notifySaveSubscribers(): void {
    if (saveSubscribers.size === 0) {
      notificationOwed = true;
    }
    let value = getSaveState();
    for (let subscriber of saveSubscribers) {
      subscriber(value);
    }
  }
  let stashWriteSucceeded = true,
    stashOffer:
      | { at: number; state: Host.ArtifactEnvelope<Content> }
      | undefined,
    expectedEmbeddedStateHash: string | undefined;
  function writeStash(): boolean {
    let value = pendingCommentOperations,
      stashState = stashOffer ? stashOffer.state : localState;
    stashWriteSucceeded = stash.write(
      JSON.stringify({
        v: 2,
        at: stashOffer ? stashOffer.at : Date.now(),
        state: stashState,
        ...(value.length > 0
          ? {
              ops: value,
            }
          : {}),
        ...(expectedEmbeddedStateHash !== undefined && !stashOffer
          ? {
              expectEmbed: expectedEmbeddedStateHash,
            }
          : {}),
      }),
    );
    return stashWriteSucceeded;
  }
  {
    let value = parseArtifactStash(stash.read());
    if (value) {
      let embeddedDocument = parseEmbeddedArtifactState(value.state, documentOptions),
        callback = (envelope: Host.ArtifactEnvelope<Content>) =>
          documentOptions.serializeContent !== undefined
            ? documentOptions.serializeContent(envelope.content, envelope.title)
            : envelope.content,
        commentOperations = applicableCommentOperations(
          publishedState.comments,
          normalizeCommentOperations(value.ops),
        );
      if (commentOperations.length === 0 && value.ops === undefined) {
        let values = new Set(
          publishedState.comments.map((comment) => comment.id),
        );
        commentOperations = embeddedDocument.comments
          .filter((comment): boolean => !values.has(comment.id))
          .map((comment) => ({
            op: "add",
            comment: comment,
          }));
      }
      let hasPendingComments: boolean =
        JSON.stringify({
          t: embeddedDocument.title,
          c: callback(embeddedDocument),
        }) ===
        JSON.stringify({
          t: publishedState.title,
          c: callback(publishedState),
        });
      pendingCommentOperations = commentOperations;
      if (pendingCommentOperations.length > 0) {
        localState = {
          ...localState,
          comments: applyCommentOperations(
            publishedState.comments,
            pendingCommentOperations,
          ),
        };
      }
      if (hasPendingComments) {
        if (pendingCommentOperations.length === 0) {
          stash.clear();
        } else {
          writeStash();
        }
      } else if (value.expectEmbed === embeddedStateHash) {
        localState = {
          title: embeddedDocument.title,
          content: embeddedDocument.content,
          comments: applyCommentOperations(
            publishedState.comments,
            pendingCommentOperations,
          ),
        };
        dirty = true;
        writeStash();
      } else {
        stashOffer = {
          at: value.at,
          state: embeddedDocument,
        };
      }
    }
  }
  function markReadOnlyFromError(publishError: Host.PublishError): void {
    readOnly = true;
    readOnlyReason =
      publishError.code === "not_writer"
        ? READ_ONLY_ARTIFACT_MESSAGE
        : publishError.code === "consent_required"
          ? "Saving needs the self-publish permission this view declined (or has not answered). Reload and accept the prompt to edit."
          : "This view cannot save: " +
            publishError.message +
            " (" +
            publishError.code +
            ")";
    if (
      publishError.code === "not_writer" ||
      publishError.code === "not_declared" ||
      publishError.code === "capability_disabled" ||
      publishError.code === "capability_removed"
    ) {
      readOnlyFlag.write(readOnlyReason);
    }
  }
  function updateLocalState(
    envelope: Host.ArtifactEnvelope<Content>,
    isRemote: boolean = false,
  ): void {
    localState = envelope;
    dirty = true;
    hasSaved = false;
    saveError = undefined;
    saveErrorCode = undefined;
    if (!isRemote) {
      stashOffer = undefined;
      recordArtifactEdit();
    }
    writeStash();
    notifyDocumentSubscribers();
  }
  function recomposeComments(): void {
    localState = {
      ...localState,
      comments: applyCommentOperations(
        publishedState.comments,
        pendingCommentOperations,
      ),
    };
    writeStash();
    notifyDocumentSubscribers();
  }
  function serializeEnvelope(
    envelope: Host.ArtifactEnvelope<Content>,
  ): Host.ArtifactEnvelope<unknown> {
    if (documentOptions.serializeContent !== undefined) {
      return {
        ...envelope,
        content: documentOptions.serializeContent(envelope.content, envelope.title),
      };
    } else {
      return envelope;
    }
  }
  function buildPublishedPage(envelope: Host.ArtifactEnvelope<Content>): string {
    return assembleCompiledPage(
      {
        ...pageParts,
        title: envelope.title,
      },
      stringifyInlineJson(serializeEnvelope(envelope)),
    );
  }
  async function publishPage(
    pageHtml: string,
    publishOptions?: {
      published: Host.ArtifactEnvelope<unknown>;
      base: Host.ArtifactEnvelope<unknown>;
    },
  ): Promise<Host.PublishResult | undefined> {
    return (documentOptions.publish ?? createSelfPublisher())(
      pageHtml,
      publishOptions,
    );
  }
  let publishChain: Promise<void> = Promise.resolve();
  function serializePublish<Result>(
    publishTask: () => Promise<Result>,
  ): Promise<Result> {
    let value = publishChain.then(publishTask, publishTask);
    publishChain = value.then(
      (): void => {
        return;
      },
      (): void => {
        return;
      },
    );
    return value;
  }
  function publishPendingComments(): void {
    if (readOnly || publishingComments) {
      return;
    }
    if (
      applicableCommentOperations(
        publishedState.comments,
        pendingCommentOperations,
      ).length === 0
    ) {
      return;
    }
    publishingComments = true;
    commentPublishError = undefined;
    notifyDocumentSubscribers();
    let commentPublishConflict: boolean = false;
    serializePublish(async (): Promise<void> => {
      try {
        let value = applicableCommentOperations(
          publishedState.comments,
          pendingCommentOperations,
        );
        if (value.length === 0) {
          return;
        }
        let state = {
          title: publishedState.title,
          content: publishedState.content,
          comments: applyCommentOperations(
            publishedState.comments,
            value,
          ),
        };
        if (
          JSON.stringify(state.comments) ===
          JSON.stringify(publishedState.comments)
        ) {
          let values = new Set(value);
          pendingCommentOperations = pendingCommentOperations.filter(
            (commentId): boolean => !values.has(commentId),
          );
          localState = {
            ...localState,
            comments: applyCommentOperations(
              publishedState.comments,
              pendingCommentOperations,
            ),
          };
          writeStash();
          return;
        }
        let publishedPage = buildPublishedPage(state);
        if (
          new TextEncoder().encode(publishedPage).length >
          compiledPageMaxBytes
        ) {
          commentPublishError =
            "The document is over the 16 MiB limit — the comment is " +
            "kept locally but cannot publish until content shrinks.";
          return;
        }
        expectedEmbeddedStateHash = hashArtifactState(
          stringifyInlineJson(
            serializeEnvelope(
              parseEmbeddedArtifactState(
                JSON.parse(JSON.stringify(state)),
                documentOptions,
              ),
            ),
          ),
        );
        writeStash();
        if (dirty && !stashWriteSucceeded) {
          expectedEmbeddedStateHash = undefined;
          commentPublishError =
            "Comment held: you have unsaved edits that could NOT be kept locally (this document is too large to stash), and posting the comment reloads the page. Save your edits first, then retry.";
          return;
        }
        try {
          await publishPage(publishedPage);
        } catch (publishError: unknown) {
          if (
            normalizeSelfPublishError(publishError).code !==
            "upstream_error"
          ) {
            throw publishError;
          }
          await new Promise((resolveRetry) =>
            setTimeout(resolveRetry, 400 + Math.random() * 1200),
          );
          await publishPage(publishedPage);
        }
        publishedState = state;
        pendingCommentOperations = applicableCommentOperations(
          publishedState.comments,
          pendingCommentOperations,
        );
        localState = {
          ...localState,
          comments: applyCommentOperations(
            publishedState.comments,
            pendingCommentOperations,
          ),
        };
        writeStash();
      } catch (value: unknown) {
        expectedEmbeddedStateHash = undefined;
        let publishError = normalizeSelfPublishError(value);
        if (publishError.code === "conflict") {
          commentPublishConflict = true;
        } else if (
          SELF_PUBLISH_PERMISSION_ERROR_CODES.includes(publishError.code)
        ) {
          markReadOnlyFromError(publishError);
        } else if (publishError.code === "rate_limited") {
          commentPublishError =
            "Commenting too frequently — will retry in a moment.";
          setTimeout(
            (): void => {
              commentPublishError = undefined;
              publishPendingComments();
            },
            4000 + Math.random() * 3000,
          );
        } else {
          commentPublishError =
            "Comment not published (" +
            publishError.message +
            ") — it is kept here; use retry to try again.";
        }
        writeStash();
      } finally {
        publishingComments = false;
        notifyDocumentSubscribers();
        if (!commentPublishConflict && commentPublishError === undefined && !readOnly) {
          publishPendingComments();
        }
      }
    });
  }
  async function save(): Promise<void> {
    if (readOnly || saving || !dirty) {
      return;
    }
    saving = true;
    saveError = undefined;
    saveErrorCode = undefined;
    notifySaveSubscribers();
    let { title: value, content: localContent } = localState;
    await serializePublish(async (): Promise<void> => {
      try {
        writeStash();
        let pendingOperations = applicableCommentOperations(
            publishedState.comments,
            pendingCommentOperations,
          ),
          state = {
            title: value,
            content: localContent,
            comments: applyCommentOperations(
              publishedState.comments,
              pendingOperations,
            ),
          },
          serializedContent =
            documentOptions.publishesPage === false && documentOptions.publish !== undefined
              ? ""
              : buildPublishedPage(state),
          length = new TextEncoder().encode(serializedContent).length;
        if (length > compiledPageMaxBytes) {
          saveError =
            "The document is " +
            String(Math.round(length / 1024 / 1024)) +
            " MiB — over the 16 MiB limit. Remove or shrink images " +
            "(the usual culprit) and save again.";
          return;
        }
        let publishTitle =
            documentOptions.publish !== undefined
              ? {
                  published: serializeEnvelope(state),
                  base: serializeEnvelope(publishedState),
                }
              : undefined,
          publishResult: Host.PublishResult | undefined;
        try {
          publishResult = await publishPage(serializedContent, publishTitle);
        } catch (publishError: unknown) {
          if (
            normalizeSelfPublishError(publishError).code !==
            "upstream_error"
          ) {
            throw publishError;
          }
          await new Promise((resolveRetry) =>
            setTimeout(resolveRetry, 400 + Math.random() * 1200),
          );
          publishResult = await publishPage(serializedContent, publishTitle);
        }
        publishedState = state;
        pendingCommentOperations = applicableCommentOperations(
          publishedState.comments,
          pendingCommentOperations,
        );
        localState = {
          ...localState,
          comments: applyCommentOperations(
            publishedState.comments,
            pendingCommentOperations,
          ),
        };
        if (publishResult?.reloads !== false) {
          reloading = true;
        }
        if (localState.title === value && localState.content === localContent) {
          dirty = false;
          hasSaved = publishResult?.reloads !== false;
          if (pendingCommentOperations.length === 0) {
            commentPublishError = undefined;
          }
          if (hasSaved || stashOffer || pendingCommentOperations.length > 0) {
            writeStash();
          } else {
            stash.clear();
          }
          if (!hasSaved) {
            publishPendingComments();
          }
        } else if (!stashWriteSucceeded && publishResult?.reloads !== false) {
          saveError =
            "Saved — but you kept typing during the save, and those newer " +
            "changes could NOT be kept locally (this document is too large to stash). Copy anything important now: the page is about to reload to the version without them.";
        }
      } catch (publishError: unknown) {
        let normalizedError = normalizeSelfPublishError(publishError);
        saveErrorCode = normalizedError.code;
        if (normalizedError.code === "conflict") {
          saveError = stashWriteSucceeded
            ? "Someone saved a newer version first — loading it now. Your " +
              "changes are kept and will be offered for restore."
            : "Someone saved a newer version first — loading it now. Your " +
              "changes could NOT be kept locally (this document is too large to stash), so copy anything important before the reload.";
        } else if (
          SELF_PUBLISH_PERMISSION_ERROR_CODES.includes(normalizedError.code)
        ) {
          markReadOnlyFromError(normalizedError);
        } else if (normalizedError.say !== undefined) {
          saveError = normalizedError.say;
        } else if (normalizedError.code === "rate_limited") {
          saveError =
            "Not saved (" +
            normalizedError.message +
            "). Your changes are kept; give it a moment, then save again.";
        } else if (
          normalizedError.code === "invalid_content" ||
          normalizedError.code === "transform_error"
        ) {
          saveError =
            "The store refused the document (" +
            normalizedError.code +
            ": " +
            normalizedError.message +
            "). This is usually a content problem — most often a pasted " +
            "replacement character (U+FFFD, the question-mark-in-a-box glyph), which the platform rejects; find and remove the odd character, then save again. If the content looks clean, this is an appifact bug.";
        } else if (normalizedError.code === "too_large") {
          saveError =
            "The store refused the document as too large (16 MiB limit). Remove or shrink images and save again.";
        } else {
          saveError =
            "Saving failed (" +
            normalizedError.message +
            "). Your changes are kept — " +
            "try again.";
        }
      } finally {
        saving = false;
        notifyDocumentSubscribers();
      }
    });
  }
  let canCheckLiveState =
      documentOptions.canPublish === undefined &&
      (documentOptions.publish === undefined || documentOptions.publishWrapsFrame === true),
    selfCapabilityReady =
      !readOnly && canCheckLiveState && !selfPublishInstalled()
        ? getSelfPublishCapability().then(
            (capability: Host.SelfCapability | null): void => {
              if (capability !== null || readOnly) {
                return;
              }
              readOnly = true;
              readOnlyAtBoot = !dirty;
              readOnlyReason =
                "This view can't save: no publish path is available here.";
              notifyDocumentSubscribers();
            },
          )
        : Promise.resolve();
  if (!readOnly && canCheckLiveState) {
    selfCapabilityReady
      .then(() =>
        readOnly
          ? null
          : Promise.all([
              currentUserCanEditAsync(),
              getAssetsCapability(),
            ]),
      )
      .then(
        (
          selfCapability:
            | [boolean | null | undefined, Host.AssetsCapability | null]
            | null,
        ): void => {
          if (
            selfCapability === null ||
            selfCapability[0] !== false ||
            selfCapability[1] !== null ||
            readOnly
          ) {
            return;
          }
          readOnly = true;
          readOnlyAtBoot = !dirty;
          readOnlyReason = READ_ONLY_ARTIFACT_MESSAGE;
          notifyDocumentSubscribers();
        },
      );
  }
  if (!readOnly) {
    queueMicrotask(() => publishPendingComments());
  }
  return {
    saveMode: (): "manual" => "manual",
    state: () => localState,
    content: () => localState.content,
    title: () => localState.title,
    comments: () => localState.comments,
    dirty: (): boolean => dirty,
    readOnly: () => readOnly,
    saveState: getSaveState,
    commentSync: getCommentSyncState,
    setContent(content): void {
      if (content === localState.content) {
        return;
      }
      updateLocalState({
        ...localState,
        content: content,
      });
    },
    updateContent(transformContent, updateOptions): void {
      let value = transformContent(localState.content);
      if (value === localState.content) {
        return;
      }
      updateLocalState(
        {
          ...localState,
          content: value,
        },
        updateOptions?.auto === true,
      );
    },
    adoptRemote(remoteContent): void {
      let value = remoteContent(publishedState.content, localState.content);
      if (
        value.base === publishedState.content &&
        value.current === localState.content
      ) {
        return;
      }
      publishedState = {
        ...publishedState,
        content: value.base,
      };
      localState = {
        ...localState,
        content: value.current,
      };
      if (
        dirty &&
        !value.dirty &&
        localState.title === publishedState.title
      ) {
        dirty = false;
        if (!stashOffer && pendingCommentOperations.length === 0) {
          stash.clear();
        }
      }
      if (dirty) {
        writeStash();
      }
      notifyDocumentSubscribers({
        remote: true,
      });
    },
    setTitle(titleInput): void {
      let value = normalizeTitleInput(titleInput);
      if (value.length === 0 || value === localState.title) {
        return;
      }
      updateLocalState({
        ...localState,
        title: value,
      });
    },
    addComment(comment) {
      if (localState.comments.length >= MAX_ARTIFACT_COMMENTS) {
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
      pendingCommentOperations = [
        ...pendingCommentOperations,
        {
          op: "add",
          comment: value,
        },
      ];
      recomposeComments();
      publishPendingComments();
      return value;
    },
    removeComment(commentId): void {
      if (
        !pendingCommentOperations.some(
          (operation) => operation.op === "add" && operation.comment.id === commentId,
        ) &&
        !publishedState.comments.some(
          (comment): boolean => comment.id === commentId,
        )
      ) {
        return;
      }
      pendingCommentOperations = [
        ...pendingCommentOperations.filter(
          (operation): boolean =>
            !(operation.op === "add" && operation.comment.id === commentId),
        ),
        {
          op: "remove",
          id: commentId,
        },
      ];
      recomposeComments();
      publishPendingComments();
    },
    pendingCommentIds() {
      let values = new Set<string>();
      for (let value of applicableCommentOperations(
        publishedState.comments,
        pendingCommentOperations,
      )) {
        if (value.op === "add") {
          values.add(value.comment.id);
        }
      }
      return values;
    },
    retryCommentPublish(): void {
      if (commentPublishError === undefined) {
        return;
      }
      commentPublishError = undefined;
      publishPendingComments();
    },
    documentBytes() {
      return new TextEncoder().encode(buildPublishedPage(localState)).length;
    },
    save: save,
    stashOffer: () =>
      stashOffer
        ? {
            at: stashOffer.at,
          }
        : undefined,
    restoreStash() {
      if (!stashOffer) {
        return;
      }
      let value = stashOffer,
        state = {
          title: localState.title,
          content: localState.content,
        };
      stashOffer = undefined;
      restoreCount += 1;
      updateLocalState({
        title: value.state.title,
        content: value.state.content,
        comments: applyCommentOperations(
          publishedState.comments,
          pendingCommentOperations,
        ),
      });
      return {
        get label() { return uiMessage("design-system.storage.restoreUnsavedChanges"); },
        do(): void {
          stashOffer = undefined;
          updateLocalState({
            title: value.state.title,
            content: value.state.content,
            comments: applyCommentOperations(
              publishedState.comments,
              pendingCommentOperations,
            ),
          });
        },
        undo(): void {
          stashOffer = value;
          updateLocalState(
            {
              title: state.title,
              content: state.content,
              comments: applyCommentOperations(
                publishedState.comments,
                pendingCommentOperations,
              ),
            },
            true,
          );
          recordArtifactEdit();
        },
      };
    },
    restoreCount: () => restoreCount,
    discardStash(): void {
      if (!stashOffer) {
        return;
      }
      stashOffer = undefined;
      if (pendingCommentOperations.length === 0) {
        stash.clear();
      } else {
        writeStash();
      }
      notifyDocumentSubscribers();
    },
    subscribe(subscriber) {
      documentSubscribers.add(subscriber);
      flushOwedNotification();
      return () => documentSubscribers.delete(subscriber);
    },
    subscribeSave(subscriber) {
      saveSubscribers.add(subscriber);
      flushOwedNotification();
      return () => saveSubscribers.delete(subscriber);
    },
  };
}
export {
  ARTIFACT_READ_ONLY_PREFIX,
  ARTIFACT_STASH_PREFIX,
  artifactStashKey,
  createArtifactDocument,
  createArtifactLocalFlag,
  createSessionStorageSlot,
  currentArtifactReadOnlySlot,
  currentArtifactStash,
  hashArtifactState,
  parseArtifactStash,
  parseEmbeddedArtifactState,
  READ_ONLY_ARTIFACT_MESSAGE,
  readCurrentArtifactReadOnlyReason,
};
export function installDocumentsStorage(): () => void {
  return () => {
    READ_ONLY_ARTIFACT_MESSAGE =
      "You can view this artifact but not edit it. Saving needs write access from an owner.";
    ARTIFACT_STASH_PREFIX = "appifact-stash/";
    ARTIFACT_READ_ONLY_PREFIX = "appifact-ro/";
  };
}
