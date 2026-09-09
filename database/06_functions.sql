-- ============================================================================
-- Project: Kinder Pets - Pet Adoption Management System (DBMS DA2)
-- File: 06_functions.sql
-- Description: Oracle PL/SQL User-Defined Functions.
-- Functions:
--   1. get_available_pet_count: Count available pets globally or by shelter
--   2. get_adopter_match_count: Count active matches for an adopter
--   3. is_pet_suitable_for_adopter: Preference compatibility scoring function
-- ============================================================================

-- ----------------------------------------------------------------------------
-- Function 1: get_available_pet_count
-- Purpose: Returns the count of 'Available' pets in a specific shelter or overall.
-- Parameters:
--   p_shelter_id (Optional) - Shelter ID to filter by. If NULL, counts all available pets.
-- Returns: NUMBER (count of available pets)
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION get_available_pet_count (
    p_shelter_id IN SHELTER.shelter_id%TYPE DEFAULT NULL
) RETURN NUMBER IS
    v_count NUMBER := 0;
BEGIN
    IF p_shelter_id IS NULL THEN
        SELECT COUNT(*) INTO v_count
        FROM PET
        WHERE status = 'Available';
    ELSE
        SELECT COUNT(*) INTO v_count
        FROM PET
        WHERE shelter_id = p_shelter_id AND status = 'Available';
    END IF;

    RETURN v_count;
EXCEPTION
    WHEN OTHERS THEN
        RETURN 0;
END get_available_pet_count;
/

-- ----------------------------------------------------------------------------
-- Function 2: get_adopter_match_count
-- Purpose: Returns the count of active matches for a specified adopter.
-- Parameters:
--   p_adopter_id - Target adopter ID
-- Returns: NUMBER (total active matches)
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION get_adopter_match_count (
    p_adopter_id IN ADOPTER.adopter_id%TYPE
) RETURN NUMBER IS
    v_match_count NUMBER := 0;
BEGIN
    SELECT COUNT(*) INTO v_match_count
    FROM MATCH
    WHERE adopter_id = p_adopter_id AND status = 'Active';

    RETURN v_match_count;
EXCEPTION
    WHEN OTHERS THEN
        RETURN 0;
END get_adopter_match_count;
/

-- ----------------------------------------------------------------------------
-- Function 3: is_pet_suitable_for_adopter
-- Purpose: Checks if a pet matches the adopter's registered preference criteria.
-- Parameters:
--   p_adopter_id - Adopter ID
--   p_pet_id     - Pet ID
-- Returns: VARCHAR2 ('MATCH' or 'NO_MATCH')
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION is_pet_suitable_for_adopter (
    p_adopter_id IN ADOPTER.adopter_id%TYPE,
    p_pet_id     IN PET.pet_id%TYPE
) RETURN VARCHAR2 IS
    v_matches NUMBER := 0;
BEGIN
    SELECT COUNT(*) INTO v_matches
    FROM PET p
    JOIN BREED b ON p.breed_name = b.breed_name
    JOIN ADOPTER_PREFERENCE ap ON ap.adopter_id = p_adopter_id
    WHERE p.pet_id = p_pet_id
      AND (ap.preferred_species IS NULL OR b.species = ap.preferred_species)
      AND (p.age_months BETWEEN ap.min_age_months AND ap.max_age_months)
      AND (ap.preferred_size IS NULL OR p.size = ap.preferred_size);

    IF v_matches > 0 THEN
        RETURN 'MATCH';
    ELSE
        RETURN 'NO_MATCH';
    END IF;
EXCEPTION
    WHEN NO_DATA_FOUND THEN
        -- If adopter has no preferences configured, default to suitable
        RETURN 'MATCH';
    WHEN OTHERS THEN
        RETURN 'NO_MATCH';
END is_pet_suitable_for_adopter;
/

-- ----------------------------------------------------------------------------
-- Sample Invocations:
-- ----------------------------------------------------------------------------
-- SELECT get_available_pet_count() AS total_available FROM dual;
-- SELECT get_available_pet_count(1) AS blr_shelter_available FROM dual;
-- SELECT adopter_id, full_name, get_adopter_match_count(adopter_id) AS active_matches FROM ADOPTER;
-- SELECT is_pet_suitable_for_adopter(1, 1) AS bruno_match_for_rahul FROM dual;
