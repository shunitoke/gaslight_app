import type {
  Conversation,
  Message,
  AnalysisResult,
  AnalysisSection,
  MediaArtifact,
  Participant,
  ParticipantProfile,
  ImportantDate
} from './types';
import type { SupportedLocale } from '../i18n/types';
import { getConfig } from '../../lib/config';
import { callLLM, type LLMResponse } from '../../lib/llmClient';
import { logError, logInfo, logWarn } from '../../lib/telemetry';
import { analyzeMediaArtifact } from '../../lib/vision';
import { getSystemPrompt, getUserPrompt } from './prompts';
import { updateProgress as updateProgressDirect } from '../../lib/progress';

const ANALYSIS_VERSION = '1.0.0';

/**
 * Get translated default messages for analysis results
 */
function getDefaultMessages(locale: SupportedLocale): {
  defaultOverview: string;
  defaultNoPatterns: string;
  defaultTitle: string;
  parseError: string;
} {
  const messages: Record<SupportedLocale, {
    defaultOverview: string;
    defaultNoPatterns: string;
    defaultTitle: string;
    parseError: string;
  }> = {
    en: {
      defaultOverview: 'Analysis completed. Review sections for detailed insights.',
      defaultNoPatterns: 'Analysis completed. No specific patterns detected in this excerpt.',
      defaultTitle: 'Analysis',
      parseError: 'Analysis completed with partial results due to parsing error.'
    },
    ru: {
      defaultOverview: 'Анализ завершен. Просмотрите разделы для подробных выводов.',
      defaultNoPatterns: 'Анализ завершен. В этом отрывке не обнаружено конкретных паттернов.',
      defaultTitle: 'Анализ',
      parseError: 'Анализ завершен с частичными результатами из-за ошибки парсинга.'
    },
    fr: {
      defaultOverview: 'Analyse terminée. Consultez les sections pour des informations détaillées.',
      defaultNoPatterns: 'Analyse terminée. Aucun modèle spécifique détecté dans cet extrait.',
      defaultTitle: 'Analyse',
      parseError: 'Analyse terminée avec des résultats partiels en raison d\'une erreur d\'analyse.'
    },
    de: {
      defaultOverview: 'Analyse abgeschlossen. Überprüfen Sie die Abschnitte für detaillierte Einblicke.',
      defaultNoPatterns: 'Analyse abgeschlossen. Keine spezifischen Muster in diesem Auszug erkannt.',
      defaultTitle: 'Analyse',
      parseError: 'Analyse mit teilweisen Ergebnissen abgeschlossen aufgrund eines Parsing-Fehlers.'
    },
    es: {
      defaultOverview: 'Análisis completado. Revise las secciones para obtener información detallada.',
      defaultNoPatterns: 'Análisis completado. No se detectaron patrones específicos en este extracto.',
      defaultTitle: 'Análisis',
      parseError: 'Análisis completado con resultados parciales debido a un error de análisis.'
    },
    pt: {
      defaultOverview: 'Análise concluída. Revise as seções para obter insights detalhados.',
      defaultNoPatterns: 'Análise concluída. Nenhum padrão específico detectado neste trecho.',
      defaultTitle: 'Análise',
      parseError: 'Análise concluída com resultados parciais devido a um erro de análise.'
    }
  };
  
  return messages[locale] || messages.en;
}


/**
 * Chunk messages for LLM processing (respect token limits).
 * Larger chunks = fewer API calls = less rate limiting risk.
 * We also hard-cap the total number of chunks for very large conversations
 * to avoid hammering the underlying LLM provider with hundreds of requests.
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
 * Uses direct function call instead of fetch for reliability in serverless environments
 */
async function updateProgress(
  conversationId: string,
  updates: {
    status?: 'starting' | 'parsing' | 'analyzing' | 'media' | 'chunking' | 'finalizing' | 'completed' | 'error';
    progress?: number;
    currentChunk?: number;
    totalChunks?: number;
    message?: string;
    error?: string;
  }
) {
  // Use direct function call instead of fetch for better reliability
  // in serverless environments where baseUrl might be incorrect
  await updateProgressDirect(conversationId, updates);
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
    const allParticipantProfiles = new Map<string, ParticipantProfile>();
    const allImportantDates = new Map<string, import('./types').ImportantDate>();
    const allOverviewSummaries: string[] = []; // Collect overview summaries from all chunks
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
      
      const userPrompt = getUserPrompt(
        locale,
        chunk.length,
        mediaContext,
        formattedText,
        enhancedAnalysis
      );

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

      let response: LLMResponse | undefined;
      let content = '{}';
      let parseAttempts = 0;
      const maxParseAttempts = 2;
      
      while (parseAttempts < maxParseAttempts) {
        try {
          response = await callLLM({
            model: getConfig().textModel,
            messages: parseAttempts === 0 
              ? [
                  { role: 'system', content: systemPrompt },
                  { role: 'user', content: userPrompt }
                ]
              : [
                  { role: 'system', content: systemPrompt },
                  { role: 'user', content: userPrompt },
                  { role: 'assistant', content: response?.choices[0]?.message?.content || '' },
                  { role: 'user', content: 'The JSON you returned was invalid or incomplete. Please return ONLY valid JSON that can be parsed by JSON.parse(). Ensure all quotes are escaped, all strings are closed, and all sections include at least 2 evidenceSnippets with actual quotes from the conversation.' }
                ],
            // Use a generous token budget to allow the model to return
            // full sections and evidence. Rate limiting is primarily
            // controlled via chunking and provider-specific throttling.
            // Increased from 2000 to 4000 to ensure complete responses with evidence snippets
            max_tokens: 4000,
            temperature: parseAttempts === 0 ? 0.7 : 0.3 // Lower temperature on retry for more consistent JSON
          });
          
          // Validate response structure
          if (!response) {
            logError('llm_no_response', {
              conversationId: conversation.id,
              chunkIndex: i + 1,
              attempt: parseAttempts + 1
            });
            parseAttempts++;
            if (parseAttempts >= maxParseAttempts) {
              break;
            }
            continue;
          }
          
          if (!response.choices || response.choices.length === 0) {
            logError('llm_no_choices', {
              conversationId: conversation.id,
              chunkIndex: i + 1,
              attempt: parseAttempts + 1,
              responseId: response.id
            });
            parseAttempts++;
            if (parseAttempts >= maxParseAttempts) {
              break;
            }
            continue;
          }
          
          content = response.choices[0]?.message?.content || '{}';
          
          // Log what we received from LLM
          logInfo('llm_response_received', {
            conversationId: conversation.id,
            chunkIndex: i + 1,
            attempt: parseAttempts + 1,
            contentLength: content.length,
            contentPreview: content.substring(0, 200),
            isEmpty: content.trim().length === 0 || content === '{}',
            hasChoices: !!response.choices?.[0],
            hasMessage: !!response.choices?.[0]?.message,
            hasContent: !!response.choices?.[0]?.message?.content
          });
          
          // Check if content is actually empty or just default fallback
          if (!content || content.trim().length === 0 || content === '{}') {
            logError('llm_empty_response', {
              conversationId: conversation.id,
              chunkIndex: i + 1,
              attempt: parseAttempts + 1,
              responseStructure: {
                hasChoices: !!response.choices,
                choicesLength: response.choices?.length || 0,
                firstChoice: response.choices?.[0] ? {
                  hasMessage: !!response.choices[0].message,
                  messageRole: response.choices[0].message?.role,
                  hasContent: !!response.choices[0].message?.content,
                  contentLength: response.choices[0].message?.content?.length || 0
                } : null
              }
            });
            
            // If we got empty response, try retry
            parseAttempts++;
            if (parseAttempts >= maxParseAttempts) {
              break; // Give up
            }
            logWarn('llm_empty_response_retry', {
              conversationId: conversation.id,
              chunkIndex: i + 1,
              attempt: parseAttempts
            });
            continue;
          }
          
          // Try to parse immediately - if successful, break the loop
          let jsonContent = content;
          const jsonMatch = content.match(/```json\s*([\s\S]*?)\s*```/) || content.match(/```\s*([\s\S]*?)\s*```/);
          if (jsonMatch) {
            jsonContent = jsonMatch[1];
          }
          
          // Quick validation: try to parse
          try {
            JSON.parse(jsonContent.trim());
            // If parsing succeeds, break the loop
            break;
          } catch {
            // If parsing fails, continue to retry
            parseAttempts++;
            if (parseAttempts >= maxParseAttempts) {
              break; // Give up and try to salvage
            }
            logWarn('analysis_json_retry', {
              conversationId: conversation.id,
              chunkIndex: i + 1,
              attempt: parseAttempts
            });
            continue;
          }
        } catch (llmError) {
          logError('analysis_llm_error', {
            conversationId: conversation.id,
            chunkIndex: i + 1,
            error: (llmError as Error).message,
            attempt: parseAttempts
          });
          // If LLM call fails, break and try to salvage what we have
          break;
        }
      }
      
      try {
        // Stop heartbeat updates
        clearInterval(heartbeatInterval);
        
        // Update progress to show chunk completion
        await updateProgress(progressId, {
          status: 'analyzing',
          progress: baseProgress + chunkProgressRange - 2,
          currentChunk: i + 1,
          totalChunks: chunks.length
        });
      } catch (progressError) {
        // Ignore progress update errors
      }
      
      // Declare parsed variable
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
          recommendedReplies?: Array<{
            text?: string;
            tone?: string | null;
            fromRole?: 'user' | 'other' | 'neutral';
          }>;
        }>;
        participantProfiles?: Array<{
          participantId?: string;
          profile?: string;
          inferredGender?: 'male' | 'female' | 'neutral' | null;
        }>;
        importantDates?: Array<{
          date?: string;
          reason?: string;
          severity?: number;
          sectionId?: string;
          excerpt?: string;
        }>;
      };
      
      // Final check: if content is still empty after all attempts, create fallback immediately
      if (!content || content.trim().length === 0 || content === '{}') {
        logError('llm_final_empty_response', {
          conversationId: conversation.id,
          chunkIndex: i + 1,
          parseAttempts,
          maxParseAttempts
        });
        
        // Create fallback result for this chunk
        const defaultMsgs = getDefaultMessages(locale);
        parsed = {
          overviewSummary: defaultMsgs.parseError + ' (Empty response from LLM)',
          gaslightingRiskScore: 0.5,
          conflictIntensityScore: 0.5,
          supportivenessScore: 0.5,
          apologyFrequencyScore: 0.5,
          sections: []
        };
        
        // Skip to aggregation
        gaslightingScore += parsed.gaslightingRiskScore || 0;
        conflictScore += parsed.conflictIntensityScore || 0;
        supportScore += parsed.supportivenessScore || 0;
        apologyScore += parsed.apologyFrequencyScore || 0;
        
        if (parsed.overviewSummary && parsed.overviewSummary.trim().length > 0) {
          allOverviewSummaries.push(parsed.overviewSummary.trim());
        }
        
        continue; // Skip to next chunk
      }
      
      try {
        // Try to extract JSON from markdown code blocks if present
        let jsonContent = content;
        const jsonMatch = content.match(/```json\s*([\s\S]*?)\s*```/) || content.match(/```\s*([\s\S]*?)\s*```/);
        if (jsonMatch) {
          jsonContent = jsonMatch[1];
        }

        // Try to fix common JSON errors before parsing
        // Fix unescaped quotes in strings (but preserve escaped quotes)
        let fixedJson = jsonContent
          .replace(/([^\\])"/g, (match, p1) => {
            // Don't fix if it's already escaped or part of a key
            if (p1 === ':' || p1 === '{' || p1 === '[' || p1 === ',') {
              return match;
            }
            return p1 + '\\"';
          })
          // Fix single quotes to double quotes (but not inside strings)
          .replace(/'/g, '"')
          // Fix trailing commas
          .replace(/,(\s*[}\]])/g, '$1');

        try {
          parsed = JSON.parse(fixedJson);
          logInfo('analysis_json_parsed_success', {
            conversationId: conversation.id,
            chunkIndex: i + 1,
            hasOverview: !!parsed.overviewSummary,
            overviewLength: parsed.overviewSummary?.length || 0,
            sectionsCount: parsed.sections?.length || 0,
            sectionsWithEvidence: parsed.sections?.filter(s => s.evidenceSnippets && s.evidenceSnippets.length > 0).length || 0,
            sectionsWithoutEvidence: parsed.sections?.filter(s => !s.evidenceSnippets || s.evidenceSnippets.length === 0).length || 0
          });
        } catch {
          // If fixing didn't work, try original
          try {
            parsed = JSON.parse(jsonContent);
            logInfo('analysis_json_parsed_success_original', {
              conversationId: conversation.id,
              chunkIndex: i + 1,
              hasOverview: !!parsed.overviewSummary,
              overviewLength: parsed.overviewSummary?.length || 0,
              sectionsCount: parsed.sections?.length || 0
            });
          } catch (parseError2) {
            // Both attempts failed, will be caught by outer catch
            throw parseError2;
          }
        }
        
        // Validate that sections have evidence snippets
        if (parsed.sections && Array.isArray(parsed.sections)) {
          const sectionsWithoutEvidence = parsed.sections.filter(
            s => !s.evidenceSnippets || s.evidenceSnippets.length === 0
          );
          if (sectionsWithoutEvidence.length > 0) {
            logWarn('analysis_sections_without_evidence', {
              conversationId: conversation.id,
              chunkIndex: i + 1,
              totalSections: parsed.sections.length,
              sectionsWithoutEvidence: sectionsWithoutEvidence.length,
              sectionIds: sectionsWithoutEvidence.map(s => ({
                id: s.id || 'unknown',
                title: s.title || 'unknown',
                hasEvidenceArray: !!s.evidenceSnippets,
                evidenceCount: s.evidenceSnippets?.length || 0
              }))
            });
          }
        }
      } catch (parseError) {
        logError('analysis_parse_error', {
          conversationId: conversation.id,
          chunkIndex: i + 1,
          error: (parseError as Error).message,
          contentPreview: content.substring(0, 500),
          contentLength: content.length
        });
        
        // Try to salvage data from broken JSON using regex
        const defaultMsgs = getDefaultMessages(locale);
        
        // Extract overviewSummary - handle multiline strings with escaped quotes
        let overviewFromContent: string | undefined;
        const overviewMatch = content.match(/"overviewSummary"\s*:\s*"((?:[^"\\]|\\.)*)"/);
        if (overviewMatch && overviewMatch[1]) {
          overviewFromContent = overviewMatch[1]
            .replace(/\\"/g, '"')
            .replace(/\\n/g, '\n')
            .replace(/\\t/g, '\t')
            .replace(/\\\\/g, '\\')
            .trim();
        } else {
          // Fallback: try to find overviewSummary even with broken quotes
          const overviewMatch2 = content.match(/"overviewSummary"\s*:\s*"([^"]*(?:\\.[^"]*)*)"/);
          if (overviewMatch2 && overviewMatch2[1]) {
            overviewFromContent = overviewMatch2[1]
              .replace(/\\"/g, '"')
              .replace(/\\n/g, '\n')
              .trim();
          }
        }

        // Try to extract scores
        const gaslightingMatch = content.match(/"gaslightingRiskScore"\s*:\s*([0-9.]+)/);
        const conflictMatch = content.match(/"conflictIntensityScore"\s*:\s*([0-9.]+)/);
        const supportMatch = content.match(/"supportivenessScore"\s*:\s*([0-9.]+)/);
        const apologyMatch = content.match(/"apologyFrequencyScore"\s*:\s*([0-9.]+)/);

        // Try to extract sections with evidence snippets - more aggressive approach
        // First try structured approach
        const sectionsMatch = content.match(/"sections"\s*:\s*\[([\s\S]*?)\]/);
        let salvagedSections: any[] = [];
        if (sectionsMatch) {
          // Try to find sections with evidenceSnippets
          const sectionMatches = sectionsMatch[1].match(/\{[^}]*"evidenceSnippets"\s*:\s*\[[^\]]*\]/g);
          if (sectionMatches) {
            salvagedSections = sectionMatches.map((sectionStr, idx) => {
              const idMatch = sectionStr.match(/"id"\s*:\s*"([^"]+)"/);
              const titleMatch = sectionStr.match(/"title"\s*:\s*"((?:[^"\\]|\\.)*)"/);
              const summaryMatch = sectionStr.match(/"summary"\s*:\s*"((?:[^"\\]|\\.)*)"/);
              const evidenceMatch = sectionStr.match(/"evidenceSnippets"\s*:\s*\[([^\]]+)\]/);
              
              const evidenceSnippets: any[] = [];
              if (evidenceMatch) {
                const excerptMatches = evidenceMatch[1].match(/"excerpt"\s*:\s*"((?:[^"\\]|\\.)*)"/g);
                const explanationMatches = evidenceMatch[1].match(/"explanation"\s*:\s*"((?:[^"\\]|\\.)*)"/g);
                
                if (excerptMatches && explanationMatches) {
                  const minLength = Math.min(excerptMatches.length, explanationMatches.length);
                  for (let j = 0; j < minLength; j++) {
                    const excerpt = excerptMatches[j].match(/"excerpt"\s*:\s*"((?:[^"\\]|\\.)*)"/)?.[1]
                      ?.replace(/\\"/g, '"').replace(/\\n/g, '\n').trim();
                    const explanation = explanationMatches[j].match(/"explanation"\s*:\s*"((?:[^"\\]|\\.)*)"/)?.[1]
                      ?.replace(/\\"/g, '"').replace(/\\n/g, '\n').trim();
                    
                    if (excerpt && explanation) {
                      evidenceSnippets.push({ excerpt, explanation });
                    }
                  }
                }
              }

              if (evidenceSnippets.length > 0) {
                return {
                  id: idMatch?.[1] || `section_${idx}`,
                  title: titleMatch?.[1]?.replace(/\\"/g, '"').replace(/\\n/g, '\n') || 'Pattern',
                  summary: summaryMatch?.[1]?.replace(/\\"/g, '"').replace(/\\n/g, '\n') || '',
                  evidenceSnippets
                };
              }
              return null;
            }).filter(s => s !== null);
          }
        }
        
        // If no sections found, try to extract any evidence snippets from the entire content
        if (salvagedSections.length === 0) {
          // Look for any patterns like "excerpt": "..." followed by "explanation": "..."
          const allExcerpts = content.match(/"excerpt"\s*:\s*"((?:[^"\\]|\\.)*)"/g) || [];
          const allExplanations = content.match(/"explanation"\s*:\s*"((?:[^"\\]|\\.)*)"/g) || [];
          
          if (allExcerpts.length > 0 && allExplanations.length > 0) {
            const minLength = Math.min(allExcerpts.length, allExplanations.length);
            const evidenceSnippets: any[] = [];
            
            for (let j = 0; j < minLength; j++) {
              const excerpt = allExcerpts[j].match(/"excerpt"\s*:\s*"((?:[^"\\]|\\.)*)"/)?.[1]
                ?.replace(/\\"/g, '"').replace(/\\n/g, '\n').trim();
              const explanation = allExplanations[j].match(/"explanation"\s*:\s*"((?:[^"\\]|\\.)*)"/)?.[1]
                ?.replace(/\\"/g, '"').replace(/\\n/g, '\n').trim();
              
              if (excerpt && explanation && excerpt.length > 10 && explanation.length > 10) {
                evidenceSnippets.push({ excerpt, explanation });
              }
            }
            
            if (evidenceSnippets.length > 0) {
              // Try to find section title/id from context
              const sectionIdMatch = content.match(/"id"\s*:\s*"([^"]+)"/);
              const sectionTitleMatch = content.match(/"title"\s*:\s*"((?:[^"\\]|\\.)*)"/);
              
              salvagedSections = [{
                id: sectionIdMatch?.[1] || 'gaslighting',
                title: sectionTitleMatch?.[1]?.replace(/\\"/g, '"').replace(/\\n/g, '\n') || 'Pattern Analysis',
                summary: overviewFromContent || 'Analysis of conversation patterns',
                evidenceSnippets
              }];
            }
          }
        }

        parsed = {
          overviewSummary: overviewFromContent || defaultMsgs.parseError,
          gaslightingRiskScore: gaslightingMatch ? parseFloat(gaslightingMatch[1]) : 0.5,
          conflictIntensityScore: conflictMatch ? parseFloat(conflictMatch[1]) : 0.5,
          supportivenessScore: supportMatch ? parseFloat(supportMatch[1]) : 0.5,
          apologyFrequencyScore: apologyMatch ? parseFloat(apologyMatch[1]) : 0.5,
          sections: salvagedSections.length > 0 ? salvagedSections : []
        };
        
        // Log what we salvaged
        logWarn('analysis_salvaged_data', {
          conversationId: conversation.id,
          chunkIndex: i + 1,
          hasOverview: !!overviewFromContent,
          overviewLength: overviewFromContent?.length || 0,
          sectionsCount: salvagedSections.length,
          totalEvidenceSnippets: salvagedSections.reduce((sum, s) => sum + (s.evidenceSnippets?.length || 0), 0),
          contentLength: content.length,
          contentPreview: content.substring(0, 300)
        });
      }

      // Aggregate scores (simple average for now)
      gaslightingScore += parsed.gaslightingRiskScore || 0;
      conflictScore += parsed.conflictIntensityScore || 0;
      supportScore += parsed.supportivenessScore || 0;
      apologyScore += parsed.apologyFrequencyScore || 0;
      
      // Collect overview summary if available
      if (parsed.overviewSummary && parsed.overviewSummary.trim().length > 0) {
        allOverviewSummaries.push(parsed.overviewSummary.trim());
      }

      // Collect sections - filter out sections without evidence snippets to avoid generic warnings
      if (parsed.sections && Array.isArray(parsed.sections)) {
        logInfo('analysis_processing_sections', {
          conversationId: conversation.id,
          chunkIndex: i + 1,
          totalSections: parsed.sections.length,
          sectionsDetails: parsed.sections.map(s => ({
            id: s.id || 'unknown',
            title: s.title || 'unknown',
            hasEvidenceSnippets: !!s.evidenceSnippets,
            isArray: Array.isArray(s.evidenceSnippets),
            evidenceCount: s.evidenceSnippets?.length || 0,
            firstEvidenceExcerpt: s.evidenceSnippets?.[0]?.excerpt?.substring(0, 50) || 'none'
          }))
        });
        
        const validSections = parsed.sections
          .filter(s => s.evidenceSnippets && Array.isArray(s.evidenceSnippets) && s.evidenceSnippets.length > 0)
          .map((s) => ({
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
            })),
            recommendedReplies: Array.isArray(s.recommendedReplies)
              ? s.recommendedReplies
                  .map((r) => ({
                    text: (r && r.text) || '',
                    tone: r?.tone ?? null,
                    fromRole: r?.fromRole
                  }))
                  .filter((r) => r.text.trim().length > 0)
              : undefined
          }));
        
        logInfo('analysis_sections_filtered', {
          conversationId: conversation.id,
          chunkIndex: i + 1,
          beforeFilter: parsed.sections.length,
          afterFilter: validSections.length,
          filteredOut: parsed.sections.length - validSections.length
        });
        
        // Only add sections that have evidence snippets
        if (validSections.length > 0) {
          allSections.push(...validSections);
        } else {
          // Log warning if we got sections but they all lacked evidence
          logWarn('analysis_no_valid_sections', {
            conversationId: conversation.id,
            chunkIndex: i + 1,
            totalSections: parsed.sections.length,
            sectionsStructure: parsed.sections.map(s => ({
              id: s.id,
              title: s.title,
              hasEvidenceSnippets: !!s.evidenceSnippets,
              evidenceSnippetsType: typeof s.evidenceSnippets,
              evidenceSnippetsIsArray: Array.isArray(s.evidenceSnippets),
              evidenceSnippetsLength: s.evidenceSnippets?.length
            }))
          });
        }
      }

      // Collect participant profiles (premium feature)
      if (parsed.participantProfiles && Array.isArray(parsed.participantProfiles)) {
        parsed.participantProfiles.forEach((p) => {
          if (p.participantId && p.profile && p.profile.trim().length > 0) {
            allParticipantProfiles.set(p.participantId, {
              participantId: p.participantId,
              profile: p.profile.trim(),
              inferredGender: p.inferredGender ?? null
            });
          }
        });
      }

      // Collect important dates (premium feature)
      // Deduplicate by date, keep highest severity, and keep a representative section/excerpt for linking
      if (parsed.importantDates && Array.isArray(parsed.importantDates)) {
        parsed.importantDates.forEach((d) => {
          if (d.date && d.reason && d.reason.trim().length > 0) {
            const existing = allImportantDates.get(d.date);
            const severity = d.severity ?? 0.5;
            if (!existing || (existing.severity ?? 0) < severity) {
              allImportantDates.set(d.date, {
                date: d.date,
                reason: d.reason.trim(),
                severity,
                // Optional fields for deep-linking from calendar → evidence snippet
                sectionId: d.sectionId ?? existing?.sectionId,
                excerpt: d.excerpt ?? existing?.excerpt
              });
            }
          }
        });
      }
    }

    // Update progress: finalizing (can take a bit while we aggregate results)
    await updateProgress(progressId, {
      status: 'finalizing',
      progress: 95
    });

    // Average scores across chunks
    const chunkCount = chunks.length;
    const defaultMsgs = getDefaultMessages(locale);
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
      overviewSummary: allOverviewSummaries.length > 0
        ? allOverviewSummaries.join(' ') // Combine all overview summaries
        : (allSections.length > 0
          ? allSections[0].summary
          : defaultMsgs.defaultOverview),
      sections: allSections.length > 0
        ? allSections
        : [
            {
              id: 'default',
              title: defaultMsgs.defaultTitle,
              summary: defaultMsgs.defaultNoPatterns,
              evidenceSnippets: []
            }
          ],
      // Include participant profiles only if we have any (premium feature)
      participantProfiles: allParticipantProfiles.size > 0
        ? Array.from(allParticipantProfiles.values())
        : undefined,
      // Include important dates only if we have any (premium feature)
      importantDates: allImportantDates.size > 0
        ? Array.from(allImportantDates.values())
        : undefined
    };

    logInfo('analysis_completed', {
      conversationId: conversation.id,
      analysisId,
      sectionCount: result.sections.length,
      hasOverview: !!result.overviewSummary && result.overviewSummary.trim().length > 0,
      overviewLength: result.overviewSummary?.length || 0,
      overviewPreview: result.overviewSummary?.substring(0, 100) || 'none',
      sectionsDetails: result.sections.map(s => ({
        id: s.id,
        title: s.title,
        evidenceCount: s.evidenceSnippets?.length || 0,
        hasSummary: !!s.summary && s.summary.trim().length > 0,
        summaryPreview: s.summary?.substring(0, 50) || 'none'
      })),
      allSectionsCount: allSections.length,
      allOverviewSummariesCount: allOverviewSummaries.length
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

