import { NextRequest, NextResponse } from 'next/server';
import { dbService } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const shelterId = searchParams.get('shelterId') ? Number(searchParams.get('shelterId')) : undefined;

    const applications = dbService.getApplications(shelterId);
    return NextResponse.json({ applications });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { matchId, homeVisitDate } = body;

    if (!matchId || !homeVisitDate) {
      return NextResponse.json({ error: 'matchId and homeVisitDate are required' }, { status: 400 });
    }

    const applicationId = dbService.submitAdoptionApplication(Number(matchId), homeVisitDate);

    return NextResponse.json({ success: true, applicationId });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
