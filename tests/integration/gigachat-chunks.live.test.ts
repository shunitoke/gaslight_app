import fs from 'node:fs';
import { describe, it } from 'vitest';
import { callLLM } from '../../lib/llmClient';
import { getSystemPrompt, getUserPrompt } from '../../features/analysis/prompts';

const live = process.env.GIGACHAT_LIVE === '1' && Boolean(process.env.GIGACHAT_AUTH_KEY);
const OUT = '/tmp/gc-chunks.json';

const ALL = JSON.parse(fs.readFileSync('/tmp/big2000.json', 'utf8')).messages as any[];
const fmt = (msgs: any[]) => msgs.map(m => `[${m.sentAt}] ${m.senderId}: ${m.text}`).join('\n');

function save(name: string, result: any) {
  let all: Record<string, unknown> = {};
  try {
    all = JSON.parse(fs.readFileSync(OUT, 'utf8'));
  } catch {
    all = {};
  }
  all[name] = result;
  fs.writeFileSync(OUT, JSON.stringify(all, null, 1));
}

async function probe(name: string, size: number, temperature: number) {
  const msgs = ALL.slice(0, size);
  const started = Date.now();
  const res = await callLLM({
    model: process.env.GASLIGHT_TEXT_MODEL || 'GigaChat-3-Pro',
    messages: [
      { role: 'system', content: getSystemPrompt('ru', false) },
      { role: 'user', content: getUserPrompt('ru', msgs.length, '', fmt(msgs), false) }
    ],
    max_tokens: 4000,
    temperature
  });
  const content = res.choices[0]?.message?.content || '';
  let parsed: any = null;
  try {
    parsed = JSON.parse(content);
  } catch {
    parsed = null;
  }
  const sections = parsed?.sections || [];
  save(name, {
    size,
    seconds: Math.round((Date.now() - started) / 1000),
    inputChars: fmt(msgs).length,
    usage: (res as any).usage,
    finish: (res as any).choices?.[0]?.finish_reason,
    jsonOk: Boolean(parsed),
    sectionsCount: sections.length,
    evidence: sections.map((s: any) => (s.evidenceSnippets || []).length),
    titles: sections.map((s: any) => s.title),
    overviewChars: (parsed?.overviewSummary || '').length
  });
}

describe.skipIf(!live)('GigaChat chunk-size conformance', () => {
  it('600 msgs t0.7', async () => { await probe('600_t07', 600, 0.7); }, 300000);
  it('1000 msgs t0.7', async () => { await probe('1000_t07', 1000, 0.7); }, 300000);
  it('1000 msgs t0.2', async () => { await probe('1000_t02', 1000, 0.2); }, 300000);
});
