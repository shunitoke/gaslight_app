# Соответствие архитектуры новому плану

## Таблица соответствия

| Приоритет | Что делаем | Статус | Где сейчас | Что нужно изменить |
|-----------|------------|--------|------------|-------------------|
| 1 | Потоковый парсинг JSON/ndjson → не грузим весь чат в RAM | ✅ ВЫПОЛНЕНО | `features/import/streamingParser.ts` + `parsers.ts` | ✅ Интегрирован в Telegram парсер, поддерживает ReadableStream для файлов >50MB |
| 2 | Сразу после upload → заливаем файл в Vercel Blob | ✅ ВЫПОЛНЕНО | `app/page.tsx` - всегда через Blob | ✅ Реализовано: убрана проверка размера, все файлы заливаются в Blob |
| 3 | Очередь задач через Redis | ✅ ЕСТЬ | `lib/kv.ts` + `app/api/analyze/start/route.ts` | Уже работает, но можно улучшить |
| 4 | Параллельный анализ чанков (10-20 одновременно) | ✅ ВЫПОЛНЕНО | `analysisService.ts` - батчи по 15 | ✅ Реализовано: `analyzeChunk()` + `Promise.all` с батчами |
| 5 | Кеширование готового результата по хешу чата | ✅ ВЫПОЛНЕНО | `lib/cache.ts` + `app/api/analyze/start/route.ts` | ✅ Реализовано: `computeChatHash()`, кеш в Redis (TTL 7 дней) |
| 6 | Стриминг ответов LLM (OpenRouter stream) | ✅ ВЫПОЛНЕНО | `lib/openrouter.ts` - `callOpenRouterStream()` | ✅ Реализовано: базовая поддержка стриминга через async generator |
| 7 | Прогресс → Redis | ✅ ЕСТЬ | `lib/kv.ts:setProgressInKv` | Уже работает |
| 8 | Media → Vercel Blob, потом base64 → Vision | ✅ ВЫПОЛНЕНО | `features/import/mediaExtractor.ts` + `lib/blob.ts` | ✅ Реализовано: media загружается в Blob, читается по требованию |

## Дополнительные изменения

### Промпты
- **Текущее**: ✅ ВЫПОЛНЕНО - Один промпт на английском (`prompts.ts`)
- **Реализовано**: Промпт всегда на английском, язык ответа указывается через `getLanguageInstruction(locale)` в промпте

### maxDuration
- **Текущее**: ✅ ВЫПОЛНЕНО - `analyze/start` = 900 сек (15 мин)
- **Реализовано**: Увеличено до 900 сек для background worker

### Опциональные улучшения
- **Потоковый парсинг для всех платформ**: ✅ ВЫПОЛНЕНО - iMessage, Messenger, Discord теперь поддерживают потоковый парсинг
- **Метрики/мониторинг**: ✅ ВЫПОЛНЕНО - `lib/metrics.ts` отслеживает время анализа, размер файлов, hit rate кеша
- **Умное кеширование**: ✅ ВЫПОЛНЕНО - Версионирование промптов, инвалидация при изменении, разделение для enhanced/regular анализа
- **Оптимизация памяти**: ✅ ВЫПОЛНЕНО - Очистка промежуточных данных после обработки батчей
- **SSE для прогресса**: ✅ ВЫПОЛНЕНО - `/api/analyze/progress/stream` для Server-Sent Events (альтернатива polling)

## План реализации

### Фаза 1: Критичные изменения (OOM, производительность)
1. ⚠️ Потоковый парсинг JSON (приоритет 1) - **ЧАСТИЧНО** (создана базовая структура, требуется интеграция)
2. ✅ Всегда заливать в Blob (приоритет 2) - **ВЫПОЛНЕНО**
3. ✅ Параллельный анализ чанков (приоритет 4) - **ВЫПОЛНЕНО**
4. ✅ Media в Blob (приоритет 8) - **ВЫПОЛНЕНО**

### Фаза 2: Оптимизации
5. ✅ Кеширование результатов (приоритет 5) - **ВЫПОЛНЕНО**
6. ✅ Стриминг LLM (приоритет 6) - **ВЫПОЛНЕНО** (базовая поддержка)
7. ✅ Унификация промптов (один на английском) - **ВЫПОЛНЕНО**

### Фаза 3: Улучшения
8. ✅ Увеличить maxDuration до 900 сек - **ВЫПОЛНЕНО**
9. ✅ Двухэтапный анализ для целостности - **ВЫПОЛНЕНО** (для enhancedAnalysis)

## Выполненные изменения

### ✅ Унификация промптов (Задача 7)
**Файлы**: `gaslight_detector/features/analysis/prompts.ts`, `gaslight_detector/features/analysis/analysisService.ts`

**Изменения**:
- Удалены все языковые варианты промптов (ru, fr, de, es, pt)
- Оставлен один промпт на английском
- Добавлена функция `getLanguageInstruction(locale)` для определения языка ответа
- В промпт добавлена инструкция: `"All output MUST be in ${responseLanguage}"`
- Упрощен `mediaContext` - всегда на английском

### ✅ Всегда заливать в Blob (Задача 2)
**Файлы**: `gaslight_detector/app/page.tsx`

**Изменения**:
- Убрана проверка размера файла (`VERCEL_BODY_LIMIT`)
- Все файлы теперь заливаются через Vercel Blob client-side upload
- Удален код для прямого upload через FormData
- Упрощена обработка ошибок

### ✅ Параллельный анализ чанков (Задача 4)
**Файлы**: `gaslight_detector/features/analysis/analysisService.ts`

**Изменения**:
- Создана функция `analyzeChunk()` для анализа одного чанка
- Заменен последовательный `for` loop на параллельную обработку батчами
- Батчи по 15 чанков одновременно через `Promise.all`
- Убраны задержки между чанками (не нужны при параллельной обработке)
- Упрощена логика агрегации результатов

### ✅ Media в Vercel Blob (Задача 8)
**Файлы**: `gaslight_detector/features/import/mediaExtractor.ts`, `gaslight_detector/lib/blob.ts`, `gaslight_detector/features/analysis/analysisService.ts`, `gaslight_detector/lib/vision.ts`

**Изменения**:
- Добавлены функции `storeMediaInBlob()` и `getMediaFromBlob()` в `lib/blob.ts`
- Обновлен `extractMediaFromWhatsAppZip()` для загрузки media в Blob сразу после извлечения
- Добавлено поле `blobUrl` в `MediaArtifact` type
- Обновлен `analysisService.ts` для чтения media из Blob при анализе
- Обновлен `vision.ts` для поддержки Blob URL

### ✅ Увеличение maxDuration (Задача 6)
**Файлы**: `gaslight_detector/app/api/analyze/start/route.ts`

**Изменения**:
- Увеличен `maxDuration` с 300 до 900 секунд (15 минут)

### ✅ Кеширование результатов (Задача 5)
**Файлы**: `gaslight_detector/lib/cache.ts`, `gaslight_detector/app/api/analyze/start/route.ts`

**Изменения**:
- Создан модуль `lib/cache.ts` с функциями кеширования
- Добавлена функция `computeChatHash()` для вычисления хеша чата
- Добавлены функции `getCachedAnalysis()` и `setCachedAnalysis()` для работы с Redis
- Интегрировано в `analyze/start` route - проверка кеша перед анализом, сохранение после

### ✅ Стриминг LLM (Задача 6)
**Файлы**: `gaslight_detector/lib/openrouter.ts`

**Изменения**:
- Добавлена функция `callOpenRouterStream()` для потоковых ответов
- Поддержка async generator для обработки SSE потока
- Добавлен параметр `stream` в `OpenRouterRequest` type

### ✅ Потоковый парсинг JSON (Задача 1) - ВЫПОЛНЕНО
**Файлы**: `gaslight_detector/features/import/streamingParser.ts`, `gaslight_detector/features/import/parsers.ts`, `gaslight_detector/app/api/import/blob/route.ts`

**Изменения**:
- Создан модуль `streamingParser.ts` с базовыми функциями для ndjson и JSON массивов
- Добавлена функция `detectJsonFormat()` для автоматического определения формата
- Интегрировано в `parseTelegramExport()` - поддерживает ReadableStream для файлов >50MB
- Обновлен `parseExport()` для автоматического определения использования потокового парсинга
- Обновлен `import/blob/route.ts` для передачи ReadableStream напрямую в парсер

### ✅ Двухэтапный анализ (Задача 9) - ВЫПОЛНЕНО
**Файлы**: `gaslight_detector/features/analysis/analysisService.ts`

**Изменения**:
- Добавлен второй этап анализа после агрегации результатов чанков
- Финальный анализ выполняется только для `enhancedAnalysis` и разговоров с несколькими чанками
- Создает целостный overview summary, интегрирующий результаты всех чанков
- Улучшает целостность восприятия за счет анализа всего разговора целиком

## Детали изменений

### 1. Потоковый парсинг ✅ ВЫПОЛНЕНО
```typescript
// Реализовано: features/import/streamingParser.ts
export async function* parseNdjsonStream(stream: ReadableStream): AsyncGenerator<any> {
  // Парсит ndjson построчно
}

export async function* parseJsonArrayStream(stream: ReadableStream, arrayKey: string): AsyncGenerator<any> {
  // Парсит JSON массивы по частям
}

// Интегрировано: parseTelegramExport поддерживает ReadableStream для файлов >50MB
// parseExport автоматически определяет, использовать ли потоковый парсинг
```

### 2. Всегда Blob ✅ ВЫПОЛНЕНО
```typescript
// app/page.tsx - реализовано
// Убрана проверка размера, всегда используется Blob upload
const blob = await upload(`import-${Date.now()}-${file.name}`, file, {
  access: 'public',
  handleUploadUrl: '/api/upload-to-blob',
});
```

### 3. Параллельные чанки ✅ ВЫПОЛНЕНО
```typescript
// analysisService.ts - реализовано
const BATCH_SIZE = 15; // 10-20 одновременно
for (let batchStart = 0; batchStart < chunks.length; batchStart += BATCH_SIZE) {
  const batch = chunks.slice(batchStart, batchStart + BATCH_SIZE);
  const batchResults = await Promise.all(
    batch.map((chunk, batchIndex) => {
      const chunkIndex = batchStart + batchIndex;
      return analyzeChunk(chunk, chunkIndex, chunks.length, ...);
    })
  );
  // Агрегируем результаты из batchResults
}
```

### 4. Media в Blob ✅ ВЫПОЛНЕНО
```typescript
// features/import/mediaExtractor.ts - реализовано
// После извлечения из ZIP:
const blobUrl = await storeMediaInBlob(mediaId, blob, contentType);
mediaArtifact.blobUrl = blobUrl; // Сохраняем Blob URL вместо base64

// lib/blob.ts - добавлены функции:
export async function storeMediaInBlob(mediaId, blob, contentType): Promise<string | null>
export async function getMediaFromBlob(blobUrl): Promise<Blob | null>

// analysisService.ts - читает из Blob при анализе
```

### 5. Кеширование ✅ ВЫПОЛНЕНО
```typescript
// lib/cache.ts - реализовано
export function computeChatHash(messages: Message[]): string {
  // Вычисляет SHA256 хеш на основе содержимого сообщений
}

export async function getCachedAnalysis(chatHash: string): Promise<AnalysisResult | null> {
  // Получает кешированный результат из Redis
}

export async function setCachedAnalysis(chatHash: string, result: AnalysisResult): Promise<void> {
  // Сохраняет результат в Redis с TTL 7 дней
}

// Интегрировано в app/api/analyze/start/route.ts
```

### 6. Стриминг LLM ✅ ВЫПОЛНЕНО
```typescript
// lib/openrouter.ts - реализовано
export async function* callOpenRouterStream(
  payload: OpenRouterRequest & { stream: true }
): AsyncGenerator<string, void, unknown> {
  const response = await fetch(..., {
    body: JSON.stringify({ ...payload, stream: true })
  });
  const reader = response.body.getReader();
  // Yield chunks as they arrive (SSE format)
}
```

### 7. Унификация промптов ✅ ВЫПОЛНЕНО
```typescript
// prompts.ts - реализовано
function getLanguageInstruction(locale: SupportedLocale): string {
  const languageMap: Record<SupportedLocale, string> = {
    en: 'English', ru: 'Russian', fr: 'French', de: 'German', es: 'Spanish', pt: 'Portuguese'
  };
  return languageMap[locale] || 'English';
}

export function getSystemPrompt(locale: SupportedLocale = 'en', enhancedAnalysis: boolean = false): string {
  const responseLanguage = getLanguageInstruction(locale);
  // Один промпт на английском с инструкцией: "All output MUST be in ${responseLanguage}"
}
```

