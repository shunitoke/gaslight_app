import { NextRequest, NextResponse } from 'next/server';

import { getAnalysisResult } from '../../../../lib/analysisResultStore';
import { getSubscriptionTier } from '../../../../features/subscription/types';

export const runtime = 'nodejs';
export const maxDuration = 30;

type AnalysisRouteContext =
  | { params: { analysisId: string } }
  | { params: Promise<{ analysisId: string }> };

export async function GET(_request: NextRequest, context: AnalysisRouteContext) {
  const { analysisId } = await Promise.resolve(context.params);
  if (!analysisId) {
    return NextResponse.json({ error: 'analysisId required' }, { status: 400 });
  }

  const result = await getAnalysisResult(analysisId);
  if (!result) {
    return NextResponse.json({ error: 'Analysis not found' }, { status: 404 });
  }

  const tier = await getSubscriptionTier(_request);
  if (tier !== 'premium') {
    const analysis = (result as any)?.analysis;
    if (analysis && typeof analysis === 'object') {
      const redacted = {
        ...analysis,
        sections: Array.isArray(analysis.sections)
          ? analysis.sections.map((s: any) => ({
              ...s,
              evidenceSnippets: [],
              recommendedReplies: undefined
            }))
          : [],
        participantProfiles: undefined,
        importantDates: undefined,
        communicationStats: undefined,
        promiseTracking: undefined,
        redFlagCounts: undefined,
        emotionalCycle: undefined,
        timePatterns: undefined,
        contradictions: undefined,
        realityCheck: undefined,
        frameworkDiagnosis: undefined,
        hardTruth: undefined,
        whatYouShouldKnow: undefined,
        whatsNext: undefined,
        closure: undefined
      };

      return NextResponse.json(
        {
          ...(result as any),
          analysis: redacted
        },
        { status: 200 }
      );
    }
  }

  return NextResponse.json(result, { status: 200 });
}

