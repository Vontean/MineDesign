import { beforeAll, describe, expect, it, vi } from "vitest";
import { installPlatformDocumentValues } from "./document-values";
import { installPlatformFileContent } from "./file-content";
import { installPlatformIndexMerge } from "./index-merge";
import { installPlatformProjectPaths } from "./project-paths";
import { installPlatformSha256, PlatformSha256Encode, sha256Fallback } from "./sha256";
import { installEditorModelHistoryRebase } from "../editor/model/history-rebase";
import { installEditorModelThreeWayMerge } from "../editor/model/three-way-merge";
import { createBoardClashes } from "./board-clash";

// 路径、哈希与合并函数由各模块的初始化函数提供，顺序与应用启动一致
beforeAll(() => {
  installPlatformDocumentValues()();
  installPlatformFileContent()();
  installPlatformProjectPaths()();
  installPlatformSha256()();
  installPlatformIndexMerge()();
  installEditorModelHistoryRebase()();
  installEditorModelThreeWayMerge()();
});

const BOARD = "home.dc.html";
const PATH = "project/" + BOARD;
const sha = (text: string) => sha256Fallback(PlatformSha256Encode(text));

/** 用真实集合和可替换的远端内容搭一个最小宿主。 */
function setup(options: Record<string, unknown> = {}, initialFiles: Record<string, string> = { [BOARD]: "mine" }) {
  const timerQueue: { run: () => void; delay: number }[] = [];
  let clock = 1000;
  const timers = {
    now: () => clock,
    setTimeout: (run: () => void, delay: number) => {
      const entry = { run, delay };
      timerQueue.push(entry);
      return entry;
    },
    clearTimeout: (entry: unknown) => {
      const index = timerQueue.indexOf(entry as never);
      if (index >= 0) timerQueue.splice(index, 1);
    },
  };
  const remote: Record<string, string> = {};
  const notices: string[] = [];
  const offers: any[] = [];
  const holdSet = new Set<string>();
  const host: any = {
    state: { title: "t", content: { files: { ...initialFiles } } },
    loadedFiles: { ...initialFiles },
    savedFiles: { [BOARD]: "base" },
    disposed: false,
  };
  const liveHashes = new Map<string, string | null>([[PATH, "base-sha"]]);
  const publishedHashes = new Map<string, string | null>();
  const publisher = { withdraw: vi.fn(), resolveConflict: vi.fn() };
  const indexBoards: Record<string, unknown> = { [BOARD]: { x: 10, y: 20, w: 800, h: 600 } };
  const index: any = { boards: indexBoards, order: [BOARD] };
  const adoptRemoteFiles = vi.fn((files: any) => {
    host.state = { ...host.state, content: { files } };
  });
  const handleRemoteUpdate = vi.fn();
  const scheduleLocalSave = vi.fn();
  const replaceDocument = vi.fn((next: any) => {
    host.state = next;
  });
  const clashes = createBoardClashes({
    documentOptions: { onBoardClash: (offer: any) => offers.push(offer), ...options },
    timers,
    liveHashes,
    publishedHashes,
    fileDirtyVersions: new Map(),
    knownArtboardFiles: new Set(),
    undoHistory: [],
    get disposed() { return host.disposed; },
    get state() { return host.state; },
    get loadedFiles() { return host.loadedFiles; },
    get savedFiles() { return host.savedFiles; },
    get publisher() { return publisher; },
    get indexState() {
      return {
        get: () => index,
        update: (edit: (value: any) => void) => edit(index),
      };
    },
    bootMaxAttempts: 6,
    bootMaxWaitMs: 15000,
    restartDelayMs: 5000,
    notice: (message?: string) => void notices.push(message as string),
    portVersion: () => ({ version: "v1" }),
    readFiles: async (paths: string[]) => Object.fromEntries(paths.filter((p: string) => p in remote).map((p: string) => [p, remote[p]])),
    adoptRemoteFiles,
    replaceDocument,
    scheduleLocalSave,
    handleRemoteUpdate,
    shouldHoldRemoteFile: (path: string) => holdSet.has(path),
    hasUnsavedFileEdits: (path: string) => host.state.content.files[path] !== host.loadedFiles[path],
    describeIndexMergeConflict: () => "index merge",
    describeSamePropertyConflict: () => "same property",
  } as never);
  return { clashes, host, remote, notices, offers, holdSet, liveHashes, publishedHashes, publisher, adoptRemoteFiles, handleRemoteUpdate, scheduleLocalSave, replaceDocument, timerQueue, index, advance: (ms: number) => void (clock += ms) };
}

describe("同名画板冲突：识别与提示", () => {
  it("对方删除了我正在改的画板：登记冲突并弹出提示，不动本地内容", async () => {
    const t = setup();
    await t.clashes.handleBoardClash(PATH, null, "remote-while-editing");
    expect(t.clashes.hasClash(BOARD)).toBe(true);
    expect(t.offers).toHaveLength(1);
    expect(t.offers[0]).toMatchObject({ file: BOARD, deleted: true });
    expect(t.adoptRemoteFiles).not.toHaveBeenCalled();
    expect(t.host.state.content.files[BOARD]).toBe("mine");
  });

  it("冲突期间再收到远端变化只更新对方版本，不重复弹提示", async () => {
    const t = setup();
    await t.clashes.handleBoardClash(PATH, null, "remote-while-editing");
    expect(t.clashes.noteRemoteVersion(BOARD, "sha-2")).toBe(true);
    t.publishedHashes.set(PATH, "sha-3");
    await t.clashes.handleBoardClash(PATH, "sha-3", "remote-while-editing");
    expect(t.offers).toHaveLength(1);
    expect(t.offers[0].deleted).toBe(false);
    expect(t.clashes.noteRemoteVersion("other.dc.html", "x")).toBe(false);
  });

  it("提示 20 秒后仍未处理会重新弹出，之前不会", async () => {
    const t = setup();
    await t.clashes.handleBoardClash(PATH, null, "remote-while-editing");
    t.advance(19000);
    t.clashes.remindStalePrompt(BOARD);
    expect(t.offers).toHaveLength(1);
    t.advance(2000);
    t.clashes.remindStalePrompt(BOARD);
    expect(t.offers).toHaveLength(2);
  });

  it("没有 onBoardClash 回调时直接采用远端并通知", async () => {
    const t = setup({ onBoardClash: undefined });
    await t.clashes.handleBoardClash(PATH, null, "remote-while-editing");
    await Promise.resolve();
    expect(t.clashes.hasClash(BOARD)).toBe(false);
    expect(t.adoptRemoteFiles).toHaveBeenCalledOnce();
    expect(t.notices[0]).toContain("was changed by someone else");
  });
});

describe("同名画板冲突：用户的选择", () => {
  it("采用对方：写入远端文件、清除冲突并不再提示", async () => {
    const t = setup();
    t.remote[BOARD] = "theirs";
    t.publishedHashes.set(PATH, sha("theirs"));
    await t.clashes.handleBoardClash(PATH, sha("theirs"), "remote-while-editing");
    // 默认规则下三方合并因缺少共同祖先文本无法折叠，会走提示
    expect(t.offers).toHaveLength(1);
    t.offers[0].takeTheirs();
    await vi.waitFor(() => expect(t.adoptRemoteFiles).toHaveBeenCalled());
    expect(t.host.state.content.files[BOARD]).toBe("theirs");
    expect(t.host.savedFiles[BOARD]).toBe("theirs");
    expect(t.liveHashes.get(PATH)).toBe(sha("theirs"));
    expect(t.clashes.hasClash(BOARD)).toBe(false);
    expect(t.scheduleLocalSave).toHaveBeenCalled();
    expect(t.clashes.isResolving(BOARD)).toBe(false);
  });

  it("保留我的：以对方版本为新基线，我的内容保持不变并重新保存", async () => {
    const t = setup();
    t.remote[BOARD] = "theirs";
    t.publishedHashes.set(PATH, sha("theirs"));
    await t.clashes.handleBoardClash(PATH, sha("theirs"), "remote-while-editing");
    t.offers[0].keepMine();
    await vi.waitFor(() => expect(t.scheduleLocalSave).toHaveBeenCalled());
    expect(t.host.state.content.files[BOARD]).toBe("mine");
    expect(t.host.savedFiles[BOARD]).toBe("theirs");
    expect(t.host.loadedFiles[BOARD]).toBe("theirs");
    expect(t.liveHashes.get(PATH)).toBe(sha("theirs"));
    expect(t.clashes.hasClash(BOARD)).toBe(false);
  });

  it("保留我的但对方已删除：清掉基线，让我的内容作为新文件保存", async () => {
    const t = setup();
    await t.clashes.handleBoardClash(PATH, null, "remote-while-editing");
    t.publishedHashes.set(PATH, null);
    t.offers[0].keepMine();
    await vi.waitFor(() => expect(t.scheduleLocalSave).toHaveBeenCalled());
    expect(t.liveHashes.has(PATH)).toBe(false);
    expect(t.host.savedFiles[BOARD]).toBeUndefined();
    expect(t.host.state.content.files[BOARD]).toBe("mine");
  });

  it("另存副本：对方版本回到原画板，我的内容进入“my copy”画板", async () => {
    const t = setup();
    t.remote[BOARD] = "theirs";
    t.publishedHashes.set(PATH, sha("theirs"));
    await t.clashes.handleBoardClash(PATH, sha("theirs"), "remote-while-editing");
    t.offers[0].keepMineAsCopy();
    await vi.waitFor(() => expect(t.replaceDocument).toHaveBeenCalled());
    const files = t.host.state.content.files;
    expect(files[BOARD]).toBe("theirs");
    expect(files["home my copy.dc.html"]).toBe("mine");
    expect(JSON.parse(files["canvas.json"]).artboards.map((board: any) => board.file)).toContain("home my copy.dc.html");
  });

  it("同一个提示只响应第一次点击", async () => {
    const t = setup();
    await t.clashes.handleBoardClash(PATH, null, "remote-while-editing");
    t.offers[0].takeTheirs();
    t.offers[0].keepMine();
    await vi.waitFor(() => expect(t.adoptRemoteFiles).toHaveBeenCalled());
    expect(t.liveHashes.has(PATH)).toBe(false);
    expect(t.host.state.content.files[BOARD]).toBeUndefined();
  });

  it("副本名被占用时顺延编号", () => {
    const t = setup({}, { [BOARD]: "mine", "home my copy.dc.html": "x" });
    expect(t.clashes.createMyCopy(BOARD, "copy-body")).toBe("home my copy 2.dc.html");
    expect(t.clashes.createMyCopy(BOARD, "again", true)).toBe("home 2.dc.html");
  });
});

describe("同名画板冲突：规则与相同内容", () => {
  it("规则为 first：直接加载对方版本并提示，不弹选择", async () => {
    const t = setup({ sameBoardRule: "first" });
    t.remote[BOARD] = "theirs";
    await t.clashes.handleBoardClash(PATH, sha("theirs"), "remote-while-editing");
    expect(t.offers).toHaveLength(0);
    expect(t.publisher.withdraw).toHaveBeenCalledWith(PATH);
    expect(t.host.state.content.files[BOARD]).toBe("theirs");
    expect(t.notices[0]).toBe("home changed remotely");
    expect(t.clashes.isResolving(BOARD)).toBe(false);
  });

  it("规则为 last：不加载对方版本，记下对方版本后重新保存我的", async () => {
    const t = setup({ sameBoardRule: "last" });
    t.host.state.content.files[BOARD] = "mine-edited";
    await t.clashes.handleBoardClash(PATH, "remote-sha", "remote-while-editing");
    expect(t.publishedHashes.get(PATH)).toBe("remote-sha");
    expect(t.liveHashes.get(PATH)).toBe("remote-sha");
    expect(t.host.loadedFiles[BOARD]).toBeUndefined();
    expect(t.scheduleLocalSave).toHaveBeenCalled();
    expect(t.offers).toHaveLength(0);
  });

  it("新建画板与远端内容完全相同：直接认作同一份", async () => {
    const t = setup({}, { [BOARD]: "same" });
    t.host.savedFiles = {};
    t.liveHashes.clear();
    await t.clashes.handleBoardClash(PATH, sha("same"), "remote-while-editing");
    expect(t.liveHashes.get(PATH)).toBe(sha("same"));
    expect(t.publisher.resolveConflict).toHaveBeenCalledWith(PATH, "theirs");
    expect(t.offers).toHaveLength(0);
    expect(t.adoptRemoteFiles).not.toHaveBeenCalled();
  });

  it("新建画板与远端同名但内容不同：我的改名为下一个编号，原名换成对方版本", async () => {
    const t = setup({}, { [BOARD]: "mine-new" });
    t.host.savedFiles = {};
    t.liveHashes.clear();
    t.remote[BOARD] = "theirs";
    await t.clashes.handleBoardClash(PATH, sha("theirs"), "remote-while-editing");
    const files = t.host.state.content.files;
    expect(files[BOARD]).toBe("theirs");
    expect(files["home 2.dc.html"]).toBe("mine-new");
    expect(t.index.order).toEqual([BOARD, "home 2.dc.html"]);
    expect(t.index.boards["home 2.dc.html"]).toEqual(t.index.boards[BOARD]);
    expect(t.scheduleLocalSave).toHaveBeenCalled();
    expect(t.clashes.isResolving(BOARD)).toBe(false);
  });

  it("本地没有这个文件：直接采用远端，不提示选择", async () => {
    const t = setup({}, {});
    t.remote[BOARD] = "theirs";
    await t.clashes.handleBoardClash(PATH, sha("theirs"), "remote-while-editing");
    expect(t.offers).toHaveLength(0);
    expect(t.host.state.content.files[BOARD]).toBe("theirs");
  });
});

describe("暂扣的远端文件", () => {
  it("暂扣后定时检查：仍被占用就继续等，放开后释放并重新应用远端更新", () => {
    const t = setup();
    t.host.state.content.files[BOARD] = "mine";
    t.host.loadedFiles[BOARD] = "mine";
    t.host.savedFiles[BOARD] = "mine";
    t.holdSet.add(BOARD);
    t.publishedHashes.set(PATH, "remote-sha");
    t.clashes.hold(BOARD);
    expect(t.clashes.isHeld(BOARD)).toBe(true);
    expect(t.timerQueue).toHaveLength(1);
    // 再次暂扣不会重复启动定时器
    t.clashes.hold(BOARD);
    expect(t.timerQueue).toHaveLength(1);
    t.timerQueue.shift()!.run();
    expect(t.clashes.isHeld(BOARD)).toBe(true);
    expect(t.timerQueue).toHaveLength(1);
    expect(t.handleRemoteUpdate).not.toHaveBeenCalled();
    t.holdSet.delete(BOARD);
    t.timerQueue.shift()!.run();
    expect(t.clashes.isHeld(BOARD)).toBe(false);
    expect(t.clashes.heldPaths()).toEqual([]);
    expect(t.timerQueue).toHaveLength(0);
    expect(t.handleRemoteUpdate).toHaveBeenCalledOnce();
    expect(t.handleRemoteUpdate.mock.calls[0][0].changed).toEqual([{ path: PATH, sha256: "remote-sha" }]);
    expect(t.offers).toHaveLength(0);
  });

  it("释放时本地有未保存修改：改走冲突处理，不直接覆盖", async () => {
    const t = setup();
    t.host.state.content.files[BOARD] = "mine-edited";
    t.publishedHashes.set(PATH, null);
    t.clashes.hold(BOARD);
    t.clashes.releaseHeldFile(BOARD);
    await vi.waitFor(() => expect(t.clashes.hasClash(BOARD)).toBe(true));
    expect(t.handleRemoteUpdate).not.toHaveBeenCalled();
    expect(t.offers).toHaveLength(1);
  });

  it("dispose 会取消待执行的检查", () => {
    const t = setup();
    t.clashes.hold(BOARD);
    expect(t.timerQueue).toHaveLength(1);
    t.clashes.dispose();
    expect(t.timerQueue).toHaveLength(0);
  });

  it("dropHold 只移除暂扣标记", () => {
    const t = setup();
    t.clashes.hold(BOARD);
    t.clashes.dropHold(BOARD);
    expect(t.clashes.isHeld(BOARD)).toBe(false);
  });
});

describe("被覆盖的保存", () => {
  const base = "base";
  it("无覆盖记录或远端已含我的内容时没有任何动作", () => {
    const t = setup();
    expect(t.clashes.reapplyOverwrittenEdit(BOARD, "remote")).toBeUndefined();
    t.clashes.rememberOverwrittenEdit({ file: BOARD, base, mine: "remote", at: 1000 });
    expect(t.clashes.reapplyOverwrittenEdit(BOARD, "remote")).toBeUndefined();
    expect(t.notices).toEqual([]);
  });

  it("忘记记录后不再处理；提示走宿主回调并可放回", () => {
    const t = setup();
    t.clashes.rememberOverwrittenEdit({ file: BOARD, base, mine: "mine", at: 1000 });
    t.clashes.forgetOverwrittenEdit(BOARD);
    expect(t.clashes.reapplyOverwrittenEdit(BOARD, "remote")).toBeUndefined();
    const onSaveDropped = vi.fn();
    const t2 = setup({ onSaveDropped });
    t2.clashes.offerOverwrittenEditNotice({ file: BOARD, base, mine: "mine", at: 1000 });
    expect(onSaveDropped).toHaveBeenCalledOnce();
    expect(t2.notices).toEqual([]);
    // 放不回去时给出说明，且只执行一次
    onSaveDropped.mock.calls[0][0].putBack();
    onSaveDropped.mock.calls[0][0].putBack();
    expect(t2.notices).toHaveLength(1);
    expect(t2.notices[0]).toContain("could not be put back");
  });

  it("没有宿主回调时直接告知保存被覆盖", () => {
    const t = setup();
    t.clashes.offerOverwrittenEditNotice({ file: BOARD, base, mine: "mine", at: 1000 });
    expect(t.notices[0]).toContain("saved over by a version");
  });
});

describe("无冲突时没有副作用", () => {
  it("初始状态：没有冲突、暂扣、处理中标记，也没有定时器", () => {
    const t = setup();
    expect(t.clashes.hasClash(BOARD)).toBe(false);
    expect(t.clashes.isHeld(BOARD)).toBe(false);
    expect(t.clashes.isResolving(BOARD)).toBe(false);
    expect(t.clashes.heldPaths()).toEqual([]);
    expect(t.timerQueue).toHaveLength(0);
    t.host.savedFiles[BOARD] = "mine";
    expect(t.clashes.hasLocalBoardChanges(BOARD)).toBe(false);
  });

  it("本地有未保存修改会被识别为本地改动", () => {
    const t = setup();
    t.host.state.content.files[BOARD] = "edited";
    expect(t.clashes.hasLocalBoardChanges(BOARD)).toBe(true);
  });

  it("处理冲突时文档已销毁则什么都不做", async () => {
    const t = setup();
    t.host.disposed = true;
    await t.clashes.handleBoardClash(PATH, null, "remote-while-editing");
    expect(t.offers).toHaveLength(0);
    expect(t.clashes.hasClash(BOARD)).toBe(false);
  });
});
