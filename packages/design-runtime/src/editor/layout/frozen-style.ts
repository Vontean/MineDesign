/** Restored application module; prepare first, initialize in original order. */
import {
  type Dynamic,
} from "../../runtime-types";

var FrozenStyleCache: Dynamic;
var LayoutFrozenStyleMmLlHhVvCcSsQqTtAaZzPattern: Dynamic;
function isSafeSvgPath(pathData?: Dynamic): Dynamic {
  return (
    typeof pathData == "string" &&
    pathData.length > 0 &&
    pathData.length <= 1e5 &&
    LayoutFrozenStyleMmLlHhVvCcSsQqTtAaZzPattern.test(pathData)
  );
}
function isFiniteRect(rect?: Dynamic): Dynamic {
  return typeof rect != "object" || rect == null
    ? false
    : ["x", "y", "w", "h"].every((key?: Dynamic): Dynamic => {
        let coordinate: Dynamic = rect[key];
        return (
          typeof coordinate == "number" &&
          Number.isFinite(coordinate) &&
          Math.abs(coordinate) < 1e6
        );
      });
}
function validateResizeMessage(message?: Dynamic): Dynamic {
  let isSaneNumber: Dynamic = (candidate?: Dynamic): Dynamic =>
    typeof candidate == "number" &&
    Number.isFinite(candidate) &&
    Math.abs(candidate) < 1e6;
  if (
    (message.width == null && message.height == null) ||
    (message.width != null && !isSaneNumber(message.width)) ||
    (message.height != null && !isSaneNumber(message.height))
  )
    return null;
  let sanitized: Dynamic = {
    ...message,
  };
  for (let side of ["left", "top", "right", "bottom"] as Dynamic)
    sanitized[side] != null && !isSaneNumber(sanitized[side]) && delete sanitized[side];
  sanitized.left != null && delete sanitized.right;
  sanitized.top != null && delete sanitized.bottom;
  return sanitized;
}
function validateRotateMessage(message?: Dynamic): Dynamic {
  let angle: Dynamic = message.angle;
  return typeof angle == "number" &&
    Number.isFinite(angle) &&
    Math.abs(angle) <= 360
    ? message
    : null;
}
function normalizePickerPayload(payload?: Dynamic): Dynamic {
  let sanitized: Dynamic = {
    ...payload,
  };
  sanitized.rect != null && !isFiniteRect(sanitized.rect) && delete sanitized.rect;
  sanitized.path != null &&
    !(typeof sanitized.path == "object" && isSafeSvgPath(sanitized.path.d)) &&
    delete sanitized.path;
  sanitized.dir != null &&
    !(
      (sanitized.dir.x === 1 || sanitized.dir.x === -1) &&
      (sanitized.dir.y === 1 || sanitized.dir.y === -1)
    ) &&
    delete sanitized.dir;
  sanitized.targetTid != null &&
    !Number.isInteger(sanitized.targetTid) &&
    (sanitized.targetTid = null);
  let position: Dynamic = sanitized.position;
  position !== "before" &&
    position !== "after" &&
    position !== "into" &&
    position !== "root-end" &&
    (sanitized.position = "root-end");
  return sanitized;
}
export {
  FrozenStyleCache,
  isFiniteRect,
  isSafeSvgPath,
  LayoutFrozenStyleMmLlHhVvCcSsQqTtAaZzPattern,
  normalizePickerPayload,
  validateResizeMessage,
  validateRotateMessage,
};
export function installEditorLayoutFrozenStyle(): () => void {
  return () => {
    FrozenStyleCache = class {
      key: Dynamic = "";
      styles: Dynamic = new Map();
      clear(): Dynamic {
        this.key = "";
        this.styles.clear();
      }
      capture(key: Dynamic, tid: Dynamic, readStyle: Dynamic): Dynamic {
        key !== this.key && (this.clear(), (this.key = key));
        this.styles.has(tid) || this.styles.set(tid, readStyle());
      }
      baselineFor(key: Dynamic, tid: Dynamic): Dynamic {
        return key === this.key ? this.styles.get(tid) : undefined;
      }
      tids(key: Dynamic): Dynamic {
        return key === this.key ? [...this.styles.keys()] : [];
      }
      forget(key: Dynamic): Dynamic {
        key === this.key && this.clear();
      }
    };
    LayoutFrozenStyleMmLlHhVvCcSsQqTtAaZzPattern =
      /^[MmLlHhVvCcSsQqTtAaZz0-9\s,.eE+-]+$/;
  };
}
