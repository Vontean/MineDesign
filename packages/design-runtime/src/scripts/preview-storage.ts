/** Restored injected script; compiled as an isolated IIFE before insertion into a preview. */
import type { Dynamic } from "../runtime-types";
(function (this: Dynamic, ..._scriptArgs: Dynamic[]): Dynamic {
  var STORAGE_KEY_PREFIX: Dynamic = "page:";
  var createMemoryStorage: Dynamic = function (
    this: Dynamic,
    ..._createMemoryArgs: Dynamic[]
  ): Dynamic {
    var entries: Dynamic = (Object as Dynamic).create(null);
    return {
      getItem: function (
        this: Dynamic,
        key?: Dynamic,
        ..._getItemArgs: Dynamic[]
      ): Dynamic {
        return key in entries ? entries[key] : null;
      },
      setItem: function (
        this: Dynamic,
        key?: Dynamic,
        itemValue?: Dynamic,
        ..._setItemArgs: Dynamic[]
      ): Dynamic {
        entries[key] = String(itemValue);
      },
      removeItem: function (
        this: Dynamic,
        key?: Dynamic,
        ..._removeItemArgs: Dynamic[]
      ): Dynamic {
        delete entries[key];
      },
      key: function (
        this: Dynamic,
        index?: Dynamic,
        ..._keyArgs: Dynamic[]
      ): Dynamic {
        var keys: Dynamic = (Object as Dynamic).keys(entries);
        index = Math.floor(Number(index)) || 0;
        return index >= 0 && index < keys.length ? keys[index] : null;
      },
      get length(): Dynamic {
        return (Object as Dynamic).keys(entries).length;
      },
    };
  };
  var scopeStorage: Dynamic = function (
    this: Dynamic,
    storage?: Dynamic,
    ..._scopeArgs: Dynamic[]
  ): Dynamic {
    var listScopedKeys: Dynamic = function (
      this: Dynamic,
      ..._listArgs: Dynamic[]
    ): Dynamic {
      var scopedKeys: Dynamic = [];
      // MineDesign: restorer fix — read the scoped storage `n` (`real` in the original script); the restored code read
      // `length.length` / `length.key` off the loop bound, which is undefined, so listing an artboard's keys threw.
      for (
        var index: Dynamic = 0, length: Dynamic = storage.length;
        index < length;
        index++
      ) {
        var key: Dynamic = storage.key(index);
        if (key !== null && key.indexOf(STORAGE_KEY_PREFIX) === 0)
          scopedKeys.push(key.slice(STORAGE_KEY_PREFIX.length));
      }
      return scopedKeys;
    };
    var scopedStorage: Dynamic = {
      getItem: function (
        this: Dynamic,
        key?: Dynamic,
        ..._getItemArgs: Dynamic[]
      ): Dynamic {
        return storage.getItem(STORAGE_KEY_PREFIX + String(key));
      },
      setItem: function (
        this: Dynamic,
        key?: Dynamic,
        itemValue?: Dynamic,
        ..._setItemArgs: Dynamic[]
      ): Dynamic {
        storage.setItem(STORAGE_KEY_PREFIX + String(key), String(itemValue));
      },
      removeItem: function (
        this: Dynamic,
        key?: Dynamic,
        ..._removeItemArgs: Dynamic[]
      ): Dynamic {
        storage.removeItem(STORAGE_KEY_PREFIX + String(key));
      },
      clear: function (
        this: Dynamic,
        ..._clearArgs: Dynamic[]
      ): Dynamic {
        listScopedKeys().forEach(function (
          this: Dynamic,
          key?: Dynamic,
          ..._eachKeyArgs: Dynamic[]
        ): Dynamic {
          storage.removeItem(STORAGE_KEY_PREFIX + key);
        });
      },
      key: function (
        this: Dynamic,
        index?: Dynamic,
        ..._keyArgs: Dynamic[]
      ): Dynamic {
        var keys: Dynamic = listScopedKeys();
        index = Math.floor(Number(index)) || 0;
        return index >= 0 && index < keys.length ? keys[index] : null;
      },
      get length(): Dynamic {
        return listScopedKeys().length;
      },
    };
    if (typeof Proxy !== "function") return scopedStorage;
    var isStoredKey: Dynamic = function (
      this: Dynamic,
      property?: Dynamic,
      ..._predicateArgs: Dynamic[]
    ): Dynamic {
      return (
        typeof property === "string" && !(property in scopedStorage) && property !== "length"
      );
    };
    return new Proxy(scopedStorage, {
      get: function (
        this: Dynamic,
        _target?: Dynamic,
        property?: Dynamic,
        ..._getArgs: Dynamic[]
      ): Dynamic {
        if (property === "length") return listScopedKeys().length;
        if (property in scopedStorage) return scopedStorage[property];
        if (!isStoredKey(property)) return undefined;
        var storedValue: Dynamic = storage.getItem(STORAGE_KEY_PREFIX + property);
        return storedValue === null ? undefined : storedValue;
      },
      set: function (
        this: Dynamic,
        _target?: Dynamic,
        property?: Dynamic,
        itemValue?: Dynamic,
        ..._setArgs: Dynamic[]
      ): Dynamic {
        if (isStoredKey(property)) storage.setItem(STORAGE_KEY_PREFIX + property, String(itemValue));
        return true;
      },
      deleteProperty: function (
        this: Dynamic,
        _target?: Dynamic,
        property?: Dynamic,
        ..._deleteArgs: Dynamic[]
      ): Dynamic {
        if (isStoredKey(property)) storage.removeItem(STORAGE_KEY_PREFIX + property);
        return true;
      },
      has: function (
        this: Dynamic,
        _target?: Dynamic,
        property?: Dynamic,
        ..._hasArgs: Dynamic[]
      ): Dynamic {
        return (
          property in scopedStorage ||
          property === "length" ||
          (isStoredKey(property) && storage.getItem(STORAGE_KEY_PREFIX + property) !== null)
        );
      },
      ownKeys: function (
        this: Dynamic,
        ..._ownKeysArgs: Dynamic[]
      ): Dynamic {
        return listScopedKeys();
      },
      getOwnPropertyDescriptor: function (
        this: Dynamic,
        _target?: Dynamic,
        property?: Dynamic,
        ..._descriptorArgs: Dynamic[]
      ): Dynamic {
        if (!isStoredKey(property)) return undefined;
        var storedValue: Dynamic = storage.getItem(STORAGE_KEY_PREFIX + property);
        return storedValue === null
          ? undefined
          : {
              value: storedValue,
              writable: true,
              enumerable: true,
              configurable: true,
            };
      },
    });
  };
  var nativeStorageByKind: Dynamic = {};
  var scopedStorageByKind: Dynamic = {};
  ["localStorage", "sessionStorage"].forEach(function (
    this: Dynamic,
    storageKind?: Dynamic,
    ..._storageKindArgs: Dynamic[]
  ): Dynamic {
    var storage: Dynamic = null;
    try {
      storage = (window as Dynamic)[storageKind];
    } catch (value_e: Dynamic) {
      storage = null;
    }
    if (!storage || typeof storage.getItem !== "function") storage = createMemoryStorage();
    nativeStorageByKind[storageKind] = storage;
    scopedStorageByKind[storageKind] = scopeStorage(storage);
    try {
      (Object as Dynamic).defineProperty(window, storageKind, {
        value: scopedStorageByKind[storageKind],
        configurable: true,
      });
    } catch (value_e: Dynamic) {}
  });
  /* 'storage' events, the same view: a write to the namespace (another artboard, another tab) reaches the page's listeners
   * with its own key and the scoped store as storageArea; anything else on this origin (the editor's stash and prefs, a key
   * outside the namespace) is not the page's and does not reach them. Registered first and capturing, so it runs before any
   * listener the page adds, onstorage included. */
  try {
    (window as Dynamic).addEventListener(
      "storage",
      function (
        this: Dynamic,
        event?: Dynamic,
        ..._eventArgs: Dynamic[]
      ): Dynamic {
        if (!event.isTrusted)
          return; /* one the page dispatched itself (a same-window sync idiom): its own traffic, already in its own terms */
        var key: Dynamic = event.key;
        var scopedStorage: Dynamic =
          event.storageArea === nativeStorageByKind.localStorage
            ? scopedStorageByKind.localStorage
            : event.storageArea === nativeStorageByKind.sessionStorage
              ? scopedStorageByKind.sessionStorage
              : null;
        if (
          key === null ||
          (typeof key === "string" && key.indexOf(STORAGE_KEY_PREFIX) === 0)
        ) {
          /* a namespace key, or a whole-store clear (null): the page's, in its terms */
          try {
            (Object as Dynamic).defineProperties(event, {
              key: {
                value: key === null ? null : key.slice(STORAGE_KEY_PREFIX.length),
                configurable: true,
              },
              storageArea: {
                value: scopedStorage,
                configurable: true,
              },
            });
          } catch (value_x: Dynamic) {
            event.stopImmediatePropagation();
          }
          return;
        }
        event.stopImmediatePropagation();
      },
      true,
    );
  } catch (value_e: Dynamic) {}
})();
