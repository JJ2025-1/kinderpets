-- ============================================================================
-- Project: Kinder Pets - Pet Adoption Management System (DBMS DA2)
-- File: 05_procedures.sql
-- Description: Oracle PL/SQL Stored Procedures for Business Workflows.
-- Procedures:
--   1. add_pet: Register new pet profile into shelter inventory
--   2. record_swipe: Record user swipe action and trigger deterministic match
--   3. submit_adoption_application: Convert an active match into a formal application
--   4. approve_adoption: Staff approval transaction updating decision, application, and pet
--   5. reject_adoption: Staff rejection transaction updating decision, application, and pet
-- ============================================================================

SET SERVEROUTPUT ON;

-- ----------------------------------------------------------------------------
-- Procedure 1: add_pet
-- Purpose: Adds a new pet to the shelter inventory after validating shelter and breed.
-- Parameters:
--   p_shelter_id     - ID of shelter housing the pet
--   p_breed_name     - Must exist in BREED table
--   p_pet_name       - Display name of pet
--   p_gender         - 'Male' or 'Female'
--   p_age_months     - Age in months
--   p_size           - 'Small', 'Medium', 'Large', 'Extra Large'
--   p_behaviour_desc - Temperament details
--   p_lifestyle_desc - Ideal home description
--   o_pet_id         - OUT parameter returning the new pet_id
-- ----------------------------------------------------------------------------
CREATE OR REPLACE PROCEDURE add_pet (
    p_shelter_id     IN  PET.shelter_id%TYPE,
    p_breed_name     IN  PET.breed_name%TYPE,
    p_pet_name       IN  PET.pet_name%TYPE,
    p_gender         IN  PET.gender%TYPE,
    p_age_months     IN  PET.age_months%TYPE,
    p_size           IN  PET.size%TYPE,
    p_behaviour_desc IN  PET.behaviour_desc%TYPE,
    p_lifestyle_desc IN  PET.lifestyle_desc%TYPE,
    o_pet_id         OUT PET.pet_id%TYPE
) AS
    v_shelter_exists NUMBER;
    v_breed_exists   NUMBER;
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

    -- Insert pet record
    INSERT INTO PET (
        shelter_id, breed_name, pet_name, gender,
        age_months, size, behaviour_desc, lifestyle_desc, status
    ) VALUES (
        p_shelter_id, p_breed_name, p_pet_name, p_gender,
        p_age_months, p_size, p_behaviour_desc, p_lifestyle_desc, 'Available'
    ) RETURNING pet_id INTO o_pet_id;

    COMMIT;
    DBMS_OUTPUT.PUT_LINE('Pet added successfully with ID: ' || o_pet_id);
EXCEPTION
    WHEN OTHERS THEN
        ROLLBACK;
        DBMS_OUTPUT.PUT_LINE('Error adding pet: ' || SQLERRM);
        RAISE;
END add_pet;
/

-- ----------------------------------------------------------------------------
-- Procedure 2: record_swipe
-- Purpose: Records Tinder-style swipe. For 'RIGHT' swipes on 'Available' pets,
--          evaluates match criteria and automatically creates a MATCH record.
-- Matching Rule (Academic Deterministic Model):
--   A match is automatically generated when an adopter swipes RIGHT on an
--   Available pet, provided they do not already have an active match for this pet.
-- Parameters:
--   p_adopter_id - Swiping adopter ID
--   p_pet_id     - Target pet ID
--   p_direction  - 'LEFT' (skip) or 'RIGHT' (interested)
--   o_is_match   - OUT 1 if matched, 0 otherwise
--   o_match_id   - OUT new or existing match_id
-- ----------------------------------------------------------------------------
CREATE OR REPLACE PROCEDURE record_swipe (
    p_adopter_id IN  ADOPTER.adopter_id%TYPE,
    p_pet_id     IN  PET.pet_id%TYPE,
    p_direction  IN  SWIPE.direction%TYPE,
    o_is_match   OUT NUMBER,
    o_match_id   OUT MATCH.match_id%TYPE
) AS
    v_pet_status PET.status%TYPE;
    v_existing_swipe NUMBER;
    v_existing_match NUMBER;
BEGIN
    o_is_match := 0;
    o_match_id := NULL;

    -- Ensure direction is valid
    IF p_direction NOT IN ('LEFT', 'RIGHT') THEN
        RAISE_APPLICATION_ERROR(-20003, 'Invalid swipe direction. Must be LEFT or RIGHT.');
    END IF;

    -- Check pet status
    SELECT status INTO v_pet_status FROM PET WHERE pet_id = p_pet_id;
    IF v_pet_status != 'Available' THEN
        RAISE_APPLICATION_ERROR(-20004, 'Pet is not currently available for adoption.');
    END IF;

    -- Upsert swipe record
    SELECT COUNT(*) INTO v_existing_swipe 
    FROM SWIPE 
    WHERE adopter_id = p_adopter_id AND pet_id = p_pet_id;

    IF v_existing_swipe > 0 THEN
        UPDATE SWIPE 
        SET direction = p_direction, swiped_at = CURRENT_TIMESTAMP
        WHERE adopter_id = p_adopter_id AND pet_id = p_pet_id;
    ELSE
        INSERT INTO SWIPE (adopter_id, pet_id, direction, swiped_at)
        VALUES (p_adopter_id, p_pet_id, p_direction, CURRENT_TIMESTAMP);
    END IF;

    -- Match evaluation on RIGHT swipe
    IF p_direction = 'RIGHT' THEN
        SELECT COUNT(*) INTO v_existing_match 
        FROM MATCH 
        WHERE adopter_id = p_adopter_id AND pet_id = p_pet_id;

        IF v_existing_match = 0 THEN
            INSERT INTO MATCH (adopter_id, pet_id, matched_at, status)
            VALUES (p_adopter_id, p_pet_id, CURRENT_TIMESTAMP, 'Active')
            RETURNING match_id INTO o_match_id;

            o_is_match := 1;
            DBMS_OUTPUT.PUT_LINE('Match created! Match ID: ' || o_match_id);
        ELSE
            SELECT match_id INTO o_match_id 
            FROM MATCH 
            WHERE adopter_id = p_adopter_id AND pet_id = p_pet_id;
            o_is_match := 1;
            DBMS_OUTPUT.PUT_LINE('Existing match retrieved: ' || o_match_id);
        END IF;
    END IF;

    COMMIT;
EXCEPTION
    WHEN NO_DATA_FOUND THEN
        ROLLBACK;
        RAISE_APPLICATION_ERROR(-20005, 'Pet ID ' || p_pet_id || ' not found.');
    WHEN OTHERS THEN
        ROLLBACK;
        RAISE;
END record_swipe;
/

-- ----------------------------------------------------------------------------
-- Procedure 3: submit_adoption_application
-- Purpose: Submits a formal application for a matched pet, scheduling a home visit.
-- Updates match status to 'Applied' and pet status to 'Pending'.
-- ----------------------------------------------------------------------------
CREATE OR REPLACE PROCEDURE submit_adoption_application (
    p_match_id        IN  MATCH.match_id%TYPE,
    p_home_visit_date IN  DATE,
    o_application_id  OUT ADOPTION_APPLICATION.application_id%TYPE
) AS
    v_match_status MATCH.status%TYPE;
    v_pet_id       PET.pet_id%TYPE;
    v_existing_app NUMBER;
BEGIN
    -- Verify match is active
    SELECT status, pet_id INTO v_match_status, v_pet_id 
    FROM MATCH 
    WHERE match_id = p_match_id;

    IF v_match_status NOT IN ('Active', 'Applied') THEN
        RAISE_APPLICATION_ERROR(-20006, 'Cannot apply: Match is already closed.');
    END IF;

    -- Prevent duplicate application
    SELECT COUNT(*) INTO v_existing_app 
    FROM ADOPTION_APPLICATION 
    WHERE match_id = p_match_id;

    IF v_existing_app > 0 THEN
        RAISE_APPLICATION_ERROR(-20007, 'An application already exists for this match.');
    END IF;

    -- Insert formal application
    INSERT INTO ADOPTION_APPLICATION (
        match_id, staff_id, home_visit_date, application_status, submitted_at
    ) VALUES (
        p_match_id, NULL, p_home_visit_date, 'Pending', CURRENT_TIMESTAMP
    ) RETURNING application_id INTO o_application_id;

    -- Transition match & pet statuses
    UPDATE MATCH SET status = 'Applied' WHERE match_id = p_match_id;
    UPDATE PET SET status = 'Pending' WHERE pet_id = v_pet_id;

    COMMIT;
    DBMS_OUTPUT.PUT_LINE('Application #' || o_application_id || ' submitted successfully.');
EXCEPTION
    WHEN OTHERS THEN
        ROLLBACK;
        RAISE;
END submit_adoption_application;
/

-- ----------------------------------------------------------------------------
-- Procedure 4: approve_adoption
-- Purpose: Atomically approves an adoption application by staff.
-- Actions:
--   1. Inserts approval into SHELTER_DECISION
--   2. Updates ADOPTION_APPLICATION status to 'Approved'
--   3. Updates PET status to 'Adopted'
--   4. Updates MATCH status to 'Closed'
-- ----------------------------------------------------------------------------
CREATE OR REPLACE PROCEDURE approve_adoption (
    p_application_id IN ADOPTION_APPLICATION.application_id%TYPE,
    p_staff_id       IN SHELTER_STAFF.staff_id%TYPE,
    o_decision_id    OUT SHELTER_DECISION.decision_id%TYPE
) AS
    v_match_id   MATCH.match_id%TYPE;
    v_pet_id     PET.pet_id%TYPE;
    v_adopter_id ADOPTER.adopter_id%TYPE;
    v_app_status ADOPTION_APPLICATION.application_status%TYPE;
BEGIN
    -- Retrieve application and match context
    SELECT aa.match_id, aa.application_status, m.pet_id, m.adopter_id
    INTO v_match_id, v_app_status, v_pet_id, v_adopter_id
    FROM ADOPTION_APPLICATION aa
    JOIN MATCH m ON aa.match_id = m.match_id
    WHERE aa.application_id = p_application_id;

    IF v_app_status = 'Approved' THEN
        RAISE_APPLICATION_ERROR(-20008, 'Application is already approved.');
    END IF;

    -- Record shelter decision
    INSERT INTO SHELTER_DECISION (
        pet_id, adopter_id, decision, staff_id, decided_at
    ) VALUES (
        v_pet_id, v_adopter_id, 'Approved', p_staff_id, CURRENT_TIMESTAMP
    ) RETURNING decision_id INTO o_decision_id;

    -- Update application status & assign reviewing staff
    UPDATE ADOPTION_APPLICATION 
    SET application_status = 'Approved', staff_id = p_staff_id 
    WHERE application_id = p_application_id;

    -- Mark pet as Adopted
    UPDATE PET SET status = 'Adopted' WHERE pet_id = v_pet_id;

    -- Close match
    UPDATE MATCH SET status = 'Closed' WHERE match_id = v_match_id;

    COMMIT;
    DBMS_OUTPUT.PUT_LINE('Adoption Approved! Decision ID: ' || o_decision_id);
EXCEPTION
    WHEN OTHERS THEN
        ROLLBACK;
        RAISE;
END approve_adoption;
/

-- ----------------------------------------------------------------------------
-- Procedure 5: reject_adoption
-- Purpose: Atomically records shelter rejection.
-- Actions:
--   1. Inserts rejection into SHELTER_DECISION
--   2. Updates ADOPTION_APPLICATION status to 'Rejected'
--   3. Reverts PET status to 'Available'
-- ----------------------------------------------------------------------------
CREATE OR REPLACE PROCEDURE reject_adoption (
    p_application_id IN ADOPTION_APPLICATION.application_id%TYPE,
    p_staff_id       IN SHELTER_STAFF.staff_id%TYPE,
    o_decision_id    OUT SHELTER_DECISION.decision_id%TYPE
) AS
    v_match_id   MATCH.match_id%TYPE;
    v_pet_id     PET.pet_id%TYPE;
    v_adopter_id ADOPTER.adopter_id%TYPE;
BEGIN
    -- Retrieve application and match details
    SELECT aa.match_id, m.pet_id, m.adopter_id
    INTO v_match_id, v_pet_id, v_adopter_id
    FROM ADOPTION_APPLICATION aa
    JOIN MATCH m ON aa.match_id = m.match_id
    WHERE aa.application_id = p_application_id;

    -- Record decision
    INSERT INTO SHELTER_DECISION (
        pet_id, adopter_id, decision, staff_id, decided_at
    ) VALUES (
        v_pet_id, v_adopter_id, 'Rejected', p_staff_id, CURRENT_TIMESTAMP
    ) RETURNING decision_id INTO o_decision_id;

    -- Update application status
    UPDATE ADOPTION_APPLICATION 
    SET application_status = 'Rejected', staff_id = p_staff_id 
    WHERE application_id = p_application_id;

    -- Reopen pet for adoption
    UPDATE PET SET status = 'Available' WHERE pet_id = v_pet_id;

    -- Close match
    UPDATE MATCH SET status = 'Closed' WHERE match_id = v_match_id;

    COMMIT;
    DBMS_OUTPUT.PUT_LINE('Application rejected. Decision ID: ' || o_decision_id);
EXCEPTION
    WHEN OTHERS THEN
        ROLLBACK;
        RAISE;
END reject_adoption;
/

-- ----------------------------------------------------------------------------
-- Sample Execution Block for Testing
-- ----------------------------------------------------------------------------
/*
DECLARE
    v_pet_id NUMBER;
    v_match NUMBER;
    v_match_id NUMBER;
    v_app_id NUMBER;
    v_dec_id NUMBER;
BEGIN
    -- Test add_pet
    add_pet(1, 'Beagle', 'Simba Jr.', 'Male', 6, 'Small', 'Playful', 'Apartment', v_pet_id);
    
    -- Test record_swipe (Interested)
    record_swipe(1, v_pet_id, 'RIGHT', v_match, v_match_id);
    
    -- Test submit application
    IF v_match = 1 THEN
        submit_adoption_application(v_match_id, SYSDATE + 7, v_app_id);
        -- Test approve
        approve_adoption(v_app_id, 2, v_dec_id);
    END IF;
END;
/
*/
