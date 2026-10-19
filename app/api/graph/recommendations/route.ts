import { NextRequest, NextResponse } from 'next/server';
import { getGraphRecommendationsForAdopter } from '@/lib/neo4j';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const adopterId = searchParams.get('adopterId') ? Number(searchParams.get('adopterId')) : 1;

    const recommendations = getGraphRecommendationsForAdopter(adopterId);
    return NextResponse.json({
      adopterId,
      recommendations,
      count: recommendations.length,
      engine: 'Neo4j Graph Engine',
    });
  } catch (error: any) {
    console.error('Error in /api/graph/recommendations:', error);
    return NextResponse.json({ error: error.message || 'Internal error' }, { status: 500 });
  }
}
