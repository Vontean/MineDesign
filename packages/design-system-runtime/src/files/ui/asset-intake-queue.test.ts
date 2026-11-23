// @vitest-environment happy-dom
import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("../../ui/disclosure", () => ({ reactArtifactRoot: { useRef: (current: unknown) => ({ current }) } }));
vi.mock("@minedesign/contracts/ui-messages", () => ({ uiMessage: (key: string) => key }));
vi.mock("../../editor/editable-name", () => ({ showEditorNotification: vi.fn() }));
vi.mock("../../model/file-policy", () => ({ DESIGN_SYSTEM_PATHS: { fontsDir: "fonts/", assetsDir: "assets/" } }));
vi.mock("../../model/asset-commands", () => ({ addAssetFile: vi.fn() }));
vi.mock("../../model/font-component-commands", () => ({ addFontFace: vi.fn() }));
vi.mock("../../editor/upload-pipeline", () => ({
  addedFilesSummary: () => "added", uploadedFilesBuildSummary: () => "built",
  countSuccessfulUploads: (result: { fonts: number }) => result.fonts,
  mergeAssetUploadResults: (_a: unknown, b: unknown) => b,
  uploadAssetFiles: async () => ({ fonts: 1, assets: {}, blobs: 0, refused: [], warnings: [] }),
  commitUploadedAssetChange: vi.fn(),
}));
import { useAssetIntakeQueue } from "./asset-intake-queue";

afterEach(() => vi.useRealTimers());

function setup(hadExistingEdits: boolean, saveMode: string) {
  const save = vi.fn(async () => undefined), seal = vi.fn(), outcomes = vi.fn();
  const setIntakeBusy = vi.fn();
  const system = { holdAutosave: false, setNote: vi.fn() };
  const appDocument = {
    dirty: () => hadExistingEdits, content: () => ({ files: {} }), saveMode: () => saveMode,
    saveState: () => ({ status: "saved" }), save,
  };
  const options = {
    editable: {}, editor: { seal }, applicationDocument: appDocument, system,
    intakeOptions: {}, currentSectionRef: { current: "type" }, uploadPanelVisibleRef: { current: false },
    getTokenDialog: () => null, setIntakeBusy, setIntakeProgress: vi.fn(),
    recordIntakeOutcome: vi.fn(), announceIntakeOutcome: outcomes, jumpToSection: vi.fn(),
  } as unknown as Parameters<typeof useAssetIntakeQueue>[0];
  return { addFiles: useAssetIntakeQueue(options)!, save, seal, outcomes, system, setIntakeBusy };
}

describe("asset intake queue", () => {
  it("keeps pre-existing manual edits unsaved and releases the autosave hold", async () => {
    vi.useFakeTimers();
    const { addFiles, save, seal, outcomes, system } = setup(true, "manual");
    expect(addFiles([{} as File])).toBe(true);
    expect(system.holdAutosave).toBe(true);
    await vi.runAllTimersAsync();
    expect(outcomes).toHaveBeenCalledWith(expect.objectContaining({ fonts: 1 }), false, false);
    expect(save).not.toHaveBeenCalled();
    expect(seal).not.toHaveBeenCalled();
    expect(system.holdAutosave).toBe(false);
  });

  it("seals and saves when there were no earlier edits, then releases the hold", async () => {
    vi.useFakeTimers();
    const { addFiles, save, seal, outcomes, system, setIntakeBusy } = setup(false, "manual");
    expect(addFiles([{} as File])).toBe(true);
    await vi.runAllTimersAsync();
    expect(outcomes).toHaveBeenCalledWith(expect.objectContaining({ fonts: 1 }), true, false);
    expect(seal).toHaveBeenCalledTimes(1);
    expect(save).toHaveBeenCalledTimes(1);
    expect(system.holdAutosave).toBe(false);
    expect(setIntakeBusy).toHaveBeenLastCalledWith(false);
  });
});
