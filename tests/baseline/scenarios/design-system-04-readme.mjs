// 说明文档：阅读 README，再在总览里编辑 layout.md 并等待写回。
export default {
  fixture: 'design-system',
  kind: 'design-system',
  async run(session) {
    const { page } = session;
    await session.open();
    const editor = session.editor();
    await session.shot('read');

    await editor.getByTestId('ds-guidance-text-layout.md').click();
    await page.keyboard.press('ControlOrMeta+End');
    await page.keyboard.type('补充：卡片阴影只用 shadow-sm。');
    await editor.getByTestId('ds-jump-colors').click();
    await session.saved();
    await editor.getByTestId('ds-jump-readme').click();
    await session.shot('edited');
  },
};
