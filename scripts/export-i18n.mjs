import fs from 'node:fs/promises';
import path from 'node:path';
import { uiText } from '../packages/contracts/src/ui-text.ts';
import { englishMessages, chineseMessages } from '../packages/contracts/src/ui-messages.ts';

const target = process.argv[2] ?? 'output/i18n/minedesign-bilingual.csv';
const cell = value => `"${String(value).replaceAll('"', '""')}"`;
const entries = Object.entries(englishMessages).map(([key, en]) => [key, en, chineseMessages[key]]);
const functionCases = {
  removeCommentN: [['', ['{count}']]], locate: [['', ['{label}']]],
  agentPrompt: [['', ['{feedback}']]], releaseAvailable: [['', ['{latest}']]],
  updateFailed: [['', ['{reason}']]], checkFailed: [['', ['{reason}']]],
  updateAvailable: [['.one', [1, '{latest}']], ['.many', ['{behind}', '{latest}']]],
  tabComments: [['.zero', [0]], ['.one', [1]], ['.many', ['{count}']]],
};
function collect(en, zh, prefix = 'shell') {
  for (const [key, value] of Object.entries(en)) {
    const id = `${prefix}.${key}`;
    if (typeof value === 'string') entries.push([id, value, zh[key]]);
    else if (typeof value === 'function') {
      if (!functionCases[key]) throw new Error(`Add export cases for ${id}`);
      for (const [suffix, args] of functionCases[key]) entries.push([id + suffix, value(...args), zh[key](...args)]);
    } else collect(value, zh[key], id);
  }
}
collect(uiText('en'), uiText('zh-Hans'));
const rows = [['key', 'en', 'zh-Hans'], ...entries.sort(([a], [b]) => a.localeCompare(b))];
await fs.mkdir(path.dirname(target), { recursive: true });
await fs.writeFile(target, '\uFEFF' + rows.map(row => row.map(cell).join(',')).join('\r\n') + '\r\n');
console.log(`${rows.length - 1} bilingual messages exported to ${target}`);
