// 复制与粘贴：选中「工作台」说明段落，复制后粘贴出一份副本，写回 Main.dc.html。
export default {
  fixture: 'design',
  async run(session) {
    const { page } = session;
    await session.open();

    await page.mouse.click(137, 430);
    await session.shot('selected');
    await page.keyboard.press('ControlOrMeta+c');
    await session.settle();
    await page.keyboard.press('ControlOrMeta+v');
    await session.saved();
    await session.shot('pasted');
  },
};
