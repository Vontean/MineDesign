import { artboardComponentName } from "../editor/html/dc-document";
import { artboardBootScheduler } from "./boot-scheduler";
import { reactCanvasShape } from "./shape";

interface PreviewBootMessage {
  rootName: string;
  mounted?: unknown;
  tellsErrors?: unknown;
  propsMeta?: unknown;
}

interface PreviewBootOptions {
  file: string;
  displayedGenerationRef: { current: number };
  clearErrors(): void;
  updateProperties(metadata: { rootName: string; propsMeta: unknown }): void;
  pushDirtyModel(): void;
}

export function usePreviewBootMessages(options: PreviewBootOptions) {
  const loadedGeneration = (0, reactCanvasShape.useRef)(-1);
  const checkedRootGeneration = (0, reactCanvasShape.useRef)(-1);
  const pushedGeneration = (0, reactCanvasShape.useRef)(-1);

  function acceptBoot(message: PreviewBootMessage) {
    const { file, displayedGenerationRef } = options;
    artboardBootScheduler.done(file);
    loadedGeneration.current = displayedGenerationRef.current;
    if (message.tellsErrors !== true) options.clearErrors();
    const expectedRoot = artboardComponentName(file);
    if (
      message.mounted === true &&
      message.rootName !== expectedRoot &&
      checkedRootGeneration.current !== displayedGenerationRef.current
    ) {
      checkedRootGeneration.current = displayedGenerationRef.current;
      console.error(
        '[design] artboard ' + file + ' booted as "' + message.rootName.slice(0, 80) +
        '", host pushes to "' + expectedRoot + '" — live edits will not render',
      );
    }
    options.updateProperties({ rootName: message.rootName, propsMeta: message.propsMeta ?? null });
    if (pushedGeneration.current !== displayedGenerationRef.current) {
      pushedGeneration.current = displayedGenerationRef.current;
      options.pushDirtyModel();
    }
  }

  return {
    acceptBoot,
    isLoaded: (generation: number) => loadedGeneration.current === generation,
  };
}
