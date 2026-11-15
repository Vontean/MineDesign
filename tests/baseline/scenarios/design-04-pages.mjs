// 分页切换：画布左上角的页面菜单切到第二页，再切回第一页。
export default {
  fixture: 'design',
  async run(session) {
    await session.open();
    const editor = session.editor();
    const pages = editor.getByTestId('dc-pages');

    await pages.click();
    await session.shot('pages-menu');

    await editor.locator('[data-dc-pages-list] button', { hasText: 'Page 2' }).click();
    await session.shot('page-2');

    await pages.click();
    await editor.locator('[data-dc-pages-list] button', { hasText: 'Page 1' }).click();
    await session.shot('page-1');
  },
};
