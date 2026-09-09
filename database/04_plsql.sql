-- ============================================================================
-- Project: Kinder Pets - Pet Adoption Management System (DBMS DA2)
-- File: 04_plsql.sql
-- Description: Oracle PL/SQL Stored Procedures and Functions implementing
--              core business workflows and shelter governance rules.
--
-- Objects Implemented:
--   1. PROCEDURE add_pet                   - Register new pet profile into shelter inventory
--   2. PROCEDURE create_match              - Create or retrieve mutual match record
--   3. PROCEDURE record_swipe              - Process Tinder-style swipe action and trigger match
--   4. PROCEDURE submit_adoption_application - Convert match to formal home visit application
--   5. PROCEDURE approve_adoption          - Staff approval with strict shelter governance
--   6. PROCEDURE reject_adoption           - Staff rejection with shelter governance
--   7. FUNCTION  get_available_pet_count   - Real-time inventory count by shelter or overall
--   8. FUNCTION  get_adopter_match_count   - Active match count for an adopter profile
--   9. FUNCTION  is_pet_suitable_for_adopter - Compatibility evaluation based on preferences
--
-- GOVERNANCE RULE:
-- A shelter staff member MUST only be able to approve/reject an application
-- for a pet belonging to that staff member's shelter. Cross-shelter adjudication
-- will raise ORA-20020 (Governance Authorization Error).
-- ============================================================================

SET SERVEROUTPUT ON;
SET FEEDBACK ON;
SET DEFINE OFF;

-- ============================================================================
-- 1. PROCEDURE: add_pet
-- Purpose: Adds a new pet to the shelter inventory after validating FKs.
-- ============================================================================
CREATE OR REPLACE PROCEDURE add_pet (
    p_shelter_id     IN  PET.shelter_id%TYPE,
    p_breed_name     IN  PET.breed_name%TYPE,
    p_pet_name       IN  PET.pet_name%TYPE,
    p_gender         IN  PET.gender%TYPE,
    p_age_months     IN  PET.age_months%TYPE,
    p_size           IN  VARCHAR2,
    p_behaviour_desc IN  PET.behaviour_desc%TYPE,
    p_lifestyle_desc IN  PET.lifestyle_desc%TYPE,
    o_pet_id         OUT PET.pet_id%TYPE
) AS
    v_shelter_exists NUMBER := 0;
    v_breed_exists   NUMBER := 0;
BEGIN
    -- Validate shelter exists
    SELECT COUNT(*) INTO v_shelter_exists FROM SHELTER WHERE shelter_id = p_shelter_id;
    IF v_shelter_exists = 0 THEN
        RAISE_APPLICATION_ERROR(-20001, 'Shelter ID ' || p_shelter_id || ' does not exist.');
    END IF;

    -- Validate breed exists
    SELECT COUNT(*) INTO v_breed_exists FROM BREED WHERE breed_name = p_breed_name;
    IF v_breed_exists = 0 THEN
        RAISE_APPLICATION_ERROR(-20002, 'Breed "' || p_breed_name || '" does not exist in master catalog.');
    END IF;

    -- Validate gender
    IF p_gender NOT IN ('Male', 'Female', 'Unknown') THEN
        RAISE_APPLICATION_ERROR(-20003, 'Invalid gender. Must be Male, Female, or Unknown.');
    END IF;

    -- Validate size
    IF p_size NOT IN ('Small', 'Medium', 'Large', 'Extra Large') THEN
        RAISE_APPLICATION_ERROR(-20004, 'Invalid size. Must be Small, Medium, Large, or Extra Large.');
    END IF;

    -- Validate age
    IF p_age_months < 0 THEN
        RAISE_APPLICATION_ERROR(-20005, 'Age in months cannot be negative.');
    END IF;

    -- Insert pet record
    INSERT INTO PET (
        shelter_id, breed_name, pet_name, gender,
        age_months, "SIZE", behaviour_desc, lifestyle_desc, status
    ) VALUES (
        p_shelter_id, p_breed_name, p_pet_name, p_gender,
        p_age_months, p_size, p_behaviour_desc, p_lifestyle_desc, 'Available'
    ) RETURNING pet_id INTO o_pet_id;

    COMMIT;
    DBMS_OUTPUT.PUT_LINE('[add_pet] Pet "' || p_pet_name || '" added successfully with Pet ID: ' || o_pet_id);
EXCEPTION
    WHEN OTHERS THEN
        ROLLBACK;
        DBMS_OUTPUT.PUT_LINE('[add_pet] Error: ' || SQLERRM);
        RAISE;
END add_pet;
/
SHOW ERRORS;

-- ============================================================================
-- 2. PROCEDURE: create_match
-- Purpose: Deterministically creates or retrieves a PET_MATCH record.
-- ============================================================================
CREATE OR REPLACE PROCEDURE create_match (
    p_adopter_id IN  ADOPTER.adopter_id%TYPE,
    p_pet_id     IN  PET.pet_id%TYPE,
    o_match_id   OUT PET_MATCH.match_id%TYPE
) AS
    v_adopter_exists NUMBER := 0;
    v_pet_status     PET.status%TYPE;
BEGIN
    -- Validate adopter exists
    SELECT COUNT(*) INTO v_adopter_exists FROM ADOPTER WHERE adopter_id = p_adopter_id;
    IF v_adopter_exists = 0 THEN
        RAISE_APPLICATION_ERROR(-20006, 'Adopter ID ' || p_adopter_id || ' does not exist.');
    END IF;

    -- Validate pet exists and is available
    BEGIN
        SELECT status INTO v_pet_status FROM PET WHERE pet_id = p_pet_id;
    EXCEPTION
        WHEN NO_DATA_FOUND THEN
            RAISE_APPLICATION_ERROR(-20007, 'Pet ID ' || p_pet_id || ' not found.');
    END;

    IF v_pet_status NOT IN ('Available', 'Pending') THEN
        RAISE_APPLICATION_ERROR(-20008, 'Pet ID ' || p_pet_id || ' is currently ' || v_pet_status || ' and cannot be matched.');
    END IF;

    -- Check if match already exists
    BEGIN
        SELECT match_id INTO o_match_id 
        FROM PET_MATCH 
        WHERE adopter_id = p_adopter_id AND pet_id = p_pet_id;
        
        DBMS_OUTPUT.PUT_LINE('[create_match] Existing Match #' || o_match_id || ' retrieved.');
    EXCEPTION
        WHEN NO_DATA_FOUND THEN
            INSERT INTO PET_MATCH (adopter_id, pet_id, matched_at, status)
            VALUES (p_adopter_id, p_pet_id, CURRENT_TIMESTAMP, 'Active')
            RETURNING match_id INTO o_match_id;

            DBMS_OUTPUT.PUT_LINE('[create_match] New Match #' || o_match_id || ' successfully created between Adopter ' || p_adopter_id || ' and Pet ' || p_pet_id);
    END;

    COMMIT;
EXCEPTION
    WHEN OTHERS THEN
        ROLLBACK;
        DBMS_OUTPUT.PUT_LINE('[create_match] Error: ' || SQLERRM);
        RAISE;
END create_match;
/
SHOW ERRORS;

-- ============================================================================
-- 3. PROCEDURE: record_swipe
-- Purpose: Records a Tinder-style swipe action (LEFT/RIGHT). For 'RIGHT' swipes
--          on Available pets, automatically establishes a match.
-- ============================================================================
CREATE OR REPLACE PROCEDURE record_swipe (
    p_adopter_id IN  ADOPTER.adopter_id%TYPE,
    p_pet_id     IN  PET.pet_id%TYPE,
    p_direction  IN  SWIPE.direction%TYPE,
    o_is_match   OUT NUMBER,
    o_match_id   OUT PET_MATCH.match_id%TYPE
) AS
    v_pet_status     PET.status%TYPE;
    v_adopter_exists NUMBER := 0;
    v_existing_swipe NUMBER := 0;
BEGIN
    o_is_match := 0;
    o_match_id := NULL;

    -- Validate swipe direction
    IF p_direction NOT IN ('LEFT', 'RIGHT') THEN
        RAISE_APPLICATION_ERROR(-20009, 'Invalid swipe direction. Must be LEFT or RIGHT.');
    END IF;

    -- Validate adopter exists
    SELECT COUNT(*) INTO v_adopter_exists FROM ADOPTER WHERE adopter_id = p_adopter_id;
    IF v_adopter_exists = 0 THEN
        RAISE_APPLICATION_ERROR(-20006, 'Adopter ID ' || p_adopter_id || ' does not exist.');
    END IF;

    -- Validate pet exists and check availability
    BEGIN
        SELECT status INTO v_pet_status FROM PET WHERE pet_id = p_pet_id;
    EXCEPTION
        WHEN NO_DATA_FOUND THEN
            RAISE_APPLICATION_ERROR(-20007, 'Pet ID ' || p_pet_id || ' not found.');
    END;

    IF v_pet_status NOT IN ('Available', 'Pending') THEN
        RAISE_APPLICATION_ERROR(-20008, 'Pet ID ' || p_pet_id || ' is currently ' || v_pet_status || ' and cannot be swiped.');
    END IF;

    -- Upsert swipe record
    SELECT COUNT(*) INTO v_existing_swipe 
    FROM SWIPE 
    WHERE adopter_id = p_adopter_id AND pet_id = p_pet_id;

    IF v_existing_swipe > 0 THEN
        UPDATE SWIPE 
        SET direction = p_direction, swiped_at = CURRENT_TIMESTAMP
        WHERE adopter_id = p_adopter_id AND pet_id = p_pet_id;
        DBMS_OUTPUT.PUT_LINE('[record_swipe] Updated swipe for Adopter ' || p_adopter_id || ' on Pet ' || p_pet_id || ' to ' || p_direction);
    ELSE
        INSERT INTO SWIPE (adopter_id, pet_id, direction, swiped_at)
        VALUES (p_adopter_id, p_pet_id, p_direction, CURRENT_TIMESTAMP);
        DBMS_OUTPUT.PUT_LINE('[record_swipe] Recorded ' || p_direction || ' swipe for Adopter ' || p_adopter_id || ' on Pet ' || p_pet_id);
    END IF;

    -- Trigger match creation on RIGHT swipe
    IF p_direction = 'RIGHT' THEN
        create_match(p_adopter_id, p_pet_id, o_match_id);
        o_is_match := 1;
    END IF;

    COMMIT;
EXCEPTION
    WHEN OTHERS THEN
        ROLLBACK;
        DBMS_OUTPUT.PUT_LINE('[record_swipe] Error: ' || SQLERRM);
        RAISE;
END record_swipe;
/
SHOW ERRORS;

-- ============================================================================
-- 4. PROCEDURE: submit_adoption_application
-- Purpose: Submits a formal home visit application for an active match.
-- Updates match status to 'Applied' and pet status to 'Pending'.
-- ============================================================================
CREATE OR REPLACE PROCEDURE submit_adoption_application (
    p_match_id        IN  PET_MATCH.match_id%TYPE,
    p_home_visit_date IN  DATE,
    o_application_id  OUT ADOPTION_APPLICATION.application_id%TYPE
) AS
    v_match_status PET_MATCH.status%TYPE;
    v_pet_id       PET.pet_id%TYPE;
    v_existing_app NUMBER := 0;
BEGIN
    -- Verify match exists
    BEGIN
        SELECT status, pet_id 
        INTO v_match_status, v_pet_id 
        FROM PET_MATCH 
        WHERE match_id = p_match_id;
    EXCEPTION
        WHEN NO_DATA_FOUND THEN
            RAISE_APPLICATION_ERROR(-20010, 'Match ID ' || p_match_id || ' does not exist.');
    END;

    -- Verify match is not closed
    IF v_match_status = 'Closed' THEN
        RAISE_APPLICATION_ERROR(-20011, 'Cannot apply: Match #' || p_match_id || ' is already closed.');
    END IF;

    -- Verify application does not already exist
    SELECT COUNT(*) INTO v_existing_app 
    FROM ADOPTION_APPLICATION 
    WHERE match_id = p_match_id;

    IF v_existing_app > 0 THEN
        RAISE_APPLICATION_ERROR(-20012, 'An adoption application already exists for Match #' || p_match_id);
    END IF;

    -- Insert formal application
    INSERT INTO ADOPTION_APPLICATION (
        match_id, staff_id, home_visit_date, application_status, submitted_at
    ) VALUES (
        p_match_id, NULL, p_home_visit_date, 'Pending', CURRENT_TIMESTAMP
    ) RETURNING application_id INTO o_application_id;

    -- Transition statuses
    UPDATE PET_MATCH SET status = 'Applied' WHERE match_id = p_match_id;
    UPDATE PET SET status = 'Pending' WHERE pet_id = v_pet_id;

    COMMIT;
    DBMS_OUTPUT.PUT_LINE('[submit_adoption_application] Application #' || o_application_id || 
                         ' submitted for Match #' || p_match_id || ' (Home Visit: ' || 
                         TO_CHAR(p_home_visit_date, 'YYYY-MM-DD') || ')');
EXCEPTION
    WHEN OTHERS THEN
        ROLLBACK;
        DBMS_OUTPUT.PUT_LINE('[submit_adoption_application] Error: ' || SQLERRM);
        RAISE;
END submit_adoption_application;
/
SHOW ERRORS;

-- ============================================================================
-- 5. PROCEDURE: approve_adoption
-- Purpose: Atomically approves an adoption application.
-- Strict Shelter Governance:
--   Verifies staff belongs to the pet's shelter before approving.
-- Actions:
--   1. Inserts SHELTER_DECISION ('Approved')
--   2. Updates ADOPTION_APPLICATION to 'Approved'
--   3. Updates PET status to 'Adopted'
--   4. Closes the corresponding match and other active matches for the pet
-- ============================================================================
CREATE OR REPLACE PROCEDURE approve_adoption (
    p_application_id IN  ADOPTION_APPLICATION.application_id%TYPE,
    p_staff_id       IN  SHELTER_STAFF.staff_id%TYPE,
    o_decision_id    OUT SHELTER_DECISION.decision_id%TYPE
) AS
    v_match_id         PET_MATCH.match_id%TYPE;
    v_pet_id           PET.pet_id%TYPE;
    v_adopter_id       ADOPTER.adopter_id%TYPE;
    v_pet_shelter_id   SHELTER.shelter_id%TYPE;
    v_app_status       ADOPTION_APPLICATION.application_status%TYPE;
    v_staff_shelter_id SHELTER.shelter_id%TYPE;
    v_staff_name       SHELTER_STAFF.staff_name%TYPE;
    v_pet_name         PET.pet_name%TYPE;
BEGIN
    -- 1. Verify application exists and retrieve pet & adopter details
    BEGIN
        SELECT 
            app.match_id, 
            app.application_status, 
            m.pet_id, 
            m.adopter_id, 
            p.shelter_id,
            p.pet_name
        INTO 
            v_match_id, 
            v_app_status, 
            v_pet_id, 
            v_adopter_id, 
            v_pet_shelter_id,
            v_pet_name
        FROM ADOPTION_APPLICATION app
        INNER JOIN PET_MATCH m ON app.match_id = m.match_id
        INNER JOIN PET p ON m.pet_id = p.pet_id
        WHERE app.application_id = p_application_id;
    EXCEPTION
        WHEN NO_DATA_FOUND THEN
            RAISE_APPLICATION_ERROR(-20013, 'Application ID ' || p_application_id || ' does not exist.');
    END;

    -- 2. Verify staff exists and retrieve staff's shelter
    BEGIN
        SELECT shelter_id, staff_name
        INTO v_staff_shelter_id, v_staff_name
        FROM SHELTER_STAFF
        WHERE staff_id = p_staff_id;
    EXCEPTION
        WHEN NO_DATA_FOUND THEN
            RAISE_APPLICATION_ERROR(-20014, 'Staff ID ' || p_staff_id || ' does not exist.');
    END;

    -- 3. GOVERNANCE RULE: Verify staff belongs to the pet's shelter
    IF v_staff_shelter_id != v_pet_shelter_id THEN
        RAISE_APPLICATION_ERROR(-20020, 
            'Governance Authorization Error: Staff member "' || v_staff_name || 
            '" (Staff ID ' || p_staff_id || ', Shelter ' || v_staff_shelter_id || 
            ') is not authorized to approve applications for Pet "' || v_pet_name || 
            '" (Pet ID ' || v_pet_id || ') belonging to Shelter ' || v_pet_shelter_id || '.');
    END IF;

    -- 4. Verify application is in an appropriate state
    IF v_app_status NOT IN ('Pending', 'Under Review') THEN
        RAISE_APPLICATION_ERROR(-20015, 
            'Invalid State: Application #' || p_application_id || ' is in status "' || 
            v_app_status || '" and cannot be approved.');
    END IF;

    -- 5. Insert SHELTER_DECISION
    INSERT INTO SHELTER_DECISION (
        pet_id, adopter_id, decision, staff_id, decided_at
    ) VALUES (
        v_pet_id, v_adopter_id, 'Approved', p_staff_id, CURRENT_TIMESTAMP
    ) RETURNING decision_id INTO o_decision_id;

    -- 6. Update ADOPTION_APPLICATION
    UPDATE ADOPTION_APPLICATION
    SET application_status = 'Approved',
        staff_id = p_staff_id
    WHERE application_id = p_application_id;

    -- 7. Update PET status to 'Adopted'
    UPDATE PET
    SET status = 'Adopted'
    WHERE pet_id = v_pet_id;

    -- 8. Close corresponding match and any other active matches for this pet
    UPDATE PET_MATCH
    SET status = 'Closed'
    WHERE match_id = v_match_id;

    UPDATE PET_MATCH
    SET status = 'Closed'
    WHERE pet_id = v_pet_id AND match_id != v_match_id AND status IN ('Active', 'Applied');

    COMMIT;
    DBMS_OUTPUT.PUT_LINE('[approve_adoption] SUCCESS: Application #' || p_application_id || 
                         ' APPROVED by Staff "' || v_staff_name || '" (Shelter ' || v_staff_shelter_id || 
                         '). Decision ID: ' || o_decision_id || '. Pet "' || v_pet_name || '" is now Adopted.');
EXCEPTION
    WHEN OTHERS THEN
        ROLLBACK;
        DBMS_OUTPUT.PUT_LINE('[approve_adoption] FAILED: ' || SQLERRM);
        RAISE;
END approve_adoption;
/
SHOW ERRORS;

-- ============================================================================
-- 6. PROCEDURE: reject_adoption
-- Purpose: Atomically records shelter rejection with governance enforcement.
-- Actions:
--   1. Inserts SHELTER_DECISION ('Rejected')
--   2. Updates ADOPTION_APPLICATION to 'Rejected'
--   3. Keeps PET status 'Available'
--   4. Closes the corresponding match
-- ============================================================================
CREATE OR REPLACE PROCEDURE reject_adoption (
    p_application_id IN  ADOPTION_APPLICATION.application_id%TYPE,
    p_staff_id       IN  SHELTER_STAFF.staff_id%TYPE,
    o_decision_id    OUT SHELTER_DECISION.decision_id%TYPE
) AS
    v_match_id         PET_MATCH.match_id%TYPE;
    v_pet_id           PET.pet_id%TYPE;
    v_adopter_id       ADOPTER.adopter_id%TYPE;
    v_pet_shelter_id   SHELTER.shelter_id%TYPE;
    v_app_status       ADOPTION_APPLICATION.application_status%TYPE;
    v_staff_shelter_id SHELTER.shelter_id%TYPE;
    v_staff_name       SHELTER_STAFF.staff_name%TYPE;
    v_pet_name         PET.pet_name%TYPE;
BEGIN
    -- 1. Verify application exists and retrieve context
    BEGIN
        SELECT 
            app.match_id, 
            app.application_status, 
            m.pet_id, 
            m.adopter_id, 
            p.shelter_id,
            p.pet_name
        INTO 
            v_match_id, 
            v_app_status, 
            v_pet_id, 
            v_adopter_id, 
            v_pet_shelter_id,
            v_pet_name
        FROM ADOPTION_APPLICATION app
        INNER JOIN PET_MATCH m ON app.match_id = m.match_id
        INNER JOIN PET p ON m.pet_id = p.pet_id
        WHERE app.application_id = p_application_id;
    EXCEPTION
        WHEN NO_DATA_FOUND THEN
            RAISE_APPLICATION_ERROR(-20013, 'Application ID ' || p_application_id || ' does not exist.');
    END;

    -- 2. Verify staff exists
    BEGIN
        SELECT shelter_id, staff_name
        INTO v_staff_shelter_id, v_staff_name
        FROM SHELTER_STAFF
        WHERE staff_id = p_staff_id;
    EXCEPTION
        WHEN NO_DATA_FOUND THEN
            RAISE_APPLICATION_ERROR(-20014, 'Staff ID ' || p_staff_id || ' does not exist.');
    END;

    -- 3. GOVERNANCE RULE: Verify staff belongs to the pet's shelter
    IF v_staff_shelter_id != v_pet_shelter_id THEN
        RAISE_APPLICATION_ERROR(-20020, 
            'Governance Authorization Error: Staff member "' || v_staff_name || 
            '" (Staff ID ' || p_staff_id || ', Shelter ' || v_staff_shelter_id || 
            ') is not authorized to reject applications for Pet "' || v_pet_name || 
            '" (Pet ID ' || v_pet_id || ') belonging to Shelter ' || v_pet_shelter_id || '.');
    END IF;

    -- 4. Verify application state
    IF v_app_status NOT IN ('Pending', 'Under Review') THEN
        RAISE_APPLICATION_ERROR(-20015, 
            'Invalid State: Application #' || p_application_id || ' is in status "' || 
            v_app_status || '" and cannot be rejected.');
    END IF;

    -- 5. Insert SHELTER_DECISION
    INSERT INTO SHELTER_DECISION (
        pet_id, adopter_id, decision, staff_id, decided_at
    ) VALUES (
        v_pet_id, v_adopter_id, 'Rejected', p_staff_id, CURRENT_TIMESTAMP
    ) RETURNING decision_id INTO o_decision_id;

    -- 6. Update ADOPTION_APPLICATION to 'Rejected'
    UPDATE ADOPTION_APPLICATION
    SET application_status = 'Rejected',
        staff_id = p_staff_id
    WHERE application_id = p_application_id;

    -- 7. Keep PET status 'Available' (release from Pending)
    UPDATE PET
    SET status = 'Available'
    WHERE pet_id = v_pet_id;

    -- 8. Close corresponding match
    UPDATE PET_MATCH
    SET status = 'Closed'
    WHERE match_id = v_match_id;

    COMMIT;
    DBMS_OUTPUT.PUT_LINE('[reject_adoption] SUCCESS: Application #' || p_application_id || 
                         ' REJECTED by Staff "' || v_staff_name || '" (Shelter ' || v_staff_shelter_id || 
                         '). Decision ID: ' || o_decision_id || '. Pet "' || v_pet_name || '" is now Available.');
EXCEPTION
    WHEN OTHERS THEN
        ROLLBACK;
        DBMS_OUTPUT.PUT_LINE('[reject_adoption] FAILED: ' || SQLERRM);
        RAISE;
END reject_adoption;
/
SHOW ERRORS;

-- ============================================================================
-- 7. FUNCTION: get_available_pet_count
-- Purpose: Returns real-time count of available pets for a shelter or globally.
-- ============================================================================
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
SHOW ERRORS;

-- ============================================================================
-- 8. FUNCTION: get_adopter_match_count
-- Purpose: Returns count of open active matches for an adopter.
-- ============================================================================
CREATE OR REPLACE FUNCTION get_adopter_match_count (
    p_adopter_id IN ADOPTER.adopter_id%TYPE
) RETURN NUMBER IS
    v_count NUMBER := 0;
BEGIN
    SELECT COUNT(*) INTO v_count
    FROM PET_MATCH
    WHERE adopter_id = p_adopter_id AND status = 'Active';

    RETURN v_count;
EXCEPTION
    WHEN OTHERS THEN
        RETURN 0;
END get_adopter_match_count;
/
SHOW ERRORS;

-- ============================================================================
-- 9. FUNCTION: is_pet_suitable_for_adopter
-- Purpose: Evaluates compatibility between adopter preferences and pet profile.
-- Returns: 'MATCH' or 'NO_MATCH'
-- ============================================================================
CREATE OR REPLACE FUNCTION is_pet_suitable_for_adopter (
    p_adopter_id IN ADOPTER.adopter_id%TYPE,
    p_pet_id     IN PET.pet_id%TYPE
) RETURN VARCHAR2 IS
    v_matches NUMBER := 0;
BEGIN
    SELECT COUNT(*) INTO v_matches
    FROM PET p
    INNER JOIN BREED b ON p.breed_name = b.breed_name
    INNER JOIN ADOPTER_PREFERENCE ap ON ap.adopter_id = p_adopter_id
    WHERE p.pet_id = p_pet_id
      AND (ap.preferred_species IS NULL OR b.species = ap.preferred_species)
      AND (p.age_months BETWEEN ap.min_age_months AND ap.max_age_months)
      AND (ap.preferred_size IS NULL OR p."SIZE" = ap.preferred_size);

    IF v_matches > 0 THEN
        RETURN 'MATCH';
    ELSE
        RETURN 'NO_MATCH';
    END IF;
EXCEPTION
    WHEN NO_DATA_FOUND THEN
        RETURN 'MATCH';
    WHEN OTHERS THEN
        RETURN 'NO_MATCH';
END is_pet_suitable_for_adopter;
/
SHOW ERRORS;
