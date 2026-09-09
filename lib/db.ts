// ============================================================================
// Project: Kinder Pets - Oracle Database Service Adapter (DBMS DA2)
// Description: Maps Next.js application backend directly to the Oracle schema.
// Target RDBMS: Oracle Database 19c / 21c / 23ai Free via oracledb (Thin Mode)
// 
// Physical Table Mapping:
//   - shelter              -> SHELTER
//   - shelter_staff        -> SHELTER_STAFF
//   - breed                -> BREED
//   - pet                  -> PET (column "SIZE")
//   - pet_photo            -> PET_PHOTO
//   - adopter              -> ADOPTER
//   - adopter_preference   -> ADOPTER_PREFERENCE
//   - preferred_breed      -> PREFERRED_BREED
//   - swipe                -> SWIPE
//   - match                -> PET_MATCH (DA1 MATCH entity)
//   - adoption_application -> ADOPTION_APPLICATION
//   - shelter_decision     -> SHELTER_DECISION
//
// Stored Procedures invoked:
//   - record_swipe
//   - create_match
//   - submit_adoption_application
//   - approve_adoption (with shelter governance enforcement)
//   - reject_adoption (with shelter governance enforcement)
//   - add_pet
// ============================================================================

import fs from 'node:fs';
import path from 'node:path';
import oracledb from 'oracledb';
import { withConnection, toLowerKeys } from './oracle';
import type {
  Shelter,
  ShelterStaff,
  Breed,
  Pet,
  PetPhoto,
  Adopter,
  AdopterPreference,
  Match,
  AdoptionApplication,
  EnrichedPet,
  EnrichedMatch,
  EnrichedApplication,
} from './types';

// Distance approximation matrix between Indian metro locations
const CITY_DISTANCES: Record<string, Record<string, number>> = {
  Bangalore: { Bangalore: 5, Mumbai: 980, Chennai: 350, Delhi: 2150, Pune: 840 },
  Mumbai: { Bangalore: 980, Mumbai: 5, Chennai: 1330, Delhi: 1420, Pune: 150 },
  Chennai: { Bangalore: 350, Mumbai: 1330, Chennai: 5, Delhi: 2200, Pune: 1190 },
  Delhi: { Bangalore: 2150, Mumbai: 1420, Chennai: 2200, Delhi: 5, Pune: 1430 },
  Pune: { Bangalore: 840, Mumbai: 150, Chennai: 1190, Delhi: 1430, Pune: 5 },
};

function getDistance(city1?: string, city2?: string): number {
  if (!city1 || !city2) return 50;
  if (CITY_DISTANCES[city1] && CITY_DISTANCES[city1][city2]) {
    return CITY_DISTANCES[city1][city2];
  }
  if (CITY_DISTANCES[city2] && CITY_DISTANCES[city2][city1]) {
    return CITY_DISTANCES[city2][city1];
  }
  return 450;
}

/**
 * Quote-aware SQL statement splitter to safely execute seed scripts containing
 * semicolons within text literals without syntax truncation.
 */
function splitSqlStatements(sql: string): string[] {
  const statements: string[] = [];
  let current = '';
  let inString = false;
  let inComment = false;

  for (let i = 0; i < sql.length; i++) {
    const char = sql[i];
    const nextChar = sql[i + 1];

    if (!inString && char === '-' && nextChar === '-') {
      inComment = true;
      i++;
      continue;
    }

    if (inComment) {
      if (char === '\n') inComment = false;
      continue;
    }

    if (char === "'") {
      if (inString && nextChar === "'") {
        current += "''";
        i++;
        continue;
      }
      inString = !inString;
      current += char;
      continue;
    }

    if (char === ';' && !inString) {
      const trimmed = current.trim();
      if (trimmed.length > 0) statements.push(trimmed);
      current = '';
      continue;
    }

    current += char;
  }

  const trimmed = current.trim();
  if (trimmed.length > 0) statements.push(trimmed);
  return statements;
}

export const dbService = {
  // ==========================================================================
  // 0. Reset Database back to clean seed data
  // ==========================================================================
  async resetDatabase(): Promise<void> {
    await withConnection(async (conn) => {
      // Delete in reverse dependency order
      const tables = [
        'SHELTER_DECISION',
        'ADOPTION_APPLICATION',
        'PET_MATCH',
        'SWIPE',
        'PREFERRED_BREED',
        'ADOPTER_PREFERENCE',
        'PET_PHOTO',
        'PET',
        'BREED',
        'SHELTER_STAFF',
        'ADOPTER',
        'SHELTER',
      ];
      for (const t of tables) {
        await conn.execute(`DELETE FROM ${t}`);
      }

      // Read seed data from database/02_seed_data.sql
      const seedFilePath = path.join(process.cwd(), 'database', '02_seed_data.sql');
      if (fs.existsSync(seedFilePath)) {
        const content = fs.readFileSync(seedFilePath, 'utf8');
        const stmts = splitSqlStatements(content).filter((s) =>
          s.toUpperCase().startsWith('INSERT')
        );
        for (const s of stmts) {
          await conn.execute(s);
        }
      }

      await conn.commit();
    });
  },

  // ==========================================================================
  // 1. Shelters
  // ==========================================================================
  async getShelters(): Promise<Shelter[]> {
    return withConnection(async (conn) => {
      const result = await conn.execute(`SELECT * FROM SHELTER ORDER BY shelter_name ASC`);
      return toLowerKeys<Shelter[]>(result.rows || []);
    });
  },

  // ==========================================================================
  // 2. Staff
  // ==========================================================================
  async getStaff(shelterId?: number): Promise<ShelterStaff[]> {
    return withConnection(async (conn) => {
      let query = `SELECT * FROM SHELTER_STAFF`;
      const binds: any = {};
      if (shelterId) {
        query += ` WHERE shelter_id = :shelterId`;
        binds.shelterId = shelterId;
      }
      query += ` ORDER BY staff_name ASC`;
      const result = await conn.execute(query, binds);
      return toLowerKeys<ShelterStaff[]>(result.rows || []);
    });
  },

  // ==========================================================================
  // 3. Breeds
  // ==========================================================================
  async getBreeds(): Promise<Breed[]> {
    return withConnection(async (conn) => {
      const result = await conn.execute(`SELECT * FROM BREED ORDER BY breed_name ASC`);
      return toLowerKeys<Breed[]>(result.rows || []);
    });
  },

  // ==========================================================================
  // 4. Adopters
  // ==========================================================================
  async getAdopters(): Promise<Adopter[]> {
    return withConnection(async (conn) => {
      const result = await conn.execute(`SELECT * FROM ADOPTER ORDER BY full_name ASC`);
      return toLowerKeys<Adopter[]>(result.rows || []);
    });
  },

  async getAdopter(adopterId: number): Promise<Adopter | null> {
    return withConnection(async (conn) => {
      const result = await conn.execute(
        `SELECT * FROM ADOPTER WHERE adopter_id = :adopterId`,
        { adopterId }
      );
      if (!result.rows || result.rows.length === 0) return null;
      return toLowerKeys<Adopter>(result.rows[0]);
    });
  },

  async getAdopterPreferences(
    adopterId: number
  ): Promise<{ preference: AdopterPreference | null; preferredBreeds: string[] }> {
    return withConnection(async (conn) => {
      const prefResult = await conn.execute(
        `SELECT * FROM ADOPTER_PREFERENCE WHERE adopter_id = :adopterId`,
        { adopterId }
      );
      const breedsResult = await conn.execute(
        `SELECT breed_name FROM PREFERRED_BREED WHERE adopter_id = :adopterId`,
        { adopterId }
      );

      const pref = prefResult.rows && prefResult.rows.length > 0
        ? toLowerKeys<AdopterPreference>(prefResult.rows[0])
        : null;

      const preferredBreeds = (breedsResult.rows || []).map((row: any) => row.BREED_NAME);

      return {
        preference: pref,
        preferredBreeds,
      };
    });
  },

  async updateAdopterPreferences(
    adopterId: number,
    preferredSpecies: string | null,
    minAgeMonths: number,
    maxAgeMonths: number,
    preferredSize: string | null,
    preferredBreeds: string[]
  ): Promise<void> {
    await withConnection(async (conn) => {
      // Upsert into ADOPTER_PREFERENCE using MERGE
      await conn.execute(
        `
        MERGE INTO ADOPTER_PREFERENCE target
        USING (SELECT :adopterId AS adopter_id FROM dual) src
        ON (target.adopter_id = src.adopter_id)
        WHEN MATCHED THEN
          UPDATE SET preferred_species = :preferredSpecies,
                     min_age_months    = :minAgeMonths,
                     max_age_months    = :maxAgeMonths,
                     preferred_size    = :preferredSize
        WHEN NOT MATCHED THEN
          INSERT (adopter_id, preferred_species, min_age_months, max_age_months, preferred_size)
          VALUES (:adopterId, :preferredSpecies, :minAgeMonths, :maxAgeMonths, :preferredSize)
        `,
        {
          adopterId,
          preferredSpecies,
          minAgeMonths,
          maxAgeMonths,
          preferredSize,
        }
      );

      // Re-map preferred breeds
      await conn.execute(
        `DELETE FROM PREFERRED_BREED WHERE adopter_id = :adopterId`,
        { adopterId }
      );

      for (const breed of preferredBreeds) {
        await conn.execute(
          `INSERT INTO PREFERRED_BREED (adopter_id, breed_name) VALUES (:adopterId, :breed)`,
          { adopterId, breed }
        );
      }

      await conn.commit();
    });
  },

  // ==========================================================================
  // 5. Discover Pets (Filtered & Enriched with Photos & Distance)
  // ==========================================================================
  async getDiscoverPets(options: {
    adopterId?: number;
    species?: string;
    breed?: string;
    minAge?: number;
    maxAge?: number;
    size?: string;
    city?: string;
    maxDistanceKm?: number;
    excludeSwiped?: boolean;
  }): Promise<EnrichedPet[]> {
    return withConnection(async (conn) => {
      let query = `
        SELECT 
          p.pet_id,
          p.shelter_id,
          p.breed_name,
          p.pet_name,
          p.gender,
          p.age_months,
          p."SIZE" AS "size",
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
      const binds: any = {};

      if (options.species && options.species !== 'All') {
        query += ` AND b.species = :species`;
        binds.species = options.species;
      }

      if (options.breed && options.breed !== 'All') {
        query += ` AND p.breed_name = :breed`;
        binds.breed = options.breed;
      }

      if (options.size && options.size !== 'All') {
        query += ` AND p."SIZE" = :petSize`;
        binds.petSize = options.size;
      }

      if (options.minAge !== undefined) {
        query += ` AND p.age_months >= :minAge`;
        binds.minAge = options.minAge;
      }

      if (options.maxAge !== undefined) {
        query += ` AND p.age_months <= :maxAge`;
        binds.maxAge = options.maxAge;
      }

      if (options.excludeSwiped && options.adopterId) {
        query += ` AND p.pet_id NOT IN (SELECT pet_id FROM SWIPE WHERE adopter_id = :swipedAdopterId)`;
        binds.swipedAdopterId = options.adopterId;
      }

      query += ` ORDER BY p.pet_id ASC`;

      const petsResult = await conn.execute(query, binds);
      const rawPets = (petsResult.rows || []) as any[];

      // Determine adopter city for distance calculations
      let adopterCity = 'Bangalore';
      if (options.adopterId) {
        const adpRes = await conn.execute(
          `SELECT city FROM ADOPTER WHERE adopter_id = :adopterId`,
          { adopterId: options.adopterId }
        );
        if (adpRes.rows && adpRes.rows.length > 0) {
          adopterCity = (adpRes.rows[0] as any).CITY || 'Bangalore';
        }
      } else if (options.city) {
        adopterCity = options.city;
      }

      // Fetch all photos for these pets
      const photoResult = await conn.execute(
        `SELECT * FROM PET_PHOTO ORDER BY is_primary DESC, photo_id ASC`
      );
      const allPhotos = toLowerKeys<PetPhoto[]>(photoResult.rows || []);

      const enriched: EnrichedPet[] = rawPets.map((p) => {
        const petData = toLowerKeys<Pet & { species: string; shelter_name: string; shelter_city: string }>(p);
        const photos = allPhotos.filter((ph) => ph.pet_id === petData.pet_id);
        const primary = photos.find((ph) => ph.is_primary === 1) || photos[0];
        const dist = getDistance(adopterCity, petData.shelter_city);

        return {
          ...petData,
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
    });
  },

  // ==========================================================================
  // 6. Get Single Pet
  // ==========================================================================
  async getPet(petId: number): Promise<EnrichedPet | null> {
    return withConnection(async (conn) => {
      const result = await conn.execute(
        `
        SELECT 
          p.pet_id,
          p.shelter_id,
          p.breed_name,
          p.pet_name,
          p.gender,
          p.age_months,
          p."SIZE" AS "size",
          p.behaviour_desc,
          p.lifestyle_desc,
          p.status,
          b.species,
          s.shelter_name,
          s.city AS shelter_city
        FROM PET p
        INNER JOIN BREED b ON p.breed_name = b.breed_name
        INNER JOIN SHELTER s ON p.shelter_id = s.shelter_id
        WHERE p.pet_id = :petId
        `,
        { petId }
      );

      if (!result.rows || result.rows.length === 0) return null;
      const pet = toLowerKeys<Pet & { species: string; shelter_name: string; shelter_city: string }>(result.rows[0]);

      const photoRes = await conn.execute(
        `SELECT * FROM PET_PHOTO WHERE pet_id = :petId ORDER BY is_primary DESC, photo_id ASC`,
        { petId }
      );
      const photos = toLowerKeys<PetPhoto[]>(photoRes.rows || []);
      const primary = photos.find((ph) => ph.is_primary === 1) || photos[0];

      return {
        ...pet,
        photos,
        primary_photo:
          primary?.photo_url ||
          'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=800&q=80',
        approx_distance_km: 5,
      };
    });
  },

  // ==========================================================================
  // 7. Add Pet (Calls PL/SQL add_pet procedure)
  // ==========================================================================
  async addPet(petData: {
    shelter_id: number;
    breed_name: string;
    pet_name: string;
    gender: string;
    age_months: number;
    size: string;
    behaviour_desc: string;
    lifestyle_desc: string;
    photo_urls?: string[];
  }): Promise<number> {
    return withConnection(async (conn) => {
      const bindVars = {
        shelterId: petData.shelter_id,
        breedName: petData.breed_name,
        petName: petData.pet_name,
        gender: petData.gender,
        ageMonths: petData.age_months,
        petSize: petData.size,
        behaviourDesc: petData.behaviour_desc,
        lifestyleDesc: petData.lifestyle_desc,
        petId: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER },
      };

      const result = await conn.execute(
        `BEGIN add_pet(:shelterId, :breedName, :petName, :gender, :ageMonths, :petSize, :behaviourDesc, :lifestyleDesc, :petId); END;`,
        bindVars,
        { autoCommit: true }
      );

      const petId = (result.outBinds as any).petId;

      // Insert photos into PET_PHOTO
      if (petData.photo_urls && petData.photo_urls.length > 0) {
        for (let i = 0; i < petData.photo_urls.length; i++) {
          await conn.execute(
            `INSERT INTO PET_PHOTO (pet_id, photo_url, is_primary) VALUES (:petId, :photoUrl, :isPrimary)`,
            {
              petId,
              photoUrl: petData.photo_urls[i],
              isPrimary: i === 0 ? 1 : 0,
            }
          );
        }
      } else {
        await conn.execute(
          `INSERT INTO PET_PHOTO (pet_id, photo_url, is_primary) VALUES (:petId, :photoUrl, 1)`,
          {
            petId,
            photoUrl:
              'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=800&q=80',
          }
        );
      }

      await conn.commit();
      return petId;
    });
  },

  // ==========================================================================
  // 8. Update Pet Status
  // ==========================================================================
  async updatePetStatus(petId: number, status: string): Promise<void> {
    await withConnection(async (conn) => {
      await conn.execute(
        `UPDATE PET SET status = :status WHERE pet_id = :petId`,
        { status, petId },
        { autoCommit: true }
      );
    });
  },

  // ==========================================================================
  // 9. Record Swipe (Calls PL/SQL record_swipe procedure)
  // ==========================================================================
  async recordSwipe(
    adopterId: number,
    petId: number,
    direction: 'LEFT' | 'RIGHT'
  ): Promise<{ isMatch: boolean; matchId?: number }> {
    return withConnection(async (conn) => {
      const bindVars = {
        adopterId,
        petId,
        direction,
        isMatch: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER },
        matchId: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER },
      };

      const result = await conn.execute(
        `BEGIN record_swipe(:adopterId, :petId, :direction, :isMatch, :matchId); END;`,
        bindVars,
        { autoCommit: true }
      );

      const isMatch = (result.outBinds as any).isMatch === 1;
      const matchId = (result.outBinds as any).matchId || undefined;

      return { isMatch, matchId };
    });
  },

  // ==========================================================================
  // 10. Get Matches for Adopter
  // ==========================================================================
  async getAdopterMatches(adopterId: number): Promise<EnrichedMatch[]> {
    return withConnection(async (conn) => {
      const result = await conn.execute(
        `
        SELECT 
          m.match_id,
          m.adopter_id,
          m.pet_id,
          TO_CHAR(m.matched_at, 'YYYY-MM-DD"T"HH24:MI:SS') AS matched_at,
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
        WHERE m.adopter_id = :adopterId
        ORDER BY m.matched_at DESC
        `,
        { adopterId }
      );

      const rows = (result.rows || []) as any[];

      const matches: EnrichedMatch[] = [];
      for (const r of rows) {
        const pet = await this.getPet(r.PET_ID);
        if (pet) {
          matches.push({
            match_id: r.MATCH_ID,
            adopter_id: r.ADOPTER_ID,
            pet_id: r.PET_ID,
            matched_at: r.MATCHED_AT,
            status: r.STATUS,
            pet,
            adopter: {
              adopter_id: r.ADOPTER_ID,
              full_name: r.ADOPTER_NAME,
              email: r.ADOPTER_EMAIL,
              phone: r.ADOPTER_PHONE,
              city: r.ADOPTER_CITY,
              state: r.ADOPTER_STATE,
            },
            has_application: !!r.APPLICATION_ID,
            application_id: r.APPLICATION_ID || undefined,
            application_status: r.APPLICATION_STATUS as any,
          });
        }
      }

      return matches;
    });
  },

  // ==========================================================================
  // 11. Submit Adoption Application (Calls PL/SQL submit_adoption_application)
  // ==========================================================================
  async submitAdoptionApplication(matchId: number, homeVisitDate: string): Promise<number> {
    return withConnection(async (conn) => {
      const bindVars = {
        matchId,
        homeVisitDate,
        appId: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER },
      };

      const result = await conn.execute(
        `BEGIN submit_adoption_application(:matchId, TO_DATE(:homeVisitDate, 'YYYY-MM-DD'), :appId); END;`,
        bindVars,
        { autoCommit: true }
      );

      return (result.outBinds as any).appId;
    });
  },

  // ==========================================================================
  // 12. Get Applications for Shelter Dashboard
  // ==========================================================================
  async getApplications(shelterId?: number): Promise<EnrichedApplication[]> {
    return withConnection(async (conn) => {
      let query = `
        SELECT 
          aa.application_id,
          aa.match_id,
          aa.staff_id,
          TO_CHAR(aa.home_visit_date, 'YYYY-MM-DD') AS home_visit_date,
          aa.application_status,
          TO_CHAR(aa.submitted_at, 'YYYY-MM-DD"T"HH24:MI:SS') AS submitted_at,
          m.adopter_id,
          m.pet_id,
          TO_CHAR(m.matched_at, 'YYYY-MM-DD"T"HH24:MI:SS') AS matched_at,
          m.status AS match_status,
          st.staff_name,
          st.role AS staff_role,
          p.shelter_id
        FROM ADOPTION_APPLICATION aa
        INNER JOIN PET_MATCH m ON aa.match_id = m.match_id
        INNER JOIN PET p ON m.pet_id = p.pet_id
        LEFT JOIN SHELTER_STAFF st ON aa.staff_id = st.staff_id
      `;
      const binds: any = {};
      if (shelterId) {
        query += ` WHERE p.shelter_id = :shelterId`;
        binds.shelterId = shelterId;
      }
      query += ` ORDER BY aa.submitted_at DESC`;

      const result = await conn.execute(query, binds);
      const rows = (result.rows || []) as any[];

      const applications: EnrichedApplication[] = [];
      for (const r of rows) {
        const pet = await this.getPet(r.PET_ID);
        const adopter = await this.getAdopter(r.ADOPTER_ID);
        if (pet && adopter) {
          applications.push({
            application_id: r.APPLICATION_ID,
            match_id: r.MATCH_ID,
            staff_id: r.STAFF_ID,
            home_visit_date: r.HOME_VISIT_DATE,
            application_status: r.APPLICATION_STATUS,
            submitted_at: r.SUBMITTED_AT,
            match: {
              match_id: r.MATCH_ID,
              adopter_id: r.ADOPTER_ID,
              pet_id: r.PET_ID,
              matched_at: r.MATCHED_AT,
              status: r.MATCH_STATUS as any,
            },
            pet,
            adopter,
            staff: r.STAFF_ID && r.STAFF_NAME ? {
              staff_id: r.STAFF_ID,
              shelter_id: pet.shelter_id,
              staff_name: r.STAFF_NAME,
              role: r.STAFF_ROLE || '',
            } : undefined,
          });
        }
      }

      return applications;
    });
  },

  // ==========================================================================
  // 13. Approve Adoption (Calls PL/SQL approve_adoption)
  // ==========================================================================
  async approveAdoption(applicationId: number, staffId: number): Promise<number> {
    return withConnection(async (conn) => {
      const bindVars = {
        applicationId,
        staffId,
        decisionId: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER },
      };

      const result = await conn.execute(
        `BEGIN approve_adoption(:applicationId, :staffId, :decisionId); END;`,
        bindVars,
        { autoCommit: true }
      );

      return (result.outBinds as any).decisionId;
    });
  },

  // ==========================================================================
  // 14. Reject Adoption (Calls PL/SQL reject_adoption)
  // ==========================================================================
  async rejectAdoption(applicationId: number, staffId: number): Promise<number> {
    return withConnection(async (conn) => {
      const bindVars = {
        applicationId,
        staffId,
        decisionId: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER },
      };

      const result = await conn.execute(
        `BEGIN reject_adoption(:applicationId, :staffId, :decisionId); END;`,
        bindVars,
        { autoCommit: true }
      );

      return (result.outBinds as any).decisionId;
    });
  },

  // ==========================================================================
  // 15. All Pets for Shelter Inventory
  // ==========================================================================
  async getAllPetsForShelter(shelterId?: number): Promise<EnrichedPet[]> {
    return withConnection(async (conn) => {
      let query = `
        SELECT 
          p.pet_id,
          p.shelter_id,
          p.breed_name,
          p.pet_name,
          p.gender,
          p.age_months,
          p."SIZE" AS "size",
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
      const binds: any = {};
      if (shelterId) {
        query += ` WHERE p.shelter_id = :shelterId`;
        binds.shelterId = shelterId;
      }
      query += ` ORDER BY p.pet_id DESC`;

      const result = await conn.execute(query, binds);
      const rawPets = (result.rows || []) as any[];

      const photoRes = await conn.execute(
        `SELECT * FROM PET_PHOTO ORDER BY is_primary DESC, photo_id ASC`
      );
      const allPhotos = toLowerKeys<PetPhoto[]>(photoRes.rows || []);

      return rawPets.map((p) => {
        const petData = toLowerKeys<Pet & { species: string; shelter_name: string; shelter_city: string }>(p);
        const photos = allPhotos.filter((ph) => ph.pet_id === petData.pet_id);
        const primary = photos.find((ph) => ph.is_primary === 1) || photos[0];

        return {
          ...petData,
          photos,
          primary_photo:
            primary?.photo_url ||
            'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=800&q=80',
          approx_distance_km: 5,
        };
      });
    });
  },

  // ==========================================================================
  // 16. Academic Queries Runner (Live execution on Oracle Database)
  // ==========================================================================
  async runAcademicQuery(
    queryId: number
  ): Promise<{ title: string; sql: string; concept: string; rows: any[] }> {
    return withConnection(async (conn) => {
      let title = '';
      let concept = '';
      let sql = '';

      switch (queryId) {
        case 1:
          title = '1. List all available pets';
          concept = 'Basic SELECT with WHERE condition and ORDER BY';
          sql = `SELECT pet_id, pet_name, gender, age_months, "SIZE" AS pet_size, status FROM PET WHERE status = 'Available' ORDER BY pet_name ASC`;
          break;
        case 2:
          title = '2. Available pets with breed and shelter information';
          concept = '3-Table INNER JOIN navigating relationships';
          sql = `SELECT p.pet_id, p.pet_name, b.species, p.breed_name, p.gender, p.age_months, p."SIZE" AS pet_size, s.shelter_name, s.city AS shelter_city, p.status FROM PET p INNER JOIN BREED b ON p.breed_name = b.breed_name INNER JOIN SHELTER s ON p.shelter_id = s.shelter_id WHERE p.status = 'Available' ORDER BY s.city, p.pet_name`;
          break;
        case 3:
          title = '3. Find pets by species (Dog)';
          concept = 'INNER JOIN with predicate filtering on master taxonomy';
          sql = `SELECT p.pet_id, p.pet_name, b.species, p.breed_name, p.gender, p.age_months, p.status FROM PET p JOIN BREED b ON p.breed_name = b.breed_name WHERE b.species = 'Dog' AND p.status = 'Available' ORDER BY p.age_months ASC`;
          break;
        case 4:
          title = '4. Find pets by breed (Labrador Retriever)';
          concept = 'Foreign Key matching with Shelter join';
          sql = `SELECT p.pet_id, p.pet_name, p.breed_name, p.gender, p.age_months, p."SIZE" AS pet_size, s.shelter_name, s.city FROM PET p JOIN SHELTER s ON p.shelter_id = s.shelter_id WHERE p.breed_name = 'Labrador Retriever' AND p.status = 'Available'`;
          break;
        case 5:
          title = '5. Pets matching adopter preferences (Adopter 1 - Rahul)';
          concept = 'Multi-table JOIN with age range BETWEEN and subquery evaluation';
          sql = `SELECT p.pet_id, p.pet_name, b.species, p.breed_name, p.age_months, p."SIZE" AS pet_size, p.status, a.full_name AS adopter_name FROM PET p JOIN BREED b ON p.breed_name = b.breed_name JOIN ADOPTER_PREFERENCE ap ON ap.adopter_id = 1 JOIN ADOPTER a ON a.adopter_id = ap.adopter_id WHERE p.status = 'Available' AND (ap.preferred_species IS NULL OR b.species = ap.preferred_species) AND (p.age_months BETWEEN ap.min_age_months AND ap.max_age_months) AND (ap.preferred_size IS NULL OR p."SIZE" = ap.preferred_size)`;
          break;
        case 6:
          title = "6. List an adopter's swipe history (Adopter 1)";
          concept = 'INNER JOIN with timestamp ordering';
          sql = `SELECT s.swipe_id, a.full_name AS adopter_name, p.pet_name, p.breed_name, s.direction AS swipe_action, TO_CHAR(s.swiped_at, 'YYYY-MM-DD HH24:MI:SS') AS swiped_at FROM SWIPE s JOIN ADOPTER a ON s.adopter_id = a.adopter_id JOIN PET p ON s.pet_id = p.pet_id WHERE s.adopter_id = 1 ORDER BY s.swiped_at DESC`;
          break;
        case 7:
          title = '7. List matches for an adopter (Adopter 1)';
          concept = 'Multi-table join displaying mutual interest and shelter contact info';
          sql = `SELECT m.match_id, a.full_name AS adopter_name, p.pet_id, p.pet_name, p.breed_name, sh.shelter_name, sh.city AS shelter_city, TO_CHAR(m.matched_at, 'YYYY-MM-DD HH24:MI:SS') AS matched_at, m.status AS match_status FROM PET_MATCH m JOIN ADOPTER a ON m.adopter_id = a.adopter_id JOIN PET p ON m.pet_id = p.pet_id JOIN SHELTER sh ON p.shelter_id = sh.shelter_id WHERE m.adopter_id = 1 ORDER BY m.matched_at DESC`;
          break;
        case 8:
          title = '8. List pending adoption applications';
          concept = 'Multi-table JOIN linking application, match, applicant, and pet';
          sql = `SELECT aa.application_id, TO_CHAR(aa.submitted_at, 'YYYY-MM-DD HH24:MI') AS submitted_at, TO_CHAR(aa.home_visit_date, 'YYYY-MM-DD') AS home_visit_date, aa.application_status, a.full_name AS applicant_name, a.phone AS contact_phone, p.pet_name, p.breed_name, s.shelter_name FROM ADOPTION_APPLICATION aa JOIN PET_MATCH m ON aa.match_id = m.match_id JOIN ADOPTER a ON m.adopter_id = a.adopter_id JOIN PET p ON m.pet_id = p.pet_id JOIN SHELTER s ON p.shelter_id = s.shelter_id WHERE aa.application_status = 'Pending' ORDER BY aa.submitted_at ASC`;
          break;
        case 9:
          title = '9. List applications handled by shelter staff';
          concept = 'LEFT OUTER JOIN with SHELTER_STAFF displaying caseworker assignment';
          sql = `SELECT aa.application_id, p.pet_name, a.full_name AS adopter_name, NVL(st.staff_name, 'Unassigned') AS reviewer_name, st.role AS staff_role, TO_CHAR(aa.home_visit_date, 'YYYY-MM-DD') AS home_visit_date, aa.application_status FROM ADOPTION_APPLICATION aa JOIN PET_MATCH m ON aa.match_id = m.match_id JOIN ADOPTER a ON m.adopter_id = a.adopter_id JOIN PET p ON m.pet_id = p.pet_id LEFT JOIN SHELTER_STAFF st ON aa.staff_id = st.staff_id ORDER BY aa.application_id ASC`;
          break;
        case 10:
          title = '10. List all adopted pets and their adopters';
          concept = '4-Table JOIN navigating historical decisions';
          sql = `SELECT p.pet_id, p.pet_name, p.breed_name, a.full_name AS adopter_name, a.city AS adopter_city, st.staff_name AS approved_by, TO_CHAR(sd.decided_at, 'YYYY-MM-DD HH24:MI:SS') AS decided_at FROM SHELTER_DECISION sd JOIN PET p ON sd.pet_id = p.pet_id JOIN ADOPTER a ON sd.adopter_id = a.adopter_id JOIN SHELTER_STAFF st ON sd.staff_id = st.staff_id WHERE sd.decision = 'Approved' ORDER BY sd.decided_at DESC`;
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

      const res = await conn.execute(sql);
      return {
        title,
        concept,
        sql,
        rows: toLowerKeys<any[]>(res.rows || []),
      };
    });
  },
};
