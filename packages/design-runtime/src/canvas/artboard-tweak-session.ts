import type { Dynamic } from "../runtime-types";
import { equalPropValues, getPropCurrentValue, overridePropDefault } from "../editor/components/prop-validation";
import { useDcProps } from "../editor/components/use-dc-props";
import { artboardComponentName } from "../editor/html/dc-document";
import { reactCanvasShape } from "./shape";

interface ArtboardTweakSessionOptions {
  file: string;
  iframeRef: { current: HTMLIFrameElement | null };
  readyGeneration: number;
  canEditPreview: boolean;
  hasLoadState: boolean;
  readEditingSession(): Dynamic;
  onRow?(file: string, hasProps: boolean): void;
  onDirty?(file: string, saveDefaults: (() => Promise<void>) | null): void;
  onEdit?(file: string, previous: Record<string, unknown>, next: Record<string, unknown>, addHistory?: boolean): void;
}

/** Bridge component property changes, undo metadata and saving defaults. */
export function useArtboardTweakSession({
  file, iframeRef, readyGeneration, canEditPreview, hasLoadState, readEditingSession,
  onRow, onDirty, onEdit,
}: ArtboardTweakSessionOptions) {
  const tweaks = useDcProps({
    previewFrameRef: iframeRef,
    readyGen: readyGeneration,
    projectPath: "appifact",
    filePath: file,
    enabled: true,
    onWritten: (path: string, contents: string) =>
      readEditingSession().noteOwnWrite?.(artboardComponentName(path), contents),
  });
  (0, reactCanvasShape.useEffect)(() => {
    onRow?.(file, tweaks.hasProps);
  }, [file, tweaks.hasProps, onRow]);

  const saveDefaults = (0, reactCanvasShape.useCallback)(async () => {
    await tweaks.saveAsDefaults();
    try {
      await readEditingSession().adoptExternal?.(file);
    } catch {}
  }, [file, tweaks.saveAsDefaults]);
  (0, reactCanvasShape.useEffect)(() => {
    onDirty?.(file, canEditPreview && tweaks.dirty ? saveDefaults : null);
  }, [file, canEditPreview, tweaks.dirty, tweaks.values, saveDefaults, onDirty]);
  (0, reactCanvasShape.useEffect)(() => () => onDirty?.(file, null), [file, onDirty]);

  const tweakPropertiesRef = (0, reactCanvasShape.useRef)(tweaks);
  tweakPropertiesRef.current = tweaks;
  const editRef = (0, reactCanvasShape.useRef)(onEdit);
  editRef.current = onEdit;

  const setProperty = (0, reactCanvasShape.useCallback)((name: string, override: unknown) => {
    const current = tweakPropertiesRef.current;
    const previous = getPropCurrentValue(current, name);
    const next = override === undefined ? current.propsMeta[name]?.default : override;
    if (!equalPropValues(previous, next)) editRef.current?.(file, { [name]: previous }, { [name]: next });
    current.setProp(name, overridePropDefault(current, name, override));
  }, [file]);

  const resetProperties = (0, reactCanvasShape.useCallback)(() => {
    const current = tweakPropertiesRef.current;
    const previous: Record<string, unknown> = {};
    const defaults: Record<string, unknown> = {};
    for (const name of Object.keys(current.values)) {
      if (!(name in current.propsMeta)) continue;
      previous[name] = current.values[name];
      defaults[name] = current.propsMeta[name]?.default;
    }
    if (Object.keys(previous).length > 0) editRef.current?.(file, previous, defaults, false);
    current.reset();
  }, [file]);

  const setTweaks = (0, reactCanvasShape.useCallback)((overrides: Record<string, unknown>) => {
    const current = tweakPropertiesRef.current;
    for (const [name, value] of Object.entries(overrides)) {
      current.setProp(name, overridePropDefault(current, name, value));
    }
  }, []);

  return {
    tweakProperties: tweaks,
    tweakPropertiesRef,
    tweaksBridge: { ...tweaks, setProp: setProperty, reset: resetProperties, autoSavesDefaults: hasLoadState },
    setTweaks,
  };
}
