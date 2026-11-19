import { open } from 'node:fs/promises';

// 导出：画板标题栏的下载按钮，导出 PNG 与 HTML，核对文件格式及消息。
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
      if (label === 'HTML (.zip)') {
        const archive = await open(await download.path());
        try {
          const signature = Buffer.alloc(4);
          await archive.read(signature);
          if (signature.readUInt32LE() !== 0x04034b50) throw new Error('HTML 下载没有 ZIP 文件头');
        } finally {
          await archive.close();
        }
      }
      await session.settle();
    }
    console.log('downloads', downloads);
    await session.shot('exported');
  },
};
