-- ============================================================================
-- Project: Kinder Pets - Pet Adoption Management System (DBMS DA2)
-- File: 04_queries.sql
-- Description: Core Academic SQL Demonstration Queries.
-- Demonstrates: Joins, Aggregation, Subqueries, EXISTS, GROUP BY, HAVING, Set operations.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- Query 1: List all available pets
-- Concept: Basic SELECT with WHERE condition and ORDER BY
-- ----------------------------------------------------------------------------
SELECT 
    p.pet_id,
    p.pet_name,
    p.gender,
    p.age_months,
    p.size,
    p.status
FROM PET p
WHERE p.status = 'Available'
ORDER BY p.pet_name ASC;

-- ----------------------------------------------------------------------------
-- Query 2: List available pets with breed and shelter information
-- Concept: 3-Table INNER JOIN with detailed attributes
-- ----------------------------------------------------------------------------
SELECT 
    p.pet_id,
    p.pet_name,
    b.species,
    p.breed_name,
    p.gender,
    p.age_months,
    p.size,
    s.shelter_name,
    s.city AS shelter_city,
    p.status
FROM PET p
INNER JOIN BREED b ON p.breed_name = b.breed_name
INNER JOIN SHELTER s ON p.shelter_id = s.shelter_id
WHERE p.status = 'Available'
ORDER BY s.city, p.pet_name;

-- ----------------------------------------------------------------------------
-- Query 3: Find pets by species (e.g. 'Dog' or 'Cat')
-- Concept: INNER JOIN with parameterized/literal filtering
-- ----------------------------------------------------------------------------
SELECT 
    p.pet_id,
    p.pet_name,
    b.species,
    p.breed_name,
    p.gender,
    p.age_months,
    p.status
FROM PET p
JOIN BREED b ON p.breed_name = b.breed_name
WHERE b.species = 'Dog' AND p.status = 'Available'
ORDER BY p.age_months ASC;

-- ----------------------------------------------------------------------------
-- Query 4: Find pets by specific breed (e.g. 'Labrador Retriever')
-- Concept: Exact matching on foreign key / master reference
-- ----------------------------------------------------------------------------
SELECT 
    p.pet_id,
    p.pet_name,
    p.breed_name,
    p.gender,
    p.age_months,
    p.size,
    s.shelter_name,
    s.city
FROM PET p
JOIN SHELTER s ON p.shelter_id = s.shelter_id
WHERE p.breed_name = 'Labrador Retriever' AND p.status = 'Available';

-- ----------------------------------------------------------------------------
-- Query 5: Find pets matching an adopter's preferences (e.g. Adopter 1)
-- Concept: Multi-table JOIN with range comparisons, null-handling, and subquery
-- ----------------------------------------------------------------------------
SELECT 
    p.pet_id,
    p.pet_name,
    b.species,
    p.breed_name,
    p.age_months,
    p.size,
    p.status,
    a.full_name AS adopter_name
FROM PET p
JOIN BREED b ON p.breed_name = b.breed_name
JOIN ADOPTER_PREFERENCE ap ON ap.adopter_id = 1
JOIN ADOPTER a ON a.adopter_id = ap.adopter_id
WHERE p.status = 'Available'
  AND (ap.preferred_species IS NULL OR b.species = ap.preferred_species)
  AND (p.age_months BETWEEN ap.min_age_months AND ap.max_age_months)
  AND (ap.preferred_size IS NULL OR p.size = ap.preferred_size)
  AND (
      EXISTS (
          SELECT 1 FROM PREFERRED_BREED pb 
          WHERE pb.adopter_id = ap.adopter_id AND pb.breed_name = p.breed_name
      )
      OR NOT EXISTS (
          SELECT 1 FROM PREFERRED_BREED pb 
          WHERE pb.adopter_id = ap.adopter_id
      )
  );

-- ----------------------------------------------------------------------------
-- Query 6: List an adopter's swipe history (e.g. Adopter 1 - Rahul Sharma)
-- Concept: INNER JOIN displaying user action history with timestamps
-- ----------------------------------------------------------------------------
SELECT 
    s.swipe_id,
    a.full_name AS adopter_name,
    p.pet_name,
    p.breed_name,
    s.direction AS swipe_action,
    s.swiped_at
FROM SWIPE s
JOIN ADOPTER a ON s.adopter_id = a.adopter_id
JOIN PET p ON s.pet_id = p.pet_id
WHERE s.adopter_id = 1
ORDER BY s.swiped_at DESC;

-- ----------------------------------------------------------------------------
-- Query 7: List matches for an adopter (e.g. Adopter 1)
-- Concept: Multi-table JOIN showing mutual interest and shelter contact info
-- ----------------------------------------------------------------------------
SELECT 
    m.match_id,
    a.full_name AS adopter_name,
    p.pet_id,
    p.pet_name,
    p.breed_name,
    sh.shelter_name,
    sh.city AS shelter_city,
    m.matched_at,
    m.status AS match_status
FROM MATCH m
JOIN ADOPTER a ON m.adopter_id = a.adopter_id
JOIN PET p ON m.pet_id = p.pet_id
JOIN SHELTER sh ON p.shelter_id = sh.shelter_id
WHERE m.adopter_id = 1
ORDER BY m.matched_at DESC;

-- ----------------------------------------------------------------------------
-- Query 8: List pending adoption applications
-- Concept: Multi-table JOIN linking application, match, adopter, and pet
-- ----------------------------------------------------------------------------
SELECT 
    aa.application_id,
    aa.submitted_at,
    aa.home_visit_date,
    aa.application_status,
    a.full_name AS applicant_name,
    a.phone AS contact_phone,
    p.pet_name,
    p.breed_name,
    s.shelter_name
FROM ADOPTION_APPLICATION aa
JOIN MATCH m ON aa.match_id = m.match_id
JOIN ADOPTER a ON m.adopter_id = a.adopter_id
JOIN PET p ON m.pet_id = p.pet_id
JOIN SHELTER s ON p.shelter_id = s.shelter_id
WHERE aa.application_status = 'Pending'
ORDER BY aa.submitted_at ASC;

-- ----------------------------------------------------------------------------
-- Query 9: List applications handled by shelter staff
-- Concept: LEFT OUTER JOIN with SHELTER_STAFF to display assigned caseworkers
-- ----------------------------------------------------------------------------
SELECT 
    aa.application_id,
    p.pet_name,
    a.full_name AS adopter_name,
    COALESCE(st.staff_name, 'Unassigned') AS reviewer_name,
    st.role AS staff_role,
    aa.home_visit_date,
    aa.application_status
FROM ADOPTION_APPLICATION aa
JOIN MATCH m ON aa.match_id = m.match_id
JOIN ADOPTER a ON m.adopter_id = a.adopter_id
JOIN PET p ON m.pet_id = p.pet_id
LEFT JOIN SHELTER_STAFF st ON aa.staff_id = st.staff_id
ORDER BY aa.application_id ASC;

-- ----------------------------------------------------------------------------
-- Query 10: List all adopted pets with their adopter and approving staff
-- Concept: 4-Table JOIN navigating historical decisions
-- ----------------------------------------------------------------------------
SELECT 
    p.pet_id,
    p.pet_name,
    p.breed_name,
    a.full_name AS adopter_name,
    a.city AS adopter_city,
    st.staff_name AS approved_by,
    sd.decided_at
FROM SHELTER_DECISION sd
JOIN PET p ON sd.pet_id = p.pet_id
JOIN ADOPTER a ON sd.adopter_id = a.adopter_id
JOIN SHELTER_STAFF st ON sd.staff_id = st.staff_id
WHERE sd.decision = 'Approved'
ORDER BY sd.decided_at DESC;

-- ----------------------------------------------------------------------------
-- Query 11: Count pets by shelter (Aggregated pet census)
-- Concept: GROUP BY with aggregate COUNT and LEFT JOIN to include empty shelters
-- ----------------------------------------------------------------------------
SELECT 
    s.shelter_id,
    s.shelter_name,
    s.city,
    COUNT(p.pet_id) AS total_pets,
    SUM(CASE WHEN p.status = 'Available' THEN 1 ELSE 0 END) AS available_pets,
    SUM(CASE WHEN p.status = 'Adopted' THEN 1 ELSE 0 END) AS adopted_pets
FROM SHELTER s
LEFT JOIN PET p ON s.shelter_id = p.shelter_id
GROUP BY s.shelter_id, s.shelter_name, s.city
ORDER BY total_pets DESC;

-- ----------------------------------------------------------------------------
-- Query 12: Count pets by breed and species
-- Concept: Multi-column GROUP BY with HAVING clause filtering common breeds
-- ----------------------------------------------------------------------------
SELECT 
    b.species,
    p.breed_name,
    COUNT(p.pet_id) AS total_count,
    ROUND(AVG(p.age_months), 1) AS avg_age_months
FROM PET p
JOIN BREED b ON p.breed_name = b.breed_name
GROUP BY b.species, p.breed_name
HAVING COUNT(p.pet_id) >= 1
ORDER BY b.species, total_count DESC;

-- ----------------------------------------------------------------------------
-- Query 13: Show adoption application status statistics
-- Concept: Aggregation over workflow statuses with percentage calculation
-- ----------------------------------------------------------------------------
SELECT 
    aa.application_status,
    COUNT(aa.application_id) AS count_applications,
    ROUND(COUNT(aa.application_id) * 100.0 / (SELECT COUNT(*) FROM ADOPTION_APPLICATION), 1) AS percentage_share
FROM ADOPTION_APPLICATION aa
GROUP BY aa.application_status
ORDER BY count_applications DESC;

-- ----------------------------------------------------------------------------
-- Query 14: Find shelters that currently have available pets
-- Concept: Subquery using EXISTS / IN
-- ----------------------------------------------------------------------------
SELECT 
    s.shelter_id,
    s.shelter_name,
    s.license_no,
    s.city
FROM SHELTER s
WHERE EXISTS (
    SELECT 1 
    FROM PET p 
    WHERE p.shelter_id = s.shelter_id 
      AND p.status = 'Available'
)
ORDER BY s.shelter_name;
