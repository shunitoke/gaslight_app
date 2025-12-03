import { NextResponse } from 'next/server';

import { getJob } from '../jobStore';
import { logWarn } from '../../../../lib/telemetry';

export const runtime = 'nodejs';
export const maxDuration = 30;

export async function GET(request: Request) {
  const url = new URL(request.url);
  const jobId = url.searchParams.get('jobId');

  if (!jobId) {
    return NextResponse.json({ error: 'jobId required' }, { status: 400 });
  }

  const job = await getJob(jobId);

  if (!job) {
    logWarn('analyze_result_job_not_found', {
      jobId,
      requestedAt: new Date().toISOString()
    });
    return NextResponse.json({ error: 'Job not found' }, { status: 404 });
  }

  // If job is not yet completed, return its status without the full result
  if (job.status !== 'completed' || !job.result) {
    return NextResponse.json(
      {
        jobId: job.id,
        status: job.status,
        progress: job.progress,
        currentChunk: job.currentChunk,
        totalChunks: job.totalChunks,
        error: job.error ?? null,
      },
      { status: job.status === 'failed' ? 500 : 202 },
    );
  }

  // Completed job with result
  return NextResponse.json(
    {
      jobId: job.id,
      status: job.status,
      progress: job.progress,
      conversation: job.result.conversation,
      analysis: job.result.analysis,
      activityByDay: job.result.activityByDay,
    },
    { status: 200 },
  );
}


