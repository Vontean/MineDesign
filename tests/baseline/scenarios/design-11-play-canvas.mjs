// 在画布播放与停止：第三页「计数器」画板标题上的播放按钮选 Play on canvas，点里面的按钮。
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
    await editor.getByText('Play on canvas', { exact: true }).click();
    await session.shot('playing');

    await editor.frameLocator('[data-testid="mega-artboard-frame-Counter.dc.html"] iframe').getByRole('button', { name: '切换状态' }).click();
    await session.shot('clicked');

    // 播放中画板标题栏找不到停止按钮（DOM 中不存在），所以基线只记到播放与交互为止
  },
};
