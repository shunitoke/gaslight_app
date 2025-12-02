import type {
  Conversation,
  Message,
  AnalysisResult,
  AnalysisSection,
  MediaArtifact,
  Participant
} from './types';
import type { SupportedLocale } from '../i18n/types';
import { getConfig } from '../../lib/config';
import { callOpenRouter } from '../../lib/openrouter';
import { logError, logInfo } from '../../lib/telemetry';
import { analyzeMediaArtifact } from '../../lib/vision';
import { getSystemPrompt, getUserPrompt } from './prompts';

const ANALYSIS_VERSION = '1.0.0';


/**
 * Chunk messages for LLM processing (respect token limits).
 * Larger chunks = fewer API calls = less rate limiting risk.
 * We also hard-cap the total number of chunks for very large conversations
 * to avoid hammering the OpenRouter API with hundreds of requests.
 */
function chunkMessages(
  messages: Message[],
  maxChunkSize: number = 1000,
  maxChunks: number = 25
): Message[][] {
  const rawChunks: Message[][] = [];
  for (let i = 0; i < messages.length; i += maxChunkSize) {
    rawChunks.push(messages.slice(i, i + maxChunkSize));
  }

  if (rawChunks.length <= maxChunks) {
    return rawChunks;
  }

  // For extremely large conversations, sample a fixed number of chunks
  // distributed across the entire timeline. This keeps analysis tractable
  // and within rate limits while still capturing patterns over time.
  const sampledChunks: Message[][] = [];
  const step = rawChunks.length / maxChunks;
  for (let i = 0; i < maxChunks; i++) {
    const index = Math.floor(i * step);
    sampledChunks.push(rawChunks[index]);
  }

  return sampledChunks;
}

/**
 * Format messages for LLM context, including media context.
 */
function formatMessagesForLLM(
  messages: Message[],
  mediaArtifacts: MediaArtifact[],
  participants: Participant[] = []
): string {
  // Create a map of senderId to displayName
  const participantMap = new Map<string, string>();
  participants.forEach(p => {
    participantMap.set(p.id, p.displayName);
  });
  
  return messages
    .map((msg) => {
      const date = new Date(msg.sentAt).toLocaleDateString();
      let text = msg.text || '';
      
      // Add media context if message has media
      if (msg.mediaArtifactId) {
        const media = mediaArtifacts.find(m => m.id === msg.mediaArtifactId);
        if (media) {
          const mediaContext = media.labels && media.labels.length > 0
            ? ` [${media.type}: ${media.labels.join(', ')}${media.sentimentHint !== 'unknown' ? `, ${media.sentimentHint}` : ''}]`
            : ` [${media.type}]`;
          text += mediaContext;
        } else {
          text += ' [media/attachment]';
        }
      }
      
      // Use display name if available, otherwise use senderId
      const senderName = participantMap.get(msg.senderId) || msg.senderId;
      
      return `[${date}] ${senderName}: ${text}`;
    })
    .join('\n');
}

/**
 * Update analysis progress (helper function)
 */
async function updateProgress(
  conversationId: string,
  updates: {
    status?: 'starting' | 'parsing' | 'analyzing' | 'media' | 'chunking' | 'completed' | 'error';
    progress?: number;
    currentChunk?: number;
    totalChunks?: number;
    message?: string;
    error?: string;
  }
) {
  try {
    // Use absolute URL for server-side calls. Prefer an explicit base URL
    // when provided; otherwise, derive it from Vercel env or fall back
    // to localhost for local development.
    const baseUrl =
      process.env.NEXT_PUBLIC_BASE_URL ||
      (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000');
    const url = `${baseUrl}/api/analyze/progress`;
    
    await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        conversationId,
        ...updates
      })
    });
  } catch {
    // Ignore progress update errors
  }
}

/**
 * Analyze a conversation and generate an AnalysisResult.
 * Optionally analyzes media artifacts using vision API.
 * @param enhancedAnalysis - If true, uses more detailed prompts and deeper analysis
 * @param conversationId - Conversation ID for progress updates
 */
export async function analyzeConversation(
  conversation: Conversation,
  messages: Message[],
  mediaArtifacts: MediaArtifact[] = [],
  enhancedAnalysis: boolean = false,
  conversationId?: string,
  participants: Participant[] = [],
  locale: SupportedLocale = 'en'
): Promise<AnalysisResult> {
  const analysisId = `analysis_${conversation.id}_${Date.now()}`;
  logInfo('analysis_started', { 
    conversationId: conversation.id, 
    messageCount: messages.length,
    mediaCount: mediaArtifacts.length 
  });

  try {
    const progressId = conversationId || conversation.id;
    
    // Update progress: parsing
    await updateProgress(progressId, {
      status: 'parsing',
      progress: 5
    });

    // Analyze media artifacts (images, stickers, GIFs) using vision API
    // Limit to first 20 media items to avoid excessive API calls
    const mediaToAnalyze = mediaArtifacts
      .filter(m => ['image', 'sticker', 'gif'].includes(m.type))
      .slice(0, 20);
    
    logInfo('media_analysis_started', { count: mediaToAnalyze.length });
    
    if (mediaToAnalyze.length > 0) {
      await updateProgress(progressId, {
        status: 'media',
        progress: 10
      });
    }
    
    for (let i = 0; i < mediaToAnalyze.length; i++) {
      const media = mediaToAnalyze[i];
      try {
        // For now, we analyze media that has transientPathOrUrl (base64 data URL)
        // In production, you'd convert blob files to data URLs first
        if (media.transientPathOrUrl) {
          const analysis = await analyzeMediaArtifact(media, media.transientPathOrUrl);
          media.labels = analysis.labels;
          media.sentimentHint = analysis.sentiment;
          media.notes = analysis.description;
        }
      } catch (mediaError) {
        logError('media_analysis_error', {
          mediaId: media.id,
          error: (mediaError as Error).message
        });
        // Continue with other media even if one fails
      }
      
      // Update progress for media analysis
      if ((i + 1) % 5 === 0 || i === mediaToAnalyze.length - 1) {
        await updateProgress(progressId, {
          status: 'media',
          progress: 10 + Math.floor((i + 1) / mediaToAnalyze.length * 10)
        });
      }
    }

    // Chunk messages if needed (for very large conversations).
    // Using much larger chunks and a hard cap on total chunks to
    // significantly reduce the number of LLM calls per analysis.
    const chunks = chunkMessages(messages);
    
    await updateProgress(progressId, {
      status: 'chunking',
      progress: 20,
      totalChunks: chunks.length
    });
    
    const allSections: AnalysisSection[] = [];
    let gaslightingScore = 0;
    let conflictScore = 0;
    let supportScore = 0;
    let apologyScore = 0;

    // Analyze each chunk and aggregate
    // Add delay between chunks to avoid rate limiting
    const delayBetweenChunks = 500; // 500ms delay between chunks
    
    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i];
      const formattedText = formatMessagesForLLM(chunk, mediaArtifacts, participants);
      
      // Add delay between chunks (except first one) to avoid rate limiting
      if (i > 0) {
        await new Promise(resolve => setTimeout(resolve, delayBetweenChunks));
      }

      // Calculate base progress for this chunk
      const baseProgress = 20 + Math.floor((i / chunks.length) * 70);
      const chunkProgressRange = Math.floor(70 / chunks.length);
      
      // Update progress: analyzing chunk
      await updateProgress(progressId, {
        status: 'analyzing',
        progress: baseProgress,
        currentChunk: i + 1,
        totalChunks: chunks.length
      });

      const systemPrompt = getSystemPrompt(locale, enhancedAnalysis);
      
      // Add media context to prompt if available
      const mediaContext = mediaArtifacts.length > 0
        ? `\n\n${locale === 'ru' ? 'Примечание' : locale === 'fr' ? 'Note' : locale === 'de' ? 'Hinweis' : locale === 'es' ? 'Nota' : locale === 'pt' ? 'Nota' : 'Note'}: ${locale === 'ru' 
          ? `Эта переписка включает ${mediaArtifacts.length} медиа-элементов (изображения, стикеры, GIF и т.д.). Некоторые были проанализированы на содержание, настроение и метки. Контекст медиа включен в форматирование сообщений, где доступно.`
          : locale === 'fr'
          ? `Cette conversation comprend ${mediaArtifacts.length} éléments multimédias (images, autocollants, GIF, etc.). Certains ont été analysés pour le contenu, le sentiment et les étiquettes. Le contexte média est inclus dans le formatage des messages lorsque disponible.`
          : locale === 'de'
          ? `Diese Konversation enthält ${mediaArtifacts.length} Medienelemente (Bilder, Sticker, GIFs usw.). Einige wurden auf Inhalt, Stimmung und Beschriftungen analysiert. Medienkontext ist in der Nachrichtenformatierung enthalten, wo verfügbar.`
          : locale === 'es'
          ? `Esta conversación incluye ${mediaArtifacts.length} elementos multimedia (imágenes, stickers, GIFs, etc.). Algunos han sido analizados por contenido, sentimiento y etiquetas. El contexto multimedia se incluye en el formato de mensajes cuando está disponible.`
          : locale === 'pt'
          ? `Esta conversa inclui ${mediaArtifacts.length} itens de mídia (imagens, stickers, GIFs, etc.). Alguns foram analisados quanto ao conteúdo, sentimento e rótulos. O contexto de mídia está incluído na formatação de mensagens quando disponível.`
          : `This conversation includes ${mediaArtifacts.length} media items (images, stickers, GIFs, etc.). Some have been analyzed for content, sentiment, and labels. Media context is included in message formatting where available.`}`
        : '';
      
      const userPrompt = getUserPrompt(locale, chunk.length, mediaContext, formattedText);

      // Start heartbeat progress updates during LLM call
      let heartbeatCount = 0;
      const maxHeartbeats = 10; // Maximum heartbeat updates per chunk
      const heartbeatInterval = setInterval(async () => {
        heartbeatCount++;
        // Progressively increase progress to show activity
        const progressIncrement = Math.min(
          Math.floor(chunkProgressRange * 0.1 * heartbeatCount), 
          chunkProgressRange - 5 // Don't exceed chunk range
        );
        const currentProgress = baseProgress + progressIncrement;
        
        await updateProgress(progressId, {
          status: 'analyzing',
          progress: currentProgress,
          currentChunk: i + 1,
          totalChunks: chunks.length
        });
        
        // Stop if we've reached max heartbeats
        if (heartbeatCount >= maxHeartbeats) {
          clearInterval(heartbeatInterval);
        }
      }, 2000); // Update every 2 seconds

      let response;
      try {
        response = await callOpenRouter({
          model: getConfig().textModel,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
          ],
          // Use a generous token budget to allow the model to return
          // full sections and evidence. Rate limiting is primarily
          // controlled via chunking and OpenRouter throttling.
          max_tokens: 2000,
          temperature: 0.7
        });
      } finally {
        // Stop heartbeat updates
        clearInterval(heartbeatInterval);
        
        // Update progress to show chunk completion
        await updateProgress(progressId, {
          status: 'analyzing',
          progress: baseProgress + chunkProgressRange - 2,
          currentChunk: i + 1,
          totalChunks: chunks.length
        });
      }

      const content = response.choices[0]?.message?.content || '{}';
      let parsed: {
        overviewSummary?: string;
        gaslightingRiskScore?: number;
        conflictIntensityScore?: number;
        supportivenessScore?: number;
        apologyFrequencyScore?: number;
        sections?: Array<{
          id?: string;
          title?: string;
          summary?: string;
          plainSummary?: string;
          score?: number | null;
          evidenceSnippets?: Array<{
            excerpt?: string;
            explanation?: string;
          }>;
        }>;
      };
      try {
        // Try to extract JSON from markdown code blocks if present
        const jsonMatch = content.match(/```json\s*([\s\S]*?)\s*```/) || content.match(/```\s*([\s\S]*?)\s*```/);
        parsed = JSON.parse(jsonMatch ? jsonMatch[1] : content);
      } catch (parseError) {
        logError('analysis_parse_error', {
          conversationId: conversation.id,
          error: (parseError as Error).message,
          contentPreview: content.substring(0, 200)
        });
        // Fallback: create minimal result
        parsed = {
          overviewSummary: 'Analysis completed with partial results due to parsing error.',
          gaslightingRiskScore: 0.5,
          conflictIntensityScore: 0.5,
          supportivenessScore: 0.5,
          apologyFrequencyScore: 0.5,
          sections: []
        };
      }

      // Aggregate scores (simple average for now)
      gaslightingScore += parsed.gaslightingRiskScore || 0;
      conflictScore += parsed.conflictIntensityScore || 0;
      supportScore += parsed.supportivenessScore || 0;
      apologyScore += parsed.apologyFrequencyScore || 0;

      // Collect sections
      if (parsed.sections && Array.isArray(parsed.sections)) {
        allSections.push(...parsed.sections.map((s) => ({
          id: s.id || `section_${Date.now()}_${Math.random()}`,
          title: s.title || 'Pattern',
          summary: s.summary || '',
          plainSummary: s.plainSummary || undefined,
          score: s.score ?? undefined,
          evidenceSnippets: (s.evidenceSnippets || []).map((e) => ({
            messageId: null,
            mediaArtifactId: null,
            excerpt: e.excerpt || '',
            explanation: e.explanation || ''
          }))
        })));
      }
    }

    // Update progress: finalizing
    await updateProgress(progressId, {
      status: 'analyzing',
      progress: 95
    });

    // Average scores across chunks
    const chunkCount = chunks.length;
    const result: AnalysisResult = {
      id: analysisId,
      conversationId: conversation.id,
      createdAt: new Date().toISOString(),
      version: ANALYSIS_VERSION,
      gaslightingRiskScore: chunkCount > 0 ? gaslightingScore / chunkCount : 0,
      conflictIntensityScore: chunkCount > 0 ? conflictScore / chunkCount : 0,
      supportivenessScore: chunkCount > 0 ? supportScore / chunkCount : 0,
      apologyFrequencyScore: chunkCount > 0 ? apologyScore / chunkCount : 0,
      otherPatternScores: {},
      overviewSummary: allSections.length > 0
        ? allSections[0].summary
        : 'Analysis completed. Review sections for detailed insights.',
      sections: allSections.length > 0
        ? allSections
        : [
            {
              id: 'default',
              title: 'Analysis',
              summary: 'Analysis completed. No specific patterns detected in this excerpt.',
              evidenceSnippets: []
            }
          ]
    };

    logInfo('analysis_completed', {
      conversationId: conversation.id,
      analysisId,
      sectionCount: result.sections.length
    });

    // Update progress: completed
    await updateProgress(progressId, {
      status: 'completed',
      progress: 100
    });

    return result;
  } catch (error) {
    const progressId = conversationId || conversation.id;
    await updateProgress(progressId, {
      status: 'error',
      progress: 0,
      error: (error as Error).message
    });
    
    logError('analysis_failed', {
      conversationId: conversation.id,
      error: (error as Error).message
    });
    throw new Error(`Analysis failed: ${(error as Error).message}`);
  }
}

