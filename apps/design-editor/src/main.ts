import '@minedesign/design-runtime/app.css';
import { createDesignRuntime } from '@minedesign/design-runtime';
import { initializeThemeFromSystem } from '@minedesign/design-runtime/theme';
import { installDesignEditorHost } from '@minedesign/editor-host/design';

// 先装宿主（globalThis.designHost），再照原页面的入口跟随系统明暗、启动运行时：运行时启动时就读宿主能力（docs/design/canvas §4、§5）。
// MineDesign：在 Codex 中以 srcdoc 装载，路由根由插件页给出（FORK.md）
installDesignEditorHost({ base: (globalThis as { __MDN_FRAME__?: { base?: string } }).__MDN_FRAME__?.base });
initializeThemeFromSystem();
createDesignRuntime();
