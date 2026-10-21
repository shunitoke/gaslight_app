import fs from 'node:fs';
import { describe, it } from 'vitest';
import { callLLM } from '../../lib/llmClient';
import { getSystemPrompt, getUserPrompt } from '../../features/analysis/prompts';

const live = process.env.GIGACHAT_LIVE === '1' && Boolean(process.env.GIGACHAT_AUTH_KEY);
const ALL = JSON.parse(fs.readFileSync('/tmp/big2000.json', 'utf8')).messages as any[];
const fmt = (msgs: any[]) => msgs.map(m => `[${m.sentAt}] ${m.senderId}: ${m.text}`).join('\n');

describe.skipIf(!live)('raw sections shape', () => {
  it('dump', async () => {
    const msgs = ALL.slice(0, 1000);
    const res = await callLLM({
      model: 'GigaChat-3-Pro',
      messages: [
        { role: 'system', content: getSystemPrompt('ru', false) },
        { role: 'user', content: getUserPrompt('ru', msgs.length, '', fmt(msgs), false) }
      ],
      max_tokens: 4000,
      temperature: 0.2
    });
    const content = res.choices[0]?.message?.content || '';
    fs.writeFileSync('/tmp/gc-raw.txt', content);
    const parsed = JSON.parse(content);
    fs.writeFileSync('/tmp/gc-raw-sections.json', JSON.stringify(parsed.sections.slice(0, 4), null, 1));
  }, 300000);
});
