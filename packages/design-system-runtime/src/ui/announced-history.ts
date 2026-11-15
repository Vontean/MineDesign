/** Restored application module; prepare first, initialize in original order. */
import type * as React from "react";
import type { AnnounceHistory } from "../contracts/composition";
import { announceLiveMessage } from "./announcements";
import { get_REDO_UNAVAILABLE_LABEL, get_UNDO_UNAVAILABLE_LABEL, REDO_COMPLETE_LABEL, UNDO_COMPLETE_LABEL } from "./property-labels";

function createAnnouncedHistory<Command, Seed>(
  history2: AnnounceHistory<Command, Seed>,
  announce: (message: string) => void = announceLiveMessage,
) {
  return {
    exec: (input: Command) => history2.exec(input),
    seed: (input: Seed) => history2.seed(input),
    undo() {
      if (!history2.canUndo()) {
        announce(get_UNDO_UNAVAILABLE_LABEL());
        return;
      }
      let value = history2.redoDepth();
      history2.undo();
      if (history2.redoDepth() === value + 1) {
        announce(UNDO_COMPLETE_LABEL);
      }
    },
    redo() {
      if (!history2.canRedo()) {
        announce(get_REDO_UNAVAILABLE_LABEL());
        return;
      }
      let value = history2.redoDepth();
      history2.redo();
      if (history2.redoDepth() === value - 1) {
        announce(REDO_COMPLETE_LABEL);
      }
    },
    canUndo: () => history2.canUndo(),
    canRedo: () => history2.canRedo(),
    redoDepth: () => history2.redoDepth(),
    clear: () => history2.clear(),
    subscribe: (input: () => void) => history2.subscribe(input),
  };
}
export {
  createAnnouncedHistory,
};
export function installUiAnnouncedHistory(): () => void {
  return () => {};
}
