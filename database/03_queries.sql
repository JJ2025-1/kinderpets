-- ============================================================================
-- Project: Kinder Pets - Pet Adoption Management System (DBMS DA2)
-- File: 03_queries.sql
-- Description: Comprehensive Academic SQL Queries demonstrating core RDBMS concepts:
--              Multi-table INNER/LEFT JOINs, Aggregations, GROUP BY, HAVING,
--              Correlated Subqueries, EXISTS, and Set Operations.
-- ============================================================================

SET LINESIZE 220;
SET PAGESIZE 100;
SET FEEDBACK ON;
SET DEFINE OFF;

-- ----------------------------------------------------------------------------
-- 1. Available Pets
-- Concept: Basic Projection and Selection with Order By
-- Description: Lists all active pets currently awaiting adoption.
-- ----------------------------------------------------------------------------
PROMPT === Query 1: Available Pets ===
SELECT 
    p.pet_id,
    p.pet_name,
    p.breed_name,
    p.gender,
    p.age_months,
    p."SIZE" AS pet_size,
    p.status
FROM PET p
WHERE p.status = 'Available'
ORDER BY p.pet_name ASC;

-- ----------------------------------------------------------------------------
-- 2. Pets by City (e.g. Bangalore)
-- Concept: 2-Table INNER JOIN with City Filtering
-- Description: Discovers shelter animals located within a target metro area.
-- ----------------------------------------------------------------------------
PROMPT === Query 2: Pets by City (Bangalore) ===
SELECT 
    p.pet_id,
    p.pet_name,
    p.breed_name,
    p."SIZE" AS pet_size,
    s.shelter_name,
    s.city AS shelter_city,
    p.status
FROM PET p
INNER JOIN SHELTER s ON p.shelter_id = s.shelter_id
WHERE UPPER(s.city) = 'BANGALORE'
ORDER BY p.pet_name;

-- ----------------------------------------------------------------------------
-- 3. Pets by Species (e.g. Dogs)
-- Concept: 2-Table INNER JOIN filtering on biological taxonomy master
-- Description: Filters pet catalog to display dogs available for adoption.
-- ----------------------------------------------------------------------------
PROMPT === Query 3: Pets by Species (Dog) ===
SELECT 
    p.pet_id,
    p.pet_name,
    b.species,
    p.breed_name,
    p.gender,
    p.age_months,
    p.status
FROM PET p
INNER JOIN BREED b ON p.breed_name = b.breed_name
WHERE b.species = 'Dog' AND p.status = 'Available'
ORDER BY p.age_months ASC;

-- ----------------------------------------------------------------------------
-- 4. Pets by Breed (e.g. Labrador Retriever)
-- Concept: 3-Table INNER JOIN filtering on specific breed name
-- Description: Finds all pets of a specific breed along with shelter details.
-- ----------------------------------------------------------------------------
PROMPT === Query 4: Pets by Specific Breed (Labrador Retriever) ===
SELECT 
    p.pet_id,
    p.pet_name,
    p.breed_name,
    p.gender,
    p.age_months,
    p."SIZE" AS pet_size,
    s.shelter_name,
    s.city AS shelter_city,
    p.status
FROM PET p
INNER JOIN BREED b ON p.breed_name = b.breed_name
INNER JOIN SHELTER s ON p.shelter_id = s.shelter_id
WHERE p.breed_name = 'Labrador Retriever';

-- ----------------------------------------------------------------------------
-- 5. Nearby / Area-Based Pet Discovery
-- Concept: Multi-table JOIN correlating Adopter city with Shelter city
-- Description: Matches Adopter 1 (Rahul Sharma in Bangalore) with pets in Bangalore.
-- ----------------------------------------------------------------------------
PROMPT === Query 5: Nearby / Area-Based Pet Discovery (Adopter 1 - Bangalore) ===
SELECT 
    a.adopter_id,
    a.full_name AS adopter_name,
    a.city AS adopter_city,
    p.pet_id,
    p.pet_name,
    p.breed_name,
    s.shelter_name,
    s.city AS shelter_city,
    p.status
FROM ADOPTER a
INNER JOIN SHELTER s ON UPPER(a.city) = UPPER(s.city)
INNER JOIN PET p ON s.shelter_id = p.shelter_id
WHERE a.adopter_id = 1 AND p.status = 'Available'
ORDER BY p.pet_name;

-- ----------------------------------------------------------------------------
-- 6. Adopter Preferences
-- Concept: 1:1 Extension Table JOIN
-- Description: Displays registered adoption criteria (species, age range, size).
-- ----------------------------------------------------------------------------
PROMPT === Query 6: Adopter Preferences ===
SELECT 
    a.adopter_id,
    a.full_name,
    a.city,
    ap.preferred_species,
    ap.min_age_months || ' to ' || ap.max_age_months || ' mos' AS preferred_age_range,
    NVL(ap.preferred_size, 'Any Size') AS preferred_size
FROM ADOPTER a
INNER JOIN ADOPTER_PREFERENCE ap ON a.adopter_id = ap.adopter_id
ORDER BY a.adopter_id;

-- ----------------------------------------------------------------------------
-- 7. Preferred Breeds
-- Concept: M:N Bridge Table JOIN (Adopter -> Preferred_Breed -> Breed)
-- Description: Lists preferred breeds chosen by each adopter.
-- ----------------------------------------------------------------------------
PROMPT === Query 7: Adopters and Their Preferred Breeds ===
SELECT 
    a.adopter_id,
    a.full_name,
    b.species,
    pb.breed_name
FROM ADOPTER a
INNER JOIN PREFERRED_BREED pb ON a.adopter_id = pb.adopter_id
INNER JOIN BREED b ON pb.breed_name = b.breed_name
ORDER BY a.adopter_id, pb.breed_name;

-- ----------------------------------------------------------------------------
-- 8. Swipe History
-- Concept: 4-Table JOIN displaying user interaction logs
-- Description: Full audit trail of swipe interactions (LEFT / RIGHT).
-- ----------------------------------------------------------------------------
PROMPT === Query 8: Swipe History Audit Trail ===
SELECT 
    sw.swipe_id,
    a.full_name AS adopter_name,
    p.pet_name,
    p.breed_name,
    s.shelter_name,
    sw.direction AS swipe_action,
    TO_CHAR(sw.swiped_at, 'YYYY-MM-DD HH24:MI:SS') AS swiped_at
FROM SWIPE sw
INNER JOIN ADOPTER a ON sw.adopter_id = a.adopter_id
INNER JOIN PET p ON sw.pet_id = p.pet_id
INNER JOIN SHELTER s ON p.shelter_id = s.shelter_id
ORDER BY sw.swiped_at DESC;

-- ----------------------------------------------------------------------------
-- 9. Right Swipes (Mutual Interest Pipeline)
-- Concept: Filtered JOIN on Tinder-style 'RIGHT' swipe interactions
-- Description: Shows adopters who expressed positive interest in pets.
-- ----------------------------------------------------------------------------
PROMPT === Query 9: Right Swipes (Interested Adopters) ===
SELECT 
    sw.swipe_id,
    a.adopter_id,
    a.full_name AS adopter_name,
    a.email,
    p.pet_id,
    p.pet_name,
    p.breed_name,
    p.status AS pet_current_status,
    TO_CHAR(sw.swiped_at, 'YYYY-MM-DD HH24:MI') AS interested_since
FROM SWIPE sw
INNER JOIN ADOPTER a ON sw.adopter_id = a.adopter_id
INNER JOIN PET p ON sw.pet_id = p.pet_id
WHERE sw.direction = 'RIGHT'
ORDER BY sw.swiped_at ASC;

-- ----------------------------------------------------------------------------
-- 10. Matches
-- Concept: Projection on PET_MATCH with Status Breakdown
-- Description: Lists all active and historical matches established.
-- ----------------------------------------------------------------------------
PROMPT === Query 10: All Generated Matches ===
SELECT 
    m.match_id,
    m.adopter_id,
    m.pet_id,
    m.status AS match_status,
    TO_CHAR(m.matched_at, 'YYYY-MM-DD HH24:MI:SS') AS matched_at
FROM PET_MATCH m
ORDER BY m.match_id ASC;

-- ----------------------------------------------------------------------------
-- 11. Match + Pet + Adopter Details
-- Concept: 4-Table Comprehensive Join
-- Description: Joins matches with full pet metadata, adopter details, and shelter.
-- ----------------------------------------------------------------------------
PROMPT === Query 11: Match + Pet + Adopter Enriched Details ===
SELECT 
    m.match_id,
    m.status AS match_status,
    a.full_name AS adopter_name,
    a.phone AS adopter_phone,
    a.city AS adopter_city,
    p.pet_name,
    p.breed_name,
    p."SIZE" AS pet_size,
    s.shelter_name,
    s.city AS shelter_city
FROM PET_MATCH m
INNER JOIN ADOPTER a ON m.adopter_id = a.adopter_id
INNER JOIN PET p ON m.pet_id = p.pet_id
INNER JOIN SHELTER s ON p.shelter_id = s.shelter_id
ORDER BY m.match_id;

-- ----------------------------------------------------------------------------
-- 12. Adoption Applications
-- Concept: 5-Table Join displaying formal adoption application workflows
-- Description: Applications submitted with home visit dates and assigned staff.
-- ----------------------------------------------------------------------------
PROMPT === Query 12: Adoption Applications Pipeline ===
SELECT 
    app.application_id,
    app.application_status,
    TO_CHAR(app.home_visit_date, 'YYYY-MM-DD') AS home_visit_date,
    a.full_name AS applicant_name,
    p.pet_name,
    p.breed_name,
    s.shelter_name,
    NVL(st.staff_name, 'Unassigned') AS reviewing_staff,
    TO_CHAR(app.submitted_at, 'YYYY-MM-DD HH24:MI') AS submitted_at
FROM ADOPTION_APPLICATION app
INNER JOIN PET_MATCH m ON app.match_id = m.match_id
INNER JOIN ADOPTER a ON m.adopter_id = a.adopter_id
INNER JOIN PET p ON m.pet_id = p.pet_id
INNER JOIN SHELTER s ON p.shelter_id = s.shelter_id
LEFT JOIN SHELTER_STAFF st ON app.staff_id = st.staff_id
ORDER BY app.application_id;

-- ----------------------------------------------------------------------------
-- 13. Applications Under Review and Pending
-- Concept: Filtered multi-table JOIN identifying pending caseworker workload
-- Description: Active applications awaiting shelter review or home inspection.
-- ----------------------------------------------------------------------------
PROMPT === Query 13: Applications Under Review and Pending ===
SELECT 
    app.application_id,
    app.application_status,
    p.pet_name,
    a.full_name AS applicant_name,
    a.phone AS contact_phone,
    TO_CHAR(app.home_visit_date, 'YYYY-MM-DD') AS scheduled_visit,
    NVL(st.staff_name, 'Pending Assignment') AS assigned_staff
FROM ADOPTION_APPLICATION app
INNER JOIN PET_MATCH m ON app.match_id = m.match_id
INNER JOIN ADOPTER a ON m.adopter_id = a.adopter_id
INNER JOIN PET p ON m.pet_id = p.pet_id
LEFT JOIN SHELTER_STAFF st ON app.staff_id = st.staff_id
WHERE app.application_status IN ('Pending', 'Under Review')
ORDER BY app.home_visit_date ASC;

-- ----------------------------------------------------------------------------
-- 14. Approved and Rejected Adoption Decisions
-- Concept: 5-Table Audit Join on Adjudication Log
-- Description: Historical record of finalized adoption decisions and sign-offs.
-- ----------------------------------------------------------------------------
PROMPT === Query 14: Finalized Shelter Decisions ===
SELECT 
    d.decision_id,
    d.decision AS final_verdict,
    p.pet_name,
    p.breed_name,
    a.full_name AS adopter_name,
    st.staff_name AS deciding_officer,
    s.shelter_name,
    TO_CHAR(d.decided_at, 'YYYY-MM-DD HH24:MI:SS') AS adjudicated_at
FROM SHELTER_DECISION d
INNER JOIN PET p ON d.pet_id = p.pet_id
INNER JOIN ADOPTER a ON d.adopter_id = a.adopter_id
INNER JOIN SHELTER_STAFF st ON d.staff_id = st.staff_id
INNER JOIN SHELTER s ON st.shelter_id = s.shelter_id
ORDER BY d.decided_at DESC;

-- ----------------------------------------------------------------------------
-- 15. Aggregation with GROUP BY and HAVING
-- Concept: Grouping, Aggregate Functions (COUNT), and Filter on Aggregates
-- Description: Shelters having more than 2 available pets in custody.
-- ----------------------------------------------------------------------------
PROMPT === Query 15: Shelter Pet Inventory (HAVING Available Count >= 2) ===
SELECT 
    s.shelter_id,
    s.shelter_name,
    s.city,
    COUNT(p.pet_id) AS total_pets,
    SUM(CASE WHEN p.status = 'Available' THEN 1 ELSE 0 END) AS available_pets
FROM SHELTER s
INNER JOIN PET p ON s.shelter_id = p.shelter_id
GROUP BY s.shelter_id, s.shelter_name, s.city
HAVING SUM(CASE WHEN p.status = 'Available' THEN 1 ELSE 0 END) >= 2
ORDER BY available_pets DESC;

-- ----------------------------------------------------------------------------
-- 16. Correlated Subquery with NOT EXISTS
-- Concept: Set Exclusion via Correlated NOT EXISTS
-- Description: Finds registered adopters who have NOT yet submitted an application.
-- ----------------------------------------------------------------------------
PROMPT === Query 16: Registered Adopters Without Any Active Application ===
SELECT 
    a.adopter_id,
    a.full_name,
    a.email,
    a.city
FROM ADOPTER a
WHERE NOT EXISTS (
    SELECT 1 
    FROM PET_MATCH m
    INNER JOIN ADOPTION_APPLICATION app ON m.match_id = app.match_id
    WHERE m.adopter_id = a.adopter_id
)
ORDER BY a.adopter_id;

-- ----------------------------------------------------------------------------
-- 17. Complex Automated Match Criteria Query
-- Concept: Multi-Condition Subqueries, Range Matching, and Bridge Table Check
-- Description: Identifies available pets that satisfy Rahul Sharma's preferences:
--              (Species: Dog, Age: 6-36 mos, Size: Large, Breed: Labrador or Golden)
-- ----------------------------------------------------------------------------
PROMPT === Query 17: Preference-Driven Match Discovery for Adopter 1 ===
SELECT 
    p.pet_id,
    p.pet_name,
    b.species,
    p.breed_name,
    p.age_months,
    p."SIZE" AS pet_size,
    s.shelter_name,
    s.city
FROM PET p
INNER JOIN BREED b ON p.breed_name = b.breed_name
INNER JOIN SHELTER s ON p.shelter_id = s.shelter_id
WHERE p.status = 'Available'
  AND b.species = (SELECT preferred_species FROM ADOPTER_PREFERENCE WHERE adopter_id = 1)
  AND p.age_months BETWEEN (SELECT min_age_months FROM ADOPTER_PREFERENCE WHERE adopter_id = 1)
                       AND (SELECT max_age_months FROM ADOPTER_PREFERENCE WHERE adopter_id = 1)
  AND p."SIZE" = (SELECT preferred_size FROM ADOPTER_PREFERENCE WHERE adopter_id = 1)
  AND p.breed_name IN (SELECT breed_name FROM PREFERRED_BREED WHERE adopter_id = 1);

-- ----------------------------------------------------------------------------
-- 18. Executive Operational Dashboard (Aggregations + CASE)
-- Concept: Single-Pass System Summary Aggregations
-- Description: High-level metrics for swipes, right-swipe conversion, and adoptions.
-- ----------------------------------------------------------------------------
PROMPT === Query 18: System Summary Operational Metrics ===
SELECT 
    (SELECT COUNT(*) FROM SHELTER) AS total_shelters,
    (SELECT COUNT(*) FROM PET) AS total_pets,
    (SELECT COUNT(*) FROM PET WHERE status = 'Available') AS available_pets,
    (SELECT COUNT(*) FROM PET WHERE status = 'Adopted') AS adopted_pets,
    (SELECT COUNT(*) FROM SWIPE) AS total_swipes,
    (SELECT COUNT(*) FROM SWIPE WHERE direction = 'RIGHT') AS right_swipes,
    ROUND((SELECT COUNT(*) FROM SWIPE WHERE direction = 'RIGHT') * 100.0 / 
          NULLIF((SELECT COUNT(*) FROM SWIPE), 0), 1) AS right_swipe_pct,
    (SELECT COUNT(*) FROM PET_MATCH) AS total_matches,
    (SELECT COUNT(*) FROM ADOPTION_APPLICATION) AS total_applications,
    (SELECT COUNT(*) FROM SHELTER_DECISION WHERE decision = 'Approved') AS approved_adoptions
FROM DUAL;
