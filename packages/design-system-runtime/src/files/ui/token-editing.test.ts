// @vitest-environment happy-dom
import { describe, expect, it, vi } from "vitest";

vi.mock("../../ui/disclosure", () => ({ reactArtifactRoot: { useMemo: (factory: () => unknown) => factory() } }));
vi.mock("@minedesign/contracts/ui-messages", () => ({ uiMessage: (key: string) => key }));
const notify = vi.fn();
vi.mock("../../editor/editable-name", () => ({ showEditorNotification: (m: string) => notify(m) }));
vi.mock("../../ui/announcements", () => ({ announceLiveMessage: vi.fn() }));
vi.mock("../../editor/view-model", () => ({ tokenGroupRenamePairs: () => [] }));
vi.mock("../../model/component-inference", () => ({ commonTokenNamePrefix: () => "", PALETTE_GROUP_NAME: "palette" }));
vi.mock("../../model/font-component-commands", () => ({ removeMissingFontReferences: vi.fn(), setComponentGuidelines: vi.fn() }));
vi.mock("../../model/tokens", () => ({ tokenNamesForFamily: () => [] }));
vi.mock("../../model/token-commands", () => ({
  clearColorThemeOverride: vi.fn(), deleteColorTokens: vi.fn(), deleteToken: vi.fn(() => "deleted"),
  renameColorTokensAtomically: vi.fn(), renameToken: vi.fn(() => "renamed"), setColorTokenUsage: vi.fn(),
  setColorTokenValue: vi.fn(), setScalarTokenValue: vi.fn(), setShadowTokenValue: vi.fn(), setTokenFamilyNote: vi.fn(),
  setTokenUsage: vi.fn(), setTypographyFontFamily: vi.fn(), setTypographyProperty: vi.fn(),
  setTypographyStyleUsage: vi.fn(), validateNewFontFamily: vi.fn(() => null),
}));
import { announceLiveMessage } from "../../ui/announcements";
import { useTokenEditors } from "./token-editing";

function setup(execResult: boolean, withEditable = true) {
  const exec = vi.fn((_label: string, mutate: (c: unknown) => unknown) => { mutate("content"); return execResult; });
  const editable = withEditable ? { exec, set: vi.fn(), seal: vi.fn() } : undefined;
  const announceUndoableChange = vi.fn(), setConfirmation = vi.fn();
  const tokenFlow = { openColor: vi.fn(), openScale: vi.fn() };
  const editors = useTokenEditors({
    editable, snapshot: { tokens: {} }, viewRef: { current: { colorGroups: [{ name: "brand", tokens: [{ name: "a" }] }] } },
    setConfirmation, focusTestId: vi.fn(), announceUndoableChange, getTokenFlow: () => tokenFlow,
  } as unknown as Parameters<typeof useTokenEditors>[0]);
  return { editors, exec, announceUndoableChange, setConfirmation, tokenFlow };
}

describe("useTokenEditors", () => {
  it("没有编辑权限时不提供任何编辑动作", () => {
    const { editors } = setup(true, false);
    expect(editors.colorEdit).toBeUndefined();
    expect(editors.spacingEdit).toBeUndefined();
    expect(editors.componentEdit).toBeUndefined();
    expect(editors.extraScaleEdit("x")).toBeUndefined();
  });

  it("删除成功才播报可撤销提示", () => {
    const ok = setup(true);
    ok.editors.colorEdit!.remove("c");
    expect(ok.announceUndoableChange).toHaveBeenCalledOnce();
    const failed = setup(false);
    failed.editors.colorEdit!.remove("c");
    expect(failed.announceUndoableChange).not.toHaveBeenCalled();
  });

  it("重命名返回命令是否生效", () => {
    expect(setup(true).editors.shadowEdit!.rename("a", "b")).toBe(true);
    expect(setup(false).editors.shadowEdit!.rename("a", "b")).toBe(false);
  });

  it("整组删除先走确认，确认后按当前视图的令牌执行", () => {
    const { editors, exec, setConfirmation, announceUndoableChange } = setup(true);
    editors.colorEdit!.removeGroup({ name: "brand", tokens: [{ name: "a" }] } as never);
    const confirmation = setConfirmation.mock.calls[0][0];
    expect(exec).not.toHaveBeenCalled();
    confirmation.run();
    expect(exec).toHaveBeenCalledOnce();
    expect(announceUndoableChange).toHaveBeenCalledOnce();
  });

  it("整组删除时分组已消失则只提示", () => {
    const { editors, exec, setConfirmation } = setup(true);
    editors.colorEdit!.removeGroup({ name: "gone", tokens: [{ name: "a" }] } as never);
    setConfirmation.mock.calls[0][0].run();
    expect(exec).not.toHaveBeenCalled();
    expect(notify).toHaveBeenCalled();
  });

  it("添加令牌对话框在动作触发时才读取，并只对额外刻度提供 add", () => {
    const { editors, tokenFlow } = setup(true);
    editors.colorEdit!.addTo({ name: "brand" } as never);
    expect(tokenFlow.openColor).toHaveBeenCalledWith("brand");
    editors.extraScaleEdit("k")!.add("group" as never);
    expect(tokenFlow.openScale).toHaveBeenCalledWith("group");
    expect(editors.spacingEdit).not.toHaveProperty("add");
  });

  it("丢弃缺失字体引用后播报", () => {
    const { editors } = setup(true);
    editors.typeEdit!.dropMissingFonts();
    expect(announceLiveMessage).toHaveBeenCalled();
  });
});
