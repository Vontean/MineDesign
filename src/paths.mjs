import path from 'node:path';
import { fileURLToPath } from 'node:url';
// 源码与 dist 入口都在项目根目录的下一层。
export const ROOT = path.resolve(fileURLToPath(new URL('../', import.meta.url)));
