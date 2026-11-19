/** Restored application module; prepare first, initialize in original order. */
import {
  type Dynamic,
} from "../../runtime-types";
import { load_react } from "../../dependencies";
import { toModuleNamespace } from "../../module-helpers";

var reactComponentsPropCache: Dynamic;
var ComponentsPropCacheCache: Dynamic;
function getComponentPropsCache(projectPath?: Dynamic, filePath?: Dynamic): Dynamic {
  let fileCaches: Dynamic = ComponentsPropCacheCache.get(projectPath);
  fileCaches || ((fileCaches = new Map()), ComponentsPropCacheCache.set(projectPath, fileCaches));
  let cache: Dynamic = fileCaches.get(filePath);
  cache ||
    ((cache = {
      unsaved: new Map(),
      defaults: new Map(),
    }),
    fileCaches.set(filePath, cache));
  return cache;
}
function cacheUnsavedComponentProp(
  projectPath?: Dynamic,
  filePath?: Dynamic,
  propName?: Dynamic,
  value?: Dynamic,
): Dynamic {
  if (!(!projectPath || !filePath || !propName)) {
    if (value === undefined) {
      ComponentsPropCacheCache.get(projectPath)
        ?.get(filePath)
        ?.unsaved.delete(propName);
      return;
    }
    getComponentPropsCache(projectPath, filePath).unsaved.set(propName, value);
  }
}
function clearUnsavedComponentProps(
  projectPath?: Dynamic,
  filePath?: Dynamic,
): Dynamic {
  ComponentsPropCacheCache.get(projectPath)?.get(filePath)?.unsaved.clear();
}
function adoptComponentPropDefaults(
  projectPath?: Dynamic,
  filePath?: Dynamic,
  defaults?: Dynamic,
): Dynamic {
  if (!projectPath || !filePath) return;
  let propNames: Dynamic = Object.keys(defaults);
  if (propNames.length === 0) return;
  let cache: Dynamic = getComponentPropsCache(projectPath, filePath);
  for (let propName of propNames as Dynamic) {
    cache.defaults.set(propName, defaults[propName]);
    cache.unsaved.delete(propName);
  }
}
export {
  adoptComponentPropDefaults,
  cacheUnsavedComponentProp,
  clearUnsavedComponentProps,
  ComponentsPropCacheCache,
  getComponentPropsCache,
  reactComponentsPropCache,
};
export function installEditorComponentsPropCache(): () => void {
  return () => {
    reactComponentsPropCache = toModuleNamespace(
      load_react(),
      1,
    );
    ComponentsPropCacheCache = new Map();
  };
}
