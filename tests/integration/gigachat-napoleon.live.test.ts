import fs from 'node:fs';
import { describe, it } from 'vitest';
import { callLLM } from '../../lib/llmClient';
import { getSystemPrompt, getUserPrompt } from '../../features/analysis/prompts';

const live = process.env.GIGACHAT_LIVE === '1' && Boolean(process.env.GIGACHAT_AUTH_KEY);
const ALL = JSON.parse(fs.readFileSync('/tmp/napoleon.json', 'utf8')).messages as any[];
const OUT = '/tmp/gc-nap.json';
const fmt = (m: any[]) => m.map(x => `[${x.sentAt}] ${x.senderId}: ${x.text}`).join('\n');

function save(name: string, v: any) {
  let all: Record<string, unknown> = {};
  try { all = JSON.parse(fs.readFileSync(OUT, 'utf8')); } catch { all = {}; }
  all[name] = v;
  fs.writeFileSync(OUT, JSON.stringify(all, null, 1));
}

async function probe(name: string, size: number) {
  const msgs = ALL.slice(0, size);
  const started = Date.now();
  const res = await callLLM({
    model: 'GigaChat-3-Pro',
    messages: [
      { role: 'system', content: getSystemPrompt('ru', false) },
      { role: 'user', content: getUserPrompt('ru', msgs.length, '', fmt(msgs), false) }
    ],
    max_tokens: 4000,
    temperature: 0.7
  });
  const content = res.choices[0]?.message?.content || '';
  let parsed: any = null;
  try { parsed = JSON.parse(content); } catch { parsed = null; }
  const sections = parsed?.sections || [];
  save(name, {
    size, chars: fmt(msgs).length, seconds: Math.round((Date.now() - started) / 1000),
    jsonOk: !!parsed, sections: sections.length,
    evidence: sections.map((s: any) => (s.evidenceSnippets || []).length),
    titles: sections.map((s: any) => s.title)
  });
}

describe.skipIf(!live)('napoleon chunk sizes', () => {
  it('500', async () => { await probe('500', 500); }, 200000);
  it('700', async () => { await probe('700', 700); }, 200000);
  it('1000', async () => { await probe('1000', 1000); }, 200000);
});
