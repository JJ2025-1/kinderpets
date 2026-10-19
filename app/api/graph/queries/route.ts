import { NextRequest, NextResponse } from 'next/server';
import { 
  executeCypherQuery, 
  ACADEMIC_CYPHER_QUERIES, 
  getFullGraphTopology 
} from '@/lib/neo4j';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const mode = searchParams.get('mode');

    if (mode === 'topology') {
      const topology = getFullGraphTopology();
      return NextResponse.json(topology);
    }

    const queryIdParam = searchParams.get('id');
    if (queryIdParam) {
      const result = await executeCypherQuery(Number(queryIdParam));
      return NextResponse.json(result);
    }

    // Default: return query list metadata and summary
    const queryList = ACADEMIC_CYPHER_QUERIES.map((q) => ({
      id: q.id,
      title: q.title,
      concept: q.concept,
      category: q.category,
      cypher: q.cypher,
      relationalComparison: q.relationalComparison,
    }));

    const topology = getFullGraphTopology();

    return NextResponse.json({
      queries: queryList,
      summary: topology.summary,
    });
  } catch (error: any) {
    console.error('Error in /api/graph/queries:', error);
    return NextResponse.json({ error: error.message || 'Internal error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const queryId = Number(body.queryId || 1);
    const result = await executeCypherQuery(queryId);
    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Error executing Cypher query:', error);
    return NextResponse.json({ error: error.message || 'Execution error' }, { status: 500 });
  }
}
