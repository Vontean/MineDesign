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
function objectProperty(value: unknown, key: PropertyKey): unknown {
  if (typeof value === "object" && value !== null) {
    return (value as Record<PropertyKey, unknown>)[key];
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
    let value2 = objectProperty(value, "id"),
      value3 = objectProperty(value, "text"),
      value4 = objectProperty(value, "at");
    if (
      typeof value2 !== "string" ||
      value2.length === 0 ||
      value2.length > 64 ||
      values.has(value2) ||
      typeof value3 !== "string" ||
      typeof value4 !== "number" ||
      !Number.isFinite(value4)
    ) {
      continue;
    }
    values.add(value2);
    let value5 = objectProperty(value, "author"),
      value6 = objectProperty(value, "userId"),
      value7 = objectProperty(value, "elementKey"),
      value8 = objectProperty(value, "elementLabel"),
      value9 = objectProperty(value, "images"),
      value10 = Array.isArray(value9)
        ? (value9 as unknown[])
            .filter(
              (input: unknown): input is string =>
                typeof input === "string" && isValidCommentImage(input),
            )
            .slice(0, MAX_COMMENT_IMAGES)
        : [];
    items.push({
      id: value2,
      text: (0, truncateUtf16Safely)(value3, MAX_COMMENT_TEXT_LENGTH),
      at: value4,
      author:
        typeof value5 === "string" && value5.length > 0
          ? (0, truncateUtf16Safely)(value5, 80)
          : "viewer",
      userId:
        typeof value6 === "string" && value6.length > 0
          ? (0, truncateUtf16Safely)(value6, 128)
          : undefined,
      elementKey:
        typeof value7 === "string" && value7.length > 0
          ? (0, truncateUtf16Safely)(value7, 400)
          : undefined,
      elementLabel:
        typeof value8 === "string"
          ? (0, truncateUtf16Safely)(value8, 160)
          : undefined,
      ...(value10.length > 0
        ? {
            images: value10,
          }
        : {}),
    });
  }
  items.sort((input, options) => input.at - options.at);
  return items.slice(-MAX_ARTIFACT_COMMENTS);
}
function applyCommentOperations(
  comments: Host.ArtifactComment[],
  operations: readonly Host.CommentOperation[],
): Host.ArtifactComment[] {
  let value = comments;
  for (let value2 of operations) {
    if (value2.op === "add") {
      if (value.some((input): boolean => input.id === value2.comment.id)) {
        continue;
      }
      if (value.length >= MAX_ARTIFACT_COMMENTS) {
        continue;
      }
      value = [...value, value2.comment].sort(
        (input, options) => input.at - options.at,
      );
    } else {
      value = value.filter((input): boolean => input.id !== value2.id);
    }
  }
  return value;
}
function applicableCommentOperations(
  comments: readonly Host.ArtifactComment[],
  operations: readonly Host.CommentOperation[],
): Host.CommentOperation[] {
  let values = new Set(comments.map((input) => input.id));
  return operations.filter((input) =>
    input.op === "add" ? !values.has(input.comment.id) : values.has(input.id),
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
    let value2 = objectProperty(value, "op");
    if (value2 === "add") {
      let value3 = normalizeComments([objectProperty(value, "comment")])[0];
      if (value3) {
        items.push({
          op: "add",
          comment: value3,
        });
      }
    } else if (value2 === "remove") {
      let value3 = objectProperty(value, "id");
      if (
        typeof value3 === "string" &&
        value3.length > 0 &&
        value3.length <= 64
      ) {
        items.push({
          op: "remove",
          id: value3,
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
