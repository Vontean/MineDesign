// 打开设计系统并依次切换章节：Overview、Colors、Typography、Spacing、Radius、Shadows、Components、Assets、Files。
export default {
  fixture: 'design-system',
  kind: 'design-system',
  async run(session) {
    await session.open();
    const editor = session.editor();
    await session.shot('overview');

    for (const id of ['colors', 'type', 'spacing', 'corners', 'shadows', 'components', 'assets']) {
      await editor.getByTestId(`ds-jump-${id}`).click();
      await session.settle();
    }
    await session.shot('assets');

    await editor.getByTestId('ds-jump-files').click();
    await editor.getByTestId('files-browser').waitFor();
    await session.shot('files');
  },
};
