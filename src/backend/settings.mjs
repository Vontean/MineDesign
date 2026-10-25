import fs from 'node:fs/promises';
import path from 'node:path';
import { isLanguagePreference } from '@minedesign/contracts/ui-text';

// 本机界面偏好存在 .local/settings.json；目前只有界面语言，缺省跟随 Codex。
export function createSettings(file) {
  async function read() {
    try {
      const data = JSON.parse(await fs.readFile(file, 'utf8'));
      return { language: isLanguagePreference(data.language) ? data.language : 'system' };
    } catch {
      return { language: 'system' };
    }
  }
  async function update(patch = {}) {
    const next = await read();
    if (patch.language !== undefined) {
      if (!isLanguagePreference(patch.language)) throw new Error('不支持的界面语言');
      next.language = patch.language;
    }
    await fs.mkdir(path.dirname(file), { recursive: true });
    await fs.writeFile(file, JSON.stringify(next, null, 2));
    return next;
  }
  return { read, update };
}
