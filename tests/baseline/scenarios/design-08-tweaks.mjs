// Tweaks 调节：第三页「调节杆」画板的 Tweaks 按钮打开面板，改颜色、数量、间距与开关；默认值写回画板文件的 data-props。
export default {
  fixture: 'design',
  async run(session) {
    const { page } = session;
    await session.open();
    const editor = session.editor();

    await editor.getByTestId('dc-pages').click();
    await editor.locator('[data-dc-pages-list] button', { hasText: 'Page 3' }).click();
    // 先等第三页的缩放适配完成，再打开侧栏
    await session.shot('page-3');
    await editor.getByTestId('mega-artboard-tweaks-open-Tweaks.dc.html').click();
    await session.shot('tweaks-open');
    const tweaks = editor.getByTestId('dc-props-panel');

    await tweaks.getByRole('button', { name: /^accent/ }).click();
    await editor.getByRole('button', { name: '#16a34a', exact: true }).click();
    await page.keyboard.press('Escape');
    await session.saved();
    await session.shot('accent');

    await tweaks.getByRole('textbox', { name: 'count' }).fill('5');
    await page.keyboard.press('Enter');
    await tweaks.getByRole('textbox', { name: 'gap' }).fill('24');
    await page.keyboard.press('Enter');
    await session.saved();
    await session.shot('count-gap');

    await tweaks.getByRole('switch', { name: 'showNote' }).click();
    await session.saved();
    await session.shot('note-off');
  },
};
