import { NextRequest, NextResponse } from 'next/server';
import { dbService } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { applicationId, staffId, decision } = body;

    if (!applicationId || !staffId || !['Approved', 'Rejected'].includes(decision)) {
      return NextResponse.json({ error: 'applicationId, staffId, and decision (Approved/Rejected) are required' }, { status: 400 });
    }

    let decisionId: number;
    if (decision === 'Approved') {
      decisionId = await dbService.approveAdoption(Number(applicationId), Number(staffId));
    } else {
      decisionId = await dbService.rejectAdoption(Number(applicationId), Number(staffId));
    }

    return NextResponse.json({ success: true, decision, decisionId });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
