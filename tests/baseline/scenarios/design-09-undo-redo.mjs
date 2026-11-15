// 撤销与重做：画布上改文字后用快捷键撤销、再重做；最终文件为重做后的内容。
export default {
  fixture: 'design',
  async run(session) {
    const { page } = session;
    await session.open();

    await page.mouse.click(137, 380);
    await page.mouse.dblclick(137, 380);
    await page.keyboard.press('ControlOrMeta+a');
    await page.keyboard.type('撤销测试');
    await page.keyboard.press('Escape');
    await session.saved();
    await session.shot('edited');

    await page.keyboard.press('ControlOrMeta+z');
    await session.saved();
    await session.shot('undone');

    await page.keyboard.press('ControlOrMeta+Shift+z');
    await session.saved();
    await session.shot('redone');
  },
};
