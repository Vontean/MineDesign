// 外部文件变更：Node 改写工作区里的 Main.dc.html，编辑器自动刷新显示新内容；不产生写回。
import fs from 'node:fs';
import path from 'node:path';

export default {
  fixture: 'design',
  async run(session) {
    const { page } = session;
    await session.open();

    const file = path.join(session.workspace, session.fixture, 'Main.dc.html');
    fs.writeFileSync(file, fs.readFileSync(file, 'utf8').replace('>工作台</h1>', '>外部改写后的标题</h1>'));

    // 等任一画板 frame 显示出新标题
    const deadline = Date.now() + 15000;
    while (!(await Promise.all(page.frames().map(f => f.evaluate(() => document.body?.innerText.includes('外部改写后的标题')).catch(() => false)))).some(Boolean)) {
      if (Date.now() > deadline) throw new Error('编辑器没有刷新出外部改写的内容');
      await page.waitForTimeout(200);
    }
    await session.shot('refreshed');
  },
};
