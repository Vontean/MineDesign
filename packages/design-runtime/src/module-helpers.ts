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
      (input?: Dynamic, options?: Dynamic, context?: Dynamic): Dynamic =>
      (): Dynamic => {
        if (context) throw context[0];
        try {
          input && (options = input((input = 0)));
          return options;
        } catch (value: Dynamic) {
          throw ((context = [value]), value);
        }
      };
    initializeCommonJS =
      (input?: Dynamic, options?: Dynamic): Dynamic =>
      (): Dynamic => {
        try {
          options ||
            input(
              (options = {
                exports: {},
              }).exports,
              options,
            );
          return options.exports;
        } catch (value: Dynamic) {
          throw ((options = 0), value);
        }
      };
    defineLiveExports = (input?: Dynamic, options?: Dynamic): Dynamic => {
      for (var value in options)
        defineProperty(input, value, {
          get: options[value],
          enumerable: true,
        });
    };
    copyModuleProperties = (
      input?: Dynamic,
      options?: Dynamic,
      context?: Dynamic,
      value?: Dynamic,
    ): Dynamic => {
      if (
        (options && typeof options == "object") ||
        typeof options == "function"
      )
        for (let value2 of getOwnPropertyNames(options) as Dynamic)
          !hasOwnProperty.call(input, value2) &&
            value2 !== context &&
            defineProperty(input, value2, {
              get: (): Dynamic => options[value2],
              enumerable:
                !(value = getOwnPropertyDescriptor(options, value2)) ||
                value.enumerable,
            });
      return input;
    };
    toModuleNamespace = (
      input?: Dynamic,
      options?: Dynamic,
      context?: Dynamic,
    ): Dynamic => (
      (context = input != null ? createObject(getPrototypeOf(input)) : {}),
      copyModuleProperties(
        options || !input || !input.__esModule
          ? defineProperty(context, "default", {
              value: input,
              enumerable: true,
            })
          : context,
        input,
      )
    );
  };
}
