import { uiMessage } from '@minedesign/contracts/ui-messages';
/** Restored application module; prepare first, initialize in original order. */
import {
  bindRuntimeValue,
  type Dynamic,
  type RuntimeBindings,
} from "../../runtime-types";

export function installEditorSessionErrors(
  runtime: RuntimeBindings,
): () => void {
  var SessionBusyError: Dynamic;
  var UnsettledEditsError: Dynamic;

  bindRuntimeValue(
    runtime,
    "SessionBusyError",
    () => SessionBusyError,
    (value) => {
      SessionBusyError = value;
    },
  );
  bindRuntimeValue(
    runtime,
    "UnsettledEditsError",
    () => UnsettledEditsError,
    (value) => {
      UnsettledEditsError = value;
    },
  );
  return () => {
    SessionBusyError = class extends Error {
      declare name: Dynamic;
      constructor() {
        super(uiMessage("inspector.errors.anOpenDialogOwnsThe"));
        this.name = "SessionBusyError";
      }
    };
    UnsettledEditsError = class extends Error {
      declare name: Dynamic;
      constructor() {
        super(uiMessage("inspector.errors.someEditsCouldNotBe"));
        this.name = "SettleIncompleteError";
      }
    };
  };
}
