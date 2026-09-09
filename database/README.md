# Kinder Pets - Database Documentation (DA2)

This directory contains the complete Oracle-compatible relational database design, DDL scripts, constraints, sample dataset, academic queries, and PL/SQL programs (procedures, functions, triggers) for the **Kinder Pets** pet adoption platform.

---

## 📁 File Manifest

| File | Purpose | Description |
|---|---|---|
| `01_schema.sql` | Table Definitions (DDL) | Defines all 12 normalized entities with primary keys, foreign keys, and column constraints. |
| `02_constraints.sql` | Indexes & Constraints | Performance B-Tree indexes on search keys (status, breed, shelter, swipes). |
| `03_seed_data.sql` | Initial Dataset | Comprehensive dataset with 5 Shelters, 6 Staff, 10 Breeds, 16 Pets, 20 Photos, 6 Adopters, Swipes, Matches, Applications, and Decisions. |
| `04_queries.sql` | Academic SQL Queries | 14 SQL queries covering multi-table JOINs, GROUP BY, HAVING, subqueries, and EXISTS clauses. |
| `05_procedures.sql` | PL/SQL Stored Procedures | `add_pet`, `record_swipe`, `submit_adoption_application`, `approve_adoption`, `reject_adoption`. |
| `06_functions.sql` | PL/SQL Functions | `get_available_pet_count`, `get_adopter_match_count`, `is_pet_suitable_for_adopter`. |
| `07_triggers.sql` | PL/SQL Triggers | `trg_prevent_invalid_pet_status`, `trg_decision_update_pet_status`, `trg_prevent_duplicate_application`, `trg_single_primary_photo`. |

---

## 🏛️ 12 DA1 Entities & Relational Schema

```
1.  SHELTER             (shelter_id PK, shelter_name, license_no, city)
2.  SHELTER_STAFF       (staff_id PK, shelter_id FK, staff_name, role)
3.  BREED               (breed_name PK, species)
4.  PET                 (pet_id PK, shelter_id FK, breed_name FK, pet_name, gender, age_months, size, behaviour_desc, lifestyle_desc, status)
5.  PET_PHOTO           (photo_id PK, pet_id FK, photo_url, is_primary)
6.  ADOPTER             (adopter_id PK, full_name, email, phone, city, state)
7.  ADOPTER_PREFERENCE  (adopter_id PK/FK, preferred_species, min_age_months, max_age_months, preferred_size)
8.  PREFERRED_BREED     (adopter_id PK/FK, breed_name PK/FK)
9.  SWIPE               (swipe_id PK, adopter_id FK, pet_id FK, direction, swiped_at)
10. MATCH               (match_id PK, adopter_id FK, pet_id FK, matched_at, status)
11. ADOPTION_APPLICATION(application_id PK, match_id FK, staff_id FK, home_visit_date, application_status, submitted_at)
12. SHELTER_DECISION    (decision_id PK, pet_id FK, adopter_id FK, decision, staff_id FK, decided_at)
```

---

## 🚀 Execution Instructions for Oracle (SQL Developer / SQL*Plus)

To run the entire database setup in an Oracle database instance:

### Option A: Using Oracle SQL Developer
1. Connect to your Oracle database instance (e.g. `localhost:1521/XEPDB1` or Oracle Cloud Free Tier).
2. Open files in sequential order:
   - Run `01_schema.sql` (press F5 or Run Script)
   - Run `02_constraints.sql`
   - Run `03_seed_data.sql`
   - Run `04_queries.sql`
   - Run `05_procedures.sql`
   - Run `06_functions.sql`
   - Run `07_triggers.sql`
3. Verify that all 12 tables and PL/SQL objects are compiled with status `VALID`.

### Option B: Using SQL*Plus Command Line
```sql
sqlplus username/password@//localhost:1521/XEPDB1

@01_schema.sql
@02_constraints.sql
@03_seed_data.sql
@04_queries.sql
@05_procedures.sql
@06_functions.sql
@07_triggers.sql
```

---

## 💻 Local Development Mode

To allow the web application to run immediately without requiring a heavy Oracle installation on the presentation machine:
- The Next.js application includes a built-in development database engine powered by Node.js built-in SQLite (`node:sqlite`).
- It implements the **exact same 12-table relational schema** and constraints.
- In `lib/db.ts`, the database layer is organized as a clean abstraction so that an Oracle client (e.g., `oracledb`) can be connected with environment variables (`ORACLE_USER`, `ORACLE_PASSWORD`, `ORACLE_CONNECT_STRING`) when deployed to a lab Oracle server.
