import os from 'node:os';
import path from 'node:path';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
// 源码与 dist 入口都在项目根目录的下一层。
export const ROOT = path.resolve(fileURLToPath(new URL('../', import.meta.url)));
// 源码检出（有 .git）是开发版：作品与本机数据放在项目的 .local/dev，和生产版隔离。npm 安装是生产版：包目录随更新整体替换，
// 本机数据放 ~/.minedesign（MINEDESIGN_HOME 可改），作品默认放 ~/MineDesign。scripts/install-local.mjs 不经打包，按同一规则另算。
export const CHECKOUT = existsSync(path.join(ROOT, '.git'));
export const CHANNEL = CHECKOUT ? 'dev' : 'production';
export const DATA = path.resolve(process.env.MINEDESIGN_HOME || (CHECKOUT ? path.join(ROOT, '.local/dev') : path.join(os.homedir(), '.minedesign')));
export const DEFAULT_WORKSPACE = CHECKOUT ? ROOT : path.join(os.homedir(), 'MineDesign');
