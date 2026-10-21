/**
 * Live GigaChat smoke tests — skipped unless GIGACHAT_LIVE=1 and
 * GIGACHAT_AUTH_KEY are set (they hit the real Sber API).
 *
 *   GIGACHAT_LIVE=1 GIGACHAT_AUTH_KEY=... GC_TEST_IMAGE=/path/to.jpg \
 *     npx vitest run tests/integration/gigachat.live.test.ts
 */
import fs from 'node:fs';
import { describe, expect, it } from 'vitest';
import { callGigaChat, listGigaChatModels } from '../../lib/gigachat';
import { analyzeImage } from '../../lib/vision';

const live = process.env.GIGACHAT_LIVE === '1' && Boolean(process.env.GIGACHAT_AUTH_KEY);
const textModel = process.env.GASLIGHT_TEXT_MODEL || 'GigaChat-3-Ultra';

describe.skipIf(!live)('GigaChat live transport', () => {
  it('lists models for the key', async () => {
    const models = await listGigaChatModels();
    console.log('models:', models.join(', '));
    expect(models.length).toBeGreaterThan(0);
  }, 30000);

  it('answers a chat completion', async () => {
    const res = await callGigaChat({
      models: [textModel],
      messages: [{ role: 'user', content: 'Ответь одним словом: работает?' }],
      max_tokens: 24,
      temperature: 0
    });
    const text = res.choices[0]?.message?.content || '';
    console.log('chat:', text, '| model:', res.model);
    expect(text.trim().length).toBeGreaterThan(0);
  }, 60000);

  it('falls back when the primary model is unavailable', async () => {
    const res = await callGigaChat({
      models: ['GigaChat-does-not-exist-9', 'GigaChat-2-Max'],
      messages: [{ role: 'user', content: 'ping' }],
      max_tokens: 16,
      temperature: 0
    });
    console.log('fallback used:', res.model);
    expect(res.choices[0]?.message?.content?.length).toBeGreaterThan(0);
  }, 90000);

  it('OCRs an image through /files + attachments', async () => {
    const imagePath = process.env.GC_TEST_IMAGE;
    expect(imagePath, 'GC_TEST_IMAGE must point to a local image').toBeTruthy();
    const buf = fs.readFileSync(imagePath as string);
    const dataUrl = `data:image/jpeg;base64,${buf.toString('base64')}`;
    const out = await analyzeImage(dataUrl, 'Extract all readable text from the image. Return only plain text.');
    console.log('ocr:', out.description.slice(0, 200).replace(/\n/g, ' | '));
    expect(out.description.length).toBeGreaterThan(5);
  }, 120000);
});
