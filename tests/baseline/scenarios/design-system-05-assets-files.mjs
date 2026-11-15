// 素材浏览与文件列表：看素材表，再在文件列表里展开文件夹并预览一个文件。
export default {
  fixture: 'design-system',
  kind: 'design-system',
  async run(session) {
    await session.open();
    const editor = session.editor();
    await editor.getByTestId('ds-jump-assets').click();
    await session.settle();
    await session.shot('assets');

    await editor.getByTestId('ds-jump-files').click();
    await editor.getByTestId('files-browser').waitFor();
    await editor.getByTestId('files-browser-row').filter({ hasText: 'assets' }).first().click();
    await session.settle();
    await editor.getByTestId('files-browser-row').filter({ hasText: 'README.md' }).first().click();
    await session.shot('file-preview');
  },
};
