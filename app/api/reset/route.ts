import { NextResponse } from 'next/server';
import { dbService } from '@/lib/db';

export async function POST() {
  try {
    dbService.resetDatabase();
    return NextResponse.json({ success: true, message: 'Database reset to default seed state' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
