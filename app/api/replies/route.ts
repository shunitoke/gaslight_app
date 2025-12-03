import { NextResponse } from 'next/server';

import type { AnalysisSection, RecommendedReply } from '../../../features/analysis/types';
import type { SupportedLocale } from '../../../features/i18n/types';
import { callLLM } from '../../../lib/llmClient';
import { logError, logInfo } from '../../../lib/telemetry';

type RepliesRequestBody = {
  locale?: SupportedLocale;
  conversationLanguage?: string;
  section: {
    id: string;
    title: string;
    summary: string;
    plainSummary?: string;
    score?: number;
    evidenceSnippets: { excerpt: string; explanation: string }[];
  };
};

export const runtime = 'nodejs';
export const maxDuration = 60;

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as RepliesRequestBody;
    const locale: SupportedLocale = body.locale || 'en';
    const section = body.section;
    const conversationLanguage = body.conversationLanguage || locale;

    if (!section || !section.id || !section.summary || !section.evidenceSnippets?.length) {
      return NextResponse.json(
        { error: 'Invalid section payload' },
        { status: 400 }
      );
    }

    const systemPrompt =
      locale === 'ru'
        ? `Вы — судебный аналитик отношений и фасилитатор ненасильственного общения.
Вам передан ОДИН аналитический раздел с уже готовым научным резюме и примерами цитат.

Задача: по этому разделу придумать несколько вариантов «а что если бы» — как бы звучали сообщения, если бы оба участника были максимально осознанными.

Важно:
- Никаких диагнозов и ярлыков («абьюзер», «нарцисс» и т.п.).
- Только живые фразы, которые можно реально отправить в чат.
- Коротко, по существу, в том же языке, что и переписка.

ФОРМАТ ВЫВОДА (ЖЁСТКИЙ JSON, БЕЗ ТЕКСТА ВНЕ ОБЪЕКТА):
{
  "recommendedReplies": [
    { "text": "...", "tone": "boundary", "fromRole": "user" },
    { "text": "...", "tone": "repair", "fromRole": "other" }
  ]
}

Где:
- "boundary" / "user" — пример того, как более уязвимый участник мог бы осознанно обозначить границы.
- "repair" / "other" — пример того, как более контролирующий/обесценивающий участник мог бы взять ответственность и признать опыт другого.`
        : `You are a forensic relationship analyst and nonviolent communication coach.
You receive ONE analysis section with a scientific summary and concrete quote examples.

Goal: generate a few "what if we were both conscious" rephrasings for this pattern.

Important:
- No diagnoses or labels ("abuser", "narcissist", etc.).
- Only short, natural sentences that someone could realistically send in chat.
- Use the SAME LANGUAGE as the conversation (do NOT switch to English if the chat is in another language).

STRICT OUTPUT FORMAT (PURE JSON, NO EXTRA TEXT):
{
  "recommendedReplies": [
    { "text": "...", "tone": "boundary", "fromRole": "user" },
    { "text": "...", "tone": "repair", "fromRole": "other" }
  ]
}

Where:
- "boundary" / "user" = more vulnerable person naming feelings/needs and setting boundaries without aggression.
- "repair" / "other" = more controlling/invalidating person owning their part and validating the other.`;

    const evidencePreview = section.evidenceSnippets
      .slice(0, 4)
      .map(
        (e, idx) =>
          `${idx + 1}. ${e.excerpt}\n   -> ${e.explanation}`
      )
      .join('\n');

    const userPrompt =
      (locale === 'ru'
        ? `Ниже раздел анализа и фрагменты доказательств.

ID раздела: ${section.id}
Название раздела: ${section.title}
Сводка (научный стиль): ${section.summary}
Простое объяснение: ${section.plainSummary || '(нет)'}
Язык переписки (ISO-код, 2 буквы): ${conversationLanguage}

Фрагменты доказательств (цитаты):
${evidencePreview}

Сгенерируйте только JSON в описанном формате.`
        : `Below is one analysis section and its evidence snippets.

Section ID: ${section.id}
Section title: ${section.title}
Summary (technical): ${section.summary}
Plain-language summary: ${section.plainSummary || '(none)'}
Conversation language (2-letter ISO code): ${conversationLanguage}

Evidence snippets:
${evidencePreview}

Generate ONLY JSON in the specified format.`);

    const response = await callLLM({
      model: 'gpt-4.1-mini',
      max_tokens: 800,
      temperature: 0.8,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ]
    });

    const raw = response.choices[0]?.message?.content || '{}';
    let parsed: { recommendedReplies?: RecommendedReply[] } = {};

    try {
      const jsonMatch =
        raw.match(/```json\s*([\s\S]*?)\s*```/) ||
        raw.match(/```\s*([\s\S]*?)\s*```/);
      parsed = JSON.parse(jsonMatch ? jsonMatch[1] : raw);
    } catch (error) {
      logError('replies_parse_error', {
        message: (error as Error).message,
        contentPreview: raw.substring(0, 200)
      });
      return NextResponse.json(
        { error: 'Failed to parse replies JSON' },
        { status: 500 }
      );
    }

    const replies = Array.isArray(parsed.recommendedReplies)
      ? parsed.recommendedReplies
          .map((r) => ({
            text: (r && r.text) || '',
            tone: r?.tone ?? null,
            fromRole: r?.fromRole
          }))
          .filter((r) => r.text.trim().length > 0)
      : [];

    logInfo('replies_generated', {
      sectionId: section.id,
      replyCount: replies.length
    });

    return NextResponse.json({ replies });
  } catch (error) {
    logError('replies_unexpected_error', {
      message: (error as Error).message
    });
    return NextResponse.json(
      { error: 'Unexpected error while generating replies' },
      { status: 500 }
    );
  }
}

