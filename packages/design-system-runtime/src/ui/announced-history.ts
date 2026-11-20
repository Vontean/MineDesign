/** Restored application module; prepare first, initialize in original order. */
import type * as React from "react";
import type { AnnounceHistory } from "../contracts/composition";
import { announceLiveMessage } from "./announcements";
import { get_REDO_UNAVAILABLE_LABEL, get_UNDO_UNAVAILABLE_LABEL, REDO_COMPLETE_LABEL, UNDO_COMPLETE_LABEL } from "./property-labels";

function createAnnouncedHistory<Command, Seed>(
  history: AnnounceHistory<Command, Seed>,
  announce: (message: string) => void = announceLiveMessage,
) {
  return {
    exec: (command: Command) => history.exec(command),
    seed: (seed: Seed) => history.seed(seed),
    undo() {
      if (!history.canUndo()) {
        announce(get_UNDO_UNAVAILABLE_LABEL());
        return;
      }
      let value = history.redoDepth();
      history.undo();
      if (history.redoDepth() === value + 1) {
        announce(UNDO_COMPLETE_LABEL);
      }
    },
    redo() {
      if (!history.canRedo()) {
        announce(get_REDO_UNAVAILABLE_LABEL());
        return;
      }
      let value = history.redoDepth();
      history.redo();
      if (history.redoDepth() === value - 1) {
        announce(REDO_COMPLETE_LABEL);
      }
    },
    canUndo: () => history.canUndo(),
    canRedo: () => history.canRedo(),
    redoDepth: () => history.redoDepth(),
    clear: () => history.clear(),
    subscribe: (listener: () => void) => history.subscribe(listener),
  };
}
export {
  createAnnouncedHistory,
};
export function installUiAnnouncedHistory(): () => void {
  return () => {};
}
