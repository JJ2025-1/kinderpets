# Kinder Pets - DA2 Academic Project Report & Viva Notes

**Course**: Database Management Systems (DBMS)  
**Deliverable**: Digital Assignment 2 (DA2) — Implementation & Demonstration  
**Project Name**: Kinder Pets (Tinder-Style Pet Adoption Management System)  

---

## 1. Project Overview & Problem Statement

Animal shelters often struggle with low public engagement and fragmented adoption processes. Potential adopters find traditional shelter registries static, tedious, and difficult to navigate. 

**Kinder Pets** modernizes this workflow by introducing an interactive discovery system ("Tinder-style" card interface):
- Adopters browse pets near their city.
- Adopters swipe right (interested) or left (skip).
- Mutual suitability generates a `MATCH`.
- Matched adopters submit an `ADOPTION_APPLICATION` with preferred home visit dates.
- Shelter staff review background data and record a formal `SHELTER_DECISION` ('Approved' or 'Rejected').

---

## 2. Relational Schema & Normalization Analysis

All 12 tables adhere strictly to **3NF (Third Normal Form)** and BCNF:

1. **SHELTER** (`shelter_id` PK, `shelter_name`, `license_no`, `city`)
   - Candidate Key: `license_no`, `shelter_id`
   - Normal Form: 3NF (No transitive dependencies).

2. **SHELTER_STAFF** (`staff_id` PK, `shelter_id` FK, `staff_name`, `role`)
   - Represents employee relationship to shelter.

3. **BREED** (`breed_name` PK, `species`)
   - Normalizes species taxonomy away from individual pet records to avoid redundancy.

4. **PET** (`pet_id` PK, `shelter_id` FK, `breed_name` FK, `pet_name`, `gender`, `age_months`, `size`, `behaviour_desc`, `lifestyle_desc`, `status`)
   - Central table. `status` ∈ {'Available', 'Pending', 'Adopted', 'Fostered'}.

5. **PET_PHOTO** (`photo_id` PK, `pet_id` FK, `photo_url`, `is_primary`)
   - 1-to-Many relationship allowing rich multi-angle galleries per pet.

6. **ADOPTER** (`adopter_id` PK, `full_name`, `email`, `phone`, `city`, `state`)
   - Candidate Key: `email`, `adopter_id`.

7. **ADOPTER_PREFERENCE** (`adopter_id` PK/FK, `preferred_species`, `min_age_months`, `max_age_months`, `preferred_size`)
   - 1-to-1 extension table preventing nullable clutter in the core `ADOPTER` table.

8. **PREFERRED_BREED** (`adopter_id` PK/FK, `breed_name` PK/FK)
   - Resolves the M:N relationship between Adopters and their favorite Breeds.

9. **SWIPE** (`swipe_id` PK, `adopter_id` FK, `pet_id` FK, `direction`, `swiped_at`)
   - Unique constraint on (`adopter_id`, `pet_id`) prevents duplicate votes.

10. **MATCH** (`match_id` PK, `adopter_id` FK, `pet_id` FK, `matched_at`, `status`)
    - Created upon interest expression. `status` ∈ {'Active', 'Applied', 'Closed'}.

11. **ADOPTION_APPLICATION** (`application_id` PK, `match_id` FK UNIQUE, `staff_id` FK, `home_visit_date`, `application_status`, `submitted_at`)
    - Captures formal review workflow. `application_status` ∈ {'Pending', 'Under Review', 'Approved', 'Rejected'}.

12. **SHELTER_DECISION** (`decision_id` PK, `pet_id` FK, `adopter_id` FK, `decision`, `staff_id` FK, `decided_at`)
    - Audit log recording the verdict and the specific staff member responsible.

---

## 3. Key PL/SQL Objects & DBMS Mechanisms

### Stored Procedures
1. `add_pet`: Enforces referential integrity checks before pet profile insertion.
2. `record_swipe`: Upserts user swipes and evaluates deterministic matching logic.
3. `submit_adoption_application`: Atomically links a match to an application and shifts status to 'Pending'.
4. `approve_adoption`: Executes a multi-table transaction:
   - Records approval in `SHELTER_DECISION`
   - Sets application to 'Approved'
   - Sets pet status to 'Adopted'
   - Closes remaining active matches for that pet.
5. `reject_adoption`: Records rejection in `SHELTER_DECISION`, updates application to 'Rejected', and reverts pet status to 'Available'.

### Functions
1. `get_available_pet_count(shelter_id)`: Aggregates real-time inventory counts.
2. `get_adopter_match_count(adopter_id)`: Quick count of open matches for a user profile.
3. `is_pet_suitable_for_adopter(adopter_id, pet_id)`: Evaluates species, size, and age bounds against registered preferences.

### Triggers
1. `trg_prevent_invalid_pet_status`: Rejects illegal status jumps (e.g. from 'Adopted' to 'Available').
2. `trg_decision_update_pet_status`: Automates cascade from `SHELTER_DECISION` to `PET` table.
3. `trg_prevent_duplicate_application`: Rejects duplicate active submissions.
4. `trg_single_primary_photo`: Maintains invariant that only one photo can be primary (`is_primary = 1`).

---

## 4. Viva / Demonstration Questions & Answers

**Q1: Why is PREFERRED_BREED a separate table from ADOPTER_PREFERENCE?**  
*Answer*: Because an adopter can prefer multiple breeds (e.g., both Labradors and Golden Retrievers). Storing multiple breeds in a single column would violate First Normal Form (1NF) regarding atomicity. Creating a composite bridge table (`adopter_id`, `breed_name`) normalizes this M:N relationship.

**Q2: How does the application maintain transaction safety during adoption approval?**  
*Answer*: During approval, multiple dependent tables (`SHELTER_DECISION`, `ADOPTION_APPLICATION`, `PET`, `MATCH`) must be modified synchronously. If any operation fails, the transaction is rolled back completely to prevent inconsistent states like a pet marked 'Adopted' without a corresponding decision record.

**Q3: How does the matching rule work?**  
*Answer*: When an adopter swipes 'RIGHT' on an Available pet, the system verifies availability and checks whether an active match already exists. If not, a new `MATCH` record is created with status 'Active'.
