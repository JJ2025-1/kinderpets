-- ============================================================================
-- Project: Kinder Pets - Pet Adoption Management System (DBMS DA2)
-- File: 02_constraints.sql
-- Description: Indexes, referential integrity rules, and database constraints.
-- ============================================================================

-- Performance Indexes for High-Frequency Queries
-- In a Tinder-style pet adoption app, queries frequently filter on pet status,
-- species/breed, location, and adopter matches.

-- 1. Accelerate pet discovery by status, size, and gender
CREATE INDEX idx_pet_status_avail ON PET (status, breed_name, size);

-- 2. Fast shelter lookup
CREATE INDEX idx_pet_shelter ON PET (shelter_id);

-- 3. Fast primary photo retrieval for pet profile cards
CREATE INDEX idx_photo_pet_primary ON PET_PHOTO (pet_id, is_primary);

-- 4. Fast swipe lookup to check existing swipes
CREATE INDEX idx_swipe_adopter_pet ON SWIPE (adopter_id, pet_id);

-- 5. Accelerate user matches lookup
CREATE INDEX idx_match_adopter_status ON MATCH (adopter_id, status);

-- 6. Application status monitoring for shelter dashboard
CREATE INDEX idx_app_status ON ADOPTION_APPLICATION (application_status, staff_id);

-- 7. Decision audit trail index
CREATE INDEX idx_decision_pet_adopter ON SHELTER_DECISION (pet_id, adopter_id);

-- 8. Breed species search
CREATE INDEX idx_breed_species ON BREED (species);

-- 9. Adopter city index for location-based recommendations
CREATE INDEX idx_adopter_city ON ADOPTER (city);
CREATE INDEX idx_shelter_city ON SHELTER (city);

-- Verification: List all user constraints
-- SELECT table_name, constraint_name, constraint_type, status 
-- FROM user_constraints 
-- WHERE table_name IN ('SHELTER','SHELTER_STAFF','BREED','PET','PET_PHOTO','ADOPTER','ADOPTER_PREFERENCE','PREFERRED_BREED','SWIPE','MATCH','ADOPTION_APPLICATION','SHELTER_DECISION');
