/** Restored application module; prepare first, initialize in original order. */
import {
  type Dynamic,
} from "../runtime-types";

var maxDocumentComments: Dynamic;
var maxCommentTextLength: Dynamic;
var maxCommentAttachments: Dynamic;
function truncateUtf16Safely(text?: Dynamic, maxUnits?: Dynamic): Dynamic {
  if (text.length <= maxUnits) return text;
  let truncated: Dynamic = text.slice(0, maxUnits),
    lastUnit: Dynamic = truncated.charCodeAt(truncated.length - 1);
  return lastUnit >= 55296 && lastUnit <= 56319
    ? truncated.slice(0, -1)
    : truncated;
}
function isValidCommentImage(imageRef?: Dynamic): Dynamic {
  return /^\/?_blob\/[A-Za-z0-9][A-Za-z0-9._-]{0,127}$/.test(imageRef)
    ? true
    : imageRef.length <= 2e5 &&
        /^data:image\/(?:png|jpeg|webp|gif);base64,[A-Za-z0-9+/]+=*$/.test(
          imageRef,
        );
}
function getObjectProperty(candidate?: Dynamic, property?: Dynamic): Dynamic {
  return typeof candidate == "object" && candidate !== null
    ? candidate[property]
    : undefined;
}
function parseDocumentComments(rawComments?: Dynamic): Dynamic {
  if (!Array.isArray(rawComments)) return [];
  let comments: Dynamic = [],
    seenCommentIds: Dynamic = new Set();
  for (let rawComment of rawComments as Dynamic) {
    let commentId: Dynamic = getObjectProperty(rawComment, "id"),
      commentText: Dynamic = getObjectProperty(rawComment, "text"),
      timestamp: Dynamic = getObjectProperty(rawComment, "at");
    if (
      typeof commentId != "string" ||
      commentId.length === 0 ||
      commentId.length > 64 ||
      seenCommentIds.has(commentId) ||
      typeof commentText != "string" ||
      typeof timestamp != "number" ||
      !Number.isFinite(timestamp)
    )
      continue;
    seenCommentIds.add(commentId);
    let author: Dynamic = getObjectProperty(rawComment, "author"),
      userId: Dynamic = getObjectProperty(rawComment, "userId"),
      elementKey: Dynamic = getObjectProperty(rawComment, "elementKey"),
      elementLabel: Dynamic = getObjectProperty(rawComment, "elementLabel"),
      rawImages: Dynamic = getObjectProperty(rawComment, "images"),
      images: Dynamic = Array.isArray(rawImages)
        ? rawImages
            .filter(
              (imageRef?: Dynamic): Dynamic =>
                typeof imageRef == "string" && isValidCommentImage(imageRef),
            )
            .slice(0, maxCommentAttachments)
        : [];
    comments.push({
      id: commentId,
      text: truncateUtf16Safely(commentText, maxCommentTextLength),
      at: timestamp,
      author:
        typeof author == "string" && author.length > 0
          ? truncateUtf16Safely(author, 80)
          : "viewer",
      userId:
        typeof userId == "string" && userId.length > 0
          ? truncateUtf16Safely(userId, 128)
          : undefined,
      elementKey:
        typeof elementKey == "string" && elementKey.length > 0
          ? truncateUtf16Safely(elementKey, 400)
          : undefined,
      elementLabel:
        typeof elementLabel == "string"
          ? truncateUtf16Safely(elementLabel, 160)
          : undefined,
      ...(images.length > 0
        ? {
            images: images,
          }
        : {}),
    });
  }
  comments.sort(
    (earlierComment?: Dynamic, laterComment?: Dynamic): Dynamic => earlierComment.at - laterComment.at,
  );
  return comments.slice(-maxDocumentComments);
}
function applyCommentOperations(existingComments?: Dynamic, operations?: Dynamic): Dynamic {
  let comments: Dynamic = existingComments;
  for (let operation of operations as Dynamic)
    if (operation.op === "add") {
      if (
        comments.some(
          (comment?: Dynamic): Dynamic => comment.id === operation.comment.id,
        ) ||
        comments.length >= maxDocumentComments
      )
        continue;
      comments = [...comments, operation.comment].sort(
        (earlierComment?: Dynamic, laterComment?: Dynamic): Dynamic =>
          earlierComment.at - laterComment.at,
      );
    } else
      comments = comments.filter(
        (comment?: Dynamic): Dynamic => comment.id !== operation.id,
      );
  return comments;
}
function filterEffectiveCommentOperations(
  comments?: Dynamic,
  operations?: Dynamic,
): Dynamic {
  let commentIds: Dynamic = new Set(
    comments.map((comment?: Dynamic): Dynamic => comment.id),
  );
  return operations.filter(
    (operation?: Dynamic): Dynamic =>
      operation.op === "add"
        ? !commentIds.has(operation.comment.id)
        : commentIds.has(operation.id),
  );
}
function parseCommentOperations(rawOperations?: Dynamic): Dynamic {
  if (!Array.isArray(rawOperations)) return [];
  let operations: Dynamic = [];
  for (let rawOperation of rawOperations as Dynamic) {
    let operationKind: Dynamic = getObjectProperty(rawOperation, "op");
    if (operationKind === "add") {
      let comment: Dynamic = parseDocumentComments([
        getObjectProperty(rawOperation, "comment"),
      ])[0];
      comment &&
        operations.push({
          op: "add",
          comment: comment,
        });
    } else if (operationKind === "remove") {
      let commentId: Dynamic = getObjectProperty(rawOperation, "id");
      typeof commentId == "string" &&
        commentId.length > 0 &&
        commentId.length <= 64 &&
        operations.push({
          op: "remove",
          id: commentId,
        });
    }
  }
  return operations;
}
export {
  applyCommentOperations,
  filterEffectiveCommentOperations,
  getObjectProperty,
  isValidCommentImage,
  maxCommentAttachments,
  maxCommentTextLength,
  maxDocumentComments,
  parseCommentOperations,
  parseDocumentComments,
  truncateUtf16Safely,
};
export function installPlatformComments(): () => void {
  return () => {
    maxDocumentComments = 200;
    maxCommentTextLength = 4e3;
    maxCommentAttachments = 4;
  };
}
