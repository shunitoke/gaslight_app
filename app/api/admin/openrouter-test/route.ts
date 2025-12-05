'use server';

import { NextResponse } from 'next/server';
import { validateAdminSecret, extractAdminSecret, isAdminEnabled } from '@/lib/admin-auth';
import { callOpenRouter } from '@/lib/openrouter';
import { getConfig } from '@/lib/config';

export const runtime = 'nodejs';
export const maxDuration = 30;

export async function POST(request: Request) {
  try {
    if (!isAdminEnabled()) {
      return NextResponse.json({ error: 'Admin disabled' }, { status: 503 });
    }
    const secret = extractAdminSecret(request);
    if (!validateAdminSecret(secret)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { prompt } = await request.json().catch(() => ({ prompt: 'ping' }));
    const config = getConfig();
    const model = config.textModel;

    const res = await callOpenRouter({
      model,
      messages: [
        { role: 'system', content: 'You are a diagnostic probe. Answer in one short word.' },
        { role: 'user', content: prompt || 'ping' }
      ],
      max_tokens: 16,
      temperature: 0
    });

    const text = res.choices?.[0]?.message?.content || '';

    return NextResponse.json({
      ok: true,
      model,
      text,
      raw: res
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        ok: false,
        error: error?.message || 'Unknown error'
      },
      { status: 500 }
    );
  }
}

