/** Restored application module; prepare first, initialize in original order. */
import {
  type Dynamic,
} from "../../runtime-types";
import { modelSelectionIdentityGuard, relocateModelElementIds } from "./selection-relocation";

function adoptModelAndRelocateSelection(adoption?: Dynamic): Dynamic {
  let relocateSelection: Dynamic = null,
    ownedModel: Dynamic;
  try {
    adoption.adopt();
    ownedModel = adoption.own();
    if (ownedModel === undefined || ownedModel === adoption.prev) return;
    let prev: Dynamic = adoption.prev,
      ownedModelSnapshot: Dynamic = ownedModel;
    prev &&
      (relocateSelection = (ids?: Dynamic): Dynamic =>
        relocateModelElementIds(prev, ownedModelSnapshot, ids));
  } catch (relocationError: Dynamic) {
    adoption.log("the selection could not be followed and is dropped", relocationError);
  }
  try {
    adoption.pending.drop();
    let ownedModelSnapshot: Dynamic = ownedModel;
    adoption.tellHost(
      relocateSelection,
      !ownedModelSnapshot || adoption.heldElsewhere()
        ? null
        : (ids?: Dynamic, armOptions?: Dynamic): Dynamic =>
            adoption.pending.arm(
              armOptions,
              modelSelectionIdentityGuard(ownedModelSnapshot, ids),
            ),
    );
  } catch (hostError: Dynamic) {
    adoption.log("the host could not correct its selection", hostError);
  }
}
export {
  adoptModelAndRelocateSelection,
};
export function installEditorModelAdoption(): () => void {
  return () => {};
}
