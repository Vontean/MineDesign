/** Restored application module; prepare first, initialize in original order. */
import {
  type Dynamic,
} from "../runtime-types";

var PreviewProjectRootElementCache: Dynamic;
function setPreviewProjectRoot(input?: Dynamic, options?: Dynamic): Dynamic {
  input != null &&
    (options === undefined
      ? PreviewProjectRootElementCache.delete(input)
      : PreviewProjectRootElementCache.set(input, options));
}
function stripPreviewProjectRoot(
  input?: Dynamic,
  options?: Dynamic,
): Dynamic {
  let value: Dynamic =
    options == null ? undefined : PreviewProjectRootElementCache.get(options);
  if (value === undefined) return input;
  let value2: Dynamic = value.replace(/^\//, "");
  return input.startsWith(value2) ? input.slice(value2.length) : input;
}
export {
  PreviewProjectRootElementCache,
  setPreviewProjectRoot,
  stripPreviewProjectRoot,
};
export function installPreviewProjectRoot(): () => void {
  return () => {
    PreviewProjectRootElementCache = new WeakMap();
  };
}
