import { NextRequest, NextResponse } from 'next/server';
import { dbService } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (id) {
      const adopter = await dbService.getAdopter(Number(id));
      if (!adopter) {
        return NextResponse.json({ error: 'Adopter not found' }, { status: 404 });
      }
      const preferences = await dbService.getAdopterPreferences(Number(id));
      return NextResponse.json({ adopter, ...preferences });
    }

    const adopters = await dbService.getAdopters();
    const shelters = await dbService.getShelters();
    const staff = await dbService.getStaff();
    const breeds = await dbService.getBreeds();

    return NextResponse.json({ adopters, shelters, staff, breeds });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      adopter_id,
      preferred_species,
      min_age_months,
      max_age_months,
      preferred_size,
      preferred_breeds,
    } = body;

    if (!adopter_id) {
      return NextResponse.json({ error: 'adopter_id is required' }, { status: 400 });
    }

    await dbService.updateAdopterPreferences(
      Number(adopter_id),
      preferred_species || null,
      Number(min_age_months) || 0,
      Number(max_age_months) || 240,
      preferred_size || null,
      preferred_breeds || []
    );

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
