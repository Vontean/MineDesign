// 导出：画板标题栏的下载按钮，导出 PNG 与 HTML；记录触发的下载与消息，不比较导出文件的字节。
export default {
  fixture: 'design',
  async run(session) {
    const { page } = session;
    await session.open();
    const downloads = [];
    const htmlOption = session.editor().getByText('HTML (.zip)', { exact: true });

    for (const label of ['PNG 1×', 'HTML (.zip)']) {
      // 导出后菜单可能仍开着，已开着就不再点触发按钮
      if (!(await htmlOption.isVisible())) await page.mouse.click(751, 246);
      const [download] = await Promise.all([
        page.waitForEvent('download', { timeout: 5000 }),
        session.editor().getByText(label, { exact: true }).click(),
      ]);
      downloads.push(download.suggestedFilename());
      await session.settle();
    }
    console.log('downloads', downloads);
    await session.shot('exported');
  },
};
