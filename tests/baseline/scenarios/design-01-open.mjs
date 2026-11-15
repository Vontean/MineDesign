// 打开与首屏：外壳载入设计稿，编辑器与画板渲染完成。
export default {
  fixture: 'design',
  async run(session) {
    await session.open();
    await session.shot('first-screen');
  },
};
