// 全屏播放与退出：第三页「计数器」画板选 Play full screen，点里面的按钮，再按 Esc 退出。
export default {
  fixture: 'design',
  async run(session) {
    const { page } = session;
    await session.open();
    const editor = session.editor();

    await editor.getByTestId('dc-pages').click();
    await editor.locator('[data-dc-pages-list] button', { hasText: 'Page 3' }).click();
    await session.settle();

    await editor.getByTestId('mega-artboard-play-Counter.dc.html').click();
    await editor.getByText('Play full screen', { exact: true }).click();
    await session.shot('fullscreen');

    await page.mouse.click(536, 499);
    await session.shot('clicked');

    await page.keyboard.press('Escape');
    await session.shot('exited');
  },
};
