import { uiMessage } from '@minedesign/contracts/ui-messages';
/** Restored application module; prepare first, initialize in original order. */
import {
  type Dynamic,
} from "../../runtime-types";

var SessionBusyError: Dynamic;
var UnsettledEditsError: Dynamic;
export {
  SessionBusyError,
  UnsettledEditsError,
};
export function installEditorSessionErrors(): () => void {
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
