/** Restored application module; prepare first, initialize in original order. */
import {
  type Dynamic,
} from "../runtime-types";
import { bootstrapArtifactApplication } from "./bootstrap";
import { loadDesignDocumentTree } from "./design-bootstrap";
import { claimCustomAnchors } from "../comments/host-controller";
import { initializeFastEdit } from "../fast-edit/bootstrap";
import { interceptSamplingCapability } from "../fast-edit/sampling-capability";

export function installApplicationMain(): () => void {
  return () => {
    (0, interceptSamplingCapability)();
    (0, initializeFastEdit)();
    (0, claimCustomAnchors)();
    (0, bootstrapArtifactApplication)({
      tree: loadDesignDocumentTree,
    });
  };
}
