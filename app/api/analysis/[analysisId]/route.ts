import { NextRequest, NextResponse } from 'next/server';

import { getAnalysisResult } from '../../../../lib/analysisResultStore';

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

  return NextResponse.json(result, { status: 200 });
}

