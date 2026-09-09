import { NextRequest, NextResponse } from 'next/server';
import { dbService } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const adopterId = searchParams.get('adopterId') ? Number(searchParams.get('adopterId')) : undefined;
    const species = searchParams.get('species') || undefined;
    const breed = searchParams.get('breed') || undefined;
    const size = searchParams.get('size') || undefined;
    const minAge = searchParams.get('minAge') ? Number(searchParams.get('minAge')) : undefined;
    const maxAge = searchParams.get('maxAge') ? Number(searchParams.get('maxAge')) : undefined;
    const city = searchParams.get('city') || undefined;
    const excludeSwiped = searchParams.get('excludeSwiped') === 'true';
    const forShelter = searchParams.get('forShelter') === 'true';
    const shelterId = searchParams.get('shelterId') ? Number(searchParams.get('shelterId')) : undefined;

    if (forShelter) {
      const pets = dbService.getAllPetsForShelter(shelterId);
      return NextResponse.json({ pets });
    }

    const pets = dbService.getDiscoverPets({
      adopterId,
      species,
      breed,
      size,
      minAge,
      maxAge,
      city,
      excludeSwiped,
    });

    return NextResponse.json({ pets });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      shelter_id,
      breed_name,
      pet_name,
      gender,
      age_months,
      size,
      behaviour_desc,
      lifestyle_desc,
      photo_urls,
    } = body;

    if (!shelter_id || !breed_name || !pet_name || !gender || age_months === undefined || !size) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const petId = dbService.addPet({
      shelter_id: Number(shelter_id),
      breed_name,
      pet_name,
      gender,
      age_months: Number(age_months),
      size,
      behaviour_desc: behaviour_desc || '',
      lifestyle_desc: lifestyle_desc || '',
      photo_urls: photo_urls || [],
    });

    return NextResponse.json({ success: true, petId });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
