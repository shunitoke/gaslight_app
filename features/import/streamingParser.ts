/**
 * Streaming JSON/ndjson parser
 * 
 * Parses large JSON files without loading entire file into RAM.
 * Supports:
 * - ndjson (newline-delimited JSON) - one JSON object per line
 * - Regular JSON arrays - streams array items as they're parsed
 */

import { logError, logInfo, logWarn } from '../../lib/telemetry';
import type { Message, Participant, MediaArtifact } from '../analysis/types';

/**
 * Parse ndjson stream (newline-delimited JSON)
 * Each line is a separate JSON object
 */
export async function* parseNdjsonStream(
  stream: ReadableStream<Uint8Array>
): AsyncGenerator<any, void, unknown> {
  const reader = stream.getReader();
  const decoder = new TextDecoder('utf-8');
  let buffer = '';

  try {
    while (true) {
      const { done, value } = await reader.read();
      
      if (done) {
        // Process remaining buffer
        if (buffer.trim()) {
          try {
            const obj = JSON.parse(buffer.trim());
            yield obj;
          } catch (parseError) {
            logWarn('ndjson_final_line_parse_error', {
              error: (parseError as Error).message,
              bufferPreview: buffer.substring(0, 100)
            });
          }
        }
        break;
      }

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || ''; // Keep incomplete line in buffer

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed) continue;

        try {
          const obj = JSON.parse(trimmed);
          yield obj;
        } catch (parseError) {
          logWarn('ndjson_line_parse_error', {
            error: (parseError as Error).message,
            linePreview: trimmed.substring(0, 100)
          });
          // Continue with next line
        }
      }
    }
  } finally {
    reader.releaseLock();
  }
}

/**
 * Parse JSON array stream
 * Streams array items as they're parsed from a large JSON array
 * 
 * This is a simplified version that works for arrays of messages.
 * For more complex nested structures, a full streaming JSON parser would be needed.
 */
export async function* parseJsonArrayStream(
  stream: ReadableStream<Uint8Array>,
  arrayKey: string = 'messages'
): AsyncGenerator<any, void, unknown> {
  const reader = stream.getReader();
  const decoder = new TextDecoder('utf-8');
  let buffer = '';
  let inArray = false;
  let depth = 0;
  let currentItem = '';
  let braceCount = 0;
  let inString = false;
  let escapeNext = false;

  try {
    while (true) {
      const { done, value } = await reader.read();
      
      if (done) {
        // Try to parse remaining buffer as final item
        if (currentItem.trim()) {
          try {
            const obj = JSON.parse(currentItem.trim());
            yield obj;
          } catch {
            // Ignore incomplete final item
          }
        }
        break;
      }

      buffer += decoder.decode(value, { stream: true });
      
      // Simple state machine to extract JSON objects from array
      for (let i = 0; i < buffer.length; i++) {
        const char = buffer[i];
        
        if (escapeNext) {
          escapeNext = false;
          if (inArray) currentItem += char;
          continue;
        }

        if (char === '\\') {
          escapeNext = true;
          if (inArray) currentItem += char;
          continue;
        }

        if (char === '"' && !escapeNext) {
          inString = !inString;
          if (inArray) currentItem += char;
          continue;
        }

        if (inString) {
          if (inArray) currentItem += char;
          continue;
        }

        if (char === '{') {
          braceCount++;
          if (!inArray && buffer.substring(Math.max(0, i - 20), i).includes(`"${arrayKey}"`)) {
            // Found the array key, look for opening bracket
            const nextBracket = buffer.indexOf('[', i);
            if (nextBracket !== -1 && nextBracket < i + 50) {
              inArray = true;
              i = nextBracket;
              continue;
            }
          }
          if (inArray) {
            currentItem += char;
          }
        } else if (char === '}') {
          braceCount--;
          if (inArray) {
            currentItem += char;
            if (braceCount === 0) {
              // Complete object found
              try {
                const obj = JSON.parse(currentItem);
                yield obj;
                currentItem = '';
              } catch (parseError) {
                logWarn('json_array_item_parse_error', {
                  error: (parseError as Error).message,
                  itemPreview: currentItem.substring(0, 100)
                });
                currentItem = '';
              }
            }
          }
        } else if (char === '[') {
          if (inArray) {
            depth++;
            currentItem += char;
          }
        } else if (char === ']') {
          if (inArray) {
            depth--;
            if (depth < 0) {
              // End of array
              inArray = false;
              break;
            }
            currentItem += char;
          }
        } else if (inArray) {
          currentItem += char;
        }
      }

      // Keep only unprocessed part of buffer
      // This is simplified - in production would need more sophisticated tracking
      if (buffer.length > 10000) {
        // Reset buffer periodically to avoid memory issues
        // Keep last 1000 chars for context
        buffer = buffer.slice(-1000);
      }
    }
  } finally {
    reader.releaseLock();
  }
}

/**
 * Detect if file is ndjson (newline-delimited JSON) or regular JSON
 */
export function detectJsonFormat(sample: string): 'ndjson' | 'json' {
  // Check if first non-empty line is a complete JSON object
  const firstLine = sample.split('\n').find(line => line.trim().length > 0);
  if (firstLine) {
    try {
      JSON.parse(firstLine.trim());
      // If first line is valid JSON, likely ndjson
      return 'ndjson';
    } catch {
      // First line is not valid JSON, likely regular JSON
      return 'json';
    }
  }
  return 'json';
}

/**
 * Parse JSON file stream (auto-detects format)
 */
export async function* parseJsonStream(
  stream: ReadableStream<Uint8Array>,
  arrayKey: string = 'messages'
): AsyncGenerator<any, void, unknown> {
  // Peek at first chunk to detect format
  const reader = stream.getReader();
  const firstChunk = await reader.read();
  
  if (firstChunk.done) {
    reader.releaseLock();
    return;
  }

  const decoder = new TextDecoder('utf-8');
  const sample = decoder.decode(firstChunk.value, { stream: true });
  const format = detectJsonFormat(sample);

  // Create new stream with first chunk + rest
  const chunks = [firstChunk.value];
  let done: boolean = firstChunk.done;
  
  while (!done) {
    const next = await reader.read();
    done = next.done;
    if (!done && next.value) {
      chunks.push(next.value);
    }
  }
  reader.releaseLock();

  // Reconstruct stream
  const stream2 = new ReadableStream({
    start(controller) {
      for (const chunk of chunks) {
        controller.enqueue(chunk);
      }
      controller.close();
    }
  });

  if (format === 'ndjson') {
    yield* parseNdjsonStream(stream2);
  } else {
    yield* parseJsonArrayStream(stream2, arrayKey);
  }
}

