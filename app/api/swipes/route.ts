import { NextRequest, NextResponse } from 'next/server';
import { dbService } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { adopterId, petId, direction } = body;

    if (!adopterId || !petId || !['LEFT', 'RIGHT'].includes(direction)) {
      return NextResponse.json({ error: 'Invalid swipe parameters' }, { status: 400 });
    }

    const result = dbService.recordSwipe(Number(adopterId), Number(petId), direction);

    return NextResponse.json({
      success: true,
      direction,
      isMatch: result.isMatch,
      matchId: result.matchId,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
