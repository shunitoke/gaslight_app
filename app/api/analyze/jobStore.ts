import {
  isKvAvailable,
  getJobFromKv,
  setJobInKv,
  getJobByConversationIdFromKv,
  setJobIndex
} from '../../../lib/kv';
import { logInfo, logWarn } from '../../../lib/telemetry';

export type AnalysisJobStatus = 'queued' | 'running' | 'completed' | 'failed';

export type AnalysisJobResult = {
  conversation: any;
  analysis: any;
  activityByDay: Array<{ date: string; messageCount: number }>;
};

export type AnalysisJob = {
  id: string;
  conversationId: string;
  status: AnalysisJobStatus;
  createdAt: string;
  startedAt?: string | null;
  finishedAt?: string | null;
  error?: string | null;
  progress: number;
  currentChunk?: number;
  totalChunks?: number;
  result?: AnalysisJobResult | null;
};

// Ephemeral in-memory job store (fallback when KV is not available)
const jobStore = new Map<string, AnalysisJob>();

export async function createJob(conversationId: string): Promise<AnalysisJob> {
  const id = `job_${conversationId}_${Date.now()}_${Math.random()
    .toString(36)
    .slice(2, 8)}`;

  const job: AnalysisJob = {
    id,
    conversationId,
    status: 'queued',
    createdAt: new Date().toISOString(),
    startedAt: null,
    finishedAt: null,
    error: null,
    progress: 0,
  };

  // Store in KV if available, otherwise in-memory
  if (isKvAvailable()) {
    await setJobInKv(id, job);
    await setJobIndex(conversationId, id);
  } else {
    jobStore.set(id, job);
  }
  
  return job;
}

export async function getJob(jobId: string): Promise<AnalysisJob | undefined> {
  if (isKvAvailable()) {
    const job = await getJobFromKv(jobId);
    return job || undefined;
  }
  return jobStore.get(jobId);
}

export async function updateJob(jobId: string, updates: Partial<AnalysisJob>): Promise<void> {
  const existing = isKvAvailable()
    ? await getJobFromKv(jobId)
    : jobStore.get(jobId);
    
  if (!existing) return;

  const updated: AnalysisJob = {
    ...existing,
    ...updates,
  };

  if (isKvAvailable()) {
    await setJobInKv(jobId, updated);
  } else {
    jobStore.set(jobId, updated);
  }
}

export async function setJobResult(jobId: string, result: AnalysisJobResult): Promise<void> {
  await updateJob(jobId, {
    result,
  });
}

export function listJobs(): AnalysisJob[] {
  return Array.from(jobStore.values());
}

/**
 * Find job by conversationId (for fallback lookup)
 */
export async function getJobByConversationId(conversationId: string): Promise<AnalysisJob | undefined> {
  if (isKvAvailable()) {
    const job = await getJobByConversationIdFromKv(conversationId);
    return job || undefined;
  }
  
  // Fallback to in-memory search
  for (const job of jobStore.values()) {
    if (job.conversationId === conversationId && job.status === 'completed' && job.result) {
      return job;
    }
  }
  return undefined;
}


