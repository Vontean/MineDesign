import '@baocut/design-runtime/app.css';
import { createDesignRuntime } from '@baocut/design-runtime';
import { initializeThemeFromSystem } from '@baocut/design-runtime/theme';
import { installDesignEditorHost } from '@baocut/design/editor';

// 先装宿主（globalThis.designHost），再照原页面的入口跟随系统明暗、启动运行时：运行时启动时就读宿主能力（docs/design/canvas §4、§5）。
installDesignEditorHost();
initializeThemeFromSystem();
createDesignRuntime();
