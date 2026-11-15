// 聚焦画板：画板名称条右侧的「全窗口打开」进入聚焦视图，Esc 回到画布。
export default {
  fixture: 'design',
  async run(session) {
    const { page } = session;
    await session.open();
    const editor = session.editor();

    await editor.getByTestId('mega-artboard-expand-Main.dc.html').click();
    await session.shot('focused-main');

    await page.keyboard.press('Escape');
    await session.shot('back-to-canvas');

    await editor.getByTestId('mega-artboard-expand-Detail.dc.html').click();
    await session.shot('focused-detail');
  },
};
