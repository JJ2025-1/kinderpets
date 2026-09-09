// ============================================================================
// Project: Kinder Pets - DBMS DA2 Database Service
// Description: Relational database layer implementing all 12 DA1 entities.
// Engine: Node.js Built-in SQLite (node:sqlite) for local zero-dependency execution,
//         with full relational foreign keys, transactions, and SQL compatibility.
// Architecture: Designed to seamlessly map to Oracle 19c/21c database via SQL files in /database.
// ============================================================================

import { DatabaseSync } from 'node:sqlite';
import path from 'node:path';
import fs from 'node:fs';
import type {
  Shelter,
  ShelterStaff,
  Breed,
  Pet,
  PetPhoto,
  Adopter,
  AdopterPreference,
  PreferredBreed,
  Swipe,
  Match,
  AdoptionApplication,
  ShelterDecision,
  EnrichedPet,
  EnrichedMatch,
  EnrichedApplication,
} from './types';

// Global singleton instance for Next.js hot-reloading preservation
declare global {
  // eslint-disable-next-line no-var
  var __kinderpets_db: DatabaseSync | undefined;
}

const DB_PATH = path.join(process.cwd(), 'kinderpets.db');

function getDatabase(): DatabaseSync {
  if (!global.__kinderpets_db) {
    const isNew = !fs.existsSync(DB_PATH);
    const db = new DatabaseSync(DB_PATH);
    
    // Enable Foreign Keys & WAL mode for SQLite
    db.exec('PRAGMA foreign_keys = ON;');
    db.exec('PRAGMA journal_mode = WAL;');

    if (isNew) {
      initSchemaAndSeed(db);
    } else {
      // Check if schema exists
      try {
        const check = db.prepare("SELECT count(*) as count FROM sqlite_master WHERE type='table' AND name='SHELTER'").get() as { count: number };
        if (!check || check.count === 0) {
          initSchemaAndSeed(db);
        }
      } catch {
        initSchemaAndSeed(db);
      }
    }

    global.__kinderpets_db = db;
  }
  return global.__kinderpets_db;
}

function initSchemaAndSeed(db: DatabaseSync) {
  // Create 12 DA1 Entities
  db.exec(`
    CREATE TABLE IF NOT EXISTS SHELTER (
      shelter_id INTEGER PRIMARY KEY AUTOINCREMENT,
      shelter_name TEXT NOT NULL,
      license_no TEXT NOT NULL UNIQUE,
      city TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS SHELTER_STAFF (
      staff_id INTEGER PRIMARY KEY AUTOINCREMENT,
      shelter_id INTEGER NOT NULL,
      staff_name TEXT NOT NULL,
      role TEXT NOT NULL,
      FOREIGN KEY (shelter_id) REFERENCES SHELTER(shelter_id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS BREED (
      breed_name TEXT PRIMARY KEY,
      species TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS PET (
      pet_id INTEGER PRIMARY KEY AUTOINCREMENT,
      shelter_id INTEGER NOT NULL,
      breed_name TEXT NOT NULL,
      pet_name TEXT NOT NULL,
      gender TEXT NOT NULL CHECK(gender IN ('Male', 'Female', 'Unknown')),
      age_months INTEGER NOT NULL CHECK(age_months >= 0),
      size TEXT NOT NULL CHECK(size IN ('Small', 'Medium', 'Large', 'Extra Large')),
      behaviour_desc TEXT,
      lifestyle_desc TEXT,
      status TEXT NOT NULL DEFAULT 'Available' CHECK(status IN ('Available', 'Pending', 'Adopted', 'Fostered')),
      FOREIGN KEY (shelter_id) REFERENCES SHELTER(shelter_id) ON DELETE CASCADE,
      FOREIGN KEY (breed_name) REFERENCES BREED(breed_name)
    );

    CREATE TABLE IF NOT EXISTS PET_PHOTO (
      photo_id INTEGER PRIMARY KEY AUTOINCREMENT,
      pet_id INTEGER NOT NULL,
      photo_url TEXT NOT NULL,
      is_primary INTEGER NOT NULL DEFAULT 0 CHECK(is_primary IN (0, 1)),
      FOREIGN KEY (pet_id) REFERENCES PET(pet_id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS ADOPTER (
      adopter_id INTEGER PRIMARY KEY AUTOINCREMENT,
      full_name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      phone TEXT NOT NULL,
      city TEXT NOT NULL,
      state TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS ADOPTER_PREFERENCE (
      adopter_id INTEGER PRIMARY KEY,
      preferred_species TEXT,
      min_age_months INTEGER DEFAULT 0,
      max_age_months INTEGER DEFAULT 240,
      preferred_size TEXT CHECK(preferred_size IS NULL OR preferred_size IN ('Small', 'Medium', 'Large', 'Extra Large')),
      FOREIGN KEY (adopter_id) REFERENCES ADOPTER(adopter_id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS PREFERRED_BREED (
      adopter_id INTEGER NOT NULL,
      breed_name TEXT NOT NULL,
      PRIMARY KEY (adopter_id, breed_name),
      FOREIGN KEY (adopter_id) REFERENCES ADOPTER(adopter_id) ON DELETE CASCADE,
      FOREIGN KEY (breed_name) REFERENCES BREED(breed_name) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS SWIPE (
      swipe_id INTEGER PRIMARY KEY AUTOINCREMENT,
      adopter_id INTEGER NOT NULL,
      pet_id INTEGER NOT NULL,
      direction TEXT NOT NULL CHECK(direction IN ('LEFT', 'RIGHT')),
      swiped_at TEXT NOT NULL DEFAULT (datetime('now')),
      UNIQUE(adopter_id, pet_id),
      FOREIGN KEY (adopter_id) REFERENCES ADOPTER(adopter_id) ON DELETE CASCADE,
      FOREIGN KEY (pet_id) REFERENCES PET(pet_id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS MATCH (
      match_id INTEGER PRIMARY KEY AUTOINCREMENT,
      adopter_id INTEGER NOT NULL,
      pet_id INTEGER NOT NULL,
      matched_at TEXT NOT NULL DEFAULT (datetime('now')),
      status TEXT NOT NULL DEFAULT 'Active' CHECK(status IN ('Active', 'Applied', 'Closed')),
      UNIQUE(adopter_id, pet_id),
      FOREIGN KEY (adopter_id) REFERENCES ADOPTER(adopter_id) ON DELETE CASCADE,
      FOREIGN KEY (pet_id) REFERENCES PET(pet_id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS ADOPTION_APPLICATION (
      application_id INTEGER PRIMARY KEY AUTOINCREMENT,
      match_id INTEGER NOT NULL UNIQUE,
      staff_id INTEGER,
      home_visit_date TEXT NOT NULL,
      application_status TEXT NOT NULL DEFAULT 'Pending' CHECK(application_status IN ('Pending', 'Under Review', 'Approved', 'Rejected')),
      submitted_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (match_id) REFERENCES MATCH(match_id) ON DELETE CASCADE,
      FOREIGN KEY (staff_id) REFERENCES SHELTER_STAFF(staff_id) ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS SHELTER_DECISION (
      decision_id INTEGER PRIMARY KEY AUTOINCREMENT,
      pet_id INTEGER NOT NULL,
      adopter_id INTEGER NOT NULL,
      decision TEXT NOT NULL CHECK(decision IN ('Approved', 'Rejected')),
      staff_id INTEGER NOT NULL,
      decided_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (pet_id) REFERENCES PET(pet_id) ON DELETE CASCADE,
      FOREIGN KEY (adopter_id) REFERENCES ADOPTER(adopter_id) ON DELETE CASCADE,
      FOREIGN KEY (staff_id) REFERENCES SHELTER_STAFF(staff_id) ON DELETE CASCADE
    );
  `);

  // Insert seed data directly
  db.exec(`
    -- Shelters
    INSERT OR REPLACE INTO SHELTER (shelter_id, shelter_name, license_no, city) VALUES 
    (1, 'Paws & Tails Animal Rescue', 'KA-BLR-SHEL-2021-042', 'Bangalore'),
    (2, 'Compassion Pet Haven', 'MH-MUM-SHEL-2019-118', 'Mumbai'),
    (3, 'Safe Haven Animal Trust', 'TN-CHN-SHEL-2020-087', 'Chennai'),
    (4, 'Tails of Joy Foundation', 'DL-DEL-SHEL-2022-205', 'Delhi'),
    (5, 'Pune Animal Welfare Society', 'MH-PUN-SHEL-2018-013', 'Pune');

    -- Staff
    INSERT OR REPLACE INTO SHELTER_STAFF (staff_id, shelter_id, staff_name, role) VALUES 
    (1, 1, 'Dr. Rajesh Rao', 'Chief Veterinarian'),
    (2, 1, 'Priya Menon', 'Adoption Coordinator'),
    (3, 2, 'Vikram Deshmukh', 'Shelter Manager'),
    (4, 3, 'Kavita Sundaram', 'Senior Caretaker'),
    (5, 4, 'Amit Verma', 'Adoption Specialist'),
    (6, 5, 'Sunita Kulkarni', 'Rescue Coordinator');

    -- Breeds
    INSERT OR REPLACE INTO BREED (breed_name, species) VALUES 
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

    -- Pets
    INSERT OR REPLACE INTO PET (pet_id, shelter_id, breed_name, pet_name, gender, age_months, size, behaviour_desc, lifestyle_desc, status) VALUES 
    (1, 1, 'Labrador Retriever', 'Bruno', 'Male', 24, 'Large', 'Extremely friendly, loves playing fetch and great with kids', 'Active apartment or house with balcony, needs daily park walks', 'Available'),
    (2, 1, 'Indie / Desi Dog', 'Luna', 'Female', 12, 'Medium', 'Affectionate, quick learner, very loyal and alert', 'Ideal for both flats and independent homes; low maintenance grooming', 'Available'),
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

    -- Photos
    INSERT OR REPLACE INTO PET_PHOTO (photo_id, pet_id, photo_url, is_primary) VALUES 
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

    -- Adopters
    INSERT OR REPLACE INTO ADOPTER (adopter_id, full_name, email, phone, city, state) VALUES 
    (1, 'Rahul Sharma', 'rahul.sharma@example.com', '+91-9845012345', 'Bangalore', 'Karnataka'),
    (2, 'Priya Patel', 'priya.patel@example.com', '+91-9820054321', 'Mumbai', 'Maharashtra'),
    (3, 'Ananya Iyer', 'ananya.iyer@example.com', '+91-9840198765', 'Chennai', 'Tamil Nadu'),
    (4, 'Rohan Kapoor', 'rohan.kapoor@example.com', '+91-9811065432', 'Delhi', 'Delhi NCR'),
    (5, 'Sneha Deshpande', 'sneha.d@example.com', '+91-9765034567', 'Pune', 'Maharashtra'),
    (6, 'Aditya Verma', 'aditya.v@example.com', '+91-9888011223', 'Bangalore', 'Karnataka');

    -- Adopter Preferences
    INSERT OR REPLACE INTO ADOPTER_PREFERENCE (adopter_id, preferred_species, min_age_months, max_age_months, preferred_size) VALUES 
    (1, 'Dog', 6, 36, 'Large'),
    (2, 'Cat', 3, 48, 'Small'),
    (3, 'Dog', 6, 24, 'Medium'),
    (4, 'Dog', 12, 60, 'Large'),
    (5, 'Cat', 6, 30, 'Medium'),
    (6, 'Dog', 4, 18, 'Small');

    -- Preferred Breeds
    INSERT OR REPLACE INTO PREFERRED_BREED (adopter_id, breed_name) VALUES 
    (1, 'Labrador Retriever'),
    (1, 'Golden Retriever'),
    (2, 'Persian Cat'),
    (2, 'Siamese Cat'),
    (3, 'Indie / Desi Dog'),
    (3, 'Cocker Spaniel'),
    (4, 'German Shepherd'),
    (4, 'Labrador Retriever'),
    (5, 'Ragdoll Cat'),
    (6, 'Beagle');

    -- Historical Swipes
    INSERT OR REPLACE INTO SWIPE (swipe_id, adopter_id, pet_id, direction, swiped_at) VALUES 
    (1, 1, 1, 'RIGHT', '2026-09-01 10:30:00'),
    (2, 1, 2, 'RIGHT', '2026-09-01 10:32:15'),
    (3, 1, 4, 'LEFT',  '2026-09-01 10:34:00'),
    (4, 2, 4, 'RIGHT', '2026-09-02 11:15:00'),
    (5, 2, 15, 'RIGHT', '2026-09-02 11:18:00'),
    (6, 2, 1, 'LEFT',  '2026-09-02 11:20:00'),
    (7, 3, 2, 'RIGHT', '2026-09-03 14:00:00'),
    (8, 3, 13, 'RIGHT', '2026-09-03 14:05:00'),
    (9, 4, 14, 'RIGHT', '2026-08-20 09:30:00');

    -- Matches
    INSERT OR REPLACE INTO MATCH (match_id, adopter_id, pet_id, matched_at, status) VALUES 
    (1, 1, 1, '2026-09-01 10:30:05', 'Active'),
    (2, 1, 2, '2026-09-01 10:32:20', 'Applied'),
    (3, 2, 4, '2026-09-02 11:15:10', 'Active'),
    (4, 3, 13, '2026-09-03 14:05:05', 'Applied'),
    (5, 4, 14, '2026-08-20 09:30:10', 'Closed');

    -- Applications
    INSERT OR REPLACE INTO ADOPTION_APPLICATION (application_id, match_id, staff_id, home_visit_date, application_status, submitted_at) VALUES 
    (1, 2, 2, '2026-09-15', 'Pending', '2026-09-01 11:00:00'),
    (2, 4, 3, '2026-09-18', 'Under Review', '2026-09-03 15:30:00'),
    (3, 5, 4, '2026-08-25', 'Approved', '2026-08-20 10:00:00');

    -- Decisions
    INSERT OR REPLACE INTO SHELTER_DECISION (decision_id, pet_id, adopter_id, decision, staff_id, decided_at) VALUES 
    (1, 14, 4, 'Approved', 4, '2026-08-26 16:45:00');
  `);
}

// Distance approximation between Indian metro cities
const CITY_DISTANCES: Record<string, Record<string, number>> = {
  Bangalore: { Bangalore: 4, Chennai: 345, Mumbai: 980, Pune: 840, Delhi: 2150 },
  Mumbai: { Mumbai: 6, Pune: 150, Bangalore: 980, Chennai: 1330, Delhi: 1420 },
  Chennai: { Chennai: 5, Bangalore: 345, Mumbai: 1330, Pune: 1180, Delhi: 2180 },
  Delhi: { Delhi: 8, Mumbai: 1420, Pune: 1440, Bangalore: 2150, Chennai: 2180 },
  Pune: { Pune: 5, Mumbai: 150, Bangalore: 840, Chennai: 1180, Delhi: 1440 },
};

function getDistance(city1: string, city2: string): number {
  if (CITY_DISTANCES[city1] && CITY_DISTANCES[city1][city2] !== undefined) {
    return CITY_DISTANCES[city1][city2];
  }
  if (CITY_DISTANCES[city2] && CITY_DISTANCES[city2][city1] !== undefined) {
    return CITY_DISTANCES[city2][city1];
  }
  return 450; // default fallback distance in km
}

export const dbService = {
  // Reset database back to seed state
  resetDatabase() {
    const db = getDatabase();
    db.exec(`
      DROP TABLE IF EXISTS SHELTER_DECISION;
      DROP TABLE IF EXISTS ADOPTION_APPLICATION;
      DROP TABLE IF EXISTS MATCH;
      DROP TABLE IF EXISTS SWIPE;
      DROP TABLE IF EXISTS PREFERRED_BREED;
      DROP TABLE IF EXISTS ADOPTER_PREFERENCE;
      DROP TABLE IF EXISTS PET_PHOTO;
      DROP TABLE IF EXISTS PET;
      DROP TABLE IF EXISTS BREED;
      DROP TABLE IF EXISTS SHELTER_STAFF;
      DROP TABLE IF EXISTS ADOPTER;
      DROP TABLE IF EXISTS SHELTER;
    `);
    initSchemaAndSeed(db);
  },

  // 1. Shelters
  getShelters(): Shelter[] {
    const db = getDatabase();
    return db.prepare('SELECT * FROM SHELTER ORDER BY shelter_name ASC').all() as unknown as Shelter[];
  },

  // 2. Staff
  getStaff(shelterId?: number): ShelterStaff[] {
    const db = getDatabase();
    if (shelterId) {
      return db.prepare('SELECT * FROM SHELTER_STAFF WHERE shelter_id = ?').all(shelterId) as unknown as ShelterStaff[];
    }
    return db.prepare('SELECT * FROM SHELTER_STAFF ORDER BY staff_name ASC').all() as unknown as ShelterStaff[];
  },

  // 3. Breeds
  getBreeds(): Breed[] {
    const db = getDatabase();
    return db.prepare('SELECT * FROM BREED ORDER BY breed_name ASC').all() as unknown as Breed[];
  },

  // 4. Adopters
  getAdopters(): Adopter[] {
    const db = getDatabase();
    return db.prepare('SELECT * FROM ADOPTER ORDER BY full_name ASC').all() as unknown as Adopter[];
  },

  getAdopter(adopterId: number): Adopter | null {
    const db = getDatabase();
    const adopter = db.prepare('SELECT * FROM ADOPTER WHERE adopter_id = ?').get(adopterId);
    return (adopter as unknown as Adopter) || null;
  },

  getAdopterPreferences(adopterId: number): { preference: AdopterPreference | null; preferredBreeds: string[] } {
    const db = getDatabase();
    const pref = db.prepare('SELECT * FROM ADOPTER_PREFERENCE WHERE adopter_id = ?').get(adopterId) as unknown as AdopterPreference | undefined;
    const breeds = db.prepare('SELECT breed_name FROM PREFERRED_BREED WHERE adopter_id = ?').all(adopterId) as unknown as { breed_name: string }[];
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
  ) {
    const db = getDatabase();
    db.exec('BEGIN TRANSACTION;');
    try {
      db.prepare(`
        INSERT INTO ADOPTER_PREFERENCE (adopter_id, preferred_species, min_age_months, max_age_months, preferred_size)
        VALUES (?, ?, ?, ?, ?)
        ON CONFLICT(adopter_id) DO UPDATE SET
          preferred_species = excluded.preferred_species,
          min_age_months = excluded.min_age_months,
          max_age_months = excluded.max_age_months,
          preferred_size = excluded.preferred_size;
      `).run(adopterId, preferredSpecies, minAgeMonths, maxAgeMonths, preferredSize);

      db.prepare('DELETE FROM PREFERRED_BREED WHERE adopter_id = ?').run(adopterId);
      const insertBreed = db.prepare('INSERT INTO PREFERRED_BREED (adopter_id, breed_name) VALUES (?, ?)');
      for (const breed of preferredBreeds) {
        insertBreed.run(adopterId, breed);
      }
      db.exec('COMMIT;');
    } catch (e) {
      db.exec('ROLLBACK;');
      throw e;
    }
  },

  // 5. Discover Pets (Filtered & Enriched with Photos & Distance)
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
    const db = getDatabase();
    let query = `
      SELECT 
        p.*,
        b.species,
        s.shelter_name,
        s.city AS shelter_city
      FROM PET p
      JOIN BREED b ON p.breed_name = b.breed_name
      JOIN SHELTER s ON p.shelter_id = s.shelter_id
      WHERE p.status = 'Available'
    `;
    const params: (string | number)[] = [];

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

    const pets = db.prepare(query).all(...params) as unknown as (Pet & { species: string; shelter_name: string; shelter_city: string })[];

    // Retrieve adopter's city for distance calculation
    let adopterCity = 'Bangalore';
    if (options.adopterId) {
      const adopter = this.getAdopter(options.adopterId);
      if (adopter) adopterCity = adopter.city;
    } else if (options.city) {
      adopterCity = options.city;
    }

    // Enrich with photos & approx distance
    const getPhotosStmt = db.prepare('SELECT * FROM PET_PHOTO WHERE pet_id = ? ORDER BY is_primary DESC, photo_id ASC');

    const enriched: EnrichedPet[] = pets.map((p) => {
      const photos = getPhotosStmt.all(p.pet_id) as unknown as PetPhoto[];
      const primary = photos.find((ph) => ph.is_primary === 1) || photos[0];
      const dist = getDistance(adopterCity, p.shelter_city);

      return {
        ...p,
        photos,
        primary_photo: primary?.photo_url || 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=800&q=80',
        approx_distance_km: dist,
      };
    });

    if (options.maxDistanceKm) {
      return enriched.filter((p) => p.approx_distance_km <= options.maxDistanceKm!);
    }

    return enriched;
  },

  // 6. Get Single Pet
  getPet(petId: number): EnrichedPet | null {
    const db = getDatabase();
    const pet = db.prepare(`
      SELECT 
        p.*,
        b.species,
        s.shelter_name,
        s.city AS shelter_city
      FROM PET p
      JOIN BREED b ON p.breed_name = b.breed_name
      JOIN SHELTER s ON p.shelter_id = s.shelter_id
      WHERE p.pet_id = ?
    `).get(petId) as unknown as (Pet & { species: string; shelter_name: string; shelter_city: string }) | undefined;

    if (!pet) return null;

    const photos = db.prepare('SELECT * FROM PET_PHOTO WHERE pet_id = ? ORDER BY is_primary DESC, photo_id ASC').all(petId) as unknown as PetPhoto[];
    const primary = photos.find((ph) => ph.is_primary === 1) || photos[0];

    return {
      ...pet,
      photos,
      primary_photo: primary?.photo_url || 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=800&q=80',
      approx_distance_km: 5,
    };
  },

  // 7. Add Pet (PL/SQL add_pet procedure simulation)
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
    const db = getDatabase();
    db.exec('BEGIN TRANSACTION;');
    try {
      const result = db.prepare(`
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

      const petId = Number(result.lastInsertRowid);

      if (petData.photo_urls && petData.photo_urls.length > 0) {
        const insertPhoto = db.prepare('INSERT INTO PET_PHOTO (pet_id, photo_url, is_primary) VALUES (?, ?, ?)');
        petData.photo_urls.forEach((url, idx) => {
          insertPhoto.run(petId, url, idx === 0 ? 1 : 0);
        });
      } else {
        // Default placeholder photo
        db.prepare('INSERT INTO PET_PHOTO (pet_id, photo_url, is_primary) VALUES (?, ?, 1)').run(
          petId,
          'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=800&q=80'
        );
      }

      db.exec('COMMIT;');
      return petId;
    } catch (e) {
      db.exec('ROLLBACK;');
      throw e;
    }
  },

  // 8. Update Pet Status
  updatePetStatus(petId: number, status: string) {
    const db = getDatabase();
    db.prepare('UPDATE PET SET status = ? WHERE pet_id = ?').run(status, petId);
  },

  // 9. Record Swipe (PL/SQL record_swipe simulation)
  recordSwipe(adopterId: number, petId: number, direction: 'LEFT' | 'RIGHT'): { isMatch: boolean; matchId?: number } {
    const db = getDatabase();
    db.exec('BEGIN TRANSACTION;');
    try {
      // Upsert into SWIPE
      db.prepare(`
        INSERT INTO SWIPE (adopter_id, pet_id, direction, swiped_at)
        VALUES (?, ?, ?, datetime('now'))
        ON CONFLICT(adopter_id, pet_id) DO UPDATE SET
          direction = excluded.direction,
          swiped_at = datetime('now');
      `).run(adopterId, petId, direction);

      let isMatch = false;
      let matchId: number | undefined;

      if (direction === 'RIGHT') {
        // Deterministic matching rule:
        // When adopter expresses interest (swipes RIGHT) on an Available pet,
        // create a MATCH record with status 'Active'.
        const existingMatch = db.prepare('SELECT match_id, status FROM MATCH WHERE adopter_id = ? AND pet_id = ?').get(adopterId, petId) as { match_id: number; status: string } | undefined;

        if (existingMatch) {
          isMatch = true;
          matchId = existingMatch.match_id;
        } else {
          const insertMatch = db.prepare(`
            INSERT INTO MATCH (adopter_id, pet_id, matched_at, status)
            VALUES (?, ?, datetime('now'), 'Active')
          `).run(adopterId, petId);
          isMatch = true;
          matchId = Number(insertMatch.lastInsertRowid);
        }
      }

      db.exec('COMMIT;');
      return { isMatch, matchId };
    } catch (e) {
      db.exec('ROLLBACK;');
      throw e;
    }
  },

  // 10. Get Matches for Adopter
  getAdopterMatches(adopterId: number): EnrichedMatch[] {
    const db = getDatabase();
    const rows = db.prepare(`
      SELECT 
        m.*,
        a.full_name AS adopter_name,
        a.email AS adopter_email,
        a.phone AS adopter_phone,
        a.city AS adopter_city,
        a.state AS adopter_state,
        app.application_id,
        app.application_status
      FROM MATCH m
      JOIN ADOPTER a ON m.adopter_id = a.adopter_id
      LEFT JOIN ADOPTION_APPLICATION app ON m.match_id = app.match_id
      WHERE m.adopter_id = ?
      ORDER BY m.matched_at DESC
    `).all(adopterId) as unknown as (Match & {
      adopter_name: string;
      adopter_email: string;
      adopter_phone: string;
      adopter_city: string;
      adopter_state: string;
      application_id?: number;
      application_status?: string;
    })[];

    return rows.map((r) => {
      const pet = this.getPet(r.pet_id)!;
      return {
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
        application_id: r.application_id,
        application_status: r.application_status as any,
      };
    });
  },

  // 11. Submit Adoption Application (PL/SQL submit_adoption_application simulation)
  submitAdoptionApplication(matchId: number, homeVisitDate: string): number {
    const db = getDatabase();
    db.exec('BEGIN TRANSACTION;');
    try {
      const match = db.prepare('SELECT pet_id, status FROM MATCH WHERE match_id = ?').get(matchId) as { pet_id: number; status: string } | undefined;
      if (!match) {
        throw new Error('Match not found.');
      }

      const res = db.prepare(`
        INSERT INTO ADOPTION_APPLICATION (match_id, staff_id, home_visit_date, application_status, submitted_at)
        VALUES (?, NULL, ?, 'Pending', datetime('now'))
      `).run(matchId, homeVisitDate);

      const appId = Number(res.lastInsertRowid);

      // Transition match to 'Applied' and pet to 'Pending'
      db.prepare("UPDATE MATCH SET status = 'Applied' WHERE match_id = ?").run(matchId);
      db.prepare("UPDATE PET SET status = 'Pending' WHERE pet_id = ?").run(match.pet_id);

      db.exec('COMMIT;');
      return appId;
    } catch (e) {
      db.exec('ROLLBACK;');
      throw e;
    }
  },

  // 12. Get Applications (for Shelter Dashboard)
  getApplications(shelterId?: number): EnrichedApplication[] {
    const db = getDatabase();
    let query = `
      SELECT 
        aa.*,
        m.adopter_id,
        m.pet_id,
        m.matched_at,
        m.status AS match_status,
        st.staff_name,
        st.role AS staff_role,
        p.shelter_id
      FROM ADOPTION_APPLICATION aa
      JOIN MATCH m ON aa.match_id = m.match_id
      JOIN PET p ON m.pet_id = p.pet_id
      LEFT JOIN SHELTER_STAFF st ON aa.staff_id = st.staff_id
    `;
    const params: number[] = [];
    if (shelterId) {
      query += ` WHERE p.shelter_id = ?`;
      params.push(shelterId);
    }
    query += ` ORDER BY aa.submitted_at DESC`;

    const rows = db.prepare(query).all(...params) as unknown as (AdoptionApplication & {
      adopter_id: number;
      pet_id: number;
      matched_at: string;
      match_status: string;
      staff_name?: string;
      staff_role?: string;
    })[];

    return rows.map((r) => {
      const pet = this.getPet(r.pet_id)!;
      const adopter = this.getAdopter(r.adopter_id)!;
      return {
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
          status: r.match_status as any,
        },
        pet,
        adopter,
        staff: r.staff_id && r.staff_name ? {
          staff_id: r.staff_id,
          shelter_id: pet.shelter_id,
          staff_name: r.staff_name,
          role: r.staff_role || '',
        } : undefined,
      };
    });
  },

  // 13. Approve Adoption (PL/SQL approve_adoption simulation)
  approveAdoption(applicationId: number, staffId: number): number {
    const db = getDatabase();
    db.exec('BEGIN TRANSACTION;');
    try {
      const app = db.prepare(`
        SELECT aa.match_id, m.pet_id, m.adopter_id
        FROM ADOPTION_APPLICATION aa
        JOIN MATCH m ON aa.match_id = m.match_id
        WHERE aa.application_id = ?
      `).get(applicationId) as { match_id: number; pet_id: number; adopter_id: number } | undefined;

      if (!app) throw new Error('Application not found');

      // 1. Insert into SHELTER_DECISION
      const decRes = db.prepare(`
        INSERT INTO SHELTER_DECISION (pet_id, adopter_id, decision, staff_id, decided_at)
        VALUES (?, ?, 'Approved', ?, datetime('now'))
      `).run(app.pet_id, app.adopter_id, staffId);

      const decisionId = Number(decRes.lastInsertRowid);

      // 2. Update ADOPTION_APPLICATION
      db.prepare(`
        UPDATE ADOPTION_APPLICATION
        SET application_status = 'Approved', staff_id = ?
        WHERE application_id = ?
      `).run(staffId, applicationId);

      // 3. Update PET status to 'Adopted'
      db.prepare("UPDATE PET SET status = 'Adopted' WHERE pet_id = ?").run(app.pet_id);

      // 4. Update MATCH status to 'Closed'
      db.prepare("UPDATE MATCH SET status = 'Closed' WHERE match_id = ?").run(app.match_id);

      db.exec('COMMIT;');
      return decisionId;
    } catch (e) {
      db.exec('ROLLBACK;');
      throw e;
    }
  },

  // 14. Reject Adoption (PL/SQL reject_adoption simulation)
  rejectAdoption(applicationId: number, staffId: number): number {
    const db = getDatabase();
    db.exec('BEGIN TRANSACTION;');
    try {
      const app = db.prepare(`
        SELECT aa.match_id, m.pet_id, m.adopter_id
        FROM ADOPTION_APPLICATION aa
        JOIN MATCH m ON aa.match_id = m.match_id
        WHERE aa.application_id = ?
      `).get(applicationId) as { match_id: number; pet_id: number; adopter_id: number } | undefined;

      if (!app) throw new Error('Application not found');

      // 1. Insert into SHELTER_DECISION
      const decRes = db.prepare(`
        INSERT INTO SHELTER_DECISION (pet_id, adopter_id, decision, staff_id, decided_at)
        VALUES (?, ?, 'Rejected', ?, datetime('now'))
      `).run(app.pet_id, app.adopter_id, staffId);

      const decisionId = Number(decRes.lastInsertRowid);

      // 2. Update ADOPTION_APPLICATION
      db.prepare(`
        UPDATE ADOPTION_APPLICATION
        SET application_status = 'Rejected', staff_id = ?
        WHERE application_id = ?
      `).run(staffId, applicationId);

      // 3. Revert PET status back to 'Available'
      db.prepare("UPDATE PET SET status = 'Available' WHERE pet_id = ?").run(app.pet_id);

      // 4. Update MATCH status to 'Closed'
      db.prepare("UPDATE MATCH SET status = 'Closed' WHERE match_id = ?").run(app.match_id);

      db.exec('COMMIT;');
      return decisionId;
    } catch (e) {
      db.exec('ROLLBACK;');
      throw e;
    }
  },

  // 15. All Pets for Shelter Inventory
  getAllPetsForShelter(shelterId?: number): EnrichedPet[] {
    const db = getDatabase();
    let query = `
      SELECT 
        p.*,
        b.species,
        s.shelter_name,
        s.city AS shelter_city
      FROM PET p
      JOIN BREED b ON p.breed_name = b.breed_name
      JOIN SHELTER s ON p.shelter_id = s.shelter_id
    `;
    const params: number[] = [];
    if (shelterId) {
      query += ` WHERE p.shelter_id = ?`;
      params.push(shelterId);
    }
    query += ` ORDER BY p.pet_id DESC`;

    const pets = db.prepare(query).all(...params) as unknown as (Pet & { species: string; shelter_name: string; shelter_city: string })[];
    const getPhotosStmt = db.prepare('SELECT * FROM PET_PHOTO WHERE pet_id = ? ORDER BY is_primary DESC, photo_id ASC');

    return pets.map((p) => {
      const photos = getPhotosStmt.all(p.pet_id) as unknown as PetPhoto[];
      const primary = photos.find((ph) => ph.is_primary === 1) || photos[0];
      return {
        ...p,
        photos,
        primary_photo: primary?.photo_url || 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=800&q=80',
        approx_distance_km: 5,
      };
    });
  },

  // 16. Academic Queries Runner (Demonstrating all 14 DA2 queries live)
  runAcademicQuery(queryId: number): { title: string; sql: string; concept: string; rows: any[] } {
    const db = getDatabase();
    switch (queryId) {
      case 1:
        return {
          title: '1. List all available pets',
          concept: 'Basic SELECT with WHERE condition and ORDER BY',
          sql: `SELECT pet_id, pet_name, gender, age_months, size, status FROM PET WHERE status = 'Available' ORDER BY pet_name ASC;`,
          rows: db.prepare(`SELECT pet_id, pet_name, gender, age_months, size, status FROM PET WHERE status = 'Available' ORDER BY pet_name ASC`).all(),
        };
      case 2:
        return {
          title: '2. Available pets with breed and shelter information',
          concept: '3-Table INNER JOIN navigating relationships',
          sql: `SELECT p.pet_id, p.pet_name, b.species, p.breed_name, p.gender, p.age_months, p.size, s.shelter_name, s.city AS shelter_city, p.status FROM PET p INNER JOIN BREED b ON p.breed_name = b.breed_name INNER JOIN SHELTER s ON p.shelter_id = s.shelter_id WHERE p.status = 'Available' ORDER BY s.city, p.pet_name;`,
          rows: db.prepare(`SELECT p.pet_id, p.pet_name, b.species, p.breed_name, p.gender, p.age_months, p.size, s.shelter_name, s.city AS shelter_city, p.status FROM PET p INNER JOIN BREED b ON p.breed_name = b.breed_name INNER JOIN SHELTER s ON p.shelter_id = s.shelter_id WHERE p.status = 'Available' ORDER BY s.city, p.pet_name`).all(),
        };
      case 3:
        return {
          title: '3. Find pets by species (Dog)',
          concept: 'INNER JOIN with predicate filtering on master taxonomy',
          sql: `SELECT p.pet_id, p.pet_name, b.species, p.breed_name, p.gender, p.age_months, p.status FROM PET p JOIN BREED b ON p.breed_name = b.breed_name WHERE b.species = 'Dog' AND p.status = 'Available' ORDER BY p.age_months ASC;`,
          rows: db.prepare(`SELECT p.pet_id, p.pet_name, b.species, p.breed_name, p.gender, p.age_months, p.status FROM PET p JOIN BREED b ON p.breed_name = b.breed_name WHERE b.species = 'Dog' AND p.status = 'Available' ORDER BY p.age_months ASC`).all(),
        };
      case 4:
        return {
          title: '4. Find pets by breed (Labrador Retriever)',
          concept: 'Foreign Key matching with Shelter join',
          sql: `SELECT p.pet_id, p.pet_name, p.breed_name, p.gender, p.age_months, p.size, s.shelter_name, s.city FROM PET p JOIN SHELTER s ON p.shelter_id = s.shelter_id WHERE p.breed_name = 'Labrador Retriever' AND p.status = 'Available';`,
          rows: db.prepare(`SELECT p.pet_id, p.pet_name, p.breed_name, p.gender, p.age_months, p.size, s.shelter_name, s.city FROM PET p JOIN SHELTER s ON p.shelter_id = s.shelter_id WHERE p.breed_name = 'Labrador Retriever' AND p.status = 'Available'`).all(),
        };
      case 5:
        return {
          title: '5. Pets matching adopter preferences (Adopter 1 - Rahul)',
          concept: 'Multi-table JOIN with age range BETWEEN and EXISTS subquery',
          sql: `SELECT p.pet_id, p.pet_name, b.species, p.breed_name, p.age_months, p.size, p.status, a.full_name AS adopter_name FROM PET p JOIN BREED b ON p.breed_name = b.breed_name JOIN ADOPTER_PREFERENCE ap ON ap.adopter_id = 1 JOIN ADOPTER a ON a.adopter_id = ap.adopter_id WHERE p.status = 'Available' AND (ap.preferred_species IS NULL OR b.species = ap.preferred_species) AND (p.age_months BETWEEN ap.min_age_months AND ap.max_age_months) AND (ap.preferred_size IS NULL OR p.size = ap.preferred_size);`,
          rows: db.prepare(`SELECT p.pet_id, p.pet_name, b.species, p.breed_name, p.age_months, p.size, p.status, a.full_name AS adopter_name FROM PET p JOIN BREED b ON p.breed_name = b.breed_name JOIN ADOPTER_PREFERENCE ap ON ap.adopter_id = 1 JOIN ADOPTER a ON a.adopter_id = ap.adopter_id WHERE p.status = 'Available' AND (ap.preferred_species IS NULL OR b.species = ap.preferred_species) AND (p.age_months BETWEEN ap.min_age_months AND ap.max_age_months) AND (ap.preferred_size IS NULL OR p.size = ap.preferred_size)`).all(),
        };
      case 6:
        return {
          title: "6. List an adopter's swipe history (Adopter 1)",
          concept: 'INNER JOIN with timestamp ordering',
          sql: `SELECT s.swipe_id, a.full_name AS adopter_name, p.pet_name, p.breed_name, s.direction AS swipe_action, s.swiped_at FROM SWIPE s JOIN ADOPTER a ON s.adopter_id = a.adopter_id JOIN PET p ON s.pet_id = p.pet_id WHERE s.adopter_id = 1 ORDER BY s.swiped_at DESC;`,
          rows: db.prepare(`SELECT s.swipe_id, a.full_name AS adopter_name, p.pet_name, p.breed_name, s.direction AS swipe_action, s.swiped_at FROM SWIPE s JOIN ADOPTER a ON s.adopter_id = a.adopter_id JOIN PET p ON s.pet_id = p.pet_id WHERE s.adopter_id = 1 ORDER BY s.swiped_at DESC`).all(),
        };
      case 7:
        return {
          title: '7. List matches for an adopter (Adopter 1)',
          concept: 'Multi-table join displaying mutual interest and shelter contact info',
          sql: `SELECT m.match_id, a.full_name AS adopter_name, p.pet_id, p.pet_name, p.breed_name, sh.shelter_name, sh.city AS shelter_city, m.matched_at, m.status AS match_status FROM MATCH m JOIN ADOPTER a ON m.adopter_id = a.adopter_id JOIN PET p ON m.pet_id = p.pet_id JOIN SHELTER sh ON p.shelter_id = sh.shelter_id WHERE m.adopter_id = 1 ORDER BY m.matched_at DESC;`,
          rows: db.prepare(`SELECT m.match_id, a.full_name AS adopter_name, p.pet_id, p.pet_name, p.breed_name, sh.shelter_name, sh.city AS shelter_city, m.matched_at, m.status AS match_status FROM MATCH m JOIN ADOPTER a ON m.adopter_id = a.adopter_id JOIN PET p ON m.pet_id = p.pet_id JOIN SHELTER sh ON p.shelter_id = sh.shelter_id WHERE m.adopter_id = 1 ORDER BY m.matched_at DESC`).all(),
        };
      case 8:
        return {
          title: '8. List pending adoption applications',
          concept: 'Multi-table JOIN linking application, match, applicant, and pet',
          sql: `SELECT aa.application_id, aa.submitted_at, aa.home_visit_date, aa.application_status, a.full_name AS applicant_name, a.phone AS contact_phone, p.pet_name, p.breed_name, s.shelter_name FROM ADOPTION_APPLICATION aa JOIN MATCH m ON aa.match_id = m.match_id JOIN ADOPTER a ON m.adopter_id = a.adopter_id JOIN PET p ON m.pet_id = p.pet_id JOIN SHELTER s ON p.shelter_id = s.shelter_id WHERE aa.application_status = 'Pending' ORDER BY aa.submitted_at ASC;`,
          rows: db.prepare(`SELECT aa.application_id, aa.submitted_at, aa.home_visit_date, aa.application_status, a.full_name AS applicant_name, a.phone AS contact_phone, p.pet_name, p.breed_name, s.shelter_name FROM ADOPTION_APPLICATION aa JOIN MATCH m ON aa.match_id = m.match_id JOIN ADOPTER a ON m.adopter_id = a.adopter_id JOIN PET p ON m.pet_id = p.pet_id JOIN SHELTER s ON p.shelter_id = s.shelter_id WHERE aa.application_status = 'Pending' ORDER BY aa.submitted_at ASC`).all(),
        };
      case 9:
        return {
          title: '9. List applications handled by shelter staff',
          concept: 'LEFT OUTER JOIN with SHELTER_STAFF displaying caseworker assignment',
          sql: `SELECT aa.application_id, p.pet_name, a.full_name AS adopter_name, COALESCE(st.staff_name, 'Unassigned') AS reviewer_name, st.role AS staff_role, aa.home_visit_date, aa.application_status FROM ADOPTION_APPLICATION aa JOIN MATCH m ON aa.match_id = m.match_id JOIN ADOPTER a ON m.adopter_id = a.adopter_id JOIN PET p ON m.pet_id = p.pet_id LEFT JOIN SHELTER_STAFF st ON aa.staff_id = st.staff_id ORDER BY aa.application_id ASC;`,
          rows: db.prepare(`SELECT aa.application_id, p.pet_name, a.full_name AS adopter_name, COALESCE(st.staff_name, 'Unassigned') AS reviewer_name, st.role AS staff_role, aa.home_visit_date, aa.application_status FROM ADOPTION_APPLICATION aa JOIN MATCH m ON aa.match_id = m.match_id JOIN ADOPTER a ON m.adopter_id = a.adopter_id JOIN PET p ON m.pet_id = p.pet_id LEFT JOIN SHELTER_STAFF st ON aa.staff_id = st.staff_id ORDER BY aa.application_id ASC`).all(),
        };
      case 10:
        return {
          title: '10. List all adopted pets and their adopters',
          concept: '4-Table JOIN navigating historical decisions',
          sql: `SELECT p.pet_id, p.pet_name, p.breed_name, a.full_name AS adopter_name, a.city AS adopter_city, st.staff_name AS approved_by, sd.decided_at FROM SHELTER_DECISION sd JOIN PET p ON sd.pet_id = p.pet_id JOIN ADOPTER a ON sd.adopter_id = a.adopter_id JOIN SHELTER_STAFF st ON sd.staff_id = st.staff_id WHERE sd.decision = 'Approved' ORDER BY sd.decided_at DESC;`,
          rows: db.prepare(`SELECT p.pet_id, p.pet_name, p.breed_name, a.full_name AS adopter_name, a.city AS adopter_city, st.staff_name AS approved_by, sd.decided_at FROM SHELTER_DECISION sd JOIN PET p ON sd.pet_id = p.pet_id JOIN ADOPTER a ON sd.adopter_id = a.adopter_id JOIN SHELTER_STAFF st ON sd.staff_id = st.staff_id WHERE sd.decision = 'Approved' ORDER BY sd.decided_at DESC`).all(),
        };
      case 11:
        return {
          title: '11. Count pets by shelter (Census & Availability)',
          concept: 'GROUP BY with aggregate COUNT and conditional SUM',
          sql: `SELECT s.shelter_id, s.shelter_name, s.city, COUNT(p.pet_id) AS total_pets, SUM(CASE WHEN p.status = 'Available' THEN 1 ELSE 0 END) AS available_pets, SUM(CASE WHEN p.status = 'Adopted' THEN 1 ELSE 0 END) AS adopted_pets FROM SHELTER s LEFT JOIN PET p ON s.shelter_id = p.shelter_id GROUP BY s.shelter_id, s.shelter_name, s.city ORDER BY total_pets DESC;`,
          rows: db.prepare(`SELECT s.shelter_id, s.shelter_name, s.city, COUNT(p.pet_id) AS total_pets, SUM(CASE WHEN p.status = 'Available' THEN 1 ELSE 0 END) AS available_pets, SUM(CASE WHEN p.status = 'Adopted' THEN 1 ELSE 0 END) AS adopted_pets FROM SHELTER s LEFT JOIN PET p ON s.shelter_id = p.shelter_id GROUP BY s.shelter_id, s.shelter_name, s.city ORDER BY total_pets DESC`).all(),
        };
      case 12:
        return {
          title: '12. Count pets by breed and species',
          concept: 'Multi-column GROUP BY with HAVING clause',
          sql: `SELECT b.species, p.breed_name, COUNT(p.pet_id) AS total_count, ROUND(AVG(p.age_months), 1) AS avg_age_months FROM PET p JOIN BREED b ON p.breed_name = b.breed_name GROUP BY b.species, p.breed_name HAVING COUNT(p.pet_id) >= 1 ORDER BY b.species, total_count DESC;`,
          rows: db.prepare(`SELECT b.species, p.breed_name, COUNT(p.pet_id) AS total_count, ROUND(AVG(p.age_months), 1) AS avg_age_months FROM PET p JOIN BREED b ON p.breed_name = b.breed_name GROUP BY b.species, p.breed_name HAVING COUNT(p.pet_id) >= 1 ORDER BY b.species, total_count DESC`).all(),
        };
      case 13:
        return {
          title: '13. Adoption application status statistics',
          concept: 'Aggregation with percentage calculation',
          sql: `SELECT aa.application_status, COUNT(aa.application_id) AS count_applications, ROUND(COUNT(aa.application_id) * 100.0 / (SELECT COUNT(*) FROM ADOPTION_APPLICATION), 1) AS percentage_share FROM ADOPTION_APPLICATION aa GROUP BY aa.application_status ORDER BY count_applications DESC;`,
          rows: db.prepare(`SELECT aa.application_status, COUNT(aa.application_id) AS count_applications, ROUND(COUNT(aa.application_id) * 100.0 / (SELECT COUNT(*) FROM ADOPTION_APPLICATION), 1) AS percentage_share FROM ADOPTION_APPLICATION aa GROUP BY aa.application_status ORDER BY count_applications DESC`).all(),
        };
      case 14:
        return {
          title: '14. Find shelters with currently available pets',
          concept: 'Subquery using EXISTS',
          sql: `SELECT s.shelter_id, s.shelter_name, s.license_no, s.city FROM SHELTER s WHERE EXISTS (SELECT 1 FROM PET p WHERE p.shelter_id = s.shelter_id AND p.status = 'Available') ORDER BY s.shelter_name;`,
          rows: db.prepare(`SELECT s.shelter_id, s.shelter_name, s.license_no, s.city FROM SHELTER s WHERE EXISTS (SELECT 1 FROM PET p WHERE p.shelter_id = s.shelter_id AND p.status = 'Available') ORDER BY s.shelter_name`).all(),
        };
      default:
        throw new Error('Invalid query ID');
    }
  },
};
