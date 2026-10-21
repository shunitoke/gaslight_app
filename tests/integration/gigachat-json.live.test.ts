import fs from 'node:fs';
import { describe, it } from 'vitest';
import { callLLM } from '../../lib/llmClient';
import { getSystemPrompt, getUserPrompt } from '../../features/analysis/prompts';

const live = process.env.GIGACHAT_LIVE === '1' && Boolean(process.env.GIGACHAT_AUTH_KEY);
const OUT = '/tmp/gc-probe.json';

function fmt(msgs: any[]): string {
  return msgs.map(m => `[${m.sentAt}] ${m.senderId}: ${m.text}`).join('\n');
}

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

async function probe(msgs: any[], maxTokens: number, temperature: number) {
  const res = await callLLM({
    model: process.env.GASLIGHT_TEXT_MODEL || 'GigaChat-3-Pro',
    messages: [
      { role: 'system', content: getSystemPrompt('ru', false) },
      { role: 'user', content: getUserPrompt('ru', msgs.length, '', fmt(msgs), false) }
    ],
    max_tokens: maxTokens,
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
  return {
    chars: content.length,
    finish: (res as any).choices?.[0]?.finish_reason,
    jsonOk: Boolean(parsed),
    keys: parsed ? Object.keys(parsed) : [],
    sections: sections.length,
    evidence: sections.map((s: any) => (s.evidenceSnippets || []).length),
    titles: sections.map((s: any) => s.title),
    tail: content.slice(-200).replace(/\s+/g, ' ')
  };
}

describe.skipIf(!live)('GigaChat JSON schema conformance', () => {
  it('300 messages, max 4000', async () => {
    const msgs = JSON.parse(fs.readFileSync('/tmp/mid300.json', 'utf8')).messages;
    save('300_max4000', await probe(msgs, 4000, 0.7));
  }, 300000);

  it('300 messages, max 8000', async () => {
    const msgs = JSON.parse(fs.readFileSync('/tmp/mid300.json', 'utf8')).messages;
    save('300_max8000', await probe(msgs, 8000, 0.7));
  }, 300000);

  it('2000 messages, max 4000', async () => {
    const msgs = JSON.parse(fs.readFileSync('/tmp/big2000.json', 'utf8')).messages;
    save('2000_max4000', await probe(msgs, 4000, 0.7));
  }, 300000);
});
