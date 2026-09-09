import { NextRequest, NextResponse } from 'next/server';
import { dbService } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const adopterId = searchParams.get('adopterId');

    if (!adopterId) {
      return NextResponse.json({ error: 'adopterId is required' }, { status: 400 });
    }

    const matches = await dbService.getAdopterMatches(Number(adopterId));
    return NextResponse.json({ matches });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
