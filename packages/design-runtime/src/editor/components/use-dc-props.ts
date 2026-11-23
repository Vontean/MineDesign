/** Restored application module; prepare first, initialize in original order. */
import {
  type Dynamic,
} from "../../runtime-types";
import { adoptComponentPropDefaults, cacheUnsavedComponentProp, clearUnsavedComponentProps, reactComponentsPropCache } from "./prop-cache";
import { emptyDcPropsState, equalPropValues, isEditablePropMetadata, normalizePropString, normalizePropValues, omitUnchangedProps, parsePropsMetadata } from "./prop-validation";
import { applyComponentPropDefaults } from "./props";
import { getDcPropsJson, setDcPropsJson } from "../html/dc-props";
import { markLocalFileChange } from "../model/file-echoes";
import { projectFilesystem } from "../../platform/file-content";
import { createPreviewHandle } from "../../preview/evaluation";

function useDcProps(hookOptions?: Dynamic): Dynamic {
  let {
      previewFrameRef: previewFrameRef,
      readyGen: readyGen,
      projectPath: projectPath,
      filePath: filePath,
      enabled: enabled,
    }: Dynamic = hookOptions,
    [propsMeta, setPropsMeta]: Dynamic = (0,
    reactComponentsPropCache.useState)({}),
    propsMetaRef: Dynamic = (0, reactComponentsPropCache.useRef)(propsMeta);
  propsMetaRef.current = propsMeta;
  let [rootName, setRootName]: Dynamic = (0,
    reactComponentsPropCache.useState)(null),
    [bootCount, setBootCount]: Dynamic = (0,
    reactComponentsPropCache.useState)(0),
    [draftValues, setDraftValues]: Dynamic = (0,
    reactComponentsPropCache.useState)({}),
    [isSaving, setIsSaving]: Dynamic = (0,
    reactComponentsPropCache.useState)(false),
    enabledRef: Dynamic = (0, reactComponentsPropCache.useRef)(enabled);
  enabledRef.current = enabled;
  let bootCountRef: Dynamic = (0, reactComponentsPropCache.useRef)(
    bootCount,
  );
  bootCountRef.current = bootCount;
  let handleDcBooted: Dynamic = (0, reactComponentsPropCache.useCallback)(
    (bootInfo?: Dynamic): Dynamic => {
      if (!enabledRef.current) return;
      let normalizedRootName: Dynamic = normalizePropString(
        bootInfo.rootName,
      );
      setRootName(normalizedRootName);
      propsMetaRef.current = normalizedRootName
        ? parsePropsMetadata(bootInfo.propsMeta)
        : {};
      setPropsMeta(propsMetaRef.current);
      setBootCount((count?: Dynamic): Dynamic => count + 1);
    },
    [],
  );
  (0, reactComponentsPropCache.useEffect)((): Dynamic => {
    if (!enabled || readyGen === 0) {
      propsMetaRef.current = {};
      setPropsMeta({});
      setRootName(null);
      return;
    }
    let previewHandle: Dynamic = createPreviewHandle(previewFrameRef.current);
    if (!previewHandle) return;
    let isCancelled: Dynamic = false,
      bootCountAtStart: Dynamic = bootCountRef.current,
      retryTimer: Dynamic = null,
      pollRegistry: Dynamic = (): Dynamic => {
        isCancelled ||
          bootCountRef.current !== bootCountAtStart ||
          previewHandle
            .executeJavaScript(
              "(function(){try{if(!window.__dcRootName)return null;var n=window.__dcRootName();var r=window.__dcRegistry&&window.__dcRegistry[n];if(!r)return null;return JSON.stringify({n:n,p:r.propsMeta||null})}catch(e){return null}})()",
            )
            .then((registryJson?: Dynamic): Dynamic => {
              if (isCancelled || bootCountRef.current !== bootCountAtStart) return;
              if (typeof registryJson != "string") {
                retryTimer = setTimeout(pollRegistry, 1e3);
                return;
              }
              let registry: Dynamic = JSON.parse(registryJson);
              handleDcBooted({
                rootName: registry.n,
                propsMeta: registry.p,
              });
            })
            .catch((): Dynamic => {
              !isCancelled &&
                bootCountRef.current === bootCountAtStart &&
                (retryTimer = setTimeout(pollRegistry, 1e3));
            });
      };
    retryTimer = setTimeout(pollRegistry, 1500);
    return (): Dynamic => {
      isCancelled = true;
      retryTimer !== null && clearTimeout(retryTimer);
    };
  }, [enabled, readyGen, previewFrameRef, handleDcBooted]);
  (0, reactComponentsPropCache.useEffect)((): Dynamic => {
    setDraftValues({});
    propsMetaRef.current = {};
    setPropsMeta({});
    setRootName(null);
    setBootCount(0);
  }, [filePath]);
  let draftValuesRef: Dynamic = (0, reactComponentsPropCache.useRef)(
    draftValues,
  );
  draftValuesRef.current = draftValues;
  (0, reactComponentsPropCache.useEffect)((): Dynamic => {
    if (!enabled || bootCount === 0 || !rootName) return;
    let previewHandle: Dynamic = createPreviewHandle(previewFrameRef.current);
    if (!previewHandle) return;
    let state: Dynamic = {};
    for (let [propName, meta] of Object.entries(propsMetaRef.current) as Dynamic)
      isEditablePropMetadata(meta) &&
        meta.default !== undefined &&
        (state[propName] = meta.default);
    for (let [propName, draftValue] of Object.entries(draftValuesRef.current) as Dynamic)
      propName in propsMetaRef.current && (state[propName] = draftValue);
    let propsPayload: Dynamic = Object.keys(state).length
      ? JSON.stringify(state)
      : "null";
    previewHandle.executeJavaScriptUnchecked(
      `window.__dcSetProps&&window.__dcSetProps(${JSON.stringify(rootName)},${propsPayload})`,
    );
  }, [enabled, bootCount, rootName, draftValues, previewFrameRef]);
  let locationRef: Dynamic = (0, reactComponentsPropCache.useRef)({
    projectPath: projectPath,
    filePath: filePath,
  });
  locationRef.current = {
    projectPath: projectPath,
    filePath: filePath,
  };
  let isSavingRef: Dynamic = (0, reactComponentsPropCache.useRef)(false),
    readIsSaving: Dynamic = (0, reactComponentsPropCache.useCallback)(
      (): Dynamic => isSavingRef.current,
      [],
    ),
    readCurrentDefault: Dynamic = (0, reactComponentsPropCache.useCallback)(
      (propName?: Dynamic): Dynamic => propsMetaRef.current[propName]?.default,
      [],
    ),
    setProp: Dynamic = (0, reactComponentsPropCache.useCallback)(
      (propName?: Dynamic, propValue?: Dynamic): Dynamic => {
        let { projectPath: currentProject, filePath: currentFile }: Dynamic =
          locationRef.current;
        currentProject &&
          currentFile &&
          cacheUnsavedComponentProp(
            currentProject,
            currentFile,
            propName,
            propValue,
          );
        setDraftValues((previousDrafts?: Dynamic): Dynamic => {
          if (propValue === undefined) {
            if (!(propName in previousDrafts)) return previousDrafts;
            let state: Dynamic = {
              ...previousDrafts,
            };
            delete state[propName];
            return state;
          }
          return {
            ...previousDrafts,
            [propName]: propValue,
          };
        });
      },
      [],
    ),
    resetProps: Dynamic = (0,
    reactComponentsPropCache.useCallback)((): Dynamic => {
      let { projectPath: currentProject, filePath: currentFile }: Dynamic =
        locationRef.current;
      currentProject &&
        currentFile &&
        clearUnsavedComponentProps(currentProject, currentFile);
      setDraftValues({});
    }, []),
    hasProps: Dynamic = (0, reactComponentsPropCache.useMemo)(
      (): Dynamic =>
        Object.values(propsMeta).some(isEditablePropMetadata),
      [propsMeta],
    ),
    isDirty: Dynamic = (0,
    reactComponentsPropCache.useMemo)((): Dynamic => {
      for (let [propName, draftValue] of Object.entries(draftValues) as Dynamic)
        if (
          propName in propsMeta &&
          !equalPropValues(propsMeta[propName]?.default, draftValue)
        )
          return true;
      return false;
    }, [draftValues, propsMeta]),
    onAdoptedRef: Dynamic = (0, reactComponentsPropCache.useRef)(
      hookOptions.onAdopted,
    );
  onAdoptedRef.current = hookOptions.onAdopted;
  let onWrittenRef: Dynamic = (0, reactComponentsPropCache.useRef)(
    hookOptions.onWritten,
  );
  onWrittenRef.current = hookOptions.onWritten;
  let saveAsDefaults: Dynamic = (0,
    reactComponentsPropCache
      .useCallback)(async (): Promise<Dynamic> => {
      let { projectPath: currentProject, filePath: currentFile }: Dynamic =
        locationRef.current;
      if (!currentProject || !currentFile) return;
      isSavingRef.current = true;
      setIsSaving(true);
      let undoWriteEcho: Dynamic;
      try {
        let fullPath: Dynamic = `${currentProject}/${currentFile}`,
          fileRead: Dynamic = projectFilesystem.readFileWithVersion
            ? await projectFilesystem.readFileWithVersion(fullPath)
            : {
                content: await projectFilesystem.readFile(fullPath),
                version: undefined,
              },
          content: Dynamic = fileRead.content,
          propsJson: Dynamic = getDcPropsJson(content);
        if (propsJson == null) {
          console.error(
            "[dc-props] could not read data-props from",
            currentFile,
          );
          return;
        }
        let parsedProps: Dynamic;
        try {
          parsedProps = JSON.parse(propsJson);
        } catch {
          console.error(
            "[dc-props] data-props is not valid JSON in",
            currentFile,
          );
          return;
        }
        if (
          parsedProps == null ||
          typeof parsedProps != "object" ||
          Array.isArray(parsedProps)
        ) {
          console.error(
            "[dc-props] data-props is not an object in",
            currentFile,
          );
          return;
        }
        let nextProps: Dynamic = parsedProps,
          propsMetaSnapshot: Dynamic = propsMetaRef.current,
          state: Dynamic = {
            ...draftValuesRef.current,
          };
        for (let [propName, draftValue] of Object.entries(state) as Dynamic) {
          if (!(propName in propsMetaSnapshot)) continue;
          let baseMeta: Dynamic = nextProps[propName] ?? propsMetaSnapshot[propName],
            metaRecord: Dynamic =
              baseMeta && typeof baseMeta == "object" && !Array.isArray(baseMeta)
                ? baseMeta
                : {};
          nextProps[propName] = {
            ...metaRecord,
            default: draftValue,
          };
        }
        let newContent: Dynamic = setDcPropsJson(
          content,
          JSON.stringify(nextProps),
        );
        if (newContent == null) {
          console.error(
            "[dc-props] could not splice data-props in",
            currentFile,
          );
          return;
        }
        fileRead.version !== undefined &&
          !fileRead.isBase64 &&
          onAdoptedRef.current?.(currentFile, fileRead.version, content);
        undoWriteEcho = onWrittenRef.current?.(currentFile, newContent);
        await projectFilesystem.writeFile(fullPath, newContent);
        undoWriteEcho = undefined;
        markLocalFileChange(currentProject, currentFile);
        let knownDefaults: Dynamic = {};
        for (let [propName, draftValue] of Object.entries(state) as Dynamic)
          propName in propsMetaSnapshot && (knownDefaults[propName] = draftValue);
        adoptComponentPropDefaults(currentProject, currentFile, knownDefaults);
        locationRef.current.projectPath === currentProject &&
          locationRef.current.filePath === currentFile &&
          ((propsMetaRef.current = applyComponentPropDefaults(
            propsMetaRef.current,
            state,
          )),
          setPropsMeta(
            (previousMeta?: Dynamic): Dynamic =>
              applyComponentPropDefaults(previousMeta, state),
          ),
          setDraftValues(
            (previousDrafts?: Dynamic): Dynamic =>
              omitUnchangedProps(previousDrafts, knownDefaults),
          ));
      } catch (error: Dynamic) {
        undoWriteEcho?.();
        console.error("[dc-props] save as defaults failed:", error);
      } finally {
        isSavingRef.current = false;
        setIsSaving(false);
      }
    }, []),
    adoptSavedDefaults: Dynamic = (0, reactComponentsPropCache.useCallback)(
      (savedValues?: Dynamic): Dynamic => {
        let propsMetaSnapshot: Dynamic = propsMetaRef.current,
          normalizedValues: Dynamic = normalizePropValues(savedValues),
          state: Dynamic = {};
        for (let [propName, propValue] of Object.entries(normalizedValues) as Dynamic)
          Object.hasOwn(propsMetaSnapshot, propName) && (state[propName] = propValue);
        if (Object.keys(state).length === 0) return;
        let { projectPath: currentProject, filePath: currentFile }: Dynamic =
          locationRef.current;
        currentProject &&
          currentFile &&
          adoptComponentPropDefaults(currentProject, currentFile, state);
        propsMetaRef.current = applyComponentPropDefaults(
          propsMetaRef.current,
          state,
        );
        setPropsMeta(
          (previousMeta?: Dynamic): Dynamic =>
            applyComponentPropDefaults(previousMeta, state),
        );
        setDraftValues(
          (previousDrafts?: Dynamic): Dynamic =>
            omitUnchangedProps(previousDrafts, state),
        );
      },
      [],
    );
  return enabled
    ? {
        booted: bootCount > 0,
        hasProps: hasProps,
        lifecycleCallbacks: {
          onDcBooted: handleDcBooted,
        },
        propsMeta: propsMeta,
        values: draftValues,
        setProp: setProp,
        reset: resetProps,
        dirty: isDirty,
        saveAsDefaults: saveAsDefaults,
        adoptSavedDefaults: adoptSavedDefaults,
        saving: isSaving,
        isSaving: readIsSaving,
        currentDefault: readCurrentDefault,
      }
    : emptyDcPropsState;
}
export {
  useDcProps,
};
export function installEditorComponentsUseDcProps(): () => void {
  return () => {};
}
