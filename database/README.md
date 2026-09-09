# Kinder Pets — Oracle Database Documentation (DBMS DA2)

This directory contains the official Oracle-compatible relational database implementation for **Kinder Pets** (DBMS Digital Assignment 2).

The database implements the **12 logical entities** established in the DA1 design adhering strictly to **Third Normal Form (3NF)** and BCNF.

---

## 📁 File Manifest

| File | Purpose | Description |
|---|---|---|
| [`01_schema.sql`](file:///Users/jjeevan/kinderpets/database/01_schema.sql) | Table Definitions (DDL) | Re-runnable schema creating all 12 DA1 tables, primary keys, foreign keys, unique constraints, check constraints, identity sequences, and performance B-Tree indexes. |
| [`02_seed_data.sql`](file:///Users/jjeevan/kinderpets/database/02_seed_data.sql) | Realistic Initial Dataset | Seed data across 5 Indian Shelters (prominent Bangalore focus), 6 Staff, 10 Breeds, 16 Pets, 20 Photos, 6 Adopters, Preferences, Preferred Breeds, Swipes, Matches, Applications, and Decisions. |
| [`03_queries.sql`](file:///Users/jjeevan/kinderpets/database/03_queries.sql) | 18 Academic Demonstration Queries | Comprehensive SQL queries covering available pets, metro/area discovery, multi-table JOINs, GROUP BY, HAVING, correlated subqueries, NOT EXISTS, and summary aggregations. |
| [`04_plsql.sql`](file:///Users/jjeevan/kinderpets/database/04_plsql.sql) | PL/SQL Procedures & Functions | Business procedures (`add_pet`, `create_match`, `record_swipe`, `submit_adoption_application`, `approve_adoption`, `reject_adoption`) with strict shelter governance rules and user-defined functions. |
| [`05_test.sql`](file:///Users/jjeevan/kinderpets/database/05_test.sql) | End-to-End Test & Verification Suite | Automated test script verifying table counts, SELECT queries, full adoption lifecycle, governance security authorization failure (ORA-20020), rejection lifecycle, and final state audits. |

---

## 🏛️ DA1 Entity Mapping (12 Logical Entities)

All 12 logical tables designed in DA1 are implemented with referential integrity:

```
1.  SHELTER              (shelter_id PK, shelter_name, license_no UNIQUE, city)
2.  SHELTER_STAFF        (staff_id PK, shelter_id FK, staff_name, role)
3.  BREED                (breed_name PK, species)
4.  PET                  (pet_id PK, shelter_id FK, breed_name FK, pet_name, gender, age_months, "SIZE", behaviour_desc, lifestyle_desc, status)
5.  PET_PHOTO            (photo_id PK, pet_id FK, photo_url, is_primary)
6.  ADOPTER              (adopter_id PK, full_name, email UNIQUE, phone, city, state)
7.  ADOPTER_PREFERENCE   (adopter_id PK/FK, preferred_species, min_age_months, max_age_months, preferred_size)
8.  PREFERRED_BREED      (adopter_id PK/FK, breed_name PK/FK)
9.  SWIPE                (swipe_id PK, adopter_id FK, pet_id FK, direction, swiped_at)
10. PET_MATCH            (match_id PK, adopter_id FK, pet_id FK, matched_at, status) [Represents DA1 'MATCH' entity]
11. ADOPTION_APPLICATION (application_id PK, match_id FK UNIQUE, staff_id FK, home_visit_date, application_status, submitted_at)
12. SHELTER_DECISION     (decision_id PK, pet_id FK, adopter_id FK, decision, staff_id FK, decided_at)
```

> [!NOTE]
> **DA1 `MATCH` Entity Mapping (`PET_MATCH`)**:  
> In Oracle SQL, `MATCH` is a reserved keyword (used in SQL pattern matching like `MATCH_RECOGNIZE`). To comply with Oracle standards and prevent SQL syntax errors, the physical table is named `PET_MATCH`. It directly represents the DA1 `MATCH` logical entity with identical attributes and relationships.
>
> Similarly, `SIZE` is an Oracle reserved word; the attribute `size` in `PET` is implemented as `"SIZE"` to preserve the exact DA1 design specification.

---

## 🐳 Oracle Database Docker Setup

The project connects to an Oracle AI Database Free / 23ai instance running inside Docker.

### Container Specifications
- **Container Name**: `oracle-free`
- **Docker Image**: `ghcr.io/gvenzl/oracle-free:23-slim-faststart`
- **Host Port**: `1521` (mapped to container port `1521`)
- **Pluggable Database Service (PDB)**: `FREEPDB1`
- **Database Schema / Username**: `KINDERPETS`

### Starting the Oracle Docker Container (if not already running)
```bash
docker run -d \
  --name oracle-free \
  -p 1521:1521 \
  -e ORACLE_PASSWORD=<YOUR_SYS_PASSWORD> \
  -e APP_USER=KINDERPETS \
  -e APP_USER_PASSWORD=<YOUR_APP_PASSWORD> \
  ghcr.io/gvenzl/oracle-free:23-slim-faststart
```

---

## 🔐 Secure Connection Details (Without Hardcoding Passwords)

To follow security best practices and avoid exposing credentials in Git history, export your database credentials as environment variables in your terminal session before running scripts:

```bash
# Export connection variables into your local environment
export ORACLE_USER="KINDERPETS"
export ORACLE_SERVICE="FREEPDB1"
export ORACLE_CONTAINER="oracle-free"

# Set your password securely via prompt (does not appear in terminal history):
read -s -p "Enter Oracle Password: " ORACLE_PWD
echo ""
```

---

## 🚀 Execution Instructions for Docker

Execute the SQL files sequentially against the running `oracle-free` container using `docker exec`:

### Step 1: Initialize Database Schema (DDL)
Drops any existing tables in proper foreign-key dependency order and creates all 12 tables, constraints, and indexes:
```bash
docker exec -i $ORACLE_CONTAINER sqlplus -s "$ORACLE_USER/$ORACLE_PWD@$ORACLE_SERVICE" < database/01_schema.sql
```

### Step 2: Load Realistic Seed Dataset
Populates shelters, staff, breeds, pets, photos, adopters, swipes, matches, applications, and decisions:
```bash
docker exec -i $ORACLE_CONTAINER sqlplus -s "$ORACLE_USER/$ORACLE_PWD@$ORACLE_SERVICE" < database/02_seed_data.sql
```

### Step 3: Run Academic Demonstration Queries
Executes all 18 SQL queries demonstrating multi-table JOINs, GROUP BY, HAVING, subqueries, and operational metrics:
```bash
docker exec -i $ORACLE_CONTAINER sqlplus -s "$ORACLE_USER/$ORACLE_PWD@$ORACLE_SERVICE" < database/03_queries.sql
```

### Step 4: Compile PL/SQL Procedures and Functions
Compiles stored procedures (`add_pet`, `create_match`, `record_swipe`, `submit_adoption_application`, `approve_adoption`, `reject_adoption`) and user-defined functions:
```bash
docker exec -i $ORACLE_CONTAINER sqlplus -s "$ORACLE_USER/$ORACLE_PWD@$ORACLE_SERVICE" < database/04_plsql.sql
```

### Step 5: Execute End-to-End Test Suite
Runs the comprehensive test script verifying lifecycle workflows, governance rules, and table counts:
```bash
docker exec -i $ORACLE_CONTAINER sqlplus -s "$ORACLE_USER/$ORACLE_PWD@$ORACLE_SERVICE" < database/05_test.sql
```

### ⚡ One-Line Execution (All Scripts Sequentially)
To run all 5 scripts in a single command:
```bash
for file in database/01_schema.sql database/02_seed_data.sql database/03_queries.sql database/04_plsql.sql database/05_test.sql; do
  echo ">>> Executing $file ..."
  docker exec -i $ORACLE_CONTAINER sqlplus -s "$ORACLE_USER/$ORACLE_PWD@$ORACLE_SERVICE" < "$file"
done
```

---

## 🛡️ Shelter Governance Authorization Rule

A critical business rule enforced in `approve_adoption` and `reject_adoption` procedures:

> **Governance Rule**:  
> A shelter staff member **MUST ONLY** be permitted to approve or reject an adoption application for an animal housed in that staff member's own shelter.

### Enforcement Mechanism:
```sql
-- Procedure validates that the deciding staff belongs to the pet's shelter:
IF v_staff_shelter_id != v_pet_shelter_id THEN
    RAISE_APPLICATION_ERROR(-20020, 
        'Governance Authorization Error: Staff member "' || v_staff_name || 
        '" (Staff ID ' || p_staff_id || ', Shelter ' || v_staff_shelter_id || 
        ') is not authorized to approve applications for Pet "' || v_pet_name || 
        '" belonging to Shelter ' || v_pet_shelter_id || '.');
END IF;
```

This governance rule is automatically verified in `05_test.sql` (Step 4), confirming that an unauthorized staff member from Shelter 2 attempting to approve a Shelter 1 pet is rejected with error code **`ORA-20020`**.

---

## 📊 Summary of Queries (`03_queries.sql`)

1. **Available Pets**: Filters pets with `status = 'Available'`.
2. **Pets by City**: 2-table `INNER JOIN` between `PET` and `SHELTER` for Bangalore.
3. **Pets by Species**: `INNER JOIN` with `BREED` filtering by `species = 'Dog'`.
4. **Pets by Breed**: 3-table join on `Labrador Retriever`.
5. **Nearby Pet Discovery**: Matches adopter city with shelter city for localized discovery.
6. **Adopter Preferences**: 1:1 join displaying age range, species, and size preferences.
7. **Preferred Breeds**: M:N bridge query showing favorite breeds per user.
8. **Swipe History**: 4-table audit log of swipe interactions.
9. **Right Swipes**: Pipeline of interested adopters.
10. **Matches**: Listing of all active/closed matches in `PET_MATCH`.
11. **Enriched Match Details**: 4-table join (`PET_MATCH`, `ADOPTER`, `PET`, `SHELTER`).
12. **Adoption Applications**: 5-table join displaying formal home visit pipeline.
13. **Applications Under Review**: Filters pending caseworker workloads.
14. **Finalized Decisions**: Audit log of approvals and rejections with deciding officer.
15. **Inventory Aggregation (GROUP BY & HAVING)**: Shelters with $\ge 2$ available pets.
16. **Set Exclusion (Correlated Subquery / NOT EXISTS)**: Registered adopters without applications.
17. **Complex Multi-Criteria Matching**: Finds pets satisfying species, age bounds, size, and preferred breeds.
18. **Operational Dashboard**: System-wide summary metrics calculated using single-pass aggregations.
