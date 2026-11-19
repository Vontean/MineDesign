import type * as Host from "../contracts/platform-host";
import type * as React from "react";
/** Restored application module; prepare first, initialize in original order. */
import { truncateUtf16Safely } from "../platform/compiled-page";

var MAX_ARTIFACT_COMMENTS: number;
var MAX_COMMENT_TEXT_LENGTH: number;
var MAX_COMMENT_IMAGES: number;
function isValidCommentImage(source: string): boolean {
  if (/^\/?_blob\/[A-Za-z0-9][A-Za-z0-9._-]{0,127}$/.test(source)) {
    return true;
  }
  return (
    source.length <= 200000 &&
    /^data:image\/(?:png|jpeg|webp|gif);base64,[A-Za-z0-9+/]+=*$/.test(source)
  );
}
function objectProperty(candidate: unknown, key: PropertyKey): unknown {
  if (typeof candidate === "object" && candidate !== null) {
    return (candidate as Record<PropertyKey, unknown>)[key];
  } else {
    return undefined;
  }
}
function normalizeComments(comments: unknown): Host.ArtifactComment[] {
  if (!Array.isArray(comments)) {
    return [];
  }
  let items: Host.ArtifactComment[] = [],
    values = new Set();
  for (let value of comments as unknown[]) {
    let commentId = objectProperty(value, "id"),
      commentText = objectProperty(value, "text"),
      commentTimestamp = objectProperty(value, "at");
    if (
      typeof commentId !== "string" ||
      commentId.length === 0 ||
      commentId.length > 64 ||
      values.has(commentId) ||
      typeof commentText !== "string" ||
      typeof commentTimestamp !== "number" ||
      !Number.isFinite(commentTimestamp)
    ) {
      continue;
    }
    values.add(commentId);
    let authorName = objectProperty(value, "author"),
      authorId = objectProperty(value, "userId"),
      elementKey = objectProperty(value, "elementKey"),
      elementLabel = objectProperty(value, "elementLabel"),
      imageValues = objectProperty(value, "images"),
      validImages = Array.isArray(imageValues)
        ? (imageValues as unknown[])
            .filter(
              (imageValue: unknown): imageValue is string =>
                typeof imageValue === "string" && isValidCommentImage(imageValue),
            )
            .slice(0, MAX_COMMENT_IMAGES)
        : [];
    items.push({
      id: commentId,
      text: truncateUtf16Safely(commentText, MAX_COMMENT_TEXT_LENGTH),
      at: commentTimestamp,
      author:
        typeof authorName === "string" && authorName.length > 0
          ? truncateUtf16Safely(authorName, 80)
          : "viewer",
      userId:
        typeof authorId === "string" && authorId.length > 0
          ? truncateUtf16Safely(authorId, 128)
          : undefined,
      elementKey:
        typeof elementKey === "string" && elementKey.length > 0
          ? truncateUtf16Safely(elementKey, 400)
          : undefined,
      elementLabel:
        typeof elementLabel === "string"
          ? truncateUtf16Safely(elementLabel, 160)
          : undefined,
      ...(validImages.length > 0
        ? {
            images: validImages,
          }
        : {}),
    });
  }
  items.sort((leftComment, rightComment) => leftComment.at - rightComment.at);
  return items.slice(-MAX_ARTIFACT_COMMENTS);
}
function applyCommentOperations(
  comments: Host.ArtifactComment[],
  operations: readonly Host.CommentOperation[],
): Host.ArtifactComment[] {
  let value = comments;
  for (let operation of operations) {
    if (operation.op === "add") {
      if (value.some((comment): boolean => comment.id === operation.comment.id)) {
        continue;
      }
      if (value.length >= MAX_ARTIFACT_COMMENTS) {
        continue;
      }
      value = [...value, operation.comment].sort(
        (leftComment, rightComment) => leftComment.at - rightComment.at,
      );
    } else {
      value = value.filter((comment): boolean => comment.id !== operation.id);
    }
  }
  return value;
}
function applicableCommentOperations(
  comments: readonly Host.ArtifactComment[],
  operations: readonly Host.CommentOperation[],
): Host.CommentOperation[] {
  let values = new Set(comments.map((comment) => comment.id));
  return operations.filter((operation) =>
    operation.op === "add" ? !values.has(operation.comment.id) : values.has(operation.id),
  );
}
function normalizeCommentOperations(
  operations: unknown,
): Host.CommentOperation[] {
  if (!Array.isArray(operations)) {
    return [];
  }
  let items: Host.CommentOperation[] = [];
  for (let value of operations as unknown[]) {
    let operationType = objectProperty(value, "op");
    if (operationType === "add") {
      let comment = normalizeComments([objectProperty(value, "comment")])[0];
      if (comment) {
        items.push({
          op: "add",
          comment: comment,
        });
      }
    } else if (operationType === "remove") {
      let commentId = objectProperty(value, "id");
      if (
        typeof commentId === "string" &&
        commentId.length > 0 &&
        commentId.length <= 64
      ) {
        items.push({
          op: "remove",
          id: commentId,
        });
      }
    }
  }
  return items;
}
export {
  applicableCommentOperations,
  applyCommentOperations,
  isValidCommentImage,
  MAX_ARTIFACT_COMMENTS,
  MAX_COMMENT_IMAGES,
  MAX_COMMENT_TEXT_LENGTH,
  normalizeCommentOperations,
  normalizeComments,
  objectProperty,
};
export function installHostClaudeSession(): () => void {
  return () => {
    MAX_ARTIFACT_COMMENTS = 200;
    MAX_COMMENT_TEXT_LENGTH = 4000;
    MAX_COMMENT_IMAGES = 4;
  };
}
