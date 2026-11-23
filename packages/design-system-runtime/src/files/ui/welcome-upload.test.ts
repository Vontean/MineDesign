// @vitest-environment happy-dom
import { describe, expect, it, vi } from "vitest";

// 简易 Hook 宿主：state 按调用顺序存放，render 之间保留；effect 不执行（本测试只验证面板动作）。
const slots: unknown[] = [];
let cursor = 0;
vi.mock("../../ui/disclosure", () => ({
  reactArtifactRoot: {
    useState: (initial: unknown) => {
      const i = cursor++;
      if (!(i in slots)) slots[i] = initial;
      return [slots[i], (next: unknown) => { slots[i] = typeof next === "function" ? (next as (v: unknown) => unknown)(slots[i]) : next; }];
    },
    useRef: (initial: unknown) => {
      const i = cursor++;
      if (!(i in slots)) slots[i] = { current: initial };
      return slots[i];
    },
    useEffect: () => undefined,
  },
}));
vi.mock("@minedesign/contracts/ui-messages", () => ({ uiMessage: (key: string) => key }));
const notify = vi.fn();
vi.mock("../../editor/editable-name", () => ({ showEditorNotification: (m: string) => notify(m) }));
vi.mock("../../editor/asset-upload", () => ({ isIgnoredUploadFile: () => false, uploadedFileRelativePath: (f: File) => f.name }));
vi.mock("../../editor/claude-prompts", () => ({
  artifactPageAddress: () => "page", ownerBuildFromFilesPrompt: () => "owner", viewerBuildFromFilesPrompt: () => "viewer",
}));
vi.mock("../../editor/edit-dispatch", () => ({ performDesignSystemEdit: vi.fn() }));
vi.mock("../../editor/upload-pipeline", () => ({
  countSuccessfulUploads: (s: { fonts: number }) => s.fonts,
  uploadedAssetFile: (f: File) => ({ name: f.name }),
  uploadResultSummary: (_s: unknown, quiet: boolean) => (quiet ? null : { text: "done" }),
}));
vi.mock("../../model/file-policy", () => ({ DESIGN_SYSTEM_PATHS: { fontsDir: "fonts/", assetsDir: "assets/" } }));
vi.mock("../../model/asset-commands", () => ({ deleteAssetFile: vi.fn() }));
vi.mock("../../model/font-component-commands", () => ({ deleteFontFace: vi.fn() }));
import { useWelcomeUpload } from "./welcome-upload";

function render(section: string, addFiles: (items: File[]) => boolean) {
  cursor = 0;
  const jumpToSection = vi.fn(), askClaude = vi.fn();
  const api = useWelcomeUpload({
    editable: {}, editor: { seal: vi.fn() }, applicationDocument: { dirty: () => false },
    system: { holdAutosave: false }, currentSection: section, filesSnapshot: {}, uploadOptionLabel: "upload",
    jumpToSection, askClaude, noticeWithAction: vi.fn(),
    getAddFiles: () => addFiles, getFileHandoffAction: () => () => () => undefined,
  } as unknown as Parameters<typeof useWelcomeUpload>[0]);
  return { api, jumpToSection, askClaude };
}
const file = (name: string, size = 1) => ({ name, size } as File);

describe("welcome upload panel", () => {
  it("queues only new, de-duplicated files and opens the panel", () => {
    slots.length = 0;
    const addFiles = vi.fn(() => true);
    render("readme", addFiles).api.addWelcomeFiles([file("a.png"), file("a.png"), file("b.png")]);
    expect(addFiles).toHaveBeenCalledWith([expect.objectContaining({ name: "a.png" }), expect.objectContaining({ name: "b.png" })], undefined, true);
    const next = render("readme", addFiles).api;
    expect(next.uploadPanelOpen).toBe(true);
    expect(next.intakeFiles).toHaveLength(2);
    next.addWelcomeFiles([file("a.png")]);
    expect(addFiles).toHaveBeenCalledTimes(1);
  });

  it("keeps the panel closed when the queue refuses the batch (saving in progress)", () => {
    slots.length = 0;
    render("readme", () => false).api.addWelcomeFiles([file("a.png")]);
    expect(render("readme", () => false).api.uploadPanelOpen).toBe(false);
  });

  it("records refused names and landing section, then returns to it on back", () => {
    slots.length = 0;
    const { api } = render("readme", () => true);
    api.recordIntakeOutcome({ fonts: 1, assets: {}, blobs: 0, refused: [{ name: "x.exe" }], warnings: [] } as never, new Map());
    const { api: after, jumpToSection } = render("readme", () => true);
    expect(after.refusedUploadNames).toEqual(["x.exe"]);
    after.backFromUpload();
    expect(jumpToSection).toHaveBeenCalledWith("type");
  });

  it("removing a refused file drops its name; removing the last file closes the panel", () => {
    slots.length = 0;
    const addFiles = () => true;
    render("readme", addFiles).api.addWelcomeFiles([file("x.exe")]);
    render("readme", addFiles).api.recordIntakeOutcome({ fonts: 0, assets: {}, blobs: 0, refused: [{ name: "x.exe" }], warnings: [] } as never, new Map());
    render("readme", addFiles).api.removeWelcomeFile(0);
    const after = render("readme", addFiles).api;
    expect(after.intakeFiles).toHaveLength(0);
    expect(after.refusedUploadNames).toEqual([]);
    expect(after.uploadPanelOpen).toBe(false);
  });

  it("stays quiet for clean panel uploads while the panel is visible, otherwise notifies", () => {
    slots.length = 0;
    notify.mockClear();
    const addFiles = () => true;
    render("readme", addFiles).api.addWelcomeFiles([file("a.png")]);
    const summary = { fonts: 1, assets: {}, blobs: 0, refused: [], warnings: [] } as never;
    render("readme", addFiles).api.announceIntakeOutcome(summary, true, true);
    expect(notify).not.toHaveBeenCalled();
    render("type", addFiles).api.announceIntakeOutcome(summary, false, true);
    expect(notify).toHaveBeenCalledWith("done");
  });

  it("creating from files asks the agent once and resets the panel", () => {
    slots.length = 0;
    const addFiles = () => true;
    render("readme", addFiles).api.addWelcomeFiles([file("a.png")]);
    const { api, askClaude } = render("readme", addFiles);
    api.createFromWelcomeFiles(api.intakeFiles);
    expect(askClaude).toHaveBeenCalledTimes(1);
    const after = render("readme", addFiles).api;
    expect(after.uploadPanelOpen).toBe(false);
    expect(after.intakeFiles).toHaveLength(0);
  });
});
