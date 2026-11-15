// 平移与缩放：外壳缩放菜单、键盘快捷键、滚轮平移、捏合（Ctrl+滚轮）缩放、空格拖动。
const CENTER = { x: 560, y: 480 };

export default {
  fixture: 'design',
  async run(session) {
    const { page } = session;
    const zoomMenu = async item => {
      await page.locator('#zoom').click();
      // 菜单项的可访问名称末尾带快捷键提示（如「Zoom in⌘+」），按前缀匹配
      await page.locator('#zoom-menu').getByRole(/%$/.test(item) ? 'menuitemradio' : 'menuitem', { name: new RegExp(`^${item.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`) }).click();
    };
    await session.open();

    await zoomMenu('Zoom in');
    await session.shot('menu-zoom-in');
    await zoomMenu('100%');
    await session.shot('menu-100');

    // 键盘缩放前先让画布取得焦点（点画布左下的空白处，避开底部工具栏）
    await page.mouse.click(200, 800);
    await session.settle(); // 焦点切换完成后再按键，否则按键偶尔丢失
    await page.keyboard.press('ControlOrMeta+Minus');
    await session.shot('key-zoom-out');

    await page.mouse.move(CENTER.x, CENTER.y);
    await page.mouse.wheel(0, 240);
    await page.mouse.wheel(160, 0);
    await session.shot('wheel-pan');

    await page.mouse.move(CENTER.x, CENTER.y);
    await page.keyboard.down('Control');
    await page.mouse.wheel(0, -120);
    await page.keyboard.up('Control');
    await session.shot('pinch-zoom');

    await page.mouse.move(CENTER.x, CENTER.y);
    await page.keyboard.down('Space');
    await page.mouse.down();
    await page.mouse.move(CENTER.x - 200, CENTER.y - 120, { steps: 8 });
    await page.mouse.up();
    await page.keyboard.up('Space');
    await session.shot('space-drag');

    await zoomMenu('Fit to canvas');
    await session.shot('menu-fit');
  },
};
