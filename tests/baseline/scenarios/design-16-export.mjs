// 导出：画板标题栏的下载按钮，导出 PNG 与 HTML；记录触发的下载与消息，不比较导出文件的字节。
export default {
  fixture: 'design',
  async run(session) {
    const { page } = session;
    await session.open();
    const downloads = [];
    page.on('download', d => downloads.push(d.suggestedFilename()));

    // 下载菜单项：PNG 1× 与 HTML (.zip)；每次等下载事件出现
    for (const item of [{ x: 775, y: 281 }, { x: 788, y: 381 }]) {
      // 导出后菜单可能仍开着，已开着就不再点触发按钮
      if (!(await session.editor().getByText('HTML (.zip)').isVisible())) await page.mouse.click(751, 246);
      await page.mouse.click(item.x, item.y);
      const before = downloads.length;
      for (let i = 0; i < 50 && downloads.length === before; i++) await page.waitForTimeout(100);
      await session.settle();
    }
    console.log('downloads', downloads);
    if (downloads.length !== 2) throw new Error(`期望 2 次下载，实际 ${downloads.length}：${downloads}`);
    await session.shot('exported');
  },
};
