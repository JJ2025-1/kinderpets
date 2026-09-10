// ============================================================================
// Project: Kinder Pets - SQLite In-Memory / Embedded Relational Adapter (Fallback)
// Description: Full embedded relational engine mirroring the Oracle 19c/23ai schema,
//              PL/SQL procedures, and query capabilities for seamless localhost execution.
// ============================================================================

// @ts-ignore
import { DatabaseSync } from 'node:sqlite';
import type {
  Shelter,
  ShelterStaff,
  Breed,
  Pet,
  PetPhoto,
  Adopter,
  AdopterPreference,
  EnrichedPet,
  EnrichedMatch,
  EnrichedApplication,
} from './types';

let dbInstance: DatabaseSync | null = null;

// Metro distance approximation matrix (km)
const CITY_DISTANCES: Record<string, Record<string, number>> = {
  Bangalore: { Bangalore: 5, Mumbai: 980, Chennai: 350, Delhi: 2150, Pune: 840 },
  Mumbai: { Bangalore: 980, Mumbai: 5, Chennai: 1330, Delhi: 1420, Pune: 150 },
  Chennai: { Bangalore: 350, Mumbai: 1330, Chennai: 5, Delhi: 2200, Pune: 1190 },
  Delhi: { Bangalore: 2150, Mumbai: 1420, Chennai: 2200, Delhi: 5, Pune: 1430 },
  Pune: { Bangalore: 840, Mumbai: 150, Chennai: 1190, Delhi: 1430, Pune: 5 },
};

function getDistance(city1?: string, city2?: string): number {
  if (!city1 || !city2) return 50;
  if (CITY_DISTANCES[city1]?.[city2]) return CITY_DISTANCES[city1][city2];
  if (CITY_DISTANCES[city2]?.[city1]) return CITY_DISTANCES[city2][city1];
  return 450;
}

export function getSqliteDb(): DatabaseSync {
  if (!dbInstance) {
    dbInstance = new DatabaseSync(':memory:');
    initSqliteSchemaAndSeed(dbInstance);
  }
  return dbInstance;
}

export function initSqliteSchemaAndSeed(db: DatabaseSync): void {
  db.exec(`
    DROP TABLE IF EXISTS SHELTER_DECISION;
    DROP TABLE IF EXISTS ADOPTION_APPLICATION;
    DROP TABLE IF EXISTS PET_MATCH;
    DROP TABLE IF EXISTS SWIPE;
    DROP TABLE IF EXISTS PREFERRED_BREED;
    DROP TABLE IF EXISTS ADOPTER_PREFERENCE;
    DROP TABLE IF EXISTS PET_PHOTO;
    DROP TABLE IF EXISTS PET;
    DROP TABLE IF EXISTS BREED;
    DROP TABLE IF EXISTS SHELTER_STAFF;
    DROP TABLE IF EXISTS ADOPTER;
    DROP TABLE IF EXISTS SHELTER;

    CREATE TABLE SHELTER (
      shelter_id INTEGER PRIMARY KEY AUTOINCREMENT,
      shelter_name TEXT NOT NULL,
      license_no TEXT UNIQUE NOT NULL,
      city TEXT NOT NULL
    );

    CREATE TABLE SHELTER_STAFF (
      staff_id INTEGER PRIMARY KEY AUTOINCREMENT,
      shelter_id INTEGER NOT NULL REFERENCES SHELTER(shelter_id) ON DELETE CASCADE,
      staff_name TEXT NOT NULL,
      role TEXT NOT NULL
    );

    CREATE TABLE BREED (
      breed_name TEXT PRIMARY KEY,
      species TEXT NOT NULL CHECK(species IN ('Dog', 'Cat'))
    );

    CREATE TABLE PET (
      pet_id INTEGER PRIMARY KEY AUTOINCREMENT,
      shelter_id INTEGER NOT NULL REFERENCES SHELTER(shelter_id),
      breed_name TEXT NOT NULL REFERENCES BREED(breed_name),
      pet_name TEXT NOT NULL,
      gender TEXT NOT NULL CHECK(gender IN ('Male', 'Female')),
      age_months INTEGER NOT NULL CHECK(age_months > 0),
      size TEXT NOT NULL CHECK(size IN ('Small', 'Medium', 'Large')),
      behaviour_desc TEXT NOT NULL,
      lifestyle_desc TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'Available' CHECK(status IN ('Available', 'Pending', 'Adopted', 'Archived'))
    );

    CREATE TABLE PET_PHOTO (
      photo_id INTEGER PRIMARY KEY AUTOINCREMENT,
      pet_id INTEGER NOT NULL REFERENCES PET(pet_id) ON DELETE CASCADE,
      photo_url TEXT NOT NULL,
      is_primary INTEGER NOT NULL DEFAULT 0 CHECK(is_primary IN (0, 1))
    );

    CREATE TABLE ADOPTER (
      adopter_id INTEGER PRIMARY KEY AUTOINCREMENT,
      full_name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      phone TEXT UNIQUE NOT NULL,
      city TEXT NOT NULL,
      state TEXT NOT NULL
    );

    CREATE TABLE ADOPTER_PREFERENCE (
      adopter_id INTEGER PRIMARY KEY REFERENCES ADOPTER(adopter_id) ON DELETE CASCADE,
      preferred_species TEXT CHECK(preferred_species IS NULL OR preferred_species IN ('Dog', 'Cat')),
      min_age_months INTEGER NOT NULL DEFAULT 1 CHECK(min_age_months >= 0),
      max_age_months INTEGER NOT NULL DEFAULT 240 CHECK(max_age_months >= min_age_months),
      preferred_size TEXT CHECK(preferred_size IS NULL OR preferred_size IN ('Small', 'Medium', 'Large'))
    );

    CREATE TABLE PREFERRED_BREED (
      adopter_id INTEGER NOT NULL REFERENCES ADOPTER(adopter_id) ON DELETE CASCADE,
      breed_name TEXT NOT NULL REFERENCES BREED(breed_name) ON DELETE CASCADE,
      PRIMARY KEY (adopter_id, breed_name)
    );

    CREATE TABLE SWIPE (
      swipe_id INTEGER PRIMARY KEY AUTOINCREMENT,
      adopter_id INTEGER NOT NULL REFERENCES ADOPTER(adopter_id) ON DELETE CASCADE,
      pet_id INTEGER NOT NULL REFERENCES PET(pet_id) ON DELETE CASCADE,
      direction TEXT NOT NULL CHECK(direction IN ('LEFT', 'RIGHT')),
      swiped_at TEXT NOT NULL DEFAULT (datetime('now')),
      UNIQUE(adopter_id, pet_id)
    );

    CREATE TABLE PET_MATCH (
      match_id INTEGER PRIMARY KEY AUTOINCREMENT,
      adopter_id INTEGER NOT NULL REFERENCES ADOPTER(adopter_id) ON DELETE CASCADE,
      pet_id INTEGER NOT NULL REFERENCES PET(pet_id) ON DELETE CASCADE,
      matched_at TEXT NOT NULL DEFAULT (datetime('now')),
      status TEXT NOT NULL DEFAULT 'Active' CHECK(status IN ('Active', 'Applied', 'Closed')),
      UNIQUE(adopter_id, pet_id)
    );

    CREATE TABLE ADOPTION_APPLICATION (
      application_id INTEGER PRIMARY KEY AUTOINCREMENT,
      match_id INTEGER NOT NULL REFERENCES PET_MATCH(match_id) ON DELETE CASCADE,
      staff_id INTEGER REFERENCES SHELTER_STAFF(staff_id),
      home_visit_date TEXT NOT NULL,
      application_status TEXT NOT NULL DEFAULT 'Pending' CHECK(application_status IN ('Pending', 'Under Review', 'Approved', 'Rejected')),
      submitted_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE SHELTER_DECISION (
      decision_id INTEGER PRIMARY KEY AUTOINCREMENT,
      application_id INTEGER NOT NULL REFERENCES ADOPTION_APPLICATION(application_id) ON DELETE CASCADE,
      pet_id INTEGER NOT NULL REFERENCES PET(pet_id),
      adopter_id INTEGER NOT NULL REFERENCES ADOPTER(adopter_id),
      staff_id INTEGER NOT NULL REFERENCES SHELTER_STAFF(staff_id),
      decision TEXT NOT NULL CHECK(decision IN ('Approved', 'Rejected')),
      decided_at TEXT NOT NULL DEFAULT (datetime('now')),
      notes TEXT
    );
  `);

  // Populate Seed Data
  db.exec(`
    INSERT INTO SHELTER (shelter_id, shelter_name, license_no, city) VALUES 
    (1, 'Paws & Tails Animal Rescue', 'KA-BLR-SHEL-2021-042', 'Bangalore'),
    (2, 'Compassion Pet Haven', 'MH-MUM-SHEL-2019-118', 'Mumbai'),
    (3, 'Safe Haven Animal Trust', 'TN-CHN-SHEL-2020-087', 'Chennai'),
    (4, 'Tails of Joy Foundation', 'DL-DEL-SHEL-2022-205', 'Delhi'),
    (5, 'Pune Animal Welfare Society', 'MH-PUN-SHEL-2018-013', 'Pune');

    INSERT INTO SHELTER_STAFF (staff_id, shelter_id, staff_name, role) VALUES 
    (1, 1, 'Dr. Rajesh Rao', 'Chief Veterinarian'),
    (2, 1, 'Priya Menon', 'Adoption Coordinator'),
    (3, 2, 'Vikram Deshmukh', 'Shelter Manager'),
    (4, 3, 'Kavita Sundaram', 'Senior Caretaker'),
    (5, 4, 'Amit Verma', 'Adoption Specialist'),
    (6, 5, 'Sunita Kulkarni', 'Rescue Coordinator');

    INSERT INTO BREED (breed_name, species) VALUES 
    ('Labrador Retriever', 'Dog'),
    ('Indie / Desi Dog', 'Dog'),
    ('Golden Retriever', 'Dog'),
    ('Beagle', 'Dog'),
    ('German Shepherd', 'Dog'),
    ('Cocker Spaniel', 'Dog'),
    ('Persian Cat', 'Cat'),
    ('Siamese Cat', 'Cat'),
    ('Indie / Desi Cat', 'Cat'),
    ('Ragdoll Cat', 'Cat');

    INSERT INTO PET (pet_id, shelter_id, breed_name, pet_name, gender, age_months, size, behaviour_desc, lifestyle_desc, status) VALUES 
    (1, 1, 'Labrador Retriever', 'Bruno', 'Male', 24, 'Large', 'Extremely friendly, loves playing fetch and great with kids', 'Active apartment or house with balcony, needs daily park walks', 'Available'),
    (2, 1, 'Indie / Desi Dog', 'Luna', 'Female', 12, 'Medium', 'Affectionate, quick learner, very loyal and alert', 'Ideal for both flats and independent homes; low maintenance grooming', 'Pending'),
    (3, 2, 'Golden Retriever', 'Max', 'Male', 36, 'Large', 'Gentle, patient, sweet-natured therapy dog temperament', 'Spacious home preferred; enjoys swimming and family time', 'Available'),
    (4, 2, 'Persian Cat', 'Milo', 'Male', 24, 'Small', 'Calm lap cat, purrs continuously when brushed', 'Quiet indoor apartment, gentle environment without loud noises', 'Available'),
    (5, 1, 'Beagle', 'Coco', 'Female', 8, 'Small', 'Playful puppy energy, curious nose, loves social gatherings', 'Needs engaging puzzle toys and supervised outdoor yard time', 'Available'),
    (6, 3, 'German Shepherd', 'Rocky', 'Male', 18, 'Large', 'Protective, intelligent, highly trainable, leash trained', 'Active owner experienced with large working breeds', 'Available'),
    (7, 3, 'Siamese Cat', 'Cleo', 'Female', 14, 'Small', 'Vocal communicator, curious explorer, loves perching high', 'Indoor home with scratching posts and sunlit window spots', 'Available'),
    (8, 4, 'Cocker Spaniel', 'Bella', 'Female', 30, 'Medium', 'Sweet-tempered, eager to please, gentle tail-wagger', 'Moderate exercise needs; loves cuddles on sofa', 'Available'),
    (9, 4, 'Indie / Desi Cat', 'Simba', 'Male', 10, 'Small', 'Agile, playful mouser, independent yet cuddly at bedtime', 'Adaptable indoor-outdoor or apartment lifestyle', 'Available'),
    (10, 5, 'Ragdoll Cat', 'Oliver', 'Male', 20, 'Medium', 'Relaxed, goes limp when held lovingly, docile companion', 'Strictly indoor apartment with gentle companions', 'Available'),
    (11, 5, 'Indie / Desi Dog', 'Maya', 'Female', 16, 'Medium', 'Super resilient, vaccinated, sociable with other dogs', 'Loves morning jogs and afternoon terrace naps', 'Available'),
    (12, 1, 'Labrador Retriever', 'Cooper', 'Male', 48, 'Large', 'Mellow senior vibe, fully house-trained, peaceful', 'Calm home seeking a relaxed companion dog', 'Available'),
    (13, 2, 'Beagle', 'Daisy', 'Female', 15, 'Small', 'Cheerful soul, friendly to strangers, food motivated', 'Great family dog; needs fenced boundary', 'Pending'),
    (14, 3, 'Golden Retriever', 'Charlie', 'Male', 22, 'Large', 'High exuberance, loves water splashes and kids', 'Active household ready for outdoor weekend roadtrips', 'Adopted'),
    (15, 4, 'Persian Cat', 'Zoey', 'Female', 32, 'Small', 'Regal, quiet lady, prefers sleeping on soft cushions', 'Low-energy single occupant or quiet couple home', 'Available'),
    (16, 5, 'Indie / Desi Dog', 'Leo', 'Male', 9, 'Medium', 'Energetic puppy, quick at agility training and tricks', 'Enthusiastic first-time dog owners welcomed', 'Available');

    INSERT INTO PET_PHOTO (photo_id, pet_id, photo_url, is_primary) VALUES 
    (1, 1, 'https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=800&q=80', 1),
    (2, 1, 'https://images.unsplash.com/photo-1537151625747-768eb6cf92b2?auto=format&fit=crop&w=800&q=80', 0),
    (3, 2, 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&w=800&q=80', 1),
    (4, 2, 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=800&q=80', 0),
    (5, 3, 'https://images.unsplash.com/photo-1537151608828-ea2b11777ee8?auto=format&fit=crop&w=800&q=80', 1),
    (6, 3, 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?auto=format&fit=crop&w=800&q=80', 0),
    (7, 4, 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=800&q=80', 1),
    (8, 4, 'https://images.unsplash.com/photo-1573865526739-10659fec78a5?auto=format&fit=crop&w=800&q=80', 0),
    (9, 5, 'https://images.unsplash.com/photo-1505628346881-b72b27e84530?auto=format&fit=crop&w=800&q=80', 1),
    (10, 6, 'https://images.unsplash.com/photo-1589941013453-ec89f33b5e95?auto=format&fit=crop&w=800&q=80', 1),
    (11, 7, 'https://images.unsplash.com/photo-1513360309081-38f0762daed1?auto=format&fit=crop&w=800&q=80', 1),
    (12, 8, 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?auto=format&fit=crop&w=800&q=80', 1),
    (13, 9, 'https://images.unsplash.com/photo-1495360010541-f48722b34f7d?auto=format&fit=crop&w=800&q=80', 1),
    (14, 10, 'https://images.unsplash.com/photo-1548802673-380ab8ebc7b7?auto=format&fit=crop&w=800&q=80', 1),
    (15, 11, 'https://images.unsplash.com/photo-1561037404-61cd46aa615b?auto=format&fit=crop&w=800&q=80', 1),
    (16, 12, 'https://images.unsplash.com/photo-1529429617124-95b109e86bb8?auto=format&fit=crop&w=800&q=80', 1),
    (17, 13, 'https://images.unsplash.com/photo-1535930891776-0c2dfb7fda1a?auto=format&fit=crop&w=800&q=80', 1),
    (18, 14, 'https://images.unsplash.com/photo-1558788353-f76d92427f16?auto=format&fit=crop&w=800&q=80', 1),
    (19, 15, 'https://images.unsplash.com/photo-1518791841217-8f162f1e1131?auto=format&fit=crop&w=800&q=80', 1),
    (20, 16, 'https://images.unsplash.com/photo-1544568100-847a948585b9?auto=format&fit=crop&w=800&q=80', 1);

    INSERT INTO ADOPTER (adopter_id, full_name, email, phone, city, state) VALUES 
    (1, 'Rahul Sharma', 'rahul.sharma@example.com', '+919876543210', 'Bangalore', 'Karnataka'),
    (2, 'Ananya Patel', 'ananya.patel@example.com', '+919876543211', 'Mumbai', 'Maharashtra'),
    (3, 'Karthik Raman', 'karthik.raman@example.com', '+919876543212', 'Chennai', 'Tamil Nadu'),
    (4, 'Sneha Mukherjee', 'sneha.m@example.com', '+919876543213', 'Bangalore', 'Karnataka'),
    (5, 'Rohan Kapoor', 'rohan.k@example.com', '+919876543214', 'Delhi', 'Delhi'),
    (6, 'Pooja Nair', 'pooja.nair@example.com', '+919876543215', 'Pune', 'Maharashtra');

    INSERT INTO ADOPTER_PREFERENCE (adopter_id, preferred_species, min_age_months, max_age_months, preferred_size) VALUES 
    (1, 'Dog', 6, 36, 'Large'),
    (2, 'Cat', 3, 48, 'Small'),
    (3, 'Dog', 12, 60, 'Medium'),
    (4, 'Dog', 3, 24, 'Small'),
    (5, 'Cat', 6, 36, 'Medium'),
    (6, NULL, 1, 120, NULL);

    INSERT INTO PREFERRED_BREED (adopter_id, breed_name) VALUES 
    (1, 'Labrador Retriever'),
    (1, 'Golden Retriever'),
    (2, 'Persian Cat'),
    (2, 'Siamese Cat'),
    (3, 'Indie / Desi Dog'),
    (3, 'Cocker Spaniel'),
    (4, 'Beagle'),
    (5, 'Ragdoll Cat'),
    (6, 'Indie / Desi Dog'),
    (6, 'Indie / Desi Cat');

    INSERT INTO SWIPE (swipe_id, adopter_id, pet_id, direction, swiped_at) VALUES 
    (1, 1, 1, 'RIGHT', datetime('now', '-5 days')),
    (2, 1, 3, 'RIGHT', datetime('now', '-4 days')),
    (3, 1, 5, 'LEFT',  datetime('now', '-4 days')),
    (4, 2, 4, 'RIGHT', datetime('now', '-3 days')),
    (5, 2, 7, 'RIGHT', datetime('now', '-2 days')),
    (6, 3, 2, 'RIGHT', datetime('now', '-6 days')),
    (7, 3, 8, 'RIGHT', datetime('now', '-5 days')),
    (8, 4, 5, 'RIGHT', datetime('now', '-2 days')),
    (9, 4, 13, 'RIGHT', datetime('now', '-1 day')),
    (10, 5, 10, 'RIGHT', datetime('now', '-3 days')),
    (11, 6, 14, 'RIGHT', datetime('now', '-10 days')),
    (12, 6, 11, 'RIGHT', datetime('now', '-2 days'));

    INSERT INTO PET_MATCH (match_id, adopter_id, pet_id, matched_at, status) VALUES 
    (1, 1, 1, datetime('now', '-5 days'), 'Active'),
    (2, 1, 3, datetime('now', '-4 days'), 'Applied'),
    (3, 2, 4, datetime('now', '-3 days'), 'Applied'),
    (4, 2, 7, datetime('now', '-2 days'), 'Active'),
    (5, 3, 2, datetime('now', '-6 days'), 'Applied'),
    (6, 4, 5, datetime('now', '-2 days'), 'Active'),
    (7, 4, 13, datetime('now', '-1 day'), 'Applied'),
    (8, 5, 10, datetime('now', '-3 days'), 'Active'),
    (9, 6, 14, datetime('now', '-10 days'), 'Closed'),
    (10, 6, 11, datetime('now', '-2 days'), 'Active');

    INSERT INTO ADOPTION_APPLICATION (application_id, match_id, staff_id, home_visit_date, application_status, submitted_at) VALUES 
    (1, 2, 3, date('now', '+3 days'), 'Under Review', datetime('now', '-3 days')),
    (2, 3, 3, date('now', '+5 days'), 'Pending', datetime('now', '-2 days')),
    (3, 5, 2, date('now', '+2 days'), 'Under Review', datetime('now', '-5 days')),
    (4, 7, 3, date('now', '+7 days'), 'Pending', datetime('now', '-1 day')),
    (5, 9, 4, date('now', '-2 days'), 'Approved', datetime('now', '-9 days'));

    INSERT INTO SHELTER_DECISION (decision_id, application_id, pet_id, adopter_id, staff_id, decision, decided_at, notes) VALUES 
    (1, 5, 14, 6, 4, 'Approved', datetime('now', '-1 day'), 'Adopter home environment verified; spacious garden and experienced family. Adoption finalised.');
  `);
}

export const sqliteService = {
  resetDatabase(): void {
    const db = getSqliteDb();
    initSqliteSchemaAndSeed(db);
  },

  getShelters(): Shelter[] {
    const db = getSqliteDb();
    return db.prepare(`SELECT * FROM SHELTER ORDER BY shelter_name ASC`).all() as unknown as Shelter[];
  },

  getStaff(shelterId?: number): ShelterStaff[] {
    const db = getSqliteDb();
    if (shelterId) {
      return db.prepare(`SELECT * FROM SHELTER_STAFF WHERE shelter_id = ? ORDER BY staff_name ASC`).all(shelterId) as unknown as ShelterStaff[];
    }
    return db.prepare(`SELECT * FROM SHELTER_STAFF ORDER BY staff_name ASC`).all() as unknown as ShelterStaff[];
  },

  getBreeds(): Breed[] {
    const db = getSqliteDb();
    return db.prepare(`SELECT * FROM BREED ORDER BY breed_name ASC`).all() as unknown as Breed[];
  },

  getAdopters(): Adopter[] {
    const db = getSqliteDb();
    return db.prepare(`SELECT * FROM ADOPTER ORDER BY full_name ASC`).all() as unknown as Adopter[];
  },

  getAdopter(adopterId: number): Adopter | null {
    const db = getSqliteDb();
    const row = db.prepare(`SELECT * FROM ADOPTER WHERE adopter_id = ?`).get(adopterId);
    return (row as unknown as Adopter) || null;
  },

  getAdopterPreferences(adopterId: number): { preference: AdopterPreference | null; preferredBreeds: string[] } {
    const db = getSqliteDb();
    const pref = db.prepare(`SELECT * FROM ADOPTER_PREFERENCE WHERE adopter_id = ?`).get(adopterId) as unknown as AdopterPreference | undefined;
    const breeds = db.prepare(`SELECT breed_name FROM PREFERRED_BREED WHERE adopter_id = ?`).all(adopterId) as unknown as { breed_name: string }[];
    return {
      preference: pref || null,
      preferredBreeds: breeds.map((b) => b.breed_name),
    };
  },

  updateAdopterPreferences(
    adopterId: number,
    preferredSpecies: string | null,
    minAgeMonths: number,
    maxAgeMonths: number,
    preferredSize: string | null,
    preferredBreeds: string[]
  ): void {
    const db = getSqliteDb();
    db.prepare(`
      INSERT INTO ADOPTER_PREFERENCE (adopter_id, preferred_species, min_age_months, max_age_months, preferred_size)
      VALUES (?, ?, ?, ?, ?)
      ON CONFLICT(adopter_id) DO UPDATE SET
        preferred_species = excluded.preferred_species,
        min_age_months = excluded.min_age_months,
        max_age_months = excluded.max_age_months,
        preferred_size = excluded.preferred_size
    `).run(adopterId, preferredSpecies, minAgeMonths, maxAgeMonths, preferredSize);

    db.prepare(`DELETE FROM PREFERRED_BREED WHERE adopter_id = ?`).run(adopterId);
    const insertBreed = db.prepare(`INSERT INTO PREFERRED_BREED (adopter_id, breed_name) VALUES (?, ?)`);
    for (const b of preferredBreeds) {
      insertBreed.run(adopterId, b);
    }
  },

  getDiscoverPets(options: {
    adopterId?: number;
    species?: string;
    breed?: string;
    minAge?: number;
    maxAge?: number;
    size?: string;
    city?: string;
    maxDistanceKm?: number;
    excludeSwiped?: boolean;
  }): EnrichedPet[] {
    const db = getSqliteDb();
    let query = `
      SELECT 
        p.pet_id,
        p.shelter_id,
        p.breed_name,
        p.pet_name,
        p.gender,
        p.age_months,
        p.size,
        p.behaviour_desc,
        p.lifestyle_desc,
        p.status,
        b.species,
        s.shelter_name,
        s.city AS shelter_city
      FROM PET p
      INNER JOIN BREED b ON p.breed_name = b.breed_name
      INNER JOIN SHELTER s ON p.shelter_id = s.shelter_id
      WHERE p.status = 'Available'
    `;
    const params: any[] = [];

    if (options.species && options.species !== 'All') {
      query += ` AND b.species = ?`;
      params.push(options.species);
    }
    if (options.breed && options.breed !== 'All') {
      query += ` AND p.breed_name = ?`;
      params.push(options.breed);
    }
    if (options.size && options.size !== 'All') {
      query += ` AND p.size = ?`;
      params.push(options.size);
    }
    if (options.minAge !== undefined) {
      query += ` AND p.age_months >= ?`;
      params.push(options.minAge);
    }
    if (options.maxAge !== undefined) {
      query += ` AND p.age_months <= ?`;
      params.push(options.maxAge);
    }
    if (options.excludeSwiped && options.adopterId) {
      query += ` AND p.pet_id NOT IN (SELECT pet_id FROM SWIPE WHERE adopter_id = ?)`;
      params.push(options.adopterId);
    }
    query += ` ORDER BY p.pet_id ASC`;

    const rawPets = db.prepare(query).all(...params) as any[];

    let adopterCity = 'Bangalore';
    if (options.adopterId) {
      const adp = db.prepare(`SELECT city FROM ADOPTER WHERE adopter_id = ?`).get(options.adopterId) as { city: string } | undefined;
      if (adp?.city) adopterCity = adp.city;
    } else if (options.city) {
      adopterCity = options.city;
    }

    const allPhotos = db.prepare(`SELECT * FROM PET_PHOTO ORDER BY is_primary DESC, photo_id ASC`).all() as unknown as PetPhoto[];

    const enriched: EnrichedPet[] = rawPets.map((p) => {
      const photos = allPhotos.filter((ph) => ph.pet_id === p.pet_id);
      const primary = photos.find((ph) => ph.is_primary === 1) || photos[0];
      const dist = getDistance(adopterCity, p.shelter_city);
      return {
        ...p,
        photos,
        primary_photo:
          primary?.photo_url ||
          'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=800&q=80',
        approx_distance_km: dist,
      };
    });

    if (options.maxDistanceKm) {
      return enriched.filter((p) => p.approx_distance_km <= options.maxDistanceKm!);
    }
    return enriched;
  },

  getPet(petId: number): EnrichedPet | null {
    const db = getSqliteDb();
    const pet = db.prepare(`
      SELECT 
        p.pet_id,
        p.shelter_id,
        p.breed_name,
        p.pet_name,
        p.gender,
        p.age_months,
        p.size,
        p.behaviour_desc,
        p.lifestyle_desc,
        p.status,
        b.species,
        s.shelter_name,
        s.city AS shelter_city
      FROM PET p
      INNER JOIN BREED b ON p.breed_name = b.breed_name
      INNER JOIN SHELTER s ON p.shelter_id = s.shelter_id
      WHERE p.pet_id = ?
    `).get(petId) as any;

    if (!pet) return null;

    const photos = db.prepare(`SELECT * FROM PET_PHOTO WHERE pet_id = ? ORDER BY is_primary DESC, photo_id ASC`).all(petId) as unknown as PetPhoto[];
    const primary = photos.find((ph) => ph.is_primary === 1) || photos[0];

    return {
      ...pet,
      photos,
      primary_photo:
        primary?.photo_url ||
        'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=800&q=80',
      approx_distance_km: 5,
    };
  },

  addPet(petData: {
    shelter_id: number;
    breed_name: string;
    pet_name: string;
    gender: string;
    age_months: number;
    size: string;
    behaviour_desc: string;
    lifestyle_desc: string;
    photo_urls?: string[];
  }): number {
    const db = getSqliteDb();
    const res = db.prepare(`
      INSERT INTO PET (shelter_id, breed_name, pet_name, gender, age_months, size, behaviour_desc, lifestyle_desc, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'Available')
    `).run(
      petData.shelter_id,
      petData.breed_name,
      petData.pet_name,
      petData.gender,
      petData.age_months,
      petData.size,
      petData.behaviour_desc,
      petData.lifestyle_desc
    );

    const petId = Number(res.lastInsertRowid);

    if (petData.photo_urls && petData.photo_urls.length > 0) {
      const insPhoto = db.prepare(`INSERT INTO PET_PHOTO (pet_id, photo_url, is_primary) VALUES (?, ?, ?)`);
      petData.photo_urls.forEach((url, i) => {
        insPhoto.run(petId, url, i === 0 ? 1 : 0);
      });
    } else {
      db.prepare(`INSERT INTO PET_PHOTO (pet_id, photo_url, is_primary) VALUES (?, ?, 1)`).run(
        petId,
        'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=800&q=80'
      );
    }
    return petId;
  },

  updatePetStatus(petId: number, status: string): void {
    const db = getSqliteDb();
    db.prepare(`UPDATE PET SET status = ? WHERE pet_id = ?`).run(status, petId);
  },

  recordSwipe(adopterId: number, petId: number, direction: 'LEFT' | 'RIGHT'): { isMatch: boolean; matchId?: number } {
    const db = getSqliteDb();
    db.prepare(`
      INSERT INTO SWIPE (adopter_id, pet_id, direction, swiped_at)
      VALUES (?, ?, ?, datetime('now'))
      ON CONFLICT(adopter_id, pet_id) DO UPDATE SET direction = excluded.direction, swiped_at = excluded.swiped_at
    `).run(adopterId, petId, direction);

    if (direction === 'RIGHT') {
      const existingMatch = db.prepare(`SELECT match_id FROM PET_MATCH WHERE adopter_id = ? AND pet_id = ?`).get(adopterId, petId) as { match_id: number } | undefined;
      let matchId = existingMatch?.match_id;
      if (!matchId) {
        const mRes = db.prepare(`
          INSERT INTO PET_MATCH (adopter_id, pet_id, matched_at, status)
          VALUES (?, ?, datetime('now'), 'Active')
        `).run(adopterId, petId);
        matchId = Number(mRes.lastInsertRowid);
      }
      return { isMatch: true, matchId };
    }
    return { isMatch: false };
  },

  getAdopterMatches(adopterId: number): EnrichedMatch[] {
    const db = getSqliteDb();
    const rows = db.prepare(`
      SELECT 
        m.match_id,
        m.adopter_id,
        m.pet_id,
        m.matched_at,
        m.status,
        a.full_name AS adopter_name,
        a.email AS adopter_email,
        a.phone AS adopter_phone,
        a.city AS adopter_city,
        a.state AS adopter_state,
        app.application_id,
        app.application_status
      FROM PET_MATCH m
      INNER JOIN ADOPTER a ON m.adopter_id = a.adopter_id
      LEFT JOIN ADOPTION_APPLICATION app ON m.match_id = app.match_id
      WHERE m.adopter_id = ?
      ORDER BY m.matched_at DESC
    `).all(adopterId) as any[];

    const matches: EnrichedMatch[] = [];
    for (const r of rows) {
      const pet = this.getPet(r.pet_id);
      if (pet) {
        matches.push({
          match_id: r.match_id,
          adopter_id: r.adopter_id,
          pet_id: r.pet_id,
          matched_at: r.matched_at,
          status: r.status,
          pet,
          adopter: {
            adopter_id: r.adopter_id,
            full_name: r.adopter_name,
            email: r.adopter_email,
            phone: r.adopter_phone,
            city: r.adopter_city,
            state: r.adopter_state,
          },
          has_application: !!r.application_id,
          application_id: r.application_id || undefined,
          application_status: r.application_status,
        });
      }
    }
    return matches;
  },

  submitAdoptionApplication(matchId: number, homeVisitDate: string): number {
    const db = getSqliteDb();
    const res = db.prepare(`
      INSERT INTO ADOPTION_APPLICATION (match_id, home_visit_date, application_status, submitted_at)
      VALUES (?, ?, 'Pending', datetime('now'))
    `).run(matchId, homeVisitDate);

    db.prepare(`UPDATE PET_MATCH SET status = 'Applied' WHERE match_id = ?`).run(matchId);

    const match = db.prepare(`SELECT pet_id FROM PET_MATCH WHERE match_id = ?`).get(matchId) as { pet_id: number } | undefined;
    if (match) {
      db.prepare(`UPDATE PET SET status = 'Pending' WHERE pet_id = ?`).run(match.pet_id);
    }

    return Number(res.lastInsertRowid);
  },

  getApplications(shelterId?: number): EnrichedApplication[] {
    const db = getSqliteDb();
    let query = `
      SELECT 
        aa.application_id,
        aa.match_id,
        aa.staff_id,
        aa.home_visit_date,
        aa.application_status,
        aa.submitted_at,
        m.adopter_id,
        m.pet_id,
        m.matched_at,
        m.status AS match_status,
        st.staff_name,
        st.role AS staff_role,
        p.shelter_id
      FROM ADOPTION_APPLICATION aa
      INNER JOIN PET_MATCH m ON aa.match_id = m.match_id
      INNER JOIN PET p ON m.pet_id = p.pet_id
      LEFT JOIN SHELTER_STAFF st ON aa.staff_id = st.staff_id
    `;
    const params: any[] = [];
    if (shelterId) {
      query += ` WHERE p.shelter_id = ?`;
      params.push(shelterId);
    }
    query += ` ORDER BY aa.submitted_at DESC`;

    const rows = db.prepare(query).all(...params) as any[];
    const applications: EnrichedApplication[] = [];

    for (const r of rows) {
      const pet = this.getPet(r.pet_id);
      const adopter = this.getAdopter(r.adopter_id);
      if (pet && adopter) {
        applications.push({
          application_id: r.application_id,
          match_id: r.match_id,
          staff_id: r.staff_id,
          home_visit_date: r.home_visit_date,
          application_status: r.application_status,
          submitted_at: r.submitted_at,
          match: {
            match_id: r.match_id,
            adopter_id: r.adopter_id,
            pet_id: r.pet_id,
            matched_at: r.matched_at,
            status: r.match_status,
          },
          pet,
          adopter,
          staff: r.staff_id && r.staff_name ? {
            staff_id: r.staff_id,
            shelter_id: pet.shelter_id,
            staff_name: r.staff_name,
            role: r.staff_role || '',
          } : undefined,
        });
      }
    }
    return applications;
  },

  approveAdoption(applicationId: number, staffId: number): number {
    const db = getSqliteDb();
    const app = db.prepare(`
      SELECT aa.application_id, m.pet_id, m.adopter_id, m.match_id
      FROM ADOPTION_APPLICATION aa
      INNER JOIN PET_MATCH m ON aa.match_id = m.match_id
      WHERE aa.application_id = ?
    `).get(applicationId) as any;

    if (!app) throw new Error('Application not found');

    db.prepare(`
      UPDATE ADOPTION_APPLICATION SET application_status = 'Approved', staff_id = ? WHERE application_id = ?
    `).run(staffId, applicationId);

    db.prepare(`UPDATE PET SET status = 'Adopted' WHERE pet_id = ?`).run(app.pet_id);
    db.prepare(`UPDATE PET_MATCH SET status = 'Closed' WHERE match_id = ?`).run(app.match_id);

    const res = db.prepare(`
      INSERT INTO SHELTER_DECISION (application_id, pet_id, adopter_id, staff_id, decision, decided_at, notes)
      VALUES (?, ?, ?, ?, 'Approved', datetime('now'), 'Adoption officially approved by shelter coordinator.')
    `).run(applicationId, app.pet_id, app.adopter_id, staffId);

    return Number(res.lastInsertRowid);
  },

  rejectAdoption(applicationId: number, staffId: number): number {
    const db = getSqliteDb();
    const app = db.prepare(`
      SELECT aa.application_id, m.pet_id, m.adopter_id, m.match_id
      FROM ADOPTION_APPLICATION aa
      INNER JOIN PET_MATCH m ON aa.match_id = m.match_id
      WHERE aa.application_id = ?
    `).get(applicationId) as any;

    if (!app) throw new Error('Application not found');

    db.prepare(`
      UPDATE ADOPTION_APPLICATION SET application_status = 'Rejected', staff_id = ? WHERE application_id = ?
    `).run(staffId, applicationId);

    db.prepare(`UPDATE PET SET status = 'Available' WHERE pet_id = ?`).run(app.pet_id);
    db.prepare(`UPDATE PET_MATCH SET status = 'Closed' WHERE match_id = ?`).run(app.match_id);

    const res = db.prepare(`
      INSERT INTO SHELTER_DECISION (application_id, pet_id, adopter_id, staff_id, decision, decided_at, notes)
      VALUES (?, ?, ?, ?, 'Rejected', datetime('now'), 'Application rejected after evaluation.')
    `).run(applicationId, app.pet_id, app.adopter_id, staffId);

    return Number(res.lastInsertRowid);
  },

  getAllPetsForShelter(shelterId?: number): EnrichedPet[] {
    const db = getSqliteDb();
    let query = `
      SELECT 
        p.pet_id,
        p.shelter_id,
        p.breed_name,
        p.pet_name,
        p.gender,
        p.age_months,
        p.size,
        p.behaviour_desc,
        p.lifestyle_desc,
        p.status,
        b.species,
        s.shelter_name,
        s.city AS shelter_city
      FROM PET p
      INNER JOIN BREED b ON p.breed_name = b.breed_name
      INNER JOIN SHELTER s ON p.shelter_id = s.shelter_id
    `;
    const params: any[] = [];
    if (shelterId) {
      query += ` WHERE p.shelter_id = ?`;
      params.push(shelterId);
    }
    query += ` ORDER BY p.pet_id DESC`;

    const rawPets = db.prepare(query).all(...params) as any[];
    const allPhotos = db.prepare(`SELECT * FROM PET_PHOTO ORDER BY is_primary DESC, photo_id ASC`).all() as unknown as PetPhoto[];

    return rawPets.map((p) => {
      const photos = allPhotos.filter((ph) => ph.pet_id === p.pet_id);
      const primary = photos.find((ph) => ph.is_primary === 1) || photos[0];
      return {
        ...p,
        photos,
        primary_photo:
          primary?.photo_url ||
          'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=800&q=80',
        approx_distance_km: 5,
      };
    });
  },

  runAcademicQuery(queryId: number): { title: string; sql: string; concept: string; rows: any[] } {
    const db = getSqliteDb();
    let title = '';
    let concept = '';
    let sql = '';

    switch (queryId) {
      case 1:
        title = '1. List all available pets';
        concept = 'Basic SELECT with WHERE condition and ORDER BY';
        sql = `SELECT pet_id, pet_name, gender, age_months, size AS pet_size, status FROM PET WHERE status = 'Available' ORDER BY pet_name ASC`;
        break;
      case 2:
        title = '2. Available pets with breed and shelter information';
        concept = '3-Table INNER JOIN navigating relationships';
        sql = `SELECT p.pet_id, p.pet_name, b.species, p.breed_name, p.gender, p.age_months, p.size AS pet_size, s.shelter_name, s.city AS shelter_city, p.status FROM PET p INNER JOIN BREED b ON p.breed_name = b.breed_name INNER JOIN SHELTER s ON p.shelter_id = s.shelter_id WHERE p.status = 'Available' ORDER BY s.city, p.pet_name`;
        break;
      case 3:
        title = '3. Find pets by species (Dog)';
        concept = 'INNER JOIN with predicate filtering on master taxonomy';
        sql = `SELECT p.pet_id, p.pet_name, b.species, p.breed_name, p.gender, p.age_months, p.status FROM PET p JOIN BREED b ON p.breed_name = b.breed_name WHERE b.species = 'Dog' AND p.status = 'Available' ORDER BY p.age_months ASC`;
        break;
      case 4:
        title = '4. Find pets by breed (Labrador Retriever)';
        concept = 'Foreign Key matching with Shelter join';
        sql = `SELECT p.pet_id, p.pet_name, p.breed_name, p.gender, p.age_months, p.size AS pet_size, s.shelter_name, s.city FROM PET p JOIN SHELTER s ON p.shelter_id = s.shelter_id WHERE p.breed_name = 'Labrador Retriever' AND p.status = 'Available'`;
        break;
      case 5:
        title = '5. Pets matching adopter preferences (Adopter 1 - Rahul)';
        concept = 'Multi-table JOIN with age range BETWEEN and preference matching';
        sql = `SELECT p.pet_id, p.pet_name, b.species, p.breed_name, p.age_months, p.size AS pet_size, p.status, a.full_name AS adopter_name FROM PET p JOIN BREED b ON p.breed_name = b.breed_name JOIN ADOPTER_PREFERENCE ap ON ap.adopter_id = 1 JOIN ADOPTER a ON a.adopter_id = ap.adopter_id WHERE p.status = 'Available' AND (ap.preferred_species IS NULL OR b.species = ap.preferred_species) AND (p.age_months BETWEEN ap.min_age_months AND ap.max_age_months) AND (ap.preferred_size IS NULL OR p.size = ap.preferred_size)`;
        break;
      case 6:
        title = "6. List an adopter's swipe history (Adopter 1)";
        concept = 'INNER JOIN with timestamp ordering';
        sql = `SELECT s.swipe_id, a.full_name AS adopter_name, p.pet_name, p.breed_name, s.direction AS swipe_action, s.swiped_at FROM SWIPE s JOIN ADOPTER a ON s.adopter_id = a.adopter_id JOIN PET p ON s.pet_id = p.pet_id WHERE s.adopter_id = 1 ORDER BY s.swiped_at DESC`;
        break;
      case 7:
        title = '7. List matches for an adopter (Adopter 1)';
        concept = 'Multi-table join displaying mutual interest and shelter contact info';
        sql = `SELECT m.match_id, a.full_name AS adopter_name, p.pet_id, p.pet_name, p.breed_name, sh.shelter_name, sh.city AS shelter_city, m.matched_at, m.status AS match_status FROM PET_MATCH m JOIN ADOPTER a ON m.adopter_id = a.adopter_id JOIN PET p ON m.pet_id = p.pet_id JOIN SHELTER sh ON p.shelter_id = sh.shelter_id WHERE m.adopter_id = 1 ORDER BY m.matched_at DESC`;
        break;
      case 8:
        title = '8. List pending adoption applications';
        concept = 'Multi-table JOIN linking application, match, applicant, and pet';
        sql = `SELECT aa.application_id, aa.submitted_at, aa.home_visit_date, aa.application_status, a.full_name AS applicant_name, a.phone AS contact_phone, p.pet_name, p.breed_name, s.shelter_name FROM ADOPTION_APPLICATION aa JOIN PET_MATCH m ON aa.match_id = m.match_id JOIN ADOPTER a ON m.adopter_id = a.adopter_id JOIN PET p ON m.pet_id = p.pet_id JOIN SHELTER s ON p.shelter_id = s.shelter_id WHERE aa.application_status = 'Pending' ORDER BY aa.submitted_at ASC`;
        break;
      case 9:
        title = '9. List applications handled by shelter staff';
        concept = 'LEFT OUTER JOIN with SHELTER_STAFF displaying caseworker assignment';
        sql = `SELECT aa.application_id, p.pet_name, a.full_name AS adopter_name, COALESCE(st.staff_name, 'Unassigned') AS reviewer_name, st.role AS staff_role, aa.home_visit_date, aa.application_status FROM ADOPTION_APPLICATION aa JOIN PET_MATCH m ON aa.match_id = m.match_id JOIN ADOPTER a ON m.adopter_id = a.adopter_id JOIN PET p ON m.pet_id = p.pet_id LEFT JOIN SHELTER_STAFF st ON aa.staff_id = st.staff_id ORDER BY aa.application_id ASC`;
        break;
      case 10:
        title = '10. List all adopted pets and their adopters';
        concept = '4-Table JOIN navigating historical decisions';
        sql = `SELECT p.pet_id, p.pet_name, p.breed_name, a.full_name AS adopter_name, a.city AS adopter_city, st.staff_name AS approved_by, sd.decided_at FROM SHELTER_DECISION sd JOIN PET p ON sd.pet_id = p.pet_id JOIN ADOPTER a ON sd.adopter_id = a.adopter_id JOIN SHELTER_STAFF st ON sd.staff_id = st.staff_id WHERE sd.decision = 'Approved' ORDER BY sd.decided_at DESC`;
        break;
      case 11:
        title = '11. Count pets by shelter (Census and Availability)';
        concept = 'GROUP BY with aggregate COUNT and conditional SUM';
        sql = `SELECT s.shelter_id, s.shelter_name, s.city, COUNT(p.pet_id) AS total_pets, SUM(CASE WHEN p.status = 'Available' THEN 1 ELSE 0 END) AS available_pets, SUM(CASE WHEN p.status = 'Adopted' THEN 1 ELSE 0 END) AS adopted_pets FROM SHELTER s LEFT JOIN PET p ON s.shelter_id = p.shelter_id GROUP BY s.shelter_id, s.shelter_name, s.city ORDER BY total_pets DESC`;
        break;
      case 12:
        title = '12. Count pets by breed and species';
        concept = 'Multi-column GROUP BY with HAVING clause';
        sql = `SELECT b.species, p.breed_name, COUNT(p.pet_id) AS total_count, ROUND(AVG(p.age_months), 1) AS avg_age_months FROM PET p JOIN BREED b ON p.breed_name = b.breed_name GROUP BY b.species, p.breed_name HAVING COUNT(p.pet_id) >= 1 ORDER BY b.species, total_count DESC`;
        break;
      case 13:
        title = '13. Adoption application status statistics';
        concept = 'Aggregation with percentage calculation';
        sql = `SELECT aa.application_status, COUNT(aa.application_id) AS count_applications, ROUND(COUNT(aa.application_id) * 100.0 / (SELECT COUNT(*) FROM ADOPTION_APPLICATION), 1) AS percentage_share FROM ADOPTION_APPLICATION aa GROUP BY aa.application_status ORDER BY count_applications DESC`;
        break;
      case 14:
        title = '14. Find shelters with currently available pets';
        concept = 'Subquery using EXISTS';
        sql = `SELECT s.shelter_id, s.shelter_name, s.license_no, s.city FROM SHELTER s WHERE EXISTS (SELECT 1 FROM PET p WHERE p.shelter_id = s.shelter_id AND p.status = 'Available') ORDER BY s.shelter_name`;
        break;
      default:
        throw new Error('Invalid query ID');
    }

    const rows = db.prepare(sql).all();
    return { title, concept, sql, rows };
  },
};
