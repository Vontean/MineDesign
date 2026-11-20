/** Restored application module; prepare first, initialize in original order. */
import {
  type Dynamic,
} from "./runtime-types";

var createObject: Dynamic;
var defineProperty: Dynamic;
var getOwnPropertyDescriptor: Dynamic;
var getOwnPropertyNames: Dynamic;
var getPrototypeOf: Dynamic;
var hasOwnProperty: Dynamic;
var initializeOnce: Dynamic;
var initializeCommonJS: Dynamic;
var defineLiveExports: Dynamic;
var copyModuleProperties: Dynamic;
var toModuleNamespace: Dynamic;
export {
  copyModuleProperties,
  createObject,
  defineLiveExports,
  defineProperty,
  getOwnPropertyDescriptor,
  getOwnPropertyNames,
  getPrototypeOf,
  initializeCommonJS,
  initializeOnce,
  toModuleNamespace,
};
export function installModuleHelpers(): () => void {
  return () => {
    createObject = Object.create;
    defineProperty = Object.defineProperty;
    getOwnPropertyDescriptor = Object.getOwnPropertyDescriptor;
    getOwnPropertyNames = Object.getOwnPropertyNames;
    getPrototypeOf = Object.getPrototypeOf;
    hasOwnProperty = Object.prototype.hasOwnProperty;
    initializeOnce =
      (factory?: Dynamic, moduleExports?: Dynamic, errorState?: Dynamic): Dynamic =>
      (): Dynamic => {
        if (errorState) throw errorState[0];
        try {
          factory && (moduleExports = factory((factory = 0)));
          return moduleExports;
        } catch (value: Dynamic) {
          throw ((errorState = [value]), value);
        }
      };
    initializeCommonJS =
      (moduleValue?: Dynamic, moduleExports?: Dynamic): Dynamic =>
      (): Dynamic => {
        try {
          moduleExports ||
            moduleValue(
              (moduleExports = {
                exports: {},
              }).exports,
              moduleExports,
            );
          return moduleExports.exports;
        } catch (value: Dynamic) {
          throw ((moduleExports = 0), value);
        }
      };
    defineLiveExports = (target?: Dynamic, exports?: Dynamic): Dynamic => {
      for (var value in exports)
        defineProperty(target, value, {
          get: exports[value],
          enumerable: true,
        });
    };
    copyModuleProperties = (
      target?: Dynamic,
      source?: Dynamic,
      defaultKey?: Dynamic,
      propertyDescriptor?: Dynamic,
    ): Dynamic => {
      if (
        (source && typeof source == "object") ||
        typeof source == "function"
      )
        for (let propertyName of getOwnPropertyNames(source) as Dynamic)
          !hasOwnProperty.call(target, propertyName) &&
            propertyName !== defaultKey &&
            defineProperty(target, propertyName, {
              get: (): Dynamic => source[propertyName],
              enumerable:
                !(propertyDescriptor = getOwnPropertyDescriptor(source, propertyName)) ||
                propertyDescriptor.enumerable,
            });
      return target;
    };
    toModuleNamespace = (
      moduleValue?: Dynamic,
      hasDefaultExport?: Dynamic,
      target?: Dynamic,
    ): Dynamic => (
      (target = moduleValue != null ? createObject(getPrototypeOf(moduleValue)) : {}),
      copyModuleProperties(
        hasDefaultExport || !moduleValue || !moduleValue.__esModule
          ? defineProperty(target, "default", {
              value: moduleValue,
              enumerable: true,
            })
          : target,
        moduleValue,
      )
    );
  };
}
